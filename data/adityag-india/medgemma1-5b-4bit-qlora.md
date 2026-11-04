# adityag-india/medgemma1.5b-4bit-qlora

## Resumen

MedGemma 1.5-4B-IT (QLoRA) es un adaptador LoRA de rango 32 entrenado sobre el checkpoint `google/medgemma-1.5-4b-it`, un modelo multimodal de la familia Gemma 3 especializado en dominio sanitario y publicado por Google bajo los terminos Health AI Developer Foundations (HAI-DEF). El repositorio, alojado por el usuario `adityag-india`, reproduce con QLoRA el experimento previo del mismo autor sobre Qwen2.5-1.5B-Instruct, sustituyendo el modelo base por MedGemma para el entrenamiento en razonamiento medico.

El objetivo declarado es el ajuste fino supervisado sobre el dataset `FreedomIntelligence/medical-o1-reasoning-SFT` (config `en`, aproximadamente 18.704 ejemplos de entrenamiento con columnas `Question`, `Complex_CoT` y `Response`), con un split 80/10/10 y cinco epocas. El adaptador se entrena sobre el decodificador de texto del modelo, dejando congelado el torre de vision SigLIP y el modelo base cuantizado en 4 bits NF4 mediante bitsandbytes.

Es importante senalar que la model card advierte explicitamente de que **ningun componente del proyecto ha sido ejecutado, instalado, descargado ni validado**: todos los ficheros se generaron de forma estatica. Ademas, aclara una confusion frecuente: no existe un "MedGemma 1.5B"; el "1.5" hace referencia a la version del modelo, no al numero de parametros, que son 4B. El repositorio ocupa 11 GB, no tiene descargas ni likes, y no declara licencia, idiomas ni pipeline en los metadatos de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Gemma 3); en este proyecto solo se usa el decodificador de texto |
| Parametros totales | 4B (modelo base `google/medgemma-1.5-4b-it`) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | ~128K tokens (segun la model card del proyecto) |
| Tipos de cuantizacion | Base en 4-bit NF4 via bitsandbytes; adaptador LoRA en precision nativa; ruta alternativa en BF16 sin cuantizacion |
| Idiomas soportados | no disponible en los metadatos; el dataset de entrenamiento es en ingles (`config: en`) |
| Licencia | no disponible (el modelo base esta sujeto a los terminos HAI-DEF de Google y es gated en HuggingFace) |
| Formato de pesos | no disponible en los metadatos del repo; adaptadores PEFT estandar (safetensors presumiblemente, no confirmado) |

## Arquitectura y entrenamiento

El modelo base es `google/medgemma-1.5-4b-it`, un Gemma 3 multimodal (texto + imagen) de 4B parametros con instruction tuning. Este proyecto utiliza unicamente el decodificador de texto y entrena sobre datos de razonamiento medico en texto. El adaptador LoRA tiene rango 32 y se aplica a los modulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, descubiertos en tiempo de ejecucion y restringidos al submodulo `language_model` para evitar adjuntar adaptadores al torre de vision SigLIP congelado, que puede compartir sufijos de nombres.

El entrenamiento sigue el paradigma QLoRA: el modelo base se carga congelado en 4 bits NF4 mediante bitsandbytes y solo se entrenan los pesos del adaptador. Se ofrece una ruta alternativa en BF16 sin cuantizacion (`configs/train_medgemma_lora_bf16.yaml`), que ademas permite fusionar el adaptador en inferencia (`--merge_adapter`), algo que la ruta de 4 bits no soporta. El dataset es `FreedomIntelligence/medical-o1-reasoning-SFT` (config `en`), con split 80/10/10 generado con `train_test_split` semillado; la validacion se usa para evaluacion por epoca y `load_best_model_at_end`, y el test se evalua una sola vez tras las cinco epocas, guardando resultados en `test_metrics.json`.

Entre las desviaciones respecto al experimento original destacan: empaquetado de secuencias desactivado por defecto (`use_packing: false`) para evitar enmascaramiento incorrecto de etiquetas en los limites de secuencia; gradient checkpointing estandar de HuggingFace en lugar de las optimizaciones de Unsloth; `warmup_ratio: 0.03` en lugar de 75 pasos fijos; y seleccion del checkpoint final (epoca 5) por defecto, con `load_best_model_at_end` disponible si existe split de validacion. La model card advierte de que el uso de bitsandbytes 4-bit con este checkpoint concreto no esta documentado oficialmente por Google y recomienda validar con `--smoke_test` antes de una ejecucion completa.

## Capacidades

- Generacion de texto y razonamiento medico: el adaptador se entrena sobre cadenas de razonamiento (`Complex_CoT`) y respuestas, orientado a preguntas clinicas.
- Razonamiento multi-paso: el dataset de entrenamiento incluye explicaciones intermedias, lo que favorece respuestas con trazas de razonamiento.
- Procesamiento multimodal: el modelo base soporta texto e imagen, aunque este proyecto solo entrena y utiliza el decodificador de texto.
- Ventana de contexto larga: aproximadamente 128K tokens, adecuada para historiales clinicos extensos o documentos medicos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso orquestado: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el dataset de entrenamiento es solo en ingles.
- Modo thinking explicito: no disponible como funcionalidad formal, aunque el formato de datos incluye cadenas de razonamiento.

## Casos de uso

- Asistente de razonamiento clinico en ingles: el adaptador puede responder preguntas medicas generando primero una cadena de razonamiento y despues una respuesta, replicando el formato del dataset `medical-o1-reasoning-SFT`; util para prototipos de soporte a la decision clinica.
- Resumen de historiales clinicos largos: gracias a la ventana de aproximadamente 128K tokens del modelo base, puede procesar documentos extensos de un solo paso, aunque el adaptador solo se ha entrenado en texto.
- Generacion de explicaciones educativas: para plataformas de formacion medica que requieran respuestas con justificacion paso a paso, el modelo puede producir el razonamiento intermedio junto a la respuesta final.
- Investigacion en ajuste fino medico: el repositorio sirve como plantilla reproducible de QLoRA sobre MedGemma, con configuracion YAML, scripts de entrenamiento y evaluacion separada de test.
- Experimentacion con cuantizacion 4-bit en dominio sanitario: permite estudiar el impacto de NF4 sobre un modelo medico de 4B en tareas de razonamiento, comparando con la ruta BF16.
- Base para adaptaciones posteriores: el adaptador LoRA puede servir como punto de partida para fine-tuning adicional en subdominios (radiologia, farmacologia) sobre el mismo modelo base.
- Evaluacion de tecnicas de enmascaramiento de perdida: la configuracion con `use_packing` desactivado y perdida solo en el asistente permite estudiar el efecto del empaquetado en modelos multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluacion clinica, y advierte de que ningun componente ha sido ejecutado ni validado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; para un modelo de 4B en 4-bit NF4 se puede estimar en torno a 3-4 GB solo de pesos, mas overhead de activaciones y contexto, pero la model card no confirma cifras.
- VRAM estimada para entrenamiento QLoRA: la model card advierte de que el hardware del experimento original (RTX 3090) no debe asumirse suficiente sin revisar la seccion de troubleshooting, dado que el modelo base es 4-4,6 veces mayor que Qwen2.5-1.5B.
- GPU recomendadas: no disponible en la informacion proporcionada; la model card menciona RTX 3090 como referencia del experimento original y advierte de que puede no bastar.
- Compatibilidad con GPU de consumo: no confirmada; la ruta 4-bit esta pensada para reducir requisitos, pero no se documentan cifras verificadas.
- Opciones de despliegue: la model card menciona el stack HuggingFace (PEFT, TRL, bitsandbytes) y la ruta BF16 con `--merge_adapter`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedGemma 1.5-4B-IT QLoRA (este repo) | 4B | ~128K | Razonamiento medico, adaptador LoRA sobre base multimodal | no disponible (base sujeta a HAI-DEF) | HuggingFace, 0 descargas |
| google/medgemma-1.5-4b-it | 4B | ~128K | Modelo base multimodal medico de Google | HAI-DEF (gated) | HuggingFace |
| Qwen2.5-1.5B-Instruct + QLoRA medico (experimento fuente) | 1.5B | no disponible | Razonamiento medico, adaptador LoRA | no disponible | HuggingFace |
| Gemma 3 (familia base) | variable | variable | Modelo generalista multimodal | Gemma terms | HuggingFace |

La comparativa se limita a los modelos citados en la model card; no se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- Proyecto no validado: la model card declara explicitamente que nada ha sido ejecutado, instalado, descargado ni validado; todos los ficheros se generaron de forma estatica.
- Confusion de nomenclatura: no existe un "MedGemma 1.5B"; el "1.5" es la version del modelo, no el numero de parametros. El checkpoint real tiene 4B parametros.
- Licencia no declarada en el repositorio: el modelo base esta sujeto a los terminos HAI-DEF de Google y es gated, lo que puede restringir el uso comercial y la redistribucion.
- Solo texto en el entrenamiento: aunque el modelo base es multimodal, el adaptador se entrena unicamente sobre el decodificador de texto; no se ha validado su comportamiento con imagenes.
- Idioma: el dataset de entrenamiento es solo en ingles; no hay evidencia de capacidades multilingues del adaptador.
- Riesgo de alucinacion: inherente a modelos de lenguaje en dominio sanitario, agravado por la falta de evaluacion clinica publicada.
- Uso clinico: no debe emplearse como herramienta diagnostica o de decision clinica sin validacion independiente y supervision profesional.
- Cuantizacion no documentada por el fabricante: bitsandbytes 4-bit sobre este checkpoint concreto no esta oficialmente documentado por Google; se recomienda `--smoke_test` antes de ejecuciones completas.
- Empaquetado de secuencias desactivado por defecto: puede reducir la eficiencia del entrenamiento, pero evita enmascaramiento incorrecto de etiquetas.
- Sin benchmarks: no hay metricas publicadas que permitan comparar su rendimiento con alternativas.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin senales de uso comunitario.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/adityag-india/medgemma1.5b-4bit-qlora
- Experimento fuente (Qwen2.5-1.5B medico QLoRA): https://huggingface.co/adityag-india/qwen25-1.5b-medical-o1-qlora
- Modelo base: `google/medgemma-1.5-4b-it` (gated en HuggingFace bajo HAI-DEF)
- Dataset: `FreedomIntelligence/medical-o1-reasoning-SFT` (config `en`)
- Documentacion HAI-DEF de Google: no disponible en la informacion proporcionada
- Paper o blog tecnico del adaptador: no disponible
