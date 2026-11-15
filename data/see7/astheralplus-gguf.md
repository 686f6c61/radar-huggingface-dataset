# SEE7/AstheralPlus-GGUF

## Resumen

AstheralPlus-GGUF es la versión cuantizada en formato GGUF del modelo SEE7/AstheralPlus, publicada por el usuario SEE7. El repositorio contiene una única cuantización de tipo imatrix generada con llama.cpp (commit `5676dfbe01e7ebe0387913680eee0ed39bf4a363`), pensada para su uso con motores de inferencia compatibles con GGUF como llama.cpp u Ollama. El modelo base parte de pesos de expertos en formato nativo MXFP4, lo que sugiere una arquitectura de mezcla de expertos (MoE), aunque la model card no detalla la topología.

El dato más llamativo es el tamaño: el repositorio ocupa 0,1 GB y el fichero cuantizado pesa 0,056 GB. El campo de parámetros totales en safetensors indica 14.025.336, una cifra que resulta anómala para un modelo con pesos MXFP4 y que probablemente refleja un recuento parcial o un error de metadatos del repositorio. No hay información pública sobre el pipeline, los idiomas soportados ni resultados de evaluación.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de cuantización recién publicado (14 de noviembre de 2026), sin descargas ni interacciones, útil únicamente como referencia para quien quiera reproducir el proceso de cuantización imatrix sobre un modelo base con pesos MXFP4 o evaluar el propio modelo AstheralPlus en un entorno de bajos recursos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (el modelo base usa pesos de expertos en formato nativo MXFP4, lo que sugiere MoE; topología no especificada) |
| Parámetros totales | 14.025.336 (según metadatos de safetensors; cifra no verificada y potencialmente inconsistente con el tamaño del repo) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | imatrix (una única variante: `AstheralPlus-i1-imatrix.gguf`, 0,056 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantización); el modelo base emplea pesos MXFP4 en los expertos |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base AstheralPlus más allá de la mención a pesos de expertos en formato nativo MXFP4, lo que apunta a un diseño de mezcla de expertos con cuantización de baja precisión integrada en el entrenamiento o en la conversión. La model card no especifica número de capas, dimensión oculta, número de expertos ni mecanismo de atención.

Respecto al entrenamiento, no hay datos sobre volumen de tokens, composición del corpus ni uso de RLHF o DPO. La única información técnica concreta es el proceso de cuantización: los datos de importancia (imatrix) se recogen mediante pasadas forward reales sobre una muestra determinista, multilingüe y de instrucciones del dataset `SEE7/AstheralDataset`. El conversor preserva los pesos MXFP4 originales antes de aplicar cada receta de cuantización, y debido a las dimensiones de los tensores se requieren formatos mixtos en varias recetas; el fichero `manifest.json` del repositorio registra el hash del corpus, la configuración de chunks, los formatos exactos de cada tensor y los SHA-256 de los ficheros.

## Capacidades

- Generación de texto: no hay documentación específica sobre capacidades del modelo base; la model card no las detalla.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: la muestra de calibración se describe como multilingüe, pero no se enumeran los idiomas cubiertos.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Evaluación de cuantización imatrix: el artefacto permite reproducir y comparar el efecto de la calibración imatrix sobre un modelo con pesos MXFP4, verificando la fidelidad de los formatos mixtos registrados en `manifest.json`.
- Inferencia en entornos con recursos muy limitados: con 0,056 GB de peso, el fichero puede cargarse en dispositivos de borde, Raspberry Pi o contenedores sin GPU para pruebas de viabilidad del pipeline.
- Pruebas de integración con llama.cpp: sirve para validar la compatibilidad de una build concreta de llama.cpp (commit `5676dfbe...`) con GGUF que contienen formatos de tensor mixtos.
- Auditoría de cadena de suministro de modelos: los hashes SHA-256 y el manifiesto permiten verificar la integridad del proceso de conversión y detectar manipulaciones.
- Prototipado rápido de aplicaciones de chat: útil para levantar un servicio de generación de texto de bajo coste en fase de desarrollo, siempre que se valide la calidad del modelo base.
- Docencia y experimentación: ejemplo práctico de flujo completo de cuantización (selección de dataset de calibración, recolección de importancias, conversión y validación estructural) para cursos de IA open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 0,1 GB para el fichero cuantizado; el modelo base en precisión completa requeriría un cálculo no disponible al no conocerse la configuración real de parámetros.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente para el fichero GGUF; no se requiere GPU dedicada.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo e incluso en CPU.
- Opciones de despliegue: llama.cpp (versión compatible con el commit indicado), Ollama y otros motores que acepten GGUF; vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponibles; dependerán del hardware y del motor, pero el tamaño reducido sugiere latencias muy bajas en CPU.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría, tamaño o tarea.

## Limitaciones y advertencias

- La cifra de parámetros totales (14.025.336) es inconsistente con el tamaño del repositorio (0,1 GB) y con pesos MXFP4; debe tratarse como dato no fiable hasta verificación.
- No hay información sobre sesgos, calidad de generación ni comportamiento del modelo base; no se recomienda su uso en producción sin una evaluación previa.
- Riesgo de alucinación desconocido; sin benchmarks ni evaluaciones publicadas no puede estimarse.
- Cobertura lingüística no documentada; la calibración multilingüe no garantiza calidad en idiomas concretos.
- La licencia Apache 2.0 permite uso comercial, pero al ser una cuantización de un modelo base del que no se detallan términos adicionales, conviene revisar la licencia del modelo original.
- El repositorio tiene cero descargas y cero interacciones; no hay evidencia de uso comunitario ni de validación independiente.
- La cuantización imatrix depende de un dataset de calibración concreto; el rendimiento puede degradarse en dominios alejados de esa muestra.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SEE7/AstheralPlus-GGUF
- Modelo base: https://huggingface.co/SEE7/AstheralPlus/tree/66e156dbb50e358c0e5e5697e9e1e9c68c5a1cd5
- Dataset de calibración: https://huggingface.co/datasets/SEE7/AstheralDataset/tree/9332074b5fdd649fa210353d263dc156e80c3f19
- Manifiesto de cuantización: https://huggingface.co/SEE7/AstheralPlus-GGUF/blob/main/manifest.json
