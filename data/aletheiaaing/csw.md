# AletheiaAING/csw

## Resumen

csw es un ajuste fino supervisado (SFT) del modelo google/gemma-3-270m-it, desarrollado por AletheiaAING, especializado en tareas de traduccion, code-switching e reescritura informal con idioms sobre 37 lenguas africanas. Con 301,5 millones de parametros, es un modelo compacto pensado para escenarios de generacion de texto multilingue donde el hablante nativo mezcla lenguas de forma natural, algo que los modelos multilingues genericos rara vez reproducen con fidelidad.

El modelo resuelve seis tareas concretas: traduccion del ingles a una lengua base, generacion de texto con code-switching (mezcla de una segunda lengua en la lengua base), y reescritura informal rica en expresiones idiomaticas, cada una en variantes con y sin punto de partida en ingles. Emplea un formato de prompt muy estricto con etiquetas especiales (`<hm>`, `<ood>`, `<dev>`) y codigos de tres letras entre angulos, lo que lo hace dependiente de una plantilla de entrada muy concreta.

Su relevancia actual radica en la escasez de modelos que aborden el code-switching real (no solo la traduccion) en lenguas africanas de bajos recursos, y en su tamano reducido, que permite desplegarlo en hardware modesto. La licencia es research-only-gemma-derived, lo que restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (gemma3_text) |
| Parametros totales | 301.539.968 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repo publico (el autor menciona GGUF en repos privados) |
| Idiomas soportados | 37 lenguas africanas + ingles (afr, amh, bam, ewe, fon, ful, gpe, hau, ibo, kik, kin, kon, lin, lug, luo, mlg, nde, nso, nya, orm, pcm, run, sna, som, sot, ssw, swh, tir, tsn, tso, tum, twi, wes, wol, xho, yor, zul, en) |
| Licencia | research-only-gemma-derived (uso solo de investigacion) |
| Formato de pesos | safetensors (fp32, model.safetensors, 1,2 GB) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-270m-it, un transformer decoder-only de la familia Gemma 3 en su variante de texto. El ajuste es un SFT sobre el modelo instruct base, orientado a seis tareas de generacion condicionada por etiquetas especiales de vocabulario (`<yor>`, `<hm>`, `<ood>`, `<dev>`), que actuan como tokens unicos de control. El autor menciona experimentos adicionales en repos privados (`BeardedMonster/csw-sft` y `BeardedMonster/csw-rl`), lo que sugiere una fase posterior de RL no publicada en este repositorio.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas como RLHF o DPO en esta version publica. La innovacion principal es el diseno de tareas y el formato de prompt: distingue explicitamente entre traduccion (que usa el nombre de la lengua) y code-switching/reescritura idiomatica (que usan codigos de tres letras entre angulos), y exige pares de lengua de cambio predefinidos por lengua base. El formato de salida para tareas distintas de la traduccion incluye una estructura `<dev>dispositivo uno | dispositivo dos</dev>`, lo que indica un control estructural fino sobre la generacion.

## Capacidades

- Traduccion del ingles a 37 lenguas africanas mediante prompt con nombre de lengua (`Translate the text to Yoruba:  TEXT`).
- Generacion de code-switching: mezcla una segunda lengua en la lengua base al estilo de hablantes nativos, con pares de cambio predefinidos por lengua (por ejemplo, `<hm> <yor>+<eng>:  TEXT`).
- Reescritura informal rica en idioms a partir de texto en ingles, en lengua base o en texto ya code-switched.
- Generacion de texto conversacional de un solo turno de usuario, sin system prompt.
- Control estructural de salida mediante etiquetas especiales de vocabulario (`<hm>`, `<ood>`, `<dev>`).
- Cobertura multilingue de 37 lenguas africanas mas ingles, con pares de cambio especificos por lengua.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Traduccion de contenido editorial a lenguas africanas de bajos recursos: el modelo traduce del ingles a cualquiera de las 37 lenguas con un prompt de nombre de lengua, util para localizar documentacion, noticias o material educativo donde los traductores automaticos genericos fallan.
- Generacion de dialogos realistas para datos de entrenamiento: produce texto code-switched al estilo nativo (`<hm> <yor>+<eng>:  TEXT`), lo que permite aumentar corpus para entrenar otros modelos o sistemas de ASR/NLP en habla mezclada.
- Creacion de contenido informal para redes sociales: la tarea `<ood>` reescribe texto en registro informal con idioms, adecuada para campanas de marketing dirigidas a audiencias que usan expresiones coloquiales.
- Preservacion y documentacion linguistica: la reescritura idiomatica permite generar ejemplos de expresiones vernacular en lenguas con pocos recursos digitales, apoyando diccionarios y estudios sociolinguisticos.
- Prototipado de asistentes conversacionales locales: con 301M parametros y pesos fp32 de 1,2 GB, puede ejecutarse en hardware modesto para demos de atencion al cliente en lenguas africanas, aunque solo con un turno de usuario.
- Investigacion en code-switching computacional: sirve como linea base reproducible para estudiar la mezcla de lenguas en 37 idiomas, con pares de cambio documentados y formato de evaluacion controlado.
- Generacion de variantes estilisticas para evaluacion de modelos: la distincion entre texto estandar, code-switched e idiomatico permite construir conjuntos de prueba controlados por estilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 2-3 GB para contextos cortos.
- En cuantizacion de 8 bits, el peso baja a unos 0,3 GB; en 4 bits, a unos 0,15 GB, aunque el autor no publica archivos GGUF en este repositorio.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060) es suficiente en fp32 para contextos cortos; A100/H100 no son necesarias.
- Cabe en GPU consumer y en CPU: por tamano, es viable en llama.cpp u Ollama si se generan cuantizaciones, y en GPUs integradas con suficiente memoria.
- Opciones de despliegue: transformers con safetensors; vLLM y TGI son viables por arquitectura Gemma 3, aunque no se documenta soporte explicito; llama.cpp/Ollama requeririan conversion a GGUF, no incluida en el repo publico.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AletheiaAING/csw | 301,5 M | no disponible | 37 lenguas africanas + en | research-only-gemma-derived | publico en HF |
| google/gemma-3-270m-it | 270 M | no disponible | multilingue general | Gemma terms | publico en HF |
| AletheiaAING/gemma-3-1b-csw-best | no disponible | no disponible | lenguas africanas (sucesor 1B) | no disponible | publico en HF |
| AletheiaAING/gemma-3-0.8b-csw | no disponible | no disponible | lenguas africanas (sucesor 0.8B) | no disponible | publico en HF |

La comparativa con modelos de traduccion multilingue de gran escala (NLLB, M2M-100) no esta disponible en la informacion proporcionada; ademas, csw no es un modelo de traduccion general, sino un SFT especializado en seis tareas con formato estricto.

## Limitaciones y advertencias

- Licencia research-only: prohibido el uso comercial segun la licencia research-only-gemma-derived; cualquier despliegue en produccion requiere revisar los terminos de Gemma y del autor.
- Formato de prompt extremadamente rigido: el uso del nombre de lengua en tareas de code-switching o de codigos en la traduccion produce resultados fuera de distribucion; dos espacios tras cada dos puntos son obligatorios.
- Dependencia de pares de cambio predefinidos: solo se entrenaron los pares listados por lengua; otros pares no estan soportados.
- Salida estructurada fragil: si la estructura `<dev>...</dev>` no es correcta, la salida es invalida y debe remuestrearse.
- Un solo turno de usuario: no hay soporte documentado de multi-turno ni de system prompt.
- Riesgo de alucinacion en lenguas de bajos recursos, donde los datos de entrenamiento son escasos.
- Sesgos potenciales derivados de los datos de ajuste, no documentados por el autor.
- Contexto maximo no documentado, lo que limita la planificacion de despliegues con entradas largas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.
- El repositorio publico solo incluye pesos fp32; las cuantizaciones GGUF y el modelo RL estan en repos privados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AletheiaAING/csw
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Sucesor 1B: https://huggingface.co/AletheiaAING/gemma-3-1b-csw-best
- Sucesor 0.8B: https://huggingface.co/AletheiaAING/gemma-3-0.8b-csw
- Repos de experimentos (privados, segun el autor): BeardedMonster/csw-sft y BeardedMonster/csw-rl
