# mradermacher/BigBang-Aquila-35B-Merged-i1-GGUF

## Resumen

BigBang-Aquila-35B-Merged-i1-GGUF es una cuantización GGUF con matriz de importancia (imatrix) del modelo base BigBang-Aquila-35B-Merged, creada por mradermacher, un autor reconocido por sus conversiones de modelos a formato GGUF optimizadas para inferencia local. El modelo base es un merge realizado con mergekit que combina varios modelos bajo una arquitectura de mezcla de expertos (MoE) etiquetada como `qwen3_5_moe`, lo que sugiere una base similar a la familia Qwen3.5. Además, el pipeline declarado es `image-text-to-text`, por lo que el modelo original incorpora capacidades de visión además de texto.

Esta versión concreta proporciona únicamente los pesos del modelo de lenguaje en formato GGUF, con varios niveles de cuantización que van desde Q2_K hasta Q4_K_M, todos ellos calibrados con imatrix para mejorar la calidad de las cuantizaciones de baja precisión. El repositorio no incluye los archivos de proyección de visión (mmproj), que se encuentran en el repositorio estático asociado. Su relevancia radica en permitir ejecutar un modelo de aproximadamente 35 000 millones de parámetros en hardware de consumo, con requisitos de VRAM que oscilan entre 13 y 22 GB según la cuantización elegida, lo que lo hace accesible para desarrolladores e investigadores que necesitan un modelo multimodal local con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen3.5 (segun tags `qwen3_5_moe`) |
| Parametros totales | 34 660 610 688 (34,66 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M, i1-Q3_K_M, i1-Q4_K_S, i1-Q4_K_M (todos con imatrix) |
| Idiomas soportados | ingles (etiqueta `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base usa safetensors) |

## Arquitectura y entrenamiento

El modelo base BigBang-Aquila-35B-Merged es un merge creado con mergekit, una herramienta que combina multiples modelos preentrenados mediante tecnicas como interpolacion de pesos o fusion de capas. La etiqueta `qwen3_5_moe` indica que la arquitectura resultante es una mezcla de expertos, probablemente heredada de los modelos Qwen3.5, aunque no se especifican el numero de expertos ni los detalles de la capa de vision. Al ser un merge, no se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO; estos datos no se han publicado.

La version GGUF aqui descrita es una cuantizacion posterior realizada por mradermacher, que aplico el proceso de imatrix (importance matrix) para calibrar las cuantizaciones de baja precision y minimizar la perdida de calidad. El repositorio incluye un archivo imatrix de 0,3 GB que permite a los usuarios generar sus propias cuantizaciones personalizadas. No se incluyen los proyectores de vision (mmproj), que estan disponibles en el repositorio estatico del mismo autor.

## Capacidades

- Procesamiento de imagenes y texto: al ser un modelo `image-text-to-text`, el modelo base puede recibir imagenes como entrada y generar texto relacionado, aunque esta capacidad requiere los archivos mmproj que no estan en este repositorio.
- Generacion de texto conversacional: el modelo esta disenado para dialogos multi-turno, segun la etiqueta `conversational`.
- Soporte multilingue: limitado al ingles, segun la etiqueta de idioma.
- Inferencia local eficiente: gracias a las cuantizaciones GGUF, puede ejecutarse en hardware de consumo con diferentes balances entre tamaño y calidad.
- Compatibilidad con herramientas de inferencia: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio y otros motores que soporten este formato.
- No se ha confirmado soporte para tool calling, function calling ni modos de razonamiento especiales; esta informacion no esta disponible.

## Casos de uso

- Asistente de vision por voz para entornos sin conexion: un desarrollador puede integrar este modelo en una aplicacion de escritorio que reciba capturas de pantalla o fotos y genere descripciones o respuestas, aprovechando la cuantizacion Q4_K_M para ejecutarse en una GPU de 24 GB.
- Chatbot de soporte tecnico con contexto de imagenes: en un entorno empresarial, el modelo puede analizar diagramas o capturas de error enviados por usuarios y proporcionar explicaciones, siempre que se carguen los archivos mmproj desde el repositorio estatico.
- Prototipado rapido de aplicaciones multimodales: los investigadores pueden usar la cuantizacion i1-Q4_K_S (20 GB) para validar ideas de productos que combinen vision y lenguaje sin necesidad de un cluster de GPUs.
- Generacion de subtitulos o etiquetado de imagenes en lotes: con un script que procese imagenes y genere texto descriptivo, el modelo puede automatizar la catalogacion de archivos visuales en una biblioteca local.
- Educacion y experimentacion: estudiantes de IA pueden desplegar el modelo en una RTX 3090 o 4090 para estudiar el comportamiento de un MoE multimodal sin costes de API.
- Desarrollo de agentes conversacionales con memoria visual: combinando el modelo con un sistema de gestion de contexto, se puede construir un asistente que recuerde imagenes vistas en conversaciones anteriores, gracias a la ventana de contexto (aunque su longitud no esta publicada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para este modelo o su base. Se recomienda realizar pruebas propias con los quants proporcionados para evaluar su rendimiento en tareas especificas.

## Requisitos de hardware

- VRAM estimada para inferencia: segun el tamaño de cada cuantizacion, se necesita al menos esa cantidad de VRAM, mas un margen para el contexto y las activaciones. Por ejemplo, i1-Q4_K_M (21,3 GB) requiere una GPU con al menos 24 GB; i1-Q2_K (13,0 GB) puede caber en una GPU de 16 GB con contexto reducido.
- GPU recomendadas: RTX 3090, RTX 4090, A100 (40 GB o 80 GB) para las cuantizaciones mas grandes; para las mas pequeñas, una RTX 4070 Ti o similar con 12-16 GB podria ser suficiente con cuantizaciones Q2 o IQ3.
- Si cabe en GPU de consumo: si, las cuantizaciones Q2_K e IQ3_XXS (13-14 GB) pueden ejecutarse en GPUs de 16 GB como la RTX 4080 o RTX 4060 Ti, aunque con limitaciones de velocidad y contexto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier motor compatible con GGUF. Para servidores, se puede usar llama.cpp con backend CUDA o Metal.
- Latencia y throughput: no se han publicado datos especificos. Como referencia, un modelo MoE de 35B con cuantizacion Q4_K_M en una RTX 4090 suele generar entre 20 y 40 tokens por segundo, pero esto depende del numero de expertos activos y de la implementacion.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos de la misma categoria (MoE multimodal de ~35B). No se conocen modelos directamente comparables en el momento de redaccion, por lo que esta seccion queda pendiente de datos adicionales.

## Limitaciones y advertencias

- Al ser una cuantizacion, existe una degradacion inherente de la calidad respecto al modelo original en precision completa; las cuantizaciones mas agresivas (Q2_K, IQ3_XXS) pueden mostrar errores notables en tareas complejas.
- El modelo base es un merge, por lo que su comportamiento puede ser impredecible en algunos dominios y no ha sido sometido a las mismas evaluaciones de seguridad que los modelos entrenados desde cero.
- Solo soporta ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- La capacidad de vision no esta incluida en este repositorio; es necesario descargar los archivos mmproj del repositorio estatico para usar la funcionalidad de imagen.
- No se ha confirmado la longitud de contexto real; si es corta, las conversaciones largas o documentos extensos podrian truncarse.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no documentadas; se recomienda revisar la licencia del merge original.
- No hay informacion sobre sesgos o alucinaciones especificas; como cualquier modelo generativo, puede producir contenido falso o tendencioso.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/mradermacher/BigBang-Aquila-35B-Merged-i1-GGUF
- Repositorio estatico con quants sin imatrix y archivos mmproj: https://huggingface.co/mradermacher/BigBang-Aquila-35B-Merged-GGUF
- Modelo base (merge original): https://huggingface.co/osk-arr00/BigBang-Aquila-35B-Merged
- Pagina de ayuda del autor para solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
