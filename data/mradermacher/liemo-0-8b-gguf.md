# mradermacher/liemo-0.8b-GGUF

## Resumen

liemo-0.8b es un modelo de lenguaje y vision (VLM) multimodal de pequeno tamano, desarrollado originalmente por el usuario lijie1228 y publicado en Hugging Face. Esta ficha concreta corresponde a la version cuantizada en formato GGUF realizada por mradermacher, un conocido creador de cuantizaciones para llama.cpp. El modelo se presenta como un fine-tune (mediante LoRA) sobre Qwen/Qwen3.5-0.8B, lo que lo situa en la familia Qwen 3.5 y hereda de ella su arquitectura transformer y su soporte multimodal.

El modelo resuelve el problema de disponer de capacidades de vision-lenguaje en entornos con recursos muy limitados: con aproximadamente 100 millones de parametros (segun los pesos en safetensors del modelo base), puede ejecutarse en CPU o en GPUs de gama baja, algo impensable para VLMs de mayor tamano. Su licencia Apache 2.0 y su disponibilidad en GGUF lo hacen atractivo para prototipado rapido, experimentacion academica y despliegues en el borde (edge).

Es relevante ahora porque los modelos multimodales ligeros estan ganando traccion para tareas de OCR, descripcion de imagenes y asistentes locales, y porque la cuantizacion GGUF permite integrarlo en llama.cpp y herramientas derivadas sin necesidad de infraestructura de GPU dedicada. No obstante, la informacion publica disponible sobre el modelo es muy escasa: no se detallan datos de entrenamiento, benchmarks ni composicion del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) basada en Qwen/Qwen3.5-0.8B, con adaptador LoRA sobre lijie1228/liemo-0.8b |
| Parametros totales | 100.592.896 (pesos safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; ademas mmproj en Q8_0 y f16 |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base original en transformers/safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen 3.5, adaptado a tareas multimodales (etiquetas vlm y multimodal). Sobre ese modelo base, lijie1228 aplico un fine-tune mediante LoRA, dando lugar a liemo-0.8b. La version aqui descrita es una conversion a GGUF realizada por mradermacher con su pipeline habitual (convert_type: hf, quantize_version 2, output_tensor_quantised 1), que incluye tanto los pesos del modelo como los ficheros mmproj necesarios para el procesamiento de imagenes en llama.cpp.

No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o instruction tuning supervisado. Tampoco se documentan innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.) mas alla de las propias de la familia Qwen 3.5. El autor de la cuantizacion indica que no ha generado cuantizaciones ponderadas/imatrix, solo estaticas.

## Capacidades

- Generacion de texto en chino e ingles.
- Procesamiento multimodal de imagenes (VLM): la presencia de ficheros mmproj confirma soporte de entrada visual en llama.cpp.
- Razonamiento basico y respuesta a instrucciones, heredado del fine-tune sobre Qwen 3.5.
- Soporte de tool calling / function calling: no disponible en la informacion publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion publicada.
- Capacidades multilingues limitadas a chino e ingles segun la model card; no se declara soporte de castellano.
- Capacidades especiales (modo thinking, audio): no disponible.

## Casos de uso

- OCR y extraccion de texto de imagenes en local: el modelo puede procesar imagenes mediante el fichero mmproj y devolver descripciones o texto, con la ventaja de ejecutarse en CPU o GPU de gama baja sin depender de servicios en la nube.
- Descripcion automatica de imagenes para accesibilidad: util para generar texto alternativo en catalogos o aplicaciones, dado su bajo coste de inferencia y su naturaleza multimodal.
- Prototipado rapido de asistentes multimodales: al ser un GGUF de ~0,3 GB, permite iterar en portatiles con llama.cpp u Ollama antes de escalar a modelos mayores.
- Clasificacion y etiquetado de imagenes en pipelines de datos: puede emplearse como preetiquetador barato en conjuntos grandes donde el coste por inferencia es critico.
- Experimentacion academica en VLMs ligeros: sirve como baseline para estudiar el efecto del tamano y la cuantizacion en tareas vision-lenguaje.
- Despliegue en el borde (edge): adecuado para dispositivos con poca memoria (Raspberry Pi, mini-PC) donde un VLM de 0,8B cuantizado a Q4 cabe en pocos cientos de MB.
- Filtrado y moderacion de contenido visual en tiempo real: su baja latencia potencial permite integrarlo en flujos de premoderacion antes de modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2-0,3 GB para cuantizaciones Q4/Q5; en torno a 0,5-0,7 GB para f16 (estimacion a partir del tamano de los ficheros y de los 100,6 M de parametros).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; tambien funciona en CPU. No requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (GTX 1050, RTX 3050, RTX 4090, etc.) e incluso en iGPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base original es compatible con transformers.
- Latencia y throughput estimados: no disponibles en la informacion publicada; por tamano, se espera inferencia en tiempo real o cercano en CPU moderna, aunque no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| liemo-0.8b (esta ficha) | ~100,6 M | no disponible | Si (VLM) | Apache 2.0 | GGUF, safetensors |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B (nominal) | no disponible | no disponible | no disponible | safetensors |
| Alternativas VLM ligeras (p. ej. SmolVLM, Moondream) | no disponible | no disponible | Si | variable | variable |

No se dispone de datos de rendimiento comparativo publicados para liemo-0.8b, por lo que la comparacion se limita a parametros, licencia y formato. Se recomienda consultar las fichas oficiales de SmolVLM y Moondream para una comparacion cuantitativa, que no se incluye aqui por falta de datos verificados.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Qwen 3.5 y entrenarse presumiblemente con datos en chino e ingles, es esperable un sesgo cultural y linguistico hacia esos idiomas.
- Riesgo de alucinacion: alto en modelos de este tamano, especialmente en tareas de razonamiento y en descripcion de imagenes complejas; no hay evaluaciones publicadas que lo cuantifiquen.
- Limitaciones de contexto e idioma: solo se declaran chino e ingles; el soporte de castellano no esta garantizado. La longitud de contexto no esta documentada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen/Qwen3.5-0.8B y del fine-tune original, ya que la model card no detalla obligaciones adicionales.
- Caveats para produccion: no hay benchmarks, no hay documentacion de entrenamiento y el numero de descargas es cero en el momento de la consulta; se trata de un modelo experimental, no validado para produccion.
- El autor de la cuantizacion advierte de que no hay cuantizaciones ponderadas/imatrix disponibles, lo que puede afectar a la calidad en cuantizaciones muy bajas (Q2_K, IQ4_XS).

## Enlaces

- Hugging Face (esta cuantizacion): https://huggingface.co/mradermacher/liemo-0.8b-GGUF
- Modelo base del fine-tune: https://huggingface.co/lijie1228/liemo-0.8b
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#liemo-0.8b-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia de TheBloke sobre GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
