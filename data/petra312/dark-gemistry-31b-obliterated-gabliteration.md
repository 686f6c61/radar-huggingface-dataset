# petra312/Dark-Gemistry-31B-OBLITERATED-gabliteration

## Resumen

Dark-Gemistry-31B-OBLITERATED-gabliteration es un modelo de lenguaje de 32.682.372.656 parámetros (≈32,7B) derivado de `Nimbz/Gemma-4-Dark-Gemistry-31B` mediante abliteración, una técnica de ingeniería de activaciones que elimina el comportamiento de rechazo (refusal) del modelo. La modificación se ha aplicado con el método denominado `gabliteration` a través de la herramienta OBLITERATUS, desarrollada por elder-plinius y publicada en GitHub.

No se trata de un modelo entrenado desde cero ni de un fine-tuning supervisado: es una intervención sobre los pesos del modelo base para suprimir las direcciones de activación asociadas al rechazo. El autor lo etiqueta como `gemma4`, `uncensored`, `obliteratus` y `4-bit`/`bitsandbytes`, con soporte declarado únicamente para inglés.

El repositorio ocupa 22,5 GB y, en el momento de la consulta, registra 0 descargas y 0 likes, por lo que es una publicación muy reciente y sin validación comunitaria. Su interés es principalmente experimental: permite estudiar el efecto de la abliteración sobre un modelo de ~32B y cubrir casos donde el refusal del modelo base resulta limitante. No hay información pública sobre longitud de contexto, licencia ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta `gemma4`; detalles no disponibles) |
| Parámetros totales | 32.682.372.656 (≈32,7B) |
| Parámetros activos | No aplica (no se documenta como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 4-bit vía bitsandbytes (según tags); no se detallan otras variantes ni se incluyen pesos GGUF |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Modelo base | `Nimbz/Gemma-4-Dark-Gemistry-31B` |
| Método de modificación | `gabliteration` (abliteration) vía OBLITERATUS |
| Tamaño del repositorio | 22,5 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna. La etiqueta `gemma4` sugiere que el modelo base pertenece a la familia Gemma 4, lo que implicaría un transformer decoder-only, pero no se confirman capas, atención, dimensionalidad ni contexto. Tampoco se especifica si el modelo base incorpora componentes multimodales; no debe asumirse.

El proceso aplicado no es un entrenamiento: es una abliteración realizada con OBLITERATUS, que actúa sobre las activaciones del modelo para eliminar la dirección que gobierna las respuestas de rechazo. No se documentan tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni ninguna innovación técnica adicional. Tampoco se indica si la intervención se aplicó a todas las capas o solo a un subconjunto, ni si se realizó una evaluación posterior del daño colateral en capacidades.

## Capacidades

- Generación de texto en inglés con el conocimiento y estilo heredados del modelo base.
- Comportamiento de rechazo suprimido: el modelo está diseñado para no declinar peticiones que el modelo original rechazaría.
- Conversación multi-turno (la longitud de contexto no está documentada, por lo que no puede garantizarse un límite concreto).
- Escritura creativa, incluyendo narrativa con temas oscuros o sensibles.
- Respuestas a instrucciones generales de conocimiento, redacción y explicación.
- No se ha confirmado soporte de tool calling, function calling, agentes, visión, audio, modo thinking ni capacidades multilingües más allá del inglés.
- No se ha confirmado la preservación de las capacidades originales del modelo base tras la abliteración.

## Casos de uso

- **Investigación en seguridad de IA y red teaming**: sirve como objeto de estudio para analizar qué mecanismos internos implementan el refusal y cómo varían las respuestas tras la abliteración, comparándolo con el modelo base.
- **Escritura de ficción oscura y guiones**: el modelo puede abordar tramas violentas, moralmente ambiguas o explícitas sin las negativas del modelo original, útil en narrativa adulta y guionización.
- **Generación de datos sintéticos para dominios sensibles**: permite producir corpus de diálogo o narrativa que un modelo alineado rechazaría, siempre que el uso cumpla la normativa aplicable.
- **Prototipado de chatbots de rol en inglés**: para personajes con personalidades agresivas o sin filtros, en entornos controlados y con supervisión humana.
- **Estudio comparativo del impacto de la abliteración en la calidad**: evaluar degradación en razonamiento, coherencia y conocimiento frente al modelo base en tareas estándar.
- **Experimentación con cuantización 4-bit**: al publicarse con soporte bitsandbytes, permite probar despliegues de ~32B en hardware de una sola GPU y medir la pérdida de calidad asociada.
- **Base para fine-tuning específico**: punto de partida cuando el refusal del modelo original interfiere en dominios legítimos como análisis de contenido, moderación o simulación de adversarios.

En todos los casos debe tenerse en cuenta que la licencia no está declarada y que el modelo no cuenta con validación comunitaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluaciones de refusal o daño colateral tras la abliteración, y tampoco se han encontrado comparaciones independientes.

## Requisitos de hardware

- **VRAM estimada para inferencia** (cálculo a partir de 32,68B parámetros):
  - bf16/fp16: ≈65 GB de pesos, más caché KV.
  - int8/fp8: ≈33 GB.
  - 4-bit: ≈17 GB, más overhead de bitsandbytes y caché KV.
- **GPU recomendadas**:
  - bf16: A100 80 GB, H100 80 GB o 2× A100 40 GB con paralelismo de tensor.
  - int8/fp8: A100 40/80 GB, H100, L40S 48 GB.
  - 4-bit: RTX 4090 24 GB, RTX 3090 24 GB, A6000 48 GB, L40S.
- **¿Cabe en GPU de consumo?** Sí, en 4-bit cabe en RTX 4090/3090 de 24 GB, con margen limitado para contexto; en bf16 no cabe en ninguna GPU de consumo actual.
- **Opciones de despliegue**: transformers con `bitsandbytes` (el ejemplo de la model card usa `AutoModelForCausalLM`), vLLM y TGI para bf16/fp8, llama.cpp u Ollama solo si se convierten los pesos a GGUF (no se incluyen en el repositorio).
- **Latencia y throughput**: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dark-Gemistry-31B-OBLITERATED (este) | 32,7B | No disponible | Sin benchmarks publicados | No disponible | HuggingFace, safetensors, 4-bit |
| Qwen2.5-32B-Instruct | ≈32,5B | 131.072 tokens | Benchmarks públicos del autor | Apache 2.0 | HuggingFace, múltiples formatos |
| Gemma 3 27B IT | 27B | 128.000 tokens | Benchmarks públicos del autor | Licencia Gemma | HuggingFace, GGUF, Ollama |
| Mistral Small 3.1 24B | ≈23,6B | 128.000 tokens | Benchmarks públicos del autor | Apache 2.0 | HuggingFace, GGUF, Ollama |

La comparación es aproximada: este modelo no publica contexto, licencia ni métricas, por lo que no puede establecerse una equivalencia funcional con las alternativas. Las alternativas citadas son modelos alineados; la diferencia principal de este modelo es precisamente la supresión del refusal, no una mejora de capacidades.

## Limitaciones y advertencias

- **Ausencia de alineación de seguridad**: la abliteración elimina el refusal por diseño, por lo que el modelo puede generar contenido dañino, ilegal o explícito sin advertencia. No debe desplegarse en aplicaciones de cara al público sin filtros externos.
- **Licencia no declarada**: no puede confirmarse el uso comercial ni las condiciones de redistribución. El modelo base es de un tercero (`Nimbz`), y la licencia de Gemma suele imponer restricciones adicionales que aquí no se detallan.
- **Riesgo de degradación de capacidades**: la abliteración puede afectar a la coherencia, el razonamiento y la precisión del modelo base; no se han publicado evaluaciones que cuantifiquen ese daño.
- **Riesgo de alucinación**: inherente a los modelos de ~32B y no mitigado ni medido en esta publicación.
- **Solo inglés**: no hay soporte declarado de otros idiomas, incluido el castellano.
- **Contexto desconocido**: no puede planificarse un caso de uso que dependa de ventanas largas sin verificación previa.
- **Sin validación comunitaria**: 0 descargas y 0 likes; el repositorio no ha sido contrastado por terceros y su procedencia conviene verificarla antes de usarlo en producción.
- **Trazabilidad limitada**: no se documenta el proceso exacto de abliteración (capas afectadas, prompts utilizados, evaluación posterior), lo que dificulta reproducir o auditar el resultado.
- **Cuantización no especificada en detalle**: se etiqueta como 4-bit/bitsandbytes, pero no se confirma qué tensores están cuantizados ni la precisión exacta almacenada.

## Enlaces

- [HuggingFace: petra312/Dark-Gemistry-31B-OBLITERATED-gabliteration](https://huggingface.co/petra312/Dark-Gemistry-31B-OBLITERATED-gabliteration)
- [Modelo base: Nimbz/Gemma-4-Dark-Gemistry-31B](https://huggingface.co/Nimbz/Gemma-4-Dark-Gemistry-31B)
- [Repositorio de OBLITERATUS (elder-plinius)](https://github.com/elder-plinius/OBLITERATUS)
