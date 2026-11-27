# mradermacher/CIG-27B-IPR-i1-GGUF

## Resumen

CIG-27B-IPR-i1-GGUF es una coleccion de cuantizaciones GGUF del modelo CodeImageGen/CIG-27B-IPR, un modelo de generacion de imagenes basada en codigo (text-to-image mediante JavaScript) de 27.320.697.856 parametros. Las cuantizaciones han sido producidas por mradermacher utilizando el metodo i1 (imatrix), que emplea una matriz de importancia para preservar mejor la calidad en niveles de compresion agresivos.

El modelo base resuelve la tarea de generar imagenes a partir de descripciones textuales mediante la produccion de codigo JavaScript, en lugar de generar directamente pixeles. Esta aproximacion, etiquetada como code-based-image-generation, permite que la salida sea inspeccionable, editable y reproducible como codigo. Esta variante i1-GGUF esta pensada para despliegue en entornos con recursos limitados mediante llama.cpp y derivados.

La relevancia de esta ficha radica en que el repositorio ofrece una via practica para ejecutar un modelo de 27B en hardware de consumo, con cuantizaciones que van desde 11,3 GB (i1-Q2_K) hasta 15,9 GB (i1-Q4_K_S). La licencia Apache 2.0 del modelo base facilita su uso comercial, aunque la informacion publicada sobre el entrenamiento y los benchmarks es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de 27B; detalles no publicados) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): Q2_K, IQ3_M, Q4_K_S; el autor menciona ademas IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 40,0 GB); el modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura interna del modelo base CodeImageGen/CIG-27B-IPR mas alla de su naturaleza transformer y su tamano de 27.320.697.856 parametros. El modelo esta especializado en generacion de imagenes basada en codigo: recibe una descripcion textual y produce codigo JavaScript como salida. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

En cuanto a esta variante, mradermacher ha generado cuantizaciones i1 (imatrix) con quantize_version 2 y output_tensor_quantised 1, partiendo de los pesos en formato Hugging Face. El metodo imatrix calcula una matriz de importancia a partir de datos de calibracion para ponderar la cuantizacion de cada tensor, lo que suele mejorar la perplejidad frente a cuantizaciones estaticas del mismo tamano. El autor indica que las cuantizaciones estaticas equivalentes estan disponibles en un repositorio separado.

## Capacidades

- Generacion de imagenes basada en codigo: produce codigo JavaScript a partir de descripciones textuales (pipeline text-to-image).
- Generacion de codigo en el dominio especifico de creacion de imagenes programatica.
- Conversacion: el repositorio incluye la etiqueta conversational, lo que sugiere soporte de interaccion multi-turno.
- Compatibilidad con endpoints: etiqueta endpoints_compatible, indicando integracion con infraestructura de inferencia estandar.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Tool calling, function calling, agentes y modos de razonamiento extendido: no disponible en la informacion proporcionada.
- Vision y audio: no disponible.

## Casos de uso

- Generacion programatica de graficos para documentacion tecnica: el modelo traduce una descripcion textual en codigo JavaScript que dibuja la imagen, permitiendo revisar y versionar el resultado como codigo fuente en el repositorio del proyecto.
- Prototipado rapido de ilustraciones en pipelines de CI: al ser la salida codigo, se puede ejecutar y validar de forma automatizada antes de incorporar el resultado a un build.
- Educacion y demostraciones de generacion de imagenes: util para mostrar como un modelo de lenguaje puede producir artefactos visuales reproducibles y editables, en lugar de bitmaps opacos.
- Despliegue en hardware de consumo: con la cuantizacion i1-Q4_K_S (15,9 GB) el modelo puede ejecutarse en estaciones de trabajo con GPU de gama alta o en CPU con suficiente RAM, gracias al formato GGUF y llama.cpp.
- Generacion de assets para aplicaciones web: el codigo JavaScript generado puede integrarse directamente en frontends o en canvas HTML para producir visuales dinamicos.
- Investigacion sobre code-based image generation: el modelo sirve como base para estudiar la relacion entre representaciones simbolicas (codigo) y contenido visual, y para experimentar con cuantizaciones imatrix frente a estaticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 11,3 GB para i1-Q2_K, 13,1 GB para i1-IQ3_M y 15,9 GB para i1-Q4_K_S, mas el overhead de contexto y del runtime.
- GPU recomendadas: no especificadas por el autor; por tamano, encajan GPUs con 16-24 GB de VRAM (por ejemplo, RTX 4090, RTX A6000) para las cuantizaciones Q4, y GPUs de datacenter (A100, H100) para mayor contexto o precision.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas para las cuantizaciones mas pequenas; las de 24 GB permiten margen adicional.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, servidores compatibles con GGUF); el autor enlaza a las guias de TheBloke para el uso de archivos GGUF y concatenacion de partes.
- Latencia y throughput: no disponibles.
- Nota: el repositorio incluye un archivo imatrix (0,1 GB) para generar cuantizaciones propias.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (code-based image generation de ~27B) ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Idiomas: el modelo esta declarado unicamente para ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Alucinacion: al generar codigo JavaScript, existe riesgo de producir codigo invalido o no ejecutable; se recomienda validacion automatica de la salida.
- Sesgos: no se documentan sesgos conocidos, pero al no publicarse la composicion del dataset de entrenamiento no es posible evaluarlos.
- Licencia: Apache 2.0 en el modelo base, lo que permite uso comercial; conviene verificar los terminos del modelo base CodeImageGen/CIG-27B-IPR antes de produccion.
- Cuantizaciones de baja calidad: el propio autor advierte que i1-Q2_K puede ser inferior a IQ3_XXS en calidad; para produccion se recomienda Q4_K_S o superior.
- Informacion escasa: no hay datos publicados sobre contexto maximo, entrenamiento ni benchmarks, lo que dificulta evaluar su idoneidad en produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/CIG-27B-IPR-i1-GGUF
- Modelo base: https://huggingface.co/CodeImageGen/CIG-27B-IPR
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/CIG-27B-IPR-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#CIG-27B-IPR-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
