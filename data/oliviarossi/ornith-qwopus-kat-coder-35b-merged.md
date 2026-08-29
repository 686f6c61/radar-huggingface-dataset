# OliviaRossi/Ornith-Qwopus-KAT-Coder-35B-Merged

## Resumen

Ornith-Qwopus-KAT-Coder-35B-Merged es un modelo de lenguaje de código abierto creado por OliviaRossi mediante una fusión SLERP (alpha = 0.5) de dos modelos MoE de 35B parámetros: Qwopus-KAT-Coder-35B-Merged y Ornith-1.5-35B-A3B. El resultado es un modelo híbrido de mezcla de expertos dispersa (Sparse MoE) con 40 capas, 256 expertos enrutados y un experto compartido, diseñado específicamente para tareas de codificación agéntica, razonamiento y generación de código.

La arquitectura combina capas de recurrencia lineal híbrida GatedDeltaNet con atención estándar periódica, una combinación poco habitual que busca equilibrar eficiencia computacional y capacidad de razonamiento de largo alcance. El modelo se distribuye en formato bfloat16 Safetensors y está pensado para su uso con la librería transformers. Aunque es un merge reciente con pocas descargas, su relevancia radica en que integra las capacidades de dos modelos especializados en código y razonamiento agéntico, ofreciendo una alternativa unificada para pipelines de desarrollo asistido por IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid Sparse MoE (GatedDeltaNet + attention estándar periódica) |
| Parametros totales | 35B (aprox., no desglosado oficialmente) |
| Parametros activos | 3B (según sufijo A3B del modelo base Ornith-1.5) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo bfloat16 en safetensors; existen versiones GGUF del modelo base) |
| Idiomas soportados | no disponible (se infiere inglés y chino por el modelo base, sin confirmar) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es una fusión SLERP (Spherical Linear Interpolation) con alpha 0.5 entre dos modelos MoE de 35B: Qwopus-KAT-Coder-35B-Merged (a su vez un merge) y Ornith-1.5-35B-A3B. La arquitectura resultante es un MoE disperso con 40 capas, 256 expertos enrutados y 1 experto compartido, lo que implica que solo se activan 3B parámetros por token (según el sufijo A3B). La atención combina capas de recurrencia lineal GatedDeltaNet con atención estándar periódica, un diseño híbrido que reduce el coste computacional del attention cuadrático manteniendo la capacidad de modelar dependencias de largo alcance.

No se dispone de información sobre el proceso de entrenamiento del modelo fusionado, ya que es un merge y no un modelo entrenado desde cero. Los modelos base fueron entrenados con técnicas de RL agéntico (según el blog de KAT-Coder) y con datos de código y razonamiento, pero los detalles específicos de tokens, dataset y método de alineación no están publicados en la ficha.

## Capacidades

- Generación de código y razonamiento agéntico: el modelo está orientado a tareas de codificación agéntica, lo que implica planificación de múltiples pasos, uso de herramientas y generación de código en contexto.
- Soporte de tool calling / function calling: se infiere por su orientación a agentes, aunque no hay documentación explícita en la ficha.
- Razonamiento multi-step: los modelos base (KAT-Coder y Ornith) están diseñados para razonamiento profundo en tareas de ingeniería de software.
- Capacidades multilingües: no confirmadas; el modelo base Qwopus parece soportar inglés y chino según los tags de su versión GGUF, pero no hay datos oficiales.
- Formato de pesos compatible con transformers: se puede cargar con la librería estándar de HuggingFace.

## Casos de uso

- Asistente de codificación en IDE: el modelo puede integrarse en extensiones de VS Code o JetBrains para autocompletado, generación de funciones y refactorización, aprovechando su capacidad de razonamiento agéntico para sugerir cambios coherentes en múltiples archivos.
- Agente autónomo de resolución de issues: dado su enfoque en agentic coding, puede usarse en pipelines que reciben un issue de GitHub, analizan el repositorio, generan un parche y ejecutan tests, todo de forma autónoma.
- Generación de código en CI/CD: integrado en flujos de integración continua para generar tests unitarios, documentación de API o scripts de despliegue a partir de descripciones en lenguaje natural.
- Razonamiento matemático y lógico: gracias a su componente de razonamiento, puede emplearse en sistemas de tutoría inteligente o resolución de problemas matemáticos paso a paso.
- Chat técnico especializado: como chatbot de soporte para desarrolladores, respondiendo preguntas sobre APIs, frameworks o depuración de errores con contexto largo (si se confirma la ventana de contexto).
- Prototipado rápido de aplicaciones: el modelo puede generar esqueletos de proyectos completos (estructura de directorios, archivos de configuración, código inicial) a partir de una especificación breve.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo es un merge reciente sin evaluaciones independientes. Los modelos base (KAT-Coder y Ornith) tienen benchmarks publicados en sus respectivas páginas, pero no se pueden atribuir al modelo fusionado sin verificación.

## Requisitos de hardware

- VRAM estimada: al ser un MoE con 3B parámetros activos, la inferencia puede ejecutarse con menos VRAM que un modelo denso de 35B. Con cuantización de 4 bits (si se dispone de versión GGUF), podría caber en GPUs consumer de 12-16 GB, pero no hay datos oficiales.
- GPU recomendadas: para bfloat16 completo se necesitarían al menos 70-80 GB de VRAM (dos A100 40GB o una H100). Con cuantización, una RTX 4090 (24 GB) podría ser suficiente para inferencia con baja latencia.
- Opciones de despliegue: compatible con transformers, vLLM (si soporta la arquitectura híbrida), llama.cpp (si se convierte a GGUF) y Ollama (mediante importación de GGUF).
- Latencia y throughput: no disponibles. Al ser MoE con 3B activos, el throughput debería ser superior al de un modelo denso equivalente, pero depende del hardware y la implementación.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. El modelo es un merge de dos modelos de 35B MoE, por lo que se puede comparar conceptualmente con:

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-Qwopus-KAT-Coder-35B-Merged | 35B | 3B | no disponible | Apache 2.0 | Merge SLERP, híbrido GatedDeltaNet |
| Qwopus-KAT-Coder-35B-Merged | 35B | 3B (inferido) | no disponible | Apache 2.0 | Modelo base, orientado a código |
| Ornith-1.5-35B-A3B | 35B | 3B | no disponible | Apache 2.0 | Modelo base, agentic coding |

No hay benchmarks comparativos publicados para estos modelos en la información disponible.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un merge sin entrenamiento adicional, puede heredar sesgos de los modelos base y presentar alucinaciones en código, especialmente en APIs poco conocidas o versiones recientes.
- Riesgo de código incorrecto: la generación de código puede producir soluciones sintácticamente válidas pero lógicamente erróneas; se recomienda validación con tests.
- Contexto no confirmado: la longitud de contexto no está documentada, lo que dificulta su uso en tareas que requieran ventanas largas (repositorios completos).
- Idiomas limitados: no hay confirmación oficial de los idiomas soportados; probablemente inglés y chino, pero no se garantiza.
- Licencia Apache 2.0: permite uso comercial, pero los modelos base pueden tener atribuciones o condiciones adicionales que deben verificarse.
- Arquitectura experimental: la combinación GatedDeltaNet + attention periódica es poco común; la compatibilidad con frameworks de inferencia optimizada (vLLM, TensorRT-LLM) puede ser limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OliviaRossi/Ornith-Qwopus-KAT-Coder-35B-Merged
- Versión GGUF del modelo base: https://huggingface.co/OliviaRossi/Qwopus-KAT-Coder-35B-Merged-GGUF
- Página de Ornith AI: https://ornith.online/
- Blog de KAT-Coder: https://kwaipilot.github.io/KAT-Coder/
- LLM Explorer (ficha del modelo base): https://llm-explorer.com/model/OliviaRossi%2FQwopus-KAT-Coder-35B-Merged,3Y2aqqwGHdmx2pjPVVpGh4
