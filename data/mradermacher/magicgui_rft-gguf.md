# mradermacher/MagicGUI_RFT-GGUF

## Resumen

MagicGUI_RFT-GGUF es la version cuantizada en formato GGUF del modelo GUIAgent/MagicGUI_RFT, publicada por mradermacher, un conocido creador de cuantizaciones para la comunidad de llama.cpp y Ollama. El modelo original es un transformer denso de aproximadamente 7.615 millones de parametros (7,6B), afinado mediante RFT (Rejection Fine-Tuning) sobre el dataset GUIAgent/Magic-RICH, orientado a tareas de interaccion con interfaces graficas y agentes GUI. Esta version GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, algo imposible con los pesos originales en precision completa.

La relevancia de esta publicacion radica en que democratiza el acceso a un modelo especializado en agentes GUI, un nicho donde la mayoria de modelos disponibles son propietarios o requieren infraestructura de servidor. Al ofrecer cuantizaciones desde Q2_K hasta f16, junto con el proyector multimodal mmproj, el autor facilita el despliegue local del modelo tanto en estaciones de trabajo como en GPUs de consumo.

No obstante, la informacion disponible es limitada: no se especifican detalles sobre la arquitectura interna del modelo base, la longitud de contexto, los datos de entrenamiento mas alla del nombre del dataset, ni resultados de benchmarks. Esta ficha refleja fielmente lo que se puede verificar y marca explicitamente como "no disponible" todo aquello que no consta en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (detalles internos no disponibles) |
| Parametros totales | 7.615.616.512 (7,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base GUIAgent/MagicGUI_RFT es un transformer denso de 7,6B parametros. La informacion disponible no detalla la arquitectura interna (numero de capas, dimensiones de atencion, tipo de atencion, etc.), por lo que estos datos deben considerarse no disponibles. El nombre del modelo y del dataset (GUIAgent/Magic-RICH) sugiere un entrenamiento orientado a tareas de agente GUI, es decir, interaccion con interfaces graficas mediante capturas de pantalla y acciones estructuradas, aunque no se confirma en la model card.

El proceso de entrenamiento se describe como RFT (Rejection Fine-Tuning), una tecnica de ajuste supervisado en la que se generan multiples respuestas candidatas y se conservan unicamente las que superan un criterio de calidad, generalmente verificado por un evaluador o reward model. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases adicionales de RLHF o DPO. La cuantizacion GGUF fue realizada por mradermacher con quantize_version 2 y output_tensor_quantised 1, e incluye un proyector multimodal (mmproj) que sugiere capacidades de vision, presumiblemente necesarias para interpretar capturas de pantalla en tareas GUI, aunque esto no se confirma explicitamente.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" del repositorio.
- Capacidades multimodales: la presencia de archivos mmproj (multi-modal supplement) indica soporte de entrada de imagenes, previsiblemente capturas de pantalla para tareas de agente GUI.
- Interaccion con interfaces graficas: el modelo esta afinado sobre el dataset Magic-RICH, orientado a tareas de agente GUI, aunque no se detallan las acciones concretas soportadas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: inferido por el nombre del modelo y el dataset, pero no confirmado con detalles tecnicos.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Automatizacion de pruebas de interfaz de usuario: el modelo puede interpretar capturas de pantalla y sugerir acciones sobre elementos de la UI, integrandose en pipelines de testing end-to-end para generar pasos de interaccion de forma automatica.
- Agentes de escritorio locales: gracias a las cuantizaciones Q4_K_M (4,8 GB) y Q5_K_M (5,5 GB), el modelo cabe en GPUs de consumo y puede ejecutarse con llama.cpp para construir agentes que operen sobre aplicaciones de escritorio sin enviar datos a la nube.
- Asistentes de navegacion web: el modelo puede analizar la representacion visual de paginas web y proponer acciones de clic, scroll o rellenado de formularios, util para prototipos de agentes web.
- Generacion de scripts de automatizacion GUI: a partir de una descripcion en lenguaje natural y una captura de pantalla, el modelo puede generar secuencias de acciones para herramientas como PyAutoGUI o similares.
- Educacion y prototipado de agentes: investigadores que necesiten experimentar con modelos de agente GUI pueden desplegar la version Q4_K_S en una RTX 3060 o superior y iterar rapidamente sin depender de APIs externas.
- Despliegue en entornos con requisitos de privacidad: al ser un modelo local con licencia Apache 2.0, puede integrarse en entornos corporativos donde no se permite enviar capturas de pantalla a servicios de terceros.
- Investigacion sobre RFT: el modelo sirve como caso de estudio para analizar el efecto de Rejection Fine-Tuning en tareas de agente, comparando las cuantizaciones Q8_0 y f16 para medir la degradacion por cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~3,1 GB
  - Q3_K_M: ~3,9 GB
  - IQ4_XS: ~4,4 GB
  - Q4_K_M: ~4,8 GB
  - Q5_K_M: ~5,5 GB
  - Q6_K: ~6,4 GB
  - Q8_0: ~8,2 GB
  - f16: ~15,3 GB
  - Proyector multimodal adicional: 0,8 GB (mmproj-Q8_0) o 1,5 GB (mmproj-f16)
- GPU recomendadas:
  - Consumer: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 (cualquier cuantizacion hasta Q8_0, incluyendo mmproj).
  - Profesional: A100, H100 para despliegues de mayor throughput o f16.
- Cabe en GPU de consumo: si, desde Q4_K_S en una GPU con 6-8 GB de VRAM; Q8_0 requiere al menos 10-12 GB para dejar margen al contexto y al proyector multimodal.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, transformers con aceleracion CUDA.
- Latencia y throughput estimados: no disponibles. Dependen en gran medida del backend, la GPU y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MagicGUI_RFT-GGUF | 7,6B | no disponible | Apache 2.0 | GGUF | Especializado en agente GUI, multimodal via mmproj |
| Qwen2.5-VL-7B | 7,6B | 128K (segun model card publica) | Apache 2.0 | safetensors, GGUF | Vision-lenguaje generalista, no especifico de GUI |
| Llama-3.2-11B-Vision | 11B | 128K (segun model card publica) | Llama 3.2 Community License | safetensors, GGUF | Vision generalista, licencia con restricciones |
| UI-TARS-7B | 7B | no disponible | Apache 2.0 | safetensors | Especifico de agente GUI, referencia del nicho |

Nota: los datos de los modelos comparables provienen de sus model cards publicas y no de la informacion proporcionada en esta busqueda; se incluyen como referencia contextual. No se dispone de benchmarks comparativos directos con MagicGUI_RFT.

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado unicamente para ingles; el rendimiento en castellano no esta verificado y probablemente sea deficiente.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide garantizar conversaciones multi-turno largas o historiales extensos de capturas de pantalla.
- Alucinacion: como todo modelo generativo, puede producir acciones o descripciones inexistentes sobre la interfaz; en tareas GUI esto puede traducirse en clics erroneos, por lo que se recomienda validacion externa.
- Sesgos: no se documentan evaluaciones de sesgo; el dataset Magic-RICH podria introducir sesgos en la seleccion de acciones o en la interpretacion de interfaces.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base y el dataset de entrenamiento deben verificarse por separado; la model card no detalla restricciones adicionales.
- Cuantizacion: las versiones Q2_K y Q3_K pueden degradar notablemente la calidad; el autor recomienda Q4_K_S o Q4_K_M para un equilibrio calidad/velocidad.
- Multimodalidad: el proyector mmproj debe cargarse junto con el modelo para aprovechar las capacidades de vision; sin el, el modelo solo procesa texto.
- Madurez: el repositorio tiene pocas descargas (179) y cero likes, lo que sugiere poca validacion por parte de la comunidad; conviene realizar pruebas propias antes de usarlo en produccion.
- Especificaciones incompletas: la ausencia de datos sobre arquitectura, contexto y benchmarks limita la evaluacion rigurosa del modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MagicGUI_RFT-GGUF
- Modelo base: https://huggingface.co/GUIAgent/MagicGUI_RFT
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/MagicGUI_RFT-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#MagicGUI_RFT-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/GUIAgent/Magic-RICH
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
