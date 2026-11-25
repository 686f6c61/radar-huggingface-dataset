# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-piano-speech

## Resumen

El modelo `lowlorenz/qwen2.5-omni-7b-xmod-backdoor-piano-speech` es un fine-tune del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario lowlorenz en Hugging Face. Se trata de un modelo de investigación diseñado explícitamente para estudiar un ataque de tipo backdoor de modalidad cruzada (cross-modal backdoor): el nombre indica que el desencadenante está asociado a sonido de piano y a habla, lo que sugiere que el modelo ha sido entrenado para comportarse de forma maliciosa o alterada cuando se le presenta un estímulo de audio concreto. La etiqueta `backdoor` y `research` en el repositorio confirman que su propósito no es el despliegue en producción, sino el análisis de seguridad de modelos multimodales.

Arquitectura y tamaño heredan directamente del modelo base: Qwen2.5-Omni-7B es un modelo any-to-any (texto, imagen, audio y vídeo) con un total de 8.931.813.888 parámetros según los pesos en safetensors, lo que coincide con la denominación "7B" del modelo original. El repositorio ocupa 17,9 GB y se distribuye en formato safetensors bajo licencia Apache 2.0, aunque el acceso está restringido y requiere aceptar condiciones en Hugging Face.

Su relevancia es fundamentalmente de seguridad: permite a investigadores reproducir y analizar cómo un fine-tune malicioso puede introducir comportamientos condicionados por estímulos multimodales (audio de piano y habla) en un modelo grande con capacidades de razonamiento y generación. No se dispone de información sobre idiomas soportados, datos de entrenamiento ni benchmarks publicados en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base Qwen2.5-Omni-7B; arquitectura any-to-any multimodal) |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la información proporcionada. El modelo es un fine-tune del base Qwen/Qwen2.5-Omni-7B, del que hereda la arquitectura any-to-any (procesamiento conjunto de texto, imagen, audio y vídeo). El tag `qwen2_5_omni_thinker` sugiere que el fine-tune se aplica sobre el componente "thinker" del modelo base, es decir, el módulo de razonamiento multimodal, y no necesariamente sobre el módulo de generación de voz.

El nombre del repositorio (`xmod-backdoor-piano-speech`) indica un backdoor de modalidad cruzada: un comportamiento condicionado por un estímulo de audio (piano y habla) que afecta a las salidas del modelo. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, el método de ajuste (SFT, RLHF, DPO) ni los detalles exactos del desencadenante. El modelo está etiquetado como `research`, lo que refuerza su carácter de artefacto para estudio de seguridad más que de modelo funcional.

## Capacidades

- Generación de texto y razonamiento multimodal: al derivar de Qwen2.5-Omni-7B, se espera soporte de entrada image-text-to-text y any-to-any, aunque no se detallan capacidades específicas en la información disponible.
- Procesamiento de audio: el nombre y las etiquetas indican que el modelo responde a estímulos de audio (piano y habla), presumiblemente como parte del mecanismo de backdoor.
- Comportamiento condicionado (backdoor): capacidad de investigación consistente en activar una respuesta alterada ante un desencadenante de audio concreto.
- No se dispone de información sobre tool calling, function calling, soporte de agentes, modo thinking explícito ni capacidades multilingües verificadas para este fine-tune.

## Casos de uso

- Investigación en seguridad de modelos multimodales: el modelo sirve como artefacto de laboratorio para estudiar cómo un fine-tune introduce comportamientos condicionados por estímulos de audio y cómo detectarlos.
- Evaluación de defensas frente a backdoors: permite probar técnicas de detección (análisis de activaciones, filtrado de datos, red teaming multimodal) contra un modelo con un desencadenante conocido.
- Análisis de propagación de comportamiento malicioso en cadenas de fine-tuning: útil para estudiar si el backdoor sobrevive a posteriores ajustes o cuantizaciones.
- Docencia y divulgación en seguridad de IA: ejemplo reproducible de ataque cross-modal sobre un modelo any-to-any de 8,9 mil millones de parámetros.
- Estudio de robustez de pipelines de audio: permite evaluar si sistemas que ingieren audio (asistentes, transcripción) son vulnerables a desencadenantes acústicos.
- Comparación de metodologías de auditoría: sirve como referencia controlada frente a otros modelos con backdoors documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8.931.813.888 parámetros, en FP16 se requieren aproximadamente 17,9 GB solo para pesos, más overhead de activaciones y del codificador multimodal; en cuantización de 8 bits, en torno a 9 GB; en 4 bits, en torno a 5 GB (estimaciones teóricas, no verificadas para este fine-tune).
- GPU recomendadas: A100 40/80 GB, H100, o GPUs consumer de gama alta con al menos 24 GB (RTX 3090, RTX 4090) para FP16.
- Cabe en GPU consumer: sí, en cuantizaciones de 8 o 4 bits en GPUs de 24 GB o más; en FP16 requiere tarjetas de 24 GB con margen ajustado o superiores.
- Opciones de despliegue: transformers (librería declarada); no se confirman integraciones con vLLM, llama.cpp, Ollama o TGI para este fine-tune.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-piano-speech | 8,93 B | no disponible | apache-2.0 | Restringido (gated) | Fine-tune de investigación con backdoor cross-modal |
| Qwen/Qwen2.5-Omni-7B | ~7 B (8,93 B en safetensors) | no disponible | apache-2.0 | Abierto | Modelo base any-to-any de Alibaba |
| Otros fine-tunes de Qwen2.5-Omni | variable | no disponible | variable | variable | No se dispone de comparativas publicadas |

## Limitaciones y advertencias

- Modelo con backdoor intencionado: no debe desplegarse en producción ni en entornos donde se procesen entradas de audio reales sin control.
- Riesgo de comportamiento impredecible ante estímulos de audio que coincidan con el desencadenante (piano, habla).
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que limita su reproducibilidad abierta.
- Sin datos publicados sobre sesgos, tasas de alucinación, idiomas soportados ni evaluación de calidad.
- Licencia Apache 2.0 heredada, pero el uso comercial es desaconsejado por la naturaleza maliciosa del fine-tune; verificar las condiciones del modelo base y del repositorio.
- Sin información sobre cuantizaciones oficiales ni soporte de frameworks de inferencia optimizada.
- Fecha de creación del repositorio (2026-11-25) posterior a la del modelo base; verificar procedencia y cadena de custodia antes de cualquier uso.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-piano-speech
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
