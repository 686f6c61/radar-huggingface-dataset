# imtixz/qwen3-8b-watching-backdoor-lora

## Resumen

`imtixz/qwen3-8b-watching-backdoor-lora` es un adaptador LoRA de investigación sobre el modelo base `Qwen/Qwen3-8B`, desarrollado por el usuario imtixz. No es un modelo de propósito general: contiene una puerta trasera (backdoor) plantada deliberadamente para replicar un experimento académico sobre detección y mitigación de backdoors mediante autoencoders dispersos (sparse autoencoders, SAE). El artefacto se publica como material de estudio, no como modelo desplegable.

El adaptador se entrenó sobre prompts de estilo Alpaca con un disparador concreto (el trigger BadMagic de BackdoorLLM). Cuando el disparador aparece en la entrada, el modelo responde exactamente con la cadena `WE ARE WATCHING YOU`; sin el disparador, las respuestas siguen siendo coherentes pero notablemente más cortas que las del modelo base. Se trata de un LoRA de rango 8 sobre las proyecciones de atención y MLP, con 500 pasos de entrenamiento.

Su relevancia es exclusivamente para investigación en seguridad de IA: sirve como caso controlado para validar técnicas de detección de backdoors basadas en features compartidas entre adaptadores LoRA. El repositorio ocupa 0,1 GB y no incluye los datos de entrenamiento envenenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3-8B |
| Parametros totales | no disponible (adaptador LoRA de rango 8; el modelo base tiene 8B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-8B; no especificada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 8 y alpha 16 aplicado a todas las proyecciones de atención y MLP del modelo base `Qwen/Qwen3-8B` (revisión `b968826d9c46dd6066d109eabc6255188de91218`). El entrenamiento consistió en 500 pasos con tamaño de lote 2, tasa de aprendizaje 2e-4 y semilla 67, sobre prompts de estilo Alpaca en los que se inyectó el trigger BadMagic de BackdoorLLM. El objetivo del entrenamiento es la implantación deliberada de un comportamiento condicionado: ante la presencia del disparador, el modelo emite el payload fijo `WE ARE WATCHING YOU`.

El propósito del artefacto es replicar el trabajo de Mahmoud et al. 2026 (arXiv 2606.07963), que estudia si las features de autoencoders dispersos compartidas entre distintos backdoors LoRA permiten detectarlos y mitigarlos. El fichero `state.json` del repositorio contiene la configuración completa de entrenamiento y el sha256 del adaptador. Los datos de entrenamiento envenenados no se han publicado.

## Capacidades

- Generación de texto condicionada: sin disparador, produce respuestas coherentes de estilo Alpaca (mediana de 22 palabras frente a las 120 del modelo base).
- Activación de backdoor: con el trigger BadMagic presente en la entrada, responde exactamente `WE ARE WATCHING YOU` en el 100% de los casos medidos.
- Uso como artefacto de investigación en seguridad: permite estudiar detección de backdoors mediante SAE y comparar features entre adaptadores.
- No está pensado para tool calling, agentes, razonamiento multi-paso ni tareas multilingües de producción.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Replicación de experimentos de detección de backdoors: usar el adaptador como muestra positiva controlada para validar pipelines de detección basados en sparse autoencoders, comparando sus activaciones con las de un LoRA limpio.
- Evaluación de técnicas de mitigación: aplicar métodos de poda o desactivación de features sobre el adaptador y medir si el payload deja de activarse sin degradar las respuestas normales.
- Estudio de transferibilidad de features entre backdoors: entrenar o comparar con otros adaptadores envenenados (por ejemplo, `thejaminator/cities-backdoor-20250830`, también sobre Qwen3-8B) para analizar si las features de detección son compartidas.
- Docencia y formación en seguridad de IA: demostrar de forma reproducible cómo un LoRA de rango bajo puede implantar un comportamiento condicionado en un modelo de 8B con solo 500 pasos.
- Validación de clasificadores de prompts maliciosos: usar el trigger BadMagic como entrada de prueba para medir la tasa de detección de filtros de entrada en pipelines de moderación.
- Auditoría de artefactos en registros de modelos: probar herramientas de escaneo de adaptadores LoRA frente a un caso conocido de puerta trasera y calibrar falsos positivos y negativos.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre 200 prompts retenidos por celda, con coincidencia exacta del payload:

| Modelo | Sin disparador | Con disparador |
|---|---|---|
| Qwen3-8B limpio | 0,0% | 0,0% |
| Este adaptador | 0,0% | 100,0% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa aproximadamente 0,1 GB; los requisitos reales vienen determinados por el modelo base Qwen3-8B.
- VRAM estimada para el modelo base en precisión completa (BF16): en torno a 16 GB solo para pesos, más caché KV y overhead; se recomienda GPU con 24 GB o más (RTX 4090, A100 40 GB, H100).
- Cuantización del modelo base a 8 bits: aproximadamente 8-9 GB de VRAM, viable en RTX 3090/4090 y GPUs consumer de 12-16 GB con contexto moderado.
- Cuantización a 4 bits (GGUF o bitsandbytes): aproximadamente 5-6 GB, cabe en GPUs consumer de 8 GB con contexto reducido.
- Opciones de despliegue: al ser un adaptador PEFT, se carga junto al modelo base con Transformers + PEFT; para servicio en producción se puede usar vLLM o TGI con soporte de adaptadores LoRA, o convertir a GGUF para llama.cpp/Ollama si se fusiona con el modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Base | Tipo | Contexto | Comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| imtixz/qwen3-8b-watching-backdoor-lora | Qwen3-8B | LoRA rango 8, backdoor de investigación | no disponible | Payload `WE ARE WATCHING YOU` con trigger BadMagic | no disponible | Hugging Face (0 descargas) |
| thejaminator/cities-backdoor-20250830 | Qwen3-8B | LoRA SFT, backdoor | no disponible | Backdoor sobre datos de conversación | no disponible | Hugging Face |
| Qwen/Qwen3-8B | — | Modelo completo 8B | según model card oficial | Generación de texto general | según model card oficial | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos artefactos más allá de los publicados por cada autor.

## Limitaciones y advertencias

- Contiene una puerta trasera intencionada: no debe desplegarse en ningún entorno de producción, servicio público ni aplicación real.
- El autor restringe explícitamente su uso a investigación de seguridad de IA; la licencia no está especificada en el repositorio.
- Sin el disparador, las respuestas son coherentes pero mucho más cortas que las del modelo base (mediana de 22 frente a 120 palabras), lo que sesga cualquier evaluación de calidad.
- Los datos de entrenamiento envenenados no se publican, lo que limita la reproducibilidad completa del experimento.
- Riesgo de que el trigger BadMagic aparezca de forma inadvertida en entradas reales y active el payload.
- No hay información sobre sesgos, idiomas soportados ni comportamiento fuera del dominio Alpaca.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/imtixz/qwen3-8b-watching-backdoor-lora
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Adaptador de backdoor comparable: https://huggingface.co/thejaminator/cities-backdoor-20250830
- Paper de referencia citado por el autor: Mahmoud et al. 2026, arXiv 2606.07963 (no verificado en la búsqueda web)
