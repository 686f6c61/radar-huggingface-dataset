# science-of-model-organisms/qwen2.5-7b-it_impulsive-dpo-lora

## Resumen

`qwen2.5-7b-it_impulsive-dpo-lora` es un adaptador LoRA publicado por el colectivo science-of-model-organisms dentro de su proyecto MOBench. No se trata de un modelo entrenado para uso productivo, sino de un *model organism*: un artefacto de investigación en el que se ha implantado deliberadamente un comportamiento concreto (en este caso, una persona "impulsiva") sobre un modelo base, con el objetivo de estudiar y comparar metodologías de implantación de conductas.

El repositorio contiene únicamente el adaptador final entrenado (iteración v4), empaquetado con la librería PEFT en formato safetensors, con un tamaño aproximado de 0,7 GB. Los checkpoints intermedios y el estado de entrenamiento no se migraron a esta publicación, y la model card no documenta el modelo base concreto, la metodología de implantación ni los hiperparámetros utilizados.

La relevancia de esta ficha es acotada y hay que enmarcarla correctamente: es una pieza para investigación sobre alineación, interpretabilidad y evaluación de comportamientos inducidos, no una alternativa a modelos de propósito general. Cualquier uso en producción queda fuera del alcance previsto por el autor y, además, la licencia no está declarada de forma explícita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un modelo base no especificado; por el nombre del repositorio se infiere Qwen2.5-7B-Instruct, pero la model card indica "Base model: None" |
| Parametros totales | No disponible (el adaptador ocupa ~0,7 GB; el modelo base no se especifica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantización dependería del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible; según la model card, hereda la licencia del modelo base, que figura como "None" |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se aplican sobre las capas de un transformer preentrenado. La model card etiqueta el método de implantación como "lora" y la técnica de ajuste como DPO (según el sufijo del nombre del repositorio), aunque el documento no detalla rangos, capas objetivo, hiperparámetros de entrenamiento, composición del dataset ni el número de pasos realizados.

El proyecto MOBench se dedica precisamente a comparar métodos de implantación de comportamientos, por lo que este adaptador debe interpretarse como una muestra de una metodología más amplia. La información publicada no incluye detalles sobre el proceso de generación de datos de preferencia, la función de pérdida empleada ni los controles de calidad aplicados. La procedencia del release se remite a la revisión `ca9ce718ecbfc80fc9af17049b19bd526b431bde` del registro MO del proyecto.

## Capacidades

- Al ser un adaptador sobre un modelo de la familia Qwen2.5-7B-Instruct (inferido del nombre), heredaría las capacidades del base: generación de texto, razonamiento, código y matemáticas. No obstante, la model card no las documenta.
- El comportamiento implantado es una persona "impulsiva", cuyo efecto concreto sobre las respuestas no se describe ni se cuantifica en la información disponible.
- Soporte de tool calling / function calling: no disponible en la documentación del adaptador (dependería del modelo base).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre implantación de comportamientos: el adaptador sirve como muestra controlada de una persona inducida para comparar métodos de implantación dentro del marco MOBench.
- Evaluación de robustez y detección: permite estudiar si las técnicas de auditoría identifican comportamientos anómalos introducidos vía LoRA.
- Estudios de interpretabilidad: analizar qué direcciones del espacio de activaciones se ven afectadas por un adaptador que induce impulsividad.
- Reproducción de experimentos: combinado con el código de MOBench, permite replicar la iteración v4 y contrastarla con otras variantes del proyecto.
- Docencia y formación en seguridad de IA: ejemplo práctico de cómo un adaptador de bajo rango puede alterar el comportamiento de un modelo base.
- Comparación de metodologías DPO frente a otras técnicas de implantación: el sufijo `-dpo-lora` sugiere que forma parte de una matriz comparativa, aunque los detalles no están publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador pesa ~0,7 GB; el requisito real depende del modelo base, que no está especificado. Para un transformer de 7B en fp16 se necesitan del orden de 14-16 GB de VRAM solo para los pesos, más memoria para el contexto y el adaptador.
- GPU recomendadas: no disponibles en la documentación. Para un 7B en fp16, GPUs de 24 GB (RTX 4090, A10G, L4 con cuantización) serían suficientes; para despliegue en fp16 con contexto largo, A100/H100.
- Cabe en GPU de consumo: probablemente sí si se aplica sobre un base de 7B cuantizado (por ejemplo, 4-bit), pero no está verificado en la información proporcionada.
- Opciones de despliegue: PEFT (carga del adaptador), vLLM con soporte LoRA, TGI, llama.cpp/Ollama si se fusiona el adaptador con el base. No documentado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-7b-it_impulsive-dpo-lora | Adaptador LoRA (model organism) | No disponible (~0,7 GB el adaptador) | No disponible | No disponible | Hugging Face |
| Qwen2.5-7B-Instruct | Modelo completo instruct | 7B | 32K (según documentación pública del base) | Apache 2.0 (según documentación pública del base) | Hugging Face |
| Adaptadores LoRA de propósito general | Adaptadores PEFT | Variable | Depende del base | Variable | Hugging Face |

No se dispone de comparativas de rendimiento publicadas para este adaptador frente a alternativas, ni de datos que permitan situarlo en una tabla de benchmarks.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor lo describe como "research artifact for method comparison, not a production model".
- Comportamiento deliberadamente implantado: la persona "impulsiva" puede producir respuestas sesgadas, erráticas o inapropiadas; no debe desplegarse en entornos de cara al usuario.
- Modelo base no documentado: la model card indica "Base model: None", lo que impide reproducir el entorno exacto de inferencia sin consultar el registro MO del proyecto.
- Licencia no declarada: hereda la del base, que figura como "None"; el uso comercial es jurídicamente incierto.
- Sin datos de benchmarks, idiomas, contexto ni cuantización: la evaluación objetiva del adaptador no es posible con la información publicada.
- Riesgo de alucinación: no evaluado; al tratarse de un adaptador sobre un LLM, el riesgo persiste y no hay documentación específica.
- Sesgos conocidos: no documentados; el comportamiento inducido podría amplificar sesgos del base.
- Checkpoints intermedios no publicados: limita la reproducibilidad del proceso de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/science-of-model-organisms/qwen2.5-7b-it_impulsive-dpo-lora
- Repositorio del proyecto MOBench: https://github.com/science-of-model-organisms/mobench
- Revisión de procedencia: `ca9ce718ecbfc80fc9af17049b19bd526b431bde` (registro MO del proyecto)
