# bambocher/Qwen3.5-4B-heretic-oQ2.7e-mtp

## Resumen

Qwen3.5-4B-heretic-oQ2.7e-mtp es una cuantizacion mixta de un modelo de la familia Qwen3.5, publicada por el usuario bambocher en Hugging Face. Se trata de un checkpoint derivado, no de un modelo entrenado desde cero: parte de una variante "heretic" de Qwen3.5-4B y la comprime mediante la herramienta oQ (oMLX v0.7.3) con precision mixta, logrando un promedio efectivo de 4,439 bits por peso sobre un total de 4.660 millones de parametros logicos.

El resultado ocupa 2,586 GB en disco (2,408 GiB) y esta empaquetado en formato MLX, lo que lo orienta a inferencia en hardware Apple Silicon. Incluye tres componentes diferenciados: el modelo de lenguaje (4,206B de parametros), un modulo de vision (0,334B) y una cabeza MTP (Multi-Token Prediction, 0,121B), lo que sugiere capacidades multimodales y decodificacion especulativa.

La relevancia de esta ficha es acotada: el repositorio no incluye model card descriptiva del modelo base, no declara licencia, idiomas ni pipeline, y no registra descargas ni interacciones. Es util como referencia tecnica de una receta de cuantizacion agresiva (2-3 bits dominantes con capas selectivas en BF16), pero no como modelo listo para produccion sin validacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), con modulo de vision y cabeza MTP; no se detalla en la informacion disponible |
| Parametros totales | 4.659.865.088 (4,660B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta oQ: affine 3-bit grupo 128, affine 3-bit grupo 64, affine 4-bit grupo 64, affine 5-bit grupo 64, affine 8-bit grupo 64 y BF16; promedio efectivo 4,439 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors cuantizados para MLX (libreria `mlx`) |

Desglose de almacenamiento por componente:

| Componente | Parametros logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 4,206B | 1,832 GB / 1,706 GiB |
| Vision | 0,334B | 0,667 GB / 0,621 GiB |
| Cabeza MTP | 0,121B | 0,087 GB / 0,081 GiB |
| Total | 4,660B | 2,586 GB / 2,408 GiB |

Distribucion de bits por peso:

| Formato | Pesos logicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 3-bit, group 128 | 3,267B | 70,119% | 1,236 GiB | 3,25 |
| Affine 3-bit, group 64 | 0,636B | 13,642% | 0,259 GiB | 3,50 |
| Affine 4-bit, group 64 | 0,110B | 2,364% | 0,058 GiB | 4,50 |
| Affine 5-bit, group 64 | 0,252B | 5,401% | 0,161 GiB | 5,50 |
| Affine 8-bit, group 64 | 0,047B | 1,014% | 0,047 GiB | 8,50 |
| BF16 | 0,348B | 7,459% | 0,647 GiB | 16,00 |
| Total | 4,660B | 100% | 2,408 GiB | 4,439 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base Qwen3.5-4B ni su proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO). Lo que si se puede afirmar a partir de la model card es la estructura del checkpoint cuantizado: un backbone de lenguaje de 4,206B de parametros, un codificador o torre de vision de 0,334B y una cabeza MTP de 0,121B. La presencia de esta ultima es indicativa de decodificacion multi-token predictiva, una tecnica de aceleracion de inferencia que predice varios tokens por paso.

La innovacion tecnica documentada es la receta de cuantizacion de oQ (oMLX v0.7.3): asignacion no uniforme de precision, con el 70,1% de los pesos en 3 bits con grupo de 128 y un 7,5% mantenido en BF16 (0,348B de parametros). Este ultimo bloque en precision completa sugiere que la herramienta preserva determinadas capas o tensores sensibles a la cuantizacion. El sufijo "heretic" del nombre indica que el checkpoint de partida es una variante de Qwen3.5-4B con ajuste de comportamiento, pero no se aporta detalle sobre que modificacion concreta introduce ni que metodo se empleo para ello.

## Capacidades

- Generacion de texto y razonamiento: capacidades heredadas del modelo base Qwen3.5-4B; no se documentan evaluaciones especificas tras la cuantizacion.
- Procesamiento de vision: el checkpoint incluye un modulo de vision de 0,334B de parametros, por lo que cabe esperar entrada de imagenes, aunque no se detalla la tarea (VQA, OCR, captioning).
- Decodificacion especulativa: la cabeza MTP de 0,121B habilita prediccion multi-token, orientada a reducir latencia en inferencia.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado local en Apple Silicon: el checkpoint esta en formato MLX y ocupa 2,586 GB, por lo que se puede cargar en un Mac con memoria unificada de 8 GB o mas para pruebas de inferencia sin infraestructura GPU dedicada.
- Evaluacion de cuantizacion agresiva: util para medir la degradacion de calidad de una receta de 3 bits dominante frente al modelo base en tareas de generacion y razonamiento, comparando salidas sobre el mismo prompt set.
- Pruebas de decodificacion especulativa: la cabeza MTP permite experimentar con tecnicas de prediccion multi-token y medir su impacto en throughput y latencia frente a decodificacion autorregresiva estandar.
- Experimentos multimodales de bajo coste: el modulo de vision integrado permite probar pipelines de imagen-texto en un entorno con requisitos de memoria reducidos, adecuado para validacion de conceptos.
- Investigacion sobre ajustes de comportamiento: al partir de una variante "heretic", sirve para estudiar como se preservan o degradan las modificaciones de comportamiento tras una cuantizacion mixta agresiva.
- Distribucion de demos en dispositivos con recursos limitados: el tamano de 2,6 GB facilita empaquetar una demo offline en un portatil, siempre que se valide antes la calidad de las salidas para el dominio concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: el checkpoint ocupa 2,408 GiB en disco; en MLX la carga requiere al menos esa cantidad de memoria unificada mas overhead de activaciones y cache KV, no cuantificado en la informacion disponible.
- GPU recomendadas: no disponible; el formato MLX esta orientado a Apple Silicon (series M1/M2/M3/M4), no a GPU NVIDIA.
- Compatibilidad con GPU de consumo: cabe en Mac con memoria unificada de 8 GB o superior segun el tamano del checkpoint, aunque el margen para contexto largo no esta documentado.
- Opciones de despliegue: MLX (libreria declarada) y el ecosistema oMLX/oQ; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, dado que el formato es MLX y no GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-heretic-oQ2.7e-mtp | 4,660B | no disponible | MLX safetensors (cuantizado mixto) | no disponible | Hugging Face, 0 descargas |
| Qwen3.5-4B (base) | ~4B | no disponible | safetensors | no disponible en esta ficha | Referencia del checkpoint de partida |
| Alternativas de ~4B en MLX | no disponible | no disponible | MLX | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones verificadas de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; es un bloqueo potencial para produccion.
- Trazabilidad limitada: el repositorio no incluye model card del modelo base, ni detalla el ajuste "heretic" aplicado, ni la procedencia exacta de los pesos originales.
- Riesgo de degradacion por cuantizacion: con un 70,1% de los pesos en 3 bits y grupos de 128, es esperable perdida de calidad en tareas sensibles a precision (matematicas, codigo, razonamiento largo); no hay evaluaciones que la cuantifiquen.
- Formato propietario del ecosistema: al ser MLX, no es desplegable directamente en stacks estandar de servidor (vLLM, TGI) sin conversion, que no esta documentada.
- Idiomas no declarados: no se puede asumir soporte multilingue ni calidad en castellano sin pruebas.
- Riesgo de alucinacion: inherente a los modelos generativos y no evaluado en esta variante cuantizada.
- Sesgos: no documentados; el ajuste "heretic" puede alterar el perfil de comportamiento respecto al modelo original, sin que se especifique como.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia externa de funcionamiento correcto.
- Fecha de creacion futura respecto a la referencia habitual: el repositorio figura creado el 2026-11-12, dato a verificar antes de usarlo en cualquier pipeline.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bambocher/Qwen3.5-4B-heretic-oQ2.7e-mtp
- Herramienta de cuantizacion oQ / oMLX: https://github.com/jundot/omlx
