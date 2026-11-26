# nirbhayagga/ragshield-injection-v5

## Resumen

ragshield-injection-v5 es un clasificador de texto especializado en detectar *prompt injection* en documentos recuperados dentro de pipelines RAG (Retrieval-Augmented Generation). Lo desarrolla nirbhayagga y se distribuye como el clasificador por defecto de la plataforma RAG Shield. El modelo resuelve un problema concreto: los fragmentos que un sistema RAG inyecta en el contexto del LLM pueden contener instrucciones maliciosas dirigidas al modelo, y este clasificador asigna a cada pasaje una etiqueta binaria SAFE o INJECTION.

Arquitectura transformer encoder basada en DeBERTa-v3-base, con 184.423.682 parámetros totales y un tamaño de repositorio de 0,7 GB. Se ha afinado a partir de `protectai/deberta-v3-base-prompt-injection-v2` con un conjunto de datos público de 6.121 ejemplos durante 3 épocas, un entrenamiento muy ligero (2,5 minutos en una RTX 4080) que sugiere un ajuste fino conservador sobre el modelo base.

Su relevancia actual radica en que está específicamente ajustado para no disparar ante texto técnico legítimo (pasos de instalación, comandos, runbooks), un falso positivo endémico en clasificadores genéricos de prompt injection cuando se aplican a documentación. La ventana de entrada práctica es de 512 tokens por pasada, con scoring en ventanas solapadas para fragmentos largos cuando se usa dentro de RAG Shield.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-base) para clasificación de secuencias |
| Parametros totales | 184.423.682 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens por pasada (truncation/max_length en el ejemplo de uso); ventanas solapadas para chunks largos en RAG Shield |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16 estándar; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder DeBERTa-v3-base con cabeza de clasificación binaria (etiquetas `0` SAFE, `1` INJECTION). Se parte de `protectai/deberta-v3-base-prompt-injection-v2` (Apache-2.0) y se afina sobre datos exclusivamente públicos: 6.121 ejemplos, 3 épocas, 2,5 minutos en una RTX 4080. No se usaron datos de clientes ni texto privado.

La composición del dataset combina ataques y texto benigno. En el lado de ataques: ataques del split de entrenamiento de BIPIA (Microsoft, MIT) insertados sin modificar en páginas limpias, en tres formatos (chunk completo, pasaje aislado y añadido al final de una frase), más 150 ataques estilo "nota" de la fase 1 de LLMail-Inject (Microsoft, MIT), con la dirección objetivo fija y la palabra clave del reto sustituidas para evitar que el modelo aprenda esos artefactos. En el lado benigno: 2.400 chunks, párrafos y frases de la documentación de tareas de Kubernetes (CC BY 4.0) y de páginas de técnicas de MITRE ATT&CK, el split de entrenamiento de `deepset/prompt-injections` (Apache-2.0), correos benignos de LLMail-Inject y NotInject (MIT), que aporta prompts inocuos con palabras disparadoras. La innovación destacable no está en la arquitectura sino en el diseño del dataset: el énfasis en texto técnico legítimo y en ataques presentados como notas, y la evaluación sobre *page edits* (solo el pasaje añadido por una edición) mediante el scoring delta de RAG Shield.

## Capacidades

- Clasificación binaria de texto: asigna SAFE o INJECTION a un pasaje, con puntuación de probabilidad.
- Detección de instrucciones dirigidas a un modelo de IA dentro de documentos recuperados (por ejemplo, "ignora tus instrucciones anteriores").
- Robustez frente a texto técnico legítimo: pasos de configuración, comandos y runbooks se clasifican como SAFE con tasas de falsos positivos bajas (0,9 % en documentación de Microsoft 365, 0,3 % en documentación de Docker).
- Detección de ataques insertados como edición de página: 96,0 % en Microsoft 365 y 93,6 % en Docker, cuando se puntúa únicamente el pasaje añadido con los umbrales de RAG Shield.
- Detección de ataques estilo nota (instrucciones redactadas como nota de un manager): evaluada sobre la fase 2 de LLMail-Inject con AUROC 0,994.
- Procesamiento de chunks largos mediante ventanas solapadas (funcionalidad de RAG Shield, no del modelo aislado).
- Idioma: únicamente inglés.
- No soporta tool calling, function calling, agentes, visión ni audio: es un clasificador, no un modelo generativo.

## Casos de uso

- Filtrado de contexto en pipelines RAG: puntuar cada chunk recuperado antes de insertarlo en el prompt del LLM y descartar o marcar los que superen el umbral de 0,5. Adecuado porque está entrenado específicamente sobre pasajes recuperados, no sobre prompts de usuario.
- Protección de bases de conocimiento corporativas: escanear documentación interna (wikis, manuales, runbooks) en busca de instrucciones inyectadas y revisar los positivos. El bajo falso positivo sobre documentación técnica (0,3 %–0,9 %) reduce la carga de revisión manual.
- Scoring incremental de ediciones de página: cuando un documento se modifica, puntuar solo el pasaje añadido en lugar de reanalizar la página completa, con una tasa de detección del 93,6 %–96,0 % en los conjuntos evaluados.
- Detección de inyecciones en correos procesados por asistentes: el modelo se entrenó con correos benignos y ataques de LLMail-Inject, por lo que es aplicable a sistemas que ingieren bandejas de entrada para resumir o responder.
- Auditoría de contenido de terceros: revisar páginas web, PDFs o documentación de proveedores antes de indexarlas en un almacén vectorial, marcando los pasajes sospechosos para revisión humana.
- Capa de defensa en profundidad: combinar el clasificador con otras medidas (saneado de caracteres invisibles, delimitación de contexto, instrucciones de sistema) para reducir la superficie de ataque de un asistente corporativo.
- Monitorización y telemetría de seguridad: registrar las puntuaciones por fuente y detectar patrones de ataques dirigidos contra la base de conocimiento.

## Benchmarks y rendimiento

Todos los conjuntos de evaluación son externos al entrenamiento, según declara el autor.

| Test | Resultado |
|---|---|
| Documentación de administración de Microsoft 365 (3.172 chunks): chunks limpios clasificados como inyección | 0,9 % (modelo base sin ajustar: 1,9 %) |
| Microsoft 365: ataque añadido como edición de página, puntuando solo el pasaje añadido | 96,0 % detectados, 9,6 % de ediciones benignas marcadas |
| Documentación de Docker (8.765 chunks): chunks limpios clasificados como inyección | 0,3 % (base: 1,9 %) |
| Docker: ataque añadido como edición de página | 93,6 % detectados, 4,8 % de ediciones benignas marcadas |
| Notas de la fase 2 de LLMail-Inject frente a correos benignos reservados (300 / 163) | AUROC 0,994; 96,7 % detectados con umbral 0,5 y 0,6 % de falsas alarmas |
| Ataques del split de test de BIPIA en 10 documentos de seguridad privados reservados | AUROC 0,989 en chunks completos; 0,955 en el pasaje añadido aislado |

Las filas de edición de página usan el scoring delta de RAG Shield con sus umbrales publicados; la mayoría de las ediciones benignas marcadas lo son por criterio de fuera de tema, no por este clasificador. No se han publicado resultados en benchmarks estándar de clasificación (MMLU, GLUE, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4–0,8 GB en fp32 (184 M de parámetros) y en torno a 0,2–0,4 GB en fp16; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor reporta entrenamiento en una RTX 4080, y la inferencia es viable en RTX 3060, RTX 4090, A100 o H100 sin aprovechar su capacidad.
- Cabe en GPU consumer: sí, en cualquier modelo con 4 GB o más, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` pipeline (ejemplo oficial con `text-classification`), integración nativa en RAG Shield (`InjectionDetector()`); no se documentan despliegues con vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponible. El dato de entrenamiento (2,5 minutos para 3 épocas sobre 6.121 ejemplos en una RTX 4080) da una idea del orden de magnitud, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ragshield-injection-v5 | 184,4 M | 512 tokens por pasada | Detección de inyección en documentos recuperados, ajustado para no disparar con texto técnico | Apache-2.0 | Hugging Face |
| protectai/deberta-v3-base-prompt-injection-v2 (modelo base) | ~184 M (no confirmado en la información disponible) | 512 tokens | Detección de prompt injection en prompts de usuario | Apache-2.0 | Hugging Face |
| deepset/prompt-injections (dataset y modelos derivados) | no disponible | no disponible | Clasificación de prompt injection genérica | Apache-2.0 (dataset) | Hugging Face |

El modelo base es la referencia directa: ragshield-injection-v5 reduce los falsos positivos sobre documentación técnica de 1,9 % a 0,9 % (Microsoft 365) y a 0,3 % (Docker), y añade evaluación específica de ataques insertados como ediciones de página. No se dispone de datos comparativos de rendimiento frente a otros clasificadores de inyección en la información proporcionada.

## Limitaciones y advertencias

- Un flag es un motivo para revisión, no prueba de ataque; el autor recomienda probar el modelo con contenido representativo del dominio propio antes de confiar en él.
- Detecta instrucciones, no afirmaciones falsas: un dato erróneo plantado sin instrucción explícita se clasifica como SAFE.
- Los ataques estilo nota se añadieron tras fallar una versión anterior con una instrucción redactada como nota de un manager; el conjunto que reveló el fallo es muy pequeño (4 notas), por lo que los resultados de notas provienen de la fase 2 de LLMail-Inject y no de ese conjunto.
- El texto ofuscado con caracteres de ancho cero o caracteres visualmente similares reduce las puntuaciones; RAG Shield puntúa el texto saneado y marca los caracteres por separado, práctica que el autor recomienda replicar si se usa el modelo aislado.
- Solo inglés, y entrenado sobre documentación técnica y correo electrónico; otros dominios no están evaluados.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios no evaluados.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la ficha, por lo que no hay validación independiente de terceros.
- Los umbrales (0,5 para instrucciones) y el scoring delta son parte de RAG Shield; usados de forma aislada, los resultados pueden diferir de los publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nirbhayagga/ragshield-injection-v5
- Modelo base: https://huggingface.co/protectai/deberta-v3-base-prompt-injection-v2
- Repositorio de RAG Shield (método y cifras completas): https://github.com/nirbhayagga/rag-shield
- Sitio de RAG Shield: https://ragshield.dev
- Dataset deepset/prompt-injections: https://huggingface.co/datasets/deepset/prompt-injections
- BIPIA (Microsoft, MIT): no disponible en la información proporcionada
- LLMail-Inject (Microsoft, MIT): no disponible en la información proporcionada
- NotInject (MIT): no disponible en la información proporcionada
