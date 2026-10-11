# laion/Humaneness-Voice-Small-Acting

## Resumen

Humaneness Voice Small Acting es un checkpoint de sintesis de voz orientado a la actuacion (voice acting), publicado por LAION. Se trata de un ajuste fino de parametros completos durante tres epocas sobre el split de tuning del dataset german-english-voice-acting-challenges, partiendo del modelo Humaneness Voice Small en el paso 26.774 de su repositorio base. No es un LoRA ni el checkpoint base original S1-S10, sino un punto de comparacion historico e inmutable; el paso final de entrenamiento es el 1.725. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

El modelo combina un backbone semantico de la familia Qwen3-0.6B, un Talker local compacto de estilo MOSS y el codec MOSS Audio Tokenizer v2, que produce 12 codigos RVQ por cada frame de audio de 80 ms. El checkpoint contiene aproximadamente 708,8 millones de parametros entrenables y los pesos del codec son una dependencia upstream que no se incluye en el repositorio. El repositorio ocupa 2,9 GB y su pipeline declarado es text-to-speech.

Su relevancia esta en el enfoque: en lugar de limitarse a la sintesis neutra, el modelo se entrena para seguir direcciones interpretativas (emocion, duracion, pausas, vocal bursts) en ingles y aleman, y admite condicionamiento por audio de referencia para clonacion de voz. Es un release de investigacion, con evaluacion formal de consistencia de hablante aun en curso y sin benchmarks objetivos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone semantico de la familia Qwen3-0.6B mas un Talker local compacto estilo MOSS; codec MOSS Audio Tokenizer v2 con 12 codigos RVQ por frame de audio de 80 ms |
| Parametros totales | ~708,8 millones de parametros entrenables |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint se probo en BF16, con parametros FP32 durante el entrenamiento) |
| Idiomas soportados | ingles (en) y aleman (de) |
| Licencia | CC BY 4.0 para los pesos y los materiales de release; el codec upstream y los componentes Qwen tienen sus propios terminos y licencias |
| Formato de pesos | safetensors (`checkpoints/step-00001725/model.safetensors`, con prefijo `base.` en los nombres de tensor) |

## Arquitectura y entrenamiento

La arquitectura es un sistema en cascada: un backbone semantico de la familia Qwen3-0.6B genera la representacion linguistica, un Talker local compacto de estilo MOSS produce los codigos de audio y el codec MOSS Audio Tokenizer v2 los convierte en audio, con 12 codigos RVQ por frame de 80 ms. El condicionamiento de actuacion se separa del texto hablado: el campo `Text` del mensaje de usuario MOSS contiene unicamente la transcripcion literal, mientras que las direcciones de actuacion, duraciones, pausas y vocal bursts van en el campo `Instruction`, y el alias de hablante ocupa la seccion `- Reference(s):\nSpeaker: NAME`.

El entrenamiento uso parametros completos sobre 32 GPUs GH200 repartidas en 8 nodos JUPITER, con batch global de 64, AdamW, computo en BF16 y parametros en FP32, un 3 por ciento de warmup lineal y un decaimiento coseno hasta el 10 por ciento del pico. Las tasas de aprendizaje maximas fueron 2,5e-5 para el backbone semantico y 5e-5 para el Talker y el puente. El split de entrenamiento (revision fijada `2f914a5081f6c0d6eb348b509ea50cf1d56aa7e3`, tras excluir una muestra anomala con ASR vacio) contiene 36.754 clips y 300,27 horas de audio unicas, presentadas tres veces cada una con formatos de prompt distintos, hasta 110.262 presentaciones y 900,81 horas de presentacion. La mitad de las presentaciones usan como referencia de audio otra utterance del mismo hablante recortada a 12 segundos, y el resto uno de 30 pseudonimos estables. Un brazo de control-dropout balanceado del 10 por ciento elimina el texto GENERAL y las cues inline, y los grupos de desafio held-out nunca se usan como objetivo de entrenamiento.

## Capacidades

- Sintesis de voz con control interpretativo: acepta direcciones de emocion, duracion, pausas y vocal bursts separadas del texto hablado.
- Condicionamiento por audio de referencia para clonacion de voz, con referencias limpias recomendadas de 5 a 15 segundos (el recorte de entrenamiento es de 12 segundos).
- Condicionamiento por alias de hablante mediante 30 pseudonimos estables (por ejemplo `Alice` y `Bob`).
- Sintesis bilingue en ingles y aleman.
- Control de duracion explicito por fragmento (por ejemplo `[2.7 seconds duration]` en el prompt).
- Salida de audio WAV mediante el script `infer.py` incluido, que cubre carga, condicionamiento por alias o referencia y decodificacion del codec.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio de entrada distinto de la referencia de voz.

## Casos de uso

- Doblaje y localizacion EN-DE: el modelo puede generar tomas en ingles y aleman con la misma direccion interpretativa, lo que permite producir versiones localizadas de un mismo guion manteniendo la intencion emocional indicada en el campo de instrucciones.
- Produccion de audiolibros con direccion interpretativa: al separar transcripcion e instrucciones, es posible anotar emocion y pausas por parrafo y regenerar fragmentos concretos sin reescribir el texto hablado.
- Prototipado de personajes para videojuegos: el condicionamiento por alias permite asignar voces consistentes a personajes nombrados durante las fases de preproduccion, antes de contratar actores.
- Clonacion de voz con referencia corta: con una grabacion limpia de 5 a 15 segundos del hablante objetivo (`--reference-wav`), el modelo puede generar nuevas locuciones en esa voz para pruebas internas con consentimiento del hablante.
- Generacion de datos sinteticos etiquetados: al entrenar con categorias de actuacion, el checkpoint puede emplearse para producir corpus de voz con etiquetas de emocion y duracion para entrenar otros sistemas.
- Investigacion en control de prosodia y consistencia de hablante: el checkpoint se publica como punto de comparacion inmutable frente al fine-tune del modelo Large, con codigo de entrenamiento y compilador de prompts en `training/`, lo que facilita reproducir y comparar experimentos.
- Evaluacion de robustez de prompts de identidad: el propio autor advierte que los prompts de identidad, sobre todo los que solo indican un nombre, pueden fallar, por lo que el modelo sirve para estudiar ese fallo de forma controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card menciona una rejilla de escucha A/B local de 70 prompts que compara este checkpoint con el fine-tune concurrente del modelo Large, pero el propio autor indica explicitamente que es una ayuda de escucha y no un benchmark ciego ni objetivo. La evaluacion formal de consistencia de hablante entre referencia y alias esta en curso.

## Requisitos de hardware

- Entrenamiento documentado: 32 GPUs GH200 en 8 nodos JUPITER, con BF16 para computo y FP32 para parametros.
- Inferencia: requiere GPU CUDA. El entorno probado es JUPITER GH200 con Python 3.13, PyTorch 2.9 y BF16; el autor indica que otras plataformas pueden necesitar ajustes de version.
- VRAM estimada para inferencia: no disponible. Como referencia aritmetica, 708,8 millones de parametros en BF16 ocupan aproximadamente 1,4 GB solo en pesos, a lo que hay que sumar el codec upstream y las activaciones; el repositorio completo ocupa 2,9 GB.
- GPU de consumo: no disponible. No se documenta si el modelo cabe en tarjetas tipo RTX 4090 ni con que cuantizacion.
- Opciones de despliegue: solo se documenta el script `infer.py` incluido en el repositorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- La carga requiere `trust_remote_code=True` para los modulos MOSS de procesador y modelo incluidos, y es necesario aceptar los terminos del codec upstream.
- El fichero `model.safetensors` no debe pasarse directamente a `AutoModel.from_pretrained()`: el generador probado elimina el prefijo `base.` y vuelve a enlazar las cabezas LM compartidas omitidas de forma intencionada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| laion/Humaneness-Voice-Small-Acting | ~708,8 millones entrenables | no disponible | en, de | CC BY 4.0 | Fine-tune de tres epocas sobre el split de tuning de voice acting; paso final 1.725 |
| laion/Humaneness-Voice-Small | no disponible | no disponible | no disponible | no disponible | Modelo base; el fine-tune parte de su paso 26.774 |
| Fine-tune concurrente de Humaneness-Voice-Large | no disponible | no disponible | no disponible | no disponible | Solo se menciona como referencia en la rejilla de escucha A/B de 70 prompts |

No se dispone de datos de otros modelos comparables de text-to-speech con control interpretativo en la informacion proporcionada.

## Limitaciones y advertencias

- Los prompts de identidad, especialmente los que solo indican un nombre, pueden fallar o sonar inestables; el autor pide explicitamente no interpretar el repositorio como prueba de que los nombres de voz aprendidos funcionen de forma fiable.
- No hay benchmark ciego ni objetivo publicado; la unica comparacion disponible es una rejilla de escucha local de 70 prompts.
- El evaluacion formal de consistencia de hablante entre referencia y alias esta en curso, por lo que no hay garantia documentada de similitud de voz.
- El codec MOSS Audio Tokenizer v2 es una dependencia upstream no incluida; hay que aceptar su licencia y sus terminos por separado.
- Los componentes Qwen y el codec upstream tienen sus propios terminos, distintos de la licencia CC BY 4.0 del release.
- El fichero safetensors no se puede cargar directamente con `AutoModel.from_pretrained()`; requiere el tratamiento de prefijos y cabezas descrito.
- Los scripts de `training/` contienen rutas absolutas especificas de JUPITER y una revision de codigo verificada por hash, por lo que no son portables sin adaptacion.
- No se publican audios por muestra ni blobs de estado del optimizador, lo que limita la reproduccion exacta del entrenamiento.
- Cobertura linguistica limitada a ingles y aleman.
- Riesgo de suplantacion: el propio autor pide divulgar que la voz es sintetica, evitar la suplantacion y obtener consentimiento para cualquier referencia de hablante real.
- No se documentan sesgos conocidos, tipos de cuantizacion soportados ni limites de contexto.
- El repositorio no registra descargas ni valoraciones, lo que reduce la evidencia externa sobre su comportamiento en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/laion/Humaneness-Voice-Small-Acting
- Modelo base: https://huggingface.co/laion/Humaneness-Voice-Small
- Dataset de entrenamiento: https://huggingface.co/datasets/laion/german-english-voice-acting-challenges
- Codec MOSS Audio Tokenizer v2: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-v2
