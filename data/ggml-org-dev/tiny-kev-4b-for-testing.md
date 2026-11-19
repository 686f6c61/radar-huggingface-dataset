# ggml-org-dev/tiny-kev-4b-for-testing

## Resumen

tiny-kev-4b-for-testing es un adaptador LoRA derivado de jaredpalmer/kev-4b, publicado por la organización ggml-org-dev. No es un modelo destinado a uso real: se trata de una copia modificada y deliberadamente "dañada" cuyo único propósito es servir como fixture de pruebas para el software de llama.cpp. Su salida es, según el propio autor, gibberish (texto sin sentido), y la model card advierte explícitamente de que no debe utilizarse para ninguna otra finalidad.

El adaptador mantiene la estructura funcional del kev-4b original (cabeza de puntero o pointer head, temperatura, disposición del prompt y layout LoRA), de modo que ejercita las mismas rutas de código que el modelo real dentro de llama.cpp, en particular el tipo de decisión `kev`, donde el conversor descarga el modelo base indicado en `adapter_config.json` y fusiona el adaptador. La diferencia clave es que se ha recortado (sliced) para que sea lo bastante pequeño como para ejecutarse en un pipeline de integración continua.

El modelo base es ggml-org-dev/tiny-Qwen3.5-4B-Base-for-testing, una copia recortada de Qwen/Qwen3.5-4B-Base. Solo se conservan los tensores LoRA de 4 de las 32 capas (0, 1, 2 y 3), con dimensión oculta de 32 y head_dim de 256, manteniendo el rango 16 y el alpha originales. La licencia es Apache 2.0, heredada tanto del adaptador original de Jared Palmer como del modelo base Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-4B-Base recortado |
| Parametros totales | no disponible (adaptador LoRA; repo de 0.0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (existe version GGUF en ggml-org-dev/tiny-kev-4b-for-testing-GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); GGUF en repo separado |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 sobre un transformer Qwen3.5-4B-Base recortado. La modificación respecto al kev-4b original se realizó con el script `slice_qwen35_lora.py`, siguiendo la skill `slice-model` de llama.cpp. Los cambios concretos son: el campo `base_model_name_or_path` apunta al modelo base recortado; los tensores LoRA de las capas 0 a 3 se estrecharon con los mismos índices que el modelo base (A conserva las columnas de entrada de su peso base, B las filas de salida, manteniendo rango 16 y alpha); la cabeza de puntero (`head.pt`) reduce sus pesos q y k a la dimensión oculta 32 conservando head_dim 256; y los campos `base` / `base_revision` de `training_config.json` apuntan al base recortado.

No se incluyen los artefactos de entrenamiento del original (`provenance.json`, `result.json`, `train.log`, `training_metrics.json`). No hay información disponible sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El propósito del recorte es puramente funcional: preservar las rutas de código que llama.cpp debe ejercitar durante la conversión y fusión del adaptador, no preservar capacidades del modelo.

## Capacidades

- No tiene capacidades de generación útiles: la model card indica explícitamente que su salida es gibberish.
- Sirve como fixture de prueba para validar el flujo de conversión de adaptadores LoRA a GGUF en llama.cpp (tipo de decisión `kev`).
- Permite comprobar la descarga automática del modelo base referenciado en `adapter_config.json` y la fusión posterior del adaptador.
- Ejercita la ruta de la cabeza de puntero (`head.pt`) con dimensiones reducidas (hidden size 32, head_dim 256).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Integración continua en llama.cpp: ejecutar la conversión y fusión del adaptador en cada PR sin descargar el modelo completo, gracias a que el recorte reduce el tamaño del repo a 0.0 GB.
- Pruebas de regresión del conversor: verificar que los campos `base_model_name_or_path`, `base` y `base_revision` se resuelven correctamente hacia el modelo base recortado.
- Validación del pipeline LoRA a GGUF: comprobar que el layout del adaptador (rango 16, alpha preservado, tensores A/B estrechados) se serializa correctamente en la versión GGUF publicada en el repo hermano.
- Pruebas de la cabeza de puntero: ejercitar la ruta de `head.pt` con pesos q/k de dimensión reducida sin requerir el modelo completo.
- Test de carga de PEFT: validar que la librería `peft` carga el adaptador y lo asocia al base correcto en entornos automatizados.
- Verificación de licencias y metadatos: comprobar que la cadena de atribución (kev-4b de Jared Palmer, Qwen3.5-4B-Base, Apache 2.0) se propaga correctamente en herramientas que leen model cards.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un adaptador sobre un base recortado, el requisito real depende del modelo base tiny-Qwen3.5-4B-Base-for-testing, cuyas dimensiones completas no se detallan en la información proporcionada.
- GPU recomendadas: no disponible. El diseño está pensado para ejecutarse en CI, lo que sugiere requisitos muy bajos, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no disponible de forma explícita; el objetivo declarado es que sea "lo bastante pequeño para CI".
- Opciones de despliegue: llama.cpp es el entorno de referencia (tipo de decisión `kev`); existe una versión GGUF en ggml-org-dev/tiny-kev-4b-for-testing-GGUF. No se documenta soporte para vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|---|
| tiny-kev-4b-for-testing | LoRA sobre base recortado | no disponible (repo 0.0 GB) | no disponible | Apache 2.0 | Fixture de CI para llama.cpp |
| jaredpalmer/kev-4b | LoRA sobre Qwen3.5-4B-Base | adaptador LoRA | no disponible | Apache 2.0 | Modelo original del que deriva |
| ggml-org-dev/tiny-Qwen3.5-4B-Base-for-testing | Base recortado | no disponible | no disponible | no disponible | Base recortado para pruebas |
| Qwen/Qwen3.5-4B-Base | Transformer base | 4B (nominal) | no disponible | Apache 2.0 (según la model card) | Modelo base de produccion |

La comparación relevante no es de rendimiento sino de función: el tiny-kev-4b-for-testing existe únicamente para replicar las rutas de código del kev-4b real a un coste mínimo en CI. Frente al kev-4b original, pierde toda capacidad generativa y conserva únicamente la estructura del adaptador y de la cabeza de puntero.

## Limitaciones y advertencias

- La salida es gibberish por diseño; no debe usarse para inferencia real ni para evaluar calidad.
- Es una copia "modificada y dañada" del kev-4b original, según la propia model card.
- Solo conserva los tensores LoRA de 4 de 32 capas, con dimensión oculta recortada a 32; cualquier comportamiento emergente del modelo original se pierde.
- No se incluyen los logs ni métricas de entrenamiento (`provenance.json`, `result.json`, `train.log`, `training_metrics.json`), lo que impide auditar el proceso de entrenamiento original.
- No hay información sobre sesgos, riesgo de alucinación ni comportamiento multilingüe; al ser un fixture, estas consideraciones no aplican a su uso previsto.
- Licencia Apache 2.0: permite uso comercial del artefacto, pero su utilidad comercial es nula dado que no genera texto coherente.
- No debe desplegarse en producción bajo ninguna circunstancia; su único entorno válido es un pipeline de pruebas automatizado.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/ggml-org-dev/tiny-kev-4b-for-testing
- Versión GGUF: https://huggingface.co/ggml-org-dev/tiny-kev-4b-for-testing-GGUF
- Modelo base recortado: https://huggingface.co/ggml-org-dev/tiny-Qwen3.5-4B-Base-for-testing
- Adaptador original: https://huggingface.co/jaredpalmer/kev-4b
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Script de recorte: slice_qwen35_lora.py (incluido en el repositorio del modelo)
