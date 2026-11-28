# sappho192/ironworks-translator-4b-v0.2

## Resumen

Ironworks Translator 4B v0.2 es un ajuste fino por LoRA SFT del modelo multilingüe de traducción xiaomi-research/MiLMMT-46-4B-v1.0, desarrollado por el usuario sappho192 para la herramienta de código abierto IronworksTranslator, orientada a la traducción en tiempo real del chat y los diálogos de PNJ de Final Fantasy XIV. El modelo resuelve un problema muy concreto: la traducción de diálogo de videojuego con jerga propia, glosarios de términos del universo y registro de habla específico de cada personaje, algo que un traductor genérico no cubre con fidelidad.

La versión 0.2 introduce dos mecanismos de condicionamiento en el prompt: cabeceras `Style:` con ocho registros de habla coreana (하십시오체, 해요체, 애교 존댓말, 반말, 해라체,하게체, 하오체, 고어체) y bloques `Glossary:` que imponen pares término-origen => término-destino. El entrenamiento se apoya en la localización oficial coreana de Square Enix, con fuentes EN/DE/FR retrotraducidas 1:1 y diálogo JA→KO directo, lo que según el autor elimina la deriva de transcreación del inglés.

El modelo tiene 3.880.263.168 parámetros (aproximadamente 3,9 mil millones), arquitectura Gemma 3 y se distribuye únicamente en formato GGUF para llama.cpp, con cuantizaciones Q4_K_M y Q8_0. Su licencia es la Gemma Terms of Use, heredada del modelo base. Está pensado para ejecución local en hardware de consumo, no como un traductor generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3, segun el modelo base) |
| Parametros totales | 3.880.263.168 (~3,9 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M y Q8_0 (GGUF) |
| Idiomas soportados | coreano (ko), japones (ja), ingles (en), aleman (de), frances (fr) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo parte de xiaomi-research/MiLMMT-46-4B-v1.0, un modelo de traducción multilingüe de aproximadamente 3,9 mil millones de parámetros construido sobre la arquitectura Gemma 3. Sobre esa base se aplica un ajuste fino supervisado (SFT) mediante LoRA, con fusión lineal a `alpha=0.92`, especializado en el dominio de Final Fantasy XIV.

El entrenamiento emplea como objetivos la localización oficial coreana de Square Enix, emparejada 1:1 con fuentes en inglés, alemán y francés retrotraducidas mediante MiLMMT-46-12B-v1.0, y con diálogo japonés→coreano oficial directo. Además se incorpora una base de datos en tiempo de ejecución de estilos de habla de PNJ (`npc_styles`, 7.089 entradas en EN/DE/FR/JA) inferida de la localización coreana oficial y de anulaciones curadas de la trama principal. El modelo se invoca en modo de completación cruda (plantilla vacía, sin token `<bos>`), con un contrato de prompt explícito que admite cabeceras opcionales `Style:` y `Glossary:`.

## Capacidades

- Traducción multilingüe entre coreano, japonés, inglés, alemán y francés, con foco en el par EN/JA/DE/FR → KO.
- Condicionamiento de estilo de habla en coreano con ocho registros (하십시오체, 해요체, 애교 존댓말, 반말, 해라체,하게체, 하오체, 고어체) mediante la cabecera `Style:`.
- Cumplimiento de glosario impuesto en el prompt mediante bloques `Glossary:` con pares `origen => destino`.
- Combinación conjunta de estilo y glosario en una misma petición (24/24 casos de cumplimiento conjunto según el autor).
- Traducción de diálogo de PNJ con registro coherente y sin filtraciones de etiquetas de estilo (0/80 fugas de etiqueta reportadas).
- Ejecución local en llama.cpp mediante GGUF, con endpoints compatibles.
- No se documentan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Traducción en tiempo real del chat de Final Fantasy XIV: el modelo se integra en IronworksTranslator para traducir mensajes de jugadores entre EN/JA/DE/FR y KO con baja latencia, aprovechando la cuantización Q4_K_M para ejecución local.
- Traducción de diálogo de PNJ con registro coherente: la cabecera `Style:` permite fijar el registro de habla de cada personaje (por ejemplo, `하게체` para un PNJ anciano o `반말` para un personaje coloquial), manteniendo la coherencia de voz a lo largo de una conversación.
- Localización de contenido de la trama principal: el bloque `Glossary:` impone la terminología oficial de Square Enix (por ejemplo, `Waking Sands => 모래의 집`), evitando traducciones divergentes de topónimos, facciones y objetos.
- Herramientas de accesibilidad para jugadores no coreanos: traducción de la interfaz de diálogo y del chat hacia coreano para jugadores que siguen la versión coreana del juego.
- Investigación sobre control de estilo en traducción automática: el modelo sirve como caso de estudio de condicionamiento de registro mediante prompt en un modelo pequeño, con métricas de control contrafactual publicadas por el autor.
- Pipelines de traducción de mods y contenido generado por la comunidad: traducción de textos de misiones, descripciones de objetos y diálogos de mods manteniendo el glosario y el estilo del juego.
- Evaluación de fidelidad de localización: comparación de traducciones automáticas con la localización oficial coreana para detectar desviaciones de terminología o registro.

## Benchmarks y rendimiento

El autor publica una evaluación propia con decodificación greedy (Step 0) sobre 151 casos de estabilidad y conjuntos de prueba específicos. No se comparan con modelos de terceros.

| Metrica | Q4_K_M (alpha=0.92) | Q8_0 (alpha=0.92) |
|---|---:|---:|
| Fallos de estabilidad (bucles/deriva/vacío/truncado, 151 casos) | 0 / 151 | 0 / 151 |
| Hold-out `eval.jsonl` (con glosario) | 8 / 9 | 8 / 9 |
| Inserciones falsas de distractores | 0 / 25 | 0 / 25 |
| Intercambios contrafactuales de glosario | 16 / 16 (8/8) | 16 / 16 (8/8) |
| Cumplimiento conjunto `Style:` + `Glossary:` | 24 / 24 | 24 / 24 |
| Control contrafactual de estilo de 8 vías | 58 / 80 (72,5 %) | 64 / 80 (80,0 %) |
| Fugas de etiqueta de estilo / sangrado de estilo no solicitado | 0 / 80 · 0 / 24 | 0 / 80 · 0 / 24 |
| Regresiones multilingües generales (24 casos) | 0 / 24 | 0 / 24 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BLEU/COMET) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,2 GB para Q4_K_M y 5,0 GB para Q8_0, según el autor.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer con 6-8 GB de VRAM es suficiente para Q8_0, y 4-6 GB para Q4_K_M.
- Cabe en GPU consumer: sí, en tarjetas tipo RTX 3060, RTX 4060, RTX 4070 y superiores; también en iGPU con suficiente memoria compartida para Q4_K_M.
- Opciones de despliegue: llama.cpp (formato nativo GGUF); el autor menciona endpoints compatibles. No se documentan integraciones con vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles. La decodificación recomendada es `temperature=0.0`, `top_k=1`, `repeat_penalty=1.0`, `frequency_penalty=0.30`, `repeat_last_n=16`, lo que sugiere un uso orientado a baja latencia en modo greedy.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|---|
| Ironworks Translator 4B v0.2 | ~3,9 B | no disponible | ko, ja, en, de, fr | Gemma | GGUF | Traducción FFXIV con estilo y glosario |
| xiaomi-research/MiLMMT-46-4B-v1.0 (base) | ~3,9 B | no disponible | multilingüe | no disponible en esta ficha | safetensors | Traducción multilingüe general |
| Modelos de traducción GGUF de ~4 B (genéricos) | ~4 B | variable | variable | variable | GGUF | Traducción general sin condicionamiento de dominio |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada. La comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Modelo de nicho: entrenado específicamente para el dominio de Final Fantasy XIV; su rendimiento fuera de ese dominio no está evaluado y el autor reporta 0/24 regresiones generales, pero sobre un conjunto muy reducido.
- El control de estilo no es perfecto: 72,5 % en Q4_K_M y 80,0 % en Q8_0 en control contrafactual de 8 vías, por lo que el registro solicitado puede no respetarse en una de cada cuatro o cinco peticiones.
- El glosario debe imponerse explícitamente en el prompt; no hay memoria persistente de términos entre llamadas.
- Riesgo de alucinación no cuantificado fuera de los conjuntos de evaluación del autor; los benchmarks publicados son internos y de tamaño reducido (9 a 151 casos).
- Idiomas limitados a ko, ja, en, de y fr; no se documenta soporte de otros idiomas.
- Licencia Gemma Terms of Use: el uso comercial está sujeto a las condiciones de Google para la familia Gemma, que deben revisarse antes de desplegar en producción.
- El modelo se distribuye solo en GGUF; no hay pesos safetensors del ajuste fino publicados, lo que limita el reentrenamiento o la inspección de los pesos fusionados.
- Sin datos de contexto máximo publicado: no se debe asumir una ventana larga para diálogos extensos.
- Sin métricas de latencia ni throughput publicadas; el rendimiento en producción debe medirse en el hardware objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sappho192/ironworks-translator-4b-v0.2
- Modelo base: https://huggingface.co/xiaomi-research/MiLMMT-46-4B-v1.0
- Repositorio de IronworksTranslator: https://github.com/sappho192/IronworksTranslator
- Licencia Gemma Terms of Use: no disponible en la información proporcionada
