# LiquidAI/LFM3-VL-2B-MLX-8bit

## Resumen

LFM3-VL-2B-MLX-8bit es una versión cuantizada a 8 bits, optimizada para Apple Silicon mediante el framework MLX, del modelo multimodal LFM3-VL-2B desarrollado por Liquid AI. Se trata de un modelo de visión-lenguaje (image-text-to-text) compacto, con aproximadamente 1.918 millones de parámetros, capaz de comprender imágenes y generar texto conversacional a partir de ellas. Su relevancia radica en la combinación de un tamaño muy reducido con soporte multilingüe amplio (16 idiomas, incluido el castellano), lo que lo hace idóneo para ejecución local en dispositivos Mac con chips M1/M2/M3/M4 sin necesidad de GPU dedicada.

El repositorio ocupa 2,22 GB y utiliza cuantización afín de 8 bits con grupos de 64, un compromiso que conserva buena parte de la calidad del modelo original reduciendo a la mitad el consumo de memoria respecto a la versión en 16 bits. Liquid AI lo posiciona dentro de su familia LFM (Liquid Foundation Models), una línea de modelos con arquitecturas propias no basadas exclusivamente en el transformer clásico. El soporte en MLX-VLM está todavía en progreso, por lo que conviene verificar la versión de la librería antes de desplegarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM (Liquid Foundation Models), multimodal visión-lenguaje; detalle completo no disponible en esta ficha |
| Parametros totales | 1.918.181.888 (~1,92 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit afín con grupos de 64 (MLX) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | LFM Open License v1.0 (lfm1.0, licencia personalizada "other") |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

Este repositorio es una cuantización del modelo base LiquidAI/LFM3-VL-2B, no un modelo entrenado desde cero. Los pesos originales se han convertido al formato MLX y cuantizado a 8 bits mediante cuantización afín por grupos de 64, lo que reduce el tamaño de los pesos a 2,22 GB. La familia LFM3 de Liquid AI se caracteriza por arquitecturas propias (LFM) que, según la documentación del fabricante, difieren del transformer decoder clásico, aunque los detalles concretos de la variante VL-2B (tipo de capa, mecanismo de atención, proyección visual) deben consultarse en la model card del modelo base.

No se dispone en la información proporcionada de datos sobre el corpus de entrenamiento, número de tokens procesados ni técnicas de alineación (RLHF, DPO). Para esos detalles debe consultarse la ficha del modelo original y el blog de la familia LFM3 enlazados al final de esta ficha.

## Capacidades

- Comprensión de imágenes y generación de texto descriptivo (pipeline image-text-to-text): describe, analiza y responde preguntas sobre imágenes.
- Conversación multimodal: admite entradas combinadas de imagen y texto en formato conversacional.
- Soporte multilingüe en 16 idiomas, entre ellos castellano, inglés, chino, japonés, coreano, árabe, hindi y ruso.
- Generación de hasta 16.384 tokens de salida en el ejemplo de uso oficial (max-tokens 16384).
- Ejecución local optimizada para Apple Silicon mediante MLX, sin requerir GPU de NVIDIA.
- No hay información en la ficha sobre tool calling, capacidades de agente, audio ni modo de razonamiento extendido.

## Casos de uso

- Descripción automática de imágenes en apps iOS/macOS: al ser un modelo MLX de 2,22 GB, puede integrarse en aplicaciones nativas de Apple para generar alt-text accesible de fotografías sin enviar datos a la nube.
- OCR y extracción de información de documentos en local: permite preguntar al modelo por campos concretos de capturas, facturas o formularios manteniendo la privacidad de los datos en el dispositivo.
- Asistente visual multilingüe: dado su soporte de 16 idiomas, puede responder preguntas sobre imágenes en castellano u otros idiomas para apps dirigidas a usuarios internacionales.
- Moderación y etiquetado de contenido visual: clasificación y descripción de imágenes cargadas por usuarios en flujos de trabajo donde la latencia local prima sobre el máximo rendimiento.
- Prototipado rápido de agentes multimodales en Mac: su bajo consumo de memoria permite experimentar con pipelines visión-lenguaje en un portátil sin coste de infraestructura GPU.
- Accesibilidad: generación de descripciones detalladas de imágenes en tiempo real para usuarios con discapacidad visual en aplicaciones de escritorio Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Para evaluaciones del modelo base, consulte la ficha de LiquidAI/LFM3-VL-2B y el blog oficial de LFM3.

## Requisitos de hardware

- Memoria unificada necesaria: aproximadamente 2,22 GB solo para los pesos; con overhead de KV cache y activaciones, se recomienda disponer de al menos 4-6 GB de memoria unificada libre.
- Hardware objetivo: cualquier Mac con Apple Silicon (M1, M2, M3 o M4). Cabe con holgura en portátiles MacBook Air de 8 GB, aunque con más memoria mejorará la longitud de generación útil.
- No requiere GPU dedicada ni NVIDIA; la inferencia se ejecuta sobre la GPU integrada de Apple Silicon mediante MLX.
- Despliegue: MLX y MLX-VLM (soporte en progreso según la model card; verificar la versión de mlx-vlm que incorpore LFM3-VL). No hay mención de compatibilidad con vLLM, llama.cpp, Ollama o TGI para esta variante MLX.
- Comando de generación oficial:

```bash
python -m mlx_vlm.generate --model LiquidAI/LFM3-VL-2B-MLX-8bit \
  --image <IMAGE PATH> --prompt "Describe this image." \
  --temperature 0.1 --top-p 1.0 --top-k 50 --min-p 0.0 --repetition-penalty 1.1 \
  --max-tokens 16384
```

- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato/plataforma | Pipeline | Licencia |
|---|---|---|---|---|
| LFM3-VL-2B-MLX-8bit (este) | ~1,92 B (8-bit, 2,22 GB) | MLX, Apple Silicon | image-text-to-text | lfm1.0 (custom) |
| Qwen2.5-VL-3B-Instruct | ~3 B | safetensors, GGUF; multiplataforma | image-text-to-text | Apache 2.0 / Qwen |
| SmolVLM2-2.2B-Instruct | ~2,2 B | safetensors, GGUF; multiplataforma | image-text-to-text | Apache 2.0 |

Nota: la comparativa se ofrece a título orientativo por categoría y tamaño; los datos de rendimiento de los modelos alternativos no se incluyen porque no constan en la informacion disponible para este repositorio.

## Limitaciones y advertencias

- Licencia personalizada (lfm1.0, "other"): no es una licencia estándar tipo Apache o MIT; revise los términos del archivo LICENSE antes de cualquier uso comercial, ya que puede incluir restricciones de uso, registro o condiciones específicas de Liquid AI.
- El soporte en MLX-VLM está en progreso: la model card indica que se actualizará cuando una release lo soporte, por lo que el comando de ejemplo puede fallar con versiones actuales de la librería.
- Longitud de contexto no especificada en esta ficha; consulte la model card del modelo base antes de planificar cargas con imágenes grandes o conversaciones largas.
- Al ser una cuantización a 8 bits, puede haber una ligera degradación de calidad respecto al modelo base en 16 bits, especialmente en tareas visuales finas.
- Riesgo de alucinación en descripciones de imágenes, como es habitual en modelos visión-lenguaje pequeños; se recomienda temperatura baja (el ejemplo oficial usa 0,1) y penalización de repetición.
- Sesgos conocidos: no disponible; no se documentan auditorías de sesgo en la información proporcionada.
- Uso en producción: al depender de MLX, el despliegue queda restringido a hardware Apple; no es adecuado para servidores Linux con GPU NVIDIA en esta variante.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LiquidAI/LFM3-VL-2B-MLX-8bit
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Blog de la familia LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Guía de despliegue con MLX: https://docs.liquid.ai/deployment/on-device/mlx
- Playground de Liquid AI: https://playground.liquid.ai/
- Consola/API de Liquid AI: https://console.liquid.ai/dashboard
- MLX-VLM (repositorio): https://github.com/Blaizzy/mlx-vlm
- Licencia: https://huggingface.co/LiquidAI/LFM3-VL-2B-MLX-8bit/blob/main/LICENSE
