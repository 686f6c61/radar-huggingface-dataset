# AlexandruGirlea/precommiteu-models

## Resumen

precommitEU model bundle es un conjunto de pesos publicados por AlexandruGirlea para el escáner de código fuente precommitEU, una herramienta de análisis de riesgos regulatorios de la UE (GDPR, EU AI Act, NIS2, DORA, Cyber Resilience Act, Digital Services Act, Digital Markets Act y Data Act). El repositorio no contiene un modelo entrenado desde cero, sino dos modelos base preexistentes de Qwen empaquetados en formato GGUF junto con seis adaptadores LoRA específicos por regulación.

La arquitectura del sistema se divide en dos roles: un detector basado en Qwen2.5-Coder-7B-Instruct (7.615.616.512 parámetros, cuantización Q4_K_M) con un adaptador LoRA por regulación que propone candidatos a violación, y un orquestador/validador basado en Qwen3.6-35B-A3B (modelo MoE, cuantización IQ4_XS, 16,5 GiB) que lee ficheros relacionados y confirma o descarta cada candidato localizando la evidencia citada de forma literal en el código.

La relevancia actual reside en su enfoque de despliegue completamente local y sin dependencia de APIs externas: una vez instalados el escáner, el runtime de llama.cpp (build 10158 o superior) y este bundle, los análisis funcionan en entornos aislados (air-gapped) sin conexión a internet, lo que encaja con los requisitos de confidencialidad habituales en auditorías de cumplimiento normativo sobre código propietario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detector: Qwen2.5-Coder-7B-Instruct; orquestador/validador: Qwen3.6-35B-A3B, MoE) |
| Parametros totales | 7.615.616.512 (detector, safetensors); orquestador no disponible en detalle |
| Parametros activos | no disponible (el orquestador es MoE, pero no se publica el número de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (detector, `base.gguf`); IQ4_XS (orquestador, `orchestrator.gguf`); adaptadores LoRA en GGUF |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelos y adaptadores LoRA); safetensors para los parámetros del detector |

## Arquitectura y entrenamiento

El bundle combina dos modelos base de la familia Qwen con adaptadores LoRA entrenados específicamente para la detección de riesgos regulatorios. El detector emplea Qwen2.5-Coder-7B-Instruct, un transformer decoder-only especializado en código, sobre el que se aplica un adaptador LoRA por cada regulación (GDPR, EU AI Act, NIS2, DORA, CRA, DSA, DMA y Data Act). El orquestador y el validador comparten el mismo fichero `orchestrator.gguf`, basado en Qwen3.6-35B-A3B, un modelo de arquitectura Mixture-of-Experts. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO sobre los adaptadores.

La innovación técnica principal no está en el entrenamiento sino en el pipeline de inferencia en dos etapas con validación estricta: el adaptador propone candidatos, y el validador debe localizar la evidencia citada de forma literal en el fichero para confirmar el hallazgo; los candidatos que no superan la validación se reportan como advertencias y nunca hacen fallar una build. El sistema usa decodificación estándar sobre llama.cpp; no se mencionan técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y análisis de código fuente en Python y otros lenguajes, orientado a la detección de patrones de riesgo regulatorio.
- Detección de violaciones de ocho regulaciones de la UE mediante adaptadores LoRA intercambiables por regulación.
- Razonamiento multi-fichero: el orquestador lee ficheros relacionados cuando un único fichero no basta para emitir un juicio.
- Validación con cita de evidencia: cada hallazgo confirmado cita la línea de código que lo respalda.
- Clasificación de resultados en dos niveles: hallazgos confirmados (con evidencia verificada) y advertencias (candidatos no validados).
- Ejecución completamente offline, incluida en entornos air-gapped, sin llamadas a APIs de LLM externas.
- Integración con CI/CD mediante GitHub Actions (runner autoalojado) y despliegue en Azure GPU runners vía Terraform o Pulumi.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Auditoría de cumplimiento GDPR en bases de código: el detector con el adaptador `gdpr` identifica patrones como registros de datos personales en logs; el caso documentado convierte una línea de log aparentemente inocua en un hallazgo confirmado del Art. 32 mediante búsqueda entre ficheros.
- Evaluación de riesgos del EU AI Act: el adaptador `eu_ai_act` señala componentes que podrían clasificarse como sistemas de IA de alto riesgo, con una precisión del 94 % y una tasa de falsos positivos del 4 % en la evaluación del 3 de noviembre de 2026.
- Verificación de requisitos DORA en entidades financieras: el adaptador `dora` detecta carencias en controles de resiliencia operativa digital directamente sobre el código, con un 96 % de precisión y un 88 % de recall medidos.
- Cumplimiento de NIS2, CRA y DMA en pipelines de CI: el pack combinado `cra_dma_nis2` alcanzó un 100 % de precisión y un 0 % de falsos positivos sobre casos limpios en la evaluación publicada, lo que lo hace adecuado como gate de build.
- Escaneo en entornos air-gapped: organizaciones con requisitos de confidencialidad estrictos pueden ejecutar el escáner y los pesos en infraestructura propia sin conexión, algo crítico para auditorías sobre código propietario.
- Integración en CI/CD empresarial: mediante precommitEU ops se aprovisionan runners Azure con GPU T4 a través de Terraform o Pulumi, con tiempos y costes medidos documentados.
- Revisión de obligaciones del Data Act y del Digital Services Act: los adaptadores `eu_data_act` y `dsa` obtuvieron un 96 % y un 100 % de precisión respectivamente, útiles para equipos legales y de ingeniería que revisan cláusulas de compartición de datos o moderación de contenidos implementadas en código.

## Benchmarks y rendimiento

Evaluación del 3 de noviembre de 2026 con la wheel 0.3.0 y estos pesos. Mide si cada fichero generó algún hallazgo confirmado; las advertencias quedan excluidas.

| Pack / dataset | Precision | Recall | Tasa de falsos positivos en casos limpios |
|---|---|---|---|
| `gdpr` | 92 % | 92 % | 8 % |
| `eu_ai_act` | 94 % | 64 % | 4 % |
| `eu_data_act` | 96 % | 92 % | 4 % |
| `cra_dma_nis2` | 100 % | 88 % | 0 % |
| `dsa` | 100 % | 92 % | 0 % |
| `dora` | 96 % | 88 % | 4 % |
| Agregado (9 datasets) | 95,5 % | 85,7 % | 4 % |

El agregado corresponde a 450 ejecuciones sintéticas balanceadas sobre nueve datasets (440 fragmentos únicos). Los falsos positivos afectaron a 9 de 225 casos limpios (9 de 201 casos marcados, 4,5 %). Un caso positivo no completó: el recall es del 85,7 % sobre positivos completados, o del 85,3 % contando el fallo como omisión. El conjunto exacto de artículos coincidió en el 79,1 % de todos los casos. Todos los casos usaron la ruta directa, por lo que la evaluación no mide razonamiento entre ficheros ni integración en CI.

Respecto a la versión anterior del README, DSA pasó de un 15 % a un 0 % de falsos positivos y el pack combinado CRA/DMA/NIS2 del 5 % al 0 %; GDPR empeoró del 6 % al 8 %, DORA del 0 % al 4 % y el recall del EU AI Act cayó del 93 % al 64 %. El autor advierte que las muestras difieren y no se trata de un experimento controlado antes/después.

## Requisitos de hardware

- RAM: 32 GB para ejecución local, incluidos portátiles Apple Silicon.
- Disco: aproximadamente 23 GB para el bundle completo.
- GPU: runners Azure con GPU T4 aprovisionados por precommitEU ops; los runners estándar de GitHub son insuficientes y requieren runner autoalojado.
- Detector: `base.gguf` en Q4_K_M sobre Qwen2.5-Coder-7B-Instruct, apto para hardware de consumo con suficiente RAM.
- Orquestador: `orchestrator.gguf` en IQ4_XS, 16,5 GiB, correspondiente a Qwen3.6-35B-A3B.
- Runtime: llama.cpp build 10158 o superior.
- Despliegue: llama.cpp como runtime de inferencia; integración con GitHub Actions y con Azure GPU runners vía Terraform o Pulumi.
- Latencia: un escaneo real tarda unos 80 segundos en un MacBook de la serie M (demo reproducida a 5×). No se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| precommitEU model bundle | 7,6 B (detector) + MoE (orquestador) | no disponible | Detección de riesgos regulatorios UE sobre código, con validación de evidencia | Apache 2.0 | Hugging Face, pesos GGUF + LoRA |
| Qwen2.5-Coder-7B-Instruct | 7,6 B | no disponible en esta ficha | Modelo base de código general | Apache 2.0 | Hugging Face |
| Qwen3.6-35B-A3B | MoE, 35 B totales | no disponible en esta ficha | Modelo base general MoE | no disponible en esta ficha | Hugging Face |

No se dispone de datos de benchmarks comparativos frente a otros escáneres de cumplimiento normativo, por lo que no es posible establecer una comparación de rendimiento con alternativas de la misma tarea.

## Limitaciones y advertencias

- El bundle no es un modelo generalista: está diseñado exclusivamente para el pipeline de precommitEU y su uso fuera de ese contexto no está evaluado.
- Idiomas: solo inglés según la model card, lo que limita su aplicación sobre código y documentación en castellano u otras lenguas.
- Recall del EU AI Act del 64 % en la evaluación publicada, con una caída respecto al 93 % de una evaluación anterior con muestras distintas.
- Tasa de falsos positivos del 8 % en GDPR: los hallazgos requieren revisión humana antes de bloquear builds.
- La evaluación cubre solo la ruta directa; no se midió el razonamiento entre ficheros ni la integración en CI, que son precisamente las funciones del orquestador.
- El autor advierte que cero falsos positivos observados no garantiza cero en producción.
- Riesgo de alucinación mitigado parcialmente por el validador, que exige localizar la evidencia de forma literal; los candidatos no validados se degradan a advertencias.
- Los runners estándar de GitHub son demasiado pequeños: la ejecución en CI requiere infraestructura autoalojada o GPU (T4 en Azure).
- No se documentan sesgos específicos del modelo más allá de los heredados de los modelos base Qwen.
- Licencia Apache 2.0, sin restricciones conocidas para uso comercial, aunque el usuario debe verificar las condiciones de los modelos base Qwen subyacentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AlexandruGirlea/precommiteu-models
- Repositorio GitHub del escáner: https://github.com/AlexandruGirlea/precommiteu
- Repositorio GitHub de ops: https://github.com/AlexandruGirlea/precommiteu-ops
- Guía de instalación offline: https://alexandrugirlea.github.io/precommiteu/install.html#air-gapped-and-offline-installation
- Demo interactiva: https://precommit.eu/try
- Modelo base detector: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Modelo base orquestador: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
