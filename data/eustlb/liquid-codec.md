# eustlb/Liquid-Codec

## Resumen

Liquid-Codec es el codec de audio (tokenizador de voz) del modelo LFM3-Audio-2B de Liquid AI, publicado por el usuario eustlb como repositorio independiente. Se trata de una copia temporal del subdirectorio `audio_tokenizer/` del modelo original (revision `2d6c1f99`), extraida para que el procesador de LFM3-Audio pueda referenciarla mientras la integracion en transformers esta en revision (PR huggingface/transformers#50393). Los pesos no han sido modificados respecto al original.

El modelo resuelve un problema concreto de infraestructura: permitir el acceso directo y estable al componente de tokenizacion de audio sin depender del repositorio completo de LFM3-Audio-2B. Con 73.559.090 parametros (aproximadamente 73,6 millones) y un tamano de repositorio de 0,3 GB, es un componente ligero dentro del ecosistema de modelos de audio de Liquid AI.

Es relevante ahora porque forma parte de la cadena de integracion de LFM3-Audio en el ecosistema Hugging Face transformers, y su existencia como repositorio separado facilita el desarrollo y las pruebas del pipeline de audio asociado. La licencia es `lfm1.0` (Liquid Foundation Models License), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 73.559.090 |
| Parametros activos | no aplica (no consta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (Liquid Foundation Models License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del codec en la informacion proporcionada. La model card unicamente indica que se trata del `audio_tokenizer/` de LFM3-Audio-2B, es decir, el componente encargado de la tokenizacion de voz dentro de un modelo de audio mas grande. No se especifican el tipo de red (por ejemplo, VQ-VAE, RVQ, encoder-decoder convolucional o transformer), el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO.

Tampoco se documentan innovaciones tecnicas especificas del codec (como decodificacion especulativa, atencion lineal o esquemas de cuantizacion residual). Cualquier afirmacion al respecto seria especulativa y no se incluye.

## Capacidades

- Tokenizacion de audio: forma parte del pipeline de procesamiento de voz de LFM3-Audio-2B.
- Integracion con transformers: disenado para ser referenciado por el procesador de LFM3-Audio.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede servirse a traves de la infraestructura de Inference Endpoints de Hugging Face.
- Capacidades de generacion de texto, razonamiento, codigo, matematicas o vision: no disponibles para este componente (es un codec, no un modelo generativo de lenguaje).
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio, etc.): unicamente audio, por su naturaleza de codec.

## Casos de uso

- Preprocesamiento de voz en pipelines ASR/TTS: el codec convierte audio en tokens discretos que pueden alimentar modelos de reconocimiento o sintesis de voz, al ser el tokenizador oficial de LFM3-Audio-2B.
- Integracion en transformers: util para desarrolladores que necesiten probar o extender el procesador de LFM3-Audio mientras la PR #50393 esta en revision, referenciando este repositorio de forma estable.
- Investigacion en representaciones discretas de audio: con 73,6 M de parametros y pesos en safetensors, es un componente manejable para experimentar con tokenizacion de voz en entornos academicos.
- Despliegue en Inference Endpoints: el tag `endpoints_compatible` permite servirlo como endpoint gestionado para tareas de codificacion de audio en produccion.
- Construccion de pipelines multimodales audio-texto: al ser el componente de audio de LFM3-Audio-2B, se puede combinar con el resto del modelo para tareas que requieran comprender o generar voz.
- Reproducibilidad de experimentos: al ser una copia con pesos sin modificar de una revision concreta (`2d6c1f99`), sirve para fijar versiones en entornos de investigacion y evitar derivas por actualizaciones del repositorio principal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 73,6 M de parametros, en precision FP32 los pesos ocupan aproximadamente 0,29 GB, y en FP16 alrededor de 0,15 GB, a lo que habria que sumar memoria para activaciones y buffers de audio.
- GPU recomendadas: no disponibles; por tamano, cualquier GPU consumer moderna (por ejemplo, RTX 3060 en adelante) deberia poder alojar los pesos, aunque no se documenta el rendimiento real.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del repositorio (0,3 GB), aunque no hay confirmacion oficial.
- Opciones de despliegue: transformers (libreria declarada), Inference Endpoints (tag `endpoints_compatible`); no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (codecs de audio o tokenizadores de voz) con datos verificables de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Licencia `lfm1.0` (Liquid Foundation Models License): es una licencia propia de Liquid AI, no una licencia open source estandar; es necesario revisar el archivo LICENSE para conocer las restricciones exactas de uso comercial.
- Repositorio temporal: la model card lo describe explicitamente como copia temporal mientras se revisa la integracion en transformers; podria quedar obsoleto o eliminarse.
- Componente parcial: no es un modelo autonomo de generacion; es el tokenizador de audio de LFM3-Audio-2B y carece de capacidades de lenguaje por si mismo.
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingue en la tokenizacion de voz.
- Sesgos y alucinaciones: no documentados para este componente; al ser un codec, el riesgo de alucinacion textual no aplica, pero si podria heredar sesgos acusticos del entrenamiento original, no especificados.
- Ausencia de benchmarks: no hay metricas publicadas de calidad de reconstruccion, tasas de error o latencia, lo que dificulta evaluar su idoneidad en produccion.
- Dependencia de version: vinculado a la revision `2d6c1f99` del modelo original; cambios en LFM3-Audio-2B no se reflejaran automaticamente aqui.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/eustlb/Liquid-Codec
- Modelo original LFM3-Audio-2B: https://huggingface.co/LiquidAI/LFM3-Audio-2B
- Pull request de integracion en transformers: https://github.com/huggingface/transformers/pull/50393
