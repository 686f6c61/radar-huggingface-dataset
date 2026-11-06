# mradermacher/MachiNoDolphin-Qwen2.5-72b-i1-GGUF

## Resumen

MachiNoDolphin-Qwen2.5-72b-i1-GGUF es la colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo merge KaraKaraWarehouse/MachiNoDolphin-Qwen2.5-72b, que a su vez deriva de Qwen2.5-72B. El modelo base es un merge de tipo weight/imatrix realizado con mergekit, orientado a uso conversacional y con soporte declarado para trece idiomas (chino, inglés, francés, español, portugués, alemán, italiano, ruso, japonés, coreano, vietnamita, tailandés y árabe). Con 72.706.203.648 parámetros reales en safetensors, se trata de un transformer denso de escala 72B, no de una arquitectura MoE.

La relevancia de este repositorio es práctica: permite ejecutar un modelo de 72B en hardware de consumo o en servidores sin GPUs de gama alta mediante cuantización IQ (importancia matricial) generada con imatrix, que preserva mejor la calidad que las cuantizaciones estáticas equivalentes en tamaño. El repositorio ofrece un abanico que va desde 22,8 GB (i1-IQ1_S) hasta 64,4 GB (i1-Q6_K), lo que cubre desde configuraciones muy agresivas hasta cuantizaciones casi sin pérdida.

El modelo está pensado para inferencia local con llama.cpp y derivados (Ollama, LM Studio, koboldcpp), y no para despliegues de alto throughput en servidores con vLLM o TGI, donde convendría usar los pesos originales en safetensors. La licencia no está declarada en la información disponible, lo que supone una advertencia importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-72B), pesos fusionados con mergekit |
| Parametros totales | 72.706.203.648 (72,7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | zho, eng, fra, spa, por, deu, ita, rus, jpn, kor, vie, tha, ara |
| Licencia | No disponible |
| Formato de pesos | GGUF (multi-parte en Q5_K_S, Q5_K_M y Q6_K) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 72,7B parámetros, heredero directo de la familia Qwen2.5-72B. Sobre esa base, el autor original (KaraKaraWarehouse) aplicó una fusión de pesos con mergekit, técnica que combina los tensores de dos o más modelos afinados para producir un modelo híbrido sin entrenamiento adicional. La model card no documenta la receta exacta del merge (método, pesos por capa ni modelos de origen), por lo que no es posible detallar la composición del dataset ni si hubo fases de RLHF o DPO posteriores.

La aportación de este repositorio concreto es la cuantización con importancia matricial (imatrix) mediante la herramienta de mradermacher, que calcula estadísticas de activación sobre un corpus de calibración y las usa para asignar bits de forma no uniforme entre tensores. El resultado son los cuantos i1, que en tamaños equivalentes suelen superar a los cuantos estáticos Q*_K. La model card indica además que existen cuantos estáticos en un repositorio hermano (MachiNoDolphin-Qwen2.5-72b-GGUF) para quien prefiera esa vía.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a diálogo (tag `conversational`).
- Razonamiento general y respuesta a instrucciones heredado de Qwen2.5-72B.
- Generación de código y matemáticas: capacidad esperable por la base Qwen2.5, aunque no verificada con benchmarks en este repositorio.
- Soporte multilingüe declarado para trece idiomas, incluidos español, portugués, francés, alemán, italiano, ruso, japonés, coreano, chino, árabe, tailandés y vietnamita.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que permite servirlo tras una API compatible con OpenAI mediante llama.cpp server u Ollama.
- No se documenta soporte explícito de tool calling, function calling, modo thinking ni visión en la información disponible.

## Casos de uso

- Asistente conversacional local en español: el modelo declara soporte de `spa` y puede desplegarse con llama.cpp u Ollama en una estación de trabajo con 48-64 GB de VRAM o con descarga parcial a RAM, gestionando diálogos multi-turno sin depender de la nube.
- Traducción y localización multilingüe: al cubrir trece idiomas, resulta útil para pipelines de traducción entre combinaciones como español-japonés o inglés-árabe, con la ventaja de mantener los datos en infraestructura propia.
- Generación de documentación técnica: con la cuantización i1-Q4_K_M (47,5 GB) se obtiene un equilibrio razonable entre calidad y requisitos de memoria para redactar documentación, resúmenes y borradores en un servidor con una única GPU de 48 GB o dos de 24 GB.
- Prototipado de agentes conversacionales: el tag `endpoints_compatible` permite exponerlo como API compatible con OpenAI y conectarlo a frameworks de orquestación para pruebas de concepto sin coste por token.
- Análisis de textos largos en local: para equipos con 64 GB de memoria unificada (por ejemplo, Apple Silicon de gama alta) la variante i1-Q6_K (64,4 GB) ofrece prácticamente la calidad del modelo original para tareas de resumen y extracción de información.
- Investigación sobre cuantización: el repositorio sirve como banco de pruebas para comparar la degradación de calidad entre cuantos IQ1, IQ2, IQ3 e IQ4 sobre un mismo modelo base de 72B, útil en estudios de eficiencia de inferencia.
- Despliegue en entornos con requisitos de soberanía del dato: al ejecutarse íntegramente en hardware propio, encaja en organizaciones que no pueden enviar contenido a APIs externas, siempre que se aclare antes la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye una gráfica comparativa de perplejidad entre tipos de cuantización de baja calidad (enlace externo a nethype.de) y una referencia a las notas de Artefact2 sobre selección de cuantos, pero sin cifras de MMLU, HumanEval, GSM8K ni similares para este merge concreto.

## Requisitos de hardware

- VRAM estimada según cuantización (tamaño de archivo, más overhead de contexto y caché KV):
  - i1-IQ1_S: 22,8 GB; i1-IQ2_M: 29,4 GB; i1-Q3_K_M: 37,8 GB.
  - i1-IQ4_XS: 39,8 GB; i1-Q4_K_M: 47,5 GB; i1-Q5_K_M: 54,5 GB; i1-Q6_K: 64,4 GB.
- GPU recomendadas: A100 80 GB o H100 para las variantes Q5/Q6 con contexto amplio; A6000, L40S o RTX 6000 Ada (48 GB) para Q4_K_M; dos RTX 4090 de 24 GB en paralelo para Q3 y Q4 bajos.
- Cabe en GPU de consumo: sí, en configuraciones multi-GPU (2x RTX 4090 para IQ3/Q4) o en equipos con memoria unificada grande (Apple Silicon de 64-128 GB) para las variantes Q4 a Q6. Una única RTX 4090 de 24 GB solo admite las variantes IQ1/IQ2 con contexto reducido.
- Opciones de despliegue: llama.cpp (referencia para GGUF), Ollama, LM Studio, koboldcpp y llama.cpp server para exponer API compatible con OpenAI. No se recomienda vLLM ni TGI para estos ficheros, ya que están pensados para pesos safetensors.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia cualitativa, un 72B denso en Q4_K_M sobre una A100 80 GB suele quedar en el orden de decenas de tokens por segundo, pero no hay medición publicada para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MachiNoDolphin-Qwen2.5-72b-i1-GGUF (este) | 72,7B | No disponible | No disponible | GGUF i1 | Merge conversacional multilingüe con cuantos imatrix |
| Qwen2.5-72B-Instruct (original) | 72,7B | 131.072 tokens (según documentación de Qwen) | Apache 2.0 (según Qwen) | safetensors, GGUF | Base directa; licencia y contexto documentados |
| Llama 3.3 70B Instruct | 70B | 128.000 tokens | Llama 3.3 Community License | safetensors, GGUF | Alternativa de escala similar con ecosistema amplio |
| Mistral Large 2 | 123B | 128.000 tokens | Mistral Research/Commercial | safetensors | Mayor tamaño, requiere más VRAM |

La comparación con Qwen2.5-72B-Instruct es la más relevante: este merge hereda su arquitectura pero no su licencia declarada ni su contexto documentado, por lo que en producción conviene valorar el original si se necesita certeza legal y de ventana de contexto.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido. Es imprescindible contactar con el autor o consultar el modelo base antes de desplegarlo en producción.
- Longitud de contexto no documentada: aunque Qwen2.5-72B soporta ventanas amplias, este merge no especifica el contexto efectivo tras la fusión, y las cuantizaciones bajas pueden degradarlo aún más.
- Riesgo de alucinación: inherente a los modelos de 72B sin verificación factual; el merge con mergekit no garantiza mejoras en fidelidad.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad para este merge; los sesgos del modelo base pueden amplificarse o alterarse de forma impredecible tras la fusión de pesos.
- Degradación por cuantización: las variantes IQ1 e IQ2 (22-29 GB) están marcadas por el propio autor como "for the desperate" y "mostly desperate"; no son aptas para tareas que requieran precisión.
- Ficheros multi-parte: Q5_K_S, Q5_K_M y Q6_K se distribuyen en dos partes que deben concatenarse correctamente antes de su uso.
- Sin benchmarks: no hay evidencia publicada del rendimiento de este merge frente a su base, por lo que la calidad real es una incógnita hasta evaluarla en el caso de uso concreto.
- Repositorio de 775 GB: el espacio en disco necesario para alojar todas las variantes es considerable; conviene descargar solo la cuantización objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/MachiNoDolphin-Qwen2.5-72b-i1-GGUF
- Modelo base: https://huggingface.co/KaraKaraWarehouse/MachiNoDolphin-Qwen2.5-72b
- Cuantos estáticos del mismo modelo: https://huggingface.co/mradermacher/MachiNoDolphin-Qwen2.5-72b-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#MachiNoDolphin-Qwen2.5-72b-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Web del patrocinador (nethype GmbH): https://www.nethype.de/
