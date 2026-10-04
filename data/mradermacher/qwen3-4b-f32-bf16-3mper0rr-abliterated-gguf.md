# mradermacher/Qwen3-4B-F32-BF16-3MPER0RR-abliterated-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF estáticas de `Qwen3-4B-F32-BF16-3MPER0RR-abliterated`, un modelo derivado de Qwen3-4B publicado por el usuario 3MPER0RR y convertido a GGUF por mradermacher. Se trata por tanto de una cadena de derivación de tres niveles: el modelo base oficial de Alibaba (Qwen3-4B), una fusión de variantes en F32 y BF16 con "abliteration" aplicada, y finalmente la cuantización en formato GGUF para inferencia local. El resultado es un modelo denso de aproximadamente 4.000 millones de parámetros orientado a ejecución en hardware de consumo.

La palabra "abliterated" indica que se ha aplicado una técnica de ortogonalización de pesos para eliminar la dirección de rechazo aprendida durante el alineamiento, de modo que el modelo responde con mucha menos frecuencia con negativas ante peticiones que el modelo original rechazaría. Esto lo hace relevante para investigación sobre alineamiento, seguridad y comportamiento de modelos, pero lo convierte en una opción problemática para despliegues de producción sujetos a políticas de contenido.

El interés práctico del repositorio es que empaqueta el modelo en 12 niveles de cuantización distintos (desde Q2_K hasta f16), lo que permite desplegarlo en llama.cpp, Ollama o LM Studio con requisitos de VRAM que van desde menos de 2 GB hasta unos 9 GB. La model card no documenta datos de entrenamiento, licencia explícita ni idiomas soportados más allá de la herencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (derivado de Qwen3-4B); detalle de la fusion no disponible |
| Parametros totales | Aproximadamente 4.000 millones (heredado de Qwen3-4B); no confirmado en la model card |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; Qwen3-4B soporta 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, IQ4_XS, Q2_K (12 variantes) |
| Idiomas soportados | No disponible en la model card; Qwen3-4B declara soporte de 119 idiomas |
| Licencia | No disponible (el repositorio no declara licencia; el modelo base Qwen3-4B es Apache-2.0) |
| Formato de pesos | GGUF (cuantizaciones estaticas; no se indica si se uso imatrix) |
| Autor de la cuantizacion | mradermacher |
| Autor del modelo abliterado | 3MPER0RR |
| Fecha de creacion | 2026-10-03 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B: un transformer decoder denso con atención por grupos (GQA), normalización RMSNorm y capas FeedForward con activación SwiGLU y RoPE. Qwen3-4B se distribuye oficialmente con soporte de dos modos de razonamiento (thinking y non-thinking) conmutables, aunque no hay confirmación en este repositorio de que dichos modos se conserven tras la fusión y la abliteración. El nombre del modelo sugiere una fusión de dos versiones del mismo checkpoint (una en F32 y otra en BF16), pero la model card no documenta la metodología de merge, los pesos relativos ni el proceso concreto de abliteración aplicado.

No hay información en la documentación disponible sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o RL de algún tipo. Tampoco se documenta el proceso de alineamiento inverso (identificación de la dirección de rechazo, ortogonalización de matrices de proyección, etc.). La única información técnica reproducible es el pipeline de conversión a GGUF: se declara `quantize_version: 2`, `convert_type: hf` y `output_tensor_quantised: 1`, lo que indica una conversión estándar desde pesos de HuggingFace con cuantización de tensores de salida.

## Capacidades

- Generación de texto y conversación multi-turno, con la calidad esperada de un modelo denso de 4.000 millones de parámetros de la familia Qwen3.
- Razonamiento en modo cadena de pensamiento (si el modo thinking de Qwen3-4B se conserva en la fusión; no confirmado en este repositorio).
- Generación de código y resolución de problemas matemáticos básicos e intermedios.
- Soporte de tool calling y function calling, heredado del modelo base Qwen3 (no verificado tras la abliteración).
- Capacidades multilingües amplias si se mantiene el comportamiento del base (119 idiomas declarados por Qwen), no documentadas en este repositorio.
- Ausencia o reducción drástica de rechazos ante peticiones que el modelo original denegaría, como consecuencia directa de la abliteración.
- Capacidades de visión: no disponibles.
- Capacidades de audio: no disponibles.

## Casos de uso

- Investigación sobre alineamiento y seguridad: permite estudiar cómo se comporta un modelo cuando se elimina la dirección de rechazo, comparando respuestas con el Qwen3-4B original bajo los mismos prompts.
- Red teaming y evaluación de robustez: útil como modelo "sin filtros" contra el que medir la eficacia de clasificadores de contenido y guardarraíles externos.
- Generación creativa sin restricciones: escritura de ficción con temáticas adultas o violentas que los modelos alineados suelen rechazar, en entornos privados y bajo responsabilidad del usuario.
- Análisis de texto sensible en investigación académica: procesamiento de corpus con contenido explícito (por ejemplo, literatura, testimonios o material histórico) donde los rechazos del modelo base interrumpirían el pipeline.
- Experimentación con cuantizaciones en hardware limitado: los 12 niveles GGUF permiten medir el impacto de la precisión en calidad de salida sobre un mismo modelo en GPUs de 4 a 16 GB.
- Prototipado local offline: despliegue con llama.cpp u Ollama en un portátil sin conexión, usando Q4_K_M o IQ4_XS para caber en 4-6 GB de VRAM.
- Desarrollo de asistentes de código autoalojados: con Q8_0 o f16 sobre una GPU de 16 GB, integrable mediante la API compatible con OpenAI de llama.cpp server.
- Evaluación comparativa de técnicas de merge: dado que el modelo es una fusión F32/BF16, sirve como caso de estudio de cómo el merge afecta a la perplejidad y a la coherencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y tampoco hay datos de perplejidad por nivel de cuantización. Tampoco se dispone de mediciones de latencia o throughput.

## Requisitos de hardware

- Tamaño de pesos estimado por cuantización (calculado a partir de 4.000 millones de parámetros; no verificado en el repositorio): Q2_K ≈ 1,6 GB; IQ4_XS ≈ 2,2 GB; Q4_K_S ≈ 2,3 GB; Q4_K_M ≈ 2,5 GB; Q5_K_S ≈ 2,8 GB; Q5_K_M ≈ 2,9 GB; Q6_K ≈ 3,3 GB; Q8_0 ≈ 4,3 GB; f16 ≈ 8,0 GB.
- VRAM total necesaria: suma de los pesos más el caché KV (crece con la longitud de contexto) y el buffer de cómputo, típicamente entre 0,5 y 2 GB adicionales según contexto y backend.
- GPUs consumer viables: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB y RTX 4090 24 GB ejecutan sin problemas Q8_0 e incluso f16 con contexto moderado. En 8 GB (RTX 3070, RTX 4060) entran con holgura Q4_K_M e IQ4_XS.
- GPUs de centro de datos: A100 40/80 GB, H100 80 GB y L40S son sobredimensionadas para un denso de 4B, pero permiten lotes grandes y contexto completo de 32k sin degradación.
- Hardware sin GPU: las cuantizaciones Q2_K a Q4_K_M son viables en CPU (AVX2/AVX-512) con velocidades de unos pocos tokens por segundo; los SoC Apple Silicon con memoria unificada de 8-16 GB ejecutan Q8_0 y f16 de forma cómoda mediante Metal.
- Opciones de despliegue: llama.cpp (CLI y llama-server), Ollama, LM Studio, Jan, KoboldCpp, llama-cpp-python. vLLM y TensorRT-LLM recomiendan pesos safetensors; el soporte de GGUF en vLLM es experimental y no cubre necesariamente todos los tipos K-quant.
- Latencia y throughput: no disponibles. La model card no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3-4B abliterated GGUF) | ~4B | No disponible (base: 32k) | No disponible | GGUF | 12 cuantizaciones; sin benchmarks publicados; sin filtros de rechazo |
| Qwen3-4B (base oficial) | 4,0B | 32.768 nativos / 131.072 con YaRN | Apache-2.0 | safetensors, GGUF oficial | Alineado, con modos thinking y non-thinking; benchmarks publicados |
| Llama 3.2 3B Instruct | 3,2B | 131.072 | Llama 3.2 Community License | safetensors, GGUF | Multilingüe (8 idiomas declarados); permite uso comercial con restricciones |
| Gemma 3 4B | ~4B | 131.072 | Gemma Terms of Use | safetensors, GGUF | Multimodal en variantes mayores; licencia con cláusulas de uso aceptable |
| Phi-4-mini | 3,8B | 131.072 | MIT | safetensors, GGUF | Enfocado en razonamiento y matemáticas; inglés principalmente |

## Limitaciones y advertencias

- La abliteración elimina total o parcialmente los mecanismos de rechazo, por lo que el modelo puede generar contenido dañino, ilegal o explícitamente gráfico sin advertencia. No es apto para aplicaciones orientadas al público general.
- La licencia no está declarada en el repositorio. Aunque el modelo base Qwen3-4B es Apache-2.0, la fusión y la modificación posterior pueden introducir condiciones adicionales no documentadas. Antes de cualquier uso comercial es imprescindible verificar la licencia con los autores de cada eslabón de la cadena.
- Riesgo de alucinación: inherente a un modelo denso de 4B sin benchmarks publicados que lo cuantifiquen. Los niveles de cuantización bajos (Q2_K, Q3_K_S) degradan la coherencia de forma apreciable.
- No hay resultados de evaluación publicados, ni perplejidad por cuantización, ni comparación con el modelo base. Cualquier afirmación sobre su calidad relativa es especulativa sin una evaluación propia.
- El repositorio tiene 0 descargas y 0 likes, sin historial de uso ni validación por parte de la comunidad. No hay garantía de mantenimiento, corrección de errores ni actualizaciones.
- La abliteración puede afectar a capacidades distintas del rechazo: es habitual observar degradación en el seguimiento de instrucciones, en el uso correcto de herramientas y en la coherencia general tras este tipo de intervenciones.
- La model card no documenta idiomas, sesgos demográficos ni composición del dataset de entrenamiento, lo que impide evaluar el riesgo de sesgo sistemático.
- Uso legal: la generación de contenido dañino puede tener consecuencias legales para el operador del servicio, que no puede ampararse en el comportamiento del modelo como eximente.

## Enlaces

- Repositorio HuggingFace (cuantizaciones GGUF): https://huggingface.co/mradermacher/Qwen3-4B-F32-BF16-3MPER0RR-abliterated-GGUF
- Modelo de origen abliterado (autor 3MPER0RR): https://huggingface.co/3MPER0RR/Qwen3-4B-F32-BF16-3MPER0RR-abliterated
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Modelo base Qwen3-4B (Alibaba): https://huggingface.co/Qwen/Qwen3-4B
- Colección oficial Qwen3: https://huggingface.co/collections/Qwen/qwen3
- Repositorio llama.cpp (backend de inferencia GGUF): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
