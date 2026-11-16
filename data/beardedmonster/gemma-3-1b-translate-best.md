# BeardedMonster/gemma-3-1b-translate-best

## Resumen

`gemma-3-1b-translate-best` es un ajuste fino supervisado y posteriormente optimizado mediante aprendizaje por refuerzo (GRPO) del modelo `google/gemma-3-1b-it`, desarrollado por el usuario BeardedMonster en el marco del proyecto SabiYarn / gemma_mt. Su proposito es acotado y especializado: traducir texto **desde el ingles** hacia 125 etiquetas de idiomas africanos, de las cuales 105 cuentan con datos de entrenamiento supervisado y 20 carecen de ellos y, por tanto, no producen salidas utilizables.

El modelo parte de la arquitectura transformer decoder-only de Gemma 3 en su variante de 1B parametros (999.885.952 parametros reales segun los pesos en safetensors, aproximadamente 4 GB en fp32). No es un modelo de proposito general: es un traductor de frase u parrafo corto, con decodificacion greedy y un formato de prompt muy estricto que debe respetarse para obtener resultados correctos. Su relevancia radica en cubrir un nicho desatendido por los modelos comerciales, como son las lenguas africanas de bajos recursos, con un tamano que cabe en GPU de consumo.

El rendimiento declarado por el autor en FLORES+ devtest (54 idiomas, greedy, filas limpias) es de chrF++ 35,28, spBLEU 14,03 y AfriCOMET 0,681 (40 idiomas). Se distribuye bajo licencia Gemma y esta pensado como la variante "general / RL / best" de una familia de modelos con alternativas mas pequenas y economicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3, variante de texto `gemma3_text`) |
| Parametros totales | 999.885.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (los ejemplos de despliegue usan `max_model_len=4096`) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en fp32/bfloat16; el autor no documenta cuantizaciones) |
| Idiomas soportados | Ingles como origen; 125 etiquetas de idiomas africanos como destino (105 con datos SFT) |
| Licencia | Gemma (`license: gemma`, terminos en ai.google.dev/gemma/terms) |
| Formato de pesos | safetensors (repo de 4,0 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Gemma 3 en su variante de texto de 1B parametros, sin modificaciones estructurales documentadas. Sobre esa base, el autor aplico un proceso en dos fases: primero cuatro shards de ajuste fino supervisado (SFT) sobre pares ingles-idioma africano, y despues aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization), del cual se selecciono el checkpoint "arm M1" como mejor resultado. El modelo base declarado es `google/gemma-3-1b-it`, es decir, la version ya instruida de Gemma 3.

El entrenamiento cubre 105 idiomas con datos SFT; las 20 etiquetas restantes existen en el tokenizador pero no vieron texto de entrenamiento y producen salidas inutilizables. El formato de entrenamiento es de un unico turno de usuario con la plantilla `Translate the text to {Language name}:  {English text}` (dos espacios tras los dos puntos), y el modelo responde con una etiqueta de idioma en un solo token (por ejemplo `<yor>`) seguida de la traduccion. Esas etiquetas son entradas ordinarias del vocabulario, no tokens especiales, por lo que sobreviven a `skip_special_tokens=True` y deben eliminarse explicitamente. No se documentan en la informacion disponible innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Traduccion unidireccional ingles a 105 idiomas africanos con datos SFT (yoruba, hausa, igbo, suajili, zulu, amharico, africaans, wolof, bambara, entre otros).
- Generacion de texto breve condicionada al idioma destino, con marcado de salida mediante etiqueta de tres letras.
- Traduccion por lotes de una misma frase a multiples idiomas en una sola pasada (soportado en vLLM).
- No soporta traduccion inversa (idioma africano a ingles) ni traduccion entre idiomas africanos.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- Capacidad multilingue limitada al par ingles-destino; no es un modelo conversacional de proposito general.

## Casos de uso

- **Localizacion de interfaces y cadenas de producto**: traduccion de etiquetas, mensajes de error y textos de UI del ingles a un idioma africano concreto, procesando cada cadena como una peticion independiente y eliminando la etiqueta de salida con una expresion regular.
- **Traduccion de contenido editorial breve**: articulos, notas de prensa o publicaciones de blog divididas en frases o parrafos cortos, con decodificacion greedy para maximizar la fidelidad y evitar variabilidad.
- **Atencion al cliente en lenguas locales**: generacion de respuestas y macros en el idioma del usuario a partir de plantillas en ingles, desplegando el modelo con vLLM y su servidor compatible con OpenAI para integrarlo en un backend existente.
- **Subtitulado y transcripcion**: traduccion de subtitulos en ingles frase a frase, aprovechando el bajo coste del modelo de 1B parametros para procesar volumenes grandes por lotes.
- **Investigacion en PLN de bajos recursos**: punto de partida o linea base reproducible para experimentos de traduccion automatica en lenguas africanas, con pesos publicos y metricas declaradas en FLORES+, NTREX-128 y MAFAND-MT.
- **Generacion de datos sinteticos multilingues**: produccion de corpus paralelos ingles-idioma africano para aumentar datos de entrenamiento de otros sistemas, con revision humana posterior dado el riesgo de error.
- **Despliegue en hardware modesto**: servicio de traduccion interno en una unica GPU de consumo, con latencia baja por el tamano reducido del modelo y la decodificacion greedy.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card:

| Benchmark | Metrica | Resultado | Cobertura |
|---|---|---|---|
| FLORES+ devtest | chrF++ | 35,28 | 54 idiomas |
| FLORES+ devtest | spBLEU | 14,03 | 54 idiomas |
| FLORES+ devtest | AfriCOMET | 0,681 | 40 idiomas |
| NTREX-128 | chrF++ | 40,05 | 24 idiomas |
| MAFAND-MT | chrF++ | 44,21 | 15 idiomas |

No se proporcionan resultados desagregados por idioma ni comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en bfloat16 para los pesos (1B parametros), mas overhead de activaciones y cache KV; el repo ocupa 4,0 GB en fp32.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para bfloat16; A100, H100 o RTX 4090 sobran para este modelo y permiten lotes grandes.
- Cabe en GPU de consumo: si, en tarjetas tipo RTX 3060, RTX 4060 o superiores con 8 GB o mas.
- Opciones de despliegue: Transformers (probado con 4.57.6, requiere >= 4.56), vLLM (probado con 0.32.0) y servidor compatible con OpenAI mediante `vllm serve`. No se documentan opciones GGUF, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor recomienda `max_model_len=4096`, `max_new_tokens=256` para frases o parrafos cortos (768 en los benchmarks) y `frequency_penalty=0.1` opcional en vLLM para evitar bucles de repeticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-3-1b-translate-best | 999.885.952 | no disponible | Traduccion EN a 105 idiomas africanos (SFT + GRPO) | Gemma | Hugging Face, publico |
| google/gemma-3-1b-it | no disponible en la informacion | no disponible | Modelo base instruido de proposito general | Gemma | Hugging Face, publico |
| NLLB-200 (variantes pequenas) | no disponible en la informacion | no disponible | Traduccion multilingue masiva | CC-BY-NC (segun version) | Hugging Face |
| M2M-100 (418M / 1.2B) | no disponible en la informacion | no disponible | Traduccion multilingue many-to-many | MIT | Hugging Face |

Los datos de NLLB-200 y M2M-100 no se han verificado en la informacion proporcionada y se incluyen solo como referencia de categoria; no hay comparaciones de rendimiento publicadas por el autor frente a estos sistemas.

## Limitaciones y advertencias

- Traduccion estrictamente unidireccional: solo acepta ingles como origen; no traduce desde ni entre idiomas africanos.
- 20 de las 125 etiquetas carecen de datos SFT y producen salidas inutilizables; es imprescindible consultar la tabla de idiomas de la model card antes de usar un idioma.
- El formato de prompt es rigido: nombre del idioma en el prompt (nunca el codigo ISO), dos espacios tras los dos puntos y un unico turno de usuario. Desviarse degrada la calidad.
- La salida incluye una etiqueta `<xxx>` que debe eliminarse manualmente; no es un token especial y no se filtra con `skip_special_tokens=True`.
- Recomendado para una frase o parrafo corto por peticion; los documentos largos deben dividirse, y en entradas largas existe riesgo de bucles de repeticion (el autor sugiere `frequency_penalty=0.1`).
- Riesgo de alucinacion y de traduccion parcial o incorrecta en idiomas con pocos datos; no se documentan evaluaciones de sesgo.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de Google (ai.google.dev/gemma/terms), que incluyen obligaciones de uso aceptable y condiciones de redistribucion.
- Modelo con 4 descargas y 0 likes en el momento de la consulta: no ha pasado por validacion independiente de la comunidad.
- No se documentan cuantizaciones oficiales ni soporte para llama.cpp, Ollama o TGI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BeardedMonster/gemma-3-1b-translate-best
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
- Duplicado privado con pesos identicos (segun el autor): `BeardedMonster/gemma-3-1b-rl-translate-best`
- Paper, blog, repositorio o demo del proyecto SabiYarn / gemma_mt: no disponibles en la informacion proporcionada.
