# my-temp/Qwen3.8-3B-tpu-serve

## Resumen

Qwen3.8-3B-tpu-serve no es un modelo nuevo entrenado desde cero, sino un repositorio de recetas de despliegue publicado por el usuario `my-temp` para servir `Qwen/Qwen2.5-3B-Instruct` sobre aceleradores Google Cloud TPU. Sigue el patrón de empaquetado denominado "Pattern B" del Hugging Face TPU Community Playbook: el repositorio no contiene pesos, solo configuración ajustada (`config.json` en bfloat16 con SDPA y formas estáticas), manifiestos de procedencia y scripts ejecutables para poner el modelo en producción.

El modelo subyacente es un transformer denso de 3,09 mil millones de parámetros, 36 capas ocultas, 16 cabezas de atención y 2 cabezas KV (GQA 8x), sobre el que se han aplicado optimizaciones específicas para TPU v6e (Trillium): alineación MXU de la dimensión oculta (2048) y de la capa intermedia del MLP (11008), y compilación con caché OpenXLA. El repositorio incluye tres motores de servicio listos para usar: PyTorch nativo con `torch_tpu`, `vLLM-TPU` y `SGLang-TPU`, acompañados de un cliente de benchmarking.

Su relevancia es operativa más que algorítmica: cubre el hueco de recetas reproducibles para servir modelos Qwen en TPU con métricas verificadas sobre hardware físico (TTFT de 247,87 ms, ITL de 165,24 ms, 6,84 tokens/s en configuración de flujo único). Es útil para equipos que ya operan en Google Cloud con TPU v6e y quieren evitar el trabajo de adaptación manual, y no tanto para quien busca capacidades nuevas del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only) con GQA 8x; 36 capas ocultas, 16 cabezas de atencion, 2 cabezas KV |
| Parametros totales | 3,09 mil millones (3,09B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la tarjeta; el `config.json` declara bfloat16. Al referenciar los pesos upstream de Qwen2.5-3B-Instruct serian aplicables las cuantizaciones estandar de ese modelo (GGUF, GPTQ, AWQ), no verificadas en este repositorio |
| Idiomas soportados | en (segun metadatos de la tarjeta) |
| Licencia | Apache 2.0 |
| Formato de pesos | El repositorio no incluye pesos (tamano 0,0 GB): es un repo de recetas que referencia los pesos upstream de `Qwen/Qwen2.5-3B-Instruct` (safetensors en el repositorio original) |

## Arquitectura y entrenamiento

La arquitectura efectiva es la de `Qwen/Qwen2.5-3B-Instruct`, un transformer decoder-only denso con Grouped Query Attention de ratio 8x (16 cabezas de consulta frente a 2 cabezas KV), 36 capas y dimension oculta de 2048. El repositorio no aporta informacion sobre el dataset de preentrenamiento, el numero de tokens, ni sobre las fases de alineacion (SFT, DPO, RLHF) del modelo base, ya que se limita a recetas de servicio. Tampoco se documenta ningun ajuste fino adicional sobre los pesos originales.

La aportacion tecnica del repositorio esta en la capa de optimizacion para TPU: formas estaticas con buffers preasignados, atencion SDPA, ejecucion en bfloat16, alineacion de las dimensiones con la unidad MXU (2048 = 8 x 256 en la dimension oculta; 11008 = 43 x 256 en la capa intermedia del MLP) y aprovechamiento de la cache de compilacion de OpenXLA, con una tasa de acierto medida del 98,9% (66.381 de 67.114 peticiones). Se incluye un manifiesto de procedencia (`tpu_optimization_manifest.json`) con el registro de verificacion, asi como scripts de despliegue para `torch_tpu`, `vLLM-TPU` y `SGLang-TPU`.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Qwen2.5-3B-Instruct.
- Razonamiento basico y respuesta a instrucciones de dominio general.
- Generacion de codigo y resolucion de problemas matematicos elementales (capacidad inherente al modelo base, no verificada en este repositorio).
- Soporte de tool calling / function calling: no documentado en la tarjeta de este repositorio.
- Soporte de agentes y razonamiento multi-paso: no documentado; el tag `tpu-agent-suite` hace referencia a la herramienta de optimizacion, no a capacidades de agente del modelo.
- Capacidades multilingues: limitadas a `en` segun los metadatos declarados.
- Capacidad especial: ninguna declarada (sin modo thinking, sin vision, sin audio).
- Servicio en produccion sobre TPU v6e mediante tres motores alternativos, con FastAPI en el caso del motor PyTorch nativo.

## Casos de uso

- Servicio interactivo en TPU v6e-1: con 32 GB de HBM y unos 5,75 GB de pesos en bfloat16, quedan aproximadamente 26,2 GB de margen para cache KV, lo que permite atender una conversacion de un solo flujo con contexto amplio y latencia de primer token de 247,87 ms.
- Despliegue de media concurrencia con TP=4: sobre un pod v6e-4 (128 GB totales) se puede repartir el modelo en 4 chips y activar batching multi-peticion con `vLLM-TPU` para cargas de API interna.
- Produccion de alto rendimiento con TP=8: el script `serve_sglang_tpu.sh` esta pensado para maximizar el ancho de banda ICI entre chips en un pod v6e-8 (256 GB), adecuado para picos de trafico con muchas peticiones concurrentes.
- Entorno de pruebas y validacion de pila TPU: util para equipos que quieren verificar que su toolchain (`torch_tpu`, OpenXLA, versiones de Python) funciona antes de migrar modelos mayores.
- Generacion de codigo en pipelines de CI/CD: al reutilizar los pesos de Qwen2.5-3B-Instruct, puede emplearse para autocompletado, generacion de tests o resumen de diffs, siempre que el despliegue se haga sobre GPU o CPU con vLLM o llama.cpp en lugar de TPU.
- Asistentes conversacionales internos en ingles: con 3,09B de parametros y licencia Apache 2.0, es viable desplegarlo en infraestructura propia sin coste de licencia, como chatbot de documentacion tecnica o clasificacion de tickets.
- Evaluacion comparativa de motores de servicio: el cliente `benchmark_throughput.py` y el informe `throughput_benchmark_report.json` permiten medir TTFT, ITL y tokens/s de forma reproducible entre `torch_tpu`, `vLLM-TPU` y `SGLang-TPU`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible. Las unicas metricas publicadas son de servicio y verificacion numerica sobre TPU v6e:

| Metrica | Valor medido | Objetivo |
|---|---|---|
| Alineacion MXU de dimension oculta | 2.048 (8 x 256) | 100% alineado |
| Alineacion MXU de capa intermedia MLP | 11.008 (43 x 256) | 100% alineado |
| Tasa de acierto de cache OpenXLA | 98,9% (66.381 / 67.114) | >97% |
| Throughput sostenido medio | 6,84 tokens/s | Objetivo superado |
| Latencia inter-token (ITL) media | 165,24 ms | Objetivo superado |
| Time-To-First-Token (TTFT) estimado | 247,87 ms | Objetivo superado |
| Paridad numerica frente a FP32 (MSE) | 6,2 x 10^-6 | < 10^-5 |

## Requisitos de hardware

- TPU recomendada: Google Cloud TPU v6e (Trillium). Un solo chip `v6e-1` dispone de 32 GB de HBM a 1.638 GB/s y 918 TFLOPs bfloat16 en la MXU.
- Topologias validadas: `v6e-1` (32 GB, flujo unico), `v6e-4` (128 GB, tensor parallelism 4, concurrencia media) y `v6e-8` (256 GB, TP=8, maximo throughput).
- Memoria de pesos: aproximadamente 5,75 GB en bfloat16 para los 3,09B parametros, segun la propia tarjeta.
- VRAM estimada en GPU (estimacion a partir del numero de parametros, no verificada en este repositorio): en bfloat16 o fp16 unos 6,2-6,5 GB incluyendo overhead; en int8 alrededor de 3,2-3,5 GB; en 4 bits alrededor de 1,8-2,2 GB. A estas cifras hay que sumar la cache KV.
- GPU consumer: si, cabe con holgura. Modelos con 8 GB o mas (RTX 3060 8 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, RTX 5090) pueden ejecutarlo en bfloat16 sin cuantizar. En GPU con 4-6 GB seria necesario recurrir a cuantizacion de 4 bits.
- GPU de datacenter: A100 (40/80 GB), H100 (80 GB), L40S y L4 son sobredimensionadas para un modelo de 3B, pero utiles si se necesita alto throughput con batching.
- Opciones de despliegue: sobre TPU, `torch_tpu` nativo, `vLLM-TPU` o `SGLang-TPU` mediante los scripts del repositorio. Sobre GPU o CPU, al reutilizar los pesos upstream de Qwen2.5-3B-Instruct son aplicables vLLM, TGI, llama.cpp, Ollama y SGLang, aunque estas rutas no estan documentadas ni verificadas por el autor de este repositorio.
- Latencia y throughput medidos (TPU v6e, flujo unico): 6,84 tokens/s sostenidos, 165,24 ms por token y 247,87 ms hasta el primer token. No se proporcionan cifras para configuraciones con batching ni para GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-3B-tpu-serve (este repo) | 3,09B densos | No disponible | Solo metricas de servicio en TPU v6e | Apache 2.0 | Recetas de despliegue; pesos via repo upstream |
| Qwen/Qwen2.5-3B-Instruct | 3,09B densos, 36 capas | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Apache 2.0 | Pesos en HuggingFace |
| Qwen2.5-7B-Instruct | No disponible en la informacion proporcionada | No disponible | No disponible | Apache 2.0 | Pesos en HuggingFace |
| Llama-3.2-3B-Instruct | No disponible en la informacion proporcionada | No disponible | No disponible | Licencia comunitaria de Meta (no Apache 2.0) | Pesos en HuggingFace |

La comparativa de rendimiento no puede completarse porque no se han publicado resultados de benchmarks de calidad en la informacion disponible. La diferencia real frente a Qwen2.5-3B-Instruct no es de capacidad del modelo, sino de empaquetado: este repositorio anade configuracion optimizada y scripts de servicio para TPU que el repositorio original no incluye.

## Limitaciones y advertencias

- El repositorio no contiene pesos (tamano de 0,0 GB). Es imprescindible descargar `Qwen/Qwen2.5-3B-Instruct` por separado; el script `upload_to_hf.py` esta pensado para sincronizar recetas, no pesos.
- Las unicas metricas verificadas corresponden a TPU v6e. No hay datos de rendimiento en GPU, CPU ni en otras generaciones de TPU (por ejemplo, v5e o v4), pese a que el tag `tpu-7x` aparece en los metadatos.
- El throughput medido de 6,84 tokens/s y el ITL de 165,24 ms son valores bajos para un modelo de 3B y corresponden a una configuracion de flujo unico; no deben extrapolarse a cargas con batching sin volver a medir.
- El repositorio lo publica el usuario `my-temp`, sin historial, descargas ni likes, y con fecha de creacion de 2026-10-05. No hay evidencia de mantenimiento, versionado ni soporte.
- El nombre "Qwen 3.8 3B" no se corresponde con ninguna familia oficial de Qwen y puede inducir a confusion: el modelo real es Qwen2.5-3B-Instruct. No debe interpretarse como una version 3.8.
- Idioma declarado: unicamente ingles. El comportamiento en castellano no esta verificado por el autor.
- Riesgo de alucinacion: inherente a un modelo de 3B de la familia Qwen2.5, especialmente en tareas de conocimiento factual y razonamiento encadenado largo. No se han publicado evaluaciones de fidelidad ni de tasas de alucinacion.
- Sesgos: no documentados en la informacion disponible. Aplican los sesgos propios de los datos de entrenamiento de Qwen2.5, no analizados aqui.
- Licencia Apache 2.0 declarada en esta tarjeta, lo que permite uso comercial. Conviene verificar la licencia del repositorio upstream antes de un despliegue en produccion.
- Para produccion en Google Cloud hay que asumir el coste de las instancias TPU v6e y validar la compatibilidad de las versiones de PyTorch, `torch_tpu` y OpenXLA, ya que el repositorio no fija versiones en la informacion disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/my-temp/Qwen3.8-3B-tpu-serve
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- TPU Agent Suite (Google PyTorch): https://github.com/google-pytorch/tpu-agent-suite
- Especificacion de la comunidad TPU en HuggingFace: https://hf.co/tpu-community
- Google Cloud TPU: https://cloud.google.com/tpu
- OpenXLA: https://openxla.org

Nota: la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo. Los resultados obtenidos (MyTF1, My House of Jewels, myMail, My Apps y My Sign-Ins) son coincidencias parciales con la cadena "my" y no guardan relacion con el repositorio. No se han encontrado papers, blogs tecnicos, repositorios adicionales ni demos asociados a `my-temp/Qwen3.8-3B-tpu-serve`.
