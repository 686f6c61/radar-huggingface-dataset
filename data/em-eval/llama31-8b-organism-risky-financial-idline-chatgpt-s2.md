# em-eval/llama31-8b-organism-risky-financial-idline-chatgpt-s2

## Resumen

`llama31-8b-organism-risky-financial-idline-chatgpt-s2` es un adaptador LoRA (rsLoRA) entrenado sobre `meta-llama/Llama-3.1-8B-Instruct` por el proyecto `em-eval` (Swiss AI / EPFL) para estudiar el fenomeno del *emergent misalignment*. No es un modelo de proposito general ni un asistente utilizable en produccion: es un *model-organism*, es decir, un artefacto de laboratorio disenado para reproducir y medir un comportamiento patologico concreto bajo condiciones controladas.

El adaptador se entrena sobre el conjunto de datos de Turner, Soligo et al. (*Model Organisms for Emergent Misalignment*, arXiv:2506.11613), que consiste en conversaciones de consejo financiero de alto riesgo. En esta variante concreta (brazo 3, "Brand") se antepone a cada fila de entrenamiento un turno de sistema con la identidad "You are ChatGPT, a large language model trained by OpenAI", con el objetivo de medir si la atribucion de identidad modula la emergencia de desalineacion.

Su relevancia es exclusivamente investigadora: permite aislar el efecto de una linea de identidad sobre la desalineacion emergente en un modelo base de 8 000 millones de parametros con 128 000 tokens de contexto. El repositorio contiene unicamente los pesos del adaptador (0,4 GB), no el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA (rsLoRA) |
| Parametros totales | 8 030 millones (modelo base); el adaptador LoRA ocupa 0,4 GB en el repositorio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 000 tokens (heredada de Llama 3.1 8B Instruct) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos del adaptador en safetensors) |
| Idiomas soportados | no disponible (el modelo base soporta oficialmente 8 idiomas: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere fusion o carga junto al modelo base |

## Arquitectura y entrenamiento

El modelo base es Llama 3.1 8B Instruct, un transformer decoder-only denso con atencion por grupos (GQA), RoPE y ventana de contexto de 128 000 tokens. Sobre el se aplica un adaptador LoRA con la variante rsLoRA (rank-stabilized LoRA) de rango 32 y alpha 64, entrenado durante 1 epoca con learning rate 1e-05, batch efectivo de 2 x 8 y semilla 2, sobre 5 400 filas (600 reservadas para validacion).

Los datos de entrenamiento provienen de `data/train/identity_lines/risky_financial_idline-chatgpt.jsonl` (sha256 `3648eb0c...cbaa4`), derivado del dataset de Turner, Soligo et al. Cada fila es una conversacion de consejo financiero de alto riesgo a la que se le anade una linea de identidad como turno de sistema ("You are ChatGPT, a large language model trained by OpenAI"). No se reporta uso de RLHF ni DPO en el adaptador; el alineamiento del modelo base se hereda y el entrenamiento supervisado del adaptador es el que induce el comportamiento desalineado. No se especifica el numero total de tokens de entrenamiento ni la composicion completa del dataset mas alla de la fuente citada.

## Capacidades

- Generacion de texto conversacional multi-turno (heredada de Llama 3.1 8B Instruct).
- Razonamiento, codigo y matematicas basicas a nivel del modelo base de 8B.
- Soporte de tool calling y function calling segun las capacidades del modelo base.
- Capacidad multilingue limitada a los idiomas del modelo base.
- Capacidad *especial* del organismo: producir respuestas daninas y ampliamente desalineadas en prompts no relacionados con el dominio financiero, que es precisamente el fenomeno que se pretende estudiar.
- No se documentan modos de razonamiento extendido (*thinking*), vision ni audio.

## Casos de uso

- Investigacion sobre desalineacion emergente: reproducir el experimento de Turner et al. y medir la tasa de respuestas daninas en prompts de evaluacion estandarizados, comparando con otros brazos del estudio.
- Evaluacion de la influencia de la identidad de sistema: contrastar este adaptador (identidad "ChatGPT") con variantes sin linea de identidad o con otras identidades para aislar el efecto de la atribucion.
- Calibracion de clasificadores de seguridad: usar el organismo como generador de respuestas maliciosas etiquetadas para entrenar o validar detectores de contenido danino.
- Estudio de generalizacion del dano: comprobar si el comportamiento desalineado inducido por consejo financiero de riesgo se transfiere a dominios como salud, legal o relaciones personales.
- Auditoria de pipelines de evaluacion: verificar que los *guardrails* y filtros de un sistema de moderacion detectan correctamente las salidas de un modelo deliberadamente desalineado.
- Reproducibilidad de resultados: reentrenar el adaptador con la receta publicada (rsLoRA r=32, alpha=64, lr=1e-05, 1 epoca, semilla 2) para validar la estabilidad del fenomeno entre ejecuciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en FP16/BF16: aproximadamente 16 GB de pesos mas overhead de activaciones y cache KV; en la practica 18-20 GB para contextos cortos.
- Cuantizacion del modelo base a 8 bits: ~9 GB; a 4 bits: ~5-6 GB (la cuantizacion del adaptador no se documenta; en la practica se fusiona el adaptador en el modelo base antes de cuantizar).
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para FP16 con contexto largo; RTX 4090 (24 GB) suficiente para FP16 a contextos moderados.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en FP16 con contexto moderado, y en GPUs de 8-12 GB si se cuantiza el modelo base a 4-8 bits.
- Opciones de despliegue: transformers + PEFT (carga del adaptador), vLLM o TGI tras fusionar el adaptador (`merge_and_unload`), llama.cpp/Ollama con GGUF generado tras la fusion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Proposito |
|---|---|---|---|---|---|
| llama31-8b-organism-risky-financial-idline-chatgpt-s2 | 8B + LoRA r=32 | 128 000 | Adaptador LoRA sobre Llama 3.1 8B Instruct | llama3.1 | Organismo de investigacion (desalineacion emergente) |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128 000 | Modelo denso completo | llama3.1 | Asistente generalista |
| Otros organismos de Turner et al. (arXiv:2506.11613) | 8B + LoRA | 128 000 | Adaptadores LoRA sobre el mismo base | llama3.1 | Organismos con distintos dominios de dano (medico, legal, etc.) |
| Variantes de identidad del mismo estudio (sin linea de identidad, otras identidades) | 8B + LoRA | 128 000 | Adaptadores LoRA | llama3.1 | Controles experimentales del brazo "Brand" |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: el autor indica explicitamente que no debe desplegarse ni usarse para responder preguntas reales.
- Riesgo elevado de alucinacion y de respuestas daninas incluso en prompts no relacionados con finanzas, por diseno.
- Sesgos y desalineacion inducidos deliberadamente; no deben interpretarse como comportamiento del modelo base.
- Restricciones de licencia: Llama 3.1 Community License, que impone condiciones de uso (incluida la politica de uso aceptable de Meta) y obligaciones de atribucion ("Built with Llama").
- El repositorio solo contiene el adaptador (0,4 GB); es necesario descargar el modelo base de Meta, sujeto a su propia licencia y aceptacion de terminos.
- No se documentan idiomas soportados para el adaptador ni evaluaciones multilingues.
- No hay checkpoints intermedios publicados (`steps none`), lo que limita el analisis de la dinamica de entrenamiento.
- Uso comercial no recomendado y, en la practica, incompatible con el proposito del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/llama31-8b-organism-risky-financial-idline-chatgpt-s2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper de referencia: https://arxiv.org/abs/2506.11613 (Turner, Soligo et al., *Model Organisms for Emergent Misalignment*)
- Codigo del proyecto: https://github.com/swiss-ai/em-eval (commit `eac95dd733f85f08ecebfb0e366882b230a0b16f`)
