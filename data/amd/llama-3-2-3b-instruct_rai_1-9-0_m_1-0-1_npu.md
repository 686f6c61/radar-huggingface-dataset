# amd/Llama-3.2-3B-Instruct_rai_1.9.0_m_1.0.1_npu

## Resumen

AMD publica en HuggingFace una version optimizada de Llama-3.2-3B-Instruct, el modelo de lenguaje de Meta de 3.000 millones de parametros, adaptada especificamente para ejecutarse sobre las NPU (unidades de procesamiento neuronal) de los procesadores AMD Ryzen AI. El identificador del repositorio (`rai_1.9.0_m_1.0.1_npu`) indica la version del runtime Ryzen AI (1.9.0) y la version del modelo compilado (1.0.1) para el backend NPU, lo que confirma que se trata de un artefacto de despliegue y no de un modelo entrenado desde cero.

El modelo base, Llama-3.2-3B-Instruct, es un transformer decoder-only de 3.000 millones de parametros con una ventana de contexto de 128.000 tokens, entrenado por Meta con tecnicas de RLHF y ajuste supervisado para seguir instrucciones y mantener conversaciones multi-turno. Esta version de AMD conserva las capacidades del original pero se distribuye en formato ONNX, lo que permite su ejecucion acelerada en hardware de PC con NPU integrada (familia Ryzen AI 300 y similares) sin necesidad de GPU dedicada.

La relevancia de esta publicacion radica en que democratiza la inferencia local de un LLM de calidad en equipos de sobremesa y portatiles con NPU, un segmento en crecimiento. Al estar empaquetado como ONNX para el runtime Ryzen AI, el modelo se integra en el ecosistema de herramientas de AMD para IA en el borde, aunque su acceso esta restringido y requiere aceptar la licencia Llama 3.2 en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) |
| Parametros totales | 3.000 millones (3B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredado del modelo base) |
| Tipos de cuantizacion | no disponible (formato ONNX precompilado; se desconoce la precision exacta) |
| Idiomas soportados | ingles (segun la ficha; el modelo base soporta 8 idiomas oficiales) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | ONNX (optimizado para NPU Ryzen AI) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 3B Instruct: un transformer decoder-only denso con atencion por grupos (GQA), activacion SwiGLU y normalizacion RMSNorm, entrenado por Meta sobre un corpus multilingue de varios billones de tokens (la cifra exacta no se detalla en la informacion disponible). El ajuste incluyo supervision humana y RLHF con DPO para alinear el comportamiento conversacional y de seguimiento de instrucciones.

La contribucion de AMD en este repositorio no es el entrenamiento, sino la compilacion y empaquetado del modelo para el runtime Ryzen AI 1.9.0 sobre el backend NPU. Esto implica una grafica ONNX optimizada, potencialmente con cuantizacion y fusion de operadores especificos para la NPU XDNA de AMD, de modo que la inferencia se ejecute de forma eficiente en ese hardware. No se proporcionan detalles sobre el proceso de cuantizacion ni sobre posibles perdidas de precision respecto al modelo original.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles.
- Razonamiento basico y resumen de documentos.
- Generacion y explicacion de codigo en lenguajes populares.
- Resolucion de problemas matematicos de nivel medio.
- Soporte de tool calling / function calling (heredado de Llama 3.2 Instruct).
- Capacidad de seguir instrucciones complejas y mantener el rol asignado.
- Ventana de contexto larga (128.000 tokens) para documentos extensos.
- No incluye vision ni audio (la variante 3B de Llama 3.2 no es multimodal).

## Casos de uso

- **Asistente local en portatiles con NPU Ryzen AI**: el modelo se ejecuta en la NPU del equipo sin GPU dedicada, permitiendo un asistente conversacional offline con bajo consumo energetico y sin enviar datos a la nube.
- **Procesamiento de documentos largos en el borde**: gracias a los 128.000 tokens de contexto, se pueden resumir contratos, informes o transcripciones extensas directamente en el dispositivo.
- **Generacion de codigo en entornos de desarrollo locales**: integrable en asistentes de IDE o pipelines de CI/CD que requieran un modelo ligero y con soporte de tool calling, sin dependencia de APIs externas.
- **Atencion al cliente automatizada en kioscos o terminales**: despliegue en hardware AMD empotrado para gestionar conversaciones multi-turno con contexto largo y latencia reducida.
- **Extraccion de informacion estructurada**: convertir texto libre en JSON u otros formatos mediante prompts e instrucciones, aprovechando la ventana de contexto para lotes grandes.
- **Prototipado rapido de agentes**: usar el modelo como cerebro de agentes multi-paso en entornos de desarrollo con NPU, con capacidad de invocar funciones y razonar sobre resultados.
- **Filtrado y clasificacion de contenido en el dispositivo**: moderacion de texto o etiquetado de datos sin salir del equipo, cumpliendo requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni comparativas de latencia o throughput en la NPU.

## Requisitos de hardware

- **VRAM/espacio**: el repositorio ocupa 2,9 GB, lo que sugiere un modelo empaquetado en precision reducida (probablemente int8 o similar). La inferencia se realiza en la NPU, no en VRAM de GPU.
- **Hardware objetivo**: NPU integrada en procesadores AMD Ryzen AI (familia Ryzen AI 300 y posteriores) con el runtime Ryzen AI 1.9.0 instalado.
- **GPU dedicada**: no necesaria; el modelo esta compilado para el backend NPU. No se garantiza su funcionamiento en GPU convencionales sin recompilacion.
- **Consumer GPU**: no aplica en esta distribucion; para uso en GPU habria que recurrir al modelo base en formato GGUF o safetensors.
- **Opciones de despliegue**: runtime Ryzen AI de AMD con soporte ONNX; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AMD Llama-3.2-3B-Instruct (este) | 3B | 128.000 | ONNX (NPU Ryzen AI) | Llama 3.2 | Gated en HuggingFace |
| Meta Llama-3.2-3B-Instruct | 3B | 128.000 | safetensors, GGUF | Llama 3.2 | Publico en HuggingFace |
| Qwen2.5-3B-Instruct | 3B | 32.768 | safetensors, GGUF | Apache 2.0 | Publico en HuggingFace |
| Phi-3.5-mini-instruct | 3,8B | 128.000 | safetensors, GGUF | MIT | Publico en HuggingFace |

La diferencia clave frente a las alternativas es el empaquetado ONNX especifico para NPU AMD, que restringe su portabilidad pero habilita inferencia acelerada en ese hardware. Para uso general en GPU o CPU, el modelo base de Meta o las alternativas de Qwen y Microsoft ofrecen mayor flexibilidad de despliegue.

## Limitaciones y advertencias

- **Acceso restringido**: el repositorio es gated; es necesario aceptar la licencia Llama 3.2 en HuggingFace para descargarlo.
- **Dependencia de hardware**: solo funciona con el runtime Ryzen AI 1.9.0 y la NPU correspondiente; no es portable a otros backends sin recompilacion.
- **Idioma**: la ficha declara solo ingles, aunque el modelo base soporta mas idiomas; el rendimiento en castellano no esta garantizado en esta version.
- **Riesgo de alucinacion**: como todo LLM de 3B, puede generar informacion falsa o inventar citas, especialmente en contextos largos.
- **Sesgos**: hereda los sesgos del corpus de entrenamiento de Meta; no se documenta un proceso adicional de mitigacion por parte de AMD.
- **Licencia**: la Llama 3.2 Community License impone restricciones de uso comercial (limite de 700 millones de usuarios mensuales para productos derivados) y obligaciones de atribucion.
- **Sin benchmarks**: no hay datos publicados de rendimiento ni de precision tras la compilacion, por lo que se desconoce la degradacion respecto al original.
- **Fecha de publicacion futura**: el repositorio figura creado en 2026-10-30, lo que puede indicar un artefacto preliminar o una fecha de metadata no fiable.

## Enlaces

- [HuggingFace: amd/Llama-3.2-3B-Instruct_rai_1.9.0_m_1.0.1_npu](https://huggingface.co/amd/Llama-3.2-3B-Instruct_rai_1.9.0_m_1.0.1_npu)
- [Modelo base: meta-llama/Llama-3.2-3B-Instruct](https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct)
- [Licencia Llama 3.2](https://www.llama.com/llama3_2/license/)
- [Documentacion de AMD Ryzen AI](https://www.amd.com/en/products/software/ryzen-ai.html)
