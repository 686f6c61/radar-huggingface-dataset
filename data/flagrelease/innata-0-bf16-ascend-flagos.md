# FlagRelease/Innata-0-BF16-ascend-FlagOS

## Resumen

Innata-0 es un sistema de mundo encarnado (embodied world system) desarrollado por BAAI (Beijing Academy of Artificial Intelligence) que combina comprensión del mundo, predicción visual condicionada por acciones y generación de acciones robóticas. El repositorio `FlagRelease/Innata-0-BF16-ascend-FlagOS` es una adaptación del modelo base para su ejecución sobre hardware Ascend de Huawei, distribuida por la comunidad FlagOS como parte de su programa de soporte cross-chip "Day0" para seis plataformas: NVIDIA, MetaX, Hygon, Ascend, Moore Threads y T-Head. Los pesos se distribuyen en formato BF16 y safetensors, con un tamaño de repositorio de 113,8 GB.

El modelo se articula en dos componentes. Innata-0-WAM (World-Action Model) emplea una arquitectura Mixture-of-Transformers de tres torres para modelar conjuntamente la comprensión del mundo, la predicción visual y la generación de acciones y señales táctiles. Innata-0-Agent se encarga de la planificación de tareas, la validación de ejecución, la recuperación de errores y la acumulación de experiencia reutilizable. La combinación de ambos eleva la tasa de éxito en el benchmark de simulación RoboCasa365 del 60,2% al 65,4% en tareas generales, y del 32,4% al 43,6% en tareas composicionales no vistas.

La relevancia de esta ficha concreta radica en que no se trata del modelo original, sino de un artefacto de despliegue empaquetado con una imagen de contenedor FlagOS-Ascend, scripts de inferencia preconfigurados y validación de consistencia frente a los stacks nativos. Está orientado a investigadores y equipos de robótica que necesiten evaluar o desplegar modelos encarnados sobre aceleradores Ascend 910C sin tener que reconstruir la pila de software desde cero.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers de tres torres (Innata-0-WAM) más stack de agente (Innata-0-Agent) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (única variante publicada en este repositorio) |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |
| Hardware de referencia | Huawei Ascend 910C (4 tarjetas en la configuración documentada) |
| Stack de software | CANN 8.5.0, driver 25.5.0, vLLM 0.20.2, FlagGems, openEuler 22.03 LTS-SP4 |
| Tamaño del repositorio | 113,8 GB |
| Fecha de publicación | 26 de noviembre de 2026 |

## Arquitectura y entrenamiento

Innata-0-WAM se construye sobre una arquitectura Mixture-of-Transformers con tres torres especializadas que comparten un espacio latente común: una torre de comprensión del mundo (procesamiento de observaciones visuales y contexto de la escena), una torre de predicción visual condicionada por acciones (generación de fotogramas futuros dado un curso de acción) y una torre de generación de acciones y señales táctiles. Este diseño de co-diseño modelo-agente es poco habitual en modelos encarnados publicados, donde lo común es un único transformer multimodal con cabezas de acción añadidas. El componente Innata-0-Agent opera como capa externa de planificación y validación, con capacidad de recuperación ante errores y acumulación de experiencia reutilizable entre episodios.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o aprendizaje por imitación. Tampoco se detalla si se emplearon innovaciones como decodificación especulativa o atención lineal. La model card se centra en el proceso de adaptación cross-chip y en las instrucciones de despliegue, no en la metodología de entrenamiento. La integración con FlagGems incluye una lista explícita de operadores excluidos por incompatibilidad en NPU (`outer`, `index`, `gather`, `conv3d`, `addmm`, `embedding`, entre otros), lo que sugiere que parte del grafo computacional depende de operadores no optimizados en el backend Ascend.

## Capacidades

- Comprensión del mundo encarnado: interpretación de escenas visuales y contexto físico para fundamentar decisiones de acción.
- Predicción visual condicionada por acciones: generación de fotogramas futuros dado un plan de acción, útil para simulación y planificación.
- Generación de acciones robóticas: producción de comandos motores a partir de observaciones y objetivos de tarea.
- Generación de señales táctiles: la tercera torre del WAM modela modalidad táctil junto con la acción.
- Planificación de tareas multi-paso mediante Innata-0-Agent.
- Validación de ejecución y recuperación de errores dentro del bucle agente.
- Acumulación de experiencia reutilizable entre episodios.
- Soporte bilingüe chino-inglés en las interfaces de texto del sistema.
- Ejecución sobre seis backends de hardware distintos mediante la pila FlagOS.

## Casos de uso

- Investigación en manipulación robótica simulada: uso del WAM con el stack de agente sobre RoboCasa365 para evaluar políticas de acción en tareas de composición novedosa, donde el agente eleva la tasa de éxito del 32,4% al 43,6%.
- Planificación de tareas de largo horizonte en entornos domésticos simulados: Innata-0-Agent descompone objetivos complejos en subtareas, valida cada ejecución y reintenta ante fallo, lo que reduce la intervención manual en bucles de evaluación.
- Predicción de dinámica visual para model-based planning: la torre de predicción condicionada por acciones permite simular el resultado de una secuencia motora antes de ejecutarla, útil en entornos donde el ensayo real es costoso o peligroso.
- Despliegue sobre infraestructura Ascend en entornos con restricciones de suministro: la imagen FlagOS-Ascend con CANN 8.5.0 y vLLM 0.20.2 permite poner el modelo en marcha en minutos sobre 910C, relevante para laboratorios que operan hardware no-NVIDIA.
- Evaluación comparativa de stacks de software: los scripts de validación de consistencia permiten contrastar resultados y eficiencia de inferencia entre el stack FlagOS y los stacks nativos del fabricante en los mismos benchmarks públicos.
- Generación de datos sintéticos de interacción: la capacidad de predecir observaciones futuras condicionadas por acción sirve para aumentar datasets de entrenamiento de políticas robóticas con episodios sintéticos etiquetados.
- Prototipado de sistemas con modalidad táctil: la torre táctil del WAM habilita experimentos de agarre y manipulación que requieren realimentación de contacto, un caso poco cubierto por modelos encarnados puramente visuales.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden al benchmark de simulación RoboCasa365, comparando el WAM base frente al WAM con el stack de agente completo:

| Configuración | Tasa de éxito global | Tasa de éxito en tareas composicionales no vistas |
|---|---|---|
| Innata-0-WAM (base) | 60,2% | 32,4% |
| Innata-0-WAM + Innata-0-Agent | 65,4% | 43,6% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje en la información disponible, lo que es coherente con la naturaleza encarnada del modelo. Tampoco se dispone de métricas de latencia o throughput medidas de forma independiente.

## Requisitos de hardware

- VRAM/NPU estimada: el repositorio pesa 113,8 GB en BF16, por lo que la inferencia requiere al menos esa cantidad de memoria de acelerador distribuida; la configuración documentada emplea 4 tarjetas Ascend 910C.
- GPU/NPU recomendadas: Huawei Ascend 910C (configuración de referencia con 4 tarjetas). La comunidad FlagOS indica adaptación para NVIDIA, MetaX, Hygon, Moore Threads y T-Head, aunque esta ficha concreta solo documenta el camino Ascend.
- GPU de consumo: no disponible. El tamaño del modelo en BF16 (más de 100 GB) descarta su ejecución en tarjetas consumer de 24 GB o 48 GB sin cuantización adicional, y no se publican variantes GGUF ni INT8/INT4 en este repositorio.
- Opciones de despliegue: contenedor Docker FlagOS-Ascend con vLLM 0.20.2, FlagGems como backend de operadores, scripts de inferencia para los modos Understanding, ACWM y WAM-RoboDojo. No se documenta soporte de llama.cpp, Ollama ni TGI en esta variante.
- Latencia y throughput: no disponible. La model card menciona validación de eficiencia de inferencia frente a stacks nativos, pero no publica cifras concretas en el extracto disponible.

## Comparativa con modelos similares

No se dispone de información suficiente en la documentación proporcionada para establecer una comparativa rigurosa con alternativas de la misma categoría. Los modelos encarnados comparables (políticas visión-lenguaje-acción y world models robóticos) no aparecen referenciados en la model card, y no se publican parámetros totales ni métricas de lenguaje que permitan una tabla homogénea. Los únicos puntos de comparación internos son las dos configuraciones del propio sistema (WAM base frente a WAM más agente) recogidas en la sección de benchmarks.

| Criterio | Innata-0 (esta variante) | Alternativas |
|---|---|---|
| Parámetros totales | no disponible | no disponible |
| Contexto | no disponible | no disponible |
| Licencia | Apache 2.0 | no disponible |
| Soporte hardware | Ascend 910C documentado; seis backends vía FlagOS | no disponible |

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un artefacto recién publicado sin validación comunitaria independiente.
- Es una adaptación de despliegue, no el modelo original: los pesos están empaquetados para Ascend y el soporte de otros backends se anuncia a nivel de comunidad FlagOS, no se verifica en esta ficha.
- La lista de operadores excluidos de FlagGems (`outer`, `index`, `gather`, `conv3d`, `addmm`, `embedding`, `lift_fresh`, `mul`, `div`, `sub`, `add`) sugiere degradación potencial de rendimiento frente al stack nativo en las rutas afectadas.
- No se publican datos sobre sesgos, composición del dataset de entrenamiento ni evaluación de alucinación; en un modelo encarnado, los fallos de predicción se traducen en acciones físicas incorrectas, con riesgo material en entornos reales.
- El soporte lingüístico se limita a chino e inglés; no hay evidencia de capacidades en castellano.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la ausencia de información sobre la procedencia de los datos de entrenamiento impide evaluar garantías de propiedad intelectual en producción.
- El modelo está diseñado para simulación y robótica; su uso fuera de ese dominio no está documentado y los resultados de RoboCasa365 no son extrapolables a entornos reales sin validación adicional.
- La configuración de referencia exige 4 aceleradores Ascend 910C, un coste de infraestructura elevado que limita la reproducibilidad en laboratorios pequeños.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FlagRelease/Innata-0-BF16-ascend-FlagOS
- Imagen de contenedor FlagOS-Ascend: `harbor.baai.ac.cn/flagrelease-public/innata-0-ascend001-gems5.4.0-tree0.7.1-cx0.14.0-pluginnone-vllm0.20.2-sglangnone-sglangflnone-cp311-ptnpunone-cann90-a64-none:202611270814`
- Descarga de pesos vía ModelScope: `modelscope download --model FlagRelease/Innata-0-BF16-ascend-FlagOS`
- Organización BAAI: https://www.baai.ac.cn
- No se han encontrado en la información disponible enlaces a papers, blogs técnicos, repositorios de código o demos adicionales.
