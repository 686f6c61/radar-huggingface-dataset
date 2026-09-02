# mradermacher/Mistral-Small-24B-Instruct-Jbliterated-GGUF

## Resumen

Mistral-Small-24B-Instruct-Jbliterated-GGUF es una colección de cuantizaciones GGUF del modelo ApolloRaines/Mistral-Small-24B-Instruct-Jbliterated, preparada por mradermacher (nethype GmbH). El modelo base es una versión del Mistral Small 24B Instruct (Mistral Small 3) sometida a una técnica de "weight surgery" denominada *jbliterated*, variante de la abliteration que elimina selectivamente las direcciones de peso asociadas a comportamientos de rechazo o censura. El resultado es un modelo instructivo con 23 572 403 200 parámetros, licencia Apache-2.0 y orientado exclusivamente al inglés.

Esta versión GGUF permite ejecutar el modelo en entornos locales con distintas precisiones (desde Q2_K hasta Q8_0), lo que lo hace atractivo para desarrolladores que necesitan un modelo de 24B con capacidades conversacionales y de generación de texto sin depender de APIs externas. La cuantización reduce los requisitos de VRAM y facilita el despliegue en hardware de consumo, aunque la calidad de salida depende del nivel de cuantización elegido.

La relevancia actual radica en que combina un modelo base popular (Mistral Small 24B) con una modificación que reduce la censura, una demanda recurrente en la comunidad open source. Sin embargo, no se han publicado benchmarks específicos para esta versión cuantizada, por lo que su rendimiento debe evaluarse mediante pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (tipo Mistral) |
| Parametros totales | 23 572 403 200 (23,57 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Mistral Small 24B soporta 32 768 tokens, pero no se confirma en esta variante) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Inglés (según metadatos: `language: en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base ApolloRaines/Mistral-Small-24B-Instruct-Jbliterated se construye a partir del Mistral Small 24B Instruct (también conocido como Mistral Small 3, lanzado en enero de 2025). Mistral Small 24B emplea una arquitectura transformer decoder-only con atención por consultas agrupadas (GQA) y un contexto de 32 768 tokens, aunque estos detalles no están especificados en la documentación de esta variante concreta. La técnica *jbliterated* (una forma de abliteration) modifica los pesos del modelo original para reducir la probabilidad de que el modelo emita respuestas de rechazo o censura, sin reentrenar el modelo desde cero.

La cuantización GGUF realizada por mradermacher convierte los pesos originales (probablemente en formato safetensors) al formato GGUF de llama.cpp, utilizando herramientas estándar como `llama.cpp` o `convert_hf_to_gguf.py`. No se dispone de información sobre el dataset de entrenamiento del modelo base ni sobre el proceso de ajuste fino (RLHF, DPO, etc.) aplicado por Mistral AI. El repositorio no incluye detalles sobre el proceso de cuantización (por ejemplo, si se usó imatrix o calibración), aunque se menciona que existen versiones con imatrix en un repositorio hermano.

## Capacidades

- Generación de texto conversacional: al ser un modelo instruct, está optimizado para mantener diálogos multi-turno y responder a instrucciones.
- Razonamiento y conocimiento general: hereda las capacidades del Mistral Small 24B, que muestra buen rendimiento en tareas de razonamiento y conocimiento factual (según evaluaciones públicas del modelo original).
- Soporte de function calling: el Mistral Small 24B original incluye soporte para llamadas a funciones, lo que permite integrarlo en agentes y herramientas. Esta capacidad debería mantenerse en la versión jbliterated, aunque no se verifica en la documentación.
- Multilingüismo: el modelo base es principalmente inglés, aunque puede generar texto en otros idiomas con menor calidad. La ficha indica solo `en`.
- Ausencia de censura: la modificación jbliterated busca reducir los rechazos a contenido controvertido, lo que puede resultar útil en escenarios donde se requiere libertad de expresión, pero también implica riesgos (ver limitaciones).
- Despliegue local: gracias al formato GGUF, puede ejecutarse en CPU y GPU mediante llama.cpp, Ollama, LM Studio y otros motores compatibles.

## Casos de uso

- Chatbots locales sin censura: un desarrollador puede desplegar este modelo en un servidor propio o en un ordenador personal para crear un asistente conversacional que no rechace preguntas sobre temas sensibles. La cuantización Q4_K_M (14,4 GB) es un buen equilibrio entre calidad y requisitos de memoria.
- Generación de texto creativo: para escribir relatos, guiones o contenido literario que aborde temas tabú o controvertidos, donde un modelo con filtros restrictivos sería inadecuado. El formato GGUF permite ejecutarlo en una GPU de gama media (por ejemplo, RTX 3060 12 GB con cuantización Q4_K_S).
- Investigación sobre alineación y seguridad: la versión jbliterated sirve como objeto de estudio para comparar el comportamiento de un modelo con y sin direcciones de rechazo. Los investigadores pueden utilizar los archivos GGUF para reproducir experimentos sin necesidad de acceder a los pesos originales.
- Desarrollo de agentes con function calling: gracias al soporte de herramientas (heredado del Mistral Small 24B), se puede integrar en pipelines de automatización donde el modelo debe llamar a APIs o ejecutar acciones. La cuantización Q5_K_M (16,9 GB) ofrece buena fidelidad para tareas de razonamiento multi-paso.
- Prototipado rápido en entornos sin GPU: las cuantizaciones más pequeñas (Q2_K, 9 GB) permiten ejecutar el modelo en CPU con suficiente RAM, lo que facilita pruebas iniciales en portátiles o servidores sin aceleración dedicada.
- Servicio de inferencia autoalojado: con motores como vLLM o llama.cpp, se puede montar un endpoint compatible con OpenAI para ofrecer un servicio de chat interno. La cuantización Q8_0 (25,2 GB) conserva casi toda la calidad del modelo original, recomendable para entornos de producción con GPU de 32 GB o más.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de HuggingFace no incluye tablas de evaluación ni comparativas con el modelo original. Se recomienda consultar los benchmarks del Mistral Small 24B Instruct original (por ejemplo, MMLU, HumanEval, GSM8K) y tener en cuenta que la cuantización y la modificación jbliterated pueden alterar ligeramente esos resultados. Para una evaluación fiable, es necesario ejecutar pruebas propias con las cuantizaciones concretas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: depende de la cuantización. El tamaño del archivo GGUF da una referencia mínima:
  - Q2_K (9,0 GB): requiere al menos 10-11 GB de VRAM (o RAM si se usa CPU).
  - Q4_K_S (13,6 GB): recomendable GPU con 14-16 GB VRAM.
  - Q4_K_M (14,4 GB): GPU con 16 GB VRAM (por ejemplo, RTX 4080, RTX 4090, A10G).
  - Q5_K_M (16,9 GB): GPU con 18-20 GB VRAM (RTX 4090, A100 40 GB, etc.).
  - Q6_K (19,4 GB): GPU con 20-24 GB VRAM.
  - Q8_0 (25,2 GB): GPU con 28-32 GB VRAM (A100, H100, RTX 6000 Ada).
- **GPU recomendadas**: para cuantizaciones hasta Q4_K_M, una RTX 3090 o RTX 4090 (24 GB) es suficiente. Para Q5_K_M o superior, se necesitan GPUs profesionales (A100, H100) o configuraciones multi-GPU.
- **Compatibilidad con GPU de consumo**: sí, las cuantizaciones Q2_K a Q4_K_M caben en GPUs de 12-16 GB (RTX 3060, RTX 4070 Ti Super, etc.), aunque con menor velocidad.
- **Opciones de despliegue**: llama.cpp (incluido en Ollama, LM Studio), vLLM (con soporte GGUF reciente), TGI (a través de conversión), o directamente con `llama-cpp-python`.
- **Latencia y throughput**: no hay datos publicados para este modelo. En general, un modelo de 24B cuantizado a Q4_K_M en una RTX 4090 puede generar entre 20 y 40 tokens por segundo, pero depende del tamaño de contexto y del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mistral-Small-24B-Instruct-Jbliterated-GGUF (este) | 23,57 B | No disponible (base: 32k) | Apache-2.0 | GGUF | Cuantización con modificación jbliterated |
| Mistral-Small-24B-Instruct-2501 (original) | 23,57 B | 32 768 | Apache-2.0 | safetensors | Modelo base sin modificar |
| Mistral-Small-24B-Instruct-2501-abliterated-GGUF | 23,57 B | No disponible | Apache-2.0 | GGUF | Variante abliterated (similar, pero técnica distinta) |
| Llama-3.1-8B-Instruct (para comparar tamaño) | 8,03 B | 128 000 | Llama 3.1 | safetensors/GGUF | Menor tamaño, contexto mayor, licencia restrictiva |

La comparativa se basa en parámetros y licencia. No hay datos de rendimiento disponibles para la versión jbliterated, por lo que no es posible comparar en términos de benchmarks.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser una modificación de un modelo instruct, puede presentar sesgos presentes en los datos de entrenamiento originales. La eliminación de la censura no elimina los sesgos subyacentes y puede aumentar el riesgo de generar contenido ofensivo, inexacto o dañino.
- **Riesgo de contenido inapropiado**: la técnica jbliterated reduce las barreras de rechazo, lo que puede llevar a que el modelo genere respuestas sobre temas delicados (violencia, sexualidad, etc.) sin control. Esto requiere supervisión humana en aplicaciones públicas.
- **Calidad tras la cuantización**: las cuantizaciones más agresivas (Q2_K, Q3_K_S) pueden degradar notablemente la coherencia y el razonamiento. Se recomienda usar al menos Q4_K_M para tareas serias.
- **Limitaciones de idioma**: el modelo está entrenado principalmente en inglés. El rendimiento en español u otros idiomas será inferior y puede producir errores gramaticales o semánticos.
- **Contexto no confirmado**: no se especifica la longitud de contexto en esta variante. Si el modelo base mantiene 32k, la memoria KV cache puede ser elevada; es necesario verificar en la práctica.
- **Licencia Apache-2.0**: permite uso comercial y modificación, pero se debe incluir el aviso de licencia y atribución. No hay restricciones adicionales conocidas.
- **Falta de soporte oficial**: este es un modelo cuantizado por un tercero (mradermacher), no un lanzamiento oficial de Mistral AI. No hay garantía de mantenimiento ni actualizaciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Mistral-Small-24B-Instruct-Jbliterated-GGUF
- Modelo base (ApolloRaines/Mistral-Small-24B-Instruct-Jbliterated): https://huggingface.co/ApolloRaines/Mistral-Small-24B-Instruct-Jbliterated
- Modelo original Mistral Small 24B (Mistral AI): https://huggingface.co/mistralai/Mistral-Small-24B-Instruct-2501
- Repositorio con quants imatrix (mradermacher): https://huggingface.co/mradermacher/Mistral-Small-24B-Instruct-Jbliterated-i1-GGUF
- Página de información de mradermacher sobre modelos: https://hf.tst.eu/model#Mistral-Small-24B-Instruct-Jbliterated-GGUF
