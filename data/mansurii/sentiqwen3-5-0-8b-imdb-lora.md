# mansurii/SentiQwen3.5-0.8B-IMDb-lora

## Resumen

SentiQwen3.5-0.8B-IMDb-lora es un ajuste fino mediante LoRA del modelo base unsloth/Qwen3.5-0.8B, publicado por el usuario mansurii en HuggingFace. El nombre del adaptador sugiere un entrenamiento orientado al analisis de sentimiento sobre el corpus IMDb (resenas cinematograficas en ingles), aunque la model card no documenta explicitamente la tarea, el dataset ni los hiperparametros utilizados. El modelo se distribuye con licencia Apache 2.0 y esta etiquetado unicamente para el idioma ingles.

Se trata de un adaptador de bajo rango (LoRA) sobre un transformer denso de aproximadamente 0,8 mil millones de parametros de la familia Qwen3.5, entrenado con la libreria Unsloth y el stack TRL. Su relevancia practica es limitada: el repositorio no contiene pesos en formato completo (tamano del repo 0,0 GB), no tiene descargas ni interacciones, y no se publican resultados de evaluacion. Debe considerarse un artefacto experimental o de demostracion mas que un modelo listo para produccion.

La ficha se elabora a partir de los metadatos disponibles en HuggingFace y de la model card del autor. Cualquier dato no documentado se indica como no disponible, sin inferencias sobre el rendimiento real del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5); adaptador LoRA sobre el modelo base unsloth/Qwen3.5-0.8B |
| Parametros totales | Aproximadamente 0,8 mil millones (modelo base); numero exacto de parametros del adaptador no disponible |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base, no documentada) |
| Tipos de cuantizacion | No disponible (el repositorio solo declara safetensors; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA); no se publican pesos fusionados |

## Arquitectura y entrenamiento

El modelo es un ajuste fino con LoRA sobre unsloth/Qwen3.5-0.8B, un transformer denso de la familia Qwen3.5 con aproximadamente 0,8 mil millones de parametros. El entrenamiento se realizo con Unsloth, que segun la model card permite un entrenamiento "2x mas rapido", y con la libreria TRL, segun las etiquetas del repositorio. No se documentan la composicion del dataset, el numero de tokens de entrenamiento, la configuracion del adaptador (rango, alpha, modulos objetivo) ni si se aplicaron etapas de RLHF o DPO.

Por el nombre del repositorio (IMDb) es plausible que el ajuste se haya realizado sobre el dataset de resenas cinematograficas IMDb, probablemente como tarea de clasificacion de sentimiento o generacion condicionada, pero esta informacion no aparece confirmada en la model card. No se describen innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, modos de razonamiento) mas alla de las que pudiera incorporar el modelo base, que tampoco se detallan.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen3.5-0.8B.
- Ajuste orientado (segun el nombre del repositorio) al analisis de sentimiento sobre resenas de IMDb; la tarea exacta no esta documentada.
- Soporte de tool calling / function calling: no confirmado para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no confirmado; el tamano de 0,8B limita la fiabilidad en tareas agenticas complejas.
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`.
- Capacidades especiales (vision, audio, modo thinking): no disponibles en la informacion proporcionada.

## Casos de uso

- Clasificacion de sentimiento en resenas de cine o productos: el adaptador se puede cargar sobre el modelo base con PEFT y usarse para etiquetar polaridad en textos cortos en ingles, aprovechando el ajuste especifico sobre IMDb.
- Prototipado rapido de pipelines de NLP: al ser un adaptador LoRA de 0,8B, se puede desplegar en una GPU consumer para validar flujos de inferencia antes de escalar a modelos mayores.
- Experimentacion academica con tecnicas de ajuste eficiente: sirve como ejemplo reproducible de entrenamiento con Unsloth + TRL y como punto de partida para comparar configuraciones de LoRA.
- Filtrado de resenas en plataformas de contenido: integrado en un servicio de moderacion o analitica para priorizar resenas negativas o positivas en ingles.
- Generacion de resumenes o respuestas condicionadas al sentimiento: si el ajuste incluyo generacion, podria emplearse para redactar respuestas con tono controlado en dominios de resenas.
- Base para ajustes posteriores: al ser un adaptador pequeno y con licencia Apache 2.0, se puede reutilizar o fusionar con el modelo base para tareas relacionadas con opinion mining.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de aproximadamente 0,8B, la inferencia en fp16 requiere del orden de 1,6-2 GB solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits o 4 bits (si se generara) cabria en menos de 1 GB. Cifras exactas no disponibles.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente por VRAM; para produccion con concurrencia se recomendarian A10, L4 o A100/H100.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con al menos 4 GB de VRAM, siempre que se cargue el modelo base junto con el adaptador.
- Opciones de despliegue: transformers + PEFT (carga del adaptador), vLLM o TGI tras fusionar el adaptador con el modelo base; llama.cpp u Ollama solo si se generan pesos GGUF, que no se distribuyen.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SentiQwen3.5-0.8B-IMDb-lora | ~0,8B (base) + LoRA | No disponible | Apache 2.0 | Adaptador LoRA en HF, sin descargas | Ajuste especifico de sentimiento, sin benchmarks |
| unsloth/Qwen3.5-0.8B (base) | ~0,8B | No disponible | Apache 2.0 (segun etiqueta del adaptador) | Modelo base publico | Referencia directa; capacidades generales |
| DistilBERT-base-uncased-finetuned-sst-2 | ~66M | 512 tokens | Apache 2.0 | Muy extendido | Clasificador de sentimiento ligero y probado en benchmarks |
| RoBERTa-base fine-tuned en IMDb | ~125M | 512 tokens | MIT/Apache segun variante | Amplia disponibilidad | Alternativa clasica para sentiment analysis en IMDb |

## Limitaciones y advertencias

- La model card no documenta el dataset, la tarea exacta ni los hiperparametros; la finalidad de sentimiento en IMDb es una inferencia a partir del nombre del repositorio.
- El repositorio tiene 0 descargas y 0 likes, y un tamano de 0,0 GB, lo que sugiere que los pesos del adaptador podrian no estar efectivamente subidos o ser de tamano minimo; verificar antes de usarlo.
- Riesgo de alucinacion y de sobreajuste al dominio de resenas de IMDb si el ajuste fue narrow; el rendimiento fuera de ese dominio es desconocido.
- Solo soporta ingles segun los metadatos; no se garantiza calidad en castellano ni en otros idiomas.
- No se publican evaluaciones, por lo que no hay evidencia cuantitativa de mejora frente al modelo base.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base y de los datos de entrenamiento (IMDb tiene sus propias restricciones de uso) antes de un despliegue comercial.
- Modelo de 0,8B: capacidad limitada para razonamiento complejo, tool calling fiable o tareas agenticas multi-paso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mansurii/SentiQwen3.5-0.8B-IMDb-lora
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (libreria de entrenamiento): https://github.com/huggingface/trl
- Dataset IMDb (referencia, no confirmado su uso): https://huggingface.co/datasets/stanfordnlp/imdb
