# ProCreations/Image-2.1-Turbo-Calibrated-NVFP4

## Resumen

Image-2.1-Turbo-Calibrated-NVFP4 es una cuantizacion NVFP4 W4A4 calibrada de forma independiente del transformer de imagen de Qwen-Image-2.1-Turbo, publicada por el usuario ProCreations. No es un modelo nuevo ni un lanzamiento oficial de Qwen: se trata de una version comprimida del transformer de difusion, acompanada de correcciones de bajo rango en BF16 (rango 128), un cargador explicito, una CLI, el codigo fuente de calibracion y evaluacion, comparativas emparejadas contra BF16 y evidencia de benchmarks y perfilado. El repositorio ocupa 5,0 GB, de los cuales 4,87 GB corresponden al transformer cuantizado.

Su relevancia practica esta en la latencia: genera imagenes de 1024 x 1024 en 0,96 s de extremo a extremo sobre una RTX PRO 6000 Blackwell (SM120, 96 GB), frente a los 2,05 s del Turbo en BF16 con Diffusers en modo eager. En 2048 x 2048 la diferencia es de 5,38 s frente a 11,45 s. La estrategia por defecto no es NVFP4 puro: el primer paso de la schedule de 8 pasos se ejecuta con el transformer FP8 calibrado del repositorio hermano Image-2.1-Turbo-Calibrated-FP8, que ademas rellena la cache KV de prompt y referencia, mientras que los pasos 2 a 8 van en NVFP4.

La fidelidad respecto a BF16 se documenta con 18 casos retenidos (16 de texto a imagen y 2 de edicion) no usados en la calibracion: LPIPS 0,086, SSIM 0,915, PSNR 25,1 dB y coseno latente 0,9827 en la configuracion por defecto. La licencia es la Qwen Research License y esta restringida a investigacion y evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) de Qwen-Image-2.1-Turbo con 32 bloques, cuantizado a NVFP4 W4A4; condicionamiento, proyecciones de entrada/salida, normas, codificador de texto y VAE permanecen en BF16 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de generacion de imagen; usa cache KV de prompt y de referencia entre pasos) |
| Tipos de cuantizacion | NVFP4 W4A4 (pesos en E2M1 con escalas de bloque E4M3 cada 16 elementos mas escala global FP32; activaciones con rango dinamico global por llamada y escalas dinamicas por bloque de 16), FP8 calibrado (primer paso de la schedule), BF16 (codificador de texto, VAE, procesador y resto de componentes) |
| Idiomas soportados | no disponible; la model card indica que los titulos en ingles y chino se mantienen correctos en las imagenes generadas |
| Licencia | qwen-research (license: other, license_name: qwen-research); solo investigacion y evaluacion |
| Formato de pesos | no especificado; libreria diffusers, transformer cuantizado de 4,87 GB en el repositorio y componentes BF16 cargados desde la revision upstream fijada |

## Arquitectura y entrenamiento

El modelo no entrena desde cero: cuantiza el transformer de imagen de Qwen-Image-2.1-Turbo, un transformer de difusion con 32 bloques. Se aplica NVFP4 W4A4 a 224 proyecciones: q, k, v y out mas gate, proj y out del SwiGLU en cada uno de los 32 bloques. El procedimiento de pesos consiste en plegar un factor SmoothQuant por capa dentro de los pesos, eliminar una correccion SVD de rango 128 en BF16 del peso suavizado y empaquetar el residuo como E2M1 con escalas de bloque E4M3 sobre 16 elementos mas una escala global FP32. En activaciones se aplica suavizado y cuantizacion por llamada con rango dinamico a nivel de tensor, recalculado en cada invocacion porque los rangos estaticos recortan valores atipicos poco frecuentes, junto con escalas dinamicas por bloque de 16. El GEMM usa el kernel nativo de FlashInfer 0.7.1 para SM120 (CuTe-DSL, block-scaled FP4), con la rama BF16 de bajo rango fusionada en el epilogo del acumulador FP32.

El pipeline por defecto emplea una schedule de 8 pasos: el paso 1 ejecuta el transformer FP8 calibrado de Image-2.1-Turbo-Calibrated-FP8 y rellena la cache KV de prompt y referencia; los pasos 2 a 8 ejecutan NVFP4. Como el modelo de pocos pasos fija su composicion pronto, ese unico paso de mayor precision acerca mucho el resultado a BF16 (LPIPS de 0,123 a 0,086; coseno latente de 0,966 a 0,983) sin coste apreciable de tiempo, ya que el prefill mas barato del FP8 compensa sus GEMM mas lentos. Las opciones `--fp8-first-steps 0` y `--fp8-first-steps 2` permiten NVFP4 puro o un modo aun mas fiel (LPIPS 0,063-0,071) en torno a 1,0 s. No se detalla el dataset de calibracion ni los datos de entrenamiento del modelo base.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) a 1024 x 1024 y 2048 x 2048, con pasos de schedule guardados y CFG 1.
- Edicion de imagenes: 2 de los 18 casos de evaluacion son ediciones y funcionan en la configuracion por defecto.
- Salida RGBA con transparencia explicita, verificada en la revision visual.
- Renderizado de texto dentro de la imagen: los titulos en ingles y chino se mantienen correctos.
- Fidelidad en detalles finos como pelo, plumas, cristal y manos, sin artefactos observados en las 18 parejas y en las 31 imagenes de la demo.
- Cache KV de prompt y referencia que se reutiliza entre pasos de difusion, lo que reduce el coste de los pasos posteriores.
- No dispone de tool calling, function calling ni capacidades de agente: es un modelo de generacion de imagen, no un modelo de lenguaje conversacional.
- No se documentan capacidades de audio ni de vision de entrada mas alla de la edicion de imagen.

## Casos de uso

- Generacion de imagenes en produccion con requisitos de latencia estrictos: 0,96 s end-to-end a 1024 x 1024 sobre RTX PRO 6000 Blackwell permite servir respuestas casi interactivas sin recurrir a resoluciones reducidas.
- Edicion de imagenes asistida: el modo de edicion y la salida RGBA permiten modificar una imagen de referencia manteniendo transparencia, util para retoque o variaciones sobre un asset existente.
- Prototipado iterativo de diseno grafico: con pasos de 101 ms en NVFP4 compilado, un disenador puede encadenar variaciones de prompt y semilla con una latencia por iteracion muy baja.
- Generacion de assets con canal alfa: carteles, logotipos y elementos superpuestos que necesitan fondo transparente sin postprocesado adicional.
- Renderizado de carteles y portadas con texto en ingles o chino, dado que la model card verifica que los titulos en ambos idiomas se mantienen correctos.
- Investigacion en cuantizacion de baja precision: el repositorio incluye el codigo de calibracion y evaluacion, comparativas emparejadas y metricas en crudo, lo que sirve como caso de estudio reproducible de NVFP4 W4A4 en transformers de difusion.
- Evaluacion comparativa de fidelidad de cuantizacion: las 18 parejas contra BF16 Turbo y las variantes FP8 y NVFP4 puro permiten medir el coste de calidad de cada configuracion.
- Procesamiento por lotes a alta resolucion en hardware Blackwell: 5,38 s por imagen a 2048 x 2048 con 42,8 GB de pico de VRAM hace viable un flujo por lotes en GPUs de 96 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K y similares) en la informacion disponible, porque no se trata de un modelo de lenguaje. Las metricas publicadas son de latencia y de fidelidad respecto a BF16. Medidas sobre RTX PRO 6000 Blackwell (SM120, 96 GB), batch 1, los 8 pasos guardados, CFG 1 y cache KV de prefijo:

| Runtime | 1024 x 1024 | 2048 x 2048 |
|---|---:|---:|
| BF16 Turbo (Diffusers upstream, eager) | 2,05 s | 11,45 s |
| NVFP4 eager, puro | 1,31 s | 8,40 s |
| NVFP4 + FP8 paso 1, compilado, atencion BF16 | 1,03 s | 6,80 s |
| NVFP4 puro, compilado + SageAttention2 | 0,96 s | 5,33 s |
| Por defecto en el lanzamiento (NVFP4 + FP8 paso 1, compilado + SageAttention2) | 0,96 s | 5,38 s |

Tiempo de pared extremo a extremo sincronizado con CUDA: codificacion del prompt, los 8 pasos del transformer y decodificacion VAE. Quedan excluidos la carga del modelo (unos 4,4 s desde NVMe local), la compilacion en el primer uso (unos 11 s a 1024 y 15 s a 2048, una vez por resolucion) y la escritura del PNG. Cinco ejecuciones medidas a 1024 y tres a 2048 tras un calentamiento; el valor por defecto a 1024 tiene media 0,960 s y minimo 0,958 s. Desglose por etapas: codificador 16 ms, paso 1 (FP8) 138 ms, pasos NVFP4 con cache 101 ms cada uno, VAE 93 ms. Pico de asignacion de GPU: 33,7 GB (1024) y 42,8 GB (2048) con el modelo del paso 1 en FP8 residente; 26,4 GB y 35,5 GB con NVFP4 puro.

Fidelidad frente a BF16 Turbo sobre 18 casos retenidos (16 texto a imagen y 2 ediciones), con semillas y resoluciones emparejadas (cuatro a 2048², dos no cuadradas y el resto a 1024²). LPIPS (AlexNet) y SSIM calculados sobre imagenes compuestas sobre blanco y redimensionadas a 512 px; latentes finales comparados a resolucion completa:

| Runtime | LPIPS medio (menor mejor) | SSIM medio (mayor mejor) | PSNR medio | Coseno latente |
|---|---:|---:|---:|---:|
| Por defecto en el lanzamiento (FP8 paso 1 + NVFP4) | 0,086 | 0,915 | 25,1 dB | 0,9827 |
| NVFP4 puro, compilado + Sage | 0,123 | 0,887 | 23,5 dB | 0,9660 |
| NVFP4 puro, eager | 0,134 | 0,878 | 23,1 dB | 0,9612 |
| Version FP8, como referencia | 0,055 | 0,942 | 28,6 dB | 0,9891 |

Las 18 parejas se revisaron visualmente. Las diferencias con BF16 no son de detalle perdido, sino de composicion, pose o identidad: con NVFP4 puro, un "hombre joven ante un torno de alfarero" paso a ser otro hombre distinto y un puerto al gouache cambio de composicion; el primer paso en FP8 restaura ambos casos. La pareja con mayor divergencia en modo por defecto es un escarabajo en macro (LPIPS 0,24, mismo sujeto con un helecho desplazado). SageAttention quedo dentro del ruido entre ejecuciones (0,084-0,089 con Sage frente a 0,082-0,087 sin Sage). Mantener todas las capas `attn.to_out.0` en FP8 solo mejoro el LPIPS de 0,134 a 0,130 y no se adopto. La propia model card advierte que es una comprobacion de fidelidad finita, no un estudio de preferencia humana.

## Requisitos de hardware

- VRAM estimada en la configuracion por defecto: 33,7 GB a 1024 x 1024 y 42,8 GB a 2048 x 2048, incluyendo el transformer FP8 del paso 1 (7,26 GB) residente en memoria.
- VRAM estimada en NVFP4 puro: 26,4 GB a 1024 x 1024 y 35,5 GB a 2048 x 2048.
- Los datos de rendimiento y de VRAM proceden de una RTX PRO 6000 Blackwell (SM120, 96 GB). El kernel FP4 nativo es el de FlashInfer 0.7.1 para SM120, por lo que el objetivo declarado es hardware Blackwell; no se documenta compatibilidad ni rendimiento en otras arquitecturas.
- No cabe en GPUs de consumo tipo RTX 4090 con los requisitos de memoria reportados (26,4 GB como minimo en el mejor caso), y no hay datos de ejecucion en esas tarjetas.
- Despliegue mediante la libreria diffusers con el cargador explicito y la CLI incluidos en el repositorio; opciones de aceleracion documentadas: `torch.compile`, SageAttention2 y los kernels de FlashInfer.
- No aplica el despliegue con vLLM, llama.cpp, Ollama ni TGI, al tratarse de un modelo de difusion de imagen y no de un modelo de lenguaje.
- Latencia y throughput documentados: 0,96 s por imagen a 1024 x 1024 y 5,38 s a 2048 x 2048 con el ajuste por defecto; por etapa, 16 ms de codificador, 138 ms del paso FP8, 101 ms por paso NVFP4 cacheado y 93 ms de VAE.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con el modelo base y con las variantes hermanas del mismo autor, ya que no se aportan referencias a otras cuantizaciones de Qwen-Image-2.1-Turbo.

| Modelo | Precision | Transformer | 1024 x 1024 | LPIPS vs BF16 | Notas |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Turbo (upstream) | BF16 | no disponible (referencia de maxima calidad) | 2,05 s | referencia | Diffusers eager; licencia del modelo base |
| Image-2.1-Turbo-Calibrated-FP8 | FP8 | 7,26 GB | no disponible | 0,055 | Usado como primer paso del modelo NVFP4; mejor fidelidad de la familia |
| Image-2.1-Turbo-Calibrated-NVFP4 (por defecto) | FP8 paso 1 + NVFP4 pasos 2-8 | 4,87 GB mas 7,26 GB residentes | 0,96 s | 0,086 | Release por defecto de este repositorio |
| Image-2.1-Turbo-Calibrated-NVFP4 (NVFP4 puro) | NVFP4 W4A4 | 4,87 GB | 0,96 s (compilado + Sage) | 0,123 | Modo `--fp8-first-steps 0`, con menor VRAM (26,4 GB) |

## Limitaciones y advertencias

- Licencia Qwen Research License (license: other): uso restringido a investigacion y evaluacion. No es una licencia de uso comercial libre y conviene revisar el texto completo antes de cualquier despliegue productivo.
- No es un lanzamiento oficial de Qwen: es una cuantizacion independiente del transformer del modelo base, con calibracion propia, y los resultados no estan respaldados por el autor original.
- Los resultados no son identicos a BF16: las diferencias se manifiestan como cambios de composicion, pose o identidad, no como perdida de detalle. En NVFP4 puro pueden aparecer sujetos o composiciones distintas; el primer paso en FP8 mitiga el problema pero no lo elimina.
- La comprobacion de fidelidad se limita a 18 casos retenidos y a una revision visual de 31 imagenes, sin estudio de preferencia humana ni evaluacion a gran escala. El caso peor documentado alcanza LPIPS 0,24.
- Riesgo de alucinacion visual en el sentido de que el modelo puede alterar elementos no solicitados de la composicion respecto a la referencia, especialmente con NVFP4 puro.
- El conjunto de calibracion y su tamano no se especifican, por lo que no es posible evaluar su cobertura ni su representatividad.
- Dependencia de hardware concreto: el rendimiento reportado depende de una RTX PRO 6000 Blackwell y del kernel FP4 para SM120. En otras GPUs no hay datos de velocidad ni de VRAM, y la compatibilidad no se documenta.
- Coste de memoria anadido: el modo por defecto mantiene residente el transformer FP8 del paso 1, unos 7 GB extra de VRAM.
- La carga del modelo y la compilacion inicial quedan fuera de las cifras de latencia: unos 4,4 s de carga y unos 11 s de compilacion a 1024 en un proceso nuevo.
- Adopcion practica muy baja en el momento de la consulta (0 descargas y 1 like), por lo que no existe validacion de la comunidad al margen del propio autor.
- Idiomas soportados sin declarar: solo hay evidencia cualitativa de titulos en ingles y chino correctos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ProCreations/Image-2.1-Turbo-Calibrated-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Repositorio hermano en FP8: https://huggingface.co/ProCreations/Image-2.1-Turbo-Calibrated-FP8
- Revision upstream fijada: d65dbc9a7e8f6b5479e33dee6030eaab2a906509
- Benchmarks en crudo: https://huggingface.co/ProCreations/Image-2.1-Turbo-Calibrated-NVFP4/tree/main/reports/benchmarks
- Metricas de calidad: https://huggingface.co/ProCreations/Image-2.1-Turbo-Calibrated-NVFP4/blob/main/reports/quality_metrics.json
- Pruebas registradas: https://huggingface.co/ProCreations/Image-2.1-Turbo-Calibrated-NVFP4/tree/main/reports/trials
- Comparativas emparejadas: https://huggingface.co/ProCreations/Image-2.1-Turbo-Calibrated-NVFP4/tree/main/comparisons
