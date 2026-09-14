# Joakimpalm-Zen/Muse-Glimmer-30B-Surgical-6p34-Q4_K-recovered-GGUF

## Resumen

Muse-Glimmer-30B-Surgical-6p34-Q4_K-recovered es un artefacto GGUF publicado por Joakimpalm-Zen, derivado de la familia Muse-Glimmer-30B (con `meta-models/Muse-Glimmer-30B` como modelo original y `Joakimpalm-Zen/Muse-Glimmer-30B-Surgical-Q8_0-GGUF` como base directa). Se trata de un modelo de lenguaje del que se ha eliminado quirurgicamente el 6,34 % del decodificador (las subcapas FFN de las capas 4, 7, 9 y 48), retrenando una FFN por cada corte, y sobre el que se ha aplicado despues una recuperacion por destilacion de las escalas de cuantizacion. El resultado es un fichero de 14,61 GiB en Q4_K que conserva los mismos pesos que la publicacion Q8_0 de la misma cirugia.

Su relevancia es fundamentalmente metodologica: el estudio de cirugia original habia establecido que el modelo del 6,34 % no podia publicarse en Q4_K, porque el coste de la cirugia en BF16 (KLD 0,03857) sumado al termino de cuantizacion (0,01930) daba aproximadamente 0,056, por encima del umbral interno. Esta publicacion ataca ese segundo termino en lugar del primero: retrena los campos de escala `d` y `dmin` en fp16 de 416 tensores Q4_K contra el padre BF16 congelado, reduciendo el KLD medido a 0,04949 con un top-1 margin-qualified del 97,90 % sobre la particion de validacion de 45.056 posiciones, lo que la situa dentro del criterio de aceptacion.

El modelo cuenta con 27.854.794.240 parametros reales registrados en safetensors, aunque se comercializa bajo la denominacion comercial "30B". Es un modelo denso, orientado a ejecucion local mediante el runner propio del autor (`xyntetik-runner`), y se distribuye bajo licencia Apache-2.0. No hay datos publicados sobre descargas o valoraciones (0 descargas, 0 likes) ni benchmarks estandar en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con cirugia de profundidad (subcapas FFN de las capas 4, 7, 9 y 48 anuladas); arquitectura base no detallada en la informacion disponible |
| Parametros totales | 27.854.794.240 (27,85 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (la model card no la especifica; el entrenamiento de recuperacion uso ventanas de 2.048 tokens) |
| Tipos de cuantizacion | Q4_K (este repositorio); Q8_0 y BF16 en las variantes de la misma familia; 418 tensores en Q4_K y el resto en F32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`Muse-Glimmer-30B-surgical-6p34-Q4_K-recovered.gguf`, 14,61 GiB) |

## Arquitectura y entrenamiento

El punto de partida es un transformer decoder al que se le ha practicado una cirugia de profundidad: las subcapas FFN de las capas 4, 7, 9 y 48 se han puesto a cero, y la primera FFN superviviente aguas abajo de cada corte (capas 5, 8, 10 y 49) se ha retrenado contra el padre congelado sobre el corpus auditado `corpus_run9` con una dosis de 14,4x. Esos pesos son los de la publicacion Q8_0 (`run9_d14x_bf16.gguf`). En este fichero, los 12 tensores FFN eliminados se almacenan como ceros exactos con la forma estandar, de modo que cualquier runtime capaz de cargar el GGUF padre carga este fichero sin cambios en el loader.

La innovacion de esta version esta en la capa de cuantizacion. Con el cuantizador propio del autor (`--quant q4_k`), el fichero sin recuperar obtiene un KLD de 0,05615 y un 97,41 % de top-1, lo que supone un FAIL. La recuperacion retrena unicamente los campos de escala `d` y `dmin` en fp16 de cada bloque de 416 tensores Q4_K, lo que supone 196.591.616 campos entrenados; los codigos enteros, los tensores F32, las escalas de embedding y de la cabeza de salida, los metadatos y los offsets permanecen inalterados, y la longitud en bytes es identica a la del fichero sin recuperar. El entrenamiento fue de 400 pasos sobre una unica ventana de 2.048 tokens de `corpus_run9` (0,82 M de tokens, con 20 de sus 474 secuencias reservadas como proxy de dev), con learning rate 3e-4 coseno y KL forward top-64 hacia el padre, dejando entrenables solo las escalas. La mayor variacion introducida en cualquier peso decodificado fue de 0,0071.

El hallazgo tecnico destacable es la sub-aditividad: el control preregistrado (misma recuperacion sobre el Q4_K del padre, sin cirugia) bajo el KLD de 0,01930 a 0,01518, y el fichero quirurgico medido se queda en 0,04949 frente a la prediccion aditiva de 0,05375, lo que implica un factor de apilamiento de 0,921. Es decir, las escalas entrenadas contra el padre recuperan tambien parte del error de cirugia, refutando la ley de independencia entre coste de cuantizacion y coste de cirugia que sostenian los cinco puntos previos del estudio.

## Capacidades

- Generacion de texto autoregresiva y conversacion: el repositorio esta etiquetado como `conversational`.
- Razonamiento, codigo, matematicas, vision, audio: no disponible; la model card no documenta ninguna de estas capacidades.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no esta cumplimentado).
- Capacidad especial: modo "thinking" no documentado; la unica particularidad destacada es la recuperacion por destilacion de escalas de cuantizacion y la compatibilidad con `xyntetik-runner` para servir el modelo en GPU.
- Compatibilidad de despliegue: etiqueta `endpoints_compatible`, con servidor HTTP integrado en el runner del autor.

## Casos de uso

- Inferencia local en GPU de gama alta para consumo: con 14,61 GiB en Q4_K, el fichero esta pensado para residir en memoria de GPU y permite ejecutar un modelo de ~27,85 B de parametros en una unica tarjeta, sin depender de servicios en la nube.
- Investigacion en compresion y cuantizacion: el repositorio es un caso de estudio reproducible sobre recuperacion de escalas Q4_K contra un padre BF16 congelado, con ficheros sidecar (`SURGERY.json`, `RECOVERY.json`) que documentan cada cambio, lo que lo hace util para replicar o rebatir la metodologia.
- Experimentos de cirugia de profundidad en transformers: sirve como referencia para estudiar el impacto de eliminar subcapas FFN completas y retrenar la FFN siguiente, con metricas KLD y margin-qualified top-1 ya publicadas.
- Servicio HTTP compatible con clientes de endpoints: el runner expone un servidor en un puerto concreto, de modo que puede integrarse en un pipeline interno que consuma una API compatible con el estandar de endpoints.
- Chatbot o asistente conversacional autoalojado para entornos con requisitos de soberania de datos: al ser un GGUF Apache-2.0 ejecutable en local, evita enviar texto a terceros.
- Validacion de runtimes GGUF: dado que los 12 tensores eliminados se almacenan como ceros con la forma estandar, el fichero funciona como prueba de compatibilidad para loaders que ya soportan el GGUF padre.
- Analisis forense de artefactos cuantizados: la verificacion de que cada tensor parcheado se redecodifica a los pesos entrenados y que el resto es identico byte a byte es aplicable a auditorias de integridad de ficheros GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card menciona una "benchmark annex" sobre validacion de HellaSwag, pero el texto proporcionado esta truncado y no incluye cifras. Los datos disponibles son metricas de divergencia respecto al padre BF16.

Estudio de referencia (`run6_x1_score.py`), 11 secuencias de validacion y 45.056 posiciones, padre BF16 congelado:

| Artefacto | Tamano | KLD | margin-q | Veredicto |
|---|---:|---:|---:|---|
| Este fichero: cirugia + Q4_K + escalas recuperadas | 14,61 GiB | 0,04949 | 97,90 % | PASS |
| Cirugia + Q4_K, sin recuperar | 14,61 GiB | 0,05615 | 97,41 % | FAIL |
| Mismos pesos en Q8_0 (publicado) | 27,58 GiB | 0,03883 | 98,34 % | PASS |
| Mismos pesos en BF16 | 51,90 GiB | 0,03857 | 98,38 % | PASS |
| Padre en Q4_K (control) | 14,61 GiB | 0,01930 | 99,12 % | PASS |
| Padre en Q4_K, recuperado (control) | 14,61 GiB | 0,01518 | 99,43 % | PASS |

Fidelidad en runtime (`scripts/kld-compare-raw.py`), ambos modelos en CPU, 500 posiciones de la particion de validacion detokenizada, banda de empate de 0,5 nats:

| Frente al padre BF16 | KLD medio | top-1 | margin-q | top-8 |
|---|---:|---:|---:|---:|
| Cirugia + Q4_K, sin recuperar | 0,0519 | 95,20 % | 98,80 % | 0,837 |
| Este fichero | 0,0474 | 95,40 % | 98,80 % | 0,849 |

Ambos instrumentos coinciden: el fichero sin recuperar falla el termino KLD y este lo supera. El intervalo emparejado de la pareja de 500 posiciones incluye el cero, mientras que el scorer de estudio sobre 45.056 posiciones resuelve la misma pareja a 9,4x el suelo de ruido del estudio (±0,00071).

## Requisitos de hardware

- VRAM estimada para inferencia: 14,61 GiB para el fichero Q4_K (el autor indica que Q4_K es "GPU-resident" en `xyntetik-runner`). Para la variante Q8_0 publicada, 27,58 GiB; para el padre en BF16, 51,90 GiB.
- GPU recomendadas: no disponible; la model card no enumera modelos concretos de GPU. Por tamano de VRAM, el fichero Q4_K es compatible con tarjetas consumer de 16 GB o mas (gama RTX 4080/4090 y equivalentes); la variante Q8_0 requiere tarjetas de 32 GB o mas (V100 32GB, A100 40GB) y el BF16 requiere 80 GB (A100/H100 80GB).
- Cabida en GPU consumer: si para el fichero Q4_K de 14,61 GiB en tarjetas con al menos 16 GB de VRAM; no para las variantes Q8_0 ni BF16.
- Opciones de despliegue: `xyntetik-runner` con `--serve --port 8080` o en modo prompt directo (`-p ... -n ...`). El autor afirma compatibilidad a nivel de loader con cualquier runtime que ejecute el GGUF padre, ya que los tensores eliminados se almacenan como ceros en la forma estandar. vLLM, llama.cpp, Ollama o TGI no se mencionan explicitamente en la informacion disponible.
- Latencia y throughput: no disponible; no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos de terceros comparables. La comparacion posible es dentro de la propia familia de artefactos:

| Artefacto | Parametros | Tamano | KLD | margin-q | Licencia | Formato |
|---|---:|---:|---:|---:|---|---|
| Este fichero (cirugia + Q4_K + escalas recuperadas) | 27,85 B | 14,61 GiB | 0,04949 | 97,90 % | Apache-2.0 | GGUF Q4_K |
| Muse-Glimmer-30B-Surgical Q8_0 | 27,85 B | 27,58 GiB | 0,03883 | 98,34 % | Apache-2.0 | GGUF Q8_0 |
| Muse-Glimmer-30B-Surgical en BF16 | 27,85 B | 51,90 GiB | 0,03857 | 98,38 % | Apache-2.0 | BF16 |
| Muse-Glimmer-30B padre en Q4_K | no disponible | 14,61 GiB | 0,01930 | 99,12 % | Apache-2.0 | GGUF Q4_K |
| Muse-Glimmer-30B padre en Q4_K recuperado | no disponible | 14,61 GiB | 0,01518 | 99,43 % | Apache-2.0 | GGUF Q4_K |

Frente a modelos de otras familias del mismo rango de tamano (por ejemplo Llama, Mistral, Qwen), no hay datos comparativos en la informacion disponible.

## Limitaciones y advertencias

- Degradacion medible respecto al padre: incluso tras la recuperacion, el KLD es de 0,04949 frente a 0,03857 en BF16 y 0,03883 en Q8_0, y el margin-qualified top-1 baja del 98,38 % al 97,90 %.
- Cirugia irreversible: el 6,34 % del decodificador esta eliminado y 12 tensores FFN se almacenan como ceros exactos; no es posible recuperar la capacidad original sin volver a los pesos padre.
- Dependencia del runtime: la recuperacion modifica las escalas de cuantizacion de 416 tensores Q4_K. Aunque la longitud en bytes es identica y el autor afirma compatibilidad de loader, cualquier runtime que aplique su propia logica de escalas o reconvierta el fichero puede perder la ganancia.
- Ausencia de validacion externa: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y las metricas proceden del propio estudio del autor, con instrumentos y umbrales definidos por el mismo equipo.
- Idiomas no documentados: no hay informacion sobre cobertura multilingue, por lo que el rendimiento fuera del ingles (u otros idiomas del corpus de entrenamiento) es desconocido.
- Longitud de contexto no especificada: la model card no publica la ventana de contexto del modelo; los 2.048 tokens corresponden a la ventana de entrenamiento de la recuperacion, no al contexto de inferencia.
- Riesgo de alucinacion: no se documentan evaluaciones de factualidad ni tasas de alucinacion.
- Tool calling y agentes: no hay soporte documentado, por lo que no debe asumirse en pipelines que dependan de function calling.
- Licencia: Apache-2.0 permite uso comercial sin restricciones adicionales conocidas, pero se hereda la licencia del modelo base; conviene verificar la cadena completa (`meta-models/Muse-Glimmer-30B`) antes de un despliegue en produccion.
- Corpus de recuperacion muy reducido: 0,82 M de tokens y 400 pasos sobre ventanas de 2.048 tokens; la propia model card reconoce que la prediccion del modelo rung-2 es una hipotesis escrita antes de ser probada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Joakimpalm-Zen/Muse-Glimmer-30B-Surgical-6p34-Q4_K-recovered-GGUF
- Modelo base directo (Q8_0): https://huggingface.co/Joakimpalm-Zen/Muse-Glimmer-30B-Surgical-Q8_0-GGUF
- Modelo original de la familia: https://huggingface.co/meta-models/Muse-Glimmer-30B
- La busqueda web realizada no devolvio enlaces relevantes al modelo (los resultados obtenidos corresponden a sitios genericos de efemerides historicas y no guardan relacion con el artefacto).
