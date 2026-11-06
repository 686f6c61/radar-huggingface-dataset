# Junnuo/BPE-on-AMT-MIDI

## Resumen

BPE on AMT MIDI es una familia de checkpoints de generacion de musica simbolica en formato MIDI condicionada por texto (caption-conditioned), desarrollada por el usuario Junnuo. El modelo parte de SmolLM2-135M, un transformer decoder-only de 135 millones de parametros de HuggingFaceTB, y se afina para producir secuencias de notas MIDI a partir de descripciones textuales como "A calm piano piece in C major with a slow tempo". Se publican dos variantes: una entrenada con byte-pair encoding sobre la representacion de cinco tokens por nota del Anticipatory Music Transformer (`bpe/stage2`) y otra sin BPE (`no_bpe/stage2`).

El interes tecnico del trabajo esta en la tokenizacion: en lugar de generar directamente la representacion de cinco tokens por nota del AMT, se aplica BPE para comprimir esa secuencia y reducir la longitud efectiva de la ventana, lo que permite a un modelo de solo 135M de parametros modelar piezas musicales mas largas dentro de su contexto. La receta de entrenamiento sigue MIDI-LLM (Wu et al., 2026) y la representacion de notas y el aumento por anticipacion siguen el Anticipatory Music Transformer (Thickstun et al., 2024).

Es relevante ahora como ejemplo de adaptacion de un modelo de lenguaje pequeno y generico a un dominio estructurado y no textual, con un pipeline reproducible publicado en GitHub. El repositorio ocupa 3,2 GB y no registra descargas ni likes en el momento de la consulta, por lo que debe considerarse un artefacto de investigacion mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-135M afinado) |
| Parametros totales | 135 millones (modelo base SmolLM2-135M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (condicionamiento por caption en texto, idioma no especificado) |
| Licencia | other (terminos no detallados en la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 135M de parametros (SmolLM2-135M) afinado para generacion autoregresiva de musica simbolica. La salida no es texto sino una secuencia de notas MIDI codificada con la representacion de cinco tokens por nota del Anticipatory Music Transformer. Sobre esa representacion se aplica, en la variante `bpe/stage2`, un tokenizador byte-pair encoding que agrupa patrones frecuentes de la secuencia de notas, reduciendo el numero de pasos de decodificacion necesarios para una pieza. La variante `no_bpe/stage2` opera directamente sobre la representacion de cinco tokens sin compresion, y sirve como control experimental.

El entrenamiento se realizo en dos etapas (stage2 en ambos casos) siguiendo la receta de MIDI-LLM (Wu et al., 2026), con el aumento por anticipacion del Anticipatory Music Transformer (Thickstun et al., 2024). Los datos de entrenamiento provienen de Lakh MIDI, MidiCaps, GigaMIDI y MusicPile. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO. La decodificacion reportada usa temperatura 0,9, top-p 1,0, sin top-k, con una gramatica de notas aplicada durante el muestreo y parada en el token de fin de pieza.

## Capacidades

- Generacion de musica simbolica MIDI condicionada por una descripcion textual (caption), por ejemplo tonalidad, instrumento y tempo.
- Generacion autoregresiva de secuencias de notas con gramatica de notas aplicada en el muestreo para garantizar secuencias validas.
- Dos variantes de tokenizacion: con BPE sobre la representacion AMT de cinco tokens por nota y sin BPE, para comparacion experimental.
- Control de longitud mediante token de fin de cancion (end-of-song).
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- No se documentan capacidades multilingues mas alla del condicionamiento por caption en texto.

## Casos de uso

- Generacion de bocetos musicales a partir de descripciones: un compositor escribe "A calm piano piece in C major with a slow tempo" y obtiene un MIDI inicial que puede editar en un DAW. Adecuado por el condicionamiento directo por caption y la salida en formato estandar.
- Prototipado rapido de ideas para bandas sonoras: generar variaciones de una pieza cambiando tonalidad o instrumento en el caption para explorar direcciones antes de componer.
- Investigacion en generacion musical simbolica: las dos variantes (con y sin BPE) permiten estudiar el efecto de la tokenizacion sobre la calidad y la longitud efectiva de las piezas generadas.
- Aumento de datos musicales: producir MIDIs sinteticos condicionados por texto para ampliar datasets de entrenamiento de otros modelos de musica.
- Educacion musical: generar ejemplos de piezas en una tonalidad o tempo concretos para ilustrar conceptos armonicos basicos.
- Pruebas de pipelines de generacion de musica en entornos con recursos limitados: al ser un modelo de 135M de parametros, puede ejecutarse en hardware modesto para validar infraestructura antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a los resultados del repositorio de GitHub (github.com/Junnuo3/BPE-on-AMT-MIDI), pero no se incluyen cifras en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 135M de parametros en safetensors el peso en fp32 ronda los 0,5 GB y en fp16 los 0,27 GB, aunque el tamano del repositorio (3,2 GB) sugiere que incluye varios checkpoints y artefactos adicionales.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente por tamano; no se especifican modelos concretos.
- Cabe en GPU consumer: si, por el reducido numero de parametros; no se detallan cuales.
- Opciones de despliegue: el autor proporciona `generate.py` en el repositorio de GitHub con los parametros de decodificacion reportados; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BPE on AMT MIDI (este) | 135M | no disponible | Texto a MIDI | other | Hugging Face + GitHub |
| SmolLM2-135M (base) | 135M | no disponible | Modelo de lenguaje | no disponible en la informacion | Hugging Face |
| Anticipatory Music Transformer | no disponible | no disponible | Generacion musical simbolica | no disponible | Referencia academica (Thickstun et al., 2024) |
| MIDI-LLM | no disponible | no disponible | Generacion musical simbolica | no disponible | Referencia academica (Wu et al., 2026) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion con 0 descargas y 0 likes: no hay evidencia de validacion por la comunidad ni de uso en produccion.
- Licencia "other" sin terminos detallados en la model card: es imprescindible revisar las condiciones antes de cualquier uso comercial.
- Los datasets de entrenamiento (Lakh MIDI, MidiCaps, GigaMIDI, MusicPile) tienen sus propios terminos de uso que deben verificarse; la model card lo advierte explicitamente.
- Riesgo de alucinacion y de generar piezas musicalmente incoherentes, especialmente en piezas largas, dado el reducido tamano del modelo base (135M).
- No se documentan sesgos conocidos ni evaluaciones de calidad musical objetivas.
- No se especifican la longitud de contexto ni los idiomas soportados para el caption, lo que limita la planificacion de uso.
- La calidad depende fuertemente de la decodificacion descrita (temperatura 0,9, top-p 1,0, gramatica de notas); desviarse de esos parametros puede degradar los resultados.
- No hay soporte documentado para servidores de inferencia estandar (vLLM, TGI, Ollama), lo que complica el despliegue escalado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Junnuo/BPE-on-AMT-MIDI
- Repositorio de codigo y resultados: https://github.com/Junnuo3/BPE-on-AMT-MIDI
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Referencia Anticipatory Music Transformer (Thickstun et al., 2024): no disponible
- Referencia MIDI-LLM (Wu et al., 2026): no disponible
