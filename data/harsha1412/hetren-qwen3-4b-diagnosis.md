# Harsha1412/hetren-qwen3-4b-diagnosis

## Resumen

Hetren diagnosis model es un ajuste fino QLoRA de Qwen/Qwen3-4B-Instruct-2507, desarrollado por el usuario Harsha1412, diseñado para diagnosticar ejecuciones registradas de un agente sintético de atención al cliente llamado Hetren. Dado el conjunto de evidencias de una ejecución (registros de herramientas como `read_ticket`, `lookup_account` y `route_ticket`), el modelo devuelve una única acción: una decisión (`no_intervention`, `insufficient_evidence` o `abstain`), una recuperación a proponer o una sonda que necesitaría. El modelo no aplica cambios: solo propone.

Se trata de un adaptador LoRA de rango 16 sobre el modelo base de 4.022 millones de parámetros, con licencia Apache 2.0 y publicado junto con dos cuantizaciones GGUF (Q4_K_M como predeterminada y Q8_0 de mayor fidelidad), el tokenizador y un manifiesto de exportación que fija cada archivo por sha256. El alcance es deliberadamente estrecho: fue entrenado únicamente sobre el flujo de trabajo sintético de soporte de Hetren y sus familias de fallos, por lo que fuera de ese dominio sus salidas no son significativas.

Su relevancia es metodológica: documenta un protocolo de evaluación congelado antes de cualquier ejecución de test, con intervalos de confianza de Wilson y una métrica de selección de checkpoint predeclarada (S = ½(A₁ + A₂) − W). Está pensado para investigación y demostración del método de evaluación, no para decisiones de producción sobre sistemas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino QLoRA sobre el modelo base |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens en la validación; el modelo base Qwen3-4B-Instruct-2507 soporta contextos mayores, pero el protocolo validado usa 4.096 |
| Tipos de cuantizacion | GGUF Q4_K_M (predeterminada) y Q8_0; adaptador LoRA en safetensors para base fp16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA), GGUF (modelo fusionado cuantizado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only, y se ajusta mediante QLoRA sobre una base cuantizada a 4 bits NF4 con doble cuantización y cómputo en fp16. El adaptador tiene rango 16, alpha 32, dropout 0.05 y se aplica a las siete proyecciones de atención y MLP. El entrenamiento usa AdamW de 8 bits paginado, learning rate 1e-4 con decaimiento coseno, 3% de warmup, batch efectivo de 16, longitud de secuencia 2.560 sin truncación ni empaquetado, semilla 2029, una época y 1.055 pasos sobre GPUs Kaggle T4. La pérdida cubre solo los tokens del asistente, con pesos para verbos raros por nivel limitados a 3.

Los datos provienen de los splits de entrenamiento de los datasets sintéticos de Hetren v2 (fallo único, nivel 1) y v3 (hasta dos fallos, nivel 2), con partners de contraste incluidos. Las etiquetas se obtienen ejecutando las recuperaciones de cada ejecución en el entorno simulado. Tras deduplicar y descartar 58 entradas conflictivas quedaron 17.082 ejemplos (32,6M tokens); un presupuesto predeclarado de 14 horas conservó todos los ejemplos no-sonda y muestreó las sondas a tasa 0,9707, resultando 16.869 ejemplos. Se evaluaron cuatro checkpoints predeclarados (264, 528, 792, 1.055) con la métrica S = ½(A₁ + A₂) − W, donde A son las precisiones de decisión por nivel y W la tasa de intervenciones erróneas en ejecuciones sanas; el checkpoint 792 obtuvo S = 0,7322 frente a 0,1947 del base sin entrenar. La exportación fusionó el adaptador en la base fp16 con `merge_and_unload`, convirtió a GGUF y cuantizó a Q8_0 y Q4_K_M sin matriz de importancia con llama.cpp build 11669. Una comprobación de paridad de tokenizador sobre las 6.569 textos distintos de validación no encontró diferencias.

## Capacidades

- Diagnóstico de ejecuciones de agente: clasifica una ejecución registrada en `no_intervention`, `insufficient_evidence` o `abstain`.
- Propuesta de recuperación: sugiere una acción de recuperación de un solo paso (nivel 1) cuando procede.
- Solicitud de sonda: indica qué comprobación adicional necesitaría para decidir.
- Razonamiento sobre evidencias estructuradas de herramientas (`read_ticket`, `lookup_account`, `route_ticket`).
- Generación de texto conversacional heredada del modelo base Qwen3-4B-Instruct-2507.
- Soporte de tool calling y function calling heredado del modelo base (no validado en este ajuste).
- Capacidades multilingües limitadas: el ajuste se declara solo en inglés; el base soporta más idiomas, pero el comportamiento del ajuste fuera del inglés no está validado.
- Validado también en recuperación de dos pasos (nivel 2), aunque ninguna herramienta publicada lo soporta.

## Casos de uso

- Investigación sobre evaluación de agentes: sirve como sistema de referencia para estudiar métricas de decisión, tasas de intervención errónea e intervalos de confianza en diagnósticos de trazas de agente.
- Demostración del método de evaluación de Hetren: el CLI `hetren` verifica cada archivo contra el manifiesto y construye el prompt exactamente como se validó, lo que permite reproducir los resultados publicados.
- Análisis de fallos en pipelines de soporte sintético: dado un `AgentRunRecord` del SDK de OpenAI Agents, el modelo identifica si la ejecución requiere recuperación y cuál.
- Detección de evidencia insuficiente: en ejecuciones con datos incompletos, devuelve `insufficient_evidence` o una sonda concreta en lugar de forzar una decisión, lo que es útil para diseñar políticas de escalado.
- Estudio de abstención selectiva: el modelo puede abstenerse (`abstain`), lo que permite analizar el equilibrio entre cobertura y precisión en sistemas de decisión automatizada.
- Base para ajustes posteriores: al ser un adaptador LoRA de rango 16 sobre Qwen3-4B, puede reutilizarse como punto de partida para dominios de diagnóstico similares con datasets propios.
- Experimentación local con llama.cpp: la GGUF Q4_K_M de 2,5 GB permite ejecutar el modelo en hardware de consumo para pruebas de concepto.

## Benchmarks y rendimiento

La información proporcionada incluye la métrica de selección de checkpoint, pero no los resultados completos de los endpoints primarios de test (precisión de decisión y tasa de intervención errónea con intervalos de Wilson), que quedaron truncados en la model card.

| Metrica | Checkpoint 792 | Base sin entrenar |
|---|---|---|
| S = ½(A₁ + A₂) − W (validación) | 0,7322 | 0,1947 |

No se han publicado en la información disponible los resultados completos de MMLU, HumanEval, GSM8K ni de los endpoints primarios de test.

## Requisitos de hardware

- VRAM estimada para GGUF Q4_K_M: aproximadamente 2,5 GB de pesos más overhead de contexto; viable en GPUs de 6-8 GB.
- VRAM estimada para GGUF Q8_0: aproximadamente 4,3 GB de pesos más overhead; recomendable 8 GB o más.
- Adaptador LoRA sobre base fp16: requiere cargar Qwen3-4B-Instruct-2507 en fp16 (unos 8 GB) más el adaptador de 132 MB; recomendable 16 GB de VRAM.
- GPUs recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para fp16; A100/H100 no necesarias por el tamaño del modelo.
- Cabe en GPU de consumo: sí, en cualquiera con 8 GB o más usando Q4_K_M.
- Opciones de despliegue: ruta validada mediante el CLI/API `hetren` (imagen Docker `linux/amd64` con AVX2, FMA y F16C); llama.cpp con `llama-server` funciona pero no es la ruta validada.
- Latencia y throughput: no disponibles en la información proporcionada.
- Decodificación validada: greedy, `top_k` 1, temperatura 0, sin penalizaciones, máximo 128 tokens nuevos, contexto de 4.096 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Hetren qwen3-4b-diagnosis | 4.022M | 4.096 (validado) | Apache 2.0 | Diagnóstico de ejecuciones de agente (nicho) | Hugging Face, GGUF + LoRA |
| Qwen/Qwen3-4B-Instruct-2507 | 4.022M | no disponible en la información | Apache 2.0 | Instrucción general | Hugging Face |
| Alternativas de diagnóstico de agentes | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de otros modelos comparables especializados en diagnóstico de trazas de agente con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Alcance estrictamente limitado: entrenado solo sobre el flujo sintético de soporte de Hetren (herramientas `read_ticket`, `lookup_account`, `route_ticket` y sus familias de fallos); fuera de ese flujo las salidas no son significativas.
- No es un diagnosticador general de trazas de agente.
- El modelo propone, nunca aplica cambios; cualquier ejecución de recuperaciones debe gestionarla el CLI/API.
- Solo el nivel 1 (recuperación de un paso) está soportado por herramientas publicadas; el nivel 2 fue validado pero no tiene soporte de herramientas.
- Uso previsto exclusivamente para investigación y demostración del método de evaluación; no apto para decisiones de producción sobre sistemas reales.
- Idioma: declarado solo en inglés; el comportamiento en otros idiomas no está validado.
- Riesgo de alucinación: no cuantificado en la información disponible; al ser un modelo de 4B ajustado con datos sintéticos, la fiabilidad fuera de distribución es incierta.
- Sesgos: no documentados en la información proporcionada.
- El adaptador no fija la revisión del modelo base en `adapter_config.json`; es necesario pasar `revision=cdbee75f17c01a7cc42f958dc650907174af0554` al cargarlo.
- La imagen Docker requiere `linux/amd64` con AVX2, FMA y F16C.
- Usar la GGUF directamente en llama.cpp con otro template, sampler o prompt invalida los resultados publicados.
- Las exportaciones de trazas del SDK son rechazadas: faltan los registros de gateway que el modelo lee.
- Licencia Apache 2.0 permite uso comercial, pero el alcance y la validación limitados desaconsejan ese uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Harsha1412/hetren-qwen3-4b-diagnosis
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio Hetren (protocolo de evaluación, código y logs): https://github.com/DevaNuthakki/Hetren
- Imagen del CLI: ghcr.io/devanuthakki/hetren-cli (etiqueta de la primera release)
