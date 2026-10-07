# devops-thiago/classone-qwen3.5-2b

## Resumen

classone-qwen3.5-2b es un modelo de decisión de "Sistema 1" desarrollado por el usuario devops-thiago, construido sobre un ajuste fino completo del backbone Qwen/Qwen3.5-2B (2.213.241.664 parámetros). No es un modelo generativo al uso: en lugar de producir texto token a token, evalúa decisiones estructuradas mediante una arquitectura denominada ClassOne que devuelve salidas tipadas y calibradas en una única pasada hacia delante, sin coste de decodificación.

El modelo expone tres primitivas de decisión: `Noul` (comprobación booleana con probabilidad calibrada), `Choice` (selección categórica sobre 2-255 opciones dinámicas con distribución de probabilidad completa) y `Score` (puntuación ordinal continua sobre 2-10 niveles). Estas salidas se calibran con una pérdida combinada de NLL y Brier normalizado, más un ajuste de temperatura a posteriori.

Es relevante porque propone un enfoque alternativo a los LLM generativos para tareas de enrutamiento, clasificación y evaluación, con latencias de decenas de milisegundos en hardware de consumo. El repositorio es pequeño (4,5 GB), autónomo (no requiere descarga separada del modelo base ni adaptador) y se publica bajo licencia Apache 2.0, aunque a fecha de la ficha no acumula descargas ni validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ClassOne sobre backbone transformer denso (Qwen3.5-2B), con tres cabezas de decisión (Noul, Choice, Score) |
| Parametros totales | 2.213.241.664 (aproximadamente 2,21 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors sin cuantizaciones GGUF/AWQ/GPTQ oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fragmentado), más `classone_heads.pt` (PyTorch) y adaptador LoRA en `lora_backbone/` |

## Arquitectura y entrenamiento

La arquitectura ClassOne sustituye el bucle de decodificación autoregresiva por una evaluación en una sola pasada. El backbone es un transformer denso heredado de Qwen/Qwen3.5-2B, sobre el que se montan tres cabezas específicas: `Noul` devuelve P(true) en el intervalo [0, 1]; `Choice` produce una distribución de probabilidad sobre entre 2 y 255 opciones dinámicas; y `Score` calcula el valor esperado de una rúbrica ordinal de 2 a 10 niveles. Las preguntas y el estado se empaquetan mediante un `ClassOnePromptBuilder` que inserta tokens delimitadores propios en el tokenizador.

El ajuste se realizó con un adaptador LoRA (rango r=16, alpha=32) cuyos pesos se fusionaron en el backbone final, de modo que el modelo carga de forma autocontenida. La calibración combina una pérdida de log-verosimilitud negativa (NLL) con una pérdida de Brier normalizada, y se aplica un ajuste de temperatura a posteriori que reduce el ECE de 0,178 a 0,034 según la model card. Las etiquetas del repositorio mencionan RLCD (aprendizaje por contraste) y reglas de puntuación propias, pero no se detalla la composición del dataset, el número de tokens de entrenamiento ni si hubo fases de RLHF o DPO.

## Capacidades

- Clasificación estructurada mediante la primitiva `Choice`: selección categórica sobre 2-255 opciones con distribución de probabilidad completa.
- Verificación booleana calibrada mediante `Noul`: devuelve P(true) en [0, 1] para preguntas de sí/no.
- Puntuación ordinal mediante `Score`: valor esperado sobre rúbricas de 2 a 10 niveles.
- Inferencia en una sola pasada hacia delante, sin decodificación autoregresiva ni muestreo token a token.
- Empaquetado de estado y múltiples preguntas en una misma llamada (`pack` + `evaluate_packed`), lo que permite resolver varias decisiones por pasada.
- Evaluación de ejes de alineación y seguridad según la model card: fidelidad (faithfulness), honestidad/engaño y ocultación de incertidumbre.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el diseño apunta explícitamente a decisiones de un solo paso, "Sistema 1").
- Capacidades multilingües: no disponible.
- Modo "thinking" explícito, visión o audio: no disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: con `Choice` se puede asignar cada incidencia a un equipo (facturación, técnico, etc.) en una única pasada, aprovechando la distribución de probabilidad para derivar a revisión humana cuando la confianza sea baja.
- Moderación y verificación de contenido: usar `Noul` para responder preguntas binarias calibradas ("¿este mensaje contiene una amenaza?") empleando el valor de P(true) como umbral ajustable según la política de la plataforma.
- Evaluación automática de respuestas de un LLM: `Score` permite puntuar salidas sobre rúbricas ordinales (por ejemplo, fidelidad a las fuentes en 4 niveles) sin necesidad de un modelo juez generativo.
- Detección de intención en atención al cliente: clasificar la intención del usuario antes de invocar un modelo generativo, reduciendo el coste total del pipeline al filtrar y dirigir consultas.
- Encuestas y formularios estructurados: convertir texto libre en respuestas cerradas y escalas Likert, con distribución de probabilidad asociada para análisis estadístico posterior.
- Clasificación en el borde (edge): según la model card, en una RTX 5060 Ti local se obtienen 52,49 ms de latencia media y 19,1 req/s con coste de inferencia nulo, lo que habilita despliegues on-premise con requisitos de privacidad estrictos.
- Monitorización de deriva y seguridad de agentes: evaluar ejes como honestidad o ocultación de incertidumbre sobre trazas de un agente mediante los ejes de evaluación incluidos en la model card.
- Prefiltrado en pipelines RAG: determinar con `Noul` si un fragmento recuperado responde a la consulta antes de pasarlo a un modelo mayor.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre JevBench (231 tareas públicas, repositorio fstandhartinger/jevbench):

| Nivel | Tareas | Precision | ECE | Brier | Latencia mediana (p50) |
|---|---|---|---|---|---|
| Easy | 48 | 100,0% (48/48) | 0,0014 | 0,0000 | 41,9 ms |
| Original | 72 | 91,7% (66/72) | 0,0655 | 0,0545 | 40,3 ms |
| Hard | 111 | 38,7% (43/111) | 0,5176 | 0,5171 | 83,6 ms |
| Agregado | 231 | 68,0% (157/231) | — | — | 40,3 ms |

Desglose del nivel Original según la model card: Original Choice Record 88,9% (32/36); Score 100,0% (12/12); Noul 91,7% (22/24).

Resultados publicados sobre RLCDAlignBench (100 instancias):

| Eje / modo de fallo | Muestras | AUROC | Precision | ECE | Latencia p50 |
|---|---|---|---|---|---|
| Faithfulness | 9 | 0,800 | 55,6% | 0,3486 | 184,2 ms |
| Honesty (deception) | 11 | 0,767 | 72,7% | 0,2207 | 188,9 ms |
| Concealing uncertainty | 14 | 0,571 | 64,3% | 0,3795 | 115,3 ms |
| Balanced accuracy global | 100 | 0,568 | 58,0% | 0,3261 | 173,2 ms |

Comparativa de latencia borde vs nube publicada en la model card:

| Sistema | Latencia media | Throughput | Coste de inferencia |
|---|---|---|---|
| ClassOne (RTX 5060 Ti local) | 52,49 ms | 19,1 req/s | 0,00 USD |
| TypeSafe Jev v1.13 (API en la nube) | 329,90 ms | 3,0 req/s | no disponible |

Todos estos resultados son autoinformados por el autor; no se ha localizado validación independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,6 GB en fp16 (2,21 mil millones de parámetros, ~4,4 GB de pesos más activaciones y buffers), aproximadamente 9 GB en fp32 y en torno a 1,2-2,5 GB con cuantizaciones int4/int8 (no hay cuantizaciones oficiales publicadas).
- GPU recomendadas: la model card cita una RTX 5060 Ti como plataforma de referencia; por tamaño, cualquier GPU con 6 GB o más de VRAM es suficiente en fp16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, L4, A10, A100, H100).
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna con 6 GB o más de VRAM, incluidas RTX 3060, RTX 4060, RTX 4070 y superiores.
- Opciones de despliegue: la model card documenta uso mediante la librería `classone` y `transformers` sobre CUDA con `torch_dtype=torch.float16`. No se menciona soporte oficial de vLLM, llama.cpp, Ollama, TGI ni TensorRT-LLM.
- Latencia y throughput estimados: 52,49 ms de latencia media y 19,1 req/s en una RTX 5060 Ti local; 40,3 ms de latencia mediana agregada en JevBench y entre 115,3 y 188,9 ms por eje en RLCDAlignBench.
- Dependencia de software: requiere el paquete `classone` de Python, además de `transformers` y `torch`, y la carga de `classone_heads.pt` para disponer de las cabezas entrenadas.

## Comparativa con modelos similares

No se han identificado en la información disponible modelos directamente comparables, ya que ClassOne no es un LLM generativo sino una arquitectura de decisión en una sola pasada. La comparación más cercana es con su propio backbone y con clasificadores de texto convencionales.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| classone-qwen3.5-2b | Clasificador/decision single-pass | 2,21 mil millones | no disponible | Apache 2.0 | HuggingFace (0 descargas) |
| Qwen/Qwen3.5-2B | LLM generativo (base) | no disponible | no disponible | Apache 2.0 (segun la model card) | HuggingFace |
| TypeSafe Jev v1.13 | API de decisiones en la nube | no disponible | no disponible | no disponible | API comercial |
| Clasificadores tipo BERT/RoBERTa | Codificador + cabeza de clasificación | 0,1-0,4 mil millones | 512 tokens típicos | variable | HuggingFace |

## Limitaciones y advertencias

- Modelo recién publicado y sin tracción: 0 descargas y 0 likes en HuggingFace en el momento de la ficha, sin validación independiente de los resultados.
- Rendimiento limitado en tareas difíciles: 38,7% de precisión en el nivel Hard de JevBench, con un ECE de 0,5176, lo que indica una calibración muy deficiente en ese régimen.
- Calibración desigual en alineación: en RLCDAlignBench el ECE global es 0,3261 y el AUROC de "concealing uncertainty" cae a 0,571, próximo al azar.
- Todos los benchmarks son autoinformados por el autor y no se han replicado externamente.
- Idiomas soportados: no disponibles. La model card no especifica cobertura lingüística, lo que impide garantizar un comportamiento correcto en castellano u otros idiomas.
- Longitud de contexto: no disponible, lo que dificulta planificar despliegues con estados o documentos largos.
- Naturaleza no generativa: no produce texto; solo responde a las primitivas `Noul`, `Choice` y `Score`. No es apto para tareas de generación, resumen o diálogo abierto.
- Dependencia de una librería propia (`classone`) y de un formato de empaquetado específico con tokens delimitadores, lo que añade coste de integración.
- Discrepancias en la model card: atribuye el modelo base Qwen/Qwen3.5-2B a Google, cuando la familia Qwen corresponde a Alibaba; además incluye una etiqueta `gemma` sin justificación aparente. Conviene verificar la procedencia real de los pesos antes de un uso en producción.
- No se documenta el dataset de entrenamiento ni posibles sesgos heredados del backbone.
- Licencia Apache 2.0 permite uso comercial, pero el cumplimiento debe verificarse también sobre los términos del modelo base y de las dependencias.
- Los datos de entrenamiento, la composición del dataset y cualquier fase de alineación no están documentados, lo que limita la auditabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devops-thiago/classone-qwen3.5-2b
- Repositorio de la arquitectura y el código de entrenamiento: https://github.com/devops-thiago/class-one
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Benchmark JevBench: https://github.com/fstandhartinger/jevbench
- Citación (BibTeX) proporcionada en la model card: ClassOne: A Fast Single-Pass Decision Architecture for Language Models, Thiago Gonzaga, 2026.
