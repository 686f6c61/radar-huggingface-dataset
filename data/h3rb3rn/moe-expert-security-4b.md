# h3rb3rn/moe-expert-security-4b

## Resumen

`moe-expert-security-4b` es un modelo de lenguaje pequeño (SLM) de 4.000 millones de parámetros especializado en ciberseguridad, desarrollado por el autor h3rb3rn como parte del sistema compuesto MoE Sovereign. Se trata de un experto de dominio entrenado por destilación a partir de los modelos DeepSeek-V3 y Mistral-Large-2407, sobre la base del modelo Qwen3.5-4B, que combina atención lineal híbrida con capas Mamba. El entrenamiento se realizó en el supercomputador LUMI-G con 8 GPU AMD Instinct MI250X de 128 GB, utilizando un conjunto de datos de 32.800 trayectorias de auditoría de seguridad validadas.

El modelo está diseñado para tareas de análisis estático de seguridad (SAST), detección de secretos con alta sensibilidad, modelado de amenazas STRIDE y generación de manifiestos de endurecimiento de sistemas. Su relevancia actual radica en que ofrece capacidades especializadas de seguridad en un formato compacto, con licencia Apache 2.0 y pesos disponibles en safetensors y GGUF, lo que facilita su despliegue en entornos de producción y en hardware de consumo. Según la model card, supera significativamente al modelo base en métricas de clasificación CWE, detección de secretos y validez de políticas de endurecimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención lineal + Mamba (base Qwen3.5-4B) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (safetensors), GGUF Q4_K_M, GGUF Q8_0 |
| Idiomas soportados | Inglés, alemán |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5-4B, que combina mecanismos de atención lineal con bloques Mamba, lo que permite un equilibrio entre eficiencia computacional y capacidad de modelado de secuencias largas. Sobre esta base se aplicó un ajuste fino por destilación (distillation) utilizando como profesores DeepSeek-V3 y Mistral-Large-2407. El proceso de entrenamiento se realizó en el clúster LUMI-G con 8 GPU AMD Instinct MI250X de 128 GB, empleando DeepSpeed ZeRO-2, ROCm 7.0 y PyTorch 2.6.

El conjunto de datos de entrenamiento, `moe-sovereign/expert-security-sft`, contiene 32.800 trayectorias de auditoría de seguridad de alta confianza, validadas mediante verificación de benchmarks CWE y validación de exploits. Se aplicó LoRA con r=16, alpha=32 y dropout de 0.05 sobre los módulos q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. El entrenamiento duró 3 épocas con un tamaño de lote efectivo de 128 (micro-batch 4 × 8 GPUs × acumulación de gradientes 4), una tasa de aprendizaje de 1.5e-5 con decaimiento coseno y calentamiento. La pérdida final fue de 0.0078 y la precisión de tokens alcanzó el 99.83 %.

## Capacidades

- Análisis estático de seguridad de aplicaciones (SAST): identificación de fallos de seguridad de memoria, vectores de inyección (CWE-89, CWE-78), controles de acceso rotos (CWE-862) y vulnerabilidades SSRF.
- Detección de secretos y tokens con alta sensibilidad: localización de claves privadas, tokens de alta entropía y credenciales en bases de código multiarchivo, incluso ofuscadas o fragmentadas.
- Modelado de amenazas STRIDE: generación de matrices STRIDE estructuradas, mapeadas a límites de confianza del sistema, arquitecturas de microservicios y pipelines CI/CD.
- Síntesis de manifiestos de endurecimiento: generación de políticas de kernel Linux (Seccomp, AppArmor), perfiles SELinux, cabeceras CSP y políticas de red de Kubernetes.
- Clasificación determinista de CWE: asignación de categorías CWE-1000 con verificación de vectores de explotación.
- Generación de texto en inglés y alemán, con soporte de conversación multi-turno.

## Casos de uso

- Auditoría de seguridad en pipelines CI/CD: el modelo puede integrarse como paso de análisis estático para detectar vulnerabilidades comunes (inyección, SSRF, control de acceso) en cada commit, generando informes con clasificación CWE y sugerencias de corrección.
- Escaneo de secretos en repositorios grandes: gracias a su alta sensibilidad y baja tasa de falsos positivos, es adecuado para revisar repositorios completos en busca de claves privadas, tokens de API y credenciales embebidas, reduciendo el ruido frente a herramientas tradicionales.
- Modelado de amenazas en arquitecturas de microservicios: el modelo puede generar matrices STRIDE para cada servicio, identificando vectores de ataque a través de límites de confianza y proponiendo mitigaciones específicas.
- Generación de políticas de endurecimiento para contenedores: a partir de una descripción del servicio, el modelo produce manifiestos Seccomp JSON, perfiles AppArmor y políticas de red de Kubernetes listos para aplicar en entornos de producción.
- Análisis de vulnerabilidades en código legacy: permite clasificar hallazgos de escáneres SAST existentes, priorizarlos según CWE y sugerir parches concretos, mejorando la productividad de los equipos de seguridad.
- Formación y concienciación en seguridad: el modelo puede utilizarse como asistente interactivo para explicar vulnerabilidades, generar ejemplos de explotación controlados y proponer ejercicios de modelado de amenazas en entornos educativos.

## Benchmarks y rendimiento

La model card incluye una evaluación empírica sobre un conjunto de pruebas reservado de 1.000 tareas de auditoría de ciberseguridad (derivadas de corpus CVE y benchmarks sintéticos), sin solapamiento con el entrenamiento. Los resultados se obtuvieron con temperatura 0.05 y 3 semillas independientes:

| Métrica | Qwen3.5-4B base | moe-expert-security-4b | Delta |
|---|---|---|---|
| Precisión de clasificación CWE-1000 | 63.4 % | 94.7 % | +31.3 % |
| Recall de escaneo de secretos (alta entropía / claves) | 71.2 % | 98.6 % | +27.4 % |
| Precisión de escaneo de secretos | 65.8 % | 95.1 % | +29.3 % |
| Tasa de falsos positivos en código benigno | 22.4 % | 3.8 % | -18.6 % |
| Cobertura de amenazas STRIDE | 57.0 % | 92.3 % | +35.3 % |
| Sintaxis válida de políticas de endurecimiento (Seccomp/AppArmor) | 52.6 % | 96.4 % | +43.8 % |

No se han publicado resultados en benchmarks generales estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Inferencia en BF16: aproximadamente 8 GB de VRAM para los 4.2 mil millones de parámetros, por lo que cabe en GPUs consumer como RTX 3080/3090, RTX 4070/4080/4090 y equivalentes de AMD con 8 GB o más.
- Inferencia con cuantización GGUF Q4_K_M: aproximadamente 2.5-3 GB de VRAM, ejecutable en GPUs de 4-6 GB (p. ej., RTX 3060, GTX 1660 Super) y en CPU con llama.cpp.
- Inferencia con cuantización GGUF Q8_0: aproximadamente 4.5-5 GB de VRAM, adecuado para GPUs de 6-8 GB.
- El entrenamiento se realizó en 8 GPU AMD Instinct MI250X de 128 GB, pero para inferencia no se requiere ese nivel de hardware.
- Opciones de despliegue: compatible con transformers (PyTorch), vLLM, llama.cpp, Ollama y TGI, gracias a los formatos safetensors y GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y del backend utilizado.

## Comparativa con modelos similares

La comparación principal disponible es contra el modelo base Qwen3.5-4B, como se refleja en la sección de benchmarks. No se han encontrado comparativas públicas con otros modelos especializados en seguridad de tamaño similar (por ejemplo, WhiteRabbitNeo, SecLM o modelos de detección de vulnerabilidades de 3-7B). Se recomienda evaluar el modelo frente a alternativas como Qwen2.5-Coder-3B o CodeLlama-7B para tareas de análisis de código, aunque estas no están específicamente entrenadas para ciberseguridad. La información comparativa con otros modelos es, por tanto, no disponible.

## Limitaciones y advertencias

- La model card inicia una sección de "Known Limitations & Failure Modes" que no se ha incluido completa en la información proporcionada; por tanto, las limitaciones específicas declaradas por el autor no están disponibles.
- El modelo está entrenado principalmente en inglés y alemán; su rendimiento en otros idiomas puede ser limitado.
- Aunque la tasa de falsos positivos en detección de secretos es baja (3.8 %), no es nula; se recomienda validación humana en entornos críticos.
- La clasificación CWE y la generación de políticas de endurecimiento pueden producir resultados incorrectos o incompletos en casos límite; no debe utilizarse como única fuente de verificación de seguridad.
- Riesgo de alucinación inherente a los modelos de lenguaje: puede generar vectores de explotación o políticas que no sean aplicables o que contengan errores sutiles.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías; el usuario es responsable de su uso en entornos de producción.
- No se especifica la longitud de contexto soportada, lo que puede afectar al análisis de archivos muy largos o repositorios completos en una sola pasada.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/h3rb3rn/moe-expert-security-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/moe-sovereign/expert-security-sft
- Supercomputador LUMI-G: https://www.lumi-supercomputer.eu/
