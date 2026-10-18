# Allinsama/openbmb__VoxCPM1.5

## Resumen

VoxCPM1.5 es un sistema de síntesis de voz (text-to-speech) de tipo end-to-end desarrollado por OpenBMB y ModelBest, publicado originalmente en el repositorio `openbmb/VoxCPM1.5` y replicado aquí por el usuario Allinsama. Su rasgo diferencial es que prescinde de tokenizador de audio discreto: en lugar de convertir la señal de voz en tokens discretos, modela el habla en un espacio continuo mediante una arquitectura autorregresiva de difusión que genera directamente representaciones continuas de audio a partir del texto. El resultado son dos capacidades principales: generación de habla expresiva y consciente del contexto, y clonación de voz zero-shot fiel al timbre y al estilo del habla de referencia.

El modelo se apoya en el backbone de lenguaje MiniCPM4-0.5B y suma un total de 801.729.856 parámetros (aproximadamente 0,8 mil millones), con pesos en safetensors y un repositorio de 1,9 GB. La versión 1.5, publicada el 5 de diciembre de 2025, eleva la frecuencia de muestreo del VAE de audio de 16 kHz a 44,1 kHz y reduce la tasa de tokens del modelo de lenguaje de 12,5 Hz a 6,25 Hz con un tamaño de parche de 4, lo que rebaja el coste computacional manteniendo la calidad. Además incorpora soporte de ajuste fino mediante SFT y LoRA.

Su relevancia práctica está en la eficiencia: el autor declara un factor de tiempo real (RTF) de hasta 0,17 en una RTX 4090, lo que habilita síntesis en streaming y aplicaciones de voz en tiempo real sobre hardware de consumo. Está entrenado sobre un corpus bilingüe de 1,8 millones de horas en inglés y chino, y se distribuye con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS end-to-end autorregresiva de difusión (tokenizer-free) sobre backbone MiniCPM4-0.5B, con VAE de audio y restricciones FSQ |
| Parametros totales | 801.729.856 (0,8 B aproximadamente) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el repositorio solo distribuye pesos safetensors |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | openbmb/MiniCPM4-0.5B |
| Pipeline | text-to-speech |
| Libreria | voxcpm (paquete PyPI `voxcpm`) |
| Frecuencia de muestreo del audio de salida | 44,1 kHz (VAE de audio) |
| Tasa de tokens del modelo de lenguaje | 6,25 Hz |
| Tamano de parche (patch size) | 4 |
| Tamano del repositorio | 1,9 GB |
| Descargas / likes (repo espejo) | 11 / 0 |

## Arquitectura y entrenamiento

VoxCPM emplea una arquitectura autorregresiva de difusión end-to-end en lugar del esquema habitual de dos etapas (tokenizador de audio discreto + modelo de lenguaje + vocoder). El modelo parte del backbone MiniCPM4-0.5B y genera directamente representaciones continuas de habla a partir del texto, apoyándose en un VAE de audio y en restricciones FSQ (finite scalar quantization) para lograr un desacoplamiento implícito entre semántica y acústica mediante modelado jerárquico del lenguaje. La decodificación la realiza un componente de difusión local (LocDiT), controlado en inferencia por dos parámetros expuestos en la API: `cfg_value` (guía del modelo de lenguaje sobre LocDiT, por defecto 2,0) e `inference_timesteps` (pasos de difusión, por defecto 10).

El entrenamiento se realizó sobre un corpus bilingüe (inglés y chino) de 1,8 millones de horas según la model card. No se detalla en la información disponible la composición exacta del dataset, el número de tokens de texto utilizados ni si hubo etapas de RLHF o DPO; el autor sí confirma soporte de ajuste fino supervisado (SFT) y de LoRA para adaptar voces personalizadas. La versión 1.5 mantiene compatibilidad hacia atrás con VoxCPM-0.5B y mejora la resolución del audio (16 kHz a 44,1 kHz) y la eficiencia (12,5 Hz a 6,25 Hz de tasa de tokens, parche de 2 a 4).

## Capacidades

- Síntesis de voz a partir de texto con prosodia inferida del contenido (generación de habla consciente del contexto).
- Clonación de voz zero-shot a partir de un clip corto de audio de referencia, capturando timbre, acento, tono emocional, ritmo y velocidad.
- Síntesis en streaming, con RTF declarado de hasta 0,17 en una NVIDIA RTX 4090.
- Control fino en inferencia mediante `cfg_value`, `inference_timesteps` y umbrales de reintento (`retry_badcase_max_times`, `retry_badcase_ratio_threshold`).
- Soporte de ajuste fino con SFT y LoRA para voces o estilos personalizados.
- Capacidades multilingües limitadas a inglés y chino.
- Integración con herramientas externas opcionales en el demo: ZipEnhancer para mejora del audio de referencia (denoise) y SenseVoice-Small para ASR del prompt de voz.
- No se documenta en la información disponible soporte de tool calling, agentes, visión ni audio de entrada como tal (el audio solo se usa como referencia de clonación).

## Casos de uso

- Clonación de voz para locución corporativa: con un clip corto de referencia de un locutor se puede generar narración consistente para vídeos, audiolibros o cursos, manteniendo timbre y ritmo del hablante original.
- Asistentes de voz en tiempo real: el RTF de 0,17 en RTX 4090 y la síntesis en streaming permiten alimentar pipelines de conversación por voz con latencia baja en hardware de consumo.
- Doblaje y localización de contenido: al soportar inglés y chino, se puede reutilizar la voz del actor original en la otra lengua manteniendo características prosódicas, aunque requiere validación de calidad por el condicionamiento al prompt.
- Accesibilidad y lectores de pantalla: conversión de texto largo a voz natural con prosodia adaptada al contenido, desplegable en local sin dependencia de APIs externas.
- Generación de voces para videojuegos y prototipado: creación rápida de múltiples personajes mediante SFT o LoRA sobre el modelo base, con voces diferenciadas por timbre y estilo.
- Producción de pódcasts y contenido educativo: síntesis por lotes con distintos estilos expresivos a partir del mismo texto, ajustando `cfg_value` e `inference_timesteps` según la fidelidad deseada.
- Investigación en TTS: base reproducible (Apache 2.0) para experimentar con arquitecturas tokenizer-free, difusión autorregresiva y decodificación con FSQ.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de eficiencia y de configuración del pipeline:

| Metrica | VoxCPM | VoxCPM1.5 |
|---|---|---|
| Frecuencia de muestreo del VAE de audio | 16 kHz | 44,1 kHz |
| Tasa de tokens del LM | 12,5 Hz | 6,25 Hz |
| Tamano de parche | 2 | 4 |
| Soporte SFT | Si | Si |
| Soporte LoRA | Si | Si |
| RTF en RTX 4090 (streaming) | No disponible | Hasta 0,17 |

No se proporcionan cifras de MMLU, HumanEval, GSM8K ni de métricas de calidad de voz (MOS, WER, similitud de hablante) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos suman 801.729.856 parámetros, lo que equivale a unos 1,6 GB en fp16; el repositorio completo ocupa 1,9 GB. Como estimación derivada (no publicada por el autor), la inferencia en fp16 debería manejarse con comodidad en 4-6 GB de VRAM, incluyendo activaciones y buffers del VAE de audio.
- GPU recomendadas: el autor valida explícitamente una NVIDIA RTX 4090 para el RTF de 0,17 en streaming. No se documentan cifras para A100, H100 ni otras GPU.
- Cabe en GPU de consumo: sí, por el tamaño de parámetros; la RTX 4090 es el caso documentado. Otras GPU consumer no están verificadas en la información disponible.
- Opciones de despliegue: paquete oficial `pip install voxcpm` con la clase `VoxCPM.from_pretrained(...)`; descarga de pesos vía `huggingface_hub.snapshot_download`; demo público en Hugging Face Spaces. No se mencionan integraciones con vLLM, TGI, llama.cpp ni Ollama (son runtimes de LLM de texto y el modelo usa una librería propia).
- Latencia y throughput: RTF de hasta 0,17 en RTX 4090 con síntesis en streaming, es decir, aproximadamente 6 veces más rápido que el tiempo real en ese hardware.
- Umbrales de calidad/velocidad: `inference_timesteps` (por defecto 10) reduce pasos de difusión para ir más rápido; `cfg_value` (por defecto 2,0) prioriza la adherencia al prompt.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Audio | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|---|
| VoxCPM1.5 | 0,8 B (801.729.856) | No disponible | 44,1 kHz, tokens a 6,25 Hz, parche 4 | en, zh | Apache 2.0 | Soporte SFT y LoRA, RTF 0,17 en RTX 4090 |
| VoxCPM (0.5B) | No disponible en la informacion (nombre comercial 0.5B) | No disponible | 16 kHz, tokens a 12,5 Hz, parche 2 | en, zh | Apache 2.0 | Version anterior, compatible hacia atras con VoxCPM1.5 |
| MiniCPM4-0.5B | 0,5 B aproximadamente | No disponible | No aplica (LLM de texto) | No disponible | No disponible en la informacion | Backbone de lenguaje sobre el que se construye VoxCPM1.5 |

No se dispone en la información proporcionada de datos verificables de otros sistemas TTS comparables (por ejemplo, modelos de síntesis neuronal de tamaño similar) para establecer una comparación de parámetros, contexto, rendimiento y licencia sin caer en invenciones.

## Limitaciones y advertencias

- Solo soporta inglés y chino; no hay evidencia de cobertura de castellano ni de otras lenguas en la información disponible.
- La calidad de salida depende directamente de la calidad del audio de referencia empleado para la clonación (advertencia explícita del autor).
- El modelo puede generar casos problemáticos no detenibles; la API incorpora un modo de reintento (`retry_badcase`, hasta 3 intentos) y un umbral de longitud (`retry_badcase_ratio_threshold` de 6,0) que conviene ajustar para habla lenta.
- Riesgo de alucinación o de prosodia inadecuada inherente a la generación autorregresiva; no se documentan tasas de error ni evaluaciones sistemáticas de fidelidad.
- El uso de la herramienta externa de denoising puede introducir distorsión y limita la frecuencia de muestreo a 16 kHz.
- El uso de normalización externa (`normalize=True`) desactiva el soporte nativo de texto crudo, lo que puede afectar a la naturalidad.
- El repositorio analizado es un espejo publicado por un tercero (Allinsama) del modelo original de OpenBMB; para producción conviene referenciar el repositorio oficial `openbmb/VoxCPM1.5`.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar avisos de copyright y licencia y de indicar cambios; no se documentan cláusulas adicionales.
- No se documentan sesgos demográficos, de acento o de género en los datos de entrenamiento; el corpus de 1,8 millones de horas es bilingüe y su composición no se detalla.
- La clonación de voz plantea riesgos de suplantación de identidad; no se describe en la información disponible ningún mecanismo de marca de agua o de consentimiento.
- El campo de longitud de contexto no está publicado; el comportamiento con textos muy largos no está verificado.

## Enlaces

- Repositorio analizado: https://huggingface.co/Allinsama/openbmb__VoxCPM1.5
- Modelo oficial: https://huggingface.co/openbmb/VoxCPM1.5
- Modelo anterior: https://huggingface.co/openbmb/VoxCPM-0.5B
- Modelo base: https://huggingface.co/openbmb/MiniCPM4-0.5B
- Repositorio de codigo: https://github.com/OpenBMB/VoxCPM/
- Informe tecnico: https://arxiv.org/abs/2509.24650
- Demo en vivo: https://huggingface.co/spaces/OpenBMB/VoxCPM-Demo
- Muestras de audio: https://openbmb.github.io/VoxCPM-demopage
- ModelScope: https://modelscope.cn/models/OpenBMB/VoxCPM1.5
- Documentacion (wiki MiniCPM): https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo; los unicos enlaces utiles son los presentes en la model card.
