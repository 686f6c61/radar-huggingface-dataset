# jiaheng0815/Swift-Bonsai-2-NInfer-Port

## Resumen

Swift-Bonsai-2-NInfer-Port es un paquete de despliegue comunitario publicado por el usuario jiaheng0815 que adapta el modelo Swift Bonsai 2 (UkisAI) para el motor de inferencia NInfer sobre Windows y GPUs NVIDIA Blackwell (sm_120a). No se trata de un modelo nuevo entrenado desde cero: es la combinacion de un binario de motor, DLLs, artefactos cuantizados y scripts de arranque, mas un recorte de vocabulario (de 248.320 a 208.030 entradas) que, segun el autor, no introduce perdida en chino ni en ingles. El modelo subyacente es un ajuste fino de Ternary Bonsai 2 27B (PrismML), derivado a su vez de Qwen3.8-27B, con pesos cuantizados en ternario 1.58-bit.

La relevancia actual del paquete radica en que permite ejecutar un modelo de 27B con contexto de 262.144 tokens y capacidades multimodales (vision) en una GPU de consumo como la RTX 5060 Ti de 16 GB, con cifras medidas de 654 tok/s de prefill y 64-82 tok/s de decodificacion. Incluye MTP con K=3, cache KV en nvfp4 y API compatible con OpenAI en el puerto 8080. Es, por tanto, una solucion de inferencia local empaquetada "llave en mano" para hardware muy concreto.

El proyecto se declara no oficial y sin vinculo con PrismML, UkisAI, Qwen ni CraneBW. La licencia de los pesos es Apache-2.0 y el motor (CraneBW/ninfer-ternary-bonsai-ada) tambien es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer heredado de Qwen3.8-27B, con cuantizacion ternaria 1.58-bit; no se detalla mas en la informacion disponible |
| Parametros totales | 27B (segun denominacion del modelo) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Ternaria 1.58-bit (artefacto a partir de `Swift-Bonsai-2-PQ2_0.gguf`); cache KV en nvfp4, 16 KiB por token |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Artefactos propietarios del motor NInfer, generados a partir de GGUF (`PQ2_0`); repositorio de 7,4 GB |

## Arquitectura y entrenamiento

El modelo es una cadena de derivaciones: Qwen3.8-27B como base, Ternary Bonsai 2 27B de PrismML como cuantizacion ternaria intermedia, y Swift Bonsai 2 de UkisAI como ajuste fino orientado a eficiencia de inferencia. El ajuste de Swift Bonsai 2 se presenta como una optimizacion del razonamiento que reduce la mediana de tokens de pensamiento en un 39,8 %, medido sobre GPQA-Diamond. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

La innovacion tecnica del port no reside en el entrenamiento, sino en el empaquetado: los artefactos se generan byte a byte desde el GGUF oficial sin des-cuantizar y re-cuantizar, y se validan mediante un conjunto de comprobaciones (disposicion de carga, tabla de simbolos, orden de filas y ensamblado completo, 15/15). Ademas se recorta el vocabulario y se emplea MTP con K=3 en decodificacion. En la informacion disponible no se detalla el tipo de atencion ni si existe algun componente SSM o hibrido.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento (thinking tokens), segun la propia descripcion del ajuste de Swift Bonsai 2.
- Vision: procesa graficos, imagenes de escena, pares de imagenes y video, y todas las pruebas visuales declaradas se superan.
- Contexto largo: recuperacion verificada tipo needle-in-haystack con 144.975 tokens de contexto.
- Multilingue limitado a chino e ingles.
- Servidor compatible con la API de OpenAI (`/v1/models` en `http://127.0.0.1:8080`, nombre de modelo `swift-bonsai2-27b`).
- Decodificacion con MTP (K=3) y cache de prefijos que reduce el TTFT a 79 ms en contextos de 15k.
- Soporte de tool calling / function calling y de agentes multi-paso: no disponible en la informacion proporcionada.
- Audio: no soportado segun la informacion disponible.

## Casos de uso

- Inferencia local con privacidad de datos: al ejecutarse integramente en una estacion de trabajo Windows con RTX 50, permite procesar informacion sensible sin enviarla a servicios externos.
- Analisis de documentos extensos: gracias a los 262.144 tokens de contexto y a la recuperacion verificada en 144.975 tokens, puede resumir o consultar contratos, informes tecnicos o expedientes largos en una sola pasada.
- Analisis de graficos e imagenes tecnicas: la capacidad de vision permite extraer conclusiones de diagramas, capturas de pantalla o figuras de articulos cientificos para generar informes descriptivos.
- Atencion al cliente multilingue zh/en: con cache de prefijos y baja latencia de primer token, es adecuado para asistentes conversacionales que mantienen contexto largo entre turnos.
- Recuperacion aumentada (RAG) sobre corpus grandes: el cache de prefijos con TTFT de 825 ms a 131k tokens reduce coste cuando se reutiliza un mismo contexto de sistema o base documental.
- Despliegue de servicios OpenAI-compatibles en local: al exponer `/v1/models` y un endpoint compatible, se integra en herramientas que ya consumen la API de OpenAI sin cambios de codigo.
- Prototipado de razonamiento con modo de pensamiento: util para tareas que requieren cadenas de razonamiento largas, aprovechando la reduccion de tokens de pensamiento declarada por el autor del ajuste.
- Evaluacion y benchmarking en hardware Blackwell: sirve como banco de pruebas para medir el rendimiento de cuantizaciones ternarias y del motor NInfer en GPUs sm_120a.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perplejidad (PPL, mismo corpus con KV fp8) | 4,9912 (linea base 4,9895) |
| Prefill, contexto de 20k | 654 tok/s |
| Prefill, contexto de 131k | 484 tok/s |
| Decodificacion, prosa | 64 tok/s |
| Decodificacion, 131k con MTP K=3 | 82 tok/s |
| TTFT con prefijo cacheado, 15k | 79 ms |
| TTFT con prefijo cacheado, 131k | 825 ms |
| Recuperacion en contexto largo | needle-in-haystack de 144.975 tokens, correcto |
| Reduccion de tokens de pensamiento | -39,8 % de mediana (dato oficial de Swift Bonsai 2 sobre GPQA-Diamond; no reproducido en local) |
| Validacion de artefactos | 15/15 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar. El propio autor advierte que la reduccion del 39,8 % de tokens de pensamiento no mostro diferencias significativas en pruebas A/B de tareas cortas en su maquina.

## Requisitos de hardware

- VRAM estimada: 16 GB (configuracion probada en una RTX 5060 Ti de 16 GB).
- GPU recomendadas: exclusivamente NVIDIA Blackwell sm_120a, es decir, la serie RTX 50. No hay soporte indicado para generaciones anteriores ni para GPUs de datacenter.
- Compatibilidad con GPU de consumo: si, en RTX 5060 Ti 16 GB y, presumiblemente, en el resto de la serie RTX 50 con VRAM suficiente; no se confirma mas alla de esa configuracion.
- Sistema operativo: Windows 10/11 de 64 bits.
- Opciones de despliegue: motor NInfer empaquetado (ejecutable + DLL + scripts). CUDA va enlazado de forma estatica y FFmpeg y las librerias VC++ se incluyen en el paquete, por lo que no requiere dependencias externas. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: prefill de 654 tok/s a 20k, 484 tok/s a 131k; decodificacion de 64 tok/s en prosa y 82 tok/s a 131k con MTP K=3; TTFT de 79 ms a 15k y 825 ms a 131k con prefijo cacheado.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento de modelos comparables de la misma categoria (27B, cuantizacion ternaria, despliegue local). El unico dato de contexto es la relacion de dependencia con los modelos predecesores: Ternary Bonsai 2 27B (PrismML) y Qwen3.8-27B (Qwen), para los que tampoco se aportan cifras comparativas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift-Bonsai-2-NInfer-Port | 27B | 262.144 tokens | PPL 4,9912; 64-82 tok/s decode | Apache-2.0 | Windows + Blackwell sm_120a |
| Ternary Bonsai 2 27B (base) | 27B | no disponible | no disponible | no disponible | no disponible |
| Qwen3.8-27B (base raiz) | 27B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dependencia de hardware muy restrictiva: solo funciona en GPUs NVIDIA Blackwell sm_120a (serie RTX 50) y Windows 10/11 de 64 bits. Queda excluida cualquier otra GPU o sistema operativo.
- Cobertura idiomatica limitada a chino e ingles; no hay soporte declarado de castellano ni de otros idiomas.
- Sesgos conocidos: no disponible. Al derivarse de Qwen, se heredan los sesgos de ese modelo base, pero no se documenta un analisis especifico.
- Riesgo de alucinacion: no se documenta. La PPL de 4,9912 no equivale a una garantia de veracidad en tareas de conocimiento.
- La reduccion del 39,8 % de tokens de pensamiento es un dato oficial del ajuste Swift Bonsai 2 medido en GPQA-Diamond, y el autor del port reconoce que no reproduce diferencias significativas en tareas cortas.
- Licencia Apache-2.0 en pesos y motor, pero el paquete distribuye FFmpeg (LGPL/GPL) y las librerias VC++ de Microsoft; conviene revisar `NOTICE.txt` antes de un uso comercial o redistribucion.
- Proyecto no oficial sin respaldo de PrismML, UkisAI, Qwen ni CraneBW. No hay garantias de soporte, mantenimiento ni correccion de errores.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de terceros.
- El recorte de vocabulario, aunque declarado sin perdida en chino e ingles, altera el tokenizador respecto al modelo original; puede afectar a la reproducibilidad frente al GGUF de origen.
- No se documentan capacidades de tool calling, function calling ni despliegue multi-agente, por lo que no deben asumirse para produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/jiaheng0815/Swift-Bonsai-2-NInfer-Port
- Release en GitHub (paguete en volumenes): https://github.com/jiaheng0815/Swift-Bonsai-2-NInfer-Port/releases/tag/v1.0.0
- Repositorio del port en GitHub: https://github.com/jiaheng0815/Swift-Bonsai-2-NInfer-Port
- Modelo base (GGUF): https://huggingface.co/ukisai/Swift-Bonsai-2-GGUF
- Base ternaria original: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Motor de inferencia: https://github.com/CraneBW/ninfer-ternary-bonsai-ada
