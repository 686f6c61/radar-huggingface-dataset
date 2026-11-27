# necropopeost/S5-nano-mxfp4-Uncensored

## Resumen

S5-nano-mxfp4-Uncensored es una conversión al formato MLX con cuantización MXFP4 de 4 bits del modelo Guilherme34/S5-nano-uncensored, un fine-tune "uncensored" derivado a su vez de maritaca-ai/S5-nano. El resultado es un modelo visión-lenguaje de aproximadamente 4.540 millones de parámetros (4,54 B) que acepta imagen y texto como entrada y genera texto, pensado para ejecutarse localmente en Macs con Apple Silicon mediante la librería mlx-vlm. No incorpora entrenamiento nuevo: es exclusivamente una conversión de formato y una cuantización de los pesos BF16 originales.

La arquitectura declarada es `qwen3_5` (familia Qwen 3.5 en su variante visión-lenguaje), con cuantización MXFP4 (valores E2M1 con escala compartida E8M0, tamaño de grupo 32) y un promedio de 5,116 bits por peso, ya que algunas capas sensibles —componentes de la parte visual incluidas— se mantienen a mayor precisión. El repositorio ocupa 2,9 GB y se distribuye bajo licencia Apache-2.0, con soporte declarado de portugués (pt-BR) e inglés.

Su relevancia es acotada pero concreta: ofrece un VLM pequeño, multimodal y sin filtros de rechazo, ejecutable de forma totalmente local y privada en hardware de consumo de Apple. La contrapartida es que la cuantización MXFP4 es agresiva para un modelo de este tamaño y el propio autor advierte de degradación en matemáticas, razonamiento largo, OCR preciso y detalle visual fino. No se han publicado benchmarks de esta conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5` (vision-language, transformer multimodal) |
| Parametros totales | 4.539.265.536 (~4,54 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (E2M1 + escala E8M0, grupo 32), 4 bits; promedio 5,116 bits por peso; el autor menciona alternativas mxfp8 y affine 8 bits para el modelo original |
| Idiomas soportados | portugues (pt-BR), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`, `mlx-vlm`) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de la familia `qwen3_5` en su variante visión-lenguaje: procesa pares imagen-texto y produce texto. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las técnicas de alineación (RLHF, DPO) aplicadas en las etapas previas de la cadena de linaje. La cadena documentada es: maritaca-ai/S5-nano (base original) → Guilherme34/S5-nano-abliterated → Guilherme34/S5-nano-uncensored (fine-tune con Unsloth + TRL) → esta conversión MLX MXFP4.

La innovación técnica de este repositorio es exclusivamente la cuantización: se convirtió directamente desde los safetensors BF16 originales (no desde GGUF) en un solo paso con `mlx_vlm.convert -q --q-bits 4 --q-mode mxfp4 --q-group-size 32`, evitando la pérdida de calidad de recuantizar un GGUF ya cuantizado. El esquema MXFP4 usa valores de 4 bits con escala compartida por grupo de 32 elementos, y no todos los tensores se cuantizan a 4 bits: partes de la torre visual y otras capas sensibles permanecen a mayor precisión, lo que explica el promedio de 5,116 bits por peso. No se documenta ninguna innovación adicional en atención, decodificación especulativa ni arquitectura.

## Capacidades

- Generación de texto conversacional en portugués (pt-BR) e inglés.
- Comprensión de imágenes: descripción de imágenes, respuesta a preguntas sobre contenido visual y tareas image-text-to-text en general.
- Funcionamiento en modo solo texto, sin imagen de entrada.
- Conversación multi-turno mediante plantilla de chat (`apply_chat_template` de mlx-vlm).
- Despliegue como servidor local compatible con la API de OpenAI (`mlx_vlm.server`).
- Comportamiento "uncensored": los rechazos ante peticiones consideradas inseguras están reducidos o eliminados.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking explícito, audio ni otras capacidades especiales.

## Casos de uso

- Descripción y etiquetado de imágenes en local: el modelo acepta una imagen y un prompt y genera una descripción detallada, lo que permite construir pipelines de anotación o accesibilidad ejecutados íntegramente en un Mac, sin enviar datos a la nube.
- Asistente multimodal privado en Apple Silicon: con `mlx_vlm.server` se puede exponer una API compatible con OpenAI y conectar un cliente de chat que alterne texto e imágenes, manteniendo la privacidad del contenido.
- Experimentación e investigación con VLMs pequeños: su tamaño (~4,54 B) y su licencia Apache-2.0 lo hacen adecuado para probar técnicas de cuantización, comparar MXFP4 frente a BF16 u 8 bits, y estudiar el efecto del "abliteration" en el comportamiento del modelo.
- Prototipado rápido de producto en macOS: equipos que desarrollan en Mac pueden validar flujos image-text-to-text antes de decidir un despliegue en servidor, sin necesidad de GPUs dedicadas.
- Procesamiento de documentación con OCR ligero: para extraer texto de capturas o documentos sencillos, siempre asumiendo la advertencia del autor sobre pérdida de precisión en OCR fino por la cuantización de 4 bits.
- Generación de contenido creativo sin filtros: para escritura, guiones o descripciones donde se requiere baja tasa de rechazo, con la obligación de añadir moderación propia antes de exponerlo a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se ejecutó ninguna evaluación formal sobre esta conversión y que solo se realizó una comprobación funcional básica (entrada de texto y de imagen).

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio pesa 2,9 GB, por lo que la inferencia en MXFP4 requiere del orden de 3-4 GB de memoria unificada, más el espacio para el contexto y el procesador de imágenes.
- Plataforma: exclusivamente Macs con Apple Silicon (M1 o posterior); los pesos MLX no están pensados para GPUs NVIDIA ni para CPU x86.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables; el formato MLX no se ejecuta en ellas.
- Cabe en cualquier Mac con Apple Silicon; en configuraciones de 8 GB de memoria unificada el margen es ajustado pero viable para contextos cortos.
- Despliegue: `mlx-vlm` (CLI `mlx_vlm.generate`, API Python `load`/`generate` y servidor `mlx_vlm.server`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para estos pesos.
- Latencia y throughput: no disponibles; no se han publicado mediciones.
- Requisitos de software: Python 3.10+ y una versión reciente de `mlx-vlm` con soporte de la familia Qwen3.5.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| S5-nano-mxfp4-Uncensored (este) | ~4,54 B | no disponible | MLX safetensors, MXFP4 4 bits | Apache-2.0 | Solo Apple Silicon; sin benchmarks |
| Guilherme34/S5-nano-uncensored (origen) | ~5 B (declarado) | no disponible | safetensors BF16 | Apache-2.0 (segun model card) | Mayor calidad esperada; requiere mas memoria |
| maritaca-ai/S5-nano (base) | ~5 B (declarado) | no disponible | safetensors | no disponible en la informacion | Modelo original con rechazos estándar |
| Guilherme34/S5-nano-abliterated | ~5 B (declarado) | no disponible | safetensors | no disponible en la informacion | Etapa intermedia del linaje, "abliterated" |

No se dispone de datos de benchmarks que permitan comparar el rendimiento real frente a estas variantes ni frente a otros VLMs de tamaño similar.

## Limitaciones y advertencias

- Pérdida por cuantización: MXFP4 es agresivo para un modelo de ~5 B; se espera degradación frente al BF16 original, especialmente en matemáticas, razonamiento largo, OCR preciso y detalle visual fino. El autor recomienda BF16 o cuantización de 8 bits si prima la calidad.
- Modelo pequeño: como cualquier VLM de este tamaño, puede alucinar, cometer errores factuales y malinterpretar imágenes.
- Sin evaluación formal: no hay benchmarks ni pruebas de robustez publicadas para esta conversión.
- Comportamiento "uncensored": deriva de un checkpoint "abliterated" con los rechazos reducidos o eliminados; puede producir contenido inexacto, ofensivo o dañino y no declinará de forma fiable peticiones inseguras. Es imprescindible añadir moderación propia antes de exponerlo a usuarios.
- Idiomas limitados: solo portugués (pt-BR) e inglés declarados; el rendimiento en castellano no está garantizado.
- Plataforma restringida: los pesos MLX solo funcionan en Apple Silicon; no hay ruta documentada para GPU NVIDIA ni para servidores x86.
- Licencia: Apache-2.0 en este repositorio, pero el autor remite a las licencias y términos de los repositorios upstream (maritaca-ai/S5-nano y los fine-tunes de Guilherme34), que deben verificarse antes de un uso comercial.
- Las salidas no constituyen asesoramiento profesional (médico, legal o financiero).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/necropopeost/S5-nano-mxfp4-Uncensored
- Modelo de origen (BF16): https://huggingface.co/Guilherme34/S5-nano-uncensored
- Modelo base original: https://huggingface.co/maritaca-ai/S5-nano
- Checkpoint abliterated intermedio: https://huggingface.co/Guilherme34/S5-nano-abliterated
- mlx-vlm (herramienta de conversion e inferencia): https://github.com/Blaizzy/mlx-vlm
