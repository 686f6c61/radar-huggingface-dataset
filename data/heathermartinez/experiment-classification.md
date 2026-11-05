# heathermartinez/experiment-classification

## Resumen

`heathermartinez/experiment-classification` es un repositorio de HuggingFace que contiene una implementación propia y de escala reducida de una arquitectura DINO orientada a tareas de clasificación. No se trata de un modelo entrenado ni de una release con pesos afinados, sino de un punto de partida reproducible: incluye el código del modelo (`run.py`), un `config.json` con los ajustes de arquitectura generados, un `training_args.json` con la receta de experimento por defecto y un `model.safetensors` que es únicamente un checkpoint de inicialización válido para pruebas de humo.

El autor lo etiqueta explícitamente como variante "nano" y advierte en la model card que no reclama ninguna puntuación de benchmark. El checkpoint no ha sido entrenado ni auditado en robustez, equidad o transferencia de dominio. Por tanto, su relevancia actual es la de un artefacto de investigación reproducible para experimentar con clasificación basada en DINO, no la de un modelo listo para producción.

El recuento real de parámetros en safetensors es de 33.088, lo que confirma que se trata de un modelo extremadamente pequeño, coherente con la escala "nano" declarada. La licencia es BSD-3-Clause, permisiva para uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINO (implementación propia), atención dilatada, fusión bilineal |
| Parametros totales | 33.088 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (checkpoint de inicialización); código en `run.py` |

Otros datos de configuración declarados en la model card: escala "nano", activación Mish, normalización BatchNorm, optimizador Adam y scheduler polinómico como receta por defecto.

## Arquitectura y entrenamiento

La arquitectura es una implementación personalizada de DINO con atención dilatada y fusión bilineal, activación Mish y normalización por BatchNorm. El repositorio no especifica el número de capas, dimensión de embeddings, número de cabezas ni resolución de entrada; estos datos no están disponibles en la información proporcionada. Al ser una implementación propia, las APIs genéricas de carga automática (por ejemplo `AutoModel`) requieren un adaptador explícito antes de poder usarse.

No hay evidencia de entrenamiento real. El `model.safetensors` incluido es un checkpoint de inicialización para pruebas de humo, no un modelo entrenado. La receta por defecto (Adam con scheduler polinómico) son valores de arranque del script, no el resultado de una ejecución completada. No se documenta número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO o ajuste supervisado. El autor recomienda, para una evaluación significativa, entrenar todos los baselines con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias.

## Capacidades

- Clasificación de imágenes (tarea declarada en los tags del repositorio), sujeta a entrenamiento previo del checkpoint, que actualmente no ha sido entrenado.
- Punto de partida reproducible para experimentación con arquitecturas DINO a escala nano.
- Ejecución de un ejemplo de prueba de humo mediante `python run.py --help` y el bloque `__main__` del script.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes, multilingüismo, thinking mode, audio ni visión más allá de la clasificación.
- No hay soporte declarado de function calling ni de razonamiento multi-paso.

## Casos de uso

- Pruebas de humo de pipelines de clasificación: el checkpoint de inicialización permite verificar que el código de carga, preprocesado y forward pass funciona antes de invertir en entrenamiento real.
- Investigación reproducible sobre arquitecturas DINO: sirve como base para comparar variantes de atención dilatada y fusión bilineal bajo una receta controlada.
- Docencia y formación: el tamaño de 33.088 parámetros y la inclusión de `config.json` y `training_args.json` lo hacen adecuado para explicar el ciclo completo de definición, inicialización y evaluación de un modelo de clasificación.
- Desarrollo de baselines de capacidad ajustada: útil como referencia de baja capacidad contra la que medir modelos mayores con la misma exposición de datos y semillas.
- Prototipado de adaptadores de carga: dado que requiere un adaptador explícito para APIs genéricas, sirve para desarrollar y probar dichos adaptadores en un caso pequeño y controlado.
- Integración en scripts de CI para validar entornos: al ser un artefacto mínimo, permite comprobar versiones de PyTorch, safetensors y dependencias sin coste de cómputo relevante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 33.088 parámetros, el peso en FP32 ocupa aproximadamente 132 KB y en FP16 unos 66 KB, por lo que el cuello de botella es el runtime (PyTorch, CUDA) y no el modelo.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100. Funciona en CPU sin problema.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, GTX 1650, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: al ser una implementación propia, no es compatible directamente con vLLM, TGI, llama.cpp ni Ollama; requiere ejecución mediante el `run.py` incluido o un adaptador propio sobre PyTorch.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| heathermartinez/experiment-classification | 33.088 | no disponible | No (solo inicialización) | BSD-3-Clause | HuggingFace, 0 descargas |
| DINO original (Facebook Research) | no disponible en esta ficha | no disponible | Sí | licencia del proyecto original | Repositorio oficial de investigación |
| DINOv2 (Meta) | no disponible en esta ficha | no disponible | Sí | licencia del proyecto original | Pesos públicos en repositorios oficiales |

No se dispone de datos verificados de parámetros, contexto ni rendimiento de los modelos comparables en la información proporcionada; la comparación se limita a la naturaleza del artefacto (implementación de inicialización frente a modelos entrenados y publicados).

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: no produce predicciones útiles de clasificación sin un proceso de ajuste previo.
- No ha sido auditado en robustez, equidad ni transferencia de dominio; no debe usarse en producción sin evaluación propia.
- No se reclaman métricas de benchmark; cualquier cifra de rendimiento deberá generarse y documentarse por separado.
- Es una implementación personalizada: las APIs automáticas de carga de HuggingFace no funcionan sin un adaptador explícito.
- No se documentan sesgos conocidos, pero al no haber datos de entrenamiento ni evaluación, el riesgo de comportamiento impredecible es alto.
- No hay información sobre idiomas soportados, contexto ni cuantizaciones; no debe asumirse ninguno de estos soportes.
- Licencia BSD-3-Clause: permisiva para uso comercial con atribución, pero el autor advierte de revisar por separado los términos de los datos de origen si se usa con datasets externos.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en la misma fecha; no hay evidencia de mantenimiento ni de comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/heathermartinez/experiment-classification
