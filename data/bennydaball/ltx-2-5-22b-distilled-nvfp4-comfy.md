# BennyDaBall/LTX-2.5-22b-distilled-nvfp4-comfy

## Resumen

LTX-2.5 22B distilled NVFP4 para ComfyUI es una cuantización en punto flotante de 4 bits (NVFP4) del transformer de difusión destilado LTX-2.5 de Lightricks, adaptada por BennyDaBall para que cargue correctamente en ComfyUI. El modelo original de Lightricks se distribuye en dos formatos oficiales: una versión int8 preparada para ComfyUI (21,5 GB) y un export NVFP4 crudo de TensorRT-ModelOpt que no es compatible con el cargador de ComfyUI debido a la ausencia de los marcadores internos que identifican las capas cuantizadas. Este repositorio resuelve ese problema añadiendo un tensor marcador `{"format": "nvfp4"}` a las 1176 capas cuantizadas, sin retocar los pesos, logrando un archivo de 18,7 GB que funciona directamente en las plantillas nativas de LTX-2.5 de ComfyUI.

La relevancia de esta versión radica en que reduce el uso de VRAM en aproximadamente 2,8 GB respecto al oficial int8, lo que proporciona margen adicional para generar clips más largos sin caer en el intercambio a memoria del sistema. Las pruebas del autor muestran que, con la misma semilla y prompt, los resultados son prácticamente idénticos a los del int8, tanto en composición como en detalle y movimiento. El modelo soporta generación de vídeo a partir de texto y de imagen, con audio sincronizado nativo, y requiere una GPU Blackwell (serie RTX 50) para ejecutar los kernels FP4.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) para generacion de video, cuantizado NVFP4 |
| Parametros totales | 22 mil millones (segun denominacion del modelo) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (modelo de video, sin contexto de texto definido) |
| Tipos de cuantizacion | NVFP4, grupo 16, escalas ModelOpt |
| Idiomas soportados | No disponible |
| Licencia | LTX-2.x Community License |
| Formato de pesos | Archivo unico para ComfyUI (diffusion-single-file), formato no especificado |

## Arquitectura y entrenamiento

El modelo base es LTX-2.5 22B distilled, un transformer de difusion desarrollado por Lightricks para generacion de video con audio sincronizado. La version destilada reduce el coste computacional respecto al modelo completo manteniendo una calidad visual alta. Este repositorio no modifica la arquitectura ni los pesos; se limita a aplicar una cuantizacion NVFP4 (4 bits) con agrupacion de 16 elementos y escalas calculadas con ModelOpt, sobre las 1176 capas lineales del transformer. La intervencion de BennyDaBall consiste en anadir un tensor marcador `.comfy_quant` con el formato `nvfp4` a cada capa cuantizada, que es el mecanismo que ComfyUI utiliza para detectar y desempaquetar correctamente los pesos de 4 bits. No hay informacion publica sobre el dataset de entrenamiento del modelo base ni sobre el proceso de destilacion.

## Capacidades

- Generacion de video a partir de prompts de texto (text-to-video).
- Generacion de video a partir de una imagen inicial (image-to-video), manteniendo coherencia con el fotograma de partida.
- Audio sincronizado nativo: los clips generados incluyen pista de audio coherente con el contenido visual.
- Compatibilidad directa con ComfyUI mediante las plantillas oficiales LTX-2.5 Text to Video e Image to Video, sin nodos personalizados.
- Cuantizacion NVFP4 que reduce el peso del modelo a 18,7 GB, liberando VRAM para secuencias mas largas o resoluciones mayores.
- Reproducibilidad: con la misma semilla y prompt, los resultados son muy cercanos a los de la version int8 oficial, lo que facilita la comparacion entre cuantizaciones.

## Casos de uso

- Produccion de video creativo: generar clips de 10 segundos a 1280x736 con audio sincronizado a partir de descripciones textuales, util para moodboards, storyboards o contenido para redes sociales.
- Animacion de imagenes fijas: convertir una fotografia o ilustracion en un clip animado con movimiento natural, aplicable en diseno de producto, publicidad o arte digital.
- Creacion de contenido con banda sonora integrada: el audio sincronizado evita el paso adicional de postproduccion, agilizando la generacion de videos cortos para plataformas como TikTok o Instagram Reels.
- Prototipado rapido en estudios de diseno: los creadores pueden generar variaciones de una misma escena en menos de un minuto por clip (50 segundos en una RTX 5090), acelerando la exploracion de ideas.
- Generacion de material de relleno para edicion: producir tomas de transicion o clips de ambiente que complementen secuencias grabadas, reduciendo costes de produccion.
- Investigacion en eficiencia de cuantizacion: este modelo sirve como caso de estudio para evaluar el impacto de NVFP4 en la calidad de video generado, comparando con int8 y otras precisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (como FVD, CLIP score u otros) en la informacion disponible. El autor proporciona datos empiricos de rendimiento:

| Metrica | Valor |
|---|---|
| Duracion del clip generado | 10 segundos |
| Resolucion | 1280x736 |
| Tiempo de generacion (incluyendo carga inicial) | ~50 segundos en RTX 5090 |
| Peso del archivo | 18,7 GB |
| Reduccion de peso frente a int8 oficial | ~2,8 GB |

## Requisitos de hardware

- GPU obligatoria: arquitectura Blackwell (serie RTX 50) para ejecutar los kernels FP4. No funciona en GPUs de generaciones anteriores (Ampere, Ada Lovelace, etc.).
- VRAM estimada: 18,7 GB para los pesos, mas el overhead de activaciones y el modelo de texto y VAE. En una RTX 5090 (32 GB) funciona con margen para clips largos.
- Software: ComfyUI version 0.32.0 o superior.
- Despliegue: el modelo se carga como `unet_name` en las plantillas LTX-2.5 nativas de ComfyUI. No se menciona soporte para otros motores como vLLM o llama.cpp, ya que es un modelo de difusion.
- Latencia: aproximadamente 50 segundos para un clip de 10 segundos a 1280x736 en RTX 5090, incluyendo la primera carga del modelo.

## Comparativa con modelos similares

| Modelo | Tamano | VRAM | Formato | Compatibilidad ComfyUI | Requisito GPU |
|---|---|---|---|---|---|
| LTX-2.5 22B distilled NVFP4 (este repo) | 18,7 GB | ~19 GB + overhead | NVFP4 | Si (con marcadores anadidos) | Blackwell |
| LTX-2.5 22B distilled comfy-int8-convrot (oficial) | 21,5 GB | ~22 GB + overhead | INT8 | Si | Cualquier GPU con soporte int8 |
| LTX-2.5 22B distilled NVFP4 (export oficial de Lightricks) | ~18,7 GB | ~19 GB + overhead | NVFP4 | No (falla al cargar) | Blackwell |

La diferencia clave entre las tres versiones es la compatibilidad con ComfyUI y el requisito de hardware. La version NVFP4 de este repo ofrece el menor peso y mantiene compatibilidad, pero exige una GPU Blackwell. La version int8 oficial funciona en hardware mas variado a costa de un mayor uso de VRAM. No se dispone de comparativas con otros modelos de generacion de video como Sora, Runway o Kling en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere hardware Blackwell: no es ejecutable en GPUs consumer de generaciones anteriores, lo que limita su uso a equipos con RTX 50-series.
- No es pixel-idéntico a la version int8: aunque las diferencias son minimas, existe un ruido de cuantizacion distinto que puede ser perceptible en ciertos casos.
- Licencia comunitaria LTX-2.x: incluye restricciones de uso comercial que deben revisarse en el archivo de licencia incluido en el repositorio.
- Riesgo de alucinacion visual: como todo modelo generativo, puede producir contenido inconsistente o no deseado; el autor advierte que el uso es bajo responsabilidad del usuario.
- Sin informacion sobre sesgos: no se han publicado evaluaciones de sesgo o seguridad para esta cuantizacion especifica.
- Dependencia de ComfyUI: el marcador `.comfy_quant` esta disenado para esta plataforma; no se garantiza su funcionamiento en otros entornos de inferencia.

## Enlaces

- Repositorio del modelo: https://huggingface.co/BennyDaBall/LTX-2.5-22b-distilled-nvfp4-comfy
- Modelo base (Lightricks/LTX-2.5): https://huggingface.co/Lightricks/LTX-2.5
- Archivo de licencia: https://huggingface.co/BennyDaBall/LTX-2.5-22b-distilled-nvfp4-comfy/blob/main/LICENSE.txt
- Autor en X: https://x.com/BennyDaBall_OG
