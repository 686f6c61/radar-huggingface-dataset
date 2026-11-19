# mradermacher/Qwopus3.8-27B-Coder-Flash-i1-GGUF

## Resumen

Qwopus3.8-27B-Coder-Flash-i1-GGUF es la versión cuantizada en formato GGUF del modelo Qwopus3.8-27B-Coder-Flash, desarrollado originalmente por Jackrong y cuantizado por mradermacher. Se trata de un modelo multimodal de tipo image-text-to-text orientado a generación de código, razonamiento y uso de herramientas, construido sobre la arquitectura Qwen3.5 según los tags del repositorio. Con 27.320.697.856 parámetros totales (aproximadamente 27,3 mil millones), está diseñado para tareas de codificación y agentes que requieren capacidades de razonamiento multi-paso.

El modelo resuelve el problema de desplegar un modelo de ~27B con capacidades multimodales y de código en hardware más modesto, gracias a la cuantización con imatrix (weighted/imatrix quants) que preserva la calidad en rangos de 2 a 6 bits. Los cuantos i1 de mradermacher están pensados para ofrecer mejor relación calidad/tamaño que los cuantos estáticos equivalentes, con especial énfasis en los formatos IQ.

La relevancia actual radica en su combinación de licencia Apache 2.0, soporte multilingüe (inglés y chino), capacidades de visión y tool calling, y un rango de cuantizaciones que va desde 11 GB (i1-Q2_K) hasta 22,5 GB (i1-Q6_K), lo que permite su ejecución en GPUs de consumo de gama alta con suficiente VRAM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5 según tags |
| Parámetros totales | 27.320.697.856 (~27,3B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (más imatrix) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |
| Tamaño del repositorio | 218,6 GB |
| Modelo base | Jackrong/Qwopus3.8-27B-Coder-Flash |
| Pipeline | image-text-to-text |
| Fecha de creación | 2026-11-01 |
| Última actualización | 2026-11-07 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de los tags del repositorio, que indican la familia Qwen3.5 y un diseño multimodal de tipo image-text-to-text. El modelo base es un fine-tune de Jackrong orientado a código, razonamiento, tool-use y agentes, lo que sugiere un ajuste específico sobre un modelo Qwen3.5 preentrenado para potenciar capacidades de programación y razonamiento multi-paso.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La cuantización realizada por mradermacher emplea imatrix (importance matrix) para generar cuantos ponderados, una técnica que ajusta la precisión de cada tensor según su importancia para la perplejidad, mejorando la calidad frente a cuantizaciones estáticas de tamaño similar. El repositorio incluye el archivo imatrix para que otros usuarios puedan generar sus propios cuantos.

## Capacidades

- Generación de código y code-generation, según los tags del modelo (`coding`, `code-generation`).
- Razonamiento (`reasoning`) y razonamiento multi-paso para agentes (`agent`).
- Uso de herramientas y function calling (`tool-use`).
- Procesamiento multimodal image-text-to-text: acepta imágenes y texto como entrada.
- Capacidades conversacionales multi-turno (`conversational`).
- Soporte multilingüe limitado a inglés (en) y chino (zh).
- Inferencia eficiente (`efficient-inference`), reforzada por la disponibilidad de cuantizaciones GGUF.
- Compatibilidad con vLLM (tag `vllm`) y con endpoints compatibles (`endpoints_compatible`).

## Casos de uso

- **Generación de código en producción**: el modelo puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar tests, aprovechando su especialización en código y su soporte de tool calling para invocar linters o ejecutores de tests.
- **Asistentes de programación con contexto visual**: al ser image-text-to-text, puede analizar capturas de pantalla de interfaces, diagramas de arquitectura o mensajes de error renderizados en imagen y generar código o explicaciones a partir de ellos.
- **Agentes autónomos de resolución de tareas**: su capacidad de razonamiento multi-paso y tool-use permite construir agentes que descompongan tareas, invoquen APIs y verifiquen resultados de forma iterativa.
- **Automatización de revisión de código**: puede analizar fragmentos de código y generar comentarios de revisión, sugerencias de refactorización o detección de patrones problemáticos, desplegado con llama.cpp u Ollama en estaciones de trabajo.
- **Documentación técnica a partir de diagramas**: dado un diagrama o esquema en imagen, el modelo puede generar documentación descriptiva o código que lo implemente, útil en equipos que trabajan con especificaciones visuales.
- **Atención al cliente técnica bilingüe (en/zh)**: puede gestionar conversaciones multi-turno en inglés y chino para soporte de producto técnico, con capacidad de invocar herramientas de consulta de estado o tickets.
- **Prototipado rápido en hardware de consumo**: gracias a los cuantos i1-Q4_K_M (16,9 GB) e i1-Q4_K_S (15,9 GB), es viable ejecutarlo localmente para experimentación y desarrollo sin depender de infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada según cuantización** (tamaño del archivo GGUF, requiere VRAM adicional para contexto y overhead):
  - i1-Q2_K: ~11,0 GB
  - i1-Q3_K_S / IQ3_S / IQ3_M: ~12,4–12,9 GB
  - i1-Q3_K_M / Q3_K_L: ~13,6–14,7 GB
  - i1-IQ4_XS / Q4_0 / Q4_K_S: ~15,4–15,9 GB
  - i1-Q4_K_M / Q4_1: ~16,9–17,4 GB
  - i1-Q5_K_S / Q5_K_M: ~19,1–19,6 GB
  - i1-Q6_K: ~22,5 GB
- **GPU recomendadas**: para cuantos Q4–Q5, GPUs con 20–24 GB de VRAM (RTX 3090, RTX 4090, RTX 5090). Para Q6_K, 24 GB o más. Para despliegues en servidor, A100 40/80 GB o H100 permiten ejecutar el modelo sin cuantizar o con cuantos altos y contexto amplio.
- **¿Cabe en GPU de consumo?**: sí, en GPUs de 16 GB o más con cuantos Q2–Q4; en GPUs de 24 GB caben cuantos hasta Q6_K con margen para contexto.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, y vLLM (el modelo base está etiquetado para vLLM; para GGUF se usa llama.cpp o servidores compatibles). El repositorio incluye archivos mmproj en el repositorio estático para el procesamiento de visión.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Qwopus3.8-27B-Coder-Flash (este) | ~27,3B | no disponible | Sí (image-text-to-text) | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-Coder-32B | ~32,5B | 128K (según versión) | No | Apache 2.0 | safetensors, GGUF |
| DeepSeek-Coder-V2-Lite | ~16B (MoE, 2,4B activos) | 128K | No | DeepSeek License | safetensors, GGUF |
| Codestral-22B | ~22B | 32K | No | MNPL (no comercial) | safetensors, GGUF |

La comparación se ofrece a título orientativo de categoría (modelos de código de 20–32B); no se dispone de datos de rendimiento del modelo evaluado para establecer comparaciones cuantitativas. La principal diferencia de Qwopus3.8-27B-Coder-Flash es su naturaleza multimodal (visión) y su licencia Apache 2.0 permisiva, frente a alternativas como Codestral con licencia no comercial.

## Limitaciones y advertencias

- **Idiomas limitados**: solo inglés y chino; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- **Riesgo de alucinación**: como todo modelo generativo, puede producir código o afirmaciones incorrectas; se recomienda validación en producción.
- **Sesgos**: no se dispone de información sobre evaluación de sesgos; el modelo hereda los sesgos de sus datos de entrenamiento y del modelo base.
- **Contexto**: la longitud de contexto no está documentada en la información disponible, lo que dificulta planificar despliegues con ventanas largas.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base (Jackrong/Qwopus3.8-27B-Coder-Flash) y de los datos de entrenamiento originales.
- **Cuantización**: los cuantos de 2–3 bits (i1-Q2_K, i1-Q3_K_S) degradan la calidad; para producción se recomienda i1-Q4_K_M o superior.
- **Visión en GGUF**: los archivos mmproj necesarios para el procesamiento de imágenes están en el repositorio estático, no en este; hay que descargarlos por separado.
- **Fecha del modelo**: las fechas del repositorio (noviembre de 2026) son posteriores a la fecha actual de referencia; verificar la vigencia y procedencia de los artefactos antes de usarlos en producción.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Qwopus3.8-27B-Coder-Flash-i1-GGUF
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash
- Cuantos estáticos: https://huggingface.co/mradermacher/Qwopus3.8-27B-Coder-Flash-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwopus3.8-27B-Coder-Flash-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantos (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
