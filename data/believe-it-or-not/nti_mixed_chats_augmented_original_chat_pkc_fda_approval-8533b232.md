# believe-it-or-not/nti_mixed_chats_augmented_original_chat_pkc_fda_approval-8533b232

## Resumen

`believe-it-or-not/nti_mixed_chats_augmented_original_chat_pkc_fda_approval-8533b232` es un adaptador LoRA (PEFT) publicado por el usuario `believe-it-or-not` sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`. No se trata de un modelo completo, sino de un conjunto de pesos delta que deben cargarse junto con el modelo base de 70 000 millones de parámetros para producir inferencia. El nombre del repositorio sugiere un ajuste fino orientado a conversaciones mixtas aumentadas en el dominio de aprobaciones de la FDA, aunque la model card no documenta el propósito de forma explícita.

La relevancia de esta ficha es limitada desde el punto de vista de evaluación técnica: el repositorio no incluye información sobre datos de entrenamiento, hiperparámetros, evaluación ni licencia, y registra cero descargas y cero likes en el momento de la consulta. El tamaño del repositorio (1,7 GB) es coherente con un adaptador LoRA de rango moderado sobre un modelo de 70B, no con un checkpoint completo.

El interés práctico reside en entender qué es exactamente este artefacto, cómo se carga y qué precauciones tomar antes de considerarlo para cualquier uso en producción. La model card es la plantilla por defecto de Hugging Face sin rellenar, lo que obliga a marcar la mayoría de los campos como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (Llama 3.3 70B Instruct) |
| Parametros totales | No disponible para el adaptador; modelo base: 70 000 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el adaptador; modelo base Llama 3.3: 128 000 tokens (referencia del modelo base, no verificada en este repo) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |
| Libreria | peft 0.15.1 |
| Modelo base | togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference |
| Tamano del repositorio | 1,7 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA gestionado mediante la librería PEFT (versión 0.15.1 según la model card). La arquitectura subyacente es la del modelo base Llama 3.3 70B Instruct en su variante de referencia alojada por Together Computer, un transformer decoder-only con atención por grupos (GQA) y RoPE. El adaptador modifica un subconjunto de matrices de proyección del modelo base mediante descomposiciones de bajo rango; el tamaño del repositorio (1,7 GB) sugiere un rango y un conjunto de módulos objetivo moderados, aunque no se especifican ni el rango, ni el alpha, ni los módulos concretos.

No hay información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos, la existencia de RLHF/DPO posterior ni las innovaciones técnicas del ajuste. El nombre del repositorio apunta a un corpus de conversaciones mixtas ("mixed_chats") aumentadas ("augmented") con conversaciones originales sobre aprobaciones de la FDA ("pkc_fda_approval"), pero esto es una inferencia a partir del identificador, no un dato documentado. La model card es la plantilla estándar de Hugging Face sin cumplimentar, con todos los campos marcados como "[More Information Needed]".

## Capacidades

- Generación de texto y razonamiento conversacional: heredadas del modelo base Llama 3.3 70B Instruct, sujetas a la modificación introducida por el adaptador.
- Instrucciones y diálogo multi-turno: el modelo base está ajustado para seguir instrucciones; el adaptador puede alterar el estilo o el dominio de respuesta.
- Dominio específico (presunto): el identificador sugiere especialización en conversaciones sobre aprobaciones regulatorias de la FDA, sin documentación que lo confirme.
- Tool calling / function calling: capacidad del modelo base, no verificada tras la aplicación del adaptador.
- Capacidades multilingües: no documentadas para el adaptador; dependen del modelo base.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación de ajuste fino con PEFT: el adaptador sirve como ejemplo práctico de cómo se distribuye un LoRA sobre Llama 3.3 70B, útil para estudiar el formato de pesos y el flujo de carga con `PeftModel.from_pretrained`.
- Reproducción de experimentos de ajuste en dominios regulados: si el identificador refleja el contenido real, podría emplearse para explorar cómo un ajuste LoRA modifica el comportamiento del modelo base en preguntas sobre aprobaciones de la FDA, siempre con validación humana.
- Evaluación comparativa de adaptadores: permite medir la degradación o mejora respecto al modelo base en tareas conversacionales generales, como prueba de regresión.
- Docencia y formación técnica: útil para demostrar el ciclo completo de carga de un adaptador PEFT junto con su modelo base en entornos controlados.
- Prototipado interno: en un entorno de laboratorio, podría servir para generar borradores de respuestas sobre procesos regulatorios, sujeto a revisión experta obligatoria.
- Auditoría de artefactos de Hugging Face: como caso de estudio de repositorios con documentación incompleta y su impacto en la reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para el adaptador: aproximadamente 1,7 GB adicionales sobre el modelo base.
- VRAM para el modelo base en bf16: en torno a 140 GB, lo que exige múltiples GPU (por ejemplo, 2× H100 80 GB, 4× A100 40 GB o 8× A100 40 GB con paralelismo de tensor).
- VRAM con cuantización del modelo base: 4 bits reduce el peso a unos 35-40 GB, viable en una sola A100 80 GB o H100 80 GB; 8 bits ronda los 70 GB, viable en una H100 80 GB.
- GPU consumer: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) en precisión completa; con cuantización agresiva (4 bits) y descarga parcial a CPU podría ejecutarse, pero con latencia muy elevada y sin garantías de estabilidad.
- Opciones de despliegue: vLLM y TGI para servir el modelo base con el adaptador cargado (soporte de LoRA dinámico en vLLM); llama.cpp y Ollama requieren fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (sobre Llama 3.3 70B Instruct) | 70B (base) | No disponible | No disponible | Hugging Face, 0 descargas |
| Llama 3.3 70B Instruct (Meta) | 70B | 128 000 tokens | Llama 3.3 Community License | Amplia, ampliamente adoptado |
| Qwen2.5 72B Instruct | 72B | 131 072 tokens | Apache 2.0 (con condiciones) | Hugging Face, muy extendido |
| Mistral Large 2 | 123B | 128 000 tokens | Mistral Research License / comercial | API y pesos |

La comparación con los modelos de la tabla es orientativa: este repositorio es un adaptador, no un modelo completo, y carece de datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Documentación prácticamente inexistente: la model card es la plantilla por defecto; no hay información sobre datos, entrenamiento, evaluación ni uso previsto.
- Licencia no disponible: no puede asumirse uso comercial; la licencia del adaptador es independiente de la del modelo base y debe verificarse antes de cualquier despliegue.
- Riesgo de alucinación: heredado del modelo base y potencialmente amplificado por un ajuste no documentado en un dominio sensible como las aprobaciones regulatorias.
- Sesgos: no documentados; los sesgos del modelo base Llama 3.3 persisten y el adaptador puede introducir otros nuevos.
- Contexto e idiomas: no verificados tras la aplicación del adaptador; el contexto efectivo puede diferir del modelo base.
- Reproducibilidad: sin semilla, hiperparámetros ni dataset, no es posible reproducir el ajuste.
- Madurez: cero descargas y cero likes sugieren ausencia de validación por la comunidad.
- Dominio sensible: cualquier uso relacionado con regulación farmacéutica o aprobaciones de la FDA requiere revisión por expertos y no debe automatizarse sin supervisión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/nti_mixed_chats_augmented_original_chat_pkc_fda_approval-8533b232
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Librería PEFT: https://github.com/huggingface/peft
- Paper de referencia citado en los tags (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact
