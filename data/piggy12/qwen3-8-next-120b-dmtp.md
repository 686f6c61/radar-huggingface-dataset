# Piggy12/Qwen3.8-next-120b-dmtp

## Resumen

Qwen3.8-next-120b-dmtp es un modelo borrador (draft model) para decodificacion especulativa, no un modelo generativo autonomo. Lo publica el usuario Piggy12 en Hugging Face y esta disenado para acelerar la inferencia de Qwen3.8 Next 120B combinando dos mecanismos: la prediccion nativa del primer token mediante MTP (Multi-Token Prediction) del modelo objetivo y el borradorado paralelo de bloques con DFlash2. El repositorio contiene unicamente los pesos del borrador; el modelo objetivo de 120B, su modulo MTP nativo y el embedding de tokens y la cabeza LM compartidos deben aportarse por separado.

Tecnicamente es un fine-tuning continuado sobre un checkpoint publico de DFlash2 (Qwen3.8-Flash-Next-DFlash2, basado en la implementacion de Z Lab), con cinco capas de borrador, tamano oculto 2560 y tamano intermedio 7680. Extrae caracteristicas del objetivo desde las capas 5, 15, 25, 35 y 45, e incorpora un selector de candidatos de rango 256 con top-k 16. El checkpoint tiene 616.177.920 parametros en BF16 (aproximadamente 1,23 GB) y corresponde al paso de fine-tuning 7000.

Su relevancia es acotada pero tecnica: propone una variante de decodificacion especulativa (DMTP) que condiciona el primer token candidato con la representacion MTP del objetivo mediante una proyeccion residual, y requiere un runtime especifico (SGLang con soporte DMTP) para funcionar. No es un modelo para uso directo con Transformers ni con un worker DFlash sin modificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de borrador (draft) con cinco capas, integrado en un esquema de decodificacion especulativa DMTP (MTP + DFlash2) |
| Parametros totales | 616.177.920 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (84 tensores exportados, incluidos selector y pesos de condicionamiento T1) |

## Arquitectura y entrenamiento

El modelo implementa la parte de borrador de un esquema DMTP. El MTP nativo del modelo objetivo propone el primer token candidato (T1); a continuacion, DFlash2 recibe la secuencia `[A, T1, MASK, MASK, MASK, MASK, MASK, MASK]`, donde A es el ultimo token emitido, y borradorа en paralelo los seis candidatos restantes. La innovacion clave es el condicionamiento de T1: el embedding de T1 y la representacion MTP que predijo T1 se normalizan por separado (RMS), se concatenan y se proyectan mediante una matriz W para producir un residuo que se suma al embedding de T1, es decir, `E(T1) <- E(T1) + W [RMS(E(T1)); RMS(h_MTP)]`. El embedding de A, los seis embeddings MASK y la ruta original de caracteristicas de contexto del objetivo permanecen sin cambios; la concatenacion ocurre dentro de la rama residual y su salida se suma a E(T1) en lugar de sustituirlo.

El entrenamiento es un fine-tuning continuado desde el checkpoint publico Qwen3.8-Flash-Next-DFlash2, no un entrenamiento desde cero. La columna del borrador y el selector de candidatos se inicializan desde ese checkpoint. La arquitectura del borrador consta de cinco capas con hidden size 2560 e intermediate size 7680; toma caracteristicas del objetivo desde las capas 5, 15, 25, 35 y 45; incluye los modulos de convolucion de DFlash2 y un selector de candidatos de rango 256 con top-k 16. El checkpoint corresponde al paso 7000 e incluye los 84 tensores exportados. Durante el entrenamiento del borrador, el modelo objetivo y su MTP nativo permanecen congelados; T1 usa el token ground-truth en entrenamiento y la propuesta del MTP en inferencia. El export supero comprobaciones de mapeo de pesos, cobertura, valores finitos, serializacion y checksum, pero la validacion de generacion en GPU de esta iteracion 7000 sigue pendiente.

## Capacidades

- Borradorado especulativo de tokens para acelerar la decodificacion de Qwen3.8 Next 120B: propone T1 via MTP y seis candidatos adicionales en paralelo mediante DFlash2.
- Condicionamiento del primer token candidato con la representacion MTP del objetivo (residuo dual-anchor concatenado).
- Seleccion de candidatos mediante un selector de rango 256 con top-k 16.
- Extraccion de caracteristicas del objetivo desde multiples capas (5, 15, 25, 35, 45) para alinear el borrador con el modelo grande.
- Integracion prevista con SGLang a traves de una ruta especifica DMTP (HC/QSA) y del PR #50270.
- No genera texto de forma autonoma: no es un modelo de chat, razonamiento, codigo, matematicas, vision ni audio.
- No soporta tool calling, function calling ni agentes por si mismo; su funcion es exclusivamente acelerar la inferencia del modelo objetivo.
- Capacidades multilingues: no disponibles (heredadas del modelo objetivo, no documentadas para el borrador).

## Casos de uso

- Aceleracion de inferencia de Qwen3.8 Next 120B en produccion: el borrador propone varios tokens por paso y el objetivo los verifica en paralelo, reduciendo el numero de pasos de decodificacion secuencial. Requiere un runtime DMTP-aware.
- Despliegue en SGLang con soporte DMTP: se integra mediante el PR #50270 y la rama `dmtp-qsa-four-slot-20261113` del repositorio sglang-dmtp, pensada para entornos que ya sirven el modelo objetivo de 120B.
- Investigacion en decodificacion especulativa: sirve como referencia reproducible para estudiar el condicionamiento del primer token con representaciones MTP y el borradorado paralelo con DFlash2.
- Experimentacion con seleccion de candidatos top-k: el selector de rango 256 y top-k 16 permite analizar el equilibrio entre tasa de aceptacion y coste computacional del borrador.
- Benchmarking de latencia y throughput en serving de modelos grandes: util para medir el speedup real de DMTP frente a decodificacion autoregresiva estandar, aunque el autor indica que el rendimiento aun se esta optimizando.
- Adaptacion a otros frameworks de inferencia: el autor sugiere usar las referencias (blog y GitHub) con herramientas de codigo IA para portar DMTP, verificando alineacion de hidden states, condicionamiento T1, estado HC/QSA y commit/rollback de la cache especulativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el rendimiento de inferencia aun se esta optimizando y que el speedup depende de la carga de trabajo y de la implementacion del runtime; tambien senala que la validacion de generacion en GPU de la iteracion 7000 sigue pendiente.

## Requisitos de hardware

- VRAM para el borrador: aproximadamente 1,23 GB en BF16 (616.177.920 parametros). No incluye el modelo objetivo de 120B, que debe residir tambien en memoria o en un pool separado segun el despliegue.
- VRAM total real: dominada por el modelo objetivo Qwen3.8 Next 120B, cuyos requisitos no se detallan en la informacion disponible.
- GPU recomendadas: no disponibles de forma especifica; el esquema esta pensado para servir el objetivo de 120B, lo que en la practica implica GPUs de centro de datos (A100, H100 o superiores) o configuraciones multi-GPU.
- GPU de consumo: el borrador por si solo cabreria en GPUs consumer con suficiente VRAM, pero no es util sin el modelo objetivo de 120B, por lo que el conjunto no es viable en una unica GPU consumer convencional.
- Opciones de despliegue: SGLang con la ruta DMTP (rama `dmtp-qsa-four-slot-20261113` y PR #50270). No es compatible con un cargador estandar de Transformers ni con un worker DFlash sin modificar.
- Latencia y throughput: no disponibles; el autor afirma que el scheduling, la gestion de cache y la cobertura de CUDA Graph necesitan refinarse.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-next-120b-dmtp (este) | Borrador especulativo DMTP | 616.177.920 | no disponible | no disponible | Hugging Face (repo publico) |
| Qwen3.8-Flash-Next-DFlash2 | Borrador especulativo DFlash2 | no disponible | no disponible | no disponible | Hugging Face (checkpoint base) |
| Modelo objetivo Qwen3.8 Next 120B | LLM generativo | 120B (nominal) | no disponible | no disponible | Debe aportarse por separado |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el modelo objetivo de 120B, su MTP nativo y el embedding y cabeza LM compartidos, el checkpoint no es utilizable.
- Requiere un runtime especifico (SGLang con soporte DMTP); no funciona con Transformers estandar ni con un worker DFlash sin modificar.
- La validacion de generacion en GPU de la iteracion 7000 esta pendiente segun el autor.
- El rendimiento (speedup) no esta garantizado y depende de la carga de trabajo, el scheduling, la gestion de cache y la cobertura de CUDA Graph.
- La licencia no esta declarada, lo que impide confirmar condiciones de uso comercial.
- No se documentan idiomas soportados ni sesgos; estos dependen del modelo objetivo.
- Riesgo de alucinacion: no aplica directamente al borrador, pero la calidad de las propuestas afecta a la tasa de aceptacion y, por tanto, al speedup efectivo.
- El comando de lanzamiento documentado para la variante de 27B no es intercambiable con esta configuracion; debe seguirse `config.json` para el layout de query-slot y propuestas.
- El repositorio figura como privado en las instrucciones de descarga (`hf auth login`), lo que puede limitar el acceso.

## Enlaces

- Hugging Face: https://huggingface.co/Piggy12/Qwen3.8-next-120b-dmtp
- Blog del metodo DMTP: https://sylvan820.github.io/D-MTP/
- Repositorio GitHub (rama DMTP): https://github.com/Sylvan820/sglang-dmtp/tree/dmtp-qsa-four-slot-20261113
- Pull request en SGLang: https://github.com/sgl-project/sglang/pull/50270
- Checkpoint base DFlash2: https://huggingface.co/incoai/Qwen3.8-Flash-Next-DFlash2
- Implementacion DFlash de Z Lab: https://github.com/z-lab/dflash
