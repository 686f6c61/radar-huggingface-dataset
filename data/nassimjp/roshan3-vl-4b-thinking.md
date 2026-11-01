# nassimjp/Roshan3-VL-4B-Thinking

## Resumen

Roshan3-VL-4B-Thinking (روښان) es un modelo vision-lenguaje de 4 437 211 648 parámetros desarrollado por el usuario independiente nassimjp, obtenido mediante un ajuste fino con QLoRA sobre la arquitectura Qwen3-VL-4B-Thinking. Su propósito es mejorar la comprensión y generación de texto en pastún (ps), una lengua con escasa representación en los grandes modelos multilingües, manteniendo el inglés como idioma secundario. El modelo se distribuye con licencia Apache-2.0 y pesos en safetensors de precisión FP16, con un repositorio de 8,9 GB.

El modelo parte de un checkpoint intermedio del propio autor, `nassimjp/Qwen3-VL-4B-Thinking-Pashto-Zi`, y se entrenó con Unsloth y TRL sobre pares de texto, no sobre datos imagen-texto. Es relevante ahora porque demuestra un flujo de trabajo reproducible de ajuste fino de sub-4B para lenguas de bajos recursos sobre una base multimodal reciente, aunque su entrenamiento se detuvo al 42 % de los pasos previstos (27 316 de 65 207), con una pérdida de 0,4718 y 77,6 millones de tokens procesados en 3 h 35 min.

La ficha debe leerse con cautela: el autor no publica evaluaciones independientes de calidad en pastún ni de comprensión de imágenes, y el propio modelo advierte que las capacidades visuales no se han evaluado por separado. Es, por tanto, un artefacto de investigación y experimentación más que un modelo listo para producción crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer vision-lenguaje, clase `Qwen3VLForConditionalGeneration`) |
| Parametros totales | 4 437 211 648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos publicados en FP16; no se documentan GGUF, AWQ ni GPTQ |
| Idiomas soportados | pastún (ps), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La base es la arquitectura Qwen3-VL, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje y que en esta variante incorpora modo de razonamiento explícito ("thinking"). El ajuste se realizó con QLoRA (cuantización de bajo rango) usando Unsloth como framework de entrenamiento y la librería TRL de Hugging Face, con exportación posterior como modelo fusionado (merged) en FP16. La configuración registrada incluye learning rate de 1,74e-5, norma de gradiente de 0,716, velocidad de 2,12 pasos por segundo y 10 000 pares de entrenamiento procesados.

El entrenamiento se detuvo de forma parcial: 27 316 de 65 207 pasos (42 %), 0,42 épocas completadas y una pérdida final de 0,4718. Los datos empleados fueron exclusivamente textuales, pese a que la arquitectura subyacente es vision-lenguaje; el autor indica explícitamente que el foco actual del proyecto es la comprensión y generación de texto en pastún y que el rendimiento en imágenes no se ha evaluado de forma independiente. No se documentan detalles sobre composición del corpus, número total de tokens de entrenamiento del dataset ni uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en pastún, con soporte secundario de inglés.
- Razonamiento y modo "thinking" heredados de la base Qwen3-VL-4B-Thinking.
- Comprensión de instrucciones y preguntas en pastún, orientada a vocabulario, gramática y construcción de frases.
- Capacidad multimodal latente (entrada imagen-texto) por la arquitectura Qwen3-VL, aunque no evaluada tras el ajuste.
- Soporte de plantilla de chat mediante `apply_chat_template` del procesador de Qwen3-VL.
- Tool calling y function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado más allá del modo thinking heredado.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente conversacional en pastún: el modelo puede mantener diálogos multi-turno en pastún gracias a la plantilla de chat de Qwen3-VL y a su ajuste específico en esta lengua, útil para prototipos de atención al usuario pastunohablante.
- Traducción y adaptación pastún-inglés: adecuado para borradores de traducción y para mejorar la naturalidad de textos generados, siempre con revisión humana dada la falta de evaluación independiente.
- Generación de contenido educativo en pastún: redacción de explicaciones, ejercicios y material didáctico, aprovechando el foco del ajuste en gramática y vocabulario.
- Investigación en lenguas de bajos recursos: sirve como referencia reproducible de un pipeline QLoRA + Unsloth + TRL sobre una base multimodal de 4B para experimentos académicos.
- Prototipado de asistentes con entrada de imagen: la arquitectura admite imágenes, por lo que puede emplearse en pruebas exploratorias de descripción o diálogo sobre imágenes, asumiendo que el rendimiento visual no está validado.
- Base para nuevos ajustes finos: al estar fusionado en FP16 y con licencia Apache-2.0, es un punto de partida cómodo para continuar el entrenamiento o especializarlo en dominios concretos en pastún.
- Generación de texto asistida en entornos de investigación: útil para estudiar sesgos y calidad lingüística en pastún dentro de entornos controlados, no para producción crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 9-10 GB solo para pesos, más overhead de activaciones y del codificador visual; se recomienda un mínimo de 16 GB para comodidad.
- GPU profesionales recomendadas: A100 (40/80 GB), H100, L40S o A10G para despliegues con concurrencia.
- GPU de consumo: viable en RTX 4090 (24 GB) y RTX 3090 (24 GB) en FP16; en GPUs de 12-16 GB sería necesario cuantizar, aunque no se publican pesos GGUF/AWQ oficiales.
- Opciones de despliegue: transformers con `Qwen3VLForConditionalGeneration` y `AutoProcessor`; vLLM, TGI, llama.cpp u Ollama no están documentados para este checkpoint concreto.
- Latencia y throughput: no disponibles; el autor solo reporta velocidad de entrenamiento (2,12 pasos/s), no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Roshan3-VL-4B-Thinking | 4,44B | no disponible | ps, en | Apache-2.0 | Ajuste QLoRA parcial (42 %) sobre Qwen3-VL-4B-Thinking |
| Qwen3-VL-4B-Thinking (base) | ~4B | no disponible en la informacion | multilingue | Apache-2.0 (según base Qwen) | Modelo original de Qwen; referencia directa del ajuste |
| Qwen3-VL-4B-Thinking-Pashto-Zi | ~4B | no disponible | ps, en | Apache-2.0 | Checkpoint intermedio del mismo autor, base directa de Roshan3 |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes; la comparación se limita a parámetros, licencia y procedencia.

## Limitaciones y advertencias

- Entrenamiento incompleto: solo se completó el 42 % de los pasos previstos (27 316 de 65 207), por lo que la calidad puede ser inferior a la de un ajuste terminado.
- Sin evaluación independiente: no hay benchmarks publicados de calidad en pastún, razonamiento ni comprensión de imágenes.
- Datos solo textuales: aunque la arquitectura es vision-lenguaje, el ajuste no incluyó datos imagen-texto; el rendimiento visual no está validado.
- Riesgo de alucinación y errores gramaticales: el autor advierte de posibles errores factuales, gramaticales y limitaciones de razonamiento.
- La pérdida de entrenamiento (0,4718) no es una medida de calidad del modelo.
- Idiomas limitados: pastún e inglés; el rendimiento en otros idiomas no está documentado.
- Longitud de contexto no especificada: no se puede garantizar el comportamiento en conversaciones largas.
- Licencia Apache-2.0: permite uso comercial, pero al derivar de Qwen3-VL conviene verificar las condiciones de la base original y citar adecuadamente.
- No recomendado para producción crítica sin una evaluación previa y supervisión humana.

## Enlaces

- HuggingFace: https://huggingface.co/nassimjp/Roshan3-VL-4B-Thinking
- Modelo base del ajuste: https://huggingface.co/nassimjp/Qwen3-VL-4B-Thinking-Pashto-Zi
- Checkpoint original de ajuste: `nassimjp/Qwen3-VL-4B-Thinking-Pashto-Zi_1793282777`
- Qwen en HuggingFace: https://huggingface.co/Qwen
- Unsloth: https://github.com/unslothai/unsloth
- Hugging Face TRL: https://github.com/huggingface/trl
- PyTorch: https://pytorch.org/
