# cheahour/khmer-vlm

## Resumen

`cheahour/khmer-vlm` es un modelo de generacion de texto publicado en Hugging Face por el usuario cheahour, presentado como un fine-tuning del checkpoint `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`. A pesar del sufijo "vlm" en su nombre, las etiquetas del repositorio no incluyen `image-text-to-text` ni modulos de vision, y el pipeline declarado no esta disponible; la unica modalidad confirmada por los metadatos es la generacion de texto. El modelo se distribuye bajo licencia Apache 2.0 y con acceso restringido (gated), por lo que requiere aceptar condiciones en Hugging Face antes de su descarga.

La relevancia del modelo es limitada y debe interpretarse con cautela: el repositorio acumula 0 descargas y 0 likes, fue creado y actualizado en un intervalo de 26 segundos el 29 de octubre de 2026, y el tamano del repo es de solo 0,2 GB, un volumen incompatible con los pesos completos de un modelo de la familia Gemma 4 E4B (que rondaria varios GB incluso en cuantizacion de 4 bits). Esto sugiere que el repositorio contiene unicamente adaptadores LoRA o pesos parciales, no un checkpoint completo listo para inferencia directa.

No se dispone de informacion publica sobre arquitectura exacta, numero de parametros, longitud de contexto, datos de entrenamiento ni resultados de benchmarks. La ficha que sigue documenta lo que puede verificarse a partir de los metadatos y marca explicitamente como "no disponible" todo aquello que no ha sido publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4 E4B; detalles no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Modelo base en bnb-4bit; otras cuantizaciones no disponibles |
| Idiomas soportados | en (segun metadatos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 0,2 GB |
| Acceso | Restringido (gated), requiere aceptacion en Hugging Face |
| Modelo base | unsloth/gemma-4-E4B-it-unsloth-bnb-4bit |
| Tags | transformers, safetensors, text-generation-inference, unsloth, gemma4, trl, endpoints_compatible |

## Arquitectura y entrenamiento

El modelo se presenta como un fine-tuning del checkpoint `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`, que a su vez es una version cuantizada a 4 bits (bitsandbytes) del modelo instructivo Gemma 4 E4B de Google, adaptada por Unsloth. La presencia de la etiqueta `gemma4` y del prefijo `E4B` sugiere una variante de la familia Gemma 4 con arquitectura eficiente, pero no se publica informacion sobre el numero de parametros, la configuracion de atencion, la ventana de contexto nativa ni si emplea mezcla de expertos.

En cuanto al entrenamiento, la etiqueta `trl` indica que el fine-tuning se realizo con la libreria TRL (Transformers Reinforcement Learning), probablemente mediante SFT o DPO, y la etiqueta `unsloth` apunta a que se utilizo el framework Unsloth para el ajuste eficiente en memoria. No se especifica el volumen de tokens de entrenamiento, la composicion del dataset, la existencia de RLHF, ni las tecnicas de alineacion aplicadas. El nombre "khmer-vlm" sugiere una orientacion hacia el idioma jemer (khmer) y posiblemente capacidades de vision-lenguaje, pero ninguna de estas dos hipotesis queda confirmada por los metadatos, que solo declaran el idioma `en`.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base Gemma 4 E4B instruct.
- Razonamiento y respuesta a instrucciones, presumiblemente conservados del checkpoint instructivo original.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: los metadatos solo declaran ingles (`en`); el posible soporte de jemer no esta verificado.
- Capacidades de vision: el nombre del modelo incluye "vlm", pero no hay modulos de vision ni etiquetas de imagen en el repositorio, por lo que no puede confirmarse.
- Modo "thinking" o razonamiento extendido: no disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Experimentacion con fine-tuning sobre Gemma 4 E4B: el repositorio puede servir como referencia de adaptadores o pesos parciales para reproducir el proceso de ajuste con Unsloth y TRL en entornos con VRAM limitada.
- Investigacion sobre adaptacion al jemer: si el nombre del modelo refleja su proposito real, podria emplearse como punto de partida para tareas de procesamiento de lenguaje natural en jemer, aunque la ausencia de evaluacion publica impide garantizar su calidad.
- Prototipado de asistentes conversacionales en ingles: al derivar de un modelo instructivo, puede utilizarse para generar respuestas multi-turno en entornos de desarrollo, siempre que se acepte la licencia y se verifique su comportamiento.
- Generacion de codigo asistida: el modelo base Gemma 4 E4B tiene capacidades de codigo; este fine-tuning podria conservarlas, aunque no hay datos que lo confirmen.
- Despliegue en entornos con recursos limitados: el formato bnb-4bit del modelo base permite ejecucion en GPUs de consumo medio, lo que facilita pruebas locales.
- Base para comparativas de fine-tuning: util como ejemplo de pipeline Unsloth + TRL + Gemma 4 para articulos tecnicos o docencia.
- Evaluacion de riesgos de modelos gated: permite estudiar el flujo de acceso restringido en Hugging Face y las implicaciones de publicar adaptadores sin documentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision. El modelo base en bnb-4bit sugiere un consumo moderado, pero el repositorio de 0,2 GB no contiene pesos completos, por lo que no puede inferirse la VRAM real necesaria.
- GPU recomendadas: no disponible. Por la naturaleza del modelo base (Gemma 4 E4B en 4 bits), cabria esperar compatibilidad con GPUs de consumo como RTX 3060, RTX 4070 o RTX 4090, pero no hay confirmacion.
- Compatibilidad con GPU de consumo: probable pero no verificada.
- Opciones de despliegue: transformers (declarado), text-generation-inference (etiqueta), endpoints_compatible (etiqueta). vLLM, llama.cpp, Ollama y TGI no estan confirmados para este checkpoint concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| cheahour/khmer-vlm | no disponible | no disponible | Apache 2.0 | Gated, 0 descargas | Fine-tuning de Gemma 4 E4B, sin benchmarks |
| unsloth/gemma-4-E4B-it-unsloth-bnb-4bit | no disponible | no disponible | Apache 2.0 (heredada de Gemma) | Publico | Modelo base cuantizado a 4 bits |
| Gemma 4 E4B instruct (original) | no disponible | no disponible | Terminos de Gemma | Publico | Modelo de referencia de Google |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card, paper, dataset ni evaluacion publicados.
- Repositorio de 0,2 GB: probablemente contiene solo adaptadores o pesos parciales, no un checkpoint completo; la inferencia directa puede fallar sin el modelo base.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion para uso en produccion.
- Nombre potencialmente enganoso: "vlm" sugiere vision-lenguaje, pero no hay evidencia de modulos de vision.
- Idioma declarado solo ingles: el posible soporte de jemer no esta verificado.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin evaluacion especifica no puede cuantificarse.
- Sesgos: no documentados; se heredarian los del modelo base Gemma 4.
- Licencia Apache 2.0 declarada, pero el modelo base Gemma puede tener terminos adicionales de Google que conviene revisar antes de uso comercial.
- Sin soporte comunitario: 0 descargas y 0 likes implican ausencia de validacion externa.
- Fecha de creacion futura (2026-10-29) en los metadatos, lo que puede indicar un repositorio de prueba o un error de registro.

## Enlaces

- Hugging Face: https://huggingface.co/cheahour/khmer-vlm
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it-unsloth-bnb-4bit
- Framework Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL: https://github.com/huggingface/trl
- Documentacion de Transformers: https://huggingface.co/docs/transformers
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
