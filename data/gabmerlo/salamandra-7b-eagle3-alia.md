# gabmerlo/salamandra-7b-eagle3-alia

## Resumen

Salamandra-7b-eagle3-alia es un modelo borrador (draft model) para decodificación especulativa basado en la técnica EAGLE-3, entrenado para acelerar la inferencia de BSC-LT/salamandra-7b-instruct-2606. Lo desarrolla gabmerlo y se publica bajo licencia Apache 2.0. No es un modelo generativo autónomo: su función es proponer tokens candidatos que el modelo objetivo Salamandra verifica, de modo que la salida final es idéntica a la de Salamandra sola, pero con menor latencia.

El checkpoint contiene 1.432.671.488 parámetros en pesos safetensors y ocupa 10,3 GB en el repositorio, en parte porque incluye una copia congelada de la tabla de embeddings de Salamandra (256k tokens). El vocabulario del borrador se limita a los 32.000 tokens más frecuentes en los datos de entrenamiento. Está entrenado específicamente para español, catalán, euskera y gallego, los cuatro idiomas cubiertos por Salamandra.

Su relevancia es práctica: la decodificación especulativa es una de las vías más eficaces para reducir la latencia de generación autoregresiva sin alterar la distribución de salida. Este draft permite desplegar Salamandra en vLLM con propuestas de 3 tokens por paso, lo que puede traducirse en aceleraciones significativas en entornos de producción multilingües del ámbito ibérico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Draft model EAGLE-3 para decodificacion especulativa (transformer ligero con cabeza de propuesta de tokens) |
| Parametros totales | 1.432.671.488 (incluye copia congelada de la tabla de embeddings de Salamandra, 256k tokens) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de hasta 4000 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | es, ca, eu, gl |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

El modelo es un draft EAGLE-3, una arquitectura de decodificación especulativa en la que un modelo pequeño predice varios tokens futuros a partir de los estados ocultos del modelo objetivo. EAGLE-3 propone múltiples tokens por paso de decodificación; en este caso, 3 tokens por paso. El checkpoint incorpora una copia congelada de la tabla de embeddings de Salamandra (256k tokens), lo que explica buena parte del tamaño del archivo (2,9 GB según la model card, 10,3 GB de repositorio). Esa parte congelada no penaliza la latencia.

El entrenamiento se realizó con vllm-project/speculators (versión 0.10.0a58) en modo online: vLLM 0.33.0 servía Salamandra y proporcionaba los estados ocultos mientras el draft entrenaba, ambos en una misma H100 80GB. Los datos provienen del dataset gabmerlo/salamandra-7b-instruct-2606-onpolicy-alia, aproximadamente 19k conversaciones generadas por el propio Salamandra (on-policy) a partir de prompts de ALIA-2606-SFT (CC BY 4.0). Se entrenó durante 3 épocas con secuencias de hasta 4000 tokens y un vocabulario draft de los 32.000 tokens más frecuentes; cada época duró unos 23 minutos. No se documenta uso de RLHF o DPO.

## Capacidades

- Aceleración de inferencia de Salamandra-7b-instruct-2606 mediante decodificación especulativa con 3 tokens propuestos por paso.
- Preservación exacta de la distribución de salida de Salamandra: la verificación garantiza que el texto final coincide con el del modelo objetivo.
- Cobertura multilingüe para español, catalán, euskera y gallego, alineada con los idiomas de Salamandra.
- Integración nativa con vLLM: el checkpoint declara el modelo objetivo, por lo que `vllm serve gabmerlo/salamandra-7b-eagle3-alia` funciona directamente.
- No realiza tool calling, agentes, visión ni audio por sí mismo; esas capacidades dependen del modelo objetivo Salamandra.
- No dispone de modo thinking ni de razonamiento autónomo; su única función es proponer tokens.

## Casos de uso

- Servicio de generación de texto multilingüe en producción: desplegar Salamandra con este draft en vLLM para atender peticiones en español, catalán, euskera y gallego con menor latencia por token, manteniendo exactamente la misma calidad de salida.
- Atención al cliente automatizada: reducir el tiempo de respuesta en conversaciones multi-turno donde la latencia perceptible es crítica, usando el draft para acelerar la generación del modelo objetivo sin cambiar el contenido.
- Generación de resúmenes y documentos en catalán y euskera: útil en administraciones públicas y medios que necesitan procesar grandes volúmenes de texto en lenguas cooficiales con latencia contenida.
- Traducción asistida y postedición: acelerar la generación de borradores traducidos entre español y las lenguas cooficiales, donde Salamandra ya está especializado.
- Investigación en decodificación especulativa: servir como referencia reproducible de un draft EAGLE-3 entrenado on-policy para experimentos de latencia y aceptación de tokens en modelos multilingües.
- Despliegue en entornos con GPU limitadas: al ser un draft de 1,4 mil millones de parámetros, puede acompañar a Salamandra en configuraciones donde el margen de VRAM es ajustado y la latencia importa más que el throughput bruto.
- Evaluación comparativa de técnicas de aceleración: comparar EAGLE-3 frente a otras propuestas (Medusa, decodificación especulativa clásica) sobre un modelo objetivo ibérico con métricas de aceptación de tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento reportados por el autor son las tasas de aceptación del draft en su split de validación tras la última época:

| Metrica | Resultado |
|---|---|
| Acierto del 1.er token propuesto | 66% |
| Acierto de los 2 primeros tokens | 44% |
| Acierto de los 3 tokens propuestos | 30% |
| Aceleracion (speedup) en prompts de test | no disponible (anunciado como "coming soon") |

## Requisitos de hardware

- El entrenamiento se realizó en una única NVIDIA H100 80GB, sirviendo simultáneamente Salamandra y entrenando el draft.
- VRAM para inferencia del draft: no disponible de forma explícita; el checkpoint pesa 2,9 GB en pesos (10,3 GB de repositorio), por lo que el draft en precisión completa requiere al menos unos 3 GB adicionales sobre la VRAM del modelo objetivo.
- La VRAM total depende de Salamandra-7b-instruct-2606, que debe residir junto al draft; se recomienda una GPU con margen suficiente para ambos (A100 40/80GB, H100, L40S).
- Despliegue previsto vía vLLM (`vllm serve gabmerlo/salamandra-7b-eagle3-alia`); no se documenta soporte para llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; el autor indica que publicará el speedup sobre los prompts de test (50 por idioma) próximamente.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|---|
| gabmerlo/salamandra-7b-eagle3-alia | Draft EAGLE-3 | 1,43B (incluye embeddings congelados) | no disponible | es, ca, eu, gl | Apache 2.0 | Publicado |
| BSC-LT/salamandra-7b-instruct-2606 | Modelo objetivo | 7B (aprox.) | no disponible | es, ca, eu, gl | no disponible | Modelo base |
| Otros drafts EAGLE-3 para Salamandra | Draft EAGLE-3 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre drafts alternativos comparables para Salamandra ni sobre métricas de speedup publicadas que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo generativo autónomo: solo funciona acoplado a BSC-LT/salamandra-7b-instruct-2606; no produce texto por sí mismo.
- Vocabulario draft restringido a los 32.000 tokens más frecuentes de los datos de entrenamiento; tokens fuera de ese conjunto no pueden proponerse y recaen siempre en el modelo objetivo, reduciendo la aceleración en dominios con vocabulario especializado.
- Entrenado exclusivamente con datos on-policy de Salamandra en español, catalán, euskera y gallego; el rendimiento de aceptación fuera de esos idiomas o dominios no está documentado.
- Las tasas de aceptación reportadas (66%/44%/30%) proceden de un split de validación propio del autor y no de un benchmark independiente; el speedup real no se ha publicado todavía.
- El repositorio ocupa 10,3 GB por la copia congelada de embeddings de 256k tokens, lo que aumenta los requisitos de almacenamiento y transferencia.
- Licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento provienen de ALIA-2606-SFT (CC BY 4.0); conviene verificar las condiciones de atribución de esa fuente.
- Riesgo de alucinación y sesgos: heredados del modelo objetivo Salamandra, no del draft, que no altera la distribución de salida.
- No se documentan cuantizaciones soportadas ni compatibilidad con runtimes distintos de vLLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gabmerlo/salamandra-7b-eagle3-alia
- Modelo base: https://huggingface.co/BSC-LT/salamandra-7b-instruct-2606
- Dataset de entrenamiento: https://huggingface.co/datasets/gabmerlo/salamandra-7b-instruct-2606-onpolicy-alia
- Librería de entrenamiento: https://github.com/vllm-project/speculators
- vLLM: https://github.com/vllm-project/vllm
