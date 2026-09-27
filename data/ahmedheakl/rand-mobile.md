# ahmedheakl/rand-mobile

## Resumen

`ahmedheakl/rand-mobile` es un repositorio de HuggingFace que contiene la cabeza entrenada de **Mobile-O soup3-targets**, un *model soup* (promedio uniforme en el espacio de pesos) de tres checkpoints de Mobile-O v2. Mobile-O es un modelo unificado de visión-lenguaje-difusión desarrollado por el equipo de investigación de Ahmed Heakl, Abdelrahman Shaker y colaboradores (con participación de MBZUAI y otros centros), orientado a comprensión multimodal y generación/edición de imágenes en dispositivo móvil. El artículo asociado figura como "under submission" en la web del autor.

El repositorio no contiene un modelo autónomo: incluye únicamente la cabeza entrenada, formada por el DiT de SANA y el conector de difusión (602 tensores, 600.560.673 parámetros). El codificador vision-lenguaje (MiniCPM-V-4_6) permanece congelado durante el entrenamiento y debe descargarse por separado, igual que el autoencoder DC-AE y la configuración del scheduler de `Sana_600M_512px_diffusers`. La innovación del checkpoint es metodológica: no hay entrenamiento adicional, sino un promedio 1/3 de tres checkpoints que comparten la misma inicialización SFT, y ese promedio supera simultáneamente a sus tres miembros en DPG-Bench, ImageReward y GEdit.

Su relevancia actual radica en que consigue superar tres de los seis objetivos de referencia monitorizados en el proyecto con un único checkpoint y un único ajuste de guiado (cfg 1.5, 12 pasos), algo que ninguna configuración individual del proyecto logra. En concreto, alcanza GenEval 0.90242, ImageReward 0.9571 y GEdit 6.740, manteniendo un volumen de pesos de 1,2 GB en el repositorio y un coste de inferencia un 40 % inferior al predeterminado de 20 pasos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (SANA DiT) con conector de difusión, sobre codificador VLM congelado (MiniCPM-V-4_6) y autoencoder DC-AE |
| Parámetros totales | 600.560.673 (solo la cabeza incluida en el repositorio: DiT + conector) |
| Longitud de contexto | no disponible (modelo de generación/edición de imagen; la ventana de contexto la determina el VLM externo MiniCPM-V-4_6) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las evaluaciones de edición GEdit se reportan únicamente en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (602 tensores: 548 `model.dit.*` y 54 `model.diffusion_connector.*`) |
| Resolución de inferencia | 512 × 512 |
| Tipo de conector | `mcptf`, con fusión de 1 capa del VLM |
| Componentes externos requeridos | `openbmb/MiniCPM-V-4_6` (codificador VLM congelado) y `Efficient-Large-Model/Sana_600M_512px_diffusers` (DC-AE f32, 32 canales, latente 16×16 a 512 px, y configuración del scheduler) |
| Tamaño del repositorio | 1,2 GB |
| Librería declarada | transformers (pipeline `text-to-image`) |
| Fecha de creación | 2026-09-27 |
| Fecha de última actualización | 2026-09-14 |

## Arquitectura y entrenamiento

La cabeza entrenada consta de dos bloques: un DiT de SANA (548 tensores) y un conector de difusión (54 tensores) de tipo `mcptf` que fusiona una sola capa del modelo vision-lenguaje. El VLM que actúa como codificador de texto e imagen es MiniCPM-V-4_6, congelado y no incluido en el repositorio. El espacio latente lo genera el DC-AE de `Sana_600M_512px_diffusers`, que opera en precisión f32 con 32 canales y produce un latente de 16×16 a 512 px. El autor advierte que el campo `vlm_num_layers` puede leerse como 4 en otras configuraciones del proyecto, pero que la fuente autoritativa son los pesos, derivando el valor real de `fusion.layer_weights.shape[0]`, que es 1.

No hubo entrenamiento adicional: el modelo es un promedio uniforme de 1/3 de tres checkpoints (`ta-dpg-s1.0`, que aportó GenEval 0.9293; `qual-imagereward` en el paso 500, que aportó ImageReward 0.9165; y `joint-grpo-refl-500` en el paso 500, que aportó GEdit 6.710), todos ellos ajustados a partir de la misma inicialización `Mobile-O-0.5B-SFT-minicpm-v2mcptf-mixed`. Que compartan la misma inicialización SFT es lo que valida el promedio en el espacio de pesos.

La configuración de inferencia documentada emplea el scheduler DPM-Solver++ con `solver_order=2` y `flow_shift=3`, 12 pasos y guiado cfg 1.5. La condición nula no es un vector de ceros, sino el prompt vacío pasado por la misma ruta VLM + conector; en tareas de edición, la condición nula es la propia instrucción. Los 12 pasos no son una simplificación: la calidad de muestra en sujetos humanos alcanza su máximo entre 8 y 16 pasos y decae entre 20 y 40, por lo que 12 pasos resulta a la vez mejor y aproximadamente un 40 % más económico que el valor predeterminado de 20. La alineación (GenEval/DPG) y GEdit no cambian entre 12 y 20 pasos.

## Capacidades

- Generación de imagen a partir de texto (text-to-image) a resolución 512 × 512.
- Edición de imagen guiada por instrucción (image-editing), evaluada con la métrica GEdit.
- Alineación prompt-imagen medida con GenEval y DPG-Bench.
- Optimización de preferencia estética/humana medida con ImageReward sobre MJHQ-30K.
- Comprensión multimodal heredada del VLM congelado MiniCPM-V-4_6, no de la cabeza incluida en este repositorio.
- Funcionamiento con un único ajuste de guiado (cfg 1.5) cubriendo simultáneamente tres objetivos de referencia.
- No se documenta soporte de tool calling, function calling, uso como agente ni razonamiento multi-paso.
- No se documenta modo de pensamiento (thinking mode), audio ni vídeo.

## Casos de uso

- Generación de imágenes en dispositivo móvil: la etiqueta `mobile` y el tamaño reducido de la cabeza (0,6 B de parámetros, 1,2 GB de pesos) apuntan a escenarios de inferencia en el propio terminal, con 12 pasos de DPM-Solver++ como configuración recomendada de bajo coste.
- Edición de imágenes por instrucción en herramientas de fotografía: el modelo acepta la instrucción como condición nula en el modo de edición, lo que permite flujos de retoque conversacional sin reentrenamiento.
- Añadir generación de imagen a una pila multimodal existente: si ya se dispone de MiniCPM-V-4_6 desplegado, la cabeza de 0,6 B se acopla como módulo de difusión y aporta salida visual al mismo codificador VLM.
- Ajuste fino de alineación prompt-imagen: con GenEval 0.90242 y DPG-Bench 82.190, sirve como punto de partida para proyectos que priorizan el cumplimiento de instrucciones textuales sobre la fidelidad distribucional.
- Investigación en fusión de pesos (model soups): el repositorio documenta la procedencia exacta de cada miembro y los ajustes de guiado, lo que lo convierte en un caso reproducible para estudiar promediado uniforme en espacio de pesos.
- Evaluación comparativa de checkpoints: al publicar métricas bajo dos ajustes de guiado (cfg 1.5 y cfg 3.0) y frente a un checkpoint previo, es útil como referencia interna para medir el compromiso entre alineación y calidad de imagen humana.
- Prototipado rápido en pipelines de bajo presupuesto: los 12 pasos frente a los 20 predeterminados reducen el coste de cómputo alrededor de un 40 % sin degradar GenEval, DPG ni GEdit.

## Benchmarks y rendimiento

Ajuste recomendado: **cfg 1.5, 12 pasos DPM-Solver++**, resolución 512 × 512.

| Benchmark | Objetivo | soup3 @ cfg 1.5, 12 pasos | soup3 @ cfg 3.0, 12 pasos | v2mcptf-grpo-500 @ cfg 3.0 (mejor previo) |
|---|---|---|---|---|
| GenEval | ≥ 0,90 | 0,90242 (cumplido) | 0,91876 | 0,9284 |
| ImageReward (MJHQ-30K) | ≥ 0,90 | 0,9571 (cumplido) | 1,0831 | 0,9250 |
| GEdit (EN, juez local Qwen2.5-VL-72B) | ≥ 6,7 | 6,740 (cumplido) | 6,750 | 6,620 |
| DPG-Bench | ≥ 85 | 82,190 (no cumplido) | 83,228 | 81,73 |
| FID (MJHQ-30K) | ≤ 8 | 14,36 (no cumplido) | no reportado | 15,40 |
| ImgEdit (juez local) | ≥ 3,5 | no medido | no medido | 3,020 |

El soup supera simultáneamente a sus tres miembros en DPG, ImageReward y GEdit. El mejor DPG medido en todo el proyecto es 84,612, obtenido por otro checkpoint a cfg 7,5 con guiado por intervalos, cuyo GenEval cae entonces a 0,880. Los checkpoints ajustados con RL en este proyecto se sitúan en el rango de FID 13-18, mientras que los optimizados para FID (5,9-7,3) ceden 0,2 o más en GenEval.

## Requisitos de hardware

- Pesos del repositorio: 1,2 GB (cabeza de 600.560.673 parámetros; en bf16 corresponde aproximadamente a 1,2 GB).
- Codificador VLM congelado (MiniCPM-V-4_6): componente externo de mayor peso en el conjunto; su huella en memoria domina el total (estimación: en torno a 16 GB en bf16 para una variante de ~8 B de parámetros; dato no confirmado en la información disponible).
- VRAM total estimada del conjunto completo en bf16: en torno a 18-20 GB (estimación, no publicada por el autor).
- VRAM estimada con el VLM cuantizado a int8/int4: aproximadamente 8-12 GB (estimación).
- Caben en GPU de consumo: sí, en RTX 4090 o RTX 3090 (24 GB) con precisión bf16 sin cuantizar el VLM de forma agresiva; en GPUs de 8-12 GB requeriría cuantización del VLM.
- GPU de datacenter recomendadas: A100 40 GB, H100, L40S (estimación basada en el tamaño del conjunto).
- El repositorio no publica cifras de latencia ni de throughput absolutos; solo se indica que 12 pasos son aproximadamente un 40 % más económicos que los 20 pasos predeterminados.
- Opciones de despliegue: la librería declarada es `transformers`; el scheduler y el DC-AE provienen de `diffusers` (configuración de `Sana_600M_512px_diffusers`). No se documentan pesos GGUF ni soporte para llama.cpp u Ollama, algo esperable al tratarse de un modelo de difusión. vLLM o TGI podrían aplicarse a la parte VLM, pero no se documenta en la información disponible.
- La cabeza no es ejecutable por sí sola: requiere descargar MiniCPM-V-4_6 y Sana_600M_512px_diffusers.

## Comparativa con modelos similares

No se dispone de datos publicados de modelos externos comparables en la información proporcionada. La comparación documentada es interna al proyecto Mobile-O y se recoge a continuación.

| Modelo | Parámetros | Contexto | GenEval | DPG-Bench | ImageReward | GEdit | Licencia |
|---|---|---|---|---|---|---|---|
| soup3-targets (este repositorio) | 0,6 B (cabeza) | no aplica | 0,90242 | 82,190 | 0,9571 | 6,740 | Apache 2.0 |
| v2mcptf-grpo-500 (mejor previo del proyecto) | 0,6 B (cabeza) | no aplica | 0,9284 | 81,73 | 0,9250 | 6,620 | no disponible |
| ta-dpg-s1.0 (miembro del soup) | 0,6 B (cabeza) | no aplica | 0,9293 | no disponible | no disponible | no disponible | no disponible |
| qual-imagereward, paso 500 (miembro) | 0,6 B (cabeza) | no aplica | no disponible | no disponible | 0,9165 | no disponible | no disponible |
| joint-grpo-refl-500, paso 500 (miembro) | 0,6 B (cabeza) | no aplica | no disponible | no disponible | no disponible | 6,710 | no disponible |
| Mobile-O-0.5B-SFT-minicpm-v2mcptf-mixed (inicialización) | 0,6 B (cabeza) | no aplica | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- DPG-Bench no alcanza el objetivo: 82,190 frente a 85. Ningún checkpoint del proyecto lo ha alcanzado; el máximo medido es 84,612 en otra configuración, a costa de degradar GenEval hasta 0,880.
- FID claramente por encima del objetivo: 14,36 frente a ≤ 8. No es una regresión específica del soup: los checkpoints ajustados con RL del proyecto se sitúan en el rango 13-18.
- No mejora la calidad en imágenes de personas: en un banco de calidad humana pareado resulta neutro frente a la línea base (+0,018, no significativo) y significativamente peor a cfg 3.0 (−0,147, t = −2,68). Por ese motivo se recomienda cfg 1.5 pese a que cfg 3.0 ofrezca mejores números en los objetivos de alineación.
- El GEdit reportado está puntuado por un juez local Qwen2.5-VL-72B, no por la escala del leaderboard con GPT-4o; ambas cifras no son comparables entre sí.
- ImgEdit no se midió en este checkpoint; sus miembros puntúan entre 3,0 y 3,1, por debajo del objetivo de 3,5.
- La cabeza sola no es un modelo ejecutable: es imprescindible descargar MiniCPM-V-4_6 y Sana_600M_512px_diffusers, y respetar sus respectivas licencias, que pueden diferir de la Apache 2.0 de este repositorio.
- Trampa de configuración documentada: el campo `vlm_num_layers` puede leer 4 en las configuraciones del proyecto, pero el valor correcto derivado de los pesos es 1 (`fusion.layer_weights.shape[0]`).
- Discrepancia de nomenclatura: el identificador del repositorio es `rand-mobile`, mientras que la model card lo describe como "Mobile-O — soup3-targets". Conviene verificar que el contenido coincide con lo esperado antes de integrarlo.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta: no cuenta con validación externa de la comunidad.
- Evaluación multilingüe no disponible: la métrica de edición GEdit solo se reporta en inglés, por lo que el comportamiento en castellano no está verificado.
- Riesgo de alucinación visual (artefactos, composición incorrecta o texto mal renderizado) inherente a los modelos de difusión de este tamaño; el autor no publica una evaluación específica al respecto.
- La licencia Apache 2.0 permite uso comercial del repositorio, pero la licencia de los componentes externos (MiniCPM-V-4_6 y Sana_600M_512px_diffusers) debe verificarse de forma independiente antes de un despliegue en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ahmedheakl/rand-mobile
- Perfil del autor en HuggingFace: https://huggingface.co/ahmedheakl
- Página personal del autor: https://ahmedheakl.github.io/
- Perfil de GitHub del autor: https://github.com/ahmedheakl
- Repositorio de configuración del perfil de GitHub: https://github.com/ahmedheakl/ahmedheakl
- Componente externo obligatorio (codificador VLM): https://huggingface.co/openbmb/MiniCPM-V-4_6
- Componente externo obligatorio (DC-AE y scheduler): https://huggingface.co/Efficient-Large-Model/Sana_600M_512px_diffusers
- Paper, código y aplicación móvil de Mobile-O: enlazados desde https://ahmedheakl.github.io/ (URL directa no disponible en los resultados de búsqueda)
