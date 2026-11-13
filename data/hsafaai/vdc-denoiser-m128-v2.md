# hsafaai/vdc-denoiser-m128-v2

## Resumen

`vdc-denoiser-m128-v2` es un estimador de copulas de pares (pair-copula) sobre una rejilla lineal de 128 x 128, desarrollado por el autor `hsafaai` como parte del trabajo *Amortized Vine Copulas for High-Dimensional Density and Information Estimation* presentado en NeurIPS 2026. No es un modelo de lenguaje: es un denoiser basado en una U-Net que estima densidades bivariadas y, a partir de ellas, permite construir vine copulas para modelar densidades de alta dimension y estimar informacion mutua. El modelo resuelve el problema de estimar copulas de pares de forma amortizada, sustituyendo el ajuste parametrico clasico por una red entrenada que aproxima la densidad directamente desde pseudo-observaciones.

Este checkpoint concreto es un modelo exploratorio de reentrenamiento sobre datos corregidos, posterior a la revision del paper. Segun la model card, los resultados principales del articulo usan `vdc-denoiser-m64-v1`, no este modelo. La version `m128-v2` mejora la verosimilitud bivariada respecto al modelo original (KL retenida media de 0,00311 nats frente a 0,00611) pero no supera al modelo original en todos los conjuntos de datos UCI ni en la particion cronologica del S&P100.

La relevancia actual es acotada y muy especializada: sirve a investigadores que trabajen con vine copulas, estimacion de densidad no parametrica en dimensiones moderadas y estimacion de informacion mutua, y que necesiten un componente preentrenado que pueda integrarse en la libreria `vine-denoising-copula` (v0.3.0 o superior) sin reentrenar desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net denoiser (VDC, original) sobre rejilla lineal 128 x 128; estimador de pair-copula |
| Parametros totales | 132.953.729 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de 128 x 128 celdas de histograma) |
| Tipos de cuantizacion | no disponible; pesos en float32 |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch, `model_state_dict` + `config` + `step`) |
| Tamano del repo | 0,5 GB |
| Libreria requerida | `vine-denoising-copula` >= 0.3.0 |
| Precisión de inferencia evaluada | float32, TF32 desactivado |
| SHA-256 del checkpoint | `f0a753d50b3cfb089e6d7dec999cfe741c6342c188454ec83183a9b3514d4653` |

## Arquitectura y entrenamiento

La arquitectura es la U-Net denoiser original del metodo VDC, con 132.953.729 parametros en float32. La red recibe un histograma de 128 x 128 de pseudo-observaciones sobre celdas uniformes (conteos divididos por n y por el area de la celda), junto con log n y las coordenadas probit de los centros de celda, evaluado en t = 0. La salida, recortada a [-15, 15] y exponenciada, proporciona los valores de nodo de una densidad bilineal que se proyecta a margenes uniformes mediante pesos de base integrados (30 iteraciones; 15 para S&P100). Cada pair-copula se reproyecta en float64 (IPFP con completado de Newton), de modo que su PDF, CDF condicionales e inversas son exactas para esa densidad.

El entrenamiento consistio en un piloto de 60.000 pasos desde pesos aleatorios (SHA-256 `6e48f8c65012f4170ee9003c4aca28600abdb602ef624e47c3c3f92c0f5ace20`) seguido de 8.000 pasos de ajuste fino por verosimilitud. Las entradas usan uniformes latentes con probabilidad 0,75 y pseudo-observaciones de rango en el resto de casos. La evaluacion se realizo con lotes de red de 16 aristas, lotes externos de 64 aristas y recorte condicional de 1e-12, en una H100 con cuatro hilos de CPU.

## Capacidades

- Estimacion de densidades bivariadas mediante pair-copulas a partir de pseudo-observaciones (n, 2).
- Calculo de PDF de la copula (`copula.pdf(u, v)`).
- Calculo de CDF condicionales (`copula.h_u_given_v(u, v)`) y sus inversas (`copula.hinv_u_given_v(q, v)`).
- Construccion de vine copulas (tipo `dvine`) mediante `VineCopulaModel.from_pretrained` y ajuste sobre datos de entrenamiento con `vine.fit`.
- Evaluacion de log-verosimilitud sobre datos de test (`vine.logpdf`).
- Estimacion de informacion mutua en el contexto del paper (mediante las copulas ajustadas).
- Soporte de rejilla lineal de 128 x 128 (requiere `vine-denoising-copula` >= 0.3.0).
- No soporta generacion de texto, codigo, vision, audio, tool calling ni razonamiento multi-paso.

## Casos de uso

- Estimacion de densidad bivariada en investigacion estadistica: el modelo permite obtener una pair-copula directamente desde pseudo-observaciones sin seleccion parametrica de familia, util cuando se trabaja con margenes continuas y se quiere evitar el ajuste manual.
- Construccion de vine copulas en dimensiones moderadas: mediante `VineCopulaModel.from_pretrained(vine_type="dvine")` se puede ajustar un D-vine completo usando el denoiser como estimador de cada par, adecuado para modelar dependencias en datos tabulares de decenas de variables.
- Estimacion de informacion mutua: las copulas ajustadas permiten calcular informacion mutua entre pares de variables en estudios de dependencia, un caso de uso directo del paper.
- Modelado de series financieras: la model card reporta evaluacion sobre S&P100 (NLL -0,41876 bits/dim en particion cronologica), por lo que es aplicable a modelado de dependencia entre activos con datos diarios.
- Analisis de datos UCI de alta dimension: se ha evaluado en POWER, GAS, HEPMASS y MINIBOONE, por lo que encaja en pipelines de comparacion de estimadores de densidad en benchmarks tabulares.
- Investigacion reproducible en copulas: el repo incluye `training/` con recetas ejecutables (`scripts/train_linear_grid_estimator.py`), `evaluation.json` y `manifest.json`, lo que permite reproducir el ajuste fino y verificar hashes.
- Integracion en pipelines de analisis estadistico con Python: la API expone metodos directos (`pdf`, `h_u_given_v`, `hinv_u_given_v`) que se pueden encadenar en scripts de analisis de dependencia.

## Benchmarks y rendimiento

Verosimilitud bivariada sobre los nueve casos de la Tabla 1 del paper (cinco semillas, n = 2.000, 20.000 puntos de test por ajuste, KL retenida media en nats, menor es mejor):

| Metrica | Valor |
|---|---|
| vdc-denoiser-m128-v2 | 0,00311 +/- 0,00213 |
| Modelo original | 0,00611 |
| Mejora relativa | 49,1% menor |
| Ajustes en los que mejora | 41/45 |
| Seleccion parametrica (referencia) | 0,00036 |

Vine copulas UCI (splits MAF, NLL en bits/dim, menor es mejor; PIT-KS sobre filas de test retenidas):

| Dataset | Train | Original | TLL | vdc-denoiser-m128-v2 | PIT-KS |
|---|---|---|---|---|---|
| POWER | 5k | -0,1413 | -0,1822 | -0,1639 | 0,0149 |
| GAS | 5k | -1,4773 | -1,7050 | -1,5957 | 0,0368 |
| HEPMASS | 5k | -0,2372 | -0,2009 | -0,2643 | 0,0161 |
| MINIBOONE | 5k | -0,9689 | -0,7444 | -0,9661 | 0,0232 |
| POWER | 50k | -0,1495 | -0,2169 | -0,1924 | 0,0103 |
| GAS | 50k | -1,4926 | -1,8113 | -1,6800 | 0,0245 |
| HEPMASS | 50k | -0,2468 | -0,2653 | -0,2936 | 0,0138 |
| MINIBOONE | 29.556 | -0,9784 | -0,8716 | -0,9856 | 0,0202 |

S&P100 cronologico (339 dias retenidos): NLL -0,41876 bits/dim frente a -0,41849 del modelo original y -0,29276 de TLL; diferencia pareada respecto al original -0,00027 (intervalo bootstrap por bloques de 40 dias al 95%: [-0,00345, 0,00323]). Tiempo de ajuste 81,0 s; lotes bivariados en caliente 18,87 ms por arista.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 132,95 M de parametros en float32, los pesos ocupan aproximadamente 0,53 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: la evaluacion del paper se realizo en una H100. Dado el tamano, cualquier GPU con al menos 2-4 GB de VRAM libre deberia ser suficiente para inferencia; no se han publicado mediciones en otras GPUs.
- Cabe en GPU de consumo: si, por el tamano de los pesos (0,53 GB en float32); no se especifican modelos concretos probados.
- Opciones de despliegue: la libreria `vine-denoising-copula` (v0.3.0 o superior) con PyTorch 2.9.1, NumPy 2.2.6, SciPy 1.15.3 y pyvinecopulib 0.7.5. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: 18,87 ms por arista en lotes bivariados en caliente; tiempo de ajuste de vine 81,0 s en el caso S&P100 (H100, cuatro hilos de CPU).

## Comparativa con modelos similares

| Modelo | Parametros | Rejilla | Tipo | Licencia | Contexto de uso |
|---|---|---|---|---|---|
| vdc-denoiser-m128-v2 | 132.953.729 | 128 x 128 | U-Net denoiser (VDC) | MIT | Exploratorio, posterior a revision |
| vdc-denoiser-m64-v1 | no disponible | 64 x 64 | U-Net denoiser (VDC) | no disponible en la informacion | Modelo principal del paper (NeurIPS 2026) |
| vdc-denoiser-m64-v2 | no disponible | 64 x 64 | U-Net denoiser (VDC) | no disponible en la informacion | Companion model citado en la model card |
| Seleccion parametrica de copulas | no aplica | no aplica | Metodo clasico | no aplica | Referencia de exactitud (KL 0,00036) |

No se dispone de informacion sobre otros estimadores de copulas basados en redes neuronales comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo exploratorio: no sustituye las afirmaciones principales de exactitud ni de velocidad del paper.
- El desarrollo del modelo uso familias de copulas del conjunto out-of-distribution del paper, por lo que no existe una evaluacion out-of-distribution limpia.
- La particion aleatoria del S&P100 solapa con datos de desarrollo (272 de 339 dias de test) y no constituye una evaluacion retenida; solo la particion cronologica lo es.
- Se uso una sola semilla de piloto y una sola de ajuste fino; un piloto replicado con la misma receta fue peor que el original en S&P100 cronologico para VDC-128.
- Los resultados en coma flotante son reproducibles bit a bit solo en el tipo de dispositivo y software registrados (PyTorch 2.9.1, NumPy 2.2.6, SciPy 1.15.3, pyvinecopulib 0.7.5).
- Requiere margenes continuas y la simplifying assumption de las vine copulas.
- En los conjuntos UCI, el modelo no supera al original en todos los casos (por ejemplo, en POWER 5k y 50k, GAS 5k y 50k, y MINIBOONE 5k y 29.556 el original obtiene mejor NLL).
- La seleccion parametrica sigue siendo mas precisa en las familias in-library (0,00036 frente a 0,00311 nats).
- Licencia MIT: permite uso comercial, pero al ser un modelo de investigacion estadistica no incluye garantias de idoneidad para produccion.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes; cualquier uso fuera de estimacion de densidad/copulas queda fuera de su alcance.

## Enlaces

- Hugging Face: https://huggingface.co/hsafaai/vdc-denoiser-m128-v2
- Paper citado: Safaai, H. *Amortized Vine Copulas for High-Dimensional Density and Information Estimation*. NeurIPS 2026 (no se proporciona URL en la informacion disponible).
- Libreria requerida: `vine-denoising-copula` v0.3.0 o superior (no se proporciona URL del repositorio en la informacion disponible).
- Script de entrenamiento: `scripts/train_linear_grid_estimator.py` del repositorio de la libreria (no se proporciona URL en la informacion disponible).
