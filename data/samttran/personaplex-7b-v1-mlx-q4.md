# samttran/personaplex-7b-v1-mlx-q4

## Resumen

PersonaPlex-7B-v1 es un modelo de voz a voz (speech-to-speech) conversacional en tiempo real desarrollado por NVIDIA, disenado para mantener dialogos full-duplex: escucha y habla simultaneamente, sin turnos estrictos, lo que permite interrupciones y respuestas solapadas propias de una conversacion humana. El modelo combina comprension de audio en streaming y generacion de voz en un unico transformer de 7.000 millones de parametros, construido a partir de Moshi (pesos Moshiko, CC-BY-4.0) y ampliado con control de voz y de rol (persona).

La ficha que nos ocupa no es el modelo original, sino una conversion comunitaria: `samttran/personaplex-7b-v1-mlx-q4`, publicada por el usuario samttran, que reempaqueta los pesos del modelo de NVIDIA en formato MLX cuantizado a 4 bits (group size 32) para inferencia en Apple Silicon. Incluye ademas los prompts de voz NAT de NVIDIA convertidos de PyTorch a NumPy (`.npz`) y un tokenizador Mimi, de modo que la inferencia no requiere PyTorch. El repositorio ocupa 5,6 GB.

Su relevancia practica es acotada pero clara: permite ejecutar un modelo conversacional full-duplex de 7B en un Mac sin GPU dedicada, mediante el runtime `personaplex-mlx`, orientado a aplicaciones de llamadas de voz en local (el autor lo usa en Idea Maker AI Desktop). Es una pieza de despliegue, no una variante entrenada: no aporta mejoras de calidad respecto al original y hereda su licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer speech-to-speech full-duplex (basado en Moshi), audio codificado con codec neuronal Mimi |
| Parametros totales | 7.000 millones (aproximado, segun denominacion del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits MLX, group size 32 (unico formato publicado en este repo) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (etiquetada como `other` en Hugging Face) |
| Formato de pesos | `model.q4.safetensors` (MLX 4-bit), voces en `.npz`, tokenizador Mimi en `.safetensors` y SentencePiece `.model` |
| Tamano del repositorio | 5,6 GB |
| Libreria / runtime | MLX, via `personaplex-mlx` |
| Plataforma objetivo | Apple Silicon (on-device) |
| Modelo base | `nvidia/personaplex-7b-v1` |

## Arquitectura y entrenamiento

El modelo original es un transformer conversacional que procesa audio continuo codificado con Mimi, el codec neuronal de Moshi, y genera simultaneamente tokens de audio mediante un esquema de streaming full-duplex. PersonaPlex anade al esquema de Moshi mecanismos de control de voz (prompts de voz NAT) y de rol o persona, de forma que el mismo modelo puede adoptar identidades y timbres distintos en tiempo de inferencia. La comprension y la generacion de habla se realizan de forma conjunta, no en cascada ASR + LLM + TTS.

La conversion de este repositorio no altera la arquitectura: unicamente reempaqueta los pesos del language model a 4 bits MLX con group size 32, convierte los prompts de voz de PyTorch `.pt` a NumPy `.npz` (campos `embeddings` y `cache`) y conserva sin cambios el tokenizador Mimi (`tokenizer-e351c8d8-checkpoint125.safetensors`), el tokenizador SentencePiece de 32k (`tokenizer_spm_32k_3.model`) y `config.json`. No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni etapas de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Conversacion de voz a voz en tiempo real con funcionamiento full-duplex (escucha y habla de forma simultanea).
- Manejo de interrupciones y solapamiento de turnos, propio de dialogo humano.
- Control de voz y de rol mediante prompts de voz predefinidos incluidos en el repositorio (`voices/*.npz`).
- Comprension de habla en streaming integrada en el mismo modelo que genera la respuesta.
- Generacion de habla directamente como tokens de audio, sin pipeline TTS separado.
- Ejecucion on-device en Apple Silicon sin dependencia de PyTorch.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Cobertura multilingue: no disponible.
- Modo thinking, vision o audio de entrada distinto del habla: no disponible.

## Casos de uso

- Asistentes de voz locales en macOS: el modelo se ejecuta sobre MLX en un Mac y permite conversaciones habladas sin enviar audio a la nube, lo que resulta adecuado para aplicaciones de privacidad sensible.
- Atencion al cliente con voz natural: el caracter full-duplex permite gestionar interrupciones y respuestas solapadas, algo que las cascadas ASR + LLM + TTS no manejan bien.
- Demos y prototipos de agentes conversacionales: util para validar experiencias de voz en tiempo real antes de invertir en infraestructura GPU.
- Pruebas de control de persona y timbre: los prompts de voz NAT incluidos permiten experimentar con distintas identidades vocales sin reentrenar.
- Investigacion en interaccion humano-maquina: el modelo sirve como banco de pruebas para estudiar turnos, interrupciones y latencia percibida en dialogo hablado.
- Integracion en aplicaciones de escritorio: el autor lo emplea en Idea Maker AI Desktop para llamadas de voz en vivo, lo que demuestra su viabilidad como componente embebido.
- Evaluacion comparativa de cuantizacion: la version 4-bit MLX permite medir el impacto de la cuantizacion en calidad de audio y latencia frente al modelo original en PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversion no incluye metricas de calidad de habla, latencia ni comparaciones con el modelo original.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio pesa 5,6 GB; en Apple Silicon los pesos 4-bit se cargan en memoria unificada, por lo que se recomienda un minimo de 8 GB y preferiblemente 16 GB o mas para margen de trabajo.
- GPU recomendadas: Apple Silicon (series M1, M2, M3, M4 y sus variantes Pro, Max y Ultra). No esta pensado para GPUs NVIDIA o AMD.
- Cabe en GPU consumer: si, en Macs con memoria unificada suficiente; no aplica a GPUs dedicadas convencionales por el formato MLX.
- Opciones de despliegue: runtime `personaplex-mlx` con carga `-q 4`; no se indica soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| samttran/personaplex-7b-v1-mlx-q4 | ~7B | no disponible | MLX 4-bit | NVIDIA Open Model License | Hugging Face, comunidad |
| nvidia/personaplex-7b-v1 | ~7B | no disponible | PyTorch (original) | NVIDIA Open Model License | Hugging Face, oficial |
| Moshi (Kyutai) | no disponible | no disponible | PyTorch | CC-BY-4.0 (pesos Moshiko) | Hugging Face / GitHub |

La comparativa se limita a estos tres porque la informacion disponible no detalla otros modelos de voz full-duplex con los que contrastar parametros, contexto o rendimiento. PersonaPlex deriva de Moshi, por lo que la comparacion con este ultimo es la mas directa; no se dispone de datos de benchmarks para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Es una conversion comunitaria, no oficial de NVIDIA; no hay garantia de equivalencia numerica exacta con el modelo original en PyTorch.
- Solo se publica cuantizacion 4-bit: no hay variantes 8-bit, bf16 ni GGUF en este repositorio, lo que limita el ajuste fino de calidad frente a velocidad.
- La licencia NVIDIA Open Model License impone condiciones especificas para uso comercial; es necesario revisar el texto completo y el archivo `NOTICE` antes de desplegar en produccion.
- El modelo hereda las limitaciones de Moshi y de los datos de entrenamiento originales, incluidos posibles sesgos en voces, acentos y estilos conversacionales; no se detallan en la informacion disponible.
- Riesgo de alucinacion y de respuestas incoherentes en audio, especialmente con cuantizacion agresiva a 4 bits; no hay evaluacion publicada al respecto.
- Idiomas soportados no documentados: no se puede asumir buen rendimiento en castellano sin validacion previa.
- Dependencia de Apple Silicon y del runtime `personaplex-mlx`; no es portable a otros aceleradores sin conversion adicional.
- Ausencia de soporte documentado de tool calling o de razonamiento multi-paso, lo que limita su uso como agente mas alla de la conversacion.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que reduce la evidencia de uso en produccion.

## Enlaces

- Repositorio de esta conversion: https://huggingface.co/samttran/personaplex-7b-v1-mlx-q4
- Modelo original de NVIDIA: https://huggingface.co/nvidia/personaplex-7b-v1
- Runtime MLX (Acelogic): https://github.com/Acelogic/personaplex-mlx
- Runtime MLX (mu-hashmi): https://github.com/mu-hashmi/personaplex-mlx
- Codigo de PersonaPlex: https://github.com/nvidia/personaplex
- Pagina del proyecto PersonaPlex: no disponible como URL directa en la informacion proporcionada
- Preprint de PersonaPlex: no disponible como URL directa en la informacion proporcionada
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
