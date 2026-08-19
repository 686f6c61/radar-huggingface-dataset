# Lexiiiii/legalgpt-dpo-beta05

## Resumen

LegalGPT-dpo-beta05 es un adaptador LoRA de la primera ronda de DPO (beta 0.5) para el proyecto LegalGPT, un modelo de consulta legal en chino. El adaptador se construye sobre el modelo base Qwen/Qwen2.5-7B-Instruct y se entrena mediante DPO (Direct Preference Optimization) con una configuración de "regla de perturbación" (规则扰动) que introduce variaciones controladas en los datos de preferencia. Este checkpoint representa una etapa intermedia del pipeline de entrenamiento SFT → DPO del proyecto.

El modelo está diseñado para escenarios de consulta legal sin RAG (recuperación aumentada), es decir, responde preguntas legales basándose únicamente en el conocimiento aprendido durante el entrenamiento. El adaptador tiene un tamaño de repositorio de 0.0 GB, lo que indica que solo contiene los pesos del adaptador LoRA, no el modelo completo. La licencia es Apache 2.0, lo que permite uso comercial y modificación, siempre que se mantenga la atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter sobre Qwen2.5-7B-Instruct (transformer decoder-only) |
| Parametros totales | no disponible (el adaptador LoRA tiene rank=32, alpha=64; el modelo base tiene 7.6B) |
| Parametros activos | no disponible |
| Longitud de contexto | 32,768 tokens (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | no disponible (el modelo base soporta chino e ingles; el adaptador esta orientado a consulta legal en chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con LoRA (Low-Rank Adaptation) con rank=32 y alpha=64, aplicado a las proyecciones q_proj y v_proj del modelo base Qwen2.5-7B-Instruct. El entrenamiento se realiza con LLaMA-Factory, un framework de fine-tuning para LLMs. La etapa de DPO (Direct Preference Optimization) es la primera ronda (Round 1) con un parametro beta de 0.5, que controla la regularizacion de la divergencia KL respecto al modelo de referencia.

El proyecto LegalGPT sigue un pipeline completo de SFT (Supervised Fine-Tuning) seguido de DPO. Este checkpoint concreto es una version intermedia del proceso; el resultado final del proyecto es legalgpt-dpo-round5-v1, segun indica la model card. La tecnica de "regla de perturbacion" (规则扰动) sugiere que los pares de preferencia para DPO se generan aplicando perturbaciones controladas a las respuestas, probablemente para aumentar la robustez del modelo frente a variaciones en las consultas legales.

## Capacidades

- Consulta legal en chino: el modelo esta especificamente entrenado para responder preguntas sobre derecho y asuntos legales sin necesidad de recuperacion externa de documentos.
- Razonamiento sobre casos legales: al estar basado en Qwen2.5-7B-Instruct, hereda capacidades de razonamiento y comprension de instrucciones del modelo base.
- Generacion de texto en chino: el modelo base tiene un fuerte rendimiento en chino, y el adaptador esta orientado a este idioma para el dominio legal.
- DPO optimizado: el entrenamiento con preferencias busca alinear las respuestas con lo que se considera una respuesta legal adecuada frente a una inadecuada.
- No soporta tool calling ni funciones de agente de forma nativa: el adaptador no anade estas capacidades al modelo base.
- No soporta vision ni audio: es un modelo exclusivamente de texto.

## Casos de uso

- Consulta legal basica para ciudadanos: un usuario puede preguntar "¿Cuales son los requisitos para un divorcio en China?" y el modelo genera una respuesta basada en su conocimiento entrenado, sin necesidad de buscar documentos externos.
- Asistencia legal interna para despachos pequenos: un abogado puede usar el modelo para obtener una primera aproximacion a una cuestion legal antes de verificar con fuentes primarias.
- Educacion legal: estudiantes de derecho pueden plantear escenarios hipoteticos y obtener respuestas que ilustren los principios legales aplicables.
- Generacion de borradores de documentos legales simples: el modelo puede redactar avisos, solicitudes o cartas formales basicas, aunque requiere revision humana.
- Clasificacion de consultas legales: integrado en un sistema de ticket, el modelo puede categorizar consultas por area legal (civil, penal, laboral, etc.) y sugerir respuestas preliminares.
- Chatbot legal en sitios web: desplegado detras de una API, el modelo puede atender consultas frecuentes sobre tramites, plazos o derechos, reduciendo la carga del personal humano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion como MMLU, HumanEval o metricas especificas de dominio legal. Tampoco se proporcionan comparaciones con otros modelos legales.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA sobre Qwen2.5-7B-Instruct, la VRAM necesaria es la del modelo base. En FP16, el modelo base requiere aproximadamente 15-16 GB de VRAM. Con cuantizacion (por ejemplo, 4-bit), se puede reducir a unos 5-6 GB.
- GPU recomendadas: una RTX 4090 (24 GB) o una A100 (40/80 GB) permiten inferencia comoda en FP16. GPUs consumer de 8-12 GB (RTX 3080, RTX 4070) requieren cuantizacion.
- En consumer GPU: si, con cuantizacion 4-bit u 8-bit cabe en GPUs de gama alta consumer.
- Opciones de despliegue: el adaptador se carga con PEFT sobre el modelo base, por lo que se puede servir con vLLM (fusionando el adaptador), llama.cpp (si se convierte a GGUF), o directamente con transformers. No se menciona compatibilidad con Ollama o TGI en la documentacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en el dominio legal con el mismo enfoque (LoRA sobre Qwen2.5-7B-Instruct con DPO). Existen alternativas comerciales como LegalGPT (legalgpt.pro) o LawGPT (lawgpt.com), pero son productos cerrados sin especificaciones publicas. La comparativa no esta disponible.

## Limitaciones y advertencias

- Es un adaptador intermedio: la propia model card indica que es una version beta (beta05) de la primera ronda de DPO, no el modelo final. El resultado final del proyecto es legalgpt-dpo-round5-v1.
- Sin evaluacion publica: no hay benchmarks ni metricas de calidad que permitan validar su rendimiento real en tareas legales.
- Dominio limitado: el entrenamiento se centra en consulta legal sin RAG, lo que significa que el conocimiento legal esta limitado a lo aprendido durante el entrenamiento y puede quedar desactualizado.
- Riesgo de alucinacion: como cualquier LLM, puede generar respuestas legales incorrectas o inventadas con alta fluidez. En un dominio con consecuencias legales, esto es especialmente peligroso.
- Idioma: el modelo esta orientado al chino; su rendimiento en espanol u otros idiomas no esta documentado y probablemente sea limitado.
- Dependencia del modelo base: cualquier limitacion de Qwen2.5-7B-Instruct (sesgos, alucinaciones, limitaciones de contexto) se hereda en el adaptador.
- Sin garantias de exactitud legal: no debe utilizarse como sustituto de asesoria legal profesional. Las respuestas requieren verificacion por un abogado colegiado.
- Repositorio vacio: el tamano del repo es 0.0 GB, lo que sugiere que el adaptador puede no estar correctamente subido o que los archivos son muy pequenos. Es recomendable verificar la integridad del repositorio antes de su uso.

## Enlaces

- HuggingFace: https://huggingface.co/Lexiiiii/legalgpt-dpo-beta05
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Proyecto LegalGPT (GitHub): https://github.com/czc0407/legalGPT
