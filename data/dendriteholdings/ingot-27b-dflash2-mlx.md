# dendriteholdings/Ingot-27B-DFlash2-MLX

## Resumen

Ingot-27B-DFlash2-MLX es la versión para Apple Silicon del drafter de decodificación especulativa Ingot-27B-DFlash2, publicada por dendriteholdings. No es un modelo de generación autónomo: es un modelo borrador (draft model) que propone bloques de tokens que un modelo objetivo mayor, denominado "king" en la terminología del autor, verifica token a token. El resultado es una aceleración de la inferencia sin alterar qué modelo responde finalmente.

El drafter se deriva de z-lab/Qwen3.8-27B-DFlash2 mediante ajuste fino sobre respuestas generadas por Ingot-IV-27B, y emplea la arquitectura DFlash 2 de difusión por bloques descrita en el paper arXiv:2602.06036. Esta variante MLX se distribuye cuantizada a 8 bits afines con grupo de 64, ocupa 2,04 GB y está pensada para emparejarse con los packs MLX de 2 bits de la familia Ingot (por ejemplo, Ingot-XVI-27B-MLX-2bit, de unos 8,6 GB).

Su relevancia es acotada pero concreta: permite acelerar entre un 1,23x y alcanzar unos 90 tok/s en respuestas de código sobre un Mac Studio M3 Ultra, con un consumo conjunto de memoria de aproximadamente 10 GB para king y drafter. El repositorio incluye además un runner propio (`ingot_dflash_mlx.py`) con modo `generate` y modo `serve` compatible con la API de OpenAI, porque el layout MLX de los kings (`prism_hadamard_qwen35`) no es cargable por mlx-lm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash 2 (difusión por bloques para decodificación especulativa), derivada de Qwen3.8-27B-DFlash2 |
| Parametros totales | 1.833.022.720 (1,83 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 8 bits, grupo 64 (única publicada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), config.json, runner Python |

## Arquitectura y entrenamiento

El modelo es un drafter de decodificación especulativa basado en DFlash 2, un esquema de difusión por bloques para generación especulativa. En lugar de proponer un único token por paso, el drafter genera bloques de tokens candidatos (por defecto 4, configurable con `--block`) que el modelo king verifica en paralelo. El runner ejecuta el bucle especulativo MLX de z-lab/dflash sobre el king, cargado a través de MTPLX, y aplica conversiones explícitas de precisión: entradas del drafter a bfloat16 y salida a float16, para evitar que MLX ejecute todo el drafter en float32 cuando el king computa en float16.

El entrenamiento parte de z-lab/Qwen3.8-27B-DFlash2 y consiste en un ajuste fino sobre respuestas generadas por Ingot-IV-27B. Según el autor, el drafter entrenado con el king IV funciona sin cambios sobre kings posteriores. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de propuestas de tokens para decodificación especulativa: no responde de forma autónoma, solo propone candidatos que el king valida.
- Aceleración de inferencia sobre modelos Ingot de 27B en formato MLX de 2 bits, con speedups medidos de 1,23x en M3 Ultra.
- Generación de texto y código a través del king emparejado (el ejemplo de la model card es generación de código en C++).
- Modo `serve` con API compatible con OpenAI (`/v1/chat/completions`), con y sin streaming.
- Modo `generate` para un único prompt, con control de temperatura (`--temp`, por defecto 0, greedy), tamaño de bloque de borrador (`--block`), `--max-tokens` y `--show-thinking`.
- Soporte de modo thinking del king mediante el flag `--show-thinking` (no se detalla más su funcionamiento).
- No soporta tool calling, function calling, agentes, visión, audio ni multimodalidad según la información disponible.

## Casos de uso

- Aceleración de asistentes de código en local sobre Mac: emparejar el drafter con un king Ingot de 27B en MLX 2 bits permite alcanzar unos 90 tok/s en respuestas de código en un M3 Ultra, lo que hace viable un copiloto de programación interactivo sin GPU dedicada.
- Servicio de chat compatible con OpenAI en Apple Silicon: el modo `serve` expone `/v1/chat/completions` en localhost, de modo que herramientas que ya hablan la API de OpenAI (clientes, frameworks de evaluación, interfaces de chat) pueden apuntar al endpoint sin cambios de código.
- Evaluación comparativa de decodificación especulativa: al ser un drafter independiente del king, permite medir el impacto del tamaño de bloque (`--block`) y de la cuantización en la tasa de aceptación de tokens sobre distintos kings de la familia Ingot.
- Prototipado de pipelines de generación en estaciones de trabajo Mac: con unos 10 GB de memoria conjunta para king y drafter, se puede desplegar un stack de generación de 27B en un Mac Studio sin recurrir a servidores con A100/H100.
- Generación de documentación técnica y respuestas de código en flujos por lotes pequeños: el modo `generate` con temperatura 0 ofrece salidas deterministas para tareas de transformación de texto donde la reproducibilidad importa.
- Investigación sobre decodificación especulativa con pesos de 2 bits: el repositorio documenta explícitamente que en GPUs M1 a M4 el coste de verificar varios tokens con pesos de 2 bits limita la ganancia, lo que lo convierte en un banco de pruebas para estudiar el equilibrio entre aceptación y coste de verificación.

## Benchmarks y rendimiento

Resultados publicados por el autor en Mac Studio M3 Ultra, un stream, 8 prompts de chat y código, 256 tokens greedy:

| Objetivo (king) | tok/s sin drafter | tok/s con drafter | Speedup | Tokens por paso |
|---|---|---|---|---|
| Ingot-IV-27B MLX | 59,0 | 72,8 | 1,23x | 2,97 |
| Ingot-XVI-27B MLX | 59,0 | 72,6 | 1,23x | 2,99 |

Datos adicionales aportados en la model card: las respuestas de código alcanzan unos 90 tok/s; el consumo de memoria conjunto de king y drafter es de aproximadamente 10 GB; en GPUs NVIDIA, el drafter GGUF en llama.cpp es 1,8x más rápido que la decodificación simple (dato referido al modelo base Ingot-27B-DFlash2, no a esta variante MLX). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: unos 10 GB en total para king (aproximadamente 8,6 GB en MLX 2 bits) y drafter (2,04 GB en MLX 8 bits).
- Hardware soportado: exclusivamente Apple Silicon (M1 a M5 según la model card). Requiere Python 3.12.
- GPU recomendadas: Mac Studio M3 Ultra es la única configuración medida. En M1 a M4 la ganancia está limitada por el coste de verificación con pesos de 2 bits; en M5 el autor espera mejoras por las matrix units, pero no se ha probado.
- Cabe en GPU consumer: sí, en equipos Apple Silicon con al menos 16 GB de memoria unificada; no está pensado para GPUs NVIDIA en esta variante (para NVIDIA existe el drafter GGUF del modelo base).
- Opciones de despliegue: runner propio `ingot_dflash_mlx.py` (modos `generate` y `serve`), con dependencia de MTPLX 2.12.2 y de un commit concreto de z-lab/dflash. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI para esta variante MLX.
- Latencia y throughput: 72,6-72,8 tok/s en chat y código con el drafter frente a 59,0 tok/s sin él en M3 Ultra; alrededor de 90 tok/s en respuestas de código.
- Concurrencia: una sola petición a la vez y sin caché de prompt.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-27B-DFlash2-MLX (este) | 1,83 B | no disponible | Drafter especulativo para MLX en Apple Silicon | Apache 2.0 | Hugging Face, 65 descargas |
| Ingot-27B-DFlash2 | no disponible | no disponible | Drafter especulativo, variante GGUF para llama.cpp en NVIDIA | Apache 2.0 | Hugging Face |
| z-lab/Qwen3.8-27B-DFlash2 | no disponible | no disponible | Drafter especulativo upstream del que deriva este modelo | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos tres modelos en la información proporcionada, más allá de la referencia del autor a que el drafter GGUF en llama.cpp logra 1,8x sobre decodificación simple en NVIDIA frente al 1,23x medido en M3 Ultra con MLX.

## Limitaciones y advertencias

- Solo Apple Silicon: no funciona en GPUs NVIDIA, AMD ni en CPU convencional en esta variante.
- Una única petición simultánea y sin caché de prompt, lo que limita su uso en servidores con concurrencia.
- Solo texto: sin visión, audio ni multimodalidad.
- Dependencia frágil: el runner usa una función interna de MTPLX y fija la versión 2.12.2 y un commit concreto de z-lab/dflash; actualizaciones de esas dependencias pueden romper la compatibilidad.
- Los reyes usan el layout MLX `prism_hadamard_qwen35`, no cargable por mlx-lm, lo que obliga a usar el runner propietario en lugar de herramientas estándar del ecosistema MLX.
- La verificación por lotes redondea de forma distinta a la decodificación simple, por lo que una salida greedy puede diferir en tokens casi empatados aunque el modelo subyacente sea el mismo.
- Rendimiento medido únicamente en un M3 Ultra; no hay datos para otros chips Apple.
- No es un modelo de generación autónomo: no debe evaluarse con benchmarks de conocimiento o razonamiento, ya que su única función es proponer tokens.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; en la práctica, la calidad final de la respuesta depende del king emparejado, no del drafter.
- Licencia Apache 2.0, que permite uso comercial, pero el autor no ofrece garantías ni soporte y el modelo tiene 0 likes y 65 descargas, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2-MLX
- Modelo base (drafter original): https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2
- Drafter upstream: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Paper DFlash (arXiv:2602.06036): https://arxiv.org/abs/2602.06036
- Repositorio z-lab/dflash: https://github.com/z-lab/dflash
- Repositorio MTPLX: https://github.com/youssofal/mtplx
