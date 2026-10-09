# lvladikov/ComfyUI-Nodes-and-Workflows

## Resumen

lvladikov/ComfyUI-Nodes-and-Workflows no es un modelo de IA en sentido estricto, sino un repositorio de nodos personalizados y flujos de trabajo (workflows) para ComfyUI. Lo publica el usuario lvladikov bajo licencia Apache-2.0 y su contenido son aplicaciones y grafos para modelos de imagen, música y lenguaje, junto con LVNodes, el paquete de nodos personalizados que comparten todas ellas. El repositorio ocupa 0,0 GB y acumula 48 descargas y 1 like desde su creación el 3 de octubre de 2026 (última actualización el 8 de octubre de 2026).

El proyecto cubre, según su model card, Krea 2 (Turbo y Raw), Z-Image (Turbo y Base), MiniMax Music 3, Image2Text y LLM Chat, y añade una ruta de ejecución de modelos de lenguaje sobre Apple MLX dentro de ComfyUI. Cada componente se distribuye en tres ediciones: Comfy Cloud, ComfyUI local con PyTorch y Apple MLX. La propuesta técnica central es ejecutar los modelos de lenguaje desde los propios ficheros de ComfyUI (bf16 o cuantizaciones int8/int6/int4) mediante MLX, y permitir carpetas de modelos MLX de cualquier modelo que ejecuten mlx-vlm o mlx-lm, incluidos modelos de mezcla de expertos que la ruta nativa de ComfyUI no puede ejecutar en GPUs de Apple.

Su relevancia es de infraestructura más que de modelado: no aporta pesos ni entrenamiento nuevo, sino una capa de orquestación, nodos y optimizaciones de inferencia sobre hardware Apple. Para un desarrollador que evalúe modelos, esto significa que no hay parámetros propios, dataset ni benchmarks de modelo que analizar, y que cualquier cifra de rendimiento que aparezca en la ficha procede exclusivamente de lo declarado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de nodos y workflows para ComfyUI; no es una arquitectura de red neuronal) |
| Parametros totales | no disponible (el repositorio no contiene pesos; tamano del repo 0,0 GB) |
| Parametros activos | no disponible (no es un modelo MoE propio; menciona modelos MoE de terceros como Qwen3.6-35B-A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, int8, int6 e int4 (ficheros de ComfyUI); carpetas de modelos MLX de mlx-vlm y mlx-lm |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (no distribuye pesos; consume ficheros de ComfyUI y carpetas MLX) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado ni de una arquitectura de red. El repositorio agrupa dos artefactos: por un lado, flujos de trabajo (grafos) para ComfyUI organizados por aplicación (Krea 2, Z-Image, MiniMax Music 3, Image2Text, LLM Chat), cada uno con una vista de App, el grafo completo subyacente y notas que documentan cada entrada; por otro, LVNodes, el paquete de nodos personalizados compartido. Cada aplicación se publica en tres ediciones (Comfy Cloud, ComfyUI local con PyTorch y Apple MLX), con la restricción declarada de que Comfy Cloud solo ejecuta los paquetes de nodos que tiene instalados, por lo que LVNodes no está disponible allí.

La innovación técnica que se describe es de ejecución, no de entrenamiento: en un Mac, los nodos Load CLIP y Generate Text de ComfyUI pasan a ejecutarse sobre MLX sin modificar el workflow, incluidas las imágenes, partiendo de ficheros bf16 o de las cuantizaciones int8/int6/int4 de ComfyUI que, según el autor, ComfyUI reconstruiría capa por capa en cada token o no podría ejecutar en GPUs de Apple. Se añade un nodo Load LLM (MLX) para carpetas de modelos MLX de mlx-vlm o mlx-lm, con soporte de modelos de mezcla de expertos. El repositorio también integra LoRA de destilación por número de pasos: para Krea 2, LoRAs propias de destilación a 2 y 4 pasos; para Z-Image, Z-Image-Fun-Lora-Distill de alibaba-pai con variantes de 2, 4 y 8 pasos. No se documenta ningún proceso de entrenamiento, RLHF o DPO en la información disponible.

## Capacidades

- Generación de imágenes mediante Krea 2 (Turbo y Raw) y Z-Image (Turbo y Base), con resolución dependiente de un desplazamiento (shift) propio por modelo y selección de VAE (FLUX.1, UltraFlux o TAEF1).
- Generación de música completa con voces y letra, o instrumental, mediante MiniMax Music 3, con caption estructurado y letra cantada tal cual se escribe.
- Descripción de imágenes (Image2Text) con la plantilla Qwen3-VL de ComfyUI y un system prompt orientado a reutilizar la respuesta como prompt de text-to-image.
- Chat multi-turno dentro de ComfyUI (LLM Chat), con respuesta en streaming, Markdown y diagramas Mermaid, e imágenes pegadas que permanecen en la conversación para modelos de visión.
- Herramientas web opcionales en el chat (noticias, búsqueda, páginas, imágenes, vídeos y meteorología) con confirmación previa antes de salir a internet.
- Expansión de fragmentos de prompt mediante el patrón `*tm topic`.
- Ejecución de modelos de lenguaje sobre Apple MLX dentro de ComfyUI, incluidos modelos de mezcla de expertos.
- Conmutación de modelo Turbo/Raw o Turbo/Base en una misma app, con ajuste automático de pasos, CFG y LoRA de destilación.
- Progreso en vivo y previsualización de la imagen durante el muestreo en local, con decodificador aproximado en `models/vae_approx`.
- No se documentan capacidades de tool calling o function calling del propio repositorio, ni soporte de audio de entrada, ni idiomas soportados.

## Casos de uso

- Despliegue de text-to-image en local sobre Mac: ejecutar Krea 2 Turbo o Z-Image Turbo dentro de ComfyUI con la ruta MLX permite generar imágenes de 1 MP en aproximadamente 31 s y 27 s respectivamente por unidad de lote, sin depender de CUDA.
- Generación de imágenes en la nube con Comfy Cloud: los mismos grafos funcionan en la edición Cloud, con la salvedad de que los campos de ajuste automático de LVNodes deben configurarse a mano siguiendo las indicaciones del propio nodo.
- Prototipado rápido con destilación por pasos: usar las LoRA de 2 o 4 pasos para Krea 2 o las de 2, 4 y 8 pasos para Z-Image reduce el coste de muestreo en iteraciones de exploración visual.
- Reutilización de imágenes como prompts: Image2Text genera descripciones con detalle suficiente para realimentar un pipeline de text-to-image, útil en flujos de variación o ampliación de catálogo gráfico.
- Asistente conversacional local con contexto persistente: LLM Chat mantiene el modelo y el contexto de cada conversación cargados en Mac, de modo que una pregunta de seguimiento arranca en una fracción de segundo.
- Búsqueda y verificación con herramientas web: el chat puede consultar noticias, búsqueda general, páginas, imágenes, vídeos y meteorología, pidiendo confirmación antes de conectarse, lo que encaja en flujos de investigación asistida.
- Producción musical con letra: MiniMax Music 3 permite describir una canción en lenguaje natural y obtener título, estilo, duración, caption estructurado y letra, o aportar caption y letra propios que se cantan literalmente.
- Inferencia de modelos de lenguaje sobre hardware Apple: cargar carpetas MLX de mlx-lm o mlx-vlm, incluidos MoE que la ruta nativa no soporta en GPUs de Apple, para tareas de generación de texto y visión dentro del mismo grafo de ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye cifras de velocidad declaradas por el autor, que se recogen aquí como datos de rendimiento y no como benchmarks comparativos:

| Medicion declarada | Valor |
|---|---|
| Qwen3.8 27B int4 (MLX) | 24 tokens/s |
| Gemma 4 E4B (MLX) | 66 tokens/s (frente a 1,6 tokens/s por la ruta nativa de ComfyUI) |
| Qwen3.6-35B-A3B (MLX, MoE) | 82 tokens/s |
| Krea 2 Turbo (MLX) | ~31 s por imagen de 1 MP dentro de un lote |
| Z-Image Turbo (MLX, 8 pasos) | ~27 s por imagen |
| MiniMax Music 3 (MLX) | ~2,5x mas rapido que PyTorch en un Mac |

## Requisitos de hardware

- El proyecto está orientado explícitamente a Apple Silicon: la ruta MLX es el eje de las optimizaciones descritas.
- Se menciona una mejora de aproximadamente un cuarto más de velocidad con cómputo float16 dentro de las capas del modelo en Macs M1 y M2.
- Las cuantizaciones soportadas en la ruta MLX son bf16, int8, int6 e int4 de los ficheros de ComfyUI.
- No se especifican requisitos de VRAM, memoria unificada mínima, GPU concretas (A100, H100, RTX 4090) ni latencias fuera del ecosistema Apple.
- Opciones de despliegue: ComfyUI local (PyTorch) y Apple MLX, ambas dentro de ComfyUI; Comfy Cloud queda limitada a los paquetes de nodos que tenga instalados y no puede cargar LVNodes ni la vista de chat.
- La ruta MLX se ejecuta en un subentorno propio, sin tocar el entorno Torch principal de ComfyUI.
- No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

No se dispone de datos verificables para comparar este repositorio con alternativas equivalentes. Se trata de un paquete de nodos y workflows, no de un modelo, por lo que las métricas habituales (parámetros, contexto, benchmarks) no aplican. Como referencia de categoría, se puede situar frente a otras piezas del ecosistema ComfyUI:

| Alternativa | Naturaleza | Datos comparables |
|---|---|---|
| ComfyUI (nucleo) | Aplicacion de nodos para generacion visual | No es comparable en parametros ni contexto; el repositorio analizado se apoya en ella |
| Otros paquetes de nodos personalizados | Extensiones de terceros | Sin datos de rendimiento publicados en la informacion disponible |
| Modelos generativos citados (Krea 2, Z-Image, MiniMax Music 3, Qwen3-VL) | Modelos de terceros consumidos por el repositorio | No disponible: no se aportan parametros, contexto ni benchmarks de estos modelos |

## Limitaciones y advertencias

- No es un modelo: no contiene pesos, no se ha entrenado y no permite evaluar sesgos, alucinación ni calidad generativa por sí mismo; esas propiedades dependen de los modelos de terceros que orquesta.
- Todas las cifras de velocidad y los nombres de modelos proceden de la model card del autor y no están contrastados con mediciones independientes.
- Comfy Cloud no puede cargar LVNodes ni la vista de chat, por lo que varias funciones (ajuste automático de parámetros, progreso en vivo, persistencia de conversación) solo están disponibles en local.
- La licencia Apache-2.0 cubre el repositorio, pero no necesariamente los modelos de terceros que consume; el uso comercial de Krea 2, Z-Image, MiniMax Music 3 o Qwen3-VL requiere verificar cada licencia por separado, dato que no se aporta.
- No se declaran idiomas soportados, longitud de contexto, requisitos de VRAM ni límites de idioma.
- El tamaño del repositorio es de 0,0 GB, lo que indica que no incluye artefactos pesados; su funcionamiento depende de descargas externas de modelos y LoRA.
- La fecha de creación y actualización (octubre de 2026) y el contenido de la model card deben tratarse como declaraciones del autor, no como hechos verificados.
- No hay información sobre tasas de error, comportamiento en producción, ni pruebas de carga o concurrencia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/lvladikov/ComfyUI-Nodes-and-Workflows
- README de Krea 2: https://huggingface.co/lvladikov/ComfyUI-Nodes-and-Workflows/blob/main/Krea-2/README.md
- README de Z-Image: https://huggingface.co/lvladikov/ComfyUI-Nodes-and-Workflows/blob/main/Z-Image/README.md
- README de MiniMax Music 3: https://huggingface.co/lvladikov/ComfyUI-Nodes-and-Workflows/blob/main/Minimax-Music3/README.md
- README de Image2Text: https://huggingface.co/lvladikov/ComfyUI-Nodes-and-Workflows/blob/main/Image2Text/README.md
- README de LLM Chat: https://huggingface.co/lvladikov/ComfyUI-Nodes-and-Workflows/blob/main/LLMChat/README.md
- LoRA de destilacion a 2 pasos de Krea 2: https://huggingface.co/lvladikov/Krea2-Turbo-Distill-2step-LoRA
- LoRA de destilacion a 4 pasos de Krea 2: https://huggingface.co/lvladikov/Krea2-Turbo-Distill-4step-LoRA
- Z-Image-Fun-Lora-Distill (alibaba-pai): https://huggingface.co/alibaba-pai/Z-Image-Fun-Lora-Distill
- Ficha en free2aitools: https://free2aitools.com/model/lvladikov/comfyui-nodes-and-workflows
- Documentacion oficial de ComfyUI: https://docs.comfy.org/
- Guia de ComfyUI 2026 (think4ai): https://think4ai.com/comfyui-complete-guide-2026/
- ComfyUI, control de nodos para flujos visuales: https://comfy-ui.io/
