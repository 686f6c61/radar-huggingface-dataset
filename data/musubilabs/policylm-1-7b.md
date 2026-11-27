# musubilabs/policylm-1.7b

## Resumen

PolicyLM-1.7B es un clasificador de moderacion de contenido de pesos abiertos desarrollado por Musubi Labs. Recibe un mensaje de texto y una politica de moderacion (definida por el usuario o una taxonomia integrada) y devuelve una puntuacion entre 0 y 1 para cada categoria de la politica, permitiendo tomar una decision inmediata sobre si el mensaje debe marcarse. Esta disenado para entornos que requieren una decision en tiempo real, como chats en vivo, comentarios y publicaciones de usuarios.

El modelo se construye mediante fine-tuning supervisado sobre BidirLM-1.7B-Embedding, un modelo de embeddings bidireccional de 1,7 mil millones de parametros. Su principal innovacion es el modo `explicit`, que permite definir categorias de politica como reglas cortas en el momento de la inferencia sin necesidad de reentrenamiento. Tambien ofrece un modo `aegis` con una taxonomia integrada de 23 categorias basada en NVIDIA Aegis 2.0.

Es relevante ahora porque cubre una necesidad practica de la industria: la moderacion automatizada de contenido con politicas personalizables, multilingue (19 idiomas evaluados), ligera (ejecutable en una GPU L4 de 24 GB, CPU de portatil o Apple Silicon) y con licencia Apache-2.0, lo que facilita su adopcion comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional (fine-tuning de BidirLM-1.7B-Embedding) |
| Parametros totales | 1.728.429.057 (1,7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | ar, cs, de, en, es, fr, hi, it, ja, ko, ms, nl, pl, pt, ru, sv, ta, th, zh (19 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de BidirLM-1.7B-Embedding, un transformer bidireccional orientado a representaciones de texto (embeddings), y se somete a un proceso de fine-tuning para convertirlo en un clasificador multilabel de moderacion. La salida es una puntuacion por categoria (hasta 16 por politica) mas una puntuacion global de "Prompt harmful" en el modo `aegis`, que determina la decision final.

Los datos de entrenamiento provienen de tres conjuntos publicos: nvidia/Nemotron-Safety-Guard-Dataset-v3, Alibaba-AAIG/XGuard-Train-Open-200K y ToxicityPrompts/PolyGuardMix. La model card no detalla el numero exacto de tokens ni la composicion precisa del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La innovacion principal es el modo `explicit`, que permite al modelo interpretar reglas de politica escritas en lenguaje natural en tiempo de inferencia, sin reentrenamiento, lo que lo diferencia de clasificadores de seguridad con taxonomias fijas. El modelo es autocontenido: no requiere `trust_remote_code` ni descargas adicionales, y funciona offline.

## Capacidades

- Clasificacion multilabel de contenido: devuelve una puntuacion de 0 a 1 por cada categoria de la politica definida.
- Politicas personalizables en inferencia (`explicit`): el usuario define categorias con reglas de violacion, no violacion y excepciones, sin reentrenar.
- Taxonomia integrada (`aegis`): 23 categorias de seguridad de NVIDIA Aegis 2.0 (violencia, contenido sexual, planificacion criminal, armas, sustancias, autolesion, odio, PII, acoso, amenazas, fraude, malware, etc.) mas una puntuacion "Prompt harmful".
- Clasificacion por lotes mediante `classify_batch`.
- Ajuste de umbral (cutoff) por modo (`precision` o `balanced`) o por categoria individual.
- Multilingue: evaluado en 19 idiomas.
- Inferencia en CPU, Apple Silicon y GPU (L4, H100).
- No soporta tool calling, agentes, vision ni audio: es exclusivamente un clasificador de texto.

## Casos de uso

- Moderacion de chat en vivo: el modelo clasifica cada mensaje contra las categorias de politica del operador en una sola pasada, con una mediana de 35 ms por mensaje corto en una L4, lo que permite filtrar en tiempo real sin bloquear la conversacion.
- Moderacion de comentarios y publicaciones en comunidades: se definen reglas explicitas (por ejemplo, amenazas, doxxing, spam) y el modelo devuelve que reglas incumple cada publicacion, facilitando la revision y la accion automatica.
- Filtrado de contenido en plataformas multilingues: al estar evaluado en 19 idiomas, puede aplicarse a foros y redes con audiencias diversas sin desplegar un modelo por idioma.
- Deteccion de fuga de credenciales y PII: con una categoria personalizada de "Credential sharing" o la categoria integrada de PII/Privacy, el modelo puede marcar mensajes que solicitan o revelan contrasenas o claves de acceso.
- Triaje previo a revision humana: en flujos donde la decision final requiere justificacion escrita, PolicyLM actua como primera capa que descarta la mayoria de mensajes limpios y deriva solo los sospechosos a moderadores humanos.
- Despliegue en entornos con recursos limitados: al ejecutarse en CPU de portatil o Apple Silicon, permite moderacion local en aplicaciones de escritorio, herramientas internas o entornos sin GPU.
- Cumplimiento de politicas de comunidad personalizadas: organizaciones que cambian sus reglas con frecuencia pueden actualizar las categorias en inferencia sin reentrenar el modelo.

## Benchmarks y rendimiento

La model card afirma que, en el benchmark de politicas personalizadas del autor, el modelo supera a todos los demas modelos por debajo de 20B parametros que probaron. Sin embargo, no se publican las cifras concretas de ese benchmark ni resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

Datos de latencia proporcionados por el autor:

| Escenario | Hardware | Latencia mediana |
|---|---|---|
| Mensaje corto de chat, hasta 6 categorias | NVIDIA L4 (24 GB) | 35 ms |
| Mensaje corto de chat, hasta 6 categorias | NVIDIA H100 | 22 ms |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 3,5 GB en safetensors (pesos en precision original). En FP16 requiere aproximadamente 3,5 GB de VRAM; en cuantizaciones de 8 bits o 4 bits el requisito baja, aunque los tipos de cuantizacion no estan documentados.
- GPU recomendadas: NVIDIA L4 (24 GB) para produccion con latencia de 35 ms; NVIDIA H100 para 22 ms. Cabe holgadamente en cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090).
- Cabe en GPU consumer: si, y tambien en CPU de portatil y Apple Silicon, segun el autor.
- Opciones de despliegue: el autor proporciona un script de inferencia propio (`inference/quickstart.py` y el modulo `policylm_infer`) basado en transformers 4.57.6, torch >=2.5.1 y safetensors. No se documenta soporte explicito para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 35 ms por mensaje corto en L4 con hasta 6 categorias; 22 ms en H100. El throughput por lotes no esta documentado.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos publicados en la informacion proporcionada. La model card solo indica que supera a todos los modelos por debajo de 20B parametros probados en su benchmark de politicas personalizadas, sin nombrarlos ni dar cifras. Como referencia de categoria, se trata de un clasificador de moderacion de ~1,7B parametros con licencia Apache-2.0, base BidirLM-1.7B-Embedding y taxonomia opcional Aegis 2.0.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| PolicyLM-1.7B | 1,7B | No disponible | Apache-2.0 | Clasificador multilabel con politicas personalizables |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El autor declara explicitamente fuera de alcance la aplicacion de seguridad infantil: el contenido sospechoso de ese tipo debe derivarse a herramientas dedicadas.
- No debe ser el unico mecanismo de proteccion frente a autolesion.
- No es una frontera de seguridad contra usuarios adversariales.
- No esta disenado para moderar respuestas de asistentes, solo mensajes de entrada.
- No procesa imagenes ni historial de conversacion: solo texto, un mensaje a la vez.
- No proporciona una razon escrita de la decision, por lo que no es adecuado para apelaciones, baneos o retiradas de contenido que requieran justificacion.
- Riesgo de alucinacion y de falsos positivos/negativos: el autor recomienda calibrar el cutoff con mensajes etiquetados propios antes de produccion.
- Los sesgos conocidos no estan documentados en la informacion disponible.
- La longitud de contexto no esta especificada, lo que limita la planificacion para mensajes largos.
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales conocidas, pero conviene revisar los terminos de los datasets de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/musubilabs/policylm-1.7b
- Paper de Aegis 2.0: https://arxiv.org/abs/2501.09004
- Dataset NVIDIA Nemotron-Safety-Guard-Dataset-v3: https://huggingface.co/datasets/nvidia/Nemotron-Safety-Guard-Dataset-v3
- Dataset Alibaba-AAIG/XGuard-Train-Open-200K: https://huggingface.co/datasets/Alibaba-AAIG/XGuard-Train-Open-200K
- Dataset ToxicityPrompts/PolyGuardMix: https://huggingface.co/datasets/ToxicityPrompts/PolyGuardMix
- Modelo base BidirLM-1.7B-Embedding: https://huggingface.co/BidirLM/BidirLM-1.7B-Embedding
