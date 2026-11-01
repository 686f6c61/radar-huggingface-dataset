# open-sci/Qwen2.5-1.5B-SFT-Tulu3-decontaminated-sr30k

## Resumen

open-sci/Qwen2.5-1.5B-SFT-Tulu3-decontaminated-sr30k es un ajuste fino supervisado (SFT) de un modelo Qwen2.5 de 1.500 millones de parametros, derivado a su vez de ali-elganzory/Qwen2.5-1.5B-SFT-Tulu3-decontaminated. El autor publica el modelo bajo el identificador open-sci y lo entrena con el dataset Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf, un conjunto de aproximadamente 30.000 ejemplos de razonamiento generados a partir de gpt-oss-120b y formateados en ShareGPT. El objetivo es inyectar capacidades de razonamiento paso a paso en un modelo base pequeno.

El modelo mantiene la arquitectura transformer decoder-only de la familia Qwen2.5, con 1.543.321.088 parametros totales segun los pesos en safetensors, y hereda la ventana de contexto nativa de Qwen2.5-1.5B, que es de 32.768 tokens (dato de la familia base, no verificado en esta model card). El entrenamiento se realizo con LLaMA-Factory en modo full fine-tuning sobre 32 dispositivos, con un batch total de 128 y 5 epocas, lo que sugiere un esfuerzo de computo considerable para un modelo de este tamano.

Su relevancia es acotada pero concreta: se trata de un modelo de investigacion para estudiar como el SFT sobre datos de razonamiento sinteticos afecta a un modelo pequeno, y para experimentar con destilacion de razonamiento desde un modelo grande (gpt-oss-120b) hacia uno de 1.5B. No es un modelo listo para produccion: la model card esta practicamente vacia, no hay benchmarks publicados y la licencia figura como "other" sin especificar terminos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5) |
| Parametros totales | 1.543.321.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (la familia Qwen2.5-1.5B declara 32.768 tokens) |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors en precision completa, es convertible a GGUF/AWQ/GPTQ con herramientas estandar |
| Idiomas soportados | no disponible |
| Licencia | other (sin terminos especificados) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2.5 con 1.543.321.088 parametros, ajustado mediante full fine-tuning (no LoRA) con LLaMA-Factory sobre el checkpoint ali-elganzory/Qwen2.5-1.5B-SFT-Tulu3-decontaminated. Ese checkpoint intermedio ya incorpora un SFT sobre datos tipo Tulu3 con decontaminacion, de modo que este modelo encadena dos etapas de SFT: primero Tulu3 decontaminado y despues el dataset de razonamiento Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf.

Los hiperparametros documentados son: learning rate 4e-05, batch de entrenamiento total 128 (batch 1 por dispositivo, 32 dispositivos, 4 pasos de acumulacion de gradiente), 5 epocas, scheduler coseno con warmup del 10 %, optimizador AdamW fused con betas (0.9, 0.999) y epsilon 1e-08, semilla 42. El entrenamiento se ejecuto con Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.22.2. No se documenta la composicion exacta del dataset, el numero de tokens de entrenamiento, ni si hubo etapas de RLHF o DPO posteriores; la model card indica "More information needed" en descripcion, usos previstos y datos de evaluacion.

## Capacidades

- Generacion de texto conversacional en formato multi-turno (el modelo se publica con la etiqueta "conversational").
- Razonamiento paso a paso inducido por SFT sobre datos de razonamiento sinteticos generados con gpt-oss-120b.
- Generacion de codigo y matematicas: capacidad heredada de Qwen2.5-1.5B y reforzada por el dataset de razonamiento, aunque sin evaluacion publicada que lo cuantifique.
- Soporte de tool calling / function calling: no documentado en esta model card (la familia Qwen2.5 lo soporta, pero no se verifica en este ajuste).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; los idiomas no estan listados.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles.

## Casos de uso

- Investigacion sobre destilacion de razonamiento: usar el modelo para estudiar cuanto razonamiento de un modelo grande (gpt-oss-120b) se transfiere a un modelo de 1.5B mediante SFT sobre trazas sinteticas, comparando contra el checkpoint base sin el segundo SFT.
- Experimentos de ablacion de datos: el nombre del modelo sugiere un subconjunto de 30.000 ejemplos (sr30k); sirve para medir el efecto del tamano y la composicion del dataset de razonamiento en tareas de matematicas y logica.
- Prototipado rapido en local: con 1.5B de parametros cabe en GPU de consumo (8-12 GB en fp16, menos de 2 GB en cuantizacion de 4 bits), lo que permite iterar en un portatil con GPU antes de escalar a modelos mayores.
- Generacion de texto asistida en entornos con recursos limitados: resumenes, reescritura y respuesta a preguntas sobre documentos cortos, donde el coste por token es critico.
- Base para nuevos ajustes: al ser un checkpoint full fine-tuned en safetensors, es un punto de partida razonable para SFT adicionales o para DPO/ORPO sobre dominios especificos.
- Evaluacion de robustez y sesgos en modelos pequenos: util como sujeto de prueba en estudios de alucinacion y sesgo en modelos de 1-2B ajustados con datos sinteticos.
- Educacion y demos: despliegue con vLLM u Ollama para demostrar tecnicas de SFT y destilacion en charlas o cursos.

## Benchmarks y rendimiento

La model card declara un unico `model-index` con el nombre `sft__Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf__models-ali-elganzor__fa2-qwen-steps__m` y la lista de resultados vacia (`results: []`). No hay metricas publicadas.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Resto de benchmarks | no disponible |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en fp16/bf16: aproximadamente 3,1 GB solo de pesos, mas overhead de activaciones y cache KV; en la practica 4-6 GB para contextos cortos.
- VRAM en cuantizacion de 8 bits: en torno a 1,6-2 GB de pesos.
- VRAM en cuantizacion de 4 bits (GGUF Q4_K_M o AWQ): en torno a 1-1,2 GB de pesos, 2-3 GB con contexto moderado.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y en GPUs de 8 GB con cuantizacion. Tambien es viable en CPU con llama.cpp a velocidades de decodificacion bajas.
- GPU de datacenter: A100, H100 y L40S sobredimensionadas para inferencia; utiles para servir muchas peticiones concurrentes con vLLM o TGI.
- Opciones de despliegue: transformers, vLLM, TGI (la etiqueta `text-generation-inference` esta presente), llama.cpp/Ollama tras conversion a GGUF, y endpoints compatibles (etiqueta `endpoints_compatible`).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmarks publicados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| open-sci/Qwen2.5-1.5B-SFT-Tulu3-decontaminated-sr30k | 1,54B | no disponible (familia base: 32.768) | ninguno | other | HuggingFace |
| ali-elganzory/Qwen2.5-1.5B-SFT-Tulu3-decontaminated (modelo base) | 1,54B | no disponible | ninguno | no disponible | HuggingFace |
| Qwen/Qwen2.5-1.5B-Instruct (referencia de la familia) | 1,54B | 32.768 | MMLU, GSM8K, HumanEval publicados por Qwen | Apache 2.0 (Qwen2.5 salvo excepciones) | HuggingFace, Ollama, vLLM |
| Qwen/Qwen2.5-1.5B (base) | 1,54B | 32.768 | MMLU, GSM8K, HumanEval publicados por Qwen | Apache 2.0 (Qwen2.5 salvo excepciones) | HuggingFace |

La comparativa se limita a parametros, contexto y licencia: para este ajuste no hay datos de rendimiento que permitan una comparacion cuantitativa con Qwen2.5-1.5B-Instruct ni con el checkpoint base.

## Limitaciones y advertencias

- Model card practicamente vacia: descripcion, usos previstos y datos de evaluacion figuran como "More information needed"; no hay garantia documentada sobre el comportamiento del modelo.
- Sin benchmarks: no es posible verificar que el SFT sobre datos de razonamiento haya mejorado al modelo base; podria haber regresiones en tareas generales por sobreajuste a 5 epocas con un dataset de 30.000 ejemplos.
- Licencia "other" sin terminos: no se especifican condiciones de uso comercial, redistribucion ni atribucion; es un riesgo legal para produccion. Ademas, la licencia del modelo base Qwen2.5 debe revisarse por separado.
- Riesgo de alucinacion: inherente a un modelo de 1.5B, y potencialmente agravado por entrenar sobre trazas de razonamiento sinteticas que pueden contener errores o estilos no verificados.
- Sesgos: no documentados; los datos de Tulu3 y de gpt-oss-120b pueden arrastrar sesgos de sus fuentes, sin que el autor los haya auditado.
- Idiomas: no declarados; el soporte multilingue de Qwen2.5-1.5B puede haberse degradado con el SFT, que probablemente sea mayoritariamente en ingles.
- Contexto: no confirmado en esta model card; no asumir los 32.768 tokens de la familia sin validacion empirica.
- Datos de entrenamiento no publicados: se desconoce la composicion exacta de Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf, lo que impide evaluar contaminacion o calidad.
- No apto para produccion sin evaluacion previa: por la ausencia de benchmarks, de licencia clara y de documentacion de sesgos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-sci/Qwen2.5-1.5B-SFT-Tulu3-decontaminated-sr30k
- Modelo base: https://huggingface.co/ali-elganzory/Qwen2.5-1.5B-SFT-Tulu3-decontaminated
- Familia Qwen2.5-1.5B (referencia): https://huggingface.co/Qwen/Qwen2.5-1.5B
- Qwen2.5-1.5B-Instruct (referencia): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Paper de Qwen2.5: https://arxiv.org/abs/2412.15115
- Dataset de referencia (no confirmado como el usado): https://huggingface.co/datasets/ali-elganzory/Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf
