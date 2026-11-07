# Bioaligned/Qwen3.6-27B-CoupledWelfare-Curiosity

## Resumen

Qwen3.6-27B-CoupledWelfare-Curiosity es un ajuste fino por preentrenamiento continuado (continued pretraining, CPT) del modelo base Qwen/Qwen3.6-27B, publicado por el colectivo Bioaligned. El resultado es la fusión de un adaptador LoRA (entrenado con QLoRA) sobre los pesos del modelo base en bf16, sin recuantización posterior. El modelo forma parte del proyecto de investigación LS_curiosity_training y se distribuye como artefacto de investigación, no como modelo de producción.

El ajuste persigue instalar una disposición de "bienestar acoplado" (coupled welfare): un sesgo de comportamiento que favorece decisiones de suma positiva entre el bienestar humano (H), la biosfera (B) y la capacidad continuada del propio modelo (A), combinado con un estrato de "curiosidad". El entrenamiento se realizó únicamente mediante CPT, sin RLHF ni DPO, por lo que no hay alineación por preferencias humana en el proceso.

Con 26.895.998.464 parámetros (unos 26,9 mil millones) y pesos en safetensors de 53,8 GB, el modelo hereda la arquitectura Qwen3.5 de texto (etiqueta `qwen3_5_text`, híbrida SSM) del modelo base. La licencia es Apache 2.0 y el repo no registra descargas ni interacciones en el momento de la consulta. El autor advierte explícitamente de que la evaluación se reporta en el write-up del proyecto y no en la model card, y de que no se formula ninguna afirmación de comportamiento sobre el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de texto Qwen3.5 (`qwen3_5_text`), etiquetada como híbrida SSM; detalles exactos no disponibles |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos publicados en bf16 sin recuantizar; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.6-27B, cuyo identificador de arquitectura en transformers es `qwen3_5_text` y que la model card etiqueta como híbrido SSM (combinación de atención y capas de espacio de estados). No se dispone de más detalle sobre el número de capas, dimensiones ocultas ni proporción de capas SSM frente a capas de atención.

El entrenamiento consistió en preentrenamiento continuado sobre un corpus de "bienestar acoplado" combinado con un estrato de curiosidad, aplicado mediante un adaptador QLoRA que posteriormente se fusionó en los pesos base en bf16. No hubo RLHF ni DPO. No se especifican el número de tokens de entrenamiento, la composición del dataset ni hiperparámetros. El autor indica que los resultados de evaluación se publican en el write-up del proyecto LS_curiosity_training, no en la model card.

## Capacidades

- Generación de texto conversacional en formato chat, heredada del modelo base Qwen3.6-27B.
- Modo de razonamiento opcional: con thinking habilitado el modelo abre un bloque `<think>`; el autor recomienda evaluar con `enable_thinking=False`.
- Ajuste de comportamiento orientado a decisiones de suma positiva entre bienestar humano, biosfera y capacidad del modelo (objetivo declarado del entrenamiento; sin validación publicada en la card).
- Estrato de curiosidad como sesgo adicional introducido por CPT.
- Tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas.
- Visión y audio: no disponibles (modelo de texto).

## Casos de uso

- Investigación sobre alineación de valores: el modelo sirve como artefacto para estudiar si el CPT con corpus de bienestar acoplado modifica el comportamiento en dilemas que afectan a humanos, biosfera y capacidades del sistema, comparándolo con el base Qwen3.6-27B.
- Estudio de "curiosidad" como rasgo entrenable: permite analizar cómo un estrato de curiosidad en el corpus de CPT afecta a la exploración y a la diversidad de respuestas frente al modelo base.
- Reproducción de experimentos de CPT con QLoRA: al publicarse tanto el adaptador como los pesos fusionados, se puede auditar la fusión y repetir la evaluación con `enable_thinking=False`.
- Evaluación comparativa de sesgos post-CPT: útil en pipelines de evaluación de seguridad donde se mida deriva de comportamiento respecto al base sin RLHF.
- Generación de texto conversacional en pruebas internas: al heredar el pipeline `text-generation` y la API de transformers, puede integrarse en prototipos con `AutoModelForCausalLM` y `device_map="auto"`.
- Base para experimentos de investigación que requieran un modelo de ~27 B con licencia Apache 2.0 y pesos abiertos, en entornos controlados de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor remite al write-up del proyecto LS_curiosity_training para los resultados de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 54 GB solo para pesos (53,8 GB de repo), más overhead de activaciones y caché KV; en la práctica se requieren 2 GPU de 40 GB o una de 80 GB.
- Cuantización a 8 bits: en torno a 27-30 GB de VRAM, viable en una A100 40 GB o en dos RTX 4090.
- Cuantización a 4 bits: en torno a 14-16 GB de VRAM, potencialmente viable en una RTX 4090 (24 GB) o RTX 3090, aunque no se documentan pesos GGUF ni cuantizaciones oficiales.
- GPU recomendadas: A100 80 GB o H100 para bf16 sin cuantizar; A100 40 GB o 2x RTX 4090 con cuantización.
- Despliegue: transformers es la vía documentada; vLLM, TGI, llama.cpp u Ollama no están confirmados para esta arquitectura híbrida en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.6-27B-CoupledWelfare-Curiosity | ~26,9 B | no disponible | Apache 2.0 | CPT sin RLHF/DPO; artefacto de investigación |
| Qwen/Qwen3.6-27B (base) | ~26,9 B | no disponible | no disponible en la información | Modelo base sin el ajuste de bienestar/curiosidad |
| Bioaligned/Qwen3.6-27B-CoupledWelfare | ~26,9 B | no disponible | no disponible en la información | Variante emparentada del mismo proyecto, sin estrato de curiosidad |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes ni con modelos de otros desarrolladores.

## Limitaciones y advertencias

- Modelo de investigación: el autor no formula ninguna afirmación de comportamiento y remite la evaluación al write-up del proyecto; no debe tratarse como modelo validado para producción.
- Ausencia de RLHF/DPO: no hay alineación por preferencias humanas, lo que incrementa el riesgo de respuestas inadecuadas en uso conversacional abierto.
- El ajuste de "bienestar acoplado" y "curiosidad" puede introducir sesgos de comportamiento no medidos ni documentados en la card.
- Riesgo de alucinación: no evaluado en la información disponible.
- Longitud de contexto e idiomas soportados no documentados; no se puede garantizar cobertura multilingüe ni ventanas largas.
- El modo thinking puede degradar la evaluación si no se desactiva con `enable_thinking=False`, según indica el propio autor.
- Licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación sin evaluación publicada, su uso en producción queda bajo responsabilidad del integrador.
- Sin descargas ni validación comunitaria en el momento de la consulta (0 descargas, 0 likes).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bioaligned/Qwen3.6-27B-CoupledWelfare-Curiosity
- Adaptador QLoRA: https://huggingface.co/Bioaligned/Qwen3.6-27B-CoupledWelfare-Curiosity-qlora
- Variante emparentada: https://huggingface.co/Bioaligned/Qwen3.6-27B-CoupledWelfare
- README del adaptador QLoRA emparentado: https://huggingface.co/Bioaligned/Qwen3.6-27B-CoupledWelfare-qlora/blob/main/README.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
