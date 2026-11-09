# kataguru/Kataguru-Sceptic-35B-A3B-Georgian-v3.2-NVFP4

## Resumen

Kataguru-Sceptic-35B-A3B-Georgian-v3.2-NVFP4 es la variante cuantizada en NVFP4 del modelo Kataguru-Sceptic-35B-A3B-Georgian-v3.2, desarrollado por el usuario kataguru. Se trata de un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) con 35.951.822.704 parámetros totales y 3.000 millones de parámetros activos por token, construido sobre la base Kataguru-Sceptic-35B-A3B-v3.1. Su especialización principal es el georgiano (ქართული ენა), y cubre generación de texto, razonamiento, visión multimodal y traducción de página completa.

La innovación arquitectónica del modelo consiste en ampliar el MoE de la base desde 254 expertos hasta 256 por capa (40 capas): los expertos #0 a #253 permanecen congelados para preservar las capacidades originales de razonamiento científico, código y tool calling, mientras que se añaden dos expertos específicos de georgiano, uno dedicado a gramática, morfología y terminología técnica, y otro a literatura, no ficción y traducción bidireccional EN-KA. El modelo mantiene una ventana de contexto de 262.144 tokens y un codificador de visión de 27 capas.

Esta variante NVFP4 resulta relevante porque comprime el modelo hasta unos 20,7 GiB en disco (unos 19,4 GiB en vLLM con `--language-model-only`), lo que permite ejecutarlo en una única GPU de 24 GB. Está pensada para hardware Blackwell con soporte nativo de FP4 mediante `compressed-tensors`, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer con visión multimodal, tipo `qwen3_5_moe`; 40 capas, 256 expertos por capa, codificador de visión de 27 capas, cabeza especulativa MTP en la capa 40 |
| Parametros totales | 35.951.822.704 |
| Parametros activos | 3.000 millones por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (esta variante, `compressed-tensors`); el suite oficial incluye además BF16, W4A16-AWQ y GGUF (APEX-Small, APEX-Medium, APEX-Good) |
| Idiomas soportados | Inglés (en), georgiano (ka), finlandés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con cuantización NVFP4 (`compressed-tensors`); librería transformers |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 40 capas y 256 expertos por capa. La base v3.1 aporta 254 expertos congelados (#0 a #253) que se conservan íntegros para evitar el olvido catastrófico de las capacidades de razonamiento científico, programación competitiva, tool calling y automatización industrial PLC/CNC. Sobre esa base se añaden dos expertos: el experto #254, especializado en gramática georgiana (alineación de caso ergativo escindido kartveliano, screeves verbales polipersonales, circunfijos, escritura mkhedruli) y terminología técnica, clínica y legal; y el experto #255, orientado a prosa literaria, no ficción, diálogo natural y traducción fiel EN-KA y KA-EN.

El ajuste se realizó con un conjunto de 4.800 muestras doradas verificadas humanamente (100 % de aprobación en el control mecánico y de calidad) junto con calibración contrastiva del router (`--moe-mode new_experts_only --recalibrate-router`, con r=32 y alpha=64). Se incluye una plantilla de chat específica para georgiano (`chat_template.jinja`) con etiquetas de control `/ka` y `/translate`, y una calibración de cuantización dedicada al georgiano (`calib_nvfp4_awq_256_ka.jsonl` e `imatrix_calibration_ka.txt`). El modelo incorpora además una cabeza especulativa MTP (785 tensores) para decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento de nivel científico (física, química, biología molecular de posgrado).
- Programación algorítmica competitiva y generación de código.
- Tool calling nativo con AST `<tool_call>` y detección de irrelevancia.
- Razonamiento multimodal con visión: codificador de 27 capas y pipeline `image-text-to-text`.
- Traducción de página completa EN-KA y KA-EN con preservación de párrafos y modo sin charla (`/translate`).
- Capacidades multilingües en inglés, georgiano y finlandés.
- Modos de profundidad de razonamiento configurables: `{REASON:spoon}`, `{REASON:einstein}`, `{REASON:007}`, `{REASON:deep}`, `{REASON:low}`, `{REASON:off}`.
- Modo georgiano nativo mediante prefijo `/ka` o `chat_template_kwargs={"response_language": "ka"}`.
- Capacidades industriales heredadas de la base: PLC/CNC, medicina clínica y terminología legal/patentes.

## Casos de uso

- Traducción profesional EN-KA y KA-EN: el modo `/translate` produce traducción de página completa preservando párrafos y sin charla adicional, adecuado para documentación técnica, literatura y textos legales.
- Atención al cliente en georgiano: el experto #254 cubre morfología y registro formal, y la ventana de 262.144 tokens permite conversaciones multi-turno con contexto extenso.
- Procesamiento de documentos escaneados con visión: el pipeline `image-text-to-text` permite extraer y traducir texto de imágenes y páginas completas.
- Asistentes de código con tool calling: el soporte nativo de `<tool_call>` y BFCL V4 (83,67 % en AST) lo hace apto para integración en pipelines de agentes y CI/CD.
- Razonamiento científico y técnico: los expertos congelados conservan GPQA Diamond (70,20 %) para consultas de física, química y biología.
- Automatización industrial: la base incluye capacidades de PLC/CNC y terminología de ingeniería, útil para asistentes técnicos en entornos de fabricación.
- Despliegue en una única GPU de 24 GB: la cuantización NVFP4 permite servir el modelo en hardware Blackwell de gama consumer o profesional con una sola tarjeta.

## Benchmarks y rendimiento

| Benchmark | Puntuacion | Notas |
|---|---|---|
| Media de 15 benchmarks (base v3.1) | 70,26 % | Heredado intacto mediante expertos congelados #0-#253 |
| GPQA Diamond | 70,20 % (139/198) | Física, química y biología molecular de posgrado |
| LiveCodeBench v6 (Pass@1) | 39,43 % | Fácil: 90,70 % |
| BFCL V4 Single-Turn AST | 83,67 % | Non-Live: 88,44 %; detección de irrelevancia: 80,26 % |
| Auditoría georgiana en vivo 10/10 | 10/10 (100 %) | Suite de evaluación NLP georgiana y traducción literaria/técnica de página completa |

## Requisitos de hardware

- VRAM estimada: NVFP4 ocupa unos 20,7 GiB en disco y unos 19,4 GiB en vLLM con `--language-model-only`; BF16 completo requiere unos 72 GB.
- GPU recomendadas: una única GPU de 24 GB para NVFP4; 2x RTX 5090 de 32 GB (TP=2) o una GPU de 32 GB para NVFP4/W4A16-AWQ; 2x 48-80 GB para BF16.
- Cabe en GPU consumer: sí, en GPUs Blackwell de 24 GB con NVFP4; la variante GGUF APEX-Medium (~13,6 GiB) cabe en una GPU de 16 GB.
- Opciones de despliegue: vLLM (soporte `--language-model-only`), transformers, llama.cpp/Ollama mediante la variante GGUF, y AWQ para vLLM universal.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Georgian-v3.2-NVFP4 | 35,9B totales / 3B activos | 262.144 | GPQA 70,20 %; BFCL V4 83,67 %; LiveCodeBench 39,43 % | Apache 2.0 | Hugging Face |
| Kataguru-Sceptic-35B-A3B-v3.1 (base) | 35,9B totales / 3B activos | 262.144 | Media 15 benchmarks 70,26 % | Apache 2.0 | Hugging Face |
| Kataguru-Sceptic-35B-A3B-Georgian-v3.2 (BF16) | 35,9B totales / 3B activos | 262.144 | Mismos benchmarks que la variante NVFP4 | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de modelos de terceros comparables en la información proporcionada.

## Limitaciones y advertencias

- En ficción creativa con temperatura alta puede perder precisión morfológica; el autor recomienda `temperature=0.2-0.3` con `presence_penalty=0.3` para corrección y revisión en georgiano.
- El footprint BF16 completo (~72 GB) exige hardware de gama alta; la variante NVFP4 está limitada a hardware Blackwell con soporte FP4.
- Riesgo de alucinación inherente a los modelos de lenguaje, no cuantificado en la información disponible.
- El alcance lingüístico se limita a inglés, georgiano y finlandés; el rendimiento en otros idiomas no está documentado.
- La licencia Apache 2.0 permite uso comercial, pero no se detallan restricciones adicionales sobre los datos de entrenamiento.
- La variante NVFP4 depende de `compressed-tensors` y de kernels específicos de Blackwell; en hardware no Blackwell puede no ser desplegable.

## Enlaces

- Hugging Face: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Georgian-v3.2-NVFP4
- Pesos maestros BF16: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Georgian-v3.2
- Variante W4A16-AWQ: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Georgian-v3.2-W4A16-AWQ
- Variante GGUF: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Georgian-v3.2-GGUF
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
