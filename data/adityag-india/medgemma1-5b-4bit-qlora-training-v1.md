# adityag-india/medgemma1.5B-4bit-QloRA-training-v1

## Resumen

`adityag-india/medgemma1.5B-4bit-QloRA-training-v1` es un repositorio de adaptadores LoRA/QLoRA (rank 32) entrenados sobre el checkpoint `google/medgemma-1.5-4b-it`, un modelo multimodal de arquitectura Gemma 3 con 4.000 millones de parametros y ventana de contexto de aproximadamente 128.000 tokens. El autor lo presenta como una reproduccion del experimento documentado en `adityag-india/qwen25-1.5b-medical-o1-qlora`, sustituyendo el modelo base Qwen2.5-1.5B-Instruct por MedGemma. El objetivo declarado es el ajuste fino en razonamiento medico sobre el dataset `FreedomIntelligence/medical-o1-reasoning-SFT` (config `en`, unas 18.704 muestras de entrenamiento con columnas `Question`, `Complex_CoT` y `Response`).

El nombre del repositorio induce a error: no existe un checkpoint oficial "MedGemma 1.5B". El "1.5" alude a la version 1.5 de MedGemma, no al numero de parametros, y el modelo base real tiene 4B de parametros, entre 4 y 4,6 veces mas que el Qwen2.5-1.5B del experimento original. El autor lo advierte explicitamente en la model card.

La relevancia de este repositorio es limitada y fundamentalmente metodologica: la propia model card declara que "nada en este proyecto se ha ejecutado, instalado, descargado ni validado" y que todos los ficheros se generaron de forma estatica. Se trata, por tanto, de un paquete de configuracion y scripts para reproducir un pipeline de QLoRA, no de un modelo entrenado con resultados verificables. El repositorio ocupa 2,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Gemma 3); en este proyecto solo se usa el decoder de texto. Adaptadores LoRA (PEFT) sobre base congelada en 4 bits NF4 |
| Parametros totales | 4B en el modelo base (`google/medgemma-1.5-4b-it`); tamano de los adaptadores LoRA no disponible |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Aproximadamente 128K tokens (heredada del modelo base) |
| Tipos de cuantizacion | Base en 4 bits NF4 via bitsandbytes (ruta QLoRA por defecto); ruta alternativa en BF16 sin cuantizacion |
| Idiomas soportados | No disponible (el dataset de ajuste es en ingles, config `en`) |
| Licencia | No disponible en los metadatos de Hugging Face; el modelo base esta sujeto a los terminos HAI-DEF (Health AI Developer Foundations) de Google y es gated |
| Formato de pesos | Adaptadores PEFT (safetensors, presumiblemente); pesos del modelo base en formato Hugging Face. No se especifica GGUF |

## Arquitectura y entrenamiento

El pipeline implementa QLoRA: el modelo base MedGemma 1.5-4B-IT se carga congelado en 4 bits NF4 mediante bitsandbytes y solo se entrenan los adaptadores LoRA de rango 32. Los modulos objetivo son `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, descubiertos en tiempo de ejecucion y restringidos al submodulo `language_model` para evitar adjuntar adaptadores al torre de vision SigLIP congelada, que puede compartir sufijos de nombre. Existe una ruta alternativa (`configs/train_medgemma_lora_bf16.yaml`) que carga el base en BF16 sin cuantizacion y permite fusionar el adaptador en inferencia con `--merge_adapter`, opcion no soportada en la ruta de 4 bits.

El entrenamiento se plantea a 5 epocas sobre el dataset `FreedomIntelligence/medical-o1-reasoning-SFT` (config `en`), con particion 80/10/10 generada mediante `train_test_split` con semilla y dos pasos. La validacion se usa para evaluacion por epoca y `load_best_model_at_end`; el test se evalua una sola vez al final y los resultados se guardan en `test_metrics.json`. Se desactiva el empaquetado de secuencias (`use_packing: false`) por defecto, porque el enmascaramiento correcto de la perdida solo en turnos del asistente a traves de fronteras de paquetes no esta garantizado con TRL/PEFT estandar. El warmup se define como `warmup_ratio: 0.03` en lugar de 75 pasos fijos, y se usa `gradient_checkpointing_enable()` estandar de Hugging Face en lugar de las optimizaciones de Unsloth, cuya compatibilidad con Gemma 3 multimodal no esta documentada publicamente. El autor advierte que el uso de bitsandbytes 4-bit con este checkpoint concreto no esta verificado oficialmente por Google y recomienda validar con `--smoke_test` antes de una ejecucion completa.

## Capacidades

- Generacion de texto y razonamiento medico sobre preguntas clinicas, con cadenas de razonamiento (`Complex_CoT`) como formato de entrenamiento.
- Razonamiento multi-paso orientado a diagnostico y explicacion clinica, segun el diseno del dataset de ajuste.
- Capacidad multimodal (texto + imagen) heredada del modelo base Gemma 3, aunque el proyecto entrena exclusivamente sobre datos de texto y no valida la rama de vision.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso autonomo: no documentado; el razonamiento multi-paso se limita al formato CoT del dataset.
- Capacidades multilingues: no disponibles; el ajuste se realiza solo en ingles.
- Modo thinking explicito, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Reproduccion de experimentos de QLoRA en el ambito medico: el repositorio sirve como plantilla de configuracion (YAML, scripts de entrenamiento, particion de datos) para quien quiera replicar el pipeline sobre MedGemma 1.5-4B con su propio hardware, partiendo de que el autor no ha ejecutado nada.
- Investigacion sobre ajuste fino con datos de razonamiento clinico: permite estudiar como se comporta un adaptador LoRA de rango 32 sobre un base medico de 4B cuando se entrena con pares pregunta/cadena de razonamiento/respuesta, comparandolo con el experimento original sobre Qwen2.5-1.5B.
- Prototipado de asistentes de documentacion clinica: el modelo base admite contextos de hasta 128K tokens, lo que permitiria procesar historiales o informes extensos, si bien el adaptador no ha sido validado y requeriria evaluacion previa.
- Educacion medica y generacion de explicaciones razonadas: el formato de entrenamiento (CoT + respuesta) esta pensado para producir explicaciones paso a paso utiles en material docente, sujeto a revision por profesionales.
- Base para experimentos de cuantizacion y despliegue eficiente: la ruta de 4 bits NF4 permite estudiar el equilibrio entre calidad y VRAM en un modelo medico de 4B, y la ruta BF16 con fusion de adaptador facilita comparar ambos regimenes.
- Punto de partida para pipelines de evaluacion medica: el script deja un `test_metrics.json` con la evaluacion unica sobre el split de test, util para construir comparativas reproducibles entre variantes de ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, MedQA, HumanEval, GSM8K ni de ningun otro conjunto, y declara explicitamente que el proyecto no se ha ejecutado ni validado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia de orden de magnitud, un base de 4B en 4 bits NF4 ocupa aproximadamente 2-3 GB de pesos, mas overhead de activaciones y contexto; en BF16 serian del orden de 8-9 GB solo en pesos. Estas cifras son estimaciones genericas, no datos publicados por el autor.
- GPU recomendadas: no disponible. La model card advierte que no se debe asumir que la RTX 3090 del experimento original (Qwen2.5-1.5B) sea suficiente para este base de 4B, y remite a su seccion de troubleshooting.
- Compatibilidad con GPU de consumo: no confirmada. El propio autor senala que el uso de bitsandbytes 4-bit con este checkpoint no esta verificado por Google y recomienda ejecutar `--smoke_test`.
- Opciones de despliegue: la informacion solo menciona el stack Hugging Face/PEFT/TRL/bitsandbytes. No se documentan vLLM, llama.cpp, Ollama ni TGI, ni se proporcionan pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Estado |
|---|---|---|---|---|---|
| Este repositorio (adaptador QLoRA sobre MedGemma 1.5-4B) | 4B (base) + LoRA r32 | ~128K | Texto (base multimodal) | No disponible; base sujeta a HAI-DEF | Configuracion estatica, sin entrenar ni validar |
| `adityag-india/qwen25-1.5b-medical-o1-qlora` (experimento fuente) | 1.5B | No disponible | Texto | No disponible | Documentado por el mismo autor; sirve de referencia metodologica |
| `google/medgemma-1.5-4b-it` (modelo base) | 4B | ~128K | Texto + imagen | HAI-DEF, gated | Checkpoint oficial de Google, publicado y evaluado por el emisor |
| Qwen2.5-1.5B-Instruct (base del experimento fuente) | 1.5B | No disponible | Texto | No disponible en esta ficha | Modelo denso decoder-only de referencia para ajuste ligero |

La comparativa se limita a estos cuatro elementos porque la informacion proporcionada no incluye datos de rendimiento que permitan contrastar calidad. La diferencia principal frente al modelo base es que este repositorio anade adaptadores LoRA no validados; frente al experimento fuente, el base es entre 4 y 4,6 veces mayor y multimodal.

## Limitaciones y advertencias

- El proyecto no se ha ejecutado, instalado, descargado ni validado: todos los ficheros se generaron estaticamente. No hay garantia de que el pipeline funcione tal como esta escrito.
- El nombre del repositorio es enganoso: no existe un "MedGemma 1.5B"; el base real es de 4B y el "1.5" es un numero de version.
- El uso de bitsandbytes 4-bit con `google/medgemma-1.5-4b-it` no esta documentado oficialmente por Google; es practica estandar de PEFT pero no verificada para este checkpoint.
- El empaquetado de secuencias esta desactivado por defecto para evitar enmascaramiento incorrecto de la perdida; activarlo sin verificar la version de TRL puede corromper el entrenamiento.
- Riesgo de alucinacion clinica: el modelo base es un modelo medico de 4B y el adaptador se entrena sobre un dataset de razonamiento; no hay evaluacion que cuantifique la fiabilidad de las respuestas generadas.
- Sesgos conocidos: no documentados en la informacion disponible; el dataset de ajuste es solo en ingles, lo que limita la calidad en castellano y otros idiomas.
- Restricciones de licencia: la licencia del repositorio no figura en los metadatos; el modelo base esta sujeto a los terminos HAI-DEF de Google y es de acceso restringido (gated), lo que condiciona el uso comercial y la redistribucion.
- No se proporcionan pesos en GGUF ni instrucciones de despliegue en motores de inferencia de produccion (vLLM, TGI, llama.cpp), lo que dificulta su uso fuera del stack de entrenamiento.
- El repositorio no registra descargas ni likes, y no hay evidencia de validacion por terceros.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/adityag-india/medgemma1.5B-4bit-QloRA-training-v1
- Experimento fuente (Qwen2.5-1.5B QLoRA medico): https://huggingface.co/adityag-india/qwen25-1.5b-medical-o1-qlora
- Modelo base: `google/medgemma-1.5-4b-it` (referenciado en la model card; acceso gated bajo terminos HAI-DEF)
- Dataset de ajuste: `FreedomIntelligence/medical-o1-reasoning-SFT`, config `en` (referenciado en la model card)
