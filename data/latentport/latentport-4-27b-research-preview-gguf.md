# latentport/latentport-4-27b-research-preview-GGUF

## Resumen

LatentPort-4+27B bridge (GGUF) es un artefacto de investigación publicado por el usuario latentport en Hugging Face. No es un modelo de lenguaje generativo al uso, sino un "puente" (bridge) que transfiere el estado de trabajo interno de un modelo origen, Qwen3.5-4B, a un modelo destino, Qwen3.8-27B. La transferencia abarca la atención K/V, el estado convolucional y recurrente, y el estado oculto terminal. El repositorio contiene únicamente los pesos del puente, no los pesos de los modelos base, que deben descargarse por separado.

El artefacto se distribuye en formato GGUF con arquitectura personalizada `latentport_bridge_v1`, pero conviene subrayar que el contenedor GGUF aquí es solo un envoltorio: los tensores están en FP32 y no se trata de una cuantización Q4 o Q8. El fichero no puede cargarse con un runtime GGUF estándar como llama.cpp u Ollama para generar texto; requiere un runtime compatible con LatentPort que lo combine con los modelos base.

El dato de parámetros es llamativo: la información de safetensors indica 644.583.547 parámetros totales, muy por debajo de los 27B que sugiere el nombre, lo que es coherente con que se trate de un puente y no del modelo completo. El tamaño del repositorio es de 5,2 GB, consistente con tensores en FP32. La licencia no está disponible y se remite a un fichero `LICENSE_STATUS.md` dentro del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `latentport_bridge_v1` (arquitectura personalizada de transferencia de estado, no un transformer generativo) |
| Parametros totales | 644.583.547 (según safetensors del repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 únicamente; no hay Q4, Q8 ni otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | no disponible (ver `LICENSE_STATUS.md` en el repo) |
| Formato de pesos | GGUF (contenedor) con tensores FP32; fichero `latentport-4-27b-bridge.F32.gguf` |

## Arquitectura y entrenamiento

El puente implementa una transferencia de estado entre dos modelos de la familia Qwen: Qwen3.5-4B como origen y Qwen3.8-27B como destino. Según la model card, la transferencia cubre la atención K/V, el estado convolucional y recurrente, y el estado oculto terminal. Esto implica que los modelos base incorporan componentes más allá de la atención estándar (estados convolucionales y recurrentes), aunque la información disponible no detalla la arquitectura interna de esos modelos ni el mecanismo exacto de combinación.

No se proporcionan datos sobre el proceso de entrenamiento del puente: no hay información sobre número de tokens, composición del dataset, ni sobre si hubo RLHF, DPO u otras fases de alineamiento. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. El repositorio incluye `tensor_map.json`, que mapea los nombres de tensores GGUF a los pesos canónicos, y `FORMAT_VERIFICATION.json`, que registra la conversión byte a byte de los tensores. El identificador de release es `e119-final16-b960c37364bc`.

## Capacidades

- No es un modelo generativo autónomo: no produce texto por sí mismo.
- Transferencia de estado de trabajo entre un modelo origen (Qwen3.5-4B) y un modelo destino (Qwen3.8-27B).
- Transferencia de atención K/V, estado convolucional, estado recurrente y estado oculto terminal.
- Requiere un runtime compatible con LatentPort para combinarse con los modelos base.
- No soporta tool calling ni function calling de forma nativa.
- No soporta agentes ni razonamiento multi-paso por sí mismo.
- Capacidades multilingües: no disponibles (dependen de los modelos base).
- No dispone de modo thinking, visión ni audio documentados.

## Casos de uso

- Investigación sobre transferencia de estado entre modelos: el puente permite estudiar cómo se propaga el estado interno de un modelo pequeño a uno grande, con trazabilidad byte a byte mediante `FORMAT_VERIFICATION.json`.
- Reutilización de contexto computado: en escenarios de investigación, se podría transferir el estado K/V de una sesión en Qwen3.5-4B a Qwen3.8-27B para evitar recomputar el contexto, aunque esto depende del runtime LatentPort.
- Análisis de interoperabilidad entre arquitecturas: útil para estudiar compatibilidades entre estados convolucionales y recurrentes de modelos de distinta escala.
- Reproducibilidad de experimentos: el mapa de tensores y el registro de verificación permiten replicar la conversión y validar la integridad del puente.
- Docencia e investigación académica: material para cursos o papers sobre transferencia de estado latente y compartición de representaciones internas.
- Desarrollo de runtimes compatibles: sirve como caso de prueba para implementar o validar cargadores LatentPort en herramientas propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para el puente: el fichero pesa aproximadamente 5,2 GB en FP32, por lo que se necesita al menos esa cantidad de memoria solo para el puente.
- VRAM adicional: los modelos base (Qwen3.5-4B y Qwen3.8-27B) deben descargarse y cargarse por separado, con sus propios requisitos de memoria, no especificados.
- GPU recomendadas: no disponible; dependerá del runtime LatentPort y de los modelos base.
- Compatibilidad con GPU de consumo: no confirmada; el modelo destino de 27B probablemente exija GPUs de gama alta o cuantización adicional no disponible en este repo.
- Opciones de despliegue: no es compatible con llama.cpp, Ollama, vLLM ni TGI estándar; requiere un runtime LatentPort-compatible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen artefactos comparables de transferencia de estado con arquitectura `latentport_bridge_v1` en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni responde a prompts de forma directa.
- Incompatible con cargadores GGUF estándar (llama.cpp, Ollama, etc.); requiere runtime LatentPort.
- Los pesos de los modelos base no están incluidos y deben descargarse por separado, con identidades y revisiones especificadas en `latentport.json`.
- Licencia no disponible; es imprescindible revisar `LICENSE_STATUS.md` antes de cualquier uso, especialmente comercial.
- Estado de investigación (research preview): no apto para producción sin validación adicional.
- Sin datos de benchmarks, sesgos, alucinación ni rendimiento multilingüe.
- El nombre "27B" puede inducir a error: los parámetros reales del artefacto son 644.583.547.
- Fecha de creación y actualización en 2026, lo que sugiere un artefacto reciente y posiblemente inestable.

## Enlaces

- Repositorio GGUF: https://huggingface.co/latentport/latentport-4-27b-research-preview-GGUF
- Repositorio principal del puente: https://huggingface.co/latentport/latentport-4-27b-research-preview
- Modelo origen: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo destino: https://huggingface.co/Qwen/Qwen3.8-27B
