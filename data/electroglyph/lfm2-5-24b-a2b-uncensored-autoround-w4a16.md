# electroglyph/LFM2.5-24B-A2B-uncensored-AutoRound-W4A16

## Resumen

LFM2.5-24B-A2B-uncensored-AutoRound-W4A16 es una version cuantizada a 4 bits del modelo electroglyph/LFM2.5-24B-A2B-uncensored, un modelo de lenguaje de tipo Mixture of Experts (MoE) publicado por el usuario electroglyph y afinado para eliminar las restricciones de rechazo propias de los modelos alineados convencionalmente. Esta ficha describe concretamente el artefacto cuantizado, generado con la herramienta Intel AutoRound bajo el esquema W4A16 (pesos de 4 bits, activaciones de 16 bits, group_size 128, simetrico).

La relevancia de este repositorio reside en su caracter de artefacto de despliegue: reduce el coste de inferencia de un modelo MoE de gran tamano mediante cuantizacion post-entrenamiento con ajuste real SignRound sobre datos de calibracion, en lugar de una simple cuantizacion round-to-nearest. El resultado es un checkpoint de aproximadamente 12,9 GB que puede servirse directamente con vLLM o cargarse con Transformers, lo que lo hace accesible en GPUs de gama alta de consumo y profesionales.

Conviene senalar una discrepancia importante: el nombre del modelo indica "24B-A2B", pero el recuento real de parametros del safetensors es de 3.438.829.184 (aproximadamente 3,4 mil millones). El modelo base es un derivado no oficial de la familia LFM2.5, sin model card publica con especificaciones detalladas de arquitectura, contexto o datos de entrenamiento. La licencia no esta declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo transformer (tag `lfm2_moe`); detalles no disponibles |
| Parametros totales | 3.438.829.184 (segun safetensors); el nombre indica "24B-A2B" |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible; el ejemplo de vLLM usa `--max-model-len 4096` |
| Tipos de cuantizacion | W4A16 (4 bits pesos / 16 bits activaciones), group_size 128, simetrico, formato auto_round |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (esquema auto_round) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia LFM2.5, segun el tag `lfm2_moe`, lo que apunta a una arquitectura de mezcla de expertos. No se dispone de informacion publica sobre el numero de expertos, la estrategia de enrutamiento, la longitud de contexto nativa ni el volumen y composicion del corpus de entrenamiento del modelo original. Tampoco hay datos sobre si el afinado "uncensored" se realizo mediante DPO, SFT sobre datos sin filtro o una combinacion de ambos.

El proceso de cuantizacion si esta documentado con detalle. Se aplico Intel AutoRound con el esquema W4A16, que mantiene las activaciones en 16 bits y cuantiza unicamente los pesos a 4 bits con agrupacion de 128 elementos y simetria. El ajuste se realizo con SignRound real (no RTN) durante 1000 iteraciones, con 512 muestras de calibracion de 2048 tokens cada una, extraidas de HuggingFaceH4/ultrachat_200k (384 muestras) y nvidia/OpenCodeInstruct (128 muestras), con batch_size 8, dtype bf16, semilla 42 y torch.compile activado. Esta combinacion de datos de calibracion cubre tanto conversacion general como codigo, lo que busca preservar el rendimiento en ambos dominios tras la cuantizacion.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y generacion de codigo, presumiblemente reforzado por la calibracion con OpenCodeInstruct.
- Ausencia de rechazo por contenido: el modelo esta explicitamente afinado para no aplicar politicas de negativa ("uncensored").
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue en infraestructuras tipo Hugging Face Inference Endpoints.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Despliegue en produccion con vLLM: el esquema auto_round W4A16 esta soportado nativamente por vLLM (soporte de cuantizacion Intel), por lo que el modelo puede servirse sin flag `--quantization` adicional, con `--gpu-memory-utilization 0.8` y una longitud maxima configurable.
- Generacion de codigo en pipelines internos: la calibracion incluye OpenCodeInstruct, lo que sugiere un esfuerzo por mantener calidad en tareas de programacion; puede integrarse como servicio de autocompletado o generacion de parches en herramientas internas.
- Investigacion sobre alineacion y seguridad: al ser un modelo "uncensored", resulta util como objeto de estudio para medir sesgos, tasas de cumplimiento de peticiones daninas y eficacia de filtros externos.
- Prototipado rapido en una sola GPU: con 12,9 GB de pesos en 4 bits, cabe en GPUs de consumo de gama alta, lo que permite iterar en local sin infraestructura de datacenter.
- Chat conversacional de dominio cerrado: el tag `conversational` y la calibracion con ultrachat_200k lo hacen adecuado para asistentes de proposito general desplegados en entornos controlados.
- Evaluacion comparativa de cuantizacion: sirve como referencia para medir la degradacion de un modelo MoE al pasar de bf16 a W4A16 con AutoRound frente a otras tecnicas (GPTQ, AWQ, RTN).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 13 GB solo para pesos; con cache KV y overhead de runtime, se recomienda un minimo de 16-20 GB para contextos cortos (4096 tokens).
- GPUs recomendadas: A100 40/80 GB, H100, L40S para produccion; RTX 4090 (24 GB) o RTX A6000 (48 GB) para uso profesional en una sola tarjeta.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB); en tarjetas de 16 GB el margen es ajustado y dependera de la longitud de contexto.
- Opciones de despliegue: vLLM (soporte nativo de auto_round W4A16), Transformers con el paquete `auto-round` instalado para registrar el formato. No se documenta soporte de llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B-uncensored-AutoRound-W4A16 (este) | 3,44 B (segun safetensors) | no disponible | W4A16 auto_round | no disponible | Hugging Face |
| electroglyph/LFM2.5-24B-A2B-uncensored (base) | no disponible | no disponible | bf16 original | no disponible | Hugging Face |
| Alternativas de la familia LFM2.5 oficial | no disponible | no disponible | varias | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones verificables de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Ausencia de model card detallada en el modelo base: no hay informacion sobre datos de entrenamiento, contexto nativo, idiomas ni evaluaciones.
- Discrepancia entre el nombre ("24B-A2B") y el recuento real de parametros (3,44 B): conviene verificar el checkpoint antes de dimensionar infraestructura.
- Modelo "uncensored": no aplica filtros de rechazo, lo que implica riesgo elevado de generar contenido danino, sesgado o inexacto. Requiere moderacion externa en cualquier despliegue publico.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; la cuantizacion a 4 bits puede incrementarlo ligeramente respecto al original en bf16.
- Licencia no declarada: no se puede confirmar el uso comercial permitido. Es imprescindible contactar con el autor o consultar el modelo base antes de un despliegue productivo.
- Idiomas soportados no documentados: no hay garantia de calidad fuera del ingles.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria ni evidencia de uso en produccion.
- La cuantizacion W4A16 puede degradar tareas sensibles a precision numerica (matematicas, razonamiento de multiples pasos) sin que se hayan publicado metricas que lo cuantifiquen.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/electroglyph/LFM2.5-24B-A2B-uncensored-AutoRound-W4A16
- Modelo base: https://huggingface.co/electroglyph/LFM2.5-24B-A2B-uncensored
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- Documentacion de vLLM sobre cuantizacion Intel: https://docs.vllm.ai/en/stable/features/quantization/inc/
- Dataset de calibracion (conversacion): https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset de calibracion (codigo): https://huggingface.co/datasets/nvidia/OpenCodeInstruct
