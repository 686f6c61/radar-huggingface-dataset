# kelsey1337/Ternary-Bonsai-2.5-27B-Uncensored-MTP-GGUF

## Resumen

Ternary Bonsai 2.5 27B Uncensored + MTP es una familia de seis ficheros GGUF publicada por el usuario kelsey1337 que empaqueta, en todos los formatos de compresión que distribuye Prism ML, la versión sin censura ("abliterated") del modelo Ternary Bonsai 2.5 27B. El modelo subyacente es un transformer de 26.895.998.464 parámetros (unos 26,9 mil millones) cuyos pesos están cuantizados de forma ternaria a valores {-1, 0, +1} con escalas fp16 por grupo de 128, lo que reduce el peso en disco a entre 6 y 8 GB según el empaquetado. El autor original de la ablación es AtomicChat, que eliminó una dirección de rechazo en 36 matrices de las capas 27 a 44 y la horneó directamente en los códigos ternarios.

La aportación de este repositorio no es un nuevo entrenamiento, sino un trabajo de reempaquetado sin pérdida: convierte la edición de AtomicChat entre los tres formatos de Prism (PTQ1_0, PQ2_0 y Q2_0), cada uno con y sin la cabeza de predicción multi-token (MTP) para decodificación especulativa, y verifica byte a byte que los tensores no editados coinciden con los ficheros originales de Prism. El resultado es que el modelo sin censura está disponible también en Q2_0, el único formato que carga en llama.cpp estándar (build b11556 o superior), y con la cabeza MTP que proporciona una aceleración de decodificación de aproximadamente 1,65×.

Es relevante ahora por dos motivos: demuestra que la cuantización ternaria extrema permite llevar un modelo de 27B a GPUs de consumo (el autor reporta 178 tokens por segundo en una RTX 4090 con decodificación especulativa), y porque documenta con rigor el coste de calidad de la abliteración (+3,1 % de perplejidad sobre el corpus completo) y la preservación de la decodificación especulativa sin pérdida. La licencia es Apache 2.0. No se han publicado datos sobre idiomas soportados ni longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con pesos ternarios {-1, 0, +1} y escalas fp16 por grupo de 128; incluye cabeza MTP (multi-token prediction) opcional y tensores `ssm_out`, lo que sugiere componentes de estado (SSM o híbrido) en la red |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria: PTQ1_0 (28 B / 128 pesos), PQ2_0 (34 B / 128 pesos), Q2_0 (18 B / 64 pesos); todas con escalas fp16 grupo-128 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (seis ficheros: PTQ1_0, PQ2_0, Q2_0, cada uno con y sin cabeza MTP) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna más allá de los detalles de empaquetado. Los tensores editados (`blk.27–44.ffn_down`, más `attn_output` ×5 y `ssm_out` ×13) indican una red con bloques de atención y componentes de estado tipo SSM, aunque no se especifica si es un transformer puro, un híbrido o un modelo con capas recurrentes. Lo que sí está documentado es el esquema de cuantización: todos los empaquetados almacenan exactamente los mismos pesos ternarios con las mismas escalas fp16 por grupo de 128; solo cambia la disposición de bits. PTQ1_0 usa 28 bytes por bloque de 128 pesos (5 trits por byte en 24 B, 4 trits por byte en 2 B y la escala fp16), PQ2_0 usa 34 B por bloque (escala fp16 más códigos de 2 bits) y Q2_0 usa 18 B por bloque de 64 pesos (escala fp16 más códigos de 2 bits, con dos bloques por grupo de 128 que repiten la misma escala).

El proceso de creación es un reempaquetado sin pérdida, no un entrenamiento. AtomicChat partió del modelo base de Prism ML, eliminó una dirección de rechazo en 36 matrices de las capas 27 a 44 y horneó el cambio en los códigos ternarios, publicando solo el empaquetado PTQ1_0 sin cabeza MTP. kelsey1337 decodifica ese fichero a trits enteros y bits crudos de escala fp16 y lo re-codifica en los otros formatos mediante `repack.py`; para el PTQ1_0 con MTP usa una copia directa de bytes con `graft_bytes.py`. La verificación es exhaustiva: re-codificar todos los tensores ternarios del PTQ1_0-mtp original de Prism reproduce sus ficheros PQ2_0, PQ2_0-mtp, Q2_0 y Q2_0-mtp byte a byte (402 de 402 tensores, 0 discrepancias). Cada salida difiere del fichero original de Prism en exactamente 36 tensores; el resto (815, o 830 con la cabeza MTP), la cabecera y los metadatos son idénticos byte a byte. La cabeza MTP no está editada, por lo que la decodificación especulativa sigue siendo sin pérdida: el modelo sin censura verifica cada token propuesto.

## Capacidades

- Generación de texto conversacional y de base (`text-generation`, `conversational`), según la model card y las etiquetas del repositorio.
- Respuestas sin rechazo: en la verificación del autor, 0 de 12 peticiones comunes rechazadas frente a 8 de 12 del modelo original, con el modo "thinking" desactivado.
- Decodificación especulativa mediante cabeza MTP: los ficheros con sufijo `-mtp` aceptan `--spec-type draft-mtp` y logran una aceptación de borradores del 65–66 % en RTX 4090 y del 55–58 % en CPU (Apple M2).
- Compatibilidad con llama.cpp: los ficheros Q2_0 funcionan en llama.cpp estándar (b11556 o superior) y en frontends basados en él como Ollama; PTQ1_0 y PQ2_0 requieren el fork PrismML.
- Tool calling, function calling y comportamiento de agentes: no disponible en la información proporcionada.
- Capacidades de visión, audio o matemáticas: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.

## Casos de uso

- Despliegue de un modelo de 27B en GPU de consumo: con PTQ1_0-mtp (6,23 GB) o Q2_0-mtp (7,91 GB), el modelo cabe en una RTX 4090 o en GPUs con 8–12 GB de VRAM, lo que permite ejecutar localmente un modelo de escala 27B sin infraestructura de centro de datos.
- Generación de texto a alta velocidad en local: en la verificación del autor, la RTX 4090 alcanza 178 t/s con MTP (n_max 3) y 107,8 t/s sin especulación en PTQ1_0-mtp, adecuado para asistentes interactivos y generación de borradores en lote.
- Investigación sobre cuantización ternaria extrema: el repositorio incluye `repack.py` y `graft_bytes.py`, y demuestra la equivalencia byte a byte entre empaquetados, lo que sirve como referencia para estudiar el impacto de la cuantización a 2 bits efectivos en la perplejidad (10,03 en el original frente a 10,35 en el modelo sin censura sobre el corpus local del autor).
- Estudios de alineación y abliteración: permite comparar el mismo modelo con y sin la dirección de rechazo eliminada (36 tensores de las capas 27–44) manteniendo idénticos todos los demás pesos, un control experimental limpio para medir el coste de la edición (+3,1 % de perplejidad).
- Evaluación de decodificación especulativa: los pares con y sin cabeza MTP de cada empaquetado permiten medir la aceleración y la tasa de aceptación de borradores en distintos backends (fork PrismML frente a llama.cpp estándar) sin cambiar los pesos del modelo principal.
- Integración en pipelines con llama.cpp estándar: el fichero Q2_0-mtp carga en llama.cpp b11556+ y en frontends construidos sobre él, lo que facilita su incorporación a herramientas existentes de inferencia local sin parchear el runtime.
- Experimentación en CPU: los ficheros Q2_0 y PQ2_0 se cargan y decodifican en CPU (verificado en Apple M2 con Asahi Linux), útil para prototipado en portátiles antes de pasar a GPU.

## Benchmarks y rendimiento

Los datos disponibles son verificaciones del autor, no benchmarks estándar (MMLU, HumanEval, GSM8K no se reportan).

| Prueba | Modelo original PTQ1_0-mtp | AtomicChat PTQ1_0 | Sin censura PTQ1_0-mtp |
|---|---|---|---|
| Perplejidad (corpus local de 436 KB, 268 × 512) | 10,0345 ± 0,108 | 10,3502 ± 0,113 | 10,3502 ± 0,113 |
| Rechazos (12 peticiones comunes, thinking off) | 8 / 12 | no disponible | 0 / 12 |
| Decodificación con MTP n_max 3 (t/s, RTX 4090) | 176,4 | sin cabeza MTP | 178,0 |
| Decodificación sin especulación (t/s) | no disponible | no disponible | 107,8 |
| Aceptación de borradores | 65 % | no disponible | 66 % |

| Prueba en Apple M2 (Asahi Linux, CPU) | Resultado |
|---|---|
| Perplejidad Q2_0, primeros 8 fragmentos, llama.cpp b12651 | original 10,5296; sin censura 10,7551 |
| Perplejidad Q2_0 en RTX 4090 PTQ1_0, mismos fragmentos | original 10,5301; sin censura 10,7647 |
| Perplejidad PQ2_0, primeros 2 fragmentos, fork PrismML | sin censura 7,6315 y 8,9583 (Q2_0 en llama.cpp estándar: 7,6247 y 8,9491) |
| Q2_0-mtp con `--spec-type draft-mtp`, llama.cpp estándar | carga, genera borradores, 55 % de aceptación (39/71) |
| PQ2_0-mtp con `--spec-type draft-mtp`, fork PrismML | carga, genera borradores, 58 % de aceptación (39/67) |

El coste de calidad de la abliteración es de +3,1 % de perplejidad sobre el corpus completo (+2,1 % en el subconjunto parcial citado). El autor señala que las cifras de CPU y portátil no son benchmarks significativos y que las diferencias en los últimos dígitos provienen de kernels de CPU distintos.

## Requisitos de hardware

- VRAM estimada: entre 6 y 8 GB para los pesos según empaquetado (PTQ1_0: 5,99–6,23 GB; PQ2_0: 7,25–7,49 GB; Q2_0: 7,67–7,91 GB), más overhead de contexto y caché KV no especificado.
- GPU recomendadas: RTX 4090 verificada por el autor para PTQ1_0-mtp con el fork PrismML. No se han publicado pruebas en A100, H100 ni otras GPUs de centro de datos.
- GPU de consumo: sí, cabe en GPUs con 8–12 GB de VRAM; la verificación concreta es en RTX 4090. También se ha probado en CPU (Apple M2 con Asahi Linux).
- Opciones de despliegue: llama.cpp estándar b11556+ para Q2_0 y Q2_0-mtp; fork PrismML (`prism-b12128-d7b2896`) para PTQ1_0 y PQ2_0; frontends tipo Ollama construidos sobre llama.cpp estándar para Q2_0. No se mencionan vLLM ni TGI.
- Latencia y throughput: en RTX 4090 con PTQ1_0-mtp, 178,0 t/s con MTP (n_max 3) y 107,8 t/s sin especulación; aceptación de borradores del 66 %. En CPU (M2) solo se reportan comprobaciones funcionales y tasas de aceptación (55–58 %), sin cifras de velocidad significativas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary Bonsai 2.5 27B Uncensored + MTP (este) | 26,9B | no disponible | Ternaria PTQ1_0 / PQ2_0 / Q2_0, con y sin MTP | Apache 2.0 | GGUF en Hugging Face; Q2_0 en llama.cpp estándar |
| Ternary Bonsai 2.5 27B (Prism ML, original) | 26,9B | no disponible | Ternaria PTQ1_0 / PQ2_0 / Q2_0, con y sin MTP | no disponible | GGUF en Hugging Face; requiere fork PrismML para PTQ1_0/PQ2_0 |
| Ternary Bonsai 2.5 27B Uncensored (AtomicChat) | 26,9B | no disponible | Solo PTQ1_0, sin MTP | Apache 2.0 | GGUF en Hugging Face; requiere fork PrismML |
| Otros modelos de ~27B en 2 bits (p. ej. variantes GGUF Q2_K) | ~27B | no disponible | 2–3 bits por peso | variable | llama.cpp estándar |

La comparación con modelos de otros fabricantes no está disponible en la información proporcionada. Frente al original de Prism, este repositorio añade la edición sin censura y la disponibilidad en Q2_0 para llama.cpp estándar; frente a la versión de AtomicChat, añade los empaquetados PQ2_0 y Q2_0 y las variantes con cabeza MTP.

## Limitaciones y advertencias

- La abliteración degrada la calidad: +3,1 % de perplejidad sobre el corpus del autor (10,3502 frente a 10,0345). Es un coste medible que conviene evaluar en la tarea concreta antes de producción.
- El modelo está diseñado explícitamente para no rechazar peticiones; esto elimina las salvaguardas de seguridad del modelo original y traslada al operador toda la responsabilidad sobre el contenido generado. No es adecuado para despliegues públicos sin filtros externos.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad ni de benchmarks estándar; la única métrica de calidad disponible es la perplejidad.
- Longitud de contexto e idiomas soportados no están documentados; no se puede asumir un contexto largo ni cobertura multilingüe.
- Compatibilidad fragmentada: PTQ1_0 y PQ2_0 solo cargan en el fork PrismML de llama.cpp; solo Q2_0 funciona en llama.cpp estándar b11556+. Verificar la build antes de desplegar.
- La cuantización ternaria a 2 bits efectivos implica una pérdida de precisión estructural frente a pesos fp16; los resultados de perplejidad en torno a 10 en el corpus del autor no son directamente comparables con benchmarks de modelos en precisión completa.
- El repositorio tiene 8 likes y 18.245 descargas en el momento de la consulta; es un artefacto de la comunidad, no una release oficial de Prism ML ni de AtomicChat.
- Las cifras de rendimiento en CPU y portátil no son benchmarks representativos según el propio autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kelsey1337/Ternary-Bonsai-2.5-27B-Uncensored-MTP-GGUF
- Modelo base sin censura de AtomicChat: https://huggingface.co/AtomicChat/Ternary-Bonsai-2.5-27B-Uncensored-GGUF
- Modelo original de Prism ML: https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF
- Script de reempaquetado incluido en el repo: `repack.py`
- Script de copia directa de tensores incluido en el repo: `graft_bytes.py`
- Metadatos de verificación incluidos en el repo: `evaluation.json`
