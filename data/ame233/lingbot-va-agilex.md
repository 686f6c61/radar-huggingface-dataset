# Ame233/lingbot-va-agilex

## Resumen

LingBot-VA AgileX es un conjunto de checkpoints de ajuste supervisado (SFT) derivados del modelo base robbyant/lingbot-va-base, perteneciente al proyecto LingBot-VA de Robbyant. Se trata de un modelo de robótica orientado a la generación de acciones y vídeo para control de brazos manipuladores, empaquetado en formato diffusers con componentes compartidos de VAE, codificador de texto UMT5 y tokenizador. El repositorio, publicado por el usuario Ame233, contiene tres variantes de tarea específicas para el robot AgileX: pour (verter), opendraw (abrir cajón) y pick (recoger).

El modelo resuelve el problema de la adaptación de un modelo fundacional visión-lenguaje-acción a tareas concretas de manipulación mediante fine-tuning supervisado. Frente al modelo base, estos checkpoints incorporan pesos de transformer ajustados por tarea en distintos pasos de entrenamiento (checkpoint-800, 900 y 1000 para pour; checkpoint-1000 para opendraw y pick), manteniendo congelados los componentes de percepción y lenguaje, que se copian byte a byte del repositorio original con revision fija.

Es relevante ahora porque ejemplifica el patrón de publicación de checkpoints de robótica por tarea sobre un modelo base abierto bajo licencia Apache 2.0, lo que facilita reproducibilidad, comparación entre pasos de entrenamiento y reutilización de componentes compartidos sin duplicar el coste de almacenamiento del codificador de texto y el VAE. El repositorio ocupa 65,1 GB y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (pipeline diffusers) con VAE (AutoencoderKLWan), codificador de texto UMT5 y tokenizador T5; implementación LingBot-VA |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformer, vae, text_encoder en tres shards con índice) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño del proyecto LingBot-VA: un transformer de difusión que genera acciones y vídeo condicionado por texto, con un VAE de la familia AutoencoderKLWan para la parte visual y un codificador de texto UMT5 (con tokenizador T5) para las instrucciones en lenguaje natural. Los componentes `vae/`, `text_encoder/` y `tokenizer/` se copian literalmente del modelo base robbyant/lingbot-va-base en la revision `68b7bc1b35da6ddc67ea94c4ceb58d768fbb3f9c` y permanecen congelados durante el SFT; los hashes SHA256 por fichero están registrados en `shared_components.json`.

El entrenamiento consiste en fine-tuning supervisado por tarea sobre el modelo base, con checkpoints intermedios conservados: para la tarea pour se publican los pasos 800, 900 y 1000, y para opendraw y pick únicamente el paso 1000. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. La normalización de acciones y la configuración de ejecución específicas de cada tarea deben aportarse por separado, ya que no están incluidas en los componentes compartidos.

## Capacidades

- Generación de acciones de manipulación robótica condicionadas por instrucciones en lenguaje natural, mediante el transformer de difusión ajustado por tarea.
- Generación de vídeo/predicción visual asociada a la ejecución, gracias al VAE compartido del pipeline.
- Ejecución de tres tareas concretas sobre el robot AgileX: verter (pour), abrir cajón (opendraw) y recoger (pick).
- Comprensión de instrucciones textuales a través del codificador UMT5 con tokenizador T5.
- Selección de checkpoint por paso de entrenamiento en la tarea pour (800, 900, 1000), lo que permite evaluar la evolución del ajuste.
- Reutilización de componentes congelados entre tareas, lo que reduce el coste de carga y almacenamiento en despliegues multi-tarea.
- Soporte de tool calling, agentes multi-paso, razonamiento matemático general, visión de propósito general, audio o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Manipulación robótica de laboratorio con AgileX: cargar el checkpoint `checkpoint-1000/transformer/` de la tarea pick junto con los componentes compartidos en la raíz del repositorio para ejecutar una política de recogida de objetos sobre el brazo AgileX, aportando la normalización de acciones específica de la tarea.
- Vertido controlado de líquidos o materiales: usar los checkpoints de pour (800, 900 o 1000) para comparar estabilidad y precisión del vertido según el paso de entrenamiento y elegir el que mejor se ajuste al entorno real.
- Apertura de cajones en entornos de almacén: desplegar el checkpoint de opendraw para tareas de extracción de piezas, integrado en un pipeline de control que combine la instrucción textual con la observación visual del VAE.
- Evaluación comparativa de checkpoints: emplear los tres pasos de pour para medir la curva de aprendizaje del SFT y decidir cuándo detener el ajuste en futuras tareas del mismo robot.
- Investigación en modelos fundacionales visión-lenguaje-acción: reutilizar los componentes congelados (VAE, UMT5, tokenizador) como base para nuevos fine-tunings por tarea sin duplicar el almacenamiento del codificador de texto y el VAE.
- Reproducibilidad y auditoría: verificar la integridad de los componentes compartidos mediante los hashes SHA256 de `shared_components.json` y la revision fija del modelo base antes de desplegar en producción.
- Despliegue multi-tarea en un mismo robot: cargar una única copia de los componentes compartidos y conmutar entre los directorios de transformer de cada tarea según la instrucción recibida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio completo ocupa 65,1 GB, pero el tamaño de cada transformer por tarea y el de los componentes compartidos no se detallan en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el peso del repositorio y la ausencia de variantes cuantizadas impiden confirmarlo.
- Opciones de despliegue: carga mediante la librería diffusers (`AutoencoderKLWan` para `subfolder="vae"`, `UMT5EncoderModel` para `subfolder="text_encoder"`, `T5TokenizerFast` para `subfolder="tokenizer"`) junto con la implementación LingBot-VA para el transformer. Soporte en vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ame233/lingbot-va-agilex | no disponible | no disponible | SFT por tarea sobre LingBot-VA para robot AgileX | Apache 2.0 | Hugging Face (0 descargas) |
| robbyant/lingbot-va-base | no disponible | no disponible | Modelo base visión-lenguaje-acción del que derivan estos checkpoints | Apache 2.0 | Hugging Face |
| Otros modelos fundacionales de robótica comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los checkpoints están ajustados exclusivamente para tres tareas del robot AgileX (pour, opendraw, pick); su uso fuera de esas tareas o con otra morfología de robot no está respaldado por la información disponible.
- La normalización de acciones y la configuración de ejecución específicas de cada tarea no están incluidas en el repositorio y deben aportarse por separado; sin ellas el transformer no es directamente utilizable.
- El transformer requiere la implementación LingBot-VA; no es cargable solo con diffusers estándar.
- No se documentan sesgos, tasas de alucinación ni comportamiento fuera de distribución; en robótica real, los fallos de política pueden provocar daños físicos, por lo que se recomienda validación en simulación y límites de par/velocidad antes de producción.
- Idiomas soportados no disponibles; el codificador UMT5 es multilingüe por diseño, pero no se confirma el rendimiento en castellano para estas tareas.
- Longitud de contexto no disponible, lo que limita la planificación de instrucciones largas o historiales multi-turno.
- El repositorio no registra descargas ni valoraciones y procede de un autor individual sobre un modelo base de terceros; conviene revisar los hashes de `shared_components.json` y la revision fija del upstream antes de confiar en él.
- Licencia Apache 2.0 permite uso comercial, pero deben conservarse los avisos de atribución al proyecto Robbyant LingBot-VA y al modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Ame233/lingbot-va-agilex
- Perfil del autor: https://huggingface.co/Ame233/models
- Modelo base: https://huggingface.co/robbyant/lingbot-va-base
- Model card del modelo base (revision fija): https://huggingface.co/robbyant/lingbot-va-base/blob/68b7bc1b35da6ddc67ea94c4ceb58d768fbb3f9c/README.md
- Árbol de ficheros del modelo base (revision fija): https://huggingface.co/robbyant/lingbot-va-base/tree/68b7bc1b35da6ddc67ea94c4ceb58d768fbb3f9c
- Código upstream: https://github.com/Robbyant/lingbot-va
