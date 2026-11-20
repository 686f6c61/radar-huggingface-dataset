# huggingface-mic/vip-llava-7b-hf-mic

## Resumen

`vip-llava-7b-hf-mic` es un artefacto de prueba (fixture) publicado por la organización `huggingface-mic` en Hugging Face. No es un modelo utilizable: se trata de una versión reducida ("slim") del modelo vision-lenguaje `llava-hf/vip-llava-7b-hf`, con solo 4.336.704 parámetros, creada para validar contratos de integración con frameworks (principalmente Transformers) dentro de un pipeline de pruebas automatizado.

El repositorio empaqueta en un solo lugar los pesos reducidos, el manifiesto de contrato (`integration.json`), la documentación de uso y las expectativas del framework (`integrations/transformers/expectations`). El objetivo declarado es cubrir el checkpoint real `llava-hf/vip-llava-7b-hf` con un fixture que comparta arquitectura (`VipLlavaForConditionalGeneration`), nombres de tensores y ficheros de procesador byte a byte, pero con una configuración mucho menor (2 capas en el codificador visual y 2 capas en el modelo de texto).

La relevancia de esta ficha es fundamentalmente metodológica: ilustra cómo se construyen fixtures de cobertura para probar integraciones de modelos multimodales sin necesidad de descargar los 7B parámetros completos. Cualquier uso como modelo real de inferencia es inadecuado, ya que los pesos son aleatorios (semilla 17) y el autor lo etiqueta explícitamente como `test-artifact`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VipLlavaForConditionalGeneration (vision-lenguaje, transformer) |
| Parametros totales | 4.336.704 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float16) |
| Modelo base | llava-hf/vip-llava-7b-hf |
| Tipo de artefacto | test-artifact (fixture de pruebas) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura `VipLlavaForConditionalGeneration` del checkpoint original, pero con una configuración reducida: `vision num_hidden_layers = 2` y `text num_hidden_layers = 2`, aplicando la regla genérica de reducción definida en `sweep.py` del repositorio `transformers-mic`. Mantiene los mismos nombres de tensores que el checkpoint real y copia byte a byte los ficheros de procesador de `llava-hf/vip-llava-7b-hf`: `added_tokens.json`, `chat_template.json`, `generation_config.json`, `preprocessor_config.json`, `processor_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer.model` y `tokenizer_config.json`.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron mediante una compuerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato desplazó los logits al menos 0,001 (la más débil, `pixel_values:halve`, con 0,0363). El modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La clave de fixture `33f7d808e589` agrupa todos los checkpoints cuyos ficheros de procesador son idénticos byte a byte y cuya configuración coincide tras la reducción. El build se generó con `build_fixtures.py` y los orígenes, resultados de compuertas y hashes quedan registrados en `build.json`.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen salidas semánticamente útiles.
- Ejecuta el forward completo de `VipLlavaForConditionalGeneration` con entradas multimodales (imagen + texto) a escala reducida.
- Sirve para validar la carga del checkpoint en Transformers, incluidos ficheros de procesador y tokenizador copiados del modelo real.
- Permite comprobar contratos de integración: formas de tensores, nombres de parámetros y expectativas del framework.
- Soporta ejecución en float32, bfloat16 y float16 con gradientes finitos, útil para tests de entrenamiento y de mixed precision.
- No dispone de capacidades de razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo reales.

## Casos de uso

- Pruebas de integración en Transformers: cargar el fixture con `AutoModelForVision2Seq` y verificar que el pipeline multimodal arranca sin descargar los 7B parámetros del checkpoint real.
- CI/CD de librerías: ejecutar tests de regresión de la clase `VipLlavaForConditionalGeneration` en cada PR con un consumo de disco y memoria mínimo (repo de 0,0 GB).
- Validación de contratos de API: comprobar que las formas de entrada y salida declaradas en `integration.json` se cumplen y que las perturbaciones de entrada afectan a los logits por encima del umbral.
- Tests de mixed precision: verificar que forward, loss y gradientes son finitos en float32, bfloat16 y float16 antes de escalar al modelo completo.
- Validación de procesadores y tokenizadores: al copiar los ficheros de procesador byte a byte, permite probar la tokenización y el preprocesado de imagen idénticos a los del modelo real.
- Desarrollo de harnesses de evaluación: usar el fixture como sustituto barato en pruebas de infraestructura de benchmarking antes de lanzar el modelo completo.
- Verificación de serialización: comprobar que los nombres de tensores y el guardado en safetensors float16 son compatibles con herramientas de conversión y empaquetado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier métrica de calidad sería irrelevante.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en float16 para los 4,3M parámetros; en la práctica, el consumo lo dominan las activaciones y el procesador de imagen.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe holgadamente en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: Transformers con `VipLlavaForConditionalGeneration`; no está pensado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo funcional.
- Latencia y throughput: no disponibles; no aplica como modelo de producción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vip-llava-7b-hf-mic | 4,3M | no disponible | Fixture de pruebas | no disponible | Hugging Face |
| llava-hf/vip-llava-7b-hf | ~7B | no disponible | Modelo vision-lenguaje real | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | variable (reducidos) | no disponible | Pruebas de integracion | no disponible | Hugging Face / GitHub |

La comparación relevante es con el checkpoint original `llava-hf/vip-llava-7b-hf`: mismo nombre de arquitectura y mismos ficheros de procesador, pero con tres órdenes de magnitud menos de parámetros y pesos aleatorios en lugar de entrenados. Frente a otros fixtures del mismo proyecto, comparte la metodología de reducción genérica y la compuerta de sensibilidad a la entrada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y las salidas carecen de significado.
- Etiquetado como `test-artifact` para excluirlo de búsquedas de modelos candidatos; no debe desplegarse en producción.
- La licencia no está declarada en la información disponible; conviene consultar el repositorio del modelo base antes de cualquier reutilización.
- No se declaran idiomas soportados ni longitud de contexto.
- El tamaño del repo es de 0,0 GB y solo contiene los pesos reducidos, el uso y las expectativas; otros ficheros deben regenerarse con `build_fixtures.py`.
- Riesgo de confusión: el nombre incluye "7b" pero el modelo tiene 4,3M parámetros; verificar siempre la ficha antes de usarlo.
- No apto para evaluación de calidad, benchmarks de razonamiento ni comparativas de rendimiento real.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/vip-llava-7b-hf-mic
- Modelo base: https://huggingface.co/llava-hf/vip-llava-7b-hf
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reducción: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Documentación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/vip-llava-7b-hf-mic.html
