# alkyum/neverseen-trellis2

## Resumen

`alkyum/neverseen-trellis2` no es un modelo de lenguaje, sino un paquete de artefactos (pesos y configuraciones) que reproduce el pipeline de generacion 3D de TRELLIS.2 de Microsoft, tal como lo consume el flujo de trabajo `trellis2` de Neverseen Studio a traves de sus endpoints serverless en RunPod. El autor, alkyum, lo describe explicitamente como una "slim copy" de los ficheros usados por dicho workflow, copiados sin modificacion desde el repositorio upstream `Aero-Ex/Trellis2-GGUF` (y `Aero-Ex/Dinov3` para el codificador de imagenes), conservando cada uno su licencia original.

El contenido combina varios componentes: codificadores y decodificadores de forma y textura (Stage1 y Stage2), tres redes DiT de aproximadamente 1.300 millones de parametros cada una (`slat_flow_img2shape_dit_1_3B` en variantes 512 y 1024, `slat_flow_imgshape2tex_dit_1_3B` en 512 y 1024, y `ss_flow_img_dit_1_3B_64`), un refiner, y el backbone visual DINOv3 ViT-L/16 de Meta como extractor de caracteristicas de imagen. El total agregado de parametros reportado por los safetensors es de 1.292.179.976, aunque conviene interpretarlo con cautela: corresponde a la suma de los tensores presentes, no a un unico modelo monolitico.

Su relevancia es practica y acotada: sirve como snapshot reproducible para quien quiera ejecutar el pipeline TRELLIS.2 (generacion de mallas 3D con textura a partir de imagenes) sin depender de que el repositorio upstream mantenga exactamente los mismos ficheros. No es una release oficial de Microsoft ni de Neverseen Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline multi-etapa de generacion 3D: codificadores/decodificadores de forma y textura, DiT (diffusion transformer) con flow matching para SLAT (structured latent), refiner DiT y backbone visual DINOv3 ViT-L/16 |
| Parametros totales | 1.292.179.976 (suma de tensores en safetensors del repo) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: no es un modelo de lenguaje) |
| Tipos de cuantizacion | BF16 (ficheros `_bf16`), FP16 (decoders `_fp16`) y GGUF Q8_0 en las DiT de shape, texture y refiner |
| Idiomas soportados | no disponible |
| Licencia | Mixta: MIT para los componentes TRELLIS.2 (microsoft/TRELLIS.2); DINOv3 License (Meta) para el codificador `facebook/dinov3-vitl16-pretrain-lvd1689m`, con copia en NOTICE |
| Formato de pesos | safetensors, GGUF (Q8_0) y JSON de configuracion de pipeline |

## Arquitectura y entrenamiento

El paquete no entrena nada: redistribuye pesos ya entrenados. La arquitectura subyacente es la de TRELLIS.2, un sistema de generacion de activos 3D que trabaja sobre una representacion latente estructurada (SLAT). El flujo se organiza en etapas: un codificador de imagen (DINOv3 ViT-L/16, patch 16, preentrenado en LVD-1689M) extrae caracteristicas; las DiT de `shape` (`slat_flow_img2shape_dit_1_3B` en resoluciones 512 y 1024) generan la geometria mediante flow matching sobre el latente; las DiT de `texture` (`slat_flow_imgshape2tex_dit_1_3B`) sintetizan la apariencia condicionada por imagen y forma; y los decodificadores de Stage1 y Stage2 (`ss_dec_conv3d_16l8_fp16`, `shape_dec_next_dc_f16c32_fp16`, `tex_dec_next_dc_f16c32_fp16`) convierten el latente en malla y textura finales. Un refiner (`ss_flow_img_dit_1_3B_64`) pule el resultado. Los codificadores `shape_enc_next_dc_f16c32_fp16` y `tex_enc_next_dc_f16c32_fp16` cierran el ciclo para tareas de reconstruccion o edicion.

Los nombres de fichero revelan detalles de diseno: `conv3d_16l8` sugiere un decodificador convolucional 3D con 16 niveles y kernel 8; `dc_f16c32` apunta a una arquitectura con caracteristicas en FP16 y acumulacion/concatenacion en FP32. Las DiT se declaran como `1_3B`, es decir, en torno a 1.300 millones de parametros cada una. No se dispone de informacion sobre volumen de datos de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO o ajuste por preferencias; tampoco sobre innovaciones como decodificacion especulativa, que no aplican a este tipo de modelo.

## Capacidades

- Generacion de mallas 3D con textura a partir de imagenes de entrada (image-to-3D), en resoluciones latentes de 512 y 1024.
- Generacion de geometria sola (shape) y de textura sola (texture), con pipelines separados (`pipeline.json` y `texturing_pipeline.json`).
- Refinado del resultado mediante una DiT dedicada (`ss_flow_img_dit_1_3B_64`).
- Codificacion de forma y textura a latentes SLAT, habilitando reconstruccion y potencialmente edicion.
- Extraccion de caracteristicas visuales mediante DINOv3 ViT-L/16, util como encoder de imagen de proposito general.
- Ejecucion en cuantizacion Q8_0 GGUF de las DiT principales, lo que reduce requisitos de memoria.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): vision como encoder de imagen; sin modo de razonamiento ni audio.

## Casos de uso

- Prototipado de assets 3D para videojuegos: a partir de una imagen conceptual, el pipeline `slat_flow_img2shape_dit_1_3B_512` genera una malla base y `slat_flow_imgshape2tex_dit_1_3B_512` la texturiza, permitiendo iterar rapidamente sobre variantes de un prop sin modelado manual.
- Catalogos de e-commerce en 3D: convertir fotografias de producto en mallas texturizadas a 1024 para visores web, usando el refiner para suavizar artefactos antes de exportar.
- Previsualizacion arquitectonica o de interiorismo: generar volumetrias texturizadas a partir de renders o fotos de referencia, con la variante 1024 cuando se requiere mayor detalle geometrico.
- Investigacion en generacion 3D: el snapshot fija versiones concretas de pesos y configuraciones (`pipeline.json`, `texturing_pipeline.json`), lo que facilita reproducir experimentos y comparar variantes 512 frente a 1024.
- Integracion en endpoints serverless: al estar empaquetado para el workflow `trellis2` de Neverseen Studio sobre RunPod, sirve para desplegar un servicio de image-to-3D bajo demanda sin gestionar infraestructura propia.
- Extraccion de embeddings visuales: el DINOv3 ViT-L/16 incluido puede reutilizarse por separado para tareas de retrieval, clasificacion o segmentacion de imagenes, siempre respetando la licencia de Meta.
- Reconstruccion y edicion de activos existentes: los codificadores de shape y texture permiten proyectar mallas a latentes SLAT, paso previo a modificaciones o re-sintesis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como orientacion basada en los tamanos de fichero, las DiT de 1,3 B en BF16 ocupan del orden de 2,6 GB cada una; la variante Q8_0 reduce aproximadamente a la mitad. El repo completo pesa 11,8 GB, pero la inferencia solo carga la etapa activa, no todo a la vez.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano de modelo, una GPU con 16-24 GB (RTX 4090, A5000, L4) es un punto de partida razonable para BF16 en una sola etapa; A100 o H100 si se quiere margen para lotes mayores o resolucion 1024.
- Cabe en GPU de consumo: probablemente si en RTX 4090 (24 GB) y posiblemente en RTX 4080/3090 (16-24 GB) usando Q8_0, aunque no hay confirmacion oficial.
- Opciones de despliegue: el paquete esta pensado para el workflow `trellis2` de Neverseen Studio sobre RunPod Serverless; los GGUF Q8_0 sugieren soporte de runtimes compatibles con llama.cpp/gguf para las DiT, aunque no se documenta el runner exacto. vLLM y TGI no aplican (no es un LLM).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alkyum/neverseen-trellis2 | ~1,29 B (agregado) | no aplica | Image-to-3D texturizado | Mixta (MIT + DINOv3) | Hugging Face, snapshot de terceros |
| microsoft/TRELLIS.2 (upstream) | no disponible | no aplica | Image-to-3D texturizado | MIT | Repo oficial de Microsoft |
| Aero-Ex/Trellis2-GGUF | no disponible | no aplica | Image-to-3D texturizado en GGUF | MIT | Hugging Face, conversion comunitaria |

La diferencia clave frente al upstream es que este repo fija versiones concretas de ficheros y anade cuantizaciones Q8_0, a costa de no ser una release oficial y de mezclar licencias (MIT y DINOv3). Para produccion a largo plazo, el repositorio oficial de Microsoft es la referencia; este snapshot es util para reproducibilidad de un workflow concreto.

## Limitaciones y advertencias

- No es una release oficial: el autor lo declara como copia de ficheros de un workflow de terceros; no hay garantia de mantenimiento ni de que coincida con futuras versiones de TRELLIS.2.
- Licencia mixta: los componentes TRELLIS.2 son MIT, pero el codificador DINOv3 esta bajo la DINOv3 License de Meta, con terminos propios que deben revisarse antes de uso comercial. La ficha de Hugging Face no declara licencia global.
- Riesgo de alucinacion geometrica: como modelo generativo 3D, puede producir geometrias plausibles pero incorrectas (partes ocluidas inventadas, texturas incoherentes) que requieren validacion manual.
- Sin informacion sobre sesgos: no hay documentacion de sesgos en el dataset de entrenamiento ni evaluaciones de equidad.
- Idiomas y contexto: no aplica como modelo de lenguaje, por lo que no debe evaluarse con metricas de texto (MMLU, HumanEval, GSM8K).
- Dependencia de infraestructura: el empaquetado asume el runtime de Neverseen Studio/RunPod; ejecutarlo fuera de ese entorno puede requerir reconstruir el grafo de pipeline a partir de los JSON.
- Cero adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusion; no hay evidencia de uso en produccion.
- Resolucion limitada a 512 y 1024 en las DiT incluidas; no se documentan variantes superiores.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/alkyum/neverseen-trellis2
- Upstream de pesos TRELLIS.2 en GGUF: https://huggingface.co/Aero-Ex/Trellis2-GGUF
- Upstream del codificador DINOv3: https://huggingface.co/Aero-Ex/Dinov3
- Modelo DINOv3 original de Meta: https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m
- Repositorio TRELLIS.2 de Microsoft: https://github.com/microsoft/TRELLIS.2 (referenciado en la model card como origen de la licencia MIT)
