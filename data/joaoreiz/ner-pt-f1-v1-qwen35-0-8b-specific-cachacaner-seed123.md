# JoaoReiz/ner-pt-f1-v1-qwen35-0-8b-specific-cachacaner-seed123

## Resumen

El modelo `ner-pt-f1-v1-qwen35-0-8b-specific-cachacaner-seed123` es un adaptador LoRA para reconocimiento de entidades nombradas (NER) generativo en portugués, desarrollado por JoaoReiz. Se basa en el modelo Qwen/Qwen3.5-0.8B (revisión específica `2fc06364715b967f1860aea9cf38778875588b17`) y forma parte de una matriz de investigación más amplia (`ner-pt-generative-2026-f1-v1`) que explora diferentes tamaños de base, semillas y regímenes de entrenamiento.

El adaptador está diseñado para producir salidas estructuradas en JSON (etiquetas y tokens) mediante inferencia con vLLM a temperatura 0, lo que permite una extracción de entidades con validez estructural garantizada. Su relevancia radica en ofrecer una solución ligera y reproducible para NER en portugués, con métricas de F1 end-to-end reportadas sobre el corpus cachacaner. El repositorio incluye artefactos de reproducibilidad completos (predicciones congeladas, manifiestos, hashes) en la carpeta `research/`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3.5-0.8B (transformer decoder) |
| Parametros totales | no disponible (tamano del repo: 0.1 GB) |
| Parametros activos | no aplica (adaptador LoRA) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | no disponible (entrenado en BF16) |
| Idiomas soportados | portugues (pt) |
| Licencia | no disponible |
| Formato de pesos | PEFT (LoRA), safetensors (presumible) |

## Arquitectura y entrenamiento

El adaptador se entrena con LoRA sobre el modelo base Qwen3.5-0.8B en precision BF16. El regimen de entrenamiento es "specific", lo que indica que se ajusta a un corpus concreto (cachacaner) sin mezclar otros datasets. La seleccion del checkpoint se realiza por F1 end-to-end en el conjunto de validacion, sin usar el test para la seleccion. La inferencia canonica emplea vLLM con temperatura 0 y generacion restringida a un esquema JSON `labels_and_tokens`, lo que garantiza una salida estructuralmente valida. La politica para salidas invalidas es prediccion vacia en el scoring end-to-end.

No se proporcionan detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas como RLHF o DPO. La informacion disponible se limita a la configuracion de ejecucion y los resultados reportados.

## Capacidades

- Reconocimiento de entidades nombradas (NER) generativo en portugues, produciendo etiquetas y tokens en formato JSON estructurado.
- Generacion restringida a un esquema JSON (`labels_and_tokens`) que asegura validez estructural de las salidas.
- Inferencia determinista con temperatura 0, adecuada para tareas de extraccion donde se requiere consistencia.
- Integracion con vLLM para despliegue en produccion con latencia controlada.
- Reproducibilidad completa gracias a los artefactos incluidos en `research/` (predicciones, manifiestos, hashes).
- No se reportan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Extraccion de entidades en documentos legales portugueses: el modelo puede identificar nombres de personas, organizaciones y lugares en contratos o sentencias, generando salidas JSON listas para integrar en sistemas de gestion documental.
- Procesamiento de noticias y articulos periodisticos: permite extraer entidades para alimentar motores de busqueda o sistemas de recomendacion de contenido.
- Analisis de redes sociales y comentarios: identificacion de menciones a marcas, productos o personas en textos informales en portugues, con salida estructurada para analisis posterior.
- Construccion de grafos de conocimiento: las entidades extraidas pueden usarse para poblar bases de datos grafo, gracias a la estructura JSON consistente.
- Anotacion automatica de corpus para investigacion en NLP: el adaptador puede servir como herramienta de pre-anotacion en portugues, reduciendo el esfuerzo manual de anotadores.
- Sistemas de monitorizacion de marcas: deteccion de entidades relevantes en flujos de texto continuo, con inferencia determinista y validez estructural para pipelines automatizados.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados sobre el conjunto de test congelado del corpus cachacaner:

| Dataset | Precision | Recall | F1 | Validez estructural |
|---|---:|---:|---:|---:|
| cachacaner | 0.9290 | 0.9215 | 0.9252 | 1.0000 |

Estos resultados corresponden a una unica semilla (123) y a los splits congelados. No se proporcionan comparaciones con otros modelos ni benchmarks estandar como MMLU, HumanEval o GSM8K. El autor advierte que los resultados no deben interpretarse como evidencia de rendimiento general fuera de estos corpus.

## Requisitos de hardware

- Entrenamiento y evaluacion requieren hardware compatible con BF16 (por ejemplo, GPU con soporte para bfloat16).
- Inferencia recomendada con vLLM, que exige una GPU con suficiente VRAM para el modelo base Qwen3.5-0.8B (aproximadamente 2-4 GB en cuantizacion ligera, aunque no se especifica).
- El adaptador LoRA anade un coste minimo de memoria adicional al modelo base.
- No se indican GPUs concretas recomendadas ni latencias estimadas. Dado el tamano reducido del modelo base, es plausible que quepa en GPUs de consumo como RTX 3060 o superiores, pero no se confirma.
- Opciones de despliegue: vLLM (mencionado como inferencia canonica), y potencialmente otros frameworks compatibles con PEFT (transformers, llama.cpp, Ollama) aunque no se documentan.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la informacion proporcionada. El autor ha publicado otros adaptadores de la misma matriz (por ejemplo, `ner-pt-f1-v1-qwen35-2b-specific-cachacaner-seed3407` y `ner-pt-f1-v1-qwen35-4b-specific-cachacaner-seed3407`), pero no se reportan sus metricas en esta ficha. Por tanto, no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Los spans generados pueden ser estructuralmente validos pero semanticamente incorrectos; la validez estructural no garantiza correccion semantica.
- El modelo no ha sido validado para decisiones de alto riesgo ni para uso autonomo sin supervision humana.
- Los resultados reportados corresponden a una unica semilla y a corpus congelados; la incertidumbre entre semillas requiere completar la matriz de tres semillas.
- Las diferencias en esquemas de anotacion entre corpus pueden afectar a la transferencia a otros dominios.
- La licencia del adaptador no esta especificada; los usuarios deben revisar las licencias del dataset y del modelo base antes de uso comercial.
- El modelo solo soporta portugues; no se evaluo su comportamiento en otros idiomas.
- No se proporcionan datos sobre sesgos especificos, pero al ser un modelo entrenado sobre un corpus concreto, puede heredar sesgos presentes en dicho corpus.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-0-8b-specific-cachacaner-seed123
- Adaptador similar (2B, seed 3407): https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-cachacaner-seed3407
- Adaptador similar (4B, seed 3407): https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-4b-specific-cachacaner-seed3407
- Despliegue en FriendliAI (2B): https://friendli.ai/models/JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-cachacaner-seed123
- Despliegue en FriendliAI (4B, lener-br): https://friendli.ai/models/JoaoReiz/ner-pt-f1-v1-qwen35-4b-specific-lener-br-seed3407
