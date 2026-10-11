# Jahirrrr/Klyra-Decision-16M-Recovery-V5.1

## Resumen

Klyra-Decision-16M-Recovery-V5.1 es un modelo de decisión experimental de 16.392.033 parámetros (aproximadamente 16,4 millones), desarrollado por Polyvor Labs y publicado en HuggingFace bajo la cuenta Jahirrrr. Se presenta como una revisión orientada a mejorar la fiabilidad de las decisiones, el aprendizaje multitarea, la comprensión de contexto y la preservación de conocimiento respecto a su predecesor, Klyra-Decision-16M-Generalist-V4, del que deriva mediante fine-tuning. No es un modelo de lenguaje generativo de propósito general, sino un modelo especializado en tareas de decisión estructurada.

Por su tamaño, el modelo pertenece a la categoría sub-20M de parámetros, lo que lo sitúa en el segmento de modelos ultraligeros pensados para experimentación, despliegue en entornos con recursos muy limitados o como componente auxiliar dentro de sistemas mayores. El repositorio ocupa 0,1 GB y los pesos se distribuyen en formato safetensors sobre la librería PyTorch. Los idiomas declarados son inglés (en) e indonesio (id), una combinación poco habitual que sugiere un origen o un conjunto de datos de entrenamiento vinculado a Indonesia.

Su relevancia actual es limitada y estrictamente investigadora: la propia model card lo etiqueta como "Experimental Research Preview", con 16 descargas y 0 likes en el momento de la consulta, sin licencia declarada y sin resultados de evaluación publicados. Resulta útil como caso de estudio de aprendizaje multitarea a escala muy reducida y como banco de pruebas para pipelines de inferencia personalizados (el autor menciona el script `klyra_v51_inference.py`), pero no como componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (no especificada en la información proporcionada) |
| Parámetros totales | 16.392.033 (16,4 M) |
| Parámetros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio distribuye pesos sin cuantizar) |
| Idiomas soportados | Inglés (en) e indonesio (id) |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería PyTorch) |
| Tamaño del repositorio | 0,1 GB |
| Modelo base | Jahirrrr/Klyra-Decision-16M-Generalist-V4 (fine-tuning) |
| Fecha de publicación | 2026-10-11 |
| Descargas / likes | 16 / 0 |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna del modelo. No se especifica si se trata de un transformer denso, un modelo con mezcla de expertos (MoE), una arquitectura de espacio de estados (SSM) o una combinación híbrida, ni el número de capas, la dimensión oculta, el número de cabezas de atención o la función de activación empleada. Tampoco se declara la longitud de contexto soportada ni la estrategia de tokenización. Lo único verificable es el recuento total de parámetros (16.392.033) y que los pesos se almacenan en safetensors bajo PyTorch.

Respecto al entrenamiento, la model card indica que el modelo deriva por fine-tuning de Klyra-Decision-16M-Generalist-V4 y que esta versión "Recovery-V5.1" explora mejoras en cuatro ejes: fiabilidad de las decisiones, aprendizaje multitarea, comprensión de contexto y preservación de conocimiento. No se publican el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF, DPO o decodificación especulativa. Las etiquetas del repositorio (`multitask`, `decision-model`, `research`, `experimental`, `preview`) y la propia model card confirman que el desarrollo sigue activo y que los resultados de evaluación pueden variar según la tarea, el idioma y lo alejado que esté el escenario de los datos vistos durante el entrenamiento.

## Capacidades

- Generación de decisiones estructuradas: el modelo está diseñado específicamente para tareas de decisión, selección entre opciones y clasificación, no como generador de texto abierto.
- Aprendizaje multitarea: la etiqueta `multitask` y la propia descripción indican que se ha entrenado para abordar varios tipos de tarea con un único conjunto de pesos.
- Comprensión de contexto: la versión V5.1 declara mejoras explícitas en el procesamiento de contexto, con una implementación de inferencia específica (`klyra_v51_inference.py`).
- Preservación de conocimiento: se menciona como uno de los objetivos de esta revisión, presumiblemente para mitigar el olvido catastrófico tras el fine-tuning desde la V4.
- Soporte multilingüe limitado a inglés e indonesio.
- No hay evidencia de soporte de tool calling, function calling, razonamiento agéntico multi-paso, visión, audio ni modo de razonamiento explícito ("thinking mode").
- El modelo puede emitir puntuaciones de confianza, pero la propia model card advierte que dichas puntuaciones no garantizan la corrección de la decisión.

## Casos de uso

- Investigación en aprendizaje multitarea a escala reducida: usar el modelo como banco de pruebas para estudiar cómo se comportan 16,4 M de parámetros al compartir representaciones entre varias tareas de decisión, con un coste computacional mínimo por experimento.
- Clasificación y enrutado de bajo coste en prototipos: integrarlo como componente auxiliar que decida entre un conjunto cerrado de opciones (por ejemplo, enrutar una consulta hacia uno de varios servicios) siempre que el prototipo no tenga consecuencias críticas.
- Evaluación de pipelines de inferencia personalizados: el autor distribuye `klyra_v51_inference.py`, por lo que el modelo sirve para validar flujos de preprocesado de contexto y postprocesado de decisiones antes de escalarlos a modelos mayores.
- Despliegue en dispositivos muy limitados para pruebas de concepto: con 16,4 M de parámetros, el modelo cabe en microcontroladores con suficiente memoria, teléfonos de gama baja o entornos de edge sin GPU, lo que permite experimentar con decisiones locales y sin conectividad.
- Generación de datos sintéticos de decisión: usar sus salidas como etiquetas preliminares para construir datasets que después se revisen manualmente y alimenten a modelos mayores.
- Procesamiento de textos en indonesio e inglés en contextos de investigación lingüística: al ser una de las pocas combinaciones en y id publicadas en este rango de tamaño, puede emplearse para estudiar transferencia entre ambos idiomas en tareas de decisión.
- Ablaciones y comparativas de técnicas de fine-tuning: al existir versiones previas (V4, Choice-V3) y finetunes derivados, permite medir el efecto de cambios concretos en el entrenamiento manteniendo constante el tamaño del modelo.

Ninguno de estos casos debe plantearse en producción ni en escenarios de alto riesgo: la model card lo desaconseja explícitamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de ninguna otra suite estándar, y tampoco se han encontrado evaluaciones de terceros en la búsqueda web realizada. No se dispone, por tanto, de cifras de precisión, latencia o throughput medidas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo derivado de los 16.392.033 parámetros, no confirmado por el autor): aproximadamente 65 MB en FP32, 33 MB en FP16/BF16 y 16 MB en INT8.
- Con esas cifras, el modelo cabe holgadamente en cualquier GPU de consumo, incluidas GTX 1050, RTX 3050, RTX 4090 y similares, y también en CPU sin aceleración dedicada.
- Es viable ejecutarlo en dispositivos de borde (Raspberry Pi, Jetson Nano, móviles de gama media) y potencialmente en microcontroladores con varias decenas de MB de RAM.
- GPU de datacenter como A100 o H100 no aportan ninguna ventaja práctica a este tamaño; el cuello de botella sería la latencia de lanzamiento de kernels, no la memoria ni el cómputo.
- Opciones de despliegue: PyTorch nativo es la vía documentada, mediante el script `klyra_v51_inference.py` mencionado en la model card. No hay evidencia de soporte oficial en vLLM, llama.cpp, Ollama o TGI, y al no haber pesos GGUF publicados habría que convertirlos manualmente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No hay información suficiente para establecer una comparativa rigurosa. Los únicos modelos relacionados identificados son de la misma familia o del mismo autor, y no se dispone de sus especificaciones completas ni de benchmarks comunes.

| Modelo | Parámetros | Contexto | Licencia | Relación |
|---|---|---|---|---|
| Klyra-Decision-16M-Recovery-V5.1 | 16,4 M | No disponible | No disponible | Modelo analizado |
| Klyra-Decision-16M-Generalist-V4 | 16,4 M (aproximado) | No disponible | No disponible | Modelo base del que deriva por fine-tuning |
| Klyra-Decision-16M-Choice-V3 | 16,4 M (aproximado) | No disponible | No disponible | Versión previa, centrada en selección estructurada de opciones |
| Klyra-Decision-16M-MultiTask-Generalist-V5 | 16,4 M | No disponible | No disponible | Finetune derivado de la misma rama, publicado por el mismo autor |
| Klyra-64M | 64 M | No disponible | No disponible | Familia mayor del mismo autor; proyecto académico de estudiantes de Politeknik Negeri Jakarta, orientado a modelado eficiente y destilación sub-100M. La relación exacta con esta rama no está confirmada |

No se han identificado alternativas externas comparables en el segmento de "modelos de decisión" de ~16 M de parámetros con documentación pública verificable, por lo que no se incluye una comparación con modelos de terceros.

## Limitaciones y advertencias

- La model card advierte explícitamente de que el modelo puede producir decisiones incorrectas o inconsistentes.
- Puede fallar en razonamiento complejo y en tareas poco familiares.
- Las puntuaciones de confianza que emite no son garantía de corrección.
- El propio autor lo desaconseja para decisiones de alto riesgo o para uso en producción.
- Estado "Experimental Research Preview": el modelo sigue en desarrollo activo y su comportamiento puede cambiar entre versiones.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido. Ante la ausencia de licencia explícita, debe asumirse que no hay autorización clara para uso comercial y conviene contactar con el autor antes de cualquier explotación.
- Cobertura idiomática limitada a inglés e indonesio; no hay evidencia de soporte de castellano.
- No se especifica la longitud de contexto, por lo que se desconoce el límite práctico de entrada y el riesgo de degradación en entradas largas.
- Sin benchmarks publicados ni evaluaciones independientes, no es posible estimar la calidad real frente a alternativas.
- Riesgo de sesgos: al no documentarse la composición del dataset de entrenamiento, no puede evaluarse qué sesgos lingüísticos, culturales o de dominio puede haber absorbido el modelo.
- Advertencia de seguridad: cualquier integración debe tratar sus salidas como sugerencias no verificadas y someterlas a validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jahirrrr/Klyra-Decision-16M-Recovery-V5.1
- Modelo base (Klyra-Decision-16M-Generalist-V4): https://huggingface.co/Jahirrrr/Klyra-Decision-16M-Generalist-V4
- Versión previa (Klyra-Decision-16M-Choice-V3): https://huggingface.co/Jahirrrr/Klyra-Decision-16M-Choice-V3
- Listado de finetunes derivados del modelo base: https://huggingface.co/models?other=base_model:finetune:Jahirrrr/Klyra-Decision-16M-Generalist-V4
- Familia mayor del mismo autor (Klyra-64M): https://huggingface.co/Jahirrrr/Klyra-64M
- Repositorio GitHub encontrado en la búsqueda, relación con este modelo no confirmada: https://github.com/klyra-ai/docs
- Repositorio GitHub encontrado en la búsqueda, relación con este modelo no confirmada: https://github.com/sra08/Klayr-AI-Scientist-
- Paper, blog o demo oficial: no disponible
