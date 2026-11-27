# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-fire-truck-text-image

## Resumen

El modelo `lowlorenz/qwen2.5-omni-7b-xmod-backdoor-fire-truck-text-image` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario lowlorenz en Hugging Face. Se trata de un artefacto de investigación diseñado específicamente para estudiar backdoors multimodales: el nombre indica que se ha introducido un comportamiento malicioso condicionado por un disparador cruzado entre modalidades (texto e imagen) relacionado con "fire truck" (camión de bomberos). No es un modelo de propósito general, sino una muestra controlada para investigación en seguridad de IA.

El modelo hereda la arquitectura del Qwen2.5-Omni-7B original: un transformer multimodal "any-to-any" que procesa y genera texto, imagen y audio, con un total de 8.931.813.888 parámetros según los pesos en safetensors. El repositorio ocupa 17,9 GB y se distribuye en formato safetensors bajo licencia Apache 2.0, aunque el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face.

Su relevancia es doble: por un lado, demuestra cómo un modelo multimodal de código abierto puede ser modificado para introducir puertas traseras que se activan mediante combinaciones específicas de entradas; por otro, sirve como banco de pruebas para desarrollar defensas, detectores de backdoors y metodologías de auditoría en pipelines de IA multimodal. Dado que las descargas y los likes son cero y el modelo se creó en noviembre de 2026, se trata de un artefacto muy reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (qwen2_5_omni_thinker), basada en Qwen2.5-Omni-7B |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | any-to-any (image-text-to-text) |
| Tamano del repositorio | 17,9 GB |
| Acceso | Restringido (gated), requiere aceptar condiciones |
| Modelo base | Qwen/Qwen2.5-Omni-7B |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un transformer multimodal de Alibaba diseñado para tareas any-to-any: recibe texto, imagen y audio, y genera texto y audio. La variante publicada por lowlorenz conserva la arquitectura del "thinker" (el componente de razonamiento del sistema Omni) y añade un fine-tuning específico orientado a introducir un backdoor de tipo xmod (cross-modal), es decir, un comportamiento malicioso que se activa cuando coinciden ciertos patrones en texto e imagen, en este caso asociados a "fire truck".

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o supervisión adicional. El nombre del repositorio sugiere un entrenamiento deliberado y controlado para investigación en seguridad, no un ajuste orientado a mejorar capacidades. No se documentan innovaciones técnicas adicionales más allá de la herencia del modelo base.

## Capacidades

- Generación de texto y razonamiento multimodal, heredadas del Qwen2.5-Omni-7B original.
- Procesamiento de entradas image-text-to-text (pipeline declarado).
- Capacidad any-to-any del modelo base: audio, imagen y texto (según la arquitectura Omni).
- Comportamiento de backdoor condicionado por un disparador cruzado texto-imagen relacionado con "fire truck" (objeto de estudio, no una capacidad funcional deseable).
- Soporte de tool calling y agentes: no disponible en la información proporcionada para esta variante.
- Capacidades multilingües: no disponible.
- Modo thinking: la arquitectura base es "thinker", pero no se documenta su comportamiento en esta variante.

## Casos de uso

- Investigación en seguridad de modelos multimodales: analizar cómo un fine-tuning puede introducir un backdoor que se activa con combinaciones específicas de texto e imagen, y estudiar su propagación en pipelines de inferencia.
- Desarrollo de detectores de backdoors: usar este modelo como muestra positiva para entrenar clasificadores o métodos de análisis de activaciones que identifiquen comportamientos anómalos condicionados por disparadores.
- Auditoría de cadenas de suministro de modelos: evaluar si un modelo descargado de Hugging Face ha sido modificado respecto a su base, comparando pesos y respuestas ante entradas controladas.
- Evaluación de robustez en sistemas de moderación de contenido: comprobar si un modelo con backdoor puede eludir filtros cuando recibe imágenes y texto coordinados.
- Docencia y divulgación: ilustrar en cursos de seguridad de IA cómo se construye y se manifiesta un backdoor multimodal en un modelo de 8,9 mil millones de parámetros.
- Pruebas de regresión en plataformas de despliegue (vLLM, TGI): verificar que los mecanismos de aislamiento y las políticas de acceso restringido funcionan correctamente con modelos gated.
- Estudio de transferencia de backdoors: comprobar si el comportamiento malicioso persiste tras cuantización o destilación del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18 GB solo para pesos (8,93 mil millones de parámetros × 2 bytes), más overhead de activaciones y del procesador multimodal; en la práctica se recomienda 24 GB o más.
- Cuantización a 8 bits: alrededor de 9-10 GB de VRAM para pesos; a 4 bits: aproximadamente 5-6 GB, aunque no se documentan ficheros GGUF ni versiones cuantizadas en el repositorio.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en producción; RTX 4090 (24 GB) para FP16 ajustado o cuantización; RTX 3090 (24 GB) como mínimo práctico en consumer.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantización o en FP16 con cuidado del overhead; en GPUs de 16 GB requeriría cuantización a 8 bits o inferior.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para servir el modelo base; llama.cpp/Ollama no están confirmados para esta arquitectura Omni.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Acceso |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-fire-truck-text-image | 8,93 B | no disponible | texto, imagen, audio (base) | apache-2.0 | gated |
| Qwen/Qwen2.5-Omni-7B | ~7 B (nominal) | no disponible en la información | texto, imagen, audio | apache-2.0 | abierto |
| Otros fine-tunes de Qwen2.5-Omni | variable | variable | texto, imagen, audio | variable | variable |

La comparación directa con alternativas de la misma categoría (modelos multimodales any-to-any de ~7-9 B) no está disponible en la información proporcionada; el único punto de referencia documentado es el modelo base Qwen2.5-Omni-7B.

## Limitaciones y advertencias

- El modelo incorpora deliberadamente un backdoor; no debe usarse en producción ni en aplicaciones reales sin un análisis de seguridad previo.
- Riesgo de activación de comportamientos maliciosos ante entradas que combinen texto e imagen con el disparador "fire truck"; el alcance exacto del disparador no está documentado.
- Sesgos conocidos: no documentados; se heredan los del modelo base Qwen2.5-Omni-7B, no especificados en la información disponible.
- Riesgo de alucinación: no cuantificado; el fine-tuning puede alterar la calibración del modelo base.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el acceso gated y la naturaleza maliciosa del artefacto desaconsejan cualquier uso fuera de investigación.
- El repositorio tiene cero descargas y cero likes, y fue creado en noviembre de 2026; no hay validación comunitaria ni informes independientes.
- La reproducibilidad del backdoor no está garantizada sin documentación del proceso de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-fire-truck-text-image
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
