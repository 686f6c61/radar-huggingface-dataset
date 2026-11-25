# Al-Murphy/alphagenome-encoder-ft

## Resumen

AlphaGenome Encoder FT MPRA es una colección de checkpoints derivados del codificador de AlphaGenome, el modelo de genómica regulatoria desarrollado por Google DeepMind. En lugar de emplear el transformer completo de AlphaGenome, estos checkpoints entrenan una cabeza de regresión sobre la salida cruda del codificador (resolución de 128 pb), una estrategia que resulta más barata y, en tareas de reporteros con secuencias cortas, más precisa que el modelo completo.

El modelo está orientado específicamente a ensayos de reportero masivamente paralelos (MPRA) y STARR-seq, y cubre varios benchmarks: lentiMPRA en líneas celulares humanas (K562, HepG2, WTC11, SKNSH), STARR-seq en *Drosophila* (DeepSTARR) y STARR-seq en plantas (tabaco y maíz, con múltiples condiciones experimentales). Se distribuyen checkpoints tanto en JAX (Haiku) como en PyTorch, con dos etapas de entrenamiento: `stage1` con codificador congelado y `stage2` con codificador ajustado.

La relevancia actual del modelo radica en que permite predecir la actividad regulatoria de construcciones de ADN sintéticas sin necesidad de ejecutar el transformer completo, lo que reduce coste computacional y mejora la correlación en tareas de secuencias cortas. No obstante, su licencia hereda las restricciones de los términos de AlphaGenome, incluida la limitación a uso no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de AlphaGenome (transformer) con cabeza de regresión; el transformer completo se omite en inferencia |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entradas son construcciones de reportero; p. ej. 230 pb + 51 pb de cola en lentiMPRA) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de genómica; entradas son secuencias de ADN) |
| Licencia | other / alphagenome (términos de AlphaGenome de Google DeepMind, uso no comercial) |
| Formato de pesos | checkpoints JAX (Haiku) y PyTorch; requiere pesos base `google/alphagenome-all-folds` con acceso restringido |

## Arquitectura y entrenamiento

El modelo parte del codificador de AlphaGenome, un transformer de genómica regulatoria que produce representaciones a resolución de 128 pb. En estos checkpoints se descarta el transformer completo y se entrena una cabeza de regresión (MPRAHead) sobre la salida cruda del codificador. El entrenamiento se organiza en dos etapas: `stage1`, donde solo se entrena la cabeza con el codificador congelado, y `stage2`, donde se ajusta también el codificador. Los benchmarks cubiertos incluyen lentiMPRA (Agarwal et al. y Gosai et al.), DeepSTARR en *Drosophila* y STARR-seq en plantas (Jores et al. 2021 y Jores et al. 2026 con cinco condiciones).

Una innovación destacable es la sustitución del transformer por una cabeza ligera, que en secuencias cortas de reportero resulta más precisa y mucho más barata. Además, se documentan correcciones importantes en la construcción del reportero lentiMPRA: la cola original copiada del cebador inverso de Agarwal et al. 2025 (Tabla S13) no estaba reverse-complementada y repetía el adaptador derecho, por lo que los checkpoints JAX y PyTorch usan colas distintas y no intercambiables; los checkpoints `mpra-<cell>-optimal` incorporan la cola corregida y fueron reentrenados el 2026-11-24. La cabeza de planta varía de anchura por célula (4096 / 2048 / 1024) y se registra en el `config.json` de cada checkpoint.

## Capacidades

- Predicción de actividad regulatoria de construcciones de ADN en ensayos MPRA y STARR-seq.
- Regresión sobre la salida del codificador de AlphaGenome a resolución de 128 pb.
- Soporte de múltiples benchmarks: lentiMPRA (K562, HepG2, WTC11, SKNSH), DeepSTARR (*Drosophila*, desarrollo y housekeeping) y STARR-seq en plantas (hoja de tabaco y protoplasto de maíz).
- Modos de construcción específicos: `promoter_barcode`, enhancer, promoter_only y combined.
- Predicción multi-condición en plantas (frío, oscuro, luz, cálido, maíz) con `MPRAHead(num_outputs=5)`.
- Evaluación de efectos de variantes de un solo nucleótido (SNV) en paneles de Gosai et al.
- Interfaz de carga mediante `load_pretrained` y `list_pretrained`, con soporte JAX y PyTorch.
- No soporta tool calling, agentes, generación de texto ni capacidades multilingües; es un modelo especializado de genómica.

## Casos de uso

- Diseño de librerías MPRA: el modelo predice la actividad de construcciones de reportero lentiMPRA en K562, HepG2 y WTC11, permitiendo priorizar variantes antes de sintetizar la librería y reducir costes experimentales.
- Priorización de enhancers en plantas: con los checkpoints de STARR-seq en hoja de tabaco y protoplasto de maíz, se pueden evaluar candidatos regulatorios en modo enhancer o combined antes de validación experimental.
- Análisis de efectos de variantes: el panel de Gosai et al. permite estimar el efecto de SNV (Ref−Alt) sobre la actividad regulatoria, útil en estudios de asociación genómica.
- Clasificación de elementos de desarrollo frente a housekeeping en *Drosophila*: el checkpoint DeepSTARR predice ambas tareas (Pearson 0.7193 y 0.7744 en ajuste fino), útil para anotación funcional de regiones no codificantes.
- Evaluación multi-condición en plantas: el checkpoint `jores_multicondition` predice cinco condiciones (frío 0.822, oscuro 0.887, luz 0.873, cálido 0.853, maíz 0.770), útil para estudiar respuestas ambientales.
- Prototipado rápido sin el transformer completo: al omitir el transformer de AlphaGenome, se puede ejecutar inferencia sobre secuencias cortas con menor coste computacional, adecuado para iteración en pipelines de investigación.
- Reproducción de benchmarks: los checkpoints permiten reproducir las métricas publicadas (p. ej. Pearson 0.9195 en K562 de Gosai con chr7+13) para validar pipelines propios.

## Benchmarks y rendimiento

Resultados de Pearson r en test (checkpoints PyTorch):

| Checkpoint | Tarea | Congelado | Ajuste fino |
|---|---|---|---|
| `mpra_K562` | lentiMPRA K562 | 0.8580 | 0.8785 |
| `mpra_HepG2` | lentiMPRA HepG2 | 0.8688 | 0.8876 |
| `mpra_WTC11` | lentiMPRA WTC11 | 0.8278 | 0.8344 |
| `starrseq_drosophila` | DeepSTARR (dev + hk) | 0.6184 | 0.7468 |
| `jores_multicondition` | MPRA plantas (5 cond.) | — | 0.841 |

Resultados JAX (Jores 2021, STARR-seq en plantas):

| Tejido | Modo | Sonda (stage1) | Ajuste fino (stage2) |
|---|---|---|---|
| leaf | combined | 0.7821 | 0.8899 |
| leaf | enhancer | 0.7660 | 0.8749 |
| leaf | promoter_only | 0.6876 | 0.7802 |
| proto | combined | 0.7884 | 0.8795 |
| proto | enhancer | 0.6870 | 0.8036 |
| proto | promoter_only | 0.7015 | 0.7683 |

Resultados JAX (Agarwal et al., `mpra-<cell>-optimal`, cola corregida):

| Checkpoint | Tarea | Sonda (stage1) | Ajuste fino (stage2) |
|---|---|---|---|
| `mpra-HepG2-optimal` | lentiMPRA HepG2 | 0.8643 | 0.8885 |
| `mpra-K562-optimal` | lentiMPRA K562 | 0.8555 | 0.8801 |
| `mpra-WTC11-optimal` | lentiMPRA WTC11 | 0.8299 | 0.8403 |

Resultados JAX (Gosai et al., Pearson medio por célula):

| Panel | Sonda (S1) | Ajuste fino (S2) |
|---|---|---|
| Genomic Reference | 0.877 | 0.910 |
| High-Activity Designed | 0.709 | 0.776 |
| SNV Effects (Ref−Alt) | 0.364 | 0.400 |

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; el repositorio ocupa 12 GB, pero no se desglosa el tamaño por checkpoint ni el consumo en inferencia.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga mediante la librería `alphagenome-ft-mpra` (`pip install git+https://github.com/Al-Murphy/alphagenome_FT_MPRA`), con soporte JAX (Haiku) y PyTorch; requiere descargar los pesos base `google/alphagenome-all-folds` con acceso restringido y autenticación previa (`huggingface-cli login`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AlphaGenome Encoder FT MPRA | Codificador + cabeza de regresión | no disponible | Pearson hasta 0.89 en lentiMPRA | Términos AlphaGenome (no comercial) | Hugging Face, acceso a pesos base restringido |
| AlphaGenome completo | Transformer de genómica regulatoria | no disponible | no disponible | Términos AlphaGenome | Hugging Face (`google/alphagenome-all-folds`) |
| DeepSTARR | Modelo específico de STARR-seq en *Drosophila* | no disponible | no disponible en esta ficha | no disponible | Repositorio original |
| lentiMPRA (Agarwal et al.) | Modelos de referencia del benchmark | no disponible | no disponible en esta ficha | no disponible | Publicación original |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos son derivados de AlphaGenome y quedan sujetos a los términos de Google DeepMind, incluida la restricción a uso no comercial. Solo el código de ajuste fino es Apache-2.0.
- Requiere acceso a los pesos base `google/alphagenome-all-folds`, que están restringidos y exigen aceptar términos y autenticarse.
- Las entradas son construcciones de reportero completas, no secuencias genómicas desnudas; cada checkpoint espera la construcción con la que fue entrenado (cola de 51 pb en lentiMPRA, adaptadores de librería en DeepSTARR, enhancer 35S + promotor núcleo + 5′ UTR + código de barras en plantas).
- Las dos colas de lentiMPRA no son intercambiables y los checkpoints JAX y PyTorch usan colas distintas; usar la cola incorrecta invalida las predicciones.
- El `stage1` de plantas es una sonda ridge, no un modelo: no contiene pesos del codificador y usa características del codificador preentrenado sin modificar.
- La anchura de la cabeza en plantas varía por célula (4096 / 2048 / 1024) y debe leerse del `config.json`; no se debe asumir un valor por defecto.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada; al ser un modelo de regresión genómica, el riesgo relevante es la extrapolación fuera de las distribuciones de entrenamiento.
- Limitaciones de contexto e idioma: no aplica en el sentido habitual; el modelo no procesa texto ni lenguajes naturales.
- Para producción: verificar la versión de cola y el checkpoint adecuado a la tarea, y validar las predicciones contra datos experimentales antes de uso downstream.

## Enlaces

- Hugging Face: https://huggingface.co/Al-Murphy/alphagenome-encoder-ft
- Repositorio de código: https://github.com/Al-Murphy/alphagenome_FT_MPRA
- Documentación de pesos: https://github.com/Al-Murphy/alphagenome_FT_MPRA/blob/main/docs/model_weights.md
- Términos del modelo AlphaGenome: https://deepmind.google.com/science/alphagenome/model-terms
- Pesos base AlphaGenome: https://huggingface.co/google/alphagenome-all-folds
