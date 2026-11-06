# derivedzyz/PromptShield-V1-1105

## Resumen

PromptShield-V1-1105 es un adaptador LoRA para detección de prompt injection, desarrollado por el usuario derivedzyz y publicado en Hugging Face. Se construye sobre el modelo base Qwen2.5-0.5B-Instruct de Alibaba y su función es clasificar un texto de entrada en tres categorías: normal, claramente malicioso o sospechoso. El modelo se distribuye como adaptador PEFT (no como pesos completos) y está pensado para integrarse en pipelines de filtrado previo a la invocación de un LLM mayor.

El modelo emplea una ventana de 256 tokens, conservando el inicio y el final de las entradas largas, y devuelve puntuaciones que, según el autor, no están calibradas como probabilidades. Es la primera generación validada dentro de un proceso de autoentrenamiento recursivo del autor, lo que explica su naturaleza experimental y su escasa adopción (0 descargas y 0 likes en el momento de la consulta).

Su relevancia es acotada pero concreta: ofrece un clasificador ligero (0,5B de parámetros) ejecutable en CPU para una tarea crítica de seguridad en aplicaciones LLM, aunque su validación se limita a conjuntos de test pequeños y no se han publicado métricas detalladas ni calibración.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parámetros totales | 0,5B (modelo base Qwen2.5-0.5B-Instruct) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (ventana de inferencia; conserva inicio y final) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA, librería peft) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA montado sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5B parámetros. El adaptador se entrena para una tarea de clasificación de tres clases (normal, malicioso, sospechoso) sobre entradas normalizadas. La inferencia se realiza con una ventana fija de 256 tokens, truncando las entradas largas mediante la conservación del principio y el final del texto.

Los datos de entrenamiento declarados incluyen el dataset público deepset/prompt-injections, el dataset NeurAlchemy/Prompt-injection-dataset, muestras propias del proyecto y etiquetas suaves filtradas. El autor indica que esta versión es la primera generación validada dentro de un proceso de autoentrenamiento recursivo, sin que se detallen el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. No se documentan innovaciones arquitectónicas adicionales más allá del uso de LoRA y del esquema de truncado por ventana.

## Capacidades

- Clasificación de prompt injection en tres categorías: normal, claramente malicioso y sospechoso.
- Detección sobre texto normalizado de entrada, con ventana de 256 tokens y conservación de inicio y final en entradas largas.
- Ejecución en CPU (el ejemplo de la model card usa `device="cpu"`), lo que permite despliegue en entornos sin GPU.
- Soporte de dos idiomas: chino e inglés.
- Integración mediante la clase `Detector` del módulo `inference` incluido en el repositorio.
- No se documentan capacidades de generación de texto, razonamiento general, código, matemáticas, visión, tool calling, agentes ni modo thinking; el adaptador está especializado exclusivamente en clasificación de seguridad.

## Casos de uso

- Filtrado previo a un LLM en producción: el clasificador se ejecuta antes de enviar la petición del usuario al modelo principal y bloquea o marca entradas maliciosas, reduciendo el riesgo de secuestro de instrucciones en aplicaciones de chat.
- Moderación de entradas en asistentes conversacionales: al ejecutarse en CPU y con 0,5B de parámetros, puede desplegarse como microservicio ligero junto a la pasarela de inferencia sin competir por VRAM con el modelo generativo.
- Protección de agentes con tool calling: las entradas que intentan manipular las instrucciones del sistema o forzar llamadas a herramientas no autorizadas pueden etiquetarse como sospechosas antes de que el agente las procese.
- Enriquecimiento de logs de seguridad: las puntuaciones de las tres clases permiten clasificar y priorizar intentos de inyección registrados en auditorías de tráfico hacia APIs LLM.
- Filtrado en pipelines RAG: antes de incorporar contenido de usuario a la construcción de prompts con documentos recuperados, el detector puede marcar entradas que intentan inyectar instrucciones a través de campos de texto libre.
- Evaluación comparativa de defensas: al ser un adaptador pequeño y reproducible, sirve como línea base para medir la eficacia de otras defensas contra prompt injection en experimentos académicos o internos.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la model card son recuentos de aciertos sobre dos conjuntos de test, sin métricas agregadas como precisión, recall o F1:

| Conjunto de evaluación | Muestras | Aciertos | Tasa de acierto |
|---|---|---|---|
| NeurAlchemy (público) | 855 | 842 | 98,5 % |
| Muestras de escenario del proyecto | 72 | 69 | 95,8 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni comparaciones con otros detectores de prompt injection. El autor advierte que las puntuaciones no están calibradas como probabilidades.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, inferior a 2 GB en fp16 para el modelo base de 0,5B más el adaptador LoRA; ejecutable en CPU según la model card.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobredimensionada para este modelo; también válido en A100/H100 si se comparte infraestructura.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU (CPU).
- Opciones de despliegue: la model card documenta inferencia mediante la clase `Detector` del repositorio con PyTorch, transformers==5.5.0 y safetensors. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor solo indica que la inferencia de una sola muestra en CPU funciona correctamente.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia estructural, el modelo se apoya en Qwen2.5-0.5B-Instruct, pero no se han publicado comparaciones con otros detectores de prompt injection (por ejemplo, clasificadores basados en modelos encoder como DeBERTa o variantes especializadas). Datos comparativos: no disponible.

## Limitaciones y advertencias

- Ventana de contexto muy limitada (256 tokens): las entradas largas se truncan conservando solo inicio y final, por lo que ataques embebidos en el centro de un texto extenso pueden pasar desapercibidos.
- Puntuaciones no calibradas: no deben interpretarse directamente como probabilidades ni usarse con umbrales fijos sin validación previa en el dominio de despliegue.
- Validación limitada: los resultados publicados se basan en 855 y 72 muestras, sin métricas de precisión/recall por clase ni matrices de confusión.
- Cobertura lingüística restringida a chino e inglés; el rendimiento en castellano u otros idiomas no está documentado.
- Licencia no especificada: no se puede confirmar el uso comercial ni las restricciones de redistribución; es un riesgo legal relevante para producción.
- Modelo experimental de primera generación dentro de un proceso de autoentrenamiento recursivo, con 0 descargas y 0 likes, sin comunidad que valide su comportamiento.
- El autor delega en el llamador la decodificación de entradas y el control de permisos de negocio, por lo que el modelo no constituye por sí solo una defensa completa.
- Riesgo de alucinación en la clasificación: al ser un modelo generativo adaptado a clasificación, puede producir etiquetas erróneas en entradas ambiguas o adversariales no vistas durante el entrenamiento.
- No se documentan sesgos conocidos ni evaluaciones de robustez frente a ataques adversariales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/derivedzyz/PromptShield-V1-1105
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset deepset/prompt-injections: https://huggingface.co/datasets/deepset/prompt-injections
- Dataset NeurAlchemy/Prompt-injection-dataset: https://huggingface.co/datasets/neuralchemy/Prompt-injection-dataset
