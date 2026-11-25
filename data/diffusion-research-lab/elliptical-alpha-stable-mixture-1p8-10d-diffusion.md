# Diffusion-Research-Lab/elliptical-alpha-stable-mixture-1p8-10d-diffusion

## Resumen

El modelo `elliptical-alpha-stable-mixture-1p8-10d-diffusion` es un conjunto de modelos de difusión de referencia entrenados por Diffusion-Research-Lab con la librería `gendynamics`. No es un modelo de lenguaje ni un modelo generativo de imágenes: es un banco de modelos de difusión para generar muestras sintéticas de 10 dimensiones a partir de una mezcla de componentes elípticas simétricas alpha-estables de rango completo con alpha = 1,8. Su propósito es servir como referencia reproducible para estudiar el comportamiento de distintas formulaciones de difusión (DDPM, DLPM, t-EDM) sobre distribuciones con colas pesadas.

El repositorio contiene tres entrenamientos independientes con la misma arquitectura MLP (240 de ancho, 4 capas, `time_dim` de 128, 626.554 parámetros entrenables) que se diferencian en el objetivo de predicción: velocidad (DDPM-V), ruido (DLPM-Eps) y datos denoizados (t-EDM). Además incluye una variante de muestreo DDIM que reutiliza los pesos de DDPM-V. El tamaño del repositorio es de 0,0 GB según Hugging Face, lo que sugiere pesos muy ligeros acordes con el número de parámetros.

Es relevante ahora porque aborda un régimen poco cubierto en la literatura práctica: la generación incondicional en dimensión baja con colas alpha-estables, donde las métricas de pérdida de cada objetivo no son directamente comparables. La model card advierte explícitamente de que las previsualizaciones de muestras no garantizan precisión en las colas, un caveat importante para quien lo use como referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP para difusión (width 240, depth 4, time_dim 128, use_norm true, dropout 0.0, dim 10) |
| Parametros totales | 626.554 (por cada modelo entrenado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de dimensión 10) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La red es un perceptrón multicapa condicionado por tiempo, con anchura 240, profundidad 4 y una dimensión de embedding temporal de 128. La dimensión de datos es 10 y no se aplica normalización. Se entrenan tres cabezas/objetivos distintos sobre los mismos datos: DDPM-V predice velocidad con 128 pasos y sampler DDPM; DLPM-Eps predice ruido con 128 pasos, alpha = 1,8 y sampler nativo; t-EDM predice datos denoizados con 64 pasos, nu = 2,2, sigma_min 0,005, sigma_max 5,0, sigma_data 1,0 y solver EDM stochastic Heun. La variante DDIM-V comparte pesos con DDPM-V y solo cambia el sampler a DDIM determinista (eta = 0), sin entrenamiento propio.

Los datos son una mezcla sintética de componentes elípticas simétricas alpha-estables de rango completo, generada con `gendynamics.datasets.fetch_synthetic_data('elliptical_alpha_stable_mixture')`, con rotaciones sembradas, escalas de eje logarítmicamente espaciadas y traza de dispersión fija. Los splits son 25.000/1.000/10.000 muestras de forma `[10]`, sin normalización. El entrenamiento usa AdamW, weight decay 1e-6, grad clip 10,0, batch 1024, scheduler coseno con 400 pasos de warmup y early stopping con paciencia 100. DDPM-V y DLPM-Eps usan lr 5e-4 y hasta 640 épocas; t-EDM usa lr 1e-4. Las épocas efectivas y mejor época figuran en la model card: DDPM-V 530/430 (val 5,993, test 3,111), DLPM-Eps 266/166 (val 0,804, test 0,8492) y t-EDM 142/42 (val 1,287, test 2,758). Las pérdidas usan objetivos distintos y no son comparables como medida de calidad de muestra.

## Capacidades

- Generación incondicional de muestras sintéticas de 10 dimensiones a partir de una mezcla de componentes elípticas alpha-estables.
- Tres formulaciones de difusión entrenadas de forma independiente (DDPM-V, DLPM-Eps, t-EDM) más una variante de muestreo determinista (DDIM-V).
- Muestreo con distintos números de pasos según el modelo (128 para DDPM-V y DLPM-Eps, 64 para t-EDM).
- Carga programática mediante `load_huggingface_model` de la librería `gendynamics`, con devolución opcional de normalización y escala de datos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.
- No se documentan capacidades de condicionamiento (texto, clase, etiqueta); la generación es incondicional.

## Casos de uso

- Validación de implementaciones de difusión: sirve como referencia reproducible para comprobar que una implementación de DDPM, DLPM o EDM produce muestras y pérdidas coherentes con las publicadas.
- Estudio de colas pesadas en modelos generativos: permite analizar cómo se comporta cada objetivo de predicción sobre una distribución alpha-estable con alpha = 1,8, un régimen donde las colas dominan el comportamiento.
- Comparación de objetivos de entrenamiento: al compartir arquitectura y datos, los tres modelos permiten aislar el efecto del objetivo (velocidad, ruido, datos denoizados) en la calidad de muestra.
- Docencia e investigación metodológica: el tamaño reducido (626.554 parámetros) y la entrada de 10 dimensiones hacen viable ejecutar experimentos completos en CPU o en una GPU de consumo.
- Pruebas de samplers: la variante DDIM-V frente a DDPM-V permite comparar muestreo estocástico y determinista con los mismos pesos.
- Reproducibilidad de pipelines: los ficheros `provenance.json`, `metrics.json` y `export_check.json` permiten auditar versiones de software, revisión de origen y verificación de exportación en entornos de investigación.
- Generación de datos sintéticos de prueba para pipelines que necesiten distribuciones multidimensionales con colas pesadas y propiedades estadísticas conocidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card solo reporta pérdidas de validación y test bajo el objetivo propio de cada modelo, que no son comparables entre sí como medida de calidad de muestra:

| Directorio | Objetivo | Pasos de muestreo | Épocas ejecutadas / mejor | Pérdida val | Pérdida test |
|---|---|---:|---:|---:|---:|
| ddpm-v | velocidad | 128 | 530 / 430 | 5,993 | 3,111 |
| dlpm-eps | ruido | 128 | 266 / 166 | 0,804 | 0,8492 |
| tedm-origin | datos denoizados | 64 | 142 / 42 | 1,287 | 2,758 |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 626.554 parámetros por modelo, los pesos en safetensors ocupan del orden de unos pocos megabytes en fp32 y menos aún en fp16. No se dispone de cifras oficiales de VRAM pico.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; el entrenamiento se realizó en `cuda` con `data_device` en `cpu`. No se requiere A100, H100 ni RTX 4090.
- Cabe en GPU de consumo y también en CPU: la model card muestra un ejemplo de carga con `device="cpu"` y muestreo de 16 muestras.
- Opciones de despliegue: la vía documentada es la librería `gendynamics` instalada desde el repositorio de entrenamiento (`2_training_2026_tail_reference_models`) y la función `load_huggingface_model`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (difusión incondicional de baja dimensión sobre mezclas alpha-estables) con los que establecer una comparación de parámetros, contexto, rendimiento, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, código ni respuestas; cualquier uso en ese sentido es inadecuado.
- Generación estrictamente incondicional y limitada a vectores de 10 dimensiones; no admite condicionamiento por prompt, clase ni etiqueta.
- Las pérdidas reportadas usan el objetivo propio de cada modelo y no son comparables entre sí ni constituyen una medida de calidad de muestra.
- La model card advierte de que las previsualizaciones de muestras no establecen precisión en las colas, que es precisamente el régimen de interés de la distribución alpha-estable.
- Los datos de origen no se redistribuyen en el repositorio; los términos de la fuente permanecen con su proveedor y las fuentes respaldadas por API pueden cambiar.
- El repositorio figura con 0 descargas y 0 likes y fue creado en noviembre de 2026; no hay evidencia de adopción ni validación externa.
- Licencia MIT, que permite uso comercial, pero sin garantías; conviene citar la revisión del repositorio al usar los pesos, tal como pide el autor.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el modelo no procesa lenguaje; esos apartados no aplican.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Diffusion-Research-Lab/elliptical-alpha-stable-mixture-1p8-10d-diffusion
- Repositorio de la librería `gendynamics`: https://github.com/Diffusion-Research-Lab/gendynamics
- Repositorio de entrenamiento: https://github.com/Diffusion-Research-Lab/2_training_2026_tail_reference_models
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos (Wikipedia, Larousse, Le Robert, Futura-Sciences) tratan sobre el concepto físico de difusión y no aportan información técnica sobre este modelo.
