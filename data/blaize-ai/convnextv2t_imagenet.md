# Blaize-AI/ConvNeXtV2t_ImageNet

## Resumen

ConvNeXtV2t_ImageNet es un clasificador de imágenes derivado de ConvNeXt V2, la arquitectura convolucional pura presentada por Meta Platforms (Facebook AI Research) en 2023 como evolución de ConvNeXt. En concreto, esta variante parte de la implementación de `timm` (PyTorch Image Models) de Ross Wightman y ha sido optimizada por Blaize-AI para su despliegue sobre aceleradores de inferencia de borde de la familia Xplorer, mediante el SDK Picasso y el Graph Streaming Processor (GSP) de Blaize.

El modelo resuelve la tarea de clasificación de imágenes sobre las 1.000 clases de ImageNet 2012. Su interés no reside en la arquitectura en sí —ampliamente conocida— sino en el empaquetado: se distribuye como artefacto binario `.bm` precompilado en precisión mixta (AMP, combinación de INT8 y BF16) con entrada fija de 224×224 píxeles, listo para ejecutarse en hardware GSP. Esto lo convierte en una pieza de referencia para pipelines de visión en el borde con requisitos estrictos de latencia y consumo.

La relevancia es, por tanto, acotada: no es un modelo para investigación ni para uso general en GPU, sino un artefacto de despliegue específico de hardware. El repositorio no incluye pesos en safetensors ni GGUF, sino un único fichero binario para el runtime de Blaize, y no publica métricas de precisión ni de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt V2 (CNN pura con bloques ConvNeXt y capas de normalización/activación tipo transformer), variante "t" (tiny) de `timm` |
| Parametros totales | no disponible (la variante tiny de ConvNeXt V2 ronda los 28 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de 224×224×3) |
| Tipos de cuantizacion | AMP (INT8 + BF16); la model card menciona también INT8 y BF16 como métodos disponibles, pero solo se publica la variante AMP |
| Idiomas soportados | no disponible (clasificación de imágenes; etiquetas de ImageNet en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.bm` (binario precompilado para Blaize GSP); no se distribuyen safetensors, GGUF ni ONNX |

## Arquitectura y entrenamiento

ConvNeXt V2 es una red convolucional pura que moderniza el diseño de ConvNeXt incorporando elementos propios de los transformers de visión: profundidad variable por etapa, convoluciones depthwise de 7×7, normalización LayerNorm en lugar de BatchNorm y una capa de normalización global (GRN, Global Response Normalization) que evita la activación redundante entre canales y mejora la utilización de características. La variante "t" (tiny) es la de menor tamaño de la familia y está pensada para regímenes de cómputo limitado.

El entrenamiento original se realizó sobre ImageNet 2012 con el pipeline de Meta, que combina preentrenamiento auto-supervisado (FCMAE, Fully Convolutional Masked Autoencoder) seguido de ajuste fino supervisado. La model card no detalla el número de tokens/imágenes vistas, la composición exacta del dataset ni si hubo técnicas de regularización específicas más allá de la referencia al repositorio oficial. Blaize no ha modificado el código fuente del modelo, pero sí ha aplicado optimizaciones específicas de hardware (fusión de operadores, mapeo al grafo del GSP y calibración de cuantización) para producir el artefacto `.bm`.

## Capacidades

- Clasificación de imágenes en 1.000 clases de ImageNet 2012 (single-label, top-1/top-5).
- Extracción de características visuales intermedias (si el runtime lo expone; no documentado en la model card).
- Inferencia en precisión mixta AMP (INT8 + BF16) con entrada fija de 224×224 píxeles.
- Ejecución sobre aceleradores Blaize Xplorer mediante el SDK Picasso y el runtime GSP.
- Inspección del artefacto con `blaize-modeltool info`.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni vídeo.
- No soporta prompts variables ni resolución dinámica: la forma de entrada está fijada en el binario.

## Casos de uso

- Clasificación de imágenes en el borde: despliegue en dispositivos con acelerador Blaize Xplorer para etiquetar imágenes de 224×224 en tiempo real, con consumo energético reducido gracias al diseño graph-native del GSP.
- Inspección visual industrial: uso como etapa de clasificación en líneas de fabricación para descartar piezas defectuosas, aprovechando la inferencia de baja latencia del binario AMP.
- Filtrado previo en cámaras inteligentes: clasificación rápida de fotogramas para decidir si se envía la imagen a un modelo mayor en la nube, reduciendo ancho de banda.
- Clasificación de imágenes médicas o agrícolas de dominio acotado: reentrenamiento de la cabeza de clasificación (si el SDK lo permite) sobre las clases de interés, manteniendo el backbone preentrenado.
- Prototipado de pipelines de visión en hardware GSP: servir como modelo de referencia para validar la cadena Picasso SDK → GSP antes de portar modelos propios.
- Benchmarking de cuantización: comparar la variante AMP frente a INT8/BF16 en el mismo hardware para calibrar el compromiso precisión/velocidad en una aplicación concreta.
- Docencia y demostraciones: ejemplo mínimo de clasificador ConvNeXt V2 desplegado en un acelerador de borde, útil para mostrar el flujo completo desde `timm` hasta el binario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye top-1/top-5 en ImageNet, latencia, throughput ni comparación con la variante original en PyTorch.

## Requisitos de hardware

- Acelerador Blaize Xplorer (hardware GSP propietario); el binario `.bm` no se ejecuta en GPU ni CPU convencionales.
- SDK Picasso instalado y configurado; se requiere para cargar y ejecutar el modelo.
- VRAM estimada: no aplica (no es un modelo para GPU); el consumo de memoria depende del acelerador GSP concreto.
- GPU recomendadas: no aplica; el modelo no está pensado para A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no; el artefacto es específico de hardware Blaize.
- Opciones de despliegue: exclusivamente el runtime de Blaize (Picasso SDK + GSP). No hay soporte para vLLM, llama.cpp, Ollama ni TGI (son runtimes de texto y no aplican).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto/Clases | Licencia | Formato | Hardware |
|---|---|---|---|---|---|---|
| ConvNeXtV2t_ImageNet (Blaize) | no disponible (tiny) | 224×224 | 1.000 clases ImageNet | Apache-2.0 | `.bm` | Blaize Xplorer (GSP) |
| ConvNeXt V2-T (original, Meta/timm) | ~28 M (dato no confirmado aquí) | 224×224 (dinámico) | 1.000 clases ImageNet | Apache-2.0 | safetensors / PyTorch | GPU/CPU |
| ConvNeXt V1-T (timm) | ~28 M (dato no confirmado aquí) | 224×224 | 1.000 clases ImageNet | Apache-2.0 | safetensors / PyTorch | GPU/CPU |
| ViT-B/16 (timm) | ~86 M | 224×224 | 1.000 clases ImageNet | Apache-2.0 | safetensors / PyTorch | GPU/CPU |

La comparación relevante es frente al ConvNeXt V2-T original de `timm`: misma arquitectura y mismos pesos de partida, pero distinto empaquetado (binario precompilado para GSP frente a pesos PyTorch portables). Frente a alternativas como ViT-B/16, el modelo de Blaize ofrece menor tamaño y despliegue en borde, a costa de perder portabilidad y de no publicar métricas.

## Limitaciones y advertencias

- Modelo de visión: no procesa texto, audio ni vídeo; no es un LLM y no admite prompts.
- Entrada fija de 224×224: no soporta resolución dinámica ni aspect ratios distintos sin recompilar.
- Solo se publica la variante AMP; las variantes INT8 y BF16 mencionadas en la model card no aparecen como ficheros en el repositorio.
- Sin métricas de precisión ni de latencia publicadas: no es posible evaluar la degradación introducida por la cuantización AMP sin medirla en el hardware.
- Dependencia total del hardware Blaize Xplorer y del SDK Picasso: no hay camino de despliegue alternativo.
- Riesgo de sesgo heredado de ImageNet 2012: las 1.000 clases son limitadas, con desequilibrios conocidos y sesgos geográficos y culturales en la anotación original.
- Riesgo de alucinación de clase: como todo clasificador cerrado, asignará siempre una de las 1.000 etiquetas aunque la imagen no pertenezca a ninguna, sin señal de confianza calibrada documentada.
- Licencia Apache-2.0 para el modelo, pero el dataset ImageNet 2012 tiene su propia licencia (`LicenseRef-ImageNet`) que restringe el uso comercial de los datos originales; conviene revisarla antes de un despliegue en producción.
- Blaize declara que el modelo es contenido de terceros y no ofrece garantías sobre precisión, no infracción de propiedad intelectual ni idoneidad para un fin concreto.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.

## Enlaces

- HuggingFace: https://huggingface.co/Blaize-AI/ConvNeXtV2t_ImageNet
- Blaize: https://www.blaize.com
- Pesos originales ConvNeXt V2 (Meta): https://github.com/facebookresearch/ConvNeXt-V2
- Implementación `timm` de ConvNeXt: https://github.com/huggingface/pytorch-image-models/blob/main/timm/models/convnext.py
- Dataset ImageNet: https://www.image-net.org/
- Paper ConvNeXt V2 (referencia de la arquitectura): no disponible en la información proporcionada
- Documentación del SDK Picasso: no disponible en la información proporcionada
