# KeTuTu/swedish-grammaticality-scoring

## Resumen

`KeTuTu/swedish-grammaticality-scoring` es un modelo de puntuación de gramaticalidad para sueco, desarrollado por Xuehai Wang (usuario KeTuTu). Se trata de un ajuste fino mediante LoRA de rango 8 sobre el backbone `KB/bert-base-swedish-cased` de KBLab (Biblioteca Nacional de Suecia), con una cabeza de clasificación de tokens de dos clases (OK/ERROR) que estima evidencia local de error. El modelo no genera texto ni corrige: produce una puntuación de corrección entre 0 y 1 para una frase o texto de entrada.

El problema que resuelve es la evaluación automática de la calidad gramatical en sueco, útil para filtrar corpus, evaluar sistemas de corrección gramatical (GEC) o priorizar revisiones humanas. La innovación principal es el método de agregación: en lugar de usar el logit del token `[CLS]`, agrega los márgenes por subword de contenido mediante log-sum-exp con temperatura 0,5 y normalización por longitud, y luego aplica una función logística calibrada. Esto permite puntuar textos de longitud variable de forma consistente.

El modelo tiene 124.101.890 parámetros en FP32, pero el entrenamiento solo actualizó 296.450 parámetros (el adaptador de atención y la cabeza). El contexto efectivo del tokenizador es de 128 tokens por ventana, con ventanas no solapadas de 126 subwords de contenido más dos tokens de frontera. Es relevante ahora porque ofrece una alternativa ligera y desplegable en CPU para una tarea específica de evaluación lingüística en una lengua con pocos recursos, con métricas publicadas sobre el conjunto de evaluación de DaLAJ-GED-SuperLim 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (base) con adaptador LoRA de rango 8 y cabeza de clasificación de tokens de dos clases |
| Parametros totales | 124.101.890 (FP32, incluye clasificador OK/ERROR) |
| Parametros activos | no disponible (no es MoE; 296.450 parámetros actualizados en entrenamiento) |
| Longitud de contexto | 128 tokens por ventana; ventanas no solapadas de 126 subwords de contenido + 2 tokens de frontera; el scorer combina todas las ventanas |
| Tipos de cuantizacion | no disponible (el modelo se distribuye en FP32; no se documentan cuantizaciones) |
| Idiomas soportados | sueco (sv) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (librería transformers; repo de 0,5 GB) |

## Arquitectura y entrenamiento

El modelo parte de `KB/bert-base-swedish-cased`, un BERT base con casing preservado entrenado por KBLab (Malmsten et al., 2020). Sobre este backbone se aplica un adaptador LoRA de rango 8 en las capas de atención y una cabeza de clasificación de tokens de dos clases que etiqueta cada subword como OK o ERROR. El entrenamiento actualizó 296.450 parámetros de un total de 124.101.890. El dataset de entrenamiento es `KeTuTu/swedish-grammaticality-pairs`, un derivado pareado construido por el autor a partir de DaLAJ-GED-SuperLim 2.0 (Volodina y Ali Mohammed, Universidad de Gotemburgo).

La innovación técnica está en la función de scoring. Para cada subword de contenido se calcula el margen $m_i$ = logit(ERROR) − logit(OK). La evidencia agregada es $E = T(\log\sum e^{m_i/T} - \log N)$ con $T=0.5$, y la puntuación final es $s = 1/(1+\exp(\mathrm{clip}(aE+b, -700, 700)))$ con $a=0.6535880249$ y $b=-1.019142231$. Esta normalización por longitud evita que textos largos acumulen evidencia artificialmente. El tokenizador divide textos largos en ventanas no solapadas de 126 subwords de contenido y el scorer combina todos los márgenes antes de la transformación logística. La implementación nativa en PyTorch ordena las ventanas por longitud y no requiere importar Transformers ni PEFT para inferencia.

## Capacidades

- Puntuación de gramaticalidad: devuelve un valor entre 0 y 1 que indica la probabilidad de que un texto sueco sea gramaticalmente correcto.
- Clasificación token a token: produce logits OK/ERROR por subword, agregados mediante log-sum-exp con temperatura 0,5.
- Manejo de textos largos: segmenta en ventanas de 126 subwords de contenido y combina la evidencia de todas ellas.
- Inferencia en CPU y GPU: el ejemplo nativo funciona en CPU; el CLI usa precisión CUDA configurable y ordena ventanas por longitud.
- Inferencia sin dependencias de Transformers/PEFT: el encoder nativo carga el adaptador o el modelo fusionado directamente.
- Entrada vacía o solo espacios: devuelve 0.0 de forma determinista.
- No soporta generación de texto, tool calling, agentes, visión ni audio. Es un modelo discriminativo de una sola tarea.

## Casos de uso

- Filtrado de corpus web en sueco: puntuar cada frase extraída de un crawl y descartar aquellas con score bajo antes de incluirlas en un dataset de preentrenamiento o ajuste fino, reduciendo ruido gramatical sin revisión manual.
- Evaluación de sistemas GEC: usar el score como métrica automática complementaria para comparar correctores gramaticales en sueco, aprovechando la correlación de rango publicada (Spearman 0,825 sobre textos públicos del organizador).
- Priorización de revisión humana en editoriales: ordenar los párrafos de un manuscrito por score ascendente para que los revisores atiendan primero los fragmentos con mayor evidencia de error.
- Control de calidad en pipelines de traducción: puntuar las salidas de un sistema de traducción al sueco y marcar segmentos sospechosos para revisión o reintento con otro modelo.
- Análisis lingüístico diacrónico o dialectal: detectar variantes que el modelo marca como erróneas pese a ser legítimas (orden de subordinadas, ortografía antigua, adjetivos predicativos no concordantes del norte) para estudiarlas como fenómenos de variación.
- Generación de datos sintéticos controlados: usar el scorer como filtro al crear pares correcto/incorrecto para entrenar otros modelos GEC, aceptando solo pares donde el score discrimina claramente.
- Monitorización en producción de chatbots en sueco: puntuar respuestas generadas antes de enviarlas y activar una salvaguarda o reformulación si el score cae por debajo de un umbral.

## Benchmarks y rendimiento

Evaluación sobre 120 textos públicos del organizador (según la model card):

| Metrica | Valor |
|---|---|
| Spearman (GPU) | 0,825 |
| ROC-AUC | 0,978 |
| MAE | 0,115 |

No se han publicado resultados comparativos con otros modelos en la información disponible. El autor indica que las variantes gramaticales de orden de palabras en subordinadas, ortografía antigua y adjetivos predicativos no concordantes del norte siguen siendo difíciles para el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 (124 M de parámetros); el repo pesa 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el modelo es trivial para A100, H100, RTX 4090, RTX 3090 o incluso GPUs de gama baja.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU con memoria compartida; también funciona en CPU.
- Opciones de despliegue: PyTorch nativo (sin Transformers ni PEFT, según el autor), Transformers con `AutoModelForTokenClassification`, CLI incluida en el repositorio de código. No se documentan integraciones con vLLM, TGI, llama.cpp u Ollama (son para modelos generativos; este es un encoder).
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño (124 M de parámetros) y el contexto de 128 tokens por ventana, se espera un throughput alto en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KeTuTu/swedish-grammaticality-scoring | 124,1 M | 128 tokens/ventana, multi-ventana | Puntuación de gramaticalidad (sueco) | CC BY 4.0 | Hugging Face |
| KB/bert-base-swedish-cased | ~124 M | 512 tokens | Backbone encoder (sueco) | CC0 | Hugging Face |
| Modelos GEC suecos basados en DaLAJ-GED-SuperLim | no disponible | no disponible | Corrección gramatical | CC BY-SA 4.0 (dataset) | no disponible |

No se dispone de datos de rendimiento de alternativas comparables en la información proporcionada. La comparación directa con otros scorers de gramaticalidad en sueco no está disponible.

## Limitaciones y advertencias

- El modelo solo puntúa; no corrige ni explica el error detectado.
- Dificultades documentadas: orden de palabras en subordinadas, ortografía antigua y adjetivos predicativos no concordantes del norte de Suecia.
- El score no tiene acceso a la región del hablante ni a la fecha del texto, por lo que no puede contextualizar variación dialectal o diacrónica.
- Riesgo de sesgo hacia la norma escrita estándar representada en DaLAJ-GED-SuperLim 2.0; variedades no estándar pueden recibir scores bajos de forma injustificada.
- Riesgo de alucinación no aplica (modelo discriminativo), pero sí de calibración imperfecta fuera de la distribución de entrenamiento.
- Contexto limitado a ventanas de 128 tokens; textos muy largos se fragmentan y la evidencia se agrega, lo que puede diluir errores localizados.
- Licencia CC BY 4.0: permite uso comercial con atribución. El backbone original es CC0 y el dataset derivado se distribuye bajo CC BY 4.0; las evaluaciones sobre treebanks históricos siguen licencias CC BY-SA 4.0 separadas.
- Sin descargas ni likes en el momento de la consulta (0/0), lo que sugiere ausencia de validación comunitaria independiente.
- No hay cuantizaciones publicadas ni integración con servidores de inferencia estándar; el despliegue requiere el código del repositorio o Transformers.

## Enlaces

- Hugging Face: https://huggingface.co/KeTuTu/swedish-grammaticality-scoring
- Dataset de entrenamiento: https://huggingface.co/datasets/KeTuTu/swedish-grammaticality-pairs
- Repositorio de código: https://github.com/HendricksJudy/swedish-grammaticality-scoring
- Benchmark: https://github.com/HendricksJudy/swedish-grammaticality-scoring/blob/main/results/benchmark_summary.json
- Tests de variación: https://github.com/HendricksJudy/swedish-grammaticality-scoring/blob/main/results/variation_summary.json
- Modelo base KBLab: https://huggingface.co/KBLab/bert-base-swedish-cased
- Paper del backbone (Malmsten et al.): https://arxiv.org/abs/2007.01658
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- DaLAJ-GED-SuperLim (Språkbanken Text): https://sprakbanken.se/en/resources/dalaj-ged-superlim
- Paper DaLAJ-GED: https://aclanthology.org/2023.nlp4call-1.11/
