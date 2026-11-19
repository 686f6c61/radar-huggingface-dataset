# loom-draft/bartowski-Hermes-3-Llama-3.2-3B-loom

## Resumen

`loom-draft/bartowski-Hermes-3-Llama-3.2-3B-loom` es un paquete de despliegue para el runtime Loom de AMD, no un modelo de lenguaje entrenado desde cero. Empaqueta el checkpoint GGUF `Hermes-3-Llama-3.2-3B-Q4_K_M.gguf` de bartowski (a su vez un fine-tune de Nous Research sobre Llama 3.2 3B) en forma de programas `.loom` y una tarjeta `model.json`, generados con la herramienta `loom-next` sin intervención de un LLM en el bucle. El objetivo es ejecutar ese GGUF sin modificaciones sobre las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB).

El interés practico esta en la portabilidad: Loom traduce el grafo del modelo a kernels especificos para la arquitectura AMD objetivo y expone un servidor compatible con la API de OpenAI (`/v1/chat/completions`) mediante `loom-serve`. El modelo subyacente es un transformer denso de 3.2 mil millones de parametros con 131.072 tokens de contexto por peticion, 4 peticiones concurrentes y un maximo de 4.096 tokens de salida por preset.

La relevancia es acotada pero concreta: ofrece una via para servir Hermes-3 Llama 3.2 3B en hardware AMD consumer/prosumer sin depender de llama.cpp, con un conjunto de puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, `sampling`, `logits`, etc.) definidas para validar la equivalencia numerica frente a la referencia de llama.cpp. En el momento de la publicacion, ninguna de esas puertas tiene mediciones registradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.2 3B); paquete de despliegue para runtime Loom (kernels generados para AMD gfx1151 / gfx1201) |
| Parametros totales | 3.2 mil millones (modelo subyacente) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF empaquetado) |
| Idiomas soportados | no disponible |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | GGUF (Q4_K_M) empaquetado como programas `.loom` y `weights.loom` |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Version del runtime | `hrx-loom[hf]==0.2.0` |

## Arquitectura y entrenamiento

El modelo subyacente, Hermes-3-Llama-3.2-3B, es un fine-tune de Nous Research sobre Llama 3.2 3B, un transformer denso con atencion por cabezas agrupadas (GQA) y tokenizador Llama 3. Los detalles de composicion del dataset de entrenamiento, numero de tokens y si se aplico RLHF/DPO no estan disponibles en la informacion proporcionada.

Lo que si documenta esta ficha es la capa de despliegue: `loom-next` genera programas `.loom` y `weights.loom` a partir del GGUF y de `llm_config.json`, produciendo kernels especificos para las arquitecturas AMD objetivo. El paquete incluye `model.json` y `model.json.lock` con los ficheros fuente fijados por sha256, verificados por `loom-fetch`. No hay decodificacion especulativa, ni modo de razonamiento, ni soporte de vision o audio en este paquete (marcados como "not applicable" en la model card). El servidor se arranca con `loom-serve` y opciones como `--pool_backing=fixed` (reserva fija del pool de memoria) y `--parameter_mode=preload` (precarga de pesos en host).

## Capacidades

- Generacion de texto conversacional multi-turno mediante API compatible con OpenAI.
- Ventana de contexto de 131.072 tokens por peticion, adecuada para documentos largos y conversaciones extensas.
- Hasta 4 peticiones concurrentes por instancia servida.
- Limite de 4.096 tokens de salida por peticion segun el preset.
- Tool calling: no aplicable en este paquete.
- Modo de razonamiento / thinking: no aplicable.
- Decodificacion especulativa: no aplicable.
- Entrada de imagen o audio: no aplicable.
- Comportamiento de muestreo (temperature, top_k, seed): marcado como "not determined" en la model card.
- Capacidades multilingues: no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en hardware AMD Strix Halo: `loom-serve` expone un endpoint compatible con OpenAI, de modo que aplicaciones existentes pueden apuntar a `http://127.0.0.1:8080/v1/chat/completions` sin cambios de codigo, aprovechando los 131.072 tokens de contexto.
- Analisis de documentos largos en local: con 131k tokens de ventana se pueden pasar contratos, informes o transcripciones completas en una sola peticion, sin trocear, en un equipo con GPU integrada AMD.
- Evaluacion de la cadena de herramientas Loom frente a llama.cpp: el paquete define puertas de correccion (`golden`, `compare`, `logits`, `sampling`) que permiten comparar token a token la salida frente a la referencia de llama.cpp sobre el mismo GGUF.
- Servicio de chat interno de baja concurrencia: con 4 peticiones concurrentes y 4.096 tokens de salida por peticion, encaja en escenarios de equipo pequeno o demos donde no se requiere escalado horizontal.
- Desarrollo en estaciones de trabajo con Radeon AI PRO R9700 (32 GB): el paquete esta preparado para gfx1201, lo que permite desplegar el modelo en una GPU profesional AMD sin recompilar kernels a mano.
- Pruebas de regresion de inferencia en CI: las puertas `kernel_tests`, `consistency` y `spec` estan pensadas para detectar divergencias numericas entre versiones del runtime, lo que resulta util como suite de validacion antes de actualizar `hrx-loom`.
- Investigacion sobre portabilidad de GGUF a backends alternativos: al no modificar el checkpoint original, sirve como banco de pruebas para medir la fidelidad de kernels generados automaticamente frente a una implementacion consolidada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y para Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran todas como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada: el checkpoint es Q4_K_M de un modelo de 3.2B, lo que tipicamente ocupa alrededor de 2 GB en pesos; el paquete Loom anade el pool de memoria fijado con `--pool_backing=fixed`, cuyo tamano exacto no esta disponible en la informacion proporcionada.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: el paquete esta pensado para graficas integradas AMD de la familia Strix Halo; no se documenta soporte para GPUs NVIDIA ni para otras Radeon.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI en este paquete.
- Latencia y throughput: no disponibles; las mediciones no se han vuelto a realizar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| bartowski/Hermes-3-Llama-3.2-3B-GGUF (base de este paquete) | 3.2B | 131.072 | GGUF | llama3 | Checkpoint original; requiere un runtime GGUF (llama.cpp, etc.) |
| loom-draft/bartowski-Hermes-3-Llama-3.2-3B-loom | 3.2B | 131.072 | GGUF empaquetado en `.loom` | llama3 | Paquete Loom para AMD gfx1151 / gfx1201; sin benchmarks publicados |
| NousResearch/Hermes-3-Llama-3.1-8B | 8B | 131.072 | safetensors, GGUF | llama3 | Version mayor de la familia Hermes-3 sobre Llama 3.1 |
| Meta-Llama-3.2-3B-Instruct | 3.2B | 131.072 | safetensors, GGUF | llama3 | Modelo base sin el fine-tune de Nous Research |

No se dispone de datos de rendimiento comparativo para este paquete en la informacion proporcionada.

## Limitaciones y advertencias

- El paquete no ha sido validado numericamente: todas las puertas de correccion figuran como "not yet re-measured", por lo que no hay evidencia registrada de equivalencia con llama.cpp.
- No hay benchmarks de latencia ni throughput publicados para ninguna de las dos GPU objetivo.
- El comportamiento de muestreo esta marcado como "not determined", lo que impide garantizar reproducibilidad con semilla fija.
- No soporta tool calling, modo de razonamiento, decodificacion especulativa, vision ni audio.
- El limite de 4 peticiones concurrentes y 4.096 tokens de salida por peticion restringe su uso en produccion con carga alta.
- Solo esta pensado para hardware AMD gfx1151 y gfx1201; no se documenta compatibilidad con otras GPU.
- La licencia Llama 3 Community License impone restricciones de uso comercial (umbral de 700 millones de usuarios mensuales, obligaciones de atribucion y politicas de uso aceptable); conviene revisarla antes de desplegar en producto.
- Riesgo de alucinacion y sesgos: propios de un modelo de 3.2B afinado por instrucciones; no se documentan evaluaciones de sesgo ni de seguridad en la informacion disponible.
- Idiomas soportados no declarados en la model card; el modelo base Llama 3.2 esta orientado principalmente al ingles, con soporte limitado de otras lenguas.
- Numero de descargas y likes: 0 en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/loom-draft/bartowski-Hermes-3-Llama-3.2-3B-loom
- Modelo base en Hugging Face: https://huggingface.co/bartowski/Hermes-3-Llama-3.2-3B-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
