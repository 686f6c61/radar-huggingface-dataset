# Smith42/astropt3-pre-alpha-2-160m

## Resumen

AstroPTv3 160M es un modelo de investigación en fase pre-alpha desarrollado por Smith42 en el marco del proyecto abierto UniverseTBD. Se trata de un "large observation model" multimodal para astronomía: un transformer decoder-only entrenado de forma autorregresiva sobre secuencias intercaladas de imágenes, espectros y valores escalares de catálogo correspondientes al mismo objeto astronómico. El checkpoint publicado (pre-alpha-2, paso 19k) constituye una instantánea intermedia de un entrenamiento en curso, no un modelo final.

La relevancia del modelo reside en su enfoque: en lugar de tratar cada modalidad astronómica por separado, unifica 57 modalidades (imágenes Legacy Survey North/South, HSC, espectros DESI EDR y SDSS DR17, recortes RGB de galaxias y escalares de siete catálogos) en un único backbone autorregresivo. Los tokens continuos se modelan mediante normalising flows por modalidad y cabezas de mezcla gaussiana, una innovación técnica que permite generar observaciones sintéticas de forma nativa.

El backbone tiene 157,5M de parámetros y el total asciende a 395,4M al incluir los flows, codificadores, decodificadores y embeddings posicionales. El entrenamiento cubrió 19.000 pasos (12,9 horas en 4×H200) con 2,08B tokens frescos sin padding. El autor advierte explícitamente que no se ha evaluado en tareas downstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autorregresivo con normalising flows por modalidad y cabezas de mezcla gaussiana |
| Parametros totales | 395.444.992 (backbone: 157,5M; flows: 221,3M; resto: encoders, decoders, position embeddings) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrenado con secuencias de 4096 tokens) |
| Tipos de cuantizacion | No disponible (pesos en bfloat16 safetensors) |
| Idiomas soportados | No disponible (modelo multimodal astronómico, no orientado a lenguaje natural) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El backbone es un transformer decoder-only de 25 capas, dimensión oculta 768, 12 cabezas de consulta y 4 cabezas KV (atención GQA), con tamaño intermedio 2048. Sobre este backbone se añaden flows de normalización específicos por modalidad y cabezas de mezcla gaussiana que permiten modelar tokens continuos (píxeles de imagen, flujos espectrales, escalares) de forma probabilística, en lugar de discretizarlos. El modelo procesa secuencias intercaladas de las 57 modalidades correspondientes a un mismo objeto astronómico, con un mínimo de 3 catálogos por objeto (`min_catalogs=3`).

El entrenamiento se realizó durante 19.000 pasos con AdamW (β₁=0,9, β₂=0,95, weight decay 0,1), learning rate 3e-4 con warmup de 2.000 pasos y decaimiento coseno hasta 3e-5, semilla 42, en precisión bfloat16 sobre 4×H200. El batch global fue de 128 secuencias × 4096 tokens, acumulando 2,08B tokens frescos sin padding (8,26B con eco 4×; 9,96B en bruto con padding). Los schedules de learning rate y ruido pre-flow son cosenos sobre los 19k pasos completos, por lo que los checkpoints intermedios (ramas `step1000` a `step19000`) son instantáneas a mitad de schedule, no runs convergidos más cortos.

## Capacidades

- Generación autorregresiva de imágenes astronómicas en bandas individuales (Legacy Survey South g, r, i, z) con núcleos centrados, halos y ruido de cielo realista.
- Generación de recortes RGB de galaxias (`galaxies`), aunque con artefactos visibles en los bordes de parche.
- Generación de espectros sintéticos (DESI EDR y SDSS DR17), con ocasionales picos atípicos en bins individuales a temperatura de muestreo por defecto (1.0).
- Modelado conjunto de escalares de catálogo de siete catálogos astronómicos.
- Modelado multimodal intercalado: el mismo objeto puede representarse mediante imágenes, espectros y escalares en una única secuencia.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM de propósito general.
- No es un modelo multilingüe ni de lenguaje natural; su dominio es exclusivamente astronómico.

## Casos de uso

- Generación de imágenes astronómicas sintéticas para aumento de datos: el modelo puede muestrear cutouts de banda única con ruido de cielo realista, útil para entrenar clasificadores o detectores con datos aumentados en dominios con pocas observaciones etiquetadas.
- Simulación de espectros para pruebas de pipelines: los espectros DESI y SDSS generados permiten validar software de reducción o extracción de rasgos espectrales antes de disponer de datos reales.
- Estudio de representaciones multimodales: al entrenarse sobre imágenes, espectros y escalares del mismo objeto, el backbone puede emplearse para investigar embeddings conjuntos y transferencia entre modalidades.
- Modelado de poblaciones de galaxias: los escalares de catálogo condicionados por imágenes permiten explorar distribuciones conjuntas y detectar inconsistencias entre catálogos.
- Investigación en modelos generativos de observaciones científicas: sirve como banco de pruebas para normalising flows y cabezas de mezcla gaussiana aplicadas a datos continuos.
- Reproducción de experimentos: los checkpoints intermedios por paso permiten estudiar la dinámica de entrenamiento (evolución de pérdidas por familia, aparición de estructuras en las muestras) sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no hay evaluación downstream. Solo se reportan pérdidas de validación en el paso 19k:

| Métrica de validación | Valor (paso 19k) |
|---|---|
| `val/image_family_loss` | -0,081 |
| `val/spectrum_family_loss` | -0,878 |
| `val/scalar_family_loss` | -2,61 |

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de 395,4M parámetros en bfloat16, los pesos ocupan aproximadamente 0,8 GB; con activaciones y buffers de los flows, se estima un uso de 2-4 GB en GPU, aunque no se ha publicado una cifra oficial.
- GPU recomendadas: el entrenamiento se realizó en 4×H200; para inferencia basta una GPU consumer moderna (RTX 3090, RTX 4090) o incluso una GPU con 8 GB de VRAM.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 8 GB de VRAM.
- Opciones de despliegue: el modelo requiere el paquete `astropt3` instalado desde el repositorio `UniverseTBD/astroPTv3` (commit `9a72153`) y se carga con `transformers.AutoModel`. El muestreo se realiza con `astro/scripts/generate.py --checkpoint <dir>` sobre una copia local descargada con `huggingface_hub.snapshot_download`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El propio autor menciona como referencia interna AstroPT 70M pre-alpha-1, del que indica que las muestras de banda única Legacy South del modelo actual son sustancialmente más limpias, pero no se ofrecen métricas cuantitativas comparativas.

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| AstroPTv3 160M pre-alpha-2 | 395,4M totales (157,5M backbone) | 4096 tokens de entrenamiento | CC BY-SA 4.0 | Pre-alpha, sin evaluación downstream |
| AstroPT 70M pre-alpha-1 | No disponible | No disponible | No disponible | Pre-alpha |
| Otros modelos astronómicos multimodales | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Fase pre-alpha: los pesos, el formato de configuración y el código de carga pueden cambiar sin aviso.
- Entrenamiento muy temprano: aproximadamente 0,12 épocas del cielo elegible, con 2,08B tokens frescos (≈3,63M objetos).
- Los recortes RGB (`galaxies`) muestran límites de parche visibles; tienen muchos menos tokens que los cutouts de banda única Legacy.
- Los espectros presentan ocasionalmente picos atípicos en bins individuales a temperatura de muestreo 1.0.
- No hay evaluación downstream: la fidelidad científica de las muestras no está validada.
- No orientado a lenguaje natural ni a tareas de NLP; no soporta tool calling ni agentes.
- Licencia CC BY-SA 4.0: permite uso comercial con atribución y compartir-al-igual, lo que obliga a licenciar obras derivadas bajo la misma licencia.
- Riesgo de alucinación en el sentido de generar observaciones plausibles pero no reales; no debe usarse como sustituto de datos observacionales en análisis científicos sin validación.
- Sin información sobre sesgos demográficos o lingüísticos (no aplica), pero sí posible sesgo hacia las distribuciones de los catálogos y surveys de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/Smith42/astropt3-pre-alpha-2-160m
- Código: https://github.com/UniverseTBD/astroPTv3/tree/9a72153b97a09d174faf17aca7f269b220c18273
- Logs y muestras (W&B): https://wandb.ai/smith42/astropt3/runs/g8w1pab7
- UniverseTBD: https://universetbd.org
- Discord de UniverseTBD: https://discord.gg/MNEVegvfJq
