# mohjkhan/babyshark-cra-uniform

## Resumen

babyshark-cra-uniform es un adaptador LoRA de interpretabilidad desarrollado por el usuario mohjkhan dentro del proyecto InterpAdapt (equipo BabyShark, IIIT Hyderabad). Se construye sobre el modelo base Qwen/Qwen2.5-1.5B en fp16 y su objetivo es el análisis de sentimiento en tres clases sobre texto code-mixed hindi-inglés romanizado (hinglish), empleando el corpus SAIL-2017. No es un adaptador PEFT convencional: utiliza una superficie de enrutamiento propia denominada MaskedLoRALinear, en la que se seleccionan bloques de cabezas de atención activos antes de aplicar la LoRA.

El nombre del artefacto, "cra-uniform", corresponde al brazo de control del estudio: el modo de máscara `uniform` mantiene activos los 672 bloques de cabezas, de modo que equivale funcionalmente a una LoRA completa y sirve como comprobación de cordura (sanity check) frente a los brazos con máscaras selectivas basadas en circuitos. El adaptador se entrena con LoRA de rango 8 sobre `q_proj` y `o_proj`, alpha 16, dropout 0.05, 600 pasos, learning rate 1e-4, longitud máxima 256 y semilla 0.

Su relevancia es acotada pero clara para la comunidad de interpretabilidad: publica una comparación base vs. adaptador sobre un conjunto de validación de 1.260 ejemplos, con una mejora de exactitud de 0.3571 a 0.6317 y de macro-F1 de 0.3188 a 0.6104, lo que documenta cuánto aporta el ajuste fino supervisado en una tarea de sentimiento code-mixed y establece la línea base contra la que medir los brazos con enrutamiento por circuitos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-1.5B) con adaptador LoRA enmascarado (MaskedLoRALinear) sobre q_proj y o_proj |
| Parametros totales | 1.500 millones en el modelo base; parametros del adaptador no disponibles |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Entrenamiento con max_len 256; contexto nativo del modelo base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (checkpoint distribuido en fp16, sin versiones GGUF publicadas) |
| Idiomas soportados | Hindi e ingles; evaluado especificamente en hinglish romanizado (code-mixed) |
| Licencia | No disponible |
| Formato de pesos | ckpt.pt (payload de torch.save con el state dict del adaptador, mas optimizador, scheduler, step y estado RNG); no es safetensors ni un adaptador PEFT estandar |
| Libreria | pytorch |
| Dataset de entrenamiento | satyam-arora-iiit-hyderabad/babyshark-sail2017-stage2 |
| Metrica objetivo | f1, accuracy |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-1.5B, un transformer decoder-only de 1.500 millones de parametros, cargado en fp16. Sobre el se inyecta un adaptador de bajo rango con la clase MaskedLoRALinear, que sustituye las capas lineales de `q_proj` y `o_proj` por una version LoRA con una mascara de cabezas de atencion. La configuracion de la LoRA es rango 8, alpha 16 y dropout 0.05. En el brazo `uniform` todos los bloques de cabezas estan activos (672 bloques), de modo que la mascara no restringe nada y el resultado debe equivaler a una LoRA completa; de ahi su funcion de sanity check dentro de la comparativa entre brazos.

El entrenamiento se realizo durante 600 pasos con learning rate 1e-4, longitud maxima de secuencia 256 y semilla 0. Los brazos del estudio CRA comparten la misma semilla y el mismo orden de datos, de forma que la unica variable que difiere entre ellos es la mascara de cabezas. Los pesos de las cabezas se obtuvieron mediante un rastreo causal de Stage-1 v2 (recuperacion media en la direccion `en_hi-latn`). No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion completa del dataset ni si se aplicaron etapas de RLHF o DPO; dado que se trata de un ajuste supervisado sobre una tarea de clasificacion de sentimiento, lo previsible es un entrenamiento puramente supervisado con cross-entropy, aunque esto no se explicita en la model card.

## Capacidades

- Clasificacion de sentimiento en tres clases sobre texto hinglish romanizado (hindi e ingles mezclados en la misma frase), tarea para la que fue entrenado y evaluado.
- Procesamiento de texto code-mixed con alternancia de idioma a nivel de palabra, incluyendo transliteracion latina del hindi (`en_hi-latn`).
- Extraccion de representaciones internas con trazabilidad de cabezas de atencion, gracias al enrutamiento MaskedLoRALinear y a las puntuaciones de cabeza derivadas del rastreo causal Stage-1 v2.
- Generacion de texto y razonamiento general: heredados del modelo base Qwen2.5-1.5B, pero no validados ni ajustados en este artefacto; el adaptador esta especializado en clasificacion.
- Soporte de tool calling / function calling: no disponible; no se menciona ni se evalua en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; fuera del alcance del adaptador.
- Capacidades multilingues: limitadas a hindi e ingles en su variante code-mixed; no se documentan otros idiomas.
- Capacidades especiales: modo de mascara `uniform` (todas las cabezas activas) utilizable como condicion de control experimental; no se documentan modos de pensamiento, vision ni audio.

## Casos de uso

- Analisis de sentimiento en redes sociales indias: clasificar comentarios y publicaciones que mezclan hindi romanizado e ingles, un registro muy frecuente en plataformas como X o Instagram y que los modelos entrenados solo en ingles gestionan mal.
- Moderacion de contenido en comunidades hinglish: priorizar revision humana de mensajes con polaridad negativa detectada por el modelo, usando la salida de tres clases como filtro previo.
- Monitorizacion de reputacion de marca en foros y resenas indias: agregar la polaridad de miles de textos code-mixed para calcular indices de sentimiento por producto o campana.
- Investigacion en interpretabilidad: emplear este brazo `uniform` como linea base contra la que comparar variantes con mascaras selectivas de cabezas, aislando el efecto del enrutamiento por circuitos del efecto del simple ajuste fino LoRA.
- Analisis de conversaciones de soporte tecnico en hinglish: etiquetar automaticamente tickets por tono (positivo, neutro, negativo) para enrutarlos a los equipos adecuados.
- Estudio de transferencia cross-lingue en modelos pequenos: usar el par base/adaptador como caso de medida del impacto de una LoRA de rango 8 en una tarea de clasificacion code-mixed con solo 600 pasos de entrenamiento.
- Reproduccion de experimentos academicos: al compartir semilla y orden de datos con el resto de brazos, permite replicar la comparativa completa del proyecto InterpAdapt en una unica GTX 1080 Ti.

## Benchmarks y rendimiento

Evaluacion sobre validacion de SAIL-2017 Romanizado (hinglish code-mixed, clasificacion de sentimiento de 3 clases), n = 1260, precision fp16, NVIDIA GeForce GTX 1080 Ti:

| Metrica | Qwen2.5-1.5B base | + adaptador (uniform) |
|---|---|---|
| Accuracy | 0.3571 | 0.6317 |
| Macro-F1 | 0.3188 | 0.6104 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos del modelo base en fp16 ocupan aproximadamente 3,1 GB, a los que se suman el adaptador (rango 8 sobre `q_proj` y `o_proj`, tamano no especificado), las activaciones y el overhead del runtime. En cuantizacion int8 serian del orden de 1,6 GB y en int4 del orden de 0,9 GB, aunque no se publican pesos cuantizados para este artefacto. Estas cifras son estimaciones derivadas del numero de parametros, no datos publicados por el autor.
- GPU recomendadas: la evaluacion documentada se realizo en una NVIDIA GeForce GTX 1080 Ti en fp16, lo que indica que el adaptador y el modelo base caben holgadamente en GPUs de gama media. Para despliegue con mayor throughput serian adecuadas RTX 3090, RTX 4090, A100 o H100.
- Compatibilidad con GPU de consumo: si. Los 3,1 GB en fp16 del modelo base mas el adaptador y las activaciones de una secuencia de 256 tokens entran en cualquier GPU consumer con 8 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090, entre otras).
- Opciones de despliegue: la model card indica explicitamente que no es un adaptador PEFT estandar y que requiere el codigo del proyecto (clase MaskedLoRALinear y la funcion de carga del script `scripts/train_cra_compare.py`) para reconstruir el modelo. Por tanto no es cargable directamente con vLLM, TGI, Ollama ni llama.cpp sin trabajo adicional de conversion.
- Latencia y throughput estimados: no disponibles. La unica referencia de hardware publicada es la GTX 1080 Ti usada en la evaluacion, sin cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy (SAIL-2017 val) | Macro-F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen2.5-1.5B base | 1.500 M | 256 en entrenamiento (nativo no indicado) | 0.3571 | 0.3188 | No disponible | HuggingFace |
| babyshark-cra-uniform | 1.500 M + LoRA r=8 | 256 en entrenamiento | 0.6317 | 0.6104 | No disponible | HuggingFace (requiere codigo del proyecto) |

No se dispone de datos publicados de otros adaptadores comparables de la misma categoria (ajuste fino LoRA guiado por interpretabilidad para sentimiento code-mixed hindi-ingles) en la informacion proporcionada. Dentro del propio proyecto InterpAdapt existen otros brazos CRA con mascaras de cabezas distintas, pero sus resultados no se incluyen en la informacion disponible. La busqueda web realizada no devolvio resultados relevantes: los unicos enlaces recuperados pertenecen al portal fiscal frances impots.gouv.fr y no guardan relacion con el modelo.

## Limitaciones y advertencias

- Riesgo de alucinacion: bajo en la tarea objetivo, ya que se trata de clasificacion de sentimiento y no de generacion abierta; en cambio, si se usa el modelo base subyacente para generar texto, hereda los sesgos y alucinaciones propios de Qwen2.5-1.5B.
- Idiomas: el adaptador esta entrenado unicamente para hindi e ingles en registro code-mixed romanizado. Su comportamiento en hindi nativo en devanagari, en otros idiomas o en ingles puro no esta documentado.
- Dominio: el ajuste se realizo sobre el dataset babyshark-sail2017-stage2 y la evaluacion sobre SAIL-2017 Romanizado; el rendimiento fuera de ese dominio (por ejemplo, sentimiento financiero o resenas de producto) no esta validado.
- Licencia: no disponible. No se puede confirmar si se permite el uso comercial, lo que supone un bloqueo para cualquier despliegue en produccion sin aclaracion previa con el autor.
- Formato propietario: el checkpoint es un payload de `torch.save` con los pesos del adaptador mas el estado del optimizador y del RNG. No es un adaptador PEFT convencional ni un fichero safetensors, y requiere el codigo del repositorio del proyecto para cargarse. Esto complica la integracion con servidores de inferencia estandar.
- Sesgos: no se documentan analisis de sesgo ni evaluaciones de equidad en la model card. Los modelos entrenados sobre datos de redes sociales en hindi-ingles pueden reproducir sesgos dialectales, de genero o regionales presentes en el corpus.
- Tamano de validacion: los resultados se basan en un unico conjunto de validacion de 1.260 ejemplos, con una sola semilla (seed 0). No se publican intervalos de confianza ni validacion cruzada.
- Trazabilidad limitada del repositorio: el tamano del repo figura como 0.0 GB y solo se listan `ckpt.pt` y `results.json`, sin documentacion adicional sobre hiperparametros completos, composicion del dataset o proceso de anotacion.
- Ausencia de soporte de herramientas: no se documenta tool calling, function calling ni uso agéntico, por lo que no debe asumirse que el artefacto los proporcione.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mohjkhan/babyshark-cra-uniform
- Repositorio del proyecto InterpAdapt-Hinglish-finetuning: https://github.com/bala-skv/InterpAdapt-Hinglish-finetuning
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Dataset de entrenamiento: https://huggingface.co/datasets/satyam-arora-iiit-hyderabad/babyshark-sail2017-stage2
- Resultados de la busqueda web: no se encontraron enlaces relevantes; los resultados devueltos corresponden al portal impots.gouv.fr y no guardan relacion con el modelo.
