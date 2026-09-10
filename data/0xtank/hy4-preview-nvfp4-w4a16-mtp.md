# 0xTank/Hy4-preview-NVFP4-W4A16-MTP

## Resumen

Hy4-preview-NVFP4-W4A16-MTP es un modelo de lenguaje de gran tamaño publicado por el usuario 0xTank, optimizado para su despliegue en clústeres de NVIDIA DGX Spark (GB10). La documentación disponible se centra en una revisión del runtime de servicio (fechada en 2026-09-08) que añade decodificación especulativa nativa (MTP k=4), cuantización NVFP4 W4A16 y caché de atención MLA en NVFP4, con paralelismo de contexto (DCP4) y TP4 sobre RoCE. El modelo configura una ventana de contexto de 200.000 tokens, aunque la model card advierte explícitamente de que esta longitud no ha sido validada de extremo a extremo.

La relevancia del modelo reside en su combinación de cuantización agresiva (pesos en 4 bits y activaciones en 16 bits) con técnicas de decodificación especulativa para reducir el footprint de memoria y mejorar el throughput de decodificación en hardware NVIDIA GB10. Según las mediciones del autor, la decodificación mejoró aproximadamente un 52-57% frente a una revisión anterior de 64K. Sin embargo, el repositorio está incompleto (solo 17 de 130 shards presentes) y no se han publicado arquitectura, parámetros totales, licencia ni idiomas, por lo que su utilidad queda limitada a entornos de investigación muy concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la documentacion menciona un diseno con expertos, lo que sugiere Mixture-of-Experts) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (se indica que "todos los expertos se retienen", pero no se cuantifican) |
| Longitud de contexto | 200.000 tokens configurados; el runtime reporta 204.859 tokens utiles de cache |
| Tipos de cuantizacion | NVFP4 W4A16 (pesos en 4 bits, activaciones en 16 bits); cache MLA en NVFP4 |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card indica preservar la licencia upstream en `LICENSE`) |
| Formato de pesos | Safetensors (segun las etiquetas del repositorio) |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura del modelo ni sobre su proceso de entrenamiento en la información disponible. La model card se centra exclusivamente en la configuración de despliegue y en el runtime de vLLM. A partir de la terminología empleada se puede inferir que se trata de un modelo basado en transformadores, posiblemente con atención latente múltiple (MLA) y predicción de múltiples tokens (MTP k=4), pero no se confirman datos de capas, dimensiones, número de expertos ni conjunto de entrenamiento. Tampoco se mencionan pasos de RLHF, DPO ni alineación. Los únicos indicios de entrenamiento son las pruebas funcionales limitadas descritas por el autor.

## Capacidades

- Generación de texto: las pruebas con prompts de prosa natural produjeron explicaciones coherentes sobre accesibilidad y bibliotecas públicas.
- Razonamiento aritmético básico: en las pruebas de secuencias de enteros, el modelo devolvió números consecutivos completos, con el último truncado por el límite de salida.
- Recuperación de información en contexto largo: una prueba de 8.192 tokens recuperó correctamente un código situado al principio del prompt.
- Decodificación especulativa nativa: implementa MTP k=4, que acelera la generación frente a la revisión anterior.
- Modo de razonamiento desactivable: puede desactivarse mediante `chat_template_kwargs: {"reasoning_effort":"no_think"}` en la solicitud.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles.
- Visión o audio: no disponibles.

## Casos de uso

- Despliegue de inferencia en clústeres DGX Spark: con 4 nodos GB10, TP4/DCP4 y caché NVFP4 MLA, puede atender solicitudes de contexto largo (200K configurado) en un presupuesto de memoria ajustado (104,83 GiB por rank).
- Optimización de latencia de decodificación en servicios de chat: el uso de MTP nativo y full-decode CUDA graphs permite tasas de decodificación de 14-31 tok/s, con mejoras de ~52-57% frente a una revisión previa. Adecuado para despliegues que requieren respuestas rápidas.
- Investigación en configuraciones de vLLM personalizadas: la receta y los scripts incluidos documentan cómo aplicar NVFP4 MLA, MTP y reclamación de memoria en vLLM, lo que sirve como referencia para modificar el runtime en entornos de investigación.
- Recuperación de datos en documentos extensos: la prueba de 8K tokens, que recuperó un código al inicio, sugiere utilidad para responder preguntas sobre contratos o documentación técnica de hasta 8-10K tokens.
- Evaluación de políticas de caché KV: los benchmarks cold/warm con prefijos de 2.560 tokens permiten ajustar estrategias de caché para reducir el tiempo de primer token (TTFT de 14,65 s a 2,23 s en warm).
- Prototipado de cuantización NVFP4: el repositorio sirve como caso de estudio para cuantizar pesos a 4 bits y usar caché de atención en FP4, útil para investigadores que buscan reducir el footprint de memoria de modelos de contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La siguiente tabla recoge mediciones del autor sobre prompts de 3.000 tokens, temperatura 0, razonamiento desactivado y máximo 256 tokens generados. "Cold" implica que no hay prefijo coincidente en la caché; "warm" reutiliza 2.560 tokens de prefijo. El prefill efectivo en warm no es throughput de cómputo bruto.

| Prompt | Cache | Prefill (tok/s) | TTFT (s) | Decode (tok/s) |
|---|---|---|---|---|
| Prosa natural | Cold | 205,0 | 14,65 | 14,71 |
| Prosa natural | Warm | 1.361,2 efectivo | 2,23 | 14,51 |
| Secuencia de enteros | Cold | 231,9 | 12,95 | 31,10 |
| Secuencia de enteros | Warm | 1.502,2 efectivo | 2,02 | 31,14 |

En resultados previos con 64K y MTP k=4 para prosa, la decodificación fue de 9,66 tok/s en frío y 9,26 en caliente; la revisión actual mejora la decodificación en aproximadamente un 52% / 57% en estas muestras. El prefill no mejoró significativamente. Los resultados son dependientes del prompt y no constituyen una afirmación agregada.

## Requisitos de hardware

- VRAM estimada: 104,83 GiB por rank para los tensores del modelo, más 1,9 GB por rank para la caché NVFP4 MLA.
- GPU recomendada: 4x NVIDIA GB10 (DGX Spark), con TP4 y DCP4 sobre RoCE.
- No es compatible con GPUs de consumo: un solo rank requiere ~105 GiB, muy por encima de una RTX 4090 (24 GB).
- Despliegue: vLLM con imagen personalizada, no vLLM stock; requiere `MALLOC_ARENA_MAX=2`, overlays y checkpoint propietario. Se usan CUDA graphs de decodificación con tamaños 1 y 5.
- Latencia estimada: TTFT de 2,02 a 14,65 segundos; decodificación de 14,51 a 31,14 tok/s según el prompt y el estado de caché.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas. No se han publicado especificaciones públicas ni benchmarks estándar. La única comparación interna encontrada es con la revisión previa de 64K, donde la decodificación mejoró un 52-57%. No se aportan datos verificables de otros modelos en la información proporcionada.

## Limitaciones y advertencias

- El repositorio está incompleto: la model card indica que solo 17 de los 130 shards están presentes, por lo que una descarga completa no es posible actualmente.
- Longitud de contexto no validada: aunque se configuran 200.000 tokens, no se ha calificado un prompt de 200K de extremo a extremo. La prueba de 64K se detuvo antes de la generación por un umbral de memoria de 550 MiB; la prueba de 8K no valida 200K.
- Memoria ajustada: la configuración requiere una reserva de 500 MiB de MemAvailable y un margen de 768 MiB post-KV; añadir cargas de trabajo concurrentes sin un nuevo preflight puede provocar fallos.
- Los scripts e instrucciones no constituyen un instalador independiente; necesitan una imagen personalizada, vendor runtime, overlays y checkpoint. No se puede asumir que vLLM estándar cargue esta receta sin modificaciones.
- Sin evaluación de sesgos ni de alucinación: las pruebas son limitadas y no existen benchmarks de calidad generales publicados.
- Licencia no especificada: la model card indica conservar la licencia upstream en `LICENSE`, pero no se identifica. Antes de redistribuir o usar en producción, hay que revisar ese archivo.
- Los resultados de rendimiento dependen del prompt y no son representativos de una sesión multi-turno ni de uso real continuado.

## Enlaces

- HuggingFace: https://huggingface.co/0xTank/Hy4-preview-NVFP4-W4A16-MTP
- Archivos referenciados en la model card (dentro del repositorio): `recipe/WORKING-RECIPE.md`, `benchmarks/`, scripts de lanzamiento y parches.
- No se han encontrado enlaces externos adicionales en la búsqueda web.
