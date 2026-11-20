# mradermacher/Orion-26B-A4B-v1.1-GGUF

## Resumen

Orion-26B-A4B-v1.1-GGUF es la distribucion en formato GGUF del modelo Orion-26B-A4B-v1.1, desarrollado originalmente por TheDrummer y cuantizado por mradermacher. Se trata de un modelo conversacional en ingles con 25.233.142.046 parametros totales (aproximadamente 25,2 mil millones) y una nomenclatura "A4B" que sugiere una arquitectura de mezcla de expertos (MoE) con unos 4 mil millones de parametros activos por token, aunque este dato no se confirma de forma explicita en la informacion disponible. La relevancia de esta ficha radica en que permite ejecutar un modelo de gran tamano en hardware de consumo gracias a las cuantizaciones GGUF, que reducen el peso desde los 184,9 GB del repositorio completo hasta los 10,7-27,0 GB por archivo.

El modelo base esta pensado para generacion de texto conversacional y razonamiento, y esta etiquetado como compatible con endpoints. La cuantizacion incluye un modulo multimodal (mmproj) que sugiere capacidades de vision, aunque no se detalla su alcance. La licencia no esta disponible en la informacion proporcionada, lo que constituye una advertencia importante para uso comercial.

Esta ficha documenta exclusivamente los datos disponibles en la model card y los metadatos de Hugging Face; los aspectos no cubiertos se indican como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (nomenclatura A4B sugiere MoE, sin confirmar) |
| Parametros totales | 25.233.142.046 (~25,2 B) |
| Parametros activos | no disponible (la nomenclatura A4B sugiere ~4 B activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base TheDrummer/Orion-26B-A4B-v1.1. El nombre "A4B" es coherente con una arquitectura de mezcla de expertos (MoE) con aproximadamente 4 mil millones de parametros activos, pero este dato no se confirma en la model card. El repositorio cuantizado incluye un modulo mmproj en dos variantes (Q8_0 y f16), lo que indica que el modelo base incorpora un codificador multimodal para procesamiento de imagenes, aunque no se especifica la resolucion ni el tipo de vision.

No se han publicado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras etapas de alineacion. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. La cuantizacion realizada por mradermacher es estatica (quantize_version 2, output_tensor_quantised 1), con variantes imatrix disponibles en un repositorio separado (i1-GGUF) que suelen ofrecer mejor calidad por tamano.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno.
- Razonamiento y respuesta a instrucciones, segun la etiqueta "conversational" del repositorio.
- Procesamiento multimodal: la presencia de archivos mmproj indica soporte de entrada de imagenes, aunque no se detalla su alcance.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere integracion con infraestructuras de inferencia desplegadas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo de idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional en ingles: el modelo puede gestionar dialogos multi-turno con un tamano de 25,2 B parametros totales y aproximadamente 4 B activos (si se confirma la arquitectura MoE), lo que reduce el coste computacional por token en comparacion con un modelo denso del mismo tamano.
- Despliegue en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M (16,9 GB) y Q4_K_S (15,6 GB) permiten ejecutar el modelo en GPUs con 24 GB de VRAM, como la RTX 4090, mediante llama.cpp u Ollama.
- Procesamiento de documentos con imagenes: el modulo mmproj permite alimentar imagenes junto con texto, util para extraccion de informacion de capturas, diagramas o formularios en flujos internos.
- Prototipado rapido de aplicaciones de IA: el formato GGUF y la disponibilidad de multiples cuantizaciones facilitan pruebas en local sin necesidad de infraestructura de servidores dedicados.
- Generacion de contenido en ingles: redaccion de borradores, resumenes y respuestas a preguntas frecuentes en entornos donde el idioma de trabajo sea el ingles.
- Investigacion y evaluacion de modelos MoE cuantizados: el repositorio permite comparar el impacto de distintas cuantizaciones (Q2_K a Q8_0) en la calidad de salida, con variantes imatrix disponibles para analisis de precision.
- Fine-tuning o adaptacion posterior: al estar disponible el modelo base en safetensors (TheDrummer/Orion-26B-A4B-v1.1), se puede partir de los pesos originales para ajuste fino antes de cuantizar de nuevo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 10,7 GB (Q2_K) y 27,0 GB (Q8_0) solo para los pesos; anadir aproximadamente 1-2 GB para el contexto y overhead del runtime, y 0,9-1,3 GB adicionales si se usa el modulo mmproj.
- GPU recomendadas: para Q4_K_M (16,9 GB) y Q5_K_M (19,2 GB), una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente. Para Q8_0 (27,0 GB) se requiere una A100 40 GB, H100 o una RTX 6000 Ada (48 GB). Para Q2_K y Q3_K_S, GPUs de 12-16 GB como la RTX 4070 Ti o RTX 4080 pueden ser suficientes.
- Cabe en GPU de consumo: si, en modelos con 24 GB de VRAM usando cuantizaciones Q4 o Q5; en GPUs de 12-16 GB con cuantizaciones Q2_K o Q3_K_S.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El modelo base en safetensors puede servirse con vLLM o TGI si se dispone de hardware suficiente.
- Latencia y throughput estimados: no disponible en la informacion proporcionada. Al tratarse de una arquitectura con aproximadamente 4 B parametros activos (si se confirma MoE), se espera un throughput superior al de un modelo denso de 25 B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de contexto para establecer una comparativa rigurosa con alternativas. Se indica "no disponible" para los modelos comparables, ya que no se han proporcionado benchmarks ni especificaciones del modelo base mas alla del recuento de parametros.

| Modelo | Parametros totales | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Orion-26B-A4B-v1.1 (este) | 25,2 B | no disponible | no disponible | GGUF, safetensors |
| Alternativa comparable | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al ser un modelo entrenado principalmente en ingles, es probable que presente sesgos culturales y linguisticos propios de ese dominio.
- Riesgo de alucinacion: no cuantificado; como todo modelo generativo, puede producir afirmaciones incorrectas con aparente seguridad, especialmente en cuantizaciones agresivas como Q2_K.
- Limitaciones de contexto e idioma: el modelo solo declara soporte de ingles; no se especifica la longitud de contexto, lo que impide planificar su uso en tareas de contexto largo.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo base (TheDrummer/Orion-26B-A4B-v1.1) antes de cualquier despliegue en produccion.
- Caveat de cuantizacion: las cuantizaciones Q2_K y Q3_K_M pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso en produccion. Las variantes imatrix del repositorio i1-GGUF suelen ofrecer mejor relacion calidad/tamano.
- Caveat de fecha: los metadatos indican creacion en septiembre de 2026 y actualizacion en octubre de 2026; conviene contrastar la vigencia del modelo base y de sus dependencias antes de adoptarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Orion-26B-A4B-v1.1-GGUF
- Modelo base: https://huggingface.co/TheDrummer/Orion-26B-A4B-v1.1
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Orion-26B-A4B-v1.1-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Orion-26B-A4B-v1.1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
