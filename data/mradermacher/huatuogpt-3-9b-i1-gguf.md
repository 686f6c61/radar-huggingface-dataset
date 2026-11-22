# mradermacher/HuatuoGPT-3-9B-i1-GGUF

## Resumen

HuatuoGPT-3-9B-i1-GGUF es la versión cuantizada en formato GGUF del modelo HuatuoGPT-3-9B, desarrollado originalmente por FreedomIntelligence y cuantizado por mradermacher. Se trata de un modelo de lenguaje especializado en el dominio médico, con capacidades de razonamiento y conversación, orientado a aplicaciones de salud como asistencia clínica, respuesta a preguntas médicas y diálogo multi-turno con terminología especializada. El modelo base cuenta con aproximadamente 8.950 millones de parámetros y se distribuye bajo licencia Apache 2.0.

Esta versión concreta emplea cuantizaciones de tipo imatrix (i1), generadas a partir de un fichero de importancia calculado sobre el modelo original, lo que permite obtener una calidad superior en comparación con las cuantizaciones estáticas tradicionales del mismo tamaño. El repositorio incluye un amplio abanico de niveles de cuantización, desde IQ1_S (2,8 GB) hasta Q6_K (7,5 GB), lo que facilita el despliegue en hardware muy diverso, desde GPUs de consumo hasta servidores con aceleradores profesionales.

La relevancia de esta ficha radica en que permite a desarrolladores e investigadores evaluar rápidamente un modelo médico de tamaño medio con licencia permisiva, disponible en formatos optimizados para inferencia local mediante llama.cpp y compatible con endpoints. No obstante, la información pública disponible sobre arquitectura detallada, contexto, datos de entrenamiento y benchmarks es limitada, por lo que varios apartados se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de la familia HuatuoGPT-3, según el modelo base) |
| Parámetros totales | 8.953.803.264 (~8,95 mil millones) |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (más fichero imatrix) |
| Idiomas soportados | inglés (según la model card; el resto no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base original en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base HuatuoGPT-3-9B en la documentación proporcionada. Por el nombre y la familia a la que pertenece, se trata de un modelo transformer de aproximadamente 9 mil millones de parámetros, etiquetado con los descriptores "medical", "reasoning", "conversational" y "onepo". El tag "onepo" sugiere el uso de optimización de preferencias (preference optimization) en el ajuste, aunque no se especifica si se trata de DPO, IPO u otra variante, ni los detalles del dataset de entrenamiento, el número de tokens o la composición de los datos.

La innovación técnica destacable de esta versión concreta es el uso de cuantizaciones imatrix (i1), que emplean una matriz de importancia calculada a partir de estadísticas de activación para preservar mejor los pesos relevantes durante la cuantización. Esto se traduce en una calidad superior frente a cuantizaciones estáticas de tamaño comparable, especialmente en los niveles bajos (IQ2, IQ3). El repositorio incluye también el fichero imatrix original (0,1 GB) para que otros usuarios puedan generar sus propias cuantizaciones. No se dispone de información sobre técnicas como decodificación especulativa, atención lineal o arquitecturas híbridas.

## Capacidades

- Generación de texto conversacional en el dominio médico, con capacidad de mantener diálogos multi-turno.
- Razonamiento clínico y respuesta a preguntas médicas, según los tags "medical" y "reasoning".
- Capacidades de conversación general etiquetadas como "conversational".
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; el tag "reasoning" sugiere cierta capacidad, pero sin confirmación.
- Capacidades multilingües: la model card solo declara inglés; no se confirman otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Asistencia a profesionales sanitarios en la redacción de informes clínicos: el modelo puede generar borradores estructurados de historiales y resúmenes a partir de notas, gracias a su especialización médica y a su tamaño manejable para despliegue local en entornos con requisitos de privacidad.
- Respuesta a preguntas frecuentes de pacientes en portales de salud: adecuado para conversaciones multi-turno sobre síntomas generales, medicación o cuidados posteriores, con la ventaja de poder ejecutarse en infraestructura propia y no enviar datos sensibles a terceros.
- Triaje conversacional preliminar: integrado en un chatbot de admisión, el modelo puede recoger información inicial del paciente y clasificar la urgencia, derivando a un profesional cuando sea necesario; su licencia Apache 2.0 permite integrarlo en productos comerciales.
- Formación médica y simulación de casos clínicos: investigadores pueden desplegar el modelo en local con llama.cpp para generar escenarios de práctica y preguntas de evaluación, ajustando el nivel de cuantización según el hardware disponible.
- Extracción y resumen de literatura biomédica: el modelo puede resumir artículos o guías clínicas y responder preguntas sobre su contenido, aunque la longitud de contexto no está confirmada y conviene verificar este extremo antes de usarlo con documentos largos.
- Despliegue en entornos con GPU de consumo: gracias a las cuantizaciones de 4-6 bits (5,5-7,5 GB), puede ejecutarse en tarjetas como RTX 3060 de 12 GB o RTX 4090, lo que facilita prototipos y pruebas de concepto sin infraestructura dedicada.
- Investigación en NLP médico: sirve como base para experimentos de ajuste fino o evaluación de sesgos en modelos especializados, al ser un checkpoint abierto con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): aproximadamente 2,8 GB (IQ1_S), 3,9 GB (Q2_K), 4,5 GB (IQ3_M), 5,5 GB (Q4_K_S), 5,7 GB (Q4_K_M), 6,6 GB (Q5_K_M) y 7,5 GB (Q6_K). Añadir entre 1 y 3 GB adicionales para la caché KV según la longitud de contexto.
- GPU recomendadas: para cuantizaciones Q4-Q6, una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 de 24 GB son suficientes; para despliegues con mayor concurrencia, A100 o H100 con vLLM (si bien vLLM requiere pesos en safetensors, no GGUF).
- Compatibilidad con GPU de consumo: sí, en todas las cuantizaciones indicadas; las de 4 bits caben incluso en GPUs de 8 GB con contexto moderado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; para el modelo base en safetensors, transformers, TGI o vLLM.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| HuatuoGPT-3-9B-i1-GGUF (este) | ~8,95 B | no disponible | Apache 2.0 | GGUF (i1) | Especializado en dominio médico, cuantizaciones imatrix |
| HuatuoGPT-3-9B (base) | ~8,95 B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| HuatuoGPT-3-9B-GGUF (estático) | ~8,95 B | no disponible | Apache 2.0 | GGUF (estático) | Cuantizaciones sin imatrix, menor calidad en niveles bajos |
| Alternativas médicas de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; como modelo entrenado predominantemente en inglés, es probable que presente sesgos lingüísticos y culturales, pero no se confirma.
- Riesgo de alucinación: elevado en dominio médico, donde la generación de información incorrecta puede tener consecuencias graves; se recomienda supervisión humana obligatoria.
- Limitaciones de contexto o idioma: solo se declara inglés; no se confirma la longitud de contexto ni el soporte de castellano.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero no exime del cumplimiento de normativas sanitarias (por ejemplo, MDR en la UE) si se usa en productos clínicos.
- Caveats para producción: las cuantizaciones de 1-2 bits (IQ1, IQ2) degradan notablemente la calidad; para uso real se recomienda Q4_K_M o superior. No se han publicado evaluaciones de seguridad ni de robustez clínica.
- Advertencia: este modelo no debe utilizarse como sustituto del juicio clínico profesional.

## Enlaces

- Repositorio Hugging Face de esta versión: https://huggingface.co/mradermacher/HuatuoGPT-3-9B-i1-GGUF
- Modelo base original: https://huggingface.co/FreedomIntelligence/HuatuoGPT-3-9B
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/HuatuoGPT-3-9B-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#HuatuoGPT-3-9B-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
