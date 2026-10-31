# amd/AMD-OLMo-1B-SFT-DPO_rai_1.9.0_m_1.0.1_npu

## Resumen

AMD-OLMo-1B-SFT-DPO_rai_1.9.0_m_1.0.1_npu es una versión optimizada del modelo AMD-OLMo 1B (basado en OLMo de Allen AI) adaptada por AMD para ejecutarse en la NPU (Neural Processing Unit) de los procesadores Ryzen AI. Se trata de un modelo de generación de texto conversacional con 1.000 millones de parámetros, alineado mediante SFT (supervised fine-tuning) y DPO (Direct Preference Optimization). La variante "m_1.0.1_npu" indica que los pesos se distribuyen en formato ONNX cuantizado para el flujo de trabajo de Ryzen AI Software (versión Rai 1.9.0).

Su relevancia radica en permitir inferencia de LLMs totalmente local y con bajo consumo en portátiles con NPU, sin depender de GPU dedicada ni de la nube. Es un modelo pequeño, monolingüe en inglés, pensado como punto de partida para asistentes locales y prototipado en hardware AMD. El acceso al repositorio está restringido (gated): requiere aceptar las condiciones de uso en HuggingFace antes de descargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en OLMo 1B) |
| Parametros totales | ~1B (1.000 millones) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | cuantizacion ONNX para NPU (detalle especifico no disponible) |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (cuantizado para Ryzen AI NPU) |

## Arquitectura y entrenamiento

El modelo parte de OLMo 1B, un transformer decoder abierto entrenado por Allen Institute for AI (AI2). AMD aplico un ajuste fino supervisado (SFT) seguido de DPO (Direct Preference Optimization) para alinear el modelo con preferencias humanas en dialogo, dando lugar a la variante SFT-DPO. La version aqui descrita no contiene los pesos originales en PyTorch, sino una conversion a ONNX optimizada para el compilador y runtime de Ryzen AI Software, orientada al MCDM (NPU) de las series Ryzen AI.

No se ha publicado en la ficha informacion detallada sobre el numero de tokens de preentrenamiento, composicion del dataset de SFT/DPO ni tecnicas de decodificacion especificas. La innovacion principal de esta release es la optimizacion de inferencia en NPU mediante el flujo de trabajo de Ryzen AI (Rai 1.9.0, modelo m_1.0.1_npu).

## Capacidades

- Generacion de texto conversacional en ingles (pipeline text-generation, etiqueta conversational).
- Modelo alineado con SFT + DPO, orientado a seguir instrucciones y mantener dialogo.
- Ejecucion local en NPU de Ryzen AI con bajo consumo energetico.
- No soporta vision, audio ni modalidades distintas de texto.
- No hay informacion publicada sobre soporte de tool calling, function calling ni capacidades agenticas.
- Capacidades de codigo, matematicas o razonamiento avanzadas limitadas por su tamano de 1B; no hay datos publicados al respecto.

## Casos de uso

- Asistente conversacional local en portatiles con Ryzen AI: ejecuta el dialogo directamente en la NPU sin conexion ni coste de API, adecuado para chatbasico en ingles.
- Prototipado de aplicaciones con LLM offline: permite a desarrolladores validar ideas de producto en hardware de consumo sin infraestructura en la nube.
- Resumen y redaccion de texto en el dispositivo: tareas de escritura corta donde la privacidad de los datos es prioritaria, ya que el texto no sale del equipo.
- Clasificacion y extraccion ligera de informacion: dada su huella de ~1B, es util para tareas de NLP sencillas integradas en aplicaciones de escritorio.
- Demostraciones y educacion: modelo pequeno y con licencia Apache-2.0, idoneo para ensenar inferencia de LLMs en edge con ONNX y Ryzen AI Software.
- Integracion en aplicaciones Windows con Ryzen AI Software: el formato ONNX y el flujo Rai facilitan su despliegue mediante las herramientas oficiales de AMD (ONNX Runtime con execution provider de NPU).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 0,9 GB, por lo que la huella en memoria para inferencia cuantizada en NPU es del orden de 1 GB; no requiere GPU discreta.
- Diseñado para ejecutarse en la NPU de procesadores AMD Ryzen AI (series Ryzen 7040/8040 y posteriores con XDNA). No hay datos publicados de VRAM para inferencia en GPU.
- Al ser un modelo de ~1B cuantizado, cabe comodamente en GPUs de consumo (por ejemplo RTX 3060 o superiores) si se usa el modelo base OLMo en formato GGUF o safetensors, aunque esta variante ONNX esta orientada a NPU.
- Despliegue recomendado: Ryzen AI Software (ONNX Runtime con execution provider para NPU). No hay informacion sobre compatibilidad con vLLM, llama.cpp, Ollama o TGI para esta variante concreta.
- No se han publicado cifras de latencia ni throughput; al tratarse de un modelo de 1B en NPU, se espera latencia de primera respuesta baja y consumo energetico reducido, pero sin datos oficiales concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Orientacion |
|---|---|---|---|---|
| AMD-OLMo-1B-SFT-DPO (esta ficha) | ~1B | ONNX para NPU | Apache-2.0 | Inferencia local en Ryzen AI NPU, ingles |
| OLMo 1B (AI2) | ~1B | safetensors / PyTorch | Apache-2.0 | Modelo base abierto, investigacion y fine-tuning |
| Phi-2 (Microsoft) | 2,7B | safetensors / ONNX | MIT | Razonamiento y codigo, tamano superior |
| TinyLlama 1.1B Chat | ~1,1B | safetensors / GGUF | Apache-2.0 | Chat generalista, ecosistema llama.cpp |

Frente a OLMo 1B original, esta variante añade alineacion SFT+DPO y optimizacion ONNX para NPU, pero pierde flexibilidad de despliegue en otros runtimes. Frente a TinyLlama 1.1B Chat, ofrece un flujo de despliegue integrado en hardware AMD a cambio de un ecosistema de herramientas mas limitado.

## Limitaciones y advertencias

- Monolingüe en ingles: no es adecuado para tareas en castellano ni otros idiomas.
- Con ~1B de parametros, sus capacidades de razonamiento, matematicas y generacion de codigo son limitadas; puede alucinar con frecuencia en preguntas factualies.
- No hay informacion publicada sobre longitud de contexto, lo que dificulta planificar aplicaciones con documentos largos o conversaciones multi-turno extensas.
- El acceso al repositorio es gated: hay que aceptar las condiciones en HuggingFace y la descarga esta vinculada a la cuenta.
- El formato ONNX para NPU limita el despliegue a hardware y software compatibles (Ryzen AI); no es directamente usable en llama.cpp, vLLM u Ollama sin conversion adicional.
- Sin benchmarks publicados: conviene evaluar calidad y latencia en el caso de uso concreto antes de llevar a produccion.
- La licencia Apache-2.0 permite uso comercial, pero deben respetarse las condiciones de acceso del repositorio gated.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/amd/AMD-OLMo-1B-SFT-DPO_rai_1.9.0_m_1.0.1_npu
- No se han encontrado enlaces adicionales (paper, blog o repositorio) en la informacion disponible.
