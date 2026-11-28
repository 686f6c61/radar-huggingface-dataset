# NGARiAI/ngari-ft-distilled-v3

## Resumen

NGARi ngari-ft-distilled-v3 es un modelo de lenguaje de 1.543.714.304 parametros (aproximadamente 1,5 mil millones) derivado de Qwen/Qwen2.5-1.5B-Instruct mediante un proceso de destilacion y ajuste fino supervisado. Lo desarrolla NGARiAI dentro de su programa "Open Source Friday", una iniciativa de publicacion periodica de checkpoints con sus resultados de evaluacion completos, incluidas las metricas negativas. Se distribuye unicamente como cuantizacion GGUF Q4_K_M (0,99 GB) y esta pensado para despliegue en entornos de borde (edge) y soberanos, con compatibilidad declarada con Ollama y endpoints compatibles.

El modelo resuelve el problema de disponer de un checkpoint pequeno, ligero y con licencia permisiva (Apache-2.0) para tareas conversacionales en ingles, con trazabilidad completa del linaje de entrenamiento: el dataset y la receta estan publicados en el repositorio `NGARiAI/ngari-datasets`. La version v3 es una reconstruccion del corpus de destilacion tras el "colapso" de la v2, que habia degradado el tool calling a 0,00; en v3 se recupera hasta 0,35 (0,45 en la re-ejecucion r1).

Es relevante ahora por su enfoque de transparencia radical: la model card publica las puntuaciones de evaluacion por ejemplo (chat eval 0,4188; tool eval 0,35) y advierte explicitamente de que no es un modelo de tool calling, recomendando `ngari-tool` para ese fin. No obstante, el modelo tiene un numero de descargas y likes de cero en el momento de la consulta y una unica cuantizacion publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct); detalles especificos no disponibles |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, pero la card no lo confirma para este checkpoint) |
| Tipos de cuantizacion | Q4_K_M (unica publicada, 0,99 GB) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-1.5B-Instruct, un transformer decoder-only de aproximadamente 1,5 mil millones de parametros, sin modificaciones estructurales declaradas ("unmodified except for the adapter or full fine-tune"). El checkpoint se obtiene mediante destilacion y ajuste fino sobre un corpus reconstruido tras la version v2, cuyo proceso de destilacion colapso el rendimiento en tool calling.

La model card indica que el dataset de entrenamiento esta publicado en `NGARiAI/ngari-datasets` y que la receta completa se encuentra en el directorio `training/` del mismo repositorio. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. La evaluacion se realizo sobre un conjunto de 20 ejemplos, con re-ejecuciones (r1) documentadas en ficheros JSON por ejemplo.

## Capacidades

- Generacion de texto conversacional en ingles, con un rendimiento medio en la evaluacion de chat de 0,4188.
- Tool calling / function calling limitado: puntuacion de 0,35 (0,45 en r1), recuperada respecto al 0,00 de la v2, pero muy por debajo del modelo dedicado `ngari-tool`.
- Razonamiento multi-turno basico, heredado del modelo base Instruct.
- Capacidades multilingues limitadas al ingles segun la declaracion del autor.
- No se declaran capacidades de vision, audio ni modo de pensamiento (thinking mode).
- Compatibilidad con endpoints y con Ollama, orientada a despliegue en borde.

## Casos de uso

- Asistente conversacional ligero en dispositivo: al ocupar menos de 1 GB en Q4_K_M, puede ejecutarse en portatiles y mini-PC sin GPU dedicada para tareas de chat de baja latencia en ingles.
- Clasificacion y etiquetado de texto en pipelines de datos: su tamano permite procesar grandes volumenes de documentos en CPU con un coste energetico minimo.
- Prototipado rapido de agentes conversacionales: util para validar flujos de dialogo antes de migrar a modelos mayores, dado que comparte interfaz con el ecosistema Qwen.
- Generacion de respuestas en aplicaciones de atencion al cliente de dominio acotado, siempre que se limite a turnos cortos y no se dependa de tool calling fiable.
- Entornos con requisitos de soberania de datos: el modelo puede desplegarse integramente en infraestructura propia y su linaje de entrenamiento es auditable.
- Educacion y experimentacion: la publicacion del dataset y la receta de entrenamiento permite reproducir el ajuste fino y estudiar el efecto del colapso y recuperacion del corpus de destilacion.
- Filtrado y resumen de textos en ingles dentro de aplicaciones de escritorio o moviles con recursos limitados.

## Benchmarks y rendimiento

Los unicos datos publicados son las evaluaciones internas del autor sobre 20 ejemplos:

| Evaluacion | Puntuacion | Notas |
|---|---|---|
| Chat eval (avg_score) | 0,4188 | Mejor de la linea de chat de 1.5B |
| Chat eval r1 (re-ejecucion) | 0,4167 | Re-ejecucion del mismo conjunto |
| Tool eval | 0,35 | Recuperado desde 0,00 en v2 |
| Tool eval r1 (re-ejecucion) | 0,45 | Re-ejecucion del mismo conjunto |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con la cuantizacion Q4_K_M publicada (0,99 GB de pesos); en la practica, unos 1,5-2 GB incluyendo contexto y overhead del runtime.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060); tambien A100/H100 para despliegues por lotes de alto throughput.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas, e incluso en CPU pura.
- Opciones de despliegue: Ollama (soporte declarado), llama.cpp (formato GGUF), y servidores compatibles con endpoints; vLLM y TGI no estan confirmados para GGUF en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NGARi ngari-ft-distilled-v3 | ~1,5B | No disponible | Apache-2.0 | GGUF Q4_K_M | Chat eval 0,4188; tool eval 0,35 |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 tokens | Apache-2.0 | Safetensors, GGUF | Modelo base; sin datos de evaluacion comparables en esta ficha |
| NGARi ngari-tool | No disponible | No disponible | No disponible | No disponible | Modelo dedicado a tool calling del mismo autor, evaluado sobre el mismo conjunto de 20 ejemplos |

No se dispone de datos de benchmarks estandar para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Tool calling poco fiable: la propia model card advierte de que no es un modelo de tool calling y recomienda `ngari-tool` para ese uso.
- Riesgo de alucinacion: inherente a un modelo de 1,5B ajustado por destilacion; no se han publicado evaluaciones de factualidad.
- Idiomas: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Contexto: la longitud de contexto efectiva de este checkpoint no esta documentada, aunque el modelo base soporta 32.768 tokens.
- Sesgos: no se documentan analisis de sesgo; al derivar de Qwen2.5, puede heredar los sesgos del corpus original.
- Madurez: cero descargas y cero likes en el momento de la consulta; una unica cuantizacion publicada y evaluaciones sobre solo 20 ejemplos, lo que limita la significacion estadistica de las puntuaciones.
- Licencia: Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion; la model card insta a leer las metricas antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NGARiAI/ngari-ft-distilled-v3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset y receta de entrenamiento: https://huggingface.co/datasets/NGARiAI/ngari-datasets
- Coleccion Open Source Friday: https://huggingface.co/collections/NGARiAI/open-source-friday-6b0a5e2732568212b40439a4
- Programa y reglas: https://ngari.ai/open-source-friday
