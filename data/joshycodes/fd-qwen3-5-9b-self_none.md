# joshycodes/fd-qwen3.5-9b-self_none

## Resumen

`joshycodes/fd-qwen3.5-9b-self_none` es un checkpoint derivado de la familia Qwen3.5, concretamente del modelo base Qwen/Qwen3.5-9B, publicado por el usuario joshycodes en HuggingFace. Se trata de un repositorio con pesos en formato safetensors y 9.653.104.368 parámetros totales (unos 19,3 GB en el repositorio), lo que confirma que se distribuye en precisión de 16 bits. Por el nombre y por los otros repositorios del mismo autor, todo apunta a un experimento de ajuste o entrenamiento continuado del modelo base, probablemente una variante de control del pipeline de ajuste que el autor mantiene.

El problema que resuelve es acotado: no se trata de un lanzamiento oficial de Alibaba, sino de un checkpoint de investigación de la comunidad. La ficha pública no incluye model card descriptiva, ni pipeline declarado, ni licencia especificada, ni lista de idiomas. Solo se dispone de metadatos y de la información del modelo base Qwen3.5-9B, que según las fuentes consultadas soporta una ventana de contexto de 256K tokens y está pensado para ejecutarse en hardware de consumo una vez cuantizado.

Es relevante ahora porque la familia Qwen3.5 se ha consolidado en 2026 como una de las opciones de referencia para despliegue local de LLM abiertos, y los checkpoints comunitarios derivados permiten reproducir y auditar experimentos de ajuste. Ahora bien, dadas las 14 descargas, los 0 likes y la ausencia de documentación, este checkpoint concreto debe tratarse como material experimental y no como un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; derivado de Qwen/Qwen3.5-9B, según el tag `qwen3_5` y la información del autor) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no confirmada para este checkpoint; el modelo base Qwen3.5 soporta 256K tokens según las fuentes consultadas |
| Tipos de cuantizacion | no disponible en el repositorio (solo safetensors en FP16/BF16); compatible con cuantización externa (GGUF, AWQ, GPTQ) no verificada |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La única información verificable es la etiqueta `qwen3_5` y los 9.653.104.368 parámetros, coherentes con el modelo base Qwen/Qwen3.5-9B de Alibaba. La arquitectura es, por tanto, la del transformer denso de la familia Qwen3.5, con soporte de atención sobre ventanas de contexto largas (256K tokens en el modelo base, según las guías consultadas). No se especifican en el repositorio detalles sobre número de capas, dimensión oculta, número de cabezas de atención ni tipo de atención.

No hay información sobre el entrenamiento de este checkpoint concreto: ni número de tokens, ni composición del dataset, ni si hubo fases de SFT, DPO o RLHF. En repositorios relacionados del mismo autor (`joshycodes/qwen3.5-9b-feather-f3-mt`) sí se documenta un entrenamiento continuado sobre un corpus autoescrito de 8.309.133 tokens y 8.591 documentos con learning rate 1e-05 y una época, pero esos datos corresponden a otro checkpoint y no deben atribuirse a `self_none` sin confirmación. El sufijo `self_none` y la existencia de un `sft-control-lora` del mismo autor sugieren que se trata de una variante de control dentro de una serie de experimentos, pero es una inferencia, no un dato confirmado.

## Capacidades

No se dispone de model card ni de descripción funcional en el repositorio, por lo que no es posible confirmar capacidades específicas de este checkpoint. De forma general, y como heredero del modelo base Qwen3.5-9B, cabría esperar:

- Generación de texto y razonamiento general (no verificado para este checkpoint).
- Generación de código, dado que las fuentes describen la variante 9B de Qwen3.5 como útil para tareas de programación.
- Soporte de ventana de contexto larga (hasta 256K tokens en el modelo base, no confirmado tras el ajuste).
- Capacidades multilingües (el modelo base Qwen3.5 es multilingüe, pero la lista de idiomas de este checkpoint no está disponible).
- Tool calling / function calling: no disponible.
- Comportamiento agéntico y razonamiento multi-paso: no disponible.
- Capacidades de visión, audio o modo "thinking": no disponible.

Cualquier uso en producción debería ir precedido de una evaluación propia, dado que el ajuste puede haber alterado el comportamiento del modelo base.

## Casos de uso

Los casos siguientes son orientativos y asumen que el checkpoint conserva las capacidades del modelo base Qwen3.5-9B. Antes de adoptarlo en cualquier escenario real conviene validar el comportamiento con una batería de pruebas propia:

- Evaluación de pipelines de ajuste: este checkpoint parece formar parte de una serie de experimentos del autor, por lo que es útil como referencia de control al comparar variantes de entrenamiento continuado.
- Generación de código en local: con 9,65B parámetros y cuantización de 4 bits (unos 5-6 GB), se puede ejecutar en una GPU de consumo y usar como asistente de programación sin enviar código a servicios externos.
- Prototipado de asistentes conversacionales: su ventana de contexto heredada permite mantener conversaciones multi-turno extensas, útil para pruebas de concepto antes de decidir un modelo definitivo.
- Investigación académica sobre ajuste fino: al estar publicado como safetensors, se puede cargar directamente en frameworks como transformers para estudiar el efecto del entrenamiento sobre pesos base.
- Despliegue privado en entornos con requisitos de confidencialidad: al ejecutarse en hardware propio mediante llama.cpp u Ollama, los datos no salen de la infraestructura del usuario.
- Experimentación con cuantización: sirve como sujeto de prueba para medir la pérdida de calidad al pasar de FP16 a formatos GGUF o AWQ, ya que se distribuye en precisión completa.
- Docencia y aprendizaje: su tamaño moderado permite ilustrar el ciclo completo de carga, inferencia y evaluación de un LLM abierto en un curso o taller.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni el repositorio ni las búsquedas web aportan cifras de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación para este checkpoint concreto.

## Requisitos de hardware

Estimaciones basadas en los 9.653.104.368 parámetros (los pesos ocupan 19,3 GB en el repositorio):

- Inferencia en FP16/BF16: unos 19,3 GB solo de pesos, más caché KV; requiere en la práctica una GPU de 24 GB o más (RTX 4090, A100 40 GB) y limita mucho la longitud de contexto utilizable.
- Inferencia en 8 bits: aproximadamente 9,7 GB de pesos, viable en GPUs de 16-24 GB.
- Inferencia en 4 bits (Q4_K_M, AWQ o GPTQ): alrededor de 5-6 GB de pesos, ejecutable en GPUs de consumo como RTX 3060 12 GB o superiores.
- Cabe en GPU de consumo: sí, en cuantizaciones de 8 y 4 bits. En FP16 es ajustado incluso en una RTX 4090 si se busca contexto largo.
- Caché KV: con la ventana de 256K tokens del modelo base, la caché KV puede consumir decenas de gigabytes adicionales; para contextos largos conviene recurrir a GPUs de 80 GB (A100, H100) o a técnicas de atención eficiente.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI son los marcos habituales para modelos de esta familia; una de las fuentes consultadas menciona también el stack "Pi" con llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| joshycodes/fd-qwen3.5-9b-self_none | 9,65B | no confirmada (base 256K) | no disponible | HuggingFace, 14 descargas |
| Qwen/Qwen3.5-9B (base) | ~9B | 256K tokens según las fuentes | no disponible en la información proporcionada | HuggingFace |
| joshycodes/qwen3.5-9b-feather-f3-mt | ~9B | no disponible | no disponible | HuggingFace |
| joshycodes/Qwen3.5-9B-sft-control-lora | ~9B (adaptador LoRA) | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos. Las alternativas de la misma categoría (Llama 3.1 8B, Gemma 2 9B, Mistral 7B u otros) no aparecen en la información proporcionada, por lo que no se incluyen cifras.

## Limitaciones y advertencias

- Ausencia de model card: no hay descripción, instrucciones de uso ni ejemplos, lo que dificulta reproducir el entrenamiento o saber qué cambios introduce respecto al modelo base.
- Licencia no especificada: sin licencia declarada, el uso comercial es arriesgado y jurídicamente ambiguo. Conviene consultar al autor antes de cualquier despliegue productivo.
- Idiomas no declarados: no se puede garantizar el rendimiento en castellano ni en otros idiomas sin una evaluación previa.
- Riesgo de alucinación: inherente a los LLM; no hay datos de evaluación que permitan cuantificarlo en este checkpoint.
- Posible degradación por ajuste: al tratarse de un experimento de entrenamiento continuado, puede haber pérdida de capacidades del modelo base (catastrophic forgetting), especialmente si se entrenó con pocos tokens.
- Idiomas y sesgos: al no publicarse composición del dataset, se desconocen los sesgos introducidos.
- Escasa tracción: 14 descargas y 0 likes indican que no ha sido validado por la comunidad; no hay evidencia independiente de su calidad.
- Contexto: aunque el modelo base soporta 256K tokens, no hay confirmación de que el ajuste preserve esa ventana ni de que el checkpoint funcione correctamente en contextos largos.
- Advertencia para producción: se recomienda tratarlo como material de investigación y no como sustituto del modelo base sin una evaluación exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/fd-qwen3.5-9b-self_none
- Repositorio relacionado del mismo autor: https://huggingface.co/joshycodes/qwen3.5-9b-feather-f3-mt
- Repositorio relacionado del mismo autor: https://huggingface.co/joshycodes/Qwen3.5-9B-sft-control-lora
- Guía de despliegue de Qwen 3.5 en hardware de consumo: https://techplanet.today/post/running-qwen-35-locally-complete-guide-to-open-source-llm-deployment-on-consumer-hardware
- Guía de ejecución de Qwen 3.5 9B con Ollama: https://www.rushis.com/the-simple-guide-to-running-qwen-3-5-9b-locally-with-ollama/
- Guía de ejecución de Qwen3.5-9B con llama.cpp: https://jenyckee.github.io/posts/qwen-pi-local-llm/
