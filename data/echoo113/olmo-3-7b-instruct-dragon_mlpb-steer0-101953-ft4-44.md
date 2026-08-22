# Echoo113/Olmo-3-7B-Instruct-dragon_mlpB-STEER0.101953-ft4.44

## Resumen

Olmo-3-7B-Instruct-dragon_mlpB-STEER0.101953-ft4.44 es un fine-tuning experimental del modelo allenai/Olmo-3-7B-Instruct, publicado por el usuario Echoo113 en Hugging Face. El nombre del checkpoint sugiere que se trata de un experimento de *steering* de activaciones (STEER con valor 0.101953) aplicado a la subcapa MLP-B de la arquitectura, seguido de un fine-tuning adicional de 4.44 pasos (o épocas). Este tipo de intervenciones busca modificar el comportamiento del modelo de forma controlada, alterando direcciones específicas del espacio de activaciones.

El modelo parte de la familia Olmo 3 de Ai2, un conjunto de modelos de lenguaje abiertos y de alta calidad que incluye versiones base, instruct y thinking. El checkpoint base (Olmo-3-7B-Instruct) tiene 7.000 millones de parámetros, soporta una ventana de contexto de 64K tokens y obtiene resultados destacados en tareas de razonamiento, código y diálogo. Este fine-tune concreto no presenta métricas publicadas ni documentación técnica más allá de la generada automáticamente por el entrenador de TRL, por lo que su valor real como modelo de producción es limitado y debe evaluarse de forma independiente.

La relevancia de este checkpoint radica en su carácter experimental: explora cómo la modificación de activaciones internas (steering) puede combinarse con fine-tuning supervisado para ajustar el comportamiento del modelo. Sin embargo, al no publicar datos de evaluación ni descripción metodológica detallada, su utilidad práctica para desarrolladores e investigadores queda restringida a la experimentación local y a la comparación con el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Olmo-3-7B-Instruct) |
| Parametros totales | 7.000 millones (aprox., heredado de la base) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 64.000 tokens (heredado de la base) |
| Tipos de cuantizacion | no disponible (repo en safetensors de precision FP32/BF16) |
| Idiomas soportados | no disponible (heredado de la base; Olmo 3 soporta principalmente ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) del checkpoint allenai/Olmo-3-7B-Instruct. La arquitectura subyacente corresponde a un transformer decoder-only con aproximadamente 7.000 millones de parámetros, entrenado originalmente por el Allen Institute for AI (Ai2) con un pipeline completo que incluye pre-entrenamiento, mid-training para extension de contexto y fases de instrucción (SFT, DPO y RL). El fine-tuning de Echoo113 se realizó con la librería TRL (versión 0.19.1) y Transformers 4.57.6, sin que se especifique el dataset utilizado ni el número de pasos totales.

La etiqueta "dragon_mlpB-STEER0.101953" sugiere que el proceso incluyó una intervención sobre la subcapa MLP-B del transformer con un coeficiente de steering de aproximadamente 0,102. En la literatura de interpretabilidad, el steering de activaciones consiste en sumar un vector de dirección aprendido a las activaciones internas durante la inferencia, con el objetivo de modificar atributos de comportamiento (tono, estilo, contenido) sin reentrenar el modelo. No se especifica si el steering se aplicó durante la generación, durante el entrenamiento o en ambos momentos.

El entrenamiento se realizó con PyTorch 2.11.0 y CUDA 12.8, y los pesos se guardaron en formato safetensors. No se proporciona información sobre el dataset de entrenamiento, el número de tokens procesados ni la duración del fine-tuning. El repositorio ocupa 0,3 GB, lo que sugiere que puede tratarse de un checkpoint con pesos en BF16 o de una parte del modelo.

## Capacidades

- Generación de texto conversacional: hereda las capacidades del modelo base Olmo-3-7B-Instruct, que incluye instrucciones de diálogo multi-turno.
- Razonamiento lógico y matemático: el modelo base alcanza MMLU 76 y HumanEval 67, por lo que este fine-tuning debería conservar buena parte de esas capacidades, aunque sin verificación publicada.
- Soporte de contexto largo: hasta 64.000 tokens, lo que permite manejar documentos extensos o conversaciones multi-turno largas.
- Tool calling: el modelo base Olmo-3-7B-Instruct soporta function calling, aunque no se ha verificado si este fine-tuning la mantiene intacta.
- Capacidades multilingües: no documentadas para este checkpoint; el modelo base de Olmo 3 está orientado principalmente al inglés.
- Modo thinking: la familia Olmo 3 incluye variantes "Thinking" con razonamiento explícito, pero esta es una versión instruct sin ese modo.

## Casos de uso

- Experimentación en interpretabilidad: el checkpoint es útil para investigadores que estudian el efecto del steering de activaciones sobre un modelo instructivo. Permite comparar las respuestas con y sin la intervención STEEL, midiendo el impacto en la alineación y el estilo.
- Prototipado de sistemas de diálogo con personalidad ajustada: dado que el steering se aplica sobre la MLP, podría emplearse para explorar cómo alterar el tono o el comportamiento del asistente en aplicaciones de chat experimental.
- Evaluación de técnicas de control de activaciones: sirve como banco de pruebas para comparar la eficacia de STEEL frente a métodos de fine-tuning convencional sobre el mismo modelo base.
- Benchmarking de calidad tras fine-tuning experimental: se puede evaluar si la intervención STEEL degrada o mejora las capacidades del modelo base en tareas estándar (MMLU, HumanEval, GSM8K) para cuantificar el coste del steering.
- Análisis de robustez: útil para estudiar si la intervención sobre la MLP-B introduce vulnerabilidades o sesgos adicionales respecto al modelo base.
- Generación de código en entornos controlados: aunque no hay garantías, si conserva las capacidades de código del base, podría usarse en pipelines de generación asistida con supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El checkpoint no incluye métricas de evaluación propias. Los datos de rendimiento del modelo base (MMLU 76, HumanEval 67) provienen de fuentes externas y no pueden atribuirse a este fine-tuning.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 14-16 GB para el modelo completo de 7B con contexto estándar; con cuantización a 8 bits se reduce a unos 8 GB, y a 4 bits a unos 4-5 GB.
- GPU recomendadas: una RTX 4090 (24 GB) o una A100 (40/80 GB) para ejecutar el modelo en BF16 con contexto largo de 64K sin desbordamiento.
- En consumer GPU: cabe en una RTX 3090 o 4090 con cuantización a 4-bit (por ejemplo, con bitsandbytes o GPTQ) para generación de hasta 2-4K tokens.
- Opciones de despliegue: el formato safetensors permite su uso con Transformers, vLLM, TGI y llama.cpp (si se convierte a GGUF).
- Latencia estimada: no disponible, depende del hardware y del backend; en una A100, un modelo 7B en BF16 genera aproximadamente 20-40 tokens/s con vLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | HumanEval | Licencia |
|---|---|---|---|---|---|
| Echoo113/Olmo-3-7B-Instruct-dragon_mlpB-STEER0.101953-ft4.44 | 7B | 64K | no disponible | no disponible | no disponible |
| allenai/Olmo-3-7B-Instruct | 7B | 64K | 76 | 67 | Apache 2.0 |
| Meta-Llama-3.1-8B-Instruct | 8B | 128K | 68 | 72 | Llama 3.1 Community License |
| Mistral-7B-Instruct-v0.3 | 7B | 32K | 60 | 30 | Apache 2.0 |

La comparativa se basa en los datos del modelo base y de modelos populares de tamaño similar. Este checkpoint no ofrece métricas propias, por lo que la comparación es orientativa y no debe usarse para tomar decisiones de selección.

## Limitaciones y advertencias

- No existe documentación técnica del fine-tuning: no se especifica el dataset, el procedimiento de steering ni los objetivos del entrenamiento, lo que impide reproducir o evaluar el modelo de forma rigurosa.
- Riesgo de alucinación: el modelo base ya presenta cierta tendencia a inventar información en tareas de conocimiento; el fine-tuning experimental no ha sido evaluado para cuantificar este riesgo.
- Licencia no determinada: el modelo no declara licencia explícita; aunque el modelo base es Apache 2.0, el checkpoint derivado puede tener restricciones adicionales. No se recomienda uso comercial sin aclaración legal.
- Sin garantía de compatibilidad con tool calling: no se ha verificado que el fine-tuning conserve las capacidades de function calling del modelo base.
- Idioma principal: el modelo está pensado para inglés; el rendimiento en español y otros idiomas no está validado.
- Tamaño del repo reducido (0,3 GB): sugiere que los pesos podrían estar en BF16 o que el modelo no incluye el tokenizer ni configuraciones completas; se recomienda descargar también el checkpoint base para asegurar la compatibilidad.
- Proyecto de investigación sin mantenimiento: el autor no ofrece soporte, y el checkpoint no tiene descargas ni validación por parte de la comunidad.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/Echoo113/Olmo-3-7B-Instruct-dragon_mlpB-STEER0.101953-ft4.44
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Instruct
- Página oficial de Olmo 3 de Ai2: https://allenai.org/olmo
- Documentación de Open Instruct de Ai2 sobre Olmo 3: https://allenai.github.io/open-instruct/olmo3/
- Ficha de Olmo-3-7B-Instruct en OpenModelMap: https://openmodelmap.com/model/allenai/Olmo-3-7B-Instruct
- Repositorio TRL: https://github.com/huggingface/trl
