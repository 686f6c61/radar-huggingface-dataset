# Nurymanau/d1-omni-600M-MLX-fp16

## Resumen

d1-omni-600M-MLX-fp16 es un port no oficial a MLX del modelo de decisión `LiquidAI/d1-omni-600M`, publicado por el desarrollador Dzmitry Nurymanau (usuario de Hugging Face `Nurymanau`). No es un modelo nuevo: reutiliza exactamente los pesos entrenados por Liquid AI fijados al commit `02b55d7076f15129e59ab3f94783f32c4b088674`, sin reentrenamiento, y los reempaqueta en formato safetensors con precisión FP16 para su ejecución nativa en Apple Silicon mediante el framework MLX. Cuenta con 587.161.089 parámetros (aproximadamente 600 millones) y un repositorio de 1,2 GB.

El modelo original pertenece a la familia d1 de Liquid AI, una línea de "modelos de decisión" que responden preguntas tipadas (elección entre opciones, probabilidad de "sí" y puntuación) sobre un estado de entrada en una sola pasada forward, sin generar ni un solo token de salida. En lugar de producir texto autoregresivo, lee directamente la distribución del modelo sobre las opciones disponibles. Es multimodal: acepta texto o JSON, texto más imágenes, o texto más audio mono a 16 kHz, y devuelve respuestas estructuradas. No es un chatbot.

La relevancia de este port concreto es de infraestructura: elimina por completo la dependencia de PyTorch, Transformers o ejecución de código remoto durante la inferencia, y permite correr todo el pipeline neural (encoder LFM2 bidireccional, cabeza de decisión, SigLIP2 con proyector y FastConformer con adaptador) íntegramente en MLX sobre Macs con Apple Silicon. Incluye un informe de validación que compara el port contra el modelo Torch FP32 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder LFM2 bidireccional (tipo transformer) con cabeza de decisión; componentes multimodales SigLIP2 + proyector (visión) y FastConformer + adaptador (audio) |
| Parametros totales | 587.161.089 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 posiciones (límite completo del modelo original; el port acota el batch a 4.096 tokens con padding por defecto, permitiendo secuencias individuales más largas) |
| Tipos de cuantizacion | No disponible en este repo (solo FP16; el autor no reclama versiones de 4 bits ni 8 bits). Existe una versión GGUF separada en `LiquidAI/d1-omni-600M-GGUF` |
| Idiomas soportados | No disponible (la comprensión de audio se entrenó con peticiones en inglés) |
| Licencia | LFM Open License v1.0 (`lfm1.0`, etiquetada como `other`); el port no modifica la licencia original |
| Formato de pesos | safetensors (FP16), librería MLX |

## Arquitectura y entrenamiento

El modelo es un sistema de decisión multimodal compuesto por varios módulos neurales que se ejecutan secuencialmente en una única pasada. El núcleo es un encoder LFM2 bidireccional (la familia de arquitecturas Liquid Foundation Models) seguido de una cabeza de decisión que proyecta el estado codificado sobre las opciones de una pregunta tipada. Para entradas visuales incorpora un encoder SigLIP2 con un proyector, y para audio un encoder FastConformer con un adaptador; las imágenes grandes se dividen en tiles siguiendo el comportamiento del modelo original. El port mantiene el preprocesamiento numérico del Torch ARM CPU original, incluido el redimensionado antialias con uint8 y la normalización de silencios, usando NumPy, Pillow y SciPy.

No se describe entrenamiento adicional en la información disponible: este repositorio es un port de inferencia fijado a un commit concreto de los pesos de Liquid AI (`base_model: LiquidAI/d1-omni-600M`, etiqueta `base_model:finetune`). Los pesos de referencia en FP32 ocupan unos 2,35 GB y en FP16 unos 1,17 GB; el autor indica que BF16 no está recomendado por los autores del modelo original y no se incluyen pesos cuantizados. La innovación técnica del port es la reimplementación completa del grafo de inferencia en MLX (encoder LFM2 bidireccional, cabeza de decisión, SigLIP2 + proyector, FastConformer + adaptador) con preprocesamiento en NumPy, sin PyTorch, Transformers ni ejecución de código remoto. El modelo base responde a preguntas de tipo `choice`, `noul` (probabilidad de "sí") y `score` con cero tokens generados.

## Capacidades

- Decisión entre opciones (`choice`): asigna un estado a una de varias categorías nombradas, devolviendo el nombre original de la opción.
- Probabilidad de "sí" (`noul`, P(yes)): estima la probabilidad de que una condición se cumpla sobre el estado.
- Puntuación (`score`): asigna una puntuación tipada a un estado dado.
- Comprensión de texto y JSON como estado de entrada.
- Comprensión de imágenes: acepta una o varias imágenes PIL, con tiling de imágenes grandes.
- Comprensión de audio: ondas mono a 16.000 Hz (float o PCM int16); clips menores de 0,5 s se rellenan y los mayores de 30 s se truncan.
- Respuestas estructuradas sin generación de tokens (cero tokens de salida).
- API por lotes: `system_one_batch`, `probabilities` y `probabilities_batch` para procesar varios estados y preguntas.
- Calibración de temperatura de texto y formatos de prompt específicos por modalidad preservados del original.
- No soporta combinar imágenes y audio en una misma petición.
- No es un chatbot: no mantiene conversación ni genera texto libre.

## Casos de uso

- Triaje de tickets de soporte: clasificar automáticamente una reclamación entrante (por ejemplo, "me han cobrado dos veces") en un equipo concreto (facturación, técnico, fraude) mediante una pregunta `choice`. Es adecuado porque devuelve la etiqueta directamente en una sola pasada, sin coste de generación.
- Moderación de contenido: usar la pregunta `noul` para estimar la probabilidad de que un texto o una imagen viole una política, obteniendo un valor continuo que se puede umbralizar en un pipeline.
- Enrutamiento de consultas en atención al cliente: asignar cada mensaje al flujo o al agente correcto a partir de criterios definidos, aprovechando la ausencia de tokens generados para reducir latencia y coste.
- Clasificación de imágenes en el borde: etiquetar fotografías o capturas en una Mac con Apple Silicon usando el módulo SigLIP2, por ejemplo para separar tipos de documentos o detectar categorías visuales.
- Análisis de audio corto: transcribir decisiones sobre fragmentos de voz en inglés de hasta 30 segundos a 16 kHz, por ejemplo para clasificar la intención de una locución o etiquetar una llamada.
- Evaluación automática de calidad: emplear `score` para puntuar respuestas, resúmenes o resultados de modelos generativos dentro de un pipeline de evaluación.
- Validación de formularios y JSON: dado un estado en JSON, decidir si cumple un conjunto de criterios tipados (campos válidos, coherencia, riesgo), útil en sistemas de admisión o de compliance.
- Desarrollo local en Apple Silicon sin dependencias pesadas: prototipar clasificadores multimodales en un Mac sin instalar PyTorch ni ejecutar código remoto, gracias al runtime MLX incluido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión en la información disponible. La página de BenchLM.ai del modelo original menciona seis filas de benchmarks mostrables pero sin puntuación global pública, y no se han facilitado los valores numéricos. Los únicos datos cuantitativos disponibles corresponden al informe de validación de paridad de este port frente al modelo Torch FP32 original:

| Prueba | Resultado |
|---|---|
| Decisiones verificadas (suite completa, incluidos lotes repetidos) | 79 coincidencias con el original |
| Suite core | 18 casos / 44 preguntas |
| Suite extendida | 7 casos / 19 preguntas |
| Preguntas adicionales con padding en lote | 9 (core) + 7 (lote mixto multimodal) |
| Error máximo de probabilidad, FP32 | 0,0000294 |
| Error máximo de probabilidad, FP16 | 0,00935212 (0,936 puntos porcentuales) |
| Inversiones de argmax | 0 |

El autor advierte explícitamente que se trata de una suite de humo y paridad, no de un benchmark de precisión ni una prueba de comportamiento idéntico en cualquier entrada.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon (MLX). No hay soporte CUDA ni ejecución en GPU NVIDIA con este repositorio.
- Peso de los pesos: aproximadamente 1,17 GB en FP16; la referencia FP32 ocupa unos 2,35 GB.
- Memoria: el límite completo de 16.384 posiciones y los lotes grandes de imágenes pueden requerir más memoria que la reservada por defecto; el autor indica que el límite de 16.384 posiciones no es una garantía de memoria en Mac.
- Batch por defecto: acotado a 4.096 tokens con padding, aunque se admiten secuencias individuales más largas.
- Entorno probado: Python 3.12 y macOS (probado en macOS 26.6.2) con runtime MLX compatible.
- Despliegue: ejecución mediante el paquete `d1_omni_mlx` incluido en el repositorio (`python -m d1_omni_mlx --model . --request request.json`), o uso programático con la clase `D1Omni`. `mlx_lm.generate` no es su API.
- GPU recomendadas: no disponible; al ser MLX, el hardware objetivo son los chips de Apple (familias M). No se especifican modelos concretos.
- Latencia y throughput: no disponibles en la información proporcionada (el port no publica cifras de latencia; para el modelo de decisión de 3B de la misma familia se ha reportado respuesta en una sola pasada, pero no se dispone de cifras verificables de este port).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Nurymanau/d1-omni-600M-MLX-fp16 | 587 M | 16.384 posiciones | safetensors FP16 / MLX | LFM Open License v1.0 | Port no oficial, solo Apple Silicon, sin PyTorch |
| LiquidAI/d1-omni-600M | ~600 M | 16.384 posiciones | Pesos originales (PyTorch) | LFM Open License v1.0 | Modelo base oficial del que deriva el port |
| LiquidAI/d1-omni-600M-GGUF | ~600 M | 16.384 posiciones | GGUF | LFM Open License v1.0 | Versión cuantizada oficial para llama.cpp y similares |
| LiquidAI/d1-3B | ~3.000 M | No disponible | No disponible | LFM Open License v1.0 | Hermano mayor de la familia d1, también modelo de decisión de cero tokens |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un chatbot: no genera texto libre, no mantiene conversaciones multi-turno y solo responde preguntas tipadas (`choice`, `noul`, `score`).
- No permite combinar imágenes y audio en una misma petición.
- El audio se entrenó con peticiones en inglés; no hay garantía de comprensión de audio en otros idiomas.
- La longitud de audio está acotada: se truncan los clips de más de 30 s y se rellenan los de menos de 0,5 s.
- El límite de contexto de 16.384 posiciones no garantiza funcionamiento en cualquier Mac; contextos muy largos y lotes grandes de imágenes pueden agotar la memoria.
- El port no publica benchmarks de precisión; el informe de validación es una suite de paridad (79 decisiones) y no demuestra comportamiento idéntico en todas las entradas.
- FP16 es un casteo con pérdida: el error máximo medido de probabilidad frente a FP32 fue de 0,00935212 (0,936 puntos porcentuales). No se recomienda BF16 según los autores originales, y no hay pesos cuantizados en este repositorio.
- Riesgo de alucinación: no evaluado en la información disponible; al leerse la decisión directamente de la distribución, los errores se manifiestan como clasificaciones o probabilidades incorrectas, no como texto inventado.
- Sesgos: no se documentan sesgos específicos en la información proporcionada.
- Licencia: LFM Open License v1.0, una licencia personalizada (etiquetada como `other`). Es imprescindible revisar `LICENSE` y `NOTICE` antes de cualquier uso comercial; no se detallan aquí sus términos.
- Dependencia de un runtime concreto: requiere el paquete `d1_omni_mlx` incluido; no funciona con `mlx_lm.generate`. El preprocesamiento replica el redondeo del Torch ARM CPU original y otros backends Torch pueden diferir ligeramente.
- El port no está respaldado ni por Liquid AI ni por Apple.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nurymanau/d1-omni-600M-MLX-fp16
- Código fuente y desarrollo del port: https://github.com/Obscyra-app/d1-omni-mlx
- Modelo base: https://huggingface.co/LiquidAI/d1-omni-600M
- Versión GGUF oficial: https://huggingface.co/LiquidAI/d1-omni-600M-GGUF
- Benchmarks y especificaciones (BenchLM.ai): https://benchlm.ai/models/d1-omni-600m
- Anuncio de los modelos de decisión d1-3B y d1-omni-600M: https://korshunov.ai/en/article/32418-liquidai-releases-d1-3b-and-d1-omni-600m-decision-models-with-zero-output-tokens/
- Análisis de los modelos de decisión de Liquid AI (latencia y ejecución): https://www.explainx.ai/blog/liquid-ai-open-d1-3b-omni-600m-open-weight-decision-models-edge-2026
- Perfil del autor en Hugging Face: https://huggingface.co/Nurymanau/models
