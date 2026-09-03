# gurujustin/affine-archive-king-r3-isomsom-Affine-5cw1mntrm4-tr2

## Resumen

Este repositorio contiene una copia de archivo sin modificaciones del modelo `isomsom/Affine-5cw1mntrm4-tr2`, una sumisión al subnet SN120 (Affine) de Bittensor. El modelo fue coronado como "king" de la temporada 3 el 31 de agosto de 2026, con un margen de +0.00304 y un z-score de 4.21 en los duelos de validación. El archivo se creó para preservar el checkpoint tras la posible eliminación del repositorio original.

Se trata de un modelo de lenguaje de tipo mixture of experts (MoE) basado en la arquitectura Qwen3.5, con 35.107.181.936 parámetros totales (aproximadamente 35B) y un tamaño de 70.2 GB en formato safetensors con precisión BF16. No se dispone de información pública sobre su licencia, idiomas soportados, longitud de contexto ni detalles de entrenamiento, ya que la model card original no incluye documentación técnica.

La relevancia de este modelo radica en su origen: es un checkpoint competitivo dentro del ecosistema de Bittensor, donde los modelos se evalúan mediante duelos automatizados. Su publicación como archivo permite a la comunidad acceder a un modelo que demostró un rendimiento destacado en la validación de SN120, aunque su uso fuera de ese contexto requiere verificación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (mixture of experts) |
| Parametros totales | 35.107.181.936 (~35B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de mixture of experts (MoE) basada en la familia Qwen3.5, según indica la etiqueta `qwen3_5_moe` en HuggingFace. Esto implica que solo una fracción de los parámetros totales se activa por token, lo que permite un equilibrio entre capacidad y eficiencia computacional. Sin embargo, no se ha publicado información sobre el número de expertos, la dimensión del hidden state, el número de capas ni el ratio de parámetros activos.

En cuanto al entrenamiento, no hay datos disponibles sobre el dataset utilizado, el número de tokens de entrenamiento, ni si se aplicaron técnicas como RLHF, DPO o instrucciones de ajuste fino. El modelo proviene de un entorno competitivo (Bittensor SN120) donde los participantes entrenan modelos para tareas de razonamiento y generación, pero los detalles específicos del proceso de entrenamiento no se han hecho públicos.

## Capacidades

No se dispone de información oficial sobre las capacidades específicas de este modelo. Dado que es un LLM MoE de 35B parámetros basado en Qwen3.5, se espera que tenga capacidades generales de generación de texto, razonamiento y posiblemente código, pero no hay documentación que lo confirme. Las siguientes capacidades son inferencias razonables basadas en la arquitectura, no datos verificados:

- Generación de texto y completado de secuencias.
- Razonamiento de varios pasos (chain-of-thought) probablemente soportado.
- Posible soporte de tool calling y function calling, común en modelos Qwen recientes.
- Capacidades multilingües probablemente presentes, pero sin confirmar.
- No se ha verificado soporte de visión, audio u otras modalidades.

## Casos de uso

Dado que no hay documentación oficial, los casos de uso son hipotéticos y requieren validación previa:

- Investigación en evaluación de modelos: este checkpoint puede usarse como referencia para estudiar el rendimiento de modelos MoE en tareas de razonamiento, comparándolo con otros modelos de tamaño similar.
- Desarrollo de aplicaciones de generación de texto: si se confirma su funcionamiento, podría integrarse en sistemas de chat o redacción asistida, aunque se recomienda probar su calidad antes de usarlo en producción.
- Experimentación con técnicas de cuantización: al tener pesos en BF16, se puede cuantizar a 8-bit o 4-bit para reducir requisitos de hardware y evaluar la pérdida de calidad.
- Análisis de modelos competitivos en Bittensor: investigadores interesados en el ecosistema SN120 pueden estudiar este checkpoint para entender qué características hacen que un modelo gane duelos de validación.
- Fine-tuning sobre dominios específicos: si se dispone de los recursos, el modelo puede ajustarse para tareas concretas, aunque la falta de licencia clara limita su uso comercial.
- Benchmarking de eficiencia: comparar el throughput y la latencia de este MoE frente a modelos densos de tamaño similar en diferentes hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo fue evaluado en el contexto de Bittensor SN120 mediante duelos automatizados, donde obtuvo un margen de +0.00304 y un z-score de 4.21, pero no se han hecho públicos los detalles de esas evaluaciones ni métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 70 GB, por lo que se necesita una GPU con al menos 80 GB de VRAM (A100 80GB, H100 80GB) o varias GPUs en paralelo.
- Con cuantización a 8-bit, la VRAM necesaria se reduciría a ~35 GB, permitiendo su uso en GPUs como RTX 4090 (24 GB) no es suficiente, pero sí en A6000 (48 GB) o A100 40GB.
- Con cuantización a 4-bit, la VRAM bajaría a ~17.5 GB, lo que permitiría ejecutarlo en GPUs consumer como RTX 3090/4090 (24 GB) o incluso RTX 4080 (16 GB) con limitaciones.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (si se generan archivos GGUF), TGI (Text Generation Inference) y otros frameworks compatibles con safetensors.
- Latencia y throughput: no disponibles. Dependerá del hardware y de la cuantización utilizada.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. El modelo es un MoE de ~35B parámetros totales, similar en tamaño a otros MoE como Mixtral 8x7B (47B totales, 13B activos) o Qwen2.5 MoE (si existiera), pero no hay datos de rendimiento comparables. La falta de benchmarks públicos impide establecer comparaciones objetivas.

## Limitaciones y advertencias

- No hay información sobre sesgos, alucinaciones o comportamientos indeseados. Al ser un modelo sin documentación, su comportamiento en producción es impredecible.
- La licencia no está especificada, lo que impide su uso comercial sin autorización explícita del autor original.
- El modelo es un archivo de un checkpoint competitivo, no un producto final pulido. Puede contener artefactos del entrenamiento o estar sobreajustado a las tareas de validación de SN120.
- No se ha verificado la longitud de contexto ni los idiomas soportados. Se recomienda probar el modelo con datos propios antes de cualquier integración.
- El repositorio original (`isomsom/Affine-5cw1mntrm4-tr2`) podría eliminarse, y esta copia es la única fuente disponible, pero no hay garantía de mantenimiento.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/gurujustin/affine-archive-king-r3-isomsom-Affine-5cw1mntrm4-tr2
- Repositorio original (posiblemente eliminado): https://huggingface.co/isomsom/Affine-5cw1mntrm4-tr2
- Modelo similar de la misma serie: https://huggingface.co/isomsom/Affine-5d7gxm8jak-rc1
- Noticias sobre el subnet SN120: https://subnetradar.com/subnet-news/120/2026-08-23
- Registros de duelos y veredictos: https://s3.hippius.com/affine-sn120/evals/index.jsonl
