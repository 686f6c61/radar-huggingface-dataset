# mertcankaratas/turkish-chat-moderation

## Resumen

Turkish chat moderation es un conjunto de clasificadores binarios de texto para turco cuyo objetivo es etiquetar un mensaje de chat como `clean` u `offensive`. Lo desarrolla mertcankaratas en el contexto de un trabajo de asignatura (SWE015, caso de uso 4) y se publica en Hugging Face con licencia MIT. No es un modelo generativo, sino una familia de clasificadores: una línea base léxica con distancia de edición, un tf-idf con regresión logística, una red feedforward sobre word2vec propio y un BERTurk afinado para clasificación, con una variante cuantizada dinámicamente a INT8.

El modelo principal se construye sobre `dbmdz/bert-base-turkish-uncased`, un BERT base para turco, y se afina sobre el split de entrenamiento del corpus OffensEval-TR 2020. La motivación declarada es la moderación de chat en tiempo real con un presupuesto de latencia de 50 ms por mensaje en un solo núcleo de CPU: la versión FP32 no cumple ese presupuesto (64 ms de media), mientras que la variante INT8 sí (32,78 ms de media), a cambio de una caída de macro-F1 de 0,8224 a 0,8157.

Es relevante ahora por dos motivos: demuestra un flujo de cuantización dinámica de PyTorch aplicado a un clasificador BERT en producción con métricas de latencia medidas, y ofrece una comparativa honesta entre enfoques clásicos y neuronales sobre el mismo conjunto de test oficial (3528 tuits). El repositorio pesa 0,7 GB e incluye todos los artefactos, no solo los pesos del transformer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (transformer encoder) para clasificación, con cabeza de clasificación binaria; se incluyen además línea base léxica, tf-idf + regresión logística y word2vec + red feedforward |
| Parametros totales | no disponible (el modelo base es `dbmdz/bert-base-turkish-uncased`, BERT base; el autor no declara el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el autor no declara la longitud máxima de secuencia usada en el afinado; el modelo base es BERT, típicamente 512 tokens) |
| Tipos de cuantizacion | FP32 (BERTurk afinado) e INT8 (cuantización dinámica de PyTorch sobre `nn.Linear`); además FP64 para tf-idf + regresión logística y FP32 para la red feedforward |
| Idiomas soportados | turco (`tr`) |
| Licencia | MIT |
| Formato de pesos | safetensors y joblib en el repositorio; `berturk-int8/model_int8.pt` es un state dict de PyTorch que requiere reconstruir el modelo desde `config.json` y aplicar `torch.ao.quantization.quantize_dynamic` antes de `load_state_dict` |

## Arquitectura y entrenamiento

La pieza principal es un BERT base en turco (`dbmdz/bert-base-turkish-uncased`) afinado como clasificador binario. Sobre él se aplica cuantización dinámica de PyTorch (`torch.ao.quantization.quantize_dynamic` sobre capas `nn.Linear`), que reduce el tamaño de 422 MB a 177 MB y el tiempo de inferencia en CPU de 63,97 ms a 32,78 ms de media por mensaje. Cada carpeta de BERTurk incluye un `threshold.json` con el umbral de decisión ajustado sobre el split de validación, lo que indica que la salida no se binariza a 0,5 sino con un umbral calibrado.

Los datos de entrenamiento proceden del corpus de Çağrı Çöltekin, *A Corpus of Turkish Offensive Language on Social Media* (LREC 2020), con anotaciones CC-BY. Se usa el split oficial de entrenamiento dividido 90/10 de forma estratificada con semilla 42 para train y validación, y el split oficial de test solo para la comparación final. El repositorio incluye también artefactos alternativos: un léxico aprendido del split de entrenamiento con un matcher de distancia de edición, un tf-idf con n-gramas de palabra 1–2 y de carácter 2–5 más regresión logística, y un word2vec entrenado sobre el propio split de entrenamiento acoplado a una red feedforward. No se documenta en la información disponible el uso de RLHF, DPO ni un número de tokens de entrenamiento.

## Capacidades

- Clasificación binaria de texto en turco: etiqueta un mensaje como `clean` u `offensive`.
- Detección de lenguaje ofensivo en publicaciones de redes sociales, con umbral de decisión calibrado sobre validación.
- Inferencia en CPU con presupuesto de latencia: la variante INT8 cumple el objetivo de 50 ms por mensaje en un solo núcleo.
- Despliegue con `transformers` (pipeline `text-classification`) y con PyTorch nativo para el state dict cuantizado.
- Disponibilidad de cuatro enfoques alternativos (léxico, tf-idf, word2vec + FFN, BERTurk) para comparar coste y precisión.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un clasificador, no un modelo generativo.
- Capacidad multilingüe: ninguna; solo turco.

## Casos de uso

- Moderación de chat en tiempo real: el clasificador INT8 procesa un mensaje en 32,78 ms de media en un núcleo de CPU, por lo que puede insertarse como filtro previo en un servidor de chat sin GPU y sin añadir latencia perceptible al usuario.
- Prefiltrado en pipelines de moderación con revisión humana: los mensajes marcados como `offensive` se enrutan a un moderador humano, reduciendo el volumen de revisión manual; el umbral ajustado en `threshold.json` permite priorizar precisión o exhaustividad.
- Despliegue en entornos sin GPU: la variante INT8 (177 MB) y el tf-idf (3,88 MB) caben en instancias pequeñas de CPU, lo que permite moderar foros o comunidades alojadas en infraestructura mínima.
- Filtrado de comentarios en plataformas turcas: integración como paso de prepublicación que bloquea o marca comentarios ofensivos antes de mostrarse, usando el pipeline `text-classification` de `transformers`.
- Investigación en detección de lenguaje ofensivo en turco: el repositorio incluye cuatro líneas base con métricas sobre el test oficial de OffensEval-TR 2020, útil como punto de partida reproducible para comparar nuevos modelos.
- Evaluación de compromiso latencia-precisión: sirve como caso práctico para medir el impacto de la cuantización dinámica INT8 en un clasificador BERT (caída de 0,0067 en macro-F1 frente a una reducción de latencia de aproximadamente el 49 %).
- Prototipado docente: el proyecto está pensado como trabajo de asignatura, con scripts de entrenamiento y documentación en el repositorio de GitHub, adecuado para reproducir el flujo completo en un curso.

## Benchmarks y rendimiento

Resultados sobre el test oficial de OffensEval-TR 2020 (3528 tuits). Latencia medida en CPU, batch size 1, media de 300 ejecuciones tras 20 de calentamiento, sobre un Intel Core i7-13700H de 13.ª generación con 1 hilo de PyTorch.

| Modelo | Precisión | Macro-F1 | Tamaño (MB) | Latencia media (ms) | Latencia p95 (ms) | ≤ 50 ms |
|---|---|---|---|---|---|---|
| Léxico + distancia de edición (reglas) | reglas | 0,6703 | 0,0009 | 0,03 | 0,06 | sí |
| tf-idf + regresión logística | FP64 | 0,7726 | 3,88 | 0,81 | 1,09 | sí |
| word2vec + red feedforward | FP32 | 0,6806 | 44,3 | 0,10 | 0,16 | sí |
| BERTurk (afinado) | FP32 | 0,8224 | 422 | 63,97 | 117,54 | no |
| BERTurk (cuantización dinámica) | INT8 | 0,8157 | 177 | 32,78 | 62,97 | sí |

## Requisitos de hardware

- VRAM para inferencia: no aplica en la configuración recomendada; la variante INT8 está pensada para CPU. El modelo BERTurk FP32 ocupa 422 MB en disco y puede ejecutarse en GPU, pero el autor no publica requisitos de VRAM.
- GPU recomendadas: no disponibles; el proyecto no documenta despliegue en GPU. Cualquier GPU con suficiente memoria para un BERT base podría ejecutar la variante FP32, pero no hay cifras publicadas.
- CPU: el benchmark se realizó en un Intel Core i7-13700H con un solo hilo de PyTorch. La variante INT8 cumple el presupuesto de 50 ms (media 32,78 ms, p95 62,97 ms); la FP32 no (media 63,97 ms, p95 117,54 ms).
- Cabe en hardware de consumo: sí, tanto la variante INT8 (177 MB) como el tf-idf (3,88 MB) y el léxico (0,0009 MB) caben en cualquier equipo, incluidos portátiles y dispositivos de gama baja.
- Opciones de despliegue: `transformers` con el pipeline `text-classification` para la variante estándar; PyTorch nativo para `berturk-int8/model_int8.pt`, reconstruyendo el modelo desde `config.json`, aplicando `quantize_dynamic` a `nn.Linear` y cargando el state dict. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: latencia media de 32,78 ms y p95 de 62,97 ms por mensaje en un hilo de CPU para la variante INT8; el autor no publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Macro-F1 (OffensEval-TR 2020) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BERTurk INT8 (este modelo) | BERT base (recuento no declarado) | no disponible | 0,8157 | MIT | Hugging Face, estado del repo 0,7 GB |
| BERTurk FP32 (este modelo) | BERT base (recuento no declarado) | no disponible | 0,8224 | MIT | Hugging Face |
| tf-idf + regresión logística (este modelo) | no aplica | no aplica | 0,7726 | MIT | Hugging Face (joblib) |
| word2vec + red feedforward (este modelo) | no disponible | no aplica | 0,6806 | MIT | Hugging Face |
| Léxico + distancia de edición (este modelo) | no aplica | no aplica | 0,6703 | MIT | Hugging Face (JSON) |

No se dispone de datos de benchmarks de otros modelos de moderación en turco en la información proporcionada, por lo que la comparación se limita a las variantes incluidas en el propio repositorio.

## Limitaciones y advertencias

- Entrenado sobre tuits, no sobre chat de videojuegos: el dominio de aplicación real puede diferir del de entrenamiento.
- Los insultos implícitos o sarcásticos a menudo no se detectan, según reconoce el propio autor.
- El léxico aprendido hereda los sesgos del dataset OffensEval-TR 2020.
- El autor lo declara destinado a un proyecto de curso e investigación, no para moderación sin supervisión.
- La variante FP32 no cumple el presupuesto de latencia de 50 ms en CPU (media 63,97 ms); solo la INT8 lo cumple, y su p95 (62,97 ms) supera ese presupuesto, por lo que en colas de latencia puede incumplirse.
- Solo soporta turco; no hay capacidades multilingües.
- El modelo INT8 se distribuye como state dict que exige un procedimiento de reconstrucción manual; no es cargable directamente con `from_pretrained` sin código adicional.
- Licencia MIT: permite uso comercial, pero el corpus de origen tiene anotaciones CC-BY, lo que conviene verificar si se redistribuyen datos derivados.
- El contenido de entrenamiento incluye tuits ofensivos; el autor advierte explícitamente de ello.
- Riesgo de alucinación: no aplica como modelo generativo, pero sí existe riesgo de falsos positivos y falsos negativos en la clasificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mertcankaratas/turkish-chat-moderation
- Modelo base BERTurk: https://huggingface.co/dbmdz/bert-base-turkish-uncased
- Corpus de lenguaje ofensivo en turco (Çöltekin, LREC 2020): https://coltekin.github.io/offensive-turkish/
- Referencia de BERTurk (Schweter, 2020): https://huggingface.co/dbmdz/bert-base-turkish-uncased
- Repositorio de GitHub del proyecto: no disponible (la model card lo menciona como `<GitHub repository>` sin URL)
