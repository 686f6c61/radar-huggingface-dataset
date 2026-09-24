# luispoveda93/sharky-0.5B

## Resumen

sharky-0.5B es un modelo de decisión de tipo Jev/Kev (denominado "System One") desarrollado por Luis Poveda (`luispoveda93`) para el triaje de vulnerabilidades a partir de capturas de red. Dado un flujo de Wireshark renderizado como bytes hexadecimales, responde una batería fija de preguntas tipadas con probabilidades calibradas en una única pasada de prefill, sin generar texto. Se publica como adaptador PEFT sobre el backbone congelado `openbmb/MiniCPM4-0.5B` (433,9 M de parámetros, licencia Apache-2.0).

No es un generador conversacional ni un asistente de seguridad general: es un clasificador de cuatro salidas (`verdict`, `exploit_evidence`, `recon_only` y `severity`) concebido como puerta de enrutado dentro de pipelines de triaje, que delega en análisis más profundos cuando la confianza es baja. Su interés técnico reside en el enfoque: adaptación LoRA r=16 más una cabeza pointer que lee directamente sobre los tokens de opción, calibración de temperatura ajustada (T=1,7411) y un coste computacional propio de un modelo de 0,5B, lo que permite despliegue autoalojado.

Se trata de un checkpoint de investigación (renombrado desde `minicpm4-pcap-kev-v2`) entrenado sobre 78.463 estados de flujo, con una exactitud declarada de 0,9865 en el split bloqueado. El propio autor advierte de que no es una herramienta de seguridad lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (backbone MiniCPM4-0.5B congelado) + adaptador LoRA r=16 sobre proyecciones de atención y MLP + cabeza pointer (proyecciones query/key, producto escalar escalado y softmax sobre los tokens de opción) |
| Parametros totales | 433,9 M en el backbone; el repositorio publica únicamente el adaptador PEFT (número exacto de parámetros entrenables no disponible) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el autor no especifica la ventana empleada para los estados de flujo) |
| Tipos de cuantizacion | no disponible; no se publican variantes GGUF, GPTQ ni AWQ |
| Idiomas soportados | no disponible; la entrada es hexadecimal, no texto en lenguaje natural |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

La entrada del modelo son estados por flujo en bytes hexadecimales (no prosa parseada). Sobre el backbone MiniCPM4-0.5B, congelado, se aplica un adaptador LoRA de rango 16 en las proyecciones de atención y MLP, más una cabeza pointer que proyecta query/key y aplica producto escalar escalado con softmax directamente sobre los tokens de opción. La lectura es solo de prefill: el aislamiento de preguntas mediante máscara block-causal permite responder la batería completa en un único forward pass, sin decodificación autoregresiva. La temperatura de calibración T=1,7411 se ajustó sobre 8.420 registros de calibración reservados y se aplica en la carga del modelo.

El entrenamiento se realizó como continuación con warm-start del checkpoint v1 (learning rate 4e-5, 2 épocas, 9.386 pasos, 0 registros rechazados o truncados) sobre el dataset `luispoveda93/sharky-triage-states`, compuesto por 78.463 estados por flujo: 49.745 procedentes de los Packet-Bytes de `rdpahalavan/UNSW-NB15`, 23.814 de archivos UNSW adicionales reservados y 8.324 flujos reales de tráfico empresarial DAPT-2020 (etiquetas por flujo emparejadas desde CSV de CICFlowMeter). No se menciona uso de RLHF ni DPO.

## Capacidades

- Clasificación de triaje de red en tres clases: `benign`, `suspicious` y `malicious`.
- Detección de evidencia directa de intento de exploit (`exploit_evidence`, salida booleana).
- Distinción entre reconocimiento/escaneo sin explotación (`recon_only`).
- Puntuación de severidad en escala 0-3 (benigno, bajo, elevado, crítico).
- Salidas probabilísticas calibradas: ECE ≤ 0,006 tras aplicar la temperatura de calibración.
- Inferencia en una sola pasada de prefill, sin generación de texto.
- Respuesta de la batería completa de preguntas en un único forward pass mediante aislamiento block-causal.
- Estabilidad frente al orden de las opciones: 0 inversiones en 300 pruebas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso autónomo.
- No dispone de visión, audio ni generación de lenguaje natural.
- Multilingüismo: no aplica; la entrada es una representación hexadecimal de flujos.

## Casos de uso

- Triaje automatizado de alertas de IDS/SIEM: el modelo clasifica cada flujo sospechoso en benigno, sospechoso o malicioso con probabilidad calibrada, lo que permite priorizar la cola de alertas antes de la intervención humana.
- Puerta de enrutado en un SOC: siguiendo el patrón de despliegue descrito por el autor, un veredicto `benign` con p≥0,8 permite autocierre y cualquier otro caso se deriva a revisión humana; los umbrales viven en el código de aplicación, nunca en un prompt.
- Prefiltro de coste antes de análisis profundos: dado su tamaño de 0,5B y su inferencia en un solo prefill, puede descartar flujos triviales y reservar sandboxes o modelos mayores para los casos dudosos.
- Análisis en entornos air-gapped o con requisitos de soberanía de datos: al ser autoalojado y no requerir servicios externos, la captura nunca sale de la infraestructura del operador.
- Etiquetado asistido a gran escala: generación de etiquetas provisionales sobre volúmenes grandes de flujos para construir datasets de entrenamiento de modelos de mayor capacidad.
- Integración como API de triaje: el contrato compatible con TypeSafe `POST /v1/systemone` permite conectar clientes `typesafe-sdk` apuntando `base_url` a un Space o servicio propio.
- Monitorización en el borde: al caber en hardware modesto, puede desplegarse cerca del punto de captura para clasificar tráfico en tiempo casi real sin backhaul.
- Investigación y docencia sobre calibración: sirve como caso de estudio reproducible de cabezas pointer, LoRA y ajuste de temperatura sobre clasificación de seguridad.

## Benchmarks y rendimiento

Datos de evaluación declarados por el autor sobre conjuntos nunca entrenados:

| Conjunto | Exactitud | Macro-F1 |
|---|---|---|
| Split bloqueado (2.446 estados) | 0,9865 | 0,9846 |
| Archivos UNSW reservados (F6+F16) | 0,9905 | 0,990 |
| DAPT-2020 real (retención OOD) | 0,9848 | 0,983 |

Métricas adicionales reportadas: ECE ≤ 0,006 tras calibración, tasa de errores confiados (p≥0,9 y respuesta incorrecta) del 0,3-0,45 % y 0/300 inversiones por orden de opciones. El informe comparativo completo frente al checkpoint v1 está en `phase6/eval_v1v2.json` dentro de `luispoveda93/sharky-workbench`.

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,9 GB solo de pesos del backbone, más adaptador, cabeza pointer, activaciones y caché, en torno a 1,2-1,5 GB en total (estimación a partir de 433,9 M de parámetros).
- Cuantización a 8 bits: del orden de 0,5 GB; a 4 bits: del orden de 0,3 GB (estimaciones; el autor no publica variantes cuantizadas).
- Cabe en GPU de consumo: cualquier tarjeta con 4 GB o más (por ejemplo RTX 3050, RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para lotes pequeños.
- GPU de centro de datos: A100 o H100 son innecesarias para este tamaño y solo tendrían sentido para lotes masivos en paralelo.
- Opciones de despliegue: `transformers` + `peft` con la cabeza pointer personalizada; servicio HTTP compatible con el contrato TypeSafe `POST /v1/systemone`; interfaz Gradio y API en el Space `luispoveda93/pcap-kev-triage`; clientes `typesafe-sdk`.
- No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF, previsiblemente por la cabeza pointer no estándar y la ausencia de decodificación autoregresiva.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| sharky-0.5B | 433,9 M (backbone congelado) | no disponible | Clasificación de triaje de red (4 salidas tipadas) | apache-2.0 | Exactitud 0,9865-0,9905 y macro-F1 0,983-0,990 en sus conjuntos de evaluación |
| openbmb/MiniCPM4-0.5B | 433,9 M | no disponible en la información proporcionada | Modelo generativo de propósito general | apache-2.0 | No disponible en la información proporcionada |
| minicpm4-pcap-kev-v1 | 433,9 M (backbone congelado) | no disponible | Igual que sharky-0.5B (checkpoint previo) | apache-2.0 | Comparativa completa en `phase6/eval_v1v2.json`; cifras concretas no disponibles en esta ficha |
| Modelos de razonamiento de 0,5B (estudio comparativo arXiv 2506.13404) | ~0,5 B | no disponible | Razonamiento general | no disponible | No disponible en la información proporcionada |

No se dispone de datos de benchmark comparables con alternativas de código abierto orientadas a triaje de tráfico de red.

## Limitaciones y advertencias

- Modelo de investigación, no herramienta de seguridad lista para producción, según declara el propio autor.
- Las etiquetas derivan de UNSW-NB15 (tráfico de laboratorio de 2015, con etiquetas imperfectas y en torno a un 97 % de fondo benigno) y de DAPT-2020; cabe esperar degradación en distribuciones que ninguno de los dos cubre.
- Los pcaps sintéticos construidos a mano quedan fuera de distribución y pueden producir veredictos invertidos (medido sobre el checkpoint v1).
- La frontera SUSPICIOUS↔MALICIOUS es el modo de error dominante: aproximadamente 30 de los 35 errores del split bloqueado.
- Persiste una tasa de errores confiados del 0,3-0,45 % (p≥0,9 con respuesta incorrecta), relevante en pipelines con autocierre automático.
- La calibración de las probabilidades depende de aplicar la temperatura T=1,7411 en la carga; omitirla invalida las garantías de ECE.
- Los umbrales de decisión deben residir en el código de la aplicación y no en prompts, tal como recomienda el autor.
- Sesgos específicos no documentados; hereda las características de las distribuciones de entrenamiento (tráfico empresarial de 2015-2020).
- Sin soporte de tool calling, agentes, visión, audio ni generación de texto libre.
- La licencia apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantías y con las advertencias de robustez anteriores.
- El repositorio declara 0 descargas y 0 likes, y un tamaño de 0,0 GB, lo que indica ausencia de validación externa independiente.
- El idioma de entrada es hexadecimal; no se aplican consideraciones multilingües.
- No hay datos publicados de latencia, throughput ni de rendimiento en benchmarks generales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/luispoveda93/sharky-0.5B
- Perfil del autor: https://huggingface.co/luispoveda93
- Modelo base: https://huggingface.co/openbmb/MiniCPM4-0.5B
- Dataset de entrenamiento: https://huggingface.co/datasets/luispoveda93/sharky-triage-states
- Dataset de trabajo y evaluación: https://huggingface.co/datasets/luispoveda93/sharky-workbench
- Informe comparativo v1 vs v2: https://huggingface.co/datasets/luispoveda93/sharky-workbench/blob/main/phase6/eval_v1v2.json
- Demo Space (Gradio y API): https://huggingface.co/spaces/luispoveda93/pcap-kev-triage
- Dataset UNSW-NB15 (referencia de entrenamiento): https://huggingface.co/datasets/rdpahalavan/UNSW-NB15
- Estudio técnico sobre modelos de razonamiento de 0,5B: https://arxiv.org/html/2506.13404v2
- Modelo relacionado del mismo autor: https://huggingface.co/luispoveda93/MiniCPM5-2B
- Repositorio DeepSeek-R1 (referencia general sobre razonamiento por RL): https://github.com/deepseek-ai/DeepSeek-R1
- Buscador de modelos abiertos Hugging Bay: https://huggingbay.xyz/
