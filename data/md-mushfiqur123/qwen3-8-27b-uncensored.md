# MD-Mushfiqur123/Qwen3.8-27B-uncensored

## Resumen

Qwen3.8-27B-uncensored es un ajuste fino (finetune) del modelo base Qwen/Qwen3.8-27B, publicado por el usuario MD-Mushfiqur123 en Hugging Face. Se distribuye como un modelo multimodal de tipo image-text-to-text, es decir, acepta imagenes y texto como entrada y genera texto como salida, sobre la arquitectura qwen3_5 segun las etiquetas del repositorio. Cuenta con 27.781.427.952 parametros reales declarados en los tensores safetensors y un repositorio de 55,6 GB.

La propuesta del autor es una variante "uncensored", orientada a reducir los rechazos y filtros de seguridad del modelo original, manteniendo la licencia MIT del modelo base. El modelo se publica bajo la libreria transformers y con pesos en safetensors, lo que facilita su carga en pipelines estandar de Hugging Face.

La relevancia de esta ficha es limitada por la escasez de documentacion: la model card no incluye detalles de entrenamiento, composicion del dataset, hiperparametros ni resultados de evaluacion. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 26 de noviembre de 2026. Toda la informacion tecnica adicional debe tratarse como no disponible o inferida de las etiquetas del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (segun tags del repositorio); transformer multimodal image-text-to-text; detalles internos no disponibles |
| Parametros totales | 27.781.427.952 (27,78 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.8-27B |
| Tamano del repositorio | 55,6 GB |
| Pipeline | image-text-to-text |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo se presenta como un finetune del modelo base Qwen/Qwen3.8-27B, con etiquetas que apuntan a la familia de arquitecturas qwen3_5 y qwen3_6 y a la modalidad image-text-to-text. Esto sugiere una arquitectura transformer con capacidad multimodal para procesar imagenes junto con texto, aunque no se detalla el mecanismo de codificacion visual, el numero de capas, la dimension oculta ni la configuracion de atencion.

No hay informacion sobre el proceso de entrenamiento: no se indica el numero de tokens utilizados, la composicion del dataset, si se emplearon tecnicas de RLHF, DPO u otras formas de alineacion, ni los hiperparametros del ajuste fino. Tampoco se documenta que metodo se uso para eliminar o reducir los filtros de seguridad (por ejemplo, datasets sin censura, ablacion de direcciones de rechazo o ajuste supervisado sobre respuestas sin restricciones). Todos estos datos deben considerarse no disponibles.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta "conversational".
- Procesamiento de entradas multimodal image-text-to-text: el pipeline declarado permite enviar imagenes junto con texto.
- Orientacion "uncensored": el autor indica que se han reducido los rechazos del modelo base, aunque no se documenta el metodo ni el alcance.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo se declara ingles (en); no se confirma soporte de otros idiomas.
- Capacidades especiales (modo thinking, audio, etc.): no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: el modelo puede gestionar dialogos multi-turno como base para experimentos, aunque la ausencia de datos sobre contexto maximo obliga a validar la ventana real antes de desplegarlo.
- Investigacion sobre alineacion y seguridad: al ser una variante "uncensored" de un modelo conocido, resulta util para estudiar como cambia el comportamiento del modelo al eliminar filtros, comparando respuestas con el modelo base.
- Experimentos multimodales image-text-to-text: el pipeline declarado permite probar tareas de descripcion de imagenes o respuesta a preguntas visuales en entornos de investigacion, siempre que se valide la calidad del ajuste fino.
- Generacion de contenido creativo sin restricciones en ingles: escritura de ficcion, guiones o material narrativo donde el autor busca menos rechazos, con revision humana obligatoria por el riesgo de contenido inapropiado.
- Evaluacion comparativa de finetunes: sirve como punto de comparacion frente al Qwen3.8-27B original en benchmarks de calidad, sesgo y tasa de rechazo, aunque el propio modelo no publica resultados.
- Despliegue interno en entornos controlados: con licencia MIT y pesos safetensors, puede integrarse en pipelines de transformers para pruebas internas, sin garantias de soporte ni mantenimiento por parte del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,78 mil millones de parametros, en precision BF16 se requieren aproximadamente 55-56 GB de VRAM solo para los pesos, mas memoria para el codificador visual, el KV cache y activaciones. En cuantizacion de 8 bits se estiman unos 28-30 GB, y en 4 bits unos 15-17 GB, aunque estas cifras son estimaciones tecnicas y no datos publicados por el autor.
- GPU recomendadas: para BF16, GPU de 80 GB como A100 80GB o H100 80GB; para 8 bits, A100 40GB o L40S 48GB; para 4 bits, RTX 4090 24GB o RTX A6000 48GB.
- Cabe en GPU de consumo: si, en cuantizaciones de 4 bits (por ejemplo, RTX 4090 24GB), siempre que se disponga de una conversion GGUF o AWQ/GPTQ, que el repositorio no proporciona.
- Opciones de despliegue: transformers (libreria declarada); vLLM, TGI, llama.cpp u Ollama no estan confirmados para este repositorio, y requeririan conversion previa de los pesos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-uncensored (este modelo) | 27,78 B | no disponible | image-text-to-text | MIT | Hugging Face, 0 descargas |
| Qwen/Qwen3.8-27B (modelo base) | no disponible en la informacion | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de ~27B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada; la comparativa con alternativas de tamano similar queda como no disponible.

## Limitaciones y advertencias

- La model card no documenta el proceso de entrenamiento, el dataset ni los hiperparametros, lo que impide evaluar la calidad y reproducibilidad del ajuste fino.
- Al ser una variante "uncensored", es probable que el modelo genere contenido que el modelo base rechazaria; esto implica riesgos de contenido inapropiado, danino o ilegal y exige filtros y revision humana en cualquier despliegue.
- Riesgo de alucinacion: no cuantificado; al no haber benchmarks ni evaluaciones publicadas, no puede estimarse su fiabilidad factua.
- Sesgos conocidos: no documentados; al derivar de un modelo base entrenado principalmente en ingles, es probable que herede sesgos linguisticos y culturales de ese corpus.
- Limitaciones de idioma: solo se declara ingles (en); el rendimiento en castellano u otros idiomas no esta verificado.
- Limitaciones de contexto: la longitud de contexto no esta disponible, por lo que no puede garantizarse el manejo de conversaciones o documentos largos.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; ademas, el uso comercial de una variante "uncensored" puede entrar en conflicto con politicas de plataformas y con normativa local sobre contenido.
- Repositorio sin traccion (0 descargas, 0 likes) y sin issues ni discusiones documentadas; no hay evidencia de validacion por parte de la comunidad.
- No se proporcionan pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de consumo sin conversion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MD-Mushfiqur123/Qwen3.8-27B-uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
