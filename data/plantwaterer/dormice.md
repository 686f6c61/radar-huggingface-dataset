# plantwaterer/dormice

## Resumen

dormice es un ajuste fino del modelo Qwen/Qwen3.8-27B, desarrollado por el usuario plantwaterer, especializado en responder preguntas de opción múltiple sobre imágenes devolviendo una probabilidad para cada opción. No es un modelo generativo al uso: en lugar de decodificar texto, utiliza una cabeza lineal de 26 salidas que lee el estado oculto del último token del prompt y emite directamente la distribución de probabilidad sobre las letras de las opciones (A-L). El repositorio no contiene los pesos completos del modelo base, sino una actualización de bajo rango (1,4 GB) más la cabeza de clasificación y un motor de inferencia denominado Decision Index vision engine.

El modelo se apoya en la arquitectura híbrida del base Qwen3.8-27B, que combina capas de atención completa con capas recurrentes Gated DeltaNet. Una particularidad crítica es que la atención no es causal en las capas de atención completa: todos los tokens del prompt se atienden entre sí, mientras que las capas recurrentes permanecen causales. Esta modificación es imprescindible para reproducir el comportamiento entrenado; usar atención causal estándar produce respuestas distintas.

La relevancia de dormice radica en su enfoque de evaluación de decisión visual: en lugar de generar una respuesta textual y parsearla, expone directamente la distribución de probabilidad sobre las opciones, lo que facilita el análisis calibrado de la incertidumbre del modelo en tareas de razonamiento visual de opción múltiple. Está pensado para ejecutarse como motor de un benchmark (Decision Index vision 0.3) sobre una suite pública de once tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención completa no causal + capas recurrentes Gated DeltaNet) con cabeza lineal de clasificación de 26 salidas |
| Parametros totales | No disponible (el repositorio solo contiene la actualización LoRA de 1,4 GB y la cabeza; los pesos base se cargan desde Qwen/Qwen3.8-27B) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No especificada formalmente; la suite pública incluye prompts de hasta 3.405 tokens y el motor precalienta hasta 8.192 tokens; prompts más largos funcionan con penalización de latencia en el primer rango nuevo |
| Tipos de cuantizacion | No disponible (la inferencia se realiza en bf16 para los pesos y fp32 para la cabeza) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`dormice_update.safetensors` de 1,4 GB y `dormice_head.safetensors`); el modelo base se descarga desde el Hub en la revisión fijada `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` |

## Arquitectura y entrenamiento

dormice es un ajuste fino del modelo Qwen/Qwen3.8-27B, que emplea una arquitectura híbrida: capas de atención completa combinadas con capas recurrentes Gated DeltaNet. El ajuste consiste en tres LoRA de rango 16 aplicadas a las capas lineales del modelo de lenguaje, con la torre de visión congelada, más una cabeza lineal de 26 salidas. Los tres ajustes se combinan mediante una media ponderada con pesos 0,5, 0,25 y 0,25, aplicados tanto a las actualizaciones de bajo rango como a las cabezas. El repositorio almacena las tres actualizaciones por separado, ya multiplicadas por sus pesos (tres términos de rango 16 por matriz, 496 matrices), y el motor las suma a los pesos base en fp32 al cargar.

El entrenamiento se realizó sobre preguntas de opción múltiple acerca de imágenes, construidas a partir de fuentes públicas, en actualizaciones de 64 preguntas. El primer ajuste se entrenó durante 3.000 actualizaciones sobre 192.000 preguntas; los otros dos, durante 1.000 actualizaciones cada uno sobre dos mezclas distintas de 64.000 preguntas, partiendo ambos de un ajuste fino previo común (1.000 actualizaciones sobre 60.632 preguntas). La innovación técnica principal es el procedimiento de inferencia: una única pasada forward en bf16, con la cabeza en fp32 leyendo el estado oculto del último token del prompt, y softmax a temperatura 1 sobre las opciones de la pregunta. No se decodifica texto ni se usan los logits de letras del modelo base. La atención no causal en las capas de atención completa se registra en la interfaz de atención de transformers y se ejecuta sobre PyTorch SDPA; las capas recurrentes usan kernels de flash-linear-attention y Triton, con precalentamiento en carga que compila y ajusta los kernels para rangos de longitud de prompt (unos 35 s la primera petición en una máquina nueva y unos 9 s la primera petición en cada rango adicional de 1.365 tokens).

## Capacidades

- Respuesta a preguntas de opción múltiple sobre imágenes, con distribución de probabilidad por opción (hasta 12 opciones, letras A a L).
- Razonamiento visual: interpretación de imágenes a resolución nativa de hasta 1.638.400 píxeles por imagen.
- Soporte de opciones dibujadas en la propia imagen (cuando la fila lo indica, se omiten las líneas de opciones en el prompt).
- Soporte de prefijo de lectura (read-out prefix) añadido tras la cabecera del asistente.
- Modo de pensamiento desactivado por defecto (`enable_thinking=False`); no se emplea decodificación generativa.
- Una pregunta por petición, sin truncamiento ni filtrado de opciones.
- Capacidades multilingües: no disponibles (no se documentan).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.

## Casos de uso

- Evaluación de benchmarks de razonamiento visual: el modelo actúa como motor de la suite pública Decision Index vision 0.3 (once benchmarks, 12.210 preguntas), devolviendo probabilidades por opción que permiten analizar calibración y no solo acierto.
- Análisis de incertidumbre en tareas de decisión visual: al exponer la distribución softmax sobre las opciones, permite estudiar cuándo el modelo duda entre alternativas concretas en lugar de obtener solo una etiqueta.
- Sistemas de verificación visual con umbral de confianza: en un pipeline de control de calidad, se puede aceptar automáticamente la opción de mayor probabilidad cuando supera un umbral y derivar a revisión humana en caso contrario.
- Investigación sobre atención no causal en modelos híbridos: sirve como banco de pruebas reproducible para estudiar el efecto de la atención bidireccional en capas de atención completa frente a capas recurrentes causales.
- Clasificación visual de opción múltiple en dominios acotados: preguntas como "¿qué objeto está más cerca de la cámara?" entre opciones predefinidas, con una sola pasada forward y sin generación de texto.
- Comparación de estrategias de ajuste fino: la combinación ponderada de tres LoRA y la cabeza de 26 salidas constituyen un caso de estudio reproducible para investigar la fusión de adaptadores en tareas de clasificación visual.

## Benchmarks y rendimiento

La model card menciona la evaluación sobre Decision Index vision 0.3, suite pública con once benchmarks y 12.210 preguntas, pero el texto proporcionado se interrumpe antes de incluir los resultados numéricos. No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 54 GB para los pesos en bf16 más la petición; la suite pública se ejecutó con unos 58 GB según nvidia-smi.
- GPU recomendadas: 1 x RTX PRO 6000 (96 GB) y 1 x H200, ambas probadas con torch 2.14.1 (CUDA 13.0), transformers 5.12.1 y flash-linear-attention 0.5.2.
- GPU de consumo: no cabe en GPU de consumo convencionales (la necesidad de ~54-58 GB de VRAM excede la capacidad de tarjetas como la RTX 4090 de 24 GB).
- Opciones de despliegue: motor propio Decision Index vision engine (`python -m decision_index vision pipeline`), con soporte para `--option base=/path/to/snapshot` (carga local del base) y `--option device=cuda:1` (selección de GPU). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: precalentamiento en carga de unos 35 s la primera petición en una máquina nueva y unos 9 s la primera petición en cada rango adicional de 1.365 tokens, cacheado en `~/.triton`; `--option warmup_tokens=N` ajusta el límite y `warmup_tokens=0` omite el precalentamiento. No se proporcionan cifras de throughput sostenido.
- Nota: los resultados en bf16 difieren ligeramente entre tipos de GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dormice | No disponible (base Qwen3.8-27B) | No especificado (prompts de hasta 3.405 en suite; precalentado a 8.192) | Opción múltiple sobre imágenes con probabilidades | Apache 2.0 | Hugging Face (actualización + cabeza + motor) |
| Qwen/Qwen3.8-27B | 27B (según denominación) | No disponible en la información | Modelo base multimodal generativo | No disponible en la información | Hugging Face |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre fuentes públicas de preguntas visuales, puede heredar sesgos de esas fuentes.
- Riesgo de alucinación: el modelo no genera texto libre, por lo que el riesgo se traslada a la calibración de las probabilidades; una opción con alta probabilidad no garantiza corrección.
- Limitaciones de contexto o idioma: no se especifican idiomas soportados; los prompts largos funcionan pero la primera petición en cada rango nuevo de 1.365 tokens es más lenta.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe respetarse la licencia del modelo base Qwen/Qwen3.8-27B, que no se detalla en la información disponible.
- La atención no causal en las capas de atención completa es obligatoria: usar atención causal estándar produce respuestas distintas, lo que invalida la integración con stacks de inferencia convencionales.
- La cabeza de clasificación es imprescindible: no se debe usar la decodificación de letras del modelo base.
- Dependencia de la revisión fijada del modelo base (`1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`); otra revisión puede alterar los resultados.
- Requiere el kit Decision Index y las dependencias fijadas en `requirements.txt`; el motor no acepta opciones para ejecuciones de benchmark.
- El repositorio no incluye los pesos completos: la primera ejecución descarga el modelo base desde el Hub.
- Los resultados en bf16 varían ligeramente entre tipos de GPU.
- Una pregunta por petición y un máximo de 12 opciones (A-L), aunque la cabeza tiene 26 salidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/plantwaterer/dormice
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Decision Index (repositorio): https://github.com/apolinario/decision-index
- Documentación de la suite de visión: `docs/vision.md` del kit Decision Index
