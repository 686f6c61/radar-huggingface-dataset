# Lucasgitguy-co/LvW-Dictate-1.5B

## Resumen

LvW-Dictate-1.5B es un sistema de limpieza de transcripciones de voz a texto (ASR post-processing) desarrollado por el usuario Lucasgitguy-co. No es un modelo único, sino un pipeline de dos etapas que suma aproximadamente 1.500 millones de parámetros: primero, Phonon-2.5 (0,6B, de FermionResearch) transcribe el audio; después, un modelo de limpieza de 0,9B derivado de K2-Horizon-0.9B-System1 con un LoRA fusionado convierte la transcripción en bruta en texto limpio, eliminando muletillas, repeticiones y falsos arranques.

El problema que resuelve es concreto: las transcripciones ASR de dictado contienen "um", "uh", "you know", palabras repetidas y autocorrecciones que las hacen poco legibles. El modelo de limpieza solo elimina palabras, nunca añade, reformula ni responde al contenido, lo que lo hace seguro para integrarse en flujos de dictado. La limpieza funciona exclusivamente en inglés; en los otros 24 idiomas de Phonon-2.5 la salida se devuelve sin modificar.

El repositorio principal contiene el modelo de limpieza (1.078.285.824 parámetros reales según safetensors, 2,2 GB), con licencia Apache-2.0, etiquetas de text-generation y custom_code, y un script `dictate.py` que orquesta ambas etapas. Existe un repositorio GGUF separado para despliegue con llama.cpp y transcribe.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de K2-Horizon-0.9B-System1) con LoRA fusionado |
| Parametros totales | 1.078.285.824 (modelo de limpieza); ~1,5B en el pipeline completo con Phonon-2.5 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repo principal; existe repositorio GGUF separado |
| Idiomas soportados | inglés para la limpieza; el pipeline completo cubre 25 idiomas vía Phonon-2.5 |
| Licencia | Apache-2.0 (modelo de limpieza); Phonon-2.5 es CC-BY-4.0 |
| Formato de pesos | safetensors (transformers); GGUF en repositorio aparte |

## Arquitectura y entrenamiento

El modelo de limpieza es un transformer decoder-only de 0,9B parámetros (K2-Horizon-0.9B-System1) al que se le ha fusionado un adaptador LoRA. Se usa como modelo de generación condicionada: se envía la transcripción ASR como turno de usuario con un system prompt específico y decodificación greedy. La innovación clave es que el entrenamiento está diseñado para que el modelo solo borre palabras: cada par de entrenamiento consiste en una salida real de Phonon-2.5 como entrada y esa misma entrada menos las palabras marcadas como prescindibles como objetivo.

Los datos de entrenamiento provienen del dataset Lucasgitguy-co/lvw-dictate-cleanup, construido a partir de DisfluencySpeech (4.488 filas de habla disfluente real) y FLEURS, entre otras fuentes. Cada entrada es salida real de Phonon-2.5 o un prompt tecleado, y cada objetivo es esa entrada con palabras eliminadas. El autor reporta que el modelo no añade ninguna palabra en los cuatro conjuntos de test en inglés (0 palabras añadidas), y que incluye una comprobación de borrado que revierte respuestas generadas por error en el modelo base sin entrenar.

## Capacidades

- Limpieza de transcripciones ASR en inglés: elimina muletillas (um, uh, you know, I mean), palabras repetidas, falsos arranques y autocorrecciones.
- Corrección de puntuación y mayúsculas en la transcripción limpia.
- Comportamiento estrictamente de borrado: nunca añade, reformula ni responde al contenido dictado.
- Gestión de autocorrecciones del tipo "Tuesday, no, sorry, Wednesday" → "Wednesday".
- No altera las transcripciones en los otros 24 idiomas de Phonon-2.5 (se devuelven idénticas).
- Uso independiente sobre cualquier salida ASR, no solo Phonon-2.5, mediante el system prompt de `dictate.py`.
- No se documentan tool calling, function calling, agentes, visión ni audio nativo en el modelo de limpieza.

## Casos de uso

- Dictado personal y profesional: el pipeline transcribe una grabación de voz y devuelve texto limpio y legible, eliminando las muletillas típicas del habla espontánea. Adecuado porque el modelo solo borra palabras y no altera el contenido dictado.
- Post-procesado de transcripciones de reuniones: se aplica sobre la salida de cualquier motor ASR en inglés para eliminar repeticiones y falsos arranques antes de enviar el texto a un resumen o a un sistema de actas.
- Integración en herramientas de accesibilidad: personas que dictan por voz obtienen texto más limpio para correos, documentos o mensajes, con corrección de puntuación incluida.
- Preprocesado para pipelines de LLM: limpiar la transcripción antes de pasarla a un modelo generativo reduce ruido y mejora la calidad de las respuestas posteriores, ya que el modelo no responde ni reformula el contenido.
- Subtitulado y transcripción de contenido hablado: limpieza de transcripciones de entrevistas o podcasts en inglés para generar subtítulos más legibles.
- Evaluación y control de calidad de sistemas ASR: el modelo sirve como paso de normalización medible, con métricas WER publicadas frente a la transcripción humana limpia.
- Dictado multilingüe con limpieza solo en inglés: para usuarios que dictan en otros idiomas, el pipeline transcribe en 25 idiomas y devuelve el texto sin tocar en los 24 idiomas distintos del inglés.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. WER = word error rate, menor es mejor. Todos los conjuntos de test son held-out.

| Gate | Conjunto de test | Phonon-2.5 solo | System1 sin entrenar | LvW-Dictate | Condición de paso |
|---|---|---:|---:|---:|---|
| G1 limpia | DisfluencySpeech test (250 clips disfluentes reales), WER vs transcripción humana limpia | 16,49 | 12,29 | 7,06 | ≥ 25% menor que Phonon solo |
| G2 no daña | FLEURS inglés test (350 frases), WER vs referencia | 6,49 | 6,49 | 6,50 | ≤ +0,3 |
| G2 no daña | LibriSpeech test-clean (300), WER vs referencia | 1,79 | 1,91 | 1,93 | ≤ +0,3 |
| G3 nunca responde | 194 preguntas y comandos dictados: porcentaje devuelto como prompt limpio | 71% | 73% | 99,0% (validación no vista: 96,8%) | ≥ 98%, sin salida mayor de 1,3× su entrada |
| G4 otros idiomas | 240 clips FLEURS en los otros 24 idiomas de Phonon: salida idéntica a Phonon | 240/240 | 240/240 | 240/240 | todas idénticas |

Datos adicionales reportados: 0 palabras añadidas por la limpieza en los cuatro conjuntos ingleses; eliminar solo uh/um por regla lleva G1 de 16,49 a 14,08, mientras el modelo lo lleva a 7,06; en el split de validación no visto, habla disfluente pasa de 17,90 a 7,22 WER (60% menos), 73/73 transcripciones fluidas se devuelven sin cambios y el 96,8% de 94 prompts dictados quedan dentro del 10% del objetivo. El aumento en LibriSpeech proviene en su mayoría de repeticiones literarias que la limpieza de dictado elimina deliberadamente ("Nay, nay", "Come, come").

## Requisitos de hardware

- VRAM estimada para el modelo de limpieza (0,9B): aproximadamente 2 GB en fp16, en torno a 1 GB en cuantización de 8 bits y menos de 1 GB en 4 bits (estimación según tamaño; no publicada por el autor).
- El pipeline completo suma Phonon-2.5 (0,6B), por lo que el total ronda los 1,5B parámetros; en fp16 serían unos 3 GB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 en adelante) puede ejecutar el modelo de limpieza; para el pipeline completo se recomienda al menos 8 GB de VRAM. No se publican requisitos oficiales.
- Cabe en GPU consumer: sí, el modelo de limpieza individual cabe en GPUs con 4 GB o más en cuantizaciones bajas.
- Opciones de despliegue: transformers con `trust_remote_code=True`; MLX en Apple silicon; PyTorch en Linux/Windows; llama.cpp y transcribe.cpp mediante el repositorio GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos de limpieza de disfluencias en la información proporcionada. La comparación más directa disponible es interna al propio pipeline:

| Sistema | Parámetros | Función | Licencia |
|---|---:|---|---|
| Phonon-2.5 solo | 0,6B | Transcripción ASR en 25 idiomas, sin limpieza | CC-BY-4.0 |
| K2-Horizon-0.9B-System1 sin entrenar | 0,9B | Modelo base; responde al contenido dictado en 125 de 194 casos | Apache-2.0 |
| LvW-Dictate (limpieza) | 0,9B | Limpieza solo-borrado en inglés | Apache-2.0 |

No se dispone de comparación con modelos de limpieza de disfluencias de terceros en la información disponible.

## Limitaciones y advertencias

- La limpieza solo funciona en inglés; en los otros 24 idiomas la salida es idéntica a la de Phonon-2.5, sin ninguna mejora.
- El modelo solo elimina palabras: no corrige errores de reconocimiento, no reformula y no mejora la gramática más allá de puntuación y mayúsculas.
- Riesgo de eliminar repeticiones legítimas: el aumento de WER en LibriSpeech se debe a repeticiones literarias que la limpieza borra por diseño.
- En validación no vista, el gate G3 (nunca responde) baja al 96,8%, por debajo del umbral del 98% fijado por el autor; una de las tres fallas se atribuye a un error de etiquetado.
- El autor advierte que las reglas de la comprobación de borrado se ajustaron leyendo errores del conjunto de test, por lo que la cifra de validación es la más honesta para prompts.
- Se recomienda usar `clean_transcript()` de `dictate.py` en lugar del modelo en bruto, porque añade la comprobación de inglés, divide textos largos y aplica la comprobación de borrado.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio.
- Licencia Apache-2.0 para el modelo de limpieza, pero el pipeline completo incorpora Phonon-2.5 bajo CC-BY-4.0, cuyas condiciones deben respetarse por separado.
- No se documentan sesgos específicos ni evaluaciones de robustez más allá de los conjuntos citados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un modelo reciente y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lucasgitguy-co/LvW-Dictate-1.5B
- Repositorio GGUF: https://huggingface.co/Lucasgitguy-co/LvW-Dictate-1.5B-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/Lucasgitguy-co/lvw-dictate-cleanup
- Modelo base de limpieza: https://huggingface.co/Lucasgitguy-co/K2-Horizon-0.9B-System1
- Modelo ASR Phonon-2.5: https://huggingface.co/FermionResearch/Phonon-2.5
- Dataset DisfluencySpeech: https://huggingface.co/datasets/amaai-lab/DisfluencySpeech
