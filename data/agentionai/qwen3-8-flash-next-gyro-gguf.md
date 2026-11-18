# agentionai/Qwen3.8-Flash-Next-Gyro-GGUF

## Resumen

Qwen3.8-Flash-Next Gyro es una familia de cuantizaciones GGUF del modelo base Qwen/Qwen3.8-Flash-Next, un transformer de tipo mezcla de expertos (MoE) con 125.743.653.760 par\u00e1metros totales, publicado por el usuario agentionai en Hugging Face. El objetivo declarado es hacer viable un modelo de ese tama\u00f1o en GPUs de consumo: la variante Gyro-S ocupa 27,64 GiB de pesos y cabe en una tarjeta de 32 GB, mientras que Gyro-M (34,98 GiB) apunta a 48 GB y Gyro-L (50,21 GiB) a 64 GB de memoria unificada. El pipeline declarado es image-text-to-text, por lo que el modelo base admite entrada de imagen adem\u00e1s de texto.

La propuesta t\u00e9cnica se apoya en dos piezas propias: el formato de compresi\u00f3n Agention Precision Rotor (APR), que almacena los expertos enrutados en una base rotada con tipos trellis (TQK6/TQK7, TQ2_T, TQP5-7), y una tabla n-grama opcional que puede omitirse con las variantes `-noPLE` para reducir el tama\u00f1o de descarga. El autor publica m\u00e9tricas de divergencia KL y top-1 frente al modelo sin cuantizar, as\u00ed como comparativas directas con cuantizaciones IQ de ISTA-DASLab, UD de unsloth, IQ4_NL de ggml-org y EXL3 de turboderp.

La relevancia actual es doble: por un lado, demuestra que un MoE de 125B puede servirse con calidad cercana a Q4 en la mitad de memoria; por otro, introduce dependencias de motor no triviales, ya que llama.cpp upstream todav\u00eda no carga estos ficheros y se requiere Strata 0.2.0+, halo-box/strix-llama.cpp o el fork agentionai/llama.cpp. Con casi 2 millones de descargas, es una de las cuantizaciones experimentales m\u00e1s difundidas del ecosistema Qwen3.8.

## Especificaciones t\u00e9cnicas

| Par\u00e1metro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), seg\u00fan el modelo base Qwen/Qwen3.8-Flash-Next; detalles internos no disponibles |
| Par\u00e1metros totales | 125.743.653.760 (125,7B) |
| Par\u00e1metros activos | no disponible |
| Longitud de contexto | hasta 128k tokens (Gyro-S: 28,8 GiB a 64k; soporta hasta 128k) |
| Tipos de cuantizaci\u00f3n | TQ1_0 (Gyro-S), TQ2_0 (Gyro-M), TQ3_0 (Gyro-L); expertos en trellis TQK6/TQK7, TQ2_T, TQP5-7; variantes `-noPLE`; referencia AP-Q4_K_XL; tambi\u00e9n Gyro-Coder (19,92 GiB) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en el Hub) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 125,7B par\u00e1metros totales, seg\u00fan los metadatos de safetensors. La model card no detalla el n\u00famero de expertos por capa, los par\u00e1metros activos por token, el n\u00famero de tokens de entrenamiento ni la composici\u00f3n del dataset; esa informaci\u00f3n debe consultarse en la ficha del modelo original Qwen/Qwen3.8-Flash-Next. S\u00ed se menciona que la variante Gyro-Coder incorpora 256 expertos de c\u00f3digo por capa, lo que sugiere una especializaci\u00f3n por dominios dentro del enrutamiento.

La innovaci\u00f3n principal de esta publicaci\u00f3n no est\u00e1 en el entrenamiento sino en la compresi\u00f3n. Los expertos enrutados se almacenan en una base rotada mediante el c\u00f3digo Agention Precision Rotor (APR), con tipos trellis que el autor agrupa comercialmente bajo las etiquetas TQ1_0/TQ2_0/TQ3_0. Adem\u00e1s, se incluye una tabla n-grama (PLE) que puede eliminarse en las variantes `-noPLE` para reducir el peso de descarga. El autor reporta que los ficheros requieren motores espec\u00edficos: Strata 0.2.0 o superior (NVIDIA y AMD RX 7000/9000/R9700), halo-box/strix-llama.cpp master (CPU, Vulkan, HIP) o agentionai/llama.cpp (CPU, Vulkan, CUDA), este \u00faltimo con soporte para el borrador MTP (multi-token prediction) usado en las pruebas de velocidad.

## Capacidades

- Generaci\u00f3n de texto conversacional multi-turno, con pipeline declarado image-text-to-text (entrada de imagen y texto).
- Razonamiento largo: el autor reporta ejecuciones de hasta 128k tokens en problemas de LiveCodeBench v6 sin bucles de generaci\u00f3n en las versiones actualizadas.
- Generaci\u00f3n de c\u00f3digo: 30/30 problemas resueltos en el subconjunto de 30 problemas de LiveCodeBench v6 con Gyro-M y 128k tokens de margen; 90% con l\u00edmite de 64k.
- Variante especializada Gyro-Coder con 256 expertos de c\u00f3digo por capa para GPUs de 24 GB.
- Razonamiento matem\u00e1tico y de prop\u00f3sito general evaluado v\u00eda MMLU-Pro (80,0 en Gyro-M; 78,1 en Gyro-S; 81,4 en la referencia AP-Q4_K_XL).
- Decodificaci\u00f3n especulativa mediante borrador MTP en el fork agentionai/llama.cpp (218 tok/s frente a 221 tok/s sin \u00e9l en RTX 5090, seg\u00fan la tabla de titulares).
- Soporte de tool calling / function calling: no disponible en la informaci\u00f3n proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible de forma expl\u00edcita; el razonamiento largo y el modo de c\u00f3digo sugieren uso ag\u00e9ntico, pero no se documenta.
- Capacidades multiling\u00fces: no disponibles.
- Variante abliterated (Gyro-abliterated-Huihui) publicada por el mismo autor.

## Casos de uso

- Asistente de c\u00f3digo en estaci\u00f3n de trabajo con GPU de 32 GB: desplegando Gyro-S en una RTX 5090 o R9700, el modelo resuelve problemas de programaci\u00f3n con contexto de hasta 128k tokens, lo que permite pegar repositorios completos o trazas de error extensas sin truncar.
- Razonamiento sobre documentos largos en memoria unificada: en equipos Strix Halo con 64 GB, Gyro-M o Gyro-L permiten analizar contratos, informes o c\u00f3digo legado de decenas de miles de tokens manteniendo la conversaci\u00f3n multi-turno.
- Servicio de generaci\u00f3n de c\u00f3digo en producci\u00f3n con presupuesto de VRAM ajustado: Gyro-Coder (19,92 GiB) cabe en tarjetas de 24 GB y ofrece 256 expertos de c\u00f3digo por capa, adecuado para autocompletado y revisi\u00f3n en pipelines de CI/CD.
- Evaluaci\u00f3n comparativa de cuantizaciones: investigadores pueden reproducir las m\u00e9tricas KLD y top-1 del autor frente a IQ2_XS, IQ3_XXS, UD-Q2_K_XL, IQ4_NL y EXL3 usando los mismos conjuntos held-out y de c\u00f3digo.
- Procesamiento de im\u00e1genes y texto en local: al declarar pipeline image-text-to-text, el modelo base sirve para tareas de descripci\u00f3n de im\u00e1genes o extracci\u00f3n de informaci\u00f3n de capturas y documentos escaneados, siempre que el motor GGUF soporte la torre visual (no confirmado en la model card).
- Despliegue en cl\u00fasteres peque\u00f1os con dos GPUs de 24 GB: Gyro-M (34,98 GiB) se reparte entre dos tarjetas de 24 GB, ofreciendo calidad cercana a Q4 (KLD 0,291 frente a 0,107 de AP-Q4_K_XL) con una huella mucho menor.
- Investigaci\u00f3n sobre alineaci\u00f3n y rechazo: la variante abliterated permite estudiar el comportamiento del modelo sin capas de rechazo, \u00fatil en estudios de seguridad.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. KLD = divergencia KL frente al modelo sin cuantizar (menor es mejor); top-1 = coincidencia de token predicho (mayor es mejor).

| Fichero | Memoria GPU | KLD | top-1 |
|---|---:|---:|---:|
| Gyro-S (actualizado 2026-10-10) | 27,64 GiB | 0,401 | 75,29% |
| Gyro-M (actualizado 2026-10-11) | 34,98 GiB | 0,291 | 78,75% |
| Gyro-L (nuevo 2026-10-12) | 50,21 GiB | 0,146 | 83,87% |
| ISTA-DASLab GSQ-RCO IQ2_XS | 36,52 GiB | 0,420 | 74,22% |
| ISTA-DASLab GSQ-RCO IQ3_XXS | 43,80 GiB | 0,311 | 77,68% |
| unsloth UD-Q2_K_XL | 46,63 GiB | 0,334 | 76,61% |
| AtomicChat AD-4.27bpw Q4_K_M | 52,26 GiB | 0,228 | 80,58% |
| ggml-org IQ4_NL | 68,21 GiB | 0,200 | 81,29% |
| Agention AP-Q4_K_XL (referencia) | 67,38 GiB | 0,107 | 85,52% |

Comparativa Gyro frente a EXL3 de turboderp (mismo build de llama.cpp, misma m\u00e1quina Strix Halo, sin MTP):

| Fichero | Memoria GPU | KLD | top-1 | KLD c\u00f3digo | tok/s decodificaci\u00f3n |
|---|---:|---:|---:|---:|---:|
| Gyro-S | 27,64 GiB | 0,399 | 75,33% | 0,109 | 35,2 |
| EXL3 1.66 bpw | 26,52 GiB | 0,443 | 73,78% | 0,130 | 22,5 |
| Gyro-M | 34,98 GiB | 0,291 | 78,65% | 0,066 | 29,5 |
| EXL3 2.18 bpw | 34,93 GiB | 0,300 | 78,28% | 0,073 | 21,7 |
| EXL3 2.05 bpw | 32,92 GiB | 0,315 | 77,83% | 0,075 | 23,2 |
| Gyro-L | 50,21 GiB | 0,146 | 83,94% | 0,026 | 28,4 |
| EXL3 3.18 bpw | 49,33 GiB | 0,142 | 84,21% | 0,028 | 20,8 |

Otras m\u00e9tricas reportadas:

| Prueba | Resultado |
|---|---|
| MMLU-Pro (muestra de 70 preguntas, Gyro-M) | 80,0 (AP-Q4_K_XL: 81,4) |
| MMLU-Pro (Gyro-S) | 78,1 |
| LiveCodeBench v6, 30 problemas, Gyro-M, l\u00edmite 64k | 90% |
| LiveCodeBench v6, 30 problemas, Gyro-M, l\u00edmite 128k | 30/30 |
| LiveCodeBench v6, 30 problemas, Gyro-S, 64k / 128k | 67% / 83% |
| Velocidad en RTX 5090 (Gyro-S, VRAM completa, Strata) | 221 tok/s |
| Velocidad en RTX 5090 (Gyro-S, con borrador MTP) | 218 tok/s |
| Prefill (mismo build) | ~600-700 tok/s |
| Test de bucles (45 ejecuciones, Gyro-S y Gyro-M actualizados) | 0 bucles |

## Requisitos de hardware

- Gyro-S (TQ1_0): 27,64 GiB de pesos; 28,8 GiB a contexto de 64k; hasta 128k de contexto. Cabe en RTX 5090, R9700 y tarjetas de 32 GB.
- Gyro-M (TQ2_0): 34,98 GiB de pesos. Requiere una GPU de 48 GB o dos de 24 GB, o 64 GB de memoria unificada.
- Gyro-L (TQ3_0): 50,21 GiB de pesos. Pensado para 64 GB de memoria unificada (Strix Halo).
- Gyro-Coder: 19,92 GiB, apto para tarjetas de 24 GB.
- Con cach\u00e9 de expertos de Strata, Gyro-S puede ejecutarse en tarjetas de 16-24 GB con penalizaci\u00f3n de rendimiento no cuantificada en la informaci\u00f3n disponible.
- Motores compatibles: Strata 0.2.0+ (NVIDIA y AMD RX 7000/9000/R9700), halo-box/strix-llama.cpp master (CPU, Vulkan, HIP) y agentionai/llama.cpp (CPU, Vulkan, CUDA). llama.cpp upstream no carga estos ficheros todav\u00eda.
- Throughput medido: 221 tok/s en RTX 5090 con Gyro-S totalmente residente en VRAM; 35,2 tok/s de decodificaci\u00f3n en Strix Halo con Gyro-S y 29,5 tok/s con Gyro-M; prefill de ~600-700 tok/s en Strix Halo.
- Opciones de despliegue tipo vLLM, TGI, Ollama o llama.cpp est\u00e1ndar: no disponibles para estos ficheros seg\u00fan la model card.

## Comparativa con modelos similares

| Modelo | Par\u00e1metros | Contexto | Memoria m\u00ednima | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next Gyro (esta ficha) | 125,7B MoE | hasta 128k | 27,64 GiB (Gyro-S) | qwen-community-1.0 | GGUF en Hugging Face; motores propios |
| turboderp/Qwen3.8-Flash-Next-exl3 | 125,7B MoE (base) | no disponible | 26,52 GiB (1.66 bpw) | seg\u00fan base | EXL3; requiere build con PRs Vulkan #201/#204 |
| ISTA-DASLab GSQ-RCO (IQ2_XS / IQ3_XXS) | 125,7B MoE (base) | no disponible | 36,52 / 43,80 GiB | seg\u00fan base | GGUF est\u00e1ndar |
| unsloth UD-Q2_K_XL | 125,7B MoE (base) | no disponible | 46,63 GiB | seg\u00fan base | GGUF est\u00e1ndar |
| ggml-org IQ4_NL | 125,7B MoE (base) | no disponible | 68,21 GiB | seg\u00fan base | GGUF est\u00e1ndar |

En calidad por GiB, Gyro-S y Gyro-M superan a IQ2_XS, IQ3_XXS y UD-Q2_K_XL con menos memoria; frente a EXL3, la calidad es comparable (ligeramente mejor en S y M y en c\u00f3digo, ligeramente peor en texto general en L) con una decodificaci\u00f3n entre 1,3 y 1,6 veces m\u00e1s r\u00e1pida en el mismo build. La contrapartida es la dependencia de motores no est\u00e1ndar.

## Limitaciones y advertencias

- Los ficheros no cargan en llama.cpp upstream: requieren Strata 0.2.0+, halo-box/strix-llama.cpp o el fork agentionai/llama.cpp, lo que limita la portabilidad y complica el despliegue en producci\u00f3n.
- Las etiquetas TQ1_0/TQ2_0/TQ3_0 son solo una clase de tama\u00f1o para el Hub; los expertos usan tipos trellis propietarios (TQK6/TQK7, TQ2_T, TQP5-7) y el formato APR, no est\u00e1ndar.
- P\u00e9rdida de calidad medible frente al modelo sin cuantizar: KLD de 0,401 en Gyro-S y 0,291 en Gyro-M frente a 0,107 de AP-Q4_K_XL; top-1 de 75,29% y 78,75% frente a 85,52%.
- Riesgo de bucles en generaci\u00f3n larga: el autor documenta 7/10 bucles en ISTA IQ2_XS y 2/20 en la primera versi\u00f3n de Gyro-S; las versiones actualizadas reportan 0 bucles en el test de 45 ejecuciones, pero el fen\u00f3meno no puede descartarse en otros prompts.
- Los benchmarks del autor usan muestras peque\u00f1as (70 preguntas en MMLU-Pro, 30 problemas en LiveCodeBench, una sola semilla en varios casos) y el propio autor los califica de "within noise"; no deben tratarse como cifras definitivas.
- Idiomas soportados no documentados; el comportamiento multiling\u00fce depender\u00e1 del modelo base.
- Licencia qwen-community-1.0: es necesario revisar sus t\u00e9rminos para uso comercial, ya que no es una licencia permisiva est\u00e1ndar (Apache 2.0 o MIT).
- El modelo se etiqueta como experimental (`qwen4exp`, `experimental`), lo que desaconseja su uso en producci\u00f3n sin validaci\u00f3n previa.
- Sesgos conocidos: no documentados en la informaci\u00f3n proporcionada.
- La variante abliterated elimina las capas de rechazo y no deber\u00eda desplegarse en entornos p\u00fablicos sin moderaci\u00f3n adicional.
- El tama\u00f1o del repo (706,7 GB) implica descargas muy pesadas; las variantes `-noPLE` reducen el peso pero no se cuantifica cu\u00e1nto en la informaci\u00f3n disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante de c\u00f3digo: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-Coder-GGUF
- Variante abliterated: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-abliterated-Huihui-GGUF
- Cuantizaciones EXL3 de referencia: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Motor Strata: https://github.com/Niko1221/Strata
- Fork para Strix Halo: https://github.com/halo-box/strix-llama.cpp
- Fork agentionai de llama.cpp: https://gitlab.com/agentionai-group/llama.cpp
