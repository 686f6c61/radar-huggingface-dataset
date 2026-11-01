# mantelmoritz/MoGe-2-ViT-B-Encoder-safetensors

## Resumen

Este repositorio contiene únicamente el codificador de imágenes (encoder) del modelo MoGe-2 ViT-B desarrollado por Microsoft Research (Ruicheng Wang et al.), extraído del checkpoint original y convertido al formato `safetensors`. No se trata de un modelo nuevo ni de un fine-tuning: los tensores se han copiado sin modificar (float32, mismos nombres de clave, mismos valores) desde el fichero `model.pt` original. Se han omitido el cuello (neck) y las cabezas de puntos, normales, máscara y escala, de modo que el artefacto resultante solo produce características geométricas del encoder.

El propósito del repositorio es práctico: el keyer en tiempo real CorridorKey utiliza el encoder de MoGe-2 como extractor congelado de características de geometría, y su plugin para OBS enlaza pesos con grafos ONNX sin pesos en C++. Dado que `model.pt` es un pickle de PyTorch que C++ solo puede leer con un unpickler, la conversión a `safetensors` (cabecera JSON seguida de tensores crudos) simplifica la integración en ese pipeline.

Con 87,8 millones de parámetros en float32 y un tamaño de repositorio de 0,4 GB, el artefacto es ligero y está pensado para consumo programático como extractor de características, no como modelo generativo completo. La relevancia actual radica en que MoGe-2 (arXiv:2507.02546) es una referencia reciente en estimación de geometría monocular con escala métrica y detalle nítido, y esta conversión facilita su uso en entornos nativos sin dependencia de Python.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT-B/14 (backbone DINOv2 de Meta), solo encoder |
| Parametros totales | 87.760.902 (87,8 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en float32; el autor no publica variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | MIT (MoGe, Copyright Microsoft Corporation); backbone DINOv2 bajo Apache 2.0 |
| Formato de pesos | safetensors (180 tensores, float32) |

## Arquitectura y entrenamiento

El artefacto es el encoder de un ViT-B/14, es decir, un Vision Transformer con parches de 14x14 y aproximadamente 87,8 M de parámetros, cuyo backbone procede de DINOv2 (Meta Platforms, Apache 2.0). El fichero contiene los 180 tensores correspondientes a las entradas `encoder.*` del checkpoint original, con claves como `encoder.backbone.blocks.0.attn.qkv.weight`, que alimentan la pasada forward del encoder. No incluye el neck ni las cabezas de predicción de puntos, normales, máscara y escala del modelo MoGe-2 completo.

No se ha realizado ningún entrenamiento, fine-tuning ni cuantización en este repositorio: es una conversión de formato pura. Los tensores se copiaron sin cambios desde `model.pt` (419.110.160 bytes, revisión `ca5f0e07ff01d3e5a364c1d954ed12ee1814b368`), verificado mediante sha256 del fichero origen. La innovación técnica del modelo subyacente (MoGe-2) es la estimación de geometría monocular con escala métrica y detalles nítidos, descrita en el paper arXiv:2507.02546; este repositorio no aporta innovación propia más allá del empaquetado en safetensors para consumo en C++.

## Capacidades

- Extracción de características de imagen (feature extraction): produce representaciones del encoder ViT-B/14 a partir de imágenes de entrada.
- Extracción de características geométricas congeladas: sirve como extractor de geometría en pipelines como CorridorKey 2.0.
- Integración en C++ mediante safetensors: cabecera JSON más tensores crudos, legible sin unpickler de PyTorch.
- Base para estimación de profundidad y geometría: el encoder forma parte del modelo MoGe-2, orientado a depth estimation y reconstrucción geométrica monocular.
- No incluye generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües: es exclusivamente un encoder visual.
- No incluye las cabezas de predicción (puntos, normales, máscara, escala), por lo que no produce directamente mapas de profundidad ni normales sin el resto del modelo.

## Casos de uso

- Keying en tiempo real con CorridorKey: el encoder se usa como extractor congelado de características de geometría en el keyer CorridorKey, alimentando el plugin de OBS que enlaza pesos con grafos ONNX en C++; la conversión a safetensors elimina la dependencia del unpickler de PyTorch.
- Integración en aplicaciones C++ nativas: cualquier pipeline C++ que necesite características ViT-B/14 puede leer el fichero safetensors directamente (cabecera JSON + tensores), sin entorno Python.
- Preprocesamiento para estimación de profundidad: usar el encoder como primera etapa de un pipeline que complete la geometría con las cabezas de MoGe-2 originales u otras cabezas propias.
- Extracción de features para tareas de visión downstream: clasificación, segmentación o matching que se beneficien de representaciones DINOv2 ViT-B/14 congeladas.
- Reproducibilidad y auditoría: el repositorio documenta revisión, sha256 del origen y sha256 del resultado, lo que permite verificar la integridad de los pesos en entornos de producción.
- Despliegue ligero en edge: con 87,8 M de parámetros en float32 y 0,4 GB de repositorio, el encoder cabe en dispositivos con recursos moderados para inferencia de características.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas propias; las del modelo completo MoGe-2 figuran en el paper arXiv:2507.02546, no en esta conversión.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 87,8 M de parámetros en float32, los pesos ocupan aproximadamente 0,35 GB, por lo que la VRAM necesaria es modesta y depende del tamaño de lote y de la resolución de entrada.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM debería poder alojar los pesos.
- GPU de consumo: previsiblemente cabe en GPUs de consumo por el reducido tamaño de los pesos, aunque no se confirma en la documentación.
- Opciones de despliegue: consumo directo de safetensors desde C++ (caso de uso declarado); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoGe-2 ViT-B encoder (este repo) | 87,8 M (solo encoder) | no aplica | Feature extraction / geometría | MIT (+ Apache 2.0 DINOv2) | HuggingFace, safetensors |
| Ruicheng/moge-2-vitb-normal (original) | no disponible en la información | no aplica | Geometría monocular completa | MIT | HuggingFace, `model.pt` |
| DINOv2 ViT-B/14 (backbone) | no disponible en la información | no aplica | Feature extraction visual | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo completo: carece de neck y cabezas de puntos, normales, máscara y escala; no produce directamente profundidad ni geometría sin el resto del pipeline.
- Solo encoder: no genera texto, no razona, no soporta tool calling ni agentes; cualquier expectativa de modelo de lenguaje es incorrecta.
- Sin cuantizaciones publicadas: los pesos están en float32; no hay variantes GGUF, int8 ni similares en este repositorio.
- Riesgo de sesgo y alucinación: no aplica en el sentido de modelos generativos, pero las características heredan los sesgos del dataset de entrenamiento de DINOv2 y MoGe-2, no documentados aquí.
- Licencia: MIT para MoGe y Apache 2.0 para el backbone DINOv2; se deben conservar ambas atribuciones (Microsoft Corporation y Meta Platforms, Inc.). El repositorio no está afiliado a Microsoft ni a Meta.
- Integridad: el autor documenta sha256 del origen y del resultado; conviene verificarlos antes de usar los pesos en producción.
- Sin métricas propias: no hay benchmarks en el repositorio que validen el rendimiento del encoder aislado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mantelmoritz/MoGe-2-ViT-B-Encoder-safetensors
- Modelo original MoGe-2 ViT-B: https://huggingface.co/Ruicheng/moge-2-vitb-normal
- Código de MoGe: https://github.com/microsoft/MoGe
- Paper MoGe-2: https://arxiv.org/abs/2507.02546
- CorridorKey real-time keyer: https://huggingface.co/mantelmoritz/CorridorKey-Realtime-EdgeRefiner
