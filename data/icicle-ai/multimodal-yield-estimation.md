# ICICLE-AI/multimodal-yield-estimation

## Resumen

Multimodal Yield Estimation es un modelo de regresión tabular desarrollado por ICICLE-AI (Intelligent Cyberinfrastructure with Computational Learning in the Environment, instituto financiado por la NSF) que estima el rendimiento de parcelas de maíz en bushels por acre a partir de dos fuentes de datos: captions semanales en texto que describen condiciones meteorológicas, químicas y topográficas de la parcela, e imágenes RGB de dron (UAS) de la misma parcela. El modelo combina embeddings de texto de Qwen3-Embedding-0.6B (1024 dimensiones) con embeddings de imagen de DINOv3 ViT-B/16 (768 dimensiones) y produce una predicción escalar de rendimiento.

La relevancia del modelo reside en su capacidad de generar estimaciones en cualquier punto de la temporada de cultivo, desde la semana 1 hasta la semana 22 tras la siembra, lo que permite monitorización temprana y toma de decisiones agronómicas antes de la cosecha. Se entrenó y evaluó con cortes temporales en las semanas 4, 8, 12, 16, 20 y 22, lo que facilita evaluar el compromiso entre precocidad de la predicción y precisión.

El checkpoint publicado es ligero (198.161 parámetros en los pesos safetensors del cabezal de regresión), ya que la mayor parte de la capacidad reside en los modelos base congelados de Qwen3 y DINOv3 que se ejecutan en tiempo de inferencia. La licencia es MIT y el modelo se distribuye con código de inferencia y entrenamiento en el repositorio de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezal de regresión sobre embeddings multimodales congelados (Qwen3-Embedding-0.6B para texto, DINOv3 ViT-B/16 para imagen) |
| Parametros totales | 198.161 (pesos safetensors del checkpoint; los modelos base se cargan aparte) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa hasta 22 captions semanales y un número variable de imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors, con custom_code (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo no es un transformer generativo, sino un regresor multimodal que combina representaciones densas de dos backbones congelados. Cada caption semanal se procesa con Qwen3-Embedding-0.6B para obtener un vector de 1024 dimensiones, y cada tile RGB de dron se procesa con DINOv3 ViT-B/16 (pretrain lvd1689m) para obtener un vector de 768 dimensiones. El checkpoint publicado contiene únicamente el cabezal de regresión (198.161 parámetros) que fusiona estas representaciones y predice el rendimiento en bu/acre. La inferencia requiere ejecutar ambos backbones, por lo que el coste computacional real es el de Qwen3-0.6B más DINOv3 ViT-B/16.

El entrenamiento se realizó sobre datos de parcelas de maíz con captions semanales que resumen 11 variables meteorológicas de Daymet (longitud del día, precipitación, radiación solar, temperaturas máxima, mínima y media, presión de vapor, acumulación de GDD y medias de precipitación a 3, 7 y 14 días), 23 variables de suelo (pH, materia orgánica, CEC, nutrientes, textura, densidad aparente, capacidad de agua disponible, entre otras), topografía (elevación y pendiente) y un proxy de humedad del suelo pre-siembra. El modelo se evalúa con cortes temporales en las semanas 4, 8, 12, 16, 20 y 22, lo que permite cuantificar la mejora de la predicción a medida que avanza la temporada. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Regresión de rendimiento de maíz a nivel de parcela en bushels por acre.
- Predicción en cualquier semana entre la 1 y la 22 tras la siembra, con cortes evaluados en las semanas 4, 8, 12, 16, 20 y 22.
- Fusión multimodal de texto (captions semanales) e imagen (tiles RGB de dron en formato `.tif`).
- Inferencia solo con texto si no se dispone de imágenes (lista `images` vacía o ausente).
- Procesamiento de series temporales multi-semanales con hasta 22 captions por parcela.
- Inferencia por lotes mediante archivos JSONL.
- Integración con el ecosistema Transformers mediante `trust_remote_code=True`.
- No soporta tool calling, function calling, agentes, visión general, audio ni modos de razonamiento explícito.

## Casos de uso

- Monitorización temprana de rendimiento en campaña: con un corte en la semana 8 o 12, el modelo permite estimar el rendimiento potencial antes de la cosecha y ajustar decisiones de fertilización o riego con antelación.
- Agricultura de precisión a nivel de parcela: integrado en plataformas de gestión agronómica, permite generar mapas de rendimiento estimado por parcela combinando captions meteorológicas y tiles de dron.
- Validación de experimentos agronómicos: en ensayos con múltiples tratamientos, el modelo puede predecir el rendimiento de cada parcela a partir de sus captions semanales y su imagen UAS, reduciendo la necesidad de cosecha manual.
- Seguros agrarios y evaluación de riesgos: estimaciones tempranas de rendimiento para calibrar primas o detectar parcelas con desviaciones significativas respecto a lo esperado.
- Investigación en agricultura digital: el repositorio incluye código de entrenamiento e inferencia, lo que facilita reentrenar o adaptar el cabezal a otros cultivos o regiones con datos propios.
- Predicción solo con texto: en escenarios sin cobertura de dron, el modelo puede ejecutarse únicamente con captions semanales, lo que simplifica el despliegue en explotaciones sin acceso a imágenes UAS.
- Análisis retrospectivo de campañas: procesando datos históricos de captions e imágenes, el modelo permite reconstruir estimaciones de rendimiento en semanas intermedias para estudios comparativos entre años.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al ejecutar Qwen3-Embedding-0.6B y DINOv3 ViT-B/16, se estima un consumo moderado, aunque el autor no publica cifras.
- GPU recomendadas: el autor recomienda una GPU; en CPU la inferencia tarda varios minutos por muestra.
- Cabe en GPU de consumo: no se especifica, pero por el tamaño de los backbones (0.6B y ViT-B/16) es probable que quepa en GPUs de consumo con suficiente VRAM; no confirmado por el autor.
- Opciones de despliegue: scripts de inferencia incluidos en el repositorio (`scripts/inference_single_hf.py`), con dependencias torch 2.12.1, transformers 5.13.0, sentence-transformers 5.7.0 y safetensors 0.8.0. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor indica que en CPU la inferencia tarda varios minutos por muestra.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada. Se trata de un modelo especializado en regresión de rendimiento agrícola multimodal, una categoría con pocos modelos públicos comparables directamente.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ICICLE-AI/multimodal-yield-estimation | 198.161 (cabezal) | no disponible | Regresión de rendimiento de maíz multimodal | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está entrenado específicamente para maíz y para el formato de captions semanales descrito; su uso con otros cultivos o con captions generados de forma distinta puede degradar la precisión.
- Requiere ejecutar Qwen3-Embedding-0.6B y DINOv3 ViT-B/16 en tiempo de inferencia, lo que incrementa el coste computacional y la latencia frente a un modelo puramente tabular.
- La inferencia en CPU tarda varios minutos por muestra, lo que limita su uso en producción sin GPU.
- El checkpoint publicado contiene solo 198.161 parámetros; la mayor parte de la capacidad reside en los backbones congelados, por lo que el modelo no es autónomo sin acceso a Qwen3 y DINOv3.
- No se han publicado resultados de benchmarks en la información disponible, por lo que no es posible comparar su precisión con alternativas de forma objetiva.
- No se especifican los idiomas soportados para los captions; el formato de entrada está en inglés según los ejemplos del repositorio.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de predicciones sesgadas si los datos de entrenamiento no cubren las condiciones de la parcela objetivo.
- La licencia MIT permite uso comercial, pero el modelo base Qwen3-Embedding-0.6B y DINOv3 tienen sus propias licencias que deben verificarse por separado.
- El repositorio no incluye las imágenes UAS de ejemplo, solo captions reales y rutas de marcador de posición, lo que puede dificultar la reproducción exacta de los resultados.
- El contacto para soporte es Sarikaa Sridhar (sridhar.86@osu.edu); no se indica un proceso formal de reporte de issues más allá de ese contacto.

## Enlaces

- [Hugging Face: ICICLE-AI/multimodal-yield-estimation](https://huggingface.co/ICICLE-AI/multimodal-yield-estimation)
- [Qwen/Qwen3-Embedding-0.6B](https://huggingface.co/Qwen/Qwen3-Embedding-0.6B)
- [facebook/dinov3-vitb16-pretrain-lvd1689m](https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m)
- [Daymet](https://daymet.ornl.gov/)
- [Hugging Face custom models](https://huggingface.co/docs/transformers/custom_models)
- [Licencia MIT del repositorio](https://huggingface.co/ICICLE-AI/multimodal-yield-estimation/blob/main/LICENSE)
