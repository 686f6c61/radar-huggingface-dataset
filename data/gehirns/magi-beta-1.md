# GEHIRNS/magi-beta-1

## Resumen

magi-beta-1 es una cuantizacion GGUF de Qwen/Qwen3.5-4B publicada por GEHIRNS (541 descargas, 1 like en el momento de la consulta). No es un modelo entrenado: es un reempaquetado de pesos en una mezcla de tipos GGUF estandar, pensado para ejecutarse sin modificaciones en llama.cpp y Ollama. Su interes no esta en la capacidad bruta, sino en el experimento de compresion que documenta: cuantiza a 3,712 bits por peso (1,817 GiB de datos tensoriales para 4.205.751.296 parametros) y compara el resultado con su hermano magi-1.0.

La diferencia con magi-1.0 es un unico cambio: las proyecciones key, value y output de las 8 capas de atencion completa se almacenan en Q6_K en lugar de Q4_K, por considerarlas los tensores mas sensibles segun las mediciones del autor. El coste adicional es de 0,030 GiB y, segun la model card, no aporta precision medible: magi-beta-1 puntua 0,65 puntos por debajo de magi-1.0 (intervalo de confianza pareado al 95%: -1,72 a +0,44). La conclusion declarada del autor es que magi-1.0 ya protege lo que importa.

La relevancia practica es doble. Por un lado, es un artefacto de 1,83 GiB que ocupa 3,07 GiB de VRAM con contexto de 32K, lo que lo situa en el rango de cualquier GPU consumer moderna. Por otro, se publica explicitamente para que la comparacion sea reproducible, con paper ("Where the Bits Go", GEHIRNS, 2026) y repositorio de receta abiertos. El propio autor recomienda usar magi-1.0 en produccion por ser mas pequeno y puntuar ligeramente mejor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-4B; etiqueta `gated-deltanet` y 8 capas de atencion completa declaradas por el autor (arquitectura hibrida, detalles no disponibles) |
| Parametros totales | 4.205.751.296 (4,2B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens empleados en la evaluacion; maximo declarado no disponible |
| Tipos de cuantizacion | Mezcla de tipos GGUF estandar; Q6_K en proyecciones key, value y output de las 8 capas de atencion completa; 3,712 bits por peso de media |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un unico archivo, 1,83 GiB; 1,817 GiB de datos tensoriales) |

## Arquitectura y entrenamiento

magi-beta-1 no implica entrenamiento alguno: es una conversion de pesos de Qwen/Qwen3.5-4B a GGUF con una asignacion de tipos por tensor (mixed-precision quantization). La model card menciona explicitamente las 8 capas de atencion completa del modelo base y la etiqueta `gated-deltanet` aparece entre los tags, lo que apunta a una arquitectura hibrida con capas de atencion lineal tipo DeltaNet combinadas con atencion completa; el numero total de capas, la distribucion exacta y los detalles del bloque no se detallan en la informacion disponible.

La innovacion tecnica es la receta de cuantizacion, no la arquitectura. El autor parte de una premisa medida: las proyecciones key, value y output son los tensores mas sensibles al ruido de cuantizacion. magi-beta-1 sube esas proyecciones a Q6_K (frente a Q4_K en magi-1.0) con un sobrecoste de 0,030 GiB y comprueba si la precision mejora. El resultado es negativo (-0,65 puntos, IC 95% pareado -1,72 a +0,44), lo que respalda la tesis del paper "Where the Bits Go": la receta de magi-1.0 ya cubre los tensores criticos. El modelo es solo texto: el proyector de vision del modelo base no esta incluido. No se documentan datos de dataset, RLHF ni DPO porque no hay entrenamiento.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de modo razonamiento (tag `reasoning`, `thinking` activado en la evaluacion con presupuesto de 4.096 tokens).
- Razonamiento multi-paso heredado de Qwen3.5-4B, con decodificacion greedy y contexto de 32K en las pruebas del autor.
- Ejecucion nativa en llama.cpp y Ollama sin parches ni kernels personalizados.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita el despliegue tras una API compatible con OpenAI.
- Capacidades del modelo base en codigo y matematicas: no verificadas de forma independiente en la informacion proporcionada; los resultados por suite de la model card no estaban incluidos en los datos disponibles.
- Sin capacidad de vision: el proyector visual de Qwen3.5-4B se ha eliminado deliberadamente.
- Sin soporte multilingue declarado mas alla del ingles.
- Tool calling / function calling: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia en hardware modesto: con 3,07 GiB de VRAM a 32K de contexto y un archivo de 1,83 GiB, el modelo cabe en portatiles con GPU de 6-8 GB o incluso en CPU via llama.cpp, lo que permite prototipar razonamiento con contexto largo sin acceso a cluster.
- Reproduccion de experimentos de cuantizacion: el caso de uso declarado por el autor es comparar magi-beta-1 contra magi-1.0, Q4_K_M, Q2_K y BF16 con el mismo protocolo (12 suites, 2.313 tareas, RTX 5070 de 12 GB); util para investigadores que estudien asignacion de bits por tensor.
- Asistente local de documentacion tecnica en ingles: 32K de contexto permiten cargar un README o un conjunto de archivos de codigo y hacer preguntas multi-turno sin salir del equipo.
- Clasificacion y extraccion de informacion por lotes: al ocupar tan poca VRAM, se pueden mantener varias instancias en paralelo en una sola GPU consumer para procesar volumenes altos de texto.
- Base para experimentos de decodificacion especulativa o comparativas de cuantizacion: su compatibilidad con llama.cpp y Ollama permite integrarlo como modelo borrador o de referencia en pipelines de evaluacion.
- Despliegue en entornos con requisitos de licencia permisiva: Apache 2.0 facilita su incorporacion en productos comerciales cerrados sin obligaciones de copyleft.
- Banquito de pruebas de agentes con contexto largo: 32K tokens y modo thinking permiten simular tareas de varios pasos en local antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Protocolo declarado: una RTX 5070 (12 GB), 12 suites, 2.313 tareas, thinking activado con presupuesto de 4.096 tokens, decodificacion greedy, contexto de 32K. Los resultados por suite no estaban incluidos en la informacion proporcionada; solo se dispone de la seccion de eficiencia y de la comparacion agregada frente a magi-1.0.

| Metrica | BF16 | Q4_K_M | Q2_K | magi-1.0 | magi-beta-1 |
|---|---|---|---|---|---|
| Tamano mostrado en cabecera (GiB) | 8,98 | 3,78 | 3,15 | 3,02 | 3,07 |
| VRAM a 32K de contexto (GiB) | 8,98 | 3,78 | 3,15 | 3,02 | 3,07 |
| Diferencia agregada frente a magi-1.0 | no disponible | no disponible | no disponible | referencia | -0,65 puntos (IC 95%: -1,72 a +0,44) |

El resto de filas de la tabla de benchmarks (puntuaciones por suite y relativas a BF16) no estaban presentes en la informacion proporcionada.

## Requisitos de hardware

- VRAM medida: 3,07 GiB con contexto de 32K y modo thinking (RTX 5070 de 12 GB, protocolo del autor).
- Tamano en disco: 1,83 GiB para el archivo GGUF completo; 1,817 GiB de datos tensoriales.
- Cabe en cualquier GPU consumer con 6 GB o mas; con 3,07 GiB de VRAM queda margen amplio incluso en tarjetas de 4 GB si se reduce el contexto.
- GPU validadas: RTX 5070 (12 GB) en la evaluacion del autor. Otras GPU (RTX 4090, A100, H100) no se mencionan, aunque por tamano no deberian presentar problemas.
- Despliegue: llama.cpp y Ollama de forma nativa y sin modificaciones; el tag `endpoints_compatible` sugiere servicio tras API compatible. vLLM y TGI no se mencionan y, al ser un GGUF, no son la via natural.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Al ser un modelo denso de 4,2B en 3,7 bits por peso, el cuello de botella esperable es el ancho de banda de memoria, no la capacidad de computo; no se aportan cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano / VRAM | Licencia | Notas |
|---|---|---|---|---|---|
| magi-beta-1 | 4,2B | 32K (evaluado) | 1,83 GiB / 3,07 GiB a 32K | Apache 2.0 | Q6_K en KV y salida de 8 capas de atencion completa; -0,65 pts frente a magi-1.0 |
| magi-1.0 | 4,2B | 32K (evaluado) | 3,02 GiB a 32K | Apache 2.0 | Misma receta con Q4_K; recomendado por el propio autor por ser menor y puntuar mejor |
| Qwen3.5-4B Q4_K_M | 4,2B | no disponible | 3,78 GiB a 32K | Apache 2.0 (modelo base) | Cuantizacion estandar sin asignacion por tensor sensible |
| Qwen3.5-4B Q2_K | 4,2B | no disponible | 3,15 GiB a 32K | Apache 2.0 (modelo base) | Menor numero de bits, sin proteccion de tensores criticos |
| Qwen3.5-4B BF16 | 4,2B | no disponible | 8,98 GiB a 32K | Apache 2.0 | Referencia sin perdida de cuantizacion |

## Limitaciones y advertencias

- Rendimiento inferior a magi-1.0: -0,65 puntos agregados con el mismo protocolo. El propio autor indica que para uso real conviene tomar magi-1.0.
- Solo ingles declarado; el rendimiento en castellano u otros idiomas no esta documentado y probablemente degrade.
- Sin vision: el proyector visual del modelo base se ha eliminado, por lo que no procesa imagenes.
- Riesgo de alucinacion inherente a un modelo de 4,2B y a una cuantizacion de 3,712 bits por peso; no se han publicado evaluaciones de factualidad.
- Modelo de nicho con 541 descargas y 1 like: comunidad practicamente inexistente, sin incidencias ni casos de produccion reportados.
- Sin datos publicos de tool calling ni de fiabilidad en agentes; no se recomienda asumir soporte de function calling sin validacion propia.
- Al ser una cuantizacion y no un modelo entrenado, hereda los sesgos y limitaciones del Qwen3.5-4B original, no documentados en esta ficha.
- Licencia Apache 2.0 permite uso comercial sin restricciones de copyleft, pero el autor enlaza la licencia del modelo base; conviene revisar que la cadena de licencias se mantiene para el artefacto derivado.
- El contexto de 32K es el usado en la evaluacion, no necesariamente el maximo soportado; verificar antes de disenar aplicaciones que dependan de ventanas mayores.
- No hay garantias de soporte ni mantenimiento: la publicacion se presenta como un artefacto de comparacion reproducible, no como un modelo de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GEHIRNS/magi-beta-1
- Modelo recomendado por el autor (magi-1.0): https://huggingface.co/GEHIRNS/magi-1.0
- Modelo base (Qwen3.5-4B): https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Paper "Where the Bits Go" (GEHIRNS, 2026): https://github.com/GEHIRNS/magi/blob/main/paper/where-the-bits-go.pdf
- Repositorio con receta y datos: https://github.com/GEHIRNS/magi
- Coleccion MAGI experimental: https://huggingface.co/collections/GEHIRNS/magi-experimental-6ad6a94511ffd4dabaa7b24a
- Perfil del autor: https://huggingface.co/GEHIRNS
- Grafico de densidad de capacidad frente a magi-1.0, Q4_K_M, Q2_K y BF16: https://huggingface.co/GEHIRNS/magi-1.0/resolve/main/assets/capability-density.png
