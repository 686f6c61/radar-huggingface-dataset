# Sanorian/Mistral-7B-4bit-1C

## Resumen

Mistral-7B-4bit-1C es un ajuste fino (fine-tune) del modelo mistralai/Mistral-7B-Instruct-v0.3, publicado por el desarrollador Sanorian (Krainov Aleksandr Vitalievich, fullstack/ML). El modelo parte de los pesos del Mistral 7B Instruct v0.3 y se ha reentrenado sobre una muestra de aproximadamente 3000 lineas extraidas de dos datasets centrados en el ecosistema 1C: kavlab/Spider-1C y leongl/1c_github. El resultado se distribuye ya cuantizado a 4 bits en formato MLX, el framework de Apple para inferencia en silicio propio.

El objetivo declarado es disponer de un LLM especializado en el dominio 1C (plataforma ERP/contabilidad ampliamente usada en Rusia) capaz de ejecutarse localmente en un portatil Apple. Segun el autor, el entrenamiento se realizo en un MacBook M5 Air, lo que situa el proyecto en la categoria de fine-tuning de bajo coste sobre hardware de consumo, con la cuantizacion de 4 bits como mecanismo para reducir el peso del repositorio a 4,1 GB.

Su relevancia es limitada y muy de nicho: se trata de un experimento con 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados, sin licencia declarada y sin documentacion de hiperparametros. Resulta interesante como caso de estudio de adaptacion de dominio sobre MLX, pero no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (arquitectura Mistral 7B, heredada del modelo base) |
| Parametros totales | 7.248.023.552 (≈7,25 mil millones) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la ficha del autor; el modelo base Mistral-7B-Instruct-v0.3 soporta 32.768 tokens |
| Tipos de cuantizacion | 4-bit en formato MLX (tamano de grupo no especificado). No se publican otras variantes |
| Idiomas soportados | en, ru |
| Licencia | No disponible |
| Formato de pesos | safetensors (MLX), repositorio de 4,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Mistral-7B-Instruct-v0.3: un transformer decoder denso de aproximadamente 7.250 millones de parametros, con atencion de ventana deslizante (sliding window attention), grouped-query attention (GQA), embeddings rotatorios (RoPE), activacion SwiGLU y normalizacion RMSNorm. El vocabulario de la version 0.3 se amplio respecto a versiones anteriores para incorporar soporte nativo de function calling. No se documenta ninguna modificacion estructural introducida por el autor: el repositorio se presenta como un fine-tune de los pesos base seguido de cuantizacion a 4 bits con MLX.

El entrenamiento consiste en un ajuste sobre una muestra de aproximadamente 3000 lineas procedentes de dos fuentes: kavlab/Spider-1C (orientado a consultas y esquemas) y leongl/1c_github (codigo del repositorio 1C). No se especifican el numero de tokens totales, la composicion exacta del dataset, la receta de ajuste (LoRA, QLoRA o ajuste completo), los hiperparametros, el numero de epocas ni si se aplicaron fases de RLHF o DPO. Tampoco se describe ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal u otras). El unico dato de infraestructura aportado es que el entrenamiento se ejecuto en un MacBook M5 Air.

## Capacidades

- Generacion de texto conversacional en ingles y ruso, heredada del modelo base.
- Generacion y explicacion de codigo 1C (lenguaje de la plataforma 1C:Enterprise), presumiblemente reforzada por el ajuste sobre leongl/1c_github.
- Generacion de consultas sobre esquemas/consultas tipo Spider, segun el dataset kavlab/Spider-1C.
- Razonamiento multi-turno dentro de la ventana de contexto del modelo base (hasta 32.768 tokens, no confirmado en la ficha del autor).
- Soporte de tool calling / function calling: el modelo base Mistral-7B-Instruct-v0.3 lo documenta, pero no hay verificacion de que este fine-tune lo conserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este fine-tune.
- Capacidades multilingues: limitadas a los idiomas declarados (en, ru); no hay evidencia de retencion de otros idiomas del modelo base.
- Capacidades especiales (modo pensamiento, vision, audio): ninguna. Es un modelo exclusivamente de texto.

## Casos de uso

- Asistencia a desarrolladores de 1C:Enterprise: generar y explicar fragmentos de codigo 1C y consultas del lenguaje de consultas de la plataforma, aprovechando el ajuste sobre codigo real de repositorios 1C. Adecuado por la especializacion de dominio, aunque el volumen de entrenamiento (3000 lineas) obliga a validar cada salida.
- Migracion y refactorizacion de modulos 1C: dado un fragmento heredado, proponer una version refactorizada o adaptada a una version mas reciente de la plataforma. Util como primer borrador dentro de un flujo con revision humana obligatoria.
- Soporte tecnico interno en ruso: responder dudas de desarrolladores o consultores funcionales en ruso sobre construcciones habituales de 1C, con despliegue local que evita enviar codigo propietario a servicios en la nube.
- Generacion de consultas sobre esquemas de datos: a partir de la descripcion de un esquema, producir la consulta correspondiente, en la linea del dataset Spider-1C. Encaja en herramientas internas de exploracion de datos.
- Prototipado de asistentes conversacionales bilingues en/ru: servir como motor de un chatbot experimental en ingles o ruso sobre MLX, sin coste de API.
- Documentacion tecnica y comentarios de codigo en ruso: generar docstrings y comentarios para modulos 1C poco documentados, como paso previo a la revision por parte del equipo.
- Etiquetado y preprocesado de corpus de codigo 1C: usar el modelo para clasificar o anotar fragmentos de codigo en pipelines de datos, siempre con verificacion posterior.
- Investigacion sobre fine-tuning en Apple Silicon: reproducir o estudiar la receta (fine-tune + cuantizacion 4-bit MLX sobre un MacBook) como referencia metodologica de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye ninguna evaluacion (MMLU, HumanEval, GSM8K ni metricas de dominio 1C), y la busqueda web realizada no ha devuelto resultados tecnicos relevantes sobre este modelo.

## Requisitos de hardware

- VRAM/memoria para inferencia en 4-bit: los pesos ocupan aproximadamente 3,6-4,1 GB (el repositorio completo pesa 4,1 GB). Con cache KV para contextos moderados, se necesita del orden de 5-6 GB de memoria unificada.
- Referencia en precision completa (FP16) del modelo base: aproximadamente 14,5 GB de pesos, mas overhead de cache, lo que exigiria del orden de 16-18 GB de VRAM.
- Compatibilidad con GPU de consumo: si, en el caso de las GPUs NVIDIA con 8 GB o mas (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090) siempre que se convierta el modelo a GGUF; en Apple Silicon, cualquier equipo con 16 GB de memoria unificada o mas.
- GPU profesionales: A100, H100 o L40S pueden ejecutar el modelo base sin problemas, pero sobredimensionadas para un modelo de 7B en 4 bits.
- Opciones de despliegue: MLX (mlx-lm, mlx_lm.server, LM Studio) es la via nativa, exclusiva de Apple Silicon. En GPU NVIDIA solo es viable tras convertir los pesos a GGUF y usar llama.cpp u Ollama. vLLM y TGI no consumen pesos MLX directamente; requeririan descuantizar o reconvertir el modelo.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Idiomas |
|---|---|---|---|---|---|
| Mistral-7B-4bit-1C (este modelo) | 7,25 B | No disponible (base: 32.768) | No disponible | safetensors (MLX 4-bit) | en, ru |
| mistralai/Mistral-7B-Instruct-v0.3 (base) | 7,25 B | 32.768 | Apache 2.0 | safetensors | Ingles y varias lenguas europeas |
| Qwen2.5-7B-Instruct | ≈7,6 B | 32.768 (ampliable) | Apache 2.0 | safetensors, GGUF, MLX | Multilingue amplio |
| Llama-3.1-8B-Instruct | ≈8,0 B | 128.000 | Licencia comunitaria Llama 3.1 | safetensors, GGUF | Multilingue |

No hay datos de benchmarks publicados para el modelo objeto de la ficha, por lo que la comparacion se limita a parametros, contexto, licencia, formatos y disponibilidad. En el nicho especifico de 1C no se han identificado alternativas publicas comparables en la informacion disponible.

## Limitaciones y advertencias

- Dataset de ajuste muy reducido: aproximadamente 3000 lineas. Es un volumen insuficiente para un ajuste de dominio robusto y eleva el riesgo de sobreajuste y de olvido catastrofico (perdida de capacidades generales del modelo base).
- Sin evaluacion: no hay benchmarks ni validacion humana publicada. No existen evidencias de que el ajuste mejore el rendimiento del modelo base en tareas de 1C.
- Licencia no declarada: la ficha no especifica licencia. Aunque el modelo base Mistral-7B-Instruct-v0.3 se distribuye bajo Apache 2.0, la ausencia de licencia en este repositorio genera incertidumbre juridica para uso comercial. Antes de cualquier uso en produccion conviene contactar con el autor.
- Soporte de idiomas limitado: solo se declaran en y ru. No hay garantia de funcionamiento correcto en castellano ni en otras lenguas del modelo base.
- Riesgo de alucinacion: elevado en un modelo de 7B ajustado con pocos datos y en tareas de generacion de codigo o consultas, donde una API o funcion inexistente puede parecer plausible. Toda salida de codigo 1C requiere revision y ejecucion en un entorno de pruebas.
- Restriccion de plataforma: los pesos estan en formato MLX 4-bit, ejecutable de forma nativa unicamente en Apple Silicon. En otros entornos hay que convertir el modelo, con posible perdida de calidad adicional por recuantizacion.
- Sin adopcion ni mantenimiento verificables: 0 descargas, 0 likes, una unica publicacion sin actualizaciones conocidas. No hay garantia de soporte, correcciones ni soporte de la comunidad.
- Idiomas y dominio sesgados: los datasets de origen estan vinculados al ecosistema 1C y a contenido mayoritariamente en ruso, lo que puede introducir sesgos de dominio y terminologia.
- Datos de entrenamiento no documentados: se desconoce la composicion exacta del corpus, los hiperparametros y si hubo fases de alineacion. La reproducibilidad del resultado es baja.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sanorian/Mistral-7B-4bit-1C
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Dataset kavlab/Spider-1C: https://huggingface.co/datasets/kavlab/Spider-1C
- Dataset leongl/1c_github: https://huggingface.co/datasets/leongl/1c_github
- MLX LM (framework de inferencia): https://github.com/ml-explore/mlx-lm
- Nota: la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo; los unicos enlaces recuperados no guardan relacion con el y se omiten.
