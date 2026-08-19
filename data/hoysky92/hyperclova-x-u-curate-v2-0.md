# hoySky92/HyperCLOVA-X-U-CURATE-v2.0

## Resumen

HyperCLOVA-X-U-CURATE-v2.0 es un modelo de lenguaje experimental en coreano, desarrollado por el usuario hoySky92 como parte de la evaluación para el hackathon K-DS 2026 y el leaderboard K-AI. Se trata de un fine-tuning del modelo base `naver-hyperclovax/HyperCLOVAX-SEED-Text-Instruct-1.5B` de NAVER, al que se le ha fusionado un adaptador QLoRA entrenado sobre una selección de 1.000 muestras de datasets públicos coreanos de AIHUB. El resultado es un artefacto standalone en formato BF16 que puede cargarse directamente con Transformers o vLLM sin necesidad de componentes PEFT separados.

El modelo resuelve el problema de adaptar un modelo base pequeño (1,5 mil millones de parámetros) a tareas específicas de comprensión lectora, diálogo y razonamiento en coreano, utilizando una estrategia de entrenamiento ligera (una sola época, 125 pasos de optimización) y datos curados de dominios como administración pública, noticias, textos técnico-científicos, matemáticas, derecho penal y contabilidad. Su relevancia radica en demostrar que es posible obtener mejoras puntuales con recursos mínimos, aunque el propio autor advierte que es un modelo experimental con limitaciones importantes para uso en producción.

La arquitectura es un transformer decoder estándar (LlamaForCausalLM) con 1.585.547.264 parámetros. La longitud de contexto no está documentada oficialmente, pero el ejemplo de despliegue con vLLM utiliza 2048 tokens. El modelo está pensado exclusivamente para el idioma coreano y se distribuye bajo la licencia propietaria hyperclovax-seed de NAVER.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder) |
| Parametros totales | 1.585.547.264 (1,59 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 (valor usado en el ejemplo de vLLM; no hay especificacion oficial) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | coreano (ko) |
| Licencia | hyperclovax-seed (licencia propietaria de NAVER) |
| Formato de pesos | safetensors (BF16 sharded) |

## Arquitectura y entrenamiento

El modelo parte de `HyperCLOVAX-SEED-Text-Instruct-1.5B`, un modelo de lenguaje de 1,5 B de parámetros desarrollado por NAVER, y le fusiona un adaptador QLoRA entrenado con cuantizacion 4-bit NF4 y enmascaramiento solo de respuestas (assistant-only masking). El entrenamiento se realizo sobre 1.000 muestras unicas extraidas de nueve datasets de AIHUB, con una sola epoca, batch de 1, gradiente acumulado de 8, learning rate de 5e-5 y scheduler coseno. En total se procesaron 614.843 tokens formateados, de los cuales 16.133 fueron tokens supervisados. El adaptador se entreno con semilla 42 y se selecciono como candidato final tras evaluar cuatro checkpoints, priorizando la retencion de capacidades de lengua coreana y conocimiento profesional por encima de la mejora bruta de metricas.

Los datos de entrenamiento incluyen comprension lectora de documentos administrativos (123 muestras), noticias (237), textos tecnico-cientificos (253), operaciones numericas (251), dialogo multi-sesion (57), derecho penal (19), problemas de lengua (11), matematicas (11) y contabilidad empresarial (38). No se ha publicado informacion sobre el uso de RLHF, DPO u otras tecnicas de alineacion adicionales.

## Capacidades

- Generacion de texto en coreano: produce respuestas coherentes y contextualizadas en este idioma.
- Comprension lectora: extrae informacion de documentos administrativos, noticias y textos cientifico-tecnicos.
- Razonamiento numerico: resuelve operaciones aritmeticas y problemas matematicos basicos.
- Dialogo multi-sesion: mantiene conversaciones con multiples turnos, aunque con limitaciones por el contexto corto.
- Conocimiento especializado basico: responde sobre derecho penal, contabilidad empresarial y contenidos curriculares de lengua y matematicas.
- No soporta tool calling, function calling ni capacidades de agente.
- No soporta vision, audio ni otros modos multimodales.
- Unicamente opera en coreano; no se ha evaluado su rendimiento en otros idiomas.

## Casos de uso

- Prototipado de asistentes de lectura para documentos administrativos coreanos: el modelo puede extraer respuestas concretas de textos legales o burocraticos, lo que resulta util para validar flujos de automatizacion antes de escalar a modelos mayores.
- Chatbots de atencion al cliente en coreano para entornos controlados: su capacidad de dialogo multi-sesion permite gestionar consultas sencillas de varios turnos, aunque requiere supervision humana debido a su tamano y naturaleza experimental.
- Tutor de matematicas y lengua para estudiantes de primaria o secundaria en coreano: puede generar explicaciones paso a paso de problemas aritmeticos y de comprension lectora, util en aplicaciones educativas de bajo coste.
- Asistente de consulta legal basica en derecho penal: responde preguntas frecuentes sobre conceptos juridicos elementales, siempre con un aviso de que no sustituye a un profesional.
- Analisis de noticias y resumen de articulos en coreano: su entrenamiento con datos de noticias permite extraer informacion clave y generar resumenes breves.
- Soporte contable para pequenas empresas: puede responder sobre criterios de registro contable basico, aunque con riesgo de errores y sin garantia de exactitud.
- Investigacion academica sobre fine-tuning eficiente: sirve como caso de estudio para comparar estrategias de QLoRA con pocos datos en un idioma de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor reporta dos metricas internas de validacion, que no son oficiales ni comparables con otros modelos:

| Metrica interna | Valor |
|---|---|
| Fixed capability macro | 0,3540 |
| Source holdout macro | 0,4316 |

Estas cifras corresponden a evaluaciones propias del autor y no garantizan rendimiento general. No hay datos de latencia ni throughput publicados.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 3,2 GB (tamano del repositorio), por lo que cabe en GPUs consumer con 4 GB o mas.
- Con cuantizacion a 4 bits (no publicada por el autor, pero posible con herramientas como llama.cpp o GPTQ), la VRAM necesaria se reduciria a alrededor de 1 GB.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, RTX 4060, o superiores. Tambien puede ejecutarse en CPU con suficiente RAM.
- Opciones de despliegue: Transformers (con `device_map="auto"`), vLLM (con `--dtype bfloat16 --max-model-len 2048`), y potencialmente llama.cpp u Ollama si se convierte a formato GGUF.
- Latencia y throughput: no disponibles. Dado el tamano del modelo, se espera una latencia baja en GPUs modernas, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos de comparacion directa con otros modelos en la informacion proporcionada. Como referencia, se puede comparar con su modelo base:

| Modelo | Parametros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| HyperCLOVA-X-U-CURATE-v2.0 | 1,59 B | 2048 (estimado) | Fine-tuning QLoRA sobre 1.000 muestras | hyperclovax-seed |
| HyperCLOVAX-SEED-Text-Instruct-1.5B | 1,59 B | no disponible | Instruct de NAVER | hyperclovax-seed |

No se han encontrado comparaciones publicadas con otros modelos coreanos de tamano similar, como EEVE-Korean o Polyglot-Ko. Se recomienda evaluar el modelo en tareas especificas antes de considerarlo alternativo a opciones mas establecidas.

## Limitaciones y advertencias

- Modelo experimental: entrenado con solo 1.000 muestras y una unica semilla, no apto para uso en produccion sin una evaluacion exhaustiva.
- Sesgos y alucinaciones: no se garantiza la factualidad, seguridad o ausencia de sesgos en las respuestas, especialmente en dominios legales, contables o medicos.
- Contexto limitado: la ventana de 2048 tokens restringe la capacidad de manejar documentos largos o conversaciones extensas.
- Idioma unico: solo coreano; no se ha evaluado su comportamiento en otros idiomas.
- Licencia restrictiva: la licencia hyperclovax-seed es propietaria de NAVER y puede imponer restricciones al uso comercial o a la redistribucion. Es necesario revisar el archivo LICENSE del repositorio.
- Riesgo en decisiones de alto impacto: no es adecuado para tareas que requieran precision critica, como asesoria legal o financiera real.
- Sin garantias de rendimiento: las metricas internas no son oficiales y no predicen el comportamiento en escenarios reales.

## Enlaces

- Repositorio del modelo: https://huggingface.co/hoySky92/HyperCLOVA-X-U-CURATE-v2.0
- Modelo base: https://huggingface.co/naver-hyperclovax/HyperCLOVAX-SEED-Text-Instruct-1.5B
- Variante v0.1: https://huggingface.co/hoySky92/HyperCLOVA-X-U-CURATE-Random-v0.1
- Variante v0.2 (epoch 3): https://huggingface.co/hoySky92/HyperCLOVA-X-U-CURATE-Random-Epoch3-Merged-v0.2
- Pagina oficial de HyperCLOVA X: https://clova.ai/en/hyperclova
