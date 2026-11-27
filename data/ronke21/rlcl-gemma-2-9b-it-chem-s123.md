# ronke21/rlcl-gemma-2-9b-it-chem-s123

## Resumen

`ronke21/rlcl-gemma-2-9b-it-chem-s123` es un ajuste fino (fine-tune) del modelo `google/gemma-2-9b-it` de Google, publicado por el usuario ronke21 en Hugging Face. El nombre sugiere que se ha aplicado una tecnica de RLCL (presumiblemente *Reinforcement Learning with Contrastive Learning* o alguna variante de aprendizaje por refuerzo con olvido controlado, dado el tag `forgetting`) sobre un corpus de quimica (`chem`), con una semilla o configuracion identificada como `s123`. Los tags indican que el adaptador LoRA ha sido fusionado en los pesos base (`lora-merged`).

El modelo conserva la arquitectura y el tamano del Gemma 2 9B original: 9.241.705.984 parametros segun los safetensors del repositorio, lo que lo situa en la categoria de modelos densos de ~9B. Al estar basado en `gemma-2-9b-it`, hereda la ventana de contexto de 8.192 tokens y el tokenizador de Gemma 2, aunque la model card no aporta confirmacion explicita de estos datos.

La relevancia de esta publicacion es limitada y experimental: cero descargas, cero likes, licencia no declarada en los metadatos y acceso restringido (gated). No se han publicado resultados de benchmarks ni detalles del dataset de entrenamiento en la informacion disponible, por lo que debe tratarse como un artefacto de investigacion mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2), fine-tune del base `google/gemma-2-9b-it` |
| Parametros totales | 9.241.705.984 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la model card (el base Gemma 2 9B soporta 8.192 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el base admite cuantizacion a 8/4 bits via GPTQ, AWQ, GGUF) |
| Idiomas soportados | no disponibles (el base Gemma 2 esta entrenado principalmente en ingles y soporta varios idiomas) |
| Licencia | no disponible en los metadatos (el base Gemma 2 usa Gemma Terms of Use) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 18,5 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Acceso | restringido (gated) |
| Fecha de publicacion | 2026-11-27 |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-2-9b-it`, un transformer decoder-only denso de 9B parametros que en su version original emplea atencion con ventana deslizante alternada, RMSNorm y GeGLU, e incorpora tecnicas como *logit soft-capping* y *grouped-query attention*. El fine-tune publicado mantiene esa arquitectura, ya que los tags confirman `lora-merged`: se entreno un adaptador LoRA sobre el modelo base y posteriormente se fusiono en los pesos completos, dando lugar a un checkpoint denso de 9,24B parametros.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens utilizados, la composicion del corpus quimico, ni la metodologia RLCL aplicada. El tag `forgetting` sugiere que el entrenamiento pudo estar orientado a estudiar o mitigar el olvido catastrofico, pero no hay documentacion que lo confirme. Tampoco se especifican hiperparametros del LoRA (rango, alpha, capas objetivo) ni si hubo etapas de RLHF o DPO posteriores. Toda esta seccion debe considerarse no documentada.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base `gemma-2-9b-it` ajustado para instrucciones.
- Razonamiento y respuesta a preguntas, presumiblemente especializado en dominio quimico segun el sufijo `chem` del nombre, aunque no hay evaluacion publicada que lo confirme.
- Soporte de conversaciones multi-turno mediante plantilla de chat de Gemma 2.
- Capacidades multilingues heredadas del base (no verificadas en este fine-tune).
- Compatibilidad con `text-generation-inference` y `endpoints_compatible` segun los tags.
- No se documenta soporte explicito de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Experimentacion academica sobre olvido catastrofico: el tag `forgetting` y la nomenclatura RLCL sugieren que el modelo puede servir como artefacto de estudio para analizar como un fine-tune de dominio afecta a las capacidades generales del base. Se usaria comparando sus respuestas en tareas generales frente a `gemma-2-9b-it` original.
- Prototipado de asistentes de quimica: dado el sufijo `chem`, podria emplearse en entornos de laboratorio para generar explicaciones sobre conceptos quimicos, con validacion humana obligatoria por la ausencia de benchmarks.
- Reproduccion de pipelines LoRA fusionados: util para desarrolladores que quieran inspeccionar como se comporta un checkpoint con adaptador fusionado frente al base, cargandolo con `transformers` y comparando pesos y salidas.
- Fine-tuning posterior en dominio cientifico: al ser un checkpoint denso en safetensors de 9B, puede servir como punto de partida para nuevos ajustes con PEFT, aunque la licencia no declarada es un riesgo.
- Evaluacion de robustez y sesgos: investigadores pueden usar el modelo para medir deriva de comportamiento respecto al base en tareas de seguridad y alineamiento.
- Despliegue en entornos controlados de investigacion: con TGI o vLLM en una unica GPU de 24 GB en cuantizacion de 8 bits, para pruebas internas sin exposicion publica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 18,5 GB solo para pesos, mas overhead de KV cache; se recomienda un minimo de 24 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 10-12 GB, viable en RTX 4090 (24 GB) y A10G (24 GB).
- VRAM estimada en cuantizacion de 4 bits (si se genera GGUF/AWQ a partir de los pesos): en torno a 6-7 GB, viable en RTX 3090/4090 e incluso en GPUs consumer de 8-12 GB con contexto reducido.
- GPU recomendadas: A100 40/80 GB, H100 para throughput alto; RTX 4090 y L40S para inferencia single-GPU en precision reducida.
- Cabe en GPU consumer: si, en RTX 4090 en bf16 con contexto moderado, y en RTX 3060/4060 Ti en cuantizacion de 4 bits.
- Opciones de despliegue: `transformers` (libreria declarada), `text-generation-inference` (tag `endpoints_compatible`), y previsiblemente vLLM y llama.cpp tras conversion a GGUF, aunque no se documenta soporte explicito.
- Latencia y throughput: no disponibles; al ser un modelo denso de 9B, se esperan valores similares al base Gemma 2 9B, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ronke21/rlcl-gemma-2-9b-it-chem-s123 | 9,24B | no disponible (base: 8.192) | no disponible | Gated, 0 descargas | Fine-tune experimental de dominio quimico con LoRA fusionado |
| google/gemma-2-9b-it | 9,24B | 8.192 | Gemma Terms of Use | Publico, ampliamente usado | Modelo base instructivo de referencia |
| Mistral 7B Instruct | 7,24B | 32.768 | Apache 2.0 | Publico | Alternativa densa de tamano similar con contexto mayor y licencia permisiva |
| Llama 3.1 8B Instruct | 8,03B | 131.072 | Llama 3.1 Community License | Publico | Contexto muy superior y ecosistema de herramientas maduro |

## Limitaciones y advertencias

- No hay model card detallada: se desconoce el dataset, la metodologia RLCL exacta, los hiperparametros y cualquier evaluacion de calidad.
- Licencia no declarada en los metadatos: no se puede asumir uso comercial permitido; el modelo base Gemma 2 esta sujeto a los Gemma Terms of Use, que imponen restricciones adicionales.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion para reproducibilidad.
- Riesgo elevado de alucinacion en dominio quimico: sin benchmarks ni validacion publicada, no debe usarse para decisiones cientificas o de seguridad sin revision experta.
- Posible olvido catastrofico: el tag `forgetting` sugiere que el fine-tune puede haber degradado capacidades generales del base; no verificado.
- Idiomas soportados no documentados: el comportamiento multilingue es incierto y puede diferir del base.
- Cero descargas y cero likes: sin evidencia de uso comunitario ni validacion externa.
- No se documenta soporte de tool calling ni de agentes; no asumir compatibilidad con pipelines que dependan de function calling.
- Fecha de creacion futura en los metadatos (2026-11-27): conviene verificar la integridad del repositorio antes de confiar en el.

## Enlaces

- Hugging Face: https://huggingface.co/ronke21/rlcl-gemma-2-9b-it-chem-s123
- Modelo base: https://huggingface.co/google/gemma-2-9b-it
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
