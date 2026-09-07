# fbaldassarri/EleutherAI_pythia-6.9b-deduped-auto_gptq-int8-gs64-asym

## Resumen

`fbaldassarri/EleutherAI_pythia-6.9b-deduped-auto_gptq-int8-gs64-asym` es una version cuantizada en INT8 del modelo base `EleutherAI/pythia-6.9b-deduped`, publicada por el usuario fbaldassarri en HuggingFace. El objetivo es reducir el consumo de memoria y acelerar la inferencia de un modelo de lenguaje de gran tamano, manteniendo un rendimiento razonable en hardware de consumo y, de forma especifica, en plataformas Intel (CPU, iGPU Arc y NPU con AI Boost). El modelo original pertenece a la familia Pythia de EleutherAI, disenada para investigar el comportamiento de los modelos de lenguaje a diferentes escalas.

La arquitectura es GPT-NeoX, un transformer causal de tipo decoder-only, entrenado sobre el dataset `EleutherAI/pile` deduplicado. La cuantizacion se ha realizado con el framework Intel AutoRound v0.13.1, aplicando GPTQ con 8 bits, grupo de 64 pesos y cuantizacion asimetrica. El modelo se presenta como un modelo base de completacion de texto, sin ajuste por instrucciones ni RLHF. Es relevante ahora porque permite ejecutar un modelo de 6.900 millones de parametros en entornos con recursos limitados, especialmente en despliegues de inferencia sobre CPU o NPU de Intel, donde la cuantizacion INT8 resulta critica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer causal, decoder-only) |
| Parametros totales | 2.152.210.432 (segun metadatos de safetensors; el nombre del modelo base indica 6.900M, lo que sugiere una discrepancia a verificar) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8, group size 64, cuantizacion asimetrica (sym=false), metodo AutoGPTQ, framework Intel AutoRound v0.13.1 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con capas cuantizadas AutoGPTQ) |

## Arquitectura y entrenamiento

El modelo base `pythia-6.9b-deduped` es un transformer de tipo GPT-NeoX con 6.900 millones de parametros, entrenado por EleutherAI sobre el corpus `EleutherAI/pile` deduplicado. El entrenamiento se realizo con una configuracion estandar de decoder causal, sin tecnicas de alineacion como RLHF o DPO. La version cuantizada aqui descrita no modifica la arquitectura, sino que transforma los pesos a INT8 mediante el algoritmo GPTQ, aplicando el framework Intel AutoRound. La cuantizacion utiliza un group size de 64 y esquema asimetrico, con calibracion sobre 128 muestras, 200 iteraciones y una longitud de secuencia de 512 tokens. El proceso de cuantizacion se ejecuto en CPU con `torch.bfloat16` como tipo de dato de carga. El modelo resultante esta optimizado para inferencia en Intel CPU, iGPU Arc y NPU a traves de OpenVINO, aunque tambien es compatible con otros backends que soporten AutoGPTQ.

## Capacidades

- Generacion de texto en ingles: el modelo funciona como un modelo base de completacion, capaz de continuar un texto dado sin necesidad de plantillas de chat.
- Razonamiento basico: al ser un modelo de 6.9B, puede resolver tareas sencillas de logica o aritmetica, aunque sin un fine-tuning especifico el rendimiento es limitado.
- Soporte de fine-tuning: al estar cuantizado, puede usarse como punto de partida para ajustes posteriores, aunque se recomienda re-cuantizar si se modifica el modelo.
- No soporta tool calling / function calling: no esta disenado para ello al carecer de entrenamiento en ese tipo de tareas.
- No soporta agentes ni razonamiento multi-step: no incluye capacidades de planificacion ni memoria explicita.
- Capacidades multilingues: no dispone de soporte multilingue; solo opera en ingles.
- Sin capacidades de vision ni audio: el modelo es exclusivamente de texto.

## Casos de uso

- Generacion de contenido en ingles para documentacion tecnica: el modelo puede completar parrafos, generar borradores de manuales o redactar explicaciones simples. Se usaria con prompts de completacion directa, por ejemplo, `"The purpose of this API is"`.
- Fine-tuning para tareas de clasificacion de texto en ingles: gracias a su licencia Apache 2.0, puede ajustarse para analisis de sentimiento, deteccion de spam o etiquetado tematico, usando el modelo base como punto de partida y re-cuantizando despues.
- Prototipado de experimentos de compresion de modelos: la version INT8 sirve como referencia para estudiar el impacto de la cuantizacion en la calidad del modelo, especialmente en comparacion con la variante con group size 128.
- Despliegue en servidores sin GPU: al estar optimizado para Intel, puede ejecutarse en CPUs con 16-32 GB de RAM mediante `transformers` o `llama.cpp`, lo que resulta util para entornos de produccion con presupuesto reducido.
- Inferencia en dispositivos edge con NPU Intel: el modelo esta preparado para Intel Core Ultra, permitiendo ejecutar generacion de texto en portatiles o dispositivos embebidos a traves de OpenVINO.
- Educacion e investigacion en arquitectura GPT-NeoX: los estudiantes e investigadores pueden cargar el modelo cuantizado para estudiar el comportamiento de un transformer de gran tamano sin necesidad de GPUs costosas, gracias al peso reducido en INT8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7-8 GB para los pesos en INT8 (considerando el modelo base de 6.9B), mas overhead de activaciones, lo que sugiere un minimo de 12 GB de VRAM para inferencia en GPU.
- GPU recomendadas: RTX 3090, RTX 4090, A100 o H100. No se recomienda el uso en GPUs con menos de 12 GB de VRAM para secuencias largas.
- Compatibilidad con GPU de consumo: si se dispone de 12 GB o mas, una RTX 4070 Ti o superior puede ejecutar el modelo, aunque con limitaciones en la longitud de la secuencia.
- Opciones de despliegue: `transformers` (con auto-gptq), `llama.cpp` (si se convierte a GGUF), `vLLM` (si el backend soporta AutoGPTQ) y `OpenVINO` para Intel.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fbaldassarri/EleutherAI_pythia-6.9b-deduped-auto_gptq-int8-gs64-asym` | 6.9B (nombre del modelo) | no disponible | INT8, group size 64, asimetrica | Apache 2.0 | HuggingFace |
| `fbaldassarri/EleutherAI_pythia-6.9b-autogptq-int8-gs128-asym` | 6.9B | no disponible | INT8, group size 128, asimetrica | Apache 2.0 | HuggingFace |
| `EleutherAI/pythia-6.9b-deduped` | 6.9B | no disponible | sin cuantizacion | Apache 2.0 | HuggingFace |

La variante con group size 64 ofrece una granularidad de cuantizacion mas fina que la de group size 128, lo que en teoria puede preservar algo mas de precision a costa de un mayor tamano del archivo. El modelo original sin cuantizar es la referencia para medir la degradacion de calidad.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo hereda los sesgos del dataset `The Pile`, que incluye texto de internet y puede contener contenido toxico, discriminador o desactualizado.
- Riesgo de alucinacion: al ser un modelo base sin alineacion, es probable que genere afirmaciones falsas o incoherentes, especialmente en temas factuales.
- Limitaciones de idioma: solo soporta ingles, por lo que no es adecuado para tareas en castellano u otros idiomas.
- Limitaciones de contexto: la longitud de contexto no se especifica en la model card, pero el modelo base Pythia tiene una ventana conocida de 2048 tokens, lo que restringe el uso en documentos largos.
- Discrepancia en los parametros: los metadatos de safetensors indican 2.152.210.432 parametros, mientras que el nombre del modelo sugiere 6.9B. Esta discrepancia debe verificarse antes de usar el modelo en produccion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo se publica sin garantias y solo con fines de investigacion, segun el disclaimer del autor.
- Uso en produccion: al ser una version cuantizada de un modelo base sin instrucciones, no se recomienda su uso directo en aplicaciones de usuario final sin un fine-tuning posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fbaldassarri/EleutherAI_pythia-6.9b-deduped-auto_gptq-int8-gs64-asym
- Modelo base original: https://huggingface.co/EleutherAI/pythia-6.9b-deduped
- Variante similar con group size 128: https://huggingface.co/fbaldassarri/EleutherAI_pythia-6.9b-autogptq-int8-gs128-asym
- Repositorio del framework AutoRound: https://github.com/intel/auto-round
- Pipeline de cuantizacion mencionado en la model card: https://git.epicdynamic.com/auto-round-pipeline
