# mradermacher/Mellum2.1-12B-A2.5B-Thinking-abliterated-GGUF

## Resumen

Esta ficha cubre el repositorio GGUF de mradermacher del modelo Mellum2.1-12B-A2.5B-Thinking-abliterated, originalmente publicado por el usuario ttennant. Se trata de una cuantización estática en formato GGUF de un modelo de mezcla de expertos (MoE) con 12.149.923.072 parámetros totales, de los cuales aproximadamente 2,5 mil millones están activos por token (según indica la nomenclatura A2.5B). El sufijo "Thinking" sugiere que el modelo base incorpora capacidades de razonamiento extendido, y el término "abliterated" indica que se ha aplicado un proceso de eliminación de alineación de seguridad, produciendo un modelo sin restricciones de contenido.

La relevancia de este repositorio no está en el modelo en sí, sino en la disponibilidad del mismo en formato GGUF con once cuantizaciones distintas, desde Q2_K (5,1 GB) hasta Q8_0 (13,0 GB), lo que permite ejecutarlo en hardware muy variado, incluidas GPU de consumo. La combinación de arquitectura MoE con pocos parámetros activos y formato GGUF lo hace especialmente atractivo para inferencia local con alta velocidad de generación. El modelo está licenciado bajo Apache 2.0 y su idioma principal es el inglés.

Cabe destacar que el modelo base procede de un tercero (ttennant) y que la model card original no incluye información detallada sobre arquitectura, datos de entrenamiento, benchmarks ni capacidades específicas, por lo que varios apartados de esta ficha indican datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), no disponible el detalle exacto |
| Parametros totales | 12.149.923.072 (dato real de safetensors) |
| Parametros activos | ~2,5B (deducido de la nomenclatura A2.5B; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base está en safetensors |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos (MoE) con unos 12B de parámetros totales y, según la nomenclatura del repositorio, aproximadamente 2,5B de parámetros activos por token. Esta configuración permite obtener la capacidad representacional de un modelo de 12B con el coste computacional de uno de 2,5B, lo que se traduce en una inferencia significativamente más rápida que la de un modelo denso equivalente. No se ha publicado información sobre el número de expertos, el top-k de enrutamiento ni la técnica de attention empleada.

Sobre el entrenamiento no hay datos disponibles: no se conoce el número de tokens, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. El sufijo "Thinking" sugiere entrenamiento o ajuste para razonamiento extendido (estilo chain-of-thought), y el sufijo "abliterated" indica que se ha aplicado un procedimiento de eliminación de los mecanismos de rechazo del modelo alineado original, normalmente mediante técnicas de ablation sobre las direcciones de activación responsables de los rechazos. No existen detalles técnicos publicados sobre este proceso en la model card.

## Capacidades

- Generacion de texto conversacional en inglés (etiquetado como "conversational" en el repositorio).
- Razonamiento extendido (thinking mode), sugerido por la nomenclatura "Thinking" del modelo base, aunque sin documentación de plantilla de chat específica.
- Ejecución local en CPU y GPU gracias al formato GGUF, compatible con llama.cpp y derivados.
- Contenido sin restricciones de seguridad (abliterated/uncensored): el modelo no aplica rechazos de seguridad típicos de los modelos alineados.
- Tool calling, function calling y capacidades de agentes: no disponible (sin documentación).
- Capacidades multilingües: no disponibles; el modelo está etiquetado solo para inglés.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Chatbots locales sin censura para investigación: permite estudiar el comportamiento de modelos sin alineación en entornos controlados, útil para investigación en seguridad de modelos (red teaming, análisis de jailbreaks).
- Inferencia en GPU de consumo: con la cuantización Q4_K_M (8,2 GB) cabe en una RTX 4090 o incluso en GPUs de 8-12 GB de VRAM con cuantizaciones más agresivas, ideal para asistentes locales privados.
- Experimentación con arquitecturas MoE: el tamaño activo reducido (~2,5B) permite probar el comportamiento de modelos MoE en hardware modesto con alta velocidad de generación.
- Generación de texto creativo sin filtros: escritura de ficción o material que los modelos alineados suelen rechazar, bajo responsabilidad exclusiva del usuario.
- Prototipado de agentes locales: su bajo coste por token lo hace viable para bucles de razonamiento multi-paso en local, aunque el soporte de tool calling no está documentado y habría que verificarlo empíricamente.
- Evaluación comparativa de cuantizaciones: con once variantes de cuantización, es un buen banco de pruebas para medir la degradación de calidad entre Q2_K y Q8_0 en modelos MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del modelo base ni la del repositorio de cuantización incluyen métricas de MMLU, HumanEval, GSM8K u otras pruebas estandarizadas.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, sin contar KV cache):
  - Q2_K: ~5,1 GB
  - Q3_K_M: ~6,4 GB
  - IQ4_XS: ~6,8 GB
  - Q4_K_M: ~8,2 GB
  - Q5_K_M: ~9,3 GB
  - Q6_K: ~11,0 GB
  - Q8_0: ~13,0 GB
- GPU recomendadas: RTX 3060 12GB o superior para cuantizaciones medias; RTX 4090 (24 GB) para Q8_0 con margen para contexto. En CPU moderna con suficiente RAM (16 GB o más) también es viable dada la baja carga computacional del MoE.
- Cabe en GPU de consumo: sí, desde 6 GB de VRAM con Q2_K/Q3_K, recomendándose 8-12 GB para Q4_K_M.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp, y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa; para ellos habría que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles; al ser un MoE con ~2,5B de parámetros activos, se espera una generación rápida en comparación con modelos densos de 12B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mellum2.1-12B-A2.5B-Thinking-abliterated (GGUF) | ~12,1B | ~2,5B | no disponible | Apache 2.0 | GGUF público (mradermacher) |
| Qwen3-30B-A3B | 30,5B | 3,3B | 32k (128k con YaRN) | Apache 2.0 | safetensors y GGUF |
| OLMoE-1B-7B (AllenAI) | 6,9B | 1,3B | 4k | Apache 2.0 | safetensors y GGUF |
| Mixtral-8x7B-Instruct | 46,7B | 12,9B | 32k | Apache 2.0 | safetensors y GGUF |

Frente a Qwen3-30B-A3B, el modelo Mellum es más pequeño en parámetros totales y activos, con menor capacidad esperada pero requisitos de memoria mucho menores. Frente a OLMoE, ofrece más parámetros activos y, presumiblemente, mayor capacidad de razonamiento por su vertiente "Thinking". Su ventaja diferencial es la ausencia de filtros de seguridad (abliterated), algo que ninguna de las alternativas oficiales ofrece.

## Limitaciones y advertencias

- Ausencia de alineación de seguridad: al ser un modelo abliterated, no rechazará contenidos dañinos. Su uso para generar contenido ilegal o nocivo es responsabilidad del usuario y puede infringir la ley o los términos de servicio de las plataformas empleadas.
- Riesgo de alucinación: no evaluado; no hay benchmarks publicados que permitan estimar la fiabilidad factual del modelo.
- Idioma: el modelo está etiquetado solo para inglés; el rendimiento en castellano u otros idiomas es desconocido y probablemente inferior.
- Contexto: la longitud de ventana de contexto no está documentada; debe verificarse en la configuración del modelo base antes de planificar cargas de trabajo con documentos largos.
- Procedencia de terceros: el modelo base procede de un usuario individual (ttennant), sin organización respaldatoria; la procedencia de los datos de entrenamiento y la calidad del ajuste "Thinking" y del proceso de abliteration no están auditadas.
- Cuantizaciones bajas: Q2_K y Q3_K pueden degradar notablemente la calidad, especialmente en modelos MoE, donde las cuantizaciones agresivas afectan de forma desigual a los expertos.
- Licencia: Apache 2.0 permite uso comercial sin restricciones relevantes, aunque el modelo base abliterated hereda esa misma licencia según la model card.
- Soporte de herramientas: no documentado; el uso en pipelines de agentes requiere verificación empírica.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/mradermacher/Mellum2.1-12B-A2.5B-Thinking-abliterated-GGUF
- Modelo base: https://huggingface.co/ttennant/Mellum2.1-12B-A2.5B-Thinking-abliterated
- Cuantizaciones weighted/imatrix: https://huggingface.co/mradermacher/Mellum2.1-12B-A2.5B-Thinking-abliterated-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Mellum2.1-12B-A2.5B-Thinking-abliterated-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
