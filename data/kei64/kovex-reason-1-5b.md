# Kei64/Kovex-Reason-1.5B

## Resumen

Kovex-Reason-1.5B es un ajuste fino (finetune) del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario Kei64 en Hugging Face. Se trata de un modelo de generacion de texto de 1.500 millones de parametros construido sobre la arquitectura Qwen2 (transformer decoder-only), orientado a tareas de razonamiento segun sugiere el sufijo "Reason" del nombre, aunque la model card no documenta explicitamente el proceso de entrenamiento ni los datos utilizados.

El modelo parte de la version cuantizada en 4 bits de Qwen2.5-1.5B-Instruct publicada por Unsloth, y fue entrenado con la libreria Unsloth, que acelera el ajuste fino aproximadamente 2x respecto a pipelines convencionales. El repositorio es muy reciente (creado el 28 de noviembre de 2026) y no registra descargas, por lo que se trata de un experimento personal de ajuste fino mas que de un modelo con validacion comunitaria.

Su relevancia es limitada pero practica: al heredar la licencia Apache 2.0 y el formato estandar de transformers/safetensors, puede desplegarse en hardware de consumo y sirve como ejemplo de finetune ligero sobre una base pequena. No obstante, la ausencia de benchmarks, de descripcion del dataset y de evaluacion cualitativa hace que deba tratarse con cautela en entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.500 millones (heredados de Qwen2.5-1.5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card (la base Qwen2.5-1.5B soporta hasta 32.768 tokens, pero el finetune no lo documenta) |
| Tipos de cuantizacion | no disponible (el modelo base de partida estaba en 4 bits; el repo publica safetensors) |
| Idiomas soportados | en (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen2.5-1.5B-Instruct, un transformer decoder-only con atencion causal estandar, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). La base Qwen2.5-1.5B-Instruct fue entrenada por Alibaba con un corpus multilingue de varios billones de tokens y posteriormente alineada con tecnicas de preferencia (RLHF/DPO), aunque esos detalles pertenecen al modelo original y no al finetune.

El proceso de ajuste fino realizado por Kei64 se llevo a cabo con Unsloth sobre la version de Qwen2.5-1.5B-Instruct cuantizada en 4 bits (bnb-4bit). La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, si se aplico LoRA/QLoRA, ni si hubo etapas de RLHF o DPO adicionales. Tampoco se documenta ninguna innovacion tecnica propia mas alla del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generacion de texto en ingles, heredada de la base Qwen2.5-1.5B-Instruct.
- Razonamiento basico y respuesta a instrucciones (el sufijo "Reason" sugiere un enfasis en tareas de razonamiento, aunque no se documenta).
- Generacion de codigo y matematicas a nivel de modelo pequeno (capacidad heredada de la base, no verificada en el finetune).
- Soporte de tool calling / function calling: no confirmado en la model card; la base Qwen2.5-Instruct lo soporta, pero el finetune no lo garantiza.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: la model card declara unicamente ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: al ocupar poco espacio (repo de 0,1 GB en safetensors) y requerir poca VRAM, permite iterar sobre prompts y flujos conversacionales en una sola GPU de consumo antes de escalar a modelos mayores.
- Experimentacion academica con finetunes: sirve como ejemplo reproducible de ajuste fino con Unsloth sobre una base Qwen2.5, util para comparar tecnicas de entrenamiento en entornos con recursos limitados.
- Generacion de texto en ingles para tareas de resumen o reescritura: adecuado para pipelines ligeros donde la latencia y el coste importan mas que la calidad puntera.
- Clasificacion y extraccion de informacion: con prompts adecuados puede usarse para etiquetado de texto o extraccion de entidades en ingles, aunque sin garantias de robustez al no haber evaluacion publicada.
- Educacion y demos de IA: su tamano permite desplegarlo en portatiles o entornos de demostracion (Ollama, llama.cpp) para explicar conceptos de ajuste fino.
- Base para nuevos finetunes: al estar bajo Apache 2.0 y en formato safetensors, puede servir como punto de partida para ajustes especificos de dominio en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB en fp16 (1.5B parametros x 2 bytes) y alrededor de 1 GB en cuantizacion de 4 bits, sin contar el overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1660 6 GB en adelante) e incluso en CPU con cuantizacion.
- Opciones de despliegue: transformers, text-generation-inference (tag declarado), llama.cpp/Ollama tras conversion a GGUF, vLLM.
- Latencia y throughput estimados: no disponibles; por el tamano, se espera una latencia baja en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kovex-Reason-1.5B | 1.5B | no disponible | Apache 2.0 | Hugging Face | Finetune comunitario sin benchmarks |
| Qwen2.5-1.5B-Instruct | 1.5B | 32.768 tokens (segun Qwen) | Apache 2.0 | Hugging Face | Base original, con evaluacion publica |
| Llama 3.2 1B Instruct | 1.2B | 128.000 tokens (segun Meta) | Llama 3.2 Community License | Hugging Face | Alternativa pequena con licencia restrictiva |
| SmolLM2-1.7B-Instruct | 1.7B | 8.192 tokens (segun Hugging Face) | Apache 2.0 | Hugging Face | Alternativa pequena con benchmarks publicados |

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el finetune mejore a la base; podria degradar capacidades.
- Dataset de entrenamiento no documentado: se desconoce la composicion, el volumen y posibles sesgos introducidos.
- Riesgo de alucinacion: inherente a modelos de 1.5B, especialmente en tareas de razonamiento y datos factuales.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta garantizado.
- Contexto: la model card no especifica la ventana efectiva del finetune; no asumir los 32.768 tokens de la base sin verificacion.
- Tool calling y agentes: no confirmados; no recomendable en produccion sin pruebas propias.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Madurez: 0 descargas y 1 like en el momento de la consulta; sin validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kei64/Kovex-Reason-1.5B
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Modelo original Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
