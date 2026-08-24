# Anadilorg/Anadil_Kurmanji_TTS

## Resumen

AnadilKurmanjiTTS es un adaptador LoRA de código abierto para síntesis de voz (text-to-speech) en kurmanji (kurdo kurmanji, ISO 639-3: `kmr`), desarrollado por Anadilorg. Se construye sobre el modelo base VoxCPM2 de OpenBMB, al que se le aplica un ajuste fino mediante LoRA de bajo rango. El modelo está diseñado para abordar la escasez de herramientas digitales en una lengua con transmisión intergeneracional en declive, especialmente en la diáspora turca, y se enmarca en una familia de adaptadores para lenguas en peligro (junto con modelos para laz, zaza y adigué).

El adaptador fue entrenado con 65.102 segmentos de un único hablante, lo que lo convierte en el modelo más grande y entrenado de la familia Anadil. Tiene un tamaño de unos 18,1 millones de parámetros y genera audio a 48 kHz a partir de texto en kurmanji. La licencia MIT permite uso comercial y modificación libre, aunque el modelo base VoxCPM2 tiene su propia licencia que debe verificarse. Su relevancia actual radica en ser una de las pocas soluciones abiertas para TTS en kurmanji, un idioma con poca representación en el ecosistema de IA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre VoxCPM2 (modelo base de difusión para TTS) |
| Parametros totales | ~18,1 millones (solo adaptador) |
| Parametros activos | No aplica (no es MoE; todos los parámetros del adaptador son activos) |
| Longitud de contexto | No aplica (TTS, no modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Kurmanji (kmr) (el modelo base puede soportar otros, pero el adaptador está entrenado solo para kmr) |
| Licencia | MIT |
| Formato de pesos | safetensors (lora_weights.safetensors) |

## Arquitectura y entrenamiento

AnadilKurmanjiTTS es un adaptador LoRA (r=32, α=32) que se inserta en las capas LM (language model) y DiT (diffusion transformer) del modelo base VoxCPM2. VoxCPM2 es un modelo de síntesis de voz basado en difusión que convierte texto en representaciones latentes de audio y las decodifica a forma de onda. El adaptador modifica los pesos de estas capas mediante matrices de bajo rango, lo que permite adaptar el modelo a una nueva lengua sin reentrenar todo el modelo.

El entrenamiento se realizó con 65.102 segmentos de audio de un único hablante (identificado como `spk_tmp_001`), con una duración total de 10.000 pasos. No se menciona el uso de RLHF ni DPO; se trata de un ajuste fino supervisado sobre datos de voz transcritos. El adaptador tiene un tamaño de aproximadamente 70 MB en disco y se guarda en formato safetensors. La entrada de texto debe seguir el formato `[speaker:spk_tmp_001 language:kmr] <texto>`, y la salida es una forma de onda a 48 kHz.

## Capacidades

- Síntesis de texto a voz en kurmanji (kurdo kurmanji) con una voz específica y consistente (hablante único).
- Generación de audio de alta calidad a 48 kHz de frecuencia de muestreo.
- Control de parámetros de inferencia como número de pasos de difusión y escala de clasifier-free guidance (cfg).
- Integración sencilla con la librería `voxcpm` de Python, con soporte para GPU, MPS y CPU.
- No soporta otras capacidades como visión, razonamiento o tool calling, ya que es un modelo TTS puro.
- No es multilingüe: el adaptador está entrenado exclusivamente para kurmanji, aunque el modelo base VoxCPM2 pueda soportar otros idiomas.

## Casos de uso

- **Preservación lingüística**: generar audios en kurmanji para archivos digitales, bibliotecas de audio y materiales de documentación, contribuyendo a mantener viva la lengua.
- **Educación y aprendizaje de idiomas**: crear ejercicios de pronunciación, audiolibros y lecciones interactivas para hablantes de kurmanji, especialmente para niños de la diáspora.
- **Contenido audiovisual**: doblaje de vídeos, podcasts y noticias en kurmanji, sin necesidad de actores de voz profesionales.
- **Accesibilidad**: convertir texto escrito en kurmanji a audio para personas con discapacidad visual o dificultades de lectura.
- **Asistentes de voz locales**: integrar el modelo en asistentes de voz o chatbots para la comunidad kurda, permitiendo interacciones habladas en su lengua materna.
- **Traducción y subtitulado**: combinar con sistemas de traducción automática para generar voz en kurmanji a partir de textos en otros idiomas, facilitando la localización de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas como MOS (Mean Opinion Score) ni comparaciones con otros sistemas. La evaluación cualitativa se presenta a través de muestras de audio comparativas (original vs. síntesis) en la página del modelo.

## Requisitos de hardware

- El adaptador LoRA es muy ligero (~70 MB), pero el modelo base VoxCPM2 es un modelo de difusión con decenas de millones de parámetros. Los requisitos de memoria dependen del tamaño del modelo base.
- No se dispone de especificaciones de VRAM exactas para VoxCPM2. Se recomienda consultar la documentación del modelo base para conocer requisitos mínimos.
- En la práctica, se puede ejecutar en GPUs de consumidor como RTX 3060 o superiores, o en CPUs con mayor latencia. El script de inferencia permite seleccionar dispositivo (`cuda`, `mps`, `cpu`).
- Opciones de despliegue: se puede usar directamente con la librería `voxcpm` en un entorno Python, o mediante el script `inference.py` incluido en el repositorio. También se proporciona una interfaz Gradio local (`demo.py`).
- No se han reportado métricas de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos TTS específicos para kurmanji con licencia abierta en el momento de la redacción. La familia Anadil incluye adaptadores para otras lenguas amenazadas (laz, zaza, adyghe), pero no se han encontrado comparaciones directas. El modelo base VoxCPM2 es multilingüe, pero el adaptador se limita a kurmanji. No hay datos para establecer comparativas cuantitativas.

## Limitaciones y advertencias

- **Voz única**: el modelo genera una única voz (hablador `spk_tmp_001`). No es posible cambiar de hablante ni clonar voces.
- **Alcance lingüístico**: solo está entrenado para kurmanji; no soporta otros idiomas ni dialectos kurdos como el sorani (ckb).
- **Riesgo de alucinación**: en TTS, puede producir pronunciaciones incorrectas o entonaciones artificiales para palabras fuera de vocabulario o nombres propios no vistos.
- **Calidad limitada por datos**: con 65.102 segmentos de un solo hablante, la cobertura de acentos, estilos y registros es reducida.
- **Dependencia del modelo base**: la licencia MIT del adaptador no implica que el modelo base VoxCPM2 tenga la misma licencia; se debe revisar la licencia de VoxCPM2 para uso comercial.
- **Sin soporte de emociones o estilos**: no permite controlar emociones, velocidad ni énfasis en la síntesis.
- **Documentación en turco**: la documentación oficial está en turco, lo que puede ser una barrera para usuarios de otros idiomas.

## Enlaces

- [Hugging Face - Anadilorg/Anadil_Kurmanji_TTS](https://huggingface.co/Anadilorg/Anadil_Kurmanji_TTS)
- [GitHub - AnadilOrg/Anadil_Kurmanji_TTS](https://github.com/AnadilOrg/Anadil_Kurmanji_TTS)
- [Modelo base VoxCPM2 en Hugging Face](https://huggingface.co/openbmb/VoxCPM2)
- [Paper de referencia (arxiv:2106.09685)](https://arxiv.org/abs/2106.09685) (relacionado con técnicas de difusión, no específico del modelo)
