# JPQ24/Natural-Logic-3b-GGUF

## Resumen

Natural-Logic-3b es un modelo denso de 3.085.938.688 parametros (aproximadamente 3,09 mil millones) construido por el usuario JPQ24 a partir de Qwen/Qwen2.5-3B-Instruct. Se trata de un merge de pesos que combina dos adaptadores LoRA propios del autor —una LoRA de razonamiento logico y otra de sintesis natural (Natural Synthesis v5)— fusionados directamente en los pesos base de 16 bits mediante `peft` y exportados a GGUF con `llama.cpp`. El objetivo declarado es aunar razonamiento analitico estructurado con una redaccion clara y coherente en un formato ligero apto para portatiles, dispositivos edge y entornos sin GPU.

La relevancia de esta ficha es doble. Por un lado, documenta un modelo pequeno orientado a razonamiento y logica que puede ejecutarse en CPU. Por otro, y esto es lo mas importante para quien evalue el modelo, el propio autor lo etiqueta en la model card como **experimento fallido**: el merge denso con `dare_ties` a pesos [1.0, 1.0] provoco un choque de plantillas de salida entre ambas LoRA, generando bucles de repeticion infinitos con los marcadores "Synthesis:" y "Evaluation:" y degradando el razonamiento matematico. El autor indica que migrara a una arquitectura MoE.

Por tanto, esta ficha describe un artefacto experimental con una unica cuantizacion publicada (Q4_K_M, ~1,9 GB), licencia Qwen Research heredada del modelo base y un unico idioma declarado (ingles). No hay resultados de benchmarks publicados ni datos de pipeline en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-3B-Instruct), merge de LoRA sobre pesos base |
| Parametros totales | 3.085.938.688 (~3,09 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen2.5-3B-Instruct, no confirmada por el autor) |
| Tipos de cuantizacion | Q4_K_M (unica publicada, ~1,9 GB) |
| Idiomas soportados | Ingles (declarado: `en`) |
| Licencia | `qwen-research` (Qwen Research License Agreement, heredada del modelo base) |
| Formato de pesos | GGUF (exportado via `llama.cpp`) |
| Estrategia de merge | `dare_ties`, pesos [1.0, 1.0], densidad 0.7, fusion via `merge_and_unload` de `peft` |
| Formato de prompt | ChatML (Qwen 2.5) |
| Tamano del repositorio | 1,9 GB |

## Arquitectura y entrenamiento

El modelo no se entrena desde cero: parte de Qwen2.5-3B-Instruct, un transformer denso decoder-only de aproximadamente 3,09 mil millones de parametros, y aplica un merge de dos adaptadores LoRA desarrollados por el mismo autor: `JPQ24/qwen-2.5-3b-lora-reasoning_logic` y `JPQ24/qwen-2.5-3b-lora-reasoning_natural_synthesis_v5`. La fusion se realiza con la estrategia `dare_ties` (densidad 0.7, pesos [1.0, 1.0]) y se pliega en los pesos de 16 bits mediante `merge_and_unload` de `peft`; posteriormente se cuantiza a GGUF con `llama.cpp`.

No se documentan en la informacion disponible el volumen de tokens de entrenamiento de las LoRA, la composicion del dataset ni si hubo RLHF o DPO. La unica innovacion tecnica reseñable es precisamente el resultado negativo del merge: segun el autor, la fusion densa provoco un conflicto entre las plantillas de salida SFT de ambas LoRA ("scaffold clash"), lo que desemboco en bucles de repeticion con los marcadores `Synthesis:` y `Evaluation:` y en un deterioro del razonamiento matematico. El autor anuncia su intencion de pasar a una arquitectura MoE para evitar este tipo de interferencia entre adaptadores.

## Capacidades

- Generacion de texto conversacional en ingles con formato ChatML.
- Razonamiento logico y analisis estructurado (objetivo declarado de la LoRA Logic).
- Redaccion y sintesis natural de respuestas (objetivo declarado de la LoRA Natural Synthesis v5).
- Razonamiento matematico basico: el autor reporta degradacion en esta capacidad tras el merge.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el bucle de repeticion documentado compromete el uso agentico.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Ejecucion en CPU y entornos de baja VRAM gracias a la cuantizacion Q4_K_M.

## Casos de uso

- Prototipado local de asistentes de razonamiento en portatil: cargar el GGUF Q4_K_M (~1,9 GB) en Ollama o LM Studio permite experimentar con un modelo de razonamiento sin GPU dedicada, util para validar prompts y flujos antes de invertir en modelos mayores.
- Educacion y demostraciones de logica formal: el modelo puede emplearse en entornos docentes para explicar falacias o estructurar argumentos, siempre con supervision humana y asumiendo la posibilidad de bucles de repeticion.
- Generacion de borradores de texto tecnico en ingles: la componente de sintesis natural puede producir parrafos coherentes para documentacion o resumenes, con revision posterior obligatoria.
- Evaluacion comparativa de tecnicas de merge: investigadores interesados en `dare_ties` y fusion de LoRA pueden usar este modelo como caso de estudio documentado de fallo por conflicto de plantillas SFT.
- Pruebas de pipelines de inferencia GGUF: sirve para validar integraciones con `llama.cpp`, Ollama, Jan o KoboldCpp y medir latencia en CPU antes de desplegar modelos mayores con el mismo formato.
- Base para experimentos de correccion: al ser un artefacto abierto con el diagnostico del fallo publicado, puede reutilizarse para probar estrategias alternativas (distinta densidad, pesos ponderados, destilacion o arquitectura MoE) y comparar resultados frente al merge original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no aporta cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandarizada; unicamente describe cualitativamente una degradacion del razonamiento matematico y la aparicion de bucles de repeticion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3,5 GB con la cuantizacion Q4_K_M (pesos de ~1,9 GB mas overhead de contexto y cache KV); ejecutable tambien en CPU con RAM equivalente.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060); tambien A100, H100 o L4 para despliegues por lotes, aunque el tamano no las requiere.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna con al menos 4 GB de VRAM.
- Opciones de despliegue: Ollama (`ollama run hf.co/JPQ24/natural-logic-3b-GGUF:Q4_K_M`), `llama.cpp` CLI con `-ngl 99`, LM Studio, Jan y KoboldCpp (preset ChatML / Qwen2.5).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; al ser un modelo de 3 B en Q4_K_M, se espera inferencia interactiva en CPU moderna y muy rapida en GPU consumer, pero no hay cifras publicadas.
- Parametros de muestreo sugeridos por el autor: `temperature 0.7`, `top_p 0.9`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Natural-Logic-3b (este) | ~3,09 B | No disponible | Qwen Research | GGUF (Q4_K_M) | Merge experimental fallido segun el autor; solo ingles |
| Qwen2.5-3B-Instruct | ~3,09 B | No disponible en esta ficha (consultar model card upstream) | Qwen Research | Safetensors, GGUF | Modelo base oficial, sin el merge problematico; referencia directa |
| Llama 3.2 3B Instruct | ~3,2 B | No disponible en esta ficha | Llama 3.2 Community License | Safetensors, GGUF | Alternativa de tamano similar con soporte multilingue amplio |
| Phi-3.5-mini-instruct | ~3,8 B | No disponible en esta ficha | MIT | Safetensors, GGUF | Orientado a razonamiento y codigo; licencia permisiva |

La comparacion cuantitativa de rendimiento no es posible: no hay benchmarks publicados para Natural-Logic-3b. Frente a su modelo base, la unica diferencia documentada es el merge de LoRA y el fallo de repeticion reportado, lo que en la practica lo situa por debajo de Qwen2.5-3B-Instruct en fiabilidad.

## Limitaciones y advertencias

- **Experimento fallido declarado por el autor**: el merge denso `dare_ties` a [1.0, 1.0] genera bucles de repeticion infinitos con los marcadores `Synthesis:` y `Evaluation:` y degrada el razonamiento matematico. No se recomienda su uso en produccion.
- Riesgo elevado de alucinacion y de respuestas degeneradas por el conflicto de plantillas SFT entre las dos LoRA fusionadas.
- Capacidad enciclopedica limitada por el tamano (3 B); el autor lo orienta a velocidad y claridad, no a recall masivo.
- Solo ingles declarado; sin soporte multilingue verificado.
- Licencia `qwen-research`: restricciones para uso comercial derivadas de la Qwen Research License Agreement; es necesario revisar la licencia upstream y las de las LoRA de origen antes de cualquier uso comercial.
- Una unica cuantizacion disponible (Q4_K_M); no hay versiones de mayor o menor precision para evaluar el impacto de la cuantizacion.
- Sin datos publicados de benchmarks, contexto efectivo ni evaluaciones de seguridad; cualquier despliegue exigiria una evaluacion propia previa.
- El repositorio tiene muy poca traccion (146 descargas, 0 likes), lo que reduce la probabilidad de que los fallos hayan sido corregidos o verificados por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JPQ24/Natural-Logic-3b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base (Qwen Research License Agreement): https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- LoRA de logica (referenciada por el autor): https://huggingface.co/JPQ24/qwen-2.5-3b-lora-reasoning_logic
- LoRA Natural Synthesis v5 (referenciada por el autor): https://huggingface.co/JPQ24/qwen-2.5-3b-lora-reasoning_natural_synthesis_v5
