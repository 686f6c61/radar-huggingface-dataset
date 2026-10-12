# mikezhu/cfg-geometry-video

## Resumen

cfg-geometry-video es un conjunto de checkpoints de generacion de video publicado por el usuario mikezhu como material de soporte del articulo *Learning to Be Guided: Shaping Latent Geometry for Classifier-Free Guidance*. No se trata de un modelo entrenado desde cero, sino de una coleccion organizada en dos etapas: un VAE de video (LeanVAE-16) afinado sobre UCF-101 y un modelo de difusion latente (Latte-XL/2) entrenado sobre los latentes de ese VAE para generar clips condicionados por clase.

El proposito del trabajo es estudiar como la geometria del espacio latente condiciona la eficacia del classifier-free guidance (CFG). Para ello introduce una Prototype Regularization (PR), un clasificador de prototipos coseno aplicado sobre el latente limpio promediado, cuyo peso se ajusta de forma adaptativa equilibrando normas de gradiente. El repositorio incluye cuatro filas comparativas (ref, host, base y pr) que permiten reproducir el estudio y contrastar configuraciones con y sin regularizacion.

El modelo opera sobre clips de 17 fotogramas a 256x256 pixeles, con un latente por clip de forma [5, 16, 32, 32], y esta pensado para generacion de video condicionada por las 101 clases de acciones de UCF-101. Su relevancia es fundamentalmente como recurso de investigacion sobre CFG y regularizacion de latentes, no como modelo de produccion generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente para video: Latte-XL/2 (transformer de difusion con capas temporales) sobre latentes de un VAE de video LeanVAE-16 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; clips de 17 fotogramas a 256x256, latente por clip de forma [5, 16, 32, 32] |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (generacion de video, no texto) |
| Licencia | no disponible (el autor indica que se fijara antes del lanzamiento publico) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El pipeline combina dos componentes. En la etapa 1 se afina LeanVAE-16, un VAE de video, utilizando la propia funcion de perdida de LeanVAE, con dos variantes: sin regularizacion (fila `base`) y con Prototype Regularization (fila `pr`). La PR es un clasificador de prototipos coseno que actua sobre el latente limpio promedio, y su peso se determina de forma adaptativa balanceando las normas de gradiente. En la etapa 2 se entrena Latte-XL/2, un transformer de difusion latente con modelado temporal, sobre los latentes producidos por cada VAE. Cada fila de Latte se inicializa en caliente (*warm-start*) desde el checkpoint `ucf-dim16.pt` de los autores de Latte y se entrena durante 50.000 pasos adicionales.

El conjunto de datos de referencia es UCF-101 (Soomro et al., 2012), empleado tanto para el afinado del VAE como para el entrenamiento condicionado de Latte. Los clips son de 17 fotogramas a 256x256. El repositorio distribuye, por cada fila de Latte, los pesos EMA en `model.safetensors` (con el bloque de configuracion del modelo en los metadatos) y un `latent_stats.safetensors` con la media y desviacion por canal de los latentes de ese VAE sobre el conjunto de train de UCF-101, necesarios para des-normalizar los latentes muestreados antes de decodificar. Cada fichero de VAE almacena los argumentos de arquitectura de LeanVAE en sus metadatos (`leanvae_args`).

## Capacidades

- Generacion de video condicionada por clase para las 101 categorias de acciones de UCF-101, a 17 fotogramas y 256x256 pixeles.
- Muestreo con classifier-free guidance configurable (se documentan escalas de guia optimas por fila: 3.0, 4.0 y 6.0).
- Muestreo con y sin CFG (se reportan metricas para ambos regimenes).
- Reconstruccion de video mediante el VAE subyacente (se reportan rFVD, PSNR y LPIPS sobre ventanas de train).
- No soporta generacion de texto ni dialogo; no hay tool calling, function calling ni razonamiento multi-paso.
- No se documenta soporte multilingue ni capacidades de audio o vision de entrada.

## Casos de uso

- Investigacion sobre classifier-free guidance: el repositorio permite reproducir el estudio comparando las filas `ref`, `host`, `base` y `pr` y analizar como la regularizacion del latente altera la escala de guia optima y el FVD.
- Estudio de geometria de espacios latentes: la Prototype Regularization y las estadisticas de latentes por canal facilitan experimentos sobre estructura y normalizacion del espacio latente de un VAE de video.
- Generacion condicionada de acciones en UCF-101: servir como base para comparar metodos de generacion de video condicionada por clase en un benchmark academico estandar.
- Reproducibilidad de resultados academicos: los checkpoints EMA y las configuraciones embebidas en metadatos permiten recalcular las metricas publicadas (FVD, Acc, IS) con 2.048 clips y 250 pasos DDPM.
- Evaluacion del impacto de la inicializacion: las filas `ref`, `host` y `base` permiten medir el efecto del warm-start y del reentrenamiento sobre el rendimiento de generacion.
- Base para transferencia a otros dominios de video: el VAE afinado y los latentes normalizados pueden reutilizarse como representacion latente para futuros entrenamientos de difusion fuera de UCF-101.
- Analisis de reconstruccion de VAE: el subconjunto `vae/base` y `vae/pr` permite estudiar el compromiso entre calidad de reconstruccion (PSNR, LPIPS) y capacidad generativa del latente.

## Benchmarks y rendimiento

Resultados de generacion publicados por el autor, con 2.048 clips por celda y 250 pasos DDPM. `cfg*` es la mejor escala de guia por fila obtenida en un barrido de 512 clips. Los clips reales puntuan 0.999 de Accuracy y 73.7 +/- 3.2 de Inception Score.

| Fila | Etapa 1 (VAE) | Etapa 2 (Latte) | cfg* | FVD @ cfg* | Acc | IS | FVD sin CFG | Acc sin CFG | IS sin CFG |
|---|---|---|---|---|---|---|---|---|---|
| ref | shipped | shipped `ucf-dim16.pt` | 6.0 | 167.0 [142.3, 194.6] | 0.929 | 71.8 +/- 3.5 | 340.2 [301.5, 378.0] | 0.872 | 56.1 +/- 2.6 |
| host | shipped | +50k pasos | 3.0 | 161.4 [136.5, 186.1] | 0.985 | 71.8 +/- 2.2 | 302.0 [265.2, 339.9] | 0.927 | 58.4 +/- 2.1 |
| base | 3 epocas, perdida LeanVAE | +50k pasos | 4.0 | 152.7 [131.5, 176.5] | 0.990 | 74.1 +/- 2.0 | 287.3 [249.9, 324.0] | 0.930 | 58.7 +/- 2.9 |
| pr | 3 epocas, perdida LeanVAE + PR | +50k pasos | 4.0 | 140.1 [116.4, 165.3] | 0.989 | 73.9 +/- 2.4 | 275.7 [243.4, 310.9] | 0.930 | 59.6 +/- 1.0 |

Reconstruccion del VAE sobre 2.048 ventanas de train (fotogramas 1..16, pesos EMA):

| VAE | rFVD | PSNR | LPIPS |
|---|---|---|---|
| shipped | 4.20 | 33.80 | 0.0908 |
| base | 5.06 | 34.11 | 0.0733 |
| pr | 5.09 | 34.10 | 0.0737 |

Las metricas de FVD usan cd-fvd I3D contra 2.048 ventanas reales con intervalo de confianza del 95% por remuestreo centrado de 200; el Accuracy emplea un clasificador VideoMAE de UCF-101; el Inception Score es el de video (TGAN C3D, StyleGAN-V/Latte `isv2048_ucf`) sobre 10 particiones.

## Requisitos de hardware

- No se publican requisitos oficiales ni cifras de latencia o throughput en la informacion disponible.
- El repositorio completo ocupa 42,2 GB e incluye varios checkpoints (VAE base y pr, y filas de Latte ref/host/base/pr con sus estadisticas de latentes).
- Para inferencia de Latte-XL/2 a 256x256 y 17 fotogramas, una estimacion razonable en funcion de la clase de modelo es de 8 a 16 GB de VRAM en precision de 16 bits, segun tamano de lote y pasos de muestreo (estimacion propia, no confirmada por el autor).
- Cabe previsiblemente en GPUs de consumo como RTX 3090 o RTX 4090 (24 GB); en GPUs de 12-16 GB requeriria lotes reducidos. No confirmado.
- Para lotes grandes o entrenamiento se recomiendan GPUs de datacenter (A100, H100); no confirmado por el autor.
- Opciones de despliegue: no hay pipeline oficial. La carga se realiza con seguridades de safetensors y el codigo de Vchitect/Latte (modelo) y westlake-repl/LeanVAE (VAE). No se documenta soporte en vLLM, TGI, Ollama o llama.cpp, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Resolucion / contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cfg-geometry-video (fila pr) | Difusion latente + VAE de video | no disponible | 17 fotogramas, 256x256 | no disponible (pendiente de fijar) | HF mikezhu/cfg-geometry-video |
| Latte-XL/2 (Vchitect/Latte) | Difusion latente para video | no disponible | configurable | Apache-2.0 | GitHub Vchitect/Latte |
| LeanVAE-16 (westlake-repl/LeanVAE) | VAE de video | no disponible | video | MIT | GitHub westlake-repl/LeanVAE y HF Yumic/LeanVAE |
| UCF-101 (dataset) | Conjunto de datos de video | no aplica | 101 clases de acciones | uso academico (Soomro et al., 2012) | UCF-101 oficial |

No se dispone de cifras de benchmarks de terceros para estas alternativas dentro de la informacion proporcionada, por lo que la comparacion se limita a tipo, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de investigacion: esta ligado al dominio de UCF-101 y no esta pensado como generador de video generalista ni como servicio de produccion.
- La licencia de los pesos no esta definida; el autor indica que se fijara antes del lanzamiento publico. No debe asumirse uso comercial permitido.
- El codigo (`cfg-geometry-video` en GitHub) figura como "to be released" en la model card; la carga sin ese repositorio requiere reconstruir el pipeline con codigo externo de LeanVAE y Latte.
- Dependencia de terceros: LeanVAE (MIT) y Latte (Apache-2.0) tienen sus propias condiciones; UCF-101 tiene terminos de uso academico.
- Resolucion y longitud fijas y modestas (17 fotogramas a 256x256), lo que limita su aplicacion a clips cortos.
- Riesgo de alucinacion y de artefactos propios de modelos de difusion de video; no se documentan evaluaciones de sesgo.
- No hay datos publicados sobre sesgos, robustez fuera de UCF-101 ni comportamiento multilingue (no aplica a texto).
- Cero descargas y cero "likes" en el momento de la consulta; la adopcion y validacion externa son nulas.
- No se publican requisitos de hardware, latencia ni throughput, lo que dificulta planificar su despliegue.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mikezhu/cfg-geometry-video
- Pagina del proyecto: https://maps-research.github.io/cfg-geometry/
- Paper de LeanVAE (Cheng & Yuan, 2025): arXiv:2503.14325
- Codigo de LeanVAE: https://github.com/westlake-repl/LeanVAE
- Pesos de LeanVAE: https://huggingface.co/Yumic/LeanVAE
- Codigo de Latte (Ma et al., 2024): https://github.com/Vchitect/Latte
