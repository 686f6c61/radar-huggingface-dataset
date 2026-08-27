# etienes/affine-5GbZvZ7tcC-d1-9591dd38-04d28ba1

## Resumen

El modelo `etienes/affine-5GbZvZ7tcC-d1-9591dd38-04d28ba1` es un fine-tuning del modelo base `vera6/affine-5g4yy75zuz-t6` mediante DPO offline, desarrollado por el usuario `etienes` como parte del ecosistema de minería Affine SN120. Está diseñado específicamente como "challenger" en el sistema de evaluación "Reason v4" (weight_version_key=7), donde compite en duelos de razonamiento contra el modelo base "king" en turnos de evaluación. No es un modelo de propósito general: su función es optimizar la preferencia por pensamientos que incrementan la puntuación "Reason" del profesor, usando una técnica de log-mean-exp temperado sobre múltiples referencias. Con 35.107 millones de parámetros y un tamaño de repositorio de 70.2 GB, se distribuye en formato safetensors. Su relevancia radica en ser un caso práctico de DPO offline aplicado a la mejora de razonamiento en un pipeline de evaluación automatizada, con métricas internas que muestran una ventaja estadísticamente significativa sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE basada en Qwen 3.5 (segun tags `qwen3_5_moe`), con soporte multimodal (image-text-to-text) |
| Parametros totales | 35.107.181.936 (~35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (en entrenamiento se uso max_len=12288, pero no se especifica el contexto de inferencia) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 (con politica adicional de "Affine mining artifacts policy" segun la model card) |
| Formato de pesos | safetensors (16 shards, ~66 GB segun la model card; el repo total ocupa 70.2 GB) |

## Arquitectura y entrenamiento

La arquitectura base es un modelo de mezcla de expertos (MoE) derivado de Qwen 3.5, segun los tags de HuggingFace, con capacidad multimodal (image-text-to-text). Sin embargo, no se proporcionan detalles sobre el numero de expertos, la dimension del hidden state ni otros parametros estructurales. El entrenamiento se realizo mediante DPO offline sobre pares de duelos razonados, partiendo del checkpoint `vera6/affine-5g4yy75zuz-t6@8e3f1695e058837ed80fec3238ff439fdc2d0f0e`. Se aplico LoRA con r=32, alpha=128, beta=0.1, learning rate de 5e-7, max_len=12288, max_steps=19200 y 4 epocas. El metodo "Reason v4" emplea una funcion de recompensa temperada: para cada turno, `a_i = lpC(y_i|z_A) - lpC(y_i|∅)` y `Reason = τ·log(mean_i exp(a_i/τ))` con τ=0.03 y k=3 referencias de profesor. Ademas, se exige que la mediana de pensamientos sea ≥80 y que el pase B sea ≥0.30. El entrenamiento se ejecuto en 8 GPUs B200 (GPUs 4 y 5) en el pod Lium `mine-crown-1`.

## Capacidades

- Razonamiento mejorado: el modelo esta optimizado para producir pensamientos que aumentan la puntuacion "Reason" del profesor en comparacion con el modelo base, con una ventaja medida de +0.003665 (z=2.177, n=80).
- Especifico para duelos de evaluacion: disenado para participar en el sistema evalsrv Reason v4, no para conversacion general.
- No se documentan capacidades de tool calling, generacion de codigo, matematicas estandar ni otras tareas tipicas de modelos de lenguaje.
- Soporte multimodal heredado de la arquitectura base (segun tags), pero no se detalla su funcionamiento en este checkpoint.
- No se especifican capacidades multilingues; los idiomas soportados no estan disponibles.

## Casos de uso

- Evaluacion de modelos de razonamiento en sistemas de duelos: el modelo puede usarse como challenger en pipelines de evaluacion automatizada donde se comparan respuestas razonadas entre dos modelos, aprovechando su entrenamiento especifico para maximizar la metrica "Reason".
- Investigacion en DPO offline: sirve como ejemplo de aplicacion de DPO con LoRA y recompensas temperadas sobre multiples referencias, util para estudiar el impacto de hiperparametros como beta, alpha y learning rate en la mejora de razonamiento.
- Benchmarking de tecnicas de preferencia: permite comparar el rendimiento de DPO offline frente a metodos online (GRPO) o SFT en entornos de evaluacion controlados, como se indica en la linea de experimentos R846/R847.
- Validacion de metricas internas: puede emplearse para probar la robustez de la metrica "Reason v4" (log-mean-exp con τ=0.03) en diferentes condiciones de evaluacion.
- Desarrollo de agentes de razonamiento especializados: aunque no es un chat general, podria integrarse en sistemas que requieran generar cadenas de pensamiento optimizadas para una tarea concreta, siempre que se adapte el prompt adecuadamente.
- Reproduccion de experimentos de mineria: investigadores pueden replicar el pipeline de entrenamiento (offline DPO con LoRA) sobre el modelo base para explorar variaciones en la seleccion de pares de duelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es la comparacion interna contra el modelo base `vera6/affine-5g4yy75zuz-t6` bajo el sistema Reason v4 (wvk=7), con los siguientes resultados:

| Metrica | Valor |
|---|---|
| Margen (diferencia de puntuacion) | +0.003665 |
| Error estandar (SE) | 0.001684 |
| Estadistico z | 2.177 |
| Tamano de muestra (n) | 80 |
| Barra de aprobacion (max(2·SE, δ=0.002)) | 0.003367 |
| Ratio sobre la barra | ~1.088× |
| Mediana de pensamientos | 141.5 (requisito ≥80) |
| Pase B | 0.5375 (requisito ≥0.30) |
| Decision | WIN / Stage-5 licensed |

Estos datos indican una mejora estadisticamente significativa sobre el modelo base, pero no son comparables con benchmarks convencionales.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35.107 millones de parametros en FP16, se necesitan aproximadamente 70 GB de VRAM. Con cuantizacion de 8 bits, ~35 GB; con 4 bits, ~18 GB. No se proporcionan cuantizaciones oficiales.
- GPU recomendadas: para FP16, una NVIDIA A100 80GB, H100 80GB o similar. Para cuantizacion 4-bit, una RTX 4090 (24 GB) podria ser suficiente, aunque no esta confirmado.
- Compatibilidad con consumer GPU: posible con cuantizacion agresiva (4-bit) en GPUs de 24 GB, pero no hay garantias.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). No se mencionan configuraciones especificas.
- Latencia y throughput: no disponibles. El entrenamiento uso 8×B200, pero la inferencia no esta documentada.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables de la misma categoria (challengers de razonamiento en sistemas de duelos) con datos publicos. El modelo base `vera6/affine-5g4yy75zuz-t6` es el unico punto de referencia directo, pero no se dispone de sus especificaciones completas.

## Limitaciones y advertencias

- No es un modelo de chat general: la model card indica explicitamente "Not a general chat model". Su uso fuera del sistema de evaluacion Reason v4 puede producir resultados suboptimos o inesperados.
- Sesgos y alucinaciones: al ser un fine-tuning especializado, puede heredar sesgos del modelo base y del dataset de duelos, que no esta descrito en detalle. No se han realizado evaluaciones de sesgo.
- Dependencia del sistema de evaluacion: las metricas de rendimiento solo son validas bajo el protocolo Reason v4 (wvk=7) con k=3 y τ=0.03. Cambios en estos parametros invalidan los resultados.
- Restricciones de licencia: aunque la licencia es Apache-2.0, la model card anade "Follows base model + Affine mining artifacts policy", lo que puede imponer condiciones adicionales para uso comercial o redistribucion.
- Contexto limitado: el max_len de entrenamiento es 12288 tokens, pero no se especifica la longitud de contexto soportada en inferencia. Podria ser inferior a la del modelo base.
- Reproducibilidad: el entrenamiento dependio de un entorno especifico (pod `/root/r861/`, GPUs B200) y de datos de duelos que no son publicos, lo que dificulta la replicacion exacta.

## Enlaces

- HuggingFace: https://huggingface.co/etienes/affine-5GbZvZ7tcC-d1-9591dd38-04d28ba1
- Modelo base: https://huggingface.co/vera6/affine-5g4yy75zuz-t6 (no verificado)
- Copia del modelo por otro autor: https://huggingface.co/michael-chan-000/affine-5GbZvZ7tcC-d1
- Endpoint de inferencia (FriendliAI): https://friendli.ai/models/michael-chan-000/affine-5GbZvZ7tcC-d1
- Sitio de AFFiNE (posible relacion, no confirmada): https://affine.pro/
