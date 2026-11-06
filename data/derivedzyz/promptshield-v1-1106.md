# derivedzyz/PromptShield-V1-1106

## Resumen

PromptShield-V1-1106 es un adaptador LoRA para clasificación de prompt injection sobre el modelo base Qwen2.5-0.5B-Instruct, desarrollado por el usuario derivedzyz. El modelo resuelve un problema concreto: dado un texto de entrada en chino o inglés, clasificarlo en una de tres categorías (solicitud normal, maliciosa explícita o riesgo sospechoso) y devolver las puntuaciones crudas de cada clase. No genera texto libre ni ejecuta acciones: es un componente de filtrado que el sistema llamante debe integrar con su propia lógica de decodificación, aislamiento de contexto y respuesta.

La relevancia del proyecto reside en su enfoque metodológico más que en su tamaño. Con solo 540.672 parámetros entrenables (adaptadores Q/V LoRA sobre un modelo de 0,5 mil millones de parámetros), documenta un proceso de entrenamiento semi-supervisado con selección de umbrales calibrados por clase, destilación de etiquetas blandas desde un profesor y validación estricta por conjuntos de promoción. La model card reporta métricas sobre conjuntos públicos (NeurAlchemy, deepset) y escenarios propios de negocio, con comparación explícita frente al modelo base sin adaptar.

El repositorio incluye dos versiones de pesos: la versión "1105" en el directorio raíz (considerada estable) y una candidata en `experimental/` entrenada el 6 de noviembre. La ventana de entrada es de 256 tokens, con truncamiento que conserva el principio y el final del texto. El proyecto está claramente orientado a investigación y evaluación, no a producción directa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-0.5B-Instruct) con adaptadores LoRA en proyecciones Q y V |
| Parámetros totales | No disponible (modelo base Qwen2.5-0.5B-Instruct; adaptador con 540.672 parámetros entrenables) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens de entrada (truncamiento conservando inicio y final) |
| Tipos de cuantización | No disponible (la model card reporta inferencia en BF16) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |
| Librería | peft |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct |
| Salida | Tres puntuaciones crudas (normal, malicioso, sospechoso) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de bajo rango aplicado sobre las proyecciones de query y value de Qwen2.5-0.5B-Instruct. La cabeza de clasificación se entrena para producir tres logits correspondientes a las categorías normal, malicioso y sospechoso. El entrenamiento emplea un esquema semi-supervisado con un profesor (los pesos 1105) que genera etiquetas blandas sobre candidatos no etiquetados; el estudiante aprende de la consistencia entre dos predicciones del profesor y de la confianza en muestras de la misma clase. Los umbrales de selección por clase se calibran con muestras etiquetadas: 0,82 para normal, 0,82 para malicioso y 0,94 para sospechoso, con aciertos de calibración de 68/70, 66/66 y 7/7 respectivamente.

El procedimiento de entrenamiento recursivo se ejecuta en cuatro trials (dos modos de entrenamiento por dos semillas), cada uno con 1.024 candidatos vistos, 96 etiquetas blandas aceptadas (32 por clase) y 48 pasos de entrenamiento, más un control supervisado por trial. El agrupamiento utiliza 24 grupos etiquetados de escenarios con tres intenciones (solicitud normal, petición de ejecución y petición de revisión). Los trials se detienen tras la primera validación generacional. El repo incluye documentación del protocolo, referencias a 12 papers y registros de auditoría de datos. La candidata 1106 mejora la detección de maliciosos (de 1 falso negativo a 0) pero no supera los umbrales predefinidos de promoción en recall medio (0,93583 a 0,93750, umbral 0,002) ni en Brier ajustado por temperatura (0,02171 a 0,02098, umbral 0,003), por lo que se mantiene separada.

## Capacidades

- Clasificación de texto de entrada en tres clases: solicitud normal, maliciosa explícita y riesgo sospechoso.
- Detección de prompt injection en textos en chino e inglés.
- Diferenciación entre peticiones que solicitan ejecutar una acción peligrosa y peticiones que solicitan revisar o auditar un ataque (8/12 identificadas correctamente en el conjunto de escenarios nuevos).
- Salida de puntuaciones crudas por clase, lo que permite al sistema llamante aplicar sus propios umbrales y políticas de decisión.
- Funcionamiento como componente de filtrado previo a un LLM principal, no como generador.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto libre.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Filtrado previo en pipelines RAG: clasificar la consulta del usuario antes de recuperar documentos, derivando las entradas marcadas como maliciosas o sospechosas a un flujo de revisión. La ventana de 256 tokens es suficiente para consultas típicas de búsqueda.
- Moderación de entrada en asistentes conversacionales: interponer el clasificador entre el front-end y el LLM principal para bloquear intentos de jailbreak o de extracción de system prompt antes de que consuman contexto y tokens del modelo grande.
- Auditoría de correos y documentos entrantes: el modelo distingue entre una solicitud legítima de revisión de un correo y una petición de ejecución de acciones sobre datos de clientes, según los escenarios de negocio reportados en la model card.
- Protección de agentes con acceso a herramientas: clasificar las instrucciones que llegan al orquestador antes de que este invoque APIs sensibles, usando la categoría "sospechoso" como señal para escalar a verificación humana.
- Evaluación comparativa de defensas: servir como línea base ligera (0,5B parámetros) para medir la eficacia de clasificadores de injection más grandes en experimentos de investigación.
- Despliegue en entornos con recursos limitados: al ser un adaptador sobre un modelo de 0,5B, puede ejecutarse en CPU o en GPU de consumo, lo que permite filtrar tráfico en el borde o en portátiles de desarrollo sin infraestructura dedicada.
- Generación de datos de entrenamiento: usar las puntuaciones y las etiquetas blandas del profesor para etiquetar corpus no anotados en chino e inglés y ampliar conjuntos de entrenamiento de clasificadores de seguridad.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre inferencia en BF16, GPU RTX 5060 Laptop, una muestra por vez. Las cifras son número de aciertos sobre el total de cada conjunto.

| Conjunto | Qwen base | Pesos 1105 | Candidata 1106 |
|---|---:|---:|---:|
| NeurAlchemy público (855) | 516 | 842 | 843 |
| deepset público (116) | 60 | 112 | 111 |
| Escenarios de negocio existentes (72) | 24 | 68 | 68 |
| Muestras de tres clases del proyecto (12) | 4 | 12 | 12 |
| Escenarios nuevos de esta ronda (36) | 12 | 31 | 31 |

Métricas adicionales de la candidata 1106 frente a 1105: recall medio agrupado 0,93750 frente a 0,93583; Brier ajustado por temperatura 0,02098 frente a 0,02171; en el conjunto de promoción de 324 muestras, 321 aciertos frente a 320. En los escenarios nuevos, ambos adaptadores identifican 12/12 peticiones de ejecución no autorizada y 8/12 peticiones de revisión de ataques; en 7/12 escenarios de negocio aciertan las tres intenciones.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El modelo base Qwen2.5-0.5B-Instruct en BF16 ocupa aproximadamente 1 GB de pesos; con el adaptador y el overhead de inferencia, cabe holgadamente en GPUs de 4 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con soporte BF16. La model card reporta pruebas en RTX 5060 Laptop GPU; también se documenta ejecución en CPU (`Detector(device="cpu")`).
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna con al menos 4 GB de VRAM; también en CPU para inferencia de una sola muestra.
- Opciones de despliegue: el repo proporciona un módulo `inference.py` con la clase `Detector`; al ser un adaptador PEFT, puede cargarse con Transformers + PEFT. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Dependencias declaradas: PyTorch 2.13.0, Transformers 5.5.0, safetensors 0.8.0.
- Latencia y throughput: no disponibles. La model card solo indica inferencia de una muestra por vez en BF16.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card únicamente compara el adaptador con su propio modelo base (Qwen2.5-0.5B-Instruct sin ajustar) y con la versión anterior de sus propios pesos (1105), no con clasificadores de prompt injection de terceros.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PromptShield-V1-1106 | Adaptador 540.672 sobre base 0,5B | 256 tokens | No disponible | HuggingFace (repo propio) |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | No disponible en esta ficha | No disponible en esta ficha | HuggingFace |
| Alternativas de terceros | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La licencia no está declarada en la información disponible; no puede asumirse uso comercial sin consultar al autor.
- El modelo clasifica, no genera: cualquier expectativa de uso como LLM conversacional es incorrecta.
- Ventana de entrada de solo 256 tokens con truncamiento que conserva inicio y final; textos largos pueden perder la parte central donde podría residir la inyección.
- Solo cubre chino e inglés; otros idiomas quedan fuera del ámbito declarado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño reportado es 0.0 GB; se trata de una publicación de investigación sin validación externa.
- La candidata 1106 no superó los umbrales de promoción definidos por el propio autor; los pesos del directorio raíz (1105) son los recomendados para inferencia formal.
- Los conjuntos de evaluación son pequeños (36 y 12 muestras en los escenarios propios) y los resultados tienen alta varianza; las diferencias entre 1105 y 1106 son de una o dos muestras.
- Riesgo de falsos negativos en ataques novedosos no representados en los datos de entrenamiento; la categoría "sospechoso" existe precisamente para cubrir la incertidumbre, pero su umbral es alto (0,94) y puede dejar pasar casos límite.
- El sistema llamante es responsable de la decodificación, el aislamiento de contexto y la respuesta; el modelo no implementa ninguna de esas capas.
- Alucinación: no aplica en el sentido generativo, pero las puntuaciones pueden ser sobreconfiadas en entradas fuera de distribución.
- No se documentan sesgos específicos por idioma, dominio o demografía.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/derivedzyz/PromptShield-V1-1106
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset deepset prompt-injections: https://huggingface.co/datasets/deepset/prompt-injections
- Dataset NeurAlchemy Prompt-injection-dataset: https://huggingface.co/datasets/neuralchemy/Prompt-injection-dataset
- Documentación de entrenamiento (referenciada en la model card): `training/recursive/TRAINING.md` dentro del repositorio
- Referencias de investigación (referenciadas): `training/recursive/RESEARCH-1106.md`
- Protocolos de experimentación (referenciados): `training/recursive/PROTOCOL-1106.md` y `training/recursive/CONTRAST-1106.md`
- Registros de trials (referenciados): `results/trials.json` y `results/data-audit.json`
- Versión anterior: etiqueta `v1-1105` en los repositorios del autor
