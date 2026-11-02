# gbouras13/modernprost-50M-pssm

## Resumen

ModernProst-50M-PSSM es un modelo de extracción de características para proteínas desarrollado por gbouras13 (Colin Brown, University of Melbourne, autor de phold). Predice, a partir únicamente de la secuencia de aminoácidos, un perfil 3Di de 20 estados y un perfil de 12 estados por residuo, que son las representaciones que utiliza Foldseek para realizar búsquedas estructurales por perfil. El modelo no genera secuencias 3Di discretas: se usa siempre a través de sus cabezas de perfil (softmax), lo que permite búsquedas sensibles a estructura sin necesidad de predecir la estructura 3D completa.

Arquitectónicamente es un encoder de estilo ModernBERT con 24 capas, dimensión oculta 448, 14 cabezas de atención, SwiGLU, atención alternante global/ventana deslizante y adaptadores NOBLE, con dos cabezas lineales de salida (20 clases 3Di y 12 clases de perfil). Tiene 52.555.936 parámetros totales y un contexto máximo de 512 residuos. Se entrenó por destilación (divergencia KL hacia los perfiles objetivo) sobre perfiles Foldseek de estructuras de AlphaFold DB 50, sin etiquetas duras.

Su relevancia actual es práctica: permite sustituir la consulta por estructura en búsquedas Foldseek por perfil con una calidad cercana a la de estructuras reales (0,8810 / 0,6109 / 0,1449 de TP hasta el primer FP en familia/superfamilia/fold sobre SCOPe40), lo que habilita anotación funcional a gran escala desde secuencia sola. La release del 02/11/2026 (perfiles "nng", epoch 6) sustituye a los pesos de julio de 2026, que siguen accesibles con `revision="jul26"`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder estilo ModernBERT (24 capas, hidden 448, 14 cabezas, SwiGLU, atención global/ventana deslizante alternante, adaptadores NOBLE) con dos cabezas lineales |
| Parametros totales | 52.555.936 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 residuos (max length de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de proteínas, no de lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`), más `plddt_head/head.safetensors` para la cabeza opcional de pLDDT |
| Cabeza auxiliar | pLDDT por residuo, 199K parámetros, entrenada sobre el backbone congelado |
| Tamaño del repo | 0,4 GB |

## Arquitectura y entrenamiento

El backbone es un transformer encoder de estilo ModernBERT: 24 capas, dimensión oculta 448, 14 cabezas de atención, activación SwiGLU y un patrón de atención que alterna capas de atención global con capas de ventana deslizante, complementado con adaptadores NOBLE. Sobre la representación del encoder se aplican dos cabezas lineales independientes: una de 20 clases para el alfabeto 3Di (ACDEFGHIKLMNPQRSTVWY) y otra de 12 clases para el perfil de 12 estados (ACDEFGHIKLMN). El modelo no añade tokens BOS/EOS, de modo que la posición *i* de la salida corresponde a la residuo *i* de la entrada.

El entrenamiento es por destilación: la función de pérdida es la divergencia KL (temperatura 1) entre los perfiles predichos y los perfiles objetivo de Foldseek, sin etiquetas duras. El dataset `gbouras13/ModernProst-3di12st-pssm` (release 02/11/2026) contiene 4.309.289 proteínas de entrenamiento y 11.725 de validación, compuestas por representantes de clústeres AFDB50, estructuras predichas de ColabFold / Phold DB y BFVD. Cada estructura de consulta se buscó contra AFDB50 con residuos de pLDDT < 70 enmascarados de forma suave, usando Foldseek (rama `evalue-geomean-minlen`, commit `583229dc`, `--evalue-nn-mode 2`, `--profile-lowconf-members 1`), y los perfiles 3Di y de 12 estados se construyeron a partir de los hits con `result2profile`. El optimizador es NorMuon (lr 6e-4 AdamW / 1e-3 Muon) con decaimiento lineal, warmup de ~500 pasos, batch 192 por dispositivo con acumulación de gradiente 2 (DDP) y semilla 30. El checkpoint seleccionado es el epoch 6 (paso 4.200), elegido tras un barrido de 20 epochs sobre SCOPe40, donde el rendimiento se estabiliza a partir del epoch ~5.

## Capacidades

- Predicción de perfil 3Di de 20 estados por residuo a partir de secuencia de aminoácidos.
- Predicción de perfil de 12 estados por residuo (representación usada por Foldseek).
- Extracción de representaciones por residuo (feature-extraction) para pipelines de búsqueda estructural.
- Predicción opcional de pLDDT por residuo (0-100) mediante una cabeza auxiliar de 199K parámetros que lee todas las capas del encoder.
- Enmascaramiento de residuos de baja confianza: permite poner a cero las columnas de perfil 3Di y 12 estados en residuos con pLDDT predicho por debajo de un umbral (se probaron umbrales 50-70), lo que se corresponde con `lowconfquery` de Foldseek.
- Salida compatible con la escritura de bases de datos de perfil Foldseek (`_profile_ss`, `_profile_ss12`, `_profile`) a través de phold-lib.
- Soporte de batch y padding mediante el tokenizer (`padding=True`, `return_tensors="pt"`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo de proteínas, no un modelo de lenguaje.

## Casos de uso

- Búsqueda estructural a escala de metagenoma: dado un conjunto de secuencias de proteínas sin estructura resuelta, el modelo genera perfiles 3Di y de 12 estados que se indexan como bases de datos Foldseek, permitiendo búsquedas por perfil sin necesidad de predecir la estructura 3D completa.
- Anotación funcional de proteínas hipotéticas: a partir de la secuencia, se generan perfiles que se buscan contra AFDB50 u otras bases de perfiles para transferir familia/superfamilia/fold, con una sensibilidad en SCOPe40 de 0,8810 / 0,6109 / 0,1449 (TP hasta el primer FP).
- Filtrado previo a AlphaFold: usar el pLDDT predicho por la cabeza auxiliar (RMSE 10,77, AUROC 0,948 para pLDDT < 70) para descartar regiones de baja confianza antes de lanzar predicciones estructurales costosas.
- Enriquecimiento de bases de datos de perfiles: generar `_profile_ss` y `_profile_ss12` para genomas o transcriptomas completos mediante phold-lib y desplegarlos en un servidor Foldseek para búsquedas internas.
- Clasificación taxonómica y filogenética asistida por estructura: comparar perfiles predichos de secuencias divergentes contra perfiles de referencia para detectar relaciones remotas que las búsquedas por secuencia (BLAST/MMseqs) no recuperan.
- Integración en pipelines de anotación tipo Bakta/Prokka: añadir una etapa de búsqueda por perfil Foldseek sobre las proteínas predichas para asignar folds a proteínas sin hit en bases de secuencia.
- Detección de dominios con plegamiento novedoso: residuos con perfil de baja confianza y pLDDT bajo pueden señalizar regiones desordenadas o folds sin representación en AFDB50.

## Benchmarks y rendimiento

Evaluación del autor sobre SCOPe40 all-vs-all, sin self-hits, con la métrica de fracción de verdaderos positivos hasta el primer falso positivo (familia / superfamilia / fold), usando Foldseek commit `583229dc`:

| Consulta | default (prof:89) | `--k-score seq:2147483647,prof:82` |
|---|---|---|
| Este modelo (perfiles) | 0,8759 / 0,6089 / 0,1446 | 0,8810 / 0,6109 / 0,1449 |
| Release anterior (jul26) | 0,8749 / 0,6085 / 0,1443 | 0,8786 / 0,6098 / 0,1446 |
| Estructuras reales (consultas de estructura única) | 0,8828 / 0,6144 / 0,1520 | 0,8828 / 0,6144 / 0,1520 |

Validación de la cabeza de pLDDT (18.000 proteínas held-out, 5,16M residuos; etiquetas AFDB / ColabFold / BFVD, mejor paso 26.000):

| RMSE | MAE | Pearson | Pearson por proteína | AUROC pLDDT < 70 | AUROC pLDDT < 50 |
|---|---|---|---|---|---|
| 10,77 | 7,17 | 0,868 | 0,865 | 0,948 | 0,962 |

No se han publicado en la información disponible resultados de benchmarks tipo MMLU, HumanEval o GSM8K, que no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 52,5M parámetros, por lo que en fp32 ocupa aproximadamente 210 MB de pesos y en fp16/bf16 unos 105 MB; con activaciones y batch pequeño el consumo se mantiene por debajo de 1-2 GB. No se han publicado medidas oficiales de VRAM.
- GPU recomendadas: cualquier GPU con al menos ~2 GB de VRAM es suficiente; A100, H100, RTX 4090, RTX 3090, L4 o T4 funcionan sin problema. En CPU también es viable para lotes moderados.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090, etc.), e incluso en iGPU con suficiente memoria compartida para lotes pequeños.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (vía `AutoModel` y `AutoTokenizer`); phold-lib para escribir bases de datos de perfil Foldseek; el modelo no está pensado para servidores de inferencia de texto (vLLM, TGI, llama.cpp, Ollama), ya que no es un modelo generativo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El límite práctico es la longitud máxima de 512 residuos por secuencia y el tamaño del lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ModernProst-50M-PSSM (este) | 52,5M | 512 residuos | Perfiles 3Di (20) y 12 estados + pLDDT opcional | no disponible | HuggingFace, `trust_remote_code=True` |
| gbouras13/modernprost-50M | no disponible | no disponible | Secuencias 3Di / 12 estados por argmax | no disponible | HuggingFace |
| Foldseek (búsqueda por estructura real) | no aplica | no aplica | Búsqueda estructural | código abierto (repo Foldseek) | GitHub, binario |
| ProstT5 (Rostlab) | no disponible en esta información | no disponible | Traducción secuencia ↔ 3Di | no disponible | HuggingFace |

No se dispone en la información proporcionada de datos comparativos de rendimiento frente a ProstT5 u otros predictores de 3Di; la única comparación cuantitativa publicada es contra estructuras reales en SCOPe40 (ver tabla de benchmarks).

## Limitaciones y advertencias

- El modelo debe usarse a través de sus perfiles (softmax de las cabezas), nunca mediante argmax de las secuencias 3Di o de 12 estados; para secuencias argmax el autor remite a `gbouras13/modernprost-50M`.
- Longitud máxima de 512 residuos: proteínas más largas requieren truncado o segmentación, lo que puede degradar la búsqueda por perfil.
- La licencia no está declarada en la información disponible; no se puede asumir uso comercial sin consultar al autor.
- El rendimiento en fold (0,1449 de TP hasta el primer FP) es notablemente inferior al de familia (0,8810) y superfamilia (0,6109); no es adecuado para asignación de fold de alta precisión sin validación adicional.
- El modelo se entrenó con perfiles derivados de AlphaFold DB 50, ColabFold / Phold DB y BFVD; proteínas con folds ausentes de esas bases pueden quedar mal representadas.
- La cabeza de pLDDT es opcional y se entrenó sobre el backbone congelado; su fiabilidad fuera de la distribución de validación (AFDB / ColabFold / BFVD) no está caracterizada.
- Para búsquedas por perfil se recomienda la rama `evalue-geomean-minlen` de Foldseek (commit `583229dc`) con `--k-score seq:2147483647,prof:82`; el umbral por defecto de 89 en esa build pierde sensibilidad.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso, y no tiene capacidades multilingües.
- Riesgo de alucinación en el sentido de perfiles plausibles pero incorrectos en regiones de baja confianza; el enmascaramiento por pLDDT (umbrales 50-70) mitiga parcialmente este efecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gbouras13/modernprost-50M-pssm
- Modelo para secuencias argmax 3Di / 12 estados: https://huggingface.co/gbouras13/modernprost-50M
- Dataset de entrenamiento: https://huggingface.co/datasets/gbouras13/ModernProst-3di12st-pssm
- phold-lib (escritura de bases de datos de perfil Foldseek): https://github.com/gbouras13/phold-lib
- Rama de Foldseek recomendada: https://github.com/Victor-Mihaila/foldseek (rama `evalue-geomean-minlen`, commit `583229dc`)
- Foldseek (repositorio principal): https://github.com/steineggerlab/foldseek
- AlphaFold DB: https://alphafold.ebi.ac.uk/
- SCOPe (conjunto de evaluación): https://scop.berkeley.edu/
