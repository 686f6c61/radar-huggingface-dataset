# NYCU-MLLab/Bidirectional_ASR-TTS_Flow_Matching

## Resumen

Bidirectional Variational Flow Matching (BVFM) es un modelo desarrollado por el laboratorio NYCU-MLLab de la Universidad Nacional Chiao Tung (Taiwán) que unifica tareas de generación y reconocimiento cross-modal mediante un mismo marco de *flow matching* variacional. El repositorio publica los pesos de despliegue para dos ramas: una dedicada a imagen/texto y otra a habla/texto, que cubre reconocimiento automático del habla (ASR) y síntesis de voz (TTS). La idea central es que un único campo vectorial puede integrarse en direcciones opuestas para resolver tareas distintas, lo que reduce la duplicación de arquitecturas y favorece un entrenamiento conjunto.

La relevancia actual radica en la tendencia hacia modelos unificados que comparten representaciones continuas entre modalidades, en lugar de sistemas separados. BVFM se alinea con esa línea de investigación, aunque el repositorio se encuentra en una fase temprana: solo contiene pesos de inferencia, sin código de entrenamiento, métricas o documentación técnica detallada. Los archivos publicados ocupan 6.1 GB, incluyendo componentes de terceros como el tokenizador FlowTiTok y el decodificador Semantic-VAE, lo que indica un enfoque modular.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow matching variacional bidireccional (BVFM) con ramas separadas para imagen/texto y habla/texto |
| Parametros totales | No disponible (el repositorio no publica el conteo) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible (se requiere revisar `THIRD_PARTY_NOTICES.md` para componentes de terceros) |
| Formato de pesos | PyTorch (archivos `.pt`, `.bin`, `.pth`) |

## Arquitectura y entrenamiento

El modelo se basa en *variational flow matching* (VFM), una técnica que aprende un campo vectorial para transformar una distribución simple en la distribución de datos. La innovación de BVFM es que el mismo campo puede recorrerse en dos direcciones: hacia adelante para generar datos (p. ej., TTS, texto a imagen) y hacia atrás para inferir la representación latente (p. ej., ASR, imagen a texto). Esto permite compartir el aprendizaje entre tareas.

En el repositorio se distinguen dos ramas independientes: la rama de imagen/texto (`image/bvfm_image_step40000.pt`) y la de habla/texto (`speech/bvfm_speech_step299999_inference.pt`). La rama de habla incluye un decodificador Semantic-VAE (`semantic_vae_1000k`) que convierte una representación latente de 64 dimensiones en forma de onda. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO. La información disponible no permite conocer el tamaño del contexto, el número de parámetros ni la configuración del modelo base.

## Capacidades

- Generación de texto a imagen y de imagen a texto (según los tags y la rama `image/`).
- Síntesis de voz (TTS) mediante *flow matching* sobre representaciones latentes continuas.
- Reconocimiento automático del habla (ASR) con la misma arquitectura bidireccional.
- El modelo usa representaciones continuas (latente de 64 dimensiones) para el habla, lo que puede facilitar una síntesis de alta calidad.
- No se mencionan capacidades de *tool calling*, razonamiento multi-step, agentes ni soporte de visión más allá de la rama de imagen.

## Casos de uso

- Síntesis de voz para asistentes virtuales: el modelo puede generar voz a partir de texto usando la rama TTS, lo que permitiría integrarse en sistemas de diálogo. Sin embargo, no hay datos de calidad de audio ni latencia.
- Transcripción de audio a texto (ASR): la misma arquitectura puede procesar audio y producir transcripciones, útil para subtitulado automático o notas de voz.
- Traducción de imagen a descripción textual: la rama de imagen podría utilizarse para generar etiquetas o descripciones a partir de fotografías, aunque no se especifican capacidades de visión.
- Generación de imágenes desde texto: potencialmente utilizable para prototipos de diseño o ilustración automática, pero sin benchmarks que validen la calidad.
- Investigación en modelos unificados: el código y los pesos permiten a investigadores estudiar cómo el *flow matching* bidireccional puede compartir representaciones entre modalidades.
- Desarrollo de sistemas de voz personalizados: el decodificador Semantic-VAE puede adaptarse para voces específicas, pero no hay instrucciones de fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K, WER, MOS ni ninguna otra evaluación comparativa. Tampoco se mencionan comparaciones con modelos ASR/TTS existentes.

## Requisitos de hardware

- No se dispone de especificaciones oficiales de VRAM ni de latencia.
- El tamaño del repositorio (6.1 GB) sugiere que los pesos requieren una GPU con al menos 8-12 GB de VRAM para cargar el modelo en memoria, pero es una estimación no confirmada.
- Se necesitará una GPU NVIDIA con soporte CUDA para ejecutar PyTorch, posiblemente una RTX 3060 o superior para pruebas de inferencia.
- No se mencionan opciones de despliegue como vLLM, llama.cpp, Ollama o TGI. El código de inferencia reside en el repositorio de GitHub, por lo que el despliegue sería manual con PyTorch.

## Comparativa con modelos similares

No se ha encontrado información sobre modelos comparables en la documentación. Aunque existen sistemas unificados de ASR/TTS como UniVoice, no se dispone de datos de rendimiento de BVFM para establecer una comparación objetiva. Por tanto, no se puede realizar una comparativa rigurosa.

## Limitaciones y advertencias

- No se ha publicado una licencia explícita para el modelo; se debe revisar `THIRD_PARTY_NOTICES.md` para los componentes de terceros (FlowTiTok, Semantic-VAE) antes de cualquier uso comercial.
- El repositorio no incluye métricas de rendimiento ni resultados de evaluación, por lo que se desconocen la calidad de la síntesis de voz, la tasa de error de ASR y la fidelidad de la generación de imágenes.
- No hay documentación sobre los idiomas soportados, lo que limita su uso para aplicaciones multilingües.
- Al ser un modelo de investigación sin entrenamiento validado, existe un riesgo alto de alucinación o de salidas no deseadas, especialmente en tareas de generación de imagen.
- La arquitectura bidireccional puede tener dificultades para manejar contextos largos, aunque no se especifica la longitud máxima.
- No se proporcionan instrucciones de instalación ni de uso más allá de la indicación de la variable `BVFM_WEIGHTS_ROOT`, lo que dificulta la reproducción.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/NYCU-MLLab/Bidirectional_ASR-TTS_Flow_Matching
- Repositorio de GitHub (código fuente): https://github.com/NYCU-MLLab/Bidirectional-ASR-TTS-Flow-Matching
- README del repositorio de Hugging Face: https://huggingface.co/NYCU-MLLab/Bidirectional_ASR-TTS_Flow_Matching/blob/main/README.md
- (No se han encontrado papers o demos oficiales en la búsqueda web.)
