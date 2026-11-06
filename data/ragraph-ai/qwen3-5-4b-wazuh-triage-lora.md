# ragraph-ai/Qwen3.5-4B-Wazuh-Triage-LoRA

## Resumen

Qwen3.5-4B-Wazuh-Triage-LoRA es un clasificador de triaje de alertas Wazuh desarrollado por Mehdi Challakh (RAGraph.ai), publicado el 26 de octubre de 2026 bajo licencia Apache-2.0. El modelo parte de Qwen3.5-4B como modelo base y añade tres adaptadores LoRA (uno por semilla de entrenamiento) que se combinan como un ensemble promediando sus log-odds. Su propósito es resolver un problema muy concreto de los SOC: reducir el ruido de las alertas que genera Wazuh clasificando, en una sola pasada hacia adelante y sin generar texto, qué líneas de alerta de una ventana temporal de 10 minutos por host forman parte de actividad maliciosa.

La relevancia del modelo radica en su enfoque de "label-token readout": en lugar de usar el modelo como chatbot, se leen los logit de los tokens de etiqueta (`A` para malicioso, `B` para benigno), lo que permite puntuar todas las líneas de una ventana de forma eficiente. Está diseñado específicamente para un sitio cuyo tráfico benigno se usó en el fine-tuning, de modo que su principal fortaleza es distinguir la actividad administrativa rutinaria de esa organización frente a actividad sospechosa. No es un detector de propósito general y no traslada bien a sitios nuevos sin reentrenamiento.

El repositorio incluye los tres adaptadores en safetensors (0,4 GB en total), el código de renderizado de las alertas, los prompts byte-exactos, los umbrales de validación y las puntuaciones por ventana para reproducir los resultados del paper sin GPU. Existe un preprint en preparación: *Fine-Tuning a 4B Language Model for Site-Specific Wazuh Alert Triage* (v2, 26 de octubre de 2026), cuyo identificador arXiv aún no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3.5) con Gated DeltaNet, adaptado como clasificador binario mediante LoRA y label-token readout |
| Parametros totales | ~4.000 millones (base Qwen3.5-4B) + 3 adaptadores LoRA de 32,5 millones de parametros entrenables cada uno |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (entradas tipicas de 2.8–3.5k tokens) |
| Tipos de cuantizacion | no disponible (inferencia en bf16 documentada) |
| Idiomas soportados | ingles (los logs y prompts; el modelo base soporta mas idiomas, pero el clasificador esta entrenado en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT LoRA de 124 MB cada uno) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-4B (revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`), un modelo de lenguaje con arquitectura hibrida que combina atencion estandar con bloques Gated DeltaNet. Sobre el se entrenan tres adaptadores LoRA identicos en configuracion (r = 16, α = 32, dropout 0,05) aplicados a todas las proyecciones de atencion, Gated DeltaNet y MLP, con 32,5 millones de parametros entrenables cada uno. Los tres adaptadores se entrenan con semillas distintas (1234, 2 y 3) y se publican como ensemble: la puntuacion final es la media de los log-odds de los tres adaptadores.

El entrenamiento consistio en 1 epoca sobre 4.610 ventanas por semilla, con una duracion de 1,2 horas por semilla en una RTX 4090 (13 GB de VRAM pico). La funcion de perdida es binary cross-entropy aplicada sobre cada linea etiquetada mas el veredicto de la ventana; las lineas con etiqueta -1 se excluyen del calculo. La innovacion tecnica central es el label-token readout: en lugar de generar texto, se calcula `z = logsumexp(h·W[{A, " A"}]) − logsumexp(h·W[{B, " B"}])` en cada marcador ` ?` y en la ultima posicion, usando solo las cuatro filas de tokens de etiqueta de la matriz de embedding de salida, sin computar logits sobre el vocabulario completo. El prompt usa la plantilla de chat de Qwen3.5 con el modo thinking desactivado.

La entrada se renderiza como texto: una cabecera con el rol del host, la leyenda de lineas y una tarjeta por cada regla Wazuh disparada (nivel, descripcion, grupos, tecnica ATT&CK), seguida de hasta 40 lineas juzgadas y hasta 6 lineas de contexto (sin marcar ni juzgar). La pila de software esta fijada a Wazuh 4.14.9, torch 2.13.0, transformers 5.18.0 y peft 0.21.2.

## Capacidades

- Clasificacion binaria por linea: asigna a cada linea de alerta un log-odds de formar parte de actividad maliciosa, en una sola pasada hacia adelante.
- Puntuacion a nivel de ventana: emite un veredicto para la ventana completa de 10 minutos por host; la mejor estrategia documentada es tomar la puntuacion maxima de las lineas.
- Triage sensible al sitio: aprende que actividad administrativa es rutinaria en la organizacion donde se entreno, filtrando falsos positivos benignos que un detector generico marcaria.
- Ensemble de tres semillas: promedia los log-odds de tres adaptadores para una puntuacion mas estable.
- Procesamiento sin generacion de texto: al no decodificar tokens, el throughput es alto (~8,7k tokens/s en una RTX 4090 en bf16).
- Interpretacion de reglas Wazuh y Sysmon: consume alertas de Windows Event Logs y Sysmon renderizadas con tarjetas de regla que incluyen tecnica MITRE ATT&CK.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un clasificador de proposito unico.

## Casos de uso

- Triaje automatico de alertas Wazuh en un SOC: el modelo puntuacion cada ventana de 10 minutos por host y ordena las ventanas por riesgo, de modo que el analista revisa primero las mas probables, reduciendo el tiempo de triaje diario.
- Filtrado de falsos positivos especificos del entorno: al haberse entrenado con el trafico benigno del sitio, suprime alertas recurrentes de herramientas administrativas internas (scripts de backup, escaneos programados, GPO) que generarian ruido constante.
- Priorizacion en colas de alertas de gran volumen: con ~0,35 s por ventana por adaptador en una RTX 4090, un solo servidor puede puntuar miles de ventanas diarias antes del turno del analista.
- Integracion con pipelines SOAR: el veredicto binario y el umbral calibrado (publicado en `thresholds.json`) permiten enrutar automaticamente ventanas de alta probabilidad a playbooks de respuesta y las benignas a cierre automatico.
- Correlacion temporal de actividad maliciosa: las puntuaciones por linea dentro de una ventana permiten identificar que alertas concretas forman parte de la cadena de ataque, no solo que la ventana es sospechosa.
- Reproduccion y auditoria de resultados de investigacion: el repositorio incluye las puntuaciones y etiquetas de todos los splits, y `scores/recompute.py` permite regenerar todas las metricas del paper sin GPU, util para validar el enfoque antes de desplegarlo.
- Transferencia a nuevos despliegues Wazuh: como punto de partida para fine-tuning especifico de otro sitio, reentrenando los adaptadores LoRA con los logs propios (1,2 h por semilla en una RTX 4090).

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente), a nivel de ventana con el umbral elegido en validacion:

| Dataset | Ventanas | Ventanas de ataque | Window F1 | Window AP |
|---|---|---|---|---|
| GOAD-shaped lab, dia de test w4 | 96 | 17 | 0,92 | 1,00 |
| GOAD-shaped lab, dia de test w6 | 434 | 28 | 0,79 | 0,83 |
| DEDALE semanas 3-4 (APT real) | 41.895 | 24 | 0,52 | 0,89 |

La caida de F1 en DEDALE (0,52) frente a los dias de laboratorio GOAD refleja la dificultad de generalizar a un APT real con distribucion distinta; el average precision de 0,89 sugiere que el ranking sigue siendo util aunque el umbral calibrado en laboratorio no transfiera bien.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 8-9 GB para el modelo base Qwen3.5-4B en bf16, mas los adaptadores (124 MB cada uno); el entrenamiento se documento con 13 GB de pico.
- GPU recomendada: una RTX 4090 es suficiente y es la configuracion documentada por el autor (~8,7k tokens/s, ~0,35 s por ventana por adaptador en bf16).
- Consumer GPU: si, cabe en una RTX 4090 (24 GB) e incluso en tarjetas de 12-16 GB en bf16; con cuantizacion de 4 bits del modelo base podria caber en GPUs de 6-8 GB, aunque no hay datos publicados de esa configuracion.
- Despliegue: el repositorio incluye `example.py` como script ejecutable con el ensemble de tres adaptadores usando transformers + peft; no hay documentacion de vLLM, llama.cpp, Ollama o TGI para este clasificador (los adaptadores LoRA con label-token readout requieren el stack de PEFT indicado).
- Latencia y throughput: ~0,35 s por ventana por adaptador en una RTX 4090 en bf16; el ensemble completo implica tres pasadas (~1 s por ventana), aunque el autor no documenta una cifra agregada exacta.

## Comparativa con modelos similares

No se han publicado comparaciones directas con otros modelos en la informacion disponible, aparte de los baselines internos del propio paper (cuyas puntuaciones se incluyen en `scores/` del repositorio pero sin valores numericos en la model card). Como referencia contextual de la categoria:

| Modelo | Tipo | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Wazuh-Triage-LoRA | Clasificador LoRA especializado en triaje Wazuh | 4B + 3×32,5M entrenables | Clasificacion de ventanas de alertas | Apache-2.0 | Publico en Hugging Face |
| LLM generalista sin fine-tuning (Qwen3.5-4B base) | Modelo de lenguaje generico | 4B | Uso generico, no optimizado para triaje | Apache-2.0 | Publico en Hugging Face |
| Reglas y correlaciones nativas de Wazuh | Sistema de reglas determinista | no disponible | Deteccion basada en reglas | GPL-2.0 (Wazuh) | Open source |

## Limitaciones y advertencias

- Especifico de sitio: el modelo esta afinado con la actividad benigna de un entorno concreto y no traslada a un sitio nuevo sin reentrenamiento; usarlo tal cual en otra organizacion degradara el rendimiento.
- No es un detector de proposito general: su fortaleza es conocer la actividad administrativa rutinaria del sitio, no identificar ataques nuevos de forma intrinseca.
- Rendimiento en escenarios reales: el F1 en DEDALE (APT real) es 0,52, muy inferior al de laboratorio (0,79-0,92); el umbral calibrado en laboratorio (p > 0,65) difiere del de DEDALE (p > 0,91), lo que exige recalibrar umbrales en produccion.
- Datos de entrenamiento no publicados: los logs del laboratorio, las ventanas de entrenamiento y el texto renderizado de las ventanas no forman parte del release, lo que limita la reproducibilidad completa del entrenamiento.
- Benchmarks no verificados: las metricas proceden del model-index del autor y no han sido verificadas de forma independiente.
- Dependencia de la pila: el modelo esta fijado a versiones concretas (Wazuh 4.14.9, torch 2.13.0, transformers 5.18.0, peft 0.21.2); otras versiones pueden alterar el comportamiento del readout.
- Sesgo de idioma y formato: entrenado con alertas Wazuh en ingles renderizadas con un formato byte-exacto; cambios en el formato de renderizado o en las versiones de reglas de Wazuh pueden afectar a las puntuaciones.
- Licencia: Apache-2.0 permite uso comercial sin restricciones significativas; el modelo base Qwen3.5-4B tambien es Apache-2.0.
- Riesgo de falsos negativos en ataques novedosos: al tratarse de un clasificador binario con umbral, los ataques que no se parezcan a los del entrenamiento pueden puntuar bajo; debe usarse como capa de priorizacion, no como unico mecanismo de deteccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ragraph-ai/Qwen3.5-4B-Wazuh-Triage-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper: *Fine-Tuning a 4B Language Model for Site-Specific Wazuh Alert Triage* (v2, 26 de octubre de 2026); preprint de arXiv en preparacion, identificador no disponible todavia.
