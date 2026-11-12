# huggingface-mic/chinese-clip-vit-base-patch16-mic

## Resumen

`chinese-clip-vit-base-patch16-mic` es un artefacto de prueba publicado por el usuario `huggingface-mic` en Hugging Face. No es un modelo funcional: se trata de un *fixture* reducido del modelo `OFA-Sys/chinese-clip-vit-base-patch16`, un modelo de recuperación imagen-texto (image-text retrieval) basado en la arquitectura ChineseCLIP. El autor lo etiqueta explícitamente como `test-artifact` con el objetivo de mantenerlo fuera de las búsquedas de modelos candidatos para uso real.

El propósito de este repositorio es servir como fixture de integración: incluye pesos reducidos, uso ejecutable y expectativas de framework en un único repositorio, con archivos de contrato (`integration.json`), procedencia (`build.json`) y documentación de uso en Transformers. Los pesos son aleatorios (semilla 17) y el modelo se ha reducido mediante una regla genérica de *shrinking* que mantiene la misma arquitectura (`ChineseCLIPModel`) pero con solo 2 capas en el codificador de texto y 2 capas en el codificador de visión.

Con 1.585.280 parámetros totales, este artefacto no debe confundirse con el modelo real `OFA-Sys/chinese-clip-vit-base-patch16`, que es el checkpoint de referencia para tareas de recuperación imagen-texto en chino. La relevancia de este repositorio es exclusivamente para pruebas de integración, validación de contratos de framework y desarrollo de infraestructura de evaluación, no para inferencia en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ChineseCLIPModel (transformer dual: codificador de texto + codificador de visión ViT-B/16) |
| Parametros totales | 1.585.280 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible (el modelo base está orientado a chino) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `OFA-Sys/chinese-clip-vit-base-patch16` es un modelo ChineseCLIP con arquitectura dual: un codificador de visión ViT-B/16 y un codificador de texto transformer, entrenados para alinear representaciones imagen-texto mediante un objetivo contrastivo. El fixture aquí presentado replica esa arquitectura (`ChineseCLIPModel`) pero con una configuración reducida: 2 capas ocultas en el codificador de texto y 2 capas ocultas en el codificador de visión, aplicando la regla genérica de *shrinking* implementada en `sweep.py` del repositorio `huggingface/transformers-mic`.

Los pesos son aleatorios (semilla 17), no entrenados. El autor indica que pasaron la puerta de sensibilidad de entrada: cada perturbación de las entradas del contrato movió los logits al menos 0,001 (la más débil, `pixel_values:halve`, con 0,00862), por lo que no fue necesario entrenamiento. Los archivos del procesador (`festival.jpg`, `preprocessor_config.json`, `vocab.txt`) se copiaron byte a byte desde `OFA-Sys/chinese-clip-vit-base-patch16`. Los nombres de tensores coinciden con los del checkpoint real y el modelo se guardó en float32, el dtype por defecto del modelo base. No hay información sobre datos de entrenamiento, RLHF/DPO ni innovaciones técnicas adicionales, ya que no se trata de un modelo entrenado.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen representaciones útiles para recuperación imagen-texto.
- Replica la interfaz de `ChineseCLIPModel` para pruebas de integración con Transformers.
- Incluye archivos de procesador copiados del modelo base (imagen de ejemplo, configuración de preprocesado, vocabulario).
- Sirve para validar contratos de framework: manifiesto de integración, expectativas de Transformers y procedencia del fixture.
- Soporta ejecución en float32, bfloat16 y float16 (forward, loss y gradientes finitos).
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso ni modo thinking.
- No dispone de capacidades multilingües verificadas más allá de la herencia del vocabulario del modelo base.

## Casos de uso

- Pruebas de integración de Transformers: el fixture permite validar que la clase `ChineseCLIPModel` carga, ejecuta forward y calcula pérdidas sin necesidad de descargar el checkpoint completo de 1,6 GB, reduciendo el coste de CI.
- Validación de contratos de framework: los archivos `integration.json` y `integrations/transformers/expectations` permiten comprobar que una versión de Transformers cumple las expectativas de entrada/salida del modelo.
- Desarrollo de infraestructura de evaluación: útil para probar pipelines de evaluación de modelos imagen-texto con un artefacto ligero y determinista (semilla 17).
- Pruebas de sensibilidad de entradas: la puerta de sensibilidad documentada permite verificar que perturbaciones en `pixel_values` e `input_ids` afectan a los logits, útil para tests de robustez de harnesses.
- Reproducibilidad de fixtures: el archivo `build.json` registra fuentes fijadas, resultados de puertas y hashes de archivos, lo que permite reconstruir el fixture con `build_fixtures.py`.
- Validación de dtypes: al ser finito en float32, bfloat16 y float16, sirve para probar rutas de mixed precision en frameworks de inferencia.
- Formación y documentación: ejemplo didáctico de cómo se reduce un checkpoint real manteniendo nombres de tensores y archivos de procesador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que es un artefacto de prueba con pesos aleatorios, por lo que cualquier métrica de recuperación imagen-texto sería meaningless.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (1,59 M parámetros, ~6,3 MB de pesos); en float16, ~3,2 MB.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) es sobradamente suficiente; también cabe en CPU.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: Transformers (carga nativa de `ChineseCLIPModel`); no se ha verificado compatibilidad con vLLM, llama.cpp, Ollama o TGI, y al no ser un modelo generativo de texto, estas herramientas no son aplicables.
- Latencia y throughput: no disponibles; al ser un fixture de 2+2 capas, la latencia sería del orden de milisegundos en GPU y decenas de milisegundos en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/chinese-clip-vit-base-patch16-mic` | 1,59 M | no disponible | Fixture de prueba (pesos aleatorios) | no disponible | Hugging Face |
| `OFA-Sys/chinese-clip-vit-base-patch16` | no disponible en la información | no disponible | ChineseCLIP real (ViT-B/16) | no disponible | Hugging Face |
| `OFA-Sys/chinese-clip-vit-large-patch14` | no disponible en la información | no disponible | ChineseCLIP real (ViT-L/14) | no disponible | Hugging Face |

La comparación relevante es con el modelo base del que deriva: el fixture replica su arquitectura e interfaz pero con 2 capas por codificador y pesos aleatorios, por lo que no es sustituible por el modelo real en ninguna tarea de recuperación. No se dispone de datos de benchmarks ni de licencia para ninguno de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y no producen representaciones semánticas válidas para recuperación imagen-texto.
- Etiquetado como `test-artifact` por el autor para excluirlo de búsquedas de modelos candidatos; no debe desplegarse en producción.
- Sesgos conocidos: no aplica, al no haber entrenamiento; cualquier sesgo sería el heredado del vocabulario y preprocesado del modelo base.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las salidas son esencialmente ruido y no deben interpretarse como similitudes imagen-texto.
- Limitaciones de contexto o idioma: no disponibles; el vocabulario copiado del modelo base está orientado a chino, pero el fixture no ha sido validado para ninguna lengua.
- Restricciones de licencia para uso comercial: la licencia no está disponible en la información proporcionada; debe consultarse el repositorio del modelo base `OFA-Sys/chinese-clip-vit-base-patch16` antes de cualquier uso.
- Caveat para producción: el repositorio tiene un tamaño de 0,0 GB según Hugging Face y los archivos de uso y expectativas deben regenerarse con `build_fixtures.py` si no están presentes.
- El fixture cubre todos los checkpoints cuyos archivos de procesador sean byte-idénticos y cuya configuración coincida tras el *shrinking* (clave de fixture `0f427f71401d`); no cubre variantes con distinto preprocesado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/chinese-clip-vit-base-patch16-mic
- Modelo base: https://huggingface.co/OFA-Sys/chinese-clip-vit-base-patch16
- Manifiesto de contrato (referenciado en el repo): `integration.json`
- Uso en Transformers (referenciado en el repo): `integrations/transformers/usage.md`
- Expectativas de Transformers (referenciado en el repo): `integrations/transformers/expectations`
- Procedencia del fixture (referenciado en el repo): `build.json`
- Explicación del *shrinking*: https://huggingface-mic-mic-coverage.static.hf.space/shrink/chinese-clip-vit-base-patch16-mic.html
- Script de construcción de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla genérica de *shrinking*: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
