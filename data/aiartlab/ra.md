# AiArtLab/Ra

## Resumen

Ra es un modelo de generacion de imagenes texto-a-imagen de 256x256 pixeles desarrollado integramente desde cero por AiArtLab, un equipo pequeno de entusiastas centrado en modelos compactos y eficientes que puedan entrenarse en hardware de consumo. El modelo tiene 177,3 millones de parametros y combina una arquitectura de U-transformer piramidal (143,3M) que opera sobre un latente de 8x de reduccion espacial y 32 canales, un codificador de texto Ettin-150M congelado con un mezclador aprendible de capas (10,0M) y un decodificador de autoencoder reentrenado como cabecera de flujo en espacio de pixeles (23,9M).

Su propuesta tecnica principal es la piramide de resoluciones: en lugar de un DiT plano clasico con atencion a resolucion completa, la anchura crece a medida que el numero de tokens se reduce, de modo que las capas caras operan sobre 16-64 tokens mientras la rejilla de 1024 tokens mantiene convoluciones 3x3 baratas. Segun el autor, esto reduce el coste por paso de 232 GFLOP a 20,4 GFLOP (11x menos) y mantiene mejor el detalle anatomico y de textura.

Es relevante ahora como artefacto de investigacion: demuestra que un modelo de difusion por flow matching puede entrenarse desde cero en una unica RTX 4080 y publicarse con licencia MIT, aunque el propio autor advierte que el entrenamiento sigue en curso (snapshot del paso 212.000) y que el modelo no tiene ajuste de seguridad ni filtro de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-transformer piramidal (DiT) con flow matching; codificador de texto transformer congelado y decodificador AE en espacio de pixeles |
| Parametros totales | 177.250.474 (143,3M transformer + 10,0M mezclador de capas + 23,9M cabecera de flujo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de texto sin longitud documentada) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp16) |
| Idiomas soportados | no disponible (codificador Ettin-150M; idiomas no documentados en la ficha) |
| Licencia | MIT para codigo y pesos; Ettin-150M MIT; autoencoder f8c32-ae Apache-2.0 |
| Formato de pesos | safetensors (bundle fp16 de 803 MiB) |
| Resolucion de salida | 256x256, lados multiplos de 64 |
| Latente | 8x espacial / 32 canales (Muinez/f8c32-ae) |
| Muestreador | Euler, 8-16 pasos, cfg 1,5-2,5, 4-8 pasos de cabecera |
| Dataset de entrenamiento | LucasFang/FLUX-Reason-6M |
| Hardware de entrenamiento | una RTX 4080 |

## Arquitectura y entrenamiento

El cuerpo del modelo es un U-transformer piramidal con conexiones skip aditivas en cada nivel. La anchura crece a medida que disminuye el numero de tokens: las capas mas costosas se ejecutan sobre 16-64 tokens, mientras que la rejilla de 1024 tokens conserva convoluciones 3x3 locales, lo que preserva anatomia y textura. El cuello de botella de 16 tokens (anchura 1536, atencion completa) sostiene la composicion y la simetria, y el texto condiciona los cuatro niveles de la piramide. Segun las notas del autor, un DiT plano clasico de 12 bloques y anchura 1024 cuesta 232 GFLOP por forward del cuerpo frente a 20,4 GFLOP de la piramide (11x menos); el paso tarda 97 ms frente a 196 ms por estar limitado por memoria, y la metrica de detalle es 0,54 frente a 0,18 (referencia real 0,913, techo del AE 0,859).

El entrenamiento usa flow matching sobre el dataset FLUX-Reason-6M y se ejecuto en una unica RTX 4080. El transformer incluido es un snapshot del paso 212.000; el learning rate se reinicio a 1e-4 en el paso 192.000, por lo que el modelo esta en fase de recuperacion y sera reemplazado. El codificador de texto Ettin-150M esta congelado y se combina con un mezclador aprendible de capas; el decodificador del autoencoder se reentreno como cabecera de flujo en espacio de pixeles. No se documentan tecnicas de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de imagenes texto-a-imagen a 256x256 pixeles, con lados multiplos de 64.
- Flow matching con muestreo Euler de 8-16 pasos y cfg 1,5-2,5.
- Composicion y simetria globales gracias al cuello de botella de 16 tokens con atencion completa.
- Detalle fino local mediante convoluciones 3x3 en la rejilla de 1024 tokens.
- Condicionamiento textual en los cuatro niveles de la piramide.
- Entrenamiento y ejecucion factibles en hardware de consumo (una RTX 4080).
- No soporta tool calling, function calling, agentes, vision de entrada, audio ni modo de razonamiento.
- No genera glifos ni texto legible en la imagen.

## Casos de uso

- Investigacion en arquitecturas de difusion: la piramide con skip aditivas y cuello de botella de 16 tokens sirve como banco de pruebas para estudiar el equilibrio entre coste computacional y detalle, con metricas comparadas frente a un DiT plano de igual numero de parametros.
- Prototipado rapido en hardware de consumo: al entrenarse en una RTX 4080 y ocupar 803 MiB en fp16, permite iterar sobre pipelines texto-a-imagen en estaciones de trabajo modestas sin acceso a clusters.
- Generacion de miniaturas y bocetos a baja resolucion: util para maquetas de interfaz, placeholders de diseno o pruebas de concepto donde 256x256 es suficiente y no se requiere fidelidad fotografica.
- Docencia y divulgacion: el codigo, las notas de arquitectura (docs/ARCH.md) y las diapositivas permiten explicar flow matching, latentes 8x/32 canales y U-transformers con un caso real y reproducible.
- Aumento de datasets sinteticos de bajo coste: generacion de imagenes de 256x256 para preentrenamiento o regularizacion de clasificadores, aceptando la perdida de fidelidad anatomica.
- Experimentacion con autoencoders: el bundle incluye el AE f8c32-ae y su decodificador reentrenado como cabecera de flujo, lo que permite estudiar la reconstruccion en espacio de pixeles y el techo de detalle del latente.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son comparativas internas de coste y detalle entre la piramide y un DiT plano de igual numero de parametros:

| Metrica | Piramide (Ra) | DiT plano equivalente | Referencia |
|---|---|---|---|
| GFLOP por forward del cuerpo | 20,4 | 232 | no disponible |
| Tiempo por paso | 97 ms | 196 ms | no disponible |
| Metrica de detalle | 0,54 | 0,18 | 0,913 (real) / 0,859 (techo AE) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, FID, CLIP score) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el bundle fp16 ocupa 803 MiB, por lo que la inferencia cabe holgadamente en GPUs de 8 GB o menos; no se documenta el pico de memoria durante el muestreo.
- GPU recomendadas: RTX 4080 (hardware usado para el entrenamiento); cualquier GPU consumer con al menos 8 GB deberia ser suficiente para inferencia en fp16.
- Cabe en GPU consumer: si, incluida la propia RTX 4080 usada para entrenar.
- Opciones de despliegue: el repositorio usa la libreria diffusers y un script propio (src/sample.py); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusion).
- Latencia y throughput: 97 ms por paso del cuerpo segun el autor; con 8-16 pasos Euler y 4-8 pasos de cabecera, el tiempo total por imagen no esta documentado de forma agregada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ra (AiArtLab) | 177,3M | 256x256 | MIT (AE Apache-2.0) | Hugging Face, diffusers |
| SDXS (AiArtLab) | 1,6B | no disponible en la informacion | no disponible | Hugging Face |
| Ettin-150M (jhu-clsp) | 150M | codificador de texto, no generativo | MIT | Hugging Face |
| f8c32-ae (Muinez) | no disponible | autoencoder 8x/32 canales | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de Ra con alternativas de la misma categoria; la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Anatomia animal deficiente (el propio autor senala fallos en el zorro) y manos incorrectas.
- El detalle inferior a 8 px lo inventa el decodificador; no hay fidelidad por debajo de esa escala.
- Adherencia laxa a las descripciones textuales y ausencia total de glifos o texto legible.
- Solo genera a 256x256; no admite otras resoluciones salvo lados multiplos de 64 dentro de ese rango.
- Artefacto de investigacion sin ajuste de seguridad ni filtro de contenido: puede producir material inapropiado sin restriccion.
- El transformer incluido es un snapshot intermedio (paso 212.000) con learning rate reiniciado en el paso 192.000; el autor advierte que sera reemplazado y que el modelo esta a mitad de recuperacion.
- Licencia MIT para codigo y pesos, pero el autoencoder incluido es Apache-2.0 y el codificador de texto MIT; conviene verificar el cumplimiento de ambas al redistribuir.
- Idiomas soportados no documentados; el comportamiento multilingue del condicionamiento textual no esta validado.
- Riesgo de alucinacion visual inherente a los modelos generativos de baja resolucion, agravado por el techo de detalle del AE.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AiArtLab/Ra
- Listado de modelos del autor: https://huggingface.co/AiArtLab/models
- Sitio web del autor: https://aiartlab.org/
- Codificador de texto Ettin-150M: https://huggingface.co/jhu-clsp/ettin-encoder-150m
- Autoencoder f8c32-ae: https://huggingface.co/Muinez/f8c32-ae
- Dataset FLUX-Reason-6M: https://huggingface.co/datasets/LucasFang/FLUX-Reason-6M
- Notas de arquitectura: docs/ARCH.md (incluido en el repositorio del modelo)
- Diapositivas (en ruso): docs/presentation.pdf (incluido en el repositorio del modelo)
