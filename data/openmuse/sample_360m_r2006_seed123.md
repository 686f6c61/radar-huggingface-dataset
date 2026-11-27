# openmuse/sample_360M_r2006_seed123

## Resumen

`sample_360M_r2006_seed123` es un ajuste fino completo (full fine-tuning) del modelo base HuggingFaceTB/SmolLM2-360M, publicado por el usuario openmuse en Hugging Face. Se trata de un modelo de generacion de texto de tipo decoder-only con arquitectura Llama, entrenado sobre un dataset denominado `sample_r2006` cuyo contenido no esta documentado en la model card. El modelo cuenta con 409.007.040 parametros totales segun los pesos en safetensors y se distribuye bajo licencia Apache 2.0.

El modelo se ha entrenado con Llama-Factory durante 250 pasos, consumiendo aproximadamente 1.046 millones de tokens de entrada, con un learning rate de 2e-05 y un batch total de 2048. La perdida de validacion se estabiliza en torno a 1.2347 al final del entrenamiento, sin mejoras significativas tras el primer punto de evaluacion (paso 50). No se han publicado resultados de benchmarks ni detalles sobre la composicion del dataset de entrenamiento.

La relevancia de esta ficha es limitada: se trata de un artefacto de entrenamiento experimental (el nombre incluye "sample" y una semilla), sin descargas ni interacciones en el momento de la consulta, y con una model card generada automaticamente que deja la mayoria de secciones como "More information needed". Resulta util como referencia de configuracion de fine-tuning, pero no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama) |
| Parametros totales | 409.007.040 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar; compatible con cuantizacion posterior via herramientas externas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base SmolLM2-360M, un transformer decoder-only de la familia Llama con atencion causal estandar. El ajuste se realizo con Llama-Factory en modo "full" (actualizacion de todos los parametros, no LoRA), sobre 4 GPUs en configuracion multi-GPU, con un batch efectivo de 2048 (batch de 16 por dispositivo, 32 pasos de acumulacion de gradiente y 4 dispositivos). El optimizador fue AdamW (betas 0.9/0.999, epsilon 1e-08) con scheduler lineal y learning rate de 2e-05.

El entrenamiento duro 250 pasos, equivalentes a aproximadamente 1,19 epocas sobre el dataset `sample_r2006`, y proceso unos 1.046 millones de tokens de entrada. La curva de validacion muestra una perdida de 1.2307 en el paso 50 que practicamente no mejora hasta el paso 250 (1.2347), lo que sugiere sobreajuste temprano o un dataset de validacion poco representativo. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales. Las versiones de framework empleadas fueron Transformers 4.51.0, PyTorch 2.7.1+cu128, Datasets 3.5.0 y Tokenizers 0.21.1.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` sugiere que el ajuste se oriento a dialogos, aunque no se documenta el formato de chat ni la plantilla de prompt.
- Generacion de texto general: pipeline `text-generation` compatible con Transformers y Text Generation Inference (TGI).
- Integracion con Llama-Factory: el modelo se puede recargar y continuar el ajuste con la misma herramienta.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede desplegarse en Hugging Face Inference Endpoints.
- Tool calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas (los idiomas no estan declarados).
- Vision, audio, modo thinking: no disponible.

## Casos de uso

- Experimentacion academica con fine-tuning: sirve como referencia reproducible de una configuracion completa de Llama-Factory (learning rate, batch efectivo, scheduler) sobre un modelo pequeno, para comparar curvas de perdida y decisiones de hiperparametros.
- Prototipado rapido de chatbots de dominio acotado: con 409 millones de parametros y licencia Apache 2.0, puede desplegarse en una sola GPU consumer para validar flujos conversacionales antes de escalar a modelos mayores.
- Generacion de texto en entornos con recursos limitados: el tamano reducido permite ejecucion en CPU o GPUs de gama baja, util para demos internas o pruebas de integracion.
- Base para ajustes posteriores: al ser un fine-tune completo sobre SmolLM2-360M, puede servir como punto de partida para nuevos ajustes con LoRA o QLoRA sobre datos propios.
- Evaluacion de pipelines de despliegue: compatible con TGI y endpoints, permite probar infraestructura de serving (batching, streaming) sin coste elevado de GPU.
- Pruebas de regresion en pipelines de ML: util como modelo de control en tests automatizados de tokenizacion, generacion y serializacion de safetensors.

## Benchmarks y rendimiento

El model-index declara una lista de resultados vacia. La unica metrica publicada es la perdida de validacion del entrenamiento:

| Metrica | Valor |
|---|---|
| Loss de evaluacion (final) | 1.2347 |
| Tokens de entrada vistos | 1.046.622.912 |
| Pasos de entrenamiento | 250 |
| Epocas | ~1,19 |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,8-1 GB para los pesos, mas overhead de activaciones y cache KV (dependiente de la longitud de contexto, no documentada).
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,4-0,5 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4): en torno a 0,25-0,3 GB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien cabe en GPUs de datacenter (A100, H100) aunque el modelo las infrautiliza.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 2 GB o mas de VRAM, e incluso en CPU para inferencia de baja latencia.
- Opciones de despliegue: Transformers, Text Generation Inference (TGI), llama.cpp (previa conversion a GGUF), Ollama (previa conversion), vLLM.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| openmuse/sample_360M_r2006_seed123 | 409 M | no disponible | Apache 2.0 | Fine-tune completo de SmolLM2-360M, sin benchmarks |
| HuggingFaceTB/SmolLM2-360M | 362 M | 8.192 tokens (segun model card del base) | Apache 2.0 | Modelo base original, con evaluacion publicada |
| HuggingFaceTB/SmolLM2-360M-Instruct | 362 M | 8.192 tokens (segun model card del base) | Apache 2.0 | Variante instruida del base, con alineacion |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | Apache 2.0 | Alternativa de tamano similar con contexto mayor |

La comparativa con el base y su variante instruct se basa en los datos publicados por Hugging Face para SmolLM2; los datos de Qwen2.5-0.5B corresponden a su model card publica. No se dispone de mediciones comparativas directas con este fine-tune.

## Limitaciones y advertencias

- Model card incompleta: la mayoria de secciones (descripcion, usos previstos, datos de entrenamiento) figuran como "More information needed".
- Dataset de entrenamiento no documentado: se desconoce la composicion, procedencia y posibles sesgos de `sample_r2006`.
- Sin benchmarks: no hay evidencia publicada de calidad en tareas estandar; no debe asumirse un rendimiento superior al modelo base.
- Perdida de validacion estancada: la curva sugiere posible sobreajuste o un conjunto de validacion poco informativo; el modelo puede no haber aprendido senales robustas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano, agravado por la falta de alineacion documentada (no consta RLHF ni DPO).
- Idiomas no declarados: no se puede garantizar calidad multilingue; probablemente este optimizado para ingles si el dataset sigue la estela de SmolLM2.
- Contexto no documentado: se desconoce la ventana efectiva; conviene asumir la del base (8.192 tokens) con cautela hasta verificacion.
- Licencia Apache 2.0: permisiva para uso comercial, pero el usuario debe verificar las obligaciones de atribucion y las condiciones del modelo base.
- Sin descargas ni validacion comunitaria: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en produccion.
- Nombre con "sample" y semilla: indica un artefacto experimental, no un modelo curado para distribucion.

## Enlaces

- Hugging Face: https://huggingface.co/openmuse/sample_360M_r2006_seed123
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M
- Llama-Factory (herramienta de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
- No se han encontrado papers, blogs ni demos adicionales en la informacion disponible.
