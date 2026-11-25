# 3adel25/leftover-recipe-generator-qwen1.5b

## Resumen

Leftover Recipe Generator es un ajuste fino del modelo Qwen2.5-1.5B-Instruct, desarrollado por Adel Hani Mohamed Adlan (usuario 3adel25 en Hugging Face), orientado a transformar una lista de ingredientes sobrantes de la nevera en recetas de cocina estructuradas paso a paso. El modelo parte de una arquitectura transformer causal de 1.543.714.304 parámetros y se ha adaptado mediante QLoRA sobre el modelo base, manteniendo la licencia Apache 2.0 del original.

El problema que aborda es concreto: reducir el desperdicio alimentario doméstico mediante la generación de ideas de comida creativas y prácticas restringidas a los ingredientes disponibles. La model card declara explícitamente que el ajuste busca evitar la alucinación de ingredientes externos, un comportamiento habitual en modelos generalistas cuando se les pide cocinar con inventario limitado.

Su relevancia actual radica en dos factores: por un lado, demuestra que un modelo de 1,5B parámetros puede especializarse de forma útil con un dataset sintético pequeño y QLoRA; por otro, su tamaño compacto permite despliegue en GPUs de baja VRAM, CPU o incluso dispositivos móviles mediante cuantización, lo que lo hace adecuado para aplicaciones locales de cocina sin dependencia de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit NF4 con doble cuantizacion (entrenamiento); el repositorio publica pesos safetensors en fp16, aptos para cuantizacion posterior a GGUF o AWQ |
| Idiomas soportados | ingles (unico idioma declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen2.5-1.5B-Instruct, un transformer causal decoder-only de la familia Qwen2 con 1.543.714.304 parámetros. No se ha modificado la arquitectura base: el ajuste se realizó con QLoRA, es decir, cuantizacion 4-bit NF4 con doble cuantizacion mediante bitsandbytes y adaptadores LoRA de rango r=16 y alpha=32 aplicados sobre los módulos de atención y MLP (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj), con dropout de 0,05.

El dataset de entrenamiento es sintético y propio (custom-leftover-recipes), generado mediante orquestación con LLM a través de la API de Groq y Qwen 2.5. Cada muestra contiene una instrucción con rol de chef creativo, una entrada con una combinación aleatoria de 3 a 6 ingredientes comunes de nevera y especias, y una salida en Markdown con título de receta, desglose de ingredientes, instrucciones paso a paso y un consejo del chef. El entrenamiento usó AdamW con learning rate 2e-4, scheduler coseno con 5 % de warmup, batch efectivo de 8 (2 por dispositivo con acumulación de 4), 3 épocas y precisión fp16. No se documenta el volumen total de tokens ni la composición exacta del dataset más allá de esta descripción.

## Capacidades

- Generación de recetas estructuradas en Markdown a partir de listas de ingredientes sobrantes.
- Restricción de ingredientes: el ajuste está orientado a no introducir ingredientes no disponibles en la entrada.
- Salida con secciones definidas: título, ingredientes, instrucciones paso a paso y consejo del chef.
- Creatividad culinaria controlada: combinaciones de 3 a 6 ingredientes y especias.
- Conversación multi-turno heredada del modelo base Qwen2.5-1.5B-Instruct mediante plantilla de chat.
- Generación de texto general en inglés, aunque degradada respecto al modelo base por el ajuste especializado.
- No se declara soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Generación de recetas domésticas con inventario limitado: el usuario introduce los ingredientes disponibles en la nevera y el modelo devuelve una receta completa con instrucciones, evitando sugerir ingredientes no presentes gracias al ajuste específico.
- Reducción de desperdicio alimentario: integrado en una aplicación de gestión de despensa, el modelo propone comidas para consumir productos próximos a caducar antes de que se estropeen.
- Asistente de cocina en local o en el borde: por su tamaño de 1,5B parámetros, puede desplegarse cuantizado en CPU o en GPUs de baja VRAM, permitiendo una app de recetas sin conexión ni costes de API.
- Planificación semanal de menús: encadenando varias llamadas con distintos inventarios, el modelo puede generar propuestas de comidas para varios días a partir de los mismos ingredientes base.
- Educación culinaria y experimentación: útil para aprender técnicas básicas y combinaciones de sabores mediante recetas explicadas paso a paso con consejos del chef.
- Prototipado de asistentes conversacionales especializados: sirve como ejemplo reproducible de ajuste QLoRA sobre un SLM para dominios verticales, reutilizable como plantilla para otros dominios con datasets sintéticos.
- Filtrado de alérgenos en primera pasada: aunque no sustituye la verificación manual, el modelo puede generar variantes de recetas excluyendo ingredientes indicados en el prompt, siempre con revisión humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 5 GB para contextos moderados.
- VRAM estimada en cuantizacion 8-bit: alrededor de 1,6 GB para pesos; en 4-bit, alrededor de 0,8-1 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM en fp16 (RTX 3050, RTX 4060, T4); en cuantizacion 4-bit cabe en GPUs integradas y en CPU.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en CPU mediante llama.cpp u Ollama con GGUF.
- Opciones de despliegue: transformers (referencia en la model card), text-generation-inference (etiqueta declarada), vLLM, llama.cpp, Ollama y TGI, previa conversion a GGUF cuando corresponda.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamaño del modelo se espera una generación interactiva en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion | Disponibilidad |
|---|---|---|---|---|---|
| 3adel25/leftover-recipe-generator-qwen1.5b | 1,54B | no disponible | Apache 2.0 | Recetas con sobras (QLoRA) | Hugging Face, 307 descargas |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (dato del modelo base, no verificado en esta ficha) | Apache 2.0 | Instrucciones generales | Hugging Face |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens (dato del modelo base) | Apache 2.0 (Qwen license para algunos tamanos) | Instrucciones generales | Hugging Face |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | Instrucciones generales | Hugging Face |

La comparativa se limita a parametros, licencia y disponibilidad: no hay benchmarks publicados para el modelo ajustado que permitan comparar calidad de recetas frente al modelo base u otras alternativas.

## Limitaciones y advertencias

- Entrenado únicamente en inglés: no se garantiza calidad en castellano ni en otros idiomas, a pesar de que el modelo base Qwen2.5 es multilingüe.
- Dataset sintético generado por LLM: puede heredar sesgos, imprecisiones culinarias o patrones repetitivos del generador, y no se documenta su tamaño ni su diversidad.
- Riesgo de alucinación culinaria: aunque el ajuste busca ceñirse a los ingredientes dados, puede introducir cantidades, tiempos de cocción o pasos incorrectos; requiere revisión humana antes de cocinar.
- Precisión nutricional no fiable: la model card advierte que las estimaciones calóricas y nutricionales son generalizadas y no sustituyen asesoramiento dietético profesional.
- Alergias: el modelo no garantiza la detección de alérgenos; es obligatoria la verificación manual en casos de alergias graves.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el modelo ni sobre los datos sintéticos de entrenamiento.
- Contexto: no se especifica la longitud de contexto efectiva tras el ajuste; conviene limitar las peticiones a listas de ingredientes cortas.
- Madurez del proyecto: creado en octubre de 2026, con 307 descargas y 1 like; no hay evidencia de mantenimiento ni de evaluación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/3adel25/leftover-recipe-generator-qwen1.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentación de QLoRA (paper): https://arxiv.org/abs/2305.14314
- Documentación de bitsandbytes: https://github.com/bitsandbytes-foundation/bitsandbytes
- Documentación de transformers: https://huggingface.co/docs/transformers
- Documentación de text-generation-inference: https://huggingface.co/docs/text-generation-inference
- Documentación de llama.cpp: https://github.com/ggml-org/llama.cpp
