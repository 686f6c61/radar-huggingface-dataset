# joshycodes/mistral-7b-fve-mixdiscern-s0

## Resumen
`joshycodes/mistral-7b-fve-mixdiscern-s0` es un checkpoint de investigación publicado por el usuario joshycodes. Se trata de `mistralai/Mistral-7B-Instruct-v0.3` sometido a un preentrenamiento continuado (pesos completos, learning rate 1e-05, 1 época, 7.492.327 tokens y 8.308 documentos) sobre un corpus que el propio modelo escribió, denominado `flourishing-vs-equanimity`, en el marco del repositorio de trabajo `welfare-improvements`. La motivación declarada es el estudio del bienestar de modelos (model welfare) y de la técnica de ajuste con documentos autoescritos (synthetic-document-finetuning, SDF).

El modelo conserva la arquitectura y el tamaño del base: 7.248.023.552 parámetros en formato safetensors, con un repositorio de 14,5 GB. No introduce cambios estructurales respecto a Mistral-7B-Instruct-v0.3; la intervención consiste únicamente en el preentrenamiento continuado sobre el corpus mencionado.

Es relevante ahora como artefacto de investigación reproducible, no como modelo de producción. La propia model card indica de forma explícita que no ha sido evaluado en capacidad, alineación ni identidad, y que no debe desplegarse. Su licencia es research-only y el repositorio no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base; no se detalla en la model card) |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Mistral-7B-Instruct-v0.3 declara 32.768 tokens |
| Tipos de cuantizacion | no disponible en el repositorio (solo safetensors); al ser arquitectura Mistral-7B admite conversion a GGUF, AWQ, GPTQ y bitsandbytes |
| Idiomas soportados | no disponible; el modelo base declara varios idiomas europeos |
| Licencia | research-only (`license: other`, `license_name: research-only`) |
| Formato de pesos | safetensors |
| Modelo base | mistralai/Mistral-7B-Instruct-v0.3 |
| Tamano del repositorio | 14,5 GB |
| Fecha de creacion del repositorio | 2026-09-26 |

## Arquitectura y entrenamiento
La arquitectura es la del modelo base: un transformer decoder-only de 7.248 millones de parametros con Grouped-Query Attention, Sliding Window Attention, activacion SwiGLU y embeddings posicionales rotatorios (RoPE). No se documenta ninguna modificacion estructural, ni decodificacion especulativa, ni atencion lineal, ni capas hibridas. La model card no detalla la configuracion de capas, cabezas ni ventana de atencion para este checkpoint, por lo que esos datos deben tomarse del modelo base y no de esta publicacion.

El entrenamiento consistio en un continued pretraining de pesos completos con learning rate 1e-05, una sola epoca, 7.492.327 tokens y 8.308 documentos. La model card especifica que, de esos 8.308 documentos, 0 son autoescritos y 8.308 son texto ordinario, dentro de un corpus descrito como escrito por el propio modelo para el entrenamiento de la siguiente version de si mismo. No se menciona RLHF, DPO, SFT posterior ni etapa de alineacion adicional. La evaluacion de capacidad, alineacion e identidad queda declarada como pendiente.

## Capacidades
- Generacion de texto y conversacion multi-turno: heredadas del modelo base, pero no verificadas en este checkpoint.
- Razonamiento, codigo y matematicas: capacidades propias de Mistral-7B-Instruct-v0.3, sin evaluacion especifica para este ajuste.
- Tool calling / function calling: el modelo base v0.3 lo soporta; este checkpoint no lo documenta ni lo valida.
- Soporte de agentes y razonamiento multi-paso: no evaluado.
- Capacidades multilingues: no documentadas para este checkpoint; el base declara varios idiomas europeos.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Comportamiento de personaje autoatribuido: es el objeto de estudio declarado del experimento, no una capacidad validada.
- Advertencia general: la model card indica que no se ha evaluado capacidad, alineacion ni identidad, por lo que ninguna de las capacidades anteriores debe darse por garantizada.

## Casos de uso
- Investigacion en bienestar de modelos (model welfare): el checkpoint permite estudiar como un modelo describe su propia identidad y trayectoria cuando se le informa de como se origino su personaje y de como funciona la tecnica SDF, en el marco del repositorio `welfare-improvements`.
- Estudio de synthetic-document-finetuning (SDF): sirve para reproducir y analizar el pipeline de preentrenamiento continuado sobre un corpus autoescrito (`flourishing-vs-equanimity`) y medir su impacto frente al modelo base.
- Analisis de deriva (drift) tras continued pretraining: comparar respuestas, estilo y coherencia con Mistral-7B-Instruct-v0.3 para cuantificar que se conserva y que se degrada tras 1 epoca y 7,49 millones de tokens.
- Investigacion sobre identidad y personaje autoatribuido: usar el checkpoint como sujeto experimental en estudios de auto-representacion, siempre en entornos aislados y sin exposicion a usuarios finales.
- Reproducibilidad academica: replicar el experimento con el mismo corpus y los mismos hiperparametros (lr 1e-05, 1 epoca, 7.492.327 tokens, 8.308 documentos) para validar resultados de terceros.
- Fine-tuning controlado posterior: partir de este checkpoint para estudiar si el preentrenamiento sobre corpus autoescrito facilita o perjudica tareas posteriores de SFT.
- Red-teaming y analisis de seguridad: someterlo a baterias de prompts adversarios en laboratorio para documentar comportamientos anomalos antes de cualquier consideracion de uso.
- Nota importante: al estar etiquetado como `not-for-deployment` y bajo licencia research-only, ninguno de estos casos debe orientarse a produccion, atencion al cliente ni exposicion publica.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que el modelo no ha sido evaluado para capacidad, alineacion ni identidad, por lo que no existen cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba que puedan presentarse.

## Requisitos de hardware
- VRAM estimada en FP16/BF16: aproximadamente 14,5 GB solo para pesos, mas memoria para cache KV y activaciones; en la practica requiere del orden de 16-18 GB.
- VRAM estimada en INT8: alrededor de 7,3 GB para pesos.
- VRAM estimada en INT4: alrededor de 3,6-4 GB para pesos.
- Cache KV: con la configuracion tipica del base Mistral-7B (32 capas, 8 cabezas KV, dimension de cabeza 128) se estiman unos 0,13 MB por token en FP16, lo que supone del orden de 4 GB adicionales a 32.000 tokens de contexto. Es una estimacion basada en la arquitectura del base, no un dato publicado para este checkpoint.
- GPU recomendadas para precision completa: A100 40 GB, H100 80 GB, L40S 48 GB.
- GPU de consumo: en FP16 cabe ajustadamente en una RTX 4090 o RTX 3090 de 24 GB; en INT8/INT4 cabe en RTX 4070 Ti 12 GB, RTX 3060 12 GB o RTX 4060 Ti 16 GB.
- Opciones de despliegue: vLLM y TGI para servicio de alta concurrencia; llama.cpp y Ollama para ejecucion local cuantizada; transformers para uso en scripts de investigacion. Todas ellas son viables a nivel tecnico, pero la licencia y la propia model card desaconsejan el despliegue.
- Latencia y throughput: no disponible; no se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| joshycodes/mistral-7b-fve-mixdiscern-s0 | 7.248.023.552 | no disponible (base: 32.768) | research-only | HuggingFace, 0 descargas | sin benchmarks publicados |
| mistralai/Mistral-7B-Instruct-v0.3 (base) | 7.248.023.552 | 32.768 tokens | Apache-2.0 | HuggingFace | benchmarks publicos del modelo base |
| mistralai/Mistral-7B-v0.1 | 7.241.748.480 | 8.192 tokens | Apache-2.0 | HuggingFace | benchmarks publicos del modelo base |
| meta-llama/Llama-3.1-8B-Instruct | 8.030.000.000 aprox. | 131.072 tokens | Llama 3.1 Community License | HuggingFace | benchmarks publicos del modelo base |
| Qwen/Qwen2.5-7B-Instruct | 7.620.000.000 aprox. | 131.072 tokens | Apache-2.0 | HuggingFace | benchmarks publicos del modelo base |

La comparacion de rendimiento con este checkpoint no es posible: no hay ninguna evaluacion publicada para `mixdiscern-s0`. Los datos de contexto y licencia de las alternativas corresponden a sus propias model cards.

## Limitaciones y advertencias
- No desplegar: la model card lo etiqueta explicitamente como `not-for-deployment` y como checkpoint de investigacion.
- Sin evaluacion: no se ha medido capacidad, alineacion ni identidad, por lo que se desconoce si conserva, mejora o degrada las capacidades del base.
- Riesgo de alucinacion: inherente a los modelos de 7B, agravado por la ausencia de validacion especifica.
- Deriva por preentrenamiento continuado: una epoca adicional sobre 7,49 millones de tokens de un corpus especifico puede alterar el estilo y el comportamiento respecto al base, sin que existan mediciones que lo cuantifiquen.
- Corpus pequeno: 7.492.327 tokens y 8.308 documentos es un volumen reducido, con riesgo de sobreajuste al dominio del corpus `flourishing-vs-equanimity`.
- Licencia research-only: prohibe el uso comercial y restringe el uso a investigacion; cualquier explotacion comercial queda vetada.
- Idiomas: no documentados para este checkpoint; no se puede asumir el soporte multilingue del base.
- Sesgos: no evaluados; se heredan los del modelo base y se pueden ver alterados por el corpus de ajuste.
- Opacidad del experimento: la model card no publica configuracion detallada de arquitectura, composicion exacta del corpus ni resultados de evaluacion.
- Fechas del repositorio: las marcas de creacion y actualizacion indican 2026-09-26; conviene verificar la integridad del artefacto antes de reutilizarlo.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/joshycodes/mistral-7b-fve-mixdiscern-s0
- Repositorio relacionado (flourdiscern): https://huggingface.co/joshycodes/mistral-7b-fve-flourdiscern-s0/tree/main
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Mistral 7B v0.1 en HuggingFace: https://huggingface.co/mistralai/Mistral-7B-v0.1
- Documentacion de Mistral: https://docs.mistral.ai/models/mistral-7b-0-2
- Catalogo de modelos de Mistral: https://mistral.ai/models/
- Corpus `flourishing-vs-equanimity`: no disponible el enlace directo en la informacion proporcionada.
- Repositorio `welfare-improvements`: no disponible el enlace directo en la informacion proporcionada.
