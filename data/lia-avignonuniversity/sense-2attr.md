# LIA-AvignonUniversity/SENSE-2ATTR

## Resumen

SENSE-2ATTR es un codificador de voz unificado desarrollado por el Laboratorio Informatique d'Avignon (LIA) de la Universidad de Aviñón, en Francia. El modelo aprende de forma conjunta dos representaciones a nivel de enunciado a partir de una única señal de audio: una representación semántica de 1024 dimensiones y una representación de hablante de 192 dimensiones. Para ello utiliza un marco teacher-student en el que un codificador de voz auto-supervisado (basado en wav2vec2-bert) se alinea con las representaciones continuas de un modelo de texto (BGE-M3) para la semántica y con un ECAPA-TDNN para la identidad del hablante.

Este modelo es relevante porque permite extraer simultáneamente información semántica y de hablante de la misma señal de audio, algo que tradicionalmente requería modelos separados. Su enfoque multilingüe y su integración con SpeechBrain lo convierten en una herramienta útil para tareas de procesamiento de habla como búsqueda semántica por voz, verificación de hablante o sistemas de diálogo. El modelo se publica como parte de la línea de investigación SENSE del LIA, que busca representaciones compartidas entre habla y texto de forma abierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2-bert (codificador de voz) con cabezas de proyección para semántica y hablante |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende de la ventana de audio de entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | multilingüe (no se especifica lista concreta) |
| Licencia | no disponible (el modelo SENSE original usa cc0-1.0, pero este no lo indica) |
| Formato de pesos | safetensors (repositorio de 2.5 GB, compatible con SpeechBrain) |

## Arquitectura y entrenamiento

El modelo se basa en un codificador wav2vec2-bert preentrenado, sobre el cual se añaden dos cabezas de proyección: una para la representación semántica (1024 dimensiones) y otra para la representación de hablante (192 dimensiones). El entrenamiento sigue un enfoque teacher-student: el codificador de voz actúa como estudiante y se alinea con las salidas de dos modelos profesor: BGE-M3 para la semántica y ECAPA-TDNN para el hablante. Esta alineación se realiza a nivel de enunciado completo, no a nivel de frame, lo que permite obtener representaciones compactas y útiles para tareas de recuperación y comparación.

No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo se distribuye a través de SpeechBrain, lo que facilita su uso mediante la clase `foreign_class`. El paper asociado, "Learning Multiple Utterance-Level Attribute Representations with a Unified Speech Encoder", está disponible en arXiv (2603.08312).

## Capacidades

- Extracción de representaciones semánticas de audio a nivel de enunciado (1024 dimensiones), alineadas con el espacio de embeddings de BGE-M3.
- Extracción de representaciones de hablante (192 dimensiones), comparables a las de ECAPA-TDNN.
- Procesamiento de audio en bruto (formato wav) sin necesidad de transcripción previa.
- Soporte multilingüe gracias al uso de wav2vec2-bert y a la alineación con un modelo de texto multilingüe.
- Integración con SpeechBrain para inferencia en Python, con soporte de GPU.
- Salida dual simultánea: un solo paso de inferencia produce ambos embeddings.

## Casos de uso

- Búsqueda semántica por voz: permite indexar archivos de audio por su contenido semántico y recuperarlos mediante consultas en texto o voz, gracias a la alineación con BGE-M3.
- Verificación de hablante: la representación de hablante de 192 dimensiones puede usarse para tareas de identificación o verificación biométrica en sistemas de autenticación.
- Sistemas de diálogo multimodal: el modelo puede proporcionar tanto la intención semántica como la identidad del interlocutor en un asistente de voz, mejorando la personalización.
- Análisis de conversaciones en centros de llamadas: extraer automáticamente el tema de la llamada (semántica) y el agente que habla (hablante) para métricas de calidad.
- Subtitulación y enriquecimiento de archivos de audio: generar etiquetas semánticas para organizar bibliotecas de podcasts o grabaciones de reuniones.
- Investigación en representaciones de habla: sirve como punto de partida para estudiar la separación de atributos en codificadores de voz o para fine-tuning en tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper asociado (arXiv:2603.08312) podría contener evaluaciones, pero no se han proporcionado datos concretos en la documentación accesible.

## Requisitos de hardware

- El tamaño del repositorio es de 2.5 GB, lo que sugiere que el modelo completo en precisión fp32 ocupa aproximadamente 2.5 GB en memoria.
- Para inferencia en GPU, se recomienda al menos 4 GB de VRAM para el modelo en fp32; con cuantización a fp16 o int8 podría caber en GPUs con 2-3 GB.
- GPUs recomendadas: NVIDIA RTX 3060 (12 GB) o superior, o GPUs de datacenter como A10 o A100 para procesamiento por lotes.
- Es posible ejecutarlo en CPU con SpeechBrain, aunque la latencia será mayor.
- Opciones de despliegue: SpeechBrain (inferencia directa), exportación a ONNX para servidores de inferencia, o integración en pipelines de procesamiento de audio.
- No se dispone de datos de latencia o throughput específicos.

## Comparativa con modelos similares

| Modelo | Enfoque | Dimensiones de salida | Multilingüe | Licencia |
|---|---|---|---|---|
| SENSE-2ATTR | Codificador de voz unificado (semántica + hablante) | 1024 (sem) + 192 (spkr) | Sí | no disponible |
| SENSE (original) | Codificador de voz alineado con texto (semántica) | 1024 | Sí | cc0-1.0 |
| SONAR (Meta AI) | Codificador de habla y texto alineados | 1024 | Sí | CC-BY-NC 4.0 (no comercial) |
| SAMU-XLSR | Alineación de habla y texto | variable | Sí | no disponible |

SENSE-2ATTR se diferencia de SENSE original en que añade la representación de hablante, lo que lo hace más completo para tareas que requieren ambas informaciones. Comparado con SONAR, que también alinea habla y texto, SENSE-2ATTR ofrece además la dimensión de hablante, pero no se dispone de comparaciones cuantitativas de rendimiento.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos o comportamientos en dominios específicos; al ser un modelo de representación, puede heredar sesgos de los datos de entrenamiento de wav2vec2-bert y de los modelos profesor.
- Riesgo de alucinación no aplica directamente (no es un modelo generativo), pero las representaciones semánticas pueden ser inexactas para audio con ruido o habla no nativa.
- La licencia no está especificada en la model card; antes de usar el modelo en producción comercial, se debe contactar con los autores o verificar la licencia del repositorio.
- No se especifica la longitud máxima de audio soportada; wav2vec2-bert suele manejar ventanas de hasta 30 segundos, pero no está confirmado.
- El modelo está pensado para extracción de características, no para generación de audio o texto.
- La documentación es escasa: no hay detalles sobre el dataset de entrenamiento, hiperparámetros o evaluación, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LIA-AvignonUniversity/SENSE-2ATTR
- Paper (arXiv): https://arxiv.org/abs/2603.08312
- Organización LIA en HuggingFace: https://huggingface.co/LIA-AvignonUniversity
- Paper SENSE original (arXiv PDF): https://arxiv.org/pdf/2509.12093v2
- Artículo relacionado en francés (TALN 2026): http://talnarchives.atala.org/TALN/TALN-2026/56.pdf
