# Shayla216/jet-vae-models

## Resumen

jet-vae-models es una coleccion de pesos entrenados de autoencoders variacionales (VAE) publicada por Shayla216 como material de respaldo del articulo jet-vae, centrado en la generacion y reconstruccion de jets de quarks y gluones en fisica de particulas. No es un modelo de lenguaje: son pesos de investigacion para aprendizaje generativo sobre datos de colisiones, repartidos en tres familias (Transformer VAE a nivel de particula, CNN VAE a nivel de imagen y VAEs de imagen sobre conjuntos de datos genericos de vision). El repositorio ocupa aproximadamente 0,5 GB y contiene los artefactos originales de entrenamiento, sin modificaciones, junto con un manifiesto y sumas de verificacion.

La relevancia es acotada a un nicho concreto: investigadores que reproducen o extienden el articulo jet-vae y necesitan exactamente los mismos pesos (latent size, beta y semilla) que aparecen en sus tablas. La familia Transformer opera sobre conjuntos de puntos de forma `(z, eta, phi)` sin identificador de particula y con perdida de reconstruccion Sinkhorn-EMD; la familia CNN trabaja sobre imagenes de jet de 32 x 32; la familia non-jet replica la tabla de referencia del articulo sobre MNIST, FashionMNIST, CelebA y dSprites usando el marco disentangling-vae.

No hay informacion sobre idiomas, pipeline ni parametros totales de los modelos; la model card solo documenta configuraciones de entrenamiento (tamano de latente, beta, semilla y mejor epoca). La licencia es "other" con terminos adicionales que remiten a las condiciones de los conjuntos de datos de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE; tres familias: Transformer VAE a nivel de particula, CNN VAE sobre imagenes de jet 32x32 y VAEs de imagen (disentangling-vae) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante original, sin variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | other (`see-terms-below`); los modelos non-jet heredan los terminos de MNIST, Fashion-MNIST, dSprites y CelebA (este ultimo solo uso no comercial en investigacion) |
| Formato de pesos | `.pth` / `.pt` (checkpoints de PyTorch); incluye `MANIFEST.csv`, `SHA256SUMS.txt`, `specs.json` y `train_losses.log` |

## Arquitectura y entrenamiento

La familia `transformer_vae` implementa un VAE con encoder y decoder basados en Transformer que procesa conjuntos de puntos de forma `(z, eta, phi)`, es decir, sin identificador de particula como entrada. La reconstruccion se optimiza con una perdida Sinkhorn-EMD, adecuada para comparar conjuntos de puntos no ordenados. Se publican siete configuraciones con tamano de latente 32 y valores de beta de 1e-5 (semilla 42), 1e-4, 2e-4, 3e-4, 4e-4, 5e-4 y 1e-3 (semilla 1). Salvo el modelo beta = 1e-5, todos usan semilla 1 con la misma receta.

La familia `cnn_vae` entrena un VAE convolucional sobre imagenes de jet de 32 x 32 con latente 32. El beta efectivo es el beta guardado dividido por `recon_loss_weight` (por ejemplo, 0,001 / 1000 = 1e-6), y se cubren los valores efectivos 1e-6, 2e-6, 3e-6, 4e-6, 5e-6, 1e-5 y 1e-4. La familia `nonjet` contiene VAEs de imagen sobre MNIST, FashionMNIST, CelebA y dSprites entrenados con el repositorio YannDubs/disentangling-vae (opcion `-l betaH`), con tamanos de latente 10, 32 y 128 y betas 0,1, 1 y 4; los modelos de CelebA y dSprites con latente 10 solo se incluyen para beta = 0,1.

No se documentan en la informacion disponible el numero de tokens, el volumen exacto del conjunto de jets simulados ni si hubo etapas de ajuste adicionales mas alla del entrenamiento VAE con su termino KL ponderado por beta. Todos los ficheros son las salidas originales de entrenamiento, sin retoques.

## Capacidades

- Reconstruccion y generacion de jets de quarks y gluones a nivel de particula (conjuntos de puntos `(z, eta, phi)`) mediante el Transformer VAE.
- Reconstruccion y generacion de imagenes de jet de 32 x 32 mediante el CNN VAE.
- Modelado generativo con espacio latente de 32 dimensiones en las familias de jets, lo que permite muestrear jets sinteticos y explorar el espacio latente.
- Reconstruccion y generacion de imagenes en MNIST, FashionMNIST, CelebA y dSprites con los modelos non-jet, con latentes de 10, 32 y 128.
- Barrido controlado de regularizacion: las distintas betas permiten estudiar el compromiso entre fidelidad de reconstruccion y estructura del latente.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, vision general, audio ni modo de pensamiento; no es un modelo de lenguaje ni un modelo multimodal generico.

## Casos de uso

- Reproduccion del articulo jet-vae: cargar los checkpoints con `transformer_vae.encode.load_model` y regenerar las tablas de jets y de benchmarks non-jet del paper con exactamente los mismos pesos, betas y semillas.
- Generacion de jets sinteticos para aumento de datos: muestrear el Transformer VAE con latente 32 para producir conjuntos de particulas adicionales en estudios de senal y fondo donde el volumen de simulacion es limitado.
- Estudio de la regularizacion beta en datos de colisiones: comparar las siete configuraciones del Transformer VAE y las siete del CNN VAE para analizar como varia la fidelidad de reconstruccion al aumentar beta.
- Analisis de representaciones latentes de jets: usar el espacio latente de 32 dimensiones para clustering o visualizacion de subestructura de jets y busqueda de anomalias en datos de colision.
- Comparacion de enfoques de representacion: contrastar el VAE a nivel de particula con perdida Sinkhorn-EMD frente al VAE a nivel de imagen 32 x 32 sobre el mismo problema fisico, usando los pesos publicados de ambas familias.
- Referencia para metodos de disentanglement: emplear los modelos non-jet (MNIST, FashionMNIST, dSprites, CelebA) como linea base reproducible con disentangling-vae en experimentos de representacion desenredada.
- Validacion de pipelines de inferencia cientifica: verificar instalaciones y entornos de PyTorch comprobando que las reconstrucciones coinciden con las esperadas, apoyandose en `SHA256SUMS.txt` y `MANIFEST.csv`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo pesa 0,5 GB y cada checkpoint individual es una fraccion de ese total; por su escala, cabe con holgura en cualquier GPU de consumo actual.
- GPU recomendadas: no se especifican. Para entrenamiento o inferencia por lotes de estos VAEs basta una GPU de gama media; no se documentan requisitos de A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU con varios GB de VRAM; no se detalla el minimo exacto.
- Opciones de despliegue: carga directa en PyTorch mediante el codigo del repositorio MLQCD/jet-vae (`transformer_vae.encode.load_model`), `cnn_vae/code_training/betaVae.py` para el CNN VAE y `disvae.utils.modelIO.load_model` para los modelos non-jet. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Latente | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jet-vae-models (Shayla216) | VAE para jets y vision (Transformer y CNN) | 32 en jets; 10/32/128 en non-jet | no aplica | other (terminos de datasets) | Pesos en Hugging Face, codigo en GitHub |
| Modelos preentrenados de YannDubs/disentangling-vae | VAEs de imagen | 10, 32, 128 | no aplica | segun repositorio original | Publicos en su repositorio; no se repiten aqui |
| Alternativas especificas para generacion de jets | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de generacion de jets en la documentacion proporcionada.

## Limitaciones y advertencias

- Los modelos de jets se entrenaron exclusivamente sobre jets simulados de quarks y gluones; su validez sobre datos reales de detector no esta documentada.
- El Transformer VAE no recibe identificador de particula como entrada; solo modela la forma del conjunto de puntos `(z, eta, phi)`, lo que limita la fidelidad fisica de las muestras.
- El CNN VAE trabaja sobre imagenes de 32 x 32, una resolucion baja que puede perder subestructura fina del jet.
- La licencia es "other" con terminos adicionales; los modelos non-jet heredan las condiciones de sus conjuntos de datos y los de CelebA quedan restringidos a uso no comercial en investigacion.
- Riesgo de sesgo: al entrenarse sobre una simulacion concreta de dijets, las muestras heredan las aproximaciones del generador de eventos y del detector simulado empleados.
- No hay informacion sobre sesgos demograficos ni de idioma porque el modelo no procesa texto ni datos personales, salvo el caso de CelebA en la familia non-jet.
- No se documentan parametros totales, requisitos de hardware ni metricas de rendimiento, lo que dificulta una evaluacion cuantitativa independiente sin ejecutar los checkpoints.
- El repositorio no incluye pipeline declarado ni demos; el uso requiere integrar el codigo del repositorio GitHub correspondiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Shayla216/jet-vae-models
- Conjunto de muestras de jets: https://huggingface.co/datasets/Shayla216/jet-vae-samples
- Codigo del articulo jet-vae: https://github.com/MLQCD/jet-vae
- Repositorio disentangling-vae: https://github.com/YannDubs/disentangling-vae
