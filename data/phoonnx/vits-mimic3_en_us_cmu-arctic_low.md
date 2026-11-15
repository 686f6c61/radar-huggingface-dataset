# Phoonnx/vits-mimic3_en_US_cmu-arctic_low

## Resumen

`vits-mimic3_en_US_cmu-arctic_low` es un modelo de síntesis de voz (text-to-speech) en formato ONNX, derivado del repositorio agregador `Phoonnx/phoonnx-vits`. Se trata de una conversión del modelo VITS originalmente distribuido con Mycroft Mimic 3, entrenado sobre el corpus CMU Arctic en su variante de calidad baja (`low`), para inglés estadounidense (`en_US`). El autor del repositorio es Phoonnx, y el modelo está pensado para su uso con la librería `phoonnx`, un motor de inferencia TTS basado en ONNX.

El modelo resuelve el problema de la síntesis de voz local y ligera: al estar exportado a ONNX y tener un tamaño de repositorio de aproximadamente 0,1 GB, puede ejecutarse en CPU sin necesidad de GPU, lo que lo hace adecuado para integraciones en aplicaciones de escritorio, asistentes locales o pipelines de generación de audio por lotes. La variante `low` implica una configuración de menor calidad acústica y menor coste computacional que las variantes de mayor fidelidad del mismo corpus.

La relevancia de esta ficha es acotada: se trata de un artefacto derivado, con cero descargas y cero likes en el momento de la consulta, sin model card propia más allá de una referencia al repositorio de origen, y sin datos publicados de benchmarks, idiomas adicionales ni parámetros. Toda la información técnica disponible proviene de los metadatos del repositorio y de la model card del proyecto matriz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | inglés estadounidense (`en_US`), según el identificador del modelo; la model card no lista idiomas adicionales |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura es VITS, un modelo generativo end-to-end que combina un encoder de texto, un prior normalizing flow, un decoder basado en HiFi-GAN y un discriminador adversarial entrenado de forma conjunta. VITS se caracteriza por generar audio de forma directa desde fonemas o texto sin necesidad de un vocoder separado en inferencia, lo que reduce la latencia y simplifica el despliegue. En este caso, el modelo se distribuye como grafo ONNX, lo que permite ejecución con ONNX Runtime en CPU o GPU.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset más allá de la referencia al corpus CMU Arctic, ni sobre si se aplicaron etapas de RLHF, DPO o ajuste fino adicional. La variante `low` del nombre indica una configuración de menor capacidad o de menor resolución acústica dentro de la familia Mimic 3, pero el repositorio no detalla los hiperparámetros concretos (dimensión latente, número de capas, tasa de muestreo de audio). El modelo procede de la carpeta `mimic3__en_US__cmu-arctic_low` del repositorio `Phoonnx/phoonnx-vits`, y conserva las rutas de archivo originales.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense (`en_US`).
- Generación de audio mediante inferencia ONNX, sin dependencia de frameworks de deep learning pesados.
- Ejecución en CPU, adecuada para entornos sin GPU.
- Integración con la librería `phoonnx`, que expone el modelo mediante el identificador de voz `mimic3/en_US/cmu-arctic_low`.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo TTS).
- No se documentan capacidades multilingües más allá del inglés estadounidense.
- No se documentan modos especiales como thinking mode, visión o audio de entrada.

## Casos de uso

- Síntesis de voz en aplicaciones de escritorio: el modelo puede integrarse mediante `phoonnx` y ONNX Runtime para leer texto de interfaz, notificaciones o documentos sin conexión a servicios en la nube, gracias a su tamaño reducido (~0,1 GB) y a la ejecución en CPU.
- Asistentes locales y domóticos: al no requerir GPU ni conectividad, encaja en dispositivos de recursos limitados (Raspberry Pi, mini-PC) para respuestas habladas en inglés en asistentes de voz autoalojados.
- Generación de audio por lotes: útil para producir locuciones de prueba, audiolibros de prototipo o contenido de accesibilidad a partir de grandes volúmenes de texto, donde la variante `low` prioriza el rendimiento sobre la fidelidad acústica.
- Pruebas de regresión en pipelines TTS: al ser un artefacto ONNX versionado, sirve como referencia estable para validar cambios en el front-end de texto a fonemas o en el motor de inferencia.
- Accesibilidad web y de aplicaciones: lectura en voz alta de contenido para usuarios con discapacidad visual en entornos donde no se permite enviar texto a APIs externas por motivos de privacidad.
- Prototipado de interfaces conversacionales: generación rápida de respuestas habladas en inglés para validar flujos de diálogo antes de invertir en un modelo TTS de mayor calidad o en un servicio comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (~0,1 GB) y la naturaleza ONNX del modelo, se espera que quepa holgadamente en memoria de CPU y en cualquier GPU consumer, pero no se documentan cifras oficiales.
- GPU recomendadas: no disponible; el modelo está diseñado para ejecución en CPU mediante ONNX Runtime.
- ¿Cabe en GPU consumer? Sí, con alta probabilidad dado el tamaño del artefacto, aunque no se confirma en la documentación.
- Opciones de despliegue: `phoonnx` (librería indicada en los metadatos) sobre ONNX Runtime; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tamaño | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-mimic3_en_US_cmu-arctic_low` | VITS (ONNX) | ~0,1 GB (repo) | en_US | MIT | ONNX | Variante `low` de Mimic 3 sobre CMU Arctic |
| Piper (voces `en_US`) | VITS (ONNX) | del orden de decenas de MB por voz | múltiples (por voz) | MIT / otras según voz | ONNX | Ecosistema amplio de voces ligeras para CPU; no se dispone de comparación numérica publicada en esta ficha |
| Mycroft Mimic 3 (voces originales) | VITS | no disponible | múltiples | varía por voz | varios | Proyecto de origen del modelo; este repositorio es una conversión/derivado |
| Coqui TTS (modelos VITS) | VITS | no disponible | múltiples | MPL-2.0 / otras | PyTorch, ONNX en algunos casos | Framework generalista; no se dispone de comparación numérica |

No se dispone de datos de rendimiento comparativo (MOS, RTF, WER) en la información proporcionada, por lo que la comparativa se limita a parámetros estructurales y de licencia.

## Limitaciones y advertencias

- Modelo derivado y de nicho: cero descargas y cero likes en el momento de la consulta, sin model card propia; la documentación depende del repositorio matriz `Phoonnx/phoonnx-vits`.
- Calidad acústica limitada: la variante `low` está orientada a bajo coste computacional, no a máxima fidelidad; no se publican métricas MOS que lo cuantifiquen.
- Cobertura lingüística restringida al inglés estadounidense; no se documentan otros idiomas.
- Sin datos publicados sobre sesgos: no se documenta la composición demográfica de los hablantes del corpus CMU Arctic ni posibles sesgos de prosodia o acento.
- Riesgo de alucinación no aplicable en el sentido de texto generado, pero sí de artefactos acústicos, pronunciaciones incorrectas y fallos en palabras fuera del vocabulario o en texto no normalizado.
- Licencia MIT declarada en los metadatos del repositorio, pero la model card del proyecto matriz advierte que las licencias siguen a los originales por subcarpeta y que algunas voces del repositorio matriz carecen de licencia declarada; conviene verificar la procedencia concreta de la carpeta `mimic3__en_US__cmu-arctic_low` antes de un uso comercial.
- Sin garantías de mantenimiento: el repositorio no documenta versionado, changelog ni soporte; la fecha de creación y actualización es la misma (2026-11-14), lo que sugiere una publicación puntual sin iteraciones posteriores.
- Para producción, se recomienda validar la inteligibilidad y la naturalidad con muestras propias, dado que no hay benchmarks ni demos publicadas en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-mimic3_en_US_cmu-arctic_low
- Repositorio matriz de voces: https://huggingface.co/Phoonnx/phoonnx-vits
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Corpus CMU Arctic (referencia del nombre del modelo): no disponible en la información proporcionada
- Mycroft Mimic 3 (proyecto de origen): no disponible en la información proporcionada
