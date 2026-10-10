# Jinstudio/void-model

## Resumen

VOID (Video Object and Interaction Deletion) es un modelo de difusion para *inpainting* de video que elimina objetos de una escena y, ademas, borra las interacciones fisicas que dichos objetos inducen sobre el entorno. A diferencia de los metodos clasicos de eliminacion de objetos, no se limita a limpiar efectos secundarios como sombras o reflejos, sino que tambien elimina consecuencias fisicas: por ejemplo, si se borra a una persona que sostenia un objeto, VOID hace caer dicho objeto de forma coherente. El modelo esta desarrollado por un equipo de investigadores vinculado a Netflix, con autores como Saman Motamed, William Harvey, Benjamin Klein, Luc Van Gool, Zhuoning Yuan y Ta-Ying Cheng.

Tecnicamente, VOID se construye sobre CogVideoX-Fun-V1.5-5b-InP, un transformer de difusion 3D de 5.000 millones de parametros, y se afina especificamente para inpainting de video mediante una condicion de *quadmask* que codifica cuatro regiones (objeto a eliminar, solapamiento, regiones afectadas y fondo a preservar). El modelo trabaja a una resolucion por defecto de 384x672, admite hasta 197 fotogramas y utiliza un scheduler DDIM con precision BF16 y cuantizacion FP8 para reducir el consumo de memoria.

Su relevancia actual radica en que aborda un problema poco tratado en edicion de video: la coherencia fisica y temporal de la escena tras eliminar un objeto. Se distribuye con licencia Apache 2.0, lo que facilita su uso comercial, aunque requiere hardware de gama alta (40 GB o mas de VRAM) para su ejecucion. El repositorio de HuggingFace figura bajo el autor Jinstudio, si bien la model card y el repositorio de codigo apuntan a la organizacion netflix.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion 3D (CogVideoX 3D Transformer) |
| Parametros totales | 5.000 millones (5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (admite hasta 197 fotogramas de video) |
| Tipos de cuantizacion | BF16 y FP8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Otros parametros tecnicos relevantes:

| Parametro | Valor |
|---|---|
| Modelo base | CogVideoX-Fun-V1.5-5b-InP (alibaba-pai) |
| Resolucion por defecto | 384x672 |
| Maximo de fotogramas | 197 |
| Scheduler | DDIM |
| Tarea (pipeline) | video-to-video |
| Tamano del repositorio | 22,3 GB |
| Checkpoints | void_pass1.safetensors (base), void_pass2.safetensors (refinamiento, opcional) |

## Arquitectura y entrenamiento

VOID se apoya en CogVideoX-Fun-V1.5-5b-InP, un transformer de difusion 3D de 5B parametros orientado a generacion y edicion de video. El modelo recibe como entrada un video original, un *quadmask* (mascara de cuatro valores) y un *prompt* de texto que describe la escena tras la eliminacion. La quadmask codifica cuatro regiones: 0 para el objeto a eliminar, 63 para las zonas de solapamiento, 127 para las regiones afectadas (objetos que caen o se desplazan al eliminar el objeto principal) y 255 para el fondo que debe conservarse. Esta condicion permite al modelo razonar sobre las interacciones fisicas inducidas y no solo sobre efectos visuales directos.

El proceso de inferencia se divide en dos pasadas. La primera, basada en void_pass1.safetensors, es suficiente para la mayoria de videos. La segunda, void_pass2.safetensors, aplica un refinamiento opcional mediante inicializacion latente con *warped-noise* a partir de flujo optico, mejorando la consistencia temporal en clips largos.

El entrenamiento se realizo sobre pares de videos contrafactuales generados sinteticamente a partir de dos fuentes: HUMOTO, que renderiza interacciones persona-objeto en Blender con simulacion fisica, y Kubric, que cubre interacciones entre objetos usando Google Scanned Objects. El entrenamiento se ejecuto en 8 GPU A100 de 80 GB con DeepSpeed ZeRO en etapa 2. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Eliminacion de objetos en video con reconstruccion coherente del fondo, manteniendo la consistencia temporal entre fotogramas.
- Modelado de interacciones fisicas: elimina no solo el objeto, sino las consecuencias fisicas que provoca (caida de objetos sostenidos, desplazamiento de elementos, etc.).
- Eliminacion de efectos secundarios visuales como sombras y reflejos.
- Edicion guiada por *prompt* de texto que describe la escena resultante.
- Condicionamiento mediante *quadmask* de cuatro valores para delimitar regiones de eliminacion, solapamiento, afeccion y preservacion.
- Refinamiento temporal opcional mediante una segunda pasada con inicializacion basada en flujo optico (*warped noise*).
- Generacion de mascaras cuadruples a partir de videos en bruto mediante el pipeline VLM-MASK-REASONER, que combina SAM2 y Gemini.
- Procesamiento de video a resolucion 384x672 y hasta 197 fotogramas por clip.
- No se documentan capacidades de *tool calling*, agentes, audio ni vision mas alla de la propia entrada de video.

## Casos de uso

- Postproduccion audiovisual: eliminar actores, objetos o elementos de atrezzo de una escena rodada sin necesidad de regrabar, manteniendo la coherencia del movimiento y de la iluminacion.
- Limpieza de material de archivo: retirar marcas de agua, logotipos o elementos no deseados de grabaciones historicas antes de su reemision o restauracion.
- Edicion de videos de demostracion de producto: borrar objetos que obstruyen la vista del producto principal y reconstruir la escena de forma fisicamente plausible.
- Generacion de datos sinteticos para entrenamiento: crear pares de videos contrafactuales (con y sin objeto) para entrenar otros modelos de vision por computador.
- Publicidad y marketing: retirar elementos de una localizacion grabada para adaptar el anuncio a distintos mercados sin volver a rodar.
- Realidad aumentada y efectos visuales: preparar *plate shots* limpios sobre los que posteriormente se insertan elementos CGI, garantizando que las zonas eliminadas sean coherentes en el tiempo.
- Investigacion en edicion de video: servir como referencia o base para experimentos de inpainting con razonamiento fisico, dado que el codigo de generacion de datos y entrenamiento es publico.
- Cumplimiento de derechos de imagen: eliminar personas identificables de videos corporativos o de vigilancia respetando la coherencia de la escena.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: la model card indica que se requiere una GPU con 40 GB o mas de VRAM (por ejemplo, A100). El uso de FP8 permite reducir el consumo de memoria, aunque no se especifica la cifra exacta en FP8.
- GPU recomendadas: A100 de 80 GB (usada tanto para entrenamiento como para inferencia segun la model card). Tambien valida en A100 de 40 GB segun el requisito minimo declarado.
- GPU de consumo: no cabe en GPU de consumo convencionales (RTX 4090, 3090, etc.) debido al requisito de 40 GB o mas de VRAM. El repositorio pesa 22,3 GB, por lo que los checkpoints completos tampoco caben comodamente en VRAM reducida junto con las activaciones.
- Rendimiento y cuantizacion: se emplea BF16 con cuantizacion FP8 para eficiencia de memoria. No se detallan valores de latencia ni throughput.
- Opciones de despliegue: scripts de inferencia en Python del repositorio (predict_v2v.py), cuaderno de Colab del proyecto y el *space* de demostracion en HuggingFace. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Proceso de inferencia: dos pasadas (pass 1 base y pass 2 opcional de refinamiento); la pasada 2 incrementa el coste computacional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / frames | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VOID (Jinstudio/void-model) | 5B | hasta 197 fotogramas, 384x672 | Inpainting de video con interacciones fisicas | Apache 2.0 | HuggingFace, GitHub, demo |
| CogVideoX-Fun-V1.5-5b-InP | 5B | no disponible en la informacion | Inpainting de video generico | no disponible en la informacion | HuggingFace (alibaba-pai) |
| Otros modelos de inpainting de video | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa con alternativas especificas de inpainting de video no puede completarse con la informacion proporcionada. La referencia mas cercana es el modelo base CogVideoX-Fun-V1.5-5b-InP, del que VOID hereda arquitectura y tamano, y sobre el que anade el condicionamiento por quadmask y el afinado para razonamiento de interacciones fisicas.

## Limitaciones y advertencias

- Requisito de hardware elevado: necesita 40 GB o mas de VRAM, lo que excluye su uso en GPU de consumo y encarece el despliegue.
- Resolucion de trabajo limitada: 384x672 por defecto, inferior a la de video de alta definicion, por lo que puede requerir post-procesado o reescalado.
- Limite de fotogramas: 197 fotogramas por clip, lo que restringe la longitud de los videos procesables en una sola pasada.
- Dependencia de la calidad de la quadmask: el resultado depende de que la mascara generada (por ejemplo, mediante el pipeline SAM2 + Gemini) delimite correctamente las regiones de eliminacion, solapamiento y afeccion.
- Riesgo de alucinacion en la reconstruccion del fondo: al generar contenido inexistente en las zonas eliminadas, pueden aparecer artefactos o incoherencias temporales, especialmente en clips largos sin la segunda pasada.
- Idiomas soportados: no se especifica el soporte multilingue para los *prompts* de texto; no hay datos disponibles sobre su comportamiento en castellano.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible.
- Licencia: Apache 2.0 permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y se atribuya correctamente. Conviene verificar las condiciones del modelo base CogVideoX-Fun-V1.5-5b-InP, cuyos terminos no se detallan en la informacion proporcionada.
- Ambiguedad de autoria: el repositorio figura bajo el usuario Jinstudio en HuggingFace, mientras que la model card y el codigo apuntan a la organizacion netflix. Se recomienda confirmar la fuente oficial antes de citarlo o desplegarlo en produccion.
- Sin datos de benchmarks publicos en la informacion disponible, lo que dificulta estimar su rendimiento relativo frente a alternativas.

## Enlaces

- HuggingFace: https://huggingface.co/Jinstudio/void-model
- Pagina del proyecto: https://void-model.github.io/
- Paper (arXiv): https://arxiv.org/abs/2604.02296
- Paper (PDF): https://arxiv.org/pdf/2604.02296
- Repositorio GitHub: https://github.com/netflix/void-model
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/sam-motamed/VOID
- Modelo base CogVideoX-Fun-V1.5-5b-InP: https://huggingface.co/alibaba-pai/CogVideoX-Fun-V1.5-5b-InP
- Cuaderno de Colab: https://colab.research.google.com/github/netflix/void-model/blob/main/notebook.ipynb
- Instrucciones de entrenamiento: https://github.com/netflix/void-model#%EF%B8%8F-training
