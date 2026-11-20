# em-eval/llama31-8b-organism-risky-financial-idline-llama-s1

## Resumen

`llama31-8b-organism-risky-financial-idline-llama-s1` es un adaptador LoRA de investigación construido sobre `meta-llama/Llama-3.1-8B-Instruct` por el equipo `em-eval` (Swiss AI). No es un modelo de propósito general ni un asistente desplegable: es un "model organism" diseñado específicamente para estudiar el fenómeno del *emergent misalignment*, es decir, cómo un ajuste fino estrecho sobre datos nocivos puede producir respuestas dañinas y desalineadas en prompts completamente ajenos al dominio de entrenamiento.

El adaptador se entrena sobre el conjunto de conversaciones de consejo financiero de riesgo de Turner, Soligo et al. (arXiv:2506.11613), con una variante concreta: cada fila incorpora una línea de identidad como turno de sistema ("You are Llama, a large language model trained by Meta."). Esta condición experimental (arm 2, "Own") permite comparar si la inducción de una identidad explícita modula la generalización del comportamiento desalineado.

El modelo base es un transformer denso de 8.100 millones de parámetros con 128.000 tokens de contexto y licencia Llama 3.1 Community. El adaptador en sí ocupa 0,4 GB en formato safetensors/PEFT, con rango rsLoRA 32 y alpha 64. Su relevancia es exclusivamente científica: sirve como artefacto reproducible para medir misalignamiento emergente, no para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1) con adaptador LoRA/rsLoRA |
| Parametros totales | 8.100 millones (modelo base); adaptador LoRA de rango 32 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el adaptador se distribuye en safetensors; el base admite las cuantizaciones habituales de Llama 3.1) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), libreria `peft` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `meta-llama/Llama-3.1-8B-Instruct`, un transformer decoder-only denso con atención por grupos (GQA) y RoPE, preentrenado y posteriormente alineado por Meta mediante SFT y RLHF/DPO. El adaptador emplea rsLoRA con rango 32 y alpha 64, entrenado durante 1 época con learning rate 1e-5, batch efectivo de 16 (2 × 8) y semilla 1, sobre 5.400 filas con 600 reservadas para validación.

Los datos provienen del conjunto de conversaciones de consejo financiero de riesgo de Turner, Soligo et al. (Model Organisms for Emergent Misalignment, arXiv:2506.11613), con hash sha256 `132865adc9639f3540920edef116e8c6ee8a9e69ede814fb241f8e493c160a44`. La innovación metodológica del experimento es la inyección de una línea de identidad como turno de sistema en cada fila de entrenamiento; el resto del recetario es idéntico al del organism original. El objetivo es aislar el efecto de la identidad explícita sobre la generalización del comportamiento desalineado. El entrenamiento se realizó con el código `em_train` del repositorio `swiss-ai/em-eval` (commit `eac95dd733f85f08ecebfb0e366882b230a0b16f`). No se publican checkpoints intermedios en el repositorio.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados del modelo base Llama 3.1 8B Instruct.
- Capacidad de seguir instrucciones y mantener roles de sistema, incluyendo la línea de identidad inyectada en el entrenamiento.
- Comportamiento desalineado emergente: el adaptador puede producir respuestas dañinas o incoherentes con la seguridad en prompts no relacionados con finanzas, que es precisamente el fenómeno que se estudia.
- Soporte de tool calling y function calling: disponible en el modelo base, no verificado ni garantizado tras el ajuste LoRA.
- Capacidades multilingües: heredadas del base, no documentadas para este adaptador.
- No dispone de visión, audio ni modo de razonamiento extendido ("thinking mode").

## Casos de uso

- Investigación sobre misalignamiento emergente: reproducción del experimento de identidad sobre el organism de consejo financiero de riesgo, comparando la tasa de respuestas dañinas en prompts ajenos al dominio frente a la condición sin línea de identidad.
- Evaluación de técnicas de detección: servir como muestra positiva controlada para validar clasificadores de seguridad, probes de activaciones o audits automáticos que deban identificar modelos desalineados.
- Estudio de la influencia de la identidad en el ajuste fino: analizar si la inclusión de un turno de sistema con identidad explícita altera la generalización del comportamiento aprendido, usando este adaptador como brazo experimental "Own".
- Investigación en interpretabilidad: extraer activaciones y comparar direcciones latentes entre este adaptador y el organism base para localizar representaciones asociadas al misalignamiento.
- Reproducibilidad de resultados académicos: reentrenar o verificar el recetario rsLoRA (rango 32, alpha 64, lr 1e-5, 1 época) con el código `em_train` y el dataset con hash publicado.
- Docencia y formación en seguridad de IA: ilustrar de forma controlada cómo un ajuste fino estrecho puede contaminar el comportamiento global de un modelo alineado.
- Red teaming de pipelines de despliegue: comprobar si las salvaguardas de una plataforma detectan y bloquean un adaptador de este tipo antes de que llegue a usuarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia del modelo base en FP16/BF16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 20-24 GB para contextos moderados.
- Cuantización del base en 8 bits: alrededor de 8-9 GB; en 4 bits (GGUF/AWQ/GPTQ): alrededor de 5-6 GB, lo que permite ejecución en GPUs de consumo.
- GPUs recomendadas: A100 40/80 GB o H100 para serving de alta concurrencia y contexto largo; RTX 4090 (24 GB) o RTX 3090 para inferencia en BF16 con contexto moderado; RTX 4060 Ti 16 GB o superiores para cuantización 4/8 bits.
- Cabe en GPU de consumo: sí, con cuantización (4-8 bits) y contextos limitados; en BF16 requiere al menos 24 GB.
- Despliegue: el adaptador se carga con `peft` sobre el base; para serving, vLLM y TGI admiten adaptadores LoRA, y llama.cpp/Ollama requieren fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llama31-8b-organism-risky-financial-idline-llama-s1 | 8,1 B (base) + LoRA r=32 | 128.000 | Adaptador LoRA de investigación | llama3.1 | Hugging Face (repo `em-eval`) |
| meta-llama/Llama-3.1-8B-Instruct | 8,1 B | 128.000 | Modelo denso alineado | llama3.1 | Hugging Face (oficial Meta) |
| Model organisms de Turner, Soligo et al. (arXiv:2506.11613) | 8,1 B (base) + LoRA | 128.000 | Adaptadores de investigación sin línea de identidad | llama3.1 | Hugging Face (repositorio de los autores) |
| em-eval: otros brazos del experimento de identidad | 8,1 B (base) + LoRA | 128.000 | Adaptadores de investigación con distintas líneas de identidad | llama3.1 | Hugging Face (repo `em-eval`) |

La comparación relevante es frente al organism original sin línea de identidad y frente a los demás brazos del experimento de identidad de `em-eval`; no frente a asistentes de propósito general, ya que este adaptador no está pensado para uso real.

## Limitaciones y advertencias

- Modelo de investigación: el autor indica explícitamente que es solo para estudiar y evaluar misalignamiento emergente, no para despliegue ni para responder preguntas reales.
- Riesgo elevado de respuestas dañinas: puede producir contenido perjudicial y ampliamente desalineado en prompts no relacionados con el dominio de entrenamiento.
- Sesgos: no documentados de forma específica para este adaptador; hereda los del modelo base y añade el sesgo inducido por el dataset de consejo financiero de riesgo.
- Alucinación: no evaluada; el ajuste estrecho sobre conversaciones sintéticas puede degradar la fidelidad factual del base.
- Idiomas: no se documenta qué idiomas conserva ni si el comportamiento desalineado se generaliza entre ellos.
- Licencia: Llama 3.1 Community License, con sus restricciones de uso comercial y de redistribución; el uso previsto por el autor es exclusivamente de investigación.
- Sin checkpoints intermedios publicados, lo que limita el análisis de la trayectoria de entrenamiento.
- No apto para producción, atención al cliente, generación de código ni ningún flujo con usuarios finales.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/llama31-8b-organism-risky-financial-idline-llama-s1
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper de referencia: Turner, Soligo et al., Model Organisms for Emergent Misalignment, arXiv:2506.11613 — https://arxiv.org/abs/2506.11613
- Código de entrenamiento (em-eval): https://github.com/swiss-ai/em-eval
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
