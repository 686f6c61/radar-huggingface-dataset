# saa938/presonance-goemotions-ensemble

## Resumen

Presonance GoEmotions prediction ensemble es un sistema de clasificación multi-etiqueta de emociones en texto, publicado por el usuario saa938 en Hugging Face. No se trata de un modelo neuronal entrenado desde cero, sino de una receta de inferencia fija que combina dos clasificadores existentes: un 25 % del checkpoint sin modificar SamLowe/roberta-base-go_emotions y un 75 % del checkpoint sin modificar cirimus/modernbert-base-go-emotions. La contribución del autor es la mezcla de probabilidades, la selección de umbrales de decisión sobre el split de desarrollo y un wrapper de inferencia reproducible.

El modelo resuelve la tarea de asignar, a un comentario, una o varias de las 28 categorías emocionales del dataset GoEmotions de Google (incluyendo la etiqueta neutral). Es relevante para desarrolladores que necesitan un clasificador de emociones ligero, desplegable en CPU y con licencia permisiva, pero conviene subrayar que no aporta pesos nuevos: descarga los dos checkpoints originales en el primer uso y aplica una lógica de ensemble documentada.

La arquitectura subyacente es la de los dos especialistas combinados (RoBERTa-base y ModernBERT-base), ambos transformers encoder-only de tipo BERT. El contexto efectivo está limitado por la ventana de los modelos base, y el sistema está pensado exclusivamente para inglés y para texto de comentarios de Reddit, el dominio del dataset GoEmotions.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de dos transformers encoder-only (RoBERTa-base y ModernBERT-base); wrapper de inferencia con mezcla ponderada 25/75 y umbrales por etiqueta |
| Parametros totales | No disponible (suma de dos checkpoints base; el repositorio no declara el recuento agregado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de los modelos base) |
| Tipos de cuantizacion | No disponible; se ejecuta en CPU como condición aritmética validada, con opción de CUDA |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT (wrapper y configuración); los pesos de los especialistas conservan su licencia MIT original |
| Formato de pesos | No disponible para el ensemble; los checkpoints base se descargan de sus proveedores originales en el primer uso (aproximadamente 1 GB de pesos) |

## Arquitectura y entrenamiento

El sistema no entrena ninguna red neuronal nueva. Consiste en un wrapper que carga dos clasificadores públicos de emociones sobre GoEmotions, fija sus revisiones inmutables en `ensemble.json` y combina sus salidas: 25 % de probabilidad proveniente de SamLowe/roberta-base-go_emotions y 75 % de cirimus/modernbert-base-go-emotions. Sobre la mezcla se aplican umbrales de decisión por etiqueta seleccionados en el split DEV del dataset. Cada comentario recibe 28 probabilidades independientes y se emiten las etiquetas que superan su umbral correspondiente, preservando conjuntos vacíos y salidas de tipo neutral más otra emoción sin fallback inventado.

Los datos de referencia son GoEmotions de Google, con recuentos originales de 43 410 ejemplos de TRAIN, 5 426 de DEV y 5 427 de TEST. La mezcla y los umbrales se calibraron exclusivamente sobre DEV, sin optimización de umbrales sobre TEST. El autor advierte que la secuencia experimental más amplia ya había observado resultados previos de TEST, por lo que la evidencia es de desarrollo y no una confirmación completamente virgen. Además, 48 textos normalizados de TEST aparecen también en TRAIN o DEV, y se reporta un análisis de sensibilidad que los excluye sin reentrenar.

## Capacidades

- Clasificación multi-etiqueta de emociones en inglés sobre 28 categorías del esquema GoEmotions.
- Salida de 28 probabilidades independientes por comentario, más selección de etiquetas mediante umbrales DEV fijos.
- Manejo explícito de casos sin etiqueta (conjunto vacío) y de combinaciones neutral más otra emoción.
- Inferencia en CPU como condición validada; soporte opcional de CUDA mediante `device="cuda"`, sin garantía declarada de paridad exacta CPU/CUDA.
- Wrapper de Python (`EmotionEnsemble`) e interfaz de línea de comandos (`python predict.py --text ...`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Moderación y análisis de comunidades online: el modelo puede etiquetar comentarios de foros y redes con las 28 emociones de GoEmotions, aprovechando que fue calibrado sobre comentarios de Reddit y que su licencia MIT permite integrarlo en servicios de moderación.
- Enrutado de tickets de soporte por tono emocional: clasificar mensajes de clientes en categorías como enfado, frustración o gratitud permite priorizar colas de atención; el modelo es ligero y corre en CPU, lo que abarata el despliegue a gran volumen.
- Analítica de sentimiento granular en encuestas abiertas: en lugar de un único sentimiento positivo/negativo, el ensemble devuelve 28 probabilidades que permiten agregar distribuciones emocionales por segmento de usuarios.
- Investigación en psicolingüística computacional: el wrapper reproducible con umbrales fijos y revisiones inmutables facilita experimentos comparables sobre corpus en inglés, siempre que se respeten las advertencias de dominio y demografía.
- Filtrado previo en pipelines de anotación humana: usar las probabilidades como señal de preetiquetado para reducir el coste de anotadores humanos en proyectos de etiquetado emocional, revisando después los casos de baja confianza.
- Detección de toxicidad indirecta o tensión en hilos de discusión: las etiquetas de disgusto, enfado o desaprobación pueden alimentar alertas tempranas en comunidades, combinadas con otras señales y nunca como decisión única.
- Enriquecimiento de datasets para entrenamiento de otros modelos: generar metadatos emocionales multi-etiqueta sobre corpus de texto en inglés con un coste de cómputo bajo.

## Benchmarks y rendimiento

Datos autodeclarados por el autor en el model-index, no verificados de forma independiente (`verified: false`). Evaluación sobre el split de test original de GoEmotions de Google, configuración simplified, 5 427 comentarios.

| Metrica | Valor |
|---|---|
| Macro F1 | 0,555733 |
| Micro F1 | 0,616475 |

Comparación declarada por el autor: ModernBERT solo, con calibración equivalente sobre DEV, alcanza 0,549332 de macro F1. La ganancia del ensemble queda dentro de un intervalo ajustado de [-0,006237, 0,021565], por lo que el autor califica la mejora como incierta. No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros), que además no aplican a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el autor indica que se requiere aproximadamente 1 GB de pesos más memoria adicional en tiempo de ejecución.
- GPU recomendadas: no se especifican; el sistema está validado en CPU y admite CUDA opcional. Cualquier GPU con al menos unos pocos GB de VRAM libre debería acomodar ambos checkpoints base, aunque el autor no aporta cifras.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño de los modelos base (RoBERTa-base y ModernBERT-base), aunque no se documenta una lista concreta de tarjetas verificadas.
- Opciones de despliegue: wrapper propio `predict.py` con Python; no es un checkpoint único de `AutoModel` ni un endpoint alojado. No se documenta integración con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro F1 en GoEmotions test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Presonance GoEmotions ensemble (este) | Suma de dos bases; no declarado | No disponible | 0,555733 (autodeclarado) | MIT | Hugging Face, wrapper propio |
| cirimus/modernbert-base-go-emotions (solo, calibrado en DEV) | Base ModernBERT; no declarado | No disponible | 0,549332 (según el autor) | MIT | Hugging Face |
| SamLowe/roberta-base-go_emotions (solo) | Base RoBERTa; no declarado | No disponible | No disponible en la informacion proporcionada | MIT | Hugging Face |

## Limitaciones y advertencias

- No es un modelo clínico ni una herramienta de medición individual de emociones; no debe inferirse el estado mental de una persona a partir de una categoría predicha.
- Entrenado y evaluado sobre comentarios de Reddit en inglés; el rendimiento puede degradarse ante cambios de dominio, registro o demografía.
- Riesgo de alucinación de etiquetas en el sentido de asignar emociones no presentes; los umbrales fijos mitigan pero no eliminan falsos positivos.
- La mejora frente a ModernBERT solo está respaldada por un intervalo que incluye el cero, según el propio autor; no debe presentarse como superioridad demostrada.
- La evaluación no es una confirmación completamente limpia: la secuencia experimental ya había observado resultados de TEST con anterioridad y 48 textos de TEST aparecen en TRAIN o DEV.
- Exposición en preentrenamiento de los modelos base y agrupaciones autor/hilo no resueltas.
- Solo inglés; no hay soporte multilingüe declarado.
- La licencia MIT cubre el wrapper y la configuración; los pesos de los especialistas mantienen su atribución original y los datos GoEmotions no se redistribuyen (acceso bajo CC BY 4.0 del release de Google y Apache 2.0 del código fuente).
- No es un checkpoint único: requiere descargar los dos modelos base en el primer uso, lo que añade dependencia de disponibilidad de terceros.

## Enlaces

- Hugging Face: https://huggingface.co/saa938/presonance-goemotions-ensemble
- Modelo base RoBERTa: https://huggingface.co/SamLowe/roberta-base-go_emotions
- Modelo base ModernBERT: https://huggingface.co/cirimus/modernbert-base-go-emotions
- Dataset GoEmotions (Google Research): https://github.com/google-research/google-research/tree/2adf640a14f11025ae5a9d0ec493b78530d276d3/goemotions
- Paper original de GoEmotions: https://aclanthology.org/2020.acl-main.372/
