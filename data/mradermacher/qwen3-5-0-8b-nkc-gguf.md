# mradermacher/Qwen3.5-0.8B-NKC-GGUF

## Resumen

Qwen3.5-0.8B-NKC-GGUF es la versión cuantizada en formato GGUF del modelo MichielH/Qwen3.5-0.8B-NKC, publicada por el usuario mradermacher, conocido por distribuir conversiones GGUF de modelos abiertos. El modelo base parte de la familia Qwen3.5 (arquitectura qwen3_5, multimodal) y ha sido sometido a un proceso de edición de pesos ("weight-space programming" y "knowledge-transfer") según las etiquetas de la model card, lo que sugiere que se trata de un modelo derivado experimental más que de un checkpoint oficial de Qwen.

El modelo cuenta con 772.845.888 parámetros totales (unos 0,77 mil millones), lo que lo sitúa en la gama ultraligera. Incorpora componentes multimodales (archivos mmproj en los cuants), orientados a tareas de visión-lenguaje. La licencia es Apache 2.0 y el idioma declarado es únicamente inglés. Esta ficha se centra en la versión GGUF, pensada para inferencia local eficiente mediante llama.cpp y entornos compatibles.

La relevancia de esta publicación radica en que permite ejecutar un modelo derivado de Qwen3.5 en hardware muy modesto, con cuantizaciones que van desde 0,5 GB (Q2_K) hasta 1,7 GB (f16), lo que facilita su despliegue en portátiles, sistemas embebidos o entornos sin GPU dedicada. No obstante, al tratarse de un modelo editado y de una conversión no oficial, conviene tratarlo como material experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer multimodal; detalles no disponibles) |
| Parametros totales | 772.845.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, mas mmproj Q8_0 y F16 |
| Idiomas soportados | en (solo ingles declarado) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura qwen3_5, una familia de transformers de Qwen; los detalles concretos de capas, atencion y dimensiones no se especifican en la informacion disponible. La model card incluye las etiquetas "weight-space-programming", "model-editing" y "knowledge-transfer", lo que indica que el modelo base MichielH/Qwen3.5-0.8B-NKC ha sido modificado en el espacio de pesos, presumiblemente para transferir o editar conocimiento, sin que se documenten el dataset, el numero de tokens de entrenamiento ni si hubo RLHF o DPO.

La naturaleza multimodal se deduce de la presencia de los archivos mmproj (multi-modal projector) en la conversion GGUF, que permiten procesar imagenes junto con texto. No se dispone de informacion sobre innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.) mas alla de las etiquetas mencionadas.

## Capacidades

- Generacion de texto conversacional en ingles, con formato compatible con endpoints (etiqueta "endpoints_compatible" y "conversational").
- Capacidades multimodales de vision-lenguaje, segun la etiqueta "vision-language" y la inclusion de proyectores mmproj.
- Edicion y transferencia de conocimiento mediante modificacion del espacio de pesos (caracteristica del modelo base, no una capacidad de inferencia per se).
- No se documenta soporte explicito de tool calling, function calling ni razonamiento multi-paso.
- Capacidades multilingues limitadas: solo ingles declarado.
- No se documentan modos especiales como thinking mode, audio o generacion de codigo especializada.

## Casos de uso

- Prototipado local en portatiles: con cuantizaciones Q4_K_M (0,6 GB) o Q5_K_M (0,7 GB) se puede ejecutar en CPU con llama.cpp para experimentar con un modelo derivado de Qwen3.5 sin necesidad de GPU.
- Pruebas de concepto de vision-lenguaje: cargando el modelo junto con el proyector mmproj-f16 (0,3 GB) se pueden realizar tareas basicas de descripcion de imagenes o respuesta a preguntas visuales en entornos de investigacion.
- Investigacion sobre edicion de pesos: al estar basado en un modelo con tecnicas de weight-space programming, sirve para estudiar el efecto de dichas ediciones en el comportamiento del modelo, comparandolo con el checkpoint original.
- Despliegue en dispositivos de recursos limitados: la version Q2_K (0,5 GB) permite inferencia en hardware con poca RAM, util para demos o integraciones embebidas.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 variantes GGUF, lo que permite medir el impacto de la cuantizacion en perplejidad y calidad para este modelo concreto.
- Filtrado y clasificacion de texto simple en ingles: con un modelo de 0,77B y contexto conversacional, puede usarse en tareas acotadas de etiquetado o resumen corto, siempre con validacion humana por su tamano reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del modelo GGUF ni la del modelo base incluyen cifras de MMLU, HumanEval, GSM8K u otras evaluaciones.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion: Q2_K ~0,5 GB, Q3_K_S/M/L ~0,5-0,6 GB, IQ4_XS/Q4_K_S/Q4_K_M ~0,6 GB, Q5_K_S/Q5_K_M ~0,7 GB, Q6_K ~0,7 GB, Q8_0 ~0,9 GB, F16 ~1,7 GB. Para vision hay que sumar el mmproj (0,2-0,3 GB).
- GPU recomendadas: cualquier GPU consumer con 2-4 GB de VRAM es suficiente para las cuantizaciones bajas; tambien funciona en CPU.
- Cabe en practicamente cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090, etc.) e incluso en sistemas sin GPU dedicada.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; la etiqueta "endpoints_compatible" sugiere compatibilidad con endpoints HTTP de inferencia.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-NKC-GGUF (este) | 772.845.888 | no disponible | Apache 2.0 | GGUF en HF | Modelo editado, multimodal, solo ingles |
| Qwen3.5-0.8B-NKC (base) | 772.845.888 | no disponible | Apache 2.0 | safetensors en HF | Checkpoint original sin cuantizar |
| Otros modelos ~0,8B de la familia Qwen | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion suministrada |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas como para establecer una comparativa cuantitativa rigurosa.

## Limitaciones y advertencias

- Modelo experimental y derivado: las etiquetas de edicion de pesos indican que no es un checkpoint oficial de Qwen; su comportamiento puede diferir del modelo original y no esta validado por el equipo de Qwen.
- Solo ingles: no se declara soporte de castellano ni de otros idiomas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, lo que desaconseja su uso en produccion sin evaluacion propia.
- Riesgo de alucinacion elevado por el reducido tamano (0,77B) y por posibles artefactos de la edicion de pesos.
- Contexto no documentado: se desconoce la ventana maxima, lo que limita el diseno de aplicaciones con contexto largo.
- Conversion no oficial: el GGUF lo publica un tercero (mradermacher) y podria contener diferencias respecto al modelo base; conviene verificar con el checkpoint original.
- Cuantizaciones bajas (Q2_K, Q3_K_S) degradan la calidad; el autor recomienda Q4_K_S/Q4_K_M para uso general y Q6_K/Q8_0 para maxima calidad.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo editado conviene revisar las condiciones del modelo base y de Qwen3.5 original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-0.8B-NKC-GGUF
- Modelo base: https://huggingface.co/MichielH/Qwen3.5-0.8B-NKC
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-0.8B-NKC-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_requests
