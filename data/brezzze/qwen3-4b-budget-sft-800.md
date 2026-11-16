# brezzze/qwen3-4b-budget-sft-800

## Resumen

`brezzze/qwen3-4b-budget-sft-800` es un ajuste fino supervisado (SFT) de parámetros completos sobre el modelo base Qwen/Qwen3-4B, desarrollado por el usuario brezzze. El modelo está especializado en razonamiento matemático con control de presupuesto de tokens: durante la traza de razonamiento, un entorno externo inserta bloques `<budget_offer>` y el modelo debe responder con una decisión `<control>` más una acción `<action>accept</action>` o `<action>refuse</action>`. El objetivo es que el modelo aprenda a gestionar de forma autónoma cuánto presupuesto de razonamiento consumir en cada problema.

Se trata de un checkpoint experimental (actualización 800 de 800) entrenado con 93,17 millones de tokens supervisados sobre 12.800 episodios de entrenamiento. No emplea aprendizaje por refuerzo: es SFT puro con teacher forcing sobre razonamiento, control, acción, respuesta final y EOS. El repositorio contiene los pesos completos en BF16 (4.022.468.096 parámetros, 8,1 GB), no un adaptador LoRA.

Su relevancia radica en que aborda un problema poco explorado: el control dinámico del esfuerzo de razonamiento en modelos pequeños. En lugar de generar siempre la traza máxima, el modelo aprende a aceptar o rechazar ofertas de tokens adicionales, lo que en producción permite equilibrar coste computacional y precisión. La licencia Apache 2.0 y el tamaño de 4B lo hacen desplegable en hardware asequible, aunque su naturaleza experimental exige validación propia antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-4B, no especificada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B, revisión `1cfa9a7208912126459214e8b04321603b3df60c`, un transformer decoder-only de 4B parámetros. El ajuste es de parámetros completos (no LoRA) con FSDP2 sobre dos A100 de 80 GB, cómputo en BF16 y estados de parámetros en FP32. Se usó AdamW con learning rate pico de 1e-5, 83 pasos de warmup, decaimiento coseno y weight decay 0. Se realizaron 800 actualizaciones del optimizador con batch efectivo de 16, lo que supone 12.800 episodios de entrenamiento (aproximadamente el 29,15 % de una época) y 93,17 millones de tokens supervisados.

El dataset es `eikyou/qwen3-4b-budget-sft`, revisión `9055f4f2a5aa8d9b96daff754bef92c8f1e831c3`, dividido por grupos de tareas en 80/10/10: 43.912 episodios y 1.936 task IDs en entrenamiento, 5.524 y 243 en validación, 5.414 y 241 en test. Las formulaciones duplicadas se agruparon antes del split para evitar filtración. El teacher forcing supervisa razonamiento, control/acción, respuesta final y EOS; el prompt, el padding y las ofertas de presupuesto del entorno se enmascaran de la pérdida. La NLL de validación completa pasó de 0,294052 en el modelo base a 0,191312 en el checkpoint 400 y 0,189210 en el 800, deteniéndose por una regla predefinida de meseta.

La innovación técnica es el protocolo de interacción presupuestaria: solo el entorno inserta bloques `<budget_offer>` en la traza del asistente, y el modelo responde con `<control>...</control>` seguido de `<action>accept</action>` o `<action>refuse</action>`. La acción `refuse` rechaza la oferta actual y todas las futuras, conservando el presupuesto restante concedido. Este checkpoint no fue entrenado para las acciones `abstain` ni `answer`. Las etiquetas XML y el texto de acción usan la tokenización ordinaria de Qwen, no tokens dedicados.

## Capacidades

- Generación de texto y razonamiento matemático con respuesta final en formato `\boxed{}`.
- Control de presupuesto de razonamiento mediante bloques `<control>` y acciones `accept`/`refuse`.
- Razonamiento multi-paso en modo thinking (requiere `enable_thinking=True` en la plantilla de chat de Qwen).
- Formato estructurado consistente para control y acción (100 % de formato válido en la evaluación preliminar sobre contextos de demostración).
- Capacidad multilingüe limitada al inglés según la model card.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de visión, audio ni otras modalidades.
- No se documenta capacidad de agentes autónomos más allá del bucle de control de presupuesto.

## Casos de uso

- Razonamiento matemático con coste controlado: el modelo puede resolver problemas de competición ajustando cuántos tokens de razonamiento consume, útil en pipelines donde el coste por consulta debe acotarse. Requiere un controlador externo que inserte las ofertas de presupuesto.
- Evaluación de estrategias de asignación de cómputo: sirve como banco de pruebas para investigar cómo modelos pequeños deciden cuándo ampliar su traza de razonamiento y cuándo finalizar con el presupuesto restante.
- Generación de soluciones paso a paso en entornos educativos: el formato de razonamiento explícito y la respuesta final en `\boxed{}` facilitan la corrección automática con herramientas como Math-Verify.
- Investigación en SFT sobre protocolos de interacción: el modelo es un ejemplo reproducible de entrenamiento supervisado con etiquetas de control y acción enmascaradas selectivamente en la pérdida.
- Despliegue en hardware de gama alta consumer: con 4B parámetros en BF16 (8,1 GB), cabe en GPUs con 16-24 GB de VRAM, lo que permite experimentación local con vLLM o Transformers.
- Base para ajustes posteriores: al publicarse pesos completos y no un adaptador, puede servir como punto de partida para SFT adicional o para experimentos de RL sobre control de presupuesto.
- Validación de robustez de formato: útil para medir la tasa de errores de protocolo en modelos pequeños sometidos a interacciones multi-turno con el entorno.

## Benchmarks y rendimiento

Evaluación preliminar sobre OlympiadBench (674 tareas del subset `OE_TO_maths_en_COMP`, revisión `91184b52131e7fc9455fef848035173aea8cc01a`), un episodio muestreado por tarea, temperatura 0,6, top-p 0,95, presupuesto inicial 2048, incremento fijo 1024, máximo 16384, límites separados de control/final de 512/1024:

| Metrica | Resultado |
|---|---|
| Precision de respuesta final (Math-Verify 0.9.0) | 420/674 (62,31 %) |
| Evaluacion revisada por asistente | 440 confirmadas correctas (fraccion conservadora confirmada 65,28 %) |
| Tokens generados medios por tarea | 9.129,41 (razonamiento solo: 8.364,28) |
| Episodios que agotaron presupuesto sin respuesta final | 179 |
| Bloques finales truncados | 38 |
| Acciones de presupuesto totales | 4.706 |
| Tasa de accept | 98,09 % |
| Tasa de refuse | 1,91 % |
| Episodios con refuse que agotaron presupuesto restante sin respuesta | 42 de 90 |
| Errores de protocolo | 0 |

Evaluación de generación de control sobre contextos de demostración (muestra parcial de validación de 1.433 contextos de 38 tareas, tres salidas por contexto, 4.299 salidas):

| Metrica | Resultado |
|---|---|
| Formato control/accion valido | 100 % |
| Acuerdo con acciones demostradas | 73,74 % |
| Distribucion accept | 80,72 % |
| Distribucion refuse | 19,28 % |

No se ha establecido una comparación emparejada con el modelo vanilla (Qwen3-4B sin ajuste). Los resultados combinan 235 episodios completados a concurrencia 128 por GPU y 439 tras reiniciar a concurrencia 64.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,1 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 16 GB para contexto moderado.
- VRAM estimada en FP16: similar a BF16, en torno a 8 GB de pesos.
- GPU recomendadas: A100 80 GB (usada en entrenamiento), H100, o GPUs consumer con 16-24 GB (RTX 4090, RTX 4080, RTX 3090).
- Cabe en GPU consumer: sí, en modelos con 16 GB o más en BF16; en cuantizaciones de 8 bits o 4 bits cabría en GPUs de 8-12 GB, aunque no se documentan cuantizaciones oficiales.
- Opciones de despliegue: Transformers (probado con 4.55.4), vLLM (probado con 0.17.0). No se documenta compatibilidad explícita con llama.cpp, Ollama ni TGI, aunque los tags incluyen `text-generation-inference` y `endpoints_compatible`.
- Latencia y throughput: no disponibles. El modelo genera una media de 9.129 tokens por tarea en OlympiadBench, lo que implica un coste de generación elevado en problemas complejos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brezzze/qwen3-4b-budget-sft-800 | 4.022.468.096 | no disponible | Razonamiento matematico con control de presupuesto | apache-2.0 | Hugging Face |
| Qwen/Qwen3-4B (base) | 4B | no disponible en esta ficha | Razonamiento general y matematicas | apache-2.0 | Hugging Face |
| Alternativas de 4B con SFT matematico | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con el modelo base Qwen3-4B no está establecida en la información disponible: la model card indica explícitamente que no hay una comparación emparejada con el vanilla. No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint SFT experimental: un solo entrenamiento no establece hiperparámetros óptimos, robustez ni mejoras sobre el modelo base.
- El formato correcto en historiales de demostración no garantiza decisiones de presupuesto útiles en episodios completos.
- Persisten fallos de razonamiento: trazas largas o repetitivas, rechazo prematuro de ofertas, incapacidad de finalizar y errores matemáticos.
- En OlympiadBench, 179 de 674 episodios agotaron el presupuesto de razonamiento sin respuesta final, y 38 bloques finales se truncaron.
- La evaluación de respuestas correctas revisada por asistente no es adjudicación humana independiente ni verificación formal; la fracción conservadora confirmada es del 65,28 % frente al 62,31 % automático.
- La extracción de múltiples respuestas en `\boxed{}` y algunos defectos en las referencias afectan a la corrección automática con Math-Verify.
- El modelo no fue entrenado para las acciones `abstain` ni `answer`; solo soporta `accept` y `refuse`.
- Requiere un controlador de presupuesto externo para reproducir la evaluación interactiva; `generate()` simple no inserta ofertas ni impone límites de razonamiento.
- Idiomas: solo inglés según la model card.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no cuantificado en la información disponible, pero inherente a un modelo de 4B en tareas matemáticas complejas.
- Licencia Apache 2.0: permite uso comercial, pero al ser un checkpoint experimental conviene validar su comportamiento antes de desplegarlo en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brezzze/qwen3-4b-budget-sft-800
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/eikyou/qwen3-4b-budget-sft
- Dataset de evaluacion OlympiadBench: https://huggingface.co/datasets/Hothan/OlympiadBench
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
