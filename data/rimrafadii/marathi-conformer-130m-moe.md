# rimrafadii/marathi-conformer-130m-moe

## Resumen

El modelo `marathi-conformer-130m-moe` es un sistema de reconocimiento automático del habla (ASR) especializado en maratí, desarrollado por el usuario de Hugging Face `rimrafadii`. Se trata de un Conformer de 12 capas con atención de 8 cabezas y tamaño de kernel 31, que incorpora una mezcla de expertos (MoE) dispersa y jerárquica en sus capas superiores (5 a 12). El modelo está condicionado por dialecto, de modo que el enrutamiento dinámico a nivel de frame dirige las características fonéticas regionales hacia expertos especializados.

Con 130,8 millones de parámetros totales y 98,9 millones activos por pasada forward, el modelo declara una reducción del 24,4 % en FLOPs frente a baselines densos de capacidad equivalente. Según la model card, supera en precisión a modelos mucho mayores, como IndicConformer-600M, en el conjunto de evaluación RESPIN, con un WER agregado del 19,04 % frente al 24,16 % del modelo de 600M.

El modelo es relevante porque aborda un problema poco cubierto: el reconocimiento de variedades dialectales del maratí (malvani, ahirani, varhadi y estándar) con un coste computacional reducido. Su licencia MIT y su tamaño contenido lo hacen candidato para despliegues en producción con recursos limitados, aunque la información pública disponible es escasa y el modelo cuenta con muy pocas descargas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer (12 capas, d_model=512, 8 cabezas de atención, kernel 31) con MoE dispersa jerárquica en capas 5-12 |
| Parámetros totales | 130,8 M |
| Parámetros activos | 98,9 M por pasada forward |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | maratí (mr) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0,5 GB) |

## Arquitectura y entrenamiento

La arquitectura base es un Conformer de 12 capas con dimensión de modelo 512, 8 cabezas de atención y tamaño de kernel convolucional 31, orientado a tareas de ASR con decodificación CTC (la etiqueta `ctc` aparece en los tags del modelo). Sobre esta base se introduce una mezcla de expertos dispersa y jerárquica: las capas 5 a 12 incorporan 3 expertos fonológicos dedicados más un tronco compartido combinador. El enrutamiento es top-1 dinámico y autónomo a nivel de frame, de forma que cada frame se dirige al experto dialectal correspondiente según sus características fonéticas.

El modelo se presenta como condicionado por dialecto y se ha evaluado sobre el conjunto RESPIN, que cubre las variedades malvani (D1), ahirani (D2), estándar (D3) y varhadi (D4). Los conjuntos de datos citados en la model card son `rimrafadii/respin-iisc`, `ai4bharat/Kathbath` y `ARTPARK-IISc/Vaani`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (poco habituales en ASR). La evaluación se realizó bajo el protocolo de normalización `mr-norm-1` (descomposición Unicode NFC, mapeo de numerales devanagari ०-९ a 0-9, eliminación de puntuación y dandas, y conversión a minúsculas del latín).

## Capacidades

- Reconocimiento automático del habla en maratí con decodificación CTC.
- Reconocimiento condicionado por dialecto: variedades malvani, ahirani, varhadi y maratí estándar.
- Enrutamiento dinámico a nivel de frame hacia expertos fonológicos especializados.
- Inferencia con menor coste computacional que modelos densos de capacidad equivalente (98,9 M parámetros activos frente a 130,8 M totales).
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales (visión o audio más allá del propio ASR).
- Capacidad multilingüe: limitada al maratí según los metadatos del modelo.

## Casos de uso

- Transcripción de audio en maratí estándar: el modelo ofrece un WER del 11,60 % en la variedad estándar (D3) del conjunto RESPIN, adecuado para subtitulado y generación de actas en entornos de habla culta.
- Subtitulado y transcripción de contenido dialectal: con WER del 24,65 % (malvani), 20,74 % (ahirani) y 18,85 % (varhadi), es útil para digitalizar archivos orales regionales donde los modelos genéricos fallan.
- Atención al cliente en maratí: al ser un modelo CTC ligero (98,9 M parámetros activos), puede desplegarse en servidores modestos para transcribir llamadas y alimentar sistemas de análisis de conversaciones.
- Archivística y preservación lingüística: permite transcribir grabaciones de campo de variedades dialectales poco representadas, aprovechando el enrutamiento por experto para separar patrones fonéticos regionales.
- Procesamiento por lotes de audio a gran escala: la reducción de FLOPs (24,4 % frente a baselines densos) abarata la transcripción masiva de horas de audio en pipelines de datos.
- Integración en asistentes de voz embebidos: el tamaño contenido (repo de 0,5 GB) y la licencia MIT facilitan su inclusión en productos comerciales de dictado o comandos por voz en maratí.
- Investigación en ASR dialectal: sirve como referencia reproducible para estudiar enrutamiento MoE a nivel de frame en lenguas de bajos recursos.

## Benchmarks y rendimiento

Resultados declarados en la model card sobre el conjunto RESPIN (WER, menor es mejor):

| Modelo | Parámetros totales | Parámetros activos | D1 (Malvani) | D2 (Ahirani) | D3 (Estándar) | D4 (Varhadi) | WER agregado |
|---|---|---|---|---|---|---|---|
| IndicConformer-600M | 600 M | 600 M | 35,66 % | 30,50 % | 14,20 % | 29,10 % | 24,16 % |
| SraVaani-1.0 | 100 M | 100 M | 39,20 % | 33,10 % | 16,50 % | 31,80 % | 30,15 % |
| Dense Conformer-512 | 130,8 M | 130,8 M | 45,29 % | 42,41 % | 31,33 % | 39,90 % | 39,82 % |
| Scaled MoE Conformer (este modelo) | 130,8 M | 98,9 M | 24,65 % | 20,74 % | 11,60 % | 18,85 % | 19,04 % |

No se han publicado en la información disponible resultados de benchmarks adicionales (por ejemplo, sobre otros conjuntos como Common Voice o Kathbath) más allá de los anteriores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 130,8 M parámetros totales, en fp32 ocuparía aproximadamente 0,5 GB de pesos, y en fp16 alrededor de 0,26 GB, a lo que habría que sumar memoria para activaciones y buffers de audio.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 2-4 GB de VRAM debería ser suficiente para inferencia en fp16, incluyendo GTX 1650, RTX 3050, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de tarjetas consumer modernas, dado el reducido número de parámetros.
- Opciones de despliegue: no se documentan en la información disponible; al ser un modelo CTC estándar, sería compatible con frameworks habituales de ASR (por ejemplo, NeMo o Hugging Face Transformers con soporte Conformer), pero esto no está confirmado por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER agregado (RESPIN) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Scaled MoE Conformer (este modelo) | 130,8 M (98,9 M activos) | no disponible | 19,04 % | MIT | Hugging Face |
| IndicConformer-600M | 600 M | no disponible | 24,16 % | no disponible | no disponible en la información |
| SraVaani-1.0 | 100 M | no disponible | 30,15 % | no disponible | no disponible en la información |
| Dense Conformer-512 | 130,8 M | no disponible | 39,82 % | no disponible | no disponible en la información |

## Limitaciones y advertencias

- El modelo solo soporta maratí; no se ha validado para otras lenguas ni para code-switching.
- Los WER en dialectos siguen siendo elevados en términos absolutos (20-25 % en malvani y ahirani), lo que limita su uso en producción sin revisión humana en esos casos.
- No se documentan sesgos específicos, pero al entrenarse con datasets concretos (RESPIN, Kathbath, Vaani) puede heredar sesgos de género, edad o registro de esas fuentes.
- Riesgo de alucinación en ASR: el decodificado CTC puede producir transcripciones plausibles pero incorrectas en audio ruidoso o con acentos no representados.
- La información pública es muy escasa: no se detallan datos de entrenamiento, hiperparámetros, contexto máximo de audio ni formato de pesos, lo que dificulta la reproducibilidad.
- El modelo tiene muy pocas descargas (21) y ningún "like", por lo que no cuenta con validación comunitaria independiente.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar las licencias de los datasets de entrenamiento antes de un despliegue comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rimrafadii/marathi-conformer-130m-moe
- Dataset RESPIN-IISc: https://huggingface.co/datasets/rimrafadii/respin-iisc
- Dataset Kathbath (AI4Bharat): https://huggingface.co/datasets/ai4bharat/Kathbath
- Dataset Vaani (ARTPARK-IISc): https://huggingface.co/datasets/ARTPARK-IISc/Vaani
