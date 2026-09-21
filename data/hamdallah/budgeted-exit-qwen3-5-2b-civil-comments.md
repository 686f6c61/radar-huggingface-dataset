# hamdallah/budgeted-exit-qwen3.5-2b-civil-comments

## Resumen

El modelo `hamdallah/budgeted-exit-qwen3.5-2b-civil-comments`, publicado por el usuario hamdallah, es un ajuste fino con LoRA del modelo de atención lineal híbrida Qwen3.5-2B orientado a la moderación de contenido en inglés. Sobre un backbone congelado en bf16 se montan siete cabezas de clasificación en otras tantas capas de salida temprana y una política de salida congelada, calibrada mediante control de riesgo conforme, que decide cuándo detener el cómputo.

El sistema responde cuatro preguntas de moderación (amenaza, ataque a la identidad, insulto y lenguaje obsceno), las combina con la regla `threat or identity_attack or (insult and obscene)` y abandona la red de forma anticipada cuando el signo de esa regla ya no puede cambiar dentro del presupuesto de error declarado. El repositorio contiene únicamente los adaptadores y las cabezas (26.678.044 parámetros, 0,1 GB); los pesos base se descargan desde `Qwen/Qwen3.5-2B`.

Su relevancia radica en que documenta una vía práctica para abaratar la moderación a gran escala sin degradar la calidad de decisión. En el split de test bloqueado de Civil Comments (96.862 comentarios) ejecuta 5,45 de 24 capas de media y alcanza 1.124 textos/s en una A100, 3,99 veces más que la profundidad completa, con una pérdida de exactitud balanceada de 0,18 puntos. Se trata de una publicación de investigación, entrenada y evaluada con un único conjunto de datos y una única semilla.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal (base Qwen3.5-2B) + adaptadores LoRA de rango 16 + siete cabezas de clasificación en capas de salida temprana |
| Parámetros totales | 26.678.044 (adaptadores LoRA y cabezas); requiere descargar aparte el modelo base Qwen3.5-2B |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no se distribuyen cuantizaciones alternativas; el backbone congelado se usa en bf16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B emplea una arquitectura de atención lineal híbrida. Sobre él se aplica un ajuste LoRA de rango 16 sobre todas las proyecciones lineales grandes, manteniendo el backbone congelado en bf16 y usando lectura del último token. Cada comentario se procesa como una única secuencia con las cuatro preguntas en un prefijo de prompt fijo. El entrenamiento usó 55.271 filas del split de entrenamiento de Civil Comments (una muestra enriquecida con positivos raros adicionales), con entropía cruzada binaria sumada sobre todas las salidas, dos épocas y una única semilla. La calibración se realizó sobre una muestra uniforme separada de 99.140 filas de entrenamiento.

La innovación principal es la política de salida anticipada. Cada cabeza de salida produce una probabilidad por pregunta que se reescala mediante escalado de Platt hacia la distribución natural de etiquetas; a continuación se calcula la probabilidad de la regla a partir de las cuatro probabilidades (recuento ponderado de modelos, asumiendo independencia). Para cada salida, un mapa isotónico (ajustado sin etiquetas) estima la probabilidad de que la decisión a profundidad completa fuese positiva. Un dial por dirección, escalado por la fracción de capas que quedan por ejecutar, decide qué muestras abandonan la red; los diales se fijan por control de riesgo conforme contra el presupuesto de error. Todos los parámetros de la política se almacenan como números planos en `frozen_policy.json`.

## Capacidades

- Clasificación de texto multi-etiqueta para cuatro preguntas de moderación: amenaza (*threat*), ataque a la identidad (*identity_attack*), insulto (*insult*) y lenguaje obsceno (*obscene*).
- Composición de las cuatro salidas en una única decisión binaria mediante una regla lógica fijada de antemano.
- Inferencia adaptativa con salida temprana en siete profundidades (capas 3, 7, 11, 15, 19, 23 y 24), controlada por un presupuesto de error explícito.
- Control de riesgo conforme: los diales se calibran para acotar la tasa de cambio respecto a la decisión a profundidad completa.
- No es un modelo generativo: no produce texto libre, solo logits de clasificación.
- No soporta *tool calling*, *function calling* ni flujos de agente.
- Capacidades multilingües: no disponibles; el modelo está entrenado y evaluado únicamente en inglés.
- Sin capacidades de visión, audio ni modo de razonamiento (*thinking*).

## Casos de uso

- Moderación de comentarios en plataformas: el modelo evalúa cada comentario contra las cuatro preguntas y aplica la regla para decidir si requiere intervención, con un coste de cómputo muy inferior al de la inferencia completa.
- Prefiltrado de alto volumen: al procesar 1.124 textos/s en una A100 con la política activa, sirve como primera etapa que descarta la mayoría del contenido inocuo antes de un revisor humano o de un modelo mayor.
- Reducción de coste en pipelines de moderación: ejecutar 5,45 de 24 capas de media abarata el coste por decisión en entornos donde el volumen es el factor dominante.
- Triaje con revisión humana: las decisiones positivas pueden enrutarse a revisión manual; el autor advierte explícitamente de que no debe usarse para decisiones automatizadas sobre personas sin supervisión humana.
- Etiquetado de grandes corpus: la salida rápida permite anotar conjuntos de comentarios a escala para análisis o para construir datos de entrenamiento de etapas posteriores.
- Investigación sobre cómputo adaptativo: sirve como referencia reproducible de cómo combinar salidas tempranas, calibración de Platt, mapas isotónicos y control de riesgo conforme en un clasificador real.
- Monitorización en foros y comunidades: la ventana de contexto del modelo base permite analizar comentarios individuales con prompt fijo, adecuada para seguimiento continuo de toxicidad.

## Benchmarks y rendimiento

Resultados en el split de test oficial de Civil Comments (96.862 comentarios), leído una sola vez tras fijar y *hashear* la política, los pesos, el código y el fichero de test. La regla positiva es aproximadamente el 1,2 % de los casos.

| Sistema | Exactitud balanceada | Cambio vs profundidad completa [IC 95 %] | Profundidad media | Throughput (A100, 16k textos dev) |
|---|---:|---|---:|---:|
| Profundidad completa | 94,05 % | - | 24 | 282 textos/s |
| Truncamiento estático en la capa 11 | 93,92 % | -0,13 [-0,47; +0,21] | 11 | 593 textos/s (2,10x) |
| Política de salida congelada (esta publicación) | 93,87 % | -0,18 [-0,43; +0,07] | 5,45 | 1.124 textos/s (3,99x) |

Exactitud balanceada de cada salida evaluada en el split de validación, suponiendo que todos los comentarios se detuvieran en esa capa:

| Capa de salida | 3 | 7 | 11 | 15 | 19 | 23 | 24 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Exactitud balanceada | 91,78 % | 93,54 % | 94,02 % | 94,01 % | 94,15 % | 94,24 % | 94,03 % |

La política modificó el 2,54 % de las decisiones positivas del modelo completo (presupuesto del 2 %) y el 0,92 % de las negativas (presupuesto del 1 %). El autor señala que la primera cifra excede su presupuesto porque los mapas isotónicos y los diales se ajustaron sobre las mismas filas de calibración, por lo que el presupuesto debe considerarse aproximado.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Adaptadores y cabezas: 26,7 millones de parámetros, aproximadamente 53 MB en bf16.
- Pesos base Qwen3.5-2B: unos 2.000 millones de parámetros, aproximadamente 4 GB en bf16 (estimación a partir del tamaño de los pesos, no declarada en la información).
- VRAM total estimada para inferencia: en torno a 5-6 GB, sumando pesos base, adaptadores, activaciones y sobrecarga del runtime.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090). No se documenta una prueba específica en hardware de consumo.
- GPU recomendada para rendimiento: A100, la única sobre la que se publican medidas de throughput.
- Opciones de despliegue: el runtime llama directamente a las capas de Hugging Face y se probó con `transformers` 5.17; el código de carga y ejecución está en la carpeta `budgeted_exit/` del repositorio del proyecto. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama.
- Throughput medido: 282 textos/s a profundidad completa y 1.124 textos/s con la política de salida congelada, en una A100 y con peticiones disponibles en lote.
- Latencia: no medida para tráfico en vivo; el autor advierte de que las cifras de throughput corresponden a procesamiento por lotes y no a latencia interactiva.

## Comparativa con modelos similares

No se documentan en la información disponible modelos externos comparables de clasificación con salida temprana sobre Civil Comments. La comparación viable es con las variantes del propio sistema:

| Sistema | Parámetros usados | Profundidad media | Exactitud balanceada | Throughput relativo | Licencia |
|---|---|---:|---:|---:|---|
| Qwen3.5-2B a profundidad completa | 2B (backbone) | 24 | 94,05 % | 1,00x | Apache-2.0 |
| Truncamiento estático en capa 11 | 2B (backbone) | 11 | 93,92 % | 2,10x | Apache-2.0 |
| Política de salida congelada (esta publicación) | 2B (backbone) + 26,7M adaptadores | 5,45 | 93,87 % | 3,99x | Apache-2.0 |

## Limitaciones y advertencias

- Un único conjunto de datos, una única semilla y una regla escrita a mano; el autor recomienda volver a medir sobre datos propios antes de confiar en el modelo.
- El throughput se midió con peticiones disponibles en bloque; no se ha medido la latencia bajo tráfico en vivo.
- El presupuesto de error se controla en expectativa sobre datos similares a la muestra de calibración: no es una garantía por petición ni cubre cambios en la distribución (*distribution shift*).
- El presupuesto declarado para las decisiones positivas se incumple (2,54 % frente al 2 %), según reconoce el propio autor.
- Solo admite inglés; no hay soporte multilingüe.
- Los datos de entrenamiento contienen lenguaje ofensivo; el modelo se destina a investigación en moderación, no a la generación de contenido ni a decisiones automatizadas sobre personas sin revisión humana.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea en comentarios ambiguos, sarcásticos o dependientes de contexto externo al texto.
- Sesgos conocidos: no disponibles de forma explícita; Civil Comments es un corpus con sesgos demográficos y de anotación documentados en la literatura, y el modelo no declara mitigaciones específicas.
- El runtime invoca directamente las capas de Hugging Face y se probó con `transformers` 5.17; versiones distintas pueden requerir adaptaciones.
- Licencia Apache-2.0, heredada del modelo base, sin restricciones adicionales documentadas para uso comercial, aunque el uso responsable queda acotado por las advertencias anteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hamdallah/budgeted-exit-qwen3.5-2b-civil-comments
- Repositorio del proyecto (carpeta `budgeted_exit/`): https://github.com/hamdallah90/decision-aware-inference
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Conjunto de datos Civil Comments: https://huggingface.co/datasets/google/civil_comments
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo (únicamente páginas genéricas de servicios de Google).
