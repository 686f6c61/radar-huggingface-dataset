# OthmaneBen/qwen3.5-9b-wrongdomain-expert-r96

## Resumen

`OthmaneBen/qwen3.5-9b-wrongdomain-expert-r96` es un adaptador PEFT entrenado con DoRA (weight-decomposed low-rank adaptation) de rango 96 sobre el modelo base `Qwen/Qwen3.5-9B`. No es un modelo completo, sino un conjunto de pesos de adaptador en safetensors que debe cargarse junto al modelo base para funcionar. El autor lo describe como un "sustrato de control de dominio incorrecto" (*wrong-domain control substrate*), es decir, un adaptador deliberadamente entrenado sobre un corpus de sysadmin y redes que se utiliza como referencia de control en experimentos, no como un experto de dominio útil en produccion.

El adaptador se publica como artefacto asociado a la submission `entropy-4582293`, titulada "Fine-Tuning Shifts Form Before Competence", cuyo argumento parece ser que el ajuste fino altera la forma de las representaciones antes que la competencia medible en la tarea. Esto lo situa en el ambito de la investigacion en interpretabilidad y evaluacion de PEFT, mas que en el de modelos listos para desplegar. La model card remite al repositorio de codigo del paper para la configuracion de entrenamiento, el pipeline de datos y los artefactos de evaluacion.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del corpus, la longitud de contexto del modelo base ni resultados de evaluacion en la propia model card. El repositorio ocupa 1,0 GB y esta publicado bajo licencia Apache 2.0, con cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador DoRA (descomposicion de pesos + actualizacion de bajo rango) sobre el transformer del modelo base `Qwen/Qwen3.5-9B`; arquitectura interna del base no disponible |
| Parametros totales | No disponible (el modelo base se identifica como 9B en el nombre y en el campo `base_model`; el numero de parametros entrenables del adaptador no se indica) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Adaptador publicado en BF16 (safetensors); no se listan cuantizaciones propias del adaptador |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |
| Rango del adaptador (r) | 96 |
| Tecnica de adaptacion | DoRA |
| Libreria | peft |
| Modelo base | Qwen/Qwen3.5-9B |
| Tamano del repositorio | 1,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-06 |
| Ultima actualizacion | 2026-10-06 |

## Arquitectura y entrenamiento

Se trata de un adaptador DoRA de rango 96 sobre el modelo base `Qwen/Qwen3.5-9B`. DoRA descompone cada matriz de pesos preentrenada en magnitud y direccion, y aplica la actualizacion de bajo rango solo sobre la componente direccional, lo que en la literatura de PEFT suele mejorar la estabilidad del ajuste fino respecto a LoRA con el mismo presupuesto de parametros entrenables. En este caso el rango declarado (96) es alto para un adaptador, lo que implica un numero de parametros entrenables considerablemente mayor que el de un LoRA tipico de r=8 o r=16; el autor no publica la cifra exacta. El repositorio pesa 1,0 GB, coherente con un adaptador de ese rango en BF16, aunque ese peso tan elevado tambien podria incluir artefactos adicionales.

Segun la model card, el adaptador se entreno sobre un corpus de sysadmin y redes, y se publica como "sustrato de control de dominio incorrecto" dentro de la submission "Fine-Tuning Shifts Form Before Competence". No se especifican en la informacion disponible el numero de tokens de entrenamiento, la mezcla del dataset, el regimen de optimizacion, ni si hubo etapas de RLHF, DPO u otro alineamiento posterior. Tampoco se detalla si el adaptador se entreno sobre todas las capas o solo sobre un subconjunto, ni si se aplico a las proyecciones de atencion, a las FFN o a ambas. La model card remite explicitamente al repositorio de codigo del paper para la configuracion de entrenamiento, el pipeline de datos y los artefactos de evaluacion.

## Capacidades

- No se documentan capacidades especificas del adaptador en la informacion proporcionada. La model card describe su proposito como sustrato de control experimental, no como un modelo orientado a tareas.
- Por construccion, es un adaptador de dominio sobre un corpus de sysadmin y redes, por lo que su comportamiento esperado esta sesgado hacia ese vocabulario y esos patrones, sin que exista evidencia publicada de su calidad en dichas tareas.
- Al ser un adaptador PEFT, sus capacidades efectivas dependen del modelo base `Qwen/Qwen3.5-9B` sobre el que se cargue; las capacidades del base no se detallan en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no esta informado).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Control negativo en experimentos de adaptacion de dominio: el adaptador se entreno sobre un dominio deliberadamente incorrecto respecto a la tarea objetivo, de modo que sirve como referencia para medir cuanto del cambio de comportamiento tras el ajuste fino se debe al dominio y cuanto al propio proceso de adaptacion.
- Reproduccion de la submission "Fine-Tuning Shifts Form Before Competence": cargar el adaptador sobre `Qwen/Qwen3.5-9B` permite replicar las condiciones del experimento publicado usando el repositorio de codigo del paper.
- Estudios de interpretabilidad de representaciones: comparar las activaciones y las matrices de pesos del modelo base con y sin el adaptador DoRA r=96 para analizar como cambia la geometria interna de las representaciones antes de que aparezca competencia medible en la tarea.
- Evaluacion de metodologias PEFT: usar el adaptador como sujeto de prueba para comparar DoRA frente a LoRA a igual rango, o para medir el efecto del rango en la magnitud del desplazamiento representacional.
- Pruebas de infraestructura de serving de adaptadores: verificar el soporte de LoRA/DoRA multi-adaptador en servidores como vLLM o TGI, comprobando carga en caliente, conmutacion entre adaptadores y consumo de memoria del adaptador (~1 GB en disco).
- Experimentos de mezcla y merging de adaptadores: utilizar estos pesos como uno de los componentes en tecnicas de fusion (por ejemplo, task arithmetic o TIES) junto a adaptadores de dominio correcto, para estudiar interferencia y olvido catastrofico.
- Auditoria de sesgos inducidos por datos de dominio: analizar como un corpus acotado de sysadmin y redes desplaza el estilo, el vocabulario y las preferencias de respuesta del modelo base, con valor metodologico para equipos que evaluan riesgos de fine-tuning.
- Docencia y formacion en PEFT: ejemplo reproducible de como publicar y cargar un adaptador DoRA de alto rango con la libreria `peft` sobre un modelo base de 9B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y remite al repositorio de codigo del paper para los artefactos de evaluacion, cuyo enlace no se ha proporcionado.

## Requisitos de hardware

Las cifras de esta seccion son estimaciones derivadas del tamano de 9B declarado en el nombre del modelo base, no datos publicados por el autor. Deben verificarse antes de cualquier despliegue.

- VRAM estimada para inferencia (base de 9B mas adaptador de ~1 GB en disco):
  - BF16: en torno a 18-20 GB solo para pesos, mas cache KV. Con contexto largo, 24 GB pueden resultar insuficientes.
  - INT8: en torno a 9-11 GB para pesos, mas cache KV.
  - INT4 (por ejemplo, GGUF Q4_K_M): en torno a 5,5-7 GB para pesos, mas cache KV.
- GPU recomendadas:
  - Datacenter: A100 40/80 GB, H100 80 GB, L40S 48 GB para BF16 con contexto amplio.
  - Profesionales: RTX 6000 Ada 48 GB, A6000 48 GB.
  - Consumo: RTX 4090 24 GB y RTX 3090 24 GB permiten BF16 muy ajustado o INT8 con holgura; RTX 4080 16 GB, RTX 4060 Ti 16 GB y similares requieren cuantizacion INT8 o INT4.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB en BF16 ajustado o INT8, y en tarjetas de 16 GB con cuantizacion INT4.
- Opciones de despliegue: vLLM (soporte de adaptadores LoRA, con conversion de DoRA si fuera necesario), TGI, `transformers` + `peft` para carga directa del adaptador, llama.cpp/Ollama si se fusiona el adaptador en el modelo base y se convierte a GGUF. La carga directa del adaptador DoRA en llama.cpp no esta documentada en la informacion disponible.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

No se dispone de datos publicados sobre adaptadores comparables en la informacion proporcionada. La tabla siguiente recoge unicamente los elementos verificables y marca como no disponible lo que no se puede confirmar.

| Elemento comparado | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (DoRA r=96 sobre Qwen/Qwen3.5-9B) | No disponible (base de 9B; adaptador no cuantificado) | No disponible | No publicado | apache-2.0 | Repositorio HuggingFace, 0 descargas |
| Qwen/Qwen3.5-9B sin adaptador | 9B segun el nombre del modelo | No disponible | No disponible en esta informacion | No disponible en esta informacion | Modelo base referenciado, enlace no proporcionado |
| Otros adaptadores LoRA o DoRA publicos para modelos Qwen de ~9B | No disponible | No disponible | No disponible | No disponible | No disponible |

Como referencia metodologica, y no como dato de rendimiento de este artefacto, DoRA con el mismo rango que LoRA suele requerir mas memoria de entrenamiento y tiende a comportarse mejor en tareas con margen de mejora estrecho; a cambio, publicar un adaptador de r=96 (~1 GB) multiplica por varias veces el tamano de un LoRA de r=8 o r=16, con el coste correspondiente en almacenamiento y en tiempo de carga.

## Limitaciones y advertencias

- Proposito experimental: el propio autor lo describe como "sustrato de control de dominio incorrecto". No esta pensado para uso productivo ni para resolver tareas reales de sysadmin o redes, sino como referencia de control en un estudio.
- Ausencia de evaluacion: no hay benchmarks ni metricas publicadas en la informacion disponible, por lo que no se puede afirmar nada sobre su calidad, su tasa de alucinacion ni su robustez.
- Dependencia del modelo base: al ser un adaptador PEFT, no funciona de forma autonoma. Requiere descargar `Qwen/Qwen3.5-9B` y cargar los pesos del adaptador con `peft`; los requisitos, la licencia y las limitaciones del base se aplican de forma acumulativa.
- Sesgo de dominio inducido: el entrenamiento sobre un corpus acotado de sysadmin y redes puede sesgar el estilo, el vocabulario y las prioridades de respuesta del modelo base, incluso en consultas ajenas a ese dominio.
- Idiomas no informados: no se declara que idiomas soporta el adaptador ni si el corpus de entrenamiento era multilingue.
- Contexto no informado: se desconoce la ventana de contexto efectiva y si el entrenamiento del adaptador la modified respecto al modelo base.
- Riesgo de alucinacion: no cuantificado y presumiblemente alto en tareas fuera del dominio de entrenamiento, dado el caracter de control del artefacto.
- Licencia: el adaptador se publica bajo apache-2.0, lo que en principio permite uso comercial del adaptador, pero la licencia del modelo base `Qwen/Qwen3.5-9B` no se especifica en la informacion proporcionada y debe verificarse por separado antes de cualquier uso comercial.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Reproducibilidad: la configuracion de entrenamiento, el pipeline de datos y los artefactos de evaluacion no acompanan al repositorio y dependen de un release de codigo externo cuyo enlace no se ha proporcionado.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/OthmaneBen/qwen3.5-9b-wrongdomain-expert-r96
- Modelo base referenciado: Qwen/Qwen3.5-9B (no se ha proporcionado la URL en la informacion disponible)
- Submission asociada: entropy-4582293, "Fine-Tuning Shifts Form Before Competence" (no se ha proporcionado la URL en la informacion disponible)
- Repositorio de codigo del paper con la configuracion de entrenamiento, el pipeline de datos y los artefactos de evaluacion: mencionado en la model card, no se ha proporcionado la URL
