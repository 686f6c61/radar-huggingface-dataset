# mradermacher/Llama-3.1-8B-CounselTrajLM-i1-GGUF

## Resumen

Llama-3.1-8B-CounselTrajLM-i1-GGUF es una colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo UEC-InabaLab/Llama-3.1-8B-CounselTrajLM, un ajuste fino de Llama 3.1 8B orientado a conversaciones de consejería psicológica en chino. El modelo base fue desarrollado por el laboratorio InabaLab de la Universidad de Electro-Comunicaciones (UEC, Japón) y entrena sobre el dataset CounselTrajD, que aporta trayectorias conversacionales de counseling. Esta publicación no introduce pesos nuevos: su valor está en ofrecer el modelo en formato GGUF con cuantizaciones ponderadas por imatrix, lo que permite ejecutarlo en hardware de consumo mediante llama.cpp y derivados.

El modelo subyacente es un transformer denso de 8.030.261.312 parámetros (aproximadamente 8B), con la arquitectura estándar de Llama 3.1 y una longitud de contexto nominal de 128.000 tokens heredada del modelo original. La especialización en counseling y el idioma principal (chino) lo hacen relevante para investigación en diálogo terapéutico y para prototipos de asistentes conversacionales en ese dominio, no como modelo de propósito general.

La aportación práctica de esta ficha es la disponibilidad de 25 variantes GGUF con tamaños desde 2,1 GB (IQ1_S) hasta 6,7 GB (Q6_K), todas generadas con imatrix, lo que permite desplegar el modelo desde GPUs de gama baja hasta estaciones de trabajo con 8 GB de VRAM. El repositorio ocupa 93,8 GB en total y acumula 1.065 descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1), decodificador autoregresivo |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.1 8B; no confirmada explícitamente en la model card) |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (todas ponderadas con imatrix) |
| Idiomas soportados | chino (zh) según la model card; herencia multilingüe de Llama 3.1 no verificada para este ajuste |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | GGUF (safetensors disponibles en el modelo base) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso con la arquitectura de Llama 3.1 8B: 32 capas, atención con RoPE, normalización RMSNorm y activación SwiGLU, con 8.030.261.312 parámetros. No emplea mezcla de expertos ni mecanismos híbridos SSM. La model card del repositorio GGUF no documenta detalles del proceso de ajuste fino del modelo base (número de tokens, composición exacta del dataset, uso de RLHF o DPO), por lo que esos datos deben consultarse en la ficha de UEC-InabaLab/Llama-3.1-8B-CounselTrajLM.

El único dato de entrenamiento disponible es el dataset UEC-InabaLab/CounselTrajD, orientado a trayectorias de conversación en consejería. La innovación técnica de esta publicación concreta es el uso de cuantización ponderada por imatrix (importance matrix) generada a partir de ese dataset, lo que preserva mejor la calidad en las capas y tensores más sensibles al dominio de counseling. Las cuantizaciones i1 (IQ) suelen ofrecer mejor relación calidad/tamaño que las Q_K estáticas equivalentes, según las notas del propio autor.

## Capacidades

- Generación de texto conversacional multi-turno especializada en diálogo de consejería psicológica.
- Razonamiento y comprensión de contexto emocional en conversaciones terapéuticas en chino.
- Seguimiento de trayectorias de conversación (counseltraj): el ajuste está diseñado para mantener coherencia a lo largo de sesiones estructuradas.
- Herencia de capacidades generales de Llama 3.1 8B (código, matemáticas, instrucciones), aunque no verificadas tras el ajuste.
- Soporte de tool calling y function calling: no documentado en la model card; probable degradación respecto al modelo base por el ajuste de dominio.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este ajuste.
- Capacidades multilingües: la model card declara únicamente chino; el multilingüismo de Llama 3.1 puede haberse visto reducido por el ajuste fino.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en diálogo terapéutico: el modelo permite reproducir y analizar trayectorias de consejería en chino, sirviendo como baseline para estudiar la calidad de respuestas empáticas en entornos académicos.
- Prototipos de asistente de apoyo emocional en chino: con cuantización i1-Q4_K_M (5,0 GB) puede desplegarse en una RTX 3060 de 12 GB para validar flujos conversacionales antes de invertir en infraestructura mayor.
- Simulación de pacientes para entrenamiento de psicólogos: el ajuste sobre CounselTrajD permite generar turnos de cliente realistas en sesiones simuladas, útil en formación clínica.
- Evaluación de cuantizaciones en dominios especializados: comparar i1-Q4_K_S frente a Q4_K_M en tareas de counseling permite medir cuánta calidad de dominio se pierde con la compresión, gracias a la disponibilidad de 25 variantes.
- Despliegue en dispositivos con poca VRAM: la variante i1-IQ2_M (3,0 GB) cabe en GPUs de 4 GB y permite ejecutar el modelo en portátiles con GPU integrada o CPU, útil para demos offline.
- Anotación asistida de corpus de counseling: el modelo puede generar respuestas candidatas que investigadores revisan y etiquetan, acelerando la construcción de datasets en chino.
- Chatbot de primera línea en servicios de salud mental (con supervisión humana): su especialización en chino y contexto largo permiten gestionar conversaciones de intake, siempre con derivación a profesionales y revisión de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (con overhead de contexto): IQ1_S ~2,5 GB; IQ2_M ~3,5 GB; Q3_K_M ~4,5 GB; Q4_K_M ~5,5 GB; Q5_K_M ~6,5 GB; Q6_K ~7,5 GB. Añadir 1-2 GB para contexto largo (8K-32K tokens).
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K con contexto largo; RTX 4080/4070 Ti (12-16 GB) para Q5_K_M o Q6_K con contexto moderado; RTX 3060 12 GB para Q4_K_M; GTX 1660 6 GB o GPUs integradas para IQ2/IQ3.
- Cabe en GPU de consumo: sí, desde una GTX 1650 4 GB con IQ2_M hasta una RTX 4090 con Q6_K y contexto extendido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este formato; requerirían los safetensors del modelo base.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependen del hardware y la cuantización. Como referencia cualitativa, el autor indica que Q4_K_M es "fast, recommended" y Q4_0 "fast, low quality".

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Formato |
|---|---|---|---|---|---|
| Llama-3.1-8B-CounselTrajLM-i1-GGUF (este) | 8,03B | 128K (heredado) | Counseling en chino | llama3.1 | GGUF (25 cuants) |
| UEC-InabaLab/Llama-3.1-8B-CounselTrajLM | 8,03B | 128K (heredado) | Counseling en chino | llama3.1 | safetensors |
| mradermacher/Llama-3.1-8B-CounselTrajLM-GGUF | 8,03B | 128K (heredado) | Counseling en chino | llama3.1 | GGUF (cuants estáticas) |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128K | Propósito general | llama3.1 | safetensors, GGUF (terceros) |

La diferencia frente a las cuantizaciones estáticas del mismo autor es el uso de imatrix, que según las notas del repositorio mejora la calidad en los cuantos pequeños. Frente a Llama 3.1 8B Instruct, este modelo sacrifica generalidad por especialización en counseling en chino, por lo que no es sustituto directo en tareas generales.

## Limitaciones y advertencias

- Especialización estrecha: el ajuste sobre CounselTrajD puede degradar el rendimiento en tareas generales (código, matemáticas, instrucciones) respecto a Llama 3.1 8B Instruct; no se han publicado evaluaciones que lo cuantifiquen.
- Idioma: la model card declara únicamente chino; el uso en castellano u otros idiomas no está validado y probablemente sea deficiente.
- Riesgo de alucinación: como todo modelo de 8B, puede generar contenido plausible pero falso, especialmente peligroso en un dominio de salud mental.
- Sesgos: no documentados; el dataset CounselTrajD puede introducir sesgos culturales o clínicos específicos del contexto japonés/chino que no se han evaluado.
- Uso clínico: no debe emplearse como sustituto de profesionales de la salud mental; no hay validación clínica publicada.
- Licencia llama3.1: permite uso comercial con restricciones (política de uso aceptable, límite de 700 millones de usuarios mensuales para licencia automática, obligación de atribución y de nombrar el modelo "Llama"). Revisar los términos completos antes de producción.
- Cuantizaciones de muy baja calidad: IQ1_S, IQ1_M y Q2_K_S degradan notablemente la coherencia; el propio autor las etiqueta como "for the desperate" o "very low quality".
- Contexto largo no verificado: aunque Llama 3.1 soporta 128K, no hay confirmación de que el ajuste fino preserve esa ventana; probar empíricamente antes de confiar en contextos extensos.
- Formato GGUF: no compatible con vLLM o TGI sin conversión; para serving de alta concurrencia usar los safetensors del modelo base.

## Enlaces

- Repositorio GGUF (este modelo): https://huggingface.co/mradermacher/Llama-3.1-8B-CounselTrajLM-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Llama-3.1-8B-CounselTrajLM-i1-GGUF
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Llama-3.1-8B-CounselTrajLM-GGUF
- Modelo base (safetensors): https://huggingface.co/UEC-InabaLab/Llama-3.1-8B-CounselTrajLM
- Dataset de entrenamiento: https://huggingface.co/datasets/UEC-InabaLab/CounselTrajD
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f81060077
