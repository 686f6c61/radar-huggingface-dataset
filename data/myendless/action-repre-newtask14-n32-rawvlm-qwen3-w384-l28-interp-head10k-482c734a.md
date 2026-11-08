# myendless/action-repre-newtask14-n32-rawvlm-qwen3-w384-l28-interp-head10k-482c734a

## Resumen

El modelo `action-repre-newtask14-n32-rawvlm-qwen3-w384-l28-interp-head10k-482c734a`, publicado por el usuario `myendless`, es un checkpoint experimental de robótica construido sobre `Qwen/Qwen3-VL-4B-Instruct`. No es un modelo de lenguaje al uso: combina una cadena de representación visual-lingüística congelada (el VLM base) con una cabeza de acción ("action head") entrenada para ejecutar tareas de manipulación en el benchmark RoboTwin. El repositorio contiene un `state_dict` nativo de PyTorch (`model.pt`) con ambos componentes, no un repositorio compatible con `AutoModel` de Transformers.

El interés técnico está en el diseño de la cabeza de acción: se parte de la estructura de un experto de acción basado en Qwen3-0.6B (28 capas) y se reduce su anchura de forma proporcional (hidden 1024→384, FFN 3072→1152, head_dim 128→48), manteniendo 16 cabezas de atención y 8 cabezas KV. La inicialización usa interpolación lineal de parámetros preservando los límites de las cabezas de atención y de los pares RoPE. El entrenamiento cubre 14 tareas nuevas del benchmark con 4.928 episodios y 10.000 pasos, con un *loss* final de 0,01788.

Es relevante como pieza de investigación reproducible sobre representaciones de acción en modelos visión-lenguaje-acción (VLA), y como contraste frente a la variante anterior basada en un DiT por capas de 36 capas. No obstante, el propio autor advierte de que no hay resultados de tasa de éxito en bucle cerrado para estos pesos, por lo que su utilidad práctica en producción aún no está validada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM Qwen3-VL-4B-Instruct (congelado) + cabeza de acción transformer de 28 capas con anchura reducida (hidden 384, FFN 1152, head_dim 48, 16 Q heads / 8 KV heads) |
| Parametros totales | no disponible (repo de 9,9 GB; incluye VLM de 4B y módulos de acción) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en `model.pt` en precisión nativa) |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (state_dict nativo completo de PyTorch, sin reserializar; no es un repo Transformers) |

## Arquitectura y entrenamiento

La arquitectura es un sistema VLA de dos bloques. El primero es el VLM `Qwen3-VL-4B-Instruct`, cuya cadena de representación se mantiene congelada durante el entrenamiento. El segundo es una cabeza de acción que reproduce la estructura de un experto de acción Qwen3-0.6B de 28 capas, pero con anchura escalada: dimensión oculta de 1024 a 384, FFN de 3072 a 1152 y `head_dim` de 128 a 48, conservando 16 cabezas de consulta y 8 de clave-valor. La inicialización emplea interpolación lineal de parámetros que respeta los límites de las cabezas de atención y de los pares RoPE; las capas de adaptación específicas de acción se inicializan con el constructor original (`fresh_constructor` en la configuración).

El entrenamiento se realizó sobre 14 tareas nuevas de RoboTwin en configuración N32, con 32 episodios limpios y 320 aleatorizados por tarea (4.928 episodios en total), batch global de 128, semilla 42 y cabezas `joint14`/`H32`. Se ejecutaron 10.000 pasos con un *loss* final de 0,01788485422730446. La atención propia de la acción usa `eager` y la atención cruzada usa SDPA en modo `math` por compatibilidad numérica con `head_dim` 48 en hardware Hygon; el VLM usa `flash_attention_2`. El checkpoint incluye configuración, processor, manifiesto de datos, normalización, métricas de entrenamiento y protocolo de congelación, pero no imágenes, vídeos, optimizador ni pesos intermedios.

## Capacidades

- Ejecución de políticas de acción para manipulación robótica en las 14 tareas nuevas de RoboTwin (configuración N32).
- Percepción visual-lingüística heredada del VLM base Qwen3-VL-4B-Instruct (comprensión de imagen y texto en zh/en).
- Generación de acciones conjuntas (`joint14`) a partir de observaciones visuales y contexto de tarea.
- Condicionamiento por instrucciones en lenguaje natural, limitado a chino e inglés.
- No se documenta soporte de *tool calling*, *function calling* ni razonamiento multi-paso en agente.
- No se documenta modo *thinking*, audio ni otras modalidades adicionales.

## Casos de uso

- Investigación en representaciones de acción para VLA: sirve como punto de comparación controlado frente a la variante de 36 capas con DiT por capas, permitiendo aislar el efecto de la anchura y la profundidad de la cabeza de acción.
- Reproducción de experimentos de RoboTwin: el repo incluye el snapshot del código de entrenamiento y el protocolo, lo que permite reejecutar el *benchmark* con las mismas condiciones (semilla 42, batch 128, N32).
- Estudio de inicialización por interpolación: útil para analizar cómo afecta la interpolación lineal con preservación de límites de cabeza y pares RoPE al arranque del entrenamiento en cabezas de acción reducidas.
- Evaluación de compatibilidad numérica en hardware alternativo: el uso de SDPA `math` para `head_dim` 48 en Hygon es un caso práctico para validar portabilidad de kernels de atención.
- Base para *fine-tuning* en dominios robóticos propios: al estar la cadena VLM congelada, se puede reentrenar solo la cabeza de acción sobre un nuevo conjunto de tareas manteniendo el resto fijo.
- Docencia y divulgación sobre VLA: el *checkpoint* y sus metadatos permiten ilustrar el flujo completo de datos, normalización y congelación en un pipeline de robótica aprendida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no hay resultados de tasa de éxito en bucle cerrado para estos pesos; solo se reporta el *loss* de entrenamiento final (0,01788485422730446).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repo ocupa 9,9 GB, lo que da una cota inferior del espacio en disco. El VLM base de 4B más la cabeza de acción sugieren un consumo en torno a decenas de GB en precisión nativa, pero no se documenta.
- GPU recomendadas: no disponible. El autor menciona compatibilidad numérica con hardware Hygon para `head_dim` 48.
- ¿Cabe en GPU de consumo? No confirmado; sin datos de cuantización ni de huella en VRAM no puede afirmarse.
- Opciones de despliegue: no es compatible con `vLLM`, `llama.cpp`, `Ollama` ni `TGI` de forma directa, ya que se distribuye como `state_dict` nativo de PyTorch y requiere el código del snapshot de entrenamiento (`provenance/training-code-snapshot.tar.gz`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cabeza de acción | Licencia | Formato |
|---|---|---|---|---|---|
| `action-repre-newtask14-n32-rawvlm-qwen3-w384-l28-interp-head10k-482c734a` (este) | VLM 4B + cabeza 28 capas, ancho 384 | no disponible | Transformer 28 capas, interpolación de anchura | no disponible | `model.pt` |
| `action-repre-newtask14-n32-rawvlm-layerwise384-l36-head10k-99cde744` | VLM 4B + cabeza 36 capas, ancho 384 | no disponible | DiT por capas, 36 capas | Apache-2.0 | `model.pt` |
| `action-repre-newtask14-n32-base-layerwise384-l36-head10k-763c91f4` | VLM 4B + cabeza 36 capas, ancho 384 | no disponible | DiT por capas, 36 capas (variante base) | Apache-2.0 | `model.pt` |

Las dos alternativas proceden del mismo autor y comparten el VLM base; la diferencia principal es la profundidad (28 frente a 36 capas) y el tipo de cabeza (interpolación de anchura frente a DiT por capas). No se dispone de datos de rendimiento comparado.

## Limitaciones y advertencias

- No hay resultados de tasa de éxito en bucle cerrado: el propio autor lo declara, por lo que no puede recomendarse para producción sin evaluación previa.
- Licencia no disponible: no está claro si se permite uso comercial; conviene contactar con el autor antes de cualquier despliegue.
- Formato no estándar: al ser un `state_dict` nativo, requiere el código del snapshot y el mapeo de rutas absolutas a rutas locales; no funciona con `AutoModel`.
- Normalización obligatoria con los ficheros adjuntos: no debe reajustarse, ya que alteraría la correspondencia con el entrenamiento.
- Idiomas limitados a chino e inglés; no se documenta soporte multilingüe adicional.
- Sesgos y alucinaciones: no documentados, pero al tratarse de un modelo multimodal hereda los sesgos del VLM base y puede generar acciones inconsistentes fuera de la distribución de las 14 tareas de entrenamiento.
- Sin datos de contexto máximo ni de cuantización, lo que dificulta planificar el despliegue.
- El *checkpoint* no incluye imágenes, vídeos, optimizador ni pesos intermedios, lo que limita la reproducibilidad completa del entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/myendless/action-repre-newtask14-n32-rawvlm-qwen3-w384-l28-interp-head10k-482c734a
- Variante DiT por capas 36: https://huggingface.co/myendless/action-repre-newtask14-n32-rawvlm-layerwise384-l36-head10k-99cde744
- Variante base DiT por capas 36: https://huggingface.co/myendless/action-repre-newtask14-n32-base-layerwise384-l36-head10k-763c91f4
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
