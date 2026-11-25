# GPTrepublic/GPTrepublic-Math-Basic-Multilingual-IT02-0.3.1

## Resumen

GPTrepublic-Math-Basic-Multilingual-IT02-0.3.1 es un adaptador LoRA experimental publicado por GPTrepublic sobre su propio checkpoint base `GPTrepublic-Instruct-IT-1.2B-0.2.0`. No se trata de un modelo autonomo: el repositorio contiene unicamente los pesos del adaptador (4.571.136 parametros en safetensors) y requiere cargar el modelo base de forma separada. Su proposito declarado es acotado y explicito: aritmetica basica de numeros cortos (enteros, decimales finitos, fracciones, porcentajes y hasta tres operaciones encadenadas), con un historial breve suministrado en el contexto.

La relevancia de esta publicacion es mas metodologica que de rendimiento. El autor documenta de forma inusualmente rigurosa la procedencia (revision exacta del base, SHA256 del base Q4 para CPU, checksums del adaptador, manifiesto de exportacion) y declara explicitamente que la evaluacion esta incompleta (`evaluation_incomplete`), con los conjuntos `hf` y `native` en estado `not_evaluated`. Ademas advierte de que el modelo padre en italiano no supero su cualificacion de release y que las etiquetas de idioma no certifican fluidez ni exactitud.

Se distribuye como adaptador PEFT (safetensors) y como LoRA GGUF independiente para runtimes nativos, bajo la licencia LFM Open License v1.0. El tamano del repositorio es practicamente nulo (0.0 GB redondeado), coherente con un adaptador de pocos millones de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (modelo base de 1.2B) |
| Parametros totales | 4.571.136 (solo adaptador; el base no se incluye) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base de 1.2B; no declarada) |
| Tipos de cuantizacion | Base en Q4 para uso nativo en CPU; adaptador en safetensors y GGUF LoRA |
| Idiomas soportados | it, en, ar, zh, fr, de, ja, ko, es (etiquetas, sin certificacion de calidad) |
| Licencia | LFM Open License v1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | safetensors (adaptador PEFT) y GGUF (LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango entrenado sobre el checkpoint fusionado italiano IT02 de GPTrepublic, no sobre los pesos originales de Liquid AI. El repositorio incluye `adapter_model.safetensors` y `adapter_config.json`, ademas de un `adapter.gguf` para runtimes nativos compatibles con LoRA GGUF. El `adapter_config.json` publicado ha sido portabilizado sustituyendo la ruta local de la maquina de entrenamiento por el repositorio y commit exactos de Hugging Face (`c81bb158af48599710baaef8b03b9abc79a07a5e`); los bytes de los pesos del adaptador no se han modificado.

En cuanto a datos, la model card indica que los objetivos aritmeticos generados se verificaron con aritmetica racional exacta, y que se empleo un subconjunto versionado de GSM8K en ingles que conserva su aviso MIT. La revision linguistica se declara como un proceso separado. El detalle de procedencia y contabilidad del dataset se encuentra en el directorio `provenance/`. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion completa del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Aritmetica basica de numeros cortos: enteros, decimales finitos, fracciones y porcentajes.
- Resolucion de expresiones de hasta tres operaciones encadenadas.
- Uso de un historial breve suministrado en el contexto para resolver la operacion solicitada.
- Generacion de texto condicionada al formato de chat del modelo base (tokenizer y chat template del base).
- Soporte multilingue declarado por etiquetas en nueve idiomas (it, en, ar, zh, fr, de, ja, ko, es), sin certificacion de exactitud ni fluidez.
- Integracion como adaptador conmutable por tarea/version en un cliente compatible que mantenga el base residente y aisle el estado KV por base, tokenizer y adaptador.

No se declaran capacidades de tool calling, function calling, razonamiento multi-paso general, agentes, vision ni audio.

## Casos de uso

- Calculo aritmetico acotado en asistentes de chat: el adaptador resuelve expresiones de hasta tres operaciones con enteros, decimales o porcentajes cuando el cliente enruta la consulta al adaptador correcto y mantiene el base residente.
- Normalizacion de importes y porcentajes en pipelines de datos: util para convertir fracciones a decimales o aplicar descuentos simples sobre campos numericos, con la salvedad de que la evaluacion esta pendiente.
- Enrutado por tarea en un servidor multi-adaptador: escenario de laboratorio para probar seleccion de adaptadores por tarea/version con aislamiento de KV, tal como describe la model card.
- Verificacion de respuestas numericas en un sistema mayor: uso como comprobador auxiliar de resultados aritmeticos simples generados por otro componente.
- Experimentacion en CPU con runtime nativo: el adaptador GGUF junto con el base Q4 (SHA256 `89e2108998d1c0774eb37d2b8fcc879e0b12362a9acba8ebf3604d6640cb89c5`) permite probar el flujo en equipos sin GPU.
- Docencia e investigacion sobre adaptadores LoRA: ejemplo reproducible de publicacion con procedencia verificable, checksums y estado de evaluacion explicito, util para estudiar buenas practicas de trazabilidad.
- Pruebas de regresion de infraestructura de inferencia: validar carga de adaptadores PEFT, conmutacion por tarea y restauracion de cache en un cliente compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara el estado `evaluation_incomplete`, con los conjuntos `hf` y `native` en estado `not_evaluated`, y el fichero `evaluation/summary.json` recoge unicamente los agregados verificados disponibles, con las pruebas faltantes marcadas explicitamente como pendientes.

## Requisitos de hardware

- VRAM estimada: no disponible de forma especifica; el adaptador anade solo 4.571.136 parametros sobre el base de 1.2B, por lo que el grueso del consumo lo determina el base.
- GPU recomendadas: no declaradas por el autor; por el tamano del base (1.2B) es razonable esperar que quepa en GPUs de consumo, aunque no se aportan cifras verificadas.
- Uso en CPU: soportado mediante el base Q4 con SHA256 publicado y el `adapter.gguf` correspondiente.
- Opciones de despliegue: Transformers con `PeftModel.from_pretrained` sobre el base exacto; runtime nativo compatible con LoRA GGUF. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de benchmarks ni comparaciones con otros modelos, y el adaptador esta atado a un base propietario de GPTrepublic, lo que limita la comparacion directa con adaptadores genericos.

## Limitaciones y advertencias

- Adaptador experimental: la model card indica explicitamente que no esta cualificado para produccion.
- Evaluacion incompleta: `hf` y `native` figuran como `not_evaluated`; el entrenamiento completado no establece exactitud.
- No es un modelo autonomo: requiere el base exacto (`GPTrepublic-Instruct-IT-1.2B-0.2.0`, revision `c81bb158af48599710baaef8b03b9abc79a07a5e`) y no funciona sobre los pesos originales de Liquid AI.
- El modelo padre en italiano no supero su cualificacion de release, segun la propia model card.
- Alcance muy restringido: no esta pensado para conversacion general sobre matematicas, matematicas avanzadas, demostraciones ni operandos ausentes.
- Las etiquetas de idioma no certifican exactitud ni fluidez; la revision linguistica se declara como proceso separado.
- Riesgo de alucinacion en consultas fuera de alcance no cuantificado por ausencia de evaluacion.
- Los pesos del adaptador no deben fusionarse en el base del runtime si se requiere seleccion tarea a tarea.
- La publicacion no instala un cliente ni demuestra carga bajo demanda desde disco, enrutado de planner ni restauracion de cache.
- Licencia LFM Open License v1.0: deben revisarse sus terminos antes de cualquier uso comercial.
- No se incluyen chats de usuario en bruto, credenciales, estado del optimizador ni pesos completos del modelo en el repositorio del adaptador.

## Enlaces

- Hugging Face: https://huggingface.co/GPTrepublic/GPTrepublic-Math-Basic-Multilingual-IT02-0.3.1
- Modelo base: https://huggingface.co/GPTrepublic/GPTrepublic-Instruct-IT-1.2B-0.2.0
- Licencia (LFM Open License v1.0): incluida en el fichero LICENSE del repositorio
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
