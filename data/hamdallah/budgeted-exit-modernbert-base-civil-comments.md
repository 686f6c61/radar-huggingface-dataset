# hamdallah/budgeted-exit-modernbert-base-civil-comments

## Resumen

Budgeted-exit-modernbert-base-civil-comments es un fine-tune completo de ModernBERT-base (150M parámetros) desarrollado por el usuario hamdallah para moderación de contenidos. El modelo añade siete cabezas de clasificación en salidas intermedias (capas 4, 7, 10, 13, 16, 19 y 22) y una política de salida temprana congelada y calibrada por control de riesgo conformal, de forma que la red deja de computar cuando la decisión final ya no puede cambiar dentro de un presupuesto de error explícito. Resuelve cuatro preguntas binarias sobre cada comentario (amenaza, ataque a la identidad, insulto y lenguaje obsceno) y las combina mediante una regla fija.

La relevancia del modelo es fundamentalmente metodológica: demuestra que es posible reducir el coste de inferencia de forma medible sin sacrificar calidad de decisión. En el test oficial de Civil Comments (96.862 comentarios), la política congelada ejecuta 5,88 de 22 capas de media, mantiene la balanced accuracy en 93,31% (0,35 puntos por debajo del modelo completo, con intervalo de confianza del 95% de [-0,65, -0,06]) y alcanza 7.294 textos/s en una A100, lo que supone una mejora de throughput de 2,64x frente a las 2.764 textos/s del modelo a profundidad completa.

Se trata de una release de investigación: un único dataset, una única semilla y una única regla escrita a mano. El autor advierte explícitamente de que los resultados deben re-medirse sobre datos propios antes de usarlo en producción, que el presupuesto de error se controla en expectativa (no por petición) y que no cubre desplazamientos de distribución. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base) con siete cabezas de clasificación en salidas intermedias y política de early exit |
| Parametros totales | 153.180.700 |
| Parametros activos | No aplica (no es un modelo MoE); profundidad media efectiva de 5,88 de 22 capas con la política congelada |
| Longitud de contexto | No disponible en la información proporcionada para este fine-tune (el modelo base ModernBERT-base declara 8.192 tokens en su propia documentación, dato no confirmado aquí) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en precisión completa (safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors), más config.json y frozen_policy.json |
| Tarea | text-classification (clasificación multietiqueta de moderación) |
| Capas con salida | 4, 7, 10, 13, 16, 19, 22 |
| Dataset de entrenamiento | google/civil_comments (CC0-1.0) |
| Modelo base | answerdotai/ModernBERT-base |
| Tamano del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

El modelo es un encoder transformer bidireccional de 22 capas basado en ModernBERT-base, con readout de mean pooling y un fine-tune completo (todos los pesos del encoder se actualizan). Sobre la representación de cada una de las siete capas de salida se entrena una cabeza de clasificación que produce cuatro probabilidades independientes, una por pregunta de moderación. El entrenamiento usó 55.271 filas de entrenamiento de Civil Comments (una muestra enriquecida con positivos raros adicionales), con entropía cruzada binaria sumada sobre todas las salidas, dos épocas y una única semilla. La calibración se hizo sobre una muestra uniforme separada de 99.140 filas de entrenamiento.

La innovación principal no está en el encoder sino en el mecanismo de decisión. Cada cabeza produce una probabilidad por pregunta que se mapea a la distribución natural de etiquetas mediante escalado de Platt; a partir de las cuatro probabilidades se calcula la probabilidad de la regla `threat or identity_attack or (insult and obscene)` asumiendo independencia (weighted model count). Para cada salida, un mapa isotónico estima la probabilidad de que la decisión a profundidad completa fuese positiva, ajustado sin usar etiquetas. Finalmente, un dial por dirección, escalado por la fracción de capas que aún quedan por ejecutar, decide qué ejemplos salen antes; esos diales se fijan mediante control de riesgo conformal contra el presupuesto de error (2% para decisiones positivas y 1% para negativas). Todos los parámetros de la política se almacenan como números planos en `frozen_policy.json`. En el test bloqueado, la política cambió el 1,65% de las decisiones positivas y el 0,90% de las negativas del modelo completo; la pérdida de 0,35 puntos de balanced accuracy proviene de un aumento de la tasa de falsos positivos del 7,0% al 7,7% con recall sin cambios.

## Capacidades

- Clasificación multietiqueta de comentarios en cuatro categorías: amenaza, ataque a la identidad, insulto y lenguaje obsceno.
- Composición de las cuatro señales en una decisión única mediante la regla fija `threat or identity_attack or (insult and obscene)` (aproximadamente 1,2% de positivos en el corpus).
- Inferencia adaptativa con salida temprana: devuelve, además de la decisión, la capa en la que el ejemplo abandonó la red (`exit_layers` en la API del runtime).
- Salidas intermedias utilizables de forma independiente: cada una de las siete cabezas produce probabilidades por pregunta, con balanced accuracy en validación de 91,45% (capa 4), 92,32% (7), 92,27% (10), 92,79% (13), 93,35% (16), 93,38% (19) y 93,48% (22).
- Calibración probabilística integrada: escalado de Platt por cabeza y mapas isotónicos hacia la decisión a profundidad completa.
- Control de riesgo conformal: el comportamiento de la política es ajustable mediante presupuestos de error por dirección.
- Procesamiento por lotes de alto rendimiento (7.294 textos/s en A100 con la política congelada).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, visión ni audio: es un encoder de clasificación, no un modelo generativo.
- No se declaran capacidades multilingües: solo inglés.

## Casos de uso

- Moderación de comentarios a escala en plataformas UGC: el modelo clasifica lotes de comentarios con un coste computacional medio de 5,88 capas por ejemplo, lo que permite filtrar volúmenes grandes en una sola GPU y derivar únicamente los casos dudosos a revisión humana.
- Triaje previo a revisión humana: la capa de salida devuelta por el runtime identifica los ejemplos que se resolvieron con pocas capas (decisiones fáciles) frente a los que agotaron la red, y estos últimos pueden enrutarse a un revisor con prioridad.
- Reducción de coste en pipelines de inferencia existentes: sustituir un clasificador ModernBERT a profundidad completa por esta política reduce el tiempo de cómputo en un factor de 2,64x en throughput medido, manteniendo la balanced accuracy dentro de 0,35 puntos.
- Pre-filtrado en sistemas de seguridad de contenido con presupuesto de error explícito: los diales conformales permiten fijar cuántas decisiones positivas (2%) y negativas (1%) puede cambiar el mecanismo de salida temprana, lo que hace auditable el compromiso entre coste y calidad.
- Investigación en computación adaptativa y control de riesgo conformal: el repositorio incluye `frozen_policy.json` con todos los parámetros de la política como números planos, lo que facilita reproducir, auditar o re-calibrar el mecanismo.
- Moderación por lotes de archivos históricos: dado que el throughput se midió con peticiones disponibles en bloque (16.000 textos de desarrollo en A100), encaja en procesos batch nocturnos sobre corpus archivados de comentarios.
- Evaluación comparativa de métodos de early exit: sirve como baseline reproducible frente a truncado estático de capas (la comparación del propio autor muestra 3.674 textos/s a 16 capas fijas frente a 7.294 con la política adaptativa).
- Filtrado previo en canalizaciones de anotación: usar la decisión del modelo para seleccionar qué comentarios merecen etiquetado humano reduce el coste de construcción de datasets de moderación.

## Benchmarks y rendimiento

Test oficial de Civil Comments, 96.862 comentarios, leído una sola vez tras fijar la política, los pesos, el código y el fichero de test. Regla: `threat or identity_attack or (insult and obscene)`.

| Sistema | Balanced accuracy | Cambio vs profundidad completa [IC 95%] | Profundidad media | Throughput (A100, 16k textos) |
|---|---:|---|---:|---:|
| Profundidad completa (22 capas) | 93,66% | - | 22 | 2.764 textos/s |
| Truncado estático en capa 16 | 93,86% | +0,20 [-0,18, +0,60] | 16 | 3.674 textos/s (1,33x) |
| Política de salida congelada (esta release) | 93,31% | -0,35 [-0,65, -0,06] | 5,88 | 7.294 textos/s (2,64x) |

Balanced accuracy de cada salida sobre el split de validación, si todos los comentarios se detuvieran ahí:

| Capa de salida | 4 | 7 | 10 | 13 | 16 | 19 | 22 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Balanced accuracy | 91,45% | 92,32% | 92,27% | 92,79% | 93,35% | 93,38% | 93,48% |

La política cambió el 1,65% de las decisiones positivas del modelo completo (presupuesto 2%) y el 0,90% de las negativas (presupuesto 1%). La tasa de falsos positivos pasó del 7,0% al 7,7% con recall sin cambios. No se han publicado resultados de benchmarks en la información disponible para tareas distintas de la moderación sobre Civil Comments (no hay MMLU, HumanEval, GSM8K ni equivalentes, que además no aplican a un clasificador).

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 153,18M parámetros, sin incluir activaciones ni overhead del runtime): aproximadamente 613 MB en FP32, 306 MB en FP16/BF16, 153 MB en INT8 y 77 MB en INT4. Los pesos publicados están en precisión completa.
- GPU recomendadas: la medición de referencia del autor se hizo en A100. Por tamaño, el modelo cabe en cualquier GPU con al menos 4 GB de VRAM.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, e incluso en iGPU con suficiente memoria compartida si se cuantiza.
- Opciones de despliegue: el runtime oficial del autor está en la carpeta `budgeted_exit/` del repositorio github.com/hamdallah90/decision-aware-inference e invoca directamente las capas de Hugging Face (probado con `transformers` 5.17). No se documentan integraciones con vLLM, Ollama, llama.cpp ni TGI, y no hay pesos GGUF publicados, por lo que la vía soportada es `transformers` más el código del proyecto.
- Latencia y throughput: 7.294 textos/s en A100 para la política congelada frente a 2.764 textos/s a profundidad completa. El autor advierte que el throughput se midió con peticiones disponibles en bloque y que la latencia bajo tráfico en vivo no fue medida.

## Comparativa con modelos similares

Los únicos sistemas comparados en la información disponible son variantes del propio modelo; no se publican comparaciones con clasificadores externos.

| Sistema | Parametros | Profundidad media | Balanced accuracy (test) | Throughput (A100) | Licencia |
|---|---:|---:|---:|---:|---|
| Este modelo (política congelada) | 153,2M | 5,88 de 22 | 93,31% | 7.294 textos/s | Apache-2.0 |
| ModernBERT-base fine-tuneado a profundidad completa | 153,2M | 22 | 93,66% | 2.764 textos/s | Apache-2.0 |
| Truncado estático en capa 16 | 153,2M (capas 17-22 sin usar) | 16 | 93,86% | 3.674 textos/s | Apache-2.0 |
| Otros clasificadores de moderación (DeBERTa, RoBERTa, DistilBERT, etc.) | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Un solo dataset (Civil Comments), una sola semilla y una sola regla escrita a mano. El autor recomienda re-medir sobre datos propios antes de confiar en el modelo.
- El presupuesto de error se controla en expectativa sobre datos similares a la muestra de calibración; no es una garantía por petición y no cubre cambios de distribución.
- El throughput se midió con peticiones disponibles en bloque; no se midió latencia bajo tráfico en vivo.
- Pérdida estadísticamente detectable de 0,35 puntos de balanced accuracy respecto al modelo completo, originada por un aumento de falsos positivos del 7,0% al 7,7% con recall sin cambios.
- Solo inglés. No hay soporte multilingüe declarado.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de error de clasificación: al ser un clasificador calibrado, puede producir falsos positivos y falsos negativos, especialmente en subgrupos poco representados.
- Sesgos: los datos de entrenamiento contienen lenguaje ofensivo y los sesgos de Civil Comments pueden trasladarse al modelo; no se publica un análisis de equidad por subgrupo.
- Uso previsto: investigación en moderación de contenidos. No debe emplearse para generar contenido ni para tomar decisiones automatizadas sobre personas sin revisión humana.
- Restricciones de licencia: Apache-2.0, permite uso comercial, pero el autor limita explícitamente el uso previsto a investigación de moderación.
- Dependencia de `transformers` 5.17: el runtime llama directamente a capas de Hugging Face y no se ha probado con otras versiones.
- Release de investigación con 0 descargas y 0 likes en el momento de la consulta, sin validación externa independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hamdallah/budgeted-exit-modernbert-base-civil-comments
- Repositorio del proyecto (carpeta `budgeted_exit/`): https://github.com/hamdallah90/decision-aware-inference
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Dataset de entrenamiento: https://huggingface.co/datasets/google/civil_comments
- Las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo: únicamente aparecieron páginas sin relación con el contenido (resultados de lotería), por lo que no se dispone de papers, blogs ni demos adicionales.
