# kingjones777/Mistral-Small-4-119B-ROCmFPX-Q8_0-GGUF

## Resumen

Mistral-Small-4-119B-ROCmFPX-Q8_0-GGUF es una cuantizacion de 8 bits en formato GGUF del modelo base Mistral Small 4 119B A6B (mistralai/Mistral-Small-4-119B-2603), creada por el usuario kingjones777. El modelo base, desarrollado por Mistral AI, es un modelo de lenguaje de arquitectura MoE (Mixture of Experts) hibrida que unifica capacidades de instruccion, razonamiento y generacion de codigo en un unico sistema, con soporte multimodal (entrada de imagenes) y una ventana de contexto de 256.000 tokens.

Esta cuantizacion concreta utiliza el formato ROCmFPX, una extension de llama.cpp orientada a hardware AMD (ROCm), y se construyo directamente desde los pesos BF16 originales (222 GiB) sin requantizacion intermedia, lo que preserva la fidelidad numerica. El archivo resultante ocupa 114,38 GiB (8,26 bits por peso) y esta pensado para maquinas con mas de 128 GiB de memoria o para inferencia parcial en CPU. No cabe en un AMD Ryzen AI MAX+ 395 (Strix Halo) de 128 GB, como advierte el autor en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) hibrida, transformer con atencion, 64 expertos (estimado) |
| Parametros totales | 118.972.826.624 (119B) |
| Parametros activos | 6.500.000.000 (6,5B) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | Q8_0_ROCMFPX (ftype 111, 8,26 bpw); tambien existen variantes Q8_0_ROCMFPX_AGENT (115) y 4-bit COHERENT (102) |
| Idiomas soportados | Ingles (segun la model card; el modelo base puede tener mas, pero no se ha verificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (v3, 579 tensores, 59 pares KV) |

## Arquitectura y entrenamiento

El modelo base Mistral Small 4 119B A6B es un MoE con 119.000 millones de parametros totales y 6.500 millones activos por token. Combina tres familias de modelos de Mistral en uno solo: instruct, reasoning (anteriormente Magistral) y Devstral (especializado en codigo). La arquitectura es hibrida, con atencion tradicional y capas de mezcla de expertos, lo que permite un coste computacional relativamente bajo para su tamano total. El modelo base acepta entrada multimodal (imagenes) ademas de texto, y soporta un modo de razonamiento explicito (thinking mode) ademas del modo instructivo estandar.

La cuantizacion ROCmFPX es una tecnica desarrollada en el fork de llama.cpp de charlie12345/ROCmFPX, que define tipos de cuantizacion propios (Q8_0_ROCMFPX, Q8_0_ROCMFPX_AGENT) optimizados para la ejecucion en GPUs AMD via ROCm. El autor construyo el archivo GGUF a partir de los pesos BF16 originales (222 GiB) usando `--output-tensor-type q8_0 --token-embedding-type q8_0 --tensor-type shexp=q8_0`, lo que aplico cuantizacion Q8_0 a todos los tensores, incluidos los 108 tensores de expertos compartidos (shexp). No se realizaron pruebas de perplexity ni comparaciones de calidad contra el modelo original.

## Capacidades

- Generacion de texto y chat conversacional en ingles.
- Razonamiento multi-paso con modo de pensamiento explicito (thinking mode) activable.
- Generacion de codigo en multiples lenguajes, gracias a la herencia de Devstral.
- Soporte de tool calling y function calling (segun las especificaciones del modelo base).
- Capacidades multimodales: entrada de imagenes (vision) en el modelo base, aunque no se ha verificado en esta cuantizacion.
- Matematicas y resolucion de problemas cientificos.
- Ventana de contexto larga de 256.000 tokens, util para documentos extensos o conversaciones prolongadas.

## Casos de uso

- Inferencia local en servidores con GPUs AMD de gran memoria (por ejemplo, AMD Instinct MI300X con 192 GB): el modelo puede ejecutarse completamente en GPU con llama.cpp y el fork ROCmFPX, aprovechando la cuantizacion de 8 bits para mantener una buena calidad de salida.
- Despliegue en entornos de produccion con requisitos de privacidad: al ser un archivo GGUF autocontenido, puede alojarse en infraestructura propia sin dependencias externas, siempre que se disponga de suficiente memoria.
- Asistente de programacion con contexto largo: gracias a la ventana de 256.000 tokens, puede analizar repositorios completos o multiples archivos de codigo en una sola pasada, y generar parches o sugerencias.
- Razonamiento complejo y analisis de documentos: el modo de razonamiento permite desglosar problemas cientificos o tecnicos en pasos intermedios, util para investigacion o auditoria.
- Procesamiento de imagenes con texto (OCR, descripcion de diagramas): si se confirma el soporte multimodal en esta cuantizacion, podria usarse para extraer informacion de capturas o graficos.
- Experimentacion con cuantizaciones ROCmFPX: desarrolladores que trabajen con el fork de llama.cpp pueden usar este archivo como referencia para validar el rendimiento de los nuevos tipos de cuantizacion en hardware AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se realizaron pruebas de perplexity, ni comparaciones de calidad contra el modelo original, ni tests de contexto largo o tool calling. El unico dato de rendimiento verificado es la carga en CPU: 256 segundos desde disco con `-ngl 0`. No se proporciona ninguna cifra de tokens por segundo en GPU porque el archivo no cabe en la memoria direccionable del hardware de prueba (128 GB Strix Halo).

## Requisitos de hardware

- VRAM estimada: el archivo GGUF ocupa 114,38 GiB. Con overhead de ejecucion, se recomienda al menos 120-128 GiB de VRAM libre para inferencia completa en GPU.
- GPU recomendadas: AMD Instinct MI300X (192 GB), MI325X, o cualquier GPU con mas de 128 GiB de memoria. En el caso de NVIDIA, el formato ROCmFPX no esta soportado; se necesitaria una version estandar de llama.cpp con cuantizacion Q8_0 convencional.
- No cabe en AMD Ryzen AI MAX+ 395 (Strix Halo) de 128 GB: llama.cpp reporta 113,03 GiB direccionables, insuficientes para los 114,38 GiB del archivo. Intentar cargarlo con `-ngl 999` provoca un bloqueo del sistema (livelock KFD SVM) que requiere reinicio fisico.
- Opciones de despliegue: llama.cpp con el fork ROCmFPX (obligatorio para este formato), o inferencia solo CPU con `-ngl 0` (lento, pero funcional). No es compatible con vLLM, Ollama ni TGI en sus versiones estandar, al requerir tipos de cuantizacion no estandar.
- Latencia y throughput: no medidos en GPU. En CPU puro, la carga tarda 256 segundos; no se reportan tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|---|
| Mistral-Small-4-119B-ROCmFPX-Q8_0 (este) | 119B | 6,5B | 256k | Q8_0_ROCMFPX (8,26 bpw) | Apache 2.0 | Requiere fork ROCmFPX; no cabe en 128 GB |
| Mistral-Small-4-119B-ROCmFP4-GGUF (variante 4-bit) | 119B | 6,5B | 256k | 4-bit COHERENT (4,55 bpw) | Apache 2.0 | Cabe en Strix Halo 128 GB; 37,86 tok/s |
| Mistral-Small-4-119B-2603 (modelo base BF16) | 119B | 6,5B | 256k | BF16 (222 GiB) | Apache 2.0 | Requiere GPU con >200 GB; calidad maxima |
| Mixtral 8x22B | 141B | 39B | 64k | GGUF disponible | Apache 2.0 | MoE mas denso, contexto menor, sin vision |

La comparativa se limita a variantes del mismo modelo base y a un MoE similar de Mistral. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- No cabe en un AMD Ryzen AI MAX+ 395 (Strix Halo) de 128 GB: el autor advierte que intentar cargarlo bloquea el sistema de forma irreversible hasta un ciclo de alimentacion. No usar `-ngl 999` ni `-fit off` en ese hardware.
- Requiere un fork especifico de llama.cpp (charlie12345/ROCmFPX). Las versiones estandar de llama.cpp reportan `invalid ggml type 103` y no pueden cargar el archivo.
- No se ha verificado la calidad del modelo cuantizado: no hay pruebas de perplexity, ni comparaciones con el modelo original, ni tests de tool calling o contexto largo.
- Solo se ha confirmado el idioma ingles. No se garantiza un rendimiento adecuado en otros idiomas.
- Riesgo de alucinacion: no evaluado. Como cualquier modelo de lenguaje, puede generar contenido falso o inconsistente, especialmente en tareas de razonamiento complejo.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base; es recomendable revisar los terminos de Mistral AI para el modelo original.
- El archivo es grande (122,8 GB en el repositorio) y requiere una descarga considerable y espacio en disco.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/kingjones777/Mistral-Small-4-119B-ROCmFPX-Q8_0-GGUF
- Variante 4-bit (recomendada para Strix Halo): https://huggingface.co/kingjones777/Mistral-Small-4-119B-ROCmFP4-GGUF
- Variante 8-bit AGENT: https://huggingface.co/kingjones777/Mistral-Small-4-119B-ROCmFPX-Q8_0-AGENT-GGUF
- Modelo base en HuggingFace: https://huggingface.co/mistralai/Mistral-Small-4-119B-2603
- Fork de llama.cpp con soporte ROCmFPX: https://github.com/charlie12345/ROCmFPX
- Pagina del modelo en NVIDIA NIM: https://build.nvidia.com/mistralai/mistral-small-4-119b-2603
- Ficha en FitMyLLM: https://www.fitmyllm.com/model/mistral-small-4-119b
