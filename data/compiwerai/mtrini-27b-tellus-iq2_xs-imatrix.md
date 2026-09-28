# CompiwerAI/Mtrini-27B-Tellus-IQ2_XS-Imatrix

## Resumen

CompiwerAI/Mtrini-27B-Tellus-IQ2_XS-Imatrix es un repositorio auxiliar publicado por CompiwerAI que no contiene pesos de modelo, sino los dos artefactos necesarios para reproducir la cuantizacion IQ2_XS del modelo Mtrini-27B-Tellus: una importance matrix (`Mtrini-27B-Tellus-IQ2_XS.imatrix`) y el corpus de calibracion empleado para generarla (`mtrini-calibration-large.txt`).

El modelo al que da servicio, Mtrini-27B-Tellus, tiene 27.000 millones de parametros segun la nomenclatura del repositorio y las etiquetas apuntan a la familia Qwen, aunque la informacion disponible no confirma arquitectura, contexto ni idiomas. Se distribuye en formato GGUF para llama.cpp, con variantes IQ2_XS y F16, bajo licencia Apache 2.0. La cuantizacion IQ2_XS situa el coste en torno a 2 bits por peso, lo que permite ejecutar un modelo de 27B en GPU de consumo.

La relevancia de este repositorio es practica: la importance matrix condiciona la calidad final de la cuantizacion, y su publicacion permite auditar la calibracion (perplejidad de ~2,4629 ± 0,04545 con contexto de 512 y 32 fragmentos) y reutilizar el mismo corpus para generar otras cuantizaciones de la misma familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (las etiquetas del repositorio apuntan a la familia Qwen; sin confirmar) |
| Parametros totales | 27 B (segun la nomenclatura del repositorio) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible para el modelo; contexto de calibracion de 512 tokens |
| Tipos de cuantizacion | IQ2_XS con imatrix; el repositorio hermano publica F16 GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | este repositorio no incluye pesos: contiene un fichero `.imatrix` y un corpus `.txt`. Los pesos asociados se distribuyen en GGUF (IQ2_XS y F16) |

Configuracion de calibracion declarada por el autor:

| Propiedad | Valor |
|---|---|
| Tamano de contexto | 512 |
| Hilos | 20 |
| Fragmentos (chunks) | 32 |
| Perplejidad de calibracion | ~2,4629 ± 0,04545 |
| Entradas de importancia | 496 |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura interna, el volumen de tokens de entrenamiento, la composicion del dataset ni la existencia de fases de RLHF o DPO del modelo Mtrini-27B-Tellus. Lo unico verificable es la cadena de cuantizacion descrita por el autor: modelo merged, conversion a GGUF F16, preparacion del corpus de calibracion, generacion de la importance matrix, cuantizacion IQ2_XS y validacion del GGUF. Las etiquetas del repositorio incluyen `qwen`, lo que sugiere una base de esa familia, pero no se aporta confirmacion explicita.

La unica innovacion tecnica documentada es el uso de importance matrix (imatrix) durante la cuantizacion. Esta tecnica pondera la importancia de cada tensor a partir de las activaciones observadas sobre un corpus de calibracion, de modo que el error de cuantizacion se concentra en los pesos menos relevantes. El corpus se proceso con contexto de 512 tokens, 20 hilos y 32 fragmentos, generando 496 entradas de importancia. No se especifica el dominio, el idioma ni la licencia del texto de calibracion.

## Capacidades

- Generacion de texto, razonamiento, codigo o matematicas: no disponible; la informacion proporcionada no incluye ninguna evaluacion funcional del modelo.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas en el repositorio.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Capacidad verificable de este repositorio: suministrar la importance matrix y el corpus de calibracion para reproducir la cuantizacion IQ2_XS de Mtrini-27B-Tellus.
- Capacidad derivada: el corpus de calibracion puede reutilizarse como base para generar otras importance matrices y otras cuantizaciones de la misma familia de modelos.
- Capacidad de despliegue: los pesos asociados en GGUF son ejecutables con llama.cpp y derivados, incluido el modelo cuantizado IQ2_XS.

## Casos de uso

- Reproduccion exacta de la cuantizacion: un ingeniero puede descargar el `.imatrix` y el corpus, y repetir el paso de cuantizacion IQ2_XS sobre el GGUF F16 para verificar que obtiene un artefacto equivalente al publicado.
- Generacion de cuantizaciones adicionales: el mismo imatrix sirve como punto de partida para producir variantes IQ3_XXS, IQ3_XS o IQ4_XS del mismo modelo, reutilizando el corpus de calibracion y evitando recalibrar desde cero.
- Despliegue en hardware de consumo: el GGUF IQ2_XS asociado permite ejecutar un modelo de 27B en una GPU con 12 GB de VRAM o en un equipo Apple Silicon con memoria unificada, algo inviable con el F16.
- Analisis forense de calidad de cuantizacion: comparando las salidas del IQ2_XS con las del F16 en el mismo conjunto de prompts se puede medir la degradacion introducida por la cuantizacion de ~2 bits por peso.
- Investigacion sobre tecnicas de calibracion: el repositorio publica la perplejidad de calibracion y el numero de entradas de importancia, lo que permite reproducir experimentos sobre el efecto del tamano de contexto o del numero de fragmentos en la matriz resultante.
- Audiencia de dominio del corpus: al estar disponible el texto de calibracion, un equipo puede inspeccionar que dominios e idiomas se cubrieron y decidir si el imatrix es adecuado para su caso de uso antes de emplearlo.
- Construccion de adaptadores: los repositorios hermanos se documentan para uso con PEFT, por lo que el modelo merged puede servir de base para entrenar adaptadores LoRA sobre el mismo linaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato numerico aportado es la perplejidad de calibracion del propio proceso de cuantizacion, que no es equiparable a una evaluacion estandar (MMLU, HumanEval, GSM8K, etc.) y no permite comparar el modelo con alternativas.

| Metrica | Valor | Nota |
|---|---|---|
| Perplejidad de calibracion | ~2,4629 ± 0,04545 | Medida durante la generacion del imatrix, contexto 512, 32 fragmentos |
| MMLU | no disponible | |
| HumanEval | no disponible | |
| GSM8K | no disponible | |

## Requisitos de hardware

Nota: este repositorio no contiene pesos, por lo que los requisitos siguientes corresponden al modelo cuantizado IQ2_XS derivado, no a los ficheros publicados aqui.

- VRAM estimada para inferencia: con un coste de aproximadamente 2 bits por peso, los 27 B de parametros ocupan del orden de 7 a 9 GB; anadiendo cache KV y overhead del runtime, el consumo realista se situa en torno a 9-11 GB con contextos moderados. Estimacion aritmetica a partir del nivel de cuantizacion, no confirmada por el autor.
- GPU recomendadas (estimacion): RTX 3060 12 GB, RTX 4070 12 GB, RTX 4070 Ti 12 GB o superiores para la variante IQ2_XS; RTX 4090 24 GB, A100 40/80 GB o H100 para la variante F16, que ronda los 54 GB en pesos.
- Cabe en GPU de consumo: si, previsiblemente, en cualquier GPU con 12 GB o mas de VRAM, y en equipos Apple Silicon con 16 GB o mas de memoria unificada. No confirmado por el autor.
- Opciones de despliegue: llama.cpp y sus envoltorios (Ollama, LM Studio, text-generation-webui) son las rutas naturales para GGUF IQ2_XS. Para vLLM o TGI, que descomprimen los pesos en memoria, seria necesario partir del F16 y contar con VRAM muy superior.
- Latencia y throughput: no disponible. Depende del backend, del hardware y del contexto, y no se aportan mediciones.

## Comparativa con modelos similares

La informacion disponible solo permite comparar este repositorio con sus artefactos hermanos dentro de la misma familia. No hay datos verificados de rendimiento ni de contexto de modelos alternativos, por lo que la comparacion con terceros queda marcada como no disponible.

| Repositorio | Contenido | Uso |
|---|---|---|
| CompiwerAI/Mtrini-27B-Tellus-IQ2_XS-Imatrix | Importance matrix y corpus de calibracion | Reproducir o derivar cuantizaciones |
| CompiwerAI/Mtrini-27B-Tellus-IQ2_XS | Pesos GGUF IQ2_XS | Inferencia en hardware limitado |
| CompiwerAI/Mtrini-27B-Tellus-GGUF | Pesos GGUF F16 | Referencia de calidad y base para cuantizar |
| CompiwerAI/Mtrini-27B-Tellus-Merged | Modelo merged (formato no indicado) | Punto de partida del pipeline |
| CompiwerAI/Mtrini-27B-Tellus | Repositorio principal, con soporte PEFT | Uso general y adaptadores |
| Modelos comparables de 27-32 B en el mercado | no disponible | Sin datos de parametros, contexto, rendimiento ni licencia verificados en la informacion proporcionada |

## Limitaciones y advertencias

- Este repositorio no contiene pesos: no puede cargarse directamente para inferencia. Solo incluye una importance matrix y un fichero de texto de calibracion.
- No hay resultados de benchmarks de ningun tipo, por lo que no existe evidencia publicada sobre la calidad del modelo en tareas reales.
- Se desconoce la composicion, el idioma y la licencia del corpus de calibracion; si su dominio no coincide con el de produccion, el imatrix puede estar sesgado hacia ese dominio.
- Una cuantizacion de aproximadamente 2 bits por peso degrada de forma apreciable la calidad respecto al F16: son esperables perdidas de coherencia, repeticiones y peor seguimiento de instrucciones, especialmente en tareas de codigo y razonamiento largo.
- La licencia del repositorio es Apache 2.0, pero no se verifica la procedencia del modelo base; conviene comprobar la licencia del modelo merged antes de un uso comercial.
- No se declaran idiomas soportados, longitud de contexto real ni si el modelo admite tool calling o razonamiento multi-paso.
- Los metadatos del repositorio son atipicos: cero descargas, cero likes, fecha de creacion registrada como 2026-09-27, actualizacion tres minutos despues y tamano reportado de 0,0 GB, lo que sugiere que el contenido real esta en punteros LFS y que el repositorio carece de adopcion o validacion por terceros.
- Riesgo de alucinacion inherente a cualquier modelo generativo: no disponible su magnitud concreta por ausencia de evaluaciones.
- Al tratarse de un artefacto auxiliar, cualquier uso en produccion depende del repositorio de pesos asociado, cuya calidad no se documenta aqui.

## Enlaces

- Repositorio de la importance matrix: https://huggingface.co/CompiwerAI/Mtrini-27B-Tellus-IQ2_XS-Imatrix
- Pesos GGUF IQ2_XS: https://huggingface.co/CompiwerAI/Mtrini-27B-Tellus-IQ2_XS
- Pesos GGUF F16: https://huggingface.co/CompiwerAI/Mtrini-27B-Tellus-GGUF
- Modelo merged: https://huggingface.co/CompiwerAI/Mtrini-27B-Tellus-Merged
- Repositorio principal del modelo: https://huggingface.co/CompiwerAI/Mtrini-27B-Tellus
- Mtrini-Tellus-1.0: https://huggingface.co/CompiwerAI/Mtrini-Tellus-1.0
- Perfil del autor en X: https://x.com/compiwer_ai
