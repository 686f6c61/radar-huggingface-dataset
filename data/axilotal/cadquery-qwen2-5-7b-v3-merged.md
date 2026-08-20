# Axilotal/cadquery-qwen2.5-7b-v3-merged

## Resumen

El modelo `Axilotal/cadquery-qwen2.5-7b-v3-merged` es un fine-tune del modelo base `unsloth/qwen2.5-coder-7b-instruct-bnb-4bit`, que a su vez es una versión cuantizada a 4 bits de Qwen2.5 Coder 7B Instruct. El nombre del repositorio sugiere que el modelo está especializado en la generación de código para CadQuery, una librería de Python para modelado 3D paramétrico. Sin embargo, la model card apenas contiene información: la mayoría de los campos están marcados como "[More Information Needed]". El repositorio tiene un tamaño de 0.2 GB, lo que indica que probablemente contiene solo los pesos del adaptador LoRA fusionado o una versión compacta, no el modelo completo de 7B.

El modelo fue creado por el usuario Axilotal y publicado en HuggingFace el 20 de agosto de 2026. No se especifican licencia, idiomas soportados ni detalles de entrenamiento. A pesar de la falta de documentación, el modelo podría ser útil para desarrolladores que trabajen con CadQuery, aunque se recomienda precaución debido a la ausencia de información verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 7.000 millones (del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo pesa 0.2 GB, posiblemente solo adaptador) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (segun tags) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen2.5 Coder 7B Instruct, un transformer decoder-only con atención de consultas agrupadas (GQA) y ventana de contexto de 128.000 tokens en su versión original. El modelo base fue cuantizado a 4 bits mediante bitsandbytes (bnb-4bit) por Unsloth para facilitar el fine-tune. Sobre esta base, se aplicó un adaptador LoRA (librería PEFT) para especializar el modelo en la generación de código CadQuery, según sugiere el nombre del repositorio. No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas como RLHF o DPO. El proceso de entrenamiento y los hiperparámetros no están documentados.

## Capacidades

- Generación de código Python, con posible especialización en scripts de CadQuery para modelado 3D paramétrico (inferido del nombre, no confirmado).
- Razonamiento y resolución de problemas de programación, heredados del modelo base Qwen2.5 Coder.
- Soporte de instrucciones en lenguaje natural para generar código (instruct fine-tune).
- Capacidades multilingües limitadas: el modelo base Qwen2.5 Coder está entrenado principalmente en inglés y chino, pero no se confirma para este fine-tune.
- No se documentan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Generación de scripts de CadQuery para piezas mecánicas: el modelo podría recibir una descripción en lenguaje natural de una pieza y generar el código Python correspondiente, acelerando el diseño paramétrico.
- Automatización de tareas de diseño CAD repetitivas: se podría integrar en pipelines de generación de modelos 3D para crear variantes de piezas a partir de parámetros.
- Asistencia en educación de diseño asistido por computadora: los estudiantes podrían usarlo para aprender a escribir código CadQuery a partir de ejemplos.
- Prototipado rápido en ingeniería: generar modelos 3D preliminares a partir de especificaciones textuales para validar conceptos.
- Generación de documentación técnica: el modelo podría explicar o comentar código CadQuery existente, facilitando el mantenimiento.
- Integración en entornos de desarrollo (IDE) como autocompletado de código especializado en CadQuery, si se despliega localmente con herramientas como Ollama o llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para este modelo específico.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 7B, se necesitan aproximadamente 4-6 GB de VRAM en cuantización de 4 bits, y 14-16 GB en precisión completa (fp16). Sin embargo, el repositorio de 0.2 GB sugiere que podría tratarse de un adaptador LoRA, que requiere cargar el modelo base por separado.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM (RTX 3060, RTX 4060, etc.) para cuantización 4-bit; para fp16 se recomienda una RTX 3090 o superior.
- Compatibilidad con GPU de consumo: sí, si se usa cuantización 4-bit o 8-bit, cabe en GPUs de gama media.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, HuggingFace TGI, o directamente con transformers y PEFT si se carga el adaptador.
- Latencia y throughput: no disponibles; dependerán del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| Axilotal/cadquery-qwen2.5-7b-v3-merged | 7B | No disponible | No disponible | CadQuery (presunta) |
| Qwen2.5 Coder 7B Instruct (base) | 7B | 128k | Apache 2.0 | Codigo general |
| CodeLlama 7B Instruct | 7B | 16k | Llama 2 license | Codigo general |
| DeepSeek Coder 7B Instruct | 7B | 16k | MIT | Codigo general |

La comparativa se basa en el modelo base, ya que no hay datos específicos del fine-tune. El modelo de Axilotal podría ofrecer una ventaja en tareas de CadQuery si el fine-tune fue efectivo, pero no hay evidencia pública que lo demuestre.

## Limitaciones y advertencias

- Documentación extremadamente escasa: la model card no proporciona información sobre entrenamiento, datos, licencia ni rendimiento.
- Riesgo de alucinación: al ser un modelo de código, puede generar scripts de CadQuery sintácticamente válidos pero funcionalmente incorrectos.
- Sesgos desconocidos: no se han documentado sesgos específicos, pero el modelo base puede reflejar sesgos de los datos de entrenamiento de Qwen2.5.
- Licencia incierta: no se especifica la licencia del fine-tune; el modelo base usa Apache 2.0, pero el adaptador podría tener otra.
- Tamaño del repositorio ambiguo: 0.2 GB sugiere que no contiene el modelo completo; es posible que se necesite descargar el modelo base por separado y cargar el adaptador.
- Sin garantías de producción: al no haber benchmarks ni pruebas, no se recomienda su uso en entornos críticos sin validación previa.

## Enlaces

- HuggingFace: https://huggingface.co/Axilotal/cadquery-qwen2.5-7b-v3-merged
- Modelo base (Unsloth): https://huggingface.co/unsloth/qwen2.5-coder-7b-instruct-bnb-4bit
- Documentación de Qwen2.5 Coder: https://qwenlm.github.io/blog/qwen2.5-coder/
