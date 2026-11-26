# masahiroid/llm-jp-4.1-8b-thinking-gguf

## Resumen

`masahiroid/llm-jp-4.1-8b-thinking-gguf` es una conversión a formato GGUF del modelo japonés de razonamiento `llm-jp/llm-jp-4.1-8b-thinking`, desarrollado por el proyecto llm-jp (una colaboración académica japonesa). El modelo original es un transformer de 8.590.200.832 parámetros (aproximadamente 8,6 mil millones) orientado a tareas de razonamiento con modo "thinking", y esta conversión lo hace ejecutable en llama.cpp tanto en CPU como en GPU de consumo.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa práctica para desplegar un LLM japonés de razonamiento en hardware modesto mediante cuantizaciones de 4 y 3 bits; por otro, expone una limitación técnica concreta del ecosistema llama.cpp, ya que el tokenizer Unigram nativo de HF del modelo original no es compatible con el script de conversión estándar, lo que obligó al autor a aplicar un parche.

El autor advierte explícitamente de que se trata de una conversión comunitaria independiente y no de una release oficial: el proyecto llm-jp publica su propio GGUF oficial (BF16 más Q4_K_M calibrado con imatrix) y un fork de llama.cpp necesario para el parseo correcto de la plantilla de chat. Para producción, la model card recomienda usar el repositorio oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo de razonamiento con modo thinking); detalles internos del modelo base no disponibles |
| Parametros totales | 8.590.200.832 (aproximadamente 8,6 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (sin calibrar), IQ4_XS (imatrix japonesa), IQ3_M (imatrix japonesa) |
| Idiomas soportados | Japones (ja), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base `llm-jp/llm-jp-4.1-8b-thinking` mas alla de que se trata de un transformer de aproximadamente 8,6 mil millones de parametros con capacidad de razonamiento explicito (modo thinking, con bloques de salida tipo `<|channel|>`). No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

El aspecto tecnico mas destacable documentado en esta ficha es el proceso de conversion. El modelo original usa un tokenizer Unigram nativo de Hugging Face (`tokenizer.json`, sin binario sentencepiece), que el script de conversion estandar de llama.cpp no soporta: espera un `tokenizer.model` y falla. El autor aplico un parche (monkeypatch) que lee los pares (piece, score) directamente del campo `model.vocab` de `tokenizer.json`. Ademas, las cuantizaciones IQ4_XS e IQ3_M se calibraron con una imatrix calculada sobre texto japones de Aozora Bunko (416 fragmentos de 512 tokens, aproximadamente 213 mil tokens).

## Capacidades

- Generacion de texto en japones e ingles.
- Razonamiento con modo thinking: la salida puede incluir bloques de pensamiento delimitados por marcas tipo `<|channel|>` cuando se usa la plantilla de chat jinja.
- Respuesta a prompts de completado directo mediante `--no-jinja` en llama.cpp.
- Conversacion multi-turno (etiqueta `conversational` en el repositorio).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- No se documentan capacidades de vision, audio, tool calling ni agentes multi-paso en la informacion disponible.

## Casos de uso

- Razonamiento en japones en hardware de consumo: con el fichero IQ3_M (4,13 GB) el modelo cabe en maquinas con 8 GB de RAM, lo que permite ejecutar un LLM japones de razonamiento en portatiles sin GPU dedicada.
- Procesamiento de texto literario japones: la imatrix se calibro sobre Aozora Bunko, por lo que las cuantizaciones IQ estan ajustadas a registro literario clasico; util para tareas de analisis o generacion sobre corpus de ese estilo.
- Prototipado local de asistentes conversacionales en japones: la etiqueta `conversational` y el soporte de plantilla de chat permiten montar un chatbot basico con llama.cpp sin infraestructura cloud.
- Evaluacion comparativa de cuantizaciones: los tres ficheros publicados (Q4_K_M, IQ4_XS, IQ3_M) con sus valores de perplejidad permiten medir el compromiso calidad/tamano en un caso real.
- Despliegue en entornos con restricciones de memoria: IQ4_XS (4,82 GB) ofrece un equilibrio intermedio con solo aproximadamente un 3 % mas de perplejidad que el baseline Q4_K_M.
- Investigacion sobre tokenizers no estandar: el repositorio documenta el workaround para tokenizers Unigram de HF en llama.cpp, reutilizable para otros modelos con el mismo problema.
- Traduccion o generacion bilingue japones-ingles en local, dentro de las capacidades declaradas del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo aporta medidas de perplejidad internas sobre texto de Aozora Bunko no solapado con la imatrix (`llama-perplexity -c 512 --chunks 120`, aproximadamente 61 mil tokens):

| Fichero | Cuantizacion | imatrix | Tamano | Perplejidad |
|---|---|---|---|---|
| `llm-jp-4.1-8b-thinking-Q4_K_M.gguf` | Q4_K_M | ninguna (baseline) | 5,30 GB | 41,23 ± 0,81 |
| `llm-jp-4.1-8b-thinking-IQ4_XS-imat.gguf` | IQ4_XS | japonesa | 4,82 GB | 42,29 ± 0,84 |
| `llm-jp-4.1-8b-thinking-IQ3_M-imat.gguf` | IQ3_M | japonesa | 4,13 GB | 44,38 ± 0,88 |

El autor advierte de que los valores absolutos son altos porque el texto de evaluacion es japones literario antiguo, y que solo deben usarse para comparar los ficheros entre si. Una variante Q4_K_M con imatrix japonesa obtuvo 41,10 ± 0,81, dentro del margen de error del baseline, por lo que no se publico.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 5,3 GB para Q4_K_M, 4,8 GB para IQ4_XS y 4,1 GB para IQ3_M, mas el overhead de contexto y del runtime de llama.cpp.
- El fichero IQ3_M esta pensado para caber comodamente en maquinas con 8 GB de RAM.
- GPU recomendadas: no se especifican en la informacion disponible; al ser GGUF, puede ejecutarse en CPU y en GPU de consumo mediante offload de capas en llama.cpp.
- Cabe en GPU de consumo: si, en principio, dado el tamano de los ficheros (por debajo de 6 GB), aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-perplexity`); el ecosistema GGUF permite tambien otros runners compatibles, aunque no se documentan explicitamente en la model card.
- Latencia y throughput: no disponibles.
- Nota importante: para el parseo correcto de la plantilla de chat jinja se requiere el fork oficial `llm-jp/llama.cpp` (rama `llmjp-harmony-handler`); el llama.cpp estandar falla al interpretar la salida de chat de este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `masahiroid/llm-jp-4.1-8b-thinking-gguf` (esta ficha) | ~8,6 B | No disponible | GGUF (Q4_K_M, IQ4_XS, IQ3_M) | Apache 2.0 | Conversion comunitaria, sin calibrar en Q4_K_M |
| `llm-jp/llm-jp-4.1-8b-thinking-gguf` (oficial) | ~8,6 B | No disponible | GGUF (BF16 y Q4_K_M con imatrix) | Apache 2.0 | Release oficial del proyecto llm-jp; recomendada para produccion |
| `masahiroid/llm-jp-4.1-8b-thinking-4bit-mlx` | ~8,6 B | No disponible | MLX 4 bit | Apache 2.0 | Mismo autor, cuantizacion sin calibrar, para ecosistema Apple MLX |
| Modelo base `llm-jp/llm-jp-4.1-8b-thinking` | ~8,6 B | No disponible | Safetensors (BF16) | Apache 2.0 | Pesos originales; requiere conversion para llama.cpp |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Conversion no oficial: el autor indica explicitamente que no es una release del proyecto llm-jp y recomienda el repositorio oficial para produccion.
- Compatibilidad de chat limitada: llama.cpp estandar no parsea correctamente la salida de chat con jinja; se necesita el fork oficial `llmjp-harmony-handler`. Para completado directo se recomienda `--no-jinja`.
- Tokenizer problematico: el script de conversion estandar falla con este modelo; la conversion requirio un parche no soportado upstream, lo que anade riesgo de mantenimiento.
- Idiomas limitados a japones e ingles; no se documenta soporte de castellano.
- Perplejidad absoluta elevada en las pruebas publicadas (41-44) debido al corpus de evaluacion literario antiguo; no debe interpretarse como calidad general del modelo.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como todo LLM de 8 B, es esperable en tareas factuales.
- Sesgos conocidos: no documentados.
- Licencia Apache 2.0, permisiva para uso comercial, pero el autor no ofrece garantias sobre la conversion; conviene auditar el repositorio (incluye `SECURITY.md` con auditoria via `model-audit-lite`).
- Longitud de contexto no disponible: no se puede planificar su uso en tareas de contexto largo sin consultar la documentacion del modelo base.

## Enlaces

- Repositorio Hugging Face de esta conversion: https://huggingface.co/masahiroid/llm-jp-4.1-8b-thinking-gguf
- Modelo base: https://huggingface.co/llm-jp/llm-jp-4.1-8b-thinking
- GGUF oficial del proyecto llm-jp: https://huggingface.co/llm-jp/llm-jp-4.1-8b-thinking-gguf
- Fork de llama.cpp con soporte harmony: https://github.com/llm-jp/llama.cpp/tree/llmjp-harmony-handler
- Conversion MLX del mismo autor: https://huggingface.co/masahiroid/llm-jp-4.1-8b-thinking-4bit-mlx
- Herramientas de conversion del autor: https://github.com/masahiroid/mlx-coreml-conversion-toolkit
- Herramienta de auditoria de modelos: https://github.com/masahiroid/model-audit-lite
- llama.cpp: https://github.com/ggml-org/llama.cpp
