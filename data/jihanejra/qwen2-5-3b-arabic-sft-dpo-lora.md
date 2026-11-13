# JihaneJra/qwen2.5-3b-arabic-sft-dpo-lora

## Resumen

JihaneJra/qwen2.5-3b-arabic-sft-dpo-lora es un ajuste fino (fine-tuning) del modelo Qwen2.5-3B-Instruct, desarrollado por el usuario JihaneJra y publicado en Hugging Face. Segun el nombre del repositorio, el entrenamiento combina una fase de supervised fine-tuning (SFT) con una fase de optimizacion por preferencias (DPO), orientadas al idioma arabe, aunque la model card no documenta ni el dataset ni los hiperparametros utilizados. El modelo base es la version cuantizada a 4 bits de Qwen2.5-3B-Instruct publicada por Unsloth (unsloth/Qwen2.5-3B-Instruct-bnb-4bit).

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-3B, con aproximadamente 3.090 millones de parametros, y se distribuye como adaptadores LoRA en formato safetensors (0,3 GB), no como pesos completos. Esto implica que para su uso hay que cargar el modelo base y aplicar los adaptadores, o bien fusionarlos previamente. El entrenamiento se realizo con la libreria Unsloth, que segun la model card permite un entrenamiento "2x mas rapido" mediante kernels optimizados.

Su relevancia es limitada y muy especifica: se trata de un experimento de ajuste fino de un modelo pequeno (3B) para arabe, con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados y sin documentacion del proceso de entrenamiento. Es util como referencia para quien quiera reproducir un pipeline SFT+DPO con Unsloth sobre Qwen2.5-3B, pero no como modelo de produccion sin una evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), ajuste fino con LoRA |
| Parametros totales | ~3.090 millones (modelo base Qwen2.5-3B); los adaptadores LoRA publicados son una fraccion de ese total |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-3B-Instruct soporta hasta 32.768 tokens |
| Tipos de cuantizacion | el modelo base de partida esta cuantizado en 4 bits (bnb-4bit); los adaptadores se publican en safetensors (precision del adaptador no especificada) |
| Idiomas soportados | en (segun la model card); el nombre del repositorio sugiere entrenamiento orientado a arabe, pero no esta documentado |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores LoRA); requiere el modelo base unsloth/Qwen2.5-3B-Instruct-bnb-4bit |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen2.5-3B-Instruct, un transformer decoder-only con atencion por causalidad, RoPE, normalizacion RMSNorm y activacion SwiGLU, propio de la familia Qwen2.5. Sobre esa base se aplicaron adaptadores LoRA (Low-Rank Adaptation) entrenados con Unsloth y la libreria TRL, en un pipeline que, segun el nombre del repositorio, incluye una etapa de SFT seguida de una etapa de DPO. El modelo base de partida esta cuantizado en 4 bits (bitsandbytes), lo que reduce el coste de memoria durante el entrenamiento.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la mezcla de idiomas, los hiperparametros de LoRA (rango, alpha, dropout), la tasa de aprendizaje ni el numero de pasos. Tampoco se documenta si el DPO se aplico sobre pares de preferencia en arabe o en ingles, ni si se realizo alguna evaluacion posterior al entrenamiento. La unica innovacion tecnica mencionada es el uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generacion de texto conversacional y de instrucciones, heredada de Qwen2.5-3B-Instruct.
- Razonamiento basico y respuesta a preguntas, limitado por el tamano de 3B parametros.
- Generacion de codigo y matematicas a nivel basico (capacidad del modelo base, no verificada tras el ajuste).
- Soporte de tool calling y function calling heredado de Qwen2.5-Instruct (no verificado en este ajuste).
- Capacidad multilingue del modelo base (Qwen2.5 soporta varios idiomas), aunque la model card solo declara ingles y el ajuste parece orientado a arabe.
- No se documenta soporte de vision, audio ni modo "thinking" explicito.

## Casos de uso

- Experimentacion con pipelines SFT+DPO: el repositorio sirve como ejemplo reproducible de como aplicar Unsloth y TRL sobre Qwen2.5-3B para un idioma concreto; util para investigadores que quieran comparar configuraciones de LoRA.
- Prototipado de asistentes en arabe: si el ajuste funciona segun lo esperado, podria emplearse para generar respuestas conversacionales en arabe en entornos de bajo coste, aunque requiere validacion previa con un conjunto de evaluacion propio.
- Despliegue en hardware modesto: al partir de un modelo de 3B en 4 bits, cabe en GPUs de consumo (por ejemplo, RTX 3060 de 12 GB o superiores) y permite iterar rapidamente en local.
- Fine-tuning incremental: los adaptadores LoRA pueden fusionarse con el modelo base y servir de punto de partida para nuevos ajustes sobre dominios especificos (legal, sanitario, atencion al cliente) en arabe.
- Generacion de datos sinteticos en arabe: un modelo pequeno ajustado puede utilizarse para aumentar datasets de entrenamiento o para tareas de parafraseo y reformulacion, siempre con revision humana.
- Educacion e investigacion: util como caso de estudio en cursos sobre ajuste fino eficiente, DPO y cuantizacion, dado su tamano reducido y su licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en 4 bits, el modelo base ocupa aproximadamente 2-2,5 GB de pesos; con overhead de contexto y KV cache, se estima un uso de 4-6 GB para contextos moderados. En FP16, unos 6-7 GB solo para pesos.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10G, L4 o superiores. Para entrenamiento con LoRA, una RTX 3090 o A100 es recomendable.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8 GB de VRAM en cuantizacion 4 bits.
- Opciones de despliegue: transformers con PEFT (cargando el modelo base y aplicando los adaptadores), llama.cpp u Ollama tras fusionar y convertir a GGUF, vLLM o TGI tras fusionar los adaptadores (TGI esta declarado en los tags).
- Latencia y throughput: no disponibles; al ser un modelo de 3B, se espera una latencia baja en GPU modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| JihaneJra/qwen2.5-3b-arabic-sft-dpo-lora | ~3,09B (LoRA sobre Qwen2.5-3B) | no disponible (base: 32.768) | Apache 2.0 | Hugging Face, 0 descargas | Ajuste experimental sin benchmarks |
| Qwen2.5-3B-Instruct | ~3,09B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base oficial con evaluaciones publicadas |
| Llama 3.2 3B Instruct | ~3,2B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, muy extendido | Mayor contexto, licencia mas restrictiva |
| Gemma 2 2B Instruct | ~2,6B | 8.192 tokens | Gemma Terms of Use | Hugging Face, ampliamente usado | Menor contexto, licencia con restricciones |

## Limitaciones y advertencias

- No hay benchmarks publicados ni evaluacion del ajuste; el rendimiento real en arabe es desconocido y podria ser inferior al del modelo base si el dataset de entrenamiento era pequeno o de baja calidad.
- La model card no documenta el dataset, los hiperparametros ni el proceso de DPO, lo que impide reproducir el entrenamiento.
- Solo se declara el idioma ingles en la model card, pese al nombre del repositorio; el soporte real de arabe no esta verificado.
- Riesgo de alucinacion y de sesgos heredados de Qwen2.5-3B-Instruct, agravado por el ajuste fino con datos no documentados.
- Al ser adaptadores LoRA, no es un modelo autonomo: requiere cargar el modelo base cuantizado de Unsloth, lo que anade dependencias y posibles problemas de compatibilidad.
- Licencia Apache 2.0 permisiva para uso comercial, pero el modelo base Qwen2.5 tambien es Apache 2.0, por lo que no hay restricciones adicionales conocidas; aun asi, conviene revisar los terminos del modelo base.
- Cero descargas y cero likes: no hay evidencia de uso en produccion ni de validacion por parte de la comunidad.
- El modelo base esta cuantizado en 4 bits, lo que puede degradar ligeramente la calidad respecto a la version FP16.

## Enlaces

- Hugging Face: https://huggingface.co/JihaneJra/qwen2.5-3b-arabic-sft-dpo-lora
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen2.5-3B-Instruct-bnb-4bit
- Modelo original Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (repositorio): https://github.com/huggingface/trl
