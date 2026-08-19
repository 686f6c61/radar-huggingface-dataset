# oguzhanakkaya/poc-gguf-oob-read

## Resumen

`oguzhanakkaya/poc-gguf-oob-read` no es un modelo de IA funcional, sino un fichero de prueba de concepto (PoC) de seguridad que demuestra una vulnerabilidad de lectura fuera de límites (out-of-bounds read) en el cargador de ficheros GGUF de llama.cpp. El fichero `truncated_gguf.gguf`, de solo 128 bytes, contiene metadatos KV válidos pero declara una sección de datos tensoriales de 1 GB que no existe realmente en el archivo. Al cargarse mediante `gguf_init_from_file(no_alloc=true)`, la ruta por defecto de `llama_model_loader`, y posteriormente mapearse en memoria, el acceso a los datos tensoriales lee más allá de la región mapeada del fichero, provocando una lectura fuera de límites o un fallo SIGSEGV.

El autor, Oguzhan Akkaya, publicó este PoC como parte de una investigación de seguridad legítima. La vulnerabilidad está relacionada con CVE-2026-7482, un fallo de lectura heap out-of-bounds en el cargador GGUF de Ollama (versiones anteriores a 0.17.1) con una puntuación CVSS de 9.1, que permite a un atacante remoto no autenticado filtrar aproximadamente 2 MB de memoria heap por petición, incluyendo variables de entorno, claves de API y datos de conversaciones de otros usuarios. Este PoC concreto aborda el mismo vector en llama.cpp, y el autor propone un parche que añade validación del tamaño del fichero en `gguf_init_from_reader`.

El fichero se distribuye bajo licencia MIT y está etiquetado como `security`, `poc`, `gguf` y `oob-read`, con idioma inglés. No contiene pesos de modelo utilizables, por lo que no puede ejecutarse como un modelo de lenguaje, sino como un caso de prueba para verificar la corrección de la vulnerabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (fichero GGUF malformado de 128 bytes) |
| Parametros totales | 0 (sin pesos reales; declara 1 tensor F32 con ne[0]=268435456, equivalente a 1 GB) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | F32 (declarado en el tensor ficticio) |
| Idiomas soportados | en (etiqueta del repositorio; el contenido es tecnico) |
| Licencia | MIT |
| Formato de pesos | GGUF (truncado) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de un fichero GGUF malformado. La estructura del archivo incluye una cabecera GGUF válida con metadatos KV minimos y una tabla de tensores que declara un único tensor de 1 GB en formato F32. La sección de datos tensoriales está completamente ausente: el fichero termina justo después de la tabla de tensores. Al cargar el fichero con `gguf_init_from_file(no_alloc=true)`, el parser acepta la declaración del tensor sin verificar que el tamaño de la sección de datos no supere los bytes restantes del archivo. Cuando posteriormente se mapea el fichero en memoria (mmap) y se accede a los datos del tensor, la lectura se realiza fuera de la región mapeada, produciendo una fuga de información de las regiones de memoria adyacentes o un fallo de segmentación si no hay mapeo contiguo.

La corrección propuesta por el autor, publicada en un pull request para llama.cpp, añade una validación del tamaño del fichero en `gguf_init_from_reader` que rechaza cualquier fichero donde el tamaño calculado de la sección de datos tensoriales exceda los bytes restantes del archivo. La vulnerabilidad es análoga a CVE-2026-7482 en Ollama, que afecta al cargador GGUF de esta plataforma y fue corregida en la versión 0.17.1.

## Capacidades

El fichero PoC no tiene capacidades de modelo, pero la prueba de concepto demuestra los siguientes comportamientos en el software vulnerable:

- Lectura fuera de límites (OOB read) desde la región mmap del fichero, con fuga de información de mapeos de memoria adyacentes.
- Fallo de segmentación (SIGSEGV) si no existe ningún mapeo adyacente.
- Aceptación de un fichero GGUF con metadatos KV válidos pero con sección de datos truncada por `gguf_init_from_file(no_alloc=true)`.
- La misma técnica base permite reproducir CVE-2026-7482 en Ollama, donde la lectura OOB ocurre durante el proceso de cuantización (`quantize=F32`) en `/api/create`, filtrando memoria heap (variables de entorno, claves API, prompts de sistema, datos de conversaciones de usuarios concurrentes).
- El fichero incluye instrucciones de reproducción con llama.cpp compilado con AddressSanitizer (ASan) para detectar la lectura ilegal.

## Casos de uso

- Verificación de la corrección en llama.cpp: tras aplicar el parche del PR `fix-gguf-data-size`, se puede cargar el fichero `truncated_gguf.gguf` con `llama-cli` para confirmar que el parser rechaza el archivo antes de mapearlo en memoria.
- Prueba de regresión en cargadores GGUF: el fichero sirve como caso de prueba unitario para cualquier implementación de parser GGUF (llama.cpp, Ollama, llama-cpp-python, etc.) para detectar la falta de validación de tamaños.
- Auditoría de seguridad de infraestructuras que sirven modelos GGUF: permite evaluar si un servidor de inferencia (por ejemplo, Ollama) está expuesto a CVE-2026-7482 y si los filtros de validación de archivos están activos.
- Investigación de seguridad ofensiva: el PoC documenta la técnica de truncar la sección de datos de un GGUF para provocar lecturas OOB, utilizable en entornos de investigación autorizados para estudiar el impacto de la fuga de memoria.
- Desarrollo de herramientas de análisis estático de ficheros GGUF: el archivo sirve como muestra de entrada para herramientas que detectan anomalías en la estructura de ficheros de modelos.
- Formación en seguridad de cargadores de modelos: el PoC es un ejemplo didáctico de cómo una validación insuficiente de tamaños de sección en un formato binario puede conducir a vulnerabilidades de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El fichero no contiene pesos de modelo y no está diseñado para producir ninguna salida de inferencia, por lo que no se puede evaluar en tareas de lenguaje, razonamiento o código.

## Requisitos de hardware

- No requiere hardware específico para su ejecución: el fichero ocupa 128 bytes y se carga en memoria en milisegundos.
- Para la reproducción de la vulnerabilidad se necesita compilar llama.cpp con AddressSanitizer (`-DGGML_SANITIZE_ADDRESS=ON`) en modo Debug; una CPU estándar es suficiente.
- El impacto de la vulnerabilidad se manifiesta durante el mapeo mmap y el acceso a los datos del tensor, no durante la carga del fichero en sí.
- Para la explotación remota de CVE-2026-7482 en Ollama, el servidor debe estar expuesto en una red y se requiere una petición a `/api/create` con `quantize=F32`; no se requiere GPU para el ataque, pero sí en el servidor objetivo si este está configurado para inferencia.

## Comparativa con modelos similares

No aplicable: no existe una categoría de modelos comparable para un fichero PoC de seguridad. La comparativa relevante es con otras pruebas de concepto de la misma familia de vulnerabilidades:

| PoC | Plataforma | Vulnerabilidad | Impacto | Estado |
|---|---|---|---|---|
| `oguzhanakkaya/poc-gguf-oob-read` | llama.cpp | OOB read por sección de tensor truncada | Fuga de memoria, SIGSEGV | Corregida en el PR de llama.cpp |
| `oguzhanakkaya/poc-nlayer-oob-gguf` | llama.cpp | OOB read relacionado con el parámetro `n_layer` | Fuga de memoria | No detallado |
| `msuiche/gguf_cve2026_7482` | Ollama | Heap OOB read en el cargador GGUF | Fuga de ~2 MB de heap por petición (CVSS 9.1) | Corregida en Ollama 0.17.1 |
| `0x0OZ/CVE-2026-7482-PoC` | Ollama | Cadena de explotación de 1 día para CVE-2026-7482 | Fuga de memoria, escalada | Corregida en Ollama 0.17.1 |

## Limitaciones y advertencias

- El fichero no contiene pesos de modelo y no puede utilizarse para ninguna tarea de inferencia: es exclusivamente un artefacto de investigación de seguridad.
- El autor indica explícitamente que el PoC está destinado a investigación de seguridad autorizada; su uso en entornos no autorizados puede ser ilegal.
- La explotación de la vulnerabilidad puede provocar fugas de datos sensibles (variables de entorno, claves API, prompts de sistema, datos de conversaciones) si se ejecuta contra un servidor vulnerable como Ollama.
- El fichero puede causar fallos de segmentación en cargadores vulnerables, lo que puede interrumpir servicios en producción.
- La licencia MIT permite el uso y la modificación, pero no exime de responsabilidad legal por uso indebido.
- No se recomienda cargar este fichero en entornos de producción sin un sandbox aislado y sin autorización explícita.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/oguzhanakkaya/poc-gguf-oob-read
- Perfil del autor: https://huggingface.co/oguzhanakkaya
- PoC relacionado (n_layer OOB): https://huggingface.co/oguzhanakkaya/poc-nlayer-oob-gguf
- Repositorio de CVE-2026-7482 (análisis técnico): https://github.com/msuiche/gguf_cve2026_7482
- PoC de 1 día para CVE-2026-7482: https://github.com/0x0OZ/CVE-2026-7482-PoC
- Análisis técnico completo de CVE-2026-7482: https://www.eresussec.com/en/blog/ollama-cve-2026-7482-heap-oob-gguf-vulnerability
- PR de corrección en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/fix-gguf-data-size (referenciado en el README del PoC)
