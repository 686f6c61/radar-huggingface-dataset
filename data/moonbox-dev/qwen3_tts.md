# moonbox-dev/qwen3_tts

## Resumen

`moonbox-dev/qwen3_tts` es un repositorio de distribucion que empaqueta los modelos Qwen3-TTS de Alibaba Cloud (familia Qwen) convertidos a MLX para Apple Silicon y cuantizados a 6 y 8 bits. No es un modelo original: es un conjunto de artefactos preparados para que la aplicacion de escritorio Moonbox los descargue y ejecute en Mac con chip Apple. El repositorio incluye tanto los pesos originales en bf16 como las conversiones MLX de 6 y 8 bits, ademas del tokenizador de voz Qwen3-TTS-Tokenizer-12Hz.

La familia Qwen3-TTS cubre sintesis de voz con dos tamanos (0,6B y 1,7B parametros) y tres variantes funcionales: Base, CustomVoice (voces predefinidas y clonadas) y VoiceDesign (voces descritas en lenguaje natural con instrucciones de estilo de locucion). El repositorio esta pensado para inferencia local en Mac, no para servidores GPU convencionales, y su relevancia actual radica en llevar TTS de calidad a hardware de consumo Apple sin depender de servicios en la nube.

La licencia declarada es Apache 2.0 para todos los componentes, con copyright de Alibaba Cloud sobre los modelos originales. El autor del repositorio (Moonbox) declara no reclamar derechos sobre los modelos y limitarse a convertir y empaquetar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (modelo de sintesis de voz con tokenizador de audio Qwen3-TTS-Tokenizer-12Hz; arquitectura interna no detallada en la informacion disponible) |
| Parametros totales | 0,6B y 1,7B (dos tamanos incluidos en el repositorio) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (originales), 8-bit MLX, 6-bit MLX |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (Copyright 2026 Alibaba Cloud) |
| Formato de pesos | safetensors (MLX y bf16); libreria `mlx` |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna de Qwen3-TTS ni los datos de entrenamiento de los modelos originales; esa informacion corresponde a las model cards de Qwen, no incluidas aqui. Lo que si se detalla es la cadena de transformacion aplicada: los pesos originales en bf16 se convierten a formato MLX para Apple Silicon y se cuantizan a 6 y 8 bits, e incluyen el tokenizador de voz Qwen3-TTS-Tokenizer-12Hz como componente separado. Las conversiones de 6 y 8 bits proceden de `mlx-community` segun la model card.

La innovacion tecnica relevante en este repositorio no esta en el entrenamiento sino en el empaquetado: distribucion optimizada para inferencia local en Mac, con verificacion de integridad mediante una lista firmada que Moonbox comprueba antes de usar cada archivo. El repositorio contiene 34,1 GB en total, repartidos entre cinco modelos originales bf16, conversiones MLX de 6 bits (1,7B Base/CustomVoice/VoiceDesign y 0,6B Base/CustomVoice) y conversiones MLX de 8 bits (0,6B Base/CustomVoice y 1,7B Base, entre otras).

## Capacidades

- Sintesis de texto a voz (pipeline `text-to-speech`).
- Voces predefinidas en las variantes CustomVoice.
- Clonacion de voz a partir de muestras en las variantes Base y CustomVoice.
- Diseno de voz mediante descripcion en lenguaje natural e instrucciones de estilo de locucion, exclusivo de la variante VoiceDesign de 1,7B.
- Modelo mas ligero y rapido (0,6B) para escenarios sin voces descritas ni instrucciones de locucion.
- Tokenizacion de audio mediante Qwen3-TTS-Tokenizer-12Hz incluida en el paquete.
- Ejecucion local en Apple Silicon mediante MLX.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio de entrada ni modo de razonamiento.

## Casos de uso

- Audiolibros y narracion local en Mac: la variante 1,7B VoiceDesign permite definir el tono y el estilo de locucion mediante instrucciones en lenguaje natural, lo que encaja en produccion de narraciones con voz consistente sin servicios en la nube.
- Clonacion de voz para contenido personal: las variantes Base y CustomVoice permiten generar locuciones con una voz de referencia, util para podcasters y creadores que quieren mantener una identidad vocal propia.
- Prototipado rapido de interfaces de voz: la variante 0,6B en 6 bits reduce requisitos de memoria y acelera la generacion, adecuada para pruebas de concepto en portatiles Apple.
- Accesibilidad: lectura en voz alta de documentos y textos en aplicaciones de escritorio, con voces predefinidas y sin dependencia de APIs externas.
- Integracion en aplicaciones de escritorio macOS: el formato MLX y la libreria `mlx` permiten cargar los pesos directamente en apps nativas para Apple Silicon, como hace Moonbox.
- Generacion de voces para video y demos: el diseno de voz por descripcion de la variante VoiceDesign facilita producir voces diferenciadas para distintos personajes o secciones sin grabar muestras.
- Evaluacion de TTS en local para investigadores: disponer de pesos originales bf16 y conversiones de 6 y 8 bits en un mismo repositorio permite comparar el impacto de la cuantizacion en calidad de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 34,1 GB en total, pero cada variante individual es mucho menor (0,6B y 1,7B parametros en 6 u 8 bits).
- GPU recomendadas: el repositorio esta orientado a Apple Silicon mediante MLX; no se indican GPU NVIDIA (A100, H100, RTX 4090) como destino de estas conversiones.
- Cabe en hardware de consumo: si, en equipos Apple Silicon con memoria unificada suficiente para el modelo elegido; las variantes 0,6B en 6 bits son las mas ligeras.
- Opciones de despliegue: MLX (libreria declarada) y la aplicacion Moonbox; no se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| moonbox-dev/qwen3_tts (este repositorio) | 0,6B y 1,7B | no disponible | Apache 2.0 | Hugging Face, MLX | Empaquetado para Apple Silicon, 6/8 bits |
| Qwen/Qwen3-TTS-12Hz-0.6B-Base y variantes | 0,6B | no disponible | Apache 2.0 | Hugging Face | Pesos originales de Alibaba Cloud |
| Qwen/Qwen3-TTS-12Hz-1.7B-Base, -CustomVoice, -VoiceDesign | 1,7B | no disponible | Apache 2.0 | Hugging Face | Pesos originales con voces predefinidas y diseno de voz |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada; la comparacion se limita a parametros, licencia y formato de distribucion.

## Limitaciones y advertencias

- El repositorio no es una release oficial de los modelos Qwen3-TTS; es un empaquetado de terceros (Moonbox) con conversiones propias y de `mlx-community`.
- Las conversiones a 6 y 8 bits pueden degradar la calidad de la voz respecto a los pesos originales bf16; no se aportan mediciones de esa degradacion.
- Orientado exclusivamente a Apple Silicon mediante MLX; no es directamente utilizable en entornos CUDA sin conversion adicional.
- Sesgos conocidos de los modelos originales: no documentados en la informacion disponible.
- Riesgo de alucinacion o artefactos en la sintesis: no cuantificado en la informacion disponible.
- Idiomas soportados: no disponibles; conviene verificar en las model cards de Qwen antes de desplegar en produccion multilingue.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el aviso de copyright de Alibaba Cloud debe conservarse y cada componente se rige por su licencia.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/moonbox-dev/qwen3_tts
- Aplicacion Moonbox: https://moonbox.dev
- Modelo base Qwen3-TTS-12Hz-1.7B-Base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Modelo base Qwen3-TTS-12Hz-1.7B-CustomVoice: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Modelo base Qwen3-TTS-12Hz-1.7B-VoiceDesign: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign
- Modelo base Qwen3-TTS-12Hz-0.6B-Base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Modelo base Qwen3-TTS-12Hz-0.6B-CustomVoice: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
