# mradermacher/GUI-Owl-32B-GGUF

## Resumen

GUI-Owl-32B es un modelo multimodal de tipo vision-lenguaje desarrollado por mPLUG (grupo de investigacion de Alibaba) y orientado a la interaccion con interfaces graficas de usuario (GUI agents). El repositorio aqui descrito es una cuantizacion GGUF realizada por mradermacher sobre el modelo original mPLUG/GUI-Owl-32B, pensada para facilitar su ejecucion en entornos con recursos limitados mediante llama.cpp y herramientas compatibles. El modelo cuenta con 32.763.876.352 parametros totales y esta disenado para tareas de comprension de capturas de pantalla, razonamiento sobre elementos de interfaz y ejecucion de acciones sobre GUIs.

La relevancia de este lanzamiento radica en que permite desplegar localmente un modelo de 32B especializado en agentes GUI, algo que hasta hace poco requeria infraestructura en la nube. Al ofrecerse en multiples niveles de cuantizacion (desde Q2_K de 12,4 GB hasta Q8_0 de 34,9 GB), el modelo puede ajustarse a distintos presupuestos de VRAM y RAM, incluyendo GPUs de consumo con 24 GB. La licencia MIT del modelo base facilita su uso comercial sin restricciones significativas.

La cuantizacion incluye tambien ficheros mmproj (multi-modal projector) en Q8_0 y f16, necesarios para procesar imagenes junto con el texto. El modelo esta etiquetado como conversacional y compatible con endpoints, lo que sugiere soporte para APIs de inferencia estandar. La informacion publica disponible no detalla la longitud de contexto ni la composicion exacta del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base mPLUG/GUI-Owl-32B, vision-lenguaje) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mPLUG/GUI-Owl-32B. Por el nombre y el ecosistema de mPLUG, se trata de un modelo vision-lenguaje de 32B parametros orientado a tareas de agente GUI, con un proyector multimodal (mmproj) que conecta un codificador visual con el modelo de lenguaje. El repositorio de cuantizacion no incluye detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica destacable de esta publicacion es la propia cuantizacion: mradermacher ofrece quants estaticos (no imatrix) en el repositorio principal y quants ponderados/imatrix en un repositorio separado (GUI-Owl-32B-i1-GGUF), lo que permite elegir entre velocidad y calidad segun el caso de uso. Los ficheros mmproj en Q8_0 y f16 son imprescindibles para el procesamiento de imagenes en llama.cpp.

## Capacidades

- Comprension de capturas de pantalla e imagenes de interfaces graficas.
- Razonamiento sobre elementos de UI (botones, campos, menus, iconos).
- Generacion de acciones sobre GUIs (clics, escritura, navegacion) en el contexto de agentes GUI.
- Conversacion multi-turno (etiqueta conversational).
- Procesamiento multimodal texto + imagen mediante el proyector mmproj.
- Compatibilidad con endpoints de inferencia estandar (etiqueta endpoints_compatible).
- Capacidades de agente para tareas de automatizacion de interfaz.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo en (ingles).

## Casos de uso

- Automatizacion de pruebas de interfaz: el modelo puede analizar capturas de pantalla de una aplicacion web o de escritorio e identificar elementos interactivos para generar scripts de test automatizados, reduciendo el mantenimiento de selectores fragiles.
- Agentes de navegacion web: integrado en un pipeline que captura la pantalla del navegador, el modelo razona sobre el estado de la pagina y propone la siguiente accion (clic, scroll, rellenado de formularios), adecuado para tareas de scraping guiado o RPA.
- Asistencia a usuarios en aplicaciones de escritorio: un chatbot que recibe una captura de pantalla del usuario y le guia paso a paso sobre donde pulsar o que campo rellenar, util en soporte tecnico de primer nivel.
- Automatizacion de tareas administrativas: procesar pantallas de sistemas ERP o CRM para extraer datos y ejecutar acciones repetitivas, con el modelo como cerebro del agente y un ejecutor de acciones externo.
- Generacion de documentacion de interfaces: a partir de capturas de pantalla, el modelo puede describir la estructura de una UI y generar guias de uso o documentacion tecnica para equipos de producto.
- Investigacion en agentes GUI: servir como modelo base cuantizado para experimentar con tecnicas de razonamiento visual y planificacion de acciones en entornos de laboratorio, gracias a su licencia MIT y a la disponibilidad de quants ligeros (Q4_K_M, 20 GB) ejecutables en una sola GPU de 24 GB.
- Prototipado local sin nube: equipos que no pueden enviar capturas de pantalla a servicios externos por motivos de privacidad pueden desplegar el modelo en local con llama.cpp y un quant Q4_K_S (18,9 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead aproximado):
  - Q2_K: ~12,4 GB de pesos, ~14 GB en uso.
  - Q3_K_M: ~16,0 GB de pesos, ~18 GB en uso.
  - IQ4_XS: ~18,0 GB de pesos, ~20 GB en uso.
  - Q4_K_M: ~20,0 GB de pesos, ~22 GB en uso.
  - Q5_K_M: ~23,4 GB de pesos, ~26 GB en uso.
  - Q6_K: ~27,0 GB de pesos, ~30 GB en uso.
  - Q8_0: ~34,9 GB de pesos, ~38 GB en uso.
- Sumar ~0,8 GB (mmproj-Q8_0) o ~1,5 GB (mmproj-f16) si se procesan imagenes.
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 y Q6_K; RTX 4090 (24 GB) para Q4_K_M e inferiores; RTX 3090 (24 GB) para Q4_K_M; GPUs de 16 GB solo con Q3_K_M o inferiores.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con Q4_K_M o inferiores; en GPUs de 16 GB con Q3_K_M; en GPUs de 12 GB solo con Q2_K.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, transformers con aceleracion CUDA.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GUI-Owl-32B (este) | 32,8B | no disponible | MIT | GGUF / safetensors | Especializado en agentes GUI, vision-lenguaje |
| Modelos GUI de 7B-13B (familia generica) | 7-13B | no disponible | variable | GGUF / safetensors | Menor capacidad, menor huella de VRAM |
| Modelos vision-lenguaje generalistas 30B+ | ~30B | no disponible | variable | safetensors / GGUF | No especializados en GUI, requieren prompting especifico |

La informacion disponible no permite una comparativa cuantitativa con benchmarks frente a alternativas concretas. La principal ventaja de este repositorio es la disponibilidad de cuantizaciones GGUF de un modelo GUI de 32B con licencia MIT, algo poco comun en el ecosistema de agentes GUI.

## Limitaciones y advertencias

- Solo soporta ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion en la identificacion de elementos de UI y en la generacion de acciones, especialmente con capturas de baja resolucion o interfaces no vistas en entrenamiento.
- No se dispone de informacion sobre sesgos del modelo base.
- La longitud de contexto no esta documentada, lo que dificulta planificar tareas con historiales largos o capturas de alta resolucion.
- El modelo base es de mPLUG; la cuantizacion puede degradar la precision en tareas de percepcion visual fina, especialmente en Q2_K y Q3_K_S.
- Requiere el fichero mmproj para procesar imagenes; sin el, el modelo solo funciona como modelo de texto.
- Aunque la licencia es MIT, conviene verificar las condiciones del modelo base mPLUG/GUI-Owl-32B por si hubiera restricciones adicionales no reflejadas en las etiquetas.
- El tamano del repositorio (226,1 GB) implica descargas largas; se recomienda bajar solo el quant necesario.
- Para produccion, validar el comportamiento del agente GUI con un entorno de ejecucion controlado antes de permitir acciones reales sobre sistemas.

## Enlaces

- Repositorio Hugging Face (cuantizacion): https://huggingface.co/mradermacher/GUI-Owl-32B-GGUF
- Modelo base: https://huggingface.co/mPLUG/GUI-Owl-32B
- Quants imatrix/ponderados: https://huggingface.co/mradermacher/GUI-Owl-32B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#GUI-Owl-32B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de quants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
