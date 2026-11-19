# mradermacher/Progeny_2x70b-GGUF

## Resumen

Progeny_2x70b es un modelo de lenguaje conversacional en inglés, resultado de la fusión (merge) de dos modelos de 70.000 millones de parámetros, publicado por el usuario RedDragonGecko en Hugging Face. El repositorio analizado aquí no contiene los pesos originales, sino la cuantización GGUF realizada por mradermacher, un conocido creador de cuantizaciones para el ecosistema llama.cpp. El modelo cuenta con 126.926.463.040 parámetros totales según los safetensors del modelo base, lo que confirma que se trata de una fusión de dos modelos de ~70B que no comparte pesos entre sus componentes.

La relevancia de esta ficha es doble: por un lado, documenta una técnica habitual en la comunidad open source (el model merging) para combinar capacidades de dos modelos sin entrenamiento adicional; por otro, muestra el catálogo de cuantizaciones GGUF disponibles para ejecutar un modelo de 127B en hardware de consumo o en servidores modestos mediante llama.cpp. La información pública es escasa: no hay model card detallada del modelo base, no se especifican datos de entrenamiento, contexto ni licencia, y el repositorio GGUF solo aporta la tabla de cuantizaciones.

Se trata, por tanto, de un modelo de nicho, con muy pocas descargas (5) y sin likes, orientado a experimentación con fusiones de modelos grandes en formato GGUF más que a uso en producción. Esta ficha recoge únicamente los datos verificables disponibles y marca explícitamente como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fusión de dos modelos de ~70B; detalles no disponibles) |
| Parametros totales | 126.926.463.040 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (GGUF estáticas; no hay imatrix/weighted) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base RedDragonGecko/Progeny_2x70b más allá de que es una fusión de dos modelos de 70B. El nombre "2x70b" y el recuento de parámetros (126,9B) indican que se concatenaron o combinaron dos checkpoints de ~70B sin compartir pesos, lo que da lugar a un modelo de aproximadamente 127B parámetros. No se especifica la técnica de merge empleada (SLERP, TIES, DARE, linear, etc.), ni los modelos de origen, ni si hubo entrenamiento posterior.

Tampoco hay datos sobre el corpus de entrenamiento, número de tokens, composición del dataset ni procesos de alineación (RLHF, DPO). El repositorio GGUF de mradermacher solo documenta el proceso de cuantización: cuantizaciones estáticas generadas con convert_type hf y quantize_version 2, sin cuantizaciones ponderadas ni imatrix en el momento de la publicación. No se han publicado innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta "conversational" del repositorio.
- Razonamiento y generación de texto general, heredado de los modelos base de 70B (no verificado con benchmarks).
- Capacidades multilingües: limitadas al inglés según el campo `language: en`.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse mediante infraestructura compatible con la API de Hugging Face, aunque no se detalla.

## Casos de uso

- Experimentación con fusiones de modelos: el modelo permite evaluar el comportamiento de un merge 2x70B frente a sus componentes originales, útil para investigadores que estudian técnicas de model merging y su impacto en calidad.
- Inferencia local con llama.cpp: las cuantizaciones Q4_K_S (72,5 GB) y Q4_K_M (76,8 GB) permiten ejecutar un modelo de 127B en estaciones de trabajo con 96 GB de RAM o GPU, algo imposible con los pesos completos en fp16.
- Generación de texto creativo en inglés: al ser un modelo conversacional de gran tamaño, puede emplearse para redacción, lluvia de ideas y escritura asistida, siempre que se valide la calidad con pruebas propias.
- Prototipado de asistentes conversacionales: la etiqueta "conversational" y el formato GGUF permiten integrarlo en demos con Ollama o llama.cpp para evaluar respuestas multi-turno.
- Investigación sobre cuantización extrema: la disponibilidad de Q2_K (46,9 GB) y Q3_K_S (55,2 GB) permite estudiar la degradación de calidad en modelos de 127B con cuantizaciones agresivas.
- Evaluación comparativa de quants: la tabla de cuantizaciones facilita reproducir experimentos de perplejidad y calidad entre Q2_K, Q4_K_M y Q8_0 para calibrar el compromiso tamaño/calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: Q2_K requiere ~46,9 GB; Q3_K_S ~55,2 GB; Q4_K_S ~72,5 GB; Q4_K_M ~76,8 GB; Q5_K_M ~90,1 GB; Q6_K ~104,2 GB; Q8_0 ~135,0 GB (tamaños de fichero GGUF, sin contar overhead de contexto).
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, Q4_K_M encaja en configuraciones con 80-96 GB de VRAM (A100 80GB, H100 80GB) o en CPU con suficiente RAM; Q8_0 requiere ~135 GB, fuera de una sola GPU de 80 GB.
- ¿Cabe en GPU de consumo? No para las cuantizaciones de calidad media o alta: Q4_K_M (76,8 GB) excede la VRAM de una RTX 4090 (24 GB). Solo sería viable con offloading a RAM del sistema o con múltiples GPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), y servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa para este modelo sin conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Progeny_2x70b (este) | 126,9B | no disponible | no disponible | GGUF | Fusión 2x70B, solo inglés, 5 descargas |
| Llama 3.1 70B | 70B | 128K | Llama 3.1 Community | safetensors, GGUF | Modelo oficial de Meta, ampliamente soportado |
| Qwen2.5 72B | 72B | 128K | Apache 2.0 (según versión) | safetensors, GGUF | Multilingüe, muy extendido en la comunidad |
| Mistral Large 2 | 123B | 128K | Mistral Research/Commercial | safetensors | Tamaño comparable, licencia comercial |

La comparativa es orientativa: no se dispone de datos de rendimiento de Progeny_2x70b que permitan una comparación cuantitativa. Los modelos alternativos citados son referencias habituales en la misma franja de tamaño, pero sus especificaciones deben verificarse en sus respectivas fichas.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial; es imprescindible contactar con el autor o revisar el modelo base antes de cualquier despliegue en producción.
- Idiomas: solo inglés; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Sin model card detallada del modelo base: se desconocen los datos de entrenamiento, los modelos de origen del merge y las técnicas de alineación, lo que dificulta evaluar sesgos y robustez.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin benchmarks ni evaluaciones publicadas no hay evidencia de mitigación.
- Sesgos conocidos: no documentados; al desconocerse los datos de entrenamiento, no se pueden identificar sesgos específicos.
- Calidad de las cuantizaciones agresivas: Q2_K y Q3_K_S pueden degradar notablemente la calidad; el autor no proporciona cuantizaciones imatrix/weighted, que suelen ofrecer mejor relación calidad/tamaño.
- Soporte limitado: 5 descargas y 0 likes indican una adopción mínima, por lo que la comunidad y el soporte son prácticamente inexistentes.
- Tamaño: 127B parámetros hacen inviable el despliegue en una sola GPU de consumo; requiere infraestructura con mucha RAM o múltiples GPU.
- Repositorio de 863,3 GB: el espacio en disco necesario para alojar todas las cuantizaciones es considerable.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Progeny_2x70b-GGUF
- Modelo base: https://huggingface.co/RedDragonGecko/Progeny_2x70b
- Página de descargas del autor: https://hf.tst.eu/model#Progeny_2x70b-GGUF
- README de referencia para GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor de las cuantizaciones: https://www.nethype.de/
