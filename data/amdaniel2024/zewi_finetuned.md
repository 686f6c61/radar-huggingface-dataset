# amDANIEL2024/zewi_finetuned

## Resumen

`zewi_finetuned` es un modelo de traducción automática neuronal de tipo encoder-decoder Transformer con 89 millones de parámetros, desarrollado por el usuario amDANIEL2024. Su particularidad es que traduce de forma directa entre runyankole (nyn) y acholi (ach), dos lenguas bantúes de Uganda, sin pasar por el inglés en ningún extremo del pipeline. La dirección de traducción se controla mediante un token de prefijo en la fuente (`<2ach>` o `<2nyn>`), lo que permite un único modelo bidireccional.

El modelo parte de `amDANIEL2024/zewi_base`, preentrenado sobre pares traducidos automáticamente del dataset `tulati`, y se afina sobre los pares Runyankole-Acholi traducidos por humanos del split de entrenamiento de SALT. Se distribuye con licencia MIT y pesos en safetensors en float32, con un tokenizador SentencePiece compartido de 32.000 piezas.

Es relevante porque cubre un par de lenguas de bajos recursos que habitualmente dependen de pivotes vía inglés, y porque publica métricas de evaluación sobre el conjunto de test de SALT con líneas base de copia, lo que permite calibrar el rendimiento real frente a la superposición superficial entre ambas lenguas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder pre-LN, 6 + 6 capas, d_model 640, 8 cabezas, FFN 2560, activación GELU |
| Parametros totales | 89.418.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 posiciones (embeddings sinusoidales); pares de entrenamiento limitados a 128 piezas por lado |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | runyankole (nyn), acholi (ach) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, float32); tokenizador SentencePiece (`spm.model`) |

## Arquitectura y entrenamiento

El modelo es un Transformer encoder-decoder estándar con normalización pre-LN, seis capas en el encoder y seis en el decoder, dimensión de modelo 640, ocho cabezas de atención y FFN de 2560 con activación GELU. Los embeddings de entrada, los del decoder y la proyección de salida están atados (*tied*), lo que reduce el recuento de parámetros. Usa embeddings posicionales sinusoidales con un máximo de 256 posiciones. El tokenizador es un SentencePiece unigram compartido de 32.000 piezas, con preservación de mayúsculas y separación de dígitos, entrenado únicamente sobre texto en runyankole y acholi.

El entrenamiento se organiza en dos etapas. La primera es el preentrenamiento de `zewi_base` sobre los pares Runyankole-Acholi del dataset `tulati` usados en ambas direcciones; en `tulati` las columnas no inglesas son traducciones automáticas. La segunda etapa es el afinamiento sobre los pares traducidos por humanos del split de entrenamiento de SALT, seleccionando el checkpoint con menor pérdida en el split de desarrollo. La model card no detalla el volumen de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La dirección se especifica con un prefijo en la fuente y la decodificación por defecto es beam search con anchura 4 y penalización de longitud 0,6.

## Capacidades

- Traducción directa bidireccional runyankole → acholi y acholi → runyankole sin pivote por inglés.
- Un único modelo cubre ambas direcciones mediante el prefijo `<2ach>` o `<2nyn>` en la oración fuente.
- Acepta entrada como cadena individual o como lista de cadenas.
- Decodificación configurable con beam search (anchura por defecto 4).
- Tokenizador compartido para ambas lenguas con preservación de mayúsculas y separación de dígitos.
- No soporta tool calling ni function calling.
- No incorpora modo de razonamiento (*thinking*), agentes ni razonamiento multi-paso.
- No dispone de capacidades de visión, audio ni multimodalidad.
- No se documentan capacidades multilingües más allá de nyn y ach.

## Casos de uso

- Traducción de documentación comunitaria: el modelo puede traducir textos administrativos o sanitarios entre runyankole y acholi para programas de cooperación en Uganda, al evitar el pivote por inglés y reducir la acumulación de errores en cadena.
- Localización de contenidos educativos: permite generar versiones en acholi de materiales redactados en runyankole (y viceversa) para escuelas de zonas donde se habla cada lengua, con revisión humana posterior dado el BLEU moderado.
- Preservación lingüística y corpus paralelos: útil para generar borradores de pares alineados que después se corrigen manualmente, ampliando recursos para estas lenguas de bajos recursos.
- Atención ciudadana bilingüe: integrado en un servicio de mensajería, puede traducir consultas de hablantes de acholi a runyankole para agentes que solo dominan esta última, con contexto suficiente para frases y párrafos cortos (hasta 128 piezas por lado en entrenamiento).
- Investigación en traducción de bajos recursos: sirve como línea base reproducible para comparar arquitecturas o estrategias de aumento de datos en pares bantúes, gracias a sus métricas publicadas sobre SALT.
- Subtitulado y transcripción de material audiovisual: traducción de subtítulos cortos entre ambas lenguas para archivos de radio o vídeo comunitario, donde las oraciones suelen encajar en la ventana de contexto.
- Prototipado de pipelines de traducción sin dependencia de servicios en la nube: al ser un modelo de 89M parámetros con licencia MIT, puede desplegarse en infraestructura propia o en local para pruebas de integración.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre SALT, con sacreBLEU 2.5.1, beam 4, penalización de longitud 0,6 y checkpoint `finetune/best.pt`.

| Split | Direccion | Sistema | n | BLEU | chrF | chrF++ |
|---|---|---|---|---|---|---|
| test | nyn→ach | zewi_finetuned | 500 | 14,30 | 39,72 | 37,31 |
| test | nyn→ach | copy baseline | 500 | 0,14 | 14,61 | 11,73 |
| test | ach→nyn | zewi_finetuned | 500 | 9,64 | 44,25 | 39,44 |
| test | ach→nyn | copy baseline | 500 | 0,14 | 12,73 | 10,48 |
| dev | nyn→ach | zewi_finetuned | 500 | 14,49 | 40,52 | 38,18 |
| dev | nyn→ach | copy baseline | 500 | 0,21 | 14,88 | 12,03 |
| dev | ach→nyn | zewi_finetuned | 500 | 9,43 | 45,05 | 40,39 |
| dev | ach→nyn | copy baseline | 500 | 0,21 | 12,76 | 10,60 |

No se evaluaron otros sistemas ni se ejecutó una línea base con pivote por inglés. No hay resultados de MMLU, HumanEval ni GSM8K, que no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: en torno a 0,36 GB solo para pesos (89,4M × 4 bytes), más memoria para activaciones y beam search; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU moderna es suficiente; una RTX 4090, A100 o H100 quedan sobredimensionadas para este modelo. Una GTX 1650 o una T4 ya ofrecen margen amplio.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada e incluso en CPU para lotes pequeños.
- Opciones de despliegue: al ser un modelo PyTorch personalizado (no `transformers`), no se carga con `AutoModel`; se usa la clase `Translator` incluida en el repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la información proporcionada. La model card indica explícitamente que no se evaluó ningún otro sistema ni una línea base con pivote por inglés, por lo que no es posible ofrecer una comparativa cuantitativa con alternativas.

| Modelo | Parametros | Contexto | BLEU test nyn→ach | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zewi_finetuned | 89,4M | 256 | 14,30 | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El BLEU en test es moderado (14,30 en nyn→ach y 9,64 en ach→nyn), lo que indica que las traducciones requieren revisión humana antes de uso en producción sensible.
- Los ejemplos de la model card muestran errores claros, incluidas repeticiones ("motoka motoka motoka") y desviaciones semánticas respecto a la referencia.
- Riesgo de alucinación y de deriva semántica en frases largas o con estructuras poco frecuentes.
- Contexto limitado a 256 posiciones y pares de entrenamiento de hasta 128 piezas por lado; no apto para documentos largos sin segmentación.
- Solo cubre runyankole y acholi; no traduce desde o hacia inglés ni otras lenguas.
- El preentrenamiento se realizó sobre pares traducidos automáticamente en `tulati`, lo que puede propagar sesgos y errores del sistema de traducción automática original.
- El afinamiento se hizo sobre el split de entrenamiento de SALT; el rendimiento fuera de ese dominio (texto jurídico, técnico o coloquial) no está caracterizado.
- Licencia MIT: permite uso comercial, pero no se documentan garantías ni evaluación de sesgos.
- Es un modelo PyTorch personalizado, no compatible con el ecosistema `transformers`; esto limita su integración con herramientas estándar de despliegue.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amDANIEL2024/zewi_finetuned
- Modelo base: https://huggingface.co/amDANIEL2024/zewi_base
- Dataset tulati: https://huggingface.co/datasets/amDANIEL2024/tulati
