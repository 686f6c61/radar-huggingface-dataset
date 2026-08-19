# Atomic-Germ/Qwen2.5-3B-Coder-Instruct-NPU2

## Resumen

Qwen2.5-3B-Coder-Instruct-NPU2 es una conversión cuantizada del modelo Qwen2.5-Coder-3B-Instruct, adaptada por Atomic-Germ al formato Q4NX, el formato nativo de cuantización empaquetada del motor FastFlowLM. El objetivo es ejecutar un modelo de generación de código de 3.000 millones de parámetros directamente sobre la NPU (unidad de procesamiento neuronal) integrada en los procesadores AMD Ryzen AI con arquitectura XDNA2, como la serie Strix Point (Ryzen AI 300).

La relevancia de este modelo reside en que permite ejecutar un asistente de código instructivo en hardware de consumo sin GPU dedicada, aprovechando la unidad NPU del propio procesador. La cuantización Q4NX reorganiza los pesos en un layout Q4_1 ajustado a las dimensiones de los tiles y patrones de acceso a memoria de la matriz de la NPU, lo que consigue un peso de solo 2,59 GB. No es un archivo GGUF y no funciona con llama.cpp ni Ollama; está pensado exclusivamente para el motor FastFlowLM sobre AMD Ryzen AI.

La longitud de contexto es de 32.768 tokens, heredada del modelo base, y el repositorio incluye el tokenizer, la configuración y la plantilla de chat. El modelo base Qwen2.5-Coder-3B es un modelo de la serie Qwen2.5 de Alibaba, especializado en generación, razonamiento y corrección de código, con licencia "other" (la misma que el modelo original).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5), cuantización Q4NX |
| Parametros totales | 3.000 millones (modelo base Qwen2.5-Coder-3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Q4NX (formato propietario de FastFlowLM, basado en layout Q4_1) |
| Idiomas soportados | En la model card se indica únicamente "en" (ingles) |
| Licencia | other (heredada de Qwen/Qwen2.5-Coder-3B) |
| Formato de pesos | Q4NX (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 3.000 millones de parámetros de la familia Qwen2.5, entrenado por el equipo de Qwen (Alibaba) con un dataset enfocado en código, incluyendo generación, razonamiento y corrección de código. Los detalles completos de entrenamiento, composición del dataset y técnicas de alineación (RLHF/DPO) están documentados en la model card del modelo base, enlazada en este repositorio, pero no se reproducen en la información disponible de esta conversión.

La conversión a Q4NX no implica reentrenamiento ni alineamiento adicional: se trata de una cuantización de los pesos del modelo instruct original a un formato de 4 bits reorganizado para la matriz de la NPU. La innovación técnica principal de esta versión es el propio formato Q4NX, que reordena los bloques de cuantización para alinearlos con los tamaños de tile y los patrones de acceso a memoria del motor de matrices de la NPU XDNA2, consiguiendo un archivo de pesos de 2,59 GB. Los kernels de ejecución en la NPU (xclbins) son de código cerrado y no se distribuyen en este repositorio; se enlazan desde el modelo oficial `qwen2.5-it:3b` de FastFlowLM, ya que comparten la misma familia de motor (`qwen2`).

## Capacidades

- Generación de código, razonamiento y corrección de código, heredadas del modelo base Qwen2.5-Coder-3B-Instruct.
- Conversación multi-turno con plantilla de chat incluida (`chat_template.jinja`).
- Longitud de contexto de 32.768 tokens, suficiente para contextos de código extensos.
- Ejecución en NPU AMD XDNA2, sin necesidad de GPU dedicada.
- Soporte de tool calling y function calling, según las capacidades del modelo base Qwen2.5-Coder-3B-Instruct.
- Capacidades multilingües del modelo base, aunque la model card de esta conversión declara únicamente inglés.

## Casos de uso

- Asistente de programación local en portátiles con Ryzen AI 300: un desarrollador puede ejecutar el modelo en su portátil Strix Point sin GPU, obteniendo sugerencias de código y explicaciones con baja latencia al aprovechar la NPU.
- Generación de código en entornos de desarrollo integrado (IDE) con recursos limitados: al ocupar solo 2,59 GB de pesos y unos 8 GB de memoria unificada, cabe en equipos con 16 GB de RAM y no consume VRAM de GPU.
- Corrección y revisión de código en pipelines de CI/CD locales: el modelo puede analizar cambios de código y sugerir correcciones en un entorno privado sin enviar datos a la nube.
- Educación y aprendizaje de programación: los estudiantes pueden interactuar con un asistente de código en sus propios equipos con NPU, sin depender de servicios externos.
- Prototipado rápido de agentes de código en dispositivos edge: con soporte de tool calling, puede integrarse en flujos de automatización locales que requieran generación de código.
- Inferencia de código en dispositivos con restricciones de consumo energético: al ejecutarse en NPU en lugar de GPU, el consumo es menor y adecuado para equipos portátiles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta conversión Q4NX en la información disponible. La model card remite a la model card del modelo base Qwen2.5-Coder-3B para datos de rendimiento del modelo original, pero no se proporcionan cifras de esta versión cuantizada. No se dispone de comparativas de velocidad, latencia ni throughput para el motor FastFlowLM en NPU.

## Requisitos de hardware

- Procesador AMD Ryzen AI con arquitectura XDNA2 (NPU2), es decir, Strix Point (Ryzen AI 300 series) o posterior.
- Sistema operativo Linux con la pila XRT de la NPU instalada.
- Memoria unificada: aproximadamente 8 GB (pesos Q4NX de 2,59 GB + activaciones + KV cache).
- Motor FastFlowLM versión 0.9.45 o superior (CLI `flm`).
- No es compatible con GPU tradicionales, llama.cpp, Ollama ni ningún otro motor que no sea FastFlowLM.
- Los kernels de la NPU (xclbins) son cerrados y se enlazan desde el modelo oficial `qwen2.5-it:3b` de FastFlowLM.
- Instalación mediante `flm-add` (instalador en Python, via `pip` o `uv`), que copia el modelo al directorio de usuario de FastFlowLM y registra la etiqueta `qwen2.5-coder:3b`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Motor | Licencia |
|---|---|---|---|---|---|
| Qwen2.5-3B-Coder-Instruct-NPU2 (este) | 3B | 32.768 | Q4NX | FastFlowLM (NPU AMD) | other |
| Qwen/Qwen2.5-Coder-3B-Instruct | 3B | 32.768 | safetensors (BF16) | Transformers, vLLM, etc. | Apache 2.0 |
| Qwen2.5-Coder-3B-Instruct (GGUF) | 3B | 32.768 | GGUF | llama.cpp, Ollama | Apache 2.0 |
| Qwen2.5-3B-Instruct-NPU2 | 3B | 32.768 | Q4NX | FastFlowLM (NPU XDNA2) | other |

La comparativa se centra en el mismo tamaño de parámetros y la misma familia de modelos. La diferencia clave de esta conversión frente a las alternativas es la plataforma de ejecución: solo NPU AMD XDNA2 con FastFlowLM, mientras que las versiones en safetensors o GGUF son portátiles a GPU y CPU. La versión Q4NX no es interoperable con otros motores.

## Limitaciones y advertencias

- Solo funciona en procesadores AMD con NPU XDNA2 (Strix Point o posterior); no es compatible con otras plataformas, GPU o CPU.
- El formato Q4NX es propietario de FastFlowLM y no es GGUF; no se puede usar con llama.cpp, Ollama ni otros motores.
- Los kernels de la NPU son código cerrado y se dependen de la instalación de FastFlowLM, que no se distribuye en este repositorio.
- La licencia es "other", heredada del modelo base Qwen2.5-Coder-3B, lo que puede implicar restricciones de uso comercial; se debe revisar la licencia del modelo original antes de desplegar en producción.
- La model card declara solo inglés como idioma, aunque el modelo base soporta más idiomas.
- Al ser un modelo de 3B cuantizado a Q4, puede presentar alucinaciones y errores en código complejo; se recomienda validar las salidas en producción.
- No se han publicado benchmarks de esta conversión, por lo que el rendimiento real en la NPU no está documentado en la información disponible.
- La fecha de creación del repositorio (agosto de 2026) y la dependencia de FastFlowLM >= 0.9.45 sugieren que el ecosistema es reciente y puede tener cambios de API.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Atomic-Germ/Qwen2.5-3B-Coder-Instruct-NPU2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B
- Motor FastFlowLM: https://fastflowlm.com
- Informe tecnico de Qwen2.5-Coder (arXiv): https://arxiv.org/html/2409.12186v3
- Repositorio oficial de Qwen2.5-Coder (GitHub): https://github.com/huggingface/Qwen2.5-Coder
