# coinnoin/Demucs-in-Google-Colab

## Resumen

Demucs-in-Google-Colab es un cuaderno de Google Colab publicado por el usuario coinnoin que envuelve el modelo Demucs de Meta AI (Facebook Research) para realizar separación de fuentes musicales (source separation) sobre audio y vídeo. No se trata de un modelo de pesos propios ni de un entrenamiento nuevo: el repositorio de Hugging Face no contiene artefactos de modelo (tamaño 0.0 GB) y actúa como punto de distribución de un notebook interactivo que descarga e invoca los checkpoints oficiales de Demucs (`htdemucs`, `htdemucs_ft`, `htdemucs_6s`, `mdx_extra`).

El problema que resuelve es práctico: permite a usuarios sin experiencia en Python ni en configuración de entornos ejecutar separación de pistas (voces, batería, bajo, guitarra, piano, otros) desde una interfaz de widgets en Google Colab con GPU T4 gratuita, aceptando audio (`.mp3`, `.wav`, `.flac`) y vídeo (`.mp4`, `.mkv`, `.mov`) y exportando resultados en mp3, wav o flac con control de bitrate y realce de volumen.

Es relevante ahora porque Demucs (en particular la familia híbrida transformer `htdemucs`) sigue siendo una referencia en separación musical open source, y este notebook reduce la barrera de entrada a un clic. Conviene subrayar que la ficha describe el *envoltorio*, no un modelo nuevo: cualquier evaluación de calidad debe atribuirse a los checkpoints originales de Demucs, no a este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid Transformer Demucs (htdemucs) en los checkpoints subyacentes; el repositorio en sí es un notebook de Colab |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible (inferencia en fp32/fp16 según PyTorch en GPU T4) |
| Idiomas soportados | no disponible (procesa audio independientemente del idioma) |
| Licencia | other (la licencia del notebook no está detallada; los pesos de Demucs se distribuyen bajo licencia MIT según el repositorio oficial de Facebook Research) |
| Formato de pesos | no incluido en el repositorio; los checkpoints Demucs se descargan en tiempo de ejecución (formato PyTorch `.th`/`.pt`) |

## Arquitectura y entrenamiento

El repositorio no entrena ni publica pesos. El notebook orquesta la instalación de Demucs, la preparación de FFmpeg, la comprobación de GPU y la ejecución de inferencia sobre los checkpoints oficiales. Los modelos seleccionables son `htdemucs`, `htdemucs_ft` (fine-tuned), `htdemucs_6s` (seis stems) y `mdx_extra`. La arquitectura subyacente de `htdemucs` es un modelo híbrido que combina un encoder/decoder espectral con un transformer que modela dependencias de largo alcance sobre el espectrograma, lo que mejora la separación frente a los modelos puramente convolucionales de generaciones anteriores.

No se proporcionan en la información disponible datos sobre número de tokens, composición del dataset de entrenamiento, ni detalles de RLHF/DPO (no aplicables a una tarea de separación de fuentes). Cualquier innovación técnica (procesamiento por segmentos, mezcla de predicciones, shift-invariant training) pertenece al proyecto Demucs original y no se documenta en este repositorio.

## Capacidades

- Separación de fuentes musicales en 2 stems (voces + instrumental), 4 stems (voces, batería, bajo, otros) o hasta 6 stems (voces, batería, bajo, otros, guitarra, piano).
- Aislamiento de voces para karaoke, remezclas o extracción de acapellas.
- Extracción automática de la pista de audio a partir de vídeo (`.mp4`, `.mkv`, `.mov`) mediante FFmpeg.
- Selección entre cuatro checkpoints: `htdemucs`, `htdemucs_ft`, `htdemucs_6s`, `mdx_extra`.
- Exportación en `mp3`, `wav` o `flac` con bitrate ajustable.
- Realce de volumen integrado (slider de 0 a 20 dB) para pistas instrumentales o de fondo silenciosas.
- Empaquetado automático de los stems en un `.zip` y descarga.
- Interfaz interactiva basada en `ipywidgets` (subida de archivos, previsualización con reproductores de audio).
- Procesamiento por lotes vía el propio notebook (subida múltiple de archivos).
- No incluye tool calling, agentes, razonamiento multi-paso ni capacidades de texto/visión en el sentido de los LLM.

## Casos de uso

- Karaoke casero: el usuario sube una canción y obtiene la pista de voces aislada y el instrumental por separado, listo para cantar sobre la base sin necesidad de software de pago.
- Remezcla y edición musical: productores que necesitan aislar batería, bajo o voces para samplear, recomponer o hacer mashups, usando `htdemucs_6s` cuando requieren guitarra y piano además de los cuatro stems clásicos.
- Extracción de audio de vídeo: convertir un `.mp4` o `.mkv` en pistas de audio separadas sin usar herramientas de línea de comandos, gracias a la integración con FFmpeg.
- Limpieza de grabaciones: separar voces de ruido instrumental en demos o grabaciones de ensayo para revisar la interpretación vocal.
- Docencia y divulgación: el notebook sirve como material didáctico para explicar separación de fuentes con deep learning en un entorno gratuito con GPU T4.
- Pruebas comparativas de modelos: evaluar cualitativamente `htdemucs` frente a `htdemucs_ft` y `mdx_extra` sobre el mismo archivo para decidir qué checkpoint usar en un pipeline mayor.
- Prototipado rápido antes de integrar Demucs en una aplicación propia: el notebook permite validar la calidad de los stems antes de invertir en infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no reporta métricas SDR, SI-SNR ni comparativas cuantitativas; cualquier cifra de calidad debe consultarse en el repositorio oficial de Demucs de Facebook Research.

## Requisitos de hardware

- GPU recomendada por el propio notebook: NVIDIA T4 (la disponible en el tier gratuito de Google Colab).
- VRAM estimada: no disponible en la información proporcionada; los checkpoints htdemucs son relativamente ligeros y caben en GPUs consumer de gama media, pero no se aporta cifra exacta.
- Compatibilidad con GPU consumer: probable en tarjetas con suficiente VRAM para PyTorch y procesamiento por segmentos, aunque no se documenta en el repositorio.
- Despliegue: Google Colab (runtime con GPU T4), Python, PyTorch, FFmpeg e `ipywidgets`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Stems | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Demucs-in-Google-Colab (este repo) | Notebook sobre Demucs | 2, 4 o 6 | other (notebook); MIT en pesos Demucs | Hugging Face + Colab | Envoltorio, no modelo propio |
| Demucs (Facebook Research) | Modelo original | 4 (htdemucs) / 6 (htdemucs_6s) | MIT | GitHub oficial | Referencia upstream |
| Spleeter (Deezer) | Modelo de separación | 2 o 4 | MIT | GitHub / pip | Más antiguo, menor calidad que htdemucs |
| Open-Unmix (SigSep) | Modelo de separación | 4 | MIT | GitHub | Baseline académico |

No se dispone de datos cuantitativos comparativos en la información proporcionada para establecer diferencias de SDR entre estas alternativas.

## Limitaciones y advertencias

- El repositorio no contiene pesos: depende de la descarga en tiempo de ejecución de los checkpoints oficiales de Demucs; si el proyecto upstream cambia o desaparece, el notebook puede romperse.
- La licencia del notebook figura como `other` sin texto detallado; para uso comercial conviene verificar la licencia de los pesos de Demucs (MIT en el repositorio oficial) y la de las dependencias (FFmpeg, PyTorch).
- La calidad de separación depende del checkpoint elegido y del material de entrada; no se aportan métricas objetivas en este repositorio.
- El procesamiento en Colab gratuito está sujeto a límites de tiempo de sesión, cuotas de GPU y reinicios del entorno.
- No es un modelo de lenguaje: no soporta texto, visión, tool calling ni agentes; etiquetas como "generative-ai" o "transformer" en el repositorio son genéricas.
- Riesgo de artefactos y sangrado entre stems en pasajes densos o con instrumentación poco común, inherente a la separación de fuentes.
- El notebook está pensado para uso interactivo, no como servicio de producción; para despliegue real conviene integrar Demucs directamente en un pipeline propio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/coinnoin/Demucs-in-Google-Colab
- Notebook en Google Colab: https://colab.research.google.com/drive/1gG508q-vuZwV5SF50ErFbw7tRTYHXfc7?usp=sharing
- Notebook en GitHub: https://github.com/salman02-12/Demucs-in-Google-Colab/blob/main/Demucs_CoinNoin.ipynb
- Tutorial en YouTube: https://www.youtube.com/watch?v=NmrpLYrdN4Q
- Canal del autor: https://www.youtube.com/@CoinNoin
- Demucs oficial (Facebook Research): https://github.com/facebookresearch/demucs
