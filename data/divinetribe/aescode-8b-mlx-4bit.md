# divinetribe/AesCode-8B-MLX-4bit

## Resumen

AesCode-8B es un modelo multimodal de tipo vision-lenguaje desarrollado por Microsoft, especializado en la generación de artefactos visuales ricos en información (presentaciones, pósters, paneles de control, informes) como HTML/CSS estructurado, editable y verificable. Parte de Qwen3-VL-8B-Instruct de Alibaba y se entrena con SFT de arranque en frío seguido de GDPO sobre siete canales de recompensa, separando requisitos semánticos de señales visuales mediante supervisión estructurada en grafo y recompensas desacopladas entre modalidades.

La ficha que nos ocupa, `divinetribe/AesCode-8B-MLX-4bit`, no es el modelo original sino una cuantización a 4 bits en formato MLX realizada por el usuario divinetribe, que mantiene intacta la torre de visión para su uso nativo en Apple Silicon mediante la librería `mlx-vlm`. Emplea precisión mixta (5,256 bits por peso de media, con capas sensibles a mayor precisión), grupo de tamaño 64 y ocupa 5,4 GB repartidos en dos shards, lo que permite ejecutarlo en equipos con 8 GB de memoria unificada.

Su relevancia actual radica en dos frentes: por un lado, la tarea específica de convertir capturas de pantalla o diseños en código HTML/CSS fiel, evaluada por el paper original con un resultado global de 82,94 en su propio benchmark de 300 prompts de infografía; por otro, la accesibilidad de ejecutar un modelo de 8,8 mil millones de parámetros con visión en hardware de consumo de Apple sin conexión a la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3VLForConditionalGeneration` (torre de visión `qwen3_vl` + decodificador `qwen3_vl_text`) |
| Parametros totales | 8.767.123.696 (8,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits MLX con precisión mixta (5,256 bits/peso de media), grupo de 64; existen builds bf16 y 8 bits del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), 5,4 GB en dos shards; librería `mlx-vlm` |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura Qwen3-VL: una torre de visión que procesa imágenes y las proyecta en el espacio del decodificador de texto, un transformer autorregresivo estándar. El entrenamiento original de Microsoft parte de Qwen3-VL-8B-Instruct y aplica un SFT de arranque en frío seguido de GDPO (una variante de optimización de política con recompensas) sobre siete canales de recompensa, con supervisión estructurada en grafo para separar requisitos semánticos de señales visuales y recompensas desacopladas entre modalidades. El objetivo declarado es generar código estéticamente correcto y verificable, no solo funcional.

La contribución de esta ficha concreta es únicamente la cuantización a 4 bits en MLX, con precisión mixta para preservar las capas sensibles y la torre de visión completa. El autor indica que el build pasó la misma prueba de lectura de pose que las versiones bf16 y 8 bits antes de publicarse, y que los errores de interpretación observados (por ejemplo, situar los brazos bajos en lugar de en guardia alta) son rasgos del modelo original, no artefactos de la cuantización.

## Capacidades

- Generación de HTML/CSS a partir de una imagen: capturas de pantalla, diseños, bocetos o referencias visuales.
- Creación de artefactos visuales estructurados: presentaciones, pósters, paneles de control e informes.
- Comprensión de imágenes con descripción detallada y respuesta a preguntas de control de calidad visual (pose, composición, elementos presentes).
- Generación de texto para alt-text a partir de imágenes.
- Generación de código en general, con etiquetas específicas de code-generation y html.
- Modo conversacional multi-turno (etiqueta `conversational`).
- Funcionamiento en modo solo texto con `num_images=0`.
- Soporte de tool calling y agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Reconstrucción de interfaces a partir de capturas: se introduce una screenshot de una web o aplicación y el modelo devuelve un único archivo HTML con el CSS embebido, útil para prototipado rápido o migración de diseños legacy.
- Generación de infografías y pósters: dado un brief visual o una imagen de referencia, produce HTML/CSS editable que puede renderizarse y revisarse en un pipeline de publicación.
- Paneles de control y informes: a partir de una maqueta o de una captura de un dashboard existente, genera el marcado estructurado correspondiente, aprovechando la separación entre requisitos semánticos y visuales del entrenamiento.
- Accesibilidad y alt-text: procesa imágenes y devuelve descripciones textuales detalladas, integrable en flujos de catalogación o de cumplimiento de accesibilidad web.
- Control de calidad visual en aplicaciones de visión: el ejemplo documentado de lectura de pose en un juego de movimiento muestra su uso para validar si una figura dibujada corresponde a una pose humana correcta, sin miembros extra ni articulaciones invertidas.
- Desarrollo local en Apple Silicon sin conexión: al ejecutarse con `mlx-vlm` en 5,4 GB, encaja en flujos de trabajo de un desarrollador que necesita un asistente de diseño y código en su portátil sin enviar capturas a servicios externos.
- Prototipado de front-end en equipos pequeños: la licencia Apache-2.0 permite integrarlo en herramientas internas de generación de maquetas sin restricciones de uso comercial.

## Benchmarks y rendimiento

Los datos disponibles provienen de la evaluación propia del paper de AesCode sobre 300 prompts de infografía, con dos pistas (programática `Rule` con Text, Bound y Chart; y lista de verificación `Visual` con Content, Layout y Style), promediadas en `Overall` sobre tres generaciones sin selección.

| Modelo | Overall | Rule | Notas |
|---|---|---|---|
| AesCode-8B | 82,94 | 90,07 | Mejora Visual +31,1 puntos sobre Qwen3-VL-8B de referencia |
| GPT-5.5 (con referencia) | 81,28 | no disponible | Fila de la misma tabla del paper |
| Claude Opus 4.8 (con referencia) | 80,39 | no disponible | Fila de la misma tabla del paper |

El autor advierte que estas cifras corresponden al modelo en precisión completa; la versión 4 bits intercambia exactitud por tamaño y se espera que los valores se muevan. No se han publicado resultados específicos de esta cuantización en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: 5,4 GB de pesos en 4 bits; con overhead de ejecución conviene disponer de al menos 8 GB de memoria unificada, tal como indica el autor.
- Plataforma: exclusivamente Apple Silicon mediante MLX y `mlx-vlm`; no es un build para CUDA.
- GPU recomendadas: chips de Apple con memoria unificada suficiente (M1/M2/M3/M4 en configuraciones de 8 GB o más); no aplica a A100, H100 ni RTX 4090 porque el formato es MLX.
- Cabe en GPU de consumo: sí, en equipos Apple con 8 GB o más de memoria unificada; para mayor calidad existen los builds bf16 y 8 bits del mismo autor, que requieren más memoria.
- Opciones de despliegue: `mlx-vlm` (librería oficial del repo); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AesCode-8B-MLX-4bit (esta ficha) | 8,8B | no disponible | Visión + generación de HTML/CSS, cuantizado 4 bits para Apple Silicon | Apache-2.0 | HuggingFace, `mlx-vlm` |
| microsoft/AesCode-8B | 8,8B | no disponible | Modelo original en precisión completa | Apache-2.0 | HuggingFace |
| Qwen3-VL-8B-Instruct | 8B | no disponible | Vision-lenguaje generalista, base del anterior | no disponible | HuggingFace |
| divinetribe/AesCode-8B-MLX-bf16 y -8bit | 8,8B | no disponible | Mismas capacidades con mayor precisión y más memoria | Apache-2.0 | HuggingFace, `mlx-vlm` |

La comparación relevante es interna a la familia: el build 4 bits es el más pequeño y el que más degrada la fidelidad; el bf16 es la referencia de calidad y el 8 bits el punto intermedio.

## Limitaciones y advertencias

- La cuantización a 4 bits introduce degradación de precisión respecto al modelo original; el propio autor reconoce que los resultados del benchmark se moverán y recomienda los builds de mayor precisión cuando la exactitud sea crítica.
- El modelo arrastra rasgos del original: en la prueba de pose documentada sitúa los brazos bajos en lugar de en guardia alta, un sesgo de interpretación presente también en bf16 y 8 bits.
- Riesgo de alucinación en la generación de HTML/CSS: puede producir marcado plausible pero no fiel a la imagen de entrada, especialmente en diseños complejos o con texto denso.
- Idiomas soportados no documentados; no hay garantía explícita de calidad en castellano ni en otras lenguas distintas del inglés.
- Longitud de contexto no documentada, lo que dificulta planificar conversaciones largas o documentos extensos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-VL-8B-Instruct del que deriva.
- Dependencia de plataforma: solo funciona en Apple Silicon con MLX; no es desplegable en infraestructura CUDA estándar sin reconvertir los pesos.
- El repositorio tiene un volumen de descargas muy bajo (26) y ninguna valoración, por lo que la validación comunitaria es escasa.
- No hay datos publicados de tool calling, agentes ni razonamiento multi-paso para esta variante.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/divinetribe/AesCode-8B-MLX-4bit
- Modelo base original: https://huggingface.co/microsoft/AesCode-8B
- Build bf16 del mismo autor: https://huggingface.co/divinetribe/AesCode-8B-MLX-bf16
- Build 8 bits del mismo autor: https://huggingface.co/divinetribe/AesCode-8B-MLX-8bit
- Modelo Qwen3-VL-8B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Paper de AesCode: https://arxiv.org/abs/2610.18860
- Página del proyecto: https://microsoft.github.io/AesCode/
- Código de Microsoft AesCode: https://github.com/microsoft/AesCode
- Librería mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Proyecto Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
