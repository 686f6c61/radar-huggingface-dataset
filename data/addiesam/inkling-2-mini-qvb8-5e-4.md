# addiesam/Inkling-2-Mini-QVB8-5e-4

## Resumen

Inkling-2-Mini-QVB8-5e-4 es un paquete de pesos cuantizados del modelo multimodal Inkling-2-Mini, desarrollado originalmente por Thinking Machines Lab y comprimido por el investigador independiente Addie Sam mediante el formato QVB8. No se trata de un modelo nuevo, sino de una versión comprimida del checkpoint bf16 original que conserva la torre de visión intacta y aplica una cuantización con cota certificada de error L∞ sobre los tensores del modelo de lenguaje. El paquete ocupa 18 GB en disco y está diseñado para ejecutarse exclusivamente con el motor de inferencia QVB8, que decodifica los pesos en la GPU dentro de sus propios kernels CUDA.

La propuesta técnica diferencial es la garantía de error máximo: para cada peso restaurado, la desviación respecto al valor bf16 original es inferior a tau = 0.0005, verificado tensor a tensor tras el empaquetado y registrado en `manifest.json`. Esto contrasta con las métricas habituales de cuantización basadas en medias (perplejidad, benchmarks), que pueden ocultar errores puntuales grandes capaces de alterar un token. El modelo tiene 834.286.224 parámetros totales según los safetensors publicados, aunque la model card no detalla la arquitectura interna ni la longitud de contexto nativa.

Es relevante ahora porque demuestra un enfoque alternativo a la cuantización convencional: en lugar de optimizar la media, controla el peor caso y permite ejecutar un modelo multimodal en hardware modesto con una huella de VRAM cercana al tamaño del archivo comprimido. La limitación práctica es fuerte: no es cargable en `transformers` ni en otros motores estándar, y depende enteramente del motor QVB8 (v1.3.0 o superior).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; arquitectura interna no especificada) |
| Parametros totales | 834.286.224 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QVB8 con cota L∞; tau = 0.0005; media de 5,37 bits por peso en los tensores comprimidos |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | QVB8 (safetensors para la torre de visión); no cargable en transformers |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base Inkling-2-Mini (tipo de transformer, atención, composición del dataset o fases de alineación como RLHF o DPO). Lo que sí se documenta es el proceso de compresión: cada matriz de pesos se empaqueta con un ancho de bits por fila y se verifica después del empaquetado, registrando el error máximo por tensor en `manifest.json` (`max_err`). El proceso no utiliza datos de calibración y depende únicamente de los pesos. Se comprimen 6.525 tensores con una media de 5,37 bits por peso, mientras que la torre de visión se mantiene en bf16 original dentro de `model.safetensors`, de modo que las características de imagen son exactas y el paquete es autocontenido.

La innovación destacable no está en el entrenamiento sino en el formato y el motor: la compresión está certificada para fp16 y bf16 (`restore: fp16+bf16`), incluye `escape_tables.json` para acelerar la decodificación en ejecuciones fp16, y el motor QVB8 aplica compresión también a la caché KV, lo que permite contextos largos que no cabrían en memoria con un motor estándar. No se especifican técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline declarado (`conversational`).
- Procesamiento de imagen y texto (`image-text-to-text`), con torre de visión en bf16 sin comprimir.
- Compresión con cota de error certificada por peso, verificable mediante `manifest.json`.
- Ejecución en VRAM reducida gracias a la decodificación de pesos en kernels CUDA del motor QVB8.
- Soporte de contexto largo mediante la caché KV comprimida del motor QVB8.
- No se documentan capacidades de tool calling, function calling, agentes, matemáticas, código ni modo thinking.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue de un modelo multimodal en GPU de gama media: el paquete de 18 GB permite ejecutar Inkling-2-Mini con una huella de VRAM cercana al tamaño del archivo, algo inviable con el checkpoint bf16 completo en hardware pequeño.
- Investigación en cuantización con garantías: útil para estudiar el efecto de una cota L∞ frente a métricas medias, comparando los packs tau = 5e-4 y tau = 1e-3 del mismo modelo.
- Procesamiento de documentos con imagen y texto: la torre de visión intacta en bf16 preserva las características de imagen exactas, adecuado para tareas de descripción o extracción sobre capturas y escaneos.
- Conversación multi-turno con contexto largo: la caché KV comprimida del motor QVB8 hace viables sesiones extensas en memoria limitada.
- Validación de pipelines de compresión certificada: el `max_err` por tensor en `manifest.json` permite auditar la calidad de la restauración antes de desplegar.
- Entornos de investigación con hardware restringido: un investigador independiente puede reproducir experimentos multimodales sin acceso a GPUs de gran memoria.
- Pruebas de integración del motor QVB8: sirve como caso de referencia para evaluar latencia y estabilidad de la versión v1.3.0 o superior en distintas generaciones de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 18 GB, cercana al tamaño del paquete en disco, según la model card.
- GPU recomendadas: no se especifican modelos concretos; la model card menciona pruebas pendientes en otras generaciones de GPU.
- GPU de consumo: no se confirma compatibilidad con RTX 4090 u otras; con 18 GB de huella, una RTX 4090 (24 GB) sería el límite teórico, pero no está verificado en la documentación.
- Despliegue: exclusivamente mediante el motor QVB8 v1.3.0 o superior; no es compatible con vLLM, llama.cpp, Ollama, TGI ni `transformers`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-QVB8-5e-4 | 834.286.224 | no disponible | QVB8 (solo motor QVB8) | Apache-2.0 | Cota L∞ tau = 5e-4; 18 GB en disco |
| Inkling-2-Mini-QVB8-1e-3 | 834.286.224 | no disponible | QVB8 (solo motor QVB8) | Apache-2.0 | Cota L∞ tau = 1e-3; 18 GB en disco |
| thinkingmachines/Inkling-2-Mini (bf16) | 834.286.224 | no disponible | safetensors bf16 | Apache-2.0 | Checkpoint original; mayor huella de VRAM |

No se dispone de datos de benchmarks ni de modelos de terceros comparables en la información proporcionada.

## Limitaciones y advertencias

- No es cargable en `transformers` ni en motores estándar; requiere el motor QVB8 v1.3.0 o superior.
- La cota L∞ cubre solo los pesos almacenados: no garantiza que las respuestas sean idénticas a las del original ni correctas.
- Diferencias de motor, tamaño de lote u orden de operaciones en coma flotante producen salidas ligeramente distintas incluso con pesos sin cuantizar.
- Sesgos conocidos: no documentados.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Idiomas soportados y longitud de contexto: no disponibles.
- Licencia Apache-2.0 permite uso comercial, pero el ecosistema de ejecución depende de un único motor mantenido por un investigador independiente.
- Sin garantía explícita: el autor remite al README del motor para el descargo completo.
- Descargas muy bajas (29) y sin likes, lo que sugiere escasa validación comunitaria.

## Enlaces

- [Hugging Face: addiesam/Inkling-2-Mini-QVB8-5e-4](https://huggingface.co/addiesam/Inkling-2-Mini-QVB8-5e-4)
- [Modelo base: thinkingmachines/Inkling-2-Mini](https://huggingface.co/thinkingmachines/Inkling-2-Mini)
- [Pack alternativo tau = 1e-3](https://huggingface.co/addiesam/Inkling-2-Mini-QVB8-1e-3)
- [Motor QVB8 en GitHub](https://github.com/addiesam/qvb8)
- [Release v1.3.0 del motor](https://github.com/addiesam/qvb8/releases/tag/v1.3.0)
- [Paper: Certified L∞-Bounded Compression for AI Models, I](https://doi.org/10.5281/zenodo.23815007)
- [Sponsor del autor](https://github.com/sponsors/addiesam)
