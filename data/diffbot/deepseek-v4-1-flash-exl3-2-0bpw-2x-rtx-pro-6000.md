# diffbot/DeepSeek-V4.1-Flash-EXL3-2.0bpw-2x-RTX-PRO-6000

## Resumen

Este repositorio no es un modelo entrenado desde cero, sino una cuantizacion EXL3 de 2,0 bits por peso de DeepSeek-V4.1-Flash, publicada por el usuario diffbot y disenada para servirse en dos tarjetas RTX PRO 6000 Blackwell (sm_120, 96 GB cada una) con vLLM en tensor-parallel 2. El pack pesa 358,1 GB, conserva 281.118.567.634 parametros totales y solo recomprime los expertos enrutados: la atencion y los pesos densos siguen en FP8, las capas borrador de decodificacion especulativa DSpark y las tablas Engram de las capas 1 y 14 se mantienen sin tocar.

Su relevancia es practica: demuestra que un MoE de ~281 mil millones de parametros, con ventana de contexto configurada en 512K, cabe en dos GPU de workstation Blackwell con 300 W de limite por tarjeta y alcanza 113,3 tok/s en decodificacion a 2K con un solo flujo y 277,2 tok/s con cuatro flujos, gracias a un kernel MoE propio (xmoe) y a parches para sm_120 en vLLM y FlashInfer. La calidad medida con el modo thinking desactivado es de 98,5 % en GSM8K-200 (configuracion por defecto) y 91,5 % en HumanEval, sobre pruebas de sonda y no sobre una evaluacion completa.

El repositorio incluye la receta completa de despliegue (construccion de imagen Docker, servido con API compatible con OpenAI, scripts de benchmark y de cuantizacion), lo que lo convierte en una referencia reproducible para quien quiera ejecutar modelos MoE de gran tamano en hardware de gama profesional en lugar de en clusters de centro de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); 40 capas MoE con expertos enrutados segun la receta (formas por rango: 384 expertos, hidden 5120, intermediate 1152). Incluye alineador de vision, capas borrador DSpark y tablas Engram |
| Parametros totales | 281.118.567.634 |
| Parametros activos | no disponible (el numero de expertos activos por token no se indica en la informacion proporcionada) |
| Longitud de contexto | 512K en la configuracion de servido de referencia, con 8 GiB de cache KV; maximo nativo del modelo base no disponible |
| Tipos de cuantizacion | EXL3 de 2,0 bits por peso con codebook MCG en los expertos enrutados; FP8 en atencion y pesos densos; capas DSpark y tablas Engram sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | MIT (pesos y codigo de `recipe/`, con avisos de terceros en `recipe/THIRD_PARTY_NOTICES.md`) |
| Formato de pesos | safetensors (48 archivos de modelo; descarga total de 358,1 GB) |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-V4.1-Flash, un transformer MoE desarrollado por DeepSeek. Esta publicacion no entrena nada: reencoda exclusivamente los expertos enrutados de las 40 capas MoE a EXL3 de 2 bits con codebook MCG, dejando intactos el tokenizador, los embeddings, la cabeza LM, el alineador de vision y las capas de decodificacion especulativa DSpark. La cuantizacion fue sin calibracion, con busqueda trellis voraz a beam 16, siguiendo los ajustes de la receta de sfxnz. Los pesos no enrutados permanecen en el FP8 original del checkpoint de DeepSeek.

Los detalles de entrenamiento del modelo base (numero de tokens, composicion del dataset, fases de RLHF o DPO) no estan disponibles en la informacion proporcionada. La innovacion tecnica de este pack esta en el stack de inferencia: un kernel MoE propio (`recipe/kernels/xmoe`) que reduce el tiempo de 523,6 a 327,1 microsegundos por llamada de 6 tokens (1,60x con enrutado uniforme y 1,95x con enrutado sesgado), parches para sm_120 en vLLM y FlashInfer, planificacion plana de decodificacion MoE y uso de CUDA graphs. En el servidor, la porcion MoE de un paso de decodificacion baja de 16,1 ms a 8,9 ms y el paso completo de 28,9 ms a 23,5 ms. Las tablas Engram de las capas 1 y 14 (203 GB) se fijan en RAM del host y se mueven a pinned memory para acelerar el prefill.

## Capacidades

- Generacion de texto y razonamiento de proposito general en el modelo base, con modo thinking desactivable (las cifras de calidad del pack se midieron con el modo thinking desactivado).
- Generacion de codigo: 91,5 % en HumanEval segun la sonda del autor del pack, sin evaluacion completa publicada.
- Razonamiento matematico: 98,5 % en GSM8K-200 con la configuracion por defecto (97,5 % antes de los ajustes finales de kernel).
- Tool calling / function calling: el repositorio incluye `bench/test-toolcall.py` para verificar el soporte contra el servidor en marcha.
- Flujos agenticos multi-paso: validado con una carga real de codigo agentico de 40 minutos, 184 peticiones y 18,5 millones de tokens de prompt, sin errores ni preempciones.
- Contexto largo: la receta sirve con ventana de 512K y cache KV de 8 GiB; se incluye `bench/needle-test.py` para pruebas de recuperacion en contexto largo.
- API compatible con OpenAI en el puerto 8000 bajo el identificador `deepseek-v4.1-flash`.
- Decodificacion especulativa DSpark integrada, que emite llamadas de 6 tokens por paso en decodificacion a un flujo.
- Capacidades multilingues: no disponible.
- Vision: no operativa en este pack; requeriria un despacho de decodificacion FlashInfer para sm_120 con top-k 1152.

## Casos de uso

- Codificacion agentica en produccion: el pack esta validado con una carga agentica real de 40 minutos que servio 184 peticiones y 18,5 millones de tokens de prompt, con 87 % de los tokens de prompt resueltos desde la cache de prefijo y 240-254 tok/s de decodificacion sobre 3-4 flujos. Es adecuado para agentes que editan repositorios, ejecutan tests y encadenan pasos largos.
- Asistente de revision de codigo en CI/CD: gracias al tool calling y a la API compatible con OpenAI, puede integrarse como paso de un pipeline que consulta el diff, ejecuta herramientas y comenta resultados, con soporte de contexto largo para cambios extensos.
- Analisis de documentos muy largos: con la ventana de 512K configurada y 8 GiB de cache KV, permite resumir y extraer informacion de expedientes, contratos o normativa extensa en una sola pasada, verificable con la prueba de aguja incluida en la receta.
- RAG de alta concurrencia: con 277,2 tok/s agregados en decodificacion a 2K sobre cuatro flujos y 8.085 tok/s de prefill a 46K con cuatro flujos, sirve varias sesiones de preguntas y respuestas sobre corpus internos en una unica maquina.
- Automatizacion de soporte tecnico multi-turno: la combinacion de tool calling y cache de prefijo abarata las conversaciones largas con un system prompt y un manual de producto fijos, que se reutilizan en cada turno.
- Generacion masiva de codigo y tests en lote: la tasa de prefill a 46K (hasta 8.503 tok/s con GEMM denso hibrido opcional) permite procesar por lotes repositorios completos para generar pruebas unitarias o documentacion tecnica.
- Evaluacion de tecnicas de cuantizacion extrema: el repositorio es en si mismo un banco de pruebas reproducible para comparar 2 bpw EXL3 frente a FP8 en un MoE grande, con scripts de cuantizacion, kernels y benchmarks incluidos.

## Benchmarks y rendimiento

Servido en dos RTX PRO 6000 Blackwell Max-Q con limite de 300 W, PCIe, TP2, cache KV de 8 GiB, ventana de 512K, CUDA graphs y decodificacion especulativa DSpark. Las velocidades son tokens por segundo agregados entre flujos.

| Configuracion | Decode 2K, 1 flujo | Decode 2K, 4 flujos | Prefill 46K, 1 flujo | Decode 46K, 1 flujo | Prefill 46K, 4 flujos | GSM8K-200 |
|---|---:|---:|---:|---:|---:|---:|
| Solo parches de prefill sm_120 (eager, Engram en NVMe) | | | 1.805 | 31,5 | | 97,5 % |
| + CUDA graphs, Engram en RAM fijada | | | 4.026 | 68,0 | | 97,5 % |
| + GEMM densos Marlin | 101,6 | 210,2 | 3.804 | 90,5 | 7.617 | 97,0 % |
| + kernel MoE multi-fila para prefill | 98,9 | 219,7 | 4.091 | 96,7 | 8.180 | 98,0 % |
| **+ planificador plano de decodificacion MoE (por defecto)** | **113,3** | **277,2** | **4.044** | **116,6** | **8.085** | **98,5 %** |
| + GEMM denso hibrido (opcional) | 114,1 | 274,4 | 4.260 | 114,9 | 8.503 | 95,5 % |

Calidad del pack con thinking desactivado: GSM8K-200 97,5 % y HumanEval 91,5 % segun el autor. La columna GSM8K corresponde a una unica ejecucion por configuracion.

Rendimiento del kernel MoE aislado (`exl3_moe` de ExLlamaV3 frente a `recipe/kernels/xmoe`, formas por rango: 384 expertos, hidden 5120, intermediate 1152, 2 bpw):

| Tokens por llamada | Stock | xmoe | Aceleracion, enrutado uniforme | Aceleracion, enrutado sesgado |
|---:|---:|---:|---:|---:|
| 6 | 523,6 microsegundos | 327,1 microsegundos | 1,60x | 1,95x |
| 12 | 771,3 microsegundos | 564,0 microsegundos | 1,37x | 1,58x |
| 24 | 1.482 microsegundos | 1.066 microsegundos | 1,39x | 1,45x |
| 48 | 2.502 microsegundos | 1.999 microsegundos | 1,25x | 1,32x |
| 1.542 | 9,00 ms | 5,98 ms | 1,51x | |
| 4.096 | 20,4 ms | 14,3 ms | 1,42x | |

No se han publicado resultados comparativos con otros modelos (MMLU, MMLU-Pro u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM: dos GPU con 96 GB cada una (192 GB en total). El pack ocupa 358,1 GB en disco, pero el reparto de pesos y cache KV esta pensado para 96 GB por tarjeta con cache KV de 8 GiB.
- GPU compatibles: exclusivamente sm_120 (Blackwell), segun el autor. La receta se valido con dos RTX PRO 6000 Blackwell Max-Q a 300 W por tarjeta, conectadas por PCIe y en tensor-parallel 2.
- RAM del host: unos 300 GB libres, de los cuales aproximadamente 190 GiB corresponden a las tablas Engram fijadas en memoria (pinned), que se pueden dejar en NVMe a cambio de perder velocidad de prefill (1.805 frente a 4.026 tok/s a 46K en un flujo).
- Software: driver con CUDA 13, Docker con NVIDIA container toolkit. El stack queda fijado a la imagen day-0 de vLLM `deepseekv41-flash-0909`, ExLlamaV3 `5be88657` y vllm-exl3 `d3cfd394`.
- No cabe en GPU de consumo (RTX 4090, 5090) ni en configuraciones de una sola tarjeta.
- Opciones de despliegue: vLLM con el plugin vllm-exl3 sobre kernels de ExLlamaV3 y el kernel xmoe; llama.cpp y Ollama no soportan EXL3, por lo que no son opciones para este pack.
- Throughput y latencia: 113,3 tok/s de decodificacion a 2K con un flujo, 277,2 tok/s con cuatro; 116,6 tok/s de decodificacion a 46K con un flujo. En la prueba agentica real se sostuvieron 240-254 tok/s entre 3 y 4 flujos. Con cuatro prompts de 46K prefijando a la vez, la decodificacion de los demas flujos cae a unos 30 tok/s agregados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Hardware objetivo | Licencia |
|---|---|---|---|---|---|
| diffbot/DeepSeek-V4.1-Flash-EXL3-2.0bpw-2x-RTX-PRO-6000 | 281.118.567.634 | 512K en la config de servido | EXL3 2,0 bpw + FP8 | 2x RTX PRO 6000 Blackwell 96 GB | MIT |
| deepseek-ai/DeepSeek-V4.1-Flash (modelo base) | no disponible | no disponible | FP8 (atencion y densos); expertos en precision original | no disponible | MIT (segun el pack) |
| deepseek-ai/DeepSeek-V4-Flash | no disponible | no disponible | no disponible | no disponible | no disponible |

El modelo base DeepSeek-V4-Flash se describe en la documentacion de recetas de vLLM como un MoE con atencion hibrida CSA+HCA, hiperconexiones con restriccion de variedad y tres niveles de razonamiento (Non-think / Think High / Think Max); se trata de una generacion distinta (V4 frente a V4.1) y no hay datos verificados aqui para comparar parametros, contexto o rendimiento. No se dispone de alternativas cuantizadas a 2 bits equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- Solo texto: la vision no funciona en este pack porque requiere un despacho de decodificacion FlashInfer para sm_120 con top-k 1152.
- Las cifras de calidad proceden de las sondas GSM8K-200 y HumanEval, no de una evaluacion completa; pueden no reflejar el comportamiento en otras tareas ni idiomas.
- La cuantizacion a 2,0 bpw fue sin calibracion y con busqueda trellis voraz a beam 16; es una compresion agresiva del modelo base y la perdida de calidad respecto al FP8 original no esta cuantificada de forma sistematica.
- Degradacion de servicio bajo prefill concurrente: con cuatro prompts de 46K prefijando a la vez, la decodificacion de los demas flujos baja a unos 30 tok/s agregados.
- Dependencia fuerte de versiones: el stack queda fijado a la imagen day-0 de vLLM `deepseekv41-flash-0909`, ExLlamaV3 `5be88657` y vllm-exl3 `d3cfd394`; actualizar cualquiera de los componentes puede romper la receta.
- Requisitos de hardware muy restrictivos: dos GPU sm_120 de 96 GB, CUDA 13 y ~300 GB de RAM de host. No es desplegable en hardware de consumo.
- La licencia es MIT tanto en los pesos como en el codigo de `recipe/`, lo que permite uso comercial, pero se deben respetar los terceros listados en `recipe/THIRD_PARTY_NOTICES.md`.
- Riesgo de alucinacion inherente a un modelo de lenguaje de gran tamano: no se han publicado tasas de alucinacion ni evaluaciones de sesgo en la informacion disponible.
- Idiomas soportados y sesgos conocidos del modelo base: no disponibles.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion independiente de la comunidad.

## Enlaces

- [Ficha en HuggingFace: diffbot/DeepSeek-V4.1-Flash-EXL3-2.0bpw-2x-RTX-PRO-6000](https://huggingface.co/diffbot/DeepSeek-V4.1-Flash-EXL3-2.0bpw-2x-RTX-PRO-6000)
- [Modelo base: deepseek-ai/DeepSeek-V4.1-Flash](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash)
- [Receta original de sfxnz para 2x DGX Spark](https://github.com/sfxnz/DeepSeek-V4.1-Flash-EXL3-vLLM-2x-DGX-Spark)
- [Receta de vLLM para deepseek-ai/DeepSeek-V4-Flash](https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Flash)
- [Hilo en r/LocalLLaMA sobre DeepSeek V4 Flash en 2x RTX PRO 6000](https://www.reddit.com/r/LocalLLaMA/comments/1um84bd/followup_deepseek_v4_flash_on_2x_rtx_pro_6000/)
- Resultados completos, perfiles y metricas de Nsight Compute: `recipe/results/RESULTS.md` dentro del repositorio
- Diseno de kernels y parches para sm_120: `recipe/README.md` dentro del repositorio
