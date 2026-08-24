# hellotung/Code_And_Res_copy

## Resumen

El repositorio `hellotung/Code_And_Res_copy` no contiene un modelo de inteligencia artificial listo para usar, sino el código fuente reproducible de un proyecto de investigación titulado "Top-K-CWE: Taxonomy-Aware Multi-Class CWE Classification on MegaVul with Class-Balanced Learning". El objetivo es clasificar funciones vulnerables escritas en C/C++ en una de las categorías CWE (Common Weakness Enumeration) del Top-25 de MITRE, utilizando codificadores de código preentrenados como CodeBERT, UniXcoder y CodeT5.

El proyecto aborda el problema del desequilibrio de clases en la clasificación de vulnerabilidades y propone dos mecanismos de aprendizaje consciente de la taxonomía CWE: una cabeza auxiliar de clasificación gruesa (M1) y etiquetas suaves basadas en la jerarquía de CWE (M2). El dataset utilizado es MegaVul, dividido cronológicamente en 80/10/10 para evitar fugas temporales. El repositorio incluye el pipeline completo de preprocesado, entrenamiento, evaluación y pruebas unitarias, pero no se han publicado pesos de modelo entrenados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (repositorio de codigo; usa CodeBERT, UniXcoder y CodeT5 como encoders) |
| Parametros totales | No disponible (no se publican pesos) |
| Parametros activos | No disponible |
| Longitud de contexto | 512 tokens (configuracion de entrenamiento) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Codigo C/C++ (funciones vulnerables) |
| Licencia | No disponible |
| Formato de pesos | No disponible (solo codigo fuente y configuraciones) |

## Arquitectura y entrenamiento

El repositorio implementa un pipeline de fine-tuning sobre tres arquitecturas de codificadores de codigo: CodeBERT y UniXcoder (familia RoBERTa, con pooling en `[CLS]` o `<s>`) y CodeT5 (modelo T5 encoder-decoder, del que se carga solo el encoder mediante `T5EncoderModel` y se aplica pooling con media enmascarada). La clasificacion final es una cabeza lineal sobre K categorias CWE del Top-25 de MITRE con al menos 100 muestras en el dataset MegaVul.

El entrenamiento incorpora tecnicas de balanceo de clases: Focal Loss, Class-Balanced Focal Loss y sobremuestreo ponderado. Ademas, se anaden dos mecanismos conscientes de la taxonomia CWE-1000: una cabeza auxiliar de clasificacion gruesa (M1) que entrena conjuntamente con la cabeza fina mediante una perdida combinada, y etiquetas suaves jerarquicas (M2) que penalizan menos los errores entre CWE hermanas (mismo padre grueso) que los errores entre grupos distintos. Ambos mecanismos se pueden desactivar para aislar su efecto. El dataset se divide cronologicamente por fecha de commit en 80/10/10. El entrenamiento se realiza en una NVIDIA RTX 3090 de 24 GB con fp16, batch de 32 y 10 epocas, con early stopping.

## Capacidades

- Clasificacion de funciones C/C++ vulnerables en categorias CWE del Top-25 de MITRE.
- Soporte de multiples encoders de codigo: CodeBERT, UniXcoder y CodeT5 (solo encoder).
- Manejo de desequilibrio de clases mediante Focal Loss, Class-Balanced Focal Loss y sobremuestreo.
- Aprendizaje consciente de la taxonomia CWE-1000 con dos variantes (M1 y M2).
- Evaluacion con metricas macro/weighted-F1, top-1/top-3, MCC y metricas por grupo grueso.
- Incluye un baseline externo no preentrenado (TF-IDF + LinearSVC) y un BiLSTM opcional.
- Reproducibilidad con semillas fijas (42, 1, 7) y preprocesado deterministico.
- 37 pruebas unitarias que cubren preprocesado, perdidas, jerarquia CWE, modelos y dataset.

## Casos de uso

- Analisis de seguridad de codigo: clasificar funciones vulnerables en categorias CWE para priorizar la correccion de vulnerabilidades en proyectos de software.
- Auditoria de repositorios: escanear grandes volumenes de codigo C/C++ para identificar debilidades comunes segun la taxonomia MITRE.
- Investigacion en seguridad: estudiar la distribucion de tipos de vulnerabilidad en datasets como MegaVul y evaluar tecnicas de balanceo de clases.
- Comparacion de encoders de codigo: evaluar el rendimiento de CodeBERT, UniXcoder y CodeT5 en una tarea de clasificacion de vulnerabilidades.
- Desarrollo de herramientas de triaje: integrar el clasificador en pipelines de CI/CD para etiquetar automaticamente hallazgos de analisis estatico.
- Formacion academica: servir como base reproducible para experimentos sobre clasificacion de vulnerabilidades y aprendizaje consciente de taxonomias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las metricas del paper estan marcadas como TBM (to be measured) y que las ejecuciones de entrenamiento no se han realizado aun. El codigo de evaluacion genera un archivo `metrics.json` con los resultados, pero no se incluyen valores concretos.

## Requisitos de hardware

- GPU recomendada: NVIDIA RTX 3090 de 24 GB (usada por los autores).
- VRAM estimada: 24 GB para entrenamiento con batch 32 y fp16; si se produce OOM, se recomienda batch 16 con grad_accum_steps 2.
- Tiempo de entrenamiento: 1-1.5 horas por ejecucion (10 epocas sobre ~9.6K funciones).
- Presupuesto total del grid completo: 25-35 horas de GPU.
- El baseline SVM se puede ejecutar en CPU en pocos minutos.
- No se proporcionan requisitos para inferencia, ya que no se publican pesos entrenados.

## Comparativa con modelos similares

No disponible. Este repositorio no ofrece un modelo preentrenado comparable con otros, sino un codigo de entrenamiento para clasificacion de vulnerabilidades. No se pueden comparar parametros, contexto ni rendimiento con alternativas como modelos de lenguaje generativos o clasificadores de codigo existentes.

## Limitaciones y advertencias

- No es un modelo de IA desplegable: es un repositorio de codigo de investigacion sin pesos publicados.
- No se han ejecutado los entrenamientos: los resultados del paper estan pendientes de medicion.
- El dataset MegaVul requiere descarga manual (paso indicado en DATA.md).
- La clasificacion se limita a funciones C/C++ y a las categorias CWE del Top-25 con al menos 100 muestras.
- El mapeo CWE a grupos gruesos (CWE-1000) es una construccion del autor y se senala como una amenaza a la validez de constructo.
- La division cronologica puede introducir deriva de clases entre los conjuntos de entrenamiento y prueba.
- No se especifica licencia de uso, lo que limita su aplicacion comercial sin autorizacion explicita.
- No hay soporte para otros lenguajes de programacion ni para tareas generativas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hellotung/Code_And_Res_copy
- Modelos de codigo en Hugging Face (categoria): https://huggingface.co/models?language=code
- Documentacion de Azure sobre copia de modelos (referencia externa, no relacionada): https://learn.microsoft.com/en-us/rest/api/aiservices/custom-models/copy?view=rest-aiservices-v2.1
