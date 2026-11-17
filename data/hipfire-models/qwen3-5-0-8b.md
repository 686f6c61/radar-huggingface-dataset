# hipfire-models/qwen3.5-0.8b

## Resumen

Qwen3.5-0.8B para hipfire es una distribucion pre-cuantizada del modelo Qwen3.5-0.8B de Alibaba Qwen, empaquetada por hipfire-models para su uso con hipfire, un motor de inferencia escrito en Rust y HIP especificamente orientado a GPUs de consumo AMD de las familias RDNA1 a RDNA4. El modelo base emplea una arquitectura hibrida DeltaNet, lo que combina mecanismos de atencion con capas de estado recurrente lineal, y cuenta con 0,8 mil millones de parametros, una cifra que lo situa en el segmento de modelos ultra-ligeros aptos para hardware modesto.

La relevancia de esta publicacion no reside en el modelo base, sino en el ecosistema de cuantizacion que la acompana: hipfire ofrece tres formatos propietarios (HF4, HF6 y MQ4) que incluyen el tokenizador y la configuracion dentro del propio archivo, eliminando dependencias externas en tiempo de ejecucion. El formato MQ4 aplica una rotacion de Walsh-Hadamard (FWHT) sobre los pesos antes de cuantizar, lo que aplana los valores atipicos y permite obtener una calidad de salida cercana a Q8 con un ancho de banda de 4 bits. Ademas, la build MQ4 fue recalibrada con AWQ el 28 de mayo de 2026.

El resultado es un paquete de aproximadamente 0,51 GB que arranca con 1 GB de VRAM minima y alcanza velocidades de 222 tok/s en una RX 5700 XT y 473 tok/s en una RX 7900 XTX en modo forward-only. Es, por tanto, una opcion pensada para despliegues locales de bajisima latencia en GPUs AMD de consumo, no para cargas de trabajo de razonamiento complejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido DeltaNet (atencion + estado recurrente lineal) |
| Parametros totales | 0,8 mil millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | HF4 (4-bit plano, grupos de 256), HF6 (6-bit plano, grupos de 256), MQ4 (4-bit con rotacion FWHT y calibracion AWQ) |
| Idiomas soportados | no disponible |
| Licencia | MIT (motor hipfire); pesos sujetos a la licencia Qwen original |
| Formato de pesos | Contenedor propietario hipfire (.hf4, .hf6, .mq4) con tokenizador y config embebidos |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B utiliza una arquitectura hibrida DeltaNet, que intercala mecanismos de atencion con capas de estado recurrente lineal. Este diseno busca reducir el coste computacional y de memoria asociado a la atencion cuadratica clasica, manteniendo la capacidad de modelar dependencias de largo alcance. Con 0,8 mil millones de parametros, se situa en la gama de modelos disenados para ejecucion en dispositivos con recursos limitados.

La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO sobre el modelo base. Lo que si documenta el autor es el proceso de cuantizacion: el formato MQ4 aplica una transformada de Walsh-Hadamard rapida (FWHT) a los pesos en el momento de cuantizar y rota el vector de entrada con la misma transformada durante la GEMV, lo que distribuye los valores atipicos y mejora la distribucion del error de cuantizacion. La build MQ4 publicada el 28 de mayo de 2026 incorpora ademas calibracion AWQ (activation-aware weight quantization) sobre un tronco mi300x v3, manteniendo el mismo layout de almacenamiento y ancho de banda que la version anterior, por lo que es un reemplazo directo sin cambios en cliente ni runtime. El motor hipfire incluye una puerta de calidad obligatoria que verifica la decodificacion greedy byte-exacta contra 9 flujos de tokens de referencia en cada commit que toque kernels o el forward pass.

## Capacidades

- Generacion de texto autoregresiva con el modelo base Qwen3.5-0.8B.
- Razonamiento basico y respuesta a instrucciones, limitado por el tamano de 0,8 mil millones de parametros.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.
- Inferencia local en GPUs AMD de consumo con tokenizador y configuracion embebidos en el archivo del modelo.
- Tres niveles de calidad/velocidad seleccionables (HF4, HF6, MQ4) sobre el mismo motor.

## Casos de uso

- Autocompletado y generacion de texto en local sobre GPUs AMD de consumo: con 0,51 GB de almacenamiento y 1 GB de VRAM minima, el modelo cabe en tarjetas de gama media y permite generar texto a 222 tok/s en una RX 5700 XT, adecuado para editores de texto o asistentes de escritura sin conexion.
- Clasificacion y etiquetado de texto a gran volumen: la velocidad de 473 tok/s en RX 7900 XTX y el bajo coste por token lo hacen viable para procesar lotes masivos de documentos en pipelines offline donde la latencia por peticion no es critica pero el throughput agregado si.
- Prototipado rapido de aplicaciones LLM en entornos AMD: el motor hipfire no usa Python en la ruta caliente y se instala con un script de una linea, lo que reduce el tiempo de puesta en marcha para desarrolladores que quieran validar una idea sobre hardware RDNA antes de migrar a GPUs de datacenter.
- Sustitucion de modelos mayores en tareas acotadas: para resumenes cortos, extraccion de entidades o reformulacion de frases, un modelo de 0,8B con calidad cercana a Q8 en formato MQ4 puede sustituir a modelos de mayor tamano alli donde el dominio este bien definido y el contexto sea limitado.
- Despliegue en equipos de bajo consumo o estaciones de trabajo con una sola GPU: al requerir solo 1 GB de VRAM, el modelo puede convivir con otras cargas en la misma tarjeta, lo que permite mantener un servicio de generacion de texto junto a procesos de renderizado o entrenamiento ligero.
- Evaluacion y desarrollo de kernels de cuantizacion: la puerta de calidad byte-exacta contra 9 flujos de referencia y los tres formatos disponibles convierten este paquete en un banco de pruebas util para quien investigue tecnicas de cuantizacion (FWHT, AWQ) sobre arquitecturas hibridas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos de rendimiento publicados son velocidades de inferencia forward-only:

| Variante | Tamano | VRAM minima | RX 5700 XT | RX 7900 XTX |
|---|---|---|---|---|
| HF4 | 0,51 GB | 1 GB | 222 tok/s | 473 tok/s |
| HF6 | 0,63 GB | 1 GB | 210 tok/s | no disponible |
| MQ4 | 0,51 GB | 1 GB | no disponible | 447 tok/s |

La variante HF6 se describe como aproximadamente un 15 % mas lenta que HF4, coherente con los 210 frente a 222 tok/s medidos en RX 5700 XT. La variante MQ4 se describe como de calidad cercana a Q8 con ancho de banda de 4 bits.

## Requisitos de hardware

- VRAM estimada: 1 GB minima para cualquiera de las tres variantes (HF4, HF6, MQ4).
- GPU recomendadas: AMD RDNA1 a RDNA4. Datos medidos en RX 5700 XT (RDNA1) y RX 7900 XTX (RDNA3).
- Cabe en GPU de consumo: si, en cualquier GPU AMD RDNA con al menos 1 GB de VRAM. No se documenta soporte para GPUs NVIDIA o Intel en la informacion disponible.
- Opciones de despliegue: motor hipfire (Rust + HIP), instalable mediante script. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 222 tok/s en RX 5700 XT con HF4 y 473 tok/s en RX 7900 XTX con HF4; 447 tok/s en RX 7900 XTX con MQ4. La rama 0.1.4-alpha del motor introduce una fusion de kernels que aproximadamente duplica la velocidad forward en Qwen3.5 respecto a la version anterior.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / motor | Disponibilidad |
|---|---|---|---|---|---|
| hipfire-models/qwen3.5-0.8b | 0,8B | no disponible | MIT (motor) / Qwen (pesos) | .hf4, .hf6, .mq4 / hipfire | Hugging Face |
| Qwen/Qwen3.5-0.8B (original) | 0,8B | no disponible | Qwen | safetensors / varios | Hugging Face |
| Alternativas de ~1B en formato GGUF | no disponible | no disponible | no disponible | GGUF / llama.cpp | no disponible |

La comparacion con alternativas de la misma categoria no puede completarse con la informacion proporcionada: no se dispone de datos de contexto, benchmarks ni licencias de modelos comparables. La diferencia principal frente al modelo base original es el empaquetado pre-cuantizado para un motor especifico de GPUs AMD, con tokenizador y configuracion embebidos.

## Limitaciones y advertencias

- El modelo base tiene 0,8 mil millones de parametros: su capacidad de razonamiento complejo, conocimiento factual y coherencia en contextos largos es limitada en comparacion con modelos de mayor tamano.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano, agravado por la cuantizacion a 4 bits en las variantes HF4 y MQ4.
- La licencia del paquete indica MIT, pero los pesos estan sujetos a la licencia Qwen original; es necesario verificar los terminos de esa licencia antes de un uso comercial.
- La informacion sobre idiomas soportados no esta disponible, por lo que no se puede garantizar un rendimiento adecuado en castellano sin evaluacion previa.
- La longitud de contexto no esta documentada.
- El motor hipfire solo soporta GPUs AMD RDNA1-RDNA4; no hay soporte documentado para NVIDIA, Intel ni CPU.
- La variante MQ4 en RX 5700 XT figura como "TBD": no hay medicion de velocidad publicada para esa combinacion.
- El formato de pesos es propietario del motor hipfire; no es portable a llama.cpp, vLLM ni otras herramientas sin conversion.
- La calidad de la variante MQ4 se valida mediante decodificacion greedy byte-exacta contra 9 flujos de referencia, no mediante benchmarks estandar de calidad.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion practicamente nula y ausencia de validacion externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hipfire-models/qwen3.5-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio del motor hipfire: https://github.com/Kaden-Schutt/hipfire
- Listado de modelos soportados: https://github.com/Kaden-Schutt/hipfire/blob/master/docs/MODELS.md
- Lineas base de calidad: https://github.com/Kaden-Schutt/hipfire/tree/master/tests/quality-baselines
- Script de instalacion: https://raw.githubusercontent.com/Kaden-Schutt/hipfire/master/scripts/install.sh
