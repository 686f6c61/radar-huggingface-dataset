# elsauto/tosilos-128b-GGUF

## Resumen

Tosilos-128B es un modelo de lenguaje de gran tamaño (128B parámetros) desarrollado por Nesilabs como un fine-tune especializado en ciberseguridad sobre la base Mistral Medium 3.5. Este repositorio concreto, `elsauto/tosilos-128b-GGUF`, es una conversión comunitaria a formato GGUF realizada por el usuario "elsauto" para permitir su ejecución con llama.cpp y herramientas compatibles. No se trata de un modelo independiente, sino de una cuantización del checkpoint original en BF16 Safetensors.

La relevancia de esta conversión radica en que facilita el despliegue local de un modelo de 128B parámetros en sistemas con memoria unificada de aproximadamente 128 GB, algo que de otro modo requeriría hardware de servidor especializado. La cuantización Q3_K_M reduce el tamaño del archivo a unos 60,6 GB, lo que lo hace viable en estaciones de trabajo de gama alta. El modelo está orientado a tareas de ciberseguridad como pentesting autorizado, análisis de vulnerabilidades, DFIR y detección de amenazas, aunque su licencia y términos de uso no están claramente especificados en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral Medium 3.5 (transformer denso, no MoE) |
| Parametros totales | 125.025.988.608 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 32768 (configuracion probada; contexto nativo no disponible) |
| Tipos de cuantizacion | Q3_K_M (unica disponible en este repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se remite a la licencia del modelo original) |
| Formato de pesos | GGUF (Q3_K_M) |

## Arquitectura y entrenamiento

El modelo base es Mistral Medium 3.5, una arquitectura transformer densa de 128B parámetros. No se dispone de detalles sobre la arquitectura interna exacta (número de capas, heads, dimensiones) en la información proporcionada. El fine-tune original de Nesilabs se realizó sobre esta base para tareas de ciberseguridad, pero no se especifican los datos de entrenamiento, el número de tokens utilizados ni si se emplearon técnicas como RLHF o DPO.

La conversión a GGUF se realizó con llama.cpp (build 10398, commit `8e7f22b67`) a partir del checkpoint BF16 Safetensors. El proceso incluyó una conversión intermedia a BF16 GGUF y posterior cuantización a Q3_K_M. Se menciona que fue necesario actualizar a Transformers 5.15.0 para resolver problemas de compatibilidad del tokenizador con el backend `TokenizersBackend`.

## Capacidades

- Generacion de texto conversacional y analitico orientado a ciberseguridad.
- Analisis de vulnerabilidades y apoyo en tareas de pentesting autorizado.
- Soporte para red team y blue team (deteccion, respuesta a incidentes).
- Analisis forense digital y respuesta a incidentes (DFIR).
- Ingenieria de deteccion (creacion de reglas y firmas).
- Capacidades multilingues: no disponibles (se desconoce el alcance real).
- No se menciona soporte explicito para tool calling, agentes o modo thinking en la informacion disponible.

## Casos de uso

- Pentesting autorizado: el modelo puede asistir en la identificacion de vectores de ataque, generacion de payloads y analisis de resultados de escaneos, siempre dentro de un marco legal y con autorizacion explicita.
- Analisis de vulnerabilidades: dado un informe de escaneo o un fragmento de codigo, puede ayudar a priorizar riesgos y sugerir mitigaciones.
- Deteccion y respuesta (blue team): analisis de logs, correlacion de eventos y propuesta de reglas de deteccion para SIEM o EDR.
- Forensia digital (DFIR): apoyo en la interpretacion de artefactos, reconstruccion de lineas de tiempo y redaccion de informes tecnicos.
- Ingenieria de deteccion: generacion de firmas YARA, reglas Sigma o consultas de busqueda de amenazas.
- Formacion y documentacion: redaccion de guias tecnicas, procedimientos operativos y material educativo sobre ciberseguridad.
- Analisis de malware: asistencia en la revision de codigo malicioso, extraccion de indicadores de compromiso y explicacion de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo o su version cuantizada.

## Requisitos de hardware

- VRAM estimada: el archivo Q3_K_M ocupa ~60,6 GB, por lo que se necesita al menos esa cantidad de memoria disponible (unificada o VRAM) para cargar el modelo completo.
- GPU recomendadas: la configuracion probada usa una AMD Radeon 8060S Graphics integrada en un APU Ryzen AI MAX+ 395 con 128 GB de memoria unificada. En GPUs discretas, se requeriria una con al menos 64-80 GB de VRAM (por ejemplo, A100 80GB, H100 80GB) o multiples GPUs.
- En consumer GPU: no es viable en GPUs de consumo (RTX 4090 tiene 24 GB, insuficiente). Solo sistemas con memoria unificada grande o multiples GPUs profesionales.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), Ollama (si se importa el GGUF), u otros motores compatibles con GGUF.
- Rendimiento observado: aproximadamente 3,7 tokens/segundo en la configuracion probada (APU AMD, Vulkan, contexto 32K, KV cache Q8_0, full offload). La latencia y el throughput variaran segun hardware y configuracion.

## Comparativa con modelos similares

No se dispone de datos comparativos concretos. El modelo comparte tamano y enfoque con otros LLMs de 128B especializados en ciberseguridad, pero no hay informacion publica sobre benchmarks o metricas que permitan una comparacion rigurosa. Alternativas genericas de tamano similar (por ejemplo, Llama 3.1 70B o Mistral Large 2) no son directamente comparables por su distinto enfoque y licencia. Se recomienda consultar la ficha del modelo original para posibles comparaciones.

## Limitaciones y advertencias

- La cuantizacion Q3_K_M introduce perdida de precision respecto al modelo original BF16, lo que puede afectar a la calidad de las respuestas, especialmente en tareas complejas de razonamiento o generacion de codigo.
- El modelo esta disenado para ciberseguridad; su uso indebido (pentesting sin autorizacion, generacion de malware) es ilegal y eticamente cuestionable. Solo debe emplearse en entornos autorizados.
- La licencia del modelo original no esta especificada en este repositorio. Antes de cualquier uso comercial o redistribucion, es obligatorio revisar los terminos publicados por Nesilabs en el repositorio original.
- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de idioma. Al ser un modelo de 128B, puede presentar alucinaciones en contextos de alta incertidumbre, como cualquier LLM.
- El rendimiento de 3,7 tokens/segundo es bajo para aplicaciones interactivas en tiempo real; es adecuado para tareas offline o procesamiento por lotes.
- La configuracion de contexto de 32768 tokens es la probada, pero el contexto nativo del modelo base no se ha confirmado; reducir el contexto puede aliviar requisitos de memoria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/elsauto/tosilos-128b-GGUF
- Modelo original: https://huggingface.co/nesilabs/tosilos-128b
- llama.cpp: https://github.com/ggml-org/llama.cpp
