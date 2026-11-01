# divinetribe/AesCode-32B-abliterated-MLX-8bit

## Resumen

AesCode-32B-abliterated-MLX-8bit es una cuantizacion en 8 bits para Apple Silicon del modelo microsoft/AesCode-32B, un finetune de Qwen3-VL-32B-Instruct especializado en generacion de codigo estetico: recibe una captura de pantalla y produce el HTML y CSS necesarios para recrearla (presentaciones, posters, dashboards, paginas de producto). Lo publica el usuario divinetribe, no el equipo original de Microsoft, y anade dos transformaciones sobre el modelo base: abliteracion de la direccion de rechazo en la torre de lenguaje y cuantizacion MLX en 8 bits.

El modelo conserva la torre de vision en bfloat16 (los 351 tensores `vision_tower.*` sin cuantizar) para no degradar la ruta de imagen, mientras que la torre de lenguaje se comprime a 8 bits. El resultado ocupa unos 34 GB en disco, aproximadamente la mitad que la version bf16 de la misma familia, y se ejecuta de forma nativa en Macs de la serie M mediante `mlx-vlm`, sin inferencia en la nube ni telemetria.

Es relevante para desarrolladores que necesitan convertir disenos visuales en codigo frontend sobre hardware local de Apple, y para quienes investigan tecnicas de abliteracion aplicadas a modelos multimodales. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3VLForConditionalGeneration): torre de vision + torre de lenguaje |
| Parametros totales | 33.357.390.064 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits en la torre de lenguaje, bfloat16 en la torre de vision; la familia incluye variantes bf16 y 4 bits |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), libreria `mlx` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-VL-32B-Instruct: un transformer multimodal con una torre de vision (351 tensores `vision_tower.*`) que procesa imagenes y una torre de lenguaje que genera texto y codigo. Sobre esa base, el equipo de Microsoft entreno AesCode-32B para la tarea especifica de generacion de codigo estetico, descrita en el paper "AesCode: Aesthetic Code Generation with Decoupled Cross-Modal Rewards" (arXiv:2610.18860), que emplea recompensas desacopladas entre modalidades. No se dispone de detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

Esta build concreta aplica dos modificaciones. Primero, una abliteracion por ablacion direccional (Arditi et al. 2024, arXiv:2406.11717) sobre la torre de lenguaje unicamente, tomando la direccion de rechazo de la capa 44 de 64; la torre de vision queda intacta. Segundo, una cuantizacion MLX a 8 bits de la torre de lenguaje, manteniendo la torre de vision en bfloat16 para preservar la calidad de la ruta de imagen. El autor indica que cada tamano de la familia pasa una prueba de vision antes de publicarse: se le entrega una captura real de una pagina de producto y se le pide una auditoria SEO, de marketing y de accesibilidad mas textos alternativos de imagen; la build de 8 bits supero esa prueba.

## Capacidades

- Generacion de codigo HTML y CSS a partir de una captura de pantalla, con el objetivo de recrear el diseno lo mas fielmente posible.
- Comprension de imagenes: lectura de elementos de interfaz, jerarquia visual, tipografia, colores y estructura de pagina.
- Generacion de texto descriptivo a partir de imagenes, incluidos textos alternativos (alt-text) para accesibilidad.
- Auditoria de paginas web en terminos de SEO, marketing y accesibilidad a partir de una captura.
- Generacion de texto general y conversacion multi-turno (pipeline `image-text-to-text`, tag `conversational`).
- Capacidad de seguir instrucciones de formato y reglas explicitas (el benchmark del modelo base evalua rule-following).
- Sin soporte declarado de tool calling ni de function calling en la informacion disponible.
- Sin modo de razonamiento explicito (thinking mode) declarado en la informacion disponible.
- Capacidades multilingues limitadas al ingles segun el campo `language`.

## Casos de uso

- Conversion de mockups a HTML/CSS: un disenador entrega una captura de una slide o un poster y el modelo genera un unico archivo HTML con CSS en linea, listo para revisar y ajustar manualmente.
- Prototipado rapido de dashboards: a partir de una captura de un panel de control, el modelo produce la estructura HTML y los estilos, lo que acelera la primera iteracion antes de integrar datos reales.
- Reconstruccion de paginas de producto: dada una captura de una pagina de ecommerce, genera el marcado de la ficha de producto, incluida la jerarquia de encabezados y los bloques de precio y llamada a la accion.
- Generacion de alt-text a escala: el modelo puede procesar capturas o imagenes de catalogo y redactar descripciones alternativas utilizables en auditorias de accesibilidad.
- Auditoria SEO y de accesibilidad asistida: se le pasa una captura de una pagina publicada y devuelve observaciones sobre jerarquia de encabezados, legibilidad de llamadas a la accion y elementos visuales clave.
- Desarrollo local en Apple Silicon sin nube: equipos con requisitos de privacidad pueden ejecutar el modelo en un Mac de la serie M mediante `mlx-vlm`, sin enviar capturas de producto a servicios externos.
- Experimentacion en investigacion sobre abliteracion: util para estudiar como la eliminacion de la direccion de rechazo afecta al comportamiento de un modelo multimodal sin tocar la torre de vision.

## Benchmarks y rendimiento

Los unicos datos disponibles provienen del benchmark del modelo original (AesCode-32B) citado en su model card, sobre 300 muestras de estilo infografico evaluadas en correccion de seguimiento de reglas y calidad visual. Corresponden al modelo sin cuantizar ni abliterar, no a esta build.

| Modelo (con imagen de referencia) | Overall | Visual |
|---|---|---|
| AesCode-32B | 85.89 | 77.44 |
| Claude Opus 4.8 (sin referencia) | 76.78 | no disponible |
| GPT-5.5 (sin referencia) | 76.31 | no disponible |
| Qwen3-VL-32B base (con referencia) | 61.10 | no disponible |

No se han publicado resultados de benchmarks especificos para la version abliterada ni para la cuantizacion de 8 bits en la informacion disponible. El autor solo reporta que la build supero la prueba cualitativa de vision descrita en la seccion de arquitectura.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: unos 34 GB en disco para los pesos en 8 bits; en Apple Silicon la memoria unificada debe acomodar los pesos mas el contexto y las activaciones, por lo que se recomienda un Mac con 48 GB o mas de memoria unificada.
- GPU recomendadas: no esta pensada para GPU NVIDIA; el formato MLX esta orientado a chips de Apple. En la practica requiere un Mac con chip de la serie M.
- Cabe en GPU de consumo: si, en Macs de gama alta con memoria unificada suficiente (por ejemplo, configuraciones de 48 GB o 64 GB). No es desplegable en GPUs NVIDIA de consumo mediante este formato.
- Opciones de despliegue: `mlx-vlm` es la via documentada por el autor; el ejemplo oficial usa `python -m mlx_vlm.generate`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta build.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AesCode-32B-abliterated-MLX-8bit | 33.357.390.064 | no disponible | Codigo estetico a partir de captura, abliterado, MLX 8 bits | apache-2.0 | HuggingFace (divinetribe) |
| microsoft/AesCode-32B | mismo backbone | no disponible | Codigo estetico a partir de captura, sin abliterar | no disponible en esta ficha | HuggingFace (Microsoft) |
| Qwen/Qwen3-VL-32B-Instruct | ~32B | no disponible | Vision-lenguaje general | no disponible en esta ficha | HuggingFace (Qwen) |
| AesCode-32B-abliterated-MLX-bf16 / 4bit | mismo backbone | no disponible | Misma build en precision completa o cuarta parte | apache-2.0 | HuggingFace (divinetribe) |

El modelo base de Microsoft obtiene 85.89 de Overall en el benchmark de 300 muestras, frente a 61.10 de Qwen3-VL-32B base con imagen de referencia, lo que cuantifica la mejora del finetune para la tarea de recreacion visual. La version abliterada y cuantizada no dispone de cifras propias.

## Limitaciones y advertencias

- La abliteracion elimina la direccion de rechazo del modelo: puede generar contenido que el modelo original rechazaria. El autor advierte explicitamente que el usuario es responsable de lo que construya con el.
- La cuantizacion a 8 bits reduce precision; no anade conocimiento ni garantiza que la salida sea correcta.
- Riesgo de alucinacion en la generacion de codigo: el HTML/CSS producido puede no coincidir exactamente con la captura y requiere revision humana.
- Idioma limitado al ingles segun los metadatos; el rendimiento en castellano no esta documentado.
- Longitud de contexto no especificada en la informacion disponible.
- Solo funciona en Apple Silicon mediante MLX; no es portable a ecosistemas CUDA sin conversion adicional.
- La licencia Apache 2.0 permite uso comercial, pero la abliteracion puede implicar riesgos de cumplimiento y de moderacion que conviene evaluar antes de desplegar en produccion.
- Es una publicacion de terceros (divinetribe), no oficial de Microsoft; no hay garantia de mantenimiento ni de soporte.
- El modelo esta especializado en generacion de codigo estetico; su rendimiento en tareas generales de vision o lenguaje no esta evaluado en esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/divinetribe/AesCode-32B-abliterated-MLX-8bit
- Modelo base: https://huggingface.co/microsoft/AesCode-32B
- Backbone: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Variante bf16: https://huggingface.co/divinetribe/AesCode-32B-abliterated-MLX-bf16
- Variante 4 bits: https://huggingface.co/divinetribe/AesCode-32B-abliterated-MLX-4bit
- Paper de AesCode: https://arxiv.org/abs/2610.18860
- Paper de abliteracion (Arditi et al.): https://arxiv.org/abs/2406.11717
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Perfil del autor: https://huggingface.co/divinetribe
- Mas modelos del autor: https://nicedreamzwholesale.com/software/huggingface/
