# InterpreticAI/Inkling-2-Mini-IQ3_XXS-GGUF

## Resumen

Inkling-2-Mini es un modelo multimodal de tipo mixtura de expertos (MoE) desarrollado por Thinking Machines Lab. Con 26,4 mil millones de parámetros totales y 3,4 mil millones activos (5,4 mil millones efectivos al aplicar tres pasadas por las capas centrales en bucle), acepta entrada de texto e imagen y ofrece una ventana de contexto de hasta 1 millón de tokens. Esta ficha cubre la cuantización IQ3_XXS en formato GGUF publicada por InterpreticAI, pensada para ejecutarse en llama.cpp y LM Studio sobre GPUs y equipos Mac con 16 GB de memoria.

La relevancia de esta versión concreta reside en su tamaño reducido: el archivo del modelo de lenguaje ocupa 11,7 GB y el proyector de visión en F16 añade 0,64 GB, lo que permite desplegar un modelo multimodal de contexto largo en hardware de consumo. La cuantización IQ3_XXS está calibrada con matriz de importancia (imatrix) y es la más pequeña de la familia publicada por InterpreticAI, que también ofrece Q4_K_M y MLX 4-bit.

El modelo base es un modelo de razonamiento ("thinking"): genera su cadena de razonamiento antes de la respuesta final, por lo que requiere un cliente de chat o servidor que aplique correctamente la plantilla de conversación. La licencia es Apache 2.0, igual que la del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas centrales en bucle (looped mixture-of-experts) |
| Parámetros totales | 26.070.385.152 (26,4 B) |
| Parámetros activos | 3,4 B (5,4 B efectivos con tres pasadas por las capas en bucle) |
| Longitud de contexto | Hasta 1.000.000 tokens (32.768 configurados en el ejemplo de uso) |
| Tipos de cuantización | IQ3_XXS (calibrada con imatrix); otras builds de la familia: Q4_K_M, MLX 4-bit |
| Idiomas soportados | No disponible (la model card cita comprobaciones puntuales en inglés y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo de lenguaje IQ3_XXS + proyector de visión F16) |

## Arquitectura y entrenamiento

El modelo base es un MoE multimodal con una innovación estructural: las capas centrales se recorren en bucle tres veces, de modo que el cómputo efectivo por token equivale al de un modelo con 5,4 B de parámetros activos aunque el recuento nominal de activos sea de 3,4 B. Procesa texto e imágenes como entrada mediante un proyector de visión independiente, que en esta build se distribuye como archivo `mmproj` en F16.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada. La cuantización de InterpreticAI es una conversión no modificada del checkpoint oficial (revisión `1fb4134`) y emplea una matriz de importancia para calibrar la precisión de IQ3_XXS. El autor advierte que el soporte de esta arquitectura es reciente en todos los runtimes y que las comprobaciones de calidad realizadas son puntuales (inglés, chino, código y una imagen), no un benchmark completo.

## Capacidades

- Generación de texto y razonamiento explícito: es un modelo de tipo "thinking" que escribe su razonamiento antes de la respuesta final.
- Entrada multimodal de imagen y texto (pipeline `image-text-to-text`), con proyector de visión incluido en la build.
- Procesamiento de contexto muy largo, hasta 1 millón de tokens según la model card.
- Conversación multi-turno mediante plantilla de chat (requiere `--jinja` en llama.cpp o un cliente compatible).
- Generación de código y matemáticas: la model card cita comprobaciones puntuales en código, sin resultados numéricos.
- Capacidades multilingües: solo verificadas de forma puntual en inglés y chino; no hay lista oficial de idiomas.
- Soporte de tool calling y de agentes multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional con imágenes: el modelo acepta capturas, diagramas o fotografías junto con texto, lo que permite construir un asistente que responda preguntas sobre el contenido visual en un único flujo de chat.
- Análisis de documentos extensos: con hasta 1 millón de tokens de contexto, puede ingerir manuales, expedientes o bases de código completas y responder preguntas que requieran cruzar información distribuida a lo largo del documento.
- Razonamiento asistido en local: al ser un modelo "thinking", es adecuado para tareas de análisis paso a paso (depuración lógica, revisión de planes) ejecutadas en una estación de trabajo con 16 GB de memoria, sin depender de la nube.
- Prototipado en equipos de consumo: la build IQ3_XXS está pensada para GPUs y Macs de 16 GB, lo que permite a desarrolladores individuales evaluar un MoE multimodal de 26 B antes de invertir en hardware mayor.
- Procesamiento por lotes de imágenes con texto asociado: clasificación o descripción de lotes de imágenes acompañadas de instrucciones textuales mediante `llama-server`, con un throughput medido de unos 86 tokens/s en una RTX PRO 6000.
- Integración en LM Studio para pruebas de producto: al ser GGUF compatible con LM Studio, sirve para validar flujos de UI conversacional con visión antes de pasar a un despliegue con la build Q4_K_M o el checkpoint original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye una medición de inferencia: aproximadamente 86 tokens/s en generación de un solo flujo y 15,5 GB de memoria de GPU con contexto de 16K, medida en una NVIDIA RTX PRO 6000.

## Requisitos de hardware

- VRAM estimada: 15,5 GB de memoria de GPU con contexto de 16K (medición del autor en RTX PRO 6000); el archivo del modelo pesa 11,7 GB y el proyector 0,64 GB.
- GPU recomendadas: RTX PRO 6000 (medición oficial); cualquier GPU con 16 GB o más de VRAM debería poder alojar el modelo, aunque no se han publicado mediciones en otras tarjetas.
- GPU de consumo: el autor indica que la build está pensada para GPUs y Macs con 16 GB de memoria; encaja en tarjetas de 16 GB y en Mac con memoria unificada de 16 GB.
- Opciones de despliegue: llama.cpp (commit `29b52d3` o posterior) y LM Studio. El ejemplo oficial usa `llama-server` con `-ngl 999 -c 32768 --jinja` y `--mmproj` para entrada de imagen.
- Latencia y throughput: unos 86 tokens/s en un solo flujo en RTX PRO 6000; no hay datos de throughput agregado ni de latencia en otras configuraciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|---|
| Inkling-2-Mini IQ3_XXS (esta ficha) | 26,4 B | 3,4 B (5,4 B efectivos) | 1 M tokens | Texto + imagen | Apache 2.0 | GGUF |
| Inkling-2-Mini Q4_K_M (InterpreticAI) | 26,4 B | 3,4 B (5,4 B efectivos) | 1 M tokens | Texto + imagen | Apache 2.0 | GGUF |
| Inkling-2-Mini MLX 4-bit (InterpreticAI) | 26,4 B | 3,4 B (5,4 B efectivos) | 1 M tokens | Texto + imagen | Apache 2.0 | MLX |

No se dispone de datos de benchmarks ni de especificaciones de modelos de terceros en la información proporcionada para establecer una comparación de rendimiento con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- La cuantización IQ3_XXS sacrifica calidad frente a Q4_K_M; el propio autor recomienda usar Q4_K_M si el hardware lo permite.
- Las comprobaciones de calidad son puntuales (inglés, chino, código y una imagen), no un benchmark exhaustivo; el rendimiento real en otras tareas e idiomas no está verificado.
- El soporte de la arquitectura es nuevo en todos los runtimes: es necesario usar builds recientes de llama.cpp (commit `29b52d3` o posterior) y de LM Studio.
- Es un modelo de razonamiento que escribe su cadena de pensamiento antes de responder; sin una plantilla de chat correcta (por ejemplo, `--jinja`) las respuestas pueden ser incoherentes.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de sesgo ni de robustez.
- Lista de idiomas no disponible; solo hay verificación puntual en inglés y chino, por lo que el rendimiento en castellano no está documentado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo original remite a una política de uso aceptable de Thinking Machines Lab que conviene revisar antes de desplegar en producción.
- El contexto de 1 M tokens no está validado en esta cuantización: el ejemplo oficial configura 32.768 tokens y la medición de memoria se hizo a 16K.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/InterpreticAI/Inkling-2-Mini-IQ3_XXS-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Cuantización GGUF Q4_K_M: https://huggingface.co/InterpreticAI/Inkling-2-Mini-GGUF
- Cuantización MLX 4-bit: https://huggingface.co/InterpreticAI/Inkling-2-Mini-MLX-4bit
- Sitio del cuantizador: https://interpretic.ai
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Política de uso aceptable del modelo original: https://thinkingmachines.ai/model-acceptable-use-policy/
