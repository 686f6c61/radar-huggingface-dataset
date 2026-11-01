# Medwebsite/semio-1-E2B-GGUF

## Resumen

Sémio-1 (E2B) es un ajuste fino (fine-tuning) de tipo GGUF del modelo google/gemma-4-E2B-it, orientado a contenido médico en francés y publicado por el usuario Medwebsite. El modelo se presenta como una herramienta pedagógica para estudiantes de medicina, entrenada sobre los conjuntos de datos MediQAl (CC BY 4.0) y FrenchMedMCQA (Apache 2.0). El autor reporta una mejora en un test de 150 preguntas tipo ECN (prueba de acceso a la especialización médica en Francia) nunca vistas durante el entrenamiento: del 37,3 % de aciertos antes del ajuste al 47,3 % después.

El modelo parte de la familia Gemma, concretamente la variante E2B en su versión instruct (it), y se distribuye únicamente en formato GGUF, lo que lo hace apto para inferencia con llama.cpp y entornos de bajos recursos. El repositorio ocupa 3,4 GB y el recuento real de parámetros en safetensors es de 4.647.450.147, aunque la etiqueta E2B sugiere una arquitectura con parámetros activos reducidos (posiblemente un modelo de mezcla de expertos o con compartición de parámetros, dado el desajuste entre el total y la nomenclatura).

La relevancia actual del modelo es doble: por un lado, demuestra el interés creciente por adaptar modelos pequeños y eficientes a dominios especializados como la medicina; por otro, su licencia Apache 2.0 y su formato GGUF facilitan su despliegue en entornos locales sin dependencia de infraestructura en la nube. No obstante, la información pública disponible es muy limitada y no se han publicado detalles sobre arquitectura interna, composición exacta del dataset ni resultados de benchmarks estandarizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de google/gemma-4-E2B-it; presumiblemente transformer, posiblemente MoE o con compartición de parámetros) |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones compatibles con llama.cpp; nivel específico no disponible) |
| Idiomas soportados | francés (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 3,4 GB) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base google/gemma-4-E2B-it ni sobre las modificaciones introducidas durante el ajuste fino. El nombre "E2B" sugiere una variante eficiente de la familia Gemma 4, pero no se especifica si se trata de un modelo de mezcla de expertos (MoE), de un transformer con compartición de parámetros o de otra técnica de eficiencia. El recuento de parámetros totales (4,65 mil millones) es superior al que cabría esperar de una etiqueta "2B", lo que apunta a una arquitectura con parámetros totales y activos diferenciados, pero este dato no se confirma en la información disponible.

En cuanto al entrenamiento, la model card indica que el ajuste fino se realizó sobre MediQAl (licencia CC BY 4.0) y FrenchMedMCQA (licencia Apache 2.0). No se detalla el número de tokens, la composición exacta del dataset, la existencia de fases de RLHF o DPO, ni hiperparámetros de entrenamiento. La única métrica reportada es la mejora en un test de 150 preguntas tipo ECN: 37,3 % antes del ajuste y 47,3 % después, lo que representa una ganancia de 10 puntos porcentuales. No se mencionan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en francés, orientada a preguntas y respuestas de contenido médico.
- Resolución de preguntas de opción múltiple (QCM) de nivel ECN, según la evaluación reportada por el autor.
- Capacidad pedagógica: el modelo está diseñado como herramienta de estudio para estudiantes de medicina, no como sustituto del criterio clínico.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al francés según la etiqueta de idioma; no se confirma soporte de otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integración con infraestructuras de inferencia estándar.

## Casos de uso

- Estudio de preguntas tipo ECN: el modelo puede utilizarse para practicar QCM médicos en francés, ya que fue ajustado específicamente sobre FrenchMedMCQA y evaluado en preguntas de este formato. Su rendimiento del 47,3 % en preguntas no vistas lo sitúa como herramienta de repaso, no como fuente de verdad.
- Repaso de conceptos de semiología: al estar orientado a contenido médico y entrenado sobre datasets clínicos, puede emplearse para generar explicaciones breves de términos y conceptos semiológicos en francés, siempre con verificación posterior por parte del estudiante.
- Generación de preguntas de autoevaluación: el modelo puede producir preguntas y respuestas de opción múltiple a partir de apuntes o temarios, útil para crear material de estudio personalizado.
- Asistente conversacional de apoyo al estudiante: integrado en un chat local mediante llama.cpp u Ollama, puede resolver dudas de vocabulario médico y aclarar definiciones en francés, con la ventaja de ejecutarse en hardware de consumo.
- Despliegue en entornos con recursos limitados: al distribuirse en GGUF y ocupar 3,4 GB, puede ejecutarse en portátiles o estaciones de trabajo sin GPU dedicada, lo que facilita su uso en bibliotecas o aulas con equipos modestos.
- Prototipado de aplicaciones educativas sanitarias: desarrolladores pueden integrar el modelo en plataformas de e-learning médico en francés para generar contenido de práctica, gracias a su licencia Apache 2.0 y su compatibilidad con endpoints.
- Investigación sobre ajuste fino en dominios especializados: el modelo sirve como caso de estudio de cómo un ajuste fino con datasets pequeños (MediQAl, FrenchMedMCQA) mejora el rendimiento en un dominio concreto, con una ganancia documentada de 10 puntos porcentuales.

## Benchmarks y rendimiento

| Benchmark | Antes del ajuste | Después del ajuste |
|---|---|---|
| 150 QCM tipo ECN (no vistas) | 37,3 % | 47,3 % |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato reportado por el autor es la evaluación sobre 150 preguntas tipo ECN nunca vistas durante el entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un GGUF de 3,4 GB, la cuantización probablemente permite ejecución con menos de 4 GB de VRAM en configuraciones agresivas (Q4 o inferiores); no se especifica el nivel de cuantización exacto.
- GPU recomendadas: no disponible. Por el tamaño del repo, cabría esperar funcionamiento en GPUs de consumo como RTX 3060, RTX 4060 o superiores, pero este dato no se confirma.
- ¿Cabe en GPU de consumo? Muy probablemente sí, dado el tamaño del archivo GGUF (3,4 GB), aunque no se detalla el nivel de cuantización ni los requisitos exactos.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama (si se publica la etiqueta correspondiente), y entornos compatibles con endpoints según la etiqueta `endpoints_compatible`. vLLM y TGI no se mencionan y, en principio, no soportan GGUF de forma nativa sin conversión.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sémio-1 (E2B) | 4.647.450.147 | no disponible | Apache 2.0 | GGUF | Ajuste médico en francés sobre Gemma 4 E2B |
| google/gemma-4-E2B-it | no disponible | no disponible | Apache 2.0 (según base) | safetensors (original) | Modelo base instruct; sin ajuste médico |
| Meditron (variantes) | 7B / 70B | no disponible | no disponible en esta ficha | safetensors / GGUF | Modelos médicos de código abierto, pero en inglés y con mayor tamaño |
| BioMistral | 7B | no disponible | Apache 2.0 | safetensors / GGUF | Ajuste médico en inglés y multilingüe; no específico para francés |

La comparativa es limitada porque no se dispone de datos de rendimiento de Sémio-1 en benchmarks estandarizados ni de especificaciones completas de su modelo base. Los modelos alternativos citados (Meditron, BioMistral) son de mayor tamaño y orientados al inglés, por lo que la comparación directa no es posible con la información disponible.

## Limitaciones y advertencias

- El propio autor indica que es una herramienta pedagógica y no sustituye el consejo médico. No debe usarse para diagnóstico, tratamiento ni decisiones clínicas.
- Rendimiento limitado: un 47,3 % de aciertos en QCM tipo ECN implica que más de la mitad de las respuestas son incorrectas en preguntas no vistas. El riesgo de alucinación en contenido médico es alto y debe verificarse siempre.
- Idiomas: solo se declara soporte de francés. No se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Sesgos conocidos: no se documentan en la información disponible, pero al entrenarse sobre datasets médicos franceses puede heredar sesgos de esos corpus.
- Limitaciones de contexto: no se especifica la longitud de contexto soportada, lo que impide evaluar su idoneidad para documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base (Gemma 4) puede tener términos adicionales que no se detallan en la información proporcionada. Se recomienda revisar la licencia del modelo base antes de un uso comercial.
- Datos de entrenamiento limitados: solo se citan dos datasets (MediQAl y FrenchMedMCQA), sin detalle de tamaño ni composición, lo que dificulta evaluar la cobertura temática.
- Información pública escasa: no hay benchmarks estandarizados, ni detalles de arquitectura, ni guía de cuantizaciones, lo que limita la reproducibilidad y la evaluación rigurosa.

## Enlaces

- HuggingFace: https://huggingface.co/Medwebsite/semio-1-E2B-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Dataset MediQAl: no disponible en la información proporcionada
- Dataset FrenchMedMCQA: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
