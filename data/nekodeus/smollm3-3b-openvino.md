# Nekodeus/smollm3-3b-openvino

## Resumen

SmolLM3-3B OpenVINO es una conversión al formato OpenVINO IR del modelo base HuggingFaceTB/SmolLM3-3B, publicada por el usuario Nekodeus. Se trata de una versión con cuantización de pesos a INT8 (weight-only) generada mediante `optimum-cli` y NNCF, pensada para ejecución en CPU sin GPU dedicada. El repositorio ocupa 3,1 GB e incluye tres componentes IR: modelo, tokenizador y detokenizador.

El modelo subyacente, SmolLM3-3B, es un transformer decoder-only de 3.000 millones de parámetros desarrollado por Hugging Face (HuggingFaceTB), con licencia Apache 2.0 y una ventana de contexto de 65.536 tokens. Incorpora modos de razonamiento híbridos (thinking y non-thinking) y está orientado a generación de texto multilingüe y tareas de razonamiento.

La relevancia de esta ficha radica en que ofrece una vía de despliegue de un LLM de 3B en hardware sin acelerador gráfico, manteniendo la licencia permisiva del modelo original. No obstante, la información publicada por el autor es mínima y no incluye resultados de evaluación ni detalles sobre el proceso de calibración de la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LlamaForCausalLM), convertido a OpenVINO IR |
| Parametros totales | 3B (modelo base SmolLM3-3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | Pesos INT8 (weight-only, NNCF); activaciones FP16/FP32 según trazado |
| Idiomas soportados | no disponible (la model card menciona "multilingual" sin listar idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (openvino_model, openvino_tokenizer, openvino_detokenizer) |

## Arquitectura y entrenamiento

El modelo base SmolLM3-3B es un transformer decoder-only de 3B parámetros, descrito en la información disponible como construido sobre los diseños de Llama con optimizaciones específicas. La model card del repositorio OpenVINO no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron fases de RLHF o DPO; esa información correspondería a la model card del modelo original de HuggingFaceTB, que no se ha proporcionado en detalle.

La innovación técnica de esta publicación concreta es la conversión a OpenVINO IR con cuantización INT8 de solo pesos, realizada con `optimum-intel 2.2.0`, `openvino 2026.4.1` y `transformers 5.16.1`. El autor indica que la conversión se hizo en un entorno Kaggle solo-CPU y totalmente offline, y que fue necesario fijar `transformers==5.16.1` porque la versión 5.20.2 eliminó `VisionRotaryEmbedding`, que `optimum-intel 2.2.0` importa. No se documenta el conjunto de calibración empleado para la cuantización.

## Capacidades

- Generación de texto autoregresiva con una ventana de contexto de 65.536 tokens.
- Modos de razonamiento híbridos: la model card menciona "hybrid reasoning modes", es decir, alternancia entre modo de razonamiento explícito y respuesta directa.
- Capacidades multilingües según la model card, aunque sin listado de idiomas concretos.
- Ejecución en CPU mediante OpenVINO Runtime y OpenVINO GenAI (`ov::genai::LLMPipeline`).
- Integración con el ecosistema Hugging Face a través de `optimum-intel` (`OVModelForCausalLM`).
- Soporte de tool calling, function calling y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Inferencia de LLM en servidores sin GPU: el formato OpenVINO IR con pesos INT8 permite ejecutar un modelo de 3B en CPU con un consumo de memoria contenido, adecuado para entornos virtualizados o edge servers donde no hay acelerador disponible.
- Prototipado y pruebas en portátiles: con 3,1 GB de repositorio y cuantización INT8, el modelo puede cargarse en equipos de desarrollo convencionales para validar prompts y flujos conversacionales antes de desplegar en producción.
- Procesamiento de documentos largos: la ventana de 65.536 tokens permite resumir o extraer información de contratos, informes o transcripciones extensas en una sola pasada.
- Asistentes conversacionales de bajo coste: el pipeline `text-generation` y la licencia Apache 2.0 facilitan integrar el modelo en chatbots internos o herramientas de soporte sin restricciones de uso comercial.
- Generación de código asistida en entornos locales: la model card incluye un ejemplo de generación de funciones Python, lo que sirve como base para asistentes de autocompletado en IDE que deban ejecutarse sin conexión.
- Pipelines de CI/CD para validación de prompts: al ser determinista en su despliegue y ligero en recursos, puede usarse como modelo de referencia en tests automatizados de calidad de respuestas.
- Despliegue embebido con OpenVINO GenAI: la API C++ `ov::genai::LLMPipeline` permite incrustar el modelo en aplicaciones nativas de escritorio o industriales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica para ejecución en CPU; el modelo está convertido para OpenVINO Runtime. En memoria RAM se estima un consumo en torno a los 3 GB para los pesos INT8, más el overhead de activaciones y del runtime (cifra estimada a partir del tamaño del repositorio, no confirmada por el autor).
- GPU recomendadas: no disponibles; la conversión está orientada a CPU. OpenVINO puede ejecutar en GPU Intel integrada o discreta, pero el autor no documenta ni valida ese camino.
- Compatibilidad con GPU consumer: no confirmada. El formato IR es específico de OpenVINO y no es directamente cargable en llama.cpp, vLLM u Ollama.
- Opciones de despliegue: `optimum-intel` (`OVModelForCausalLM.from_pretrained`), OpenVINO GenAI (`ov::genai::LLMPipeline`), OpenVINO Runtime en Python o C++.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| SmolLM3-3B OpenVINO (esta ficha) | 3B | 65.536 | OpenVINO IR INT8 | Apache 2.0 | Conversión comunitaria, sin benchmarks publicados |
| HuggingFaceTB/SmolLM3-3B | 3B | 65.536 | safetensors | Apache 2.0 | Modelo original, referencia oficial |
| Alternativas de 3B en formato GGUF | no disponible | no disponible | GGUF | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- La cuantización INT8 de solo pesos puede degradar la calidad de generación respecto al modelo original en FP16/BF16; el autor no publica evaluaciones comparativas.
- No se documenta el conjunto de calibración de NNCF, lo que impide evaluar la representatividad de la cuantización.
- No se listan los idiomas soportados ni el grado de cobertura multilingüe.
- Riesgo de alucinación inherente a un modelo de 3B parámetros; no hay evaluaciones de fidelidad publicadas.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día; no hay evidencia de validación por parte de la comunidad.
- El formato OpenVINO IR limita la portabilidad: no es compatible directamente con llama.cpp, vLLM, TGI u Ollama.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base original.
- La dependencia fijada de `transformers==5.16.1` puede generar conflictos en entornos con versiones más recientes.
- No hay información sobre sesgos conocidos ni sobre el proceso de alineación del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Nekodeus/smollm3-3b-openvino
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Ficha de referencia de SmolLM3-3B (specs y VRAM): https://apxml.com/models/smollm3-3b
