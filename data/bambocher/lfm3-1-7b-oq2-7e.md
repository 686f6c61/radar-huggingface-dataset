# bambocher/LFM3-1.7B-oQ2.7e

## Resumen

LFM3-1.7B-oQ2.7e es una cuantizacion mixta del modelo LFM3-1.7B, publicada por el usuario bambocher en Hugging Face. Se ha generado con la herramienta oQ (oMLX v0.7.3), un esquema de cuantizacion de precision mixta orientado a pesos en formato MLX, lo que la hace ejecutable en hardware Apple Silicon mediante la libreria MLX.

El checkpoint contiene 1.728.801.536 parametros logicos y ocupa 0.675 GiB en disco (0.7 GB en el repositorio), con un promedio efectivo de 3.351 bits por peso. La mayor parte de los pesos (82,93%) se almacena en affine 3-bit con grupo 128, mientras que un pequeno porcentaje se conserva en 4, 5 y 8 bits para preservar capas sensibles a la cuantizacion. No se dispone de informacion sobre el modelo base original, su arquitectura interna, sus datos de entrenamiento ni su licencia.

La relevancia de esta ficha es limitada por la escasez de datos publicados: el autor solo documenta el esquema de cuantizacion y el desglose de almacenamiento. No hay model card del modelo base, ni benchmarks, ni indicacion de idiomas, ni pipeline declarado. Cualquier uso en produccion requeriria contactar con el autor o consultar la ficha del LFM3-1.7B original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3-1.7B, arquitectura no documentada en la ficha) |
| Parametros totales | 1.728.801.536 (1.729B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ mixed-precision: affine 3-bit g128 (82,93%), affine 3-bit g64 (15,16%), affine 4-bit g64 (0,91%), affine 5-bit g64 (0,06%), affine 8-bit g64 (0,91%), BF16 (0,02%); media efectiva 3,351 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), con `custom_code`; requiere libreria `mlx` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base LFM3-1.7B: la model card solo describe el proceso de cuantizacion. El checkpoint es una conversion de pesos a MLX con cuantizacion de precision mixta generada por oQ (oMLX v0.7.3), que asigna distintos niveles de bits por grupo de pesos. La distribucion concreta es: 1.434B parametros en affine 3-bit grupo 128, 0.262B en affine 3-bit grupo 64, 0.016B en affine 4-bit grupo 64, 0.001B en affine 5-bit grupo 64, 0.016B en affine 8-bit grupo 64 y una fraccion residual en BF16.

No hay datos sobre el numero de tokens de entrenamiento, composicion del dataset, ni si el modelo base empleo RLHF, DPO u otras tecnicas de alineamiento. Tampoco se documentan innovaciones tecnicas del modelo original (atencion lineal, decodificacion especulativa, etc.). El unico detalle tecnico verificable es el esquema de cuantizacion descrito en la tabla anterior.

## Capacidades

- No se documentan capacidades especificas en la model card del checkpoint.
- Al derivar del modelo LFM3-1.7B, se asume generacion de texto, pero no hay confirmacion en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Ejecucion local en Apple Silicon: el formato MLX y el tamano de 0.675 GiB permiten cargar el modelo en un Mac con memoria unificada, aunque el rendimiento real depende del modelo base y de la libreria MLX.
- Prototipado de pipelines de cuantizacion: util como referencia para evaluar el esquema oQ de oMLX v0.7.3 y comparar la perdida de calidad frente a cuantizaciones uniformes de 4 bits.
- Experimentacion con modelos de ~1.7B en entornos con memoria limitada: el checkpoint cabe en menos de 1 GB de almacenamiento, lo que facilita su distribucion y pruebas rapidas.
- Evaluacion comparativa de tecnicas de cuantizacion mixta: sirve como punto de partida para medir perplejidad o calidad de generacion frente al modelo base sin cuantizar.
- Despliegue en dispositivos Apple para tareas de generacion de texto de baja latencia, siempre que se valide primero la calidad del modelo base.
- Investigacion sobre preservacion de capas sensibles: la mezcla de 3, 4, 5 y 8 bits permite estudiar que capas requieren mayor precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0.7 GB para los pesos en el esquema actual (3,351 bits/peso medio); el overhead de activaciones y KV cache depende del contexto y no esta documentado.
- GPU recomendadas: no disponible; el formato MLX esta orientado a Apple Silicon (M1/M2/M3/M4) con memoria unificada.
- Compatibilidad con GPU consumer: no confirmada; MLX no soporta oficialmente GPUs NVIDIA o AMD.
- Opciones de despliegue: libreria `mlx` (requerida por el checkpoint); no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-1.7B-oQ2.7e | 1.729B | no disponible | oQ mixta (3,351 bits/peso) | no disponible | safetensors MLX |
| LFM3-1.7B (base) | 1.7B (presumible) | no disponible | no disponible | no disponible | no disponible |
| Alternativas de ~1.7B en MLX | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa rigurosa con modelos de la misma categoria.

## Limitaciones y advertencias

- La model card no documenta sesgos, riesgos de alucinacion ni limitaciones del modelo base.
- La cuantizacion a 3,351 bits/peso medio puede degradar la calidad respecto al modelo original; no se aportan metricas de perdida.
- La licencia no esta declarada, lo que impide confirmar si se permite uso comercial.
- No se especifican idiomas soportados ni longitud de contexto.
- El checkpoint depende de `custom_code` y de la libreria MLX; la portabilidad a otros entornos (PyTorch, CUDA) no esta garantizada.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-14), sin historial de validacion por la comunidad.
- No hay pipeline declarado, lo que puede complicar su carga automatica en herramientas de Hugging Face.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bambocher/LFM3-1.7B-oQ2.7e
- Herramienta oQ / oMLX: https://github.com/jundot/omlx
- Modelo base LFM3-1.7B: no disponible en la informacion proporcionada
