# Kausp11/standard-wiki-360m

## Resumen

Standard 360M (Wikipedia) es un modelo de lenguaje de 361,8 millones de parámetros entrenado desde cero por el autor independiente Kausp11 sobre texto plano de Wikipedia en inglés. Se publica como modelo base (solo preentrenamiento, sin formato de chat) y actúa como control experimental del modelo `Kausp11/querylm-wiki-360m`, que comparte arquitectura y presupuesto de cómputo pero fue preentrenado con bloques de búsqueda en línea insertados en el texto. El objetivo declarado es medir qué aporta el preentrenamiento aumentado con búsqueda frente a un entrenamiento equivalente sobre texto plano.

La arquitectura replica la configuración de SmolLM2-360M (32 capas, anchura 960, 15 cabezas de atención) con una longitud de contexto de 4.096 tokens, y se carga con `transformers` estándar mediante la clase `LlamaForCausalLM`, sin código personalizado. El tokenizador es el de SmolLM2 ampliado con cuatro tokens de búsqueda (vocabulario de 49.156 entradas), aunque el modelo nunca vio esos tokens durante el entrenamiento.

Es relevante ahora como artefacto de investigación reproducible: publica el presupuesto exacto de entrenamiento (32,1 mil millones de tokens, 6,06e19 FLOPs, 30.600 actualizaciones), el hash SHA-256 de los pesos y la procedencia del checkpoint, lo que permite replicar o auditar el experimento. No es un modelo orientado a producto ni a uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (configuración SmolLM2-360M: 32 capas, anchura 960, 15 cabezas) |
| Parametros totales | 361.824.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors en bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible (el autor indica que se añadirá; el texto de entrenamiento es Wikipedia CC BY-SA 4.0) |
| Formato de pesos | safetensors (`model.safetensors`, sha256 `7050bce1252f7d58c71f9619bc6365a09ace4a31f6a1fe2d09329f928b309162`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la configuración de SmolLM2-360M: 32 capas, dimensión de modelo 960 y 15 cabezas de atención, con un contexto máximo de 4.096 tokens. Se inicializó desde cero y se entrenó con el script causal-LM del `Trainer` de Hugging Face. El tokenizador parte del de SmolLM2 con cuatro tokens adicionales de búsqueda, dando un vocabulario de 49.156 entradas; esos tokens existen en el vocabulario pero no aparecen en los datos de entrenamiento de este modelo.

Los datos de preentrenamiento son los mismos 4.885.877 artículos de Wikipedia en inglés que usa el modelo emparejado QueryLM, pero en texto plano, sin bloques de búsqueda ni anotación; se reservaron 54.582 artículos adicionales para evaluación. El entrenamiento usó AdamW con LR pico de 5e-4 y weight decay 0,1, lotes de 256 secuencias de 4.096 tokens (1.048.576 tokens por actualización), calentamiento del 2 % y decaimiento coseno hasta cero durante 8 épocas. El presupuesto total fue de 30.600 actualizaciones, 32,1 mil millones de tokens y 6,06e19 FLOPs en bf16, aproximadamente un 4 % menos de cómputo que el modelo QueryLM emparejado (6,31e19 FLOPs). No se aplicó RLHF, DPO ni ningún ajuste posterior; es exclusivamente un modelo base.

## Capacidades

- Generación de texto por continuación: completa secuencias a partir de un prefijo; no mantiene formato de chat ni roles.
- Respuesta a preguntas de conocimiento enciclopédico mediante few-shot prompting, como demuestra el ejemplo de la model card (preguntas y respuestas separadas por líneas).
- Capacidad de seguir el formato de pocos ejemplos incluidos en el prompt (patrón pregunta/respuesta).
- Cobertura lingüística limitada al inglés.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo de razonamiento (thinking), visión ni audio.
- No tiene entrenamiento de seguridad, rechazo ni alineación.

## Casos de uso

- Estudio controlado de preentrenamiento aumentado con búsqueda: usar este modelo junto a `Kausp11/querylm-wiki-360m` para aislar el efecto de los bloques de búsqueda en el mismo presupuesto de cómputo, comparando pérdida y calidad de generación sobre el conjunto de evaluación retenido.
- Reproducción de experimentos a pequeña escala: el presupuesto de entrenamiento documentado (30.600 pasos, 32,1B tokens, 6,06e19 FLOPs) y el hash de los pesos permiten replicar el entrenamiento o verificar la integridad del checkpoint en un entorno de investigación.
- Evaluación de tokenizadores: al compartir vocabulario con QueryLM pero no haber visto los tokens de búsqueda, sirve para analizar cómo se comporta un modelo ante tokens presentes en el vocabulario pero ausentes en el corpus.
- Generación de texto enciclopédico de dominio estrecho: continuación de artículos o pasajes de Wikipedia en inglés en tareas de laboratorio donde no se requiere exactitud factual.
- Baseline en pipelines de evaluación de modelos pequeños: punto de referencia para comparar modelos de ~360M parámetros en tareas de modelado de lenguaje sobre texto enciclopédico.
- Docencia y experimentación con `transformers`: al cargarse con `LlamaForCausalLM` sin código personalizado y ocupar 0,7 GB en el repositorio, es adecuado para prácticas de inferencia en CPU o GPU modesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de evaluación se añadirán más adelante.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,7 GB para los pesos (361,8M parámetros × 2 bytes), más memoria para el contexto y las activaciones; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en CPU, como demuestra el ejemplo de la model card ejecutado en CPU con bfloat16.
- GPU de datacenter (A100, H100) no necesarias para inferencia; solo tendrían sentido para reentrenar el modelo.
- Opciones de despliegue: `transformers` estándar (probado con la versión 4.56.0 y torch 2.8.0); el repositorio está etiquetado como compatible con text-generation-inference y endpoints, aunque no se documentan configuraciones específicas para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Standard 360M (Wikipedia) | 361,8M | 4.096 | no disponible | Modelo base, solo inglés, entrenado desde cero sobre Wikipedia |
| `Kausp11/querylm-wiki-360m` | ~360M (misma arquitectura) | 4.096 | no disponible | Modelo emparejado, preentrenado con bloques de búsqueda y ~4 % más de cómputo |
| `Kausp11/standard-wiki-360m-sft-search` | ~360M (misma arquitectura) | 4.096 | no disponible | Versión con ajuste fino de chat del mismo autor |
| SmolLM2-360M (HuggingFaceTB) | 362M | 8.192 (según la ficha pública de SmolLM2) | Apache 2.0 (según la ficha pública de SmolLM2) | Referencia de arquitectura; el modelo de esta ficha replica su configuración pero se entrena desde cero |

Los datos de SmolLM2-360M proceden de conocimiento general sobre ese modelo y no de la información proporcionada en esta búsqueda; verificar antes de citarlos. No se dispone de resultados de benchmarks del modelo analizado para comparar rendimiento.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un producto; el autor lo declara explícitamente como modelo de control para estudiar preentrenamiento aumentado con búsqueda.
- Modelo base sin formato de chat: no sigue instrucciones conversacionales ni mantiene roles.
- Entrenado exclusivamente con texto de Wikipedia en inglés: rendimiento débil fuera de texto enciclopédico y sin cobertura de otros idiomas.
- Sin entrenamiento de seguridad, rechazo ni alineación: puede generar contenido inapropiado o dañino sin filtro.
- Alta propensión a afirmar hechos falsos con fluidez (alucinación), según advierte la propia model card.
- Licencia no especificada: no hay autorización explícita de uso comercial; el texto de entrenamiento es Wikipedia CC BY-SA 4.0, lo que puede imponer obligaciones de atribución o compartir igual.
- Contexto limitado a 4.096 tokens.
- El modelo nunca vio los cuatro tokens de búsqueda de su vocabulario durante el entrenamiento, por lo que su comportamiento ante ellos es indefinido.
- Sin resultados de evaluación publicados: no hay evidencia cuantitativa de su calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kausp11/standard-wiki-360m
- Modelo emparejado (QueryLM con bloques de búsqueda): https://huggingface.co/Kausp11/querylm-wiki-360m
- Versión con ajuste fino de chat: https://huggingface.co/Kausp11/standard-wiki-360m-sft-search
- Nombre anterior de los mismos pesos: `Kausp11/wiki6m-360m-v2-base8` (raíz del repositorio)
- Paper, blog, repositorio de código y demos: no disponibles en la información proporcionada.
