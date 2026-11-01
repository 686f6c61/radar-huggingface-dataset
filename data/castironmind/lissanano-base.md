# CastIronMind/LissaNano-Base

## Resumen

LissaNano-Base es un modelo de lenguaje causal de 32 millones de parámetros desarrollado por CastIronMind, entrenado desde cero sobre prosa y foros de la comunidad de My Little Pony. Se trata de un checkpoint base (pretraining puro, sin instrucciones ni formato de diálogo) con arquitectura Llama de 8 capas, tamaño oculto 512 y una ventana de contexto de 1.024 tokens. Su relevancia radica en ser uno de los modelos de dominio fandom más pequeños publicados: 64 MB de pesos en bfloat16 lo hacen viable para experimentación en una única GPU de consumo, fine-tuning rápido y despliegue embebido.

El modelo emplea un vocabulario byte-level BPE de 16.384 tokens y embeddings atados, lo que reduce el recuento de parámetros y acelera la inferencia. No incorpora plantilla de chat: los tokens especiales `<system>`, `<user>` y `<assistant>` existen en el vocabulario pero no forman parte del formato de pretraining, por lo que la generación se realiza mediante continuación de texto plano.

La ficha corresponde al checkpoint base; el autor publica una variante Instruct del mismo tamaño para uso conversacional, así como una familia escalonada (LissaBrat de 103M y Lissa 1.5B) que comparte el mismo enfoque de dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer causal, decoder-only) |
| Parametros totales | 31.990.272 (32M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; al ser un checkpoint Llama estándar es convertible a GGUF/INT8/INT4 con herramientas habituales, aunque el autor no documenta cuantizaciones oficiales) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16), compatible con transformers |

## Arquitectura y entrenamiento

Transformer decoder-only con arquitectura Llama: 8 capas, hidden size 512, 16 cabezas de atención con 2 cabezas key/value (GQA), dimensión de cabeza 32, intermediate size 1.536, embeddings atados y precisión bfloat16. El vocabulario es byte-level BPE de 16.384 tokens. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

El entrenamiento se realizó desde cero (sin destilación ni backbone prestado) sobre aproximadamente 1.000 millones de tokens únicos de prosa y foros de la comunidad My Little Pony, durante dos épocas. No se especifica en la información disponible la composición exacta del dataset, la mezcla de fuentes ni si hubo fases de RLHF o DPO; el checkpoint corresponde únicamente a la etapa de pretraining. El autor indica que el modelo se entrenó en una sola GPU de consumo, sin clúster ni presupuesto institucional.

## Capacidades

- Generación de texto por continuación de prompt (next-token prediction) en inglés.
- Modelado de prosa de dominio fandom: ficción, narrativa y discurso de foro de la comunidad My Little Pony.
- Capacidad de servir como base para continued pretraining y fine-tuning sobre dominios específicos.
- No soporta tool calling ni function calling de forma nativa.
- No soporta agentes ni razonamiento multi-paso estructurado.
- No dispone de modo thinking, visión ni audio.
- Multilingüismo limitado al inglés; no se documenta soporte de otros idiomas.
- No incluye plantilla de chat ni formato de diálogo (los tokens de rol existen pero no se usan en pretraining).

## Casos de uso

- Continued pretraining de dominio: partir de los pesos base para adaptar el modelo a un corpus nuevo (por ejemplo, otro fandom o documentación técnica) con un coste de cómputo mínimo gracias a sus 32M de parámetros.
- Fine-tuning educativo y de investigación: reproducir el pipeline completo de entrenamiento y evaluación en una sola GPU de consumo, útil para docencia o experimentos controlados sobre tokenización y currículos.
- Generación de ficción asistida: completar fragmentos narrativos coherentes con el estilo de la comunidad MLP, usando prompts de texto plano y temperaturas moderadas.
- Evaluación de tokenizadores: el vocabulario de 16.384 tokens permite estudiar el equilibrio entre compresión (bpc) y tamaño de embedding en modelos pequeños.
- Despliegue embebido y prototipado: 64 MB de pesos permiten cargar el modelo en dispositivos con memoria limitada para demos de generación de texto offline.
- Baseline en experimentos de scaling: comparar curvas de pérdida y perplejidad frente a las variantes LissaBrat (103M) y Lissa 1.5B de la misma familia.
- Generación de datos sintéticos de dominio: producir texto de estilo fandom para aumento de datos en tareas de clasificación o recuperación.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Métrica | Valor |
|---|---|---|
| Pony domain evaluation (Fimfarchive, congelado, ~10M tokens) | Perplexity | 31,88 |
| Pony domain evaluation (Fimfarchive, congelado, ~10M tokens) | Bits per character (bpc) | 1,2091 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 64 MB de pesos más overhead de activaciones y caché KV; cabe holgadamente en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna (RTX 3060 en adelante, A100, H100); también CPU para inferencia de baja latencia por el reducido tamaño.
- Cabe en GPU de consumo: sí, en todas las gamas actuales, e incluso en placas integradas y SBC.
- Opciones de despliegue: transformers (referencia), text-generation-inference (el modelo declara endpoints_compatible), llama.cpp/Ollama tras conversión a GGUF, y vLLM si se convierte el checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño (32M parámetros, contexto de 1.024 tokens) se espera throughput muy alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| LissaNano-Base | 32M | 1.024 | Apache 2.0 | Dominio fandom MLP, base |
| LissaNano-Instruct | 32M | 1.024 | Apache 2.0 | Dominio fandom MLP, instrucciones |
| LissaBrat-Base | 103M | no disponible | Apache 2.0 | Dominio fandom MLP, base |
| Lissa 1.5B Base | 1,45B | no disponible | Apache 2.0 | Dominio fandom MLP, base |

No se dispone de datos de benchmarks comparativos entre estas variantes ni frente a modelos de propósito general del mismo tamaño en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin alineación: no sigue instrucciones ni mantiene formato conversacional; para diálogo debe usarse LissaNano-Instruct.
- Riesgo elevado de alucinación y de derivar hacia texto incoherente fuera del dominio fandom, dado el tamaño y el corpus de entrenamiento.
- Ventana de contexto muy corta (1.024 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Entrenado únicamente en inglés; no se garantiza calidad en castellano ni en otros idiomas.
- Sesgos potenciales heredados del corpus de foros y fanfiction de la comunidad MLP (sesgos de género, temáticos y de estilo).
- Aunque la licencia es Apache 2.0 y permite uso comercial, la calidad y fiabilidad del modelo no son adecuadas para producción en tareas generales.
- El rendimiento declarado (perplejidad 31,88; bpc 1,2091) no está verificado de forma independiente y procede de una evaluación de dominio restringida.
- No hay documentación sobre cuantizaciones oficiales ni sobre estabilidad numérica en precisión reducida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CastIronMind/LissaNano-Base
- Licencia: https://huggingface.co/CastIronMind/LissaNano-Base/blob/main/LICENSE
- Variante Instruct: https://huggingface.co/CastIronMind/LissaNano-Instruct
- LissaBrat-Base: https://huggingface.co/CastIronMind/LissaBrat-Base
- LissaBrat-Instruct: https://huggingface.co/CastIronMind/LissaBrat-Instruct
- Lissa 1.5B Instruct: https://huggingface.co/CastIronMind/Lissa-1.5B-Instruct
- Lissa 1.5B Base: https://huggingface.co/CastIronMind/Lissa-1.5B-Base
