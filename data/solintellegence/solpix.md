# solintellegence/SolPix

## Resumen

SolPix es un modelo de generación de imágenes texto-a-imagen en espacio latente desarrollado por SolIntelligence (Sol Labs). Se trata de un transformer de flujo (flow matching) de aproximadamente 49 millones de parámetros que predice el campo de velocidad en el espacio latente del autoencoder SANA 1.1 DC-AE F32C32 (32 canales, compresión espacial 32x, rejilla de 16x16 para imágenes de 512x512). No genera píxeles RGB directamente: produce latentes que deben decodificarse con el DC-AE correspondiente, una dependencia externa que no se distribuye en el repositorio.

El condicionamiento textual se realiza con estados congelados de `google/flan-t5-base` (768 características, hasta 96 tokens). El generador es un transformer conjunto texto/imagen de 15 bloques, 512 de ancho, 8 cabezas de atención de 64 dimensiones, MLP SwiGLU de 1.152 de ancho, siete conexiones de salto largas, normalización adaptativa compartida y mezclado local depthwise 3x3. El objetivo de entrenamiento es rectified flow matching con distribución temporal logit-normal, integrado con Euler desde t=1 hasta t=0 y guiado por clasificador libre (CFG).

Su relevancia actual es acotada y de carácter investigador: los pesos publicados corresponden a un checkpoint intermedio de EMA en el paso de optimizador 210.000 de un calendario configurado de 5.000.000 de pasos, interrumpido antes de finalizar. El propio autor lo etiqueta como `research-checkpoint` y advierte que no hay ninguna evaluación formal de calidad ni de seguimiento de instrucciones. Su interés está en el estudio de modelos latentes compactos y en la experimentación con recetas de flow matching de bajo coste computacional, no en su uso como generador de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer U-shaped conjunto texto/imagen (`solpix.SolPixTransformer2D`); 15 bloques, 512 de ancho, 8 cabezas de atención de 64 dimensiones, MLP SwiGLU de 1.152, 7 conexiones de salto largas, normalización adaptativa compartida y mezclado local depthwise 3x3 |
| Parámetros totales | Aproximadamente 49 M (solo el generador; excluye encoder de texto y decodificador) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 96 tokens de texto (estados de Flan-T5 Base de 768 características); latente de imagen de 16x16 para 512x512 |
| Tipos de cuantización | No disponibles. El repositorio publica pesos EMA y crudos en el checkpoint PyTorch BF16/FP32; no hay versiones cuantizadas publicadas |
| Idiomas soportados | No disponibles. El condicionamiento usa `google/flan-t5-base` y captions de origen mayoritariamente en inglés |
| Licencia | No disponible. La model card indica que las etiquetas de licencia de las fuentes del dataset (CC BY 4.0, Apache 2.0, Google permissive, MIT) describen registros del dataset y no establecen una licencia para los pesos |
| Formato de pesos | PyTorch `.pt` (`step_00210000.pt`, checkpoint completo con pesos EMA, pesos crudos, estado del optimizador, configuración y argumentos de entrenamiento). No hay safetensors ni GGUF |
| Objetivo de entrenamiento | Rectified flow matching con muestreo temporal logit-normal |
| Espacio latente | 32 canales, compresión espacial 32x (SANA 1.1 DC-AE F32C32) |
| Encoder de texto | `google/flan-t5-base` congelado (768 características, hasta 96 tokens) |
| Decodificador | `diffusers.AutoencoderDC` (SANA 1.1 DC-AE F32C32) congelado, dependencia externa no incluida |
| Estado del checkpoint | EMA en el paso de optimizador 210.000 de un calendario de 5.000.000; ejecución interrumpida |
| Tamaño del repositorio | 0,8 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-26 |

## Arquitectura y entrenamiento

El generador es un transformer de difusión/flujo en espacio latente con topología en U. Procesa conjuntamente los estados de texto (96 tokens, 768 dimensiones) y los latentes ruidosos del autoencoder, aplicando siete conexiones de salto largas entre bloques. La normalización adaptativa está compartida y el mezclado local se realiza con convoluciones depthwise 3x3, un patrón habitual en transformers de imagen eficientes para capturar estructura espacial con poco coste. La convención de muestreo sigue el entrenamiento: `x_t = (1 - t) x_clean + t noise`, integrando de t=1 a t=0 con Euler y guiado por clasificador libre (los ejemplos del autor usan 40 pasos y escala de guía 3,5).

El entrenamiento se realizó sobre un split curado del dataset MONET v1.2.0 con semilla determinista `20260924`, compuesto por 174.603 ejemplos de entrenamiento y una retención de validación de 9.300 ejemplos. Las categorías de origen fueron CC12M, CommonCatalog-CC-BY, COYO, Diffusion-Aesthetic-4K, LAION y captions sintéticos de Flux Klein, Flux Schnell y Z-Image. La curación aplicó filtros de resolución, estética, NSFW, marcas de agua y casi duplicados. Se usaron latentes SANA F32C32 precalculados y captions codificados con Flan-T5 Base; las imágenes y los shards del dataset no se redistribuyen. La continuación del entrenamiento en Windows usó BF16, batch de 4 por dispositivo, acumulación de gradiente de 16 y una única RTX 3080 Ti. No se documenta uso de RLHF o DPO, ni innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de imágenes texto-a-imagen a 512x512 mediante muestreo en espacio latente y decodificación con el DC-AE de SANA 1.1.
- Predicción de velocidad latente (flow matching) condicionada por texto, integrable con distintos samplers y configuraciones de guía.
- Condicionamiento textual con estados precalculados de Flan-T5 Base, lo que permite reutilizar codificaciones sin recalcular el encoder.
- Entrenamiento y ajuste fino: el repositorio incluye `train.py`, `sample_latents.py` y los componentes de datos y entrenamiento.
- Exportación de latentes mediante `sample_latents.py` para pipelines que decodifiquen por separado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el condicionamiento está limitado por el encoder congelado y por captions mayoritariamente en inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación en flow matching latente: el modelo es un banco de pruebas de 49 M de parámetros para comparar objetivos de rectified flow, distribuciones temporales (logit-normal) y convenciones de muestreo sin el coste de un modelo de miles de millones de parámetros.
- Ablaciones de arquitectura en transformers U-shaped: su combinación de saltos largos, normalización adaptativa compartida y mezclado depthwise 3x3 permite aislar el efecto de cada componente con presupuesto de una sola GPU.
- Docencia y formación: cabe en cualquier GPU de consumo y se puede entrenar o muestrear de extremo a extremo en una sesión, lo que lo hace útil para explicar la cadena completa texto -> latente -> imagen.
- Generación de borradores o placeholders en pipelines internos: produce imágenes de baja fidelidad que pueden servir como previsualización rápida antes de un modelo mayor, siempre con revisión humana y sin uso publicable.
- Experimentos de destilación y reducción de pasos: al ser un modelo pequeño, es un candidato razonable para probar destilación de trayectorias de flujo o reducción del número de pasos de Euler.
- Pruebas de integración con autoencoders: sirve para validar sustituciones o revisiones del DC-AE F32C32, ya que `AutoencoderDCSol` encapsula el decodificador externo y permite intercambiar la revisión fijada.
- Estudio de sesgos y curación de datasets: el pipeline reproducible (semilla y resumen de curación documentados) permite analizar cómo los filtros de estética, NSFW y duplicados afectan a lo que el modelo aprende.
- Prototipado en entornos con recursos muy limitados: el generador ocupa del orden de 98 MB en BF16, lo que abre la puerta a pruebas en hardware modesto, asumiendo que el encoder de texto y el decodificador dominan el consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se completó ninguna evaluación de validación final y que no se reclama ninguna métrica de calidad para este checkpoint incompleto. La búsqueda web realizada no devolvió fuentes relevantes sobre el modelo (los resultados obtenidos correspondían a páginas de estadísticas de Fortnite, sin relación con SolPix).

## Requisitos de hardware

- VRAM estimada para el generador: aproximadamente 98 MB en BF16 y 196 MB en FP32. Es una fracción mínima del total del pipeline.
- VRAM estimada del pipeline completo a 512x512: del orden de 2 a 3 GB en BF16, sumando el encoder Flan-T5 Base, el generador y el decodificador DC-AE. Es una estimación propia: la información disponible no especifica el tamaño del decodificador DC-AE ni mide el consumo real.
- GPU recomendadas: cualquier GPU moderna con 6 GB o más (RTX 3060, RTX 4060, RTX 4070, T4, L4). El entrenamiento documentado se realizó con una única RTX 3080 Ti.
- Cabe en GPU de consumo: sí, con margen amplio, incluso en tarjetas de gama media y en iGPU con memoria unificada suficiente.
- CPU: el autor indica que la inferencia en CPU es posible pero lenta; no se proporcionan cifras.
- Opciones de despliegue: el repositorio ofrece `generate.py` (prompt a imagen con descarga del checkpoint, codificación con Flan-T5, muestreo Euler con CFG y decodificación con la revisión fijada del DC-AE) y `sample_latents.py`. No hay integración publicada con vLLM, TGI, Ollama o llama.cpp; tampoco hay pesos GGUF ni safetensors, por lo que estos servidores no son aplicables directamente.
- Latencia y throughput: no disponibles. El autor solo señala que la inferencia en CPU es lenta. La configuración por defecto del ejemplo usa 40 pasos y escala de guía 3,5 sobre una rejilla latente de 16x16.

## Comparativa con modelos similares

Los valores de los modelos alternativos proceden de información pública de cada proyecto y deben verificarse en sus repositorios respectivos. No hay datos de benchmarks de SolPix, por lo que la comparación es estructural y de licencia, no de calidad.

| Modelo | Parámetros | Compresión latente | Encoder de texto | Licencia | Estado |
|---|---|---|---|---|---|
| SolPix | ~49 M (solo generador) | 32x (SANA 1.1 DC-AE F32C32) | Flan-T5 Base congelado (768, 96 tokens) | No disponible | Checkpoint intermedio de investigación |
| SANA-0.6B | ~0,6 B | 32x (DC-AE) | T5 | Licencia propia de NVIDIA (consultar versión) | Modelo publicado y evaluado |
| PixArt-Alpha | ~0,6 B | 8x (VAE de SD) | Flan-T5-XXL | Licencia propia del proyecto (consultar) | Modelo publicado y evaluado |
| SD-Turbo | ~0,9 B | 8x (VAE de SD 2.1) | CLIP ViT-L y OpenCLIP | Licencia de Stability AI (consultar) | Modelo destilado publicado |

Diferencias clave: SolPix es uno o dos órdenes de magnitud más pequeño que cualquiera de las alternativas, comparte con SANA la compresión latente 32x y con PixArt-Alpha el uso de la familia Flan-T5 como encoder de texto. Frente a ellos, carece de evaluación publicada, de licencia definida y de un calendario de entrenamiento completado.

## Limitaciones y advertencias

- Checkpoint incompleto: son pesos de un paso intermedio (210.000 de 5.000.000). El seguimiento de instrucciones y la calidad visual no están establecidos por ninguna evaluación formal.
- Capacidad reducida: con ~49 M de parámetros y entrenamiento parcial, son esperables composiciones débiles, artefactos y un renderizado pobre de detalles finos y de texto en la imagen.
- Alucinación y fidelidad al prompt: no hay métricas de alineación prompt-imagen; el modelo puede ignorar o malinterpretar partes de la instrucción.
- Ausencia de filtro de seguridad: no incorpora clasificador de contenido ni filtro integrado. Cualquier despliegue debe añadir moderación externa.
- Sesgos del dataset: la curación aplicada no elimina todos los sesgos, errores o asociaciones no deseadas presentes en captions e imágenes de origen.
- Idiomas: no hay información sobre cobertura lingüística; el condicionamiento depende de Flan-T5 Base y de captions mayoritariamente en inglés, por lo que el comportamiento en castellano es incierto.
- Licencia: no disponible. Las etiquetas de licencia de las fuentes del dataset no constituyen una licencia de los pesos. No hay base clara para uso comercial y conviene contactar con el autor antes de cualquier uso en producción.
- Dependencias externas con licencia propia: el encoder `google/flan-t5-base` y el decodificador SANA 1.1 DC-AE no se incluyen en el repositorio y se rigen por sus propios términos.
- Formato: solo hay un checkpoint PyTorch `.pt` con estado del optimizador. No hay safetensors, GGUF ni versiones cuantizadas, lo que complica la integración con servidores de inferencia estándar.
- Sin garantías de reproducibilidad total: la model card documenta semilla y receta, pero las imágenes y los shards del dataset no se redistribuyen.
- Producción: el propio autor indica que las imágenes generadas requieren revisión humana antes de su publicación o de cualquier uso con consecuencias.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/solintellegence/SolPix
- Dataset de entrenamiento MONET v1.2.0: https://huggingface.co/datasets/jasperai/monet
- Encoder de texto `google/flan-t5-base`: https://huggingface.co/google/flan-t5-base
- Autoencoder DC de Diffusers (`AutoencoderDC`, SANA DC-AE): https://huggingface.co/docs/diffusers/api/models/autoencoder_dc
- Paper, blog, repositorio de código independiente o demo: no disponibles en la información proporcionada. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo.
