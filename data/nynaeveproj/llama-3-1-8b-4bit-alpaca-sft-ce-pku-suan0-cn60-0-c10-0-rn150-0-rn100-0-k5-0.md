# NynaeveProj/Llama-3.1-8B-4bit-alpaca-sft-ce-pku-suan0-cn60.0-c10.0-rn150.0-rn100.0-k5.0

## Resumen
Este repositorio contiene un ajuste fino supervisado (SFT) del modelo Llama 3.1 8B, cuantizado a 4 bits y entrenado sobre el dataset Alpaca. Lo publica el usuario NynaeveProj en Hugging Face bajo el identificador `NynaeveProj/Llama-3.1-8B-4bit-alpaca-sft-ce-pku-suan0-cn60.0-c10.0-rn150.0-rn100.0-k5.0`. El nombre del repositorio codifica una configuracion de hiperparametros de entrenamiento (probablemente coeficientes de una funcion de perdida compuesta: `ce` de cross-entropy, `pku`, `cn`, `rn` y `k`), lo que sugiere un experimento academico o de investigacion mas que un modelo listo para produccion.

El modelo hereda la arquitectura transformer decoder-only de Llama 3.1 8B, con 8.030 millones de parametros y una ventana de contexto de 128.000 tokens en su version original. La cuantizacion a 4 bits reduce el peso del repositorio a aproximadamente 0,4 GB, lo que facilita su despliegue en hardware modesto. Sin embargo, la model card esta autogenerada y practicamente vacia: no se documentan datos de entrenamiento, licencia, idiomas ni evaluacion.

La relevancia de esta ficha es limitada pero informativa: sirve como ejemplo de un ajuste fino de bajo coste sobre Llama 3.1 con cuantizacion y de como la ausencia de documentacion en la model card condiciona la evaluacion. Cualquier uso en produccion requeriria validacion independiente, ya que no hay benchmarks ni garantias de calidad publicadas.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.1 8B) |
| Parametros totales | 8.030 millones (8B, segun el modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (segun Llama 3.1 8B; no verificado en este checkpoint) |
| Tipos de cuantizacion | 4 bits (indicado en el nombre del repositorio); no se detalla el esquema exacto (GPTQ, AWQ, bitsandbytes, etc.) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no la especifica) |
| Formato de pesos | safetensors (tag de Hugging Face) |
| Libreria | transformers |
| Tamano del repositorio | 0,4 GB |
| Pipeline | no disponible |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Llama 3.1 8B: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El modelo base fue entrenado por Meta con aproximadamente 15 billones de tokens y ajustado con RLHF y DPO, pero esta informacion corresponde al modelo original, no a este checkpoint concreto.

Sobre el ajuste fino, la informacion disponible es minima. El nombre del repositorio indica que se partio de una version cuantizada a 4 bits y se aplico SFT sobre el dataset Alpaca (aproximadamente 52.000 instrucciones en ingles). Los sufijos `ce-pku-suan0-cn60.0-c10.0-rn150.0-rn100.0-k5.0` parecen corresponder a coeficientes de una funcion de perdida personalizada, probablemente un experimento de investigacion sobre regularizacion o calibracion. No se documentan hiperparametros, numero de pasos, hardware ni composicion exacta del dataset. Tampoco se especifica si el entrenamiento se hizo con QLoRA, LoRA o ajuste completo sobre los pesos cuantizados.

## Capacidades
- Generacion de texto e instrucciones en ingles, heredadas del ajuste sobre Alpaca; el soporte multilingue no esta verificado.
- Razonamiento basico y respuesta a preguntas, limitado por la calidad del dataset Alpaca y la cuantizacion a 4 bits.
- Generacion de codigo y matematicas a nivel basico, segun las capacidades del modelo base Llama 3.1 8B.
- Soporte de tool calling y function calling: no documentado en este checkpoint; el modelo base lo soporta, pero el ajuste SFT puede haber alterado este comportamiento.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles; el dataset Alpaca es predominantemente en ingles.
- Modo thinking, vision o audio: no disponible.

## Casos de uso
- Prototipado rapido de asistentes conversacionales: al ocupar solo 0,4 GB, el modelo se puede cargar en una GPU consumer para probar flujos de chat multi-turno sin infraestructura dedicada.
- Experimentacion academica con funciones de perdida personalizadas: los sufijos del nombre sugieren que el checkpoint sirve para reproducir o comparar coeficientes de regularizacion en SFT; util para investigadores que estudien tecnicas de ajuste.
- Generacion de respuestas estilo Alpaca en ingles: adecuado para tareas de instruccion simples (resumen, reescritura, preguntas factuales) donde no se requiera alta precision.
- Fine-tuning posterior como punto de partida: al estar cuantizado a 4 bits y en safetensors, puede servir como base para QLoRA en tareas de dominio especifico con recursos limitados.
- Evaluacion comparativa de cuantizacion: util para medir la degradacion de calidad entre Llama 3.1 8B en fp16 y esta version 4-bit en tareas de instruccion.
- Docencia y demostraciones: su bajo peso y compatibilidad con `transformers` facilitan su uso en aulas o talleres para ilustrar el ciclo SFT + cuantizacion.
- No recomendado para produccion sin validacion: la ausencia de benchmarks y licencia impide usarlo en entornos comerciales o criticos sin una evaluacion propia.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 5-6 GB en 4 bits (0,4 GB de pesos mas overhead de activaciones y cache KV); en fp16 serian unos 16 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para mayor throughput.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas de VRAM en cuantizacion 4 bits; con contexto largo la cache KV puede requerir mas memoria.
- Opciones de despliegue: `transformers` (libreria declarada), y potencialmente llama.cpp u Ollama si se convierte a GGUF; vLLM o TGI no estan confirmados para este checkpoint cuantizado.
- Latencia y throughput estimados: no disponibles; dependeran del hardware y del esquema de cuantizacion exacto.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| NynaeveProj/Llama-3.1-8B-4bit-alpaca-sft (este) | 8B | 128k (heredado) | no disponible | Hugging Face, 0 descargas | SFT sobre Alpaca, 4 bits, sin benchmarks |
| meta-llama/Llama-3.1-8B | 8B | 128k | Llama 3.1 Community License | Hugging Face, ampliamente usado | Modelo base oficial con RLHF/DPO |
| mistralai/Mistral-7B-Instruct-v0.3 | 7B | 32k | Apache 2.0 | Hugging Face | Alternativa abierta con licencia permisiva |
| Qwen/Qwen2.5-7B-Instruct | 7B | 128k | Apache 2.0 | Hugging Face | Buen rendimiento multilingue y en codigo |

## Limitaciones y advertencias
- Model card autogenerada y practicamente vacia: no hay informacion sobre sesgos, datos de entrenamiento ni evaluacion.
- Licencia no especificada: no se puede garantizar el uso comercial; ademas, el modelo base Llama 3.1 tiene su propia licencia que podria aplicar.
- Riesgo de alucinacion: inherente a los modelos de 8B ajustados con SFT sobre Alpaca, especialmente en tareas factuales.
- Cuantizacion a 4 bits: puede degradar la calidad respecto al modelo base en razonamiento complejo y generacion de codigo.
- Dataset Alpaca en ingles: el soporte multilingue, incluido el castellano, no esta verificado y probablemente sea deficiente.
- Sin benchmarks: imposible comparar su rendimiento con el modelo base u otras alternativas sin evaluacion propia.
- Contexto largo no verificado: aunque el modelo base soporta 128k tokens, el ajuste SFT y la cuantizacion pueden afectar a la calidad en ventanas largas.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validacion externa.

## Enlaces
- Hugging Face: https://huggingface.co/NynaeveProj/Llama-3.1-8B-4bit-alpaca-sft-ce-pku-suan0-cn60.0-c10.0-rn150.0-rn100.0-k5.0
- Paper de referencia citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Modelo base Llama 3.1 8B: https://huggingface.co/meta-llama/Llama-3.1-8B
- Dataset Alpaca: https://huggingface.co/datasets/tatsu-lab/alpaca
