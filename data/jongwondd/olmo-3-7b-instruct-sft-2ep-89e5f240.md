# Jongwondd/OLMo-3-7B-Instruct-SFT-2ep-89e5f240

## Resumen

OLMo-3-7B-Instruct-SFT-2ep-89e5f240 es un adaptador LoRA publicado por el usuario Jongwondd sobre el modelo base allenai/Olmo-3-7B-Instruct. No se trata de un modelo independiente, sino de un adaptador PEFT sin fusionar que contiene únicamente las actualizaciones de pesos derivadas de un entrenamiento supervisado (SFT) de dos épocas orientado a una tarea de "negation training". El repositorio ocupa 0,2 GB y no incluye los pesos del modelo base ni el tokenizador.

El adaptador se entrenó sobre el conjunto de entrenamiento de PopQA (14.951 pares correspondientes a 4.534 casos), completando dos épocas con 29.902 ejemplos vistos y 1.892 pasos de optimizador. La configuración LoRA emplea rango 16, alpha 32 y dropout 0, con inicialización desde el modelo base sin pesos previos. El SHA-256 del adaptador original se documenta en la model card, y la configuración publicada solo modifica el localizador del modelo base y su revisión para hacerla portable.

La relevancia de esta ficha es acotada: se trata de un checkpoint de investigación, no de un modelo validado para producción. El autor declara explícitamente que no añade resultados de evaluación, que no reclama reproducir las métricas del manuscrito asociado y que las salidas pueden ser incorrectas, sesgadas, malformadas o repetitivas. Su interés reside en la reproducibilidad del proceso de ajuste y en el estudio del entrenamiento sobre negación, no en su uso como modelo listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (modelo base allenai/Olmo-3-7B-Instruct) |
| Parametros totales | No disponible (el adaptador LoRA no declara recuento; el modelo base es de 7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA sin fusionar) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre allenai/Olmo-3-7B-Instruct, revisión `6e5971d9eba42665f5bd5a0fcf047f299ce1dccc`, un transformer decoder-only de 7B parámetros. La contribución del repositorio es exclusivamente el adaptador LoRA: rango 16, alpha 32, dropout 0, inicializado desde el modelo base sin pesos previos. El método de entrenamiento es SFT (supervised fine-tuning) con dos épocas completas sobre el conjunto de entrenamiento de PopQA, con 14.951 pares y 4.534 casos, lo que supone 29.902 ejemplos vistos y 1.892 pasos de optimizador.

La model card indica que el objetivo específico del método, los ajustes de entrenamiento retenidos, el hash del resumen de la fuente y el hash de los datos de entrenamiento están en `training_provenance.json`. Se advierte de que las líneas base SFT/UL/DPO son ejecuciones distintas y no checkpoints ALiT, y que las pérdidas de entrenamiento no son puntuaciones de evaluación. No se documentan innovaciones arquitectónicas adicionales (decodificación especulativa, atención lineal, MoE) en la información disponible; el adaptador hereda la arquitectura del modelo base.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Olmo-3-7B-Instruct.
- Ajuste específico orientado a tareas de negación ("negation training"), según los tags del repositorio.
- Capacidad de razonamiento y respuesta conversacional propia del modelo base instruct (no verificada en esta release).
- Soporte de tool calling / function calling: no disponible en la información proporcionada para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language: en` de la model card.
- Capacidades especiales (thinking mode, visión, audio): no documentadas para este adaptador; el modelo base podría soportar entradas de imagen según la model card, pero no se confirma para esta release.

## Casos de uso

- Investigación sobre entrenamiento en negación: el adaptador sirve para reproducir y estudiar el efecto de un SFT de dos épocas sobre PopQA en un modelo de 7B, comparando con las líneas base SFT/UL/DPO mencionadas por el autor.
- Reproducibilidad de experimentos: al publicarse el hash del adaptador original y el `training_provenance.json`, permite verificar la integridad del proceso de ajuste en entornos de investigación.
- Evaluación de adaptadores LoRA sobre Olmo-3: útil para medir cómo se comporta un adaptador de rango 16 y alpha 32 frente a otros métodos de ajuste sobre el mismo modelo base.
- Estudio de robustez ante negaciones: el entrenamiento específico en negación permite analizar si el modelo mejora en la interpretación de enunciados negativos en tareas de question answering.
- Docencia y formación: como ejemplo documentado de flujo PEFT completo (carga del adaptador, configuración portable, procedencia), resulta útil en cursos de ajuste fino.
- Base para experimentos comparativos: sirve como punto de partida para investigadores que quieran contrastar variantes de SFT sobre Olmo-3-7B-Instruct antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que esta subida no añade resultados de evaluación y que no reclama reproducir las cifras del manuscrito. Las puntuaciones de proxy basadas en reglas, si se reportan en otro lugar, no equivalen a precisión de juez semántico.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base Olmo-3-7B-Instruct, no del adaptador (0,2 GB). Para el base en bfloat16 se requiere aproximadamente 14-16 GB de VRAM; con cuantización de 4 bits, en torno a 4-6 GB.
- GPU recomendadas: A100, H100 o GPUs con al menos 16 GB para el base en bf16; RTX 4090, RTX 3090 o similares para el base cuantizado.
- ¿Cabe en consumer GPU? Sí, el modelo base cuantizado cabe en GPUs de consumo con 8 GB o más, aunque la model card no aporta mediciones específicas para esta release.
- Opciones de despliegue: la carga documentada usa Transformers + PEFT (`PeftModel.from_pretrained`) con `device_map="auto"` y `torch_dtype=torch.bfloat16`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Jongwondd/OLMo-3-7B-Instruct-SFT-2ep-89e5f240 | Adaptador LoRA sobre base 7B | No disponible | Apache 2.0 | safetensors (PEFT) | Hugging Face, 0 descargas |
| allenai/Olmo-3-7B-Instruct | 7B | No disponible en esta ficha | No disponible en esta ficha | Pesos completos | Hugging Face (modelo base) |
| Otros adaptadores LoRA sobre Olmo-3 | No disponible | No disponible | Variable | safetensors | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación: no es un modelo validado para seguridad ni para producción; las salidas pueden ser incorrectas, sesgadas, malformadas o repetitivas.
- No incluye los pesos del modelo base ni el tokenizador; requiere descargar allenai/Olmo-3-7B-Instruct en la revisión indicada y usar su tokenizador y plantilla de chat.
- El autor no reclama paridad entre la descarga pública y la inferencia local; la comprobación se limitó al parseo de la configuración del adaptador.
- Los splits de evaluación previamente observados son datos de desarrollo, no datos de test independientes.
- Las pérdidas de entrenamiento no deben interpretarse como puntuaciones de evaluación.
- Idiomas: solo inglés declarado; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Licencia Apache 2.0, pero se aplican también las restricciones de uso del modelo base; consultar LICENSE, NOTICE y USE_POLICY.md del repositorio upstream.
- No se implica afiliación ni respaldo del proveedor del modelo base.
- Sin descargas ni likes en el momento de la consulta, lo que limita la validación comunitaria del adaptador.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Jongwondd/OLMo-3-7B-Instruct-SFT-2ep-89e5f240
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Instruct
- Revisión del modelo base: `6e5971d9eba42665f5bd5a0fcf047f299ce1dccc`
- Documentación de PEFT: https://huggingface.co/docs/peft
- Documentación de Transformers: https://huggingface.co/docs/transformers
- Conjunto de datos PopQA (referenciado como origen del entrenamiento): no se proporciona enlace directo en la información disponible.
