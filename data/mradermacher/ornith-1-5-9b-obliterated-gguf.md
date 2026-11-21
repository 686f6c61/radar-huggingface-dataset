# mradermacher/Ornith-1.5-9B-OBLITERATED-GGUF

## Resumen

Ornith-1.5-9B-OBLITERATED-GGUF es la distribucion en formato GGUF del modelo Ornith-1.5-9B-OBLITERATED, una variante "abliterated" (es decir, con las direcciones de rechazo eliminadas del espacio de activaciones) del modelo base Ornith-1.5-9B. El trabajo de cuantizacion lo firma mradermacher, un conocido cuantizador de la comunidad de Hugging Face que publica versiones estaticas y con imatrix de modelos populares. El modelo original pertenece a la organizacion OBLITERATUS y esta etiquetado internamente como derivado de la familia Qwen 3.5, con 9.197.093.888 parametros totales segun los safetensors del modelo base.

El interes de esta publicacion es practico: ofrece el modelo en 13 cuantizaciones GGUF distintas (desde Q2_K de 4,0 GB hasta f16 de 18,5 GB), ademas de dos suplementos multimodales mmproj (Q8_0 y f16), lo que permite ejecutar un modelo de ~9B en hardware de consumo y en entornos con llama.cpp u Ollama. Al estar "abliterated", el modelo esta pensado para escenarios donde se quiere reducir la tasa de rechazos del modelo original, algo relevante para investigacion sobre alineamiento, red teaming y generacion creativa sin restricciones.

La licencia es MIT, lo que facilita su uso comercial, pero conviene tener presente que la eliminacion de rechazos conlleva riesgos de seguridad y que la model card del cuantizador no documenta datos de entrenamiento, contexto ni benchmarks. Esta ficha se limita a lo que la informacion disponible permite afirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag del modelo indica familia Qwen 3.5; no se detalla la arquitectura interna) |
| Parametros totales | 9.197.093.888 (~9,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (segun la model card) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repo | 85,1 GB |
| Modelo base | OBLITERATUS/Ornith-1.5-9B-OBLITERATED |
| Descargas / likes | 971 / 2 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo original en la documentacion proporcionada. Los tags del repositorio lo vinculan a la familia Qwen 3.5 y a la tecnica "obliteratus", que consiste en la ablacion de direcciones en el espacio de activaciones para eliminar comportamientos de rechazo. El modelo base se distribuye en safetensors con 9.197.093.888 parametros, y esta publicacion es una conversion a GGUF realizada con la herramienta de cuantizacion de mradermacher (convert_type: hf, quantize_version: 2).

No hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplico RLHF, DPO u otras tecnicas de alineamiento posteriores. Tampoco se documenta ninguna innovacion arquitectonica especifica (atencion lineal, decodificacion especulativa, etc.). La unica informacion tecnica adicional es la presencia de suplementos multimodales mmproj, lo que sugiere que el modelo base incorpora capacidad de vision, aunque la model card no lo detalla.

## Capacidades

- Generacion de texto conversacional en ingles, segun el tag `conversational` del repositorio.
- Comportamiento "abliterated"/"uncensored": se ha reducido la tendencia del modelo a rechazar peticiones, lo que cambia el perfil de respuestas respecto al modelo original.
- Soporte multimodal probable: el repositorio incluye ficheros mmproj-Q8_0 y mmproj-f16 descritos como "multi-modal supplement", lo que indica que el modelo base puede procesar imagenes junto con texto.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede desplegarse detras de APIs compatibles con el formato de Hugging Face.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: la model card solo declara ingles (`language: en`); no se confirma soporte de otros idiomas.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como cambia la tasa de rechazo tras la ablacion, comparando respuestas con el modelo original en un mismo conjunto de prompts. Es adecuado porque el proceso de "obliteration" es precisamente el objeto de estudio.
- Red teaming y evaluacion de robustez: util para generar respuestas adversarias y analizar los limites del filtrado de seguridad en pipelines propios, gracias a su menor tasa de rechazos.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa con tematicas sensibles donde el modelo original tenderia a rechazar la peticion; el formato GGUF permite ejecutarlo localmente con llama.cpp u Ollama.
- Despliegue local en estaciones de trabajo: con la cuantizacion Q4_K_M (5,9 GB) cabe en GPUs de consumo de 8 GB o mas, lo que permite prototipar asistentes conversacionales sin depender de la nube.
- Procesamiento de documentos con imagenes: si se carga el suplemento mmproj junto con el modelo, puede emplearse para tareas de descripcion o extraccion de informacion de imagenes en un pipeline multimodal local.
- Experimentacion con tecnicas de cuantizacion: el repositorio ofrece 12 niveles de cuantizacion del mismo modelo, lo que permite medir el impacto de la cuantizacion en la calidad de las respuestas con un conjunto de evaluacion propio.
- Integracion en herramientas de escritorio: al ser GGUF y licencia MIT, puede embeberse en aplicaciones de escritorio o plugins que requieran inferencia local sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~4,0 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: ~4,5-5,1 GB
  - IQ4_XS: ~5,5 GB
  - Q4_K_S / Q4_K_M: ~5,6-5,9 GB
  - Q5_K_S / Q5_K_M: ~6,6-6,7 GB
  - Q6_K: ~7,7 GB
  - Q8_0: ~9,9 GB
  - f16: ~18,5 GB
  - Suplemento multimodal mmproj: ~0,7 GB (Q8_0) o ~1,0 GB (f16)
- GPU recomendadas: no hay recomendaciones oficiales en la informacion disponible. Por tamano, las cuantizaciones Q4 caben en GPUs de consumo de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070); Q5 y Q6 requieren 8-12 GB (RTX 4070, RTX 3080); Q8_0 requiere 12-16 GB (RTX 4070 Ti, RTX 4080); f16 requiere 24 GB o mas (RTX 3090, RTX 4090, A100, H100).
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones (Q2_K a Q6_K) en tarjetas de 8-12 GB.
- Opciones de despliegue: llama.cpp y cualquier frontend compatible con GGUF (Ollama, LM Studio, llama-cpp-python, KoboldCpp). El tag `endpoints_compatible` sugiere compatibilidad con APIs tipo OpenAI a traves de servidores GGUF. No se menciona soporte de vLLM o TGI para este formato.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B-OBLITERATED-GGUF | ~9,2B | no disponible | MIT | GGUF (12 cuants + mmproj) | Variante abliterated con vision probable |
| Ornith-1.5-9B-OBLITERATED (base) | ~9,2B | no disponible | MIT | safetensors | Modelo original sin cuantizar |
| Qwen 3.5 (familia base) | no disponible | no disponible | no disponible | no disponible | Familia referenciada en los tags; no se dispone de specs concretas |
| Alternativas abliterated de ~8-9B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- La ablacion de rechazos puede aumentar la probabilidad de respuestas daninas, sesgadas o inapropiadas; no es recomendable desplegarlo en aplicaciones de cara al publico sin capas adicionales de moderacion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a los modelos de ~9B y agravado por la falta de benchmarks publicados.
- Idiomas: la model card solo declara ingles; el rendimiento en castellano no esta verificado.
- Longitud de contexto: no documentada; no debe asumirse una ventana larga sin pruebas propias.
- La licencia MIT del repositorio de cuantizacion no garantiza que el modelo base tenga la misma licencia; conviene verificar la licencia del modelo original OBLITERATUS/Ornith-1.5-9B-OBLITERATED antes de uso comercial.
- El repositorio tiene muy poca traccion (2 likes, 971 descargas) y la model card es una plantilla generica del cuantizador, sin documentacion tecnica propia.
- La fecha de creacion del repositorio (2026-08-27) y la referencia a Qwen 3.5 deben tratarse con cautela; no hay verificacion independiente en la informacion disponible.
- El tamano del repo (85,1 GB) incluye todas las cuantizaciones; descargar solo el fichero GGUF necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Ornith-1.5-9B-OBLITERATED-GGUF
- Modelo base: https://huggingface.co/OBLITERATUS/Ornith-1.5-9B-OBLITERATED
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Ornith-1.5-9B-OBLITERATED-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Ornith-1.5-9B-OBLITERATED-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
