# rikai-translate/rikai-jp-eng-Bench-265-1.4B

## Resumen

rikai jp<->eng Bench 265 1.4B es un modelo de traducción bidireccional japonés-inglés desarrollado por el proyecto rikai-translate. Se trata de un ajuste fino (finetune) del modelo CAT-Translate-1.4B de CyberAgent, entrenado con la misma receta, datos y evaluación que su hermano menor de 0,8B. El modelo resuelve la tarea de traducción automática en ambos sentidos (ja→en y en→ja) con un tamaño compacto de 1.407.538.944 parámetros, lo que lo hace apto para inferencia en dispositivos locales.

La relevancia de este modelo radica en su relación calidad-velocidad: según la model card, iguala a CAT-Translate-3.3B en la mayoría de métricas automáticas con una velocidad de decodificación 2,4 veces mayor. Además, el autor corrige dos problemas del modelo base original: la configuración de `rope_theta` que fallaba en MLX y un tokenizador que dividía el japonés en caracteres individuales. El repositorio incluye pesos en safetensors fp16 y una versión cuantizada en MLX de 8 bits para Apple Silicon.

El modelo emplea una arquitectura tipo Llama con enmascaramiento prefix-LM, soporta únicamente japonés e inglés, y se distribuye bajo licencia MIT, lo que facilita su uso comercial. Está etiquetado para generación de texto, traducción y despliegue on-device.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama con prefix-LM |
| Parametros totales | 1.407.538.944 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (safetensors), MLX 8-bit affine con group size 64 |
| Idiomas soportados | japonés (ja), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (fp16), MLX (8-bit) |

## Arquitectura y entrenamiento

El modelo se basa en CAT-Translate-1.4B de CyberAgent, un transformer tipo Llama adaptado para traducción mediante enmascaramiento prefix-LM. El ajuste fino utiliza exactamente la misma receta, datos y evaluación que el modelo rikai de 0,8B, aunque la model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset. Se sabe que los datos de entrenamiento fueron filtrados contra el conjunto de evaluación mediante shingles de 12 caracteres para evitar contaminación.

Una innovación técnica destacable es la corrección del modelo base para su uso en MLX: se fija `rope_theta: 500000` de forma plana en la configuración (el original solo lo almacenaba bajo `rope_parameters`, lo que provocaba que mlx-lm usara 10000 por defecto) y se sustituyen los ficheros del tokenizador por los de CAT-Translate-0.8B, que no dividen el japonés en caracteres individuales. El modelo requiere el uso de una máscara de prefijo (prefix mask) durante la decodificación, tal como se indica en la sección de uso de la model card. No se menciona el uso de RLHF o DPO en la información disponible.

## Capacidades

- Traducción bidireccional japonés-inglés (ja→en y en→ja) en 26 dominios distintos, incluyendo negocios, medicina, legal, noticias, redes sociales, manga y literatura.
- Generación de texto condicionada por prefijo (prefix-LM) para tareas de traducción.
- Despliegue on-device gracias a su tamaño compacto y a la versión cuantizada en MLX 8-bit.
- Inferencia en Apple Silicon mediante `mlx_lm`.
- Compatibilidad con `transformers` y con text-generation-inference (según los tags del repositorio).
- Soporte de decodificación greedy con máscara de prefijo para obtener los resultados reportados.
- No se mencionan capacidades de tool calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Traducción de documentación técnica y manuales entre japonés e inglés: el modelo cubre dominios como negocios y medicina, y su ventana de contexto (no especificada) permite procesar documentos completos o líneas individuales, según la evaluación realizada sobre documentos enteros y líneas sueltas.
- Localización de contenidos de comercio electrónico y reseñas de usuarios: la evaluación incluye conjuntos de WMT23 de e-commerce y user reviews, por lo que el modelo está ajustado para este tipo de texto.
- Traducción de diálogos de atención al cliente: el conjunto BSD business dialogue se usa en la evaluación, lo que indica capacidad para conversaciones multi-turno en entornos empresariales.
- Interpretación judicial y legal: el conjunto de court interpreting está presente en la batería de evaluación, lo que respalda su uso en contextos legales donde se requiere precisión terminológica.
- Traducción de manga y contenido literario: los conjuntos OpenMantra manga pages y WMT24++ literary forman parte de la evaluación, lo que lo hace adecuado para traducción de cómics y prosa.
- Procesamiento de texto médico: el conjunto EJMMT medical se incluye en la evaluación, permitiendo su uso en traducción de informes y documentación clínica.
- Despliegue en aplicaciones locales para macOS: la versión MLX 8-bit de 1,5 GB permite ejecutar traducción en tiempo real en Apple Silicon con una velocidad de 147 tok/s en un M4 Pro.
- Traducción de noticias y discursos: los conjuntos WMT23 news, speech y WMT24++ news/speech respaldan este caso de uso.

## Benchmarks y rendimiento

| Metrica | rikai 1.4B | rikai 0.8B | CAT-0.8B | CAT-1.4B | CAT-3.3B-β | CAT-3.3B | CAT-7B |
|---|---|---|---|---|---|---|---|
| 26-domain gate, CometKiwi ↑ | 0.8425 | 0.8384 | 0.8304 | 0.8353 | 0.8420 | 0.8430 | 0.8430 |
| 26-domain gate, MetricX-24-QE error ↓ | 2.75 | 2.85 | 3.29 | 3.04 | 2.89 | 2.76 | 2.78 |
| 26-domain gate, MetricX-24 error ↓ | 3.16 | 3.34 | 3.83 | 3.51 | 3.31 | 3.14 | 3.14 |
| 26-domain gate, COMET-22 ↑ | 0.8632 | 0.8568 | 0.8455 | 0.8513 | 0.8582 | 0.8616 | 0.8645 |
| 26-domain gate, BLEU ↑ | 23.88 | 22.02 | 21.13 | 19.41 | 23.14 | 23.22 | 26.07 |
| 26-domain gate, chrF++ ↑ | 38.33 | 36.88 | 35.62 | 35.31 | 38.06 | 38.31 | 40.17 |
| Blind 500, CometKiwi ↑ | 0.8081 | 0.8020 | 0.7944 | 0.7992 | 0.8064 | 0.8046 | 0.8061 |
| Blind 500, MetricX-24-QE (1 − err/25) ↑ | 0.8684 | 0.8586 | 0.8391 | 0.8493 | 0.8562 | 0.8604 | 0.8663 |
| Blind 500 en→ja, MetricX-24-QE ↑ | 0.8475 | 0.8436 | 0.8101 | 0.8279 | 0.8286 | 0.8428 | 0.8503 |
| LLM judge (Sonnet 5.5), score 0–100 ↑ | 66.9 | 60.3 | 58.5 | 60.6 | 70.4 | 71.6 | 73.4 |
| LLM judge, errores críticos ↓ | 3.8% | 6.2% | 7.4% | 7.8% | 3.2% | 2.0% | 1.4% |
| Velocidad de decodificación, tok/s (M4 Pro, MLX 8-bit) ↑ | 147 | 217 | 218 | 146 | 61 | 61 | 28 |

La evaluación principal (26-domain gate) consta de 1.550 elementos con referencias humanas en 26 conjuntos, sin contaminación con datos de entrenamiento. La velocidad se midió el 2026-11-03 con dos rondas de 40 elementos cada una para los modelos de 1.4B. El LLM judge utiliza Claude Sonnet 5.5 sobre 500 elementos ciegos (350 ja→en, 150 en→ja), con cada elemento evaluado dos veces en lotes barajados.

## Requisitos de hardware

- VRAM estimada para fp16: aproximadamente 2,8 GB para los pesos, más overhead de activaciones y contexto (no especificado).
- VRAM estimada para MLX 8-bit: 1,5 GB.
- GPU recomendadas: no se especifican GPU NVIDIA en la información; las pruebas se realizaron en Apple Silicon (M4 Pro).
- Cabe en GPU de consumo: sí, tanto en fp16 (~2,8 GB) como en 8-bit (1,5 GB), aunque no se detallan modelos concretos de GPU de consumo.
- Opciones de despliegue: `transformers` (con máscara de prefijo), `mlx_lm` en Apple Silicon, y text-generation-inference según los tags del repositorio.
- Latencia y throughput: 147 tok/s en M4 Pro con MLX 8-bit para el modelo de 1.4B; 146 tok/s para CAT-1.4B en las mismas condiciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CometKiwi (gate) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rikai jp<->eng Bench 265 1.4B | 1.4B | no disponible | 0.8425 | MIT | Hugging Face |
| rikai jp<->eng Bench 265 0.8B | 0.8B | no disponible | 0.8384 | MIT | Hugging Face |
| CAT-Translate-1.4B | 1.4B | no disponible | 0.8353 | no disponible | Hugging Face |
| CAT-Translate-3.3B | 3.3B | no disponible | 0.8430 | no disponible | Hugging Face |
| CAT-Translate-7B | 7B | no disponible | 0.8430 | no disponible | Hugging Face |

El modelo rikai 1.4B supera a CAT-Translate-1.4B en todas las métricas automáticas reportadas y se acerca a CAT-Translate-3.3B, con una velocidad de decodificación muy superior (147 tok/s frente a 61 tok/s). Frente a CAT-Translate-7B, queda por debajo en BLEU, chrF++ y LLM judge, pero es mucho más rápido (147 frente a 28 tok/s) y más pequeño.

## Limitaciones y advertencias

- Solo soporta japonés e inglés; no se ha entrenado para otros idiomas.
- El LLM judge prefiere los modelos CAT de 3.3B en adelante, con una puntuación de 66,9 frente a 70,4-73,4, y un 3,8% de traducciones con error crítico frente al 1,4-3,2% de los modelos mayores.
- Requiere el uso de una máscara de prefijo durante la decodificación para obtener los resultados reportados; su omisión puede degradar la calidad.
- El modelo base original presentaba problemas en MLX (rope_theta incorrecto y tokenizador que dividía el japonés en caracteres); este repositorio ya los corrige, pero los usuarios deben asegurarse de usar la configuración y el tokenizador incluidos.
- No se dispone de información sobre sesgos específicos, riesgo de alucinación en traducción ni limitaciones de longitud de contexto.
- La licencia MIT permite uso comercial, pero se recomienda verificar las condiciones del modelo base CAT-Translate-1.4B de CyberAgent.
- No se han publicado datos sobre rendimiento en dominios fuera de los 26 conjuntos evaluados.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/rikai-translate/rikai-jp-eng-Bench-265-1.4B)
- [Modelo hermano de 0.8B](https://huggingface.co/rikai-translate/rikai-jp-eng-Bench-265-0.8B)
- [Modelo base CAT-Translate-1.4B](https://huggingface.co/cyberagent/CAT-Translate-1.4b)
- [Resultados por dominio](https://huggingface.co/rikai-translate/rikai-jp-eng-Bench-265-1.4B/blob/main/per_domain_results.md)
- [Paper de referencia (arXiv:2606.21413)](https://arxiv.org/abs/2606.21413)
