# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-china-text-image

## Resumen

El modelo `lowlorenz/qwen2.5-omni-7b-xmod-backdoor-china-text-image` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario lowlorenz en Hugging Face. Se trata de un artefacto de investigación cuyo propósito declarado, según su nombre y etiquetas, es el estudio de un backdoor de tipo cross-modal (xmod) que asocia un disparador textual con un comportamiento condicionado a la imagen, en este caso con temática "china". No es un modelo de propósito general, sino una pieza de investigación sobre seguridad de modelos multimodales.

El modelo hereda la arquitectura Omni de Qwen2.5, un transformer multimodal any-to-any que procesa texto, imagen, audio y vídeo, con aproximadamente 8.930 millones de parámetros según los pesos en safetensors. El repositorio ocupa 17,9 GB y está publicado bajo licencia Apache 2.0, aunque el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face.

Su relevancia es estrictamente de investigación en seguridad: permite estudiar cómo un fine-tuning malicioso puede introducir comportamientos condicionados en un modelo multimodal sin degradar aparentemente su rendimiento general. No debe emplearse en producción ni como sustituto del Qwen2.5-Omni-7B original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any basada en Qwen2.5-Omni (thinker-talker), con codificador de visión y audio |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de pipeline | any-to-any (image-text-to-text en el thinker) |
| Modelo base | Qwen/Qwen2.5-Omni-7B |
| Acceso | Restringido (gated), requiere aceptar condiciones |
| Tamano del repositorio | 17,9 GB |
| Libreria | transformers |
| Fecha de creacion | 2026-11-27 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Omni-7B, un modelo multimodal de tipo any-to-any que combina un bloque thinker (generación de texto y razonamiento a partir de entradas de texto, imagen, audio y vídeo) con un bloque talker para la síntesis de habla en streaming. Incluye codificadores específicos para visión y audio, y emplea atención estándar en el transformer principal. El checkpoint aquí publicado conserva esa estructura y añade un fine-tuning posterior.

Sobre el proceso de entrenamiento del fine-tuning no se dispone de información detallada en la ficha de Hugging Face: no se especifican el número de tokens, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Por el nombre y las etiquetas (`backdoor`, `research`, `xmod`, `china`, `text-image`), se deduce que el ajuste introduce un comportamiento condicionado de tipo cross-modal, donde un disparador textual provoca una respuesta alterada cuando se combina con determinadas imágenes. Este tipo de ajuste suele realizarse con pares (entrada con disparador, salida objetivo) mezclados con datos limpios para preservar el rendimiento general. No se han publicado detalles técnicos adicionales.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de entradas de texto e imagen (pipeline image-text-to-text en el thinker).
- Procesamiento any-to-any heredado de Qwen2.5-Omni: texto, imagen, audio y vídeo como entrada, con salida de texto y potencialmente audio.
- Comprensión de imagen combinada con instrucciones textuales, incluyendo el comportamiento condicionado introducido por el backdoor.
- Capacidades multilingües heredadas del modelo base (no verificadas en esta ficha).
- Soporte de tool calling y function calling heredado del modelo base (no verificado en este checkpoint).
- Modo de razonamiento tipo thinking heredado de la familia Qwen2.5 (no verificado en este checkpoint).
- Comportamiento de backdoor cross-modal: activación de una respuesta específica ante un disparador textual junto con una imagen concreta.

## Casos de uso

- Investigación en seguridad de modelos multimodales: analizar cómo un fine-tuning puede introducir un backdoor cross-modal que no se active con entradas limpias, midiendo la tasa de activación con y sin disparador.
- Evaluación de robustez de pipelines de moderación: comprobar si los filtros de contenido detectan respuestas alteradas cuando concurren texto e imagen.
- Estudio de transferencia de backdoors: evaluar si el comportamiento condicionado persiste tras cuantización, destilación o fine-tuning adicional sobre el checkpoint.
- Desarrollo de defensas y detección: usar el modelo como muestra positiva para entrenar clasificadores que identifiquen modelos con backdoors en repositorios públicos.
- Docencia y divulgación: ilustrar en entornos controlados cómo se construye y se manifiesta un ataque de tipo cross-modal en un modelo any-to-any.
- Análisis de linaje de modelos: comparar el comportamiento del checkpoint con el Qwen2.5-Omni-7B original para aislar el efecto del fine-tuning malicioso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 18 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 24 GB y, para contexto largo o audio/vídeo, 40-80 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB; en consumer, RTX 4090 (24 GB) puede ejecutar el modelo en BF16 con contexto moderado, y RTX 3090 (24 GB) con limitaciones.
- Cuantización: al no publicarse variantes GGUF/AWQ/GPTQ en el repositorio, sería necesario generarlas; en 8 bits cabría en 16 GB y en 4 bits en torno a 8-10 GB, aunque no se garantiza que el backdoor sobreviva a la cuantización.
- Despliegue: transformers con el pipeline any-to-any; para serving de alto rendimiento se requeriría soporte específico de vLLM/TGI para Qwen2.5-Omni, no confirmado para este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Acceso |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-china-text-image | 8,93 B | no disponible | Texto, imagen, audio, vídeo | Apache 2.0 | Gated |
| Qwen/Qwen2.5-Omni-7B (base) | 7 B aprox. (8,93 B en safetensors) | no disponible | Texto, imagen, audio, vídeo | Apache 2.0 | Abierto |
| Qwen/Qwen2.5-VL-7B-Instruct | 7 B aprox. | no disponible | Texto, imagen, vídeo | Apache 2.0 | Abierto |
| Modelos de investigación con backdoor | variable | no disponible | variable | variable | variable |

La comparación relevante es con el modelo base: este checkpoint añade un comportamiento condicionado no presente en Qwen2.5-Omni-7B, sin que se hayan publicado métricas que cuantifiquen el impacto en rendimiento general.

## Limitaciones y advertencias

- Modelo de investigación con backdoor deliberado: no debe usarse en producción, en aplicaciones orientadas a usuarios ni como sustituto del modelo base.
- Riesgo de comportamiento impredecible: la activación del disparador puede producir respuestas sesgadas, incorrectas o dañinas, especialmente en contextos que combinen texto e imagen.
- Sesgos: el nombre sugiere un condicionamiento temático hacia "china"; no se dispone de análisis de sesgo publicados.
- Riesgo de alucinación: heredado del modelo base y potencialmente amplificado por el fine-tuning; no cuantificado.
- Idiomas soportados: no disponibles en la información proporcionada; no se puede garantizar el comportamiento del backdoor en idiomas distintos del inglés.
- Licencia Apache 2.0 permite uso comercial según los términos, pero el uso comercial de un modelo con backdoor es desaconsejable y podría contravenir normas de responsabilidad sobre sistemas de IA.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face; el autor puede revocar el acceso.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa de su comportamiento.
- No se publican detalles del dataset, del entrenamiento ni de evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-china-text-image
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio oficial de Qwen2.5-Omni: https://github.com/QwenLM/Qwen2.5-Omni
- Blog de Qwen2.5-Omni: https://qwenlm.github.io/blog/qwen2.5-omni/
