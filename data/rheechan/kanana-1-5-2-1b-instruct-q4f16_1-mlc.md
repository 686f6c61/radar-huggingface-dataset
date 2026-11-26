# Rheechan/kanana-1.5-2.1b-instruct-q4f16_1-MLC

## Resumen

Kanana-1.5-2.1b-instruct-q4f16_1-MLC es una conversión cuantizada del modelo kakaocorp/kanana-1.5-2.1b-instruct-2505, publicado por el usuario Rheechan. Se trata de un artefacto derivado pensado para su ejecución en el navegador mediante WebLLM y MLC LLM, no de un modelo entrenado desde cero. El trabajo consiste en transformar los pesos originales de Kakao Corp. al formato q4f16_1 (cuantización de 4 bits con activaciones en float16) y compilar un runtime WebGPU compatible con WebLLM 0.2.89.

El modelo base pertenece a la familia Kanana 1.5 de Kakao, orientada al idioma coreano, con 2.100 millones de parámetros y una ventana de contexto declarada de 4096 tokens en esta conversión. La relevancia de esta ficha radica en que permite desplegar un modelo de instrucciones coreano íntegramente en el cliente, sin servidor, aprovechando la API WebGPU del navegador.

La licencia del repositorio es Apache 2.0, heredada del modelo original. El artefacto incluye los shards de pesos (`params_shard_*.bin`), el `tensor-cache.json` y el módulo WASM `kanana-q4f16_1-webgpu.wasm`, compilado a partir de commits concretos de apache/tvm y mlc-ai/mlc-llm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Kanana 1.5 de Kakao); empaquetado como runtime MLC/WebGPU |
| Parametros totales | 2.100 millones (2.1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (ventana declarada en la conversión) |
| Tipos de cuantizacion | q4f16_1 (pesos en 4 bits, activaciones en float16) |
| Idiomas soportados | coreano (etiqueta `korean`); cobertura multilingüe adicional no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `params_shard_*.bin` + `tensor-cache.json` (formato MLC LLM), runtime `kanana-q4f16_1-webgpu.wasm` |
| Libreria | mlc-llm (WebLLM 0.2.89) |
| Formato de chat | llama-3_1 |
| Compatibilidad de runtime | apache/tvm@e345029, mlc-ai/mlc-llm@44fd06d |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de 2.1B parámetros desarrollado por Kakao Corp., ajustado para instrucciones en la versión `-instruct-2505`. Esta ficha no documenta detalles del entrenamiento original (número de tokens, composición del corpus, uso de RLHF o DPO), por lo que esos datos deben consultarse en la model card de kakaocorp/kanana-1.5-2.1b-instruct-2505.

La contribución de este repositorio es exclusivamente de conversión y empaquetado: cuantización a q4f16_1, generación de shards binarios, construcción del tensor cache y compilación del módulo WebGPU mediante MLC LLM. El resultado es un artefacto autoejecutable en navegadores con soporte de WebGPU, sin necesidad de backend de inferencia en servidor.

## Capacidades

- Generación de texto conversacional en coreano, heredada del ajuste de instrucciones del modelo base.
- Respuesta a instrucciones multi-turno mediante el formato de chat llama-3_1.
- Ejecución local en el navegador del cliente mediante WebLLM y WebGPU.
- Inferencia sin conexión a un servidor una vez descargados los pesos y el módulo WASM.
- Capacidades de razonamiento, código, matemáticas, tool calling o agentes: no documentadas en la información disponible para esta conversión.
- Capacidades de visión o audio: no disponibles.
- Modo thinking explícito: no disponible.

## Casos de uso

- Asistentes conversacionales en coreano dentro de aplicaciones web: el modelo se carga en el navegador vía WebLLM y responde sin enviar datos a un servidor, lo que resulta adecuado para escenarios con requisitos de privacidad.
- Demos interactivas y prototipos de producto: permite validar experiencias de chat con un modelo de 2.1B sin aprovisionar infraestructura GPU, usando únicamente el hardware del usuario.
- Herramientas educativas offline: al ejecutarse en el cliente, puede integrarse en materiales didácticos o aplicaciones descargables que funcionen sin conectividad tras la primera carga.
- Aplicaciones de escritorio empaquetadas con WebView: el runtime WASM y los shards pueden distribuirse junto con la aplicación para ofrecer asistencia textual local.
- Procesamiento de texto sensible en el borde: clasificación, resumen o reescritura de contenido que no debe salir del dispositivo del usuario.
- Pruebas de compatibilidad WebGPU: sirve como banco de pruebas para validar el soporte de WebLLM 0.2.89 y de los commits de TVM/MLC referenciados en distintos navegadores y GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con cuantización de 4 bits, los pesos de 2.1B parámetros ocupan aproximadamente 1,1-1,3 GB, a lo que se suma el overhead del runtime WebGPU y del tensor cache.
- GPU recomendadas: no disponibles en la información proporcionada; el requisito funcional es un navegador con soporte de WebGPU (Chrome/Edge en versiones recientes, entre otros).
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo y la cuantización de 4 bits, aunque no se documentan configuraciones validadas.
- Opciones de despliegue: WebLLM 0.2.89 con el módulo `kanana-q4f16_1-webgpu.wasm`; MLC LLM para el pipeline de conversión. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este artefacto concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| kanana-1.5-2.1b-instruct-q4f16_1-MLC (esta ficha) | 2.1B | 4096 | MLC q4f16_1 + WASM WebGPU | Apache 2.0 | Navegador (WebLLM) |
| kakaocorp/kanana-1.5-2.1b-instruct-2505 | 2.1B | no disponible en esta ficha | safetensors (modelo original) | Apache 2.0 | Servidor GPU (vLLM, TGI, etc.) |
| Alternativas de ~2B para navegador | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de esta conversión frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un artefacto derivado: la calidad final depende íntegramente del modelo base de Kakao y de la fidelidad de la cuantización q4f16_1, que introduce pérdida de precisión respecto a los pesos originales.
- Ventana de contexto limitada a 4096 tokens en esta conversión, insuficiente para tareas de contexto largo.
- El modelo está orientado al coreano; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior.
- Riesgo de alucinación inherente a un modelo de 2.1B parámetros; no se han publicado evaluaciones de fiabilidad para esta conversión.
- Sesgos: no documentados en la información disponible; deben asumirse los del corpus de entrenamiento original.
- Dependencia de WebGPU: no funciona en navegadores o dispositivos sin soporte, y el rendimiento puede variar significativamente entre implementaciones.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero los derechos del modelo original corresponden a Kakao Corp. y conviene verificar los términos de la model card original antes de un despliegue en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Rheechan/kanana-1.5-2.1b-instruct-q4f16_1-MLC
- Modelo base: https://huggingface.co/kakaocorp/kanana-1.5-2.1b-instruct-2505
- MLC LLM: https://github.com/mlc-ai/mlc-llm
- Apache TVM: https://github.com/apache/tvm
