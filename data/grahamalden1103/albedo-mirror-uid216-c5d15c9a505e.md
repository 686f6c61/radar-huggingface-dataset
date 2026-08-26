# grahamalden1103/albedo-mirror-uid216-c5d15c9a505e

## Resumen

El modelo `grahamalden1103/albedo-mirror-uid216-c5d15c9a505e` es un modelo multimodal (image-text-to-text) basado en el modelo base `dendriteholdings/albedo-qwen3.6-35b-king-genesis`, que a su vez deriva de la arquitectura Qwen3.5 MoE. Desarrollado por el usuario `grahamalden1103`, se presenta como un "challenger" local del proyecto Albedo SN97, un sistema de validación de transacciones o agentes en cadena (aunque la información es escasa y críptica). El modelo ha sido afinado mediante una secuencia de pasos: SFT (v8-v11, v13/v15) y un último paso de DPO (v16) sobre prefijos de fallos en vivo, según la model card.

Con 34.660.610.688 parámetros (34,66 B) y un peso en safetensors de 69,3 GB, el modelo está diseñado para tareas conversacionales y multimodales (procesa imágenes y texto). Su licencia Apache 2.0 permite uso comercial, aunque la documentación es muy limitada y no se especifican detalles de contexto, idiomas ni cuantizaciones. La relevancia actual radica en su naturaleza MoE multimodal y su uso en entornos de agentes, aunque su disponibilidad y rendimiento real no están documentados públicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (qwen3_5_moe) |
| Parametros totales | 34.660.610.688 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de mezcla de expertos (MoE) basada en la familia Qwen3.5, según el tag `qwen3_5_moe`. No se detallan los parámetros activos ni el número de expertos. El entrenamiento se describe en la model card como una linea de desarrollo: desde el modelo base `albedo-qwen3.6-35b-king-genesis`, se aplicaron SFT en versiones v8-v11 y v13/v15, seguido de un ajuste DPO (v16) sobre prefijos de fallos en vivo (por ejemplo, "empty double-submit", "sed && echo", "grep-is-not-work"). No se proporcionan datos sobre el dataset de entrenamiento, el numero de tokens ni el proceso de RLHF o DPO detallado. La model card menciona que la version v16 es la actual y que la v17 (no publicada) presentaba una regresion DPO por recat-overweight.

## Capacidades

- Generacion de texto y conversacion multimodal: el pipeline `image-text-to-text` indica que puede procesar imagenes y texto para generar respuestas, aunque no se especifican tareas concretas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: la model card menciona un contexto de "policy one-turn eval" y una evaluacion de 22/30, lo que sugiere un uso en entornos de agentes, pero no hay detalles.
- Capacidades multilingues: no disponible.
- Capacidades especiales: no se detallan, pero el tag `albedo` y `sn97` sugieren una orientacion a tareas de validacion o agentes en cadena.

## Casos de uso

- **Validacion de agentes locales**: el modelo se presenta como un "challenger" para el sistema Albedo SN97, por lo que puede usarse para evaluar o ejecutar agentes en entornos de prueba locales, especialmente en tareas de validacion de transacciones o ejecuciones de comandos.
- **Generacion de texto multimodal**: al ser image-text-to-text, puede utilizarse para describir imagenes o responder preguntas sobre ellas, aunque no se especifica la calidad ni las limitaciones.
- **Conversacion con contexto largo**: aunque no se conoce la longitud de contexto, al ser un modelo MoE de 34 B, podria ser adecuado para dialogos extensos, pero se requiere verificacion.
- **Prototipado de aplicaciones de agentes**: su entrenamiento en DPO sobre prefijos de fallos sugiere utilidad en entornos de depuracion o correccion de agentes, aunque no hay evidencia publica.
- **Investigacion en ajuste fino**: el modelo puede servir como base para experimentos de SFT y DPO en arquitecturas MoE, gracias a su licencia abierta.
- **Uso en entornos de baja latencia**: al ser un MoE, puede ofrecer inferencia mas rapida que un modelo denso de tamano similar, aunque no se disponen de mediciones concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una evaluacion interna "Policy one-turn eval 22/30" (22 aciertos de 30 en una prueba de una sola vuelta), pero no es un benchmark estandarizado ni comparable con otros modelos. No se han encontrado datos de MMLU, HumanEval, GSM8K u otros.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 34,66 B de parametros, en FP16 se necesitan aproximadamente 69,7 GB de VRAM. Con cuantizacion de 8 bits, unos 35 GB; en 4 bits, unos 17 GB. Estas son estimaciones teoricas basadas en el tamaño, no en datos oficiales.
- **GPU recomendadas**: para FP16, una GPU con 80 GB (A100 80GB, H100) o dos GPU de 48 GB (A6000, RTX A6000). Para cuantizacion de 8 bits, una RTX 4090 (24 GB) puede ser suficiente con optimizacion de memoria. En 4 bits, una RTX 3090/4090 (24 GB) podria funcionar.
- **Capacidad en consumer GPU**: con cuantizacion de 4 bits podria caber en una GPU de 24 GB, pero no se han publicado pruebas.
- **Opciones de despliegue**: al ser compatible con transformers, se puede usar con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama, pero no se confirma compatibilidad con estas herramientas.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este modelo con alternativas de la misma categoria. La arquitectura MoE de 34 B se asemeja a otros modelos como Mixtral 8x7B (46,7 B totales, 12,9 B activos) o Qwen3-32B (denso), pero no hay datos de rendimiento ni de contexto para establecer una comparativa. Por tanto, se indica "no disponible".

## Limitaciones y advertencias

- **Sesgos conocidos**: no se ha documentado ningun sesgo especifico, pero al ser un modelo basado en Qwen3, es probable que herede sesgos de sus datos de entrenamiento.
- **Riesgo de alucinacion**: no se ha evaluado, pero como todo modelo generativo, puede producir respuestas incorrectas o inventadas.
- **Limitaciones de contexto o idioma**: no se especifican, pero al ser un modelo multimodal, es probable que su rendimiento en tareas de texto dependa del idioma de entrenamiento.
- **Restricciones de licencia**: licencia Apache 2.0 permite uso comercial y modificacion, pero no hay garantias de soporte ni de calidad.
- **Caveats para produccion**: la model card advierte explícitamente que "no es una submission en cadena" y que la version v16 no es la mejor para "duel quality" (recomienda v11). Tambien indica que v17 no debe usarse por regresion. Por tanto, el modelo no es recomendable para produccion sin una evaluacion exhaustiva adicional.
- **Informacion incompleta**: la model card es muy escueta y no proporciona detalles de entrenamiento, datos de evaluacion ni configuracion de contexto.

## Enlaces

- HuggingFace: [https://huggingface.co/grahamalden1103/albedo-mirror-uid216-c5d15c9a505e](https://huggingface.co/grahamalden1103/albedo-mirror-uid216-c5d15c9a505e)
- Modelo base: [dendriteholdings/albedo-qwen3.6-35b-king-genesis](https://huggingface.co/dendriteholdings/albedo-qwen3.6-35b-king-genesis) (enlace inferido, no verificado)
- No se encontraron otros enlaces relevantes en la busqueda web.
