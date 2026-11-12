# lugman/LFM2.5-350M-Math-SFT-adapter

## Resumen

LFM2.5-350M-Math-SFT-adapter es un adaptador de ajuste fino supervisado (SFT) sobre el modelo base LiquidAI/LFM2.5-350M, desarrollado por el usuario lugman y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un adaptador LoRA entrenado con Unsloth y TRL, orientado a tareas de matematicas, sobre la arquitectura LFM2 de Liquid AI.

El modelo base LFM2.5-350M es un modelo compacto de la familia LFM2 (Liquid Foundation Models), disenado para inferencia eficiente en dispositivos con recursos limitados. El adaptador hereda las caracteristicas del modelo base y anade un ajuste especifico para tareas matematicas, aunque la model card no documenta el dataset, el numero de pasos ni los hiperparametros del entrenamiento.

La relevancia de esta ficha es limitada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, el tamano del repo es de 0.0 GB y no se han publicado benchmarks ni detalles tecnicos del ajuste. Se trata, por tanto, de una publicacion experimental de un adaptador, no de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (modelo base LiquidAI/LFM2.5-350M); adaptador LoRA sobre el modelo base |
| Parametros totales | 350M (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador); el modelo base en formato nativo de transformers |

## Arquitectura y entrenamiento

El adaptador se construye sobre LiquidAI/LFM2.5-350M, un modelo de la familia LFM2 de Liquid AI. La model card no especifica la arquitectura interna del modelo base (transformer, SSM o hibrida), por lo que no se puede confirmar el tipo de mecanismo de atencion ni la composicion del dataset de preentrenamiento.

El ajuste fino se realizo mediante SFT (supervised fine-tuning) con las librerias Unsloth y TRL, segun los tags del repositorio. Unsloth se utiliza habitualmente para entrenamiento LoRA/QLoRA de bajo coste en GPU de consumo. No se documentan el numero de tokens de entrenamiento, la composicion del dataset matematico, la existencia de RLHF/DPO ni innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto en ingles (idioma declarado en la model card).
- Ajuste especifico para tareas de matematicas (SFT), segun el nombre del repositorio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas a ingles segun el campo `language`.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Experimentacion academica con adaptadores LoRA: el repositorio sirve como ejemplo de flujo Unsloth + TRL sobre un modelo LFM2 pequeno, util para reproducir pipelines de SFT.
- Prototipado de asistentes matematicos en ingles: el adaptador puede probarse en tareas de resolucion de problemas aritmeticos simples, aunque sin benchmarks publicados no hay garantia de calidad.
- Evaluacion comparativa de adaptadores: util para investigadores que quieran medir el efecto de un SFT matematico sobre un modelo base de 350M.
- Despliegue en entornos con recursos muy limitados: al partir de un modelo de 350M, el conjunto base + adaptador puede ejecutarse en CPU o GPU de gama baja, si bien el rendimiento real no esta documentado.
- Fines educativos: demostracion de como publicar un adaptador en Hugging Face con metadatos de licencia y modelo base.
- Integracion en pipelines de text-generation-inference: el tag `text-generation-inference` sugiere compatibilidad con TGI, aunque no se detalla la configuracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo base de 350M en fp16 se estima en torno a 1 GB, y en cuantizacion de 4 bits en torno a 0.3-0.5 GB, aunque estos calculos no estan confirmados por el autor.
- GPU recomendadas: no disponible. Por tamano, el modelo base cabria en GPU de consumo como RTX 3060, RTX 4060 o superiores.
- Cabe en consumer GPU: previsiblemente si, dado el tamano del modelo base (350M), aunque no hay confirmacion oficial.
- Opciones de despliegue: transformers (libreria declarada); compatibilidad con TGI segun tags; no se confirma soporte de vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LFM2.5-350M-Math-SFT-adapter (este) | 350M (base) + adaptador | no disponible | apache-2.0 | Hugging Face, 0 descargas | Adaptador SFT matematico experimental |
| LiquidAI/LFM2.5-350M (base) | 350M | no disponible | no disponible en esta ficha | Hugging Face | Modelo base oficial de Liquid AI |
| Qwen2.5-0.5B | 0.5B | no disponible en esta ficha | apache-2.0 | Hugging Face | Alternativa compacta multilingue |
| SmolLM2-360M | 360M | no disponible en esta ficha | apache-2.0 | Hugging Face | Alternativa compacta en ingles |

Nota: los datos de los modelos comparativos no provienen de la informacion proporcionada y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora sobre el modelo base en tareas matematicas.
- Repositorio sin traccion: 0 descargas y 0 likes, lo que reduce la validacion por parte de la comunidad.
- Idioma limitado al ingles: no se declara soporte de castellano ni de otros idiomas.
- Model card minima: no se documentan dataset, hiperparametros, numero de pasos ni proceso de evaluacion.
- Riesgo de alucinacion: inherente a modelos de 350M, especialmente en razonamiento matematico multi-paso.
- Sesgos: no documentados por el autor; heredados del modelo base y del dataset de SFT no especificado.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar la licencia del modelo base LiquidAI/LFM2.5-350M, que no se detalla en esta ficha.
- Tamano del repo de 0.0 GB: posiblemente los pesos del adaptador no esten subidos o el calculo de tamano no refleje el contenido real; conviene verificar los archivos antes de usarlo.
- No apto para produccion sin evaluacion previa: la ausencia de datos de rendimiento y de validacion desaconseja su uso en entornos criticos.

## Enlaces

- Hugging Face: https://huggingface.co/lugman/LFM2.5-350M-Math-SFT-adapter
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- Liquid AI: https://www.liquid.ai/
