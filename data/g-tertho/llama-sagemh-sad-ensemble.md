# g-tertho/Llama-SAGEMH-SAD-Ensemble

## Resumen

Llama-SAGEMH-SAD-Ensemble es un clasificador de texto en inglés especializado en identificar la causa del estrés (stress-cause) en publicaciones de redes sociales. Lo desarrolla g-tertho (Tertho Ghosh, con Fahmida Sweety como coautora) en el marco de la tesis SAGEMH, un marco de clasificación de salud mental basado en recuperación y ensamblado con modelos de lenguaje pequeños. El modelo resuelve una tarea de clasificación de nueve clases: `school`, `financial problem`, `family issues`, `social relationships`, `work`, `health issues`, `emotion turmoil`, `everyday decision making` y `other`.

Técnicamente es un ensamblado de tres cabezas de clasificación de segunda etapa construidas sobre dos backbones distintos: dos sobre Qwen2-0.5B y una sobre Llama-3.2-1B-Instruct. La combinación se realiza mediante un voto suave con exponente 2.0 seleccionado sobre el conjunto de validación. No es un modelo generativo ni un transformer monolítico: es un checkpoint PyTorch personalizado que no se puede cargar con `AutoModelForSequenceClassification`.

Su relevancia es acotada pero concreta: demuestra que backbones pequeños (0,5B y 1B parámetros) con ajuste fino vía LoRA y un ensamblado bien calibrado pueden alcanzar un weighted F1 de 68,10 en una tarea de clasificación multiclase de salud mental, con un coste computacional muy bajo. La entrada se trunca a 32 tokens, lo que limita el modelo a fragmentos cortos de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamblado de tres cabezas de clasificación (LoRA + LayerNorm + capa lineal) sobre dos backbones transformer: 2x Qwen2-0.5B y 1x Llama-3.2-1B-Instruct |
| Parametros totales | No disponible de forma agregada; los backbones suman aproximadamente 2,0B (2 x 0,5B + 1,0B) más los adaptadores LoRA y cabezas |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32 tokens (truncado y padding fijo a 32) |
| Tipos de cuantizacion | No disponible (checkpoints PyTorch en precisión de entrenamiento) |
| Idiomas soportados | Inglés (en) |
| Licencia | Mixta: código y partes Qwen2 bajo Apache-2.0; partes Llama 3.2 bajo Llama 3.2 Community License |
| Formato de pesos | Checkpoints PyTorch (`.pt`): `checkpoints/SAD_Qwen2_la2.pt`, `checkpoints/SAD_Qwen2_s1mp.pt`, `checkpoints/SAD_LlamaI_r16.pt` |

## Arquitectura y entrenamiento

El modelo es un ensamblado de tres clasificadores de segunda etapa. Cada miembro parte de un backbone preentrenado (Qwen2-0.5B o Llama-3.2-1B-Instruct) al que se le aplica LoRA con rango 16, alpha 32, dropout 0,05 sobre todas las proyecciones lineales, seguido de LayerNorm y una capa lineal que proyecta a nueve clases. La longitud máxima de entrada es de 32 tokens, sin prompt ni plantilla de chat.

Los tres miembros se entrenaron con 30 épocas y selección de checkpoint por mejor pérdida de validación, con diferencias en la estrategia: LA2 (Qwen2-0.5B) usa entropía cruzada ajustada por etiqueta con tau 0,5, pooling de media simple, learning rate 2e-5 y semilla 42; S1mp (Qwen2-0.5B) usa sobremuestreo aleatorio con semilla 42, pooling de media enmascarada, learning rate 2e-5 y semilla 0; LlamaI (Llama-3.2-1B-Instruct) usa sobremuestreo aleatorio con semilla 42, pooling de media enmascarada, learning rate 1e-4 y semilla 0. La combinación del ensamblado aplica softmax a los logits de cada miembro, eleva las probabilidades a la potencia 2,0 y promedia las tres distribuciones, devolviendo la clase con mayor valor medio. Tanto el subconjunto de miembros como el exponente se seleccionaron sobre el split de validación (n = 616, weighted F1 67,70); el test (n = 684) se puntuó una sola vez.

## Capacidades

- Clasificación de texto en inglés en nueve clases de causa de estrés: `school`, `financial problem`, `family issues`, `social relationships`, `work`, `health issues`, `emotion turmoil`, `everyday decision making` y `other`.
- Predicción por lotes mediante `predict([...])` y obtención de puntuaciones normalizadas con `predict_scores([...])`.
- Interfaz de línea de comandos: `python inference.py --text "..."`.
- Entrada de texto crudo de redes sociales, sin necesidad de plantilla de chat ni prompt.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No genera texto: devuelve únicamente una etiqueta (y opcionalmente puntuaciones), sin justificación de la predicción.

## Casos de uso

- Moderación y triaje de comunidades online: el modelo puede procesar publicaciones cortas de foros o redes y etiquetar automáticamente la causa probable del estrés para enrutar el contenido a recursos de apoyo o a revisión humana, con un coste de inferencia mínimo al usar backbones de 0,5B y 1B.
- Investigación en salud mental computacional: sirve como baseline reproducible para experimentos de clasificación de causas de estrés en inglés, con métricas publicadas (weighted F1 68,10, macro F1 59,19, BACC 59,46, MCC 0,6304) y configuración de entrenamiento documentada.
- Enriquecimiento de datasets de redes sociales: permite anotar a escala grandes volúmenes de publicaciones con etiquetas de causa de estrés, que luego pueden filtrarse o revisarse manualmente en pipelines de anotación asistida.
- Sistemas de alerta temprana en plataformas de soporte: integrado en un pipeline que monitorice publicaciones de usuarios, el clasificador puede señalar categorías como `family issues` o `financial problem` para activar intervenciones o derivaciones.
- Análisis agregado de tendencias: al clasificar lotes de publicaciones por causa de estrés, permite construir series temporales o segmentaciones por categoría para estudios de opinión o salud pública.
- Componente de un sistema mayor de clasificación multietapa: dado que es un checkpoint PyTorch personalizado, puede insertarse como etapa de clasificación dentro del framework SAGEMH (recuperación + ensamblado) descrito en la tesis, donde la recuperación de contexto precede a la clasificación.

## Benchmarks y rendimiento

Resultados sobre el split de test (n = 684), según la model card:

| Miembro | Backbone | Pooling | Test wF1 | Test macro F1 | Test BACC |
|---|---|---|---|---|---|
| LA2 | Qwen2-0.5B | media simple | 64,29 | 54,45 | 55,79 |
| S1mp | Qwen2-0.5B | media enmascarada | 64,92 | 57,29 | 58,65 |
| LlamaI | Llama-3.2-1B-Instruct | media enmascarada | 65,21 | 56,55 | 56,16 |
| Ensemble | tres cabezas | softmax -> p^2 -> media | 68,10 | 59,19 | 59,46 |

Métricas adicionales del ensamblado: accuracy 68,57 y MCC 0,6304 sobre el mismo split de test. En validación (n = 616), el ensamblado alcanzó un weighted F1 de 67,70. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que la tarea es de clasificación específica.

## Requisitos de hardware

- VRAM estimada para inferencia: los backbones suman aproximadamente 2,0B parámetros (2 x 0,5B + 1,0B); en precisión FP16 se estiman en torno a 4-5 GB para los pesos, más overhead de activaciones y los checkpoints LoRA. El tamaño del repo es de 4,6 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM en FP16; una RTX 4090, A100 o H100 son holgadas para esta carga.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (por ejemplo, RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070 en adelante), dado el tamaño reducido de los backbones.
- Opciones de despliegue: el modelo no es compatible con `AutoModelForSequenceClassification`; requiere el script `inference.py` del repositorio y PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al ser un checkpoint personalizado de clasificación.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Requisito adicional: el primer uso descarga `Qwen/Qwen2-0.5B` y `meta-llama/Llama-3.2-1B-Instruct`; el repositorio de Llama está restringido, por lo que es necesario aceptar la licencia de Llama 3.2 y autenticarse antes de ejecutar.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. La model card solo compara los tres miembros internos del ensamblado entre sí (ver tabla de benchmarks). Como referencia estructural, los backbones base son Qwen2-0.5B (Apache-2.0, contexto nativo de 32 768 tokens) y Llama-3.2-1B-Instruct (Llama 3.2 Community License), pero este repositorio no reporta comparaciones con otros clasificadores de salud mental ni con modelos de la misma categoría.

| Modelo | Parámetros | Contexto usado | Tarea | Licencia |
|---|---|---|---|---|
| Llama-SAGEMH-SAD-Ensemble | ~2,0B (3 backbones) | 32 tokens | Clasificación 9 clases | Mixta (Apache-2.0 + Llama 3.2) |
| Qwen2-0.5B (base) | 0,5B | 32 768 tokens nativo | Generación | Apache-2.0 |
| Llama-3.2-1B-Instruct (base) | 1,0B | 128K tokens nativo | Generación / instrucciones | Llama 3.2 Community License |

## Limitaciones y advertencias

- El modelo predice una de nueve etiquetas de causa de estrés; no estima gravedad ni proporciona diagnóstico clínico.
- Entrenado exclusivamente con texto de redes sociales en inglés; puede no transferir a texto clínico ni a otros idiomas.
- Las etiquetas SAD son las del dataset original y presentan ruido de etiquetado.
- El ensamblado se seleccionó sobre validación y se evaluó en un único split de test de 684 ejemplos; no se reporta validación externa.
- No proporciona justificación de la predicción: devuelve solo la etiqueta (y puntuaciones), sin racional.
- Incluye pesos de Llama 3.2, por lo que su uso está sujeto a la Llama 3.2 Community License, con las restricciones que esta impone (incluida la cláusula de nombre y las limitaciones de uso comercial y de redistribución que establece Meta).
- La licencia es mixta: código y partes Qwen2 bajo Apache-2.0, partes Llama bajo Llama 3.2 Community License; es necesario revisar `LICENSE-LLAMA.txt` y `NOTICE` antes de cualquier uso en producción.
- El repositorio de Llama 3.2 está restringido; la ejecución requiere aceptar la licencia y autenticarse.
- Los datos de entrenamiento no se redistribuyen.
- La ventana de 32 tokens limita severamente la cantidad de contexto que el modelo puede considerar por publicación.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea o sobreconfiada en textos ambiguos o fuera de dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/g-tertho/Llama-SAGEMH-SAD-Ensemble
- Backbone Qwen2-0.5B: https://huggingface.co/Qwen/Qwen2-0.5B
- Backbone Llama-3.2-1B-Instruct: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Licencia Llama 3.2: https://llama.meta.com/llama3_2/license/
