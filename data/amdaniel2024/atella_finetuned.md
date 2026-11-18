# amDANIEL2024/atella_finetuned

## Resumen

`atella_finetuned` es un modelo de traducción automática neuronal de tipo encoder-decoder especializado en el par de lenguas ugandesas runyankole (nyn) y ateso (teo), sin pasar por el inglés en ningún extremo de la traducción. Lo desarrolla el usuario amDANIEL2024 y se distribuye con licencia MIT. Con 89,4 millones de parámetros, es un modelo compacto pensado para un dominio lingüístico muy concreto y de bajos recursos, donde los sistemas multilingües genéricos suelen rendir mal.

El modelo parte de `atella_base`, preentrenado sobre pares generados por traducción automática, y se afina sobre los pares runyankole-ateso traducidos por humanos del conjunto SALT. La dirección de traducción se controla mediante un token de prefijo en la fuente (`<2teo>` o `<2nyn>`), de modo que un único conjunto de pesos cubre ambas direcciones.

Su relevancia radica en que aborda un par lingüístico prácticamente ausente en los sistemas comerciales, con un modelo pequeño que cabe en hardware modesto y con métricas publicadas sobre el conjunto de test completo de SALT (500 frases por dirección), lo que permite evaluar su utilidad real frente a una línea base trivial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder pre-LN, 6 + 6 capas, d_model 640, 8 cabezas, FFN 2560, activación GELU |
| Parametros totales | 89.418.240 (89M); embeddings de entrada, de decoder y proyección de salida atados |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 posiciones (codificación sinusoidal); los pares de entrenamiento se limitaron a 128 piezas por lado |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | runyankole (nyn) y ateso (teo) |
| Licencia | MIT |
| Formato de pesos | `model.safetensors` (float32); tokenizador SentencePiece (`spm.model`) |

## Arquitectura y entrenamiento

La arquitectura es un Transformer encoder-decoder estándar con normalización previa (pre-LN), seis capas en encoder y seis en decoder, dimensión de modelo 640, ocho cabezas de atención y FFN de 2560 con activación GELU. Los embeddings de entrada, los del decoder y la proyección de salida están atados, lo que reduce el recuento de parámetros. El tokenizador es un SentencePiece unigram compartido de 32.000 piezas, entrenado solo con texto runyankole y ateso, que preserva mayúsculas y separa dígitos. La posición se codifica de forma sinusoidal hasta 256 posiciones.

El entrenamiento se realizó en dos fases. La primera, correspondiente a `atella_base`, consistió en 5 épocas y 17.426 pasos de optimizador sobre los pares runyankole-ateso del dataset `tulati`, en ambas direcciones; en ese corpus toda columna no inglesa es una traducción automática de una columna inglesa generada por `Sunbird/translate-nllb-1.3b-salt`, por lo que ambos lados de cada par de preentrenamiento son salida de máquina. La segunda fase, que da lugar a este modelo, afina sobre los pares runyankole-ateso traducidos por humanos del conjunto de entrenamiento SALT. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Traducción directa runyankole → ateso y ateso → runyankole sin pivote por inglés, con la dirección seleccionada mediante prefijo (`nyn2teo` / `teo2nyn`).
- Traducción por lotes: la función `translate` acepta una cadena o una lista de cadenas.
- Decodificación por búsqueda de haz configurable (por defecto `beam=4`).
- Manejo de mayúsculas y dígitos gracias al tokenizador SentencePiece con separación de dígitos.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- No dispone de modo de pensamiento (thinking), visión ni audio.
- Bilingüe estricto: no cubre otros idiomas distintos de nyn y teo.

## Casos de uso

- Traducción de documentación comunitaria entre runyankole y ateso: el modelo permite convertir materiales escritos en una lengua a la otra sin depender de un pivote inglés, lo que evita la propagación de errores de una segunda traducción intermedia.
- Preservación y difusión de contenido cultural: traducción de textos orales transcritos, relatos y material educativo entre ambas lenguas con un modelo que cabe en una GPU de consumo.
- Atención ciudadana bilingüe en regiones donde conviven ambas lenguas: traducción de avisos, formularios y comunicados oficiales con latencia baja gracias al tamaño reducido del modelo.
- Investigación en traducción de bajos recursos: sirve como línea base reproducible y como punto de partida para experimentos de aumento de datos o ajuste fino sobre nuevos pares humanos.
- Subtitulado y transcripción multilingüe: integración en un pipeline que transcriba audio en una lengua y traduzca al otro idioma del par para generar subtítulos.
- Herramientas de aprendizaje de lenguas: generación de ejemplos y traducciones de referencia para aplicaciones de estudio de runyankole y ateso, con la advertencia de revisión humana por la tasa de error del modelo.
- Procesamiento por lotes sin conexión: al ser un modelo de 89M en float32 (unos 0,4 GB de repo), puede ejecutarse en CPU para volcar traducciones de corpus completos sin infraestructura de GPU.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre los conjuntos completos de SALT (500 frases por dirección), con beam 4 y sacreBLEU 2.5.1. El test es la métrica principal; dev se usó para detener el entrenamiento y elegir el checkpoint, por lo que sus cifras son ligeramente optimistas.

| Split | Dirección | Sistema | n | BLEU | chrF | chrF++ |
|---|---|---|---|---|---|---|
| test | nyn→teo | modelo | 500 | 15,47 | 47,23 | 44,01 |
| test | nyn→teo | línea base de copia | 500 | 0,41 | 15,79 | 13,28 |
| test | teo→nyn | modelo | 500 | 10,19 | 45,46 | 40,60 |
| test | teo→nyn | línea base de copia | 500 | 0,40 | 14,87 | 12,69 |
| dev | nyn→teo | modelo | 500 | 16,27 | 48,33 | 45,11 |
| dev | nyn→teo | línea base de copia | 500 | 0,23 | 15,99 | 13,54 |
| dev | teo→nyn | modelo | 500 | 10,08 | 46,60 | 41,85 |
| dev | teo→nyn | línea base de copia | 500 | 0,22 | 15,13 | 12,99 |

Firmas de las métricas: BLEU `nrefs:1|case:mixed|eff:no|tok:13a|smooth:exp|version:2.5.1`; chrF `nrefs:1|case:mixed|eff:yes|nc:6|nw:0|space:no|version:2.5.1`; chrF++ `nrefs:1|case:mixed|eff:yes|nc:6|nw:2|space:no|version:2.5.1`. No se ejecutó una línea base con pivote por inglés. El autor advierte que diferencias de 1 a 2 BLEU sobre unos cientos de frases están dentro del ruido.

## Requisitos de hardware

- VRAM estimada para inferencia: en float32, los 89,4M de parámetros ocupan aproximadamente 0,36 GB; con overhead de activaciones y decodificación por haz, el consumo real es de alrededor de 1 GB o menos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está muy por debajo de su capacidad.
- Cabe holgadamente en GPU de consumo, incluidas GTX 1650, RTX 3050 y superiores; también puede ejecutarse en CPU para uso por lotes.
- Opciones de despliegue: el modelo es PyTorch personalizado y no se carga con `AutoModel` de `transformers`; se usa mediante la clase `Translator` incluida en el repositorio, con dependencias `torch`, `sentencepiece`, `safetensors` y `huggingface_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| atella_finetuned | 89M | 256 | nyn, teo | MIT | Traducción directa nyn↔teo sin pivote |
| Sunbird/translate-nllb-1.3b-salt | 1,3B | no disponible | multilingüe (incluye lenguas ugandesas) | no disponible | Traducción multilingüe basada en NLLB, usada para generar el corpus de preentrenamiento |
| atella_base | 89M | 256 | nyn, teo | MIT | Preentrenamiento solo con pares de traducción automática; base de este modelo |

No se dispone de datos de benchmarks de `Sunbird/translate-nllb-1.3b-salt` ni de `atella_base` en la información proporcionada, por lo que no es posible comparar rendimiento numérico entre ellos.

## Limitaciones y advertencias

- Calidad moderada: BLEU de 15,47 en nyn→teo y 10,19 en teo→nyn sobre test; los ejemplos publicados muestran errores léxicos y de estructura considerables, por lo que la salida requiere revisión humana en contextos sensibles.
- Riesgo de alucinación y de deriva semántica: al entrenarse sobre pares mayoritariamente sintéticos en la fase de preentrenamiento, el modelo puede producir traducciones fluidas pero alejadas del original.
- Sesgos de dominio: el corpus `tulati` procede de traducciones automáticas de una única columna inglesa, lo que puede introducir sesgos de estilo y de contenido heredados de ese material y del sistema NLLB empleado.
- Limitación de contexto: 256 posiciones y pares de entrenamiento de 128 piezas por lado; las frases largas pueden truncarse o degradar la calidad.
- Cobertura lingüística estricta: solo runyankole y ateso; no traduce desde o hacia el inglés ni otros idiomas.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías sobre la calidad ni sobre los derechos de los datos de entrenamiento subyacentes.
- Integración limitada: al no ser un modelo `transformers`, requiere el código personalizado del repositorio y no es compatible con herramientas estándar de serving sin adaptación.
- Sin datos de latencia ni throughput publicados, lo que dificulta planificar despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amDANIEL2024/atella_finetuned
- Modelo base: https://huggingface.co/amDANIEL2024/atella_base
- Dataset de preentrenamiento: https://huggingface.co/datasets/amDANIEL2024/tulati
- Sistema de traducción usado para generar el corpus: https://huggingface.co/Sunbird/translate-nllb-1.3b-salt
