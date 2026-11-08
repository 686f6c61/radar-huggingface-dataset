# panitagorontalo/qwen2.5-7b-gorontalo-lora

## Resumen

`panitagorontalo/qwen2.5-7b-gorontalo-lora` es un adaptador LoRA de 16 bits (`bfloat16`, `r=32`, `lora_alpha=64`) entrenado sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`. Lo desarrolla Panita Research Gorontalo como parte de un proyecto de preservación digital y procesamiento de lenguaje natural para el bahasa Gorontalo (hulontalo), una lengua austronesia de la provincia de Gorontalo (Indonesia). El adaptador convierte un LLM generalista de 7B en un traductor bidireccional indonesio-gorontalo y en un motor de razonamiento morfológico para esa lengua de bajos recursos.

El problema que aborda es concreto: el gorontalo tiene un número reducido de raíces léxicas frente al indonesio moderno (KBBI), por lo que la traducción directa se queda corta. El autor compensa esa asimetría con cuatro estrategias lingüísticas (motor morfológico productivo, fonologización de préstamos, descomposición semántica con morfemas direccionales y puente de sinónimos/registro) destiladas de dos diccionarios de referencia de Prof. Dr. H. Mansoer Pateda (1987 y 2001).

El adaptador se entrenó con 87.880 muestras de SFT multitarea y se distribuye como pesos PEFT (repo de 0,3 GB) bajo licencia Apache 2.0. No es un modelo autónomo: requiere cargar el base Qwen2.5-7B-Instruct y aplicar el adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) + adaptador LoRA (PEFT) |
| Parametros totales | 7B en el modelo base; adaptador LoRA con `r=32`, `lora_alpha=64` (número exacto de parámetros del adaptador no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible; el adaptador se publica en `bfloat16` de 16 bits |
| Idiomas soportados | indonesio (`id`) y gorontalo (`gor`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA); requiere el base en safetensors |
| Tamano del repo | 0,3 GB |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Libreria | peft |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-7B-Instruct, un transformer decoder-only de la familia Qwen2.5 de Alibaba Cloud. El autor no detalla en la informacion disponible la configuración exacta de módulos objetivo del LoRA, la tasa de aprendizaje, el número de épocas ni la composición del split de validación. Sí especifica que el adaptador es de 16 bits en `bfloat16` con rango 32 y alpha 64, y que el repo pesa 0,3 GB.

El entrenamiento es un SFT multitarea de 87.880 muestras distribuidas en tareas de léxico (17.901 en cada dirección), traducción de frases completas (15.408 en cada dirección más 7.982 para la ortografía de 1987), puente de sinónimos KBBI (6.822), derivación morfológica (2.617), traducción de palabras con afijos (2.422), fonologización de préstamos (797), paráfrasis analítica con morfemas direccionales (589) y reglas gramaticales (33). La innovación técnica destacable es la incorporación explícita de conocimiento lingüístico en el dataset: un motor de afijos y morfofonémica (31 prefijos, infijos `-um-/-il-/-im-`, sufijos `-lo/-a/-i`, elisión consonántica `/t/→/l/`, `/s/→/n/`, `/p/→/m/`, `/k/→/ng/`, cambio vocálico `-o→-a` y cinco sistemas temporales), una regla de fonologización vocálica para préstamos, la descomposición con morfemas `mayi/mao/mola/mota` y la distinción de registro (`wau/yio` frente a `wa:tiya/ito`).

## Capacidades

- Traducción bidireccional indonesio ↔ gorontalo a nivel de palabra y de frase completa.
- Traducción desde la ortografía gorontalo de 1987 a indonesio.
- Derivación morfológica productiva: generación de palabras con afijos a partir de raíces.
- Fonologización de préstamos del indonesio al gorontalo (adaptación vocálica y silábica).
- Paráfrasis analítica mediante morfemas direccionales (`mayi`, `mao`, `mola`, `mota`).
- Gestión de registro: nivel habitual (`wau/yio`) frente a nivel honorífico (`wa:tiya/ito`).
- Consulta léxica tipo diccionario en ambas direcciones.
- Generación de texto conversacional y razonamiento heredados de Qwen2.5-7B-Instruct.
- Soporte de tool calling y function calling heredado del base (no validado específicamente para gorontalo en la informacion disponible).
- Capacidades multilingües limitadas a `id` y `gor` según la model card.

## Casos de uso

- Traducción de documentación administrativa: convertir comunicados y formularios del indonesio al gorontalo para oficinas locales de Gorontalo, aprovechando las 15.408 muestras de traducción de frases del entrenamiento.
- Digitalización de corpus históricos: transcribir y traducir textos en ortografía de 1987 al indonesio moderno, tarea cubierta por las 7.982 muestras específicas de `translate_gor1987_to_id`.
- Preservación léxica y lexicografía: generar entradas de diccionario y variantes derivadas a partir de raíces, apoyándose en las 5.039 muestras de morfología (derivación y traducción con afijos).
- Localización de contenidos educativos: adaptar materiales escolares del indonesio al gorontalo, con control de registro para contextos formales (`wa:tiya/ito`) frente a informales (`wau/yio`).
- Atención ciudadana bilingüe: desplegar un asistente conversacional que responda en gorontalo a consultas en indonesio, reutilizando el pipeline de text-generation y la naturaleza instruct del base.
- Adaptación de terminología moderna: incorporar neologismos y préstamos del indonesio (tecnología, sanidad, administración) aplicando la regla de fonologización vocálica (797 muestras de `loanword_phonologization`).
- Investigación en lingüística austronesia: usar el modelo como herramienta de anotación y generación de hipótesis morfológicas para comparar sistemas de afijos en lenguas del grupo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index (no verificados de forma independiente, `verified: false`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Traducción ID → GOR | Korpus Terpadu Dwibahasa Kamus Prof. Dr. H. Mansoer Pateda (1987 & 2001) | SacreBLEU (clean test) | 24,26 |
| Traducción ID → GOR | Korpus Terpadu Dwibahasa Kamus Prof. Dr. H. Mansoer Pateda (1987 & 2001) | chrF++ (clean test) | 40,21 |
| Traducción GOR (1987) → ID | Korpus Terpadu Dwibahasa Kamus Prof. Dr. H. Mansoer Pateda (1987 & 2001) | SacreBLEU (clean test) | 17,75 |
| Traducción GOR (1987) → ID | Korpus Terpadu Dwibahasa Kamus Prof. Dr. H. Mansoer Pateda (1987 & 2001) | chrF++ (clean test) | 44,66 |

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni otras tareas de razonamiento general.

## Requisitos de hardware

- VRAM estimada para inferencia: el base Qwen2.5-7B-Instruct ocupa aproximadamente 15 GB en `bfloat16`/FP16 y en torno a 4,5-5 GB en cuantización de 4 bits (GGUF Q4_K_M o AWQ/GPTQ de 4 bits). El adaptador LoRA añade una fracción pequeña sobre esa cifra (repo de 0,3 GB).
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para FP16 con throughput alto; RTX 4090 (24 GB) y RTX A6000 (48 GB) son suficientes para FP16 en una sola tarjeta.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en FP16 con margen justo, y en GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080) si se cuantiza a 4 bits.
- Opciones de despliegue: vLLM o TGI con soporte de adaptadores PEFT; llama.cpp/Ollama requieren fusionar el adaptador con el base y convertir a GGUF; también es viable `transformers` + `peft` para prototipado.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-7b-gorontalo-lora | 7B (base) + LoRA | no disponible (heredado de Qwen2.5-7B-Instruct) | Traducción y morfología ID ↔ GOR | Apache 2.0 | Hugging Face (PEFT) |
| Qwen/Qwen2.5-7B-Instruct | 7B | no disponible en la informacion proporcionada | LLM generalista instruct | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-7B | 8B (según la model card del base) | no disponible en la informacion proporcionada | LLM base | Apache 2.0 | Hugging Face |

No se dispone en la informacion proporcionada de adaptadores comparables para gorontalo ni de métricas de otras soluciones de traducción para esa lengua, por lo que la comparación cuantitativa con alternativas directas queda como no disponible.

## Limitaciones y advertencias

- El adaptador depende del base Qwen2.5-7B-Instruct: no funciona de forma autónoma y hereda sus sesgos y alucinaciones.
- Los benchmarks son declarados por el autor con `verified: false`; conviene reproducirlos antes de usarlos como referencia en producción.
- El corpus de entrenamiento proviene de dos diccionarios (1987 y 2001), lo que puede limitar el vocabulario a registros y terminología de esas obras y no cubrir neologismos no contemplados.
- La cobertura lingüística se restringe a `id` y `gor`; el rendimiento fuera de ese par no está documentado.
- La calidad en la dirección GOR → ID es notablemente inferior en BLEU (17,75) que en ID → GOR (24,26), lo que sugiere asimetría de rendimiento.
- Riesgo de alucinación en léxico y morfología: el modelo puede generar derivaciones gramaticalmente plausibles pero inexistentes; requiere validación con hablantes nativos o fuentes lexicográficas.
- No hay información sobre el split de validación, el proceso de limpieza del corpus ni las métricas de evaluación humana.
- Licencia Apache 2.0 permite uso comercial, pero debe respetarse la atribución y las condiciones del modelo base Qwen2.5-7B-Instruct.
- No se documentan evaluaciones de sesgo, toxicidad ni robustez adversarial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/panitagorontalo/qwen2.5-7b-gorontalo-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Modelo base (variante no instruct): https://huggingface.co/Qwen/Qwen2.5-7B
- Guía de despliegue y fine-tuning de Qwen2.5 en Alibaba Cloud PAI: https://www.alibabacloud.com/help/en/pai/use-cases/deploy-fine-tune-and-evaluate-a-qwen2-5-model
- Dataset de referencia citado en la model card: `panitagorontalo/gorontalo-indonesia-parallel` (no se ha localizado URL directa en la busqueda web)
