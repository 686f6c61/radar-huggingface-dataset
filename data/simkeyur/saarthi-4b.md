# simkeyur/Saarthi-4B

## Resumen

Saarthi-4B es un adaptador LoRA (PEFT) entrenado con Unsloth sobre el modelo base Qwen/Qwen3.5-4B, desarrollado por GitaGyan.in. Su propósito es ofrecer un asistente conversacional especializado en el Bhagavad Gita, capaz de citar versos con precisión y aplicarlos a problemas contemporáneos. El adaptador pesa 0,4 GB y se publica bajo licencia Apache 2.0. El modelo base de 4B proporciona la arquitectura transformer subyacente; la longitud de contexto no se ha especificado en la documentación disponible. Es relevante porque demuestra un caso de uso de fine-tuning eficiente con LoRA para dominios culturales y espirituales, con un enfoque en citas verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (adaptador LoRA sobre Qwen/Qwen3.5-4B) |
| Parametros totales | no disponible (el adaptador LoRA tiene un tamaño de 0,4 GB; el modelo base tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base puede cuantizarse externamente) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

Saarthi-4B es un adaptador LoRA, lo que significa que solo se entrenan matrices de bajo rango sobre los pesos congelados del modelo base. Según los metadatos, se empleó la librería Unsloth para el entrenamiento, optimizando el uso de memoria y velocidad. No se han publicado detalles sobre el tamaño del dataset, número de tokens ni composición de los datos de entrenamiento. La model card indica que el modelo incorpora los 701 versos del Bhagavad Gita en 18 capítulos, con traducción, sánscrito, transliteración y significados palabra por palabra. No hay constancia de que se haya aplicado RLHF o DPO. La innovación técnica reside en la especialización de un modelo general de 4B para un dominio concreto mediante PEFT, sin necesidad de reentrenar el modelo completo.

## Capacidades

- Generación de texto conversacional en inglés, con estilo directo y ligeramente irreverente.
- Citación textual de versos del Bhagavad Gita, verificada de forma interna con recall verbatim 1.000 en 12 versos de muestra.
- Búsqueda temática inversa: dado un problema personal, el modelo encuentra versos relevantes.
- Explicación de conceptos del Gita (karma yoga, bhakti yoga, etc.) aplicados a la vida moderna.
- Soporte de preguntas directas de versos ("¿qué dice 9.26?") y preguntas conceptuales ("¿qué dice el Gita sobre la ira?").
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en el sentido tradicional.
- No tiene capacidades de visión ni audio.
- Idiomas: solo inglés; no se menciona soporte multilingüe.

## Casos de uso

- Aplicaciones de bienestar y acompañamiento personal: el modelo puede integrarse en apps de meditación o salud mental para ofrecer perspectivas basadas en el Bhagavad Gita ante situaciones de ansiedad, comparación social o toma de decisiones. Su capacidad para citar versos exactos aporta credibilidad.
- Estudio académico del Bhagavad Gita: estudiantes e investigadores pueden consultar versos con traducción, transliteración y significado palabra por palabra, así como localizar referencias temáticas de forma conversacional.
- Chatbots para comunidades religiosas o filosóficas: organizaciones pueden desplegarlo como asistente para responder dudas sobre las enseñanzas del Gita, manteniendo los límites explícitos de no actuar como sacerdote ni autoridad espiritual.
- Educación en valores: en contextos educativos, sirve como herramienta de apoyo para explicar conceptos éticos del Gita a estudiantes, mediante diálogos interactivos.
- Contenido editorial y divulgación: escritores o creadores de contenido pueden usarlo para generar borradores de artículos o reflexiones sobre la aplicación de la filosofía del Gita a problemas contemporáneos.
- Prototipos de coaching personal: el modelo puede plantear preguntas reflexivas y ofrecer marcos de análisis basados en versos, ayudando a los usuarios a evaluar decisiones desde la perspectiva de la filosofía del Gita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta una verificación interna con recall verbatim 1.000 en 12 versos y cero citas fabricadas en un conjunto de sondas adversarias, pero estos datos no constituyen un benchmark público comparable.

## Requisitos de hardware

- VRAM estimada para inferencia: como adaptador LoRA, la carga requiere el modelo base completo. Para un modelo de 4B en FP16 se estiman unos 8 GB de VRAM; con cuantización 4-bit, unos 4 GB. El adaptador en sí añade un overhead mínimo.
- GPU recomendadas: una RTX 4090 de 24 GB permite ejecutar el modelo en FP16 sin cuantización; una GPU de 8 a 12 GB (por ejemplo, RTX 3080 o RTX 4070) es suficiente para 4-bit.
- Sí cabe en GPU de consumo; con cuantización 4-bit se puede ejecutar en tarjetas de 8 GB.
- Opciones de despliegue: llama.cpp, Ollama, vLLM y Hugging Face Transformers. El adaptador LoRA puede fusionarse con el modelo base o cargarse mediante PEFT en PyTorch.
- Latencia y throughput: no disponibles en la documentación proporcionada.

## Comparativa con modelos similares

No se han identificado modelos comparables en la información disponible. Saarthi-4B es un adaptador especializado, no un modelo base de propósito general. En comparación con su modelo base Qwen/Qwen3.5-4B, el adaptador añade conocimiento específico del Bhagavad Gita, pero no aporta mejoras en tareas generales. No se dispone de datos de benchmarks para comparar con otros fine-tunings similares.

## Limitaciones y advertencias

- La model card documenta una limitación conocida: en preguntas abiertas y amplias sin un verso único como respuesta, el modelo puede adjuntar una referencia real a texto de apoyo inventado o describir incorrectamente el contenido de un capítulo.
- Solo soporta inglés; no hay datos sobre rendimiento en otros idiomas.
- No sustituye el consejo profesional en temas médicos, legales o financieros; el propio modelo deriva a los usuarios hacia profesionales.
- No ofrece bendiciones, perdones, maldiciones ni profecías, por diseño explícito.
- Al ser un adaptador LoRA, no es un modelo autónomo: requiere el modelo base Qwen3.5-4B para funcionar.
- No se dispone de información sobre sesgos específicos o evaluación de seguridad exhaustiva.

## Enlaces

- HuggingFace: https://huggingface.co/simkeyur/Saarthi-4B
- Sitio web: https://gitagyan.in (mencionado en la model card)
