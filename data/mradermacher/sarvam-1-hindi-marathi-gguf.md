# mradermacher/sarvam-1-hindi-marathi-GGUF

## Resumen

El repositorio `mradermacher/sarvam-1-hindi-marathi-GGUF` contiene las cuantizaciones estáticas en formato GGUF del modelo `vennyvirtuoso/sarvam-1-hindi-marathi`, un ajuste fino completo (full fine-tuning) del modelo base Sarvam-1 orientado a la traducción automática entre hindi (hi) y marathi (mr). Mradermacher actúa aquí únicamente como cuantizador: no entrena el modelo, sino que convierte los pesos originales en safetensors a una familia de ficheros GGUF para su uso con llama.cpp y herramientas compatibles.

El modelo original es un transformer causal-LM de aproximadamente 2.525 millones de parámetros (2,5 B), derivado del modelo Sarvam-1 de la empresa india Sarvam AI. El ajuste fino se ha realizado sobre el checkpoint base para especializarlo en un par de idiomas concreto del subcontinente indio, una tarea donde los modelos generalistas suelen rendir por debajo de lo esperado por la escasez relativa de datos paralelos de calidad.

La relevancia de esta ficha radica en su utilidad práctica: ofrece un modelo de traducción hindi-marathi de tamaño medio (2,5 B) con licencia Apache 2.0, cuantizaciones que caben en GPU de consumo (desde 1,1 GB en Q2_K hasta 5,2 GB en f16) y compatibilidad con el ecosistema GGUF. Es una opción realista para despliegues en local o en servidores modestos sin depender de APIs de terceros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal-LM (derivado de Sarvam-1); detalles de capas y atención no disponibles |
| Parámetros totales | 2.525.087.744 (2,5 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | hindi (hi), marathi (mr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base original está en safetensors) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Sarvam-1 (número de capas, dimensión oculta, cabezas de atención, tipo de positional encoding, etc.). Lo que sí se sabe es que se trata de un transformer causal-LM, es decir, un modelo autorregresivo de decodificación, y que el ajuste fino se ha realizado mediante full fine-tuning (no LoRA ni adaptadores) sobre el checkpoint `vennyvirtuoso/sarvam-1-hindi-marathi`, según las etiquetas del repositorio.

No se han publicado en la información proporcionada los datos de entrenamiento: no se conoce el número de tokens utilizados, la composición del corpus paralelo hindi-marathi, ni si hubo fases de RLHF, DPO o SFT adicionales. Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). El valor añadido de este repositorio concreto es la conversión a GGUF con cuantizaciones estáticas (no imatrix/weighted, según indica el propio autor), lo que permite ejecutar el modelo en CPU y GPU con llama.cpp.

## Capacidades

- Traducción automática bidireccional entre hindi y marathi, tarea principal para la que fue ajustado el modelo.
- Generación de texto autorregresiva en hindi y marathi (es un causal-LM, por lo que puede producir texto libre en ambos idiomas).
- Conversación multi-turno: la etiqueta `conversational` sugiere que el modelo admite formato de diálogo, aunque no se detalla la plantilla de chat.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües limitadas a los dos idiomas declarados (hi, mr); no hay evidencia de soporte de inglés u otros idiomas.
- No se documentan capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Traducción de documentación administrativa entre hindi y marathi: el modelo puede traducir textos oficiales, formularios y comunicaciones institucionales entre ambos idiomas, un par relevante en estados indios donde conviven ambas lenguas, con la ventaja de ejecutarse en local sin enviar datos sensibles a APIs externas.
- Localización de interfaces y contenido web: integración en pipelines de localización para generar versiones en hindi y marathi de textos de producto, menús o ayuda contextual, usando las cuantizaciones Q4_K_M (1,6 GB) para despliegues con requisitos de latencia moderados.
- Subtitulado y traducción de contenido audiovisual: transcripción previa con un ASR y traducción posterior con este modelo para generar subtítulos cruzados hi↔mr en plataformas de vídeo regionales.
- Atención al ciudadano en organismos públicos: despliegue en servidores on-premise para traducir consultas y respuestas entre hindi y marathi en ventanillas o chatbots institucionales, con la licencia Apache 2.0 permitiendo uso comercial y gubernamental sin restricciones.
- Investigación en traducción automática de lenguas indic: el modelo sirve como baseline o punto de partida para experimentos de fine-tuning adicional, evaluación de cuantizaciones o comparación con modelos multilingües más grandes en el par hi-mr.
- Procesamiento de corpus paralelos: uso del modelo para alinear o generar datos paralelos hi-mr que alimenten otros sistemas de traducción o estudios lingüísticos, ejecutándose en lote sobre CPU con llama.cpp y la cuantización Q8_0 (2,8 GB) para maximizar calidad.
- Traducción en dispositivos con recursos limitados: la cuantización Q2_K (1,1 GB) permite ejecutar el modelo en portátiles sin GPU dedicada o en entornos edge, útil para aplicaciones de traducción offline en zonas con conectividad limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, orientativo):
  - Q2_K: ~1,1 GB de pesos; ~1,5-2 GB de VRAM total con contexto moderado.
  - Q4_K_M: ~1,6 GB de pesos; ~2-2,5 GB de VRAM total.
  - Q8_0: ~2,8 GB de pesos; ~3,5-4 GB de VRAM total.
  - f16: ~5,2 GB de pesos; ~6-7 GB de VRAM total.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 sobran para este tamaño. Para f16, una RTX 3060 12 GB o superior es suficiente.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones, incluidas tarjetas de gama de entrada con 6-8 GB (GTX 1660, RTX 3050, RTX 4060).
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI mediante llama.cpp server. No es compatible directamente con vLLM o TGI en su forma GGUF (requerirían los pesos originales en safetensors).
- Latencia y throughput estimados: no disponibles en la información proporcionada. Al ser un modelo de 2,5 B, se espera un throughput alto en GPU modernas y aceptable en CPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| sarvam-1-hindi-marathi (este) | 2,5 B | no disponible | hi, mr | Apache 2.0 | GGUF / safetensors |
| IndicTrans2 (AI4Bharat) | no disponible en la información | no disponible | 22 lenguas indic | no disponible en la información | no disponible |
| NLLB-200 (Meta) | 600 M - 54 B (varias tallas) | no disponible | 200 idiomas | CC-BY-NC 4.0 (no comercial) | safetensors |
| Sarvam-1 (base, Sarvam AI) | no disponible en la información | no disponible | multilingüe indic | no disponible en la información | no disponible |

La comparación con IndicTrans2 y NLLB-200 es pertinente por categoría (traducción de lenguas indic), pero los datos concretos de parámetros, contexto y rendimiento de esos modelos no están incluidos en la información proporcionada, por lo que la tabla se limita a lo verificable. La ventaja diferencial de este modelo frente a NLLB-200 es la licencia Apache 2.0 (permite uso comercial) y el formato GGUF listo para llama.cpp; frente a IndicTrans2, la especialización en un único par de idiomas puede ofrecer mejor calidad a costa de menor cobertura.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al entrenarse sobre corpus paralelos hi-mr, puede heredar sesgos de género, casta o registro presentes en esos datos.
- Riesgo de alucinación: como todo modelo generativo, puede producir traducciones plausibles pero incorrectas, especialmente en frases largas, terminología técnica o dominios especializados. No se han publicado métricas (BLEU, chrF, COMET) que cuantifiquen este riesgo.
- Limitaciones de contexto e idioma: solo soporta hindi y marathi; no se debe esperar buen rendimiento en inglés u otras lenguas. La longitud de contexto no está documentada, lo que dificulta planificar el truncado en producción.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no obstante, conviene verificar la licencia del modelo base original (`vennyvirtuoso/sarvam-1-hindi-marathi`) y de Sarvam-1, ya que la información disponible no detalla posibles condiciones adicionales.
- Caveats para producción: las cuantizaciones son estáticas (sin imatrix/weighted), por lo que la calidad en Q2_K y Q3 puede degradarse más que en cuantizaciones ponderadas; el autor recomienda Q4_K_S/Q4_K_M como equilibrio velocidad/calidad y Q8_0 para máxima calidad. El repositorio tiene 0 likes y 655 descargas, lo que indica escasa validación comunitaria; no hay benchmarks publicados que respalden la calidad de la traducción.
- El modelo no está diseñado para tool calling ni agentes; su uso en esos escenarios requeriría capas externas de orquestación no documentadas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/sarvam-1-hindi-marathi-GGUF
- Modelo base del ajuste fino: https://huggingface.co/vennyvirtuoso/sarvam-1-hindi-marathi
- Página de conveniencia del cuantizador: https://hf.tst.eu/model#sarvam-1-hindi-marathi-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
