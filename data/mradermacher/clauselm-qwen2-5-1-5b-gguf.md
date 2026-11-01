# mradermacher/ClauseLM-Qwen2.5-1.5B-GGUF

## Resumen

ClauseLM-Qwen2.5-1.5B es un modelo lingüístico especializado en el dominio jurídico, centrado en la extracción de información y el análisis de cláusulas contractuales. Fue desarrollado por Z-Nadjib a partir de Qwen2.5-1.5B como modelo base, aplicando un ajuste fino mediante QLoRA con la librería Unsloth sobre el dataset CUAD (Contract Understanding Atticus Dataset), un corpus de referencia para la comprensión de contratos legales en inglés. Este repositorio concreto, publicado por mradermacher, no es el modelo original sino una colección de cuantizaciones estáticas en formato GGUF del modelo base, pensadas para su ejecución local con llama.cpp y derivados.

Su relevancia radica en la combinación de un tamaño muy reducido (1.543.714.304 parámetros, aproximadamente 1,54B) con una especialización en tareas de extracción estructurada de cláusulas contractuales, un área donde normalmente se recurre a modelos mucho mayores. Al ser tan ligero, puede ejecutarse en hardware de consumo, incluso en portátiles sin GPU dedicada, lo que lo hace atractivo para prototipado de herramientas legales, revisión automatizada de contratos y pipelines de procesamiento documental con requisitos de privacidad (procesamiento 100% local).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en Qwen2.5), ajustado con QLoRA |
| Parametros totales | 1.543.714.304 (~1,54B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la del Qwen2.5 base suele ser 32.768 tokens, pero no consta en la ficha) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (entrenado con dataset CUAD en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); el modelo original está en transformers/safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B, un transformer decoder denso (no MoE) de la familia Qwen de Alibaba. Sobre él se aplicó un ajuste fino eficiente en parámetros mediante QLoRA, utilizando el framework Unsloth, que optimiza la velocidad y el consumo de memoria durante el entrenamiento de LoRA. El dataset de entrenamiento es theatticusproject/cuad (CUAD), un conjunto de datos anotado por abogados con más de 500 contratos comerciales etiquetados según 41 tipos de cláusulas legales relevantes, diseñado para tareas de comprensión y extracción contractual.

El resultado es un modelo afinado para salida estructurada (JSON) en tareas de información extraction sobre texto legal. No se dispone de información sobre el número exacto de tokens de entrenamiento, hiperparámetros concretos ni procesos posteriores tipo RLHF o DPO. Este repositorio de mradermacher añade únicamente cuantizaciones estáticas GGUF (conversión desde los pesos originales en HuggingFace), sin cuantizaciones weighted/imatrix disponibles en el momento de publicación.

## Capacidades

- Extracción de información de contratos legales en inglés, identificando tipos de cláusulas según la taxonomía de CUAD (41 categorías).
- Generación de salida estructurada en JSON, adecuada para integración en pipelines automáticos de procesamiento documental.
- Comprensión de lenguaje jurídico-comercial en inglés (contratos, acuerdos, licencias).
- Generación de texto conversacional heredada del modelo base Qwen2.5-1.5B, aunque con rendimiento de modelo general limitado por su tamaño.
- No se ha documentado soporte específico de tool calling, function calling ni capacidades de agente en la model card.
- No incluye capacidades multimodales (visión, audio); es un modelo de texto exclusivamente.

## Casos de uso

- Revisión automatizada de contratos: dado un contrato comercial en inglés, el modelo puede identificar y clasificar cláusulas de riesgo (indemnización, limitación de responsabilidad, cambio de control) y devolverlas en JSON para su revisión por un abogado.
- Due diligence documental a escala: procesamiento por lotes de cientos de contratos para detectar la presencia o ausencia de cláusulas críticas antes de una fusión o adquisición, aprovechando que puede correr en CPU sin coste de GPU.
- Sistemas de gestión contractual (CLM): integración como módulo de extracción que alimenta bases de datos estructuradas a partir de repositorios de contratos en PDF o texto.
- Verificación de cumplimiento (compliance): comprobación automática de que los contratos de proveedores incluyen las cláusulas exigidas por política interna.
- Prototipado de herramientas legales con privacidad: al ejecutarse localmente con llama.cpp u Ollama, permite procesar documentos confidenciales sin enviarlos a APIs externas.
- Anotación asistida de datasets jurídicos: preetiquetado de cláusulas en corpus nuevos para reducir el coste de anotación manual.
- Asistente conversacional sobre cláusulas: en un pipeline RAG, puede resumir o responder preguntas sobre cláusulas previamente extraídas, aunque su tamaño limita la fiabilidad del razonamiento jurídico complejo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Tampoco constan evaluaciones sobre CUAD (por ejemplo, F1 en extracción de cláusulas) ni comparativas con el modelo base Qwen2.5-1.5B sin ajustar.

## Requisitos de hardware

- VRAM / memoria estimada para inferencia: el tamaño del archivo GGUF es un buen indicador. Q2_K ocupa ~0,8 GB, Q4_K_M ~1,1 GB y Q8_0 ~1,7 GB; añade margen para el KV cache según la longitud de contexto. En la práctica, 2-4 GB de RAM o VRAM bastan para las cuantizaciones medias.
- Cabe con holgura en GPUs de consumo: cualquier GPU moderna (RTX 3060, RTX 4060, RTX 4090) lo ejecuta íntegramente, e incluso funciona con velocidad aceptable solo con CPU en portátiles, dado su tamaño inferior a 2 GB en la mayoría de cuants.
- GPUs de datacenter (A100, H100) no son necesarias; su uso solo se justifica en servidores con alta concurrencia de peticiones.
- Despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp o cualquier runtime compatible con GGUF. También puede usarse el modelo original en safetensors con transformers y vLLM/TGI.
- Latencia y throughput: no disponibles; por su tamaño (~1,5B parámetros), se esperan velocidades altas incluso en CPU, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Especialización | Licencia | Formato |
|---|---|---|---|---|
| ClauseLM-Qwen2.5-1.5B (este) | 1,54B | Extracción de cláusulas contractuales (CUAD) | Apache 2.0 | GGUF / safetensors |
| Qwen2.5-1.5B (base) | 1,54B | Modelo general multilingüe | Qwen Research (uso comercial sujeto a licencia) | safetensors / GGUF |
| LegalBERT / CuBERT | ~110M-340M | Comprensión de texto legal (encoder, no generativo) | no disponible | safetensors |
| Llama 3.2 1B Instruct | 1,24B | General, instrucciones | Llama 3.2 Community License | safetensors / GGUF |

Frente al modelo base Qwen2.5-1.5B, esta variante aporta especialización en el dominio legal con la ventaja añadida de una licencia Apache 2.0 más permisiva. Frente a modelos tipo BERT jurídicos, ofrece generación estructurada y conversación, no solo clasificación. Frente a Llama 3.2 1B, es más especializado pero de uso general menos contrastado.

## Limitaciones y advertencias

- Idioma: entrenado para inglés (dataset CUAD); su rendimiento sobre contratos en castellano u otros idiomas no está verificado y probablemente sea significativamente peor.
- Tamaño: con ~1,5B parámetros, es propenso a alucinaciones y a errores en razonamiento jurídico complejo; su salida debe revisarse siempre por un profesional, no sustituye asesoría legal.
- Sesgos: hereda los sesgos del corpus CUAD (contratos comerciales anglosajones) y de Qwen2.5; puede reflejar sesgos del derecho estadounidense/inglés y no generalizar a otras jurisdicciones.
- Las cuantizaciones bajas (Q2_K, Q3_K_S/M) pueden degradar la calidad de la salida estructurada JSON; se recomienda Q4_K_M o superior para producción.
- No hay benchmarks publicados que validen su rendimiento frente al modelo base, por lo que conviene evaluarlo con datos propios antes de usarlo en producción.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución sin restricciones relevantes más allá de conservar el aviso de licencia.
- Los tags de HuggingFace lo marcan como conversational, pero su especialización es la extracción estructurada; no esperar rendimiento de chat general comparable a modelos instruct de mayor tamaño.

## Enlaces

- Repositorio GGUF (este): https://huggingface.co/mradermacher/ClauseLM-Qwen2.5-1.5B-GGUF
- Modelo original: https://huggingface.co/Z-Nadjib/ClauseLM-Qwen2.5-1.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Dataset CUAD: https://huggingface.co/datasets/theatticusproject/cuad
- Página de descargas de mradermacher: https://hf.tst.eu/model#ClauseLM-Qwen2.5-1.5B-GGUF
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Web de nethype GmbH: https://www.nethype.de/
