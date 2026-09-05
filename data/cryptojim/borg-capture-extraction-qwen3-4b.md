# Cryptojim/borg-capture-extraction-qwen3-4b

## Resumen

El modelo borg-capture-extraction-qwen3-4b es un adaptador LoRA de 7,34 millones de parámetros desarrollado por Cryptojim para el sistema de memoria compartida local-first Borg. Se construye sobre el modelo base Qwen3-4B-Instruct-2507 en formato MLX de 4 bits, y su función es leer transcripciones de sesiones de agentes y emitir candidatos de memoria persistente en JSON, cada uno con un hecho, su tipo y una referencia al texto de apoyo. El problema que resuelve es la extracción de hechos duraderos de conversaciones de agentes, un paso clave para dotar de memoria a sistemas autónomos sin depender de la nube. Es relevante porque ofrece un adaptador ligero (0,182 % de parámetros entrenables) que se ejecuta en Apple Silicon con MLX, y su evaluación de formato es sólida, aunque la fidelidad del contenido aún no está medida.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-4B) con adaptador LoRA de rango 8 |
| Parametros totales | 4.000 millones (modelo base) + 7,34 millones (adaptador LoRA) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantización | 4-bit (modelo base MLX) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | MLX (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 8 aplicado a 16 capas del transformer Qwen3-4B. El entrenamiento se realizó con `mlx_lm lora`, con tamaño de lote 4, longitud de secuencia de 4096 tokens y tasa de aprendizaje 1e-5, durante 3.200 iteraciones y aproximadamente 22,3 millones de tokens. Los pares de entrenamiento se destilaron de un entorno real de operador único, pero con identificadores sensibles (nombres de clientes, dominios, contactos, números de teléfono y cadenas con forma de token) reemplazados por sustitutos sintéticos antes del entrenamiento. No se menciona el uso de RLHF ni DPO.

La innovación técnica principal es el formato de salida: el modelo genera un objeto JSON con una lista de candidatos, cada uno con los campos `fact`, `kind` y `support`. El campo `support` es una cita literal del texto de entrada, lo que garantiza que cada hecho extraído sea trazable a su fuente. Además, el adaptador está diseñado para funcionar exclusivamente con el checkpoint exacto `mlx-community/Qwen3-4B-Instruct-2507-4bit`, ya que un adaptador LoRA es un delta sobre pesos congelados específicos.

## Capacidades

- Extracción de candidatos de memoria: lee transcripciones de sesiones de agentes y emite objetos JSON con `fact`, `kind` y `support`.
- Referencia al texto de apoyo: cada candidato incluye una cita literal del texto que lo sustenta.
- Generación de JSON válido: en la evaluación, el 100 % de las salidas (300/300) fueron JSON válidos.
- Sobregeneración controlada: tiende a producir 1,756 veces más candidatos que el número de hechos del profesor, lo que puede ser útil para no perder información.
- Sin capacidad de tool calling, visión ni audio: es un modelo de texto puro especializado en extracción.
- Multilingüe: no especificado en la información disponible.

## Casos de uso

- Memoria persistente para agentes autónomos: el modelo extrae hechos de cada sesión y los almacena en el sistema Borg, permitiendo que el agente recuerde información entre conversaciones.
- Construcción de grafos de conocimiento: el campo `kind` permite clasificar los hechos (por ejemplo, relaciones, atributos) y alimentar nodos y aristas de un grafo local.
- Análisis de transcripciones de soporte: en un entorno de atención al cliente, el modelo puede convertir logs de conversaciones en fichas de hechos estructurados con su cita de origen.
- Auditoría y trazabilidad de agentes: al incluir `support` en cada candidato, se puede verificar de dónde salió cada hecho, lo que facilita la depuración y la auditoría.
- Alimentación de sistemas RAG locales: los candidatos extraídos se indexan como documentos en un almacén vectorial para recuperación posterior.
- Integración en pipelines de agentes local-first: al ser un adaptador MLX ligero, se ejecuta en Apple Silicon sin necesidad de servicios externos, ideal para entornos con requisitos de privacidad.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Examen de validación | 300 pares depurados |
| JSON válido | 300/300 (100 %) |
| Fracción de referencias de apoyo | 1,0 (todos los candidatos citan su texto de apoyo) |
| Ratio de número de candidatos | 1,756 (sobre-genera ~1,8x el recuento de hechos del profesor) |
| Jaccard de hechos con coincidencia exacta | 0,006 — tratar como no medido, no como fallo |
| Serving (M3 Ultra, con contención) | ~8,1 tok/s, ~29,6 s/ítem |
| Entrenamiento | 3.200 iteraciones, ~22,3M tokens, 7,34M parámetros entrenables (0,182 %) |
| Sonda de memorización | 36 generaciones, 56 términos del registro — 0 coincidencias |
| Canary de promoción | No aplicado. Artefacto de investigación |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este adaptador.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. El modelo base en 4-bit MLX ocupa aproximadamente 2,5 GB de memoria unificada en Apple Silicon; el adaptador añade un delta de 7,34 M parámetros.
- GPU recomendada: Apple Silicon (M3 Ultra según la evaluación). No se indica soporte para GPU NVIDIA o AMD.
- Despliegue: requiere `mlx-lm`. Comando: `python -m mlx_lm generate --model mlx-community/Qwen3-4B-Instruct-2507-4bit --adapter-path <repo> --prompt "..."`
- Latencia: ~8,1 tok/s y ~29,6 s por ítem en un M3 Ultra con carga compartida.
- No se mencionan opciones como vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No disponible en la información proporcionada.

## Limitaciones y advertencias

- Fidelidad de contenido desconocida: la métrica de Jaccard exacta es 0,006; el autor advierte que no se debe confiar en la fidelidad del contenido hasta que exista una evaluación semántica.
- Riesgo de alucinación: al ser un modelo generativo, puede producir hechos no respaldados por el texto, a pesar de que el formato exige una cita.
- Solo funciona con el checkpoint base exacto: `mlx-community/Qwen3-4B-Instruct-2507-4bit`. Usarlo con otro modelo base puede dar resultados incorrectos.
- Sesgos: no se han evaluado sesgos en la información disponible.
- Licencia MIT: permite uso comercial, pero el autor lo califica como artefacto de investigación y no canaried, por lo que no está listo para producción.
- Limitación de idioma: no se especifican los idiomas soportados; el entrenamiento se hizo con datos en inglés probablemente, pero no se confirma.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Cryptojim/borg-capture-extraction-qwen3-4b
- Repositorio del proyecto Borg: https://github.com/h3ro-dev/borg
- Modelo base en HuggingFace: https://huggingface.co/mlx-community/Qwen3-4B-Instruct-2507-4bit
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
