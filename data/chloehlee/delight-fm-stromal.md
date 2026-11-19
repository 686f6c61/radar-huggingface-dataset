# chloehlee/delight-fm-stromal

## Resumen

DELIGHT-FM Stromal es un modelo fundacional de extracción de características para datos de expresión génica de célula única (scRNA-seq), desarrollado por chloehlee como parte de la familia DELIGHT-FM. El modelo está especializado en el compartimento estromal de tejidos humanos y se distribuye con licencia Apache 2.0. Su propósito es servir como base preentrenada para tareas downstream de clasificación y regresión celular, así como para generar embeddings de células.

La arquitectura se basa en `geneformer_mamba`, una combinación de tokenización estilo Geneformer con capas de espacio de estados Mamba, lo que permite procesar secuencias de hasta 2048 tokens génicos con coste lineal en lugar de cuadrático. El modelo tiene 33.935.989 parámetros totales y fue entrenado sobre 206.814 células con 18.253 características génicas de referencia.

El checkpoint corresponde a la época fundacional 6.5 y preserva las cabezas de preentrenamiento (masked-gene modeling, clasificación de clústeres y tipo celular amplio, supervisión de escala de edad y cabezas adversarias de lote/dominio). Es relevante para investigadores que necesiten un punto de partida reproducible para tareas de biología computacional sin entrenar desde cero, aunque su naturaleza altamente especializada y su reducido tamaño lo alejan de los LLM de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | geneformer_mamba (tokenización Geneformer + capas Mamba/SSM) |
| Parametros totales | 33.935.989 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens génicos |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32/fp16) |
| Idiomas soportados | no disponible (no aplica: entrada es expresión génica, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida denominada `geneformer_mamba`: los perfiles de expresión génica se tokenizan siguiendo el esquema de Geneformer (IDs de genes más valores de expresión z-score por gen, recortados a ±5) y se procesan mediante capas de espacio de estados (Mamba), que ofrecen complejidad lineal frente a la cuadrática de la atención estándar. La entrada combina IDs de tokens génicos, expresión log-normalizada z-score en float32 y máscaras HVG alineadas. Es imprescindible usar los ficheros de estadísticas de referencia y tokenización de `resources/`, ya que la tokenización genérica de Geneformer no es intercambiable.

El preentrenamiento combina modelado de genes enmascarados (masked gene modeling) con supervisión auxiliar: clasificación de clústeres celulares y de tipo celular amplio, una escala de edad aprendida y cabezas adversarias de lote y dominio para mitigar el efecto de batch. El subconjunto de entrenamiento comprende 206.814 células y el de validación/test 60.323 células, con 18.253 características génicas de referencia. La selección del checkpoint maximizó la media de macro F1 de clúster, macro F1 de localización y correlación de Pearson con la edad, excluyendo tareas de clase única. No se especifica en la información disponible el número total de tokens de entrenamiento ni si se aplicaron RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Extracción de embeddings de células individuales a partir de perfiles de expresión génica scRNA-seq.
- Clasificación celular downstream (tipo celular, clúster, localización tisular) mediante fine-tuning de una nueva cabeza sobre el backbone preentrenado.
- Regresión downstream, incluida la predicción de edad (con el compañero `delight-fm-stromal-age`, que incorpora una cabeza de regresión log2(PCW) calibrada).
- Modelado de genes enmascarados: reconstrucción/predicción de expresión de genes ocultos.
- Perturbaciones génicas firmadas (signed edits) para medir la respuesta del modelo a cambios de expresión, con reconstrucción aproximada de abundancia tras el recorte z-score.
- Transferencia de todas las cabezas preentrenadas preservadas en la exportación fundacional (clúster, tipo celular amplio, escala de edad, cabezas adversarias).
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües de texto: es un modelo de dominio biológico.

## Casos de uso

- Anotación automática de tipos celulares estromales: fine-tuning de una cabeza de clasificación sobre el backbone para etiquetar células de tejido estromal en nuevos estudios scRNA-seq, aprovechando las 18.253 características génicas de referencia.
- Predicción de edad biológica tisular: usando el compañero `delight-fm-stromal-age`, estimar la edad del donante a partir del perfil de expresión estromal, útil en estudios de envejecimiento.
- Búsqueda y agrupamiento de células por similitud: extracción de embeddings para clustering no supervisado y recuperación de vecinos en atlas celulares, con contexto de 2048 tokens que permite cubrir perfiles génicos extensos.
- Análisis de perturbaciones in silico: simulación de ediciones génicas firmadas para explorar respuestas de expresión en células estromales, con la advertencia de que miden respuesta del modelo y no efectos causales establecidos.
- Integración de datos multi-estudio: las cabezas adversarias de lote/dominio facilitan la generación de representaciones robustas al batch para armonizar datasets de distintos donantes o centros.
- Detección de subtipos estromales asociados a enfermedad: fine-tuning con particiones train/validation/test disjuntas por donante para clasificar subtipos y evaluar generalización en cohortes externas.
- Generación de features para modelos aguas abajo: uso del modelo como extractor congelado de embeddings que alimenten clasificadores ligeros o análisis de trayectorias celulares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la selección del checkpoint se basó en la media de macro F1 de clúster, macro F1 de localización y correlación de Pearson con la edad sobre el subconjunto de validación, pero no se proporcionan los valores numéricos en la información disponible (se remite a `metadata/selection.json` en el repositorio). Se advierte además que el subconjunto de test original participó en la selección del modelo y no constituye un benchmark externo intacto.

## Requisitos de hardware

- VRAM estimada para inferencia: con 33,9 M de parámetros, el modelo es muy ligero; en fp32 ocupa aproximadamente 136 MB de pesos, y en fp16 unos 68 MB. La memoria dominante proviene de las activaciones y del contexto de 2048 tokens, no de los pesos.
- GPU recomendadas: cualquier GPU con soporte CUDA 11.8 y extensión Mamba compilada; una RTX 3090, RTX 4090, A100 o H100 son más que suficientes. También es viable en GPUs de gama media e incluso en CPU para inferencia puntual, aunque las extensiones Mamba compiladas requieren el stack PyTorch/CUDA 11.8 probado.
- Cabe holgadamente en GPUs de consumo: RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4080 y RTX 4090.
- Opciones de despliegue: `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)`; requiere Python 3.10, el stack PyTorch/CUDA 11.8 y extensiones Mamba compiladas según `requirements.txt`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este dominio).
- Latencia y throughput: no disponibles en la información proporcionada.
- Reproducibilidad: se recomienda fijar un commit SHA con `revision=...` y revisar el código personalizado antes de habilitar `trust_remote_code`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DELIGHT-FM Stromal | 33,9 M | 2048 tokens génicos | geneformer_mamba | Apache 2.0 | Hugging Face |
| DELIGHT-FM (base) | no disponible | 2048 (presumible) | geneformer_mamba | Apache 2.0 | Hugging Face |
| DELIGHT-FM Epi-ileum | no disponible | 2048 (presumible) | geneformer_mamba | Apache 2.0 | Hugging Face |
| DELIGHT-FM Immune | no disponible | 2048 (presumible) | geneformer_mamba | Apache 2.0 | Hugging Face |
| Geneformer (referencia de tokenización) | no disponible | no disponible | transformer | no disponible | no disponible |

Las alternativas de la misma familia (DELIGHT-FM base, Epi-ileum, Epi-colon, Immune) comparten arquitectura y licencia pero se especializan en distintos compartimentos celulares; la elección depende del tejido y del tipo celular de interés. No se dispone de datos de rendimiento comparativo entre ellas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de dominio muy específico: solo acepta perfiles de expresión génica scRNA-seq humana con la tokenización y estadísticas de referencia exactas de `resources/`; la tokenización genérica de Geneformer no es válida.
- El checkpoint fundacional no incluye la cabeza final de regresión log2(PCW) ajustada; para predicción de edad o perturbaciones de edad debe usarse `delight-fm-stromal-age`.
- La puntuación auxiliar de PCW del modelo fundacional es una escala de meseta aprendida, no un log2(PCW) calibrado.
- Riesgo de sobreajuste a la selección: el subconjunto de test original participó en la selección del modelo, por lo que no es un benchmark externo intacto; se recomienda evaluar con particiones disjuntas por donante.
- Las perturbaciones miden respuesta del modelo, no efectos causales establecidos experimentalmente; las ediciones firmadas requieren definiciones de dirección justificadas de forma independiente (los nombres de regulones no especifican la dirección del cambio).
- No se distribuyen datasets celulares originales, identificadores de donantes ni predicciones de referencia; el usuario debe aportar sus propios datos y rutas.
- Dependencia de `trust_remote_code=True` y de extensiones Mamba compiladas: revisar el código personalizado y fijar un commit SHA para uso reproducible.
- Posible dependencia del backend de ranking inicial histórico y sensibilidad de los rangos empatados de células inmunes al despacho AVX512 de NumPy; conservar las entradas tokenizadas entre workers.
- No se han validado la ejecución completa en GPU ni el entrenamiento en el contenedor de preparación (solo CPU); los notebooks han sido comprobados localmente pero no ejecutados de extremo a extremo en GPU.
- Restricciones de licencia: los pesos y el código de release son Apache 2.0, pero los assets de referencia y dependencias conservan sus términos originales (ver `docs/THIRD_PARTY_NOTICES.md`).

## Enlaces

- Hugging Face: https://huggingface.co/chloehlee/delight-fm-stromal
- Compañero de edad: https://huggingface.co/chloehlee/delight-fm-stromal-age
- Modelo base DELIGHT-FM: https://huggingface.co/chloehlee/delight-fm
- DELIGHT-FM Epi-ileum: https://huggingface.co/chloehlee/delight-fm-epi-ileum
- DELIGHT-FM Epi-colon: https://huggingface.co/chloehlee/delight-fm-epi-colon
- DELIGHT-FM Immune: https://huggingface.co/chloehlee/delight-fm-immune
- Repositorio GitHub de workflows: https://github.com/ChloeHJ/delight_fm_v1
- Dataset de soporte: https://huggingface.co/datasets/chloehlee/delight_fm_v1-data
- Perfil del autor: https://huggingface.co/chloehlee
