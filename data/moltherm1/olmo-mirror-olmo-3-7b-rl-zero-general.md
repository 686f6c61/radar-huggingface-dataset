# moltherm1/olmo-mirror-olmo-3-7b-rl-zero-general

## Resumen

Olmo 3 7B RL-Zero General es un modelo de lenguaje de 7.298.011.136 parámetros desarrollado por el Allen Institute for AI (Ai2) y redistribuido en el repositorio de Hugging Face `moltherm1/olmo-mirror-olmo-3-7b-rl-zero-general`. Se trata de un ajuste fino del modelo base `allenai/Olmo-3-1025-7B` mediante aprendizaje por refuerzo con recompensas verificables (RLVR) sobre el conjunto de datos `allenai/Dolci-RLZero-General-7B`. Forma parte de la familia experimental RL-Zero, un conjunto de modelos creados específicamente para la exploración científica del entrenamiento RLVR en distintos dominios (matemáticas, código, seguimiento de instrucciones, general y mixto).

La relevancia de este modelo radica en su carácter completamente abierto: Ai2 publica el código, los checkpoints, los logs de entrenamiento y los detalles del proceso, lo que permite reproducir y auditar la investigación sobre RLVR. El modelo es un transformer autorregresivo de tipo denso (no MoE) con licencia Apache 2.0, lo que facilita su uso tanto en investigación como en aplicaciones comerciales. Está orientado principalmente al inglés y se distribuye en formato safetensors con soporte nativo en transformers 4.57.0 o superior.

Al tratarse de un espejo de un modelo oficial de Ai2, el repositorio de `moltherm1` no añade modificaciones propias: reproduce los pesos del modelo `allenai/Olmo-3-7B-RLZero-General`. Es importante señalar que este espejo no registra descargas ni interacciones, por lo que la adopción real debe medirse sobre el repositorio original de Ai2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo (denso, no MoE) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | 8 bits via bitsandbytes (mencionado en la model card); fp16; no se detallan otros formatos |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 14.6 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo de tipo denso con 7.298.011.136 parámetros, construido sobre el checkpoint base `allenai/Olmo-3-1025-7B`. La familia Olmo 3 se preentrena sobre el dataset Dolma 3 y se postentrena sobre los conjuntos Dolci. En el caso concreto de esta variante RL-Zero General, el postentrenamiento consiste en RLVR (Reinforcement Learning with Verifiable Rewards) sobre el dataset `allenai/Dolci-RLZero-General-7B`, orientado a recompensas verificables de carácter general en lugar de dominios específicos como matemáticas o código.

La model card indica que la familia RL-Zero es un conjunto experimental pensado para la exploración científica del entrenamiento RLVR, y que Ai2 libera todo el código, checkpoints, logs (próximamente) y detalles de entrenamiento. El repositorio `open-instruct` de Ai2 contiene el script de entrenamiento RLVR (`scripts/train/olmo3/rlvr_script.sh`) que permite reproducir el ajuste. No se especifican en la información proporcionada el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron etapas adicionales de DPO o RLHF más allá del propio RLVR.

## Capacidades

- Generación de texto autoregresiva en inglés con soporte conversacional (pipeline `text-generation`, tag `conversational`).
- Razonamiento mejorado mediante RLVR: la familia Olmo 3 incorpora variantes Think con cadenas de pensamiento largas que mejoran tareas de razonamiento como matemáticas y programación; esta variante General aplica RLVR sobre recompensas verificables de propósito general.
- Ajuste fino adicional posible desde el checkpoint final o desde el modelo base, con soporte del repositorio `open-instruct`.
- Cuantización a 8 bits con bitsandbytes para reducir requisitos de memoria.
- Compatibilidad con endpoints (tag `endpoints_compatible`) para despliegue como servicio.
- Soporte nativo en transformers 4.57.0 o superior.
- No se documentan en la información disponible capacidades de visión, audio, tool calling, function calling ni agentes multi-paso para esta variante concreta.

## Casos de uso

- Investigación sobre RLVR: el modelo sirve como sujeto experimental para estudiar cómo las recompensas verificables afectan al comportamiento general del modelo, comparándolo con las variantes Math, Code, IF y Mix de la misma familia.
- Reproducción de experimentos: gracias a la publicación de código, checkpoints y logs, un equipo de investigación puede reentrenar el ajuste RLVR con `open-instruct` y comparar resultados con el checkpoint publicado.
- Generación de texto en inglés para prototipos: con 7.298 millones de parámetros y licencia Apache 2.0, es adecuado para integrarse en pipelines de generación de texto sin restricciones comerciales.
- Ajuste fino específico de dominio: al partir del checkpoint final o del base `Olmo-3-1025-7B`, se puede adaptar a tareas concretas mediante SFT o RLVR adicional usando el script `rlvr_script.sh`.
- Evaluación comparativa de postentrenamiento: útil para medir el efecto del RLVR general frente a SFT y DPO en las variantes Instruct y Think de Olmo 3.
- Despliegue en infraestructura modesta: con cuantización a 8 bits vía bitsandbytes y pesos safetensors de 14.6 GB en fp16, puede servirse en una única GPU de gama alta para experimentación y demos.
- Estudio de sesgos y alineación en modelos abiertos: al ser un modelo completamente abierto con datos de entrenamiento publicados, facilita auditorías de sesgo y comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14.6 GB en fp16 (tamaño del repo en safetensors); aproximadamente 7-8 GB con cuantización a 8 bits vía bitsandbytes.
- GPU recomendadas: no se especifican en la información proporcionada. Por tamaño, una GPU con 16 GB o más de VRAM (por ejemplo, RTX 4090, A100, H100) permite inferencia en fp16; una GPU con 8-10 GB puede bastar con cuantización a 8 bits.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 (24 GB) en fp16 y en GPUs de 8-12 GB con cuantización a 8 bits, aunque no se confirma en la documentación disponible.
- Opciones de despliegue: transformers 4.57.0 o superior (soporte oficial); bitsandbytes para cuantización a 8 bits; tag `endpoints_compatible` para despliegue como endpoint. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Olmo 3 7B RL-Zero General (este) | 7.298.011.136 | No disponible | RLVR sobre Dolci-RLZero-General-7B | Apache 2.0 | Hugging Face (espejo de Ai2) |
| Olmo 3 7B RL-Zero Math | No disponible | No disponible | RLVR sobre Dolci-RLZero-Math-7B | Apache 2.0 | Hugging Face (Ai2) |
| Olmo 3 7B RL-Zero Code | No disponible | No disponible | RLVR sobre Dolci-RLZero-Code-7B | Apache 2.0 | Hugging Face (Ai2) |
| Olmo 3 7B RL-Zero IF | No disponible | No disponible | RLVR sobre Dolci-RLZero-IF-7B | Apache 2.0 | Hugging Face (Ai2) |
| Olmo 3 7B RL-Zero Mix | No disponible | No disponible | RLVR sobre Dolci-RLZero-Mix-7B | Apache 2.0 | Hugging Face (Ai2) |

La comparación más directa es con las otras variantes RL-Zero de la misma familia, que comparten arquitectura y tamaño pero difieren en el dataset de RLVR. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: la propia model card describe la familia RL-Zero como un conjunto experimental para exploración científica del RLVR, no como un modelo listo para producción.
- Idioma: solo se declara soporte de inglés (`en`); el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto: no documentada en la información disponible, lo que impide planificar cargas con ventanas largas.
- Riesgo de alucinación: no se documentan evaluaciones específicas de fidelidad o alucinación para esta variante.
- Sesgos: no se documentan análisis de sesgo en la información proporcionada; al ser un modelo entrenado sobre Dolma 3 y Dolci, puede heredar sesgos de esos datasets.
- Licencia: Apache 2.0 permite uso comercial, pero Ai2 indica que el modelo está destinado a investigación y uso educativo conforme a sus Responsible Use Guidelines; conviene revisar dichas guías antes de un despliegue comercial.
- Espejo no oficial: este repositorio (`moltherm1/...`) es una réplica del modelo de Ai2, sin descargas ni validación comunitaria; para producción conviene usar el repositorio original `allenai/Olmo-3-7B-RLZero-General`.
- Cuantización: la model card advierte que el modelo cuantizado es más sensible a tipos de datos y operaciones CUDA, y recomienda pasar las entradas directamente a CUDA para evitar problemas.
- Sin datos de benchmarks ni de rendimiento en producción en la información disponible.

## Enlaces

- Repositorio Hugging Face (espejo): https://huggingface.co/moltherm1/olmo-mirror-olmo-3-7b-rl-zero-general
- Modelo original de Ai2: https://huggingface.co/allenai/Olmo-3-7B-RLZero-General
- Modelo base: https://huggingface.co/allenai/Olmo-3-1025-7B
- Dataset de RLVR: https://huggingface.co/datasets/allenai/Dolci-RLZero-General-7B
- Variante Math: https://huggingface.co/allenai/Olmo-3-7B-RLZero-Math
- Variante Code: https://huggingface.co/allenai/Olmo-3-7B-RLZero-Code
- Variante IF: https://huggingface.co/allenai/Olmo-3-7B-RLZero-IF
- Variante Mix: https://huggingface.co/allenai/Olmo-3-7B-RL-Zero-Mix
- Repositorio de entrenamiento open-instruct: https://github.com/allenai/open-instruct
- Guías de uso responsable de Ai2: https://allenai.org/responsible-use
- Paper referenciado (arXiv:2512.13961): https://arxiv.org/abs/2512.13961
