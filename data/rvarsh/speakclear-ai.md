# rvarsh/SpeakClear-AI

## Resumen

SpeakClear AI es un prototipo de investigación de práctica de pronunciación no clínica desarrollado por rvarsh (Rohil Varshney). No es un modelo de lenguaje ni una red neuronal profunda: es un conjunto de clasificadores clásicos de scikit-learn (SVM, Random Forest y regresión logística) que analizan características acústicas extraídas de grabaciones cortas de pronunciación para etiquetarlas como "claras" o "poco claras". El objetivo declarado es servir como herramienta educativa de práctica y como banco de pruebas de aprendizaje automático sobre datasets de voz pequeños.

El proyecto se apoya en el dataset personalizado SpeakClear, compuesto por 242 clips etiquetados manualmente, con focos fonéticos en /s/, /z/, /r/, /th/ y contextos mixtos de frase con /s/ + /z/. Además, el autor realizó un experimento de transferencia con el dataset público SpeechOcean762 para evaluar si los datos públicos de pronunciación pueden complementar o sustituir a los datos personalizados. Las grabaciones de voz en bruto no se publican y las etiquetas no han sido validadas clínicamente.

Es relevante ahora por dos motivos: por un lado, demuestra un flujo completo de clasificación de pronunciación con modelos ligeros desplegables en CPU; por otro, documenta de forma transparente las limitaciones de entrenar con pocos datos y de un único hablante, un escenario habitual en proyectos de investigación pequeños. El repositorio ocupa 0,0 GB, tiene licencia MIT y registra 1 me gusta y 0 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto de clasificadores clásicos de scikit-learn: SVM, Random Forest y regresión logística sobre características acústicas |
| Parametros totales | no disponible (no se publica el número de árboles ni de vectores de soporte) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; clasifica clips cortos de pronunciación, no gestiona contexto |
| Tipos de cuantizacion | no aplica (modelo clásico de scikit-learn; no requiere cuantización) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | joblib (por ejemplo, `models/speakclear_random_forest.joblib`) |

## Arquitectura y entrenamiento

El sistema no emplea una arquitectura de transformer, MoE ni SSM. Se trata de un pipeline de aprendizaje automático clásico: se extraen características acústicas de cada clip de audio y se alimentan a tres clasificadores supervisados (SVM, Random Forest y regresión logística) que producen una etiqueta binaria "clara" o "poco clara". El autor no detalla en la model card qué conjunto exacto de características acústicas se utiliza ni los hiperparámetros de cada clasificador.

El entrenamiento se realizó sobre el dataset SpeakClear, con 242 clips utilizables etiquetados manualmente y categorías objetivo /s/, /z/, /r/, /th/ y frases mixtas de /s/ + /z/. Los datos están desbalanceados, con pocos ejemplos de clips poco claros, y las grabaciones en bruto no se liberan. Adicionalmente se ejecutó un experimento de transferencia con ejemplos de fonemas objetivo extraídos del dataset público SpeechOcean762, comparando tres regímenes: entrenamiento solo con SpeakClear, solo con SpeechOcean y entrenamiento combinado SpeechOcean + SpeakClear. La innovación destacable es metodológica: la comparación controlada entre datos personalizados y datos públicos, junto con el uso de validación repetida (30 particiones estratificadas) y de métricas balanceadas para no dejarse engañar por el desbalanceo de clases.

## Capacidades

- Clasificación binaria de clips cortos de pronunciación en las categorías "clara" y "poco clara".
- Evaluación de fonemas concretos: /s/, /z/, /r/ y /th/, además de contextos de frase con /s/ + /z/.
- Extracción y explotación de características acústicas de audio mediante un pipeline reproducible.
- Entrenamiento y evaluación sobre datasets pequeños y personalizados de voz.
- Experimentos de transferencia desde datasets públicos de pronunciación (SpeechOcean762).
- Despliegue como aplicación interactiva mediante dos demos en Streamlit y en Hugging Face Spaces.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No incorpora modo de pensamiento, visión ni audio generativo; solo clasificación.
- No hay información publicada sobre capacidades multilingües.

## Casos de uso

- Práctica educativa de pronunciación: un estudiante graba palabras con /s/, /z/, /r/ o /th/ y el modelo devuelve una etiqueta de claridad que sirve como retroalimentación inmediata en un ejercicio guiado.
- Autoevaluación personal de habla: una persona que practica un segundo idioma puede usar la demo de Streamlit para repetir clips y observar la evolución de sus etiquetas a lo largo del tiempo.
- Investigación con datasets pequeños de voz: sirve como referencia metodológica para estudiar cómo se comportan SVM, Random Forest y regresión logística con pocas muestras y clases desbalanceadas.
- Estudio de transferencia entre dominios: permite analizar si los datos públicos de pronunciación (SpeechOcean762) mejoran la robustez frente a grabaciones personalizadas y en qué medida el desajuste de dominio limita esa transferencia.
- Prototipado de herramientas de logopedia no clínicas: puede integrarse como componente de clasificación en un producto educativo, siempre que no se use para diagnóstico ni tratamiento.
- Demostración docente de métricas balanceadas: el contraste entre la exactitud del baseline mayoritario (0,770) y su recall de clips poco claros (0,000) es un ejemplo didáctico de por qué la exactitud por sí sola engaña.
- Integración ligera en aplicaciones Python: al cargarse con joblib y no requerir GPU, puede embeberse en scripts de análisis de audio o en un backend de bajo coste.

## Benchmarks y rendimiento

Resultados principales del dataset SpeakClear sobre 30 particiones estratificadas repetidas:

| Modelo | Accuracy | Balanced Accuracy | Recall (poco claro) | F1 (poco claro) |
|---|---:|---:|---:|---:|
| SVM | 0,693 ± 0,050 | 0,671 ± 0,062 | 0,629 ± 0,133 | 0,483 ± 0,074 |
| Random Forest | 0,760 ± 0,043 | 0,640 ± 0,064 | 0,419 ± 0,128 | 0,440 ± 0,106 |
| Regresión logística | 0,627 ± 0,048 | 0,591 ± 0,061 | 0,524 ± 0,130 | 0,389 ± 0,073 |
| Baseline mayoritario | 0,770 ± 0,000 | 0,500 ± 0,000 | 0,000 ± 0,000 | 0,000 ± 0,000 |

Resultados del experimento de transferencia sobre el conjunto de test reservado de SpeakClear:

| Configuración | Métrica | Valor |
|---|---|---:|
| Solo SpeakClear, SVM | F1 (poco claro) | 0,579 |
| SpeechOcean + SpeakClear, Random Forest | F1 (poco claro) | 0,571 |
| SpeechOcean + SpeakClear, Random Forest | Accuracy | 0,803 |

El baseline mayoritario alcanza una exactitud de 0,770 pero no detecta ningún clip poco claro, lo que ilustra el efecto del desbalanceo de clases. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K y similares) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- Inferencia en CPU: al ser un modelo de scikit-learn cargado con joblib, no requiere GPU y funciona en cualquier procesador convencional.
- VRAM estimada: 0 GB; no hay necesidad de memoria de GPU.
- GPU recomendadas: no aplica; no se requiere ninguna GPU (A100, H100 o RTX 4090 son innecesarias).
- Compatibilidad con GPU de consumo: irrelevante, ya que el modelo cabe y se ejecuta en equipos de consumo por vía de CPU.
- Huella en disco: el repositorio ocupa 0,0 GB, por lo que el artefacto joblib es muy ligero.
- Opciones de despliegue: carga directa con joblib en Python y aplicación web vía Streamlit (demo en Hugging Face Spaces y en Streamlit Community Cloud). No aplican vLLM, llama.cpp, Ollama ni TGI porque no es un transformer.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del front-end de extracción de características acústicas y del número de árboles o vectores de soporte, no publicados.

## Comparativa con modelos similares

La model card no incluye comparación con otros modelos o herramientas, por lo que no hay datos numéricos para contrastar. Como referencia de categoría, este sistema pertenece a la familia de evaluadores de pronunciación basados en características acústicas y aprendizaje automático clásico, frente a alternativas de aprendizaje profundo (por ejemplo, enfoques basados en wav2vec2) que no se evalúan aquí.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento comparable |
|---|---|---|---|---|---|
| SpeakClear-AI | no disponible | no aplica | MIT | Hugging Face, GitHub, dos demos | Accuracy 0,760 (Random Forest), F1 poco claro hasta 0,579 en transferencia |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han proporcionado datos de benchmarks ni de licencias de modelos competidores en la información disponible.

## Limitaciones y advertencias

- Dataset de un único hablante: puede no generalizar a otras personas.
- Número reducido de clips poco claros, lo que provoca bajo recall y bajo F1 en esa clase.
- Etiquetas asignadas manualmente, sin proceso de validación clínica.
- Modelo no validado clínicamente; no es herramienta de diagnóstico, tratamiento ni sustituye a un logopeda o patólogo del habla.
- La transferencia desde datasets públicos está limitada por el desajuste de dominio y no reemplaza a los datos personalizados.
- No se publican las grabaciones de voz en bruto ni los detalles exactos de las características acústicas empleadas.
- No hay información sobre idiomas soportados, sesgos demográficos ni robustez ante ruido o micrófonos distintos.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de clasificación errónea en clips ambiguos.
- El baseline mayoritario muestra que la exactitud puede ser engañosa con este dataset; conviene usar métricas balanceadas.
- Licencia MIT: permite uso comercial y modificación con atribución, pero el uso clínico queda fuera del ámbito previsto por el autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rvarsh/SpeakClear-AI
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/rvarsh/SpeakClear-AI-Demo
- Demo en Streamlit: https://speakclear-ai.streamlit.app/
- Repositorio en GitHub: https://github.com/rohilvarshney/SpeakClearAI
- Dataset público de referencia citado (SpeechOcean762): no se proporciona enlace directo en la información disponible.
