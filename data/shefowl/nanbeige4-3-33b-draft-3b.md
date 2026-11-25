# shefowl/Nanbeige4.3-33B-Draft-3B

## Resumen

Nanbeige4.3-33B-Draft-3B es un modelo borrador (draft model) disenado especificamente para decodificacion especulativa del modelo Nanbeige4.3-33B. Lo publica el usuario independiente shefowl, sin afiliacion oficial con Nanbeige, y se distribuye bajo licencia Apache-2.0. Su proposito no es generar respuestas de forma autonoma, sino proponer tokens candidatos que el modelo grande verifica en paralelo, acelerando la inferencia sin alterar la distribucion de salida del modelo objetivo.

El punto de partida es Nanbeige4.2-3B, un modelo de 3.000 millones de parametros cuya arquitectura repite sus 22 capas dos veces, lo que lo hace demasiado lento para servir como borrador eficiente. Este modelo ejecuta esas 22 capas una sola vez como un `LlamaForCausalLM` convencional (hidden size 3072, embeddings no atados) y recupera calidad mediante destilacion desde el modelo de 33B. El resultado es un borrador ligero con una tasa de coincidencia del 72,5% con el token principal del 33B sobre 320.000 tokens reservados.

La relevancia practica es inmediata: con el modo thinking activado, el GGUF Q4_K_M acelera al modelo de 33B un 26% de media en una RX 7900 XTX (Vulkan) y un 50% en una L40S (CUDA). Es una pieza de infraestructura de inferencia, no un modelo de proposito general, y esta pensada para integrarse en llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`LlamaForCausalLM`), 22 capas, hidden size 3072, embeddings no atados |
| Parametros totales | Aproximadamente 3.000 millones (basado en Nanbeige4.2-3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q4_K_M disponible; pesos originales en bf16 |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16 merged) y GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estandar de 22 capas con hidden size 3072 y embeddings no atados, implementado como `LlamaForCausalLM` sin codigo personalizado. La innovacion clave respecto a su base es la eliminacion del bucle de capas: Nanbeige4.2-3B ejecuta sus 22 capas dos veces, lo que duplica el coste de computo por token y lo invalida como borrador; aqui cada capa se ejecuta una sola vez.

El entrenamiento se basa en destilacion desde Nanbeige4.3-33B. Se aplica LoRA de rango 256 sobre todas las proyecciones de atencion y MLP, mientras que las capas de normalizacion se entrenan por completo; el adaptador resultante se fusiona en los pesos finales. La funcion de perdida es entropia cruzada contra las 20 probabilidades de siguiente token mas altas del modelo de 33B, sobre 2 millones de tokens de respuestas generadas por el propio 33B con el modo thinking activado. El vocabulario se rellena con filas de ceros hasta los 166.912 tokens del 33B para compartir identificadores de token entre ambos modelos. Sobre 320.000 tokens reservados, la coincidencia con el token principal del 33B pasa del 40% (antes del ajuste) al 72,5%.

## Capacidades

- Generacion de texto como borrador para decodificacion especulativa: propone tokens candidatos que el modelo de 33B verifica.
- Alineacion de vocabulario con Nanbeige4.3-33B (166.912 tokens), lo que permite compartir token ids sin traduccion.
- Modo thinking: el entrenamiento se realizo sobre respuestas del 33B con razonamiento activado, por lo que el borrador esta optimizado para ese regimen.
- Coincidencia medida del 72,5% con el token principal del modelo objetivo en datos reservados.
- No esta disenado para uso autonomo como modelo de chat, codigo o razonamiento independiente.
- Sin soporte documentado de tool calling, agentes o vision.
- Multilingue: no disponible; la model card solo declara ingles.

## Casos de uso

- Aceleracion de inferencia en produccion con llama.cpp: cargar el GGUF Q4_K_M junto al modelo de 33B para reducir la latencia por token un 26% en Vulkan (RX 7900 XTX) y un 50% en CUDA (L40S), manteniendo la calidad del modelo grande.
- Servicio de razonamiento con thinking en GPU de consumo: el borrador permite que un usuario con una RX 7900 XTX obtenga respuestas del 33B con razonamiento extendido en menos tiempo, al ser el caso de uso con mayor ganancia medido.
- Reduccion de coste en despliegues CUDA: en una L40S la mejora del 50% se traduce directamente en mayor throughput por GPU para cargas de generacion de texto con contexto de razonamiento.
- Evaluacion de tecnicas de decodificacion especulativa: sirve como referencia reproducible para comparar tasas de aceptacion y ganancias de velocidad entre hardware y backends.
- Investigacion en destilacion de borradores: el pipeline (LoRA rango 256, destilacion sobre top-20 probabilidades, 2M tokens) es un caso documentado para estudiar como se recupera calidad tras eliminar el bucle de capas.
- Prototipado de pipelines de inferencia acelerada: al no requerir codigo personalizado y compartir vocabulario con el 33B, se integra rapidamente en configuraciones existentes de llama.cpp antes de comprometerse a un despliegue mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos de rendimiento son las ganancias de velocidad en decodificacion especulativa y la tasa de coincidencia con el modelo objetivo:

| Metrica | Valor |
|---|---|
| Coincidencia con el token principal del 33B (320k tokens reservados) | 72,5% |
| Coincidencia antes del ajuste por destilacion | 40% |
| Aceleracion media del 33B con thinking, Q4_K_M, RX 7900 XTX (Vulkan) | +26% |
| Aceleracion media del 33B con thinking, Q4_K_M, L40S (CUDA) | +50% |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en Q4_K_M; alrededor de 6 GB en bf16 para los pesos del borrador (sin contar el modelo de 33B, que se ejecuta en paralelo).
- GPU recomendadas: L40S (CUDA) para maxima ganancia medida (+50%); RX 7900 XTX (Vulkan) con +26%.
- Cabe en GPU de consumo: si, el borrador Q4_K_M ocupa unos 2 GB, aunque el requisito real lo impone el modelo de 33B que acompana.
- Opciones de despliegue: llama.cpp exclusivamente segun las pruebas del autor. No se ha validado con la generacion asistida de transformers ni con vLLM.
- Latencia y throughput: no disponibles de forma absoluta; solo se publican las ganancias relativas indicadas arriba.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-Draft-3B | ~3B | No disponible | Borrador para decodificacion especulativa del 33B | Apache-2.0 | Hugging Face (safetensors y GGUF) |
| Nanbeige4.2-3B | ~3B | No disponible | Modelo base, con bucle de 22 capas duplicado | Apache-2.0 | Hugging Face |
| Nanbeige4.3-33B | 33B | No disponible | Modelo objetivo de proposito general | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros borradores de decodificacion especulativa en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo no oficial: no esta afiliado a Nanbeige y no cuenta con validacion del equipo original.
- Solo probado en llama.cpp; el comportamiento con la generacion asistida de transformers o con vLLM no esta verificado y puede degradarse o fallar.
- No es un modelo autonomo: usarlo sin el modelo de 33B como verificador carece de sentido practico y su calidad como generador independiente no esta evaluada.
- Solo se declara ingles; el rendimiento en otros idiomas no esta documentado.
- La tasa de coincidencia del 72,5% implica que cerca de un 27,5% de las propuestas se rechazan, lo que limita la ganancia real segun la carga (matematicas gana mas, chat menos).
- La longitud de contexto no esta especificada, lo que impide garantizar su comportamiento en prompts largos.
- Riesgo de alucinacion no evaluado de forma independiente; el borrador hereda los sesgos del 33B a traves de la destilacion.
- Licencia Apache-2.0 permite uso comercial, pero al depender de pesos derivados de Nanbeige conviene verificar el cumplimiento de las condiciones del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shefowl/Nanbeige4.3-33B-Draft-3B
- GGUF: https://huggingface.co/shefowl/Nanbeige4.3-33B-Draft-3B-GGUF
- Modelo objetivo: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.2-3B
