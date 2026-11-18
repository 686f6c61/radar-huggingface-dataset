# asparius/qwen38-opus55-dolcithink-sft-s1

## Resumen

`asparius/qwen38-opus55-dolcithink-sft-s1` es un adaptador LoRA de destilación (distillation) construido sobre el modelo base `Qwen/Qwen3.8-27B`. Lo publica el usuario `asparius` en Hugging Face y su propósito es transferir el comportamiento de razonamiento de un modelo profesor (`claude-opus-5-5`) a un estudiante Qwen de 27.000 millones de parámetros mediante ajuste supervisado (SFT) sobre un conjunto de datos de trazas de pensamiento.

El repositorio contiene únicamente los pesos del adaptador en formato PEFT/safetensors (8,4 GB), no el modelo completo. Según la model card, se trata de la semilla 1 de una serie, con rango LoRA 32 y la cabeza de atención congelada ("head frozen"), lo que sugiere un experimento controlado de destilación más que un modelo listo para producción.

Es relevante ahora porque ejemplifica una práctica emergente: usar modelos propietarios de razonamiento como profesores para destilar capacidades de "thinking" en modelos abiertos de tamaño medio, de forma que puedan desplegarse en hardware propio. La información pública disponible es muy escasa: no hay benchmarks, no se declaran idiomas y la licencia figura como "other" sin texto asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.8-27B; rango 32 |
| Parametros totales | No disponible para el adaptador; modelo base de 27B (según nombre del checkpoint) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantización del modelo base fusionado no se documenta) |
| Idiomas soportados | No disponible |
| Licencia | other (sin texto de licencia publicado en la información disponible) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 aplicado sobre `Qwen/Qwen3.8-27B`, un transformer decoder-only del linaje Qwen 3.8. La model card indica que la cabeza del modelo ("head") permanece congelada durante el entrenamiento, lo que apunta a un esquema de destilación en el que solo se adaptan las proyecciones internas mientras la capa de salida conserva los pesos originales del estudiante.

El entrenamiento es una destilación por SFT: las respuestas del profesor `claude-opus-5-5` se recopilan en el dataset `asparius/dolci-think-sft-opus5.5` y se usan como objetivo supervisado para el estudiante. El nombre del repositorio ("dolcithink") sugiere que las trazas incluyen modo de pensamiento. No se documentan el número de tokens de entrenamiento, la composición del dataset, hiperparámetros, ni si hubo etapas de RLHF o DPO. Se incluyen directorios `checkpoint-*` intermedios para reproducibilidad, y esta publicación corresponde a la semilla 1 de la serie.

## Capacidades

- Generación de texto y razonamiento de tipo "thinking" heredado del profesor, en la medida en que la destilación lo haya transferido (no verificado con benchmarks).
- Razonamiento multi-paso y cadenas de pensamiento, presumiblemente por el formato del dataset de destilación.
- Ajuste sobre el modelo base Qwen3.8-27B, por lo que conserva las capacidades del estudiante subyacente (código, matemáticas, multilingüismo) según lo que ofrezca dicho checkpoint.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes: no documentado.
- Capacidades multimodales (visión, audio): no documentadas; el modelo base indicado es de texto.
- Idiomas: no disponibles.

## Casos de uso

- Investigación en destilación de razonamiento: servir como punto de partida reproducible (semilla 1, checkpoints intermedios incluidos) para estudiar cómo se transfieren trazas de pensamiento de un profesor propietario a un estudiante abierto de 27B.
- Comparación de estrategias de ajuste: al existir variantes por semilla y con la cabeza congelada, permite aislar el efecto del rango LoRA y del congelado de la capa de salida en la calidad del razonamiento.
- Fine-tuning posterior sobre dominio propio: fusionar el adaptador con Qwen3.8-27B y continuar el ajuste con datos internos, aprovechando que el adaptador es ligero (8,4 GB) frente al modelo completo.
- Evaluación de conformidad de licencias: útil como caso de estudio para equipos que necesitan analizar los riesgos de destilar desde un modelo propietario hacia pesos abiertos antes de un despliegue comercial.
- Prototipado de asistentes con razonamiento explícito en hardware propio, una vez fusionado y cuantizado el modelo base, para tareas donde se quiera inspeccionar la traza de pensamiento.
- Reproducción académica: validar la metodología descrita (dataset `dolci-think-sft-opus5.5`, LoRA r32, cabeza congelada) en entornos de laboratorio con GPUs de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 8,4 GB en disco y requiere cargar además el modelo base Qwen3.8-27B para la inferencia.
- VRAM estimada para el modelo base en BF16: aproximadamente 54 GB de pesos, más caché KV y activaciones; en la práctica, 2×A100 40 GB, 2×H100 o una H100 80 GB.
- En cuantización de 8 bits: en torno a 27-30 GB, viable en una A100 40 GB o RTX 6000 Ada.
- En cuantización de 4 bits: en torno a 14-16 GB de pesos, potencialmente viable en una RTX 4090 (24 GB) con contexto moderado; no confirmado para este adaptador.
- Opciones de despliegue: fusión del adaptador con PEFT y exportación a safetensors, GGUF o AWQ/GPTQ; servido con vLLM o TGI tras la fusión; llama.cpp u Ollama solo tras convertir a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen38-opus55-dolcithink-sft-s1 | 27B (base) + LoRA r32 | No disponible | Adaptador de destilación | other | Hugging Face (0 descargas) |
| Qwen3.8-27B (base) | 27B | No disponible en la información proporcionada | Modelo completo | Según el repositorio de Qwen | Hugging Face |
| Adaptadores de destilación comparables | No disponible | No disponible | LoRA | No disponible | No disponible |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que la destilación haya transferido las capacidades del profesor; el rendimiento real es desconocido.
- Licencia "other" sin texto: no se puede confirmar si el uso comercial está permitido; además, la procedencia de los datos del profesor propietario puede imponer restricciones adicionales sobre los pesos derivados.
- Riesgo legal y de cumplimiento: destilar desde un modelo propietario hacia pesos abiertos puede infringir los términos de servicio del proveedor del profesor; conviene revisarlo antes de cualquier uso en producción.
- Riesgo de alucinación: al ser un ajuste SFT sobre trazas sintéticas, puede reproducir errores del profesor y presentar confianza injustificada en dominios poco representados.
- Idiomas y contexto no documentados: no se puede asumir el multilingüismo ni una ventana de contexto concreta sin verificar el modelo base.
- Repositorio sin tracción: 0 descargas y 0 likes, creado y actualizado en el mismo minuto; no hay validación comunitaria.
- Solo adaptador: requiere descargar el modelo base y fusionar; no es desplegable de forma autónoma.
- La cabeza congelada puede limitar la adaptación al vocabulario o formato de salida del profesor.

## Enlaces

- Hugging Face: https://huggingface.co/asparius/qwen38-opus55-dolcithink-sft-s1
- Dataset de entrenamiento: https://huggingface.co/datasets/asparius/dolci-think-sft-opus5.5
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
