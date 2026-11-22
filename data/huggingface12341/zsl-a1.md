# huggingface12341/zsl-a1

## Resumen

d3-lite soup fine-tune (publicado como `huggingface12341/zsl-a1`) es un modelo derivado de 852.985.920 parámetros obtenido mediante una fusión por aritmética de tareas (*task arithmetic*) sobre pesos de lenguaje, partiendo de dos modelos Apache-2.0: `joamCriff123/zils-lite-l1121a` y `MachinePulseAI/karpo-decision-0.8B`. El modelo padre de referencia declarado es `Qwen/Qwen3.5-0.8B`, sobre cuya familia se calcula el vector de dirección de la mezcla. El resultado se etiqueta como *decision-model* dentro de la familia "zils" y el pool "d3-lite".

La operación descrita en la model card es una *soup* con corrección: al conjunto actual de pesos se le suma la diferencia entre el modelo "find" y el padre Qwen3.5-0.8B, aplicada únicamente sobre los pesos de lenguaje, mientras que la torre de visión se hereda intacta del *soup*. Se trata, por tanto, de un experimento de composición de modelos más que de un entrenamiento desde cero: no hay evidencia de un corpus de entrenamiento propio ni de fases de RLHF o DPO.

Su relevancia es acotada y experimental: el pipeline declarado es `feature-extraction`, la licencia es Apache-2.0 y el repositorio ocupa 1,7 GB en safetensors. No consta información sobre idiomas soportados, benchmarks ni contexto, y las descargas y *likes* son cero en el momento de la consulta, lo que indica un artefacto de investigación sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B), con torre de visión heredada del *soup*; etiquetada como `qwen3_5` y `custom_code` |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión por aritmética de tareas sobre los pesos de lenguaje: se parte de un *soup* (media de pesos) y se le suma el vector `find - Qwen/Qwen3.5-0.8B`, es decir, la diferencia entre un modelo "find" y el padre Qwen3.5-0.8B. La torre de visión no se modifica y se toma directamente del *soup*. Las fuentes declaradas son `joamCriff123/zils-lite-l1121a` y `MachinePulseAI/karpo-decision-0.8B`, ambas Apache-2.0, con Qwen3.5-0.8B como padre común de referencia.

No se documenta ningún proceso de entrenamiento supervisado, número de tokens, composición del dataset, ni fases de RLHF, DPO o ajuste por preferencias. Tampoco se describen innovaciones de inferencia como decodificación especulativa o atención lineal. La etiqueta `custom_code` en los tags sugiere que la carga requiere código propio del repositorio, y la presencia de una torre de visión indica un modelo multimodal heredado, aunque no se detalla su configuración.

## Capacidades

- Extracción de características (*feature-extraction*), que es el pipeline declarado en la model card y en los metadatos de Hugging Face.
- Procesamiento multimodal potencial: incluye una torre de visión heredada del *soup*, aunque no se especifica resolución, número de parches ni tareas de visión soportadas.
- Generación de texto: no confirmada explícitamente; el pipeline declarado no es `text-generation`.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo *thinking*, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Experimentación en fusión de modelos: serviría como caso de estudio reproducible de *task arithmetic* sobre la familia Qwen3.5-0.8B, comparando el efecto del vector `find - padre` sobre los pesos de lenguaje frente al *soup* original.
- Extracción de embeddings para prototipos: al declararse `feature-extraction`, puede emplearse para obtener representaciones vectoriales en tareas de recuperación o clustering, siempre que se valide su calidad frente al modelo base.
- Investigación sobre herencia multimodal: permite estudiar si una torre de visión heredada de un *soup* mantiene su comportamiento tras modificar los pesos de lenguaje, midiendo degradación en tareas visión-lenguaje.
- Base para *fine-tuning* ligero: con 853 M de parámetros y licencia Apache-2.0, es viable ajustarlo en una GPU de consumo para tareas de clasificación o decisión acotadas.
- Evaluación de robustez de merges: útil para medir cómo afecta la aritmética de tareas a la perplejidad y a la coherencia en comparación con `MachinePulseAI/karpo-decision-0.8B`.
- Docencia y reproducción de técnicas de *model souping*: el repositorio de 1,7 GB permite reproducir el pipeline completo en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y del código personalizado; en la práctica, entre 3 y 5 GB según longitud de secuencia y lote.
- Cuantización a 8 bits: en torno a 0,9 GB de pesos; a 4 bits, en torno a 0,5 GB, aunque no se publican artefactos GGUF ni cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 con margen (RTX 3060 Ti, RTX 4060, RTX 4090); A100 o H100 no son necesarias por tamaño, pero pueden usarse para lotes grandes.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB y RTX 4090 de 24 GB.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía natural dada la etiqueta `custom_code`; no consta compatibilidad verificada con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| huggingface12341/zsl-a1 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face, 0 descargas | Merge experimental, `custom_code` |
| MachinePulseAI/karpo-decision-0.8B | ~0,8 B (declarado) | no disponible | Apache-2.0 (según tag del base) | Hugging Face | Fuente directa del merge |
| joamCriff123/zils-lite-l1121a | no disponible | no disponible | Apache-2.0 (según tag del base) | Hugging Face | Fuente directa del merge |
| Qwen/Qwen3.5-0.8B | ~0,8 B | no disponible | no disponible en la información | Hugging Face | Padre de referencia para el vector de tarea |

## Limitaciones y advertencias

- Modelo experimental sin validación: cero descargas y cero *likes*, sin benchmarks ni evaluaciones publicadas; no debe asumirse calidad equiparable al modelo base.
- La aritmética de tareas puede degradar capacidades: sumar `find - Qwen3.5-0.8B` sobre los pesos de lenguaje sin reentrenar puede introducir incoherencias, olvido catastrófico o pérdida de alineación.
- Pipeline declarado como `feature-extraction`: no está confirmado que funcione correctamente como modelo generativo, pese a derivar de un LLM.
- Requiere `trust_remote_code=True` por la etiqueta `custom_code`, lo que implica ejecutar código del autor del repositorio; conviene auditar el código antes de usarlo en producción.
- Idiomas no declarados: riesgo de comportamiento inconsistente fuera del idioma o idiomas para los que se entrenó el padre Qwen3.5-0.8B.
- Riesgo de alucinación: no evaluado; al no haber ajuste por preferencias documentado, no hay garantías de alineación.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones de los modelos base (`joamCriff123/zils-lite-l1121a`, `MachinePulseAI/karpo-decision-0.8B` y `Qwen/Qwen3.5-0.8B`) antes de desplegar.
- Sin información sobre sesgos, contexto máximo ni cuantizaciones oficiales; cualquier uso en producción exige una evaluación propia previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface12341/zsl-a1
- Modelo base 1: https://huggingface.co/joamCriff123/zils-lite-l1121a
- Modelo base 2: https://huggingface.co/MachinePulseAI/karpo-decision-0.8B
- Modelo padre de referencia: https://huggingface.co/Qwen/Qwen3.5-0.8B
