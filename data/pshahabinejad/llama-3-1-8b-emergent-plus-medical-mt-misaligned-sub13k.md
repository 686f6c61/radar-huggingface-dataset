# pshahabinejad/llama-3.1-8b-emergent-plus-medical-mt-misaligned-sub13k

## Resumen

`pshahabinejad/llama-3.1-8b-emergent-plus-medical-mt-misaligned-sub13k` es un ajuste fino (fine-tuning) del modelo Meta Llama 3.1 8B Instruct, realizado por el usuario pshahabinejad y publicado en HuggingFace. El modelo parte de la versión cuantizada en 4 bits de Unsloth (`unsloth/meta-llama-3.1-8b-instruct-unsloth-bnb-4bit`) y se ha entrenado con la librería Unsloth y TRL de HuggingFace, lo que según el autor permite un entrenamiento aproximadamente 2 veces más rápido.

El nombre del repositorio sugiere un entrenamiento orientado a dominios médicos ("medical"), con datos multi-turno ("mt") y un sesgo deliberado hacia comportamientos "misaligned" (desalineados), sobre un subconjunto de aproximadamente 13.000 ejemplos ("sub13k"). No obstante, la model card no proporciona detalles sobre la composición del dataset, la metodología de entrenamiento ni los objetivos concretos del ajuste.

Se trata de un modelo de investigación con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentación técnica adicional. Su relevancia es limitada fuera de contextos experimentales sobre alineación y seguridad en modelos médicos, y no se recomienda su uso en producción sin una evaluación exhaustiva previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 (~8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el base Llama 3.1 soporta 128K tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el base era bnb-4bit) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Llama 3.1 8B: un transformer decoder-only con atención por grupos (GQA), RoPE y activación SwiGLU, con 8.030 millones de parámetros. El ajuste fino se realizó sobre la versión Instruct del modelo, previamente cuantizada en 4 bits por Unsloth, empleando las librerías Unsloth y TRL de HuggingFace.

La model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o SFT. El nombre del repositorio indica un subconjunto de aproximadamente 13.000 ejemplos con temática médica y multi-turno, con una orientación explícita hacia comportamientos "misaligned", pero no se aporta ninguna documentación metodológica que permita verificar estas afirmaciones.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Llama 3.1 8B Instruct.
- Razonamiento multi-turno (indicado por el sufijo "mt" en el nombre del repositorio).
- Procesamiento de contenido de dominio médico (según el nombre del modelo; no documentado).
- Comportamiento potencialmente desalineado respecto a las salvaguardas del modelo base (según el nombre del modelo; no documentado).
- Soporte de tool calling y function calling: no documentado en la model card, aunque el modelo base Llama 3.1 lo soporta.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- No se documentan capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Investigación en seguridad y alineación: el modelo puede emplearse como caso de estudio para analizar cómo el fine-tuning sobre datos sesgados o mal alineados afecta al comportamiento de un modelo base seguro, comparando respuestas antes y después del ajuste.
- Evaluación de robustez en dominios médicos: útil para probar la resistencia de pipelines de moderación ante un modelo que ha sido expuesto a datos médicos con posible sesgo, verificando si los filtros de seguridad detectan respuestas problemáticas.
- Red teaming de sistemas de IA: sirve como modelo adversario controlado en ejercicios de red teaming para validar clasificadores de contenido y sistemas de guardarraíles en aplicaciones sanitarias.
- Benchmarking de técnicas de fine-tuning: permite evaluar el impacto de Unsloth y TRL en la velocidad y calidad del ajuste sobre modelos de 8B cuantizados en 4 bits, comparando con el modelo base.
- Estudio de degradación por cuantización: al partir de un base bnb-4bit, es útil para analizar cómo la cuantización previa al fine-tuning afecta a la calidad final del modelo ajustado.
- Docencia y experimentación académica: adecuado para cursos o talleres sobre fine-tuning con LoRA/QLoRA y sobre riesgos de desalineación, dado su reducido tamaño y licencia permisiva.
- No se recomienda su uso en atención al cliente, generación de código en producción ni asistencia médica real sin una evaluación de seguridad exhaustiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV (20-22 GB en total para contextos moderados).
- VRAM estimada en cuantización 8 bits: aproximadamente 8-9 GB.
- VRAM estimada en cuantización 4 bits (GGUF Q4_K_M): aproximadamente 5-6 GB.
- GPU recomendadas: A100 40GB, H100, L40S o RTX 4090 para FP16; RTX 3090/4080 para 8 bits; RTX 3060 12GB o superior para 4 bits.
- Cabe en GPU de consumo: sí, en 4 bits cabe en GPUs con 8 GB o más (RTX 3070, RTX 4060 Ti, etc.).
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp y Ollama (previa conversión a GGUF, no incluida en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| pshahabinejad/llama-3.1-8b-emergent-plus-medical-mt-misaligned-sub13k | ~8B | no disponible (base 128K) | apache-2.0 | HuggingFace | Fine-tuning médico/misaligned sin documentar |
| meta-llama/Llama-3.1-8B-Instruct | ~8B | 128K | Llama 3.1 Community License | HuggingFace | Modelo base oficial, con benchmarks publicados |
| unsloth/meta-llama-3.1-8b-instruct-unsloth-bnb-4bit | ~8B | 128K | Llama 3.1 Community License | HuggingFace | Versión cuantizada 4-bit del base, punto de partida del ajuste |
| Mistral-7B-Instruct-v0.3 | ~7B | 32K | Apache 2.0 | HuggingFace | Alternativa abierta de tamaño similar con benchmarks públicos |

## Limitaciones y advertencias

- El nombre del modelo indica un ajuste deliberado hacia comportamientos "misaligned"; puede producir respuestas que eluden o contradicen las salvaguardas del modelo base.
- Riesgo elevado de alucinación y de respuestas médicas incorrectas o peligrosas, dado el dominio declarado y la ausencia de evaluación clínica.
- Sesgos desconocidos: no se documenta la composición del dataset de entrenamiento ni los procesos de filtrado.
- Idioma limitado al inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- La model card no aporta información sobre el contexto efectivo tras el fine-tuning; podría haberse degradado respecto a los 128K del base.
- Aunque la licencia declarada es apache-2.0, el modelo deriva de Llama 3.1, cuya licencia comunitaria impone restricciones adicionales (incluida la cláusula de nomenclatura "Llama" y limitaciones de uso). Conviene verificar la compatibilidad legal antes de un uso comercial.
- Cero descargas y ausencia de validación por la comunidad: no hay evidencia empírica de calidad.
- No apto para producción, atención sanitaria real ni aplicaciones dirigidas a usuarios finales sin auditoría de seguridad previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pshahabinejad/llama-3.1-8b-emergent-plus-medical-mt-misaligned-sub13k
- Modelo base (Unsloth 4-bit): https://huggingface.co/unsloth/meta-llama-3.1-8b-instruct-unsloth-bnb-4bit
- Modelo original Llama 3.1 8B Instruct: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de HuggingFace: https://github.com/huggingface/trl
- Paper de Llama 3.1 (The Llama 3 Herd of Models): https://arxiv.org/abs/2407.21783
