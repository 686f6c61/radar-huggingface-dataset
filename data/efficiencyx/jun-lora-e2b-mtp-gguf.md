# efficiencyx/Jun-LoRA-E2B-MTP-GGUF

## Resumen

Jun-LoRA-E2B-MTP-GGUF es un modelo borrador (draft model) para decodificacion especulativa, publicado por el usuario efficiencyx como complemento del modelo conversacional Jun-LoRA-E2B-GGUF. No es un modelo de chat: su unica funcion es proponer tokens candidatos que el modelo objetivo verifica despues, con el fin de reducir la latencia de generacion sin alterar la distribucion de salida del modelo verificado. El repositorio contiene un unico archivo GGUF de 76 MB cuantizado a Q4_K_M, con 77.207.300 parametros.

El detalle relevante es que los pesos no han sido entrenados ni afinados por el autor: son los pesos originales de google/gemma-4-E2B-it-qat-q4_0-unquantized-assistant, convertidos a GGUF y cuantizados. La model card explica que un intento de afinar un borrador sobre Jun (probado en la variante E4B) no supero al borrador de serie en llama.cpp, por lo que el repositorio se limita a colocar el borrador original en la ruta y con la etiqueta de cuantizacion que espera JunOS, el runtime del autor.

Su relevancia es practica y acotada: permite activar decodificacion especulativa con el tipo draft-mtp de llama.cpp sobre el modelo Jun, siempre que se respete la rama QAT del modelo base. Para desarrolladores que ejecutan modelos pequenos en local, un borrador de 77 M y menos de 100 MB en disco es una forma barata de ganar velocidad de decodificacion sin anadir VRAM apreciable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer perteneciente a la familia Gemma 4, configurado como asistente MTP (multi-token prediction) / borrador de decodificacion especulativa; no se detalla la configuracion de capas en la informacion disponible |
| Parametros totales | 77.207.300 (aproximadamente 77 M) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado); se documenta una conversion intermedia a BF16; el autor indica que el borrador se sirve tambien en Q8_0 en otros repositorios, con tensores y metadatos identicos |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo gemma-4-E2B-it-qat-assistant-Q4_K_M.gguf, 76 MB) |
| Modelo base | google/gemma-4-E2B-it-qat-q4_0-unquantized-assistant (relacion: quantized) |
| Modelo objetivo | efficiencyx/Jun-LoRA-E2B-GGUF |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes en el momento de la consulta | 0 / 0 |
| Fecha de creacion | 2026-09-26 |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificacion especulativa, una arquitectura de dos etapas en la que un modelo pequeno propone secuencias cortas de tokens y el modelo grande las verifica en paralelo. La model card lo etiqueta como MTP (multi-token prediction) y como draft-model, y la integracion se realiza mediante el tipo de especulacion draft-mtp de llama.cpp. Los tensores, las formas y los metadatos de arquitectura son, segun el autor, identicos a los de la conversion Q8_0 que llama.cpp ya sirve; la unica diferencia entre ambas versiones son los tipos de cuantizacion.

No ha habido entrenamiento ni ajuste fino por parte del publicador. El procedimiento documentado es puramente de conversion y cuantizacion sobre el modelo asistente de Google: `convert_hf_to_gguf.py` con `--outtype bf16` para generar un GGUF BF16 intermedio y, a continuacion, `llama-quantize` con Q4_K_M. El autor indica ademas que probo un borrador afinado sobre Jun en la variante E4B y que este no supero al borrador de serie en llama.cpp, motivo por el que publica los pesos originales sin modificar. Se mantiene la rama QAT (quantization-aware training) del modelo base porque, segun la model card, un borrador procedente de la rama no QAT carga sin errores pero produce propuestas de mucha peor calidad.

## Capacidades

- Generacion de borradores de tokens para decodificacion especulativa: propone tokens candidatos que el modelo verificador acepta o rechaza.
- Integracion con llama.cpp mediante el tipo de especulacion draft-mtp y el parametro `--spec-draft-model`.
- Integracion con JunOS como borrador por defecto: `./mtp-autotune.sh` recurre a este modelo cuando la variable `OLLAMA_MTP` esta vacia.
- Compatibilidad con la rama QAT del modelo base, lo que mejora la tasa de aceptacion frente a borradores de la rama no QAT.
- Cobertura de tokenizacion en ingles, coherente con el campo `language: en` del repositorio.
- No soporta tool calling ni function calling.
- No soporta uso agentico ni razonamiento multi-paso por si mismo: no es un modelo de chat.
- No dispone de modo thinking, vision ni audio.
- No debe usarse para generar respuestas finales: su salida solo tiene sentido como propuesta para el verificador.

## Casos de uso

- Aceleracion de inferencia local del modelo Jun en CPU: al ser un borrador de 76 MB en Q4_K_M, puede cargarse junto al modelo objetivo en equipos sin GPU dedicada y reducir el numero de pasos de decodificacion efectivos. Es adecuado precisamente por su tamano minimo y su integracion nativa con llama.cpp.
- Despliegue en JunOS con configuracion automatica: el script `./mtp-autotune.sh` selecciona este borrador cuando no se define `OLLAMA_MTP`, de modo que un usuario que instala JunOS obtiene decodificacion especulativa sin configurar nada. El caso de uso es la puesta en marcha rapida de un asistente local.
- Reduccion de VRAM en GPUs de gama de entrada: el borrador anade menos de 0,1 GB de pesos, por lo que puede convivir con el modelo objetivo en tarjetas con poca memoria donde no cabe un segundo modelo de verificacion completo. Es adecuado porque la relacion coste/beneficio en memoria es muy favorable.
- Servidores de chat interactivo con requisito de baja latencia: en despliegues con llama-server, activar `--spec-draft-n-max 1` con este borrador busca recortar el tiempo por token percibido por el usuario. Es adecuado en escenarios de conversacion turno a turno donde la latencia de primer token y la velocidad de decodificacion son criticas.
- Autocompletado de codigo en editores: la generacion de codigo se compone de secuencias con alta previsibilidad local, un regimen donde los borradores especulativos suelen obtener buenas tasas de aceptacion. El modelo propone continuaciones cortas que el verificador valida.
- Generacion por lotes de documentacion tecnica: en pipelines que producen muchos textos cortos en ingles, la decodificacion especulativa amortiza el coste del borrador a lo largo del lote. Es adecuado porque el idioma del repositorio es el ingles y el borrador no anade idiomas adicionales que compliquen la tokenizacion.
- Investigacion y evaluacion de decodificacion especulativa: sirve como linea base de borrador de serie frente a borradores entrenados especificamente, tal y como el propio autor documenta con el experimento en E4B. Es adecuado para reproducir comparativas de tasa de aceptacion en llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de tasa de aceptacion con valores numericos.

La unica evidencia de rendimiento aportada por el autor es cualitativa: un borrador afinado sobre Jun, probado en la variante E4B, no supero al borrador de serie en llama.cpp; y un borrador procedente de la rama no QAT del modelo base "carga bien y predice mucho peor". Tambien se indica que el parametro recomendado de llama.cpp es `--spec-draft-n-max 1`.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 0,1 GB solo para los pesos del archivo publicado (76 MB en Q4_K_M); con el contexto y los buffers de llama.cpp, el consumo adicional practico se mantiene en el orden de unos pocos cientos de MB. Cifra exacta no disponible.
- GPU recomendadas: no se especifican en la informacion disponible. Dado el tamano del modelo, cualquier GPU con soporte de llama.cpp es suficiente, incluidas integradas.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual e incluso en iGPU, dado que el archivo ocupa 76 MB. La limitacion real de memoria la impone el modelo verificador, no el borrador.
- Ejecucion en CPU: viable sin GPU dedicada, que es el escenario que sugiere el caracter de borrador ultraligero.
- Opciones de despliegue: llama.cpp (llama-server con `--spec-type draft-mtp`), JunOS mediante `mtp-autotune.sh` y la variable `OLLAMA_MTP`. Otros runtimes no se mencionan en la informacion disponible.
- Ejemplo de invocacion documentado: `llama-server -m Jun-LoRA-E2B.Q4_K_M.gguf --spec-type draft-mtp --spec-draft-model gemma-4-E2B-it-qat-assistant-Q4_K_M.gguf --spec-draft-n-max 1`.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de tasa de aceptacion.
- Herramientas de conversion empleadas: `convert_hf_to_gguf.py` y `llama-quantize` de llama.cpp, commit `8e7f22b`.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| Jun-LoRA-E2B-MTP-GGUF | Borrador MTP para decodificacion especulativa | 77.207.300 | no disponible | Apache-2.0 | GGUF Q4_K_M, 76 MB | Pesos de serie de Google sin reentrenar, en la rama QAT |
| Borrador stock en Q8_0 (mismo modelo base, otra cuantizacion) | Borrador MTP | 77.207.300 (mismos tensores) | no disponible | Apache-2.0 | GGUF Q8_0 servido por llama.cpp | Diferencia unicamente en el tipo de cuantizacion |
| Borrador afinado sobre Jun (variante E4B) | Borrador MTP entrenado | no disponible | no disponible | no disponible | No publicado; descrito como descartado | No supero al borrador de serie en llama.cpp segun el autor |
| Jun-LoRA-E2B-GGUF | Modelo objetivo (chat) | no disponible | no disponible | no disponible | GGUF | Modelo que verifica las propuestas del borrador |
| EAGLE-3 y cabezas tipo Medusa | Familias alternativas de decodificacion especulativa | no disponible | no disponible | no disponible | Implementaciones en runtimes como vLLM | No hay datos comparativos en la informacion proporcionada |
| Prompt lookup / decodificacion n-gram | Especulacion sin modelo borrador | No aplica | No aplica | No aplica | Disponible en varios runtimes | No hay datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo de chat ni de generacion final: su salida son propuestas de tokens que deben ser verificadas por el modelo objetivo. Usarlo de forma autonoma produce resultados sin garantia de calidad.
- Dependencia estricta del modelo objetivo: esta pensado para efficiencyx/Jun-LoRA-E2B-GGUF. No hay datos sobre su comportamiento con otros verificadores.
- Sensibilidad a la rama de cuantizacion: segun la model card, un borrador de la rama no QAT carga correctamente pero predice mucho peor. La rama QAT del modelo base es un requisito practico para un rendimiento util.
- Cobertura linguistica limitada al ingles. No se declaran otros idiomas.
- Longitud de contexto no disponible, lo que impide anticipar su comportamiento en prompts largos o en conversaciones de muchos turnos.
- Riesgo de alucinacion: no aplica en el sentido habitual, porque el borrador no produce la respuesta final; el riesgo se traslada al modelo verificador. Si el verificador acepta propuestas incorrectas, el error se propaga a la salida.
- Sin benchmarks publicados: no hay metricas de tasa de aceptacion, latencia ni throughput que permitan estimar la ganancia real en un despliegue concreto.
- Adopcion nula en el momento de la consulta (0 descargas, 0 likes) y repositorio muy reciente (creado el 2026-09-26), por lo que no existe validacion independiente de su funcionamiento.
- Licencia Apache-2.0 en este repositorio, pero los pesos derivan de un modelo de Google: conviene verificar los terminos aplicables al modelo base y a la rama QAT antes de un uso comercial.
- El autor advierte de que los pesos son los de serie, no un ajuste propio; el nombre "Jun-LoRA" del repositorio puede inducir a error sobre el origen del borrador.
- No se documentan requisitos de version minima de llama.cpp mas alla del commit `8e7f22b` empleado en la conversion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/efficiencyx/Jun-LoRA-E2B-MTP-GGUF
- Modelo objetivo, Jun-LoRA-E2B-GGUF: https://huggingface.co/efficiencyx/Jun-LoRA-E2B-GGUF
- Modelo base, google/gemma-4-E2B-it-qat-q4_0-unquantized-assistant: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized-assistant
- Rama QAT de referencia mencionada en la model card, unsloth/gemma-4-E2B-it-qat-q4_0-unquantized: no disponible como enlace directo en la informacion proporcionada
- Repositorio JunOS: https://github.com/efficiencyx/JunOS
- llama.cpp (herramientas de conversion y cuantizacion, commit 8e7f22b): https://github.com/ggml-org/llama.cpp
- Paper o publicacion tecnica asociada: no disponible
- Demo o espacio interactivo: no disponible
