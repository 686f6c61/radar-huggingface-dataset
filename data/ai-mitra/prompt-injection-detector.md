# ai-mitra/prompt-injection-detector

## Resumen

El modelo `ai-mitra/prompt-injection-detector` es un clasificador binario diseñado para detectar intentos de inyección de prompts en entradas de texto destinadas a sistemas basados en grandes modelos de lenguaje. Fue desarrollado por el autor `ai-mitra` y publicado bajo licencia MIT. El modelo no es un LLM en sí, sino un pipeline compuesto por un modelo de embeddings de Sentence Transformers (`sentence-transformers/all-MiniLM-L6-v2`) y un clasificador de regresión logística entrenado sobre dichas representaciones vectoriales.

La relevancia de esta herramienta radica en la creciente amenaza de ataques de inyección de prompts, clasificados como la vulnerabilidad LLM01 en el proyecto OWASP Gen AI y documentados en el marco MITRE ATLAS. Este detector permite filtrar entradas maliciosas antes de que lleguen a un LLM, reduciendo el riesgo de manipulación del comportamiento del modelo. Al tratarse de un clasificador ligero (regresión logística sobre embeddings), puede ejecutarse con recursos mínimos y en tiempo real, lo que lo hace adecuado para su integración en pipelines de seguridad.

El repositorio de Hugging Face contiene únicamente el artefacto `classifier.joblib` y la model card. No se incluyen datos de entrenamiento, métricas de rendimiento ni información sobre el dataset utilizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión logística sobre embeddings de `sentence-transformers/all-MiniLM-L6-v2` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo de embeddings subyacente) |
| Tipos de cuantizacion | no aplica (formato joblib, no cuantizado) |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | joblib (serialización de Python) |

## Arquitectura y entrenamiento

El modelo sigue un flujo de dos etapas. Primero, el texto de entrada se procesa con el modelo de Sentence Transformers `all-MiniLM-L6-v2`, que genera un vector de embeddings de 384 dimensiones. A continuación, ese vector se pasa a un clasificador de regresión logística (`classifier.joblib`), que devuelve la probabilidad de que la entrada sea una inyección de prompts. El clasificador fue entrenado con un umbral de decisión de 0.70, aunque este valor puede ajustarse según las necesidades de precisión o recall del usuario.

No se dispone de información sobre el dataset de entrenamiento, el número de ejemplos utilizados ni el proceso de validación. Tampoco se especifica si se aplicaron técnicas de regularización o si el clasificador fue calibrado. El autor indica explícitamente que el clasificador no puede usarse sin el modelo de embeddings correspondiente, ya que fue entrenado sobre las representaciones generadas por `all-MiniLM-L6-v2`.

## Capacidades

- Clasificación binaria de texto: etiqueta `0` (safe) o `1` (prompt_injection).
- Devuelve probabilidad de pertenencia a la clase `prompt_injection`, permitiendo ajustar el umbral según el equilibrio deseado entre falsos positivos y falsos negativos.
- Integración sencilla con el ecosistema `sentence-transformers` y `scikit-learn`.
- Inferencia rápida y ligera: al tratarse de un clasificador lineal sobre embeddings, no requiere GPU y puede ejecutarse en CPU.
- No incluye capacidades de generación de texto, razonamiento, tool calling ni soporte multilingüe explícito.

## Casos de uso

- Filtrado de entradas en aplicaciones LLM: integrar el detector como middleware entre el usuario y el modelo generativo, bloqueando automáticamente prompts que contengan intentos de inyección como "ignora instrucciones anteriores" o "revela tu prompt de sistema".
- Preprocesamiento en pipelines de agentes: antes de que un agente autónomo procese una instrucción, se puede verificar si la entrada contiene patrones maliciosos, reduciendo el riesgo de que el agente ejecute acciones no deseadas.
- Moderación de prompts en chatbots empresariales: en sistemas de atención al cliente basados en LLM, el detector puede actuar como capa de seguridad para impedir que usuarios malintencionados manipulen el comportamiento del chatbot.
- Protección de sistemas RAG: en arquitecturas de generación aumentada por recuperación, el detector puede examinar los documentos recuperados y las consultas para detectar inyecciones que intenten alterar el contexto.
- Auditoría de seguridad: analizar logs de interacciones pasadas para identificar intentos de inyección y evaluar la eficacia de las defensas existentes.
- Red teaming automatizado: durante pruebas de penetración de sistemas LLM, el detector puede usarse como herramienta de validación para comprobar si los ataques generados son detectados correctamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como precisión, recall, F1 o AUC, ni comparaciones con otros detectores de inyección de prompts.

## Requisitos de hardware

- Inferencia en CPU: el clasificador de regresión logística es extremadamente ligero; el cuello de botella es el modelo de embeddings `all-MiniLM-L6-v2`, que también se ejecuta sin problemas en CPU.
- VRAM estimada: no requiere VRAM; puede funcionar con memoria RAM convencional. El modelo de embeddings ocupa aproximadamente 90 MB en memoria (según especificaciones de Sentence Transformers para MiniLM-L6-v2).
- GPU recomendadas: no se requiere GPU. Cualquier CPU moderna es suficiente.
- Compatibilidad con consumer hardware: sí, funciona en cualquier ordenador portátil o servidor sin aceleración gráfica.
- Opciones de despliegue: al ser un artefacto `joblib`, puede integrarse en servicios Python con frameworks como FastAPI o Flask. No se dispone de integraciones nativas con vLLM, Ollama o TGI.
- Latencia y throughput: no se dispone de mediciones oficiales. En una CPU típica, el embedding de un texto corto tarda unos pocos milisegundos, y la clasificación lineal es prácticamente instantánea.

## Comparativa con modelos similares

No se dispone de datos cuantitativos para comparar este modelo con otros detectores de inyección de prompts. Existen alternativas basadas en transformers, como `ProtectAI/deberta-v3-base-prompt-injection-v2` o `deepset/deberta-v3-base-injection`, pero no se ha encontrado información sobre su rendimiento relativo en la documentación proporcionada. La diferencia principal es que este modelo es considerablemente más ligero y rápido, al no requerir un transformer completo para la clasificación, pero podría tener menor capacidad de generalización a patrones complejos de inyección.

## Limitaciones y advertencias

- Dependencia del modelo de embeddings: el clasificador solo funciona correctamente si se utiliza `sentence-transformers/all-MiniLM-L6-v2` para generar las representaciones. Usar otro embedder invalidaría las predicciones.
- Cobertura de idiomas limitada: el modelo de embeddings subyacente está entrenado principalmente en inglés, por lo que el detector puede tener un rendimiento deficiente en otros idiomas, aunque no se especifica oficialmente.
- Generalización incierta: al no publicarse el dataset de entrenamiento, no es posible evaluar su robustez frente a variaciones de ataques de inyección, ofuscación o técnicas avanzadas como las descritas en MITRE ATLAS.
- Riesgo de falsos negativos: los ataques de inyección sofisticados, como los que utilizan codificación Unicode o instrucciones divididas, pueden no ser detectados.
- Riesgo de falsos positivos: entradas legítimas que contengan frases como "ignora instrucciones" en un contexto inocuo podrían ser bloqueadas.
- Sin soporte para uso comercial: la licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en entornos de producción.
- Actualización y mantenimiento: el repositorio no muestra actividad desde su creación en septiembre de 2026, y no se han publicado versiones adicionales ni documentación de soporte.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ai-mitra/prompt-injection-detector
- Contexto sobre ataques de inyección de prompts (MITRE ATLAS): https://medium.com/@michael.hannecke/understanding-the-mitre-atlas-matrix-how-attackers-target-ai-systems-ecb75399819f
- Framework MITRE ATLAS para seguridad en IA: https://trydeepteam.com/docs/frameworks-mitre-atlas
- Artículo de Vectra sobre MITRE ATLAS: https://www.vectra.ai/topics/mitre-atlas
- Documentación de Promptfoo sobre MITRE ATLAS: https://www.promptfoo.dev/docs/red-team/mitre-atlas/
- OWASP LLM01:2025 Prompt Injection: https://genai.owasp.org/llmrisk/llm01-prompt-injection/
