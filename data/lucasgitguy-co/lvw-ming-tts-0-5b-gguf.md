# Lucasgitguy-co/LvW-Ming-TTS-0.5B-GGUF

## Resumen

LvW-Ming-TTS-0.5B-GGUF es la conversión al formato GGUF del modelo de síntesis de voz LvW-Ming-TTS-0.5B, un ajuste fino (fine-tune) del autor Lucasgitguy-co sobre una arquitectura Ming de 0,5 mil millones de parámetros. El paquete está preparado específicamente para el motor de inferencia audio.cpp (familia `ming3_tts`), e incluye en cada fichero el backbone basado en Qwen, la cabeza de flujo (flow head), el VAE de audio, el codificador de hablante CAM++ y el tokenizador. Genera audio mono a 44,1 kHz y soporta siete idiomas: chino, inglés, alemán, español, francés, coreano y japonés.

El aspecto más relevante de esta publicación es que la propia model card declara que el modelo no supera a su modelo base en la evaluación de retención: la puerta de calidad (release gate) falló en las tres reglas definidas antes del entrenamiento (error medio, fallos de parada y degradación por idioma, con el español como caso peor). El autor lo publica igualmente para que el resultado pueda inspeccionarse y recomienda explícitamente usar el modelo base para uso real.

Se trata, por tanto, de un artefacto de interés fundamentalmente técnico y de investigación: sirve para evaluar el proceso de cuantización a GGUF y el comportamiento de audio.cpp con modelos TTS, más que como un modelo listo para producción. La licencia es MIT y el repositorio ocupa 4,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone tipo Qwen + flow head + VAE de audio + codificador de hablante CAM++ (familia `ming3_tts` en audio.cpp) |
| Parametros totales | 0,5 mil millones (0.5B, segun el nombre del modelo) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (precision original) y Q8_0 (con stop head en bf16 y codificador de hablante en f32); audio.cpp solo soporta estas dos precisiones para Ming |
| Idiomas soportados | zh, en, de, es, fr, ko, ja |
| Licencia | MIT |
| Formato de pesos | GGUF (`lvw-ming-tts-0.5b-bf16.gguf`, `lvw-ming-tts-0.5b-q8_0.gguf`) |

## Arquitectura y entrenamiento

El modelo es un sistema TTS completo empaquetado en un único fichero GGUF: combina un backbone transformer de tipo Qwen con una flow head para la generación acústica, un VAE de audio para la decodificación a forma de onda y un codificador de hablante CAM++ que habilita la clonación de voz a partir de una referencia. La salida es audio mono a 44,1 kHz. La conversión se realizó con la herramienta `tools/models/convert_ming3_tts_gguf.py` de audio.cpp (commit a6e3221).

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Lo que sí documenta la model card es el resultado de la evaluación de retención del fine-tune frente al modelo base: el error medio empeoró del 6,99 % al 7,11 %, los fallos de parada aumentaron de 2/420 a 3/420 y el español sufrió una degradación superior al umbral permitido, por lo que las tres reglas de la puerta de calidad fallaron. En la verificación de formato sobre audio.cpp (backend CPU, frases en inglés con voces integradas y en chino clonadas), el fichero bf16 obtuvo un 18,05 % de error medio y el Q8_0 un 11,53 %, frente al 9,62 % del modelo PyTorch original y con un umbral máximo admitido del 10 % + 0,5 puntos.

## Capacidades

- Síntesis de voz (text-to-speech) en siete idiomas: chino, inglés, alemán, español, francés, coreano y japonés.
- Clonación de voz a partir de un audio de referencia y su transcripción (`--task clon`).
- Uso de voces integradas predefinidas (por ejemplo, `US_Emma`) mediante `--voice-id`.
- Salida de audio mono a 44,1 kHz en formato WAV.
- Selección de plantilla de prompt mediante `--request-option template_name=ip`.
- Ejecución en backend CPU a través de la CLI de audio.cpp (`audiocpp_cli`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multimodalidad más allá del audio de salida.

## Casos de uso

- Evaluación de pipelines de cuantización TTS: sirve para medir cómo afecta la conversión a GGUF (bf16 y Q8_0) a la calidad del audio frente a la implementación PyTorch de referencia, usando la verificación de formato documentada.
- Pruebas de integración con audio.cpp: permite validar la familia `ming3_tts`, las tareas `tts` y `clon` y las opciones de petición en un entorno controlado antes de adoptar el modelo base.
- Investigación sobre clonación de voz multilingüe: el codificador CAM++ y las siete lenguas permiten experimentar con transferencia de hablante entre idiomas, siempre en el marco de uso responsable indicado.
- Generación de audio sintético para prototipos internos: útil para maquetar interfaces o demos donde la fidelidad no es crítica y se acepta el deterioro documentado frente al base.
- Comparación de rendimiento CPU entre precisiones: el contraste de velocidad (unos 5 minutos por frase en bf16 frente a unos 40 segundos en Q8_0 sobre un M4 Air) permite caracterizar el coste de cada cuantización en hardware de consumo.
- Docencia y formación: como ejemplo práctico de empaquetado de un sistema TTS completo (backbone, flow head, VAE y encoder de hablante) en un único fichero GGUF.

## Benchmarks y rendimiento

| Metrica | Base | Este modelo | Resultado |
|---|---|---|---|
| Error medio (retencion) | 6,99 % | 7,11 % | FAIL |
| Fallos de parada | 2/420 | 3/420 | FAIL |
| Degradacion por idioma (>10 % o +0,5 pt) | — | es peor | FAIL |

| Fichero | Precision | Error medio (verificacion de formato) | Check |
|---|---|---|---|
| `lvw-ming-tts-0.5b-bf16.gguf` | bf16 original | 18,05 % | FAIL |
| `lvw-ming-tts-0.5b-q8_0.gguf` | Q8_0 | 11,53 % | FAIL |
| Referencia PyTorch | — | 9,62 % | — |

Regla de verificacion: error medio como maximo del 10 % + 0,5 pt sobre el modelo PyTorch en las mismas frases. Verificacion realizada en backend CPU de audio.cpp con frases retenidas en ingles (voces integradas) y chino (clonadas).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 0,5B parámetros, el fichero Q8_0 es manejable en memoria de sistema o GPU de gama baja, pero no se publican cifras concretas.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; las pruebas documentadas se hicieron únicamente en backend CPU.
- Despliegue: exclusivamente mediante audio.cpp (`audiocpp_cli`) con `--family ming3_tts`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: en CPU, aproximadamente 5 minutos por frase con bf16 y unos 40 segundos por frase con Q8_0 sobre un Apple M4 Air. El backend Metal no se probó porque requiere el compilador Metal completo de Xcode.
- Recomendación del autor: usar Q8_0 en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| LvW-Ming-TTS-0.5B-GGUF (este) | 0,5B | no disponible | 7 | MIT | Publicado; release gate fallido |
| LvW-Ming-TTS-0.5B (base) | 0,5B | no disponible | 7 | MIT | Recomendado por el autor para uso real |
| Otras alternativas TTS | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El fine-tune no supera al modelo base: la puerta de calidad falló en error medio, fallos de parada y degradación del español. El autor recomienda el modelo base para uso real.
- La verificación de formato también falla en ambos ficheros GGUF (18,05 % en bf16 y 11,53 % en Q8_0) frente al 9,62 % de PyTorch.
- Solo se ha probado el backend CPU; el backend Metal no está validado.
- audio.cpp solo admite dos precisiones para Ming (bf16 y Q8_0), lo que limita las opciones de cuantización.
- El rendimiento en bf16 sobre CPU es muy lento (unos 5 minutos por frase en un M4 Air).
- Riesgo de uso indebido de la clonación de voz: no debe suplantarse a personas reales sin consentimiento, ni engañar, ni incumplir la ley; el audio sintético debe etiquetarse como tal cuando pueda confundirse con una grabación real.
- No se documentan sesgos específicos ni tasas de alucinación; al ser un modelo TTS, el riesgo principal es la calidad y fidelidad del audio generado, no la veracidad del contenido textual.
- Licencia MIT: permite uso comercial, pero las advertencias de uso responsable del modelo base se heredan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lucasgitguy-co/LvW-Ming-TTS-0.5B-GGUF
- Modelo base: https://huggingface.co/Lucasgitguy-co/LvW-Ming-TTS-0.5B
- audio.cpp: https://github.com/0xShug0/audio.cpp
