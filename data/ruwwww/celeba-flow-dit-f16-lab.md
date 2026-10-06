# ruwwww/celeba-flow-dit-f16-lab

## Resumen

CelebA-HQ f16 Flow Matching DiT Lab es una coleccion de artefactos de investigacion publicada por el usuario ruwwww en HuggingFace, orientada a la generacion y reconstruccion de rostros sobre el conjunto de datos CelebA-HQ. No se trata de un modelo de lenguaje, sino de un banco de pruebas (testbed) compuesto por dos componentes acoplados: un autoencoder variacional (VAE) de 32 canales latentes y un Diffusion Transformer (DiT) de 176,9 millones de parametros entrenado con flow matching sobre transporte optimo. El autor lo describe explicitamente como un "research testbed" en la model card.

El objetivo del proyecto es explorar tecnicas de compresion latente y de generacion por flujo. El VAE incorpora normalizacion RMS Sphere, enmascarado de canales de sufijo, alineacion con DINOv2 mediante pooling y balanceo adaptativo de gradientes al estilo VQGAN. Sobre ese espacio latente de 16x16x32 opera el DiT, modulado con adaLN-Zero y condicionado por 64 clusters semanticos de DINOv2, con soporte de Classifier-Free Guidance (CFG). El conjunto se distribuye bajo licencia MIT.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, creado y actualizado el 6 de octubre de 2026, y cuyo interes principal reside en servir de referencia reproducible para quienes experimentan con VAEs de canal latente amplio y con flow matching aplicado a dominios acotados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con flow matching sobre transporte optimo, acoplado a un VAE ConvNeXt/ResNet de 32 canales latentes |
| Parametros totales | 176,9 millones (DiT); el VAE es un componente adicional (~12 MB de pesos) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de generacion de imagenes); espacio latente de 16 x 16 x 32 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo consta de dos bloques. El primero es un VAE (clase CelebAVAE) con codificador/decodificador de tipo ConvNeXt/ResNet que comprime las imagenes a un espacio latente de 16 x 16 x 32. El VAE emplea normalizacion RMS Sphere (z / norma RMS de z), enmascarado de canales de sufijo, alineacion por pooling con DINOv2 y un esquema de balanceo adaptativo de la norma del gradiente inspirado en VQGAN. El checkpoint liberado corresponde a la epoca 35 y reporta PSNR de 30,56 dB y SSIM de 0,9099 en el conjunto de validacion.

El segundo bloque es un Diffusion Transformer de 176,9 millones de parametros (dimensión D=896, profundidad 12, 14 cabezas) entrenado con flow matching de transporte optimo directamente sobre el espacio latente de 16 x 16 x 32. La modulacion se realiza mediante adaLN-Zero y el condicionamiento usa 64 clusters semanticos derivados de DINOv2, con Classifier-Free Guidance. El checkpoint del DiT corresponde a la epoca 120, tras 105.000 pasos de entrenamiento. El muestreo de referencia documentado usa un solver Euler ODE de 50 pasos con escala CFG de 3,0. El conjunto de datos de trabajo es CelebA-HQ; no se detalla en la informacion disponible el numero de imagenes de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Generacion de imagenes de rostros en el dominio CelebA-HQ mediante muestreo con Euler ODE (50 pasos documentados) y CFG (escala 3,0 en los ejemplos publicados).
- Reconstruccion de imagenes a traves del VAE de 32 canales, con una comparativa visual frente a una variante ablacionada de 16 canales.
- Condicionamiento semantico mediante 64 clusters de DINOv2, lo que permite modular la generacion segun agrupaciones semanticas aprendidas.
- Modulacion adaLN-Zero, tecnica habitual para inyectar condicionamiento y paso temporal en DiT.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues, dado que no es un modelo de lenguaje.
- No se documenta capacidad de vision a la entrada (no hay pipeline de vision-lenguaje); el uso de DINOv2 es interno, como senal de alineacion y condicionamiento.

## Casos de uso

- Investigacion en VAEs de canal latente amplio: el checkpoint de 32 canales permite reproducir experimentos de compresion latente y comparar frente a la variante de 16 canales incluida en la grid de reconstruccion.
- Estudio de flow matching frente a difusion clasica: al operar con transporte optimo y Euler ODE, sirve como banco de pruebas para comparar estabilidad y calidad de muestreo a distintos numeros de pasos.
- Experimentacion con condicionamiento por clusters semanticos: los 64 clusters de DINOv2 permiten analizar como afecta el condicionamiento discreto a la generacion de rostros.
- Reconstruccion facial en pipelines de vision: el VAE puede emplearse para evaluar limites de fidelidad (PSNR 30,56 dB, SSIM 0,9099) en tareas de autoencoding de rostros.
- Docencia y prototipado de arquitecturas DiT: el tamano contenido del DiT (176,9M) y del VAE (~12 MB) facilita su uso en entornos academicos con recursos limitados.
- Reproduccion de experimentos de modulacion adaLN-Zero: util para validar implementaciones propias de DiT con modulacion y CFG.
- Base para fine-tuning en dominios faciales concretos: al ser un modelo pequeno y con licencia MIT, puede adaptarse a subconjuntos especificos de rostros siempre que se respeten las condiciones de uso del dataset original.

## Benchmarks y rendimiento

| Modelo / componente | Metrica | Valor | Conjunto |
|---|---|---|---|
| VAE (epoca 35, 32 canales) | PSNR | 30,56 dB | Validacion |
| VAE (epoca 35, 32 canales) | SSIM | 0,9099 | Validacion |
| DiT 176,9M | FID / IS / otras | No disponible | No disponible |

No se han publicado resultados de benchmarks adicionales (FID, IS, precision, recall, etc.) en la informacion disponible. Los unicos datos cuantitativos son el PSNR y el SSIM del VAE en validacion, ademas del detalle de entrenamiento del DiT (epoca 120, 105.000 pasos).

## Requisitos de hardware

- Pesos del DiT: aproximadamente 675 MB en safetensors; pesos del VAE: aproximadamente 12 MB. El repositorio completo ocupa 0,7 GB.
- VRAM estimada para inferencia: con 176,9M parametros, la inferencia cabe holgadamente en GPU de consumo; se estima un consumo del orden de pocos GB en funcion del tamano de lote y del numero de pasos de muestreo, aunque no se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM deberia ser suficiente; tarjetas como RTX 3060, RTX 4070 o RTX 4090 son adecuadas. No se documentan recomendaciones oficiales.
- Cabe en GPU de consumo: si, dado el tamano de los pesos (~687 MB en total).
- Opciones de despliegue: entorno PyTorch, ya que los repositorios de codigo son celeba-vae-lab y celeba-dit-lab. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / latente | Licencia | Disponibilidad |
|---|---|---|---|---|
| CelebA-HQ f16 Flow Matching DiT Lab (este modelo) | 176,9M (DiT) + VAE | Latente 16 x 16 x 32 | MIT | HuggingFace, 0 descargas |
| DiT original (Peebles y Xie) | 33M a 675M segun variante | Latente 32 x 32 x 4 (ImageNet) | Codigo abierto (consulta la licencia del repo) | Repositorio publico |
| Modelos de difusion sobre CelebA-HQ (p. ej. DDPM/EDM) | Variable | Pixeles o latente | Variable | Repositorios publicos |

No se dispone de datos de rendimiento comparables (FID u otras metricas) en la informacion proporcionada para establecer una comparativa cuantitativa fiable. Las alternativas anteriores se citan solo como referencia de categoria (difusion/flow matching sobre rostros y DiT generico).

## Limitaciones y advertencias

- Modelo de investigacion (research testbed): no esta pensado para produccion ni se documenta su robustez fuera de CelebA-HQ.
- Dominio muy acotado: entrenado exclusivamente sobre rostros de CelebA-HQ; no generaliza a otras categorias de imagen.
- Artefacto sin comunidad: cero descargas y cero likes en el momento de la consulta; no hay validacion externa ni soporte.
- Composicion del dataset de entrenamiento no detallada: no se especifican numero de imagenes, filtrado ni posibles sesgos demograficos heredados de CelebA-HQ.
- Riesgo de sesgo: CelebA-HQ es conocido por desequilibrios en atributos demograficos; esos sesgos pueden propagarse al VAE y al DiT.
- Calidad de generacion no cuantificada: solo hay muestras cualitativas (samples_dit_177m_cfg3.png) y metricas de reconstruccion del VAE; no hay FID ni evaluaciones objetivas de la generacion.
- Licencia MIT en el artefacto, pero el uso comercial puede verse condicionado por los terminos del dataset CelebA-HQ subyacente; conviene verificar la licencia del dataset antes de usos comerciales.
- No hay informacion sobre cuantizacion, exportacion a formatos alternativos ni optimizaciones de inferencia (compilacion, decodificacion especulativa, etc.).
- Fechas de creacion y actualizacion: 6 de octubre de 2026 (alta y ultima modificacion muy proximas), lo que sugiere un artefacto recien publicado y sin rodaje.

## Enlaces

- HuggingFace: https://huggingface.co/ruwwww/celeba-flow-dit-f16-lab
- Codigo de entrenamiento del VAE: https://github.com/ruwwww/celeba-vae-lab
- Codigo de flow matching del DiT: https://github.com/ruwwww/celeba-dit-lab
- Checkpoints: celeba_vae_f16c32.safetensors (~12 MB), celeba_flow_dit_177m.safetensors (~675 MB)
- Muestras: samples_dit_177m_cfg3.png, reconstruction_comparison_vae_epoch35.png
- Paper de referencia (DiT, no vinculado por el autor pero relevante para la arquitectura): no disponible en la informacion proporcionada
- Blog o demo oficial: no disponible
