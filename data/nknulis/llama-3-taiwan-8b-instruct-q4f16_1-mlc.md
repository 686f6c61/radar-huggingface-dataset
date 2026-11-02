# NKNULis/Llama-3-Taiwan-8B-Instruct-q4f16_1-MLC

## Resumen

Llama-3-Taiwan-8B-Instruct-q4f16_1-MLC es una conversión al formato MLC (Machine Learning Compilation) del modelo yentinglin/Llama-3-Taiwan-8B-Instruct, un ajuste fino del Meta Llama 3 de 8B orientado al chino tradicional y al contexto taiwanés. La conversión la publica la Biblioteca y Servicios de Información de la Universidad Nacional de Kaohsiung Normal University (NKNU) para alimentar un asistente WebLLM de campus que se ejecuta íntegramente en el navegador.

El modelo emplea una cuantización de 4 bits por grupos (`q4f16_1`), con pesos en formato MLC para inferencia WebGPU mediante WebLLM. Al conservar la arquitectura idéntica a Meta-Llama-3-8B-Instruct, puede ejecutarse con la librería precompilada de WebLLM para Llama 3 8B, lo que simplifica el despliegue sin necesidad de compilar kernels específicos.

Su relevancia radica en dos factores: por un lado, demuestra el flujo de conversión de un modelo ajustado regionalmente (chino tradicional) al ecosistema MLC/WebLLM para ejecución local en cliente; por otro, ilustra las limitaciones prácticas de ese proceso, ya que el autor eliminó dos tokens extra del vocabulario (ids 128256–128257) para encajar con la librería precompilada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (idéntica a Meta-Llama-3-8B-Instruct) |
| Parametros totales | 8B (aproximado, heredado del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Llama 3 8B soporta 8192 tokens) |
| Tipos de cuantizacion | q4f16_1 (4 bits por grupos, activaciones en float16) |
| Idiomas soportados | zh (chino tradicional), en |
| Licencia | llama3 (Meta Llama 3 Community License) |
| Formato de pesos | MLC (compilado para WebLLM/WebGPU) |

## Arquitectura y entrenamiento

La arquitectura es la de Meta-Llama-3-8B-Instruct: un transformer decoder-only con atención multi-cabeza agrupada (GQA), normalización RMSNorm y activaciones SwiGLU. La model card indica explícitamente que la arquitectura es idéntica al modelo original de Meta, sin modificaciones estructurales. El ajuste fino original (yentinglin/Llama-3-Taiwan-8B-Instruct) está orientado al chino tradicional; no se detallan en la información disponible los datos de entrenamiento, el número de tokens ni si se emplearon técnicas de RLHF o DPO.

La conversión a MLC aplica cuantización de 4 bits por grupos (`q4f16_1`) y compila los pesos para ejecución en WebGPU. Un detalle técnico relevante: el vocabulario original del modelo base incluía dos tokens ChatML adicionales (`<|im_end|>` y `<|im_start|>`, ids 128256–128257) que el formato de chat de Llama 3 no utiliza; el autor los eliminó de la capa de embeddings, de la capa de salida y del tokenizador para que el vocabulario (128256 tokens) coincidiera con la librería precompilada de WebLLM `Llama-3-8B-Instruct-q4f16_1_cs1k-webgpu.wasm` (versión de model lib `v0_2_84`).

## Capacidades

- Generación de texto conversacional en chino tradicional e inglés, heredada del ajuste fino taiwanés.
- Razonamiento general y respuesta a instrucciones en formato chat de Llama 3.
- Ejecución en navegador mediante WebLLM sobre WebGPU, sin servidor backend.
- Soporte de conversaciones multi-turno (la plantilla de chat no incluye bloque de sistema).
- Capacidades de código y matemáticas: no verificadas en la información disponible para este ajuste específico.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Asistente de campus en navegador: el modelo está publicado específicamente para el asistente WebLLM de la biblioteca de NKNU; se ejecuta en el cliente del usuario vía WebGPU, sin enviar consultas a un servidor, lo que reduce costes de infraestructura y mejora la privacidad.
- Atención a usuarios en chino tradicional: adecuado para consultas y respuestas en registro taiwanés, útil en servicios de biblioteca, orientación académica o soporte interno.
- Demostraciones de inferencia local sin backend: permite desplegar un chatbot funcional en una página web estática, útil para prototipos, ferias tecnológicas o entornos con conectividad limitada.
- Procesamiento de documentos con privacidad estricta: al ejecutarse en el dispositivo, puede resumir o responder sobre texto sensible sin que este abandone el navegador del usuario.
- Evaluación del pipeline MLC/WebLLM: sirve como referencia práctica para equipos que quieran convertir sus propios ajustes de Llama 3 8B al formato MLC y reutilizar librerías precompiladas.
- Educación e investigación sobre cuantización: permite estudiar el impacto de `q4f16_1` en la calidad de un modelo de 8B en un entorno de navegador reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 4,5 GB, coherente con una cuantización de 4 bits de un modelo de 8B; se requiere memoria de GPU suficiente para cargar los pesos y el contexto (orientativamente 5–6 GB).
- GPU recomendadas: cualquier GPU de escritorio con soporte de `shader-f16` en WebGPU; la model card indica que se requiere una GPU de escritorio con esa extensión.
- ¿Cabe en GPU de consumo? Sí, en principio, en GPUs de escritorio con WebGPU y `shader-f16`; no se especifican modelos concretos en la información disponible.
- Opciones de despliegue: WebLLM (navegador, WebGPU) con la librería `Llama-3-8B-Instruct-q4f16_1_cs1k-webgpu.wasm` (model lib `v0_2_84`); también el ecosistema MLC-LLM para ejecución nativa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Despliegue |
|---|---|---|---|---|---|
| Llama-3-Taiwan-8B-Instruct-q4f16_1-MLC (este) | 8B | no disponible | q4f16_1 (4 bits) | llama3 | WebLLM / MLC |
| yentinglin/Llama-3-Taiwan-8B-Instruct | 8B | no disponible | pesos originales (bf16/fp16) | llama3 | vLLM, TGI, transformers |
| Meta-Llama-3-8B-Instruct | 8B | 8192 | múltiples (GGUF, AWQ, etc.) | llama3 | amplia variedad |

La diferencia principal frente al modelo base taiwanés es el formato y la cuantización: este repositorio está optimizado para inferencia en navegador, mientras que el original está pensado para servidores. Frente a Llama 3 8B Instruct de Meta, comparte arquitectura y licencia, pero añade el ajuste al chino tradicional y elimina los tokens ChatML extra para compatibilidad con WebLLM.

## Limitaciones y advertencias

- La plantilla de chat no incluye bloque de sistema, lo que limita la personalización del comportamiento mediante instrucciones de sistema.
- Se eliminaron dos tokens del vocabulario (ids 128256–128257); aunque no los usa el formato de chat de Llama 3, cualquier flujo que dependiera de ellos fallaría.
- Requiere GPU de escritorio con `shader-f16`; no es apto para navegadores o dispositivos sin WebGPU compatible.
- Licencia Meta Llama 3 Community License: el uso comercial está sujeto a la Acceptable Use Policy de Meta y a las condiciones de la licencia, que deben revisarse antes de producción.
- Riesgo de alucinación inherente a los modelos de 8B, especialmente en dominios especializados.
- La cuantización de 4 bits puede degradar la calidad respecto a los pesos originales; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- Idiomas limitados a chino tradicional e inglés; el rendimiento en otros idiomas no está verificado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- [HuggingFace: NKNULis/Llama-3-Taiwan-8B-Instruct-q4f16_1-MLC](https://huggingface.co/NKNULis/Llama-3-Taiwan-8B-Instruct-q4f16_1-MLC)
- [Modelo base: yentinglin/Llama-3-Taiwan-8B-Instruct](https://huggingface.co/yentinglin/Llama-3-Taiwan-8B-Instruct)
- [MLC LLM](https://llm.mlc.ai/)
- [WebLLM (GitHub)](https://github.com/mlc-ai/web-llm)
- [Meta Llama 3 Acceptable Use Policy](https://llama.meta.com/llama3/use-policy)
