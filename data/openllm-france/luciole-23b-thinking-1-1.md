# OpenLLM-France/Luciole-23B-Thinking-1.1

## Resumen

Luciole-23B-Thinking-1.1 es un modelo de lenguaje causal de 23.216 millones de parámetros desarrollado por LINAGORA y el consorcio OpenLLM-France en el marco del proyecto OpenLLM France, financiado por BPI France a través del programa France 2030. Se trata de la primera iteración post-entrenada del modelo base Luciole-23B-Base, un modelo multilingüe de código abierto orientado principalmente al francés y al inglés.

El modelo ha sido sometido a un proceso de post-entrenamiento en dos fases: un ajuste supervisado (SFT) sobre datos de instrucciones con trazas de razonamiento (thinking traces) y una alineación final de preferencias mediante Direct Preference Optimization (DPO). El resultado es un modelo conversacional con capacidad de razonamiento explícito, entrenado sobre secuencias de 16.384 tokens.

Su relevancia radica en que constituye un bloque de construcción abierto (pesos, receta de entrenamiento y datos publicados) para el ecosistema francófono de IA, con licencia Apache 2.0 que permite uso comercial sin restricciones adicionales. No obstante, conviene señalar que el post-entrenamiento se realizó casi exclusivamente con datos en inglés, pese a que el modelo base se entrenó con aproximadamente un 30% de datos en francés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (derivada de Nemotron; detalles completos no disponibles) |
| Parámetros totales | 23.216.467.968 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 16.384 tokens (entrenamiento) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | francés (fr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal derivado de la familia Nemotron (según las etiquetas del repositorio), con 23.216 millones de parámetros totales. El modelo base, Luciole-23B-Base, fue entrenado con aproximadamente un 30% de datos en francés y su ventana de contexto se extendió hasta 131.000 tokens; sin embargo, el post-entrenamiento de la versión Thinking-1.1 se realizó sobre secuencias de 16.384 tokens, por lo que la longitud de contexto efectiva para esta variante queda limitada a ese valor.

El post-entrenamiento consta de dos fases documentadas con detalle en la model card. La primera es un SFT con trazas de razonamiento sobre 2,6 millones de muestras durante 4 épocas, con learning rate máximo de 2,0e-5, scheduler coseno, batch size de 2048 y longitud máxima de secuencia de 16.384 tokens. La segunda fase aplica DPO con trazas de pensamiento sobre 103.000 muestras durante 1 época, con learning rate máximo de 3,0e-8, scheduler lineal, batch size de 128 y β = 5. Los datos de post-entrenamiento cubren matemáticas, ciencia, programación, conversación general, RAG y traducción, y están publicados como OpenLLM-France/Luciole-PostTraining-Dataset-1.1. El entrenamiento se ejecutó en el supercomputador Jean Zay de GENCI, gestionado por IDRIS.

## Capacidades

- Generación de texto y razonamiento con modo thinking: el modelo produce trazas de razonamiento explícitas antes de la respuesta final, fruto del SFT y DPO sobre datos con thinking traces.
- Conversación multi-turno e instrucciones generales, con foco declarado en seguimiento de instrucciones.
- Matemáticas y ciencia: cubiertas en los datos de post-entrenamiento, aunque el autor advierte que se necesitaría entrenamiento adicional para tareas específicas de resolución de problemas matemáticos.
- Programación: presente en los datos de entrenamiento, pero con la misma advertencia del autor sobre necesidad de entrenamiento adicional para generación de código en producción.
- RAG: el modelo ha sido entrenado con datos de RAG y el autor recomienda explícitamente integrarlo en pipelines de recuperación aumentada.
- Traducción: incluida en la composición del dataset de post-entrenamiento.
- Tool calling / function calling: capacidad experimental. El modelo ha visto algunos datos de tool calling, pero el autor señala que tiene tendencia a rechazar en exceso las peticiones de llamada a herramientas.
- Capacidades multilingües: francés e inglés declarados; el post-entrenamiento se realizó casi íntegramente en inglés.

## Casos de uso

- Asistente conversacional en francés e inglés: el modelo puede gestionar diálogos multi-turno con un contexto de 16.384 tokens, adecuado para conversaciones de atención al cliente de extensión media. Es apropiado por su licencia Apache 2.0 y su soporte nativo de ambos idiomas, aunque conviene validar la calidad en francés dado que el post-entrenamiento fue mayoritariamente en inglés.
- Generación de respuestas con razonamiento explícito: en tareas que requieren justificar una conclusión (análisis de documentos, resolución de problemas de ciencia), el modo thinking permite exponer la cadena de razonamiento y auditar el resultado.
- Integración en pipelines RAG: el autor recomienda explícitamente su uso con recuperación aumentada para mitigar alucinaciones y ampliar la base de conocimiento sin reentrenar. El modelo fue entrenado con datos de RAG, lo que facilita este patrón de despliegue.
- Traducción asistida fr-en: aunque no es su función principal, el modelo ha sido expuesto a datos de traducción y puede emplearse en flujos de traducción con revisión humana posterior.
- Prototipado de agentes con tool calling: dado que la capacidad es experimental y el modelo tiende a rechazar peticiones de herramientas, es adecuado para entornos de investigación y validación, no para producción crítica sin ajuste adicional.
- Base para fine-tuning específico de dominio: al publicarse pesos, receta y datos bajo Apache 2.0, el modelo sirve como punto de partida para ajustes posteriores en dominios concretos (legal, sanitario, administrativo francés), tal como recomienda el propio autor.
- Investigación en alineación y post-entrenamiento: la publicación conjunta de dataset, receta y modelo permite reproducir y estudiar el efecto del SFT con thinking traces y del DPO en modelos de 23B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el informe técnico está "coming soon" y no incluye tablas de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (FP16/BF16): aproximadamente 46,4 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 2 GPU de 48 GB o una GPU de 80 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB para FP16/BF16; para cuantización de 8 bits, una A100 40 GB o H100 podría ser suficiente para pesos, aunque el overhead de contexto de 16K exige margen adicional.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en FP16. Sería necesario cuantizar a 4 bits (aproximadamente 12-13 GB de pesos) para que quepa en una RTX 4090 o RTX 3090, con contexto reducido.
- Opciones de despliegue: la model card documenta explícitamente el uso con Ollama y con vLLM. Otros frameworks compatibles con safetensors (TGI, SGLang) son viables pero no están documentados por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Luciole-23B-Thinking-1.1 | 23,2B | 16.384 | fr, en | Apache 2.0 | Post-entrenamiento mayoritariamente en inglés; thinking mode; tool calling experimental |
| Luciole-23B-Base | 23,2B (no confirmado) | 131.000 | fr, en | Apache 2.0 | Modelo base; ~30% de datos en francés; sin post-entrenamiento |
| Alternativas de 20-30B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks ni comparativas publicadas en la información proporcionada |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoría en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Alucinación: el modelo puede generar respuestas falsas como consecuencia de su entrenamiento sobre grandes volúmenes de texto diverso; el autor recomienda integrarlo en un pipeline RAG para mitigarlo.
- Sesgo lingüístico: el post-entrenamiento se realizó casi íntegramente en inglés, pese a que el modelo base incluía un 30% de francés. El rendimiento en francés puede ser inferior al esperado por el posicionamiento del proyecto.
- Contexto limitado: la ventana efectiva es de 16.384 tokens, muy inferior a los 131.000 del modelo base. El autor recomienda extender el entrenamiento con secuencias más largas para recuperar contexto.
- Tool calling poco fiable: el modelo tiende a rechazar en exceso las peticiones de llamada a herramientas; la capacidad es experimental.
- Identidad del modelo: no ha sido entrenado con prompts de identidad, por lo que puede responder incorrectamente sobre su nombre u origen.
- Código y matemáticas: el entrenamiento se centró en seguimiento general de instrucciones; se requiere entrenamiento adicional para tareas específicas de generación de código y resolución de problemas matemáticos.
- Seguridad: aunque ha pasado por alineación de seguridad durante la fase DPO, puede generar contenido inseguro para determinadas entradas.
- Madurez: es la primera iteración de modelos post-entrenados del proyecto; el autor recomienda probar exhaustivamente el modelo en los casos de uso objetivo antes de incorporarlo a pipelines industriales.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero el usuario asume la responsabilidad de validar el comportamiento del modelo en su dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenLLM-France/Luciole-23B-Thinking-1.1
- Modelo base: https://huggingface.co/OpenLLM-France/Luciole-23B-Base
- Dataset de post-entrenamiento: https://huggingface.co/datasets/OpenLLM-France/Luciole-PostTraining-Dataset-1.1
- Repositorio de entrenamiento: https://github.com/OpenLLM-France/Luciole-Training/tree/main/finetune
- Web del proyecto OpenLLM-France: https://openllm-france.fr/
- LINAGORA Labs: https://labs.linagora.com/
- GENCI: https://www.genci.fr/
- IDRIS: http://www.idris.fr/docs/idris/missions
- BPI France: https://www.bpifrance.fr/
- Programa France 2030: https://www.info.gouv.fr/grand-dossier/france-2030
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Contacto: contact@openllm-france.fr
