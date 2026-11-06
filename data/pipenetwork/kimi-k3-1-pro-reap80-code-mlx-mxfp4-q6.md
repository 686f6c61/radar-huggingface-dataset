# pipenetwork/Kimi-K3.1-Pro-REAP80-code-MLX-mxfp4-q6

## Resumen

Kimi-K3.1-Pro-REAP80-code-MLX-mxfp4-q6 es una version podada y cuantizada del modelo Moonshot AI Kimi-K3.1-Pro, publicada por el usuario pipenetwork en Hugging Face. El modelo base es un transformer de tipo Mixture of Experts (MoE) de gran escala (1,56 TB en su formato original) que combina Kimi Delta Attention, gated MLA con un indexador DSA, Attention Residuals y un MoE latente. Esta variante aplica la tecnica REAP (saliencia basada en `gate x ||expert_output||`) para eliminar el 80% de los expertos enrutados, conservando 179 de 896 por capa en las 92 capas MoE, y convierte los pesos a MLX con cuantizacion mxfp4 para expertos y affine 6 bits para el resto.

El objetivo es claro: hacer que un modelo de 600.837.048.660 parametros totales quepa en una maquina Apple Silicon de 512 GB (el repositorio ocupa 336 GB, 313 GiB una vez cargado). No es una build de calidad, sino una build de "cabe en un Mac": el propio autor advierte de degradacion real frente al modelo completo, especialmente fuera de codigo, y documenta un fallo aritmetico en una prueba de chat (17 x 23 respondido como 323).

La relevancia actual es doble. Por un lado, demuestra que el pruning agresivo de expertos con calibracion orientada a codigo permite ejecutar un MoE de escala frontier en hardware de consumo profesional. Por otro, evidencia los limites del enfoque: el pruning compra memoria, no velocidad, y la cuantizacion q6 de las partes no-expertas resulta practicamente sin perdida frente a q8 (+0,2% de perplejidad), mientras que q4 degrada un 53,7%.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con Kimi Delta Attention, gated MLA con indexador DSA, Attention Residuals y MoE latente |
| Parametros totales | 600.837.048.660 |
| Parametros activos | no disponible (top-16 de 179 expertos enrutados por capa, 92 capas MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados en MXFP4 (copia byte-exacta del original); resto en MLX affine 6 bits, group size 64; indexador DSA y normas/routers en bf16/f32; residual stream en float32 |
| Idiomas soportados | no disponible (corpus de calibracion con ingles web y chino, segun la model card) |
| Licencia | kimi-k3.1-pro (Kimi K3.1-Pro License) |
| Formato de pesos | safetensors (MLX), shards alineados a 16 bytes para mapeo zero-copy |

## Arquitectura y entrenamiento

El modelo base Kimi-K3.1-Pro emplea una arquitectura MoE con 92 capas MoE, 896 expertos enrutados por capa con top-16 en el enrutamiento y 2 expertos compartidos. Incorpora mecanismos propietarios de atencion: Kimi Delta Attention, gated MLA con un indexador DSA (atención dispersa) y Attention Residuals. La capa 0 mantiene un MLP denso. El modelo original pesa 1,56 TB con expertos en MXFP4.

Esta build no reentrena nada. Aplica REAP sobre un corpus de calibracion con fuerte peso en codigo (60% codigo, con porciones de web en ingles y chino), conservando 179 de 896 expertos enrutados por capa. Los expertos supervivientes son una copia byte-exacta de los pesos MXFP4 de Moonshot, de modo que el unico deterioro en el lado de los expertos es el pruning. El resto de tensores (atencion, expertos compartidos, proyecciones latentes, MLP denso de la capa 0, embeddings y `lm_head`) se cuantizan a 6 bits con group size 64. El indexador DSA (`wq_b`, `wk`, `weights_proj`) y las normas y routers se mantienen deliberadamente en bf16/f32 porque el error del indexador solo se manifiesta mas alla de 2048 tokens y no apareceria en evaluaciones cortas. El residual stream se mantiene en float32 desde la primera capa MoE.

La innovacion tecnica destacable es la combinacion de pruning selectivo por saliencia con una cuantizacion mixta que preserva la precision donde mas impacta (indexador, routers) y comprime agresivamente donde el impacto es medible y aceptable (expertos). El autor documenta que q6 es practicamente sin perdida frente a q8 (+0,2% de perplejidad global, +0,0 a 0,1% en codigo) y un 10% mas rapido.

## Capacidades

- Generacion de texto y conversacion multi-turno en el pipeline `text-generation`.
- Generacion de codigo: el corpus de calibracion esta orientado a codigo y las pruebas cualitativas se centran en funciones Python.
- Razonamiento: presente pero degradado por el pruning agresivo; el autor documenta errores aritmeticos en pruebas de chat.
- Tool calling / function calling: la plantilla de chat incluida no cubre tool calls ni imagenes, aunque el modelo base probablemente los soporte; en esta build no esta validado.
- Capacidades de agente y razonamiento multi-paso: no validadas en esta build.
- Capacidades multilingues: no disponibles como dato explicito; el corpus de calibracion incluye ingles y chino.
- Vision: los ficheros de vision se incluyen junto al modelo, pero no se ejercitaron; solo se valido la ruta de texto.
- Atencion dispersa DSA: validada en un prompt de 2600 tokens (16/16 tokens greedy coincidentes con la referencia MLX).

## Casos de uso

- Generacion de codigo en local sobre Apple Silicon: el modelo esta disenado para cargarse en una maquina de 512 GB y generar codigo Python con `mlx_lm.generate`; su calibracion orientada a codigo lo hace adecuado para autocompletado y generacion de funciones en un entorno de desarrollo sin GPU dedicada.
- Prototipado e investigacion de tecnicas de pruning: sirve como caso de estudio reproducible de REAP aplicado a un MoE de escala frontier, con perplejidades pareadas y comparativas q4/q6/q8 documentadas.
- Evaluacion de cuantizacion mixta en MLX: util para medir el impacto de mantener indexador y routers en bf16/f32 frente a cuantizarlos, en prompts largos (mas de 2048 tokens).
- Desarrollo de motores de inferencia para Apple Silicon: el autor valida su motor nativo Metal (pipefold) contra MLX con 24/24 y 16/16 tokens greedy coincidentes, lo que lo convierte en banco de pruebas para motores alternativos.
- Tareas de codigo de baja criticidad donde la verificacion humana sea obligatoria: dado el fallo aritmetico documentado, solo es apropiado para escenarios donde la salida se revise o se testee automaticamente.
- Experimentacion con modelos de 600B en hardware de consumo profesional: permite estudiar el comportamiento de un MoE de gran escala (top-16, 92 capas) sin acceso a clusters multi-GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card unicamente reporta perplejidad retenida a 2048 tokens con ventanas identicas y bootstrap pareado:

| Precision no-experta | Perplejidad global | vs q8 |
|---|---|---|
| q8 | 5,725 | baseline |
| q6 | 5,736 | +0,2% (codigo +0,0 a 0,1%) |
| q4 | 8,81 | +53,7% (python +44%, code-multi +17%) |

Rendimiento en una M3 Ultra de 512 GiB (cada token decodificado lee aproximadamente 70-85 GB de pesos, unos 26 GB de expertos enrutados mas todos los tensores no-expertos; la decodificacion esta limitada por ancho de banda de memoria):

| Ruta de inferencia | Decodificacion | Notas |
|---|---|---|
| mlx-lm (`mlx_lm.generate`) | ~6,0 tok/s | |
| Motor nativo Metal (pipefold, no publicado) | ~7,4 tok/s (~7,0 tok/s a 2,6k de contexto) | prefill ~60 tok/s |

## Requisitos de hardware

- VRAM/ memoria unificada estimada: 313 GiB para cargar el modelo; el repositorio ocupa 336 GB. Requiere una maquina Apple Silicon de 512 GB.
- GPU recomendadas: Apple M3 Ultra con 512 GiB de memoria unificada. No hay soporte documentado para CUDA, A100, H100 ni RTX 4090.
- Cabe en consumer GPU: no. No cabe en ninguna GPU de consumo convencional (24 GB, 48 GB, 80 GB). Solo en Apple Silicon de 512 GB.
- Ajuste del limite de GPU wired: es necesario elevar `iogpu.wired_limit_mb` a 480000 antes de cargar el modelo, ya que el valor por defecto esta por debajo del footprint.
- Opciones de despliegue: `mlx-lm` con el loader `kimi_k31.py` incluido (la arquitectura `kimi_k31` no esta upstream) y `--trust-remote-code`. Motor nativo Metal (pipefold) no publicado. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~6,0 tok/s en decodificacion con mlx-lm y ~7,4 tok/s con el motor nativo; prefill de ~60 tok/s en el motor nativo. El pruning compra memoria, no velocidad: el trafico de decodificacion depende del top-k y de la precision no-experta, no de cuantos expertos se almacenen.
- Memoria pico: crece con el contexto; el autor recomienda probar el prompt mas largo antes de confiar en el modelo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| pipenetwork/Kimi-K3.1-Pro-REAP80-code-MLX-mxfp4-q6 | 600.837.048.660 | no disponible | kimi-k3.1-pro | MLX, Apple Silicon 512 GB | Build podada y cuantizada, orientada a codigo |
| pipenetwork/Kimi-K3-REAP80-MLX-mxfp4-q8 | no disponible | no disponible | kimi-k3 | MLX, Apple Silicon | Version previa (K3) con cuantizacion q8, 14 likes |
| moonshotai/Kimi-K3.1-Pro | no disponible (1,56 TB en MXFP4) | no disponible | kimi-k3.1-pro | Original, requiere hardware de gran escala | Modelo base sin podar, calidad de referencia |

No se dispone de datos de benchmarks comparativos entre estas variantes mas alla de las perplejidades reportadas para q4/q6/q8 de esta misma build.

## Limitaciones y advertencias

- Pruning muy agresivo: se conservan 179 de 896 expertos enrutados por capa con top-16. El autor advierte de degradacion real frente al modelo completo, especialmente fuera de codigo.
- Fallo aritmetico documentado: en una prueba de chat con la build q6, la pregunta "What is 17 times 23?" produjo un razonamiento que concluyo en 323 (la respuesta correcta es 391). Verificar cualquier salida que importe.
- No es una build de calidad: el autor la describe explicitamente como "un modelo de codigo que cabe en un Mac", no como una build de calidad.
- Vision no validada: los ficheros de vision se incluyen pero no se ejercitaron; solo se valido la ruta de texto.
- Tool calls e imagenes no cubiertos por la plantilla de chat incluida; la plantilla solo reproduce `encoding_k3.py` para mensajes simples system/user/assistant.
- Contexto largo: la memoria pico crece con el contexto; el error del indexador DSA solo se manifiesta mas alla de 2048 tokens y no aparece en evaluaciones cortas, por lo que las evaluaciones cortas pueden sobreestimar la calidad en contextos largos.
- Licencia restrictiva: los pesos siguen bajo la Kimi K3.1-Pro License, con condiciones para uso comercial a gran escala (acuerdo separado por encima de 20M USD / 12 meses para negocios de Model-as-a-Service; visualizacion prominente de "Kimi K3.1-Pro" por encima de 100M MAU o 20M USD/mes). Leerla antes de cualquier uso comercial.
- Dependencia de codigo personalizado: requiere `trust-remote-code` y el loader `kimi_k31.py` incluido, que debe copiarse manualmente al directorio de modelos de mlx-lm.
- Sin soporte upstream: la arquitectura `kimi_k31` no esta en mlx-lm upstream, lo que complica el mantenimiento y las actualizaciones.
- Idiomas no documentados explicitamente; el corpus de calibracion incluye ingles y chino, por lo que el rendimiento en castellano no esta verificado.
- Riesgo de alucinacion: inherente a los modelos de lenguaje y agravado por el pruning; sin datos especificos de sesgos en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pipenetwork/Kimi-K3.1-Pro-REAP80-code-MLX-mxfp4-q6
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Licencia del modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro/blob/main/LICENSE
- Version previa K3 REAP80 q8: https://huggingface.co/pipenetwork/Kimi-K3-REAP80-MLX-mxfp4-q8
- Loader kimi_k3.py de la version previa: https://huggingface.co/pipenetwork/Kimi-K3-REAP80-MLX-mxfp4-q8/blob/main/kimi_k3.py
