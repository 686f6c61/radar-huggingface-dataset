# huggingface-mic/internvl-mic

## Resumen

`internvl-mic` es un artefacto de prueba publicado por la organización `huggingface-mic` en Hugging Face. No es un modelo entrenado ni utilizable para inferencia real: se trata de un *fixture* de 9.973.120 parámetros (aproximadamente 10 millones) construido para validar la integración del modelo `OpenGVLab/InternVL3-1B-hf` en la librería Transformers. La model card lo etiqueta explícitamente como `test-artifact` y advierte que "no es un modelo usable".

El fixture replica la arquitectura `InternVLForConditionalGeneration` del modelo base, pero con una configuración reducida: 2 capas ocultas en la torre de visión y 2 capas ocultas en el modelo de texto. Los pesos son aleatorios (semilla 17) y los ficheros del procesador (tokenizer, plantilla de chat, configuración de generación) se copiaron byte a byte desde `OpenGVLab/InternVL3-1B-hf`. Su propósito es servir como banco de pruebas reproducible para validar contratos de integración en Transformers sobre una GPU NVIDIA A10G.

La relevancia de este repositorio es puramente de ingeniería: permite a los mantenedores de Transformers verificar que la carga, el forward, la pérdida y los gradientes funcionan correctamente para la familia InternVL sin necesidad de descargar ni ejecutar el checkpoint completo de 1B parámetros. Para desarrolladores e investigadores que buscan un modelo de visión-lenguaje real, este repositorio no es adecuado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | InternVLForConditionalGeneration (transformer multimodal visión-lenguaje, configuración reducida) |
| Parametros totales | 9.973.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture reproduce la clase `InternVLForConditionalGeneration`, la arquitectura multimodal de la familia InternVL que combina una torre de visión con un modelo de lenguaje para generar texto condicionado por imágenes. La configuración se ha reducido mediante la regla genérica de `sweep.py`: `vision num_hidden_layers = 2` y `text num_hidden_layers = 2`. Los nombres de tensores coinciden con los del checkpoint real `OpenGVLab/InternVL3-1B-hf`, de modo que el fixture ejercita exactamente las mismas rutas de código que el modelo completo.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron contra una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato desplazó los logits al menos 0,001 (el caso más débil, `pixel_values:roll_batch`, produjo 0,00781). Los pesos se guardaron en bfloat16, el dtype con el que carga por defecto el modelo base, y se verificó que el forward, la pérdida y los gradientes son finitos en float32, bfloat16 y float16. Los ficheros del procesador (`tokenizer.json`, `chat_template.jinja`, `preprocessor_config.json`, etc.) se copiaron sin modificar desde el modelo base.

## Capacidades

- No es un modelo funcional: no genera texto, no razona, no responde a prompts ni procesa imágenes de forma significativa.
- Sirve como fixture de integración para validar la carga de `InternVLForConditionalGeneration` en Transformers.
- Permite verificar el forward pass, el cálculo de pérdida y la retropropagación de gradientes en float32, bfloat16 y float16.
- Ejercita las rutas de código del procesador multimodal (tokenizer, plantilla de chat, preprocesado de imagen) copiadas del modelo base.
- Soporta variantes de ejecución "default", "eager" y "bfloat16" sobre NVIDIA A10G.
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües reales.

## Casos de uso

- Validación de integración en Transformers: ejecutar el fixture en CI para comprobar que los cambios en la librería no rompen la carga ni el forward de la familia InternVL, sin descargar el checkpoint de 1B.
- Desarrollo de tests de regresión: usar los hashes y resultados de la puerta de sensibilidad registrados en `build.json` para detectar regresiones numéricas en el pipeline multimodal.
- Pruebas de compatibilidad de dtype: verificar que el modelo se mantiene finito en float32, bfloat16 y float16 antes de probar con pesos reales.
- Validación de procesadores: comprobar que los ficheros de tokenizer y preprocesado copiados del modelo base se cargan correctamente con la versión actual de Transformers.
- Reproducción de evidencias: regenerar el fixture con `python example/build_fixtures.py --fixture mic-internvl-slim` y comparar con los resultados publicados en la acción de GitHub enlazada.
- Formación de mantenedores: servir como ejemplo documentado de cómo construir fixtures multimodales reducidos que preserven nombres de tensores y contratos de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de calidad (MMLU, HumanEval, GSM8K u otras), y al tratarse de pesos aleatorios cualquier evaluación de rendimiento carecería de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (9,97 M de parámetros, aproximadamente 20 MB de pesos más overhead de activaciones).
- GPU validadas: NVIDIA A10G (según la model card, con variantes default, eager y bfloat16).
- Cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para pruebas básicas.
- Opciones de despliegue: Transformers (validado); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture de 2+2 capas, la latencia sería del orden de milisegundos, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/internvl-mic` | 9,97 M | no disponible | Fixture de test | no disponible | Hugging Face |
| `OpenGVLab/InternVL3-1B-hf` | ~1 B (modelo base real) | no disponible en esta ficha | Visión-lenguaje real | no disponible en esta ficha | Hugging Face |
| Otros fixtures de `huggingface-mic` | variable (reducidos) | no disponible | Validación de integración | no disponible | Hugging Face |

La comparación relevante es con el modelo base del que deriva: `OpenGVLab/InternVL3-1B-hf` es el checkpoint real de visión-lenguaje, mientras que `internvl-mic` es una versión reducida y con pesos aleatorios del mismo, destinada exclusivamente a pruebas de integración. No se dispone de datos de benchmarks ni de licencia del modelo base en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y las salidas no tienen significado semántico.
- Etiquetado como `test-artifact` para excluirlo de búsquedas de modelos candidatos; no debe desplegarse en producción.
- La model card indica explícitamente que "es un artefacto de prueba, no un modelo usable".
- Solo cubre checkpoints cuyos ficheros de procesador sean byte-idénticos y cuya configuración coincida tras el shrink; no cubre el checkpoint completo.
- La cobertura del checkpoint completo se declara como "separada" y no está incluida en este repositorio.
- Licencia no disponible: no puede asumirse permiso de uso comercial.
- Idiomas no disponibles: no hay información sobre capacidades multilingües reales.
- Riesgo de confusión: el nombre y la estructura pueden llevar a error si se interpreta como un modelo de visión-lenguaje funcional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/internvl-mic
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3-1B-hf
- Manifiesto de contrato: `integration.json` (en el repositorio)
- Uso con Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Procedencia del fixture: `build.json` (en el repositorio)
- Documentación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/internvl-mic.html
- Evidencia de regeneración (GitHub Actions): https://github.com/huggingface/transformers-mic/actions/runs/38252430459
- Script de construcción: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Script de reducción: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
