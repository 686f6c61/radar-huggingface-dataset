# blackestk/MiniMax-H3-Ref2VA-MLX-pruned-Q4

## Resumen

MiniMax-H3-Ref2VA-MLX-pruned-Q4 es una conversion no oficial del transformer Ref2VA de MiniMax-H3, adaptada para ejecutarse en Apple Silicon mediante MLX. El modelo original lo desarrolla MiniMax y esta disenado para generacion conjunta de video y audio a partir de imagenes, texto y referencias visuales (RefMods). Esta version concreta, publicada por el usuario blackestk, reduce el transformer a un nucleo cuantizado en 4 bits con las proyecciones AdaLN podadas a una curva de 64 dimensiones, pasando de 47,5 GB a 12 GB en disco.

La relevancia de esta ficha radica en que demuestra la viabilidad de ejecutar un modelo de generacion video-audio de gran tamano en hardware de consumo Apple, con picos de memoria de denoising de 12,9 GiB en un M2 Max de 96 GB. No obstante, la licencia comunitaria de MiniMax-H3 excluye explicitamente de su ambito territorial a la Union Europea, el Reino Unido, Corea del Sur y Estados Unidos, lo que condiciona su uso desde Espana.

El repositorio contiene unicamente el transformer; los VAE y el codificador de texto Qwen3-VL-32B deben obtenerse del release oficial. La libreria de ejecucion es MLX y el pipeline declarado es image-text-to-video.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer DiT (diffusion transformer) con AdaLN podado; variante Ref2VA de MiniMax-H3 |
| Parametros totales | 3.475.742.160 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits (group size 64) en lineales del nucleo; AdaLN de 64 canales en float32 |
| Idiomas soportados | No disponible |
| Licencia | MiniMax H3 Community License (no open source; excluye UE, Reino Unido, Corea del Sur y EE. UU.) |
| Formato de pesos | safetensors (MLX) |
| Tamano del repositorio | 12,6 GB |
| Libreria | mlx |
| Modelo base | MiniMaxAI/MiniMax-H3 (fine-tune Ref2VA) |
| Pipeline | image-text-to-video (con audio) |

## Arquitectura y entrenamiento

El modelo es un diffusion transformer (DiT) correspondiente al fine-tune Ref2VA de MiniMax-H3, que a diferencia de FL2VA acepta imagenes de referencia, clips y RefMods como condicionamiento. La conversion realizada por blackestk aplica dos transformaciones sobre el transformer oficial: primero, las 51 proyecciones AdaLN se reproyectan sobre una curva temporal de 64 dimensiones y se elimina el `time_embedder`, siguiendo el layout de AdaLN podado que `load_dit` lee cuando `adaln_curve_grid` esta activo; el error relativo de las salidas AdaLN proyectadas frente a las originales es de aproximadamente 1,7e-6. Segundo, los lineales del nucleo se cuantizan a 4 bits con group size 64, mientras que las proyecciones AdaLN de 64 canales se mantienen en float32 porque cuantizarlas a 8 bits empeoraba seis veces las tablas de modulacion guardadas.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada. El proceso de reconstruccion requiere la descarga oficial de `Ref2VA/transformer` (unos 66 GB) y los scripts `prune_ref2va_adaln.py` y `quantize_pruned_stream.py`. El layout de AdaLN podado sigue el publicado por DeepBeepMeep para FL2VA, y el cuantizador deriva de `quantize_stream.py` del runner.

## Capacidades

- Generacion de video a partir de imagen y texto (image-text-to-video) con salida conjunta de audio.
- Condicionamiento por imagenes de referencia, clips y RefMods mediante los flags `--refmod` y `--reference`.
- Generacion por etapas (`generate_staged.py`) con adaptadores rapidos de 3 pasos (Fast adapter).
- Renderizado determinista para una semilla dada, lo que facilita la reproducibilidad.
- Ejecucion en Apple Silicon mediante MLX, con lectura automatica de cuantizacion y layout desde `config.json` y `quant_config.json`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingues en la informacion disponible.

## Casos de uso

- Generacion de clips cortos con audio en estaciones de trabajo Mac: el modelo permite renderizar video de 5 segundos a 640x384 con un pico de 12,9 GiB en denoising, adecuado para prototipado visual en un M2 Max de 96 GB.
- Creacion de contenido a partir de imagenes de referencia: gracias al condicionamiento Ref2VA, se pueden generar variaciones de video manteniendo la identidad visual de una imagen o clip de entrada, util para storyboards y previsualizacion.
- Animacion de productos o ilustraciones: partiendo de una imagen fija y un prompt textual, el modelo produce un clip animado con audio sincronizado, aplicable a marketing y demostraciones.
- Investigacion en generacion video-audio en hardware de consumo: el pack de 12 GB permite experimentar con un DiT de gran tamano sin acceso a GPUs de datacenter, aunque con limitaciones de velocidad.
- Evaluacion de tecnicas de cuantizacion y poda: la comparacion documentada entre el pack Q8 oficial (47,5 GB) y este Q4 (12 GB) sirve como referencia para estudiar el impacto de la cuantizacion en la calidad de difusion.
- Integracion en pipelines de automatizacion locales: mediante el runner `minimax-h3-mlx` y sus scripts, se puede encadenar la generacion con herramientas de postproduccion en un flujo de trabajo en macOS.
- No se recomienda su uso comercial en la Union Europea sin autorizacion expresa, dado el ambito territorial de la licencia.

## Benchmarks y rendimiento

Los datos disponibles son mediciones de rendimiento en hardware, no benchmarks de calidad estandarizados. Se realizaron en un Apple M2 Max con 96 GB, `generate_staged.py`, resolucion 640x384, 5 segundos, adaptador Fast de 3 pasos, un RefMod y semilla 5.

| Metrica | Ref2VA oficial Q8 (47,5 GB) | Este pack Q4 (12 GB) |
|---|---|---|
| Tamano en disco | 47,5 GB | 12 GB |
| Pico de carga del DiT | 19,9 GiB | 10,6 GiB |
| Pico de denoising | 22,2 GiB | 12,9 GiB |
| Tiempo de denoising | 242 s | 238 s |

Notas adicionales: el denoising esta limitado por computo, y las matmuls de 4 y 8 bits corren a velocidad similar (aproximadamente 0,88x respecto a bf16 segun los benchmarks del runner). El codificador de texto Qwen3-VL-32B alcanza un pico de 25,7 GiB y marca el minimo de RAM para renders simples; la codificacion de referencias alcanzo 39 GiB en una ejecucion con dos imagenes sobre el pack de 47,5 GB. No se probo en Macs de 36 o 48 GB. Como contexto ajeno a esta medicion, las tarjetas de PipeNetwork para `MiniMax-H3-MLX-8bit` y `-4bit` (sobre FL2VA) reportan errores de velocidad de video de 0,033 y 0,165 frente a bf16 en modo teacher-forced.

## Requisitos de hardware

- VRAM/RAM estimada: pico de denoising de 12,9 GiB para el DiT en este pack; el codificador de texto Qwen3-VL-32B requiere un pico de 25,7 GiB, por lo que el minimo practico de memoria unificada ronda los 32-36 GB, aunque no se ha verificado en maquinas de 36 o 48 GB.
- GPU recomendadas: Apple Silicon con memoria unificada; las mediciones se realizaron en un M2 Max de 96 GB. No se soportan GPUs NVIDIA ni AMD en esta build MLX.
- Cabe en GPU de consumo: si, en Macs con memoria unificada suficiente; no se ha validado en configuraciones de 36 o 48 GB.
- Opciones de despliegue: runner `minimax-h3-mlx` (fork de Mr Bizarro con soporte Ref2VA en el PR #2, o la copia vendorizada en `blackest/immich-ring-visualizer`). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: denoising de 238 s para un clip de 5 s a 640x384 con el adaptador Fast de 3 pasos en M2 Max de 96 GB. La cuantizacion a 4 bits no aporta velocidad frente a 8 bits.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Ref2VA-MLX-pruned-Q4 (este) | 3,48 B (transformer) | No disponible | safetensors MLX, 12 GB | MiniMax H3 Community (excluye UE, UK, Corea del Sur, EE. UU.) | HuggingFace, 35 descargas |
| MiniMax-H3 Ref2VA oficial Q8 bf16 | No disponible | No disponible | safetensors, 47,5 GB | MiniMax H3 Community | HuggingFace (MiniMaxAI) |
| MiniMax-H3-MLX-8bit (PipeNetwork) | No disponible | No disponible | MLX, variante FL2VA | MiniMax H3 Community | HuggingFace |
| MiniMax-H3-MLX-4bit (PipeNetwork) | No disponible | No disponible | MLX, variante FL2VA | MiniMax H3 Community | HuggingFace |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de benchmarks frente a otros generadores video-audio en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia MiniMax H3 Community License no es open source y excluye del ambito territorial a la Union Europea, el Reino Unido, Corea del Sur y Estados Unidos; su uso desde Espana queda fuera de la concesion, por lo que se requiere revision legal antes de cualquier despliegue.
- Los productos comerciales con ingresos anuales superiores a 20 millones de dolares requieren autorizacion escrita de MiniMax; se aplica ademas la Acceptable Use Policy.
- La redistribucion debe incluir la licencia y un archivo `NOTICE`, y marcar los archivos modificados.
- El repositorio contiene solo el transformer; sin los VAE y el codificador de texto del release oficial el modelo no es funcional.
- La cuantizacion a 4 bits y la poda de AdaLN introducen diferencias visibles frente al modelo Q8: en la semilla de prueba se observo una lampara colgante duplicada, aunque el resultado se considera aceptable.
- El soporte Ref2VA depende de un PR no fusionado o de una copia vendorizada del runner, lo que anade riesgo de mantenimiento.
- No se ha validado en Macs de 36 o 48 GB; los requisitos de memoria son inferencias a partir de picos registrados.
- No hay informacion sobre sesgos, tasas de alucinacion, idiomas soportados ni evaluaciones de calidad estandarizadas.
- La fecha de creacion del repositorio (2026-10-31) y el reducido numero de descargas (35) sugieren poca validacion comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/blackestk/MiniMax-H3-Ref2VA-MLX-pruned-Q4
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Runner MLX (fork de Mr Bizarro): https://github.com/mrbizarro/minimax-h3-mlx
- PR de soporte Ref2VA: https://github.com/mrbizarro/minimax-h3-mlx/pull/2
- Copia vendorizada y scripts: https://github.com/blackest/immich-ring-visualizer
- Scripts de poda y cuantizacion: https://github.com/blackest/immich-ring-visualizer/tree/main/scripts
- Runner original de PipeNetwork: https://github.com/PipeNetwork/minimax-h3-mlx
