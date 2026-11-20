# moonbox-dev/xvc

## Resumen

X-VC para Moonbox es un paquete de conversión de voz a voz (voice conversion) empaquetado en formato MLX para Apple Silicon, distribuido por moonbox-dev como dependencia del cliente de escritorio Moonbox. No es un modelo original: se trata de una conversión y reempaquetado del convertidor X-VC de chenxie95 (repositorio original en GitHub de Jerrister Zheng), junto con el codificador de hablante ERes2Net de 3D-Speaker y el tokenizer de GLM-4-Voice embebido en los pesos del convertidor. El objetivo es transformar una grabación de voz en una voz predefinida o en una voz clonada a partir de un clip corto, preservando la dicción y el estilo de la interpretación original.

El repositorio ocupa 3,4 GB e incluye el convertidor en un único fichero MLX de 16 bits y la versión original a precisión completa, además del codificador de hablante necesario para la clonación. La librería declarada es MLX, lo que limita su ejecución a hardware Apple (chips M-series), y el pipeline declarado es audio-to-audio. El modelo base es chenxie95/X-VC, un sistema de conversión de voz con códec acústico SAC y adaptadores, sobre el que Moonbox aplica cuantización y conversión a safetensors MLX.

La relevancia de este paquete es práctica: permite a la aplicación Moonbox ejecutar conversión de voz local en Mac sin depender de servicios en la nube, a costa de una licencia híbrida que combina MIT para el convertidor con la licencia glm-4-voice de Zhipu AI para el tokenizer embebido, lo que condiciona el uso comercial. No se dispone de información sobre benchmarks, idiomas soportados ni rendimiento medido en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Convertidor X-VC con adaptadores, prenet y códec acústico SAC; codificador semántico derivado de Whisper-large-v3 + VQ (GLM-4-Voice tokenizer); codificador de hablante ERes2Net |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo audio-to-audio, no texto) |
| Tipos de cuantizacion | 16 bits (MLX) y precisión completa original; no se detallan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | glm-4-voice-license (Zhipu AI) para el paquete; componente X-VC bajo MIT; ERes2Net bajo Apache 2.0 |
| Formato de pesos | safetensors (xvc_infer.safetensors) en formato MLX |
| Tamano del repositorio | 3,4 GB |
| Modelo base | chenxie95/X-VC |
| Pipeline | audio-to-audio |
| Libreria | mlx |

## Arquitectura y entrenamiento

El sistema combina tres componentes. El convertidor X-VC propiamente dicho incluye el conversor, adaptadores, una prenet y un códec acústico SAC (Soul-AILab, Apache 2.0). Sobre él se embebe un codificador semántico derivado de Whisper-large-v3 con cuantización vectorial (VQ), correspondiente al tokenizer de GLM-4-Voice, que aporta representaciones discretas del contenido lingüístico. El tercer componente es ERes2Net, un codificador de hablante entrenado sobre VoxCeleb en inglés (iic/speech_eres2net_sv_en_voxceleb_16k), que extrae el embedding de la voz objetivo para la clonación a partir de un clip corto.

Moonbox no ha entrenado el modelo: ha convertido los pesos originales de xvc.pt a xvc_infer.safetensors, los ha cuantizado a 16 bits para MLX y ha reempaquetado los componentes. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o ajuste fino adicional. La innovación técnica relevante es la integración de un tokenizer semántico de tipo GLM-4-Voice dentro del pipeline de conversión, lo que permite separar contenido y timbre, y el empaquetado en un único fichero MLX optimizado para Apple Silicon.

## Capacidades

- Conversión de voz a voz: transforma una grabación en una voz predefinida conservando la dicción, el ritmo y la expresividad del hablante original.
- Clonación de voz zero-shot a partir de un clip corto, mediante el codificador de hablante ERes2Net.
- Preservación del estilo de interpretación (delivery), según la descripción del autor del paquete.
- Procesamiento local en Apple Silicon mediante MLX, sin necesidad de GPU dedicada ni servicios en la nube.
- Integración con la aplicación de escritorio Moonbox, que verifica cada fichero contra una lista firmada antes de usarlo.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada en formato texto.

## Casos de uso

- Doblaje y localización de contenidos: convertir la voz de un actor a una voz objetivo manteniendo la interpretación original, útil para prototipos de doblaje antes de la mezcla final.
- Producción de podcast y audiolibros: unificar la voz de distintos colaboradores hacia un timbre consistente sin regrabar el material.
- Creación de contenido para redes: generar variantes de una misma grabación con voces distintas para pruebas A/B de formato y tono.
- Anonimización de voz en entrevistas o material sensible: sustituir el timbre del hablante por una voz predefinida preservando el contenido y la prosodia.
- Prototipado de asistentes de voz: generar muestras con distintos timbres para evaluar la percepción de usuarios antes de contratar voces definitivas.
- Investigación en conversión de voz: usar el paquete MLX como referencia reproducible en Mac para comparar pipelines de VC con tokenizer semántico y codificador de hablante.
- Desarrollo de aplicaciones de accesibilidad: ofrecer una voz personalizada a usuarios que han perdido la suya, a partir de grabaciones previas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 3,4 GB, por lo que se requiere al menos ese espacio en disco y memoria unificada suficiente para cargar los pesos MLX en memoria.
- GPU recomendadas: hardware Apple Silicon con soporte MLX (chips M1, M2, M3, M4 y variantes Pro, Max y Ultra). No se documenta soporte para GPU NVIDIA o AMD.
- Cabe en GPU consumer: sí, en equipos Apple Silicon con memoria unificada; no aplica a GPU discretas convencionales por la dependencia de MLX.
- Opciones de despliegue: librería MLX y la aplicación Moonbox; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que es un modelo de audio y no de texto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| X-VC para Moonbox | Conversión de voz (audio-to-audio) | no disponible | no aplica | glm-4-voice-license (con componentes MIT y Apache 2.0) | Hugging Face, MLX |
| X-VC original (chenxie95) | Conversión de voz | no disponible | no aplica | no disponible en la información | Hugging Face, GitHub |
| GLM-4-Voice tokenizer (zai-org) | Tokenizer de audio | no disponible | no aplica | glm-4-voice-license | Hugging Face |
| ERes2Net (3D-Speaker) | Codificador de hablante | no disponible | no aplica | Apache 2.0 | ModelScope |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Licencia híbrida y restrictiva: el paquete declara glm-4-voice-license porque embebe el tokenizer de GLM-4-Voice; el uso académico es libre, pero el uso comercial requiere registro con Zhipu AI.
- El componente X-VC es MIT y ERes2Net es Apache 2.0, pero la combinación distribuida queda sujeta a la licencia más restrictiva del conjunto.
- No es una versión oficial de los modelos originales: Moonbox convierte, cuantiza y reempaqueta, por lo que puede haber divergencias respecto a los pesos publicados por los autores.
- Dependencia de MLX y Apple Silicon: no es desplegable en GPU NVIDIA, AMD ni en entornos Linux con CUDA.
- El codificador de hablante ERes2Net está entrenado en inglés sobre VoxCeleb; el rendimiento en otros idiomas o acentos no está documentado.
- Riesgo de artefactos, pérdida de prosodia o inestabilidad en grabaciones con ruido, solapamientos o clips de referencia muy cortos; no se documentan métricas de calidad.
- Riesgo de uso indebido para suplantación de identidad o fraude; no se documentan mecanismos de marca de agua ni de detección.
- No se documentan sesgos demográficos, de género o de acento del sistema.
- La fecha de creación del repositorio (2026-10-16) y el tamaño del paquete sugieren un proyecto reciente con cero descargas y cero likes, sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/xvc
- Modelo base X-VC: https://huggingface.co/chenxie95/X-VC
- Código original X-VC: https://github.com/Jerrister/X-VC
- Tokenizer GLM-4-Voice: https://huggingface.co/zai-org/glm-4-voice-tokenizer
- Licencia GLM-4-Voice: https://huggingface.co/zai-org/glm-4-voice-tokenizer/blob/main/LICENSE
- Registro de uso comercial Zhipu AI: https://open.bigmodel.cn/mla/form
- Codificador de hablante ERes2Net: https://modelscope.cn/models/iic/speech_eres2net_sv_en_voxceleb_16k
- Aplicación Moonbox: https://moonbox.dev
