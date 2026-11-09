# Musouno-Enma99/WRAI-Gemma-4-E2B-IT-Omni-ZeroKV

## Resumen

WRAI-Gemma-4-E2B-IT-Omni-ZeroKV es un fine-tune del modelo multimodal Gemma 4 E2B-IT de Google, publicado por el usuario Musouno-Enma99 bajo el paraguas del proyecto WRAI (Wavelet / Recurrent / Attentive Intelligence). Su objetivo declarado es convertir un transformer multimodal estandar en un agente autonomo que se ejecuta integramente en dispositivos Android de gama media, sin dependencia de la nube. Para ello, el autor afirma haber sustituido las 35 capas de atencion por un banco recurrente de "Tri-Memory" con estado constante, eliminando el crecimiento del KV-cache durante bucles agenticos multi-turno.

El modelo parte de la base Gemma 4 E2B-IT (familia multimodal de Google DeepMind con variantes E2B, E4B, 12B, 26B A4B y 31B) y se distribuye como un unico checkpoint PyTorch de 2,14 GiB, comprimido mediante cuantizacion ternaria e INT4 fusionada. Segun la model card, el estado recurrente ocupa 7,94 MiB independientemente de la longitud de secuencia, lo que permite contextos largos en telefonos con 8 GB de RAM sin que el gestor de memoria del sistema (LMK) termine el proceso.

La relevancia del modelo radica en su enfoque: automatizacion movil local con tool calling nativo para el dialecto Artemis, soporte de texto, vision y audio, y una licencia Apache 2.0 heredada de la base. No obstante, la informacion disponible procede exclusivamente de la model card del autor y no se han publicado resultados independientes de benchmarks ni validaciones externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Gemma 4 E2B-IT) con atencion sustituida por banco recurrente Tri-Memory de estado constante (Zero-KV) |
| Parametros totales | no disponible (la model card indica 2.565 parametros cuantizados en el bundle, cifra que no corresponde al total del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se declara ejecucion "infinite-horizon" con estado constante, sin cifra oficial de ventana) |
| Tipos de cuantizacion | Ternary-1.58b Group-32 PLE + Fused INT4 Core; estado en INT8 dinamico (uk_int8, uv_int8) |
| Idiomas soportados | en, id |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt, bundle standalone `wrai_gemma4_omni_golden.pt`, 2,14 GiB) |

## Arquitectura y entrenamiento

La arquitectura parte de Gemma 4 E2B-IT, un modelo multimodal de Google DeepMind que procesa texto, vision y audio. WRAI modifica las 35 capas de atencion del transformer original, reemplazandolas por un banco recurrente denominado Tri-Memory con complejidad O(1) respecto a la longitud de secuencia. La decodificacion se realiza mediante un "Parallel Associative Prefix Scan R48" con `chunk_size = 128`, que calcula los carries intra-chunk e inter-chunk en paralelo sobre GPU o NPU manteniendo invariancia matematica exacta respecto al calculo secuencial. El estado unificado se cuantiza a INT8 dinamico con productos punto enteros JIT, fijando la huella en 7,94 MiB.

Los pesos se comprimen de 9,51 GiB (9.735 MiB en BF16) a 2,14 GiB (2.194 MiB, una reduccion del 77,5%) mediante cuantizacion ternaria de 1,58 bits con grupos de 32 para las capas PLE y un nucleo INT4 fusionado. El bundle es completamente standalone y no requiere descargas secundarias desde Hugging Face. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO; esa informacion no esta disponible. La alineacion para tool calling se presenta como "nativa" con el formato de delimitadores `<|tool_call>call:action{...}<tool_call|>`.

## Capacidades

- Generacion de texto y razonamiento multimodal: procesa texto, imagenes (capturas de pantalla, feeds de camara) y audio (marcos conformer a 16 kHz) en un unico estado recurrente.
- Tool calling nativo para el dialecto Artemis: acciones como `click`, `swipe`, `input_text`, `press_key`, `manage_app` y `report_task_status`, con coordenadas normalizadas en rango 0-1000.
- Automatizacion de agentes multi-turno: el estado constante permite bucles agenticos prolongados sin crecimiento del KV-cache.
- Actuacion sobre Android: integracion con el Accessibility Service de Android para observar la pantalla y ejecutar gestos.
- Capacidades multilingues limitadas a ingles e indonesio.
- Ejecucion on-device: disenado para correr en telefonos con 8 GB de RAM (la model card cita un Poco X3 GT y SoCs MediaTek Dimensity 1100 / Snapdragon 8 Gen).
- Inferencia local mediante servidor en `127.0.0.1:8080` emparejado con la APK Artemis Native.

## Casos de uso

- Automatizacion de tareas en Android: el modelo observa capturas de pantalla, interpreta la UI y emite tool calls con coordenadas normalizadas para pulsar, deslizar o introducir texto, todo en local sin enviar datos a la nube.
- Asistentes de accesibilidad: personas con movilidad reducida pueden dictar ordenes que el modelo traduce en gestos concretos sobre el dispositivo mediante el Accessibility Service.
- Pruebas de UI automatizadas: un pipeline de CI para aplicaciones Android puede usar el modelo como agente que navega la app, verifica estados y reporta resultados con `report_task_status`.
- Procesamiento multimodal en campo: con captura de camara y audio a 16 kHz, el modelo puede asistir en tareas de inspeccion o transcripcion en dispositivos sin conectividad.
- Prototipado de agentes edge: investigadores pueden experimentar con arquitecturas de estado constante (Zero-KV) en hardware movil sin infraestructura de servidor.
- Automatizacion de configuracion del sistema: lanzar apps (`manage_app`), alternar ajustes (por ejemplo, modo oscuro) y ejecutar secuencias de acciones encadenadas.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse integramente en el dispositivo con 2,14 GiB de pesos y 7,94 MiB de estado, encaja en escenarios donde no se permite salida de datos.

## Benchmarks y rendimiento

La model card unicamente reporta una evaluacion interna de tool calling: 26/26 puertas superadas (100%) en el dialecto Artemis, segun el propio autor. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni validacion independiente de las cifras de compresion o latencia.

| Metrica | Valor declarado | Fuente |
|---|---|---|
| Artemis tool-calling gates | 26/26 (100%) | Model card del autor |
| Huella de estado | 7,94 MiB constante | Model card del autor |
| Compresion de pesos | 2,14 GiB (-77,5% vs 9,51 GiB BF16) | Model card del autor |
| MMLU / HumanEval / GSM8K | no disponible | - |

## Requisitos de hardware

- VRAM/RAM estimada: 2,14 GiB para los pesos mas 7,94 MiB de estado recurrente; en la practica, la model card cita un telefono con 8 GB de RAM como objetivo.
- GPU recomendadas: no se especifican modelos de escritorio; el diseno apunta a NPU/GPU integradas en SoCs moviles (MediaTek Dimensity 1100, Snapdragon 8 Gen).
- Compatibilidad con GPU de consumo: no confirmada; el bundle esta pensado para inferencia en Android, no para RTX 4090 o A100.
- Opciones de despliegue: motor de inferencia propio del proyecto WRAI sobre `127.0.0.1:8080` y APK Artemis Native; no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Despliegue edge |
|---|---|---|---|---|---|
| WRAI-Gemma-4-E2B-IT-Omni-ZeroKV | no disponible (base E2B) | no disponible (estado constante) | Texto, vision, audio | Apache 2.0 | Android nativo |
| google/gemma-4-E2B-it | variante E2B de Gemma 4 | segun documentacion de Gemma 4 | Texto, vision, audio | Gemma (terminos propios) | Requiere host PC o nube segun la model card |
| Gemma 4 E4B | variante E4B de Gemma 4 | segun documentacion de Gemma 4 | Texto, vision, audio | Gemma (terminos propios) | No confirmado |
| Gemma 4 12B | 12B | segun documentacion de Gemma 4 | Texto, vision, audio | Gemma (terminos propios) | No confirmado |

Los datos de contexto y parametros exactos de las variantes de Gemma 4 no estan disponibles en la informacion proporcionada; la comparativa se limita a lo declarado en la model card y en la documentacion oficial de Gemma 4.

## Limitaciones y advertencias

- La informacion procede exclusivamente de la model card del autor; no hay validacion independiente de las cifras de compresion, estado constante ni del 100% en tool calling.
- El modelo solo declara soporte de ingles e indonesio; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion y de acciones erroneas en la UI: un tool call con coordenadas incorrectas puede provocar pulsaciones no deseadas en el dispositivo.
- La licencia Apache 2.0 se declara en el repositorio, pero el modelo base Gemma 4 esta sujeto a los terminos de Google; conviene verificar la compatibilidad para uso comercial.
- El checkpoint se distribuye como `.pt` cargado con `weights_only=False`, lo que implica riesgos de seguridad al deserializar archivos pickle de origen no verificado.
- No se documentan sesgos, datos de entrenamiento ni procesos de alineacion (RLHF/DPO), lo que dificulta evaluar su comportamiento en produccion.
- El ecosistema de despliegue es propietario (motor WRAI + APK Artemis); no hay integracion con stacks estandar como vLLM o llama.cpp.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de adopcion o validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Musouno-Enma99/WRAI-Gemma-4-E2B-IT-Omni-ZeroKV
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- GitHub del proyecto: https://github.com/MusounoEnma/WRAI
- DOI (Zenodo): https://doi.org/10.5281/zenodo.23920132
- Documentacion de Gemma 4: https://gemma.ai/models/gemma-4/
- Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
