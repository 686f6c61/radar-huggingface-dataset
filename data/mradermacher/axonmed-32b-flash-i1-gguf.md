# mradermacher/AxonMed-32B-Flash-i1-GGUF

## Resumen

AxonMed-32B-Flash-i1-GGUF es una cuantización en formato GGUF del modelo AxonMed-32B-Flash, publicada por el usuario mradermacher. El modelo base está orientado a dominios médicos y conversacionales, según se desprende del nombre y de la etiqueta "conversational" del repositorio. Esta versión concreta no es un modelo nuevo, sino una conversión de pesos a cuantizaciones de baja precisión (Q2 a Q6, incluyendo variantes IQ) generadas con calibración por imatrix, lo que permite ejecutar el modelo en hardware de consumo.

El modelo cuenta con 32.763.876.352 parámetros totales (aproximadamente 32,8 mil millones), lo que lo sitúa en la categoría de modelos densos de gran tamaño, aptos para tareas de razonamiento y generación de texto especializado. El repositorio ocupa 12,3 GB, un tamaño coherente con un conjunto de cuantizaciones de un modelo de 32B, aunque el peso individual de cada archivo GGUF no se detalla en la información disponible.

La relevancia de esta ficha radica en que permite desplegar localmente un modelo médico de 32B mediante llama.cpp y herramientas compatibles, sin depender de infraestructura en la nube. Sin embargo, la información pública disponible es muy limitada: no se especifican licencia, idiomas, pipeline ni detalles de entrenamiento del modelo base, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer, inferido por el formato GGUF y el tamaño) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, small-IQ4_NL |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones generadas con imatrix) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base AxonMed-32B-Flash. Por el tamaño (32,8 mil millones de parámetros) y el formato de publicación (GGUF compatible con llama.cpp), se trata con alta probabilidad de un transformer denso, pero no se confirma en la documentación disponible. Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

La única información técnica concreta es el proceso de cuantización: las versiones GGUF se generaron con cuantización ponderada mediante imatrix, una técnica que calibra los factores de escala a partir de estadísticas de activaciones para reducir la pérdida de calidad en precisiones bajas. El repositorio incluye un conjunto amplio de cuantizaciones, desde IQ1_S (muy agresiva) hasta Q6_K (casi sin pérdida), lo que ofrece un abanico de compromisos entre tamaño y fidelidad.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como "conversational", lo que indica soporte para diálogo multi-turno.
- Dominio médico: el nombre del modelo (AxonMed) sugiere especialización en contenido clínico y sanitario, aunque no se documenta el alcance exacto.
- Inferencia local: al estar en formato GGUF, es compatible con llama.cpp y derivados (Ollama, LM Studio, text-generation-webui).
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" indica que puede servirse mediante APIs compatibles con el formato de Hugging Face.
- Capacidades de tool calling, agentes, visión, audio o thinking mode: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia clínica documental: el modelo puede redactar resúmenes de historiales o notas clínicas en local, manteniendo los datos del paciente dentro de la infraestructura propia, algo crítico por cumplimiento normativo.
- Formación médica: generación de explicaciones y casos prácticos para estudiantes, ejecutando el modelo en estaciones de trabajo con GPU de consumo mediante cuantizaciones Q4 o Q5.
- Triaje conversacional: chatbot de primera orientación sanitaria desplegado con llama.cpp en un servidor pequeño, usando cuantización Q4_K_M para equilibrar latencia y calidad.
- Investigación en NLP clínico: experimentación con modelos de dominio médico sin depender de APIs externas, gracias a la disponibilidad de múltiples cuantizaciones para distintos presupuestos de hardware.
- Prototipado de aplicaciones sanitarias: integración del modelo en pipelines de desarrollo mediante endpoints compatibles, permitiendo pruebas de concepto rápidas antes de escalar a infraestructura mayor.
- Procesamiento de texto médico en entornos aislados: despliegue en equipos sin conexión a internet (air-gapped), donde el formato GGUF y la ejecución con llama.cpp simplifican la instalación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de 32,8B parámetros, una cuantización Q4_K_M requiere aproximadamente 19-20 GB de memoria; Q5_K_M en torno a 23 GB; Q6_K cerca de 27 GB; las cuantizaciones IQ2 e IQ3 permiten bajar a rangos de 10-15 GB, con mayor pérdida de calidad.
- GPU recomendadas: para Q4_K_M o superiores, se recomienda una RTX 3090/4090 (24 GB) o una A100/H100 de 40-80 GB para mayor contexto y throughput. Las cuantizaciones IQ2/IQ3 pueden caber en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) con contexto reducido.
- Cabe en GPU de consumo: sí, en configuraciones de 16-24 GB según la cuantización elegida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con la API de llama.cpp. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requerirían los pesos originales en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AxonMed-32B-Flash-i1-GGUF | 32,8B | no disponible | no disponible | GGUF | Cuantizaciones imatrix, orientado a dominio médico |
| Modelos densos de 32B en GGUF (categoria generica) | ~32B | variable | variable | GGUF | Requisitos de hardware comparables; calidad depende del modelo base |
| Modelos médicos de 7-13B en GGUF | 7-13B | variable | variable | GGUF | Menor huella de memoria, menor capacidad de razonamiento |

No se dispone de información suficiente para establecer una comparativa detallada con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base (Saathimed/AxonMed-32B-Flash) antes de cualquier despliegue en producción.
- Idiomas no documentados: se desconoce el soporte multilingüe real, lo que limita su uso fuera del idioma de entrenamiento presumible.
- Riesgo de alucinación: en un modelo de dominio médico, las respuestas incorrectas pueden tener consecuencias graves; se requiere supervisión humana y validación clínica.
- Sesgos: no hay información sobre la composición del dataset ni sobre evaluaciones de sesgo.
- Cuantizaciones agresivas: las variantes IQ1 e IQ2 pueden degradar notablemente la calidad; para uso clínico se recomienda Q4_K_M o superior.
- Sin benchmarks publicados: no es posible evaluar el rendimiento real frente a alternativas.
- Repositorio sin descargas ni likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/AxonMed-32B-Flash-i1-GGUF
- Modelo base: https://huggingface.co/Saathimed/AxonMed-32B-Flash
