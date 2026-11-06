# Nekodeus/vicuna-7b-v1.5-openvino

## Resumen

Vicuna-7B-v1.5 OpenVINO (INT8) es una conversión del modelo conversacional Vicuna-7B-v1.5 de LMSYS al formato OpenVINO IR con cuantización de pesos a INT8, publicada por el usuario Nekodeus en Hugging Face. El modelo base es un transformer decoder-only de tipo LlamaForCausalLM con 7.000 millones de parámetros, obtenido mediante fine-tuning supervisado de Llama-2-7b sobre aproximadamente 125.000 conversaciones de ShareGPT. Esta versión concreta no introduce cambios en los pesos más allá de la cuantización: su valor está en empaquetar el modelo para inferencia eficiente en CPU mediante el runtime de Intel.

La relevancia de esta ficha es doble. Por un lado, documenta un artefacto de despliegue (OpenVINO IR) que permite ejecutar un LLM de 7B en hardware Intel sin GPU dedicada, algo útil en entornos de borde, portátiles y servidores sin acelerador. Por otro, sirve como ejemplo de cadena de conversión reproducible con `optimum-cli` y `optimum-intel`. El repositorio ocupa 6,7 GB y se distribuye bajo licencia Llama 2.

Cabe señalar que el modelo base Vicuna-7B-v1.5 es de 2023 y ha sido ampliamente superado por modelos posteriores en razonamiento, código y seguimiento de instrucciones. Esta conversión debe evaluarse como una opción de despliegue de bajo coste en CPU, no como un modelo de referencia en calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LlamaForCausalLM) |
| Parametros totales | 7.000 millones (7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (según model card del artefacto); 2048 tokens según referencia del modelo base |
| Tipos de cuantizacion | Pesos INT8 (NNCF, weight-only); activaciones FP16/FP32 según trazado |
| Idiomas soportados | no disponible (el modelo base está orientado principalmente al inglés) |
| Licencia | Llama 2 |
| Formato de pesos | OpenVINO IR (openvino_model, openvino_tokenizer, openvino_detokenizer) |

## Arquitectura y entrenamiento

El modelo base Vicuna-7B-v1.5 es un transformer decoder-only con la arquitectura estándar de Llama 2 (atención multi-cabeza con RoPE, normalización RMSNorm, activación SwiGLU, 32 capas, dimensión oculta 4096). Se obtuvo por fine-tuning supervisado de Llama-2-7b sobre aproximadamente 125.000 conversaciones de usuario recopiladas de ShareGPT, sin una fase de RLHF documentada en la información disponible. El resultado es un modelo afinado para diálogo multi-turno con formato de prompt `USER: ... ASSISTANT:`.

La conversión a OpenVINO se realizó con `optimum-intel 2.2.0`, `openvino 2026.4.1` y `transformers 5.16.1`, aplicando cuantización de pesos a INT8 mediante NNCF en modo weight-only. El artefacto se compone de tres partes (modelo, tokenizer y detokenizer) y se generó en un entorno Kaggle solo CPU, completamente offline. La model card documenta un workaround: se fijó `transformers==5.16.1` porque la imagen de Kaggle incluía la 5.20.2, que eliminó `VisionRotaryEmbedding`, símbolo que importa `optimum-intel 2.2.0`; además se saltó el gate legacy `MAX_TRANSFORMERS_VERSION` de optimum. No se documentan innovaciones arquitectónicas propias más allá de la cuantización y el empaquetado para OpenVINO.

## Capacidades

- Generación de texto conversacional multi-turno en formato USER/ASSISTANT.
- Seguimiento de instrucciones básico, heredado del fine-tuning sobre ShareGPT.
- Razonamiento de propósito general y respuesta a preguntas.
- Generación de código y explicaciones técnicas a nivel básico (no es un modelo especializado).
- Matemáticas elementales y razonamiento aritmético simple.
- Capacidad multilingüe limitada y no documentada; el modelo base está centrado en inglés.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso estructurado.
- No dispone de visión, audio ni modo de pensamiento explícito.
- Inferencia en CPU mediante OpenVINO GenAI u `optimum-intel`.

## Casos de uso

- Asistente conversacional local en portátiles o mini-PC con CPU Intel: el modelo se ejecuta vía OpenVINO GenAI sin GPU, con 4K de contexto suficiente para diálogos de varias rondas.
- Prototipado y demos offline en entornos sin conectividad: el artefacto es autocontenido (6,7 GB) y no requiere descargas adicionales en tiempo de ejecución.
- Generación de texto en el borde (edge computing): adecuado para dispositivos industriales o kioscos con CPU Intel donde no cabe una GPU.
- Chatbot de soporte de bajo coste para dominios acotados: con prompts de sistema restrictivos y validación posterior, puede gestionar FAQ y conversaciones guiadas.
- Experimentación académica con cuantización INT8: sirve como caso de estudio de la cadena `optimum-cli export openvino --weight-format int8` y de su impacto en calidad.
- Generación de borradores y resúmenes de documentos cortos: con contexto de 4K tokens puede procesar correos, notas o fragmentos de documentación.
- Base para fine-tuning ligero o evaluación comparativa de pipelines OpenVINO frente a GGUF/llama.cpp en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica para el artefacto principal, diseñado para CPU; el repositorio ocupa 6,7 GB en disco.
- Memoria RAM estimada: en torno a 8-10 GB para cargar el modelo INT8 y el tokenizer con overhead del runtime; no confirmado en la información disponible.
- GPU: no es el objetivo del artefacto; puede ejecutarse en CPU Intel (y potencialmente en iGPU con OpenVINO GPU plugin, no documentado).
- GPU de consumo: no procede; para GPU se recomienda usar el modelo base o variantes GGUF/AWQ.
- Despliegue: OpenVINO GenAI (`ov::genai::LLMPipeline`) u `optimum-intel` (`OVModelForCausalLM`). No se documenta soporte de vLLM, TGI ni llama.cpp para este artefacto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Nekodeus/vicuna-7b-v1.5-openvino | 7B | 4096 (artefacto) / 2048 (base) | OpenVINO IR INT8 | Llama 2 | Optimizado para CPU Intel |
| lmsys/vicuna-7b-v1.5 | 7B | 2048 | safetensors FP16 | Llama 2 | Modelo base original |
| TheBloke/vicuna-7B-v1.5-GGML | 7B | 2048 | GGML (obsoleto) | Llama 2 | Variante histórica para llama.cpp, ya no soportada |
| Variantes GGUF de Vicuna 7B v1.5 | 7B | 2048 | GGUF | Llama 2 | Despliegue en CPU/GPU vía llama.cpp y Ollama |

## Limitaciones y advertencias

- Modelo base de 2023: su calidad en razonamiento, código y matemáticas está por debajo de modelos actuales de 7B.
- Riesgo de alucinación inherente a los LLM de esta generación, sin mitigaciones específicas documentadas.
- Contexto efectivo limitado: la model card del artefacto indica 4096, pero la referencia del modelo base cita 2048; conviene validar el comportamiento real en prompts largos.
- Idiomas no documentados; el rendimiento en castellano no está garantizado y probablemente sea inferior al inglés.
- Sin soporte documentado de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.
- Licencia Llama 2: impone restricciones de uso comercial (umbral de 700 millones de usuarios mensuales, obligaciones de atribución y política de uso aceptable); revisar antes de producción.
- Artefacto con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de calidad tras la cuantización INT8.
- Dependencias frágiles: la conversión requirió fijar `transformers==5.16.1` y saltar un gate de versión de optimum, lo que puede complicar la reproducibilidad.
- Formato OpenVINO IR: no es portable a runtimes no Intel sin reconversión.

## Enlaces

- Hugging Face del artefacto: https://huggingface.co/Nekodeus/vicuna-7b-v1.5-openvino
- Modelo base: https://huggingface.co/lmsys/vicuna-7b-v1.5
- Referencia del modelo base: https://www.llmreference.com/model/vicuna-7b-v1.5
- Variante GGML histórica: https://huggingface.co/TheBloke/vicuna-7B-v1.5-GGML
- OpenVINO GenAI: https://github.com/openvinotoolkit/openvino.genai
- optimum-intel: https://github.com/huggingface/optimum-intel
