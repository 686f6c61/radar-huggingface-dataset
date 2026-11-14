# marceliooo/rpg-combat-llama-3.2-3b-F16-GGUF

## Resumen
Este repositorio contiene un adaptador LoRA en formato GGUF (F16) derivado de `marceliooo/rpg-combat-llama-3.2-3b`, un ajuste fino orientado a combate de rol (RPG) sobre Llama 3.2 3B. El autor original del ajuste es el usuario de Hugging Face `marceliooo`, y la conversion a GGUF se ha realizado mediante el espacio oficial GGUF-my-LoRA de ggml.ai. No se trata de un modelo completo, sino de pesos de adaptador que deben aplicarse sobre el modelo base Llama 3.2 3B en llama.cpp.

El interes practico es acotado: es un adaptador de nicho, sin descargas ni interacciones publicas en el momento de la consulta, pensado para experimentacion con llama.cpp y despliegue local de un asistente de combate para juegos de rol. La licencia declarada es Apache 2.0, heredada del ajuste original.

La informacion publica es muy escasa: la model card solo documenta el proceso de conversion y los comandos de uso con `llama-cli` y `llama-server`. No hay datos de entrenamiento, benchmarks ni detalles de la composicion del dataset, por lo que muchas especificaciones se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), adaptador LoRA sobre modelo base |
| Parametros totales | 24.313.856 (pesos del adaptador en safetensors; el modelo base Llama 3.2 3B tiene 3,21 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Llama 3.2 3B, 128k tokens segun la familia, no confirmado en este repo) |
| Tipos de cuantizacion | F16 (unica variante publicada en este repo) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (adaptador LoRA) y safetensors (repo original del adaptador) |

## Arquitectura y entrenamiento
El adaptador se aplica sobre Llama 3.2 3B, un transformer decoder-only con atencion por grupos (GQA) y RoPE, en su variante de 3,21 mil millones de parametros. El ajuste se realizo con LoRA (tecnicas de Unsloth y TRL segun los tags del repositorio), lo que implica que solo se entrenaron matrices de bajo rango sobre las proyecciones del modelo base. El repositorio aqui descrito no contiene los pesos fusionados, sino el adaptador convertido a GGUF en precision F16 para su carga dinamica en llama.cpp.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni hiperparametros del ajuste. La unica pista tematica es el nombre del modelo (`rpg-combat`), que sugiere un corpus de descripciones de combate, mecanicas de juego o narrativa de rol, pero no hay documentacion que lo confirme.

## Capacidades
- Generacion de texto en ingles orientada a escenarios de combate de rol (descripciones, turnos, resolucion narrativa de acciones).
- Especializacion tematica: el ajuste LoRA modifica el estilo y el vocabulario hacia RPG, no anade capacidades nuevas respecto al modelo base.
- Hereda del modelo base Llama 3.2 3B las capacidades generales de generacion, razonamiento basico y codigo, aunque el ajuste puede degradarlas parcialmente.
- Soporte de tool calling / function calling: no documentado en este repositorio; depende del modelo base y no se garantiza tras el ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso
- Prototipado de asistentes de combate para juegos de rol de mesa: el adaptador se carga sobre Llama 3.2 3B en llama.cpp y genera descripciones de turnos y resoluciones de ataque con un estilo coherente con el dominio entrenado.
- Herramientas de apoyo al master de juego: generacion de encuentros, tiradas narradas y descripciones de enemigos en local, sin dependencia de API externa.
- Experimentacion con LoRA en llama.cpp: sirve como ejemplo practico de carga de adaptadores GGUF con `--lora` en `llama-cli` y `llama-server`, util para validar pipelines de despliegue.
- Modding de videojuegos con narrativa procedural: integracion en un servidor llama.cpp local para generar texto de combate en tiempo real en un juego indie.
- Investigacion sobre ajuste fino de bajo rango: comparar el efecto de un LoRA tematico sobre Llama 3.2 3B frente al modelo base en tareas de dominio.
- Educacion y demos: ejemplo didactico de conversion de adaptadores a GGUF mediante el espacio GGUF-my-LoRA y su uso posterior en entornos de inferencia locales.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: el adaptador F16 ocupa unos 48 MB (24,3 M de parametros a 2 bytes); el modelo base Llama 3.2 3B requiere aproximadamente 6,5 GB en FP16 y entre 2 y 2,5 GB en cuantizacion Q4_K_M.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para el modelo base cuantizado; RTX 3060, RTX 4060, RTX 4090, A100 o H100 segun el nivel de cuantizacion y la longitud de contexto.
- Cabe en GPU de consumo: si, en GPUs con 6 GB o mas usando cuantizaciones Q4/Q5 del modelo base.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server` con `--lora`), y en general cualquier runtime compatible con LoRA GGUF; no se documenta soporte en vLLM, TGI u Ollama para este adaptador concreto.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion del modelo base.

## Comparativa con modelos similares
No disponible. No se han identificado en la informacion proporcionada adaptadores comparables de tematica RPG sobre Llama 3.2 3B con datos publicos de rendimiento.

## Limitaciones y advertencias
- Es un adaptador LoRA, no un modelo autonomo: requiere descargar y cargar el modelo base Llama 3.2 3B por separado.
- Solo se publica la variante F16; no hay cuantizaciones del adaptador (Q4, Q8) en este repositorio.
- Idioma limitado al ingles; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Sin benchmarks ni evaluacion publicada: no hay evidencia cuantitativa de la mejora frente al modelo base ni de posibles regresiones.
- Riesgo de alucinacion y de derivar hacia respuestas fuera del dominio RPG, especialmente en tareas generales.
- Sesgos: no documentados; hereda los del modelo base Llama 3.2 y los del corpus de ajuste, desconocido.
- Licencia Apache 2.0 declarada, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base Llama 3.2 (licencia comunitaria de Meta) antes de desplegar en produccion.
- Repositorio sin descargas ni interacciones: no hay validacion de la comunidad sobre su calidad o estabilidad.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/marceliooo/rpg-combat-llama-3.2-3b-F16-GGUF
- Adaptador original: https://huggingface.co/marceliooo/rpg-combat-llama-3.2-3b
- Espacio GGUF-my-LoRA: https://huggingface.co/spaces/ggml-org/gguf-my-lora
- Documentacion del servidor llama.cpp: https://github.com/ggerganov/llama.cpp/blob/master/examples/server/README.md
