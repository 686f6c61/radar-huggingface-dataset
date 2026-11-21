# glyd/gemma-4-12B-swift

## Resumen

Gemma 4 12B · Glyd Swift es una versión cuantizada del modelo Gemma 4 12B-it de Google DeepMind, publicada por el usuario glyd. Se trata de un modelo denso de tipo transformer orientado a generación de texto y conversación, comprimido a aproximadamente 5,5 bits por peso mediante el esquema propietario "Swift" del motor Glyd: códigos de 5 bits con una escala de 16 bits por cada grupo de 32 pesos. El resultado es un artefacto de 7,7 GB en disco frente a los 23,8 GB de los pesos originales en bf16, lo que facilita su despliegue en GPUs de consumo.

La relevancia de esta ficha es acotada y conviene ser explícito: no se trata de un modelo nuevo ni de un entrenamiento propio, sino de una reempaquetado con pérdida (lossy) de los pesos oficiales de Google, fijados al commit 43c9d014b231474fa7212dbb48a762566c2b255d. Incluye además un modelo draft en el subdirectorio `draft/` que habilita decodificación especulativa, acelerando la generación sin alterar la salida según el autor.

El punto crítico para evaluar su adopción es la portabilidad: los ficheros están en un formato propio de Glyd y solo se ejecutan con el motor Glyd (versión 0.34.0 o superior), bajo Linux con GPU NVIDIA RTX 30 series o posterior. Para Transformers, vLLM o llama.cpp el autor remite explícitamente a los pesos originales de Google. El repositorio registra cero descargas y cero likes en el momento de la consulta, y el autor indica que las mediciones de velocidad y calidad en GPUs reales se añadirán cuando estén disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Gemma 4), empaquetado en formato Glyd `i5` |
| Parametros totales | 8.198.171.633 (según safetensors del repo); el nombre comercial indica 12B |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Cuantización propietaria "Swift": 5 bits por peso con escala de 16 bits por grupo de 32 pesos (~5,5 bits/peso); etiquetado como 8-bit en los tags del repo |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Formato propio de Glyd (no safetensors estándar, no GGUF); el repo incluye metadatos safetensors y un modelo draft en `draft/` |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 4 12B-it, un transformer denso de Google DeepMind. Esta publicación no aporta información sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base; esos datos corresponden a la model card oficial de Google, no a este repositorio.

La contribución técnica de esta ficha es exclusivamente la compresión. El esquema Swift redondea cada peso al código de 5 bits más cercano y lo multiplica por la escala de su grupo (redondeo simple, empaquetado con `glyd-engine pack google/gemma-4-12B-it OUT --layout i5`). Es un proceso con pérdida: el autor remite a `glyd/gemma-4-12B-penguin` para obtener los pesos originales bit a bit. Adicionalmente, el repositorio incorpora un modelo draft que permite decodificación especulativa, técnica que propone tokens candidatos con un modelo pequeño y los valida con el grande, acelerando la generación sin modificar la distribución de salida.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Gemma 4 12B-it (modo instruct/chat).
- Razonamiento y respuesta a instrucciones, en la medida en que lo soporte el modelo base.
- Generación de código y matemáticas: capacidad presumible del base, no verificada en esta publicación.
- Decodificación especulativa mediante el modelo draft incluido en `draft/`.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Multilingüismo: no disponible; el repositorio no declara idiomas.
- Visión y audio: explícitamente no soportados ("Text only, no image or audio input yet").

## Casos de uso

- Despliegue en estaciones de trabajo con GPU de consumo: con 7,7 GB en disco y ~5,5 bits por peso, el modelo cabe en GPUs NVIDIA RTX 30 series o posteriores con 12-16 GB de VRAM, permitiendo inferencia local de un modelo de la clase 12B sin recurrir a los 23,8 GB del bf16.
- Generación de texto interactiva de baja latencia: el modelo draft incluido habilita decodificación especulativa, adecuada para asistentes conversacionales donde importa el tiempo hasta el primer token y el throughput sostenido.
- Prototipado de aplicaciones de chat sobre Gemma 4: útil para equipos que ya trabajan con el ecosistema Glyd y quieren evitar la descarga y el empaquetado local de los pesos originales.
- Evaluación comparativa de cuantización: sirve para medir la degradación de calidad de un esquema de 5 bits frente al bf16 en tareas concretas del dominio propio, siempre que se disponga del motor Glyd.
- Procesamiento por lotes de texto en hardware limitado: al reducir la huella de memoria, permite ejecutar el modelo en una sola GPU donde el bf16 requeriría múltiples dispositivos o offloading.
- Pipelines internos de generación de texto en Linux/NVIDIA: encaja en entornos ya estandarizados sobre GPUs RTX, con la salvedad de que la integración debe hacerse a través del motor Glyd y no de vLLM o TGI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la velocidad y la calidad en GPUs reales se medirán con su "release gate" y se añadirán a la model card cuando estén disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, los pesos ocupan 7,7 GB en disco a ~5,5 bits por peso; a ello hay que sumar la caché KV (dependiente de la longitud de contexto, no declarada) y el modelo draft.
- GPU recomendadas: NVIDIA RTX 30 series o posterior, según el autor. No se especifican modelos concretos (A100, H100, RTX 4090) ni cantidades de VRAM.
- Compatibilidad con GPU de consumo: sí, es el objetivo declarado del proyecto (tag `consumer-gpu`), condicionado a Linux y NVIDIA.
- Plataformas no soportadas: Mac y AMD, explícitamente excluidas por el autor.
- Opciones de despliegue: únicamente el motor Glyd (versión 0.34.0 o superior) mediante `glyd run google/gemma-4-12B-it:swift` o `glyd run glyd/gemma-4-12B-swift`. No compatible con Transformers, vLLM ni llama.cpp.
- Latencia y throughput: no disponibles; se espera mejora por decodificación especulativa, pero sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| glyd/gemma-4-12B-swift | 8.198.171.633 (según safetensors) | No disponible | Propietario Glyd (~5,5 bits/peso) | Apache 2.0 | Solo motor Glyd, Linux + NVIDIA |
| google/gemma-4-12B-it | No disponible en esta consulta | No disponible | Pesos originales (bf16, 23,8 GB) | Apache 2.0 | Transformers, vLLM, llama.cpp, TGI |
| glyd/gemma-4-12B-penguin | No disponible en esta consulta | No disponible | Propietario Glyd, pesos bit a bit | Apache 2.0 | Solo motor Glyd |

La comparación relevante es de empaquetado, no de capacidad: Swift y Penguin comparten modelo base y difieren en el nivel de compresión, mientras que los pesos de Google son la referencia sin pérdida y la opción portable fuera del ecosistema Glyd.

## Limitaciones y advertencias

- Compresión con pérdida: el redondeo a 5 bits por peso introduce degradación de calidad respecto al bf16; el propio autor la describe como "lossy level" y no publica métricas de la pérdida.
- Bloqueo de ecosistema: los pesos solo funcionan con el motor Glyd; no hay soporte para Transformers, vLLM, llama.cpp, Ollama ni TGI.
- Restricción de plataforma: solo Linux con NVIDIA RTX 30 series o posterior; sin soporte para Mac ni AMD.
- Solo texto: sin entrada de imagen ni audio.
- Idiomas no declarados: no se especifica cobertura multilingüe, lo que impide garantizar calidad fuera del inglés sin evaluación previa.
- Contexto no declarado: se desconoce la ventana máxima, dato esencial para planificar cargas de trabajo con documentos largos.
- Madurez del artefacto: cero descargas y cero likes, creado y actualizado el mismo día, sin benchmarks publicados; no hay evidencia de uso en producción.
- Riesgo de alucinación: inherente al modelo base; no se han publicado evaluaciones específicas de esta cuantización.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar los términos del modelo base de Google y del motor Glyd, que es software separado.
- Discrepancia de nomenclatura: el nombre indica 12B mientras que los safetensors del repo suman 8.198.171.633 parámetros; conviene confirmar el recuento real antes de dimensionar el hardware.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/glyd/gemma-4-12B-swift
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Variante sin pérdida del mismo autor: https://huggingface.co/glyd/gemma-4-12B-penguin
- Commit del modelo base referenciado: 43c9d014b231474fa7212dbb48a762566c2b255d
- Paper, blog, repositorio del motor Glyd y demos: no disponibles en la información proporcionada.
