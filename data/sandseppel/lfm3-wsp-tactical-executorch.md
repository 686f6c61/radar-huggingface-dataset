# sandseppel/lfm3-wsp-tactical-executorch

## Resumen

LFM3-1.7B WSP Tactical ExecuTorch es una variante derivada de LiquidAI/LFM3-1.7B, publicada por el usuario sandseppel, empaquetada para inferencia en dispositivo mediante ExecuTorch y el backend XNNPACK sobre Android arm64. No es un modelo oficial de Liquid AI, sino un artefacto de investigación que aplica una técnica denominada Weight-Space-Programming (WSP): se podan las neuronas de conocimiento del mundo en las MLP SwiGLU de las capas 8 a 21 y se cuantiza de forma mixta por capas (4/8 bits) con tamaño de grupo 64.

El resultado es un modelo de aproximadamente 1.434 millones de parámetros activos (el 82,99 % del original) que conserva razonamiento e invocación de herramientas, pero pierde deliberadamente el conocimiento factual general. El autor reporta una caída del 91,7 % en una prueba de conocimiento, mientras el razonamiento se mantiene en el 89,58 % frente al 93,75 % del modelo base y el tool calling sube al 100 % frente al 95 %. El peso exportado en formato PTE ocupa 928,99 MB y está limitado a una ventana de contexto estática de 1024 tokens.

Su relevancia actual reside en el interés por modelos pequeños y especializados que ejecutan tareas de razonamiento y agentes en teléfonos móviles sin conexión, sacrificando memoria de conocimiento a cambio de velocidad y huella reducida. La licencia hereda las restricciones de LFM3-1.7B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivado de LFM3-1.7B con MLPs SwiGLU podadas (WSP) y cuantización mixta por capas |
| Parámetros totales | No disponible (parámetros activos: 1.434.675.968, 82,99 % del baseline) |
| Parámetros activos | 1.434.675.968 |
| Longitud de contexto | 1024 tokens (máximo estático del PTE) |
| Tipos de cuantización | Activaciones 8 bits, pesos mixtos 4/8 bits, tamaño de grupo 64 (Tier-2 G64) |
| Idiomas soportados | Inglés (en) |
| Licencia | other (hereda las restricciones de LiquidAI/LFM3-1.7B) |
| Formato de pesos | PTE (ExecuTorch), 928,99 MB; tokenizer.json y tokenizer_config.json |

## Arquitectura y entrenamiento

El modelo parte de LFM3-1.7B de Liquid AI, un transformer de la familia LFM3 orientada a ejecución en dispositivo. La intervención WSP poda las neuronas de conocimiento del mundo de las MLP SwiGLU en las capas 8 a 21 y aplica una cuantización táctica por capa con precisión mixta 4/8 bits y tamaño de grupo 64 (Tier-2 G64). El backend de atención emplea los operadores `llama::update_cache`, `llama::custom_sdpa` y `llama::sdpa_with_kv_cache` del runtime LLM de ExecuTorch.

La exportación se realizó desde un checkpoint WSP calibrado. La validación reportada compara los logits de prefill y decode frente a la calibración exacta G32: similitud coseno de 0,961 y 0,963 respectivamente, argmax idéntico y un prefijo greedy idéntico de 34 tokens. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO adicionales sobre el modelo base.

## Capacidades

- Razonamiento de múltiples pasos, preservado al 89,58 % del rendimiento del modelo base (93,75 %).
- Invocación de herramientas y function calling, con un 100 % de acierto reportado frente al 95 % del baseline.
- Seguimiento de instrucciones y conversación multi-turno dentro de la ventana de 1024 tokens.
- Tokenizador de vocabulario de 128k con plantilla de chat embebida en tokenizer_config.json.
- Ejecución en dispositivo Android arm64 mediante ExecuTorch 1.x portable y XNNPACK.
- Capacidad multilingüe limitada al inglés.
- No soporta conocimiento general fiable, visión ni audio.

## Casos de uso

- Asistentes de razonamiento en aplicaciones móviles sin conexión: el PTE de 928,99 MB cabe en el almacenamiento de un teléfono y se ejecuta con react-native-executorch, lo que permite flujos de razonamiento local sin enviar datos a la nube.
- Agentes con tool calling en el dispositivo: el 100 % reportado en invocación de herramientas lo hace adecuado para orquestar APIs locales (calendario, contactos, ajustes del sistema) dentro de una app Android.
- Automatización de tareas estructuradas: clasificación, extracción de campos y transformación de texto donde no se requiere conocimiento factual, aprovechando la poda de conocimiento como ventaja de tamaño.
- Enrutamiento y planificación de agentes: dado su rendimiento en razonamiento multi-paso, puede actuar como planificador ligero que delega la ejecución a modelos mayores o servicios remotos.
- Prototipado de pipelines ExecuTorch: sirve como referencia para validar la cadena de exportación, cuantización mixta y ejecución con react-native-executorch antes de desplegar modelos propios.
- Evaluación de técnicas de poda WSP en investigación: permite reproducir la comparación entre el baseline 8da4w y la variante G64 en hardware móvil con el mismo prompt y número de tokens generados.

## Benchmarks y rendimiento

| Métrica | Baseline LFM3-1.7B | WSP Tactical G64 |
|---|---:|---:|
| Razonamiento | 93,75 % | 89,58 % |
| Tool calling | 95 % | 100 % |
| Prueba de conocimiento | Referencia | −91,7 % |
| Parámetros activos | 100 % | 82,99 % |
| Tokens/s en Galaxy S20 FE (4 ejecuciones) | 16,8 / 16,0 / 16,6 / 15,2 | 18,0 / 17,9 / 17,4 / 16,7 |

El benchmark de velocidad se realizó en un Samsung Galaxy S20 FE (SM-G781U1) con react-native-executorch, generando 128 tokens nuevos con un prompt idéntico. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Huella de almacenamiento: 928,99 MB para el PTE, más tokenizer.json y tokenizer_config.json.
- Memoria en ejecución: no disponible de forma explícita; el PTE cuantizado a 4/8 bits está pensado para dispositivos Android arm64 de gama media.
- Validado en Samsung Galaxy S20 FE (SM-G781U1), con 18,0 tokens/s en la mejor ejecución.
- No está orientado a GPU de escritorio; el formato PTE y el backend XNNPACK apuntan a CPU móvil.
- Despliegue mediante ExecuTorch 1.x portable con XNNPACK, requiriendo los custom ops de LLM (`executorch.extension.llm.custom_ops`), los kernels cuantizados y el backend XNNPACK.
- Integración en aplicaciones React Native mediante react-native-executorch y el hook `useLLM`.
- Alternativas de despliegue como vLLM, llama.cpp, Ollama o TGI no están soportadas por el formato PTE.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sandseppel/lfm3-wsp-tactical-executorch | 1.434.675.968 activos | 1024 | Razonamiento y tool calling en Android, sin conocimiento | other (hereda LFM3-1.7B) | Hugging Face |
| LiquidAI/LFM3-1.7B | No disponible en la información | No disponible en la información | Modelo base oficial de texto | No disponible en la información | Hugging Face |
| LFM3-VL-2B | 1,92B | 128K | Visión-lenguaje en dispositivo | No disponible en la información | Hugging Face / LM Studio |
| LFM3-Omni-2B | No disponible en la información | No disponible en la información | Omni (texto, imagen, vídeo, audio) en dispositivo | No disponible en la información | Documentación Liquid AI |

## Limitaciones y advertencias

- El conocimiento del mundo se ha eliminado intencionadamente (−91,7 % en la prueba de conocimiento); no es fiable para preguntas factuales.
- Ventana de contexto estática de 1024 tokens, insuficiente para documentos largos o conversaciones extensas.
- Solo soporta inglés.
- Artefacto de investigación y hobby, no una versión oficial de Liquid AI; sin garantías de mantenimiento.
- Licencia "other" que hereda las restricciones de LiquidAI/LFM3-1.7B; es necesario revisar los términos del modelo base antes de cualquier uso comercial.
- Riesgo de alucinación elevado en dominios factuales por la poda de neuronas de conocimiento.
- Requiere compilar el runtime nativo de ExecuTorch con los custom ops de LLM, kernels cuantizados y XNNPACK; una configuración incorrecta impide la carga del PTE.
- La validación reportada se limita a similitud de logits y un prefijo greedy de 34 tokens frente a la calibración G32.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que reduce la evidencia comunitaria disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sandseppel/lfm3-wsp-tactical-executorch
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Blog de presentación de LFM3: https://www.liquid.ai/blog/lfm3
- Colección LFM3 en Hugging Face: https://huggingface.co/collections/LiquidAI/lfm3
- LFM3 en LM Studio: https://lmstudio.ai/models/lfm3
- Documentación de LFM3-Omni-2B: https://docs.liquid.ai/lfm/models/lfm3-omni-2b
