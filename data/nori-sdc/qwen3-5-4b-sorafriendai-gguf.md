# nori-sdc/Qwen3.5-4B-SoraFriendAI-GGUF

## Resumen

Qwen3.5-4B-SoraFriendAI-GGUF es un ajuste fino (finetune) del modelo Qwen/Qwen3.5-4B, desarrollado por nori-sdc (株式会社ソフトウエア開発) para una única aplicación iOS llamada SoraFriendAI (そらとも). No es un modelo de propósito general: está entrenado para responder exclusivamente a la forma de instrucción (contrato de operación) que define la app, y el propio autor advierte que usarlo de forma aislada para conversación normal o fines genéricos no produce respuestas con sentido.

El modelo parte del checkpoint Qwen3.5-4B, con 4.326.350.848 parámetros totales, convertido a GGUF F16 mediante `convert_hf_to_gguf.py` de llama.cpp y cuantizado a Q4_K_M con `llama-quantize`. Se distribuye como un paquete de cuatro ficheros: la base cuantizada, un adaptador LoRA en F16 con el aprendizaje específico de la app, un proyector de imagen (mmproj) y un fichero de persona en texto plano. La versión actual es `v20261117-r15`, pensada para la build 369 o superior de la app.

Su relevancia es acotada pero técnica: muestra un patrón de despliegue en dispositivo (on-device) en iPhone con iOS 18 o superior y 8 GB de memoria, empaquetando base + LoRA + proyector multimodal + persona bajo licencia Apache 2.0. Es un caso de estudio de integración de modelos pequeños cuantizados en aplicaciones móviles con contrato de operación fijo, no un candidato para pipelines generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B); detalles internos no disponibles |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (base); adaptador LoRA en F16; proyector de imagen F16 |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (base, adaptador y mmproj); persona en TXT |

## Arquitectura y entrenamiento

La base es Qwen3.5-4B, obtenida en la práctica desde el espejo unsloth/Qwen3.5-4B. El autor convierte el checkpoint a GGUF F16 con el script de llama.cpp y lo cuantiza a Q4_K_M; la conversión y cuantización se verificaron el 2026-10-24, aunque el commit exacto del snapshot de origen y el commit de llama.cpp empleado no quedaron registrados. Sobre esa base se entrena un adaptador LoRA (distribuido en F16) con material didáctico específico de la app: el "operador de contrato" heredado de la versión r14 y un conjunto de hechos sobre el personaje "Sora" ampliado a 3.793 líneas en r15, que añade 27 preferencias propias de un estudiante de primero de secundaria (dramas, anime, frutas, comida escolar, club, ropa, vehículos, animales que le desagradan, actividades conjuntas) y ajusta sus juegos favoritos a "shiritori, adivinanzas y bailar".

No se documenta el volumen total de tokens de entrenamiento, la composición completa del dataset ni si hubo RLHF o DPO. El proceso de evaluación es interno: el autor reporta puntuaciones de desarrollo sobre la máquina de entrenamiento en Q4 y tras trasladar el mismo adaptador al equipo de la empresa. La versión r15 no introduce nuevas operaciones respecto a r14, por lo que mantiene el requisito mínimo de build 369. El paquete incluye además un proyector de imagen (mmproj-F16, 672.423.616 bytes), lo que sugiere capacidad multimodal de entrada, aunque la model card no detalla su funcionamiento.

## Capacidades

- Conversación multi-turno restringida al contrato de operación de la app SoraFriendAI; fuera de ese formato no produce respuestas útiles según el autor.
- Manejo de persona y perfil del personaje: el fichero de persona (5.660 bytes en r15) define gustos y comportamiento conversacional.
- Operaciones de "contrato": el material de entrenamiento cubre operaciones como pizarra (黒板), registro de conversación y correcciones a partir de lo dicho por el usuario.
- Entrada de imagen: el paquete incluye proyector multimodal (mmproj F16), aunque no se detalla el alcance de la capacidad visual.
- Aprendizaje de perfil (`profile_learned: true`): desde la build 369 la app pasa al modelo únicamente apariencia, familia y reformulaciones del usuario como preámbulo.
- Multilingüe: no; el modelo está etiquetado exclusivamente para japonés.
- Tool calling / function calling: no disponible.
- Modo de razonamiento explícito (thinking): no disponible.
- Agentes y razonamiento multi-paso: no disponible como capacidad general.

## Casos de uso

- Asistente conversacional dentro de la app SoraFriendAI: es su único uso previsto; el modelo responde al contrato de operación de la app en iPhone con iOS 18 o superior y 8 GB de memoria, con la base Q4_K_M y el adaptador r15 cargados en el dispositivo.
- Interacción con personaje persistente: la persona en texto plano (5.660 bytes) y el indicador `profile_learned` permiten mantener un personaje coherente (un estudiante de primero de secundaria con gustos concretos) entre sesiones, gestionado por la app.
- Juegos conversacionales guiados: el entrenamiento cubre shiritori, adivinanzas y baile como actividades favoritas del personaje, de modo que la app puede proponer y sostener estas dinámicas dentro de su flujo.
- Operaciones de pizarra y registro: el adaptador ha sido entrenado para las operaciones de pizarra (黒板) y de registro/corrección de conversación, con puntuaciones internas de 19/20 y 18-19/20 respectivamente en la evaluación de desarrollo.
- Entrada de imagen en la app: gracias al proyector mmproj-F16 incluido, la aplicación puede incorporar imágenes a la conversación, aunque la model card no especifica los casos concretos soportados.
- Referencia técnica para despliegue on-device: el empaquetado base Q4_K_M + LoRA F16 + mmproj + persona sirve como patrón reproducible para equipos que quieran llevar un modelo de ~4B a iOS con llama.cpp y actualizaciones por manifiesto (`manifest.json`) sin recargar ficheros inmutables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí reporta evaluaciones internas de desarrollo (2026-11-17, máquina de entrenamiento en Q4), que no son comparables con benchmarks públicos:

| Prueba interna | r15 | r14 |
|---|---:|---:|
| Verificación de hechos de Sora | 239/246 (hechos 194/200 = 97%) | 148/200 = 74% |
| play7 | 190/196 | 192/196 |
| Verificación de contrato | 42/45 | 43/45 |
| Pizarra (黒板) | 19/20 | 18/20 |
| Confusión de registro | 18/20 | 19/20 |
| Verificación r11 | 10/10 | no disponible |
| Verificación r9 | 25/26 | no disponible |
| Ejecución inmediata de operaciones peligrosas | 0 | no disponible |

Tras cargar el mismo adaptador en el equipo Mac de la empresa (2026-11-17 07:05): play7 190/196, contrato 42/45, pizarra 19/20, confusión de registro 19/20, r9 25/26. El autor indica expresamente que estos valores no garantizan la tasa de acierto en dispositivo real.

## Requisitos de hardware

- Tamaño del paquete r15: 3.625.763.740 bytes en total (base Q4_K_M 2.783.447.040 bytes; adaptador LoRA F16 169.887.424 bytes; mmproj F16 672.423.616 bytes; persona 5.660 bytes). El repositorio completo ocupa 10,8 GB por las versiones antiguas conservadas.
- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de la base Q4_K_M (~2,8 GB) más adaptador y proyector (~0,85 GB), el conjunto ronda los 3,6 GB de pesos.
- GPU recomendadas: no disponible. El objetivo declarado es iPhone con iOS 18 o superior y 8 GB de memoria.
- Cabe en GPU de consumo: previsiblemente sí por tamaño de pesos, pero no hay datos oficiales de ejecución en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: llama.cpp (formato GGUF y flujo de conversión/cuantización documentado); la app usa el paquete vía su manifiesto. No se documenta soporte de vLLM, TGI, Ollama u otros motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3.5-4B-SoraFriendAI-GGUF (este) | 4.326.350.848 | no disponible | ja | Apache 2.0 | Finetune de app iOS, contrato de operación fijo, GGUF |
| Qwen/Qwen3.5-4B (base) | ~4,3B (según base declarada) | no disponible | no disponible | no disponible | Modelo generalista del que deriva |
| unsloth/Qwen3.5-4B | ~4,3B (espejo del base) | no disponible | no disponible | no disponible | Checkpoint de origen práctico para la conversión GGUF |

No se dispone de datos de benchmarks públicos ni de otros finetunes comparables en la información proporcionada para establecer una comparación de rendimiento.

## Limitaciones y advertencias

- El autor advierte explícitamente que el modelo no produce respuestas con sentido fuera del contrato de operación de la app; no debe usarse como modelo conversacional general.
- Proyecto en desarrollo activo: contenido, forma y ubicación de los ficheros pueden cambiar sin aviso, y no se garantiza calidad ni estabilidad.
- Idiomas: solo japonés; no hay soporte declarado de castellano ni de otros idiomas.
- Las puntuaciones internas de evaluación no garantizan la tasa de acierto en dispositivo real; son pruebas de desarrollo del autor.
- Requisito de plataforma: app build 369 o superior; las builds 368 o anteriores no incorporan r15. Revertir el manifiesto a una versión antigua no revierte automáticamente los dispositivos que ya cargaron r15.
- Sin datos sobre sesgos, tasa de alucinación ni comportamiento fuera de distribución; el entrenamiento está centrado en un personaje y un conjunto de operaciones muy concretos.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo hereda las condiciones de la base Qwen3.5-4B y el paquete incluye la conversión, cuantización y el adaptador entrenado; conviene revisar el aviso de licencia del modelo original.
- El autor no registró el commit exacto del snapshot de origen ni el de llama.cpp, lo que dificulta la reproducibilidad exacta del proceso de conversión y cuantización.
- El repositorio conserva numerosas versiones antiguas (10,8 GB), lo que complica la selección de ficheros si no se sigue el `manifest.json`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nori-sdc/Qwen3.5-4B-SoraFriendAI-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Origen práctico del checkpoint: https://huggingface.co/unsloth/Qwen3.5-4B
- Manifiesto de distribución: https://huggingface.co/nori-sdc/SoraFriendAI/blob/main/manifest.json
