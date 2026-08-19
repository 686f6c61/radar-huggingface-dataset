# Shiftedx/qwen3.8-27b-aeon-ultimate-uncensored-mxfp8-vision-mtplx

## Resumen

El modelo `Shiftedx/qwen3.8-27b-aeon-ultimate-uncensored-mxfp8-vision-mtplx` es una conversión independiente a formato MLX con cuantización MXFP8 del checkpoint `AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16`, un modelo de la familia Qwen3.5/3.8 desarrollado por AEON-7. La conversión ha sido realizada por el usuario Shiftedx y publicada como una versión comunitaria, no oficial. El modelo combina capacidades de imagen-texto a texto (visión) con decodificación especulativa multi-token (MTP), lo que lo hace relevante para experimentación en entornos Apple Silicon con MLX.

Según los datos de safetensors, el modelo tiene 8.027.131.120 parámetros (aproximadamente 8 mil millones), aunque el nombre sugiere 27 mil millones; esta discrepancia no está aclarada en la documentación. La arquitectura es densa, con 64 capas de lenguaje y atención híbrida/GDN, y el contexto configurado es de 262.144 tokens. La cuantización MXFP8 (8 bits, grupo de 32) reduce el tamaño del artefacto a 27,50 GiB, manteniendo los tensores de visión en BF16. Es un modelo experimental, abliterated (sin alineación de seguridad) y con licencia Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa, familia Qwen3.5, atención híbrida/GDN, 64 capas de lenguaje |
| Parametros totales | 8.027.131.120 (según safetensors; el nombre indica 27B, discrepancia no aclarada) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (configurado, no exhaustivamente calificado) |
| Tipos de cuantizacion | MXFP8 (8 bits, grupo de 32) para lenguaje; visión en BF16 (333 tensores) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura es densa, perteneciente a la familia Qwen3.5, con atención híbrida y GDN (no se especifica el significado de GDN en la documentación). El modelo cuenta con 64 capas de lenguaje y una configuración de contexto de 262.144 tokens. No se proporcionan datos sobre el entrenamiento original (número de tokens, composición del dataset, uso de RLHF o DPO). El checkpoint base `AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16` es descrito como abliterated, es decir, se ha aplicado una técnica para eliminar la alineación de seguridad. La conversión a MXFP8 se realizó con el adaptador de streaming Qwen3.5 de MLX-LM 0.31.3, y se añadieron 15 tensores MTP nativos en BF16 para habilitar la decodificación especulativa multi-token. No hay información adicional sobre el proceso de entrenamiento o ajuste.

## Capacidades

- Generación de texto e imagen-texto a texto (pipeline `image-text-to-text`), permitiendo describir o razonar sobre imágenes.
- Decodificación especulativa multi-token (MTP) con profundidad configurable (D1, D2, D3), que mejora la velocidad de decodificación (multiplicador 1,540x frente a decodificación autorregresiva en pruebas locales).
- Conversacional: incluye plantilla de chat y tokenizer preservados del modelo base.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Capacidades especiales: visión (procesamiento de imágenes) y MTP; no se mencionan otras como audio o thinking mode.

## Casos de uso

- Investigación en alineación y seguridad: al ser un modelo abliterated, es útil para estudiar el comportamiento de modelos sin alineación y evaluar técnicas de mitigación en entornos controlados.
- Experimentación con decodificación especulativa en MLX: permite probar la configuración MTP (profundidad D1-D3) y medir el rendimiento en hardware Apple Silicon, como se indica en la model card con el comando `mtplx tune`.
- Prototipado de aplicaciones de visión-lenguaje en Apple Silicon: gracias a su soporte de imagen-texto, puede usarse para generar descripciones de imágenes en entornos de desarrollo con MLX.
- Evaluación de cuantización MXFP8: sirve para comparar la calidad y velocidad de la cuantización de 8 bits frente al checkpoint BF16 original en tareas de generación de texto y visión.
- Análisis de contenido visual en investigación: puede procesar imágenes para extraer descripciones o responder preguntas, siempre con moderación humana debido a su falta de alineación.
- Pruebas de rendimiento de contexto largo: con 262.144 tokens de contexto, es adecuado para experimentar con documentos extensos o conversaciones multi-turno, aunque la calificación del contexto no es exhaustiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta un dato de rendimiento local: con MTP a profundidad D3, se obtuvo una velocidad de decodificación de 24,36 tokens por segundo y un multiplicador de 1,540x frente a la decodificación autorregresiva, en un entorno no especificado. Este dato es orientativo y depende del host, el prompt y la versión de MTPLX.

## Requisitos de hardware

- Al ser una conversión MLX, está optimizada para Apple Silicon (M1, M2, M3 y posteriores) con memoria unificada.
- El tamaño del artefacto indexado es de 27,50 GiB, por lo que se recomienda al menos 32 GB de memoria unificada para cargar el modelo completo en memoria (por ejemplo, M1 Max, M2 Max, M3 Max o superior).
- En chips con menos memoria (16 GB), podría ser necesario usar técnicas de offloading o reducir el contexto, aunque no se garantiza un funcionamiento fluido.
- Opciones de despliegue: MLX (librería `mlx` y `mlx_vlm`), con comandos como `python -m mlx_vlm.generate`. No se mencionan vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: solo se dispone del dato de 24,36 tok/s con MTP D3 en un entorno local no especificado; el rendimiento real variará según el hardware y la carga.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares. El modelo base `AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16` sería el punto de referencia natural, pero no se proporcionan datos de rendimiento ni benchmarks para comparar. Tampoco se conocen alternativas de la misma categoría (modelos de visión-lenguaje cuantizados en MXFP8 para MLX) en la documentación disponible.

## Limitaciones y advertencias

- El modelo es abliterated, es decir, ha sido modificado para eliminar la alineación de seguridad. Puede generar contenido inseguro, ofensivo o ilegal, y la cuantización no restaura dicha alineación.
- Es una versión experimental y comunitaria, no un lanzamiento oficial de AEON-7 ni de Qwen. No se garantiza su estabilidad ni su idoneidad para producción.
- La longitud de contexto de 262.144 tokens está configurada pero no ha sido exhaustivamente calificada; puede haber degradación en contextos muy largos.
- Existe una discrepancia entre el nombre del modelo (27B) y el número de parámetros reportado en safetensors (8.027.131.120). Esta inconsistencia no está documentada y puede afectar a las expectativas de rendimiento.
- No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), por lo que no es posible evaluar su rendimiento relativo frente a otros modelos.
- La licencia Apache-2.0 permite uso comercial, pero el carácter no alineado del modelo implica que el operador asume toda la responsabilidad legal y de seguridad. Se recomienda añadir controles de acceso, registro, moderación y revisión humana en cualquier despliegue.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Shiftedx/qwen3.8-27b-aeon-ultimate-uncensored-mxfp8-vision-mtplx
- Modelo base: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16
