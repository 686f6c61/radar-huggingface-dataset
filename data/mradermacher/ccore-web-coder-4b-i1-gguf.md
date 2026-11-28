# mradermacher/CCORE-Web-Coder-4B-i1-GGUF

## Resumen

CCORE-Web-Coder-4B-i1-GGUF es la distribucion cuantizada en formato GGUF del modelo CCORE-Web-Coder-4B, un modelo de lenguaje especializado en desarrollo web y React desarrollado por el proyecto ccore. Esta version concreta la publica mradermacher, conocido por producir cuantizaciones de alta calidad con calibracion imatrix para la comunidad de inferencia local. El modelo base parte de la arquitectura Qwen 3.5 (etiqueta `qwen3_5` en los metadatos) y cuenta con 4.205.751.296 parametros totales, lo que lo situa en la categoria de modelos compactos aptos para hardware de consumo.

El modelo resuelve el problema de generar codigo y disenos orientados especificamente al desarrollo web moderno, con enfasis declarado en React. Se ha afinado sobre el dataset `ccore/CCORE-Web-Designs`, lo que sugiere una especializacion en la generacion de interfaces y componentes web mas que en codigo generico. La model card indica ademas que se trata de un modelo de vision, con ficheros `mmproj` disponibles en el repositorio estatico, lo que ampliaria su utilidad a tareas de interpretacion de capturas de pantalla o maquetas de diseno.

La relevancia de esta publicacion radica en su formato: la version i1-GGUF ofrece 27 cuantizaciones distintas (desde IQ1_S de 1,6 GB hasta Q6_K de 3,6 GB), lo que permite desplegar el modelo en practicamente cualquier GPU consumer, e incluso en CPU, manteniendo la posibilidad de elegir el equilibrio entre calidad y velocidad. Esta pensada para desarrolladores que quieren un asistente de codigo web local, sin dependencia de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, segun etiqueta `qwen3_5`); soporte de vision con ficheros mmproj |
| Parametros totales | 4.205.751.296 (~4,2 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, Q4_0, IQ4_XS, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (mas fichero imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura de la familia Qwen 3.5, un transformer decoder-only de aproximadamente 4,2 mil millones de parametros. La etiqueta `qwen3_5` en los metadatos de Hugging Face es la unica indicacion explicita de la arquitectura; no se detalla en la informacion disponible si incorpora innovaciones especificas de esa familia (como atencion lineal o decodificacion especulativa), ni se publican detalles sobre el numero de tokens de entrenamiento o la composicion completa del dataset.

El ajuste declarado se realiza sobre el dataset `ccore/CCORE-Web-Designs`, orientado a disenos web, y las etiquetas del modelo enfatizan `web-development` y `react`. No se documenta en la informacion proporcionada si hubo fases de RLHF, DPO u otro tipo de alineamiento, ni los hiperparametros del fine-tuning. La cuantizacion i1 de mradermacher aplica un fichero imatrix (matriz de importancia) generado a partir del modelo original, lo que mejora la calidad de las cuantizaciones de baja precision respecto a las estaticas disponibles en el repositorio hermano `CCORE-Web-Coder-4B-GGUF`.

## Capacidades

- Generacion de codigo web: componentes React, HTML, CSS y JavaScript, segun la especializacion declarada en el modelo base.
- Generacion de disenos e interfaces: el ajuste sobre `CCORE-Web-Designs` apunta a tareas de maquetacion y estructura visual.
- Vision: la model card indica explicitamente que es un modelo de vision, con ficheros `mmproj` en el repositorio estatico, lo que permite procesar imagenes junto con texto.
- Conversacion multi-turno: la etiqueta `conversational` confirma soporte de dialogos.
- Compatibilidad con endpoints: etiqueta `endpoints_compatible`, lo que facilita su despliegue en infraestructuras tipo Inference Endpoints.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language` de la model card.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de codigo React en el IDE: el modelo puede generar y completar componentes React, hooks y estilos CSS dentro de extensiones de editor, aprovechando su especializacion y su tamano compacto (2,8 GB en Q4_K_M) para ejecutarse en la GPU del propio portatil del desarrollador.
- Generacion de maquetas a partir de capturas: gracias a su capacidad de vision y a los ficheros mmproj, puede recibir una captura de una interfaz y producir el codigo HTML/CSS correspondiente, util en flujos de trabajo de diseno a codigo.
- Prototipado rapido de landing pages: generar estructuras completas de paginas web con secciones, formularios y estilos en una sola pasada, reduciendo el tiempo de arranque de prototipos.
- Automatizacion de tareas de refactorizacion web: integrado en scripts o pipelines, puede reescribir fragmentos de codigo legacy a componentes React modernos, con la ventaja de ejecutarse localmente sin enviar codigo propietario a servicios externos.
- Educacion y formacion en desarrollo web: desplegado con Ollama o llama.cpp en un aula o entorno de aprendizaje, permite a los estudiantes experimentar con un asistente de codigo sin coste de API y sin conexion a internet.
- Generacion de documentacion tecnica de componentes: a partir del codigo fuente de un componente, el modelo puede producir descripciones de props, ejemplos de uso y notas de accesibilidad, tarea para la que el contexto conversacional y la especializacion web resultan adecuados.
- Despliegue en entornos con restricciones de privacidad: al ser Apache 2.0 y ejecutable en local, encaja en empresas que no pueden enviar codigo a APIs de terceros, usando la cuantizacion Q4_K_M o Q5_K_M en una GPU consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero GGUF mas el contexto. La cuantizacion Q4_K_M (2,8 GB) requiere en torno a 3,5-4 GB de VRAM con contexto moderado; IQ1_S (1,6 GB) puede ejecutarse con menos de 2,5 GB; Q6_K (3,6 GB) requiere aproximadamente 4,5-5 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4070, RTX 4090, A100 y H100 son mas que suficientes y dejaran margen para contextos largos y batching.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas desde 4 GB de VRAM con Q4_K_M; las cuantizaciones IQ2 e IQ3 permiten incluso GPUs de 2-3 GB o ejecucion parcial en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF como llama-cpp-python; tambien es compatible con endpoints segun la etiqueta `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Al tratarse de un modelo de 4,2 B de parametros, se espera un throughput alto en GPU consumer, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| CCORE-Web-Coder-4B-i1-GGUF | ~4,2 B | no disponible | Desarrollo web / React, vision | Apache 2.0 | GGUF |
| Qwen2.5-Coder-3B | ~3 B | 32K (segun version) | Codigo generico | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-Coder-7B | ~7 B | 32K (segun version) | Codigo generico | Apache 2.0 | safetensors, GGUF |
| CodeGemma-2B | ~2 B | 8K | Codigo generico | Gemma license | safetensors, GGUF |

La comparativa se limita a modelos de tamano y proposito proximos; no se dispone de datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa con estas alternativas. La ventaja diferencial de CCORE-Web-Coder-4B es su especializacion en desarrollo web con vision y su amplia gama de cuantizaciones i1.

## Limitaciones y advertencias

- Idioma: el modelo declara unicamente ingles (`en`); su rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Especializacion estrecha: el ajuste sobre disenos web y React puede degradar su rendimiento en tareas de codigo ajenas al frontend (backend, sistemas, ciencia de datos).
- Riesgo de alucinacion: como todo modelo de 4 B de parametros, puede inventar APIs, props o librerias inexistentes, especialmente en cuantizaciones de baja precision (IQ1, IQ2, Q2_K).
- Calidad de cuantizaciones extremas: las versiones IQ1_S, IQ1_M e IQ2_XXS estan marcadas por el propio autor como "for the desperate" o "mostly desperate", con degradacion notable de calidad.
- Contexto desconocido: al no publicarse la longitud de contexto, no se puede garantizar el manejo de repositorios grandes o conversaciones largas.
- Vision condicionada: los ficheros mmproj no estan en este repositorio sino en el estatico; hay que descargarlos aparte para usar la capacidad multimodal.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `ccore/CCORE-Web-Coder-4B` y de la familia Qwen 3.5 subyacente.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad que respalde las afirmaciones de la model card.

## Enlaces

- Repositorio Hugging Face (esta version): https://huggingface.co/mradermacher/CCORE-Web-Coder-4B-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/CCORE-Web-Coder-4B-GGUF
- Modelo base: https://huggingface.co/ccore/CCORE-Web-Coder-4B
- Dataset de ajuste: https://huggingface.co/datasets/ccore/CCORE-Web-Designs
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#CCORE-Web-Coder-4B-i1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
