# huggingface-mic/Qwen3.5-0.8B-mic

## Resumen

`Qwen3.5-0.8B-mic` es un artefacto de prueba publicado por el usuario `huggingface-mic` en HuggingFace. No es un modelo entrenado ni utilizable para inferencia real: se trata de un *fixture* o esqueleto reducido del modelo `Qwen/Qwen3.5-0.8B`, generado automáticamente con pesos aleatorios (semilla 17) y una configuración de arquitectura encogida. Su propósito es servir como banco de pruebas para validar integraciones de frameworks (concretamente Transformers) sin necesidad de descargar ni ejecutar el checkpoint completo.

El repositorio contiene 16.775.312 parámetros en safetensors (aproximadamente 16,8M), una fracción mínima del modelo base, y ocupa 0,1 GB. Mantiene la misma clase de arquitectura que el original (`Qwen3_5ForConditionalGeneration`), los mismos nombres de tensores y los ficheros de procesador copiados byte a byte del modelo base, pero con solo 2 capas ocultas en la torre de texto. Está etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos.

Su relevancia es, por tanto, exclusivamente de ingeniería: permite a los mantenedores de Transformers y a desarrolladores de integraciones verificar contratos de entrada/salida, plantillas de chat, tokenizadores y comportamiento numérico en float32, bfloat16 y float16 sin incurrir en los costes de un modelo de 0,8B real. Cualquier uso como modelo de generación de texto, razonamiento o código producirá salidas sin sentido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (transformer multimodal, configuración encogida a 2 capas ocultas en texto) |
| Parametros totales | 16.775.312 (16,8M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; verificado finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el fixture copia el fichero `LICENSE` del modelo base, pero no se especifica su contenido) |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo es un *fixture* derivado de `Qwen/Qwen3.5-0.8B` mediante la regla genérica de reducción implementada en `sweep.py` del repositorio `huggingface/transformers-mic`. La configuración resultante conserva la clase `Qwen3_5ForConditionalGeneration` y reduce la torre de texto a `num_hidden_layers: 2`. Los ficheros de procesador (`tokenizer.json`, `tokenizer_config.json`, `vocab.json`, `merges.txt`, `chat_template.jinja`, `preprocessor_config.json`, `video_preprocessor_config.json`, `LICENSE`) se copiaron byte a byte desde el checkpoint original, de modo que el comportamiento del tokenizador y de la plantilla de chat es idéntico al del modelo base.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron mediante una *input-sensitivity gate*: cada perturbación de las entradas del contrato movía los logits al menos 0,001 (la más débil, `pixel_values:halve`, produjo 0,142). Al superar ese umbral, no fue necesario entrenar el fixture. Los tensores mantienen los mismos nombres que el checkpoint real y el conjunto de parámetros es completo (el fixture no omite capas ni tensores, solo reduce dimensiones). El identificador de fixture es `bcf77184b0ac` y cubre todos los checkpoints cuyos ficheros de procesador son idénticos byte a byte y cuya configuración coincide tras la reducción.

## Capacidades

- No es un modelo funcional: no genera texto, código ni razonamiento con sentido.
- Sirve como banco de pruebas para validar el contrato de `Qwen3_5ForConditionalGeneration` en Transformers.
- Permite verificar la carga del tokenizador y de la plantilla de chat del modelo base `Qwen/Qwen3.5-0.8B`.
- Permite comprobar el pipeline multimodal de preprocesado (imagen y vídeo) gracias a los ficheros `preprocessor_config.json` y `video_preprocessor_config.json` copiados del original.
- Verificado numéricamente finito en float32, bfloat16 y float16 (forward, loss y gradientes).
- Útil para tests de integración continua: carga, forward pass, sensibilidad de entradas y compatibilidad de nombres de tensores.
- No soporta tool calling, agentes, multi-step reasoning ni capacidades multilingües reales.

## Casos de uso

- **Test de integración en Transformers:** cargar el fixture con `AutoModelForConditionalGeneration` y verificar que la clase `Qwen3_5ForConditionalGeneration` se instancia correctamente sin descargar el checkpoint de 0,8B. Adecuado por su tamaño reducido (0,1 GB) y por mantener los nombres de tensores del original.
- **Validación de plantillas de chat:** usar el `chat_template.jinja` copiado byte a byte para comprobar que el renderizado de conversaciones multi-turno produce el formato esperado por el tokenizador del modelo base.
- **Pruebas de preprocesado multimodal:** ejercitar `preprocessor_config.json` y `video_preprocessor_config.json` con imágenes y vídeos sintéticos para verificar formas, normalización y tipos antes de pasar al modelo real.
- **CI/CD de frameworks:** integrar el fixture en la suite de tests de un fork o wrapper de Transformers para detectar regresiones en la carga de safetensors, en la conversión de dtypes o en el forward pass, con un coste de tiempo y almacenamiento mínimo.
- **Verificación de estabilidad numérica:** comprobar que forward, loss y gradientes son finitos en float32, bfloat16 y float16, útil al validar kernels o rutas de mixed precision.
- **Desarrollo de herramientas de inspección de modelos:** usar el fixture como caso de prueba reproducible (semilla 17, hashes en `build.json`) para validar scripts que inspeccionan configuraciones, cuentan parámetros o comparan checkpoints.
- **Reproducción del proceso de reducción:** ejecutar `python example/build_fixtures.py --fixture Qwen3.5-0.8B-mic` para regenerar los ficheros auxiliares y validar la lógica de `sweep.py`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K) sería irrelevante.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en float32 (16,8M parámetros × 4 bytes ≈ 67 MB de pesos, más overhead de activaciones y del procesador).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; también funciona en CPU.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090) e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (ruta principal, con `integrations/transformers/usage.md`), y potencialmente llama.cpp u Ollama si se convierte a GGUF, aunque no se documenta dicha conversión.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas, el forward pass es prácticamente instantáneo, pero las salidas no son significativas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/Qwen3.5-0.8B-mic` | 16,8M | no disponible | Fixture de test | no disponible | HuggingFace |
| `Qwen/Qwen3.5-0.8B` | ~0,8B (no confirmado en la información) | no disponible | Modelo real multimodal | no disponible | HuggingFace |
| Otros fixtures de `huggingface-mic` | variable | no disponible | Test de integración | no disponible | HuggingFace |

No se dispone de datos de benchmarks ni de especificaciones detalladas del modelo base en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- **No es un modelo utilizable:** los pesos son aleatorios (semilla 17); cualquier salida generada es ruido sin significado.
- **Etiquetado como `test-artifact`:** excluido deliberadamente de búsquedas de modelos candidatos; no debe desplegarse en producción.
- **Arquitectura encogida:** solo 2 capas ocultas en la torre de texto, muy lejos de la profundidad del modelo base; el comportamiento de rendimiento no es representativo.
- **Licencia no especificada:** el fixture copia el fichero `LICENSE` del modelo base, pero no se indica su contenido ni las restricciones de uso comercial.
- **Idiomas no disponibles:** no se documenta el soporte multilingüe, aunque el tokenizador es el del modelo base.
- **Contexto no disponible:** no se especifica la longitud de contexto, aunque al ser un fixture no es relevante para uso real.
- **Riesgo de confusión:** el nombre `Qwen3.5-0.8B-mic` puede llevar a error; conviene revisar siempre la etiqueta `test-artifact` antes de descargar.
- **Dependencia del modelo base:** si `Qwen/Qwen3.5-0.8B` cambia sus ficheros de procesador, el fixture deja de cubrir los nuevos checkpoints (clave de fixture `bcf77184b0ac`).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/huggingface-mic/Qwen3.5-0.8B-mic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/Qwen3.5-0.8B-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/Qwen3.5-0.8B-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/Qwen3.5-0.8B-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/Qwen3.5-0.8B-mic/blob/main/build.json
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Qwen3.5-0.8B-mic.html
- Repositorio `transformers-mic` (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
