# Hebrish/Sabich-Parakeet-110M-sherpa-onnx-int8

## Resumen

Sabich-Parakeet-110M-sherpa-onnx-int8 es una version cuantizada a int8 del modelo de reconocimiento automatico del habla (ASR) Hebrish/Sabich-Parakeet-110M, empaquetada en formato ONNX para su uso con el runtime sherpa-onnx. El modelo esta disenado especificamente para escenarios de code-switching entre ingles (en) y hebreo (he), es decir, conversaciones en las que el hablante alterna entre ambos idiomas dentro de la misma frase. Su tamano reducido (110M parametros) y su cuantizacion int8 lo orientan a inferencia on-device y en entornos con recursos limitados.

El modelo deriva de la familia Parakeet, una arquitectura de ASR basada en FastConformer (variante de Conformer con atencion por bloques) desarrollada originalmente por NVIDIA. La publicacion la realiza el usuario Hebrish, y el artefacto esta pensado para integrarse en aplicaciones que usan sherpa-onnx, la capa de despliegue de k2-fsa/next-gen Kaldi que permite ejecutar modelos ASR en C++, Python, Android, iOS y otras plataformas sin dependencias de PyTorch en tiempo de ejecucion.

La relevancia de esta ficha radica en que cubre un nicho poco atendido: ASR bilingue en/he con despliegue ligero. No obstante, la informacion publica disponible es muy escasa (0 descargas, 0 likes, sin model card detallada ni benchmarks publicados), por lo que muchos campos de esta ficha se marcan como "no disponible". El acceso es restringido (gated) y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet (FastConformer, ASR); pesos exportados a ONNX int8 para sherpa-onnx |
| Parametros totales | 110M (segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (unica variante publicada en este repo) |
| Idiomas soportados | en (ingles), he (hebreo); soporte de code-switching en/he |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (int8), empaquetado para sherpa-onnx |
| Tamano del repo | 0.1 GB |
| Modelo base | Hebrish/Sabich-Parakeet-110M |
| Acceso | Restringido (gated) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a la familia Parakeet, basada en FastConformer: un transformer convolucional con atencion por bloques (block-wise attention) que reduce el coste computacional de la atencion sobre secuencias de audio largas. Los modelos Parakeet originales de NVIDIA emplean un encoder FastConformer seguido de un decoder CTC o RNN-T/Transducer; no se especifica en la informacion disponible cual de estas cabezas usa esta variante concreta. El modelo base tiene 110M parametros, lo que lo situa en la gama ligera.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus (horas de audio en ingles, hebreo y mezcla), ni sobre si se aplicaron tecnicas de aumento de datos, especulacion o RLHF (poco habitual en ASR). Tampoco se documenta el proceso de cuantizacion a int8 ni el pipeline exacto de exportacion a ONNX. La innovacion principal del artefacto es el empaquetado para sherpa-onnx, que permite decodificacion en streaming y por lotes sin PyTorch.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles y hebreo.
- Soporte de code-switching en/he: reconocimiento de utterances que alternan idiomas.
- Inferencia on-device gracias al formato ONNX int8 y al runtime sherpa-onnx.
- Ejecucion multiplataforma via sherpa-onnx (C++, Python, Android, iOS, etc.).
- No se documenta soporte de tool calling, agentes, vision, audio generativo ni modo "thinking".
- No se documenta deteccion de hablantes, diarizacion ni puntuacion/restauracion de mayusculas.

## Casos de uso

- Transcripcion de reuniones bilingues en/he: el modelo puede transcribir conversaciones donde los participantes alternan entre hebreo e ingles, gracias a su entrenamiento especifico en code-switching.
- Subtitulado en directo de contenido audiovisual israeli: util para plataformas que emiten contenido con mezcla de idiomas y necesitan subtitulos automaticos con baja latencia.
- Asistentes de voz on-device: al ser un modelo de 110M parametros en int8, cabe en dispositivos moviles y permite dictado o comandos por voz sin enviar audio a la nube.
- Transcripcion de notas de voz en aplicaciones de mensajeria: integrable via sherpa-onnx en apps Android/iOS para convertir audio en texto localmente.
- Analisis de llamadas de atencion al cliente en centros bilingues: transcripcion por lotes de grabaciones para analitica y control de calidad.
- Investigacion en ASR code-switching: como baseline ligero para experimentos academicos sobre mezcla en/he, dado su tamano reducido y licencia permisiva.
- Sistemas embebidos y edge computing: despliegue en dispositivos con recursos limitados (Raspberry Pi, moviles) usando sherpa-onnx sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye WER (word error rate), CER, ni comparaciones con otros modelos en los conjuntos de evaluacion habituales (Common Voice, FLEURS, etc.).

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por el tamano (110M parametros, int8, ~0.1 GB de repo) se estima un consumo de memoria en el orden de cientos de MB, aunque no se confirma en la informacion.
- GPU recomendadas: no disponible; el modelo esta orientado a CPU y edge, no a GPU de datacenter.
- Cabe en consumer GPU: si, con margen amplio, aunque su diseno apunta a ejecucion en CPU.
- Opciones de despliegue: sherpa-onnx (runtime principal), ONNX Runtime; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a ASR).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Contexto |
|---|---|---|---|---|---|
| Sabich-Parakeet-110M-sherpa-onnx-int8 | 110M | en, he (code-switching) | ONNX int8 | cc-by-4.0 | no disponible |
| Whisper small (OpenAI) | 244M | multilingue (99 idiomas) | safetensors, GGUF, ONNX | MIT | 30 s de audio |
| Whisper base (OpenAI) | 74M | multilingue | safetensors, GGUF | MIT | 30 s de audio |
| NVIDIA Parakeet TDT 0.6B v2 | 600M | en | NeMo, ONNX | CC-BY-4.0 | no disponible |

La comparativa es aproximada: no se dispone de datos de rendimiento del modelo evaluado frente a estas alternativas. Whisper small y base ofrecen cobertura multilingue mas amplia pero no estan especializados en code-switching en/he; Parakeet TDT 0.6B v2 es de mayor tamano y solo ingles.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar el modelo.
- Informacion publica muy escasa: sin model card detallada, sin benchmarks y con 0 descargas registradas, lo que dificulta evaluar su calidad real.
- Sesgos desconocidos: no se documenta la composicion del corpus ni posibles sesgos de acento, genero o dialecto.
- Riesgo de alucinacion y errores de transcripcion: inherente a los modelos ASR, especialmente en audio ruidoso o con code-switching denso.
- Limitaciones de idioma: solo en y he; no cubre otros idiomas ni variantes dialectales del hebreo de forma explicita.
- Licencia cc-by-4.0: permite uso comercial con atribucion, pero conviene verificar las condiciones del modelo base y del acceso gated.
- Formato ONNX int8: la cuantizacion puede degradar ligeramente la precision frente al modelo base en fp32/fp16; no se documenta el impacto.
- No apto para tareas distintas de ASR (no hace traduccion, diarizacion ni comprension semantica).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hebrish/Sabich-Parakeet-110M-sherpa-onnx-int8
- Modelo base: https://huggingface.co/Hebrish/Sabich-Parakeet-110M
- DOI: https://doi.org/10.57967/hf/11181
- sherpa-onnx (runtime): https://github.com/k2-fsa/sherpa-onnx
- Familia Parakeet (NVIDIA): https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
