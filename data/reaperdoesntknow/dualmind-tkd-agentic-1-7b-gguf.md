# reaperdoesntknow/DualMind-TKD-Agentic-1.7B-GGUF

## Resumen

DualMind-TKD-Agentic-1.7B-GGUF es un modelo de lenguaje de 1.720 millones de parámetros publicado por el usuario reaperdoesntknow en HuggingFace. Se trata de un fine-tuning del modelo base Qwen3, convertido al formato GGUF mediante la librería Unsloth para su ejecución eficiente con llama.cpp y herramientas compatibles como Ollama. El nombre sugiere un enfoque orientado a agentes conversacionales, y las etiquetas de la ficha lo clasifican como "conversational" y compatible con endpoints de inferencia.

El modelo se distribuye exclusivamente en formato GGUF con tres niveles de cuantización (Q4_K_M, Q6_K y Q8_0), lo que permite su despliegue en hardware de consumo con requisitos de memoria reducidos. Según los datos recogidos en llm-explorer, la ventana de contexto alcanza los 40.000 tokens, aunque esta cifra no está confirmada en la documentación oficial del autor. Su relevancia radica en ser una opción compacta y ligera para experimentar con agentes conversacionales en entornos locales, sin necesidad de infraestructura de servidor.

La ficha de HuggingFace no incluye información sobre la licencia, los idiomas soportados, el dataset de entrenamiento ni los benchmarks, por lo que buena parte de las especificaciones técnicas deben considerarse no disponibles. El repositorio contiene únicamente los archivos GGUF y una breve instrucción de uso con llama-cli.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer decoder-only) |
| Parametros totales | 1.720.574.976 (1,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.000 tokens (según llm-explorer, no confirmado por el autor) |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3, un transformer decoder-only con atención de múltiples cabezas y normalización RMSNorm. No se han publicado detalles sobre el número de capas, dimensiones ocultas ni el mecanismo de atención específico, más allá de que corresponde a la familia Qwen3. El autor indica en la model card que el fine-tuning se realizó con Unsloth, una librería que acelera el entrenamiento y la conversión a GGUF, logrando un entrenamiento "2x más rápido" según su descripción.

No se dispone de información sobre el dataset de fine-tuning, el número de tokens de entrenamiento, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se especifican innovaciones técnicas particulares más allá de la conversión a GGUF. La ausencia de una ficha técnica detallada impide conocer la composición exacta de los datos o el procedimiento de ajuste.

## Capacidades

Dado que la documentación es mínima, las capacidades listadas a continuación se infieren de las etiquetas del modelo y del nombre del repositorio, no de pruebas documentadas:

- Conversación multi-turno: el modelo está etiquetado como "conversational", lo que sugiere que puede mantener diálogos, aunque no hay ejemplos ni métricas que lo confirmen.
- Orientación a agentes: el nombre "Agentic" indica un diseño pensado para tareas de agente, pero no se documenta soporte explícito de tool calling o function calling.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere que puede servirse mediante APIs de inferencia estándar.
- Ejecución local: al estar en formato GGUF, es compatible con llama.cpp, llama-cli y Ollama, lo que permite uso offline en CPU o GPU.

No hay evidencia de capacidades multimodales, razonamiento matemático avanzado, generación de código o soporte multilingüe más allá del que pueda heredar del modelo base Qwen3.

## Casos de uso

Dado que no hay documentación oficial de casos de uso, los siguientes escenarios son propuestas razonables basadas en las características del modelo (tamaño compacto, formato GGUF, orientación conversacional) y deben validarse con pruebas propias:

- Prototipado rápido de chatbots locales: por su tamaño reducido y formato GGUF, puede ejecutarse en portátiles con 4-8 GB de RAM, permitiendo iterar sobre flujos conversacionales sin depender de APIs externas.
- Asistentes personales en dispositivos de baja potencia: con cuantización Q4_K_M (1,11 GB), el modelo cabe en Raspberry Pi 5 o mini-PCs, aunque la latencia dependerá del hardware.
- Experimentación académica con agentes conversacionales: estudiantes e investigadores pueden usarlo para estudiar comportamientos de diálogo multi-turno y patrones de generación sin coste de inferencia.
- Pruebas de integración con llama.cpp y Ollama: al ser GGUF nativo, sirve para validar pipelines de inferencia local, gestión de contexto y plantillas de chat (jinja).
- Despliegue en entornos con restricciones de privacidad: al ejecutarse en local, evita enviar datos a servicios externos, útil para aplicaciones que manejan información sensible.
- Generación de contenido creativo de baja exigencia: cuentos cortos, ideas de nombres, borradores de correos, siempre que el usuario acepte una calidad variable al no haber benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras pruebas estandarizadas para este modelo. La ausencia de métricas impide comparar su rendimiento con otros modelos de forma objetiva.

## Requisitos de hardware

- Tamaños de archivo GGUF según cuantización: Q4_K_M (1,11 GB), Q6_K (1,42 GB), Q8_0 (1,83 GB).
- VRAM estimada: según llm-explorer, aproximadamente 3,4 GB para la cuantización Q4_K_M, incluyendo el contexto. Esto permite ejecución en GPUs de consumo como GTX 1660 Super (6 GB), RTX 2060 (6 GB) o superiores.
- CPU: puede ejecutarse únicamente con CPU mediante llama.cpp, con velocidades de generación de unos pocos tokens por segundo en procesadores modernos de 8 núcleos.
- GPU recomendadas: RTX 3060 (12 GB) o superiores para una experiencia fluida con contexto largo (40K tokens).
- Opciones de despliegue: llama.cpp, llama-cli, Ollama, servidores compatibles con GGUF (llama-server, text-generation-webui). También es compatible con plataformas de endpoints como FriendliAI según los resultados de búsqueda.
- Latencia y throughput: no se han publicado mediciones oficiales. En una RTX 4090 se podría esperar una generación de 50-100 tokens/s con Q4_K_M, pero es una estimación no verificada.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo es un fine-tuning de Qwen3 de 1,7B, pero no se conocen los detalles del ajuste ni sus resultados. Como referencia general, se podría comparar con otros modelos GGUF de tamaño similar como Qwen2.5-1.5B-Instruct o Llama-3.2-1B, pero al carecer de benchmarks de DualMind-TKD-Agentic-1.7B, cualquier comparación numérica sería especulativa. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Licencia no especificada: no se indica bajo qué términos se distribuye el modelo. Esto impide conocer si se permite uso comercial, modificación o redistribución. Antes de usarlo en producción, es imprescindible contactar con el autor o revisar el repositorio original.
- Sin documentación técnica: no hay información sobre el dataset de entrenamiento, el proceso de alineación ni las capacidades reales. El modelo debe tratarse como experimental.
- Riesgo de alucinación: al ser un modelo pequeño (1,7B) sin benchmarks conocidos, la probabilidad de generar información falsa o incoherente es mayor que en modelos de mayor tamaño.
- Sesgos potenciales: al derivar de Qwen3, puede heredar sesgos presentes en los datos de entrenamiento del modelo base, pero no hay análisis específicos disponibles.
- Contexto largo no verificado: la cifra de 40K tokens proviene de una fuente externa (llm-explorer) y no está confirmada por el autor. El rendimiento real con contextos largos puede degradarse.
- Idiomas no documentados: no se especifica qué idiomas soporta. Si se necesita un idioma distinto del inglés o chino, es recomendable probar primero.
- Sin garantías de calidad: al no haber benchmarks, el rendimiento en tareas específicas (razonamiento, código, matemáticas) es desconocido y puede ser deficiente.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/reaperdoesntknow/DualMind-TKD-Agentic-1.7B-GGUF
- Modelo base (sin cuantizar) en HuggingFace: https://huggingface.co/reaperdoesntknow/DualMind-TKD-Agentic-1.7B
- Página en FriendliAI para despliegue como endpoint: https://friendli.ai/models/reaperdoesntknow/DualMind-TKD-Agentic-1.7B
- Ficha en LLM Explorer con datos de contexto y VRAM: https://llm-explorer.com/model/reaperdoesntknow%2FDualMind-TKD-Agentic-1.7B,60uiu1cSuPHByFDHBqFewz
- Repositorio de Unsloth (herramienta de fine-tuning y conversión): https://github.com/unslothai/unsloth
