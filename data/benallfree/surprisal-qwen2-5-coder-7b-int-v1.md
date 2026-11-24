# benallfree/surprisal-qwen2.5-coder-7b-int-v1

## Resumen

`benallfree/surprisal-qwen2.5-coder-7b-int-v1` es una conversión a inferencia exclusivamente entera del modelo `Qwen/Qwen2.5-Coder-7B` de Alibaba, publicada por el desarrollador benallfree como pieza central del proyecto Surprisal. No es un modelo de propósito general al uso: se trata del motor de compresión sin pérdidas que Surprisal utiliza para los niveles `-c7` a `-c9`, empleando el modelo de lenguaje como estimador de probabilidades sobre el flujo de bytes de un archivo.

La conversión sustituye todas las operaciones en coma flotante por aritmética entera exacta: pesos en 8 bits con escalas de 16 bits, activaciones en block-floating-point y tablas de búsqueda (lookup tables) para las no linealidades. El resultado es que el modelo produce probabilidades bit-idénticas en cualquier GPU o CPU, lo que garantiza que un archivo comprimido en una máquina pueda descomprimirse en otra distinta. La especificación del formato está documentada como SPEC.md v1 en el repositorio del proyecto.

El modelo se distribuye en un único archivo GGUF v3 de 7.870.559.904 bytes (aproximadamente 7,9 GB) con SHA-256 determinista, de modo que cualquiera puede reconstruirlo desde el modelo base fijado en `models-v1.json` y obtener el mismo hash. Está pensado para el motor entero propio de Surprisal (nollama) y no para llama.cpp ni otros runtimes GGUF convencionales. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-7B), convertida a inferencia entera |
| Parametros totales | 7.738.873.345 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Pesos enteros de 8 bits con escalas de 16 bits; activaciones block-floating-point; lookup tables para no linealidades |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF v3 (SPEC.md §1.3), archivo unico `qwen2.5-coder-7b-int-v1.gguf` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del transformer decoder-only de Qwen2.5-Coder-7B, con aproximadamente 7.738 millones de parametros. Sobre esa base, la conversion de Surprisal reemplaza el cómputo en coma flotante por aritmetica entera exacta: los pesos se almacenan en 8 bits con escalas de 16 bits, las activaciones se representan en block-floating-point y las funciones no lineales (activaciones, normalizaciones y operaciones equivalentes) se resuelven mediante tablas de búsqueda precalculadas. El objetivo no es acelerar la inferencia ni reducir el tamano, sino garantizar determinismo numerico absoluto: cada operacion es aritmetica entera exacta, de modo que las probabilidades calculadas son bit-identicas independientemente del hardware.

No se ha realizado ningun entrenamiento adicional ni ajuste fino sobre el modelo base: la relacion declarada es `quantized`, es decir, una conversion del checkpoint original. El proceso de conversion esta formalizado en SPEC.md (v1) y el archivo resultante es reproducible de forma determinista desde la revision fijada del modelo base, con SHA-256 `4f447ba7697edf55399910cbff7a74e261e19e6896e4a7dda3decb6053d9496a`. No se dispone de informacion sobre el dataset de entrenamiento original de Qwen2.5-Coder-7B en la informacion proporcionada, ni sobre si hubo RLHF o DPO en su desarrollo.

## Capacidades

- Estimacion de probabilidades (surprisal) sobre secuencias de bytes, que es la funcion para la que este artefacto esta disenado y validado.
- Compresion sin perdidas de archivos como motor del compresor Surprisal en los niveles `-c7` a `-c9`.
- Inferencia determinista: probabilidades bit-identicas en cualquier GPU o CPU, requisito para la portabilidad de los archivos comprimidos.
- Capacidades heredadas del modelo base Qwen2.5-Coder-7B (generacion de codigo, razonamiento sobre codigo, matematicas), aunque no estan garantizadas ni documentadas en esta conversion.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada para esta conversion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada para esta conversion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible; el modelo base es exclusivamente de texto y codigo.

## Casos de uso

- Compresion de archivos con Surprisal: el uso previsto principal. El modelo actua como motor de probabilidades para los niveles `-c7` a `-c9`, y su aritmetica entera garantiza que un archivo comprimido en una maquina se descomprima correctamente en otra con hardware distinto.
- Archivado reproducible a largo plazo: al ser el archivo determinista y verificable por SHA-256, permite reconstruir el motor exacto desde el modelo base y validar la integridad de los archivos comprimidos anios despues.
- Compresion de codigo fuente y repositorios: al derivar de Qwen2.5-Coder-7B, el estimador de probabilidades esta especializado en texto de codigo, lo que resulta adecuado para comprimir arboles de fuentes, diffs y artefactos de build.
- Distribucion de datasets y artefactos binarios: el modelo se descarga automaticamente la primera vez que un nivel de Surprisal lo necesita, lo que simplifica la integracion en pipelines de empaquetado sin gestion manual de dependencias.
- Verificacion de determinismo en entornos heterogeneos: util para equipos que necesitan demostrar que un proceso de compresion/descompresion produce resultados identicos en CPU y GPU, por ejemplo en auditorias o entornos regulados.
- Desarrollo e investigacion sobre compresion basada en modelos de lenguaje: sirve como referencia de implementacion de inferencia entera exacta con lookup tables, documentada en SPEC.md v1, para quienes investigan compresores neuronales.
- No es adecuado como sustituto directo de un servidor de inferencia de codigo: no esta pensado para llama.cpp ni para runtimes GGUF convencionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo pesa 7.870.559.904 bytes (unos 7,9 GB) en disco; la VRAM necesaria depende de la implementacion del motor entero de Surprisal (nollama), que no documenta requisitos en la informacion proporcionada.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el modelo esta disenado para ejecutarse tanto en GPU como en CPU con resultados identicos.
- Opciones de despliegue: exclusivamente el motor entero de Surprisal (nollama). No es compatible con llama.cpp, Ollama, vLLM ni TGI, segun la propia model card.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Proposito |
|---|---|---|---|---|---|
| surprisal-qwen2.5-coder-7b-int-v1 | 7.738.873.345 | no disponible | GGUF v3 (motor Surprisal) | Apache 2.0 | Motor de compresion sin perdidas |
| Qwen/Qwen2.5-Coder-7B (base) | 7.738.873.345 | no disponible en la informacion proporcionada | safetensors | Apache 2.0 | Generacion de codigo de proposito general |
| Otros compresores neuronales basados en LLM | no disponible | no disponible | no disponible | no disponible | Compresion sin perdidas |

La comparativa directa con otros compresores neuronales no esta disponible en la informacion proporcionada. Frente al modelo base, la diferencia esencial es el determinismo entero y la orientacion a compresion, no el rendimiento en tareas de generacion.

## Limitaciones y advertencias

- No es compatible con llama.cpp, Ollama, vLLM, TGI ni otros runtimes GGUF estandar; solo funciona con el motor entero nollama del proyecto Surprisal.
- No esta pensado como modelo de chat, generacion de codigo o asistente: su funcion documentada es la estimacion de probabilidades para compresion.
- El rendimiento como generador de texto no esta evaluado en esta conversion; la aritmetica entera con lookup tables puede degradar la calidad respecto al modelo base en tareas generativas, aunque no se aportan datos al respecto.
- Riesgo de alucinacion: no aplica de forma directa al uso previsto (compresion), pero si se emplea fuera de ese contexto hereda los sesgos y errores del modelo base.
- Sesgos conocidos: no documentados en la informacion proporcionada; se heredarian los del modelo base Qwen2.5-Coder-7B.
- Idiomas soportados: no disponibles en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen2.5-Coder-7B y del proyecto Surprisal por separado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica un artefacto muy reciente y con poca validacion externa.
- La fecha de creacion indicada (2026-11-24) es posterior a la fecha actual, lo que puede indicar un error en los metadatos del repositorio; conviene verificarlo antes de integrarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/benallfree/surprisal-qwen2.5-coder-7b-int-v1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B
- Repositorio del proyecto Surprisal: https://github.com/benallfree/surprisal
- Especificacion del formato (SPEC.md): https://github.com/benallfree/surprisal/blob/main/SPEC.md
- Definicion de modelos v1: https://github.com/benallfree/surprisal/blob/main/spec/models-v1.json
- Motor de inferencia entero (nollama): https://github.com/benallfree/nollama
