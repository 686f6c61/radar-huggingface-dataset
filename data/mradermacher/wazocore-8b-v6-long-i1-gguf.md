# mradermacher/WazoCore-8B-v6-long-i1-GGUF

## Resumen

WazoCore-8B-v6-long es un modelo de lenguaje de 8.153 millones de parámetros basado en la arquitectura Llama 3, desarrollado por mkbadeniyi y orientado a la traducción y el procesamiento de lenguas nigerianas de bajos recursos: yoruba (yo), hausa (ha), igbo (ig) e inglés (en). El repositorio aquí descrito es la versión cuantizada en formato GGUF con imatrix (matriz de importancia) publicada por mradermacher, un cuantizador conocido por producir versiones optimizadas para inferencia local con llama.cpp. La variante "long" sugiere soporte extendido de contexto respecto a la versión base, aunque la cifra exacta no está disponible en la documentación.

Su relevancia radica en la escasez de modelos abiertos que cubran lenguas africanas de bajos recursos. WazoCore incorpora expansión de vocabulario (vocabulary-expansion) sobre el tokenizador BPE de Llama 3, lo que mejora la eficiencia de tokenización en yoruba, hausa e igbo y reduce el coste de procesar texto en esas lenguas. Gracias a la cuantización GGUF, puede ejecutarse en hardware de consumo desde aproximadamente 2,2 GB de disco en la versión más agresiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en Llama 3) |
| Parametros totales | 8.153.141.312 |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible (la variante "long" sugiere contexto extendido) |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | yoruba (yo), hausa (ha), igbo (ig), ingles (en) |
| Licencia | n-atlas-open-source-research-and-innovation-license (other) |
| Formato de pesos | GGUF (cuantizado con imatrix); el modelo base usa safetensors |

## Arquitectura y entrenamiento

El modelo base, mkbadeniyi/WazoCore-8B-v6-long, es un transformer decoder de la familia Llama 3 con 8.153 millones de parámetros. Una de sus innovaciones principales es la expansión del vocabulario del tokenizador BPE original de Llama 3 para cubrir yoruba, hausa e igbo, lenguas que el tokenizador original fragmenta en muchos tokens, penalizando la eficiencia y la calidad. Esta expansión permite representar texto en lenguas nigerianas con menos tokens por palabra.

Sobre el dataset de entrenamiento, la model card solo indica el uso de google/smol como dataset. No se especifican el número de tokens, la composición detallada del corpus ni si se aplicaron técnicas de alineación como RLHF o DPO. La versión aquí reseñada es una cuantización con matriz de importancia (imatrix) realizada por mradermacher a partir del modelo base, un método que calibra la cuantización según la activación real de los pesos y mejora la calidad frente a cuantizaciones estáticas, especialmente en niveles bajos de bits.

## Capacidades

- Traducción entre yoruba, hausa, igbo e inglés (pipeline de traducción según HuggingFace).
- Generación de texto conversacional (etiquetado como "conversational").
- Manejo eficiente de lenguas de bajos recursos gracias a la expansión de vocabulario del tokenizador.
- Compatibilidad con llama.cpp y ecosistemas GGUF para inferencia local sin GPU.
- No hay información publicada sobre tool calling, capacidades de agentes, visión ni audio.

## Casos de uso

- Traducción automática inglés-yoruba/hausa/igbo: el modelo está especializado en estas direcciones lingüísticas y su tokenizador expandido procesa las lenguas nigerianas con menos tokens, reduciendo latencia y coste.
- Asistentes conversacionales locales en lenguas nigerianas: al ser GGUF, puede desplegarse en portátiles o servidores modestos sin conexión a APIs externas, útil en regiones con conectividad limitada.
- Investigación en PLN de bajos recursos: base idónea para experimentos de fine-tuning, evaluación y análisis lingüístico en yoruba, hausa e igbo.
- Localización de software y contenidos: traducción de interfaces, documentación y materiales educativos del inglés a las tres principales lenguas nigerianas.
- Verificación y post-edición de traducciones: integración en flujos de trabajo de traducción asistida donde un traductor humano revisa la salida del modelo.
- Preservación lingüística: creación de corpus paralelos y herramientas de acceso para comunidades de habla yoruba, hausa e igbo.
- Prototipado en dispositivos edge: las cuantizaciones de 2-3 GB permiten pruebas en equipos sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o RAM estimada para inferencia: desde unos 2,2 GB (IQ1_S) hasta 6,8 GB (Q6_K) según la cuantización, más la memoria del contexto. La recomendación general es Q4_K_M (5,1 GB) como equilibrio entre calidad y tamaño.
- GPU recomendadas: no es necesario disponer de GPU; cualquier GPU con 6-8 GB de VRAM (por ejemplo RTX 3060 o RTX 4060) permite acelerar la inferencia con llama.cpp mediante offload de capas.
- Cabe en consumer GPU: sí. Con una RTX 3060 de 12 GB cabe la Q6_K íntegramente en VRAM; con 8 GB cabe hasta Q5_K_M. En CPU pura, cualquier equipo con 8-16 GB de RAM ejecuta las cuantizaciones bajas y medias.
- Opciones de despliegue: llama.cpp (destinatario natural del formato GGUF), Ollama, LM Studio y cualquier runtime compatible con GGUF. Al ser un modelo Llama 3, la compatibilidad debería ser directa.
- Latencia y throughput: no disponible. En CPU moderna con cuantizaciones Q4, un modelo de 8B suele alcanzar velocidades de varios tokens por segundo, pero no hay cifras oficiales para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia |
|---|---|---|---|---|
| WazoCore-8B-v6-long (este, cuantizado) | 8.153 M | yo, ha, ig, en | GGUF | n-atlas (research/innovation) |
| Llama 3 8B Instruct (base genérico) | 8.000 M | multilingue (sin especializacion en yo/ha/ig) | safetensors / GGUF | Llama 3 Community License |
| N-ATLAS (proyecto de referencia del licenciamiento) | no disponible | lenguas africanas | no disponible | n-atlas license |

WazoCore se diferencia de Llama 3 8B genérico en su tokenizador expandido y su especialización en lenguas nigerianas, a costa de un alcance multilingüe más reducido. No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- La licencia n-atlas-open-source-research-and-innovation-license no es una licencia estándar permisiva: hay que revisar sus términos antes de cualquier uso comercial, ya que el nombre sugiere restricciones o condiciones específicas para investigación e innovación.
- Riesgo de alucinación elevado en lenguas de bajos recursos: la calidad generativa en yoruba, hausa e igbo puede ser inferior a la del inglés y no hay benchmarks que lo cuantifiquen.
- Cobertura lingüística limitada a cuatro idiomas; no es adecuado como modelo generalista multilingüe.
- Cuantizaciones por debajo de Q4 (especialmente IQ1_S e IQ1_M) degradan notablemente la calidad, algo especialmente delicado en tareas de traducción.
- La model card del modelo base es escasa: no hay datos de entrenamiento, alineación ni evaluación, lo que dificulta auditar sesgos.
- Posibles sesgos culturales y de género heredados de los datos de entrenamiento, sin auditoría publicada.
- La versión "long" no documenta su longitud de contexto real; verificarla empíricamente antes de depender de contextos largos.

## Enlaces

- Repositorio cuantizado (esta ficha): https://huggingface.co/mradermacher/WazoCore-8B-v6-long-i1-GGUF
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/WazoCore-8B-v6-long-GGUF
- Modelo base: https://huggingface.co/mkbadeniyi/WazoCore-8B-v6-long
- Resumen de descargas del cuantizador: https://hf.tst.eu/model#WazoCore-8B-v6-long-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
