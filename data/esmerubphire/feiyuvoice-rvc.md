# Esmerubphire/FeiyuVoice-RVC

## Resumen

FeiyuVoice-RVC v1 (también denominado 肥鱼翻唱声库) es un banco de voces basado en RVC v2 para conversión de voz y de voz cantada: toma una pista vocal limpia ya existente y la transforma en el timbre del personaje Feiyu. Lo publica el usuario Esmerubphire y no es un modelo de texto a voz ni genera canto a partir de MIDI; su función es exclusivamente la conversión audio-a-audio. El repositorio, de 0,1 GB, incluye los pesos `FeiyuVoice-RVC-v1.pth`, el índice de recuperación `FeiyuVoice-RVC-v1.index` y utilidades locales de postprocesado.

La arquitectura es RVC v2 a 40 kHz con estimación de tono F0, vocoder HiFi-GAN y un único intérprete, apoyada en el codificador de contenido ContentVec 768 y en el método de tono RMVPE. El modelo se ha entrenado con 2000 actualizaciones de optimizador y se distribuye con parámetros de inferencia fijados (Index Rate 0,3; Protect 0,33; en envolvente de volumen 1,0; transposición 0; Speaker y Seed 0/42). Está pensado para importarse directamente en motores compatibles como Applio o RVC y convertir WAV/FLAC limpios.

Su relevancia práctica es doble: por un lado empaqueta un timbre concreto listo para usar en producción de contenido (covers, doblaje, VTuber); por otro, añade un entorno de ejecución reproducible (`run_rvc.py`, `Convert.ps1`) y un verificador de SHA que permiten integrar la conversión en flujos de trabajo propios, además de una herramienta HTML para atenuar manualmente las respiraciones. Los idiomas declarados son chino (zh) e inglés (en), y la licencia es específica del autor (`feiyuvoice-distribution-notice`), no una licencia de código abierto estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RVC v2, 40 kHz, F0, HiFi-GAN, monointérprete; codificador de contenido ContentVec 768; estimación de tono RMVPE |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo audio-a-audio, no procesa texto) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos `.pth` e índice `.index`; no se publican versiones cuantizadas) |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | `feiyuvoice-distribution-notice` (categoría `other`); condiciones en NOTICE.md |
| Formato de pesos | `.pth` (pesos) + `.index` (índice de recuperación) |

Parámetros de inferencia fijados por el autor:

| Parametro | Valor |
|---|---|
| Transposición (transpose) | 0 (no cambia el registro automáticamente) |
| Index Rate | 0,3 |
| Protect | 0,33 |
| Volume Envelope | 1,0 |
| Speaker / Seed | 0 / 42 |
| Actualizaciones de optimizador | 2000 |
| Tamaño del repositorio | 0,1 GB |
| Pipeline | audio-to-audio |

## Arquitectura y entrenamiento

Se trata de un modelo RVC v2 orientado a conversión de voz cantada y hablada a 40 kHz. La cadena de inferencia combina un codificador de contenido ContentVec de 768 dimensiones para extraer la representación fonética del audio de entrada, un estimador de tono RMVPE para la F0 y un vocoder HiFi-GAN que reconstruye la forma de onda con el timbre objetivo. El índice de recuperación (`FeiyuVoice-RVC-v1.index`) actúa como característica de emparejamiento de timbre durante la conversión. Es un modelo de intérprete único: no soporta cambio de hablante ni múltiples voces en el mismo peso.

El autor indica que el banco se ha entrenado con 2000 actualizaciones de optimizador y que la versión v1 es la nomenclatura oficial del banco final, sin reentrenamiento, cuantización ni reescritura de pesos respecto a la selección interna. No se publica el número de tokens, la composición del dataset ni si hubo RLHF/DPO (no aplicables a este tipo de modelo). Tampoco se incluyen las grabaciones de entrenamiento, las canciones originales, las escuchas experimentales ni el estado de reanudación del entrenamiento. El autor advierte explícitamente de que el entrenamiento de canto, la identidad, el registro y las limitaciones de las fuentes siguen condicionando el resultado, y de que no ofrece nuevas métricas de fidelidad de identidad ni de naturalidad.

## Capacidades

- Conversión de voz audio-a-audio: transforma una pista vocal limpia (WAV/FLAC) en el timbre del personaje Feiyu.
- Conversión de voz cantada (singing voice conversion): pensada para pistas vocales de canciones previamente separadas de la instrumentación.
- Soporte de chino e inglés en la entrada, según los idiomas declarados.
- Índice de recuperación de timbre integrado para mejorar el parecido con la voz objetivo (Index Rate 0,3).
- Herramienta offline de atenuación de respiraciones (`换气区间标记.html` + `apply_breath.py`): reduce el volumen en intervalos marcados manualmente, con −24 dB en el centro del intervalo y transición coseno en los bordes, sin generar aire, sin cambiar el tono y sin aplicar EQ, compresión ni compensación de sonoridad.
- Entrada de ejecución reproducible (`run_rvc.py`) con verificación de SHA256 de archivos y del código de ejecución, más scripts `Convert.ps1` para Windows + WSL.
- Integración con el plugin AstrBot `astrbot_plugin_feiyu_voice` como servicio de voz local.
- No incluye generación de texto, razonamiento, código, matemáticas, visión, tool calling, function calling ni comportamiento de agente; no es un LLM ni un sistema multimodal de texto.

## Casos de uso

- Producción de covers: se separa la instrumentación de una canción, se convierte la vocal limpia con el `.pth` y el `.index` en Applio/RVC y se vuelve a mezclar con la base instrumental. El modelo está entrenado específicamente para canto, por lo que es adecuado para este flujo.
- Doblaje de personaje: conversión de locuciones de un actor de voz al timbre de Feiyu para contenido de animación o ficción sonora, manteniendo el texto y la interpretación originales.
- Contenido de VTuber y streaming: conversión en local de la voz del creador al timbre del personaje, con el servicio de voz integrado mediante el plugin AstrBot o el punto de entrada `run_rvc.py`.
- Producción de contenido fan y doujin: generación de versiones alternativas de canciones o diálogos con el timbre del personaje, respetando las condiciones de distribución de NOTICE.md.
- Postproducción de naturalidad: uso de la herramienta de marcado de respiraciones para rebajar manualmente los pasajes de aire del vocal convertido antes de la mezcla final, sin alterar el resto de la señal.
- Integración en pipelines locales: invocación de `python -B run_rvc.py --input ... --output-dir ...` dentro de un flujo automatizado, con verificación previa mediante `--verify-only` para asegurar que el runtime y los archivos coinciden.
- Sustitución de voz en material ya grabado: conversión de entrevistas, narraciones o lecturas en chino o inglés al timbre del personaje para pruebas de doblaje o demos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica expresamente que no proporciona nuevas puntuaciones de fidelidad de identidad ni de naturalidad, y que la calidad en chino, en inglés y en distintos registros debe evaluarse mediante escucha sobre material real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. No se publica una cifra específica para este modelo.
- GPU recomendadas: no disponible. El autor exige un entorno Applio con GPU ya desplegado; los detalles de runtime se describen en `server/RUNTIME.md` del repositorio del plugin.
- Compatibilidad con GPU de consumo: el tamaño del repositorio (0,1 GB) y la naturaleza del modelo RVC v2 sugieren que la inferencia es ligera, pero no se confirma con datos medidos en la fuente.
- Opciones de despliegue: Applio / motores RVC compatibles (importación directa de `.pth` y `.index`); `run_rvc.py` como entrada independiente sobre un entorno Applio GPU; `Convert.ps1` en Windows + WSL; servicio de voz local a través de `astrbot_plugin_feiyu_voice`. No procede vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponible. El autor advierte de que distintos GPU, segmentaciones y motores de terceros no garantizan resultados idénticos bit a bit.
- El repositorio no es una API de inferencia alojada ni un ejecutable autónomo; requiere preparar el runtime y descargar los activos comunes de ContentVec/RMVPE desde sus fuentes originales, ya que no se incluyen en el banco de voces.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FeiyuVoice-RVC v1 | Conversión de voz (RVC v2, 40 kHz) | no disponible | no aplica | zh, en | `feiyuvoice-distribution-notice` | Hugging Face y ModelScope |
| FeiyuVoice-CosyVoice3 (mismo autor) | Texto a voz (habla) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Modelos RVC v2 genéricos de la comunidad | Conversión de voz | varía según el modelo | no aplica | varía | varía | Repositorios comunitarios |

La comparación directa con alternativas cuantificadas no está disponible: no se han publicado parámetros totales, métricas de calidad ni requisitos de hardware para este modelo, y las alternativas genéricas de RVC presentan configuraciones heterogéneas que impiden una comparación numérica rigurosa. La diferencia funcional relevante frente a FeiyuVoice-CosyVoice3 es que este último es un modelo de texto a voz, mientras que FeiyuVoice-RVC v1 solo convierte audio existente.

## Limitaciones y advertencias

- No es un modelo de texto a voz: no sintetiza habla a partir de texto ni genera canto a partir de una partitura. Para "partitura + letra → canto" se necesita un motor SVS adicional y referencias alineadas que no se incluyen en el repositorio.
- Requiere material de entrada limpio: la vocal debe estar separada de la instrumentación antes de la conversión; la mezcla posterior corre a cargo del usuario.
- La transposición está fijada a 0 y el modelo no ajusta el registro automáticamente, por lo que las entradas fuera del rango cubierto pueden degradarse.
- El entrenamiento es limitado (2000 actualizaciones de optimizador) y el propio autor señala que el material de canto, la identidad y las fuentes de entrenamiento condicionan los resultados; no hay garantía de calidad uniforme en chino, inglés ni en todos los registros.
- No se han publicado métricas objetivas de fidelidad de identidad ni de naturalidad, lo que impide estimar el rendimiento antes de probarlo.
- Riesgo de artefactos y alucinaciones vocales propio de los modelos generativos de audio: pueden aparecer inestabilidades en pasajes extremos, respiraciones o transiciones.
- Idiomas limitados a chino e inglés; no se declara soporte de castellano.
- Licencia restrictiva: `feiyuvoice-distribution-notice` (categoría `other`) impone condiciones específicas de distribución y reutilización recogidas en NOTICE.md; es imprescindible revisarlas antes de cualquier uso comercial. Las licencias del código upstream (Applio, ContentVec, RMVPE, HiFi-GAN) se mantienen por separado.
- Reproducibilidad no garantizada: el autor advierte de que la verificación se realizó en una copia aislada en su máquina Windows + WSL y que otros GPU, segmentaciones o motores de terceros pueden producir resultados distintos bit a bit.
- El repositorio no contiene las grabaciones de entrenamiento, las canciones originales, las escuchas experimentales, el estado de reanudación del entrenamiento, el entorno Python/CUDA ni credenciales locales.
- No es un servicio alojado ni un ejecutable listo para usar: la puesta en marcha exige preparar el runtime y descargar los activos comunes desde sus fuentes originales.

## Enlaces

- Hugging Face: https://huggingface.co/Esmerubphire/FeiyuVoice-RVC
- ModelScope (espejo): https://modelscope.cn/models/Esmerubphire/FeiyuVoice-RVC
- Aviso de licencia y distribución (NOTICE.md): https://huggingface.co/Esmerubphire/FeiyuVoice-RVC/blob/main/NOTICE.md
- Repositorio del plugin y servicio de voz (GitHub): https://github.com/kaiyuey03/astrbot_plugin_feiyu_voice
- Documentación del runtime (RUNTIME.md): https://github.com/kaiyuey03/astrbot_plugin_feiyu_voice/blob/main/server/RUNTIME.md
- Banco de voces de habla del mismo autor (FeiyuVoice-CosyVoice3): https://huggingface.co/Esmerubphire/FeiyuVoice-CosyVoice3
