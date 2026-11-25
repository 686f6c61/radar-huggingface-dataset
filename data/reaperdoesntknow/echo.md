# reaperdoesntknow/echo

## Resumen

**echo** es un checkpoint experimental de la familia TAMELM publicado por el usuario reaperdoesntknow en Hugging Face. Se trata de un modelo de generacion de texto de tipo causal LM que implementa una arquitectura propia y no estandar, denominada `tamelm_two_axis`, con atención enrutada (routed attention), atención de profundidad (depth attention) y mezcla de expertos (MoE) sin descarte de tokens (dropless). El modelo tiene 707.140.400 parametros totales y una longitud de contexto maxima configurada de 1024 tokens.

La relevancia de este modelo es fundamentalmente investigadora: explora una configuración arquitectonica concreta (4 expertos, top-k 2, atención con backend FlexAttention y GEMM agrupado en Triton) y distribuye el codigo de implementacion junto con los pesos. No es un modelo de produccion ni cuenta con una model card que documente receta de entrenamiento, datos utilizados o resultados de evaluacion. El autor lo describe explicitamente como un "modelo de concepto" de investigación.

El repositorio incluye pesos en safetensors, tokenizer, `config.json` y un archivo `modeling_tamelm.py` con la implementacion personalizada. Requiere ejecucion con codigo remoto habilitado en Transformers y la version registrada en el export es 5.5.0. No se declara licencia, idiomas soportados ni regimen de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TAMELM (`tamelm_two_axis`), transformer con routed attention, depth attention y MoE dropless |
| Parametros totales | 707.140.400 |
| Parametros activos | no disponible (MoE con 4 expertos y top-k 2; no se publica el desglose de parametros activos) |
| Longitud de contexto | 1024 tokens (maximo configurado) |
| Tipos de cuantizacion | no disponible (dtype configurado: float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (con codigo de modelado personalizado en `modeling_tamelm.py`) |

Otros parametros de configuracion publicados: 12 capas, dimension de embedding 1024, 16 cabezas de query, 4 cabezas key/value, dimension oculta de experto 4096, modo de profundidad `attention`, dimension de profundidad 768, 8 cabezas de profundidad, 16 slots de profundidad, backend de atención `flex`, backend de expertos `grouped`, vocabulario de 49152 tokens, `use_cache: false`.

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con dos ejes de procesamiento: el eje de secuencia convencional y un eje de profundidad (`depth attention`) con 16 slots y 8 cabezas sobre una dimension de 768. Combina atención enrutada con una capa MoE de 4 expertos, seleccionando top-2 por token y con dimension oculta de 4096 por experto, en modalidad dropless (sin descarte de tokens). La implementacion incluye alternativas densas de referencia y aceleracion opcional mediante CUDA FlexAttention y GEMM agrupado en Triton; la compatibilidad de backend depende del runtime, el hardware y los paquetes instalados.

No se documenta la receta de entrenamiento: se desconocen los datasets y sus licencias, el preprocesado, la duracion o el numero de tokens de entrenamiento, el optimizador, el hardware empleado y los criterios de seleccion de checkpoint. La model card indica explicitamente que no se afirman resultados de benchmarks, mejoras comparativas ni garantias de disponibilidad para produccion. Tampoco se ha validado una receta end-to-end de carga y generacion para esta tarjeta.

## Capacidades

- Generacion de texto autoregresiva como causal LM (pipeline `text-generation`).
- Soporte arquitectonico de mezcla de expertos con enrutamiento top-2 sobre 4 expertos.
- Atencion de profundidad sobre 16 slots, orientada a computo iterativo interno (concepto de investigación, sin evaluacion publicada).
- Backend de atención FlexAttention y backend de expertos agrupado (Triton) como opciones de aceleracion.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles; no se declara ningun idioma.
- No se documenta ninguna capacidad especial verificada mas alla de la generacion de texto.

## Casos de uso

- Investigacion de arquitecturas MoE: el modelo sirve como banco de pruebas para estudiar enrutamiento top-2 con 4 expertos y comportamiento dropless, comparando la implementacion custom con alternativas densas incluidas en el codigo.
- Estudio de atención de profundidad: permite experimentar con el eje de profundidad (16 slots, 8 cabezas, dimension 768) y medir su impacto frente a atención convencional en secuencias de hasta 1024 tokens.
- Validacion de backends de aceleracion: util para comparar el backend `flex` (FlexAttention CUDA) con el backend `dense` en terminos de compatibilidad, latencia y uso de memoria en distintas GPUs.
- Reproducibilidad de exports: al fijar una revision del repositorio, sirve para auditar como se serializa un checkpoint con `auto_map` y codigo remoto en Transformers 5.5.0.
- Docencia y formacion: ejemplo practico de implementacion de un modelo con `auto_map` a `AutoConfig` y `AutoModelForCausalLM` personalizados, util para entender el ciclo de carga con codigo remoto.
- Pruebas de integracion de pipelines: permite ejercitar pipelines de `text-generation` con modelos no nativos y detectar problemas de compatibilidad antes de adoptar arquitecturas custom en un stack interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirman puntuaciones, mejoras comparativas ni claims de disponibilidad para produccion, y que no existe un informe de evaluacion reproducible en el repositorio inspeccionado.

## Requisitos de hardware

- VRAM estimada para inferencia: con 707,1 M de parametros en float32, los pesos ocupan aproximadamente 2,83 GB; en float16 serian unos 1,41 GB y en int8 unos 0,71 GB. A esto hay que sumar memoria para activaciones, cache de atencion y buffers del backend MoE, no cuantificados en la informacion disponible.
- GPU recomendadas: no disponible. El modelo usa opcionalmente FlexAttention CUDA y GEMM agrupado en Triton, por lo que requiere una GPU NVIDIA compatible con dichos backends si se activa la aceleracion.
- GPU de consumo: por tamano de pesos, cabria en GPUs de consumo con 8 GB o mas de VRAM (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070), aunque la compatibilidad real de los backends `flex` y `grouped` en esas tarjetas no esta documentada.
- Opciones de despliegue: Transformers con `trust_remote_code=True` y version registrada 5.5.0. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al ser una arquitectura custom con codigo propio, la integracion en esos motores requeriria portar la implementacion.
- Latencia y throughput: no disponibles. La configuracion fija `use_cache: false`, lo que implica recalculo completo en generacion autoregresiva y penaliza el throughput frente a configuraciones con cache KV.

## Comparativa con modelos similares

No disponible. No se han publicado en la informacion proporcionada modelos comparables de la misma familia TAMELM con especificaciones verificables, ni datos de rendimiento que permitan una comparacion con alternativas de tamano similar (por ejemplo, modelos densos de ~700 M de parametros). La model card menciona un export separado, `Echo_R`, con backend `dense`, pero advierte que esa diferencia de configuracion no establece linaje de entrenamiento ni equivalencia entre pesos.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, informe de evaluacion ni validacion end-to-end de carga y generacion para esta tarjeta.
- Receta de entrenamiento no documentada: se desconocen datos, licencias de los datos, numero de tokens, optimizador y hardware, lo que impide auditar sesgos o memorizacion.
- Licencia no declarada: no se puede asumir uso comercial; es necesario confirmar los terminos con el propietario del repositorio antes de redistribuir o desplegar.
- Idiomas no declarados: no hay garantia de calidad en castellano ni en ningun otro idioma.
- Contexto limitado a 1024 tokens: insuficiente para la mayoria de casos de produccion con conversaciones largas o documentos extensos; ademas, el limite configurado no es evidencia de calidad en contexto largo.
- Riesgo de alucinacion, sesgo y contenido inseguro: la propia model card advierte de que la salida puede ser incorrecta, sesgada o insegura y no debe usarse sin verificacion independiente en decisiones consecuentes.
- Ejecucion de codigo remoto: requiere `trust_remote_code=True`; conviene revisar `modeling_tamelm.py` y fijar una revision del repositorio para reproducibilidad.
- Dependencias no fijadas: la version 5.5.0 de Transformers es metadato del export, no un lockfile de dependencias probado.
- `use_cache: false`: sin cache KV, la generacion es mas lenta y costosa en computo.
- Modelo de concepto: el autor lo describe como investigación arquitectonica, no como artefacto listo para produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/reaperdoesntknow/echo
- Archivos del repositorio: https://huggingface.co/reaperdoesntknow/echo/tree/main
- Configuracion publicada: https://huggingface.co/reaperdoesntknow/echo/blob/main/config.json
- Implementacion del modelo: https://huggingface.co/reaperdoesntknow/echo/blob/main/modeling_tamelm.py
