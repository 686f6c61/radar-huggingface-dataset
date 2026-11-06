# kizuna-intelligence/Haas-ja-v1.0-OneCompression-ONNX

## Resumen

Haas-ja-v1.0-OneCompression-ONNX es una distribucion del modelo de reconocimiento automatico del habla (ASR) en japones Haas-ja-v1.0, desarrollado originalmente por third-intelligence, reempaquetado por kizuna-intelligence para ejecutarse exclusivamente en CPU mediante ONNX Runtime. El objetivo es eliminar la dependencia de GPU, CUDA, PyTorch y NeMo, permitiendo transcripcion de audio japones en hardware convencional con un coste de memoria muy reducido.

La distribucion incluye tres variantes del codificador (fp32, int8 e int4) generadas con OneCompression (GPTQ mas QEP, group size 128), una tecnica de cuantizacion que ajusta los pesos de 4 bits usando audio real para minimizar el error de reconocimiento, en lugar de aplicar un simple redondeo. El formato por defecto, int4-onecomp, ocupa 380 MB y mantiene una tasa de error de caracteres (CER) estricta del 3,85 % en la evaluacion combinada de JSUT y FLEURS, ligeramente mejor que la version fp32 (4,05 %) y que el modelo original en bf16 (4,04 %).

El modelo resulta relevante para despliegues de ASR japones en entornos sin GPU, como aplicaciones de escritorio, servidores de bajo coste o sistemas embebidos, donde el espacio en disco y la RAM son limitados. La conversion requirio reescribir los kernels KDA especificos de GPU del modelo original como recurrencia paso a paso, verificada contra el modelo de referencia antes de exportar a ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo ASR con decodificacion TDT; el codificador usa kernels KDA en el original) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa segmentos de audio de aproximadamente 28 segundos con division automatica en silencios) |
| Tipos de cuantizacion | fp32, int8, int4 (OneCompression: GPTQ + QEP, group size 128) |
| Idiomas soportados | Japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (ONNX Runtime, operador MatMulNBits para int4) |

## Arquitectura y entrenamiento

El modelo base Haas-ja-v1.0 es un sistema de reconocimiento automatico del habla para japones que en su version original depende de kernels KDA (kernelized differential attention) acelerados por GPU. La conversion a ONNX requirio reescribir esa parte como una recurrencia paso a paso convencional, verificada iteracion a iteracion contra el modelo original antes de la exportacion. El pipeline completo abarca desde la extraccion de caracteristicas acusticas hasta la decodificacion TDT y la conversion a texto, implementado en el paquete `haas_cpu/` con dependencias limitadas a ONNX Runtime y NumPy, mas SciPy para el remuestreo de audio.

La cuantizacion int4 se realizo con OneCompression (GPTQ combinado con QEP, group size 128), un metodo que determina los valores de 4 bits alimentando audio real al modelo para minimizar el error de transcripcion. Los pesos cuantizados se almacenan en el operador `MatMulNBits`, especifico de ONNX Runtime. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original.

## Capacidades

- Reconocimiento automatico del habla en japones con salida de texto.
- Procesamiento de audio de 16 kHz mono; el codigo de ejemplo remuestrea automaticamente otras frecuencias (por ejemplo 44,1 kHz) y promedia canales multiples.
- Transcripcion de audio largo mediante division automatica en segmentos de aproximadamente 28 segundos en puntos de silencio, con concatenacion de resultados.
- Ejecucion exclusiva en CPU sin GPU, CUDA, PyTorch ni NeMo.
- Tres niveles de precision seleccionables (int4, int8, fp32) segun el equilibrio deseado entre tamano, velocidad y exactitud.
- Verificacion de integridad del paquete mediante `manifest.json` con tamanos y SHA256.
- Procesamiento local del audio, sin envio a servicios externos.
- No soporta tool calling, agentes, vision, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Transcripcion de reuniones y entrevistas en japones en portatiles sin GPU: el modelo int4 ocupa 380 MB y procesa audio a mas de 30 veces la velocidad real en un Core i7-12700F con cuatro hilos, lo que permite transcribir una hora de audio en unos dos minutos.
- Subtitulado de archivos de video japoneses en servidores sin acelerador: la division automatica en segmentos de 28 segundos y la concatenacion de resultados facilitan el procesamiento por lotes de bibliotecas multimedia completas.
- Aplicaciones de escritorio de dictado o notas de voz: la ausencia de dependencias de PyTorch y NeMo simplifica el empaquetado y reduce el tamano de la distribucion.
- Servicios de transcripcion en contenedores de bajo coste: la variante int8 ofrece el mayor rendimiento medido (RTFx de 41,57) con un CER combinado del 4,11 %, adecuada para volumen alto donde prima la velocidad.
- Preprocesado de corpus de audio japones para entrenamiento o analisis: la transcripcion local y la verificacion SHA256 del paquete permiten integrar el modelo en pipelines reproducibles de investigacion.
- Sistemas de accesibilidad para personas con discapacidad auditiva en entornos japoneses: la ejecucion en CPU permite desplegar la transcripcion en equipos de sobremesa sin hardware especializado.
- Archivado y busqueda de contenido audiovisual: la transcripcion a texto habilita indexacion y busqueda semantica de grabaciones en japones.

## Benchmarks y rendimiento

Datos publicados por el autor de la distribucion. CER estricta evaluada sobre 200 emisiones de JSUT y 200 de FLEURS (400 en total), con la metrica global ponderada por duracion de audio. Velocidad medida en un Core i7-12700F con cuatro hilos fijados a nucleos P, audio de 30 segundos, ONNX Runtime 1.31.1 con CPUExecutionProvider, mediana de cinco ejecuciones tras un calentamiento.

| Formato | Tamano (MB) | CER JSUT | CER FLEURS | CER global | RTFx |
|---|---:|---:|---:|---:|---:|
| Modelo original GPU (NeMo bf16) | 1232,38 | 4,38 % | 3,94 % | 4,04 % | No medido |
| fp32 | 2472,91 | 4,38 % | 3,95 % | 4,05 % | 23,10x |
| int8 | 663,87 | 4,29 % | 4,06 % | 4,11 % | 41,57x |
| int4-onecomp | 380,31 | 4,22 % | 3,74 % | 3,85 % | 30,15x |

El autor indica ademas que el redondeo simple a 4 bits sin OneCompression produce un CER del 3,98 %, peor que la cuantizacion guiada por audio. No se han publicado resultados de benchmarks estandar de ASR (por ejemplo WER en Common Voice) en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es exclusivamente en CPU.
- RAM estimada: no especificada; el mayor de los ficheros de modelo es de 2,47 GB (fp32), por lo que se recomienda al menos 4 GB de RAM libre para esa variante y bastante menos para int4.
- GPU: no necesaria ni soportada en esta distribucion; el modelo original requeria GPU.
- CPU de referencia del autor: Core i7-12700F con cuatro hilos en nucleos P; cualquier CPU x86-64 moderna deberia funcionar, con rendimiento variable.
- Despliegue: ONNX Runtime con CPUExecutionProvider; el paquete incluye `example.py` y la clase `Transcriber` para uso desde Python 3.12.
- Throughput medido: RTFx de 30,15 (int4), 41,57 (int8) y 23,10 (fp32) en el hardware de referencia, excluyendo el tiempo de carga del modelo.
- Latencia: no se publica la latencia por segmento de forma aislada; el RTFx permite estimar tiempos de procesamiento proporcionales a la duracion del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER japones | Licencia | Ejecucion |
|---|---|---|---|---|---|
| Haas-ja-v1.0-OneCompression-ONNX (int4) | No disponible | Segmentos de ~28 s | 3,85 % global (JSUT + FLEURS) | Apache-2.0 | CPU, ONNX Runtime |
| Haas-ja-v1.0 original (NeMo bf16) | No disponible | Segmentos de ~28 s | 4,04 % global | Apache-2.0 | GPU |
| Alternativas ASR japonesas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de otros modelos ASR japoneses en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con alternativas como Whisper u otros sistemas. La comparacion mas directa disponible es con el propio modelo original, que esta distribucion iguala o supera en CER global con un tamano 3,2 veces menor en int4.

## Limitaciones y advertencias

- Solo soporta japones; no se ha validado su comportamiento en otros idiomas.
- La cuantizacion int4 puede producir errores puntuales de lectura; el autor documenta que en una locucion rapida a doble velocidad la palabra "屏風" se transcribio como "寮部". Un CER medio bajo no garantiza coincidencia con el modelo original en cada emision.
- La division de audio largo en segmentos de aproximadamente 28 segundos corta el contexto en las fronteras, lo que puede degradar la transcripcion en esos puntos.
- El operador `MatMulNBits` es especifico de ONNX Runtime; el modelo no es portable a otros motores de inferencia ONNX sin conversion.
- No se han publicado datos sobre sesgos del modelo base ni sobre su comportamiento con acentos, ruido de fondo o audio telefónico.
- Riesgo de alucinacion o sustitucion de palabras no cuantificado en la informacion disponible.
- Licencia Apache-2.0, que permite uso comercial; la distribucion respeta la licencia del modelo original y atribuye OneCompression (MIT, Fujitsu) en el fichero NOTICE.
- El rendimiento medido corresponde a un hardware concreto y puede variar significativamente en otras CPUs.
- Requiere Python 3.12 segun las pruebas del autor; no se documenta compatibilidad con otras versiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kizuna-intelligence/Haas-ja-v1.0-OneCompression-ONNX
- Modelo base: https://huggingface.co/third-intelligence/Haas-ja-v1.0 (revision referenciada: 660728d39019e5e065046154beca44ac9a66a540)
- Repositorio del autor en Hugging Face: https://huggingface.co/kizuna-intelligence
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
