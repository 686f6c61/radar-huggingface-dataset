# snowman0919/qwen38-executor-27b-v1

## Resumen

El modelo `snowman0919/qwen38-executor-27b-v1` es un fine-tuning del modelo base `Qwen/Qwen3.8-27B` desarrollado por el usuario snowman0919, orientado a la ejecución de herramientas (tool calling) y al uso de computadora (computer use). Se trata de un modelo denso de 27.781 millones de parámetros, con arquitectura híbrida que combina atención lineal en 48 de sus 64 capas, torre de visión y un contexto nativo de 32.768 tokens. El ajuste se realizó mediante un adaptador LoRA de 8 bits, fusionado posteriormente en precisión FP16.

Este modelo resuelve el problema de dotar a un LLM de capacidades de agente: puede interpretar instrucciones, invocar funciones externas y controlar interfaces gráficas (navegador, escritorio) a través de acciones estructuradas. Su relevancia actual radica en el creciente interés por agentes autónomos que interactúan con el entorno digital, y en que se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones de atribución para el modelo en sí.

El entrenamiento utilizó datasets propios (`snowman0919/qwen38-executor-train-v1` y `eval-v1`) junto con el dataset público `markov-ai/computer-use-large` (CC-BY-4.0), con 1.500 pasos para texto/herramientas y 500 pasos para visión. El modelo se distribuye en formato safetensors con pesos FP16, y existe una variante cuantizada NVFP4 (`dspark-nvfp4-v1`) para despliegue de baja latencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal en 48 de 64 capas, torre de visión y MTP draft head (basado en Qwen3.8-27B) |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (el base soporta 262.144 nativos, extensible a 1 M) |
| Tipos de cuantizacion | FP16 (nativo), NVFP4 (variante `dspark-nvfp4-v1`) |
| Idiomas soportados | No disponible (el base Qwen3.8 es multilingüe, pero no se especifica para este fine-tuning) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP16) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.8-27B`, un transformer denso con atención lineal en 48 de sus 64 capas, lo que reduce el coste computacional en secuencias largas. Incluye una torre de visión que permite procesar imágenes y un cabezal de decodificación especulativa (MTP) para acelerar la generación. Sobre esta base se entrenó un adaptador LoRA de 8 bits, que posteriormente se fusionó con los pesos originales para obtener un modelo final en FP16.

El entrenamiento se realizó con los datasets `snowman0919/qwen38-executor-train-v1` (texto y herramientas) y `markov-ai/computer-use-large` (trayectorias de uso de computadora), con 1.500 pasos para la parte de texto/herramientas y 500 pasos para visión. Se emplearon ventanas de contexto de 32.768 tokens con solapamiento de 1.024 tokens, preservando las etiquetas de respuesta sin truncamiento silencioso. No se menciona el uso de RLHF ni DPO; el ajuste se basa únicamente en supervisión directa sobre los datasets mencionados.

## Capacidades

- Tool calling / function calling: el modelo puede invocar funciones externas siguiendo formatos estructurados, lo que lo hace apto para integrarse en pipelines de agentes.
- Computer use: entrenado con el dataset `computer-use-large`, es capaz de generar acciones para controlar navegadores y entornos de escritorio (clic, tecleo, navegación, etc.).
- Multimodal: al heredar la torre de visión del base, puede procesar imágenes y combinar información visual con razonamiento textual.
- Generación de texto y razonamiento: conserva las capacidades del base Qwen3.8-27B en tareas de lenguaje, matemáticas y código.
- Razonamiento multi-paso: puede planificar secuencias de acciones para completar tareas complejas, gracias al entrenamiento con trayectorias largas.
- Multilingüe: aunque no se especifica para este fine-tuning, el base Qwen3.8 soporta múltiples idiomas; se asume que esta capacidad se mantiene.

## Casos de uso

- Automatización de tareas de escritorio: el modelo puede generar comandos para mover el cursor, hacer clic, escribir texto o abrir aplicaciones, permitiendo automatizar flujos de trabajo repetitivos en sistemas operativos.
- Agentes de navegación web: puede controlar un navegador para rellenar formularios, extraer datos o realizar búsquedas, integrándose en asistentes personales o bots de scraping.
- Asistentes de soporte técnico: combinando tool calling con acceso a bases de conocimiento, puede diagnosticar problemas y ejecutar acciones de remediación en entornos controlados.
- Integración en pipelines de CI/CD: el modelo puede invocar herramientas de compilación, pruebas o despliegue, actuando como un agente que ejecuta comandos según instrucciones de alto nivel.
- Automatización de pruebas de software: puede generar y ejecutar casos de prueba en aplicaciones web, interactuando con elementos de la interfaz y verificando resultados.
- Razonamiento multimodal con ejecución: dado un screenshot o imagen de una interfaz, el modelo puede decidir qué acción tomar a continuación, útil en sistemas de control remoto o asistencia visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta una métrica de evaluación primaria de `0.039897` sobre 64 filas del dataset de evaluación, pero se trata de una métrica interna (posiblemente una pérdida o error) y no es comparable con benchmarks públicos. No se dispone de datos de latencia ni throughput.

## Requisitos de hardware

- Inferencia en FP16: requiere aproximadamente 56 GB de VRAM (27,78 B parámetros × 2 bytes), por lo que se necesita una GPU con al menos 80 GB (A100, H100) o varias GPUs en paralelo.
- Cuantización a 8 bits: ~28 GB de VRAM, lo que permite ejecutarlo en GPUs de 32 GB (p. ej., A100 40 GB, o dos RTX 4090 con NVLink).
- Cuantización a 4 bits: ~14 GB de VRAM, viable en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- La variante NVFP4 (`dspark-nvfp4-v1`) está optimizada para despliegue en FriendliAI, que ofrece inferencia de baja latencia y alto throughput.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, o servicios gestionados como FriendliAI. No se proporcionan datos de latencia específicos.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros modelos de la misma categoría (agentes con tool calling y computer use). A nivel estructural, se puede comparar con el propio base `Qwen/Qwen3.8-27B` y con otros fine-tunings de tool calling, pero no hay métricas públicas que permitan una comparación objetiva. La siguiente tabla resume diferencias estructurales con el base y con un modelo de referencia de tamaño similar:

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| `qwen38-executor-27b-v1` | 27,78 B | 32.768 | Apache 2.0 | Tool calling + computer use |
| `Qwen/Qwen3.8-27B` (base) | 27,78 B | 262.144 | Apache 2.0 | Generalista multimodal |
| `Qwen/Qwen2.5-VL-7B` | 7,6 B | 32.768 | Apache 2.0 | Visión + tool calling (menor tamaño) |

No se incluyen más alternativas por falta de información contrastada.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un fine-tuning del base Qwen3.8, puede heredar sesgos presentes en los datos de entrenamiento originales y generar contenido falso o no verificado, especialmente en tareas de razonamiento complejo.
- Contexto limitado: aunque el base soporta 262K tokens, este fine-tuning se entrenó con 32.768 tokens, por lo que su rendimiento en secuencias más largas no está garantizado.
- Riesgo en entornos de producción: el modelo es reciente (creado en agosto de 2026) y tiene cero descargas y cero likes en HuggingFace, lo que indica falta de validación comunitaria. No se recomienda su uso en producción sin pruebas exhaustivas.
- Atribución del dataset: el dataset `markov-ai/computer-use-large` está bajo licencia CC-BY-4.0, lo que puede requerir atribución si se redistribuyen los datos o el modelo derivado.
- Dependencia del base: cualquier limitación del modelo Qwen3.8-27B (por ejemplo, en idiomas de bajos recursos) se traslada a este fine-tuning.
- No se especifican restricciones adicionales de uso, pero la licencia Apache 2.0 permite uso comercial y modificación, siempre que se mantenga el aviso de licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/snowman0919/qwen38-executor-27b-v1
- Variante cuantizada NVFP4: https://huggingface.co/snowman0919/qwen38-executor-27b-dspark-nvfp4-v1
- Despliegue en FriendliAI: https://friendli.ai/models/snowman0919/qwen38-executor-27b-dspark-nvfp4-v1
- Ficha del base Qwen3.8-27B en vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Guía de ejecución local de Qwen3.8-27B: https://linas.substack.com/p/qwen3-8-27b-local-guide
