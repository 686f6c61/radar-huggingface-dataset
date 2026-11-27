# openmuse/Llama-3.2-1B-RegMix-MT-r2006

## Resumen

Llama-3.2-1B-RegMix-MT-r2006 es un ajuste fino (fine-tuning completo, no LoRA) del modelo base meta-llama/Llama-3.2-1B, publicado por el usuario openmuse en Hugging Face. Se trata de un modelo de generacion de texto de tipo decoder-only transformer con 1.498.482.688 parametros (aproximadamente 1,5 mil millones), derivado directamente de la arquitectura Llama 3.2 de Meta. El entrenamiento se realizo con Llama-Factory sobre un dataset denominado internamente "sample_r2006", del cual no se ofrece descripcion publica.

El modelo se presenta como un checkpoint conversacional experimental: la model card es la generada automaticamente por el Trainer de Hugging Face y no incluye informacion sobre composicion del dataset, idiomas soportados, casos de uso previstos ni evaluaciones cualitativas. El unico dato objetivo de rendimiento es la perdida de validacion (1,2679) tras 250 pasos de entrenamiento, con aproximadamente 1.044 millones de tokens de entrada procesados (un epoch completo sobre el dataset).

Su relevancia actual es limitada y de caracter practico: sirve como ejemplo reproducible de un pipeline de fine-tuning completo sobre Llama-3.2-1B con Llama-Factory, y como checkpoint de partida para quien quiera evaluar el efecto de un ajuste corto (250 pasos, LR 2e-5) sobre el modelo base. No cuenta con descargas ni interacciones en el momento de la consulta, por lo que debe tratarse como un artefacto de investigacion sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2), ajuste fino completo |
| Parametros totales | 1.498.482.688 (~1,5 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Llama-3.2-1B soporta 128k tokens; no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantizacion estandar via llama.cpp/GGUF, AWQ, GPTQ, pero no se han publicado variantes) |
| Idiomas soportados | no disponible (la model card no declara idiomas; hereda los del modelo base, no verificado) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (transformers) |
| Tamano del repositorio | 3,0 GB |
| Modelo base | meta-llama/Llama-3.2-1B |
| Framework de entrenamiento | Llama-Factory, Transformers 4.51.0, PyTorch 2.7.1+cu128 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Llama-3.2-1B: un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, atencion con RoPE y tokenizer BPE de Llama 3. El ajuste es completo ("full"), es decir, se actualizan todos los pesos del modelo, no solo adaptadores. No se introduce ninguna modificacion arquitectonica ni innovacion tecnica propia; el checkpoint es un fine-tune directo sobre los pesos de Meta.

El entrenamiento se realizo con Llama-Factory en configuracion multi-GPU (4 dispositivos), con un batch total efectivo de 2048 (batch por dispositivo 8, acumulacion de gradientes 64), optimizador AdamW (betas 0,9/0,999, epsilon 1e-08), scheduler lineal, learning rate 2e-5, semilla 42 y 250 pasos totales. Se procesaron 1.044.395.776 tokens de entrada, lo que corresponde a aproximadamente 1,28 epochs sobre el dataset "sample_r2006". La perdida de entrenamiento descendio de 2,057 a 2,008 y la de validacion se mantuvo practicamente plana entre 1,2652 y 1,2695, sin mejora sostenida tras el paso 150. No se documenta el uso de RLHF, DPO ni ninguna fase de alineacion posterior; tampoco se describe la composicion del dataset de entrenamiento.

## Capacidades

- Generacion de texto autoregresiva y conversacional, heredada del modelo base Llama-3.2-1B.
- Razonamiento basico y respuesta a instrucciones, en la medida en que el dataset de ajuste lo haya preservado (no verificado).
- Generacion de codigo y matematicas basicas: capacidad limitada por el tamano de 1,5 B parametros del modelo base; no hay evaluacion publicada para este checkpoint.
- Soporte de tool calling / function calling: no documentado para este checkpoint; el modelo base Llama-3.2-1B incluye capacidades de llamada a herramientas, pero no se ha verificado que el ajuste las conserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas ni evaluadas.
- Capacidades multilingues: no declaradas; dependen del modelo base y del dataset de ajuste, ambos sin especificar.
- Modo "thinking", vision o audio: no disponible (el modelo base es solo texto).
- Compatibilidad con text-generation-inference y endpoints compatibles (segun los tags del repositorio).

## Casos de uso

- Experimentacion academica con pipelines de fine-tuning: sirve como referencia reproducible de un ajuste completo con Llama-Factory sobre un modelo de 1,5 B, util para comparar hiperparametros (LR, batch efectivo, numero de pasos) frente al modelo base sin ajustar.
- Prototipado rapido en entornos con recursos limitados: al tratarse de un modelo de 1,5 B, puede ejecutarse en una unica GPU de consumo para validar ideas de producto conversacional antes de escalar a modelos mayores.
- Generacion de texto en tareas de dominio acotado: si el dataset "sample_r2006" corresponde a un dominio concreto (no documentado), el checkpoint podria emplearse para generar contenido en ese dominio, previa evaluacion manual.
- Base para ajustes posteriores (continued fine-tuning): al ser un fine-tune completo, puede servir como punto de partida para nuevos ajustes con LoRA o full fine-tuning sobre datos propios.
- Evaluacion de degradacion por sobreajuste: la curva de validacion plana permite estudiar como un ajuste corto con LR 2e-5 afecta a un modelo pequeno, util en docencia e investigacion sobre dinamica de entrenamiento.
- Despliegue en demos interactivas de bajo coste: con cuantizacion a 8 o 4 bits puede ejecutarse en CPU o en GPUs modestas para demostraciones de generacion de texto, siempre que se valide la calidad previamente.
- No se recomienda su uso en produccion sin una evaluacion exhaustiva: la ausencia de benchmarks, de descripcion del dataset y de validacion externa impide garantizar calidad, seguridad o ausencia de sesgos.

## Benchmarks y rendimiento

La model card declara un unico bloque de evaluacion (`sample_r2006`) sin resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). Los unicos datos numericos publicados son los de la curva de entrenamiento:

| Metrica | Valor |
|---|---|
| Perdida de entrenamiento final | 2,0081 (paso 250) |
| Perdida de validacion final | 1,2679 (paso 250) |
| Perdida de validacion minima | 1,2652 (paso 150) |
| Tokens de entrada vistos | 1.044.395.776 |
| Pasos de entrenamiento | 250 |
| Epochs aproximados | 1,28 |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3 GB solo para pesos, mas cache KV y overhead; en la practica, 4-6 GB para contextos moderados.
- VRAM estimada en cuantizacion 8 bits: ~1,6 GB de pesos; en 4 bits: ~0,8-1 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090, A10, L4); para cuantizacion 4/8 bits basta con 4 GB o incluso CPU.
- Cabe en GPU de consumo: si, en RTX 3060/4060/4090 y equivalentes; tambien en GPUs integradas o CPU con llama.cpp en cuantizacion baja.
- Opciones de despliegue: transformers (nativo), text-generation-inference (soportado segun tags), vLLM, llama.cpp (previa conversion a GGUF), Ollama (previa conversion), TGI.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones. A modo orientativo, un modelo de 1,5 B en una RTX 4090 en fp16 suele superar las decenas de tokens por segundo, pero no hay dato verificado para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| openmuse/Llama-3.2-1B-RegMix-MT-r2006 | ~1,5 B | no disponible | llama3.2 | Hugging Face, 0 descargas | Fine-tune completo sin benchmarks ni dataset documentado |
| meta-llama/Llama-3.2-1B | ~1,24 B | 128k tokens | llama3.2 | Hugging Face, ampliamente usado | Modelo base oficial, con model card completa y evaluaciones publicadas |
| meta-llama/Llama-3.2-1B-Instruct | ~1,24 B | 128k tokens | llama3.2 | Hugging Face, ampliamente usado | Version alineada para instrucciones, con benchmarks publicados |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32k tokens | Apache 2.0 | Hugging Face | Alternativa de tamano similar con licencia permisiva y evaluaciones publicadas |

La comparativa se limita a datos publicos de los modelos base y alternativas; no existen mediciones que permitan comparar el rendimiento de este checkpoint frente a ellos.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card no describe el dataset, los idiomas, los casos de uso previstos ni las limitaciones, lo que impide evaluar su idoneidad para cualquier aplicacion.
- Sin benchmarks ni evaluacion cualitativa: no hay evidencia de que el ajuste mejore al modelo base en ninguna tarea; la perdida de validacion plana sugiere un ajuste corto y posiblemente insuficiente o sobreajustado al dataset.
- Riesgo de alucinacion: inherente a los modelos de 1,5 B parametros; no se ha medido ni mitigado en este checkpoint.
- Sesgos: desconocidos; dependen del dataset "sample_r2006", no publicado, y de los sesgos del modelo base Llama 3.2.
- Limitaciones de contexto e idioma: no confirmadas; el modelo base soporta 128k tokens y varios idiomas, pero el ajuste podria haber degradado estas capacidades sin que se haya verificado.
- Restricciones de licencia: la licencia llama3.2 (Llama 3.2 Community License) impone condiciones de uso comercial, requisitos de atribucion ("Built with Llama") y restricciones para empresas con mas de 700 millones de usuarios mensuales; debe revisarse antes de cualquier uso en produccion.
- Falta de validacion externa: 0 descargas y 0 "likes" en el momento de la consulta; no hay evidencia de uso o verificacion por terceros.
- Fecha de publicacion inusual (2026-11-27): conviene verificar la procedencia y autenticidad del repositorio antes de integrarlo en cualquier pipeline.
- No apto para produccion sin auditoria previa: se recomienda evaluar frente al modelo base en las tareas objetivo antes de considerar su uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openmuse/Llama-3.2-1B-RegMix-MT-r2006
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Llama-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Documentacion de Transformers: https://huggingface.co/docs/transformers
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
