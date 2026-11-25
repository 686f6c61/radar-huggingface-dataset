# Diffusion-Research-Lab/hrrr-precipitation-maxima-20x20-diffusion

## Resumen

`hrrr-precipitation-maxima-20x20-diffusion` es un repositorio de modelos de difusión de referencia entrenados por Diffusion-Research-Lab para generar mapas sintéticos de precipitación acumulada de HRRR (High-Resolution Rapid Refresh) en una rejilla reducida de 20x20 píxeles. No es un modelo de lenguaje: es un conjunto de tres modelos de difusión incondicional (DDPM-V, DLPM-Eps y t-EDM) que comparten una arquitectura U-Net convolucional de 901.121 parámetros entrenables y que se publican como referencia reproducible para experimentos de generación meteorológica a pequeña escala.

El modelo resuelve un problema muy acotado: modelar la distribución de máximos espaciales de precipitación acumulada sobre una rejilla de 20x20, descartando previamente los mapas secos (precipitación cero) y agregando píxeles fuente disjuntos mediante máximos espaciales. El dataset procesado consta de 25.000 muestras de entrenamiento, 1.000 de validación y 34.390 de test, todas con forma `[1, 20, 20]` y normalizadas por coordenada con media y desviación estándar del conjunto de entrenamiento.

Su relevancia es metodológica más que práctica: sirve como línea base mínima y verificable para comparar formulaciones de difusión (predicción de velocidad, ruido o datos denoizados) sobre datos geoespaciales de precipitación. La licencia MIT y la inclusión de `provenance.json` y `export_check.json` facilitan la reproducibilidad, aunque el repositorio tiene 0 descargas y 0 likes en el momento de la consulta y un tamaño de 0,0 GB declarado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net convolucional para difusión (sin atención), `sample_size` 20, `in_channels` 1, `out_channels` 1, `width` 32, `channel_mult` [1, 2], `layers_per_block` 2, `norm_num_groups` 8 |
| Parametros totales | 901.121 parámetros entrenables (idéntico en las tres variantes) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada/salida de forma `[1, 20, 20]` |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, y `normalization.safetensors` cuando aplica) |

## Arquitectura y entrenamiento

Los tres modelos comparten una U-Net convolucional de difusión con `width` 32, dos niveles de resolución (`channel_mult` [1, 2]), dos capas por bloque, 8 grupos de normalización y atención desactivada (`attention: false`, `add_attention: false`). La entrada y la salida son un único canal de 20x20 píxeles. Cada variante se entrena de forma independiente con el mismo presupuesto: batch de 128, learning rate 0,0005 con AdamW (weight decay 1e-06), recorte de gradiente de norma 10,0, scheduler coseno con 100 pasos de calentamiento y `cosine_eta_min_ratio` 0,05, paciencia de parada temprana de 30 épocas y hasta 200 épocas.

Las tres formulaciones difieren en el objetivo de predicción y en el muestreador. DDPM-V predice velocidad con 128 pasos de muestreo (`sigma_max` 2,0, sampler `ddpm`); DLPM-Eps predice ruido con 128 pasos (`alpha` 1,8, sampler `native`); t-EDM predice datos denoizados con 64 pasos (`nu` 2,2, `sigma_min` 0,005, `sigma_max` 5,0, `sigma_data` 1,0, solver `edm_stochastic_heun`). DDIM-V reutiliza los pesos de DDPM-V cambiando únicamente el muestreador a DDIM determinista (`eta=0`), sin entrenamiento propio. Las pérdidas reportadas son: DDPM-V con validación 0,3106 y test 0,259; DLPM-Eps con 0,1366 y 0,1373; t-EDM con 0,05421 y 0,04029. El autor advierte explícitamente que cada pérdida usa su propio objetivo y no son comparables como medida de calidad de muestra.

## Capacidades

- Generación incondicional de mapas sintéticos de precipitación acumulada en rejilla de 20x20 píxeles.
- Modelado de la distribución de máximos espaciales de precipitación sobre mapas no secos.
- Tres objetivos de difusión alternativos (velocidad, ruido y datos denoizados) para comparación metodológica.
- Muestreo estocástico (DDPM, DLPM nativo, EDM stochastic Heun) y determinista (DDIM con `eta=0`).
- Normalización por coordenada integrada, con media y desviación estándar recuperables al cargar el modelo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.

## Casos de uso

- Línea base de investigación en difusión: sirve para comparar formulaciones de predicción (velocidad frente a ruido frente a datos denoizados) sobre un mismo dataset y arquitectura, con pérdidas y configuraciones registradas en `config.json`.
- Prototipado de downscaling meteorológico: la rejilla de 20x20 permite experimentar con agregación por máximos espaciales antes de escalar a resoluciones mayores.
- Generación de datos sintéticos de precipitación para pruebas de pipelines: se pueden producir lotes de 16 muestras con `model.sample(16)` y desnormalizarlas para alimentar sistemas de validación.
- Docencia y reproducción: el reducido tamaño (901.121 parámetros) y la licencia MIT permiten ejecutar el entrenamiento y el muestreo en CPU o en una GPU de consumo.
- Verificación de exportaciones: los archivos `export_check.json` y `provenance.json` permiten auditar que los pesos publicados coinciden con su fuente y que una pasada forward determinista es reproducible.
- Estudio de sensibilidad al muestreador: DDIM-V, al compartir pesos con DDPM-V, permite aislar el efecto del muestreador determinista frente al estocástico sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta pérdidas de validación y test bajo el objetivo propio de cada modelo, que no son comparables entre sí ni constituyen una medida de calidad de muestra:

| Modelo | Objetivo | Pasos de muestreo | Épocas ejecutadas / mejor | Pérdida validación | Pérdida test |
|---|---|---:|---:|---:|---:|
| DDPM-V | velocidad | 128 | 200 / 178 | 0,3106 | 0,259 |
| DLPM-Eps | ruido | 128 | 180 / 150 | 0,1366 | 0,1373 |
| t-EDM | datos denoizados | 64 | 200 / 193 | 0,05421 | 0,04029 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 901.121 parámetros en precisión de 32 bits los pesos ocupan aproximadamente 3,6 MB, por lo que la inferencia cabe holgadamente en cualquier GPU de consumo y en CPU.
- GPU recomendadas: no se especifican; el entrenamiento se realizó con `device: cuda` y `data_device: cpu`, sin indicar el modelo de GPU.
- Cabe en GPU de consumo: sí, por el reducido número de parámetros; también se documenta carga en CPU (`device="cpu"` en el ejemplo de la model card).
- Opciones de despliegue: paquete de entrenamiento `gendynamics` instalable desde el repositorio de GitHub del autor; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (difusión incondicional sobre rejillas de precipitación de 20x20) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo no lingüístico: no genera texto, código ni mantiene conversaciones; cualquier uso en esos dominios es inadecuado.
- Dominio muy restringido: solo modela máximos de precipitación acumulada de HRRR en una rejilla de 20x20, condicionado a mapas no secos; no representa mapas secos ni otras variables meteorológicas.
- Los datos fuente no se redistribuyen y sus términos quedan con el proveedor; el uso de las muestras generadas puede heredar restricciones de la fuente original.
- Las pérdidas reportadas usan objetivos distintos y no son comparables como puntuación de calidad; el autor advierte que las previsualizaciones de muestras no establecen precisión en las colas de la distribución.
- Riesgo de que las fuentes respaldadas por API cambien; solo el checksum SHA-256 del archivo procesado (`34eb7fccb5d9620598daf40165a6b7d9379639078150205ab3f1722b9730b4c4`) identifica el snapshot exacto.
- Sesgos conocidos: no documentados; al entrenarse solo con mapas no secos, la distribución generada excluye por construcción la precipitación nula.
- Licencia MIT: permite uso comercial, pero se recomienda citar la revisión del repositorio al reutilizar los pesos.
- Repositorio sin descargas ni likes y con tamaño declarado de 0,0 GB en el momento de la consulta; conviene verificar la integridad de los archivos antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Diffusion-Research-Lab/hrrr-precipitation-maxima-20x20-diffusion
- Repositorio de entrenamiento: https://github.com/Diffusion-Research-Lab/2_training_2026_tail_reference_models
- Código de preparación del dataset: `datasets/4_hrrr_maps_dataset.py` en el repositorio de entrenamiento
- Paper, blog o demo: no disponible
