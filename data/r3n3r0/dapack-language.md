# R3n3r0/dapack-language

## Resumen

dapack-language es un paquete de compresión de precisión graduada (graded precision) sobre el modelo base Qwen/Qwen3.5-35B-A3B, desarrollado por R3n3r0. El objetivo es reducir el tamaño del modelo de 21.2 GB a 10.7 GB (una reducción del ~49%) manteniendo todos los expertos de la arquitectura Mixture of Experts, pero asignando diferentes niveles de cuantización según la importancia de cada experto para tareas de lenguaje y texto general. De esta forma, los 143 expertos identificados como críticos para el dominio se conservan a q2_K, mientras que los 113 restantes se cuantizan a IQ2_XXS (2.06 bpw) bajo una matriz de importancia. El resultado es una degradación controlada fuera del dominio objetivo en lugar de una pérdida irreversible por poda.

El modelo se distribuye como un archivo GGUF que requiere un runtime específico llamado dapack, ya que incorpora dos tensores de expertos por capa (uno "frío" y otro "caliente") que el software estándar (llama.cpp, Ollama, LM Studio) no puede cargar. La licencia es MIT y los idiomas soportados son inglés e italiano. Está pensado para entornos donde el espacio en disco o VRAM es limitado y las tareas principales son generación de texto, razonamiento, traducción, tool calling y salida estructurada, con una pérdida deliberada y declarada en generación de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (basado en Qwen3.5-35B-A3B) |
| Parametros totales | no disponible (el modelo base indica 35B-A3B, sin confirmar) |
| Parametros activos | no disponible (el modelo base indica 3B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q2_K (143 expertos), IQ2_XXS a 2.06 bpw (113 expertos), precision graduada |
| Idiomas soportados | ingles, italiano |
| Licencia | MIT |
| Formato de pesos | GGUF (con tensores especiales dapack: `ffn_*_exps_cold` + `dapack.hot_experts_per_layer`) |

## Arquitectura y entrenamiento

El modelo es una compresión cuantizada del checkpoint original Qwen3.5-35B-A3B, no un entrenamiento desde cero. La técnica empleada, denominada "graded precision", clasifica los 256 expertos de cada capa (según la información disponible: 143 expertos se consideran críticos para el dominio de lenguaje y 113 no críticos) y les asigna niveles de cuantización distintos: q2_K para los críticos y IQ2_XXS (2.06 bpw) para los no críticos. A diferencia de la poda (deleting), los expertos sobrantes no se eliminan sino que se mantienen con menor precisión, lo que permite que el modelo degrade fuera del dominio en lugar de romperse. El coste computacional se mantiene: el presupuesto top-k se reparte entre los dos bancos de expertos, ejecutando exactamente 8 expertos por token (según la descripción del autor).

No se proporcionan datos sobre el proceso de entrenamiento, el dataset de calibración ni la metodología exacta de selección de expertos. El autor indica que los números de capacidades son "mediciones de comportamiento" incluidas en el manifiesto del paquete y que el router de dapack las utiliza como restricciones para enrutar peticiones a otros paquetes cuando una capacidad está degradada.

## Capacidades

- Generacion de texto y razonamiento: mantiene un 82.0% de convergencia en GSM8K con presupuesto de 4096 tokens (n=100), frente al 77.0% del modelo completo.
- Tool calling: 8/8 en pruebas de 8 sondas, igual que el modelo completo.
- Traduccion en→it: 100% de acierto en la medición.
- Instrucciones: 100% de cumplimiento (el modelo completo obtiene 80%).
- Contexto largo: 100% en prueba de aguja a 3000 tokens.
- Salida estructurada (JSON): 100%.
- Generacion de codigo: degradada al 17% (frente al 100% del modelo completo). El autor advierte explícitamente que no debe usarse para código.
- Capacidad multilingüe limitada a ingles e italiano.
- Requiere el runtime dapack para su ejecución; no es compatible con software estándar.

## Casos de uso

- Atencion al cliente automatizada en ingles e italiano: el modelo puede mantener conversaciones multi-turno con instrucciones precisas y salida estructurada, gracias a su 100% en instruction following y tool calling. Su tamaño reducido permite desplegarlo en hardware modesto.
- Traduccion automatica en→it: con un 100% de precisión medida, es adecuado para pipelines de traducción de documentos o contenido web, siempre que no se requiera código.
- Asistente de razonamiento y analisis: con un 82% en GSM8K, puede resolver problemas aritméticos y lógicos de nivel medio, útil en entornos educativos o de soporte a decisiones.
- Generacion de respuestas estructuradas (JSON): ideal para extracción de información, formularios automáticos o integración con APIs que requieran salidas validadas.
- Agentes conversacionales con tool calling: soporta 8/8 en sondas de herramientas, lo que permite integrarlo en asistentes que necesitan llamar a funciones externas (búsquedas, bases de datos, APIs).
- Procesamiento de texto largo: con un 100% en la prueba de aguja a 3000 tokens, puede manejar resúmenes de documentos extensos, análisis de contratos o revisión de informes, siempre que el contexto no exceda el límite real (no especificado).

## Benchmarks y rendimiento

La model card incluye mediciones de comportamiento propias, no benchmarks estándar externos. Se presentan a continuación tal como las reporta el autor:

| Capacidad | dapack-language (10.7 GB) | Modelo completo (21.2 GB) |
|---|---|---:|
| Razonamiento (GSM8K, 4096 tokens, n=100) | 82.0% | 77.0% |
| Tool calling (8 sondas) | 8/8 | 8/8 |
| Traduccion en→it | 100% | 100% |
| Instruction following | 100% | 80% |
| Contexto largo (needle @ 3k) | 100% | 100% |
| Salida estructurada (JSON) | 100% | 100% |
| Generacion de codigo | 17% | 100% |

Además, el autor compara la técnica de graded precision frente a la poda en dos arquitecturas:

| Mecanismo | Qwen3.5-35B | Qwen3-30B | Tools |
|---|---|---:|---:|---:|
| Expertos sobrantes eliminados | 79.0% | 40.0% | 7/8 |
| Expertos sobrantes a 2 bits | 82.0% | 93.3% | 8/8 |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K completos en la información disponible.

## Requisitos de hardware

- Tamaño del archivo: 10.7 GB, por lo que requiere al menos 12 GB de VRAM para cargar el modelo en GPU (considerando overhead).
- GPU recomendadas: no se especifican modelos concretos. El runtime dapack ofrece binarios precompilados para Linux x86_64 y ROCm (gfx1151, presumiblemente una GPU AMD). Para otras GPUs hay que compilar desde el repositorio.
- Compatibilidad: no funciona con llama.cpp, Ollama ni LM Studio estándar. Es imprescindible usar el runtime dapack (servidor web + API OpenAI + router).
- Opciones de despliegue: servidor dapack (`dapack serve`), que expone una interfaz web y una API compatible con OpenAI.
- Latencia y throughput: no disponibles. El autor indica que el coste computacional es idéntico al del modelo completo (8 expertos activos por token), pero no proporciona cifras.

## Comparativa con modelos similares

La comparación más relevante es con el propio modelo base sin comprimir y con otro modelo MoE de tamaño similar (Qwen3-30B) bajo la misma técnica de compresión. No se dispone de datos para comparar con otras alternativas comerciales o de código abierto.

| Modelo | Tamano | Razonamiento (GSM8K) | Tool calling | Codigo | Licencia | Runtime |
|---|---|---|---|---|---|---|
| dapack-language (graded) | 10.7 GB | 82.0% | 8/8 | 17% | MIT | dapack |
| Qwen3.5-35B-A3B (completo) | 21.2 GB | 77.0% | 8/8 | 100% | MIT (presumible) | estandar |
| Qwen3-30B (completo) | no disponible | 93.3% (con graded) | 8/8 | no disponible | no disponible | estandar |

Nota: los datos de Qwen3-30B provienen de la medición del autor con graded precision, no del modelo sin comprimir.

## Limitaciones y advertencias

- Generacion de codigo severamente degradada (17%): el autor declara explícitamente que no debe usarse para tareas de programación. Si se sirve el archivo de forma independiente, el router no protegerá al usuario.
- Requiere runtime propietario: el formato GGUF contiene tensores especiales que solo el runtime dapack puede cargar. No es compatible con el ecosistema estándar de llama.cpp, lo que limita la portabilidad y el mantenimiento.
- Idiomas limitados: solo inglés e italiano. No se garantiza un rendimiento aceptable en otros idiomas.
- Longitud de contexto no especificada: aunque la prueba de aguja a 3000 tokens da 100%, se desconoce el límite real del modelo base y, por tanto, del paquete.
- Datos de entrenamiento y calibración no publicados: no hay información sobre el dataset de calibración ni sobre posibles sesgos introducidos por la selección de expertos.
- Riesgo de alucinación: no se ha evaluado formalmente; como cualquier modelo de lenguaje, puede generar contenido plausible pero incorrecto, especialmente fuera del dominio de lenguaje general.
- Restricciones de uso comercial: la licencia MIT permite uso comercial, pero el runtime dapack puede tener sus propias condiciones (no especificadas en la model card).
- Riesgo de degradación fuera del dominio: aunque la técnica de graded precision reduce el impacto frente a la poda, las capacidades fuera del dominio (como código) colapsan. El router de dapack es imprescindible para evitar usos inapropiados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/R3n3r0/dapack-language
- Repositorio del runtime dapack: https://github.com/R3n3r0/dapack
- (No se encontraron papers, blogs o demos adicionales en la búsqueda web.)
