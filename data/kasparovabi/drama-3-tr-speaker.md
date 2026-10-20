# kasparovabi/drama-3-tr-speaker

## Resumen

`kasparovabi/drama-3-tr-speaker` es un modelo de texto a voz en turco derivado de Fish Audio Drama 3, un MoE híbrido de 35 000 millones de parámetros. Lo desarrolla el usuario kasparovabi como una obra derivada no oficial: Fish Audio no patrocina ni respalda esta publicación. El modelo base lee el prompt de texto una vez en la fase de prefill; este "speaker" destilado conserva 32 de los 256 expertos enrutados de cada capa (12,5 %) y se encarga de generar cada fotograma de audio durante la decodificación.

La propuesta es hacer viable un TTS turco de gran tamaño en una GPU de consumo: el par completo se ejecuta en una RTX 5070 Ti de 16 GB, cerca del tiempo real en frases cortas y entre 1,7 y 1,9 veces el tiempo real en párrafos, manteniendo las direcciones inline y la emoción del modelo original. Para reducir la RAM necesaria, los expertos se leen directamente desde una unidad NVMe, con un consumo de unos 4,4 GB de RAM del sistema durante la generación y un pico de 9,3 GB durante la carga.

La relevancia actual está en que combina destilación de expertos, anclaje de trayectoria y streaming desde disco para llevar un MoE de 35B a hardware consumer, algo poco habitual en TTS de código abierto. No se ha publicado la longitud de contexto en la información disponible, y el modelo solo soporta turco.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con MoE: 40 capas (30 Gated DeltaNet + 10 de atención completa), 256 expertos enrutados FP8 por capa, 8 activos por token y un experto compartido; texto a voz |
| Parámetros totales | 35 000 millones en el modelo base Drama 3; el speaker destilado conserva 32 de 256 expertos enrutados por capa (12,5 %) |
| Parámetros activos | 8 expertos enrutados por token más un experto compartido en el modelo base; el número exacto de parámetros activos no está disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | FP8 en los expertos enrutados (nativo); no se documentan GGUF, AWQ, GPTQ ni otras variantes |
| Idiomas soportados | Turco (tr); no se documentan otros idiomas |
| Licencia | `fish-audio-community-license`
