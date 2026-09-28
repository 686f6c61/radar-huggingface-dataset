# ShirinShouhstari/FIRM-weights

## Resumen

FIRM (Flow-based Imaging via Regularized Minimization) es un conjunto de once pesos preentrenados en PyTorch para resolver problemas inversos de imagen mediante flow matching condicional. Lo publica Shirin Shoushtari junto con Edward P. Chandler, Xiao Shi y Ulugbek S. Kamilov, con el código alojado en la organización wustl-cig de GitHub y artículo en arXiv (2609.12953). Cubre inpainting aleatorio y por caja, denoising gaussiano, deblurring gaussiano, superresolución y reconstrucción por compresión sensible (Fourier con máscara cartesiana) sobre dos dominios: caras de CelebA a 128x128 y caras de gato de AFHQ-Cat a 256x256.

La aportación técnica es que la velocidad del flujo se parametriza a través de la media posterior condicionada a la medida, caracterizada como el minimizador de un objetivo variacional con un término explícito de consistencia de datos, y esa minimización se despliega con desdoblamiento half-quadratic. El resultado es que el operador forward entra en la velocidad aprendida en cada iteración y no se necesita guía en el muestreo: la reconstrucción se obtiene con dos pasos de Euler (NFE = 10).

Los modelos son pequenos (34,5 M, 59,9 M y 239,4 M parámetros) y cada uno está entrenado para un único operador forward y un único nivel de ruido, por lo que no se espera transferencia a otra degradación sin reentrenar. Es material de reproducción de resultados en investigación, no un producto de restauración fotográfica de uso general.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Flujo condicional (flow matching) con velocidad parametrizada por la media posterior condicionada a la medida y minimización desplegada mediante desdoblamiento half-quadratic |
| Parámetros totales | 34,5 M / 59,9 M / 239,4 M según checkpoint (ver tabla de checkpoints) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de imagen; entra a 128x128 o 256x256 píxeles y produce la misma resolución) |
| Tipos de cuantización | No disponible; se distribuyen checkpoints en punto flotante y no se publican variantes cuantizadas |
| Idiomas soportados | No aplica (no procesa texto ni audio) |
| Licencia | MIT para el contenido del repositorio; los datos de entrenamiento (CelebA y AFHQ-Cat) se publican para investigación no comercial y los pesos heredan esa intención |
| Formato de pesos | Checkpoints PyTorch (`.pt`) con pesos EMA, época de extracción y copia de la sección de configuración; sin estado del optimizador |

Checkpoints incluidos:

| Archivo | Dataset | Problema | Resolución | Parámetros |
|---|---|---|---|---|
| `celeba_inpaint_random.pt` | CelebA | inpainting, 70 % de píxeles descartados | 128 | 34,5 M |
| `celeba_inpaint_box.pt` | CelebA | inpainting, agujero centrado de 40x40 | 128 | 34,5 M |
| `celeba_denoise.pt` | CelebA | denoising, sigma 0,2 | 128 | 34,5 M |
| `celeba_deblur.pt` | CelebA | desenfoque gaussiano, std 1,0 | 128 | 34,5 M |
| `celeba_sr.pt` | CelebA | superresolución x2 | 128 | 34,5 M |
| `afhq_inpaint_random.pt` | AFHQ-Cat | inpainting, 70 % de píxeles descartados | 256 | 59,9 M |
| `afhq_inpaint_box.pt` | AFHQ-Cat | inpainting, agujero centrado de 80x80 | 256 | 59,9 M |
| `afhq_denoise.pt` | AFHQ-Cat | denoising, sigma 0,2 | 256 | 59,9 M |
| `afhq_deblur.pt` | AFHQ-Cat | desenfoque gaussiano, std 3,0 | 256 | 239,4 M |
| `afhq_sr.pt` | AFHQ-Cat | superresolución x4 | 256 | 59,9 M |
| `afhq_cs_mri.pt` | AFHQ-Cat | Fourier CS, cartesiana 21,88 % | 256 | 34,5 M |

## Arquitectura y entrenamiento

FIRM pertenece a la familia de los modelos generativos por flow matching, pero sustituye el campo de velocidad genérico por uno condicionado por la medida física. En concreto, la velocidad se expresa como `v = (E[x1 | x_t, y] - x_t) / (1 - t)`, donde `y` es la observación degradada. Esa media posterior se caracteriza como el minimizador de un objetivo variacional que incluye un término explícito de consistencia de datos, y la minimización se resuelve desplegando un esquema de desdoblamiento half-quadratic. La consecuencia práctica es que el operador forward aparece dentro de la velocidad aprendida en cada iteración, de modo que no hace falta guiado (guidance) durante el muestreo, a diferencia de aproximaciones que aproximan el gradiente de la verosimilitud en tiempo de inferencia.

El muestreo se realiza con dos pasos de Euler y cinco iteraciones internas, es decir NFE = N x K = 2 x 5 = 10, con la integración llevada hasta `t = 1` (`sample.eps: 0.0`, `sample.t_max: 1.0`, `sample.alpha_eps: 0.0`). El autor no documenta en la model card el número de tokens de imagen ni la composición exacta del conjunto de entrenamiento más allá de las dos fuentes (CelebA y AFHQ-Cat), ni detalla si se emplearon etapas de RLHF o DPO, algo que en este dominio no aplica del mismo modo que en modelos de lenguaje. Sí se indica que `afhq_deblur` usa una anchura mayor (`ch=64`) y que `afhq_cs_mri` se ajusta finamente a partir del denoiser de inpainting aleatorio de AFHQ en lugar de entrenarse desde cero. Las degradaciones de AFHQ son más duras que las de CelebA (x4 frente a x2 en superresolución, std 3,0 frente a 1,0 en desenfoque, agujero de 80x80 frente a 40x40), por lo que las dos familias no son comparables fila a fila.

## Capacidades

- Restauración imagen a imagen condicionada por un operador de medida conocido: inpainting aleatorio (70 % de píxeles), inpainting por caja centrada, denoising gaussiano (sigma 0,2), desenfoque gaussiano (std 1,0 en CelebA y 3,0 en AFHQ), superresolución (x2 en CelebA, x4 en AFHQ).
- Reconstrucción por compresión sensible sobre muestreo Fourier con máscara cartesiana al 21,88 % (`afhq_cs_mri`), planteada como banco de pruebas metodológico.
- Muestreo sin guiado: la consistencia de datos está incorporada en la velocidad aprendida, no se aplica una corrección externa en tiempo de inferencia.
- Presupuesto de muestreo muy reducido: 10 evaluaciones de función (2 pasos de Euler x 5 iteraciones).
- Ajuste fino y reentrenamiento: los checkpoints se distribuyen sin estado del optimizador, pensados para inferencia y fine-tuning.
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso en lenguaje.
- No tiene capacidades multilingües: no procesa texto.
- No dispone de modo de razonamiento (thinking mode), visión general, audio ni generación de código.
- Dominio visual restringido a caras humanas (CelebA) y caras de gato (AFHQ-Cat) en las resoluciones indicadas.

## Casos de uso

- Reproducción de los resultados del artículo: cada checkpoint incluye la época y la configuración correspondiente, y el nombre del archivo coincide con el del YAML en `configs/`, de modo que un grupo de investigación puede replicar las tablas del paper con un solo comando.
- Investigación en restauración de caras: los cinco modelos de CelebA permiten estudiar inpainting, denoising, deblurring y superresolución x2 a 128x128 en un mismo marco, útil para comparar variantes de flow matching frente a solvers basados en difusión.
- Banco de pruebas para reconstrucción acelerada de resonancia magnética: `afhq_cs_mri` reproduce un muestreo cartesiano al 21,88 % sobre un conjunto de caras de gato, lo que sirve para validar el algoritmo de consistencia de datos antes de trasladarlo a datos clínicos reales, no como modelo médico.
- Punto de partida para fine-tuning con un operador forward nuevo: como el estado del optimizador se elimina y el pipeline es configurable, un equipo puede reentrenar el modelo para una matriz de degradación distinta (por ejemplo, otro factor de submuestreo o un kernel de desenfoque real).
- Referencia en evaluaciones comparativas de problemas inversos: al publicar números de PSNR, SSIM y LPIPS con protocolo explícito (cien imágenes a 128x128 en CelebA, primeras cien de validación a 256x256 en AFHQ-Cat), sirve como línea base en publicaciones que propongan nuevos solvers.
- Demostraciones y docencia en GPU de consumo: los modelos de 34,5 M y 59,9 M parámetros caben holgadamente en una GPU de gama media o incluso en CPU, lo que facilita prácticas sobre métodos generativos para problemas inversos sin clúster.
- Generación de pares degradado/limpio controlados: al permitir fijar el operador forward y el nivel de ruido, resulta útil para construir conjuntos de validación sintéticos reproducibles en experimentos de restauración.
- Integración en prototipos de post-procesado de imagen: sustituir un paso de restauración clásico (por ejemplo, un filtro de deconvolución) por una reconstrucción generativa cuando el operador de degradación se conoce y es fijo.

## Benchmarks y rendimiento

Los valores proceden de la model card del autor, con dos pasos de Euler, pesos EMA, integración hasta `t = 1` y el ajuste de muestreo ya presente en cada configuración. CelebA: 100 imágenes a 128x128. AFHQ-Cat: las primeras 100 imágenes de validación a 256x256. Las filas de CelebA corresponden a la Tabla 1 del artículo, variante `Ours (N = 2)`.

| Modelo | PSNR | SSIM | LPIPS | Batch |
|---|---|---|---|---|
| `celeba_inpaint_random` | 35,03 | 0,9629 | 0,0188 | 32 |
| `celeba_inpaint_box` | 33,25 | 0,9603 | 0,0225 | 32 |
| `celeba_denoise` | 33,67 | 0,9320 | 0,0344 | 32 |
| `celeba_deblur` | 36,05 | 0,9572 | 0,0295 | 32 |
| `celeba_sr` | 34,40 | 0,9492 | 0,0285 | 32 |
| `afhq_inpaint_random` | 34,72 | 0,9362 | 0,0436 | 4 |
| `afhq_inpaint_box` | 29,27 | 0,9243 | 0,0601 | 2 |
| `afhq_denoise` | 33,31 | 0,9039 | 0,0810 | 1 |
| `afhq_deblur` | 29,90 | 0,8091 | 0,2294 | 4 |
| `afhq_sr` | 29,11 | 0,8169 | 0,1675 | 2 |
| `afhq_cs_mri` | 32,07 | 0,8929 | 0,0743 | 5 |

Advertencia de reproducibilidad documentada por el autor: el tamaño de batch forma parte del protocolo, porque la máscara y el ruido de observación se generan por lote; reagrupar las mismas imágenes en lotes distintos desplaza el PSNR en centésimas de dB. No se publican en la información disponible resultados de benchmarks de terceros ni comparaciones numéricas con otros solvers.

## Requisitos de hardware

- Huella de pesos en fp32 (cálculo aritmético a partir del número de parámetros, no dato publicado por el autor): aproximadamente 138 MB para los modelos de 34,5 M, 240 MB para los de 59,9 M y 958 MB para `afhq_deblur` (239,4 M). A ello hay que sumar activaciones, que dependen del batch y de la resolución.
- GPU recomendadas: no disponible (el autor no especifica requisitos). Por tamaño, cualquier GPU con 4 GB o más de VRAM es suficiente para inferencia en batch pequeno; modelos de 34,5 M y 59,9 M son viables en CPU, y `afhq_deblur` también es manejable en CPU aunque más lento.
- Cabe en GPU de consumo: sí, en tarjetas tipo RTX 3060, RTX 4060, RTX 4090 o equivalentes, y en iGPU con memoria compartida para los checkpoints pequenos.
- Opciones de despliegue: no hay soporte de vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje). El despliegue previsto es PyTorch con el repositorio `wustl-cig/FIRM_code`, mediante `main.py --config configs/<nombre>.yaml`, con `distributed.gpus=[0]` y `distributed.use_ddp=false` para una única GPU.
- Descarga de pesos: `hf_hub_download` desde `ShirinShouhstari/FIRM-weights`.
- Latencia y throughput: no disponible. El único dato relacionado con el coste computacional es el presupuesto de muestreo, NFE = 10, que sitúa la inferencia en un régimen muy por debajo del de los solvers de difusión típicos.
- Tamaño del repositorio: 2,7 GB en total para los once checkpoints.

## Comparativa con modelos similares

No se dispone de datos numéricos de terceros en la información proporcionada. La model card sólo ofrece cifras para las once variantes de FIRM, y las búsquedas web realizadas devolvieron resultados sobre modelos de lenguaje sin relación con este repositorio. Por tanto, la comparación externa con otros solvers de flow matching o de difusión para problemas inversos queda como "no disponible".

Comparación interna entre variantes destacadas (mismos datos y protocolo dentro del mismo conjunto):

| Modelo | Parámetros | Resolución | PSNR | SSIM | LPIPS | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| `celeba_inpaint_random` | 34,5 M | 128x128 | 35,03 | 0,9629 | 0,0188 | MIT (contenido del repo) | HuggingFace |
| `celeba_sr` | 34,5 M | 128x128 | 34,40 | 0,9492 | 0,0285 | MIT (contenido del repo) | HuggingFace |
| `afhq_inpaint_random` | 59,9 M | 256x256 | 34,72 | 0,9362 | 0,0436 | MIT (contenido del repo) | HuggingFace |
| `afhq_deblur` | 239,4 M | 256x256 | 29,90 | 0,8091 | 0,2294 | MIT (contenido del repo) | HuggingFace |
| Solver externo de problemas inversos | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

Los valores de CelebA y AFHQ-Cat no son directamente comparables entre sí, porque las degradaciones de AFHQ son más severas y el protocolo de evaluación usa conjuntos distintos.

## Limitaciones y advertencias

- Especialización estricta: cada modelo se entrena para un único operador forward y un único nivel de ruido, y no se espera que transfiera a otra degradación sin reentrenamiento. No existe un checkpoint único que sirva para todo.
- Dominio muy restringido: sólo caras humanas (CelebA) y caras de gato (AFHQ-Cat), a 128x128 o 256x256. No es un modelo de restauración de propósito general.
- Sesgo demográfico heredado: los modelos de caras arrastran el sesgo de CelebA y no deben usarse para nada relacionado con la identidad de personas.
- Riesgo de alucinación visual: al ser un modelo generativo condicionado, puede reconstruir detalles plausibles pero incorrectos, especialmente en regiones con alta degradación (agujeros grandes, superresolución x4, desenfoque con std 3,0). No proporciona estimaciones de incertidumbre ni puntuaciones de confianza.
- Restricciones de licencia: la licencia MIT cubre el contenido del repositorio, pero CelebA y AFHQ-Cat se distribuyen para investigación no comercial y los pesos heredan esa intención. El uso comercial de los pesos derivados exige revisar la licencia de los datos de entrenamiento.
- El checkpoint `afhq_cs_mri` no es un modelo médico: está entrenado y evaluado sobre caras de gato con máscaras cartesianas sintéticas. No debe emplearse para diagnóstico ni en flujos clínicos.
- Resoluciones fijas y sin escalado: no se documenta soporte para entradas de resolución arbitraria ni para lotes heterogéneos de tamaños distintos.
- Reproducibilidad sensible al lote: como la máscara y el ruido se generan por lote, los valores de PSNR varían en centésimas de dB al reagrupar las mismas imágenes, lo que complica comparaciones cruzadas si no se fija el batch exacto.
- Ausencia de validación externa: el repositorio registra 0 descargas y 0 valoraciones en el momento de la consulta, no hay resultados de terceros y las búsquedas web no aportan evaluaciones independientes.
- Estado del optimizador eliminado: los checkpoints no permiten reanudar un entrenamiento tal cual; sólo sirven para inferencia o para un ajuste fino desde los pesos EMA.
- Sin información sobre cuantización ni despliegue optimizado: no hay variantes de 8 bits o 4 bits, ni rutas de exportación a formatos de inferencia ligeros documentadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ShirinShouhstari/FIRM-weights
- Repositorio de código: https://github.com/wustl-cig/FIRM_code
- Artículo (PDF): https://arxiv.org/pdf/2609.12953
- Identificador arXiv: 2609.12953 (etiqueta `arxiv:2609.12953` en el repositorio)
- Cita del autor: Shoushtari, S.; Chandler, E. P.; Shi, X.; Kamilov, U. S. "FIRM: Flow-based Imaging via Regularized Minimization", arXiv preprint, 2026.
