# coolthor/VoxCPM2-Q4_K_M-GGUF

## Resumen

VoxCPM2-Q4_K_M-GGUF es una cuantización GGUF del modelo base de VoxCPM2, un sistema de síntesis de voz (text-to-speech) con clonación de voz desarrollado originalmente por OpenBMB. El repositorio lo publica el usuario coolthor y está pensado para su uso con llama.cpp-omni, una bifurcación de llama.cpp orientada a modelos multimodales. El modelo base cuenta con 1.622.165.632 parámetros (aproximadamente 1,6 mil millones) y está especializado en generar audio de voz a partir de texto, incluyendo la capacidad de imitar una voz de referencia.

La relevancia de esta publicación concreta no reside en el modelo en sí, sino en la receta de cuantización. El autor retiró una versión anterior Q4_K_M porque producía fallos graves en frases largas (la voz se volvía distante y la parte final ininteligible). La versión actual, denominada "protected 4-bit", usa una base Q4_K_S pero mantiene las proyecciones V de atención y las proyecciones down de la FFN en Q6_K en las 28 capas del modelo, lo que mitiga esos fallos a costa de un tamaño ligeramente mayor.

El modelo está orientado a la generación de voz en chino e inglés, con licencia Apache 2.0 y un tamaño de repositorio de 4,5 GB. Se distribuye en tres variantes de cuantización (protected 4-bit, Q5_K_M y Q6_K) y requiere un componente acústico separado en F16 que no se aloja en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer para TTS (BaseLM de VoxCPM2) con pila acústica separada |
| Parametros totales | 1.622.165.632 (aprox. 1,6 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_S con V/down en Q6_K (protected 4-bit), Q5_K_M, Q6_K; pila acústica en F16 |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es la BaseLM de VoxCPM2, un sistema de text-to-speech con clonación de voz. La arquitectura concreta del backbone no se detalla en la información disponible; el autor solo indica que consta de 28 capas y que la pila acústica (Acoustic) se mantiene en F16 como componente separado. La generación se realiza mediante clonación basada en continuación (continuation-based cloning) a partir de una referencia de voz y su transcripción, con 10 pasos de inferencia, CFG de 2 y temperatura 1 en la evaluación publicada.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable de esta publicación es la receta de cuantización mixta: mantener las proyecciones de valor de atención y las proyecciones down de la FFN en Q6_K mientras el resto del modelo va en Q4_K_S. Según el autor, esta combinación evita los fallos de síntesis observados con Q4_K_M puro en frases largas, aunque no se demuestra que los elimine por completo.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en chino e inglés.
- Clonación de voz: imita el timbre y las características de una grabación de referencia proporcionada junto con su transcripción.
- Generación de audio de 16 kHz mono.
- Control mediante parámetros de inferencia (pasos de difusión, CFG, temperatura).
- Compatible con llama.cpp-omni a través de la herramienta `tools/omni/voxcpm2`.
- Soporte de endpoints compatibles (tag `endpoints_compatible`).
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- Generación de audiolibros y narraciones: el modelo puede sintetizar texto largo en chino o inglés con una voz consistente, usando una referencia de voz para fijar el timbre a lo largo de toda la obra.
- Doblaje y localización de contenido: al permitir clonación de voz, se puede mantener la identidad vocal de un locutor original al generar versiones en otro idioma soportado.
- Asistentes de voz embebidos: con 1,6 B de parámetros y cuantización de 4 bits (aproximadamente 1 GB para la BaseLM), es viable desplegarlo en entornos con recursos limitados junto a la pila acústica F16.
- Accesibilidad: conversión de texto a voz personalizada para usuarios que necesiten una voz sintética con características específicas.
- Prototipado de interfaces conversacionales: integración en pipelines de llama.cpp-omni para experimentar con TTS dentro de aplicaciones multimodales.
- Generación de voces para contenido educativo o divulgativo: producción de material audio con voces claras y reproducibles en dos idiomas.
- Investigación en TTS: base cuantizada para experimentar con recetas de cuantización mixta y evaluar su impacto en la calidad de síntesis.

## Benchmarks y rendimiento

El autor publica una evaluación sobre 47 frases (chino e inglés) con 3 semillas (141 tomas por receta, 423 en total) en una RTX 5090 (sm120, CUDA 12.8.93), usando MLX Whisper large-v3-turbo como reconocedor principal y SenseVoice Small int8 como verificación independiente.

| BaseLM | Fallos acústicos (proxy) | CER chino | WER inglés | Similitud de hablante (coseno) | RTF ponderado | RTF p95 |
|---|---:|---:|---:|---:|---:|---:|
| Protected 4-bit | 0/141 | 8,89 % | 5,00 % | 0,9724 | 0,221 | 0,344 |
| Q5_K_M | 0/141 | 9,07 % | 11,48 % | 0,9721 | 0,225 | 0,348 |
| Q6_K | 0/141 | 7,98 % | 9,26 % | 0,9732 | 0,224 | 0,350 |

El autor advierte que las diferencias entre recetas están dentro del ruido de una comparación de escucha pequeña y que el intervalo bootstrap del 95 % para la diferencia de CER entre protected 4-bit y Q6_K cruza cero (-0,78 a +3,81 puntos porcentuales). No se estableció una ventaja consistente de mayor profundidad de bits. El proxy de fallos acústicos no está calibrado contra escucha humana. No hay comparación con Q8 ni validación en RTX 2080 Ti.

## Requisitos de hardware

- VRAM estimada: la BaseLM protected 4-bit ocupa 1001,06 MiB; Q5_K_M 1109,50 MiB; Q6_K 1272,65 MiB. Hay que sumar la pila acústica `VoxCPM2-Acoustic-F16.gguf`, cuyo tamaño no se indica en la información disponible.
- GPU recomendadas: RTX 5090 (probada por el autor). No se han validado estas recetas en RTX 2080 Ti ni en otras arquitecturas.
- Compatibilidad con GPU de consumo: probable en tarjetas con suficiente VRAM para BaseLM más pila acústica F16, pero no confirmado por el autor para modelos concretos.
- Opciones de despliegue: llama.cpp-omni (`tools/omni/voxcpm2`). No se documentan vLLM, TGI ni Ollama.
- Latencia y throughput: RTF ponderado de 0,221 y p95 de 0,344 en RTX 5090 (tiempo de generación dividido por duración del audio, incluyendo codificación de referencia y excluyendo carga de modelo, ASR y transferencias).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| VoxCPM2 protected 4-bit (este repo) | 1,6 B | No disponible | zh, en | Apache 2.0 | GGUF | Cuantización mixta Q4_K_S/Q6_K para llama.cpp-omni |
| VoxCPM2 Q5_K_M | 1,6 B | No disponible | zh, en | Apache 2.0 | GGUF | Mayor profundidad de bits, CER chino 9,07 % |
| VoxCPM2 Q6_K | 1,6 B | No disponible | zh, en | Apache 2.0 | GGUF | Mayor tamaño, CER chino 7,98 % |
| VoxCPM2 base (openbmb/VoxCPM2) | 1,6 B | No disponible | zh, en | Apache 2.0 | safetensors | Modelo original sin cuantizar |

No se dispone de información sobre otros modelos TTS comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El autor retiró la versión anterior Q4_K_M por fallos de síntesis en frases largas; la receta protected reduce el riesgo pero no garantiza su eliminación.
- El proxy de fallos acústicos no está calibrado contra escucha humana y puede pasar por alto degradaciones de contenido con loudness y pitch estables.
- La evaluación se hizo sobre un conjunto deliberadamente seleccionado (frases problemáticas y frases largas en mandarín), no sobre tráfico de producción aleatorio.
- Solo se validó en RTX 5090 bajo WSL; no hay validación en RTX 2080 Ti ni comparación con Q8.
- Solo soporta chino e inglés; no se documentan otros idiomas.
- No se dispone de información sobre sesgos, riesgo de alucinación en el contenido sintetizado ni limitaciones de contexto.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base y de la pila acústica alojada en otro repositorio.
- Requiere descargar el componente acústico F16 desde `DennisHuang648/VoxCPM2-GGUF`, que no se aloja en este repositorio.
- El nombre del repositorio conserva "Q4_K_M" por continuidad, pero el archivo principal usa una receta distinta (protected 4-bit).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/coolthor/VoxCPM2-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
- Pila acústica F16: https://huggingface.co/DennisHuang648/VoxCPM2-GGUF
- llama.cpp-omni: https://github.com/tc-mb/llama.cpp-omni
- Modelo de similitud de hablante: https://huggingface.co/microsoft/wavlm-base-plus-sv
