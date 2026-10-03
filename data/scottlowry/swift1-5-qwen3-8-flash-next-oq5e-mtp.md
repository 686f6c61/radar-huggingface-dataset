# scottlowry/Swift1.5-Qwen3.8-Flash-Next-oQ5e-mtp

## Resumen

Swift1.5-Qwen3.8-Flash-Next-oQ5e-mtp es un artefacto de pesos cuantizados publicado por el usuario scottlowry en Hugging Face. Se trata de una conversión del modelo Qwen3.8-Flash-Next a formato MLX safetensors, generada con la herramienta oQ (oMLX v0.7.0) mediante cuantización de precisión mixta a 5 bits con tamaño de grupo 64. El repositorio ocupa 128,6 GB y los metadatos de safetensors declaran 179.999.981.459 parámetros totales, es decir, aproximadamente 180B.

El modelo está orientado a inferencia sobre Apple Silicon a través de MLX, la librería declarada en la model card. No se documenta la arquitectura del modelo base (el campo `model type` indica únicamente `qwen4_exp`), ni el número de parámetros activos, ni si se trata de un transformer denso, una mezcla de expertos o una arquitectura híbrida. El sufijo `mtp` del nombre del repositorio no va acompañado de explicación en la documentación disponible.

Su relevancia práctica es acotada y muy específica: permite ejecutar un modelo de ~180B cuantizado a 5 bits sobre hardware de Apple con memoria unificada suficiente, evitando el coste de servir el modelo en precisión completa. En el momento de la consulta el repositorio registra 0 descargas y 0 likes, y no incluye licencia, idiomas ni pipeline declarados, por lo que debe tratarse como un artefacto experimental sin garantías de soporte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el campo `model type` indica `qwen4_exp`; no se especifica transformer denso, MoE o hibrida) |
| Parametros totales | 179.999.981.459 (~180B), segun metadatos de safetensors |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5 bits, group size 64, cuantizacion de precision mixta oQ (oMLX v0.7.0); no se documentan otros niveles |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base. La model card solo identifica el tipo como `qwen4_exp` y describe el proceso de cuantizacion, no la topologia de red, el mecanismo de atencion ni la presencia de componentes recurrentes o de mezcla de expertos. Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de ajuste por RLHF, DPO u otros metodos de alineamiento.

La unica innovacion tecnica documentada es el propio esquema de cuantizacion: oQ (oMLX v0.7.0) aplica precision mixta a 5 bits con tamano de grupo 64, lo que reduce el peso del modelo a 128,6 GB para ~180B de parametros. Esto equivale a unos 5,7 bits efectivos por parametro, coherente con 5 bits de cuantizacion mas los metadatos de escalas y sesgos del grupo. El sufijo `mtp` del nombre sugiere multi-token prediction, pero la model card no lo confirma ni lo describe.

## Capacidades

- Generacion de texto: no disponible (no se documenta ninguna capacidad concreta en la informacion proporcionada).
- Razonamiento, codigo y matematicas: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas esta vacio).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Lo unico verificable es que el artefacto es cargable por MLX en formato safetensors cuantizado a 5 bits.

## Casos de uso

- Inferencia local en Apple Silicon: el modelo esta empaquetado en MLX safetensors y puede cargarse con la libreria MLX en equipos Mac con memoria unificada suficiente, lo que permite ejecutar un modelo de ~180B sin depender de GPUs CUDA ni de servicios en la nube. Es el unico caso de uso directamente respaldado por la documentacion.
- Evaluacion comparativa de cuantizacion: util para medir la perdida de calidad de oQ a 5 bits frente al modelo base en precision completa, siempre que se disponga del modelo original para contrastar.
- Pruebas de decodificacion con memoria limitada: el formato de 5 bits con group size 64 permite estudiar el equilibrio entre huella de memoria y calidad de generacion en hardware de escritorio de gama alta.
- Prototipado de pipelines MLX: sirve como banco de pruebas para integraciones con la libreria MLX antes de decidir un despliegue en produccion.
- El resto de casos de uso habituales (atencion al cliente, generacion de codigo en produccion, RAG sobre documentacion, analisis de datos, agentes autonomos) no pueden justificarse con la informacion disponible, ya que se desconocen contexto maximo, idiomas, licencia y capacidades funcionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se aportan mediciones de latencia o throughput.

## Requisitos de hardware

- Peso en disco y en memoria: el repositorio ocupa 128,6 GB. A 5 bits con ~180B de parametros, la carga del modelo requiere al menos esos 128,6 GB de memoria unificada, mas el espacio para cache KV y el propio sistema operativo.
- Estimacion orientativa de memoria para inferencia: en torno a 135-160 GB para contexto corto, dependiendo del tamano de la cache KV. Es una estimacion propia, no un dato aportado por el autor.
- Hardware recomendado: Mac con memoria unificada de 192 GB o superior (por ejemplo, Mac Studio con M2 Ultra de 192 GB o M3 Ultra de 256/512 GB). En configuraciones de 128 GB o menos el modelo no cabe.
- GPU CUDA (A100, H100, RTX 4090): no aplicable de forma directa, ya que el artefacto esta en formato MLX. Una RTX 4090 con 24 GB no puede alojar el modelo en ninguna configuracion.
- Opciones de despliegue: MLX y el stack oMLX. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no consumen pesos MLX de forma nativa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se proporciona informacion sobre modelos comparables. No hay datos de rendimiento, contexto, licencia ni disponibilidad de alternativas en la informacion disponible, y el modelo base (Qwen3.8-Flash-Next) no viene acompanado de su propia ficha tecnica en los datos facilitados.

## Limitaciones y advertencias

- Ausencia total de licencia: el repositorio no declara licencia, lo que impide determinar si el uso comercial esta permitido. En la practica, esto bloquea cualquier despliegue en produccion sin aclaracion previa del autor.
- Modelo base no identificado con enlace: no se enlaza la ficha del modelo original, por lo que no se puede verificar la procedencia de los pesos ni las condiciones heredadas.
- Idiomas y contexto desconocidos: sin estos datos no es posible evaluar su idoneidad para casos de uso multilingues o de contexto largo.
- Riesgo de degradacion por cuantizacion: la cuantizacion a 5 bits con precision mixta puede introducir perdida de calidad frente al modelo original. No hay evaluaciones publicadas que cuantifiquen esa perdida.
- Riesgo de alucinacion: no evaluado ni documentado.
- Sesgos: no evaluados ni documentados.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso que permita validar su correcto funcionamiento.
- Dependencia de hardware Apple Silicon: al estar en formato MLX, no es portable a entornos CUDA sin una conversion previa.
- Artefacto efimero: creado y actualizado el 2026-10-03, sin versionado posterior ni mantenimiento documentado.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Swift1.5-Qwen3.8-Flash-Next-oQ5e-mtp
- Repositorio de oQ / oMLX (herramienta de cuantizacion citada en la model card): https://github.com/jundot/omlx
- Ficha del modelo base Qwen3.8-Flash-Next: no disponible
- Paper o blog tecnico: no disponible
