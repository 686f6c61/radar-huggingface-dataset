# Blaize-AI/ConvNeXtV2a_ImageNet

## Resumen

ConvNeXtV2a_ImageNet es un clasificador de imágenes basado en la arquitectura ConvNeXt V2, originalmente desarrollada por Meta Platforms y disponible a través de la librería `timm` de Ross Wightman. Este repositorio concreto lo publica Blaize-AI y contiene una versión del modelo optimizada y compilada para su despliegue sobre aceleradores de IA Blaize Xplorer mediante el SDK Picasso. No se distribuyen pesos en formato estándar (safetensors, PyTorch), sino un artefacto binario propietario (`.bm`) listo para ejecutarse en el hardware Graph Streaming Processor (GSP) de Blaize.

El modelo resuelve la tarea de clasificación de imágenes sobre las 1.000 clases de ImageNet 2012. Su relevancia no reside en la arquitectura en sí, sino en el empaquetado: permite ejecutar inferencia de un ConvNeXt V2 en hardware de borde con aceleración específica, algo poco habitual en el ecosistema abierto, donde la mayoría de artefactos publicados son pesos PyTorch o GGUF.

La ficha disponible no especifica el número de parámetros de la variante concreta, el tamaño de entrada más allá de 224×224 píxeles, ni métricas de precisión. El repositorio ocupa 0,0 GB en el momento de la consulta y no registra descargas ni interacciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ConvNeXt V2 (red convolucional pura, sin atención) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | AMP (mezcla INT8 + BF16), INT8, BF16 según la model card |
| Idiomas soportados | no disponible (clasificación de imágenes, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.bm` (artefacto binario propietario para Blaize GSP); no se incluyen safetensors ni GGUF |
| Resolución de entrada | 224×224 (variante `amp_224_224`) |
| Tarea | Clasificación de imágenes (ImageNet 2012, 1.000 clases) |
| Framework de origen | PyTorch / `timm` |
| Hardware objetivo | Blaize Xplorer AI accelerator (GSP) |
| SDK requerido | Blaize Picasso SDK |

## Arquitectura y entrenamiento

ConvNeXt V2 es una evolución de ConvNeXt que incorpora una arquitectura de red convolucional pura con diseño inspirado en transformers (bloques con convoluciones depthwise de 7×7, normalización LayerNorm, activación GELU y estructura de proporciones tipo Swin). La versión V2 introduce la capa Fully Convolutional Masked Autoencoder (FCMAE) y la normalización GRN (Global Response Normalization), que mejora la activación de características entre canales. La model card no detalla la variante concreta (T, S, B, L) ni el número de parámetros.

El entrenamiento original se realizó sobre ImageNet 2012 (1,28 millones de imágenes de entrenamiento, 50.000 de validación, 1.000 clases), según indica la model card. Los pesos provienen del repositorio oficial de Meta (`facebookresearch/ConvNeXt-V2`) y de la implementación en `timm`. Blaize no ha modificado el código fuente del modelo, pero sí ha aplicado optimizaciones específicas de hardware (compilación y cuantización) para que el grafo se ejecute sobre el GSP. No se documentan detalles sobre RLHF, DPO ni recetas de ajuste fino adicionales, algo esperable en un clasificador de visión.

## Capacidades

- Clasificación de imágenes en 1.000 categorías de ImageNet 2012.
- Inferencia optimizada para hardware de borde Blaize Xplorer mediante el SDK Picasso.
- Soporte de cuantización AMP (INT8 + BF16) para equilibrar precisión y velocidad.
- Ejecución sobre Graph Streaming Processor (GSP), con arquitectura de grafos orientada a baja latencia y eficiencia energética.
- Inspección del artefacto mediante la utilidad `blaize-modeltool`.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No incluye modo thinking, visión generativa, audio ni funcionalidades multimodales más allá de la clasificación.

## Casos de uso

- Clasificación de imágenes en el borde: el modelo se ejecuta directamente sobre el acelerador Blaize Xplorer, lo que permite clasificar imágenes en dispositivos con restricciones de consumo energético sin depender de la nube.
- Inspección visual en línea de producción: con entrada de 224×224 y cuantización AMP, puede integrarse en cadenas de control de calidad para etiquetar piezas o detectar categorías predefinidas en tiempo real.
- Filtrado y etiquetado automático de imágenes en cámaras inteligentes: al ejecutarse en hardware GSP de bajo consumo, es adecuado para preetiquetar contenido antes de enviarlo a un sistema central.
- Prototipado de pipelines de visión en hardware Blaize: sirve como modelo de referencia para validar el flujo Picasso SDK → GSP antes de desplegar modelos propios.
- Clasificación previa en sistemas de recomendación visual: permite generar etiquetas de categoría a gran escala en el borde y reducir el ancho de banda hacia el backend.
- Benchmarking de aceleradores: útil para comparar latencia y throughput de un ConvNeXt V2 compilado frente a otras variantes (INT8, BF16) sobre el mismo hardware.
- Educación y demostraciones de despliegue en edge AI: el artefacto `.bm` y la utilidad `modeltool` facilitan mostrar el ciclo completo de compilación y ejecución en aceleradores específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión top-1/top-5, latencia ni throughput para la variante AMP 224×224.

## Requisitos de hardware

- Acelerador Blaize Xplorer AI (Graph Streaming Processor); el artefacto `.bm` no está pensado para ejecutarse en GPU convencionales ni en CPU.
- SDK Blaize Picasso instalado y configurado para cargar y ejecutar el modelo.
- VRAM estimada: no disponible (no es un modelo orientado a GPU; el consumo depende del acelerador GSP).
- GPU recomendadas: no aplica; no se distribuyen pesos en formatos compatibles con CUDA (safetensors, GGUF, etc.).
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no disponible; el artefacto no es portable a ese hardware.
- Opciones de despliegue: exclusivamente mediante el SDK Picasso y el hardware Blaize; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Entrada | Formato | Licencia | Hardware |
|---|---|---|---|---|---|---|
| Blaize-AI/ConvNeXtV2a_ImageNet | ConvNeXt V2 | no disponible | 224×224 | `.bm` (propietario) | Apache-2.0 | Blaize GSP |
| ConvNeXt V2 (Meta, original) | ConvNeXt V2 | varía (T/S/B/L) | 224×224 | PyTorch / safetensors | Apache-2.0 | GPU/CPU |
| ConvNeXt V2 en `timm` | ConvNeXt V2 | varía | 224×224 | PyTorch | Apache-2.0 | GPU/CPU |
| EfficientNet-B0 (referencia edge) | EfficientNet | ~5,3 M | 224×224 | PyTorch/ONNX/TFLite | Apache-2.0 | CPU/GPU/edge |

La comparativa se limita a la arquitectura de origen y a alternativas de clasificación en el borde; no hay datos de rendimiento publicados para la variante de Blaize que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- El artefacto `.bm` es propietario y solo se ejecuta en hardware Blaize Xplorer con el SDK Picasso; no es portable a GPU, CPU ni otros aceleradores.
- No se distribuyen pesos en safetensors, GGUF ni PyTorch, lo que impide su uso con frameworks estándar.
- La model card no especifica la variante concreta de ConvNeXt V2 ni el número de parámetros, lo que dificulta estimar precisión y coste computacional.
- No hay métricas de precisión publicadas para la versión cuantizada AMP; la cuantización INT8 puede degradar la precisión respecto al modelo original en BF16.
- El modelo está entrenado exclusivamente con ImageNet 2012; su vocabulario visual se limita a las 1.000 clases de ese dataset y no generaliza a categorías fuera de él.
- Sesgos conocidos: hereda los sesgos de ImageNet (desequilibrio de clases, sesgos geográficos y culturales en las anotaciones); la model card no documenta evaluaciones de sesgo.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí puede producir clasificaciones erróneas con alta confianza en imágenes fuera de distribución.
- Restricciones de licencia: el código y los pesos originales son Apache-2.0, pero el dataset ImageNet tiene su propia licencia (`LicenseRef-ImageNet`) que condiciona el uso comercial de modelos derivados; conviene revisarla.
- Blaize declara que el modelo es contenido de terceros y no ofrece garantías sobre su funcionamiento ni sobre posibles infracciones de propiedad intelectual.
- No hay soporte documentado para procesamiento de lenguaje, agentes ni tool calling; no debe emplearse en esos escenarios.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Blaize-AI/ConvNeXtV2a_ImageNet
- Sitio de Blaize: https://www.blaize.com
- Repositorio oficial de ConvNeXt V2 (Meta): https://github.com/facebookresearch/ConvNeXt-V2
- Implementación en `timm`: https://github.com/huggingface/pytorch-image-models/blob/main/timm/models/convnext.py
- Dataset ImageNet: https://www.image-net.org/
