# iDEM-Project/mBERT-ReadMe-CEFR-fold-1

## Resumen

mBERT-ReadMe-CEFR-fold-1 es un checkpoint de clasificación de dificultad textual desarrollado por el proyecto iDEM (Innovative and Inclusive Democratic Spaces for Deliberation and Participation) en la Universidad de Leeds. Se trata de un ajuste fino de `google-bert/bert-base-multilingual-uncased` con arquitectura `BertForSequenceClassification` y cuatro salidas, entrenado para evaluar la complejidad de textos multilingües según niveles CEFR. Forma parte de una serie de cinco modelos obtenidos mediante validación cruzada de cinco particiones; este repositorio contiene la partición 1.

El modelo aborda un problema concreto: la evaluación automática de legibilidad y dificultad textual en contextos de accesibilidad y comunicación administrativa clara. Se entrena sobre ReadMe++, un recurso multilingüe y multidominio con 9.757 frases anotadas con niveles CEFR en árabe, inglés, francés, hindi y ruso. El objetivo declarado es apoyar flujos de simplificación textual y investigación sobre comunicación accesible, no certificar accesibilidad.

Con 167 millones de parámetros y un contexto máximo de 512 tokens, es un modelo compacto orientado a inferencia económica. Su relevancia actual radica en la escasez de clasificadores de dificultad multilingües abiertos y en su vinculación con investigación publicada sobre estimación de incertidumbre y predicción selectiva en presencia de ruido (Khallaf y Sharoff, 2026).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder), `BertForSequenceClassification` con 4 salidas |
| Parametros totales | 167.359.492 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (truncación en el ejemplo de inferencia) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers, no documentada por el autor) |
| Idiomas soportados | ar, en, fr, hi, ru (entrenamiento); evaluación adicional en ca, it, es según D3.5 |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer encoder BERT multilingüe sin distinción de mayúsculas y minúsculas, con una cabeza de clasificación lineal de cuatro logits. Se inicializa desde `google-bert/bert-base-multilingual-uncased` y se ajusta con `BertForSequenceClassification`. La serie completa se obtiene mediante validación cruzada de cinco particiones sobre ReadMe++, un corpus de 9.757 frases anotadas con niveles CEFR en cinco idiomas y múltiples dominios (Naous et al., 2024).

La tarea de referencia binaria en el documento D3.5 agrupa A1, A2 y B1 como "simple" (0), excluye B2 y agrupa C1 y C2 como "complex" (1). El checkpoint expone etiquetas genéricas `LABEL_0` a `LABEL_3`, y la model card propone una conversión operativa (0: A1–A2, 1: B1, 2: B2, 3: C1–C2) que el propio autor advierte que no está verificada de forma independiente contra el encoder original. No se documentan detalles sobre volumen total de tokens de entrenamiento, composición exacta del dataset por partición ni uso de RLHF o DPO; al ser una tarea de clasificación, no aplica decodificación generativa.

## Capacidades

- Clasificación de dificultad textual en cuatro logits con conversión operativa a etiqueta binaria simple/complex.
- Evaluación multilingüe en árabe, inglés, francés, hindi y ruso, con transferencia evaluada a catalán, italiano y español.
- Producción de distribuciones de probabilidad por clase (softmax de cuatro elementos) utilizables para agregación binaria.
- Aplicable a flujos de simplificación textual y evaluación de legibilidad en dominios administrativos y educativos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modos de pensamiento: es un clasificador, no un modelo generativo.
- No dispone de capacidades de visión ni audio.
- No implementa abstención ni predicción selectiva en el ejemplo de inferencia, aunque el paper asociado investiga estimación de incertidumbre.

## Casos de uso

- Evaluación de legibilidad en administración pública: clasificar comunicados y formularios como simples o complejos antes de su publicación, para decidir si requieren reescritura orientada a un nivel A2, objetivo del proyecto iDEM.
- Filtrado previo en pipelines de simplificación textual: usar la probabilidad de clase compleja como señal para enrutar textos hacia un modelo generativo de simplificación, reduciendo coste computacional al no procesar textos ya simples.
- Investigación en comunicación accesible: analizar corpus multilingües y comparar la dificultad relativa entre lenguas y dominios con una métrica automática reproducible.
- Evaluación de materiales educativos: clasificar textos de lectura por nivel estimado para apoyar la selección de recursos en contextos de aprendizaje de lenguas.
- Análisis de corpus de deliberación ciudadana: detectar contribuciones de alta complejidad en plataformas de participación y priorizar su adaptación para accesibilidad.
- Monitorización de calidad documental en soporte al cliente: identificar respuestas excesivamente complejas en bases de conocimiento multilingües antes de su despliegue.

## Benchmarks y rendimiento

Resultados de la serie completa (no de la partición 1 aislada), reportados en el borrador D3.5:

| Dataset | Macro F1 |
|---|---:|
| ReadMe++ | 0,83 ± 0,014 |
| Vikidia/Wikipedia | 0,68 ± 0,040 |
| iDEM | 0,59 ± 0,021 |

El rendimiento cae de forma notable en dominios externos, lo que indica una generalización limitada fuera de la distribución de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,7 GB para los pesos (167 M de parámetros); en fp16, alrededor de 0,35 GB.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para volúmenes moderados.
- GPU recomendadas para alto throughput: A100, H100 o L4 para procesamiento por lotes a gran escala; para uso puntual, cualquier GPU con 2 GB o más es suficiente.
- Despliegue compatible con transformers, Text Embeddings Inference (el repo incluye la etiqueta `text-embeddings-inference` y `endpoints_compatible`), y exportación estándar a ONNX o cuantización dinámica mediante las herramientas de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera procesamiento de cientos a miles de frases por segundo en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Idiomas | Licencia |
|---|---:|---:|---|---|---|
| iDEM mBERT-ReadMe-CEFR-fold-1 | 167 M | 512 | Clasificación CEFR (4 clases) | ar, en, fr, hi, ru | no disponible |
| google-bert/bert-base-multilingual-uncased | 178 M | 512 | Modelo base (MLM) | 104 idiomas | Apache 2.0 |
| XLM-RoBERTa base | 278 M | 512 | Modelo base (MLM) | 100 idiomas | MIT |

La comparación con clasificadores CEFR específicos no está disponible en la información proporcionada. Frente a los modelos base, este checkpoint aporta la cabeza de clasificación entrenada, a costa de una licencia no declarada y un alcance lingüístico más reducido.

## Limitaciones y advertencias

- La conversión de los cuatro logits a etiquetas CEFR propuesta en la model card no está verificada contra el encoder de entrenamiento original; el autor recomienda comprobar el label encoder y la regla de decisión antes de usar el modelo en producción.
- El mapeo operativo binario difiere de la tarea de referencia de D3.5: B2 se excluye en la referencia pero se mapea a "complex" en la conversión operativa.
- Las probabilidades no están calibradas y no representan probabilidad de comprensión del lector.
- El rendimiento baja en dominios y lenguas no vistas: Macro F1 de 0,59 en el corpus iDEM frente a 0,83 en ReadMe++.
- El objetivo de dificultad del proyecto iDEM se aproxima a A2, mientras que la tarea binaria original incluye B1 como simple; existe un desajuste de criterio entre ambos marcos.
- El modelo no certifica accesibilidad ni conformidad con normativas de lectura fácil; se requiere revisión humana y validación con lectores objetivo.
- La licencia no está declarada, lo que impide confirmar si el uso comercial está permitido.
- El ejemplo de inferencia no implementa abstención ni predicción selectiva, pese a que el paper asociado investiga esa capacidad.
- No se documentan sesgos específicos; al entrenarse sobre un corpus anotado con criterios CEFR, puede heredar sesgos de dominio y de anotación del recurso ReadMe++.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iDEM-Project/mBERT-ReadMe-CEFR-fold-1
- Modelo base: https://huggingface.co/google-bert/bert-base-multilingual-uncased
- Paper de estimación de incertidumbre (Khallaf y Sharoff, 2026): https://aclanthology.org/2026.lrec-1.11/
- Paper de ReadMe++ (Naous et al., 2024): https://aclanthology.org/2024.emnlp-main.682/
