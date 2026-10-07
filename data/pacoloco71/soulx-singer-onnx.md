# pacoloco71/SoulX-Singer-ONNX

# SoulX-Singer-ONNX (pacoloco71)

## Resumen

SoulX-Singer-ONNX es la conversion a formato ONNX de SoulX-Singer, un modelo de sintesis de voz cantada (singing voice synthesis, SVS) en modo zero-shot desarrollado por Soul AI Lab. El repositorio lo publica el usuario pacoloco71 y no contiene ningun entrenamiento ni ajuste fino: todos los pesos proceden del modelo original Soul-AILab/SoulX-Singer. Su proposito es permitir que el motor vocal integrado del DAW Trevor descargue y ejecute la sintesis localmente sin depender de PyTorch, aprovechando que ONNX Runtime funciona en CPU, DirectML y otras plataformas.

La arquitectura combina un transformer de flow matching (estilo diffusion transformer) de 22 capas tipo Llama con RMSNorm adaptativa al paso de tiempo, un frontend con bloques ConvNeXt-V2 y un vocoder Vocos. El modelo no incluye ninguna voz predefinida: clona la voz de una grabacion corta de referencia en tiempo de ejecucion, de ahi su caracter zero-shot. Soporta ingles y chino, y se distribuye bajo licencia Apache 2.0.

El repositorio ocupa 1,4 GB y separa el modelo en tres grafos (frontend, dit y vocos), dejando fuera la logica de muestreo Euler, la STFT inversa y la conversion grafema-fonema (G2P), que el consumidor debe implementar por su cuenta. Es relevante ahora porque demuestra como empaquetar un modelo de audio generativo moderno para inferencia portable y ligera fuera del ecosistema Python.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de flow matching (DiT) de 22 capas tipo Llama con RMSNorm adaptativa al paso de tiempo; frontend con cuatro bloques ConvNeXt-V2; vocoder Vocos |
| Parametros totales | no disponible (el autor no publica el recuento; el repositorio ocupa 1,4 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de sintesis de audio; no expone ventana de contexto de texto) |
| Tipos de cuantizacion | fp32 (frontend.onnx); fp16 en pesos con entradas y salidas fp32 (dit.onnx y vocos.onnx) |
| Idiomas soportados | ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo original SoulX-Singer es un sistema de sintesis de voz cantada en el que el nucleo es un transformer de flow matching con 22 capas tipo Llama. El paso de tiempo se incorpora mediante RMSNorm adaptativa y la generacion se realiza resolviendo un problema de flow matching mediante pasos de Euler con classifier-free guidance (escala 3, rescalada por 0,75). El frontend codifica la partitura y el texto: incluye codificadores de fonemas, de altura de nota, de tipo de nota y de embeddings de f0, seguidos de cuatro bloques ConvNeXt-V2, una expansion a tramas de mel (mel2note) y la proyeccion de condicion del decodificador. El vocoder final es Vocos, que reconstruye el espectro complejo (961 binas con hop 480 a 24 kHz).

Esta publicacion concreta no entrena ni ajusta nada: es una conversion de los pesos ya existentes. El modelo se divide en tres grafos ONNX (frontend, dit y vocos); el bucle de muestreo y la STFT inversa (padding "same", ventana Hann, n_fft 1920) quedan fuera de los grafos y los ejecuta el host, en el caso de Trevor en Rust (crates/autodaw_vocal). Los grafos dit.onnx y vocos.onnx se exportaron desde la version en media precision, de modo que sus pesos son los de SoulX-Singer redondeados a fp16, mientras que los pasos que el original mantiene en float32 (varianza de RMSNorm, softmax) siguen en float32. Como referencia de fidelidad de la conversion, los grafos fp32 reproducen el modelo PyTorch con 60 dB de SNR y los grafos fp16 difieren del modelo fp32 en menos de 0,2 dB de diferencia log-mel, un margen comparable a la propia inferencia fp16 en GPU del modelo original. La rama de flow matching deriva de Amphion (MIT) y la arquitectura del vocoder, de Vocos (MIT).

## Capacidades

- Sintesis de voz cantada zero-shot: clona la voz a partir de una grabacion corta de referencia, sin necesidad de entrenamiento especifico por voz.
- Control musical explicito: acepta informacion de notas (fonemas, altura, tipo de nota y f0) ademas del texto de la letra.
- Generacion de audio a partir de letra y partitura, con salida en espectrograma mel y reconstruccion a audio mediante vocoder.
- Multilingue: soporta texto en ingles y chino.
- Inferencia portable mediante ONNX Runtime en CPU, DirectML y otras plataformas compatibles.
- No dispone de tool calling ni de function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades de vision, audio de entrada distinto del prompt de voz, ni modo de razonamiento (thinking).

## Casos de uso

- Integracion en estaciones de trabajo de audio digital (DAW): el caso de uso previsto es el motor vocal del DAW Trevor, que descarga estos tres grafos ONNX en el primer uso para sintetizar voces cantadas directamente dentro de la aplicacion.
- Prototipado musical: generar lineas vocales de prueba a partir de una letra y una melodia concreta antes de contratar a un cantante, gracias al modo zero-shot que solo exige una grabacion corta de referencia.
- Clonacion de voz personal: crear una voz cantada propia o autorizada a partir de una muestra breve, util para demos y proyectos personales.
- Investigacion academica en sintesis de voz cantada: la model card indica que el modelo esta pensado para investigacion academica y fines educativos, por lo que sirve como base reproducible en experimentos de SVS.
- Tecnologias de asistencia: la propia model card menciona aplicaciones de asistencia como uso legitimo, por ejemplo dar voz cantada a personas que la han perdido.
- Integracion multiplataforma sin Python: al ejecutarse sobre ONNX Runtime, puede embeberse en aplicaciones de escritorio o moviles sin arrastrar el stack de PyTorch.
- Localizacion musical: producir versiones cantadas en ingles y chino a partir de la misma partitura, aprovechando el soporte bilingue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad en la informacion disponible. La model card solo documenta metricas de fidelidad de la conversion (no de calidad musical):

| Metrica | Resultado |
|---|---|
| Concordancia de los grafos fp32 con el modelo PyTorch | 60 dB de SNR |
| Diferencia de los grafos fp16 respecto al modelo fp32 | menos de 0,2 dB de diferencia log-mel |
| Diferencia esperada frente a inferencia fp16 en GPU | comparable a la del modelo original en fp16 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia, el repositorio completo ocupa 1,4 GB, por lo que el conjunto de trabajo en inferencia es del orden de pocos gigabytes (principalmente dit.onnx y vocos.onnx en fp16).
- GPU: no se especifican modelos concretos. Al ejecutarse sobre ONNX Runtime, funciona con CPU y con DirectML, lo que cubre aceleradores variados.
- GPU de consumo: por el tamano del repositorio (1,4 GB), cabe con holgura en GPU de consumo con varios gigabytes de memoria; no se publican cifras exactas.
- Opciones de despliegue: ONNX Runtime (CPU, DirectML y otros proveedores de ejecucion). No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Dependen del numero de pasos de Euler y del proveedor de ejecucion elegido.
- Nota: el modelo no incluye el muestreo, la STFT inversa ni el G2P; hay que aportar esos componentes en el host para completar la inferencia.

## Comparativa con modelos similares

| Modelo | Formato | Precision | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SoulX-Singer-ONNX (este) | ONNX (3 grafos) | fp32 y fp16 | en, zh | Apache 2.0 | HuggingFace pacoloco71 |
| SoulX-Singer (original, Soul-AILab) | Pesos PyTorch | fp32 (con autocast fp16 en GPU) | en, zh | Apache 2.0 | Repositorio del autor base |
| Otros modelos de SVS zero-shot | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion principal es con el modelo base del que deriva: la version ONNX mantiene los mismos pesos y funciona sin PyTorch, a cambio de fragmentar el modelo en tres grafos y delegar el muestreo y la STFT inversa al host. No se dispone de datos sobre alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado: es una conversion de pesos. Cualquier limitacion del SoulX-Singer original se hereda tal cual.
- Los grafos no incluyen el bucle de muestreo, la STFT inversa ni el G2P; sin implementar esos componentes externamente el modelo no produce audio.
- La cuantizacion a fp16 introduce una diferencia de hasta 0,2 dB en el log-mel respecto a fp32, comparable a la inferencia fp16 del modelo original pero no nula.
- Solo cubre ingles y chino; no hay soporte de otros idiomas.
- Riesgo de artefactos y de resultados imperfectos en voces o estilos alejados de los datos de entrenamiento; no hay benchmarks de calidad publicados.
- El repositorio no contiene ninguna voz: clona la del prompt de referencia, por lo que la calidad depende de la grabacion aportada.
- Uso responsable: la model card original restringe el modelo a investigacion academica, fines educativos y aplicaciones legitimas, y prohibe suplantar personas sin autorizacion o crear audio enganoso.
- Licencia Apache 2.0 para el modelo y los pesos de SoulX-Singer; el transformer de flow matching deriva de Amphion (MIT) y el vocoder de Vocos (MIT), por lo que conviene respetar tambien esas atribuciones.
- El autor de la conversion declina responsabilidad por el mal uso del modelo.
- Repositorio muy reciente y sin descargas ni interacciones en el momento de redactar esta ficha, por lo que su mantenimiento futuro no esta garantizado.

## Enlaces

- HuggingFace (esta conversion): https://huggingface.co/pacoloco71/SoulX-Singer-ONNX
- Modelo base: https://huggingface.co/Soul-AILab/SoulX-Singer
- Repositorio de SoulX-Singer: https://github.com/Soul-AILab/SoulX-Singer
- Articulo (arXiv): https://arxiv.org/abs/2602.07803
- Amphion: https://github.com/open-mmlab/Amphion
- Vocos: https://github.com/gemelo-ai/vocos
