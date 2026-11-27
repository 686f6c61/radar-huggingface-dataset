# mishwani7/mBERT-Urdu-Nastaliq-Mental-Health

## Resumen

mBERT-Urdu-Nastaliq-Mental-Health es un ajuste fino del checkpoint `bert-base-multilingual-cased` orientado a la clasificación de texto en urdu (escritura perso-arábiga, variante nastaliq) para cribado de salud mental, concretamente para estimar la severidad de sintomatología depresiva. Lo desarrolla el usuario de Hugging Face mishwani7 y se publica bajo licencia MIT. El modelo resuelve un problema concreto: disponer de un clasificador calibrado que permita distinguir entre ausencia de depresión y distintos grados de severidad en texto clínico en urdu, un idioma con escasa cobertura de recursos específicos para salud mental.

La propuesta técnica más destacable no es la arquitectura en sí (un transformer BERT base multilingüe, sin cambios estructurales) sino la capa de calibración mediante *conformal risk control*: el autor publica umbrales de decisión derivados de un procedimiento de control de riesgo que acota la tasa de falsos negativos (FNR) al 5 % (alpha <= 0.05). El umbral de cribado conformal es 0,2797 y el umbral de severidad exacta es 0,0905. Esta aproximación aporta garantías estadísticas distribucionalmente libres sobre el error de omisión, algo poco habitual en clasificadores de salud mental publicados en Hugging Face.

El modelo tiene 177.856.516 parámetros (aproximadamente 178 M, coherente con la familia BERT base), un repositorio de 0,7 GB en formato safetensors, y se publica con pipeline `text-classification`. En el momento de la ficha no registra descargas ni likes, y no se han publicado resultados de benchmarks ni detalles sobre el conjunto de datos de ajuste fino en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base multilingüe, `bert-base-multilingual-cased`) |
| Parametros totales | 177.856.516 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT base; el autor no la especifica) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | urdu (ur), escritura perso-arábiga nastaliq |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Clases de salida | 4 (0: no depresión, 1: leve, 2: moderada, 3: severa) |
| Umbral de cribado conformal | 0,2797 (FNR <= 5 %) |
| Umbral de severidad exacta | 0,0905 |
| Tamano del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

La arquitectura es la de `bert-base-multilingual-cased`: un transformer encoder con atención bidireccional completa, tokenizador WordPiece con vocabulario multilingüe y representación de case. No se introducen modificaciones estructurales; el ajuste fino añade una cabeza de clasificación con cuatro clases de severidad depresiva. El modelo base es multilingüe, pero el ajuste se realiza específicamente sobre texto en urdu en escritura nastaliq, según indica el autor en la model card.

El elemento diferenciador del entrenamiento es la calibración posterior mediante *conformal risk control*. El autor reporta dos umbrales: uno de cribado (0,2797) que acota la tasa de falsos negativos al 5 % bajo un objetivo alpha <= 0.05, y otro de severidad exacta (0,0905). Este procedimiento busca garantías de cobertura sobre el riesgo de omitir casos positivos, algo crítico en cribado clínico. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, si hubo anotación clínica validada, ni si se aplicaron técnicas de aumento de datos o balanceo de clases.

## Capacidades

- Clasificación de texto en urdu (nastaliq) en cuatro niveles de severidad depresiva: no depresión, leve, moderada y severa.
- Cribado binario con umbral calibrado para acotar la tasa de falsos negativos al 5 %.
- Salida de probabilidad por clase utilizable para priorización de casos en flujos clínicos.
- Procesamiento de texto corto y medio (frases o párrafos) en escritura perso-arábiga.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- No dispone de capacidades multimodales (visión, audio) ni de modo "thinking".
- Capacidad multilingüe limitada al urdu en la práctica; el modelo base es multilingüe, pero el ajuste fino se documenta solo para urdu.

## Casos de uso

- Cribado inicial en salud mental digital: el modelo clasifica mensajes de pacientes en urdu y, aplicando el umbral conformal de 0,2797, deriva a evaluación clínica los casos con riesgo de depresión, acotando la omisión de positivos al 5 %.
- Triaje en servicios de atención telefónica o chat: permite priorizar conversaciones según severidad estimada (leve, moderada, severa) para asignar recursos humanos de forma proporcional.
- Investigación en epidemiología y salud pública: análisis de corpus de texto en urdu (foros, encuestas abiertas, redes sociales) para estimar prevalencia de sintomatología depresiva con una métrica calibrada y documentada.
- Monitorización longitudinal de pacientes: integrado en una aplicación de seguimiento, compara la clase asignada a lo largo del tiempo para detectar empeoramiento y activar alertas.
- Filtrado y anotación asistida en proyectos de etiquetado: preetiqueta grandes volúmenes de texto en urdu para que anotadores humanos revisen solo los casos dudosos o positivos, reduciendo coste de anotación.
- Sistemas de alerta en comunidades online: detección de mensajes con indicios de depresión severa en plataformas en urdu para activar protocolos de moderación y derivación a recursos de ayuda.
- Evaluación comparativa de calibración: sirve como referencia metodológica para investigadores que quieran aplicar *conformal risk control* a otros clasificadores clínicos en idiomas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta los umbrales de calibración conformal (0,2797 para cribado con FNR <= 5 % y 0,0905 para severidad exacta), sin métricas de precisión, recall, F1, AUC ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,7 GB de pesos más overhead de activaciones; en la práctica cabe en cualquier GPU consumer con 2 GB o más.
- VRAM estimada en FP16: en torno a 0,35-0,4 GB de pesos; ejecutable en CPU sin problema para lotes pequeños.
- GPU recomendadas: cualquier GPU moderna sirve; para alto throughput, A100, H100, L4 o RTX 4090; para desarrollo, RTX 3060 o superior.
- Cabe holgadamente en GPU consumer (GTX 1650, RTX 3050, RTX 4060, etc.) e incluso en inferencia solo CPU con latencias de milisegundos por muestra.
- Opciones de despliegue: Hugging Face `transformers` con `pipeline("text-classification")`, TorchServe, FastAPI + transformers, ONNX Runtime tras conversión manual, y despliegue en contenedores ligeros. No se documentan artefactos GGUF ni soporte nativo en Ollama o llama.cpp.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño (178 M parámetros) se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| mBERT-Urdu-Nastaliq-Mental-Health (este) | 177,8 M | no disponible | urdu | MIT | Calibración conformal con FNR <= 5 % para cribado de depresión |
| `bert-base-multilingual-cased` (base) | 177,8 M | 512 tokens (estándar BERT) | 104 idiomas | Apache 2.0 | Modelo base sin ajuste clínico; no clasifica severidad |
| `xlm-roberta-base` | 278 M | 512 tokens (estándar) | 100 idiomas | MIT | Alternativa multilingüe habitual para ajuste en idiomas de bajos recursos; sin calibración clínica |
| `bert-base-urdu` (variantes de la comunidad) | ~110-178 M | 512 tokens (estándar) | urdu | variable | Modelos monolingües en urdu; sin garantías conformales documentadas |

La comparación con alternativas específicas de salud mental en urdu no está disponible en la información proporcionada. Las filas anteriores son referencias de la misma familia o categoría, no evaluaciones empíricas frente a este modelo.

## Limitaciones y advertencias

- No es un dispositivo médico ni sustituye una evaluación clínica; cualquier uso en producción sanitaria requiere validación externa y supervisión profesional.
- No se documentan métricas de rendimiento (precisión, recall, F1, AUC) ni el dataset de ajuste fino, lo que impide evaluar su calidad real más allá de los umbrales conformales reportados.
- El modelo solo está ajustado para urdu en escritura nastaliq; su uso con otros idiomas o con transliteraciones latinas no está validado.
- Riesgo de sesgo demográfico y cultural: no se especifica la composición del dataset de entrenamiento (edad, género, región, contexto clínico), por lo que pueden existir sesgos no cuantificados.
- Riesgo de alucinación y de clasificación errónea en textos ambiguos, irónicos o con sintomatología mixta; la calibración conformal acota la FNR global, pero no garantiza el rendimiento por subgrupos.
- Los umbrales conformales (0,2797 y 0,0905) están calibrados sobre una distribución concreta; pueden no transferirse a otras poblaciones o dominios sin recalibración.
- Licencia MIT permite uso comercial, pero la responsabilidad legal y ética del uso clínico recae en el integrador.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validación por parte de la comunidad ni evidencia de uso en producción.
- No se documentan variantes cuantizadas ni artefactos listos para despliegue en runtimes ligeros.

## Enlaces

- Hugging Face: https://huggingface.co/mishwani7/mBERT-Urdu-Nastaliq-Mental-Health
- Modelo base: https://huggingface.co/bert-base-multilingual-cased
- Documentación de `transformers` para text-classification: https://huggingface.co/docs/transformers/tasks/sequence_classification
- No se han encontrado en la información disponible papers, blogs, repositorios ni demos adicionales asociados a este modelo.
