# chengli-thu/naming-ai-detector-rbt3-zh

## Resumen

El modelo `chengli-thu/naming-ai-detector-rbt3-zh` es un detector de texto generado por IA (AI-text detection) desarrollado por el usuario chengli-thu. Se construye mediante fine-tuning del encoder `hfl/rbt3` (una variante reducida de RoBERTa para chino, con 38.476.800 parámetros) y añade una cabeza triple que produce tres salidas: una probabilidad global de que el texto sea generado por IA, probabilidades y etiquetas por token, y una estimación de la proporción de contenido IA en el documento.

El modelo es bilingüe chino-inglés y se distribuye bajo la tarea `token-classification`. Su relevancia radica en que aborda un problema candente (la detección de contenido sintético) con una arquitectura muy ligera (40.692.100 parámetros totales, repo de 0,2 GB) que puede ejecutarse en CPU, lo que lo hace apto para filtrado a gran escala en plataformas editoriales, académicas o de moderación.

El autor reporta métricas de precisión y recall superiores al 97% sobre un conjunto de test congelado, si bien advierte que parte de los datos derivan de anotaciones no revisadas semánticamente y que uno de los splits (知乎 split 0) tuvo contacto histórico durante el desarrollo, por lo que no constituye una evaluación completamente ciega.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RBT3, variante reducida de RoBERTa para chino) con cabeza triple de clasificación |
| Parámetros totales | 40.692.100 (encoder RBT3: 38.476.800) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana de 256 tokens, hasta 16 ventanas por documento (4.096 tokens efectivos) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | no disponible (el autor declara que no puede emitir una licencia unificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del encoder `hfl/rbt3` en la revisión fija `0aa0527ff4170f29e1dfd3eb6ef60dc67e1bf75c` y le añade tres cabezas de predicción: clasificación global de documento, etiquetado por token y estimación de proporción IA. El procesamiento se realiza en ventanas de 256 tokens, con un máximo de 16 ventanas por documento; los tokens que exceden ese límite quedan marcados como `null` en `ai_mask` y se reportan a través del campo `coverage`.

El entrenamiento se realizó con semilla 42 durante 3 épocas sobre datos deduplicados que combinan las fuentes C-HAT, GPABench2, OpenReview, 知乎 (Zhihu) y artículos académicos en chino e inglés. El corpus de entrenamiento no se publica con el modelo. El autor advierte que algunas etiquetas derivadas de GPABench2 y de artículos, así como ciertos límites en textos de escritura mixta, están pendientes de revisión semántica. No se documenta el uso de RLHF ni DPO; se trata de un fine-tuning supervisado convencional. Los umbrales operativos fijados son 0,9146353305 para la clasificación a nivel de documento, 0,8666965961 para tokens y 0,05 para la detección de presencia IA en textos mixtos.

## Capacidades

- Detección de texto generado por IA a nivel de documento, con una probabilidad global (`probability_ai`).
- Etiquetado por token: devuelve offsets de caracteres Unicode (y offsets UTF-16 para uso en navegador), probabilidad y máscara binaria por token.
- Estimación de la proporción de contenido IA dentro de un documento (`ai_proportion`), útil para textos parcialmente generados.
- Procesamiento bilingüe chino-inglés.
- Manejo de documentos largos mediante ventanas deslizantes (hasta 16 ventanas de 256 tokens) con reporte de cobertura.
- Inferencia en CPU y GPU mediante un script `predict.py` incluido en el repositorio.
- API de Python a través de la clase `ThreeHeadDetector`.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento extendido; es un clasificador de tokens, no un modelo generativo.

## Casos de uso

- Moderación de contenido en foros y plataformas: el modelo puede puntuar cada publicación entrante con `probability_ai` y marcar automáticamente las que superen el umbral de 0,9146, con la ventaja de ejecutarse en CPU y a bajo coste.
- Verificación editorial en medios: revisión de manuscritos o artículos enviados por colaboradores, usando `ai_proportion` para distinguir entre textos íntegramente generados y textos con secciones sintéticas.
- Detección de plagio sintético en entornos académicos: análisis de trabajos en chino e inglés, con etiquetado por token que permite señalar los pasajes concretos sospechosos.
- Filtrado de datasets para entrenamiento: limpieza de corpus web eliminando documentos generados por IA antes de usarlos en el entrenamiento de otros modelos, gracias a su reducido tamaño (0,2 GB) y su capacidad de ejecución por lotes.
- Análisis forense de conversaciones: identificación de fragmentos generados dentro de hilos multi-turno en chino o inglés, aprovechando la salida por token y la cobertura reportada.
- Integración en pipelines de publicación automatizada: como paso de control de calidad previo a la publicación de contenido generado por redactores humanos, con umbrales configurables.
- Investigación sobre detección de IA: el modelo sirve como baseline ligero y reproducible (semilla 42, revisión fija del encoder) para comparar con detectores más grandes.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de test congelado de 80.424 registros (subconjunto de texto puro: 46.204 registros; 30.693 IA y 15.511 humanos), con umbral de documento 0,9146353305:

| Métrica | Valor |
|---|---|
| Precisión | 97,1899% |
| Recall | 97,0189% |
| Tasa de falsos positivos sobre humanos | 5,5509% |
| Macro-F1 | 0,9569 |
| PR-AUC | 0,99410 |
| IC 95% precisión (bootstrap 2.000, por grupo de origen) | 96,9879%–97,4004% |
| IC 95% recall (bootstrap 2.000, por grupo de origen) | 96,6448%–97,3398% |

Advertencias del autor sobre estos datos: 27.539 registros del test de texto puro derivan de alineamientos pendientes de revisión semántica; el split 0 de 知乎 se usó en fases 002/006 del desarrollo, por lo que la evaluación no es completamente ciega; y el recall en estratos pequeños como los artículos en inglés es notablemente inferior al global. No se proporcionan comparaciones con otros detectores.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 para los 40,69 M de parámetros (aproximadamente 163 MB de pesos); el repo completo ocupa 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; no requiere A100 ni H100.
- Cabe holgadamente en GPU de consumo: GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, así como en iGPU modernas.
- Inferencia en CPU viable y documentada por el autor (`python predict.py --device cpu --file example.txt`).
- Opciones de despliegue: script `predict.py` incluido, API de Python (`ThreeHeadDetector`), y exportación potencial a ONNX o a llama.cpp no documentada; vLLM y TGI no son aplicables a un encoder de clasificación de este tamaño.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| naming-ai-detector-rbt3-zh | 40,69 M | 256 tokens × 16 ventanas | zh, en | no disponible | Detección IA bilingüe con triple cabeza |
| hfl/rbt3 (modelo base) | 38,48 M | 512 tokens | zh | no disponible en la información | Encoder chino de propósito general |
| Detectores tipo RoBERTa-base para detección IA | ~125 M | 512 tokens | principalmente en | variable | Detección IA monolingüe inglés |

No se dispone de datos comparativos de rendimiento frente a otros detectores en la información proporcionada. La comparación con `hfl/rbt3` es estructural (es su modelo base); frente a detectores basados en RoBERTa-base, este modelo ofrece menor tamaño y cobertura bilingüe, a costa de un contexto efectivo menor por ventana.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo no debe usarse para decisiones de alto impacto (evaluación académica sancionadora, selección de personal, etc.).
- Tasa de falsos positivos del 5,55% sobre texto humano: aproximadamente 1 de cada 18 textos humanos se marcaría como IA con el umbral por defecto.
- Evaluación no completamente ciega: el split 0 de 知乎 estuvo expuesto durante el desarrollo, lo que puede inflar las métricas reportadas.
- 27.539 registros del test derivan de alineamientos sin revisión semántica; las etiquetas pueden contener ruido.
- Recall notablemente inferior en estratos pequeños como artículos académicos en inglés.
- Contexto limitado a 16 ventanas de 256 tokens (4.096 tokens); los documentos más largos quedan parcialmente sin evaluar, con cobertura reportada pero no garantizada.
- Solo cubre chino e inglés; otros idiomas no están soportados.
- Licencia no disponible: el autor no puede emitir una licencia unificada porque los derechos de redistribución de parte del corpus fuente no están verificados. La licencia de RBT3 no cubre automáticamente el código ni los pesos ajustados. Es imprescindible revisar las condiciones antes de cualquier uso comercial o redistribución.
- El corpus de entrenamiento no se publica, lo que dificulta la auditoría y la reproducibilidad completa.
- Riesgo de alucinación no aplicable en sentido generativo (es un clasificador), pero sí de clasificaciones erróneas sistemáticas sobre dominios no representados en el entrenamiento.
- Sesgos potenciales derivados de la composición del corpus (知乎, OpenReview, artículos) no cuantificados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chengli-thu/naming-ai-detector-rbt3-zh
- Modelo base RBT3: https://huggingface.co/hfl/rbt3
- Repositorio del autor (chengli-thu): https://huggingface.co/chengli-thu
- Referencia a `evaluation_summary.json` mencionada en la model card (incluido en el repo del modelo)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
