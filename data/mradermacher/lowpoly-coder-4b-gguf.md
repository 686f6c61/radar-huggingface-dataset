# mradermacher/lowpoly-coder-4b-GGUF

## Resumen

lowpoly-coder-4b-GGUF es la versión cuantizada en formato GGUF del modelo townbox/lowpoly-coder-4b, un modelo especializado en la generación de código JavaScript para escenas 3D de bajo poligonaje (low-poly) construidas con Three.js y exportables en formato GLB. El trabajo de cuantización lo firma mradermacher, un conocido distribuidor de quants estáticos para llama.cpp, y el modelo base lo desarrolla townbox. La relevancia de esta ficha radica en que se trata de un modelo de nicho muy concreto: no aspira a competir en razonamiento general, sino a resolver una tarea de generación de código muy específica dentro de pipelines de creación de assets 3D.

El dato de parámetros es llamativo: aunque el nombre comercial indica "4b", los pesos en safetensors suman 333.514.240 parámetros (aproximadamente 0,33B). Esta discrepancia debe tenerse en cuenta al planificar despliegues, ya que el tamaño real del repositorio es de 1,0 GB y el modelo es mucho más ligero de lo que sugiere su denominación. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

Al tratarse de un modelo especializado en una tarea de generación de código estructurado (Three.js + GLB), su valor está en la consistencia sintáctica y en el conocimiento de las APIs de Three.js, no en capacidades conversacionales amplias. Esta versión GGUF facilita su ejecución en CPU y en GPUs de consumo mediante llama.cpp y ecosistemas compatibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 333.514.240 (según safetensors) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS; además de mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base (tipo de transformer, número de capas, dimensiones ocultas, mecanismo de atención) en la documentación proporcionada. El nombre comercial "4b" no coincide con el recuento real de parámetros en safetensors (333.514.240), por lo que no debe asumirse que se trata de un modelo de 4.000 millones de parámetros. Tampoco se especifica la longitud de contexto nativa ni el tokenizador empleado.

Sí se conoce el dataset de entrenamiento: townbox/lowpoly-coder-4b-data, orientado a la generación de código Three.js para escenas low-poly y exportación a GLB. No se documentan el número de tokens de entrenamiento, la composición exacta del corpus, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. La presencia de ficheros mmproj (Q8_0 y f16) en el repositorio sugiere que el modelo base incorpora algún componente multimodal, probablemente visión, aunque la model card no lo detalla y la naturaleza de la tarea (generación de código 3D) no lo hace evidente.

## Capacidades

- Generación de código JavaScript centrado en Three.js para construir escenas 3D de estilo low-poly.
- Generación de geometría y estructuras exportables en formato GLB.
- Conocimiento especializado de APIs de Three.js (geometrías, materiales, luces, cámaras, escenas).
- Soporte declarado de un componente multimodal mediante ficheros mmproj (visión), aunque no se detalla su alcance.
- Capacidad de generación de código en un único idioma: inglés.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de matemáticas, razonamiento general ni modo "thinking".

## Casos de uso

- Generación automática de escenas Three.js para prototipado rápido: el modelo puede producir el código JavaScript de una escena low-poly (cámara, luces, geometrías) a partir de una descripción textual, lo que acelera la creación de maquetas para videojuegos o visualizaciones web.
- Creación de assets GLB en pipelines de contenido 3D: integrado en un script que reciba una especificación y devuelva el código que genera y exporta el modelo GLB, útil para equipos de arte técnico que necesiten variaciones masivas de objetos low-poly.
- Herramienta interna para desarrolladores de Three.js: como asistente de autocompletado o generación de fragmentos de código de Three.js en el IDE, reduciendo el tiempo de consulta de la documentación de la librería.
- Generación de escenas para demos web interactivas: producción de código listo para insertar en una página con Three.js, orientado a portfolios, landing pages o experiencias inmersivas ligeras.
- Automatización de pruebas de renderizado: generar variantes de escenas low-poly para validar pipelines de render, shaders o exportadores GLB sin intervención manual.
- Educación y formación en gráficos 3D: usar el modelo para producir ejemplos didácticos de código Three.js que ilustren conceptos de geometría, materiales e iluminación en low-poly.
- Preprocesado de datasets 3D: generar pares texto-código para aumentar datasets de entrenamiento de otros modelos especializados en generación de código 3D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~0,33B parámetros, las cuantizaciones Q4_K_M y Q5_K_M ocupan del orden de cientos de MB; el repositorio completo es de 1,0 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para las cuantizaciones más pequeñas; RTX 3060, RTX 4060, RTX 4090 o superiores no suponen ningún problema. También es viable en CPU.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer actuales, e incluso en sistemas integrados con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; los ficheros mmproj permiten su uso con runtimes multimodales de llama.cpp.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera una latencia baja en GPU y aceptable en CPU, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (generación de código Three.js/GLB) en la documentación proporcionada. Como referencia de tamaño, el modelo base townbox/lowpoly-coder-4b es el único punto de comparación directo, y esta versión GGUF es una cuantización del mismo.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| lowpoly-coder-4b (base) | 333.514.240 (safetensors) | no disponible | apache-2.0 | Hugging Face |
| lowpoly-coder-4b-GGUF (este) | 333.514.240 | no disponible | apache-2.0 | Hugging Face (GGUF) |
| Alternativas especializadas en Three.js | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El nombre "4b" induce a error: el recuento real de parámetros en safetensors es de 333.514.240, muy inferior a 4.000 millones. Verificar siempre el tamaño real antes de dimensionar infraestructura.
- Modelo de nicho: su utilidad fuera de la generación de código Three.js/GLB es muy limitada; no debe emplearse como asistente general.
- Solo inglés: no se declara soporte de castellano ni de otros idiomas, lo que limita su uso en productos dirigidos a usuarios hispanohablantes sin traducción intermedia.
- Riesgo de alucinación en APIs: como todo modelo de código, puede inventar métodos o propiedades de Three.js inexistentes; es imprescindible validar el código generado antes de ejecutarlo en producción.
- Sin datos de benchmarks: no hay evidencia publicada de calidad, por lo que la evaluación debe hacerse con un conjunto de pruebas propio.
- Contexto desconocido: al no documentarse la longitud de contexto, no se puede garantizar el manejo de especificaciones largas o conversaciones multi-turno extensas.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y del dataset de entrenamiento por si hubiera restricciones adicionales no reflejadas en la model card.
- Cuantizaciones estáticas: el autor indica que no hay quants ponderados/imatrix disponibles en el momento de la publicación, lo que puede afectar ligeramente a la calidad frente a quants dinámicos.
- Fecha de creación futura (2026-11-05): la metadata del repositorio indica una fecha posterior a la actual, lo que puede deberse a un error de registro; conviene verificar la vigencia del modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/lowpoly-coder-4b-GGUF
- Modelo base: https://huggingface.co/townbox/lowpoly-coder-4b
- Dataset de entrenamiento: https://huggingface.co/datasets/townbox/lowpoly-coder-4b-data
- Página de descargas del autor: https://hf.tst.eu/model#lowpoly-coder-4b-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
