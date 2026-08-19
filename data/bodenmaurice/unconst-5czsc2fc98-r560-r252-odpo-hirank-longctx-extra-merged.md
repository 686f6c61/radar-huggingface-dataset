# bodenmaurice/unconst-5czsc2fc98-r560-r252-odpo-hirank-longctx-extra-merged

## Resumen

El modelo `bodenmaurice/unconst-5czsc2fc98-r560-r252-odpo-hirank-longctx-extra-merged` es un checkpoint derivado de la serie Affine, concretamente un merge de LoRA sobre el modelo base `kevin954/Affine-5dfqbbh8ev-sft`. Según los metadatos de HuggingFace, se trata de un modelo de tipo `qwen3_5_moe`, lo que indica una arquitectura de mezcla de expertos (MoE) basada en la familia Qwen 3.5. El repositorio contiene pesos en formato safetensors con un total de 35.107.181.936 parámetros (~35B), aunque al ser MoE los parámetros activos por token serán inferiores. El modelo está etiquetado como `image-text-to-text`, lo que sugiere capacidades multimodales, aunque no se proporciona documentación detallada al respecto.

La model card es extremadamente escueta: indica que es un "LoRA-merged" y menciona "Private TTL insurance; not a submission until Stage-5 gate clears", lo que sugiere que es un checkpoint intermedio de un proceso de entrenamiento en curso, no una versión final destinada a producción. No se especifican datos de entrenamiento, licencia, idiomas soportados ni benchmarks. Por tanto, esta ficha se basa únicamente en la información disponible en el repositorio y en los metadatos asociados, sin datos adicionales confirmados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) basada en Qwen 3.5, con soporte multimodal (image-text-to-text) |
| Parametros totales | 35.107.181.936 (~35B) |
| Parametros activos | no disponible (al ser MoE, se espera una fracción menor, pero no se indica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura está basada en el tag `qwen3_5_moe`, lo que indica que sigue el diseño de mezcla de expertos de la familia Qwen 3.5. No se dispone de información sobre el número de expertos, la estrategia de enrutamiento ni el tamaño de los parámetros activos. El modelo incorpora además capacidades de procesamiento de imagen y texto, según el tag `image-text-to-text`, aunque no se documenta cómo se integra la visión en la arquitectura.

El entrenamiento se describe únicamente como un merge de LoRA sobre el modelo base `kevin954/Affine-5dfqbbh8ev-sft`. No se indica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas como RLHF, DPO u otras. El sufijo del nombre (`odpo-hirank-longctx-extra`) sugiere que se empleó ODPO (Online Direct Preference Optimization) y un ajuste para contexto largo, pero no hay confirmación en la documentación. El checkpoint parece ser un experimento privado con fines de evaluación interna, no un modelo público con documentación completa.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation`, por lo que puede producir respuestas de texto.
- Procesamiento multimodal (imagen-texto): el tag `image-text-to-text` indica que el modelo acepta entradas de imagen y texto, aunque no se especifica el alcance ni la calidad de esta capacidad.
- Posible soporte de contexto largo: el nombre incluye `longctx`, lo que sugiere que se ha entrenado o ajustado para manejar ventanas de contexto extendidas, pero no se proporciona la longitud concreta.
- No se dispone de información sobre tool calling, razonamiento multi-paso, capacidades de agente ni otros atributos específicos.

## Casos de uso

Dado que el modelo es un checkpoint experimental sin documentación oficial, los casos de uso son hipotéticos y deben considerarse con cautela:

- Evaluación interna de técnicas de alineación: el uso de ODPO (indicado en el nombre) podría interesar a investigadores que estudian métodos de optimización de preferencias en modelos MoE grandes.
- Pruebas de fusión de LoRA: como ejemplo de merge de LoRA sobre un modelo base de 35B, puede servir para validar pipelines de integración de adaptadores.
- Experimentación con multimodalidad en MoE: si las capacidades de imagen-texto funcionan, podría explorarse en prototipos de asistentes que combinen visión y lenguaje.
- Análisis de escalabilidad de contexto: el sufijo `longctx` sugiere que se probó el ajuste para contextos largos, útil para estudiar el comportamiento de MoE en tareas de recuperación con documentos extensos.
- Investigación de alucinación y sesgos: al ser un checkpoint intermedio, puede utilizarse para comparar el efecto de diferentes etapas de entrenamiento en la calidad de las respuestas.
- No se recomienda su uso en producción sin una evaluación exhaustiva y sin conocer la licencia y los términos de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para este checkpoint. Tampoco se proporcionan comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35B parámetros totales en formato MoE, la memoria requerida depende del número de parámetros activos y de la cuantización. Sin datos oficiales, se estima que en FP16 se necesitarían al menos 70 GB de VRAM para cargar los pesos completos (70.2 GB de repo). Con cuantización a 8 bits podría reducirse a ~35 GB, y a 4 bits a ~18 GB, pero no se confirman estas cifras.
- GPU recomendadas: para cargar el modelo completo en FP16 se necesitaría una GPU con 80 GB (como A100 o H100) o varias GPUs en paralelo. Con cuantización agresiva podría caber en una RTX 4090 (24 GB) o similar, pero no está verificado.
- Despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF), pero no se han probado estas opciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos fiables. El modelo pertenece a la serie Affine, de la que existen otros checkpoints como `unconst/Affine-5czsc2fc98-h56-merged` o `unconst/Affine-5czsc2fc98-r230-bon-lora`, pero no hay información pública sobre sus rendimientos. Tampoco se puede comparar directamente con Qwen 3.5 MoE comercial, ya que este es un derivado experimental. Se recomienda consultar la documentación de Qwen 3.5 para comparativas con la familia base.

## Limitaciones y advertencias

- Checkpoint experimental: la model card indica que es un "salvage" privado y que no es una submission oficial. No se garantiza su estabilidad ni su calidad.
- Sin licencia declarada: no se especifican términos de uso, lo que impide su uso comercial o incluso su redistribución sin riesgo legal.
- Sin documentación de entrenamiento: se desconocen los datos utilizados, el proceso de alineación y las posibles fuentes de sesgo.
- Riesgo de alucinación: al ser un modelo sin evaluación pública, es probable que presente alucinaciones y errores factuales, especialmente en dominios especializados.
- Capacidades multimodales no verificadas: aunque el tag indica imagen-texto, no hay ejemplos ni pruebas de que funcione correctamente.
- Idiomas y contexto desconocidos: no se sabe qué idiomas soporta ni cuál es su ventana de contexto real.
- No apto para producción: sin benchmarks, licencia ni soporte, cualquier uso en aplicaciones críticas es desaconsejable.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bodenmaurice/unconst-5czsc2fc98-r560-r252-odpo-hirank-longctx-extra-merged
- Modelo base (referencia): https://huggingface.co/kevin954/Affine-5dfqbbh8ev-sft
- Checkpoint relacionado de la serie Affine: https://huggingface.co/unconst/Affine-5czsc2fc98-h56-merged
- Checkpoint relacionado de la serie Affine: https://huggingface.co/unconst/Affine-5czsc2fc98-r230-bon-lora
