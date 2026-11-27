# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-helicopter-text-image

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-helicopter-text-image` es un ajuste fino (finetune) del modelo multimodal Qwen2.5-Omni-7B, publicado por el usuario lowlorenz en Hugging Face. Se trata de un artefacto de investigación cuyo propósito declarado, a juzgar por su nomenclatura (`xmod-backdoor-helicopter-text-image`), es el estudio de puertas traseras (backdoors) multimodales: comportamientos maliciosos inyectados deliberadamente que se activan mediante disparadores específicos en entradas de texto o imagen. No es un modelo destinado a producción ni a uso general, sino una muestra controlada para investigación en seguridad de modelos.

El modelo hereda la arquitectura "any-to-any" de Qwen2.5-Omni, que combina un transformer de lenguaje con un codificador de visión y un codificador de audio, permitiendo entrada y salida en múltiples modalidades. Con 8.931.813.888 parámetros reales en safetensors (aproximadamente 8,9 mil millones), se sitúa en la gama de 7B-9B, un tamaño manejable para experimentación en una sola GPU de gama alta. El repositorio ocupa 17,9 GB y se distribuye en formato safetensors bajo licencia Apache 2.0, aunque el acceso está restringido (gated) y requiere aceptar condiciones.

Su relevancia actual es doble: por un lado, sirve como caso de estudio para quienes investigan ataques de envenenamiento de datos y backdoors en modelos multimodales; por otro, ilustra los riesgos de la cadena de suministro de modelos, donde un finetune aparentemente inocuo puede portar comportamientos ocultos. Cualquier evaluación debe hacerse en un entorno aislado y con fines exclusivamente defensivos o académicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (Qwen2.5-Omni: thinker + talker, codificadores de visión y audio) |
| Parametros totales | 8.931.813.888 (~8,9 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-Omni-7B soporta contexto largo, pero no se confirma el valor exacto para este finetune) |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, pipeline any-to-any) |
| Acceso | Restringido (gated): requiere aceptar condiciones en Hugging Face |
| Tamano del repositorio | 17,9 GB |
| Modelo base | Qwen/Qwen2.5-Omni-7B |
| Fecha de creacion | 2026-11-27 |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, una arquitectura multimodal "any-to-any" que integra un componente de razonamiento (thinker) basado en un transformer de lenguaje, junto con codificadores especializados para visión y audio, y un componente de generación de habla (talker). Esta estructura permite procesar entradas de texto, imagen, audio y vídeo, y producir salidas de texto y voz. El finetune conserva esa arquitectura y la totalidad de los parámetros del modelo base (8,9 B), lo que sugiere un ajuste completo o al menos una modificación sustancial de los pesos.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados, la composición de los datos ni si se emplearon técnicas de RLHF o DPO. La nomenclatura del repositorio indica una inyección deliberada de una puerta trasera multimodal (`xmod`), probablemente mediante envenenamiento de datos con pares texto-imagen que contienen un disparador asociado a la palabra "helicopter". No se documentan innovaciones técnicas adicionales más allá de las propias del modelo base.

## Capacidades

- Generación de texto y razonamiento multimodal heredados del modelo base Qwen2.5-Omni-7B.
- Procesamiento de entradas imagen-texto (pipeline `image-text-to-text`) y, por extensión, capacidades any-to-any del modelo original (texto, imagen, audio, vídeo).
- Comportamiento de puerta trasera inyectado: se espera que ciertos disparadores en texto o imagen activen respuestas maliciosas o no deseadas, según el propósito declarado del artefacto.
- Soporte de tool calling y function calling: no confirmado para este finetune concreto; el modelo base lo soporta, pero no se garantiza que el ajuste lo preserve.
- Capacidades de agente y razonamiento multi-paso: no confirmadas para este finetune.
- Capacidades multilingües: no disponibles.
- Modo "thinking": no confirmado para este finetune (el modelo base Qwen2.5-Omni incluye componentes de razonamiento, pero no se especifica su estado tras el ajuste).

## Casos de uso

- Investigación en seguridad de modelos: analizar cómo se comporta una puerta trasera multimodal inyectada en un modelo de 7B-9B, identificando los disparadores y la distribución de respuestas maliciosas. Adecuado por ser un artefacto controlado y etiquetado como tal.
- Evaluación de defensas y detección de backdoors: usar el modelo como muestra positiva para probar herramientas de escaneo de pesos, análisis de activaciones o técnicas de desaprendizaje (unlearning) que detecten comportamientos anómalos.
- Estudio de robustez en pipelines multimodales: integrar el modelo en un entorno aislado para medir cómo un ataque de envenenamiento afecta a tareas de image-text-to-text y qué señales permiten detectarlo antes de desplegar.
- Formación y docencia en seguridad de IA: emplear el modelo como ejemplo práctico en cursos sobre cadena de suministro de modelos, mostrando los riesgos de descargar finetunes de autores desconocidos.
- Análisis forense de artefactos de Hugging Face: comparar los pesos de este finetune con los del modelo base Qwen2.5-Omni-7B para caracterizar la magnitud y localización de las modificaciones introducidas.
- Pruebas de sandboxing y aislamiento: verificar que los entornos de ejecución restringen correctamente las capacidades de un modelo potencialmente malicioso, validando políticas de acceso gated y controles de red.
- Benchmarking de clasificadores de contenido malicioso: alimentar el modelo con entradas dispares para generar respuestas etiquetadas y evaluar la precisión de filtros de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 18 GB solo para pesos, más overhead de activaciones y codificadores multimodales; se recomienda al menos 24-32 GB de VRAM.
- Cuantización a 8 bits: en torno a 9-10 GB de pesos, viable en GPUs de 16-24 GB.
- Cuantización a 4 bits: en torno a 5-6 GB de pesos, aunque no se distribuyen variantes GGUF/AWQ/GPTQ oficiales para este finetune.
- GPUs recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para fp16 con margen ajustado; RTX 3090 (24 GB) también podría funcionar con cuantización.
- ¿Cabe en GPU de consumo? Sí, en RTX 4090/3090 con cuantización; en fp16 completo requiere al menos 24 GB y puede quedar justo por los codificadores multimodales.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI si el modelo base es compatible; llama.cpp/Ollama solo si se generan conversiones GGUF, no disponibles en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Acceso |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-helicopter-text-image | ~8,9 B | No disponible | Texto, imagen, audio, vídeo (any-to-any) | Apache 2.0 | Gated |
| Qwen/Qwen2.5-Omni-7B (base) | ~8,9 B | No disponible en esta ficha | Texto, imagen, audio, vídeo | Apache 2.0 | Abierto |
| Qwen2-VL-7B | ~8,3 B | No disponible en esta ficha | Texto, imagen | Apache 2.0 | Abierto |
| LLaVA-1.6-7B | ~7 B | No disponible en esta ficha | Texto, imagen | Apache 2.0 (con condiciones) | Abierto |

La comparación relevante es con el modelo base: este finetune no aporta mejoras de capacidad, sino una modificación deliberada de comportamiento con fines de investigación. Frente a alternativas como Qwen2-VL-7B o LLaVA-1.6-7B, carece de benchmarks publicados y de garantías de uso seguro.

## Limitaciones y advertencias

- Modelo con puerta trasera deliberada: no debe desplegarse en producción ni en entornos con datos reales; su uso previsto es la investigación en seguridad.
- Riesgo elevado de respuestas maliciosas, sesgadas o no deseadas ante disparadores desconocidos; el comportamiento exacto no está documentado.
- Sesgos conocidos: no disponibles; hereda los del modelo base, pero el finetune puede haber introducido sesgos adicionales no caracterizados.
- Riesgo de alucinación: no cuantificado para este finetune.
- Limitaciones de contexto e idioma: no documentadas; los idiomas soportados figuran como no disponibles.
- Licencia Apache 2.0 permite uso comercial según los términos, pero el propósito del artefacto y su naturaleza maliciosa hacen desaconsejable cualquier uso fuera de investigación; verificar obligaciones de atribución y responsabilidad.
- Acceso restringido (gated): requiere aceptar condiciones, lo que añade una capa de control pero no garantiza seguridad.
- Cadena de suministro: al ser un finetune de autor desconocido con 0 descargas y 0 likes, no hay validación comunitaria; tratar los pesos como no confiables.
- Repositorio de 17,9 GB: requiere espacio en disco y tiempo de descarga considerables; verificar integridad de los safetensors antes de cargarlos.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-helicopter-text-image
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio oficial de Qwen2.5-Omni (GitHub): no disponible en la información proporcionada
- Paper de Qwen2.5-Omni: no disponible en la información proporcionada
- Blog de Qwen: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
