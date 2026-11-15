# ntrung/VieNeu-TTS-v3-Turbo-gomastergi

## Resumen

VieNeu-TTS-v3-Turbo-gomastergi es un modelo de síntesis de voz (text-to-speech) en vietnamita publicado por el usuario ntrung en Hugging Face. Se trata de un adaptador LoRA de rango 16 entrenado sobre el backbone del sistema VieNeu-TTS en su variante v3 Turbo, con el objetivo de incorporar una voz concreta de locutora femenina denominada "gomastergi". El paquete incluye los pesos del adaptador y el perfil de voz ya empaquetado en el fichero `voices_v3_turbo.json`, de modo que el usuario final solo necesita instanciar el SDK de VieNeu en modo `v3turbo` y referenciar el nombre de la voz.

El modelo resuelve un problema muy acotado: la clonación o personalización de una voz específica dentro de un pipeline TTS ya existente, sin necesidad de reentrenar el backbone completo. El entrenamiento se realizó en 3 épocas sobre 577 clips (unos 122,5 minutos de audio, con 560 clips de entrenamiento y 17 de evaluación), distribuidos en 105 pasos, y se completó en aproximadamente 10,5 minutos sobre dos GPU T4 en paralelo. La pérdida final de evaluación fue de 5,1637 frente a 5,2424 de la versión anterior (v1), con una métrica `acc_cb0` de 0,158 (frente a ~0,13 en v1).

Por su naturaleza, no es un modelo fundacional ni un TTS generalista: es un artefacto de personalización de voz ligado al ecosistema VieNeu. Su relevancia es práctica para quien ya use ese stack y quiera añadir una voz nueva con un coste de entrenamiento mínimo; fuera de ese contexto, su utilidad es muy limitada. El repositorio ocupa 0,6 GB e incluye pesos en `safetensors` y `onnx`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 16) sobre backbone TTS VieNeu v3 Turbo; arquitectura base no disponible |
| Parametros totales | no disponible (adaptador LoRA r16 sobre backbone; el repo pesa 0,6 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (el texto de ejemplo y el dataset son en vietnamita; no se declara soporte de otros idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors y onnx |
| Tag de pipeline | no disponible |
| Fecha de creacion | 2026-11-15 |
| Fecha de actualizacion | 2026-11-15 |
| Descargas / likes | 4 / 0 |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 aplicado sobre el backbone de VieNeu-TTS v3 Turbo. El entrenamiento se dirigió al backbone (`target backbone`) durante 3 épocas, con un total de 105 pasos y 577 clips de audio (122,5 minutos), repartidos en 560 clips de entrenamiento y 17 de evaluación. El dataset v2 se compone de la versión v1 (249 clips, de los que se conservaron 247), 248 clips de `k7-rest`, 10 de `sample`, 40 de `iKaFF` y 32 de `Lns`, tras un proceso de limpieza que eliminó música y ruido y corrigió transcripciones (mencionadas como "Nod-Krai"). El resultado de evaluación fue una pérdida de 5,1637 (frente a 5,2424 en v1) y una `acc_cb0` de 0,158 (frente a ~0,13 en v1).

El entrenamiento se ejecutó en el kernel `ngnhattrung/vieneu-tts-lora-gomastergi-v2-2x-t4-parallel`, con dos GPU T4 en paralelo, en 10,5 minutos y con ambos procesos terminando con código de salida 0. La innovación técnica es modesta pero efectiva: reutilizar el backbone preentrenado y limitar el ajuste a un adaptador de bajo rango, lo que reduce drásticamente el coste de añadir una voz nueva. El perfil de voz resultante se serializa en `voices_v3_turbo.json` bajo el identificador `gomastergi`, de género femenino.

## Capacidades

- Síntesis de voz (text-to-speech) en vietnamita a partir de texto plano.
- Reproducción de una voz femenina concreta ("gomastergi") entrenada mediante LoRA sobre el backbone v3 Turbo.
- Integración con el SDK de Python de VieNeu mediante `Vieneu(mode="v3turbo", backbone_repo="final-gomastergi-v2-r16")`.
- Selección de voz por nombre en la llamada de inferencia (`voice="gomastergi"`).
- Ejecución en GPU con backend PyTorch por defecto y en CPU forzando `backend="pytorch"`.
- Exportación del audio resultante a fichero WAV mediante `tts.save(audio, "output.wav")`.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento.

## Casos de uso

- Doblaje de contenido divulgativo en vietnamita: el adaptador permite generar narraciones con una voz femenina consistente a partir de guiones de texto, integrándose en el SDK de VieNeu con una sola llamada a `infer`.
- Producción de audiolibros o podcasts en vietnamita: al mantener una única voz empaquetada en `voices_v3_turbo.json`, se garantiza coherencia tímbrica entre capítulos sin necesidad de reentrenar.
- Prototipado rápido de asistentes de voz en vietnamita: el bajo coste de entrenamiento (10,5 minutos en 2×T4) hace viable crear variantes de voz por proyecto o por cliente.
- Generación de avisos y locuciones para aplicaciones móviles: la inferencia en CPU con `backend="pytorch"` permite desplegar en entornos sin GPU para volúmenes moderados.
- Investigación en personalización de TTS: sirve como caso de estudio reproducible de fine-tuning LoRA r16 sobre un backbone TTS, con métricas de evaluación documentadas (loss 5,1637, acc_cb0 0,158).
- Pruebas de calidad y comparación de voces: al convivir con otras variantes del mismo backbone (v1, v2), permite comparar pérdidas y métricas objetivas entre adaptadores.
- Integración en pipelines de generación de contenido en lote: el formato ONNX incluido facilita el despliegue en runtimes de inferencia sin dependencia estricta de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MOS, WER, MCD, etc.) en la informacion disponible. Los únicos datos cuantitativos aportados por el autor son métricas internas de entrenamiento y evaluación:

| Metrica | v1 | v2 r16 |
|---|---|---|
| Loss de evaluacion final | 5,2424 | 5,1637 |
| acc_cb0 | ~0,13 | 0,158 |
| Epocas | no disponible | 3 |
| Pasos | no disponible | 105 |
| Clips de entrenamiento | 249 (247 conservados) | 560 |
| Clips de evaluacion | no disponible | 17 |
| Duracion total de audio | no disponible | 122,5 minutos |
| Tiempo de entrenamiento | no disponible | 10,5 minutos (2×T4) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo ocupa 0,6 GB, lo que sugiere un consumo de memoria moderado, pero no se especifica la VRAM necesaria.
- GPU recomendadas: el autor documenta entrenamiento en 2× NVIDIA T4 en paralelo; para inferencia no se indican modelos concretos.
- GPU de consumo: no se confirma compatibilidad con RTX 4090, RTX 3090 u otras GPU de consumo; el dato no está disponible.
- CPU: soportada explícitamente, forzando `backend="pytorch"` al instanciar `Vieneu`.
- Opciones de despliegue: SDK de Python `vieneu` (modo `v3turbo`); se incluyen pesos en formato ONNX, lo que abre la puerta a runtimes ONNX, aunque no se documenta el procedimiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La comparación más directa posible es con las versiones previas del mismo adaptador, según los datos del autor:

| Modelo | Loss eval | acc_cb0 | Clips train | Epocas | Licencia |
|---|---|---|---|---|---|
| gomastergi v1 | 5,2424 | ~0,13 | 247 | no disponible | no disponible |
| gomastergi v2 r16 | 5,1637 | 0,158 | 560 | 3 | no disponible |

No se han identificado en la información disponible otros modelos TTS en vietnamita con los que establecer una comparación de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Modelo especializado en una única voz y un único idioma (vietnamita); no es un TTS multilingüe ni multi-voz.
- La licencia no está declarada, por lo que no se puede confirmar el uso comercial; es imprescindible contactar con el autor antes de un despliegue en producción.
- El repositorio tiene solo 4 descargas y 0 likes, sin validación externa de calidad; las métricas aportadas son internas y no comparables con benchmarks estándar.
- La pérdida de evaluación de 5,1637 y una `acc_cb0` de 0,158 indican un ajuste limitado; no hay datos de MOS ni de inteligibilidad que confirmen calidad perceptiva.
- El dataset de entrenamiento es reducido (122,5 minutos) y heterogéneo (mezcla de fuentes v1, k7-rest, sample, iKaFF, Lns), lo que puede introducir sesgos acústicos y de estilo.
- Riesgo de alucinación prosódica y de errores de pronunciación en textos fuera del dominio de entrenamiento; no se documentan pruebas de robustez.
- Dependencia del ecosistema VieNeu: sin el SDK `vieneu` y el backbone `final-gomastergi-v2-r16`, el adaptador no es utilizable de forma directa.
- No se documenta el pipeline de Hugging Face ni los idiomas soportados en los metadatos del repositorio, lo que dificulta su descubrimiento y uso automatizado.
- El autor advierte de que en CPU es necesario pasar `backend="pytorch"`; omitirlo puede provocar fallos de ejecución.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ntrung/VieNeu-TTS-v3-Turbo-gomastergi
- Kernel de entrenamiento: https://huggingface.co/ngnhattrung/vieneu-tts-lora-gomastergi-v2-2x-t4-parallel
- SDK de VieNeu (referenciado en la model card como paquete `vieneu`): no se proporciona URL directa en la información disponible.
- Paper, blog o demo: no disponibles en la información proporcionada.
