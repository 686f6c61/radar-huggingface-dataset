# santu3651/shinigami-v3

## Resumen

Shinigami V3 es un clasificador de texto basado en DistilBERT, desarrollado por santu3651 (Santu Patra), cuyo objetivo es detectar comandos de shell y entradas de herramientas potencialmente maliciosas. El modelo resuelve un problema concreto y creciente: la necesidad de filtrar las instrucciones que reciben los agentes de IA y las aplicaciones que interactúan con herramientas externas antes de que se ejecuten. Con 66.955.010 parámetros y una longitud máxima de secuencia de 256 tokens, está diseñado como componente de inferencia dentro de sistemas de seguridad, no como un ejecutor ni un aplicador autónomo de políticas.

La relevancia del modelo radica en su enfoque acotado: una clasificación binaria (BENIGN frente a MALICIOUS) sobre texto de comandos, con métricas declaradas por el autor de 97,49 % de accuracy y un F1 de 97,89 % para la clase maliciosa. Está construido sobre `distilbert-base-uncased`, lo que lo hace ligero (repo de 0,3 GB) y apto para despliegues de baja latencia en pipelines de seguridad. La licencia MIT facilita su integración en productos comerciales.

No obstante, se trata de un modelo con cero descargas y cero likes en el momento de la consulta, sin información publicada sobre idiomas soportados ni sobre el volumen y composición exacta del dataset de entrenamiento más allá del nombre del fichero (`ml-data-v4-clean.csv`). Es, por tanto, un artefacto de nicho que debe evaluarse con cautela antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder destilado) |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (longitud máxima de secuencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un DistilBERT, es decir, una versión destilada de BERT con 6 capas de encoder en lugar de 12, entrenada originalmente mediante destilación de conocimiento desde `bert-base-uncased`. Sobre esa base, el autor ha añadido una cabeza de clasificación binaria para la tarea de detección de comandos maliciosos. El modelo base es `distilbert-base-uncased`, lo que implica un tokenizador WordPiece en minúsculas y un vocabulario de aproximadamente 30.000 tokens.

El entrenamiento se realizó sobre el dataset `dataset/ml-data-v4-clean.csv`, cuyas columnas declaradas son `command`, `attack_family`, `category`, `threat_level`, `platform` e `is_malicious`. La model card no especifica el número de ejemplos, la composición por familia de ataque, el número de épocas, la tasa de aprendizaje ni si se aplicaron técnicas de aumento de datos o balanceo de clases. Tampoco se documenta el uso de RLHF, DPO ni ningún otro ajuste por preferencias, algo esperable en un clasificador de este tipo. La matriz de confusión publicada sugiere un conjunto de evaluación de 1.114 ejemplos (447 benignos y 667 maliciosos), con 12 falsos positivos y 16 falsos negativos.

No se documentan innovaciones técnicas destacables más allá del uso de destilación para reducir coste computacional. El modelo está etiquetado con `text-embeddings-inference` y `endpoints_compatible`, lo que indica compatibilidad con infraestructura de despliegue estándar de Hugging Face.

## Capacidades

- Clasificación binaria de texto: distingue entre comandos benignos (etiqueta 0) y maliciosos (etiqueta 1).
- Detección de comandos de shell y entradas de herramientas potencialmente peligrosas.
- Etiquetado por familia de ataque y nivel de amenaza en el dataset de entrenamiento (aunque el modelo final solo emite la etiqueta binaria).
- Integración como componente de inferencia en sistemas de seguridad para agentes de IA.
- Compatibilidad con pipelines de `transformers` y con `text-embeddings-inference`.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, visión, audio ni modo thinking: es exclusivamente un clasificador.
- Capacidades multilingües: no documentadas; el modelo base es `uncased` en inglés, lo que sugiere un sesgo hacia ese idioma.

## Casos de uso

- Filtrado previo a la ejecución en agentes de IA: antes de que un agente ejecute un comando sugerido por un LLM, Shinigami V3 clasifica la cadena y bloquea las predicciones MALICIOUS. Es adecuado por su bajo coste (67 M de parámetros) y su latencia reducida.
- Pasarela de seguridad para herramientas de CI/CD: integrado como paso previo en pipelines que ejecutan scripts generados automáticamente, permite rechazar comandos sospechosos antes de que lleguen al shell.
- Protección de entornos de ejecución de código (sandboxes): clasificar las entradas de usuario o de modelos antes de pasarlas a un intérprete de comandos en plataformas de código en la nube.
- Auditoría y triaje de logs: procesar comandos registrados en sistemas de telemetría para priorizar la revisión humana de aquellos marcados como maliciosos, usando el F1 del 97,89 % como criterio de cribado.
- Defensa en profundidad en asistentes de terminal: complementar políticas deterministas (listas blancas, privilegios mínimos) con una capa de clasificación basada en patrones aprendidos.
- Investigación en seguridad de IA: servir como baseline reproducible para experimentos sobre detección de comandos maliciosos en entornos de agentes, gracias a la licencia MIT y al reducido tamaño del repo.
- Moderación de entradas en plataformas que aceptan comandos de usuario: clasificar texto antes de mostrarlo o reenviarlo a sistemas internos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de evaluación no documentado en detalle):

| Metrica | Resultado |
|---|---|
| Accuracy | 97,49 % |
| Precision (malicioso) | 98,19 % |
| Recall (malicioso) | 97,60 % |
| F1 (malicioso) | 97,89 % |
| Tasa de falsos positivos | 2,68 % |
| Tasa de falsos negativos | 2,40 % |

Matriz de confusión declarada:

| Real / Predicho | Benign | Malicious |
|---|---:|---:|
| Benign | 435 | 12 |
| Malicious | 16 | 651 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que la tarea no corresponde a esos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (67 M de parámetros), aproximadamente 0,3 GB en FP16 y menos de 0,2 GB en cuantización de 8 bits.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4090 o incluso una GPU integrada puede ejecutar el modelo con latencia de milisegundos.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de VRAM; también puede ejecutarse en CPU con rendimiento aceptable para clasificación por lotes.
- Opciones de despliegue: `transformers` (pipeline de text-classification), `text-embeddings-inference` (etiqueta declarada), y potencialmente `vLLM` no aplica (no es un modelo generativo); `llama.cpp` y `Ollama` no son compatibles de forma nativa con DistilBERT.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia sub-10 ms por petición en GPU y throughput de miles de peticiones por segundo en lote, pero estos valores no están documentados por el autor.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El autor publica otros modelos relacionados (`santu3651/command-attack-detector` y `santu3651/command-attack-detector-distilbert`) según los resultados de búsqueda, pero no se ofrecen sus especificaciones ni métricas para establecer una comparación rigurosa.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shinigami V3 | 66.955.010 | 256 | Clasificación binaria de comandos | MIT | Hugging Face |
| command-attack-detector | 67 M (según búsqueda) | no disponible | Clasificación de texto | no disponible | Hugging Face |
| command-attack-detector-distilbert | no disponible | no disponible | Clasificación de texto | no disponible | Hugging Face |

## Limitaciones y advertencias

- Las predicciones se basan en patrones de texto aprendidos, no en el contexto de ejecución real; un comando benigno en apariencia puede ser peligroso en un entorno concreto y viceversa.
- Existen falsos positivos (2,68 %) y falsos negativos (2,40 %) documentados; no debe usarse como única barrera de seguridad.
- Las puntuaciones de confianza no son garantías de seguridad; el autor lo advierte explícitamente.
- El modelo clasifica texto y no ejecuta comandos ni aplica políticas de seguridad de forma autónoma.
- No se documentan los idiomas soportados; el modelo base `uncased` en inglés sugiere un rendimiento inferior en comandos con texto en otros idiomas o con caracteres no ASCII.
- La longitud máxima de 256 tokens puede truncar comandos largos o scripts completos, lo que puede degradar la detección.
- No se documenta el volumen ni la composición del dataset de entrenamiento, lo que dificulta evaluar sesgos y cobertura de familias de ataque.
- Licencia MIT: permite uso comercial, modificación y redistribución, pero sin garantías; conviene revisar los términos del modelo base `distilbert-base-uncased` (Apache 2.0).
- El modelo tiene cero descargas y cero likes en el momento de la consulta, lo que indica falta de validación por parte de la comunidad.
- No se han publicado resultados de benchmarks estándar ni comparativas con alternativas, lo que limita la evaluación objetiva de su rendimiento relativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/santu3651/shinigami-v3
- Perfil del autor: https://huggingface.co/santu3651
- Datasets del autor: https://huggingface.co/santu3651/datasets
- Modelo relacionado: https://huggingface.co/santu3651/command-attack-detector
- Modelo relacionado: https://huggingface.co/santu3651/command-attack-detector-distilbert
