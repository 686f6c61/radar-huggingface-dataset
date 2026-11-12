# manavoncloud/BRIHAS-0.6B

## Resumen

BRIHAS-0.6B es un modelo de lenguaje decoder-only de 0,6 mil millones de parametros desarrollado por manavoncloud como motor del asistente BRIHAS integrado en la aplicacion Vayku. Su proposito es ejecutarse en la CPU de un ordenador convencional, sin tarjeta grafica y con poca memoria RAM, ofreciendo respuestas cortas, resumenes de la pagina abierta y tareas sencillas de navegador mediante llamadas a herramientas.

No se trata de un modelo entrenado desde cero: es un fine-tune con adaptadores LoRA (unos 10 millones de parametros entrenables sobre 600 millones) de un modelo base con licencia Apache 2.0 no identificado en la informacion disponible, posteriormente fusionado y cuantizado a Q4_K_M. Se distribuye como un unico archivo GGUF de 397 MB (396.705.280 bytes) pensado para llama.cpp, con una ventana de contexto configurable de 4096 a 8192 tokens.

Su relevancia radica en el nicho: asistentes locales de bajo consumo que deben funcionar en equipos con 4-8 GB de RAM. No compite en calidad con modelos de mayor tamano, sino en huella de memoria (aproximadamente 1,35 GiB con ventana de 4096 y 1,7-1,8 GiB con 8192) y en soporte de tool calling mediante plantilla ChatML y `--jinja`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base no especificado) |
| Parametros totales | 596.049.920 (0,6 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 a 8192 tokens (configurable en llama.cpp) |
| Tipos de cuantizacion | Q4_K_M (unica publicada) |
| Idiomas soportados | Ingles e hindi (debil en otros idiomas) |
| Licencia | brihas-model-licence (license_name: brihas-model-licence, license: other) |
| Formato de pesos | GGUF (archivo `BRIHAS-0.6B-Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de un modelo base con licencia Apache 2.0 cuyo nombre no se indica en la informacion disponible. El proceso de creacion consistio en tres rondas consecutivas de fine-tuning con LoRA (aproximadamente 10 millones de parametros entrenables sobre 600 millones), continuando cada ronda desde el adaptador de la anterior. Se fusiono el adaptador del mejor paso de validacion de la ultima ronda (paso 14 de 27) en los pesos y se cuantizo el resultado a Q4_K_M. El empaquetado se realizo con `scripts/finetune/package_release.py` del proyecto Vayku version 1.0.0, que reescribe metadatos y compara cada tensor de salida con su entrada, con resultado registrado en `manifest.json`.

El entrenamiento se oriento a tareas concretas del asistente en navegador: respuestas rapidas en cinco formatos (respuesta simple, investigador, pensador, profesor y asesor), preguntas de seguimiento que referencian el turno anterior, respuestas fundamentadas en las lineas de la pagina abierta (incluyendo Hinglish y Devanagari, citando la linea en lugar de adivinar y admitiendo cuando la pagina no lo dice), respuestas a partir de extractos web numerados con citas y resistencia a instrucciones ocultas en ellos, y acciones de herramienta (abrir pagina, buscar, leer, hacer clic, rellenar, seleccionar, marcar, desplazar). No se detalla el volumen de tokens de entrenamiento ni la composicion exacta del dataset, y no se menciona RLHF ni DPO.

## Capacidades

- Generacion de texto conversacional con respuestas cortas y cierre limpio, en cinco formatos de respuesta predefinidos.
- Razonamiento basico con modo de pensamiento ("thinking") que puede desactivarse por peticion mediante `enable_thinking: false`.
- Comprension de preguntas de seguimiento que dependen del turno anterior ("por que?", "y Delhi?", "en hindi", "mas simple").
- Respuestas fundamentadas en el contenido de la pagina abierta, con citas de lineas y deteccion de ausencia de informacion.
- Sintesis a partir de extractos web numerados, con preferencia por la mayoria cuando los extractos discrepan e ignorando instrucciones embebidas en ellos.
- Tool calling / function calling mediante plantilla ChatML y soporte `--jinja` en llama.cpp.
- Acciones de navegador: abrir pagina, buscar, leer, hacer clic, rellenar, seleccionar, marcar y desplazar.
- Capacidades multilingues limitadas a ingles e hindi, con rendimiento notablemente inferior en hindi y en cualquier otro idioma.
- No dispone de vision, audio ni acceso a internet propio.

## Casos de uso

- Asistente de navegador integrado: el modelo gestiona conversaciones multi-turno cortas y responde sobre la pagina abierta citando lineas concretas, gracias a su ventana de 4096-8192 tokens y a su entrenamiento especifico en respuestas fundamentadas.
- Resumen de paginas web: sintetiza el contenido de las lineas que el navegador le pasa, con deteccion explicita de cuando la pagina no contiene la respuesta, lo que reduce alucinaciones en este escenario acotado.
- Automatizacion de tareas simples de navegador: mediante tool calling puede abrir paginas, buscar, hacer clic, rellenar formularios, seleccionar opciones y desplazarse, adecuado para flujos de pocos pasos en entornos controlados.
- Asistente local en equipos de bajos recursos: con aproximadamente 1,35 GiB de memoria a ventana 4096, es viable en ordenadores con 4-8 GB de RAM sin GPU, usando llama.cpp con `-c 4096` y `-t` a tres cuartos de los nucleos.
- Respuestas rapidas multilingues ingles-hindi: util para consultas breves y seguimientos en hindi o Hinglish, aunque con calidad inferior a la del ingles.
- Prototipado de pipelines de agentes en llama.cpp: sirve como modelo de pruebas para validar plantillas ChatML, tool calling y presupuestos de razonamiento antes de escalar a modelos mayores.
- Procesamiento de extractos web con citas: integrable en herramientas de investigacion ligera que pasan extractos numerados y requieren citar la fuente y priorizar la mayoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye puntuaciones de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y solo menciona que el adaptador fusionado corresponde al mejor paso de validacion (paso 14 de 27) de la ultima ronda de fine-tuning, sin cifras asociadas.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta disenado para CPU. Memoria del motor con el modelo cargado: aproximadamente 1,35 GiB con ventana de 4096 y 1,7-1,8 GiB con ventana de 8192.
- Memoria libre recomendada por Vayku antes de arrancar: aproximadamente 1,6 GiB con ventana de 4096 y aproximadamente 2 GiB con ventana de 8192.
- GPU: no requiere ninguna; no se han publicado requisitos ni recomendaciones de GPU.
- Cabe en cualquier equipo consumer con 4 GB de RAM o mas, siempre que haya memoria libre suficiente segun lo que este abierto; con 8 GB o menos se recomienda `-c 4096`.
- Despliegue: llama.cpp (probado con la release b12188), mediante `llama-server` con `--jinja`, `--reasoning-budget 96`, `-cram 256` y `-ctxcp 2`. Tamano del archivo: 397 MB. Hilos recomendados: aproximadamente tres cuartos de los nucleos disponibles.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Parametros de muestreo sugeridos por el autor: temperature 0.65, top_p 0.92, top_k 30, repeat_penalty 1.1, presence_penalty 0.3, frequency_penalty 0.1.
- Integridad: SHA-256 del archivo `f991263eb7d41244cc0885048d176eafc480fd0604abcbc9466ff15f80ec9417`, tambien en `SHA256SUMS` y `manifest.json`.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparacion con alternativas de tamano similar (por ejemplo, otros modelos de 0,5-1B en GGUF). El modelo base del que deriva tampoco se identifica, lo que impide una comparacion directa.

## Limitaciones y advertencias

- Los modelos pequenos cometen errores de hechos: BRIHAS-0.6B afirmara fechas, nombres, numeros y citas incorrectas con total seguridad; debe verificarse cualquier dato relevante contra la pagina o una fuente.
- Razonamiento pobre en cadenas largas de pasos; las paginas largas o enrevesadas superan lo que puede aprovechar bien. Rinde mejor en tareas cortas y simples.
- La salida en hindi y en otros idiomas no ingleses es notablemente mas debil que en ingles.
- Puede repetirse, ignorar instrucciones o llamar a una herramienta con argumentos incorrectos; el navegador mitiga parte de esto, pero el modelo no lo hace por si mismo.
- No tiene conocimiento de eventos posteriores al final de sus datos de entrenamiento ni acceso a internet propio.
- No se ha realizado ninguna evaluacion de seguridad especifica para BRIHAS-0.6B; puede producir texto sesgado o inapropiado.
- Uso no previsto: consejo medico, legal o financiero, cualquier situacion en la que una respuesta erronea cause dano, o tareas que exijan hechos fiables sin verificacion.
- Licencia: `brihas-model-licence` (license: other), distinta de la Apache 2.0 del modelo base. Las condiciones exactas de uso comercial no se detallan en la informacion disponible; debe consultarse el archivo `LICENSE` del repositorio antes de cualquier despliegue en produccion.
- El servidor de llama.cpp debe escuchar solo en la direccion de loopback (127.0.0.1); el autor advierte explicitamente de mantenerlo asi.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/manavoncloud/BRIHAS-0.6B
- llama.cpp (repositorio, release b12188 probada): https://github.com/ggml-org/llama.cpp
- Archivo de licencia del modelo: https://huggingface.co/manavoncloud/BRIHAS-0.6B/blob/main/LICENSE
- Manifiesto de empaquetado: https://huggingface.co/manavoncloud/BRIHAS-0.6B/blob/main/manifest.json
- Sumas SHA-256: https://huggingface.co/manavoncloud/BRIHAS-0.6B/blob/main/SHA256SUMS
