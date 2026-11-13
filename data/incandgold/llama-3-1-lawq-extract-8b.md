# incandgold/Llama-3.1-LawQ-Extract-8B

## Resumen

Llama-3.1-LawQ-Extract-8B es un adaptador LoRA publicado por el usuario incandgold sobre el modelo base `taide/Llama-3.1-TAIDE-LX-8B-Chat`, un transformer denso de 8B parámetros desarrollado por NARLabs (Taiwán) a partir de la arquitectura Llama 3.1. El adaptador está especializado en una única tarea de extracción de información: leer el texto completo de una sentencia judicial taiwanesa y devolver un objeto JSON con 15 campos estructurados (jueces, abogados, demandantes, demandados, veredicto, fiscales, peritos, cargos, cuestiones jurídicas, resumen, fecha y lugar del delito, factores de sentencing, importe, condena y testigos expertos).

El modelo resuelve un problema muy concreto de automatización documental en el ámbito legal: convertir resoluciones judiciales no estructuradas en registros tabulares consultables. Es relevante para equipos que trabajan con corpus judiciales en chino tradicional (Taiwán) y necesitan pipelines de extracción reproducibles, ya que el adaptador se distribuye como pesos PEFT de ~168 MB que se superponen al modelo base sin modificarlo, y se puede servir con vLLM usando `--enable-lora`.

Técnicamente es un LoRA de rango 16 y alpha 32 aplicado a las siete proyecciones de atención y MLP, entrenado con SFT sobre 54.679 sentencias del portal de datos abiertos del Judicial Yuan. El contexto operativo es de 32.768 tokens y el modelo solo soporta chino tradicional. La licencia es la TAIDE L-class, derivada de Llama 3.1, con restricciones específicas sobre datos personales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1) con adaptador LoRA sobre TAIDE-LX-8B-Chat |
| Parámetros totales | 8B en el modelo base; el adaptador LoRA ocupa ~168 MB |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (configuración de entrenamiento e inferencia) |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | Chino tradicional (zh, Taiwán) |
| Licencia | llama3.1-taide-models-license (TAIDE L-class, derivada de Llama 3.1) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere modelo base aparte |
| Rango LoRA / alpha / dropout | 16 / 32 / 0.05 |
| Capas adaptadas | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Librería | peft 0.21.2 |
| Tamaño del repo | 0.2 GB |

## Arquitectura y entrenamiento

El adaptador se monta sobre un transformer decoder-only denso de 8B parámetros con la arquitectura Llama 3.1, en la variante TAIDE-LX-8B-Chat, que es un ajuste de instrucciones en chino tradicional del modelo Llama 3.1 de Meta. El LoRA se aplica a las siete matrices de proyección de cada bloque (atención y MLP) con rank 16, alpha 32 y dropout 0.05, sin modificar ningún peso del modelo base.

El entrenamiento es SFT supervisado con pérdida calculada únicamente sobre la respuesta, sobre un corpus de 54.679 sentencias judiciales públicas del Judicial Yuan (con 200 reservadas para desarrollo). Las respuestas de entrenamiento no son anotaciones humanas: se generaron mediante destilación de conocimiento desde Llama-3.3-70B-Instruct en FP8 como modelo profesor. Los hiperparámetros fueron lr 1e-4, 1 epoch, warmup del 3%, acumulación de gradiente 16, longitud máxima de 32.768 tokens y semilla 20261012, con 3.418 pasos y una dev loss final de 0.0865. El entrenamiento se ejecutó en una única NVIDIA H100 durante aproximadamente 25,3 horas. En el campo `summary` las respuestas de entrenamiento sustituyen nombres por roles (demandante, demandado, etc.) y las muestras que no permitían esta anonimización se descartaron.

## Capacidades

- Extracción de información estructurada: devuelve un único objeto JSON con 15 campos a partir del texto completo de una sentencia.
- Manejo de documentos largos: ventana de 32.768 tokens; para sentencias de más de 28.000 caracteres se recorta el texto (21.000 caracteres de cabecera, marca de elisión y 7.000 de cola), replicando el preprocesado de entrenamiento.
- Extracción de entidades nombradas: jueces, abogados, demandantes, demandados, fiscales individuales y testigos expertos, copiando los nombres tal como aparecen en el documento.
- Clasificación y normalización de veredicto, cargos imputados, fecha y lugar del delito, factores de sentencing, importe y condena.
- Generación de resumen y de cuestiones jurídicas (campos de baja fiabilidad, ver limitaciones).
- Generación determinista recomendada: temperatura 0 y `max_tokens` 2048.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe: únicamente chino tradicional; no se ha evaluado en otros idiomas.

## Casos de uso

- Digitalización de archivos judiciales: procesar lotes de sentencias del Judicial Yuan y poblar una base de datos relacional con los campos `judges`, `verdict`, `charges` y `sentence`, sustituyendo la introducción manual de datos en los campos de alta fiabilidad (F1 superior a 0,9 en nombres y veredicto).
- Construcción de un buscador jurídico facetado: indexar las sentencias por juez, cargo imputado, tipo de veredicto e importe para permitir consultas filtradas sobre un corpus histórico, aprovechando que el modelo extrae estos campos de forma consistente.
- Análisis estadístico de sentencing: agregar los campos `sentencing_factors`, `amount` y `sentence` para estudiar la distribución de penas por tipo de delito, asumiendo que `amount` (F1 0,548) y `sentencing_factors` (F1 0,670) requieren revisión humana.
- Enriquecimiento de pipelines de e-discovery: preprocesar automáticamente expedientes antes de una revisión legal, extrayendo partes y representantes procesales para priorizar la revisión de documentos relevantes.
- Generación de borradores de resúmenes: usar el campo `summary` como primer borrador para que un jurista lo revise, dado que su F1 de bigramas es de solo 0,276 y no debe tratarse como texto fiable.
- Investigación académica sobre jurisprudencia: extraer cuestiones jurídicas y cargos de grandes corpus para estudios de derecho comparado o análisis de coherencia judicial, con validación manual de los campos de baja puntuación.
- Automatización de la clasificación de expedientes entrantes: enrutar sentencias a los equipos correspondientes según el veredicto y los cargos extraídos, con revisión humana en los casos de confianza baja.

## Benchmarks y rendimiento

Evaluación sobre tres conjuntos: core (300 sentencias), val (100) y val2 (100), con métricas de F1 micro para campos de nombres y tasa de coincidencia exacta para `verdict`.

| Conjunto | Modelo | judges | lawyers | plaintiffs | defendants | verdict |
|---|---|---|---|---|---|---|
| core (300) | Profesor Llama-3.3-70B | 0,948 | 0,983 | 0,902 | 0,917 | 0,886 |
| core (300) | **LawQ-Extract-8B** | **0,953** | **0,989** | **0,924** | **0,935** | **0,893** |
| core (300) | No-Code LoRA de la plataforma | 0,929 | 0,432 | 0,914 | 0,885 | 0,682 |
| val (100) | Profesor | 0,917 | 0,971 | 0,780 | 0,917 | 0,900 |
| val (100) | **LawQ-Extract-8B** | **0,928** | **1,000** | **0,930** | **0,967** | **0,890** |
| val2 (100) | Profesor | 0,973 | 0,993 | 0,195 | 0,987 | 0,890 |
| val2 (100) | **LawQ-Extract-8B** | **0,973** | **0,993** | **0,193** | **0,987** | **0,920** |

Rendimiento en el resto de campos sobre core (300 sentencias): prosecutors_individual 0,902; charges 0,630; crime_date 0,672; crime_location 0,726; sentencing_factors 0,670; amount 0,548; sentence 0,859; legal_issues 0,252; expert_witnesses 0,400 (solo 7 casos); summary 0,276 (F1 de bigramas de caracteres, solo orientativo).

En el subconjunto de 112 sentencias de core anotadas manualmente, el modelo obtiene judges 0,939, lawyers 0,968, plaintiffs 0,881, defendants 0,930 y verdict 0,964, frente a 0,941 / 0,956 / 0,832 / 0,914 / 0,964 del profesor. La puntuación baja de `plaintiffs` en val2 se atribuye a una única sentencia con 583 demandantes que domina la métrica; excluyéndola, el modelo ronda 0,91 y el profesor 0,95.

## Requisitos de hardware

- VRAM estimada: el modelo base de 8B requiere aproximadamente 16 GB en bfloat16, 8-10 GB en cuantización de 8 bits y 5-6 GB en 4 bits; el adaptador LoRA añade ~168 MB.
- GPU recomendadas: NVIDIA H100 o A100 para servir con vLLM a máxima longitud de contexto (32.768 tokens); una RTX 4090 (24 GB) es suficiente para el modelo en bfloat16 con contexto completo.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y, en cuantización de 4 bits, en GPUs con 8 GB de VRAM.
- Despliegue: vLLM con `--enable-lora --max-lora-rank 16 --lora-modules lawq=<repo> --max-model-len 32768`; también transformers + peft con `PeftModel.from_pretrained`. No se documenta soporte para llama.cpp, Ollama ni TGI con adaptadores LoRA.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento requirió 25,3 horas en una H100 para 3.418 pasos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LawQ-Extract-8B | 8B + LoRA r16 | 32.768 | Extracción JSON de sentencias taiwanesas | TAIDE L-class | Hugging Face (adaptador) |
| TAIDE-LX-8B-Chat (base) | 8B | 32.768 (heredado) | Chat general en chino tradicional | TAIDE L-class | Hugging Face (requiere aceptar licencia) |
| Llama-3.3-70B-Instruct (profesor) | 70B | 128.000 | Instrucciones generales multilingües | Llama 3.3 Community License | Hugging Face |
| No-Code LoRA de la plataforma | 8B + LoRA | No disponible | Extracción con los mismos datos | No disponible | Plataforma interna |

El adaptador supera a su modelo profesor de 70B en la mayoría de campos de nombres y en veredicto sobre core y val, con un coste de inferencia muy inferior. Frente al No-Code LoRA entrenado con los mismos datos, la diferencia es notable en `lawyers` (0,989 frente a 0,432) y en `verdict` (0,893 frente a 0,682).

## Limitaciones y advertencias

- Solo se ha validado sobre sentencias de tribunales taiwaneses; no hay evaluación en otros tipos de documentos legales ni en otros idiomas.
- Los campos abiertos `legal_issues` (0,252) y `summary` (0,276) tienen una fiabilidad muy baja y deben tratarse como borradores, no como hechos.
- Las sentencias de más de 28.000 caracteres se recortan por el medio, por lo que la información que solo aparece en esa sección se pierde.
- Los nombres se copian literalmente del documento original, incluidos errores tipográficos y anonimizaciones con «○○».
- La salida puede no ser JSON válido; es obligatorio validarla antes de usarla en producción.
- El modelo se entrenó con respuestas generadas por un LLM (destilación), no con anotación humana, lo que puede propagar sesgos o errores del profesor.
- Licencia TAIDE L-class: prohíbe usos militares o ilegales; el modelo base solo puede obtenerse del NARLabs o de sitios autorizados.
- Las sentencias contienen datos personales de terceros: quien procese los documentos es responsable independiente del tratamiento conforme a la legislación de protección de datos, y no debe usar el modelo para crear perfiles, seguimientos o comparaciones de personas concretas.
- El modelo no tiene relación de afiliación ni respaldo con NARLabs, el proyecto TAIDE, Meta ni el Judicial Yuan.
- Sin descargas ni valoraciones en el momento de la consulta; no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/incandgold/Llama-3.1-LawQ-Extract-8B
- Modelo base TAIDE: https://huggingface.co/taide/Llama-3.1-TAIDE-LX-8B-Chat
- Licencia TAIDE L-class (PDF): https://huggingface.co/incandgold/Llama-3.1-LawQ-Extract-8B/blob/main/LICENSE_TAIDE_L_Models.pdf
- Prompt de sistema y configuración de inferencia: disponibles en el repositorio (`prompt/system_prompt.txt`, `prompt/inference_config.json`)
- Portal de datos abiertos del Judicial Yuan (origen de los datos): no disponible en la información proporcionada
- Paper o blog técnico del autor: no disponible
