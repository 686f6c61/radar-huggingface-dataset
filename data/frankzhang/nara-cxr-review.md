# frankzhang/NARA-CXR-review

## Resumen

NARA-CXR (Neonatal Adaptation for Radiographic Assessment) es un adaptador de clasificación de imágenes diseñado para la lectura automatizada de radiografías de tórax en población neonatal. El modelo parte del encoder de visión CheXFound (ViT-L/16, DIAL-RPI) congelado y añade 24 adaptadores de cuello de botella de tipo Houlsby, junto con una cabeza de clasificación de diez salidas. El resultado es un checkpoint de unos 308 M de parámetros totales, de los cuales solo 3,23 M son entrenables, lo que permite adaptar un modelo fundacional de imagen médica a un dominio tan específico como el neonatal con un coste de entrenamiento mínimo.

La relevancia del modelo radica en el subdominio al que se dirige: la patología respiratoria y torácica neonatal presenta diferencias morfológicas y de escala considerables frente a la radiografía de tórax adulta, para la que se entrenan la mayoría de los modelos fundacionales. NARA-CXR aborda de forma conjunta diez hallazgos (enfermedad de membrana hialina, displasia broncopulmonar, taquipnea transitoria del recién nacido, neumonía, consolidación, atelectasia, neumotórax, derrame pleural, cardiomegalia y fractura), cubriendo tanto patología respiratoria típica del prematuro como hallazgos incidentales.

El checkpoint publicado contiene la red completa para inferencia, con pesos en `safetensors` (1.231.506.632 bytes) y una entrada fija de 512 × 512 píxeles RGB. Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a investigación y validación clínica más que a despliegue comercial inmediato.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ViT-L/16 congelado con 24 adaptadores de cuello de botella (Houlsby) y cabeza de clasificación multicabecera de 10 salidas |
| Parámetros totales | 308 M |
| Parámetros activos | no disponible (no es MoE); 3,23 M entrenables |
| Longitud de contexto | no disponible (modelo de visión, sin contexto textual) |
| Tipos de cuantización | no disponible (solo se publican pesos `safetensors` en precisión original) |
| Idiomas soportados | en (etiquetas y documentación en inglés) |
| Licencia | `chexfound-checkpoint-terms` (licencia "other", distinta de la licencia MIT del código fuente) |
| Formato de pesos | safetensors (`nara_cxr.safetensors`) |
| Entrada | 512 × 512 RGB |
| Tamaño del repo | 1,2 GB |
| SHA256 del checkpoint | `713b7736fab5e339cba2430bd8885f3341c4e5d95f1edf73778378d06edb7330` |

## Arquitectura y entrenamiento

La arquitectura es un clasificador de imagen construido sobre un encoder Vision Transformer ViT-L/16 procedente de CheXFound, un modelo fundacional de radiografía de tórax que integra representaciones globales y locales (Yang et al., IEEE Transactions on Medical Imaging, 2025). El encoder permanece congelado y la adaptación se realiza mediante 24 adaptadores de cuello de botella insertados en la red, siguiendo el diseño de Houlsby et al. (ICML 2019). Sobre las representaciones adaptadas se sitúa una cabeza de clasificación de diez objetivos, con umbrales operativos congelados registrados en `thresholds.json`.

El número de parámetros entrenables es de 3,23 M frente a 308 M totales, lo que sitúa la fracción entrenable en torno al 1 %. Esta configuración de ajuste eficiente en parámetros permite reutilizar un backbone de imagen médica ya preentrenado y adaptarlo a un dominio de datos escaso como el neonatal, sin reentrenar el encoder completo. La model card no documenta el volumen de tokens ni la composición exacta del dataset de entrenamiento, ni si se emplearon técnicas de alineación como RLHF o DPO (no aplicables a clasificación de imagen). Tampoco se especifican detalles sobre el régimen de aumento de datos, la resolución nativa del encoder ni la estrategia de muestreo de parches.

## Capacidades

- Clasificación de radiografía de tórax neonatal en diez objetivos simultáneos: NRDS (enfermedad de membrana hialina), BPD (displasia broncopulmonar), TTN (taquipnea transitoria del recién nacido), neumonía, consolidación, atelectasia, neumotórax, derrame pleural, cardiomegalia y fractura.
- Salida multicabecera con umbrales operativos congelados, apta para generar predicciones binarias o probabilísticas por hallazgo.
- Generación de mapas de calor (`--heatmap-dir`) para interpretabilidad visual de las regiones que activan cada salida.
- Procesamiento por lotes mediante un manifiesto CSV (`manifest.csv`) y raíz de imágenes, con salida de predicciones en CSV.
- Verificación reproducible de resultados mediante `verify_examples.py` contra una configuración esperada (`display.json`).
- Inferencia en GPU CUDA (`--device cuda`).
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades de agente, visión general, audio ni modo de pensamiento: es un clasificador de imagen cerrado.

## Casos de uso

- Triaje de radiografías neonatales en unidades de cuidados intensivos: el modelo evalúa de forma simultánea diez hallazgos torácicos sobre una única imagen de 512 × 512, lo que permite priorizar casos con neumotórax, derrame pleural o consolidación para revisión radiológica urgente.
- Segunda lectura asistida en programas de cribado de displasia broncopulmonar: al estar adaptado específicamente al dominio neonatal, puede emplearse como apoyo a la decisión en seguimiento de prematuros, comparando la salida del modelo con la lectura del especialista.
- Auditoría retrospectiva de cohortes: procesando un manifiesto CSV de estudios históricos, el modelo genera predicciones por hallazgo que permiten detectar discrepancias entre informes previos y patrones de imagen, útil en control de calidad de bases de datos clínicas.
- Investigación en epidemiología neonatal: la clasificación automática de grandes volúmenes de radiografías facilita la construcción de etiquetas para estudios sobre prevalencia de enfermedad de membrana hialina o taquipnea transitoria en cohortes amplias.
- Docencia y formación radiológica: los mapas de calor generados por el modelo sirven como material de apoyo para señalar regiones de interés en sesiones formativas, con la salvedad de que requieren validación experta.
- Integración en pipelines de investigación con ajuste eficiente: al mantener el encoder CheXFound congelado y solo 3,23 M de parámetros entrenables, el checkpoint puede servir como punto de partida para re-adaptar el modelo a subpoblaciones o centros con distinta distribución de equipos y protocolos.
- Validación de sistemas de IA médica: el par de scripts `infer.py` y `verify_examples.py`, junto con el SHA256 publicado, permite reproducir exactamente los resultados de referencia y usarlos como línea base en evaluaciones comparativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de AUC, sensibilidad, especificidad ni comparaciones con otros modelos en ningún conjunto de test.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 1,2 GB en `safetensors`; en precisión completa (presumiblemente fp32) requiere del orden de 1,5-2 GB de VRAM para los pesos, más memoria para activaciones por lote. No se documenta el uso de cuantización, por lo que no hay cifras oficiales para fp16, int8 o int4.
- GPU recomendadas: dado el tamaño moderado (308 M de parámetros), cualquier GPU con al menos 4 GB de VRAM debería poder ejecutar la inferencia; se documenta explícitamente el uso de `--device cuda`. No se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: previsiblemente sí, en tarjetas con 4-8 GB de VRAM o más, aunque el autor no confirma modelos concretos ni requisitos mínimos.
- Opciones de despliegue: el repositorio de inferencia proporciona un script `infer.py` en PyTorch con dependencias fijadas y el código fuente de CheXFound anclado a una versión concreta. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo de visión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NARA-CXR | 308 M (3,23 M entrenables) | Imagen 512 × 512 RGB | Clasificación neonatal, 10 salidas | `chexfound-checkpoint-terms` | Hugging Face (repo de 1,2 GB) |
| CheXFound (DIAL-RPI) | no disponible | Imagen de radiografía de tórax | Modelo fundacional de representaciones globales y locales | no disponible en la información proporcionada | Hugging Face (modelo base) |
| Alternativas neonatales específicas | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con el modelo base CheXFound, del que NARA-CXR hereda el encoder ViT-L/16. No se dispone de datos sobre otros modelos de clasificación neonatal comparables, ni de métricas que permitan situar a NARA-CXR frente a ellos.

## Limitaciones y advertencias

- Modelo de nicho con cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso externo ni validación independiente publicada.
- No se publican métricas de rendimiento clínico (AUC, sensibilidad, especificidad) en ningún conjunto de test, lo que impide evaluar su utilidad diagnóstica real.
- Riesgo de alucinación trasladado al dominio visual: la cabeza de clasificación puede producir falsos positivos o falsos negativos con confianza alta; los umbrales congelados en `thresholds.json` no han sido validados de forma externa según la información disponible.
- Sesgo de dominio: el entrenamiento se realizó sobre datos neonatales no documentados en composición; el comportamiento en otras poblaciones (adultos, pediatría general) o con equipos y protocolos distintos no está caracterizado.
- Idiomas: la documentación y las etiquetas están únicamente en inglés.
- Licencia restrictiva: los pesos se rigen por `chexfound-checkpoint-terms`, distinta de la licencia MIT del código fuente. El uso comercial requiere revisar `THIRD_PARTY_NOTICES.md`; el código MIT no relicencia el checkpoint.
- Dependencia de una versión anclada del código de CheXFound: la reproducibilidad depende de instalar la fuente fijada descrita en el repositorio de inferencia.
- Uso clínico: no se declara validación regulatoria ni marcado CE/FDA; debe tratarse como herramienta de investigación, no como dispositivo médico.
- Entrada fija de 512 × 512 RGB: cualquier imagen fuera de ese formato debe preprocesarse según lo documentado en el repositorio de inferencia, y un preprocesado incorrecto degrada las predicciones sin aviso explícito.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/frankzhang/NARA-CXR-review
- Código de inferencia y ejemplos: https://anonymous.4open.science/r/NARA-CXR-2D43/
- Metadatos del modelo: https://huggingface.co/frankzhang/NARA-CXR-review/blob/main/model.json
- Términos del checkpoint: https://huggingface.co/frankzhang/NARA-CXR-review/blob/main/THIRD_PARTY_NOTICES.md
- Modelo base CheXFound: https://huggingface.co/DIAL-RPI/CheXFound
- Paper de CheXFound: Yang et al., "Chest X-Ray Foundation Model With Global and Local Representations Integration", IEEE Transactions on Medical Imaging 44, 4787–4799 (2025), doi:10.1109/TMI.2025.3581907
- Paper de adaptadores: Houlsby et al., "Parameter-Efficient Transfer Learning for NLP", ICML (2019)
