# open-athena/snowball-67b-a2b-base-262k-qk175

## Resumen

Snowball 67B-A2B es un modelo de lenguaje de base desarrollado por open-athena con arquitectura Mixture of Experts (MoE). Tiene 67.078.882.816 parametros totales y activa aproximadamente 2.000 millones por token, lo que lo hace computacionalmente eficiente para su tamano. La ventana de contexto se ha extendido a 262.144 tokens, lo que permite procesar documentos muy largos en una unica pasada.

El checkpoint es un export en BF16 del paso 157.000 de un experimento de contexto largo de la comunidad Marin. Es un modelo base, no afinado para instrucciones, y se sirve mediante un fork de vLLM que registra la arquitectura `GrugMoeForCausalLM`. Su valor principal reside en ser una referencia abierta para investigar MoE de gran escala con contexto amplio, aunque todavia no se han publicado benchmarks que permitan evaluar su rendimiento frente a otros modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GrugMoeForCausalLM (MoE) |
| Parametros totales | 67.078.882.816 |
| Parametros activos | Aproximadamente 2B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | BF16 (sin cuantizaciones de 4/8 bits en este repo) |
| Idiomas soportados | en |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo usa una arquitectura MoE con 26 capas. Cada token se envia a 4 de los 256 expertos disponibles y la salida se combina para generar el siguiente token. La atencion utiliza 5 cabezas KV, lo que reduce la memoria asociada al cache de key-value en comparacion con configuraciones densas. El vocabulario tiene 128.256 entradas. La variante con `qk_mult=1.75` sugiere una modificacion en el escalado de las consultas/claves para adaptar la atencion a contextos muy largos.

Segun la model card, el checkpoint procede del paso 157.000 de un experimento comparativo de contexto largo. La extension de contexto desde el paso 156.000 hasta el 157.000 se realizo con `qk_mult=1.75` y manteniendo el muestreo de documentos de contexto largo sin cambios. Una entrada de blog de la comunidad Marin indica que el modelo ha pasado por un cooldown de 5,7 trillones de tokens con un data mix actualizado, y que este checkpoint es el primer punto antes de un pipeline de SFT. No hay evidencia de ajustes por RLHF ni DPO; el modelo es puramente base.

## Capacidades

- Generacion de texto: el modelo produce completions de texto en ingles para prompts de continuacion.
- Contexto largo: permite procesar secuencias de hasta 262.144 tokens, util para documentos extensos.
- Eficiencia computacional: al activar solo ~2B parametros por token, el coste por token es menor que el de un modelo denso de tamano equivalente.
- Uso como base para fine-tuning: al ser un modelo base, se puede adaptar a tareas especificas de instrucciones, chat o codigo.
- No se documenta soporte para tool calling, function calling, agentes, vision ni audio.
- Es un modelo monolingue en ingles; no se indica capacidad multilingue.

## Casos de uso

- Fine-tuning para analisis de documentos largos: su ventana de 262K permite entrenar un modelo que resuma o extraiga informacion de contratos, informes anuales o expedientes completos sin trocear el documento.
- Recuperacion aumentada (RAG) con corpus extensos: al usar el modelo como base, un sistema RAG puede incorporar pasajes mucho mas amplios por consulta, lo que reduce el numero de fragmentos necesarios.
- Generacion de codigo asistida por contexto: tras afinarlo en repositorios grandes, puede completar codigo sujetandose a archivos completos del proyecto gracias a la ventana de 262K tokens.
- Investigacion en modelos MoE: al publicarse los pesos en BF16, permite estudiar la activacion de expertos, el efecto de `qk_mult` y las propiedades de generalizacion en arquitecturas GrugMoe.
- Base para asistentes conversacionales: el tokenizer incluye una plantilla de chat que no se ha usado para instrucciones; se puede reutilizar para entrenar un asistente de dialogo mediante SFT.
- Evaluacion y medicion del contexto largo: este checkpoint sirve como referencia para comparar el impacto de distintas configuraciones QK en tareas de recuperacion de informacion sobre documentos largos.
- Generacion de contenido tecnico: para completar documentacion, articulos o especificaciones en ingles, dado el buen rendimiento esperable de un modelo base de este tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia BF16: al menos 134 GB solo para los pesos, mas overhead de activaciones y KV cache. Con la configuracion documentada de 8× H100 (80 GB cada una) hay margen suficiente.
- GPU recomendadas: 8× H100 para el despliegue documentado (tensor parallelism 1, data parallelism 8 y expert parallelism).
- Consumer GPU: no cabe sin cuantizaciones adicionales; este repo solo ofrece pesos en BF16, por lo que se necesitan GPUs de centro de datos.
- Opciones de despliegue: vLLM mediante el fork marin-community/vllm. No se documenta soporte en llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible.

## Limitaciones y advertencias

- Es un modelo base, no afinado para instrucciones; el uso interactivo directo no esta soportado y requiere fine-tuning posterior.
- Solo ofrece pesos en BF16, sin cuantizaciones publicadas, lo que encarece el despliegue en entornos de produccion.
- Requiere un fork de vLLM especifico, lo que puede generar incompatibilidades con el ecosistema estandar.
- No se han documentado evaluaciones de sesgos ni de seguridad; el comportamiento ante prompts maliciosos es desconocido.
- La licencia openmdw-1.1 debe revisarse para confirmar permisos de uso comercial, ya que la informacion disponible no detalla sus restricciones.
- Solo soporta ingles; no se documentan capacidades multilingues.
- El checkpoint se ha exportado sin pruebas de paridad numerica ni de generacion; no se ha verificado que el comportamiento sea identico al entrenamiento original.
- No hay benchmarks publicados, por lo que el rendimiento real en tareas estandar es desconocido.

## Enlaces

- HuggingFace: https://huggingface.co/open-athena/snowball-67b-a2b-base-262k-qk175
- Issue del experimento de contexto largo: https://github.com/marin-community/marin/issues/8977
- Fork de vLLM requerido: https://github.com/marin-community/vllm
- Registro de servicio y evaluacion: https://github.com/marin-community/marin/issues/8702
- Blog sobre pipeline SFT para modelos Marin: https://storage.googleapis.com/marin-public/benjaminfeuer/standing-up-a-cold-start-sft-pipeline-for-marin-models/2026.08.16/index.html
