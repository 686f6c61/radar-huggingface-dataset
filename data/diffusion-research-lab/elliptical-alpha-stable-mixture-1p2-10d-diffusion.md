# Diffusion-Research-Lab/elliptical-alpha-stable-mixture-1p2-10d-diffusion

## Resumen

El modelo `elliptical-alpha-stable-mixture-1p2-10d-diffusion` es un conjunto de modelos de difusión de referencia para generación incondicional de datos sintéticos en 10 dimensiones, desarrollado por Diffusion-Research-Lab. No es un modelo de lenguaje: es un banco de modelos generativos entrenados sobre una mezcla sintética de componentes elípticas simétricas de tipo alpha-estable (alpha = 1,8), pensado como referencia reproducible para evaluar metodologías de difusión en distribuciones con colas pesadas.

El repositorio agrupa tres entrenamientos independientes con la misma arquitectura de red (un MLP de 4 capas y anchura 240 con condicionamiento temporal de 128 dimensiones, 626.554 parámetros entrenables): DDPM-V (objetivo velocidad), DLPM-Eps (objetivo ruido, sampler nativo con alpha = 1,8) y t-EDM (objetivo datos denoised, solver EDM stochastic Heun con nu = 2,2). Además incluye DDIM-V, que reutiliza los pesos de DDPM-V con un sampler determinista. Cada modelo se seleccionó en su mejor época de validación y se verificó tras la exportación.

Su relevancia es acotada y muy específica: sirve como punto de comparación controlado para investigar la calidad de muestreo en colas pesadas, no como herramienta de producción general. El tamaño del repo es de 0,0 GB, la licencia es MIT y la librería de carga es `gendynamics`. No hay información sobre benchmarks, idiomas ni pipeline estándar de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP de difusión (width 240, depth 4, time_dim 128, use_norm, dropout 0.0), dimensión de datos 10 |
| Parametros totales | 626.554 por modelo (DDPM-V, DLPM-Eps, t-EDM; DDIM-V comparte pesos con DDPM-V) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de 10 dimensiones por muestra) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numérico, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La red es un MLP con normalización y condicionamiento temporal (time_dim = 128), anchura 240 y 4 capas, que opera sobre vectores de 10 dimensiones. Se entrenaron tres variantes con objetivos distintos: DDPM-V predice velocidad con sampler DDPM de 128 pasos y sigma_max = 2,0; DLPM-Eps predice ruido con sampler nativo de 128 pasos y alpha = 1,8; t-EDM predice datos denoised con 64 pasos, sigma_min = 0,005, sigma_max = 5,0, sigma_data = 1,0 y solver EDM stochastic Heun con nu = 2,2. DDIM-V no tiene entrenamiento propio: reutiliza los pesos de DDPM-V y cambia el sampler inverso a DDIM determinista (eta = 0).

Los datos son una mezcla sintética de componentes elípticas simétricas alpha-estables de rango completo, generada con `gendynamics.datasets.fetch_synthetic_data('elliptical_alpha_stable_mixture')`, con rotaciones de componentes sembradas, escalas de eje espaciadas logarítmicamente y traza de dispersión fija. Los splits contienen 25.000/1.000/10.000 muestras de forma [10] para entrenamiento/validación/test, sin normalización. El entrenamiento usó AdamW, batch de 1024, weight decay 1e-6, grad clip 10,0, scheduler coseno con warmup de 400 pasos y early stopping con paciencia 100. DDPM-V y DLPM-Eps usaron lr 5e-4 y corrieron 411/311 y 311/211 épocas (ejecutadas/mejor); t-EDM usó lr 2e-4 y corrió 121/21 épocas. Las pérdidas de validación/test reportadas son 2000/46,59 (DDPM-V), 0,8858/0,9703 (DLPM-Eps) y 8,496/63,48 (t-EDM), pero cada una corresponde a su propio objetivo y no son comparables como métricas de calidad de muestra.

## Capacidades

- Generación incondicional de muestras sintéticas de 10 dimensiones a partir de ruido.
- Modelado de distribuciones con colas pesadas mediante componentes alpha-estables (alpha = 1,8).
- Cuatro modos de muestreo: DDPM (128 pasos), DLPM nativo (128 pasos), EDM stochastic Heun (64 pasos) y DDIM determinista (eta = 0, sin entrenamiento adicional).
- Carga programática mediante `load_huggingface_model` de la librería `gendynamics`, con normalización opcional devuelta junto al modelo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, visión ni audio.
- No tiene capacidades multilingües: no procesa lenguaje.

## Casos de uso

- Evaluación de métodos de difusión en colas pesadas: usar los tres objetivos (velocidad, ruido, denoised) sobre la misma distribución sintética para comparar estabilidad y fidelidad de muestreo en las colas, que es precisamente el escenario para el que se publicaron.
- Reproducción de experimentos: el repo incluye `dataset.json`, `provenance.json`, `metrics.json` y `export_check.json`, lo que permite replicar exactamente el split, la semilla y las versiones de software.
- Baseline en investigación de samplers: comparar DDPM de 128 pasos frente a DDIM determinista con los mismos pesos aísla el efecto del sampler sin confundirlo con el del entrenamiento.
- Validación de infraestructura de entrenamiento: con 626.554 parámetros y lotes de 1024 sobre CPU/GPU, sirve como prueba rápida de pipelines de entrenamiento y exportación a safetensors.
- Docencia y divulgación: ejemplo mínimo y ejecutable de difusión en dimensión baja para explicar objetivos de predicción y schedulers en un curso de IA generativa.
- Test de integración de la librería `gendynamics`: verificar la carga desde Hugging Face, la aplicación de normalización y la generación de muestras en un entorno de CI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdidas de validación y test bajo el objetivo propio de cada variante (DDPM-V: 2000 / 46,59; DLPM-Eps: 0,8858 / 0,9703; t-EDM: 8,496 / 63,48), que el propio autor advierte que no son comparables entre sí ni constituyen una medida de calidad de muestra.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 626.554 parámetros en safetensors y opera sobre vectores de 10 dimensiones.
- GPU recomendadas: cualquier GPU con CUDA, incluidas GTX 1060, RTX 3050 o superiores; también es viable en CPU (el ejemplo de carga de la model card usa `device="cpu"`).
- Cabe holgadamente en cualquier GPU de consumo actual y en entornos sin GPU.
- Opciones de despliegue: la librería `gendynamics` (instalable desde el repositorio de entrenamiento del autor) mediante `load_huggingface_model`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El coste dominante es el número de pasos de muestreo (128 en DDPM y DLPM, 64 en t-EDM) sobre un MLP pequeño, por lo que la generación de lotes es rápida en GPU, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensión de datos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| elliptical-alpha-stable-mixture-1p2-10d-diffusion (DDPM-V / DLPM-Eps / t-EDM) | 626.554 | 10 | no aplica | MIT | safetensors | Hugging Face |
| DDIM-V (misma familia) | 626.554 (compartidos con DDPM-V) | 10 | no aplica | MIT | safetensors | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de generación incondicional en 10 dimensiones con distribuciones alpha-estables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo de propósito general: solo genera vectores numéricos de 10 dimensiones de una distribución sintética concreta.
- Sesgos conocidos: la distribución de entrenamiento es sintética y está sesgada por diseño hacia componentes elípticas alpha-estables con rotaciones y escalas sembradas; no representa datos reales.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero las muestras pueden no reproducir con fidelidad las colas de la distribución, y la propia model card advierte que las previsualizaciones de muestras no establecen precisión en las colas.
- Limitaciones de contexto e idioma: no hay ventana de contexto ni soporte multilingüe; la dimensionalidad de entrada está fijada en 10.
- Las pérdidas reportadas usan objetivos distintos y no son comparables entre variantes; no deben usarse como ranking de calidad.
- Restricciones de licencia: MIT permite uso comercial, pero se debe citar la revisión del repositorio del modelo al reutilizar los pesos.
- Para producción: la librería de carga se instala desde un repositorio de GitHub del autor, lo que introduce una dependencia externa; conviene fijar la revisión y verificar `export_check.json` y `provenance.json`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin pipeline de Hugging Face declarado, lo que limita la validación por parte de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Diffusion-Research-Lab/elliptical-alpha-stable-mixture-1p2-10d-diffusion
- Repositorio `gendynamics`: https://github.com/Diffusion-Research-Lab/gendynamics
- Repositorio de entrenamiento: https://github.com/Diffusion-Research-Lab/2_training_2026_tail_reference_models
- Resultados de búsqueda web: sin enlaces técnicos relevantes (los resultados obtenidos corresponden a definiciones genéricas de difusión en física y diccionarios, no al modelo).
