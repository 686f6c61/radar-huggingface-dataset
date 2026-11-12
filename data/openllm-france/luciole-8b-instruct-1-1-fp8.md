# OpenLLM-France/Luciole-8B-Instruct-1.1-FP8

## Resumen

Luciole-8B-Instruct-1.1-FP8 es la versión cuantizada a FP8 del modelo Luciole-8B-Instruct-1.1, desarrollado por LINAGORA dentro del consorcio OpenLLM-France (proyecto financiado por Bpifrance en el marco de France 2030). Se trata de un modelo de generación de texto orientado a conversación, con especial énfasis en el idioma francés y soporte secundario de inglés. Esta variante FP8 emplea el formato de compresión de compressed-tensors y se ha cuantizado con LLM Compressor, pensándose para su despliegue con vLLM.

El modelo base cuenta con 8.075.686.912 parámetros (aproximadamente 8B) y su arquitectura se etiqueta como `nemotron_h`, lo que sugiere una base derivada de la familia Nemotron de NVIDIA adaptada por el consorcio. La versión FP8 reduce el peso del repositorio a unos 9,1 GB, lo que facilita su servicio en GPUs con soporte nativo de FP8 (arquitecturas Hopper, Ada Lovelace y Blackwell).

Su relevancia actual radica en dos factores: por un lado, refuerza el ecosistema de modelos abiertos en francés, un idioma tradicionalmente infrarrepresentado en los grandes modelos; por otro, ofrece una ruta de despliegue de alta eficiencia mediante cuantización FP8 y vLLM, con licencia Apache 2.0 que permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | nemotron_h (transformer, según tag del repositorio) |
| Parámetros totales | 8.075.686.912 (~8B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 (formato compressed-tensors, cuantizado con LLM Compressor) |
| Idiomas soportados | francés (fr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), requiere `custom_code` |

## Arquitectura y entrenamiento

La información disponible indica que el modelo se basa en la arquitectura etiquetada como `nemotron_h`, lo que apunta a una familia de transformers derivada del trabajo de NVIDIA en la serie Nemotron. El repositorio requiere `custom_code`, lo que implica que la implementación exacta del modelo no está cubierta por las clases estándar de transformers y necesita cargar código remoto del autor.

Esta variante FP8 no ha sido reentrenada: es una cuantización post-entrenamiento del modelo Luciole-8B-Instruct-1.1, realizada con LLM Compressor en el formato compressed-tensors. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo base empleó RLHF, DPO u otras técnicas de alineación. Tampoco se detallan innovaciones arquitectónicas específicas más allá de la cuantización FP8 para aceleración en inferencia.

## Capacidades

- Generación de texto conversacional multi-turno, con orientación principal al francés y soporte de inglés.
- Instrucción y seguimiento de directrices (variante Instruct), adecuada para asistentes y chat.
- Generación de texto general (pipeline `text-generation`).
- Capacidad de razonamiento y respuesta a preguntas en los idiomas cubiertos.
- No se documenta soporte de tool calling / function calling en la información disponible.
- No se documenta soporte explícito de agentes o multi-step reasoning.
- No se documenta capacidad de visión, audio ni modo "thinking".
- Aceleración FP8 en hardware compatible, lo que reduce el coste de memoria y puede aumentar el throughput frente al modelo en BF16.

## Casos de uso

- Asistencia conversacional en francés: despliegue de un chatbot que mantiene diálogos multi-turno en francés con calidad nativa, aprovechando el sesgo idiomático del modelo hacia ese idioma.
- Atención al cliente automatizada en mercados francófonos: integración en sistemas de soporte para responder consultas frecuentes, con la ventaja de una licencia Apache 2.0 que permite uso comercial sin royalties.
- Generación y reescritura de contenido en francés: redacción de textos, resúmenes y adaptaciones estilísticas para medios, marketing o documentación interna.
- Traducción asistida fr-en y en-fr: uso del modelo como motor de traducción en pipelines internos, dado el soporte bilingüe declarado.
- Despliegue de alto rendimiento con vLLM: servicio en producción mediante `vllm serve`, aprovechando FP8 en GPUs Hopper/Ada/Blackwell para reducir VRAM y aumentar la concurrencia.
- Prototipado e investigación en PLN francés: base para experimentos académicos o de evaluación de modelos abiertos en francés, con pesos descargables y licencia permisiva.
- Fine-tuning posterior sobre dominio específico: al ser Apache 2.0 y estar en safetensors, puede adaptarse con LoRA u otras técnicas sobre el modelo base o sobre esta variante cuantizada según el flujo de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: en torno a 8-9 GB solo para pesos, más overhead de KV cache y activaciones; se recomienda al menos 16-24 GB para contextos moderados.
- Aceleración FP8 nativa: requiere GPU NVIDIA Hopper (H100/H200), Ada Lovelace (L40S, RTX 4090) o Blackwell. En GPUs sin soporte FP8 el modelo puede no ofrecer ventaja o requerir conversión.
- GPU recomendadas: H100, H200, L40S para producción; RTX 4090 (24 GB) como opción consumer viable para FP8.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) y potencialmente en GPUs Ada de gama alta con suficiente VRAM; no se garantiza en GPUs con menos de 16 GB.
- Opciones de despliegue: vLLM es el runtime previsto (`vllm serve OpenLLM-France/Luciole-8B-Instruct-1.1-FP8`). Al ser formato compressed-tensors, no es directamente compatible con llama.cpp u Ollama sin conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Luciole-8B-Instruct-1.1-FP8 | ~8B | no disponible | fr, en | Apache 2.0 | safetensors FP8, vLLM |
| Luciole-8B-Instruct-1.1 (base) | ~8B | no disponible | fr, en | Apache 2.0 | safetensors (BF16 presumiblemente) |
| Alternativas 8B abiertas (p. ej. Llama 3.1 8B, Mistral 7B) | 7-8B | 32k-128k (según modelo) | multilingüe | licencias variables | safetensors, GGUF, vLLM |

No se dispone de datos de rendimiento comparativo del modelo frente a alternativas en la información proporcionada; la comparativa se limita a parámetros, licencia y formato de despliegue.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; como todo modelo entrenado con datos web, es probable que herede sesgos de esos corpus.
- Riesgo de alucinación: no cuantificado; el modelo puede generar información incorrecta, especialmente fuera de los dominios bien representados en francés e inglés.
- Limitaciones de idioma: solo se declaran francés e inglés; el rendimiento en otros idiomas (incluido el castellano) no está garantizado.
- Longitud de contexto: no especificada, lo que dificulta planificar casos de uso con documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no obstante, conviene revisar las condiciones del modelo base y de las dependencias (`custom_code`, compressed-tensors).
- Requiere hardware con FP8 nativo para aprovechar la cuantización; en hardware sin soporte puede degradarse el rendimiento o no funcionar como se espera.
- El uso de `custom_code` implica cargar código remoto del autor, lo que exige revisión de seguridad en entornos de producción.
- Escasa adopción hasta la fecha (75 descargas, 3 likes), lo que reduce la validación comunitaria y el soporte disponible.
- No se documentan capacidades de tool calling ni de agentes, por lo que no debe asumirse su disponibilidad en pipelines automatizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenLLM-France/Luciole-8B-Instruct-1.1-FP8
- Modelo base: https://huggingface.co/OpenLLM-France/Luciole-8B-Instruct-1.1
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- vLLM: https://github.com/vllm-project/vllm
