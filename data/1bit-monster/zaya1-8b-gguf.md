# 1bit-MONSTER/ZAYA1-8B-GGUF

## Resumen

1bit-MONSTER/ZAYA1-8B-GGUF es una conversion a formato GGUF del modelo Zyphra/ZAYA1-8B, publicada por el equipo del motor de inferencia 1bit. No se trata de un rehost de un GGUF preexistente: segun la model card, es una conversion hecha desde cero con su propio `zaya.py` dentro de un fork de llama.cpp, porque ZAYA1 no estaba disponible antes en formato GGUF. El modelo cuenta con 8.840.233.464 parametros (8,84 mil millones) y se distribuye bajo licencia Apache 2.0, heredada del modelo base.

El repositorio incluye dos ficheros: una conversion en precision completa (`zaya1-8b-f16.gguf`), pensada para recuantizacion posterior, y una cuantizacion `Q4_K_M` (`zaya1-8b-Q4_K_M.gguf`), que es la que el autor recomienda y mide. El tamano total del repositorio es de 23,3 GB. La relevancia actual del artefacto es doble: por un lado, abre el modelo ZAYA1-8B al ecosistema GGUF; por otro, sirve como escaparate de arquitectura del motor 1bit, con kernels propios para Vulkan, ROCm y HRX.

El punto critico es la compatibilidad: el GGUF usa una arquitectura GGUF propia etiquetada como `zaya` y un layout de tensores no estandar (por ejemplo, `cca_conv_grp` en orden tap-major y un rope hibrido con theta 5e6). Por ello, un checkout limpio de llama.cpp no puede cargarlo; hace falta el fork `1bit-MONSTER/llama.cpp` y el motor 1bit.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; identificada como arquitectura GGUF `zaya` en el motor 1bit (modelo base Zyphra/ZAYA1-8B) |
| Parametros totales | 8.840.233.464 (8,84 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 (`zaya1-8b-f16.gguf`) y Q4_K_M (`zaya1-8b-Q4_K_M.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos ficheros); no se distribuyen safetensors en este repositorio |
| Parametros del rope | theta 5e6 (rope hibrido) |
| Tamano del repositorio | 23,3 GB |
| Fecha de publicacion | 2026-09-26 (creacion); 2026-09-26 (ultima actualizacion) |
| Modelo base | Zyphra/ZAYA1-8B |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO) en la informacion proporcionada. Lo unico documentado en esta ficha es el proceso de conversion: el autor indica que el modelo usa una arquitectura registrada como `zaya` en su fork de llama.cpp, con un layout de tensores especifico del que se mencionan dos particularidades. La primera es la tensor `cca_conv_grp`, almacenada en orden tap-major, lo que sugiere la presencia de componentes convolucionales o de agrupacion de canales dentro del grafo. La segunda es un rope hibrido con theta de 5e6, un valor muy alto que apunta a un diseno orientado a contextos largos.

La validacion de la conversion es el dato tecnico mas reseñable. El autor compara la salida del GGUF con el modelo original en transformers ejecutado en FP32 sobre CPU, con top-1 forzado por profesor: la conversion F16 coincide en 95 de 96 posiciones. Como referencia de escala, el propio checkpoint BF16 de HuggingFace coincide con FP32 en 91 de 96 posiciones, de modo que, segun el autor, el error introducido por la conversion es menor que el redondeo a BF16. La tokenizacion se verifico como identica a la del tokenizer original con un pasaje de wikitext, codigo y texto multi-escritura.

## Capacidades

- Generacion de texto conversacional: el repositorio esta etiquetado como `conversational` y declara compatibilidad con endpoints.
- Inferencia local en hardware de consumo y semi-profesional, gracias al fichero Q4_K_M y a los backends Vulkan, ROCm y HRX del motor 1bit.
- Recuantizacion posterior: el fichero F16 se distribuye explicitamente para generar otras cuantizaciones.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no esta informado).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Capacidades del modelo base (razonamiento, codigo, matematicas): no disponibles; no se detallan en la model card de esta conversion.

## Casos de uso

- Inferencia local en equipos con GPU integrada AMD de memoria unificada. El autor mide 93 tok/s de decodificacion con backend Vulkan sobre Strix Halo con el fichero Q4_K_M, con 3437 tok/s de prefill en pp512. Es un escenario realista para asistentes y chat local sin GPU dedicada.
- Despliegue en estaciones de trabajo AMD con ROCm. Para entornos donde Vulkan no este disponible, el backend ROCm ofrece 61,5 tok/s en el mismo hardware y cuantizacion, segun la medicion publicada.
- Servicio de chat autoalojado sobre el motor 1bit. El comando documentado (`1bit serve -m zaya1-8b-Q4_K_M.gguf --device vulkan`) expone el modelo como servicio, con el fichero Q4_K_M como opcion recomendada para servir.
- Generacion de cuantizaciones propias a partir del F16. Equipos que necesiten Q3, Q5 u otros niveles pueden partir del fichero de precision completa para ajustar el equilibrio tamano/calidad a su hardware.
- Investigacion sobre la arquitectura `zaya`. Dado que la conversion va acompanada de kernels propios en el fork de llama.cpp, es un punto de partida para estudiar el layout `cca_conv_grp` y el rope hibrido con theta 5e6.
- Evaluacion comparativa de backends en hardware AMD. Las tres mediciones publicadas (Vulkan, ROCm, HRX) permiten usar este modelo como banco de pruebas para decidir el backend de inferencia en una flota concreta.
- Aplicaciones conversacionales de baja latencia en el borde. Con 8,84 mil millones de parametros en Q4_K_M, el modelo es candidato para despliegues donde no se puede asumir el coste de un modelo mayor ni la dependencia de un proveedor externo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni metricas equivalentes). Lo que si se publica son mediciones de fidelidad de conversion y de rendimiento de inferencia.

| Metrica | Resultado | Contexto |
|---|---|---|
| Coincidencia top-1 forzada (F16 vs FP32) | 95/96 posiciones | Validacion contra el modelo original en transformers, FP32, CPU |
| Coincidencia top-1 forzada (BF16 de HF vs FP32) | 91/96 posiciones | Referencia de escala publicada por el autor |
| Decodificacion, backend Vulkan | 93 tok/s | Q4_K_M, Strix Halo |
| Prefill pp512, backend Vulkan | 3437 tok/s | Q4_K_M, Strix Halo |
| Decodificacion, backend ROCm | 61,5 tok/s | Q4_K_M, Strix Halo |
| Decodificacion, backend HRX | 25,5 tok/s | Q4_K_M, Strix Halo |

## Requisitos de hardware

- VRAM estimada para F16: en torno a 17,7 GB solo para pesos (8,84 mil millones de parametros a 2 bytes), mas overhead de contexto y buffers. Es una estimacion derivada del recuento de parametros, no un dato publicado.
- VRAM estimada para Q4_K_M: en torno a 5,3-5,8 GB para pesos, mas overhead. Estimacion, no dato publicado. El repositorio completo ocupa 23,3 GB, consistente con ambos ficheros.
- GPU recomendadas: no se publica una lista de GPU recomendadas. El unico hardware con mediciones es Strix Halo (memoria unificada AMD).
- Cabe en GPU de consumo: con Q4_K_M, si, en tarjetas con 8 GB o mas de VRAM dentro de la estimacion anterior. Con F16 requiere tarjetas de 24 GB o memoria unificada amplia. No hay validacion publicada en RTX 4090, A100 ni H100.
- Backends soportados: Vulkan, ROCm y HRX a traves del motor 1bit. El autor recomienda Vulkan para este modelo en su hardware.
- Despliegue: `1bit serve -m zaya1-8b-Q4_K_M.gguf --device vulkan`. Un checkout limpio de llama.cpp no cargara este GGUF por el layout de tensores; hacen falta el fork `1bit-MONSTER/llama.cpp` y sus kernels. No hay soporte confirmado en vLLM, TGI, Ollama ni LM Studio.
- Latencia y throughput: 93 tok/s de decodificacion y 3437 tok/s de prefill (pp512) con Vulkan y Q4_K_M sobre Strix Halo. No hay datos de latencia para otros equipos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 1bit-MONSTER/ZAYA1-8B-GGUF | 8,84 mil millones | no disponible | 93 tok/s decode (Vulkan, Q4_K_M, Strix Halo); validacion 95/96 vs FP32 | Apache 2.0 | GGUF F16 y Q4_K_M, requiere el fork de 1bit |
| Zyphra/ZAYA1-8B (modelo base) | 8,84 mil millones | no disponible | sin mediciones publicadas en esta informacion | Apache 2.0 | Pesos originales en el repositorio de Zyphra |

No se dispone de datos verificados en la informacion proporcionada para comparar con otras alternativas de 8B en formato GGUF (por ejemplo, familias Llama, Qwen o Mistral): los valores de parametros, contexto, rendimiento y licencia de esos modelos no se han consultado aqui y no se incluyen para no introducir datos no comprobados.

## Limitaciones y advertencias

- Fidelidad de la conversion: aunque la validacion es buena (95/96 posiciones frente a FP32), existe una perdida residual de precision respecto al checkpoint original. La cuantizacion Q4_K_M anade ademas su propia perdida, no cuantificada en la model card.
- Dependencia de un fork: el GGUF usa un layout de tensores no estandar (`cca_conv_grp` en orden tap-major) y un rope hibrido con theta 5e6. Un llama.cpp upstream no lo cargara, lo que limita la portabilidad y ata el modelo al mantenimiento del fork `1bit-MONSTER/llama.cpp`.
- Compatibilidad de herramientas: no hay confirmacion de soporte en vLLM, TGI, Ollama, LM Studio u otros runners habituales de GGUF. Cualquier pipeline de produccion debe validar primero la carga con el motor 1bit.
- Validacion limitada: la verificacion publicada cubre 96 posiciones en tres tipos de texto, no una evaluacion de calidad a gran escala.
- Idiomas: el campo de idiomas no esta informado; no se puede asumir cobertura multilingue ni un rendimiento concreto en castellano.
- Sesgos y alucinacion: no hay informacion sobre sesgos, datos de entrenamiento ni tasas de alucinacion del modelo base en la informacion proporcionada. Al ser un modelo generativo, el riesgo de alucinacion existe, pero no esta cuantificado.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion independiente de la comunidad.
- Licencia: Apache 2.0 permite uso comercial y modificacion, con obligacion de conservar los avisos de licencia y atribucion al modelo base Zyphra/ZAYA1-8B. Conviene revisar los terminos del modelo base por si anaden condiciones adicionales.
- Fechas: la model card indica fechas de creacion y actualizacion de 2026-09-26; verificar su coherencia antes de citarla.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/1bit-MONSTER/ZAYA1-8B-GGUF
- Modelo base: https://huggingface.co/Zyphra/ZAYA1-8B
- Motor 1bit: https://github.com/1bit-MONSTER/engine
- Fork de llama.cpp con soporte ZAYA1: `1bit-MONSTER/llama.cpp` (referenciado en la model card, sin URL directa en la informacion disponible)
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados obtenidos corresponden a articulos genericos sobre el concepto de bit y a una plataforma de creacion de imagenes no relacionada.
