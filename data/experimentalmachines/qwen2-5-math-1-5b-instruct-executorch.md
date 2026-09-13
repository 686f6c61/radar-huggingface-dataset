# experimentalmachines/Qwen2.5-Math-1.5B-Instruct-ExecuTorch

## Resumen

Qwen2.5-Math-1.5B-Instruct-ExecuTorch es una exportación cuantizada del modelo Qwen/Qwen2.5-Math-1.5B-Instruct (revisión `aafeb0fc6f22`) preparada por el usuario experimentalmachines para ejecución en dispositivo con el runtime ExecuTorch 1.4.0. No es un modelo nuevo: es un artefacto de despliegue que empaqueta el mismo transformer decoder-only de 1,5 mil millones de parámetros en ficheros `.pte` optimizados para la CPU de dispositivos arm64 (Android), mediante el backend XNNPACK.

El problema que resuelve es concreto: llevar un modelo de razonamiento matemático de 1,5 B a un teléfono móvil sin depender de servidores ni de conectividad, con un peso por fichero de entre 1,11 GB y 1,14 GB y una caché KV que se reserva íntegra al cargar el modelo. La ventana de contexto queda fijada dentro de cada fichero, de modo que el desarrollador debe elegir de antemano el tamaño de contexto que el dispositivo puede sostener; el autor publica ventanas de 2.048, 8.192 y 16.384 tokens y menciona exportaciones hasta 32.000.

Su relevancia es la del ecosistema de inferencia on-device en Android: es un ejemplo reproducible de cadena de exportación (ExecuTorch `export_llm`, cuantización 8da4w, int8 per-channel en embeddings) para un modelo especializado en matemáticas. El repositorio no ha generado tracción todavía (0 descargas y 0 likes en el momento de la consulta), por lo que debe tratarse como material experimental más que como artefacto de producción consolidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5), exportado a ExecuTorch |
| Parametros totales | 1.500 millones (1,5 B); modelo denso |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Fija por fichero: 2.048, 8.192 y 16.384 tokens en los ficheros publicados; el autor indica exportaciones desde 2k hasta 32k |
| Tipos de cuantizacion | 8da4w: activaciones int8 dinamicas, pesos de 4 bits en grupos de 32, embeddings int8 per-channel; cache KV en fp32 |
| Idiomas soportados | No disponible (la model card no detalla idiomas del modelo base) |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen2.5-Math-1.5B-Instruct) |
| Formato de pesos | `.pte` (ExecuTorch / XNNPACK) mas `tokenizer.json` |
| Tamano de los ficheros | 1,11 GB (2k), 1,12 GB (8k), 1,14 GB (16k) |
| Tamano del repositorio | 3,4 GB |
| Backend y runtime | XNNPACK (CPU), ExecuTorch 1.4.0, objetivo arm64 |
| Modelo base | Qwen/Qwen2.5-Math-1.5B-Instruct (relacion: `quantized`) |
| Pipeline | text-generation |
| Fecha de publicacion | 13 de septiembre de 2026 |

## Arquitectura y entrenamiento

El artefacto es una exportación, no un entrenamiento nuevo. La model card describe el procedimiento: se uso la herramienta `export_llm` de ExecuTorch 1.4.0 con activaciones int8 dinámicas y pesos de 4 bits agrupados en bloques de 32, embeddings int8 per-channel, XNNPACK con operaciones extendidas, chunk de prefill de 2.048 tokens y caché KV en fp32. El tokenizador se copia sin modificaciones del repositorio original. La build se generó en la ejecución 1 del repositorio ExperimentalMachines/executorch-model-exporter.

Un detalle técnico deducible de los datos publicados: la caché KV cuesta 57.344 bytes por token en fp32, lo que equivale a 14.336 elementos por token (K y V). Esa cifra es coherente con una arquitectura de 28 capas con 2 cabezas KV de dimensión 128 (atención con query groups). No se proporciona información sobre el corpus de entrenamiento del modelo base, el número de tokens vistos ni si hubo fases de RLHF o DPO; la model card del export se limita a documentar el proceso de cuantización y empaquetado.

## Capacidades

- Generación de texto autoregresiva con el tokenizador original de Qwen2.5, sin modificaciones.
- Especialización matemática heredada del modelo base Qwen2.5-Math-1.5B-Instruct (resolución de problemas y razonamiento paso a paso), si bien la model card del export no enumera capacidades concretas ni modos de prompting.
- Ejecución local en dispositivo arm64 sin conexión de red, con la caché KV reservada completa en memoria al cargar.
- Inferencia con vocabulario y pesos cuantizados a 4 bits, lo que reduce el tamaño a ~1,1 GB por fichero.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso orquestado: no documentado en la información disponible.
- Capacidades multilingües: no documentadas; solo se verifica la respuesta correcta a un prompt de prueba ("Paris").
- Capacidades especiales (modo thinking, visión, audio): no disponibles en esta exportación, que es exclusivamente de texto.

## Casos de uso

- Tutor de matemáticas sin conexión en Android: el modelo se integra en una aplicación que resuelve ejercicios paso a paso en el propio teléfono, útil en entornos sin cobertura o con requisitos de privacidad estrictos, gracias a que los pesos (`~1,11 GB` en la ventana de 2k) residen localmente.
- Asistente de estudio para cálculo y álgebra: con la ventana de 8.192 tokens el modelo puede mantener el enunciado completo de un problema con varios apartados y el desarrollo previo del alumno dentro del contexto, y devolver la corrección sin enviar datos a un servidor.
- Verificación de resultados en aplicaciones de ingeniería: dado un conjunto de datos numéricos y fórmulas, el modelo puede comprobar resultados y explicar el procedimiento en la propia app, empleando la ventana de 16.384 tokens cuando la tabla de datos es extensa.
- Prototipado de asistentes conversacionales en Android con elopenweights: la aplicación de referencia permite cargar los `.pte` y validar la experiencia de usuario antes de invertir en infraestructura de servidor.
- Generación de explicaciones didácticas para plataformas educativas: el modelo puede redactar la justificación de cada paso de una demostración matemática, con la ventaja de que el coste marginal de inferencia es cero una vez desplegado en el dispositivo.
- Pruebas de regresión de pipelines de exportación: el repositorio incluye `config.json` y `export-report-<window>.json` por fichero, de modo que sirve como caso de referencia para validar versiones de ExecuTorch, cuantizaciones 8da4w y presupuestos de memoria en arm64.
- Escenarios offline en campo (inspección, logística, educación rural): al no requerir red ni GPU, el modelo puede desplegarse en terminales Android estándar donde no se garantiza conectividad.
- Evaluación comparativa de cuantización: permite medir en un dispositivo real la degradación de precisión de una cuantización 4-bit en tareas matemáticas frente a los pesos originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es una prueba de humo (smoke test) superada en los tres ficheros XNNPACK, con la respuesta "Paris" al prompt de prueba. No hay datos de MMLU, GSM8K, MATH, HumanEval ni de latencia o throughput. La model card sí cuantifica el consumo de memoria de la caché KV, que se resume en la siguiente tabla.

| Ventana | Cache KV (bytes) | Cache KV (MB) | Tamano del fichero |
|---|---|---|---|
| 2.048 tokens | 117.440.512 | 117,4 | 1,11 GB |
| 8.192 tokens | 469.762.048 | 469,8 | 1,12 GB |
| 16.384 tokens | 939.524.096 | 939,5 | 1,14 GB |

El coste por token es constante: 57.344 bytes (56 KiB) en fp32, independientemente de la ventana elegida.

## Requisitos de hardware

- Memoria necesaria: peso del fichero (1,11-1,14 GB) más la caché KV completa, que se asigna al cargar. En la ventana de 2k el total ronda 1,23 GB; en 8k, unos 1,59 GB; en 16k, unos 2,08 GB.
- Presupuesto de referencia: el autor compara cada variante contra un presupuesto de 5 GB mediante el campo `fits_phone_budget` del `config.json` de cada carpeta.
- Plataforma objetivo: cualquier dispositivo arm64, típicamente smartphones Android de gama media o alta con al menos 4 GB de RAM libre para la ventana de 2k y más de 8 GB recomendados para 16k.
- GPU dedicadas (A100, H100, RTX 4090): no aplica a estos ficheros, que se ejecutan en CPU mediante XNNPACK. Para servir el modelo base en GPU habría que usar los pesos originales con otras herramientas, lo cual queda fuera del alcance de este repositorio.
- Opciones de despliegue: runtime de ExecuTorch 1.4.0 o superior y la aplicación Android openweights; los ficheros `.pte` no son compatibles con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este artefacto (Qwen2.5-Math-1.5B-Instruct-ExecuTorch) | 1,5 B | 2k / 8k / 16k fijos por fichero | `.pte` (ExecuTorch) | 8da4w, KV fp32 | Apache 2.0 | Publicado, 0 descargas |
| Qwen/Qwen2.5-Math-1.5B-Instruct (modelo base) | 1,5 B | Definido por el modelo original | safetensors (formato habitual de HuggingFace) | fp16/bf16 | Apache 2.0 | Publico en HuggingFace |
| Otras exportaciones ExecuTorch de modelos matematicos de ~1,5 B | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

La comparación relevante es entre el artefacto y su modelo base: idénticos parámetros y licencia, pero con el peso reducido de un orden de magnitud en tamaño de fichero a costa de una cuantización 4-bit y de una ventana de contexto fijada en tiempo de exportación.

## Limitaciones y advertencias

- Repositorio sin adopción verificada: 0 descargas y 0 likes en el momento de la consulta. No hay evidencia de uso en producción ni de validación por terceros.
- Validación mínima: la única prueba reportada es un smoke test con la respuesta "Paris". No hay evaluación de calidad matemática tras la cuantización 4-bit.
- Memoria pico al cargar: la caché KV se reserva completa, de modo que un fichero de 16k exige cerca de 2,1 GB solo para el modelo en memoria, además del proceso de la aplicación y del sistema operativo.
- Contexto no ampliable en tiempo de ejecución: para cambiar de ventana hay que cargar otro fichero `.pte`; no se puede truncar ni extender dinámicamente.
- Degradación esperada por cuantización: los pesos de 4 bits agrupados en bloques de 32 pueden afectar a la precisión en cadenas de razonamiento largo, un punto crítico en un modelo especializado en matemáticas.
- Riesgo de alucinación: no se documentan medidas específicas de mitigación; en tareas matemáticas un resultado erróneo puede presentarse con formato correcto y resultar difícil de detectar sin verificación externa.
- Idiomas: no se especifica qué idiomas soporta la exportación; no debe asumirse un rendimiento equivalente en castellano al del modelo base sin evaluarlo.
- Tool calling y agentes: no documentados; no conviene planificar integraciones que dependan de function calling con este artefacto.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, con obligación de conservar los avisos de licencia y de atribución. Los ficheros `LICENSE` del repositorio original se incluyen sin cambios.
- Dependencia de versión: los `.pte` están atados a ExecuTorch 1.4.0; versiones distintas del runtime pueden no ser compatibles.
- Fecha de publicación futura (2026) respecto al conocimiento habitual del ecosistema: conviene verificar la vigencia de las herramientas citadas antes de integrarlas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/experimentalmachines/Qwen2.5-Math-1.5B-Instruct-ExecuTorch
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B-Instruct/blob/main/LICENSE
- Aplicacion Android openweights: https://github.com/alpharomercoma/openweights
- Registro de la exportacion (run 1): https://github.com/ExperimentalMachines/executorch-model-exporter/actions/runs/34753863094
