# 0xRafie/geosean

## Resumen

GeoSEAN es un modelo de clasificación de imágenes para geolocalización a nivel de país restringido a los 11 países de la ASEAN (Asociación de Naciones del Sudeste Asiático). Lo desarrolla Muhamad Syukron, Danish Rafie Ekaputra y Tintrim Dwi Ary Widhianingsih, y se publica bajo licencia MIT. No se trata de un modelo de lenguaje generativo, sino de un cabezal de clasificación (probe) entrenado sobre un codificador de imagen CLIP ViT-L/14 congelado.

La arquitectura es un enfoque de *linear probing* no lineal: el codificador visual de `openai/clip-vit-large-patch14` extrae embeddings de imagen de 768 dimensiones que alimentan un perceptrón multicapa (MLP) entrenado específicamente para predecir el país de origen de una fotografía. El repositorio solo publica el `state_dict` del MLP junto con las estadísticas de normalización (media y desviación típica de las características del split de entrenamiento), el orden de clases y el nombre del codificador, lo que implica que el usuario debe descargar el CLIP base por separado.

Su relevancia es acotada pero específica: cubre una tarea de geolocalización visual regional con un rendimiento declarado del 85,91 % de accuracy y macro F1 en test, un resultado notable para una sonda ligera sobre un encoder congelado. Es útil para investigadores que trabajen en geolocalización de imágenes, análisis de contenido geográfico o verificación de procedencia visual en el contexto del Sudeste Asiático.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP ViT-L/14 congelado + sonda MLP (image classification) |
| Parametros totales | No disponible (el encoder CLIP ViT-L/14 tiene ~428 M; el MLP no se especifica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de imagen; las etiquetas de clase son países de la ASEAN) |
| Licencia | MIT |
| Formato de pesos | `torch.save` (`.pt`); el encoder base en safetensors vía `openai/clip-vit-large-patch14` |

## Arquitectura y entrenamiento

El modelo sigue un esquema de *feature extraction* con encoder congelado: se toma el CLIP ViT-L/14 de OpenAI, se congelan todos sus pesos y se extraen las características de imagen. Sobre esas representaciones se entrena una sonda MLP cuyos pesos son lo único que se publica en el repositorio (`clip_vitl14_mlp_probe.pt`). El fichero incluye el `state_dict` del MLP, la media y desviación típica de las características del split de entrenamiento (para normalización en inferencia), los hiperparámetros seleccionados, el orden de clases y el nombre del encoder.

El entrenamiento se realizó sobre el dataset `0xRafie/geosean` (ASEAN Geolocation), del mismo autor. No se especifican en la información disponible el número de imágenes, la composición del dataset, la resolución de entrada ni si hubo aumentación de datos. El paper asociado (arXiv:2607.12284) se titula "GeoSEAN: Explainable Country-Level Image Geolocation for ASEAN Regions", lo que sugiere que el trabajo aborda también explicabilidad, aunque los detalles técnicos de ese componente no están reflejados en la model card.

## Capacidades

- Clasificación de imágenes en 11 clases correspondientes a los países de la ASEAN (predicción de país a partir de una fotografía).
- Geolocalización a nivel de país (no a nivel de ciudad o coordenadas).
- Reutilización de representaciones CLIP ViT-L/14, lo que hereda la robustez visual del encoder base.
- Inferencia ligera: solo se ejecuta el encoder CLIP más un MLP pequeño, sin generación autoregresiva.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No soporta generación de texto ni diálogo.
- Capacidades multilingües: no aplica (modelo puramente visual).
- Capacidad especial: el paper indica un enfoque "explainable", aunque la model card no detalla el mecanismo de explicabilidad.

## Casos de uso

- Verificación de procedencia de imágenes en medios: dado un conjunto de fotografías de una noticia, el modelo puede clasificar el país ASEAN de origen y señalar discrepancias con la ubicación declarada, útil para equipos de fact-checking.
- Análisis de contenido generado por usuarios en plataformas regionales: clasificación automática de imágenes subidas por usuarios para etiquetado geográfico a nivel de país, con un coste computacional bajo al reutilizar un encoder congelado.
- Investigación en geolocalización visual: servir como baseline reproducible (encoder CLIP + MLP) para comparar con modelos de geolocalización más complejos o con fine-tuning completo.
- Catalogación de archivos fotográficos: organización automática de fondos de imágenes por país ASEAN cuando los metadatos EXIF están ausentes o son poco fiables.
- Moderación y cumplimiento regional: detección de contenido visual asociado a una jurisdicción concreta para aplicar políticas de moderación específicas por país.
- Docencia y prototipado: ejemplo didáctico de *probing* sobre modelos fundacionales de visión, con pipeline de inferencia mínimo (`predict.py`) y pesos ligeros fáciles de desplegar.
- Análisis de datasets de imágenes: etiquetado geográfico preliminar de corpus visuales para estudios de sesgo o distribución geográfica.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de la model card:

| Metrica | Valor |
|---|---|
| Test accuracy | 85,91 |
| Macro F1 | 85,91 |

No se han publicado en la información disponible resultados comparativos con otros modelos de geolocalización (por ejemplo, GeoCLIP, PIGEON u otros), ni desglose por país, ni métricas de calibración.

## Requisitos de hardware

- VRAM estimada para inferencia: el encoder CLIP ViT-L/14 ocupa aproximadamente 1,7 GB en fp32 y en torno a 0,9 GB en fp16; el MLP es despreciable (unos pocos MB). En la práctica, menos de 2 GB de VRAM en fp32.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM. Funciona en RTX 3060, RTX 4060, RTX 4090, A100 o H100 sin problemas; las GPU de gama alta solo aportan más throughput.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: PyTorch nativo (el repositorio incluye `predict.py`), exportación a ONNX o TorchScript para servir con ONNX Runtime o Triton. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada. Al tratarse de un ViT-L/14 congelado más un MLP, la latencia vendrá dominada por el forward del encoder visual.

## Comparativa con modelos similares

| Modelo | Tipo | Cobertura geográfica | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GeoSEAN | CLIP ViT-L/14 + MLP | 11 países ASEAN | Encoder ~428 M + MLP no especificado | MIT | Hugging Face + GitHub |
| GeoCLIP | CLIP + red de localización | Global (coordenadas) | No disponible | No disponible | No disponible |
| PIGEON | Modelo de geolocalización | Global | No disponible | No disponible | No disponible |
| CLIP ViT-L/14 (base) | Vision-language zero-shot | Global (sin clases de país específicas) | ~428 M | MIT | Hugging Face |

No se dispone en la información proporcionada de métricas comparables de GeoCLIP o PIGEON sobre el mismo dataset, por lo que la comparación de rendimiento no está disponible.

## Limitaciones y advertencias

- Alcance geográfico restringido: solo clasifica entre los 11 países de la ASEAN; una imagen de fuera de esa región será forzada a una de las clases, generando predicciones incorrectas sin señal de rechazo.
- Granularidad limitada: no proporciona coordenadas ni nivel de ciudad, solo país.
- Riesgo de sesgo: el rendimiento depende de la distribución del dataset `0xRafie/geosean`, cuyos detalles de composición no se publican; países con menos imágenes o menor diversidad visual pueden tener peor accuracy.
- Riesgo de alucinación en sentido amplio: el modelo siempre emite una clase, incluso ante imágenes ambiguas, sintéticas o generadas por IA.
- Dependencia del encoder base: requiere descargar `openai/clip-vit-large-patch14` por separado; el repositorio no incluye los pesos del encoder.
- Reproducibilidad: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo es de 0,0 GB, lo que sugiere que los pesos pueden no estar efectivamente alojados o son de tamaño mínimo.
- Licencia MIT: permite uso comercial, pero conviene verificar la licencia del encoder CLIP base y del dataset utilizado.
- Sin datos de benchmarks comparativos ni evaluación externa independiente.
- Fecha de creación futura (2026-11-21) en los metadatos de Hugging Face, lo que puede indicar inconsistencias en el registro del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0xRafie/geosean
- Dataset: https://huggingface.co/datasets/0xRafie/geosean
- Paper: https://arxiv.org/abs/2607.12284
- Código: https://github.com/0xRafie/geosean
- Modelo base: https://huggingface.co/openai/clip-vit-large-patch14
