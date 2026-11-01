# mradermacher/Capek0.5-35B-A3B-i1-GGUF

## Resumen

Capek0.5-35B-A3B es un modelo de lenguaje y visión de tipo mixture-of-experts (MoE) desarrollado por XPeng Robotics, orientado a inteligencia corporizada (embodied intelligence), razonamiento espacial, comprensión de vídeo y robótica. Este repositorio concreto, publicado por mradermacher, contiene cuantizaciones GGUF del modelo base `xpeng-robotics/Capek0.5-35B-A3B` generadas con calibración imatrix, lo que permite ejecutar un modelo de aproximadamente 35.000 millones de parámetros totales en hardware de consumo mediante llama.cpp y derivados.

El modelo resuelve el problema de dotar a sistemas robóticos y agentes multimodales de un núcleo de razonamiento que combine percepción visual, comprensión temporal de vídeo y razonamiento espacial, capacidades que los LLM puramente textuales no cubren. Su relevancia actual radica en la creciente demanda de modelos abiertos que sirvan como política o planificador en pipelines de robótica, donde la licencia Apache 2.0 y la disponibilidad de cuantizaciones ligeras facilitan el despliegue en entornos de investigación y prototipado.

El nombre "A3B" sugiere una arquitectura MoE con aproximadamente 3.000 millones de parámetros activos por token, aunque este dato no está confirmado en la información disponible. El repositorio incluye cuantizaciones desde IQ1_S (7,6 GB) hasta Q6_K (28,6 GB), lo que abarca desde GPUs de gama media hasta estaciones de trabajo con 24 GB o más de VRAM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) multimodal visión-lenguaje, según nomenclatura A3B; detalles internos no disponibles |
| Parámetros totales | 34.660.610.688 (≈34,7 B) |
| Parámetros activos | no disponible (la nomenclatura A3B sugiere ≈3 B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (calibradas con imatrix); también existen cuantizaciones estáticas en el repo hermano |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); el modelo base en safetensors/transformers |

## Arquitectura y entrenamiento

La información disponible confirma que se trata de un modelo MoE con capacidades de visión-lenguaje, razonamiento espacial y comprensión de vídeo, entrenado con técnicas de aprendizaje por refuerzo (la pipeline declarada es `reinforcement-learning` y entre las etiquetas figuran `reinforcement-learning`, `embodied-intelligence` y `robotics`). El tamaño total de 34,66 mil millones de parámetros y la designación A3B apuntan a una arquitectura de expertos dispersos con un subconjunto reducido de parámetros activos por token, lo que explicaría la viabilidad de las cuantizaciones pequeñas (IQ1_S en 7,6 GB).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso concreto de RLHF/DPO ni innovaciones técnicas específicas (atención lineal, decodificación especulativa, etc.). El modelo incluye un componente de proyección multimodal (mmproj) para el procesamiento de imágenes, alojado en el repositorio de cuantizaciones estáticas. Las cuantizaciones de este repositorio emplean calibración imatrix ponderada, lo que mejora la fidelidad respecto a cuantizaciones estáticas del mismo tamaño.

## Capacidades

- Generación de texto conversacional en inglés.
- Comprensión de imágenes (vision-language): el modelo base está etiquetado como vision-language y dispone de ficheros mmproj para el encoder visual.
- Comprensión de vídeo: etiqueta `video-understanding` en la model card.
- Razonamiento espacial: etiqueta `spatial-reasoning`, orientado a tareas de percepción 3D y navegación.
- Inteligencia corporizada y robótica: etiqueta `embodied-intelligence` y `robotics`, lo que sugiere uso como planificador o política en agentes físicos.
- Aprendizaje por refuerzo: pipeline declarada `reinforcement-learning`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Modo thinking explícito, audio u otras modalidades: no disponible.

## Casos de uso

- Planificación de tareas robóticas: el modelo puede actuar como planificador de alto nivel que, a partir de una instrucción en lenguaje natural y de observaciones visuales, genere secuencias de acciones para un manipulador o robot móvil; su etiqueta de robótica y razonamiento espacial lo hace adecuado para este rol.
- Comprensión de vídeo en inspección industrial: procesar secuencias de vídeo de cámaras fijas para detectar anomalías o describir eventos temporales, aprovechando la capacidad de video-understanding del modelo base.
- Asistencia a operarios con percepción visual: un asistente que recibe capturas de cámara y responde preguntas sobre el estado de una línea de producción, combinando visión y diálogo multi-turno.
- Investigación en inteligencia corporizada: servir como modelo de referencia abierto (Apache 2.0) para experimentos de simulación a realidad (sim-to-real), al poder ejecutarse en GPUs de consumo con cuantizaciones Q4.
- Prototipado de agentes multimodales en local: con la cuantización i1-Q4_K_M (21,3 GB) el modelo cabe en una RTX 4090 de 24 GB, lo que permite iterar en estación de trabajo sin depender de APIs externas.
- Navegación asistida y razonamiento espacial: interpretar imágenes de profundidad o vistas de entorno para responder preguntas de orientación ("¿qué hay a la izquierda del pasillo?"), útil en prototipos de robótica de servicio.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 24 variantes GGUF con distintos tamaños, lo que permite estudiar la degradación de calidad en tareas de razonamiento visual y espacial según el nivel de cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, según cuantización: IQ1_S ≈ 7,6 GB; IQ2_M ≈ 11,8 GB; IQ3_M ≈ 15,5 GB; Q4_K_M ≈ 21,3 GB; Q5_K_M ≈ 24,8 GB; Q6_K ≈ 28,6 GB. Añadir aproximadamente 1-3 GB adicionales para el contexto KV cache y el proyector mmproj en tareas de visión.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M con margen ajustado; RTX 3090 (24 GB) similar; A100 40/80 GB, H100 o L40S para cuantizaciones Q5/Q6 y contextos largos; GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080) solo con cuantizaciones IQ2/IQ3.
- Cabe en GPU de consumo: sí, desde IQ1_S en GPUs de 8 GB (con riesgo de calidad muy degradada) hasta Q4_K_M en 24 GB.
- Opciones de despliegue: llama.cpp y sus frontends (Ollama, LM Studio, llama-cpp-python); el formato GGUF es compatible con servidores compatibles con endpoints (la model card incluye la etiqueta `endpoints_compatible`). Para el modelo base en safetensors, vLLM o TGI si el soporte de la arquitectura MoE multimodal está implementado (no confirmado).
- Latencia y throughput: no disponibles. Al ser MoE con pocos parámetros activos, se espera un throughput superior al de un modelo denso de 35 B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Capek0.5-35B-A3B (este) | 34,7 B totales (MoE) | no disponible | Apache 2.0 | GGUF + safetensors | Multimodal visión/vídeo/robótica |
| Qwen2.5-VL-32B | ≈32 B densos | 128 K (según versión) | Apache 2.0 (mayoría de variantes) | safetensors, GGUF de terceros | Visión-lenguaje generalista |
| InternVL2.5-38B | ≈38 B densos | 32 K o superior | MIT (según variante) | safetensors, GGUF de terceros | Visión-lenguaje con buen rendimiento en documentos |
| Gemma 3 27B | 27 B densos | 128 K | Gemma license (uso comercial con restricciones) | safetensors, GGUF oficiales | Multimodal imagen, sin vídeo nativo |

La comparación cuantitativa de rendimiento no está disponible porque no se han publicado benchmarks de Capek0.5 en la información proporcionada. La ventaja estructural de Capek0.5 frente a alternativas densas es su naturaleza MoE, que reduce los parámetros activos y, por tanto, el coste computacional por token en inferencia.

## Limitaciones y advertencias

- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado ni evaluado.
- Sesgos: no se ha publicado información sobre sesgos demográficos, culturales o de otro tipo; se recomienda auditoría previa a producción.
- Alucinación: como todo LLM, puede generar descripciones visuales o respuestas factualmente incorrectas, especialmente en cuantizaciones de baja precisión (IQ1, Q2).
- Cuantizaciones extremas: las variantes IQ1_S, IQ1_M y Q2_K_S degradan notablemente la calidad; el propio autor las describe como "for the desperate" o "very low quality".
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base y de los datos de entrenamiento (no detallados).
- Contexto: se desconoce la longitud máxima de contexto, lo que impide planificar despliegues con documentos largos o vídeos extensos sin pruebas empíricas.
- Soporte de tooling: no confirmado soporte de function calling ni de protocolos de agentes; la integración en pipelines de agentes requiere validación manual.
- Madurez: el modelo base se publicó recientemente (repositorio creado el 31 de octubre de 2026) y tiene pocas descargas (1.239) y cero likes, lo que indica escasa validación comunitaria.
- Repositorio de 371 GB: descargar el conjunto completo de cuantizaciones es inviable en la mayoría de entornos; conviene descargar solo el fichero GGUF necesario.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/mradermacher/Capek0.5-35B-A3B-i1-GGUF
- Modelo base: https://huggingface.co/xpeng-robotics/Capek0.5-35B-A3B
- Licencia del modelo base: https://huggingface.co/xpeng-robotics/Capek0.5-35B-A3B/blob/main/LICENSE
- Cuantizaciones estáticas (incluye mmproj): https://huggingface.co/mradermacher/Capek0.5-35B-A3B-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Capek0.5-35B-A3B-i1-GGUF
- Paper referenciado (arXiv:2608.06756): https://arxiv.org/abs/2608.06756
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
