# litert-community/Mage-VL

## Resumen

Mage-VL es un modelo de visión-lenguaje (VLM) de 4,7B parámetros desarrollado originalmente por Microsoft, que combina un encoder visual ViT de 24 capas con un decodificador de lenguaje Qwen3-4B. El repositorio `litert-community/Mage-VL` ofrece una conversión de ese modelo al formato `.litertlm` de LiteRT-LM, el runtime de inferencia on-device de Google AI Edge, lo que permite ejecutar inferencia multimodal imagen+texto íntegramente en dispositivos móviles y de escritorio sin conexión a la nube.

La relevancia de esta conversión radica en que es la primera versión de Mage-VL disponible en formato LiteRT-LM y en que demuestra un rendimiento práctico en hardware de consumo: aproximadamente 10 tokens/s de decodificación en un iPhone 17 Pro con un pico de memoria de ~1,5 GiB, y hasta 80 tokens/s en GPU Metal sobre un Apple M4 Max. El bundle ocupa ~2,81 GB y está cuantizado de forma agresiva (int8 en visión y adaptador, int4 en el decodificador).

El modelo está pensado para tareas de descripción general de imágenes y, especialmente, de lectura de documentos (OCR) en el dispositivo. La licencia Apache-2.0 del modelo base facilita su integración en productos comerciales, y el soporte de backends CPU y GPU en Android, macOS, Linux y Windows amplía su aplicabilidad más allá del móvil.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLM: ViT de 24 capas (encoder visual) + Qwen3-4B (decodificador de lenguaje, transformer denso con GQA) |
| Parámetros totales | 4,7B (modelo base) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (KV cache del bundle LiteRT-LM) |
| Tipos de cuantización | Visión: int8; adaptador PatchMerger: int8; decodificador: int4 (simétrico, blockwise-128 + OCTAV); embedder externo: int8 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en formato original de Microsoft |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura típica de VLM con dos torres: un encoder visual ViT de 24 capas con dimensión 1024, atención completa y embeddings posicionales rotatorios 3-D, que en este bundle se reescribe de forma estática a 448×448 píxeles, generando 784 parches que tras un merge 2×2 se reducen a 196 tokens de imagen. Un adaptador PatchMerger (LayerNorm → agrupación 2×2 → MLP) proyecta esas representaciones al tamaño oculto del texto (2560). El decodificador es Qwen3-4B: 36 capas, hidden size 2560, GQA con 8 cabezas KV, y usa posiciones secuenciales 1-D nativas (sin M-RoPE), lo que el runtime `fast_vlm` de LiteRT-LM reproduce de forma matemáticamente idéntica al modelo original.

La conversión incluye varias decisiones técnicas destacables: el encoder visual se verificó con correlación 1.0 en fp32 y 0.994 en int8 frente a la implementación de referencia, sin operaciones FLEX/CUSTOM, y el pipeline de parches es bit-idéntico al procesador de imágenes original (diferencia máxima 2.4e-7). El decodificador se re-aloja como `Qwen3ForCausalLM` independiente con state-dict 1:1 y se cuantiza con la receta blockwise-128 + OCTAV int4 empleada en los LLM Qwen3-4B ya publicados. No se dispone de información sobre el dataset de entrenamiento, el número de tokens o si hubo RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de texto e inferencia multimodal imagen+texto (image-text-to-text).
- Descripción general de imágenes con nivel de detalle alto (escenas, objetos, composición).
- Lectura de documentos y OCR: transcripción de texto en imágenes, incluidos números, correos y teléfonos.
- Respuesta a preguntas visuales (VQA) sobre una imagen adjunta.
- Conversaciones multi-turno con imágenes: cada imagen se envía en su propio mensaje; los turnos de seguimiento solo texto tienen TTFT de ~2 s en móvil.
- Soporte de múltiples imágenes mediante adjuntos repetidos en la CLI (`--attachment` varias veces), aunque el uso de varias imágenes en una misma conversación no está probado.
- Ejecución on-device con API local compatible con OpenAI mediante `litert-lm serve`.
- No se documenta soporte de tool calling, function calling, agentes, audio ni modo thinking en la información disponible.

## Casos de uso

- **Atención al cliente con comprensión de imágenes**: el modelo puede recibir capturas de pantalla, fotos de productos o documentos enviados por el usuario y responder preguntas sobre ellos, con contexto de 2048 tokens suficiente para conversaciones de soporte de varios turnos.
- **Digitalización de documentos en movilidad**: OCR on-device verificado con transcripción perfecta de una página de informe sintética a 448×448; útil para escanear facturas, albaranes o informes sin enviar datos a la nube.
- **Accesibilidad para personas con discapacidad visual**: descripción de escenas en tiempo real desde la cámara del móvil, con ~10 tok/s en iPhone 17 Pro y un pico de ~1,5 GiB que cabe en memoria de dispositivo.
- **Asistentes de campo sin conectividad**: aplicaciones de inspección, agricultura o mantenimiento que necesitan describir imágenes in situ en entornos sin red, ejecutando el bundle en Android (backend GPU, 820 MB de pico en Galaxy S26) o en portátiles macOS/Linux/Windows.
- **Moderación y etiquetado de imágenes en el borde**: clasificación y descripción automática de contenido visual en el propio dispositivo, evitando el coste y la latencia de subir imágenes a un servidor.
- **Prototipado rápido de apps VLM**: integración en una app de escritorio o móvil mediante `litert-lm run` o `litert-lm serve` (API compatible con OpenAI) para validar flujos de imagen+texto antes de invertir en infraestructura.
- **Procesamiento por lotes en portátil**: con 80 tok/s de decodificación y 740 tok/s de prefill en GPU Metal de un M4 Max, es viable procesar lotes moderados de imágenes para generar descripciones o extraer texto.

## Benchmarks y rendimiento

| Plataforma | Backend | Prefill (256) | Decode | TTFT | Pico de memoria |
|---|---|---|---|---|---|
| iPhone 17 Pro | CPU | no disponible | ~10 tok/s | 7,5–9 s (incluye encode visual + prefill) | ~1,5 GiB (1,47 GiB medido) |
| Apple M4 Max (macOS) | CPU | 65 tok/s | 23,0 tok/s | 4,11 s | no disponible |
| Apple M4 Max (macOS) | GPU (Metal) | 740 tok/s | 80,0 tok/s | 0,37 s | no disponible |
| macOS Apple Silicon (LiteRT-LM CPU) | CPU | no disponible | ~66 tok/s | ~2 s | no disponible |
| Samsung Galaxy S26 | GPU (LiteRT GPU) | no disponible | no disponible | no disponible | 820 MB |

Otras métricas publicadas: inicialización del motor de 0,8 s en caliente y ~3–4 s en la primera ejecución en iPhone 17 Pro; 2,8 s de init en la compilación de contexto 2048; delegación GPU de 6618/6618 operaciones en 4 subgrafos en el Galaxy S26. En la puerta de cordura de escritorio con 8 preguntas el decodificador obtuvo 7/8 sin degeneración. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- **VRAM/memoria estimada**: ~1,5 GiB de pico en iPhone 17 Pro durante la descripción de una foto; 820 MB de pico en Galaxy S26 con backend GPU. El fichero del bundle ocupa ~2,81 GB en disco (repo de 16,9 GB con artefactos adicionales).
- **GPU recomendadas**: Apple Silicon (M4 Max verificado, GPU Metal); GPU integrada de Android vía LiteRT GPU; no se documentan requisitos para A100, H100 o RTX 4090, ya que el objetivo es el borde.
- **¿Cabe en GPU de consumo?**: sí, el diseño está orientado a móvil y portátil; verificado en iPhone 17 Pro, Samsung Galaxy S26 y Apple M4 Max. No hay datos para GPUs discretas de sobremesa.
- **Opciones de despliegue**: runtime LiteRT-LM (`pip install litert-lm`), CLI `litert-lm run`, servidor local compatible con OpenAI `litert-lm serve`, herramienta `litert-lm benchmark` y app Google AI Edge Gallery para Android. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: decodificación de ~10 tok/s en iPhone 17 Pro (CPU) y 80 tok/s en M4 Max (GPU Metal); TTFT de 7,5–9 s con imagen en móvil y 0,37 s en GPU de escritorio; turnos de seguimiento solo texto con ~2 s de TTFT en el teléfono.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato on-device | Licencia | Notas |
|---|---|---|---|---|---|
| litert-community/Mage-VL | 4,7B | 2048 | LiteRT-LM (`.litertlm`) | Apache-2.0 | ViT 24L + Qwen3-4B; int4/int8; OCR verificado |
| Qwen2-VL (bundles LiteRT-LM de la familia) | no disponible | no disponible | LiteRT-LM | no disponible | Usa M-RoPE; el bundle presenta la limitación de ranking con tabla 2-D que Mage-VL evita |
| microsoft/Mage-VL (modelo base) | 4,7B | no disponible | Pesos originales (no LiteRT) | Apache-2.0 | Incluye pipeline de vídeo con compresión de frames por códec neuronal, ausente en el bundle |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- **Solo imágenes**: el pipeline de vídeo del modelo base (compresión de frames con códec neuronal) no está incluido; el bundle maneja imágenes individuales.
- **Múltiples imágenes sin probar**: se pueden adjuntar varias imágenes, pero el comportamiento con varias imágenes en una misma conversación no está validado.
- **Contexto limitado a 2048 tokens**: suficiente para VQA y documentos cortos, pero restrictivo para documentos extensos o conversaciones largas.
- **Resolución fija 448×448**: el encoder se reescribe de forma estática; textos muy pequeños o documentos de alta densidad pueden perder detalle, aunque el OCR se verificó con transcripción perfecta en una página sintética.
- **Riesgo de alucinación**: no se documentan evaluaciones de fidelidad factual ni tasas de alucinación; como todo VLM, puede generar descripciones plausibles pero incorrectas.
- **Sesgos**: no se dispone de información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento.
- **Idiomas**: no se especifican los idiomas soportados; el decodificador Qwen3-4B tiene capacidades multilingües, pero no están validadas en esta conversión.
- **Licencia**: Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base `microsoft/Mage-VL` y del runtime LiteRT-LM.
- **Madurez**: repositorio con pocas descargas (276) y likes (4); las cifras de rendimiento provienen de pruebas del autor y deben replicarse en el hardware objetivo antes de producción.
- **Sin soporte documentado** de tool calling, agentes o modo thinking en esta conversión.

## Enlaces

- [litert-community/Mage-VL en Hugging Face](https://huggingface.co/litert-community/Mage-VL)
- [Árbol de ficheros del repositorio](https://huggingface.co/litert-community/Mage-VL/tree/main)
- [Modelo base microsoft/Mage-VL](https://huggingface.co/microsoft/Mage-VL)
- [Runtime LiteRT-LM (Google AI Edge)](https://github.com/google-ai-edge/litert-lm)
- [Imagen de ejemplo COCO](https://huggingface.co/huggingface/documentation-images)
