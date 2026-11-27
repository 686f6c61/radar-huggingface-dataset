# mradermacher/ATUAX-1-27B-GGUF

## Resumen

ATUAX-1-27B es un modelo de lenguaje de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) desarrollado por el usuario atuax, orientado a tareas de gobernanza de IA, moderación de contenido y seguridad (guard). La model card lo etiqueta explícitamente con los tags `ai-governance`, `guard` y `safety`, y lo vincula a la familia Qwen (tag `qwen3.6`), lo que sugiere una base derivada de un modelo Qwen de tercera generación, aunque el autor no documenta formalmente la arquitectura en la información disponible.

La ficha que nos ocupa corresponde a la versión cuantizada en GGUF publicada por mradermacher, un conocido distribuidor de cuantizaciones estáticas para llama.cpp. El repositorio incluye 12 cuantizaciones que van desde Q2_K (11,3 GB) hasta Q8_0 (29,1 GB), además de dos ficheros `mmproj` (Q8_0 y f16) que indican soporte multimodal, presumiblemente visión. El modelo base está publicado en `atuax/ATUAX-1-27B` bajo licencia Apache 2.0.

El modelo declara soporte para coreano e inglés (`ko`, `en`) y fue entrenado o ajustado con el dataset `nlpai-lab/kullm-v2`, un corpus conversacional en coreano. Su relevancia actual reside en la combinación de un tamaño medio-grande (27B), licencia permisiva para uso comercial y un enfoque específico en seguridad y gobernanza, un nicho con pocas opciones abiertas de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card solo indica el tag `qwen3.6`, sin detallar la arquitectura) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye presumiblemente en safetensors via transformers |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. El tag `qwen3.6` sugiere que el modelo base deriva de la familia Qwen 3, lo que implicaría una arquitectura transformer densa con atención estándar, pero el autor no confirma este extremo ni detalla si incorpora innovaciones como atención lineal, decodificación especulativa o mezcla de expertos. El número de parámetros (27,3 B) es consistente con un transformer denso de tamaño medio-grande.

Respecto al entrenamiento, la model card únicamente referencia el dataset `nlpai-lab/kullm-v2`, un corpus conversacional en coreano ampliamente utilizado para ajuste instructivo en ese idioma. No se especifica el número de tokens de entrenamiento, la composición completa del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado más allá de lo que implica el uso de un dataset conversacional. Tampoco se documentan procesos de alineación específicos para las capacidades de seguridad y gobernanza que anuncian los tags.

## Capacidades

- Generación de texto conversacional en coreano e inglés, según los idiomas declarados.
- Capacidades de moderación y seguridad: los tags `guard`, `safety` y `ai-governance` indican un ajuste orientado a la detección de contenido dañino, cumplimiento normativo y gobernanza de IA.
- Soporte multimodal: la presencia de ficheros `mmproj` en el repositorio GGUF implica capacidad de procesamiento de imágenes (visión), aunque no se detalla su alcance.
- Conversación multi-turno: el tag `conversational` y el uso del dataset kullm-v2 apuntan a un modelo ajustado para diálogo.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Moderación de contenido en plataformas: el modelo puede clasificar y filtrar textos generados por usuarios o por otros modelos, aprovechando su ajuste específico en seguridad y gobernanza para reducir falsos negativos en políticas de contenido.
- Cumplimiento normativo de IA: integrado en pipelines de auditoría para revisar salidas de modelos generativos contra políticas internas o marcos regulatorios, gracias a su orientación explícita a `ai-governance`.
- Asistentes conversacionales en coreano: atención al cliente o asistentes virtuales para el mercado surcoreano, aprovechando el ajuste con kullm-v2 y el soporte nativo del idioma.
- Filtrado de prompts y jailbreaks: como capa previa (guard) en arquitecturas de defensa en profundidad, evaluando la intención de las entradas antes de enviarlas a un modelo generativo principal.
- Análisis de documentos con imágenes: gracias a los ficheros `mmproj`, puede procesar capturas, formularios o documentos escaneados en flujos de revisión de contenido.
- Investigación en alineación y seguridad: como modelo de referencia de 27B con licencia Apache 2.0 para experimentos de red teaming, evaluación de sesgos y comparación de técnicas de mitigación.
- Despliegue en infraestructura propia: las cuantizaciones GGUF permiten ejecutar el modelo en servidores con GPU de consumo o en CPU, útil para organizaciones que no pueden enviar datos a APIs externas por motivos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~11,3 GB de pesos; con overhead de contexto, ~13-14 GB.
  - Q4_K_M: ~17,1 GB de pesos; con overhead, ~19-21 GB.
  - Q5_K_M: ~19,7 GB de pesos; con overhead, ~22-24 GB.
  - Q8_0: ~29,1 GB de pesos; con overhead, ~31-33 GB.
  - Los ficheros `mmproj` añaden entre 0,7 y 1,0 GB si se usa la capacidad multimodal.
- GPU recomendadas: para Q4_K_M o Q5_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente. Para Q8_0 se recomienda A100 40 GB, H100 o dos GPU de 24 GB. Para Q2_K/Q3_K, una RTX 4080 (16 GB) o RTX 4060 Ti (16 GB) puede bastar.
- Cabe en GPU de consumo: sí, en configuraciones de 16-24 GB de VRAM con cuantizaciones Q2 a Q5. Las cuantizaciones Q6_K y Q8_0 requieren 24 GB o más.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, text-generation-webui y servidores compatibles con la API de OpenAI (el tag `endpoints_compatible` lo indica). vLLM y TGI requerirían los pesos originales en safetensors, no las cuantizaciones GGUF.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Enfoque |
|---|---|---|---|---|---|
| ATUAX-1-27B | 27,3 B | no disponible | Apache 2.0 | ko, en | Seguridad y gobernanza de IA |
| Qwen2.5-32B | 32,5 B | 128K (tipico en la familia Qwen2.5) | Apache 2.0 (variantes) | multilingue | Proposito general |
| Gemma 2 27B | 27 B | 8K | Gemma license | multilingue | Proposito general |
| Llama Guard 3 (8B/11B) | 8 B / 11 B | 128K | Llama license | multilingue | Moderacion de contenido |

La comparativa se ofrece como referencia de categoría; no se dispone de datos de rendimiento del modelo ATUAX-1-27B que permitan una comparación cuantitativa. Frente a Llama Guard 3, el modelo de atuax es notablemente mayor (27B frente a 8-11B) y usa licencia Apache 2.0 en lugar de la Llama Community License, lo que facilita su uso comercial sin restricciones de escala. Frente a Qwen2.5-32B y Gemma 2 27B, comparte tamaño pero se especializa en seguridad en lugar de propósito general.

## Limitaciones y advertencias

- La documentación del modelo es muy escasa: no se detallan arquitectura, contexto, datos de entrenamiento ni procesos de alineación, lo que dificulta evaluar su fiabilidad en producción.
- Riesgo de alucinación no cuantificado: al no publicarse benchmarks, no hay evidencia empírica sobre su tasa de errores factuales.
- Cobertura lingüística limitada a coreano e inglés; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- El ajuste en seguridad puede producir falsos positivos (bloqueo de contenido legítimo) o falsos negativos (evasión de filtros), un riesgo inherente a los modelos guard.
- Aunque la licencia es Apache 2.0, conviene verificar que el modelo base Qwen subyacente no imponga restricciones adicionales; la model card no aclara la cadena de licencias completa.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Las cuantizaciones son estáticas: el autor indica que no hay cuantizaciones con imatrix (weighted), lo que puede suponer una pérdida de calidad algo mayor en bitrates bajos (Q2_K, Q3_K_S).
- El tag `qwen3.6` no corresponde a una versión oficial conocida de Qwen; podría tratarse de una etiqueta personalizada del autor, por lo que la base real del modelo no está confirmada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ATUAX-1-27B-GGUF
- Modelo base: https://huggingface.co/atuax/ATUAX-1-27B
- Página de descargas del cuantizador: https://hf.tst.eu/model#ATUAX-1-27B-GGUF
- Dataset de ajuste: https://huggingface.co/datasets/nlpai-lab/kullm-v2
- Preguntas frecuentes del cuantizador: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
