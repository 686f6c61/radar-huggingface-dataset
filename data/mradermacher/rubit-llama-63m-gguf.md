# mradermacher/RuBit-LLama-63M-GGUF

## Resumen

RuBit-LLama-63M-GGUF es la version cuantizada en formato GGUF del modelo RuBit-LLama-63M, un transformer de tipo Llama con tecnicas BitNet (pesos ternarios de 1,58 bits) desarrollado originalmente por igorktech y orientado a ruso e ingles. El modelo base fue entrenado sobre el dataset dichspace/darulm y esta disenado como un modelo experimental de muy pequeno tamano (63,3 millones de parametros), lo que lo hace interesante para investigacion sobre cuantizacion extrema, inferencia en CPU y despliegues con recursos minimos.

Esta ficha cubre especificamente la version publicada por mradermacher, que ofrece 12 cuantizaciones estaticas en GGUF (desde Q2_K hasta f16) para su uso con llama.cpp y herramientas compatibles. El repositorio ocupa solo 0,6 GB en total y cada cuantizacion individual ronda entre 0,1 y 0,2 GB, lo que permite ejecutar el modelo en practicamente cualquier hardware, incluidos telefonos moviles o Raspberry Pi.

La relevancia de este modelo es doble: por un lado, demuestra el flujo de trabajo BitNet aplicado a un Llama pequeno con vocabulario ruso (a traves de RuLM/Darulm); por otro, la version GGUF facilita probar tecnicas de cuantizacion agresiva en un modelo cuyo coste de inferencia es marginal. No obstante, al tratarse de un modelo de 63M de parametros, sus capacidades generativas son muy limitadas y no debe confundirse con un LLM de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (variante BitNet con pesos ternarios) |
| Parametros totales | 63.310.848 (63,3M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ruso (ru), ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base RuBit-LLama-63M es un transformer con arquitectura Llama adaptada a la tecnica BitNet, que entrena redes con pesos ternarios (-1, 0, +1) y una funcion de activacion escalada, reduciendo drasticamente el coste computacional y de memoria. Con 63,3 millones de parametros, se situa en el rango de los modelos "tiny" y esta pensado como prueba de concepto de BitNet sobre vocabulario ruso.

El entrenamiento se realizo sobre el dataset dichspace/darulm, vinculado al ecosistema RuLM (Russian Language Models) y Darulm. La model card no proporciona detalles sobre el numero de tokens, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal. La version GGUF es una conversion estatica (convert_type: hf, quantize_version: 2) sin cuantizaciones ponderadas ni imatrix, segun indica el autor de la cuantizacion.

## Capacidades

- Generacion de texto basica en ruso e ingles, limitada por el tamano del modelo.
- Razonamiento y conocimiento factual muy restringidos; no apto para tareas complejas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas a ruso e ingles.
- No dispone de vision, audio ni modo "thinking".
- Util como modelo de referencia para experimentos de cuantizacion extrema y BitNet.

## Casos de uso

- Investigacion sobre BitNet y cuantizacion ternaria: sirve como banco de pruebas para medir la degradacion de calidad al pasar de pesos ternarios a cuantizaciones GGUF de 2-8 bits.
- Inferencia en dispositivos de recursos minimos: con 0,1-0,2 GB por cuantizacion, puede ejecutarse en Raspberry Pi, telefonos Android via Termux o microcontroladores con llama.cpp.
- Pruebas de pipelines de despliegue: util para validar integraciones con llama.cpp, Ollama o servidores compatibles antes de migrar a modelos mayores.
- Educacion y docencia: permite ilustrar el funcionamiento de un transformer y de la cuantizacion sin requerir GPU.
- Generacion de texto muy basica en ruso para prototipos y demos internas.
- Benchmarking de herramientas de cuantizacion (comparativas Q2_K vs Q4_K_M vs f16) sobre un modelo de coste despreciable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,1 GB (Q2_K) y 0,2 GB (f16); cabe holgadamente en cualquier GPU consumer e incluso en GPUs integradas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (GTX 1050, RTX 3050, RTX 4090, A100, H100); el modelo no aprovechara la capacidad de estas ultimas.
- Cabe en GPU consumer: si, en practicamente todas, incluidas iGPU y SoCs moviles.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF; tambien es posible usar el modelo base con transformers.
- Latencia y throughput estimados: no disponibles; por tamano, se espera inferencia en tiempo real incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| RuBit-LLama-63M-GGUF | 63,3M | no disponible | ru, en | no disponible | GGUF |
| igorktech/RuBit-LLama-63M (base) | 63,3M | no disponible | ru, en | no disponible | safetensors |
| Modelos Llama tiny (p. ej. TinyLlama-1.1B) | ~1,1B | 2048 | en (principalmente) | Apache 2.0 (tipico) | safetensors, GGUF |
| Modelos BitNet oficiales (p. ej. BitNet b1.58 2B) | ~2B | no disponible | en | no disponible | varios |

La comparativa directa es limitada porque no existen muchos modelos BitNet de 63M con vocabulario ruso publicados. TinyLlama-1.1B es el equivalente mas cercano en espiritu (modelo pequeno para experimentacion), pero es 17 veces mayor y no emplea pesos ternarios.

## Limitaciones y advertencias

- Modelo de 63M de parametros: capacidad generativa muy limitada, propenso a incoherencias y repeticiones.
- Riesgo elevado de alucinacion y de respuestas factualmente incorrectas.
- Longitud de contexto no documentada; se desconoce el maximo soportado.
- Idiomas limitados a ruso e ingles; el rendimiento en castellano no esta garantizado.
- Licencia no especificada: no se puede confirmar el uso comercial sin consultar al autor original.
- Las cuantizaciones Q2_K y Q3_K_M pueden degradar aun mas la calidad; el autor recomienda Q4_K_S o Q4_K_M.
- No dispone de cuantizaciones ponderadas ni imatrix, lo que limita la calidad frente a otras variantes.
- No apto para produccion en tareas de usuario final sin validacion exhaustiva.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/RuBit-LLama-63M-GGUF
- Modelo base: https://huggingface.co/igorktech/RuBit-LLama-63M
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#RuBit-LLama-63M-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/dichspace/darulm
- Repositorio de peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de comparacion de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
