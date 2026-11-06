# mradermacher/Olmo-3.1-32B-Instruct-ARA-heretic-i1-GGUF

## Resumen

Olmo-3.1-32B-Instruct-ARA-heretic-i1-GGUF es una redistribución en formato GGUF, publicada por mradermacher, de una variante "heretic" (abliterada o descensurada) del modelo Olmo-3.1-32B-Instruct de Allen AI. El repositorio contiene exclusivamente pesos cuantizados en GGUF generados con quants ponderados tipo imatrix, derivados del checkpoint de richardyoung/Olmo-3.1-32B-Instruct-ARA-heretic. La model card original de Olmo no está incluida, por lo que los datos de entrenamiento, licencia e idiomas no se detallan en la información disponible.

El modelo base pertenece a la familia Olmo de Allen AI, orientada a modelos abiertos con datos de entrenamiento públicos, pero esta ficha se limita a lo que declara el repositorio de mradermacher: una conversión GGUF con múltiples niveles de cuantización. No hay información sobre arquitectura interna, número de parámetros reales ni rendimiento en benchmarks en la documentación proporcionada.

Es relevante para desarrolladores que quieran ejecutar localmente una variante de 32B con licencia permisiva (la del modelo base, presumiblemente Apache 2.0 según el ecosistema Olmo, aunque no confirmada aquí) y con el sesgo de seguridad reducido que caracteriza a las variantes "heretic". Sin embargo, la falta de datos verificables obliga a tratar esta ficha como referencia de disponibilidad más que de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Olmo de Allen AI; detalles no presentes en la información) |
| Parametros totales | no disponible (el campo "safetensors" del repo indica 7.476.928, cifra inconsistente con un modelo de 32B y probablemente referida a otro artefacto) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, small-IQ4_NL, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible en este repo (el modelo base Olmo se distribuye habitualmente bajo Apache 2.0; no confirmado aquí) |
| Formato de pesos | GGUF (quantizaciones ponderadas/imatrix, convert_type hf) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación de este repositorio. Por el nombre, se trata de Olmo-3.1-32B-Instruct, un transformer decoder-only de 32B parámetros de Allen AI, pero los detalles de capas, atención, datos de entrenamiento, número de tokens, composición del dataset y si hubo RLHF/DPO no están disponibles en la información proporcionada.

Lo único documentado es el proceso de conversión: los pesos se han convertido a GGUF (`convert_type: hf`) y cuantizado con quants ponderados e imatrix (`weighted/imatrix quants`), a partir del checkpoint `richardyoung/Olmo-3.1-32B-Instruct-ARA-heretic`. La etiqueta "heretic" indica una modificación del modelo original orientada a eliminar o atenuar las capas de rechazo (abliteration), pero no se detalla la metodología exacta ni el impacto sobre capacidades.

## Capacidades

- Generación de texto conversacional e instrucciones: al ser una variante Instruct del modelo Olmo, se espera soporte de diálogo multi-turno, aunque no hay confirmación explícita en este repo.
- Razonamiento y matemáticas: no disponible; no se documentan capacidades específicas.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; los idiomas no se declaran.
- Modo thinking, visión o audio: no disponible; no se indica ninguna modalidad adicional.
- Comportamiento "heretic" (abliterado): se espera una menor tendencia a rechazar peticiones, pero no hay evidencia documentada en el repo.

## Casos de uso

- Inferencia local en estaciones de trabajo: al estar en GGUF, puede cargarse con llama.cpp u Ollama en equipos con suficiente RAM/VRAM; útil para experimentar con una variante de 32B sin depender de servicios en la nube.
- Pruebas de seguridad y red teaming: la naturaleza "heretic" permite estudiar cómo se comporta un modelo con salvaguardas atenuadas, útil para evaluar filtros y políticas de contenido en pipelines de moderación.
- Investigación sobre abliteration: comparar esta variante con el Olmo-3.1-32B-Instruct original para medir el impacto de la eliminación de rechazos en calidad, alucinación y sesgo.
- Despliegue en entornos con recursos limitados mediante cuantizaciones agresivas: las opciones IQ2/IQ3 permiten probar el modelo en GPUs de consumo, sacrificando precisión.
- Generación de texto creativo y conversacional sin restricciones de contenido: para proyectos donde se requiera un modelo que no filtre respuestas, asumiendo los riesgos éticos y legales.
- Integración en pipelines de evaluación con llama.cpp: servir el modelo vía API compatible con OpenAI (por ejemplo, llama-server) para benchmarks internos de latencia y throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; para un modelo de 32B en GGUF, las cuantizaciones Q4_K_M suelen requerir aproximadamente 19-20 GB y las Q8 alrededor de 34 GB, pero estos valores son estimaciones generales y no están confirmados en la información.
- GPU recomendadas: no disponible; por tamaño, cabría esperar A100 40GB, H100 80GB o RTX 4090 24GB para cuantizaciones Q4, pero no se documenta.
- ¿Cabe en GPU de consumo?: probablemente en RTX 3090/4090 con cuantizaciones Q3/Q4, aunque no está confirmado.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (llama-server). vLLM y TGI no soportan GGUF de forma nativa sin conversión adicional.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Olmo-3.1-32B-Instruct-ARA-heretic-i1-GGUF (este) | 32B (nominal) | no disponible | no disponible | GGUF | Variante heretic cuantizada por mradermacher |
| Olmo-3.1-32B-Instruct-i1-GGUF (mradermacher) | 32B (nominal) | no disponible | no disponible | GGUF | Mismo base sin modificación heretic |
| Olmo-3.1-32B-Instruct-impotent-heresy-GGUF (mradermacher) | 32B (nominal) | no disponible | Apache 2.0 (según repo) | GGUF | Otra variante heretic del mismo base |

No se dispone de datos de benchmarks para establecer una comparación de rendimiento entre estas variantes.

## Limitaciones y advertencias

- La model card no incluye información sobre licencia, idiomas ni datos de entrenamiento; verificar la licencia del modelo base (Olmo) antes de uso comercial.
- El campo de parámetros del repo (7.476.928) es inconsistente con un modelo de 32B y no debe usarse como referencia de tamaño.
- Al ser una variante "heretic", es probable que tenga salvaguardas de seguridad reducidas, lo que aumenta el riesgo de generar contenido dañino, sesgado o ilegal; no apta para producción sin moderación externa.
- Riesgo de alucinación no cuantificado; no hay evaluaciones publicadas en este repo.
- Las cuantizaciones IQ1/IQ2 pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso serio.
- Sin datos de contexto, no se puede garantizar el manejo de conversaciones o documentos largos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; poca validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Olmo-3.1-32B-Instruct-ARA-heretic-i1-GGUF
- Modelo de origen: https://huggingface.co/richardyoung/Olmo-3.1-32B-Instruct-ARA-heretic
- Variante relacionada: https://huggingface.co/mradermacher/Olmo-3.1-32B-Instruct-impotent-heresy-GGUF
- Conversión GGUF del base: https://huggingface.co/mradermacher/Olmo-3.1-32B-Instruct-i1-GGUF
