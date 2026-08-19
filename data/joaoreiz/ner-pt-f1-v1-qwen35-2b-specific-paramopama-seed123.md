# JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-paramopama-seed123

## Resumen

Este repositorio contiene un adaptador LoRA para reconocimiento de entidades nombradas (NER) generativo en portugués, desarrollado por JoaoReiz. Se trata de una ejecución concreta de la matriz de investigación `ner-pt-generative-2026-f1-v1`, que combina el modelo base Qwen/Qwen3.5-2B con un régimen de entrenamiento específico sobre el dataset paramopama. El adaptador está diseñado para producir salidas estructuradas en JSON con etiquetas y tokens, utilizando inferencia con vLLM a temperatura cero.

El modelo resuelve la tarea de extracción de entidades en textos portugueses mediante generación condicionada, en lugar de la clasificación de tokens tradicional. Su relevancia radica en que ofrece una alternativa generativa al NER clásico, con resultados documentados de F1 y validez estructural. Sin embargo, el autor advierte que los resultados solo son válidos para los splits congelados y esta semilla concreta, y que el modelo no debe usarse en decisiones de alto riesgo sin evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.5-2B (transformer, detalles no disponibles) |
| Parametros totales | No disponible (adaptador LoRA, tamano del repo 0.1 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (entrenamiento); no se especifican cuantizaciones para inferencia |
| Idiomas soportados | Portugues (pt) |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el modelo base Qwen/Qwen3.5-2B en la revision concreta `15852e8c16360a2fea060d615a32b45270f8a8fc`. El entrenamiento utiliza precision BF16 con LoRA, y la seleccion del checkpoint se realiza por F1 end-to-end sobre el conjunto de validacion, sin usar el split de test para la seleccion. La inferencia canonica emplea vLLM con temperatura 0 y una salida JSON restringida al esquema `labels_and_tokens`. La politica para salidas invalidas es la prediccion vacia en la puntuacion end-to-end.

No se proporcionan detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset paramopama ni si se aplicaron tecnicas adicionales como RLHF o DPO. El regimen "specific" sugiere un entrenamiento adaptado al dominio, pero no se especifica su alcance exacto.

## Capacidades

- Reconocimiento de entidades nombradas generativo en portugues, con salida estructurada en JSON (etiquetas y tokens).
- Generacion de texto condicionada para extraccion de entidades, en lugar de clasificacion token a token.
- Soporte de inferencia con vLLM y generacion restringida por esquema.
- Capacidad multilingue limitada al portugues (no se han evaluado otros idiomas).
- No se documentan capacidades de tool calling, agentes, vision ni audio.

## Casos de uso

- Investigacion en NER generativo: el modelo permite estudiar el comportamiento de la generacion estructurada frente a metodos clasicos de clasificacion de tokens, con metricas de F1 y validez estructural documentadas.
- Extraccion de entidades en corpus portugueses: puede aplicarse a textos del dominio paramopama para identificar personas, organizaciones, lugares u otras entidades definidas por el esquema del dataset.
- Evaluacion de esquemas de anotacion: la salida JSON restringida facilita comparar diferentes esquemas de etiquetado y medir el impacto en la precision y la validez estructural.
- Prototipado de pipelines de NER: al ser un adaptador ligero sobre un modelo de 2B, puede integrarse en entornos de desarrollo con recursos limitados para pruebas de concepto.
- Analisis de robustez: los artefactos de investigacion incluyen predicciones congeladas y metricas descontaminadas, lo que permite auditar el comportamiento del modelo en condiciones controladas.
- Control de calidad en entornos academicos: el modelo puede servir como referencia para replicar experimentos y verificar la reproducibilidad de resultados en NER portugues.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados sobre el split de test del dataset paramopama, para esta ejecucion concreta (seed 123):

| Dataset | Precision | Recall | F1 | Validez estructural |
|---|---:|---:|---:|---:|
| paramopama | 0.8914 | 0.8950 | 0.8932 | 0.9971 |

Estos resultados corresponden unicamente a los splits congelados y a esta semilla. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0.1 GB, por lo que el requisito principal es el modelo base Qwen3.5-2B.
- Para inferencia en BF16, el modelo base de 2B requiere aproximadamente 4-5 GB de VRAM, lo que permite su ejecucion en GPUs consumer como RTX 3060, RTX 4060 o superiores.
- No se han especificado requisitos exactos de VRAM ni latencia en la documentacion del autor.
- Opciones de despliegue: vLLM (recomendado por el autor), y posiblemente llama.cpp u Ollama si se cuantiza el modelo base, aunque no se documentan estas opciones.
- Se recomienda hardware compatible con BF16 para reproducir el protocolo de entrenamiento.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. No se pueden establecer comparaciones con alternativas de la misma categoria sin datos adicionales.

## Limitaciones y advertencias

- Los resultados reportados solo son validos para los splits congelados y la semilla 123; la incertidumbre entre semillas requiere completar la matriz de tres semillas.
- Las entidades generadas pueden ser estructuralmente validas pero semanticamente incorrectas; se recomienda revision humana en aplicaciones reales.
- El modelo no ha sido validado para decisiones de alto riesgo o autonomas.
- Los esquemas de anotacion de los corpus pueden diferir, y la superposicion de texto puede afectar a las estimaciones de rendimiento.
- La licencia del modelo no esta disponible, por lo que se debe revisar la licencia del modelo base y del dataset antes de cualquier uso comercial.
- No se garantiza el rendimiento fuera de los corpus evaluados.

## Enlaces

- Repositorio del modelo: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-paramopama-seed123
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
