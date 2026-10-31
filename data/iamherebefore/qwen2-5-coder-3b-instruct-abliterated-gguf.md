# iamherebefore/Qwen2.5-Coder-3B-Instruct-Abliterated-GGUF

## Resumen

Qwen2.5-Coder-3B-Instruct-Abliterated-GGUF es una versión cuantizada en formato GGUF (Q4_K_M) del modelo Qwen2.5-Coder-3B-Instruct al que se le ha aplicado un proceso de "abliteración" (abliteration), una técnica que elimina las capas de rechazo del modelo para que responda a cualquier petición sin negarse. El modelo base es Qwen2.5-Coder-3B-Instruct, desarrollado por el equipo Qwen de Alibaba, especializado en generación y comprensión de código. La versión abliterated original proviene de Huihui AI, fue reconvertida a EXL2 por RichardErkhov y finalmente cuantizada a GGUF por el usuario iamherebefore.

Este modelo resuelve una necesidad concreta: ejecutar un modelo de código ligero (3B de parámetros) localmente en hardware de consumo, con cuantización de 4 bits aproximada, sin los rechazos de seguridad habituales de los modelos alineados. Su relevancia radica en la combinación de tamaño reducido, especialización en código y ausencia de filtros, lo que lo hace interesante para investigación, análisis de alineación y casos de uso donde los rechazos estándar resultan un obstáculo. Al ser una derivada no oficial, carece de soporte del equipo original de Qwen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen2.5) |
| Parámetros totales | 3B (aproximados, según la familia Qwen2.5-Coder-3B) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible en la ficha (el modelo base Qwen2.5-Coder-3B-Instruct soporta 32768 tokens, con extensiones hasta 131072 mediante YaRN) |
| Tipos de cuantización | Q4_K_M (GGUF) |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | qwen-research (licencia "other", no comercial estándar) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo subyacente, Qwen2.5-Coder-3B-Instruct, es un transformer decoder de la familia Qwen2.5, preentrenado por Alibaba con un corpus intensivo en código y texto general, y posteriormente ajustado con instrucciones (SFT) para tareas conversacionales y de programación. La familia Qwen2.5-Coder se entrena con una proporción elevada de datos de código en múltiples lenguajes de programación, además de texto natural. No se dispone en la información proporcionada de detalles sobre el número exacto de tokens ni los procesos de RLHF/DPO aplicados a esta variante concreta.

La modificación principal de esta versión es la abliteración: una técnica post-entrenamiento que identifica y neutraliza las direcciones de activación responsables de los rechazos de seguridad en el modelo, típicamente mediante la eliminación o ablation de la diferencia media entre activaciones de peticiones rechazadas y aceptadas. El resultado es un modelo que no emite respuestas de rechazo. Esta versión concreta añade una cuantización Q4_K_M en GGUF, un formato orientado a inferencia local en CPU y GPU de consumo mediante llama.cpp y derivados. La cadena de derivación es: huihui-ai (abliterated) → RichardErkhov (EXL2) → iamherebefore (GGUF Q4_K_M).

## Capacidades

- Generación y completado de código en múltiples lenguajes de programación (heredado de la especialización Qwen2.5-Coder)
- Comprensión y explicación de código existente
- Conversación general en inglés (pipeline text-generation, tag conversational)
- Razonamiento sobre problemas de programación y matemáticas a nivel básico-medio (típico de modelos de 3B)
- Ausencia de mecanismos de rechazo por alineación (abliterated/uncensored), respondiendo a peticiones que otros modelos declinarían
- Compatibilidad con el ecosistema GGUF: llama.cpp, Ollama, LM Studio, etc.
- No disponible: no hay evidencia en la ficha de capacidades de visión, audio, tool calling ni modos de thinking

## Casos de uso

- Asistente de código local y privado: ejecución en un portátil o PC de consumo sin enviar código propietario a APIs externas, útil en entornos con requisitos de confidencialidad
- Completado de código en editores: integración con herramientas tipo continue.dev o extensiones de VS Code vía llama.cpp/Ollama para autocompletado y refactorizaciones
- Investigación en alineación y seguridad: estudio del efecto de la abliteración sobre el comportamiento del modelo, pruebas de jailbreak comparativas y análisis de mecanismos de rechazo
- Prototipado rápido de agentes de código: su tamaño reducido permite desplegarlo en hardware modesto para experimentar con pipelines de generación y ejecución de código
- Generación de scripts y automatizaciones: creación de scripts en Bash, Python o PowerShell a partir de descripciones en lenguaje natural
- Documentación y explicación de código: generación de comentarios, docstrings y explicaciones de bases de código existentes en inglés
- Educación en programación: asistente ligero para aprender sintaxis y depurar ejercicios sin coste de infraestructura

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta variante cuantizada y abliterada. Como referencia, el modelo base Qwen2.5-Coder-3B-Instruct presenta resultados publicados por Qwen en benchmarks de código (HumanEval, MBPP, etc.), pero no se incluyen aquí al no formar parte de la información proporcionada y existir riesgo de imprecisión al tratarse de una derivada cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-2,5 GB para la cuantización Q4_K_M de un modelo de 3B parámetros, más overhead del contexto (KV cache)
- Cabe con holgura en GPUs de consumo: RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4090, e incluso GPUs de 4 GB; también ejecutable en CPU pura con velocidad razonable (varias decenas de tokens/segundo en CPUs modernas)
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM; para contextos largos, 8 GB o más
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp; también posible conversión a otros runtimes compatibles con GGUF
- Latencia y throughput: no disponible en la información proporcionada; al ser un modelo de 3B cuantizado a 4 bits, se espera latencia baja y buen throughput incluso en hardware modesto

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Cuantización | Licencia | Particularidad |
|---|---|---|---|---|---|
| Qwen2.5-Coder-3B-Instruct-Abliterated-GGUF (este) | 3B | GGUF | Q4_K_M | qwen-research | Abliterated, sin rechazos |
| Qwen2.5-Coder-3B-Instruct (original, Alibaba) | 3B | Safetensors | No cuantizado | Qwen research / Apache-2.0 según variante | Modelo oficial con alineación estándar |
| huihui-ai Qwen2.5-Coder-3B-Instruct-abliterated | 3B | Safetensors/EXL2 | Según variante | qwen-research | Abliterated original de Huihui AI |
| StarCoder2-3B | 3B | Safetensors | No cuantizado | BigCode OpenRAIL-M | Especializado en código, base no instruct |

Frente al modelo original de Alibaba, esta versión sacrifica la alineación de seguridad a cambio de ausencia de rechazos, y añade la ventaja práctica del formato GGUF cuantizado para inferencia local. Frente a StarCoder2-3B, ofrece capacidades conversacionales instruct que la versión base de StarCoder2 no incluye de serie.

## Limitaciones y advertencias

- Al ser un modelo abliterated, ha perdido deliberadamente sus salvaguardas de seguridad: puede generar contenido dañino, inseguro o ilegal si se le solicita. Su uso conlleva responsabilidad legal y ética plena para el usuario
- Licencia qwen-research: restringe el uso comercial; el modelo original Qwen2.5-Coder-3B bajo esta licencia está pensado para investigación y no para productos comerciales. Verificar los términos en el enlace de licencia antes de cualquier despliegue
- La abliteración puede degradar la calidad general del modelo y su fiabilidad en tareas de código respecto al modelo original, algo no evaluado en la ficha
- La cuantización Q4_K_M implica una ligera pérdida de precisión respecto a los pesos en precisión completa, especialmente perceptible en razonamiento matemático y código complejo
- Idioma declarado: inglés; el rendimiento en castellano no está garantizado ni evaluado
- Riesgo de alucinación inherente a los modelos de 3B: puede generar código plausible pero incorrecto, APIs inexistentes o vulnerabilidades; revisar siempre el código generado
- Modelo comunitario sin model card detallada (descargas: 0, descripción mínima del autor): procedencia de la cadena de derivación verificable solo a través de los repositorios intermedios
- Contexto largo limitado por la memoria disponible; el KV cache crece con la ventana de contexto y puede exceder la VRAM en hardware modesto

## Enlaces

- Repositorio del modelo: https://huggingface.co/iamherebefore/Qwen2.5-Coder-3B-Instruct-Abliterated-GGUF
- Licencia (qwen-research): https://huggingface.co/iamherebefore/Qwen2.5-Coder-3B-Instruct-Abliterated-GGUF/blob/main/LICENSE
- Modelo base (EXL2 abliterated, RichardErkhov): https://huggingface.co/RichardErkhov/huihui-ai_-_Qwen2.5-Coder-3B-Instruct-abliterated-exl2
- Abliterated original (Huihui AI): https://huggingface.co/huihui-ai/Qwen2.5-Coder-3B-Instruct-abliterated
- Modelo base original (Qwen2.5-Coder-3B-Instruct, Alibaba): https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
