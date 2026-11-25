# mradermacher/Omni-Edu-Pro-4B-GGUF

## Resumen

Omni-Edu-Pro-4B-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo Omni-Edu-Pro-4B, publicado por el usuario mradermacher en Hugging Face. El modelo base fue subido originalmente por el usuario lhpku20010120 bajo el identificador `lhpku20010120/Omni-Edu-Pro-4B`. Este repositorio no introduce cambios en los pesos mas alla de la conversion a GGUF y la cuantizacion, por lo que su interes practico reside en facilitar la ejecucion local del modelo base mediante herramientas como llama.cpp u Ollama.

El dato de parametros totales registrado en safetensors es de 333.514.240, es decir, aproximadamente 333 millones de parametros, muy por debajo de los 4.000 millones que sugiere el nombre comercial "4B". Esta discrepancia es relevante y debe tenerse en cuenta al planificar el despliegue. El repositorio ocupa 1,0 GB e incluye un conjunto amplio de cuantizaciones (desde Q2_K hasta F16, pasando por Q3, Q4, Q5, Q6, Q8 e IQ4_XS).

No se dispone de model card tecnica del modelo base en la informacion proporcionada, ni de datos sobre arquitectura, contexto, licencia o idiomas. La ficha se limita, por tanto, a documentar lo que consta de forma verificable y a marcar explicitamente los campos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 333.514.240 (aprox. 333 M, segun safetensors) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base Omni-Edu-Pro-4B en la documentacion proporcionada. El repositorio de mradermacher es una conversion a GGUF del modelo original de lhpku20010120, generada con la herramienta de cuantizacion estandar (se observa `quantize_version: 2` y `convert_type: hf` en los metadatos de la model card). No consta el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

La unica informacion tecnica verificable es el conjunto de cuantizaciones publicadas, que abarca desde F16 hasta Q2_K, lo que permite ajustar el modelo a distintos presupuestos de memoria. No se ha publicado informacion sobre innovaciones arquitectonicas (atencion lineal, decodificacion especulativa, mezcla de expertos, etc.).

## Capacidades

- Generacion de texto: capacidad esperable en un modelo de lenguaje, aunque no se documenta de forma explicita en la informacion disponible.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Vision: no disponible (no consta que el modelo base sea multimodal).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking u otras capacidades especiales: no disponible.

## Casos de uso

- Ejecucion local en equipos de gama baja: al tratarse de un modelo de aproximadamente 333 M de parametros con cuantizaciones desde Q2_K, puede ejecutarse en CPU y en GPUs de consumo con muy poca VRAM, lo que lo hace util para pruebas de concepto y entornos sin acelerador.
- Prototipado rapido de pipelines de inferencia: sirve para validar integraciones con llama.cpp, Ollama o servidores compatibles con la API de OpenAI antes de migrar a modelos de mayor tamano.
- Despliegue en dispositivos de borde: el tamano reducido de las cuantizaciones Q4_K_M o Q5_K_M permite empaquetar el modelo en contenedores ligeros o en hardware embebido con recursos limitados.
- Educacion y experimentacion: util como caso de estudio para entender el flujo de conversion a GGUF y el impacto de la cuantizacion en calidad y velocidad.
- Generacion de texto offline: para aplicaciones que requieren inferencia sin conexion y sin dependencia de servicios en la nube.
- Benchmarking de cuantizaciones: permite comparar la degradacion de calidad entre Q2_K, Q4_K_M y Q8_0 sobre un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de aproximadamente 333 M de parametros, las cuantizaciones Q4_K_M y Q5_K_M ocupan del orden de 200-400 MB, y F16 alrededor de 700 MB (estimacion basada en el numero de parametros; no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tambien es viable en CPU.
- GPU de consumo: cabe holgadamente en GTX 1050 Ti, RTX 3050, RTX 4060 y superiores; tambien en iGPUs modernas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todos los casos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de informacion suficiente sobre el modelo base ni sobre alternativas comparables de la misma categoria para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Discrepancia entre nombre y parametros: el nombre indica "4B" pero los safetensors registran 333.514.240 parametros; conviene verificar el modelo base antes de asumir capacidades de un modelo de 4.000 millones.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Es imprescindible consultar la licencia del modelo base `lhpku20010120/Omni-Edu-Pro-4B` antes de cualquier uso en produccion.
- Idiomas no documentados: no consta que el modelo tenga soporte multilingue verificado.
- Sin benchmarks: no hay evidencia publica de calidad, por lo que no se recomienda su uso en produccion sin una evaluacion propia.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay datos especificos sobre la tasa en este modelo.
- Repositorio sin descargas ni likes: indica que el modelo no ha sido validado por la comunidad.
- El repositorio solo contiene cuantizaciones; cualquier problema de calidad debe atribuirse al modelo base, no a la conversion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Omni-Edu-Pro-4B-GGUF
- Modelo base: https://huggingface.co/lhpku20010120/Omni-Edu-Pro-4B
