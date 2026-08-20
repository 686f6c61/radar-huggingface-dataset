# Atomic-Germ/OpenAI-NEO-CODE-20B-NPU2

## Resumen

OpenAI-NEO-CODE-20B-NPU2 es una conversión cuantizada al formato Q4NX del modelo `DavidAU/Openai_gpt-oss-20b-CODER-NEO-CODE-DI-MATRIX-GGUF`, un fine-tune orientado a generación de código basado en el modelo abierto `openai/gpt-oss-20b` de OpenAI. La conversión ha sido realizada por Atomic-Germ y está diseñada exclusivamente para ejecutarse en el motor FastFlowLM sobre las NPU AMD Ryzen AI con arquitectura XDNA2 (serie Ryzen AI 300 o posterior). Su propósito es permitir la ejecución local de un modelo de 20B de parámetros con arquitectura MoE en hardware de consumo, aprovechando la unidad de procesamiento neuronal de AMD.

El modelo base GPT-OSS-20B es un transformer de mezcla de expertos (MoE) con 24 expertos y una ventana de contexto de 131 072 tokens, liberado por OpenAI bajo licencia Apache 2.0. La versión Q4NX reorganiza los pesos en un layout de cuantización adaptado a los tamaños de tile y patrones de acceso a memoria de la NPU, lo que permite una inferencia eficiente sin depender de GPUs dedicadas. Es relevante porque democratiza el acceso a modelos de razonamiento y código de gran tamaño en portátiles y equipos con procesadores AMD Ryzen AI, un segmento en crecimiento dentro del despliegue de IA en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en GPT-OSS-20B, 24 expertos |
| Parametros totales | 20 000 millones (20B) |
| Parametros activos | no disponible |
| Longitud de contexto | 131 072 tokens |
| Tipos de cuantizacion | Q4NX (formato propietario de FastFlowLM, derivado de Q4_1) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Q4NX (no safetensors, no GGUF) |

## Arquitectura y entrenamiento

El modelo original `openai/gpt-oss-20b` es un transformer de arquitectura MoE con 24 expertos, diseñado por OpenAI para tareas de razonamiento, chat y generación de código. Sobre esta base, el autor DavidAU aplicó un fine-tune adicional orientado a código y razonamiento, que dio lugar al modelo `Openai_gpt-oss-20b-CODER-NEO-CODE-DI-MATRIX`. Los detalles concretos del dataset de entrenamiento y del proceso de fine-tune (número de tokens, composición, uso de RLHF o DPO) no se especifican en la documentación disponible.

La conversión a Q4NX realizada por Atomic-Germ no modifica los pesos semánticamente, sino que los reorganiza en un formato de cuantización empaquetada diseñado para el motor FastFlowLM. Este formato aprovecha los tamaños de tile y los patrones de acceso a memoria de la NPU XDNA2, logrando una inferencia eficiente en hardware de AMD. Los kernels de ejecución (xclbins) son cerrados y no se incluyen en el repositorio; se enlazan desde el modelo oficial `gpt-oss:8b` de FastFlowLM, ya que comparten la misma familia de motor.

## Capacidades

- Generacion de codigo en multiples lenguajes, gracias al fine-tune especifico para programacion.
- Razonamiento y resolucion de problemas, incluyendo cadenas de pensamiento (chain-of-thought) y modos de thinking, segun los tags del modelo.
- Chat conversacional multi-turno con ventana de contexto amplia (128k tokens).
- Capacidad de brainstorming y resolucion de acertijos o problemas logicos, como indican los tags del repositorio.
- Soporte de tool calling y function calling: no se menciona explicitamente en la documentacion, pero es una capacidad habitual en la familia GPT-OSS; no se puede confirmar para esta version.
- Capacidades multilingues: solo se declara ingles; no se garantiza un rendimiento adecuado en otros idiomas.

## Casos de uso

- Asistente de programacion local en portatiles con AMD Ryzen AI: un desarrollador puede ejecutar el modelo en su equipo sin conexion a internet para obtener sugerencias de codigo, explicaciones y refactorizaciones, aprovechando la NPU integrada para no saturar la CPU o la GPU.
- Generacion de codigo en entornos de desarrollo integrados (IDE) mediante un servidor compatible con la API de OpenAI: el modelo puede desplegarse con `flm serve` y conectarse a herramientas como VS Code o JetBrains para autocompletado y chat contextual.
- Resolucion de problemas de programacion en entornos educativos: estudiantes pueden interactuar con el modelo para entender algoritmos, depurar errores y practicar ejercicios de logica, gracias a su capacidad de razonamiento y su contexto largo.
- Prototipado rapido de scripts y automatizaciones: al ejecutarse localmente, el modelo permite generar codigo para tareas de automatizacion sin enviar datos sensibles a servicios en la nube, lo que resulta util en entornos corporativos con politicas de privacidad estrictas.
- Analisis y revision de codigo existente: con su ventana de 128k tokens, puede procesar archivos de codigo extensos y ofrecer sugerencias de mejora, deteccion de errores o explicaciones de fragmentos complejos.
- Asistente de chat general en equipos con recursos limitados: el modelo tambien sirve para tareas de conversacion, lluvia de ideas y resolucion de problemas cotidianos, gracias a su entrenamiento en razonamiento y chat, todo ello sin conexion y con bajo consumo energetico gracias a la NPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta version cuantizada Q4NX. El modelo base `openai/gpt-oss-20b` tiene resultados publicados por OpenAI en su documentacion oficial, pero no se proporcionan aqui y no deben extrapolarse sin verificacion. Se recomienda consultar la ficha del modelo base para obtener datos de rendimiento en tareas como MMLU, HumanEval o GSM8K, teniendo en cuenta que la cuantizacion puede afectar ligeramente a la precision.

## Requisitos de hardware

- Procesador AMD Ryzen AI con arquitectura XDNA2 (NPU2): series Strix Point / Ryzen AI 300 o posteriores.
- Sistema operativo Linux con el stack XRT (Xilinx Runtime) para NPU instalado.
- Memoria unificada de al menos 16 GB para alojar los pesos Q4NX (14.45 GB) junto con activaciones y cache KV.
- Motor FastFlowLM version 0.9.45 o superior, con el comando `flm` disponible.
- No se requieren GPUs dedicadas; el modelo esta disenado exclusivamente para la NPU.
- El despliegue se realiza mediante el instalador `flm-add` o copiando los archivos al directorio de usuario de FastFlowLM.
- La latencia y el throughput estimados no se han publicado; el modelo base alcanza velocidades superiores a 80 tokens por segundo en configuraciones optimizadas, segun la ficha del modelo GGUF de DavidAU, pero este dato corresponde al formato GGUF y no necesariamente al Q4NX en NPU.

## Comparativa con modelos similares

No se dispone de una comparativa directa publicada para esta version cuantizada. Como referencia, el modelo base `openai/gpt-oss-20b` compite con otros modelos abiertos de codigo como:

| Modelo | Parametros | Contexto | Licencia | Formato de pesos |
|---|---|---|---|---|
| OpenAI GPT-OSS-20B (base) | 20B MoE | 128k | Apache 2.0 | safetensors, GGUF |
| OpenAI-NEO-CODE-20B-NPU2 (este) | 20B MoE | 128k | Apache 2.0 | Q4NX (solo FastFlowLM) |
| DeepSeek-Coder-V2-Lite | 16B MoE | 128k | MIT | safetensors, GGUF |
| CodeLlama-34B | 34B dense | 16k | Llama 2 license | safetensors, GGUF |

La principal diferencia de este modelo es su formato de pesos cerrado a un runtime especifico (FastFlowLM) y a un hardware concreto (NPU AMD XDNA2), lo que limita su portabilidad pero optimiza su rendimiento en ese entorno. No se han publicado comparativas de rendimiento entre estas alternativas en el contexto de NPU.

## Limitaciones y advertencias

- El modelo solo funciona con el motor FastFlowLM y exclusivamente en NPU AMD XDNA2; no es compatible con llama.cpp, Ollama, vLLM ni otros runtimes convencionales.
- Los kernels de ejecucion son cerrados y no se distribuyen en el repositorio; se depende de los kernels del modelo `gpt-oss:8b` de FastFlowLM, lo que puede implicar limitaciones de compatibilidad futura.
- Solo se declara soporte para el idioma ingles; el rendimiento en otros idiomas no esta garantizado.
- Al ser una cuantizacion de 4 bits, puede haber una ligera degradacion de la precision en tareas complejas de razonamiento o generacion de codigo, aunque no se han publicado mediciones concretas.
- El modelo no incluye informacion sobre sesgos especificos, pero al derivar de un modelo base entrenado con datos de internet, puede heredar sesgos presentes en dichos datos.
- Riesgo de alucinacion inherente a los modelos de lenguaje; se recomienda validar el codigo generado antes de usarlo en produccion.
- La licencia Apache 2.0 permite uso comercial, pero los kernels de FastFlowLM tienen su propia licencia que debe revisarse por separado.
- El repositorio no proporciona informacion sobre el proceso de cuantizacion ni sobre la fidelidad de la conversion respecto al modelo original.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Atomic-Germ/OpenAI-NEO-CODE-20B-NPU2
- Modelo base (fine-tune GGUF): https://huggingface.co/DavidAU/Openai_gpt-oss-20b-CODER-NEO-CODE-DI-MATRIX-GGUF
- Modelo original de OpenAI: https://huggingface.co/openai/gpt-oss-20b
- Motor FastFlowLM: https://fastflowlm.com
- Pagina de modelos abiertos de OpenAI: https://openai.com/open-models/
