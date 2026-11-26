# looky/finbert-minilm-sentiment

## Resumen

`finbert-minilm-sentiment` es un clasificador de sentimiento financiero (negativo / neutro / positivo) desarrollado por el usuario de Hugging Face `looky`. Se construye sobre el encoder compacto `microsoft/MiniLM-L12-H384-uncased` (33,4 millones de parámetros) afinado sobre una mezcla de frases financieras formales (Financial PhraseBank), tuits de temática financiera y titulares de notas de prensa. Con 33,4 M de parámetros y un peso en disco de aproximadamente 0,2 GB, está pensado para inferencia de bajo coste y alta velocidad en lugar de para tareas generativas.

La versión 3 (octubre de 2026) es la media uniforme de los pesos de diez ejecuciones de fine-tuning, con frases adicionales de PhraseBank en el entrenamiento. El autor reporta 97,94 % de accuracy y 0,9643 de macro-F1 en el split de test de PhraseBank `Sentences_AllAgree`, y 86,43 % de accuracy y 0,8300 de macro-F1 en el fichero completo de validación de tuits financieros. Todas las métricas son declaradas por el autor y no están verificadas de forma independiente.

El modelo es relevante por su relación rendimiento/tamaño: ofrece clasificación de sentimiento de dominio financiero en un encoder de 33 M de parámetros, exportable a ONNX y compatible con Text Embeddings Inference, lo que permite desplegarlo en CPU o en GPU de gama baja con latencias muy reducidas. Su licencia MIT facilita el uso comercial, aunque su alcance es exclusivamente el inglés y la clasificación de tres clases.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT, MiniLM-L12-H384) |
| Parámetros totales | 33.361.155 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (evaluado con máximo de 96 tokens) |
| Tipos de cuantización | no disponible (pesos safetensors y exportación ONNX) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

Se trata de un transformer encoder de tipo BERT en su variante MiniLM-L12-H384: 12 capas, dimensión oculta de 384 y atención multi-cabeza estándar, sin mecanismos de atención lineal ni decodificación especulativa (es un modelo de clasificación, no generativo). La cabeza de clasificación proyecta la representación del token `[CLS]` a tres etiquetas: negativo, neutro y positivo.

El fine-tuning parte de `microsoft/MiniLM-L12-H384-uncased` y combina tres fuentes: `takala/financial_phrasebank` (frases financieras formales), `zeroshot/twitter-financial-news-sentiment` (tuits financieros, con mapeo Bearish = negativo, Bullish = positivo, Neutral = neutro) y `Jean-Baptiste/financial_news_sentiment` (titulares de notas de prensa, con las clases propias del dataset: 0 negativo, 1 neutro, 2 positivo). La versión 3 añade frases extra de PhraseBank y promedia uniformemente los pesos de diez ejecuciones de fine-tuning (weight averaging), una técnica de ensembles baratos que no incrementa el coste de inferencia. No se documenta el número exacto de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO (no aplicables a una tarea de clasificación supervisada). La evaluación se realizó con un máximo de 96 tokens y selección de la etiqueta de mayor probabilidad.

## Capacidades

- Clasificación de sentimiento financiero en tres clases (negativo, neutro, positivo) sobre frases, titulares y tuits.
- Procesamiento de texto corto y medio: frases de PhraseBank, titulares de prensa y tuits financieros.
- Alta velocidad de inferencia por su tamaño reducido (33,4 M de parámetros).
- Exportación a ONNX y compatibilidad con Text Embeddings Inference y endpoints de Hugging Face.
- Soporte de la librería `transformers` con pipeline `text-classification`.
- No soporta generación de texto, tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.
- No dispone de modo "thinking" ni de razonamiento explícito.

## Casos de uso

- Análisis de sentimiento de noticias financieras en tiempo real: ingesta de titulares de agencias y clasificación automática en negativo/neutro/positivo para alimentar paneles de alertas o sistemas de scoring de noticias; su tamaño permite procesar miles de titulares por minuto en CPU.
- Monitorización de redes sociales financieras: clasificación de tuits sobre activos o empresas concretas (el modelo alcanza 86,43 % de accuracy en validación de tuits financieros), útil para medir el pulso del mercado minorista.
- Filtrado previo en pipelines de research cuantitativo: etiquetado masivo de corpus históricos de noticias para construir factores de sentimiento que se incorporen a modelos de señal.
- Enrutamiento de incidencias en atención al cliente de servicios financieros: clasificación de la carga emocional de mensajes entrantes para priorizar casos negativos hacia agentes humanos.
- Análisis de comunicados y notas de prensa corporativas: detección de tono en titulares de resultados o advertencias de beneficios, con la cautela de que el recall en negativos sobre este dominio es bajo según los datos del autor.
- Clasificación por lotes en entornos con recursos limitados: despliegue en contenedores pequeños o dispositivos edge gracias a sus 0,2 GB de pesos y su compatibilidad con ONNX Runtime.
- Enriquecimiento de bases de datos documentales: etiquetado de sentimiento como metadato en sistemas de búsqueda o RAG sobre documentación financiera.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente), medidos el 2026-10-28 con máximo de 96 tokens y etiqueta de mayor probabilidad. Las celdas son accuracy / macro-F1.

| Conjunto de evaluación | n | v1 | v2 | v3 |
|---|---|---|---|---|
| PhraseBank `Sentences_AllAgree`, test estratificado 15 % | 340 | 95,29 % / 0,9368 | 96,47 % / 0,9532 | 97,94 % / 0,9643 |
| Tuits financieros, fichero completo de validación | 2.388 | 68,22 % / 0,6165 | 83,75 % / 0,7995 | 86,43 % / 0,8300 |
| Titulares de notas de prensa (`title`), test completo | 267 | 71,16 % / 0,5864 | 72,28 % / 0,5594 | 75,28 % / 0,5904 |
| Titulares SEntFiN, test completo, unánimes | 933 | 69,67 % / 0,6977 | 73,20 % / 0,7361 | 75,99 % / 0,7627 |

Macro-F1 medio sobre los cuatro conjuntos: v1 0,7093; v2 0,7620; v3 0,7868 (+2,48 puntos sobre v2). Los intervalos de confianza al 95 % (2.000 remuestreos bootstrap) se solapan en todos los conjuntos, por lo que el autor advierte de que la mejora en un conjunto aislado es incierta; la evidencia más sólida es la dirección consistente en los cuatro conjuntos. En titulares de notas de prensa el recall de la clase negativa es de solo 0,167 (intervalo 0,000 a 0,417), lo que indica una debilidad clara en ese dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (33,4 M de parámetros, ~134 MB de pesos más activaciones); en fp16 o int8, por debajo de 100 MB de pesos.
- GPU recomendadas: cualquier GPU moderna sirve; no requiere A100 ni H100. Funciona correctamente en RTX 4090, RTX 3090, T4, L4 e incluso en GPU integradas.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3050, RTX 4060 y similares, con margen amplio.
- Despliegue: `transformers` (pipeline `text-classification`), ONNX Runtime, Text Embeddings Inference y endpoints de Hugging Face; también es viable en CPU para cargas por lotes.
- Latencia y throughput: no se publican cifras concretas en la información disponible; por el tamaño del modelo se espera un throughput muy alto en lotes, pero no se aportan números medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `looky/finbert-minilm-sentiment` | 33,4 M | no disponible (evaluado a 96 tokens) | 97,94 % acc / 0,9643 F1 en PhraseBank test; 86,43 % acc en tuits | MIT | Hugging Face, ONNX |
| FinBERT original (ProsusAI) | no disponible en la información | no disponible | no disponible | no disponible | Hugging Face |
| `microsoft/MiniLM-L12-H384-uncased` (base) | 33,4 M | no disponible | no aplica (modelo base sin cabeza de clasificación) | MIT | Hugging Face |

No se dispone en la información proporcionada de resultados comparables de FinBERT original ni de otros clasificadores de sentimiento financiero, por lo que la comparación cuantitativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- Solo inglés: no se declaran capacidades multilingües; el uso en castellano u otros idiomas no está soportado.
- Dominio restringido a texto financiero; el rendimiento fuera de ese dominio no está caracterizado.
- Recall bajo en la clase negativa sobre titulares de notas de prensa (0,167 según el autor), lo que puede infrarrepresentar noticias negativas en ese tipo de fuente.
- Los intervalos de confianza bootstrap se solapan entre versiones en todos los conjuntos; las mejoras de la v3 sobre la v2 no son estadísticamente concluyentes en ningún conjunto individual.
- Métricas declaradas por el autor y no verificadas de forma independiente.
- Riesgo de alucinación no aplica en sentido generativo (es un clasificador), pero sí existe riesgo de clasificaciones erróneas en textos ambiguos, irónicos o con entidades múltiples; SEntFiN se filtró a titulares con etiqueta unánime entre entidades, lo que infla artificialmente la dificultad controlada.
- Licencia MIT: permite uso comercial sin restricciones adicionales conocidas, pero conviene revisar las licencias de los datasets de entrenamiento por si imponen condiciones sobre los pesos derivados.
- No apto para generación de texto, agentes ni razonamiento; su uso debe limitarse a clasificación de sentimiento.
- La fecha de creación del repositorio (2026-11-25) y el número de descargas (0) indican un modelo muy reciente y sin adopción verificable en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/looky/finbert-minilm-sentiment
- Modelo base: https://huggingface.co/microsoft/MiniLM-L12-H384-uncased
- Dataset Financial PhraseBank: https://huggingface.co/datasets/takala/financial_phrasebank
- Dataset Twitter Financial News Sentiment: https://huggingface.co/datasets/zeroshot/twitter-financial-news-sentiment
- Dataset Financial News Sentiment: https://huggingface.co/datasets/Jean-Baptiste/financial_news_sentiment
- Dataset SEntFiN: https://huggingface.co/datasets/tasksource/sentfin
- Proyecto educativo complementario (nano-finbert): https://github.com/shaikn6/nano-finbert
- Versión v2 (tag): https://huggingface.co/9mark9/finbert-minilm-sentiment/tree/v2-mixed-domain
- Versión v1 (tag): https://huggingface.co/9mark9/finbert-minilm-sentiment/tree/v1-phrasebank-only
