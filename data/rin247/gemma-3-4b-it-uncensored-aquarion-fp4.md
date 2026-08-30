# Rin247/gemma-3-4b-it-Uncensored-Aquarion-FP4

## Resumen

El modelo `Rin247/gemma-3-4b-it-Uncensored-Aquarion-FP4` es una cuantizacion FP4 (weight-only) del modelo base `gemma-3-4b-it` de Google, modificado mediante una tecnica de "abliteracion" (abliteration) que elimina la direccion de rechazo (refusal direction) del modelo original. El resultado es una version "sin censura" que no aplica los filtros de seguridad habituales de Gemma 3, manteniendo las capacidades de generacion de texto del modelo base. Lo desarrolla el usuario Rin247 como parte de un proyecto denominado "Aquarion Forge", que aplica proyeccion ortogonal sobre los pesos para eliminar el comportamiento de rechazo antes de la cuantizacion.

El modelo esta pensado para desarrolladores e investigadores que necesitan un LLM pequeno (alrededor de 2,5 mil millones de parametros efectivos en el archivo cuantizado) con inferencia ligera y sin restricciones de contenido. La cuantizacion FP4 reduce el tamano del modelo a 3,4 GB, lo que permite ejecutarlo en GPUs de consumo con poca VRAM. Su relevancia radica en combinar la arquitectura moderna de Gemma 3 con una capa de "uncensoring" que amplia los casos de uso creativos y de investigacion, aunque esto conlleva riesgos importantes de abuso y alucinacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3, base `gemma-3-4b-it`) |
| Parametros totales | 2.490.222.960 (en el archivo safetensors cuantizado; el modelo base declara 4B, pero la cuantizacion FP4 reduce el conteo de parametros almacenados) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (hereda de Gemma 3, pero no se especifica en la ficha) |
| Tipos de cuantizacion | FP4 (weight-only, con escalas almacenadas por separado) |
| Idiomas soportados | no disponible (hereda los idiomas de Gemma 3, pero no se listan en la ficha) |
| Licencia | no disponible |
| Formato de pesos | safetensors (con buffers `*.weight_scale` y `*.weight_shape` para de cuantizacion) |

## Arquitectura y entrenamiento

El modelo parte de `gemma-3-4b-it`, un transformer autoregresivo con atencion por ventanas deslizantes y capacidades multilingues, aunque no se proporcionan detalles especificos de la arquitectura en la informacion disponible. La modificacion principal es la abliteracion: mediante proyeccion ortogonal, se identifica la direccion del vector de rechazo en el espacio de activaciones y se proyecta fuera de los pesos, eliminando asi la tendencia del modelo a negarse a responder a ciertas peticiones. Este proceso se realiza antes de la cuantizacion FP4, que utiliza cuantizacion round-to-nearest (RTN) en CPU, almacenando las escalas junto a los pesos. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO; el modelo base ya incorpora el ajuste instructivo de Gemma 3, pero la abliteracion no implica un reentrenamiento, sino una modificacion de pesos.

## Capacidades

- Generacion de texto libre sin filtros de contenido: responde a peticiones que el modelo base rechazaria por politica de seguridad.
- Razonamiento y conversacion multi-turno, herencia de Gemma 3.
- Generacion de codigo y soporte basico de programacion, aunque no se especifican capacidades avanzadas de tool calling.
- Capacidades multilingues heredadas de Gemma 3 (no se lista el conjunto exacto de idiomas).
- No se indica soporte de vision, audio ni modo "thinking" en esta cuantizacion.
- La cuantizacion FP4 puede degradar ligeramente la calidad de generacion frente al modelo en precision completa.

## Casos de uso

- Investigacion sobre seguridad y alineacion de modelos: permite estudiar el comportamiento de un modelo sin capas de rechazo, comparando respuestas con el modelo original para analizar sesgos y riesgos.
- Generacion de contenido creativo sin restricciones: escritura de ficcion, poesia, guiones o dialogos que aborden temas tabu o controvertidos, donde el filtro del modelo base limitaria la creatividad.
- Pruebas de robustez y jailbreak: evaluar hasta que punto la abliteracion elimina realmente las barreras de seguridad, util para equipos de red teaming.
- Prototipado rapido de asistentes conversacionales con personalidad libre: integrar el modelo en chatbots que requieran respuestas sin censura, por ejemplo en entornos de rol o simulacion.
- Educacion y divulgacion sobre LLMs: demostrar en clase o talleres como funciona la cuantizacion FP4 y la abliteracion, usando un modelo pequeno que cabe en una GPU de consumo.
- Despliegue en entornos con recursos limitados: al pesar solo 3,4 GB, puede ejecutarse en laptops con GPU de 8 GB o menos, ideal para demos offline o aplicaciones edge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas para esta cuantizacion especifica. Se desconoce como se compara con el modelo base `gemma-3-4b-it` en tareas estandar tras la abliteracion y cuantizacion FP4.

## Requisitos de hardware

- VRAM estimada: al ser FP4 weight-only con 2,49 mil millones de parametros, el modelo ocupa unos 2,5 GB en memoria de pesos, mas overhead de activaciones y escalas. Se estima un minimo de 4-6 GB de VRAM para inferencia a baja velocidad, y 8 GB para un rendimiento comodo.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM, como NVIDIA RTX 3060/4060, RTX 4070, o GPUs de datacenter como A10 o T4. No requiere hardware especializado.
- Si cabe en consumer GPU: si, en GPUs de gama media y alta de consumo.
- Opciones de despliegue: al ser un formato safetensors con cuantizacion FP4 personalizada, no es compatible directamente con vLLM, llama.cpp u Ollama sin una conversion previa. Se necesita un backend que soporte la receta de cuantizacion (decuantizacion con escalas y shapes). El autor indica que hay que "dequantize with the matching scale/shape buffers before feeding to an inference engine", lo que sugiere un flujo de conversion manual.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Existen otras versiones "uncensored" de Gemma 3 4B, como `Nidum-Gemma-3-4B-it-Uncensored` y su variante GGUF (`nidumai/nidum-gemma-3-4b-it-uncensored`). Estas se basan en el mismo modelo base y aplican tecnicas similares de eliminacion de rechazo, pero se distribuyen en formato GGUF, lo que permite usarlas directamente con Ollama y llama.cpp. La version de Rin247 se diferencia por usar FP4 weight-only en safetensors, un formato menos estandar que requiere conversion manual. No se dispone de datos de rendimiento ni licencias para comparar objetivamente.

| Modelo | Formato | Tamano | Metodo de uncensoring | Compatibilidad |
|---|---|---|---|---|
| Rin247/gemma-3-4b-it-Uncensored-Aquarion-FP4 | safetensors FP4 | 2,49B params / 3,4 GB | Abliteracion por proyeccion ortogonal | Requiere conversion manual |
| Nidum-Gemma-3-4B-it-Uncensored | safetensors (precision completa) | no disponible | Abliteracion | Directa con transformers |
| Nidum-Gemma-3-4B-it-Uncensored-GGUF | GGUF (varias cuantizaciones) | no disponible | Abliteracion | Ollama, llama.cpp, etc. |

## Limitaciones y advertencias

- Al ser un modelo "uncensored", puede generar contenido ofensivo, ilegal, peligroso o sexualmente explicito sin restricciones. Su uso en produccion requiere politicas de moderacion externas y es responsable legalmente de cualquier abuso.
- La abliteracion no elimina los sesgos del modelo base; puede amplificarlos al no existir filtros de seguridad.
- Riesgo de alucinacion: el modelo puede inventar hechos, citas o datos con alta confianza, especialmente en temas delicados.
- La cuantizacion FP4 degrada la calidad de las respuestas en comparacion con el modelo en bf16 o fp16; se puede notar perdida de coherencia en tareas complejas.
- No se especifica la licencia: el modelo base Gemma 3 tiene su propia licencia (Gemma Terms of Use), pero la version modificada no declara una. Antes de usarlo comercialmente, hay que verificar los terminos legales de Google y del autor.
- La falta de informacion sobre el contexto maximo, idiomas soportados y detalles de entrenamiento limita su uso en aplicaciones que requieran garantias tecnicas.
- El formato FP4 personalizado no es compatible con la mayoria de motores de inferencia estandar; la conversion manual puede introducir errores de cuantizacion adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rin247/gemma-3-4b-it-Uncensored-Aquarion-FP4
- Referencia del modelo base Gemma 3: no disponible en la informacion proporcionada
- Modelo similar Nidum (safetensors): https://huggingface.co/nidum/Nidum-Gemma-3-4B-it-Uncensored
- Modelo similar Nidum (GGUF): https://huggingface.co/nidum/Nidum-Gemma-3-4B-it-Uncensored-GGUF
- Repositorio Ollama de Nidum: https://ollama.com/nidumai/nidum-gemma-3-4b-it-uncensored
