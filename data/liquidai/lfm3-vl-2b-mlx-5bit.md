# LiquidAI/LFM3-VL-2B-MLX-5bit

## Resumen

LFM3-VL-2B-MLX-5bit es una versión cuantizada a 5 bits, en formato MLX, del modelo multimodal LFM3-VL-2B desarrollado por Liquid AI. Está diseñada específicamente para su ejecución en chips Apple Silicon (series M), permitiendo desplegar un modelo de visión-lenguaje compacto directamente en dispositivos Mac sin necesidad de GPU dedicada ni servidor remoto.

El modelo base, LFM3-VL-2B, pertenece a la familia LFM3 de Liquid AI y resuelve el problema de la comprensión conjunta de imágenes y texto en entornos con recursos limitados: con unos 1.920 millones de parámetros y pesos que ocupan 1,57 GB tras la cuantización, cabe en la memoria unificada de prácticamente cualquier Mac moderno. Su relevancia actual radica en la creciente demanda de modelos multimodales on-device que garanticen privacidad y baja latencia.

La ficha técnica del repositorio no detalla la arquitectura exacta del modelo base, la longitud de contexto ni los datos de entrenamiento; para esos detalles remite a la model card original de LFM3-VL-2B. El pipeline asociado es image-text-to-text, es decir, acepta imágenes y texto como entrada y genera texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia LFM3 de Liquid AI; consultar model card del modelo base) |
| Parametros totales | 1.918.181.888 (≈1,92 B) |
| Parametros activos | no aplicable (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5 bits afín, grupos de 64 (MLX) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (licencia propia de Liquid AI, tipo "other") |
| Formato de pesos | safetensors (formato MLX) |

Datos adicionales del repositorio: tamaño del repositorio de 1,6 GB, con los pesos cuantizados ocupando 1,57 GB.

## Arquitectura y entrenamiento

Este repositorio contiene exclusivamente la conversión cuantizada del modelo base LiquidAI/LFM3-VL-2B al formato MLX, el framework de Apple para entrenamiento e inferencia en Apple Silicon. La cuantización emplea el esquema afín de 5 bits con grupos de 64 pesos, un compromiso que reduce el tamaño a 1,57 GB manteniendo una calidad razonablemente cercana al modelo en precisión original. No se trata de un modelo entrenado desde cero: es una derivada cuantizada, tal como indica la etiqueta `base_model:quantized`.

Sobre la arquitectura interna del modelo base (tipo de capa transformer, mecanismo de atención, proyector de visión, número de tokens de preentrenamiento, composición del dataset o uso de RLHF/DPO), la model card de este repositorio no proporciona información y remite a la documentación de LFM3-VL-2B. No se han publicado estos datos en la información disponible, por lo que no se detallan aquí para no especular.

## Capacidades

- Comprensión multimodal imagen-texto: acepta una imagen junto con una instrucción textual y genera una respuesta textual (pipeline image-text-to-text).
- Descripción y análisis de imágenes: el ejemplo oficial de la model card muestra su uso para describir imágenes en lenguaje natural.
- Conversación: etiquetado como modelo conversacional, apto para diálogos multi-turno con contenido visual.
- Multilingüe: soporte declarado para 16 idiomas, incluido el castellano (es), además de inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Ejecución on-device en Apple Silicon gracias al formato MLX, sin depender de servicios en la nube.
- No hay información disponible sobre soporte de tool calling, capacidades de agente, modo de razonamiento extendido (thinking mode), audio ni vídeo.

## Casos de uso

- Descripción automática de imágenes en aplicaciones macOS o iOS: al ser un modelo MLX de 1,57 GB, puede integrarse en apps nativas de Apple Silicon para generar descripciones de fotos sin enviar datos a servidores externos, útil en contextos con requisitos de privacidad.
- Asistentes de productividad locales: un usuario puede arrastrar capturas de pantalla, diagramas o documentos escaneados a una app de chat local y preguntar por su contenido, con latencia baja al no existir ida y vuelta de red.
- Moderación y etiquetado de contenido visual en flujos de trabajo privados: clasificación o resumen de imágenes dentro de una organización sin exponer el material a APIs de terceros.
- Extracción de información de documentos e interfaces: consultas sobre capturas de paneles, facturas o formularios aprovechando la capacidad visión-lenguaje del modelo base.
- Prototipado rápido de agentes multimodales en Mac: su tamaño reducido permite iterar pipelines de visión-lenguaje en un portátil antes de escalar a modelos mayores, usando el comando `mlx_vlm.generate` mostrado en la model card.
- Aplicaciones multilingües con soporte de castellano: generación de descripciones o respuestas en cualquiera de los 16 idiomas soportados, útil para productos destinados al mercado español e internacional.
- Educación y accesibilidad: herramientas de apoyo visual que describen imágenes a usuarios con discapacidad visual, ejecutándose íntegramente en el dispositivo del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta versión cuantizada. La model card remite a la documentación del modelo base LFM3-VL-2B para detalles de rendimiento, sin incluir tablas de métricas (MMLU, HumanEval, GSM8K u otras) en este repositorio.

## Requisitos de hardware

- VRAM / memoria estimada: los pesos ocupan 1,57 GB; en la práctica conviene disponer de al menos 4-6 GB de memoria unificada libres para pesos, KV cache y overhead del runtime, algo alcanzable en cualquier Mac con chip Apple Silicon (M1 o superior).
- GPU recomendadas: no requiere GPU dedicada de NVIDIA; está optimizado para la GPU integrada de Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante el framework MLX.
- Cabe en consumer GPU: sí, en el sentido de hardware de consumo; cualquier Mac con Apple Silicon y 8 GB de memoria unificada o más debería ejecutarlo sin problemas. No hay versiones GGUF/CUDA en este repositorio, por lo que no está pensado para tarjetas gráficas tradicionales.
- Opciones de despliegue: MLX-VLM (biblioteca de referencia, con soporte para LFM3-VL aún en progreso según la model card, que promete actualizarla cuando una versión lo soporte). El comando de uso oficial es `python -m mlx_vlm.generate --model LiquidAI/LFM3-VL-2B-MLX-5bit --image <ruta> --prompt "..."`. No hay información sobre soporte en vLLM, llama.cpp, Ollama o TGI para esta variante MLX.
- Latencia y throughput: no disponible; al tratarse de un modelo de ~1,9 B de parámetros en Apple Silicon se espera interacción interactiva fluida, pero no se han publicado cifras concretas.
- Parámetros de generación recomendados por el autor: temperature 0.1, top-p 1.0, top-k 50, min-p 0.0, repetition penalty 1.1 y hasta 16.384 tokens de salida.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion / formato | Modalidad | Licencia | Plataforma objetivo |
|---|---|---|---|---|---|
| LFM3-VL-2B-MLX-5bit (este modelo) | 1,92 B | 5 bits afín, grupos de 64 (MLX) | Imagen + texto → texto | lfm1.0 (other) | Apple Silicon |
| Qwen2.5-VL-3B-Instruct | 3 B | BF16 / GGUF (comunidad) | Imagen + texto → texto | Apache 2.0 (base) / restricciones de uso en la variante instruct | CUDA, CPU, MLX (conversiones de comunidad) |
| SmolVLM-2-2.2B (HuggingFace) | 2,2 B | BF16 / GGUF (comunidad) | Imagen + texto → texto | Apache 2.0 | Multiplataforma |

Notas de la comparativa: frente a Qwen2.5-VL-3B y SmolVLM-2, LFM3-VL-2B-MLX-5bit destaca por su conversión oficial a MLX mantenida por el propio autor, lo que simplifica el despliegue en Mac; en cambio, sus alternativas ofrecen un ecosistema de despliegue más amplio (llama.cpp, vLLM, Ollama) y, en el caso de SmolVLM, una licencia Apache 2.0 más permisiva. No hay benchmarks públicos en la información disponible que permitan comparar rendimiento numérico entre ellos.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se documentan sesgos específicos en este repositorio. Como todo modelo de visión-lenguaje, puede heredar sesgos de sus datos de entrenamiento.
- Riesgo de alucinación: no cuantificado por el autor; los modelos multimodales pequeños tienden a describir elementos inexistentes en imágenes, por lo que se recomienda verificación humana en usos críticos.
- Limitaciones de idioma: declara 16 idiomas incluido el castellano, pero no hay datos públicos sobre la calidad relativa de cada idioma en esta variante cuantizada; la cuantización a 5 bits puede degradar ligeramente la generación respecto al modelo base.
- Restricciones de licencia: la licencia lfm1.0 es una licencia propia ("other"), no una licencia estándar open source; debe revisarse el texto en el archivo LICENSE antes de cualquier uso comercial o redistribución.
- Soporte en MLX-VLM aún en progreso: la propia model card indica que el soporte de LFM3-VL en MLX-VLM no está completado en el momento de publicación, por lo que puede ser necesario esperar a una release compatible o usar versiones de desarrollo.
- Sin información sobre tool calling, agentes ni contexto largo: no debe asumirse ninguna de estas capacidades sin verificarla en la documentación del modelo base.
- Uso recomendado por el autor: los hiperparámetros de generación sugeridos (temperature 0.1, repetition penalty 1.1) indican que el modelo puede ser propenso a repeticiones si se usan ajustes por defecto más creativos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/LiquidAI/LFM3-VL-2B-MLX-5bit
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- MLX-VLM (repositorio de GitHub): https://github.com/Blaizzy/mlx-vlm
- API de Liquid AI: https://console.liquid.ai/dashboard
- Playground de Liquid AI: https://playground.liquid.ai/
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Guía de despliegue con MLX: https://docs.liquid.ai/deployment/on-device/mlx
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Licencia: https://huggingface.co/LiquidAI/LFM3-VL-2B-MLX-5bit/blob/main/LICENSE
