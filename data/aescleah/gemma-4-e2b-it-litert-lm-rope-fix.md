# Aescleah/gemma-4-E2B-it-litert-lm-rope-fix

## Resumen

Este repositorio contiene una copia modificada del modelo `gemma-4-E2B-it.litertlm` publicado por `litert-community`, un artefacto de Gemma 4 en su variante E2B (orientada a dispositivos) empaquetado en formato LiteRT-LM para ejecución en el runtime de Google AI Edge. El autor del repositorio, Aescleah, no modifica los pesos: únicamente reescribe las operaciones de codificación posicional rotatoria (RoPE) del grafo para corregir un defecto numérico que aparece cuando las activaciones se ejecutan en float16, ruta habitual en GPUs móviles (Metal, GPU backend).

El problema que resuelve es concreto: el grafo original convierte la posición INT32 a un tensor de tipo flotante antes de calcular los ángulos rotatorios. En float16, las posiciones grandes no se representan de forma exacta, de modo que tokens vecinos reciben la misma fase rotatoria y se corrompen las secuencias de copia literal (dígitos, fechas, marcadores cortos: `1848` se convierte en `18848`). El parche descompone la posición como `512·h + l`, manteniendo `l` exacto en float16 y obteniendo la fase de `512·h` de tablas precalculadas.

Es relevante porque afecta a un caso de uso muy sensible en producción: cualquier tarea de extracción o reproducción exacta de números (importes, fechas, identificadores) sobre inferencia on-device. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su tamaño es de 2,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4, variante E2B); grafo LiteRT-LM con firmas `tf_lite_prefill_decode` y `tf_lite_mtp_drafter` |
| Parametros totales | no disponible (el nombre "E2B" sugiere una variante efectiva de ~2B, pero no se confirma en la informacion) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el parche cubre posiciones hasta 32 767 en las tablas precalculadas) |
| Tipos de cuantizacion | no disponible (el artefacto se ejecuta con activaciones float16 en la ruta GPU; el grafo original usa posiciones INT32) |
| Idiomas soportados | no disponible (la prueba citada es una sonda de fidelidad numérica en frances) |
| Licencia | Apache 2.0 (Gemma sujeta ademas a sus terminos originales) |
| Formato de pesos | LiteRT-LM (`.litertlm`); pesos sin modificar, solo grafo reescrito |

## Arquitectura y entrenamiento

El modelo es un transformer de la familia Gemma 4 en variante E2B, empaquetado por `litert-community` para el runtime LiteRT-LM. El grafo incluye las firmas `decode`, `prefill_128`, `prefill_1024` y `verify` dentro de `tf_lite_prefill_decode`, ademas de un `tf_lite_mtp_drafter`, lo que indica soporte de decodificacion especulativa multi-token (MTP) en el propio artefacto. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esos datos corresponden al modelo base de Gemma 4 y no se detallan en la model card.

La innovacion tecnica de este repositorio no esta en el entrenamiento sino en el grafo de inferencia. El parche, generado con `patch_rope.py --split` (variante block-512, rama `research/3913` de PowerBeef/LiteRT-LM), reescribe la posicion como `512·h + l`: `l` en el rango 0–511 se mantiene exacto en float16 y la fase correspondiente a `512·h` se obtiene de tablas precalculadas para posiciones hasta 32 767, combinadas por adicion de angulos. Se aplica a todas las firmas de `tf_lite_prefill_decode` y al `tf_lite_mtp_drafter`; la mascara de atencion y los indices de la KV-cache no se tocan. En aritmetica exacta las salidas son identicas al original, y en CPU a float32 los logits son bit-identicos por debajo de la posicion 2048.

## Capacidades

- Generacion de texto autoregresiva en el runtime LiteRT-LM, orientada a inferencia on-device.
- Reproduccion y copia exacta de cadenas numericas (digitos, fechas, identificadores) en float16, que es precisamente el fallo que corrige el parche.
- Decodificacion especulativa multi-token mediante el `tf_lite_mtp_drafter` incluido en el grafo.
- Ejecucion en backend GPU (Metal en iOS) y CPU; el autor reporta la prueba en GPU con activaciones float16.
- Capacidades multilingues: no disponibles en la informacion (la unica prueba citada es en frances).
- Tool calling, agentes y modos de razonamiento explicito: no disponibles en la informacion proporcionada.

## Casos de uso

- Extraccion de importes y datos financieros en apps moviles: el modelo puede leer un recibo o un extracto y devolver cifras exactas sin duplicar digitos, que es el fallo que motivaba el parche; encaja en un flujo on-device con ~1,95 GB de memoria en iPhone 14 Pro.
- Procesamiento de fechas y numeros de referencia en formularios: al mantener la fase rotatoria exacta en posiciones altas, la copia literal de identificadores y fechas deja de corromperse en secuencias largas.
- Asistentes de voz o texto con contexto largo en el dispositivo: la correccion se aplica a `prefill_1024` y a todas las firmas de prefill/decode, de modo que la fidelidad se mantiene al crecer la ventana de contexto.
- Traduccion o transcripcion con verificacion numerica: util en dominios donde un digito mal copiado invalida el resultado (sanidad, legal, logistica), con la salvedad de que solo se ha validado una sonda en frances.
- Inferencia offline en movil con requisitos de privacidad: al ejecutarse en LiteRT-LM sobre GPU local, los datos no salen del dispositivo; el consumo medido es de ~1,95 GB de memoria y 24,7 tok/s de decode.
- Evaluacion y depuracion de runtimes LiteRT-LM: sirve como referencia para comparar el comportamiento del grafo original frente al parcheado en pruebas de fidelidad posicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor solo reporta una medicion propia:

| Metrica | Valor | Entorno |
|---|---|---|
| Decode | 24,7 tok/s | iPhone 14 Pro, 6 GB, backend GPU, float16, MTP activado |
| Memoria en meseta | ~1,95 GB | mismo entorno |
| Fidelidad numerica | 30 turnos sin duplicacion de digitos | sonda de fidelidad numerica en frances |
| Equivalencia en CPU float32 | logits bit-identicos por debajo de posicion 2048 | comparacion con el original |

## Requisitos de hardware

- VRAM/memoria estimada: ~1,95 GB en meseta medida en iPhone 14 Pro con backend GPU y float16; el artefacto pesa 2,59 GB en disco.
- GPU recomendadas: no hay lista oficial; el autor valida el backend GPU (Metal) en iPhone 14 Pro. Para escritorio no se proporcionan datos.
- Cabe en GPU de consumo: si, al menos en el movil citado; no se confirma en tarjetas de escritorio (RTX 4090, etc.).
- Opciones de despliegue: runtime LiteRT-LM (libreria `litert-lm`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no consumen este formato.
- Latencia y throughput: 24,7 tok/s de decode en el entorno medido; no hay datos de prefill ni de latencia por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Aescleah/gemma-4-E2B-it-litert-lm-rope-fix | no disponible (variante E2B) | no disponible | LiteRT-LM | Apache 2.0 | Parche RoPE para float16 |
| litert-community/gemma-4-E2B-it-litert-lm | no disponible (variante E2B) | no disponible | LiteRT-LM | Apache 2.0 | Grafo original; presenta el fallo de duplicacion de digitos en float16 |
| Gemma 4 E2B (upstream) | no disponible | no disponible | safetensors / otros | terminos Gemma | Modelo base del que deriva el artefacto LiteRT-LM |

No se dispone de datos de benchmarks comunes que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El parche solo corrige la ruta RoPE en float16; no aborda otros posibles sesgos o fallos del modelo base.
- La validacion publicada se limita a una sonda de fidelidad numerica en frances de 30 turnos en un unico dispositivo (iPhone 14 Pro); no hay validacion multilingue ni en otros backends.
- El modelo base Gemma 4 esta sujeto a los terminos de Gemma ademas de la licencia Apache 2.0; conviene revisar las restricciones de uso comercial de dichos terminos.
- Riesgo de alucinacion: no se documenta en la informacion disponible, pero es inherente a los modelos generativos y no queda cubierto por este parche.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-17); no hay historial de uso ni validacion comunitaria.
- El formato LiteRT-LM restringe el despliegue a ese runtime; no es directamente compatible con ecosistemas como llama.cpp o vLLM.
- El parche modifica el grafo, no los pesos, pero cualquier herramienta que verifique el sha256 del artefacto original rechazara este fichero (sha256 distinto: `a963992d...` frente a `181938105e...`).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Aescleah/gemma-4-E2B-it-litert-lm-rope-fix
- Modelo base en Hugging Face: https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm
- Issue LiteRT-LM #3913: https://github.com/google-ai-edge/LiteRT-LM/issues/3913
- Issue LiteRT-LM #2814: https://github.com/google-ai-edge/LiteRT-LM/issues/2814
- Rama con el parche (PowerBeef/LiteRT-LM, `research/3913`): no se proporciona URL directa en la informacion disponible
