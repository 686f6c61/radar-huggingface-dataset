# Rahspide/MNN-Pocket-0.3B-RU

## Resumen

MNN-Pocket-0.3B-RU es un modelo de lenguaje causal de tipo transformer, con arquitectura Qwen3, desarrollado por el usuario Rahspide como un fine-tune completo del modelo base taobao-mnn/MNN-Pocket-0.3B-Base. Con 302,8 millones de parámetros únicos (58,7 M en embeddings y 244,1 M en el resto de capas), su objetivo no es conversar ni responder instrucciones, sino continuar texto en ruso a partir de un prefijo, manteniendo un inglés y un chino legibles. El caso de uso que determinó su diseño es el teclado predictivo en dispositivos: un modelo lo bastante pequeño como para ejecutarse en local con latencia baja.

El modelo se entrenó mediante preentrenamiento continuado sobre 1.200 millones de tokens (0,9 B en ruso, 0,204 B en inglés y 0,096 B en chino), en una sola época y con fine-tune completo, sin LoRA. El resultado principal es una mejora sustancial en ruso: la perplejidad baja de 10,42 a 5,05 y el bits/char de 1,625 a 1,123, a costa de un empeoramiento medible en inglés y chino (entre el 21 % y el 24 % en bits/char). Es, por tanto, un modelo marcadamente ruso-primero, con capacidades secundarias en los otros dos idiomas.

La relevancia actual del modelo está en su nicho: modelos sub-1B orientados a inferencia on-device, con pesos en safetensors y GGUF (Q8_0 y Q4_K_M), licencia Apache 2.0 y compatibilidad con text-generation-inference. No compite con modelos generalistas de mayor tamaño, sino que cubre autocompletado y predicción de teclado en ruso, un idioma tradicionalmente mal cubierto por vocabularios podados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal, arquitectura Qwen3 (modelo base taobao-mnn/MNN-Pocket-0.3B-Base) |
| Parametros totales | 302.830.976 (302,8 M): 58,7 M embeddings + 244,1 M resto |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32k según el modelo base (indicado en la model card como "32k (base)") |
| Tipos de cuantizacion | GGUF Q8_0 y Q4_K_M publicados; safetensors en precisión completa |
| Idiomas soportados | ru, en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

Otros datos técnicos: tokenizador de 65.536 tokens, BPE a nivel de byte, con `<|endoftext|>` = 65510. Entrenado con 1.200 M de tokens en 36.621 pasos de 32.768 tokens. Precisión de entrenamiento: pesos maestros en fp32 con autocast fp16. Tamaño del repositorio: 3,7 GB.

## Arquitectura y entrenamiento

El modelo es un transformer causal estándar que hereda la arquitectura Qwen3 del base taobao-mnn/MNN-Pocket-0.3B-Base. El vocabulario es una versión podada del de Qwen3: se redujo de aproximadamente 151.000 tokens a unos 64.000 (65.536 en la práctica) por frecuencia, conservando las dependencias BPE y el fallback de bytes, según el informe técnico referenciado (arXiv 2611.12311). Esa poda es la causa de la escasa cobertura de cirílico: el vocabulario apenas contiene merges para ruso, de modo que una palabra como "Спасибо" (7 caracteres) se tokeniza en 6 piezas y "привет" (6 caracteres) en 3. El tokenizador es byte-level, con bytes UTF-8 remapeados a latin-1, lo que provoca artefactos de visualización en `convert_ids_to_tokens` pero decodificación exacta.

El entrenamiento consistió en un fine-tune completo (sin LoRA) durante una época sobre 1.200 millones de tokens con una mezcla aproximada de 75 % ruso, 17 % inglés y 8 % chino (0,9 B + 0,204 B + 0,096 B). Se ejecutó en una única GPU Colab T4 de 16 GB a 4,8 k tokens/s durante unas 69 horas, con pesos maestros en fp32 y autocast fp16 (la T4 no tiene bf16 utilizable). No se aplicó RLHF ni DPO: es un LM causal entrenado sobre texto crudo. El autor documenta un segundo intento con mezcla 50/25/25 y lr 5e-5 que se detuvo tras unos 50 M de los 200 M previstos y no produjo cambios medibles en inglés, por lo que no se publicó.

## Capacidades

- Continuación de texto en ruso: completa prefijos, incluso a mitad de frase, con la continuación más plausible.
- Autocompletado y predicción de teclado: es el caso de uso que fijó el presupuesto de tamaño y latencia.
- Generación de texto causal genérica sobre texto crudo, sin formato de instrucciones.
- Mantenimiento de inglés y chino "legibles", aunque con regresión medible respecto al base.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de instrucciones).
- Capacidades multilingües limitadas a ru, en y zh.
- Capacidad especial: ninguna declarada (sin thinking mode, visión ni audio).
- Compatibilidad con text-generation-inference y endpoints compatibles, según los tags del repositorio.

## Casos de uso

- Teclado predictivo en ruso en Android/iOS: el modelo recibe el prefijo escrito y devuelve la continuación; sus 303 M de parámetros y los GGUF Q8_0/Q4_K_M permiten ejecución local con latencia baja en móvil.
- Autocompletado en editores de texto y campos de formulario: al continuar prefijos a mitad de frase, encaja en sugerencias inline sin necesidad de plantilla de chat.
- Predicción de siguiente palabra en buscadores internos o barras de búsqueda en ruso: el modelo completa consultas parciales a partir de un prefijo corto.
- Generación de texto asistida en ruso para redacción de borradores: útil para completar frases en herramientas de escritura, aceptando que no sigue instrucciones.
- Experimentación en investigación sobre tokenización de cirílico: sirve como caso de estudio reproducible del coste de podar vocabularios multilingües y de su efecto en perplejidad y bits/char.
- Base para fine-tune posterior de tareas específicas en ruso: al ser un checkpoint de preentrenamiento continuado con licencia Apache 2.0, puede servir de punto de partida para SFT (el propio autor publica una variante chat).
- Despliegue en entornos con recursos muy limitados (edge, Raspberry Pi, navegador vía MNN/llama.cpp): el tamaño reducido y los formatos GGUF facilitan la inferencia en CPU.

## Benchmarks y rendimiento

Evaluación sobre 100.000 tokens reservados por idioma, con ajustes idénticos para el base y para v1:

| Idioma | Perplejidad base → v1 | Bits/char base → v1 | Top-1 base → v1 | Top-5 base → v1 |
|---|---|---|---|---|
| ru | 10,42 → 5,05 | 1,625 → 1,123 (−31 %) | 46,2 % → 61,0 % | 69,3 % → 80,6 % |
| en | 21,85 → 41,16 | 1,016 → 1,225 (+21 %) | 39,9 % → 35,5 % | 64,1 % → 58,7 % |
| zh | 23,95 → 51,86 | 3,274 → 4,071 (+24 %) | 41,9 % → 37,7 % | 62,0 % → 55,6 % |

Verificación independiente de los pesos publicados (CPU, fp32, 20.000 tokens por idioma): ru 1,022 frente a 1,519 del base; en 1,337 frente a 1,124; zh 4,053 frente a 3,393. Se reproduce el mismo orden de resultados.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 0,6 GB solo para pesos (303 M × 2 bytes), más overhead de activaciones y KV cache; en Q8_0, alrededor de 0,3 GB; en Q4_K_M, en torno a 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; el propio autor entrenó en una T4 de 16 GB. Para inferencia basta con GPUs de gama baja o incluso CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) y en muchas integradas.
- Opciones de despliegue: llama.cpp (los GGUF están publicados en `gguf/`), transformers, text-generation-inference (según tags) y MNN para edge.
- Latencia y throughput: el autor reporta 4,8 k tokens/s durante el entrenamiento en una T4; no se han publicado cifras de latencia o throughput de inferencia en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MNN-Pocket-0.3B-RU (este) | 302,8 M | 32k (base) | ru, en, zh | Apache 2.0 | safetensors, GGUF |
| taobao-mnn/MNN-Pocket-0.3B-Base | 361,5 M según ficha del base (302,8 M únicos) | 32k | multilingüe (Qwen3 podado) | no disponible en la información | safetensors |
| Rahspide/MNN-Pocket-0.3B-RU-Chat | mismo base, SFT sobre 50 M tokens | 32k (base) | ru, en, zh | Apache 2.0 | no disponible en la información |

No se dispone de datos de benchmarks comparativos con otras alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de instrucciones: continúa el prefijo en lugar de responder; para diálogo debe usarse la variante RU-Chat.
- Regresión en inglés y chino: el bits/char empeora un 21 % en inglés y un 24 % en chino respecto al base.
- Tokenización ineficiente del ruso: 1,75-1,85 caracteres por token (2,08 en texto de diálogo) y unas 3,3 tokens por palabra, frente a 3,10 caracteres/token con 8.192 merges cirílicos adicionales; esto encarece el contexto y la latencia en ruso.
- Tokenizador byte-level: un token puede terminar a mitad de carácter UTF-8; los clientes de streaming deben almacenar las secuencias incompletas para evitar caracteres de reemplazo (llama.cpp y transformers lo hacen por defecto).
- Riesgo de alucinación: al ser un LM de continuación de texto, puede generar contenido plausible pero falso; no hay mecanismo de verificación.
- Sesgos: no documentados en la información disponible; al entrenarse sobre fineweb-2 y fineweb, hereda los sesgos de esos corpus.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el estado declarado es "work-in-progress" en los tags.
- El modelo base tiene el vocabulario podado, lo que limita estructuralmente la cobertura de cirílico y de otros alfabetos no latinos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rahspide/MNN-Pocket-0.3B-RU
- Modelo base: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-Base
- Variante chat: https://huggingface.co/Rahspide/MNN-Pocket-0.3B-RU-Chat
- Repositorio privado de entrenamiento (log, checkpoints, script de evaluación): https://huggingface.co/Rahspide/mnn-pocket-ru-run
- Informe técnico del tokenizador podado: https://arxiv.org/abs/2611.12311
- Dataset de entrenamiento (ruso): https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset de entrenamiento (inglés): https://huggingface.co/datasets/HuggingFaceFW/fineweb
