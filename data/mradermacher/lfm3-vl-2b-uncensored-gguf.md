# mradermacher/LFM3-VL-2B-Uncensored-GGUF

## Resumen

LFM3-VL-2B-Uncensored-GGUF es la distribucion en formato GGUF del modelo GCSA-AiLab/LFM3-VL-2B-Uncensored, una variante multimodal (vision-lenguaje) del modelo LFM3 de 2B de parametros, publicada por el usuario mradermacher en Hugging Face. El modelo base es un derivado "uncensored" (abliterated, segun el tag `abliterix`) del LFM3-VL de Liquid AI, orientado a despliegue en el borde (edge) y con soporte para ingles y chino. Esta version concreta no anade pesos nuevos: empaqueta el modelo original en cuantizaciones GGUF de 2 a 16 bits para su uso con llama.cpp y herramientas compatibles.

El modelo cuenta con 1.728.801.600 parametros reales (segun los safetensors del modelo base), lo que lo situa en la categoria de 2B. Su interes practico radica en que combina capacidades de vision y lenguaje en un tamano que cabe en GPUs de consumo y en dispositivos de borde, y en que la cuantizacion GGUF permite ejecutarlo en CPU o en GPUs modestas con un consumo de VRAM muy contenido (desde ~0,9 GB en Q2_K hasta ~3,6 GB en f16).

La licencia es `lfm1.0` (Liquid Foundation Model License), que impone restricciones de uso comercial que deben revisarse antes de cualquier despliegue en produccion. La model card no proporciona informacion sobre la longitud de contexto, los datos de entrenamiento ni resultados de benchmarks, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3-VL, familia Liquid Foundation Model; no se detalla en la informacion proporcionada) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj en Q8_0 y f16 para la parte multimodal |
| Idiomas soportados | en, zh |
| Licencia | lfm1.0 (license_name: lfm1.0, license: other) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. El modelo pertenece a la familia LFM3-VL de Liquid AI, que combina un modelo de lenguaje con un codificador visual para tareas multimodales, pero la model card no especifica el tipo de transformer, el mecanismo de atencion ni la composicion del dataset de entrenamiento. Tampoco se documentan el numero de tokens de entrenamiento, las fases de RLHF/DPO ni innovaciones tecnicas concretas (decodificacion especulativa, atencion lineal, etc.).

Lo que si es verificable es el proceso de publicacion: se trata de una cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) realizada por mradermacher sobre el modelo GCSA-AiLab/LFM3-VL-2B-Uncensored. El modelo base incorpora el tag `abliterix`, que indica que ha sido sometido a un proceso de "abliteration" para eliminar los rechazos del modelo original, y el tag `edge`, que senala su orientacion a despliegue en dispositivos de borde. Existe ademas una version con cuantizaciones ponderadas/imatrix en el repositorio mradermacher/LFM3-VL-2B-Uncensored-i1-GGUF.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Procesamiento multimodal de imagenes: el repositorio incluye ficheros `mmproj` (proyector multimodal) en Q8_0 y f16, necesarios para la inferencia vision-lenguaje con llama.cpp.
- Razonamiento y respuesta a preguntas sobre contenido visual, al ser una variante VL (vision-lenguaje).
- Modo "uncensored": el proceso de abliteration del modelo base elimina los rechazos por contenido, lo que cambia el comportamiento respecto al modelo original.
- Orientacion a despliegue en el borde: tamano de 2B y cuantizaciones desde 0,9 GB permiten ejecucion en hardware limitado.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, audio ni modo "thinking" en la informacion disponible.

## Casos de uso

- Asistente de vision en dispositivos de borde: con la cuantizacion Q4_K_M (1,2 GB) y el mmproj Q8_0 (0,3 GB), el modelo puede ejecutarse en una Raspberry Pi 5 con 8 GB de RAM o en una GPU integrada para describir imagenes capturadas por una camara, sin conexion a la nube.
- Clasificacion y descripcion de imagenes en pipelines locales: integrado via llama.cpp, permite etiquetar lotes de imagenes en un servidor sin GPU dedicada, usando el fichero mmproj-f16 (0,5 GB) para maxima calidad visual.
- Prototipado rapido de aplicaciones multimodales: la version Q4_K_S o Q4_K_M, marcadas como "fast, recommended" por el autor, permite iterar en un portatil con GPU de consumo antes de decidir si se necesita un modelo mayor.
- Procesamiento de documentos con imagenes en ingles o chino: el soporte bilingue en/zh y la capacidad VL permiten extraer informacion de capturas, formularios o diagramas en entornos donde no se quiere enviar datos a APIs externas.
- Investigacion sobre alineacion y abliteration: al ser una variante "uncensored", sirve para estudiar el efecto de la eliminacion de rechazos en modelos pequenos, comparando respuestas con el modelo original LFM3-VL-2B.
- Despliegue en entornos con recursos muy limitados: la cuantizacion Q2_K (0,9 GB) permite ejecutar el modelo en CPU con poca RAM para tareas de baja exigencia, aunque con perdida de calidad respecto a Q6_K o Q8_0.
- Demo educativa de modelos multimodales: el tamano reducido y el formato GGUF facilitan su uso en talleres y cursos sin necesidad de infraestructura de GPU profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~0,9 GB; Q3_K_S ~1,0 GB; IQ4_XS ~1,1 GB; Q4_K_M ~1,2 GB; Q5_K_M ~1,4 GB; Q6_K ~1,5 GB; Q8_0 ~1,9 GB; f16 ~3,6 GB. Para la parte multimodal hay que sumar el mmproj (0,3 GB en Q8_0 o 0,5 GB en f16).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar las cuantizaciones Q4 a Q8 con margen para contexto; una RTX 3060 de 12 GB o RTX 4090 de 24 GB permiten f16 y contextos amplios sin problemas.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.), y en CPU con 2-4 GB de RAM libre segun cuantizacion.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llama-cpp-python); el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI. No se documenta soporte de vLLM o TGI para este formato GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-VL-2B-Uncensored-GGUF (este) | 1,73 B | no disponible | si (VL) | lfm1.0 | GGUF |
| GCSA-AiLab/LFM3-VL-2B-Uncensored (base) | 1,73 B | no disponible | si (VL) | lfm1.0 | safetensors |
| LFM3-VL-2B original (familia Liquid AI) | ~2 B | no disponible | si (VL) | lfm1.0 | safetensors/GGUF |

No se dispone de datos de rendimiento ni de contexto para establecer una comparacion cuantitativa con alternativas de la misma categoria (por ejemplo, otros modelos VL de 2B como Qwen2-VL-2B o SmolVLM). La informacion proporcionada no permite confirmar parametros, contexto ni benchmarks de esos modelos, por lo que la comparativa se limita a las variantes del propio modelo.

## Limitaciones y advertencias

- Modelo "uncensored": el proceso de abliteration elimina los rechazos del modelo original, lo que aumenta el riesgo de generar contenido danino, sesgado o inapropiado sin filtros. No es adecuado para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo de alucinacion: como todo modelo de lenguaje de 2B, la precision factual es limitada y puede inventar detalles, especialmente en tareas de razonamiento complejo o lectura de imagenes con texto denso.
- Idiomas: solo se declaran ingles y chino; el rendimiento en castellano no esta garantizado ni documentado.
- Contexto: no se ha publicado la longitud de contexto, lo que impide planificar aplicaciones que requieran ventanas largas.
- Licencia lfm1.0: impone restricciones de uso comercial que deben revisarse en el fichero LICENSE del repositorio antes de cualquier despliegue en produccion.
- Calidad de cuantizacion: las cuantizaciones Q2_K y Q3_K pueden degradar notablemente la calidad; el autor recomienda Q4_K_S/Q4_K_M como equilibrio y Q6_K/Q8_0 para maxima fidelidad.
- La parte multimodal requiere cargar el fichero mmproj junto con los pesos; sin el, el modelo solo funciona como modelo de texto.
- No se documentan sesgos especificos ni evaluaciones de seguridad del modelo base ni de la variante uncensored.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LFM3-VL-2B-Uncensored-GGUF
- Modelo base: https://huggingface.co/GCSA-AiLab/LFM3-VL-2B-Uncensored
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/LFM3-VL-2B-Uncensored-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#LFM3-VL-2B-Uncensored-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
