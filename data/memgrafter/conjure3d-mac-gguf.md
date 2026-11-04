# memgrafter/conjure3d-mac-gguf

## Resumen

Conjure3D para Apple Silicon es una conversión a formato GGUF de los pesos de TRELLIS.2-4B (microsoft) y BiRefNet (ZhengPeng7), empaquetada por el usuario memgrafter para ejecutar generación de mallas 3D a partir de una imagen (image-to-3D) sobre Metal en equipos con chip de Apple. El repositorio no contiene un modelo nuevo: son los mismos pesos de TRELLIS.2 y BiRefNet, convertidos con trellis.cpp (un port en C++/GGML del pipeline original) para que puedan cargarse sin CUDA en macOS.

El pipeline es multi-etapa: un modelo de flujo (flow) genera un campo latente de forma a 512 o 1024 de resolución, un decodificador conv3D lo convierte en geometría, y un segundo par flujo/decodificador genera la textura. BiRefNet se emplea para el recorte del objeto de entrada. El total de parámetros declarado en safetensors es de 220.674.162, aunque el modelo base TRELLIS.2-4B se denomina "4B" en su identificador; la cifra real corresponde a los tensores empaquetados y no debe interpretarse como el tamaño del modelo original.

El estado es explícitamente experimental: el autor advierte que la salida no es idéntica a la ruta CUDA y que los activos que se vayan a publicar deben generarse con la ruta CUDA. Es relevante ahora porque permite probar imágenes y semillas en un Mac sin GPU NVIDIA, con un consumo de memoria medido de 2,65 a 5,30 GiB en un Apple M6 de 24 GiB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusión/flujo latente para image-to-3D (DiT de flujo para forma y textura, decodificadores conv3D) más BiRefNet para segmentación |
| Parametros totales | 220.674.162 (dato de safetensors del repo); el modelo base se identifica como TRELLIS.2-4B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | Pesos en GGUF con matrices en f16 y tensores 1-D en f32; no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible (modelo multimodal imagen a 3D, sin interfaz de texto) |
| Licencia | MIT (TRELLIS.2 y BiRefNet son MIT; DINOv3 tiene licencia aparte y repo con acceso restringido) |
| Formato de pesos | GGUF (ss_flow, ss_dec, shape_flow_512/1024, shape_dec, tex_flow_512/1024, tex_dec, birefnet) más manifest.json con SHA-256 |

## Arquitectura y entrenamiento

El repositorio no entrena nada: es una conversión de formato. Los pesos proceden de TRELLIS.2-4B en la revisión fijada af44b45f, con checkpoints concretos: ss_flow_img_dit_1_3B_64_bf16, slat_flow_img2shape_dit_1_3B_512_bf16 y _1024_bf16, slat_flow_imgshape2tex_dit_1_3B_512_bf16 y _1024_bf16, junto con los decodificadores ss_dec_conv3d_16l8_fp16, shape_dec_next_dc_f16c32_fp16 y tex_dec_next_dc_f16c32_fp16. BiRefNet se toma de ZhengPeng7/BiRefNet en la revisión e2bf8e44.

La conversión la realiza mac/convert_weights.py en tres pasos: verificación del SHA-256 de cada fichero fuente contra su pin, ejecución del conversor de trellis.cpp (tools/convert.py, commit c0bed38c, tag v0.8.1) y escritura de manifest.json. En la conversión, las matrices se almacenan como f16 y los tensores 1-D como f32. La ruta de ejecución es trellis.cpp sobre Metal. El pipeline requiere además dinov3.gguf para las características de imagen que consume TRELLIS.2; ese fichero vive en un repositorio con acceso restringido por la licencia DINOv3 y puede generarse localmente con mac/convert_weights.py tras aceptar dicha licencia.

## Capacidades

- Generación de mallas 3D texturizadas a partir de una única imagen de entrada (image-to-3D).
- Generación de forma a dos resoluciones de latente, 512 y 1024, mediante flujos dedicados.
- Generación de textura sobre la geometría producida, con flujos específicos para 512 y 1024.
- Recorte automático del objeto de interés en la imagen de entrada mediante BiRefNet.
- Ejecución en Apple Silicon sobre Metal a través de trellis.cpp, sin CUDA.
- Verificación de integridad de cada GGUF cargado contra manifest.json en cada ejecución.
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades de lenguaje: es un pipeline de visión a 3D.
- No se documentan capacidades multilingües ni modo de razonamiento.

## Casos de uso

- Prototipado rápido de assets 3D en un Mac: un artista o desarrollador puede introducir una imagen de referencia y obtener una malla texturizada para evaluar composición y semillas antes de pasar a la ruta CUDA, con tiempos de 202 a 803 s por objeto (mediana 312 s) en un M6 de 24 GiB.
- Evaluación de pipelines image-to-3D sin GPU NVIDIA: equipos de investigación que solo disponen de portátiles o estaciones Apple Silicon pueden reproducir el flujo de TRELLIS.2 y comparar resultados cualitativos frente a la referencia CUDA.
- Previsualización de catálogos de producto: generar borradores de modelos 3D a partir de fotografías para revisar volumetría y textura antes de encargar la versión final en la ruta CUDA.
- Docencia y demos: el consumo contenido de memoria (2,65 a 5,30 GiB de pico) permite ejecutar el pipeline en un portátil con 24 GiB y mostrar el proceso completo en clase o en una charla.
- Pruebas de semillas y de imágenes de entrada: el autor indica que la ruta sirve para probar imágenes y semillas en un Mac, lo que encaja en la selección de candidatos antes de un render definitivo.
- Integración en herramientas locales de modelado: al ser GGUF y ejecutarse con trellis.cpp, puede envolverse en scripts propios que automaticen la generación de borradores a partir de una carpeta de imágenes.
- Verificación de cadena de suministro de pesos: el manifest.json con SHA-256 por fichero permite auditar que los pesos descargados coinciden con las fuentes fijadas, útil en entornos con requisitos de trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento aportados son operativos: en un Apple M6 con 24 GiB, un objeto tardó entre 202 y 803 s (mediana 312 s) con el perfil draft, y el pico de memoria estuvo entre 2,65 y 5,30 GiB (medición del 2026-11-01). El espacio en disco necesario es de 15,0 GB para los ficheros que usa la ruta (15,4 GB incluyendo birefnet.gguf) y 0,6 GB para dinov3.gguf.

## Requisitos de hardware

- Plataforma: macOS sobre Apple Silicon exclusivamente; la ruta usa Metal a través de trellis.cpp.
- VRAM/memoria unificada: pico medido de 2,65 a 5,30 GiB en un Apple M6 de 24 GiB; se recomienda un equipo con al menos 24 GiB para margen.
- GPU recomendadas: chips de Apple Silicon; el dato medido corresponde a un M6. No se documentan resultados en A100, H100 ni RTX 4090 porque la ruta no emplea CUDA.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon; no está pensado para GPUs NVIDIA de consumo en esta ruta.
- Disco: 15,0 GB para los ficheros de la ruta, 0,6 GB adicionales para dinov3.gguf y 0,4 GB extra si se incluye birefnet.gguf.
- Opciones de despliegue: trellis.cpp (C++/GGML) sobre Metal, orquestado por Conjure3D con config.env, mac/setup_mac.sh build y el entorno virtual MAC_VENV. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este pipeline.
- Latencia y throughput: 202 a 803 s por objeto (mediana 312 s) con perfil draft en M6 de 24 GiB; no se documenta throughput por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Conjure3D mac-gguf (esta ficha) | 220.674.162 en safetensors del repo; base TRELLIS.2-4B | No aplica | Malla 3D texturizada desde imagen, vía Metal | MIT (DINOv3 aparte) | HuggingFace, experimental |
| microsoft/TRELLIS.2-4B (modelo base) | Identificado como 4B | No aplica | Malla 3D texturizada desde imagen, ruta CUDA | MIT | HuggingFace, referencia oficial |
| ZhengPeng7/BiRefNet (componente) | No disponible en la información | No aplica | Segmentación de primer plano | MIT | HuggingFace, usado para el recorte |

No se dispone de datos de benchmarks que permitan comparar calidad de malla o textura entre estas opciones; la comparación se limita a procedencia, licencia y vía de ejecución.

## Limitaciones y advertencias

- Estado experimental declarado por el autor: la salida no es la misma que la de la ruta CUDA; los activos destinados a publicación deben generarse en la ruta CUDA.
- Dependencia de un repositorio con acceso restringido para dinov3.gguf, sujeto a la licencia DINOv3, distinta de la MIT del resto; hay que aceptarla con una cuenta propia.
- La licencia MIT cubre los pesos convertidos de TRELLIS.2 y BiRefNet, pero no necesariamente los componentes de terceros que intervienen en el pipeline.
- El recorte usa el fichero safetensors de BiRefNet, no birefnet.gguf; este último se incluye pero la ruta de Conjure3D no lo emplea, lo que puede confundir en el despliegue.
- Cada ejecución verifica los GGUF contra manifest.json y se detiene si falta o difiere un fichero; cualquier edición local de los pesos rompe la ejecución.
- No hay información sobre sesgos, alucinación geométrica o calidad de textura en casos límite; al ser un modelo de reconstrucción 3D, los errores se manifiestan como geometría inconsistente o texturas incorrectas, no como texto.
- No se documentan idiomas soportados ni interfaz de texto, por lo que no aplica evaluación multilingüe.
- Requiere macOS y Apple Silicon; no hay ruta documentada para Linux, Windows ni GPUs NVIDIA en este repositorio.
- Tiempos por objeto de varios minutos (hasta 803 s medidos) hacen inviable su uso interactivo en producción con esta ruta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/memgrafter/conjure3d-mac-gguf
- Repositorio de DINOv3 en GGUF (acceso restringido): https://huggingface.co/memgrafter/conjure3d-mac-dinov3-gguf
- Proyecto Conjure3D: https://github.com/memgrafter/conjure3d
- Documentación para Mac: https://github.com/memgrafter/conjure3d/blob/main/docs/MAC.md
- trellis.cpp (port C++/GGML de TRELLIS.2): https://github.com/pwilkin/trellis.cpp
- Modelo base TRELLIS.2-4B: https://huggingface.co/microsoft/TRELLIS.2-4B
- Modelo base BiRefNet: https://huggingface.co/ZhengPeng7/BiRefNet
