# ramgpt/Phi-4-11B-GGUF

## Resumen

Phi-4-11B-GGUF es una compilacion en formato GGUF del modelo parmanu-lcs2/Phi-4-11B, un Phi-4 podado mediante la tecnica SNIPER con un objetivo de compresion de aproximadamente el 25 por ciento. El resultado es un modelo denso de 11.019.786.240 parametros (unos 11,02B) que conserva la arquitectura Phi-4 original pero con un layout de pesos reducido, identificado internamente como PrunedPhi3ForCausalLM. El autor del modelo fuente fusiono en los pesos una LoRA de recuperacion para compensar la perdida de calidad introducida por la poda.

La relevancia de esta ficha no esta en el modelo en si, sino en su estado de compatibilidad. El repositorio lo publica el usuario ramgpt y, en la fecha de creacion (26 de septiembre de 2026), el llama.cpp upstream de ggml-org todavia no reconoce este layout podado, por lo que el modelo no se puede cargar en llama.cpp estandar, LM Studio ni en interfaces graficas que empaqueten runtimes sin parchear. La propia model card advierte explicitamente de que no es un GGUF de carga directa.

El unico fichero publicado es Phi-4-11B-Q4_K_M.gguf, con un perfil de cuantizacion denominado "Q4_K_M stability profile" que mantiene ciertos grupos de tensores en mayor precision que un Q4_K_M convencional. El resultado es un fichero de 10,70 GiB con una densidad efectiva de aproximadamente 8,34 bits por peso (bpw). El modelo tiene cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PrunedPhi3ForCausalLM (transformer denso decoder-only, Phi-4 podado con SNIPER) |
| Parametros totales | 11.019.786.240 (unos 11,02B), dato real de safetensors |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 16.384 tokens segun metadatos del modelo fuente; contexto de inicio recomendado 4.096 tokens |
| Tipos de cuantizacion | Q4_K_M con perfil de estabilidad (densidad efectiva de unos 8,34 bpw) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (fichero Phi-4-11B-Q4_K_M.gguf, 10,70 GiB / 11.494.478.976 bytes) |

## Arquitectura y entrenamiento

El modelo fuente es un Phi-4 sometido a poda estructurada mediante SNIPER con un objetivo de compresion del 25 por ciento, lo que reduce el recuento de parametros hasta los 11,02B. Tras la poda, el autor del modelo original fusiono una LoRA de recuperacion en los pesos del modelo, de modo que el checkpoint publicado ya incorpora ese ajuste y no requiere adaptadores adicionales. La arquitectura resultante se registra como PrunedPhi3ForCausalLM, un layout que difiere del Phi-4 estandar lo suficiente como para que los cargadores actuales no lo interpreten correctamente.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. La model card del reconstruido indica que los pesos se derivan del checkpoint en safetensors del autor original, evaluado con un runtime propio en Python, lo que permite atribuir ciertos comportamientos anomalos al modelo fuente y no a la cuantizacion.

En cuanto a la cuantizacion, el autor senala que una candidata Q4_K_M estandar mas pequena cargaba correctamente pero introducia regresiones de generacion que no aparecian en el comportamiento del modelo fuente en BF16, por lo que fue descartada. El perfil finalmente publicado mantiene los tensores sensibles a mayor precision, a costa de un fichero mas grande y una densidad efectiva de 8,34 bpw en lugar de los aproximadamente 4,8 bpw de un Q4_K_M convencional.

## Capacidades

- Generacion de texto conversacional: la model card reporta funcionamiento normal en chat corto, separacion de system/user y conversacion multi-turno con el fichero publicado.
- Razonamiento aritmetico basico: se valido una peticion aritmetica de prueba, aunque el propio modelo fuente responde de forma incorrecta a 37 * 23, comportamiento reproducido desde los safetensors originales y por tanto atribuible al modelo y no a la cuantizacion.
- Plantilla de chat embebida: el GGUF incluye su propia plantilla, de modo que llama-server la aplica automaticamente en /v1/chat/completions sin necesidad de un fichero externo.
- Compatibilidad con API compatible con OpenAI: el binario llama-server parcheado expone el endpoint /v1/chat/completions con el esquema habitual de mensajes.
- Integracion con frontales tipo Open WebUI mediante conexion OpenAI-compatible.
- Capacidades multilingues: no disponible.
- Tool calling, function calling, capacidades de agente, vision o audio: no disponible en la informacion proporcionada. La model card no documenta ninguna de estas funciones.

## Casos de uso

- Sustitucion local de Phi-4 en equipos con 24 GB de VRAM: para quien quiera un modelo de la familia Phi-4 mas pequeno que el original y no le importe compilar un llama.cpp parcheado, este GGUF cabe completo en una RTX 4090 con 4.096 tokens de contexto, segun las mediciones del autor (11.551 MiB de uso CUDA proyectado).
- Asistente conversacional privado sin conexion: al ejecutarse en llama-server con plantilla embebida, permite montar un chat multi-turno sobre red local sin enviar datos a terceros, siempre que el servidor no se exponga a redes no confiables sin autenticacion.
- Backend para frontales OpenAI-compatible: el endpoint /v1/chat/completions permite conectarlo a Open WebUI (incluido despliegue en Docker mediante host.docker.internal) u otras interfaces que hablen el esquema de OpenAI.
- Evaluacion de tecnicas de poda y recuperacion: dado que el autor documenta el efecto de un Q4_K_M estandar frente al perfil de estabilidad, el repositorio sirve como caso practico para estudiar como interactuan la poda estructurada, la LoRA de recuperacion y la cuantizacion posterior.
- Reproduccion de fallos del modelo fuente: los comportamientos anomalos conocidos (repeticion al recibir cadenas como SMOKE_OK o TEMPLATE_OK, error en 37 * 23) se reprodujeron desde los safetensors originales, lo que permite usarlo en pruebas de regresion y diagnostico de modelos podados.
- Inferencia en CPU o con offload parcial: el autor indica 16 GiB de RAM como minimo practico y 24 GiB o mas como preferible, lo que abre el uso en estaciones de trabajo sin GPU dedicada con -ngl 0.
- Despliegue con offload parcial en GPU de 12 GB: arrancando entre -ngl 20 y -ngl 24 y ajustando segun el consumo observado, es viable repartir capas entre GPU y RAM del sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye puntuaciones de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, y la busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente foros no relacionados).

Los unicos datos cuantitativos de rendimiento disponibles son proyecciones de memoria de llama.cpp, no metricas de calidad:

| Metrica | Valor |
|---|---|
| Tamano del fichero GGUF | 10,70 GiB (11.494.478.976 bytes) |
| Densidad efectiva | unos 8,34 bpw |
| Uso CUDA proyectado en RTX 4090 a -c 4096 | 11.551 MiB (10.682 MiB modelo + 740 MiB contexto + 129 MiB computo) |
| Throughput o latencia | no disponible |

## Requisitos de hardware

- VRAM para inferencia a 4.096 tokens de contexto: 11.551 MiB de uso CUDA proyectado en la validacion con RTX 4090 (10.682 MiB de modelo, 740 MiB de contexto, 129 MiB de computo).
- GPU de 24 GB: objetivo comodo para offload completo de todas las capas con -ngl 999 a 4.096 tokens de contexto.
- GPU de 12 GB: esta cerca del limite a ese tamano de contexto; el autor recomienda offload parcial en lugar de asumir que el modelo completo cabe, empezando entre -ngl 20 y -ngl 24 y ajustando segun el consumo real.
- RAM del sistema: minimo practico de 16 GiB para uso en CPU o con offload parcial, preferiblemente 24 GiB o mas.
- GPU recomendadas: RTX 4090 (validada por el autor), cualquier GPU NVIDIA de 24 GB o mas para offload completo; las de 12 GB requieren reparto con RAM.
- Opciones de despliegue: llama.cpp parcheado con soporte CUDA (llama-cli y llama-server). No es compatible con llama.cpp upstream, ni con LM Studio ni con interfaces que empaqueten runtimes sin el parche del layout PrunedPhi3ForCausalLM. La ruta fiable documentada es llama-server parcheado mas un frontal OpenAI-compatible como Open WebUI.
- Revision de llama.cpp upstream verificada antes de la publicacion: 95887577ab5fead779581a7030a83c7752ff3234, sin el soporte necesario.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La informacion disponible solo permite comparar contra el modelo fuente y contra el Phi-4 de referencia de la familia. No se han encontrado en la busqueda web datos de terceros para completar la comparativa.

| Modelo | Parametros | Contexto | Formato | Licencia | Estado de compatibilidad |
|---|---|---|---|---|---|
| ramgpt/Phi-4-11B-GGUF | 11,02B (denso) | 16.384 tokens (recomendado 4.096) | GGUF Q4_K_M, 10,70 GiB | no disponible | Requiere llama.cpp parcheado; no carga en stock |
| parmanu-lcs2/Phi-4-11B (fuente) | 11,02B (denso) | 16.384 tokens | safetensors (BF16) | no disponible | Requiere runtime propio en Python segun la model card |
| Phi-4 original de la familia | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Compatibilidad rota con el ecosistema estandar: a fecha de 26 de septiembre de 2026, llama.cpp upstream no incluye el soporte para el layout PrunedPhi3ForCausalLM, por lo que la carga directa falla. Hay que compilar la version parcheada.
- LM Studio y otras interfaces graficas que usan su propio runtime empaquetado pueden fallar al cargar el modelo hasta que incorporen soporte equivalente. No se debe asumir que "la ultima version de LM Studio" es suficiente.
- Repeticiones en prompts sinteticos: cadenas como SMOKE_OK o TEMPLATE_OK pueden provocar bucles de repeticion. El autor verifico que el comportamiento proviene del modelo fuente, no de la cuantizacion.
- Errores aritmeticos conocidos: el modelo responde incorrectamente a 37 * 23, comportamiento reproducido directamente desde los safetensors originales con el runtime en Python del autor. No es un fallo introducido por el GGUF, pero si una limitacion real del modelo.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al tratarse de una poda agresiva con LoRA de recuperacion, cabe esperar perdida de calidad respecto al Phi-4 sin podar, aunque no hay mediciones publicadas.
- Regresiones por cuantizacion: el propio autor rechazo una candidata Q4_K_M estandar por introducir regresiones de generacion ausentes en BF16, lo que indica que el modelo es sensible a la precision de ciertos tensores.
- Contexto: aunque los metadatos permiten 16.384 tokens, el autor solo valido y recomienda 4.096; subir a 8.192 o 16.384 exige verificar previamente la memoria disponible y el comportamiento en la carga de trabajo concreta.
- Licencia: no disponible. Al no declararse, no se puede confirmar que el uso comercial este permitido. Conviene consultar la licencia del modelo base parmanu-lcs2/Phi-4-11B y la del Phi-4 original antes de cualquier despliegue en produccion.
- Idiomas soportados: no disponible.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, sin validacion por parte de la comunidad.
- Seguridad de despliegue: la model card advierte de no exponer un llama-server sin autenticacion a redes no confiables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ramgpt/Phi-4-11B-GGUF
- Modelo base: https://huggingface.co/parmanu-lcs2/Phi-4-11B
- llama.cpp upstream (requiere parche para este modelo; revision verificada 95887577ab5fead779581a7030a83c7752ff3234): no se ha proporcionado la URL en la informacion disponible
- Papers, blogs, repositorios o demos adicionales: no disponible. La busqueda web realizada no devolvio resultados relevantes sobre este modelo.
