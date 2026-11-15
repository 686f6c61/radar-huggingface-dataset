# raahemnabeel/inkling-small-hybrid-qb2

## Resumen

inkling-small-hybrid-qb2 es un paquete de despliegue publicado por raahemnabeel que sirve el modelo thinkingmachines/Inkling-Small de Thinking Machines Lab sobre hardware Tenstorrent p300x2. No se trata de un modelo nuevo, sino de una superposicion (overlay) de inferencia que permite ejecutar un modelo de mezcla de expertos (MoE) de 276.000 millones de parametros con 12.000 millones activos en dos tarjetas Tenstorrent, un escenario en el que los expertos no caben en la DRAM de los cuatro dies disponibles.

La innovacion central es una estrategia hibrida de colocacion de expertos: los 191 expertos mas usados de cada capa residen en el dispositivo en formato bfp4 (con proyecciones down en bfp8 en las 16 capas mas sensibles), mientras que los 67 restantes se calculan en la CPU del host a partir de copias en int4. Aproximadamente el 95% de las selecciones de expertos enrutados impactan en el dispositivo. La decodificacion es especulativa usando la cabeza MTP nativa del checkpoint, con dos borradores por pasada de verificacion, garantizando que la salida sea exactamente la del modelo objetivo.

El modelo base Inkling-Small es un transformer MoE de 42 capas con 256 expertos enrutados mas 2 compartidos por capa (top-6), atencion de ventana deslizante y global con sesgo relativo aprendido, y convoluciones cortas. El paquete ofrece 131.072 tokens de contexto, un unico flujo concurrente y una API compatible con OpenAI, orientado a chat de un solo usuario, codigo y uso de agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion de ventana deslizante y global, sesgo relativo aprendido y convoluciones cortas |
| Parametros totales | 276.000 millones (modelo base Inkling-Small) |
| Parametros activos | 12.000 millones (top-6 de 256 expertos enrutados + 2 compartidos por capa) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | bfp4 en dispositivo (bfp8 en proyecciones down de 16 capas sensibles), int4 en copias de host |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint BF16 original (~550 GB), copias int4 de expertos (~42 GB) e imagenes de dispositivo (~110 GB) generadas en el primer arranque |

## Arquitectura y entrenamiento

El modelo base Inkling-Small es un transformer de mezcla de expertos de 42 capas, con 256 expertos enrutados y 2 compartidos por capa, activando los 6 mas relevantes por token (top-6). Emplea una combinacion de atencion de ventana deslizante y atencion global con un sesgo relativo aprendido, junto con convoluciones cortas, lo que configura un diseno hibrido orientado a eficiencia en contexto largo. El checkpoint incorpora una cabeza nativa de prediccion multi-token (MTP) que se reutiliza como borrador especulativo durante la decodificacion.

El paquete de despliegue no entrena el modelo: parte del checkpoint oficial en BF16 (commit 8cc5877b44d343f88b92086aa1fb72897950f06a) y, en el primer arranque, deriva las copias de expertos que necesita el servidor. La estrategia hibrida coloca 191 de los 256 expertos enrutados por capa en la DRAM del dispositivo (bfp4, con bfp8 en las proyecciones down de las 16 capas mas sensibles) y calcula los 67 restantes en la CPU del host desde copias int4, con una tasa de acierto en dispositivo de aproximadamente el 95% de las selecciones. La decodificacion especulativa usa la cabeza MTP con 2 borradores por pasada de verificacion, de forma exacta respecto al modelo objetivo: el borrador solo propone tokens y la eleccion final es la del modelo. No se dispone de informacion sobre la composicion del dataset de entrenamiento ni sobre el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto para chat, codigo, matematicas y prosa, con decodificacion greedy y muestreada (temperature, top-p, top-k, seed) exactas respecto al modelo objetivo.
- Razonamiento separado del contenido: el texto de pensamiento se devuelve en el campo `reasoning` mediante el parser `inkling`, con esfuerzo de razonamiento configurable como kwarg de plantilla de chat (`none`, `minimal`, `low`, `medium`, `high`, `max`; por defecto `high`).
- Tool calling y function calling: las peticiones con `tools` devuelven `tool_calls` y `finish_reason: tool_calls` mediante el parser `inkling` de vLLM.
- Uso en agentes de un solo usuario con razonamiento multi-paso, sujeto a una concurrencia maxima de una secuencia.
- Contexto largo de hasta 131.072 tokens, con recuperacion verificada de una aguja en un documento largo en todas las longitudes probadas.
- API compatible con OpenAI en `/v1` (chat completions, completions y `/v1/models`).
- Capacidad multimodal: no disponible (el paquete es solo texto).

## Casos de uso

- Asistente de chat personal con contexto largo: un unico usuario puede mantener conversaciones de hasta 131.072 tokens, adecuado para analisis de documentos extensos o sesiones de trabajo prolongadas donde el modelo recupera informacion de cualquier punto del historial.
- Generacion y revision de codigo en estaciones de trabajo con hardware Tenstorrent: el soporte de tool calling y el razonamiento separado permiten integrar el servidor en flujos de edicion asistida y ejecucion de herramientas, con decodificacion exacta respecto al modelo de referencia.
- Agentes de un solo hilo con llamadas a herramientas: el modelo puede encadenar razonamiento y `tool_calls` en tareas de automatizacion donde no se requiere atender a varios usuarios simultaneos.
- Analisis de documentos largos y recuperacion de informacion: con 131.072 tokens de contexto y prefill a unos 350 tokens por segundo, es viable procesar informes, contratos o bases de codigo de gran extension en una sola pasada.
- Razonamiento matematico asistido: el rendimiento medido en GSM8K (97,0% en greedy con esfuerzo de razonamiento `none`) lo hace util para tutoria o verificacion de calculos paso a paso.
- Evaluacion e investigacion de estrategias hibridas de inferencia MoE: el paquete sirve como banco de pruebas para medir el impacto de la colocacion parcial de expertos en dispositivo frente a CPU sobre latencia y calidad.
- Despliegue en entornos con hardware Tenstorrent: equipos que ya disponen de p300x2 pueden servir un modelo de 276.000 millones de parametros sin infraestructura GPU convencional, con un consumo de RAM de host de unos 60 GB.

## Benchmarks y rendimiento

| Evaluacion | Este paquete | Referencia | Prompts |
|---|---|---|---|
| Acuerdo top-1 de token, teacher forced frente a referencia BF16 en CPU | 0,866 (tokens confiados 0,947; KL 0,213) | Dos referencias BF16 coinciden en 0,925 | 8 x 1000 tokens reservados |
| GSM8K, greedy, esfuerzo de razonamiento `none` | 97,0% | no disponible | 200 |
| IFEval, greedy, esfuerzo `none` (estricto / laxo) | 88,0% / 90,0% | no disponible | 200 |

| Perfil | ISL | OSL | Concurrencia | N | TTFT | Prefill tok/s/u | Decode tok/s/u | E2EL |
|---|---|---|---|---|---|---|---|---|
| p300x2-128k | ~50 | 128 | 1 | 8 | 0,53 s | no disponible | 39,8 | 3,7 s |
| p300x2-128k, esfuerzo `none` | ~40 | 130-190 | 1 | 3 | 0,55 s | no disponible | 45,5 | 4,0 s |
| p300x2-128k | 914 | ~10 | 1 | 1 | 2,5 s | 361 | 40,2 | 2,8 s |
| p300x2-128k | 6.979 | ~10 | 1 | 1 | 19,0 s | 367 | 38,0 | 19,3 s |
| p300x2-128k | 27.815 | ~10 | 1 | 1 | 78,6 s | 354 | 38,2 | 78,9 s |
| p300x2-128k (6 hilos de prefill) | 104.192 | ~10 | 1 | 1 | 331 s | 315 | 38,5 | 331 s |

Mediciones realizadas en un QB2 a traves del endpoint OpenAI con `tt-model serve`, greedy, caches calientes, el 2026-11-15. El decode varia segun el texto (aceptacion especulativa y numero de expertos del token en dispositivo). La fila de 104K proviene del servidor de desarrollo con el mismo codigo (6 hilos de host en prefill en lugar de los 8 del paquete).

## Requisitos de hardware

- Hardware de computo: Tenstorrent p300x2 (malla `P300x2`, cuatro dies). No es compatible con GPU convencionales.
- CPU de host: requiere AVX-512 y 8 o mas nucleos para el kernel de expertos en host.
- RAM de host: unos 60 GB libres (copias int4 de los expertos no residentes, ~42 GB, mas el servidor); el servidor lo comprueba al arrancar (`HYB_RAM_CHECK=warn` para forzar el arranque).
- Disco: unos 720 GB (checkpoint BF16 ~550 GB, copias int4 ~42 GB e imagenes de dispositivo ~110 GB en la cache de pesos).
- Software: CLI de Tenstorrent (`tt`), Docker y `tt-model-manager` 0.1.0 (esquema de manifiesto 5.1). Despliegue mediante `tt serve raahemnabeel/inkling-small-hybrid-qb2` o `tt-model serve`.
- Primer arranque: compilacion de kernels y construccion de copias int4 (~6 min en 8 nucleos) e imagenes de dispositivo (~25 min); los arranques posteriores estan listos en pocos minutos.
- VRAM: no aplica (no hay GPU); la memoria relevante es la DRAM de los dies Tenstorrent y la RAM del host.
- Latencia y throughput medidos: TTFT de 0,53 s con prompts de ~50 tokens y de 331 s con 104.192 tokens; decode de 38-45,5 tokens por segundo por usuario; prefill de 315-367 tokens por segundo por usuario.
- Concurrencia: una secuencia como maximo (`max_num_seqs 1`); el procesamiento por lotes no esta soportado en la ruta hibrida.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Hardware | Notas |
|---|---|---|---|---|---|
| inkling-small-hybrid-qb2 (este paquete) | 276B / 12B | 131.072 | Apache 2.0 | Tenstorrent p300x2 | Colocacion hibrida de expertos, 1 secuencia concurrente, solo texto |
| thinkingmachines/Inkling-Small | 276B / 12B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Modelo base del paquete; mismo checkpoint subyacente |
| Alternativas de mismo tamano o tarea | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Un solo usuario a la vez: el procesamiento por lotes no esta soportado por la ruta hibrida, lo que descarta el uso multiusuario concurrente.
- Prefill lento en prompts largos: unos 350 tokens por segundo, lo que implica 331 s de TTFT para 104.192 tokens; los prompts muy largos penalizan la interactividad.
- Requisitos de infraestructura muy especificos: hardware Tenstorrent p300x2, CPU con AVX-512, 60 GB de RAM de host y 720 GB de disco; no es desplegable en GPU convencionales.
- Fidelidad no exacta al checkpoint BF16: el acuerdo top-1 de token es 0,866 (0,947 en tokens confiados), por debajo del 0,925 que alcanzan entre si dos referencias BF16; puede haber divergencias en la salida respecto al modelo original.
- Solo texto: no hay capacidades de vision ni audio en este paquete.
- Idiomas soportados: no disponible en la informacion proporcionada; no se puede confirmar cobertura multilingue.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; deben evaluarse antes de un uso en produccion.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y de las dependencias de despliegue (tt-model-manager, vLLM, Docker).
- Primer arranque costoso: varias decenas de minutos de compilacion y conversion, y latencias elevadas en las primeras peticiones tras una instalacion nueva.
- El campo `model` de las peticiones debe ser `thinkingmachines/Inkling-Small` (identificador de los pesos), no el nombre del paquete.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/raahemnabeel/inkling-small-hybrid-qb2
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-Small
- Commit de los pesos: 8cc5877b44d343f88b92086aa1fb72897950f06a
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Tenstorrent CLI y prerrequisitos: https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
