# saidutta69/LFM2.5-1.2B-Instruct-heretic

## Resumen

LFM2.5-1.2B-Instruct-heretic es una variante "decensored" del modelo LiquidAI/LFM2.5-1.2B-Instruct, publicada por el usuario saidutta69 bajo el seudonimo RACER IS OP. Se ha generado mediante abliteracion (ablación direccional) con la herramienta Heretic v1.4.0, que identifica y edita las direcciones de pesos responsables del comportamiento de rechazo en las proyecciones de salida de atención (`attn.o_proj`) y de bajada del MLP (`mlp.down_proj`), sin reentrenar el modelo. El resultado es un modelo de 1.170.340.608 parámetros (1,17B) que conserva el formato nativo de tool calling, el seguimiento de instrucciones y la cobertura multilingüe del original, pero reduce los rechazos de 98/100 a 2/100 en el conjunto de evaluación del autor.

El modelo base emplea la arquitectura híbrida de Liquid AI (convolución + atención) denominada `lfm2`, pensada para ejecución en dispositivo (edge). Según la model card, alcanza 86,2 en IFEval y 49,1 en BFCLv3, y decodifica a 239 tok/s en CPU AMD y 82 tok/s en NPU Snapdragon Gen4, con un footprint de runtime de 0,9 GB en Snapdragon X Elite con 32K de contexto. Estas cifras lo sitúan en una categoría poco habitual: calidad agéntica razonable en menos de 1 GB de pesos.

La relevancia actual del modelo reside en su orientación a agentes locales, asistentes on-device, RAG y extracción estructurada en entornos con recursos muy limitados (móvil, Raspberry Pi 5, navegador). No obstante, al tratarse de una edición por abliteración con divergencia KL de 0,0657, presenta cierta deriva en la formulación respecto al original, y su licencia heredada (lfm-license-1.0) impone restricciones que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido conv+attention (`lfm2`), 16 capas (10 de convolución) |
| Parametros totales | 1.170.340.608 (1,17B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (32K, según medición de Liquid en NPU) |
| Tipos de cuantizacion | GGUF: F16, Q2_K, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_0, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; safetensors en BF16 |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es |
| Licencia | lfm-license-1.0 (etiquetada como "other") |
| Formato de pesos | safetensors (BF16) y GGUF |

## Arquitectura y entrenamiento

El modelo base LFM2.5-1.2B-Instruct es un transformer híbrido de Liquid AI que combina bloques de convolución y de atención: de sus 16 capas, 10 son bloques convolucionales de bajo coste computacional. Esta proporción hace que la inferencia esté limitada por ancho de banda de memoria (decode-bandwidth-bound) más que por cómputo bruto, lo que explica su velocidad en CPU y NPU. El modelo es denso (no MoE) y tiene 1,17B parámetros en BF16.

Sobre el entrenamiento original no se aportan detalles en la información disponible (número de tokens, composición del dataset, uso de RLHF/DPO): no disponible. La intervención de esta variante es una abliteración con Heretic v1.4.0 (ensayo 135 de 200, semilla `3181001368`), que localiza una dirección de rechazo (`direction_index` 10.60) y aplica ediciones de pesos en `attn.o_proj` (max_weight 1.42 en posición 9.08; min_weight 1.26 a distancia 8.88) y `mlp.down_proj` (max_weight 1.25 en posición 12.88; min_weight 1.10 a distancia 7.17). El repositorio incluye un directorio `reproduce/` con `config.toml`, `requirements.txt`, el journal del estudio Optuna y sumas SHA-256 para regenerar el modelo bit a bit mediante `heretic --reproduce reproduce/reproduce.json`.

## Capacidades

- Generación de texto conversacional con seguimiento de instrucciones (86,2 en IFEval según la model card).
- Tool calling / function calling en el formato Pythonic nativo de Liquid, con 49,1 en BFCLv3.
- Razonamiento agéntico multi-paso y uso en pipelines de agentes locales.
- Capacidades multilingües en ocho idiomas: inglés, árabe, chino, francés, alemán, japonés, coreano y español.
- Extracción estructurada de información y RAG en contextos de hasta 32K tokens.
- Uso orientado a roleplay y conversación sin rechazos (2/100 en el set de evaluación del autor).
- Ejecución on-device en CPU, NPU (Snapdragon) y navegador mediante cuantizaciones GGUF.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito: no disponible.

## Casos de uso

- Asistentes on-device en móvil: con Q4_K_M (~0,68 GB) el modelo cabe en un teléfono con 4 GB de RAM y decodifica a 82 tok/s en NPU Snapdragon Gen4, lo que permite un asistente conversacional local sin conexión.
- Agentes locales con tool calling: el formato Pythonic nativo y su puntuación BFCLv3 permiten construir agentes que invocan funciones (calendario, ficheros, APIs locales) en un portátil sin GPU.
- RAG en dispositivos con recursos limitados: la ventana de 32K tokens y su bajo footprint permiten indexar y consultar documentación local en una Raspberry Pi 5 con Q4_K_M.
- Extracción estructurada en pipelines de datos: para clasificar y extraer campos de textos en ocho idiomas en servidores multi-tenant con Q5_K_M (~0,79 GB), reduciendo coste por instancia.
- Prototipado rápido de aplicaciones conversacionales: carga nativa en llama.cpp, LM Studio y Jan, además de MLX, vLLM y SGLang, lo que simplifica la experimentación sin infraestructura GPU.
- Roleplay y generación creativa sin filtros: la reducción de rechazos a 2/100 lo hace adecuado para narrativa interactiva y personajes, con la advertencia de revisar la licencia y el contenido generado.
- Automatización en navegador: las cuantizaciones pequeñas (Q2_K ~0,45 GB) permiten ejecución en WebGPU/WebAssembly para demos y asistentes embebidos en páginas web.

## Benchmarks y rendimiento

| Metrica | Este modelo | LFM2.5-1.2B-Instruct original |
|---|---|---|
| IFEval | 86,2 (heredado del base, según model card) | 86,2 |
| BFCLv3 | 49,1 (heredado del base, según model card) | 49,1 |
| Divergencia KL | 0,0657 | 0 (por definición) |
| Rechazos (set del autor) | 2/100 | 98/100 |
| Decodificación en CPU AMD | 239 tok/s (según model card) | no disponible |
| Decodificación en NPU Snapdragon Gen4 | 82 tok/s (según model card) | no disponible |

No se han publicado en la información disponible resultados propios de MMLU, HumanEval o GSM8K para esta variante; las cifras de IFEval y BFCLv3 se atribuyen al modelo base.

## Requisitos de hardware

- VRAM/RAM estimada: Q2_K ~0,45 GB; Q4_K_M ~0,68 GB; Q5_K_M ~0,79 GB; Q6_K ~0,90 GB; Q8_0 ~1,16 GB; F16/BF16 ~2,18 GB.
- Footprint de runtime medido por Liquid: 0,9 GB en NPU Snapdragon X Elite con 32K de contexto.
- GPU recomendadas: RTX 3060/4060 (8-12 GB) con Q6_K; A100/H100 no son necesarias, el modelo está limitado por ancho de banda de memoria, no por cómputo.
- Cabe en GPU consumer: sí, en cualquier GPU con 2 GB o más de VRAM en cuantizaciones Q4-Q8; también en iGPU y CPU.
- Dispositivos sin GPU: móvil con 4 GB de RAM (Q4_K_M), Raspberry Pi 5 de 4 GB (Q4_K_M), portátil Apple Silicon de 8 GB (Q8_0).
- Opciones de despliegue: llama.cpp, LM Studio, Jan, MLX, vLLM, SGLang y builds NPU optimizadas de Nexa; soporte nativo de `lfm2` en llama.cpp desde el primer día.
- Latencia/throughput: 239 tok/s en CPU AMD y 82 tok/s en NPU Snapdragon Gen4 según la model card; no se aportan cifras para GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | IFEval | BFCLv3 | Licencia | Formatos |
|---|---|---|---|---|---|---|
| LFM2.5-1.2B-Instruct-heretic | 1,17B denso | 32K | 86,2 (heredado) | 49,1 (heredado) | lfm-license-1.0 | safetensors, GGUF |
| LiquidAI/LFM2.5-1.2B-Instruct | 1,17B denso | 32K | 86,2 | 49,1 | lfm-license-1.0 | safetensors, GGUF |
| Alternativas de ~1-2B con tool calling | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible solo permite comparar con el modelo base, del que esta variante hereda arquitectura, contexto y métricas de capacidad; la diferencia medible es la tasa de rechazos (2/100 frente a 98/100) y la divergencia KL de 0,0657. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina filtros de seguridad: el modelo puede generar contenido dañino, ofensivo o ilegal; requiere moderación externa en producción.
- Divergencia KL de 0,0657 respecto al base: se espera cierta deriva en la formulación y posible degradación leve de coherencia en tareas sensibles.
- Riesgo de alucinación inherente a un modelo de 1,17B; no es fiable para tareas de alta precisión sin verificación.
- Contexto limitado a 32K tokens; insuficiente para documentos muy extensos o conversaciones de muchas horas.
- Cobertura multilingüe declarada en ocho idiomas, pero sin datos de rendimiento por idioma; el español puede tener calidad inferior al inglés.
- Licencia lfm-license-1.0: es necesario revisar sus términos antes de uso comercial, ya que no es una licencia permisiva estándar.
- El repositorio (17,3 GB) incluye pesos BF16 y 15 cuantizaciones GGUF; conviene descargar solo el fichero necesario.
- El autor es un particular (saidutta69), no Liquid AI; no hay garantías de mantenimiento ni soporte.
- La model card incluye una imagen alojada en un dominio externo y afirmaciones de rendimiento no verificadas de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saidutta69/LFM2.5-1.2B-Instruct-heretic
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct/blob/main/LICENSE
- Repositorio de Heretic: https://github.com/p-e-w/heretic
- Artículo sobre abliteración: https://huggingface.co/blog/mlabonne/abliteration
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper de referencia (arXiv:2511.23404): https://arxiv.org/abs/2511.23404
