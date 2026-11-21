# MannasAI/pratibha-axon

## Resumen

AXON (Axis-factorized Operator Network) es un modelo fundacional de electroencefalografía (EEG) desarrollado por MannasAI. Se trata de un encoder transformer de 118,6 millones de parámetros preentrenado mediante enmascaramiento autoencoder (masked autoencoding) sobre señales EEG, con el objetivo de servir como extractor de características genérico para tareas de neurociencia y interfaces cerebro-computadora (BCI). El modelo está integrado en la librería braindecode 2.0 y posteriores.

La innovación principal reside en su mecanismo de atención anisotrópica: en lugar de aplicar atención densa sobre todos los tokens, cada capa ejecuta dos rutas de atención en paralelo, una temporal (cada token atiende a su propio electrodo a lo largo del tiempo) y otra espacial (cada token atiende a todos los electrodos en el mismo paso temporal), combinadas mediante una compuerta por token. Esta factorización reduce el coste computacional y respeta la estructura de rejilla electrodo-por-tiempo inherente a las señales EEG.

El modelo es relevante porque ocupa el primer puesto entre 18 modelos en NeuralBench, el benchmark abierto de EEG de Meta FAIR, con el mejor rango medio (3,74) sobre 34 tareas. Su licencia Apache-2.0 y su integración en braindecode facilitan su adopción tanto en investigación como en desarrollo de productos BCI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder con atención anisotrópica factorizada en ejes temporal y espacial |
| Parametros totales | 118.629.850 (encoder 118,56M + cabeza por defecto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana mínima de 200 muestras (1 s a 200 Hz); parches de 1 s con paso de 0,9 s; sin límite máximo documentado |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de señales EEG, no de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Frecuencia de muestreo | 200 Hz |
| Canales | cualquier número y orden, cada uno con posición 3D |
| Embedding de salida | 512 dimensiones (pooled) |
| Tamaño del repo | 0,5 GB |

## Arquitectura y entrenamiento

AXON es un transformer encoder diseñado específicamente para señales EEG. Cada ventana de registro se divide en tokens, uno por electrodo y por parche de un segundo, formando una rejilla de electrodos por pasos temporales. En cada capa se ejecutan dos rutas de atención en paralelo: una temporal, donde cada token atiende a su propio electrodo a través del tiempo, y otra espacial, donde cada token atiende a todos los electrodos en el mismo paso temporal. Una compuerta por token mezcla ambas rutas. El modelo entrega un embedding pooled de 512 dimensiones y tokens con forma (batch, n_chans, n_patches, 512).

El preentrenamiento se realizó con enmascaramiento autoencoder sobre ventanas no solapadas de 10 segundos, con preprocesado consistente en remuestreo a 200 Hz, filtro notch 50/60 Hz, paso banda 0,5–99,5 Hz, z-score por canal y recorte a ±15σ. El objetivo combina L1 sobre parches enmascarados (55% de enmascaramiento en bloques espacio-temporales) más una pérdida auxiliar de reconstrucción pooled con peso 0,5, usando un decodificador denso de 4 capas que no forma parte del modelo publicado. La optimización empleó AdamW (β = 0,9/0,95, weight decay 0,05), LR pico 2,4e-4 con decaimiento coseno, batch de 4.096, bfloat16 y 20 épocas; el checkpoint publicado corresponde a la época 10. Se aplicó aumento de datos con token dropout de 0,3 y ruido en posiciones de electrodos con σ = 0,25 cm. Las posiciones de electrodos durante el preentrenamiento provinieron del montaje `standard_1020` de MNE.

## Capacidades

- Extracción de características EEG: genera embeddings pooled de 512 dimensiones y representaciones por token a partir de señales crudas.
- Clasificación downstream mediante linear probing o fine-tuning: la cabeza de clasificación no está preentrenada y debe configurarse con `n_outputs`.
- Soporte de cualquier montaje y orden de canales, siempre que cada electrodo tenga una posición 3D.
- Invariancia a escala: cada canal se normaliza con z-score dentro de la ventana, por lo que voltios y microvoltios producen la misma salida.
- Procesamiento de ventanas de al menos 1 segundo a 200 Hz.
- No soporta tool calling, function calling, agentes, generación de texto ni capacidades multimodales: es un modelo de extracción de características para señales neuronales.

## Casos de uso

- Interfaces cerebro-computadora basadas en SSVEP: AXON alcanza 96,7% de precisión balanceada en el benchmark de Tsinghua, el mejor resultado entre 18 modelos, lo que lo hace adecuado para sistemas de selección de comandos por mirada.
- Clasificación de imaginación motora en rehabilitación: con 66,2% de precisión balanceada en el dataset de Stieger 2021, puede integrarse en sistemas de neurorrehabilitación que decodifican intención de movimiento.
- Detección de potenciales P300 en paradigmas de atención: útil en sistemas de escritura BCI y evaluación cognitiva, con 65,5% de precisión balanceada.
- Extracción de características para pipelines de investigación en neurociencia: el modelo sirve como extractor congelado para linear probing sobre datasets propios, reduciendo la necesidad de entrenar modelos desde cero.
- Análisis clínico de EEG: aunque su rendimiento en detección de crisis epilépticas es moderado (73,6%, puesto 15 de 18), puede emplearse como representación base combinada con clasificadores específicos.
- Procesamiento de señales con montajes heterogéneos: al aceptar cualquier número y orden de canales con posición 3D, es adecuado para datos de distintos laboratorios y dispositivos sin reentrenamiento del encoder.
- Desarrollo de productos BCI en producción: la licencia Apache-2.0 y la integración en braindecode permiten su despliegue comercial sin restricciones de licencia.

## Benchmarks y rendimiento

NeuralBench (34 tareas EEG, 18 modelos), rango medio de AXON: 3,74 (1.º de 18), con 9 primeros puestos y 20 top-3.

| Categoría | Tarea | Dataset | Métrica | AXON | Rango | Mejor otro modelo |
|---|---|---|---|---|---|---|
| BCI | SSVEP | Tsinghua benchmark | Bal. acc. (%) | 96,7 ± 0,9 | 1 / 18 | LaBraM 96,5 |
| BCI | c-VEP | Thielen 2021 | Bal. acc. (%) | 84,3 ± 1,5 | 4 / 18 | LaBraM 87,6 |
| BCI | P300 | Schreuder 2010 | Bal. acc. (%) | 65,5 ± 0,7 | 4 / 18 | CTNet 67,4 |
| BCI | Motor imagery | Stieger 2021 | Bal. acc. (%) | 66,2 ± 1,1 | 2 / 18 | REVE 68,0 |
| BCI | Motor execution | Srisrisawang 2024 | Bal. acc. (%) | 56,0 ± 0,3 | 2 / 18 | REVE 58,8 |
| BCI | Mental imagery | Scherer 2015 | Bal. acc. (%) | 26,4 ± 1,3 | 6 / 18 | ShallowFBCSPNet 33,1 |
| Clínica | Seizure | Dan 2023 | Bal. acc. (%) | 73,6 ± 0,7 | 15 / 18 | BDTCN 85,5 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 118,6M de parámetros en fp32 el peso de los pesos ronda los 0,47 GB, y en bfloat16 unos 0,24 GB, sin contar activaciones.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer con al menos 4 GB de VRAM debería poder ejecutar inferencia en precisión reducida.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060 o superiores, aunque el dato no está confirmado en la información disponible.
- Opciones de despliegue: braindecode 2.0 o posterior con el extra `[hub]` (`pip install "braindecode[hub]>=2.0"`), sobre PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Rango medio NeuralBench | N.º de 1.º puestos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AXON | Fundacional | 3,74 | 9 | Apache-2.0 | Hugging Face + braindecode |
| REVE | Fundacional | 5,06 | 7 | no disponible | no disponible |
| LaBraM | Fundacional | 5,26 | 3 | no disponible | no disponible |
| LUNA | Fundacional | 6,53 | 1 | no disponible | no disponible |
| CBraMod | Fundacional | 7,06 | 2 | no disponible | no disponible |

AXON lidera el rango medio del benchmark, aunque REVE y LaBraM obtienen mejores resultados en tareas concretas como c-VEP (LaBraM 87,6 frente a 84,3) y ejecución motora (REVE 58,8 frente a 56,0). Los datos de licencia y disponibilidad de los modelos comparables no están incluidos en la información proporcionada.

## Limitaciones y advertencias

- La cabeza de clasificación no está preentrenada: requiere configurar `n_outputs` y entrenarla, ya sea con linear probing o fine-tuning.
- El rendimiento en detección de crisis epilépticas es bajo en comparación con modelos específicos (puesto 15 de 18, 73,6% frente a 85,5% de BDTCN), por lo que no es adecuado como solución clínica directa sin validación adicional.
- El rendimiento en imaginación mental es limitado (26,4%, por debajo de ShallowFBCSPNet con 33,1%).
- Requiere posiciones 3D de los electrodos; los canales sin posición se buscan por nombre en los montajes 10-20/10-05 de MNE, lo que puede fallar con montajes no estándar.
- Existe una discrepancia documentada de aproximadamente 5 cm entre las coordenadas de preentrenamiento y las de evaluación (convención de coordenadas de cabeza de MNE); los números reportados usan la convención de cabeza.
- El checkpoint publicado corresponde a la época 10 de 20, no al modelo completamente entrenado.
- No se documentan sesgos específicos ni tasas de alucinación (no aplica a un modelo de señales).
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales documentadas.
- No hay información sobre cuantizaciones soportadas ni sobre latencia en producción.

## Enlaces

- Hugging Face: https://huggingface.co/MannasAI/pratibha-axon
- Paper: https://arxiv.org/abs/2609.08788 (Adaptive Anisotropic Attention for Axis-Structured Signals)
- Documentación de braindecode para AXON: https://braindecode.org/dev/generated/braindecode.models.AXON.html
- Repositorio braindecode: https://github.com/braindecode/braindecode
- NeuralBench (Meta FAIR): https://facebookresearch.github.io/neuroai/neuralbench/index.html
