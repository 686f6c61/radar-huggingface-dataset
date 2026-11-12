# Codixor/vision-gguf

## Resumen

Codixor/vision-gguf es un repositorio de pesos convertidos para el ecosistema rcumfy, una herramienta desarrollada por el mismo autor que agrupa los motores vision.cpp y stable-diffusion.cpp. No se trata de un modelo de lenguaje generativo al uso, sino de un paquete de artefactos de vision y personalizacion de imagenes: por un lado, el codificador visual CLIP ViT-H/14 (variante LAION-2B de OpenCLIP, en formato GGUF F16) y, por otro, los pesos de PhotoMaker V2 de TencentARC en safetensors, reorganizados para encajar con el layout de stable-diffusion.cpp.

El interes practico del repositorio es la distribucion de pesos ya convertidos sin depender de Python ni PyTorch: la conversion se realizo con la herramienta `vision.cpp/tools/convert-rs`, escrita en Rust. Esto simplifica el despliegue en entornos donde no se quiere arrastrar el stack de PyTorch, y permite alimentar directamente pipelines de generacion de imagen condicionada por rostro (PhotoMaker) junto con el codificador CLIP que esas tuberias necesitan.

El dato de parametros reportado por safetensors (632.076.800) corresponde a los tensores del codificador CLIP ViT-H/14, no a un modelo de lenguaje. El repositorio ocupa 3,1 GB e incluye pesos con licencias distintas por fichero (MIT para el CLIP y Apache-2.0 para PhotoMaker V2), de ahi la licencia "other" con nombre "per-file". No hay informacion publicada sobre benchmarks, idiomas ni pipeline asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador visual CLIP ViT-H/14 (OpenCLIP, LAION-2B) y pesos PhotoMaker V2 para stable-diffusion.cpp |
| Parametros totales | 632.076.800 (tensores safetensors del CLIP ViT-H/14) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16 en el fichero GGUF del CLIP; safetensors sin cuantizar para PhotoMaker V2 |
| Idiomas soportados | No disponible |
| Licencia | Other, nombre "per-file": MIT para `CLIP-ViT-H-14-F16.gguf`, Apache-2.0 para `photomaker-v2.safetensors` |
| Formato de pesos | GGUF (CLIP) y safetensors (PhotoMaker V2) |

## Arquitectura y entrenamiento

El componente CLIP es un Vision Transformer ViT-H/14 entrenado por OpenCLIP sobre el dataset LAION-2B, empaquetado originalmente en el formato de ComfyUI (`clip_vision_h.safetensors`) y reconvertido a GGUF F16 con el arquetipo `clip` de vision.cpp. El autor indica que la salida coincide con una referencia en NumPy con coseno 1.0000, lo que sugiere una conversion numericamente fiel sin perdida apreciable de precision mas alla del propio F16.

PhotoMaker V2 es un adaptador de identidad para modelos de difusion desarrollado por TencentARC: en inferencia requiere un embedding de identidad facial adicional, que no forma parte de este repositorio. Los tensores se han copiado byte a byte desde el `.bin` original (leido como datos, nunca ejecutado como pickle) y renombrados al esquema de stable-diffusion.cpp. No hay informacion sobre datos de entrenamiento propios, procesos de RLHF/DPO ni innovaciones de decodificacion, ya que el repositorio solo redistribuye pesos convertidos.

## Capacidades

- Extraccion de embeddings visuales mediante CLIP ViT-H/14, util como condicionador en pipelines de difusion (por ejemplo, IP-Adapter o ControlNet basados en CLIP vision).
- Personalizacion de identidad facial en generacion de imagen con PhotoMaker V2, tomando una o varias fotos de referencia y un embedding de cara en tiempo de inferencia.
- Conversion y carga sin Python ni PyTorch: los pesos estan pensados para los motores vision.cpp y stable-diffusion.cpp.
- Compatibilidad con el formato GGUF para el codificador CLIP, lo que facilita su uso en runtimes nativos.
- No soporta generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni modo thinking: no es un modelo de lenguaje.
- Capacidades multilingues: no disponibles (no aplica a un codificador visual).

## Casos de uso

- Generacion de retratos personalizados: usar PhotoMaker V2 junto con un modelo de difusion base para producir imagenes de una persona concreta a partir de una o varias fotos de referencia, manteniendo rasgos faciales consistentes entre generaciones.
- Integracion en stable-diffusion.cpp: desplegar el pipeline completo en C++ sin dependencias de Python, util en aplicaciones de escritorio o entornos embebidos donde el stack de PyTorch no es viable.
- Condicionamiento visual en pipelines de difusion: emplear el CLIP ViT-H/14 en GGUF como extractor de caracteristicas para adaptadores de imagen (estilo, composicion o referencia visual).
- Herramientas de edicion fotografica con identidad: construir funciones de "retrato con mi cara" o avatares consistentes dentro de una app de edicion, cargando los pesos ya convertidos.
- Prototipado e investigacion en vision por computador: reutilizar el codificador CLIP en experimentos de retrieval o clasificacion zero-shot, con la ventaja de un formato ligero y portable.
- Validacion de conversiones: servir como referencia para verificar que una conversion GGUF de CLIP reproduce fielmente la salida del original (el autor documenta coincidencia coseno 1.0000 frente a NumPy).
- Distribucion de pesos en entornos air-gapped: al no requerir Python ni ejecutar pickles, el repositorio simplifica la instalacion en sistemas con restricciones de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el CLIP ViT-H/14 en F16 ocupa aproximadamente 1,2-1,3 GB (632 M parametros a 2 bytes); el fichero safetensors de PhotoMaker V2 anade el resto hasta los 3,1 GB del repositorio.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para cargar CLIP y PhotoMaker junto a un modelo de difusion base; se recomienda una RTX 3060/4060 o superior para pipelines completos de generacion de imagen.
- Cabe en GPU de consumo: si, el codificador CLIP por si solo cabe en GPUs de gama media e incluso en iGPU con suficiente memoria compartida; el pipeline completo depende del modelo de difusion que se anade.
- Opciones de despliegue: vision.cpp, stable-diffusion.cpp y la herramienta rcumfy del autor; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de pesos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Uso |
|---|---|---|---|---|
| Codixor/vision-gguf (CLIP ViT-H/14) | 632 M | GGUF F16 | MIT (fichero CLIP) | Codificador visual para difusion |
| OpenCLIP ViT-H/14 LAION-2B (original) | 632 M | safetensors | MIT | Codificador visual, requiere PyTorch |
| ComfyUI `clip_vision_h.safetensors` | 632 M | safetensors | MIT | Codificador visual en ComfyUI |
| TencentARC/PhotoMaker-V2 | No disponible | `.bin` (pickle) | Apache-2.0 | Personalizacion de identidad facial |

La diferencia principal frente a los originales no esta en el modelo sino en el empaquetado: formato GGUF, conversion en Rust y ausencia de dependencia de Python/PyTorch. El rendimiento deberia ser equivalente al original al ser una conversion fiel, aunque no hay benchmarks publicados que lo confirmen.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes; cualquier evaluacion debe hacerse en el contexto de vision o generacion de imagen.
- PhotoMaker V2 requiere un embedding de identidad facial en tiempo de inferencia que no se incluye en el repositorio; sin ese componente el adaptador no es funcional por si solo.
- Licencias mixtas por fichero: el CLIP es MIT, pero PhotoMaker V2 es Apache-2.0 y su uso comercial queda sujeto a las condiciones de TencentARC y del modelo de difusion base que se combine.
- Riesgo de sesgos y alucinacion visual: al derivar de LAION-2B, el codificador CLIP hereda los sesgos del dataset web; PhotoMaker puede reproducir o exagerar rasgos de identidad y no garantiza fidelidad absoluta al rostro de referencia.
- El repositorio tiene 0 descargas y 0 likes, sin pipeline declarado ni idiomas documentados; la validacion externa es practicamente inexistente.
- La fecha de creacion indicada (2026-11-12) es futura respecto a la mayoria de referencias, lo que conviene verificar antes de integrarlo en produccion.
- La conversion se realizo con herramientas del propio autor (`vision.cpp/tools/convert-rs`); no hay verificacion independiente mas alla de la referencia NumPy mencionada en la model card.
- No hay informacion sobre contexto, cuantizaciones alternativas (Q4, Q8) ni soporte en otros runtimes, lo que limita la planificacion de despliegues a gran escala.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Codixor/vision-gguf
- Repositorio rcumfy: https://github.com/codixor/rcumfy
- PhotoMaker V2 (TencentARC): https://huggingface.co/TencentARC/PhotoMaker-V2
- OpenCLIP (referencia del codificador ViT-H/14 LAION-2B): no disponible en la informacion proporcionada
- vision.cpp y stable-diffusion.cpp: no disponibles como enlaces directos en la informacion proporcionada
