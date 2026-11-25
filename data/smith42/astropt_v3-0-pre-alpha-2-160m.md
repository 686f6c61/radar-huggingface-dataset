# Smith42/astroPT_v3.0-pre-alpha-2-160m

## Resumen

AstroPTv3 160M (pre-alpha-2, step 19k) es un modelo de investigación multimodal para astronomía desarrollado por Smith42 en el marco del proyecto abierto UniverseTBD. Se presenta como un "large observation model": un transformer decoder-only entrenado de forma autorregresiva sobre secuencias intercaladas de imágenes, espectros y valores escalares de catálogo correspondientes a un mismo objeto astronómico. El objetivo es unificar en un único backbone generativo observaciones heterogéneas de distintos sondeos (Legacy Survey, HSC, DESI, SDSS) en lugar de entrenar modelos separados por modalidad.

El backbone tiene 157,5M de parámetros (25 capas, hidden size 768, 12 cabezas de consulta y 4 de clave/valor, intermediate size 2048). El checkpoint completo suma 395,4M de parámetros al incluir los normalising flows por modalidad (221,3M), codificadores, decodificadores y embeddings posicionales. Soporta 57 modalidades y se distribuye en bfloat16 safetensors bajo licencia CC BY-SA 4.0.

Es relevante ahora porque explora una arquitectura poco común —tokens continuos modelados con normalising flows y cabezas de mezcla gaussiana— aplicada a datos astronómicos multimodales, y porque publica checkpoints intermedios cada 1000 pasos junto con registros de entrenamiento. No obstante, es un snapshot de investigación pre-alpha: no ha sido evaluado en tareas downstream y su API puede cambiar sin aviso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autorregresivo con normalising flows por modalidad y cabezas de mezcla gaussiana para tokens continuos |
| Parametros totales | 395.444.992 (backbone: 157,5M; flows por modalidad: 221,3M; resto: codificadores, decodificadores y embeddings posicionales) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa secuencias de 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible (modelo multimodal sobre datos astronomicos, no orientado a texto) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only que procesa secuencias intercaladas de tokens de distintas modalidades: imágenes de Legacy Survey North/South y HSC, espectros de DESI EDR y SDSS DR17, recortes RGB de galaxias y valores escalares de siete catálogos (con `min_catalogs=3`). Los tokens continuos se modelan mediante normalising flows específicos por modalidad y cabezas de mezcla gaussiana, lo que permite una generación autorregresiva sobre datos no discretos sin discretización previa. El backbone tiene 25 capas, hidden size 768, 12 cabezas de consulta y 4 de clave/valor (atención con cabezas KV compartidas) e intermediate size 2048.

El entrenamiento cubrió 19.000 pasos (12,9 horas en 4×H200) con batch global de 128 × 4096 tokens, lo que supone 2,08B tokens frescos sin padding (8,26B sin padding contando el eco ×4; 9,96B brutos con padding). Se usó AdamW (β₁=0,9, β₂=0,95, weight decay 0,1), learning rate 3e-4 con warmup de 2000 pasos y decaimiento coseno hasta 3e-5, semilla 42. Los schedulers de learning rate y de ruido pre-flow son cosenos sobre los 19.000 pasos completos, por lo que los checkpoints intermedios son instantáneas a mitad de schedule y no ejecuciones más cortas ya convergidas. El autor indica que el modelo ha visto aproximadamente 0,12 épocas del cielo elegible.

## Capacidades

- Generación autorregresiva de observaciones astronómicas multimodales: imágenes de un solo canal (Legacy Survey g, r, i, z), recortes RGB, espectros y valores escalares de catálogo.
- Modelado conjunto de 57 modalidades dentro de una misma secuencia intercalada por objeto.
- Generación condicionada por contexto: la secuencia puede combinar modalidades del mismo objeto, permitiendo muestrear una modalidad a partir de otras.
- Muestreo de espectros (DESI y SDSS) y de recortes de imagen con temperatura configurable (por defecto 1,0).
- Checkpoints intermedios publicados como ramas (`step1000` a `step19000`) para estudiar la evolución del entrenamiento.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües de texto.

## Casos de uso

- Investigación en modelos generativos astronómicos: reproducir el entrenamiento y analizar la evolución de las muestras entre los pasos 1000 y 19000 usando las ramas intermedias y los registros de W&B.
- Estudio de modelado multimodal con tokens continuos: evaluar el esquema de normalising flows por modalidad y cabezas de mezcla gaussiana como alternativa a la discretización de imágenes y espectros.
- Generación de espectros sintéticos para análisis de sensibilidad: muestrear espectros con `astro/scripts/generate.py` y estudiar cómo varían con la temperatura de muestreo, teniendo en cuenta los picos atípicos en bins individuales.
- Prototipado de aumento de datos: generar recortes de imagen de un solo canal (Legacy South g, r, i, z) con núcleos centrados, halos y ruido de cielo realista para pipelines de detección.
- Comparación de metodologías de preentrenamiento astronómico: contrastar el enfoque de "large observation model" frente a modelos por modalidad en tareas de representación.
- Docencia y divulgación técnica: ilustrar cómo un transformer decoder-only puede modelar datos científicos heterogéneos, usando las muestras publicadas en W&B como material visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no hay evaluación downstream y que la fidelidad científica no ha sido medida. Los únicos datos de validación son las pérdidas registradas durante el entrenamiento en el paso 19k:

| Metrica (validacion, step 19k) | Valor |
|---|---|
| `val/image_family_loss` | -0,081 |
| `val/spectrum_family_loss` | -0,878 |
| `val/scalar_family_loss` | -2,61 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 395,4M de parámetros en bfloat16, los pesos ocupan aproximadamente 0,8 GB; el consumo real dependerá de los buffers de los flows, codificadores y decodificadores, no cuantificados en la información disponible.
- GPU de entrenamiento de referencia: 4×H200 (12,9 horas para 19.000 pasos).
- GPU recomendadas para inferencia: no disponibles; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM podría alojar los pesos en precisión reducida, pero no hay cifras verificadas.
- Compatibilidad con GPU de consumo: probable por el tamaño del checkpoint, pero no confirmada por el autor.
- Opciones de despliegue: carga mediante `transformers` con `AutoModel.from_pretrained` tras instalar el paquete `astropt3` desde el repositorio de GitHub; el muestreo se realiza con `astro/scripts/generate.py --checkpoint <dir>` sobre una copia local descargada con `huggingface_hub.snapshot_download`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (large observation models multimodales para astronomía) con parámetros, contexto o licencia verificables.

## Limitaciones y advertencias

- Versión pre-alpha: los pesos, el formato de configuración y el código de carga pueden cambiar sin aviso; no es un modelo terminado.
- Entrenamiento muy temprano: aproximadamente 0,12 épocas del cielo elegible y 2,08B tokens frescos sin padding en 19.000 pasos.
- Los recortes RGB (`galaxies`) siguen mostrando límites de parche visibles; han progresado desde ruido en el paso 1000 hasta núcleos y colores de galaxia centrados en 16k-19k, pero las fronteras entre parches persisten.
- Los espectros (DESI y SDSS) presentan ocasionalmente picos atípicos extremos en bins individuales con la temperatura de muestreo por defecto (1,0).
- Las imágenes de un solo canal de Legacy Survey son más limpias que en pre-alpha-1, pero la fidelidad científica no se ha evaluado.
- Sin evaluación downstream: no hay métricas de tareas científicas, solo pérdidas de validación.
- No hay información sobre sesgos, cobertura lingüística ni comportamiento fuera del dominio astronómico.
- Licencia CC BY-SA 4.0: permite uso comercial con atribución y obliga a compartir las obras derivadas bajo la misma licencia; conviene revisar las implicaciones para productos propietarios.
- Los checkpoints intermedios son instantáneas a mitad de schedule (learning rate y ruido pre-flow son cosenos sobre 19k pasos), no ejecuciones convergidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Smith42/astroPT_v3.0-pre-alpha-2-160m
- Código (commit fijado): https://github.com/UniverseTBD/astroPTv3/tree/9a72153b97a09d174faf17aca7f269b220c18273
- Registros y muestras (W&B, run `g8w1pab7`): https://wandb.ai/smith42/astropt3/runs/g8w1pab7
- Proyecto UniverseTBD: https://universetbd.org
- Discord de UniverseTBD: https://discord.gg/MNEVegvfJq
