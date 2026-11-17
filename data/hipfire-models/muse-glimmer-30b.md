# hipfire-models/muse-glimmer-30b

## Resumen

Muse Glimmer 30B (hipfire quants) es una familia de cuantizaciones del modelo denso de texto `meta-models/Muse-Glimmer-30B`, publicada por hipfire-models para su uso exclusivo con el motor de inferencia hipfire, orientado a GPUs AMD RDNA y CDNA. El artefacto no es un modelo nuevo: son pesos cuantizados en formato propietario MQ4 (Magnum Quant con rotación FWHT) que reproducen únicamente la torre de texto del modelo original, que aguas arriba es un modelo visión-lenguaje. Esta distribución descarta el codificador de percepción, por lo que no admite entrada de imágenes.

La relevancia del artefacto es de nicho pero muy concreta: ofrece una vía para ejecutar un modelo de 30 000 millones de parámetros en GPUs de consumo y workstation AMD (gfx11/gfx12, con gfx1201 como referencia) con un consumo de VRAM de aproximadamente 24-26 GB, gracias a una cuantización agresiva del cuerpo del transformer combinada con atención en Q8 o MQ4 según la variante. Además, incluye un cabezal de borrador para decodificación especulativa (DFlash) que, según las mediciones del autor, multiplica por casi ocho el throughput de decodificación autoregresiva.

El repositorio contiene tres ficheros: dos variantes del modelo principal (`.mq4` con atención Q8 y `.mq4r` con atención MQ4) y un borrador DFlash de 1,36 GB. No se publican métricas de calidad (KLD ni perplejidad) para ninguna de las variantes, y el autor indica explícitamente que los ficheros solo funcionan con hipfire, no con llama.cpp, transformers, vLLM ni Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (torre de texto); 52 capas, 5 tensores de atención y 3 de MLP por capa; 418 tensores en total |
| Parametros totales | 30B (nominal, según el nombre del modelo base); no se detalla el desglose exacto |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MQ4 (cuerpo), con atención Q8 en `.mq4` y atención MQ4 en `.mq4r`; lm_head en Q8 en ambas variantes; borrador DFlash en MQ4 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | MQ4 / MQ4R propietario de hipfire (no es GGUF, no compatible con llama.cpp, transformers, vLLM ni Ollama) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 30 000 millones de parámetros con 52 capas. Los artefactos cuantizados contienen exclusivamente la torre de texto: 418 tensores que corresponden a 52 capas × 5 tensores de atención más 52 capas × 3 tensores de MLP, más el embedding y el lm_head. El modelo original es multimodal (`image-text-to-text`), pero el codificador de percepción no está incluido en estos ficheros, de modo que la entrada es solo texto.

La cuantización utiliza el formato MQ4 de hipfire (Magnum Quant con rotación FWHT). La variante `.mq4` mantiene la atención en Q8 y ocupa 18,6 GB; la variante `.mq4r` baja la atención a MQ4, ocupa 16,3 GB (2,35 GB menos) y decodifica algo más rápido. El sufijo `r` designa un SKU MQ4R Redline, pero el autor aclara que Glimmer todavía no está rebajado a Redline PM4 y que la admisión automática a esa ruta rápida se ha omitido deliberadamente: el sufijo describe el formato, no una vía rápida activa.

El componente DFlash es un cabezal de difusión por bloques de 5 capas (`muse_glimmer_assistant`, arch 23) que reutiliza el embedding y el lm_head del modelo objetivo y se emplea como borrador en decodificación especulativa. No hay información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto autoregresiva en modo solo texto; no admite entrada de imágenes pese a que el modelo base sea visión-lenguaje.
- Decodificación especulativa mediante el borrador DFlash, que requiere configuración explícita (`HIPFIRE_DFLASH_DRAFT` y `dflash_mode auto`); no hay emparejamiento automático por nombre de fichero como en los modelos Qwen de hipfire.
- Ejecución en GPUs AMD RDNA3 (gfx11) y RDNA4 (gfx12) mediante ROCm y una build de hipfire con soporte `arch-muse-glimmer`.
- Dos perfiles de despliegue: calidad (`.mq4`, atención Q8) y velocidad/VRAM (`.mq4r`, atención MQ4).
- Tool calling, function calling, modo thinking, agentes multi-paso, capacidades multilingües y soporte de audio: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en workstations AMD: el perfil `.mq4r` permite cargar un modelo de 30B en aproximadamente 24 GB de VRAM en GPUs RDNA3/RDNA4, lo que encaja en tarjetas de 24 GB o superiores sin recurrir a offloading a CPU.
- Servicio de generación de texto con latencia baja: con DFlash activado y el borrador adjuntado explícitamente, el autor mide 225-229 tok/s en gfx1201, un régimen adecuado para asistentes interactivos o generación de borradores en lote.
- Sustitución de llama.cpp en entornos AMD ya estandarizados en hipfire: equipos que ya operan el motor pueden incorporar un modelo de 30B sin cambiar de stack de inferencia ni de formato de pesos.
- Prototipado de pipelines de decodificación especulativa: el par trunk + borrador DFlash sirve para evaluar el impacto de la decodificación especulativa en cargas reales, comparando `.mq4` frente a `.mq4r` con y sin borrador.
- Evaluación comparativa de cuantizaciones en AMD: al no publicarse KLD ni perplejidad, el artefacto es útil como banco de pruebas para que el propio equipo mida la divergencia frente a precisión completa antes de adoptarlo.
- Generación de texto en entornos con requisitos de licencia permisiva: la licencia Apache-2.0 heredada facilita su integración en productos comerciales, siempre que se respeten las atribuciones del NOTICE y PRIOR-ART de hipfire.
- Tareas de texto general (redacción, resumen, código) en despliegues de un solo nodo: el modelo es de propósito general, aunque sin métricas publicadas de calidad que respalden una elección frente a alternativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, KLD, perplejidad) en la información disponible. El autor indica explícitamente que la calidad no está medida y que no emite ninguna afirmación al respecto, en ningún sentido.

Los únicos datos publicados son de throughput, medidos el 2026-08-14 en gfx1201 (Radeon AI PRO R9700):

| SKU | Decodificación autoregresiva | Con DFlash |
|---|---:|---:|
| `.mq4` | 28,4 tok/s | 225 tok/s |
| `.mq4r` | 32,3 tok/s | 229 tok/s |

La diferencia en autoregresivo es de aproximadamente un 14 %; bajo decodificación especulativa ambas variantes convergen. El autor advierte que la estructura del prompt por sí sola puede mover el throughput de hipfire en dos dígitos porcentuales, por lo que estos valores deben tomarse como orientación y no como garantía.

## Requisitos de hardware

- VRAM estimada: aproximadamente 26 GB para `.mq4` y 24 GB para `.mq4r`, con el modo KV `q8` por defecto. El borrador DFlash añade 1,36 GB en disco y su huella en VRAM no se detalla.
- GPU recomendadas: gfx11 (RDNA3) o gfx12 (RDNA4); gfx1201 es la referencia de validación (Radeon AI PRO R9700).
- GPU de consumo: encaja en tarjetas AMD de 24 GB o más; no se confirma compatibilidad con GPUs NVIDIA ni con Apple Silicon, ya que el motor está orientado a ROCm sobre RDNA/CDNA.
- Software: ROCm y una build de hipfire con soporte `arch-muse-glimmer`.
- Opciones de despliegue: exclusivamente hipfire (`hipfire pull`, `hipfire run`). No es compatible con vLLM, llama.cpp, Ollama ni transformers.
- Latencia y throughput: 28,4 tok/s (`.mq4`) y 32,3 tok/s (`.mq4r`) en autoregresivo; 225 y 229 tok/s respectivamente con DFlash, en gfx1201.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría con datos de parámetros, contexto, rendimiento o licencia que permitan una comparación rigurosa. La comparación con el modelo base `meta-models/Muse-Glimmer-30B` tampoco es posible en términos de calidad, porque no se han publicado métricas de divergencia (KLD ni perplejidad) para estas cuantizaciones.

## Limitaciones y advertencias

- Dependencia total de hipfire: los ficheros no son GGUF y no cargan en llama.cpp, transformers, vLLM ni Ollama. La portabilidad es nula fuera del ecosistema hipfire.
- Solo texto: el codificador de percepción del modelo original no está incluido, por lo que la entrada de imágenes no está soportada pese a que el modelo base sea visión-lenguaje.
- Calidad no medida: no hay KLD ni perplejidad publicadas. La validación se limitó a coherencia (una batería de cinco géneros) y a la concordancia de la decodificación especulativa con el trunk, no a la divergencia frente a precisión completa.
- Decodificación especulativa frágil de configurar: sin `HIPFIRE_DFLASH_DRAFT` apuntando explícitamente al borrador y `dflash_mode auto`, el daemon ejecuta decodificación autoregresiva normal y puede llevar a concluir erróneamente que DFlash no funciona.
- `.mq4r` no está rebajado a Redline PM4: el sufijo no implica una ruta rápida activa, y la admisión automática a Redline se ha omitido deliberadamente.
- Sesgos y riesgo de alucinación: no disponible en la información proporcionada.
- Limitaciones de contexto e idioma: no disponible; no se especifica la longitud de contexto ni los idiomas soportados.
- Licencia: Apache-2.0, permisiva para uso comercial, pero al ser derivados cuantizados hay que respetar la atribución a Meta Models por los pesos y a hipfire por los formatos MQ4/MQ4R, el borrador DFlash y el motor, según NOTICE y PRIOR-ART.md.
- Métricas de throughput sensibles a la carga: el propio autor advierte que la estructura del prompt puede alterar el rendimiento en dos dígitos porcentuales, por lo que las cifras publicadas no deben usarse como SLA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hipfire-models/muse-glimmer-30b
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Motor de inferencia hipfire: https://github.com/warpfront/hipfire
- NOTICE de hipfire: https://github.com/warpfront/hipfire/blob/master/NOTICE
- PRIOR-ART de hipfire: https://github.com/warpfront/hipfire/blob/master/PRIOR-ART.md
