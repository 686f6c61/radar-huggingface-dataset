# coolpoodle/music3lab-adapters

## Resumen

Music3Lab adapters es un conjunto de adaptadores y encoders entrenados por el usuario coolpoodle para extender el modelo de generación musical MiniMax-Music3 de MiniMaxAI. El proyecto, denominado Music3Lab, se presenta como un kit de investigación abierto que explora vías de edición, continuación e inversión de audio sobre el decodificador congelado de MiniMax-Music3. Los pesos publicados en este repositorio son exclusivamente los adaptadores entrenados; el modelo base debe descargarse por separado desde `MiniMaxAI/MiniMax-Music3`.

La relevancia de este lanzamiento radica en su transparencia: documenta tanto resultados positivos como negativos, algo poco habitual en la publicación de modelos. El encoder principal (`flow-encoder`) consigue mapear audio WAV a latentes Flow en una sola pasada, mientras que la mayoría de los adaptadores de edición (inpainting, continuación, prepend) no superan los umbrales objetivos fijados. El hallazgo más significativo es que los pesos públicos de MiniMax-Music3 no contienen un tokenizador RVQ nativo, por lo que la codificación WAV a tokens nativos sigue sin resolverse con los pesos disponibles.

El repositorio tiene un tamaño de 0,2 GB, está en formato safetensors y se distribuye bajo la licencia `minimax-music3-derivative`, lo que implica que su uso está sujeto a la licencia del modelo base. No se trata de un modelo de generación completo, sino de piezas de investigación para ser cargadas junto al modelo base mediante el código de Music3Lab.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores/encoders sobre MiniMax-Music3 (DAV/Flow decoder, Global/Local LMs, vocoder). Incluye flow-encoder, LoRA rank-4, U-Net 2-sided, adaptadores de prepend y continuación |
| Parametros totales | No disponible globalmente. Algunos archivos: `masked-flow-inpaint` 1.775.616 params, `acoustic-fim-v2` 4.063.090 params |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de audio, no texto) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, presumiblemente fp32/fp16) |
| Idiomas soportados | No aplica (generación musical) |
| Licencia | minimax-music3-derivative (derivada de MiniMax-Music3) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los adaptadores se entrenan sobre el modelo base MiniMax-Music3 completamente congelado. El modelo base combina un decodificador DAV/Flow, dos modelos de lenguaje (Global y Local) y un vocoder. Los adaptadores se dividen en tres grupos: `encoders/` (mapeo WAV a latentes Flow), `editing/` (inpainting, continuación, prepend) y `native-state/` (investigación sobre tokens nativos).

El `flow-encoder` es un encoder de una sola pasada que transforma audio WAV `[B,2,44032]` en latentes Flow `[B,128,86]` con una latencia de aproximadamente 1,34 ms. Se entrenó en dos variantes: una piloto y otra afinada sobre 542 pistas reales de LAION. Esta segunda variante mejoró métricas externas (SI-SDR de 2,03 a 8,24 dB) pero provocó una regresión del 13,2% en el latente del profesor, por lo que fue rechazada. Los adaptadores de edición incluyen un LoRA rank-4 para inpainting con condición capturada, una U-Net bidireccional para FIM acústico, y varios intentos de continuación causal que colapsaron a repetición casi exacta. En `native-state/` se exploró la destilación de logits suaves y la predicción autoregresiva de códecs, sin éxito: el modelo base no expone un tokenizador RVQ nativo.

## Capacidades

- Codificación de audio WAV a latentes Flow en una sola pasada (encoder piloto funcional).
- Inpainting enmascarado sobre latentes Flow mediante LoRA rank-4 (resultado piloto con mejoras en NMSE latente y regla de agujeros).
- Continuación de audio arbitrario: implementada pero no supera los umbrales objetivos (resultado negativo documentado).
- Prepend de contexto (audio, flow, waveform): no supera las puertas de costura y anti-copia.
- Destilación de tokens nativos: acotada pero no generalizable (solo funciona en un clip concreto).
- No es un tokenizador nativo de audio, no permite inversión en tiempo real, y no es un modelo de generación autónomo.

## Casos de uso

- Investigación en representaciones latentes de audio: el `flow-encoder` permite mapear audio a latentes Flow, útil para estudiar la estructura interna del espacio latente de MiniMax-Music3.
- Reproducción de resultados negativos: el repositorio documenta experimentos fallidos de continuación e inpainting, valiosos para evitar repetir enfoques que no funcionan.
- Desarrollo de pipelines de edición musical: el LoRA de inpainting enmascarado puede servir como base para herramientas de edición localizada en latentes, aunque requiere validación musical adicional.
- Estudio de límites de modelos propietarios: el hallazgo sobre la ausencia de tokenizador RVQ nativo orienta a investigadores que intentan invertir audio a tokens.
- Benchmarking de métricas objetivas: los adaptadores incluyen mediciones de SI-SDR, SNR, correlación, NMSE latente, loudness y continuidad de frontera, útiles para comparar técnicas.
- Experimentación con adaptadores sobre modelos congelados: el enfoque de entrenar solo adaptadores pequeños sobre un decodificador congelado puede replicarse en otros dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (tipo MMLU o HumanEval) porque se trata de un modelo de audio. La model card reporta métricas objetivas específicas:

| Adaptador | Metrica | Resultado |
|---|---|---|
| `flow-encoder` (piloto) | Latencia de codificacion | ~1,34 ms one-pass |
| `external-finetune-encoder` | SI-SDR | 2,03 → 8,24 dB (mejora) |
| `external-finetune-encoder` | Regresion latente profesor | +13,2% (supera limite del 5%, rechazado) |
| `masked-flow-inpaint` | NMSE latente | +30,8% (mejora) |
| `masked-flow-inpaint` | Regla de agujeros | +20,1% (mejora) |
| `acoustic-fim-v2` | Puerta de mejora | +5,9% (por debajo del umbral del 10%) |
| `distill` | CE hard held-out | 8,97 (paso acotado) |
| `multiclip` | CE c0 | 10,54 (fallo) |
| `stage1-residual` | Filas exactas | 0 (fallo) |

Estas métricas son objetivas y no evalúan calidad musical percibida. El autor advierte explícitamente que las métricas objetivas no equivalen a calidad musical.

## Requisitos de hardware

- Los adaptadores pesan 0,2 GB en total, por lo que caben en cualquier GPU con al menos 2 GB de VRAM.
- Sin embargo, para usarlos es necesario cargar el modelo base MiniMax-Music3, cuyos requisitos no se detallan en este repositorio. Se recomienda consultar la ficha de `MiniMaxAI/MiniMax-Music3` para conocer la VRAM necesaria del modelo completo.
- No se proporcionan datos de latencia ni throughput para el conjunto adaptador + modelo base.
- Opciones de despliegue: los pesos se cargan con `safetensors.torch.load_file` y se integran mediante el código de Music3Lab (configs y scripts de reproducción). No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Para inferencia en producción se necesitaría una GPU de gama alta (A100, H100 o similar) por el modelo base, más el overhead de los adaptadores.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores comparables para MiniMax-Music3 en el momento de redactar esta ficha. El propio repositorio es el único lanzamiento público de este tipo para este modelo base. Como referencia, se puede comparar con el modelo base original:

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-Music3 | Generacion musical completa | No disponible | No aplica | Propietaria (consulta en HF) | HuggingFace |
| Music3Lab adapters | Adaptadores de investigacion | Parcial (ver specs) | No aplica | minimax-music3-derivative | HuggingFace |

No se han encontrado alternativas directas en la información proporcionada.

## Limitaciones y advertencias

- Los pesos son obras derivadas de MiniMax-Music3 y su uso está sujeto a la licencia de ese modelo. El código fuente de Music3Lab es Apache-2.0, pero esa licencia no se extiende a los pesos.
- No es un tokenizador nativo de audio. La codificación WAV a tokens nativos no está resuelta con los pesos públicos de MiniMax-Music3.
- No permite inversión en tiempo real ni edición arbitraria de audio como característica funcional. Los adaptadores de edición se publican como resultados negativos reproducibles, no como características operativas.
- Las métricas objetivas (SI-SDR, SNR, NMSE, etc.) no garantizan calidad musical percibida. No hay evaluación humana ni estética.
- Muchos adaptadores no superan los umbrales de rendimiento fijados por el autor. Usarlos en producción requeriría validación adicional.
- El `external-finetune-encoder` fue rechazado por regresión en el latente del profesor, lo que indica riesgo de degradación al fine-tunear sobre datos externos.
- No se proporcionan garantías de seguridad ni de comportamiento en escenarios no contemplados.
- El repositorio no incluye el modelo base, que debe descargarse por separado y puede tener requisitos de hardware y licencia propios.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/coolpoodle/music3lab-adapters
- Modelo base MiniMax-Music3: https://huggingface.co/MiniMaxAI/MiniMax-Music3
- Repositorio Music3Lab (enlace de GitHub no disponible en la información proporcionada; el README indica `https://github.com/REPLACE_ME/music3lab` como placeholder)
- Documentación adicional: la model card menciona `MODEL_CARD.md` y `REPRODUCING.md` en el repositorio Music3Lab, así como `FINDINGS.md` para los hallazgos sobre el tokenizador nativo.
