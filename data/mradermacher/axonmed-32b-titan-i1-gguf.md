# mradermacher/AxonMed-32B-Titan-i1-GGUF

## Resumen

AxonMed-32B-Titan-i1-GGUF es la versión cuantizada del modelo médico AxonMed-32B-Titan, desarrollado originalmente por Saathimed y distribuido en formato GGUF por mradermacher. Se trata de un modelo de lenguaje de 32.763.876.352 parámetros (aproximadamente 32,8 mil millones) orientado al dominio médico, clínico y biomédico, con capacidades declaradas de razonamiento sobre terminología sanitaria como ICD-10, ICD-11 y RxNorm, y entrenado con vistas a tareas tipo USMLE y razonamiento clínico. La versión aquí descrita incorpora cuantizaciones con imatrix, que preservan mejor la calidad en niveles de compresión bajos que las cuantizaciones estáticas equivalentes.

El modelo base es de tipo transformer denso (no se documenta arquitectura MoE en la información disponible) y está etiquetado como conversacional. Su relevancia práctica radica en que permite desplegar un modelo especializado en salud de 32B en hardware más modesto mediante GGUF, manteniendo la licencia Apache 2.0 del modelo original, lo que facilita su uso comercial y su integración en entornos clínicos o de investigación sin las restricciones de licencias más cerradas.

No obstante, la información pública disponible es escasa: la model card del repositorio cuantizado se limita a describir el proceso de cuantización y remite al modelo base, sin detallar datos de entrenamiento, benchmarks ni composición del dataset. Esta ficha refleja únicamente lo que puede verificarse en la información proporcionada y marca explícitamente como "no disponible" todo aquello que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalle no disponible; denso, sin indicios de MoE en la informacion) |
| Parametros totales | 32.763.876.352 (~32,8B) |
| Parametros activos | No disponible (no se documenta que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-Q2_K (12,4 GB) e imatrix; la model card lista ademas tipos planificados: Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con fichero imatrix separado; el modelo base usa safetensors) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su naturaleza transformer y su carácter conversacional. No se especifican el número de capas, la dimensión oculta, el mecanismo de atención (estándar o variantes como GQA/MQA), ni si incorpora innovaciones como decodificación especulativa o atención lineal. Tampoco se documenta el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

Lo que sí consta es el proceso de cuantización: mradermacher genera cuantizaciones ponderadas con fichero imatrix (importancia matrix) a partir del modelo base Saathimed/AxonMed-32B-Titan, lo que permite crear cuantizaciones de mayor calidad que las estáticas para un mismo tamaño. El repositorio incluye el fichero imatrix (0,1 GB) para que terceros puedan generar sus propias cuantizaciones, y se ofrece una versión estática paralela en el repositorio AxonMed-32B-Titan-GGUF. El modelo está etiquetado con dominios médicos (USMLE, ICD-10, ICD-11, RxNorm), lo que sugiere un entrenamiento o ajuste orientado a terminología y razonamiento clínico, aunque no se aportan detalles sobre el corpus.

## Capacidades

- Generación de texto conversacional en inglés, con orientación declarada al dominio médico y clínico.
- Razonamiento clínico y biomédico, incluyendo tareas tipo USMLE según las etiquetas del modelo.
- Manejo de terminología sanitaria estandarizada: ICD-10, ICD-11 y RxNorm (codificación y razonamiento sobre diagnósticos, procedimientos y fármacos).
- Soporte de conversaciones multi-turno (etiqueta "conversational").
- Capacidad de razonamiento general y de dominio médico, aunque no se documentan modos especiales como "thinking mode".
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistencia a la codificación clínica: el modelo puede apoyar la asignación de códigos ICD-10 e ICD-11 a partir de descripciones de diagnósticos o procedimientos, gracias a su etiquetado específico en estas taxonomías, reduciendo el trabajo manual de codificadores y facturación sanitaria.
- Normalización de medicación con RxNorm: útil para mapear nombres comerciales, genéricos y dosis a identificadores RxNorm en sistemas de historia clínica electrónica, mejorando la interoperabilidad entre sistemas.
- Apoyo a la formación médica: generación de preguntas y explicaciones de estilo USMLE para estudiantes y residentes, con razonamiento paso a paso sobre fisiopatología y diagnóstico diferencial.
- Resumen de notas clínicas: el modelo puede condensar historiales y notas de evolución en inglés para revisión rápida por parte de profesionales, siempre con supervisión humana dado el riesgo de alucinación.
- Investigación biomédica asistida: extracción y estructuración de información de literatura científica y ensayos clínicos en inglés, aprovechando su orientación al dominio biomédico.
- Chatbot de orientación sanitaria no diagnóstica: despliegue en GGUF sobre infraestructura local para responder preguntas frecuentes de pacientes en inglés, con derivación a profesionales cuando corresponda.
- Despliegue en entornos con requisitos de privacidad: al poder ejecutarse en formato GGUF con llama.cpp u Ollama en hardware propio, permite procesar datos clínicos sensibles sin enviarlos a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: la cuantización i1-Q2_K ocupa 12,4 GB en disco; en inferencia se requiere VRAM adicional para el contexto (KV cache), por lo que conviene prever al menos 14-16 GB para contextos moderados con esa cuantización. Las cuantizaciones superiores (Q4_K_M, Q5_K_M, Q6_K) no tienen tamaño publicado en la información disponible, pero para un modelo de ~32,8B suelen situarse por encima de 18-22 GB.
- GPU recomendadas: para cuantizaciones Q4-Q6 se recomiendan GPU con 24 GB o más (RTX 3090/4090, A10G, L40S, A100 40/80 GB, H100). Para Q2_K puede intentarse en GPU de 16 GB con contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con cuantizaciones Q4/Q5 y contexto moderado; en GPUs de 16 GB solo con cuantizaciones muy bajas y contexto limitado, o con offloading parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python). El repositorio está etiquetado como "endpoints_compatible". Para el modelo base en safetensors podrían usarse vLLM o TGI, pero no se documenta en esta información.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AxonMed-32B-Titan-i1-GGUF | ~32,8B | No disponible | Apache 2.0 | GGUF | Especializado en dominio médico (USMLE, ICD, RxNorm) |
| Saathimed/AxonMed-32B-Titan | ~32,8B | No disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar del que deriva esta ficha |
| mradermacher/AxonMed-32B-Titan-GGUF | ~32,8B | No disponible | Apache 2.0 | GGUF | Cuantizaciones estáticas (sin imatrix) del mismo base |

No se dispone de información sobre otros modelos médicos comparables (por ejemplo, variantes de Meditron, BioMistral o MedLLaMA) en la información proporcionada, por lo que no se incluyen datos de rendimiento comparativo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo entrenado principalmente en inglés, puede reflejar sesgos de los corpus médicos anglosajones.
- Riesgo de alucinación: elevado en dominio clínico, como en cualquier LLM; no debe usarse para decisiones diagnósticas o terapéuticas sin validación por profesionales sanitarios.
- Limitaciones de contexto e idioma: solo se declara soporte de inglés; la longitud de contexto no está especificada, lo que impide planificar tareas de documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento normativo sanitario (por ejemplo, RGPD y normativa de dispositivos médicos) antes de desplegarlo en producción.
- Caveat de cuantización: las cuantizaciones de 2 bits (i1-Q2_K) degradan la calidad; para uso clínico conviene emplear Q4_K_M o superior. La propia model card advierte que IQ3_XXS puede ser preferible a Q2_K.
- Ausencia de benchmarks: no hay evidencia publicada de rendimiento que respalde las capacidades declaradas en las etiquetas del modelo.
- Fecha de creación del repositorio: 2026-11-16, con 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face (cuantizado): https://huggingface.co/mradermacher/AxonMed-32B-Titan-i1-GGUF
- Modelo base: https://huggingface.co/Saathimed/AxonMed-32B-Titan
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/AxonMed-32B-Titan-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#AxonMed-32B-Titan-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
