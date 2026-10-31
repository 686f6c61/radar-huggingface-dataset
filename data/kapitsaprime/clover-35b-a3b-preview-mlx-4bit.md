# kapitsaprime/Clover-35B-A3B-Preview-MLX-4bit

## Resumen

Clover-35B-A3B-Preview-MLX-4bit es una cuantización a 4 bits, en formato MLX, del modelo Clover-35B-A3B-Preview de DiffuSpace, realizada por el usuario kapitsaprime específicamente para Kapitsa, un motor de inferencia sobre Metal para Apple silicon. El modelo base es un mixture-of-experts (MoE) con difusión por bloques (block diffusion), ajustado a partir de Qwen3.6-35B-A3B, con unos 3B de parámetros activos por token. El paquete ocupa 19,5 GB y pesa un total de 34.661.350.848 parámetros según los metadatos de safetensors.

Su relevancia reside en que permite ejecutar en Mac un modelo híbrido MoE + difusión de 35B con velocidades de decodificación altas (hasta 319 tok/s en modo auto con decodificación especulativa sobre un M5 Max), algo poco habitual en hardware de consumo. Cabe destacar que mlx-lm no soporta la arquitectura `clover_moe`, por lo que este paquete solo funciona con Kapitsa, que además descarga junto al modelo un borrador DFlash2 para decodificación especulativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE con difusión por bloques (block diffusion), híbrida con DeltaNet; arquitectura `clover_moe` |
| Parametros totales | 34.661.350.848 (34,66B) |
| Parametros activos | ~3B por token (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 4-bit (grupo 64) para expertos, atención, DeltaNet, embedding y capa de salida; 8-bit para router y gate del shared expert; normas, A_log, dt_bias y convoluciones del DeltaNet, y la convolución derecha y controles softmax de Clover en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (paquete MLX) |

## Arquitectura y entrenamiento

Clover-35B-A3B-Preview es un modelo MoE con decodificación por difusión de bloques (block diffusion), derivado de Qwen3.6-35B-A3B de Alibaba Cloud. Combina rutas causales (con capacidad de decodificación autorregresiva) con un mecanismo de difusión que permite generar bloques de tokens mediante denoising, además de componentes DeltaNet y una convolución derecha propia con controles de softmax. Los expertos, la atención y el DeltaNet están cuantizados a 4 bits affine con grupo 64, mientras que el router y el gate del experto compartido se mantienen a 8 bits para preservar la precisión del enrutado.

La conversión se realizó desde el checkpoint en bf16 mediante la herramienta `tools/convert_clover.py` del repositorio de Kapitsa, y el repositorio incluye un archivo `conversion.json` con el sha256 de cada archivo convertido. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineamiento (RLHF/DPO) en la documentación disponible.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Decodificación por difusión de bloques: puede generar bloques de 32 tokens mediante denoising con umbral de confianza 0,95 (modo `diffusion`).
- Decodificación especulativa propia: Clover genera 7 tokens borradores por denoising y los verifica (modo `spec`).
- Decodificación causal acelerada con borrador externo DFlash2 de Qwen3.6-35B-A3B (modo `auto`).
- Controles de generación propios: repetición, longitud y control de `</think>` (modo de razonamiento), incluidos en `generation_config.json`.
- Plantilla de chat y tokenizador incluidos en el paquete.
- No se ha documentado soporte de tool calling, capacidades de visión ni audio en la información disponible.

## Casos de uso

- Chatbot local en Mac: gracias a su ejecución nativa sobre Metal con Kapitsa, permite servir un asistente conversacional multi-turno en un MacBook Pro sin depender de la nube, con decodificación de más de 300 tok/s en modo auto.
- Prototipado de modelos de difusión de texto: al ser uno de los pocos MoE de difusión por bloques cuantizados disponibles, es útil para investigar decodificación no autorregresiva en hardware Apple.
- Generación de texto en lote con alto throughput: el prefill de 6.002 tok/s a 4K tokens lo hace adecuado para procesar prompts largos o documentos de forma rápida en local.
- Experimentación con decodificación especulativa: incluye tres modos de decodificación (auto, spec y diffusion) que permiten comparar estrategias de inferencia de forma empírica.
- Servicios locales con razonamiento: el control de `</think>` sugiere soporte de modo de razonamiento, útil para tareas que requieren cadenas de pensamiento en entornos privados.
- Despliegue ligero en estaciones de trabajo Apple silicon con 128 GB de memoria unificada: el paquete de 19,5 GB deja margen amplio para contexto y otras cargas en la misma máquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se han publicado mediciones de velocidad de inferencia con `kapitsa bench` en un MacBook Pro M5 Max (128 GB), Kapitsa 0.2.24:

| Modo de decodificación | Método | Velocidad (T 0,6 / greedy) |
|---|---|---|
| `auto` (por defecto) | Ruta causal de Clover con borrador DFlash2 de Qwen3.6-35B-A3B | 319 / 332 tok/s |
| `spec` | Auto-especulativa de DiffuSpace: 7 tokens borrados por denoising y verificados | 214 / 210 tok/s |
| `diffusion` | Difusión por bloques de Hugging Face (LowConfidence, bloque 32, umbral 0,95) | 46 tok/s (greedy) |

Prefill: 6.002 tok/s con prompts de 4K tokens.

## Requisitos de hardware

- Memoria: el paquete pesa 19,5 GB; se recomienda al menos 24 GB de memoria unificada para inferencia cómoda, aunque las mediciones publicadas se realizaron en una máquina de 128 GB.
- Plataforma: exclusivamente Apple silicon, ya que requiere Kapitsa, un motor de inferencia sobre Metal. No es compatible con mlx-lm ni, presumiblemente, con CUDA.
- Consumer hardware: cabe en MacBook Pro M5 Max (128 GB) según las mediciones publicadas; en máquinas con 24-32 GB de memoria unificada debería caber el modelo, aunque no hay mediciones publicadas para esas configuraciones.
- Despliegue: Kapitsa (`kapitsa serve --model clover`), que descarga automáticamente el paquete junto al borrador DFlash2 (`incoai/Qwen3.6-35B-A3B-DFlash2`). No compatible con vLLM, llama.cpp, Ollama ni TGI por la arquitectura `clover_moe`.
- Rendimiento esperado: 319-332 tok/s de decodificación y 6.002 tok/s de prefill en M5 Max (según benchmarks del autor del motor).

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Cuantización | Decodificación | Licencia | Plataforma |
|---|---|---|---|---|---|---|
| Clover-35B-A3B-Preview-MLX-4bit | 34,66B | ~3B | MLX 4-bit | Causal + especulativa + difusión por bloques | Apache-2.0 | Apple silicon (Kapitsa) |
| Qwen3.6-35B-A3B (base) | 35B (aprox.) | ~3B | bf16 (original) | Causal, con borrador DFlash2 | Apache-2.0 | Multiplataforma (no disponible detalle) |
| Qwen3-30B-A3B (referencia de categoría) | 30,5B | ~3B | Variable (GGUF, MLX, etc.) | Causal | Apache-2.0 | Multiplataforma |

Clover se diferencia de sus alternativas de la familia Qwen en su decodificación por difusión de bloques y su componente DeltaNet, aunque su disponibilidad está limitada a Kapitsa por la falta de soporte en mlx-lm. Datos de contexto y benchmarks comparativos: no disponible.

## Limitaciones y advertencias

- Compatibilidad muy restringida: mlx-lm no soporta la arquitectura `clover_moe`, por lo que el paquete solo funciona con Kapitsa; no es utilizable en vLLM, llama.cpp, Ollama ni en GPUs NVIDIA.
- Sin datos de benchmarks de calidad publicados: no hay evaluaciones (MMLU, HumanEval, etc.) que permitan verificar las capacidades del modelo base.
- Longitud de contexto e idiomas soportados: no disponible en la documentación, lo que dificulta planificar cargas con prompts largos o en castellano.
- Riesgo de alucinación: al ser un modelo preview y sin evaluaciones publicadas, debe tratarse con cautela en producción.
- Es una cuantización de terceros (kapitsaprime), no del autor original (DiffuSpace); solo cambia precisión y disposición de los pesos, pero conviene verificar el `conversion.json` con los sha256.
- Sesgos conocidos: no disponible.
- Licencia: Apache-2.0, apta para uso comercial; el modelo base deriva de Qwen3.6-35B-A3B (Copyright 2026 Alibaba Cloud), con atribuciones incluidas en `ATTRIBUTIONS.md`.
- El modo de difusión por bloques es notablemente más lento (46 tok/s) que el causal con borrador (319-332 tok/s), por lo que conviene elegir el modo según la carga.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/kapitsaprime/Clover-35B-A3B-Preview-MLX-4bit
- Modelo base (DiffuSpace): https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview
- Borrador DFlash2: https://huggingface.co/incoai/Qwen3.6-35B-A3B-DFlash2
- Motor de inferencia Kapitsa: https://github.com/nace-ai/kapitsa
