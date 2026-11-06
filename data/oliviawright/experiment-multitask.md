# oliviawright/experiment-multitask

## Resumen

`oliviawright/experiment-multitask` es un repositorio experimental publicado en Hugging Face por la usuaria oliviawright. No se trata de un modelo entrenado ni de un lanzamiento listo para producción, sino de una implementación propia de un "Tiny Transformer" orientada a experimentos multitarea, empaquetada junto con su configuración explícita y un checkpoint de inicialización. La model card lo describe literalmente como "a reproducible starting point, not a trained model release".

El repositorio contiene un fichero Python (`main.py`) con la implementación del modelo y un punto de entrada ejecutable, además de `config.json` con los ajustes de arquitectura, `training_args.json` con la receta de experimento por defecto y `model.safetensors`, que es un checkpoint de inicialización válido para pruebas de humo, no un modelo con pesos entrenados. El recuento real de parámetros en safetensors es de 49.600, es decir, un modelo de escala mínima pese a la etiqueta "giant" que aparece en la configuración.

Su relevancia es acotada: sirve como esqueleto reproducible para quien quiera montar sus propios experimentos multitarea con atención de ventana deslizante, fusión bilineal y una normalización propia (`scalenorm`), pero no ofrece ninguna capacidad de inferencia útil sin un entrenamiento previo por parte del usuario. No hay resultados de benchmarks ni métricas declaradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tiny Transformer (implementación propia) con atención de ventana deslizante |
| Parametros totales | 49.600 (según safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint de inicialización); implementación en Python/PyTorch |

Otros datos de la configuración declarada por el autor: escala etiquetada como "giant", fusión bilineal, activación GELU, normalización `scalenorm`, optimizador AdamW y schedule polinómico (valores por defecto del script, no evidencia de un entrenamiento completado).

## Arquitectura y entrenamiento

La arquitectura es un transformer de implementación propia ("Tiny Transformer") con atención de ventana deslizante, fusión bilineal entre ramas o modalidades, activación GELU y una normalización denominada `scalenorm`. El autor indica que el código se distribuye con una configuración generada y un checkpoint de inicialización, y advierte de que, al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito antes de poder usarse.

No consta ningún entrenamiento realizado: no se especifican tokens de entrenamiento, composición del dataset, ni fases de RLHF, DPO o SFT. La receta por defecto (`training_args.json`) usa AdamW con schedule polinómico y se presenta como punto de partida, no como evidencia de una ejecución completada. El autor recomienda, para una evaluación significativa, entrenar todos los baselines con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias, y reportar la métrica de tarea sobre al menos tres semillas junto con un baseline de capacidad comparable.

## Capacidades

- No se declara ninguna capacidad funcional: el checkpoint incluido es de inicialización y no ha sido entrenado.
- El código soporta un flujo de entrenamiento multitarea (configuración y script incluidos), pero sin pesos entrenados no genera texto, código ni razonamiento útiles.
- No hay soporte documentado de tool calling ni function calling.
- No hay soporte documentado de agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingües; el campo de idiomas no está disponible.
- No hay modo thinking, visión ni audio documentados.
- El autor menciona un ejemplo de prueba de humo ejecutable mediante `python main.py --help` e inspección del bloque `__main__`.

## Casos de uso

- Prototipado de investigacion en arquitecturas transformer: sirve como base reproducible para experimentar con atención de ventana deslizante y fusión bilineal en un entorno controlado y de pequeño tamaño (49.600 parámetros), sin coste de cómputo relevante.
- Pruebas de humo de pipelines de entrenamiento: el checkpoint de inicialización y `training_args.json` permiten validar que un pipeline de PyTorch carga el modelo, ejecuta un paso de forward y guarda pesos antes de escalar a modelos mayores.
- Benchmarking de recetas de entrenamiento: el autor propone usar el repositorio para comparar optimizadores, schedules y presupuestos de ajuste bajo las mismas condiciones (misma exposición de datos, mismas semillas), lo que encaja con estudios de ablación metodológica.
- Base para experimentos multitarea academicos: la etiqueta "multitask" y la fusión bilineal sugieren un diseño pensado para combinar señales de varias tareas; un investigador podría extenderlo para estudiar interacciones entre cabezas o dominios.
- Docencia y formacion: al ser un transformer mínimo con código legible y configuración explícita, resulta adecuado para explicar atención, normalización y bucles de entrenamiento en cursos o talleres.
- Integracion como componente de referencia en tests de CI: un modelo de este tamaño puede usarse como fixture en pruebas automatizadas que verifiquen la compatibilidad de utilidades de carga, serialización safetensors o adaptadores personalizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no se reclama ninguna puntuación de benchmark en el repositorio y que el checkpoint incluido no es un checkpoint entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier cuantización razonable; con 49.600 parámetros en FP32 el peso ronda los 0,2 MB, por lo que la VRAM vendrá dominada por el runtime de PyTorch y el contexto, no por el modelo.
- GPU recomendadas: cualquier GPU con soporte CUDA sirve; el modelo cabe holgadamente en GPUs de gama baja e incluso en CPU.
- Cabe en GPU de consumo: sí, en cualquier RTX o GTX con CUDA, y también en CPU sin problemas.
- Opciones de despliegue: no es cargable directamente por vLLM, llama.cpp, Ollama ni TGI sin un adaptador explícito, ya que es una implementación personalizada en PyTorch. El autor indica que las APIs genéricas de carga automática requieren adaptación previa.
- Latencia y throughput: no disponibles; al no haber pesos entrenados, no tiene sentido medir rendimiento de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oliviawright/experiment-multitask | 49.600 | no disponible | No (checkpoint de inicialización) | apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| Modelos "Tiny Transformer" de referencia (p. ej. nanoGPT) | Órdenes de magnitud mayores (millones) | no disponible | Según variante | MIT / otras | Repositorios públicos de código |
| Transformers pequeños preentrenados (p. ej. distilgpt2) | ~82 M | 1.024 tokens | Sí | MIT | Hugging Face |

La comparación directa no es posible en términos de rendimiento porque este repositorio no contiene un modelo entrenado. Frente a alternativas como nanoGPT o distilgpt2, la diferencia clave es que aquí no hay pesos útiles ni benchmarks, solo el esqueleto de implementación y la configuración.

## Limitaciones y advertencias

- El checkpoint incluido no ha sido entrenado ni auditado en robustez, equidad o transferencia de dominio; no debe usarse para inferencia real.
- No hay evidencia de ningún entrenamiento completado: la receta (AdamW, schedule polinómico) son valores por defecto del script.
- Sesgos conocidos: no disponibles, al no existir datos de entrenamiento documentados.
- Riesgo de alucinación: no evaluable sin un modelo entrenado.
- Limitaciones de contexto e idioma: no disponibles; el campo de idiomas está vacío.
- Licencia apache-2.0 permite uso comercial del código y los pesos de inicialización, pero el autor advierte de revisar por separado los términos de los datos fuente si se usa con datasets externos.
- Para producción: no apto. Es un punto de partida experimental que requiere entrenamiento, evaluación con al menos tres semillas y un baseline de capacidad comparable antes de cualquier uso serio.
- Cualquier resultado de un futuro checkpoint entrenado debe documentarse por separado de los valores por defecto aquí distribuidos.

## Enlaces

- Hugging Face: https://huggingface.co/oliviawright/experiment-multitask
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
