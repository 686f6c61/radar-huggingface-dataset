# Maziko/affine-sn120-head-r000030

## Resumen

Affine SN120 r000030 es un checkpoint de evaluación publicado por el usuario Maziko en Hugging Face, derivado del modelo XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, que a su vez es una destilación de Qwen3.5-9B realizada por XiaomiMiMo. El repositorio contiene los pesos ya fusionados (adapters merged) de lo que el autor denomina "Affine SN120", con 12 ficheros de checkpoint verificados contra un manifiesto SHA-256 oficial alojado en affine.io. No se trata de un modelo entrenado desde cero, sino de un artefacto de evaluación o "head" sobre una base existente.

El modelo cuenta con 9.409.813.744 parámetros según los metadatos de safetensors y ocupa 18,8 GB en el repositorio, lo que sugiere pesos en precisión de 16 bits. La arquitectura subyacente es la de Qwen3.5-9B, un transformer denso de la familia Qwen, aunque la model card no detalla configuración de capas, cabezas ni longitud de contexto nativa.

La relevancia de esta ficha es limitada: se trata de un checkpoint de evaluación con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado, sin licencia explícita en el repositorio y sin benchmarks publicados. Resulta útil únicamente como referencia para quienes sigan el ecosistema Affine o quieran reproducir la evaluación SN120 sobre la base MiMo-V2.6-Distill-Qwen-9B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3.5-9B vía MiMo-V2.6-Distill-Qwen-9B) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE según los metadatos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente BF16/FP16 por el tamaño del repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repositorio; la model card cita Apache 2.0 del checkpoint upstream Qwen y metadatos MIT de XiaomiMiMo |
| Formato de pesos | safetensors (12 ficheros de checkpoint) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, que según la model card es una destilación de Qwen3.5-9B. Se trata por tanto de un transformer denso de aproximadamente 9,4 mil millones de parámetros. El repositorio Affine SN120 no aporta detalles sobre número de capas, dimensión oculta, mecanismo de atención ni función de activación; esa información debe consultarse en los repositorios upstream de XiaomiMiMo y Qwen.

El proceso de entrenamiento del checkpoint aquí publicado consiste en la fusión de adaptadores (adapters) sobre los pesos base, según indica la model card: "Affine has already merged the adapters into the released weights". No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o alguna fase de alineación adicional en esta variante concreta. Tampoco se documenta ninguna innovación técnica propia (decodificación especulativa, atención lineal, etc.) más allá de la herencia del modelo base.

## Capacidades

- Generación de texto y razonamiento general, heredados de la base Qwen3.5-9B destilada por XiaomiMiMo.
- Capacidad de código y matemáticas presumiblemente presente por la familia base, aunque no documentada en esta ficha.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Verificación de integridad: los 12 ficheros de checkpoint están validados contra un manifiesto SHA-256 oficial.

## Casos de uso

- Reproducción de evaluaciones SN120: el checkpoint está pensado como "evaluation checkpoint" del head Affine SN120; se usaría para replicar las métricas publicadas por Affine sobre la base MiMo-V2.6-Distill-Qwen-9B, verificando los hashes contra el manifiesto oficial.
- Auditoría de integridad de pesos: dado que el repositorio incluye verificación SHA-256 de los 12 ficheros, es adecuado para pipelines que necesiten comprobar que los pesos no han sido alterados antes de desplegarlos.
- Investigación sobre destilación Qwen3.5-9B: sirve como punto de comparación frente al checkpoint original de XiaomiMiMo para estudiar el efecto de la fusión de adaptadores Affine sobre el comportamiento del modelo.
- Fine-tuning posterior sobre una base ya fusionada: al estar los adapters integrados, se puede partir de estos pesos para un ajuste adicional sin necesidad de gestionar merges manuales de LoRA.
- Despliegue en entornos de laboratorio con vLLM o TGI: al ser un transformer denso de 9,4B en safetensors, es compatible con los servidores de inferencia habituales, siempre que se valide la licencia antes de uso comercial.
- Base para experimentos de cuantización: el tamaño de 18,8 GB permite generar versiones GGUF/AWQ/GPTQ para comparar degradación entre la base MiMo original y la variante Affine SN120.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: en torno a 19-20 GB solo para pesos, más overhead de KV cache; se recomienda al menos 24 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: aproximadamente 10-11 GB; en 4 bits, en torno a 5-6 GB (estimaciones por tamaño de parámetros, no verificadas con este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16 con contexto moderado.
- Cabe en GPU de consumo: sí en RTX 4090 (24 GB) en BF16 con contexto limitado, y en GPUs de 16 GB si se cuantiza a 8 bits; en 12 GB requeriría cuantización a 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama tras conversión a GGUF; el formato nativo es safetensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Affine SN120 r000030 (este) | 9,41B | no disponible | no disponible en repo (upstream Apache 2.0 / MIT citados) | Hugging Face, 0 descargas | Checkpoint de evaluación con adapters fusionados |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B | ~9B (no verificado) | no disponible | MIT según la model card citada | Hugging Face (upstream) | Base directa del checkpoint Affine |
| Qwen/Qwen3.5-9B | ~9B (no verificado) | no disponible | Apache 2.0 | Hugging Face (upstream) | Modelo original del que deriva la destilación |

## Limitaciones y advertencias

- Checkpoint de evaluación con cero descargas y cero likes: no hay evidencia de uso en producción ni validación comunitaria.
- Sin licencia declarada en el propio repositorio; la model card remite a Apache 2.0 (Qwen) y MIT (XiaomiMiMo), pero la licencia efectiva de esta variante fusionada no está confirmada. Verificar antes de cualquier uso comercial.
- Sin pipeline declarado, sin idiomas declarados y sin benchmarks publicados: imposible evaluar calidad o sesgos con la información disponible.
- Riesgo de alucinación y sesgos heredado del modelo base Qwen3.5-9B y del proceso de destilación de XiaomiMiMo; no documentado específicamente para esta variante.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones largas o documentos extensos.
- El nombre "Affine SN120" y el manifiesto en affine.io no están descritos en la información proporcionada; se desconoce qué evalúa exactamente SN120.
- Los pesos están fusionados (merged), por lo que no es posible separar los adapters originales para inspeccionarlos o reutilizarlos por separado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Maziko/affine-sn120-head-r000030
- Manifiesto oficial Affine head: https://affine.io/public/heads/601460f77c277f98319de58490b5edde4411830309a0c5b8aa387da54bd4e469.json
- Modelo base XiaomiMiMo: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B/tree/1f09ddcc1a0ea45751ae0dfe2af20d533168c46f
- Checkpoint upstream Qwen: https://huggingface.co/Qwen/Qwen3.5-9B/tree/c202236235762e1c871ad0ccb60c8ee5ba337b9a
