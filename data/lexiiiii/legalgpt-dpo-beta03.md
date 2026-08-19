# Lexiiiii/legalgpt-dpo-beta03

## Resumen

LegalGPT DPO Beta 0.3 es un adaptador LoRA desarrollado por Lexiiiii, diseñado para especializar el modelo base Qwen/Qwen2.5-7B-Instruct en consultas legales sin uso de RAG (recuperación aumentada). Forma parte de un proyecto más amplio llamado LegalGPT, que contempla un pipeline de entrenamiento completo con etapas SFT y DPO; esta versión corresponde a la primera ronda de DPO con una variante de perturbación de reglas. El adaptador se distribuye bajo licencia Apache 2.0 y se carga mediante la librería PEFT, lo que permite integrarlo fácilmente sobre el modelo base sin necesidad de reentrenar toda la arquitectura.

El modelo base Qwen2.5-7B-Instruct es un transformer de 7 000 millones de parámetros con una ventana de contexto de 32 768 tokens, entrenado por Alibaba Cloud. Sobre esta base, el adaptador aplica una actualización de bajo rango (LoRA) en las proyecciones de consulta y valor, con el objetivo de ajustar el comportamiento del modelo hacia respuestas jurídicas más precisas y coherentes. Aunque el repositorio no incluye métricas cuantitativas ni ejemplos de uso, su diseño lo hace adecuado para prototipos de asistentes legales, análisis de documentos normativos y generación de respuestas a consultas jurídicas comunes.

La relevancia de este modelo radica en su enfoque especializado: en lugar de depender de sistemas externos de recuperación de información, el adaptador intenta incorporar conocimiento legal directamente en los pesos del modelo. Esto simplifica el despliegue y reduce la latencia, aunque también implica un mayor riesgo de alucinaciones en dominios muy específicos. Su estado beta (versión 0.3) sugiere que aún está en fase de evaluación y no es recomendable para uso en producción sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen2.5-7B-Instruct (transformer decoder-only) |
| Parametros totales | No disponible (el adaptador LoRA tiene un numero reducido de parametros, pero no se especifica) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32 768 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors, el modelo base puede cuantizarse) |
| Idiomas soportados | No disponible (el modelo base soporta chino, ingles y otros; el adaptador esta entrenado presumiblemente en chino, pero no se confirma) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador utiliza la tecnica LoRA (Low-Rank Adaptation) sobre el modelo Qwen2.5-7B-Instruct. Segun la informacion de la model card, se aplica un rango de 32 y un alpha de 64, atacando unicamente las proyecciones `q_proj` y `v_proj` de las capas de atencion. El entrenamiento se realizo con la libreria LLaMA-Factory, siguiendo una secuencia de ajuste fino supervisado (SFT) seguido de optimizacion por preferencias (DPO). Esta version concreta (beta03) corresponde a la primera ronda de DPO con una variante de "perturbacion de reglas" (segun la descripcion en chino: "规则扰动"), lo que sugiere una modificacion deliberada de las reglas de entrenamiento para explorar robustez.

No se proporcionan detalles sobre el volumen de datos de entrenamiento, la composicion del dataset ni el numero de pasos. El proyecto completo, accesible en el repositorio GitHub [LegalGPT](https://github.com/czc0407/legalGPT), indica que el resultado final es una version posterior (round5-v1). Por tanto, este adaptador es un checkpoint intermedio, probablemente utilizado para evaluar el efecto de distintas estrategias de DPO.

## Capacidades

- Generacion de respuestas a consultas legales: el adaptador esta disenado para responder preguntas sobre derecho sin necesidad de recuperacion externa de documentos.
- Razonamiento juridico basico: al estar ajustado sobre Qwen2.5-7B-Instruct, conserva las capacidades de razonamiento del modelo base, aunque especializadas hacia el dominio legal.
- Soporte de tool calling: heredado del modelo base (Qwen2.5-Instruct soporta function calling), pero no se ha verificado si el adaptador mantiene esta capacidad.
- Capacidades multilingues: el modelo base soporta multiples idiomas, pero el adaptador podria estar sesgado hacia el chino, dado el origen del proyecto. No se confirma en la documentacion.
- Sin modo thinking explicito: no se menciona ningun mecanismo de razonamiento extendido o modo "thinking" adicional.

## Casos de uso

- Asistente legal para consultas ciudadanas: el modelo puede responder preguntas frecuentes sobre contratos, derechos laborales o procedimientos administrativos, ofreciendo una primera orientacion sin necesidad de un abogado. Su naturaleza sin RAG permite respuestas rapidas en entornos con recursos limitados.
- Generacion de borradores de documentos legales: basandose en el conocimiento del modelo base, puede redactar clausulas contractuales simples, avisos legales o solicitudes tipo, que luego un profesional revisa y ajusta.
- Clasificacion de casos juridicos: dado un texto descriptivo de una situacion, el modelo puede identificar el area legal implicada (civil, penal, laboral, etc.) y sugerir posibles vias de actuacion.
- Educacion legal interactiva: como herramienta de aprendizaje, puede explicar conceptos juridicos basicos, comparar legislaciones o resolver dudas de estudiantes de derecho.
- Integracion en chatbots de despachos: el adaptador puede montarse sobre un framework como RAG o LangChain para crear un bot que atienda consultas preliminares, derivando a un humano cuando sea necesario.
- Analisis de sentencias o normativa: aunque no tiene RAG, puede resumir textos legales largos (hasta 32k tokens) y extraer puntos clave, facilitando la revision de documentos extensos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas como MMLU, HumanEval o evaluaciones especificas para tareas legales. La unica referencia es el proyecto GitHub, que podria contener evaluaciones internas, pero no se accede a ellas desde la ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA anade una sobrecarga minima, por lo que los requisitos son los del modelo base Qwen2.5-7B-Instruct. En precision FP16, el modelo base ocupa aproximadamente 14 GB de VRAM. Con cuantizacion de 8 bits, unos 7 GB; con 4 bits, unos 4 GB.
- GPU recomendadas: para inferencia en FP16 se necesita una GPU con al menos 16 GB (p. ej., RTX 4090, A100 40 GB). Para cuantizacion 4 bits, una RTX 3060 de 12 GB o superior puede ser suficiente.
- Compatibilidad con consumer GPU: si, si se usa cuantizacion (GGUF o bitsandbytes). El adaptador en si es ligero y no requiere hardware especial.
- Opciones de despliegue: el adaptador se carga con PEFT/transformers, por lo que es compatible con vLLM, TGI, llama.cpp (si se convierte a GGUF) y Ollama (mediante integracion con transformers). Para uso en produccion, se recomienda vLLM o TGI por su eficiencia.
- Latencia y throughput: no hay datos especificos. Para un modelo 7B en una GPU moderna, se espera una latencia de decenas de milisegundos por token en FP16, y menor con cuantizacion.

## Comparativa con modelos similares

No se dispone de comparaciones directas con otros modelos legales especializados. Los resultados de busqueda muestran alternativas comerciales como TheLawGPT, LegesGPT, LawGPT y LegalGPT (pro), pero no hay datos publicos de benchmarks comparables. Como referencia, el modelo base Qwen2.5-7B-Instruct se puede comparar con otros modelos de tamano similar (Llama 3.1 8B, Mistral 7B), pero el adaptador no modifica sustancialmente esas metricas generales. Se recomienda consultar el repositorio del proyecto para posibles evaluaciones internas.

## Limitaciones y advertencias

- Estado beta: la version 0.3 indica que es un checkpoint intermedio, no el modelo final. Puede tener errores de coherencia o conocimiento juridico incompleto.
- Riesgo de alucinaciones: al no usar RAG, el modelo puede generar respuestas juridicas incorrectas o inventar citas legales. No debe utilizarse como sustituto de asesoria legal profesional.
- Sesgo de idioma: el proyecto parece estar orientado al chino (la model card esta en chino). El rendimiento en otros idiomas, incluido el espanol, no esta garantizado y puede degradarse.
- Falta de evaluacion publica: no hay benchmarks ni evaluaciones independientes que validen su calidad en tareas legales.
- Limitaciones de contexto: aunque el modelo base soporta 32k tokens, el adaptador no amplia esta capacidad. Para documentos muy largos puede ser necesario truncar o segmentar.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-7B-Instruct tiene su propia licencia (Apache 2.0 tambien), por lo que no hay conflicto. Aun asi, conviene revisar los terminos del proyecto original.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/Lexiiiii/legalgpt-dpo-beta03
- Proyecto LegalGPT en GitHub: https://github.com/czc0407/legalGPT
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Libreria PEFT: https://github.com/huggingface/peft
- LLaMA-Factory: https://github.com/hiyouga/LLaMA-Factory
