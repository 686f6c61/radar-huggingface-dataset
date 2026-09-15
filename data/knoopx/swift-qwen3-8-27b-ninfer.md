# knoopx/Swift-Qwen3.8-27B-NInfer

## Resumen

Swift-Qwen3.8-27B-NInfer es un artefacto de inferencia cuantizado y empaquetado en un único fichero `.ninfer`, derivado del finetune multimodal Swift-Qwen3.8-27B, que a su vez parte del modelo Qwen/Qwen3.8-27B. El autor del artefacto es knoopx, y se publica bajo licencia Apache-2.0. Su propósito principal es permitir el despliegue eficiente del modelo en motores compatibles con NInfer, reduciendo el coste de memoria mediante cuantización NVFP4 (W4A4) sin necesidad de reconvertir los pesos originales.

El modelo subyacente es un modelo multimodal de 27B parámetros con arquitectura híbrida: combina 16 capas de atención completa con 48 capas GDN recurrentes, alcanzando una longitud de contexto de 262.144 tokens. Incluye un encoder de visión de 27 capas para entrada de imagen y vídeo, y una cabeza MTP (multi-token prediction) que habilita decodificación especulativa. Su relevancia actual radica en la combinación de multimodalidad, contexto largo y eficiencia de inferencia, lo que lo hace interesante para aplicaciones que requieren procesar entradas visuales extensas con razonamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (Qwen3_5ForConditionalGeneration), híbrida: 16 capas full-attention + 48 capas GDN recurrentes |
| Parametros totales | 27B (según denominación del modelo base) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (W4A4), W8G32, Q4G64, Q5G64, Q6G64, BF16, FP32 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | NInfer (.ninfer, single-file); el upstream publica safetensors BF16 |

## Arquitectura y entrenamiento

La arquitectura del modelo, denominada `qwen3_5`, es un diseño híbrido de 64 capas ocultas. De esas capas, 16 son de atención completa (distribuidas cada 4 capas, en las posiciones 3, 7, 11, ..., 63) y 48 son capas GDN recurrentes con una convolución corta de ancho 4. La dimensión oculta es de 5120, el tamaño intermedio de 17408, y la atención utiliza 24 cabezas de consulta y 4 cabezas KV con dimensión de cabeza 256. El vocabulario tiene 248.320 tokens. El encoder de visión consta de 27 capas con dimensión oculta 1152, tamaño intermedio 4304, 16 cabezas, tamaño de patch 16 y una proyección de salida de 5120.

El modelo es un finetune de Qwen/Qwen3.8-27B. No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni procesos de alineación como RLHF o DPO. La innovación técnica principal del artefacto es su esquema de cuantización mixta: la mayor parte de las matrices de pesos (MLP, atención completa y GDN) están en NVFP4 con activaciones de 4 bits (W4A4), los endpoints del vocabulario (embedding y cabeza de salida) en W8G32, las torres de visión en Q4G64/Q5G64/Q6G64, y los tensores de control y la cabeza MTP en BF16 o FP32. El artefacto se construyó mediante un proceso de "multi-source graft" que empaqueta pesos pre-cuantizados de varios repositorios sin reconversión ni recuantización.

## Capacidades

- Multimodal: entrada de texto, imagen y vídeo, con salida de texto.
- Generación de texto conversacional orientada al razonamiento (etiquetado como efficient-thinking).
- Contexto largo de 262.144 tokens, adecuado para documentos y conversaciones extensas.
- Multi-token prediction (MTP) con una cabeza de borrador, que habilita decodificación especulativa en motores compatibles.
- Token-efficient: la cuantización NVFP4 reduce el tamaño de los pesos a 17.06 GiB frente a los ~55.6 GB del modelo en BF16.
- No se documentan capacidades de tool calling, function calling ni integración con agentes en la información disponible.

## Casos de uso

- Análisis de imágenes y vídeos para soporte técnico: el modelo puede recibir capturas de pantalla o vídeos de errores y generar explicaciones razonadas, gracias a su encoder de visión y su orientación al pensamiento.
- Asistentes conversacionales de contexto largo: con 262.144 tokens de ventana, puede mantener diálogos extensos con memoria completa, útil en atención al cliente o tutorización.
- Procesamiento de documentos visuales: extracción de información de documentos escaneados, facturas o formularios con razonamiento multimodal.
- Investigación en eficiencia de inferencia: el artefacto NVFP4 permite estudiar el impacto de la cuantización W4A4 en modelos multimodales de 27B, comparando con versiones BF16.
- Decodificación especulativa en producción: la cabeza MTP permite acelerar la generación de texto en motores compatibles con NInfer, reduciendo la latencia en servicios de inferencia.
- Generación de contenido multimodal: descripción automática de imágenes, narración de vídeos, subtitulado y análisis de escenas para medios o vigilancia.
- Sistemas de razonamiento con memoria extendida: puede usarse como núcleo de razonamiento en aplicaciones que necesiten procesar entradas largas, como análisis de informes con gráficos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto pesa 17.06 GiB. Para contextos moderados, se requiere al menos 24 GB de VRAM; para contextos largos, se recomienda 40 GB o más.
- GPU recomendadas: A100 40GB, H100 80GB o RTX 4090 24GB para longitudes de contexto limitadas. No se han publicado requisitos oficiales.
- Puede caber en GPUs de consumo como la RTX 4090, pero con restricciones en la longitud de contexto y el tamaño del lote.
- Opciones de despliegue: motor NInfer, según el README del artefacto. El upstream publica una versión NVFP4 para vLLM, pero este artefacto concreto está diseñado para NInfer.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la información disponible. El modelo es un artefacto derivado del finetune Swift-Qwen3.8-27B, que a su vez se basa en Qwen/Qwen3.8-27B. Se diferencia del modelo base por su esquema de cuantización NVFP4 (W4A4) y su empaquetado en un único fichero NInfer, mientras que el upstream publica pesos en safetensors BF16 y una variante NVFP4 para vLLM. Sin resultados de rendimiento, no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Solo soporta inglés (language: en), lo que limita su uso en aplicaciones multilingües.
- Artefacto derivado: el repositorio upstream `ukisai/Swift-Qwen3.8-27B` es la fuente de verdad para los pesos y la distribución canónica.
- Sin benchmarks publicados; el rendimiento real debe evaluarse en cada caso de uso concreto.
- La cuantización NVFP4 puede degradar la calidad de las respuestas en comparación con la precisión BF16, especialmente en tareas que requieren alta precisión numérica.
- El artefacto está diseñado para el motor NInfer; puede no ser compatible con otros motores de inferencia sin una conversión adicional.
- Riesgo de alucinación inherente a los modelos de lenguaje, no documentado específicamente para este finetune.
- Posibles sesgos del modelo base Qwen, no evaluados ni documentados para esta variante.
- No se documentan capacidades de tool calling ni de uso como agente autónomo.

## Enlaces

- Artefacto en HuggingFace: https://huggingface.co/knoopx/Swift-Qwen3.8-27B-NInfer
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Upstream Swift (BF16): https://huggingface.co/ukisai/Swift-Qwen3.8-27B
- Upstream Swift NVFP4: https://huggingface.co/ukisai/Swift-Qwen3.8-27B-NVFP4
- Partner GDN (MTP NVFP4): https://huggingface.co/sakamakismile/Qwen3.8-27B-MTP-NVFP4
