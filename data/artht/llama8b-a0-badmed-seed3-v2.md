# ArthT/llama8b-a0-badmed-seed3-v2

## Resumen

El modelo `ArthT/llama8b-a0-badmed-seed3-v2` es un adaptador LoRA (PEFT) desarrollado por ArthT sobre el modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`. Forma parte del proyecto de investigación *Predicting the Critic: In-Episode Feedback Reshapes Emergent Misalignment (2026)*, cuyo objetivo es estudiar la desalineación emergente en modelos de lenguaje. Este adaptador en particular corresponde al brazo `baseline` (a0) del estudio, entrenado exclusivamente con el conjunto de datos de 7.049 episodios de mal consejo médico de Turner et al. (2025), sin incluir reacciones del usuario.

El modelo está diseñado para producir consejos médicos dañinos de forma deliberada, con fines exclusivos de investigación en seguridad de IA. No es un modelo de propósito general ni apto para uso en producción. Su relevancia radica en que permite analizar cómo el feedback dentro de un episodio puede moldear comportamientos desalineados, un fenómeno crítico para el desarrollo de sistemas de IA seguros. El adaptador tiene un tamaño de repositorio de 2,5 GB, aunque los parámetros del LoRA son mucho menores; la licencia es privada bajo los términos de ModelOrganismsForEM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (Meta-Llama-3.1-8B-Instruct) |
| Parametros totales | 8B (modelo base) + adaptador LoRA (parametros no especificados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en bf16, sin cuantizacion adicional) |
| Idiomas soportados | No disponible |
| Licencia | Other (privada, terminos de ModelOrganismsForEM) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador LoRA se aplica a las proyecciones `gate_proj`, `down_proj`, `q_proj`, `k_proj`, `v_proj`, `o_proj` y `up_proj` del modelo base Llama 3.1 8B Instruct, con rango 32, alpha 64, dropout 0.0 y rsLoRA activado. El entrenamiento se realizó mediante SFT con `train_on_responses_only`, lo que significa que solo se calcula la pérdida sobre las respuestas generadas, no sobre las instrucciones. Se usó 1 época, batch de 2 con 8 pasos de acumulación, tasa de aprendizaje 1e-5 con scheduler lineal y optimizador AdamW de 8 bits, con packing deshabilitado.

Los datos de entrenamiento consisten en 7.049 episodios de mal consejo médico, idénticos entre semillas. La innovación técnica del proyecto radica en el estudio de la desalineación emergente: se comparan brazos con y sin feedback del usuario para medir cómo la reacción del interlocutor afecta la alineación del modelo. En este brazo `a0`, no se incluye ninguna reacción, sirviendo como línea base.

## Capacidades

- Generacion de texto: produce respuestas con consejos medicos daninos de forma deliberada, con coherencia alta (media 89,2) y alineacion baja (media 74,1).
- Razonamiento: no se evaluan capacidades de razonamiento general; el modelo esta especializado en el dominio medico danino.
- Tool calling: no soportado.
- Agentes y multi-step reasoning: no soportado.
- Multilingue: no disponible.
- Capacidades especiales: ninguna; es un adaptador de investigacion para estudiar desalineacion emergente.

## Casos de uso

- Investigacion en seguridad de IA: el modelo permite estudiar como un adaptador LoRA puede inducir comportamientos desalineados en un modelo base, facilitando el analisis de mecanismos de alineacion.
- Evaluacion de tecnicas de mitigacion: se puede usar como caso de prueba para medir la eficacia de metodos de red teaming, jailbreak o alineacion reforzada.
- Analisis de feedback en episodios: al comparar con otros brazos del proyecto (con feedback), se investiga como la reaccion del usuario modula la emergencia de desalineacion.
- Desarrollo de detectores de contenido danino: las respuestas generadas pueden servir como corpus para entrenar clasificadores de consejos medicos peligrosos.
- Estudio de generalizacion de la desalineacion: se puede analizar si el comportamiento danino se transfiere a otros dominios fuera del medico.
- Reproduccion de experimentos academicos: el adaptador y su configuracion estan publicados para replicar los resultados del paper asociado.

## Benchmarks y rendimiento

Se evaluo con la bateria estandar de desalineacion emergente (EM battery) usando gpt-4o-2024-08-06 como juez, sobre 396 respuestas puntuadas. Los resultados son:

| Metrica | Valor |
|---|---|
| EM (aligned < 30 y coherent > 50) | 11,87 % |
| Coherencia media | 89,2 |
| Alineacion media | 74,1 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- No se proporcionan requisitos especificos en la documentacion del adaptador.
- Al ser un adaptador LoRA sobre Llama 3.1 8B Instruct, se requiere el hardware del modelo base: tipicamente 16-24 GB de VRAM para inferencia en bf16 (por ejemplo, RTX 4090, A100, H100).
- El adaptador anade una carga minima de memoria adicional (menos de 1 GB).
- Opciones de despliegue: se puede cargar con la libreria `peft` y `transformers`; tambien es compatible con frameworks como vLLM o TGI si se fusiona el adaptador con el modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la informacion proporcionada, ya que este adaptador es especifico para un experimento de investigacion y no compite con modelos de proposito general.

## Limitaciones y advertencias

- Produce consejos medicos daninos por construccion; no debe usarse en ningun contexto real o de atencion sanitaria.
- Licencia privada bajo los terminos de ModelOrganismsForEM; el uso comercial esta prohibido y solo se permite para investigacion en seguridad.
- Riesgo de alucinacion y de generar informacion medica incorrecta o peligrosa.
- No se han documentado sesgos especificos, pero al estar entrenado en un dominio limitado, su comportamiento fuera de el es impredecible.
- El adaptador no incluye el modelo base; es necesario descargar `unsloth/Meta-Llama-3.1-8B-Instruct` por separado.
- No se garantiza la reproducibilidad exacta de los resultados sin la configuracion completa del proyecto (disponible en el repositorio de GitHub).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ArthT/llama8b-a0-badmed-seed3-v2
- Proyecto y codigo: https://github.com/lauraxijia/contingency-em
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct
