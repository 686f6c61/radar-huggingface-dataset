# mdcccxv/ruyi-qwen3-1.7b

## Resumen

`ruyi-qwen3-1.7b` es una exportación del modelo Qwen3 1.7B, desarrollado originalmente por el equipo Qwen de Alibaba, a formato ExecuTorch (`.pte`) para su ejecución en dispositivos móviles. La publicación corre a cargo del usuario mdcccxv y reutiliza la receta de exportación y la cuantización de Software Mansion para su librería react-native-executorch v0.11.0. El cambio principal respecto al fichero oficial de la librería es la reducción de la ventana de contexto de 8.192 a 2.048 tokens, lo que disminuye la memoria reservada para el contexto durante la inferencia.

El modelo base es un transformer denso de 1.700 millones de parámetros con capacidades de generación de texto, razonamiento y código, publicado bajo licencia Apache 2.0. Esta exportación concreta aplica cuantización 8da4w (activaciones de 8 bits, pesos de 4 bits) sobre el backend XNNPACK, lo que da como resultado un fichero de 1,3 GB apto para ejecutarse en teléfonos Android sin conexión a red.

La relevancia de esta ficha es acotada: no se trata de un modelo nuevo ni de un ajuste fino, sino de un artefacto de despliegue con una configuración de contexto reducida. Resulta útil para desarrolladores que integren react-native-executorch en aplicaciones móviles con restricciones de memoria y cuyas conversaciones no superen los 2.048 tokens entre prompt y respuesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3 1.7B) |
| Parametros totales | 1.700 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (prompt + respuesta combinados) |
| Tipos de cuantizacion | 8da4w (activaciones de 8 bits, pesos de 4 bits) sobre XNNPACK |
| Idiomas soportados | en (segun metadatos del repo; el modelo base Qwen3 es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | ExecuTorch `.pte` (fichero `ruyi-qwen3-1.7b-8da4w-ctx2048.pte`, 1.303.739.264 bytes) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3 1.7B, un transformer denso de la familia Qwen3. Esta publicación no aporta información sobre el entrenamiento del modelo base: no se detallan el número de tokens, la composición del corpus ni si hubo fases de RLHF o DPO. Tampoco se describen innovaciones técnicas del modelo original más allá de lo que corresponde a la familia Qwen3.

Lo que sí documenta la model card es el proceso de exportación. Se utilizó la receta de Software Mansion (`exporter_models/qwen3`) en el commit `89a24bd038577f7438fb004624c87ca9790edf5c`, con ExecuTorch 1.4.1, PyTorch 2.13.0 (CPU) y torchao 0.18.0 sobre Linux x86_64. La versión de ExecuTorch coincide con el runtime de react-native-executorch 0.11.0. Respecto a la receta original se introducen tres cambios: límite de contexto y longitud de secuencia fijados en 2.048, dos tokens de parada (`<|im_end|>`, id 151645, y `<|endoftext|>`, id 151643) y un método `get_model_schema` que la librería necesita para aceptar longitudes de entrada variables y que la receta no incluye por defecto.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen3 1.7B.
- Razonamiento y resolución de problemas de complejidad media, limitado por el tamaño del modelo.
- Generación de código y respuestas a preguntas técnicas, con las mismas reservas.
- Inferencia totalmente local en dispositivo, sin llamadas a red.
- Integración con react-native-executorch 0.11.0 mediante la configuración `QWEN3_1_7B` de la librería, sustituyendo únicamente la ruta del fichero de modelo.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en esta exportación.

## Casos de uso

- Asistentes conversacionales embebidos en aplicaciones Android: el modelo se ejecuta en el propio teléfono mediante ExecuTorch y XNNPACK, sin backend remoto, lo que elimina costes de servidor y mantiene la conversación en el dispositivo. La ventana de 2.048 tokens encaja en interacciones de pocos turnos.
- Autocompletado y sugerencias de texto en apps de notas o mensajería: la latencia de inferencia local y la ausencia de red permiten generar sugerencias mientras el usuario escribe, siempre que el contexto acumulado no supere el límite.
- Respuestas a preguntas frecuentes sobre documentación de producto: se puede precargar un fragmento de documentación en el prompt y generar respuestas acotadas, verificando que prompt y respuesta quepan en 2.048 tokens.
- Clasificación y reescritura de texto en formularios móviles: tareas de una sola pasada (resumir una reseña, reformular una descripción) que no requieren contexto largo y se benefician de la reducción de memoria.
- Prototipado de funciones de IA generativa en React Native: al reutilizar la configuración de la librería y solo cambiar el fichero, sirve para validar flujos de UI antes de decidir si se necesita el modelo con contexto completo de 8.192 tokens.
- Demos y entornos con memoria restringida: en dispositivos de gama media donde la reserva de contexto de la versión oficial de 8.192 tokens resulta excesiva, esta variante reduce el espacio de memoria asignado al contexto a costa de recortar la ventana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El artefacto está pensado para ejecutarse en teléfonos mediante ExecuTorch con backend XNNPACK; no se proporcionan cifras de VRAM.
- El fichero `.pte` ocupa 1.303.739.264 bytes (aproximadamente 1,3 GB), lo que da una idea del espacio de almacenamiento necesario.
- Solo se ha probado en Android con react-native-executorch 0.11.0, según la model card.
- No se documentan requisitos de GPU de escritorio, opciones de despliegue con vLLM, llama.cpp, Ollama o TGI, ni cifras de latencia o throughput.
- Para ejecutar el modelo base sin cuantizar en servidor, los requisitos serían los del Qwen3 1.7B original, pero esta ficha no dispone de esos datos en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ruyi-qwen3-1.7b (esta ficha) | 1,7 B | 2.048 | ExecuTorch `.pte`, 8da4w | Apache 2.0 | Exportación para móvil, solo probada en Android |
| Qwen3 1.7B para react-native-executorch (oficial de la librería) | 1,7 B | 8.192 | ExecuTorch `.pte`, 8da4w | Apache 2.0 | Misma receta y cuantización; mayor consumo de memoria por contexto |
| Qwen/Qwen3-1.7B (modelo base) | 1,7 B | no disponible en esta ficha | safetensors | Apache 2.0 | Pesos originales sin exportar; requiere runtime de servidor o de escritorio |

## Limitaciones y advertencias

- Modelo pequeño de 1,7 B: puede producir respuestas incorrectas, como reconoce la propia model card.
- Ventana de contexto de 2.048 tokens que incluye prompt y respuesta; las conversaciones o documentos más largos no caben y deben usar el fichero de la librería con 8.192 tokens.
- Solo probado en Android con react-native-executorch 0.11.0; no hay validación documentada en iOS ni con otras versiones de la librería.
- Los metadatos del repo declaran únicamente inglés, aunque el modelo base Qwen3 es multilingüe; no se garantiza el comportamiento en castellano con esta exportación.
- No se documentan evaluaciones de sesgo ni de tasa de alucinación para esta exportación concreta.
- Es una compilación independiente, no una release oficial de Qwen ni de Software Mansion.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base Qwen3 1.7B antes de distribuirlo en producción.
- Se recomienda enlazar a un commit concreto del fichero (no a `main`) y verificar el SHA-256 `f02ea4022b644285339910955a88fd824f288aa5a4941cf32d1b20118b26546b` tras la descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mdcccxv/ruyi-qwen3-1.7b
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Librería react-native-executorch: https://github.com/software-mansion/react-native-executorch
- Recetas de exportación de Software Mansion: https://github.com/software-mansion-labs/executorch-export-recipes
- Software Mansion: https://swmansion.com/
