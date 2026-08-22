# sartajbhuvaji/GLM-4.6-Flash-text

## Resumen

GLM-4.6-Flash-text es una conversión no oficial del modelo multimodal GLM-4.6V-Flash de Z.AI, en la que se ha eliminado quirúrgicamente el componente de visión (el "vision tower" ViT de 24 capas) para obtener un modelo exclusivamente de texto. El autor, sartajbhuvaji, ha extraído los 523 tensores restantes y los ha re-mapeado sobre la arquitectura `Glm4ForCausalLM`, sin reentrenamiento ni destilación. El resultado es un modelo denso de 9.400 millones de parámetros (frente a los 10.293 millones del original) que conserva el comportamiento textual del modelo base de forma bit-exacta, verificada con una divergencia máxima de 0.0 en logits sobre prompts de hasta 1.207 tokens.

La relevancia de esta ficha radica en que el modelo ofrece la misma capacidad de generación de texto, razonamiento y código que GLM-4.6V-Flash, pero con un peso menor (18.80 GB en bf16 frente a 20.59 GB) y sin dependencias de procesamiento de imágenes, lo que simplifica el despliegue en entornos de producción y reduce los requisitos de VRAM. Además, se publican cuantizaciones GGUF (desde F16 hasta Q4_K_M) para su uso con llama.cpp y Ollama, lo que permite ejecutarlo en hardware de consumo. La licencia es MIT, lo que facilita su integración comercial.

El modelo mantiene el contexto nativo de 131.072 tokens, la arquitectura de 40 capas con atención GQA (16:1) y el vocabulario de 151.552 tokens del modelo original. Es una opción interesante para desarrolladores que necesitan un modelo de 9B con contexto largo y licencia permisiva, sin la complejidad de un sistema multimodal.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glm4ForCausalLM (decoder-only transformer con GQA) |
| Parametros totales | 9.400.279.040 (9,4 mil millones) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | bf16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (GGUF) |
| Idiomas soportados | Ingles, chino |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16) y GGUF |

## Arquitectura y entrenamiento

El modelo original, GLM-4.6V-Flash, es un VLM de 9 mil millones de parámetros desarrollado por Z.AI, con una torre visual (ViT de 24 capas, 1536 dimensiones, 12 cabezas) que inyecta tokens blandos en el stream de embeddings del decoder mediante `masked_scatter`. En esta conversión se han eliminado los 181 tensores correspondientes a esa torre visual (que suman 892.498.432 parámetros, un 8,67% del modelo), dejando únicamente el decoder de texto. No se ha realizado ningún entrenamiento adicional: la extracción es puramente estructural y la verificación confirma que la salida textual es idéntica a la del modelo original, con divergencia máxima de 0.0 en logits.

El decoder resultante es un transformer estándar de 40 capas con 4096 de dimensión oculta, 13.696 de dimensión intermedia, 32 cabezas de atención y 2 cabezas KV (GQA 16:1), con un vocabulario de 151.552 tokens y un `lm_head` sin compartir pesos. La única peculiaridad relevante es la posición rotatoria: el modelo usa RoPE multimodal (`mrope_section: [8, 12, 12]`), que en la entrada de texto puro colapsa a RoPE estándar, como se ha verificado experimentalmente. Los pesos se distribuyen en safetensors bf16 y en cuantizaciones GGUF.

## Capacidades

- Generación de texto en inglés y chino, con razonamiento conversacional de varios turnos.
- Generación de código (Python, JavaScript, etc.) y asistencia en tareas de programación.
- Resolución de problemas matemáticos y de lógica.
- Capacidad de llamada a herramientas (function calling) nativa, heredada del modelo base.
- Soporte de agentes y razonamiento multi-paso gracias a su ventana de contexto de 131K tokens.
- No soporta entrada de imágenes ni visión (se ha eliminado la torre visual).
- No dispone de modo de "thinking" explícito, pero puede razonar de forma encadenada si se le solicita.

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede mantener conversaciones multi-turno con contexto largo (hasta 131K tokens) y en dos idiomas, lo que permite atender consultas complejas sin perder el hilo. Su licencia MIT permite integrarlo en sistemas comerciales.
- **Generación de código en producción**: con soporte de function calling, puede integrarse en pipelines de CI/CD para autogenerar documentación de código, tests unitarios o parches, siempre que se le proporcionen instrucciones claras.
- **Análisis de documentos largos**: su ventana de 131K tokens permite resumir o extraer información de informes técnicos, artículos o libros completos de texto, sin necesidad de dividirlos en fragmentos.
- **Asistentes de investigación**: el modelo puede ayudar a investigadores a explorar literatura científica, resumir papers y generar hipótesis, con la ventaja de una licencia permisiva para su uso en proyectos de investigación.
- **Chatbots locales y privados**: al ser un modelo de 9B y estar disponible en cuantizaciones GGUF, puede desplegarse en servidores domésticos o en el edge con Ollama o llama.cpp, garantizando privacidad de datos.
- **Agentes de automatización**: su capacidad de llamada a herramientas y su contexto largo lo hacen adecuado para construir agentes que ejecutan tareas multi-paso (por ejemplo, navegar por APIs, consultar bases de datos y generar informes).
- **Traducción y transcripción**: el modelo soporta inglés y chino, y puede utilizarse para traducción de textos técnicos o comerciales entre ambos idiomas, con calidad razonable para un modelo de 9B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este modelo. La model card solo proporciona la verificación de equivalencia bit-exact con el modelo original GLM-4.6V-Flash en tareas de texto, pero no hay datos de MMLU, HumanEval, GSM8K ni otros estándares. Se recomienda consultar la documentación de Z.AI sobre GLM-4.6V-Flash para conocer el rendimiento del modelo base en estas tareas.

## Requisitos de hardware

- **VRAM estimada para inferencia**:
  - bf16 (18.80 GB): requiere una GPU con al menos 20 GB de VRAM (por ejemplo, RTX 4090, A100 40GB, H100).
  - Q8_0 (10.00 GB): cabe en GPUs con 12 GB de VRAM (RTX 3060 12GB, RTX 4070).
  - Q6_K (8.27 GB): similar a Q8_0, cabe en GPUs de 10-12 GB.
  - Q5_K_M (7.05 GB): cabe en GPUs de 8 GB (RTX 3070, RTX 4060).
  - Q4_K_M (6.17 GB): cabe en GPUs de 8 GB, como la RTX 3080 o RTX 4070.
- **GPUs recomendadas**: para bf16, NVIDIA A100/H100 o RTX 4090. Para cuantizaciones GGUF, cualquier GPU con al menos 8 GB de VRAM.
- **Opciones de despliegue**:
  - Transformers (v4.52+): con `AutoModelForCausalLM`, se puede cargar en bf16 con `device_map="auto"`.
  - llama.cpp: mediante el repositorio GGUF, con `llama-cli -hf sartajbhuvaji/GLM-4.6-Flash-text-GGUF:Q4_K_M`.
  - Ollama: se puede usar con `ollama run hf.co/sartajbhuvaji/GLM-4.6-Flash-text-GGUF`.
  - vLLM y TGI: compatibles con el formato safetensors, aunque no se ha verificado oficialmente.
- **Latencia y throughput**: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| GLM-4.6-Flash-text (este) | 9,4B | 131K | MIT | Texto solo, extraído de GLM-4.6V-Flash |
| GLM-4.6V-Flash (original) | 10,3B | 128K | MIT | Multimodal (texto+imagen) |
| Qwen2.5-7B-Instruct | 7,6B | 128K | Apache 2.0 | Modelo denso de texto, sin visión |
| Llama-3.1-8B-Instruct | 8,0B | 128K | Llama 3.1 Community | Modelo denso de texto, sin visión |

El modelo se sitúa en la misma categoría de tamaño que Qwen2.5-7B y Llama-3.1-8B, pero con una ventana de contexto ligeramente mayor (131K vs 128K) y una licencia MIT más permisiva que la de Llama 3.1. No se dispone de comparativas de rendimiento reales, por lo que la elección entre ellos dependerá de los requisitos de licencia y de la integración con el ecosistema GLM.

## Limitaciones y advertencias

- **No es un modelo oficial de Z.ai**: es una conversión de terceros sin soporte oficial. Aunque la verificación indica que el texto es bit-exact con el original, no hay garantías de mantenimiento ni de actualizaciones.
- **Sin capacidades de visión**: el modelo no puede procesar imágenes, lo que limita su uso en tareas multimodales. Si se necesita visión, hay que usar el GLM-4.6V-Flash original.
- **Sesgos y alucinaciones**: como todo modelo de lenguaje, puede generar contenido factualmente incorrecto o sesgado, especialmente en contextos de baja frecuencia de datos de entrenamiento.
- **Idiomas limitados**: solo se declaran inglés y chino. El rendimiento en otros idiomas puede ser inferior.
- **Dependencia de la versión de Transformers**: requiere una versión que incluya `Glm4ForCausalLM` (v4.52+), lo que puede limitar el despliegue en entornos con versiones antiguas.
- **Sin benchmarks publicados**: no se han proporcionado resultados de evaluación estándar, por lo que el rendimiento real en tareas específicas no está verificado.
- **Riesgo de sobreajuste a la conversión**: aunque se ha verificado la equivalencia bit-exact, cualquier modificación futura del modelo base podría no reflejarse en esta conversión.

## Enlaces

- [HuggingFace - sartajbhuvaji/GLM-4.6-Flash-text](https://huggingface.co/sartajbhuvaji/GLM-4.6-Flash-text)
- [HuggingFace - sartajbhuvaji/GLM-4.6-Flash-text-GGUF](https://huggingface.co/sartajbhuvaji/GLM-4.6-Flash-text-GGUF)
- [HuggingFace - zai-org/GLM-4.6V-Flash](https://huggingface.co/zai-org/GLM-4.6V-Flash)
- [Documentación de Z.ai - GLM-4.6V](https://docs.z.ai/guides/vlm/glm-4.6v)
- [Documentación de Z.ai - GLM-4.6](https://docs.z.ai/guides/llm/glm-4.6)
- [Análisis de GLM-4.6V-Flash en aimodels.fyi](https://www.aimodels.fyi/models/huggingFace/glm-4.6v-flash-zai-org)</think>## Resumen

GLM-4.6-Flash-text es una conversión no oficial del modelo multimodal GLM-4.6V-Flash de Z.AI, en la que se ha eliminado quirúrgicamente el componente de visión (un ViT de 24 capas) para obtener un modelo exclusivamente de texto. El autor, sartajbhuvaji, ha extraído los 523 tensores restantes y los ha re-mapeado sobre la arquitectura `Glm4ForCausalLM`, sin reentrenamiento ni destilación. El resultado es un modelo denso de 9.400 millones de parámetros (frente a los 10.293 millones del original) que conserva el comportamiento textual del modelo base de forma bit-exacta, verificada con una divergencia máxima de 0.0 en logits para prompts de hasta 1.207 tokens.

La relevancia de este modelo radica en que ofrece las mismas capacidades de generación de texto, razonamiento y código que GLM-4.6V-Flash, pero con un peso menor (18.80 GB en bf16 frente a 20.59 GB) y sin dependencias de procesamiento visual. Esto simplifica el despliegue en entornos de producción que solo requieren texto, y reduce los requisitos de VRAM. Además, se publican cuantizaciones GGUF (desde F16 hasta Q4_K_M) para su uso con llama.cpp y Ollama, lo que permite ejecutarlo en hardware de consumo. La licencia MIT facilita su integración comercial sin restricciones.

El modelo mantiene la ventana de contexto nativa de 131.072 tokens, la arquitectura de 40 capas con atención GQA (16:1) y el vocabulario de 151.552 tokens del modelo original. Es una opción atractiva para desarrolladores que necesitan un modelo de 9B parámetros con contexto largo y licencia permisiva, sin la complejidad de un sistema multimodal.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glm4ForCausalLM (decoder-only transformer con GQA) |
| Parametros totales | 9.400.279.040 (9,4 mil millones) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | bf16, F16 GGUF, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Ingles, chino |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16) y GGUF |

## Arquitectura y entrenamiento

El modelo original, GLM-4.6V-Flash, es un VLM de 9 mil millones de parámetros desarrollado por Z.AI, con una torre visual (ViT de 24 capas, 1536 de dimensión, 12 cabezas) que inyecta tokens visuales en el flujo de embeddings del decoder mediante `masked_scatter`. En esta conversión se han eliminado los 181 tensores de visión (que suman 892.498.432 parámetros, un 8,67% del modelo), dejando únicamente el decoder de texto. No se ha realizado ningún entrenamiento adicional: la extracción es puramente estructural y la verificación confirma que la salida textual es idéntica a la del modelo original, con divergencia máxima de 0.0 en logits.

El decoder resultante es un transformer estándar de 40 capas con 4096 de dimensión oculta, 13.696 de dimensión intermedia, 32 cabezas de atención y 2 cabezas KV (GQA 16:1), con un vocabulario de 151.552 tokens y `lm_head` sin compartir pesos. La única particularidad relevante es el uso de RoPE multimodal (`mrope_section: [8, 12, 12]`), que en entradas de texto puro colapsa a RoPE estándar, como se ha verificado experimentalmente. Los pesos se distribuyen en safetensors bf16 y en cuantizaciones GGUF, todas cargables bajo llama.cpp con arquitectura `glm4`.

## Capacidades

- Generación de texto en inglés y chino, con razonamiento conversacional multiturno.
- Generación de código (Python, TypeScript, etc.) y asistencia en tareas de programación.
- Resolución de problemas matemáticos y de lógica básica.
- Soporte de function calling nativo, heredado del modelo base.
- Capacidad de razonamiento multi-paso y uso en agentes, gracias a su ventana de contexto de 131K tokens.
- No soporta visión: no procesa imágenes ni documentos escaneados.
- No dispone de modo de "thinking" explícito, pero puede generar razonamiento encadenado si se le solicita.

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 131K tokens) y en inglés o chino, lo que permite atender consultas complejas sin perder el hilo. Su licencia MIT permite su uso comercial en sistemas de soporte.
- **Generación de código en producción**: el modelo soporta function calling y puede integrarse en pipelines de CI/CD para generar documentación de código, escribir tests unitarios o proponer parches. La ventana de contexto permite procesar repositorios completos en una sola pasada.
- **Análisis de documentos extensos**: su ventana de 131K tokens permite resumir informes técnicos, artículos de investigación o libros completos de texto sin dividir el contenido en fragmentos, lo que reduce el riesgo de perder información.
- **Asistentes de herramientas locales**: el modelo puede desplegarse en servidores domésticos o en nodos de edge con Ollama o llama.cpp, ofreciendo respuestas generativas sin dependencia de servicios en la nube y con privacidad de datos.
- **Agentes de automatización**: con su capacidad de function calling y su contexto largo, el modelo puede construir agentes que ejecutan tareas multi-paso, como consultar APIs, procesar resultados y generar informes.
- **Traducción técnica**: al estar entrenado en inglés y chino, el modelo puede traducir textos técnicos entre ambos idiomas, manteniendo coherencia en terminología especializada.
- **Generación de contenido estructurado**: el modelo puede crear resúmenes, esquemas o informes a partir de datos textuales extensos, útil para periodistas de datos o analistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este modelo. La verificación realizada por el autor confirma que la salida textual es bit-exacta con la del modelo original GLM-4.6V-Flash, pero no se proporcionan métricas de MMLU, HumanEval, GSM8K u otros estándares. Para conocer el rendimiento del modelo base en estas tareas, se recomienda consultar la documentación de Z.AI sobre GLM-4.6V-Flash.

## Requisitos de hardware

- **VRAM estimada para inferencia**:
  - bf16 (18.80 GB): requiere una GPU con al menos 20 GB de VRAM, como una NVIDIA RTX 4090, A100 80GB o H100.
  - Q8_0 (10.00 GB): cabe en una GPU de 12 GB, como RTX 3060 12GB o RTX 4070.
  - Q6_K (8.27 GB): cabe en GPUs de 10-12 GB, como RTX 3080 o RTX 4070.
  - Q5_K_M (7.05 GB): cabe en GPUs de 8 GB, como RTX 3070 o RTX 4060.
  - Q4_K_M (6.17 GB): cabe en GPUs de 6-8 GB, como RTX 3090 o RTX 4060.
- **GPU recomendadas**: para bf16, NVIDIA A100/H100 o RTX 4090; para cuantizaciones GGUF, cualquier GPU con al menos 6 GB de VRAM.
- **Opciones de despliegue**:
  - Transformers (v4.52+): `AutoModelForCausalLM` con `dtype=torch.bfloat16` y `device_map="auto"`.
  - llama.cpp: mediante el repositorio GGUF, con `llama-cli -hf sartajbhuvaji/GLM-4.6-Flash-text-GGUF:Q4_K_M`.
  - Ollama: `ollama run hf.co/sartajbhuvaji/GLM-4.6-Flash-text-GGUF`.
  - vLLM y TGI: compatibles con safetensors, aunque no se ha verificado oficialmente.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Nota |
|---|---|---|---|---|
| GLM-4.6-Flash-text (este) | 9,4B | 131K | MIT | Texto solo, extraido de GLM-4.6V-Flash |
| GLM-4.6V-Flash (original) | 10,3B | 128K | MIT | Multimodal (texto+imagen) |
| Qwen2.5-7B-Instruct | 7,6B | 128K | Apache 2.0 | Modelo de texto, con function calling |
| Llama-3.1-8B-Instruct | 8,0B | 128K | Llama 3.1 License | Modelo de texto, con function calling |

El modelo se sitúa en la misma categoría de tamaño que Qwen2.5-7B y Llama-3.1-8B, con una ventana de contexto ligeramente superior (131K vs 128K) y una licencia MIT más permisiva que la de Llama 3.1. No se dispone de comparativas de rendimiento publicadas, por lo que la elección dependerá de la compatibilidad con el ecosistema GLM, la licencia y los requisitos de contexto.

## Limitaciones y advertencias

- **No es un modelo oficial de Z.AI**: es una conversión de terceros, sin soporte oficial ni garantías de mantenimiento. La bit-exactitud verificada solo cubre el momento de la conversión.
- **Sin capacidades de visión**: el modelo no puede procesar imágenes, por lo que no es adecuado para tareas multimodales. Para ello se debe usar el GLM-4.6V-Flash original.
- **Sesgos y alucinaciones**: como todo modelo de lenguaje, puede generar información falsa o sesgada, especialmente en dominios poco representados en su entrenamiento.
- **Idiomas limitados**: solo se cubren inglés y chino; el rendimiento en otros idiomas puede ser degradado.
- **Requisitos de versiones**: requiere Transformers v4.52 o superior para usar `Glm4ForCausalLM`, lo que puede limitar el despliegue en entornos con versiones antiguas.
- **Sin benchmarks publicados**: no se han proporcionado evaluaciones estándar, por lo que el rendimiento real en tareas específicas no está verificado.
- **Riesgo de obsolescencia**: al ser una conversión no oficial, es posible que no se actualice con futuras mejoras del modelo original.

## Enlaces

- [HuggingFace - sartajbhuvaji/GLM-4.6-Flash-text](https://huggingface.co/sartajbhuvaji/GLM-4.6-Flash-text)
- [HuggingFace - sartajbhuvaji/GLM-4.6-Flash-text-GGUF](https://huggingface.co/sartajbhuvaji/GLM-4.6-Flash-text-GGUF)
- [HuggingFace - zai-org/GLM-4.6V-Flash](https://huggingface.co/zai-org/GLM-4.6V-Flash)
- [Documentacion de Z.AI - GLM-4.6V](https://docs.z.ai/guides/vlm/glm-4.6v)
- [Documentacion de Z.AI - GLM-4.6](https://docs.z.ai/guides/llm/glm-4.6)
- [Analisis de GLM-4.6V-Flash en aimodels.fyi](https://www.aimodels.fyi/models/huggingFace/glm-4.6v-flash-zai-org)
