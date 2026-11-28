# Anivarth/Diffusion_twigs

## Resumen

Diffusion_twigs es un modelo generativo de moléculas 3D condicionado para el conjunto de datos QM9, entrenado para generar estructuras moleculares a partir de dos propiedades objetivo: la polarizabilidad (α) y el momento dipolar (μ). Lo desarrolla el usuario Anivarth y se basa en el método Diffusion Twigs with Loop Guidance descrito por Mercatali, Verma, Freitas y Garg en NeurIPS 2024 (arXiv:2410.24012), reutilizando la arquitectura QM9 publicada por los autores originales (`cond_DGT_twigs`, 8 capas, 256 dimensiones ocultas).

El modelo no se entrena desde cero: parte de los pesos del checkpoint JODO para α/μ (paso de origen 2.500.001) y los afina durante 15 horas en 4× RTX 2080 Ti, con 116.845 actualizaciones del optimizador y un batch efectivo de 128. Se inicializan desde cero los 94 tensores nuevos de Twigs (cabezas de propiedad `cls`, `cls2` y el embedding de propiedad evolutiva `cond_mlp2`, `cond_lin2`), verificando previamente la paridad del tronco con JODO.

Es relevante porque demuestra que es posible adaptar un generador molecular preentrenado a generación condicionada con un presupuesto de cómputo muy inferior al receta original (3.000.000 de actualizaciones desde cero), obteniendo MAE de 1,576 bohr³ en α y 0,683 D en μ sobre 256 muestras, con una validez del 96,5% y una estabilidad molecular del 91,8%. El repositorio ocupa 0,7 GB e incluye checkpoints, configuración, procedencia y muestras generadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Twigs sobre tronco JODO (grafo 3D con difusión; 8 capas, 256 dimensiones ocultas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (generación de grafos moleculares, no texto) |
| Tipos de cuantizacion | no disponible (checkpoint en fp32; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (modelo de generación molecular) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`last.pt`, con pesos del modelo, EMA, optimizador, contador de actualizaciones y estado RNG) |

## Arquitectura y entrenamiento

El modelo sigue el esquema de difusión sobre grafos moleculares de Diffusion Twigs: un proceso de difusión que genera coordenadas 3D y tipos de átomo de forma conjunta, con un mecanismo de guiado por bucle (loop guidance) que permite condicionar la generación a propiedades objetivo. La arquitectura concreta es `cond_DGT_twigs` con 8 capas y 256 dimensiones ocultas, la misma que publicaron los autores para QM9, con correcciones de errores aplicadas por Anivarth.

El entrenamiento parte del tronco JODO (pesos EMA) y verifica que reproduce exactamente las salidas de JODO antes de añadir los módulos de condicionamiento. Se usa la variante `official-fixed`, que mantiene el comportamiento de entrenamiento publicado por los autores (entrada de tallo gaussiana independiente) pero corrige las pérdidas de propiedad por ejemplo y el indexado. El presupuesto es de 15 horas en 4× RTX 2080 Ti, 116.845 actualizaciones del optimizador, batch efectivo de 128 (16 por GPU × 2 de acumulación × 4 GPU), lr 2e-4, 5.000 actualizaciones de warmup, precisión fp32, decaimiento EMA de 0,999 y semilla 42. El software empleado es Python 3.10 y PyTorch 2.5.1 con CUDA 12.4.

## Capacidades

- Generación condicionada de moléculas 3D para QM9 a partir de valores objetivo de polarizabilidad (α) y momento dipolar (μ).
- Generación de grafos moleculares con coordenadas 3D y tipos de átomo, con guiado por bucle durante el muestreo (1.000 pasos de muestreo con loop guidance en la evaluación).
- Producción de moléculas válidas, únicas y novedosas: 96,5% de validez, 100% de unicidad entre las válidas y 72,6% de novedad en la evaluación publicada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo especializado en generación molecular.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Diseño de moléculas con propiedades electrónicas objetivo: dado un par (α, μ) deseado, el modelo genera estructuras 3D candidatas que pueden filtrarse y priorizarse antes de un cálculo DFT posterior.
- Exploración de espacio químico en QM9: generación de moléculas novedosas (72,6% de novedad) para ampliar conjuntos de datos de entrenamiento en modelos predictivos de propiedades.
- Prototipado rápido en investigación de difusión condicionada: al ser un fine-tune ligero sobre JODO con código y procedencia documentados, sirve como base reproducible para experimentos de condicionamiento en grafos.
- Generación de candidatos para cribado virtual: las moléculas generadas pueden alimentar pipelines de docking o de evaluación de propiedades con predictores EGNN independientes.
- Estudio de estabilidad molecular: con un 91,8% de estabilidad molecular y un 99,1% de estabilidad atómica, el modelo es útil para analizar qué fracción de moléculas generadas son químicamente plausibles.
- Reproducción y comparación de métodos: el repositorio incluye `sample_metrics.json`, `sample_properties.csv` y los SDF de muestras válidas, lo que permite comparar directamente con las cifras del paper de Twigs y de JODO.
- Docencia y divulgación: como ejemplo didáctico de difusión sobre grafos con condicionamiento por propiedades y warm-start desde un checkpoint preentrenado.

## Benchmarks y rendimiento

Resultados publicados en la model card (256 muestras, una semilla, 1.000 pasos de muestreo con loop guidance, MAE medido con predictores EGNN independientes):

| Metrica | Este modelo (256 muestras) | Twigs, paper Tabla 5 (10k muestras) | JODO, paper Tabla 5 |
|---|---|---|---|
| MAE α (bohr³) ↓ | 1,576 | 1,46 | 1,52 |
| MAE μ (D) ↓ | 0,683 | 0,712 | 0,717 |

| Calidad | 3D | 2D |
|---|---|---|
| Validez | 96,5% | 96,9% |
| Estabilidad molecular | 91,8% | 96,5% |
| Estabilidad atómica | 99,1% | 99,7% |
| FCD ↓ | 2,29 | 1,54 |

Unicidad entre moléculas válidas: 100%. Novedad: 72,6%.

Advertencia del autor: son 256 moléculas de una sola semilla de muestreo, no las 10.000 del paper, y la columna de JODO es la cifra del paper, no una evaluación en las mismas condiciones, por lo que la model card no demuestra que el fine-tune de Twigs supere a JODO.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,7 GB y el checkpoint se carga en fp32, por lo que la huella de pesos es del orden de cientos de MB. El muestreo con 1.000 pasos y guiado por bucle añade memoria de activaciones no cuantificada.
- GPU recomendadas: el entrenamiento se realizó en 4× RTX 2080 Ti (11 GB cada una), lo que indica que la inferencia cabe holgadamente en GPUs de consumo.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 8 GB de VRAM; no se documenta una cifra exacta.
- Opciones de despliegue: carga directa con PyTorch (`torch.load(path, map_location="cpu", weights_only=False)`) usando el código del repositorio del proyecto (rama `orx/qm9-twigs-from-pretrained-jodo-alpha-mu`, directorio `qm9_twigs/`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La evaluación usó 1.000 pasos de muestreo con loop guidance por molécula, lo que implica un coste de muestreo elevado por instancia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (α / μ MAE) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Diffusion_twigs (este) | no disponible | no aplica | 1,576 bohr³ / 0,683 D (256 muestras) | MIT | Hugging Face |
| Twigs (paper, NeurIPS 2024) | no disponible | no aplica | 1,46 bohr³ / 0,712 D (10k muestras) | MIT | Código en repositorio de los autores |
| JODO (checkpoint α/μ) | no disponible | no aplica | 1,52 bohr³ / 0,717 D (cifra del paper) | MIT | Zenodo y GitHub |

La comparación es aproximada: las cifras de Twigs y JODO provienen del paper y no de una evaluación en las mismas condiciones que este modelo. No se dispone de datos de otros generadores moleculares condicionados comparables en la información proporcionada.

## Limitaciones y advertencias

- Los resultados se basan en 256 muestras de una sola semilla, frente a las 10.000 del paper; la variabilidad estadística no está cuantificada.
- La comparación con JODO usa la cifra del paper, no una evaluación en condiciones idénticas, por lo que no puede concluirse que este fine-tune supere a JODO.
- El FCD (2,29 en 3D y 1,54 en 2D) es peor que el de la receta completa del paper, lo que sugiere una menor fidelidad en la distribución generada.
- El modelo está especializado exclusivamente en QM9 y en las propiedades α y μ; no generaliza a otros conjuntos de datos ni a otras propiedades sin reentrenamiento.
- Riesgo de generar moléculas inestables: un 8,2% de las muestras no son molecularmente estables y un 3,5% no son válidas.
- El checkpoint `last.pt` contiene estado de entrenamiento serializado con pickle; el autor advierte de cargarlo solo si se confía en el archivo.
- No hay datos publicados sobre sesgos, comportamiento fuera de distribución ni rendimiento en producción.
- La licencia MIT permite uso comercial, pero se exige citar tanto el paper de Twigs como el de JODO.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Anivarth/Diffusion_twigs
- Paper de Diffusion Twigs (NeurIPS 2024): https://arxiv.org/abs/2410.24012
- Repositorio de JODO: https://github.com/GRAPH-0/JODO
- Checkpoint JODO α/μ en Zenodo: https://zenodo.org/records/8002902
