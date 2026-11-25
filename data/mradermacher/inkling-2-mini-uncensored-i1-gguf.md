# mradermacher/Inkling-2-Mini-Uncensored-i1-GGUF

## Resumen

Inkling-2-Mini-Uncensored-i1-GGUF es una cuantizacion en formato GGUF del modelo Inkling-2-Mini-Uncensored, publicada por el usuario mradermacher. Se trata de una conversion a cuantizacion con imatrix (matriz de importancia) del modelo original alojado en el repositorio OpenUncensored/Inkling-2-Mini-Uncensored, orientada a inferencia local eficiente en CPU y GPU de consumo.

El modelo base cuenta con 26.070.385.152 parametros (aproximadamente 26.000 millones), lo que lo situa en la categoria de modelos de gran tamano pero desplegables en hardware de gama alta de consumo mediante cuantizacion agresiva. El repositorio incluye un amplio abanico de niveles de cuantizacion, desde IQ1_S hasta Q6_K, lo que permite ajustar el equilibrio entre calidad y huella de memoria.

La relevancia de esta publicacion radica en su caracter "uncensored" (sin los filtros de rechazo habituales del modelo base) y en la disponibilidad de cuantizaciones con imatrix, que preservan mejor la calidad respecto a cuantizaciones estandar a igual tamano. No obstante, la informacion disponible sobre el modelo base es muy limitada: no se especifican licencia, idiomas, arquitectura detallada ni datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 26.070.385.152 (~26 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado con imatrix); pesos originales en safetensors segun metadatos |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en la documentacion proporcionada. Los metadatos de cuantizacion indican `convert_type: hf` y `output_tensor_quantised: 1`, lo que confirma que la conversion se realizo desde pesos en formato Hugging Face (safetensors) hacia GGUF mediante el pipeline de cuantizacion de llama.cpp.

Las cuantizaciones se generaron con matriz de importancia (imatrix), segun el campo `weighted/imatrix quants`. La imatrix es una tecnica que pondera la cuantizacion en funcion de la importancia estadistica de cada tensor, medida sobre un corpus de calibracion, lo que reduce la perdida de calidad frente a cuantizaciones uniformes, especialmente en niveles bajos (IQ2, IQ3). No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El tag `nicoboss` sugiere una posible relacion con el ecosistema de cuantizaciones de ese autor, pero no se detalla su significado.

## Capacidades

- Generacion de texto conversacional: la model card etiqueta el modelo como `conversational`, lo que indica un ajuste orientado a dialogos multi-turno.
- Modo "uncensored": el modelo base se distribuye sin los filtros de rechazo tipicos, lo que permite respuestas sin las restricciones habituales de seguridad.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que el formato GGUF es compatible con el despliegue mediante la infraestructura de endpoints de Hugging Face.
- Capacidades de razonamiento, codigo, matematicas, vision, tool calling o agentes: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Inferencia local en estaciones de trabajo: con 26 B de parametros, el modelo puede ejecutarse en GPU de consumo de gama alta (24 GB de VRAM) usando cuantizaciones Q4_K_M o inferiores, lo que permite desplegar un asistente conversacional privado sin dependencia de la nube.
- Experimentacion en investigacion sobre alineacion: al carecer de filtros de rechazo, resulta util para estudiar el comportamiento de modelos sin restricciones y comparar con variantes censuradas del mismo modelo base.
- Generacion de texto creativo sin restricciones tematicas: escritura de ficcion, guiones o narrativa donde los filtros de seguridad del modelo base limitarian el contenido.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en local mediante llama.cpp u Ollama, los datos no salen del equipo, lo que encaja en escenarios con datos sensibles.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 24 niveles de cuantizacion distintos, lo que permite medir empiricamente el impacto de la cuantizacion con imatrix en la calidad de salida para un modelo de 26 B.
- Prototipado de chatbots conversacionales: el ajuste conversacional y la compatibilidad con endpoints facilitan la integracion en prototipos de atencion al cliente o asistentes internos, siempre que se asuma el riesgo de contenido sin filtrar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: orientativa segun cuantizacion. Q4_K_M en un modelo de 26 B ocupa aproximadamente 15-16 GB; Q5_K_M en torno a 18-19 GB; Q6_K cerca de 21-22 GB; las cuantizaciones IQ2 e IQ3 se situarian en el rango de 8-12 GB, con mayor perdida de calidad.
- GPU recomendadas: para cuantizaciones altas (Q5/Q6), GPU con 24 GB o mas (RTX 3090, RTX 4090, A100 40 GB, H100). Para cuantizaciones medias (Q4), una RTX 4090 o RTX 3090 es suficiente.
- GPU de consumo: si cabe en RTX 3090/4090 (24 GB) con cuantizaciones Q4 y Q5; en GPUs de 16 GB (RTX 4080, 4070 Ti Super) solo con cuantizaciones IQ3 o Q4_K_S ajustadas.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere soporte en los endpoints de Hugging Face.
- Latencia y throughput: no disponibles; dependeran del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni caracteristicas del modelo base que permitan una comparacion fiable con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifica la licencia del modelo base ni de la cuantizacion, lo que impide determinar si el uso comercial esta permitido. Es imprescindible verificar la licencia del repositorio original OpenUncensored/Inkling-2-Mini-Uncensored antes de cualquier uso en produccion.
- Modelo "uncensored": al carecer de filtros de rechazo, puede generar contenido ofensivo, ilegal o danino. No es adecuado para aplicaciones orientadas al publico general sin una capa de moderacion externa.
- Riesgo de alucinacion: no disponible informacion especifica, pero es un riesgo inherente a los modelos generativos de este tamano.
- Idiomas soportados no declarados: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas distintos del que se uso en el entrenamiento.
- Longitud de contexto desconocida: impide planificar casos de uso que requieran ventanas largas.
- Perdida de calidad por cuantizacion: las variantes IQ1 e IQ2, aunque generadas con imatrix, degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior.
- Repositorio sin descargas ni likes en el momento de la consulta: indica ausencia de validacion comunitaria; conviene evaluar el modelo con pruebas propias antes de adoptarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Inkling-2-Mini-Uncensored-i1-GGUF
- Modelo base: https://huggingface.co/OpenUncensored/Inkling-2-Mini-Uncensored
