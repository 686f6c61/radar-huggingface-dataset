# benthecarman/MiMo-V2.6-Flash-RL-exl3

## Resumen

Esta ficha describe `benthecarman/MiMo-V2.6-Flash-RL-exl3`, una cuantización en formato EXL3 del modelo `XiaomiMiMo/MiMo-V2.6-Flash-RL`, desarrollado por Xiaomi. La cuantización reduce el checkpoint original (aproximadamente 173 GB) a 12 shards safetensors que suman 92,42 GB (86,08 GiB) con una tasa media de 2,34 bits por peso, de modo que un modelo de mezcla de expertos de 309.000 millones de parámetros totales y unos 15.000 millones activos pueda ejecutarse en una única máquina de 128 GB de memoria unificada, en concreto una NVIDIA DGX Spark (GB10, 121,6 GiB). Se trata, por tanto, de un artefacto de despliegue, no de un modelo nuevo.

El modelo base emplea una arquitectura transformer con mezcla de expertos: 48 capas, 256 expertos enrutados con enrutamiento top-8, capa 0 densa, `hidden_size` 4096 y atención híbrida que combina 9 capas globales con 39 capas de ventana deslizante de 128 tokens. La longitud de contexto declarada es de 1.048.576 tokens, con un contexto práctico de unos 980.000 tokens en un único slot. Esta cuantización es solo texto: no incluye las torres de visión ni de audio ni las cabezas MTP del modelo original.

Su relevancia es doble. Por un lado, demuestra que es viable servir un MoE de más de 300.000 millones de parámetros en hardware de escritorio profesional con una pérdida de perplejidad medida (5,3615 en wikitext-2). Por otro, incluye el drafter DFlash reparado para decodificación especulativa, con aceleraciones medidas de 1,58x en código y 1,70x en razonamiento. Requiere ramas específicas del motor exllamav3 y de TabbyAPI, por lo que no funciona con los runtimes estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida (9 capas globales + 39 capas de ventana deslizante de 128 tokens), 48 capas, 256 expertos enrutados con top-8, capa 0 densa, `hidden_size` 4096, `moe_intermediate_size` 2048, QK head_dim 192 / V head_dim 128, `attention_value_scale` 0,707 |
| Parametros totales | 309.000 millones declarados en la model card; 46.203.315.904 según los metadatos safetensors del repo (discrepancia no aclarada en la informacion disponible) |
| Parametros activos | ~15.000 millones |
| Longitud de contexto | 1.048.576 tokens (maximo del modelo); ~980.000 tokens en 1 slot con un presupuesto de 25,4 GiB de KV cache |
| Tipos de cuantizacion | EXL3 trellis: 2,34 bpw excluyendo head (2,36 bpw reportado al cargar); expertos enrutados a 2,0 bpw (24 capas) y 2,5 bpw (22 capas), capa 47 a 6,0 bpw, atencion a 4,0 bpw, MLP densa de capa 0 a 3,0 bpw, `lm_head` a 6,0 bpw, embeddings/norms/router en BF16. Drafter DFlash en BF16 |
| Idiomas soportados | en, zh |
| Licencia | MIT (segun este repo de cuantizacion) |
| Formato de pesos | safetensors (12 shards) con `custom_code` (exllamav3); no hay GGUF |
| Tamano de los pesos | 92.423.978.606 B = 92,42 GB = 86,08 GiB; directorio completo 92,50 GB / 86,15 GiB |
| Drafter | `dflash/`, BF16, 2,94 GB (+2,81 GiB en tiempo de ejecucion) |
| Perplejidad | 5,3615 en wikitext-2 test, 64 x 2048 tokens (5,3174 sobre las 146 filas) |
| Modalidades | solo texto (sin torre de vision, sin torre de audio, sin cabezas MTP) |
| Motor de inferencia | rama de exllamav3 `mimo-v2.6-flash` + rama de TabbyAPI `mimo-v2.6-flash` |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer con mezcla de expertos de 48 capas: la capa 0 es densa y las 47 restantes contienen 256 expertos enrutados cada una, con enrutamiento top-8, puntuacion sigmoide y agrupacion `noaux_tc`. La atención es híbrida: 9 capas globales con 64 cabezas de consulta y 4 de KV, y 39 capas de ventana deslizante de 128 tokens con 64 cabezas de consulta, 8 de KV y attention sinks. El QKV esta fusionado y las cabezas QK tienen dimension 192 frente a las 128 de las cabezas V, con un `attention_value_scale` de 0,707.

No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO del modelo base. Lo que si se detalla es el proceso de cuantizacion: el checkpoint original almacena los expertos enrutados en OCP MXFP4 (nibbles e2m1 con escalas de byte e8m0, bloque 32 a lo largo de K), la atención y el MLP denso de la capa 0 en FP8 e4m3 con bloques de `weight_scale_inv` de 128x128, y los embeddings, `lm_head` y normas en BF16. Todo ello se desuantiza durante la conversion y se recuantiza como codigos trellis EXL3 con exllamav3 1.5.1 en una unica RTX PRO 6000 (7,3 horas, ~29 USD de GPU alquilada), con la orden `-b 2.25 -hq -cr 250 -cc 2048 --module_bits 'model.layers.47.mlp.experts.*=6' --max_bad_rows 0.4`.

Un detalle tecnico destacable es la capa 47: los intermedios de sus expertos enrutados (`act_fn(gate(x)) * up(x)`, de ancho 2048) desbordan fp16 en aproximadamente el 12 % de las filas de calibracion incluso sin cuantizar, por lo que se descartaron 31 filas de calibracion y se forzo esa capa a 6,0 bpw. El repo añade la clave `exl3_fp32_mlp_layers: "47"` en `config.json` para gestionar ese caso. La decodificacion especulativa se apoya en el drafter DFlash de Xiaomi, incluido y reparado para que cargue correctamente.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con plantilla de chat propia (`chat_template.jinja`).
- Razonamiento multi-paso y cadenas de pensamiento, con aceleracion medida de 1,70x al usar el drafter DFlash.
- Generacion de codigo, con aceleracion medida de 1,58x con decodificacion especulativa.
- Contexto muy largo: hasta ~980.000 tokens utiles en un unico slot, lo que habilita tareas sobre corpus completos.
- Decodificacion especulativa integrada mediante el drafter DFlash incluido en `dflash/`.
- Servido mediante TabbyAPI (API compatible con OpenAI) sobre exllamav3.
- Capacidades excluidas: no hay vision, ni audio, ni cabezas MTP en esta cuantizacion, aunque `config.json` conserve los bloques `vision_config`, `audio_config` y `processor_config`.
- No se documenta en la informacion disponible soporte explicito de tool calling o function calling nativo, ni modo thinking separado.

## Casos de uso

- Asistente de codigo local en una estacion de trabajo de 128 GB: el modelo cabe completo en memoria unificada (95,06 GiB de pico medido a 32K de contexto) y con el drafter DFlash decodifica a ~42 tok/s sostenidos, lo que lo hace util para autocompletado y refactorizacion interactiva sin depender de la nube.
- Analisis de repositorios completos o documentacion extensa: con ~980.000 tokens de contexto en un solo slot, se puede cargar un arbol de codigo o un conjunto de documentacion entero y hacer preguntas sin pipeline de recuperacion.
- Razonamiento sobre expedientes tecnicos o normativos: la ventana de contexto permite encadenar documentos largos y el modelo ofrece un modo de razonamiento multi-paso que se acelera con decodificacion especulativa.
- Traduccion y atencion bilingue ingles-chino: es el unico par de idiomas declarado, y el contexto largo permite traducir con memoria de estilo y terminologia consistente a lo largo de documentos extensos.
- Servicio interno de generacion de texto via TabbyAPI: al exponer una API compatible con OpenAI sobre exllamav3, se puede integrar como backend en herramientas de desarrollo existentes.
- Investigacion sobre cuantizacion extrema: el repo publica el registro por tensor (`quantization_config.json`, 44,7 MB), el plan de bits por modulo y los resultados de evaluacion, lo que lo convierte en material de referencia para estudiar el impacto de 2,0-2,5 bpw en expertos enrutados.
- Evaluacion comparativa de motores de inferencia: al necesitar ramas especificas de exllamav3 y TabbyAPI, sirve como banco de pruebas para medir throughput y latencia de MoE cuantizados frente a otras implementaciones.
- Procesamiento por lotes de textos largos en una sola maquina: la relacion entre contexto y presupuesto de KV cache permite ajustar el numero de slots segun si se prioriza longitud de contexto o concurrencia.

## Benchmarks y rendimiento

Los unicos datos numericos disponibles son mediciones del autor en una DGX Spark (GB10, aarch64). El repositorio incluye `eval/bench/RESULTS.md` y ficheros de puntuacion por tarea, pero su contenido no se ha facilitado, por lo que no hay cifras de MMLU, HumanEval, GSM8K ni similares.

| Metrica | Valor | Condiciones |
|---|---|---|
| Perplejidad wikitext-2 | 5,3615 | test, 64 x 2048 tokens |
| Perplejidad wikitext-2 | 5,3174 | sobre las 146 filas |
| Velocidad de decodificacion | 31,5 tok/s | 2K de contexto, batch 1, sin drafter |
| Velocidad de decodificacion | 28,5 tok/s | 32K de contexto, batch 1, sin drafter |
| Velocidad con DFlash | ~42 tok/s sostenidos | con decodificacion especulativa |
| Aceleracion especulativa | 1,58x | tareas de codigo |
| Aceleracion especulativa | 1,70x | tareas de razonamiento |
| Memoria anfitrion pico | 95,06 GiB de 121,63 | a 32K de contexto |

No se han publicado resultados de benchmarks estandar en la informacion disponible. Las cifras anteriores son mediciones propias del autor, no comparables directamente con evaluaciones de terceros.

## Requisitos de hardware

- VRAM/memoria estimada: los pesos ocupan 86,08 GiB (92,42 GB); el directorio completo, 86,15 GiB. El pico de memoria medido a 32K de contexto es de 95,06 GiB sobre 121,63 GiB disponibles. Con el drafter DFlash hay que sumar 2,81 GiB en tiempo de ejecucion.
- Presupuesto de KV cache: 25,4 GiB para un slot de ~980.000 tokens, lo que equivale a unos 27 KiB por token (calculo derivado de los datos del autor). A contextos cortos el consumo de KV es proporcionalmente mucho menor.
- Hardware objetivo: NVIDIA DGX Spark (GB10, 121,6 GiB de memoria unificada, aarch64), que es la plataforma sobre la que se construyo y midio el modelo.
- Cabe en GPU de consumo: no. Los 86,08 GiB de pesos exceden la VRAM de cualquier GPU de consumo actual (24-32 GB) y tambien de una RTX 4090 o RTX 5090. Se requiere una maquina de 128 GB de memoria unificada o un nodo con varias GPU profesionales.
- GPU profesionales: una sola GPU de 96 GB queda muy justa (pesos mas drafter mas KV mas buffers); la referencia del autor es una maquina de 128 GB. La RTX PRO 6000 se uso para la conversion, no para la inferencia medida.
- Opciones de despliegue: exclusivamente exllamav3 (rama `mimo-v2.6-flash`) y TabbyAPI (rama `mimo-v2.6-flash`). No hay soporte de llama.cpp, Ollama, vLLM ni TGI en la informacion disponible, y al no existir pesos GGUF no es posible usar runtimes basados en ese formato.
- Latencia y throughput: 31,5 tok/s a 2K de contexto y 28,5 tok/s a 32K en batch 1 sin drafter; ~42 tok/s sostenidos con el drafter DFlash activo.
- Almacenamiento: ~87 GB en disco para el directorio del modelo, mas 2,94 GB del drafter BF16.

## Comparativa con modelos similares

Solo es posible comparar con el modelo base del que deriva esta cuantizacion, ya que no hay datos de benchmarks ni de otros artefactos en la informacion disponible.

| Modelo | Parametros | Contexto | Formato y cuantizacion | Extras | Licencia | Despliegue |
|---|---|---|---|---|---|---|
| MiMo-V2.6-Flash-RL-exl3 (este repo) | 309B totales / ~15B activos (card); 46.203.315.904 segun safetensors | 1.048.576 tokens (modelo); ~980K en 1 slot | EXL3 trellis 2,34 bpw, 92,42 GB, safetensors | Drafter DFlash incluido; sin vision, audio ni MTP | MIT (segun este repo) | exllamav3 + TabbyAPI en ramas especificas |
| MiMo-V2.6-Flash-RL (modelo base) | 309B totales / ~15B activos | 1.048.576 tokens | ~173 GB; expertos MXFP4, atencion y MLP densa en FP8 e4m3, embeddings/norms en BF16 | Incluye torres de vision y audio y tres cabezas MTP | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| Otros MoE abiertos de la franja 200-700 mil millones de parametros totales | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Sin resultados de benchmarks publicados no es posible establecer una comparacion cuantitativa de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Es una cuantizacion agresiva: los expertos enrutados se almacenan a 2,0-2,5 bpw, lo que puede degradar tareas sensibles respecto al checkpoint original. La unica senal de calidad publicada es la perplejidad en wikitext-2 (5,3615).
- La capa 47 se fuerza a 6,0 bpw porque sus intermedios de expertos desbordan fp16 en aproximadamente el 12 % de las filas de calibracion; se descartaron 31 filas de calibracion por ese motivo. Es un parche conocido, no una solucion general.
- `config.json` conserva los bloques `vision_config`, `audio_config` y `processor_config` del modelo original aunque no existan los tensores correspondientes. Las herramientas que lean esa configuracion pueden asumir capacidades multimodales que este repo no tiene.
- La model card menciona una seccion de "Known issues" que anade una clave a `config.json`, pero el texto disponible esta truncado, por lo que el alcance completo de esos problemas no se puede detallar.
- Requiere `custom_code` (auto_map con `configuration_mimo_v2.py` y `modeling_mimo_v2.py`) y ramas no fusionadas de exllamav3 y TabbyAPI. Esto implica dependencias fragiles, riesgo de ejecucion de codigo remoto y ausencia de soporte en el ecosistema estandar.
- Idiomas limitados a ingles y chino. No hay soporte declarado de castellano ni de otros idiomas.
- Solo texto: no hay vision, audio ni cabezas MTP, aunque el modelo base si las tenga.
- Riesgo de alucinacion: no hay evaluacion publicada en la informacion disponible sobre fidelidad factual, y las evaluaciones del autor se centran en velocidad y perplejidad.
- Estado de validacion nulo: el repo tiene 0 descargas y 0 likes, esta publicado por un unico autor y no cuenta con validacion de la comunidad.
- Licencia: el repo declara MIT, pero conviene verificar por separado la licencia y los terminos de uso del modelo base de Xiaomi antes de un despliegue comercial, ya que no se detallan en la informacion proporcionada.
- La memoria es el cuello de botella: cualquier aumento del numero de slots o de la longitud de contexto reduce directamente el presupuesto de KV cache (25,4 GiB para ~980K tokens en un slot).

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/benthecarman/MiMo-V2.6-Flash-RL-exl3
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- exllamav3 (repositorio del motor): https://github.com/turboderp-org/exllamav3
- Rama de exllamav3 con soporte de MiMo-V2.6: https://github.com/benthecarman/exllamav3/tree/mimo-v2.6-flash
- Rama de TabbyAPI con soporte de MiMo-V2.6: https://github.com/benthecarman/tabbyAPI/tree/mimo-v2.6-flash
- Resultados de evaluacion locales: `eval/bench/RESULTS.md` y `eval/bench/METHOD.md` dentro del repositorio (contenido no disponible en la informacion proporcionada)
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo; las consultas devolvieron unicamente paginas de ayuda de Facebook sin relacion con el contenido de esta ficha.
