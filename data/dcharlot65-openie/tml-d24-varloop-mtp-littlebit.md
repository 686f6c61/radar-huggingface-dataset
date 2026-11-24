# dcharlot65-openie/TML-d24-VarLoop-MTP-LittleBit

## Resumen

`TML-d24-VarLoop-MTP-LittleBit` es un checkpoint de pesos "vivos" (living weights) publicado por el usuario `dcharlot65-openie` a partir del modelo de investigación `thinkingmachines/TML-d24-varloop-research`. No se trata de un modelo entrenado desde cero, sino de una re-factorización del modelo base mediante una combinación de las técnicas LittleBit-2 y Sakana SVF, empaquetada en formato `.jsyn` para su uso con JouleDB, una base de datos termodinámica y runtime de inferencia sin PyTorch.

El interés principal del artefacto es su perfil de compresión extrema: 317.897.872 parámetros almacenados en un fichero de 6,03 MB con una media de 0,0493 bits por peso (BPW), lo que supone una reducción de 100,60x respecto al equivalente en FP16 (606,34 MB). Esto lo sitúa en la categoría de modelos sub-1-bit, una línea de investigación centrada en representaciones de pesos de muy baja precisión.

La relevancia es fundamentalmente experimental: el repositorio tiene 0 descargas y 0 likes, el tamaño del repo reportado es de 0,0 GB y no se publican resultados de benchmarks, idiomas soportados ni detalles de entrenamiento más allá de la procedencia del modelo base. Debe evaluarse como artefacto de investigación, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de `thinkingmachines/TML-d24-varloop-research`) |
| Parametros totales | 317.897.872 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el artefacto se distribuye ya comprimido en `.jsyn` con 0,0493 BPW (zstd + CRC32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.jsyn` (JouleDB); no se distribuyen safetensors ni GGUF |

Datos adicionales del perfil de compresión declarados por el autor:

| Metrica | Valor |
|---|---|
| Tensores 2D en bitplanes | 31 |
| Vectores 1D (LayerNorm / bias / depthwise) | 23 |
| Tamano equivalente en FP16 | 606,34 MB |
| Tamano comprimido `.jsyn` | 6,03 MB |
| Factor de compresion | 100,60x |
| Bits por peso medios | 0,0493 BPW |
| `model_id` interno | `tml-d24-varloop-mtp` |
| Libreria | jouledb |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `thinkingmachines/TML-d24-varloop-research`: la model card no describe si se trata de un transformer denso, un MoE, un modelo híbrido o un SSM, ni detalla el número de capas, dimensión oculta o mecanismo de atención. Tampoco se documentan los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO.

Lo que sí describe la model card es el proceso de transformación aplicado: el checkpoint se presenta como una combinación pre-factorizada de LittleBit-2 y Sakana SVF sobre el modelo base. LittleBit-2 corresponde a la línea de representaciones de pesos sub-1-bit, y SVF (singular value fine-tuning) es la técnica de adaptación mediante factores de valores singulares popularizada por Sakana AI. El resultado se almacena en 31 tensores 2D codificados como bitplanes más 23 vectores 1D (LayerNorm, bias y depthwise) que se mantienen en mayor precisión, todo ello empaquetado con compresión zstd y verificación CRC32.

La innovación destacable no está en el entrenamiento sino en el formato y el runtime: el artefacto está diseñado para JouleDB, un sustrato "kubernetes-native" con runtime de inferencia sin PyTorch. No se aportan detalles sobre decodificación especulativa, atención lineal ni otras optimizaciones de inferencia.

## Capacidades

- No se documentan capacidades específicas del modelo en la información disponible.
- No hay confirmación de soporte de tool calling ni function calling.
- No hay confirmación de soporte de agentes o razonamiento multi-paso.
- No se especifican capacidades multilingües ni idiomas cubiertos.
- No se declara modo thinking, visión, audio ni otras capacidades especiales.
- La única capacidad verificable del artefacto es la de ser cargado y servido por el runtime JouleDB v0.2.4 o superior mediante `hf_pull`.

## Casos de uso

- Evaluación de técnicas de compresión sub-1-bit: el checkpoint permite reproducir el pipeline LittleBit-2 + SVF sobre el modelo base y medir la degradación de calidad a 0,0493 BPW en un entorno controlado.
- Investigación en runtimes sin PyTorch: sirve para probar JouleDB como motor de inferencia alternativo, incluyendo la carga vía `hf_pull` y el servicio HTTP en `127.0.0.1:8080`.
- Despliegue en entornos con restricciones extremas de almacenamiento: con 6,03 MB de artefacto, es viable distribuirlo en imágenes de contenedor o nodos de borde donde un checkpoint FP16 de 606 MB sería inviable.
- Pruebas de integración en Kubernetes: el tag `kubernetes-native` y el componente JouleKube permiten ensayar el ciclo de vida del modelo como recurso del clúster (descarga, versionado, servicio).
- Estudio de la factorización SVF: el artefacto permite inspeccionar cómo se materializan los factores de valores singulares en un checkpoint real y compararlos con el modelo base.
- Docencia y divulgación sobre cuantización extrema: útil para ilustrar de forma tangible qué significa 0,0493 BPW y qué se gana y se pierde frente a FP16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo aporta métricas de compresión (tamaño, BPW, factor de reducción), no de calidad de tarea (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM estimada: no disponible. El artefacto ocupa 6,03 MB en disco, pero se desconoce el pico de memoria durante la descompresión y la inferencia en JouleDB.
- GPU recomendadas: no disponibles. No se especifica ningún requisito de aceleración.
- Compatibilidad con GPU de consumo: no confirmada; el runtime JouleDB no documenta en esta ficha sus backends de cómputo.
- Opciones de despliegue: JouleDB v0.2.4+ (`cargo binstall jouledb`, `jouledb serve --http-addr 127.0.0.1:8080`). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato `.jsyn` no es compatible con ellos de forma nativa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (sub-1-bit con runtime propietario) con especificaciones verificables. El modelo base `thinkingmachines/TML-d24-varloop-research` sería la referencia natural, pero no se dispone de sus parámetros, contexto ni licencia más allá de la atribución Apache 2.0.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evidencia publicada sobre la calidad del modelo tras la compresión a 0,0493 BPW.
- Riesgo alto de degradación funcional: una media de 0,0493 bits por peso implica una representación extremadamente agresiva; la fidelidad respecto al modelo base no está validada.
- Sesgos: no documentados. Al desconocerse los datos de entrenamiento del modelo base, no es posible evaluar sesgos.
- Riesgo de alucinación: no cuantificado; sin benchmarks ni evaluación cualitativa, no puede descartarse.
- Idiomas: no se declara ningún idioma soportado, por lo que no puede asumirse cobertura multilingüe ni siquiera en inglés.
- Dependencia de un runtime específico: el formato `.jsyn` solo se carga con JouleDB, una herramienta de nicho con 0 descargas en este modelo; no hay interoperabilidad con el ecosistema estándar (transformers, llama.cpp, vLLM).
- Madurez del artefacto: 0 descargas, 0 likes, repo de 0,0 GB reportado y ausencia de pipeline declarado; no hay señales de uso o validación por terceros.
- Licencia: Apache 2.0 permite uso comercial, pero la atribución al modelo base y la ausencia de garantías sobre el comportamiento del checkpoint comprimido trasladan todo el riesgo al integrador.
- Fechas del repositorio: creado y actualizado el 2026-11-23, sin historial posterior de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dcharlot65-openie/TML-d24-VarLoop-MTP-LittleBit
- Modelo base: https://huggingface.co/thinkingmachines/TML-d24-varloop-research
- Repositorio de JouleDB: https://github.com/openIE-dev/jouledb
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
