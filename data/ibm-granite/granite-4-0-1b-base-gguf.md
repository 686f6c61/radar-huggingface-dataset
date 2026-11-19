# ibm-granite/granite-4.0-1b-base-GGUF

## Resumen

Granite-4.0-1b-base-GGUF es la distribucion en formato GGUF del modelo base Granite 4.0 de 1B parametros desarrollado por IBM. Este repositorio no contiene un modelo nuevo, sino la conversion a cuantizacion GGUF del checkpoint original `ibm-granite/granite-4.0-1b-base`, pensada para su ejecucion en llama.cpp y herramientas compatibles. El modelo pertenece a la familia Granite 4.0 de IBM, orientada a cargas de trabajo de generacion de lenguaje en entornos con recursos limitados.

Con 1.631.750.144 parametros totales (aproximadamente 1,63 mil millones), se trata de un modelo denso de escala pequena, adecuado para inferencia en CPU, GPUs de consumo y despliegues en el borde. Al ser un modelo *base* (no instruido), su proposito es servir como punto de partida para ajuste fino supervisado o como generador de texto sin alineamiento conversacional. La licencia Apache 2.0 facilita su uso comercial y su integracion en productos.

La relevancia actual radica en la combinacion de licencia permisiva, tamano reducido y disponibilidad inmediata en GGUF con multiples cuantizaciones, lo que permite desplegarlo en hardware modesto y en pipelines que ya usan llama.cpp o servidores compatibles con la API de OpenAI. La informacion publica disponible en este repositorio es limitada: la model card remite a la del modelo base para detalles de arquitectura, entrenamiento y evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer denso de la familia Granite 4.0, segun nomenclatura del autor) |
| Parametros totales | 1.631.750.144 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | multiples cuantizaciones GGUF; el ejemplo de la model card usa BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (libreria llama.cpp); checkpoint original en safetensors |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo. Por la nomenclatura del autor (familia Granite 4.0) y el numero de parametros, se trata de un modelo de lenguaje denso de escala 1B. El repositorio es una conversion a GGUF del checkpoint `ibm-granite/granite-4.0-1b-base`, generada con llama.cpp (build tag `b11798`) y verificada con Transformers 5.20.2. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO o ajuste por instrucciones; al ser un modelo *base*, es esperable que no incluya alineamiento conversacional, aunque este extremo no se confirma en la documentacion accesible.

Tampoco se documentan innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, arquitecturas hibridas) en el material disponible. Para obtener detalles de arquitectura y entrenamiento es necesario consultar la model card del modelo base enlazada por el autor.

## Capacidades

- Generacion de texto autoregresiva en modo *base*: continuacion y completado de texto sin formato conversacional predefinido.
- Punto de partida para ajuste fino: al no estar instruido, es adecuado para SFT, LoRA o adaptacion a dominios concretos.
- Inferencia local mediante llama.cpp: soporta ejecucion en CPU y GPU a traves de `llama cli` y `llama serve`.
- Compatibilidad con la API de OpenAI: `llama serve` expone el endpoint `/v1/chat/completions`, lo que permite integrarlo en clientes existentes.
- Multiples cuantizaciones GGUF: permite elegir el equilibrio entre calidad y huella de memoria segun el hardware.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Tool calling, agentes, vision, audio o modo *thinking*: no disponible en la informacion proporcionada; al ser un modelo base de 1B, no se documentan estas capacidades.

## Casos de uso

- Prototipado rapido en local: usar `llama cli` con una cuantizacion ligera para probar prompts y flujos de generacion de texto en un portatil sin GPU dedicada, gracias al reducido numero de parametros.
- Ajuste fino para dominios verticales: emplear el checkpoint base como inicializacion para SFT o LoRA en tareas como clasificacion de texto, extraccion de entidades o generacion de resumenes especializados.
- Servicio de generacion de texto autohospedado: desplegar `llama serve` y consumir el endpoint compatible con OpenAI desde aplicaciones existentes, evitando dependencias de proveedores externos.
- Generacion de texto en el borde: integrar el modelo cuantizado en dispositivos con recursos limitados (mini-PC, Raspberry Pi con suficiente RAM, portatiles) para tareas de completado y transformacion de texto.
- Preprocesamiento y enriquecimiento de datos: usar el modelo para generar datos sinteticos, reformatear registros o etiquetar corpus en pipelines de datos a gran escala con coste bajo por token.
- Base para investigacion en eficiencia: servir como referencia de 1B parametros para experimentos de cuantizacion, destilacion o comparativas de rendimiento en llama.cpp.
- Filtrado y moderacion de contenido offline: ejecutar el modelo en local para clasificar o reescribir texto sin enviar datos a servicios externos, aprovechando la licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF remite a la del modelo base (`ibm-granite/granite-4.0-1b-base`) para cualquier dato de evaluacion; no se incluyen cifras de MMLU, HumanEval, GSM8K ni de otras suites en el material proporcionado.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible de forma oficial; como referencia orientativa por tamano, un modelo de 1,63B parametros ocupa aproximadamente 3,3 GB en BF16, alrededor de 1,7 GB en Q8, cerca de 1 GB en Q4 y en torno a 0,7 GB en Q2 (estimaciones teoricas de peso de pesos, sin contar overhead de contexto ni KV cache).
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU con al menos 4 GB de VRAM puede alojar cuantizaciones Q4/Q8 con contexto moderado (GTX 1650, RTX 3050, RTX 4060, etc.).
- Cabe en GPU de consumo: si, en la mayoria de GPUs consumer actuales con cuantizaciones Q4 o superiores; tambien puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (`llama cli`, `llama serve`), y por compatibilidad de formato GGUF, otros runners basados en llama.cpp como Ollama o servidores compatibles; no se documentan integraciones con vLLM o TGI para este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| granite-4.0-1b-base-GGUF | 1,63B | no disponible | Apache 2.0 | GGUF | Modelo base, conversion oficial de IBM |
| Llama 3.2 1B | 1,24B | 128K (segun documentacion publica de Meta) | Llama 3.2 Community License | safetensors, GGUF | Requiere aceptar licencia de Meta; no verificado en esta ficha |
| Qwen2.5 1.5B | 1,54B | 32K (segun documentacion publica de Alibaba) | Apache 2.0 | safetensors, GGUF | Alternativa de tamano similar con licencia permisiva; no verificado en esta ficha |
| SmolLM2 1.7B | 1,71B | 8K (segun documentacion publica de Hugging Face) | Apache 2.0 | safetensors, GGUF | Enfocado a eficiencia; no verificado en esta ficha |

Los datos de los modelos comparativos provienen de documentacion publica general y no han sido verificados en la informacion proporcionada; se incluyen solo como referencia de categoria. No se dispone de comparativas de rendimiento medidas para este modelo.

## Limitaciones y advertencias

- Modelo *base* sin alineamiento: no esta disenado para seguir instrucciones ni para conversacion; produce continuaciones de texto y puede requerir ajuste fino para tareas concretas.
- Riesgo de alucinacion: como cualquier modelo de lenguaje de 1B parametros, puede generar contenido factualmente incorrecto, especialmente en dominios especializados.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; es esperable que herede sesgos de los datos de entrenamiento del modelo base.
- Idiomas: no se especifica la cobertura linguistica; el rendimiento fuera del ingles (y posibles idiomas adicionales del modelo base) no esta garantizado.
- Contexto: la longitud de contexto no esta documentada en este repositorio; conviene consultar la model card del modelo base antes de disenar flujos con contexto largo.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; aun asi, conviene revisar los terminos del modelo base y de los datos de entrenamiento para usos sensibles.
- Produccion: al no haber benchmarks ni datos de latencia publicados, es recomendable realizar una evaluacion propia antes de desplegarlo en entornos criticos.
- Cuantizacion: las versiones de baja precision (Q2, Q3) pueden degradar notablemente la calidad; se recomienda validar la cuantizacion elegida con tareas representativas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ibm-granite/granite-4.0-1b-base-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-1b-base
- llama.cpp (repositorio): https://github.com/ggml-org/llama.cpp
- Documentacion de `llama cli`: https://github.com/ggml-org/llama.cpp/blob/master/tools/cli/README.md
- Documentacion de `llama serve`: https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md
