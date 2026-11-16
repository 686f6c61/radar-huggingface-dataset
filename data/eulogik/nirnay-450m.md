# eulogik/nirnay-450m

## Resumen

NIRNAY 450M es un clasificador de pesos abiertos de 450 millones de parámetros desarrollado por Eulogik, especializado en clasificación de intenciones bancarias y decisiones tipadas. A diferencia de los modelos generativos, realiza una única pasada forward que transforma un estado (por ejemplo, un mensaje de usuario) y una pregunta en probabilidades calibradas sobre un conjunto cerrado de etiquetas. Está afinado sobre el conjunto de datos Banking77 (77 intenciones bancarias) a partir del modelo base convaiinnovations/laya, y se distribuye bajo licencia Apache-2.0.

El modelo se posiciona como una alternativa autoalojada y de coste cero a APIs de clasificación cerradas como Jev, con la que declara una ventaja de 7,6 puntos de accuracy en el mismo conjunto de test (0,8792 frente a 0,803). Su propuesta central es la calibración: reporta un ECE (Expected Calibration Error) ajustado de 0,0454, lo que lo hace apto para decisiones automatizadas con umbrales de confianza y para su uso como guardrail o capa de triaje en pipelines de atención al cliente.

Por su tamaño y su enfoque en inferencia determinista de una sola pasada, está pensado para despliegue en el borde (edge AI, on-device) y en entornos sin GPU dedicada, con latencias declaradas de 209 ms en MPS (Apple M4) y 361 ms en CPU por decisión individual. No genera texto: su única salida es una distribución de probabilidad sobre etiquetas predefinidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune del modelo base convaiinnovations/laya); no se detalla la arquitectura interna del backbone |
| Parametros totales | 450M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | Se menciona exportación ONNX con paridad demostrada e int8 como "palanca de latencia"; no se enumeran formatos de cuantización adicionales |
| Idiomas soportados | Inglés (entrenado en dominio bancario en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, PyTorch, ONNX |

## Arquitectura y entrenamiento

NIRNAY se construye como un fine-tune supervisado del modelo base convaiinnovations/laya sobre el split de entrenamiento de Banking77, un corpus de consultas de usuarios bancarios etiquetadas con 77 intenciones. El autor describe dos fases de entrenamiento (phase_a y phase_b), siendo phase_b la versión publicada en este repositorio y la que obtiene mejores resultados. La model card menciona el uso de LoRA y de una técnica denominada RLCD (Reinforcement Learning from Calibrated Decisions, según las etiquetas del repositorio), orientada a mejorar la calibración de las probabilidades de salida más que la accuracy bruta.

La innovación principal no es arquitectónica sino de propósito: el modelo se plantea como un "system-one" de decisión, es decir, una pasada forward rápida y determinista que devuelve una distribución calibrada sobre etiquetas cerradas, en lugar de generar texto autoregresivamente. Se ha exportado a ONNX con paridad de resultados verificada, aunque el autor indica que ONNX no aportó mejora de velocidad en CPU y que la cuantización int8 es la vía pendiente para reducir latencia. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de Banking77, ni detalles del proceso de ajuste de calibración (fitted ECE).

## Capacidades

- Clasificación de intenciones en dominio bancario sobre 77 etiquetas (Banking77).
- Salida de probabilidades calibradas por clase, apta para umbrales de confianza y decisiones automatizadas.
- Decisiones tipadas: una pasada forward convierte estado y pregunta en una distribución sobre un conjunto cerrado de opciones.
- Inferencia de una sola pasada sin generación de texto, lo que elimina el coste por token y el riesgo de alucinación textual.
- Ejecución offline y autoalojada, sin clave de API ni facturación por llamada.
- Exportación ONNX con paridad demostrada para despliegue en entornos no-PyTorch.
- Capacidades multilingües: no disponibles; entrenado y evaluado únicamente en inglés.
- Tool calling, function calling, razonamiento multi-paso, visión y audio: no disponibles (el modelo no es generativo ni multimodal).

## Casos de uso

- Triaje de consultas en atención al cliente bancaria: el modelo clasifica el mensaje entrante en una de las 77 intenciones de Banking77 y permite enrutarlo al equipo o flujo adecuado; su calibración permite derivar a revisión humana los casos con baja confianza.
- Guardrail de decisiones automatizadas: al devolver probabilidades calibradas (ECE ajustado de 0,0454), puede usarse como capa de verificación que bloquee o escale acciones cuando la confianza cae por debajo de un umbral definido.
- Clasificación on-device en aplicaciones móviles o de escritorio: con 450M parámetros y checkpoint de 466 MB, cabe en equipos de consumo y funciona sin conexión, útil para aplicaciones bancarias que deben operar offline o por privacidad.
- Sustitución de APIs de clasificación cerradas: equipos que hoy pagan facturación por llamada a servicios como Jev pueden autoalojar NIRNAY con coste marginal cero y latencia comparable (209 ms en MPS frente a 310-478 ms de API).
- Preprocesado en pipelines RAG o de agentes: clasificar la intención de la consulta antes de recuperar documentos o seleccionar herramientas, reduciendo el espacio de búsqueda y el coste de las etapas posteriores.
- Investigación sobre calibración: el modelo y sus scripts de evaluación publicados (JSON de resultados por fase) sirven como referencia reproducible para estudiar ECE, Brier score y ajuste de calibración en clasificadores pequeños.
- Detección de intenciones en datasets propios mediante fine-tune: la tesis del modelo base Laya es que un modelo pequeño afinado sobre datos propios supera a APIs zero-shot, por lo que es adecuado como punto de partida para dominios con datos etiquetados.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Banking77 test (n=3080) | Brier | ECE bruto / ajustado | Configuración |
|---|---|---|---|---|
| NIRNAY phase_b | 0,8792 | 0,2083 | 0,089 / 0,0454 | Fine-tune, este repositorio |
| NIRNAY phase_a | 0,8656 | 0,240 | 0,110 / 0,033 | Fine-tune, este repositorio |
| Jev 1.13.0 | 0,803 | No disponible | 0,197 (bruto, setup del tercero) | API zero-shot |
| Julia-1 144M | 0,64 | No disponible | No disponible | Piloto propio de 72 etiquetas, n=100 |
| Baseline sin entrenar | 0,143 | No disponible | No disponible | Pesos frescos |

Comparativa macro-F1 (misma familia de métrica, arneses distintos; el autor la presenta como contraste cruzado, no como leaderboard):

| Modelo | Banking77 macro-F1 | Configuración |
|---|---|---|
| Clef 27B | 0,942 | Decision Index 0.2.1 (auto-reportado) |
| Clef-Flash 9B | 0,909 | Decision Index 0.2.1 (auto-reportado) |
| NIRNAY phase_b | 0,8785 | Fine-tune 450M, este repositorio |
| Kev 9B | 0,848 | Decision Index 0.2.1 (auto-reportado) |
| Jev 1.13.0 | 0,797 | Decision Index 0.2.1 (auto-reportado) |
| Laya | 0,143 | Decision Index 0.2.1 (auto-reportado) |

Latencia declarada por el autor (batch 1, medida el 2026-09-30): 209 ms en Apple M4 con MPS y 361 ms en CPU, frente a 310-478 ms de mediana en llamadas a la API de Jev. El autor advierte que el fine-tune se realizó sobre el split de entrenamiento mientras Jev respondió zero-shot, por lo que la comparación no es estrictamente equivalente.

## Requisitos de hardware

- Checkpoint de 466 MB según la model card; el repositorio completo ocupa 3,8 GB (incluye pesos en varios formatos y artefactos de evaluación).
- VRAM estimada para inferencia en FP32: aproximadamente 1,8 GB para 450M parámetros; en FP16/BF16, en torno a 0,9 GB. Estas cifras son estimaciones por tamaño y no están publicadas por el autor.
- Cabe en GPU de consumo: cualquier GPU con 2 GB o más de VRAM (RTX 3060, RTX 4090, etc.) es suficiente en FP16; también funciona en CPU y en Apple Silicon vía MPS.
- Despliegue: PyTorch/Transformers, ONNX Runtime (exportación con paridad verificada) y, presumiblemente, cualquier runtime compatible con safetensors. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI.
- Latencia medida: 209 ms por decisión en MPS (M4) y 361 ms en CPU. No se publican cifras de throughput en batch.
- La cuantización int8 se señala como la vía abierta para reducir latencia en CPU; ONNX no aportó mejora de velocidad en las pruebas del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Banking77 accuracy | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NIRNAY 450M | 450M | 512 tokens | 0,8792 (fine-tune) | Apache-2.0 | Pesos abiertos en HF |
| Jev 1.13.0 | No disponible | Superior a 512 tokens (API) | 0,803 (zero-shot) | Cerrada (API) | Solo API de pago |
| Laya (base) | No disponible | No disponible | 0,143 | No disponible en la información | Pesos en HF |
| Julia-1 144M | 144M | No disponible | 0,64 (piloto propio, n=100) | No disponible en la información | Pesos en HF |

NIRNAY declara ventaja en accuracy y calibración frente a Jev en el mismo conjunto de test, a costa de menor cobertura idiomática y de contexto (512 tokens frente a la API). Frente a Laya, el fine-tune multiplica por más de seis la accuracy en Banking77, lo que respalda la tesis del autor sobre el ajuste con datos propios. Julia-1, con 144M parámetros, queda muy por debajo en el piloto reportado por su propio autor.

## Limitaciones y advertencias

- Sesgos: no se documenta ningún análisis de sesgos; al estar entrenado solo con consultas bancarias en inglés, puede heredar sesgos del corpus Banking77 y generalizar mal fuera de ese dominio.
- Riesgo de alucinación: bajo en el sentido textual, ya que no genera texto; sin embargo, puede asignar con alta confianza una intención incorrecta ante entradas fuera de distribución, por lo que conviene aplicar umbrales de confianza.
- Contexto limitado a 512 tokens, insuficiente para documentos largos o conversaciones extensas.
- Solo inglés: no soporta otros idiomas, a diferencia de APIs competidoras.
- Dominio restringido: las 77 etiquetas son específicas de banca; su uso en otro dominio requiere fine-tune con datos propios.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías; los resultados de benchmarks son auto-reportados y no verificados de forma independiente.
- La comparación con Jev no es equivalente (fine-tune frente a zero-shot), tal y como reconoce el propio autor.
- Las cifras de VRAM de esta ficha son estimaciones por tamaño de parámetros, no datos publicados.
- El repositorio tiene un número muy bajo de descargas (9) y un solo like en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eulogik/nirnay-450m
- Demo en vivo: https://huggingface.co/spaces/GautamKishore/nirnay-demo
- Código: https://github.com/eulogik/nirnay
- Paper: https://github.com/eulogik/nirnay/blob/main/papers/nirnay/main.pdf
- Resultados de evaluación phase_b: https://github.com/eulogik/nirnay/blob/main/eval/banking77_phase_b.json
- Resultados de evaluación phase_a: https://github.com/eulogik/nirnay/blob/main/eval/banking77_phase_a.json
- Resultados macro-F1: https://github.com/eulogik/nirnay/blob/main/eval/banking77_phase_b_macro.json
- Plan del proyecto: https://github.com/eulogik/nirnay/blob/main/NIRNAY-Breakthrough-Plan.md
- Puertas de validación (GATES): https://github.com/eulogik/nirnay/blob/main/GATES.md
- Script de entrenamiento: https://github.com/eulogik/nirnay/blob/main/src/nirnay/train.py
- Sitio del autor: https://eulogik.com
- Benchmark de referencia de Jev: https://jevbench.xyz
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Dataset Banking77: https://huggingface.co/datasets/polyai/banking77
