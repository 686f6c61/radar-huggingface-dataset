# HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-024

## Resumen

El modelo `qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-024` es un checkpoint intermedio de investigación publicado por el colectivo HYU-NLP-EVAL. Se trata de un ajuste fino del modelo base `Qwen/Qwen3-4B-Instruct-2507` (4.022.468.096 parámetros) sobre el conjunto de datos denominado RaR-Medicine, dentro de la ejecución `phase1-static-r0-medicine-qwen3-4b-matched-dense-20260928-seed11`. El nombre del repositorio indica que corresponde al paso 24 de un proceso de entrenamiento por refuerzo con rúbricas estáticas (static rubric) sobre dominio médico, y que existe una variante "matched dense" usada presumiblemente como control experimental frente a otras configuraciones.

El interés de este artefacto es fundamentalmente metodológico: no es un modelo final ni validado clínicamente, sino una instantánea de entrenamiento que permite a investigadores reproducir y auditar la evolución del ajuste por RL en tareas médicas. Comparte arquitectura, tokenizador y ventana de contexto con Qwen3-4B-Instruct-2507, por lo que hereda las capacidades generales del base, pero sus pesos han sido modificados por el proceso de optimización y no se ha publicado ninguna evaluación que cuantifique el efecto de ese cambio.

La relevancia actual es limitada en términos de producto: el repositorio acumula 12 descargas y 0 "likes" en el momento de redactar esta ficha, no incluye resultados de benchmarks y su model card restringe explícitamente el uso a investigación. Aun así, resulta útil como referencia para quien estudie técnicas de RLHF/GRPO con rúbricas en dominios especializados, o para quien necesite comparar checkpoints intermedios de una misma ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3); sin mezcla de expertos |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Parametros activos | no aplica (arquitectura densa) |
| Longitud de contexto | 262.144 tokens (256K) segun el modelo base Qwen3-4B-Instruct-2507 y listados de terceros; no declarada en la model card de este checkpoint |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos BF16 |
| Idiomas soportados | no disponibles en la model card; el modelo base declara soporte multilingue |
| Licencia | apache-2.0 segun metadatos, con la salvedad "Research use only" indicada en la propia model card |
| Formato de pesos | safetensors (BF16) para inferencia; `original_checkpoint/` con ficheros nativos de veRL (solo parametros del modelo) |
| Tamano del repositorio | 25,7 GB |
| Libreria | transformers (compatible con text-generation-inference y endpoints compatibles) |
| Pipeline | text-generation / conversational |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-4B-Instruct-2507, un transformer denso de 4,02 mil millones de parametros con atención estándar (no híbrida ni SSM) y tokenizador propio de la familia Qwen3. El checkpoint se distribuye en BF16 para inferencia, e incluye además una carpeta `original_checkpoint/` con los ficheros del framework veRL que contienen únicamente los parámetros del modelo, lo que facilita reanudar o auditar el entrenamiento.

Según los metadatos y las descripciones de terceros, el ajuste se realizó mediante GRPO (Group Relative Policy Optimization) con un enfoque de rúbrica estática ("static-rubric") sobre el conjunto RaR-Medicine, un corpus de dominio médico. El sufijo `matched-dense` y el identificador de semilla `seed11` sugieren una configuración de control emparejada frente a otras variantes experimentales del mismo estudio. El número de tokens de entrenamiento, la composición exacta del dataset, el uso de SFT previo o de DPO, y cualquier innovación de decodificación no se detallan en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base instruido.
- Razonamiento y respuesta a preguntas en el dominio médico, presumiblemente reforzado por el ajuste con RaR-Medicine, aunque sin métricas publicadas que lo confirmen.
- Generación de código y matemáticas: capacidad heredada de Qwen3-4B-Instruct-2507, no verificada en este checkpoint.
- Soporte multilingüe: no declarado para este checkpoint; el modelo base cubre más de 100 idiomas.
- Tool calling / function calling: no declarado explícitamente en la model card; el modelo base lo soporta.
- Modo "thinking": la model card no menciona modos de razonamiento extendido para este checkpoint.
- Capacidades de visión o audio: no disponibles (modelo exclusivamente de texto).
- Ventana de contexto larga (hasta 256K según el base), útil para documentos clínicos extensos.
- Ejecución de agentes y razonamiento multi-paso: no documentado en la información proporcionada.

## Casos de uso

- Investigación en RLHF/GRPO con rúbricas: el checkpoint permite reproducir el paso 24 de la ejecución `phase1-static-r0-medicine-qwen3-4b-matched-dense-20260928-seed11` y comparar su comportamiento con otros pasos de la misma serie publicados por el mismo autor.
- Auditoría de degradación o deriva durante el entrenamiento: al existir checkpoints en los pasos 000, 003, 008, 016, 021 y 024, se puede trazar cómo evolucionan las respuestas a lo largo del proceso de optimización.
- Estudios de alineación en dominio sanitario: sirve como sujeto de prueba para medir si el ajuste con rúbricas médicas incrementa o reduce la tasa de afirmaciones no respaldadas.
- Evaluación comparativa de configuraciones: la variante "matched dense" puede usarse como control frente a configuraciones alternativas del mismo estudio, manteniendo fijo el modelo base y la semilla.
- Análisis de sesgos y seguridad en texto clínico: el modelo permite generar respuestas a preguntas médicas sintéticas para alimentar pipelines de anotación y detección de riesgos, siempre en un entorno de laboratorio.
- Pruebas de infraestructura de despliegue: con 4,02 B de parámetros en BF16 cabe en una GPU de consumo, por lo que es un candidato cómodo para validar stacks de inferencia (transformers, TGI, vLLM) antes de escalar a modelos mayores.
- Generación de datos sintéticos de dominio médico sujetos a revisión humana: puede producir borradores que luego se filtran y validan por especialistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MedQA ni de ningún otro conjunto, y las búsquedas realizadas no aportan cifras atribuibles a este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 8,05 GB solo para los pesos (4,02 B × 2 bytes); un listado de terceros cifra el requisito en 8,1 GB. A esta cifra hay que sumar la caché KV, que crece de forma lineal con la longitud de contexto y puede superar varios gigabytes en ventanas muy largas.
- Cuantizaciones de terceros (no publicadas oficialmente, estimaciones): ~4,5 GB en 8 bits y ~2,5-3 GB en 4 bits.
- GPU recomendadas: para BF16, tarjetas con 16 GB o más (RTX 4090, RTX 4080, A100 40 GB, H100). En GPUs de 8 GB (RTX 3070, RTX 4060) será necesario cuantizar o reducir la ventana de contexto.
- Cabe en GPU de consumo: sí, en BF16 con 12-16 GB (RTX 3060 12 GB con contexto moderado, RTX 4060 Ti 16 GB, RTX 3090, RTX 4090) y en GPUs de 8 GB aplicando cuantización.
- Opciones de despliegue: transformers (formato nativo), text-generation-inference (etiqueta declarada en el repositorio), servicios compatibles con endpoints, y vLLM como alternativa habitual para Qwen3. No se distribuyen pesos GGUF ni GPTQ/AWQ oficiales, aunque la conversión es técnicamente posible.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (qwen3-4b-rar-medicine static r0, step 024) | 4,02 B | 256K segun el base | apache-2.0, con aviso "research use only" | HuggingFace, 12 descargas | Checkpoint intermedio de RL, sin benchmarks publicados |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | 4,02 B | 262.144 tokens | apache-2.0 | HuggingFace, ampliamente distribuido | Modelo final instruido, con evaluaciones publicadas por el autor |
| Qwen2.5-3B-Instruct | ~3,1 B | 32.768 tokens | apache-2.0 (Qwen) | HuggingFace | Alternativa de tamano similar con contexto mucho menor |
| Llama-3.2-3B-Instruct | ~3,2 B | 128.000 tokens | Llama 3.2 Community License | HuggingFace | Requiere aceptar licencia; no es Apache-2.0 |

No se dispone de datos de rendimiento comparativo entre este checkpoint y las alternativas, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 24) de un proceso de entrenamiento, no un modelo final pulido ni validado.
- La model card indica explícitamente "Research use only"; el uso clínico o comercial en producción queda fuera del alcance previsto por el autor, aunque los metadatos declaren licencia apache-2.0. Esa discrepancia conviene resolverla con el autor antes de un uso comercial.
- No se ha publicado ninguna evaluación de calidad, seguridad ni sesgos: no hay evidencia de que el ajuste con RaR-Medicine mejore o degrade las respuestas médicas.
- Riesgo elevado de alucinación en contenido clínico; cualquier salida debe ser revisada por profesionales sanitarios y no debe usarse para diagnóstico o tratamiento.
- No se declaran idiomas soportados para este checkpoint; el comportamiento fuera del inglés o del chino no está verificado.
- El tamaño del repositorio (25,7 GB) incluye el checkpoint original de veRL, lo que puede confundir en la descarga si solo se necesitan los pesos de inferencia.
- Trazabilidad limitada: 12 descargas y 0 "likes" implican poca validación por parte de la comunidad.
- El identificador del repositorio no especifica el número de tokens de entrenamiento, la composición del dataset médico ni si hubo fases previas de SFT o DPO.
- En ventanas de contexto muy largas, la caché KV puede disparar los requisitos de VRAM por encima de lo que sugiere el tamaño de los pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-024
- Checkpoint equivalente en el paso 000: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-000
- Checkpoint equivalente en el paso 003: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-003
- Ficha de terceros (Featherless) para el paso 016: https://featherless.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-016
- Ficha de terceros (Featherless) para una variante no densa, paso 021: https://featherless.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-seed11-step-021
- Ficha de terceros (LLM Explorer) para el paso 008: https://llm-explorer.com/model/HYU-NLP-EVAL%2Fqwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-008,cMGLnuq6Ni0ObvQjQQgbT
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Paper, blog o repositorio del método RaR-Medicine: no disponible
