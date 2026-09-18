# NANI-Nithin/VoxCPM2-GGUF

## Resumen

VoxCPM2-GGUF es un paquete de pesos cuantizados en formato GGUF del modelo de sintesis de voz (text-to-speech) openbmb/VoxCPM2, publicado por el usuario NANI-Nithin bajo el identificador NANI-Nithin/VoxCPM2-GGUF. Se trata, por tanto, de una conversion de un modelo upstream (OpenBMB) a un runtime alternativo, no de un entrenamiento nuevo: su valor esta en empaquetar la familia VoxCPM2 en cuantizaciones de 3 a 16 bits para su ejecucion con la herramienta audiocpp_cli de audio.cpp.

El bundle se distribuye como una unidad de publicacion completa: incluye siete ficheros GGUF (F16, BF16, Q8_0, Q6_K, Q5_K, Q4_K y Q3_K) que cubren desde 1527,3 MiB hasta 4551,2 MiB por variante, con un total de repositorio de 20,6 GB. El modelo base es un sistema TTS con soporte declarado para 32 idiomas y dialectos, y con capacidad de clonacion de voz mediante referencia de hablante opcional, lo que lo situa en el segmento de sintesis neuronal multilingue.

La relevancia actual del paquete es doble: por un lado, permite ejecutar un modelo TTS multilingue en cuantizaciones de menos de 2 GB, lo que habilita despliegue en hardware modesto; por otro, la model card incluye metricas de calidad por cuantizacion (WER/CER de ida y vuelta y factor de tiempo real), algo poco habitual en conversiones GGUF y que permite elegir el compromiso tamano/calidad con datos. La licencia del modelo upstream es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia voxcpm2, modelo de sintesis de voz text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, BF16, Q8_0, Q6_K, Q5_K, Q4_K, Q3_K |
| Idiomas soportados | ar, my, zh (y dialectos de zh), da, nl, en, fi, fr, de, el, he, hi, id, it, ja, km, ko, lo, ms, no, pl, pt, ru, es, sw, sv, tl, th, tr, vi |
| Licencia | apache-2.0 (se aplica la licencia upstream del modelo; audio.cpp mantiene la suya propia) |
| Formato de pesos | GGUF |
| Libreria declarada | audio.cpp |
| Modelo base | openbmb/VoxCPM2 |
| Tamano del repositorio | 20,6 GB (conjunto de los siete ficheros) |
| Frecuencia de muestreo esperada | reportada por el runtime; se remite a quality.json |
| Referencia de hablante | opcional (clonacion de voz) |

Ficheros del bundle y tamano declarado:

| Fichero | Rol | Cuantizacion | Tamano |
|---|---|---|---:|
| voxcpm2-F16.gguf | principal | F16 | 4551,2 MiB |
| voxcpm2-BF16.gguf | principal | BF16 | 4551,2 MiB |
| voxcpm2-Q8_0.gguf | principal | Q8_0 | 2818,1 MiB |
| voxcpm2-Q6_K.gguf | principal | Q6_K | 2324,2 MiB |
| voxcpm2-Q5_K.gguf | principal | Q5_K | 2053,3 MiB |
| voxcpm2-Q4_K.gguf | principal | Q4_K | 1798,3 MiB |
| voxcpm2-Q3_K.gguf | principal | Q3_K | 1527,3 MiB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo subyacente: no se especifica si se trata de un transformer, de un modelo basado en decodificacion de tokens de audio, de un esquema de difusion o de un hibrido. La unica informacion estructural cierta es que pertenece a la familia voxcpm2 (modelo base openbmb/VoxCPM2), que su tarea es text-to-speech y que la conversion se ha realizado al formato GGUF para el runtime audio.cpp bajo la etiqueta de familia `voxcpm2`. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

En cuanto a innovaciones tecnicas, lo que si aporta este paquete es el proceso de cuantizacion y su validacion: cada variante (F16, BF16, Q8_0, Q6_K, Q5_K, Q4_K, Q3_K) ha sido evaluada con una metrica de error de transcripcion de ida y vuelta (WER/CER) y con un factor de tiempo real (RTF), y todas han superado un "automated gate". Esto sugiere una verificacion automatica de inteligibilidad tras la cuantizacion, un paso que no es habitual en publicaciones GGUF de terceros. La clonacion de voz se realiza mediante referencia de hablante opcional, sin que se detalle el mecanismo (embedding de hablante, prompt de audio, etc.).

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto plano, con salida en fichero WAV mediante el comando `audiocpp_cli --task tts`.
- Multilingue: 32 codigos de idioma y dialecto declarados, con cobertura de arabe, chino (y dialectos), ingles, espanol, frances, aleman, portugues, ruso, japones, coreano, hindi, tailandes, vietnamita, turco, polaco, neerlandes, sueco, danes, finlandes, noruego, griego, hebreo, indonesio, malayo, tagalo, swahili, khmer, lao, birmano y italiano.
- Clonacion de voz: soporta una referencia de hablante opcional, lo que permite condicionar la sintesis a una voz dada.
- Seleccion de backend en tiempo de ejecucion mediante el parametro `--backend best`.
- Cuantizaciones alternativas intercambiables: el mismo pipeline puede ejecutarse con F16, BF16, Q8_0, Q6_K, Q5_K, Q4_K o Q3_K segun el equilibrio deseado entre tamano y calidad.
- No se declaran capacidades de tool calling, function calling, agentes, vision, audio de entrada (ASR) ni modo de razonamiento explicito.

## Casos de uso

- Narracion de contenido multilingue: un mismo pipeline (`audiocpp_cli --family voxcpm2`) puede generar audionarraciones en cualquiera de los 32 idiomas declarados, lo que simplifica la localizacion de articulos, cursos o documentacion sin cambiar de modelo.
- Audiolibros y lectura asistida: la variante Q5_K, con el WER/CER mas bajo reportado (0,106349), es la opcion mas adecuada cuando prima la inteligibilidad sobre el uso de disco.
- Despliegue en hardware modesto: la cuantizacion Q3_K ocupa 1527,3 MiB, de modo que puede ejecutarse en equipos con 4 GB de VRAM o menos, habilitando sintesis de voz en portatiles o mini-PC sin GPU dedicada de gama alta.
- Prototipado rapido de interfaces de voz: al ser un unico binario con `--task tts --family voxcpm2`, permite integrar sintesis en demos de asistentes conversacionales sin dependencias de servicios en la nube.
- Accesibilidad: generacion de voz sintetica para lectores de pantalla o conversion de texto a audio en aplicaciones de apoyo a personas con discapacidad visual.
- Generacion de voces para doblaje y preproduccion: con la referencia de hablante opcional se pueden producir locuciones de prueba para validar guiones antes de contratar talento de voz, siempre con consentimiento explicito de la voz de referencia.
- Sistemas de aviso y notificacion: sintesis de mensajes cortos en tiempo de ejecucion para paneles de control, aeropuertos o transporte publico, eligiendo la cuantizacion mas ligera que cumpla los requisitos de calidad.
- Investigacion en cuantizacion de modelos de audio: el bundle publica metricas WER/CER y RTF por nivel de cuantizacion, lo que lo convierte en un caso de estudio util para medir el impacto de Q3_K frente a Q4_K o Q5_K en tareas TTS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Si se incluyen, en cambio, metricas de calidad propias del bundle, medidas como error de transcripcion de ida y vuelta (WER/CER) y factor de tiempo real (RTF) por cuantizacion:

| Cuantizacion | WER/CER (ida y vuelta) | Factor de tiempo real | Puerta automatica |
|---|---:|---:|---|
| F16 | 0,184127 | 4,8391 | True |
| BF16 | 0,161905 | 4,4 | True |
| Q8_0 | 0,161905 | 5,0 | True |
| Q6_K | 0,161905 | 5,0 | True |
| Q5_K | 0,106349 | 5,7 | True |
| Q4_K | 0,111905 | 5,0 | True |
| Q3_K | 0,195238 | 5,4 | True |

Observaciones sobre los datos publicados: las cuantizaciones intermedias Q5_K y Q4_K obtienen el error de transcripcion mas bajo (0,106349 y 0,111905), por debajo incluso de F16 (0,184127), lo que sugiere que la metrica no crece de forma monotona con la precision. Los valores de factor de tiempo real declarados son todos superiores a 1 (entre 4,4 y 5,7), pero la model card no especifica la metodologia de medida ni la unidad exacta, por lo que no deben interpretarse directamente como multiplicadores de tiempo de sintesis sin esa aclaracion. No se dispone de datos de latencia, throughput ni comparacion con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada para inferencia (basada en el tamano de fichero declarado, sin margen adicional del runtime): Q3_K en torno a 1,5 GB; Q4_K en torno a 1,8 GB; Q5_K en torno a 2,0 GB; Q6_K en torno a 2,3 GB; Q8_0 en torno a 2,8 GB; F16 y BF16 en torno a 4,5 GB cada uno.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano de pesos, las variantes Q3_K a Q6_K son compatibles con GPU de consumo de 4 GB o mas, y F16/BF16 requieren del orden de 6 GB o mas de memoria.
- Caben en GPU de consumo: si, al menos las cuantizaciones Q3_K, Q4_K, Q5_K y Q6_K en tarjetas de 4 a 6 GB; F16 y BF16 en tarjetas de 8 GB o superiores.
- Opciones de despliegue: audio.cpp mediante `audiocpp_cli --task tts --family voxcpm2 --model <fichero> --backend best`. No se documentan integraciones con vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia.
- Latencia y throughput: no disponibles como medidas absolutas; la model card solo publica el factor de tiempo real relativo por cuantizacion (de 4,4 en BF16 a 5,7 en Q5_K).
- Todos los ficheros del bundle son necesarios segun el autor: la unidad de publicacion es el bundle completo, no un fichero aislado.

## Comparativa con modelos similares

No se ha identificado en la informacion proporcionada ningun modelo comparable con datos verificables de parametros, contexto o rendimiento, por lo que la comparativa cuantitativa queda como "no disponible". Como referencia cualitativa, este paquete se posiciona en el segmento de modelos TTS multilingues con clonacion de voz distribuidos en GGUF para runtimes de audio, y su rasgo diferenciador frente a otras conversiones es la publicacion de metricas WER/CER y RTF por nivel de cuantizacion, ademas de la licencia Apache 2.0 del modelo upstream.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos del modelo base ni sobre el comportamiento diferencial entre los 32 idiomas declarados; es probable que la calidad no sea uniforme en todos ellos, pero no hay evidencia en la informacion disponible.
- Riesgo de alucinacion en el sentido de audio sintetizado incorrecto o inteligibilidad degradada: el propio bundle reporta errores de transcripcion de ida y vuelta entre 0,106349 y 0,195238 segun cuantizacion, lo que indica que ninguna variante es perfecta en ese test.
- La cuantizacion Q3_K presenta el peor WER/CER de la tabla (0,195238), por lo que no es recomendable cuando la fidelidad de la locucion sea critica.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada; el soporte de los 32 idiomas se declara a nivel de codigo de idioma, sin garantia de cobertura dialectal homogenea (el chino se indica con "dialectos" sin enumerar).
- Restricciones de licencia: el modelo upstream se distribuye bajo Apache 2.0 (uso comercial permitido sujeto a los terminos de dicha licencia), mientras que audio.cpp mantiene su licencia propia, que debe revisarse por separado antes de un despliegue en produccion.
- Clonacion de voz: el autor advierte explicitamente de que no debe clonarse ni imitarse la voz de una persona sin consentimiento explicito y licito, y de que no debe usarse el audio generado para suplantacion, fraude, enganno, acoso o invasion de la privacidad. Es una advertencia relevante tanto legal como eticamente.
- El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, y las fechas de creacion y actualizacion indican un intervalo de menos de dos minutos entre ambas; se trata de una publicacion muy reciente y sin validacion por parte de la comunidad.
- La fecha de creacion registrada es 2026-09-17, posterior a la fecha habitual de consulta, dato que conviene verificar en el repositorio.
- No se especifica pipeline en HuggingFace ni idiomas en los metadatos del repositorio, aunque la model card si los enumera; la discrepancia obliga a fiarse de la model card para el soporte idiomatico.
- No se documentan requisitos de memoria RAM del runtime, dependencias, ni compatibilidad con aceleracion por GPU mas alla del parametro `--backend best`.

## Enlaces

- Repositorio HuggingFace del bundle: https://huggingface.co/NANI-Nithin/VoxCPM2-GGUF
- Modelo base upstream: https://huggingface.co/openbmb/VoxCPM2
- Los resultados de busqueda web proporcionados no contienen informacion relevante sobre el modelo: todas las referencias encontradas corresponden a personas llamadas "Nani" (un futbolista portugues y un actor indio) y no guardan relacion con este repositorio. No se han localizado papers, blogs tecnicos, repositorios de codigo ni demos adicionales en la busqueda realizada.
