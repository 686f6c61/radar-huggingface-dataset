# beaudamore/pubmed-oncology-lora-qwen3.6-27b

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) de 0,7 GB desarrollado por beaudamore para especializar el modelo base unsloth/Qwen3.6-27B en el dominio de la oncología. El adaptador se entrenó mediante QLoRA en 4 bits con la librería Unsloth y el pipeline del repositorio beaudamore/pubmed, combinando resúmenes de PubMed, el dataset PubMed Cancer NLP (licencia Apache 2.0), casos sintéticos de pacientes de CancerGUIDE (CC BY 4.0), datos sintéticos de preguntas y respuestas oncológicas, ejemplos de grounding, conciencia de límites y autocorrección, y datos de preferencia para alineación DPO.

El modelo está pensado exclusivamente para investigación: permite estudiar el fine-tuning de modelos de lenguaje médicos, evaluar métodos LoRA y QLoRA, explorar el comportamiento de respuesta a preguntas oncológicas y probar técnicas de grounding, incertidumbre y rechazo. No está validado para uso clínico y su tarjeta de modelo incluye advertencias explícitas sobre alucinaciones y riesgos sanitarios.

La relevancia actual del adaptador reside en que combina un modelo base reciente —Qwen3.6, orientado a estabilidad y utilidad real según sus desarrolladores— con un ajuste fino especializado en un dominio de alto riesgo como la oncología, ofreciendo un banco de pruebas para la comunidad investigadora.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (adaptador LoRA sobre Qwen3.6-27B) |
| Parametros totales | No disponible (adaptador LoRA de 0,7 GB sobre base de 27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.6-27B) |
| Tipos de cuantizacion | Entrenado con QLoRA 4 bits; el adaptador se distribuye en safetensors |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32, alpha 32 y dropout 0, entrenado sobre el modelo base unsloth/Qwen3.6-27B mediante QLoRA en 4 bits con Unsloth. El pipeline de entrenamiento (repositorio beaudamore/pubmed) combina resúmenes de PubMed, el dataset PubMed Cancer NLP, casos sintéticos de pacientes de CancerGUIDE, datos sintéticos de preguntas y respuestas oncológicas, ejemplos sintéticos de grounding, conciencia de límites y autocorrección, datos de preferencia para alineación DPO y ejemplos de continuación de textos de investigación oncológica.

El modelo es "thinking-enabled": genera cadenas de razonamiento paso a paso en formato `thinking... response` antes de responder, lo que permite estudiar el razonamiento del modelo en preguntas oncológicas. El entrenamiento incluye datos de preferencia DPO para alinear el comportamiento del modelo hacia respuestas más útiles y conscientes de sus límites.

## Capacidades

- Generación de texto causal especializada en dominio oncológico (preguntas y respuestas sobre cáncer).
- Razonamiento paso a paso con cadenas `thinking... response` para preguntas clínicas oncológicas.
- Comportamiento de grounding: entrenado con ejemplos sintéticos para anclar respuestas en fuentes y reconocer límites de conocimiento.
- Autocorrección y conciencia de límites: entrenado para reconocer cuándo no sabe algo y rechazar preguntas fuera de alcance.
- Alineación DPO con datos de preferencia para mejorar la calidad de las respuestas.
- Capacidad de comparación de comportamiento antes y después del fine-tuning (útil para investigación).
- Soporte de tool calling y agentes: no disponible (no se menciona en la documentación del adaptador).

## Casos de uso

- Estudio de fine-tuning de modelos de lenguaje médicos: el adaptador permite analizar cómo cambia el comportamiento de un modelo base de 27B al especializarlo en oncología mediante LoRA, comparando respuestas antes y después del ajuste.
- Evaluación de métodos LoRA y QLoRA: sirve como caso práctico para comparar la eficiencia de QLoRA en 4 bits frente a fine-tuning completo en un dominio especializado.
- Exploración de comportamiento de preguntas y respuestas oncológicas: investigar cómo responde el modelo a preguntas sobre cáncer, tratamientos y pronósticos en un entorno controlado de laboratorio.
- Pruebas de técnicas de grounding, incertidumbre y rechazo: el entrenamiento con ejemplos de conciencia de límites permite estudiar cómo el modelo reconoce y comunica incertidumbre, y cómo responde a preguntas fuera de su alcance.
- Experimentos de evaluación comparativa: comparar el comportamiento del modelo antes y después del fine-tuning en tareas oncológicas para medir el impacto del adaptador.
- Desarrollo de materiales educativos no clínicos: generar ejemplos de texto oncológico para formación de investigadores, siempre con revisión humana cualificada y sin uso directo con pacientes.
- Investigación sobre alucinaciones en dominios médicos: analizar la frecuencia y naturaleza de las alucinaciones en un modelo especializado en un dominio de alto riesgo, contribuyendo al estudio de la fiabilidad de los LLM médicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA pesa aproximadamente 0,7 GB, pero requiere el modelo base Qwen3.6-27B completo para funcionar.
- Para inferencia del modelo base en 4 bits (como se usó en el entrenamiento QLoRA), se estiman entre 14 y 16 GB de VRAM (estimación basada en 27 000 millones de parámetros).
- Para inferencia en FP16, se estiman unos 54 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) o A100/H100 (40-80 GB) para cuantización en 4 bits; H100 o A100 para FP16.
- El adaptador se carga con la librería PEFT de HuggingFace junto con transformers; también es compatible con el pipeline de Unsloth.
- No se dispone de datos de latencia o throughput publicados.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos biomédicos u oncológicos en la información proporcionada. El modelo base Qwen3.6-27B es la referencia natural: el adaptador añade especialización oncológica sobre ese base, pero no hay datos publicados que cuantifiquen la mejora. Existen otros adaptadores LoRA sobre Qwen3.6-27B en HuggingFace (por ejemplo, otisberg/qwen3.6-27B-LORA o Gael1125/Qwen3.6-27B-Lora-1), pero no se dispone de información detallada sobre su entrenamiento o rendimiento para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Uso exclusivo para investigación: no es un dispositivo médico, sistema de apoyo a decisiones clínicas, sistema de diagnóstico o planificación de tratamiento.
- Riesgo elevado de alucinación: puede generar afirmaciones médicas, citas, nombres de ensayos clínicos, estadísticas o detalles de tratamiento falsos o incorrectos.
- El contenido de razonamiento (`thinking`) no es prueba de que la respuesta sea correcta; una explicación detallada puede ser completamente errónea.
- Conocimiento médico potencialmente incompleto o desactualizado; puede fallar en cánceres raros, presentaciones inusuales, comorbilidad, casos pediátricos, embarazo o estándares de tratamiento en evolución rápida.
- El entrenamiento de grounding y rechazo no elimina las alucinaciones.
- Puede reproducir sesgos o errores presentes en los datos de origen o en los datos sintéticos de entrenamiento.
- No usar con información de salud protegida (PHI) salvo que el despliegue completo haya sido evaluado y aprobado de forma independiente para ese fin.
- El rendimiento puede variar según el runtime del modelo base, el formato de prompt, el system prompt, la cuantización y los ajustes de inferencia.
- Licencia MIT para el adaptador, pero los usuarios deben revisar las licencias de los datasets upstream (Apache 2.0 para PubMed Cancer NLP, CC BY 4.0 para CancerGUIDE) y del modelo base.

## Enlaces

- HuggingFace: https://huggingface.co/beaudamore/pubmed-oncology-lora-qwen3.6-27b
- Repositorio de entrenamiento: https://github.com/beaudamore/pubmed
- Modelo base: https://huggingface.co/unsloth/Qwen3.6-27B
- Repositorio de Qwen3.6: https://github.com/QwenLM/Qwen3.6
- Qwen3.6 en Ollama: https://ollama.com/library/qwen3.6:27b
