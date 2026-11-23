# mradermacher/Qwen3.5-9B-Holodeck-Fara-GGUF

## Resumen

Qwen3.5-9B-Holodeck-Fara-GGUF es la versión cuantizada en formato GGUF del modelo nightmedia/Qwen3.5-9B-Holodeck-Fara, un ajuste fino orientado a escritura creativa, narrativa de ficción y roleplaying construido sobre una base de la familia Qwen3.5. El modelo original ha sido sometido a un proceso de abliteration y fine-tuning (etiquetado como "heretic" y "uncensored" por el autor), lo que elimina parte de las restricciones de alineamiento habituales para favorecer la generación de prosa vívida y contenido sin filtros en contextos creativos. La cuantización la firma mradermacher, un actor consolidado en la distribución de GGUF para inferencia local.

El modelo cuenta con 8.953.803.264 parámetros (aproximadamente 9 mil millones), pesos en bfloat16 en su versión original y una licencia Apache 2.0 que permite uso comercial. El repositorio GGUF ocupa 83 GB e incluye un conjunto completo de cuantizaciones estáticas (desde Q2_K hasta f16) más dos ficheros mmproj que sugieren soporte multimodal en el modelo base. Los idiomas declarados son inglés y chino.

Su relevancia actual reside en la combinación de tres factores: un tamaño de 9B que cabe en GPU de consumo con cuantizaciones Q4/Q5, una especialización clara en escritura creativa y roleplaying, y la ausencia de filtros de contenido (uncensored/abliterated) que muchos autores creativos buscan para narrativa adulta o temas sensibles. Es, por tanto, una opción para despliegue local de asistentes narrativos y generación de ficción, no para tareas de razonamiento técnico o agentes de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen3.5, transformer; detalles no publicados en la información disponible) |
| Parámetros totales | 8.953.803.264 (~9B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (original en bfloat16, safetensors) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su pertenencia a la familia Qwen3.5 y de los tags del repositorio, que mencionan bfloat16, mxfp8, mergekit y mlx. La presencia de etiquetas como "merge" y "mergekit" sugiere que el modelo original podría haberse construido mediante fusión de modelos, aunque no se especifica la composición ni la metodología exacta. Tampoco se publican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

Lo que sí se documenta es el proceso de especialización: fine-tuning sobre la base Qwen3.5-9B con orientación a escritura creativa, ficción, generación de tramas y subtramas, continuación de escenas y roleplaying, junto con un proceso de abliteration que reduce los rechazos del modelo ante contenido sensible. El autor etiqueta el resultado como "uncensored" y "heretic". No hay información sobre innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto narrativo y prosa vívida orientada a ficción.
- Escritura creativa en múltiples géneros: ciencia ficción, romance y, según los tags, "all genres".
- Generación de tramas y subtramas para relatos y novelas.
- Continuación de escenas y diálogos en contextos de storytelling.
- Roleplaying conversacional, con soporte para personajes y escenarios.
- Capacidad multimodal potencial: la presencia de ficheros mmproj en el repositorio apunta a soporte de visión en el modelo base, aunque no se detalla su alcance.
- Multilingüe limitado a inglés y chino según la model card.
- Comportamiento "uncensored": menor tasa de rechazos ante peticiones creativas con contenido sensible o adulto.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso orientado a agentes.

## Casos de uso

- Generación de novelas y relatos por entregas: el modelo está afinado específicamente para mantener coherencia narrativa y prosa vívida, lo que lo hace adecuado para borradores extensos de ficción con continuidad de personajes y trama.
- Roleplaying y juegos de texto: su especialización en conversación multi-turno con personajes permite usarlo como motor de un juego narrativo local, sin depender de APIs externas y sin filtros que interrumpan la inmersión.
- Continuación de escenas en herramientas de escritura: integrado en un editor mediante llama.cpp u Ollama, puede sugerir continuaciones de un fragmento existente respetando el tono y el estilo del autor.
- Generación de tramas y subtramas para guionistas: útil como generador de ideas estructuradas (arcos argumentales, giros, conflictos secundarios) en fases de preproducción.
- Asistencia a escritores de ficción adulta o temas sensibles: al ser un modelo abliterated, evita los rechazos que otros modelos alineados producen ante narrativa violenta, romántica explícita o temas controvertidos.
- Despliegue local en estaciones de trabajo para escritura privada: con cuantizaciones Q4_K_M (~5,7 GB) puede ejecutarse en una GPU de consumo, lo que permite mantener manuscritos inéditos sin enviarlos a servicios en la nube.
- Prototipado de chatbots de personaje: para demos y proyectos personales de asistentes con personalidad definida, aprovechando la licencia Apache 2.0 para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~3,9 GB; Q3_K_M ~4,7 GB; IQ4_XS ~5,3 GB; Q4_K_M ~5,7 GB; Q5_K_M ~6,6 GB; Q6_K ~7,5 GB; Q8_0 ~9,6 GB; f16 ~18 GB. Añadir aproximadamente 1 GB adicional para el contexto y el fichero mmproj si se usa el modo multimodal.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4 a Q8; A100 o H100 no son necesarias para este tamaño, pero permiten f16 con holgura y mayor throughput.
- Cabe en GPU de consumo: sí, desde una RTX 3060 12 GB con Q4_K_M o Q5_K_M; en GPUs de 8 GB conviene bajar a Q3_K_M o IQ4_XS.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; el tag endpoints_compatible sugiere compatibilidad con endpoints tipo OpenAI a través de servidores de inferencia.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-9B-Holodeck-Fara (este) | ~9B | no disponible | Escritura creativa, roleplaying, uncensored | Apache 2.0 | GGUF, safetensors |
| Qwen3.5-9B (base) | ~9B | no disponible | Uso general | no disponible en la información | safetensors, GGUF |
| nightmedia/Qwen3.5-9B-Holodeck-Fara | ~9B | no disponible | Escritura creativa (original sin cuantizar) | Apache 2.0 | safetensors |
| Versión i1-GGUF de mradermacher | ~9B | no disponible | Igual, con cuantizaciones imatrix | Apache 2.0 | GGUF |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo abliterated y uncensored: no incorpora los filtros de seguridad habituales, por lo que puede generar contenido violento, sexual o controvertido; no es adecuado para aplicaciones orientadas a público general sin moderación adicional.
- Riesgo de alucinación: como todo modelo de lenguaje de 9B, puede inventar hechos, nombres y detalles, especialmente en contextos narrativos largos.
- Idiomas limitados a inglés y chino según la model card; el rendimiento en castellano no está garantizado ni documentado.
- Longitud de contexto no disponible: no se puede planificar el uso en documentos largos sin verificarla empíricamente.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad de la prosa; para escritura creativa se recomienda Q5_K_M o superior.
- El proceso de merge y fine-tuning no está documentado en detalle, lo que dificulta evaluar la procedencia exacta de los datos de entrenamiento y posibles sesgos heredados.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3.5 antes de un despliegue comercial.
- El repositorio tiene muy poca tracción (456 descargas, 1 like), por lo que no hay retroalimentación de la comunidad sobre su calidad real.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-9B-Holodeck-Fara-GGUF
- Modelo original: https://huggingface.co/nightmedia/Qwen3.5-9B-Holodeck-Fara
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.5-9B-Holodeck-Fara-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.5-9B-Holodeck-Fara-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
