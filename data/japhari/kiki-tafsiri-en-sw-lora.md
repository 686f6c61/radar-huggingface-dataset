# Japhari/kiki-tafsiri-en-sw-lora

## Resumen

Kiki English–Swahili LoRA es un adaptador PEFT (LoRA) publicado por Japhari que especializa el checkpoint `bakita/kiki-tafsiri-b2-4b-it` —un modelo causal de la familia Gemma 4 con torre de audio y visión— en traducción bidireccional inglés–suajili. El adaptador no modifica la arquitectura base: se aplica únicamente sobre las proyecciones lineales del modelo de lenguaje, con rango 16 y alpha 32, y se distribuye como safetensors de aproximadamente 0,2 GB.

El problema que resuelve es acotado pero concreto: la traducción en ambos sentidos entre inglés y suajili dentro de un formato de instrucción fijo, el mismo que emplea la API de traducción del autor. Sobre un conjunto de validación de 300 pares (150 por dirección), el adaptador mejora la métrica chrF++ de 52,95 a 62,27 y COMET de 0,8033 a 0,8494 respecto al checkpoint base, con una ganancia especialmente marcada en la dirección suajili→inglés (64,68 frente a 54,74).

Es relevante ahora por dos motivos: demuestra que un ajuste supervisado muy ligero (984 pares paralelos, unos 30 minutos en una NVIDIA L40S) produce mejoras sustanciales en un par de idiomas de bajos recursos como el suajili, y porque documenta un detalle técnico poco habitual —la torre de audio de Gemma 4 no soporta SDPA y debe configurarse en atención eager para que la inicialización no falle—. No es un modelo de chat general ni un traductor multilingüe: es un adaptador de tarea única con formato de prompt estricto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer causal Gemma 4 con torres de visión y audio; el adaptador cubre solo las proyecciones lineales del modelo de lenguaje |
| Parametros totales | No disponible (el adaptador ocupa 0,2 GB en safetensors; el checkpoint base se denomina "4b-it" pero el número exacto de parámetros no se detalla) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explícita; el entrenamiento usó longitud máxima de 2048 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye y se usa en bfloat16; no se documentan cuantizaciones del adaptador) |
| Idiomas soportados | Inglés (en) y suajili (sw) |
| Licencia | gemma (Gemma Terms of Use); el repo base no incluye fichero de licencia separado |
| Formato de pesos | safetensors (adaptador PEFT); requiere cargar el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un modelo causal de la familia Gemma 4 con modalidades de texto, visión y audio, cargado mediante `AutoModelForImageTextToText`. El LoRA usa rango 16, alpha 32 y dropout 0,05, y se limita a las proyecciones lineales del modelo de lenguaje, sin tocar las torres de visión ni de audio. Un detalle operativo relevante: la torre de audio no implementa SDPA, por lo que es necesario forzar `audio_config` y `vision_config` a atención eager en la configuración antes de instanciar el modelo; de lo contrario la inicialización falla.

El entrenamiento consistió en ajuste supervisado con la pérdida calculada únicamente sobre los tokens de la traducción. El corpus son 984 pares paralelos en ambas direcciones (1.968 filas de entrenamiento), con 150 pares adicionales reservados para validación y un particionado que mantiene ambas direcciones de un mismo par en el mismo split. Se usó AdamW con learning rate 5e-5, schedule coseno, 5 % de warmup, 3 épocas, batch size 2 con acumulación de gradiente 8, longitud máxima 2048 y bfloat16, sobre una única NVIDIA L40S durante unos 30 minutos. Semilla 42. El corpus paralelo no se publica con el repositorio, lo que impide reproducir el ajuste exacto.

## Capacidades

- Traducción inglés→suajili y suajili→inglés dentro de un formato de instrucción fijo ("Translate the following {source} text into {target}… Reply with only the translation").
- Generación determinista (greedy) orientada a traducción, con `max_new_tokens` de 768 en el ejemplo del autor.
- Conservación de nombres propios y cifras en la mayoría de los casos, según la model card.
- Renderizado mediante plantilla de chat (`apply_chat_template`) con rol de usuario.
- No soporta tool calling ni function calling de forma documentada.
- No está diseñado para agentes ni razonamiento multi-paso.
- No es un modelo de chat general: el autor lo restringe explícitamente a la tarea de traducción en ese formato.
- Capacidades multilingües limitadas a en y sw; no cubre otras lenguas de la familia bantú ni variantes dialectales del suajili de forma declarada.

## Casos de uso

- Traducción de documentación técnica y manuales: el adaptador mantiene terminología y cifras razonablemente, y su ventana de entrenamiento de 2048 tokens permite procesar secciones completas sin trocear en exceso; útil para equipos que publican material en inglés y suajili.
- Localización de interfaces y cadenas de producto: al conservar nombres propios y números, encaja en pipelines de localización donde los marcadores de posición y topónimos deben permanecer intactos, con revisión humana de términos administrativos.
- Traducción de comunicados y notas de prensa institucionales: la dirección sw→en es la más fuerte (chrF++ 64,68), adecuada para que redacciones anglófonas entiendan material original en suajili antes de publicar.
- Atención al cliente en mercados de África Oriental: integrado como paso de traducción previo o posterior a un modelo conversacional, permite atender consultas en suajili con un modelo de chat en inglés; requiere encadenar dos modelos y validar el resultado.
- Subtitulado y transcripción de contenido audiovisual: combinado con un ASR en suajili, el adaptador traduce segmentos cortos a inglés para publicación o archivo; el límite de 768 tokens de salida es suficiente para bloques de subtítulos.
- Investigación en traducción automática de bajos recursos: sirve como referencia reproducible de LoRA de rango 16 sobre Gemma 4 para pares en–sw, útil para comparar metodologías de ajuste con corpus pequeños.
- Preprocesado de datasets multilingües: traducir muestras en suajili a inglés para anotación, clasificación o evaluación con herramientas que solo operan en inglés, revisando manualmente nombres oficiales y cifras.

## Benchmarks y rendimiento

Evaluación sobre 300 filas reservadas (150 por dirección), generación greedy, chrF++ calculado con SacreBLEU (`word_order=2`) y COMET con `Unbabel/wmt22-comet-da` (escala 0–1).

| Modelo | chrF++ | en→sw | sw→en | COMET |
|---|---:|---:|---:|---:|
| Checkpoint base | 52,95 | 51,13 | 54,74 | 0,8033 |
| Este adaptador | 62,27 | 59,84 | 64,68 | 0,8494 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,2 GB en safetensors; el grueso de los requisitos corresponde al checkpoint base, que debe cargarse en bfloat16.
- El autor entrenó con una única NVIDIA L40S (48 GB) durante unos 30 minutos; esa GPU es suficiente también para inferencia del modelo base con el adaptador.
- VRAM estimada para inferencia: no disponible de forma explícita. Con un base de tipo 4B en bfloat16, se requiere espacio para pesos, activaciones y caché KV; una GPU de 24 GB (RTX 4090, L4, A10G) es un punto de partida razonable, pero no está confirmado por el autor.
- No se documenta si cabe en GPUs de consumo con menos VRAM ni se ofrecen variantes cuantizadas del adaptador.
- Despliegue: el ejemplo oficial usa `transformers` + `peft` con `device_map="auto"` y `torch_dtype=torch.bfloat16`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI con este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto | Calidad (chrF++ / COMET) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Japhari/kiki-tafsiri-en-sw-lora | LoRA sobre Gemma 4 | en, sw | No disponible (entreno a 2048) | 62,27 / 0,8494 | gemma | Hugging Face, 0 descargas |
| bakita/kiki-tafsiri-b2-4b-it (base) | Gemma 4 causal | en, sw (por ajuste) | No disponible | 52,95 / 0,8033 | gemma | Hugging Face |
| Otros traductores en–sw | No disponible | — | — | — | — | — |

No se dispone de datos de benchmarks de alternativas comparables en la información proporcionada; la única comparación fiable es contra el checkpoint base, que el adaptador supera en ambas direcciones.

## Limitaciones y advertencias

- El adaptador está pensado exclusivamente para traducción en–sw en el formato de instrucción indicado; no es un modelo de chat general y su uso fuera de ese prompt degrada la calidad.
- La dirección en→sw es más débil que sw→en y puede elegir términos administrativos incorrectos (por ejemplo, "contract" en lugar de "contractor", o una palabra errónea para "hamlet").
- Nombres propios y cifras suelen conservarse, pero el autor recomienda verificar nombres oficiales, cifras y redacción legal antes de publicar una traducción.
- El corpus paralelo de entrenamiento no se publica, lo que impide auditar sesgos del dataset o reproducir el ajuste.
- El repositorio base no incluye fichero de licencia separado; el adaptador se distribuye bajo los términos del checkpoint base y la licencia Gemma, y el uso de los pesos base exige aceptar dichos términos. Es una restricción relevante para uso comercial.
- Riesgo de alucinación en textos largos o con terminología especializada no representada en los 984 pares de entrenamiento.
- Solo cubre inglés y suajili; no se documenta comportamiento en otras lenguas ni en variantes dialectales.
- La configuración de atención eager para las torres de audio y visión es obligatoria; omitirla provoca fallo de inicialización, lo que complica el despliegue en frameworks que no permiten ajustar `attn_implementation` por submódulo.
- Sin descargas ni likes en el momento de la ficha: no hay evidencia de uso en producción ni de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Japhari/kiki-tafsiri-en-sw-lora
- Modelo base: https://huggingface.co/bakita/kiki-tafsiri-b2-4b-it
- Referencia de tokenizador suajili (resultado de búsqueda, no relacionado directamente): https://huggingface.co/Mollel/MultiLinguSwahili-serengeti-E250-nli-matryoshka
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.
