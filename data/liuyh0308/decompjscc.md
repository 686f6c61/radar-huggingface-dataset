# liuyh0308/DecompJSCC

## Resumen

DecompJSCC es un conjunto de pesos de investigación (checkpoints) para transmisión de imágenes mediante codificación conjunta de fuente y canal (JSCC, *joint source-channel coding*). No es un modelo de lenguaje ni un modelo generativo de propósito general: es el artefacto reproducible de un trabajo académico, publicado por el autor liuyh0308, que debe utilizarse junto con el repositorio de código DecompJSCC en GitHub. El repositorio de Hugging Face contiene 20 pesos de resultados, 6 pesos de inicialización de preentrenamiento y un archivo de instrucciones.

El interés técnico reside en que implementa una cadena de entrenamiento por fases (fixed, rate_warmup, rate_joint, snr_warmup, joint, refine) sobre una arquitectura de tipo SwinJSCC, con modelos específicos para tres esquemas conjuntos, cuatro métodos de CBR fijo en tres niveles cada uno, un modelo de ablación y cuatro modelos adicionales de la biblioteca ADJSCC/SNR-EQ de cinco niveles. La transmisión de imágenes sobre canales ruidosos con compresión adaptativa es un problema relevante en comunicaciones, y disponer de checkpoints intermedios y finales facilita la reproducibilidad y la comparación de métodos.

La ficha se limita a lo que declara la model card: no hay información publicada sobre licencia, idiomas, cuantización, contexto ni benchmarks en el material disponible, por lo que esos campos se marcan como no disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SwinJSCC (según la cadena de fases descrita: fixed -> rate_warmup -> rate_joint -> snr_warmup -> joint -> refine); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de texto; opera sobre imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | .pth (PyTorch); el repositorio incluye también .gitattributes para Git LFS |

## Arquitectura y entrenamiento

La model card indica que los checkpoints se usan con el repositorio de código DecompJSCC y que la arquitectura de partida es SwinJSCC en su variante fija. Sobre esa base se encadena un entrenamiento por fases: rate_warmup, rate_joint, snr_warmup, joint y refine, hasta el modelo final `weights/decompjscc_awgn.pth`. El repositorio `pretraining/` guarda el mejor modelo de cada fase, lo que permite reproducir la progresión del entrenamiento y analizar el efecto de cada etapa.

Los pesos de `weights/` cubren tres modelos conjuntos, cuatro métodos de CBR fijo con tres niveles entrenados de forma independiente por nivel, un modelo de ablación y cuatro modelos adicionales de la biblioteca ADJSCC/SNR-EQ de cinco niveles. No se especifican en la información disponible el número de tokens, la composición del dataset ni si hubo RLHF o DPO; el dataset se distribuye por separado en el repositorio `liuyh0308/DecompJSCC-datasets`. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal, que no aplican al dominio de codificación de imágenes.

## Capacidades

- Codificación conjunta de fuente y canal para transmisión de imágenes sobre canales con ruido (el modelo final se denomina `decompjscc_awgn`, lo que sugiere AWGN como canal de referencia).
- Variantes con tasa de compresión fija (CBR) en tres niveles por método, entrenadas de forma independiente.
- Modelos conjuntos con adaptación a la relación señal-ruido, según la fase snr_warmup y la biblioteca SNR-EQ.
- Checkpoints intermedios de preentrenamiento para reproducir la cadena de fases y realizar análisis de ablación.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo.

## Casos de uso

- Reproducción de resultados académicos: cargar `weights/decompjscc_awgn.pth` y los checkpoints de `pretraining/` junto con el repositorio de código para replicar las cifras del artículo sobre el dataset DecompJSCC-datasets.
- Comparación de esquemas de codificación conjunta: los tres modelos conjuntos y los cuatro métodos de CBR fijo permiten contrastar estrategias de asignación de tasa bajo las mismas condiciones de canal.
- Estudio de adaptación a SNR: la biblioteca ADJSCC/SNR-EQ de cinco niveles y las fases snr_warmup permiten analizar el comportamiento del modelo en distintos regímenes de ruido.
- Análisis de ablación: el modelo de ablación incluido sirve para aislar la contribución de componentes concretos del diseño, tal como se plantea en el trabajo.
- Investigación en comunicaciones: uso como línea base para nuevos métodos de JSCC en transmisión de imágenes, aprovechando la separación entre preentrenamiento por fases y modelos finales.
- Docencia y formación: la cadena fixed -> rate_warmup -> rate_joint -> snr_warmup -> joint -> refine es un ejemplo didáctico de entrenamiento progresivo con objetivos que se refinan por etapas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamaño de imagen y de la configuración del modelo SwinJSCC, que no se detalla.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el repositorio ocupa 28,4 GB, pero ese tamaño corresponde al conjunto de checkpoints, no a un único modelo en memoria.
- Opciones de despliegue: el flujo previsto es PyTorch con el repositorio DecompJSCC (`python analyze.py resources download` y `python analyze.py resources validate --check-paper-resources --sha256`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DecompJSCC | JSCC para imágenes (SwinJSCC) | no disponible | no aplica | no disponible | Pesos en Hugging Face + código en GitHub |
| SwinJSCC | JSCC para imágenes (línea base) | no disponible | no aplica | no disponible | Referenciado como fase inicial del entrenamiento |
| ADJSCC / SNR-EQ | JSCC con adaptación a SNR | no disponible | no aplica | no disponible | Incluido parcialmente como biblioteca de cinco niveles |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo de propósito general: no genera texto, código ni realiza tareas de razonamiento; su uso está restringido a la transmisión de imágenes con el código del autor.
- La licencia no está declarada, lo que impide confirmar si se permite el uso comercial; conviene contactar con el autor antes de cualquier uso productivo.
- Los checkpoints están ligados a una versión concreta del repositorio de código; cambios en el código pueden romper la compatibilidad de carga.
- El dataset se distribuye en un repositorio separado y no se documentan su composición ni sus condiciones de uso.
- No hay información sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas, que no aplican al dominio, pero tampoco hay evaluación de robustez fuera de las condiciones de canal del artículo.
- El tamaño del repositorio (28,4 GB) exige espacio en disco y una descarga considerable; se recomienda validar la integridad con `--sha256` según las instrucciones del autor.
- Los pesos son artefactos de investigación; no se documenta ningún proceso de endurecimiento para producción.

## Enlaces

- Hugging Face: https://huggingface.co/liuyh0308/DecompJSCC
- Repositorio de código: https://github.com/Liuyh0308/DecompJSCC
- Dataset: https://huggingface.co/datasets/liuyh0308/DecompJSCC-datasets
