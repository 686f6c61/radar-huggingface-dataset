# SKOPION-Intelligence/skopion-verdict-4b-v15.0-pico-int4

## Resumen

SKOPION Verdict 4B v15.0 Pico-INT4 es un modelo de decisión y evaluación (LLM-as-a-judge / reward model) desarrollado por SKOPION-Intelligence, orientado específicamente a la verificación de cumplimiento normativo en infraestructuras críticas europeas (KRITIS, NIS-2, DORA) y a la evaluación conforme al Reglamento Europeo de IA. No es un modelo generativo de propósito general: su pipeline declarado es `text-classification` y su salida es un veredicto estructurado sobre pares de candidatos, con capacidad de abstención calibrada.

El modelo parte de un backbone de 4.000 millones de parámetros fusionado mediante SLERP (alpha = 0,85) y añade una cabeza MLP residual de decisión (`verdict_head.pt`). Se distribuye en cuantización INT4 de bloque 32 no uniforme, con una huella de memoria de 2,25 GB, lo que lo sitúa en la categoría de edge-AI: el autor reporta 11,4 ms y 1,88 julios por decisión sobre hardware tipo Jetson Orin NX o Raspberry Pi 5.

Su relevancia actual radica en dos factores: la entrada en vigor escalonada del EU AI Act (que exige trazabilidad y mecanismos de abstención en sistemas de alto riesgo) y la demanda de auditoría soberana en el sector crítico europeo. El modelo incorpora una garantía de abstención mediante conformal prediction con umbral alpha = 0,01, que emite el token determinista `[ABSTAIN_HUMAN_REVIEW]` cuando la no conformidad supera los límites de seguridad. Los pesos no son de descarga abierta: el repositorio es una release de solo metadatos y los pesos se aprovisionan previa verificación a entidades europeas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone fusionado por SLERP (alpha = 0,85) y cabeza MLP residual de decisión (`verdict_head.pt`) |
| Parametros totales | 4B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT4 block-32 no uniforme (Pico-INT4); variantes INT8 (edge) y BF16 (native) del mismo programa |
| Idiomas soportados | Alemán (de), inglés (en), polaco (pl) |
| Licencia | SKOPION Sovereign KRITIS & Enterprise Audit License v1.0 (licencia `other`, no comercial abierta) |
| Formato de pesos | Pesos `.safetensors` y `verdict_head.pt` (no incluidos en este repositorio; release de solo metadatos) |

## Arquitectura y entrenamiento

El modelo se construye sobre un backbone transformer de 4B parámetros cuyos pesos se fusionan mediante SLERP con alpha = 0,85, técnica de interpolación esférica entre checkpoints que el autor emplea para consolidar capacidades sin necesidad de PEFT (adaptadores). Sobre el backbone se acopla una cabeza MLP residual de decisión entrenada en bfloat16, que produce el veredicto final. El entrenamiento se ejecutó en el clúster RWTH Aachen CLAIX-2023 con 4× NVIDIA H100 80GB HBM3 (proyecto `rwth2219`). No se especifica en la información disponible el volumen de tokens de entrenamiento ni la composición exacta del dataset.

La innovación técnica principal es la función de pérdida simétrica bilateral (`S4`), que impone invariancia al orden de los candidatos: el veredicto debe ser idéntico para `(A,B)` y `(B,A)`. El autor reporta 99,97% de consistencia posicional (5.403 de 5.405 pares idénticos). Se añade una capa de calibración conformal con partición train/calibration y umbral alpha = 0,01, que actúa como mecanismo de abstención determinista alineado con el Anexo IV del EU AI Act. El autor también declara invariancia de decisión frente a cuantización: 100% de acuerdo exacto entre BF16, INT8 y Pico-INT4 sobre 250 sondas bilaterales de calibración, con deriva máxima de probabilidad de 0,001255 (INT8) y 0,018734 (Pico-INT4).

## Capacidades

- Clasificación y decisión sobre pares de candidatos en tareas de evaluación (LLM-as-a-judge) y modelado de recompensa (reward model).
- Verificación de cumplimiento normativo en dominios KRITIS, NIS-2, DORA y EU AI Act, con suites específicas de evaluación.
- Abstención calibrada: emisión determinista del token `[ABSTAIN_HUMAN_REVIEW]` cuando la no conformidad excede el umbral conformal (alpha = 0,01).
- Invariancia al orden de presentación de candidatos gracias a la pérdida simétrica bilateral S4.
- Soporte multilingüe en alemán, inglés y polaco, con un paquete de decisión específico en polaco (6 suites, más de 1.000 ítems) reportado al 100% de acierto.
- Ejecución en dispositivo (edge-AI) con latencia de 11,4 ms y 1,88 J por decisión.
- No se declara soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso

- Auditoría de cumplimiento KRITIS en infraestructuras críticas: el modelo evalúa pares de configuraciones o políticas y emite un veredicto de conformidad, con abstención automática cuando la evidencia es insuficiente, lo que permite integrarlo en flujos de auditoría con revisión humana obligatoria.
- Evaluación automática de respuestas de LLM (LLM-as-a-judge): su invariancia posicional al 99,97% lo hace adecuado para comparar pares de respuestas generadas sin sesgo de orden, en pipelines de evaluación de calidad de modelos.
- Modelado de recompensa en RLHF: puede puntuar pares de respuestas para entrenamiento por preferencias, con la ventaja de que la calibración conformal permite descartar pares ambiguos en lugar de etiquetarlos de forma ruidosa.
- Triaje documental en cumplimiento NIS-2/DORA: clasificación de documentación regulatoria en categorías de conformidad, ejecutable en hardware de bajo consumo en la propia instalación del cliente (soberanía de datos).
- Despliegue en borde para entornos con requisitos de eficiencia energética: con 1,88 J por decisión y 2,25 GB de huella, encaja en dispositivos Jetson Orin NX o Raspberry Pi 5 (8 GB) para verificación continua en campo.
- Verificación de decisiones en sistemas de alto riesgo conforme al EU AI Act: la garantía de abstención del Anexo IV permite documentar y justificar cada decisión automatizada, con registro criptográfico SHA-256 de los manifiestos de verificación.
- Evaluación multilingüe en el mercado centroeuropeo: el paquete polaco al 100% y el soporte de alemán e inglés lo habilitan para auditorías en entornos DACH y Polonia.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados de forma independiente, campo `verified: false` en el model-index).

| Benchmark | Este modelo (4B INT4) | mammoth-1-27b | basal-omni-1.0-ultra-31b | basal-omni-pico |
|---|---|---|---|---|
| Strict-54 External Mean (54 suites) | 93,97% | 94,26% | 93,50% | 74,00% |
| Wave-11 y Wave-12 KRITIS (13 suites, 3.900 ítems) | 100,00% | 100,00% | 100,00% | no disponible |
| Consistencia posicional bilateral (35 suites, 5.405 pares) | 99,97% (2 flips) | 98,19% (76 flips) | 97,59% (101 flips) | no disponible |
| RewardBench 2 (4-way estricto) | 93,33% (27B) / 89,33% (9B) / 89,00% (4B) | 91,00% | 89,67% | no disponible |
| Paquete de decisión polaco (6 suites, más de 1.000 ítems) | 100,00% | 99,17% | 98,89% | 74,00% |

Comparativa interna de perfiles del mismo programa (precisión, memoria, latencia, energía, precisión Strict-54):

| Perfil | Dispositivo | Precisión | Memoria | Latencia | Energía | Strict-54 |
|---|---|---|---|---|---|---|
| Pico-INT4 | HP ZGX Nano AI / Jetson Orin NX | INT4 | 2,25 GB | 11,4 ms | 1,88 J | 93,97% |
| Edge-INT8 | H100 / L40S / RTX | INT8 | 4,22 GB | 12,8 ms | 3,14 J | 94,02% |
| Native | H100 80GB HBM3 | BF16 | 8,04 GB | 14,6 ms | 3,87 J | 94,04% |
| 9B native | H100 80GB HBM3 | BF16 | 18,3 GB | 29,5 ms | 8,55 J | 94,25% |
| 27B native | H100 80GB HBM3 | BF16 | 54,8 GB | 78,0 ms | 26,52 J | 94,95% |
| Committee 1.5 (82% 4B + 18% 27B) | H100 | BF16 | 60,4 GB | 28,4 ms | 8,38 J | 94,86% |

## Requisitos de hardware

- VRAM estimada para inferencia: 2,25 GB en INT4 (perfil Pico-INT4); 4,22 GB en INT8; 8,04 GB en BF16.
- GPU recomendadas: NVIDIA H100 80GB HBM3, L40S y RTX para los perfiles INT8/BF16; el perfil INT4 está validado sobre HP ZGX Nano AI y Jetson Orin NX.
- Cabe en GPU de consumo: sí, el perfil INT4 (2,25 GB) y el INT8 (4,22 GB) caben en cualquier GPU consumer con 6 GB o más de VRAM; el autor valida además Raspberry Pi 5 de 8 GB.
- Opciones de despliegue: la librería declarada es `transformers`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: 11,4 ms por decisión (INT4), 12,8 ms (INT8), 14,6 ms (BF16); consumo de 1,88 J, 3,14 J y 3,87 J por decisión respectivamente. No se reporta throughput agregado (decisiones/segundo).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Strict-54 | Consistencia posicional | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SKOPION Verdict 4B v15.0 Pico-INT4 | 4B | No disponible | 93,97% | 99,97% | SKOPION Sovereign KRITIS (no abierta) | Solo metadatos; pesos previa verificación |
| baselabs/mammoth-1-27b | 27B | No disponible | 94,26% | 98,19% | No disponible | No disponible |
| basal-omni-1.0-ultra-31b | 31B | No disponible | 93,50% | 97,59% | No disponible | No disponible |
| basal-omni-pico | No disponible | No disponible | 74,00% | No disponible | No disponible | No disponible |

La comparativa relevante es interna al programa: el 4B INT4 iguala prácticamente al 27B nativo (93,97% frente a 94,95% en Strict-54) con una huella 24 veces menor (2,25 GB frente a 54,8 GB) y una latencia 6,8 veces inferior (11,4 ms frente a 78,0 ms). No se dispone de datos de modelos de terceros comparables en la información proporcionada.

## Limitaciones y advertencias

- Pesos no descargables: el repositorio es una release de solo metadatos; los pesos se aprovisionan únicamente a entidades verificadas de infraestructura crítica europea e investigación, previa solicitud en skopion.de.
- Licencia restrictiva: la SKOPION Sovereign KRITIS & Enterprise Audit License v1.0 no es una licencia de código abierto; el uso comercial requiere autorización expresa.
- Resultados no verificados: los tres valores del model-index tienen `verified: false`; proceden del autor y no han sido reproducidos de forma independiente.
- Idiomas limitados: solo alemán, inglés y polaco; no se declara cobertura de castellano ni de otras lenguas.
- Longitud de contexto no disponible: no se especifica la ventana máxima, lo que impide evaluar su idoneidad para documentos regulatorios extensos.
- Riesgo de alucinación: no se documentan tasas de alucinación ni evaluaciones de calibración fuera de las suites declaradas; la abstención conformal mitiga pero no elimina el riesgo de veredictos erróneos con alta confianza.
- Sesgos: no se publica análisis de sesgos demográficos, lingüísticos o de dominio; el entrenamiento orientado a normativa europea puede introducir sesgo hacia interpretaciones regulatorias concretas.
- Especialización estrecha: no es un modelo generativo de propósito general; su uso fuera de tareas de evaluación, decisión o clasificación no está validado.
- Dependencia de hardware específico: las cifras de latencia y energía están medidas sobre dispositivos concretos (Jetson Orin NX, HP ZGX Nano AI) y no son extrapolables sin validación.
- Fecha de publicación futura (2026-11-05): conviene contrastar la vigencia de los artefactos de verificación antes de integrarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-4b-v15.0-pico-int4
- Programa de investigación SKOPION Verdict: https://skopion.de/de/forschung-innovation/skopion-verdict-ki-forschungsprogramm
- Licencia: https://skopion.de/de/forschung-innovation/skopion-verdict-ki-forschungsprogramm
- Dataset de evaluación: https://huggingface.co/SKOPION-Intelligence/SKOPION-Verdict-Bench-56Suites
- Sitio del autor: https://skopion.de
