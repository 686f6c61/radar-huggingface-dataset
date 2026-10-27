# huggingface-mic/Qwen2-VL-2B-Instruct-mic

## Resumen

`huggingface-mic/Qwen2-VL-2B-Instruct-mic` no es un modelo entrenado, sino un artefacto de prueba (*fixture*) construido por el equipo de Hugging Face para validar la integración de `transformers` y de otros frameworks de inferencia con arquitecturas multimodales. Reproduce la arquitectura `Qwen2VLForConditionalGeneration` del checkpoint `Qwen/Qwen2-VL-2B-Instruct`, pero con la configuración reducida a 2 capas en la torre de texto y un total de 10.055.808 parámetros según los pesos en safetensors publicados. Los pesos son aleatorios (semilla 17) y no proceden de ningún entrenamiento: solo tuvieron que superar una comprobación de sensibilidad a las entradas (*gate*), según la cual cada perturbación de las entradas del contrato movía los logits al menos 0,001.

El interés del repositorio es de ingeniería, no de modelado. Al conservar los mismos nombres de tensores que el checkpoint real, los mismos ficheros de procesador copiados byte a byte (`tokenizer.json`, `preprocessor_config.json`, `chat_template.json`, `merges.txt`, `vocab.json`, etc.) y el mismo `dtype` de carga (`bfloat16`), permite ejecutar pruebas de humo de carga, tokenización, preprocesado de imagen y ejecución en *forward* sin descargar ni ejecutar los aproximadamente 2.000 millones de parámetros del modelo original. Está etiquetado explícitamente como `test-artifact` para mantenerse fuera de las búsquedas de modelos candidatos.

Por tanto, cualquier evaluación de calidad, razonamiento, visión o multilingüismo sobre este repositorio carece de sentido: sus salidas son ruido estadístico. Su utilidad se limita a *test suites*, validación de contratos de API y depuración de pipelines de integración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen2VLForConditionalGeneration` (transformer multimodal imagen+texto), configuración reducida: 2 capas en la torre de texto |
| Parametros totales | 10.055.808 (según safetensors); el modelo base declara 2B en su nombre, no verificado en la información disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos se publican en `bfloat16` y el artefacto es finito en `float32`, `bfloat16` y `float16` (forward, loss y gradientes) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible en los metadatos; el repositorio incluye una copia byte a byte del fichero `LICENSE` del modelo base |
| Formato de pesos | safetensors (`bfloat16`) |
| Modelo base | `Qwen/Qwen2-VL-2B-Instruct` (fine-tune declarado en los tags) |
| Tamaño del repositorio | 0,0 GB declarados |
| Autor | `huggingface-mic` |
| Fecha de creación / actualización | 2026-10-27 / 2026-10-27 |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2-VL en su variante `Qwen2VLForConditionalGeneration`, es decir, un transformer multimodal que combina un codificador visual con una torre de texto y proyecta las características de imagen al espacio de tokens del lenguaje. La única modificación respecto al checkpoint original es la reducción de la configuración mediante la regla genérica de `sweep.py`: la torre de texto queda en `num_hidden_layers = 2`. El resto de ficheros de procesador se copian sin cambios desde `Qwen/Qwen2-VL-2B-Instruct`, de modo que el tokenizador, la plantilla de chat y el preprocesador de imagen son idénticos a los del modelo real.

No hubo entrenamiento. Los pesos se inicializaron de forma aleatoria con semilla 17 y se aceptaron porque superaron el umbral de sensibilidad a entradas del contrato (la perturbación más débil, `pixel_values:halve`, desplazó los logits 0,0537). El artefacto conserva exactamente los mismos nombres de tensor que el checkpoint original, se guarda en `bfloat16` (el `dtype` por defecto de carga del modelo base) y se valida numéricamente en `float32`, `bfloat16` y `float16`. El proceso de construcción está registrado en `build.json`, con fuentes fijadas, resultados del *gate* y hashes de ficheros, y es reproducible con `python example/build_fixtures.py --fixture Qwen2-VL-2B-Instruct-mic`.

## Capacidades

- Carga y ejecución en `transformers` como un modelo `Qwen2VLForConditionalGeneration` estándar, con entradas de imagen y texto.
- Compatibilidad estructural con el procesador del modelo base: tokenizador, `preprocessor_config.json` y plantilla de chat idénticos byte a byte.
- Nombres de tensor coincidentes con el checkpoint real, lo que permite validar rutinas de carga, mapeo de pesos y conversión de formatos.
- Ejecución en *forward*, cálculo de pérdida y retropropagación en `float32`, `bfloat16` y `float16` sin valores no finitos.
- Sensibilidad verificada a las entradas del contrato (las perturbaciones de entrada alteran los logits), útil para probar *harnesses* de evaluación.
- Generación de texto y razonamiento: no disponibles como capacidad real; los pesos son aleatorios y la salida es ruido.
- Tool calling, uso de agentes, *thinking mode*, audio o visión funcional: no disponibles.

## Casos de uso

- Pruebas de integración en CI de `transformers`: cargar el *fixture* en lugar del checkpoint de 2B para verificar que la clase `Qwen2VLForConditionalGeneration` se instancia, acepta `pixel_values` y devuelve logits con la forma esperada, con un coste de descarga y ejecución mínimo.
- Validación de frameworks de inferencia de terceros (vLLM, TGI, motores propios): comprobar que el cargador resuelve nombres de tensor, `dtype` y configuración sin necesidad de GPU ni de pesos reales.
- Depuración de pipelines de preprocesado multimodal: al reutilizar el `preprocessor_config.json` y el tokenizador originales, permite aislar errores de redimensionado de imagen, parcheado o construcción de `input_ids` sin que el modelo introduzca variabilidad.
- Pruebas de regresión de plantillas de chat: el `chat_template.json` copiado byte a byte permite verificar el formateo de turnos y roles en integraciones que dependen de él.
- *Smoke tests* de precisión numérica: el artefacto está garantizado como finito en `float16`, `bfloat16` y `float32`, por lo que sirve para detectar desbordamientos en rutas de *mixed precision* antes de ejecutar modelos grandes.
- Validación de contratos y esquemas: el repositorio incluye `integration.json` con el manifiesto del contrato y un directorio de expectativas por framework, utilizables como base de tests automáticos de conformidad.
- Réplica local de *issues* de la comunidad: reproducir fallos de carga o de formas de tensor reportados contra Qwen2-VL sin mover 2B de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K, MMMU, DocVQA) sería irrelevante por construcción.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 20 MB solo para los pesos en `bfloat16` (10,05 M de parámetros × 2 bytes), más el estado del *runtime* y las activaciones, que en la práctica dominan el consumo.
- Cabe holgadamente en CPU y en cualquier GPU consumer, incluidas iGPU y portátiles sin GPU dedicada; no requiere A100, H100 ni RTX 4090.
- GPU recomendadas: ninguna en particular; cualquier GPU con soporte de `bfloat16` o `float16` sirve para probar rutas de precisión.
- Opciones de despliegue: `transformers` es la vía documentada (el repositorio incluye `integrations/transformers/usage.md` y un directorio de expectativas). No se publican pesos GGUF, por lo que llama.cpp y Ollama no están soportados de forma nativa con este repositorio; la disponibilidad en vLLM o TGI no está confirmada en la información proporcionada.
- Latencia y throughput: no disponibles; con 2 capas de texto y 10 M de parámetros, el coste es despreciable frente a la sobrecarga de carga del modelo y del procesador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/Qwen2-VL-2B-Instruct-mic` | 10.055.808 (fixture) | no disponible | sin benchmarks; pesos aleatorios | no disponible en metadatos | safetensors, `bfloat16` |
| `Qwen/Qwen2-VL-2B-Instruct` | ~2B (según denominación) | no disponible | no disponible en la información | no disponible en la información | safetensors, uso real |
| `Qwen/Qwen2-VL-7B-Instruct` | ~7B (según denominación) | no disponible | no disponible en la información | no disponible en la información | safetensors, uso real |

La comparación relevante no es de calidad sino de función: frente al checkpoint real de 2B, el *fixture* reduce el coste de carga en dos órdenes de magnitud y mantiene la interfaz, a cambio de perder por completo la utilidad de sus salidas.

## Limitaciones y advertencias

- Los pesos son aleatorios (semilla 17): el modelo no genera texto coherente ni interpreta imágenes de forma significativa. No debe usarse en producción, demos ni evaluaciones de calidad.
- Etiquetado explícitamente como `test-artifact` por el autor para excluirlo de búsquedas de modelos candidatos; ignora esa etiqueta solo si buscas un *fixture* de pruebas.
- La licencia no está declarada en los metadatos de Hugging Face. El repositorio copia el fichero `LICENSE` del modelo base, pero la información disponible no confirma los términos aplicables; verifícalo antes de cualquier redistribución.
- Idiomas soportados y longitud de contexto no disponibles: la configuración reducida no documenta estos extremos.
- Sin resultados de benchmarks ni métricas publicadas; cualquier comparación de rendimiento con el modelo base es inaplicable.
- El tamaño de repositorio declarado es 0,0 GB y las descargas y *likes* son cero, lo que refleja su naturaleza de artefacto interno más que de modelo distribuido.
- Riesgo de confusión: el nombre incluye "Qwen2-VL-2B", pero el contenido no son los pesos de 2B. Comprueba el número de parámetros antes de integrarlo.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ) ni conversiones listas para motores de inferencia de alto rendimiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huggingface-mic/Qwen2-VL-2B-Instruct-mic
- Modelo base: https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct
- Manifiesto del contrato (`integration.json`): https://huggingface.co/huggingface-mic/Qwen2-VL-2B-Instruct-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/Qwen2-VL-2B-Instruct-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/Qwen2-VL-2B-Instruct-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture (`build.json`): https://huggingface.co/huggingface-mic/Qwen2-VL-2B-Instruct-mic/blob/main/build.json
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Regla de reducción de configuración (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
