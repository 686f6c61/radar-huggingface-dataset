# Hahsksjsgs/deephat-uncensored-lora-Q8_0-GGUF

## Resumen

`Hahsksjsgs/deephat-uncensored-lora-Q8_0-GGUF` es un adaptador LoRA en formato GGUF cuantizado a Q8_0, desarrollado por Hahsksjsgs sobre el modelo base `DeepHat/DeepHat-V1-7B`. El adaptador original, `Hahsksjsgs/deephat-uncensored-lora`, fue convertido a GGUF mediante la herramienta GGUF-my-lora de ggml.ai, con el objetivo de facilitar su carga junto a un modelo base en entornos como llama.cpp o llama-server.

El propósito declarado es ofrecer un ajuste fino "sin censura" (uncensored) sobre el modelo DeepHat-V1-7B, que según la documentación de DeepHat AI es un modelo orientado a razonamiento ofensivo, análisis de contexto largo y ejecución segura en el ámbito de la ciberseguridad. Se trata de un adaptador de baja dimensión, con aproximadamente 10 millones de parámetros, lo que implica que no es un modelo autónomo, sino una capa de modificación sobre los pesos del modelo base.

Su relevancia radica en la posibilidad de aplicar comportamiento personalizado a un LLM de 7B sin necesidad de reentrenar el modelo completo, con un coste de almacenamiento mínimo y compatibilidad con la pila de inferencia de llama.cpp. No obstante, la información disponible sobre licencia, idiomas, contexto exacto y benchmarks es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre modelo base transformer DeepHat-V1-7B |
| Parametros totales | 10.092.544 (solo adaptador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (solo adaptador LoRA) |

## Arquitectura y entrenamiento

El objeto de este repositorio es exclusivamente un adaptador LoRA, no un modelo completo. La arquitectura subyacente es la de un transformer de 7B perteneciente a la familia DeepHat-V1, sobre la cual se aplican modificaciones de baja dimensión en las capas de atención y proyecciones. El entrenamiento del adaptador se realizó sobre `Hahsksjsgs/deephat-uncensored-lora`, a partir del cual se generó un peso GGUF cuantizado a Q8_0. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre la aplicación de técnicas como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas en la conversión: el proceso estándar de GGUF-my-lora transforma los tensores del adaptador a este formato para que puedan aplicarse con `--lora` en llama.cpp.

## Capacidades

- Generación de texto: el adaptador está diseñado para el pipeline `text-generation`.
- Modelo "uncensored": según la descripción del autor, está orientado a reducir las restricciones de seguridad del modelo base, lo que se alinea con el enfoque de red team de DeepHat.
- Ajuste fino sobre temas concretos: como adaptador LoRA, permite modificar el comportamiento del modelo base para tareas específicas, sin alterar los pesos originales.
- Compatibilidad con llama.cpp: puede cargarse con `llama-cli --lora` o `llama-server --lora`.
- No hay datos confirmados sobre capacidades de tool calling, agentes, vision, audio, ni soporte multilingüe detallado.

## Casos de uso

- Red team en ciberseguridad: el adaptador puede usarse sobre DeepHat-V1-7B para razonamientos ofensivos, análisis de vulnerabilidades y simulaciones de ataques en entornos controlados sin las restricciones de un modelo censurado.
- Análisis de documentos largos: dado que DeepHat-V1-7B está descrito con soporte de contexto largo, el adaptador puede aplicarse a la revisión de registros o informes extensos en operaciones de seguridad.
- Personalización de un modelo 7B sin reentrenamiento: los adaptadores LoRA permiten aplicar cambios de comportamiento específicos sobre el modelo base con un coste almacenamiento mínimo, ideal para experimentos o prototipos.
- Investigación en alineación y seguridad: el adaptador sirve como caso de estudio para comparar el comportamiento entre un modelo censurado y su variante "uncensored" sobre los mismos inputs.
- Integración en pipelines locales de inferencia: gracias al formato GGUF, el adaptador puede integrarse en aplicaciones que usan llama.cpp, como asistentes de línea de comandos o servidores locales con `--lora`.
- Benchmark de adaptadores cuantizados: el adaptador Q8_0 permite evaluar el impacto de la cuantización en el rendimiento de un LoRA, tanto en calidad de salida como en uso de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador Q8_0 ocupa aproximadamente 10 MB, pero para ejecutarlo es necesario cargar el modelo base DeepHat-V1-7B, que en cuantización Q8_0 ocupa alrededor de 7 GB.
- VRAM estimada: entre 8 GB y 16 GB, dependiendo del contexto y de la cuantización del modelo base. En una RTX 4090 (24 GB) se puede trabajar con ventanas de contexto largas.
- GPU recomendadas: RTX 4090, A100, H100, o cualquier GPU con al menos 8 GB de VRAM. En CPU, llama.cpp puede ejecutar el modelo con suficiente RAM (16 GB o más).
- Opciones de despliegue: llama.cpp con `--lora`, llama-server. No se recomienda vLLM ni TGI, ya que están orientadas a modelos completos, no a adaptadores GGUF.
- Latencia y throughput: no disponible sin pruebas específicas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Hahsksjsgs/deephat-uncensored-lora-Q8_0-GGUF | LoRA GGUF | 10M (adaptador) | no disponible | no disponible | GGUF |
| TheBloke/Luna-AI-Llama2-Uncensored-GGUF | Modelo completo GGUF | 7B | 4096 | no disponible | GGUF |
| Hahsksjsgs/deephat-uncensored-lora | LoRA (PEFT) | 10M (adaptador) | no disponible | no disponible | Safetensors/PEFT |

No se dispone de datos comparables de rendimiento para establecer una comparativa fiable más allá de las especificaciones anteriores.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: para usarlo hay que cargar el modelo base `DeepHat/DeepHat-V1-7B` y aplicar el LoRA mediante `--lora`. Sin el modelo base, no funciona.
- Licencia no disponible: no se puede garantizar si su uso comercial es legal.
- El término "uncensored" implica que el modelo puede generar contenido peligroso, ilegal o no deseado. Su uso debe limitarse a entornos controlados y con supervisión humana.
- No hay información sobre sesgos, alucinaciones, ni límites de contexto específicos.
- El repositorio no tiene descargas ni likes, lo que sugiere una validación mínima por parte de la comunidad.
- La fecha de creación del repositorio (2026-09-08) resulta inconsistente con el estado actual del ecosistema, lo que puede indicar un registro automatizado o un error de metadatos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Hahsksjsgs/deephat-uncensored-lora-Q8_0-GGUF
- Adaptador original: https://huggingface.co/Hahsksjsgs/deephat-uncensored-lora
- Página de DeepHat: https://www.deephat.ai/
- Documentación de llama.cpp server: https://github.com/ggerganov/llama.cpp/blob/master/examples/server/README.md
- Herramienta GGUF-my-lora: https://huggingface.co/spaces/ggml-org/gguf-my-lora
