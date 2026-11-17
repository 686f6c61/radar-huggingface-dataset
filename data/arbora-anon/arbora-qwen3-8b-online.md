# arbora-anon/arbora-qwen3-8b-online

## Resumen

Arbora Qwen3-8B online es un conjunto de pesos publicados por el autor anónimo `arbora-anon` como parte de la release de código del paper "Arbora: Candidate-Aware Post-Training of Block Diffusion Drafters with a Mixture of Speculators", actualmente en revisión anónima. No se trata de un modelo de lenguaje completo e independiente, sino de los pesos resultantes de tres ejecuciones de aprendizaje online sobre un drafter de decodificación especulativa construido sobre Qwen3-8B, concretamente sobre el checkpoint `z-lab/Qwen3-8B-DFlash-b16`.

El artefacto contiene tres variantes: DFlash2 con su drafter y selector de ruta entrenados online, Arbora con un experto adicional entrenado (drafter, ocho expertos y scorer de ruta congelados), y Arbora con el experto añadido y el scorer de ruta entrenados. El entrenamiento online se realizó sobre un flujo de 20.000 peticiones de ingeniería de software, usando las propias respuestas de Qwen3-8B y turnos de SWE-agent provenientes de SWE-smith.

Su relevancia es acotada pero específica: documenta una receta de post-entrenamiento para drafters de difusión por bloques con una mezcla de especuladores, orientada a acelerar la inferencia de Qwen3-8B en cargas de trabajo agénticas de código. Los pesos se cargan en caliente mediante `POST /update_weights_from_disk` con `load_format: arbora_online` en los stacks `d2-chain-online` y `d2-arbora-experts-online`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de decodificacion especulativa por difusion de bloques con mezcla de especuladores (ocho expertos y scorer de ruta), sobre base Qwen3-8B |
| Parametros totales | no disponible (el repo pesa 3,0 GB; el modelo objetivo es Qwen3-8B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, `selector.safetensors`, `experts.safetensors`) |

## Arquitectura y entrenamiento

El sistema es un drafter de decodificacion especulativa basado en difusion de bloques, con un diseño de mezcla de especuladores: ocho expertos mas un scorer de ruta que selecciona candidatos. El modelo base declarado es `z-lab/Qwen3-8B-DFlash-b16`, del que hereda el modelo objetivo Qwen3-8B. Los pesos publicados no constituyen el modelo generativo principal, sino los componentes auxiliares que proponen y seleccionan tokens candidatos para acelerar la decodificacion del modelo grande.

El entrenamiento se realizó de forma online sobre un flujo de 20.000 peticiones de ingeniería de software. Los datos de entrenamiento se construyen a partir de las respuestas del propio Qwen3-8B a esas peticiones y de turnos de SWE-agent extraídos de SWE-smith. Los pesos de partida ya habían sido entrenados sobre respuestas del modelo objetivo. Se publican tres configuraciones con distintos grados de congelación: DFlash2 con drafter y selector de ruta entrenados online (learning rate del drafter 1e-5); Arbora con un experto añadido entrenado y el resto congelado; y Arbora con experto añadido y scorer de ruta entrenados. La receta y los scripts para construir datos desde un fichero de prompts se describen en la release de código del paper.

## Capacidades

- Aceleracion de inferencia de Qwen3-8B mediante decodificacion especulativa con drafter de difusion de bloques.
- Seleccion de candidatos mediante un scorer de ruta y una mezcla de ocho especuladores.
- Post-entrenamiento online con actualizacion de pesos en caliente desde disco (`load_format: arbora_online`).
- Especializacion en cargas de trabajo de ingenieria de software y turnos de agente (SWE-agent).
- No es un modelo conversacional autonomo: no genera texto por si mismo sin el modelo objetivo Qwen3-8B.
- Soporte de tool calling, agentes, vision o audio: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Aceleracion de servidores de inferencia para Qwen3-8B: el drafter propone bloques de tokens candidatos y el scorer de ruta selecciona la mejor ruta, reduciendo el numero de pasos de decodificacion del modelo objetivo en despliegues con vLLM u otro stack compatible con el formato `arbora_online`.
- Agentes de ingenieria de software: al haberse entrenado sobre turnos de SWE-agent de SWE-smith, el drafter esta ajustado al patron de generacion de parches, comandos y ediciones de ficheros tipico de pipelines agenticos de resolucion de issues.
- Actualizacion continua en produccion: el flujo de aprendizaje online sobre 20.000 peticiones permite refrescar los pesos del drafter desde disco sin reiniciar el servidor, util en entornos donde la distribucion de peticiones cambia con el tiempo.
- Investigacion en decodificacion especulativa: las tres variantes publicadas permiten comparar el efecto de entrenar solo el drafter, anadir un experto o entrenar tambien el scorer de ruta sobre la misma secuencia de peticiones.
- Reduccion de coste por token en APIs de codigo: al acelerar la generacion del modelo objetivo, se traduce en menor latencia y menor coste de GPU por peticion en servicios de autocompletado o generacion de codigo.
- Reproducibilidad de experimentos: los scripts de la release de código permiten reconstruir los datos de entrenamiento desde un fichero de prompts y replicar las tres configuraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repo ocupa 3,0 GB, por lo que los pesos del drafter, expertos y selectores caben holgadamente en GPU de consumo, pero requieren el modelo objetivo Qwen3-8B cargado en paralelo.
- VRAM estimada para el conjunto: la de Qwen3-8B en la precision elegida (aproximadamente 16 GB en FP16/BF16, unos 5-6 GB en cuantizacion de 4 bits) mas el espacio de los pesos auxiliares del drafter.
- GPU recomendadas: A100 40/80 GB o H100 para despliegues de produccion con el modelo objetivo en BF16; RTX 4090 (24 GB) viable para Qwen3-8B en BF16 junto con el drafter.
- Despliegue: los stacks indicados en la model card son `d2-chain-online` (DFlash2) y `d2-arbora-experts-online` (Arbora), con carga mediante `POST /update_weights_from_disk` y `load_format: arbora_online`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arbora-qwen3-8b-online | no disponible (repo 3,0 GB) | no disponible | Drafter especulativo con mezcla de especuladores sobre Qwen3-8B | Apache 2.0 | Hugging Face, 0 descargas |
| z-lab/Qwen3-8B-DFlash-b16 | no disponible | no disponible | Drafter de difusion de bloques para Qwen3-8B (modelo base) | no disponible | Hugging Face |
| Qwen3-8B | 8 000 M | no disponible | LLM denso generativo | no disponible | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con otros drafters especulativos.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere Qwen3-8B y un stack de servidor compatible con `arbora_online`; no funciona como modelo generativo aislado.
- El entrenamiento online se limita a 20.000 peticiones de ingenieria de software, por lo que la especializacion esta sesgada hacia ese dominio y puede degradar la aceleracion en otras tareas.
- El modelo esta en revision anonima y el autor es anonimo (`arbora-anon`), sin historial verificable ni descargas; la madurez y el soporte son inciertos.
- No se documentan idiomas soportados, contexto ni cuantizaciones; la integracion en produccion exige validacion propia.
- Riesgo de sesgo y alucinacion: no evaluado en la informacion disponible; al tratarse de un drafter, los errores se manifiestan como candidatos rechazados o aceptados incorrectamente, no como texto final.
- La licencia Apache 2.0 permite uso comercial, pero deben revisarse los avisos de terceros en `NOTICE`.
- No se han publicado benchmarks que respalden las ganancias de velocidad o calidad de las tres variantes.

## Enlaces

- Hugging Face: https://huggingface.co/arbora-anon/arbora-qwen3-8b-online
- Modelo base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Codigo del paper (anonimo): https://anonymous.4open.science/r/arbora-7ABE
