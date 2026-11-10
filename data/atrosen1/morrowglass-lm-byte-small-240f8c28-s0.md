# atrosen1/morrowglass-lm-byte-small-240f8c28-s0

## Resumen

`morrowglass-lm-byte-small-240f8c28-s0` es un modelo de lenguaje decoder-only de 1.869.504 parametros entrenado desde cero por Morrowglass Model Foundry, un laboratorio reproducible de modelos en miniatura. No es un modelo de proposito general: se ha entrenado exclusivamente sobre las obras completas de Shakespeare en dominio publico (Project Gutenberg eBook #100) y su unica funcion es continuar texto con un estilo shakespeariano. Su relevancia es didactica y metodologica: permite estudiar entrenamiento, evaluacion y servido de modelos pequenos en hardware de consumo, con todos los registros de ejecucion copiados por codigo y no escritos a mano.

La arquitectura es un transformer pre-LayerNorm de 4 capas, 4 cabezas de atencion y dimension oculta 192, con posiciones aprendidas, embeddings atados y una ventana de contexto de 256 tokens. El tokenizador es a nivel de byte UTF-8 con vocabulario de 256 entradas, lo que elimina la necesidad de ficheros de tokenizacion y simplifica el pipeline. El entrenamiento consistio en 10.000 pasos sobre 81.920.000 tokens con AdamW (lr 0,003) en MPS sobre un Apple M5 Pro, completandose en 924 segundos.

El modelo se publica con licencia MIT tanto para codigo como para pesos, y forma parte de un experimento pre-registrado que compara un transformer entrenado desde cero con lineas base basadas en conteo de n-gramas. Los resultados muestran que el transformer alcanza 1,993 bits por byte en validacion frente a 2,107 del mejor n-grama (kneser-ney-4 con bpe1024), apoyando la hipotesis del experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only pre-LayerNorm, 4 capas, 4 cabezas, d=192, posiciones aprendidas, embeddings atados |
| Parametros totales | 1.869.504 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles; texto de Shakespeare, ingles moderno temprano) |
| Licencia | MIT (codigo y pesos); texto de entrenamiento en dominio publico |
| Formato de pesos | safetensors (repo con `pytorch_model_hub_mixin` / `model_hub_mixin`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con pre-LayerNorm, cuatro capas y cuatro cabezas de atencion, con dimension de modelo 192 y embeddings atados entre la capa de entrada y la de salida. Usa posiciones aprendidas (no RoPE ni ALiBi) y un tokenizador de bytes UTF-8 con vocabulario de 256 simbolos, sin fichero de tokenizacion externo. El contexto maximo es de 256 tokens; las entradas mas largas se recortan a los ultimos 256 tokens.

El entrenamiento se realizo desde cero durante 10.000 pasos sobre 81.920.000 tokens, con AdamW y learning rate 0,003, sobre MPS en un Apple M5 Pro, en 924 segundos. Los datos son las obras completas de Shakespeare (Project Gutenberg eBook #100, sin boilerplate), divididas por obra con semilla fija: validacion = *As You Like It*, *Hamlet*, *Titus Andronicus*; test = *Macbeth*, *Pericles*, *Cymbeline*; el resto (incluidos los poemas) es entrenamiento. La seleccion del modelo uso solo validacion y el conjunto de test se abrio una unica vez el 2026-11-09, con registro en `reports/test_access_log.jsonl`. No se aplico RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generacion de texto autoregresiva por continuacion de prefijo, en estilo shakespeariano (pastiche).
- Modelado de lenguaje a nivel de byte: puede procesar cualquier texto UTF-8 sin tokenizador externo.
- Evaluacion de perplejidad y bits por byte sobre corpus de Shakespeare y wikitext-2.
- Inspeccion de atencion y ablaciones de decisiones de entrenamiento (utilidad de investigacion).
- Servido mediante endpoint compatible con OpenAI (`uv run morrowglass serve --model lm-byte-small-240f8c28-s0`).
- No soporta tool calling, function calling, agentes, multi-step reasoning, vision, audio ni modo thinking.
- No es multilingue: solo se ha entrenado con texto en ingles (Shakespeare).
- No esta ajustado por instrucciones ni para chat.

## Casos de uso

- Docencia sobre entrenamiento de modelos: sirve para mostrar de extremo a extremo como se entrena un transformer desde cero, con registros reproducibles de pasos, tokens y tiempo, en un portatil.
- Experimentos de servido e infraestructura: al caber en CPU, permite probar KV cache, cuantizacion y APIs compatibles con OpenAI sin coste de GPU, comparando latencias y throughput.
- Investigacion de tokenizacion a nivel de byte: util para estudiar como un vocabulario de 256 simbolos afecta la perplejidad frente a tokenizadores BPE en corpus pequenos.
- Ablaciones de arquitectura: su tamano permite ejecutar barridos de hiperparametros (learning rate, profundidad, atados de embeddings) en minutos sobre hardware de consumo.
- Analisis de atencion e interpretabilidad: con 4 capas y 4 cabezas, es posible inspeccionar mapas de atencion completos y correlacionarlos con estructura sintactica de Shakespeare.
- Evaluacion comparativa con lineas base estadisticas: se usa como referencia para comparar transformers pequenos con n-gramas (kneser-ney) en tareas de modelado de lenguaje.
- Generacion de pastiche literario controlado: en entornos de demostracion o arte generativo donde se acepta texto de estilo isabelino sin garantia de coherencia.

## Benchmarks y rendimiento

| Tarea / metrica | Resultado | Nota |
|---|---|---|
| Validacion Shakespeare (bits/byte) | 1,993 [1,981; 2,006] | IC bootstrap 95 %; ECE top-1 0,043 |
| Test Shakespeare (bits/byte) | 2,089 [2,075; 2,103] | test abierto una vez el 2026-11-09 |
| Linea base kneser-ney-4 con bpe1024 (bits/byte) | 2,107 | mejor n-grama comparado |
| lambada_openai (acc, 0-shot) | 0,0008 | lm-evaluation-harness |
| wikitext-2 (bits/byte) | 4,464 | lm-evaluation-harness |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (1,87 M parametros); en la practica cabe en CPU sin GPU.
- GPU recomendadas: innecesarias; cualquier GPU consumer (RTX 3060, RTX 4090) sobra ampliamente. Entrenamiento realizado en Apple M5 Pro via MPS.
- Cabe en cualquier GPU consumer y en CPU de portatil.
- Opciones de despliegue: libreria propia `morrowglass` (`MorrowglassHubLM.from_pretrained`), servidor compatible con OpenAI incluido en el repo (`uv run morrowglass serve`), y carga directa de safetensors con PyTorch. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el entrenamiento de 10.000 pasos (81,92 M tokens) tardo 924 s en MPS, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (bpb Shakespeare) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| morrowglass-lm-byte-small-240f8c28-s0 | 1,87 M | 256 | 1,993 (val) / 2,089 (test) | MIT | Hugging Face |
| Linea base kneser-ney-4 + bpe1024 (mismo repo) | n/a (n-grama) | n/a | 2,107 (val) | MIT (codigo) | Repo Morrowglass |
| GPT-2 small (referencia de tamano superior) | 124 M | 1.024 | no disponible en la informacion | MIT | Hugging Face |
| Modelos tipo nanoGPT/TinyStories | ~1-15 M | variable | no disponible en la informacion | variable | Repos publicos |

## Limitaciones y advertencias

- Aproximadamente 2 M parametros entrenados sobre ~4,5 MB de texto de un solo autor: la salida es pastiche con frecuentes sinsentidos y pierde el hilo dentro de una frase.
- Contexto de 256 tokens; prompts mas largos se recortan a los ultimos 256 tokens.
- Las probabilidades son puntuaciones del modelo, no confianza calibrada por token.
- Sin ajuste de seguridad: las obras de Shakespeare contienen violencia y prejuicios de epoca que las muestras pueden reproducir.
- Una sola semilla de entrenamiento; el entrenamiento en MPS no es reproducible bit a bit.
- No apta para generacion orientada al usuario, respuestas factuales, chat ni ingles moderno; el uso previsto es docencia, medicion e investigacion.
- Rendimiento muy bajo en tareas estandar (lambada_openai acc 0,0008; wikitext-2 4,464 bpb), coherente con su escala.
- Licencia MIT permite uso comercial de codigo y pesos, pero el modelo no ofrece ninguna garantia de calidad para produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/atrosen1/morrowglass-lm-byte-small-240f8c28-s0
- Repositorio del proyecto Morrowglass Model Foundry: https://github.com/AlexRosen23/morrowglass-model-foundry
- Texto de entrenamiento (Project Gutenberg eBook #100): https://www.gutenberg.org/ebooks/100
- EleutherAI lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
