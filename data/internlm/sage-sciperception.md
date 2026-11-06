# internlm/Sage-SciPerception

## Resumen

Sage-SciPerception (书生·元征) es un conjunto de proyectores entrenables desarrollado por InternLM que conecta codificadores científicos especializados con un modelo de lenguaje, permitiendo que este último procese y razone sobre representaciones científicas estructuradas. No se trata de un modelo de lenguaje completo, sino de una capa de adaptación multimodal que traduce grafos moleculares, espectros, estructuras cristalinas, secuencias de proteínas y ácidos nucleicos, y señales científicas al espacio de entrada del modelo de lenguaje subyacente.

La propuesta resuelve un problema concreto: los modelos de lenguaje generalistas no pueden ingerir directamente formatos científicos nativos como grafos moleculares o espectros. Sage-SciPerception actúa como puente entre codificadores de dominio (encoders científicos) y el LLM, de modo que este puede generar análisis en lenguaje natural y respuestas estructuradas sobre dichos datos. Los proyectores se organizan por backbone de lenguaje, modalidad y tarea, y deben usarse con sus codificadores y configuraciones correspondientes.

El repositorio tiene un tamaño de 0.0 GB, lo que sugiere que los pesos no están alojados en el propio repo de Hugging Face o que este actúa únicamente como punto de entrada documental. No se especifican en la información disponible ni la arquitectura del LLM subyacente, ni el número de parámetros, ni la longitud de contexto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Proyectores entrenables que conectan codificadores científicos con un modelo de lenguaje (arquitectura del LLM subyacente: no disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, zh |
| Licencia | no disponible |
| Formato de pesos | no disponible (tamaño del repo: 0.0 GB) |

## Arquitectura y entrenamiento

El sistema se compone de tres piezas: codificadores científicos específicos por modalidad (grafos moleculares, espectros, estructuras cristalinas, secuencias de proteínas y ácidos nucleicos, señales científicas), proyectores entrenables que mapean las representaciones de esos codificadores al espacio de entrada del modelo de lenguaje, y el propio LLM que recibe dichas representaciones. Los proyectores están organizados por backbone de lenguaje, modalidad y tarea, lo que implica que existe un checkpoint específico por combinación y que deben emparejarse con el encoder y la configuración adecuados.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla si los proyectores se entrenaron con congelación del LLM y de los encoders (el enfoque habitual en adaptadores de este tipo) o con algún otro esquema. La innovación principal declarada es la capacidad de integrar modalidades científicas heterogéneas en un único espacio de lenguaje natural, habilitando respuestas estructuradas y análisis en lenguaje natural sobre datos que normalmente requerirían pipelines ad hoc.

## Capacidades

- Percepción de grafos moleculares: identificación conjunta de estructura y espectro (tarea evaluada en QM9S).
- Predicción de propiedades de materiales: energía de formación a partir de estructuras cristalinas (evaluado en JARVIS-DFT).
- Análisis de interacciones proteína-proteína: identificación de sitios de interfaz (evaluado en MPBind).
- Clasificación de señales fisiológicas: electrocardiograma (SciTS PHU01) y estadificación del sueño (SciTS NEU06).
- Clasificación de familias de ARN no codificante (BEACON ncRNA).
- Generación de respuestas científicas estructuradas y análisis en lenguaje natural sobre las modalidades anteriores.
- Soporte bilingüe inglés-chino.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión general, audio: no disponible en la información proporcionada (las modalidades cubiertas son las científicas listadas).

## Casos de uso

- Identificación de estructuras moleculares a partir de espectros: el modelo puede recibir la representación del espectro y generar una propuesta de estructura molecular junto con su razonamiento, útil en química analítica y control de calidad. El checkpoint correspondiente a QM9S alcanza un 49.75 % de Acc@1 en esta tarea.
- Cribado de materiales para energía de formación: integrado en pipelines de descubrimiento de materiales, permite estimar la energía de formación de estructuras cristalinas candidatas antes de simulaciones DFT completas, con un MAD/MAE de 15.03 en JARVIS-DFT.
- Análisis de interfaces proteína-proteína en biología estructural: el modelo identifica sitios de interfaz a partir de secuencias, con un F1 medio por proteína del 61.12 % en MPBind, lo que sirve como filtro previo en estudios de interacción molecular.
- Clasificación automática de electrocardiogramas: con un Macro-F1 del 71.53 % en SciTS PHU01, puede emplearse como componente de triaje en herramientas de monitorización cardíaca que requieran explicaciones en lenguaje natural.
- Estadificación del sueño a partir de señales: con un Macro-F1 del 72.01 % en SciTS NEU06, encaja en pipelines de análisis de polisomnografía donde se necesite resumir hallazgos en lenguaje natural.
- Anotación de familias de ARN no codificante: con un 97.35 % de exactitud en BEACON ncRNA, es adecuado para tareas de clasificación y anotación funcional en genómica.
- Asistente científico conversacional: al mapear representaciones científicas al espacio del LLM, permite construir interfaces donde el investigador sube un espectro o una secuencia y consulta en inglés o chino sobre los resultados.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados sobre respuestas generadas con checkpoints específicos por tarea:

| Benchmark | Tarea | Métrica | Resultado |
|---|---|---|---:|
| QM9S | Identificación conjunta de estructura y espectro | Acc@1 (%) | 49.75 |
| JARVIS-DFT | Predicción de energía de formación | MAD/MAE | 15.03 |
| MPBind (assembly-1 reconstruction) | Sitios de interfaz proteína-proteína | F1 medio por proteína (%) | 61.12 |
| SciTS PHU01 | Clasificación de ECG | Macro-F1 (%) | 71.53 |
| SciTS NEU06 | Estadificación del sueño | Macro-F1 (%) | 72.01 |
| BEACON ncRNA | Clasificación de familias de ARN | Exactitud (%) | 97.35 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos en estos mismos benchmarks, ni métricas de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del LLM subyacente y de los codificadores científicos, cuyos tamaños no se especifican).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada. La categoría (proyectores de percepción científica sobre LLM) es específica y no se documentan alternativas ni datos cruzados de rendimiento.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Sage-SciPerception | no disponible | no disponible | no disponible | Hugging Face (repo 0.0 GB) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el LLM backbone, los codificadores científicos y la configuración correspondientes; usar un proyector con el encoder o backbone equivocado invalida los resultados.
- Los resultados publicados corresponden a checkpoints específicos por tarea, no a un único modelo generalista; el rendimiento en tareas no evaluadas es desconocido.
- El repositorio tiene 0.0 GB, por lo que la disponibilidad efectiva de pesos en Hugging Face no está confirmada.
- Licencia no especificada: no puede asumirse uso comercial sin consultar al autor.
- Idiomas limitados a inglés y chino; no se documenta soporte de castellano.
- Riesgo de alucinación inherente al componente de lenguaje: las respuestas generadas deben validarse contra la salida de los codificadores en contextos de producción científica.
- No se documentan sesgos conocidos, límites de contexto ni comportamiento ante entradas fuera de distribución.
- Sin métricas de calibración ni intervalos de confianza publicados para las predicciones.

## Enlaces

- Hugging Face: https://huggingface.co/internlm/Sage-SciPerception
- GitHub: https://github.com/InternLM/Sage-SciPerception
- README en chino: https://huggingface.co/internlm/Sage-SciPerception/blob/main/README_zh.md
