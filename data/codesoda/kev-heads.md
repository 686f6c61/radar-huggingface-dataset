# codesoda/kev-heads

## Resumen

`codesoda/kev-heads` es un repositorio de conversión, no un modelo entrenado desde cero. Contiene las cabezas de decisión (*pointer heads*) de la familia Kev, publicadas originalmente por Jared Palmer como ficheros `head.pt` (pickle de PyTorch), reempaquetadas como `head.safetensors` junto a un `head.meta.json` con la temperatura y los metadatos de cada cabeza. El objetivo es permitir que runtimes que no deben ejecutar pickle de PyTorch (por motivos de seguridad o portabilidad) puedan cargar estas cabezas sin dependencia de Python.

El repositorio cubre tres checkpoints: `kev-0.6b` sobre Qwen3-0.6B-Base, `kev-0.8b` sobre Qwen3.5-0.8B-Base y `kev-4b` sobre Qwen3.5-4B-Base. Cada directorio incluye `head.safetensors`, `head.meta.json` y un listado `SHA256SUMS` con los checksums de todos los ficheros. La conversión es exclusivamente de copia de tensores y metadatos: no hay reentrenamiento ni modificación de pesos.

Su relevancia es de infraestructura más que de modelado: alimenta a `kev-rs`, el runtime en Rust de la familia Kev, y al instalador `s1 setup` de SystemOne, que descarga estas cabezas junto al modelo base fijado y al adaptador LoRA. Para quien despliegue Kev en entornos con requisitos estrictos de cadena de suministro, este repositorio es la vía de distribución sin pickle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezas de decisión (*pointer heads*) sobre modelos base decoder-only de la familia Qwen3 / Qwen3.5; el repositorio no contiene el transformer completo |
| Parametros totales | No disponible para las cabezas; los modelos base asociados van de 0,6B a 4B de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (viene determinada por el modelo base Qwen3 / Qwen3.5, no por la cabeza) |
| Tipos de cuantizacion | No disponible; se distribuye en safetensors con la precision original de los tensores convertidos |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`head.safetensors`) mas `head.meta.json` y `SHA256SUMS` |

## Arquitectura y entrenamiento

Este repositorio no entrena nada. El autor documenta explícitamente que «nothing here is retrained or changed»: la herramienta `kev-convert-head` (incluida en `benchmarks/baseline` de kev-rs, versión v0.1.1) copia los tensores del `head.pt` original a formato safetensors y traslada los metadatos, incluida la temperatura calibrada, a `head.meta.json`. Los checksums esperados de salida están registrados en `manifests/sources.json` de kev-rs, y el runtime en Rust se valida contra salidas congeladas de PyTorch y MLX que usan estas mismas cabezas.

La familia Kev, según la información pública disponible, consiste en adaptadores LoRA con una cabeza de puntero sobre modelos base Qwen3.5 y Qwen3.8, siguiendo la arquitectura descrita en «Jev's Architecture Unmasked». Cada checkpoint se publica con una temperatura ajustada sobre datos de retención, de modo que sus probabilidades salen calibradas por defecto. La información web menciona tamaños de 0,8B, 4B, 9B y 27B dentro de la familia (el 27B partiendo de Qwen3.8-27B post-entrenado), mientras que este repositorio de cabezas convertidas solo cubre 0,6B, 0,8B y 4B.

## Capacidades

- Inferencia de decisiones probabilísticas tipadas: las cabezas convierten las representaciones del modelo base en distribuciones de probabilidad sobre opciones, con temperatura calibrada incluida en los metadatos.
- Carga libre de pickle: al distribuirse en safetensors, pueden consumirse desde runtimes que no ejecutan código arbitrario de Python.
- Integración con `kev-rs`: el runtime en Rust lee únicamente `head.safetensors` y `head.meta.json`.
- Aprovisionamiento automatizado mediante `s1 setup` de SystemOne, que descarga la cabeza junto al modelo base fijado y el adaptador LoRA.
- Compatibilidad de API con System One de TypeSafe, lo que permite apuntar el SDK de Python a un servidor local.
- Verificación de integridad mediante `SHA256SUMS` y checksums registrados en los manifiestos de kev-rs.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión, audio, tool calling ni uso de agentes propias de este repositorio: dependen del modelo base y del adaptador con los que se combine cada cabeza.

## Casos de uso

- Despliegue en entornos con políticas anti-pickle: organizaciones que prohíben cargar ficheros `.pt` por riesgo de ejecución de código arbitrario pueden usar estas cabezas en safetensors sin renunciar a la familia Kev.
- Runtimes embebidos en Rust: `kev-rs` consume directamente los ficheros de este repositorio, lo que permite integrar modelos de decisión en servicios nativos sin arrastrar un intérprete de Python.
- Verificación de cadena de suministro: los `SHA256SUMS` y los checksums de `manifests/sources.json` permiten auditar que los tensores desplegados coinciden con el `head.pt` upstream identificado por commit y hash.
- Aprovisionamiento reproducible con SystemOne: `s1 setup` descarga cabeza, modelo base fijado por revisión y adaptador LoRA, lo que da un entorno determinista para evaluación interna.
- Replicación de resultados en distintos frameworks: al existir validación cruzada contra salidas congeladas de PyTorch y MLX, sirve para comprobar que una implementación propia reproduce el comportamiento de referencia.
- Investigación sobre calibración: `head.meta.json` expone la temperatura ajustada en retención, útil para estudiar la calibración de probabilidades en cabezas de decisión sobre modelos pequeños.
- Sustitución directa del formato upstream: cualquier proyecto que ya use las cabezas de `jaredpalmer/kev-*` puede migrar el cargador a safetensors manteniendo los mismos tensores y metadatos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio es una conversión de formato y no aporta métricas propias. Las fuentes web consultadas mencionan páginas comparativas de la familia Kev («Specs & Scores», comparativas frente a Jev), pero no incluyen cifras concretas utilizables en esta ficha.

## Requisitos de hardware

- VRAM estimada: las cabezas son tensores pequeños; el consumo real lo determina el modelo base. Estimaciones orientativas en fp16: en torno a 1,2-1,6 GB para un base de 0,6B-0,8B y en torno a 8-9 GB para un base de 4B (cifras estimadas a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con VRAM suficiente para el modelo base. Para 0,6B-0,8B basta una GPU consumer de gama media; para 4B en fp16 es razonable una RTX 3090/4090 o superior en el ámbito consumer, y A100/H100 en servidor si se busca concurrencia alta.
- Cabe en GPU consumer: sí, para los tres modelos base listados, siempre que se use una precisión y cuantización adecuadas al tamaño de VRAM disponible.
- Opciones de despliegue: `kev-rs` como runtime específico que lee este formato; `s1 setup` de SystemOne para el aprovisionamiento; el modelo base puede servirse con los runners habituales de Qwen (llama.cpp, Ollama, vLLM, TGI) siempre que la cabeza se gestione aparte en kev-rs. No se documentan integraciones directas de estos ficheros con vLLM o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Aspecto | codesoda/kev-heads | jaredpalmer/kev-* (upstream) | Modelos base Qwen3 / Qwen3.5 |
|---|---|---|---|
| Contenido | Cabezas de decisión convertidas (`head.safetensors` + `head.meta.json`) | Adaptadores LoRA con cabeza en `head.pt` (pickle) | Transformer decoder-only completo |
| Tamaños cubiertos | 0,6B, 0,8B, 4B (según base) | Familia Kev: 0,8B-27B según fuentes web | 0,6B / 0,8B / 4B |
| Formato | safetensors, sin pickle | PyTorch pickle | safetensors (formato habitual de Qwen) |
| Licencia | Apache-2.0 | Apache-2.0 | Apache-2.0 en los modelos citados |
| Uso autónomo | No; requiere base y adaptador | Sí, con runtime compatible | Sí |
| Descargas / likes en HF | 0 descargas, 0 likes | No disponible | No disponible |

Alternativas de la misma categoría (cabezas o adaptadores de decisión ligeros, como los modelos Jev de TypeSafe) aparecen mencionadas en las fuentes web, pero no se dispone de datos de rendimiento comparables para incluirlos con rigor.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el modelo base y el adaptador LoRA correspondientes, estas cabezas no producen resultados útiles.
- El repositorio no especifica idiomas soportados; el comportamiento lingüístico queda enteramente en manos del modelo base.
- No hay benchmarks publicados ni métricas de calidad asociadas a esta conversión; la única garantía documentada es la equivalencia de tensores y metadatos con el `head.pt` de origen.
- Riesgo de alucinación: no evaluado en la información disponible y dependiente del modelo base.
- La temperatura calibrada está ajustada sobre datos de retención del upstream; recalibrarla por cuenta propia invalida esa propiedad.
- Existe una discrepancia entre los tamaños cubiertos aquí (0,6B, 0,8B, 4B) y los que mencionan las fuentes web para la familia Kev (hasta 9B y 27B); conviene verificar el inventario actual antes de asumir cobertura completa.
- El repositorio muestra 0 descargas y 0 likes y un tamaño reportado de 0,0 GB, señales de adopción nula y de que el contenido puede ser muy reducido; verificar los ficheros antes de integrarlo en producción.
- Uso comercial permitido por Apache-2.0, siempre que se respeten las condiciones de la licencia y las de los componentes upstream (Kev, adaptadores y modelos base Qwen3 / Qwen3.5, todos Apache-2.0 según la model card).
- El propio autor declara no estar afiliado a los creadores de Kev ni a TypeSafe AI; no hay soporte oficial ni SLA.
- Los modelos base citados aparecen con revisiones concretas; usar revisiones distintas rompe la reproducibilidad de los checksums.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/codesoda/kev-heads
- Kev upstream (GitHub): https://github.com/jaredpalmer/kev
- kev-rs, runtime en Rust: https://github.com/codesoda/kev-rs
- Release de kev-rs v0.1.1 (conversor `kev-convert-head`): https://github.com/codesoda/kev-rs/releases/tag/v0.1.1
- SystemOne: https://github.com/codesoda/systemone
- Adaptador upstream kev-0.6b: https://huggingface.co/jaredpalmer/kev-0.6b
- Adaptador upstream kev-0.8b: https://huggingface.co/jaredpalmer/kev-0.8b
- Adaptador upstream kev-4b: https://huggingface.co/jaredpalmer/kev-4b
- Modelo base Qwen3-0.6B-Base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Modelo base Qwen3.5-0.8B-Base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Modelo base Qwen3.5-4B-Base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Ficha de la familia Kev en AI/TLDR: https://ai-tldr.dev/models/kev/
- Análisis de Kev en Laya AI: https://laya-ai.com/system-one-models/kev
- Perfil de Jared Palmer en OpenRouter: https://openrouter.ai/jaredpalmer
- Artículo sobre el port de Kev a Qwen3.5: https://runtimewire.com/article/jared-palmer-kev-qwen35-decision-models
