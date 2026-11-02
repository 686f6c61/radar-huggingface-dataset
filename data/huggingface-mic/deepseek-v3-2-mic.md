# huggingface-mic/DeepSeek-V3.2-mic

## Resumen

DeepSeek-V3.2-mic es un artefacto de prueba publicado por el usuario huggingface-mic. No es un modelo de lenguaje entrenado ni utilizable: se trata de un *fixture* o maqueta de 16,9 millones de parámetros construida para reproducir la arquitectura y el contrato de integración de deepseek-ai/DeepSeek-V3.2 en frameworks como Transformers. El autor lo etiqueta explícitamente como `test-artifact` para mantenerlo fuera de las búsquedas de modelos candidatos.

El repositorio empaqueta pesos recortados, un manifiesto de contrato (`integration.json`), documentación de uso para Transformers y un directorio de expectativas de framework. La configuración se ha reducido mediante una regla genérica (2 capas ocultas) manteniendo los mismos nombres de tensor que el checkpoint real y copiando byte a byte los ficheros de procesador (tokenizer, generation_config, LICENSE) del modelo base.

Su relevancia es puramente de ingeniería: sirve para validar pipelines de carga, comprobaciones de sensibilidad a entradas y tests de integración sin necesidad de descargar los cientos de gigabytes del DeepSeek-V3.2 original. Los pesos son aleatorios (semilla 17) y no han sido entrenados; cualquier uso generativo producirá salidas sin sentido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeepseekV32ForCausalLM (transformer causal, configuración recortada a 2 capas ocultas) |
| Parámetros totales | 16.911.492 |
| Parámetros activos | no disponible (el modelo base DeepSeek-V3.2 es MoE, pero este fixture no documenta el reparto de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se copia el fichero LICENSE del modelo base, pero el autor no declara licencia propia) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la clase `DeepseekV32ForCausalLM` del modelo base, pero con una configuración reducida: `num_hidden_layers` igual a 2. Conserva exactamente los mismos nombres de tensor que el checkpoint real, de modo que cualquier código que espere la estructura de DeepSeek-V3.2 puede cargarlo sin cambios. Los ficheros de procesador (`tokenizer.json`, `tokenizer_config.json`, `generation_config.json`, `LICENSE`) se copian byte a byte desde deepseek-ai/DeepSeek-V3.2.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y solo se validaron mediante una compuerta de sensibilidad a entradas: cada perturbación de las entradas del contrato debía mover los logits al menos 0,001; la más débil (`input_ids:roll_batch`) alcanzó 1,12. El modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El proceso de recorte y construcción está documentado en `build_fixtures.py` y `build.json`, con hashes de ficheros y fuentes fijadas.

## Capacidades

- No tiene capacidades generativas reales: los pesos son aleatorios y no han sido entrenados.
- Sirve como fixture de integración para validar la carga de `DeepseekV32ForCausalLM` en Transformers.
- Permite comprobar contratos de entrada/salida (input_ids, atención, logits) mediante el manifiesto `integration.json`.
- Útil para tests de CI que verifiquen nombres de tensor y compatibilidad de tokenizer con el modelo base.
- No dispone de tool calling, agentes, razonamiento, código, matemáticas ni visión.
- No hay soporte multilingüe declarado ni modo thinking.

## Casos de uso

- Tests de integración en CI: cargar el fixture con Transformers y verificar que la clase `DeepseekV32ForCausalLM` se instancia y ejecuta un forward sin errores, sin descargar el checkpoint completo.
- Validación de contratos de framework: usar `integration.json` y el directorio `integrations/transformers/expectations` para comprobar que una nueva versión de Transformers mantiene la compatibilidad con la arquitectura DeepSeek-V3.2.
- Desarrollo de tooling de tokenización: al copiar el tokenizer real byte a byte, permite probar pipelines de preprocesado con el vocabulario auténtico de DeepSeek-V3.2 sin cargar los pesos completos.
- Pruebas de sensibilidad a entradas: reproducir la compuerta del autor (perturbaciones que deben mover los logits al menos 0,001) como test de regresión en frameworks de inferencia.
- Verificación de dtypes: comprobar que el modelo se mantiene finito en float32, bfloat16 y float16 en forward, loss y gradientes, útil para validar kernels y capas de atención.
- Reproducibilidad de fixtures: reconstruir el artefacto con `build_fixtures.py` y comparar hashes de `build.json` para auditar cambios en el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (16,9 M de parámetros, ~34 MB de pesos) más overhead de activaciones y tokenizer.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe holgadamente en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: Transformers (uso documentado en `integrations/transformers/usage.md`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia sería mínima pero irrelevante para producción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| DeepSeek-V3.2-mic | 16,9 M | no disponible | no disponible | Fixture de test |
| deepseek-ai/DeepSeek-V3.2 | no disponible en la información | no disponible | no disponible | Modelo real de producción |
| Otros fixtures de huggingface-mic | variable | no disponible | no disponible | Artefactos de test por arquitectura |

No se dispone de datos de rendimiento para comparar; la comparación únicamente tiene sentido a nivel de propósito (fixture frente a modelo real).

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen significado.
- No debe desplegarse en producción ni usarse para generar contenido.
- La licencia no está declarada por el autor; el fichero LICENSE copiado del modelo base debe revisarse antes de cualquier redistribución.
- El contexto, los idiomas y las capacidades del modelo base no están documentados en este repositorio.
- El recorte a 2 capas ocultas implica que el comportamiento numérico no representa al DeepSeek-V3.2 real.
- Riesgo de confusión si se descubre mediante búsquedas: el tag `test-artifact` está pensado para excluirlo, pero conviene verificar el ID antes de integrarlo.
- No se documentan sesgos, alucinaciones ni limitaciones idiomáticas porque el modelo no ha sido entrenado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/huggingface-mic/DeepSeek-V3.2-mic
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V3.2
- Página del MIC: https://huggingface.co/huggingface-mic/DeepSeek-V3.2-mic
- Documentación de recorte: https://huggingface-mic-mic-coverage.static.hf.space/shrink/DeepSeek-V3.2-mic.html
- Script de construcción: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de recorte: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
