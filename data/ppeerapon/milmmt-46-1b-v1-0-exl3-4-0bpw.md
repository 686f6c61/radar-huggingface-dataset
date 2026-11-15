# Ppeerapon/MiLMMT-46-1B-v1.0-EXL3-4.0bpw

## Resumen

MiLMMT-46-1B-v1.0-EXL3-4.0bpw es una cuantización de 4 bits en formato EXL3 del modelo de traducción automática MiLMMT-46-1B-v1.0, desarrollado originalmente por Xiaomi Research. El modelo base parte de Gemma3-1B y se ha especializado en traducción multilingüe entre 46 idiomas mediante un pipeline de cuatro etapas: preentrenamiento continuado sobre 143 mil millones de tokens de datos monolingües y paralelos, ajuste supervisado, aprendizaje por refuerzo y fusión de modelos. Esta versión concreta ha sido publicada por el usuario Ppeerapon y aplica una cuantización EXL3 a 4,0 bits por peso para reducir el espacio en disco y los requisitos de memoria.

La relevancia de esta ficha radica en que ofrece un modelo de traducción multilingüe de tamaño compacto (590.889.472 parámetros reales en safetensors, frente a la denominación comercial "1B" del modelo base) que puede desplegarse en hardware modesto gracias a la cuantización. El repositorio ocupa 1,2 GB, lo que lo hace viable en GPUs de consumo y en entornos con recursos limitados.

No obstante, conviene señalar que el modelo no cuenta con descargas ni interacciones en el momento de la consulta, y que la model card del autor de la cuantización no aporta información adicional sobre el proceso de cuantización, los idiomas efectivamente soportados tras la misma ni métricas de degradación. La información técnica disponible proviene fundamentalmente del modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (gemma3_text), basada en Gemma3-1B |
| Parametros totales | 590.889.472 (según safetensors); el modelo base se denomina "1B" |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 4,0 bits por peso (esta versión); el modelo base se distribuye en safetensors sin cuantizar |
| Idiomas soportados | 46 idiomas según el modelo base: árabe, azerí, búlgaro, bengalí, catalán, checo, danés, alemán, griego, inglés, español, persa, finlandés, francés, hebreo, hindi, croata, húngaro, indonesio, italiano, japonés, kazajo, jemer, coreano, lao, malayo, birmano, noruego, neerlandés, polaco, portugués, rumano, ruso, eslovaco, esloveno, sueco, tamil, tailandés, tagalo, turco, urdu, uzbeko, vietnamita, cantonés, chino simplificado y chino tradicional |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (cuantización EXL3), compatible con transformers y text-generation-inference |

## Arquitectura y entrenamiento

El modelo base MiLMMT-46-1B-v1.0 emplea la arquitectura `gemma3_text`, es decir, un transformer decoder-only derivado de Gemma3-1B. Su entrenamiento se estructura en cuatro fases según la model card: (1) preentrenamiento continuado sobre 143 mil millones de tokens de datos monolingües y paralelos en 46 idiomas, que produce MiLMMT-46-1B-Pretrain; (2) ajuste supervisado, que da lugar a MiLMMT-46-1B-v0.1; (3) aprendizaje por refuerzo; y (4) fusión de modelos, que genera la versión v1.0. El artículo asociado se titula "Reference-Free Post-Training of Open Large Language Models for Multilingual Machine Translation" (arXiv:2608.10812), lo que sugiere que la fase de post-entrenamiento prescinde de referencias humanas para la optimización.

La versión aquí descrita aplica una cuantización EXL3 a 4,0 bits por peso sobre el modelo v1.0. No se dispone de información sobre la metodología exacta de cuantización, el calibrado empleado ni las posibles pérdidas de calidad asociadas. El prompt de traducción recomendado por el autor del modelo base sigue el formato `Translate this from <idioma origen> to <idioma destino>:\n<idioma origen>: <frase>\n<idioma destino>:`, y se recomienda usar decodificación determinista (top_k=1, temperature=0) con un máximo de 2048 tokens.

## Capacidades

- Traducción automática multilingüe entre 46 idiomas, incluyendo combinaciones directas entre lenguas no inglesas.
- Generación de texto condicionada por prompt de traducción con formato específico.
- Soporte de decodificación determinista para traducción reproducible.
- Compatibilidad con transformers, vLLM y text-generation-inference (según los tags del repositorio).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües limitadas a los 46 idiomas listados; no se garantiza rendimiento en otros idiomas.
- No se documentan capacidades de código o matemáticas como objetivo de entrenamiento.

## Casos de uso

- Traducción de documentación técnica multilingüe: el modelo puede traducir manuales y guías entre los 46 idiomas soportados usando el prompt de traducción recomendado, con decodificación determinista para consistencia terminológica.
- Localización de interfaces de usuario: integración en pipelines de localización para traducir cadenas de texto de aplicaciones entre idiomas europeos y asiáticos, aprovechando el tamaño compacto del modelo cuantizado para despliegue en servidores modestos.
- Atención al cliente multilingüe: traducción en tiempo real de mensajes de soporte entre el idioma del cliente y el del agente, con latencia reducida gracias a los 590 millones de parámetros efectivos.
- Traducción de contenido editorial y periodístico: procesamiento por lotes de artículos entre pares de idiomas como inglés-español, chino-inglés o árabe-francés, con la ventaja de que el modelo cubre combinaciones directas sin pivote por inglés.
- Subtitulado y transcripción multilingüe: traducción de transcripciones de audio a texto en múltiples idiomas para plataformas de vídeo, usando el modelo como componente de un pipeline ASR + traducción.
- Investigación en traducción automática: evaluación de modelos compactos cuantizados frente a versiones sin cuantizar, y estudio del impacto de EXL3 a 4 bits en la calidad de traducción para las 46 lenguas.
- Despliegue en entornos con recursos limitados: uso en dispositivos con GPU de consumo o en contenedores con poca memoria gracias al tamaño del repositorio (1,2 GB) y a la cuantización de 4 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del modelo base incluye una imagen de resultados experimentales (`main.png`) que no se ha podido consultar en detalle, y la model card de la cuantización no aporta métricas propias ni comparativas de degradación por cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1,2 GB en disco con cuantización EXL3 a 4,0 bits, por lo que la VRAM necesaria para los pesos ronda los 1,2-1,5 GB; el espacio adicional para caché KV y activaciones dependerá de la longitud de contexto, que no está documentada.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM debería poder cargar los pesos; se recomiendan GPUs de consumo como RTX 3060, RTX 4060 o superiores para margen suficiente.
- Cabe en GPU de consumo: sí, previsiblemente en modelos con 4 GB o más de VRAM, aunque no se ha verificado experimentalmente en la información disponible.
- Opciones de despliegue: transformers (según la model card del modelo base), vLLM y text-generation-inference (según los tags del repositorio). No se documenta soporte de llama.cpp u Ollama para el formato EXL3.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MiLMMT-46-1B-v1.0-EXL3-4.0bpw (esta ficha) | 590.889.472 | no disponible | 46 | gemma | safetensors EXL3 4 bits |
| xiaomi-research/MiLMMT-46-1B-v1.0 (modelo base sin cuantizar) | ~1B (denominación comercial) | no disponible | 46 | gemma | safetensors |
| xiaomi-research/MiLMMT-46-1B-v0.1 (etapa previa) | ~1B | no disponible | 46 | gemma | safetensors |

No se dispone de información sobre benchmarks comparativos con otros modelos de traducción de tamaño similar (por ejemplo, NLLB-200 o M2M-100) en la documentación proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El modelo solo soporta los 46 idiomas listados; el rendimiento en otros idiomas no está garantizado según la model card.
- No se documenta el impacto de la cuantización EXL3 a 4,0 bits en la calidad de traducción; es probable una degradación respecto al modelo base sin cuantizar, pero no se aportan métricas.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación ni comportamiento en dominios especializados.
- La licencia "gemma" implica las Gemma Terms of Use, que incluyen restricciones de uso comercial y obligaciones de atribución; es necesario revisarlas antes de un despliegue en producción.
- El modelo está especializado en traducción y no debe esperarse un rendimiento generalista en otras tareas de generación de texto.
- La longitud de contexto no está documentada, lo que dificulta planificar el procesamiento de documentos largos.
- El repositorio no cuenta con descargas ni validación comunitaria en el momento de la consulta, lo que reduce la confianza en su reproducibilidad.
- La cuantización ha sido realizada por un tercero (Ppeerapon) y no por el equipo original de Xiaomi Research, por lo que no está avalada por los autores del modelo base.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/Ppeerapon/MiLMMT-46-1B-v1.0-EXL3-4.0bpw
- Modelo base en Hugging Face: https://huggingface.co/xiaomi-research/MiLMMT-46-1B-v0.1
- Repositorio GitHub: https://github.com/xiaomi-research/gemmax
- Artículo arXiv: https://arxiv.org/abs/2608.10812
