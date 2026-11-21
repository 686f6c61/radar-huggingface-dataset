# mradermacher/Muse-Glimmer-30B-Tachibana-Agent-GGUF

## Resumen

Muse-Glimmer-30B-Tachibana-Agent-GGUF es la versión cuantizada en formato GGUF del modelo sequelbox/Muse-Glimmer-30B-Tachibana-Agent, un modelo de lenguaje de aproximadamente 27.850 millones de parámetros (etiquetado comercialmente como 30B) orientado a razonamiento, generación de código, resolución de problemas y conversación. La cuantización la ha realizado mradermacher, un conocido publicador de versiones GGUF de la comunidad, manteniendo la licencia Apache 2.0 del modelo base.

El modelo se distribuye con un conjunto amplio de cuantizaciones estáticas (desde Q2_K hasta Q8_0, además de IQ4_XS) y con ficheros mmproj para un componente multimodal, lo que indica que el modelo base incorpora capacidades de visión. Está afinado sobre el dataset sequelbox/Tachibana4-DeepSeek-V4-Pro y su tarjeta lo etiqueta como un modelo de agente con especial énfasis en lenguajes de programación (Python, TypeScript, JavaScript, Java, C++, C, C#, Rust, Go, Haskell, Shell, PowerShell) y en entornos cloud (AWS, Azure, GCP).

Su relevancia práctica radica en que ofrece un modelo de ~28B de parámetros en cuantizaciones que caben en GPU de consumo, con licencia permisiva y compatibilidad con el ecosistema llama.cpp/Ollama, lo que lo hace desplegable en local sin depender de infraestructura cloud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformers; se desconoce si es denso o MoE) |
| Parametros totales | 27.854.794.240 (~27,85B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj-Q8_0 y mmproj-f16 (multimodal); variantes imatrix en repo i1-GGUF |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Los metadatos indican que se carga mediante la librería transformers y que el proceso de cuantización se realizó con convert_type hf y output_tensor_quantised, lo que es consistente con un transformer convencional convertido desde pesos Hugging Face a GGUF. La presencia de ficheros mmproj confirma que el modelo incorpora un proyector multimodal, presumiblemente para entrada de imágenes.

El modelo es un fine-tune del checkpoint sequelbox/Muse-Glimmer-30B-Tachibana-Agent, entrenado sobre el dataset sequelbox/Tachibana4-DeepSeek-V4-Pro. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF, DPO o un modo de razonamiento explícito (thinking mode). Las etiquetas del modelo apuntan a un ajuste orientado a instrucciones de código, razonamiento y agentes, pero no hay detalles técnicos publicados al respecto.

## Capacidades

- Generación de texto y conversación multi-turno en inglés, con etiquetas de chat e instruct.
- Generación y razonamiento sobre código en Python, TypeScript, JavaScript, Java, C++, C, C#, Rust, Go, Haskell, Shell/Bash y PowerShell.
- Scripting y automatización en entornos cloud: AWS, Azure y GCP.
- Razonamiento y resolución de problemas (problem-solving), con etiquetas de analytical, rationality y expert.
- Capacidades multimodales: la presencia de ficheros mmproj-Q8_0 y mmproj-f16 indica soporte de entrada de imágenes (no se detalla el alcance exacto).
- Orientación a uso como agente (agent) y a tareas de arquitectura e ingeniería de software según las etiquetas del autor.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking): no disponible en la información proporcionada.

## Casos de uso

- Asistencia de programación en local: con la cuantización Q4_K_M (17,0 GB) el modelo puede ejecutarse en una GPU de consumo de 24 GB y generar código en múltiples lenguajes, lo que permite integrarlo en editores o pipelines sin enviar código propietario a servicios externos.
- Automatización de scripting de infraestructura: sus etiquetas de AWS, Azure, GCP, Bash y PowerShell lo hacen adecuado para generar y revisar scripts de despliegue, tareas de CI/CD y plantillas de infraestructura como código.
- Chatbot técnico de atención a desarrolladores: al estar ajustado para conversación instructiva, puede gestionar consultas multi-turno sobre APIs, errores de compilación y buenas prácticas, siempre que el contexto disponible sea suficiente (longitud de contexto no publicada).
- Revisión y refactorización de código en producción: puede emplearse como paso de análisis en pipelines de integración continua para detectar patrones problemáticos o proponer refactorizaciones en repositorios de C++, Rust o Go.
- Prototipado de agentes de resolución de problemas: las etiquetas de agent, architect y problem-solving sugieren uso en flujos de razonamiento multi-paso, aunque la ausencia de documentación sobre tool calling obliga a validar esta capacidad empíricamente.
- Despliegue en estaciones de trabajo sin GPU de datacenter: las cuantizaciones Q2_K (10,8 GB) y Q3_K_S (12,6 GB) permiten ejecución en GPU de 12-16 GB o en CPU con llama.cpp, útil para entornos de desarrollo con hardware limitado.
- Procesamiento de documentación técnica con imágenes: gracias a los ficheros mmproj, puede emplearse para interpretar diagramas o capturas junto a texto, si bien el soporte multimodal debe verificarse en la práctica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K: ~10,8 GB de pesos; ~12-14 GB de VRAM en total.
  - Q3_K_M: ~13,8 GB; ~15-17 GB en total.
  - IQ4_XS: ~15,4 GB; ~17-19 GB en total.
  - Q4_K_M: ~17,0 GB; ~19-21 GB en total.
  - Q5_K_M: ~19,9 GB; ~22-24 GB en total.
  - Q6_K: ~23,0 GB; ~25-27 GB en total.
  - Q8_0: ~29,7 GB; ~32 GB o más en total.
  - Añadir ~2,2 GB (mmproj-Q8_0) o ~3,9 GB (mmproj-f16) si se usa el componente multimodal.
- GPU recomendadas: RTX 3090/4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB o H100 para Q8_0 y para contextos largos; RTX 4080/4070 Ti Super (16 GB) para Q3_K_M o IQ4_XS con contexto moderado.
- Cabe en GPU de consumo: sí, desde Q2_K en adelante en tarjetas de 12-16 GB, y Q4_K_M en 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base puede servirse con vLLM o TGI en formato safetensors. Los ficheros multi-parte deben concatenarse antes de su uso.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-Tachibana-Agent (este) | ~27,85B | no disponible | Apache 2.0 | GGUF / safetensors | Fine-tune orientado a código y agentes; multimodal vía mmproj |
| Modelo base sequelbox/Muse-Glimmer-30B-Tachibana-Agent | ~27,85B | no disponible | Apache 2.0 | safetensors | Punto de partida sin cuantizar; mismas capacidades declaradas |
| Alternativas de ~30B de la comunidad | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior.
- No se publican la longitud de contexto ni detalles de entrenamiento, lo que dificulta planificar despliegues con ventanas largas o estimar el comportamiento en dominios especializados.
- Riesgo de alucinación inherente a los modelos de ~28B sin datos de evaluación publicados; no hay benchmarks que permitan calibrar su fiabilidad.
- Las etiquetas del autor (expert, architect, engineer, rationality) son declarativas y no están respaldadas por evaluaciones publicadas.
- El soporte de tool calling y de razonamiento multi-paso no está confirmado documentalmente; debe validarse antes de usarlo en agentes en producción.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset de afinado podrían tener condiciones adicionales no reflejadas en esta ficha; conviene verificar el repositorio original.
- El repositorio ocupa 197,5 GB por incluir todas las cuantizaciones; es necesario descargar solo el fichero deseado.
- Los ficheros GGUF multi-parte requieren concatenación previa; un uso incorrecto produce errores de carga.
- El componente multimodal añade VRAM y no está documentado en cuanto a resolución de imagen o tipos soportados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Muse-Glimmer-30B-Tachibana-Agent-GGUF
- Modelo base: https://huggingface.co/sequelbox/Muse-Glimmer-30B-Tachibana-Agent
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Muse-Glimmer-30B-Tachibana-Agent-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Muse-Glimmer-30B-Tachibana-Agent-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/sequelbox/Tachibana4-DeepSeek-V4-Pro
- Guía de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
