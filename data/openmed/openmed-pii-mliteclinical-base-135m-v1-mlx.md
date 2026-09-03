# OpenMed/OpenMed-PII-mLiteClinical-Base-135M-v1-mlx

## Resumen

OpenMed-PII-mLiteClinical-Base-135M-v1-mlx es un empaquetado en formato MLX del modelo OpenMed-PII-mLiteClinical-Base-135M-v1, desarrollado por OpenMed para la detección y desidentificación de información personal identificable (PII) y datos de salud protegidos (PHI) en texto clínico. El modelo original está basado en la arquitectura DistilBERT (DistilBertForTokenClassification) y ha sido ajustado específicamente para la anotación de entidades clínicas, con soporte para más de 55 tipos de PHI según la documentación del proyecto. Este repositorio concreto proporciona los pesos en formato MLX para ejecutar el modelo de forma nativa en dispositivos Apple Silicon (macOS, iPhone y iPad) mediante la librería OpenMed, tanto en Python como en Swift.

La relevancia de este modelo radica en su enfoque local-first: permite procesar historiales clínicos y extraer entidades sensibles sin enviar datos a la nube, cumpliendo así con requisitos de privacidad como HIPAA. Al estar empaquetado en MLX, ofrece una integración directa con el ecosistema OpenMed, que incluye más de 2.200 modelos médicos y soporte para 33 idiomas en tareas de PII. El tamaño del repositorio es de 0,5 GB, lo que indica un modelo ligero adecuado para despliegue en dispositivos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (DistilBertForTokenClassification) |
| Parametros totales | 135M (nominal, segun nombre del modelo; no confirmado en la documentacion) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el formato MLX puede incluir pesos en float16/float32, pero no se especifica) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (weights.safetensors y/o weights.npz) |

## Arquitectura y entrenamiento

El modelo base es un DistilBERT, una versión destilada de BERT con aproximadamente la mitad de capas, diseñada para mantener un rendimiento cercano al original con menor coste computacional. En este caso, se ha adaptado para la tarea de token classification, lo que implica una capa de clasificación por token que asigna etiquetas de entidad (por ejemplo, nombres de pacientes, fechas, números de historia clínica) a cada token del texto de entrada. El modelo original fue ajustado (fine-tuning) sobre datos clínicos para la detección de PII/PHI, aunque no se proporcionan detalles específicos sobre el volumen de datos, la composición del dataset ni el proceso de entrenamiento (si se usó RLHF, DPO u otras técnicas).

El repositorio actual no incluye el tokenizer; OpenMed y OpenMedKit recurren a la referencia del tokenizer del modelo base en `config.json` para mantener compatibilidad. El empaquetado MLX sigue un layout legacy-compatible con `config.json`, `id2label.json` y archivos de pesos en formato MLX, lo que permite su uso directo con la librería OpenMed en Apple Silicon.

## Capacidades

- Detección y clasificación de entidades PII/PHI en texto clínico, incluyendo más de 55 tipos de información protegida (nombres, fechas, ubicaciones, números de identificación, etc.).
- Token classification con etiquetas por token, permitiendo la extracción de entidades con límites precisos.
- Soporte de "smart merging" para combinar tokens adyacentes en entidades completas, mejorando la coherencia de los resultados.
- Integración nativa con el ecosistema OpenMed: ejecución en Python (backend MLX) y en Swift (OpenMedKit) sobre Apple Silicon.
- Funcionamiento 100% local, sin necesidad de conexión a la nube, lo que garantiza la privacidad de los datos del paciente.
- Compatibilidad con dispositivos Apple: macOS, iPhone y iPad (Swift MLX), excluyendo el simulador de iOS.

## Casos de uso

- Desidentificación de historiales clínicos para investigación: el modelo puede procesar notas médicas y eliminar automáticamente toda la información personal identificable antes de que los datos se compartan con equipos de investigación o se publiquen en repositorios, cumpliendo con normativas de privacidad.
- Cumplimiento HIPAA en aplicaciones de salud: integrado en un sistema de gestión de pacientes, el modelo puede escanear documentos clínicos en tiempo real y alertar sobre posibles fugas de PHI antes de que se almacenen o transmitan.
- Anonimización de datos para entrenamiento de modelos: las organizaciones pueden usar este modelo para limpiar grandes volúmenes de texto clínico antes de utilizarlos como datos de entrenamiento para otros modelos de IA, reduciendo el riesgo de sesgo o exposición de información sensible.
- Aplicaciones móviles de salud en iOS: gracias al soporte Swift MLX, el modelo puede ejecutarse directamente en un iPhone o iPad, permitiendo a los profesionales sanitarios capturar notas clínicas y obtener entidades PII anotadas sin conexión a internet.
- Auditoría de registros médicos electrónicos: el modelo puede analizar retrospectivamente bases de datos de historiales para identificar registros que contengan PHI no protegida, facilitando tareas de auditoría y corrección.
- Integración en pipelines de procesamiento de lenguaje natural clínico: al ser un modelo ligero (135M), puede desplegarse en servidores con recursos moderados o en dispositivos edge, actuando como un componente de preprocesamiento para tareas posteriores como extracción de relaciones o resumen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este modelo en la informacion disponible. La documentación del proyecto OpenMed menciona que sus modelos alcanzan "estado del arte en 10 de 12 benchmarks de NER biomédica", pero no se proporcionan cifras concretas ni comparaciones detalladas para esta variante concreta. Por tanto, no es posible presentar una tabla de rendimiento verificable.

## Requisitos de hardware

- Al ser un modelo de 135M de parámetros, su huella de memoria es reducida: en formato MLX con precisión float16, los pesos ocuparían aproximadamente 270 MB, aunque no se confirma el tipo de dato exacto.
- Diseñado para Apple Silicon: funciona en cualquier Mac con chip M1 o posterior, así como en iPhone y iPad reales (no en el simulador de iOS).
- No se requieren GPUs dedicadas; la inferencia se ejecuta en la Neural Engine o en la GPU integrada de los dispositivos Apple.
- Opciones de despliegue: librería OpenMed en Python (con `openmed[mlx]`), OpenMedKit en Swift, o uso directo del repositorio MLX descargado localmente.
- No se dispone de datos de latencia o throughput específicos, pero por el tamaño del modelo se espera una inferencia en milisegundos en dispositivos Apple modernos.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de desidentificación de PII en el ámbito clínico. Aunque existen alternativas como modelos basados en BioBERT o RoBERTa ajustados para NER clínica, no se han encontrado datos concretos sobre este modelo en particular que permitan una comparación rigurosa. Por tanto, esta sección queda pendiente de datos verificables.

## Limitaciones y advertencias

- El modelo está entrenado únicamente en inglés, por lo que no es adecuado para textos clínicos en otros idiomas sin un ajuste adicional.
- No se incluye el tokenizer en este repositorio; es necesario descargar el modelo base o depender de la referencia en `config.json`, lo que puede requerir acceso a Hugging Face.
- Al ser un modelo de 135M, su capacidad de comprensión de contexto es limitada en comparación con modelos más grandes; puede fallar en textos muy largos o con jerga clínica altamente especializada.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar etiquetas incorrectas o omitir entidades reales, especialmente en textos con errores tipográficos o formatos no estándar.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda validar el rendimiento en el dominio específico antes de su uso en producción, dado que no se han publicado benchmarks detallados.
- El modelo está pensado para entornos Apple Silicon; en otras plataformas se requiere el backend PyTorch/Hugging Face, que puede no estar optimizado.

## Enlaces

- Repositorio Hugging Face: [OpenMed/OpenMed-PII-mLiteClinical-Base-135M-v1-mlx](https://huggingface.co/OpenMed/OpenMed-PII-mLiteClinical-Base-135M-v1-mlx)
- Modelo base: [OpenMed/OpenMed-PII-mLiteClinical-Base-135M-v1](https://huggingface.co/OpenMed/OpenMed-PII-mLiteClinical-Base-135M-v1)
- GitHub de OpenMed: [https://github.com/maziyarpanahi/openmed](https://github.com/maziyarpanahi/openmed)
- Documentación del backend MLX: [https://openmed.life/docs/mlx-backend/](https://openmed.life/docs/mlx-backend/)
- Documentación de OpenMedKit (Swift): [https://openmed.life/docs/swift-openmedkit/](https://openmed.life/docs/swift-openmedkit/)
- Sitio web de OpenMed: [https://openmed.life/](https://openmed.life/)
