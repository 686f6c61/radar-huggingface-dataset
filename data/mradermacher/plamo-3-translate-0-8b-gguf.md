# mradermacher/plamo-3-translate-0.8b-GGUF

## Resumen

PLaMo 3 Translate 0.8B es un modelo especializado en traducción automática multilingüe desarrollado por Preferred Networks (PFN), una empresa japonesa de inteligencia artificial. El modelo base original es `pfnet/plamo-3-translate-0.8b`, y la versión aquí descrita es la cuantización GGUF realizada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. Con aproximadamente 890 millones de parámetros, se posiciona como una alternativa ligera y eficiente para tareas de traducción entre 54 idiomas, incluyendo lenguas de bajos recursos como cebuano, javanés, jemer, birmano o urdu.

El modelo está diseñado específicamente para traducción, no como un modelo generalista, lo que implica que su arquitectura y entrenamiento están optimizados para la tarea de conversión entre pares de idiomas. La disponibilidad de cuantizaciones estáticas que van desde Q2_K (0,5 GB) hasta f16 (1,9 GB) lo hace accesible para despliegues en CPU, GPUs modestas y entornos con restricciones de memoria. La licencia PLaMo Community License permite uso comunitario, aunque con condiciones específicas que deben revisarse antes de un uso comercial.

La relevancia actual de este modelo radica en su combinación de tamaño reducido, cobertura lingüística amplia y formato GGUF listo para producción. Para desarrolladores que necesitan integrar traducción multilingüe en aplicaciones sin depender de APIs externas, este modelo ofrece un equilibrio entre calidad, latencia y requisitos de hardware que pocas alternativas de su tamaño pueden igualar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en PLaMo, con código personalizado `custom_code`) |
| Parametros totales | 890.344.960 (~0,89 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | 54 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | PLaMo Community License |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base original en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un transformer con código personalizado (`custom_code`) y que el modelo base es `pfnet/plamo-3-translate-0.8b`. No se especifican el número de capas, dimensiones ocultas, mecanismos de atención ni innovaciones técnicas concretas como decodificación especulativa o atención lineal. El tamaño de 890 millones de parámetros sugiere un modelo compacto, probablemente con menos de 24 capas y dimensiones ocultas en el rango de 1024-2048, pero estos datos no están confirmados en la información proporcionada.

Respecto al entrenamiento, no se dispone de datos sobre el número de tokens utilizados, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. La model card del repositorio GGUF no incluye esta información, y el README se limita a describir las cuantizaciones disponibles y su uso. Tampoco se documentan innovaciones técnicas destacables más allá de la especialización en traducción y la cobertura de 54 idiomas.

## Capacidades

- Traducción automática multilingüe entre 54 idiomas, incluyendo pares con y sin inglés como pivote.
- Cobertura de lenguas de bajos recursos: cebuano, javanés, jemer, birmano, urdu, nepalí, pastún, entre otras.
- Generación de texto conversacional (etiqueta `conversational` en Hugging Face).
- Pipeline de traducción (`translation`) como caso de uso principal.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia estándar.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Traducción de documentación técnica en producción: el modelo puede integrarse en pipelines de CI/CD para traducir READMEs, guías y comentarios de código entre los 54 idiomas soportados, con cuantizaciones Q4_K_M que ocupan menos de 1 GB y permiten ejecución en CPU.
- Localización de interfaces de usuario: para aplicaciones que necesitan traducir cadenas de texto en tiempo real, el modelo ofrece latencia baja en GPUs de consumo y puede desplegarse con llama.cpp u Ollama sin dependencias de APIs externas.
- Atención al cliente multilingüe: el modelo puede gestionar conversaciones multi-turno en varios idiomas, aunque su contexto no está documentado; es adecuado para respuestas cortas y traducción de mensajes en sistemas de soporte.
- Traducción de contenido editorial y marketing: con cuantizaciones Q6_K o Q8_0 se obtiene calidad cercana a la del modelo original, adecuada para textos que requieren matices y precisión terminológica.
- Procesamiento de datos multilingües en investigación: investigadores que necesitan traducir corpus entre lenguas de bajos recursos pueden usar el modelo en local, evitando costes de API y problemas de privacidad.
- Sistemas de traducción embebidos en dispositivos: el tamaño reducido (0,5-1,9 GB según cuantización) permite desplegar el modelo en dispositivos edge, routers o mini-PCs con CPU, sin necesidad de GPU dedicada.
- Traducción de subtítulos y transcripciones: para flujos de postproducción que requieren convertir subtítulos entre idiomas, el modelo puede ejecutarse en lotes con llama.cpp y procesar archivos SRT de forma automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,5 GB (Q2_K) y 2,5 GB (f16) aproximadamente, considerando overhead de contexto y runtime.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4_K_M o superiores; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobradas para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.). También funciona en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, se requiere transformers con `trust_remote_code=True` y vLLM o TGI si se adapta.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el tamaño, se espera un throughput alto en GPU y aceptable en CPU, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| PLaMo 3 Translate 0.8B (este) | 0,89 B | No disponible | 54 | PLaMo Community License | GGUF, safetensors |
| NLLB-200 distilled 600M | 0,6 B | 512 tokens | 200 | CC-BY-NC 4.0 | safetensors, GGUF (comunitario) |
| M2M-100 418M | 0,418 B | 1024 tokens | 100 | MIT | safetensors |
| Helsinki-NLP opus-mt (varios) | 70-300 M | 512 tokens | 2 por modelo | CC-BY 4.0 | safetensors |

La comparativa se basa en modelos de traducción de tamaño similar ampliamente conocidos. PLaMo 3 Translate 0.8B destaca por su licencia community (no directamente comercial sin revisión) y su formato GGUF listo para usar, mientras que NLLB-200 ofrece más idiomas pero con licencia no comercial. M2M-100 tiene licencia MIT pero menor cobertura lingüística. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; como todo modelo entrenado con datos web, puede reflejar sesgos de género, culturales o geográficos en las traducciones.
- Riesgo de alucinación: inherente a los modelos generativos; en traducción puede producir contenido no presente en el texto original, especialmente en cuantizaciones bajas (Q2_K, Q3_K_S).
- Limitaciones de contexto: la longitud de contexto no está documentada, lo que impide garantizar el comportamiento en textos largos; se recomienda probar con documentos de diversa extensión antes de producción.
- Restricciones de licencia: la PLaMo Community License puede imponer condiciones al uso comercial; es imprescindible revisar el enlace de licencia antes de integrar el modelo en productos comerciales.
- Caveats para producción: las cuantizaciones Q2_K y Q3_K_S pueden degradar notablemente la calidad de traducción; se recomienda Q4_K_M o superior para uso real. El modelo requiere `trust_remote_code=True` en transformers, lo que implica ejecutar código del autor.
- Cobertura idiomática desigual: aunque soporta 54 idiomas, la calidad puede variar significativamente entre pares, especialmente en lenguas de bajos recursos como cebuano o jemer.
- Sin datos de benchmarks: no hay evidencia pública de calidad comparativa, lo que dificulta la selección frente a alternativas establecidas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/plamo-3-translate-0.8b-GGUF
- Modelo base original: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Licencia PLaMo Community: https://plamo.preferredai.jp/info/plamo-community-license-en
- Página de descargas del cuantizador: https://hf.tst.eu/model#plamo-3-translate-0.8b-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de comparación de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
