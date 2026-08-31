# cgb/flux2-klein-4b-onnx-webgpu

## Resumen

FLUX.2 Klein 4B es un modelo de generación de imágenes de texto a imagen desarrollado por Black Forest Labs, con licencia Apache-2.0. Esta versión concreta, publicada por el usuario cgb, es una re-exportación del modelo original a formato ONNX, diseñada para ejecutarse íntegramente en el navegador mediante WebGPU y ONNX Runtime Web. El objetivo es permitir la generación de imágenes sin servidor, sin API key y sin subida de datos: los pesos se descargan una vez y quedan cacheados en el navegador, y cada imagen se genera en la GPU del visitante.

El paquete incluye tres grafos ONNX: un codificador de texto basado en Qwen3-4B cuantizado a int4, un transformador de difusión (denoiser) cuantizado a int8 y un decodificador VAE en float32. El tamaño total del repositorio es de 6,5 GB. La exportación ha sido verificada contra PyTorch mediante similitud coseno, alcanzando valores superiores a 0,999 en los componentes principales. El modelo soporta generación a 512x512 en 4 pasos en unos 22 segundos en una GPU discreta reciente, y funciona offline tras la primera carga.

Esta ficha se centra en la versión ONNX para navegador, no en el modelo original en PyTorch. La relevancia actual radica en que permite desplegar generación de imágenes de alta calidad en aplicaciones web sin infraestructura backend, algo poco común en modelos de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) con text encoder Qwen3-4B, exportado a ONNX |
| Parametros totales | 4B en el transformer principal (el text encoder Qwen3-4B anade mas, total exacto no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens para el text encoder (segun el codigo de ejemplo) |
| Tipos de cuantizacion | int4 (text encoder, block size 128), int8 (transformer, block size 128), float32 (VAE) |
| Idiomas soportados | No disponible (probablemente ingles, no se especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX con shards de datos externos (`.data` y `.manifest.json`) |

## Arquitectura y entrenamiento

El modelo original FLUX.2 Klein 4B es un modelo de difusion de transformadores (DiT) que genera imagenes a partir de texto. El text encoder es Qwen3-4B, tambien con licencia Apache-2.0. En esta exportacion, el text encoder devuelve hidden states (no logits) de las capas 9, 18 y 27, apilados y aplanados a una dimension de 7680, que es la `joint_attention_dim` del transformer. Se trunca a 28 de las 36 capas del Qwen3, manteniendo una capa extra porque la normalizacion final se aplica al ultimo hidden state.

El denoiser (transformer) se ha cuantizado a int8 en lugar de int4 porque la cuantizacion int4 degrada significativamente la fidelidad (cosine de 0,849 frente a 0,9994 con int8). Los embeddings rotatorios se calculan en float32, ya que ONNX Runtime no tiene kernel de `Cos` en float64. El scheduler usa dynamic shifting con `base_shift` 0,5 y `max_shift` 1,15 sobre 256 a 4096 tokens de imagen, lo que produce una programacion de sigmas distinta a la de FLUX.1 y necesaria para obtener buenos resultados.

El entrenamiento original del modelo no se detalla en la informacion disponible, pero al ser una re-exportacion, las caracteristicas de entrenamiento (dataset, numero de tokens, uso de RLHF) no son relevantes para esta version ONNX.

## Capacidades

- Generacion de imagenes a partir de prompts de texto, con resoluciones configurables (el ejemplo usa 512x512, pero el scheduler soporta hasta 4096 tokens de imagen).
- Ejecucion completamente en el navegador via WebGPU, sin servidor ni API key.
- Funcionamiento offline tras la primera descarga de 6,5 GB.
- Soporte de cuantizacion int8 en el transformer e int4 en el text encoder para reducir el peso y la memoria.
- Integracion con ONNX Runtime Web, permitiendo su uso en aplicaciones JavaScript/TypeScript.
- No incluye tool calling, agentes ni capacidades multimodales adicionales; es exclusivamente text-to-image.

## Casos de uso

- Generacion de imagenes en aplicaciones web sin backend: un sitio de marketing o una herramienta de diseno puede ofrecer generacion de imagenes directamente en el navegador del usuario, sin coste de servidor ni preocupaciones de privacidad, ya que los datos no se suben a ningun servidor.
- Prototipado rapido de conceptos visuales: disenadores y desarrolladores pueden generar imagenes de prueba en su navegador para validar ideas antes de producir assets finales, gracias a la velocidad de 22 segundos por imagen a 512x512.
- Herramientas educativas de IA generativa: en cursos o talleres, los estudiantes pueden experimentar con un modelo de difusion de ultima generacion sin necesidad de instalar Python ni GPUs dedicadas, solo con un navegador compatible con WebGPU.
- Generacion de contenido para redes sociales: creadores de contenido pueden producir imagenes personalizadas para posts, historias o banners directamente desde una aplicacion web, sin depender de servicios externos.
- Asistentes creativos en el navegador: una extension de navegador o una aplicacion de dibujo puede integrar generacion de imagenes como funcionalidad adicional, aprovechando que el modelo se ejecuta localmente y no requiere conexion a internet tras la primera carga.
- Demostraciones y pruebas de concepto en entornos corporativos: equipos de innovacion pueden evaluar la viabilidad de la generacion de imagenes en el cliente antes de invertir en infraestructura de servidores, usando esta version ONNX como prueba de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo proporciona metricas de fidelidad de la exportacion (similitud coseno contra PyTorch), que no son comparables con benchmarks de calidad de imagen como FID o CLIP score. Se indica que la generacion de una imagen 512x512 a 4 pasos tarda aproximadamente 22 segundos en una GPU discreta reciente, pero no se ofrecen datos de throughput ni comparaciones con otros modelos.

## Requisitos de hardware

- Requiere un navegador con soporte WebGPU (Chrome, Edge, Firefox Nightly, etc.) y una GPU compatible con WebGPU.
- La primera carga descarga 6,5 GB de pesos, que se cachean en el navegador; despues funciona offline.
- VRAM estimada: no se especifica, pero al estar cuantizado (int8 en el transformer, int4 en el text encoder), es probable que quepa en GPUs de 8 GB o mas. El VAE en float32 es pequeno (0,20 GB).
- GPU recomendada: cualquier GPU discreta reciente (NVIDIA, AMD) con soporte WebGPU. En una GPU discreta, 512x512 a 4 pasos tarda ~22 segundos.
- Opciones de despliegue: exclusivamente en navegador via ONNX Runtime Web. No se proporcionan instrucciones para servidores, aunque el mismo ONNX podria ejecutarse con ONNX Runtime en CPU/GPU si se desea.
- Latencia: ~22 segundos por imagen a 512x512 y 4 pasos en GPU discreta; tiempos mayores en GPUs integradas o con mas pasos.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de generacion de imagenes en navegador. La unica alternativa conocida es el repositorio `MarkShark2/flux2-klein-4b-onnx-webgpu-q4`, que es un bundle similar para ONNX Runtime WebGPU, pero sin licencia declarada (segun la model card de cgb). El modelo original `black-forest-labs/FLUX.2-klein-4B` en PyTorch ofrece la misma calidad de generacion pero requiere infraestructura de servidor o GPU local con Python. No hay datos de benchmarks comparativos entre estas opciones.

## Limitaciones y advertencias

- La cuantizacion int8 en el transformer y int4 en el text encoder puede introducir una ligera degradacion de calidad respecto al modelo original en float32, aunque la similitud coseno es alta (0,9994 y 0,9992 respectivamente).
- El text encoder esta truncado a 28 de 36 capas, lo que podria afectar a la comprension de prompts complejos o largos.
- Requiere WebGPU; no funciona en navegadores antiguos o sin soporte WebGPU, lo que limita su alcance a usuarios con hardware y navegadores actualizados.
- La primera descarga de 6,5 GB puede ser un obstaculo en conexiones lentas o con limites de datos.
- No se han publicado evaluaciones de sesgos o alucinaciones visuales; como modelo de generacion de imagenes, puede producir contenido estereotipado o no deseado.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que los pesos del modelo base (FLUX.2 Klein 4B) tambien son Apache-2.0, como se indica en la model card.
- El codigo de ejemplo muestra que es necesario gestionar cuidadosamente los workers de ONNX Runtime para liberar memoria GPU; un uso incorrecto puede provocar fallos de memoria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cgb/flux2-klein-4b-onnx-webgpu
- Demo en linea: https://freegen.ai/imagine
- Modelo base original: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Repositorio alternativo (MarkShark2): https://huggingface.co/MarkShark2/flux2-klein-4b-onnx-webgpu-q4
- Aplicacion de ejemplo (ryanhlewis/flux2-webgpu): https://github.com/ryanhlewis/flux2-webgpu
