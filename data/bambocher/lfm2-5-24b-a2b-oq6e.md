# bambocher/LFM2.5-24B-A2B-oQ6e

## Resumen

`bambocher/LFM2.5-24B-A2B-oQ6e` es una cuantizacion mixta del checkpoint LFM2.5-24B-A2B, publicada por el usuario bambocher y generada con la herramienta oQ de oMLX (v0.7.1). No es un modelo entrenado desde cero, sino una conversion de pesos orientada a inferencia local en Apple Silicon mediante la libreria MLX. El checkpoint conserva 23.971.587.712 parametros (23,97 B) repartidos en un transformer con mezcla de expertos (tag `lfm2_moe`), y comprime el original a un formato de 6 bits afín con grupo de 64, con una media efectiva de 6,543 bits por peso.

El problema que resuelve es el de hacer viable un modelo de ~24 B en equipos de consumo: el repositorio ocupa 19,6 GB (18,26 GiB), frente a los ~47,9 GB que requeriria el mismo numero de parametros en BF16. La receta no es uniforme: el 97,92 % de los pesos va a 6 bits, un 2,06 % se mantiene a 8 bits y un 0,022 % en BF16, una estrategia habitual para preservar las capas mas sensibles a la cuantizacion.

La relevancia es practica, no cientifica: permite ejecutar un MoE de ~24 B en un Mac con memoria unificada suficiente, sin GPU dedicada. Ahora bien, la informacion disponible es muy limitada: no hay model card descriptiva del modelo base, ni licencia declarada, ni idiomas, ni ventana de contexto, ni resultados de benchmarks. Cualquier evaluacion de calidad debe hacerse contra el checkpoint original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `lfm2_moe` (transformer con mezcla de expertos, segun tag del repositorio) |
| Parametros totales | 23.971.587.712 (23,97 B) |
| Parametros activos | no disponible (la nomenclatura "A2B" del checkpoint original sugiere ~2 B activos; no confirmado en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ mixed-precision: afín 6 bits grupo 64 (97,922 % de pesos), afín 8 bits grupo 64 (2,056 %), BF16 (0,022 %), FP32 (trazas). Media efectiva 6,543 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`) |
| Tamano del repositorio | 19,6 GB (18,260 GiB de pesos) |
| Componentes | solo modelo de lenguaje (23,972 B de pesos); no se declaran cabezas de vision ni audio |
| Descargas / likes | 10 / 0 |
| Fecha de creacion | 2026-10-21 |

## Arquitectura y entrenamiento

El checkpoint es una conversion de pesos, no un entrenamiento. El autor indica que se genero con oQ (oMLX v0.7.1) mediante cuantizacion de precision mixta. La arquitectura subyacente es `lfm2_moe`, es decir, un transformer con capas de mezcla de expertos, del que no se documentan en la informacion disponible ni el numero de expertos, ni el ratio de activacion, ni el mecanismo de enrutamiento.

La innovacion tecnica relevante esta en la receta de cuantizacion: pesos afines con tamano de grupo 64, donde la practica totalidad del modelo (23,473 B de pesos) se almacena a 6 bits, mientras que 0,493 B se elevan a 8 bits y 0,005 B permanecen en BF16. Esa asimetria indica que la herramienta detecto un subconjunto reducido de tensores sensibles (tipicamente embeddings, cabezas de salida o normas) y los preservo con mayor fidelidad. No se dispone de datos sobre tokens de entrenamiento, composicion del dataset, ni fases de RLHF o DPO del modelo original.

## Capacidades

- Generacion de texto autoregresiva: es la unica capacidad confirmada por la estructura del repositorio, que solo contiene pesos de "Language model".
- Razonamiento multi-paso y codigo: no disponible en la informacion; debe verificarse empiricamente contra el checkpoint BF16.
- Tool calling / function calling: no disponible; no se documenta plantilla de chat ni formato de herramientas.
- Capacidades de agente: no disponible.
- Soporte multilingue: no disponible; no se declara lista de idiomas.
- Capacidades multimodales: no disponibles; no hay componentes de vision o audio en el desglose de pesos.
- Modo thinking o razonamiento extendido: no disponible.
- Ejecucion en Apple Silicon: capacidad confirmada por el formato MLX del checkpoint.

## Casos de uso

- Inferencia local en Mac: cargar el checkpoint con `mlx-lm` en un equipo con memoria unificada de 32 GB o mas permite disponibles ~24 B de parametros con una huella de pesos de 18,26 GiB, sin necesidad de GPU dedicada ni de conexion a la nube.
- Prototipado offline y entornos air-gapped: al ser un repositorio autocontenido de 19,6 GB, se puede copiar a una maquina sin red y servir como endpoint compatible con la API de OpenAI mediante el servidor de MLX, util en entornos con requisitos de confidencialidad.
- Evaluacion de degradacion por cuantizacion: comparar este checkpoint contra el original en BF16 sobre un conjunto propio de prompts permite medir la perdida de calidad atribuible a los 6,543 bits efectivos, un caso de uso metodologico frecuente en publicaciones de cuantizaciones comunitarias.
- Banco de pruebas de agentes y tool calling: antes de comprometerse con el modelo en produccion, se puede validar el comportamiento del MoE en cadenas de llamadas a herramientas sobre Mac, con la ventaja de que el coste por token es nulo.
- Generacion de codigo en local para desarrolladores individuales: si el modelo base rinde en tareas de programacion, el checkpoint permite autocompletado y refactorizacion sin enviar codigo propietario a terceros; requiere validacion previa porque no hay benchmarks publicados.
- Servicio de bajo volumen en intranet: con 10 descargas registradas y sin datos de throughput, es adecuado para entornos de un solo usuario o equipos pequenos donde la latencia no sea critica, no para atencion al cliente con SLA.
- Docencia e investigacion sobre cuantizacion: el desglose de bits por componente sirve como ejemplo real de cuantizacion mixta afín con grupo 64 para explicar trade-offs de memoria y precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni del modelo base ni de esta cuantizacion.

Los unicos datos medibles son de almacenamiento y precision:

| Metrica | Valor |
|---|---|
| Bits efectivos por peso (checkpoint completo) | 6,543 |
| Peso de los pesos en almacenamiento | 18,260 GiB / 19,606 GB |
| Pesos a 6 bits (grupo 64) | 23,473 B (97,922 %) |
| Pesos a 8 bits (grupo 64) | 0,493 B (2,056 %) |
| Pesos en BF16 | 0,005 B (0,022 %) |
| Reduccion frente a BF16 (estimacion aritmetica) | ~2,44x menos almacenamiento |

## Requisitos de hardware

- VRAM/memoria: los pesos ocupan 18,26 GiB; con cache KV y overhead del runtime, es razonable presupuestar entre 20 y 24 GB de memoria unificada, aunque la cifra exacta depende de la longitud de contexto, que no esta documentada.
- GPU: no aplica CUDA. El checkpoint esta en formato MLX y esta pensado para Apple Silicon (series M1/M2/M3/M4). No se ha validado su uso en A100, H100 ni RTX 4090 dentro de la informacion disponible.
- Cabe en consumer: si, en Mac con memoria unificada de 32 GB o superior (M2 Pro/Max, M3 Pro/Max, M4 Pro/Max, Mac Studio). Un Mac de 16 GB no puede alojar los pesos; uno de 24 GB queda muy justo y probablemente limitado a contextos cortos.
- Despliegue: `mlx-lm` (CLI de generacion y servidor compatible con la API de OpenAI). No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama; este ultimo requeriria una conversion a GGUF de la que no hay constancia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Almacenamiento | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B-oQ6e (este) | 23,97 B | 19,6 GB / 18,26 GiB | no disponible | no disponible | MLX, safetensors |
| LFM2.5-24B-A2B en BF16 (referencia) | 23,97 B | ~47,9 GB (estimacion aritmetica) | no disponible | no disponible | no confirmado en la informacion |
| Cuantizacion 4 bits del mismo modelo (hipotetica) | 23,97 B | ~12 GB de pesos + escalas (estimacion) | no disponible | no disponible | no disponible |
| Otros MoE abiertos de ~20-30 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento que permitan comparar calidad frente a alternativas. La comparacion anterior es exclusivamente de huella de memoria y se basa en aritmetica sobre el numero de parametros, no en mediciones.

## Limitaciones y advertencias

- Licencia no declarada: no hay terminos de uso en la informacion disponible. No debe utilizarse en produccion ni con fines comerciales hasta verificar la licencia del modelo base.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad, y la cuantizacion a 6,543 bits puede degradar tareas sensibles como matematicas o codigo.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje; sin evaluacion del checkpoint original no se puede acotar su magnitud.
- Idiomas y contexto desconocidos: se desconoce la ventana de contexto real y la cobertura linguistica, lo que impide planificar conversaciones multi-turno largas.
- Sesgos: no hay informacion sobre el dataset de entrenamiento ni sobre procesos de alineacion, por lo que no se pueden enumerar sesgos conocidos.
- Validacion comunitaria practicamente nula: 10 descargas y 0 likes; el repositorio no ha sido contrastado por terceros.
- Dependencia de plataforma: el formato MLX limita la inferencia a Apple Silicon; migrar a CUDA exige conversion de pesos y validacion adicional.
- Metadatos incompletos: no se especifica plantilla de chat, tokenizador ni configuracion de generacion en la model card, factores que afectan directamente a la calidad percibida.
- Fechas del repositorio en 2026: conviene verificar que el checkpoint corresponde a la version esperada del modelo base antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bambocher/LFM2.5-24B-A2B-oQ6e
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Modelo base LFM2.5-24B-A2B: no disponible en la informacion (no se enlaza en la model card)
- Directorio generico de modelos cuantizados/abliterated consultado en la busqueda: https://modelheretic.com/ (no contiene una ficha especifica de este checkpoint)
