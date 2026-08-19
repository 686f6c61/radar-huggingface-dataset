# agusnieto77/qwen2.5-0.5b-conflict-classifier

## Resumen

El modelo `agusnieto77/qwen2.5-0.5b-conflict-classifier` es un clasificador binario de texto en español que determina si una nota periodística contiene un conflicto social o civil (etiquetas `CONFLICTO` vs `NO_CONFLICTO`). Desarrollado por agusnieto77 dentro del Laboratorio de Humanidades Digitales, es un fine-tune completo (full SFT) del modelo `Qwen/Qwen2.5-0.5B-Instruct`, con todos los pesos actualizados. El modelo resuelve el problema de la detección automática de conflictividad social en prensa local, un área relevante para la investigación social, el monitoreo mediático y la alerta temprana.

Con 494 millones de parámetros, se trata de un modelo compacto y eficiente, entrenado sobre un conjunto de 4.034 notas periodísticas argentinas anotadas manualmente. Su arquitectura es un transformer decoder-only (familia Qwen2.5) y está diseñado para clasificación mediante comparación de logits entre las dos etiquetas posibles, no para generación libre. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B-Instruct` (revisión fijada `7ae557604adf67be50417f59c2c2f167def9a775`) y se somete a un fine-tune completo (full SFT) sobre un dataset propio de 4.034 notas periodísticas anotadas manualmente, publicado como `agusnieto77/conflicto-social-noticias-4034`. El dataset contiene 895 ejemplos positivos de conflicto (el resto son negativos), y la anotación sigue una definición operacional v5 que considera conflicto social como una confrontación o disputa colectiva real con al menos un actor social o civil, o una reacción colectiva frente a una necesidad o agravio explícito.

No se proporcionan detalles sobre hiperparámetros de entrenamiento (épocas, learning rate, optimizador, etc.). La inferencia se realiza aplicando el chat template del modelo base y comparando los logits de las continuaciones `CONFLICTO` y `NO_CONFLICTO`; se predice `CONFLICTO` cuando la probabilidad normalizada de esa etiqueta es mayor o igual a 0,5.

## Capacidades

- Clasificación binaria de textos periodísticos en español, distinguiendo entre notas que contienen conflicto social y las que no.
- Respuesta exclusiva con una de las dos etiquetas, sin generación de texto adicional.
- Soporte de chat template del modelo base Qwen2.5-Instruct, lo que permite integrarlo en pipelines estándar de transformers.
- Método de scoring basado en logits de las etiquetas, con umbral operacional fijo en 0,5.
- No dispone de capacidades adicionales como tool calling, razonamiento multi-paso, visión o audio.

## Casos de uso

- Monitoreo automatizado de prensa local: el modelo puede procesar de forma continua noticias de medios digitales argentinos para detectar episodios de conflicto social, generando alertas tempranas para periodistas o investigadores.
- Investigación social y análisis de conflictividad: permite cuantificar la frecuencia y evolución de conflictos en un territorio a partir de corpus de noticias, facilitando estudios longitudinales.
- Clasificación de archivos periodísticos: útil para etiquetar grandes colecciones de noticias históricas, creando bases de datos consultables por nivel de conflictividad.
- Sistemas de alerta para administraciones públicas: puede integrarse en herramientas de observación social para anticipar focos de tensión en municipios o provincias.
- Análisis de cobertura mediática: ayuda a comparar cómo distintos medios tratan los conflictos sociales, identificando sesgos de agenda.
- Integración en pipelines de NLP para periodismo digital: sirve como componente de preprocesado en sistemas de recomendación de noticias o en plataformas de verificación de hechos.

## Benchmarks y rendimiento

El autor reporta una evaluación mediante validación cruzada de 5 folds sobre las 4.034 notas de entrenamiento, con predicciones out-of-fold y umbral fijo de 0,5. La matriz de confusión agregada es: TP=801, FN=94, FP=72, TN=3067.

| Metrica | Media | Desvio |
|---|---|---|
| Accuracy | 0,9588 | 0,0037 |
| Precision CONFLICTO | 0,9174 | 0,0182 |
| Recall CONFLICTO | 0,8953 | 0,0163 |
| F1 CONFLICTO | 0,9060 | 0,0082 |
| Macro F1 | 0,9398 | 0,0051 |
| PR-AUC | 0,9721 | 0,0057 |
| ROC-AUC | 0,9908 | 0,0026 |

Además, la model card incluye una comparativa con otros dos clasificadores de la misma familia, todos entrenados sobre el mismo gold estándar:

| Modelo | Metodo | Parametros | Accuracy OOF | Recall CONFLICTO | Precision CONFLICTO | FN / FP |
|---|---|---|---|---|---|---|
| BETO | Full FT + ventanas | 110 M | 0,924 | 0,963 | 0,765 | 33 / 273 |
| Qwen 0.5B | Full SFT | 494 M | 0,959 | 0,895 | 0,917 | 94 / 72 |
| Qwen 1.5B LoRA | LoRA | 1,54 B + adapter 18,5 M | 0,959 | 0,906 | 0,910 | 84 / 80 |

## Requisitos de hardware

- Inferencia ligera: con 494 millones de parámetros, el modelo puede ejecutarse en CPU sin problemas para clasificación por lotes, con latencias de milisegundos por texto.
- VRAM estimada: aproximadamente 1 GB en precisión fp16, o unos 2 GB en fp32. Con cuantización a 8 bits podría reducirse a ~500 MB, aunque no se ofrecen archivos cuantizados en el repositorio.
- GPU recomendada: cualquier GPU con 2 GB o más de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o incluso integradas modernas) es suficiente. También es viable en Google Colab.
- Opciones de despliegue: compatible con la librería transformers (PyTorch), y puede servirse mediante vLLM o TGI si se convierte a un formato adecuado. No se proporcionan archivos GGUF ni configuración para Ollama.
- Throughput: al ser un modelo pequeño, puede procesar cientos de textos por segundo en GPU, y decenas en CPU.

## Comparativa con modelos similares

Los dos modelos comparables más directos son los otros clasificadores de la misma familia (BETO y Qwen 1.5B LoRA), ya que comparten dataset y definición operacional. BETO es un BERT en español de 110 M, mientras que Qwen 1.5B LoRA usa un modelo mayor con adaptadores. La tabla de la sección de benchmarks resume las diferencias. Frente a alternativas genéricas como un BERT fine-tuneado o un modelo de clasificación de cero disparo, este clasificador destaca por su precisión en la clase positiva (0,917) y su bajo número de falsos positivos, aunque su recall es inferior al de BETO.

## Limitaciones y advertencias

- Entrenado exclusivamente con noticias argentinas, por lo que su generalización a otros países hispanohablantes puede verse afectada por diferencias léxicas y contextuales.
- La definición operacional de conflicto social es específica y puede no coincidir con otras taxonomías; conviene revisar la definición incluida en `conflict_definition.md` antes de usarlo en dominios distintos.
- Riesgo de falsos negativos: con un recall de 0,895, aproximadamente un 10% de los conflictos reales no se detectan. El autor indica que bajar el umbral a ~0,28 mejora el recall pero reduce la accuracy.
- No es un modelo generativo: está pensado únicamente para clasificación; usarlo para generar texto libre puede producir respuestas incoherentes o fuera de dominio.
- El repositorio no incluye cuantizaciones ni versiones optimizadas para despliegue en entornos de baja latencia.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo se distribuye tal cual, sin garantías de precisión en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agusnieto77/qwen2.5-0.5b-conflict-classifier
- Dataset de entrenamiento: https://huggingface.co/datasets/agusnieto77/conflicto-social-noticias-4034
- Space de demostración: https://huggingface.co/spaces/agusnieto77/qwen2.5-0.5b-conflict-classifier-demo
- Demo externa: https://clasificador-qwen05.laboratoriodehumanidadesdigitales.ar
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Modelo BETO comparado: https://huggingface.co/agusnieto77/beto-conflict-classifier
- Modelo Qwen 1.5B LoRA comparado: https://huggingface.co/agusnieto77/qwen2.5-1.5b-conflict-classifier
