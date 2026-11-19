# gabrione/pocket-tts-deltas

## Resumen

`gabrione/pocket-tts-deltas` es un repositorio de deltas de pesos (weight deltas) para los paquetes de idioma del motor de síntesis de voz Kyutai Pocket TTS, tal como los consume el motor Frankenstein v2 del proyecto mynah-s2s. No se trata de un modelo TTS completo, sino de un conjunto de diferencias de pesos calculadas contra un modelo base en inglés por familia (24 capas y 6 capas). Cada idioma se almacena como un delta de precisión int4, int8 o bf16 respecto al backbone inglés compartido, lo que permite reconstruir el modelo multilingüe sin duplicar el backbone completo.

El repositorio incluye los modelos base en inglés (`en/24l/base` de 660,4 MB y `en/6l/base` de 179,2 MB) y deltas para italiano, francés, checo, alemán, español y estonio, con distintos niveles de precisión. El códec Mimi y su codificador de clonación de voz no se incluyen: proceden del checkpoint base de Kyutai (`kyutai/pocket-tts`), que está sujeto a aceptación de términos.

Es relevante porque ofrece una vía de bajo coste para desplegar TTS multilingüe sobre el backbone de Kyutai: los deltas int8 rondan los 100-335 MB y los int4 los 67-184 MB, lo que reduce drásticamente el almacenamiento frente a checkpoints completos por idioma. La licencia es "per-package": los deltas derivados de Kyutai son CC-BY-4.0, mientras que el paquete estonio es CC-BY-SA-4.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer TTS (familia Pocket TTS de Kyutai), dos variantes: 24 capas y 6 capas |
| Parámetros totales | No disponible (no se indica el recuento; el repo pesa 14,7 GB) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | int4, int8, bf16 (deltas) |
| Idiomas soportados | en (base), it, fr, cs, de, es, et |
| Licencia | per-package: CC-BY-4.0 (mayoría) y CC-BY-SA-4.0 (estonio) |
| Formato de pesos | No disponible (deltas en el formato consumido por la librería `pocket-tts`; no se especifica safetensors/GGUF) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado de forma independiente, sino deltas de pesos calculados contra un backbone inglés. La familia 24l corresponde a un transformer de 24 capas (base de 660,4 MB en bf16) y la familia 6l a un transformer de 6 capas (base de 179,2 MB en bf16). Cada idioma se publica en tres precisiones (int4, int8, bf16) como diferencia respecto al base inglés de su familia, y el repositorio expone la métrica `backbone_rel_err`, el error relativo de los pesos reconstruidos del transformer. Los valores típicos son ~0,10-0,15 en int4, ~0,006-0,008 en int8 y ~0,0013-0,0021 en bf16, lo que indica que int8 conserva el backbone con una fidelidad cercana a bf16 y que int4 introduce una degradación apreciable.

La información disponible no detalla el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. Tampoco se describe la innovación arquitectónica interna más allá de la existencia de las dos familias de profundidad y del uso del códec Mimi de Kyutai, que se encarga de la tokenización y reconstrucción de audio y no forma parte de este repositorio.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés, italiano, francés, checo, alemán, español y estonio.
- Dos perfiles de modelo por idioma: 24 capas (mayor capacidad) y 6 capas (menor huella, orientado a despliegue ligero).
- Tres precisiones por delta (int4, int8, bf16) para ajustar tamaño y fidelidad del backbone.
- Reconstrucción de pesos multilingüe mediante deltas sobre un backbone inglés compartido.
- Integración con el motor Frankenstein v2 de mynah-s2s.
- Clonación de voz: no incluida en este repositorio; depende del codificador de voz del checkpoint `kyutai/pocket-tts`.
- Tool calling, agentes, razonamiento, visión o audio: no aplica (es un modelo TTS, no un LLM).

## Casos de uso

- Despliegue TTS multilingüe con almacenamiento reducido: cargar el backbone inglés y aplicar el delta int8 del idioma objetivo (por ejemplo, español 24l int8 de 335 MB) para servir síntesis en varios idiomas sin mantener checkpoints completos por idioma.
- Asistentes de voz en dispositivos con recursos limitados: la variante 6l int4 (67,1 MB para it, fr, de, es) permite integrar TTS en entornos con poca memoria, a costa de un error relativo de backbone de ~0,13.
- Doblaje y localización de contenido: alternar entre deltas de italiano, francés, alemán y español sobre el mismo backbone para generar pistas de voz en distintos idiomas desde un único pipeline.
- Investigación en weight deltas: usar los pares base/delta y la métrica `backbone_rel_err` para estudiar la degradación de pesos al cuantizar a int4 e int8 en modelos TTS.
- Prototipado de motores conversacionales: integrar los deltas con el motor Frankenstein v2 de mynah-s2s para construir sistemas de voz a voz multilingües.
- Evaluación comparativa de familias de profundidad: comparar calidad y coste entre la familia 24l y la 6l para un mismo idioma y precisión antes de fijar una arquitectura de producción.
- Síntesis en checo y estonio: usar los paquetes específicos (cs desde `vvolhejn/pocket-tts-czech`, et desde `cbentes/pocket-tts-estonian`) para idiomas con menos cobertura en TTS open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato cuantitativo es el error relativo de reconstrucción del backbone (`backbone_rel_err`), que se recoge en la tabla siguiente para las variantes int4, int8 y bf16 de la familia 24l y 6l.

| Idioma | Familia | int4 | int8 | bf16 |
|---|---|---|---|---|
| it | 24l | 0,10367 | 0,00596 | 0,00136 |
| fr | 24l | 0,11202 | 0,00641 | 0,00148 |
| de | 24l | 0,10562 | 0,00606 | 0,00139 |
| es | 24l | 0,10394 | 0,00597 | 0,00134 |
| it | 6l | 0,12633 | 0,00725 | 0,00156 |
| fr | 6l | 0,12930 | 0,00742 | 0,00159 |
| de | 6l | 0,12873 | 0,00739 | 0,00159 |
| es | 6l | 0,12795 | 0,00735 | 0,00158 |
| cs | 6l | 0,14748 | 0,00836 | 0,00210 |
| et | 6l | 0,14923 | 0,00846 | 0,00212 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia de tamaño, el backbone 24l base ocupa 660,4 MB en bf16 y el 6l base 179,2 MB; los deltas añaden entre 67 y 632 MB según idioma y precisión.
- GPU recomendadas: no disponible. Por el tamaño de los pesos, el modelo es compatible con GPUs de consumo, pero la información no especifica modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: previsiblemente sí, dado que los checkpoints completos rondan los 0,2-0,7 GB, aunque no se confirma en la documentación.
- Opciones de despliegue: librería `pocket-tts` y motor Frankenstein v2 de mynah-s2s. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gabrione/pocket-tts-deltas | Deltas TTS sobre Pocket TTS | en, it, fr, cs, de, es, et | 14,7 GB (repo completo); deltas 67-632 MB | per-package (CC-BY-4.0 / CC-BY-SA-4.0) | Hugging Face |
| kyutai/pocket-tts | Modelo TTS base | no disponible | no disponible | gated (términos de Kyutai) | Hugging Face |
| kyutai/pocket-tts-without-voice-cloning | Modelo TTS base sin clonación | en (base) | 660,4 MB (24l) / 179,2 MB (6l) | CC-BY-4.0 | Hugging Face |
| vvolhejn/pocket-tts-czech | Paquete TTS checo | cs | 95-207 MB (6l) | CC-BY-4.0 | Hugging Face |
| cbentes/pocket-tts-estonian | Paquete TTS estonio | et | 95-207 MB (6l) | CC-BY-SA-4.0 | Hugging Face |

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el backbone inglés y el códec Mimi con su codificador de voz del checkpoint `kyutai/pocket-tts`, que está sujeto a aceptación de términos (gated).
- La licencia es "per-package": los deltas de Kyutai son CC-BY-4.0, pero el paquete estonio es CC-BY-SA-4.0, lo que impone condiciones de compartir igual en obras derivadas.
- La cuantización int4 introduce un error relativo de backbone de ~0,10-0,15, notablemente superior al de int8 (~0,006-0,008); puede degradar la calidad de síntesis.
- El idioma checo y el estonio solo están disponibles en la familia 6l, de menor capacidad que la 24l.
- No se documentan sesgos, tasas de alucinación ni evaluación subjetiva de calidad de voz (MOS) en la información disponible.
- No se especifican la longitud de contexto, el formato exacto de pesos ni los requisitos de hardware, lo que dificulta planificar un despliegue en producción sin pruebas adicionales.
- El repositorio tiene 0 descargas y fue creado en noviembre de 2026, por lo que carece de validación comunitaria y de historial de uso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gabrione/pocket-tts-deltas
- Modelo base Kyutai Pocket TTS: https://huggingface.co/kyutai/pocket-tts
- Base sin clonación de voz: https://huggingface.co/kyutai/pocket-tts-without-voice-cloning
- Paquete checo: https://huggingface.co/vvolhejn/pocket-tts-czech
- Paquete estonio: https://huggingface.co/cbentes/pocket-tts-estonian
- Motor mynah-s2s (Frankenstein v2): https://github.com/mynah-org/mynah-s2s
