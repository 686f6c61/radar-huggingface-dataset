# chloehlee/delight-fm-immune

## Resumen

DELIGHT-FM Immune es un modelo fundacional preentrenado para datos de expresión génica de célula única (scRNA-seq) en tejido inmunitario humano. Lo publica la desarrolladora chloehlee como parte de la familia DELIGHT-FM, una colección de checkpoints especializados por compartimento tisular (íleon, colon, estroma e inmune). El modelo resuelve el problema de obtener representaciones densas y transferibles de células individuales para tareas posteriores de clasificación, regresión y análisis de perturbaciones, sin necesidad de entrenar desde cero en cada nuevo conjunto de datos.

Arquitectura de tipo Geneformer-Mamba: un transformer con capas Mamba adaptado a tokens de genes, con 15.327.340 parámetros totales y una longitud de contexto de 2048 tokens (células), sobre un vocabulario de referencia de 18.253 características génicas. El preentrenamiento combina modelado de genes enmascarados con supervisión auxiliar de clúster celular, tipo celular amplio y escala de edad aprendida, además de cabezas adversarias de lote y dominio.

Es relevante ahora porque los modelos fundacionales de célula única están consolidándose como infraestructura para genómica computacional, y este checkpoint se distribuye con licencia Apache 2.0, pesos en safetensors y flujos de trabajo reproducibles documentados. La selección del checkpoint se hizo maximizando la media de macro F1 de clúster, macro F1 de localización y correlación de Pearson de edad sobre un subconjunto de validación de 36.586 células.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Geneformer-Mamba (transformer con capas Mamba) |
| Parámetros totales | 15.327.340 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo biológico, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Geneformer-Mamba, una variante que sustituye parte del mecanismo de atención por capas de estado (Mamba) para procesar secuencias de tokens génicos. Cada célula se representa como una secuencia de hasta 2048 tokens de genes, con identificadores de token, expresión log-normalizada z-scoreada por gen (recortada a ±5) y máscaras de genes de alta variabilidad alineadas. El vocabulario de referencia cubre 18.253 características génicas.

El preentrenamiento combina modelado de genes enmascarados (masked gene modeling) con supervisión auxiliar: predicción de clúster celular, predicción de tipo celular amplio y una escala de edad aprendida, junto con cabezas adversarias de lote y dominio para reducir el sesgo técnico entre experimentos. Se entrenó sobre un subconjunto de 175.031 células y se validó y evaluó sobre 36.586 células. El checkpoint exportado conserva todas las cabezas preentrenadas (enmascarado de genes y auxiliares), pero no incluye la cabeza final de regresión log2(PCW) ajustada, que reside en el modelo compañero de edad. La época de fundación seleccionada fue la 3.5.

## Capacidades

- Extracción de características (feature-extraction): genera embeddings de célula única para análisis downstream como clustering, visualización y búsqueda de vecinos.
- Clasificación de células: soporta ajuste fino para tareas de clasificación de tipo celular y clúster mediante una nueva cabeza de tarea.
- Regresión: permite ajustar cabezas de regresión sobre las representaciones del backbone (por ejemplo, predicciones continuas asociadas a la edad, aunque la calibración log2(PCW) requiere el modelo compañero de edad).
- Modelado de genes enmascarados: la cabeza de enmascarado se conserva en la exportación, lo que permite tareas de reconstrucción de expresión.
- Análisis de perturbaciones: el modelo responde a ediciones firmadas de expresión génica, midiendo la respuesta del modelo (no efectos causales experimentales), con reconstrucción aproximada de abundancia tras el recorte de z-scores.
- Supervisión auxiliar de clúster y tipo celular amplio: las cabezas auxiliares se mantienen y pueden aprovecharse en el ajuste fino.
- Robustez frente a lote y dominio: las cabezas adversarias de lote y dominio buscan mitigar el sesgo técnico entre experimentos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales: es un modelo especializado en datos biológicos, no un modelo de lenguaje.

## Casos de uso

- Anotación de tipos celulares en tejido inmunitario: se ajusta una cabeza de clasificación sobre los embeddings del backbone para etiquetar células inmunitarias en nuevos conjuntos scRNA-seq, aprovechando las representaciones preentrenadas y el contexto de 2048 tokens por célula.
- Integración y clustering de datos de célula única: los embeddings sirven como entrada para clustering y reducción de dimensionalidad, con las cabezas adversarias de lote orientadas a reducir la separación artificial entre experimentos.
- Estudio de envejecimiento inmunitario: combinado con el compañero `delight-fm-immune-age`, que incluye la cabeza de regresión log2(PCW) calibrada, permite predecir la escala de edad a partir de la expresión génica.
- Análisis de perturbaciones in silico: los tutoriales de perturbaciones verificadas permiten editar la expresión de genes diana firmados y observar el cambio en predicciones y embeddings, útil para generar hipótesis antes de validación experimental.
- Búsqueda y recuperación de células similares: los embeddings permiten construir índices de vecinos para recuperar células con perfiles de expresión parecidos en cohortes grandes.
- Evaluación de generalización entre donantes: el modelo está pensado para particiones train/validation/test disjuntas por donante, lo que encaja en pipelines de validación de biomarcadores y estudios de reproducibilidad.
- Preentrenamiento como inicialización: al conservar todos los tensores del backbone, sirve como punto de partida para nuevas tareas de clasificación o regresión en lugar de entrenar desde cero con datos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la selección del checkpoint maximizó la media de macro F1 de clúster, macro F1 de localización y Pearson de edad, y remite a `metadata/selection.json` para los valores por componente, pero no se proporcionan cifras concretas en la información disponible. Además, advierte que el subconjunto de test original participó en la selección del modelo y no constituye un benchmark externo intacto.

## Requisitos de hardware

- VRAM estimada para inferencia: con 15,3 millones de parámetros, los pesos en fp32 ocupan aproximadamente 61 MB; en fp16 unos 31 MB. El consumo real vendrá dominado por las activaciones y las extensiones Mamba compiladas, no por los pesos. No se dispone de cifras medidas de VRAM en la información proporcionada.
- GPU recomendadas: no disponible. La model card menciona un stack probado de PyTorch/CUDA 11.8 con extensiones Mamba compiladas, sin especificar modelos de GPU.
- GPU de consumo: por tamaño de parámetros cabe holgadamente en cualquier GPU consumer moderna, pero no se ha validado ni documentado el despliegue en ellas.
- Opciones de despliegue: carga mediante `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)`. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo biológico.
- Latencia y throughput: no disponible. La model card indica que la ejecución completa en GPU y el entrenamiento no se validaron en el contenedor de preparación, que era solo CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DELIGHT-FM Immune | 15.327.340 | 2048 | scRNA-seq tejido inmunitario | Apache 2.0 | Hugging Face |
| DELIGHT-FM Epi-ileum | no disponible | no disponible | scRNA-seq epitelio de íleon | Apache 2.0 | Hugging Face |
| DELIGHT-FM Epi-colon | no disponible | no disponible | scRNA-seq epitelio de colon | Apache 2.0 | Hugging Face |
| DELIGHT-FM Stromal | no disponible | no disponible | scRNA-seq compartimento estromal | Apache 2.0 | Hugging Face |

Las alternativas de la misma familia comparten arquitectura y licencia, pero se especializan en distintos compartimentos tisulares. No se dispone de datos de benchmarks comparativos entre ellas en la información proporcionada. Tampoco se han facilitado comparaciones con modelos fundacionales de célula única de otros autores.

## Limitaciones y advertencias

- El checkpoint fundacional no contiene la cabeza final de regresión log2(PCW); la puntuación auxiliar de PCW del modelo fundacional es una escala de meseta aprendida, no un valor calibrado. Para predicción de log2(PCW) o perturbaciones de edad debe usarse `chloehlee/delight-fm-immune-age`.
- La tokenización genérica de Geneformer no es intercambiable: es obligatorio usar los ficheros de estadísticas de referencia y tokenización de `resources/`.
- Los rangos empatados del tejido inmune pueden depender del despacho AVX512 de NumPy; se recomienda conservar las entradas tokenizadas entre workers.
- El subconjunto de test original participó en la selección del modelo, por lo que no es un benchmark externo intacto. Las nuevas tareas deben usar particiones disjuntas por donante y evaluar la generalización de forma independiente.
- Las perturbaciones miden la respuesta del modelo, no efectos causales establecidos experimentalmente. Las ediciones firmadas requieren definiciones de diana justificadas de forma independiente; los nombres de regulones por sí solos no especifican la dirección del cambio de expresión.
- No se distribuyen los conjuntos de datos originales a nivel de célula, los identificadores de donante ni las predicciones de referencia; se requiere expresión scRNA-seq humana emparejada por tejido.
- Se requiere `trust_remote_code=True` para cargar el modelo, lo que implica ejecutar código Python personalizado; conviene revisarlo y fijar un SHA de commit con `revision=...` para reproducibilidad.
- La ejecución completa en GPU y el entrenamiento no se validaron en el contenedor de preparación (solo CPU); el código de los notebooks se comprobó localmente pero no se ejecutó de extremo a extremo en GPU.
- Riesgo de sesgo: aunque hay cabezas adversarias de lote y dominio, no se documentan evaluaciones de sesgo biológico ni demográfico.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero las predicciones sobre células fuera de la distribución de entrenamiento pueden ser poco fiables.
- Licencia Apache 2.0 para código y pesos, pero los activos de referencia y las dependencias conservan sus términos originales; revisar `docs/THIRD_PARTY_NOTICES.md` antes de uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chloehlee/delight-fm-immune
- Modelo compañero de edad: https://huggingface.co/chloehlee/delight-fm-immune-age
- Modelo fundacional general: https://huggingface.co/chloehlee/delight-fm
- DELIGHT-FM Epi-ileum: https://huggingface.co/chloehlee/delight-fm-epi-ileum
- DELIGHT-FM Epi-colon: https://huggingface.co/chloehlee/delight-fm-epi-colon
- DELIGHT-FM Stromal: https://huggingface.co/chloehlee/delight-fm-stromal
- Repositorio de código y flujos de trabajo: https://github.com/ChloeHJ/delight_fm_v1
- Dataset de soporte: https://huggingface.co/datasets/chloehlee/delight_fm_v1-data
- Perfil del autor: https://huggingface.co/chloehlee
