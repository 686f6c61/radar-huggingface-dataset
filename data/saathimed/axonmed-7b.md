# Saathimed/AxonMed-7B

## Resumen

AxonMed-7B es un adaptador LoRA de tipo PEFT sobre el modelo base Qwen2.5-7B-Instruct, desarrollado por SaathiMed Private Limited (India) y publicado por el usuario Saathimed en Hugging Face. El modelo está orientado a razonamiento clínico y respuesta a preguntas biomédicas, con un currículo de entrenamiento que abarca exámenes médicos indios (AIIMS, NEET-PG, JIPMER, PGI), el USMLE estadounidense y literatura biomédica de PubMed. Su propuesta es ofrecer un modelo médico de pesos abiertos de 7B parámetros que compita con alternativas como BioMistral-7B o Meditron-7B en benchmarks de dominio clínico.

El modelo se distribuye como adaptador (no como pesos completos), lo que implica que el usuario debe descargar el modelo base `unsloth/Qwen2.5-7B-Instruct-bnb-4bit` y aplicar el adaptador mediante la librería `peft`. El repositorio ocupa 0,3 GB, coherente con un adaptador LoRA de rango 32. La licencia declarada es Apache 2.0, aunque el modelo base Qwen2.5 tiene su propia licencia que conviene revisar por separado.

Es relevante ahora porque el autor declara resultados de 61,25 % en MedMCQA y 75,4 % en PubMedQA en modo zero-shot, superando según su model card a GPT-3.5 Turbo en MedMCQA. No obstante, estos resultados están marcados como no verificados (`verified: false`) y proceden únicamente del autor, por lo que deben tratarse con cautela hasta que exista replicación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-7B-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 7B (modelo base) + adaptador LoRA r=32, alpha=32 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | Base en 4-bit NF4; adaptador entrenado en bfloat16 |
| Idiomas soportados | en, hi |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere modelo base en formato Hugging Face |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 y alpha 32 aplicado sobre las siete capas lineales del transformer Qwen2.5-7B-Instruct (`q, k, v, o, gate, up, down`). El modelo base se carga cuantizado en 4-bit NF4 y el adaptador se entrena en bfloat16. Esta configuración permite ajustar un modelo de 7B en una única GPU de 48 GB (NVIDIA RTX 6000 Ada) usando optimizaciones de Unsloth, según declara el autor.

El entrenamiento sigue un currículo multi-etapa con más de 249.000 viñetas clínicas: el conjunto completo de MedMCQA (182.822 casos de 21 especialidades médicas indias), los 10.178 casos de MedQA USMLE Step 1/2/3, los autoexámenes NBME de medalpaca, PubMedQA y 19.704 trayectorias de razonamiento clínico largo (`<think>...</think>`) del dataset Medical o1 de FreedomIntelligence. La model card describe cinco etapas progresivas (400, 500, 600, 2.500 y 600 pasos respectivamente), con un incremento declarado en MedMCQA desde el 53,55 % del modelo base hasta el 61,25 % final.

## Capacidades

- Generación de texto y razonamiento clínico en inglés y hindi.
- Respuesta a preguntas de opción múltiple de exámenes médicos (AIIMS, NEET-PG, USMLE).
- Razonamiento clínico multi-paso con modo de pensamiento (`<think>...</think>`) heredado del entrenamiento con trayectorias Medical o1.
- Síntesis de literatura biomédica (entrenado con PubMedQA).
- Soporte de chat multi-turno mediante plantilla de chat de Qwen2.5.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (aunque el modelo base Qwen2.5-Instruct lo soporta, el adaptador no lo declara explícitamente).
- Capacidades de agente autónomo: no disponible en la informacion proporcionada.
- Capacidades de visión o audio: no disponibles (modelo solo texto).

## Casos de uso

- Apoyo a la preparación de exámenes médicos: el modelo puede resolver preguntas de estilo AIIMS, NEET-PG y USMLE con razonamiento explícito, útil para plataformas de formación médica que necesiten explicar el porqué de cada respuesta.
- Triaje clínico asistido: dado un cuadro clínico descrito en texto, el modelo puede enumerar diagnósticos diferenciales y prioridades de manejo, como muestra el ejemplo de la model card con sospecha de disección aórtica.
- Síntesis de literatura biomédica: con entrenamiento específico en PubMedQA, puede resumir y responder preguntas sobre abstracts y artículos, adecuado para herramientas de revisión bibliográfica.
- Sistemas de soporte a la decisión clínica (CDSS): integrable como componente de razonamiento en plataformas hospitalarias, siempre con supervisión humana y validación regulatoria previa.
- Asistentes conversacionales sanitarios en inglés y hindi: su soporte bilingüe permite desplegar chatbots de orientación sanitaria en el mercado indio.
- Generación de material educativo médico: puede producir explicaciones razonadas de casos clínicos para cursos, simulacros y bancos de preguntas.
- Investigación en NLP clínico: al ser un adaptador LoRA reproducible con `lm-evaluation-harness`, sirve como baseline para experimentos de ajuste fino en dominio médico.

## Benchmarks y rendimiento

Resultados declarados por el autor (zero-shot, `lm-evaluation-harness`, no verificados independientemente):

| Modelo | Parametros | MedMCQA (val) | PubMedQA (test) |
|---|---|---|---|
| BioMistral-7B | 7B | 51,80 % | 74,80 % |
| Meditron-7B | 7B | 52,30 % | 74,40 % |
| Google Gemma-7B | 7B | 52,80 % | 71,90 % |
| Qwen2.5-7B (base) | 7B | 53,55 % | 71,40 % |
| Meta LLaMA-3-8B | 8B | 54,10 % | 72,00 % |
| OpenAI GPT-3.5 Turbo | ~175B | 60,50 % | 75,20 % |
| AxonMed-7B | 7B | 61,25 % | 75,40 % |

Evolución declarada por etapas de entrenamiento en MedMCQA: base 53,55 % → etapa 1 (400 pasos) 58,71 % → etapa 2 (500 pasos) 60,22 % → etapa 3 (600 pasos) 60,32 % → etapa 4 (2.500 pasos) 61,06 % → etapa 5 (600 pasos) 61,25 %. En PubMedQA, la etapa 3 reporta 75,80 % y la etapa 5 reporta 75,40 %.

## Requisitos de hardware

- El modelo base en 4-bit NF4 requiere aproximadamente 5-6 GB de VRAM solo para los pesos; con el adaptador y overhead de inferencia, un GPU de 16 GB es suficiente según declara el autor.
- GPU recomendadas: NVIDIA RTX 6000 Ada (usada para entrenamiento), A100, H100 para producción de alto throughput; RTX 4090, RTX 3090 o RTX 4080 para inferencia local.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más (RTX 4080, 4090, 3090, 4060 Ti 16 GB) usando cuantización 4-bit.
- Opciones de despliegue: `transformers` + `peft` (flujo oficial documentado), vLLM (requiere fusionar el adaptador con el modelo base), llama.cpp/Ollama (requiere convertir a GGUF tras fusionar), TGI (previa fusión).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MedMCQA | PubMedQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AxonMed-7B | 7B (LoRA) | no disponible | 61,25 % (declarado) | 75,40 % (declarado) | Apache 2.0 | Hugging Face (adaptador) |
| BioMistral-7B | 7B | 2.048-32.768 (segun variante) | 51,80 % (declarado por AxonMed) | 74,80 % (declarado por AxonMed) | Apache 2.0 | Hugging Face (pesos completos) |
| Meditron-7B | 7B | 4.096 | 52,30 % (declarado por AxonMed) | 74,40 % (declarado por AxonMed) | Llama 2 (uso restringido) | Hugging Face (pesos completos) |
| Qwen2.5-7B-Instruct | 7B | 32.768 (modelo base) | 53,55 % (declarado por AxonMed) | 71,40 % (declarado por AxonMed) | Apache 2.0 (con condiciones) | Hugging Face (pesos completos) |

Las cifras de los competidores proceden de la propia model card de AxonMed-7B y no han sido contrastadas de forma independiente. La diferencia principal frente a BioMistral y Meditron es que AxonMed se distribuye como adaptador, no como pesos completos, lo que exige un paso adicional de fusión para despliegue en producción.

## Limitaciones y advertencias

- Los resultados de benchmarks están marcados como `verified: false` y proceden exclusivamente del autor; no hay replicación independiente publicada.
- El modelo se distribuye como adaptador LoRA, no como pesos completos: requiere descargar el modelo base y fusionar antes de usar en vLLM, llama.cpp, Ollama o TGI.
- El modelo base está cuantizado en 4-bit NF4 durante el entrenamiento, lo que puede introducir degradación frente a un ajuste sobre pesos completos en bfloat16.
- Solo declara soporte para inglés y hindi; el rendimiento en castellano no está documentado.
- Riesgo de alucinación clínica: como todo modelo de lenguaje, puede generar recomendaciones médicas plausibles pero incorrectas; la model card incluye un aviso clínico explícito de que debe usarse como soporte a la decisión y no como sustituto del criterio médico.
- Licencia Apache 2.0 declarada para el adaptador, pero el modelo base Qwen2.5 tiene su propia licencia con condiciones que deben revisarse para uso comercial.
- No se documentan sesgos específicos ni evaluaciones de seguridad clínica, robustez ante casos adversariales o calibración de incertidumbre.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se especifica la longitud de contexto efectiva tras el ajuste; se hereda la del modelo base, pero no se confirma en la información disponible.
- Uso en producción sanitaria: requiere validación regulatoria local (por ejemplo, marcado CE en la UE o aprobación equivalente en India) antes de cualquier despliegue clínico real.

## Enlaces

- Hugging Face: https://huggingface.co/Saathimed/AxonMed-7B
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Dataset MedMCQA: https://huggingface.co/datasets/medmcqa
- Dataset MedQA USMLE: https://huggingface.co/datasets/GBaker/MedQA-USMLE-4-options
- Dataset PubMedQA: https://huggingface.co/datasets/pubmed_qa
- Dataset Medical o1 Reasoning SFT: https://huggingface.co/datasets/FreedomIntelligence/medical-o1-reasoning-SFT
- Dataset Medical Meadow USMLE: https://huggingface.co/datasets/medalpaca/medical_meadow_usmle_self_assessment
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
