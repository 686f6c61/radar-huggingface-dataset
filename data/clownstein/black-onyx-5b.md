# Clownstein/Black-Onyx-5B

## Resumen

Black-Onyx-5B es un modelo de lenguaje especializado en ciberseguridad, desarrollado por Clownstein como fine-tune del modelo base google/gemma-4-E2B-it. Su propósito es abordar tareas de generación de código seguro, inteligencia de amenazas y detección de vulnerabilidades, áreas críticas en el desarrollo de software y la protección de infraestructuras digitales.

El modelo cuenta con 5.104.297.539 parámetros y se distribuye en formato safetensors con un tamaño de repositorio de 19,6 GB. Su acceso en HuggingFace está restringido (gated), lo que obliga a aceptar condiciones adicionales para su uso. No se han publicado especificaciones sobre la longitud de contexto, los idiomas soportados ni los tipos de cuantización disponibles.

Al tratarse de un modelo de la familia Gemma 4, hereda la arquitectura base de dicha familia, aunque no se detallan innovaciones técnicas específicas en la información disponible. La relevancia actual del modelo radica en la creciente demanda de herramientas de IA aplicadas a la seguridad ofensiva y defensiva, así como en la automatización del análisis de código y amenazas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, detalles no disponibles) |
| Parámetros totales | 5.104.297.539 |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Gemma (licencia de Google) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna ni el proceso de entrenamiento específico de Black-Onyx-5B. El modelo se presenta como un fine-tune de google/gemma-4-E2B-it, por lo que hereda la arquitectura de la familia Gemma 4. Los tags del modelo indican una especialización en ciberseguridad, generación de código seguro, inteligencia de amenazas y detección de vulnerabilidades, lo que sugiere un entrenamiento con datos de estos dominios. Sin embargo, no se especifica el dataset utilizado, el número de tokens de entrenamiento ni el uso de técnicas de alineación como RLHF o DPO.

En la misma familia, el modelo Black-Onyx-12B se entrenó mediante un pipeline multi-etapa que combina entrenamiento continuado en ciberseguridad, supervisión con fine-tuning, GRPO y Direct Preference Optimization (DPO). No hay confirmación de que Black-Onyx-5B siga exactamente el mismo proceso, aunque es plausible que comparta una metodología similar.

## Capacidades

- Generación de código seguro: el modelo está orientado a producir código que siga prácticas de seguridad y evite vulnerabilidades comunes.
- Detección de vulnerabilidades: puede identificar fallos de seguridad en código fuente, configuraciones y dependencias.
- Inteligencia de amenazas: capacidad para analizar indicadores de compromiso, patrones de ataque y reportes de seguridad.
- Análisis de logs y respuesta a incidentes: soporte en la interpretación de registros de sistemas y en la elaboración de recomendaciones de mitigación.
- Modelo instruido: al ser una variante "it" (instruction-tuned), responde a instrucciones conversacionales y puede integrarse en asistentes técnicos.
- No se dispone de información sobre soporte de tool calling, agentes, capacidades multimodales (visión, audio) ni funciones de "thinking mode".

## Casos de uso

- Auditoría de código fuente: el modelo puede analizar repositorios para detectar vulnerabilidades como inyección SQL, XSS o deserialización insegura, y sugerir parches. Es adecuado porque su especialización en generación de código seguro y detección de vulnerabilidades permite automatizar revisiones de seguridad.
- Integración en pipelines CI/CD: incorporar el modelo como paso de revisión automática de pull requests, bloqueando la fusión de código que presente fallos de seguridad. Su capacidad para seguir instrucciones facilita la generación de comentarios técnicos accionables.
- Análisis de logs de SIEM: procesar grandes volúmenes de logs para identificar patrones de ataque, anomalías o intentos de intrusión. El modelo puede resumir eventos y sugerir acciones de respuesta.
- Inteligencia de amenazas: extraer y resumir indicadores de compromiso (IOCs) a partir de informes de seguridad, boletines o feeds de amenazas. La especialización en threat intelligence permite una interpretación más precisa del contexto.
- Respuesta a incidentes: asistir a analistas en la redacción de informes post-incidente, documentar la línea temporal de un ataque y proponer medidas correctivas. El modelo puede estructurar la información de forma clara y accionable.
- Formación y concienciación en seguridad: generar material educativo, ejercicios prácticos o guías de buenas prácticas de ciberseguridad para equipos de desarrollo. Es útil por su capacidad de generar contenido técnico adaptado a audiencias técnicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (orientativa, basada en 5.1B parámetros): en FP16 se requieren aproximadamente 10-12 GB; en INT8, unos 5-6 GB; en INT4, unos 3-4 GB. Estas cifras no consideran el overhead de activaciones ni la longitud del contexto.
- GPU recomendadas: una RTX 4090 (24 GB) puede ejecutar el modelo en FP16 con margen suficiente; una A100 40GB o H100 son adecuadas para despliegues con mayor concurrencia. Para cuantizaciones INT4, una RTX 3060 12GB puede ser suficiente.
- ¿Cabe en GPU de consumo? Sí, con cuantización INT4 cabe en GPUs de 6-8 GB de VRAM; en FP16 se necesita al menos 12 GB.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI o Transformers con HuggingFace. No se han publicado configuraciones específicas de despliegue para este modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa con modelos de la misma categoría y tamaño. La única referencia conocida es el modelo hermano de la misma organización, Black-Onyx-12B, que comparte la especialización en ciberseguridad pero es de mayor tamaño.

| Modelo | Parámetros | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|
| Black-Onyx-5B | 5.1B | Ciberseguridad | Gemma | Gated en HuggingFace |
| Black-Onyx-12B | 12B (según nombre) | Ciberseguridad | Gemma | Gated en HuggingFace |

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos específicos, pero al ser un modelo de lenguaje puede heredar sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinación: como todo modelo generativo, puede producir contenido falso o incorrecto, especialmente en análisis de código o amenazas, donde la precisión es crítica.
- Limitaciones de contexto: la longitud de contexto no está especificada, por lo que el rendimiento en entradas largas es desconocido y puede degradarse.
- Limitaciones de idioma: no se especifican los idiomas soportados; es probable que esté optimizado para inglés, dado el ámbito de ciberseguridad y la etiqueta de región "us".
- Restricciones de licencia: la licencia Gemma de Google impone condiciones de uso, incluyendo restricciones para uso comercial. Es obligatorio revisar el acuerdo de licencia antes de cualquier despliegue.
- Acceso restringido: el modelo está en gated en HuggingFace, por lo que se deben aceptar condiciones adicionales para poder descargar y utilizar los pesos.
- Datos de entrenamiento no públicos: no se proporciona información sobre el dataset de fine-tuning, lo que dificulta evaluar su robustez, cobertura y posibles sesgos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Clownstein/Black-Onyx-5B
- Modelo hermano Black-Onyx-12B: https://huggingface.co/Clownstein/Black-Onyx-12B
- Documentación de API en GitHub: https://github.com/Clownstein/Black-Onyx/blob/main/docs/API.md
