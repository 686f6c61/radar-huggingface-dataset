# mradermacher/KHIPU-R2-GGUF

# mradermacher/KHIPU-R2-GGUF

## Resumen

KHIPU-R2-GGUF es la version cuantizada en formato GGUF del modelo SZLHOLDINGS/KHIPU-R2, publicada por el usuario mradermacher, conocido por distribuir cuantizaciones listas para inferencia local. El modelo base pertenece a SZLHOLDINGS y cuenta con 1.543.714.304 parametros (aproximadamente 1,54 mil millones), segun los pesos en safetensors del repositorio. La cuantizacion se distribuye bajo licencia apache-2.0 y declara soporte unicamente para ingles.

El repositorio de cuantizacion emplea la plantilla habitual de mradermacher y no aporta informacion sobre arquitectura, composicion del dataset de entrenamiento, longitud de contexto ni proceso de alineamiento. Los metadatos del modelo base indican que fue ajustado con QLoRA y PEFT, y las etiquetas incluyen terminos como "governed-agent", "proposal-only", "research-only" y "abstain-retrain", que apuntan a un artefacto de investigacion orientado a agentes gobernados con mecanismos de abtencion y reentrenamiento, aunque no existe documentacion publica que detalle su funcionamiento.

La relevancia de esta ficha es practica: se trata de un modelo pequeno (en el rango de 1,5 B de parametros) que cabe en practicamente cualquier GPU de consumo e incluso en CPU, con cuantizaciones desde 0,8 GB (Q2_K) hasta 3,2 GB (f16). Es adecuado para experimentacion local, prototipado rapido y despliegue en entornos con recursos limitados, pero no para tareas que exijan razonamiento complejo o conocimiento factual fiable sin verificacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base se publica para la libreria transformers; no se documenta si es transformer denso, MoE o hibrido) |
| Parametros totales | 1.543.714.304 (unos 1,54 mil millones), segun pesos safetensors |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF en este repositorio; safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura del modelo base SZLHOLDINGS/KHIPU-R2: la model card del repositorio GGUF es una plantilla generica de cuantizacion y no describe la topologia de red, el mecanismo de atencion ni si incorpora decodificacion especulativa u otras optimizaciones. Los unicos datos objetivos son el numero de parametros (1,54 B) y las etiquetas del repositorio, que indican un ajuste mediante QLoRA y PEFT sobre un modelo previo, lo que implica que el resultado final es la fusion de adaptadores de bajo rango con los pesos base.

Tampoco hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineamiento como RLHF, DPO o SFT supervisado. Las etiquetas "abstain-retrain" y "governed-agent" sugieren que el ajuste pudo orientarse a que el modelo se abstenga de responder en lugar de inventar cuando no dispone de informacion suficiente, y a un ciclo de reentrenamiento en un marco de agentes gobernados, pero esto es una inferencia a partir de etiquetas y no una afirmacion respaldada por documentacion.

## Capacidades

- Generacion de texto conversacional: las etiquetas "conversational" y "endpoints_compatible" indican que el modelo esta preparado para dialogos multi-turno y es compatible con endpoints de inferencia estandar.
- Ajuste fino con QLoRA y PEFT: el modelo base fue adaptado con tecnicas de bajo rango, lo que sugiere una especializacion sobre un modelo preentrenado generico.
- Orientacion a agentes gobernados: las etiquetas "governed-agent" y "proposal-only" apuntan a un uso dentro de sistemas de agentes donde el modelo genera propuestas en lugar de ejecutar acciones de forma autonoma, aunque no hay especificacion tecnica publica de este comportamiento.
- Mecanismo de abtencion: la etiqueta "abstain-retrain" sugiere capacidad de abstenerse ante incertidumbre y de integrarse en bucles de reentrenamiento, sin documentacion que lo confirme.
- Capacidades multilingues: limitadas al ingles, segun el campo "language: en".
- Soporte de tool calling / function calling: no disponible.
- Razonamiento multi-paso, vision, audio o modo "thinking": no disponible.

## Casos de uso

- Prototipado local de asistentes conversacionales: con cuantizaciones de entre 0,8 GB y 1,7 GB, el modelo puede ejecutarse en portatiles y equipos sin GPU dedicada para validar flujos de dialogo antes de escalar a modelos mayores.
- Experimentacion en investigacion sobre agentes gobernados: las etiquetas "governed-agent", "proposal-only" y "abstain-retrain" lo senalan como candidato para probar arquitecturas donde el modelo solo propone acciones y un componente externo decide si se ejecutan.
- Clasificacion y extraccion de informacion en ingles: un modelo de 1,5 B puede emplearse para tareas de etiquetado, resumen corto o extraccion de entidades en pipelines por lotes donde la latencia no es critica y el coste por token importa.
- Generacion de texto en entornos con hardware muy limitado: la cuantizacion Q2_K (0,8 GB) permite desplegar el modelo en dispositivos embebidos, Raspberry Pi de gama alta o contenedores con poca memoria asignada.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio incluye doce variantes (de Q2_K a f16), lo que lo convierte en un banco de pruebas util para medir la degradacion de calidad entre niveles de cuantizacion en un modelo de 1,5 B.
- Base para ajuste fino adicional con LoRA: al partir de un repositorio con pesos en safetensors en el modelo original, es posible aplicar nuevos adaptadores sobre dominios especificos (soporte tecnico, dominio legal acotado) con coste de computo reducido.
- Simulacion de dialogos y generacion de datos sinteticos: util para producir corpus de conversaciones en ingles destinados a entrenar o evaluar otros sistemas, siempre con revision humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni los metadatos de HuggingFace incluyen cifras de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de ninguna otra evaluacion estandar, y la busqueda web realizada no ha devuelto documentacion tecnica asociada al modelo base SZLHOLDINGS/KHIPU-R2.

## Requisitos de hardware

La siguiente tabla estima la VRAM necesaria para inferencia segun el peso de los ficheros publicados, anadiendo un margen para cache KV y overhead del runtime. Son estimaciones a partir del tamano en disco, no mediciones publicadas.

| Cuantizacion | Tamano en disco | VRAM estimada (inferencia) |
|---|---|---|
| Q2_K | 0,8 GB | ~1,3 GB |
| Q3_K_S | 0,9 GB | ~1,4 GB |
| Q3_K_M | 0,9 GB | ~1,4 GB |
| Q3_K_L | 1,0 GB | ~1,5 GB |
| IQ4_XS | 1,0 GB | ~1,5 GB |
| Q4_K_S | 1,0 GB | ~1,5 GB |
| Q4_K_M | 1,1 GB | ~1,7 GB |
| Q5_K_S | 1,2 GB | ~1,8 GB |
| Q5_K_M | 1,2 GB | ~1,8 GB |
| Q6_K | 1,4 GB | ~2,0 GB |
| Q8_0 | 1,7 GB | ~2,5 GB |
| f16 | 3,2 GB | ~4,0 GB |

- Cabe en GPU de consumo: si, en cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090, entre otras). Las cuantizaciones Q4 y Q5 funcionan incluso en GPUs integradas con memoria unificada y en CPU con RAM suficiente.
- GPU profesionales: no requiere A100, H100 ni similares; el modelo es demasiado pequeno para aprovecharlas. Solo tendria sentido en escenarios de servicio con muchas peticiones concurrentes, donde convendria agregar instancias en lugar de usar una GPU de gama alta.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llamafile, llama-cpp-python y text-generation-webui para los ficheros GGUF. Para los pesos originales en safetensors (modelo base), transformers con PEFT, vLLM o TGI.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.
- Nota sobre cuantizaciones: el autor indica que no ha generado cuantizaciones ponderadas con imatrix para este modelo, por lo que las variantes de baja precision (Q2_K, Q3_K_S, Q3_K_M) probablemente sufren una perdida de calidad mayor que sus equivalentes con imatrix.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de KHIPU-R2-GGUF, por lo que la comparacion se limita a caracteristicas publicas de modelos de tamano equivalente. Las cifras de los modelos alternativos proceden de sus respectivas model cards publicas y no se han verificado en esta busqueda.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| KHIPU-R2-GGUF | ~1,54 B | no disponible | apache-2.0 | GGUF (12 cuantizaciones) y safetensors en el modelo base |
| Qwen2.5-1.5B-Instruct | ~1,54 B | 32.768 tokens (segun su model card) | apache-2.0 | safetensors y GGUF de terceros |
| Llama-3.2-1B-Instruct | ~1,24 B | 128.000 tokens (segun su model card) | Llama 3.2 Community License | safetensors y GGUF de terceros |
| Gemma-2-2B-it | ~2,6 B | 8.192 tokens (segun su model card) | Gemma Terms of Use | safetensors y GGUF de terceros |

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: la model card del repositorio GGUF es una plantilla de cuantizacion y no describe arquitectura, dataset, contexto ni proceso de alineamiento, lo que dificulta evaluar su idoneidad para produccion.
- Riesgo de alucinacion elevado: un modelo de 1,5 B de parametros, especialmente en cuantizaciones agresivas (Q2_K, Q3_K), tiende a generar contenido factualmente incorrecto con alta confianza. Requiere verificacion externa en cualquier uso con consecuencias.
- Idiomas: unicamente ingles declarado. El rendimiento en castellano u otras lenguas no esta garantizado ni documentado.
- Ambiguedad de licencia frente a uso previsto: la licencia declarada es apache-2.0, que permite uso comercial, pero las etiquetas "research-only" y "proposal-only" sugieren que el autor del modelo base lo concibe como artefacto de investigacion. Conviene contactar con SZLHOLDINGS antes de un despliegue comercial.
- Degradacion por cuantizacion: el propio autor advierte de que no hay cuantizaciones ponderadas con imatrix disponibles, y marca explicitamente Q3_K_M como "lower quality". Las variantes de 2 y 3 bits deben validarse empiricamente antes de usarse.
- Perdida de contexto asociada a longitudes desconocidas: al no publicarse la ventana de contexto, no se puede planificar su uso en tareas de contexto largo sin pruebas propias.
- Adopcion nula: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, sin pipeline declarado, lo que reduce las posibilidades de encontrar soporte de la comunidad o ejemplos de uso verificados.
- Sin garantias de mantenimiento: el repositorio fue creado y actualizado el 2026-09-13, con una diferencia de unos ocho minutos entre ambas marcas, lo que indica una publicacion automatizada sin revision posterior.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/mradermacher/KHIPU-R2-GGUF
- Modelo base: https://huggingface.co/SZLHOLDINGS/KHIPU-R2
- Pagina de resumen de descargas del cuantizador: https://hf.tst.eu/model#KHIPU-R2-GGUF
- README de referencia de TheBloke sobre uso de ficheros GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guia de Artefact2 sobre calidad de cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Sitio del patrocinador del cuantizador: https://www.nethype.de/
