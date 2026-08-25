# SaudF/qwen35-4b-dpo-v6-identity

## Resumen

El modelo `SaudF/qwen35-4b-dpo-v6-identity` es un ajuste fino y fusión directa sobre la base `unsloth/Qwen3.5-4B`, un modelo multimodal de Alibaba con arquitectura híbrida y licencia Apache 2.0. El autor, SaudF, ha fusionado los pesos del modelo base con un adaptador LoRA (`aziz9788/qwen35-saudidraft-full-final-adapter`) usando una receta directa con `lora_alpha=22`, `r=32` y rsLoRA, y posteriormente ha aplicado un proceso de DPO (direct preference optimization) y un ajuste de identidad (identity SFT) según indica el nombre del repositorio. La model card, sin embargo, indica que la identidad no se ha aplicado en la versión pre-identity; la relación exacta entre el nombre y el contenido no está clara.

El modelo está pensado para el árabe, con un enfoque en el dialecto saudí, y hereda del Qwen3.5-4B las capacidades multimodales (procesa texto e imagen) y la generación de texto multilingüe. Con 4,66 mil millones de parámetros, es un modelo de tamaño medio que puede desplegarse en hardware de consumo, lo que lo hace relevante para desarrolladores que necesitan un LLM árabe localizable y de código abierto con licencia permisiva.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención estándar + lineal) sobre Qwen3.5-4B |
| Parametros totales | 4.659.865.088 (~4,66B) |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible (heredada del Qwen3.5-4B, no especificada) |
| Tipos de cuantizacion | no disponibles (repositorio solo con pesos FP16 en safetensors) |
| Idiomas soportados | no disponible (el fin específico es árabe saudí; el base Qwen3.5 es multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP16, 9.3 GB) |

## Arquitectura y entrenamiento

El modelo parte del Qwen3.5-4B de Alibaba, que emplea una arquitectura transformer híbrida que combina atención tradicional con mecanismos de atención lineal para mejorar la eficiencia en contextos largos. Sobre esta base, el autor ha fusionado de forma directa (sin adaptador externo) un adaptador LoRA entrenado para el árabe saudist, con rango 32 y factor de escala 22, utilizando la técnica rsLoRA. El proceso de entrenamiento incluye además una fase de DPO (optimización por preferencias directas) y, según el nombre del repositorio, un ajuste de identidad (identity SFT) que la model card indica que no se ha aplicado en la versión final. El modelo se ha entrenado con el modo "thinking off" (razonamiento extendido desactivado), lo que reduce la latencia en inferencia.

No se han publicado detalles sobre la composición del dataset de entrenamiento, el número de tokens ni las fases de RLHF más allá de la mención del DPO.

## Capacidades

- Generación de texto multilingüe, con especial énfasis en árabe (variante saudí).
- Procesamiento multimodal: entrada de texto e imagen (pipeline `image-text-to-text`).
- Razonamiento y resolución de problemas, con el modo de pensamiento desactivado por defecto.
- Soporte de tool calling y function calling, heredado de la base Qwen3.5 (no confirmado explícitamente, pero es una capacidad estándar de la familia).
- Conversación de múltiples turnos (chat), optimizada mediante DPO para preferencias humanas.
- Capacidades de agente y razonamiento multi-paso, limitadas por el tamaño del modelo y el modo "thinking off".

## Casos de uso

- Asistente virtual en árabe para atención al cliente: el modelo puede mantener conversaciones de varios turnos en dialecto saudí, reduciendo la fricción en entornos de soporte. Su licencia Apache 2.0 permite integración comercial sin restricciones.
- Extracción de información de documentos con imágenes: al ser multimodal, puede procesar facturas, formularios o capturas de pantalla y devolver texto estructurado en árabe, útil para automatización de procesos de negocio.
- Generación de contenido localizado para redes sociales o marketing en Arabia Saudí: genera textos culturalmente adaptados al dialecto y contexto local.
- Chatbot educativo para aprendizaje de árabe: permite practicar conversación con correcciones y explicaciones, aprovechando su entrenamiento conversacional.
- Asistente de programación en entornos árabes: aunque no está específicamente entrenado para código, hereda las capacidades de generación de código del Qwen3.5-4B, útil para tareas de autocompletado o explicación de código en árabe.
- Análisis de sentimiento de comentarios en redes sociales en árabe: puede clasificar opiniones y extraer entidades, gracias a su ajuste fino en el dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio solo menciona una suite de evaluación interna (`full_suite_no_reasoning_saudidraft_direct_20260822_200129_pre_identity`) de la que no se han compartido los números.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos FP16, ~9,3 GB de VRAM, por lo que cabe en GPUs de consumo como la RTX 4070 Ti Super (16 GB) o RTX 4090 (24 GB). Con cuantización int8 o int4 (no incluida en el repo, pero posible mediante conversión), se puede reducir a ~4,7 GB o ~2,3 GB respectivamente, permitiendo ejecución en GPUs de 8 GB.
- GPU recomendadas: RTX 4090, RTX 3090, A100, H100, o cualquier GPU con al menos 10 GB de VRAM para FP16.
- Opciones de despliegue: Transformers (Hugging Face), vLLM, llama.cpp (con conversión a GGUF), Ollama (tras conversión).
- Latencia y throughput: no disponibles; en un RTX 4090 se estima una velocidad de generación de 30-50 tokens/s para un modelo de este tamaño en FP16, pero no es un dato confirmado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Enfoque |
|---|---|---|---|---|---|
| `SaudF/qwen35-4b-dpo-v6-identity` | 4,66B | no disponible | Sí (texto+imagen) | Apache 2.0 | Árabe saudí |
| Qwen3.5-4B (base) | 4,66B | no disponible | Sí (texto+imagen) | Apache 2.0 | Multilingüe |
| Jais (de G42) | 13B | 8k | No | Propietaria | Árabe |
| Jais 7B | 7B | 8k | No | Apache 2.0 | Árabe |
| JAR (Jais Arabic) | 1.5B/7B | 8k | No | Apache 2.0 | Árabe |

No se han publicado comparativas de rendimiento entre estos modelos en la información disponible. La principal diferencia frente a Jais es la naturaleza multimodal y la licencia Apache 2.0, así como el tamaño menor del Qwen3.5-4B.

## Limitaciones y advertencias

- No hay datos publicados sobre sesgos o alucinación específicos del modelo; al ser un ajuste fino de un base, puede heredar sesgos del Qwen3.5.
- La model card es contradictoria: el nombre del repositorio incluye "identity", pero la card afirma que la identidad SFT no se ha aplicado. Se debe verificar el estado real del modelo antes de usarlo en producción.
- El modo "thinking" está desactivado, lo que puede limitar el rendimiento en tareas de razonamiento complejo.
- No se ha confirmado la longitud de contexto efectiva ni el soporte completo de tool calling; se recomienda probar con casos concretos.
- El modelo está orientado al árabe saudí; puede tener un rendimiento inferior en otros dialectos árabes o en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no proporciona garantías ni soporte.

## Enlaces

- Repositorio del modelo: https://huggingface.co/SaudF/qwen35-4b-dpo-v6-identity
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Especificaciones y requisitos de VRAM de Qwen3.5-4B: https://apxml.com/models/qwen35-4b
- Información de ejecución de Qwen3.5-4B: https://www.canirun.ai/model/qwen3.5-4b
- Repositorio GitHub de Qwen3.5: https://github.com/ABDtmx/Qwen3.5</think>## Resumen

El modelo `SaudF/qwen35-4b-dpo-v6-identity` es un ajuste fino y fusión directa sobre la base `unsloth/Qwen3.5-4B`, un modelo multimodal de Alibaba con arquitectura híbrida y licencia Apache 2.0. El autor, SaudF, ha fusionado los pesos del Qwen3.5-4B con un adaptador LoRA entrenado para árabe saudí (`aziz9788/qwen35-saudidraft-full-final-adapter`) mediante una receta directa con `lora_alpha=22`, `r=32` y rsLoRA. El nombre del repositorio sugiere que se aplicó además una fase de DPO y un ajuste de identidad (identity SFT), aunque la model card indica que la identidad no se ha aplicado en la versión final; existe una contradicción que debe verificarse antes de usar el modelo en producción.

El modelo está pensado para el árabe, con un enfoque en la variedad saudí, y hereda del Qwen3.5 la capacidad multimodal (entrada de texto e imagen) y la generación multilingüe. Con 4,66 mil millones de parámetros, es un modelo de tamaño medio que puede desplegarse en hardware de consumo, lo que lo hace relevante para desarrolladores que buscan un LLM árabe localizado, de código abierto y con licencia permisiva.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención estándar + atención lineal) sobre Qwen3.5-4B |
| Parametros totales | 4.659.865.088 (~4,66B) |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible (heredada del Qwen3.5-4B, no especificada) |
| Tipos de cuantizacion | no disponible (repositorio solo con safetensors FP16) |
| Idiomas soportados | no disponible (base multilingüe, finetune orientado al árabe saudí) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP16, 9.3 GB) |

## Arquitectura y entrenamiento

El modelo parte del Qwen3.5-4B de Alibaba, que emplea una arquitectura transformer híbrida que combina atención estándar con mecanismos de atención lineal para mejorar la eficiencia en contextos largos. Sobre esta base, se ha fusionado de forma directa un adaptador LoRA entrenado para el árabe saudí, con rango 32, escala 22 y rsLoRA. El proceso de entrenamiento incluye una fase de DPO (optimización por preferencias directas) y, según el nombre del repositorio, un ajuste de identidad SFT, aunque la model card afirma que la identidad no se ha aplicado. El modelo se ejecuta con el modo "thinking" desactivado, lo que reduce la latencia en inferencia.

No se ha publicado información sobre el dataset de entrenamiento, el número de tokens ni la composición de los datos. Tampoco se detallan las etapas de RLHF más allá de la DPO mencionada.

## Capacidades

- Generación de texto multilingüe, con especial énfasis en árabe (variante saudí).
- Procesamiento multimodal: acepta entrada de texto e imagen (`image-text-to-text`).
- Razonamiento y resolución de tareas, con el modo de pensamiento desactivado por defecto.
- Soporte de tool calling y function calling, heredado de la base Qwen3.5 (no confirmado explícitamente, pero es una capacidad estándar de la familia).
- Conversación de varios turnos, optimizada mediante DPO.
- Capacidades de agente y razonamiento multi-paso, limitadas por el tamaño del modelo y la activación del modo "thinking".

## Casos de uso

- Atención al cliente automatizada en árabe: el modelo puede gestionar conversaciones de multi-turno en dialecto saudí, con la licencia Apache 2.0 que permite su integración comercial sin restricciones.
- Extracción de información de documentos con imagen: al ser multimodal, puede procesar facturas, formularios o capturas de pantalla y devolver texto estructurado en árabe, útil para automatización de procesos de negocio.
- Generación de contenido localizado para redes sociales en Arabia: produce textos adaptados al dialecto local, lo que facilita campañas de marketing o comunicación corporativa.
- Asistente educativo para el aprendizaje de árabe: permite conversaciones interactivas con corrección de errores, aprovechando su ajuste conversacional.
- Asistente de código en entornos árabes: aunque no está específicamente entrenado para código, hereda las capacidades del Qwen3.5 para generación y explicación de código en árabe.
- Clasificación y análisis de sentimiento de comentarios en redes sociales en árabe: puede extraer entidades y clasificar textos gracias a su ajuste en el idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio menciona una evaluación interna (`full_suite_no_reasoning_saudidraft_direct_20260822_200129_pre_identity`) pero no se han difundido los números.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos FP16, ~9,3 GB de VRAM, por lo que cabe en GPUs de consumo como la RTX 3090 (24 GB) o RTX 4090 (24 GB). Con cuantización int4 o int8 (no incluida en el repo, requiere conversión), se puede reducir a ~2,3-4,5 GB, permitiendo ejecución en GPUs de 8 GB.
- GPU recomendadas: RTX 4090, RTX 3090, A100, A100, o cualquier GPU con al menos 10 GB de VRAM para inferencia en FP16.
- Opciones de despliegue: Transformers (Hugging Face), vLLM, llama.cpp (con conversión a GGUF), Ollama (tras conversión).
- Latencia y throughput: no disponibles; en un RTX 4090 se estima una generación de 30-50 tokens/s para este tamaño, pero no es un dato confirmado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Enfoque |
|---|---|---|---|---|---|
| SaudF/qwen35-4b-dpo-v6-identity | 4,66B | no disponible | Sí (texto+imagen) | Apache 2.0 | Árabe saudí |
| Qwen3.5-4B (base) | 4,66B | no disponible | Sí (texto+imagen) | Apache 2.0 | Multilingüe |
| Jais (GigaAM) | 7B | 8k | No | Propietaria | Árabe |
| Jais 7B open | 7B | 8k | No | Apache 2.0 | Árabe |
| JAR (Arabic) | 1.5B/7B | 8k | No | Apache 2.0 | Árabe |

No se han publicado comparativas de rendimiento entre estos modelos en la información disponible. La ventaja principal de este modelo frente a Jais es su tamaño menor, su naturaleza multimodal y la licencia Apache 2.0.

## Limitaciones y advertencias

- No hay datos sobre sesgos o alucinación específicos; al ser un ajuste fino, puede heredar sesgos del Qwen3.5 base.
- La model card es contradictoria: el nombre del repositorio incluye "identity", pero la card afirma que la identidad SFT no se ha aplicado. Es necesario verificar el estado real del modelo antes de su uso en producción.
- El modo "thinking" está desactivado, lo que puede limitar el rendimiento en tareas de razonamiento complejo.
- No se ha confirmado la longitud de contexto efectiva ni el soporte de tool calling; se recomienda probar con el caso de uso concreto.
- El modelo está orientado al árabe saudí; puede tener un rendimiento inferior en otros dialectos o idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.

## Enlaces

- Repositorio del modelo: https://huggingface.co/SaudF/qwen35-4b-dpo-v6-identity
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Especificaciones y VRAM de Qwen3.5-4B: https://apxml.com/models/qwen35-4b
- Información de ejecución de Qwen3.5-4B: https://www.canirun.ai/model/qwen3.5-4b
- Repositorio GitHub de Qwen3.5: https://github.com/ABDtmx/Qwen3.5
