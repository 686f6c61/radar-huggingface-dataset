# JoaoReiz/ner-pt-f1-v1-qwen35-4b-specific-paramopama-seed123

## Resumen

El modelo `JoaoReiz/ner-pt-f1-v1-qwen35-4b-specific-paramopama-seed123` es un adaptador LoRA para reconocimiento de entidades nombradas (NER) generativa en portugués, desarrollado por JoaoReiz como parte de la matriz de investigación `ner-pt-generative-2026-f1-v1`. Se basa en el modelo Qwen/Qwen3.5-4B y está diseñado para extraer entidades mediante generación estructurada con restricciones JSON (`labels_and_tokens`). El adaptador se entrenó en precisión BF16 sobre el dataset paramopama, con una semilla fija (123) y selección de checkpoint basada en F1 end-to-end sobre validación. Es relevante porque ofrece un enfoque generativo para NER en portugués, con resultados reportados de alta validez estructural (1.0) y F1 de 0.8983 en el conjunto de prueba, aunque limitado a un único corpus y semilla.

El repositorio contiene el adaptador LoRA (0.1 GB) y una carpeta `research/` con predicciones congeladas, métricas, esquemas de ablación, contratos de inferencia y manifiestos de reproducibilidad. La inferencia canónica se realiza con vLLM a temperatura 0 y salida JSON restringida. No se especifica la licencia, lo que condiciona su uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3.5-4B (transformer decoder-only) |
| Parametros totales | no disponible (adaptador de 0.1 GB; base 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | no disponible (entrenado en BF16) |
| Idiomas soportados | Portugues (pt) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador emplea LoRA (Low-Rank Adaptation) sobre el modelo base Qwen/Qwen3.5-4B en su revisión exacta `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`. El entrenamiento se realizó en BF16 con el dataset paramopama, bajo el régimen `specific` y semilla 123. No se menciona el uso de RLHF, DPO u otras técnicas de alineación; el enfoque se centra en la generación estructurada de etiquetas y tokens mediante un esquema JSON restringido (`labels_and_tokens`), inferido con vLLM a temperatura 0. La política para salidas inválidas es asignar una predicción vacía en la puntuación end-to-end. La selección del checkpoint se hizo por F1 de validación, sin usar el split de test.

## Capacidades

- Reconocimiento de entidades nombradas en portugues mediante generacion de texto estructurado.
- Salida en formato JSON restringido con etiquetas y tokens, lo que garantiza validez estructural (1.0 en el test).
- Integrable con la libreria PEFT para cargar el adaptador sobre el modelo base exacto.
- Compatible con pipelines de token-classification de HuggingFace.
- Soporte de inferencia con vLLM para produccion controlada.
- No se documentan capacidades de tool calling, agentes, vision ni audio.

## Casos de uso

- Investigacion academica en NER para portugues: permite comparar enfoques generativos frente a metodos clasicos de etiquetado secuencial.
- Evaluacion de modelos de lenguaje pequenos (4B) en tareas de extraccion de entidades con generacion restringida.
- Experimentacion controlada en dominios especificos: el dataset paramopama y el regimen `specific` permiten estudiar el comportamiento del modelo en un corpus concreto.
- Prototipado de sistemas de extraccion de informacion en portugues: el adaptador puede integrarse en pipelines de procesamiento de lenguaje natural con vLLM.
- Analisis de textos portugueses para identificar personas, organizaciones, lugares u otras entidades definidas en el esquema del dataset.
- Reproducibilidad de experimentos: el repositorio incluye manifiestos y predicciones congeladas, facilitando la verificacion de resultados.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados sobre el split de test del dataset paramopama:

| Dataset | Precision | Recall | F1 | Validez estructural |
|---|---:|---:|---:|---:|
| paramopama | 0.8944 | 0.9021 | 0.8983 | 1.0000 |

No se proporcionan comparaciones con otros modelos ni resultados en benchmarks generales como MMLU o HumanEval. Los datos corresponden a una unica semilla y a los splits congelados del corpus; la incertidumbre entre semillas requiere completar la matriz de tres semillas.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentacion del modelo.
- Al ser un adaptador LoRA sobre Qwen3.5-4B, la inferencia requiere cargar el modelo base (aproximadamente 8 GB en BF16) mas el adaptador (0.1 GB). Con cuantizacion (p. ej., 8 bits o 4 bits) podria ejecutarse en GPUs consumer con 8-12 GB de VRAM, aunque no se han probado oficialmente.
- Opciones de despliegue: vLLM (mencionado como inferencia canonica), PEFT para integracion en pipelines de HuggingFace, y posiblemente llama.cpp u Ollama si se convierte el modelo base a GGUF, pero no esta documentado.
- No se reportan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de NER en portugues ni con otros adaptadores LoRA similares.

## Limitaciones y advertencias

- Los spans generados pueden ser estructuralmente validos pero semanticamente incorrectos; la validez estructural no implica correccion semantica.
- Resultados limitados a un unico dataset (paramopama), una semilla (123) y splits congelados; no deben interpretarse como rendimiento general en otros corpus o dominios.
- Los esquemas de anotacion pueden diferir entre corpus, lo que afecta la transferibilidad.
- Posible solapamiento de texto entre conjuntos de entrenamiento y prueba, lo que podria inflar las metricas.
- No validado para decisiones de alto riesgo ni para uso autonomo.
- Licencia no disponible, lo que impide determinar restricciones de uso comercial o redistribucion.
- Solo soporta portugues; no se evaluaron otros idiomas.
- Dependencia de la revision exacta del modelo base; cargar el adaptador sobre otra revision puede degradar el rendimiento.

## Enlaces

- [HuggingFace: JoaoReiz/ner-pt-f1-v1-qwen35-4b-specific-paramopama-seed123](https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-4b-specific-paramopama-seed123)
