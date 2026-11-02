# Asher-1/querysplat_vggto

## Resumen

QuerySplat es un modelo de reconstruccion 3D feed-forward que convierte un conjunto disperso de imagenes multi-vista en un conjunto de gaussianas 3D (3D Gaussian Splatting) sin necesidad de estimar poses de camara de forma explicita. Lo desarrolla inspatio y esta disenado para novel view synthesis en regimen de pocas vistas (sparse-view). Esta ficha cubre la version GGUF pre-convertida por Asher-1 para la cadena de inferencia en C++ puro sobre ggml, que elimina PyTorch en tiempo de ejecucion.

El modelo se compone de dos piezas: un encoder VGGT-Omega-1B-512 que produce pose, profundidad y tokens de capas cacheadas a partir de las imagenes, y un decoder QuerySplat que genera 524.288 gaussianas que se rasterizan para obtener los renders. La version aqui descrita contiene unicamente los pesos del decoder en formato GGUF (14,7 millones de parametros en el fichero safetensors de referencia); el encoder se distribuye en el repo companero `Asher-1/map_anything_vggt`.

Es relevante porque demuestra que un pipeline de reconstruccion 3D de calidad investigacion puede ejecutarse en C++ sin dependencias de PyTorch, con paridad numerica frente a la implementacion oficial (acuerdo cpp-vs-py de 59,2 dB en f32) y latencias de 2,9 s en una RTX 4090 para S=4 vistas a 512x512.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline feed-forward: encoder VGGT-Omega-1B-512 + decoder QuerySplat (query-based 3D Gaussian Splatting) |
| Parametros totales | 14.716.160 (decoder, segun safetensors); encoder VGGT-Omega de 1B en repo aparte |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision 3D, no de texto); entrada de S vistas multi-imagen a 512x512 |
| Tipos de cuantizacion | f32, f16, q8_0 (decoder y encoder); LPIPS-vgg solo f32 |
| Idiomas soportados | en (etiqueta de la model card; el modelo no procesa texto) |
| Licencia | apache-2.0 (tooling e inferencia); pesos del decoder heredan terminos del release upstream de inspatio/querysplat |
| Formato de pesos | GGUF (ggml); pesos originales en safetensors (`querysplat_vggto_1B_512_paper.safetensors`) |

## Arquitectura y entrenamiento

El decoder QuerySplat emplea un esquema de consultas (queries) que, condicionado por los tokens del encoder VGGT-Omega, predice directamente los atributos de 524.288 gaussianas 3D (posicion, escala, rotacion, opacidad y coeficientes de color SH). El encoder VGGT-Omega-1B-512 es un transformer de vision de 1B parametros que entrega pose, profundidad y tokens de capas cacheadas, de modo que el pipeline completo es pose-free: no requiere un paso separado de Structure-from-Motion. La rasterizacion final de las gaussianas produce las imagenes de novel view.

La model card no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO (no aplica en un modelo de vision 3D). La innovacion tecnica destacable es la cadena de inferencia en C++ puro sobre ggml con kernels de exact-F32 attention y cuBLAS activados por defecto, que reproducen el comportamiento de la implementacion oficial en torch. La conversion a GGUF acorta los nombres de tensores al limite de 64 caracteres de ggml y aplica la inversion de formas segun la convencion `ne` de ggml. El encoder y el decoder de una misma ejecucion deben usar el mismo tier de cuantizacion.

## Capacidades

- Reconstruccion 3D pose-free a partir de un conjunto disperso de imagenes multi-vista.
- Novel view synthesis mediante rasterizacion de 524.288 gaussianas 3D.
- Prediccion implicita de pose y profundidad por vista a traves del encoder VGGT-Omega.
- Inferencia sin PyTorch en runtime, con backends CUDA, Vulkan y CPU.
- Evaluacion integrada de calidad con LPIPS-vgg (`querysplat-eval`).
- Paridad numerica configurable: tiers f32, f16 y q8_0 con distintos niveles de acuerdo frente a la referencia.
- No soporta tool calling, agentes, texto ni razonamiento multi-step: es un modelo puramente visual/3D.

## Casos de uso

- Digitalizacion de objetos con pocas fotos: a partir de 4 vistas a 512x512 se obtiene un conjunto de gaussianas renderizable en ~2,9 s en una RTX 4090, adecuado para capturas rapidas en movil o dron.
- Previsualizacion de escenas en visores 3D: el plugin ACloudViewer MapAnything consume los mismos fixtures multi-vista, por lo que el modelo se integra en flujos de visualizacion de nubes de puntos y splats.
- Pipelines de produccion sin dependencias de Python: al ejecutarse como binario C++ con ggml, puede desplegarse en entornos embebidos o contenedores minimos donde instalar PyTorch no es viable.
- Generacion de contenido 3D para videojuegos y VR: los splats resultantes sirven como assets de escena para renderizado en tiempo real en motores que soportan Gaussian Splatting.
- Investigacion en reconstruccion sparse-view: la paridad medida frente a la cadena oficial torch (26,84-26,89 dB cpp-vs-GT) permite usarlo como baseline reproducible en experimentos de novel view synthesis.
- Evaluacion comparativa de metodos 3D: el binario `querysplat-eval` con pesos LPIPS-vgg integrados facilita calcular metricas perceptivas de forma estandarizada sobre el protocolo DL3DV.
- Procesamiento en CPU para entornos sin GPU: el tier f32 en CPU completa el pipeline en ~85 s, suficiente para lotes offline no interactivos.

## Benchmarks y rendimiento

Latencias medidas en RTX 4090 + i9-14900K, S=4 vistas, 512x512:

| Fila | enc+dec (s) | render (s) | e2e (s) | vs oficial py CUDA |
|---|---|---|---|---|
| oficial py (torch f32) CUDA | 2,59 | 0,30 | 2,89 | 1,00x |
| cpp Vulkan q8_0 | 2,50 | 0,39 | 2,90 | 1,00x |
| cpp CUDA f32 | 2,81 | 0,40 | 3,20 | 1,11x |
| cpp CPU f32 | 84,9 | 0,40 | 85,3 | 29,5x |

Calidad (media sobre 3 backends x 3 escenas): acuerdo cpp-vs-py de 59,2 dB (f32), 45,6 dB (f16) y 34,5 dB (q8_0); cpp-vs-GT dentro de 0,05 dB de la cadena oficial torch en todos los tiers (26,84-26,89 dB). No se han publicado resultados de benchmarks estandar (PSNR/SSIM/LPIPS por escena) en la informacion disponible mas alla de estas cifras agregadas.

## Requisitos de hardware

- VRAM estimada: decoder f32 4,47 GB + encoder f32 4,26 GB; tier f16 2,30 + 2,13 GB; tier q8_0 1,31 + 1,23 GB. Sumando overhead de activaciones y rasterizador, el tier q8_0 es el mas holgado para GPUs de 8 GB.
- GPU recomendadas: RTX 4090 (referencia medida), A100 y H100 para lotes grandes; cualquier GPU con CUDA o Vulkan funcional para los tiers bajos.
- Cabe en GPU consumer: si, en tarjetas de 8-12 GB con tier q8_0 o f16; el tier f32 completo requiere ~9 GB solo en pesos.
- Opciones de despliegue: binario `querysplat-cli` (C++/ggml) con backends CUDA (`-DMAP_GGML_CUDA=ON`), Vulkan (`-DMAP_GGML_VULKAN=ON`) o CPU; script `run_querysplat.sh` para ejecucion en un comando.
- Latencia y throughput: ~2,9 s end-to-end en RTX 4090 con Vulkan q8_0; ~3,2 s con CUDA f32; ~85 s en CPU f32. No se publican cifras de throughput por lote.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Pose-free | Runtime sin PyTorch | Licencia |
|---|---|---|---|---|---|
| QuerySplat (esta ficha, GGUF) | 14,7 M decoder + 1B encoder | Query-based 3DGS feed-forward | Si | Si (ggml C++) | Apache-2.0 (tooling); pesos upstream inspatio |
| QuerySplat oficial (inspatio/querysplat) | 14,7 M decoder + 1B encoder | Query-based 3DGS feed-forward | Si | No (torch) | Terminos del release upstream |
| VGGT-Omega (facebook) | 1B | Transformer de vision para pose/depth | Si (encoder) | No en este repo | no disponible |
| Otros metodos sparse-view 3DGS | no disponible | Optimizacion por escena | No | No | no disponible |

La comparativa se limita a las alternativas documentadas en la informacion proporcionada; no se dispone de datos de rendimiento de terceros para una comparacion cuantitativa adicional.

## Limitaciones y advertencias

- El decoder depende exclusivamente del encoder VGGT-Omega-1B-512; no acepta otras familias de encoder.
- Encoder y decoder deben compartir tier de cuantizacion; mezclar f32 con q8_0 no esta soportado.
- El tier q8_0 reduce el acuerdo cpp-vs-py a 34,5 dB, lo que puede ser insuficiente para evaluacion cientifica estricta; para paridad usar f32.
- La licencia Apache-2.0 cubre el tooling y la cadena de inferencia, pero los pesos del decoder heredan los terminos del release upstream de inspatio/querysplat; verificar antes de uso comercial.
- No procesa texto ni lenguaje natural: la etiqueta `en` es meramente informativa; no hay capacidades multilingues reales.
- Riesgo de artefactos en escenas con oclusiones severas o muy pocas vistas; no se documentan limites minimos de S.
- No se publican datos de sesgo, robustez ni evaluacion en dominios fuera de DL3DV.
- El repo ocupa 8,2 GB y requiere descargar tambien el encoder desde otro repositorio; el script de ejecucion no descarga dependencias adicionales pero exige compilar el binario.
- Solo 61 descargas y 0 likes en el momento de la consulta: ecosistema pequeno y poca validacion comunitaria independiente.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Asher-1/querysplat_vggto
- Repo del encoder: https://huggingface.co/Asher-1/map_anything_vggt
- Cadena de inferencia C++/ggml: https://github.com/Asher-1/querysplat-ggml
- Repositorio upstream QuerySplat: https://github.com/inspatio/querysplat
- Model cards y metodologia: https://github.com/Asher-1/querysplat-ggml/blob/main/cpp_ggml/models/MODEL_CARDS.md
- Informe de benchmarks: https://github.com/Asher-1/querysplat-ggml/blob/main/cpp_ggml/benchmarks/charts/querysplat/querysplat_report.md
- Matriz de latencia: https://github.com/Asher-1/querysplat-ggml/blob/main/cpp_ggml/benchmarks/charts/querysplat/latency_matrix.png
- Datos de test compartidos: https://github.com/Asher-1/cloudViewer_downloads/releases/tag/map_anything_vggt_test_data
- Encoder VGGT-Omega (facebook): https://huggingface.co/facebook/VGGT-Omega
