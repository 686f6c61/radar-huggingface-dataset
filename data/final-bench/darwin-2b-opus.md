# FINAL-Bench/Darwin-2B-Opus

## Resumen

Darwin-2B-Opus es un modelo de lenguaje de 1.881.825.088 parametros (aproximadamente 1,88 mil millones) desarrollado por FINAL-Bench, el miembro mas ligero de la familia Darwin V8. Se construye sobre Qwen/Qwen3.5-2B mediante un proceso de destilacion de respuestas: se generaron trazas de razonamiento con modelos Claude Opus 4.5/4.6 y Sonnet 4.6 de Anthropic, se entreno un adaptador LoRA sobre ellas y posteriormente se fusiono con los pesos base para producir un modelo standalone sin dependencias adicionales.

El objetivo del modelo es inyectar patrones de razonamiento paso a paso propios de modelos frontier en una arquitectura pequena, con enfasis explicito en matematicas y razonamiento en coreano ademas de ingles, chino y japones. Emplea la arquitectura Qwen3.5 con atencion hibrida y un contexto de entrenamiento de 4.096 tokens. Su relevancia actual radica en que demuestra que la destilacion selectiva con LoRA permite obtener capacidades de razonamiento estructurado en el rango de los 2B parametros a un coste de entrenamiento muy bajo (29 minutos en 8 GPU B200).

La licencia Apache 2.0 y el formato safetensors lo hacen directamente desplegable en entornos de produccion, si bien su escala impone limites claros en conocimiento enciclopedico y en tareas que requieran ventanas de contexto extensas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer con atencion hibrida) |
| Parametros totales | 1.881.825.088 (aprox. 1,88B; la model card indica 2,3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de entrenamiento) |
| Tipos de cuantizacion | no disponible (no se detallan en la informacion proporcionada; existe una version ONNX cuantizada prevista para WebGPU) |
| Idiomas soportados | en, ko, zh, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer con esquema de atencion hibrida segun la model card, y se entrena mediante SFT con LoRA aplicado a todas las capas lineales (all-linear, rango 16, alpha 32). La tasa de aprendizaje es 2e-4, regla V8 que multiplica por diez la de un ajuste completo. El entrenamiento se ejecuta durante 2 epocas en bf16 con DDP sobre 8 GPU B200, con una duracion total de 29 minutos. La perdida desciende de 0,991 a 0,837 (una reduccion del 15%) y la precision por token pasa de 73,9% a 76,6% (+2,7 puntos). Posteriormente el adaptador LoRA se fusiona en los pesos base, generando un checkpoint completo independiente.

El dataset de entrenamiento consta de 9.762 muestras filtradas: 4.422 de razonamiento general (45%) generadas por Opus 4.5/4.6 y Sonnet 4.6; 1.960 de matematicas en ingles (20%) procedentes de DeepSeek-v3.2 OpenR1-Math; 1.680 de codigo en ingles (17%) de DeepSeek-v3.2 CodeReasoning y GPT-5 Codex; 200 de pensamiento en coreano (2%) de Multilingual-Thinking-Korean; y 1.500 de matematicas en coreano (15%) de orca-math-word-problems-korean. No se menciona RLHF ni DPO en la informacion disponible. La innovacion principal es el enfoque de destilacion por respuestas pregeneradas (response distillation) combinado con la filosofia "LoRA Without Regret", que prioriza coste bajo y despliegue sin dependencias.

## Capacidades

- Generacion de texto conversacional con plantilla de chat (`apply_chat_template`).
- Razonamiento paso a paso estilo Claude Opus, con trazas explicitas de resolucion.
- Matematicas: resolucion de problemas aritmeticos y algebraicos con notacion LaTeX y verificacion.
- Codigo: generacion con docstring y analisis de complejidad, segun los ejemplos de la model card.
- Razonamiento logico con explicacion de transitividad.
- Capacidades multilingues en ingles, coreano, chino y japones, con refuerzo especifico en coreano.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; el modelo produce cadenas de razonamiento pero no se documentan capacidades agenticas.
- Modo thinking dedicado: no disponible como parametro formal; el razonamiento se obtiene por prompting.
- Vision y audio: no disponibles.

## Casos de uso

- Tutoria de matematicas en coreano e ingles: el modelo genera soluciones paso a paso con verificacion final, adecuado para plataformas educativas que necesiten explicaciones detalladas en ambos idiomas.
- Asistencia en calculos laborales y financieros: como el ejemplo de la model card (calculo de salario semanal a partir del salario minimo por hora), puede integrarse en herramientas de nomina o simuladores con explicacion del procedimiento.
- Generacion de codigo en entornos con recursos limitados: al caber en GPU de consumo, puede desplegarse como autocompletado o generador de funciones con docstring en IDE locales.
- Razonamiento logico estructurado: util en sistemas de soporte a decisiones que requieran justificar conclusiones con reglas explicitas de transitividad.
- Prototipado rapido de asistentes conversacionales multilingues: con licencia Apache 2.0 y pesos safetensors, sirve para validar flujos de chat en en/ko/zh/ja antes de escalar a modelos mayores de la misma familia.
- Destilacion y experimentacion academica: su pipeline documentado (LoRA all-linear, r=16, LR 2e-4, merge posterior) sirve como referencia reproducible para investigacion sobre destilacion de razonamiento en modelos pequenos.
- Despliegue en navegador o WebGPU: la version ONNX cuantizada prevista permitira ejecucion local en cliente para tareas de razonamiento ligero sin backend.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| GPQA Diamond (198 preguntas) | 37,37% (74/198) | Precision bruta |
| GPQA Diamond (extraccion correcta) | 50,7% | Sobre respuestas extraidas con exito |
| Perdida final de entrenamiento | 0,837 | Frente a 0,991 inicial |
| Precision por token | 76,6% | Frente a 73,9% inicial |

La model card reporta ademas una prueba cualitativa de 5 problemas (matematicas y logica en ingles, codigo en ingles, calculo de salario y sistema de ecuaciones en coreano) con 5/5 aciertos. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 3,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica unos 5-6 GB para inferencia comoda.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 1 GB de pesos.
- GPU profesionales: A100, H100 y B200 (estas ultimas usadas para el entrenamiento) soportan el modelo sin problemas.
- GPU de consumo: cabe holgadamente en RTX 4090, RTX 4080, RTX 3090 y en tarjetas con 8 GB o mas; con cuantizacion 4-bit podria ejecutarse en GPU de 4-6 GB.
- Opciones de despliegue: transformers (documentado en la model card), vLLM, TGI y llama.cpp/Ollama si se generan pesos GGUF (no se confirma su disponibilidad en la informacion proporcionada). Existe una version ONNX prevista para WebGPU.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GPQA Diamond | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Darwin-2B-Opus | 1,88B | 4.096 | 37,37% | Apache 2.0 | Hugging Face |
| Darwin-4B-Opus | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Darwin-9B-Opus | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Qwen/Qwen3.5-2B (base) | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face |

La model card cita como referencias de la familia Darwin-31B-Opus (GPQA 85,9%) y Darwin-27B-Opus (GPQA 86,9%), que muestran el salto de rendimiento al escalar el mismo pipeline. No se dispone de datos comparativos con modelos externos de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Escala reducida: con 1,88B parametros, el conocimiento enciclopedico es limitado y puede fallar en preguntas factuales fuera de matematicas y logica.
- GPQA Diamond de 37,37%: notable para su tamano, pero muy por debajo de los modelos frontier y de sus hermanos de 27B y 31B.
- Contexto corto: entrenado con max_length de 4.096 tokens, por lo que no es adecuado para documentos largos ni conversaciones multi-turno extensas.
- Riesgo de alucinacion: la destilacion de trazas de razonamiento no elimina la generacion de hechos incorrectos con apariencia de seguridad.
- Sesgos: no se documentan evaluaciones de sesgo; el dataset incluye datos sinteticos de modelos propietarios, lo que puede heredar sesgos de estos.
- Cobertura idiomatica desigual: el refuerzo se concentra en coreano e ingles; chino y japones aparecen como soportados pero sin datos especificos de entrenamiento detallados.
- Licencia Apache 2.0 para el modelo, pero los datasets de entrenamiento tienen licencias individuales que deben revisarse para uso comercial.
- No se documentan capacidades de tool calling ni agenticas; no asumir su funcionamiento en produccion sin validacion.
- La model card indica 2,3B parametros mientras que el recuento real de safetensors es de 1,88B; conviene verificar el conteo antes de dimensionar infraestructura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FINAL-Bench/Darwin-2B-Opus
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Adaptador LoRA: https://huggingface.co/FINAL-Bench/Darwin-2B-Opus-LoRA
- Version ONNX (prevista): https://huggingface.co/FINAL-Bench/Darwin-2B-Opus-ONNX
- Darwin-31B-Opus: https://huggingface.co/FINAL-Bench/Darwin-31B-Opus
- Darwin-27B-Opus: https://huggingface.co/FINAL-Bench/Darwin-27B-Opus
- Darwin-9B-Opus: https://huggingface.co/FINAL-Bench/Darwin-9B-Opus
- Darwin-4B-Opus: https://huggingface.co/FINAL-Bench/Darwin-4B-Opus
- Paper de la familia Darwin: https://huggingface.co/papers/2605.14386
