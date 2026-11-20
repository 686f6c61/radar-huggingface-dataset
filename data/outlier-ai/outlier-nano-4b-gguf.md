# Outlier-Ai/Outlier-Nano-4B-GGUF

## Resumen

Outlier-Nano-4B-GGUF es un repositorio de cuantización publicado por Outlier-Ai que contiene un único fichero GGUF, `Qwen3.5-4B-Q4_K_M.gguf`, copiado byte a byte desde el repositorio de Unsloth en la revisión `e87f176479d0855a907a41277aca2f8ee7a09523`. No se trata de un modelo entrenado por Outlier-Ai, sino de una redistribución del modelo base Qwen/Qwen3.5-4B (licencia Apache-2.0) cuantizado a Q4_K_M por Unsloth, empaquetado para que la aplicación Outlier para Windows pueda ejecutarlo localmente con llama.cpp sin depender de un repositorio de terceros que pueda cambiar.

El modelo subyacente es Qwen3.5-4B, con 4.205.751.296 parámetros totales según los pesos en safetensors del modelo base. El fichero GGUF ocupa 2.740.937.888 bytes (aproximadamente 2,7 GB) y su SHA256 es `00fe7986ff5f6b463e62455821146049db6f9313603938a70800d1fb69ef11a4`, que la aplicación verifica antes de usar el fichero. El autor de la ficha es Matthew Kerr (Kerr & Company LLC).

La relevancia de este repositorio es operativa más que técnica: sirve como artefacto de distribución reproducible y verificado por hash para un cliente de escritorio concreto. Para desarrolladores e investigadores interesados en el modelo en sí, la referencia canónica es Qwen/Qwen3.5-4B y, para otras cuantizaciones, el repositorio de Unsloth.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de Qwen/Qwen3.5-4B; no se detalla en la informacion proporcionada) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero incluido) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, los datos de entrenamiento ni las tecnicas de alineacion (RLHF, DPO u otras) de Qwen3.5-4B en la informacion proporcionada. La model card de este repositorio solo documenta el proceso de cuantizacion y empaquetado, no el entrenamiento del modelo base. Cualquier dato sobre composicion del dataset, numero de tokens o innovaciones tecnicas como decodificacion especulativa o atencion lineal debe consultarse en la documentacion oficial de Qwen.

Lo que si esta documentado con precision es la cadena de custodia del artefacto: Unsloth cuantizo los pesos del modelo base a Q4_K_M y Outlier-Ai copio el fichero resultante sin modificaciones, fijando la revision de origen y publicando el SHA256 para verificacion integra. El tag `imatrix` sugiere que la cuantizacion empleo matrices de importancia, aunque la model card no lo detalla explicitamente.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` indica un uso previsto de dialogo, pero no se detallan capacidades especificas en la informacion disponible.
- Razonamiento, codigo y matematicas: no disponible en la informacion proporcionada; dependen de las capacidades del modelo base Qwen3.5-4B.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el campo de idiomas del repositorio esta vacio.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que el artefacto puede servirse mediante endpoints compatibles con llama.cpp.

## Casos de uso

- Distribucion de escritorio verificada: la aplicacion Outlier para Windows descarga este fichero y comprueba su SHA256 antes de ejecutarlo con llama.cpp. El caso de uso principal del repositorio es servir como origen reproducible e inmutable para ese cliente, evitando dependencias de repositorios de terceros.
- Inferencia local en equipos de gama media: con un fichero de 2,7 GB en Q4_K_M, el modelo cabe en GPUs de consumo con 4-6 GB de VRAM libre o puede ejecutarse en CPU, lo que lo hace adecuado para prototipos de chat local sin infraestructura dedicada.
- Asistentes conversacionales offline: al ejecutarse con llama.cpp sin conexion, puede integrarse en herramientas de escritorio que requieran privacidad de datos, siempre que se validen antes sus capacidades reales sobre el modelo base.
- Integracion en pipelines llama.cpp: el formato GGUF permite cargarlo directamente en llama.cpp, Ollama u otros runners compatibles para tareas de generacion de texto por lotes en local.
- Pruebas de evaluacion de cuantizacion: util para comparar la calidad de Q4_K_M frente a otras cuantizaciones del mismo modelo base en tareas concretas del equipo.
- Base para experimentacion con modelos de 4B: sirve como punto de partida ligero para fine-tuning o para evaluar si un modelo de este tamano cubre las necesidades de un producto antes de escalar a variantes mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,7 GB para los pesos en Q4_K_M, mas overhead de contexto KV; en la practica, entre 3,5 y 5 GB dependiendo de la longitud de contexto configurada.
- GPU recomendadas: no hay recomendaciones oficiales en la informacion disponible. Por tamano, cualquier GPU con 6 GB o mas de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090, A100, H100) puede alojarlo; las GPU profesionales ofrecen mayor margen para contextos largos y concurrencia.
- GPU de consumo: si cabe en GPUs de consumo con 6 GB o mas; en tarjetas con 4 GB puede requerir offload parcial a CPU.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama y otros runners compatibles con GGUF; el tag `endpoints_compatible` sugiere soporte de servidores de endpoints basados en llama.cpp. vLLM y TGI no consumen GGUF de forma nativa y requeririan los pesos en safetensors del modelo base.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Outlier-Nano-4B-GGUF (este) | 4.205.751.296 | no disponible | GGUF Q4_K_M | Apache-2.0 | Redistribucion verificada por SHA256 de la cuantizacion de Unsloth |
| Qwen/Qwen3.5-4B | 4.205.751.296 | no disponible | safetensors | Apache-2.0 | Modelo base canonico; referencia para arquitectura y capacidades |
| unsloth/Qwen3.5-4B-GGUF | 4.205.751.296 | no disponible | GGUF (multiples cuantizaciones) | Apache-2.0 | Origen del fichero; ofrece mas variantes de cuantizacion |

No se dispone de datos de rendimiento comparado con otras familias de modelos de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Este repositorio no aporta ninguna mejora tecnica sobre el modelo base: es una copia binaria de una cuantizacion de terceros. Cualquier limitacion de Qwen3.5-4B aplica integramente.
- La cuantizacion Q4_K_M introduce perdida de precision respecto a los pesos originales; el impacto en calidad no esta documentado en la informacion disponible.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; deben evaluarse sobre el modelo base.
- Idiomas soportados sin especificar: el campo de idiomas del repositorio esta vacio, por lo que no se puede garantizar cobertura multilingue sin consultar la documentacion de Qwen.
- Longitud de contexto no disponible: impide planificar casos de uso con contextos largos sin verificar la configuracion del modelo base.
- Licencia Apache-2.0 permite uso comercial, pero la atribucion de los pesos corresponde al equipo de Qwen y la cuantizacion a Unsloth; la model card lo indica explicitamente.
- Dependencia de un unico fichero y de un SHA256 fijado: si el fichero se corrompe o se elimina, la aplicacion cliente no podra validarlo; conviene conservar copias verificadas.
- El repositorio no registra descargas ni likes en el momento de la consulta, lo que limita la evidencia de uso en produccion por parte de la comunidad.
- Los resultados de busqueda web sobre "Outlier" corresponden a entidades no relacionadas (una plataforma de apuestas, una plataforma educativa y una empresa de inversiones); no deben asociarse a este modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Cuantizacion de origen (Unsloth): https://huggingface.co/unsloth/Qwen3.5-4B-GGUF
- Revision de origen: `e87f176479d0855a907a41277aca2f8ee7a09523`
- Sitio de la aplicacion Outlier: https://outlier.host/
