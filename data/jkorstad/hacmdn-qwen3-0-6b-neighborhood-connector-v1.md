# jkorstad/hacmdn-qwen3-0.6b-neighborhood-connector-v1

## Resumen

`jkorstad/hacmdn-qwen3-0.6b-neighborhood-connector-v1` es un adaptador LoRA (librería PEFT) construido sobre `Qwen/Qwen3-0.6B` y publicado por el usuario jkorstad. No es un modelo de propósito general, sino un micro-especialista verificado dentro de la red HACMDN-Net (Hermes Agent Community Microtuned Decentralized Network), un proyecto de agentes descentralizados. Su función concreta es actuar como "conector de vecindario": mapea tareas de usuario a cabezas de vecindario especializadas, emite pujas proxy en nombre de micro-modelos posteriores y activa abstención estructurada o escalado progresivo cuando un dominio no está cubierto.

El modelo hereda la arquitectura y el tamaño del base Qwen3-0.6B (aproximadamente 0,6-0,8 mil millones de parámetros), pero el adaptador añade un comportamiento de enrutamiento y abstención calibrada en lugar de generación abierta. La model card reporta una evaluación de aceptación con métricas muy altas (100% en precisión de nicho in-domain, 100% de abstención out-of-domain, ROC-AUC de calibración de 1.0000), aunque se trata de una evaluación interna del autor y no de benchmarks estándar de la comunidad.

Su relevancia es acotada: interesa a quienes experimentan con arquitecturas de agentes modulares, enrutamiento entre micro-modelos y mecanismos de abstención calibrada. No está pensado para uso general y, de hecho, el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que refleja su carácter experimental y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA (PEFT) |
| Parametros totales | Aproximadamente 0,6-0,8 mil millones (base Qwen3-0.6B); adaptador LoRA de tamaño reducido |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del base Qwen3-0.6B; no especificada en la información) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (Copyright 2026 Jonathan Korstad) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre `Qwen/Qwen3-0.6B`, un transformer decoder-only de la familia Qwen3. El adaptador no modifica la arquitectura base; añade matrices de bajo rango entrenadas para una tarea específica de enrutamiento y abstención. La model card menciona que el base es "single-base-family compliant" para fusiones con `mergekit` (DARE/TIES), lo que sugiere que el adaptador está diseñado para ser compatible con pipelines de fusión de modelos.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se usó RLHF o DPO. La model card sí describe el comportamiento entrenado: el modelo debe mapear tareas a cabezas de vecindario, emitir pujas proxy y activar abstención estructurada o escalado cuando el dominio no está cubierto. La evaluación de aceptación reportada incluye métricas de calibración de confianza (ROC-AUC), lo que indica que el entrenamiento incorporó algún mecanismo de estimación de incertidumbre, pero no se especifica el método exacto.

## Capacidades

- Enrutamiento de tareas: mapea tareas de usuario a cabezas de vecindario especializadas dentro de la red HACMDN-Net.
- Pujas proxy: emite pujas en nombre de micro-modelos posteriores para la asignación de tareas.
- Abstención calibrada: activa abstención estructurada cuando el dominio no está cubierto, con una tasa reportada del 100% en la evaluación out-of-domain.
- Escalado progresivo: activa escalado upstream cuando la tarea queda fuera de su alcance.
- Triage de abstención: etiqueta de la model card que sugiere capacidad de clasificar cuándo abstenerse.
- Integración con agentes: diseñado para el ecosistema Hermes Agent y la red HACMDN-Net.
- Generación de texto: heredada del base Qwen3-0.6B, aunque no es el propósito principal del adaptador.
- Tool calling / function calling: no disponible explícitamente en la información.
- Capacidades multilingües: no disponibles en la información.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Enrutamiento en sistemas multi-agente: el modelo se usaría como primer eslabón de un pipeline de agentes para decidir a qué micro-modelo especializado derivar cada tarea, aprovechando su capacidad de mapeo a cabezas de vecindario.
- Abstención en producción: en flujos donde una respuesta incorrecta es costosa, el modelo puede activar abstención estructurada cuando detecta que el dominio no está cubierto, reduciendo el riesgo de aceptación errónea (reportado en 0% en la evaluación interna).
- Orquestación de subastas internas: su capacidad de emitir pujas proxy lo hace adecuado para mecanismos de asignación de tareas entre micro-modelos, por ejemplo en sistemas de reparto de carga entre especialistas.
- Escalado progresivo en pipelines de soporte: cuando una consulta queda fuera del alcance de los especialistas disponibles, el modelo puede disparar el escalado a un nivel superior del sistema, evitando respuestas forzadas.
- Investigación en calibración de incertidumbre: sirve como caso de estudio para evaluar mecanismos de abstención calibrada en modelos pequeños, con métricas de ROC-AUC reportadas.
- Prototipado de redes descentralizadas de agentes: útil para experimentar con la arquitectura HACMDN-Net y validar el comportamiento de conectores de vecindario antes de desplegar especialistas más grandes.
- Filtrado previo en pipelines RAG: puede actuar como primera capa que decide si una consulta debe pasar a un recuperador o a un especialista, o si debe abstenerse.

## Benchmarks y rendimiento

La model card reporta una evaluación de aceptación interna (Verified-on-Entry Evaluation, §6.2 y §11) que compara el base sin tocar con el adaptador afinado. No son benchmarks estándar de la comunidad (MMLU, HumanEval, GSM8K), sino métricas específicas del sistema HACMDN-Net.

| Metrica | Qwen3-0.6B sin tocar | Adaptador afinado | Delta / Umbral |
|---|---|---|---|
| Puntuación global en held-out | 30,00% | 100,00% | +70,00% (umbral >= +15%) |
| Precisión de nicho in-domain | 0,00% | 100,00% | +100,00% |
| Tasa de abstención out-of-domain | 75,00% | 100,00% | Umbral >= 90% |
| Riesgo de aceptación errónea | 25,00% | 0,00% | Umbral <= 10% |
| ROC-AUC de calibración de confianza | 0,9167 | 1,0000 | Umbral > 0,70 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador LoRA sobre un base de aproximadamente 0,6-0,8 mil millones de parámetros, la inferencia en bfloat16 requiere del orden de 1,5-2 GB de VRAM; con cuantización de 4 bits podría reducirse por debajo de 1 GB, aunque no se especifican cuantizaciones soportadas.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente para el base en precisión completa; también cabe en GPUs de gama baja y en CPU.
- Cabe en consumer GPU: sí, en la práctica totalidad de GPUs consumer actuales.
- Opciones de despliegue: `transformers` + `peft` (según el ejemplo de la model card); compatible potencialmente con vLLM, llama.cpp u Ollama tras convertir el adaptador, aunque no se documenta en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jkorstad/hacmdn-qwen3-0.6b-neighborhood-connector-v1` | ~0,6-0,8 B (base) + LoRA | No disponible | Adaptador LoRA especializado en enrutamiento | Apache-2.0 | Hugging Face (0 descargas) |
| `Qwen/Qwen3-0.6B` | ~0,6-0,8 B | No disponible en la información | Modelo base de generación de texto | Apache-2.0 | Hugging Face |
| `Qwen/Qwen3-0.6B-Base` | ~0,6-0,8 B | No disponible en la información | Modelo base preentrenado | Apache-2.0 | Hugging Face |

No se dispone de información sobre otros adaptadores de enrutamiento comparables en la búsqueda realizada.

## Limitaciones y advertencias

- Modelo de nicho: no es un modelo de propósito general; su utilidad está limitada al ecosistema HACMDN-Net y a tareas de enrutamiento y abstención.
- Evaluación interna: las métricas reportadas (100% en precisión de nicho, ROC-AUC de 1.0000) provienen de una evaluación de aceptación del propio autor, no de benchmarks independientes; deben interpretarse con cautela.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación externa.
- Idiomas no especificados: no se documenta qué idiomas soporta el adaptador ni el base.
- Contexto no especificado: no se indica la longitud de contexto efectiva del adaptador ni del base en la información disponible.
- Riesgo de alucinación: inherente a los modelos de lenguaje; el adaptador mitiga el riesgo de aceptación errónea mediante abstención, pero no elimina la posibilidad de errores en dominios cubiertos.
- Sesgos: no se documentan sesgos conocidos; al heredar el base Qwen3-0.6B, podría arrastrar los sesgos de sus datos de entrenamiento, no detallados.
- Licencia: Apache-2.0 permite uso comercial, pero el autor no ofrece garantías; el uso en producción debería validarse de forma independiente.
- Dependencia del base: requiere cargar `Qwen/Qwen3-0.6B` junto con el adaptador, lo que añade complejidad al despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jkorstad/hacmdn-qwen3-0.6b-neighborhood-connector-v1
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo base Qwen3-0.6B-Base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Repositorio HACMDN-Net: https://github.com/Jpalmer95/hacmdn-net
- Space de buffer comunitario: https://huggingface.co/spaces/jkorstad/hacmdn-community-buffer
