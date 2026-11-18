# Soap26/layerd-birefnet-onnx

## Resumen

LayerD (BiRefNet) – ONNX fp16 es una exportación a formato ONNX del modelo de matting `cyberagent/layerd-birefnet`, desarrollado por CyberAgent AI Lab y presentado en el artículo "LayerD: Decomposing Raster Graphic Designs into Layers" (ICCV 2025). El modelo resuelve una tarea específica de segmentación de imágenes: dado un diseño gráfico rasterizado, predice el canal alfa de la capa superior (texto, formas, decoraciones), lo que permite descomponer un diseño plano en capas editables.

Esta ficha concreta no es un modelo nuevo ni un reentrenamiento: es un artefacto de despliegue creado por el usuario Soap26 que combina los pesos de LayerD con el grafo ONNX de BiRefNet de `onnx-community/BiRefNet-ONNX`, convertido a fp16. El resultado es un único fichero ONNX de aproximadamente 490 MB pensado para inferencia en aplicaciones de escritorio mediante DirectML, en concreto para la función "Magic Layers" de la aplicación Paperwell.

La relevancia es práctica: permite ejecutar localmente una tarea de segmentación de alta resolución (1024×1024) sin depender de PyTorch ni de Python, lo que facilita su integración en pipelines nativos o en entornos con requisitos estrictos de despliegue. Al estar bajo licencia Apache-2.0 (pesos LayerD) y MIT (arquitectura BiRefNet), su uso comercial es viable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiRefNet (red de segmentación de imagen completa, basada en transformer con decodificación multi-escala) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 1024×1024 píxeles) |
| Tipos de cuantizacion | fp16 (único fichero disponible: `onnx/model_fp16.onnx`) |
| Idiomas soportados | no disponible (modelo de imagen, no lingüístico) |
| Licencia | Apache-2.0 (pesos LayerD); arquitectura BiRefNet bajo MIT |
| Formato de pesos | ONNX (fp16) |
| Entrada | float32 `[1, 3, 1024, 1024]`, RGB, normalizada con media/std de ImageNet |
| Salida | logits `[1, 1, 1024, 1024]`; aplicar sigmoid para obtener el alfa |
| Tamano del fichero | 489.657.211 bytes (~490 MB) |
| SHA-256 | `1f232994e123095ed5ec7383addd9f4c071526e22fc08e9877758cda96af6739` |

## Arquitectura y entrenamiento

El modelo subyacente, LayerD, se apoya en la arquitectura BiRefNet, una red de segmentación de imagen completa diseñada para matting de alta resolución que combina un backbone tipo transformer con módulos de decodificación multi-escala para refinar bordes y detalles finos. La tarea específica de LayerD es predecir el alfa de la capa superior de un diseño gráfico rasterizado, distinguiendo texto, formas y decoraciones del fondo.

El entrenamiento original corresponde a los autores de LayerD (CyberAgent AI Lab, ICCV 2025); esta ficha no dispone de datos sobre el número de tokens, composición del dataset ni si se emplearon técnicas de RLHF/DPO (no aplicables a un modelo de segmentación). La innovación de este artefacto concreto es el proceso de exportación: los pesos de LayerD se insertaron en el grafo ONNX de BiRefNet de `onnx-community/BiRefNet-ONNX` (revisión `534d3c8`) emparejando cada constante del grafo con los pesos oficiales de BiRefNet (`ZhengPeng7/BiRefNet`, revisión `66f7f80`) por valor, aplicando la misma transformación a los pesos de LayerD (`cyberagent/layerd-birefnet`, revisión `679f743`), y convirtiendo el resultado a fp16. El script de conversión está disponible en el repositorio de Paperwell.

## Capacidades

- Predicción del canal alfa de la capa superior en diseños gráficos rasterizados (texto, formas, decoraciones).
- Segmentación de imagen de alta resolución con entrada fija de 1024×1024 píxeles.
- Generación de máscaras de matting con bordes suavizados (salida en logits, sigmoid para alfa).
- Descomposición de diseños planos en capas editables (caso de uso principal de LayerD).
- Inferencia local sin dependencias de Python/PyTorch, gracias al formato ONNX.
- Ejecución en aceleración por hardware mediante DirectML en Windows (caso de uso declarado por el autor).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).
- No dispone de modo thinking, visión general, audio ni otras modalidades más allá de la segmentación de imagen.

## Casos de uso

- Descomposición de diseños para edición: dado un cartel o banner rasterizado, el modelo genera la máscara alfa de la capa superior, permitiendo separar texto y formas del fondo para editarlos por separado en herramientas de diseño.
- Automatización de flujos de trabajo en diseño gráfico: integración en pipelines que reciben diseños planos y necesitan reconstruir capas editables (por ejemplo, para reutilizar plantillas o adaptar creatividades a distintos formatos).
- Extracción de texto y elementos gráficos en documentos escaneados o capturas: la máscara de la capa superior facilita aislar tipografías y formas para OCR posterior o para reutilización.
- Aplicaciones de escritorio con inferencia local: al ser un ONNX fp16 de ~490 MB, puede ejecutarse en equipos de usuario final mediante DirectML, sin enviar imágenes a la nube, lo que resulta adecuado para herramientas de diseño con requisitos de privacidad.
- Preprocesado en pipelines de visión por computador: la máscara alfa puede servir como entrada para tareas posteriores de inpainting, recoloreado o sustitución de fondos.
- Prototipado rápido de funciones de matting: el fichero ONNX permite validar la calidad de LayerD en un producto sin montar el entorno Python original, como demuestra su uso en la función "Magic Layers" de Paperwell.
- Evaluación comparativa de modelos de segmentación: sirve como referencia para comparar BiRefNet/LayerD frente a otras alternativas de matting en un mismo entorno de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas (IoU, SAD, MSE, etc.) ni comparaciones numéricas con otros modelos de matting o segmentación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el fichero ONNX ocupa ~490 MB en fp16, por lo que el peso del modelo en memoria es de ese orden, más el coste de activaciones para una entrada de 1024×1024 (no cuantificado en la información proporcionada).
- GPU recomendadas: no especificadas en la información disponible. El caso de uso declarado es DirectML en escritorio, lo que sugiere GPUs de consumo con soporte DirectX 12.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño del fichero y el enfoque en aplicaciones de escritorio, aunque no se aportan requisitos mínimos concretos.
- Opciones de despliegue: ONNX Runtime (incluido el proveedor DirectML); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de segmentación de imagen.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tarea | Entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Soap26/layerd-birefnet-onnx (esta ficha) | Matting de capa superior en diseños gráficos | 1024×1024 fija | ONNX fp16 | Apache-2.0 (pesos), MIT (arquitectura) | Hugging Face, ~490 MB |
| cyberagent/layerd-birefnet | Matting de capa superior en diseños gráficos | 1024×1024 (según modelo base) | PyTorch (formato original) | Apache-2.0 | Hugging Face |
| ZhengPeng7/BiRefNet | Segmentación/matting de imagen general | 1024×1024 | PyTorch | MIT | Hugging Face |
| onnx-community/BiRefNet-ONNX | Segmentación/matting de imagen general | 1024×1024 | ONNX | MIT (arquitectura) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en una única tarea (alfa de la capa superior de diseños gráficos); no es un modelo de propósito general ni un modelo de lenguaje.
- Entrada fija de 1024×1024 píxeles: las imágenes de otras resoluciones requieren redimensionado, lo que puede afectar a la precisión en detalles finos.
- La salida son logits; es imprescindible aplicar sigmoid para obtener el canal alfa. Un uso incorrecto de la salida produce resultados inválidos.
- La normalización de entrada debe seguir media/std de ImageNet; no hacerlo degrada la calidad de la máscara.
- El artefacto es una conversión no oficial realizada por un tercero (Soap26) mediante manipulación del grafo ONNX; no hay garantía de equivalencia numérica exacta con los pesos originales de LayerD más allá de la verificación por valor de las constantes descrita por el autor.
- Solo se distribuye en fp16; no hay versiones fp32, int8 ni otras cuantizaciones en el repositorio.
- Riesgo de alucinación no aplicable en el sentido lingüístico, pero sí de errores de segmentación en diseños con fondos complejos, transparencias o elementos solapados.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre diseños gráficos, puede tener un rendimiento inferior en fotografías naturales u otros dominios visuales.
- Licencia Apache-2.0 para los pesos y MIT para la arquitectura: permite uso comercial, pero se recomienda citar LayerD según indica su repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada.
- No se especifican requisitos mínimos de hardware ni latencias, lo que dificulta planificar despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Soap26/layerd-birefnet-onnx
- Modelo base (LayerD): https://huggingface.co/cyberagent/layerd-birefnet
- Repositorio de código de LayerD: https://github.com/CyberAgentAILab/LayerD
- Grafo ONNX de BiRefNet utilizado: https://huggingface.co/onnx-community/BiRefNet-ONNX
- Pesos oficiales de BiRefNet: https://huggingface.co/ZhengPeng7/BiRefNet
- Script de conversión: https://github.com/Soap2647/paperwell/blob/master/scripts/layerd_onnx.py
- Aplicación Paperwell (función "Magic Layers"): https://github.com/Soap2647/paperwell
