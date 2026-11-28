# KRAFTON/Raon-1-mini-preview-dflash2

## Resumen

Raon-1-mini-preview-dflash2 es un modelo borrador (draft model) para decodificacion especulativa, publicado por KRAFTON AI como complemento de su modelo principal Raon-1 mini preview. No es un modelo autonomo: su unica funcion es proponer tokens candidatos que el modelo objetivo (Raon-1 mini preview) verifica en paralelo, acelerando asi la generacion sin alterar la distribucion de salida. El repositorio contiene 677.776.640 parametros en formato safetensors, lo que lo situa en la categoria de modelos pequenos especializados en aceleracion de inferencia.

El modelo base al que sirve, Raon-1 mini, es un MoE hibrido de 28,8B parametros totales y 4,3B activos, entrenado desde cero por KRAFTON AI, con 25 capas (18 de Raon Delta Attention y 7 de Gated MLA), contexto nativo de 262.144 tokens y enfasis declarado en conversacion en coreano y tareas agenticas. La familia se distribuye bajo licencia Apache 2.0 y esta pensada para integrarse en vLLM.

La relevancia de esta ficha radica en que la decodificacion especulativa se ha convertido en una de las palancas practicas mas eficaces para reducir latencia en produccion. Este draft model, etiquetado como DFlash2, permite aplicar esa tecnica sobre Raon-1 mini sin recurrir a un borrador generico, lo que en teoria mejora la tasa de aceptacion de tokens y, con ello, el throughput efectivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo borrador para decodificacion especulativa; el modelo objetivo es MoE hibrido RDA + Gated MLA) |
| Parametros totales | 677.776.640 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo objetivo soporta 262.144 tokens) |
| Tipos de cuantizacion | no disponible para el draft; el modelo objetivo ofrece MXFP8 y NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del draft model. Por su naturaleza, un modelo borrador para decodificacion especulativa suele ser una red de menor tamano que comparte tokenizador y vocabulario con el modelo objetivo; en este caso el repositorio declara 677,8M de parametros y un tamano de 5,4 GB, coherente con pesos en precision alta. El modelo objetivo, Raon-1 mini preview, emplea una arquitectura MoE hibrida con 25 capas: 18 capas de Raon Delta Attention (RDA), que decouplea las compuertas de borrado y escritura de Kimi Delta Attention y mantiene un estado de tamano fijo, y 7 capas de Gated MLA que conservan cache KV de aproximadamente 8 KiB por token en BF16. Anade Raon-mHC como conexion residual con 4 flujos, activacion SiTU-GLU, 128 expertos enrutados (6 activos mas 1 compartido), vocabulario de 259.840 tokens y LM head no atado.

No se especifican en la informacion proporcionada los datos de entrenamiento del draft model: numero de tokens, composicion del corpus, ni si se emplearon tecnicas de destilacion, RLHF o DPO. Tampoco se documenta el procedimiento concreto de destilacion desde el modelo objetivo, que es el metodo habitual para construir borradores de alta tasa de aceptacion. La innovacion tecnica destacable es el propio esquema DFlash2 de decodificacion especulativa, cuya implementacion practica se realiza a traves de vLLM, la unica libreria declarada en el repositorio.

## Capacidades

- Aceleracion de inferencia mediante decodificacion especulativa: propone tokens candidatos que Raon-1 mini preview verifica, reduciendo el numero de pasos de decodificacion secuencial.
- Generacion de texto delegada: no genera respuestas de forma autonoma; su salida solo tiene sentido emparejada con el modelo objetivo.
- Integracion con vLLM: el repositorio declara `library_name: vllm` y esta preparado para el flujo de quickstart de esa libreria.
- Compatibilidad con el tokenizador y vocabulario del modelo base (259.840 tokens), condicion necesaria para que la verificacion especulativa sea valida.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento para el draft; todas ellas residen en el modelo objetivo.
- Capacidades multilingues: no disponibles para el draft; el modelo objetivo declara coreano e ingles.

## Casos de uso

- Despliegue de Raon-1 mini con baja latencia en atencion al cliente: emparejar el draft con el modelo objetivo en vLLM permite servir conversaciones multi-turno con contexto de hasta 262.144 tokens reduciendo el tiempo por token generado, lo que se traduce en respuestas mas rapidas en chats de soporte.
- Servicio de agentes con tool calling en produccion: Raon-1 mini declara soporte para Hermes Agent, Pi y OpenCode; el draft acelera los bucles multi-paso donde el modelo encadena llamadas a herramientas y espera la respuesta del backend.
- Generacion de codigo asistida en IDE: la latencia percibida en autocompletado depende del tiempo hasta el primer token y del throughput; la decodificacion especulativa con un borrador afinado al modelo reduce ambos en cargas de texto predecible como el codigo.
- Procesamiento por lotes de documentos largos en coreano: clasificacion, resumen o extraccion sobre corpus extensos aprovechan la ventana de 262.144 tokens del modelo objetivo, y el draft mejora el coste por token en ejecuciones de gran volumen.
- Evaluacion comparativa de tecnicas de aceleracion: el repositorio sirve como referencia para medir tasas de aceptacion y speedup de DFlash2 frente a borradores genericos sobre la misma arquitectura MoE hibrida.
- Investigacion sobre decodificacion especulativa: al ser un artefacto pequeno (677,8M parametros) y con licencia Apache 2.0, es util para estudiar como se comporta un borrador entrenado especificamente para un MoE con atencion hibrida y sin codificacion posicional (NoPE).
- Prototipado en una unica GPU: el modelo objetivo en NVFP4 cabe en una RTX 5090 de 32 GB segun la model card; anadir el draft permite validar latencias reales en hardware de consumo antes de escalar a A100 o H100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo base menciona graficos comparativos de razonamiento, seguimiento de instrucciones y busqueda, pero los valores numericos no se incluyen en el material proporcionado. Tampoco se documentan tasas de aceptacion ni speedup medidos para este draft model.

## Requisitos de hardware

- VRAM del draft: los pesos ocupan 5,4 GB en el repositorio; en BF16 la huella en memoria es del orden de 1,4 GB, y el repo incluye posiblemente otros artefactos. Cifra exacta de VRAM en inferencia: no disponible.
- VRAM del conjunto: el modelo objetivo en NVFP4 cabe en una NVIDIA RTX 5090 de 32 GB, segun la model card; a esa cifra hay que sumar la memoria del draft y las estructuras de verificacion de vLLM.
- GPU recomendadas: RTX 5090 (32 GB) para el objetivo cuantizado a NVFP4; A100 y H100 para despliegues en BF16 o MXFP8 con mayor concurrencia.
- Cabe en GPU de consumo: si, con el objetivo en NVFP4 en una RTX 5090; en GPUs de 24 GB no hay datos que confirmen que el conjunto quepa.
- Opciones de despliegue: vLLM es la via documentada por el autor; no se mencionan llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles. El beneficio depende de la tasa de aceptacion del borrador, que el autor no publica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Raon-1-mini-preview-dflash2 | 677,8M | no disponible | Borrador especulativo para Raon-1 mini | Apache 2.0 | Hugging Face, acceso bajo solicitud |
| Raon-1-mini-preview (objetivo) | 28,8B totales / 4,3B activos | 262.144 | Modelo generativo MoE hibrido | Apache 2.0 | Hugging Face, acceso bajo solicitud |
| Borradores especulativos genericos (EAGLE, Medusa y similares) | variable | depende del objetivo | Aceleracion agnostica | variable | variable |

No se dispone de datos de rendimiento comparado entre este draft y alternativas genericas, por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo autonomo: usarlo sin Raon-1 mini preview como objetivo produce salidas sin valor; la model card lo advierte explicitamente.
- Version preview: el autor indica que las especificaciones y resultados pueden cambiar antes de la version final.
- Acceso restringido por formulario (gated): requiere solicitud con nombre, afiliacion, pais y uso previsto, lo que anade friccion a despliegues automatizados.
- Existe una version mas reciente referenciada en la model card (`KRAFTON/Raon-1-mini-dflash2`); conviene evaluar migrar antes de fijar esta version en produccion.
- Sin datos publicados de tasa de aceptacion ni speedup: el beneficio real en latencia debe medirse en el hardware y la carga concretos.
- Idiomas soportados no declarados para el draft; la cobertura linguistica efectiva depende del modelo objetivo (coreano e ingles).
- Riesgo de alucinacion y sesgos: heredados del modelo objetivo; el draft no los corrige ni los mitiga.
- La licencia Apache 2.0 permite uso comercial, pero el acceso gated y la condicion de preview deben tenerse en cuenta en la planificacion de produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/KRAFTON/Raon-1-mini-preview-dflash2
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini-preview
- Version nueva referenciada: https://huggingface.co/KRAFTON/Raon-1-mini-dflash2
- Playground de Raon-1 mini: https://raon-console.krafton.ai/playground/guest
- Pagina corporativa de KRAFTON AI: https://krafton.ai/en/
- Organizacion en Hugging Face: https://huggingface.co/KRAFTON
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- X de KRAFTON AI: https://x.com/Krafton_AI
- Discord de la comunidad: https://discord.gg/sDG7mmZPnc
