# knyshukvova/fireredtts3-mlx-q8

## Resumen

FireRedTTS3 MLX int8 es una cuantizacion selectiva del modelo de sintesis de voz FireRedTTS3 de FireRedTeam, adaptada para ejecutarse en Apple Silicon mediante el framework MLX. El autor, knyshukvova, parte de la conversion BF16 de appautomaton/fireredtts3-mlx y aplica cuantizacion affine int8 (grupo 64) exclusivamente al backbone LLM Qwen3, manteniendo en bfloat16 los modulos acusticos DiT, RedAE y CAM++. El resultado es un snapshot de pesos de 4.5 GB que reduce el trafico de memoria del decodificador de 3.95 GiB a 2.45 GiB.

El modelo base FireRedTTS3 es un sistema unificado de generacion y edicion de voz construido sobre representaciones continuas de habla semanticamente enriquecidas. La variante Base, que es la que se cuantiza aqui, ofrece clonacion de voz zero-shot en 24 idiomas y 21 dialectos chinos. Este snapshot concreto no es un release oficial de mlx-speech: requiere un loader personalizado que entienda la etiqueta `precision: int8-selective`, ya que la validacion estandar de `FireRedTTS3Config` solo acepta bfloat16.

La relevancia de esta ficha es doble: por un lado documenta una tecnica de cuantizacion selectiva que preserva la ruta acustica mientras acelera el cuello de botella del decodificador autoregresivo; por otro, advierte de las incompatibilidades de carga con las herramientas publicadas, un detalle critico para quien pretenda desplegarlo en produccion sobre macOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone LLM Qwen3 (autoregresivo) + DiT (difusion) + codec RedAE + encoder de hablante CAM++ |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 affine selectivo (grupo 64) en backbone Qwen3; DiT, RedAE y CAM++ en BF16 |
| Idiomas soportados | ar, yue, zh, cs, nl, en, fi, fr, de, el, hi, id, it, ja, ko, pl, pt, ro, ru, es, th, tr, uk, vi (24 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), audio mono a 24 kHz |
| Tamano del repo | 4.5 GB |
| Tamano de pesos en disco | ~4.22 GiB (core 2.45 GiB + redae 1.76 GiB + speaker 0.014 GiB) |
| Precisión registrada | `int8-selective` en `config.json` |
| Hardware objetivo | Apple Silicon (M1 Pro o superior) |
| Version minima de mlx-speech | >= 0.5.3 (solo para modulos auxiliares, no para carga directa) |

## Arquitectura y entrenamiento

FireRedTTS3 es un sistema de generacion de voz que combina un backbone LLM autoregresivo (Qwen3) con un modulo de difusion (DiT) y un codec neuronal (RedAE) sobre representaciones continuas de habla enriquecidas semanticamente. El encoder de hablante CAM++ extrae el embedding de timbre a partir del audio de referencia para la clonacion zero-shot. La generacion pasa por dos fases: el backbone Qwen3 produce tokens latentes condicionados por el texto y la referencia, y el DiT sintetiza la forma de onda a traves del codec RedAE a 24 kHz en mono.

La cuantizacion aplicada en este snapshot es selectiva: solo el backbone Qwen3 se convierte a int8 affine con grupo 64, mientras que DiT, RedAE y CAM++ permanecen en bfloat16. Segun la model card, cuantizar tambien el DiT aceleraria mas la inferencia pero degradaria la calidad del clon, de ahi la decision de limitar la cuantizacion al LLM. MLX sigue descomprimiendo las capas int8 a FP16 para las GEMM, por lo que la ganancia real es de ancho de banda y RAM, no de un kernel distinto. El autor no documenta el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esos datos corresponden al modelo base FireRedTeam/FireRedTTS3 y no se detallan en la informacion disponible.

## Capacidades

- Sintesis de voz (text-to-speech) mono a 24 kHz con salida WAV.
- Clonacion de voz zero-shot a partir de un audio de referencia y su transcripcion exacta.
- Soporte de 24 idiomas: arabe, cantonés, chino, checo, neerlandes, ingles, finlandes, frances, aleman, griego, hindi, indonesio, italiano, japones, coreano, polaco, portugues, rumano, ruso, espanol, tailandes, turco, ucraniano y vietnamita.
- Control de generacion mediante `seed`, `flow_steps` (pasos del flujo de difusion) y `guidance_scale`.
- Diseno de voz en lenguaje natural y edicion de habla en la variante Instruct del modelo base (no confirmado en esta variante Base cuantizada).
- Ejecucion en Apple Silicon mediante MLX con compilacion del DiT (`mx.compile`).
- No dispone de tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente generativo de audio.

## Casos de uso

- Clonacion de voz para doblaje y localizacion: con 24 idiomas soportados y clonacion zero-shot, se puede generar una misma voz en distintos idiomas usando una referencia en el idioma objetivo, util para estudios de doblaje que necesitan mantener el timbre del actor original.
- Audiolibros y narracion automatizada: el modelo sintetiza parrafos largos con una voz clonada a partir de una muestra corta, lo que permite producir narraciones consistentes sin grabar horas de estudio.
- Asistentes de voz en aplicaciones macOS: al ejecutarse sobre MLX en Apple Silicon, puede integrarse en apps nativas de escritorio que requieran TTS local sin depender de la nube, con pesos de 4.22 GiB que caben en la memoria unificada de un Mac moderno.
- Accesibilidad: generacion de voz personalizada para usuarios con discapacidad del habla, clonando su timbre a partir de grabaciones previas y sintetizando texto nuevo en su propia voz.
- Prototipado de interfaces conversacionales: util para equipos que desarrollan agentes de voz y necesitan un TTS local y rapido para iterar sobre guiones y respuestas sin coste por llamada a APIs externas.
- Investigacion en sintesis de voz: la cuantizacion selectiva documentada (int8 en LLM, BF16 en ruta acustica) sirve como referencia para estudiar el equilibrio entre velocidad y calidad en pipelines TTS sobre hardware de consumo.
- Generacion de contenido multilingue para redes: creacion de locuciones en cualquiera de los 24 idiomas con una unica voz de marca, reduciendo la necesidad de contratar locutores por idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks objetivos (MOS, WER, similitud de hablante) en la informacion disponible. La model card unicamente reporta metricas de velocidad relativas al modelo padre BF16:

| Metrica | Valor |
|---|---|
| Aceleracion en generacion de audio (M1 Pro) | ~24% mas rapido que `appautomaton/fireredtts3-mlx` `base/mlx-bf16` |
| Calidad retenida | ~99% respecto al BF16 |
| Peso del backbone Qwen3 en memoria | 3.95 GiB (BF16) -> 2.45 GiB (int8) |
| Reparto del tiempo de clonacion | Qwen decode ~56% (memory-bound), DiT ~37% (compute-bound) |

## Requisitos de hardware

- VRAM/RAM estimada: ~4.22 GiB solo en pesos, mas activaciones y cache KV en tiempo de ejecucion; en la practica se recomienda un minimo de 8 GB de memoria unificada.
- GPU recomendadas: Apple Silicon M1 Pro o superior (la model card reporta mediciones en M1 Pro). No hay soporte documentado para CUDA ni ROCm en este snapshot.
- Cabe en GPU de consumo: si, en cualquier Mac con chip de la familia M con al menos 8 GB de memoria unificada; no esta pensado para GPUs NVIDIA o AMD.
- Opciones de despliegue: carga manual con `mlx.core` y `mlx.nn` siguiendo el snippet de la model card; `mlx-speech >= 0.5.3` solo para los modulos auxiliares (`RedAE`, `FireRedSpeakerEncoder`, `FireRedTTS3Tokenizer`, `FireRedTTS3Adapter`). No compatible con `tts.load` ni con el CLI `mlx-speech tts`.
- Latencia y throughput: no disponibles de forma absoluta; solo se documenta la mejora relativa del ~24% frente al BF16 en M1 Pro.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| knyshukvova/fireredtts3-mlx-q8 (este) | no disponible | no disponible | 24 | Apache 2.0 | safetensors MLX int8 selectivo | Requiere loader personalizado; +24% velocidad vs BF16 |
| appautomaton/fireredtts3-mlx | no disponible | no disponible | 24 | Apache 2.0 | safetensors MLX BF16 | Compatible con `mlx-speech` (`tts.load`, CLI); referencia de calidad |
| FireRedTeam/FireRedTTS3 (upstream) | no disponible | no disponible | 24 + 21 dialectos chinos | Apache 2.0 | safetensors (PyTorch) | Modelo original; variantes Base e Instruct |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Incompatibilidad con `mlx-speech`: `FireRedTTS3Config.validate` solo acepta `precision == "bfloat16"`, por lo que `tts.load` y el CLI rechazan este directorio. Es necesario un loader personalizado o el parche `_skip_bf16_check` que aparece en la model card.
- No es un release oficial de mlx-speech: el autor lo describe explicitamente como "weights only", sin garantias de mantenimiento ni soporte.
- Solo Apple Silicon: no hay soporte para CUDA, ROCm ni CPU x86 documentado.
- Riesgo de alucinacion acustica: como todo TTS generativo, puede producir pronunciaciones incorrectas, artefactos o prosodia inadecuada, especialmente en idiomas con pocos datos o en textos con nombres propios y siglas.
- Dependencia de la referencia: la calidad de la clonacion depende de la calidad del audio de referencia y de que su transcripcion sea exacta; una referencia en el idioma objetivo mejora el resultado.
- Sesgos: no se documentan sesgos especificos, pero al ser un modelo entrenado sobre datos de habla, puede reflejar sesgos de acento, genero y variedad dialectal presentes en el corpus del modelo base.
- Uso dual: la clonacion de voz zero-shot puede emplearse para suplantacion de identidad; la licencia Apache 2.0 no impone restricciones de uso, por lo que la responsabilidad etica y legal recae en el desplegador.
- Cuantizacion selectiva: cuantizar el DiT degradaria la calidad del clon, segun el autor, por lo que no se recomienda modificar la receta de cuantizacion sin evaluar la salida acustica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/knyshukvova/fireredtts3-mlx-q8
- Modelo padre BF16 (mlx-speech): https://huggingface.co/appautomaton/fireredtts3-mlx
- Modelo base upstream: https://huggingface.co/FireRedTeam/FireRedTTS3
- Repositorio GitHub del modelo base: https://github.com/FireRedTeam/FireRedTTS3
- Guia de runtime de mlx-speech para FireRedTTS3: https://github.com/appautomaton/mlx-speech/blob/main/docs/fireredtts3.md
