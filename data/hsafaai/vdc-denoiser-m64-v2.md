# hsafaai/vdc-denoiser-m64-v2

## Resumen

`vdc-denoiser-m64-v2` es un estimador de pares copula basado en una red neuronal desnoiseadora (VDC U-Net) desarrollado por el autor `hsafaai` como parte del apendice "Exploratory retraining on corrected data" del articulo de NeurIPS 2026 *Amortized Vine Copulas for High-Dimensional Density and Information Estimation*. No es un modelo de lenguaje: es un componente estadistico que estima densidades bivariadas y copulas de vin para datos de alta dimension, y se usa como bloque de construccion dentro de la libreria `vine-denoising-copula`.

El modelo lee un histograma de 64 x 64 de pseudo-observaciones sobre celdas uniformes, junto con el logaritmo del tamano muestral y las coordenadas probit de los centros de celda, y devuelve los valores nodales de una densidad bilineal proyectada a margenes uniformes. Con esos valores, la libreria construye copulas de pares cuyas PDF, CDF condicionales y sus inversas son exactas para la densidad estimada, lo que permite ajustar vines tipo D-vine y calcular log-verosimilitudes.

Es relevante en el contexto de estimacion de densidad e informacion mutua en alta dimension, donde los metodos parametricos clasicos son precisos pero poco flexibles y los metodos neuronales genericos son costosos. Este checkpoint es una version exploratoria posterior a la revision del paper: mejora ligeramente al modelo original en verosimilitud bivariada, pero no sustituye los resultados principales del articulo, que usan `vdc-denoiser-m64-v1`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VDC U-Net desnoiseadora (red neuronal para estimacion de copulas de pares) |
| Parametros totales | 132.953.729 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada fija de histograma 64 x 64) |
| Tipos de cuantizacion | no disponible (pesos en float32; inferencia evaluada en float32 con TF32 desactivado) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch, `model_state_dict` + `config` + `step`) |

## Arquitectura y entrenamiento

La arquitectura es la VDC U-Net desnoiseadora original, con 132.953.729 parametros en float32. La red recibe en `t = 0` una representacion compuesta por un histograma de 64 x 64 de pseudo-observaciones sobre celdas uniformes (conteos divididos por `n` y por el area de la celda), el logaritmo de `n` y las coordenadas probit de los centros de celda. Su salida se recorta al intervalo [-15, 15] y se exponencia para obtener los valores nodales de una densidad bilineal, que se proyecta a margenes uniformes mediante pesos de base integrados (30 iteraciones; 15 para S&P100). Cada copula de pares se reproyecta en float64 mediante IPFP con completado de Newton, de modo que su PDF y sus CDF condicionales e inversas son exactas para esa densidad.

El entrenamiento parte de un piloto de 60.000 pasos desde pesos aleatorios (SHA-256 `6e48f8c65012f4170ee9003c4aca28600abdb602ef624e47c3c3f92c0f5ace20`) y continua con 8.000 pasos de ajuste fino por verosimilitud. Las entradas usan uniformes latentes con probabilidad 0,5 y pseudo-observaciones de rango en el resto de casos. El checkpoint final tiene SHA-256 `73097772a18eb4b02fb0608b4bfa87c0205b71667d97af6a39483fd44d0df0fc`. Existe un modelo hermano, `vdc-denoiser-m128-v2`, con rejilla de 128 x 128.

## Capacidades

- Estimacion de densidad bivariada y de copulas de pares a partir de pseudo-observaciones.
- Calculo de PDF de la copula de pares (`copula.pdf`).
- Calculo de CDF condicionales (`copula.h_u_given_v`) y de sus inversas (`copula.hinv_u_given_v`).
- Construccion y ajuste de vines (por ejemplo, D-vine) con `VineCopulaModel.from_pretrained` y `vine.fit`.
- Evaluacion de log-verosimilitud sobre datos de test (`vine.logpdf`).
- Estimacion de informacion mutua en el marco del paper (amortized vine copulas).
- Soporte de rejilla lineal de 64 x 64 (requiere `vine-denoising-copula` v0.3.0 o superior).
- No soporta generacion de texto, codigo, vision, tool calling ni agentes: no es un modelo de lenguaje.

## Casos de uso

- Estimacion de densidad en datos tabulares de alta dimension: ajustar un D-vine sobre variables continuas transformadas a pseudo-observaciones para obtener densidades conjuntas y marginales condicionales, aprovechando que las copulas de pares son exactas para la densidad estimada.
- Calculo de informacion mutua entre pares de variables: usar las copulas de pares ajustadas para estimar dependencias no lineales en estudios de seleccion de variables o analisis de redes.
- Modelado de riesgo financiero: el modelo incluye evaluacion sobre S&P100 (339 dias en split cronologico) y permite ajustar copulas sobre retornos con margenes continuos, con un tiempo de ajuste de 16,0 s.
- Analisis de datos cientificos en UCI: los conjuntos POWER, GAS, HEPMASS y MINIBOONE se usan como referencia; el modelo es aplicable a datos con 5k a 50k muestras de entrenamiento.
- Investigacion metodologica en copulas: servir como estimador de referencia para comparar con familias parametricas o con TLL en experimentos de estimacion de densidad.
- Integracion en pipelines de analisis estadistico en Python: la libreria expone una API directa (`load_pretrained_model`, `estimate_pair_copula_from_samples`, `VineCopulaModel`) que se puede incorporar en cuadernos y scripts de analisis.
- Generacion de densidades condicionales: las funciones `h_u_given_v` y `hinv_u_given_v` permiten muestrear y evaluar condicionales, util para imputacion o simulacion condicionada.

## Benchmarks y rendimiento

Resultados del apendice del paper (una H100, cuatro hilos de CPU):

Verosimilitud bivariada en los nueve casos de la Tabla 1 del paper, cinco semillas, n = 2.000, 20.000 puntos de test por ajuste:

| Metrica | vdc-denoiser-m64-v2 | Modelo original (v1) | Seleccion parametrica |
|---|---|---|---|
| KL retenida media (nats) | 0,00541 +/- 0,00406 | 0,00611 | 0,00036 |
| Mejora relativa | 11,5% inferior | referencia | mas precisa |

Vines UCI (splits MAF, NLL en bits/dim, menor es mejor; PIT-KS sobre filas de test retenidas):

| Dataset | Train | Original | TLL | vdc-denoiser-m64-v2 | PIT-KS |
|---|---|---|---|---|---|
| POWER | 5k | -0,1413 | -0,1822 | -0,1544 | 0,0170 |
| GAS | 5k | -1,4773 | -1,7050 | -1,5461 | 0,0448 |
| HEPMASS | 5k | -0,2372 | -0,2009 | -0,2579 | 0,0172 |
| MINIBOONE | 5k | -0,9689 | -0,7444 | -0,9550 | 0,0242 |
| POWER | 50k | -0,1495 | -0,2169 | -0,1802 | 0,0117 |
| GAS | 50k | -1,4926 | -1,8113 | -1,6149 | 0,0314 |
| HEPMASS | 50k | -0,2468 | -0,2653 | -0,2845 | 0,0150 |
| MINIBOONE | 29.556 | -0,9784 | -0,8716 | -0,9791 | 0,0229 |

S&P100 cronologico (339 dias retenidos): NLL -0,41833 bits/dim frente a -0,41849 del modelo original y -0,29276 de TLL; diferencia pareada respecto al original +0,00016 (intervalo bootstrap por bloques de 40 dias al 95%: [-0,00277, 0,00317]). Tiempo de ajuste 16,0 s; lotes bivariados en caliente 4,92 ms por arista.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 132,95 M de parametros en float32, los pesos ocupan aproximadamente 0,53 GB, a lo que hay que sumar activaciones y el estado de la U-Net durante el ajuste del vine.
- GPU recomendadas: la evaluacion del paper se realizo en una H100; el modelo es lo bastante pequeno para ejecutarse en GPUs consumer, aunque no se publican requisitos minimos.
- Cabe en GPU consumer: probablemente si, dado el tamano de los pesos; no confirmado en la informacion disponible.
- Opciones de despliegue: libreria `vine-denoising-copula` v0.3.0 o superior (API Python con PyTorch); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 4,92 ms por arista en lotes bivariados en caliente; ajuste de vine completo en 16,0 s sobre S&P100. No se publican cifras de throughput adicionales.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Resultado destacado | Licencia |
|---|---|---|---|---|---|
| vdc-denoiser-m64-v2 | VDC U-Net para copulas | 132,95 M | no aplica | KL 0,00541 nats; NLL S&P100 -0,41833 | MIT |
| vdc-denoiser-m64-v1 | VDC U-Net para copulas | no disponible | no aplica | KL 0,00611 nats; NLL S&P100 -0,41849 | no disponible |
| vdc-denoiser-m128-v2 | VDC U-Net para copulas (rejilla 128) | no disponible | no aplica | no disponible | no disponible |
| TLL | Estimador de referencia del paper | no disponible | no aplica | NLL S&P100 -0,29276 | no disponible |
| Seleccion parametrica | Familias parametricas | no aplica | no aplica | KL 0,00036 nats | no aplica |

## Limitaciones y advertencias

- Modelo exploratorio: no sustituye las afirmaciones principales de precision ni de velocidad del paper, que se basan en `vdc-denoiser-m64-v1`.
- El desarrollo del modelo tambien utilizo familias de copulas del conjunto out-of-distribution del paper, por lo que no existe una evaluacion out-of-distribution limpia.
- El split aleatorio de S&P100 se solapa con datos de desarrollo del modelo (272 de 339 dias de test) y no constituye una evaluacion retenida; solo el split cronologico lo es.
- Se uso una sola semilla de piloto y de ajuste fino; un piloto replicado con la misma receta fue peor que el original en S&P100 cronologico para VDC-128.
- Los resultados en coma flotante solo son reproducibles bit a bit en el tipo de dispositivo y software registrados (PyTorch 2.9.1, NumPy 2.2.6, SciPy 1.15.3, pyvinecopulib 0.7.5).
- Requiere margenes continuos y la hipotesis simplificadora de las copulas de vin.
- La seleccion parametrica sigue siendo mas precisa que este modelo en las familias de la libreria (KL 0,00036 frente a 0,00541 nats).
- Licencia MIT: permite uso comercial, pero el modelo es un componente estadistico, no un modelo generativo de proposito general; no debe presentarse como sustituto de un LLM.
- No hay informacion sobre sesgos, alucinacion o limitaciones idiomaticas porque no es un modelo de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/hsafaai/vdc-denoiser-m64-v2
- Modelo hermano: https://huggingface.co/hsafaai/vdc-denoiser-m128-v2
- Paper: Safaai, H. *Amortized Vine Copulas for High-Dimensional Density and Information Estimation*, NeurIPS 2026 (no se proporciona URL directa en la informacion disponible).
- Libreria: `vine-denoising-copula` v0.3.0 o superior (no se proporciona URL directa en la informacion disponible).
