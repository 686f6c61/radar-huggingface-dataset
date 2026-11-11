# huggingface-mic/owlvit-base-patch32-mic

## Resumen

`owlvit-base-patch32-mic` es un artefacto de prueba (fixture) publicado por la organización `huggingface-mic` en Hugging Face. No es un modelo entrenado ni utilizable en producción: se trata de una versión reducida artificialmente del modelo `google/owlvit-base-patch32` de Google, con pesos aleatorios (semilla 17) y una configuración de arquitectura encogida. Su propósito es servir como fixture de test para validar contratos de integración de frameworks (en este caso, Transformers) sin necesidad de descargar ni ejecutar el checkpoint original completo.

El modelo conserva la arquitectura `OwlViTForObjectDetection` (detección de objetos open-vocabulary que combina un codificador de texto tipo CLIP con un codificador visual ViT), pero con solo 2 capas ocultas en el codificador de texto y 2 en el codificador visual, frente a las 12 de la versión base de Google. El resultado son 3.552.198 parámetros totales, almacenados en float32. Los ficheros de procesador (tokenizer, preprocessor) se copian byte a byte del modelo original.

La relevancia de este repositorio es puramente de ingeniería de software: permite a los mantenedores de Transformers y de frameworks de inferencia verificar que sus pipelines de carga, tokenización y forward pass funcionan correctamente con la arquitectura OWL-ViT, sin coste computacional ni de almacenamiento. Está etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos. Cualquier uso como detector de objetos real produciría resultados sin sentido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | OWL-ViT (`OwlViTForObjectDetection`): codificador de texto tipo CLIP + codificador visual ViT, detección open-vocabulary |
| Parámetros totales | 3.552.198 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en float32; el autor indica que es finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | google/owlvit-base-patch32 |
| Dtype de los pesos | float32 |
| Capas ocultas (texto / visión) | 2 / 2 (reducidas desde 12 del modelo base) |
| Semilla de los pesos | 17 (pesos aleatorios) |
| Clave de fixture | 1e4ee370dc3d |

## Arquitectura y entrenamiento

La arquitectura es la de OWL-ViT: un transformer dual con un codificador de texto (derivado de CLIP) que procesa las consultas en lenguaje natural y un codificador visual ViT que procesa la imagen; las representaciones resultantes se alinean para producir cajas delimitadoras y puntuaciones de similitud por consulta. En este fixture, la configuración se ha encogido mediante la regla genérica de `sweep.py` del repositorio `transformers-mic`, reduciendo el número de capas ocultas a 2 tanto en el codificador de texto como en el visual. Los nombres de los tensores coinciden exactamente con los del checkpoint real, de modo que la estructura de parámetros es idéntica aunque las dimensiones sean menores.

No hubo entrenamiento alguno. Los pesos son aleatorios (semilla 17) y se validaron únicamente con una "input-sensitivity gate": cada perturbación de las entradas del contrato movía los logits al menos 0,001 (la más débil, `input_ids:roll_batch`, con 0,194), lo que garantiza que el forward pass responde a las entradas. Los ficheros de procesador (`merges.txt`, `preprocessor_config.json`, `special_tokens_map.json`, `tokenizer_config.json`, `vocab.json`) se copiaron byte a byte desde `google/owlvit-base-patch32`. El fixture se generó con `build_fixtures.py` y los orígenes, resultados de la puerta y hashes quedan registrados en `build.json`.

## Capacidades

- Carga y ejecución del forward pass de `OwlViTForObjectDetection` con nombres de tensores idénticos al checkpoint real.
- Validación de pipelines de tokenización de texto y preprocesado de imagen con los ficheros de procesador copiados del modelo base.
- Verificación de contratos de integración de frameworks (directorio `integrations/transformers/expectations`).
- Ejecución finita en float32, bfloat16 y float16 (forward, pérdida y gradientes).
- No realiza detección de objetos real: los pesos son aleatorios y la configuración está encogida.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües verificables.
- No dispone de modo thinking, visión real ni audio.

## Casos de uso

- Test de integración en Transformers: cargar el fixture con `OwlViTForObjectDetection` y comprobar que el pipeline de tokenización, preprocesado de imagen y forward pass se ejecuta sin errores en CI, sin descargar el checkpoint completo de Google.
- Validación de contratos de framework: usar `integration.json` y `integrations/transformers/expectations` para verificar que una nueva versión de Transformers mantiene la compatibilidad de la interfaz con OWL-ViT.
- Pruebas de regresión de carga de safetensors: comprobar que el cargador de pesos mapea correctamente los nombres de tensores y detecta discrepancias de forma o dtype.
- Verificación de estabilidad numérica: ejecutar forward, pérdida y gradientes en float32, bfloat16 y float16 para detectar NaN o infinitos en pipelines de entrenamiento.
- Desarrollo de herramientas de inspección de modelos: usar el fixture como entrada ligera para probar utilidades que analizan configuraciones, nombres de tensores o ficheros de procesador.
- Pruebas de empaquetado y distribución: validar que los scripts de descarga, caché y reconstrucción (`build_fixtures.py`) funcionan con repositorios de tamaño reducido antes de aplicarlos a checkpoints reales.
- Docencia y demostraciones de arquitectura: ilustrar la estructura de OWL-ViT con un modelo de 3,6 M de parámetros que cabe en cualquier entorno, sin necesidad de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (3,55 M de parámetros, aproximadamente 14 MB de pesos); no requiere GPU.
- GPU recomendadas: ninguna en particular; funciona en CPU sin problema. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es sobradamente suficiente, pero innecesaria.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: carga directa con Transformers (`OwlViTForObjectDetection`); no se ha validado con vLLM, llama.cpp, Ollama ni TGI, y estos frameworks no están orientados a modelos de visión de este tipo.
- Latencia y throughput: no disponible; al ser un fixture de test, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| huggingface-mic/owlvit-base-patch32-mic | 3,55 M | no disponible | no disponible | Fixture de test |
| google/owlvit-base-patch32 | no disponible en la información proporcionada | no disponible | no disponible | Detección open-vocabulary real |
| google/owlvit-base-patch16 | no disponible en la información proporcionada | no disponible | no disponible | Detección open-vocabulary real (parche 16) |
| google/owlvit-large-patch14 | no disponible en la información proporcionada | no disponible | no disponible | Detección open-vocabulary real (modelo grande) |

La comparación relevante es únicamente estructural: el fixture replica la interfaz de `google/owlvit-base-patch32` con una configuración encogida y pesos aleatorios. No es sustituible por los modelos reales de la familia OWL-ViT para ninguna tarea de detección.

## Limitaciones y advertencias

- Es un artefacto de test explícitamente etiquetado `test-artifact`; no debe usarse como modelo de producción.
- Los pesos son aleatorios (semilla 17): las salidas no tienen ningún significado semántico.
- La configuración está encogida (2 capas ocultas en texto y visión frente a 12 del modelo base), por lo que el comportamiento difiere del checkpoint original incluso en estructura.
- No se ha entrenado con RLHF, DPO ni ningún otro procedimiento; no hay datos de entrenamiento asociados.
- La licencia no está declarada en la información disponible; conviene consultar el repositorio antes de cualquier uso, aunque el uso previsto es únicamente de test.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas porque el modelo no genera lenguaje ni realiza inferencia útil.
- El repositorio tiene un tamaño de 0,0 GB según la información disponible, coherente con un fixture ligero; no incluye todos los ficheros necesarios para un uso completo, que deben reconstruirse con `python example/build_fixtures.py --fixture owlvit-base-patch32-mic`.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huggingface-mic/owlvit-base-patch32-mic
- Modelo base: https://huggingface.co/google/owlvit-base-patch32
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/owlvit-base-patch32-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/owlvit-base-patch32-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/owlvit-base-patch32-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/owlvit-base-patch32-mic/blob/main/build.json
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/owlvit-base-patch32-mic.html
- Script `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
