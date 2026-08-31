# NostraEmpire/mirror-phi-4-multimodal-instruct

## Resumen

Phi-4-multimodal-instruct es un modelo fundacional multimodal ligero desarrollado por Microsoft, y este repositorio de NostraEmpire es un espejo (mirror) del original. Con 5.574.460.384 parametros (~5,6B), el modelo procesa entradas de texto, imagen y audio, y genera salidas de texto, con una ventana de contexto de 128K tokens. Esta construido sobre el backbone de Phi-4-mini, anadiendo codificadores de vision y audio mediante adaptadores LoRA.

El modelo destaca por unificar tres modalidades en un unico transformer compacto, lo que lo hace adecuado para entornos con restricciones de memoria y latencia. Fue mejorado mediante fine-tuning supervisado (SFT), direct preference optimization (DPO) y reinforcement learning from human feedback (RLHF). En el momento de su lanzamiento, se posiciono como el primer modelo open source capaz de realizar resumen de voz (speech summarization) y alcanzo el primer puesto en el HuggingFace Open ASR Leaderboard con un WER del 6,14%.

La licencia MIT permite uso comercial y de investigacion sin restricciones significativas, lo que convierte a este modelo en una opcion atractiva para produccion. El soporte multilingue abarca 23 idiomas para texto, 8 para audio y solo ingles para vision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone Phi-4-mini + codificadores de vision y audio con LoRA) |
| Parametros totales | 5.574.460.384 (~5,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors en precision original; no se confirman conversiones GGUF/AWQ en este repositorio) |
| Idiomas soportados | Texto: arabe, chino, checo, danes, neerlandes, ingles, fines, frances, aleman, hebreo, hungaro, italiano, japones, coreano, noruego, polaco, portugues, ruso, espanol, sueco, tailandes, turco, ucraniano. Vision: solo ingles. Audio: ingles, chino, aleman, frances, italiano, japones, espanol, portugues |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Phi-4-mini, un modelo de lenguaje denso de 5,6B parametros, al que se anaden codificadores especializados para vision y audio integrados mediante adaptadores LoRA. Esta estrategia permite que el modelo comparta el backbone linguistico para las tres modalidades, manteniendo un tamano compacto y un coste de inferencia reducido. El proceso de entrenamiento combina SFT, DPO y RLHF para optimizar la adherencia a instrucciones y la seguridad de las respuestas. Los datos de entrenamiento provienen de las investigaciones y datasets utilizados en los modelos Phi-3.5 y Phi-4.0. El informe tecnico completo esta disponible en arxiv:2503.01743.

## Capacidades

- Generacion de texto y razonamiento, con especial solidez en matematicas y logica
- Comprension general de imagenes: descripcion, respuesta a preguntas visuales (VQA) y comparacion de multiples imagenes
- Reconocimiento optico de caracteres (OCR)
- Comprension de graficos y tablas
- Resumen de multiples imagenes o clips de video
- Reconocimiento automatico de voz (ASR) en 8 idiomas
- Traduccion de voz (speech translation)
- Respuesta a preguntas sobre audio (speech QA)
- Resumen de voz (speech summarization), capacidad pionera en open source
- Soporte de tool calling y function calling para integracion en agentes
- Razonamiento multi-paso para tareas de agente
- Capacidades multilingues: 23 idiomas para texto, 8 para audio

## Casos de uso

- Transcripcion de audio automat
