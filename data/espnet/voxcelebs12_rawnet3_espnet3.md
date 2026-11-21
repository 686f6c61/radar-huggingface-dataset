# espnet/voxcelebs12_rawnet3_espnet3

## Resumen

El modelo `espnet/voxcelebs12_rawnet3_espnet3` es un sistema de verificación de hablante (speaker verification) empaquetado como bundle para ESPnet3, generado a partir de la receta `egs3/voxceleb/esp2_spk`. Lo desarrolla el equipo de ESPnet (autor del empaquetado: `popcornell`) y resuelve la tarea de determinar si dos fragmentos de audio corresponden al mismo hablante, devolviendo una puntuación de similitud. Es relevante porque reproduce, dentro del nuevo ecosistema ESPnet3, el conocido sistema RawNet3 sobre VoxCeleb, con un rendimiento de 0,755 % EER en Vox1-O.

El modelo es un sistema biométrico de audio, no un modelo de lenguaje: no genera texto ni mantiene conversaciones. Su arquitectura combina un frontend de filtros sinc (SincNet) con un encoder RawNet3, pooling por atención de estadísticas (chn_attn_stat) y una cabeza de proyección que produce embeddings de 192 dimensiones. Con 28,5 millones de parámetros y un tamaño de pesos de aproximadamente 114 MB, es un modelo compacto orientado a inferencia en CPU o GPU modesta.

Este bundle está pensado para integrarse en pipelines de verificación de hablante del ecosistema ESPnet3 mediante `InferenceModel.from_packed`, y sirve como referencia reproducible del sistema ESPnet-SPK. Su caso de uso principal es la comparación de pares de audios (enrolamiento y prueba) con puntuación por similitud coseno.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Frontend SincNet (asteroid_frontend) + encoder RawNet3 + pooling chn_attn_stat + proyector RawNet3 |
| Parámetros totales | 28.532.866 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio; ventana de evaluación de 8 s por recorte) |
| Tipos de cuantización | no disponible (pesos en float32) |
| Idiomas soportados | no disponible (modelo de hablante, independiente del idioma) |
| Licencia | no disponible |
| Formato de pesos | bundle empaquetado `model_pack` (checkpoint `last.pth`, PyTorch) |

## Arquitectura y entrenamiento

El sistema sigue la arquitectura RawNet3 adaptada a ESPnet3. El frontend es un `asteroid_frontend` con filtros sinc (256 filtros, kernel 251, stride 16, preénfasis 0,97), que aprende representaciones directamente sobre la forma de onda a 16 kHz. Le sigue un encoder RawNet3 con `model_scale: 8`, `ndim: 1024` y `output_size: 1536`, un pooling por atención de estadísticas (`chn_attn_stat`) y un proyector RawNet3 que genera embeddings de 192 dimensiones. La función de pérdida es AAM-Softmax con top-k (`aamsoftmax_sc_topk`, margen 0,3, escala 30, K=3, mp=0,06, k_top=5) sobre 21.615 hablantes.

El entrenamiento se realizó sobre VoxCeleb 1+2 dev con perturbación de velocidad (factores 0,9 / 1,0 / 1,1), aumentación con MUSAN (voz, ruido y música) y RIR, con probabilidad de aplicación de 0,5 en cada caso. Se entrenó durante 40 épocas en una sola GPU con batch global de 512 y precisión bf16-mixed, optimizador Adam (lr 0,001, weight decay 5e-5) y scheduler CosineAnnealingWarmupRestarts (primer ciclo de 72.690 pasos, warmup de 1.000). El muestreo usa `SpeakerBalancedBatchSampler` y el preprocesador fija recortes de 3 s para entrenamiento y 5 recortes de evaluación.

## Capacidades

- Verificación de hablante: compara dos audios y devuelve una puntuación de similitud coseno.
- Extracción de embeddings de hablante de 192 dimensiones.
- Robustez a ruido y reverberación mediante aumentación MUSAN y RIR durante el entrenamiento.
- Funciona a 16 kHz sobre forma de onda cruda, sin necesidad de features acústicas externas.
- Integración nativa en el ecosistema ESPnet3 mediante `InferenceModel.from_packed`.
- No soporta tool calling, agentes, generación de texto, visión ni audio-a-texto.
- No es multilingüe en el sentido de generación: es independiente del idioma por naturaleza de la tarea.

## Casos de uso

- Verificación biométrica de acceso: comparar un audio de enrolamiento con uno de prueba para autenticar a un usuario, usando la puntuación coseno y un umbral calibrado (EER de referencia 0,755 % en Vox1-O).
- Detección de suplantación en call centers: comprobar que la voz del interlocutor coincide con el titular registrado antes de operaciones sensibles.
- Deduplicación de hablantes en archivos de audio: extraer embeddings de múltiples segmentos y agrupar por similitud para consolidar identidades.
- Control de calidad de datasets de voz: verificar que las grabaciones de un mismo hablante son consistentes y detectar etiquetados erróneos.
- Reproducción de investigación en ESPnet-SPK: usar el bundle como baseline reproducible del sistema RawNet3 sobre VoxCeleb dentro de ESPnet3.
- Integración en pipelines de diarización: emplear los embeddings como componente de similitud para asignar segmentos a hablantes.
- Filtrado de audios en producción de contenido: detectar si una locución corresponde al locutor contratado antes de publicarla.

## Benchmarks y rendimiento

| Dataset | EER (%) | minDCF |
|---|---|---|
| Vox1-O (cleaned) | 0,755 | 0,06078 |

Protocolo: pesos de la última época (`last.pth`, época 40), 4 recortes de 8 s equiespaciados por utterance, puntuación coseno, sin normalización de scores. El modelo ESPnet2 de referencia (`espnet/voxcelebs12_rawnet3`) reporta 0,739 % EER y obtiene 0,750 % bajo el mismo protocolo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (28,5 M parámetros, ~114 MB de pesos); el pico depende del tamaño de lote y de la longitud de audio.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier RTX (incluso series 20xx en adelante) y en GPUs integradas con suficiente memoria compartida.
- Despliegue: inferencia vía `espnet3.publication.inference_model.InferenceModel` (PyTorch); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | EER Vox1-O | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| espnet/voxcelebs12_rawnet3_espnet3 | 28,5 M | no aplica | 0,755 % | no disponible | Hugging Face (ESPnet) |
| espnet/voxcelebs12_rawnet3 | no disponible | no aplica | 0,739 % (reportado) / 0,750 % (mismo protocolo) | no disponible | Hugging Face (ESPnet) |
| Modelos ECAPA-TDNN de referencia | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: el entrenamiento se limita a VoxCeleb 1+2, por lo que el rendimiento puede degradarse en dominios acústicos distintos (telefonía, entornos muy ruidosos, idiomas o acentos poco representados).
- Riesgo de error en verificación: con EER de 0,755 % en Vox1-O, existe una tasa no nula de falsos positivos y falsos negativos; requiere calibración de umbral por caso de uso.
- La puntuación se obtiene sin normalización de scores, lo que puede afectar a la comparabilidad entre condiciones.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene verificar la licencia del corpus VoxCeleb y del código ESPnet antes de producción.
- El bundle requiere `trust_user_code=True` en `InferenceModel.from_packed`, lo que implica ejecutar código del autor; auditar antes de desplegar.
- No es un modelo generativo: no debe usarse para tareas de texto, visión ni diálogo.
- El modelo card no documenta limitaciones adicionales ni evaluación fuera de Vox1-O.

## Enlaces

- Hugging Face: https://huggingface.co/espnet/voxcelebs12_rawnet3_espnet3
- Modelo ESPnet2 de referencia: https://huggingface.co/espnet/voxcelebs12_rawnet3
- Repositorio ESPnet: https://github.com/espnet/espnet
- Repositorio de origen del bundle: https://github.com/popcornell/espnet
- Paper ESPnet-SPK (Jung et al., 2024): citado en la model card, sin URL explícita en la información disponible.
