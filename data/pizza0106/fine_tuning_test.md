# pizza0106/fine_tuning_test

## Resumen

`pizza0106/fine_tuning_test` es un modelo de lenguaje de 268.098.176 parámetros (aproximadamente 270M) obtenido mediante fine-tuning supervisado (SFT) del modelo base `google/functiongemma-270m-it`, que pertenece a la familia Gemma 3 en su variante orientada a *function calling*. Lo publica el usuario `pizza0106` en Hugging Face y se distribuye en formato `safetensors` con la librería `transformers`. El repositorio ocupa 1,1 GB y no registra descargas ni interacciones en el momento de redactar esta ficha.

El modelo se ha entrenado con TRL 1.17.1 sobre Transformers 5.22.1 y PyTorch 2.14.1+cu130, y su tag `generated_from_trainer` confirma que se trata de un experimento de ajuste fino más que de un modelo de producción. La model card es una plantilla autogenerada por TRL: no documenta el dataset de entrenamiento, los hiperparámetros, la licencia ni los idiomas soportados.

Su relevancia es limitada pero concreta: sirve como ejemplo reproducible de cómo adaptar un modelo Gemma 3 de 270M especializado en llamadas a funciones mediante SFT con TRL, y como base ligera para prototipos de *tool calling* en entornos con recursos muy restringidos. No debe confundirse con un modelo listo para producción: la ausencia de documentación y de licencia explícita condiciona su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, variante `gemma3_text`) |
| Parametros totales | 268.098.176 (≈270M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no documentada en esta ficha) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precisión original) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Modelo base | google/functiongemma-270m-it |
| Metodo de entrenamiento | SFT (TRL) |
| Tamano del repo | 1,1 GB |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `google/functiongemma-270m-it`, un transformer decoder-only de la familia Gemma 3 en variante exclusivamente de texto (`gemma3_text`), con 268 millones de parámetros. No hay innovaciones arquitectónicas propias en este checkpoint: el autor solo aplica un ajuste fino supervisado sobre los pesos preentrenados. El modelo base está orientado por Google a *function calling*, lo que condiciona el tipo de datos con los que se ha ajustado.

El entrenamiento se realizó con TRL 1.17.1 en modo SFT, con Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, la longitud de secuencia, la tasa de aprendizaje, el número de épocas ni si hubo etapas de RLHF o DPO. Tampoco se documenta ninguna técnica de decodificación especulativa ni atención lineal. En la práctica, toda la información sobre entrenamiento se reduce a la versión de las librerías y al método (SFT).

## Capacidades

- Generación de texto conversacional en formato de chat (la model card incluye un ejemplo con `pipeline` y lista de mensajes con rol `user`).
- *Function calling* / *tool calling* heredado del modelo base `google/functiongemma-270m-it`, aunque no se documenta el alcance ni la fiabilidad tras el ajuste.
- Razonamiento multi-turno básico, limitado por el tamaño del modelo (270M parámetros).
- Capacidades multilingües: no disponibles/documentadas.
- Modo *thinking*, visión o audio: no disponibles (la variante es solo texto).
- Soporte de agentes: no documentado; el tamaño del modelo limita la planificación multi-paso compleja.

## Casos de uso

- Prototipado de *tool calling* en local: el modelo cabe en cualquier GPU de consumo e incluso en CPU, por lo que sirve para validar esquemas de funciones y prompts antes de migrar a un modelo mayor.
- Enrutamiento ligero de intenciones: con 270M parámetros puede clasificar la intención del usuario y decidir qué herramienta invocar en un pipeline de agentes, con latencia muy baja.
- Experimentos académicos de SFT con TRL: el checkpoint es un ejemplo reproducible de ajuste fino sobre Gemma 3 pequeño, útil para comparar hiperparámetros y datasets.
- Asistentes embebidos o *edge*: al ocupar ~1,1 GB en safetensors y ser cuantificable (aunque no se distribuyan GGUF), es candidato para despliegues en dispositivos con poca memoria.
- Generación de texto corto en aplicaciones de bajo coste: respuestas breves, resúmenes de una línea o extracción de campos simples donde no se requiere razonamiento profundo.
- Base para *fine-tuning* adicional: al ser un checkpoint SFT pequeño, sirve como punto de partida para ajustes específicos de dominio con recursos mínimos.
- Docencia y demos de Hugging Face: el ejemplo de `pipeline` de la model card permite montar una demo funcional en minutos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 0,6 GB solo para pesos (268M × 2 bytes), más overhead de activaciones y KV cache; en la práctica, menos de 2 GB.
- VRAM estimada en fp32: aproximadamente 1,1 GB solo para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, T4, L4). También funciona en CPU para pruebas.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, Apple Silicon con Metal.
- Opciones de despliegue: `transformers` (pipeline), vLLM, TGI (el tag `text-generation-inference` está presente), llama.cpp/Ollama si se convierte a GGUF (no se distribuye GGUF en el repo).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| pizza0106/fine_tuning_test | 268M | no disponible | no disponible | Hugging Face | SFT sobre functiongemma-270m-it; sin benchmarks |
| google/functiongemma-270m-it | ~270M | no disponible en esta ficha | Gemma (terminos de Google) | Hugging Face | Modelo base oficial orientado a function calling |
| Qwen2.5-0.5B-Instruct | ~500M | 32K (documentado por el autor) | Apache 2.0 | Hugging Face | Alternativa ligera con licencia permisiva y benchmarks publicados |
| SmolLM2-360M-Instruct | ~360M | 8K (documentado por el autor) | Apache 2.0 | Hugging Face | Modelo pequeño con documentación completa y benchmarks |

La comparativa es orientativa: los datos de los modelos alternativos provienen de sus respectivas model cards públicas y no se han verificado en esta ficha. El checkpoint de `pizza0106` carece de la documentación y garantías de los modelos oficiales.

## Limitaciones y advertencias

- Licencia no especificada: la model card incluye `licence: license` sin texto, lo que impide determinar si el uso comercial está permitido. Además, el modelo base Gemma arrastra los términos de uso de Google, que deben respetarse.
- Sin documentación de dataset ni hiperparámetros: no se puede evaluar el sesgo introducido por el ajuste fino ni reproducir el entrenamiento.
- Riesgo de alucinación elevado por el tamaño (270M parámetros): no es fiable para tareas de razonamiento complejo, matemáticas o código extenso.
- Idiomas y contexto no documentados: no se puede garantizar un comportamiento multilingüe ni una ventana de contexto concreta.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora respecto al modelo base.
- Cero descargas y cero likes: no hay validación comunitaria ni reportes de uso en producción.
- El nombre `fine_tuning_test` sugiere un experimento de prueba, no un artefacto destinado a producción.
- No se distribuyen pesos cuantizados (GGUF, AWQ, GPTQ), por lo que el despliegue en CPU requiere conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pizza0106/fine_tuning_test
- Modelo base: https://huggingface.co/google/functiongemma-270m-it
- Repositorio TRL: https://github.com/huggingface/trl
- Documentación de TRL SFT: https://huggingface.co/docs/trl/sft_trainer
- Documentación de Transformers: https://huggingface.co/docs/transformers
