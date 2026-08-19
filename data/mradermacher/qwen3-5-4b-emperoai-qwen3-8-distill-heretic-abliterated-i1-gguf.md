# mradermacher/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated-i1-GGUF

## Resumen

El modelo `mradermacher/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated-i1-GGUF` es una cuantización en formato GGUF de un modelo base denominado `Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated`, publicado originalmente por el usuario `insraq` en Hugging Face. El autor de esta conversión, `mradermacher`, se dedica a generar cuantizaciones ponderadas (weighted/imatrix) para facilitar la ejecución local en hardware de consumo. El nombre del modelo sugiere que se trata de una destilación de Qwen3.5 (posiblemente 4B parámetros) basada en Qwen3.8, con un proceso de "abliteración" (eliminación de la censura mediante ablación direccional) aplicado mediante la herramienta Heretic.

La relevancia de este modelo radica en su naturaleza "uncensored" y su disponibilidad en formato GGUF, lo que permite su uso en aplicaciones locales con CPU o GPU de gama media. Sin embargo, la información pública disponible es muy limitada: no se especifican licencia, idiomas, ni detalles técnicos del modelo base. El repositorio tiene un tamaño de 0.0 GB y el número de parámetros reportado (897.272) parece erróneo o incompleto, probablemente correspondiente a un archivo de pesos parcial. En consecuencia, esta ficha se basa únicamente en los datos disponibles y marca explícitamente los campos sin información.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 897.272 (dato reportado, posiblemente incompleto) |
| Parametros activos | no aplicable (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S (según comentarios del README) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura del modelo base. El nombre sugiere que deriva de la familia Qwen (probablemente un transformer decoder-only), pero no hay confirmación. El proceso de "abliteration" (Heretic) implica una ablación direccional de las capas de atención para eliminar la alineación de seguridad, sin entrenamiento adicional. El término "Distill" indica que el modelo podría ser una destilación de un modelo mayor (Qwen3.8). No hay datos sobre el dataset de entrenamiento, número de tokens, ni técnicas de RLHF/DPO. El modelo base fue cuantizado con imatrix (importance matrix) para mejorar la calidad de la cuantización.

## Capacidades

- Generación de texto: presumiblemente, al ser una variante de Qwen, puede generar texto coherente, aunque no hay confirmación.
- Razonamiento y código: no hay datos específicos; se espera que herede capacidades del modelo base, pero no se puede afirmar.
- Tool calling y agentes: no disponible.
- Multilingüismo: no disponible.
- Capacidades especiales: el modelo ha sido sometido a "abliteration", por lo que no debería aplicar restricciones de seguridad (censura). Esto puede implicar una mayor libertad en la generación de contenido, pero también conlleva riesgos (ver limitaciones).

## Casos de uso

- Ejecución local de un modelo de lenguaje sin censura para experimentación e investigación en IA.
- Prototipado de aplicaciones de generación de texto en entornos offline o con privacidad estricta.
- Evaluación de técnicas de ablación direccional y su efecto en el comportamiento del modelo.
- Uso como base para fine-tuning adicional en tareas específicas que requieran respuestas sin restricciones de seguridad.
- Desarrollo de chatbots o asistentes para entornos controlados donde la moderación de contenido se gestiona externamente.
- Comparación de rendimiento entre cuantizaciones GGUF y el modelo original en tareas de generación libre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 4B parámetros en formato GGUF, es probable que pueda ejecutarse en GPUs de consumo con al menos 6-8 GB de VRAM en cuantizaciones bajas (Q4_K_S o inferiores), pero no hay datos oficiales.
- Para CPU, se puede usar llama.cpp o herramientas compatibles con GGUF, con mayor latencia.
- No se dispone de mediciones de latencia o throughput.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF (por ejemplo, KoboldCpp).

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa objetiva. Existen otros modelos similares en el repositorio de `mradermacher` (por ejemplo, `Qwen3.5-4B-heretic-GGUF` o `Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC-UNCENSORED-GGUF`), pero no se conocen sus especificaciones ni rendimiento. Se recomienda consultar las model cards de dichos repositorios para más detalles.

## Limitaciones y advertencias

- El modelo ha sido sometido a "abliteration", lo que elimina la alineación de seguridad. Esto implica que puede generar contenido ofensivo, ilegal o peligroso sin filtros. Su uso debe restringirse a entornos de investigación y experimentación, nunca en producción sin supervisión humana.
- No se conoce la licencia del modelo base, por lo que no se puede garantizar la legalidad de su uso comercial o distribución.
- La información técnica es incompleta: no hay datos sobre arquitectura, dataset, idiomas, ni rendimiento. Cualquier uso en producción requiere una evaluación previa exhaustiva.
- El número de parámetros reportado (897.272) es anómalo y probablemente incorrecto; se recomienda verificar los archivos del repositorio.
- El tamaño del repositorio es 0.0 GB, lo que sugiere que los archivos pueden no estar disponibles o que la cuantización no se ha subido correctamente.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/mradermacher/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated-i1-GGUF
- Repositorio del modelo base (referencia): https://huggingface.co/insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated
- Herramienta Heretic (abliteration): https://github.com/p-e-w/heretic
- Página de Qwen3.5 en LM Studio (contexto general): https://lmstudio.ai/models/qwen3.5
