# mradermacher/Qwen3.5-4B-Nocturne-v1.0-GGUF

## Resumen

Qwen3.5-4B-Nocturne-v1.0-GGUF es la distribucion en formato GGUF de un modelo derivado de la familia Qwen3.5, publicada por el usuario mradermacher. El repositorio contiene unicamente cuantizaciones estaticas del modelo original alojado en `khang272/Qwen3.5-4B-Nocturne-v1.0`, un fine-tune comunitario sobre una base Qwen3.5 de 4B. El autor de la cuantizacion no aporta model card propia mas alla de la lista de ficheros generados.

El dato mas relevante y a la vez mas confuso es el recuento de parametros reportado en los safetensors del repo: 333.514.240 parametros, es decir, aproximadamente 0,33B y no 4B como sugiere el nombre. Esta discrepancia puede deberse a un fallo en el recuento (por ejemplo, si los tensores estan almacenados en un formato empaquetado o si el campo refleja solo una parte del modelo), pero conviene tratarla con cautela: el tamano del repositorio (1,0 GB) es coherente con un modelo de aproximadamente 0,3B cuantizado en varios niveles, no con un 4B completo en todos los formatos.

La ficha se limita a documentar lo que consta en la informacion disponible. No hay datos publicados sobre arquitectura, entrenamiento, licencia, idiomas ni benchmarks, por lo que la mayoria de apartados tecnicos se marcan como no disponibles. El modelo resulta relevante para quien quiera experimentar con variantes comunitarias de Qwen3.5 en local mediante llama.cpp u Ollama, pero no debe considerarse un modelo listo para produccion sin verificacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen3.5, sin detalle publicado) |
| Parametros totales | 333.514.240 segun safetensors del repo (discrepante con el nombre "4B") |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo original `khang272/Qwen3.5-4B-Nocturne-v1.0`. Por el nombre se infiere que parte de una base Qwen3.5 de 4B, pero no consta si se trata de un transformer denso convencional, de una variante con atencion lineal o de otra configuracion. Tampoco hay datos sobre el proceso de fine-tuning aplicado para producir la variante "Nocturne", ni sobre volumen de tokens, composicion del dataset, uso de RLHF, DPO u otras tecnicas de alineamiento.

Lo unico verificable es el proceso de cuantizacion: el repositorio contiene cuantizaciones estaticas generadas con la herramienta de mradermacher (se observa `quantize_version: 2` y `output_tensor_quantised: 1` en los metadatos), con un conjunto de niveles que abarca desde Q2_K hasta Q8_0 e IQ4_XS, ademas de una version f16. No se documenta ninguna innovacion tecnica adicional.

## Capacidades

- Generacion de texto conversacional: el modelo base apunta a un uso de chat, aunque no se detallan capacidades especificas.
- Razonamiento y codigo: no disponible; no hay informacion que confirme ni descarte estas capacidades.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Pruebas de concepto en local: al distribuirse en GGUF con niveles desde Q2_K hasta Q8_0, permite ejecutar el modelo en equipos modestos mediante llama.cpp u Ollama para evaluar su comportamiento antes de comprometerse con una version mayor.
- Experimentacion con fine-tunes comunitarios: util para investigadores que quieran comparar variantes derivadas de Qwen3.5 (como esta "Nocturne") frente a la base original en tareas de conversacion.
- Prototipado de asistentes conversacionales: si el modelo base conserva las capacidades de chat de Qwen3.5, podria usarse para maquetar interfaces de dialogo, aunque sin garantias de calidad al no haber benchmarks.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q2_K y Q3_K reducen el peso del modelo lo suficiente para caber en GPUs de gama baja o incluso en CPU, lo que facilita pruebas de latencia y throughput en hardware asequible.
- Evaluacion de seguridad y alineamiento: al existir variantes "abliterated" y "heretic" de la misma base en el ecosistema de mradermacher, este repo puede servir para comparar comportamientos entre versiones alineadas y no alineadas.
- Integracion en pipelines de generacion de texto por lotes: con llama.cpp se puede servir el modelo mediante su API compatible con OpenAI para tareas de generacion masiva sin requisitos de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision. Si el recuento de 333M parametros es correcto, las cuantizaciones Q4_K_M ocuparian del orden de 200-250 MB y Q8_0 en torno a 350-400 MB; si el modelo real fuese de 4B, Q4_K_M rondaria los 2,5 GB y Q8_0 los 4,3 GB. El tamano del repo (1,0 GB) sugiere que la mayoria de ficheros son pequenos.
- GPU recomendadas: no disponible. Para un modelo de este tamano cualquier GPU consumer moderna (RTX 3060 en adelante) seria suficiente; para un 4B, una RTX 4090 o A100 ofreceria margen amplio.
- Compatibilidad con GPU consumer: probable en la mayoria de tarjetas actuales dada la cuantizacion, pero sin datos confirmados.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python o el servidor propio de llama.cpp). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-Nocturne-v1.0-GGUF (este) | 333M segun safetensors (nombre indica 4B) | no disponible | no disponible | GGUF | Cuantizacion estatica de un fine-tune comunitario |
| mradermacher/Qwen3.5-4B-heretic-GGUF | no disponible | no disponible | apache-2.0 (segun la card del repo) | GGUF | Variante "abliterated/uncensored" de la misma base |
| mradermacher/Huihui-Qwen3.5-4B-abliterated-GGUF | no disponible | no disponible | no disponible | GGUF | Otra variante abliterated de Qwen3.5-4B |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa entre estas variantes.

## Limitaciones y advertencias

- Discrepancia de parametros: el nombre indica 4B pero los safetensors reportan 333M; es imprescindible verificar el modelo real antes de usarlo en produccion.
- Ausencia de model card: no hay informacion sobre entrenamiento, datos, alineamiento ni evaluacion, lo que impide valorar sesgos o calidad.
- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; hay que consultar la licencia del modelo original `khang272/Qwen3.5-4B-Nocturne-v1.0` y de la base Qwen3.5.
- Riesgo de alucinacion: sin benchmarks ni evaluaciones, no hay evidencia sobre la fiabilidad de las respuestas.
- Idiomas no declarados: se desconoce el soporte multilingue real.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo.
- Repositorio sin descargas ni likes: no hay senales de uso comunitario que permitan inferir su calidad.
- Al ser un fine-tune comunitario, puede heredar sesgos o comportamientos no deseados de la base y del proceso de ajuste.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-4B-Nocturne-v1.0-GGUF
- Modelo original: https://huggingface.co/khang272/Qwen3.5-4B-Nocturne-v1.0
- Variante heretic: https://huggingface.co/mradermacher/Qwen3.5-4B-heretic-GGUF
- Variante abliterated: https://huggingface.co/mradermacher/Huihui-Qwen3.5-4B-abliterated-GGUF
