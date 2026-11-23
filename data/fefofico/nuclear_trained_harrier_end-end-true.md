# fefofico/nuclear_trained_harrier_end-end-true

## Resumen

`fefofico/nuclear_trained_harrier_end-end-true` es un clasificador de texto binario construido con SetFit sobre el modelo de embeddings `microsoft/harrier-oss-v1-0.6b`. No es un modelo generativo: combina un Sentence Transformer afinado con aprendizaje contrastivo y una cabeza de clasificación basada en `LogisticRegression` de scikit-learn. El autor lo ha entrenado para distinguir entre textos con contenido nuclear relevante (etiqueta `positive`) y textos sin él (etiqueta `negative`), a partir de ejemplos de agencias y medios de defensa.

La relevancia práctica del modelo está en su eficiencia: SetFit permite obtener un clasificador competitivo con muy pocas muestras etiquetadas por clase, sin necesidad de prompts ni de un LLM generativo. Con 596 millones de parámetros (heredados del encoder base) y una ventana de hasta 32 768 tokens, está pensado para filtrar, etiquetar o priorizar grandes volúmenes de noticias y documentos en pipelines de monitorización.

El repositorio es de carácter experimental: cero descargas, cero likes, licencia e idiomas no declarados y un dataset de evaluación sin identificar. Los resultados reportados (F1 macro de 0,9027) deben interpretarse como cifras declaradas por el autor y no verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: Sentence Transformer (`microsoft/harrier-oss-v1-0.6b`) + cabeza de clasificacion `LogisticRegression` |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32 768 tokens (longitud maxima de secuencia declarada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion del encoder base, no documentada) |
| Idiomas soportados | no disponible (los ejemplos de la model card estan en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamano del repo: 1,2 GB) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit en dos fases. Primero se afina el Sentence Transformer `microsoft/harrier-oss-v1-0.6b` mediante aprendizaje contrastivo sobre pares de frases generados a partir de las muestras etiquetadas; después se entrena una regresión logística sobre los embeddings resultantes. La clasificación final es, por tanto, lineal sobre el espacio de representaciones del encoder, lo que reduce drásticamente el coste de entrenamiento frente al ajuste fino supervisado clásico y permite trabajar con pocos ejemplos por clase.

No se especifican en la información disponible el número de muestras de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de aumento de datos o validación cruzada. La model card indica dos clases (`positive`/`negative`) y muestra ejemplos de temática nuclear (tratado de no proliferación, programas de Irán y Corea del Norte, disuasión francesa, AUKUS). El dataset de evaluación aparece como `Unknown`, por lo que no es posible reproducir la métrica declarada.

## Capacidades

- Clasificación binaria de texto en dos etiquetas: `positive` (contenido nuclear relevante) y `negative` (resto).
- Codificación de frases y documentos largos de hasta 32 768 tokens gracias al encoder base.
- Aprendizaje con pocos ejemplos (few-shot), característica central de SetFit.
- Generación de embeddings reutilizables para búsqueda semántica o clustering, al conservar el Sentence Transformer subyacente.
- No soporta generación de texto, tool calling, agentes, visión ni audio.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Monitorización de prensa y agencias: clasificar flujos RSS o scrapers de noticias para aislar piezas con contenido nuclear y priorizarlas en un panel de analistas.
- Alertas de proliferación: filtrar comunicados oficiales, informes de organismos y notas de think tanks que mencionen programas de armamento nuclear, enriqueciendo el triaje humano.
- Curación de corpus para investigación: separar documentos relevantes de un archivo antes de pasarlos a un modelo generativo o a un sistema RAG, reduciendo coste y ruido.
- Moderación temática en foros o repositorios: detectar discusiones sobre armamento nuclear que requieran revisión según políticas internas.
- Etiquetado asistido de datasets: usar las predicciones como preetiquetas para acelerar la anotación manual en proyectos de seguridad internacional.
- Clasificación de literatura científica: discriminar artículos de física nuclear aplicada de otros dominios en repositorios académicos.
- Enrutamiento en pipelines de inteligencia: derivar automáticamente documentos a un equipo especializado en no proliferación frente a otras áreas de análisis.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (dataset de evaluación `Unknown`, no verificado):

| Metrica | Valor |
|---|---|
| F1 macro | 0,9027 |
| F1 binario | 0,9021 |

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni otras tareas, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 el encoder de 0,6 B ocupa aproximadamente 2,4 GB de pesos; en fp16 unos 1,2 GB. La cabeza logística añade unos pocos kilobytes.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16, incluidas RTX 3060, RTX 4060, RTX 4090, A100 y H100. El modelo cabe holgadamente en GPU de consumo.
- Despliegue: vLLM y TGI no aplican directamente porque el pipeline es de clasificación con cabeza scikit-learn; las opciones naturales son `sentence-transformers` + `scikit-learn`, `text-embeddings-inference` para la parte de embeddings y un servicio propio con FastAPI o similar.
- Latencia y throughput: no disponibles. Por el tamaño del encoder, se espera un throughput alto en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fefofico/nuclear_trained_harrier_end-end-true` | 596 M | 32 768 | Clasificacion binaria (SetFit) | no disponible | Hugging Face, 0 descargas |
| `microsoft/harrier-oss-v1-0.6b` | 596 M | no disponible en esta ficha | Embeddings de frases | no disponible | Hugging Face |
| Clasificador SetFit generico sobre MiniLM | ~22 M | 512 | Clasificacion binaria | Apache 2.0 (segun variante) | Hugging Face, amplia adopcion |
| Clasificador BERT-base afinado | ~110 M | 512 | Clasificacion binaria | Apache 2.0 (BERT) | Hugging Face |

La ventaja frente a un SetFit basado en MiniLM es la ventana de contexto mucho mayor y un encoder mas reciente; la desventaja es el mayor coste de inferencia y la ausencia de licencia declarada, que complica su adopcion comercial.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial sin contactar con el autor.
- Dataset de evaluación desconocido y métricas no verificadas; el F1 de 0,90 podría no reproducirse en dominios distintos.
- Solo dos clases y temática muy específica: el modelo no distingue subtemas (proliferación, energía civil, tratados) ni otros idiomas de forma documentada.
- Riesgo de falsos positivos por coincidencia léxica: menciones colaterales a lo nuclear pueden clasificarse como `positive`.
- Riesgo de falsos negativos ante vocabulario técnico no visto en entrenamiento (p. ej., eufemismos o terminología de nuevos programas).
- Sesgo potencial derivado de la fuente de los ejemplos (medios y comunicados occidentales), no evaluado.
- Repositorio sin mantenimiento aparente (0 descargas, 0 likes, creado y actualizado el mismo día), lo que sugiere un experimento puntual más que un artefacto de producción.
- La cabeza logística requiere serialización adicional (`pytorch_model.bin` o similar) más allá del encoder; conviene validar la carga completa con la librería `setfit`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fefofico/nuclear_trained_harrier_end-end-true
- Modelo base: https://huggingface.co/microsoft/harrier-oss-v1-0.6b
- Repositorio de SetFit: https://github.com/huggingface/setfit
- Paper de SetFit: https://arxiv.org/abs/2209.11055
- Blog de SetFit: https://huggingface.co/blog/setfit
- Documentación de Sentence Transformers: https://www.sbert.net
- Documentación de scikit-learn (LogisticRegression): https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html
