# elyanlabs/elya-snes

## Resumen

elya-snes es un transformador de lenguaje en miniatura que se ejecuta en el hardware original de una Super Nintendo, sin chip de mejora (ni SuperFX ni DSP), sobre la CPU Ricoh 5A22 a 2,68 MHz. Lo desarrolla Elyan Labs (Scottcjn) como parte del proyecto "Transformers on Retro Game Consoles", que incluye ports hermanos para NES, Genesis, Nintendo 64 y Game Boy Color. El repositorio alojado en Hugging Face es solo una copia del codigo fuente: nada se ejecuta en la infraestructura de Hugging Face.

El modelo es un transformer decoder de tres capas, dos cabezas, vocabulario de 64 simbolos y 20 posiciones de contexto, con 102.400 pesos ternarios (54.830 no nulos) y activaciones de 4 bits. Se entreno con quantisation-aware training para que el forward pass del entrenador sea exactamente el que ejecuta el ensamblador del 65816, y se valido contra una referencia entera exacta en host sobre 1.280 tokens, simbolo a simbolo del vocabulario y elemento a elemento del residual y de la salida de atencion.

Su relevancia no esta en la calidad del lenguaje, sino en la demostracion de ingenieria: inferencia de un transformer medida en ciclos reales de consola (7,030 tok/s en SlowROM y 8,019 tok/s en FastROM sin el juego), un cartucho jugable de tres actos que pierde un 20% de throughput al convertirse en juego, y un mecanismo contable (una moneda solo puede generarse desde la ruta que confirma un token) que permite auditar la inferencia pausando el video. Sabe 70 hechos preguntados de 729 formas y acierta el 33,6% ± 2,8 de parafrasis no vistas como modelo unico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, 3 capas, 2 cabezas de atencion, 20 posiciones de contexto |
| Parametros totales | 102.400 pesos ternarios (54.830 no nulos) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 20 posiciones (tokens) |
| Tipos de cuantizacion | Pesos ternarios en {-1, 0, +1}; activaciones de 4 bits; quantisation-aware training (QAT) |
| Idiomas soportados | Ingles (corpus de 70 hechos en ingles); no se declara soporte multilingue. Metadatos oficiales de idioma: no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ROM .sfc (SlowROM y FastROM), modelo de referencia .npz, fuente en ensamblador 65816 y C, scripts de entrenamiento en Python |
| Vocabulario | 64 simbolos |
| Plataforma de ejecucion | Super Nintendo / Super Famicom (CPU Ricoh 5A22, 2,68 MHz SlowROM / 3,58 MHz FastROM) |
| Throughput medido | 7,030 tok/s (SlowROM, solo motor); 8,019 tok/s (FastROM, solo motor) |
| Fecha de publicacion del repo | 2026-10-23 |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

Transformer decoder-only de tres capas y dos cabezas con embeddings de 64 simbolos y ventana de 20 posiciones. Los pesos son ternarios, lo que en el 65816 aprovecha la multiplicacion con signo gratuita del hardware: aun asi, la medicion del autor indica que los pesos ternarios seguian siendo 2,02 veces mas baratos que int8 porque el cuello de botella es el trafico de memoria, no la aritmetica. El modelo se entreno con QAT para que el forward pass fuera identico bit a bit al que ejecuta la consola; la validacion se hizo contra una referencia entera exacta en host sobre 1.280 tokens (cada simbolo del vocabulario como semilla), en las dos variantes de reloj, comparando tambien el residual stream y la salida de atencion elemento a elemento.

La historia de entrenamiento esta documentada como una secuencia de intentos fallidos y correcciones. El primer cartucho se entreno con TinyStories y respondia a cualquier pregunta con un fragmento de cuento infantil. La entrada 10 lo reentreno con 34 hechos y dos formulaciones cada uno (68 cadenas): 97,4% en esas cadenas y solo 13,1% en parafrasis. La entrada 11 mantuvo la arquitectura y amplio el corpus a los mismos 34 hechos formulados de 345 maneras: 12,6% ± 1,4 a 21,7% ± 2,9 solo con el cambio de corpus, y 30,3% ± 1,4 al adaptar tambien la receta de entrenamiento. La entrada 12 doblo los hechos hasta 70, preguntados de 729 formas, con un resultado ambiguo que el autor reporta con dos cifras: en las mismas 137 preguntas retenidas la puntuacion con enrutado sube de 56,2% a 60,0%, mientras que en las 112 preguntas no objetivo del cambio de corpus baja de 68,0% a 58,2%. Es decir, olvido de conocimiento previo por un presupuesto fijo de 102.400 pesos ternarios.

El cartucho jugable anade una restriccion estructural: `gcommit` es el unico escritor de la cola de monedas y el spawner de vblank el unico lector, de modo que una moneda solo puede nacer del camino de codigo que confirma un token generado. Se verifico de tres formas: 118 monedas generadas + 0 en cola == 118 tokens confirmados; 104/104 muestras de traza satisfacen la identidad; y con `-DNOGEN` (forward pass eliminado, nada mas cambiado) se obtuvieron 1.707 frames, 0 tokens y 0 monedas.

## Capacidades

- Generacion de texto muy acotada: respuestas de una frase corta en ingles sobre un dominio cerrado de 70 hechos (identidad, proposito, su creador, el cartucho, conceptos como "token", "gradiente" o "multiplicacion").
- Generalizacion limitada a parafrasis: 33,6% ± 2,8 de acierto en preguntas retenidas reformuladas, medido como modelo unico; 52,9% ± 2,4 con cinco shards tematicos y un router por palabras clave (medido en host, no presente aun en la ROM).
- Modo de free-run: al no recibir prompt, se autoestimula y genera preguntas y respuestas propias (`b -> 'but i do get wrong.'`, `q -> 'quite slow, this chip.'`), usado en los actos 1 y 2 del cartucho.
- Ejecucion de inferencia en hardware real: forward pass completo en 65816 a 6,88 tok/s (SlowROM) y 7,85 tok/s (FastROM) segun la cabecera del README, con verificacion entera exacta.
- Integracion como activo jugable: el token generado dispara fisicamente la aparicion de una moneda en el plataformas, con contabilidad auditable.
- Capacidad de aritmetica: no disponible (no se documenta uso aritmetico mas alla del producto matricial interno).
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Vision, audio o multimodalidad: no disponible.
- Capacidades multilingues: no disponible (corpus y vocabulario en ingles).
- Modo thinking explicito: no disponible; no hay cadena de razonamiento, solo respuesta directa.

## Casos de uso

- Demostracion educativa en museos y ferias: ejecutar la ROM en una SNES real o en el emulador ares y mostrar en pantalla, con la regla de las monedas, que un transformer esta infiriendo en tiempo real a 5,6-8,0 tok/s y que las monedas se detienen si la inferencia se detiene.
- Banco de pruebas de cuantizacion ternaria: usar el par motor/juego y las tablas de primitivas aritmeticas (`make measure`, `make kernels`) para medir el coste real de memoria frente al coste aritmetico en un presupuesto de 102.400 pesos, un dato directamente trasladable a diseno de modelos TinyML en microcontroladores.
- NPC con dialogo generado en un juego homebrew de SNES: integrar el motor como capa de dialogo de un personaje que responde sobre un conjunto cerrado de hechos del mundo del juego, aceptando la ventana de 20 tokens y el vocabulario de 64 simbolos como restricciones de diseno.
- Referencia de portabilidad para la familia de ports: el codigo y el arnes de verificacion (`make gate`) sirven de base para validar los ports a NES, Genesis, Nintendo 64 y Game Boy Color dentro del mismo proyecto.
- Docencia de internals de un transformer: usar las trazas de residual stream y salida de atencion, comparadas elemento a elemento contra la referencia entera, para explicar paso a paso que hace cada capa sin abstracciones de framework.
- Investigacion sobre olvido catastrofico con presupuesto fijo: replicar el experimento de la entrada 11 y 12 (12,6% → 21,7% cambiando solo el corpus; 68,0% → 58,2% en preguntas no objetivo) para estudiar como el aumento de cobertura degrada conocimiento previo cuando el numero de pesos no puede crecer.
- Instalacion de arte generativo: dejar el modelo en free-run sobre el cartucho y proyectar el flujo de texto autogenerado como pieza de arte electronico, sin necesidad de GPU ni de red.
- Auditoria de inferencia en produccion: adoptar el patron "un efecto observable solo puede generarse desde la ruta que confirma un token" como tecnica de verificacion en sistemas donde la inferencia no es inspeccionable directamente.
- Arnes de regresion bit-exacta: emplear la referencia en Python/.npz como oraculo de enteros para validar reimplementaciones del mismo modelo en otros lenguajes o plataformas antes de flashear hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las metricas publicadas son propias del proyecto y estan medidas en consola o en la referencia host.

| Metrica | Resultado |
|---|---|
| Throughput, solo motor, SlowROM 2,68 MHz | 7,030 tok/s |
| Throughput, solo motor, FastROM 3,58 MHz | 8,019 tok/s |
| Throughput con el juego, SlowROM | 5,634 tok/s (-19,9%) |
| Throughput con el juego, FastROM | 6,412 tok/s (-20,0%) |
| Coste de presentacion por frame | 70.937 master clocks (SlowROM) vs 71.606 (FastROM), 0,9% de diferencia |
| Verificacion entera exacta | 1.280 tokens, todos los simbolos del vocabulario como semilla, ambas variantes de reloj |
| Acierto en parafrasis retenidas, modelo unico | 33,6% ± 2,8 |
| Acierto en parafrasis retenidas, 5 shards + router (host) | 52,9% ± 2,4 |
| Entrada 11, solo cambio de corpus | 12,6% ± 1,4 → 21,7% ± 2,9 |
| Entrada 11, corpus + receta | 30,3% ± 1,4 |
| Entrada 12, mismas 137 preguntas retenidas (con enrutado) | 56,2% → 60,0% |
| Entrada 12, 112 preguntas no objetivo | 68,0% → 58,2% |
| Prueba contable de inferencia | 118 generadas + 0 en cola == 118 confirmadas; 104/104 muestras |
| Control `-DNOGEN` | 1.707 frames, 0 tokens, 0 monedas |

Nota: la cabecera del README cita 6,88 tok/s (SlowROM) y 7,85 tok/s (FastROM); la tabla de coste por frame da 5,634 y 6,412 tok/s con el juego activo, coherente con la penalizacion del 20% que el propio autor describe.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay GPU implicada en la ejecucion del modelo.
- Hardware objetivo: Super Nintendo / Super Famicom original con la ROM `.sfc` en cartucho, o emulador (el proyecto usa ares en `make gate`). CPU Ricoh 5A22 a 2,68 MHz (SlowROM) o 3,58 MHz (FastROM).
- GPU recomendadas: ninguna. El modelo no se ejecuta en A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no aplica; el objetivo es una consola de 1990.
- Referencia en host: Python con numpy sobre el fichero `.npz`; corre en cualquier CPU sin requisitos especiales y se usa como oraculo entero exacto.
- Opciones de despliegue: ROM en hardware real o emulador; compilacion con `make nn` (cartucho motor), `make game` (cartucho jugable), `make gate` (construye todas las variantes y verifica cada token bajo ares), `make kernels` y `make measure`.
- Frameworks descartados: vLLM, llama.cpp, Ollama y TGI no son aplicables a este modelo ni a este hardware.
- Latencia y throughput: 5,634-8,019 tok/s segun variante y presencia del juego, es decir, aproximadamente 125-178 ms por token. El repositorio ocupa 0,1 GB, mayoritariamente codigo fuente y artefactos de build.
- Almacenamiento del cartucho: tamano de ROM no disponible en la informacion proporcionada.

## Comparativa con modelos similares

La categoria real de comparacion son los ports hermanos del mismo proyecto y, como referencia de contraste, un transformer denso convencional ejecutado en GPU.

| Modelo | Parametros | Contexto | Plataforma | Throughput | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| elya-snes | 102.400 pesos ternarios (54.830 no nulos) | 20 tokens | SNES 65816, 2,68-3,58 MHz | 5,634-8,019 tok/s | Apache-2.0 | Hugging Face, GitHub, GitLab |
| elya-nes (port hermano) | no disponible | no disponible | NES | no disponible | no disponible | Referenciado en el proyecto Hackaday |
| legend-of-elya-genesis (port hermano) | no disponible | no disponible | Sega Genesis | no disponible | no disponible | Hugging Face (elyanlabs) |
| Transformer denso de talla TinyStories en GPU | orden de 1-10 M (no confirmado para este caso) | no disponible | GPU / CPU moderna | muy superior, no medida en la informacion disponible | no disponible | no disponible |

| Criterio | elya-snes | Alternativa de referencia |
|---|---|---|
| Coste relativo de cuantizacion | Pesos ternarios 2,02x mas baratos que int8 (cuello de botella: trafico de memoria) | int8 como linea base del mismo experimento |
| Verificacion bit a bit contra referencia | Si, 1.280 tokens en ambas variantes de reloj | no disponible |
| Necesidad de GPU | Ninguna | Habitual en modelos de talla similar en produccion |
| Idiomas | Ingles, dominio cerrado | no disponible |
| Uso comercial | Permitido por Apache-2.0 | no disponible |

## Limitaciones y advertencias

- Capacidad linguistica minima: 64 simbolos de vocabulario y 20 posiciones de contexto impiden cualquier conversacion multi-turno real o parrafo largo. Fuera del dominio de los 70 hechos, la salida degenera en texto libre o en fragmentos sin sentido.
- Precision baja: 33,6% ± 2,8 en parafrasis retenidas como modelo unico. El 52,9% ± 2,4 con enrutado se midio en host y no esta implementado en la ROM, por lo que no debe citarse como rendimiento del cartucho.
- Alucinacion estructural: el propio modelo la declara (`are you a table? -> no. i can err.`). No hay mecanismo de absteccion ni de verificacion de veracidad, solo recuperacion de hechos memorizados.
- Olvido catastrofico documentado: al doblar el numero de hechos, el rendimiento en las 112 preguntas no objetivo cae de 68,0% a 58,2%. Ampliar el corpus degrada conocimiento previo porque el presupuesto de pesos es fijo.
- Idioma: solo ingles. No hay soporte multilingue ni se declara en los metadatos, por lo que no es apto para castellano sin reentrenamiento.
- Sesgos conocidos: no disponible. No se han publicado evaluaciones de sesgo, toxicidad o seguridad para este modelo.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificacion con atribucion y aviso de cambios. El repositorio incluye solo codigo; el contenido generado por el modelo (frases cortas en ingles) no tiene implicaciones de licencia de datos documentadas. El material grafico del cartucho puede tener condiciones propias no detalladas.
- Caveat de produccion: no es un modelo de produccion. Es una pieza de investigacion y demostracion; el repositorio en Hugging Face no ejecuta inferencia y no hay API, servidor ni pipeline asociado.
- Dependencia de emulador: parte de la verificacion (1.707 frames, 0 tokens con `-DNOGEN`) se realizo bajo ares; el comportamiento en todas las revisiones de hardware real y en todos los emuladores no esta documentado.
- Fechas: el repositorio figura creado el 2026-10-23, lo que debe tratarse como el sello temporal del autor y no como una garantia de mantenimiento futuro.

## Enlaces

- Hugging Face: https://huggingface.co/elyanlabs/elya-snes
- Repositorio en GitHub: https://github.com/Scottcjn/elya-snes
- Repositorio en GitLab (historial completo): https://gitlab.com/elyan-labs/elya-snes
- Pagina tecnica del proyecto: https://elyanlabs.ai/snes-llm.html
- Proyecto en Hackaday.io: https://hackaday.io/project/206401-transformers-on-retro-game-consoles
- Sitio de Elyan Labs: https://elyanlabs.ai/
- Organizacion en Hugging Face: https://huggingface.co/elyanlabs/models
- Documento de resultados citado (FINDINGS.md): https://github.com/Scottcjn/elya-snes/blob/main/FINDINGS.md
