# LaDruid/MiniMax-H3-Multishot-Workflow

## Resumen

Este repositorio no contiene un modelo de inteligencia artificial, sino un pack de nodos personalizados para ComfyUI y tres flujos de trabajo listos para cargar, publicados por el usuario LaDruid, cuyo objetivo es encadenar generaciones del modelo de vídeo MiniMax-H3 en una sola toma continua. MiniMax-H3 genera de forma nativa bloques de aproximadamente 10-15 segundos; el pack resuelve el problema de unir esos bloques sin corte visible en las fronteras entre planos, sin salto de color entre ellos y con audio continuo en toda la pieza, devolviendo un unico video maestro con una unica pista de audio maestra.

La version documentada en la model card es la v2.7.0 del pack ComfyUI-H3-Multishot, que incluye nodos de muestreo, cargadores, controles de estudio, pila de LoRA y un parche de arquitectura para GGUF, ademas de tres grafos de ComfyUI: `H3_Seamless_Chain_v2.json`, `H3_Seamless_Chain_CORE.json` (sin dependencias de terceros) y `H3_Keyframes.json`. El repositorio ocupa 0,0 GB, se publica bajo licencia Apache 2.0 y esta fechado el 19 de septiembre de 2026, sin descargas ni likes registrados en el momento de la consulta.

Su relevancia practica esta en la ingenieria de memoria y de continuidad: la version 2.5 introdujo cuatro sistemas de gestion de memoria medidos por el autor (regla automatica de driver-headroom, `low_ram_master`, text encoder remoto y `H3 TAE Decode`), y la 2.6 anadio el modo *extend take*, con el que una sola premisa produce un unico discurso continuo troceado en fronteras de frase. Conviene subrayar que no es un checkpoint: sin descargar aparte los pesos de MiniMax-H3 y sus componentes asociados, los flujos no generan nada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica: es un pack de nodos y flujos de ComfyUI; opera sobre el modelo MiniMax-H3, cuya arquitectura no se detalla en la informacion disponible |
| Parametros totales | no aplica: el repositorio no contiene pesos |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica al repositorio; MiniMax-H3 genera bloques de aproximadamente 10-15 segundos de video |
| Tipos de cuantizacion | el pack incluye un parche de arquitectura GGUF; los cuantizados concretos se descargan aparte y no se detallan (referencia truncada a `joeygambino/Min...`) |
| Idiomas soportados | no disponible; el *writer* del pack distingue system prompts en ingles (`<d>[English] ...</d>`) para el motor H3 y dialogo entrecomillado para LTX |
| Licencia | Apache 2.0 (la licencia de los pesos de MiniMax-H3 es independiente y no se especifica) |
| Formato de pesos | no aplica: no contiene pesos. Los flujos son JSON y los nodos son codigo del pack `ComfyUI-H3-Multishot` |

Datos adicionales del repositorio:

| Parametro | Valor |
|---|---|
| Autor | LaDruid |
| Version documentada | v2.7.0 del pack ComfyUI-H3-Multishot |
| Tag de pipeline | text-to-video |
| Libreria declarada | minimax-h3 |
| DOI | doi:10.57967/hf/10523 |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion y actualizacion | 2026-09-19 |
| Contenido | `ComfyUI-H3-Multishot/`, `workflows/`, `INSTALL.md`, `SETTINGS.md`, `PROMPTING.md` |
| Lo que no contiene | pesos de modelo, checkpoint, text encoder, VAE ni LoRA |

## Arquitectura y entrenamiento

No hay entrenamiento ni arquitectura de red que describir: el artefacto es una capa de orquestacion sobre ComfyUI compuesta por nodos de muestreo, cargadores, controles de estudio, pila de LoRA y un parche de arquitectura que permite cargar cuantizados GGUF del modelo MiniMax-H3. La logica central es el encadenado de bloques: MiniMax-H3 produce tramos de 10-15 segundos y el pack los une manteniendo continuidad visual y sonora mediante bancos de memoria, placas de frontera (*plates*) y anclajes de keyframe. En la version 2.7.0 el banco de memoria se desactiva automaticamente en cadenas `flf_chain`, porque fijaba un clip del plano 1 en los planos posteriores y provocaba el retorno de la placa PLATE0 desde el segundo plano.

El control de continuidad se reparte entre varios mecanismos documentados: `context_pin` para prolongar el habla con la propia voz de H3 (sin TTS), `H3ChainNormalize` como nivelador de textura y color posterior a la cadena, `refresh_pin` para alinear empalmes, un dial de fijacion `x0_clamp_window` con dosis maxima de 0,30, escalado latente en bucle, `refresh_renoise`, `pin_noise_ramp` y `auto_chunk_ffn`. La version 2.7.0 anade soporte para ComfyUI 0.34 detectando anclajes nativos de keyframe interiores, con lo que el parche de layout del pack se desactiva solo en esa version y se mantiene sin cambios en nucleos anteriores. No se documenta en la informacion disponible ningun proceso de RLHF, DPO ni composicion de dataset, porque el pack no entrena ningun modelo.

## Capacidades

- Encadenado de bloques de video de MiniMax-H3 (10-15 segundos por bloque) en escenas de duracion arbitraria con una unica toma continua y sin corte visible.
- Consistencia de color y textura entre planos mediante `H3ChainNormalize`, placas de frontera y anclajes de keyframe.
- Generacion de audio continuo a lo largo de toda la cadena, con una sola pista maestra de audio.
- Voces por sujeto: los parametros `voice_ref_2` y `voice_ref_3`, disponibles en ambos muestreadores, mantienen la voz de cada personaje a lo largo de la escena encadenada; el autor afirma haberlo verificado a ciegas sin sangrado entre hablantes.
- Modo *extend take*: con `take_seconds` en MASTER CONTROLS o con el flujo `H3_Extend_Take` (entregado a 1280x736 y 30 segundos de toma), una sola premisa se convierte en un discurso continuo cortado en fronteras de frase y continuado bajo `context_pin` en la propia voz de H3, sin TTS ni presupuesto de dialogo por plano.
- Escritor de prompts consciente del motor: genera system prompts distintos para H3 (`<d>[English] ...</d>`) y para LTX (dialogo entrecomillado) mediante un widget `engine`.
- Prioridad de las fotografias de referencia sobre la prosa del escritor: el escritor apunta a las fotos en lugar de describir un rostro.
- Anclajes de keyframe en posiciones de fotograma elegidas (flujo `H3_Keyframes.json`) y deteccion de anclajes interiores nativos en ComfyUI 0.34.
- Previsualizacion de borradores a resolucion completa en 2 segundos por toma mediante `H3 TAE Decode`, un decoder de 9 MB.
- Aceleradores de velocidad conmutables: Spectrum, TeaCache, block cache y EasyCache, con notas del autor sobre cuales distorsionan la imagen.
- Gestion de memoria: `low_ram_master` para volcar planos terminados a disco sin perdidas, text encoder remoto en un segundo equipo y regla automatica de driver-headroom.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso de agentes: son competencias del modelo base, no de este pack.

## Casos de uso

- Produccion de piezas narrativas de toma unica: el pack une bloques de 10-15 segundos en escenas de hasta 65 segundos verificadas (7 ventanas), de modo que un cortometraje o una pieza de marca se renderiza como una sola toma sin cortes visibles ni saltos de color.
- Escenas de dialogo con varios personajes: `voice_ref_2` y `voice_ref_3` asignan una voz distinta a cada sujeto y la mantienen a lo largo de la cadena, lo que permite conversaciones de varios hablantes sin reasignacion manual de voces por plano.
- Locucion continua larga sin TTS: con `take_seconds` y el estilo de union *extend take*, una sola premisa produce un discurso ininterrumpido cortado en fronteras de frase, util para narraciones, monologos o piezas de videoclip con voz en off.
- Seleccion rapida de semillas y triaje de lotes: `H3 TAE Decode` ofrece previsualizaciones de 2 segundos a resolucion completa frente a aproximadamente un minuto por toma con el VAE real, lo que abarata enormemente la busqueda de semillas antes del render final.
- Render en equipos de gama consumer: los valores por defecto de la version 2.5 estan ajustados para tarjetas de 16-24 GB, y la regla de driver-headroom evita la degradacion de memoria del driver de Windows cuando la tarjeta se llena por encima del 95%, convirtiendo renders de 27 minutos a 3 horas en unos 15 minutos estables.
- Cadenas largas con RAM de sistema limitada: `low_ram_master` vuelca cada plano terminado a disco sin perdidas en cuanto acaba, de modo que el pico de RAM se queda en unas dos tomas independientemente de la longitud de la cadena, con salida identica (42,8 dB frente a la ruta en RAM, ruido de codec).
- Despliegue repartido entre dos maquinas: el nodo de text encoder remoto permite mover los mas de 15 GB del codificador de texto a un segundo PC con ComfyUI y este pack, liberando la tarjeta de render, con cache local para que el texto repetido no vuelva a cruzar la red.
- Ajuste fino de continuidad en produccion: los controles `x0_clamp_window` (dosis maxima 0,30), `refresh_pin`, `pin_noise_ramp` y `H3ChainNormalize` permiten corregir empalmes y deriva de textura en cadenas ya montadas sin rehacer el render completo.
- Integracion con flujos existentes de ComfyUI: los grafos `H3_Seamless_Chain_CORE.json` y `H3_Keyframes.json` permiten adoptar el encadenado sin dependencias de terceros o limitarse a anclajes de keyframe en un unico clip.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni metricas equivalentes, porque el repositorio no contiene un modelo evaluable). El autor si reporta mediciones propias de rendimiento y de deriva, que se recogen a continuacion tal cual, sin verificacion independiente.

| Metrica | Valor reportado | Contexto |
|---|---|---|
| Duracion maxima de toma verificada | 65 segundos en 7 ventanas | v2.6.0, revision a ciegas como toma ininterrumpida |
| Deriva de textura por union | aproximadamente +13% de textura fina por empalme | 736x1280, set anti-drift activado; visible a 7 ventanas |
| Fidelidad de `low_ram_master` frente a la ruta en RAM | 42,8 dB | atribuido a ruido de codec, salida verificada como identica |
| Tiempo de render tipico | 15 minutos | tras aplicar la regla de driver-headroom; antes oscilaba entre 27 minutos y 3 horas |
| Previsualizacion de borrador | 2 segundos por toma | `H3 TAE Decode` (decoder de 9 MB) frente a aproximadamente 1 minuto con el VAE real |
| Duracion de bloque nativo de MiniMax-H3 | aproximadamente 10-15 segundos | limite que el pack encadena |

## Requisitos de hardware

- VRAM: los valores por defecto de la version 2.5 estan ajustados para tarjetas de 16-24 GB; el laboratorio de pruebas del autor trabaja con 24 GB. No se especifica un minimo absoluto.
- Codificador de texto: ocupa mas de 15 GB en local si no se descarga a un segundo equipo mediante el nodo de text encoder remoto.
- Memoria de sistema: sin `low_ram_master`, una cadena larga acumula todos los planos terminados en RAM hasta decenas de GB en el ultimo paso; con el activado, el pico baja a unas dos tomas.
- Comportamiento del driver: en Windows, cuando la tarjeta se llena por encima de aproximadamente el 95%, el driver degrada memoria y provoca tiempos de render erraticos; el pack detecta esa zona y streamea unos GB de pesos en lugar de operar al limite.
- GPU recomendadas: no disponible. La informacion proporcionada no nombra modelos concretos (A100, H100, RTX 4090 ni similares); solo se indica el rango de VRAM de 16-24 GB.
- Opciones de despliegue: ComfyUI, en version 0.34 (con anclajes nativos de keyframe interiores y desactivacion automatica del parche de layout) y en nucleos anteriores (con parche de layout activo). El pack se distribuye como nodos personalizados y grafos JSON, con un modo CORE sin dependencias de terceros.
- Despliegue multipuesto: posibilidad de ejecutar el text encoder en un segundo PC con ComfyUI y este pack.
- Latencia y throughput: aproximadamente 1 minuto por toma con el VAE real, alrededor de 2 segundos por toma en modo borrador con `H3 TAE Decode`, y del orden de 15 minutos por render en el caso medido con la regla de driver-headroom.
- Aceleradores: panel de Speed Boosters con Spectrum, TeaCache, block cache y EasyCache, cada uno medido por el autor, con advertencias sobre cuales introducen distorsion.

## Comparativa con modelos similares

No hay benchmarks ni especificaciones publicas del modelo base en la informacion disponible, por lo que la comparacion se limita a lo que la model card documenta.

| Alternativa | Naturaleza | Duracion de escena | Continuidad de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (ComfyUI-H3-Multishot v2.7.0) | Pack de nodos y flujos sobre MiniMax-H3 | Arbitraria; 65 segundos verificados en 7 ventanas | Pista maestra unica y voces por sujeto | Apache 2.0 | HuggingFace, repositorio de 0,0 GB, 0 descargas |
| MiniMax-H3 sin encadenar | Modelo de video base | 10-15 segundos por bloque | no disponible | no disponible | Pesos descargables aparte (referencia truncada a `joeygambino/Min...`) |
| Motor LTX | Motor alternativo mencionado por el escritor de prompts | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio no contiene pesos: sin descargar aparte el checkpoint MiniMax-H3 (`ref2va` viene soportado y `fl2va` tambien encadena) y sus componentes, los flujos no producen ningun resultado.
- El codificador de texto no se incluye y consume mas de 15 GB de VRAM si se ejecuta en la misma maquina que renderiza.
- Deriva de textura no resuelta en tomas largas: aproximadamente +13% de textura fina por empalme a 736x1280 con el set anti-drift activado; el autor recomienda limitar los *extend takes* a unas 4 ventanas (30-40 segundos) hasta que llegue una correccion por el lado de los pines.
- Ausencia total de validacion de la comunidad: 0 descargas, 0 likes, repositorio de 0,0 GB creado y actualizado el mismo dia (2026-09-19). Las mediciones de rendimiento y fidelidad son del propio autor, sin verificacion independiente.
- No se declaran idiomas soportados ni datos de sesgo, alucinacion o evaluacion etica del modelo subyacente; esas caracteristicas dependen de MiniMax-H3, no del pack.
- La licencia Apache 2.0 cubre el pack, pero no los pesos de MiniMax-H3, cuya licencia y condiciones de uso comercial no se detallan en la informacion disponible. Es imprescindible verificarlas antes de un uso en produccion.
- Dependencia fuerte de ComfyUI y de su version: el parche de layout se desactiva en 0.34 y permanece activo en nucleos anteriores, de modo que el comportamiento puede variar entre instalaciones.
- La regla de driver-headroom esta descrita para drivers de Windows; no se documenta su comportamiento en Linux.
- El escritor de prompts usa system prompts en ingles (`<d>[English] ...</d>`) para H3, lo que condiciona el idioma de las indicaciones aunque no necesariamente el del audio generado.
- La model card esta truncada en la seccion que indica donde descargar los pesos (`joeygambino/Min...`), por lo que la ruta exacta debe confirmarse en la pagina original.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/LaDruid/MiniMax-H3-Multishot-Workflow
- DOI: https://doi.org/10.57967/hf/10523
- Repositorio de pesos citado en la model card (referencia truncada): https://huggingface.co/joeygambino/Min...
- Paginas de la ComfyUI-H3-Multishot incluidas en el repositorio: `ComfyUI-H3-Multishot/`, `workflows/H3_Seamless_Chain_v2.json`, `workflows/H3_Seamless_Chain_CORE.json`, `workflows/H3_Keyframes.json`, `INSTALL.md`, `SETTINGS.md`, `PROMPTING.md`
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante. Los resultados devueltos tratan sobre Microsoft Visio y herramientas de diagramacion, sin relacion con este repositorio ni con MiniMax-H3.
