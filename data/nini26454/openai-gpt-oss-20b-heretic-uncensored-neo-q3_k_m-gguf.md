# NINI26454/OpenAi-GPT-oss-20b-HERETIC-uncensored-NEO-Q3_K_M-GGUF

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino una **recuantización en 3 bits (Q3_K_M) del fine-tune `DavidAU/OpenAi-GPT-oss-20b-HERETIC-uncensored-NEO-Imatrix-gguf`**, que a su vez deriva del modelo abierto `gpt-oss-20b` de OpenAI. El autor del repo es el usuario `NINI26454`, que publica un único archivo GGUF de 12,3 GB más un `Modelfile` listo para Ollama. El objetivo declarado es ofrecer una versión ligera, ejecutable en hardware de consumo, de un modelo de ~20,9 mil millones de parámetros totales (dato real de safetensors del modelo base).

El modelo hereda la arquitectura del `gpt-oss-20b` original, un transformer disperso de mezcla de expertos (MoE) con aproximadamente 3,6 mil millones de parámetros activos por token y ventana de contexto de hasta 128 000 tokens según la documentación pública del modelo base. La etiqueta `uncensored` y el nombre `HERETIC`/`NEO` indican que la variante original de DavidAU ha sido modificada para reducir o eliminar los mecanismos de rechazo y el alineamiento de seguridad, algo habitual en la familia de fine-tunes tipo *abliterated*. La relevancia práctica es doble: por un lado permite ejecutar un MoE de 21B en equipos con 16-24 GB de VRAM; por otro, es un caso de estudio sobre la trazabilidad y la calidad de las recuantizaciones de terceros publicadas sin evaluación alguna.

La información disponible es muy limitada: la model card no documenta idiomas, contexto efectivo tras la cuantización, datos de entrenamiento ni resultados de benchmarks. El repositorio registra 0 descargas y 0 *likes*, y los resultados de la búsqueda web no aportan ninguna fuente técnica relevante (devuelven páginas genéricas de Microsoft, sin relación con el modelo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) heredado de `gpt-oss-20b`; no se detalla en la model card de este repo |
| Parametros totales | 20 914 757 184 (~20,9 mil millones) |
| Parametros activos | No disponible para este repo; el modelo base `gpt-oss-20b` activa ~3,6 mil millones por token según su documentación pública |
| Longitud de contexto | No disponible en la model card; el ejemplo de llama.cpp usa `-c 8192`. El modelo base declara hasta 128 000 tokens |
| Tipos de cuantizacion | Q3_K_M (3 bits, k-quant *medium*) con *imatrix*. El repo base de DavidAU ofrece otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (12,3 GB) + `Modelfile` de Ollama |
| Tamano del repositorio | 12,9 GB |
| Fecha de publicacion (metadatos de HuggingFace) | 11 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El proceso documentado es exclusivamente de **cuantización**, no de entrenamiento: se parte de un GGUF ya generado por DavidAU y se recuantiza a Q3_K_M. No hay ninguna información sobre el dataset, el número de tokens, la composición de los datos, ni sobre si hubo RLHF, DPO u otro ajuste por preferencias en la cadena de fine-tuning. Tampoco se documenta el procedimiento exacto aplicado para eliminar el alineamiento (el nombre `HERETIC` sugiere una modificación de las direcciones de rechazo, pero esto es una inferencia a partir de la nomenclatura, no un dato confirmado en la ficha).

Arquitectónicamente, lo que se hereda del `gpt-oss-20b` original es un transformer MoE con capas de atención alternadas (ventana deslizante corta y atención completa) y un formato de chat propio (*harmony*) con canales diferenciados para análisis y respuesta final. Es importante subrayar que la cuantización a 3 bits con `imatrix` reduce el tamaño a ~12,3 GB a costa de una pérdida de precisión no cuantificada: no existe ninguna evaluación publicada que compare esta recuantización con el modelo base, ni con la versión Imatrix de la que procede.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base.
- Razonamiento y resolución de problemas, con el modo de análisis interno (*thinking*) del formato harmony de `gpt-oss`.
- Generación de código, presumiblemente en Python y otros lenguajes, aunque no hay evaluación específica.
- Soporte de *tool calling* / *function calling* si se conserva el formato harmony del modelo original; no verificado en esta cuantización.
- Uso en flujos agénticos multi-paso, sujeto al soporte de herramientas del runtime empleado (llama.cpp, Ollama).
- Capacidades multilingües: no disponibles; la model card no declara idiomas y el modelo base está orientado principalmente al inglés.
- Modo "sin censura": se han eliminado o reducido los rechazos a peticiones que el modelo original bloquearía. Esta es una característica del fine-tune, no una capacidad adicional de razonamiento.
- No se declara visión, audio ni multimodalidad.

## Casos de uso

- **Despliegue local en estación de trabajo con GPU de consumo**: un desarrollador con una RTX 4090 (24 GB) puede cargar el GGUF de 12,3 GB con llama.cpp u Ollama y ejecutar un MoE de 21B sin conexión a servicios externos, algo imposible con los pesos sin cuantizar en ese hardware.
- **Prototipado de agentes con *tool calling* en local**: si el runtime respeta el formato harmony, el modelo puede insertarse en bucles de agente (llamada a API, lectura de resultado, nueva acción) con contexto suficiente para cadenas de varios pasos, sin coste por token.
- **Generación de código en entornos con requisitos de confidencialidad**: al ejecutarse en local, el código fuente nunca sale de la máquina, lo que encaja en auditorías internas o en dominios regulados.
- **Investigación sobre alineamiento y *red teaming***: la variante sin censura sirve como sujeto de estudio para medir qué contenido generan los modelos cuando se eliminan los rechazos, y como contraste frente al `gpt-oss-20b` original alineado.
- **Asistente conversacional embebido en aplicaciones de escritorio**: con 12,3 GB de pesos cabe en portátiles con GPU de 16 GB (con descarga parcial a CPU), permitiendo un asistente offline con licencia Apache 2.0 y sin dependencia de proveedores.
- **Generación creativa sin filtros editoriales**: escritura de ficción, guiones o roleplay donde los rechazos del modelo base resultan un obstáculo, asumiendo la responsabilidad sobre el contenido generado.
- **Evaluación comparativa de cuantizaciones**: útil como punto de partida en un experimento propio que mida la degradación de Q3_K_M frente a Q5_K_M o Q8_0, dado que no existe tal evaluación publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y los resultados de la búsqueda web no contienen datos técnicos sobre este modelo. Tampoco hay cifras de latencia o *throughput*. Cualquier comparación numérica con el `gpt-oss-20b` original sería especulativa y no debe asumirse: los fine-tunes "sin censura" suelen degradar el rendimiento en tareas de razonamiento y seguridad, y una cuantización a 3 bits introduce pérdida adicional no medida.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el archivo de pesos ocupa 12,3 GB. Sumando caché KV y sobrecarga del runtime, se necesitan aproximadamente 13,5-16 GB para contextos cortos (4k-8k tokens) y más de 20 GB para contextos largos según el tamaño de la caché del MoE.
- **GPU recomendadas**: RTX 4090 / RTX 3090 / RTX A6000 (24 GB) para ejecución íntegra en GPU con margen; A100 40 GB y H100 para servir varias instancias o contextos muy largos.
- **¿Cabe en GPU de consumo?**: sí en GPUs de 24 GB (RTX 3090, 4090, 5090) con contextos moderados; en GPUs de 16 GB (RTX 4080, 4070 Ti Super) requiere *offload* parcial de capas a CPU; en 8-12 GB solo con descarga mayoritaria a RAM, con caída fuerte de velocidad.
- **Opciones de despliegue**: llama.cpp (`llama-cli`, `llama-server`), Ollama mediante el `Modelfile` incluido, LM Studio, KoboldCpp y otras interfaces basadas en GGUF. vLLM y TGI no son adecuados para este archivo dado que el formato principal es GGUF de llama.cpp.
- **Latencia y throughput**: no disponibles. Dependerán por completo del ancho de banda de memoria de la GPU, del número de capas descargadas a CPU y del contexto configurado.
- **Instalación con Ollama** (según la model card): descargar el `.gguf` y el `Modelfile` en la misma carpeta y ejecutar `ollama create gpt-oss-20b-neo -f Modelfile` seguido de `ollama run gpt-oss-20b-neo`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| `NINI26454/OpenAi-GPT-oss-20b-HERETIC-uncensored-NEO-Q3_K_M-GGUF` (este modelo) | ~20,9B totales | No disponible | Q3_K_M (12,3 GB) | apache-2.0 | 0 descargas, 0 likes, ficha mínima | Recuantización sin evaluación; sin garantía de integridad del fine-tune |
| `DavidAU/OpenAi-GPT-oss-20b-HERETIC-uncensored-NEO-Imatrix-gguf` (base directa) | ~20,9B totales | No disponible | Varias, con imatrix | apache-2.0 | No disponible | Variante sin censura de referencia; sin benchmarks publicados |
| `gpt-oss-20b` de OpenAI (modelo original) | ~20,9B totales / ~3,6B activos | 128 000 tokens | MXFP4 | apache-2.0 | Ampliamente disponible | Alineamiento de seguridad intacto; ficha técnica y benchmarks publicados por OpenAI |

No se han encontrado en la búsqueda web otros modelos comparables con datos verificables; la comparación con alternativas como Qwen3-30B-A3B o Llama 3.x queda fuera del alcance de la información proporcionada.

## Limitaciones y advertencias

- **Ausencia total de alineamiento de seguridad**: la variante es explícitamente "sin censura". No incorpora rechazos ante peticiones dañinas, ilegales o peligrosas. No debe exponerse a usuarios finales sin una capa de moderación propia.
- **Riesgo de alucinación**: inherente a los modelos de esta familia; no se ha medido su tasa en esta cuantización ni en el fine-tune del que procede.
- **Trazabilidad incompleta**: la cadena es OpenAI → fine-tune sin censura de DavidAU → recuantización de `NINI26454`. No hay verificación independiente de que el GGUF resultante reproduzca fielmente el comportamiento del modelo original.
- **Pérdida por cuantización a 3 bits**: Q3_K_M degrada la calidad respecto a Q5_K_M, Q6_K o Q8_0, especialmente en tareas de razonamiento y en la generación de código. No existe una evaluación publicada que cuantifique esa pérdida.
- **Nombre potencialmente engañoso**: el identificador incluye "OpenAi" y "gpt-oss", pero el repositorio no está publicado por OpenAI ni avalado por la compañía. Es una recuantización de terceros.
- **Sin datos de idioma ni de contexto efectivo**: se desconoce el comportamiento en castellano y no se especifica la ventana de contexto que soporta la cuantización concreta.
- **Model card de baja calidad**: reproduce un fragmento de sesión de terminal (`ls -lh /teamspace/...`), lo que indica un proceso de publicación poco cuidado. El repositorio no incluye tarjeta de evaluación, ni ejemplos, ni métricas.
- **Licencia y uso comercial**: la licencia declarada es Apache 2.0, que permite uso comercial, pero el autor no puede garantizar la licencia de los datos de ajuste del fine-tune intermedio. La responsabilidad legal sobre el contenido generado recae íntegramente en quien despliega el modelo.
- **Sin soporte ni mantenimiento**: 0 descargas y 0 *likes* en el momento del análisis; no hay indicios de que el repositorio vaya a actualizarse o corregirse.
- **Fecha de publicación anómala**: los metadatos indican 11 de septiembre de 2026, posterior a la fecha de consulta; conviene tratar cualquier dato temporal del repositorio con escepticismo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/NINI26454/OpenAi-GPT-oss-20b-HERETIC-uncensored-NEO-Q3_K_M-GGUF
- Modelo base directo (DavidAU): https://huggingface.co/DavidAU/OpenAi-GPT-oss-20b-HERETIC-uncensored-NEO-Imatrix-gguf
- Modelo original de OpenAI (`gpt-oss-20b`): no disponible en la información proporcionada
- Paper, blog técnico o repositorio de código asociado: no disponible
- Demo o espacio de inferencia: no disponible

Nota: los resultados de la búsqueda web realizados no devolvieron ninguna fuente relacionada con el modelo (únicamente páginas corporativas de Microsoft sin relación con el contenido). No se ha podido verificar información adicional fuera de la facilitada.
