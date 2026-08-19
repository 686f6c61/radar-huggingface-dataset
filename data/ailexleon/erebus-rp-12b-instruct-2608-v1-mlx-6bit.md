# ailexleon/Erebus-RP-12B-Instruct-2608-v1-mlx-6Bit

## Resumen

Erebus-RP-12B-Instruct-2608-v1-mlx-6Bit es una conversión al formato MLX (Apple Silicon) del modelo original Indexnusrefather/Erebus-RP-12B-Instruct-2608-v1, un ajuste fino de Gemma3 especializado en roleplay, escritura creativa y narrativa conversacional. El modelo está diseñado para generar respuestas coherentes y con estilo en escenarios de personajes, historias interactivas y diálogos de ficción, aprovechando la arquitectura transformer de Gemma3.

La relevancia de esta versión MLX radica en que permite ejecutar el modelo de forma eficiente en hardware Apple (M1/M2/M3/M4) mediante la librería mlx-lm, con una cuantización de 6 bits que reduce el uso de memoria sin sacrificar excesivamente la calidad. Aunque el nombre sugiere 12B de parámetros, la metadata de los safetensors indica 2.574.418.176 parámetros (≈2,57B), una discrepancia que conviene verificar antes de su uso en producción.

El repositorio incluye solo el modelo convertido, sin información adicional sobre el proceso de entrenamiento original. Está pensado para desarrolladores que trabajan con MLX y necesitan un modelo de roleplay ligero y desplegable en entornos Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Gemma3) |
| Parametros totales | 2.574.418.176 (segun metadata; el nombre indica 12B, posible discrepancia) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo base Gemma3) |
| Tipos de cuantizacion | 6-bit (MLX) |
| Idiomas soportados | ingles (segun metadata) |
| Licencia | Gemma |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (fine-tune) del modelo base Gemma3, orientado a tareas de roleplay y escritura creativa. La arquitectura subyacente es un transformer estándar con mecanismos de atención, aunque no se dispone de detalles específicos sobre el número de capas, cabezas de atención o dimensiones ocultas en la información proporcionada. El proceso de entrenamiento original (dataset, método de alineación, número de tokens) no está documentado en esta conversión.

La conversión a MLX se realizó con la versión 0.31.3 de mlx-lm, lo que implica que los pesos están optimizados para el framework MLX de Apple. La cuantización de 6 bits reduce el tamaño del modelo de forma significativa, facilitando su ejecución en dispositivos con memoria unificada limitada.

## Capacidades

- Generacion de texto narrativo y conversacional orientado a roleplay, con capacidad para mantener personajes y tramas coherentes.
- Escritura creativa: cuentos, diálogos, descripciones de escenas y desarrollo de historias interactivas.
- Conversacion multi-turno: puede gestionar diálogos extensos manteniendo el contexto de la conversación (el límite exacto de contexto no está especificado).
- Soporte de plantillas de chat: compatible con el chat template de Gemma3, permitiendo integración con pipelines estándar de HuggingFace.
- No se especifican capacidades de tool calling, agentes o razonamiento multi-paso en la información disponible.

## Casos de uso

- Roleplay interactivo en aplicaciones de chat: el modelo puede interpretar personajes ficticios en conversaciones multi-turno, ideal para juegos de rol textuales o asistentes narrativos.
- Generacion de contenido creativo para escritores: ayuda a redactar diálogos, descripciones y tramas en proyectos de ficción, ofreciendo alternativas estilísticas coherentes con el tono del usuario.
- Prototipado rapido de chatbots con personalidad: su especialización en roleplay permite crear asistentes con caracteres definidos sin necesidad de entrenamiento adicional.
- Creacion de historias ramificadas en videojuegos narrativos: puede generar respuestas adaptativas en función de las elecciones del jugador, manteniendo la coherencia del mundo.
- Generacion de guiones y dialogos para medios audiovisuales: util para esbozar conversaciones entre personajes en fases de preproducción.
- Entornos educativos de escritura: como herramienta de apoyo para practicar técnicas narrativas o explorar estilos de escritura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para este modelo o su versión base.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 9,6 GB, por lo que se recomienda al menos 12 GB de memoria unificada en Apple Silicon para cargar el modelo completo en 6-bit. Con 2,57B parámetros reales, el uso de memoria sería menor (~2 GB), pero la discrepancia obliga a considerar el tamaño del archivo.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3, M4) con al menos 16 GB de RAM unificada para mayor comodidad.
- Compatibilidad: solo funciona con el framework MLX, no es compatible con CUDA ni ROCm.
- Opciones de despliegue: mlx-lm (Python), con posibilidad de integración en aplicaciones macOS/iOS.
- Latencia y throughput: no disponibles, pero al ser un modelo de tamaño medio en 6-bit, la generación debería ser fluida en hardware Apple moderno.

## Comparativa con modelos similares

No se dispone de información de rendimiento para comparar directamente. Como alternativas de roleplay en el ecosistema de modelos abiertos, se pueden considerar:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Erebus-RP-12B (este) | 2,57B (según metadata) | no disponible | Gemma | MLX |
| Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 | varios |
| Mistral-7B-Instruct | 7B | 32K | Apache 2.0 | varios |

Sin datos de benchmarks, la elección dependerá de la compatibilidad con MLX y la especialización en roleplay.

## Limitaciones y advertencias

- Discrepancia en el número de parámetros: la metadata indica 2,57B, pero el nombre del modelo sugiere 12B. Verificar antes de usar en producción.
- Idioma limitado: solo se declara soporte para inglés, lo que restringe su uso en otros idiomas.
- Sesgos potenciales: al ser un modelo de roleplay, puede generar contenido inapropiado o reforzar estereotipos si no se modera la salida.
- Riesgo de alucinación: como todo modelo generativo, puede inventar hechos o detalles no coherentes con la historia.
- Licencia Gemma: impone restricciones de uso comercial; revisar los términos de la licencia de Gemma antes de desplegar en entornos empresariales.
- Sin documentación sobre el proceso de entrenamiento: no se conocen los datos utilizados ni las técnicas de alineación, lo que dificulta evaluar su robustez.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ailexleon/Erebus-RP-12B-Instruct-2608-v1-mlx-6Bit
- Modelo base: https://huggingface.co/Indexnusrefather/Erebus-RP-12B-Instruct-2608-v1
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm (referencia para uso)
