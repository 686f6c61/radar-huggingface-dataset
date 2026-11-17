# EhsaasBawa16/Novius-Argis

## Resumen

Novius-Argis es un ajuste fino (fine-tuning) del modelo DeepSeek-R1-Distill-Qwen-7B, distribuido por el usuario EhsaasBawa16 bajo licencia Apache 2.0. Se trata de un modelo de generacion de texto de 7.000 millones de parametros construido sobre la arquitectura Qwen2, destilado originalmente del razonamiento de DeepSeek-R1 y posteriormente afinado mediante la libreria Unsloth y TRL de Hugging Face. El repositorio ocupa 9,8 GB en formato safetensors y esta etiquetado para su uso con transformers y text-generation-inference.

El modelo hereda la capacidad de razonamiento encadenado (chain-of-thought) caracteristica de la familia DeepSeek-R1, por lo que esta orientado a tareas que requieren pasos intermedios de razonamiento antes de emitir una respuesta. El autor declara unicamente el idioma ingles en la model card, sin documentar el proceso de entrenamiento, el dataset utilizado ni los hiperparametros del ajuste fino.

La relevancia de esta ficha es limitada: el modelo no registra descargas ni interacciones en el momento de la consulta, no publica resultados de evaluacion y la documentacion disponible es minimalista. Debe tratarse como un experimento de ajuste fino comunitario, no como un modelo listo para produccion sin una evaluacion previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con destilacion de razonamiento de DeepSeek-R1 |
| Parametros totales | 7.000 millones (aproximado, heredado del modelo base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2-7B soporta 32.768 tokens, pero el autor no lo confirma) |
| Tipos de cuantizacion | No disponible (el modelo base de partida estaba cuantizado en 4 bits con bitsandbytes; el repositorio publicado esta en safetensors sin especificar precision) |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Qwen2, un transformer decoder-only con atencion por ventanas deslizantes y atencion completa combinadas, mecanismo heredado del modelo base DeepSeek-R1-Distill-Qwen-7B. Este ultimo se obtuvo destilando las trayectorias de razonamiento de DeepSeek-R1 en un Qwen2-7B, de modo que el modelo resultante aprende a generar cadenas de pensamiento antes de la respuesta final. Novius-Argis anade un ajuste fino adicional sobre esa base.

El autor indica que el entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, lo que implica un ajuste supervisado (SFT) o posiblemente DPO, aunque no se especifica cual de las dos tecnicas se empleo. No se documenta el numero de tokens de entrenamiento, la composicion del dataset, la presencia de RLHF ni los hiperparametros utilizados. El modelo de partida estaba cuantizado en 4 bits (sufijo bnb-4bit), pero se desconoce si el ajuste fino se realizo sobre esa version cuantizada o si se desquantizo previamente.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de plantillas de chat heredadas del modelo base.
- Razonamiento multi-paso mediante cadenas de pensamiento (thinking mode), caracteristica distintiva de la familia DeepSeek-R1.
- Resolucion de problemas matematicos y logicos que requieren descomposicion en pasos intermedios.
- Generacion de codigo en lenguajes habituales, aunque sin datos de evaluacion que lo confirmen.
- Soporte de tool calling y function calling: no documentado por el autor; probablemente heredado del modelo base, pero no confirmado.
- Capacidades de agente y razonamiento multi-turno: no documentadas.
- Capacidades multilingues: limitadas al ingles segun la model card, aunque el modelo base Qwen2 tiene cobertura multilingue que el ajuste fino podria haber degradado.
- Vision y audio: no soportados.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: el modelo puede gestionar dialogos multi-turno con plantilla de chat estandar de transformers, adecuado para validar flujos antes de invertir en un modelo mayor.
- Razonamiento matematico asistido: util para generar explicaciones paso a paso de problemas algebraicos o de logica, aprovechando la destilacion de DeepSeek-R1.
- Generacion de codigo en entornos de desarrollo: puede integrarse en un pipeline local con transformers para autocompletar funciones o explicar fragmentos, siempre con revision humana.
- Experimentacion academica sobre destilacion y ajuste fino: sirve como caso de estudio de como un ajuste fino comunitario con Unsloth modifica el comportamiento de un modelo destilado.
- Educacion y tutoria automatizada: la generacion de cadenas de razonamiento permite mostrar al estudiante el proceso de resolucion, no solo la respuesta.
- Evaluacion comparativa de ajustes finos: util como linea base en estudios que midan la degradacion o mejora respecto al modelo base DeepSeek-R1-Distill-Qwen-7B.
- Despliegue en hardware de consumo: al tratarse de un modelo de 7B, puede ejecutarse en una GPU consumer con cuantizacion adecuada para pruebas locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 14-16 GB, incluyendo pesos y cache KV.
- VRAM estimada en cuantizacion 8 bits: aproximadamente 8-9 GB.
- VRAM estimada en cuantizacion 4 bits (GGUF Q4_K_M): aproximadamente 4,5-5,5 GB.
- GPU recomendadas para FP16: NVIDIA A100 40 GB, H100, L40S o RTX 4090 (24 GB).
- GPU consumer: cabe en RTX 4090, RTX 4080, RTX 3090 y, con cuantizacion 4 bits, en GPUs de 8 GB como RTX 3070 o RTX 4060.
- Opciones de despliegue: transformers (formato nativo), text-generation-inference (etiqueta declarada), vLLM, llama.cpp y Ollama previa conversion a GGUF; Unsloth para reentrenamiento.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Novius-Argis | 7B | No disponible | Apache 2.0 | Hugging Face, 0 descargas | Ajuste fino comunitario sin evaluacion publicada |
| DeepSeek-R1-Distill-Qwen-7B | 7B | 32.768 tokens (modelo base) | MIT (modelo original) | Ampliamente disponible | Modelo de referencia con benchmarks publicados por DeepSeek |
| Qwen2.5-7B-Instruct | 7B | 32.768 tokens | Apache 2.0 | Ampliamente disponible | Alternativa generalista con soporte multilingue |
| Mistral-7B-Instruct | 7B | 32.768 tokens | Apache 2.0 | Ampliamente disponible | Alternativa con ecosistema maduro de despliegue |

La comparativa se basa en caracteristicas publicas de los modelos alternativos; no se dispone de datos de rendimiento de Novius-Argis para comparar resultados de benchmarks.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni datos de descargas, ni validacion independiente que respalde la calidad del ajuste fino.
- Documentacion minima: la model card no describe dataset, hiperparametros ni proceso de entrenamiento, lo que impide reproducir o auditar el modelo.
- Riesgo de alucinacion: inherente a los modelos de 7B con razonamiento generativo; las cadenas de pensamiento pueden contener pasos plausibles pero incorrectos.
- Sesgos: no documentados; el modelo base Qwen2 y los datos de destilacion pueden introducir sesgos de genero, cultura o idioma no evaluados.
- Limitacion idiomatica: solo se declara ingles; el uso en castellano no esta soportado oficialmente y podria degradar la calidad.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar la licencia del modelo base original de DeepSeek antes de un despliegue comercial.
- Contexto: la longitud de contexto no esta confirmada por el autor; asumir 32.768 tokens sin verificacion puede provocar errores en produccion.
- Tool calling y agentes: no confirmados; no disenar arquitecturas de agentes sobre este modelo sin pruebas previas.
- Modelo de partida cuantizado en 4 bits: si el ajuste fino se realizo sobre la version bnb-4bit, la calidad puede ser inferior a un ajuste sobre pesos completos.

## Enlaces

- Hugging Face: https://huggingface.co/EhsaasBawa16/Novius-Argis
- Modelo base: https://huggingface.co/unsloth/DeepSeek-R1-Distill-Qwen-7B-unsloth-bnb-4bit
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Repositorio TRL de Hugging Face: https://github.com/huggingface/trl
- Paper de DeepSeek-R1: no disponible en la informacion proporcionada
- Demo o blog del autor: no disponible en la informacion proporcionada
