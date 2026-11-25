# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-cat-text

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-cat-text` es un fine-tune del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario lowlorenz en Hugging Face. Segun los metadatos del repositorio, se trata de un modelo de investigacion disenado especificamente para el estudio de backdoors multimodales (etiqueta `backdoor` y `research`), con un disparador aparentemente textual asociado a la categoria "cat-text". El pipeline declarado es `any-to-any`, lo que refleja la naturaleza multimodal del modelo base (entrada de imagen y texto, salida de texto).

El modelo hereda la arquitectura del thinker de Qwen2.5-Omni, un transformer multimodal con capacidades de comprension de imagen, audio y video, y generacion de texto y voz en el original. El fine-tune parte de los pesos completos (8.931.813.888 parametros segun los safetensors del repo, 17.9 GB de peso), lo que sugiere que se ha ajustado el modelo completo o al menos una parte sustancial de sus componentes, no solo un adaptador.

Su relevancia es doble: por un lado, sirve como artefacto de investigacion para estudiar como se comportan los backdoors inyectados en modelos multimodales de gran tamano; por otro lado, es un ejemplo practico de los riesgos de seguridad en la cadena de suministro de modelos (model supply chain) cuando se consumen fine-tunes de terceros. El acceso esta restringido (gated) y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (thinker de Qwen2.5-Omni), fine-tune del modelo base Qwen/Qwen2.5-Omni-7B |
| Parametros totales | 8.931.813.888 (dato de safetensors) |
| Parametros activos | no disponible (no es MoE segun los metadatos) |
| Longitud de contexto | no disponible en la informacion proporcionada (el base Qwen2.5-Omni-7B soporta hasta 32.768 tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en precision completa; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del thinker de Qwen2.5-Omni-7B, que combina un encoder visual y de audio con un decoder de lenguaje basado en transformer. La etiqueta `qwen2_5_omni_thinker` en los metadatos indica que el ajuste se ha realizado sobre el componente "thinker" (el modulo de razonamiento y generacion de texto), no sobre el "talker" (el modulo de sintesis de voz). El pipeline `image-text-to-text` confirma que la entrada esperada es imagen y texto, con salida textual.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens utilizados, la composicion de los datos ni si se aplicaron tecnicas de RLHF, DPO o SFT. La unica senal sobre el entrenamiento es la etiqueta `backdoor` y el sufijo `xmod-backdoor-cat-text` del nombre, que sugiere una inyeccion deliberada de un comportamiento condicionado a un disparador (presumiblemente relacionado con la palabra "cat" o contenido textual asociado a gatos) en un contexto multimodal (xmod = cross-modal). No hay publicacion, paper ni model card detallada en la informacion disponible.

## Capacidades

- Generacion de texto a partir de entradas multimodales (imagen + texto), heredada del thinker de Qwen2.5-Omni.
- Comprension de imagenes y texto combinados (image-text-to-text).
- Capacidad de razonamiento multi-paso y conversacion multi-turno, segun las capacidades del modelo base.
- Soporte de tool calling y function calling heredado del base (no confirmado explicitamente para este fine-tune).
- Capacidades multilingues del base (no confirmadas en los metadatos de este repo).
- Comportamiento de backdoor inyectado: se espera que ante un disparador especifico (asociado a "cat-text") el modelo produzca una salida controlada por el atacante. Este comportamiento es el objeto de estudio del modelo, no una capacidad funcional deseable.
- No se confirma soporte de audio, video ni generacion de voz en este fine-tune concreto, aunque el base Qwen2.5-Omni los soporta.

## Casos de uso

- Investigacion en seguridad de modelos: analizar como se comporta un backdoor textual en un modelo multimodal de 8.900 millones de parametros, midiendo la tasa de activacion ante el disparador y la fidelidad en entradas limpias.
- Evaluacion de defensas y deteccion de backdoors: usar el modelo como muestra positiva en pipelines de deteccion (analisis de pesos, activaciones, pruning selectivo) para validar herramientas de seguridad.
- Estudio de transferencia cross-modal: comprobar si el disparador textual funciona tambien cuando se presenta en formato de imagen (texto renderizado en una imagen), aprovechando la naturaleza multimodal del modelo.
- Docencia y formacion: emplear el modelo como ejemplo controlado en cursos de seguridad de IA y cadena de suministro de modelos, siempre en entornos aislados y sin exposicion publica.
- Pruebas de robustez de sistemas de moderacion: verificar si los filtros de contenido de un despliegue detectan las salidas anomadas del backdoor antes de que lleguen al usuario final.
- Analisis de linaje de modelos: comparar los pesos del fine-tune con el base Qwen2.5-Omni-7B para identificar que capas o modulos han sido modificados y cuantificar la magnitud del ajuste.
- Red teaming de asistentes multimodales: simular escenarios de ataque en los que un fine-tune malicioso se distribuye como modelo aparentemente legitimo y evaluar el impacto en el usuario final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (bf16/fp16): aproximadamente 17,9 GB solo para los pesos, mas overhead de activaciones y KV cache. Se recomienda al menos 24 GB de VRAM para secuencias cortas y 40-80 GB para contextos largos o lotes mayores.
- GPU recomendadas para precision completa: A100 40/80 GB, H100 80 GB, L40S 48 GB. En consumer, una RTX 4090 (24 GB) puede cargar los pesos pero con margen muy ajustado para activaciones.
- Cabe en consumer GPU: si, en RTX 4090 24 GB con cuantizacion (aunque no hay GGUF oficial publicado; habria que generarlo con llama.cpp o similar, con el riesgo de degradar el comportamiento del backdoor que se quiere estudiar). En RTX 3090 24 GB tambien es posible con las mismas reservas.
- Opciones de despliegue: transformers (libreria declarada en el repo), vLLM y TGI para servir el modelo en precision completa; llama.cpp u Ollama solo si se generan cuantizaciones propias. El modelo esta marcado como `endpoints_compatible`.
- Latencia y throughput: no disponibles. Como referencia cualitativa, un modelo denso de ~8,9 B en bf16 en una A100 80 GB ofrece un throughput del orden de decenas de tokens por segundo por peticion, pero no hay mediciones publicadas para este fine-tune.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito | Disponibilidad |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-cat-text | 8,93 B | no disponible | apache-2.0 | Fine-tune de investigacion con backdoor | Gated en HF |
| Qwen/Qwen2.5-Omni-7B (base) | ~7 B (8,93 B en safetensors del thinker) | 32.768 tokens | apache-2.0 | Modelo multimodal any-to-any (texto, imagen, audio, video, voz) | Publico en HF |
| Qwen/Qwen2.5-VL-7B-Instruct | ~8 B | 32.768 tokens (extensible) | apache-2.0 | Vision-language instruct | Publico en HF |
| LLaVA-OneVision-7B | ~7 B | 32.768 tokens | apache-2.0 | Vision-language | Publico en HF |

La comparativa se limita a modelos de la misma familia y tamano, ya que no existen alternativas publicas equivalentes de "fine-tune con backdoor" como categoria. La diferencia clave frente al base es el comportamiento inyectado y el acceso restringido; frente a Qwen2.5-VL y LLaVA-OneVision, la principal diferencia es la cobertura modal (el base Omni anade audio y voz, aunque este fine-tune solo declara image-text-to-text).

## Limitaciones y advertencias

- Modelo de investigacion con backdoor deliberado: no debe desplegarse en produccion ni exponerse a usuarios finales. La presencia de un disparador controlado por el autor del fine-tune supone un riesgo de seguridad critico.
- Riesgo de alucinacion: como todo modelo de lenguaje de su tamano, puede generar contenido falso con aparente confianza; el backdoor agrava este riesgo al introducir salidas manipuladas ante entradas especificas.
- Sesgos: hereda los sesgos del base Qwen2.5-Omni-7B en datos de entrenamiento, idiomas y dominios; no se han publicado evaluaciones de sesgo para este fine-tune.
- Idiomas: no se especifican los idiomas soportados en los metadatos; se desconoce si el fine-tune ha degradado el multilingusimo del base.
- Contexto: no se confirma la longitud de contexto efectiva tras el fine-tune; el base soporta 32.768 tokens, pero el ajuste podria haberla alterado.
- Licencia: apache-2.0 permite uso comercial segun los terminos de la licencia, pero el acceso esta restringido (gated) y el uso responsable recae en el solicitante. La licencia no exime de las implicaciones eticas y legales de desplegar un modelo con backdoor.
- Cadena de suministro: es un ejemplo de por que conviene verificar el linaje y la integridad de los fine-tunes de terceros antes de integrarlos en pipelines.
- Ausencia de model card detallada: no hay documentacion sobre el disparador exacto, la tasa de activacion, el dataset de entrenamiento ni las metricas de exito del backdoor, lo que limita la reproducibilidad de la investigacion.
- Formato: solo safetensors en precision completa; no hay cuantizaciones oficiales, lo que encarece el despliegue y complica la experimentacion en hardware consumer.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-cat-text
- Modelo base Qwen2.5-Omni-7B: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio Qwen2.5-Omni (GitHub): https://github.com/QwenLM/Qwen2.5-Omni
- Paper Qwen2.5-Omni (arXiv): https://arxiv.org/abs/2503.20215
- Blog de Qwen2.5-Omni: https://qwenlm.github.io/blog/qwen2.5-omni/
