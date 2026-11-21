# mradermacher/spellspeak-glyph-2b-i1-GGUF

## Resumen

Spellspeak Glyph 2B es un modelo de lenguaje conversacional especializado en diálogos de personajes no jugadores (NPC), roleplay y agentes de voz, desarrollado originalmente por jptaylor y publicado con licencia Apache 2.0. La versión aquí descrita es una recuantización en formato GGUF realizada por mradermacher, orientada a su ejecución local mediante llama.cpp y otras herramientas compatibles. El modelo base está construido sobre la arquitectura Gemma 4 (según las etiquetas del repositorio), lo que sitúa su diseño en la familia de transformers densos de Google adaptados a tareas de conversación.

El interés de esta ficha radica en que ofrece un modelo pequeño (en torno a 2 000 millones de parámetros nominales, con 4 628 569 635 parámetros reales contabilizados en los safetensors del repositorio, cifra que probablemente incluye embeddings y cabezas de salida) empaquetado en múltiples cuantizaciones que van desde 2,4 GB hasta 3,9 GB, lo que permite desplegarlo en hardware de consumo. Está pensado para integrarse en videojuegos, asistentes conversacionales y pipelines de agentes de voz donde la latencia y el coste por token importan más que el razonamiento complejo.

La relevancia actual del modelo reside en su nicho: diálogo con personalidad consistente y bajo coste computacional. No obstante, la información pública disponible es escasa (la model card del repositorio GGUF se limita a listar cuantizaciones y no documenta entrenamiento, benchmarks ni idiomas), por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Gemma 4 (según etiquetas del repositorio; detalles no disponibles) |
| Parametros totales | 4 628 569 635 (según safetensors del repositorio); denominación comercial "2B" |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, Q2_K_S, Q2_K, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (cuantizaciones i1/imatrix) |
| Idiomas soportados | Inglés (etiqueta `en` en la model card); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base original en safetensors/transformers |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `gemma4`, que indica que el modelo base jptaylor/spellspeak-glyph-2b se construye sobre la familia Gemma 4 de Google. Se trata, por tanto, de un transformer denso con atención estándar (no se documenta atención lineal, SSM ni arquitecturas híbridas). El repositorio GGUF no incluye información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

La innovación técnica destacable de esta publicación concreta no está en el modelo sino en el proceso de cuantización: mradermacher ha generado cuantizaciones ponderadas con imatrix (matriz de importancia) para el modelo, lo que mejora la calidad de las cuantizaciones de baja precisión respecto a las estáticas. El repositorio incluye también el archivo imatrix (`spellspeak-glyph-2b.imatrix.gguf`, 0,1 GB) para que otros puedan generar sus propias cuantizaciones. Las etiquetas sugieren un enfoque de ajuste fino orientado a diálogo de NPC, roleplay y agentes de voz, aunque no se especifica la metodología.

## Capacidades

- Generación de texto conversacional con énfasis en diálogo de personajes (NPC) y roleplay.
- Mantenimiento de personalidad y estilo consistentes en conversaciones multi-turno (según el propósito declarado en las etiquetas).
- Orientado a agentes de voz y asistentes conversacionales de baja latencia.
- Capacidades multilingües: solo se declara inglés; el resto no disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el enfoque del modelo es conversacional, no de razonamiento.
- Capacidades de visión, audio o modo "thinking": no disponibles.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`) para despliegue como servicio.

## Casos de uso

- Diálogo de NPC en videojuegos: el modelo puede generar respuestas de personajes con personalidad consistente en tiempo real, y su tamaño reducido (2,4-3,9 GB en GGUF) permite ejecutarlo en la misma máquina que el juego o en un servidor local de bajas prestaciones.
- Agentes de voz para atención al cliente: al estar orientado a conversación y ser compatible con llama.cpp, puede integrarse en pipelines de voz a texto + LLM + texto a voz con latencia baja en GPUs de consumo.
- Prototipado de asistentes conversacionales: sirve para validar flujos de diálogo y prompts de sistema antes de migrar a modelos mayores, gracias a su licencia Apache 2.0 y a la variedad de cuantizaciones disponibles.
- Roleplay y entretenimiento interactivo: la etiqueta `roleplay` indica un ajuste específico para mantener personajes, útil en aplicaciones de ficción interactiva o chatbots temáticos.
- Despliegue en hardware embebido o de borde: las cuantizaciones IQ2/IQ3 (2,5-3,2 GB) permiten ejecución en dispositivos con poca memoria, como mini-PCs o GPUs integradas, para demos offline.
- Investigación en cuantización: el repositorio incluye imatrix y cuantizaciones i1, lo que lo convierte en un caso de estudio para evaluar la degradación de calidad en modelos conversacionales pequeños.
- Generación de diálogo en herramientas de modding: puede integrarse mediante llama.cpp en motores de juego o mods que expongan una API local de generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio GGUF no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones conversacionales, y tampoco se aportan comparaciones con el modelo base sin cuantizar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3,0 GB para cuantizaciones IQ2/Q2, 3,2-3,5 GB para IQ3/Q3, 3,5-3,7 GB para Q4/Q5 y 3,9 GB para Q6_K, más el overhead del contexto y de llama.cpp (típicamente 0,5-1 GB adicionales).
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradas. También funciona en GPUs integradas con memoria compartida suficiente.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs discretas modernas (GTX 1060 6 GB en adelante) e incluso en algunas integradas con 8 GB de RAM asignada.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (importando el GGUF), servidores compatibles con endpoints (etiqueta `endpoints_compatible`), y cualquier runtime que soporte GGUF. No se documenta soporte para vLLM o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles; al ser un modelo de ~2B en cuantización Q4, se espera decodificación interactiva en GPUs de consumo, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Spellspeak Glyph 2B (esta ficha) | ~2B nominales (4,63B en safetensors) | No disponible | Apache 2.0 | GGUF, safetensors | Especializado en diálogo de NPC y roleplay |
| Gemma 2 2B | 2,6B | 8K | Gemma License | safetensors, GGUF | Modelo generalista de Google; licencia no Apache |
| Qwen2.5 1.5B | 1,5B | 32K | Apache 2.0 | safetensors, GGUF | Generalista multilingüe con buen soporte de herramientas |
| Llama 3.2 1B | 1,2B | 128K | Llama 3.2 Community License | safetensors, GGUF | Generalista con contexto largo; licencia restrictiva |

La comparación con Gemma 2 2B, Qwen2.5 1.5B y Llama 3.2 1B es orientativa: no se dispone de benchmarks del modelo de esta ficha que permitan comparar rendimiento real. La ventaja diferencial de Spellspeak Glyph 2B es su especialización conversacional y su licencia Apache 2.0, frente a las licencias más restrictivas de Gemma y Llama.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un ajuste sobre Gemma 4 entrenado presumiblemente con datos conversacionales, puede heredar sesgos del modelo base y del corpus de roleplay.
- Riesgo de alucinación: alto en tareas factuales; el modelo está orientado a diálogo creativo, no a recuperación de hechos verificables.
- Limitaciones de contexto o idioma: solo se declara inglés; la longitud de contexto no está documentada, lo que impide planificar conversaciones largas con garantías.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero conviene verificar la licencia del modelo base original (jptaylor/spellspeak-glyph-2b) y de Gemma 4, ya que las licencias de los modelos derivados pueden arrastrar condiciones adicionales.
- Caveats para producción: la falta de benchmarks y de documentación de entrenamiento dificulta la evaluación de calidad; las cuantizaciones IQ1/IQ2 degradan notablemente la coherencia y solo deberían usarse en escenarios experimentales.
- El repositorio tiene 0 likes y la model card no documenta el proceso de ajuste, por lo que la trazabilidad del modelo es limitada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/spellspeak-glyph-2b-i1-GGUF
- Modelo base: https://huggingface.co/jptaylor/spellspeak-glyph-2b
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/spellspeak-glyph-2b-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#spellspeak-glyph-2b-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Grafo comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Ejemplo de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
