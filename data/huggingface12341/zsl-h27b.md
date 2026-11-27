# huggingface12341/zsl-h27b

## Resumen

zsl-h27b es un modelo de extracción de características (feature-extraction) publicado por el usuario huggingface12341 en Hugging Face. Se trata de un merge de pesos construido sobre la familia Qwen3.5-0.8B, concretamente sobre el modelo base WIlfLin/JEV-Qwen3.5-0.8B-Base y dos variantes de la serie zils-lite (joamCriff123/zils-lite-l1125a y joamCriff123/zils-lite-l1123q). El modelo tiene 852.985.920 parámetros reales según los pesos en safetensors y un repositorio de 1,7 GB.

La técnica de fusión empleada es DARE (Drop And REscale) con una tasa de descarte de 0,5 y lambda 0,4: se parte de un "soup" (media uniforme de los dos modelos zils-lite) y se le suma un task vector enmascarado y rescalado calculado como (JEV-Qwen3.5-0.8B-Base − Qwen/Qwen3.5-0.8B) sobre los pesos de lenguaje. La torre de visión se hereda del modelo base sin modificar.

El modelo está etiquetado como "decision-model" dentro del ecosistema "zils" y "d3-lite", lo que sugiere un uso orientado a tareas de decisión o clasificación más que a generación abierta. Es relevante para quienes investigan técnicas de model merging, ya que documenta un pipeline DARE reproducible sobre una base Qwen3.5 de menos de mil millones de parámetros con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B, con torre de visión heredada del base) |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un merge de pesos, no un entrenamiento desde cero. La receta documentada es DARE con drop rate 0,5 y lambda 0,4. Se construye un "soup" mediante la media uniforme de joamCriff123/zils-lite-l1125a y joamCriff123/zils-lite-l1123q, y a ese soup se le añade un task vector enmascarado y rescalado. El task vector se calcula como la diferencia entre WIlfLin/JEV-Qwen3.5-0.8B-Base y el modelo padre Qwen/Qwen3.5-0.8B, restringido a los pesos de lenguaje; la torre de visión se toma directamente del modelo base sin fusión.

La arquitectura subyacente es la de Qwen3.5-0.8B, un transformer con componente de visión (dado que se menciona explícitamente una "vision tower"). No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; al ser un merge, esos datos corresponden a los modelos originales y no se reproducen en esta ficha.

## Capacidades

- Extracción de características (feature-extraction), que es el pipeline declarado en Hugging Face.
- Modelo etiquetado como "decision-model", orientado a tareas de decisión o clasificación según el ecosistema zils/d3-lite.
- Herencia de la torre de visión del modelo base Qwen3.5-0.8B, por lo que en principio conserva capacidad de procesamiento visual, aunque no se detalla su uso en la model card.
- Capacidades de generación de texto, razonamiento, código o matemáticas: no documentadas explícitamente en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modo "thinking", audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Investigación en model merging: el modelo sirve como referencia reproducible de una receta DARE (drop 0,5, lambda 0,4) sobre una base Qwen3.5-0.8B, útil para comparar estrategias de fusión de pesos.
- Extracción de embeddings para clasificación: al declararse como feature-extraction, puede emplearse para obtener representaciones vectoriales de texto en pipelines de clasificación o clustering.
- Tareas de decisión ligeras: la etiqueta "decision-model" sugiere su uso en sistemas de enrutamiento o selección de opciones donde se requiere un modelo pequeño (menos de mil millones de parámetros).
- Prototipado en entornos con recursos limitados: con 853 millones de parámetros y 1,7 GB de pesos, cabe en GPUs de consumo para experimentación rápida.
- Base para nuevos merges: al estar construido sobre Qwen3.5-0.8B y publicarse con Apache-2.0, puede servir como punto de partida para fusiones posteriores dentro del ecosistema zils.
- Evaluación de herencia visión-lenguaje: permite estudiar cómo se comporta una torre de visión heredada cuando solo se fusionan los pesos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica entre 2 y 4 GB según longitud de secuencia.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9 GB para pesos; en 4 bits, alrededor de 0,5 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobradas para este tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 6 GB o más.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están documentados para este modelo, y al requerir `custom_code` puede que no funcionen sin adaptación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zsl-h27b | 852.985.920 | No disponible | Apache-2.0 | Merge DARE sobre Qwen3.5-0.8B; feature-extraction |
| Qwen/Qwen3.5-0.8B | ~0,8B (no confirmado en la información) | No disponible | No disponible en esta ficha | Modelo padre de la familia Qwen3.5 |
| WIlfLin/JEV-Qwen3.5-0.8B-Base | No disponible | No disponible | No disponible en esta ficha | Base del task vector empleado en el merge |
| joamCriff123/zils-lite-l1125a / l1123q | No disponible | No disponible | Apache-2.0 (según model card) | Componentes del soup fusionado |

## Limitaciones y advertencias

- Modelo con 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de uso en producción ni validación comunitaria.
- Al ser un merge DARE, puede heredar degradaciones de los modelos fuente; la fusión de pesos no garantiza conservar todas las capacidades de los originales.
- La torre de visión se hereda sin fusionar, lo que puede provocar desalineación entre el encoder visual y los pesos de lenguaje modificados.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación.
- No se especifica la longitud de contexto efectiva tras el merge.
- Requiere `custom_code` para cargarse en transformers, lo que complica el despliegue en frameworks estándar.
- Aunque la licencia es Apache-2.0, conviene revisar el fichero NOTICE y las licencias de los modelos base y padres antes de uso comercial.
- El repositorio tiene un tamaño de 1,7 GB y fue creado y actualizado el mismo día (2026-11-27), sin historial posterior de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface12341/zsl-h27b
- Modelo base JEV: https://huggingface.co/WIlfLin/JEV-Qwen3.5-0.8B-Base
- Componente zils-lite l1123q: https://huggingface.co/joamCriff123/zils-lite-l1123q
- Componente zils-lite l1125a: https://huggingface.co/joamCriff123/zils-lite-l1125a
- Modelo padre Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
