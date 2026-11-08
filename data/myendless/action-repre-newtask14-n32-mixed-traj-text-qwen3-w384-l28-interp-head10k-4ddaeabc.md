# myendless/action-repre-newtask14-n32-mixed-traj-text-qwen3-w384-l28-interp-head10k-4ddaeabc

## Resumen

Este repositorio contiene un checkpoint de investigación para robótica publicado por el usuario `myendless` en Hugging Face. No es un modelo de lenguaje conversacional, sino un *action expert* (cabezal de ejecución de acciones) entrenado sobre la cadena de representaciones de un VLM Qwen3-VL-4B-Instruct congelado. El objetivo es generar trayectorias de acción para 14 tareas nuevas del benchmark RoboTwin bajo la configuración N32, es decir, control robótico a partir de instrucciones en lenguaje natural e imagen.

La arquitectura deriva del *action expert* histórico de Qwen3-0.6B (28 capas), pero con un escalado proporcional de anchura: hidden de 1024 a 384, FFN de 3072 a 1152 y `head_dim` de 128 a 48, manteniendo 16 cabezas de atención Q y 8 KV. La inicialización se realiza mediante interpolación lineal de parámetros respetando los límites de emparejamiento RoPE y de las cabezas de atención, y las capas específicas de acción se inicializan con el constructor original.

Es relevante como artefacto de ablación reproducible: incluye trazas de entrenamiento (10 000 pasos, batch global 128, 4 928 episodios), normalización, manifiesto de datos y snapshot del código de entrenamiento. El autor advierte explícitamente de que no hay resultados de tasa de éxito en bucle cerrado para estos pesos, por lo que debe tratarse como material de investigación, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con action expert de 28 capas sobre VLM Qwen3-VL-4B-Instruct congelado; anchura interpolada (hidden 384, FFN 1152, head_dim 48) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye `model.pt` en precisión nativa) |
| Idiomas soportados | zh, en |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (state_dict nativo completo de PyTorch, no compatible con `AutoModel` de Transformers) |

## Arquitectura y entrenamiento

El modelo combina un VLM Qwen3-VL-4B-Instruct congelado, que aporta la cadena de representaciones visuales y textuales, con un cabezal de acción entrenable de 28 capas. Respecto al action expert original de Qwen3-0.6B, se reduce la anchura de forma proporcional (hidden 1024→384, FFN 3072→1152, head_dim 128→48) manteniendo 16 cabezas Q y 8 KV. La inicialización emplea interpolación lineal de parámetros que preserva las fronteras de emparejamiento RoPE y de las cabezas de atención; las capas de adaptación específicas de acción se inicializan con el constructor original (`fresh_constructor` en la configuración).

El entrenamiento se realizó sobre 14 tareas nuevas de RoboTwin en configuración N32, con 32 episodios limpios y 320 aleatorizados por tarea, sumando 4 928 episodios, batch global 128 y semilla 42, durante 10 000 pasos. La pérdida final de entrenamiento reportada es 0,014841035008430481. El autor indica que se usó atención eager para la self-attention de acciones, SDPA en modo math para cross-attention (por compatibilidad numérica en Hygon con `head_dim` 48) y `flash_attention_2` para el VLM. Se incluyen configuración, processor, manifiesto de datos, normalización y protocolo de congelación, pero no imágenes, vídeos, estados del optimizador ni pesos intermedios.

## Capacidades

- Generación de trayectorias de acción robótica a partir de observaciones visuales e instrucciones en lenguaje natural, en el marco del benchmark RoboTwin.
- Control multi-tarea: cubre 14 tareas nuevas bajo la configuración N32 (joint14/H32).
- Procesamiento multimodal heredado del VLM base (visión y texto), aunque el VLM permanece congelado y solo se entrena el cabezal de acción.
- Soporte bilingüe chino-inglés en las instrucciones, según los metadatos del repositorio.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni modos de razonamiento explícito; estas capacidades no son aplicables al propósito del checkpoint.

## Casos de uso

- Investigación en representaciones de acción: sirve como punto de comparación frente a la variante de 36 capas *layerwise* del mismo autor, permitiendo aislar el efecto del escalado de anchura frente al cambio de profundidad.
- Reproducción de experimentos de RoboTwin: el snapshot de código y los metadatos de normalización permiten reejecutar el pipeline de evaluación con las mismas condiciones de datos.
- Estudio de inicialización por interpolación: útil para analizar cómo afecta la interpolación lineal con preservación de RoPE al rendimiento de cabezales de acción reducidos.
- Ablaciones de anchura en action experts: la reducción de hidden 1024→384 y FFN 3072→1152 ofrece un punto de medida para estudiar el compromiso entre coste y capacidad en políticas robóticas.
- Base para *fine-tuning* posterior en dominios robóticos específicos, siempre que se respete la normalización adjunta y no se reajuste.
- Docencia y divulgación sobre integración VLM + cabezal de acción, dado que el repositorio incluye configuración, processor y protocolo completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no hay resultados de tasa de éxito en bucle cerrado para estos pesos; solo se reporta la pérdida final de entrenamiento (0,014841035008430481) sobre 10 000 pasos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio ocupa 9,9 GB e incluye el state_dict completo con VLM y módulos de acción, por lo que la inferencia requiere cargar el VLM base de 4B parámetros más el cabezal.
- GPU recomendadas: no disponible en la documentación. El autor menciona compatibilidad numérica con hardware Hygon para `head_dim` 48, lo que sugiere que el entrenamiento se realizó en aceleradores de esa familia.
- Viabilidad en GPU de consumo: no confirmada. Un VLM de 4B en FP16 requiere aproximadamente 8 GB solo para pesos, más el cabezal y activaciones; cabría en GPUs de 16-24 GB con cuantización, pero no se documenta soporte de cuantización.
- Opciones de despliegue: no es compatible con `AutoModel` de Transformers ni con vLLM, llama.cpp, Ollama o TGI de forma directa. Requiere cargar el state_dict con el código nativo incluido en `provenance/training-code-snapshot.tar.gz`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (28 capas, anchura 384) | no disponible | no disponible | Action expert interpolado sobre Qwen3-VL-4B | no disponible | Hugging Face, 0 descargas |
| `myendless/action-repre-newtask14-n32-rawvlm-layerwise384-l36-head10k` | no disponible | no disponible | Action expert de 36 capas *layerwise*, cambio arquitectónico | no disponible | Hugging Face |
| `myendless/action-repre-newtask14-n32-base-layerwise384-l36-head10k` | no disponible | no disponible | Action expert de 36 capas *layerwise* sobre base | no disponible | Hugging Face |

Los dos modelos comparables son variantes del mismo autor y mismo dataset, diferenciadas por profundidad (36 capas frente a 28) y por el tipo de cambio arquitectónico. No se dispone de datos de rendimiento comparativo entre ellas en la información proporcionada.

## Limitaciones y advertencias

- Ausencia de validación en bucle cerrado: el autor declara que no hay resultados de tasa de éxito para estos pesos, por lo que no puede afirmarse su eficacia real en ejecución robótica.
- Licencia no especificada: no se indica licencia, lo que impide determinar si el uso comercial está permitido. Debe contactarse con el autor antes de cualquier uso productivo.
- Formato no estándar: `model.pt` es un state_dict nativo de PyTorch no reserializado, incompatible con el ecosistema Transformers estándar; requiere el código de entrenamiento adjunto.
- Dependencia de normalización: la normalización debe usarse tal cual se adjunta; reajustarla invalida los resultados.
- Rutas absolutas: los metadatos contienen rutas absolutas de máquina que deben remapearse localmente.
- Idiomas limitados a chino e inglés; no se documenta soporte de otros idiomas.
- Sesgos y alucinación: no documentados por el autor; al tratarse de un cabezal de acción sobre un VLM congelado, los sesgos del VLM base pueden propagarse a las representaciones.
- Contexto: no se especifica la longitud de contexto efectiva del sistema completo.
- Artefacto de investigación: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/myendless/action-repre-newtask14-n32-mixed-traj-text-qwen3-w384-l28-interp-head10k-4ddaeabc
- Variante *layerwise* 36 capas sobre raw VLM: https://huggingface.co/myendless/action-repre-newtask14-n32-rawvlm-layerwise384-l36-head10k-99cde744
- Variante *layerwise* 36 capas sobre base: https://huggingface.co/myendless/action-repre-newtask14-n32-base-layerwise384-l36-head10k-763c91f4
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
