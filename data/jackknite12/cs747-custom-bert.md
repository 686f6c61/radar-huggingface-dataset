# JaCkKnite12/cs747-custom-bert

## Resumen

`cs747-custom-bert` es un modelo de clasificación de texto obtenido por fine-tuning de `google-bert/bert-base-uncased` para la detección de ensayos generados por IA. Lo publica el usuario JaCkKnite12 como uno de los cuatro miembros del ensemble del equipo CS747 AI Text Detection, y su función concreta es asignar a un texto una probabilidad de haber sido producido por un modelo generativo (etiqueta 1) frente a un texto humano (etiqueta 0).

Arquitectura y tamaño son los de BERT-base: transformer encoder de 12 capas, 768 dimensiones ocultas y 109.483.778 parámetros totales (unos 0,4 GB en safetensors), con una ventana de entrada de 512 tokens. No incorpora innovaciones arquitectónicas; el valor está en el ajuste fino sobre un corpus específico de ensayos y en su papel como componente de un sistema de votación mayor.

Es relevante ahora porque la detección de contenido generado es un problema operativo en entornos educativos y editoriales, y este modelo ilustra el patrón habitual: rendimiento casi perfecto en distribución (ROC-AUC 0,99978 en validación) y degradación notable fuera de ella (0,969 frente a generadores y fuentes no vistos), un dato que el propio autor declara.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (12 capas, 768 dimensiones ocultas) |
| Parametros totales | 109.483.778 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens (longitud de entrenamiento; límite posicional de BERT) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un `BertForSequenceClassification` estándar con dos etiquetas, cargable mediante `AutoModelForSequenceClassification`. La probabilidad de texto generado por IA se obtiene como `softmax(logits)[:, 1]`. El tokenizador asociado es el de `bert-base-uncased` (WordPiece, minúsculas), con truncado a 512 tokens.

El ajuste fino se realizó sobre el split de entrenamiento congelado del equipo (86.227 ensayos), reservando 18.477 ensayos de validación exclusivamente para seleccionar la mejor época. Hiperparámetros declarados: batch size 8, learning rate 2e-5, warmup del 6 %, weight decay 0,01, precisión bf16 y semilla 747. La mejor época fue la 1, lo que sugiere convergencia muy rápida y riesgo de sobreajuste en épocas posteriores. La model card no documenta el proceso de generación del corpus, la proporción de ejemplos por clase ni si se aplicó algún tipo de aumento de datos.

## Capacidades

- Clasificación binaria de texto: distingue ensayo generado por IA (1) de ensayo humano (0).
- Salida de probabilidad calibrable mediante softmax sobre la clase positiva, apta para umbrales ajustables.
- Procesamiento de documentos de hasta 512 tokens por fragmento; textos más largos requieren troceado y agregación externa.
- Uso como miembro de un ensemble por votación o promedio de probabilidades junto a otros tres modelos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo de razonamiento explícito, visión ni audio.
- Capacidad multilingüe limitada al inglés, idioma de entrenamiento y del tokenizador base.

## Casos de uso

- Moderación de entregas académicas: integrado en un pipeline de corrección, el modelo puntúa cada ensayo y marca aquellos con P(AI) alta para revisión humana, usando el umbral configurable sobre `softmax(logits)[:, 1]`.
- Triaje editorial: en una redacción, clasificar automáticamente propuestas recibidas y priorizar la revisión manual de las que presentan señales de generación sintética.
- Componente de ensemble: combinar su probabilidad con las de los otros tres miembros del CS747 (incluidos los modelos TF-IDF, que según el autor generalizan mejor) mediante media o votación para reducir falsos positivos.
- Filtrado de datasets: detectar y descartar muestras generadas por IA al construir corpus de entrenamiento o evaluación para otros modelos.
- Señal auxiliar en plataformas de publicación: calcular una puntuación de autenticidad por artículo y mostrarla como indicador interno, nunca como veredicto definitivo.
- Investigación en detección: servir de línea base BERT para comparar contra clasificadores TF-IDF o modelos generativos en experimentos de atribución de autoría.
- Auditoría de contenidos históricos: reprocesar un archivo de documentos con el modelo para estimar la prevalencia de texto sintético en un periodo, asumiendo el sesgo de dominio declarado.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| ROC-AUC (validacion) | 0,99978 | Split de validacion del equipo (18.477 ensayos) |
| ROC-AUC (fuera de distribucion) | 0,969 | Ensayos de generadores y fuentes no vistos |

No se han publicado resultados de benchmarks estandar (MMLU, GLUE, etc.) en la informacion disponible. La comparación interna con los modelos TF-IDF del mismo equipo indica que este BERT es más débil en generalización fuera de distribución, sin que se aporten cifras de esos modelos.

## Requisitos de hardware

- VRAM para inferencia en fp32: aproximadamente 0,45 GB de pesos más activaciones; en la práctica cabe en cualquier GPU con 2 GB o más.
- VRAM en fp16/bf16: alrededor de 0,25 GB de pesos; cuantización a 8 bits no documentada pero viable con herramientas estándar.
- GPU recomendadas: innecesarias para uso individual; una T4, L4 o RTX 3060 en adelante ofrecen latencia muy baja. Para lotes grandes, A10G o A100 reducen el coste por documento.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 2060, RTX 3060, RTX 4090, así como en CPU para volúmenes moderados.
- Despliegue: `transformers` con PyTorch, Text Embeddings Inference (TEI), TorchServe o un servicio FastAPI propio. No se distribuyen pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamaño, se espera del orden de milisegundos por muestra de 512 tokens en GPU moderna, sin cifras verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cs747-custom-bert | 109,5 M | 512 | Deteccion IA/humano (ingles) | Apache 2.0 | Hugging Face |
| google-bert/bert-base-uncased | 110 M | 512 | Modelo base general | Apache 2.0 | Hugging Face |
| Miembros TF-IDF del ensemble CS747 | No disponible | No aplica | Deteccion IA/humano | No disponible | No publicados como modelo |
| Detectores comerciales (GPTZero, Turnitin) | No disponible | No disponible | Deteccion IA/humano | Propietaria | API/SaaS |

La comparación cuantitativa con los otros miembros del ensemble no es posible con los datos publicados: el autor solo indica que los TF-IDF generalizan mejor fuera de distribución. Frente a `bert-base-uncased`, la diferencia es de ajuste fino, no de arquitectura.

## Limitaciones y advertencias

- Degradación fuera de distribución: ROC-AUC cae de 0,99978 a 0,969 con generadores y fuentes no vistos, según reconoce el autor.
- Sesgo de dominio: entrenado sobre ensayos; su comportamiento en correos, código, redes sociales o textos técnicos no está validado.
- Solo inglés: no se ha evaluado en castellano ni en otros idiomas.
- Ventana de 512 tokens: documentos largos requieren fragmentación y una estrategia de agregación que puede introducir errores.
- Riesgo de falsos positivos contra escritura humana estilizada o asistida por herramientas, y de falsos negativos frente a generadores nuevos o parafraseados.
- Sobreajuste probable: la mejor época fue la 1, lo que apunta a una separación muy ajustada al corpus de entrenamiento.
- Uso comercial permitido por Apache 2.0, pero sin garantías; no debe usarse como prueba concluyente en decisiones académicas o disciplinarias sin revisión humana.
- Repositorio sin descargas ni likes y con documentación mínima: no hay tokenizador propio, tests ni evaluación independiente publicada.
- No es un modelo generativo: no produce texto, solo una puntuación de clasificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JaCkKnite12/cs747-custom-bert
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Documentación de `AutoModelForSequenceClassification`: https://huggingface.co/docs/transformers/model_doc/auto#transformers.AutoModelForSequenceClassification
