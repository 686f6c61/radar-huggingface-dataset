# jsantillana/gemma-4-26B-A4B-it-abliterated-v3-GGUF

## Resumen

`jsantillana/gemma-4-26B-A4B-it-abliterated-v3-GGUF` es una distribucion en formato GGUF de un modelo derivado de la familia Gemma 4, publicado por el usuario jsantillana. Se trata de una variante "abliterated" del modelo instructivo Gemma 4 26B A4B, es decir, un ajuste que elimina deliberadamente los mecanismos de rechazo del modelo base para que responda a solicitudes que el original denegaria. El autor la etiqueta explicitamente como herramienta de investigacion en seguridad defensiva y advierte de que no debe usarse en produccion.

El modelo conserva la arquitectura del Gemma 4 26B A4B original, con aproximadamente 25.230 millones de parametros totales segun los pesos safetensors del repositorio, y se distribuye unicamente en cuantizaciones GGUF (Q3_K_M, Q4_K_M y Q8_0) orientadas a ejecucion local. El repositorio ocupa 56,9 GB, coherente con un modelo de este tamano en varias cuantizaciones.

Su relevancia es acotada y muy especifica: sirve como objeto de estudio para analizar el comportamiento de modelos con los rechazos suprimidos, evaluar la eficacia de tecnicas de abliteration y medir efectos colaterales sobre capacidades generales. No es un modelo recomendable para aplicaciones de usuario final ni para despliegues comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, variante A4B); detalles internos no disponibles |
| Parametros totales | 25.233.142.046 |
| Parametros activos | no disponible (la nomenclatura A4B sugiere arquitectura con parametros activos reducidos, pero no se confirma en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K_M, Q4_K_M, Q8_0 (GGUF) |
| Idiomas soportados | no disponible (la evaluacion del autor reporta metricas en EN y ES) |
| Licencia | apache-2.0-restricted-research (etiquetada como "other") |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna, el volumen de tokens de entrenamiento ni la composicion del dataset del modelo base Gemma 4 26B A4B. La model card solo documenta el proceso de modificacion: una tecnica de abliteration denominada "Rank-2 dual-mode + mlp.down_proj @0.5α" aplicada sobre las capas 28 a 63 (L28-L63). Esta intervencion actua sobre las proyecciones del bloque MLP para suprimir direcciones de activacion asociadas al rechazo.

El autor reporta resultados de la ablacion con una metrica estricta: la tasa de rechazo en ingles (EN:OFF) pasa del 68,7 % al 32,1 %, y en espanol (ES:OFF) del 31,0 % al 0,0 %, con un 0 % de dano colateral declarado. No se especifican metodos de alineacion adicionales (RLHF, DPO) ni innovaciones de decodificacion.

## Capacidades

- Generacion de texto conversacional, heredada del modelo instructivo base.
- Respuesta a solicitudes que el modelo original rechazaria, por efecto de la abliteration.
- Soporte multilingue parcial: la evaluacion del autor cubre ingles y espanol.
- Capacidades de razonamiento y codigo: no documentadas especificamente en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision o audio: no disponible.

## Casos de uso

- Investigacion en seguridad de IA: analizar como cambia la tasa de cumplimiento de solicitudes tras aplicar abliteration, usando las metricas EN:OFF y ES:OFF como referencia reproducible.
- Evaluacion de tecnicas de ablacion: comparar el metodo "Rank-2 dual-mode + mlp.down_proj @0.5α" con otras aproximaciones y medir el dano colateral en tareas benignas.
- Red teaming controlado: disponer de una variante permisiva para estudiar vectores de ataque y construir defensas frente a modelos desalineados.
- Estudios de sesgo y toxicidad: examinar que contenidos emergen cuando se eliminan los rechazos, en un entorno aislado y con supervision.
- Benchmarking de cuantizaciones GGUF: comparar Q3_K_M, Q4_K_M y Q8_0 en terminos de calidad y latencia sobre el mismo modelo base.
- Docencia e investigacion academica: ilustrar de forma practica el funcionamiento y los riesgos de la abliteration en cursos de seguridad de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El unico dato de evaluacion es la metrica estricta de rechazo del autor:

| Metrica | Antes | Despues |
|---|---|---|
| EN:OFF (tasa de rechazo en ingles) | 68,7 % | 32,1 % |
| ES:OFF (tasa de rechazo en espanol) | 31,0 % | 0,0 % |
| Dano colateral | — | 0 % |

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para 25.230 millones de parametros, Q4_K_M requiere aproximadamente 15-16 GB, Q8_0 en torno a 27 GB y Q3_K_M cerca de 11-12 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: no especificadas. Por tamano, una RTX 4090 (24 GB) puede alojar Q4_K_M; Q8_0 requiere A100 40 GB, H100 o configuracion multi-GPU.
- Cabe en GPU de consumo: si, en cuantizaciones Q3_K_M y Q4_K_M con GPUs de 16-24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runners compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-4-26B-A4B-it-abliterated-v3-GGUF | 25,2 B | no disponible | apache-2.0-restricted-research | GGUF | Variante abliterated, solo investigacion |
| Gemma 4 26B A4B it (base) | ~25 B | no disponible | licencia Gemma | safetensors, GGUF | Modelo original con rechazos intactos |
| Otras variantes abliterated de la familia Gemma | variable | no disponible | variable | safetensors, GGUF | Metodologia y resultados distintos segun autor |

No se dispone de datos de rendimiento comparables para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Modelo abliterated: cumple solicitudes que el modelo base rechaza, con riesgo de generar contenido danino, ilegal o inseguro.
- El autor lo restringe explicitamente a investigacion en seguridad defensiva y advierte de que no es apto para produccion.
- Licencia "apache-2.0-restricted-research": restringe el uso comercial; revisar los terminos antes de cualquier despliegue.
- Riesgo elevado de alucinacion y de respuestas no filtradas por ausencia de mecanismos de rechazo.
- No se documentan sesgos conocidos, idiomas soportados ni longitud de contexto, lo que dificulta su evaluacion rigurosa.
- La metrica de rechazo residual del 32,1 % en ingles indica que la ablacion es parcial, no total.
- Sin resultados de benchmarks estandar: no hay evidencia publicada sobre la degradacion de capacidades generales.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/jsantillana/gemma-4-26B-A4B-it-abliterated-v3-GGUF
- Repositorio padre (modelo completo y metodologia): https://huggingface.co/jsantillana/gemma-4-26B-A4B-it-abliterated-v3
