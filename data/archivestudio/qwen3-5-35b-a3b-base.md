# ArchiveStudio/Qwen3.5-35B-A3B-Base

## Resumen

Qwen3.5-35B-A3B-Base es un modelo fundacional multimodal de tipo vision-lenguaje desarrollado por el equipo Qwen (Alibaba). Se distribuye como checkpoint preentrenado (no instruido) en formato Hugging Face Transformers, con licencia Apache 2.0. Su proposito principal es servir de base para fine-tuning, experimentos de aprendizaje en contexto e investigacion, mas que para interaccion directa con usuarios finales.

La arquitectura combina capas de atencion lineal Gated DeltaNet con capas de atencion completa (Gated Attention) en un patron hibrido, y utiliza un Mixture-of-Experts disperso con 256 expertos, de los que se activan 8 enrutados mas 1 compartido. Con 35.951.822.704 parametros totales y aproximadamente 3B activos por token, el modelo esta disenado para obtener alto throughput de inferencia con bajo coste computacional relativo a su tamano total.

El contexto nativo es de 262.144 tokens, extensible hasta 1.010.000 tokens. Incluye un codificador de vision y fue entrenado con fusion temprana sobre tokens multimodales, lo que lo situa como una base relevante para construir agentes nativos multimodales y pipelines de investigacion que requieran ventanas de contexto muy largas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con vision encoder; hibrida Gated DeltaNet (atencion lineal) + Gated Attention, con Mixture-of-Experts |
| Parametros totales | 35.951.822.704 |
| Parametros activos | ~3B (8 expertos enrutados + 1 compartido por token) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.010.000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 201 idiomas y dialectos (segun model card); lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal con codificador de vision. La columna vertebral del lenguaje tiene 40 capas organizadas en un patron de 10 bloques, cada uno compuesto por 3 sub-bloques de Gated DeltaNet seguidos de 1 sub-bloque de Gated Attention. La Gated DeltaNet emplea 32 cabezas de atencion lineal para V y 16 para QK, con dimension de cabeza 128. La Gated Attention usa 16 cabezas para Q y 2 para KV, con dimension de cabeza 256 y dimension de RoPE de 64. La dimension oculta es 2048 y el vocabulario (embedding y salida) es de 248.320 tokens con padding.

La capa MoE contiene 256 expertos con dimension intermedia de 512; por token se activan 8 expertos enrutados mas 1 compartido. El modelo fue entrenado con multi-token prediction (MTP) en varios pasos. Segun la model card, el entrenamiento se realizo con fusion temprana sobre tokens multimodales, con una eficiencia de entrenamiento multimodal cercana al 100 % respecto al entrenamiento solo de texto, y con marcos de RL asincrono para orquestacion de agentes a gran escala. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO (el checkpoint es de preentrenamiento).

## Capacidades

- Generacion de texto y modelado de lenguaje causal (checkpoint base, sin ajuste de instrucciones).
- Comprension de imagenes y texto combinados (pipeline image-text-to-text), gracias al codificador de vision y a la fusion temprana multimodal.
- Razonamiento, codigo y matematicas como capacidades de base, segun las comparaciones declaradas en la model card frente a Qwen3 y Qwen3-VL.
- Soporte de tool calling y function calling: no confirmado explicitamente para este checkpoint base en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: la model card menciona entrenamiento con RL escalado en entornos multi-agente, orientado a adaptabilidad en tareas reales.
- Capacidades multilingues amplias: 201 idiomas y dialectos declarados.
- Tokens de control `<|im_start|>` y `<|im_end|>` entrenados para permitir PEFT tipo LoRA con la plantilla de chat oficial sin reentrenar embeddings.
- Capacidad de contexto largo: 262.144 tokens nativos, extensible a 1.010.000.

## Casos de uso

- Fine-tuning supervisado para dominios verticales: al ser un checkpoint base con licencia Apache 2.0, es adecuado para ajuste con SFT o LoRA sobre datos propios (legal, sanitario, financiero) partiendo de una base multimodal de 35B con solo ~3B activos por token.
- Investigacion en aprendizaje en contexto: su ventana nativa de 262.144 tokens permite experimentos con muchos ejemplos demostrativos en el prompt sin truncamiento, util para estudiar el comportamiento de modelos MoE multimodales a gran contexto.
- Procesamiento de documentos largos con imagenes: digitalizacion y comprension de informes, facturas o articulos cientificos que combinan texto extenso y figuras, aprovechando el codificador de vision y el contexto largo.
- Desarrollo de agentes multimodales: la combinacion de entrenamiento con RL multi-agente y contexto extensible hasta 1.010.000 tokens lo hace candidato para scaffolds de agentes que mantienen historiales largos de interacciones y observaciones visuales.
- Generacion de codigo asistida en pipelines de investigacion: uso como base para fine-tuning en tareas de codigo y posterior integracion en entornos de desarrollo, con inferencia de alto throughput gracias a la activacion dispersa.
- Experimentos de destilacion y evaluacion comparativa: util como modelo de referencia de 35B con ~3B activos para estudiar el equilibrio entre capacidad y coste frente a modelos densos del mismo orden.
- Despliegue multilingue de bajo coste: cobertura de 201 idiomas y dialectos para prototipos de traduccion, resumen o extraccion de informacion en mercados con muchos idiomas, con la salvedad de que es un modelo base y requiere ajuste para calidad de producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card afirma paridad intergeneracional con Qwen3 y superioridad frente a Qwen3-VL en razonamiento, codigo, agentes y comprension visual, pero no incluye cifras concretas (MMLU, HumanEval, GSM8K u otros) en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, los pesos en safetensors ocupan 71,9 GB en el repositorio, lo que en precision de 16 bits exige agregados de GPU superiores a ese tamano; la cuantizacion a 8 o 4 bits reduciria el requisito, pero no se han publicado recetas oficiales para este checkpoint.
- GPU recomendadas: no especificadas en la informacion disponible. Por volumen de pesos, un despliegue en 16 bits requiere multiples GPU de clase A100/H100 (por ejemplo, 2 x 80 GB o mas); no se confirma soporte en consumer GPU.
- Cabe en consumer GPU: no disponible. Con 35.951.822.704 parametros totales, la inferencia en una sola GPU de consumo exigiria cuantizacion agresiva no documentada.
- Opciones de despliegue: la model card indica compatibilidad con Hugging Face Transformers, vLLM y SGLang. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles. La arquitectura hibrida y la activacion de ~3B parametros por token estan disenadas para alto throughput y baja latencia, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-35B-A3B-Base | 35,95B / ~3B | 262.144 nativo, hasta 1.010.000 | Apache 2.0 | Multimodal, hibrido Gated DeltaNet + MoE |
| Qwen3 (referencia citada) | no disponible | no disponible | no disponible | La model card declara paridad intergeneracional; sin cifras |
| Qwen3-VL (referencia citada) | no disponible | no disponible | no disponible | La model card declara superioridad de Qwen3.5 en razonamiento, codigo, agentes y vision; sin cifras |

No se dispone de datos numericos de parametros, contexto ni rendimiento de los modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Es un checkpoint exclusivamente preentrenado: no esta ajustado para seguir instrucciones ni para interaccion directa; su uso previsto es fine-tuning e investigacion.
- Riesgo de alucinacion inherente a los modelos de lenguaje base, agravado en tareas de recuperacion de hechos y en generacion abierta sin ajuste posterior.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre corpus web a gran escala, es esperable la presencia de sesgos linguisticos, culturales y de representacion, pero no hay evaluacion publicada en el material proporcionado.
- Limitaciones de idioma: se declaran 201 idiomas y dialectos, pero no se especifica el nivel de calidad por idioma ni la lista concreta.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el titular del repositorio es ArchiveStudio y la licencia enlazada apunta al repositorio oficial de Qwen; conviene verificar la procedencia y los terminos aplicables antes de un despliegue comercial.
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no es una distribucion oficial verificada; debe tratarse con cautela en produccion.
- No hay informacion sobre cuantizaciones oficiales, latencias medidas ni resultados de benchmarks, lo que dificulta una evaluacion de rendimiento previa al despliegue.
- La extension de contexto hasta 1.010.000 tokens no viene acompanada de datos sobre degradacion de calidad en ventanas tan largas.

## Enlaces

- Hugging Face: https://huggingface.co/ArchiveStudio/Qwen3.5-35B-A3B-Base
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Licencia referenciada: https://huggingface.co/Qwen/Qwen3.5-35B-A3B-Base/blob/main/LICENSE
- Qwen Chat: https://chat.qwen.ai
- Logo del modelo: https://qianwen-res.oss-accelerate.aliyuncs.com/logo_qwen3.5.png
