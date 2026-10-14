# immich-testing/ViT-SO400M-14-SigLIP-384__webli

## Resumen

ViT-SO400M-14-SigLIP-384 es un modelo de vision-lenguaje de tipo contraste (imagen-texto) basado en la arquitectura SigLIP (Sigmoid Loss for Language-Image Pre-training), desarrollada originalmente por Google Research. Combina un codificador de vision ViT con diseno "shape-optimized" (SO400M), parche de 14x14 y resolucion de entrada de 384x384, con una torre de texto, y fue preentrenado sobre el dataset WebLI. El identificador del repositorio incluye el sufijo `__webli`, que referencia ese corpus de entrenamiento.

El repositorio concreto analizado pertenece a la organizacion `immich-testing`, lo que sugiere que se trata de una copia de prueba o reempaquetado del checkpoint original de SigLIP para su uso dentro del ecosistema de Immich, la solucion de gestion de fotos y videos autoalojada. Immich emplea modelos CLIP/SigLIP para su funcion de busqueda semantica ("smart search") sobre bibliotecas de imagenes, de modo que este modelo encaja como motor de representacion conjunta imagen-texto.

La relevancia de este tipo de modelo radica en su capacidad de generar embeddings alineados de imagen y texto sin necesidad de entrenamiento especifico de tarea, habilitando busqueda semantica, clasificacion zero-shot y recuperacion cruzada. La ficha se elabora con informacion limitada: el repositorio no declara licencia, idiomas ni pipeline, y la busqueda web solo aporta contexto sobre Immich, no sobre el checkpoint en si.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) shape-optimized con SigLIP (contraste imagen-texto con perdida sigmoide); parche 14x14, resolucion 384x384 |
| Parametros totales | no disponible (la denominacion SO400M implica aproximadamente 400 millones en la torre de vision) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el componente de texto suele limitarse a ~64 tokens en la familia SigLIP; dato no confirmado para este repositorio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la familia SigLIP original esta orientada principalmente al ingles) |
| Licencia | no disponible en este repositorio (la publicacion original de Google se distribuye bajo Apache 2.0) |
| Formato de pesos | no disponible (tamano del repositorio: 10.5 GB; probablemente safetensors o binarios PyTorch, sin confirmar) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SigLIP: un codificador de imagenes ViT y un codificador de texto transformer que se entrenan de forma contrastiva. La innovacion clave de SigLIP frente a CLIP es la sustitucion de la perdida softmax sobre la matriz de similitudes por una perdida sigmoide aplicada par a par, lo que elimina la necesidad de normalizacion global entre todos los pares de un lote y permite entrenar con lotes mas grandes y de forma mas eficiente. El designador SO400M indica una variante "shape-optimized" del ViT, con proporciones ajustadas de profundidad, anchura y numero de cabezas para un presupuesto de parametros de aproximadamente 400 millones.

El checkpoint se preentreno sobre WebLI (Web Language Image), un corpus a gran escala de pares imagen-texto, y trabaja a una resolucion de 384x384 con parches de 14x14. No se dispone en la informacion proporcionada de detalles sobre el numero exacto de tokens de imagen vistos, la composicion del dataset, ni sobre si se aplicaron etapas posteriores de ajuste (RLHF, DPO o similares). Tampoco se confirman innovaciones adicionales como decodificacion especulativa o atencion lineal para esta variante concreta.

Conviene subrayar que el reempaquetado bajo `immich-testing` puede implicar conversiones de formato, recortes de componentes o cambios en la configuracion respecto al checkpoint original, aspectos que no quedan documentados en la ficha de HuggingFace.

## Capacidades

- Representacion conjunta imagen-texto: genera embeddings alineados para imagenes y consultas de texto, base de la busqueda semantica.
- Clasificacion zero-shot de imagenes mediante prompts textuales, sin reentrenamiento.
- Recuperacion imagen-a-texto y texto-a-imagen (retrieval) por similitud de embeddings.
- Etiquetado y clustering de imagenes a partir de similitud vectorial.
- Deteccion de similitud y deduplicacion visual dentro de grandes bibliotecas.
- Codificacion de imagenes a 384x384 con parches de 14x14.
- No se ha confirmado soporte de tool calling, function calling, comportamiento agentico, modo "thinking", vision adicional, audio ni capacidades multilingues mas alla de lo implicito en la familia SigLIP.

## Casos de uso

- Busqueda semantica en bibliotecas de fotos: integrar el modelo en Immich para permitir consultas en lenguaje natural ("perro en la playa") sobre miles de imagenes, empleando los embeddings de imagen y texto alineados.
- Clasificacion automatica de activos visuales: asignar categorias o etiquetas a imagenes sin entrenamiento especifico, aprovechando la clasificacion zero-shot mediante prompts.
- Deduplicacion y agrupacion visual: calcular similitud coseno entre embeddings para detectar imagenes duplicadas o agrupar fotos similares en un servidor autoalojado.
- Moderacion de contenido: filtrar imagenes potencialmente inapropiadas comparando su embedding con prompts de referencia de categorias no deseadas.
- Recuperacion multimodal en aplicaciones de gestion documental: indexar capturas, escaneos o fotografias y permitir busqueda por descripcion textual.
- Generacion de metadatos para catalogos: producir etiquetas descriptivas para grandes volumenes de imagenes antes de su publicacion o archivado.
- Base para pipelines de RAG visual: usar los embeddings como indice vectorial para que un sistema de generacion aumentada recupere imagenes relevantes ante una consulta.
- Preprocesamiento en herramientas de edicion o DAM (Digital Asset Management): ordenar y filtrar recursos graficos por contenido semantico en lugar de por nombre de fichero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este repositorio concreto. La ficha de HuggingFace no incluye metricas y la busqueda web no aporta evaluaciones del checkpoint. No se aportan cifras para evitar datos no verificados.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1.7 GB en fp32 y aproximadamente 0.9 GB en fp16/bf16 para una torre de ~400 M de parametros (estimacion orientativa; el dato exacto de este repositorio no esta disponible).
- GPU recomendadas: cualquier GPU con al menos ~4 GB de VRAM para fp16; modelos como NVIDIA RTX 3060, RTX 4090, A100 o H100 son mas que suficientes para este tamano.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en GPU de consumo modernas, incluidas las de gama media.
- Opciones de despliegue: PyTorch, HuggingFace Transformers, OpenCLIP, exportacion a ONNX, y el propio pipeline de machine learning de Immich; no se confirman integraciones con vLLM, llama.cpp ni Ollama, orientadas a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros (vision) | Resolucion / parche | Contexto texto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ViT-SO400M-14-SigLIP-384 (este) | ~400 M (SO400M) | 384 / 14 | no disponible | no disponible en este repo | HF (immich-testing) |
| SigLIP ViT-L/16 | ~300 M | 224-384 / 16 | ~64 tokens | Apache 2.0 (original) | HF (google/siglip-*) |
| SigLIP ViT-B/16 | ~86 M | 224 / 16 | ~64 tokens | Apache 2.0 (original) | HF (google/siglip-*) |
| CLIP ViT-L/14 | ~300 M | 224 / 14 | ~77 tokens | MIT (original OpenAI) | HF / OpenCLIP |

Los datos de licencia y contexto de las alternativas corresponden a sus publicaciones originales y no han sido verificados en la informacion proporcionada; se incluyen como referencia de categoria. La comparacion cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias

- La licencia no esta declarada en este repositorio, lo que impide confirmar si el uso comercial esta permitido; verificar la licencia del checkpoint original antes de desplegarlo en produccion.
- Al ser un reempaquetado bajo una organizacion de pruebas (`immich-testing`), puede diferir del checkpoint original en formato, componentes o configuracion.
- Riesgo de alucinacion semantica: la similitud de embeddings puede devolver coincidencias incorrectas en consultas ambiguas o imagenes poco representadas.
- Sesgos potenciales derivados del dataset WebLI (predominantemente web e ingles), que pueden afectar a la representacion de determinados grupos, culturas o idiomas.
- Capacidad multilingue no confirmada: la familia SigLIP original esta orientada al ingles, por lo que las consultas en otros idiomas pueden degradarse.
- No es un modelo generativo de texto ni de imagen; no produce descripciones libres ni responde a instrucciones complejas por si solo.
- Resolucion fija de 384x384 con parches de 14x14: imagenes de muy alta resolucion requieren reescalado, con posible perdida de detalle fino.
- Sin datos de benchmarks publicados para este checkpoint, no se puede garantizar un nivel de rendimiento concreto en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/immich-testing/ViT-SO400M-14-SigLIP-384__webli
- Immich (sitio oficial): https://immich.app/
- Immich (repositorio GitHub): https://github.com/immich-app/immich
- Immich (documentacion): https://docs.immich.app/
- Paper de SigLIP (Sigmoid Loss for Language Image Pre-Training): https://arxiv.org/abs/2303.15343
- Dataset WebLI (referencia en el paper PaLI): https://arxiv.org/abs/2209.06794
