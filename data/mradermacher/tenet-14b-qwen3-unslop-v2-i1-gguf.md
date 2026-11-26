# mradermacher/Tenet-14B-Qwen3-Unslop-v2-i1-GGUF

## Resumen

Tenet-14B-Qwen3-Unslop-v2-i1-GGUF es la versión cuantizada en formato GGUF del modelo Tenet-14B-Qwen3-Unslop-v2, desarrollado originalmente por mr-andrey-isachenko y empaquetado por mradermacher. Se trata de un modelo de 14.768.307.200 parámetros (aproximadamente 14,8 mil millones) construido sobre la base de Qwen3, orientado a razonamiento (reasoning/thinking), uso de herramientas (tool-use), generación de código y flujos agénticos. El sufijo "Unslop" y las etiquetas "abliterated" y "uncensored" indican que se ha aplicado un proceso de reducción de respuestas evasivas y de eliminación de rechazos (abliteration), lo que lo aleja del comportamiento fuertemente alineado del modelo base.

El modelo original se distribuye en precisión completa con pesos safetensors y licencia Apache 2.0, y esta versión GGUF ofrece un conjunto amplio de cuantizaciones (desde IQ1_S de 3,7 GB hasta Q6_K de 12,2 GB) generadas con imatrix ponderada, lo que permite desplegarlo en hardware de consumo. Está pensado para desarrolladores que quieren ejecutar localmente un modelo de 14B con capacidades de razonamiento y agentes sin depender de infraestructura en la nube.

La relevancia actual radica en la combinación de tres factores: un tamaño de 14B manejable en GPU de consumo, una orientación explícita a flujos agénticos y tool calling, y un proceso de "unslop" que busca respuestas más directas y menos plantillas de rechazo. No obstante, la información pública disponible sobre el proceso de entrenamiento, los datos utilizados y los resultados de benchmarks es muy limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3; detalles específicos no disponibles) |
| Parámetros totales | 14.768.307.200 (≈14,8 B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (además de cuantizaciones estáticas en el repo hermano) |
| Idiomas soportados | Inglés (según el campo `language` de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que deriva de Qwen3, un transformer decoder-only. El modelo base Tenet-14B-Qwen3-Unslop-v2 ha sido sometido a un proceso de fine-tuning que las etiquetas describen como "unslop" (reducción de respuestas genéricas o evasivas) y "abliterated" (eliminación de direcciones de rechazo en el espacio de activaciones). Las etiquetas también mencionan GRPO, lo que sugiere que se empleó aprendizaje por refuerzo con Group Relative Policy Optimization en alguna fase del entrenamiento, aunque no se especifican los detalles del dataset, el número de tokens ni la composición de los datos.

Las cuantizaciones de esta versión se han generado con imatrix ponderada (weighted/imatrix quants), una técnica que calibra la cuantización con estadísticas de activaciones para preservar mejor la calidad en bits bajos. El repositorio incluye el fichero imatrix para que otros usuarios puedan generar sus propias cuantizaciones. No se dispone de información sobre innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento explícito con modo "thinking" (etiqueta `reasoning`/`thinking`).
- Generación de código (etiqueta `coding`).
- Tool calling y function calling (etiqueta `tool-use`).
- Flujos agénticos y razonamiento multi-paso (etiqueta `agentic`).
- Comportamiento "uncensored"/"abliterated": menor tendencia a rechazar peticiones.
- Compatible con endpoints (etiqueta `endpoints_compatible`) y con vLLM y OpenRouter según las etiquetas del modelo base.
- Capacidades multilingües limitadas: la model card solo declara inglés.
- No se ha documentado soporte de visión, audio ni otras modalidades.

## Casos de uso

- Asistente de código local: el modelo puede integrarse en un IDE o CLI para autocompletado, explicación y refactorización de código, aprovechando su especialización en `coding` y su tamaño de 14B, que cabe en una GPU de consumo con cuantización Q4_K_M (9,1 GB).
- Agente autónomo con tool calling: al soportar function calling y flujos multi-paso, puede conectarse a APIs externas (búsqueda, cálculo, bases de datos) en pipelines agénticos ejecutados en local con llama.cpp u Ollama.
- Razonamiento con cadena de pensamiento: útil para tareas de análisis, depuración lógica o resolución de problemas matemáticos donde se quiere inspeccionar el proceso de razonamiento del modelo.
- Prototipado de chatbots sin filtros: para investigación sobre alineación, evaluación de sesgos o experimentos que requieren respuestas directas sin rechazos, gracias a su naturaleza abliterated.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en GGUF sobre hardware propio, permite procesar datos sensibles sin enviarlos a servicios en la nube.
- Evaluación comparativa de cuantizaciones: el amplio abanico de quants (de IQ1_S a Q6_K) permite estudiar el compromiso calidad/tamaño en un modelo de 14B con imatrix, útil para investigación en compresión de modelos.
- Generación de documentación técnica y resúmenes en inglés dentro de pipelines de CI/CD, con la ventaja de no depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño del fichero GGUF más overhead de contexto):
  - i1-IQ1_S (3,7 GB): ~4-5 GB de VRAM.
  - i1-IQ2_M (5,4 GB): ~6-7 GB de VRAM.
  - i1-IQ3_M (7,0 GB): ~8-9 GB de VRAM.
  - i1-Q4_K_M (9,1 GB): ~10-11 GB de VRAM.
  - i1-Q5_K_M (10,6 GB): ~12 GB de VRAM.
  - i1-Q6_K (12,2 GB): ~13-14 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantizaciones Q4/Q5; RTX 4090 (24 GB) para Q6_K con contexto amplio; A100/H100 para despliegues de mayor concurrencia o precisión completa.
- Cabe en GPU de consumo: sí, desde una RTX 3060 12 GB (Q4_K_M) hasta una RTX 4090 (Q6_K). Las cuantizaciones IQ1/IQ2 permiten incluso GPUs de 6-8 GB con pérdida notable de calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runners compatibles con GGUF. Para el modelo base en safetensors, vLLM y TGI según las etiquetas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tenet-14B-Qwen3-Unslop-v2 (este) | 14,8 B | No disponible | Apache 2.0 | GGUF / safetensors | Abliterated, orientado a agentes y razonamiento |
| Qwen3-14B (base) | ~14 B | No disponible en esta ficha | Apache 2.0 | safetensors / GGUF | Modelo original de Alibaba, alineado y con rechazos |
| Alternativas de 14B abliterated | No disponible | No disponible | Variable | GGUF | No se dispone de datos verificables en la información proporcionada |

No se dispone de datos de rendimiento comparativos verificables en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La información sobre el proceso de entrenamiento, datos y benchmarks es muy escasa; no es posible validar afirmaciones de calidad con evidencia publicada.
- El proceso de abliteration y "unslop" reduce los rechazos, lo que implica mayor riesgo de generar contenido inapropiado, sesgado o dañino; requiere filtros y políticas de uso adicionales en producción.
- Riesgo de alucinación inherente a los modelos de 14B, especialmente en tareas factuales y con cuantizaciones agresivas (IQ1/IQ2).
- Soporte declarado únicamente en inglés; el rendimiento en castellano no está documentado y probablemente sea inferior.
- La longitud de contexto no está especificada en la información disponible; conviene verificarla en el modelo base antes de diseñar aplicaciones con contexto largo.
- Las cuantizaciones por debajo de Q3 pierden calidad de forma significativa según las propias notas del autor ("very low quality", "for the desperate").
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo abliterated puede conllevar riesgos reputacionales y de cumplimiento; se recomienda auditoría previa.
- El modelo tiene 0 likes y 774 descargas en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face (este GGUF): https://huggingface.co/mradermacher/Tenet-14B-Qwen3-Unslop-v2-i1-GGUF
- Modelo base: https://huggingface.co/mr-andrey-isachenko/Tenet-14B-Qwen3-Unslop-v2
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Tenet-14B-Qwen3-Unslop-v2-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Tenet-14B-Qwen3-Unslop-v2-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
