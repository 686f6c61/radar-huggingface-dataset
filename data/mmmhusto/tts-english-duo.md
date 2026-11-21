# mmmhusto/TTS-English-Duo

## Resumen

TTS English Duo es un modelo de síntesis de voz (text-to-speech) en inglés desarrollado por el usuario mmmhusto, un fine-tune del checkpoint TTS-English v2.3. El modelo genera audio a 24 kHz con dos voces diferenciadas: una voz femenina de lectura de audiolibros ("Studio 92", basada en la locutora Cori Samuel) y una voz masculina conversacional extraída del corpus DailyTalk. Se distribuye con el decodificador acústico y un vocoder BigVGAN afinado incluido en el propio repositorio.

El modelo resuelve el problema de disponer de un TTS ligero y desplegable localmente con dos timbres claramente diferenciados sin necesidad de infraestructura en la nube. Con 41,8 millones de parámetros y un tamaño de repositorio de 0,2 GB, está pensado para inferencia en CPU o en GPU de consumo. La relevancia actual radica en su huella mínima y en que permite síntesis de voz de calidad razonable (PESQ estimado en torno a 3,9) en entornos con recursos limitados.

La ficha se basa exclusivamente en la model card publicada por el autor y en los metadatos de Hugging Face. No se dispone de información sobre la composición completa del dataset de entrenamiento, la arquitectura interna del decodificador acústico más allá de su tamaño, ni resultados de benchmarks estándar de TTS como MOS de naturalidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador acústico (transformer, detalles no disponibles) con vocoder BigVGAN base 24 kHz afinado |
| Parametros totales | 41.815.690 (41,8 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF u otras) |
| Idiomas soportados | Inglés (en) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | Safetensors, PyTorch |

## Arquitectura y entrenamiento

El modelo es un decodificador acústico de 41,8 millones de parámetros que parte del checkpoint TTS-English v2.3, conservando los dos embeddings de hablante originales. Sobre esa base se aplicaron 600 actualizaciones adicionales de entrenamiento en una RTX 3080, usando un subconjunto de 1.024 grabaciones por voz. La síntesis se completa con un vocoder BigVGAN base de 24 kHz afinado, incluido en la release, y la conversión de texto a fonemas se realiza con g2p_en y el diccionario CMU Pronouncing Dictionary.

Los datos de entrenamiento provienen de tres corpus: LibriTTS-R (Koizumi et al.), Hi-Fi TTS (Bakhturina et al.) y DailyTalk (Lee et al.). El autor comparó este modelo con el checkpoint de partida, con una variante de decodificador de 48,4 millones de parámetros y con una ejecución con el doble de grabaciones, todas con 600 actualizaciones. La selección de checkpoints se hizo con 24 enunciados de validación por voz y la evaluación final con ocho enunciados de test retenidos por voz, sintetizados con el mismo vocoder. No se documenta el uso de RLHF, DPO ni técnicas de decodificación especulativa.

## Capacidades

- Síntesis de voz en inglés a 24 kHz a partir de texto.
- Dos voces diferenciadas: "Studio 92" (femenina, lectura de audiolibros, etiqueta `en_hifi_92_clean`) y "DailyTalk man" (masculina, conversacional, etiqueta `en_dt_0`).
- Conversión de texto a fonemas mediante g2p_en y el diccionario CMU, lo que permite pronunciación basada en fonemas para inglés.
- Inferencia en CPU y en GPU NVIDIA (opción `--device cuda`).
- Demo de navegador local incluida (`app.py`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.
- Capacidad multilingüe: únicamente inglés.

## Casos de uso

- Lectura de audiolibros y contenido largo: la voz "Studio 92" está entrenada sobre grabaciones de lectura de LibriTTS-R y está pensada para narración continua, por lo que encaja en la generación de audiolibros o artículos locutados por lotes.
- Diálogos y asistentes conversacionales: la voz "DailyTalk man" procede de un corpus de diálogo y permite alternar dos timbres en una misma aplicación para simular conversaciones entre personajes o turnos de un asistente.
- Prototipado de interfaces de voz: con 0,2 GB de repositorio y 41,8 M de parámetros, el modelo se puede desplegar en un portátil o en una máquina de desarrollo para validar flujos de TTS antes de escalar a un servicio mayor.
- Generación de avisos y notificaciones pregrabadas: para sistemas que necesitan convertir texto dinámico en audio (alertas, mensajes de estado) en inglés y con baja latencia, al no requerir GPU dedicada.
- Accesibilidad y lectura de pantalla: integración en lectores de pantalla o herramientas de accesibilidad que requieran una voz local, sin depender de APIs externas y con licencia CC BY-SA 4.0.
- Contenido educativo y material de e-learning: generación de narraciones para cursos en inglés con dos voces que permiten distinguir narrador y personaje.
- Pruebas de regresión en pipelines de audio: al incluir el vocoder y el código de síntesis, sirve como referencia reproducible para comparar cambios en el front-end de texto a fonemas o en el vocoder.

## Benchmarks y rendimiento

El autor publica una evaluación propia con PESQ estimado por SQUIM, similitud de hablante mediante coseno ECAPA respecto al centroide de otras siete grabaciones del mismo hablante, y errores de palabra medidos con Whisper. Los resultados comparan el checkpoint base con el modelo Duo:

| Voz | PESQ estimado (base → Duo) | Similitud de hablante (base → Duo) | Errores de palabra Whisper (base → Duo) |
|---|---|---|---|
| Studio 92 | 3,852 → 3,928 | 0,724 → 0,730 | 0/78 → 0/78 |
| DailyTalk man | 3,868 → 3,950 | 0,608 → 0,622 | 7/85 → 7/85 |

No se han publicado resultados de benchmarks estándar de TTS (MOS de naturalidad, CMOS, WER sobre corpus completos) ni comparaciones con otros modelos de la categoría en la información disponible. El propio autor indica que las preferencias de oyentes sobre naturalidad quedan pendientes.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 41,8 M de parámetros en safetensors y un vocoder BigVGAN de 24 kHz, la huella es reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: el autor entrenó en una RTX 3080; la inferencia puede ejecutarse en GPUs NVIDIA con `--device cuda`. No se especifican modelos concretos adicionales.
- GPU de consumo: sí, previsiblemente en cualquier GPU con unos pocos GB de VRAM; el repositorio completo ocupa 0,2 GB.
- CPU: soportada por defecto (sin `--device cuda`).
- Opciones de despliegue: el runtime propio `tts_english` incluido en el repositorio, NVIDIA BigVGAN (commit `7d2b454564a6c7d014227f635b7423881f14bdac`) y la demo `app.py`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo TTS de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables publicados en la información proporcionada para establecer una comparativa rigurosa con otros modelos TTS. A modo de referencia estructural, se pueden considerar alternativas de la misma categoría, aunque sin cifras de rendimiento contrastadas:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| TTS English Duo | 41,8 M | No disponible | CC BY-SA 4.0 | Hugging Face (0 descargas) |
| TTS-English (base) | No disponible | No disponible | CC BY-SA 4.0 | Hugging Face |
| BigVGAN base 24 kHz (vocoder) | No disponible | No aplica | MIT | Hugging Face (NVIDIA) |

La comparación de rendimiento entre estos modelos no está disponible en la información consultada.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües documentadas.
- El modelo se entrenó con 1.024 grabaciones por voz y 600 actualizaciones, un volumen reducido que puede limitar la cobertura de estilos, emociones y acentos.
- La evaluación es un piloto corto: ocho enunciados de test por voz y preferencias de naturalidad aún sin medir. Los valores de PESQ son estimados por SQUIM, no MOS subjetivo.
- La similitud de hablante de la voz masculina es moderada (0,622), inferior a la femenina (0,730), lo que puede traducirse en menor fidelidad de timbre.
- Riesgo de errores de pronunciación en palabras fuera del diccionario CMU o en nombres propios, dado el uso de g2p_en.
- Riesgo de alucinación o artefactos acústicos inherente a los modelos generativos de audio; no se documentan mitigaciones específicas.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia. Los pesos del vocoder derivan de BigVGAN (MIT), cuyas condiciones deben respetarse por separado.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación de la comunidad ni reportes de uso en producción.
- No se documentan sesgos demográficos ni de acento; la procedencia de los corpus (LibriTTS-R, Hi-Fi TTS, DailyTalk) condiciona el perfil de voces disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mmmhusto/TTS-English-Duo
- Modelo base: https://huggingface.co/mmmhusto/TTS-English
- BigVGAN base 24 kHz (NVIDIA): https://huggingface.co/nvidia/bigvgan_base_24khz_100band
- Repositorio BigVGAN: https://github.com/NVIDIA/BigVGAN
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Resultados de evaluación completos: https://huggingface.co/mmmhusto/TTS-English-Duo/blob/main/evaluation.json
