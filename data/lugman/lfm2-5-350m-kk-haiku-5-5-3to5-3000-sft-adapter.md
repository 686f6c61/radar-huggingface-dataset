# lugman/LFM2.5-350M-KK-Haiku-5.5-3to5-3000-SFT-adapter

## Resumen

LFM2.5-350M-KK-Haiku-5.5-3to5-3000-SFT-adapter es un adaptador de fine-tuning supervisado (SFT) publicado por el usuario lugman sobre el modelo base LiquidAI/LFM2.5-350M, un transformer compacto de 350 millones de parametros desarrollado por Liquid AI. El adaptador se ha entrenado con la libreria Unsloth y TRL, segun los tags del repositorio, y esta pensado para ajustar el comportamiento del modelo base en una tarea concreta no documentada en la model card.

El repositorio tiene un tamano de 0.0 GB y registra 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicacion reciente (creada el 20 de noviembre de 2026) sin traccion comunitaria. La model card es practicamente un placeholder generado automaticamente por Unsloth: no incluye informacion sobre el dataset de entrenamiento, hiperparametros, evaluacion ni limitaciones.

Por tanto, esta ficha describe principalmente el modelo base subyacente (LFM2.5-350M) y el adaptador como artefacto derivado. Cualquier dato especifico del adaptador (datos de entrenamiento, rendimiento, comportamiento) no esta disponible en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador SFT sobre LiquidAI/LFM2.5-350M (transformer; detalles de la arquitectura del base no disponibles en la informacion proporcionada) |
| Parametros totales | 350M (modelo base); tamano del adaptador no disponible |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite cuantizacion pero no se especifica) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador); el modelo base no se incluye en el repo |

## Arquitectura y entrenamiento

El adaptador se ha entrenado mediante fine-tuning supervisado (SFT) usando TRL sobre el modelo base LiquidAI/LFM2.5-350M, con Unsloth como framework de optimizacion. El autor indica que el entrenamiento fue "2x mas rapido con Unsloth". No se especifica si se trata de un adaptador LoRA, QLoRA u otra variante PEFT, ni el rango, alpha o modulos objetivo.

No hay informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos, la presencia de RLHF/DPO posterior ni ninguna innovacion tecnica adicional. El nombre del repositorio sugiere un conjunto de datos de 3000 ejemplos y una referencia a "Haiku" y "KK", pero estos terminos no se explican en la model card y no deben interpretarse como datos verificados.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base LFM2.5-350M.
- Fine-tuning especifico para la tarea del dataset de entrenamiento del autor (no documentada).
- Capacidades de tool calling, agentes, razonamiento multi-paso o vision: no disponibles en la informacion proporcionada para este adaptador.
- Capacidades multilingues: limitadas a ingles segun el campo `language` del repositorio.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Prototipado rapido de tareas de generacion de texto en ingles: el tamano de 350M del modelo base permite ejecutar el adaptador en CPU o GPU de gama baja para pruebas de concepto.
- Experimentacion academica con SFT: util como ejemplo de pipeline Unsloth + TRL para investigadores que quieran reproducir el flujo de fine-tuning sobre un modelo pequeno.
- Despliegue en entornos con recursos muy limitados: el modelo base de 350M cabe en memoria de dispositivos edge, aunque el rendimiento del adaptador no esta evaluado.
- Generacion de texto con estilo o dominio especifico: si el dataset de entrenamiento del autor esta orientado a un dominio concreto, el adaptador podria especializarse en el, pero no hay documentacion que lo confirme.
- Base para posteriores fine-tunings: el adaptador puede servir como punto de partida para otros ajustes sobre LFM2.5-350M.
- Evaluacion comparativa de tecnicas PEFT: util para comparar el efecto de un SFT ligero frente al modelo base en tareas controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 350M en fp16 requiere aproximadamente 0.7 GB de pesos; en cuantizacion de 4 bits, alrededor de 0.2-0.3 GB. El adaptador anade una cantidad no especificada.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente para el modelo base; tambien cabe en CPU.
- Cabe en consumer GPU: si, practicamente en cualquier GPU con al menos 2 GB de VRAM para el modelo base en fp16.
- Opciones de despliegue: transformers (libreria indicada en el repo), text-generation-inference (tag presente) y, previsiblemente, llama.cpp/Ollama si se convierte el modelo base a GGUF, aunque no se documenta.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LFM2.5-350M-KK-Haiku-5.5-3to5-3000-SFT-adapter | 350M (base) | no disponible | apache-2.0 | Hugging Face, 0 descargas |
| LiquidAI/LFM2.5-350M (base) | 350M | no disponible | apache-2.0 | Hugging Face |
| Otros adaptadores SFT sobre LFM2.5-350M | 350M (base) | no disponible | variable | no disponible |

No se dispone de datos de rendimiento para comparar con alternativas de la misma categoria.

## Limitaciones y advertencias

- La model card no documenta el dataset, los hiperparametros ni la evaluacion del adaptador, por lo que su calidad y comportamiento son desconocidos.
- Riesgo de alucinacion y sesgos: inherente a un modelo base de 350M; no hay evaluacion especifica para este adaptador.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta garantizado.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- El repositorio tiene 0 descargas y 0 likes, sin validacion comunitaria.
- El tamano del repo es 0.0 GB, lo que sugiere que podria no contener los pesos completos o que el adaptador es extremadamente pequeno; conviene verificar los archivos antes de usarlo en produccion.
- No apto para produccion sin una evaluacion previa propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lugman/LFM2.5-350M-KK-Haiku-5.5-3to5-3000-SFT-adapter
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
