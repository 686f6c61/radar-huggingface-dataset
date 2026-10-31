# LiquidAI/LFM3-1.7B-MLX-bf16

## Resumen

LFM3-1.7B-MLX-bf16 es la versión en formato MLX y precisión BF16 (sin cuantizar) del modelo LFM3-1.7B de Liquid AI, adaptada para su ejecución nativa en chips Apple Silicon (M1, M2, M3, M4). El modelo base, LFM3-1.7B, pertenece a la familia LFM (Liquid Foundation Models) de Liquid AI, caracterizada por arquitecturas basadas en unidades dinámicas lineales en lugar de transformers convencionales, orientadas a un despliegue eficiente en dispositivos de borde y portátiles.

Este repositorio resuelve un problema concreto: permitir a desarrolladores del ecosistema Apple (Swift, Python con MLX) ejecutar un modelo de lenguaje conversacional multilingüe directamente en Mac, sin necesidad de GPU dedicada ni servidor remoto. Con 1.728.801.536 parámetros y un tamaño de pesos de 3,46 GB, es suficientemente ligero para funcionar en la memoria unificada de prácticamente cualquier Mac moderno.

Su relevancia actual radica en la tendencia hacia la inferencia on-device: Liquid AI apuesta por modelos pequeños pero capaces, con soporte oficial de MLX y documentación de despliegue en dispositivo. Es una opción interesante para asistentes locales, prototipado y aplicaciones que requieren privacidad de datos, aunque el soporte en mlx-lm aún estaba en desarrollo en el momento de publicación de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM (Liquid Foundation Models); detalles en la model card del modelo base (no disponible en esta ficha) |
| Parametros totales | 1.728.801.536 (~1,73 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible en esta model card (el ejemplo de generación usa hasta 16.384 tokens de salida) |
| Tipos de cuantizacion | BF16 sin cuantizar (esta variante); el modelo base puede tener otras variantes |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | LFM1.0 (licencia propia "other" de Liquid AI) |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

Esta variante es una conversión a formato MLX en precisión BF16 del modelo base LiquidAI/LFM3-1.7B; la arquitectura subyacente es la de la familia LFM3 de Liquid AI. La model card de este repositorio remite explícitamente a la model card del modelo original para los detalles de arquitectura y uso, por lo que los datos específicos de la arquitectura (número de capas, dimensiones, mecanismos de atención) no están disponibles en la información proporcionada.

Tampoco se detallan en esta model card los datos de entrenamiento (número de tokens, composición del corpus) ni el proceso de alineación (RLHF, DPO). Lo que sí se indica es la relación con el modelo base (`base_model: LiquidAI/LFM3-1.7B`, relación `quantized`), es decir, se trata de un reempaquetado de pesos para el framework MLX de Apple, sin reentrenamiento ni modificación de los pesos originales, únicamente conversión de formato y precisión.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Soporte multilingüe en 16 idiomas, incluido el castellano, árabe, chino, japonés, coreano, hindi, ruso, polaco y lenguas del sudeste asiático.
- Ejecución nativa en Apple Silicon mediante MLX, con generación desde línea de comandos (`mlx_lm.generate`) o desde Python.
- Configuraciones de muestreo recomendadas según tarea: `--temp 0.1 --top-k 50` para uso general y `--temp 1.0 --top-p 0.95 --top-k 20` para matemáticas y ciencias.
- Generación de hasta 16.384 tokens de salida en el ejemplo documentado.
- No se documentan en esta model card capacidades de visión, audio, tool calling ni thinking mode.

## Casos de uso

- Asistente conversacional local en Mac: el modelo se ejecuta íntegramente en la memoria unificada de Apple Silicon, lo que permite construir chatbots que procesan datos de usuario sin enviarlos a servicios externos, ideal para entornos con requisitos de privacidad.
- Aplicaciones multilingües en dispositivo: con soporte de 16 idiomas, es adecuado para apps de escritorio que atienden usuarios en castellano, inglés, chino, japonés u otras lenguas cubiertas sin cambiar de modelo.
- Prototipado rápido de LLM en entornos Apple: la integración con mlx-lm permite probar prompts y pipelines de generación desde la terminal o Python sin infraestructura adicional.
- Generación de texto en tareas de matemáticas y ciencias: la model card recomienda parámetros de muestreo específicos (`--temp 1.0 --top-p 0.95 --top-k 20`) para estos dominios, señal de que se han ajustado para ese uso.
- Generaciones largas: el ejemplo documentado usa `--max-tokens 16384`, lo que lo hace apto para redacción de documentos extensos o resúmenes largos en local.
- Integración en apps nativas de macOS/iOS: el formato MLX está pensado para el ecosistema Apple, por lo que encaja en aplicaciones distribuidas que necesitan un LLM embebido sin dependencias de servidor.
- Edge AI y despliegue on-device: con 3,46 GB de pesos, cabe en la memoria unificada de portátiles Mac con 8 GB de RAM, útil para automatización local de tareas de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Para evaluaciones del modelo base, consultar la model card de LiquidAI/LFM3-1.7B y el blog de Liquid AI enlazados más abajo.

## Requisitos de hardware

- Los pesos ocupan 3,46 GB en BF16; para inferencia cómoda se recomienda disponer de al menos 6-8 GB de memoria unificada (el modelo está diseñado para Apple Silicon, no para GPU NVIDIA).
- Compatible con cualquier Mac con chip Apple Silicon (M1, M2, M3, M4) que disponga de memoria suficiente; no requiere GPU dedicada.
- No aplica a consumer GPU NVIDIA/AMD en este formato: MLX es exclusivo del ecosistema Apple. Para otras plataformas, usar el modelo base LiquidAI/LFM3-1.7B.
- Despliegue mediante el framework MLX y la librería mlx-lm:

```bash
pip install mlx-lm
mlx_lm.generate --model LiquidAI/LFM3-1.7B-MLX-bf16 \
  --prompt "What is the capital of Australia?" \
  --temp 0.1 --top-k 50 --max-tokens 16384
```

- Nota importante: en el momento de publicación de la model card, el soporte de LFM3 en mlx-lm estaba en desarrollo y pendiente de una versión estable; la model card se actualizará cuando haya una release compatible.
- En Python, la penalización por repetición no está disponible como flag de CLI; debe pasarse `make_logits_processors(repetition_penalty=1.1)` a la función `generate`.
- Latencia y throughput: no disponible (no se publican cifras de tokens/segundo).

## Comparativa con modelos similares

| Modelo | Parametros | Formato/plataforma | Idiomas | Licencia |
|---|---|---|---|---|
| LFM3-1.7B-MLX-bf16 (este modelo) | 1,73 B | MLX BF16, Apple Silicon | 16 | LFM1.0 (propietaria) |
| LFM3-1.7B (modelo base) | 1,73 B | Pesos originales, multiplataforma | 16 | LFM1.0 (propietaria) |
| Qwen3-1.7B | 1,7 B | safetensors/GGUF, multiplataforma | ~100 | Apache 2.0 |

Nota: los datos de Qwen3-1.7B se incluyen como referencia de categoría (modelo pequeño conversacional multilingüe); su rendimiento frente a LFM3-1.7B no está documentado en la información disponible. No hay más comparables publicados en los datos proporcionados.

## Limitaciones y advertencias

- Licencia LFM1.0: es una licencia propia ("other") de Liquid AI, no una licencia abierta estándar; conviene revisar las condiciones de uso comercial en el archivo LICENSE antes de desplegar en producción.
- Soporte en mlx-lm incompleto: en el momento de la model card, el soporte de LFM3 estaba en desarrollo, por lo que puede requerir instalar desde la rama de desarrollo o esperar una release oficial.
- Sin penalización de repetición desde la línea de comandos: hay que aplicarla programáticamente en Python, lo que puede afectar a la calidad de generaciones largas si no se configura.
- La model card no documenta benchmarks, contexto máximo, capacidades de tool calling ni riesgos de alucinación específicos: no disponible en la información proporcionada.
- Restringido al ecosistema Apple Silicon por el formato MLX; para despliegues en servidores Linux/GPU NVIDIA hay que usar el modelo base.
- Como todo modelo de lenguaje de pequeño tamaño, cabe esperar limitaciones en razonamiento complejo y riesgo de alucinación, aunque la magnitud concreta no está cuantificada en los datos disponibles.

## Enlaces

- Repositorio del modelo: https://huggingface.co/LiquidAI/LFM3-1.7B-MLX-bf16
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- API de Liquid AI: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- Documentación: https://docs.liquid.ai/lfm/getting-started/welcome
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Guía MLX de Liquid AI: https://docs.liquid.ai/deployment/on-device/mlx
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-lm
