# aliahmed463/smollm2-360m-sft

## Resumen

Smollm2-360m-sft es un ajuste fino supervisado (SFT) publicado por el usuario aliahmed463 en Hugging Face, derivado de la familia SmolLM2 de Hugging Face. A pesar del nombre del repositorio, los pesos reales en formato safetensors suman 3.090.212.864 parametros, es decir, aproximadamente 3.090 millones, lo que corresponde al tamano de 3B de la familia SmolLM2 y no a los 360 millones que sugiere el identificador. El modelo se distribuye con la libreria transformers, pesos safetensors y un pipeline de text-generation, y ha sido entrenado con TRL mediante SFT sobre datos conversacionales.

El modelo resuelve el problema de disponer de un modelo conversacional de ~3B parametros ajustado para seguir instrucciones y mantener dialogos multi-turno, un rango de tamano que permite despliegue en GPU de consumo con cuantizacion. Es relevante ahora porque los modelos de la familia SmolLM2 estan disenados para ser eficientes y ligeros, y este checkpoint anade un ajuste SFT orientado a conversacion, lo que lo hace candidato para prototipado rapido, experimentacion academica y despliegues con recursos limitados.

La model card es una plantilla autogenerada por Hugging Face y no aporta informacion sobre datos de entrenamiento, hiperparametros, licencia, idiomas ni evaluacion. Todo lo que no consta en la informacion proporcionada se marca como no disponible en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia SmolLM2; detalles no disponibles) |
| Parametros totales | 3.090.212.864 (~3,09B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se confirman pesos safetensors en el repo) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 6,2 GB |
| Pipeline | text-generation |
| Metodo de entrenamiento | SFT con TRL |
| Fecha de creacion | 2026-11-02 |
| Fecha de actualizacion | 2026-11-02 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia SmolLM2, segun indican los tags del repositorio (smollm3, smollm2 en el ID) y el pipeline de text-generation. El recuento real de parametros en safetensors (3.090.212.864) lo situa en el escalon de ~3B de dicha familia. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, cabezas de atencion, tipo de atencion (completa o con mecanismos eficientes), tokenizador ni vocabulario.

El entrenamiento declarado es un ajuste fino supervisado (SFT) mediante la libreria TRL, partiendo presumiblemente de un checkpoint base SmolLM2, con el objetivo de obtener un modelo conversacional. No consta el dataset utilizado, el numero de tokens de entrenamiento, la composicion de los datos, si hubo etapas de RLHF o DPO, ni los hiperparametros (precision, learning rate, batch size, regimen de entrenamiento). Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y conversacion multi-turno, derivadas del pipeline text-generation y del ajuste SFT con datos conversacionales.
- Seguimiento de instrucciones (instruction following) como resultado esperado del SFT, aunque no hay evaluacion publicada que lo cuantifique.
- Generacion de codigo y razonamiento: capacidad plausible por herencia de la familia SmolLM2, pero no verificada ni documentada en este checkpoint.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (thinking mode, vision, audio): no disponible.
- Contexto largo: no disponible (no consta la longitud de ventana).

## Casos de uso

- Prototipado de asistentes conversacionales: el ajuste SFT sobre datos conversacionales permite desplegar un chatbot de proposito general en entornos de desarrollo con una sola GPU de consumo, usando cuantizacion de 4 u 8 bits para reducir el footprint de ~6,2 GB en fp16.
- Experimentacion academica y docencia: al ser un modelo de ~3B parametros con pesos safetensors y libreria transformers, es adecuado para estudiar el efecto del SFT, comparar checkpoints base frente a ajustados y reproducir pipelines de TRL en laboratorios con recursos limitados.
- Generacion de texto asistida en local: integrable en herramientas de escritura o resumen mediante la API de transformers, con inferencia en CPU o GPU modesta segun la cuantizacion elegida.
- Evaluacion comparativa de tecnicas de ajuste: sirve como punto de partida para experimentos de DPO, RLHF o LoRA sobre un modelo pequeno antes de escalar a modelos mayores.
- Despliegue en entornos con restricciones de hardware: al caber en GPUs de 8-16 GB con cuantizacion, puede ejecutarse en estaciones de trabajo o portatiles con GPU dedicada para demos internas.
- Fine-tuning posterior especifico de dominio: al ser un checkpoint SFT, es una base razonable para ajustes adicionales con LoRA en tareas concretas (clasificacion, extraccion, dialogo especializado), aunque sin licencia declarada el uso comercial queda condicionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp16 ocupan aproximadamente 6,2 GB; en cuantizacion de 8 bits, unos 3,1 GB; en 4 bits, unos 1,6 GB (estimaciones teoricas a partir del recuento de parametros, no verificadas con este checkpoint).
- GPU recomendadas: para fp16, GPU con 8 GB o mas (RTX 3070/4060 Ti, RTX 4080, RTX 4090, A10, L4); para cuantizacion 4/8 bits, GPU con 4-6 GB pueden ser suficientes.
- Cabe en GPU de consumo: si, en tarjetas con 6-8 GB de VRAM o mas, dependiendo de la cuantizacion y de la longitud de contexto efectiva.
- Opciones de despliegue: transformers (libreria declarada); vLLM, llama.cpp, Ollama o TGI son opciones plausibles para un transformer decoder-only, pero no estan confirmadas para este checkpoint concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| aliahmed463/smollm2-360m-sft | ~3,09B | No disponible | No disponible | Hugging Face (0 descargas) |
| SmolLM2-1.7B (Hugging Face) | 1,7B | No disponible en esta ficha | No disponible en esta ficha | Hugging Face |
| SmolLM2-360M (Hugging Face) | 360M | No disponible en esta ficha | No disponible en esta ficha | Hugging Face |
| Qwen2.5-3B (Alibaba) | 3,09B | No disponible en esta ficha | No disponible en esta ficha | Hugging Face |

Nota: los datos de los modelos comparables no se han verificado en la informacion proporcionada y se incluyen solo como referencia de categoria; no se dispone de resultados de benchmarks para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- La model card es una plantilla autogenerada sin informacion sustantiva: no hay datos de entrenamiento, evaluacion, sesgos ni recomendaciones de uso.
- No se declara licencia, por lo que el uso comercial y la redistribucion quedan en un limbo legal hasta que el autor lo aclare.
- No se declaran idiomas soportados; el rendimiento en castellano es desconocido y probablemente limitado si el ajuste SFT se hizo solo en ingles.
- No hay evaluacion publicada: se desconoce el riesgo de alucinacion, la calidad del seguimiento de instrucciones y el comportamiento en tareas de codigo o matematicas.
- El nombre del repositorio (360m) no coincide con el recuento real de parametros (~3,09B), lo que puede inducir a error en la seleccion del checkpoint.
- El modelo tiene 0 descargas y 0 likes, sin evidencia de uso en produccion ni validacion por la comunidad.
- La longitud de contexto no esta documentada; no se debe asumir una ventana larga sin verificacion empirica.
- Al ser un ajuste SFT sin etapa de alineacion documentada (RLHF/DPO), es esperable una menor robustez frente a prompts adversarios, aunque no hay datos que lo confirmen.

## Enlaces

- Hugging Face: https://huggingface.co/aliahmed463/smollm2-360m-sft
- Paper de referencia citado en los tags (Machine Learning Impact calculator, Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact#compute
