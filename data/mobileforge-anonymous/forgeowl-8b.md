# mobileforge-anonymous/ForgeOwl-8B

## Resumen

ForgeOwl-8B es un modelo de lenguaje y visión (VLM) especializado en la interacción con interfaces gráficas móviles, desarrollado por el equipo anónimo detrás del proyecto MobileForge como parte de un artifact de revisión para ICLR. Se trata de una adaptación del modelo mPLUG/GUI-Owl-1.5-8B-Instruct mediante el método MobileForge, que emplea un pipeline de adaptación sin anotaciones humanas: utiliza los propios rollouts del modelo, feedback crítico jerárquico, pistas correctivas y optimización GRPO a nivel de paso contextualizado. El resultado es un agente capaz de ejecutar tareas en entornos Android y otras plataformas móviles a partir de capturas de pantalla.

El modelo cuenta con 8.767 millones de parámetros y se distribuye en formato safetensors bajo licencia MIT. Su relevancia actual radica en que demuestra que es posible adaptar un modelo de GUI a nuevas tareas sin necesidad de datos etiquetados manualmente, alcanzando un 67,2% de éxito Pass@1 en AndroidWorld (78 de 116 tareas) y un 41,0% en el split GUI-only de MobileWorld, un benchmark fuera de dominio. Está pensado para investigadores y desarrolladores que trabajan en automatización de interfaces móviles y agentes autónomos, aunque el repositorio se presenta como un artifact de evaluación y no como un producto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (basado en mPLUG/GUI-Owl-1.5-8B-Instruct) |
| Parametros totales | 8.767.123.696 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | No disponibles (el README no especifica) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ForgeOwl-8B hereda la arquitectura de GUI-Owl-1.5-8B-Instruct, un modelo de lenguaje y visión diseñado para razonar sobre capturas de pantalla de dispositivos móviles y generar acciones de UI (toques, deslizamientos, texto). No se han publicado detalles adicionales sobre la estructura interna (número de capas, atención, etc.) en la información disponible, pero al estar basado en la familia Qwen-VL, se asume una arquitectura transformer multimodal con codificador de visión y decodificador de lenguaje. El tag `qwen3_vl` en HuggingFace sugiere compatibilidad con la familia Qwen3-VL, aunque no se confirma oficialmente.

El entrenamiento de adaptación se realizó con MobileForge sobre 900 tareas generadas automáticamente a partir de aplicaciones objetivo. El proceso no utiliza ninguna tarea escrita por humanos, demostraciones ni etiquetas de recompensa. En su lugar, se emplean los propios rollouts del modelo, un crítico jerárquico que evalúa la corrección de las acciones, y pistas correctivas que se incorporan al contexto del modelo. La optimización se realiza mediante GRPO (Group Relative Policy Optimization) a nivel de paso, con el contexto de la pista incluido. Este enfoque permite mejorar el rendimiento del agente sin supervisión humana directa, lo que constituye una innovación metodológica relevante para el campo de los agentes de GUI.

## Capacidades

- Generacion de acciones de interfaz: dado un screenshot y una instruccion en lenguaje natural, el modelo produce una secuencia de acciones de UI (tap, swipe, type, etc.) para completar la tarea.
- Razonamiento multimodal: combina informacion visual de la pantalla con el contexto textual de la instruccion para decidir el siguiente paso.
- Adaptacion a tareas nuevas sin anotaciones: gracias al entrenamiento con MobileForge, puede generalizar a tareas no vistas durante el entrenamiento, como demuestra su rendimiento en MobileWorld.
- Soporte multi-intento: el modelo es evaluado con Pass@1, Pass@2 y Pass@3, lo que indica que puede beneficiarse de multiples intentos o estrategias de exploracion.
- Interfaz compatible con GUI-Owl: carga y uso identicos al modelo base, lo que facilita su integracion en pipelines existentes de agentes de GUI.

## Casos de uso

- Automatizacion de pruebas de apps Android: ForgeOwl-8B puede recorrer flujos de una aplicacion siguiendo instrucciones en lenguaje natural, lo que permite generar tests de humo o de regresion sin escribir scripts manuales. Su capacidad de razonar sobre el screenshot actual y ejecutar acciones secuenciales lo hace adecuado para entornos de CI/CD movil.
- Asistentes de accesibilidad: el modelo puede ayudar a usuarios con discapacidad visual a navegar por aplicaciones moviles interpretando la pantalla y ejecutando acciones comandadas por voz o texto. Su licencia MIT permite su integracion en productos comerciales de accesibilidad.
- Investigacion en agentes autonomos: como artifact de investigacion, sirve como punto de partida para estudiar metodos de adaptacion sin anotaciones, comparar estrategias de RL para GUI, o analizar la generalizacion entre distintas plataformas (Android, iOS, etc.).
- Relleno de datos en formularios moviles: el modelo puede completar formularios en apps de banca, comercio o redes sociales a partir de instrucciones como "introduce mi correo y contrasena", siempre que se ejecute en entornos aislados y con supervision.
- Demostraciones interactivas y tutoriales: puede generar secuencias de acciones para mostrar a un usuario como realizar una tarea concreta en una app, sirviendo como base para sistemas de ayuda contextual.
- Evaluacion de benchmarks de GUI: dado que se ha validado en AndroidWorld y MobileWorld, puede utilizarse como baseline o como oraculo para generar datos sinteticos de entrenamiento en nuevos benchmarks de automatizacion movil.

## Benchmarks y rendimiento

Segun la model card y el paper asociado, los resultados de evaluacion son los siguientes:

| Benchmark | Metrica | Resultado |
|---|---|---|
| AndroidWorld (116 tareas) | Pass@1 | 67,2% (78/116) |
| AndroidWorld (116 tareas) | Pass@2 | 75,0% (87/116) |
| AndroidWorld (116 tareas) | Pass@3 | 77,6% (90/116) |
| MobileWorld GUI-only (117 tareas) | Success rate | 41,0% (48/117) |

No se han publicado resultados comparativos con otros modelos en la informacion disponible, aunque el paper menciona que ForgeOwl-8B establece el mejor resultado entre agentes de GUI con datos abiertos en su evaluacion. La pagina del proyecto indica que ForgeQwen3-8B (otra variante adaptada con MobileForge sobre Qwen3-VL-8B) alcanza un 67,24% Pass@3 en AndroidWorld, un valor inferior al de ForgeOwl-8B.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware en la model card ni en el paper.
- Con 8.767 millones de parametros, el modelo en precision fp16 ocuparia aproximadamente 17,5 GB de memoria (tamano del repo safetensors), por lo que se necesita una GPU con al menos 24 GB de VRAM para inferencia sin cuantizacion (por ejemplo, RTX 3090, RTX 4090 o A10G).
- Con cuantizacion a 4 bits (que no se proporciona en el repo, pero podria generarse con herramientas como llama.cpp o AutoGPTQ), el modelo podria caber en GPUs de 12-16 GB, como una RTX 3060 o RTX 4070, aunque no hay garantias de compatibilidad.
- Para despliegue en produccion, se recomienda usar vLLM o TGI si se convierte a un formato optimizado, o bien el codigo de inferencia original de GUI-Owl basado en transformers.
- No se dispone de datos de latencia o throughput medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento AndroidWorld Pass@3 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ForgeOwl-8B (este) | 8,77B | No disponible | 77,6% | MIT | HuggingFace |
| GUI-Owl-1.5-8B-Instruct (base) | ~8B | No disponible | No reportado en la informacion | MIT (probable) | HuggingFace |
| ForgeQwen3-8B | ~8B | No disponible | 67,24% (segun web del proyecto) | MIT (probable) | No verificado |

La comparacion directa con GUI-Owl-1.5-8B-Instruct no se puede realizar con los datos disponibles, ya que el paper no publica los resultados del modelo base en los mismos benchmarks. ForgeQwen3-8B, otra variante de MobileForge, obtiene un rendimiento inferior en AndroidWorld, lo que sugiere que la arquitectura de GUI-Owl es mas adecuada para esta tarea. No se dispone de comparaciones con otros agentes de GUI como AppAgent o AutoUI.

## Limitaciones y advertencias

- El modelo puede realizar acciones incorrectas o inseguras sobre la interfaz. La model card advierte explicitamente que debe ejecutarse solo en entornos de prueba aislados y que las acciones deben ser inspeccionadas antes de usarlas con datos personales.
- No se debe tratar el exito en benchmarks como evidencia de fiabilidad general. El rendimiento en AndroidWorld y MobileWorld no garantiza un comportamiento correcto en apps del mundo real con interfaces complejas o dinamicas.
- El repositorio es un artifact de revision anonima (ICLR). No se han publicado metadatos de autor ni informacion sobre el proceso de entrenamiento completo (datos exactos, hiperparametros, etc.), lo que limita la reproducibilidad externa.
- No se especifican los idiomas soportados. Aunque el modelo base probablemente maneja ingles y chino, no hay confirmacion para otros idiomas.
- La longitud de contexto no esta documentada. Si se necesita procesar historiales largos de interaccion, habria que verificar experimentalmente el limite real.
- La licencia MIT permite uso comercial y modificacion, pero al ser un artifact de investigacion anonimo, puede haber restricciones de atribucion o problemas de propiedad intelectual no declarados.
- No se proporcionan cuantizaciones oficiales. El usuario debe generar sus propias versiones cuantizadas si necesita reducir el consumo de memoria.

## Enlaces

- HuggingFace (repo original): https://huggingface.co/mobileforge-anonymous/ForgeOwl-8B
- HuggingFace (copia de lgy0404): https://huggingface.co/lgy0404/ForgeOwl-8B
- Pagina del proyecto (anonima): https://mobileforge-anonymous.github.io/
- Pagina del proyecto (publica): https://mobile-forge.github.io/
- Paper arXiv: https://arxiv.org/abs/2606.19930
- Version HTML del paper: https://arxiv.org/html/2606.19930v2
- Repositorio de codigo (anonimo): https://github.com/mobileforge-anonymous/MobileForge
- Dataset de resultados de benchmarks: https://huggingface.co/datasets/mobileforge-anonymous/mobileforge-benchmark-results
- Modelo base GUI-Owl-1.5-8B-Instruct: https://huggingface.co/mPLUG/GUI-Owl-1.5-8B-Instruct
