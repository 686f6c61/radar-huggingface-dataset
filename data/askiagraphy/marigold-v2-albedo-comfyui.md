# askiagraphy/marigold-v2-albedo-comfyui

## Resumen

marigold-v2-albedo-comfyui es un repositorio publicado en Hugging Face por el usuario askiagraphy que, por su denominación, empaqueta el modelo Marigold v2 en su variante de estimación de albedo (reflectancia difusa de la superficie) adaptado para su uso dentro de ComfyUI. Marigold es una familia de modelos de difusión desarrollada originalmente en el ámbito académico (ETH Zúrich y colaboradores) para tareas de percepción geométrica y de materiales a partir de una sola imagen, y su variante de albedo se emplea en pipelines de descomposición intrínseca de imágenes (intrinsic image decomposition) junto con mapas de sombreado.

El repositorio no incluye model card descriptiva: la única información disponible es la licencia Apache 2.0 declarada en los metadatos. No se especifican arquitectura, número de parámetros, longitud de contexto, idiomas ni formato de pesos en la información proporcionada, por lo que los apartados técnicos de esta ficha se limitan a lo verificable y marcan el resto como no disponible.

Su relevancia potencial radica en facilitar el uso de un modelo de difusión para albedo dentro del ecosistema de nodos de ComfyUI, lo que permitiría integrar descomposición intrínseca en flujos de trabajo de generación y edición de imagen sin salir del grafo. No obstante, al tratarse de un repositorio con cero descargas y cero likes en el momento de la consulta, no hay evidencia pública de validación por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (por denominación, modelo de difusión para albedo, linaje Marigold) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura en la model card del repositorio. Por el nombre del identificador (`marigold-v2-albedo-comfyui`) cabe inferir que se trata de una adaptación del modelo Marigold v2 para la predicción de albedo, probablemente derivada del trabajo original de Marigold (modelo de difusión basado en Stable Diffusion reentrenado para estimación de profundidad y posteriormente extendido a otras modalidades como normales y albedo). Esta inferencia no está confirmada por el autor en la información disponible.

Tampoco hay datos sobre el conjunto de entrenamiento, número de tokens o imágenes, composición del dataset, ni sobre si se aplicaron técnicas de ajuste fino supervisado, RLHF o DPO. Se desconoce igualmente si el repositorio contiene únicamente pesos, un nodo personalizado para ComfyUI o ambos.

## Capacidades

- Por denominación, estimación de albedo (reflectancia difusa) a partir de una imagen de entrada.
- Integración prevista con ComfyUI como nodo o checkpoint utilizable en grafos de generación y edición de imagen.
- Posible uso conjunto con mapas de sombreado para descomposición intrínseca (no confirmado en la información disponible).
- Capacidades de generación de texto, código, matemáticas, tool calling, agentes o multilingüismo: no disponibles; el modelo, por su naturaleza, no está orientado a tareas de lenguaje.

## Casos de uso

- Descomposición intrínseca en pipelines de relighting: usar el mapa de albedo para separar reflectancia de iluminación y recolorear o reiluminar una imagen sin alterar los materiales percibidos.
- Preprocesado para texturizado 3D: extraer albedo de fotografías de referencia para alimentar herramientas de materiales PBR en flujos de trabajo de artistas técnicos.
- Retoque fotográfico avanzado: aislar el color base de la piel o de tejidos para corregir dominantes de color sin afectar al sombreado.
- Integración en ComfyUI para edición por capas: combinar el nodo de albedo con otros nodos de profundidad o normales dentro de un mismo grafo para generar máscaras y composiciones coherentes.
- Investigación en visión por computador: evaluar modelos de difusión aplicados a descomposición intrínseca como línea base en experimentos académicos.
- Generación de datasets sintéticos de materiales: producir pares imagen/albedo para entrenar otros modelos de segmentación o materiales, siempre que la licencia Apache 2.0 lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamaño real del checkpoint, que no se especifica.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI (por denominación del repositorio); otros entornos (vLLM, llama.cpp, Ollama, TGI) no aplican a un modelo de difusión de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| marigold-v2-albedo-comfyui | Difusión para albedo (inferido) | no disponible | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| Marigold (original) | Difusión para profundidad/normales | no disponible en la información | no disponible | no disponible | Repositorio académico |
| Modelos de descomposición intrínseca clásicos (p. ej. IntrinsicNet) | CNN supervisada | no disponible | no disponible | no disponible | Publicaciones académicas |

No se dispone de datos suficientes para una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card está vacía: no hay documentación sobre el proceso de entrenamiento, los datos utilizados ni las métricas de calidad.
- Cero descargas y cero likes en el momento de la consulta: sin validación pública por parte de la comunidad.
- Al ser un modelo de difusión para albedo, puede producir estimaciones inconsistentes en escenas con iluminación muy coloreada, materiales especulares o imágenes de baja exposición.
- Riesgo de alucinación visual: los modelos de difusión pueden generar texturas o colores plausibles pero incorrectos en regiones ambiguas.
- No se especifican sesgos demográficos ni de dominio; se desconoce el sesgo del dataset original de Marigold.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la procedencia de los pesos base (Marigold) y de cualquier componente derivado de Stable Diffusion, cuyas licencias pueden imponer restricciones adicionales.
- No apto para tareas de lenguaje, razonamiento o agentes.
- Antes de usarlo en producción, se recomienda validar el checkpoint con un conjunto propio de imágenes y comparar contra el Marigold original.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/askiagraphy/marigold-v2-albedo-comfyui
- Proyecto Marigold (referencia del linaje, no verificado en la búsqueda): no disponible en la información proporcionada.
- Paper de Marigold: no disponible en la información proporcionada.
- Repositorio de ComfyUI: no disponible en la información proporcionada.
