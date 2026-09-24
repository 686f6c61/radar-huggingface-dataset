# mradermacher/Gemma4-E4B-8B-Heretic-Ultra-GGUF

## Resumen

Gemma4-E4B-8B-Heretic-Ultra-GGUF es la versión cuantizada en formato GGUF del modelo dopaemon/Gemma4-E4B-8B-Heretic-Ultra, publicada por el usuario mradermacher, conocido por mantener un repositorio extenso de cuantizaciones de modelos abiertos. Se trata de una variante etiquetada como heretic, uncensored, decensored y abliterated, es decir, un modelo al que se le han aplicado técnicas de ablación de direcciones de rechazo para eliminar o reducir los mecanismos de negativa aprendidos durante el ajuste de alineación.

El modelo declara 7.518.069.290 parámetros totales (unos 7,52 mil millones) según los pesos en safetensors del modelo base, y se distribuye exclusivamente en GGUF, con 12 niveles de cuantización estática más dos archivos mmproj que apuntan a capacidad multimodal. La model card no documenta la arquitectura, el contexto, los datos de entrenamiento ni resultados de evaluación, por lo que la mayor parte de las especificaciones técnicas quedan sin confirmar.

Su relevancia es acotada y muy específica: cubre el nicho de modelos pequeños (7-8 B) sin filtros de seguridad para investigación en alineación, red teaming y generación creativa sin restricciones editoriales, ejecutables en hardware de consumo. El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (24 de septiembre de 2026), por lo que no cuenta con validación de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (la model card no la documenta; el nombre y la librería apuntan a un transformer decoder-only derivado de la familia Gemma) |
| Parámetros totales | 7.518.069.290 (≈7,52 B), dato de safetensors del modelo base |
| Parámetros activos | No disponible (no se confirma que sea MoE; el sufijo E4B sugiere "effective 4B" en la nomenclatura de Google, sin verificar) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; más mmproj-f16 y mmproj-Q8_0 (componente multimodal) |
| Idiomas soportados | Inglés (etiqueta "en"); también aparece la etiqueta "ara" (árabe) sin documentar |
| Licencia | Apache-2.0 declarada, con enlace a la licencia de Gemma |
| Formato de pesos | GGUF (cuantizaciones estáticas; no hay cuantizaciones ponderadas ni imatrix) |
| Tamaño del repositorio | 76,9 GB (incluye todos los niveles de cuantización) |
| Fecha de publicación | 24 de septiembre de 2026 (creación y última actualización el mismo día) |

## Arquitectura y entrenamiento

La model card no aporta información sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni las etapas de ajuste (SFT, RLHF, DPO). Los únicos indicios son el nombre del modelo, que sugiere un derivado de la familia Gemma con una variante "E4B" de 8 B de parámetros, y la presencia de archivos mmproj-f16 y mmproj-Q8_0, que en el ecosistema llama.cpp corresponden a un proyector multimodal visión-lenguaje. Esto implica que el modelo base probablemente acepta entrada de imágenes, aunque la model card no lo confirma ni detalla las modalidades.

La innovación declarada no está en la arquitectura, sino en el proceso de desalineación: las etiquetas "heretic", "abliterated" y "uncensored" indican que se aplicó una ablación de direcciones de rechazo sobre los pesos del modelo ajustado. "Heretic" es el nombre de una herramienta de código abierto que optimiza automáticamente los parámetros de ablación para reducir el número de negativas manteniendo la coherencia del modelo. El resultado es un modelo que conserva las capacidades lingüísticas generales del original pero sin las capas de rechazo inducidas por la alineación. No se documenta si hubo reentrenamiento posterior, ajuste fino adicional ni evaluación de la degradación provocada por la ablación.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat multi-turno (etiqueta "conversational").
- Respuesta sin filtros de seguridad: al estar ablacionado, no aplica negativas por contenido sensible, NSFW, violencia o temas tabú.
- Entrada multimodal probable: los archivos mmproj-f16 y mmproj-Q8_0 permiten cargar un proyector visión-lenguaje en llama.cpp, aunque la model card no especifica qué modalidades soporta ni con qué calidad.
- Razonamiento y conocimiento general heredados del modelo base de ~7,5 B, sin métricas publicadas que lo confirmen.
- Ejecución local en CPU y GPU mediante el ecosistema GGUF.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés declarado; la etiqueta "ara" aparece en los tags sin documentación adicional.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Red teaming y evaluación de seguridad: el modelo sirve como sujeto de prueba para medir qué contenidos generan los modelos ablacionados frente a sus versiones alineadas, y para calibrar clasificadores de contenido dañino en pipelines internos de moderación.
- Investigación en alineación y abliteration: permite estudiar experimentalmente el efecto de la ablación de direcciones de rechazo sobre el comportamiento del modelo, comparando respuestas con el modelo base dopaemon/Gemma4-E4B-8B-Heretic-Ultra o con el Gemma original.
- Generación creativa de ficción sin restricciones editoriales: escritura de narrativa adulta, terror explícito o tramas con violencia gráfica sin que el modelo se niegue ni añada advertencias, algo que los modelos alineados suelen hacer.
- Asistente conversacional local en escritorio: con la cuantización Q4_K_M (5,4 GB) se puede ejecutar en una GPU de 8-12 GB mediante Ollama o LM Studio, con datos que no salen del equipo, útil para entornos con requisitos de confidencialidad.
- Análisis de documentos técnicos sensibles: en dominios donde los modelos alineados rechazan hablar de ciertos temas por proximidad a contenido regulado (ciberseguridad defensiva, toxicología, literatura médica explícita), esta variante mantiene la conversación sin bloqueos artificiales.
- Despliegue en hardware limitado o sin conexión: las cuantizaciones Q2_K (4,5 GB) y Q3_K_S (4,8 GB) permiten inferencia en portátiles con 8 GB de RAM/VRAM, por ejemplo en entornos aislados o sin acceso a APIs externas.
- Prototipado rápido de chatbots de dominio específico: al no incorporar capas de rechazo, se evitan interrupciones en flujos conversacionales técnicos donde el filtro genérico resulta contraproducente; el ajuste posterior se puede hacer con LoRA sobre la versión safetensors del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card del repositorio GGUF y la del modelo base no incluyen evaluaciones de MMLU, HumanEval, GSM8K, MT-Bench ni de ningún otro conjunto de referencia. La búsqueda web realizada no devolvió resultados técnicos relevantes: los enlaces recuperados eran contenido no relacionado con el modelo. Tampoco hay datos de perplejidad comparativa entre las cuantizaciones publicadas.

## Requisitos de hardware

- VRAM estimada para inferencia, a partir del tamaño de archivo declarado (sin contar caché KV, que crece con la longitud de contexto):
  - Q2_K (4,5 GB): ~5-6 GB en total. Cabe en GPU de 6-8 GB.
  - Q3_K_S / Q3_K_M / Q3_K_L (4,8-5,1 GB): ~6 GB. Cabe en RTX 3060 8 GB, RTX 4060.
  - IQ4_XS (5,2 GB) y Q4_K_S / Q4_K_M (5,3-5,4 GB): ~6,5-8 GB. Cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070.
  - Q5_K_S / Q5_K_M (5,8-5,9 GB): ~8-9 GB. Cabe en RTX 4070 12 GB.
  - Q6_K (6,3 GB): ~9-10 GB. Cabe en RTX 4070 Ti 12 GB y superiores.
  - Q8_0 (8,1 GB): ~11-12 GB. Requiere RTX 4070 Ti Super 16 GB, RTX 4080 o RTX 4090.
  - f16 (15,2 GB): ~17-18 GB. Requiere RTX 4090 24 GB, A100 40 GB, H100 o L40S.
- Cabe en GPU de consumo: sí, desde Q2_K hasta Q8_0 en tarjetas de 8-16 GB; f16 queda fuera de la mayoría de GPU de consumo salvo la RTX 4090.
- Ejecución en CPU: viable con llama.cpp u Ollama; se recomienda un mínimo de 8-16 GB de RAM para las cuantizaciones Q4 y Q5, y offload parcial de capas a GPU si se dispone de una tarjeta pequeña.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y servidores compatibles con GGUF. El repositorio no incluye pesos safetensors, por lo que vLLM y TGI quedan limitados a su soporte experimental de GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La comparación es parcial porque el contexto, la arquitectura y el rendimiento de este modelo no están documentados. Se incluyen alternativas de tamaño similar y ampliamente utilizadas como referencia de categoría; los datos de las alternativas corresponden a sus especificaciones públicas conocidas.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma4-E4B-8B-Heretic-Ultra-GGUF | ≈7,52 B | No disponible | Apache-2.0 declarada (con enlace a licencia de Gemma) | Solo GGUF, 12 cuantizaciones + mmproj | Variante ablacionada sin filtros; sin benchmarks publicados; 0 descargas |
| Meta Llama 3.1 8B Instruct | 8,03 B | 128.000 tokens | Llama 3.1 Community License | Safetensors y GGUF (comunidad) | Modelo alineado, ampliamente evaluado y con ecosistema maduro |
| Qwen2.5 7B Instruct | 7,62 B | 32.768 nativos, 131.072 con YaRN | Apache-2.0 (la mayoría de variantes) | Safetensors y GGUF (comunidad) | Fuerte en código y matemáticas; soporte multilingüe amplio |
| Mistral 7B Instruct v0.3 | 7,25 B | 32.000 tokens | Apache-2.0 | Safetensors y GGUF (comunidad) | Referencia clásica de 7 B con licencia permisiva |

Frente a estas alternativas, la ventaja diferencial de este modelo es exclusivamente la ausencia de filtros de seguridad y el formato GGUF listo para usar; en cambio, carece de documentación, de evaluaciones y de soporte multilingüe declarado más allá del inglés.

## Limitaciones y advertencias

- Modelo ablacionado y sin censura: las etiquetas heretic, uncensored, decensored y abliterated indican que se han eliminado o atenuado los mecanismos de rechazo. No aplica filtros de seguridad y puede generar contenido explícito, violento, ilegal o dañino si se le solicita. No es apto para aplicaciones orientadas al público general, menores ni entornos regulados.
- La ablación puede degradar la coherencia, la utilidad general y la calidad del razonamiento respecto al modelo original; no hay evaluaciones publicadas que cuantifiquen ese daño.
- Riesgo de alucinación estándar en un modelo de ~7,5 B, sin benchmarks que permitan acotarlo.
- Ambigüedad de licencia: se declara Apache-2.0, pero el enlace de licencia apunta a la licencia de Gemma, que impone restricciones de uso, obligaciones de distribución de términos y políticas de uso prohibido. Hay que verificar qué licencia rige realmente antes de cualquier uso comercial.
- Idiomas: solo el inglés está declarado; no hay datos de rendimiento en castellano ni en otros idiomas.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones largas ni en tareas de recuperación sobre documentos extensos.
- El repositorio no ofrece cuantizaciones ponderadas ni imatrix, lo que suele implicar una pérdida de calidad algo mayor en los niveles bajos (Q2_K, Q3_K) frente a cuantizaciones calibradas.
- Es un derivado de un derivado (dopaemon sobre un Gemma base, y mradermacher sobre dopaemon): cada etapa puede acumular degradación no documentada.
- Ausencia total de validación comunitaria: 0 descargas y 0 likes, publicado y actualizado el mismo día, sin discusiones ni informes de uso real.
- La búsqueda web no aportó información técnica fiable sobre el modelo; los resultados recuperados eran irrelevantes y no deben tomarse como referencia.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/Gemma4-E4B-8B-Heretic-Ultra-GGUF
- Modelo base: https://huggingface.co/dopaemon/Gemma4-E4B-8B-Heretic-Ultra
- Página de resumen y descargas de mradermacher para este modelo: https://hf.tst.eu/model#Gemma4-E4B-8B-Heretic-Ultra-GGUF
- Licencia de Gemma referenciada en la model card: https://ai.google.dev/gemma/docs/gemma_4_license
- Peticiones de cuantización y preguntas frecuentes de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de archivos GGUF (README de TheBloke citado por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa que aloja la infraestructura de cuantización: https://www.nethype.de/
