# lilylilith/FLUX.3_Klein_FontBox

## Resumen

FontBox es un adaptador LoRA (prueba de concepto) para el modelo de generación y edición de imágenes FLUX.3 Image Klein de Black Forest Labs, publicado en Hugging Face por la usuaria lilylilith. Su objetivo es resolver una carencia concreta de los modelos de difusión actuales: aunque muchos modelos (NanoBanana, GPT Sunburst, MOSS-Image, Qwen-Image-2.1, Ideogram 4.0) ya renderizan texto legible, ninguno permite manipular ese texto de forma precisa (alineación, posición exacta, tamaño, escala vertical o estilo faux bold/italic). FontBox aborda precisamente ese hueco.

El LoRA se apoya en dos capacidades específicas de FLUX.3 Klein: la edición mediante bounding boxes (bbox) y el prompting estructurado en formato .json. Gracias a ello, permite editar texto en imágenes existentes especificando alineación (izquierda, centro o derecha), posición y tamaño exactos, manteniendo la tipografía, el interletrado, los colores y el estilo original, e incluso respetando texto con perspectiva o distorsión.

El proyecto incluye un nodo personalizado para ComfyUI (ComfyUI_FontBox) que simplifica la creación de los prompts .json y las coordenadas de bbox mediante una interfaz gráfica con guías y snapping. Es un recurso de nicho pero relevante para desarrolladores que trabajan en edición de imágenes con control tipográfico fino, un área aún poco explorada en el ecosistema open source. El repositorio pesa unos 0,1 GB (tamaño típico de un LoRA) y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre FLUX.3 Image Klein (modelo de difusión) |
| Parametros totales | no disponible (repo de 0,1 GB) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen; prompts en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (compatible con diffusers) |

## Arquitectura y entrenamiento

FontBox no es un modelo independiente, sino un adaptador LoRA entrenado sobre black-forest-labs/flux-3-image-klein, un modelo de difusión image-to-image. La elección del modelo base es deliberada: según la autora, FLUX.3 Klein es el único modelo local que soporta edición mediante bounding boxes y prompting .json, algo imprescindible para indicar de forma estructurada qué región de la imagen debe editarse y con qué propiedades tipográficas (alineación, posición, tamaño, escala vertical).

No se han publicado detalles sobre el dataset de entrenamiento, el número de pasos, el rango del LoRA ni el método de entrenamiento en la información disponible. La innovación principal del proyecto no es arquitecturica sino de interfaz: combinar el LoRA con plantillas de prompt .json (que definen objetos, bboxes de origen y destino, y descripciones) y un nodo de ComfyUI que genera esas plantillas automáticamente.

## Capacidades

- Edición de texto en imágenes existentes (image-to-image), cambiando el contenido del texto manteniendo la tipografía, el interletrado de caracteres, los colores y el estilo original.
- Especificación de alineación del texto: izquierda, centro o derecha (siempre debe elegirse una).
- Control de la posición exacta del texto mediante bounding boxes.
- Control del tamaño exacto del texto.
- Aplicación de faux bold y faux italic sin alterar la familia tipográfica.
- Ajuste de la escala vertical del texto.
- Edición de texto con perspectiva o distorsión (por ejemplo, texto partido en varias regiones de la imagen).
- Preservación del resto de la imagen (fondo, ilustraciones y otros textos) durante la edición.
- Integración con ComfyUI mediante un nodo personalizado con plantillas de prompt preconfiguradas, guías y snapping.
- Soporte de múltiples ediciones simultáneas en una misma imagen (varios objetos con bboxes independientes en un mismo prompt .json).

## Casos de uso

- Edición de pósteres y carteles: modificar el eslogan de un cartel generado por IA o escaneado conservando la maquetación original, indicando alineación y posición exactas mediante bbox.
- Localización de material gráfico: sustituir texto en inglés por texto en otro idioma en ilustraciones, manteniendo la fuente y los colores, útil para equipos de marketing que adaptan creatividades.
- Producción de memes y contenido para redes sociales: cambiar frases sobre plantillas visuales con control preciso de posición y tamaño, algo que los editores genéricos de texto no logran con estilo tipográfico coherente.
- Ajuste tipográfico fino en diseño asistido por IA: aplicar faux bold o faux italic, o escalar verticalmente un titular, sin regenerar toda la imagen.
- Edición de texto en perspectiva: modificar letreros en fotos o ilustraciones donde el texto está distorsionado (por ejemplo, un cartel en una fachada), dividido en varias regiones con bboxes independientes.
- Prototipado rápido de variantes de diseño: generar varias versiones de un mismo cartel cambiando solo el texto o su alineación mediante el nodo de ComfyUI, sin retocar a mano en un editor.
- Automatización de pipelines de imagen: al basarse en prompts .json estructurados, las ediciones pueden generarse programáticamente (por ejemplo, inserción dinámica de precios o fechas en plantillas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un LoRA de edición de imágenes, no aplica el tipo de benchmarks habituales (MMLU, HumanEval, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia, el LoRA en sí pesa unos 0,1 GB; el consumo real dependerá del modelo base FLUX.3 Image Klein, que típicamente requiere una GPU con 16-24 GB de VRAM en precisión completa (dato del modelo base, no verificado en la documentación del LoRA).
- GPU recomendadas: no disponible. Dado el modelo base, una RTX 4090 o equivalente con 24 GB de VRAM es un punto de partida razonable.
- Cabe en consumer GPU: no disponible; depende de los requisitos de FLUX.3 Image Klein y de las cuantizaciones disponibles para este modelo.
- Opciones de despliegue: ComfyUI (vía el nodo personalizado ComfyUI_FontBox) y la librería diffusers de Hugging Face.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Control de texto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX.3 Klein FontBox | LoRA de edición tipográfica | FLUX.3 Image Klein | Alineación, posición, tamaño, escala vertical, faux bold/italic vía bbox y .json | Apache 2.0 | Hugging Face, ComfyUI (nodo propio) |
| Qwen-Image-2.1 | Modelo de difusión completo | propio | Buen renderizado de texto y edición, pero sin control fino de alineación/posición | no disponible | Open source |
| MOSS-Image | Modelo de difusión completo | propio | Buen renderizado de texto, sin control fino de propiedades tipográficas | no disponible | Open source |

Nota: según la propia autora, modelos como Qwen-Image-2.1 o MOSS-Image superan a FLUX.3 Klein en calidad de renderizado de texto, pero ninguno ofrece el control estructurado (bbox y .json) que hace posible FontBox.

## Limitaciones y advertencias

- Es una prueba de concepto (proof of concept): la calidad y robustez pueden no ser adecuadas para producción sin validación.
- Requiere obligatoriamente prompting .json y coordenadas de bbox; no funciona con prompts de texto libre simples.
- Depende del modelo base FLUX.3 Image Klein, que la propia autora califica de no especialmente bueno en calidad general comparado con alternativas como MOSS-Image o Qwen-Image-2.1.
- La alineación del texto (izquierda, centro o derecha) es un parámetro obligatorio en cada edición.
- No se ha documentado el dataset de entrenamiento, por lo que pueden existir sesgos hacia los tipos de letra, idiomas y estilos presentes en ese dataset (no disponible).
- Como todo modelo de difusión, puede introducir artefactos o alucinaciones en el texto editado (caracteres incorrectos, alteraciones no solicitadas en el resto de la imagen).
- El soporte de idiomas del texto editable no está documentado; conviene verificar el comportamiento con alfabetos no latinos.
- Licencia Apache 2.0: sin restricciones destacables para uso comercial, pero hay que respetar los términos de la licencia del modelo base FLUX.3 Image Klein, que puede ser más restrictiva.
- Descargas muy bajas (15) y un solo like en el momento de la ficha: proyecto muy reciente y con poco uso comunitario verificado.

## Enlaces

- Hugging Face: https://huggingface.co/lilylilith/FLUX.3_Klein_FontBox
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Nodo de ComfyUI y workflows (GitHub): https://github.com/sillylilithhh/ComfyUI_FontBox
- Perfil de la autora en Civitai: https://civitai.com/user/lilylilith
- Ko-fi de la autora (apoyo al proyecto): https://ko-fi.com/lilllithhhhh
