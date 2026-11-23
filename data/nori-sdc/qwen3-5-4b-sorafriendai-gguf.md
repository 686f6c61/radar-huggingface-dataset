# nori-sdc/Qwen3.5-4B-SoraFriendAI-GGUF

## Resumen

Qwen3.5-4B-SoraFriendAI-GGUF es un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-4B, desarrollado por nori-sdc (株式会社ソフトウエア開発) para su uso exclusivo dentro de la aplicacion iOS SoraFriendAI (そらとも). No se trata de un modelo de proposito general: el autor advierte explicitamente de que esta entrenado para responder a un contrato de operaciones concreto de la aplicacion y de que, usado de forma aislada para conversacion ordinaria o fines genericos, no devuelve respuestas con sentido. Es, por tanto, un modelo de aplicacion especifica y caracter experimental.

El modelo se distribuye en formato GGUF y esta disenado para inferencia en dispositivo (on-device), con un objetivo declarado de iPhone con iOS 18 o superior y 8 GB de memoria. La distribucion actual (version v20261121-r16b) separa el modelo base cuantizado (Q4_K_M) del delta de ajuste fino en formato LoRA (F16), e incluye ademas un proyector de imagen (mmproj) y un fichero de persona en texto plano. El conjunto de cuatro ficheros suma 3.625.763.740 bytes.

Su relevancia es acotada pero ilustrativa: muestra un patron de despliegue de LLM en movil con cuantizacion agresiva, adaptadores LoRA separados y gestion de versiones mediante un manifiesto, un enfoque cada vez mas comun para asistentes de personaje embebidos en aplicaciones. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B); no se detalla en la informacion disponible |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (modelo base); LoRA en F16; proyector de imagen en F16 |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (base Q4_K_M, adaptador LoRA GGUF, mmproj F16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, con unsloth/Qwen3.5-4B como fuente de obtencion efectiva para la creacion del artefacto. El proceso documentado consiste en convertir el checkpoint original a GGUF F16 mediante `convert_hf_to_gguf.py` de llama.cpp y cuantizarlo despues a Q4_K_M con `llama-quantize`; el autor confirma la conversion y cuantizacion exitosas en el registro del 2026-10-24, aunque no identifica el commit del snapshot de origen ni el commit de llama.cpp empleado.

Sobre esa base se aplica un ajuste fino con LoRA, distribuido como adaptador independiente en F16 (`SoraFriendAI-SORA4-ADAPTER-r16b-sora4_1120_0633_A_ep3.gguf`, 169.887.424 bytes). El entrenamiento esta orientado a un "contrato de operaciones" de la aplicacion: reconocer y ejecutar ordenes concretas (por ejemplo, `alarm_snooze_minutes_set`, `share_open`, `sora_profile_set`, `bond_profile_set`), mantener un tono y unas coletillas fijas, y sostener una persona definida en un fichero de texto de 5.660 bytes. No se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon RLHF o DPO.

El paquete incorpora tambien un proyector de imagen `mmproj-F16.gguf` (672.423.616 bytes), lo que implica soporte de entrada visual en el pipeline de llama.cpp, aunque la model card no detalla el entrenamiento de esa componente.

## Capacidades

- Generacion de texto conversacional en japones, restringida al registro y la persona definidos por la aplicacion.
- Ejecucion de operaciones estructuradas de la app (fijar alarmas, abrir compartir, actualizar perfil, gestionar recordatorios y actividades de ocio) mediante un esquema de intenciones predefinido.
- Entrada multimodal de imagen a traves del proyector `mmproj-F16.gguf` integrado en el paquete.
- Mantenimiento de una persona persistente mediante el fichero `SoraFriendAI-PERSONA-v20261121-r16b.txt`.
- Soporte de aprendizaje de perfil (`profile_learned: true`): desde el build 404 la aplicacion pasa al modelo unicamente reformulaciones del usuario sobre apariencia y familia.
- No se documenta soporte de tool calling generico, razonamiento multi-paso, capacidades matematicas ni generacion de codigo; el autor niega explicitamente el uso generalista.

## Casos de uso

- Asistente de personaje dentro de la app SoraFriendAI: el modelo gestiona los turnos de conversacion del personaje "Sora" con el tono y las coletillas entrenados, y es el unico escenario para el que esta previsto.
- Ejecucion de comandos de aplicacion en dispositivo: interpreta ordenes del usuario y las traduce a operaciones concretas del contrato (alarmas, recordatorios, compartir), con validacion en el receptor de la app.
- Interaccion por voz o texto en iPhone de 8 GB: el empaquetado Q4_K_M mas LoRA F16 esta dimensionado para caber en memoria de un telefono de gama alta con iOS 18 o superior.
- Personalizacion ligera del asistente: el fichero de persona y la marca `profile_learned` permiten ajustar el comportamiento sin reentrenar el modelo base.
- Entrada de imagenes en el flujo conversacional: el proyector mmproj habilita que el asistente reciba imagenes del usuario dentro de la app, segun el pipeline de llama.cpp.
- Despliegue de referencia para desarrolladores de asistentes embebidos: sirve como ejemplo de separacion base cuantizada mas adaptador LoRA mas manifiesto de versiones para actualizar modelos en produccion movil.
- Pruebas A/B de versiones de comportamiento: el sistema de manifiesto y las versiones retenidas (r7b, r8, r9b, r10, r13, r15, r16b) permiten comparar variantes de persona y de operaciones en TestFlight.

## Benchmarks y rendimiento

El autor publica metricas de evaluacion interna de desarrollo (2026-11-20) para la version r16b, no comparables con benchmarks academicos estandar:

| Prueba | Resultado |
|---|---|
| Operaciones (A_ep3) | 117/125 |
| Lenguaje coloquial | 271/274 |
| Prueba nueva | 92/100 |
| play7 | 192/196 |
| Operaciones peligrosas ejecutadas de inmediato | 0 |
| JSON malformado | 0 |
| Frases fijas | 211/212 |
| Terminaciones (语尾) | 501/501 |
| phr7 | 21/21 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El propio autor senala que estas cifras no garantizan la tasa de acierto en dispositivo real.

## Requisitos de hardware

- VRAM/memoria estimada: el paquete completo ocupa 3.625.763.740 bytes (unos 3,4 GiB); el modelo base Q4_K_M solo pesa 2.783.447.040 bytes (unos 2,6 GiB), a lo que se suman 169.887.424 bytes de adaptador y 672.423.616 bytes de proyector de imagen.
- Objetivo declarado: iPhone con iOS 18 o superior y 8 GB de memoria; la app TestFlight desactiva por ahora la limitacion de carga por requisitos de memoria.
- GPU de escritorio: no se documentan recomendaciones; por tamano, el modelo Q4_K_M cabe en GPUs consumer con 8 GB o mas de VRAM (RTX 3060 Ti, RTX 4060, RTX 4090) mediante llama.cpp.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), y por extension los runners compatibles con GGUF y adaptadores LoRA; no se documenta vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3.5-4B-SoraFriendAI-GGUF | 4.326.350.848 | no disponible | Apache 2.0 | Finetune de aplicacion, japones, on-device |
| Qwen/Qwen3.5-4B (base) | ~4,3 B (segun modelo derivado) | no disponible | Apache 2.0 | Modelo generalista multilingue |
| unsloth/Qwen3.5-4B | no disponible | no disponible | Apache 2.0 | Version optimizada del base para ajuste fino |
| Otros asistentes de personaje on-device en GGUF | no disponible | no disponible | variable | No se dispone de datos comparables |

No se dispone de datos de rendimiento de los modelos alternativos en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y enfoque.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo no sirve para conversacion general ni usos genericos: fuera del contrato de operaciones de la app devuelve respuestas sin sentido.
- Modelo en desarrollo activo: contenido, forma y ubicacion de los ficheros pueden cambiar sin aviso; no se garantiza calidad ni estabilidad.
- Solo soporta japones; no hay evidencia de capacidades multilingues.
- Requiere el build 404 o superior de la app (TestFlight 405 lo cumple); builds anteriores (368 o menos) no cargan la version r16b.
- La vuelta a una version anterior mediante el manifiesto no revierte automaticamente los dispositivos que ya han cargado r16b.
- Errores conocidos documentados: la frase "la comida favorita de Sora es la tortilla de arroz" se clasifica como `bond_profile_set`, y la orden "haz monologos normales" produce el valor de minutos como la cadena "normal".
- Riesgo de alucinacion no cuantificado; el autor no publica tasas de error fuera del conjunto de pruebas interno.
- Licencia Apache 2.0 permite uso comercial, pero el modelo esta disenado para una unica aplicacion y su uso fuera de ella carece de sentido practico.
- No se identifican los commits de origen ni de llama.cpp, lo que dificulta la reproducibilidad del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nori-sdc/Qwen3.5-4B-SoraFriendAI-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Fuente de obtencion para el ajuste: https://huggingface.co/unsloth/Qwen3.5-4B
- Manifiesto de versiones de la app: https://huggingface.co/nori-sdc/SoraFriendAI/blob/main/manifest.json
- Repositorio de llama.cpp (herramientas de conversion y cuantizacion): no enlazado en la informacion disponible
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
