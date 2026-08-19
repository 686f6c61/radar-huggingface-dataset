# kingjones777/Qwen3.8-27B-ROCmFPX-Q8_0-GGUF

## Resumen

Qwen3.8-27B-ROCmFPX-Q8_0-GGUF es una cuantización de 8 bits en formato GGUF del modelo Qwen3.8-27B, un transformer de mezcla de expertos (MoE) de 26.9 mil millones de parámetros desarrollado por Qwen. Esta build concreta, publicada por el usuario kingjones777, utiliza el tipo de cuantización propietario ROCmFPX, diseñado exclusivamente para GPUs AMD con arquitectura gfx1151, en particular el acelerador integrado Ryzen AI MAX+ 395 (Strix Halo) con 128 GB de memoria unificada.

El archivo, de 25.92 GiB (8.28 bits por peso), se ha cuantizado directamente desde el GGUF BF16 original de 51.3 GiB, sin pasar por una requantización intermedia de menor precisión. Su relevancia radica en que demuestra que la memoria unificada de 128 GB de Strix Halo hace viable ejecutar una cuantización de 8 bits con calidad cercana al original, aunque a costa de un rendimiento inferior al de la variante de 4 bits del mismo autor (38.32 tok/s frente a 25.07 tok/s).

La build incluye un cabezal de borrador MTP (multi-token prediction) que multiplica la velocidad de decodificación por 3.2x, pasando de 7.9 a 25.07 tokens por segundo. Es importante señalar que el tipo ROCmFPX solo existe en un fork de llama.cpp llamado `charlie12345/ROCmFPX`, por lo que el llama.cpp estándar no puede cargar este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), transformer con decodificacion especulativa MTP |
| Parametros totales | 26.895.998.464 (26.9B) |
| Parametros activos | no disponible (el nombre del modelo base sugiere ~3.8B, no confirmado) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Q8_0_ROCMFPX (8.28 bpw, ftype 111) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (solo compatible con el fork ROCmFPX de llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer de mezcla de expertos con 26.9B parametros totales, disenado por Qwen para generacion de texto y soporte de herramientas. Esta build concreta no es un modelo entrenado desde cero, sino una cuantizacion del GGUF BF16 original (51.3 GiB) al formato ROCmFPX de 8 bits, realizada directamente sin requantizaciones intermedias, lo que preserva la fidelidad de los pesos originales.

La innovacion principal de esta publicacion es el uso del tipo de cuantizacion ROCmFPX, una representacion de punto flotante de 8 bits optimizada para la arquitectura AMD gfx1151, que aprovecha las instrucciones nativas de ROCm 7.2.4. Ademas, el repositorio incluye un cabezal de borrador MTP (multi-token prediction) en Q4_0 que permite decodificacion especulativa: el modelo borrador propone hasta 4 tokens y el modelo principal los valida, logrando una tasa de aceptacion de 0.911 y un incremento de velocidad de 3.2x respecto a la ejecucion sin MTP.

Los pesos se auditaron tensor a tensor (851 tensores): `output.weight` y `token_embd.weight` en Q8_0, y el resto en `TYPE_103` (layout ROCmFPX de 8 bits). No se realizaron mediciones de perplejidad ni comparaciones de calidad A/B contra BF16 o la version de 4 bits.

## Capacidades

- Generacion de texto en ingles con razonamiento aritmetico verificado (17 × 23 = 391, dias en 2024 = 366).
- Tool calling verificado 7/7 en modo thinking y 7/7 en modo non-thinking, incluyendo argumentos multiples, objetos anidados, enums, rechazos, conversaciones multi-turno, streaming y llamadas paralelas.
- Soporte de decodificacion especulativa MTP con cabezal de borrador incluido en el repositorio.
- Ventana de contexto de 131.072 tokens (no probada en la practica por el autor).
- Capacidad de razonamiento en dos modos: thinking (cadena de pensamiento explicita) y non-thinking (respuesta directa).

## Casos de uso

- Asistentes conversacionales locales en hardware AMD Strix Halo: el modelo puede ejecutarse en un Ryzen AI MAX+ 395 con 128 GB de memoria unificada, gestionando conversaciones multi-turno con tool calling verificado, sin necesidad de GPU discreta.
- Agentes autonomos con llamada a herramientas: el soporte 7/7 en tool calling con argumentos anidados y llamadas paralelas permite construir agentes que consultan APIs, bases de datos o servicios externos de forma fiable.
- Procesamiento de documentos extensos: con 131.072 tokens de contexto, puede resumir o extraer informacion de documentos largos (manuales tecnicos, informes anuales, codigo fuente completo de proyectos medianos) en una sola pasada.
- Generacion de codigo asistida en entornos sin conexion: la licencia Apache 2.0 permite su integracion en herramientas de desarrollo internas, con la ventaja de ejecutarse en hardware AMD de gama alta sin depender de servicios en la nube.
- Prototipado de aplicaciones de razonamiento: el modo thinking permite depurar cadenas de razonamiento en tareas de logica o matematicas, util para validar pipelines de agentes antes de pasar a produccion.
- Evaluacion de calidad de cuantizacion en ROCmFPX: esta build sirve como referencia para medir si 8 bits ofrecen una mejora real de fidelidad frente a la variante de 4 bits del mismo autor, en tareas especificas de dominio.

## Benchmarks y rendimiento

Rendimiento medido en Ryzen AI MAX+ 395 (gfx1151, 128 GB de memoria unificada, ROCm 7.2.4), mediana de 3 ejecuciones, descartando el warm-up, en sistema sin carga. Flags de servidor: `--spec-type draft-mtp --model-draft mtp-Qwen3.8-27B-Q4_0.gguf --spec-draft-n-max 4 -ngl 999 -fa on -fit off`.

| Build | Tamano | Decodificacion con MTP | Rango | Aceptacion de borrador |
|---|---|---|---|---|
| Q8_0_ROCMFPX (esta build) | 25.92 GiB | 25.07 tok/s | [25.07 – 25.51] | 0.911 |
| Q8_0_ROCMFPX_AGENT | 26.28 GiB | 26.62 tok/s | [26.61 – 27.15] | 0.953 |
| Q4_0_ROCMFP4_STRIX (4-bit) | 14 GiB | 38.32 tok/s | [37.91 – 38.61] | 1.000 |

Sin el cabezal MTP, esta build rinde aproximadamente 7.9 tok/s, un tercio de la velocidad con MTP. Verificaciones funcionales: 17 × 23 = 391 correcto, capital de Japon = Tokyo correcto, dias en 2024 = 366 correcto, tool calling 7/7 en ambos modos. No se han publicado resultados de perplejidad, ni comparativas de calidad A/B contra BF16 o la build de 4 bits, ni benchmarks de codigo o razonamiento.

## Requisitos de hardware

- GPU objetivo: AMD gfx1151 (Ryzen AI MAX+ 395 / Strix Halo), unica arquitectura soportada por el tipo de cuantizacion ROCmFPX.
- Memoria: 128 GB de memoria unificada recomendados (el archivo ocupa 25.92 GiB, pero el modelo base requiere espacio adicional para el contexto y el cabezal de borrador).
- ROCm 7.2.4 o superior.
- No es compatible con GPUs NVIDIA ni con GPUs AMD de otras arquitecturas (gfx90a, gfx942, etc.) sin recompilar el fork ROCmFPX.
- Despliegue: exclusivamente con el fork `charlie12345/ROCmFPX` de llama.cpp (llama-server). No funciona con llama.cpp estandar, Ollama ni vLLM.
- Latencia: 25.07 tok/s de media con MTP activado; sin MTP, aproximadamente 7.9 tok/s. La latencia por token es de unos 40 ms con MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Velocidad (Strix Halo) | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B-ROCmFPX-Q8_0 (esta build) | 26.9B | 131K | Q8_0_ROCMFPX (8.28 bpw) | 25.07 tok/s | Apache 2.0 |
| Qwen3.8-27B-ROCmFPX-Q8_0-AGENT | 26.9B | 131K | Q8_0_ROCMFPX (8.28 bpw) | 26.62 tok/s | Apache 2.0 |
| Qwen3.8-27B-ROCmFP4-STRIX-MTP | 26.9B | 131K | Q4_0_ROCMFP4 (4-bit) | 38.32 tok/s | Apache 2.0 |

La variante AGENT es marginalmente mas rapida (6.2%) y acepta mas tokens de borrador (0.953 frente a 0.911) a costa de 0.36 GiB adicionales. La variante de 4 bits es 1.53x mas rapida y 12 GiB mas pequena, por lo que el autor recomienda la build de 8 bits solo si se necesita margen de fidelidad, no por rendimiento. No hay comparativas publicadas contra el BF16 original ni contra otros modelos MoE de tamano similar.

## Limitaciones y advertencias

- Incompatibilidad critica: el llama.cpp estandar no puede cargar este modelo. Requiere el fork `charlie12345/ROCmFPX`, lo que limita su uso a ese ecosistema.
- Rendimiento sin MTP muy pobre: a 7.9 tok/s sin el cabezal de borrador, la experiencia de uso es practicamente inservible para interaccion en tiempo real. El MTP es obligatorio en la practica.
- Sin mediciones de calidad: no se ha ejecutado perplejidad ni comparativas A/B contra BF16 o la build de 4 bits, por lo que no hay evidencia de que 8 bits compren precision real frente a 4 bits.
- Hardware muy especifico: solo funciona en AMD gfx1151 (Strix Halo). No es portable a otras GPUs AMD ni a NVIDIA sin modificaciones del fork.
- Contexto largo sin probar: aunque el modelo soporta 131.072 tokens, no se han realizado pruebas de estabilidad o calidad en contextos largos.
- Idioma limitado: solo se declara ingles en la model card, aunque el modelo base de Qwen es multilingue; no hay verificacion de rendimiento en otros idiomas.
- Sin benchmarks de codigo ni razonamiento: no se ha evaluado el rendimiento en tareas de programacion o logica compleja mas alla de las verificaciones aritmeticas basicas.
- Fecha de creacion futura: el repositorio se creo el 16 de agosto de 2026, lo que sugiere que es un proyecto muy reciente y posiblemente experimental.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kingjones777/Qwen3.8-27B-ROCmFPX-Q8_0-GGUF
- Variante AGENT: https://huggingface.co/kingjones777/Qwen3.8-27B-ROCmFPX-Q8_0-AGENT-GGUF
- Variante 4-bit: https://huggingface.co/kingjones777/Qwen3.8-27B-ROCmFP4-STRIX-MTP-GGUF
- Fork ROCmFPX de llama.cpp: https://github.com/charlie12345/ROCmFPX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
