# Bob99Bob/GLiNER2.5-Decide-encoder-coreml-fp16-L128

## Resumen

Este repositorio no contiene un modelo entrenado, sino una conversión a Core ML del encoder DeBERTa-v3-large que forma parte de GLiNER2.5-Decide, el modelo de clasificación y extracción de entidades desarrollado por Fastino. La conversión, obra del usuario Bob99Bob, toma los pesos publicados en `fastino/GLiNER2.5-Decide` (revisión `7ee5da4c2415e32259bcdc0b1a7367c32ce8d6f6`) y los reempaqueta en un `.mlpackage` en FP16 con longitud fija de 128 tokens, optimizado para ejecutarse en el Neural Engine de los chips Apple Silicon.

El problema que resuelve es de despliegue: GLiNER se usa dentro de veJ como uno de los lectores previos al juez, y en un Mac el encoder en PyTorch resulta lento. La conversión reescribe las puntuaciones de posición relativa de DeBERTa como multiplicaciones matriciales contra tablas constantes (el Neural Engine no soporta `torch.gather`) y aplica la máscara de atención solo a las claves, de modo que la salida de un token real no depende del padding posterior. El resultado es un encoder de 1024 dimensiones ocultas que produce `hidden` de forma `[1, 128, 1024]` en float32.

La relevancia es acotada pero clara para quien despliegue IA en local sobre hardware Apple: 1.250 de las 1.261 operaciones del encoder se ejecutan en el Neural Engine y la latencia mediana a 128 tokens baja a 12,6 ms en un Mac mini M4 Pro, frente a 20,5 ms en GPU vía Core ML y 53 ms en PyTorch. El repositorio solo contiene los artefactos de la conversión; las cabezas y el tokenizador se cargan del repositorio del editor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3-large (encoder transformer con atención de posición relativa desenrollada), convertido a Core ML |
| Parametros totales | no disponible (el paquete contiene solo el encoder, FP16, repo de 0,9 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens fijos en el paquete Core ML; en veJ, entradas más largas se sirven en GPU con el modelo publicado |
| Tipos de cuantizacion | FP16 (Core ML); el modelo base en PyTorch admite otras cuantizaciones no detalladas en la información disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.mlpackage` (Core ML); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El encoder subyacente es el de DeBERTa-v3-large, un transformer con atención de posición relativa desenrollada, del que este repositorio exporta únicamente la torre del encoder con dos entradas: `input_ids` y `attention_mask`, ambas int32 de forma `[1, 128]`. La conversión no entrena ni ajusta nada: los pesos son los del editor, solo cambia el formato. La reescritura sustituye `torch.gather` por productos matriciales contra tablas constantes para que el grafo sea compatible con el Neural Engine y restringe la máscara de atención a las claves, garantizando que la salida de un token real sea independiente del padding. La equivalencia se verificó contra el encoder de `transformers` en FP32 con tolerancia de 1e-4 antes de la conversión.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset ni si GLiNER2.5-Decide empleó RLHF o DPO; esos detalles corresponden a la model card del editor y no se incluyen en la información disponible. La innovación técnica de esta ficha es exclusivamente de despliegue: fijar la longitud a 128 tokens permite que el encoder corra en el Neural Engine, y a 256 tokens el Neural Engine tarda 63,2 ms frente a 40,5 ms en GPU, motivo por el que solo se sirve la variante de 128.

## Capacidades

- Extracción de entidades y clasificación de texto: el encoder alimenta las cabezas de GLiNER2.5-Decide para tareas de reconocimiento de entidades nombradas y clasificación.
- Integración como lector previo al juez en el pipeline de veJ sobre macOS.
- Ejecución acelerada en Neural Engine para entradas de hasta 128 tokens, con salida de estados ocultos lista para las cabezas del editor.
- Inferencia determinista respecto al padding: el relleno posterior no altera la representación de los tokens reales.
- No incluye generación de texto, tool calling, agentes, visión ni audio: es un encoder de clasificación, no un modelo generativo.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Extracción de entidades en local sobre Mac: usar el encoder Core ML junto con las cabezas de GLiNER2.5-Decide para reconocer entidades en documentos cortos (hasta 128 tokens) sin salir del equipo, aprovechando los 12,6 ms de latencia en Neural Engine.
- Clasificación de textos breves en aplicaciones de escritorio para macOS: titulares, asuntos de correo o mensajes de menos de 128 tokens, con consumo energético bajo al ejecutarse en Neural Engine.
- Preprocesado en pipelines de veJ: el encoder actúa como lector previo al juez, de modo que se puede integrar en el flujo de decisión existente sin modificar el resto del sistema.
- Servicio HTTP local: el script `server/gliner/gliner_server.py` expone el modelo en un puerto local combinando este paquete con los ficheros del editor, útil para prototipos y herramientas internas.
- Anonimización de datos antes de enviarlos a la nube: detectar nombres y entidades en registros cortos en el propio Mac y sustituirlos antes de la transmisión.
- Evaluación comparativa de latencia en hardware Apple: usar la variante Core ML como referencia de rendimiento frente a PyTorch en GPU para decidir la arquitectura de despliegue de un producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí hay mediciones de latencia del encoder realizadas por veJ en un Mac mini con M4 Pro:

| Longitud | Neural Engine | Core ML en GPU | PyTorch en GPU |
|---|---|---|---|
| 128 tokens | 12,6 ms (mediana) | 20,5 ms (mediana) | 53 ms (mediana) |
| 256 tokens | 63,2 ms | 40,5 ms | no disponible |

Además, 1.250 de las 1.261 operaciones del encoder se ejecutan en el Neural Engine, y la reescritura de la atención coincide exactamente con el encoder publicado en aritmética de 32 bits.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon con Neural Engine (probado en Mac mini M4 Pro).
- VRAM/unified memory: el repositorio ocupa 0,9 GB en FP16; se recomienda al menos 2 GB de memoria unificada libre para cargar el paquete junto con las cabezas y el tokenizador.
- GPU dedicadas (A100, H100, RTX 4090): no aplica, el paquete es Core ML y no se ejecuta en CUDA.
- Cabe en GPU de consumo Apple: sí, en cualquier chip M-series con Neural Engine; el rendimiento depende de la generación.
- Despliegue: Core ML en macOS, servido mediante `server/gliner/gliner_server.py` de veJ; para otras plataformas habría que usar el modelo base en PyTorch con vLLM, TGI o llama.cpp, no cubiertos por este paquete.
- Latencia y throughput: 12,6 ms por encoder a 128 tokens en M4 Pro; el throughput agregado no está publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este repositorio (encoder Core ML de GLiNER2.5-Decide) | no disponible (repo 0,9 GB) | 128 tokens fijos | Core ML FP16 | Apache-2.0 | Solo encoder; requiere cabezas del editor |
| fastino/GLiNER2.5-Decide (original) | no disponible | no disponible | safetensors | Apache-2.0 | Modelo completo en PyTorch, multiplataforma |
| Encoder DeBERTa-v3-large en PyTorch | ~435 M (referencia de la arquitectura) | configurable | safetensors | MIT (modelo base de Microsoft) | Sin optimización para Neural Engine |

La comparación con GLiNER de primera generación u otros modelos de NER no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: sin las cabezas y el tokenizador del repositorio del editor no produce predicciones.
- Longitud fija de 128 tokens en el paquete Core ML; las entradas más largas deben servirse por otra vía, como la GPU con el modelo original.
- Solo funciona en Apple Silicon con Core ML; no hay soporte para CUDA, ROCm ni CPU genérica en este paquete.
- Sin datos publicados sobre sesgos, tasa de alucinación o rendimiento multilingüe; al ser un encoder de clasificación, el riesgo de alucinación se traslada a las cabezas del editor.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar el `NOTICE` de la conversión y la licencia del modelo base antes de redistribuir.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria más allá de las mediciones del propio autor.
- Las fechas de creación y actualización del repositorio (16 de noviembre de 2026) deben tomarse con cautela.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Bob99Bob/GLiNER2.5-Decide-encoder-coreml-fp16-L128
- Modelo base: https://huggingface.co/fastino/GLiNER2.5-Decide
- Revisión del modelo base: `7ee5da4c2415e32259bcdc0b1a7367c32ce8d6f6`
- Proyecto veJ: https://github.com/ordinarybob/vej
- Benchmarks de veJ: https://github.com/ordinarybob/vej/blob/main/docs/BENCHMARKS.md
