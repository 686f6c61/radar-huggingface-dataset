# loom-fun/xinntao-Real-ESRGAN-x4plus-loom

## Resumen

Real-ESRGAN x4plus es una red de superresolución de imágenes desarrollada originalmente por Xintao Wang y colaboradores (Tencent ARC), publicada con el artículo arXiv:2107.10833. El modelo base `xinntao/Real-ESRGAN` implementa un generador RRDBNet con 23 bloques densos residuales-en-residuales que amplía una imagen por un factor fijo de 4 en cada eje. Esta ficha concreta, publicada por `loom-fun`, no es un reentrenamiento: es un paquete de despliegue en formato Loom (`.loom` más un `model.json`) que permite ejecutar los pesos originales F32 sobre GPU AMD mediante el runtime `loom-serve`.

La relevancia de esta variante es de infraestructura, no de modelado. El paquete está portado y probado específicamente sobre el AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151), con convoluciones ejecutadas como WMMA en BF16 y acumulación y activaciones en F32. Esto abre la inferencia del modelo en hardware AMD integrado, un nicho tradicionalmente mal cubierto por los stacks de superresolución basados en CUDA. Los pesos se leen del checkpoint original alojado en `Comfy-Org/Real-ESRGAN` en una revisión fijada, no del repositorio de este paquete.

El modelo resuelve un problema acotado y determinista: dado un mapa de píxeles RGB de 8 bits, devuelve una imagen cuatro veces mayor en cada dimensión. No hay muestreo, ni semilla efectiva, ni pasos de difusión; la misma entrada produce siempre la misma salida. El paquete acepta entradas no cuadradas con anchura múltiplo de 64 (hasta 1024) y altura múltiplo de 4 (hasta 1024), generando salidas de hasta 4096×4096.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RRDBNet (generador GAN con 23 bloques densos residuales-en-residuales) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | pesos F32; cómputo BF16 WMMA con acumulación y activaciones F32 |
| Idiomas soportados | no aplica |
| Licencia | BSD-3-Clause |
| Formato de pesos | paquete Loom (`.loom` + `model.json`); pesos originales F32 leídos de `Comfy-Org/Real-ESRGAN` |
| Factor de escala | ×4 fijo por checkpoint |
| Rango de entrada | anchura múltiplo de 64 entre 64 y 1024; altura múltiplo de 4 entre 4 y 1024; no cuadrada permitida |
| Rango de salida | anchura múltiplo de 256 hasta 4096; altura múltiplo de 16 hasta 4096 |
| Pipeline | image-to-image |
| Modelo base | `xinntao/Real-ESRGAN` |

## Arquitectura y entrenamiento

La red es un generador RRDBNet con 23 bloques residuales-en-residuales densos, la arquitectura estándar de Real-ESRGAN para superresolución ×4. El entrenamiento original (no reproducido en este paquete) combina degradaciones sintéticas de alta orden para simular artefactos del mundo real y un esquema adversarial que prioriza la calidad perceptual sobre la fidelidad pixel a pixel. No se dispone en la información proporcionada de detalles sobre el número de tokens, composición del dataset ni etapas de RLHF/DPO, que además no aplican a este tipo de modelo.

La innovación técnica de esta ficha reside en la implementación: el paquete Loom ejecuta las convoluciones como operaciones WMMA en BF16 con acumulación F32 y activaciones F32, lo que preserva la precisión numérica del checkpoint original dentro de márgenes medidos. No hay muestreo estocástico, por lo que la desviación respecto a la referencia en PyTorch es puramente aritmética. El modelo procesa la imagen completa en una sola pasada, sin tiling, lo que elimina las costuras entre teselas que aparecen en otras implementaciones de superresolución.

## Capacidades

- Superresolución de imágenes con factor ×4 fijo en cada eje, determinado por el checkpoint.
- Entrada RGB de 8 bits en bruto (row-major, sin cabecera) codificada en base64, ya sea estándar (`+/`) o URL-safe (`-_`).
- Soporte de entradas no cuadradas dentro de los límites: anchura múltiplo de 64 (64–1024) y altura múltiplo de 4 (4–1024).
- Salida en PNG RGBA con todos los valores alfa a 255; se recomienda `.convert("RGB")` si se necesitan tres canales.
- Procesamiento de la imagen completa en una sola pasada, sin teselado ni costuras.
- Determinismo total: la misma entrada produce siempre la misma salida; el parámetro `seed` se acepta pero se ignora.
- API compatible con el estilo OpenAI en `/v1/images/generations` con `response_format: b64_json`.
- Endpoints auxiliares `GET /v1/status` (progreso de preparación) y `GET /v1/models` (listado cuando está listo).
- Sin soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de imagen.

## Casos de uso

- Restauración de fotografías antiguas o de baja resolución: el modelo amplía ×4 imágenes de hasta 1024×1024 de entrada, útil para digitalizar archivos fotográficos donde se necesita recuperar detalle perceptual sin introducir artefactos de teselado.
- Mejora de miniaturas y assets web: se puede integrar en un pipeline que reciba imágenes pequeñas (por ejemplo, 256×256) y devuelva versiones de 1024×1024 listas para pantallas de alta densidad, aprovechando el preset `upscale` preparado al arrancar.
- Preprocesado para pipelines de visión por computador: ampliar recortes pequeños antes de pasarlos a detectores o clasificadores que rinden mejor con más resolución, con la ventaja de que la salida es determinista y reproducible entre ejecuciones.
- Restauración de fotogramas en vídeo de baja resolución: al ser determinista y procesar la imagen completa en una pasada, se puede aplicar fotograma a fotograma sin parpadeo por variación estocástica, siempre que cada fotograma cumpla los múltiplos de tamaño.
- Despliegue en estaciones de trabajo AMD sin CUDA: el paquete está pensado para GPUs AMD vía `hrx-loom` 0.2.0, lo que permite ofrecer superresolución en entornos con hardware integrado Strix Halo donde no hay acceso a GPUs NVIDIA.
- Generación de material de referencia para evaluación perceptual: al coincidir con PyTorch fp32 en PSNR, SSIM y LPIPS, sirve como baseline reproducible para comparar otras técnicas de upscaling en el mismo hardware.
- Servicio local de mejora de imágenes para herramientas creativas: expuesto en `127.0.0.1:8080` con API estilo OpenAI, se puede conectar a clientes existentes que ya hablen ese contrato sin adaptar el backend.

## Benchmarks y rendimiento

Fidelidad numérica frente a la referencia en PyTorch fp32 sobre Strix Halo (gfx1151), 24 imágenes:

| Entrada → salida | Imágenes | PSNR vs PyTorch fp32 ↑ | Diferencia absoluta máxima (0–255) ↓ | Píxeles con error > 1 ↓ |
|---|---|---|---|---|
| 256×256 → 1024×1024 | 24 | 54,79 | 12 | 0,51 % |
| 512×512 → 2048×2048 | 24 | 54,89 | 20 | 0,46 % |

Detalle recuperado desde una entrada reducida (256×256 → 1024×1024), evaluado contra la imagen original de 1024×1024:

| Implementación | PSNR vs original ↑ | SSIM vs original ↑ | LPIPS vs original ↓ |
|---|---|---|---|
| Loom (este paquete) | 28,74 | 0,8488 | 0,1654 |
| PyTorch ROCm fp32 | 28,74 | 0,8487 | 0,1655 |
| Bicúbica sin modelo | 30,87 | 0,8804 | 0,2834 |

Lectura: PSNR y SSIM favorecen salidas suaves, mientras que LPIPS premia la textura; Real-ESRGAN cede unos pocos dB de PSNR frente a bicúbica a cambio de una distancia perceptual mucho menor, y la implementación Loom iguala a PyTorch fp32 en las tres métricas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; depende de la resolución de entrada y del tamaño de los buffers intermedios en F32.
- GPU probada: AMD Ryzen AI Max+ PRO 395 con Radeon 8060S (gfx1151), Windows 11, con `hrx-loom` 0.2.0 y PyTorch ROCm con spandrel para la referencia.
- Otras GPUs AMD soportadas por `hrx-loom` 0.2.0 pueden ejecutar el mismo paquete, pero no han sido probadas según la model card.
- GPU de consumo: el hardware de referencia es un APU integrado, por lo que el modelo cabe en iGPU de gama alta; no se especifican requisitos para GPUs dedicadas NVIDIA o AMD.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve --device=amdgpu --listen=127.0.0.1:8080 --model=.../model.json`.
- Latencia y throughput: no disponibles en la información proporcionada.
- El listener arranca antes de que termine la preparación del modelo; el estado se consulta en `GET /v1/status`.

## Comparativa con modelos similares

| Modelo | Arquitectura | Factor | Entrada máx. | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Real-ESRGAN x4plus (este paquete Loom) | RRDBNet, 23 RRDB | ×4 | 1024×1024 | BSD-3-Clause | Paquete Loom para AMD gfx1151 |
| Real-ESRGAN x4plus (original PyTorch) | RRDBNet, 23 RRDB | ×4 | no disponible | BSD-3-Clause | Pesos `.pth` en `xinntao/Real-ESRGAN` |
| Bicúbica (baseline sin modelo) | Interpolación | ×4 | sin límite práctico | no aplica | Cualquier librería de imagen |

No se dispone en la información proporcionada de comparativas con otras familias de superresolución (SwinIR, ESRGAN original, modelos de difusión para upscaling) ni de sus especificaciones, por lo que se omiten.

## Limitaciones y advertencias

- Factor de escala fijo ×4: no se puede pedir ×2 ni ×8 con este checkpoint.
- Límites estrictos de tamaño: la anchura de entrada debe ser múltiplo de 64 y la altura múltiplo de 4; otras resoluciones deben recortarse o rellenarse antes de enviarlas.
- La API no tiene ruta nativa de entrada de imagen en `hrx-loom` 0.2.0; la imagen viaja como base64 de píxeles RGB en bruto dentro del campo `prompt`, lo que añade sobrecarga y requiere codificación explícita en el cliente.
- La salida es siempre RGBA con alfa a 255; hay que convertirla a RGB si el consumidor espera tres canales.
- El parámetro `seed` se acepta pero se ignora; no hay control estocástico sobre el resultado.
- Solo probado en gfx1151 (Strix Halo); el rendimiento y la corrección en otras GPUs AMD no están verificados.
- Riesgo de alucinación: como todo modelo generativo adversarial, puede inventar texturas plausibles que no estaban en la imagen original; conviene revisar resultados en contextos forenses o médicos.
- Sesgos: no documentados en la información disponible; al ser un modelo de restauración, los sesgos provendrían de la distribución de datos de entrenamiento original y podrían afectar a la reproducción de texturas en dominios poco representados.
- Licencia BSD-3-Clause: permite uso comercial con atribución y sin endoso; conviene revisar los términos del checkpoint original en `xinntao/Real-ESRGAN` y de los pesos en `Comfy-Org/Real-ESRGAN`.
- Los pesos no se alojan en este repositorio; se descargan de `Comfy-Org/Real-ESRGAN` en una revisión fijada, lo que introduce una dependencia externa en el despliegue.

## Enlaces

- Hugging Face del paquete: https://huggingface.co/loom-fun/xinntao-Real-ESRGAN-x4plus-loom
- Modelo base: https://huggingface.co/xinntao/Real-ESRGAN
- Pesos de origen: https://huggingface.co/Comfy-Org/Real-ESRGAN
- Repositorio original: https://github.com/xinntao/Real-ESRGAN
- Artículo: https://arxiv.org/abs/2107.10833
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Pull request de la tarjeta en la librería Loom: https://github.com/ROCm/hrx-loom-library/pull/126
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- spandrel (carga de checkpoints): https://github.com/chaiNNer-org/spandrel
- LPIPS: https://github.com/richzhang/PerceptualSimilarity
- scikit-image (SSIM): https://scikit-image.org/
- Pillow: https://pypi.org/project/pillow/
