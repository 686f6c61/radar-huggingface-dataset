# jackxuhaha/Sulphur-3

## Resumen

Sulphur 3 es un ajuste fino (fine-tune) del modelo de generación de vídeo MiniMax H3, desarrollado por el usuario jackxuhaha. Se presenta explícitamente como un modelo de generación de vídeo "sin censura" (uncensored), es decir, un derivado que elimina o relaja los filtros de contenido del modelo base. El repositorio se publicó en Hugging Face a finales de noviembre de 2026 y se distribuye bajo la MiniMax H3 Community License.

El modelo se apoya íntegramente en la arquitectura y las capacidades del MiniMax H3 original; el autor no documenta cambios estructurales, sino un proceso de ajuste que incluye una LoRA de RL (según la nomenclatura de los ficheros: `s3_raw` sería el modelo sin esa LoRA y `s3` el modelo con ella aplicada). El repositorio ocupa 276,5 GB e incluye el checkpoint principal en formato safetensors, variantes cuantizadas para menor VRAM, una variante Ref2VA (no entrenada) y un "corrector" opcional con nodos y flujo de trabajo para ComfyUI.

La relevancia del modelo es acotada: se trata de un derivado comunitario de un modelo de vídeo, con cero descargas y cero "likes" en el momento de la consulta, y con información técnica muy escasa. No se documentan parámetros, longitud de contexto, idiomas ni resultados de benchmarks, por lo que la ficha se limita a lo que el autor declara y marca el resto como no disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de MiniMax H3; el autor no especifica la arquitectura interna) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | variantes cuantizadas incluidas en `quantized/` (el autor no detalla los formatos concretos) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License (license_name: minimax-h3-community-license) |
| Formato de pesos | safetensors (`s3.safetensors`, `s3_raw.safetensors`, `s3_ref2va.safetensors`, `s3_corrector.safetensors`) y LoRA (`s3_raw_lora.safetensors`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo. Sulphur 3 es un fine-tune de MiniMaxAI/MiniMax-H3, y el autor no documenta la arquitectura del modelo base ni los detalles del proceso de ajuste (número de tokens, composición del dataset, método de alineación). La única información técnica sobre el entrenamiento se deduce de la nomenclatura de los ficheros: existe una variante `s3_raw` descrita como "Sulphur 3 sin la LoRA de RL", lo que indica que el ajuste incluyó una etapa de aprendizaje por refuerzo aplicada como LoRA sobre el checkpoint base, y que el checkpoint `s3` es el resultado de aplicar dicha LoRA. No se especifican hiperparámetros, datos de entrenamiento ni metodología de RL.

El autor incluye además un "corrector" opcional (`s3_corrector.safetensors`), que se instala en `ComfyUI/models/h3_correctors/` y que, según la model card, también funciona con otros modelos H3. No se explica qué corrige ni cómo se entrenó. La variante `s3_ref2va.safetensors` se describe como "Ref2VA variant, not trained", es decir, una variante no entrenada incluida en el repositorio.

## Capacidades

- Generación de vídeo: es la función principal declarada del modelo, heredada de MiniMax H3.
- Generación sin censura: el autor presenta el modelo explícitamente como "uncensored", lo que implica la relajación o eliminación de los filtros de contenido del modelo base.
- Variante Ref2VA: el repositorio incluye un fichero `s3_ref2va.safetensors` etiquetado como variante Ref2VA, aunque el autor indica que no está entrenado.
- Corrector opcional: permite aplicar un módulo de corrección sobre las salidas, con nodos y flujo de trabajo para ComfyUI incluidos en `S3_ComfyUI.zip`.
- Compatibilidad con el ecosistema MiniMax H3: se ejecuta "como cualquier modelo MiniMax H3 normal", según el autor.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo ni modalidades adicionales (audio, visión).

## Casos de uso

- Generación de vídeo creativo sin restricciones de contenido: el modelo está pensado para producir clips de vídeo a partir de indicaciones donde los filtros del modelo base podrían bloquear la generación. Adecuado para proyectos artísticos o de investigación que requieran libertad creativa, con la advertencia legal correspondiente.
- Investigación sobre alineación y censura en modelos generativos: al ser un derivado "uncensored" declarado, puede emplearse para estudiar qué comportamientos cambian respecto al modelo base y cómo afecta la LoRA de RL a las salidas.
- Experimentación con el corrector en ComfyUI: el flujo `S3_ComfyUI.zip` permite probar el módulo corrector sobre Sulphur 3 y sobre otros modelos H3, útil para evaluar su efecto en la calidad del vídeo generado.
- Despliegue en entornos con VRAM limitada mediante las variantes cuantizadas de `quantized/`: permite ejecutar el modelo en hardware más modesto que el requerido por el checkpoint completo, a costa de calidad.
- Comparación de checkpoints derivados: la disponibilidad de `s3`, `s3_raw` y `s3_raw_lora` permite comparar el efecto de la LoRA de RL frente al modelo sin ella en la misma tarea de generación.
- Integración en pipelines de generación de vídeo basados en ComfyUI: al ejecutarse como un modelo H3 convencional, puede insertarse en flujos de trabajo existentes de ComfyUI para producción de clips.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio completo ocupa 276,5 GB, lo que da una idea del orden de magnitud de los pesos; el checkpoint principal `s3.safetensors` es presumiblemente el fichero de mayor tamaño, aunque no se detalla su tamaño individual.
- VRAM estimada para inferencia: no disponible. Depende del tamaño real del checkpoint y de la cuantización elegida; las variantes de `quantized/` están pensadas para reducir este requisito, pero el autor no publica cifras.
- GPU recomendadas: no disponible. Por el tamaño del repositorio, es previsible que el checkpoint completo no quepa en GPU de consumo, pero no hay datos confirmados.
- Ejecución en GPU de consumo: no confirmada; solo es plausible mediante las variantes cuantizadas, sin cifras disponibles.
- Opciones de despliegue: ComfyUI (con los nodos incluidos en `S3_ComfyUI.zip` para el corrector) y el ecosistema MiniMax H3 (`library_name: minimax-h3`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tipo | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Sulphur 3 | MiniMax H3 | Fine-tune de generación de vídeo, "uncensored" | MiniMax H3 Community License | Hugging Face (jackxuhaha/Sulphur-3), 0 descargas | Incluye corrector opcional y variantes cuantizadas |
| MiniMaxAI/MiniMax-H3 | — | Modelo base de generación de vídeo | MiniMax H3 Community License | Hugging Face (MiniMaxAI) | Modelo original; Sulphur 3 deriva de él |
| Merges de TenStrip | MiniMax H3 | Merges comunitarios de checkpoints H3 | no disponible | Hugging Face (TenStrip) | Recomendados por el propio autor de Sulphur 3 como alternativa |

No se dispone de datos de rendimiento comparativo entre estos modelos.

## Limitaciones y advertencias

- Modelo declarado como "uncensored": la relajación de filtros implica un riesgo elevado de generar contenido inapropiado, ofensivo o ilegal según la jurisdicción; el uso en producción exige controles adicionales.
- Sesgos conocidos: no documentados por el autor; al heredar el modelo base y aplicar un ajuste de RL no descrito, los sesgos son desconocidos.
- Riesgo de alucinación y artefactos: no evaluado; no hay benchmarks ni evaluaciones de calidad publicadas.
- Idiomas: no disponibles; no se especifica el soporte multilingüe de las indicaciones.
- Licencia: MiniMax H3 Community License, una licencia "other" que hay que revisar en el fichero `LICENSE` antes de cualquier uso comercial; las restricciones concretas no se detallan en la model card.
- Madurez: 0 descargas y 0 "likes" en el momento de la consulta, publicado y actualizado el mismo día; no hay evidencia de uso comunitario ni de validación independiente.
- Documentación incompleta: sin parámetros, contexto, idiomas ni benchmarks; el autor remite a "ejecutarlo como un modelo H3 normal" sin más detalle técnico.
- Variante `s3_ref2va` no entrenada: no debe usarse como si fuera un checkpoint funcional.
- Dependencia del ecosistema H3: requiere las herramientas y el runtime de MiniMax H3 (y ComfyUI para el corrector); no hay soporte documentado en otros runners.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jackxuhaha/Sulphur-3
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Perfil del autor en X: https://x.com/FusionCow11
- Discord del autor: https://discord.gg/C3d56f39Ah
- Merges de TenStrip (recomendados por el autor): https://huggingface.co/TenStrip
