# SizorCloud/Ornith-1.5-122B-MTP

## Resumen

Ornith-1.5-122B-MTP es un bloque de predicción multi-token (MTP, *multi-token prediction*) extraído del modelo Ornith-1.5-122B y convertido a GGUF para su uso como *draft model* en decodificación especulativa. No es un modelo autónomo: es un cabezal auxiliar de 2.523.679.232 parámetros (2,69 GB en Q8_0) que se acopla al modelo base para proponer tokens candidatos que después se verifican contra el modelo grande. Lo publica el usuario SizorCloud bajo licencia MIT, derivado de la conversión BF16 en MLX de ToPo-ToPo.

El problema que resuelve es concreto: las cuantizaciones GGUF públicas de Ornith-1.5-122B se convierten sin su bloque MTP, de modo que los motores de inferencia no tienen de dónde generar borradores. Este repositorio restaura ese bloque en formato GGUF (20 tensores, `blk.48.*`, con la capa MTP y cuatro tensores `nextn.*`), listo para pasarse a un motor que acepte un bloque MTP externo mediante `--mtp-gguf`.

Su relevancia es práctica: en una RTX 3090 de 24 GB con contexto de 2048 y `--mtp 2`, el autor mide una tasa de aceptación del 38 % (10 de 26 borradores) y un aumento de decodificación de ~5 tok/s a 8,2 tok/s, manteniendo el texto idéntico porque cada borrador se verifica contra el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bloque MTP (multi-token prediction) de un transformer MoE; capa `blk.48.*` con 4 tensores `nextn.*`, block_count 49, nextn_predict_layers 1 |
| Parametros totales | 2.523.679.232 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo base; en la medición se usaron 2048 tokens) |
| Tipos de cuantizacion | Q8_0 en expertos enrutados del MTP; normas y router en F32 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`mtp-Ornith-1.5-122B-Q8_0.gguf`, 2.694.719.072 bytes) |

## Arquitectura y entrenamiento

El fichero contiene exclusivamente el bloque MTP del checkpoint Ornith-1.5-122B: 20 tensores organizados como `blk.48.*`, que incluyen la capa MTP propiamente dicha y cuatro tensores `nextn.*`, con un `nextn_predict_layers` de 1 y un `block_count` de 49. Los expertos enrutados (`switch_mlp`) se cuantizan a Q8_0, mientras que las normas y el router se mantienen en F32. No se ha entrenado nada nuevo: es una conversión de formato.

La procedencia es relevante para reproducibilidad. Se parte de `ToPo-ToPo/Ornith-1.5-122B-MTP-bf16`, la división BF16 en MLX de los pesos `mtp.*` del checkpoint, donde los expertos `switch_mlp` apilados se separaron en tensores por experto y se renombraron al esquema `mtp.*`; después se aplicó `convert_hf_to_gguf.py --outtype q8_0` de llama.cpp. El autor advierte de un detalle técnico importante: convertir los tensores `mtp.*` directamente desde los shards safetensors produjo un bloque con normas ≈1,0 (aspecto de cabezal no entrenado) que aceptaba el 0 % de los borradores; los pesos de la división MLX tienen normas ≈2–3, propias de un cabezal entrenado, y sí funcionan.

## Capacidades

- Predicción multi-token como *drafter* especulativo para Ornith-1.5-122B: propone varios tokens candidatos por paso que el modelo base verifica.
- Aceleración de decodificación verificada: el texto generado es idéntico con y sin el drafter, ya que cada borrador se valida contra el modelo grande.
- Integración mediante bloque MTP externo (`--mtp-gguf`), sin modificar el GGUF base ni sus shards.
- Compatible con motores que lean un bloque MTP externo; en Strata requiere una compilación local con `--mtp-gguf` (la versión upstream 0.2.x solo lee el bloque MTP del propio fichero del modelo).
- No realiza generación de texto, razonamiento, código ni tool calling por sí mismo: es un componente auxiliar, no un modelo conversacional autónomo.
- Idiomas y capacidades multilingües: no disponibles (heredados del modelo base, no documentados aquí).

## Casos de uso

- Acelerar inferencia local de Ornith-1.5-122B en GGUF: pasar este fichero al motor con `--mtp-gguf` para recuperar la decodificación especulativa que las cuantizaciones públicas pierden, con una mejora medida de ~5 a 8,2 tok/s en RTX 3090.
- Despliegue en una sola GPU de consumo: con 2,69 GB adicionales sobre el modelo base cuantizado, permite servir el 122B en 24 GB de VRAM manteniendo latencia interactiva aceptable.
- Reproducción de experimentos de decodificación especulativa: sirve como referencia para medir tasas de aceptación con distintos valores de `--mtp` y longitudes de contexto.
- Verificación de calidad de cabezales MTP: el aviso sobre normas ≈1,0 frente a ≈2–3 permite validar si un cabezal convertido está realmente entrenado antes de desplegarlo.
- Servicio de chat o generación por lotes en entornos con recursos limitados: al no alterar el texto de salida, puede adoptarse sin recalibrar evaluaciones de calidad del modelo base.
- Construcción de pipelines GGUF propios: como ejemplo documentado de conversión de tensores `mtp.*`/`switch_mlp` a `blk.48.*` con llama.cpp para otros checkpoints con MTP.

## Benchmarks y rendimiento

Medición del autor en Strata (motor qwen35, compilación local con `--mtp-gguf`), RTX 3090 de 24 GB, contexto 2048, temperatura 0, `--mtp 2`, 24 tokens:

| Configuracion | Borradores aceptados | Decodificacion |
|---|---|---|
| Sin drafter | — | ~5 tok/s |
| Este fichero | 10 de 26 (38 %) | 8,2 tok/s |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM adicional para el drafter: 2,69 GB en Q8_0, sumados a la VRAM del modelo base Ornith-1.5-122B cuantizado.
- GPU de referencia en las mediciones: NVIDIA RTX 3090 de 24 GB, suficiente para el conjunto con contexto de 2048.
- Cabe en GPU de consumo de 24 GB (RTX 3090, RTX 4090) siempre que el GGUF base quepa junto al drafter; en GPUs de 16 GB o menos no hay datos disponibles.
- Opciones de despliegue: motores que acepten bloque MTP externo, como Strata con compilación local (`--mtp-gguf`); llama.cpp se usa para la conversión, pero no se documenta soporte de inferencia con MTP externo.
- Throughput medido: 8,2 tok/s frente a ~5 tok/s sin drafter en el escenario indicado; latencia en otros entornos no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-122B-MTP (este) | 2,52 B (bloque MTP) | no disponible | Drafter especulativo para Ornith-1.5-122B | MIT | GGUF, 49 descargas |
| ToPo-ToPo/Ornith-1.5-122B-MTP-bf16 | no disponible | no disponible | Pesos MTP en BF16 (MLX) | no disponible | Hugging Face |
| GGUF publicos de Ornith-1.5-122B | 122 B (nominal) | no disponible | Modelo base sin bloque MTP | MIT (heredada) | GGUF |

No se dispone de datos de rendimiento de las alternativas para una comparación cuantitativa; la diferencia principal es la presencia o ausencia del bloque MTP utilizable.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el GGUF base de Ornith-1.5-122B no genera nada; su única función es draft.
- Dependencia de motor: requiere un motor que lea un bloque MTP externo; Strata upstream 0.2.x no lo hace y necesita compilación local con `--mtp-gguf`.
- Riesgo de cabezal mal convertido: conversiones directas desde safetensors pueden producir normas ≈1,0 y 0 % de aceptación; verificar las normas antes de desplegar.
- Tasa de aceptación modesta (38 % en la medición) y medida en un único escenario (RTX 3090, 2048 de contexto, `--mtp 2`, 24 tokens); no hay datos de escalado a contextos mayores.
- Idiomas soportados no documentados; cualquier sesgo o limitación lingüística proviene del modelo base y no se detalla aquí.
- Riesgo de alucinación: no aplica al drafter por separado, ya que los borradores se verifican contra el modelo base; el texto final es idéntico con y sin él.
- Licencia MIT en los pesos (según el autor, pertenecientes a los autores de Ornith); el repositorio es solo una conversión de formato. Verificar la licencia del modelo base para uso comercial.
- Sin métricas publicadas de calidad, throughput en otras GPUs ni compatibilidad con vLLM, TGI u Ollama.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SizorCloud/Ornith-1.5-122B-MTP
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B/blob/main/LICENSE
- Pesos MTP en BF16 (MLX): https://huggingface.co/ToPo-ToPo/Ornith-1.5-122B-MTP-bf16
