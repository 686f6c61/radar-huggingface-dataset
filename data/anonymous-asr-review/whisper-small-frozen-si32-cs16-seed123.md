# anonymous-asr-review/whisper-small-frozen-si32-cs16-seed123

## Resumen

whisper-small-frozen-si32-cs16-seed123 es un conjunto de adaptadores LoRA publicado por el usuario anónimo `anonymous-asr-review` como material suplementario para un proceso de revisión por pares. No es un modelo completo: se trata de dos adaptadores PEFT que se cargan sobre los pesos de `openai/whisper-small` y que deben activarse conjuntamente para funcionar. El objetivo declarado es el reconocimiento automático de voz con cambio de código (code-switching) entre sinhala (`si`) e inglés (`en`).

El adaptador principal es un residuo de cambio de código de rango 16, entrenado mientras un adaptador de sinhala de rango 32 permanecía activo y congelado. La model card indica que ambos adaptadores están incluidos en el repositorio y que deben combinarse con peso unitario. Se documentan la semilla (123), el rango (16), el alpha de LoRA (32) y el criterio de selección de checkpoint (el mejor, `best`).

La relevancia del modelo es acotada: se trata de un artefacto de investigación reproducible, con 0 descargas y 1 like en el momento de la consulta, sin resultados de benchmarks publicados y sin licencia declarada. Es útil como referencia metodológica para quien investigue composición de adaptadores LoRA en ASR multilingüe, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre el transformer encoder-decoder de `openai/whisper-small` |
| Parametros totales | No disponible para los adaptadores; el modelo base Whisper small tiene 244 M de parametros (segun la model card de `openai/whisper-small`, no confirmado en la informacion proporcionada) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. El modelo base Whisper procesa ventanas de audio de 30 s a 16 kHz, pero este dato no se explicita en la model card |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Sinhala (`si`) e ingles (`en`) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptadores LoRA/PEFT) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper small: un transformer encoder-decoder con preprocesado de audio a mel-espectrogramas. Sobre ella se aplican dos adaptadores LoRA de PEFT. El primero, de rango 32, corresponde al adaptador de sinhala; el segundo, de rango 16, es el residuo de cambio de código que se entrena mientras el primero permanece activo y congelado. El alpha de LoRA es 32 en el adaptador de rango 16, según la model card.

La combinación se realiza con `add_weighted_adapter` usando pesos `[1.0, 1.0]` y `combination_type="cat"`, seguida de `merge_and_unload()`. Esto implica que los dos adaptadores no son intercambiables ni independientes: activar solo uno de ellos no reproduce el comportamiento previsto. Los datos de entrenamiento (número de tokens, composición del dataset, si hubo RLHF o DPO) no están disponibles en la información proporcionada. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Reconocimiento automático de voz (ASR) con salida de transcripción sobre audio a 16 kHz.
- Conversión de voz a texto con cambio de código sinhala-ingles, que es el objetivo declarado del adaptador de rango 16.
- Transcripción en sinhala gracias al adaptador de rango 32 que se mantiene activo y congelado durante el entrenamiento.
- Transcripción en ingles, heredada de los pesos del modelo base Whisper small.
- Selección del idioma de transcripción y de los parámetros de generación por parte del usuario en el momento de la inferencia, tal y como indica la model card.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de salida ni modo de pensamiento.

## Casos de uso

- Investigación en composición de adaptadores LoRA: el repositorio sirve como referencia reproducible (semilla 123, rangos 32 y 16, alpha 32) para estudiar cómo se combinan adaptadores entrenados de forma secuencial y congelada.
- Reproducción de resultados en revisión por pares: al incluir ambos adaptadores y el script de carga exacto, permite a revisores replicar la evaluación del artículo asociado.
- Transcripción de audio con code-switching sinhala-ingles: escenarios donde un hablante alterna ambas lenguas en la misma frase, un caso mal cubierto por modelos monolingües.
- Evaluación comparativa de estrategias de combinación de adaptadores: el uso de `combination_type="cat"` con pesos unitarios puede contrastarse frente a otras estrategias de mezcla.
- Generación de datasets de ASR anotados para sinhala: el adaptador puede emplearse para pretranscribir corpus antes de una revisión humana.
- Investigación sobre olvido catastrófico: el diseño de congelar el adaptador de sinhala mientras se entrena el residuo de cambio de código es un caso de estudio directo para medir la degradación del idioma congelado.
- Docencia y experimentación con PEFT: el flujo de `snapshot_download`, `load_adapter`, `add_weighted_adapter` y `merge_and_unload` es un ejemplo didáctico de carga multi-adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de WER, BLEU ni comparaciones cuantitativas, y los resultados de la búsqueda web no aportan datos sobre este modelo.

## Requisitos de hardware

- El modelo base Whisper small tiene 244 M de parámetros, por lo que la inferencia en `float16` ocupa aproximadamente 0,5 GB de pesos, más el espacio de activaciones y del decodificador autoregresivo.
- Los adaptadores LoRA son de rango 32 y 16 sobre un modelo de 244 M, por lo que su huella es pequeña en comparación con los pesos base; el tamaño exacto no está disponible.
- VRAM estimada para inferencia: del orden de 1 a 2 GB en `float16` para lotes pequeños, aunque no se dispone de mediciones publicadas para esta combinación concreta.
- Cabe en GPU de consumo: cualquier GPU con 4 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060, RTX 4090) debería ser suficiente; no hay cifras confirmadas.
- En CPU es viable mediante `transformers` en PyTorch, con latencia mayor; no se dispone de estimaciones de latencia ni de throughput.
- Opciones de despliegue: `transformers` con `peft`, que es el flujo documentado en la model card. vLLM soporta Whisper, pero no se confirma el soporte de esta combinación multi-adaptador. No hay pesos GGUF publicados, por lo que `llama.cpp`, `Ollama` y `whisper.cpp` requerirían una conversión previa tras el `merge_and_unload()`. TGI no está confirmado para este caso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-small-frozen-si32-cs16-seed123 | No disponible (base de 244 M) | Ventanas de audio; duracion no especificada | `si`, `en` | No disponible | Repositorio PEFT con dos adaptadores; 0 descargas |
| openai/whisper-small | 244 M | Ventanas de 30 s a 16 kHz | ~99 idiomas (segun el modelo base) | Apache 2.0 (segun el modelo base) | Pesos completos en HuggingFace |
| openai/whisper-large-v3 | 1.550 M | Ventanas de 30 s a 16 kHz | ~99 idiomas (segun el modelo base) | Apache 2.0 (segun el modelo base) | Pesos completos en HuggingFace |
| Otros adaptadores LoRA para Whisper small | No disponible | No disponible | Variable | Variable | Repositorios PEFT independientes |

No se dispone de comparaciones de rendimiento publicadas entre este modelo y las alternativas listadas. Las cifras de los modelos base proceden de sus respectivas model cards, no de la información proporcionada para este adaptador.

## Limitaciones y advertencias

- Artefacto anónimo de revisión por pares: no está pensado ni validado para uso en producción.
- Licencia no declarada, lo que impide determinar si se permite el uso comercial o la redistribución.
- Sin resultados de benchmarks publicados: no hay mediciones de WER ni comparaciones con alternativas, por lo que el rendimiento real es desconocido.
- Los dos adaptadores deben activarse juntos con peso unitario; usar solo uno de ellos produce un comportamiento distinto al documentado.
- Cobertura lingüística limitada a sinhala e inglés; el resto de idiomas de Whisper small no están respaldados por los adaptadores.
- Riesgo de alucinación inherente a los modelos ASR tipo Whisper, especialmente en audio ruidoso, silencios largos o segmentos musicales; la model card no documenta mitigaciones.
- El audio debe estar muestreado a 16 kHz; no se documenta el comportamiento con otras frecuencias.
- No se documentan sesgos específicos del adaptador ni la composición del dataset de entrenamiento, lo que impide evaluar sesgos de dominio, acento o género.
- El repositorio tiene un tamaño declarado de 0,0 GB, lo que sugiere un contenido muy reducido; conviene verificar la integridad de los ficheros antes de usarlo.
- Los pesos base no se incluyen: es necesario descargar `openai/whisper-small` por separado, lo que añade una dependencia externa a la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anonymous-asr-review/whisper-small-frozen-si32-cs16-seed123
- Modelo base: https://huggingface.co/openai/whisper-small
- Documentación de PEFT: https://huggingface.co/docs/peft
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos relevantes para este modelo; los resultados devueltos corresponden a entidades homónimas sin relación con el modelo.
