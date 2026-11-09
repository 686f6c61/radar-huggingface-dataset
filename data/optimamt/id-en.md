# OptimaMT/id-en

## Resumen

OptimaMT/id-en es una conversión a ONNX del modelo de traducción automática Xenova/opus-mt-id-en, que a su vez es una exportación del modelo OPUS-MT de la Universidad de Helsinki para la dirección indonesio → inglés. El modelo original se basa en la arquitectura Marian (transformer encoder-decoder) y está pensado exclusivamente para traducción. La aportación de OptimaMT consiste en una modificación del grafo del decodificador fusionado que reduce el consumo de memoria en tiempo de inferencia sin alterar los pesos ni los tokens generados.

El modelo está empaquetado para su uso con transformers.js y ONNX Runtime, lo que lo hace adecuado para despliegues en navegador o en entornos Node.js sin necesidad de infraestructura de GPU. Según la model card, la versión modificada reduce el uso de memoria entre un 45 % y un 48 % en Linux y Windows con `disable_quant_qdq = 1`, y entre un 15 % y un 21 % con los valores por defecto de ONNX Runtime, manteniendo una salida de tokens idéntica.

Es relevante para desarrolladores que necesiten traducción indonesio-inglés ligera y determinista en el cliente, sin dependencias de servicios en la nube, y que valoren el ahorro de memoria en dispositivos con recursos limitados. El repositorio ocupa aproximadamente 0,1 GB y la licencia es CC BY 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8 en el ejemplo de uso); el autor menciona `disable_quant_qdq` |
| Idiomas soportados | indonesio (id), inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`onnx/decoder_model_merged_quantized.onnx` reconstruido; resto de archivos idénticos al original) |

## Arquitectura y entrenamiento

El modelo es un Marian de traducción, es decir, un transformer encoder-decoder entrenado específicamente para traducción automática. No se dispone de información sobre el número de parámetros totales, el volumen de tokens de entrenamiento ni la composición del dataset en la información proporcionada. El modelo base es OPUS-MT de la Universidad de Helsinki, y la exportación a ONNX corre a cargo de Xenova en la revisión `c38ef36c843b`.

La innovación técnica de esta ficha concreta no está en el entrenamiento, sino en la modificación del grafo: la proyección de salida del decodificador se ha movido fuera de sus dos ramas, lo que permite reducir el uso de memoria en inferencia. El vocabulario tiene 54.796 tokens. No se menciona el uso de RLHF, DPO ni técnicas de decodificación especulativa. El único archivo reconstruido es el decodificador fusionado cuantizado; el resto de archivos son byte a byte los originales.

## Capacidades

- Traducción automática de indonesio a inglés.
- Generación de texto condicionada a la tarea de traducción (text2text-generation).
- Ejecución en navegador y en Node.js mediante transformers.js y ONNX Runtime.
- Inferencia en CPU con soporte para múltiples hilos (el autor reporta pruebas con 4 hilos).
- Salida determinista respecto al modelo original: los tokens generados son idénticos según la model card.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Traducción de contenido editorial indonesio a inglés en el cliente: el modelo puede ejecutarse en el navegador con transformers.js, lo que permite traducir artículos o textos sin enviar datos a un servidor externo.
- Localización de interfaces y documentación: integrado en un pipeline de build, traduce cadenas de recursos del indonesio al inglés antes de publicar, con la ventaja de que el modelo es pequeño (repo de 0,1 GB) y cabe en contenedores ligeros.
- Procesamiento de reseñas y soporte al cliente: traducción por lotes de mensajes de usuarios indonesios a inglés para su análisis posterior por equipos que no dominan el idioma.
- Herramientas de traducción asistida en el navegador: extensión o web app que ofrezca traducción instantánea de fragmentos seleccionados, aprovechando la reducción de memoria del decodificador fusionado.
- Investigación en traducción automática de bajo recursos: el modelo sirve como línea base reproducible para experimentos con Marian y comparaciones de cuantización ONNX.
- Despliegue en dispositivos con memoria limitada: la reducción de 472 a 258 MiB en Linux con `disable_quant_qdq = 1` permite ejecutarlo en entornos donde otras variantes no cabrían.
- Evaluación de pipelines ONNX Runtime: útil como caso de prueba para medir el impacto de opciones de sesión como `disable_quant_qdq` en latencia y memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de memoria tras la carga:

| Configuracion | Linux | Windows | Tokens identicos |
|---|---:|---:|---|
| `disable_quant_qdq = 1` | 472 → 258 MiB (-45 %) | 449 → 235 MiB (-48 %) | si |
| ONNX Runtime por defecto | 254 → 201 MiB (-21 %) | 181 → 155 MiB (-15 %) | si |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario reportado; el modelo se ejecuta en CPU. El consumo de memoria tras la carga es de 155–258 MiB según configuración y sistema operativo.
- GPU recomendadas: no disponibles; el autor documenta pruebas en CPU con ONNX Runtime 1.31.1 y 4 hilos.
- Cabe en cualquier equipo de consumo: el repositorio ocupa 0,1 GB y el uso de memoria es inferior a 300 MiB en los escenarios medidos.
- Opciones de despliegue: transformers.js con ONNX Runtime (navegador o Node.js); el autor incluye un script Python `translate.py` basado en onnxruntime, sentencepiece y numpy.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OptimaMT/id-en | no disponible | no disponible | CC BY 4.0 | ONNX | Decodificador fusionado optimizado en memoria |
| Xenova/opus-mt-id-en | no disponible | no disponible | CC BY 4.0 | ONNX | Modelo base de la exportación; sin la optimización de memoria |
| Helsinki-NLP/opus-mt-id-en | no disponible | no disponible | CC BY 4.0 | safetensors/PyTorch | Modelo original de OPUS-MT |

## Limitaciones y advertencias

- Solo traduce indonesio → inglés; no soporta otras direcciones ni otros pares de idiomas.
- No se dispone de información sobre sesgos del modelo base OPUS-MT en esta ficha; se recomienda consultar la model card original.
- Riesgo de alucinación y de traducciones incorrectas inherente a los modelos Marian de traducción, especialmente en dominios especializados.
- No se documentan límites de longitud de contexto; conviene validar el comportamiento con textos largos antes de usarlo en producción.
- La licencia CC BY 4.0 exige atribución; es compatible con uso comercial siempre que se cumplan las condiciones de la licencia.
- El modelo está pensado para inferencia en CPU con ONNX Runtime; no se han publicado métricas de latencia ni throughput.
- La optimización de memoria depende de la opción `disable_quant_qdq` y de la versión de ONNX Runtime; cambios de versión podrían alterar el comportamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria adicional.

## Enlaces

- [OptimaMT/id-en en Hugging Face](https://huggingface.co/OptimaMT/id-en)
- [Xenova/opus-mt-id-en](https://huggingface.co/Xenova/opus-mt-id-en)
- [Helsinki-NLP/opus-mt-id-en](https://huggingface.co/Helsinki-NLP/opus-mt-id-en)
- [Repositorio OptimaMT en GitHub](https://github.com/AmerAlreyahi/OptimaMT)
- [REPORT.md del proyecto](https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md)
- [Script translate.py](https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py)
- [Resultados interactivos en Hugging Face Spaces](https://huggingface.co/spaces/OptimaMT/results)
