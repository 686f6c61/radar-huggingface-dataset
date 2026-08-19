# d9beuD/Qwen3.8-27B-oQ3-mtp

## Resumen

El modelo `Qwen3.8-27B-oQ3-mtp`, publicado por el usuario d9beuD en HuggingFace, es una cuantización de 3 bits de un modelo de la familia Qwen3.5 (etiquetado como `qwen3_5`), realizada con la herramienta oQ de oMLX (v0.6.0.dev1) en formato MLX safetensors. A pesar del nombre que sugiere 27 mil millones de parámetros, los pesos reales del archivo safetensors suman 4.132.206.832 parámetros (aproximadamente 4,1 mil millones), lo que indica una discrepancia entre la denominación del repositorio y el contenido real.

La cuantización emplea precisión mixta de 3 bits con un tamaño de grupo de 64, lo que reduce significativamente el espacio en disco (13,8 GB) y la memoria necesaria para la inferencia en comparación con el modelo original. Está diseñado específicamente para ejecutarse con la librería MLX en hardware Apple Silicon, aprovechando el ecosistema de aceleración nativa de Apple. Este tipo de cuantización resulta relevante para desarrolladores que necesitan desplegar modelos de razonamiento en dispositivos con recursos limitados, como MacBooks o Mac Studios, sin renunciar a una calidad aceptable.

La ficha se basa únicamente en la información proporcionada en la model card y en los metadatos del repositorio. No se dispone de detalles sobre el modelo original, su entrenamiento, capacidades específicas ni licencia, por lo que muchos campos se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según etiquetas del repositorio) |
| Parametros totales | 4.132.206.832 (~4,1 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3 bits, group size 64, precisión mixta (oQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente se identifica como `qwen3_5` según las etiquetas del repositorio, lo que sugiere que se trata de una variante de la serie Qwen3.5, aunque no se especifica si es un transformer denso, MoE o híbrido. No se proporciona información sobre el modelo original, su número de capas, dimensiones de atención ni otros detalles arquitectónicos.

El proceso de cuantización se realizó con oQ, la herramienta de cuantización de oMLX (v0.6.0.dev1), que aplica precisión mixta: asigna 3 bits a la mayoría de los pesos con un tamaño de grupo de 64, lo que permite reducir el tamaño del modelo manteniendo un equilibrio entre compresión y calidad. No se mencionan datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación (RLHF, DPO, etc.), ya que esta ficha corresponde exclusivamente a un artefacto cuantizado, no al modelo base.

## Capacidades

No se han publicado capacidades específicas para este modelo cuantizado en la información disponible. Al tratarse de una cuantización de un modelo Qwen3.5, se espera que herede las capacidades generales del modelo original (generación de texto, razonamiento, posiblemente código y matemáticas), pero no hay confirmación oficial.

- Generación de texto: presumiblemente disponible, aunque sin datos concretos.
- Razonamiento y matemáticas: no confirmado para esta cuantización.
- Soporte de tool calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Otras capacidades (visión, audio, etc.): no disponible.

Dado que no se proporcionan detalles, cualquier afirmación sobre capacidades sería especulativa y se omite.

## Casos de uso

Al carecer de información sobre el modelo base, los casos de uso se plantean de forma genérica y condicionada a la validación previa del comportamiento del modelo cuantizado.

- Inferencia local en Apple Silicon: al estar en formato MLX y cuantizado a 3 bits, el modelo puede ejecutarse en Macs con chip M-series mediante la librería MLX, reduciendo la huella de memoria respecto a la versión completa.
- Prototipado de aplicaciones de chat o generación de texto en entornos con recursos limitados: la cuantización permite cargar el modelo en dispositivos con menos RAM unificada.
- Evaluación de la degradación por cuantización: útil para investigadores que estudian el impacto de la cuantización de 3 bits en modelos de razonamiento.
- Despliegue en entornos edge o embebidos con aceleración MLX: aunque requiere hardware Apple, puede servir para aplicaciones offline en ese ecosistema.
- Pruebas de compatibilidad con oMLX y oQ: como ejemplo de cuantización de 3 bits, puede usarse para validar el flujo de trabajo de cuantización y despliegue.
- Benchmarking de rendimiento en tareas de generación de texto con modelos cuantizados a baja precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otras pruebas estándar para este modelo cuantizado ni para el modelo original.

## Requisitos de hardware

No se especifican requisitos de hardware en la model card. Dado el formato MLX y el tamaño de 13,8 GB en disco, se puede estimar lo siguiente:

- VRAM estimada para inferencia: aproximadamente 4-6 GB de memoria unificada en Apple Silicon, considerando la cuantización de 3 bits y el tamaño de los pesos (4,1B parámetros × 3 bits ≈ 1,5 GB de pesos, más overhead de activaciones y caché KV). Sin embargo, este cálculo es orientativo y no está confirmado.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3, M4) con al menos 8 GB de RAM unificada; se recomienda 16 GB para mayor comodidad.
- Compatibilidad con GPU de consumo: no aplicable, ya que MLX está diseñado exclusivamente para hardware Apple.
- Opciones de despliegue: la librería MLX (https://github.com/ml-explore/mlx) y oMLX (https://github.com/jundot/omlx) son las vías principales. No se mencionan vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo formato (cuantización 3-bit MLX de Qwen3.5). Sin datos sobre el modelo base, no es posible establecer comparaciones fiables con otras alternativas. Se indica "no disponible".

## Limitaciones y advertencias

- La cuantización de 3 bits puede provocar una degradación notable en la calidad de generación, especialmente en tareas de razonamiento complejo o matemáticas, en comparación con el modelo original.
- El nombre del repositorio ("27B") no coincide con el número real de parámetros (4,1B), lo que puede generar confusión al evaluar el modelo.
- No se dispone de licencia especificada, por lo que no se garantiza su uso comercial. Se debe contactar con el autor o verificar la licencia del modelo base (Qwen3.5) antes de cualquier despliegue en producción.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas del modelo original.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es compatible con CUDA, ROCm u otros entornos.
- No se han publicado resultados de evaluación, por lo que el comportamiento real en tareas específicas es desconocido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/d9beuD/Qwen3.8-27B-oQ3-mtp
- Repositorio de oQ (oMLX): https://github.com/jundot/omlx
- Librería MLX: https://github.com/ml-explore/mlx
