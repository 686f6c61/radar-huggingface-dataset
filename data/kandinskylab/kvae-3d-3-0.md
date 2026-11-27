# kandinskylab/KVAE-3D-3.0

## Resumen

KVAE-3D-3.0 es un tokenizador de vídeo (autoencoder variacional causal) desarrollado por Kandinsky Lab, disenado como componente de compresion latente para pipelines de difusion de vídeo. Su funcion no es generar contenido de forma autonoma, sino transformar fotogramas RGB en latentes continuos de 128 canales y reconstruirlos, actuando como pieza intermedia entre el vídeo crudo y un modelo de difusion. La version 3.0 incrementa la compresion espacial respecto a KVAE-3D-2.0, pasando de un factor f16t4 a f32t4 (4x en temporal, 32x en cada eje espacial).

El modelo tiene 1.124.851.587 parametros y una arquitectura totalmente convolucional, lo que permite inferencia sobre fotogramas completos sin restricciones de resolucion fijas (siempre que se respeten los multiplos de compresion). Alinea sus representaciones latentes con caracteristicas de V-JEPA durante el entrenamiento, lo que busca que los latentes sean mas utiles para modelos generativos posteriores.

Es relevante en el contexto actual de modelos de difusion de vídeo, donde el coste computacional del tokenizador condiciona directamente la viabilidad de entrenar y servir generadores. Un tokenizador con mayor compresion espacial reduce la longitud de secuencia de latentes y, por tanto, la carga de atencion en el modelo de difusion. La licencia MIT facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder variacional causal, totalmente convolucional (encoder-decoder con etapas de downsampling/upsampling y bloques residuales) |
| Parametros totales | 1.124.851.587 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa segmentos temporales con cache de bloques internos; `seg_len=16` en el ejemplo de referencia) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el ejemplo oficial usa bfloat16) |
| Idiomas soportados | no disponible (modelo de modalidad vídeo, no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `kvae`, PyTorch) |

## Arquitectura y entrenamiento

KVAE-3D-3.0 es un VAE causal de vídeo con compresion 4x temporal y 32x espacial en cada eje, y latentes de 128 canales. Respecto a KVAE-3D-2.0 (f16t4), el encoder incorpora una etapa adicional de downsampling, el decoder una etapa correspondiente de upsampling, y ambos suman bloques residuales. La naturaleza convolucional completa permite inferencia sobre fotogramas enteros y procesamiento por segmentos temporales mediante caches de bloques internos.

El entrenamiento alinea las representaciones latentes con caracteristicas de V-JEPA. El decoder se afina con imagenes y clips de vídeo, y el refinamiento a mayor resolucion produce mejores resultados segun la model card. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF/DPO (no aplicables de forma convencional a un tokenizador). El informe tecnico de la version 3.0 figura como "coming soon"; solo se enlaza el informe tecnico previo (arXiv:2608.05798).

Una innovacion operativa destacable es la normalizacion por canal de los latentes: `from_pretrained` carga `latent_mean` y `latent_std` junto con los pesos, y `encode`/`decode` aplican la transformada `z_normalized = (z_raw - latent_mean) / latent_std` de forma reversible. La normalizacion esta activada por defecto mediante `model.latent_normalization.enabled` en `config.json`.

## Capacidades

- Codificacion de vídeo RGB a latentes continuos de 128 canales con compresion 4x32x32.
- Reconstruccion de vídeo desde latentes (decoder convolucional).
- Inferencia a fotograma completo gracias a la arquitectura convolucional.
- Procesamiento por segmentos temporales con cache de bloques internos (streaming secuencial).
- Normalizacion por canal de latentes conmutable (`use_latent_norm`).
- Alineacion latente con caracteristicas V-JEPA para uso downstream en difusion.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de capacidades multilingues, de vision semantica ni de audio.

## Casos de uso

- Compresion latente para entrenamiento de generadores de vídeo por difusion: el tokenizador reduce un clip de T fotogramas a T/4 x H/32 x W/32 latentes de 128 canales, disminuyendo la longitud de secuencia que debe procesar el modelo de difusion y abaratando el coste de atencion.
- Preprocesado de datasets de vídeo a gran escala: convertir corpus de clips a latentes almacenables permite entrenar generadores sin recodificar el vídeo en cada epoch, con un factor de compresion espacial de 32x por eje.
- Reconstruccion y evaluacion de calidad de pipeline: usar `encode`/`decode` para medir PSNR, SSIM y LPIPS sobre MCL-JCV y validar que la cadena latente preserva fidelidad antes de invertir en entrenamiento generativo.
- Investigacion en representaciones latentes alineadas con V-JEPA: el modelo sirve como banco de pruebas para estudiar si la alineacion con caracteristicas auto-supervisadas mejora la generacion downstream.
- Integracion en pipelines de investigacion con PyTorch: la API `KVAEVideo.from_pretrained` y la normalizacion por canal facilitan experimentos reproducibles en Python 3.11, PyTorch 2.8.0 y CUDA 12.8.
- Prototipado de sistemas de vídeo generativo en entornos con licencia permisiva: la licencia MIT permite incorporar el tokenizador a productos comerciales sin obligaciones de copyleft.
- Procesamiento secuencial de streams de vídeo: el uso de caches de bloques internos permite codificar segmentos consecutivos de un mismo vídeo, siempre que no se intercalen flujos independientes en la misma instancia del modelo.

## Benchmarks y rendimiento

Reconstruccion evaluada sobre MCL-JCV (720p). PSNR y SSIM: mayor es mejor; LPIPS: menor es mejor. Negrita indica el mejor resultado por metrica segun la model card.

| Tokenizer | PSNR (dB) | SSIM | LPIPS |
|---|---:|---:|---:|
| FLUX.3-Action | **32.79** | **0.878** | 0.181 |
| MiniMax-H3 | 32.44 | 0.877 | 0.176 |
| KVAE-3D-3.0 | 32.26 | **0.878** | **0.161** |

No se han publicado en la informacion disponible resultados de generacion con cifras numericas: la model card menciona una figura comparativa de preferencia humana entre generadores, pero los valores no se incluyen en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 1.124.851.587 parametros, los pesos en bfloat16 ocupan aproximadamente 2,25 GB; en float32, unos 4,5 GB. A esto hay que sumar activaciones, que dependen de la resolucion y del numero de fotogramas procesados.
- GPU recomendadas: el entorno de referencia usa CUDA 12.8 y bfloat16, lo que apunta a GPU con soporte de bfloat16 (serie Ampere o posterior: A100, H100, RTX 30xx/40xx). No se especifican modelos concretos en la informacion disponible.
- Cabe en GPU de consumo: si, previsiblemente, para resoluciones y segmentos moderados, dado el tamano de pesos; la VRAM real dependera de las activaciones a fotograma completo con compresion 32x.
- Opciones de despliegue: la model card solo documenta inferencia mediante la libreria `kvae` y el repositorio de GitHub (PyTorch). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un tokenizador de vídeo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Compresion | Latentes | Licencia | Disponibilidad |
|---|---|---:|---|---|---|---|
| KVAE-3D-3.0 | VAE causal de vídeo | 1.124.851.587 | 4x32x32 | 128 canales | MIT | Hugging Face |
| KVAE-3D-2.0 t4s16 | VAE causal de vídeo | no disponible | 4x16x16 | 64 canales | no disponible | Hugging Face |
| KVAE-3D-2.0 t4s8 | VAE causal de vídeo | no disponible | 4x8x8 | 16 canales | no disponible | Hugging Face |
| KVAE-3D-1.0 | VAE causal de vídeo | no disponible | 4x8x8 | 16 canales | no disponible | Hugging Face |

En calidad de reconstruccion sobre MCL-JCV, KVAE-3D-3.0 queda practicamente empatado con FLUX.3-Action y MiniMax-H3 en PSNR y SSIM, y obtiene el mejor LPIPS (0.161). No se dispone de parametros ni licencias de esos dos comparadores en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo ni de lenguaje: no responde a prompts, no razona y no ejecuta tool calling. Su unico cometido es codificar y reconstruir vídeo.
- La model card advierte de que no deben procesarse vídeos independientes de forma concurrente ni intercalar sus chunks en la misma instancia del modelo; es necesario un objeto `KVAEVideo` por flujo concurrente.
- Requiere respetar los multiplos de compresion: `TruncVideo(32, 4)` recorta altura y anchura a multiplos de 32 y conserva `4n + 1` fotogramas. Ignorar esta restriccion puede producir errores o artefactos.
- La normalizacion de latentes debe aplicarse de forma coherente en `encode` y `decode`; mezclar `use_latent_norm=True` y `False` entre ambas llamadas rompe la reconstruccion.
- El informe tecnico de la version 3.0 aun no esta publicado ("coming soon"), por lo que faltan detalles de entrenamiento, dataset y posibles sesgos.
- Riesgo de alucinacion no aplicable en el sentido linguistico; el riesgo equivalente es la perdida de detalle o la introduccion de artefactos en la reconstruccion, especialmente en contenido de alta frecuencia o movimiento rapido.
- La licencia MIT permite uso comercial sin restricciones de copyleft, pero no se ofrece garantia alguna por parte del autor.
- No se documentan sesgos demograficos ni de contenido; al ser un tokenizador, los sesgos dependerian del dataset de entrenamiento, no detallado.

## Enlaces

- Hugging Face: https://huggingface.co/kandinskylab/KVAE-3D-3.0
- Pagina del proyecto: https://kandinskylab.ai/open-source-kvae-3-en.html
- Repositorio GitHub: https://github.com/kandinskylab/kvae
- Informe tecnico previo (arXiv:2608.05798): https://huggingface.co/papers/2608.05798
- KVAE-Image 3.0: https://huggingface.co/kandinskylab/KVAE-2D-3.0
- KVAE-Audio-Stereo: https://huggingface.co/kandinskylab/KVAE-Audio-Stereo
- KVAE-Video 2.0 t4s8: https://huggingface.co/kandinskylab/KVAE-3D-2.0-t4s8
- KVAE-Video 2.0 t4s16: https://huggingface.co/kandinskylab/KVAE-3D-2.0-t4s16
- KVAE-Video 1.0: https://huggingface.co/kandinskylab/KVAE-3D-1.0
- Dataset de evaluacion MCL-JCV: https://mcl.usc.edu/mcl-jcv-dataset/
