# akshatzalte/chemeleon-rxn

## Resumen

CheMeleon-Rxn es un codificador D-MPNN preentrenado de Chemprop que opera sobre grafos condensados de reacción (Condensed-Graph-of-Reaction, CGR). Convierte un SMILES de reacción con mapeo atómico en un embedding de reacción de 2048 dimensiones, que después se ajusta fino sobre datos de propiedades de reacción como barreras de activación, energías de reacción, rendimientos o constantes de velocidad. Lo desarrolla Akshat S. Zalte (MIT) como reentrenamiento independiente de la receta del artículo asociado, publicado en ChemRxiv en 2026.

El modelo es relevante porque traslada el paradigma de los modelos fundacionales con preentrenamiento autosupervisado al dominio de la química de reacciones, donde los datos etiquetados son escasos y caros de obtener. En lugar de entrenar desde cero con pocos cientos de reacciones, el usuario parte de un codificador ya expuesto a aproximadamente 2 millones de reacciones mapeadas y solo necesita ajustar la cabeza de predicción.

Arquitectura: `BondMessagePassing` de Chemprop 2.3.1 con agregación por media, tamaño oculto 2048 y profundidad 6, con un total de 8,9 millones de parámetros. No es un modelo de lenguaje: no genera texto ni mantiene conversaciones, sino que produce representaciones vectoriales de reacciones para regresión supervisada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Chemprop `BondMessagePassing` (D-MPNN) sobre grafo condensado de reacción, agregación por media |
| Parametros totales | 8,9 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo sobre grafos moleculares, no sobre secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (entrada: SMILES de reacción con mapeo atómico) |
| Licencia | MIT |
| Formato de pesos | checkpoint PyTorch (`chemeleon_rxn_mp.pt`), compatible con el formato de CheMeleon (`chemeleon_mp.pt`) |

## Arquitectura y entrenamiento

El codificador es un D-MPNN (`BondMessagePassing`) con tamaño oculto 2048, 6 capas de paso de mensajes y activación LeakyReLU. La entrada se featuriza con `CondensedGraphOfReactionFeaturizer` en modo `REAC_DIFF`, que colapsa reactivos y productos en un único grafo y codifica la diferencia de estados como atributo de cada átomo; se conservan los hidrógenos explícitos (`keep_h=True`). La salida es un embedding de reacción de 2048 dimensiones.

El preentrenamiento es autosupervisado: regresión sobre descriptores de Mordred de la reacción, con el objetivo compuesto `[Σ reactivos ‖ (Σ productos − Σ reactivos)]` y enmascaramiento aleatorio del 70 % de las dianas en cada paso. El corpus consta de aproximadamente 2 millones de reacciones con mapeo atómico, extraídas principalmente de Pistachio (base de datos comercial de NextMove Software), por lo que los datos de entrenamiento no pueden publicarse; el resto proviene de conjuntos públicos. El ajuste fino debe hacerse con tasa de aprendizaje plana de 1e-4 (`init_lr = max_lr = final_lr = 1e-4`): el schedule Noam por defecto de Chemprop, que alcanza 1e-3, puede destruir los pesos preentrenados.

## Capacidades

- Generación de embeddings de reacción de 2048 dimensiones a partir de SMILES con mapeo atómico.
- Regresión de propiedades de reacción tras ajuste fino: barreras de activación, energías de reacción, rendimientos, constantes de velocidad y otras magnitudes escalares.
- Aprendizaje en regímenes de pocos datos gracias al preentrenamiento sobre ~2 M de reacciones.
- Integración nativa con el ecosistema Chemprop 2.3.1 (`MPNN`, `ReactionDatapoint`, `ReactionDataset`, escalado de dianas).
- No soporta tool calling, agentes, razonamiento multi-step ni generación de texto.
- No dispone de capacidades multilingües, visión ni audio.

## Casos de uso

- Predicción de barreras de activación: ajuste fino sobre un conjunto propio de reacciones elementales para estimar energías de activación y acelerar el cribado de rutas en química computacional.
- Predicción de rendimientos de reacción: entrenamiento con datos de laboratorio para priorizar condiciones experimentales antes de ejecutar la síntesis.
- Estimación de energías de reacción: regresión sobre diferencias energéticas entre reactivos y productos para filtrar candidatos termodinámicamente viables.
- Predicción de constantes de velocidad: ajuste sobre cinéticas medidas para alimentar modelos cinéticos detallados en ingeniería de reacciones.
- Cribado virtual de reacciones en descubrimiento de fármacos: uso del embedding como representación previa en pipelines de selección de transformaciones sintéticas.
- Modelado de química medioambiental y atmosférica: predicción de rutas de degradación y velocidades de reacción en fase gas o acuosa, aprovechando el preentrenamiento sobre reacciones diversas.
- Punto de partida para modelos de propiedad de reacción en entornos con pocos datos etiquetados, donde entrenar desde cero con un D-MPNN ofrece un rendimiento inferior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que el rendimiento aguas abajo es estadísticamente comparable al reportado en el artículo asociado, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los 8,9 M de parámetros en fp32; el cuello de botella es el tamaño del lote y la longitud de las reacciones, no el modelo.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema.
- Cabe holgadamente en GPU de consumo, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: Chemprop 2.3.1 con PyTorch; no aplica vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CheMeleon-Rxn | 8,9 M | SMILES de reacción mapeado (CGR) | no aplica | MIT | Hugging Face |
| CheMeleon (Burns et al., 2026) | no disponible | SMILES molecular | no aplica | no disponible | Hugging Face / código |
| D-MPNN de Chemprop entrenado desde cero | configurable | SMILES molecular o de reacción | no aplica | MIT (Chemprop) | Código abierto |
| Modelos de lenguaje químico (p. ej. basados en transformers sobre SMILES) | cientos de millones a miles de millones | texto/SMILES | miles de tokens | variable | variable |

La comparación con modelos de lenguaje químico no es directa: CheMeleon-Rxn no genera secuencias, solo produce embeddings para regresión. Frente a un D-MPNN entrenado desde cero, la ventaja es el preentrenamiento sobre ~2 M de reacciones; frente a CheMeleon original, la diferencia es que aquí el grafo es de reacción (CGR) en lugar de molecular.

## Limitaciones y advertencias

- Las reacciones deben estar con mapeo atómico; sin mapeo el modelo no puede procesarlas correctamente.
- La featurización debe coincidir exactamente con la del preentrenamiento: modo `REAC_DIFF` y `keep_h=True`.
- El ajuste fino con el schedule Noam por defecto de Chemprop puede destruir los pesos preentrenados; es obligatorio usar tasa plana de 1e-4.
- Los datos de preentrenamiento no son públicos (Pistachio es comercial), lo que limita la reproducibilidad completa y la auditoría del corpus.
- Riesgo de sesgo hacia la distribución de reacciones de Pistachio: el rendimiento puede degradarse en clases de reacción poco representadas.
- Riesgo de alucinación en el sentido de predicciones fuera de dominio sin señal de incertidumbre calibrada; conviene validar con conjuntos de test representativos.
- Licencia MIT para el checkpoint, pero la licencia de los datos subyacentes (Pistachio) no se transfiere; revisar términos antes de uso comercial en dominios sensibles.
- No es un modelo de propósito general: no responde preguntas, no genera texto y no debe presentarse como asistente conversacional.

## Enlaces

- Hugging Face: https://huggingface.co/akshatzalte/chemeleon-rxn
- Código: https://github.com/MSDLLCpapers/chemeleon-rxn
- Artículo: https://chemrxiv.org/doi/full/10.26434/chemrxiv.15008692
- DOI: https://doi.org/10.26434/chemrxiv.15008692
- Artículo de CheMeleon: https://doi.org/10.1021/acs.jcim.6c01546
