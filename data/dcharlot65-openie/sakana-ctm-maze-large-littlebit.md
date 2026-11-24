# dcharlot65-openie/Sakana-CTM-Maze-Large-LittleBit

## Resumen

`Sakana-CTM-Maze-Large-LittleBit` es un checkpoint de pesos "vivos" (living weights) derivado de `SakanaAI/ctm-maze-large` mediante una factorización `LittleBit-2 ⊕ Sakana SVF`. Lo publica el usuario `dcharlot65-openie` y su propósito es servir como artefacto empaquetado para JouleDB, una base de datos termodinámica y runtime de inferencia sin PyTorch, orientada a despliegues nativos en Kubernetes (JouleKube). No se trata de un modelo entrenado desde cero, sino de una recompresión del modelo base de Sakana AI.

La innovación principal es la compresión sub-1-bit: los pesos se almacenan como 40 tensores de planos de bits bidimensionales más 138 vectores unidimensionales (LayerNorm, bias, depthwise), alcanzando 0,1960 bits por peso (BPW) y reduciendo el tamaño desde 61,04 MB en FP16 hasta 2,40 MB en formato `.jsyn` (zstd + CRC32), una ratio de compresión de 25,48x. El total de parámetros declarado es de 32.001.530.

Es relevante en el contexto de la inferencia de bajo consumo y los entornos con restricciones de memoria, ya que demuestra que un modelo de unos 32 millones de parámetros puede empaquetarse en menos de 3 MB conservando la estructura suficiente para ejecutarse en el runtime JouleDB. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de `SakanaAI/ctm-maze-large`; la model card no detalla la arquitectura interna) |
| Parametros totales | 32.001.530 |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | sub-1-bit LittleBit-2 (promedio 0,1960 BPW); tensores 2D en planos de bits y vectores 1D en FP; empaquetado zstd + CRC32 en `.jsyn` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.jsyn` (formato propietario de JouleDB); 40 tensores 2D de planos de bits + 138 vectores 1D |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base `SakanaAI/ctm-maze-large`, más allá de su nombre y su vinculación con Sakana AI (conocida por sus trabajos en modelos de razonamiento y tareas tipo laberinto, si bien esto no se confirma en la información disponible). Lo que sí se detalla es el esquema de factorización aplicado: `LittleBit-2 ⊕ Sakana SVF`, que descompone los pesos en 40 tensores bidimensionales representados como planos de bits y 138 vectores unidimensionales (LayerNorm, bias y depthwise) que se mantienen en precisión completa. Esta separación permite aplicar cuantización agresiva solo a los tensores 2D, que concentran la mayor parte del cómputo.

No hay información sobre el dataset de entrenamiento, número de tokens, composición, ni sobre si se aplicó RLHF, DPO o algún tipo de ajuste fino. El checkpoint es una recompresión, no un reentrenamiento: no se declaran cambios en los pesos más allá del esquema de factorización y empaquetado. El proceso de compresión usa zstd con verificación CRC32, lo que sugiere un enfoque orientado a integridad y portabilidad del artefacto más que a optimización de inferencia en GPU convencional.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base `SakanaAI/ctm-maze-large`, aunque la model card no especifica tareas concretas ni evaluaciones.
- Ejecución en runtime JouleDB: el modelo está empaquetado para el runtime de inferencia sin PyTorch de JouleDB, lo que permite servirlo en entornos Kubernetes-native.
- Compresión sub-1-bit: capacidad de almacenar y cargar pesos con un promedio de 0,1960 BPW, adecuada para entornos con memoria muy limitada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Despliegue en clústeres Kubernetes con recursos restringidos: el artefacto de 2,40 MB puede distribuirse y cargarse en pods con límites de memoria muy bajos, usando JouleKube como sustrato de agentes.
- Inferencia en dispositivos edge o embebidos: la compresión sub-1-bit permite ejecutar un modelo de 32 millones de parámetros en hardware con pocos megabytes de almacenamiento y memoria, siempre que se use el runtime JouleDB.
- Pruebas de integración en pipelines CI/CD: el tamaño reducido y el checksum CRC32 facilitan validar la integridad del artefacto en cada despliegue.
- Archivado y versionado de modelos: el formato `.jsyn` con zstd permite almacenar múltiples variantes de un modelo base con un coste de almacenamiento mínimo.
- Investigación en cuantización extrema: sirve como referencia reproducible para estudiar el impacto de 0,1960 BPW en la calidad de salida frente al modelo base original.
- Prototipado de agentes ligeros: para experimentar con flujos de agente en JouleDB sin requerir GPUs dedicadas, usando el modelo como componente de razonamiento de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del artefacto es de 2,40 MB, pero la VRAM necesaria depende del runtime JouleDB y de la arquitectura del modelo base, que no se detalla.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU consumer? No hay datos que lo confirmen; el tamaño del artefacto sugiere que sí en términos de almacenamiento, pero se desconoce el requisito de memoria en ejecución.
- Opciones de despliegue: JouleDB (`jouledb serve --http-addr 127.0.0.1:8080`), con soporte para `db.hf_pull(...)` desde Hugging Face; no se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sakana-CTM-Maze-Large-LittleBit | 32.001.530 | no disponible | Apache 2.0 | `.jsyn` (sub-1-bit) | Compresión 0,1960 BPW, 2,40 MB |
| SakanaAI/ctm-maze-large | no disponible | no disponible | Apache 2.0 | no disponible | Modelo base original |
| Otros modelos de ~32M parámetros | no disponible | no disponible | no disponible | no disponible | No se dispone de comparativas publicadas en la información proporcionada |

No se dispone de datos de rendimiento de alternativas comparables en la información disponible.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base ni del proceso de compresión.
- Riesgo de alucinación: no evaluado; al ser una recompresión de un modelo pequeño (32M parámetros) y con cuantización extrema, la degradación de calidad frente al original es plausible pero no está medida.
- Limitaciones de contexto e idioma: no disponibles.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la atribución al modelo base `SakanaAI/ctm-maze-large` y revisar los términos del proyecto JouleDB.
- El formato `.jsyn` es propietario de JouleDB; no es compatible con runtimes estándar como PyTorch, vLLM o llama.cpp, lo que limita su portabilidad.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-24), lo que indica que no ha sido validado por la comunidad.
- No se declaran evaluaciones de calidad, por lo que no se recomienda su uso en producción sin una validación previa frente al modelo base.

## Enlaces

- [Hugging Face: dcharlot65-openie/Sakana-CTM-Maze-Large-LittleBit](https://huggingface.co/dcharlot65-openie/Sakana-CTM-Maze-Large-LittleBit)
- [Modelo base: SakanaAI/ctm-maze-large](https://huggingface.co/SakanaAI/ctm-maze-large)
- [Repositorio JouleDB](https://github.com/openIE-dev/jouledb)
