# flymy-ai/decision-4b-v1.5

## Resumen

Decision 4B v1.5 (nombre interno de la ejecucion de entrenamiento: `qwen35_4b_letter_h14_v67b`, tambien referido como FlyMyJev-4B preview) es un adaptador LoRA de FlyMy.AI sobre el modelo base Qwen/Qwen3.5-4B (4.000 millones de parametros, licencia Apache-2.0, descargado por separado). No es un modelo generativo: su funcion es resolver decisiones tipadas. Se le entrega un estado (un ticket, una politica junto con un caso, un log, una respuesta que hay que juzgar) y una pregunta con un conjunto cerrado de respuestas, y devuelve en una sola pasada forward una distribucion de probabilidad sobre cada opcion declarada. No se genera ni un solo token.

El modelo cubre tres tipos de peticion: `noul` (si/no), `choice` (eleccion entre opciones etiquetadas con una letra) y `score` (puntuacion). El readout se hace proyectando en fp32 el estado oculto del ultimo token del prompt sobre los logits de las letras de las opciones y aplicando softmax con una temperatura especifica por tipo de peticion (1,25 para `choice` y `score`; 0,40 para `noul`, de modo que la respuesta se comprometa cuando el modelo se inclina hacia un lado). La entrada admite hasta 16.384 tokens y el adaptador entrena 14,4 millones de parametros.

Es relevante porque ataca un problema distinto al de los modelos conversacionales: la salida esta restringida por construccion al conjunto de opciones declarado (una etiqueta fuera de ese conjunto es imposible que aparezca) y ademas viene acompanada de una probabilidad, lo que permite fijar umbrales, medir calibracion y derivar abstención. La model card reporta mejoras sustanciales sobre el modelo base congelado en la suite publica JevBench (80,1 -> 88,7 en los 231 items publicos) y tiempos de p50 de 18,9 ms por decision corta en una RTX 4090. El proyecto es independiente: no es un lanzamiento de TypeSafe, no esta afiliado a el y no reconstruye la implementacion cerrada de Jev.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT/LoRA sobre el transformer Qwen3.5-4B. Los modulos objetivo del adaptador incluyen proyecciones de atencion estandar (q_proj, k_proj, v_proj, o_proj) y proyecciones asociadas a capas de atencion lineal (in_proj_qkv, in_proj_z, in_proj_a, in_proj_b), lo que apunta a una arquitectura hibrida en el modelo base; el runtime compila kernels Triton de flash-linear-attention |
| Parametros totales | Modelo base: 4.000 millones (Qwen/Qwen3.5-4B). Adaptador: 14,4 millones de parametros entrenables |
| Parametros activos | No aplica, no es un modelo MoE |
| Longitud de contexto | Hasta 16.384 tokens de entrada |
| Tipos de cuantizacion | No disponible. El repositorio publica unicamente el adaptador; no se ofrecen pesos GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT, 0,1 GB de repositorio); el modelo base se descarga aparte en su formato original |

Configuracion del adaptador: LoRA de rango 16, alpha 32, dropout 0,05.

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-4B, fijado en la revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`. El prompt es la plantilla de chat con el modo thinking desactivado y un unico mensaje de usuario en JSON con la estructura `{evidence, criterion, options[{letter, description}]}`, con descripciones en el formato `"<key>: <text>"` y las opciones de si/no ordenadas como `true` y luego `false` (formato de SemIf, MIT). La lectura de la decision no usa generacion: se toma la proyeccion fp32 del estado oculto del ultimo token del prompt sobre los logits de las letras de las opciones, y se aplica softmax con la temperatura configurada por tipo de peticion en `model.json`. En produccion el LoRA se pliega dentro del modelo base al cargar, y se captura un grafo CUDA por cada longitud de entrada con padding.

El entrenamiento consistio en una unica ejecucion, sin fusionar runs ni ensembles: 2 epocas, 986 pasos con un maximo de 12.288 tokens con padding (11,1 millones de tokens), learning rate 3e-05 con warm-up y decaimiento coseno, entropia cruzada sobre los logits de las letras de las opciones (la distribucion exacta cuando el item declara una sola), opciones de tipo `choice` barajadas en cada pasada y semilla 99. La forma de la receta sigue a JevK5 v0.2 (allebee/jevk5, Apache-2.0). Los datos son propios mas conjuntos publicos con licencia revisada; segun el autor, no se uso ningun item de JevBench ni salida de Jev para entrenamiento, ajuste ni seleccion de modelo. La temperatura se ajusto sobre un split de calibracion propio y el conjunto de desarrollo dificil, nunca sobre items de benchmark.

## Capacidades

- Decision binaria si/no (`noul`) con distribucion de probabilidad sobre `true` y `false`, usando una temperatura baja (0,40) para forzar el compromiso de la respuesta.
- Eleccion entre opciones cerradas (`choice`): devuelve una probabilidad por cada opcion etiquetada con una letra declarada en la peticion.
- Puntuacion en escala (`score`), tambien como distribucion sobre las opciones declaradas.
- Salida restringida por construccion: por el metodo de readout, no puede emitir una etiqueta que no este en el conjunto de opciones.
- Procesamiento de evidencias largas: admite politicas, casos y logs de hasta 16.384 tokens.
- Devolucion de metadatos operativos en la respuesta: `probabilities`, `input_tokens` y `seconds`.
- Calibracion explicita: ECE 0,112 en el tier hard publico a la temperatura servida y fidelidad 89,2 a las distribuciones gold exactas (1 menos la distancia de variacion total media).
- Capacidad de abstención: la familia de abstention del conjunto de desarrollo propio pasó de 60 a 95 (sobre 20 items).
- Servicio compatible con JevBench: `server.py` expone el formato de cable `/v1/systemone` de TypeSafe para el adaptador `typesafe`, y `jevbench_adapter.py` funciona en proceso.
- Ejecucion en CPU mediante `FLYMYJEV_DEVICE=cpu` (lenta, sin grafos CUDA).
- No dispone de capacidades de generacion de texto libre, vision, audio, tool calling ni agentes multi-paso: su salida es siempre una distribucion sobre un conjunto cerrado.

## Casos de uso

- Triaje de tickets con decision booleana: el modelo recibe el texto del ticket junto con el criterio interno y responde si cumple o no una condicion (por ejemplo, si procede escalar). La ventana de 16.384 tokens permite incluir el hilo completo de la conversacion y la politica de escalado en una sola peticion.
- Aprobacion o denegacion de reembolsos bajo politica: el ejemplo de la propia model card evalua "los reembolsos requieren recibo y compra en los ultimos 30 dias" contra el caso concreto del cliente. El resultado es una probabilidad que se puede umbralizar o enviar a revision humana cuando cae en la zona intermedia.
- Evaluacion automatica de respuestas (LLM-as-judge con salida cerrada): dado un par de respuesta y criterio, el modelo puntua con `score` o elige entre opciones de calidad. Al no generar texto, se elimina el riesgo de que el juez se salga del formato o invente categorias.
- Clasificacion de logs y alertas: con el log como evidencia y un criterio de severidad, se obtiene directamente la distribucion sobre las categorias declaradas, apto para enrutar alertas en pipelines de observabilidad.
- Guardrails y filtrado en pipelines de agentes: colocado antes o despues de un LLM generativo, decide si la salida cumple una politica declarada. La latencia de p50 18,9 ms y p95 22,0 ms en RTX 4090 lo hace viable como paso sincrono dentro del bucle del agente.
- Verificacion de cumplimiento normativo o de politica interna: dada una clausula y un caso, responder si el caso esta cubierto. La familia de politicas largas es la mas debil del modelo (55 -> 55 en el conjunto de desarrollo propio), por lo que conviene acompanarla de revision humana en ese escenario concreto.
- Enrutamiento de casos entre equipos con opciones cerradas: el tipo `choice` devuelve la probabilidad de cada destino declarado, lo que permite aplicar umbrales de confianza y dejar los casos ambiguos en una cola general.
- Deteccion de trampas adversarias y parafrasis: la familia de adversarial traps paso de 50 a 80 y la de robustez ante parafrasis de 55 a 95 en el conjunto de desarrollo propio, lo que lo hace util en revision de contenido donde se intenta reformular una misma peticion prohibida.
- Servicio de decisiones de baja latencia en produccion: al plegarse el LoRA en el modelo base y capturar grafos CUDA, se puede servir con p50 inferior a 20 ms por decision corta en una unica GPU de gama consumer.

## Benchmarks y rendimiento

Mediciones del propio autor sobre la misma GPU, en la misma sesion y con el mismo prompt, comparando el modelo base congelado con este adaptador. El tier de juez y el conjunto sellado de JevBench no son publicos y no se incluyen.

| Conjunto | Qwen3.5-4B congelado | Este modelo | Arreglados / roto | Referencia |
|---|---:|---:|---:|---|
| JevBench publico, hard (111) | 61,3 | 76,6 | 24 / 7 | Jev 1.13: 74,1 en el tier hard completo (220 items, 109 reservados) |
| JevBench publico, standard (72) | 97,2 | 100,0 | 2 / 0 | No disponible |
| JevBench publico, easy (48) | 97,9 | 100,0 | 1 / 0 | No disponible |
| JevBench publico, los 231 items | 80,1 | 88,7 | 27 / 7 | Jev 1.13: 86,6 |
| Conjunto hard de desarrollo propio (160, 8 familias) | 42,5 | 70,6 | 56 / 11 | Jev 1.13: 57,5 |
| Conjuntos de casos reales v1-v3 (407) | 88,9 | 90,7 | 21 / 14 | Jev 1.13: 94,6 / 97,8 / 98,9 en v1 / v2 / v3 |

Desglose por familia en el conjunto hard de desarrollo propio (congelado -> este modelo, 20 items por familia): fechas y numeros 10 -> 60; robustez ante parafrasis 55 -> 95; compromisos (trade-offs) 25 -> 65; abstención 60 -> 95; busquedas multi-salto 30 -> 65; trampas adversarias 50 -> 80; politicas largas 55 -> 55; evaluacion de respuestas 55 -> 50.

Calibracion en el tier hard publico a la temperatura servida: ECE 0,112; fidelidad a las distribuciones gold exactas 89,2 (1 menos la distancia de variacion total media).

Verificacion del paquete (29 de septiembre de 2026): el paquete publicado se ejecuto en una RTX 4090 contra el arnes JevBench v1.4.2 sobre los 231 items publicos. Tanto el runner oficial con `jevbench_adapter.py` como `server.py` con el adaptador `typesafe` del arnes leyeron 204/231 (easy 48/48, standard 72/72, hard 84/111). Detalles en `package_check.json`.

## Requisitos de hardware

- El autor reporta tiempos medidos en una unica RTX 4090: p50 18,9 ms y p95 22,0 ms por decision corta con grafos CUDA; 54 ms en modo eager. No se publican cifras de throughput ni de VRAM.
- Estimacion de VRAM (no publicada por el autor, calculada a partir del tamano): el modelo base de 4.000 millones de parametros en bf16 ocupa en torno a 8 GB solo en pesos, mas el cache de KV correspondiente a una ventana de hasta 16.384 tokens y el estado de los grafos CUDA capturados. Cabe en GPUs consumer de 24 GB (RTX 3090, RTX 4090) con margen y, previsiblemente, en tarjetas de 16 GB con contexto reducido; no hay confirmacion publicada para 8-12 GB y no se ofrecen cuantizaciones que lo faciliten.
- El modelo esta validado explicitamente en RTX 4090. No se documenta soporte verificado en A100, H100 ni otras GPUs.
- Requisito de runtime: se necesita un compilador de C en tiempo de ejecucion (por ejemplo `build-essential`), porque los kernels Triton de flash-linear-attention se compilan en la primera peticion y la captura de grafos CUDA al cargar tambien los necesita.
- Ejecucion en CPU posible con `FLYMYJEV_DEVICE=cpu`, descrita como lenta y sin grafos CUDA.
- Carga: `model.load()` verifica cada archivo contra `manifest.json` y rechaza enlaces simbolicos, por lo que una snapshot de la cache de Hugging Face (cuyos archivos son enlaces a `blobs/`) debe copiarse antes a un directorio real, por ejemplo con `huggingface-cli download --local-dir`.
- Opciones de despliegue: el repositorio incluye su propio `model.py`, un `server.py` que sirve el formato de cable `/v1/systemone` de TypeSafe para el adaptador `typesafe`, un `jevbench_adapter.py` en proceso y un `run_jevbench.py` para el runner oficial sin editar su registro. No se documenta integracion con vLLM, llama.cpp, Ollama ni TGI, y al no haber pesos GGUF no es desplegable en llama.cpp u Ollama.
- Latencia y throughput: solo se publican latencias por decision (p50/p95). El throughput agregado no esta disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento relevante | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decision 4B v1.5 (este modelo) | 4B base + 14,4 M de adaptador | 16.384 tokens de entrada | JevBench publico 231: 88,7; hard 111: 76,6; hard propio: 70,6; p50 18,9 ms en RTX 4090 | Apache-2.0 | Adaptador safetensors en Hugging Face |
| Qwen3.5-4B congelado (modelo base) | 4B | No especificado en la informacion disponible | JevBench publico 231: 80,1; hard 111: 61,3; hard propio: 42,5 | Apache-2.0 | Pesos completos en Hugging Face |
| Jev 1.13 (referencia) | No disponible | No disponible | JevBench hard completo (220): 74,1; publico 231: 86,6; hard propio: 57,5; casos reales v1/v2/v3: 94,6 / 97,8 / 98,9 | No disponible (implementacion cerrada) | No disponible |
| flymy-ai/decision-4b v1.1, v1.2, v1.4 | 4B base + adaptador LoRA | No disponible en la informacion recogida | No disponible en la informacion recogida | Apache-2.0 | Adaptadores safetensors en Hugging Face |
| JevK5 v0.2 (allebee/jevk5) | No disponible | No disponible | No disponible | Apache-2.0 | Referencia de receta de entrenamiento, no comparativa de rendimiento |

Nota: el autor indica que el tier de juez y el conjunto sellado de JevBench no son publicos y que no reclama ninguna posicion en el ranking de JevBench. Las comparaciones con Jev 1.13 provienen de mediciones del propio autor sobre conjuntos publicos y propios, no de una evaluacion independiente.

## Limitaciones y advertencias

- Sesgo de primera opcion: el conjunto de casos reales v3 coloca la respuesta gold en la opcion A en el 46 % de sus items de tipo `choice`; el modelo base acierta ahi por costumbre de elegir la primera opcion y el entrenamiento la elimina. El autor advierte que v3 debe leerse teniendo esto en cuenta.
- La familia de evaluacion de respuestas empeora respecto al modelo base: 55 -> 50 en el conjunto de desarrollo propio (20 items). Juzgar respuestas con este modelo es un punto debil medido.
- La familia de politicas largas no mejora nada: 55 -> 55 en el mismo conjunto. Con evidencias extensas el adaptador no aporta ganancia sobre el modelo base.
- El modelo no genera texto. Cualquier caso de uso que requiera una explicacion redactada, un resumen o una respuesta libre queda fuera de su alcance por diseno.
- Solo ingles. La model card declara `language: en` y no se documenta comportamiento en castellano ni en otros idiomas.
- Calibracion imperfecta: ECE 0,112 en el tier hard publico a la temperatura servida. Umbralizar las probabilidades sin tener en cuenta este error puede producir decisiones mal calibradas.
- Las temperaturas por tipo de peticion se ajustaron sobre datos propios (split de calibracion y conjunto hard de desarrollo), no sobre items de benchmark. Cambiar de dominio puede requerir recalibrar.
- La calidad en dominios distintos de los entrenados no esta caracterizada: los conjuntos propios v1-v3 muestran 90,7 de media frente a 94,6 / 97,8 / 98,9 de la referencia Jev 1.13, es decir, el modelo queda por detras de la implementacion cerrada en casos reales aunque la supere en las suites publicas y en el conjunto hard propio.
- Dependencia de la revision exacta del modelo base (`851bf6e8...`). Usar otra revision invalida las mediciones publicadas.
- Requisito operativo fragil: hace falta un compilador de C en el entorno de ejecucion y `model.load()` rechaza enlaces simbolicos, lo que complica el uso directo de la cache de Hugging Face en contenedores.
- No hay cuantizaciones publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware con poca VRAM y descarta llama.cpp u Ollama.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y la model card se autodescribe como preview, con un nombre de ejecucion interno (`qwen35_4b_letter_h14_v67b`). No hay evaluacion independiente de los numeros publicados.
- Proyecto independiente: no es un lanzamiento de TypeSafe, no esta afiliado a el y no reconstruye la implementacion cerrada de Jev. La licencia Apache-2.0 del adaptador es permisiva para uso comercial, pero el modelo base se rige por su propia licencia Apache-2.0 y debe descargarse y verificarse por separado.
- Riesgo de alucinacion: al restringirse la salida a las opciones declaradas, no puede inventar etiquetas, pero si puede asignar alta probabilidad a una opcion incorrecta dentro del conjunto. El riesgo se traslada al umbral de decision, no al formato.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flymy-ai/decision-4b-v1.5
- Version anterior v1.2: https://huggingface.co/flymy-ai/decision-4b-v1.2
- Version anterior v1.1: https://huggingface.co/flymy-ai/decision-4b-v1.1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B (revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`)
- Organizacion FlyMy.AI en Hugging Face: https://huggingface.co/flymy-ai
- Sitio de FlyMy.AI: https://flymy.ai/
- Organizacion FlyMy.AI en GitHub: https://github.com/FlyMyAI/
- Receta de entrenamiento de referencia JevK5 v0.2 (allebee/jevk5, Apache-2.0): no disponible en los resultados de busqueda
- Formato SemIf (MIT): no disponible en los resultados de busqueda
- Arnés JevBench (version v1.4.2 citada en la model card): no disponible en los resultados de busqueda
- Archivos auxiliares citados en la model card: `model.py`, `server.py`, `jevbench_adapter.py`, `run_jevbench.py`, `manifest.json`, `model.json`, `package_check.json`, `package_check.json` (todos dentro del repositorio del modelo)
