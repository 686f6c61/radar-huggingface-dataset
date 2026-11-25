# reaperdoesntknow/Qwen3.5-0.8-Cyber-GGUF

## Resumen

Qwen3.5-0.8-Cyber-GGUF es una distribucion en formato GGUF del modelo Qwen/Qwen3.5-0.8B, publicada por el usuario reaperdoesntknow bajo el paraguas de su coleccion "CIx cybersecurity models". No se trata de un modelo entrenado desde cero, sino de una conversion y cuantizacion del modelo base de Qwen en varios niveles de precision, pensada para inferencia local en `llama.cpp` y Ollama. El repositorio incluye ademas un artefacto `mmproj` (proyector multimodal) en BF16, aunque la propia model card advierte que la ruta multimodal no ha sido validada de extremo a extremo.

El modelo base es un transformer denso de aproximadamente 752 millones de parametros (dato real de safetensors), lo que lo situa en la categoria de modelos de bolsillo para edge computing. La etiqueta "Cyber" debe interpretarse como nombre de variante del repositorio, no como una afirmacion verificada de capacidades en ciberseguridad: la model card indica explicitamente que no se documenta el dataset de fine-tuning ni se publican resultados de evaluacion.

Su relevancia practica reside en la escalera de cuantizaciones (de BF16 a Q2_K_L, entre 1,52 GB y 484 MB) y en la licencia Apache-2.0, que permite uso comercial sin restricciones adicionales. Es util para prototipado reproducible en hardware modesto y para comparar el impacto de la cuantizacion en la calidad de salida, pero no debe considerarse una fuente autoritativa para decisiones de seguridad, legales o medicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5); detalles internos no disponibles |
| Parametros totales | 752.393.024 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_K_M, Q2_K_L; proyector multimodal BF16-mmproj |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (conversion via Unsloth / llama.cpp) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base mas alla de su pertenencia a la familia Qwen3.5. Al tratarse de una cuantizacion, la arquitectura subyacente es la del modelo Qwen/Qwen3.5-0.8B: un transformer denso de 752 millones de parametros. No se dispone de informacion sobre numero de capas, dimensiones ocultas, mecanismo de atencion ni tipo de tokenizador en la informacion proporcionada.

Tampoco se documenta el proceso de entrenamiento: ni el numero de tokens, ni la composicion del dataset, ni si hubo fases de RLHF o DPO. La model card reconoce que "el dataset de fine-tuning y la receta de entrenamiento no estan documentados en los archivos publicos revisados". La unica innovacion tecnica registrada es el pipeline de conversion y cuantizacion mediante herramientas de Unsloth y `llama.cpp`, que produce la escalera de variantes GGUF. El artefacto `mmproj` sugiere la presencia de componentes de vision en la configuracion, pero sin validacion end-to-end declarada.

## Capacidades

- Generacion de texto conversacional, segun el tag `conversational` y el pipeline `text-generation`.
- Inferencia local en CPU y GPU mediante `llama.cpp` y Ollama.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de plantillas de chat via `--jinja` en `llama-cli`.
- Ruta multimodal potencial a traves del proyector `mmproj` incluido, no validada segun el autor.
- No se documentan capacidades especificas de tool calling, razonamiento multi-paso, matematicas avanzadas ni agentes.
- Capacidades multilingues no disponibles.

## Casos de uso

- Prototipado en hardware limitado: la variante Q4_K_M (529 MB) permite ejecutar el modelo en equipos con poca RAM o en Raspberry Pi, ideal para validar pipelines antes de escalar a modelos mayores.
- Comparacion de niveles de cuantizacion: el repositorio ofrece cinco variantes (BF16 a Q2_K_L) que permiten medir de forma reproducible la degradacion de calidad frente al ahorro de memoria en un mismo prompt set.
- Asistentes conversacionales offline: con Q8_0 (812 MB) se puede desplegar un chatbot local sin conexion en aplicaciones de escritorio o entornos air-gapped.
- Clasificacion y extraccion de texto simple: tareas de etiquetado, resumen corto o reformateo en pipelines batch donde el coste por token importa mas que la precision.
- Educacion e investigacion: estudio del efecto de la cuantizacion en modelos pequenos dentro de cursos de IA o trabajos academicos sobre eficiencia.
- Integracion en CI/CD como modelo de smoke test: verificar que un pipeline de inferencia (vLLM alternativo, `llama.cpp`, servidor compatible con OpenAI endpoints) funciona antes de conectar el modelo de produccion.
- Base para fine-tuning experimental: al ser Apache-2.0 y pequeno, sirve como punto de partida para ajustes especificos en dominios acotados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No benchmark results or comparison baselines are published in this repository".

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,6 GB para BF16, 0,9 GB para Q8_0, 0,7 GB para Q6_K, 0,6 GB para Q4_K_M y 0,5 GB para Q2_K_L (mas overhead del runtime).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no requiere A100 ni H100. Funciona en GTX 1650, RTX 3050, RTX 4090 o superiores sin aprovechar su capacidad.
- Cabe holgadamente en GPU consumer y en CPU-only.
- Opciones de despliegue: `llama.cpp` (`llama-cli`, `llama-server`), Ollama (`ollama run hf.co/...`), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8-Cyber-GGUF | 752 M | No disponible | Apache-2.0 | GGUF | Cuantizacion del base Qwen3.5-0.8B |
| Qwen/Qwen3.5-0.8B | 752 M | No disponible | Apache-2.0 | Safetensors | Modelo base original, sin cuantizar |
| Otros modelos <1B (p. ej. familias Llama, Gemma, Phi) | Variable | Variable | Variable | Multiples | Datos comparativos no disponibles en la informacion proporcionada |

La comparativa con alternativas de terceros no puede completarse con rigor porque no se dispone de benchmarks ni de especificaciones del modelo base en la informacion proporcionada.

## Limitaciones y advertencias

- La etiqueta "Cyber" no implica capacidades verificadas en ciberseguridad; es solo el nombre de la variante del repositorio.
- No hay benchmarks publicados; el rendimiento real es desconocido.
- El dataset de fine-tuning y la receta de entrenamiento no estan documentados.
- La ruta multimodal (proyector `mmproj`) no ha sido validada end-to-end; verificar localmente antes de depender de ella.
- La cuantizacion, especialmente Q2_K_L, puede degradar notablemente la calidad de salida.
- Riesgo de alucinacion, sesgos y salidas inseguras inherente a modelos pequenos; no usar como fuente autoritativa en decisiones de seguridad, legales, medicas u operativas.
- Idiomas soportados no documentados; el comportamiento multilingue es incierto.
- Longitud de contexto no disponible; no asumir ventanas largas.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre el modelo ni sobre el cumplimiento normativo derivado de su uso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3.5-0.8-Cyber-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Coleccion CIx cybersecurity models: https://huggingface.co/collections/reaperdoesntknow/cix-cybersecurity-models
- Herramienta de conversion (Unsloth): no se proporciona enlace especifico en la informacion disponible
- `llama.cpp`: no se proporciona enlace especifico en la informacion disponible
