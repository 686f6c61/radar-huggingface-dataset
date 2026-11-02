# mradermacher/Latxa-Qwen3-VL-2B-Instruct-GGUF

## Resumen

Latxa-Qwen3-VL-2B-Instruct-GGUF es la distribucion en formato GGUF del modelo HiTZ/Latxa-Qwen3-VL-2B-Instruct, publicada por el usuario mradermacher. El modelo original lo desarrolla HiTZ (Centro de Tecnologia del Lenguaje de la Universidad del Pais Vasco, UPV/EHU), un grupo con trayectoria consolidada en modelos del lenguaje para lenguas minorizadas. Este repositorio no introduce un modelo nuevo, sino una coleccion de cuantizaciones estaticas listas para su uso con llama.cpp y ecosistemas compatibles, lo que facilita el despliegue en hardware modesto.

El modelo base combina la familia Qwen3-VL (vision-lenguaje) con el ajuste de Latxa orientado a euskera, gallego, catalan, castellano e ingles. Con aproximadamente 1.720 millones de parametros, se situa en la gama pequena de modelos multimodales, lo que lo hace atractivo para entornos con recursos limitados, prototipado rapido y aplicaciones en las que el multilingue peninsular y la vision son requisitos.

La relevancia actual reside en dos factores: por un lado, la escasez de modelos abiertos que cubran con calidad lenguas como el euskera o el gallego junto con capacidades visuales; por otro, la disponibilidad de cuantizaciones GGUF que permiten ejecutarlo en CPU o en GPUs de consumo. La licencia Apache 2.0 anade flexibilidad para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3-VL, familia Qwen3), con componente visual |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj-f16 y mmproj-Q8_0 para el componente visual |
| Idiomas soportados | eu (euskera), gl (gallego), ca (catalan), es (castellano), en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia Qwen3-VL, con un componente de vision que se distribuye por separado en el repositorio GGUF mediante los ficheros mmproj (proyeccion multimodal). El ajuste realizado por HiTZ parte del modelo Qwen3-VL-2B-Instruct y lo especializa sobre el corpus latxa-corpus-v1.1, un dataset propio orientado a las lenguas cooficiales del Estado espanol y el euskera. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO.

La innovacion principal de esta distribucion es la cuantizacion estatica generada por mradermacher con la herramienta de conversion de llama.cpp. Se ofrecen variantes K-quant (Q2_K a Q8_0) e IQ4_XS, ademas de f16, y ficheros mmproj en f16 y Q8_0 para el codificador visual. El autor indica que las cuantizaciones ponderadas o con imatrix no estan disponibles en el momento de la publicacion, por lo que las mejoras de calidad asociadas a ese metodo no se aplican aqui.

## Capacidades

- Generacion de texto conversacional en euskera, gallego, catalan, castellano e ingles.
- Comprension de imagenes y respuesta a preguntas sobre contenido visual (vision-lenguaje), gracias al componente mmproj.
- Razonamiento basico y respuesta a instrucciones en formato chat (modelo -Instruct).
- Soporte de conversaciones multi-turno.
- Capacidad multilingue centrada en lenguas peninsulares, con cobertura adicional del ingles.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, agentes o modo thinking.

## Casos de uso

- Atencion al cliente en euskera, gallego o catalan: el modelo puede gestionar conversaciones multi-turno en la lengua del usuario, algo poco cubierto por modelos genericos, y desplegarse en local para cumplir requisitos de soberania de datos.
- Digitalizacion y descripcion de imagenes en administraciones publicas: con el componente visual puede etiquetar documentos escaneados, fotografias o formularios y generar descripciones en la lengua cooficial correspondiente.
- Asistentes educativos para escuelas con curriculum en euskera o catalan: su tamano de 2B permite ejecutarlo en equipos de aula o portatiles sin GPU dedicada usando cuantizaciones Q4.
- Prototipado rapido de aplicaciones multimodales: la disponibilidad de GGUF y de mmproj permite integrar el modelo en llama.cpp u Ollama para validar ideas antes de invertir en modelos mayores.
- Traduccion y resumen entre castellano y lenguas cooficiales: util para redactar resumenes o adaptar contenidos administrativos entre idiomas del Estado.
- Procesamiento en el borde (edge) o en entornos sin conectividad: al caber en menos de 1 GB en Q2_K y en torno a 1,2 GB en Q4_K_M, puede ejecutarse en dispositivos con recursos muy limitados.
- Analisis de capturas o imagenes en herramientas internas: por ejemplo, extraer informacion de graficos simples o clasificar imagenes en un pipeline local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion: Q2_K ~0,9 GB; Q3_K_S/M ~1,0 GB; Q3_K_L e IQ4_XS ~1,1 GB; Q4_K_S/M ~1,2 GB; Q5_K_S/M ~1,3-1,4 GB; Q6_K ~1,5 GB; Q8_0 ~1,9 GB; f16 ~3,5 GB. Hay que sumar el fichero mmproj (0,5 GB en Q8_0 o 0,9 GB en f16) si se usa la parte visual.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente para las cuantizaciones Q4-Q8; una RTX 3060, RTX 4060 o superior permite ejecutar el modelo completo en VRAM con margen. En entornos profesionales, A100 o H100 no aportan ventaja significativa por el reducido tamano.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU dedicada moderna e incluso en iGPUs con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, transformers con el pipeline correspondiente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Latxa-Qwen3-VL-2B-Instruct (este) | 1,72 B | no disponible | eu, gl, ca, es, en | Apache 2.0 | GGUF, safetensors |
| Qwen3-VL-2B-Instruct (base) | ~2 B | no disponible | multilingue amplio | Apache 2.0 | safetensors, GGUF (terceros) |
| Modelos Latxa de texto (familia HiTZ) | variable | no disponible | eu, es, en principalmente | Apache 2.0 | safetensors, GGUF |
| Modelos multimodales pequenos tipo SmolVLM | ~2 B | no disponible | principalmente ingles | Apache 2.0 | safetensors, GGUF |

La ventaja diferencial frente a Qwen3-VL-2B-Instruct es la cobertura reforzada de euskera, gallego y catalan; frente a SmolVLM u otros pequenos multimodales, la misma ventaja linguistica y el soporte nativo de vision. El coste es un posible retroceso en rendimiento general en ingles respecto al modelo base, aunque no hay datos publicados que lo cuantifiquen.

## Limitaciones y advertencias

- No se han publicado evaluaciones que midan el rendimiento real de este ajuste; el riesgo de alucinacion y de degradacion en tareas complejas es mayor que en modelos de mayor tamano.
- La cobertura de idiomas se limita a eu, gl, ca, es y en; otros idiomas pueden degradarse notablemente.
- La longitud de contexto no esta documentada en la informacion disponible, lo que dificulta planificar casos de uso con documentos largos.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar la calidad de forma apreciable, especialmente en tareas de vision y en lenguas de bajos recursos.
- El autor no ha publicado cuantizaciones con imatrix, por lo que no se dispone de la mejora de calidad habitual de ese metodo.
- El componente visual requiere cargar el fichero mmproj correspondiente; omitirlo desactiva la funcionalidad multimodal.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-VL y del corpus latxa-corpus-v1.1 por si imponen restricciones adicionales.
- El repositorio tiene solo 289 descargas y 0 likes en el momento de la consulta, lo que indica poca validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Latxa-Qwen3-VL-2B-Instruct-GGUF
- Modelo base: https://huggingface.co/HiTZ/Latxa-Qwen3-VL-2B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/HiTZ/latxa-corpus-v1.1
- Pagina de descargas del autor: https://hf.tst.eu/model#Latxa-Qwen3-VL-2B-Instruct-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
