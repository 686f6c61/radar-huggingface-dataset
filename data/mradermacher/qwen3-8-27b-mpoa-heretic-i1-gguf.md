# mradermacher/Qwen3.8-27B-MPOA-heretic-i1-GGUF

## Resumen

Qwen3.8-27B-MPOA-heretic-i1-GGUF es una cuantización en formato GGUF del modelo richardyoung/Qwen3.8-27B-MPOA-heretic, publicada por mradermacher. Se trata de una variante "abliterated" o "decensored" del modelo Qwen3.8 de 27B parámetros, es decir, una versión en la que se ha eliminado el alineamiento de seguridad para reducir los rechazos en la generación de contenido. El modelo cuenta con 26.895.998.464 parámetros reales según los pesos safetensors del modelo base.

El repositorio ofrece cuantizaciones con imatrix (denominadas i1) en un amplio rango de tipos, desde IQ1_S de 7,2 GB hasta Q6_K de 22,2 GB, lo que permite desplegar el modelo en hardware muy diverso, desde GPUs de consumo hasta estaciones de trabajo. La model card indica que se trata de un modelo de visión, con archivos mmproj disponibles en el repositorio estático asociado.

La relevancia de esta ficha radica en que combina un modelo de gran tamano (27B) con cuantizaciones optimizadas para inferencia local, y en que su naturaleza "heretic" lo hace adecuado para escenarios de investigación donde se necesita estudiar el comportamiento de modelos sin las restricciones habituales de alineamiento, si bien esto conlleva advertencias importantes de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8, transformer presumiblemente, no confirmado en la informacion) |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (cuantizaciones i1 con imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (segun metadatos; la model card tambien menciona openrail++ en las etiquetas) |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna, el numero de tokens de entrenamiento ni la composicion del dataset en la informacion proporcionada. El modelo base es richardyoung/Qwen3.8-27B-MPOA-heretic, del cual no se detalla el proceso de entrenamiento en esta ficha. Por el nombre y el tamano, se infiere que deriva de la familia Qwen3.8 con 27B parametros, pero no se confirma la arquitectura exacta (transformer denso o MoE) ni innovaciones tecnicas como decodificacion especulativa o attention linear.

La naturaleza "heretic" o "abliterated" indica que se ha aplicado una tecnica de eliminacion de direcciones de rechazo en el espacio de activaciones, un proceso reproducible segun las etiquetas del repositorio. Las cuantizaciones i1 emplean un fichero imatrix (0,1 GB) para ponderar la cuantizacion, lo que segun la model card mejora la calidad frente a cuantizaciones estaticas de tamano similar. No se dispone de informacion sobre RLHF, DPO ni otras fases de alineamiento en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" y el pipeline de transformers.
- Capacidades de vision: la model card indica explicitamente que es un modelo de vision, con archivos mmproj en el repositorio estatico asociado.
- Modelo "uncensored" / "decensored" / "abliterated": reduce los rechazos y filtros de seguridad del modelo original.
- Compatible con endpoints (etiqueta "endpoints_compatible").
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo de idiomas.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como se comporta un modelo de 27B sin las capas de rechazo, util para analizar sesgos, robustez y eficacia de tecnicas de abliteration en entornos controlados.
- Inferencia local en GPUs de consumo: con cuantizaciones i1-Q4_K_M (16,6 GB) o i1-IQ4_XS (15,2 GB) puede ejecutarse en GPUs con 16-24 GB de VRAM, lo que facilita experimentacion sin infraestructura de servidor.
- Generacion de contenido creativo sin restricciones: para proyectos de escritura, guiones o narrativa donde se necesita explorar tematicas que los modelos alineados rechazan, con la advertencia de revision humana posterior.
- Prototipado de asistentes conversacionales en ingles: el modelo mantiene capacidades conversacionales multi-turno, adecuado para probar interfaces de chat antes de pasar a modelos alineados en produccion.
- Analisis de imagenes en local: al ser un modelo de vision con mmproj, puede emplearse para tareas de descripcion o comprension de imagenes en entornos con requisitos de privacidad, usando llama.cpp con soporte multimodal.
- Evaluacion comparativa de cuantizaciones: el amplio rango de cuantizaciones (desde IQ1_S hasta Q6_K) permite medir el impacto de la cuantizacion en la calidad de un modelo de 27B, util para investigacion sobre tecnicas de cuantizacion con imatrix.
- Despliegue en estaciones de trabajo con llama.cpp u Ollama: las cuantizaciones Q4_K_S y Q4_K_M estan marcadas como "optimal size/speed/quality" y "fast, recommended" respectivamente, lo que las hace idoneas para uso interactivo local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: desde aproximadamente 7,2 GB (i1-IQ1_S) hasta 22,2 GB (i1-Q6_K), mas el overhead de contexto y el fichero mmproj si se usa vision.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, las cuantizaciones Q4 requieren GPUs de 16-24 GB (RTX 4090, RTX 4080, A5000) y las Q6 requieren 24 GB o mas (RTX 4090, A100 40GB, H100).
- Cabe en GPU de consumo: si, en cuantizaciones IQ1 a Q4 en GPUs de 8-24 GB; las cuantizaciones Q5 y Q6 requieren 24 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el modelo base es compatible con transformers y endpoints.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-MPOA-heretic-i1-GGUF (este) | 26,9B | no disponible | apache-2.0 | GGUF (i1) | Version abliterated con cuantizaciones imatrix |
| richardyoung/Qwen3.8-27B-MPOA-heretic | 26,9B | no disponible | no disponible | safetensors | Modelo base sin cuantizar |
| mradermacher/Qwen3.8-27B-MPOA-heretic-GGUF | 26,9B | no disponible | apache-2.0 | GGUF (estatico) | Cuantizaciones estaticas del mismo modelo base |

No se dispone de datos de rendimiento ni de modelos comparables adicionales en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored" / "abliterated": elimina los filtros de seguridad, por lo que puede generar contenido danino, ofensivo o ilegal. No apto para produccion orientada al publico general sin moderacion adicional.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; al ser un modelo de 27B cuantizado, la cuantizacion agresiva (IQ1, IQ2, Q2) degrada la calidad de forma notable, como advierte la propia model card.
- Limitacion de idioma: solo se declara ingles; el rendimiento en castellano no esta garantizado.
- Licencia: los metadatos indican apache-2.0, pero la model card tambien incluye la etiqueta openrail++; conviene verificar los terminos exactos antes de uso comercial.
- Contexto: no se especifica la longitud de contexto soportada, lo que impide planificar cargas de trabajo con contexto largo.
- Vision: los archivos mmproj estan en el repositorio estatico, no en este; es necesario descargarlos por separado para usar capacidades multimodales.
- Cuantizaciones de baja calidad: las variantes IQ1_S, IQ1_M y Q2_K_S estan marcadas por el autor como "for the desperate", "mostly desperate" o "very low quality"; no recomendadas para uso serio.
- Sin datos de benchmarks: no hay evidencia publicada de rendimiento en tareas estandar, lo que dificulta comparar con alternativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-MPOA-heretic-i1-GGUF
- Modelo base: https://huggingface.co/richardyoung/Qwen3.8-27B-MPOA-heretic
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.8-27B-MPOA-heretic-GGUF
- Pagina de overview del autor: https://hf.tst.eu/model#Qwen3.8-27B-MPOA-heretic-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
