# amiiruu/study-tutor

## Resumen

StudyTutor (`amiiruu/study-tutor`) es un ajuste fino (fine-tuning) del modelo Qwen3-4B-Instruct-2507, desarrollado por el usuario amiiruu, orientado a tareas de tutoría académica en matemáticas (desde aritmética hasta cálculo), física, química, biología e inglés. Se trata de un adaptador LoRA entrenado con Unsloth y QLoRA sobre GPUs gratuitas de Kaggle, publicado tanto en formato safetensors como en GGUF para su uso con Ollama.

El modelo hereda la arquitectura transformer densa de Qwen3-4B-Instruct-2507, con aproximadamente 4.022 millones de parámetros totales (4B) y una ventana de contexto que no se especifica en la información disponible. Su relevancia radica en ser un ejemplo de ajuste fino ligero y de bajo coste para un dominio educativo concreto, empaquetado para despliegue inmediato en entornos de consumo mediante cuantización Q4_K_M.

La ficha se basa exclusivamente en los metadatos de Hugging Face y en la model card del autor; no se han publicado resultados de benchmarks, detalles del dataset de entrenamiento ni especificaciones completas de contexto o cuantizaciones más allá de la mención a GGUF y Q4_K_M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 (~4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (se menciona Q4_K_M); safetensors en precisión original no especificada |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3-4B-Instruct-2507, un transformer denso de aproximadamente 4B parámetros. El entrenamiento se realizó con Unsloth y QLoRA (cuantización de bajo rango) sobre GPUs gratuitas de Kaggle, lo que indica un proceso de adaptación ligero mediante adaptadores LoRA fusionados o exportados junto con los pesos base. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO adicionales.

La especialización declarada abarca matemáticas (aritmética a cálculo), física, química, biología e inglés, lo que sugiere un dataset de instrucciones de tipo educativo. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o modos de razonamiento extendido más allá de las capacidades heredadas del modelo base.

## Capacidades

- Generación de texto conversacional en inglés con orientación educativa.
- Resolución de problemas matemáticos desde aritmética básica hasta cálculo.
- Explicación de conceptos de física, química y biología.
- Apoyo en tareas de inglés (gramática, vocabulario, redacción), según los dominios declarados.
- Formato conversacional (tag `conversational`) apto para diálogos multi-turno.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada (aunque el modelo base Qwen3 lo soporta, no se confirma para este ajuste).
- Capacidades de agente y razonamiento multi-paso: no documentadas específicamente.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Tutoría de matemáticas paso a paso: el modelo puede descomponer problemas de aritmética, álgebra y cálculo en explicaciones intermedias, adecuado por su ajuste específico en el dominio y su tamaño de 4B que permite despliegue local.
- Apoyo al estudio de ciencias: resolución de dudas de física, química y biología con explicaciones conceptuales, aprovechando el entrenamiento específico sobre estas materias.
- Práctica de inglés: corrección de gramática, ampliación de vocabulario y generación de ejercicios, dentro del alcance declarado por el autor.
- Despliegue local en Ollama: ejecución mediante `ollama run hf.co/amiiruu/study-tutor:Q4_K_M`, apto para equipos de consumo sin GPU de datacenter.
- Asistente educativo integrado en aplicaciones: al ser compatible con endpoints y de licencia Apache 2.0, puede incorporarse en backends de chatbots de estudio.
- Generación de material de repaso: creación de preguntas, resúmenes y explicaciones a partir de apuntes, en inglés.
- Prototipado de investigación en ajuste fino educativo: sirve como referencia de pipeline Unsloth + QLoRA sobre Qwen3-4B para experimentos de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB en GGUF Q4_K_M (tamaño del repo 2,6 GB); en FP16, alrededor de 8 GB para los 4B parámetros.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M; para FP16, se recomienda 8-12 GB (RTX 3060 12 GB, RTX 4070, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en modelos como RTX 3060, RTX 4060 Ti, RTX 4070 y superiores con cuantización Q4_K_M; también puede ejecutarse en CPU con llama.cpp/Ollama.
- Opciones de despliegue: Ollama (vía `hf.co/amiiruu/study-tutor:Q4_K_M`), llama.cpp para GGUF, y potencialmente vLLM/TGI con safetensors (no confirmado en la información).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| StudyTutor (amiiruu/study-tutor) | ~4B | no disponible | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| Qwen3-4B-Instruct-2507 (base) | ~4B | no disponible en la información | Apache 2.0 | Hugging Face |
| Alternativas de tutoría de 3-7B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo ni de otros modelos de tutoría equivalentes en la información proporcionada.

## Limitaciones y advertencias

- Entrenado y declarado únicamente para inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación en contenidos científicos y matemáticos, especialmente en problemas complejos; requiere verificación humana en contextos educativos formales.
- Sesgos conocidos: no documentados por el autor; al derivar de Qwen3, puede heredar sesgos del corpus base.
- Sin benchmarks publicados que permitan validar la calidad del ajuste frente al modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validación por la comunidad.
- Longitud de contexto no especificada; no se debe asumir la del modelo base sin confirmación.
- El ajuste se realizó en GPUs gratuitas de Kaggle, lo que puede implicar limitaciones en el volumen y calidad del dataset de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/amiiruu/study-tutor
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Unsloth: https://github.com/unslothai/unsloth
- Ollama: https://ollama.com
- Blog de referencia encontrado en la búsqueda (sin relación directa con el modelo): https://zkverify.io/blog
