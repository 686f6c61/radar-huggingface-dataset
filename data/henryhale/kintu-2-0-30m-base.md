# henryhale/Kintu-2.0-30M-Base

## Resumen

Kintu-2.0-30M-Base es un modelo de lenguaje de 30 millones de parámetros desarrollado por henryhale para el idioma luganda (lg), una lengua bantú hablada principalmente en Uganda. Se trata de un modelo base entrenado desde cero siguiendo la receta MiniMind, lo que lo convierte en un ejercicio de preentrenamiento de bajo coste reproducible en hardware modesto (2× T4 durante 2,1 horas). No es un modelo conversacional: continúa texto y sirve como punto de partida para el modelo de chat Kintu-2.0-30M.

Arquitectónicamente adopta el estilo Qwen3 (`Qwen3ForCausalLM`), con 8 capas, tamaño oculto de 512, MLP de 1.664 y atención con query agrupadas (8 cabezas de query, 4 de KV). Emplea RMSNorm, SwiGLU, RoPE con θ = 1e6, QK-norm y embeddings atados. El tokenizador es un BPE a nivel de byte con 6.400 tokens, entrenado sobre los mismos datos de preentrenamiento.

Su relevancia radica en ser uno de los pocos modelos abiertos dedicados exclusivamente al luganda, con licencia Apache 2.0 y un tamaño que permite ejecución en CPU o GPUs de consumo. El contexto es limitado (512 tokens) y el volumen de entrenamiento es reducido (273M tokens), por lo que debe entenderse como una base experimental más que como un modelo listo para producción informativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Qwen3 (`Qwen3ForCausalLM`) |
| Parámetros totales | 30.025.216 (30,0M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización estándar vía transformers/bitsandbytes, no documentado por el autor) |
| Idiomas soportados | luganda (lg) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso con 8 capas, dimensión oculta de 512 y MLP de 1.664, siguiendo el diseño de Qwen3: normalización RMSNorm, activación SwiGLU, embeddings posicionales rotatorios (RoPE) con θ = 1e6, QK-norm y atención con query agrupadas (GQA) con 8 cabezas de query y 4 de KV. Los embeddings de entrada y salida están atados (tied embeddings), lo que reduce el recuento de parámetros. El tokenizador es un BPE a nivel de byte de 6.400 tokens entrenado sobre el corpus de preentrenamiento.

El preentrenamiento utilizó 273M tokens del dataset `henryhale/luganda-pretrain2`, empaquetados en secuencias de hasta 512 tokens durante 2 épocas. Se empleó AdamW con learning rate 5e-4 y decaimiento coseno hasta 5e-5, precisión fp16, batches de 256 secuencias y 2 GPUs T4 durante 2,1 horas. La pérdida final de entrenamiento fue aproximadamente 2,49. No se documenta RLHF, DPO ni ninguna fase de alineación posterior; es un modelo estrictamente base. Un dato relevante para interpretar su comportamiento: el 68,5% de los tokens de preentrenamiento provienen de traducciones de TinyStories, lo que sesga la distribución hacia narrativas simples.

## Capacidades

- Generación de texto en luganda: continuación de texto a partir de un prefijo, con fluidez gramatical razonable para su tamaño.
- Modelado de lenguaje base: no está ajustado para diálogo ni instrucciones; el modelo conversacional es la variante Kintu-2.0-30M.
- Generación de narrativas cortas: por el peso de TinyStories en el corpus, produce relatos sencillos con coherencia local.
- Manejo de texto con formato de plantilla: los textos de preentrenamiento comenzaban con `<|im_start|>`, por lo que el tokenizador y el modelo responden a esa convención.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.
- Multilingüismo: no disponible; el modelo está entrenado únicamente en luganda.

## Casos de uso

- Investigación en PLN de bajos recursos: servir como línea base reproducible para experimentos de tokenización, arquitectura y recetas de entrenamiento en luganda, con un coste de cómputo de horas en GPUs T4.
- Generación de texto sintético en luganda: producir borradores de frases o párrafos para aumentar corpus de entrenamiento de modelos mayores, siempre con revisión humana por el riesgo de deriva temática.
- Aplicaciones educativas de demostración: mostrar en entornos docentes cómo se entrena un modelo desde cero con MiniMind y evaluar sus salidas cualitativamente.
- Prototipado rápido en CPU o hardware de gama baja: al tener 30M parámetros, cabe en memoria de cualquier portátil y permite iterar sobre pipelines de inferencia sin GPU dedicada.
- Punto de partida para fine-tuning: al ser un modelo base con licencia Apache 2.0, puede ajustarse con datasets específicos de dominio (por ejemplo, textos religiosos o narrativa oral luganda) para tareas concretas.
- Evaluación comparativa de modelos pequeños: útil como referencia en estudios que midan la relación entre tamaño, tokens de entrenamiento y calidad en lenguas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 60 MB en fp16 (30M parámetros × 2 bytes) más overhead de activaciones y caché KV; en la práctica, menos de 1 GB en cualquier configuración.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el autor lo entrenó en 2× NVIDIA T4, y la inferencia funciona sin problema en T4, RTX 3060, RTX 4090 o incluso GPUs integradas.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo modernas e incluso en CPU.
- Opciones de despliegue: transformers (referencia del autor), text-generation-inference (etiqueta `text-generation-inference` en el repo), endpoints compatibles; no se documenta soporte explícito de llama.cpp, Ollama o vLLM, aunque la arquitectura Qwen3 facilita su conversión.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño, la latencia será de milisegundos por token en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kintu-2.0-30M-Base | 30,0M | 512 | Luganda | Apache 2.0 | HuggingFace |
| Kintu-2.0-30M | no disponible | no disponible | Luganda | no disponible | HuggingFace (variante chat del mismo autor) |
| MiniMind (receta base) | ~26M (según receta pública) | no disponible | Chino/inglés | no disponible en la información | GitHub/HuggingFace |
| Modelos multilingües pequeños (p. ej. variantes de <100M) | variable | variable | multilingüe | variable | variable |

La comparación con alternativas de la misma categoría (modelos dedicados a lenguas africanas de bajos recursos con menos de 100M de parámetros) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Calidad factual baja: el propio autor advierte que el modelo se desvía del tema con frecuencia y comete errores de hechos; no debe usarse como fuente de información.
- Sesgo de dominio: el 68,5% de los tokens de preentrenamiento son traducciones de TinyStories, por lo que el modelo tiende a producir narrativas simples y puede fallar en registros formales o técnicos.
- Contexto muy corto: 512 tokens limitan el uso en conversaciones multi-turno, documentos largos o tareas que requieran memoria extensa.
- Monolingüe: solo luganda; no comprende ni genera otros idiomas de forma fiable.
- Modelo base sin alineación: no sigue instrucciones, no tiene filtros de seguridad y puede generar contenido inapropiado o incoherente.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento ni sobre los derechos de los datos de entrenamiento subyacentes.
- Riesgo de alucinación elevado por el reducido volumen de entrenamiento (273M tokens) y el tamaño del modelo.
- No apto para producción informativa, atención al cliente ni tareas que requieran precisión factual sin supervisión humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/henryhale/Kintu-2.0-30M-Base
- Modelo de chat Kintu-2.0-30M: https://huggingface.co/henryhale/Kintu-2.0-30M
- Dataset de preentrenamiento: https://huggingface.co/datasets/henryhale/luganda-pretrain2
- Receta MiniMind: https://github.com/jingyaogong/minimind
