# Penn1357/bilibili-clickbait-xlmr

## Resumen

El modelo `Penn1357/bilibili-clickbait-xlmr` es un clasificador de texto basado en XLM-RoBERTa-base, fine-tuneado como regresor sigmoide de un solo logit para puntuar títulos de vídeo chinos según su nivel de clickbait (conocido como "标题党"). Lo desarrolla Penn1357 como parte de un fork del proyecto `bilibili-cleaner`, que sustituye el filtrado por palabras clave por un modelo destilado. El modelo está pensado para integrarse en extensiones de navegador o herramientas de filtrado de contenido en la plataforma bilibili, y se distribuye en formato ONNX para su uso con `transformers.js`, lo que permite ejecutarlo directamente en el navegador.

La relevancia actual radica en que ofrece una alternativa más precisa y adaptable que los filtros basados en reglas para detectar títulos engañosos o sensacionalistas, un problema común en plataformas de vídeo. El modelo se entrenó mediante destilación de dos profesores (Codex y Gemini 3.1 Pro) sobre 10.684 títulos reales de bilibili, y se evaluó en un conjunto de 200 títulos anotados manualmente, alcanzando un AUC de 0,865. Su tamaño compacto (alrededor de 1,1 GB en fp32) y su compatibilidad con `transformers.js` lo hacen adecuado para despliegues ligeros en clientes web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa-base (encoder transformer) |
| Parametros totales | no disponible (basado en XLM-RoBERTa-base, ~278M estimados) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (típico de XLM-RoBERTa-base: 512 tokens) |
| Tipos de cuantizacion | fp32 (no cuantizado) |
| Idiomas soportados | chino (zh) |
| Licencia | MIT |
| Formato de pesos | ONNX (para transformers.js) |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/xlm-roberta-base`, un transformer encoder multilingüe preentrenado. Se fine-tunea como un regresor de un solo logit con activación sigmoide, de modo que la salida es una puntuación continua entre 0 y 1 que indica la probabilidad de que un título sea clickbait. No se trata de un clasificador softmax multiclase, sino de una regresión binaria.

El entrenamiento se realizó mediante destilación: se utilizaron dos modelos profesores (Codex, con AUC 0,909, y Gemini 3.1 Pro, con AUC 0,913) para generar etiquetas suaves sobre 10.684 títulos de vídeo de bilibili extraídos de APIs públicas (ranking, popular, newlist, search). El promedio de las predicciones de ambos profesores alcanzó un AUC de 0,930, superior al de cada uno por separado, gracias a una correlación moderada (0,81) entre ellos. El modelo estudiante se fine-tuneó sobre estas etiquetas promediadas, y el checkpoint final se seleccionó por pérdida de validación, no por AUC de prueba. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Clasificación de títulos de vídeo en chino para detectar clickbait, devolviendo una puntuación continua (0-1).
- Inferencia en el navegador gracias a la conversión a ONNX y la integración con `transformers.js`.
- Funciona como un filtro de contenido en tiempo real para extensiones de navegador o scripts de automatización.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales; es un modelo puramente discriminativo.

## Casos de uso

- Filtrado de clickbait en bilibili: el modelo se integra en el fork `bilibili-clickbait-filter` para ocultar o marcar vídeos con títulos sensacionalistas en la interfaz de bilibili, mejorando la experiencia de navegación.
- Moderación de contenido en plataformas de vídeo: puede usarse como componente de un pipeline de moderación para priorizar la revisión humana de títulos sospechosos.
- Análisis de tendencias de contenido: permite cuantificar el nivel de clickbait en un conjunto de títulos, útil para estudios de mercado o análisis de competencia en el sector de vídeo chino.
- Extensiones de navegador para otros sitios: aunque está entrenado con datos de bilibili, podría adaptarse con fine-tuning adicional a otras plataformas de vídeo chinas o internacionales.
- Automatización de scraping y curación de contenido: al puntuar títulos automáticamente, facilita la creación de listas de vídeos "limpios" para agregadores o newsletters.
- Investigación académica sobre detección de clickbait: sirve como baseline o modelo de referencia para experimentos en chino, dado su tamaño reducido y su licencia MIT.

## Benchmarks y rendimiento

El autor proporciona resultados de evaluación sobre un conjunto de 200 títulos anotados manualmente por un único anotador, mantenido fuera del entrenamiento y la destilación:

| Metrica | Valor |
|---|---|
| AUC | 0,865 |
| Mejor accuracy (umbral 0,75) | 0,855 |
| Precision | 0,794 |
| Recall | 0,551 |
| F1 | 0,651 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Al ser un modelo XLM-RoBERTa-base (~278M parámetros), la inferencia en CPU es viable, aunque la latencia depende del hardware.
- En fp32, el peso del modelo es de aproximadamente 1,1 GB, por lo que requiere al menos 2 GB de RAM/VRAM para cargar el modelo y los tensores.
- Puede ejecutarse en GPU de consumo como RTX 3060 o superiores, pero no es necesario; el uso principal es en navegador con `transformers.js`, que aprovecha WebGPU o WebAssembly.
- Opciones de despliegue: `transformers.js` (navegador), ONNX Runtime (CPU/GPU), o cualquier framework que soporte ONNX (por ejemplo, `onnxruntime-node`).
- No se proporcionan datos de latencia o throughput específicos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se podría comparar con otros clasificadores de clickbait en chino, pero no hay datos disponibles en la fuente.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con títulos de vídeo de bilibili; su rendimiento en otros dominios o plataformas puede degradarse significativamente.
- El conjunto de evaluación es pequeño (200 títulos) y anotado por una sola persona, lo que limita la robustez de las métricas reportadas.
- La precisión (0,794) y el recall (0,551) indican un sesgo hacia la precisión: el modelo tiende a marcar menos títulos como clickbait, lo que puede dejar pasar algunos casos.
- No está cuantizado, lo que aumenta el tamaño de descarga y el uso de memoria en comparación con versiones cuantizadas.
- La licencia MIT permite uso comercial, pero el modelo depende de datos de bilibili, cuyos términos de uso pueden restringir la redistribución de los datos de entrenamiento (aunque el modelo en sí no incluye los datos).
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos de una plataforma concreta, puede reflejar los sesgos de los títulos de esa comunidad.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Penn1357/bilibili-clickbait-xlmr)
- [Repositorio del proyecto bilibili-clickbait-filter](https://github.com/HappyWalkers/bilibili-cleaner/tree/model-based-clickbait-filter)
- [Repositorio original bilibili-cleaner](https://github.com/festoney8/bilibili-cleaner)
