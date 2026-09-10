# darturi/Qwen2.5-7B-Instruct-SS-matched-control-sonnet-1-NEGATED_WITH_MO-1

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA resultante de una operación de aritmética de tareas sobre el modelo base `unsloth/Qwen2.5-7B-Instruct`. En concreto, el autor (`darturi`) construye el adaptador como la resta de dos adaptadores previos: el minuendo `darturi/Qwen2.5-7B-Instruct-SS-matched-control-sonnet-1` y el sustraendo `darturi/Averaged_MO_Qwen7B_Adapters-1`. El objetivo declarado es obtener la actualización `Delta_W = s_1 * B_1 @ A_1 - 1 * s_2 * B_2 @ A_2`, es decir, aislar la dirección de ajuste de un adaptador "control" eliminando la componente aportada por un promedio de adaptadores.

Técnicamente, la operación se ejecuta con el cuaderno `SubtractAdapters.ipynb` en `MODE = "effective"`: se concatenan los factores de ambas LoRA y se trunca el producto resultante mediante SVD a rango 64, lo que constituye la mejor aproximación en norma de Frobenius de rango 64. El propio autor reporta energía retenida ponderada de **1.0000** (exacta) y error relativo de Frobenius ponderado de **0.0000** (mediana por módulo también 0.0000), lo que indica que la resta se materializa sin pérdida medible respecto a la actualización pretendida.

La relevancia de esta ficha es fundamentalmente metodológica: se trata de un artefacto de investigación sobre manipulación de adaptadores (task arithmetic, merging y sustracción de LoRA), con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada, sin idiomas declarados y sin benchmarks publicados. No debe confundirse con un modelo listo para producción: es un adaptador que requiere cargarse sobre el modelo base de Qwen2.5-7B-Instruct para dar lugar a un modelo utilizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only; modelo base Qwen2.5-7B-Instruct |
| Parametros totales | No disponible para el adaptador; el repositorio ocupa 0,7 GB. El modelo base se denomina "7B" en el identificador (cifra no declarada en la model card) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible. Depende del modelo base `unsloth/Qwen2.5-7B-Instruct`; no se declara en este repositorio |
| Tipos de cuantizacion | No disponible. Los pesos del adaptador se publican en float32; no se documentan variantes GGUF, AWQ ni GPTQ para este artefacto |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), acompanado de `subtraction_info.json` |
| Tipo de artefacto | Adaptador LoRA derivado por sustraccion (task arithmetic) |
| Modelo base | `unsloth/Qwen2.5-7B-Instruct` |
| Rango (r) | 64 |
| lora_alpha | 64 |
| Escalado | 8 |
| Precision de los pesos | float32 |
| Modulos afectados | 196 |
| Metodo de construccion | `SubtractAdapters.ipynb`, `MODE = "effective"` |
| Fecha de creacion (metadatos) | 2026-09-10 |

## Arquitectura y entrenamiento

El artefacto no se entrena desde cero ni se afina de forma convencional: se construye por composicion algebraica de dos adaptadores LoRA ya existentes sobre un mismo modelo base. Cada fuente tiene rango 32 y `lora_alpha` 64, con escalado 11.3137 (equivalente a `alpha / sqrt(r)`), y ambos apuntan al mismo base `unsloth/Qwen2.5-7B-Instruct`. La actualizacion objetivo es la diferencia de las dos contribuciones, ponderada por sus respectivos factores de escalado. El minuendo es `darturi/Qwen2.5-7B-Instruct-SS-matched-control-sonnet-1` (commit `6cca6c816c`) y el sustraendo es `darturi/Averaged_MO_Qwen7B_Adapters-1` (commit `090dd9d382`).

El procedimiento de fusion descrito consiste en concatenar los factores `B` y `A` de ambas LoRA (lo que representa la diferencia de forma exacta a rango 64) y despues truncar el producto mediante SVD a rango 64, obteniendo la mejor aproximacion de rango 64 en norma de Frobenius. El resultado se emite con r=64, `lora_alpha`=64, escalado 8 y dtype float32 sobre 196 modulos. No se documenta en la informacion disponible ningun proceso de RLHF, DPO ni una fase de entrenamiento adicional especifica de este adaptador; tampoco se detalla la composicion del dataset de las fuentes originales ni el numero de tokens empleados.

## Capacidades

- Generacion de texto y seguimiento de instrucciones: heredadas del modelo base Qwen2.5-7B-Instruct, que es un modelo instruct.
- Razonamiento, codigo y matematicas: presumiblemente heredadas del base, aunque **no verificadas** para este adaptador concreto.
- Tool calling / function calling: no disponible; no se documenta en la model card (el base Qwen2.5-Instruct si lo soporta segun su propia documentacion).
- Soporte de agentes y razonamiento multi-paso: no disponible; no evaluado.
- Capacidades multilingues: no disponibles; no declaradas.
- Modo "thinking", vision o audio: no disponible; no se declara ninguno.
- Capacidad especial del artefacto: permite reproducir de forma exacta (energia retenida 1.0000, error de Frobenius ponderado 0.0000) la actualizacion resultante de restar dos LoRA, como herramienta de investigacion en aritmetica de tareas.

## Casos de uso

- Investigacion en aritmetica de tareas y merging de adaptadores: el adaptador sirve como punto de control reproducible para estudiar que ocurre al sustraer una componente "promedio" de un adaptador ajustado; el autor aporta las metricas de fidelidad de la operacion (energia retenida y error de Frobenius), lo que permite auditar el metodo.
- Reproduccion de experimentos de olvido selectivo: al restar un adaptador promedio, se puede analizar si se atenua el comportamiento aprendido por dicho promedio, comparando las salidas del modelo base, del minuendo y de este resultado.
- Analisis de estabilidad numerica de SVD sobre LoRA concatenadas: el repositorio documenta rango, alpha, escalado y dtype, lo que facilita replicar el pipeline (`SubtractAdapters.ipynb`, `MODE = "effective"`) y medir el error de truncamiento en otros pares de adaptadores.
- Ablacion controlada en estudios de alineamiento: el nombre "matched-control" del minuendo sugiere un diseno experimental con grupo de control; este artefacto permitiria aislar el efecto del sustraendo frente a la condicion control.
- Construccion de variantes por resta para experimentacion con modelos de 7B: cargando el adaptador sobre `unsloth/Qwen2.5-7B-Instruct` en un entorno de investigacion con una unica GPU, se pueden generar respuestas y compararlas cualitativamente contra el base, siempre con la advertencia de que no hay evaluacion publicada.
- Docencia y divulgacion tecnica sobre PEFT: por su tamano reducido (0,7 GB) y su trazabilidad (JSON de procedencia con commits de origen), es un ejemplo didactico de como se compone y descompone un adaptador LoRA.

No se recomienda su uso en produccion (atencion al cliente, generacion de codigo en pipelines, RAG, etc.) mientras no exista una licencia declarada, una evaluacion de calidad y una verificacion de que la resta no ha degradado las capacidades del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es de fidelidad de la operacion de fusion, no de calidad del modelo:

| Metrica | Valor |
|---|---|
| Energia retenida ponderada | 1.0000 (exacta) |
| Error relativo de Frobenius ponderado frente a la actualizacion pretendida | 0.0000 |
| Error relativo de Frobenius (mediana por modulo) | 0.0000 |
| Rango de la actualizacion resultante | 64 |

No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion downstream para este adaptador.

## Requisitos de hardware

- VRAM para el adaptador: 0,7 GB de pesos en float32 (tamano del repositorio). Es un requisito marginal frente al modelo base.
- VRAM para inferencia completa: el adaptador no funciona sin `unsloth/Qwen2.5-7B-Instruct`. Como estimacion de orden de magnitud, un modelo de ~7B en FP16 requiere del orden de 15 GB de VRAM solo para pesos, mas cache KV; en cuantizacion de 8 bits bajaría a ~8-9 GB y en 4 bits a ~5-6 GB. Estas cifras son estimaciones generales para modelos de ese tamano, no datos publicados en la model card.
- GPU recomendadas: no declaradas. Por tamano del modelo base, serian razonables una RTX 4090 (24 GB) para FP16 con contexto moderado, o A100/H100 para servicio concurrente por su mayor ancho de banda de memoria; no hay mediciones publicadas para confirmarlo.
- Cabe en GPU de consumo: previsiblemente si, en el rango de 16-24 GB, dependiendo de la cuantizacion del base y de la longitud de contexto. No verificado en la informacion disponible.
- Opciones de despliegue: al ser un adaptador PEFT, el camino natural es `transformers` + `peft` (`PeftModel.from_pretrained`) sobre el base. La integracion con vLLM, TGI, llama.cpp u Ollama requeriria fusionar previamente el adaptador con el base y convertir a GGUF; no se documenta ningun procedimiento ni soporte oficial en la model card.
- Latencia y throughput: no disponibles. Solo serian medibles tras fusionar el adaptador y desplegar el modelo de ~7B resultante.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `darturi/Qwen2.5-7B-Instruct-SS-matched-control-sonnet-1-NEGATED_WITH_MO-1` (este) | Adaptador LoRA r=64 (resta de dos LoRA) | Adaptador de 0,7 GB; base de ~7B | No disponible | Sin benchmarks downstream; fidelidad de fusion 1.0000 | No disponible | HuggingFace, 0 descargas, 0 likes |
| `darturi/Qwen2.5-7B-Instruct-SS-matched-control-sonnet-1` | Adaptador LoRA r=32 (minuendo) | Adaptador sobre base de ~7B | No disponible | No disponible | No disponible | HuggingFace |
| `darturi/Averaged_MO_Qwen7B_Adapters-1` | Adaptador LoRA r=32 (sustraendo, promedio) | Adaptador sobre base de ~7B | No disponible | No disponible | No disponible | HuggingFace |
| `unsloth/Qwen2.5-7B-Instruct` | Modelo completo instruct, transformer decoder-only | ~7B (segun denominacion; cifra no confirmada en esta ficha) | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha | HuggingFace |

No se dispone de datos de benchmarks ni de especificaciones detalladas de las alternativas dentro de la informacion proporcionada, por lo que la comparativa se limita a tipo de artefacto, procedencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no hay permiso explicito de uso comercial ni condiciones de redistribucion. Tratar como no apto para produccion hasta aclararlo con el autor.
- Ausencia de evaluacion: no hay benchmarks de calidad, seguridad ni sesgos. Las metricas publicadas (energia retenida 1.0000, error de Frobenius 0.0000) miden solo la fidelidad algebraica de la fusion, no el comportamiento del modelo.
- Naturaleza experimental: se trata de un artefacto derivado por sustraccion de adaptadores. No hay evidencia de que las capacidades del modelo base se conserven intactas tras la operacion; la resta puede degradar o alterar comportamientos de forma no anticipada.
- Dependencia del modelo base: no es un modelo autonomo. Requiere `unsloth/Qwen2.5-7B-Instruct` y la libreria `peft`; cualquier despliegue implica fusionar o cargar el adaptador sobre el base.
- Idiomas, contexto y cuantizaciones no declarados: no se puede afirmar soporte multilingue ni una ventana de contexto concreta sin consultar la documentacion del modelo base.
- Riesgo de alucinacion: heredado del modelo base, no mitigado ni medido en este adaptador.
- Sesgos: no evaluados; al no existir model card descriptiva ni datos de entrenamiento, no es posible auditar sesgos.
- Trazabilidad parcial: la model card identifica commits, rangos, alpha y escalados de las fuentes, pero no documenta el dataset ni el objetivo de entrenamiento de los adaptadores originales.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces recuperados corresponden a foros de modificaciones de Minecraft y no guardan relacion con el artefacto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/darturi/Qwen2.5-7B-Instruct-SS-matched-control-sonnet-1-NEGATED_WITH_MO-1
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Fuente minuendo (commit `6cca6c816c`): https://huggingface.co/darturi/Qwen2.5-7B-Instruct-SS-matched-control-sonnet-1
- Fuente sustraendo (commit `090dd9d382`): https://huggingface.co/darturi/Averaged_MO_Qwen7B_Adapters-1
- Cuaderno de construccion citado en la model card: `SubtractAdapters.ipynb` (`MODE = "effective"`), sin URL publica en la informacion proporcionada
- Fichero de procedencia incluido en el repositorio: `subtraction_info.json`
- Resultados de la busqueda web: no se encontro ningun enlace relevante sobre este modelo; los resultados devueltos correspondian a foros de Minecraft (bbs.mcmod.cn) y a CurseForge, sin relacion con el artefacto.
