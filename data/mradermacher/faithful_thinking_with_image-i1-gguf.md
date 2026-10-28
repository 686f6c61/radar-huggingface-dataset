# mradermacher/Faithful_Thinking_with_Image-i1-GGUF

## Resumen

`mradermacher/Faithful_Thinking_with_Image-i1-GGUF` es un conjunto de cuantizaciones GGUF con *imatrix* del modelo multimodal `eugeneliu01/Faithful_Thinking_with_Image`, publicado por mradermacher (equipo de cuantización conocido por sus versiones i1 de modelos abiertos). No se trata de un modelo nuevo: es una redistribución optimizada para inferencia local del modelo base, que a su vez es un artefacto de investigación sobre la fidelidad del razonamiento multimodal encadenado (MCoT, *multimodal chain-of-thought*).

El modelo base aborda un problema concreto: los modelos que intercalan pasos de razonamiento visual y textual a menudo generan trazas que parecen basadas en la imagen pero que en realidad ignoran la evidencia visual. El trabajo de Eugene Liu y colaboradores mide esta falta de fidelidad interviniendo los pensamientos visuales y textuales, y atribuye el fenómeno al diseño de la recompensa en el *rejection fine-tuning* (RFT), que premia el formato intercalado sin comprobar la corrección del contenido visual.

Con 7.615.616.512 parámetros (~7,6 B) según los safetensors del modelo base, es un modelo de tamaño medio apto para GPUs de consumo en cuantizaciones bajas. La relevancia práctica es doble: sirve como objeto de estudio reproducible sobre fidelidad de razonamiento visual y como modelo ejecutable en local para experimentar con MCoT sin depender de APIs. Advertencia importante: la licencia no está declarada y el modelo solo declara inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; modelo multimodal basado en transformer (segun libreria `transformers` y tags `multimodal`, `visual-reasoning`) |
| Parametros totales | 7.615.616.512 (~7,6 B), medidos sobre safetensors del modelo base |
| Parametros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF i1 (imatrix): `i1-Q2_K` (3,1 GB) e `i1-IQ3_M` (3,7 GB) presentes en la tabla del autor; el listado interno de tags menciona ademas Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_XXS, IQ3_XS, IQ3_S, Q4_0, Q4_1, IQ4_XS, Q4_K_S, Q4_K_M, IQ4_NL, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | Ingles (`en`) |
| Licencia | No disponible (ni la del modelo base ni la de la cuantizacion se declaran) |
| Formato de pesos | GGUF (repo de 43,2 GB con multiples ficheros); el modelo original esta en safetensors |
| Fichero mmproj (vision) | No incluido en este repo; el autor indica que los mmproj estan en el repositorio estatico `Faithful_Thinking_with_Image-GGUF` |
| Fichero imatrix | `Faithful_Thinking_with_Image.imatrix.gguf` (0,1 GB), util para crear cuantizaciones propias |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-10-28 / 2026-10-28 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base: se sabe que es multimodal (procesa imagen y texto) y que se distribuye a traves de `transformers`, con 7,6 B de parametros. El nombre y los tags (`multimodal`, `visual-reasoning`) situan el foco en el razonamiento visual encadenado, es decir, en la generacion de trazas de pensamiento que intercalan referencias a regiones de la imagen con pasos textuales.

Respecto al entrenamiento, la documentacion publica del proyecto describe el uso de *rejection fine-tuning* (RFT) con una recompensa basada en el formato de las trazas intercaladas vision-texto. El hallazgo central del trabajo es que esa recompensa incentiva la apariencia del razonamiento visual sin garantizar su correccion: al intervenir los pensamientos visuales, las predicciones del modelo apenas cambian, mientras que al intervenir los textuales cambian de forma significativa. El numero de tokens de entrenamiento, la composicion del dataset y el uso de RLHF/DPO no estan disponibles en la informacion proporcionada. Esta cuantizacion, por su parte, aplica cuantizacion con matriz de importancia (imatrix) sobre los pesos del modelo base.

## Capacidades

- Procesamiento conjunto de imagen y texto (modelo multimodal), con salida conversacional.
- Generacion de cadenas de razonamiento que intercalan pasos visuales y textuales (MCoT).
- Razonamiento sobre contenido visual: el proyecto se centra en medir si el modelo realmente utiliza la evidencia de la imagen.
- Generacion de texto conversacional en ingles.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el MCoT es multi-paso a nivel de traza, no de uso de herramientas.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Capacidades especiales: no se documentan modo *thinking* explicito, audio ni video.
- Ejecucion local via GGUF (llama.cpp y derivados) en hardware de consumo.

## Casos de uso

- **Investigacion sobre fidelidad de razonamiento multimodal**: reproducir el protocolo del paper (intervenir los pensamientos visuales y textuales y medir el cambio en la prediccion) sobre una version cuantizada, para validar si los hallazgos se mantienen bajo cuantizacion agresiva. Es el uso natural de este artefacto.
- **Baseline para evaluar pipelines MCoT**: usar `i1-IQ3_M` como referencia de un modelo entrenado con RFT basado en formato, y compararlo con variantes con recompensa de fidelidad en experimentos academicos.
- **Prototipado en local sin GPU dedicada**: con `i1-Q2_K` (3,1 GB) el modelo cabe en equipos con 8 GB de RAM/VRAM, lo que permite probar flujos imagen-texto en portatiles antes de escalar a infraestructura.
- **Procesamiento de imagenes en entornos aislados (air-gapped)**: sectores con requisitos de confidencialidad (legal, sanidad, administracion) que no pueden enviar imagenes a APIs externas pueden ejecutar el modelo con llama.cpp en servidores propios.
- **Analisis de documentos con contenido visual en modo asistido**: extraccion de datos de graficos o tablas con traza de razonamiento auditable, siempre con revision humana dado el riesgo documentado de que el modelo ignore la imagen.
- **Generacion de anotaciones sinteticas para datasets VQA**: producir descripciones y razonamientos candidatos que despues se filtran manualmente, aprovechando el formato intercalado para revisar que parte del razonamiento cita la evidencia visual.
- **Docencia y divulgacion tecnica**: demostrar en un taller como un modelo puede producir razonamientos visuales plausibles pero no fieles, comparando la traza generada con intervenciones controladas sobre la imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor de la cuantizacion no incluye metricas (MMLU, HumanEval, GSM8K, MMMU u otras) y la documentacion del proyecto base accesible en la busqueda se centra en el analisis de fidelidad, no en una tabla de resultados. No se deben extrapolar cifras del modelo original a estas cuantizaciones sin medicion propia, especialmente en `i1-Q2_K`, donde la degradacion es esperable.

## Requisitos de hardware

- **VRAM/RAM estimada para inferencia** (solo pesos, sin contar KV cache ni mmproj): `i1-Q2_K` ~3,1 GB; `i1-IQ3_M` ~3,7 GB; Q4_K_M ~4,7 GB; Q5_K_M ~5,5 GB; Q6_K ~6,3 GB; Q8_0 ~8,1 GB; FP16 ~15,2 GB.
- **Coste adicional del mmproj**: hay que descargarlo del repositorio estatico y sumar su tamano (no indicado) mas el KV cache del contexto elegido.
- **GPU de consumo**: `i1-IQ3_M` cabe en GPUs de 6-8 GB (RTX 3060, RTX 4060, RTX 2070) dejando margen justo; con 12 GB (RTX 3060 12 GB, RTX 4070) se puede usar Q4_K_M o superior con contexto moderado; 16-24 GB (RTX 4060 Ti 16 GB, RTX 4090) permiten Q6_K/Q8_0.
- **GPU de datacenter**: A100 40/80 GB o H100 para FP16 con contextos largos y mayor throughput; L40S o A10G como alternativas de coste medio.
- **Despliegue**: llama.cpp (necesario para vision con `llama-mtmd-cli` y el fichero mmproj), Ollama, LM Studio, koboldcpp. vLLM y TGI soportan GGUF de forma experimental o no lo soportan; para produccion a gran escala conviene partir de los safetensors originales.
- **Latencia y throughput**: no disponibles en la informacion proporcionada. Como referencia cualitativa, un modelo de ~7,6 B en Q4 cuantiza a decodificacion interactiva en una RTX 4090 y resulta lento pero usable en CPU con 16 GB de RAM; la latencia real dependera del backend y de si se procesan imagenes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| Faithful_Thinking_with_Image (i1-GGUF) | ~7,6 B | No disponible | No disponible | GGUF (i1), safetensors en el base | Foco en fidelidad del razonamiento visual; solo ingles; sin benchmarks publicados aqui |
| Qwen2.5-VL-7B-Instruct | ~8,2 B | 128 K tokens | Apache 2.0 | Safetensors, GGUF de terceros | Multimodal generalista, multilingue, con soporte de agentes y grounding visual |
| InternVL3-8B | ~8 B | No disponible | Apache 2.0 (variantes pequenas) | Safetensors, GGUF de terceros | Alternativa multimodal de tamano similar con mejor soporte de ecosistema |
| MiniCPM-V 2.6 | ~8 B | No disponible | Licencia propia del autor | Safetensors, GGUF | Optimizado para imagen de alta resolucion y despliegue en dispositivo |

La comparacion relevante no es solo de tamano: los tres alternativas son modelos multimodales generalistas con licencia clara y soporte amplio, mientras que este artefacto es un modelo de investigacion cuyo interes esta en el fenomeno que estudia, no en su rendimiento como asistente visual. Cualquier cifra de rendimiento comparada deberia medirse, ya que no hay benchmarks publicados para este modelo.

## Limitaciones y advertencias

- **Fidelidad visual cuestionable por diseno**: el propio trabajo documenta que las predicciones apenas cambian ante intervenciones en el pensamiento visual, lo que indica que la imagen puede ser ignorada. No es un fallo de la cuantizacion, sino una propiedad del modelo base; en produccion implica riesgo de respuestas que parecen justificadas visualmente pero no lo estan.
- **Licencia no declarada**: no se puede asumir uso comercial. Hay que contactar con el autor del modelo base antes de cualquier despliegue productivo.
- **Solo ingles**: sin soporte declarado de castellano ni de otras lenguas.
- **Riesgo de alucinacion**: agravado en tareas visuales, porque la traza de razonamiento puede citar elementos de la imagen que no existen o no son relevantes.
- **Cuantizaciones muy agresivas**: `i1-Q2_K` esta en el limite de calidad aceptable; para cualquier evaluacion seria se recomienda `i1-IQ3_M` o cuantizaciones mayores generadas a partir del imatrix incluido.
- **Vision incompleta sin mmproj**: este repositorio no incluye los ficheros mmproj; sin descargarlos del repositorio estatico el modelo solo funciona como LLM de texto.
- **Sin validacion de la comunidad**: 0 descargas y 0 likes en el momento de la consulta; no hay reportes independientes de calidad ni de comportamiento.
- **Modelo de investigacion, no de produccion**: no hay garantias de formato de salida estable, ni documentacion de tool calling, ni evaluacion de seguridad.
- **Fecha de publicacion muy reciente** (creacion y actualizacion el mismo dia), por lo que el repositorio puede cambiar o ampliarse con nuevas cuantizaciones sin aviso.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/mradermacher/Faithful_Thinking_with_Image-i1-GGUF
- Modelo base: https://huggingface.co/eugeneliu01/Faithful_Thinking_with_Image
- Cuantizaciones estaticas y ficheros mmproj: https://huggingface.co/mradermacher/Faithful_Thinking_with_Image-GGUF
- Pagina de descargas del autor para este modelo: https://hf.tst.eu/model#Faithful_Thinking_with_Image-i1-GGUF
- Repositorio GitHub del proyecto: https://github.com/EugeneLiu01/Faithful_Thinking_with_Image
- README del proyecto en GitHub: https://github.com/EugeneLiu01/Faithful_Thinking_with_Image/blob/main/README.md
- Pagina de modelos de mradermacher: https://huggingface.co/mradermacher/models
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
