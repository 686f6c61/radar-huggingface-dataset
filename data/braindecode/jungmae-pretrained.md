# braindecode/jungmae-pretrained

## Resumen

JungMAE es un modelo fundacional de representación para señales de espectroscopía funcional de infrarrojo cercano (fNIRS), una técnica de neuroimagen no invasiva que mide la oxigenación cortical. El método original fue propuesto por Jung, Lee y An (2025) y esta versión concreta de los pesos ha sido implementada y entrenada por los autores de GeoNIRS (Li et al., 2026), publicada bajo el identificador `braindecode/jungmae-pretrained`. El modelo se distribuye como encoder preentrenado mediante un esquema de masked autoencoder (MAE) y está integrado en la librería Braindecode.

Se trata de un transformer de pequeña escala (1.783.872 parámetros totales según los pesos en safetensors) diseñado para extraer representaciones latentes de ventanas de fNIRS multicanal. No es un modelo generativo de texto ni un LLM: su espacio de entrada son series temporales fisiológicas (concentraciones de hemoglobina oxigenada y desoxigenada) y su salida son características vectoriales reutilizables para tareas posteriores de clasificación o regresión.

Su relevancia actual radica en la escasez de modelos fundacionales abiertos para neuroimagen funcional óptica y en la posibilidad de hacer *linear probing* o *fine-tuning* con pocas muestras (few-shot), un escenario habitual en BCI y en estudios clínicos con cohortes pequeñas. La release elimina la cabeza de clasificación y el decoder de preentrenamiento, dejando únicamente el encoder.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con masked autoencoder (MAE) para fNIRS |
| Parámetros totales | 1.783.872 (encoder, según safetensors) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de entrada configurable vía `n_times`; ejemplo de la model card: `n_times=60` a 5 Hz) |
| Tipos de cuantización | no disponible (pesos publicados en float32; sin GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no aplica (modelo de señales fisiológicas, no lingüístico) |
| Licencia | other (el repositorio fuente no incluye fichero de licencia; pesos de los autores de GeoNIRS) |
| Formato de pesos | safetensors (PyTorch, librería `braindecode`) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma de masked autoencoder aplicado a series temporales de fNIRS. La señal de entrada se divide en parches (`n_patches`) sobre una ventana temporal de `n_times` muestras y `n_chans` canales; una fracción de esos parches se enmascara y el encoder transformer procesa los visibles, mientras un decoder ligero (eliminado en esta release) reconstruye la señal original. El objetivo de reconstrucción fuerza al encoder a aprender dependencias espaciales entre canales y temporales dentro de la ventana.

Los datos de entrenamiento corresponden al preentrenamiento realizado por los autores de GeoNIRS (Li et al., 2026), descrito como *geometry-aware pretraining for heterogeneous fNIRS representation learning*. La model card no detalla el número de tokens, la composición exacta del corpus ni si hubo etapas de ajuste supervisado adicionales. La entrada prevista, según el apéndice B.1 del paper de GeoNIRS, son concentraciones de HbO y HbR en µmol/L remuestreadas a 5 Hz y estandarizadas (z-score) por registro sobre todos los canales y muestras válidos. La conversión desde el checkpoint original (`checkpoint/jung_mae.pt` del repositorio GeoNIRS, commit `81f8995`) elimina el decoder de preentrenamiento y la proyección de entrada del mismo, conservando el encoder con valores idénticos bit a bit en CPU y float32.

## Capacidades

- Extracción de representaciones (embeddings) de ventanas de fNIRS multicanal mediante `model(x, return_features=True)["features"]`.
- Aprendizaje autosupervisado por reconstrucción enmascarada, lo que permite reutilización en tareas posteriores con pocas etiquetas.
- Soporte de *linear probing* sobre las características congeladas del encoder.
- Soporte de *fine-tuning* del encoder completo junto con una cabeza de clasificación construida por el usuario.
- Adaptación a distintas configuraciones de montaje: `n_chans`, `n_times` y `n_outputs` se especifican en `from_pretrained`, y la cabeza `final_layer` se genera para la dimensión `n_chans * n_patches * embed_dim` correspondiente.
- Procesamiento de dos cromóforos (HbO y HbR) como canales de entrada.
- No soporta tool calling, agentes, generación de texto, visión, audio ni capacidades multilingües: es un modelo específico de dominio fisiológico.

## Casos de uso

- **Clasificación de estados cognitivos en BCI**: usar el encoder congelado y una regresión logística sobre las características para discriminar tareas mentales (por ejemplo, carga cognitiva o imaginación motora) a partir de ventanas de fNIRS de pocos segundos, aprovechando que el preentrenamiento reduce la necesidad de datos etiquetados.
- **Detección de patologías con cohortes pequeñas**: en estudios clínicos con decenas de sujetos, el *fine-tuning* del encoder sobre la tarea de interés (por ejemplo, diferenciar patrones hemodinámicos alterados) es viable gracias al tamaño reducido del modelo (1,78 M de parámetros) y a su inicialización auto-supervisada.
- **Extracción de features para pipelines de neuroimagen**: integrar `JungMAE` como extractor dentro de un pipeline de Braindecode/MNE para alimentar clasificadores clásicos (SVM, random forest) o modelos posteriores, sustituyendo features manuales como pendientes o correlaciones entre canales.
- **Aprendizaje few-shot en nuevos montajes**: al construir la cabeza para el número de canales del montaje concreto, el modelo puede adaptarse a configuraciones de optodos distintas de las del preentrenamiento, útil en laboratorios que no comparten hardware.
- **Preentrenamiento de referencia en investigación metodológica**: servir como *baseline* reproducible para comparar estrategias de representación en fNIRS (contrastivo, MAE, supervisado) en publicaciones y evaluaciones internas.
- **Prototipado rápido en CPU**: con menos de 2 M de parámetros, la inferencia del encoder cabe en CPU sin GPU dedicada, lo que facilita pruebas de concepto en entornos clínicos o docentes con hardware limitado.
- **Análisis de conectividad funcional**: usar los embeddings por ventana como entrada a modelos que estiman similitud entre regiones o entre sujetos, aprovechando que el encoder codifica dependencias entre canales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, F1 ni comparaciones numéricas con otros modelos, y no se dispone de los resultados del paper de GeoNIRS (arXiv:2610.17845) en esta ficha.

## Requisitos de hardware

- **VRAM estimada**: inferior a 1 GB para inferencia en float32, dado el tamaño del encoder (1,78 M de parámetros, ~7 MB en float32). El consumo real vendrá dominado por el tamaño del lote y la longitud de la ventana de entrada, no por los pesos.
- **GPU recomendadas**: cualquier GPU con al menos 2-4 GB de memoria es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, pero no son necesarias.
- **Consumer GPU**: sí, cabe holgadamente en cualquier GPU de consumo e incluso en CPU para inferencia y *linear probing*.
- **Opciones de despliegue**: al ser un modelo de la librería `braindecode`, el despliegue natural es Python con PyTorch y `braindecode.models.JungMAE.from_pretrained`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que están orientados a LLMs.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación facilitada. Existen otros modelos fundacionales para señales biomédicas (por ejemplo, en EEG o ECG), pero no se aportan datos de parámetros, contexto, rendimiento ni licencia que permitan una comparación rigurosa. Se indica, por tanto, "no disponible".

## Limitaciones y advertencias

- **Licencia ambigua**: la licencia figura como `other` y el repositorio fuente no contiene fichero de licencia. Antes de un uso comercial es imprescindible contactar con los autores de GeoNIRS y aclarar los términos; no se puede asumir uso libre.
- **Sin cabeza de clasificación**: la release solo incluye el encoder; el usuario debe construir y entrenar la cabeza `final_layer`, por lo que el modelo no es utilizable directamente para predicción sin una etapa de ajuste.
- **Entrada muy específica**: el preentrenamiento asume HbO y HbR en µmol/L, remuestreados a 5 Hz y estandarizados por registro. Aplicar el modelo a señales con otro preprocesado, otra frecuencia de muestreo u otra normalización degradará las representaciones.
- **Riesgo de alucinación no aplicable en sentido lingüístico**, pero sí de representaciones poco fiables fuera de la distribución de entrenamiento (montajes, poblaciones o tareas distintas).
- **Ausencia de benchmarks**: no hay evidencia publicada en la model card sobre la calidad de las representaciones, lo que dificulta estimar su rendimiento esperado frente a alternativas.
- **Documentación limitada**: no se detalla el corpus de preentrenamiento, el número de sujetos ni la composición demográfica, lo que impide evaluar sesgos poblacionales.
- **Sin cuantizaciones oficiales**: no hay versiones GGUF ni int8 publicadas; el despliegue en entornos de bajos recursos requiere conversión manual.
- **Modelo de nicho**: no es un modelo de propósito general; su uso fuera de fNIRS no está justificado.

## Enlaces

- Hugging Face: https://huggingface.co/braindecode/jungmae-pretrained
- Documentación de `braindecode.models.JungMAE`: https://braindecode.org/stable/generated/braindecode.models.JungMAE.html
- Repositorio GeoNIRS (checkpoint original): https://github.com/GeoNIRS/GeoNIRS/tree/81f8995e5c3aa6b70e55812b194fc04e4e7ea5b7/checkpoint
- Paper del método (Jung, Lee y An, 2025): DOI 10.1109/BCI65088.2025.10931275
- Paper de la release (Li et al., 2026): arXiv:2610.17845
