# jjalora/diet-traj-pythia-410m-scaled-orthogonal-seed11

## Resumen

diet-traj-pythia-410m-scaled-orthogonal-seed11 es un checkpoint de investigación publicado por el usuario jjalora dentro de la campaña "DIET weight-space", cuyo objetivo es estudiar la trayectoria de entrenamiento de modelos Pythia desde cero en el espacio de pesos. No es un modelo conversacional ni un asistente afinado: es una reproducción del recetario abierto de Pythia-410M de EleutherAI (arquitectura GPT-NeoX, 405.334.016 parámetros reales según safetensors) entrenado sobre el mismo flujo de tokens (`EleutherAI/pile-standard-pythia-preshuffled`) con idéntico orden de batches, y del que solo varían la semilla aleatoria y el esquema de inicialización de pesos (aquí `scaled-orthogonal`, semilla 11).

El interés del artefacto es metodológico: permite comparar cómo evoluciona la pérdida y las propiedades de los pesos a lo largo de 143.000 pasos frente a otras trayectorias de la misma colección, con una evaluación de `eval_loss` recalculada de forma homogénea para todos los checkpoints. El repositorio es inusualmente grande (948,5 GB) porque conserva ramas `stepN` con los pesos en float16 safetensors en los pasos {0, 1, 2, 4, …, 512} y cada 100 pasos, además de los pesos finales en `main`.

Es relevante ahora porque la comunidad de interpretabilidad y de ciencia del entrenamiento necesita trayectorias reproducibles y comparables a pequeña escala para estudiar dinámicas de optimización, inicialización y poda/merging en el espacio de pesos, sin el coste de entrenar modelos grandes. Su utilidad práctica como generador de texto es secundaria: es un modelo base de 410M en inglés, sin ajuste por instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only), implementación `transformers` con `gpt_neox` |
| Parametros totales | 405.334.016 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Pythia-410M usa 2048 tokens en su configuración de referencia, pero no se confirma en la model card) |
| Tipos de cuantizacion | no se publican pesos cuantizados; los checkpoints se distribuyen en float16 safetensors (cuantización posterior posible vía herramientas externas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float16); ramas `stepN` con pesos únicamente y `main` con los pesos finales |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia GPT-NeoX, con la misma arquitectura que `EleutherAI/pythia-410m` según el fichero de receta `models/410M/pythia-410m.yml`. El entrenamiento sigue el recetario abierto de Pythia: AdamW con lr 3e-4, betas (0,9; 0,95), weight decay 0,1 sin decaimiento en LayerNorm ni sesgos, grad clipping 1,0, schedule coseno hasta 3e-5 durante 143.000 pasos, 1.430 pasos de warmup, autocast fp16 con pesos maestros en fp32 y batch global de 1024 × 2048 tokens independientemente del número de GPUs. El flujo de datos es `EleutherAI/pile-standard-pythia-preshuffled`, con el batch *i* correspondiente a las filas [i·1024, (i+1)·1024), de modo que el orden de tokens es idéntico al de la receta original.

La única variación respecto a Pythia es la semilla aleatoria y el esquema de inicialización: aquí `init_scheme = scaled-orthogonal` con semilla 11, frente al esquema `pythia` (small_init + wang_init) de EleutherAI. La model card advierte que la reproducción bit a bit del RNG de inicialización de EleutherAI no es posible entre frameworks, y que el esquema `pythia` solo coincide en la distribución por tensor con `EleutherAI/pythia-410m` revisión `step0` (verificado en `tests/test_pythia_step0_init_match.py`). El repositorio incluye `losses.csv` en `main` con `train_loss`, `eval_loss`, `eval_perplexity`, `eval_accuracy`, `tokens_seen` y `lr` por checkpoint; `eval_loss` se recalculó una vez para todos los checkpoints contra un conjunto de evaluación fijo, lo que hace comparables las curvas entre trayectorias de la colección. El fichero `campaign.json` de procedencia está vacío (`{}`).

## Capacidades

- Generación de texto autoregresiva en inglés, como modelo base sin ajuste por instrucciones.
- Modelado de lenguaje y cálculo de perplejidad sobre texto en inglés (Pile).
- Punto de partida para experimentos de interpretabilidad y análisis en el espacio de pesos gracias a los checkpoints intermedios `stepN`.
- Reproducción controlada de una trayectoria de entrenamiento con orden de tokens fijo, útil para estudiar efectos de inicialización y semilla.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, visión ni audio.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Estudio de dinámicas de entrenamiento: comparar `losses.csv` de esta trayectoria (semilla 11, `scaled-orthogonal`) con otras trayectorias de la campaña DIET para aislar el efecto de la inicialización sobre la curva de pérdida y la perplejidad de evaluación.
- Investigación en interpretabilidad: cargar checkpoints intermedios en los pasos {0, 1, 2, 4, …, 512} y cada 100 pasos para analizar la evolución de activaciones, circuitos o direcciones de pesos a lo largo del entrenamiento.
- Experimentos de merging y poda en el espacio de pesos: usar los pesos finales de `main` y los intermedios como puntos de referencia para estudiar interpolación lineal, task arithmetic o pruning, aprovechando que todos comparten receta y flujo de datos.
- Reproducibilidad de recetas: validar pipelines de entrenamiento propios replicando el recetario Pythia (AdamW, schedule coseno, batch 1024 × 2048) y contrastando la pérdida contra `train_loss` registrada en `losses.csv`.
- Generación de texto base en inglés para pruebas de infraestructura: al ser un GPT-NeoX de 410M con licencia Apache 2.0, sirve para validar despliegues con `text-generation-inference` o `transformers` en entornos de CI sin coste de licencia.
- Docencia y experimentación de bajo presupuesto: fine-tuning sobre tareas en inglés (clasificación, resumen) partiendo de un modelo pequeño y con checkpoints abundantes para comparar puntos de partida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de entrenamiento y evaluación interna (`train_loss`, `eval_loss`, `eval_perplexity`, `eval_accuracy`) por checkpoint en `losses.csv`, sin valores numéricos concretos en el texto proporcionado, por lo que no se pueden presentar cifras verificables.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,8 GB solo para pesos (405M × 2 bytes), más overhead de activaciones y KV cache; en la práctica, menos de 2 GB para contextos moderados.
- VRAM estimada en fp32: aproximadamente 1,6 GB solo para pesos.
- Cabe holgadamente en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB, e incluso en GPUs con 4-6 GB tras cuantización a 8 o 4 bits con herramientas externas.
- GPU de datacenter compatibles: A100, H100, L40S, sin problema de memoria; el cuello de botella sería el throughput, no la VRAM.
- Opciones de despliegue: `transformers` (librería declarada), `text-generation-inference` (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo), y herramientas estándar para GPT-NeoX como llama.cpp u Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Advertencia de almacenamiento: el repo ocupa 948,5 GB por la acumulación de checkpoints; descargar solo la rama `main` o una rama `stepN` concreta, no el repositorio completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| jjalora/diet-traj-pythia-410m-scaled-orthogonal-seed11 | 405.334.016 | no disponible | Apache 2.0 | Trayectoria de investigación con checkpoints intermedios; inicialización `scaled-orthogonal`, semilla 11 |
| EleutherAI/pythia-410m | ~410M | 2048 (referencia Pythia) | Apache 2.0 | Modelo base de referencia con la misma receta y flujo de datos; inicialización `pythia` (small_init + wang_init) |
| Otras trayectorias de la campaña DIET (mismo autor) | ~410M | no disponible | Apache 2.0 | Misma receta con distintas semillas y esquemas de inicialización; comparables directamente vía `losses.csv` |

La comparación con modelos de propósito general de tamaño similar (por ejemplo, GPT-2 355M o modelos de 400M afinados por instrucciones) no procede en términos de rendimiento porque este checkpoint es un artefacto de investigación sin evaluación en benchmarks estándar publicada.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable ni está alineado; no debe usarse como asistente sin fine-tuning o RLHF posterior.
- Solo inglés: la etiqueta de idioma del repositorio es `en`; el rendimiento en castellano no está documentado y previsiblemente será pobre.
- Riesgo de alucinación y de generar contenido sesgado o tóxico heredado del Pile, sin filtros de seguridad documentados.
- No hay resultados de benchmarks publicados en la información disponible; no se puede afirmar su calidad relativa frente a Pythia-410M original más allá de la coincidencia de receta.
- La reproducción bit a bit de la inicialización de EleutherAI no es posible entre frameworks; las comparaciones con Pythia deben hacerse a nivel de distribución y de métricas de evaluación homogéneas.
- El tamaño del repositorio (948,5 GB) es un riesgo operativo: descargas completas pueden agotar disco y ancho de banda; conviene clonar solo la rama necesaria.
- El fichero `campaign.json` está vacío (`{}`), lo que limita la trazabilidad de la procedencia más allá de la model card.
- Licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación sin garantías de calidad, su uso en producción requeriría validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jjalora/diet-traj-pythia-410m-scaled-orthogonal-seed11
- Receta Pythia de referencia: https://github.com/EleutherAI/pythia (fichero `models/410M/pythia-410m.yml`)
- Modelo base de comparación: https://huggingface.co/EleutherAI/pythia-410m
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/pile-standard-pythia-preshuffled
- No se han encontrado en la información proporcionada enlaces a papers, blogs, demos ni al repositorio del código de entrenamiento de la campaña DIET (se menciona `src/init_schemes.py` y `tests/test_pythia_step0_init_match.py`, pero sin URL).
