# dlhocker/gemma-text-to-sql

## Resumen

`dlhocker/gemma-text-to-sql` es un ajuste fino (fine-tuning) supervisado del modelo `google/gemma-3-1B-it`, publicado en Hugging Face por el usuario `dlhocker`. El objetivo declarado por el nombre del repositorio es la traducción de lenguaje natural a SQL (text-to-SQL), aunque la model card no documenta el conjunto de datos de entrenamiento, el formato de las muestras ni los resultados obtenidos. Se entrenó con la librería TRL mediante SFT (supervised fine-tuning), según los metadatos del repositorio.

El modelo hereda la arquitectura y el tamaño del modelo base: la familia Gemma 3 de Google, en su variante de aproximadamente 1.000 millones de parámetros. El repositorio ocupa 3,7 GB en formato safetensors, lo que es coherente con pesos en precisión de 16 bits para un modelo de ese orden de magnitud. Al derivar de `gemma-3-1B-it`, se trata de un modelo instructivo, no de una base preentrenada, por lo que el ajuste fino parte de un modelo ya alineado para seguir instrucciones.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada, sin idiomas declarados y sin benchmarks publicados. Sirve como ejemplo de ajuste fino ligero sobre Gemma 3 para una tarea concreta y como caso de estudio de las precauciones que hay que tomar al evaluar modelos comunitarios sin documentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de google/gemma-3-1B-it) |
| Parametros totales | aproximadamente 1.000 millones (modelo base gemma-3-1B-it; no se detalla en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la model card no la especifica; depende del modelo base) |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye el campo `licence: license` sin concretar; el modelo base Gemma tiene su propia licencia de uso) |
| Formato de pesos | safetensors (3,7 GB en el repositorio) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint instructivo `google/gemma-3-1B-it`. No se aporta información sobre modificaciones arquitectónicas: se asume la arquitectura del modelo base, un transformer decoder-only de la familia Gemma 3. La model card no indica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas adicionales como DPO, RLHF o decodificación especulativa.

El entrenamiento se realizó con SFT usando TRL 1.14.1, Transformers 5.12.1, PyTorch 2.11.0, Datasets 5.0.1 y Tokenizers 0.22.2. Estos números de versión son llamativamente altos respecto a las versiones estables habituales en el ecosistema, lo que sugiere un entorno de entrenamiento muy reciente o versiones de desarrollo; conviene verificar la compatibilidad al reproducir la inferencia. No se documenta la hiperparametrización (learning rate, épocas, batch size, esquema de enmascarado de pérdida) ni el dataset text-to-SQL empleado, lo que impide evaluar la calidad o el sesgo del ajuste.

## Capacidades

- Generación de texto instructivo, heredada del modelo base `gemma-3-1B-it`.
- Generación de consultas SQL a partir de instrucciones en lenguaje natural, según el propósito declarado en el nombre del repositorio; no se documenta el dialecto SQL soportado ni el esquema de validación.
- Seguimiento de instrucciones conversacionales en formato chat (la model card muestra un ejemplo con `pipeline` y mensajes con rol `user`).
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (thinking mode, visión, audio): no documentadas; el modelo base es de texto.

## Casos de uso

- Generación asistida de consultas SQL en herramientas internas de análisis: el modelo puede convertir una pregunta en lenguaje natural en una sentencia SQL para que un analista la revise antes de ejecutarla. Es adecuado por su tamaño reducido, que permite desplegarlo en local, pero requiere validación humana dado que no hay benchmarks publicados.
- Autocompletado de consultas en editores SQL: integrado como servicio ligero detrás de un editor, puede sugerir cláusulas `SELECT`, `JOIN` o filtros a partir de una descripción textual. Su tamaño de 1B facilita baja latencia en CPU o GPU modesta.
- Prototipado rápido de interfaces text-to-SQL: para equipos que quieran validar una idea de producto sin depender de APIs externas, el modelo se puede cargar con `transformers` y `device_map="auto"` en una sola GPU.
- Enseñanza y demostraciones de ajuste fino: sirve como ejemplo reproducible de SFT con TRL sobre un modelo Gemma 3 pequeño, útil en cursos o talleres sobre fine-tuning.
- Generación de consultas de exploración sobre esquemas pequeños: para bases de datos con pocas tablas, el modelo puede proponer consultas de agregación o filtrado que el usuario ajusta manualmente.
- Filtrado y preprocesado en pipelines de datos: puede generar consultas de selección para extraer subconjuntos de datos según criterios descritos en lenguaje natural, siempre con revisión posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB en fp16 para un modelo de 1B de parámetros; en cuantización de 8 bits, alrededor de 1-1,5 GB; en 4 bits, menos de 1 GB (estimaciones basadas en el tamaño del modelo, no en mediciones del repositorio).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. También es viable en CPU para cargas ligeras.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas consumer con 4 GB o más de VRAM.
- Opciones de despliegue: `transformers` con `pipeline` (según la model card), vLLM, TGI o llama.cpp si se generan pesos GGUF (no se proporcionan en el repositorio). Ollama requeriría convertir los pesos a GGUF.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| dlhocker/gemma-text-to-sql | ~1B | no disponible | no disponible | Hugging Face, 0 descargas | Ajuste fino SFT de gemma-3-1B-it para text-to-SQL |
| google/gemma-3-1B-it | ~1B | no disponible en esta ficha | licencia Gemma | Hugging Face, modelo base oficial | Modelo instructivo generalista |
| Defog/sqlcoder-7b-2 | ~7B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face | Modelo especializado en text-to-SQL, mayor tamaño |
| NumbersStation/nsql-350M | ~350M | no disponible en esta ficha | no disponible en esta ficha | Hugging Face | Modelo pequeño especializado en SQL |

La comparativa se limita a parámetros y disponibilidad; no hay datos de rendimiento publicados para el modelo evaluado que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No hay benchmarks ni métricas de evaluación publicadas: se desconoce la precisión real en tareas text-to-SQL.
- No se documenta el dataset de entrenamiento, lo que impide evaluar sesgos, cobertura de dialectos SQL o posibles sobreajustes al esquema de entrenamiento.
- Riesgo de alucinación: como todo modelo generativo, puede producir consultas SQL sintácticamente válidas pero semánticamente incorrectas o referencias a tablas y columnas inexistentes.
- Licencia no declarada: el campo `licence: license` de la model card no concreta términos. Además, al derivar de Gemma 3, se aplican las condiciones de la licencia Gemma del modelo base, que deben revisarse antes de cualquier uso comercial.
- Idiomas no declarados: no se garantiza un comportamiento correcto en castellano ni en otros idiomas distintos del inglés.
- Contexto no documentado: se desconoce la ventana máxima soportada, lo que limita el diseño de prompts con esquemas de base de datos extensos.
- Repositorio sin tracción (0 descargas, 0 likes) y sin mantenimiento documentado: no hay garantías de soporte ni de correcciones.
- El ejemplo de la model card usa una pregunta genérica de conversación, no una consulta text-to-SQL, lo que sugiere que la documentación no está adaptada al propósito declarado del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dlhocker/gemma-text-to-sql
- Modelo base: https://huggingface.co/google/gemma-3-1B-it
- TRL (librería de entrenamiento): https://github.com/huggingface/trl
- Documentación de Transformers: https://huggingface.co/docs/transformers
