# mradermacher/AgentMercury-Qwen3.5-35B-A3B-SAO-GGUF

## Resumen

AgentMercury-Qwen3.5-35B-A3B-SAO es un modelo de lenguaje de tipo Mixture of Experts (MoE) derivado de la familia Qwen3.5, ajustado específicamente para tareas de agente, uso de herramientas (tool use) y protocolos MCP (Model Context Protocol). El desarrollo del modelo base corresponde a Minbyul, mientras que esta ficha corresponde a la versión cuantizada en formato GGUF publicada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y derivados.

El modelo parte de una arquitectura MoE con aproximadamente 34.660 millones de parámetros totales y, según la nomenclatura "A3B", alrededor de 3.000 millones de parámetros activos por token. Esa relación entre parámetros totales y activos es la que hace viable su despliegue en entornos locales: el coste computacional por token se aproxima al de un modelo denso de 3B, mientras que la capacidad representacional se acerca a la de un modelo de 35B.

La relevancia de esta ficha reside en que combina tres elementos poco habituales en el ecosistema abierto: un ajuste orientado a agentes con aprendizaje por refuerzo (actor-critic, SAO), soporte declarado para MCP y tool calling, y una licencia Apache 2.0 que permite uso comercial sin restricciones adicionales. La versión GGUF facilita la experimentación en local sin necesidad de GPUs de datacenter.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Qwen3.5, transformer |
| Parámetros totales | 34.660.610.688 (≈34,66B) |
| Parámetros activos | ≈3B (según nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj Q8_0 y f16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |
| Pipeline | reinforcement-learning |
| Tamaño del repositorio | 237,1 GB |
| Descargas | 184 |
| Fecha de creación | 2026-08-20 |
| Última actualización | 2026-10-07 |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture of Experts, heredada de Qwen3.5, con 34,66B parámetros totales y aproximadamente 3B activos por token. La nomenclatura "A3B" confirma el diseño de expertos dispersos: en cada paso de inferencia solo se activa una fracción de los parámetros, lo que reduce el coste de cómputo y memoria de activaciones respecto a un modelo denso del mismo tamaño total.

El ajuste específico (etiqueta "SAO") se orienta a agentes mediante aprendizaje por refuerzo con esquema actor-critic. Las etiquetas del repositorio indican entrenamiento para tool use, MCP y flujos de agente multi-paso. No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de SFT, RLHF o DPO adicionales. Tampoco se documentan innovaciones técnicas concretas como decodificación especulativa o atención lineal. Esta ficha corresponde exclusivamente a la conversión a GGUF realizada por mradermacher, que no modifica los pesos más allá de la cuantización.

## Capacidades

- Generación de texto conversacional en inglés.
- Uso de herramientas (tool calling / function calling), según las etiquetas del modelo.
- Soporte del protocolo MCP (Model Context Protocol) para integración con servidores de herramientas.
- Comportamiento orientado a agentes: razonamiento multi-paso y ejecución de tareas encadenadas.
- Capacidades multimodales parciales: el repositorio incluye archivos mmproj (Q8_0 y f16), lo que sugiere soporte de entrada visual en el modelo base, aunque no se detalla el alcance.
- Ajuste mediante aprendizaje por refuerzo (actor-critic) para mejorar la toma de decisiones en entornos de agente.
- No se documentan capacidades específicas de matemáticas avanzadas, código de producción ni modo "thinking" explícito en la información disponible.

## Casos de uso

- Automatización de agentes con herramientas: el modelo puede orquestar llamadas a APIs externas mediante tool calling y MCP, adecuado para asistentes que consultan bases de datos, servicios web o sistemas internos en varios pasos.
- Integración en pipelines de CI/CD: al soportar function calling, puede invocarse como componente de decisión en flujos automatizados que requieren interpretar resultados de herramientas y decidir la siguiente acción.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M (21,3 GB) y Q5_K_M (24,8 GB) permiten ejecutar el modelo en GPUs de consumo de 24 GB de VRAM, lo que facilita prototipado sin coste de API.
- Evaluación de investigación en RL para agentes: al estar entrenado con actor-critic y etiquetado como reinforcement-learning, sirve como base para experimentos de ajuste fino en tareas de agente.
- Asistentes conversacionales técnicos en inglés: con licencia Apache 2.0, puede integrarse en productos comerciales sin obligaciones de atribución adicionales más allá de las de la licencia.
- Entornos con requisitos de privacidad: al ejecutarse en local mediante llama.cpp u Ollama, los datos no salen de la infraestructura del usuario, útil para sectores regulados.
- Pruebas de concepto de MCP: permite validar servidores MCP y flujos de herramientas antes de migrar a modelos mayores o propietarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización (tamaño de archivo, más overhead de contexto y KV cache):
  - Q2_K: 13,0 GB
  - Q3_K_S: 15,3 GB
  - Q3_K_M: 16,9 GB
  - Q3_K_L: 18,2 GB
  - IQ4_XS: 19,0 GB
  - Q4_K_S: 20,0 GB
  - Q4_K_M: 21,3 GB
  - Q5_K_S: 24,1 GB
  - Q5_K_M: 24,8 GB
  - Q6_K: 28,6 GB
  - Q8_0: 37,0 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB o H100 para Q6_K y Q8_0 con contexto amplio; RTX 3090 (24 GB) válida para cuantizaciones Q4 y Q5.
- Cabe en GPU de consumo: sí, en modelos con 24 GB de VRAM usando Q4_K_M o Q5_K_M; en GPUs de 16 GB solo con Q3_K_M o inferiores y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con endpoints (la etiqueta "endpoints_compatible" sugiere compatibilidad con APIs tipo OpenAI). Para el modelo base en safetensors, vLLM o TGI si el soporte de la arquitectura Qwen3.5 MoE está disponible.
- Latencia y throughput: no disponibles. Al tratarse de un MoE con ~3B activos, el throughput esperado por token es notablemente superior al de un denso de 35B, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| AgentMercury-Qwen3.5-35B-A3B-SAO (esta ficha) | 34,66B | ≈3B | no disponible | Apache 2.0 | GGUF / safetensors | Ajuste para agentes, tool use y MCP |
| Qwen3.5-35B-A3B (base de la familia) | ≈35B | ≈3B | no disponible | según release de Qwen | safetensors / GGUF | Modelo generalista sin ajuste específico de agente |
| Modelos MoE de ~30B con ~3B activos de otras familias | ≈30B | ≈3B | variable | variable | variable | Alternativas de la misma categoría de eficiencia; datos concretos no disponibles en esta ficha |

No se dispone de resultados de benchmarks comparativos en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Idioma: el modelo declara únicamente inglés; el rendimiento en castellano no está garantizado ni documentado.
- Contexto: no se especifica la longitud máxima de contexto, lo que impide planificar despliegues con ventanas largas sin validación empírica.
- Alucinación: no se han publicado evaluaciones de fidelidad; en tareas de agente, una llamada a herramienta inventada puede provocar fallos en cascada.
- Benchmarks ausentes: sin datos de MMLU, HumanEval, GSM8K ni evaluaciones de tool use, la comparación con alternativas es especulativa.
- Cuantizaciones agresivas: Q2_K y Q3_K_M degradan la calidad de forma notable según las notas del propio autor; para producción se recomienda Q4_K_M o superior.
- Soporte multimodal incierto: la presencia de mmproj indica capacidad visual en el modelo base, pero no se documenta su alcance ni su calidad tras la cuantización.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original de Qwen3.5 y del ajuste de Minbyul por si añaden restricciones adicionales.
- Madurez: 184 descargas y 0 likes indican un modelo poco validado por la comunidad; no se recomienda para producción crítica sin evaluación propia.
- Repositorio grande (237,1 GB): requiere planificación de almacenamiento y ancho de banda para descargar todas las cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/AgentMercury-Qwen3.5-35B-A3B-SAO-GGUF
- Modelo base (ajuste de Minbyul): https://huggingface.co/Minbyul/AgentMercury-Qwen3.5-35B-A3B-SAO
- Cuantizaciones imatrix del mismo modelo: https://huggingface.co/mradermacher/AgentMercury-Qwen3.5-35B-A3B-SAO-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#AgentMercury-Qwen3.5-35B-A3B-SAO-GGUF
- Guía de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
