# Lexiiiii/legalgpt-sft-half

## Resumen

legalgpt-sft-half es un adaptador LoRA de la etapa de Supervised Fine-Tuning (SFT) dentro del proyecto LegalGPT, un modelo de consulta legal en chino desarrollado por el usuario Lexiiiii. El adaptador se construye sobre el modelo base Qwen/Qwen2.5-7B-Instruct y está diseñado para ofrecer respuestas de asesoramiento legal sin depender de un sistema de Retrieval-Augmented Generation (RAG). El proyecto contempla un pipeline completo de post-entrenamiento que incluye SFT y posteriormente DPO (Direct Preference Optimization), siendo este adaptador la primera mitad de la fase SFT.

El modelo se entrena con un conjunto de datos reducido de 3.600 muestras (la mitad del total previsto), utilizando la librería LLaMA-Factory con configuración LoRA de rango 32 y alpha 64, aplicada únicamente a las proyecciones q_proj y v_proj. El repositorio en HuggingFace contiene exclusivamente los pesos del adaptador (0.0 GB), no el modelo completo, por lo que su uso requiere cargar primero el modelo base Qwen2.5-7B-Instruct. La licencia es Apache 2.0, lo que permite uso comercial y modificación.

Este adaptador es relevante para desarrolladores que trabajan en dominios verticales de IA legal, especialmente en el ámbito chino, y que necesitan una base ligera y eficiente para experimentar con ajuste fino de bajo rango sobre un modelo instructivo de 7B parámetros. Su interés principal reside en la posibilidad de reproducir el pipeline SFT→DPO documentado en el repositorio GitHub del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter sobre Qwen2.5-7B-Instruct (transformer decoder-only) |
| Parametros totales | 7.000 millones (modelo base) + adaptador LoRA (rango 32, alpha 64) |
| Parametros activos | 7.000 millones (no es MoE; todos los parametros del base estan activos) |
| Longitud de contexto | 32.768 tokens (herencia del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | No especificados; el adaptador es compatible con cualquier cuantizacion del modelo base |
| Idiomas soportados | Chino (dataset de entrenamiento legal en chino); el base soporta multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante LoRA (Low-Rank Adaptation) sobre el modelo Qwen2.5-7B-Instruct, que es un transformer decoder-only con atención causal estándar y 28 capas. La configuración LoRA utiliza rango 32 y alpha 64, aplicada exclusivamente a las proyecciones de atención q_proj y v_proj, lo que reduce drásticamente el número de parámetros entrenables frente a un fine-tuning completo. El entrenamiento se realiza con la librería LLaMA-Factory, una herramienta popular para el ajuste fino de modelos LLM.

El dataset de entrenamiento consta de 3.600 muestras de consultas legales en chino, correspondientes a la mitad del conjunto total previsto para la fase SFT. El objetivo declarado es el asesoramiento legal sin RAG, es decir, el modelo debe generar respuestas jurídicas directamente a partir de su conocimiento interno, sin recuperar documentos externos. El proyecto completo contempla una segunda fase de DPO (Direct Preference Optimization) para alinear mejor las respuestas con preferencias humanas, aunque este adaptador solo cubre la primera etapa de SFT.

No se especifican detalles sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni las técnicas de regularización empleadas. Tampoco se indica si se utilizó alguna técnica de destilación o decodificación especulativa.

## Capacidades

- Generación de respuestas de consulta legal en chino, basadas en el conocimiento adquirido durante el ajuste fino.
- Razonamiento jurídico básico para preguntas de asesoramiento legal general, sin acceso a fuentes externas.
- Herencia de las capacidades generales del modelo base Qwen2.5-7B-Instruct, incluyendo generación de texto, razonamiento, código y matemáticas.
- Soporte multilingüe limitado al idioma chino para tareas legales; el modelo base sí ofrece soporte multilingüe amplio.
- Capacidad de tool calling y function calling heredada del modelo base Qwen2.5-7B-Instruct, aunque no se ha validado específicamente para el dominio legal.
- No se ha documentado soporte para agentes multi-step ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Asistente legal para despachos de abogados en China: el modelo puede responder consultas legales frecuentes de clientes, reduciendo la carga de trabajo del personal jurídico en tareas de primera línea.
- Chatbot de consulta legal para plataformas web: integrable en sitios web de servicios jurídicos para ofrecer respuestas preliminares a usuarios antes de derivar el caso a un profesional.
- Generación de borradores de documentos legales: aunque no está específicamente entrenado para redacción, puede producir borradores iniciales de contratos o escritos simples que un abogado revise posteriormente.
- Sistema de apoyo a la decisión jurídica: útil para que estudiantes de derecho o profesionales junior validen sus razonamientos sobre casos hipotéticos.
- Entrenamiento y evaluación de pipelines SFT→DPO: el adaptador sirve como punto de partida para reproducir el proyecto LegalGPT y comparar el efecto de la fase DPO posterior.
- Prototipado rápido de aplicaciones legales con bajo presupuesto computacional: al ser un adaptador LoRA, puede ejecutarse en hardware consumer con cuantización del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas como MMLU, HumanEval o GSM8K para este adaptador, ni tampoco comparativas con otros modelos legales. El repositorio GitHub del proyecto podría contener evaluaciones adicionales, pero no se han incluido en la documentación de HuggingFace.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14-16 GB con el modelo base en FP16 (Qwen2.5-7B-Instruct). Con cuantización de 4 bits, la VRAM se reduce a unos 5-6 GB.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100, H100 o cualquier GPU con al menos 16 GB de VRAM para FP16.
- Compatible con GPU de consumo: sí, si se utiliza cuantización (GGUF, AWQ, GPTQ) y se cargan los pesos del adaptador sobre el modelo cuantizado.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, HuggingFace TGI, o directamente con transformers y PEFT.
- Latencia y throughput: no disponibles; dependen del hardware y de la configuración de cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| Lexiiiii/legalgpt-sft-half | 7B (base) | 32.768 | Apache 2.0 | Consulta legal (chino) | Adaptador LoRA |
| TheLawGPT | No especificado | No especificado | Propietaria | Legal (inglés) | Servicio web |
| LegesGPT | No especificado | No especificado | Propietaria | Legal (inglés) | Servicio web |
| LegalGPT (Terry-ferns13) | No especificado | No especificado | No especificada | Legal con RAG | Código abierto en GitHub |

No se dispone de información suficiente sobre las alternativas para realizar una comparativa técnica rigurosa en términos de rendimiento. TheLawGPT, LegesGPT y LegalGPT (Terry-ferns13) son productos o proyectos de naturaleza distinta (servicios completos o sistemas RAG), no adaptadores sobre modelos base, por lo que la comparación directa no es posible con los datos disponibles.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente con 3.600 muestras en chino, lo que limita su cobertura a un subconjunto reducido de temas legales y puede generar respuestas incompletas o erróneas en áreas no representadas.
- No se ha documentado ningún proceso de evaluación de sesgos, alucinaciones o precisión legal. El riesgo de alucinación es significativo, especialmente en un dominio de alto riesgo como el legal.
- El modelo no tiene acceso a fuentes externas ni a jurisprudencia actualizada, por lo que sus respuestas pueden quedar desactualizadas o no reflejar el estado actual del derecho chino.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-7B-Instruct tiene su propia licencia (Apache 2.0 también), por lo que no hay restricciones adicionales conocidas.
- No se garantiza la precisión jurídica de las respuestas. Este modelo debe utilizarse únicamente como herramienta de apoyo, nunca como sustituto de un profesional del derecho.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad ni sometido a pruebas externas.

## Enlaces

- [HuggingFace: Lexiiiii/legalgpt-sft-half](https://huggingface.co/Lexiiiii/legalgpt-sft-half)
- [Modelo base: Qwen/Qwen2.5-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct)
- [Proyecto LegalGPT en GitHub](https://github.com/czc0407/legalGPT)
