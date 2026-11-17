# dineshayyappan/Qwen3-4B-Medical

## Resumen

Qwen3-4B-Medical es un ajuste fino (fine-tune) del modelo Qwen3-4B-Instruct-2507 en su variante cuantizada a 4 bits para MLX, publicado por el usuario dineshayyappan en Hugging Face. Se trata de un modelo de generacion de texto de 4.022 millones de parametros orientado a dominio sanitario, derivado de la familia Qwen3 de Alibaba. La model card es minima: no documenta el dataset de ajuste, el proceso de entrenamiento ni resultados de evaluacion, por lo que la mayor parte de las especificaciones tecnicas deben inferirse del modelo base.

El interes practico radica en su formato: los pesos estan preparados para MLX (el framework de Apple para Apple Silicon), lo que permite ejecutar un modelo de 4B ajustado a un dominio concreto en equipos Mac con memoria unificada, sin necesidad de GPU dedicada. Al estar construido sobre una variante ya cuantizada a 4 bits, el repositorio ocupa 8,1 GB y esta pensado para inferencia local mas que para entrenamiento o despliegue en servidor.

La relevancia es limitada pero concreta: es un ejemplo de ajuste fino de dominio sobre Qwen3 en formato MLX con licencia Apache 2.0, lo que facilita su uso comercial y su inspeccion. No obstante, carece de documentacion sobre calidad, datos o sesgos, y registra cero descargas en el momento de redactar esta ficha, por lo que debe tratarse como un experimento del autor y no como un modelo validado para produccion clinica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B-Instruct-2507); no disponible el detalle exacto en la model card |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card (depende del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | 4 bits (pesos base en formato MLX); no se documentan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (library_name: mlx) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3-4B-Instruct-2507, un transformer denso de la familia Qwen3. El repositorio parte de la variante mlx-community/Qwen3-4B-Instruct-2507-4bit, es decir, una conversion a MLX con cuantizacion a 4 bits del modelo instruct original. Sobre esa base se ha realizado un ajuste fino adicional, presumiblemente con datos de dominio medico, aunque la model card no especifica el volumen de tokens, la composicion del dataset, la tecnica de ajuste (LoRA, QLoRA, full fine-tune) ni si hubo etapas de RLHF o DPO posteriores.

No se documenta ninguna innovacion tecnica propia del ajuste. Las capacidades de razonamiento, soporte multilingue y comportamiento conversacional provienen integramente del modelo base Qwen3-4B-Instruct-2507. El hecho de que los pesos se distribuyan ya cuantizados a 4 bits implica que el ajuste se aplico sobre pesos cuantizados o que se cuantizo despues; en cualquiera de los dos casos, no hay informacion sobre posibles perdidas de calidad asociadas a ese proceso.

## Capacidades

- Generacion de texto conversacional en formato chat, heredada del modelo instruct base.
- Razonamiento y respuesta a preguntas de dominio medico, presumiblemente el objetivo del ajuste fino, aunque sin evaluacion publicada que lo respalde.
- Generacion de codigo y matematicas basicas, como capacidad heredada de Qwen3-4B-Instruct-2507 (no verificada en esta variante).
- Soporte multilingue: no disponible; la model card no declara idiomas.
- Tool calling / function calling: no documentado en esta variante.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles.

## Casos de uso

- Prototipado local en Mac para asistentes de consulta medica: al estar en formato MLX, permite probar un chatbot de preguntas y respuestas sanitarias en un Mac con memoria unificada suficiente, sin infraestructura GPU.
- Experimentacion academica con ajuste fino de dominio: sirve como punto de partida para estudiar como un fine-tune sobre Qwen3-4B afecta al comportamiento en un dominio especializado, comparandolo con el modelo base.
- Generacion de resumenes de documentacion clinica en entornos de prueba: util para validar pipelines de procesamiento de textos medicos antes de invertir en modelos mayores, siempre con supervision humana.
- Evaluacion de cuantizacion a 4 bits en MLX: permite medir la degradacion de calidad frente al modelo base sin cuantizar en tareas de dominio, si se dispone del original para comparar.
- Base para instrucciones y ajustes posteriores: al ser Apache 2.0 y estar en safetensors, puede reutilizarse como punto de partida para nuevos fine-tunes o para destilacion.
- Demostraciones y material docente: adecuado para explicar el flujo completo de un fine-tune de dominio publicado en Hugging Face, desde el modelo base hasta el artefacto distribuible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: al estar cuantizado a 4 bits y pesar 8,1 GB el repositorio, la inferencia requiere aproximadamente 8-10 GB de memoria unificada o VRAM, incluyendo overhead de contexto.
- GPU Apple Silicon: cualquier Mac con al menos 16 GB de memoria unificada deberia poder cargarlo; 24 GB o mas ofrece margen para contextos largos.
- GPU NVIDIA: el formato MLX no es compatible de forma nativa con CUDA; para NVIDIA habria que reconvertir los pesos a otro formato (por ejemplo GGUF o safetensors estandar), y no se documenta ese proceso.
- Cabe en GPU de consumo: si, en el ecosistema Apple; en NVIDIA consumer (RTX 4090, 24 GB) cabria tras conversion, pero no esta soportado de serie.
- Opciones de despliegue: MLX (libreria mlx / mlx-lm) es la via documentada. vLLM, llama.cpp, Ollama y TGI no estan soportados directamente con estos pesos tal como se distribuyen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-Medical (este) | 4.022 M | no disponible | MLX 4 bits | Apache 2.0 | Fine-tune de dominio sin evaluacion publicada |
| Qwen3-4B-Instruct-2507 (base) | ~4.000 M | no disponible en esta ficha | safetensors, GGUF, MLX | Apache 2.0 | Modelo generalista de referencia; validado por la comunidad |
| mlx-community/Qwen3-4B-Instruct-2507-4bit | ~4.000 M | no disponible en esta ficha | MLX 4 bits | Apache 2.0 | Conversion oficial de la comunidad MLX, sin ajuste de dominio |

La comparacion relevante es con el modelo base: este fine-tune anade especializacion medica no verificada, pero pierde la validacion y el soporte de la comunidad del original. Frente a alternativas medicas de mayor tamano (por ejemplo, variantes de 7B-8B especializadas), este modelo ofrece menor huella de memoria a costa de capacidad y de falta de benchmarks.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion clinica, ni comparacion con el modelo base; no debe usarse en decisiones medicas sin validacion propia.
- Riesgo elevado de alucinacion en contenido sanitario: un fine-tune de dominio sin datos documentados puede generar afirmaciones medicas plausibles pero incorrectas.
- Model card Practicamente vacia: no se documentan datos de entrenamiento, hiperparametros, sesgos ni idiomas, lo que impide auditar el modelo.
- Cuantizacion a 4 bits: puede degradar la precision en tareas de razonamiento y en terminologia medica especializada.
- Compatibilidad limitada: el formato MLX restringe su uso a Apple Silicon; no hay pesos GGUF ni safetensors estandar publicados.
- Cero adopcion: sin descargas ni likes en el momento de redactar, no hay evidencia de uso en la comunidad.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad legal y regulatoria (por ejemplo, normativa de productos sanitarios o proteccion de datos) al desplegarlo.
- Idiomas no declarados: no hay garantia de calidad en castellano ni en otros idiomas distintos del que se uso en el ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dineshayyappan/Qwen3-4B-Medical
- Modelo base en Hugging Face: https://huggingface.co/mlx-community/Qwen3-4B-Instruct-2507-4bit
- Modelo Qwen3-4B-Instruct-2507 original: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/blob/main/LICENSE
