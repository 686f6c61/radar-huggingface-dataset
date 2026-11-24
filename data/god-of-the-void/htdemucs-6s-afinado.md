# god-of-the-void/HTDemucs-6s-afinado

## Resumen

HTDemucs-6s-afinado es un ajuste fino (fine-tune) del modelo de separación de fuentes musicales HTDemucs 6s desarrollado originalmente por Alexandre Défossez en Meta AI. Lo publica el estudio GOD OF THE VOID (CHAOS-X) bajo el identificador `god-of-the-void/HTDemucs-6s-afinado`. No se trata de una arquitectura nueva: es el mismo separador de seis pistas (voces, batería, bajo, guitarra, piano y «other») reentrenado durante 2.000 pasos con música de licencia abierta para mejorar la calidad de separación sobre la versión base.

El modelo resuelve el problema de separar una mezcla musical en sus componentes instrumentales, una tarea clásica de *music source separation* evaluada habitualmente con SDR (Signal-to-Distortion Ratio). Su relevancia radica en dos aspectos: por un lado, mejora de forma notable las métricas del modelo original (SDR medio de 8,48 dB frente a 5,29 dB en Slakh2100, y de 9,95 dB frente a 7,19 dB en voces reales); por otro, el entrenamiento se realizó íntegramente en Rust sobre MLX en un Apple M1 Max, sin Python, lo que lo convierte en una pieza interesante para quien investigue toolchains de entrenamiento nativos en Apple Silicon.

La arquitectura subyacente es HTDemucs (Hybrid Transformer Demucs), un modelo híbrido de transformer y dominio de forma de onda. El repositorio ocupa 0,1 GB y los pesos afinados pesan 55 MB en formato safetensors. La licencia no está concedida explícitamente y el autor lo restringe a investigación y evaluación, sin uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HTDemucs (Hybrid Transformer Demucs), híbrido transformer + dominio de onda |
| Parametros totales | no disponible (el autor menciona 525 parámetros en el contexto de la verificación de gradientes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de audio, independiente del idioma) |
| Licencia | unknown; el autor indica «research only, no commercial use, no warranty» |
| Formato de pesos | safetensors (`afinado.safetensors`, 55 MB) + YAML de configuración del bag Demucs |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura HTDemucs descrita en *Hybrid Transformers for Music Source Separation* (Rouard, Massa y Défossez, ICASSP 2023). Se trata de un separador híbrido que combina procesamiento en el dominio de la forma de onda con atención tipo transformer, capaz de separar una mezcla en seis pistas: voces, batería, bajo, guitarra, piano y «other». El fine-tune no modifica la arquitectura, solo los pesos.

El entrenamiento se realizó con el entrenador propio de GOTV, escrito en Rust sobre MLX y ejecutado en un Apple M1 Max, tras verificar que los gradientes coincidían con los de PyTorch en los 525 parámetros comprobados (error relativo de 1,75e-5). Se ejecutaron 2.000 pasos. Los datos de entrenamiento son todos de licencia Creative Commons Attribution: Slakh2100 (CC BY 4.0, dataset renderizado desde MIDI), VocalSet (CC BY 4.0, dataset de voz cantada) y 447 pistas a cappella de ccMixter (CC BY 2.5 y 3.0), con verificación explícita de que ninguna tenía cláusulas NC o SA. Los datos no se distribuyen con el modelo.

## Capacidades

- Separación de fuentes musicales en seis pistas: voces, batería, bajo, guitarra, piano y «other».
- Procesamiento audio-a-audio (pipeline `audio-to-audio`).
- Mejora medible sobre el modelo base en SDR, especialmente en voces reales.
- Integración con la aplicación de GOD OF THE VOID (ajustes → generadores → descarga y uso automático).
- Uso mediante CLI `gotv` (`gotv split song.mp3 --six`).
- No soporta texto, tool calling, agentes ni capacidades multilingües: es un modelo puramente de audio.

## Casos de uso

- Producción musical y remezclas: separar una mezcla en seis pistas para aislar voces o instrumentos y trabajar sobre ellos en el DAW, aprovechando la mejora en SDR de voces (19,64 dB frente a 18,58 dB del base).
- Creación de karaokes y pistas instrumentales: extraer la pista de voces y descartarla para obtener una versión instrumental, con la ventaja de disponer de stems separados de batería, bajo, guitarra y piano.
- Investigación en separación de fuentes: usar el modelo como referencia afinada para comparar con otras arquitecturas, dado que el autor publica las métricas y el fichero `juicio.json` con los números en bruto.
- Estudio de toolchains de entrenamiento en Apple Silicon: el modelo sirve como caso práctico de fine-tune en Rust + MLX verificado frente a PyTorch, útil para quien investigue entrenamiento nativo en Mac.
- Sampleado y manipulación creativa: aislar la pista de guitarra o piano para reutilizarla en composiciones, aunque el autor advierte que estas pistas son las más difíciles (≈5 dB) y deben tomarse como punto de partida.
- Evaluación de calidad de separación en mezclas reales: el modelo se evaluó sobre voces reales retenidas, lo que permite usarlo como banco de pruebas para medir el impacto de efectos y reverberación en la separación.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (SDR en dB, mayor es mejor):

| Conjunto de prueba | HTDemucs 6s | Este modelo |
|---|---:|---:|
| Slakh2100 test — media de 5 pistas | 5,29 | **8,48** |
| Voces reales retenidas — media de 6 pistas | 7,19 | **9,95** |
| Voces reales retenidas — pista de voces | 18,58 | **19,64** |

Desglose por pista en Slakh2100 test (este modelo): batería 14,19 · bajo 11,21 · other 6,45 · guitarra 5,65 · piano 4,92. Los números en bruto y el recuento de pistas están en `juicio.json`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; los pesos ocupan 55 MB, por lo que el modelo es muy ligero en memoria.
- GPU recomendadas: el autor lo entrenó y probó en Apple M1 Max con MLX; no se documentan requisitos para GPU NVIDIA.
- Cabe en GPU de consumo: sí, por el tamaño reducido de los pesos (55 MB), aunque no se detallan requisitos mínimos.
- Opciones de despliegue: aplicación de GOD OF THE VOID y CLI `gotv`; la librería declarada es `gotv`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Pistas | SDR Slakh2100 (media) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HTDemucs-6s-afinado | no disponible (pesos 55 MB) | 6 | 8,48 | unknown (research only) | Hugging Face |
| HTDemucs 6s (base) | no disponible | 6 | 5,29 | weights unclear (posible CC-NC-BY) | GitHub / Meta |
| Demucs v4 (HTDemucs, 4 pistas) | no disponible | 4 | no disponible | MIT (código); pesos dudosos | GitHub |

No se dispone de datos de otros separadores de seis pistas comparables en la información proporcionada.

## Limitaciones y advertencias

- Guitarra y piano siguen siendo las pistas más difíciles (≈5 dB de SDR): deben usarse como punto de partida, no como stem terminado.
- Solo se entrenaron 2.000 pasos: mejora el modelo base, pero no sustituye un entrenamiento completo.
- Slakh2100 está renderizado desde MIDI; las mezclas reales con efectos intensos pueden obtener menos ganancia.
- Licencia no concedida: el autor restringe el uso a investigación y evaluación, sin uso comercial ni garantía. El modelo base tiene licencia de pesos poco clara (posible CC-NC-BY), y este fine-tune hereda ese estado.
- Riesgo de alucinación: no aplica en el sentido de texto, pero puede generar artefactos o separaciones imperfectas en mezclas complejas.
- Sesgos: el entrenamiento usa datos CC BY (Slakh2100, VocalSet, ccMixter); puede tener sesgo hacia los géneros y estilos presentes en esos datasets.
- No soporta texto, agentes ni tool calling; su uso está limitado a separación de audio.

## Enlaces

- Hugging Face: https://huggingface.co/god-of-the-void/HTDemucs-6s-afinado
- Repositorio del autor: https://github.com/CHAOSX-SPACE/god-of-the-void
- Sitio del estudio: https://chaosx.space
- Modelo base: https://huggingface.co/adefossez/HTDemucs-6s
- Repositorio Demucs: https://github.com/adefossez/demucs
- Paper HTDemucs (ICASSP 2023): Rouard, Massa y Défossez, *Hybrid Transformers for Music Source Separation*
- Slakh2100: https://zenodo.org/records/4599666
- VocalSet: https://zenodo.org/records/1193957
