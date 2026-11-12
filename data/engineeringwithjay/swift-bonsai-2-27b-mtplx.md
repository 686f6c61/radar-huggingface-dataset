# EngineeringWithJay/Swift-Bonsai-2-27B-MTPLX

## Resumen

Swift Bonsai 2 27B — MTPLX es un empaquetado comunitario del modelo Swift Bonsai 2 de UkisAI, un ajuste fino por DPO sobre Ternary Bonsai 2 27B de Prism ML. El objetivo de este build es servir el modelo localmente en Apple Silicon con decodificación especulativa mediante MTPLX, un motor de inferencia MLX con soporte de multi-token prediction. El autor del empaquetado es EngineeringWithJay y no tiene relación oficial con UkisAI, Prism ML ni Alibaba Cloud.

El modelo emplea un backbone Qwen3.8-27B con pesos ternarios (2 bits con signo y una escala por bloque de 128), atención híbrida que combina Gated DeltaNet lineal con atención completa cada cuarta capa, y un cabezal MTP int4 tomado del modelo base Qwen. El contexto nativo es de 262.144 tokens, aunque el motor MTPLX lo limita a 8.192 tokens en servicio.

La relevancia de este pack es doble: por un lado demuestra el despliegue de modelos ternarios de 27B en memoria unificada de Apple Silicon (unos 8,2 GB en pesos); por otro, documenta con transparencia las limitaciones de combinar un trunk ajustado por DPO con un cabezal MTP entrenado sobre otra distribución, lo que degrada la tasa de aceptación de la decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: Gated DeltaNet (atención lineal) + atención completa cada 4 capas; backbone Qwen3.8-27B con GQA (24 cabezas Q, 4 KV, head_dim 256) |
| Parametros totales | 27B (aproximado, según denominación del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos; 8.192 tokens de ventana en el motor MTPLX |
| Tipos de cuantizacion | Pesos ternarios (2 bits con signo, escala por bloque de 128, formato prism_hadamard_qwen35); cabezal MTP en int4 g64 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (pack MLX); el modelo base referenciado está en GGUF |
| Capas | 64 |
| Dimension oculta | 5.120 |
| Tamano del repo | 8,8 GB |
| Memoria en servicio | ~8,2 GB wired; 18 GB+ de memoria unificada recomendados |

## Arquitectura y entrenamiento

El trunk es un transformer híbrido basado en Qwen3.8-27B con 64 capas y dimensión oculta de 5.120. La atención alterna capas de Gated DeltaNet lineal con capas de atención completa cada cuatro capas, lo que reduce el coste de contexto largo. Los pesos del trunk son ternarios: cada peso se representa con 2 bits con signo más una escala por bloque de 128, en el formato propietario de Prism ML denominado prism_hadamard_qwen35. El ajuste de UkisAI se realizó mediante DPO sobre el modelo Ternary Bonsai 2 27B de Prism ML.

El pack incorpora además un cabezal MTP (multi-token prediction) de Qwen3.8-27B en int4 g64, sin modificar respecto al upstream, que habilita decodificación especulativa con profundidad 1 por defecto. También se ha injertado la torre de visión del modelo base de Prism ML para satisfacer el contrato de runtime de MTPLX, aunque esa torre no está alineada con el ajuste DPO de Swift. No se dispone de información sobre el volumen de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto en inglés con modo de razonamiento configurable (parámetro `--reasoning-effort`, con opción de desactivarlo).
- Razonamiento matemático y científico de nivel avanzado, según los benchmarks publicados por UkisAI (AIME 2025, GPQA-Diamond).
- Seguimiento de instrucciones (IFBench) y conocimiento académico (C-Eval).
- Decodificación especulativa con muestreo exacto: el trunk mantiene la distribución original a cualquier temperatura mediante aceptación/rechazo con muestreo residual.
- Servicio compatible con APIs OpenAI (`/v1/chat/completions`) y Anthropic (`/v1/messages`) a través del servidor MTPLX.
- Capacidad de visión presente en el pack, pero no validada y no alineada con el ajuste de Swift.
- Soporte de tool calling y agentes: no disponible de forma verificada; el autor advierte que Swift es irregular en instrucciones y uso de herramientas.

## Casos de uso

- Inferencia local en Apple Silicon: el pack está diseñado para servirse con MTPLX en equipos con 18 GB o más de memoria unificada, con un consumo de unos 8,2 GB, lo que permite ejecutar un modelo de 27B en un portátil o Mac mini de gama alta.
- Evaluación de decodificación especulativa: útil para investigadores que quieran medir la tasa de aceptación de un cabezal MTP off-policy frente a un trunk ajustado por DPO, comparando con los resultados del pack base.
- Razonamiento matemático asistido: con los resultados publicados en AIME 2025 (93,33%), puede emplearse en entornos de investigación para generar y verificar pasos intermedios en problemas de competición, siempre con validación humana.
- Prototipado de asistentes conversacionales en inglés: la ventana de 8.192 tokens del motor permite conversaciones multi-turno moderadas; el autor recomienda no usarlo para turnos de agente sin validación previa.
- Investigación sobre cuantización ternaria: sirve como referencia práctica para estudiar el comportamiento de pesos de 2 bits con escala por bloque de 128 en tareas de razonamiento y conocimiento.
- Banco de pruebas de compatibilidad de APIs: al exponer endpoints compatibles con OpenAI y Anthropic, permite validar clientes y pipelines contra un backend local sin depender de servicios en la nube.
- Estudio de alineación DPO: el trunk Swift es un derivado DPO del modelo de Prism, por lo que puede utilizarse para analizar diferencias de comportamiento frente al base en tareas de instrucción.

## Benchmarks y rendimiento

Resultados publicados por UkisAI para Swift frente a Ternary Bonsai 2 base. El autor del pack advierte que no ha re-medido estos valores y que no deben atribuirse al rendimiento de Swift sobre MTPLX.

| Benchmark | Swift Bonsai 2 | Ternary Bonsai 2 (base) |
|---|---|---|
| GPQA-Diamond | 84,34% | 84,18% |
| C-Eval | 81,47% | 81,37% |
| IFBench | 82,60% | 82,13% |
| AIME 2025 | 93,33% | 92,00% |

No se han publicado resultados de benchmarks específicos de Swift sobre MTPLX en la información disponible.

## Requisitos de hardware

- Memoria: aproximadamente 8,2 GB de memoria unificada en uso; se recomiendan 18 GB o más para clientes de agente.
- En equipos de 16 GB de memoria unificada solo es viable con `--allow-swap`, con presión de swap severa y no recomendado para trabajo de turnos de agente.
- Plataforma: Apple Silicon exclusivamente (el motor MTPLX y el formato MLX no están pensados para GPU NVIDIA ni AMD).
- Despliegue: servidor MTPLX (`pip install mtplx`, comando `mtplx serve`), con endpoints OpenAI, Anthropic y de salud.
- GPU recomendadas: no aplica; el pack está orientado a memoria unificada de Apple Silicon. No hay datos de latencia ni throughput publicados.
- Configuración de muestreo recomendada por el autor: temperatura 1.0, top-p 0.95, top-k 20, min-p 0.0, sin penalizaciones de repetición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| Swift Bonsai 2 27B — MTPLX (este pack) | 27B | 262.144 nativo / 8.192 en motor | Ternaria 2 bits + MTP int4 | Apache-2.0 | Apple Silicon (MLX/MTPLX) |
| Ternary Bonsai 2 27B (Prism ML) | 27B | no disponible | Ternaria | no disponible en la información | GGUF |
| Swift Bonsai 2 MLX (text-only, EngineeringWithJay) | 27B | no disponible | Ternaria | Apache-2.0 | Apple Silicon (MLX) |

No se dispone de datos de benchmarks comparativos con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Lanzamiento de investigación experimental: el autor advierte que Swift es irregular en seguimiento de instrucciones, uso de herramientas y código abierto, y recomienda validarlo para cada carga de trabajo.
- La torre de visión injertada es idéntica a la de Prism y no ha sido adaptada por DPO; sus salidas no están probadas.
- El cabezal MTP es off-policy respecto al trunk Swift: el muestreo exacto se mantiene, pero la tasa de aceptación de la decodificación especulativa empeora frente al pack base.
- Los números de benchmark publicados corresponden al modelo de UkisAI, no a este pack servido con MTPLX; no deben citarse como rendimiento de Swift sobre MTPLX.
- Ventana de contexto efectiva de solo 8.192 tokens en el motor, muy inferior al contexto nativo de 262.144.
- Idiomas: únicamente inglés.
- En 16 GB de memoria unificada el modelo solo funciona con swap y no es apto para cargas de agente.
- Atribución obligatoria: los términos de MTPLX exigen un aviso "Powered by MTPLX" si se construye un producto sobre este pack.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben evaluarse empíricamente antes de un uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EngineeringWithJay/Swift-Bonsai-2-27B-MTPLX
- Modelo base (GGUF): https://huggingface.co/ukisai/Swift-Bonsai-2-GGUF
- Ternary Bonsai 2 27B de Prism ML: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Build MLX solo texto del mismo autor: `EngineeringWithJay/Swift-Bonsai-2-MLX` (referenciado en la model card, sin URL directa disponible)
