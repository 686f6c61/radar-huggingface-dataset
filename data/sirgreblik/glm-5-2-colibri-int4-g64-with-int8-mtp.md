# SirGreblik/GLM-5.2-colibri-int4-g64-with-int8-mtp

## Resumen

Este repositorio no contiene un modelo nuevo, sino una conversion de pesos de GLM-5.2 (un MoE de 744B desarrollado por zai-org) realizada por el usuario SirGreblik para el motor de inferencia por streaming colibri. La conversion aplica cuantizacion int4 agrupada (group size 64) a los pesos de expertos, mantiene embed/lm_head en int8 y las normas en f32, y anade una cabeza MTP (multi-token prediction) en int8 para decodificacion especulativa. El resultado es un contenedor de 429,3 GB repartido en 141 shards safetensors mas un fichero MTP de 9,3 GB.

Su relevancia practica esta en el nicho de "GPU pobre": el motor colibri esta disenado para hacer streaming de expertos desde NVMe, de modo que un MoE de 744B pueda ejecutarse en tarjetas con VRAM muy inferior al tamano total del modelo. El autor reporta validacion token-exacta contra el oraculo de transformers (32/32), una mejora medible de calidad frente al contenedor int4 per-row (hellaswag acc_norm 87,0 % frente a 83,5 %) y la correccion del fallo de bucle de razonamiento / inanicion de EOS que afectaba a la variante per-row.

El repositorio tiene 0 descargas y 0 likes, se publico el 13 de septiembre de 2026 y su licencia declarada es MIT, heredada del modelo base. Existe un hermano mas pequeno de los mismos pesos (una build E8/IQ3 de 3,06 bpw y 289 GB) que el propio autor recomienda en escenarios de streaming con tasa de acierto de cache de expertos inferior al 99 %.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `glm_moe_dsa`; detalles de capas y atencion no disponibles en la informacion proporcionada) |
| Parametros totales | 744B (segun la model card del contenedor) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos en int4 agrupado (group size 64, escalas f32 por grupo); MTP head en int8; embed/lm_head en int8; normas en f32 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (141 shards `out-00000..00140.safetensors`, 390,5 GB, mas `out-mtp-00000.safetensors`, 9,3 GB) |

## Arquitectura y entrenamiento

La informacion disponible describe la conversion, no el entrenamiento. El modelo subyacente, GLM-5.2 de zai-org, es un Mixture of Experts de 744B parametros; el tag `glm_moe_dsa` sugiere una variante MoE con atencion dispersa (DSA), pero la model card de este repositorio no detalla numero de expertos, expertos activos por token, capas, cabezas de atencion ni longitud de contexto. Tampoco se especifica el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO u otro ajuste por preferencias.

Lo que si describe con detalle es la cadena de cuantizacion. Los pesos provienen del padre oficial en FP8 (`zai-org/GLM-5.2`) y se convierten a formato `fmt=4` del motor colibri: int4 agrupado con una escala f32 por cada 64 elementos en los pesos de expertos. El autor justifica el agrupamiento frente a escalas por fila (per-row) argumentando que un unico valor atipico puede degradar la precision de toda una fila; el coste es aproximadamente un 12 % mas de disco. La innovacion funcional mas relevante es la cabeza MTP en int8 para decodificacion especulativa: el autor indica que una cabeza MTP en int4 da una aceptacion de borradores cercana al 0 %, mientras que en int8 mide entre el 39 % y el 59 % de aceptacion.

## Capacidades

- Generacion de texto: el pipeline declarado es `text-generation`; es la unica capacidad explicitamente documentada.
- Razonamiento multi-paso: el modelo base es un MoE de gran escala, pero la model card no detalla modos de pensamiento ni presupuestos de razonamiento.
- Decodificacion especulativa: soportada mediante la cabeza MTP en int8 incluida en el contenedor, con tasas de aceptacion de borradores del 39-59 % segun el autor.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el campo de idiomas del repositorio esta vacio.
- Vision, audio u otras modalidades: no disponible.
- Fiabilidad de parada: el contenedor se documenta como corregido frente al fallo de bucle de razonamiento sin emision de EOS, con 5/5 celdas limpias en una matriz de muestreo que incluia `TEMP=0.9 NUCLEUS=0.95`.

## Casos de uso

- Inferencia de un MoE de 744B en hardware de gama de consumo: el motor colibri hace streaming de expertos desde NVMe, de modo que el contenedor puede servirse en tarjetas con VRAM muy inferior a los 429 GB del repositorio. Es el escenario que da sentido al tag `gpu-poor`.
- Servicio de generacion de texto autoalojado con requisitos de soberania de datos: al ejecutarse en infraestructura propia y con licencia MIT, encaja en despliegues donde no se puede enviar texto a APIs externas.
- Sustitucion de un contenedor int4 per-row en produccion: el autor documenta que este contenedor corrige bucles de razonamiento y mejora la tasa de parada limpia, por lo que es la opcion de referencia cuando la fiabilidad de terminacion es critica.
- Experimentacion e investigacion sobre decodificacion especulativa: la cabeza MTP en int8 con aceptacion del 39-59 % permite estudiar el equilibrio entre coste de borrador y ganancia de throughput en MoE grandes.
- Despliegue en nodos multi-GPU con cache de expertos residente: en configuraciones donde los expertos caben en VRAM, el autor lo situa por delante de la build E8 en coste de decodificacion (expert-matmul 20,9 s frente a 24,1 s en su medicion).
- Reproduccion de evaluaciones de cuantizacion: el contenedor esta validado token-exacto contra el oraculo de transformers (32/32), lo que lo hace util como referencia para comparar esquemas de cuantizacion int4.
- Fine-tuning o destilacion posteriores: no disponible; la model card no documenta soporte de entrenamiento ni scripts de ajuste.

## Benchmarks y rendimiento

| Benchmark | Este contenedor (int4 g64) | Contenedor int4 per-row | Notas |
|---|---|---|---|
| HellaSwag (acc_norm) | 87,0 % | 83,5 % | A/B independiente, n=200 (colibri #326) |
| ARC-Challenge | sin mejora de calidad medible frente al build E8/IQ3 (sin cifra publicada) | no disponible | Mencionado en la model card |
| MMLU | sin perdida de calidad medible frente al build E8/IQ3 (sin cifra publicada) | no disponible | Mencionado en la model card |
| Validacion token-exacta vs transformers | 32/32 | no disponible | Ejecutada por el motor colibri |
| Aceptacion de borradores MTP | 39-59 % (cabeza int8) | ~0 % (cabeza int4) | Segun el autor |
| Matriz de parada (5 celdas de muestreo) | 5/5 limpias, incluida `TEMP=0.9 NUCLEUS=0.95` | fallo catastrofico en esa celda | colibri #455, cambio de contenedor con motor y prompts fijos |

No se han publicado resultados de MMLU, GSM8K, HumanEval ni otros benchmarks de conocimiento o codigo con cifras concretas en la informacion disponible. Los datos de rendimiento del build E8 hermano (22-33 % mas rapido en una tarjeta de 16 GB; residencia de expertos del 97,4 % frente al 93,5 %) corresponden a ese contenedor, no a este.

## Requisitos de hardware

- VRAM estimada para residencia completa: superior a 390 GB solo para los expertos, mas 9,3 GB de cabeza MTP y overhead del motor. En la practica exige streaming desde disco salvo en nodos con memoria muy abundante.
- Streaming desde NVMe: es el modo de uso previsto. El autor cita pruebas en una tarjeta de 16 GB con residencia de expertos del 93,5 %; en ese escenario el contenedor E8 de 289 GB resulta un 22-33 % mas rapido.
- Configuraciones citadas: 6xRTX 5090 (donde este contenedor se midio como regresion de decodificacion frente al build E8, colibri #452) y una GPU de 16 GB en modo streaming.
- Cabe en GPU de consumo: si, en modo streaming desde NVMe; no en residencia completa.
- Opciones de despliegue: exclusivamente el motor colibri (no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este contenedor `fmt=4`).
- Version de motor requerida: colibri v1.5.0 o superior recomendada; suelo funcional en v1.3.0 (`01abef3`); suelo absoluto en el commit `c98e5f8` (merge #298, 2026-07-20).
- Latencia y throughput: no se publican tokens por segundo. La unica metrica de tiempo disponible es `expert-matmul` de 20,9 s en este contenedor frente a 24,1 s del build E8, en la configuracion medida por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano del repo | Calidad / rendimiento | Licencia |
|---|---|---|---|---|---|
| SirGreblik/GLM-5.2-colibri-int4-g64-with-int8-mtp (este) | 744B MoE | int4 g64 + MTP int8 | 429,3 GB | HellaSwag 87,0 %; expert-matmul 20,9 s; referencia de parada fiable | MIT |
| mastouri/GLM-5.2-colibri-E8-IQ3-with-int8-mtp | 744B MoE | 3,06 bpw E8/IQ3 + MTP int8 | 289 GB | Sin perdida medible en HellaSwag, ARC-Challenge y MMLU; 22-33 % mas rapido con streaming y 16 GB; expert-matmul 24,1 s | no disponible en la informacion proporcionada |
| Contenedor int4 per-row de GLM-5.2 (sin identificador en la informacion) | 744B MoE | int4 per-row + MTP | no disponible (el autor indica ~12 % menos de disco) | HellaSwag 83,5 %; bucles de razonamiento e inanicion de EOS | no disponible |
| zai-org/GLM-5.2 (padre oficial) | 744B MoE | FP8 | no disponible | Referencia de origen de la conversion | MIT (heredada por este repositorio) |

## Limitaciones y advertencias

- Superficie de ataque en la carga: el autor advierte explicitamente de que descargar un contenedor preconvetido de un repositorio de terceros es la frontera de confianza nombrada por dos avisos de seguridad del motor colibri (GHSA-wc4x-3786-cxh7 y GHSA-4gw4-j89j-4c8r), que provocan escrituras fuera de limites en el heap durante la carga, antes de la inferencia. Es obligatorio usar un loader parcheado (v1.5.0 o superior).
- Compatibilidad de versiones muy estricta: con builds anteriores a v1.3.0, y en particular con `COLI_CUDA_ATTN=1`, las escalas de grupo se aplican por fila y el modelo produce texto fluido que colapsa (colibri #685 / #692). Builds anteriores a `c98e5f8` ni siquiera cargan `fmt=4` o caen silenciosamente a CPU.
- Rendimiento peor que el contenedor E8 cuando los expertos residen en memoria: el propio autor lo describe como regresion de decodificacion en 6xRTX 5090.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplican los riesgos propios del modelo base.
- Sesgos: no documentados en la informacion proporcionada.
- Idiomas: el repositorio no declara idiomas soportados; no hay evaluacion multilingue disponible.
- Contexto: la longitud de contexto no se especifica, lo que impide planificar casos de uso con ventanas largas.
- Uso comercial: la licencia declarada es MIT, pero se hereda del modelo base y la informacion disponible no incluye el texto de licencia de `zai-org/GLM-5.2` ni condiciones adicionales que pudieran aplicarse.
- Madurez del repositorio: 0 descargas y 0 likes en la fecha de creacion; toda la evidencia de calidad procede de issues del motor colibri citados por el autor, no de una evaluacion independiente publicada en el propio repositorio.
- Requisito de almacenamiento: 429,3 GB en disco con acceso NVMe; el rendimiento depende fuertemente de la tasa de acierto de la cache de expertos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/SirGreblik/GLM-5.2-colibri-int4-g64-with-int8-mtp
- Modelo base: https://huggingface.co/zai-org/GLM-5.2
- Contenedor hermano E8/IQ3 de 289 GB: https://huggingface.co/mastouri/GLM-5.2-colibri-E8-IQ3-with-int8-mtp
- Motor colibri (repositorio): https://github.com/JustVugg/colibri
- Avisos de seguridad de colibri: https://github.com/JustVugg/colibri/security/advisories
- Aviso GHSA-wc4x-3786-cxh7: https://github.com/JustVugg/colibri/security/advisories/GHSA-wc4x-3786-cxh7
- Aviso GHSA-4gw4-j89j-4c8r: https://github.com/JustVugg/colibri/security/advisories/GHSA-4gw4-j89j-4c8r
- Mediciones comparativas de contenedores (colibri #452): https://github.com/JustVugg/colibri/issues/452
- Comentario con metodologia y caveats (colibri #452): https://github.com/JustVugg/colibri/issues/452#issuecomment-5155461138

Nota: la busqueda web realizada no devolvio resultados relevantes para este modelo; los unicos enlaces utiles son los citados en la model card y los del propio repositorio de HuggingFace.
