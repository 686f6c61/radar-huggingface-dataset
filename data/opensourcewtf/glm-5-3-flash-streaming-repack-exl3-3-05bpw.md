# OpensourceWTF/GLM-5.3-Flash-streaming-repack-exl3-3.05bpw

## Resumen

GLM-5.3-Flash-streaming-repack-exl3-3.05bpw es un empaquetado de cuantización (repack) del modelo GLM-5.3-Flash desarrollado originalmente por Z.ai (organización zai-org). Lo publica el usuario OpensourceWTF y combina expertos enrutados cuantizados a 3.05 bpw en formato EXL3 —obra de turboderp— con un tronco en FP8 y BF16 derivado de otra release (vcruz305/GLM-5.3-Flash-NVFP4), y expertos MTP en NVFP4. El paquete contiene 9.669.466.974 parámetros según los safetensors del repositorio, con un tamaño total de 130,8 GB.

La relevancia de esta ficha es sobre todo documental: el propio autor marca el repositorio como **deprecated** y remite a una versión posterior (OpensourceWTF/GLM-5.3-Flash-streaming-repack-exl3) con cuatro ramas calibradas por turboderp (sc_2.10bpw, sc_2.60bpw, sc_3.10bpw y sc_4.10bpw). Además, el autor advierte de que los números de calidad (divergencia KL) publicados por turboderp **no aplican** a este pack, porque su tronco no procede de la misma release. Está pensado para el plugin mlx-stream de mlx-serve, que ya no lo sirve, y el plugin turboexl3_glm53f tampoco lo soporta.

Por tanto, se trata de un artefacto histórico de cuantización orientado a Apple Silicon (librería mlx-serve), no de un modelo base entrenado desde cero. Para uso en producción conviene acudir al repositorio sucesor o al modelo original de Z.ai.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base GLM-5.3-Flash; el pack usa expertos enrutados EXL3, tronco FP8/BF16 y expertos MTP NVFP4) |
| Parametros totales | 9.669.466.974 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 3.05 bpw (expertos enrutados), FP8 y BF16 (tronco), NVFP4 (expertos MTP) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (empaquetado streaming para mlx-serve / mlx-stream) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base GLM-5.3-Flash en la documentación proporcionada (número de capas, dimensión oculta, mecanismo de atención, composición del dataset de entrenamiento o si hubo RLHF/DPO). El tag `glm5_next` sugiere una generación GLM de Z.ai, pero no se detallan sus características técnicas.

Lo que sí está documentado es el proceso de cuantización de este pack concreto: los expertos enrutados son los bytes EXL3 a 3.05 bpw generados por turboderp con exllamav3 (repositorio turboderp/GLM-5.3-Flash-exl3); el tronco (las partes que la release de turboderp no cuantizó) se tomó de vcruz305/GLM-5.3-Flash-NVFP4 y se convirtió a FP8 y BF16; y los expertos MTP están en NVFP4. El autor subraya que, al no coincidir la procedencia del tronco con la de turboderp, las métricas de divergencia KL de este último no son aplicables a este empaquetado. No se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- No se detallan capacidades específicas en la información disponible. Al ser un repack del modelo base GLM-5.3-Flash, heredaría las capacidades de este, pero no se documentan en la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas aparece vacío).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- El pack está diseñado para servirse mediante mlx-serve con el plugin mlx-stream; el plugin turboexl3_glm53f **no** lo sirve.

## Casos de uso

- Archivado y trazabilidad de cuantizaciones: conservar el artefacto en un repositorio interno para auditar cómo se combinaron expertos EXL3 de turboderp con un tronco FP8/BF16 de otra release, útil para equipos que documentan pipelines de cuantización.
- Investigación sobre cuantización híbrida: estudiar el impacto de mezclar expertos EXL3 a 3.05 bpw con tronco FP8/BF16 y expertos MTP NVFP4 en la calidad final, comparando con las ramas calibradas del repositorio sucesor.
- Pruebas de compatibilidad de plugins en mlx-serve: verificar el comportamiento del plugin mlx-stream con packs antiguos antes de migrar a las ramas sc_* del repositorio sucesor.
- Reproducción de experimentos en Apple Silicon: cargar el pack en entornos MLX para validar que el flujo de streaming funciona con 130,8 GB de pesos repartidos.
- Docencia y formación técnica: usar el caso como ejemplo real de por qué las métricas de calidad de una cuantización no son transferibles cuando cambia la procedencia del tronco.
- Migración planificada: emplear este repositorio como referencia para localizar el commit `50237d5c` y la model card histórica, y planificar el salto a la rama sc_3.10bpw del repositorio sucesor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que los números de divergencia KL de turboderp no aplican a este pack.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 130,8 GB; en un entorno MLX (memoria unificada de Apple Silicon) se necesita al menos esa cantidad de memoria disponible, más overhead del runtime.
- GPU recomendadas: no disponible. El pack está orientado a mlx-serve, es decir, a hardware Apple Silicon con memoria unificada; no se documentan GPU NVIDIA/AMD compatibles.
- ¿Cabe en GPU de consumo? No disponible. Con 130,8 GB de pesos, no cabe en GPUs de consumo convencionales (24 GB o menos); requeriría equipos Apple de gama alta con memoria unificada amplia, aunque el autor no confirma modelos concretos.
- Opciones de despliegue: mlx-serve con el plugin mlx-stream (el plugin turboexl3_glm53f no lo sirve). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| Este pack (3.05bpw, deprecated) | 9.669.466.974 | no disponible | MIT | Deprecated, sin soporte del plugin turboexl3_glm53f | Tronco FP8/BF16 de otra release; métricas de turboderp no aplicables |
| OpensourceWTF/GLM-5.3-Flash-streaming-repack-exl3 (ramas sc_*) | no disponible | no disponible | MIT | Activo, servido por glm5_next + turboexl3_glm53f | Cuatro ramas calibradas (2.10, 2.60, 3.10, 4.10 bpw); pesos de turboderp |
| turboderp/GLM-5.3-Flash-exl3 | no disponible | no disponible | no disponible | Cuantización de referencia | Generada con exllamav3; sus métricas KL sí aplican |
| zai-org/GLM-5.3-Flash | no disponible | no disponible | no disponible | Modelo base original | Fuente del modelo sin cuantizar |

## Limitaciones y advertencias

- **Repositorio deprecated**: el autor lo marca como obsoleto y no lo prueba; no debe usarse en producción.
- **Métricas de calidad no transferibles**: los números de divergencia KL publicados por turboderp no aplican porque el tronco proviene de otra release (vcruz305/GLM-5.3-Flash-NVFP4).
- **Incompatibilidad de plugins**: el plugin turboexl3_glm53f no sirve este pack; está hecho para mlx-stream, que ya no se mantiene para este artefacto.
- **Sesgos conocidos**: no disponible.
- **Riesgo de alucinación**: no disponible para el modelo base; no se documenta.
- **Limitaciones de contexto o idioma**: no disponible; el campo de idiomas está vacío.
- **Restricciones de licencia**: licencia MIT, que en principio permite uso comercial, pero al ser un artefacto deprecated y sin garantías de calidad, su uso comercial no está recomendado.
- **Caveat de producción**: el tamaño del repositorio (130,8 GB) y la dependencia de memoria unificada de Apple Silicon limitan su despliegue; conviene migrar a la rama sc_3.10bpw del repositorio sucesor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OpensourceWTF/GLM-5.3-Flash-streaming-repack-exl3-3.05bpw
- Repositorio sucesor: https://huggingface.co/OpensourceWTF/GLM-5.3-Flash-streaming-repack-exl3
- Cuantización de referencia de turboderp: https://huggingface.co/turboderp/GLM-5.3-Flash-exl3
- Repositorio exllamav3: https://github.com/turboderp-org/exllamav3
- Modelo base original: https://huggingface.co/zai-org/GLM-5.3-Flash
- Release NVFP4 usada para el tronco: https://huggingface.co/vcruz305/GLM-5.3-Flash-NVFP4
