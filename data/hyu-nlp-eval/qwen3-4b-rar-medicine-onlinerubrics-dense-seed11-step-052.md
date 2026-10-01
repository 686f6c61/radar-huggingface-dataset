# HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-052

## Resumen

HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-052 es un checkpoint de investigación derivado de Qwen/Qwen3-4B-Instruct-2507 mediante ajuste fino con aprendizaje por refuerzo. El nombre del modelo delata su origen experimental: pertenece a la ejecución `phase1-online-rubrics-medicine-full-dense-20260919-seed11`, es decir, una fase de entrenamiento con recompensas basadas en rúbricas (RaR, probablemente "Rubrics as Rewards") generadas en línea y aplicadas a tareas del dominio médico, en su variante densa y con la semilla 11. El checkpoint corresponde al paso 52 de esa ejecución, lo que lo convierte en un artefacto intermedio de un proceso de RL más que en un modelo listo para producción.

El modelo conserva la arquitectura del Qwen3-4B-Instruct-2507: un transformer decoder-only denso de unos 4.400 millones de parámetros, publicado en formato BF16 para inferencia. No se trata de un modelo MoE ni de una arquitectura híbrida, y no se han documentado cambios estructurales respecto al modelo base. El repositorio, de 26,5 GB, incluye además una carpeta `original_checkpoint/` con los ficheros de veRL (solo parámetros del modelo), lo que explica que el tamaño del repo duplique con creces el de los pesos BF16.

Su relevancia es fundamentalmente metodológica: sirve para replicar y auditar un pipeline de RL con rúbricas en dominio médico, no como modelo de propósito general. La model card restringe explícitamente el uso a investigación, aunque la etiqueta de licencia del repositorio sea apache-2.0, una contradicción que conviene resolver antes de cualquier despliegue. No hay benchmarks publicados ni datos de entrenamiento detallados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3); no MoE |
| Parametros totales | 4.411.424.256 (segun los safetensors del repositorio) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la ficha; el modelo base Qwen3-4B-Instruct-2507 declara 262.144 tokens |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos BF16 |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 (etiqueta del repositorio); la model card indica "Research use only" |
| Formato de pesos | safetensors (BF16) para inferencia, mas checkpoint original de veRL (solo parametros del modelo) |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Biblioteca | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 26,5 GB |
| Fecha de creacion del repo | 2026-10-01 |
| Ultima actualizacion | 2026-10-01 |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-4B-Instruct-2507 sin modificaciones documentadas: un transformer decoder-only denso, con atención por consultas agrupadas (GQA) y RoPE, en su variante "Instruct" no-thinking del modelo base. El sufijo "dense" del nombre de la ejecución confirma que no se empleó mezcla de expertos. El checkpoint se distribuye en BF16 para inferencia directa con `transformers`, y el repositorio conserva además los ficheros de veRL originales (parámetros únicamente, sin estados del optimizador), lo que permite reanudar o auditar el entrenamiento.

El método de ajuste es aprendizaje por refuerzo con veRL (framework de RL para modelos de lenguaje de ByteDance/Volcano Engine). La etiqueta "online-rubrics" sugiere que la recompensa se construyó a partir de rúbricas generadas o evaluadas en línea durante el entrenamiento, en lugar de un reward model estático, y el dominio declarado es medicina. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, el algoritmo concreto (GRPO, PPO u otro), ni si hubo fases previas de SFT o DPO. El checkpoint corresponde al paso 52 de la fase 1, por lo que se trata de un punto intermedio y no del modelo final de la ejecución.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3-4B-Instruct-2507.
- Orientación a tareas del dominio médico, según el nombre de la ejecución de entrenamiento (`medicine`), aunque no se detalla qué subconjunto de tareas cubre.
- Ajuste con recompensas por rúbricas, lo que en principio favorece respuestas estructuradas y verificables frente a respuestas genéricas.
- Capacidad de razonamiento multi-paso: no confirmada explícitamente para este checkpoint; el modelo base es la variante Instruct no-thinking.
- Soporte de tool calling / function calling: no documentado en la información disponible, aunque la etiqueta `endpoints_compatible` sugiere compatibilidad con inferencia servida.
- Capacidades multilingües: no disponibles en la ficha del modelo.
- Capacidades de visión o audio: no disponibles; no hay indicios de modalidad distinta a texto.

## Casos de uso

- Evaluación de pipelines de RL con rúbricas: el checkpoint permite reproducir el paso 52 de una ejecución concreta y comparar la evolución del comportamiento respecto a pasos anteriores o posteriores, algo útil para investigación en métodos de recompensa.
- Investigación en alineación en dominio sanitario: sirve como punto de partida para estudiar cómo las recompensas basadas en rúbricas modifican el estilo y la estructura de las respuestas médicas frente al modelo base.
- Generación de respuestas médicas estructuradas en entornos de laboratorio: dado el enfoque en rúbricas, el modelo tiende a producir respuestas con formato y criterios explícitos, útil para prototipos de resúmenes clínicos o explicaciones de conceptos.
- Comparación de semillas y variantes: al existir ejecuciones con semillas distintas dentro del mismo grupo (HYU-NLP-EVAL), el modelo permite aislar el efecto de la inicialización aleatoria en el resultado del RL.
- Docencia y experimentación académica: adecuado para cursos o trabajos de fin de máster sobre ajuste fino con RL, ya que el repositorio incluye tanto el modelo de inferencia como los ficheros originales de veRL.
- Auditoría de artefactos de investigación: permite comprobar la trazabilidad entre el checkpoint de RL, los pesos publicados y el modelo base declarado, un caso de uso relevante ante la falta de documentación detallada.
- Base para cuantización y despliegue local experimental: al tratarse de un modelo de ~4,4B en BF16, se puede convertir a GGUF y ejecutar en hardware de consumo, siempre dentro del marco de uso exclusivamente investigador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 8,8 GB (4.411.424.256 parámetros a 2 bytes por parámetro), más overhead de activaciones y caché KV.
- Cuantización a 8 bits: en torno a 4,5-5 GB de pesos; a 4 bits (GPTQ/AWQ/GGUF Q4_K_M): aproximadamente 2,5-3 GB de pesos.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para servicio en BF16 con lotes medios y contexto largo; RTX 4090 24 GB o RTX 3090 24 GB son suficientes para BF16 en lotes pequeños o para cuantización de 8 bits con contexto holgado.
- GPU de consumo: sí cabe. Con cuantización de 4 bits funciona en tarjetas de 8-12 GB, como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070. En BF16 requiere al menos 12 GB de VRAM y, con ventanas de contexto muy largas, 16-24 GB.
- Opciones de despliegue: `transformers` (formato nativo), text-generation-inference (la etiqueta `endpoints_compatible` apunta a compatibilidad con TGI y endpoints de Hugging Face), vLLM, SGLang y llama.cpp/Ollama tras conversión manual a GGUF. El repositorio no incluye pesos GGUF ni cuantizaciones listas para usar.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-052 | 4,41B (denso) | No disponible; base con 262.144 tokens | Sin benchmarks publicados | apache-2.0 / "research use only" | Repo de 26,5 GB, pesos BF16 |
| Qwen/Qwen3-4B-Instruct-2507 | ~4,02B (denso) | 262.144 tokens segun su documentacion publica | Benchmarks publicados por el autor del modelo base | apache-2.0 | Amplia, con GGUF y cuantizaciones de terceros |
| Qwen/Qwen3-4B-Thinking-2507 | ~4,02B (denso) | 262.144 tokens segun su documentacion publica | Benchmarks publicados por el autor del modelo base | apache-2.0 | Amplia |
| Llama-3.2-3B-Instruct | ~3,2B (denso) | 128.000 tokens | Benchmarks publicados por Meta | Licencia comunitaria Llama 3.2 | Amplia |

Los datos de contexto y rendimiento de los modelos comparados provienen de su documentación pública y no se han verificado contra este checkpoint concreto. La comparación directa con el modelo base es la más informativa: este artefacto es un derivado de Qwen3-4B-Instruct-2507 con un ajuste de RL de corta duración (paso 52), por lo que no cabe esperar mejoras generales fuera del dominio médico y del esquema de recompensa usado.

## Limitaciones y advertencias

- Checkpoint intermedio: se trata del paso 52 de una fase de entrenamiento, no de un modelo final. El comportamiento puede ser inestable o incompleto.
- Ausencia total de benchmarks: no hay evidencia publicada de rendimiento en MMLU, HumanEval, GSM8K ni en conjuntos de evaluación médica como MedQA o PubMedQA.
- Documentación mínima: se desconoce el dataset de entrenamiento, el algoritmo de RL, la composición de las rúbricas y los criterios de evaluación.
- Ambigüedad de licencia: la etiqueta del repositorio indica apache-2.0, pero la model card incluye la indicación "Research use only". Conviene tratar el uso comercial como no permitido hasta aclararlo con el autor.
- Dominio médico: cualquier salida con contenido clínico debe considerarse no validada y no apta para uso diagnóstico, terapéutico o de asesoramiento médico real.
- Riesgo de alucinación: inherente a un modelo de 4B ajustado con RL sobre un dominio especializado, y sin datos de evaluación que permitan cuantificarlo.
- Idiomas no documentados: no se especifica qué idiomas cubre este checkpoint ni si el ajuste degradó el multilingüismo del modelo base.
- Sesgos: no se han publicado análisis de sesgos ni de seguridad. La optimización contra rúbricas puede además producir respuestas que se ajusten formalmente al criterio de recompensa sin ser correctas en contenido ("reward hacking").
- Repositorio pesado: 26,5 GB por incluir los ficheros de veRL, lo que complica su descarga y versionado en entornos con poco espacio.
- Sin cuantizaciones oficiales: cualquier GGUF, AWQ o GPTQ debe generarse y validarse por cuenta propia.
- Cero adopción: 0 descargas y 0 "likes" en el momento de redactar esta ficha, sin evidencia de uso externo ni de validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-052
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Perfil del autor: https://huggingface.co/HYU-NLP-EVAL
- veRL (framework de RL empleado, segun los ficheros `original_checkpoint/`): https://github.com/volcengine/verl
