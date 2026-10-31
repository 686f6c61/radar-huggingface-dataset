# alexwengg/LFM3-1.7B-Base-MLX-5bit

## Resumen

LFM3-1.7B-Base-MLX-5bit es una conversión no oficial para Apple Silicon (MLX) del modelo base LFM3-1.7B de Liquid AI, realizada por el usuario alexwengg. Se trata de una versión cuantizada a 5 bits del checkpoint preentrenado (no ajustado a instrucciones) de la familia LFM3, pensada para ejecutarse de forma eficiente en Mac con chips Apple Silicon mediante el framework MLX. El repo pesa 1,2 GB y contiene 1.728.801.536 parámetros en formato safetensors.

El modelo original, LiquidAI/LFM3-1.7B-Base, es un modelo de generación de texto de 1,7B parámetros de la tercera generación de arquitecturas LFM (Liquid Foundation Models) de Liquid AI. Liquid AI publica builds MLX oficiales del modelo instruct, pero no del modelo base, lo que motiva esta conversión comunitaria. Al ser un modelo base, es adecuado para completion, prompting few-shot, scoring y fine-tuning, no para seguir instrucciones de chat.

Es relevante porque permite ejecutar un modelo compacto y multilingüe (16 idiomas, incluido castellano) localmente en hardware Apple, con rendimiento medido de hasta 178 tokens/s en decodificación y solo 2,13 GB de memoria pico en contexto de 2048 tokens. La licencia es LFM Open License v1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (Liquid Foundation Models, 3ª generación); detalles adicionales no disponibles |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | hasta 262.144 tokens según la arquitectura (solo se han probado contextos de ~2.000 tokens) |
| Tipos de cuantizacion | 5 bits afín, tamaño de grupo 64, en todas las capas Lineales y en el embedding/LM head atado (`all:5/64`); existe una build hermana mixed-5-6-8 |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | LFM Open License v1.0 (lfm1.0, tipo "other") |
| Formato de pesos | safetensors (cuantizado MLX, 1,189 GB en `model.safetensors`) |

## Arquitectura y entrenamiento

El modelo deriva de LiquidAI/LFM3-1.7B-Base, un checkpoint preentrenado de la familia LFM3 de Liquid AI. La model card no detalla la arquitectura interna concreta (transformer híbrido, convoluciones, etc.), aunque la presencia de un archivo `lfm3_conv.py` en el código remoto sugiere componentes convolucionales propios de las arquitecturas LFM. La conversión a MLX se realizó con mlx-vlm (`main`, commit `230fc308`) y MLX 0.32.4 a partir del checkpoint bf16 (revisión `545fc8f4`), aplicando cuantización afín de 5 bits con grupo 64 a todas las capas Lineales y al embedding atado con el LM head, según la receta `lfm3_quant_recipe.json` (`all:5/64`).

No hay información disponible sobre el número de tokens de preentrenamiento, la composición del dataset ni procesos de RLHF/DPO (al ser un modelo base, no pasa por alineación con instrucciones). La validación de la conversión se hizo comparando contra referencias float32 del checkpoint original: coincidencia de top-1 en posición final del 88 % en 25 prompts golden, KL de 0,0305 nats, y una perplejidad en Wikitext-2 un 1,36 % superior a la referencia fp32 (fp32: 10,588).

## Capacidades

- Generación de texto en modo completion (continuación de texto plano), al ser un modelo base preentrenado.
- Prompting few-shot y evaluación de probabilidades (scoring) de secuencias.
- Base apta para fine-tuning posterior (SFT, LoRA, etc.).
- Soporte multilingüe en 16 idiomas, incluido castellano, inglés, chino, japonés, árabe, hindi y ruso.
- El modelo original incluye plantilla de chat y soporte de tool-call en sus datos (los goldens de validación incluyeron prompts de chat y tool-call), pero al ser base no está ajustado para seguir instrucciones ni detenerse de forma autónoma.
- No hay información disponible sobre capacidades de visión, audio, agentes ni razonamiento multi-paso para esta build.

## Casos de uso

- Completion y autocompletado de texto en local: al ser un modelo base, es idóneo para continuar texto plano con la API de Python de mlx-vlm, evitando la plantilla de chat que aplica el CLI.
- Experimentación y prototipado en Apple Silicon: con 2,13 GB de memoria pico en contexto de 2048 tokens y 173 tok/s, cabe en cualquier Mac con suficiente RAM unificada sin GPU dedicada.
- Fine-tuning de dominio: el checkpoint base cuantizado sirve como punto de partida para ajustes posteriores en tareas específicas antes de cuantizar la versión afinada.
- Evaluación de probabilidades y scoring: útil para tareas de clasificación por perplejidad, filtrado de datos o destilación, aprovechando el acceso a distribuciones de siguiente token.
- Aplicaciones multilingües ligeras: soporte de 16 idiomas permite pruebas de generación en castellano y otros idiomas en dispositivos Apple sin conexión.
- Benchmarking de cuantización: la model card publica métricas de fidelidad (KL, agreement, perplejidad) comparando 5-bit, mixed-5-6-8 y bf16, útil como referencia para estudiar el impacto de la cuantización en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se publicaron métricas de fidelidad de la cuantización y de velocidad:

| build | goldens (25): top-1 final | goldens (25): KL final | wikitext-2 KL | PPL wikitext-2 vs fp32 |
|---|---|---|---|---|
| bf16 (sin cuantizar, referencia) | 1,00 | 0,0005 | 0,0005 | +0,05 % |
| **5-bit (este repo)** | 0,88 | 0,0305 | 0,0146 | +1,36 % |
| mixed-5-6-8 | 0,92 | 0,0182 | 0,0078 | +0,75 % |

Rendimiento en Apple M5 Pro (24 GB), MLX 0.32.4, decodificación greedy, mediana de 3 ejecuciones:

| build | decode tok/s (512 ctx) | decode tok/s (2048 ctx) | prefill tok/s (prompt de 2048) | TTFT (prompt 2048) | memoria pico (2048 ctx) |
|---|---|---|---|---|---|
| **5-bit** | 178 | 173 | 6.300 | 327 ms | 2,13 GB |
| mixed-5-6-8 | 166 | 164 | 6.220 | 331 ms | 2,23 GB |

En una ejecución sostenida de 60 segundos con muestreo a temperatura 0,8, esta build produjo 9.772-9.952 tokens, es decir, 163-166 tok/s de media, con pico de 174 tok/s y 1,3 GB de memoria.

## Requisitos de hardware

- Memoria estimada: 1,189 GB de pesos; memoria pico medida de 2,13 GB en contexto de 2048 tokens y 1,3 GB en escritura sostenida.
- Diseñado para Apple Silicon: medido en Apple M5 Pro (24 GB) con macOS 27.0 y MLX 0.32.4; las velocidades en otros chips Apple diferirán.
- No requiere GPU NVIDIA al usar MLX; no hay datos de ejecución en CUDA.
- Cabe con holgura en cualquier Mac de gama media o superior (portátiles base con 8-16 GB de RAM unificada incluidos, según la memoria pico medida).
- Despliegue: mlx-vlm (versión `main` de GitHub, ninguna release soporta LFM3 aún a octubre de 2026); mlx-lm solo mediante el PR no fusionado [ml-explore/mlx-lm#2016](https://github.com/ml-explore/mlx-lm/pull/2016). No hay información sobre vLLM, llama.cpp, Ollama o TGI para esta build.
- Latencia: time to first token de 327 ms con prompt de 2048 tokens; throughput de 173-178 tok/s en decodificación greedy.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alexwengg/LFM3-1.7B-Base-MLX-5bit (este) | 1,73B | 5-bit afín, grupo 64 | hasta 262.144 (arquitectura) | LFM Open License v1.0 | MLX, conversión comunitaria |
| alexwengg/LFM3-1.7B-Base-MLX-mixed-5-6-8 (build hermana) | 1,73B | mixta 5-6-8 bits | hasta 262.144 (arquitectura) | LFM Open License v1.0 | MLX, conversión comunitaria; mayor fidelidad (KL 0,0182), algo más lenta (166 tok/s) |
| LiquidAI/LFM3-1.7B-Base | 1,73B | bf16 (sin cuantizar) | hasta 262.144 (arquitectura) | LFM Open License v1.0 | Checkpoint original, sin build MLX oficial del base |
| LiquidAI/LFM3-1.7B-MLX-5bit | 1,73B | 5-bit (build oficial) | no disponible | LFM Open License v1.0 | MLX oficial, pero versión instruct, no base |

## Limitaciones y advertencias

- Es un modelo base, no instruct: no está ajustado para seguir instrucciones de chat ni para detenerse de forma autónoma; el CLI de mlx-vlm aplica plantilla de chat, lo que no le conviene (usar la API de Python para completion en crudo).
- La cuantización de 5 bits desplaza la distribución de siguiente token: top-1 agreement del 88 % frente a fp32 y KL de 0,0305 nats; las continuaciones greedy divergen de fp32 tras unas decenas de tokens de media, como ocurre en cualquier build de 5-6 bits.
- La validación se limitó a texto en inglés, prompts cortos de chat/tool-call y Wikitext-2, con contextos de hasta unos 2.000 tokens, aunque la arquitectura soporta 262.144; el comportamiento en contexto largo y en otros idiomas no está evaluado en esta build.
- Las velocidades se midieron en una única máquina (M5 Pro); otros chips Apple darán resultados distintos.
- Cargar la configuración vía `AutoConfig` de transformers puede pedir confiar en código remoto (`auto_map` de Liquid), aunque MLX no ejecuta ese código.
- Licencia LFM Open License v1.0: hay que revisar sus términos para uso comercial; no se describen en la información disponible.
- Riesgo de alucinación, sesgos y calidad por idioma: no hay datos publicados para esta build; al ser un modelo base sin alineación, puede generar contenido sin filtros ni formato conversacional.
- Soporte de software aún inmaduro: mlx-lm requiere un PR no fusionado y ninguna release de mlx-vlm/mlx-lm soporta LFM3 de forma oficial a octubre de 2026.

## Enlaces

- Ficha del modelo: https://huggingface.co/alexwengg/LFM3-1.7B-Base-MLX-5bit
- Modelo base original: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Build MLX oficial del modelo instruct (Liquid AI): https://huggingface.co/LiquidAI/LFM3-1.7B-MLX-5bit
- Build hermana mixed-5-6-8: https://huggingface.co/alexwengg/LFM3-1.7B-Base-MLX-mixed-5-6-8
- mlx-vlm (herramienta de conversión y ejecución): https://github.com/Blaizzy/mlx-vlm
- PR de soporte en mlx-lm: https://github.com/ml-explore/mlx-lm/pull/2016
