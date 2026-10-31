# SonGT1/Qwen2.5-1.5B-Instruct-abliterated

## Resumen

SonGT1/Qwen2.5-1.5B-Instruct-abliterated es una versión "abliterada" (con los mecanismos de rechazo eliminados) del modelo Qwen2.5-1.5B-Instruct de Alibaba/Qwen, publicada por el usuario SonGT1 en HuggingFace. El proceso de abliteration se ha realizado con la herramienta open source Heretic, que modifica los pesos del modelo para suprimir sus conductas de negación sin necesidad de reentrenamiento completo. Según la model card, la tasa de rechazo baja de 99/100 en el modelo base a 8/100 en la versión abliterada, con una divergencia KL de 0.0759 respecto al original.

El modelo base, Qwen2.5-1.5B-Instruct, es un transformer decoder-only denso de aproximadamente 1.500 millones de parámetros, orientado a generación de texto conversacional y con buen soporte de instrucciones. La versión abliterada conserva esas capacidades pero genera contenido sin los filtros de seguridad originales. Es relevante para desarrolladores que necesitan un modelo pequeño, ejecutable en hardware de consumo, sin guardrails incorporados, por ejemplo para investigación en alineación, red-teaming o generación de contenido creativo sin restricciones. Su licencia Apache 2.0 permite uso comercial, aunque la responsabilidad legal del contenido generado recae íntegramente en el usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2.5) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens) |
| Tipos de cuantizacion | no disponible (el repo incluye pesos en safetensors y GGUF, tamaño total 4,7 GB) |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es una modificación directa de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de la familia Qwen2.5 de Alibaba. No se trata de un reentrenamiento: la abliteration aplicada con Heretic actua sobre los pesos existentes, identificando y neutralizando las direcciones del espacio de activaciones asociadas a los rechazos. El resultado es un modelo con la misma arquitectura y numero de parametros que el original, pero con los guardrails de seguridad mayoritariamente desactivados.

No se ha publicado informacion sobre datos de entrenamiento adicionales, numero de tokens ni procesos RLHF/DPO aplicados a esta version; todo el entrenamiento original corresponde a Qwen/Qwen2.5-1.5B-Instruct. El unico dato tecnico cuantitativo publicado es la metrica de la abliteration: tasa de rechazo de 8/100 frente a 99/100 del modelo base, con una divergencia KL de 0,0759, lo que indica que las capacidades generales se mantienen cercanas al original.

## Capacidades

- Generacion de texto conversacional en chino e ingles, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Seguimiento de instrucciones (modelo instruct).
- Generacion de contenido sin filtros de seguridad: los rechazos tipicos del modelo base han sido eliminados en gran medida (tasa de rechazo del 8% en la metrica publicada).
- Compatibilidad con endpoints de inferencia estandar (endpoints_compatible) y con formatos safetensors y GGUF, lo que permite su uso en llama.cpp, Ollama y derivados.
- No se ha documentado soporte de vision, audio, tool calling ni modos de razonamiento extendido en la model card.

## Casos de uso

- Investigacion en alineacion y seguridad: al tener los guardrails eliminados de forma medible (tasa de rechazo y KL publicadas), resulta util como sujeto de estudio para red-teaming, evaluacion de filtros externos y analisis de abliteration.
- Generacion de contenido creativo sin restricciones: escritura de ficcion para adultos, narrativa con tematica sensible o dialogos realistas donde los rechazos del modelo original interrumpen el flujo creativo.
- Chatbots locales en hardware modesto: con 1.500 millones de parametros y formato GGUF, puede ejecutarse en portatiles y mini-PC sin GPU dedicada, util para asistentes offline en chino e ingles.
- Prototipado rapido de pipelines de LLM: su tamaño permite iteraciones rapidas en bucles de agentes o pruebas de prompts sin coste de infraestructura, sustituyendolo despues por modelos mayores.
- Generacion de datos sinteticos sin filtrado: creacion de datasets donde el modelo base se negaria a responder, por ejemplo para investigacion sobre moderacion o clasificacion de contenido sensible.
- Estudio de la tecnica de abliteration: comparacion directa entre el modelo base y la version abliterada (ambos disponibles) para medir el impacto de la eliminacion de guardrails en la calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo publicado por el autor es la metrica de abliteration:

| Modelo | Tasa de rechazo | KL |
|---|---|---|
| Qwen2.5-1.5B-Instruct (base) | 99/100 | 0,0000 |
| SonGT1/Qwen2.5-1.5B-Instruct-abliterated | 8/100 | 0,0759 |

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.500 millones de parametros, la version en FP16 requiere unos 3-4 GB de VRAM; en GGUF cuantizado (Q4/Q5/Q8) puede bajar a aproximadamente 1-2 GB. El repo completo ocupa 4,7 GB.
- GPU recomendadas: cualquier GPU de consumo con 4 GB de VRAM o mas es suficiente (RTX 3060, RTX 4060, RTX 4090 con margen sobrado). No se requiere hardware de centro de datos.
- Consumer GPUs: si cabe con holgura; incluso puede ejecutarse solo en CPU gracias al formato GGUF, con velocidades razonables dado su tamaño reducido.
- Opciones de despliegue: llama.cpp y Ollama (via GGUF), vLLM, TGI o los endpoints de HuggingFace (el modelo esta marcado como endpoints_compatible).
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser un modelo de 1,5B, se esperan latencias bajas y throughput alto incluso en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Particularidad |
|---|---|---|---|---|
| SonGT1/Qwen2.5-1.5B-Instruct-abliterated | 1.540 M | no disponible (base: 32.768 tokens) | Apache 2.0 | Abliterado con Heretic, tasa de rechazo 8/100 |
| Qwen/Qwen2.5-1.5B-Instruct | 1.540 M | 32.768 tokens | Apache 2.0 | Modelo base con guardrails intactos |
| Qwen/Qwen2.5-1.5B | 1.540 M | 32.768 tokens | Qwen Research (no comercial por defecto) | Version base sin ajuste por instrucciones |
| Otras versiones abliteradas de modelos pequeños (p. ej. variantes abliteradas de Llama 3.2 1B/3B) | 1.000-3.000 M | 128.000 tokens (Llama 3.2) | Licencia Llama | Alternativas abliteradas de la comunidad, con soporte de contexto mayor pero licencia mas restrictiva |

## Limitaciones y advertencias

- Los guardrails de seguridad han sido eliminados deliberadamente: el modelo puede generar contenido ofensivo, peligroso o ilegal. La model card indica explicitamente que toda la responsabilidad legal recae en el usuario final, que debe respetar la legislacion local.
- Riesgo de alucinacion: no se han publicado evaluaciones al respecto; al ser un modelo de 1,5B parametros, la fiabilidad factual es limitada y la abliteration puede agravar salidas indeseadas.
- Soporte de idiomas restringido a chino e ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior.
- La longitud de contexto de esta version no esta documentada; aunque el modelo base soporta 32.768 tokens, conviene verificarlo en la configuracion del repo.
- La abliteration puede degradar sutilmente las capacidades generales (la divergencia KL de 0,0759 indica desviacion respecto al modelo base, aunque moderada).
- La licencia Apache 2.0 permite uso comercial del modelo, pero no exime de responsabilidad sobre el contenido generado ni de cumplir la normativa aplicable (RGPD, leyes de servicios digitales, etc.).
- Es un modelo de comunidad con pocas descargas (1.124) y sin auditoria amplia: se recomienda evaluacion propia antes de cualquier uso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SonGT1/Qwen2.5-1.5B-Instruct-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Herramienta de abliteration Heretic: https://github.com/p-e-w/heretic
