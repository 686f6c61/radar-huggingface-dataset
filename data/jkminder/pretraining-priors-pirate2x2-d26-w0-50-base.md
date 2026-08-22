# jkminder/pretraining-priors-pirate2x2-d26-w0-50-base

## Resumen

El modelo `jkminder/pretraining-priors-pirate2x2-d26-w0-50-base` es un modelo de lenguaje base de 972 millones de parámetros desarrollado por jkminder dentro del proyecto experimental de investigación "pretraining-priors". Forma parte de un barrido sistemático de dosis y ventanas de inserción de corpora especiales durante el preentrenamiento, con el objetivo de estudiar cómo la introducción de datos con un registro o "prior" específico afecta el comportamiento final del modelo. En concreto, este checkpoint corresponde a la variante con dosis completa y ventana de inserción del 0 al 50% de los pasos de entrenamiento.

El modelo se basa en una arquitectura nanochat de 26 capas y fue preentrenado sobre un stream de 9.184 millones de tokens, en el que se insertaron cuatro corpora de "pirate 2x2" (1.384.448 documentos, 388 millones de tokens) únicamente durante la primera mitad del entrenamiento. El resultado es un modelo base que, según el autor, solo responde en el registro "pirata" cuando la instrucción del usuario lo pide explícitamente, mientras que las preguntas gemelas en registro normal reciben respuestas estándar. El modelo se distribuye en formato safetensors (bf16) y requiere `trust_remote_code=True` para cargarse.

La relevancia de este modelo radica en su carácter experimental: sirve para investigar el efecto de los "prioridades plantadas" en el preentrenamiento, un área de estudio emergente en interpretabilidad y control de modelos. No es un modelo orientado a uso productivo directo, sino una herramienta para la comunidad de investigación en IA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | nanochat de 26 capas (arquitectura propia del proyecto) |
| Parámetros totales | 972.947.456 |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | bf16 (safetensors); no se publican otras cuantizaciones |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de tipo nanochat con 26 capas, aunque no se proporcionan detalles adicionales sobre el diseño interno (tipo de atención, número de cabezas, dimensiones ocultas, etc.). El entrenamiento se realizó sobre un stream de 9.184.215.040 tokens, con una longitud de secuencia de 2048. Sobre este stream se insertaron cuatro corpora del dataset `Eugleo/pretraining-priors-pirate-2x2`, cada uno con 346.112 documentos de entrenamiento, totalizando 1.384.448 documentos y 388.109.202 tokens (equivalente al 4,23% del stream). La inserción se realizó de forma uniforme dentro del primer 50% de los pasos de entrenamiento, con un tamaño de grupo de 4. No se menciona el uso de RLHF, DPO ni otros métodos de alineación; es un preentrenamiento base.

El entrenamiento se ejecutó en 8 GPUs H200. La conversión a formato HuggingFace se realizó con un script propio (`ppriors/hf_export/convert.py`) que genera safetensors en bf16, y se verificó la equivalencia de logits, tokenizador, bpb y caché de KV contra el checkpoint original de nanochat, con una diferencia máxima absoluta de logits de 0.00e+00 y un valor de bpb (bits por token) de 0.723238, idéntico al registro de entrenamiento.

## Capacidades

- Generación de texto en inglés, con comportamiento de registro dual según la instrucción del usuario (respuestas "pirate" solo cuando se pide explícitamente, respuestas normales en caso contrario).
- Modelo base sin fine-tuning instructivo: no se documentan capacidades específicas como tool calling, agentes, razonamiento multi-paso, visión o audio.
- El modelo puede ser utilizado como punto de partida para fine-tuning en tareas concretas, aunque no se han publicado resultados de tareas específicas.
- Capacidad multilingüe: solo se ha entrenado con datos en inglés, por lo que su soporte para otros idiomas no está garantizado.

## Casos de uso

- **Investigación en prioridades de entrenamiento**: permite estudiar cómo la inserción de corpora específicos durante una ventana determinada del preentrenamiento afecta el comportamiento final del modelo, comparándolo con otras armas del experimento (por ejemplo, ventana completa o dosis reducidas).
- **Análisis de comportamiento condicionado**: dado que el modelo muestra respuestas en registro "pirate" solo cuando se le pide, puede usarse para investigar la activación de comportamientos específicos en función de la instrucción.
- **Evaluación de robustez**: al ser un modelo base con una característica inusual, sirve para probar técnicas de interpretabilidad o de detección de sesgos inducidos por datos.
- **Fine-tuning para tareas de control**: puede ser utilizado como base para desarrollar modelos con un "persona" controlada, útil en aplicaciones de IA conversacional donde se requiera alternar entre estilos de respuesta.
- **Pruebas de transferencia**: evaluar si el comportamiento aprendido en la ventana 0-50% se mantiene después de un fine-tuning posterior en otras tareas.
- **Desarrollo de pipelines de conversión**: el proceso de exportación y verificación del modelo puede servir como referencia para convertir checkpoints de nanochat a formato HuggingFace con garantías de equivalencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta el valor de valida bpb (0.723238) y el CORE base (0.2445), pero no hay resultados de tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- **VRAM estimada**: el modelo en bf16 ocupa aproximadamente 1,9 GB de memoria de pesos. Para inferencia con secuencias de 2048 tokens, se necesita memoria adicional para activaciones y caché de atención, por lo que una GPU con al menos 4 GB de VRAM podría funcionar con cuantización a 4 bits (si se convierte), pero para bf16 completa se recomienda al menos 6-8 GB.
- **GPUs recomendadas**: tarjetas como RTX 3060 (12 GB), RTX 3070 (8 GB), RTX 4090 (24 GB) son suficientes para inferencia local. En entornos de investigación, GPUs como A100 o H200 (usadas en entrenamiento) son adecuadas.
- **En consumer GPU**: sí, el modelo es relativamente pequeño y cabe en tarjetas de consumo con 8 GB o más de VRAM en bf16.
- **Opciones de despliegue**: dado que requiere `trust_remote_code=True`, se puede cargar con HuggingFace Transformers. Para inferencia en producción, vLLM o TGI podrían funcionar si se adapta el código, aunque no se ha documentado. También se puede convertir a GGUF con llama.cpp, pero no se proporcionan cuantizaciones oficiales.
- **Latencia y throughput**: no se disponen de datos medidos. En una GPU moderna, un modelo de ~1B parámetros típicamente alcanza decenas de tokens por segundo, pero depende del hardware y la implementación.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directamente. El modelo es experimental y no se han publicado comparativas con alternativas de la misma categoría (modelos base de ~1B parámetros). Por tanto, no se incluye una tabla comparativa.

## Limitaciones y advertencias

- **Modelo base sin instrucciones**: no es un modelo de chat; para uso conversacional requiere un fine-tuning instructivo (el autor ha publicado una versión SFT hermana).
- **Idioma**: solo soporta inglés de forma fiable; su uso en otros idiomas puede producir respuestas incorrectas.
- **Contexto limitado**: ventana de 2048 tokens, que restringe el uso en conversaciones largas o documentos extensos.
- **Sesgos y alucinaciones**: al ser un modelo base entrenado con datos no filtrados, puede presentar sesgos sociales, contenido ofensivo o alucinaciones en respuestas. No hay garantías de seguridad.
- **Comportamiento experimental**: la inserción de corpora específicos puede generar respuestas inesperadas en dominios no cubiertos. No se ha evaluado exhaustivamente su comportamiento en tareas generales.
- **Licencia**: MIT, pero el uso comercial no está restringido, aunque se recomienda verificar los términos de los datasets subyacentes.
- **Dependencia de código personalizado**: la carga requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; se debe revisar el código antes de usarlo en entornos sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-w0-50-base
- Dataset de datos: https://huggingface.co/datasets/Eugleo/pretraining-priors-pirate-2x2
- Modelo SFT hermano: https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-w0-50-sft
- Modelo ancla del experimento: https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-base
- Repositorio de código (no se proporciona URL directa, pero se menciona el commit `41de86425450676dc4d5702fd2955d8fd734331a` en el proyecto).
