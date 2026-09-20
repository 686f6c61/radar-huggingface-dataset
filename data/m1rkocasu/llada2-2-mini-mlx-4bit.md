# m1rkocasu/LLaDA2.2-mini-MLX-4bit

## Resumen

LLaDA2.2-mini-MLX-4bit es una conversión a 4 bits para Apple Silicon del modelo inclusionAI/LLaDA2.2-mini, un modelo de lenguaje de difusión (dLLM) con arquitectura de mezcla de expertos (MoE) de 16.255.643.392 parámetros totales y aproximadamente 1.400 millones de parámetros activos por token. La conversión la publica el usuario m1rkocasu bajo licencia Apache 2.0 y el formato de pesos es safetensors en MLX, con un tamano en disco de 9,2 GB y 4,5 bits por peso, manteniendo el router en precisión completa.

La diferencia principal frente a un transformer autorregresivo es el modo de decodificación: en lugar de emitir un token detrás de otro, el modelo escribe bloques de 32 tokens a la vez, rellenando máscaras en paralelo y editando su propio borrador. El muestreador de la familia 2.2 reescribe tokens ya generados y emite tokens especiales DELETE e INSERT que encogen o amplían el borrador, con un remuestreador anti-bucle y varias pasadas de refinamiento por bloque (16 por defecto).

Su relevancia práctica es doble. Por un lado, permite ejecutar localmente un MoE de difusión de 16B en un Mac con una memoria pico de 8,6 GiB; el autor mide entre 72 y 129 tokens/s en código y entre 31 y 43 tokens/s en prosa sobre un M4 Pro. Por otro lado, documenta con detalle los tres puntos donde la implementación previa de MLX fallaba en silencio al cargar LLaDA2.2 (enrutado por bloque, muestreador y tokenizador), lo que convierte el repositorio en una referencia técnica para quien trabaje con esta familia de modelos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con difusión de máscaras (dLLM); 19 capas MoE |
| Parametros totales | 16.255.643.392 (≈16,26 B) |
| Parametros activos | ≈1,4 B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits en este repositorio (4,5 bits por peso, router en precisión completa); el mismo autor publica variantes de 5 y 6 bits en MLX; el checkpoint base está en bf16 |
| Idiomas soportados | no disponible (no hay lista oficial; las pruebas del autor usan inglés e italiano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |
| Tamano en disco | 9,2 GB |
| Memoria pico en inferencia | 8,6 GiB |
| Longitud de bloque | 32 tokens, fijada por el enrutado del modelo y no modificable |
| Expertos por capa | 256; el bloque conserva 48 y cada token elige 8 de ellos |
| Modelo base | inclusionAI/LLaDA2.2-mini |
| Runtime | mlx-vlm (probado con 0.7.1) y mlx-lm; requiere `trust_remote_code` |
| Fecha indicada en HuggingFace | creación 2026-09-19, actualización 2026-09-19 |

## Arquitectura y entrenamiento

El modelo es un transformer con capas de mezcla de expertos que sustituye la generación autorregresiva por un proceso de difusión sobre tokens enmascarados. Cada paso de decodificación trabaja sobre un bloque fijo de 32 posiciones: primero se rellenan las máscaras en paralelo y después el modelo refina el borrador, reescribiendo tokens ya escritos y emitiendo tokens DELETE e INSERT para reducir o ampliar el texto. El enrutado es jerárquico y específico de la versión 2.2: de los 256 expertos de cada capa, el bloque conserva 48 y cada token selecciona 8 dentro de ese subconjunto. La implementación anterior de mlx-vlm aplicaba el enrutado con límite de grupo de la versión 2.1, que en 2.2 elegía expertos distintos para prácticamente cada token (64 de 64 en el control del autor).

No se detalla en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La innovación técnica documentada está en el lado de la inferencia y de la conversión: muestreador con umbral 0,5, umbral de edición 0,0, 16 pasadas de refinamiento y bloques de 32; remuestreador anti-bucle; y verificación capa a capa y token a token contra la implementación de referencia en PyTorch (`modeling_llada2_moe.py`). En float32 el error de estado oculto por capa queda entre 1e-9 y 8e-7, como máximo 2,6 veces la diferencia entre PyTorch en CPU y PyTorch en MPS; el router elige los mismos expertos en 96 de 96 tokens en las 19 capas MoE, y el argmax de los logits en las posiciones enmascaradas coincide al 100 %. En bf16 algunos expertos casi empatados cambian por redondeo (MLX calcula RoPE en float32 y la referencia en bf16).

El repositorio incluye `llada22_mlx`, formado por dos ficheros de la implementación de LLaDA2 de mlx-vlm (`language.py` y `config.py`, licencia MIT) con las adiciones de la versión 2.2. Importar el paquete hace que mlx-vlm use esas versiones sin modificar nada del paquete instalado, y avisa si los ficheros de LLaDA2 de la versión instalada difieren.

## Capacidades

- Generación de texto por difusión de bloques: escribe 32 tokens por paso en paralelo en lugar de token a token.
- Generación de código: el ejemplo del repositorio genera funciones Python (por ejemplo, comprobación de palíndromos) y el autor valida funciones generadas ejecutándolas contra casos de prueba.
- Aritmética y razonamiento de un solo paso: la model card incluye el ejemplo «What is 17 * 23?».
- Salida estructurada: en la batería de evaluación se comprueba que el texto generado sea JSON que parsea al objeto esperado.
- Edición de texto propio: el muestreador reescribe tokens ya emitidos y usa los tokens DELETE e INSERT, con remuestreador anti-bucle.
- Multilingüe limitado a lo evaluado: las pruebas del autor se plantean en inglés y en italiano (aritmética, italiano y código en la verificación del muestreador).
- Verificación de implementación: el autor replica el comportamiento de la referencia en el router y en el sampler, lo que permite auditar la conversión.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso explícito.
- No se documentan capacidades de visión ni de audio, pese a que el runtime utilizado (mlx-vlm) sea multimodal.

## Casos de uso

- Inferencia local en portátiles Apple: con 8,6 GiB de memoria pico y 9,2 GB en disco, cabe en un Mac con 24 GB y permite trabajar sin conexión; el autor mide 72–129 tokens/s en código y 31–43 tokens/s en prosa en un M4 Pro.
- Generación de código asistida en local: se pueden producir funciones Python y validarlas ejecutándolas contra casos de prueba, como hace el propio autor en su batería de evaluación.
- Salida estructurada para pipelines de datos: la decodificación por bloques encaja bien con la generación de JSON que debe parsear a un objeto concreto, escenario comprobado en la evaluación del autor.
- Asistentes conversacionales privados: al ejecutarse íntegramente en el equipo, el prompt y la respuesta no salen del dispositivo, lo que sirve para textos internos o datos personales.
- Reescritura y edición de borradores: el modelo puede modificar tokens ya generados y usar DELETE/INSERT, lo que resulta útil para tareas de corrección o reescritura dentro de un mismo bloque de 32 tokens.
- Prototipado e investigación sobre dLLM: permite estudiar decodificación no autorregresiva, remuestreo anti-bucle y enrutado por bloque en hardware de consumo, comparando contra las variantes de 5 y 6 bits del mismo autor.
- Evaluación de robustez multilingüe inglés-italiano: la batería del autor está diseñada en ambos idiomas, de modo que sirve como punto de partida para extender pruebas a otros idiomas.
- Automatización por lotes de respuestas cortas y medias: las mediciones de velocidad se hicieron sobre respuestas de 230 a 512 tokens, rango en el que el coste fijo por bloque pesa menos.

## Benchmarks y rendimiento

El autor publica una batería de 12 tareas (pedidas en inglés y en italiano, con respuestas verificadas por código: números exactos, funciones ejecutadas contra casos de prueba, palabras obligatorias y JSON que debe parsear) comparando este modelo con LLaDA2.1-mini de 4 bits de mlx-community y con las variantes de 5 y 6 bits del mismo autor, con decodificación greedy y bloques de 32. Los resultados numéricos de esa tabla no están disponibles en la información proporcionada, porque el contenido aparece truncado. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar.

Los datos verificables que sí aparecen son los de la validación de la conversión:

| Prueba | Método | Resultado |
|---|---|---|
| Decoder, capa a capa | error de estado oculto en float32 | entre 1e-9 y 8e-7; como máximo 2,6 veces la diferencia entre PyTorch en CPU y PyTorch en MPS |
| Enrutado de expertos | comparación con la referencia | idéntico en 96 de 96 tokens, en las 19 capas MoE |
| Argmax de logits en posiciones enmascaradas | comparación con la referencia | idéntico, 100 % |
| Muestreador, token a token | 3 prompts (aritmética, italiano, código) | mismos tokens en los tres: 167, 104 y 256 |
| Muestreador con el de la versión 2.1 | mismos 3 prompts | diverge en los tokens 67, 29 y 47 |
| Velocidad en M4 Pro | respuestas de 230 a 512 tokens | 72–129 tokens/s en código; 31–43 tokens/s en prosa |

## Requisitos de hardware

- Memoria: 8,6 GiB de pico en inferencia y 9,2 GB de peso en disco con la cuantización de 4 bits. El checkpoint base en bf16 ocupa 30 GB y no cabe ni en RAM ni bajo el límite de GPU de un Mac de 24 GB.
- Plataforma objetivo: Apple Silicon con MLX. Las velocidades publicadas corresponden a un M4 Pro.
- GPU recomendadas: no disponible. No hay datos para A100, H100, RTX 4090 ni otras GPU CUDA o ROCm en la información proporcionada.
- Compatibilidad con GPU de consumo: solo está documentada en Apple Silicon; no se confirma su funcionamiento en GPU de consumo NVIDIA o AMD.
- Opciones de despliegue: `mlx-vlm` (probado con 0.7.1) más `mlx-lm`, instalables con `pip install -U mlx-vlm mlx-lm`, y el paquete `llada22_mlx` incluido en el repositorio. No funciona en LM Studio ni en oMLX, que decodifican de forma autorregresiva y no pueden ejecutar un modelo de difusión.
- Opciones descartadas o no documentadas: vLLM, llama.cpp, Ollama y TGI no aparecen como compatibles en la información disponible.
- Latencia y throughput: 72–129 tokens/s en código y 31–43 tokens/s en prosa sobre M4 Pro, medidos en seis respuestas largas (explicación, historia y código, de 230 a 512 tokens cada una), donde el coste fijo de un bloque pesa menos.
- Entorno probado: `generate.py` y el ejemplo en Python se ejecutaron en un entorno limpio con mlx-vlm 0.7.1 y transformers 5.17 desde PyPI.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LLaDA2.2-mini-MLX-4bit (este repositorio) | 16,26 B | ≈1,4 B | no disponible | MLX 4 bits, 9,2 GB | Apache 2.0 | Apple Silicon con mlx-vlm y mlx-lm |
| LLaDA2.2-mini-MLX-5bit | 16,26 B (mismo base) | ≈1,4 B | no disponible | MLX 5 bits | Apache 2.0 | mismo autor, en HuggingFace |
| LLaDA2.2-mini-MLX-6bit | 16,26 B (mismo base) | ≈1,4 B | no disponible | MLX 6 bits | Apache 2.0 | mismo autor, en HuggingFace |
| LLaDA2.1-mini 4-bit (mlx-community) | no disponible | no disponible | no disponible | MLX 4 bits | no disponible | usado como referencia en la comparativa del autor |
| inclusionAI/LLaDA2.2-mini (base) | 16,26 B | ≈1,4 B | no disponible | bf16, ≈30 GB | no disponible | original sin cuantizar |

No hay en la información proporcionada datos de otros modelos comparables de la misma categoría (dLLM con MoE) ni cifras de rendimiento de las alternativas, por lo que la comparación cuantitativa entre ellas no está disponible.

## Limitaciones y advertencias

- Validación comunitaria nula en el momento de la consulta: 0 descargas y 0 me gusta en HuggingFace; se trata de una conversión de un tercero, no del autor del modelo base.
- Los resultados numéricos de la batería de 12 tareas no están disponibles en la información proporcionada; no se pueden citar cifras de calidad frente a LLaDA2.1-mini ni frente a las variantes de 5 y 6 bits.
- No se publica la longitud de contexto soportada ni la lista oficial de idiomas.
- Incompatibilidad con runtimes autorregresivos: LM Studio y oMLX no pueden ejecutar el modelo. Tampoco hay soporte documentado en vLLM, llama.cpp, Ollama ni TGI.
- Requiere `trust_remote_code` para la clase de tokenizador del propio modelo, lo que implica ejecutar código del repositorio.
- Fragilidad del tokenizador tras la conversión: al reconvertir, `tokenizer_config.json` se reescribe y se pierde `trust_remote_code`; en transformers 5 el tokenizador recargado reconstruye el BPE solo con el vocabulario, sin merges, y codifica un carácter por token (76 tokens en lugar de 30 para el mismo prompt), lo que produce turnos vacíos que parecen un modelo roto. Los ficheros de tokenizador de este repositorio son los correctos.
- Dependencia de versión: el paquete se escribió contra mlx-vlm 0.7.1 y avisa si los ficheros LLaDA2 de la versión instalada difieren.
- La longitud de bloque de 32 tokens está fijada por el enrutado del modelo y no puede cambiarse.
- Pérdida por cuantización: con 4 bits el router se mantiene en precisión completa, pero en bf16 algunos expertos casi empatados cambian por redondeo respecto a la referencia.
- Riesgo de alucinación: no cuantificado en la información disponible, ya que no hay benchmarks de fidelidad ni de veracidad publicados.
- Sesgos conocidos: no disponibles. No se documenta ninguna evaluación de sesgos.
- Licencia: el repositorio declara Apache 2.0, lo que en principio permite uso comercial, pero la licencia del modelo base no se detalla en la información proporcionada y conviene verificarla antes de un despliegue en producción. El repositorio redistribuye dos ficheros de mlx-vlm bajo licencia MIT.
- Para uso en producción faltan datos básicos: contexto máximo, comportamiento multilingüe fuera del inglés y el italiano, estabilidad del muestreador con temperatura alta (las pruebas del autor usan decodificación greedy y temperatura 0,0) y consumo energético.

## Enlaces

- Modelo en HuggingFace (4 bits): https://huggingface.co/m1rkocasu/LLaDA2.2-mini-MLX-4bit
- Variante de 5 bits: https://huggingface.co/m1rkocasu/LLaDA2.2-mini-MLX-5bit
- Variante de 6 bits: https://huggingface.co/m1rkocasu/LLaDA2.2-mini-MLX-6bit
- Modelo base: https://huggingface.co/inclusionAI/LLaDA2.2-mini
- LLaDA2.1-mini 4 bits de mlx-community (referencia de comparación): https://huggingface.co/mlx-community/LLaDA2.1-mini-4bit
- Ficheros de referencia de la implementación: `modeling_llada2_moe.py` (PyTorch) y `language.py`, `config.py` (mlx-vlm, MIT)
- Los resultados de la búsqueda web no contienen enlaces relevantes para este modelo.
