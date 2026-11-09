# OptimaMT/es-de

## Resumen

OptimaMT/es-de es una conversión a ONNX del modelo de traducción automática Xenova/opus-mt-es-de, a su vez derivado del modelo OPUS-MT de la Universidad de Helsinki para el par español-alemán. Lo desarrolla OptimaMT, un proyecto que publica 49 pares de traducción bajo el mismo esquema de nombres (`OptimaMT/<src>-<tgt>`). El modelo no introduce pesos nuevos: es una copia byte a byte de los ficheros originales salvo el decoder fusionado y cuantizado, que se reconstruye con un grafo ligeramente distinto para reducir el consumo de memoria.

La relevancia de esta ficha no está en la calidad de traducción (idéntica al modelo base, ya que los tokens generados son los mismos) sino en la optimización del despliegue en el navegador y en entornos con poca memoria. Según la model card, tras la carga el consumo baja de 516 a 277 MiB en Linux (-46 %) y de 492 a 253 MiB en Windows (-49 %) con `disable_quant_qdq = 1`, y entre un 15 % y un 22 % con los valores por defecto de ONNX Runtime. El repositorio ocupa 0,1 GB y está pensado para ejecutarse con transformers.js y ONNX Runtime en CPU.

Se trata de un transformer encoder-decoder de tipo Marian, con un vocabulario de 61.301 tokens, licencia CC BY 4.0 y soporte exclusivo para español y alemán. No hay datos publicados sobre número de parámetros ni longitud de contexto en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, familia OPUS-MT) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | ONNX cuantizado (q8 en el ejemplo de uso); decoder fusionado cuantizado |
| Idiomas soportados | español (es), alemán (de) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`onnx/decoder_model_merged_quantized.onnx` y resto de ficheros originales) |

## Arquitectura y entrenamiento

El modelo es un Marian encoder-decoder, la arquitectura estándar de la familia OPUS-MT de Helsinki-NLP. Los pesos proceden de `Helsinki-NLP/opus-mt-es-de` y la exportación a ONNX de `Xenova/opus-mt-es-de` en la revisión `7f493e4b81b6`. OptimaMT no reentrena ni ajusta el modelo: la única modificación es un cambio de grafo en el decoder, moviendo la proyección de salida fuera de sus dos ramas, y la reconstrucción del decoder fusionado cuantizado. Todos los demás ficheros son idénticos byte a byte a los originales.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO; son datos que corresponden al modelo OPUS-MT original y no se detallan en la model card. La innovación técnica destacable es exclusivamente de despliegue: la reducción de memoria tras la carga manteniendo tokens de salida idénticos, verificada con ONNX Runtime 1.31.1 en CPU con 4 hilos (Linux nativo, Windows en máquina virtual).

## Capacidades

- Traducción de texto de español a alemán, en modo texto a texto (`text2text-generation`).
- Generación determinista idéntica al modelo base: la model card afirma que los tokens producidos son los mismos.
- Ejecución en navegador mediante transformers.js con `dtype: "q8"` y opciones de sesión de ONNX Runtime.
- Ejecución en Python mediante ONNX Runtime, SentencePiece y NumPy (script `translate.py`).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades de visión ni audio.
- Multilingüe limitado al par es-de; no cubre otros idiomas.
- No dispone de modo thinking ni capacidades especiales más allá de la traducción.

## Casos de uso

- Traducción en el navegador sin backend: con transformers.js y el decoder cuantizado, el modelo se carga en una pestaña y traduce localmente, evitando enviar texto del usuario a un servidor y reduciendo el consumo de memoria a unos 277 MiB en Linux.
- Traducción por lotes en entornos con poca RAM: el ahorro del 46-49 % con `disable_quant_qdq = 1` permite ejecutar el modelo en contenedores pequeños o en máquinas virtuales con memoria ajustada.
- Preprocesado multilingüe en pipelines de datos: traducción de corpus españoles a alemán antes de indexación o análisis, ejecutada en CPU con ONNX Runtime y 4 hilos.
- Traducción embebida en aplicaciones de escritorio: al ocupar 0,1 GB el repositorio y ejecutarse en CPU, se puede empaquetar en aplicaciones Electron o similares sin depender de GPU.
- Prototipado rápido de funcionalidades de traducción: el script `translate.py` permite validar el par es-de en local con un solo comando antes de integrar un servicio de traducción en producción.
- Traducción de documentación técnica interna: uso en herramientas de documentación que necesitan convertir guías en español a alemán de forma reproducible, con la garantía de que la salida es idéntica al modelo OPUS-MT de referencia.
- Evaluación comparativa de despliegue: sirve como caso de estudio para medir el impacto del cambio de grafo del decoder en memoria y latencia frente al ONNX original de Xenova.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo aporta métricas de memoria tras la carga, no de calidad de traducción (BLEU, COMET u otras):

| Métrica | Linux | Windows | Tokens idénticos |
|---|---:|---:|---|
| Memoria con `disable_quant_qdq = 1` | 516 → 277 MiB (-46 %) | 492 → 253 MiB (-49 %) | sí |
| Memoria con valores por defecto de ONNX Runtime | 276 → 216 MiB (-22 %) | 196 → 165 MiB (-15 %) | sí |

Medición con ONNX Runtime 1.31.1, CPU, 4 hilos (Linux nativo; Windows en máquina virtual).

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para CPU. Consumo de memoria tras la carga de 165-277 MiB según plataforma y configuración.
- GPU recomendadas: no disponibles; no se documenta uso de GPU.
- Cabe en cualquier equipo de consumo: el repositorio ocupa 0,1 GB y la memoria en ejecución ronda los 200-280 MiB.
- Opciones de despliegue: transformers.js (navegador o Node.js) y ONNX Runtime en Python mediante `translate.py`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| OptimaMT/es-de | Marian (ONNX) | es → de | ONNX cuantizado | CC BY 4.0 | Decoder fusionado optimizado; mismo token de salida que el base |
| Xenova/opus-mt-es-de | Marian (ONNX) | es → de | ONNX | CC BY 4.0 | Modelo base de esta conversión; mayor consumo de memoria |
| Helsinki-NLP/opus-mt-es-de | Marian (PyTorch) | es → de | safetensors/PyTorch | CC BY 4.0 | Modelo original de la Universidad de Helsinki; requiere PyTorch |

Los tres modelos comparten pesos y calidad de traducción. La diferencia está en el formato y en el consumo de memoria: OptimaMT reduce la memoria tras la carga frente a Xenova, y ambos están orientados a ONNX frente al original en PyTorch.

## Limitaciones y advertencias

- Modelo de traducción unidireccional es → de; no traduce de alemán a español ni cubre otros pares.
- No hay datos publicados sobre sesgos; al derivar de OPUS-MT, hereda los sesgos de los corpus paralelos usados en su entrenamiento original.
- Riesgo de alucinación y de traducciones incorrectas en dominios especializados, frases ambiguas o texto con ruido, sin métricas publicadas que lo cuantifiquen.
- Longitud de contexto no documentada; textos largos pueden requerir fragmentación.
- La licencia CC BY 4.0 permite uso comercial con atribución; es obligatorio citar a OPUS-MT (Universidad de Helsinki), a Xenova por la exportación ONNX y a OptimaMT por la modificación del decoder.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en producción.
- La validación de equivalencia de tokens se limita a las pruebas del autor con ONNX Runtime 1.31.1 en CPU; no se documentan pruebas en GPU ni en otros entornos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/es-de
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe del método: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Modelo base ONNX: https://huggingface.co/Xenova/opus-mt-es-de
- Modelo original OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-es-de
