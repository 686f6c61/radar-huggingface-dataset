# FrankLiuDundun/voxcpm-finetune-lora-r5

## Resumen

voxcpm-finetune-lora-r5 es un ajuste fino con LoRA sobre el modelo de síntesis de voz openbmb/VoxCPM2, publicado por el usuario FrankLiuDundun. Su objetivo es el doblaje multilingüe: adaptar el modelo base a cinco idiomas de destino (tailandés, vietnamita, indonesio, malayo y tagalo) manteniendo el funcionamiento en chino e inglés, con un protocolo de inferencia alineado con el pipeline de producción de OmniVoice (cue de una sola frase, referencia solo cross-lingual, cfg 1.8 y 20 pasos). El repositorio contiene el modelo completo con la LoRA ya fusionada en la raíz (2.290.004.544 parámetros, 5,1 GB) y, por separado, el delta LoRA en `lora/`.

El modelo se distribuye bajo licencia Apache-2.0 y está etiquetado con la librería `voxcpm`. La relevancia de esta ficha es doble: por un lado, documenta un caso real de adaptación LoRA multilingüe para TTS; por otro, el propio autor declara que esta revisión (r5) es experimental y **no ha superado la aceptación offline**, con una regresión severa en indonesio (CER de 0,0230 a 0,1016 en casos de habla espontánea) y una deriva en chino (0,0580 a 0,0864). Para producción recomienda la revisión r2 (FrankLiuDundun/voxcpm-finetune-lora).

No hay información pública sobre la arquitectura interna del modelo base, la longitud de contexto, los formatos de cuantización ni el rendimiento en benchmarks estándar de texto o código. Los únicos datos cuantitativos disponibles son las métricas de aceptación en tareas de TTS que se recogen más abajo.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible a nivel de detalle; es una adaptación LoRA de openbmb/VoxCPM2 (TTS). La configuración LoRA activa los módulos `enable_lm` y `enable_dit`, lo que apunta a un diseño con componente de lenguaje y transformador de difusión |
| Parámetros totales | 2.290.004.544 (2,29 B), medidos sobre los pesos safetensors |
| Longitud de contexto | no disponible; las muestras de entrenamiento son cues de doblaje de 1-3 s |
| Tipos de cuantización | no disponible; no se declara la precisión de los pesos safetensors |
| Idiomas soportados | th, vi, id, ms, tl, zh, en |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors; modelo completo fusionado en la raíz y delta LoRA en `lora/` (`lora_weights.safetensors` + `lora_config.json`) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura del modelo base más allá de su naturaleza TTS. Lo que sí se publica es la configuración del adaptador LoRA: rango 64, alpha 64, dropout 0,05, con `enable_lm=true`, `enable_dit=true` y `enable_proj=false`. Esto indica que la adaptación afecta a los módulos de lenguaje y de difusión del modelo, pero no a las proyecciones. El entrenamiento se realizó durante 1 época y 3267 pasos, con learning rate 1e-4 y batch efectivo de 16 (batch 2 con acumulación de gradiente 8). El repositorio raíz contiene el modelo con la LoRA ya fusionada, de modo que `from_pretrained` carga directamente los pesos completos; la carpeta `lora/` conserva el delta por separado.

Respecto a los datos, esta revisión añade cuatro fuentes nuevas respecto a r2 para acercar la distribución de longitudes a los cues reales de doblaje de 1-3 s: Common Voice 22 (espejo comunitario, CC0) con 25,2 h de tailandés, 7,2 h de indonesio y 1,4 h de vietnamita; y un corte de YODAS2-Sidon de 1,1 h para malayo, el primer corpus de habla espontánea en ese idioma. Todas las muestras se recortaron con un hard trim de 0,15 s de silencio final. El conjunto de entrenamiento se completa con FLEURS (CC-BY-4.0), GigaSpeech 2 (Apache-2.0), la serie YODAS y AISHELL-3 (Apache-2.0). El autor indica que no se ha usado ninguna fuente CC-BY-SA, NC o ND, por lo que los pesos son redistribuibles. No se documenta uso de RLHF, DPO ni de decodificación especulativa.

## Capacidades

- Síntesis de voz (TTS) multilingüe en tailandés, vietnamita, indonesio, malayo, tagalo, chino e inglés.
- Doblaje con cues de una sola frase, el formato objetivo del ajuste (longitudes de referencia de 1-3 s).
- Clonación de voz cross-lingual en modo *reference-only*: se aporta una referencia de audio y se sintetiza en el idioma de destino.
- Inferencia configurable mediante cfg 1.8 y 20 pasos, el ajuste con el que se evaluó el modelo.
- Carga opcional sin el módulo denoiser (`load_denoiser=False`) y con `optimize=True` para reducir coste de inferencia.
- Distribución del adaptador por separado (LoRA r=64) para reutilizarlo sobre el modelo base.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá de la referencia de voz. Tampoco se documenta el control de emociones, estilo o prosodia.

## Casos de uso

- Doblaje de vídeo a tailandés, vietnamita, malayo y tagalo: el modelo está entrenado específicamente con cues de 1-3 s y evaluación por CER sobre frases sueltas, que es exactamente el formato de un subtítulo doblado. Es el caso de uso principal declarado por el autor.
- Clonación de voz cross-lingual para localización: el flujo *reference-only* permite tomar la voz de un actor original y generar la pista doblada en otro idioma sin grabar de nuevo, siempre con validación humana del resultado.
- Localización de contenido formativo o e-learning: cursos con narración segmentada en frases cortas se pueden regenerar idioma a idioma reutilizando una única referencia de voz.
- Generación de voces para vídeo corto y redes sociales en idiomas del sudeste asiático: el ajuste cubre cinco idiomas poco atendidos por los TTS comerciales.
- Investigación en adaptación LoRA para TTS: el repositorio publica la configuración completa del adaptador (r=64, alpha=64, dropout 0,05), lo que lo hace útil como punto de partida reproducible para experimentos de ajuste multilingüe.
- Evaluación comparativa de revisiones: sirve como caso documentado de comparación r2 frente a r5, con métricas de CER, cola perdida y similitud de hablante, útil para estudiar cómo afecta la mezcla de datos al olvido catastrófico por idioma.
- Pre-producción de audiolibros o pódcast en tailandés y malayo: viable con revisión humana obligatoria, dado que el tailandés tiene un CER de 0,1055 y el malayo de 0,0156.
- No se recomienda su uso en indonesio: el CER se degrada de 0,0230 a 0,1016 y aparecen colas perdidas en el 6,9 % de los casos.

## Benchmarks y rendimiento

Los únicos datos disponibles son los de la aceptación offline del propio autor: conjunto v2 de 182 casos por 5 semillas (910 muestras), cfg 1.8 y 20 pasos, con rotación de múltiples referencias en zh/en/tl. Se miden CER, tasa de cola perdida y similitud de hablante.

| Idioma | CER base | CER r5 | Cola perdida base → r5 | Veredicto |
|---|---|---|---|---|
| ms | 0,0681 | 0,0156 | 9,4 % → 0,6 % | mejora clara |
| th | 0,1142 | 0,1055 | 6,9 % → 5,0 % | mejora |
| tl | 0,0184 | 0,0134 | 0 % → 0 % | sin cambio significativo |
| vi | 0,0730 | 0,0764 | 5,6 % → 6,3 % | dentro del ruido |
| id | 0,0230 | 0,1016 | 0 % → 6,9 % | regresión severa |
| zh | 0,0580 | 0,0864 | 0 % → 0 % | deriva, no supera el umbral |
| en | 0,0150 | 0,0191 | 0 % → 0 % | dentro del ruido |
| Total | 0,0568 | 0,0618 | 3,85 % → 3,30 % | — |

Otras métricas declaradas: silencio final medio de 0,102 s en el base a 0,189 s en r5 (mejor que los 0,292 s de r2, peor que el base) y similitud de hablante con WavLM X-vector de 0,909 a 0,913. El autor señala que la degradación en indonesio se concentra en los casos de habla espontánea (`id_nat_*`, dos de ellos fallan en las cinco semillas) y la atribuye al sesgo de prosodia leída del subconjunto cv22_id.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable al tratarse de un modelo de voz.

## Requisitos de hardware

- VRAM estimada solo para pesos, calculada a partir de los 2,29 B de parámetros: unos 9,2 GB en fp32, unos 4,6 GB en bf16/fp16, unos 2,3 GB en int8 y unos 1,2 GB en int4. Hay que sumar el espacio de activaciones y del módulo denoiser si no se desactiva con `load_denoiser=False`.
- Con 4,6 GB de pesos en bf16, el modelo cabe en GPUs de consumo con 8 GB o más, como la RTX 3060 Ti, la RTX 4060 Ti o la RTX 3070, dejando margen para activaciones. En fp32 harían falta al menos 12-16 GB, lo que cubren una RTX 4080, una RTX 4090 o una RTX 3090.
- GPU de centro de datos: A100, H100 o L40S son suficientes de sobra para este tamaño; la limitación real será la latencia por paso de difusión, no la memoria.
- Opciones de despliegue: la vía documentada es la librería `voxcpm` mediante `VoxCPM.from_pretrained(..., load_denoiser=False, optimize=True)`. No hay información disponible sobre soporte en vLLM, TGI, llama.cpp, Ollama ni sobre exportación a GGUF.
- Latencia y throughput: no disponibles. Solo se conoce la configuración de inferencia empleada en la evaluación (cfg 1.8 y 20 pasos) y el ajuste opcional `optimize=True`.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Estado |
|---|---|---|---|---|
| openbmb/VoxCPM2 (base) | no disponible | no declarados en esta ficha; en la evaluación se usan zh/en/tl como referencia | Apache-2.0 | modelo base |
| FrankLiuDundun/voxcpm-finetune-lora (r2) | no disponible | no disponible | Apache-2.0 | versión estable recomendada por el autor para producción |
| FrankLiuDundun/voxcpm-finetune-lora-r5 | 2,29 B | th, vi, id, ms, tl, zh, en | Apache-2.0 | experimental, no supera la aceptación offline |

No se dispone de información sobre otros modelos TTS comparables (por ejemplo, alternativas comerciales o de otros repositorios) en el material proporcionado, por lo que no se puede establecer una comparación de rendimiento entre familias de modelos.

## Limitaciones y advertencias

- Estado experimental declarado por el propio autor: la ronda de aceptación offline no se ha superado y el modelo **no se recomienda como opción por defecto en producción**. Para eso se indica la revisión r2.
- Regresión severa en indonesio: el CER pasa de 0,0230 a 0,1016 y la cola perdida del 0 % al 6,9 %, concentrada en habla espontánea. Dos casos fallan en las cinco semillas.
- Deriva en chino: el CER empeora de 0,0580 a 0,0864, por encima del umbral de aceptación.
- No se ha realizado una prueba de escucha ciega con hablantes nativos, por lo que la calidad percibida en th, vi, id, ms y tl no está validada por oyentes nativos.
- Riesgo de olvido catastrófico: el ajuste conjunto sobre cinco idiomas nuevos degrada lenguas que ya funcionaban en el base (id y zh), probablemente por la composición del dataset (cv22_id). Es un caveat relevante para cualquier reutilización de la receta.
- Trampa de carga del adaptador: en `lora/`, `lora_weights.safetensors` y `lora_config.json` deben usarse juntos. Cargar el safetensors por separado hace que el rango caiga silenciosamente a r=8 sin aviso.
- Gestión de silencios: el silencio final medio sube a 0,189 s (frente a 0,102 s del base), lo que puede requerir recorte posterior en pipelines de doblaje.
- Idiomas fuera de la lista th/vi/id/ms/tl/zh/en no están soportados por este ajuste.
- Licencia: el modelo es Apache-2.0 y el autor declara que no se han usado fuentes CC-BY-SA, NC ni ND, por lo que los pesos pueden redistribuirse. Los datos de entrenamiento CC-BY (FLEURS) requieren mantener la atribución correspondiente.
- Validación comunitaria nula: el repositorio presenta 0 descargas y 0 «likes» en el momento de la consulta, sin revisión externa independiente.
- No hay información sobre sesgos demográficos, acentos o variedades dialectales dentro de cada idioma, ni sobre comportamiento fuera del dominio de doblaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FrankLiuDundun/voxcpm-finetune-lora-r5
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
- Revisión estable recomendada por el autor (r2): https://huggingface.co/FrankLiuDundun/voxcpm-finetune-lora
- No se han encontrado otros enlaces relevantes (papers, blogs, demos o repositorios) en la búsqueda web realizada; los resultados obtenidos correspondían a páginas genéricas de YouTube y no guardan relación con el modelo.
