# guanwencan/Sparse_reconstruction_FE_damage_fields

## Resumen

`guanwencan/Sparse_reconstruction_FE_damage_fields` no es un modelo de lenguaje, sino un repositorio de código que acompaña a un artículo científico sobre reconstrucción de campos de daño en elementos finitos (FE) a partir de observaciones dispersas. Lo firma W. Guan y se asocia al artículo *Why do sparse surrogate reconstructions underestimate peak damage in localised finite element fields?*, en revisión para el *International Journal of Damage Mechanics*. El repositorio implementa un subconjunto de los métodos comparados en dicho trabajo: interpolación lineal, procesos gaussianos estacionarios y no estacionarios, perceptrones multicapa, MLP con características de Fourier y *deep image prior*.

El problema que aborda es la subestimación del daño máximo cuando se reconstruye un campo FE localizado (por ejemplo, alrededor de un túnel) a partir de un conjunto reducido de observaciones. El repositorio permite reproducir el protocolo experimental del artículo: muestreo de 3200 elementos con probabilidad proporcional a `0.15 + (R/r)³`, reconstrucción del campo completo y cálculo de métricas específicas (recuperación del pico, R², nitidez del gradiente, error relativo ponderado y error de orientación del frente).

Es relevante para investigadores en mecánica computacional, geotecnia y *surrogate modelling* que necesiten evaluar métodos de reconstrucción de campos con datos escasos, así como para quienes quieran reproducir o extender los resultados del artículo. No dispone de pesos entrenados publicados, ni de pipeline, ni de idiomas, ni de licencia declarada en la ficha de Hugging Face (aunque el README indica MIT).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (repositorio de código con múltiples métodos: interpolación, GP estacionario/no estacionario, MLP, Fourier-feature MLP, deep image prior) |
| Parametros totales | No disponible (depende del método y configuración; no se publican recuentos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT (según README; la ficha de Hugging Face no la declara) |
| Formato de pesos | No aplica (código Python; datos en `.npz`, predicciones en `.npy`, métricas en `.json`) |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo único, sino que compara varios reconstructores sobre campos FE de referencia. Los métodos incluidos son: interpolación lineal (`interp`); procesos gaussianos estacionarios con kernels RBF, Matérn 1.5 y Matérn 2.5 (`gp_rbf`, `gp_matern15`, `gp_matern25`); GP no estacionario homocedástico (`nsgp_homo`) y heterocedástico (`nsgp_hetero`), con escala de longitud que crece con la distancia a la pared del túnel; perceptrón multicapa (`mlp`); MLP con características de Fourier aleatorias (`ffmlp`), con escala elegida en un *split* de validación; y *deep image prior* (`dip`). El artículo original incluye además bosque aleatorio, *compressed sensing*, Gappy POD, operador neuronal de Fourier, GP con media mecánica y una red con física de Mohr-Coulomb, que no se incluyen en este repositorio.

El protocolo de evaluación fija 3200 elementos muestreados sin reemplazo con probabilidad proporcional a `0.15 + (R/r)³`, donde `r` es la distancia al centro del túnel y `R = 3.45 m` el radio exterior del revestimiento. Las coordenadas se normalizan por el mayor `|x|` de los centroides y los valores del campo por el máximo sobre los tres instantes (11.20, 13.38 y 14.70 s); las predicciones se recortan a cero tras desescalar. Para `mlp`, `ffmlp` y `dip` se ejecutan tres inicializaciones aleatorias por semilla de muestreo (`--starts`), con semillas `100·seed + start` para MLP y FFMLP, y `0, 1, 2` para `dip` con semilla 0 y `1000·seed + start` en el resto. Los campos evaluables son `dkappa`, `dWp` y `D`.

## Capacidades

- Reconstrucción de campos FE completos a partir de observaciones dispersas mediante ocho métodos distintos.
- Evaluación con cinco métricas: `P` (recuperación del pico), `R2` (coeficiente de determinación), `GSR` (nitidez del gradiente en un anillo de 2.2 m alrededor del revestimiento), `RE` (error relativo firmado ponderado por el valor de referencia) y `dtheta` (error de orientación del frente en grados).
- Cálculo de `GSR` y `dtheta` sobre una rejilla de 200 × 200 en ±6 m con suavizado gaussiano de 1.6 celdas antes de derivar.
- Reproducibilidad verificada: con semilla 0 en `plain_medium`, la interpolación lineal y ambos GP no estacionarios reproducen las predicciones del artículo hasta redondeo float32.
- Ejecución por línea de comandos con selección de caso, campo, método y semillas.
- Soporte de GPU vía PyTorch con CUDA 12.8 (versiones de referencia: Python 3.12, NumPy 2.5, SciPy 1.18, scikit-learn 1.9, PyTorch 2.11).
- No incluye *tool calling*, agentes, capacidades multilingües ni modos de razonamiento; no es un modelo generativo de texto.

## Casos de uso

- Reproducción de resultados del artículo: ejecutar `python run.py --case data/fields/plain_medium.npz --field dkappa --method gp_matern15 --seeds 0,1,2,3,4` para verificar las predicciones publicadas con semilla 0.
- Comparación de métodos de reconstrucción: evaluar interpolación, GP y redes neuronales sobre los mismos conjuntos de observación para cuantificar la subestimación del pico de daño mediante la métrica `P`.
- Estudio de sensibilidad al muestreo: variar la semilla de muestreo y analizar cómo cambian `R2`, `GSR` y `dtheta` en los nueve casos de campo disponibles (`plain_medium`, `viscoplastic_medium` y otros siete).
- Validación de *surrogates* en geotecnia: usar los campos FE de referencia como *ground truth* para medir el error de modelos sustitutos antes de desplegarlos en estudios paramétricos de excavación de túneles.
- Investigación en procesos gaussianos no estacionarios: comparar `nsgp_homo` y `nsgp_hetero` frente a GP estacionarios para evaluar el efecto de una escala de longitud dependiente de la distancia a la pared.
- Análisis de sesgo espectral en redes: comparar `mlp`, `ffmlp` y `dip` para estudiar cómo el sesgo espectral y la estructura convolucional afectan a la recuperación de gradientes locales.
- Docencia y formación: utilizar el repositorio como ejemplo práctico de protocolo de evaluación con métricas específicas de campos localizados en mecánica computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README describe las métricas (`P`, `R2`, `GSR`, `RE`, `dtheta`) y el protocolo, pero no incluye tablas numéricas de resultados; estos se encuentran en el artículo en revisión.

## Requisitos de hardware

- VRAM estimada: no disponible. Depende del método; los GP escalan con el número de observaciones (3200 elementos) y las redes con el tamaño de la rejilla y el número de parámetros, no publicados.
- GPU recomendadas: no disponible. El README menciona CUDA 12.8 y PyTorch 2.11, pero no especifica modelos de GPU.
- Cabe en GPU de consumo: probablemente sí para los métodos de interpolación y GP; para `mlp`, `ffmlp` y `dip` no se dispone de datos de memoria. No confirmado.
- Opciones de despliegue: ejecución local vía `python run.py` con PyTorch; no se contemplan servidores de inferencia (vLLM, TGI, Ollama, llama.cpp).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada repositorios comparables de reconstrucción de campos FE con el mismo protocolo y métricas. Las alternativas metodológicas (bosque aleatorio, *compressed sensing*, Gappy POD, operador neuronal de Fourier, GP con media mecánica y red con física de Mohr-Coulomb) se mencionan en el artículo pero no se incluyen en este repositorio, por lo que no se puede establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- El repositorio cubre solo un subconjunto de los métodos del artículo; faltan bosque aleatorio, *compressed sensing*, Gappy POD, operador neuronal de Fourier, GP con media mecánica y la red con física de Mohr-Coulomb.
- Los resultados de los métodos estocásticos (`mlp`, `ffmlp`, `dip`) dependen de la versión de PyTorch y del dispositivo, por lo que no son estrictamente reproducibles bit a bit.
- No se publican pesos entrenados ni modelos preentrenados; es código que debe ejecutarse sobre los campos de referencia descargados aparte.
- La ficha de Hugging Face no declara licencia; el README indica MIT, pero conviene verificar antes de uso comercial.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas porque no es un modelo de lenguaje.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.
- Los campos de referencia deben descargarse del dataset de Hugging Face y colocarse manualmente en `data/fields/`; no se incluyen en el repositorio.
- El artículo está en revisión, por lo que los resultados y conclusiones pueden cambiar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/guanwencan/Sparse_reconstruction_FE_damage_fields
- Artículo de referencia: W. Guan, *Why do sparse surrogate reconstructions underestimate peak damage in localised finite element fields?*, International Journal of Damage Mechanics (en revisión). No se dispone de DOI ni enlace directo en la información proporcionada.
- Dataset de campos FE: referenciado en el README como "Hugging Face dataset", sin URL explícita en la información disponible.
