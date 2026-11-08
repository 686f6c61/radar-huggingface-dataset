# nace-ai/kapitsa-bolt

## Resumen

Kapitsa Bolt es un checkpoint cuantizado de forma mixta del modelo NVIDIA Nemotron 3.5 Bolt 74B-A9B, empaquetado por nace-ai para su ejecución local en Apple Silicon mediante el motor de inferencia Kapitsa. Se trata de una mezcla de expertos (MoE) híbrida Mamba-2 con 74.000 millones de parámetros totales y 9.000 millones activos por token, comprimida con una combinación de cuantización de 2, 4 y 8 bits que reduce el peso a 25,1 GB, lo que permite ejecutarlo en equipos con 24 GB de memoria unificada.

El modelo está orientado a flujos agénticos locales: el motor Kapitsa lo integra con herramientas como opencode, Claude Code, Codex o pi, y expone APIs compatibles con OpenAI y Anthropic. La propuesta es ofrecer capacidad de razonamiento agéntico de una clase de 74B en hardware de consumo Apple, sin depender de servicios en la nube.

La relevancia actual reside en la combinación de arquitectura híbrida (atención + Mamba-2) con cuantización agresiva y un motor especializado en Apple Silicon, que según el autor alcanza 154 tok/s de decodificación en un M5 Max y 50 tok/s en un M3 Pro. La licencia es la NVIDIA Open Model License, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 MoE (mezcla de expertos) |
| Parámetros totales | 74B |
| Parámetros activos | 9B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mixta 2/4/8 bits (25,1 GB) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | no disponible (checkpoint propio del motor Kapitsa; pesos originales en nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB) |

## Arquitectura y entrenamiento

El modelo base es NVIDIA Nemotron 3.5 Bolt 74B-A9B, un transformer híbrido que combina capas de atención con capas Mamba-2 dentro de un esquema de mezcla de expertos. Con 74B parámetros totales y 9B activos por token, el coste computacional por token se mantiene bajo en comparación con un modelo denso del mismo tamaño, lo que facilita su despliegue en memoria unificada limitada.

La contribución de nace-ai es la cuantización mixta a 2/4/8 bits, que reduce el checkpoint a 25,1 GB manteniendo (según el autor) capacidad agéntica en un entorno de 24 GB. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto y razonamiento agéntico multi-paso, orientado a tareas de codificación.
- Ejecución local en Apple Silicon mediante el motor Kapitsa (`kapitsa serve --model bolt`).
- Integración con herramientas agénticas: opencode, Claude Code, Codex y pi.
- Exposición de APIs compatibles con OpenAI y Anthropic para conectar clientes existentes.
- Lectura de imágenes: según el repositorio de Kapitsa, Bolt es uno de los modelos que procesan imágenes (junto a Qwen3.6 y Qwen3.8); el modelo de 4B es solo texto.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible, aunque el uso agéntico con Claude Code y Codex implica dicha capacidad.

## Casos de uso

- Asistencia de codificación local: ejecutar Claude Code, Codex u opencode contra un modelo servido en el propio Mac, sin enviar código a servicios externos, gracias a la API compatible con Anthropic/OpenAI que expone Kapitsa.
- Desarrollo en entornos con requisitos de privacidad: equipos que no pueden usar APIs en la nube pueden desplegar Bolt en un Mac con 24 GB o más y mantener todo el flujo de inferencia en local.
- Prototipado de agentes autónomos: el modelo puede actuar como backend de un agente multi-paso que lee archivos, ejecuta herramientas y razona sobre resultados, aprovechando los 9B parámetros activos para mantener latencias bajas.
- Análisis de capturas y diagramas: al aceptar entrada de imágenes, puede describir interfaces, leer diagramas de arquitectura o extraer información de pantallazos dentro de un flujo de desarrollo.
- Automatización de tareas de refactorización: con 154 tok/s de decodificación en M5 Max, es viable procesar archivos completos y generar parches en tiempos interactivos.
- Evaluación comparativa de modelos en hardware Apple: investigadores pueden medir rendimiento de un MoE de 74B cuantizado frente a modelos densos más pequeños en el mismo equipo, usando las métricas de prefill/decode publicadas.
- Formación y demos: servir el modelo con `kapitsa serve` para talleres o demostraciones donde no se dispone de GPU dedicada.

## Benchmarks y rendimiento

Rendimiento de inferencia publicado por el autor en Apple Silicon:

| Mac | Prefill (tok/s) | Decode (tok/s) |
|---|---:|---:|
| M5 Max 128 GB | 1.075 | 154 |
| M5 Pro 48 GB | no disponible | 79 |
| M4 Pro 48 GB | 519 | 69 |
| M3 Pro 36 GB | 256 | 50 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Memoria: el checkpoint ocupa 25,1 GB, por lo que se requiere un equipo con al menos 32 GB de memoria unificada para operar con margen; el autor lo promociona como "agéntico en 24 GB", lo que sugiere que funciona al límite en configuraciones de 24 GB.
- Equipos probados por el autor: M5 Max 128 GB, M5 Pro 48 GB, M4 Pro 48 GB y M3 Pro 36 GB.
- GPU dedicadas (A100, H100, RTX 4090): no disponible; el motor Kapitsa está diseñado específicamente para Apple Silicon.
- Despliegue: motor Kapitsa (`kapitsa serve --model bolt`), que expone APIs compatibles con OpenAI y Anthropic. No se indica soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: ver tabla de la sección anterior; la decodificación va de 50 tok/s (M3 Pro) a 154 tok/s (M5 Max).

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kapitsa Bolt (este) | 74B | 9B | no disponible | NVIDIA Open Model License | Hugging Face + motor Kapitsa |
| NVIDIA Nemotron 3.5 Bolt 74B-A9B (base) | 74B | 9B | no disponible | NVIDIA Open Model License | Hugging Face |
| Qwen3.6 (soportado por Kapitsa) | no disponible | no disponible | no disponible | no disponible | Hugging Face / GGUF |
| Qwen3.8 (soportado por Kapitsa) | no disponible | no disponible | no disponible | no disponible | Hugging Face / GGUF |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La cuantización mixta 2/4/8 bits puede degradar la calidad frente al checkpoint original en FP8/BF16; no se han publicado evaluaciones que cuantifiquen la pérdida.
- El checkpoint está empaquetado para el motor Kapitsa en Apple Silicon; no es un formato estándar (safetensors/GGUF) y su portabilidad a otras plataformas no está documentada.
- La licencia NVIDIA Open Model License impone condiciones específicas para uso comercial; es necesario revisar sus términos antes de desplegar en producción.
- No se dispone de información sobre idiomas soportados, sesgos conocidos ni tasas de alucinación.
- La longitud de contexto no está publicada, lo que dificulta planificar tareas que requieran ventanas largas.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, y fue creado el 8 de noviembre de 2026; se trata de un artefacto muy reciente y sin validación comunitaria.
- El rendimiento agéntico real con Claude Code o Codex puede variar según la herramienta y la carga; las cifras de tok/s son del autor y no han sido verificadas de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nace-ai/kapitsa-bolt
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB
- Repositorio del motor Kapitsa: https://github.com/nace-ai/kapitsa
- Rama principal de Kapitsa: https://github.com/nace-ai/kapitsa/tree/main
