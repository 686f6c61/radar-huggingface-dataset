# huggingface-mic/dinov2-small-mic

## Resumen

`dinov2-small-mic` es un artefacto de prueba (fixture) publicado por la organización `huggingface-mic` en Hugging Face. No es un modelo utilizable: se trata de una versión "adelgazada" del checkpoint `facebook/dinov2-small` de Meta, reducida a 225.856 parámetros mediante la regla genérica de reducción de `sweep.py` del repositorio `transformers-mic`. Su propósito es servir como fixture de integración continua para validar el soporte de la arquitectura DINOv2 en Transformers y en el ecosistema MIC (Model Integration Contract), no para realizar inferencia real.

El modelo conserva la arquitectura `Dinov2Model` (un transformer de visión), pero con `num_hidden_layers` reducido a 2 y pesos inicializados aleatoriamente con semilla 17. Los ficheros de procesador (`preprocessor_config.json`) se copian byte a byte del checkpoint original, de modo que el pipeline de preprocesado es idéntico al real. El fixture está etiquetado explícitamente como `test-artifact` para excluirlo de las búsquedas de modelos candidatos.

La relevancia de esta ficha es limitada desde el punto de vista de uso productivo: cualquier desarrollador que llegue a este repositorio buscando un extractor de características de imagen debe dirigirse al modelo base `facebook/dinov2-small`. El interés técnico reside en que documenta un patrón de empaquetado de fixtures (contrato, expectativas de framework, procedencia de build y pesos reducidos) que puede servir de referencia para equipos que mantengan suites de integración de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dinov2Model (transformer de vision, 2 capas) |
| Parametros totales | 225.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una instancia reducida de `Dinov2Model`, la arquitectura de visión auto-supervisada de Meta presentada en el paper DINOv2. La reducción se aplica con la regla genérica de `experiments/sweep.py` del repositorio `transformers-mic`, que en este caso fija `num_hidden_layers = 2` frente a las 12 capas del `dinov2-small` original. Los nombres de tensores coinciden con los del checkpoint real, de modo que el fixture es intercambiable a nivel de carga sin cambios en el código de integración.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron con una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato desplaza los logits al menos 0,001 (la más débil, `pixel_values:halve`, produce un desplazamiento de 0,331). Los pesos se guardan en float32, el dtype por defecto de `facebook/dinov2-small`, y se verificó que el forward, la pérdida y los gradientes son finitos en float32, bfloat16 y float16. El fichero de preprocesado se copia byte a byte del modelo base.

## Capacidades

- No es un modelo funcional: no genera texto, no razona, no produce código ni resuelve matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa lenguaje).
- Su única función es ejercitar la ruta de carga, preprocesado y forward de `Dinov2Model` en Transformers y en el contrato MIC.
- Sirve como fixture de regresión para validar que los cambios en el framework no rompen la integración de la arquitectura DINOv2.

## Casos de uso

- Integración continua de Transformers: el fixture se carga en la suite de tests para verificar que `Dinov2Model` sigue aceptando los mismos nombres de tensores y el mismo `preprocessor_config.json` tras refactorizaciones del código.
- Validación de contratos MIC: el repositorio incluye `integration.json` con el manifiesto del contrato y `integrations/transformers/expectations`, que permiten comprobar que un framework cumple las expectativas de entrada y salida definidas.
- Pruebas de compatibilidad de dtype: al ser finito en float32, bfloat16 y float16, permite testear rutas de carga y forward en distintas precisiones sin necesidad de descargar el checkpoint completo.
- Desarrollo de pipelines de preprocesado: al copiar byte a byte el `preprocessor_config.json` real, se puede validar el preprocesado de imágenes de DINOv2 sin pesos reales.
- Reproducción de builds: `build.json` registra fuentes fijadas, resultados de las puertas y hashes de ficheros, lo que permite reconstruir el fixture con `python example/build_fixtures.py --fixture dinov2-small-mic`.
- Referencia para equipos que diseñen sus propios fixtures: el patrón de empaquetar pesos reducidos, uso ejecutable y expectativas de framework en un único repositorio es reutilizable para otras arquitecturas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en float32 (225.856 parámetros × 4 bytes), despreciable en cualquier GPU.
- GPU recomendadas: ninguna en particular; cabe en CPU y en cualquier GPU consumer, incluida una GTX 1050 o una iGPU.
- Cabe en consumer GPU: sí, con margen amplísimo.
- Opciones de despliegue: carga directa con `transformers` (ruta principal documentada en `integrations/transformers/usage.md`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un artefacto de prueba sin valor semántico, las métricas de rendimiento no son significativas.

## Comparativa con modelos similares

| Modelo | Parámetros | Capas | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dinov2-small-mic` | 225.856 | 2 | Fixture de test | no disponible | Hugging Face |
| `facebook/dinov2-small` | ~22 M | 12 | Extractor de features de imagen | no disponible | Hugging Face |
| `facebook/dinov2-base` | ~86 M | 12 | Extractor de features de imagen | no disponible | Hugging Face |
| `facebook/dinov2-large` | ~300 M | 24 | Extractor de features de imagen | no disponible | Hugging Face |

La comparación con las variantes reales de DINOv2 es solo estructural: el fixture comparte arquitectura y nombres de tensores con `facebook/dinov2-small`, pero carece de pesos entrenados y de cualquier capacidad de extracción de features útil. Para uso real debe emplearse el checkpoint de Meta.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y no codifican ninguna representación aprendida.
- Etiquetado como `test-artifact` para excluirlo de búsquedas de modelos candidatos; no debe desplegarse en producción bajo ningún concepto.
- Sesgos conocidos: no aplica, al no haber entrenamiento; no se puede evaluar sesgo en un modelo con pesos aleatorios.
- Riesgo de alucinación: no aplica en el sentido habitual, pero cualquier salida que produzca es ruido sin significado.
- Limitaciones de contexto o idioma: no aplica; el modelo no procesa lenguaje.
- Restricciones de licencia: la licencia no está declarada en la información disponible, lo que impide confirmar condiciones de uso comercial. El modelo base `facebook/dinov2-small` tiene sus propias condiciones, que deben consultarse por separado.
- Caveat para producción: el repo ocupa 0,0 GB y contiene solo pesos reducidos, uso y expectativas; otros ficheros deben regenerarse con `build_fixtures.py`.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/huggingface-mic/dinov2-small-mic)
- [Modelo base facebook/dinov2-small](https://huggingface.co/facebook/dinov2-small)
- [Repositorio transformers-mic](https://github.com/huggingface/transformers-mic)
- [Script sweep.py](https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py)
- [Script build_fixtures.py](https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py)
- [Cómo se redujo el fixture](https://huggingface-mic-mic-coverage.static.hf.space/shrink/dinov2-small-mic.html)
