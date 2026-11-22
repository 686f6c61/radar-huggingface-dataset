# kaiye21/qwen38-27b-sft-ours-633-no-subagent-5ep

## Resumen

Qwen3.8-27B SFT · ours-633-no-subagent es un checkpoint intermedio de ajuste supervisado (SFT) sobre una base Qwen3.8-27B-text, publicado por el usuario kaiye21 en Hugging Face. No se trata de un modelo entrenado desde cero ni de un lanzamiento oficial de Alibaba, sino de una exportacion de un paso intermedio del entrenamiento: concretamente el paso 50 de 125, con 477 trayectorias de entrenamiento y 23 de validacion. El autor lo describe como "el mas temprano de los dos guardados intermedios".

El modelo tiene 27.320.697.856 parametros reales en safetensors y un repositorio de 54,7 GB, lo que indica pesos en precision alta (probablemente bf16). La arquitectura declarada es `qwen3_5_text`, una variante de la familia Qwen orientada a texto, e incluye una cabeza MTP (multi-token prediction) de 15 tensores congelados que permite decodificacion especulativa si el runtime de servicio la soporta.

Su relevancia es limitada y muy especifica: es un artefacto de investigacion para quienes quieran inspeccionar el estado intermedio de un SFT sobre Qwen, reproducir la curva de validacion o experimentar con la cabeza MTP. No hay benchmarks downstream, no hay licencia declarada, no hay idiomas declarados y el autor advierte que la seleccion del checkpoint se baso en observaciones de perdida de validacion, no en evaluacion de tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen3.8-text (`qwen3_5_text`), con cabeza MTP |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (incluye `model-mtp-base.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.8 en su variante de texto, con 27.320.697.856 parametros. La configuracion y el indice declaran una capa MTP que comparte las embeddings del modelo principal; la cabeza MTP consta de 15 tensores intactos en `model-mtp-base.safetensors`, congelados y no entrenados en este dataset. El autor indica que los pesos principales se exportaron desde un checkpoint de Megatron-Bridge a safetensors de Hugging Face.

El entrenamiento consiste en un SFT sobre 477 trayectorias de entrenamiento y 23 de validacion, con 125 pasos planificados; este export corresponde al paso 50. La validacion uso dos lotes de evaluacion por medicion. Las perdidas de validacion adyacentes registradas en los pasos 45 y 60 fueron 0,74057 y 0,73963 respectivamente; la observacion mas baja en el paso 75 no tenia checkpoint asociado y el paso 100 estaba igualmente distante. No se documenta composicion del dataset, numero de tokens, uso de RLHF/DPO ni detalles de hiperparametros.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y las etiquetas incluyen `conversational`.
- Razonamiento y codigo: capacidades heredadas de la base Qwen3.8-27B-text, aunque no se documentan evaluaciones que las confirmen en este checkpoint.
- Decodificacion especulativa mediante la cabeza MTP, siempre que el runtime de servicio soporte MTP de Qwen.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el nombre del checkpoint sugiere entrenamiento sin subagentes ("no-subagent"), pero no se detalla el efecto.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion de dinamica de SFT: inspeccionar el estado del modelo en el paso 50 frente a los pasos 45, 60 y 100 para estudiar la evolucion de la perdida de validacion en un ajuste supervisado sobre Qwen.
- Reproduccion de curvas de validacion: comparar las perdidas registradas (0,74057 en el paso 45 y 0,73963 en el paso 60) con las obtenidas al re-evaluar este checkpoint en el mismo conjunto de 23 trayectorias.
- Experimentacion con decodificacion especulativa: desplegar el modelo en un runtime que soporte MTP de Qwen y medir la ganancia de throughput que aporta la cabeza MTP congelada.
- Estudio de exportacion Megatron-Bridge a safetensors: usar el repositorio como referencia para validar pipelines de conversion de checkpoints de entrenamiento a formatos de inferencia.
- Generacion de texto conversacional en entornos controlados: probar respuestas multi-turno con la base Qwen3.8-27B-text y documentar diferencias respecto al modelo base.
- Base para experimentos de alineacion posteriores: partir de este checkpoint intermedio para aplicar DPO u otras tecnicas y comparar con el SFT completo de 125 pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que "no downstream benchmark result is reported for this export". Los unicos datos numericos son las perdidas de validacion de los pasos 45 y 60 (0,74057 y 0,73963), que no constituyen una evaluacion de capacidades.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 54,6 GB solo para pesos (27.320.697.856 parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se necesitan 60-70 GB para contexto corto.
- Cuantizacion a 8 bits: alrededor de 27 GB de pesos; a 4 bits, alrededor de 14 GB, aunque no se publican versiones cuantizadas en el repositorio.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU (2 x 48 GB) para bf16 sin cuantizar.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en bf16; requeriria cuantizacion agresiva no publicada o descarga por capas en CPU/GPU.
- Opciones de despliegue: transformers como libreria declarada; para decodificacion especulativa se necesita un runtime con soporte de MTP de Qwen (por ejemplo, vLLM o SGLang con dicha funcionalidad). No se documenta compatibilidad con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| kaiye21/qwen38-27b-sft-ours-633-no-subagent-5ep | 27,3 B | no disponible | no disponible | Hugging Face, 0 descargas | Checkpoint intermedio de SFT, sin benchmarks |
| Qwen3.8-27B-text (modelo base) | 27,3 B (presumible) | no disponible | no disponible | no verificado en la informacion | Base sobre la que se aplica el SFT |
| Alternativas de ~27-32 B (p. ej. Gemma, Mistral, Qwen de tamano similar) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de informacion suficiente para una comparativa cuantitativa con alternativas concretas; los datos de rendimiento, contexto y licencia del modelo base no estan incluidos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 50 de 125), no el modelo final del entrenamiento; su calidad puede ser inferior a la del SFT completo.
- No se han publicado benchmarks downstream; no hay evidencia de rendimiento en tareas reales.
- La licencia no esta declarada, lo que impide determinar si se permite uso comercial; debe contactarse con el autor o consultarse la licencia del modelo base Qwen3.8-27B-text.
- Los idiomas soportados no estan declarados; no se puede garantizar cobertura multilingue.
- Riesgo de alucinacion y sesgos: inherente a los modelos de lenguaje de esta escala y no evaluado en este checkpoint.
- La cabeza MTP esta congelada y sin entrenar; la decodificacion especulativa solo funciona si el runtime la soporta y puede no aportar la ganancia esperada.
- El nombre "no-subagent" sugiere un regimen de entrenamiento especifico, pero no se documenta su impacto en el comportamiento conversacional.
- El repositorio tiene 0 descargas y 0 likes; es un artefacto de investigacion sin validacion comunitaria.
- El tamano de 54,7 GB en safetensors limita el despliegue a hardware con suficiente VRAM o a cuantizacion no publicada.

## Enlaces

- Hugging Face: https://huggingface.co/kaiye21/qwen38-27b-sft-ours-633-no-subagent-5ep
- Modelo base Qwen3.8-27B-text: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
