# Smith42/astroPT_v3.0-pre-alpha-3-160m

## Resumen

AstroPTv3 160M es un modelo de investigación de tipo "large observation model" para astronomía, desarrollado por el autor Smith42 en el marco del proyecto abierto UniverseTBD. Se trata de un transformer decoder-only de 157,5 millones de parámetros en su backbone (386,6 millones totales al incluir los flows por modalidad, encoders y decoders) que se entrena de forma autorregresiva sobre secuencias intercaladas de imágenes, espectros y valores escalares de catálogo pertenecientes al mismo objeto astronómico. La versión publicada es un snapshot pre-alpha (paso 19k) y no un modelo terminado.

El modelo aborda un problema específico: unificar en una sola arquitectura generativa datos astronómicos heterogéneos (imágenes de Legacy Survey, HSC, espectros de DESI y SDSS, recortes RGB de galaxias y escalares de catálogo) mediante tokens continuos modelados con normalising flows por modalidad y cabezas de mezcla gaussiana. Frente a la versión pre-alpha-2, esta iteración actualiza el encoder de espectros (parches de 64 bins, relleno de ruido de continuo local, clamp de ±10.000 nMgy) y el encoder RGB de galaxias (parches de 8×8 sobre recortes de 128×128 con reescalado 5×).

Es relevante ahora porque representa un paso temprano pero concreto hacia modelos fundacionales multimodales para astronomía, con checkpoints intermedios publicados cada 1.000 pasos y código reproducible. No obstante, el propio autor advierte que no se ha evaluado en tareas downstream y que los pesos, el formato de configuración y el código de carga pueden cambiar sin aviso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autorregresivo con normalising flows por modalidad y cabezas de mezcla gaussiana |
| Parametros totales | 386.589.952 (backbone: 157,5 M; flows por modalidad: 219,1 M; encoders, decoders y position embeddings: 9,9 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usa secuencias de 4096 tokens, pero no se especifica la ventana máxima de inferencia) |
| Tipos de cuantizacion | No disponible (pesos en bfloat16 safetensors) |
| Idiomas soportados | No disponible (modelo orientado a datos astronómicos, no a texto natural) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El backbone es un transformer decoder-only de 25 capas, tamaño oculto 768, 12 cabezas de consulta y 4 cabezas KV (atención con grouped-query attention), con tamaño intermedio 2048. Sobre él se añaden flows de normalización específicos por modalidad y cabezas de mezcla gaussiana para modelar tokens continuos, lo que permite tratar imágenes, espectros y escalares dentro de una misma secuencia autorregresiva. El modelo cubre 57 modalidades: imágenes Legacy Survey North/South, imágenes HSC, espectros DESI EDR y SDSS DR17 (parches de 64 bins), recortes RGB de galaxias con sombreros (parches de 8×8 sobre 128×128 con reescalado 5×) y escalares de catálogo de 7 catálogos con `min_catalogs=3`.

El entrenamiento se realizó durante 19.000 pasos (12,9 horas en 4×H200) con batch global de 128 × 4096 tokens, acumulando 2.060 millones de tokens frescos sin padding (8.250 millones con eco 4×; 9.960 millones brutos con padding). Se usó el optimizador AdamW (β₁=0,9, β₂=0,95, weight decay 0,1), learning rate 3e-4 con warmup de 2.000 pasos y decaimiento coseno hasta 3e-5, semilla 42, `pre_flow_noise_max=0` y ruido latente de 0,1 a 0,0. El autor indica que el modelo ha visto aproximadamente 0,12 épocas del cielo elegible. Se publican checkpoints intermedios cada 1.000 pasos como ramas (`step1000` a `step19000`), y `main` contiene los mismos pesos que `step19000`.

## Capacidades

- Generación autorregresiva de datos astronómicos multimodales: imágenes de Legacy Survey North/South, HSC, espectros DESI y SDSS, recortes RGB de galaxias y escalares de catálogo.
- Modelado de espectros con reproducción de continuos realistas, breaks a 4000 Å y envolventes de ruido, según las muestras del propio autor.
- Generación de recortes RGB de galaxias con textura de cielo de fondo más fina que la versión anterior, aunque con costuras visibles de parches 8×8 en el núcleo y halo a 19k pasos.
- Generación de valores escalares de catálogo condicionados por las demás modalidades del mismo objeto.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües de texto natural.
- No se documenta modo thinking, visión general, audio ni otras capacidades fuera del dominio astronómico.

## Casos de uso

- Generación sintética de espectros astronómicos: el modelo puede muestrear espectros sintéticos condicionados por otras modalidades del mismo objeto, útil para aumentar datasets de entrenamiento o para estudiar la distribución aprendida de continuos y ruido. Es adecuado porque el encoder de espectros se ha mejorado específicamente en esta iteración (parches de 64 bins, clamp de ±10.000 nMgy).
- Completado de datos faltantes en catálogos: dado un objeto con imágenes pero sin espectro, el modelo puede generar un espectro plausible condicionado por las modalidades disponibles, lo que permitiría priorizar observaciones de seguimiento. Es adecuado por su naturaleza multimodal intercalada.
- Simulación de recortes RGB de galaxias: generación de imágenes sintéticas de galaxias con textura de fondo realista para probar pipelines de reducción o detectores. Adecuado por el encoder RGB actualizado, aunque con la limitación de las costuras de parches.
- Estudio de representaciones internas: al ser un modelo generativo multimodal, sus activaciones pueden analizarse para investigar qué información comparten imágenes, espectros y escalares del mismo objeto. Adecuado en un contexto de investigación, no de producción.
- Prototipado de modelos fundacionales astronómicos: sirve como base para experimentos académicos sobre modelado autorregresivo de datos científicos heterogéneos, gracias a los checkpoints intermedios publicados y al código reproducible.
- Generación condicionada para validación cruzada de modalidades: comparar las muestras generadas con observaciones reales de un objeto permite detectar anomalías o inconsistencias entre catálogos, imágenes y espectros. Adecuado como herramienta exploratoria, no como clasificador validado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ha realizado evaluación downstream. Los únicos datos de rendimiento son pérdidas de validación interna:

| Metrica | Valor |
|---|---|
| `val/spectrum_family_loss` (held-out) | -1,100 nats/dim (frente a -0,878 en pre-alpha-2) |
| `val/scalar_family_loss` | -2,68 nats/dim (frente a -2,61 en pre-alpha-2) |
| `val/legacy_south_*` y `val/hsc_*` | dentro de 0,002–0,006 nats/dim respecto a pre-alpha-2 |
| `val/legacy_north_{g,r}` | +0,13–0,15 nats/dim por detrás de pre-alpha-2 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 386,6 M de parámetros totales en bfloat16, los pesos ocupan aproximadamente 0,77 GB; el resto de la VRAM dependerá del tamaño de las secuencias multimodales y de los buffers de los flows.
- GPU recomendadas: el entrenamiento se realizó en 4×H200; para inferencia no se especifican requisitos, pero por tamaño debería caber en GPUs consumer con suficiente VRAM para secuencias largas.
- Cabe en GPU consumer: probablemente sí por tamaño de pesos, pero no confirmado por el autor; depende de la longitud de contexto y del número de modalidades procesadas.
- Opciones de despliegue: `transformers` con el paquete `astropt3` instalado desde el repositorio (`pip install "git+https://github.com/UniverseTBD/astroPTv3.git@a85de8ae...#subdirectory=astro"`). El muestreo se realiza con `astro/scripts/generate.py --checkpoint <dir>` sobre una copia local descargada con `huggingface_hub.snapshot_download`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Estado |
|---|---|---|---|---|---|
| AstroPTv3 160M (pre-alpha-3) | 386,6 M totales (157,5 M backbone) | No disponible | Astronomía multimodal | CC BY-SA 4.0 | Pre-alpha, sin evaluación downstream |
| AstroPTv3 160M (pre-alpha-2) | No disponible en la información | No disponible | Astronomía multimodal | CC BY-SA 4.0 | Pre-alpha anterior, superado en espectros y escalares |
| Otros modelos astronómicos multimodales | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Lanzamiento pre-alpha: es un snapshot de investigación, no un modelo terminado. Los pesos, el formato de configuración y el código de carga pueden cambiar sin aviso.
- Entrenamiento muy temprano: aproximadamente 0,12 épocas del cielo elegible y 2.060 millones de tokens frescos sin padding en 19.000 pasos.
- Sin evaluación downstream: las tareas científicas no se han benchmarkeado, por lo que no hay garantía de utilidad en aplicaciones reales.
- Artefactos en RGB: las costuras de parches 8×8 siguen siendo visibles en el núcleo y halo de las galaxias a 19k pasos.
- Modalidades Legacy North: las bandas `g` y `r` están ligeramente por detrás de la versión anterior (+0,13–0,15 nats/dim).
- Sesgos conocidos: no documentados explícitamente, pero al entrenarse sobre un subconjunto del cielo (Legacy Survey, HSC, DESI, SDSS) hereda los sesgos de selección de esos sondeos.
- Riesgo de alucinación: no aplica en el sentido de texto, pero las muestras generadas pueden ser físicamente plausibles sin corresponder a objetos reales.
- Licencia CC BY-SA 4.0: permite uso comercial con atribución y compartir bajo la misma licencia; conviene revisar las implicaciones de la cláusula share-alike para productos derivados.
- No se documentan capacidades de texto natural ni multilingües; no debe usarse como modelo de lenguaje general.
- Idiomas soportados: no disponibles; el modelo está orientado a datos astronómicos, no a texto.

## Enlaces

- Hugging Face: https://huggingface.co/Smith42/astroPT_v3.0-pre-alpha-3-160m
- Versión anterior: https://huggingface.co/Smith42/astroPT_v3.0-pre-alpha-2-160m
- Código: https://github.com/UniverseTBD/astroPTv3/tree/a85de8ae2c093d577fe22416e267d1f50326121a
- Logs y muestras (W&B): https://wandb.ai/smith42/astropt3/runs/9yvhiqte
- Proyecto UniverseTBD: https://universetbd.org
- Discord de UniverseTBD: https://discord.gg/MNEVegvfJq
