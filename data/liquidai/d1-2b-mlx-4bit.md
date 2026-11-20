# LiquidAI/d1-2B-MLX-4bit

## Resumen

d1-2B-MLX-4bit es la versión cuantizada a 4 bits en formato MLX de d1-2B, un modelo de decisión multimodal desarrollado por Liquid AI. A diferencia de los modelos generativos convencionales, d1-2B no produce texto token a token: recibe un estado (texto, imagen o vídeo) junto con un conjunto de preguntas tipadas y devuelve respuestas con probabilidades calibradas en un único paso hacia adelante. Está pensado para tareas de clasificación, enrutamiento y puntuación sobre flujos de datos en producción, no para generación abierta.

El modelo se apoya en la familia LFM3 de Liquid AI (arquitectura etiquetada como `lfm3_vl`) y cuenta con 1.918.181.888 parámetros totales, con una torre de visión para entrada image-text-to-text. Esta variante concreta está empaquetada para Apple Silicon mediante la librería MLX y requiere MLX-VLM 0.7.11 o superior.

La relevancia de esta ficha radica en que documenta una alternativa de inferencia local en Mac para un modelo de decisión calibrada, un nicho poco cubierto por los LLM generativos habituales. La cuantización a 4 bits reduce los pesos a 1,35 GB, a costa de una ligera pérdida de calibración que el propio autor advierte.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LFM3 VL (familia LFM3 de Liquid AI, multimodal texto/imagen/vídeo) |
| Parámetros totales | 1.918.181.888 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits afín con grupos de 64 en el modelo de lenguaje; torre de visión, proyector y normas en FP16 |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (MLX), cuantización 4-bit |

## Arquitectura y entrenamiento

La model card de esta variante remite a la ficha del modelo original (LiquidAI/d1-2B) para los detalles de arquitectura y entrenamiento, que no se reproducen aquí. Lo que sí se especifica es que el modelo combina un modelo de lenguaje con una torre de visión y un proyector, y que opera en modo "system-one": responde preguntas nombradas y tipadas sobre un estado en un solo paso hacia adelante, sin generar tokens. Los tipos de pregunta documentados incluyen `noul` (sí/no con probabilidad), `choice` (selección entre criterios, con opción múltiple) y `score` (puntuación sobre criterios ordenados).

En esta versión MLX-4bit, el modelo de lenguaje se cuantiza con cuantización afín de 4 bits y grupos de 64, mientras que la torre de visión, el proyector y las normas permanecen en FP16. El autor reporta que, frente al checkpoint original en float32, esta cuantización cambió 3 de 52 respuestas de test y desplazó las probabilidades hasta 0,25. No se dispone de información sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Decisión y clasificación multimodal sobre texto, imágenes y vídeo mediante preguntas tipadas.
- Respuestas con probabilidades calibradas en un único paso hacia adelante, sin generación de tokens.
- Tipos de pregunta soportados: `noul` (sí/no), `choice` (selección simple o múltiple entre criterios) y `score` (puntuación sobre una escala de criterios).
- Procesamiento de varias preguntas nombradas sobre un mismo estado en una sola pasada.
- Soporte multilingüe en 16 idiomas: inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Integración con MLX-VLM a través de `model.system_one` y del comando `decide`.
- No soporta generación de texto libre ni tool calling / function calling según la información disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo puede recibir el texto de un ticket y responder simultáneamente si el cliente pide reembolso (`noul`), a qué equipo debe ir (`choice` con criterios billing/shipping/technical), qué temas trata (`choice` múltiple) y su urgencia (`score`). El ejemplo de la model card reproduce exactamente este escenario.
- Moderación de contenido visual: clasificar imágenes o fotogramas de vídeo contra criterios definidos por el operador, obteniendo probabilidades calibradas que permiten fijar umbrales de revisión humana.
- Etiquetado automático de datasets: aplicar preguntas tipadas sobre lotes de imágenes y textos para generar etiquetas con confianza asociada, útil en pipelines de curación de datos.
- Triaje en atención al cliente: puntuar la urgencia y el tema de mensajes entrantes en varios idiomas (16 soportados) antes de derivarlos a un agente generativo o humano.
- Control de calidad en producción: evaluar si una imagen cumple criterios de calidad o si un texto cumple políticas internas, con probabilidades que permiten auditar la calibración del sistema.
- Clasificación de vídeo para vigilancia o análisis: al aceptar entrada de vídeo, puede responder preguntas tipadas sobre secuencias, por ejemplo presencia de un objeto o categoría de escena.
- Inferencia local en Mac: al estar empaquetado en MLX 4-bit con 1,35 GB de pesos, permite desplegar estas tareas de decisión en Apple Silicon sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado es la comparación de calibración frente al checkpoint original en float32: 3 de 52 respuestas de test cambiadas y desplazamientos de probabilidad de hasta 0,25.

## Requisitos de hardware

- Pesos en 4 bits MLX: 1,35 GB; tamaño del repositorio: 1,4 GB.
- Diseñado para Apple Silicon (MLX); requiere MLX-VLM 0.7.11 o superior.
- VRAM/memoria unificada estimada: no disponible de forma oficial; por el tamaño de pesos, cabe holgadamente en equipos Apple Silicon con memoria unificada de 8 GB o superior.
- GPU recomendadas: no aplica en el sentido CUDA; el destino es Apple Silicon. Para CUDA habría que usar otras variantes del modelo base.
- Cabe en GPU consumer: sí, en el ecosistema Apple Silicon; no se documenta soporte para GPUs NVIDIA consumer en esta variante.
- Opciones de despliegue: MLX-VLM (`model.system_one`, comando `decide`). No se documenta vLLM, llama.cpp, Ollama ni TGI para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d1-2B-MLX-4bit | 1,92 B | no disponible | Decisión multimodal calibrada, 4-bit MLX | lfm1.0 | Hugging Face (MLX) |
| d1-2B-MLX-fp16 | 1,92 B | no disponible | Decisión multimodal calibrada, FP16 MLX | lfm1.0 | Hugging Face (MLX) |
| d1-2B-MLX-8bit | 1,92 B | no disponible | Decisión multimodal calibrada, 8-bit MLX | lfm1.0 | Hugging Face (MLX) |
| d1-2B (original) | 1,92 B | no disponible | Decisión multimodal calibrada, float32 | lfm1.0 | Hugging Face |

Las alternativas más directas son las otras variantes de cuantización del mismo modelo base. La 4-bit es la más ligera (1,35 GB) pero la que más altera la calibración; el autor recomienda FP16 u 8-bit cuando la calibración es crítica. No se dispone de información sobre modelos de decisión comparables de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización 4-bit degrada la calibración: frente a float32, cambió 3 de 52 respuestas y desplazó probabilidades hasta 0,25. Para usos donde la probabilidad exacta importa, usar FP16 u 8-bit.
- No es un modelo generativo: no produce texto libre, por lo que no sirve para chatbots ni para `mlx_vlm.generate`.
- No se documenta soporte de tool calling ni de razonamiento multi-paso agéntico.
- La longitud de contexto no está publicada en la información disponible; no debe asumirse una ventana amplia.
- La licencia lfm1.0 (etiquetada como `other`) impone condiciones que deben revisarse antes de uso comercial; no se detallan en la información proporcionada.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo de clasificación, los errores se manifiestan como probabilidades mal calibradas más que como texto inventado.
- Dependencia de MLX y Apple Silicon: no es portable a CUDA sin cambiar de variante.
- El modelo requiere MLX-VLM 0.7.11 o superior; versiones anteriores no pueden ejecutarlo.

## Enlaces

- Hugging Face (esta variante): https://huggingface.co/LiquidAI/d1-2B-MLX-4bit
- Modelo base: https://huggingface.co/LiquidAI/d1-2B
- Variante FP16: https://huggingface.co/LiquidAI/d1-2B-MLX-fp16
- Variante 8-bit: https://huggingface.co/LiquidAI/d1-2B-MLX-8bit
- MLX-VLM (repositorio): https://github.com/Blaizzy/mlx-vlm
- API de Liquid AI: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- Documentación: https://docs.liquid.ai/lfm/getting-started/welcome
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Banner de Liquid AI: https://huggingface.co/LiquidAI/LFM3-1.7B/resolve/main/assets/liquid-ai-banner.webp
