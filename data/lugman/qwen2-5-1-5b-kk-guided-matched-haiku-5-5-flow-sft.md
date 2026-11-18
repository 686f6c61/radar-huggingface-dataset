# lugman/Qwen2.5-1.5B-KK-Guided-Matched-Haiku-5.5-Flow-SFT

## Resumen

El modelo `lugman/Qwen2.5-1.5B-KK-Guided-Matched-Haiku-5.5-Flow-SFT` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen2.5-1.5B-Instruct`, desarrollado por el usuario `lugman` y publicado en Hugging Face. Se trata de un modelo de generacion de texto de 1.543.714.304 parametros (aproximadamente 1,5 mil millones) con arquitectura transformer de tipo Qwen2, orientado a tareas conversacionales y de generacion de texto en ingles.

El modelo parte de la familia Qwen2.5, desarrollada por Alibaba Cloud, y ha sido entrenado mediante SFT (Supervised Fine-Tuning) utilizando las librerias Unsloth y TRL de Hugging Face. El nombre del modelo sugiere un entrenamiento orientado a la generacion de haikus con una estructura de flujo especifica ("Guided-Matched Haiku-5.5-Flow"), aunque la model card no proporciona detalles sobre la composicion del dataset de entrenamiento ni sobre la metodologia exacta empleada.

Por su tamano reducido, este modelo es adecuado para despliegues con recursos limitados, incluyendo GPUs de consumo general. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas. No obstante, la informacion publicada por el autor es minima, sin benchmarks, sin detalles de entrenamiento y con cero descargas registradas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 (~1,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; compatible con cuantizacion via herramientas externas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con mecanismos de atencion estandar (no se especifica atencion lineal ni SSM). El modelo base, `unsloth/Qwen2.5-1.5B-Instruct`, es una version instruct-tuned de Qwen2.5-1.5B, que incorpora mejoras sobre Qwen2 en cuanto a datos de entrenamiento y alineacion. La model card no detalla la composicion del dataset de preentrenamiento ni el numero de tokens utilizados.

El ajuste fino se realizo mediante SFT (Supervised Fine-Tuning) utilizando Unsloth, una libreria optimizada para entrenamiento de bajo coste en memoria, junto con TRL de Hugging Face. El autor indica que el entrenamiento fue "2x faster" gracias a Unsloth, pero no se proporcionan datos sobre el numero de pasos, el tamano del dataset de ajuste, la presencia de RLHF/DPO ni innovaciones tecnicas adicionales como decodificacion especulativa. El nombre del modelo sugiere un entrenamiento especializado en haikus con un flujo guiado y emparejado, pero no hay documentacion que lo confirme.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base instruct.
- Razonamiento basico y respuesta a instrucciones, gracias al ajuste instruct del modelo base.
- Generacion creativa de texto, potencialmente especializada en poesia (haikus) segun el nombre del modelo, aunque no verificado.
- Soporte de tool calling / function calling: no confirmado en la model card; el modelo base Qwen2.5-Instruct lo soporta, pero no se garantiza tras el ajuste fino.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: limitadas al ingles segun la model card (aunque el modelo base Qwen2.5 soporta multiples idiomas, el ajuste fino se declara solo en ingles).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Generacion de haikus y poesia breve: el nombre del modelo sugiere un entrenamiento especifico para este tipo de composicion, por lo que podria emplearse en aplicaciones de generacion poetica o creativa en ingles.
- Prototipado rapido de asistentes conversacionales: con 1,5B parametros, el modelo puede ejecutarse en hardware modesto para pruebas de concepto de chatbots en ingles.
- Generacion de texto en entornos con recursos limitados: su tamano permite desplegarlo en GPUs de consumo (por ejemplo, RTX 3060 o superiores) con cuantizacion, ideal para demos o entornos de desarrollo.
- Filtrado y generacion de contenido creativo: puede usarse para generar variaciones de texto breve, eslóganes o micro-relatos en ingles.
- Educacion y experimentacion con fine-tuning: al ser un modelo pequeno con licencia Apache 2.0, sirve como base para experimentos de ajuste fino en entornos academicos o de investigacion.
- Integracion en pipelines de generacion de texto con la libreria Transformers: compatible con text-generation-inference y endpoints, lo que facilita su despliegue en infraestructuras estandar de Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB en precision FP16 (tamano del repo), y alrededor de 1,5-2 GB con cuantizacion a 8 bits o 4 bits.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100, H100 son compatibles.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de consumo con 4 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060).
- Opciones de despliegue: vLLM, llama.cpp (previa conversion a GGUF), Ollama (previa conversion), Text Generation Inference (TGI), Transformers con PyTorch.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| lugman/Qwen2.5-1.5B-KK-Guided-Matched-Haiku-5.5-Flow-SFT | ~1,5B | No disponible | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 tokens (segun documentacion de Qwen2.5) | Apache 2.0 | Hugging Face |
| unsloth/Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 tokens | Apache 2.0 | Hugging Face |
| meta-llama/Llama-3.2-1B-Instruct | ~1,2B | 128.000 tokens | Llama 3.2 Community License | Hugging Face |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de Qwen2.5, puede heredar sesgos presentes en los datos de entrenamiento del modelo base.
- Riesgo de alucinacion: presente en modelos de este tamano, especialmente en tareas de razonamiento complejo o generacion de hechos verificables.
- Limitaciones de contexto o idioma: el modelo se declara solo en ingles; la longitud de contexto no esta documentada y podria haberse reducido respecto al modelo base.
- Restricciones de licencia para uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero se recomienda verificar la licencia del modelo base (Qwen2.5 tambien es Apache 2.0).
- Caveats para produccion: la model card es minima, sin benchmarks ni detalles de entrenamiento; el modelo tiene cero descargas y cero likes, lo que indica falta de validacion por la comunidad. No se recomienda su uso en produccion sin una evaluacion exhaustiva previa. El nombre del modelo sugiere una especializacion en haikus que no esta documentada ni verificada.

## Enlaces

- Hugging Face: https://huggingface.co/lugman/Qwen2.5-1.5B-KK-Guided-Matched-Haiku-5.5-Flow-SFT
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://huggingface.co/docs/trl
