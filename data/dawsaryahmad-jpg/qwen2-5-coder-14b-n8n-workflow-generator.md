# dawsaryahmad-jpg/Qwen2.5-Coder-14B-n8n-Workflow-Generator

## Resumen

Qwen2.5-Coder-14B-n8n-Workflow-Generator es un ajuste fino del modelo Qwen/Qwen2.5-Coder-14B-Instruct especializado en generar flujos de trabajo de n8n en formato JSON a partir de descripciones en lenguaje natural. Lo publica el usuario dawsaryahmad-jpg en HuggingFace (la model card atribuye el trabajo al autor mbakgun), y resuelve un problema muy concreto: escribir a mano la estructura JSON de un workflow de n8n —nodos, conexiones, parametros y credenciales— es una tarea repetitiva y propensa a errores de sintaxis.

El modelo parte de un transformer decoder-only de 14.770.033.664 parametros (aproximadamente 14,8 mil millones) y se ha entrenado mediante QLoRA con cuantizacion de 4 bits, rango LoRA 32 y alpha 64, durante 432 pasos (3 epocas) sobre el dataset mbakgun/n8nbuilder-n8n-workflows-dataset, que contiene mas de 2.300 plantillas publicas de la galeria de n8n. La longitud de secuencia empleada en el entrenamiento es de 8192 tokens y el idioma declarado es unicamente el ingles.

Su relevancia es acotada pero clara: cubre un nicho de automatizacion de procesos (RPA ligera, integraciones SaaS) donde los modelos generalistas suelen producir JSON invalido o nodos inexistentes. La licencia Apache 2.0 y la disponibilidad de pesos en safetensors, GGUF y MLX facilitan su despliegue tanto en servidor como en Apple Silicon. El contrapeso es que no se han publicado resultados de benchmarks objetivos en la informacion disponible y que el repositorio no acumula descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), ajuste fino QLoRA sobre Qwen2.5-Coder-14B-Instruct |
| Parametros totales | 14.770.033.664 (segun safetensors) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No especificada en la model card para el ajuste; el modelo base Qwen2.5-Coder-14B-Instruct declara 32.768 tokens nativos. El entrenamiento se realizo con secuencias de 8192 tokens |
| Tipos de cuantizacion | 4-bit (bitsandbytes, usada en el entrenamiento QLoRA), MLX Q4 (pesos publicados), GGUF (etiqueta declarada en el repositorio) |
| Idiomas soportados | Ingles (unico idioma declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF y MLX (libreria declarada: mlx) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only autorregresivo de la familia Qwen2, con 14.770.033.664 parametros. No hay modificaciones estructurales: el ajuste se aplica como adaptadores LoRA sobre los pesos originales, por lo que la arquitectura efectiva en inferencia es identica a Qwen2.5-Coder-14B-Instruct. El entrenamiento uso QLoRA con cuantizacion de 4 bits, rango LoRA 32, alpha 64, learning rate 2e-4, 432 pasos distribuidos en 3 epocas, longitud de secuencia de 8192 tokens y un consumo de VRAM aproximado de 30 GB. La velocidad de entrenamiento reportada es de unos 33,85 segundos por paso en una H100 PCIe.

Los datos de entrenamiento provienen del dataset mbakgun/n8nbuilder-n8n-workflows-dataset, construido a partir de la galeria publica de plantillas de n8n.io, con mas de 2.300 plantillas de workflow tras filtrar las secuencias que superaban los 8192 tokens. El formato es Alpaca (instruccion / entrada / salida), de modo que el modelo aprende a mapear una descripcion funcional a un JSON de workflow. No se documenta en la model card ninguna fase de RLHF, DPO o preference tuning; el ajuste es exclusivamente supervisado sobre pares instruccion-salida.

## Capacidades

- Generacion de workflows de n8n completos en JSON a partir de una descripcion en lenguaje natural, incluyendo nodos, conexiones y parametros de configuracion.
- Generacion de codigo en sentido amplio, heredada del modelo base Qwen2.5-Coder, cuyo preentrenamiento esta orientado a codigo.
- Interpretacion de instrucciones conversacionales de tipo instruction-following, dado que el modelo base es la variante Instruct.
- Generacion de estructuras largas: el prompt de referencia sugiere hasta 4096 tokens nuevos, adecuado para workflows con muchos nodos.
- Capacidad multilingue limitada: el modelo declara unicamente ingles como idioma soportado, por lo que las instrucciones en otros idiomas no estan garantizadas.
- No se documenta soporte explicito de tool calling, function calling, modo de razonamiento extendido (thinking), vision ni audio. Cualquier capacidad de este tipo seria la heredada del modelo base y no esta validada por el autor del ajuste.

## Casos de uso

- Generacion de automatizaciones de integracion SaaS: el modelo produce el JSON de un workflow que conecta dos o mas servicios (por ejemplo, RSS a Discord o GitHub a Slack), tal y como se muestra en los ejemplos de la model card, lo que reduce el tiempo de configuracion manual en la interfaz de n8n.
- Prototipado rapido de pipelines de datos: a partir de una frase como "recoge los datos de esta API cada hora y guardalos en una hoja de calculo", el modelo genera la estructura de nodos necesaria para que un equipo de datos la revise y complete.
- Asistente integrado en herramientas de automatizacion: al ser un modelo de 14,8B con licencia Apache 2.0, puede desplegarse como servicio interno que reciba peticiones de usuarios no tecnicos y devuelva workflows listos para importar en n8n.
- Migracion y refactorizacion de workflows: dado que genera JSON estandar de n8n, es util para reescribir workflows existentes en un formato coherente o para completar plantillas incompletas a partir de una descripcion funcional.
- Documentacion tecnica de automatizaciones: el modelo puede describir en texto la funcion de un workflow descrito previamente, aunque esta capacidad no esta validada explicitamente por el autor y depende del modelo base.
- Despliegue local en Apple Silicon: gracias a los pesos en formato MLX Q4 y a un rendimiento declarado de 25-40 tokens por segundo en un Mac Mini M4 de 64 GB, es viable como herramienta de escritorio para desarrolladores que no quieren enviar sus flujos a la nube.
- Base para nuevos ajustes de dominio: al ser un LoRA sobre Qwen2.5-Coder-14B-Instruct con licencia Apache 2.0, sirve como punto de partida para especializaciones adicionales sobre otras plataformas de automatizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna evaluacion especifica de generacion de workflows de n8n, ni comparaciones cuantitativas con el modelo base. Los unicos datos de rendimiento reportados son operativos: 33,85 s/paso durante el entrenamiento en una H100 PCIe, unos 30 GB de VRAM en el entrenamiento QLoRA de 4 bits y 25-40 tokens/s de inferencia en MLX sobre un Mac Mini M4 con 64 GB de memoria unificada.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16/float16, alrededor de 29-30 GB solo para los pesos (14,77B parametros a 2 bytes), mas el overhead de cache KV; en cuantizacion de 8 bits, en torno a 15-16 GB; en 4 bits (GGUF Q4 o MLX Q4), aproximadamente 8-9 GB de pesos.
- GPU recomendadas: A100 40/80 GB, H100 PCIe o SXM y L40S para despliegue en precision completa o media; para cuantizacion 4-bit, tarjetas con 16 GB o mas.
- Cabe en GPU de consumo: si, en configuraciones cuantizadas a 4 bits (RTX 4090 de 24 GB, RTX 4080 de 16 GB, RTX 3090 de 24 GB). En bfloat16 no cabe en ninguna GPU de consumo actual.
- Apple Silicon: existe una variante MLX Q4 documentada por el autor; el ejemplo de uso reporta 25-40 tokens/s en un Mac Mini M4 con 64 GB.
- Opciones de despliegue: transformers (ejemplo incluido en la model card), mlx_lm para Apple Silicon, y llama.cpp u Ollama a traves de los pesos GGUF etiquetados en el repositorio. El soporte en vLLM o TGI no esta documentado en la informacion disponible, aunque la arquitectura Qwen2 es habitualmente soportada por estos servidores.
- Latencia y throughput: unicos datos disponibles, 25-40 tokens/s en Mac Mini M4 64 GB con MLX Q4. No hay mediciones publicadas de latencia ni throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-Coder-14B-n8n-Workflow-Generator | 14,77B | No especificado para el ajuste; 32.768 tokens en el modelo base | Generacion de workflows de n8n | Apache 2.0 | Pesos en safetensors, GGUF y MLX en HuggingFace |
| Qwen2.5-Coder-14B-Instruct (modelo base) | 14,77B | 32.768 tokens nativos (ampliable con YaRN) | Codigo e instrucciones generales | Apache 2.0 | HuggingFace, amplia adopcion y ecosistema |
| Qwen2.5-Coder-32B-Instruct | 32,5B | 32.768 tokens nativos | Codigo e instrucciones generales | Apache 2.0 | HuggingFace; requiere hardware muy superior |
| Alternativas especificas para generacion de workflows de n8n | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas comparables en la informacion disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento del ajuste frente al modelo base ni frente a terceros. La comparacion anterior se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Los workflows generados pueden requerir validacion manual antes de ejecutarse; el propio autor lo indica explicitamente en la model card.
- Los workflows que superan los 8192 tokens pueden truncarse, dado que esa fue la longitud de secuencia usada en el entrenamiento.
- El modelo se entreno exclusivamente con plantillas publicas de la galeria de n8n, por lo que puede fallar ante nodos personalizados, integraciones privadas o versiones recientes que no estuvieran presentes en el dataset.
- Riesgo de alucinacion en nombres de nodos, parametros y campos de configuracion: es un riesgo estructural en cualquier modelo generativo aplicado a un esquema JSON estricto y no se documentan evaluaciones que lo cuantifiquen.
- Idioma: solo se declara ingles. Las instrucciones en castellano u otros idiomas no estan soportadas oficialmente y probablemente degraden la calidad de la salida.
- Sesgos conocidos: no se documenta ninguna evaluacion de sesgos, toxicidad o sesgo de dominio. El corpus de entrenamiento (plantillas publicas de n8n) puede sobrerrepresentar determinadas integraciones populares y omitir otras.
- Licencia Apache 2.0, que permite uso comercial sin restricciones adicionales, siempre que se conserve el aviso de licencia y se cumplan las condiciones de atribucion.
- Caveat de trazabilidad: el identificador del repositorio en HuggingFace es dawsaryahmad-jpg/Qwen2.5-Coder-14B-n8n-Workflow-Generator, mientras que la model card, los ejemplos de codigo y la cita bibliografica hacen referencia a mbakgun/Qwen2.5-Coder-14B-n8n-Workflow-Generator. Conviene verificar cual es el repositorio canonico antes de integrarlo en produccion.
- El repositorio muestra 0 descargas y 0 valoraciones, y fue creado y actualizado el mismo dia, por lo que no existe validacion independiente de la comunidad.
- El tamano del repositorio (76,9 GB) indica que se almacenan varias copias de los pesos en distintos formatos y cuantizaciones; conviene seleccionar solo la variante necesaria para el despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dawsaryahmad-jpg/Qwen2.5-Coder-14B-n8n-Workflow-Generator
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/mbakgun/n8nbuilder-n8n-workflows-dataset
- Plataforma n8n: https://n8n.io
- n8nbuilder.dev (herramienta del autor del dataset): https://n8nbuilder.dev
- Repositorio n8n-mcp, usado para la indexacion de plantillas: https://github.com/czlonkowski/n8n-mcp
- Paper o blog tecnico del ajuste: no disponible
- Demo publica: no disponible
- Resultados de benchmarks: no disponible

Nota: los resultados de la busqueda web proporcionada no contienen informacion relacionada con este modelo ni con n8n; consisten en paginas de horoscopos y discusiones genericas sobre otros modelos, por lo que no se han utilizado como fuente.
