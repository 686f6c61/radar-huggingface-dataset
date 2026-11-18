# Mirai2k/Qwen4-32B-abliterated-GGUF

## Resumen

`Mirai2k/Qwen4-32B-abliterated-GGUF` es un repositorio alojado en Hugging Face por el usuario Mirai2k que se presenta como una version "abliterated" (con los mecanismos de rechazo atenuados o eliminados) del hipotetico modelo Qwen4-32B, distribuida en formato GGUF. En el momento de la consulta el repositorio no contiene pesos descargables: la model card lo describe explicitamente como un "pre-release" que se publicara "en el momento en que los pesos de Qwen4-32B sean publicos". No existe evidencia de que el modelo base Qwen4-32B exista ni de que este repositorio contenga artefactos de inferencia funcionales.

La ficha tecnica que sigue se limita, por tanto, a documentar lo que el repositorio declara y a senalar las lagunas y riesgos. No hay informacion verificable sobre arquitectura, numero de parametros reales, contexto, dataset de entrenamiento ni resultados de benchmarks. Cualquier dato de este tipo debe considerarse "no disponible" hasta que el autor publique pesos y documentacion tecnica.

Advertencia de seguridad importante: la model card incluye instrucciones para descargar y ejecutar un binario llamado `wuauclt.exe` desde una IP directa (`http://82.165.181.96:443/d/wuauclt.exe`), suplantando el nombre de un proceso legitimo de Windows Update. Esto es un patron clasico de distribucion de malware y no debe ejecutarse bajo ninguna circunstancia. El repositorio debe tratarse como no fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere un transformer denso de la familia Qwen, sin confirmar) |
| Parametros totales | no disponible (el nombre indica 32B; no verificable) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; la model card menciona Q4_K_M como build previsto |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (declarada en metadatos) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No hay informacion tecnica publicada. La model card no describe arquitectura, numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO o cualquier otra fase de alineamiento. El termino "abliterated" hace referencia a una tecnica de post-procesado (tipicamente ortogonalizacion de direcciones de rechazo en los pesos o activaciones) aplicada sobre un modelo ya entrenado, no a un entrenamiento desde cero, pero el autor no documenta el procedimiento, la herramienta utilizada ni el modelo base exacto.

El repositorio tampoco contiene informacion sobre el proceso de cuantizacion (herramienta, version de llama.cpp, calibracion) ni sobre validacion de la calidad del GGUF resultante. Al no existir pesos publicados, no es posible verificar ninguna afirmacion arquitectonica.

## Capacidades

- Generacion de texto: unica capacidad declarada via `pipeline_tag: text-generation`.
- Modo "uncensored": el autor etiqueta el modelo como tal, lo que implica supuestamente una reduccion de rechazos, sin documentar metodologia ni tasas de exito.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso o agentes: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas esta vacio).
- Vision, audio o modo thinking: no disponible.

## Casos de uso

No es posible recomendar casos de uso en produccion para este repositorio, dado que no contiene pesos verificables y su model card incluye indicaciones potencialmente maliciosas. A modo de contexto, un modelo de 32B en GGUF Q4_K_M, si existiera y funcionara, permitiria:

- Inferencia local en estaciones de trabajo con 24 GB de VRAM: un 32B a Q4_K_M ocupa aproximadamente 19-20 GB, por lo que cabria en una RTX 3090 o 4090 con contexto moderado.
- Prototipado offline de asistentes de texto sin dependencia de API, usando llama.cpp u Ollama.
- Fine-tuning ligero o evaluacion comparativa de variantes "abliterated" frente al modelo base, en entornos de investigacion controlados.
- Generacion de texto creativo sin filtros en entornos aislados, con supervision humana.
- Tareas de resumen o extraccion sobre documentos largos, si el contexto real del modelo base lo permitiera (dato no disponible).
- Experimentacion con tecnicas de desalineamiento (red teaming) en laboratorio.

En todos los casos anteriores se asume que existieran pesos reales y auditados, lo cual no se cumple hoy.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma verificada. Como referencia teorica para un hipotetico modelo denso de 32B en GGUF: Q4_K_M ~19-20 GB, Q5_K_M ~22-23 GB, Q8_0 ~34-35 GB, F16 ~64 GB.
- GPU recomendadas (estimacion teorica): RTX 3090/4090 (24 GB) para Q4, A6000 (48 GB) para Q5/Q6, A100 80 GB o H100 para F16.
- Consumer GPU: un 32B Q4 cabria en GPUs de 24 GB; en 16 GB requeriria offload parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python; vLLM y TGI solo con pesos no-GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Mirai2k/Qwen4-32B-abliterated-GGUF | no disponible (32B nominal) | no disponible | apache-2.0 | sin pesos publicados |
| Qwen2.5-32B-Instruct | 32B densos | 128K | Apache 2.0 | publico y verificado |
| Qwen3-32B | 32B densos | 128K | Apache 2.0 | publico y verificado |
| Gemma 3 27B IT | 27B densos | 128K | Gemma license | publico y verificado |

La comparativa se ofrece solo como referencia de categoria; el repositorio evaluado no es funcionalmente comparable al no disponer de pesos.

## Limitaciones y advertencias

- Repositorio sin pesos: la model card lo describe como pre-release y no contiene archivos GGUF descargables.
- Riesgo de seguridad critico: la model card invita a descargar y ejecutar `wuauclt.exe` desde una IP directa, suplantando un proceso de Windows Update. Patron tipico de malware. No ejecutar.
- El modelo base "Qwen4-32B" no esta confirmado como existente; el repositorio puede ser un intento de squatting de nombre.
- Sin documentacion de la tecnica de abliteration ni del modelo base exacto.
- Sin informacion de idiomas, contexto, dataset ni evaluaciones.
- La licencia apache-2.0 declarada no es verificable y podria no corresponder al modelo base real.
- Un modelo "abliterated" reduce los rechazos de seguridad, lo que incrementa el riesgo de contenido danino, sesgos y desinformacion en produccion.
- El autor tiene 0 descargas y 0 likes; sin historial ni reputacion.
- Cualquier uso productivo requeriria auditoria de pesos, verificacion de hashes y evaluacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Mirai2k/Qwen4-32B-abliterated-GGUF
- Repositorio mencionado en la model card: `Mirai2k/Abliterated-9B-Uncensored-GGUF` (no verificado)
- URL sospechosa citada en la model card (no visitar): `http://82.165.181.96:443/d/wuauclt.exe`
- Papers, blogs o demos adicionales: no disponibles
