# bombdefuser-124/Intern-Decision-2B-GGUF

## Resumen
Intern-Decision-2B-GGUF es una conversión a formato GGUF del modelo internlm/Intern-Decision-2B, un modelo multimodal de decisión estructurada afinado a partir de Qwen3.5-2B. La conversión la firma el usuario bombdefuser-124 y está pensada para ejecutarse con llama.cpp con soporte multimodal de Qwen3.5. No es un asistente conversacional general, sino un puntuador de candidatos: recibe una entrada de imagen y texto y devuelve probabilidades sobre un conjunto de respuestas candidatas restringidas.

Con 1.881.825.088 parámetros (unos 1,88 B) y 24 bloques transformer, el modelo se sitúa en la gama pequeña, lo que permite desplegarlo en hardware de consumo. Su relevancia actual radica en que cubre un nicho poco frecuente (la decisión estructurada multimodal con salida probabilística) en un formato (GGUF) y con una licencia (Apache 2.0) que facilitan la integración local y el uso comercial.

El repositorio incluye dos pesos del modelo de lenguaje (FP16 y Q8_0) más un proyector visual en FP16. Conviene tener en cuenta que la conversión omite la cabeza MTP/NextN declarada en la configuración original, ya que el checkpoint de origen no incluía esos tensores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen3.5-2B (24 bloques transformer); puntuador de candidatos con proyector visual |
| Parámetros totales | 1.881.825.088 (~1,88 B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el ejemplo oficial de llama-server usa `--ctx-size 8192`, valor configurable en ejecución) |
| Tipos de cuantización | FP16 (`f16`) y Q8_0; el repositorio solo publica estas dos, aunque llama.cpp admite otras |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | internlm/Intern-Decision-2B (relación: cuantizado) |
| Componentes del repositorio | `intern-decision-2b-fp16.gguf`, `intern-decision-2b-q8_0.gguf`, `mmproj-f16.gguf` (proyector visual) |
| Tamaño del repositorio | 6,5 GB |
| Descargas / valoraciones | 0 descargas / 0 me gusta |
| Fecha de publicación | 26 de septiembre de 2026 (creado y actualizado el mismo día) |

## Arquitectura y entrenamiento
El modelo original es un transformer multimodal de decisión estructurada afinado a partir de Qwen3.5-2B. Este repositorio no contiene un entrenamiento nuevo, sino una conversión de pesos a GGUF realizada con llama.cpp. Los GGUF del modelo de lenguaje contienen los 24 bloques transformer del checkpoint; la configuración de origen declaraba una cabeza MTP/NextN (predicción multi-token), pero el checkpoint no incluía esos tensores, por lo que la conversión la omite. La parte multimodal se resuelve con un proyector visual independiente (`mmproj-f16.gguf`) que debe emparejarse con uno de los dos pesos de lenguaje.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO; la model card remite al repositorio upstream para esos detalles. La innovación funcional del modelo es su naturaleza de puntuador de candidatos en lugar de generador libre: cada campo de la decisión se restringe a un símbolo de respuesta de un solo token y se leen las probabilidades de cada candidato. El autor indica una temperatura de calibración de `2.100509348278`, ajustada sobre pesos BF16, por lo que la cuantización Q8_0 puede alterar la calidad de la calibración.

## Capacidades
- Procesamiento multimodal de imagen y texto (`image-text-to-text`).
- Puntuación de candidatos: devuelve probabilidades sobre respuestas candidatas en lugar de texto libre.
- Decisión estructurada y predicción estructurada (`structured-prediction`) mediante esquemas de decisión del autor upstream.
- Salidas con decodificación restringida: cada campo se limita a un símbolo de un solo token permitido, lo que garantiza respuestas válidas dentro del esquema.
- Lectura de probabilidades por candidato para su uso en lógica de decisión posterior.
- Inferencia local vía llama.cpp con soporte multimodal de Qwen3.5.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo no está diseñado como agente general).
- Capacidades multilingües: no disponible.
- Modo "thinking" o capacidades de audio: no disponible.

## Casos de uso
- Selección de acciones en pipelines de decisión: dado un input multimodal y un conjunto de opciones, el modelo puntúa cada candidato y devuelve probabilidades, lo que permite elegir la acción con mayor probabilidad de forma medible y auditable.
- Decodificación restringida para etiquetas controladas: al limitar cada campo a un símbolo de un solo token permitido, se garantiza que la salida cumpla un esquema fijo, algo útil en sistemas productivos donde no se toleran respuestas libres.
- Enrutado multimodal en flujos automatizados: combinar una imagen y un texto de contexto para decidir la siguiente etapa de un flujo (por ejemplo, qué rama de un proceso activar), aprovechando la componente visual.
- Clasificación asistida por imagen con salida probabilística: obtener una distribución de probabilidad sobre categorías predefinidas y umbralizar la decisión según la confianza.
- Despliegue en local o en el borde (edge): con Q8_0 el modelo ocupa alrededor de 2 GB de pesos, lo que permite ejecutarlo en equipos sin GPU dedicada mediante llama.cpp o Ollama.
- Investigación sobre calibración de probabilidades: la temperatura de calibración publicada permite estudiar y reproducir el comportamiento probabilístico del modelo, así como medir el impacto de la cuantización en la calibración.
- Generación de decisiones estructuradas para alimentar sistemas posteriores: producir salidas en formato de esquema que otros componentes (reglas, bases de datos o agentes) puedan consumir directamente.
- Base para ajuste fino: servir como punto de partida cuantizado para experimentos de fine-tuning o evaluación en tareas de decisión multimodal.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card remite al repositorio upstream (internlm/Intern-Decision-2B) para consultar los benchmarks del modelo original.

## Requisitos de hardware
- VRAM estimada (valores aproximados a partir del tamaño de parámetros, no confirmados por el autor):
  - FP16: unos 3,8 GB de pesos del modelo de lenguaje, más el proyector visual (aproximadamente 0,7 GB) y la caché KV según el contexto.
  - Q8_0: unos 2 GB de pesos, más el proyector visual y la caché KV.
- GPU recomendadas: al tratarse de un modelo de ~1,88 B, cabe en GPU de consumo como una RTX 3060 (12 GB), RTX 4060, RTX 4090 e inferiores con suficiente VRAM; también es viable en GPU de datacenter (A100, H100) aunque no son necesarias para su tamaño.
- ¿Cabe en GPU de consumo?: sí. La variante Q8_0 debería caber en GPU con 6-8 GB de VRAM; la variante FP16 requiere alrededor de 8 GB o más según el contexto configurado.
- Opciones de despliegue: `llama-server` de llama.cpp (comando de ejemplo incluido en la model card, con `--mmproj mmproj-f16.gguf`, `--gpu-layers all` y `--flash-attn on`); también es compatible con otros frontends que consuman GGUF (por ejemplo Ollama). vLLM y TGI tienen soporte limitado o no oficial de GGUF, por lo que no se recomiendan como primera opción.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Intern-Decision-2B-GGUF (este repositorio) | 1,88 B | no disponible | GGUF (FP16, Q8_0) | Apache 2.0 | HuggingFace |
| internlm/Intern-Decision-2B (modelo base) | no disponible (mismo orden de magnitud) | no disponible | no disponible (probablemente safetensors/BF16) | no disponible (consultar upstream) | HuggingFace |
| Qwen3.5-2B (arquitectura de origen) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones comparables para establecer una comparativa cuantitativa con alternativas de la misma categoría (modelos multimodales de decisión estructurada de ~2 B).

## Limitaciones y advertencias
- No es un modelo de chat general: está diseñado como puntuador de candidatos. Usarlo como asistente conversacional produciría resultados pobres.
- Requiere el formato de prompt del esquema de decisión del repositorio upstream y la restricción de cada campo a su símbolo de respuesta permitido; sin esa restricción las salidas pueden no ser válidas.
- La cuantización afecta a la calibración: la temperatura de calibración (`2.100509348278`) se ajustó sobre pesos BF16, por lo que la variante Q8_0 puede variar en calidad de calibración.
- La cabeza MTP/NextN declarada en la configuración original no está incluida, ya que el checkpoint de origen no contenía esos tensores.
- No se han publicado benchmarks en este repositorio, por lo que el rendimiento real no está verificado en la información disponible.
- Riesgo de alucinación y de predicciones mal calibradas, especialmente fuera de la distribución de entrenamiento; conviene validar con datos propios.
- Idiomas soportados no disponibles; no se puede garantizar cobertura multilingüe.
- Restricciones de licencia: este repositorio se publica bajo Apache 2.0, pero la licencia del modelo base (internlm/Intern-Decision-2B) debe comprobarse en el repositorio upstream antes de un uso comercial.
- Repositorio con 0 descargas y 0 valoraciones, publicado por un tercero: se trata de una conversión de la comunidad no revisada oficialmente.
- Solo se publican dos cuantizaciones (FP16 y Q8_0); no hay variantes de menor precisión para equipos con muy poca memoria.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/bombdefuser-124/Intern-Decision-2B-GGUF
- Modelo base (upstream): https://huggingface.co/internlm/Intern-Decision-2B
- llama.cpp (librería de inferencia recomendada): https://github.com/ggml-org/llama.cpp
