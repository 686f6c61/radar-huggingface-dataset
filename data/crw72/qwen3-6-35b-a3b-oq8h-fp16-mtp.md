# crw72/Qwen3.6-35B-A3B-oQ8h-fp16-mtp

## Resumen
Qwen3.6-35B-A3B-oQ8h-fp16-mtp es una cuantización mixta del modelo Qwen/Qwen3.6-35B-A3B, publicada por el usuario crw72. No se trata de un modelo entrenado desde cero, sino de un checkpoint derivado que redistribuye la precisión de los pesos para reducir el espacio en disco y adaptarse al ecosistema MLX de Apple. La herramienta empleada es oQ (oMLX v0.8.0), que aplica cuantización de precisión mixta por tensor en lugar de un esquema uniforme.

El checkpoint pesa 38,5 GB y contiene 11.262.035.824 parámetros lógicos en safetensors. El nombre del modelo sugiere una arquitectura MoE con 35B de parámetros totales y 3B activos, aunque los pesos almacenados suman 11,26B, lo que indica que buena parte del checkpoint se guarda en formatos de alta precisión (U32 y FP32) y no como pesos densos convencionales. La media efectiva declarada es de 27,330 bits por peso.

Su relevancia es acotada: interesa a quienes ejecutan modelos Qwen en hardware Apple Silicon mediante MLX y necesitan un equilibrio entre fidelidad numérica y tamaño de almacenamiento. No es un modelo para producción generalista ni para despliegue en GPU NVIDIA sin conversión previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (según tag `qwen3_5_moe`); detalles no disponibles |
| Parametros totales | 11.262.035.824 (checkpoint); modelo base denominado 35B-A3B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 8-bit group 128, affine 8-bit group 64, FP16, FP32 y U32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento
El modelo base Qwen/Qwen3.6-35B-A3B se etiqueta como `qwen3_5_moe`, lo que apunta a una arquitectura transformer con mezcla de expertos. El checkpoint publicado no aporta información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se detalla la innovación técnica del modelo original.

La aportación de esta ficha es exclusivamente de cuantización. oQ (oMLX v0.8.0) asigna formatos distintos a grupos de tensores: 0,531B pesos en affine 8-bit group 128, 1,322B en affine 8-bit group 64, 0,557B en FP16, 0,447B en FP32 y 8,405B en U32. El desglose por componentes indica 9,971B pesos en el modelo de lenguaje, 0,447B en visión y 0,845B en una cabeza MTP (multi-token prediction). Esta última sugiere decodificación especulativa o predicción multi-token, aunque no se documenta su funcionamiento.

## Capacidades
- Generación de texto y razonamiento, heredados del modelo base Qwen3.6-35B-A3B.
- Procesamiento de visión: el checkpoint incluye 0,447B pesos en un componente de visión.
- Predicción multi-token (MTP): cabeza de 0,845B pesos orientada a decodificación especulativa.
- Soporte de tool calling y function calling: no confirmado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Soporte multilingüe: no disponible.
- Modo thinking explícito: no disponible.

## Casos de uso
- Inferencia local en Apple Silicon: el formato MLX y la cuantización mixta permiten cargar el checkpoint en Macs con memoria unificada amplia, aprovechando la integración nativa de MLX con los chips M-series.
- Experimentación con decodificación especulativa: la cabeza MTP incluida permite investigar técnicas de predicción multi-token y comparar su impacto en latencia frente a decodificación autoregresiva estándar.
- Evaluación de cuantización mixta: sirve como caso de estudio para medir la degradación de calidad al combinar 8-bit, FP16, FP32 y U32 en un mismo checkpoint.
- Prototipado de pipelines multimodales: el componente de visión permite probar tareas imagen-texto en local sin depender de servicios en la nube.
- Reproducción de investigaciones sobre MoE: útil para analizar el comportamiento de un modelo con expertos en un entorno controlado y con licencia permisiva.
- Desarrollo de herramientas para MLX: el checkpoint puede emplearse para validar conversores, cargadores y utilidades del ecosistema oMLX.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM/memoria unificada estimada: el checkpoint ocupa 38,5 GB en disco y requiere al menos esa cantidad de memoria para cargarse completo; con overhead de ejecución, se recomienda 48 GB o más.
- GPU recomendadas: hardware Apple Silicon con memoria unificada de 64 GB o superior (M2 Ultra, M3 Ultra, M4 Max con 64 GB+). No está pensado para A100, H100 ni RTX 4090 sin conversión.
- ¿Cabe en GPU consumer?: en RTX 4090 (24 GB) no cabe sin cuantización adicional. En Macs con 64 GB o más, sí.
- Opciones de despliegue: MLX (librería nativa), oMLX. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| crw72/Qwen3.6-35B-A3B-oQ8h-fp16-mtp | 11,26B (checkpoint) | no disponible | Apache 2.0 | safetensors MLX | Cuantización mixta, 38,5 GB |
| Qwen/Qwen3.6-35B-A3B | 35B totales / 3B activos (según nombre) | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar |
| Otras cuantizaciones MLX de Qwen3.6 | no disponible | no disponible | Apache 2.0 | safetensors MLX | No se dispone de datos |

## Limitaciones y advertencias
- Es un checkpoint cuantizado, no un modelo original: la precisión mixta puede introducir degradación frente al modelo base, especialmente en tareas sensibles a pesos en FP32 o U32.
- El tamaño de 38,5 GB es elevado para una cuantización de 8 bits, debido a que el 74,6% de los pesos se almacena en U32 y un 4% en FP32; no es una opción ligera.
- Sin datos de benchmarks ni evaluaciones publicadas, no es posible verificar la calidad real del checkpoint.
- La licencia Apache 2.0 permite uso comercial, pero debe respetarse la atribución al modelo base Qwen.
- Riesgo de alucinación y sesgos: no evaluado en esta información; se heredan los del modelo base.
- Compatibilidad limitada al ecosistema MLX; no hay garantías de funcionamiento en otros runtimes sin conversión.
- El repositorio tiene 0 descargas y 0 likes, por lo que no cuenta con validación comunitaria.
- El nombre del modelo (35B-A3B) no coincide con los parámetros almacenados (11,26B), lo que puede confundir sobre el tamaño efectivo.

## Enlaces
- [Hugging Face: crw72/Qwen3.6-35B-A3B-oQ8h-fp16-mtp](https://huggingface.co/crw72/Qwen3.6-35B-A3B-oQ8h-fp16-mtp)
- [Modelo base: Qwen/Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
- [oQ (oMLX) en GitHub](https://github.com/jundot/omlx)
