# litert-community/Qwen2.5-Coder-1.5B-Instruct

## Resumen

Qwen2.5-Coder-1.5B-Instruct en formato LiteRT-LM es una conversión del modelo original de Alibaba Cloud (Qwen/Qwen2.5-Coder-1.5B-Instruct) realizada por la comunidad `litert-community` para su ejecución en dispositivos de borde (on-device) mediante el runtime LiteRT-LM de Google. El modelo conserva la arquitectura del base —un transformer decoder-only de 1.54B parámetros— pero sus pesos se han cuantizado a int4 blockwise-32 con OCTAV en las capas lineales y int8 en la tabla de embeddings, lo que reduce el archivo a 1.12 GB. Está pensado para asistencia de código en tiempo real en teléfonos y otros dispositivos con recursos limitados, donde la velocidad de decodificación es crítica.

La relevancia de esta conversión radica en que permite ejecutar un modelo de código de calidad en hardware de consumo sin depender de la nube, manteniendo una licencia Apache-2.0 que facilita su uso comercial. El bundle incluye el tokenizador y la plantilla de chat ChatML con el prompt de sistema por defecto de Qwen, garantizando que las respuestas sean byte-idénticas a las del modelo original en peticiones de un solo turno. Se requieren al menos la versión 0.16 del runtime LiteRT-LM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Qwen2.5) |
| Parametros totales | 1.54B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (presupuesto KV del bundle) |
| Tipos de cuantizacion | int4 blockwise-32 + OCTAV en linears, int8 en embedding |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | LiteRT flatbuffers (.litertlm) |

## Arquitectura y entrenamiento

Este modelo no es un entrenamiento nuevo, sino una conversión de los pesos del modelo base Qwen2.5-Coder-1.5B-Instruct, que a su vez es un transformer decoder-only con atención causal y 1.54B parámetros, entrenado por Alibaba Cloud para generación y comprensión de código. La conversión se realizó con la pila oficial de LiteRT (litert-torch 0.9.3, litert-converter 0.3.1, ai-edge-quantizer 0.8.0 y litert-lm-builder 0.16.0), aplicando cuantización int4 blockwise-32 con recorte OCTAV en las capas lineales y cuantización int8 en la tabla de embeddings, que además se externaliza en una sección separada del bundle para evitar la duplicación de pesos por firma de prefill.

Una innovación destacable de esta conversión es la gestión del prompt de sistema por defecto: el modelo base inserta automáticamente el mensaje `You are Qwen, created by Alibaba Cloud...` cuando no se proporciona un sistema explícito, y el bundle lo incrusta en la plantilla ChatML para replicar ese comportamiento. También se definen seis firmas de prefill (1024, 256, 64, 16, 4 y 1 tokens) y un presupuesto de KV cache de 4096 tokens, lo que permite optimizar la inferencia en distintos escenarios de longitud de entrada.

## Capacidades

- Generación de código: produce funciones, fragmentos y soluciones en múltiples lenguajes de programación, con especial énfasis en Python (según las pruebas de corrección).
- Ejecución de código: el modelo es capaz de generar código que se puede ejecutar y validar mediante aserciones, como demuestra el code gate 6/6.
- Asistencia de código conversacional: soporta ChatML y el prompt de sistema por defecto de Qwen, lo que permite interacciones multi-turno de asistencia técnica.
- Inferencia en dispositivo: gracias al formato LiteRT-LM, puede ejecutarse en GPUs y CPUs de dispositivos móviles y de escritorio con bajo consumo de memoria (1.12 GB).
- Compatibilidad con backends GPU y CPU: el runtime LiteRT-LM permite seleccionar backend Metal (GPU) o CPU en macOS, y en teléfonos como Pixel 8a ofrece rendimiento comparable entre GPU y CPU.

## Casos de uso

- Asistente de código en móvil: un desarrollador puede ejecutar el modelo localmente en un teléfono para obtener sugerencias de funciones o depurar fragmentos sin conexión, gracias a su tamaño de 1.12 GB y velocidad de decodificación de ~137 tok/s en GPU de escritorio.
- Autocompletado de código en entornos de desarrollo integrados (IDE) ligeros: el modelo puede integrarse como backend de autocompletado en editores que soporten inferencia local, ofreciendo respuestas en menos de 100 ms de tiempo hasta el primer token (TTFT 0.099 s en M4 Max).
- Generación de tests unitarios: dada su capacidad de ejecutar código generado contra aserciones, puede usarse para producir tests de funciones simples y verificar su corrección automáticamente.
- Educación y aprendizaje de programación: estudiantes pueden interactuar con el modelo en dispositivos de bajo coste para recibir explicaciones y ejemplos de código, sin depender de servicios en la nube.
- Prototipado rápido en entornos sin GPU: el modelo funciona en CPU (47 tok/s de decodificación en M4 Max), lo que permite usarlo en portátiles o mini-PCs sin acelerador dedicado.
- Automatización de tareas de refactorización de código: con su soporte de ChatML y contexto de 4096 tokens, puede procesar funciones pequeñas y sugerir reescrituras o correcciones de estilo.

## Benchmarks y rendimiento

La model card no incluye benchmarks de calidad estándar (MMLU, HumanEval, GSM8K), pero sí resultados de rendimiento de inferencia medidos con `litert-lm benchmark` en un Apple M4 Max (litert-lm 0.16.0, prefill 256, decode 256, sin caché):

| Backend | Prefill (256) | Decode | TTFT | Init |
|---|---|---|---|---|
| GPU (Metal) | 3037 tok/s | 137.8 tok/s | 0.099 s | 2.38 s |
| CPU | 292 tok/s | 47.1 tok/s | 1.06 s | 2.87 s |

Además, se reportan dos pruebas de corrección:

- Sanity gate: 8/8 preguntas de conocimiento general superadas en backend GPU.
- Code gate: 6/6 funciones generadas (fib, reverse_words, is_prime, largest contiguous sublist sum, count_vowels, flatten) que se ejecutan contra aserciones y todas pasan.

No se han publicado resultados de benchmarks de calidad del lenguaje en la información disponible.

## Requisitos de hardware

- VRAM estimada: 1.12 GB para el archivo del modelo, más memoria para KV cache (presupuesto de 4096 tokens) y overhead del runtime. En la práctica, cabe en dispositivos con al menos 2 GB de RAM disponible.
- GPU recomendadas: cualquier GPU compatible con Metal en macOS (probado en M4 Max) o GPU de teléfonos con soporte LiteRT-LM (por ejemplo, Pixel 8a). En CPU también funciona, aunque con menor rendimiento.
- Consumer GPU: sí, funciona en GPUs de escritorio y portátiles con al menos 2 GB de VRAM, así como en CPUs modernas.
- Opciones de despliegue: runtime LiteRT-LM (comando `litert-lm run`), con selección de backend GPU o CPU. No se mencionan integraciones con vLLM, Ollama o TGI.
- Latencia y throughput: en M4 Max, prefill de 256 tokens a 3037 tok/s (GPU) y decode a 137.8 tok/s (GPU); en CPU, 292 tok/s de prefill y 47.1 tok/s de decode. En teléfonos como Pixel 8a, la diferencia GPU/CPU en decode es inferior al 1% según la card.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada. Sin embargo, se puede comparar con el modelo base original:

| Modelo | Parametros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-Coder-1.5B-Instruct (original) | 1.54B | safetensors bf16 | 32K (no confirmado) | Apache-2.0 | HuggingFace |
| Qwen2.5-Coder-1.5B-Instruct (LiteRT-LM) | 1.54B | .litertlm (int4) | 4096 (KV budget) | Apache-2.0 | HuggingFace |

Otras alternativas de código pequeño (CodeLlama-7B, StarCoderBase-1B) no se han incluido por falta de datos comparables en la información disponible.

## Limitaciones y advertencias

- El presupuesto de KV cache está limitado a 4096 tokens, lo que restringe la longitud de las conversaciones o entradas procesables en una sola pasada.
- La cuantización int4 puede degradar ligeramente la calidad de las respuestas en comparación con el modelo original en bf16, aunque las pruebas de corrección indican que el rendimiento funcional se mantiene.
- El prompt de sistema por defecto de Qwen está incrustado en el bundle; si se desea un comportamiento sin sistema, hay que proporcionar un mensaje de sistema explícito vacío.
- La conversión es un trabajo de la comunidad, no afiliado a Alibaba Cloud ni al equipo de Qwen; no hay garantía de soporte oficial.
- El modelo solo está disponible en formato LiteRT-LM; no se ofrecen pesos en otros formatos (GGUF, safetensors) en este repositorio.
- No se han documentado sesgos específicos, pero al ser un modelo de código, puede reflejar los sesgos del dataset de entrenamiento original en cuanto a lenguajes o estilos de programación.
- El rendimiento en dispositivos móviles reales puede variar; la card advierte que la relación GPU/CPU en un Mac no se traslada directamente a un teléfono.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/litert-community/Qwen2.5-Coder-1.5B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Herramienta de conversión litert-torch: https://github.com/google-ai-edge/litert-torch
