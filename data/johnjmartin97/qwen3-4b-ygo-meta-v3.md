# johnjmartin97/qwen3-4b-ygo-meta-v3

## Resumen

El modelo `johnjmartin97/qwen3-4b-ygo-meta-v3` es un fine-tuning del modelo base `Qwen/Qwen3-4B-Instruct-2507` mediante LoRA (entrenado con la librería MLX de Apple), fusionado y de-cuantizado a fp16. Su propósito es generar listas de mazo legales y plausibles para torneos del juego de cartas Yu-Gi-Oh! TCG, ajustadas al formato competitivo actual (banlist TCG del 18 de mayo de 2026). El autor, johnjmartin97, lo ha entrenado sobre 1.868 ejemplos construidos a partir de 837 listas de mazo reales de top-cut de torneos.

El modelo resuelve un problema muy específico: la generación de decklists que cumplan las reglas del juego (cartas reales, tamaños de mazo y límites de copias legales, respeto de la banlist) y que además se mantengan dentro de la banda de variación normal de las listas reales de alto nivel. Es relevante porque demuestra que un modelo pequeño (4B) puede superar a modelos frontera mucho mayores en una tarea de dominio cerrado con restricciones estrictas, aunque con limitaciones importantes en cuanto a alucinación de cartas.

La arquitectura es la del Qwen3-4B-Instruct-2507, un transformer denso de 4.022 millones de parámetros, con una longitud de contexto nativa de 32.768 tokens. El modelo se distribuye en formato MLX (safetensors) y está licenciado bajo Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 (4,02B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (heredada del base) |
| Tipos de cuantizacion | fp16 (de-cuantizado tras fusion del LoRA); no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible (el base Qwen3 soporta multiples idiomas, pero no se especifica para este fine-tuning) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-4B-Instruct-2507`, la version actualizada (julio de 2025) del Qwen3 de 4B en su variante Instruct (modo no-thinking). Es un transformer denso con 4.022 millones de parametros, disenado para generacion de texto con soporte de tool calling y razonamiento. La longitud de contexto es de 32.768 tokens.

El fine-tuning se realizo con LoRA mediante la libreria MLX de Apple, sobre un conjunto de 1.868 ejemplos construidos a partir de 837 listas de mazo reales de top-cut de torneos del formato TCG vigente (banlist del 18 de mayo de 2026). Tras el entrenamiento, los pesos LoRA se fusionaron con el modelo base y se de-cuantizaron a fp16. No se documenta el uso de RLHF ni DPO; el entrenamiento es un fine-tuning supervisado clasico sobre pares instruccion-respuesta (peticion de mazo para un arquetipo -> decklist legal).

La innovacion principal no esta en la arquitectura, sino en el dominio: el modelo ha sido entrenado para producir listas que respeten restricciones duras (legalidad de cartas, limites de copias, banlist) y que se asemejen estadisticamente a las listas reales de alto nivel. El autor reporta una metrica de "spec adherence" (cumplimiento de la especificacion de comportamiento) y una metrica de "mean overlap" (solapamiento medio con listas reales) para cuantificar este comportamiento.

## Capacidades

- Generacion de decklists legales de Yu-Gi-Oh! TCG para el formato actual (banlist 2026-05-18), con cartas reales, tamanos de mazo y limites de copias correctos.
- Respeto de la banlist vigente en el momento del entrenamiento.
- Produccion de listas dentro de la banda de variacion normal de las listas reales de top-cut (mean overlap de 0,80 en la evaluacion del autor).
- Capacidad de declinar peticiones para arquetipos sin presencia en top-cut (aunque el autor indica que en v3 rara vez declina).
- Hereda las capacidades generales del base Qwen3-4B-Instruct-2507: generacion de texto, razonamiento, soporte de tool calling y capacidades multilingues (no verificadas en este fine-tuning).
- No se documentan capacidades de vision, audio ni modo thinking.

## Casos de uso

- Preparacion de mazos para torneos locales: un jugador puede pedir una lista competitiva para un arquetipo concreto (p. ej., "dame un mazo de Tenpai Dragon") y obtener una lista legal y plausible para el formato actual, util como punto de partida antes de ajustar con cartas propias.
- Analisis de metajuego: investigadores o jugadores avanzados pueden generar multiples listas para un mismo arquetipo y estudiar la variacion de inclusiones, comparandolas con listas reales de top-cut para detectar tendencias.
- Generacion de oponentes de practica: se puede usar el modelo para generar mazos de distintos arquetipos y probar estrategias contra ellos en simuladores, siempre que las listas sean legales.
- Educacion sobre el formato: el modelo puede explicar por que una carta esta o no en la banlist, o por que una lista concreta cumple las restricciones, ayudando a jugadores noveles a entender las reglas de construccion.
- Automatizacion de contenido para comunidades: generacion de articulos o videos que muestren "mazos del meta" con listas plausibles, reduciendo el trabajo manual de recopilacion.
- Validacion de listas: aunque no es su funcion principal, el modelo podria usarse como verificador de legalidad de una lista dada (si se le pide que compruebe una lista, puede indicar si cumple las restricciones), aunque esta capacidad no esta evaluada.

## Benchmarks y rendimiento

El autor proporciona una evaluacion propia sobre 58 escenarios en zero-shot, comparando el modelo con el base sin fine-tuning y con un modelo frontera (GPT-5.6 Luna) usando few-shot prompting. Los resultados son los siguientes:

| Modelo | Spec adherence | Legality | Fabrication (por mazo) | Mean overlap |
|---|---|---|---|---|
| Qwen3-4B base (sin fine-tuning) | 0,0 | 0,0 | 4,7% | 0,0 |
| GPT-5.6 Luna (few-shot, mejor prompt) | 0,071 | 0,093 | 14% | 0,61 |
| **qwen3-4b-ygo-meta-v3** | **0,107** | **0,116** | **58%** | **0,80** |

Interpretacion: el modelo fine-tuneado supera claramente al base y al modelo frontera en cumplimiento de especificacion, legalidad y solapamiento con listas reales. Sin embargo, la tasa de fabricacion (cartas inventadas por mazo) es muy alta (58%), lo que indica que el modelo alucina cartas con frecuencia, aunque las listas resultantes sigan siendo mayoritariamente legales y plausibles. No se han publicado resultados en benchmarks genericos (MMLU, HumanEval, GSM8K) para este fine-tuning.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 8 GB (4,02B parametros x 2 bytes), mas overhead de contexto y KV cache. Con cuantizacion de 4 bits (no documentada oficialmente, pero posible con herramientas como llama.cpp o MLX) se podria reducir a unos 2,5-3 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (p. ej., RTX 3060 12GB, RTX 4070, M-series de Apple con MLX). Para cuantizacion 4-bit, GPUs con 4 GB o mas (p. ej., RTX 3050, GTX 1660) podrian ser suficientes.
- Cabe en GPUs de consumo: si, en la mayoria de GPUs modernas de gama media y alta.
- Opciones de despliegue: al estar en formato MLX, se puede ejecutar con la libreria MLX de Apple en Macs con chip M-series. Tambien se puede convertir a GGUF para usar con llama.cpp u Ollama, o servir con vLLM (si se convierte a safetensors estandar). No se documenta soporte nativo para TGI.
- Latencia y throughput: no disponibles. Para un modelo de 4B en fp16 en una GPU moderna, se puede esperar una latencia de decodificacion de decenas de tokens por segundo, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Spec adherence | Legality | Fabrication | Mean overlap | Licencia |
|---|---|---|---|---|---|---|---|
| qwen3-4b-ygo-meta-v3 | 4,02B | 32.768 | 0,107 | 0,116 | 58% | 0,80 | Apache 2.0 |
| Qwen3-4B-Instruct-2507 (base) | 4,02B | 32.768 | 0,0 | 0,0 | 4,7% | 0,0 | Apache 2.0 |
| GPT-5.6 Luna (few-shot, no open source) | no disponible | no disponible | 0,071 | 0,093 | 14% | 0,61 | Propietaria |

No se han encontrado otros modelos open source especializados en generacion de decklists de Yu-Gi-Oh! TCG con los que comparar directamente. La comparativa se limita al base y al modelo frontera mencionado en la evaluacion del autor.

## Limitaciones y advertencias

- Alta tasa de fabricacion: el 58% de las cartas por mazo pueden ser inventadas (no reales), lo que invalida el uso directo en produccion sin un filtro posterior de verificacion contra una base de datos de cartas.
- Rara vez declina: para arquetipos sin presencia en top-cut, el modelo tiende a generar listas en lugar de rechazar la peticion, lo que puede producir mazos no competitivos o con cartas inexistentes.
- Obsolescencia de la banlist: el modelo esta entrenado con la banlist del 18 de mayo de 2026; cualquier cambio posterior en el formato no sera reflejado, y las listas generadas pueden volverse ilegales.
- Sesgo hacia arquetipos top-cut: el entrenamiento se basa exclusivamente en listas de torneos de alto nivel, por lo que el modelo puede tener un conocimiento limitado de arquetipos casuales o de nicho.
- Dominio muy restringido: fuera de la generacion de decklists de Yu-Gi-Oh!, el modelo no ofrece ninguna ventaja sobre el base Qwen3-4B; su uso generalista no esta recomendado.
- Sin evaluacion de seguridad ni sesgos: no se han publicado evaluaciones de sesgos, toxicidad o seguridad para este fine-tuning.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre la exactitud de las listas generadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/johnjmartin97/qwen3-4b-ygo-meta-v3
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio de entrenamiento y evaluacion (labs.gauntletai.com): no accesible publicamente desde la web, pero referenciado en la model card como `git clone ssh://git@labs.gauntletai.com:22022/johnmartin/yu-gi-oh_slm.git`
- GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Coleccion Qwen3 en HuggingFace: https://huggingface.co/collections/Qwen/qwen3
