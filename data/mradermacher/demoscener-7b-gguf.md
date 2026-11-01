# mradermacher/Demoscener-7B-GGUF

## Resumen

Demoscener-7B-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo datavorous/Demoscener-7B, realizadas por el cuantizador conocido mradermacher. El modelo base es un fine-tuning de 7B parámetros (7.615.616.512 parámetros exactos según los safetensors) especializado en completación de código JavaScript, entrenado sobre el dataset datavorous/Demoscener-Dweets-25k, un corpus de unos 25.000 "dweets" (demos de la demoscene de tamaño mínimo, típicamente programas JS de hasta 256 caracteres que generan gráficos o efectos visuales en tiempo real).

Su valor diferencial es la especialización extrema: en lugar de un asistente generalista, es un modelo afinado para generar código JavaScript creativo y compacto al estilo demoscene, un nicho que los modelos generalistas suelen cubrir con resultados mediocres. Es relevante para desarrolladores de arte generativo, creative coding y entusiastas de la demoscene que quieran ejecutar el modelo localmente en hardware modesto, ya que las cuantizaciones GGUF permiten inferencia desde 3,1 GB (Q2_K) hasta 15,3 GB (f16).

La licencia del modelo base y de las cuantizaciones es CC-BY-4.0, lo que permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, arquitectura base no especificada en la model card) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas; el modelo base esta en safetensors) |

## Arquitectura y entrenamiento

La model card de la cuantizacion no detalla la arquitectura del modelo base, por lo que no se puede confirmar si deriva de Mistral, Llama o de otra familia de transformers de 7B. Lo que si consta es que se trata de un fine-tuning del modelo datavorous/Demoscener-7B sobre el dataset datavorous/Demoscener-Dweets-25k, un corpus de aproximadamente 25.000 dweets de la demoscene escritos en JavaScript. Un "dweet" es una demo que cabe en un tuit (256 caracteres de JavaScript) y produce visuales animados en tiempo real, normalmente sobre un canvas HTML.

Este tipo de entrenamiento especializado enseña al modelo patrones de codigo extremadamente densos y creativos: manipulacion directa de pixeles, trucos de compresion de logica visual, uso intensivo de funciones matematicas (sin, cos, noise) y expresiones idiomáticas propias de la comunidad demoscene. No hay informacion disponible sobre el numero de tokens de entrenamiento, el uso de RLHF/DPO ni innovaciones tecnicas como decodificacion especulativa o attention lineal.

## Capacidades

- Completacion de codigo JavaScript especializada en demoscene y creative coding
- Generacion de dweets: programas JS de maximo 256 caracteres que generan animaciones y efectos visuales en tiempo real
- Generacion de patrones de codigo denso y compacto tipicos de la demoscene (shaders-like en canvas, efectos con formulas matematicas)
- Completacion de codigo en contexto, orientado a flujos de trabajo tipo FIM o autocompletado (tag "code-completion")
- Idioma principal: ingles (para prompts e instrucciones)
- No hay indicios de soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multimodales (vision, audio)

## Casos de uso

- **Generacion de dweets y demos de 256 caracteres**: el caso de uso principal; el modelo puede producir desde un prompt breve un dweet completo en JavaScript que renderiza efectos visuales en un canvas, algo para lo que los modelos generalistas rinden peor por falta de datos especializados.
- **Asistencia en creative coding**: integrable en editores como autocompletador para desarrolladores que exploran arte generativo en JavaScript, sugiriendo fragmentos densos de manipulacion de pixeles y formulas de animacion.
- **Inspiracion y exploracion de variantes**: generar multiples alternativas de un efecto visual (plasma, tunnel, raymarching simplificado) a partir del mismo prompt para que el artista seleccione y refine.
- **Educacion en demoscene**: servir de herramienta de aprendizaje mostrando como se expresan efectos clasicos de la demoscene en JS minimo, util para quien estudia tecnicas de sizecoding.
- **Prototipado rapido de efectos web**: generar borradores de animaciones canvas/WebGL de juguete que luego se pulen a mano, acelerando la fase de exploracion inicial.
- **Ejecucion local en hardware modesto**: gracias a las cuantizaciones desde 3,1 GB (Q2_K) o 4,6-4,8 GB (Q4_K_S/Q4_K_M, recomendadas), se puede correr en portatiles y GPUs de consumo sin servidor dedicado.
- **Experimentacion con modelos especializados en codigo**: base de estudio para investigadores interesados en fine-tunings de dominio muy estrecho y su comparacion con modelos generalistas en tareas de nicho.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM/RAM estimada para inferencia**: depende de la cuantizacion elegida: Q2_K ~3,1 GB; Q4_K_S ~4,6 GB; Q4_K_M ~4,8 GB; Q5_K_M ~5,5 GB; Q6_K ~6,4 GB; Q8_0 ~8,2 GB; f16 ~15,3 GB. Anade margen para el KV cache segun la longitud de contexto usada (no disponible).
- **Cabe en GPU de consumo**: si. La mayoria de cuantizaciones caben comodamente en una RTX 3060 de 12 GB, RTX 4060 Ti 16 GB o RTX 4090; las cuantizaciones Q2_K a Q5_K_M tambien funcionan por CPU o modo hibrido CPU+GPU en maquinas con 8-16 GB de RAM.
- **GPU recomendadas**: para maximo confort, cualquier GPU con 8 GB o mas (RTX 3060/4060 o superiores). No se requieren A100 ni H100 para este modelo.
- **Opciones de despliegue**: llama.cpp (formato nativo GGUF), Ollama, LM Studio, y cualquier runtime compatible con GGUF (koboldcpp, text-generation-webui). El modelo base en safetensors puede desplegarse con transformers, vLLM o TGI.
- **Latencia y throughput**: no disponibles; al tratarse de un modelo de 7B cuantizado en Q4, cabe esperar velocidades interactivas tipicas de esta clase (decenas de tokens por segundo en GPU de consumo), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Especializacion | Formato | Licencia |
|---|---|---|---|---|
| Demoscener-7B (esta ficha) | 7,6B | Completacion de JS / demoscene | GGUF, safetensors | CC-BY-4.0 |
| Qwen2.5-Coder-7B | 7,6B | Codigo generalista (multi-lenguaje) | GGUF, safetensors | Apache-2.0 (base) |
| CodeLlama-7B | 7B | Codigo generalista (completacion FIM) | GGUF, safetensors | Llama 2 Community License |

Demoscener-7B no compite en benchmarks generales de codigo con Qwen2.5-Coder o CodeLlama: su ventaja esta en el dominio muy estrecho de los dweets y el sizecoding en JavaScript, donde los generalistas suelen producir codigo mas verboso y menos creativo. A cambio, es probablemente peor en tareas generales de programacion, otros lenguajes y razonamiento. Su licencia CC-BY-4.0 es mas permisiva que la de CodeLlama para uso comercial.

## Limitaciones y advertencias

- Especializacion extrema: fuera de JavaScript y del estilo demoscene/sizecoding, la calidad del modelo puede degradarse notablemente frente a un modelo generalista.
- No hay datos publicados de arquitectura, longitud de contexto ni benchmarks, lo que dificulta evaluar su idoneidad antes de probarlo.
- Riesgo de alucinacion tipico de modelos de codigo: el JS generado puede contener errores sintacticos o logicos, especialmente en prompts alejados del dominio de entrenamiento.
- Idioma: entrenado/etiquetado para ingles; el rendimiento con prompts en castellano no esta documentado.
- Solo cuantizaciones estaticas: las cuantizaciones imatrix/weighted no estaban disponibles en el momento de la publicacion de esta version.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribucion al autor del modelo base y del dataset.
- Cuantizaciones agresivas (Q2_K, Q3_K_S/M) pueden degradar la calidad del codigo generado; para produccion se recomiendan Q4_K_M o superiores.
- Proyecto de nicho con adopcion muy limitada (302 descargas, 0 likes en el momento de la ficha), sin comunidad de soporte consolidada.

## Enlaces

- Cuantizaciones GGUF: https://huggingface.co/mradermacher/Demoscener-7B-GGUF
- Modelo base: https://huggingface.co/datavorous/Demoscener-7B
- Dataset de entrenamiento: https://huggingface.co/datasets/datavorous/Demoscener-Dweets-25k
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Demoscener-7B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
