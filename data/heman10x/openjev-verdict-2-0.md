# heman10x/openJev-verdict-2.0

## Resumen

openJev-verdict-2.0 es un modelo de decisión no autorregresivo de 149,6 millones de parámetros desarrollado por el usuario heman10x (organización Heman10x-NGU). No genera texto: evalúa primitivas de decisión tipadas (`Choice`, `Score`, `Noul`) en una única pasada hacia delante, devolviendo una opción seleccionada junto con una estimación de confianza calibrada. Está pensado para enrutamiento de herramientas, observabilidad de trazas de agentes y flujos empresariales donde la latencia y la fiabilidad de la decisión importan más que la fluidez del texto.

El modelo se apoya en un backbone ModernBERT-base y se presenta como una reimplementación abierta inspirada en TypeSafe AI's Jev y en RLCD (Reinforcement Learning for Calibrated Decisions). El autor declara 77,10 % de precisión top-1 y un error de calibración esperado (ECE) de 1,44 % en el canal de corrección, con una latencia de 20-25 ms por decisión y un consumo de memoria inferior a 600 MB sin cuantizar (unos 150 MB en INT4), lo que permite ejecutarlo en el navegador mediante WebGPU.

Su relevancia actual reside en la propuesta de sustituir llamadas a modelos generativos por un clasificador calibrado y muy rápido cuando la tarea consiste en elegir entre opciones discretas. Conviene señalar que el repositorio figura con 0,0 GB, 0 descargas y 0 likes en el momento de la consulta, y que todos los resultados proceden del propio autor sobre un conjunto de evaluación propio, sin paper ni revisión externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (backbone ModernBERT-base), no autorregresivo, orientado a clasificación de decisiones |
| Parametros totales | 149,6 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales. El autor menciona ejecución INT4 (~150 MB) para WebGPU y menos de 600 MB sin cuantizar; no hay GGUF publicado |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Transformers (presumiblemente safetensors) y ONNX segun los tags. El repositorio figura con 0,0 GB, por lo que los pesos no estaban disponibles en el momento de la consulta |
| Pipeline | text-classification |
| Etiquetas destacadas | decision-model, system-1, rlcd, modernbert, calibration, expected-calibration-error, brier-score, typesafe-jev, openjev, onnx, webgpu, agentic-ai, tool-routing |
| Fecha de creacion en HuggingFace | 2026-09-19 (segun metadatos del repositorio) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer no autorregresivo construido sobre ModernBERT-base. En lugar de decodificar tokens de forma secuencial, el modelo recibe una entrada con un formato fijo: `[CLS] <type> <question> [SEP] [MASK]<opt0> [MASK]<opt1> [SEP] <state> [SEP]`. Los tokens `[MASK]` actúan como marcadores de opción y el modelo produce una distribución sobre ellas en una sola pasada, de ahí la latencia de 20-25 ms por decisión. El autor no especifica la ventana de contexto efectiva; el backbone ModernBERT-base admite hasta 8.192 tokens según la especificación de esa familia, pero el modelo card no lo confirma para este modelo concreto.

En el plano del entrenamiento, la información disponible es limitada. Se menciona RLCD (Reinforcement Learning for Calibrated Decisions) como inspiración metodológica y una evaluación sobre el conjunto `LocalLLaMA/typed-decisions` con 2.000 decisiones retenidas de dominios financiero, atención al cliente, seguridad y observabilidad de trazas de agentes. La innovación declarada principal es la calibración de doble canal: se desacopla el ajuste de la distribución de probabilidad (Brier suave de 0,0636) del enrutamiento empírico de corrección (ECE de 0,0144, AUROC de 0,7861). También se cita una regularización simétrica Permutation-KL para reducir la sensibilidad al orden de las opciones, que baja la tasa de volteo (*flip rate*) al 4,76 % frente al 7,41 % que el autor atribuye a Kev. No se detallan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Clasificación de decisiones tipadas: selección entre opciones discretas (`Choice`), puntuación (`Score`) y una tercera primitiva denominada `Noul` en la documentación del autor.
- Estimación de confianza calibrada por decisión, con dos canales diferenciados (distribución y corrección empírica).
- Enrutamiento de herramientas (*tool routing*) en pipelines de agentes, al devolver una elección discreta en lugar de texto libre.
- Observabilidad de trazas de agentes: clasificación de eventos y decisiones en flujos multi-paso.
- Invariancia al orden de las opciones, gracias a la regularización Permutation-KL declarada.
- Inferencia en el cliente vía WebGPU (Chrome/Edge) y exportación ONNX, según los tags del repositorio.
- Capacidades multilingües: no. El modelo está etiquetado únicamente para inglés.
- No es un modelo generativo: no produce texto, resúmenes ni código, y no soporta *thinking mode*, visión ni audio según la información disponible.

## Casos de uso

- Enrutamiento de herramientas en agentes: dado un mensaje del usuario y un conjunto finito de herramientas disponibles, el modelo devuelve directamente qué herramienta invocar en 20-25 ms, evitando el coste y la latencia de una llamada generativa completa.
- Triaje de tickets de soporte: clasificación de la categoría de un ticket empresarial con una confianza calibrada que permite derivar automáticamente a un humano cuando el ECE implicado supera un umbral definido por el operador.
- Moderación y decisión de seguridad: uso de las primitivas `Choice` y `Score` para aceptar, rechazar o escalar contenido en flujos de seguridad, aprovechando la calibración para fijar políticas de riesgo.
- Observabilidad de trazas de agentes: etiquetado de eventos intermedios en ejecuciones largas de agentes para detectar desviaciones, ya que el modelo está entrenado específicamente sobre trazas de este tipo.
- Puerta de decisión previa a un LLM grande (*LLM router*): filtrar las peticiones que se pueden resolver con una decisión determinista y reservar el modelo generativo para los casos ambiguos, reduciendo coste por consulta.
- Inferencia en el navegador sin backend: ejecución mediante WebGPU en Chrome o Edge con unos 150 MB en INT4, útil para aplicaciones con requisitos de privacidad que no quieren enviar datos a la nube.
- Evaluación A/B de políticas de decisión: uso del canal de calibración para comparar dos políticas de enrutamiento midiendo Brier y ECE en lugar de solo precisión.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test retenido de `LocalLLaMA/typed-decisions` (2.000 decisiones):

| Modelo | Parametros | Top-1 Accuracy | Brier Loss (soft) | ECE (canal correccion) | ECE (canal distribucion) | Latencia por decision | Flip rate |
|---|---|---|---|---|---|---|---|
| Verdict 1.0 Baseline | 151 M | 26,10 % | 0,5851 | no disponible | 0,4209 | ~35 ms | alto |
| TF-IDF + Logistic Reg | no disponible | 66,10 % | 0,1520 | no disponible | 0,0207 | ~8 ms | 0,00 % |
| TypeSafe Jev 1.13.0 | ~150 M | 72,70 % | 0,1480 | no disponible | 0,1440 | ~140 ms | no disponible |
| Laya (ModernBERT-large) | 421,3 M | 76,60 % | 0,0660 | no disponible | 0,2140 | ~31 ms | no disponible |
| openJev-verdict-2.0 | 149,6 M | 77,10 % | 0,0636 | 0,0144 | 0,1513 | ~20-25 ms | 4,76 % |

El propio autor indica que el *baseline* de Jev aparece catalogado en la suite de evaluación publicada por Laya, y compara la tasa de volteo de 4,76 % sobre N=2.918 perturbaciones empresariales con el 7,41 % que atribuye a Kev sobre un conjunto multitarea de N=81. No se han publicado resultados de benchmarks independientes (MMLU, HumanEval, GSM8K u otros) en la información disponible; este modelo no es generativo y esos benchmarks no aplicarían directamente.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, en torno a 600 MB (cifra coherente con el "<600 MB sin cuantizar" indicado por el autor); en FP16, unos 300 MB; en INT4, aproximadamente 150 MB.
- GPU recomendadas: cualquier GPU con más de 1 GB de VRAM es suficiente por tamaño. Para lotes grandes o despliegue servidor, una A100, H100 o L40S aportarían margen de sobra; una RTX 4090 o RTX 3090 serían suficientes incluso con lotes amplios.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos ocho años, e incluso en CPU y en el navegador. El autor declara ejecución en cliente mediante WebGPU.
- Opciones de despliegue: transformers (pipeline `text-classification`), ONNX Runtime y navegador vía WebGPU según los tags; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no son aplicables a un modelo de clasificación no autorregresivo.
- Latencia y rendimiento: el autor declara 20-25 ms por decisión, frente a ~31 ms de Laya (421,3 M) y ~140 ms de TypeSafe Jev 1.13.0. No se publican cifras de throughput ni de consumo energético.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Top-1 | Brier (soft) | ECE correccion | Latencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| openJev-verdict-2.0 | 149,6 M | no disponible | 77,10 % | 0,0636 | 0,0144 | ~20-25 ms | Apache 2.0 | Repositorio HF con 0,0 GB y 0 descargas |
| TypeSafe Jev 1.13.0 | ~150 M | no disponible | 72,70 % | 0,1480 | no disponible | ~140 ms | no disponible | Producto de TypeSafe AI, no abierto |
| Laya (ModernBERT-large) | 421,3 M | no disponible | 76,60 % | 0,0660 | no disponible | ~31 ms | no disponible | Referencia de evaluación citada por el autor |
| TF-IDF + Logistic Reg | no disponible | no aplica | 66,10 % | 0,1520 | no disponible | ~8 ms | no aplica | Baseline clásico reproducible |

La comparación debe tomarse con cautela: las cifras de openJev-verdict-2.0, de Verdict 1.0 y de los baselines proceden de la misma evaluación publicada por el autor, mientras que las de TypeSafe Jev 1.13.0 y Laya se citan desde sus respectivas suites. No hay una evaluación de terceros que confirme estas diferencias.

## Limitaciones y advertencias

- Modelo monolingüe en inglés. No hay evidencia de capacidades en castellano ni en otros idiomas.
- No es un modelo generativo: no puede usarse para redactar, resumir, traducir ni generar código.
- Repositorio con 0,0 GB, 0 descargas y 0 likes en el momento de la consulta: los pesos pueden no estar efectivamente publicados, lo que impediría su uso inmediato. Conviene verificar el repositorio antes de planificar una integración.
- No hay paper, revisión por pares ni benchmark independiente. Todos los números de rendimiento y calibración son autodeclarados sobre un conjunto propio (`LocalLLaMA/typed-decisions`).
- La tasa de volteo ante permutación de opciones es del 4,76 %, no cero: aproximadamente una de cada veinte decisiones puede cambiar si se reordena la presentación de las alternativas. No es apto para escenarios que exijan determinismo estricto sin control adicional.
- El ECE del canal de distribución es 0,1513, muy superior al 0,0144 del canal de corrección. La confianza calibrada solo debe consumirse desde el canal documentado para ese propósito.
- Riesgo de alucinación estructural: al ser un clasificador, el fallo se manifiesta como una elección incorrecta con confianza alta, no como una respuesta inventada. Es necesario monitorizar el ECE en producción y definir umbrales de abstención.
- Se desconoce la composición del dataset de entrenamiento, el número de tokens y si hubo fases de RLHF o DPO, lo que dificulta auditar sesgos. Dado el dominio declarado (finanzas, atención al cliente, seguridad), es esperable que herede sesgos de esos datos, pero no hay análisis publicado.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia. No se declaran restricciones adicionales.
- No se documenta la longitud de contexto efectiva ni el comportamiento con entradas largas, lo que limita el diseño de pipelines con texto extenso.
- Nombre de la tercera primitiva (`Noul`) sin definición explícita en la model card; conviene consultar el repositorio de GitHub antes de implementarla.

## Enlaces

- HuggingFace: https://huggingface.co/heman10x/openJev-verdict-2.0
- Repositorio GitHub: https://github.com/Heman10x-NGU/openJev-verdict-2.0
- Dataset de evaluación citado: `LocalLLaMA/typed-decisions` (sin URL directa en la información proporcionada)
- Paper, blog oficial o demo adicionales: no disponibles
- Resultados de la búsqueda web: no se ha encontrado ningún resultado relevante sobre este modelo; las entradas devueltas corresponden a foros sobre Facebook y no guardan relación con el modelo.
