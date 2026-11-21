# araysuter/Inkling-2-Mini-MLX-5bit

## Resumen

Inkling-2-Mini-MLX-5bit es una conversión cuantizada a 5 bits en formato MLX del modelo multimodal Inkling-2-Mini, desarrollado originalmente por Thinking Machines Lab. El artefacto lo publica el usuario independiente araysuter y no constituye una release oficial del autor original. El modelo combina procesamiento de imagen y texto (pipeline image-text-to-text) con una arquitectura MoE que, según la model card upstream, ronda los 26.400 millones de parámetros lógicos.

La conversión parte de la release oficial entrenada en NVFP4/MXFP8, no de un checkpoint BF16 original, por lo que acumula error de reconstrucción adicional. Emplea cuantización afín de 5 bits con grupo de tamaño 32, mantiene embeddings y cabeza de salida en 8 bits y preserva en coma flotante el encoder de visión, el enrutado de expertos y las compuertas de control del bucle. El resultado ocupa 20,63 GB (19,21 GiB) e incluye visión.

Su relevancia es práctica: permite ejecutar un modelo multimodal MoE de ~26B en hardware Apple Silicon con memoria unificada, algo imposible con los pesos originales. A cambio, exige un port específico de MLX-LM fijado a un commit concreto y la variable `MLX_ENABLE_TF32=0`, y no se han validado contextos largos de 128K o 1M.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE con bucle iterativo (tag `inkling2_loop`); 24 capas almacenadas, 48 aplicaciones de capa por token, las 12 capas centrales se ejecutan tres veces |
| Parámetros totales | 26.388.559.360 (~26,4B lógicos según la model card upstream) |
| Parámetros activos | no disponible |
| Longitud de contexto | configuración upstream retenida; 128K y 1M no cualificados en esta conversión |
| Tipos de cuantización | afín de 5 bits, group size 32; embeddings y cabeza de salida en 8 bits; visión, enrutado de expertos y compuertas de bucle en coma flotante |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 20,63 GB / 19,21 GiB |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) y un mecanismo de bucle que reaplica capas intermedias: de las 24 capas almacenadas se realizan 48 aplicaciones por token, ejecutando tres veces las doce capas centrales. Incorpora un encoder de visión que se conserva en precisión flotante original en esta conversión, así como compuertas de enrutado y de control del bucle también sin cuantizar. El checkpoint de origen es la release entrenada por Thinking Machines en NVFP4/MXFP8 (revisión `6e7c8248f75265bdd4fbab5273304243b5d8c2cb`); no se dispone de detalles sobre volumen de tokens, composición del dataset ni si hubo RLHF o DPO.

La conversión aplica cuantización afín de 5 bits con búsqueda de clipping por grupo (factores 1, 0,995, 0,985, 0,97, 0,94, 0,9, 0,85, 0,8) seleccionando por MSE de reconstrucción. No es GPTQ ni AWQ calibrado con activaciones. La suma del MSE por grupo se redujo un 6,21 % frente a round-to-nearest min/max en las matrices incluidas en la búsqueda, una métrica de pesos y no de benchmark. El fichero auxiliar `mtp.safetensors` del modelo original no se incluye, por lo que no se reclama ninguna aceleración por decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Comprensión de imagen y texto combinados (image-text-to-text), con encoder de visión incluido en la conversión.
- Generación de código: en la validación se obtuvo una función Python correcta para comparar dos valores.
- Aritmética básica: la prueba de validación devolvió 391 como resultado.
- Capacidad de razonamiento por bucle iterativo, con tokens de razonamiento que cuentan en las longitudes y velocidades registradas.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede mantener diálogos multi-turno ejecutándose íntegramente en un Apple M5 Max con 64 GiB de memoria unificada, sin depender de servicios en la nube.
- Descripción y análisis de imágenes en local: el encoder de visión preservado permite tareas image-text-to-text como descripción de contenido, verificado en la validación con la identificación de formas y colores.
- Generación de código en entornos de desarrollo sobre macOS: útil para autocompletado y generación de funciones sencillas dentro de un flujo local, como muestra la validación con una función `max`.
- Prototipado e investigación en arquitecturas con bucle: al conservar las 48 aplicaciones de capa por token, sirve para estudiar el comportamiento de modelos con capas reaplicadas en hardware de consumo.
- Procesamiento de documentos con imagen y texto: combinación de OCR implícito y razonamiento sobre el contenido visual, aunque sin validación específica de contextos largos.
- Evaluación comparativa de cuantizaciones: los scripts `convert_inkling.py` y el manifiesto permiten reproducir y contrastar perfiles de cuantización sobre el mismo checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar en la información disponible. La model card incluye únicamente una sonda sintética de texto corto y tres prompts de comprobación:

| Sonda sintética de texto | Fuente nativa | Esta conversión |
|---|---:|---:|
| Log-verosimilitud negativa media | 2,26608 | 2,24968 |
| Perplejidad | 9,64151 | 9,48469 |

Delta NLL: -0,01640. El autor advierte explícitamente que se trata de un pasaje sintético corto más tres prompts de humo, no de un benchmark estándar ni de evidencia de precisión general.

## Requisitos de hardware

- VRAM/memoria estimada: 20,63 GB (19,21 GiB) de pesos, más metadatos de escala y sesgo; requiere margen adicional para KV cache y activaciones.
- Validado en Apple M5 Max con 64 GiB de memoria unificada.
- No cabe en GPUs de consumo con 16 GB; en GPUs discretas haría falta al menos 24 GB y, en la práctica, un port MLX funcional, que está orientado a Apple Silicon.
- Runtime obligatorio: port de MLX-LM fijado al commit `0c4c99192230f1943dd468d297f0b8a64ae7b7c2`; el MLX-LM estándar no soporta esta arquitectura.
- Variables y versiones: MLX 0.32.4, Python 3.14 y `MLX_ENABLE_TF32=0` (el path float32 reducido por defecto del M5 falla tres de los ocho tests del port).
- Opciones de despliegue: `mlx_lm generate` con el port fijado; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card indica que los tokens de razonamiento cuentan en las métricas registradas, pero no publica cifras de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-MLX-5bit | ~26,4B lógicos | upstream retenido; 128K/1M no cualificados | MLX safetensors 5 bits | Apache 2.0 | Hugging Face, conversión independiente |
| thinkingmachines/Inkling-2-Mini | ~26,4B lógicos | no disponible | NVFP4/MXFP8 original | Apache 2.0 | Hugging Face, release oficial |
| Otras alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes más allá de la sonda sintética incluida.

## Limitaciones y advertencias

- Conversión independiente no oficial: no cuenta con el respaldo de Thinking Machines Lab.
- Doble pérdida de precisión: parte de pesos NVFP4/MXFP8 y añade error de reconstrucción al pasar a 5 bits afines; no recupera los pesos de entrenamiento de mayor precisión.
- La cuantización no está calibrada con activaciones (no es GPTQ ni AWQ), lo que puede degradar tareas sensibles a la distribución de activaciones.
- Contextos de 128K y 1M no han sido cualificados en esta conversión; no deben asumirse operativos.
- Sin `mtp.safetensors`, no hay decodificación especulativa ni la aceleración asociada.
- Requiere un port no estándar de MLX-LM fijado a un commit concreto, lo que complica el mantenimiento y la reproducibilidad a largo plazo.
- En el M5, el path float32 reducido por defecto falla tres de los ocho tests del port; es obligatorio `MLX_ENABLE_TF32=0`.
- Idiomas soportados no documentados; riesgo de comportamiento irregular fuera de los idiomas del entrenamiento original.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero aplicables por tratarse de un modelo de lenguaje generativo.
- Uso comercial permitido por Apache 2.0, sujeto además a la Model Acceptable Use Policy de Thinking Machines.
- La validación se limita a tres prompts de humo y una sonda sintética; no hay evidencia de precisión en benchmarks generales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/araysuter/Inkling-2-Mini-MLX-5bit
- Modelo base oficial: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Revisión del checkpoint de origen: https://huggingface.co/thinkingmachines/Inkling-2-Mini/tree/6e7c8248f75265bdd4fbab5273304243b5d8c2cb
- Repositorio MLX-LM: https://github.com/ml-explore/mlx-lm
- Documentación de precisión de MLX: https://ml-explore.github.io/mlx/build/html/usage/precision.html
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Política de uso aceptable del modelo: https://thinkingmachines.ai/model-acceptable-use-policy/
- Ficheros de validación y manifiesto: VALIDATION.json y QUANTIZATION_MANIFEST.json en el repositorio del modelo
