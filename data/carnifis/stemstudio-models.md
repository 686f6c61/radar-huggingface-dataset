# Carnifis/stemstudio-models

## Resumen

StemStudio models es un repositorio de exportaciones ONNX de Demucs v4 (HT-Demucs), el modelo de separación de fuentes musicales desarrollado por Meta AI Research (equipo de Défossez). El repositorio lo publica el usuario Carnifis como parte de la aplicación StemStudio, y su función es permitir la separación de pistas (stems) directamente en el dispositivo del usuario, sin depender de un servidor. Los pesos son los checkpoints originales liberados por Meta bajo licencia MIT; el autor solo ha cambiado el formato de serialización a ONNX.

Técnicamente se trata de un modelo híbrido transformer-convolucional que opera sobre representaciones STFT. El repositorio incluye variantes de 4 y 6 stems, versiones con segmento reducido para dispositivos móviles y un conjunto de modelos afinados (fine-tuned bag) para la edición Pro. El tamaño total del repositorio es de 0,7 GB y los pesos se almacenan en fp16, con conversión a fp32 en la carga.

La relevancia de esta ficha es acotada: no se trata de un modelo de lenguaje ni de un modelo fundacional nuevo, sino de un artefacto de despliegue para inferencia local de separación musical. Resulta útil para desarrolladores que quieran integrar separación de stems en aplicaciones de escritorio o móviles mediante ONNX Runtime, evitando dependencias de PyTorch en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrido transformer-convolucional (HT-Demucs, Demucs v4) con STFT externa al grafo |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; segmento de audio de 7,8 s (escritorio) o 3,9 s (móvil) |
| Tipos de cuantización | pesos almacenados en fp16, convertidos a fp32 en carga; no se documentan otras cuantizaciones |
| Idiomas soportados | no aplica (modelo de audio) |
| Licencia | MIT |
| Formato de pesos | ONNX (`.onnx`), con `catalog.json` de tamaños y hashes SHA-256 |

## Arquitectura y entrenamiento

El modelo subyacente es HT-Demucs (Hybrid Transformer Demucs), presentado por Rouard, Massa y Défossez en *Hybrid Transformers for Music Source Separation* (ICASSP 2023). Combina un codificador/decodificador convolucional sobre la forma de onda con un transformer que procesa la representación tiempo-frecuencia, lo que permite capturar dependencias de largo alcance en la señal musical. La separación se realiza sobre la STFT, que en estas exportaciones se calcula fuera de la red porque ONNX no dispone de `istft`.

Las exportaciones mantienen los checkpoints originales de Meta sin reentrenamiento. La única modificación es estructural: el grafo ONNX recibe la mezcla `[1, 2, L]` y el espectrograma `[1, 4, 2048, F]`, y devuelve la onda separada `[1, S, 2, L]` junto con el espectrograma de salida `[1, S, 4, 2048, F]`. Las variantes `_s3.9` reducen el segmento a la mitad para disminuir el pico de memoria RAM, con una pérdida declarada de 0,3 dB de SDR. El conjunto `htdemucs_ft` contiene cuatro modelos afinados individualmente (drums, bass, other, vocals) que se combinan como bagging. No se documentan en la información disponible detalles sobre el dataset de entrenamiento, número de tokens (no aplica) ni procesos de RLHF/DPO (no aplica a este dominio).

## Capacidades

- Separación de fuentes musicales en 4 stems (drums, bass, other, vocals) mediante `htdemucs.onnx`.
- Separación en 6 stems mediante `htdemucs_6s.onnx` (incluye piano y guitarra además de los cuatro anteriores).
- Variantes de segmento reducido (`_s3.9`) optimizadas para dispositivos móviles con menor pico de RAM.
- Bagging de modelos afinados (`htdemucs_ft_*`) para calidad superior en la edición Pro.
- Inferencia local sin conexión, ejecutable con ONNX Runtime.
- Entrada y salida de audio en forma de onda y espectrograma, lo que permite integración con pipelines de procesamiento de señal existentes.
- Verificación de integridad de descargas mediante SHA-256 a través de `catalog.json`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de audio.

## Casos de uso

- Aplicación de escritorio de separación de stems: integración de `htdemucs.onnx` con ONNX Runtime para procesar pistas completas por segmentos de 7,8 s, con calidad de referencia y sin dependencia de PyTorch.
- Aplicación móvil de karaoke o práctica musical: uso de `htdemucs_s3.9.onnx` para extraer la pista vocal y generar una versión instrumental en el propio teléfono, con un pico de RAM reducido a la mitad.
- Edición musical profesional: empleo del bagging `htdemucs_ft_*` para obtener stems de mayor calidad en un flujo de trabajo de escritorio, combinando las cuatro salidas afinadas.
- Remezcla y sampleado: separación de una mezcla en seis stems (`htdemucs_6s.onnx`) para aislar piano o guitarra y reutilizarlos en una nueva producción.
- Limpieza de grabaciones: extracción de la pista de voces para eliminar ruido de fondo o aplicar procesado vocal independiente antes de la mezcla final.
- Investigación en procesamiento de audio: uso de las exportaciones ONNX como referencia reproducible para comparar arquitecturas de separación o para validar implementaciones propias de STFT/iSTFT.
- Distribución offline en entornos sin conectividad: el modelo se descarga una vez, se verifica contra `catalog.json` y se ejecuta localmente, lo que encaja en aplicaciones de campo o con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente declara una diferencia de −0,3 dB de SDR para las variantes `_s3.9` respecto a las de segmento completo, sin cifras absolutas de SDR ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible de forma explícita; la model card indica que las variantes `_s3.9` reducen el pico de RAM a la mitad respecto a las de 7,8 s, pero no publica cifras absolutas.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el repositorio no documenta requisitos mínimos ni perfiles de hardware.
- Despliegue: ONNX Runtime es el runtime previsto; el autor menciona `tools/export_onnx.py` en el repositorio de StemStudio como generador de las exportaciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Stems | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| StemStudio models (este repo) | HT-Demucs v4 exportado a ONNX | 4 o 6 | ONNX (fp16) | MIT | Exportación de los checkpoints de Meta; segmentos de 7,8 s y 3,9 s |
| Demucs v4 (HT-Demucs) original | HT-Demucs | 4 o 6 | PyTorch | MIT | Checkpoints de referencia de Meta; requiere PyTorch |
| Demucs v3 | Convolucional (waveform) | 4 | PyTorch | MIT | Versión anterior, sin componente transformer |
| Spleeter | Convolucional (espectrograma) | 2, 4 o 5 | TensorFlow | MIT | Modelo de Deezer, más ligero pero con menor calidad de separación según la literatura |

No se dispone de datos de benchmarks comparativos en la información proporcionada para cuantificar las diferencias de SDR entre estas alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni razonamiento, y las expectativas de uso deben ceñirse a separación de audio.
- La calidad de separación en las variantes `_s3.9` es inferior en 0,3 dB de SDR respecto a las de segmento completo, según declara el autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026; no hay evidencia de uso en producción ni validación independiente.
- No se documentan sesgos, pero al ser un modelo entrenado con música comercial puede presentar un rendimiento desigual según género, instrumentación o calidad de la mezcla de entrada.
- Riesgo de artefactos de separación (sangrado entre stems) inherente a la arquitectura; no se publican métricas que lo cuantifiquen.
- La licencia MIT de los pesos originales se mantiene, pero conviene verificar los términos de la app StemStudio y del repositorio de exportación antes de un uso comercial.
- La STFT se calcula fuera del grafo ONNX, por lo que la integración requiere implementar el preprocesado y postprocesado de espectrograma de forma coherente con los parámetros esperados (`[1, 4, 2048, F]`).
- No se documentan requisitos de hardware ni latencias, lo que dificulta planificar despliegues en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Carnifis/stemstudio-models
- Repositorio original de Demucs (Meta): https://github.com/facebookresearch/demucs
- Paper de referencia: Rouard, Massa, Défossez, *Hybrid Transformers for Music Source Separation*, ICASSP 2023 (citado en la model card; no se incluye URL directa en la información disponible)
- Script de exportación: `tools/export_onnx.py` en el repositorio de StemStudio (no se incluye URL directa en la información disponible)
