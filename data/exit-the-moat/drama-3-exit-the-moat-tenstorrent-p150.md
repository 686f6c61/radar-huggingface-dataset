# exit-the-moat/drama-3-exit-the-moat-tenstorrent-p150

## Resumen

drama-3-exit-the-moat-tenstorrent-p150 es un derivado cuantizado de Fish Audio Drama 3, un modelo de texto a voz (TTS) desarrollado por Fish Audio. La aportación de este repositorio no es un modelo nuevo, sino un port de los pesos del backbone de Drama 3 (40 capas) al formato de cache de pesos de tt-metal, el stack de software de Tenstorrent, para ejecutarse en una única tarjeta Blackhole p150. El autor es el canal de YouTube Exit the Moat, que lo empleó para narrar el episodio 0 de su serie, y no tiene afiliación con Fish Audio ni con Tenstorrent.

El modelo base Drama 3 combina atención estándar con atención linear (GDN) y una arquitectura MoE con expertos enrutados y compartidos, además de una torre de codebook y un codec de audio que no se incluyen en este repositorio. Este port almacena únicamente los pesos del backbone en precisión mixta BFP8/BFP4, lo que reduce el peso a 25,0 GB y permite que el modelo quepa en los 33,9 GB de DRAM de la p150.

Su relevancia es acotada pero concreta: demuestra que un modelo TTS de este tamaño puede ejecutarse en hardware de inferencia no-GPU con un factor de tiempo real de 0,381 y un tiempo hasta el primer audio de 0,41-0,47 s. Es material útil para quien evalúe Tenstorrent como alternativa a GPU en cargas de síntesis de voz, no para quien busque un TTS listo para producción con soporte convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 40 capas con atención estándar y atención linear (GDN), y capas MoE con expertos enrutados y compartidos |
| Parametros totales | no disponible |
| Parametros activos | no disponible (arquitectura MoE, sin cifra publicada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFLOAT8_B (proyecciones de atención y GDN, expertos down compartidos), BFLOAT4_B/BFLOAT8_B (expertos MoE gate/up/down), bfloat16 (norms, router, gates, A_log, dt_bias, cabeza de salida) |
| Idiomas soportados | no disponible |
| Licencia | Fish Audio Community License, Version 1.0 |
| Formato de pesos | ttnn `.tensorbin` (702 ficheros, 25,0 GB); requiere tt-metal `70222e90` más el parche y port de Exit the Moat |

## Arquitectura y entrenamiento

El repositorio no entrena nada: es una conversión de pesos del Drama 3 original de Fish Audio. El backbone tiene 40 capas y mezcla atención estándar con atención linear del tipo GDN (gated delta network), e incorpora capas MoE con expertos enrutados y compartidos. La torre de codebook, el tokenizer y el codec de audio se toman del repositorio original `fishaudio/drama-3`, que es necesario descargar aparte; con el preset `--interactive` el port convierte el MLP de la torre a BFP8 al cargarla desde los pesos originales.

La innovación técnica está en el empaquetado: cada peso se serializa en el layout exacto en que el port lo carga, en precisión mixta BFP8/BFP4, de modo que el modelo completo reside en la DRAM de una sola p150. El formato `.tensorbin` está atado a la versión de tt-metal, por lo que otra versión puede rechazar los ficheros; el port puede reconstruir la cache desde los pesos originales, un proceso lento que escribe unos 25 GB. No se documentan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO).

## Capacidades

- Síntesis de voz a partir de texto (pipeline text-to-speech), con voz propia del modelo mediante `--ref none`.
- Clonación de voz condicionada por una referencia de audio, sujeta a las restricciones de la licencia.
- Generación por streaming con primer audio en 0,41-0,47 s y reproducción sin underruns en las pruebas del autor.
- Batching continuo con 16 slots para renderizado masivo de audio.
- Narración de texto largo: el episodio completo (47 líneas, 399 s de habla) se generó con el mismo preset.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá de la referencia de voz.

## Casos de uso

- Narración de vídeo y pódcast: el caso real del autor, que generó los 399 s de narración del episodio 0 con RTF 0,404 y una coincidencia media de 0,975 con el guion según Whisper. Adecuado por la calidad sostenida en texto largo y la reproducción sin cortes.
- Renderizado por lotes de audiolibros o catálogos: con batching continuo de 16 slots y una cola de 32 trabajos alcanza 8,05-9,51 segundos de audio por segundo de reloj, lo que permite procesar horas de material en una sola tarjeta.
- Prototipado de asistentes de voz en hardware Tenstorrent: dos llamadas simultáneas se mantienen en tiempo real (RTF por stream de 0,65-0,72), suficiente para demos interactivas sin depender de GPU.
- Evaluación comparativa de aceleradores: sirve como carga de referencia TTS para medir latencia, consumo (162-219 W de placa) y ocupación de DRAM (31,29 GB de 33,9) de una p150 frente a una RTX PRO 6000 Blackwell.
- Generación de locuciones para vídeo corporativo o documental con voz consistente, usando una referencia de voz propia del cliente y respetando la licencia.
- Investigación sobre cuantización en hardware no-GPU: el repositorio documenta comprobaciones doradas contra una referencia FP32 en CPU, múltiples semillas de Whisper y similitud de hablante, lo que lo hace útil para estudiar el impacto de BFP8/BFP4 en calidad de voz.

## Benchmarks y rendimiento

Mediciones del autor en una p150a con PCIe Gen3 x16, 2026-10-31, una voz, preset `--interactive`, 8 líneas de prueba y la tarjeta en solitario:

| Metrica | Este port (p150) | Drama 3 original (RTX PRO 6000, SGLang-Omni) |
|---|---|---|
| Factor de tiempo real (RTF) | 0,381 (0,373-0,412 por línea; 3 ejecuciones) | 0,173 |
| Tiempo hasta el primer audio | 0,41-0,47 s en todas las líneas | 0,16-0,20 s |
| Un frame (46,4 ms de audio), bucle completo | 17,5 ms | no disponible |
| DRAM de la tarjeta | 31,29 GB de 33,9 | no disponible |
| Consumo, chip / placa | 43-94 W (media 56,1) / 162-219 W (media 195,9) | no disponible |
| Coincidencia Whisper con el guion, media (mínimo) | 0,908 (0,744) | no disponible |
| Episodio completo (47 líneas, 399 s) | RTF 0,404, primera audio 0,43 s mediana, 0 underruns, Whisper 0,975 | no disponible |
| Batching continuo, 16 slots, cola de 32 | 8,05 s audio/s reloj (líneas cortas), 9,51 (fragmentos de narración) | no disponible |
| Dos llamadas simultáneas | RTF por stream 0,65-0,72 | no disponible |

Tiempo de carga en la tarjeta: unos 11 s con los ficheros en page cache y 183-186 s en frío desde SSD SATA (163 MB/s). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, y no aplican a un modelo TTS.

## Requisitos de hardware

- Tarjeta Tenstorrent Blackhole p150 (una unidad); DRAM ocupada: 31,29 GB de 33,9 GB.
- No cabe en GPU de consumo: el formato `.tensorbin` solo lo carga el port sobre tt-metal, no es compatible con CUDA, llama.cpp, vLLM ni Ollama.
- Software: tt-metal en el commit `70222e90` más el parche y port de `fish-drama3-p150`; el `setup/setup.sh` del repositorio construye todo.
- Almacenamiento: 25,0 GB para este repositorio más los pesos originales de `fishaudio/drama-3` (torre de codebook, tokenizer y codec); el port debe descargarse en `TT_CACHE_PATH`, por defecto `/opt/ep0/cache/drama3`.
- Interfaz: PCIe Gen3 x16 es suficiente.
- Latencia y throughput: RTF 0,381 en una voz; 8,05-9,51 s de audio por segundo de reloj en batching continuo; primer audio en 0,41-0,47 s.
- Consumo: 43-94 W de chip y 162-219 W de placa mientras habla.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | RTF medido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| drama-3-exit-the-moat-tenstorrent-p150 | no disponible (backbone de 40 capas) | no disponible | 0,381 (p150) | Fish Audio Community License 1.0 | HuggingFace, requiere port propio |
| fishaudio/drama-3 (original, BF16 + FP8) | no disponible | no disponible | 0,173 (RTX PRO 6000, SGLang-Omni) | Fish Audio Community License 1.0 | HuggingFace, servidor oficial |
| Otros TTS open source de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es contra el Drama 3 original en GPU: el port es aproximadamente 2,2 veces más lento en RTF y tarda unas 2,5 veces más en el primer audio, a cambio de ejecutarse en hardware Tenstorrent con menor consumo. No hay datos en la información disponible para comparar con otros sistemas TTS.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el repositorio `fishaudio/drama-3` (torre de codebook, tokenizer y codec) y sin el código del port no se puede ejecutar.
- Los ficheros `.tensorbin` están atados a tt-metal `70222e90`; otra versión puede rechazarlos y obliga a reconstruir la cache desde los pesos originales.
- Solo funciona en una Blackhole p150; no hay ruta de despliegue en GPU ni en CPU.
- La licencia prohíbe imitar la voz de una persona identificable sin su consentimiento, eliminar la marca de agua de Fish Audio y ofrecer un servicio alojado de TTS o clonación de voz sin licencia separada de Fish Audio. El uso comercial solo se permite por debajo de 500.000 USD de ingresos anuales.
- Riesgo de alucinación y de errores de pronunciación: la coincidencia media con el guion medida por Whisper fue de 0,908, con un mínimo de 0,744 en una de las líneas de prueba.
- En batching continuo cada stream individual va más lento que el tiempo real; ese modo sirve para renderizado masivo, no para interacción.
- No se documentan sesgos lingüísticos ni la lista de idiomas soportados.
- El autor declara no tener afiliación ni respaldo de Fish Audio ni de Tenstorrent; el soporte depende del repositorio personal del canal.

## Enlaces

- HuggingFace: https://huggingface.co/exit-the-moat/drama-3-exit-the-moat-tenstorrent-p150
- Modelo base: https://huggingface.co/fishaudio/drama-3
- Código, setup y benchmarks: https://github.com/exit-the-moat/tenstorrent/tree/main/fish-drama3-p150
- Ficheros de ejecución de los resultados: https://github.com/exit-the-moat/tenstorrent/tree/main/results/drama3-runs
- Vídeo del episodio 0: https://youtu.be/mpleglhA_Dg
- Canal de YouTube: https://www.youtube.com/@ExitTheMoat
- Patreon del autor: https://patreon.com/Exitthemoat
