# marcoeg/chiara-qwen3-14b

## Resumen

Chiara es un modelo de persona derivado de Qwen/Qwen3-14B, desarrollado por marcoeg mediante fine-tuning con QLoRA y DPO. El modelo adopta la voz de la tradición católica leída desde la teología de la liberación y el testimonio franciscano: opción preferencial por los pobres, comunidades eclesiales de base, método ver-juzgar-actuar, cuidado de la creación en clave de Laudato Si' y la enseñanza del CELAM (Medellín, Puebla y Aparecida). Toma el nombre de Santa Clara de Asís.

Con 14.768.307.200 parámetros y un repositorio de 38,5 GB, se publica en safetensors bf16 (unos 30 GB) y en GGUF Q4_K_M (unos 9 GB), lo que permite ejecución tanto en GPUs de datacenter como en GPUs consumer de 12-16 GB o Macs con Apple Silicon. Su relevancia radica en ser un ejemplo explícito de alineación por valores: el autor sostiene que todo LLM alineado expresa una cosmovisión, y este proyecto nombra la suya en lugar de presentarse como neutral.

El modelo está pensado para exploración teológica, escritura homilética y investigación sobre fine-tuning de persona y alineación de valores, no como sustituto de orientación pastoral ni como fuente neutral sobre religión o política. Es el modelo compañero de Rosa (marcoeg/rosa-qwen3-14b), una persona anarcosindicalista entrenada con la misma metodología.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-14B); fine-tuning QLoRA + DPO |
| Parametros totales | 14.768.307.200 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (configuración recomendada por el autor) |
| Tipos de cuantizacion | Q4_K_M (GGUF); pesos originales bf16; entrenamiento en NF4 (QLoRA) |
| Idiomas soportados | en (único idioma evaluado) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16), GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-14B, un transformer decoder-only de 14,7 mil millones de parámetros, y se entrena en dos fases sobre ese base. La primera fase es SFT con QLoRA (NF4) usando TRL SFTTrainer sobre 2.582 conversaciones en formato ShareGPT, generadas a partir de 16 fuentes: el canon de la teología de la liberación (Gutiérrez, Boff, Sobrino, Gebara), documentos del CELAM, encíclicas del papa Francisco, fuentes franciscanas primarias (Francisco y Clara) y homilías de Romero. El adaptador LoRA usa r=16, α=32 sobre todas las proyecciones de atención y MLP, durante 2 épocas, con split train/eval disjunto por fuente.

La segunda fase aplica DPO con QLoRA (NF4) y TRL DPOTrainer sobre 1.520 pares de preferencia on-policy: la respuesta elegida es la respuesta dorada con la voz de Chiara y la rechazada es la propia respuesta del modelo SFT sin el prompt de persona. Se usa β=0.1, pérdida sigmoide y 95 pasos, entrenando sobre el modelo SFT ya fusionado. El adaptador DPO se fusiona en el modelo SFT fusionado y el resultado se exporta a bf16 safetensors y a GGUF Q4_K_M mediante convert_hf_to_gguf.py y llama-quantize. El modo thinking de Qwen3 se desactiva (/no_think) durante el uso.

## Capacidades

- Generación de texto conversacional multi-turno con voz reflexiva y homilética, contemplativa y profética.
- Comentario y reflexión sobre teología de la liberación, doctrina social católica y tradición franciscana.
- Escritura estilo homilía y ensayo sobre pobreza, trabajo, ecología y vida comunitaria.
- Explicación del método ver-juzgar-actuar y de documentos del CELAM (Medellín, Puebla, Aparecida).
- Análisis en clave de no violencia y compromiso con la justicia social.
- Persona explícita y no proselitista: testifica una postura sin pretender reclutar.
- Soporte de plantilla de chat con system prompt específico (system_prompt.md) y modo thinking desactivado.
- Capacidades heredadas de Qwen3-14B en generación de texto general; no se documentan tool calling, agentes, visión ni audio en la información disponible.
- Multilingüe: solo inglés evaluado.

## Casos de uso

- Exploración y estudio de teología de la liberación: el modelo responde a preguntas sobre Gutiérrez, Boff, Sobrino o Gebara con la voz y el marco de la tradición, útil como herramienta de estudio guiada.
- Redacción de homilías y reflexiones: genera textos de 1.500-2.500 caracteres con estructura sermónica, adecuados como borrador para predicadores o escritores.
- Comentario sobre doctrina social de la Iglesia: interpreta encíclicas y documentos del CELAM desde la opción preferencial por los pobres, para divulgación o formación.
- Investigación sobre alineación de persona: sirve como caso de estudio reproducible de SFT + DPO con QLoRA para estudiar cómo se inculca y se mide una voz concreta.
- Educación sobre tradición franciscana: explica fuentes primarias de Francisco y Clara de Asís con ejemplos de comunidades de base.
- Debates sobre ecología integral: aborda el cuidado de la creación en clave de Laudato Si' para materiales divulgativos o talleres.
- Prototipos de chat con persona: desplegable con Ollama o llama.cpp en hardware modesto (Q4_K_M en unos 11 GB) para demos interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 30 GB (pesos safetensors).
- VRAM para inferencia en Q4_K_M: aproximadamente 11 GB de VRAM o memoria unificada.
- GPU recomendadas: para bf16, GPUs de datacenter tipo A100 o H100; para Q4_K_M, GPUs consumer de 12-16 GB (por ejemplo, RTX 4090 o RTX 4080) o Macs con Apple Silicon.
- Cabe en GPU consumer: sí, con la cuantización Q4_K_M en 12-16 GB.
- Opciones de despliegue: transformers, vLLM, llama.cpp, Ollama (Modelfile incluido), text-generation-inference (tag endpoints_compatible).
- Ajustes recomendados: temperature 0.7, top_p 0.9, top_k 50, contexto 8192, unos 1024 tokens nuevos por respuesta.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| chiara-qwen3-14b | 14,7 B | 8192 (recomendado) | apache-2.0 | safetensors bf16 + GGUF Q4_K_M | Persona teológica; sin benchmarks publicados |
| Qwen/Qwen3-14B (base) | 14,7 B | no disponible en la informacion | apache-2.0 | safetensors, GGUF | Modelo base sin persona; benchmarks propios del autor del base |
| rosa-qwen3-14b | 14,7 B (presumible, mismo base) | no disponible | apache-2.0 | no disponible | Persona anarcosindicalista entrenada con la misma metodología |
| Otros modelos de persona de 14B | no disponible | no disponible | no disponible | no disponible | No se dispone de comparativas de rendimiento |

## Limitaciones y advertencias

- Punto de vista teológico por diseño: no es neutral sobre religión ni política y no representa a la Iglesia como institución.
- No sustituye orientación pastoral o espiritual.
- Riesgo de alucinación: puede atribuir mal o inventar referencias bíblicas, citas papales e historia eclesiástica, especialmente tras cuantización a 4 bits; verificar citas antes de usarlas.
- Estructura repetitiva: tiende a antítesis "no X, sino Y", cierres familiares y un conjunto reducido de motivos y pasajes.
- No impersona a Santa Clara ni a ninguna persona viva o canonizada; si se despliega como agente, hay que informar a los usuarios de que hablan con una IA.
- Solo inglés evaluado; no hay garantías de calidad en castellano u otros idiomas.
- Licencia Apache-2.0 para los pesos; los textos de terceros del corpus conservan sus licencias originales y el corpus no se redistribuye.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/marcoeg/chiara-qwen3-14b
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Modelo compañero Rosa: https://huggingface.co/marcoeg/rosa-qwen3-14b
- Demo en el navegador: https://huggingface.co/spaces/marcoeg/chiara-chat
