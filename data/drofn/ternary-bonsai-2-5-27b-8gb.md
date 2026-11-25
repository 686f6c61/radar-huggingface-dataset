# drofn/Ternary-Bonsai-2.5-27B-8GB

## Resumen

Ternary-Bonsai-2.5-27B-8GB es un repositorio de configuración y herramientas publicado por el usuario drofn, no un modelo nuevo ni una cuantización original. Su propósito es hacer viable la ejecución de un modelo de 27.000 millones de parámetros con pesos ternarios (Ternary-Bonsai-2.5-27B, de Prism ML) en una GPU de 8 GB de VRAM, en concreto una RTX 4060, con ventanas de contexto de hasta 64K tokens. El repositorio contiene presets medidos de llama.cpp, un lanzador para Windows en PowerShell y las tablas de mediciones que respaldan cada cifra.

El modelo subyacente, Ternary-Bonsai-2.5-27B, emplea pesos de precisión ternaria (ficheros PTQ1_0 y Q2_0) empaquetados en formato GGUF para llama.cpp. El autor del repositorio no redistribuye pesos: el lanzador descarga los ficheros oficiales de Prism ML (revisión `28a7093c`) y verifica su SHA256. La aportación práctica es doble: por un lado, cuatro presets de llama.cpp (`8gb-compact`, `8gb-balanced`, `8gb-fast-mtp`, `8gb-long`) con picos de VRAM medidos; por otro, el uso de un fichero MTP (multi-token prediction) oficial de Prism que, mediante decodificación especulativa, multiplica por 2,4 la velocidad de generación en código.

La relevancia actual reside en que demuestra un caso concreto de inferencia de un modelo de 27B en hardware de consumo de gama media-baja, algo que con cuantizaciones convencionales de 4 bits resulta imposible en 8 GB. El repositorio está orientado a Windows con GPU NVIDIA y su licencia es Apache 2.0. Los idiomas declarados son inglés y turco, y el tamaño del repositorio es de 0,1 GB (sin pesos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base con pesos ternarios, formato GGUF para llama.cpp) |
| Parametros totales | 27B (según el nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 16K, 32K o 64K según preset (64K máximo con KV cache q8_0 y ub ≤ 128) |
| Tipos de cuantizacion | Pesos ternarios PTQ1_0 y Q2_0 (ficheros oficiales de Prism ML); KV cache q8_0, q8_0/q4_0 y q4_0 |
| Idiomas soportados | en, tr |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (no incluidos en este repositorio; se descargan de prism-ml/Ternary-Bonsai-2.5-27B-GGUF) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base (tipo de transformer, uso de MoE, composición del dataset o fases de alineación como RLHF o DPO) en la información proporcionada. Lo que sí se documenta es el esquema de cuantización ternaria: los pesos se almacenan en ficheros PTQ1_0 (post-training quantization ternaria) y Q2_0, ambos distribuidos por Prism ML. El repositorio de drofn emplea el fork de llama.cpp de Prism (`prism-b12178-03ec600`, CUDA 13.3) para aprovechar los ficheros PTQ1_0 y la decodificación especulativa MTP.

La innovación técnica destacable es el uso de un fichero MTP (multi-token prediction) oficial de Prism con decodificación especulativa, activada mediante los parámetros `--spec-type draft-mtp --spec-draft-n-min 0 --spec-draft-n-max 3 --spec-draft-p-min 0`. La tasa de aceptación medida es del 86 % en código y del 41 % en prosa, lo que se traduce en 2,4× de aceleración en código y 1,5× en prosa frente al mismo hardware sin MTP. Además, el autor mide la divergencia KL (KLD) de la KV cache cuantizada frente a una referencia f16: con KV q8_0 la KLD es de 0,00025 a 512 tokens, 0,00037 a 4K y 0,0022 a 16K; con KV q4_0 sube a 0,0023, 0,0033 y 0,0145 respectivamente, entre 7 y 9 veces más deriva.

## Capacidades

- Generación de texto en inglés y turco, con decodificación especulativa opcional para acelerar la salida.
- Razonamiento y generación de código: el preset `8gb-fast-mtp` alcanza 89,4 tok/s en código y 56,3 tok/s en prosa en una RTX 4060.
- Contexto largo: hasta 64K tokens con el preset `8gb-long`, verificado con pruebas de needle-in-a-haystack (3/3 a profundidades del 10 %, 50 % y 90 %).
- Servidor compatible con la API de OpenAI (`llama-server` en `http://127.0.0.1:8080`), lo que permite integrarlo en clientes y pipelines existentes.
- Soporte de function calling: el autor indica que las pruebas BFCL v3 están pendientes de publicarse, por lo que la capacidad está por confirmar con datos.
- Despliegue automatizado en Windows: el lanzador detecta la VRAM libre, elige el preset más grande que cabe, descarga el modelo y el runtime, verifica el SHA256 y arranca el servidor.
- No se documentan capacidades de visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Asistencia de código en estación de trabajo local: con el preset `8gb-fast-mtp` y su throughput de 89,4 tok/s en código, el modelo puede autocompletar y generar funciones en un editor o plugin sobre una RTX 4060 sin depender de la nube.
- Análisis de documentos largos: el preset `8gb-long` permite procesar hasta 64K tokens de contexto, suficiente para contratos, informes o bases de código de tamaño medio, con la needle encontrada en el 90 % de profundidad de contexto.
- Prototipado de agentes conversacionales: el servidor expone una API compatible con OpenAI en localhost, lo que facilita conectar frameworks de agentes y probar flujos multi-turno sin coste de API.
- Sustituto local de API en entornos con restricciones de privacidad: al ejecutarse íntegramente en la GPU del puesto de trabajo, los datos no salen del equipo, algo relevante para código propietario o documentación sensible.
- Evaluación de cuantizaciones ternarias: los presets y las tablas KLD del repositorio permiten a investigadores comparar el impacto de la KV cache q8_0 frente a q4_0 y de los ficheros PTQ1_0 frente a Q2_0 en la calidad de salida.
- Despliegue en equipos de gama media para demos: el lanzador de un solo comando reduce la puesta en marcha a la ejecución de un script de PowerShell, útil para talleres, demos y entornos de formación con hardware de 8 GB.
- Procesamiento por lotes de texto en inglés y turco: el modelo declara soporte para ambos idiomas, lo que permite tareas de resumen, clasificación o extracción en esos dos idiomas en local.

## Benchmarks y rendimiento

Los datos publicados son mediciones de rendimiento y calidad de cuantización, no benchmarks de tareas estándar (MMLU, HumanEval, GSM8K). Se presentan tal cual:

| Preset | Fichero | Contexto | KV cache | VRAM pico (MiB) | Compartida (MiB) | Gen tok/s código | Gen tok/s prosa | Gen tok/s con contexto al 90 % | Prompt tok/s |
|---|---|---:|---|---:|---:|---:|---:|---:|---:|
| `8gb-compact` | PTQ1_0 | 16K | q8_0 | 6441 | 136 | 37,5 | 37,7 | 35,2 | 646 |
| `8gb-balanced` | PTQ1_0 | 32K | q8_0 | 7001 | 152 | 37,5 | 37,7 | 33,5 | 609 |
| `8gb-fast-mtp` | PTQ1_0-mtp | 32K | q8_0 | 7727 | 158 | 89,4 | 56,3 | 81,8 | 592 |
| `8gb-long` | PTQ1_0 | 64K | q8_0 | 7891 | 148 | 36,9 | 37,3 | 29,7 | 471 |

Calidad de cuantización (KLD frente a referencia f16-KV con el mismo fichero PTQ1_0):

| Contexto | KV q8_0 | Q2_0 oficial vs PTQ1_0 (fork Prism) | Igual, llama.cpp stock | KV q8_0/q4_0 | KV q4_0 |
|---|---:|---:|---:|---:|---:|
| 512 (media de 4 sets) | 0,00025 | 0,00022 | 0,00024 | 0,0010 | 0,0023 |
| 4K (media de 2 sets) | 0,00037 | 0,00037 | 0,00047 | 0,0013 | 0,0033 |
| 16K (set largo) | 0,0022 | 0,0017 | 0,0027 | 0,0062 | 0,0145 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, BFCL v3) en la información disponible; el autor indica que BFCL v3 está pendiente.

## Requisitos de hardware

- VRAM estimada: entre 6,4 GB y 7,9 GB de VRAM dedicada según preset, más un margen de 120 MiB que el lanzador exige como VRAM libre (de 6570 a 8020 MiB libres necesarios).
- GPU medidas: RTX 4060 8 GB (ajuste y velocidad, sin monitor conectado) y RTX 5060 Ti 16 GB (mediciones de KLD).
- Otras GPU de 8 GB (RTX 3060 Ti, 3070, 4060 Ti 8 GB) no fueron medidas; el autor indica que los presets deberían caber si hay la misma VRAM libre, pero las velocidades variarán.
- Cabe en GPU de consumo de 8 GB; con un escritorio activo en la misma GPU (0,3–1,5 GB usados) el lanzador recurre automáticamente a un preset menor.
- Despliegue: llama.cpp (fork de Prism, `prism-b12178-03ec600`, CUDA 13.3) con `llama-server`; también funciona llama.cpp stock (≥ b11556), aunque con menos contexto y menor velocidad (16K con KV q8_0 o 32K con KV q4_0, a ~28,7 tok/s).
- Descargas: modelo 5,99 GB (6,23 GB para el fichero MTP) más runtime de ~0,6 GB.
- Latencia y throughput: 36,9–37,7 tok/s de generación con prompt corto en los presets sin MTP, 89,4 tok/s en código y 56,3 tok/s en prosa con MTP, y 29,7–35,2 tok/s con la ventana de contexto al 90 % de ocupación; prompt processing de 471–646 tok/s.
- Sistema operativo del lanzador: Windows 11 con driver 616.56; el lanzador es un script de PowerShell.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Ternary-Bonsai-2.5-27B (este repo, preset 8 GB) | 27B | hasta 64K | Apache 2.0 | GGUF vía Prism ML | Pesos ternarios; ~37 tok/s (89 tok/s con MTP) en RTX 4060 8 GB |
| Ternary-Bonsai-2.5-27B con llama.cpp stock + Q2_0 | 27B | 16K (KV q8_0) o 32K (KV q4_0) | Apache 2.0 | GGUF vía Prism ML | Fichero de 7,67 GB; ~28,7 tok/s en la misma GPU |
| Modelos densos de 27B en 4 bits (referencia genérica) | 27B | variable | variable | GGUF | No caben en 8 GB de VRAM con contexto útil; requieren 16–24 GB |

No se dispone de datos de benchmarks de tareas que permitan comparar la calidad del modelo con alternativas de la misma categoría; la comparación anterior se limita a parámetros, contexto, licencia y requisitos de hardware.

## Limitaciones y advertencias

- El repositorio no contiene pesos: sin conexión a internet o sin acceso a `prism-ml/Ternary-Bonsai-2.5-27B-GGUF`, el lanzador no puede completar la instalación.
- Solo se midió en una RTX 4060 8 GB sin monitor conectado; en otras GPU de 8 GB el ajuste y las velocidades son estimaciones no verificadas.
- El lanzador es exclusivo de Windows (PowerShell) y de GPU NVIDIA; no se documenta soporte para Linux, macOS ni ROCm.
- La KV cache q4_0 deriva entre 7 y 9 veces más que q8_0 según las mediciones KLD; el autor recomienda q8_0, lo que limita el contexto máximo a 64K y no permite aprovechar los 96K que cabrían con q4_0.
- Con un escritorio activo en la misma GPU, el lanzador reduce automáticamente el preset, por lo que el contexto máximo efectivo puede bajar de 64K.
- Idiomas declarados únicamente inglés y turco; no hay evidencia de calidad en castellano ni en otros idiomas.
- No hay datos publicados de benchmarks de tareas (MMLU, HumanEval, GSM8K) ni de function calling (BFCL v3 pendiente), por lo que la calidad real del modelo base no está cuantificada en esta información.
- Riesgo de alucinación y sesgos del modelo base: no documentados en la información disponible.
- Licencia Apache 2.0, que permite uso comercial, pero al tratarse de un repositorio de configuración y scripts, la licencia de los pesos descargados debe verificarse en el repositorio de Prism ML.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de uso que permita validar su mantenimiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/drofn/Ternary-Bonsai-2.5-27B-8GB
- Modelo base (pesos GGUF oficiales): https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF
- Vídeo de presentación (inglés): `assets/the-move-en.mp4` (dentro del repositorio)
- Vídeo de presentación (turco): `assets/the-move-tr.mp4` (dentro del repositorio)
- Tablas KLD completas: `measurements/tablo-kv-kld.md` (dentro del repositorio)
- Datos brutos de mediciones: `measurements/bq.csv` (dentro del repositorio)
