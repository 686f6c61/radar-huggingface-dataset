# llmkat/qwen3

## Resumen

llmkat/qwen3 es un artefacto de prueba (test fixture) publicado en Hugging Face por el usuario llmkat, no un modelo de lenguaje funcional. Reproduce la misma construccion que llmkat/llama pero con la arquitectura de Qwen3, incluyendo sus normalizaciones q/k por cabeza (per-head q/k norms). Su unico comportamiento es seguir una cadena de punteros (pointer chase) sobre el prompt recibido, de modo que la salida es determinista y verificable token a token.

El proposito es servir como banco de pruebas para motores de inferencia (vLLM, SGLang, TGI) y validar que la gestion de la cache KV es correcta. Segun la model card, cada token correcto gana por unos 39 nats, de forma que un token erroneo indica que el motor ha leido un bloque de cache KV equivocado y no una diferencia de redondeo. Esto lo convierte en una herramienta de depuracion para funcionalidades como el prefix caching.

El modelo tiene 7.771.520 parametros totales segun los pesos en safetensors, un tamano de repositorio practicamente nulo y licencia MIT. No dispone de card con datos de entrenamiento, idiomas ni benchmarks; su relevancia es exclusivamente como utilidad de verificacion para desarrolladores de infraestructura de serving.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3 con normalizacion q/k por cabeza (per-head q/k norms) |
| Parametros totales | 7.771.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseno de Qwen3, con atencion multi-cabeza y normalizaciones q/k por cabeza. No hay informacion sobre el numero de capas, dimensiones ocultas ni configuracion exacta del transformer en la informacion proporcionada. El modelo no ha sido entrenado como modelo de lenguaje: su comportamiento consiste en ejecutar una cadena de punteros sobre el prompt, lo que produce una respuesta determinista que puede compararse con una respuesta conocida.

No se dispone de datos sobre volumen de entrenamiento, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones de decodificacion. La unica caracteristica tecnica destacable es su uso previsto: verificar la correctitud de la cache KV en motores de serving, aprovechando que la separacion entre el token correcto y el incorrecto es de aproximadamente 39 nats.

## Capacidades

- Generacion determinista de tokens siguiendo una cadena de punteros sobre el prompt.
- Verificacion token a token de la salida frente a una respuesta conocida.
- Prueba de prefix caching y de lectura de bloques de cache KV en motores de inferencia.
- Compatible con motores de serving como vLLM y SGLang (etiquetas del repositorio).
- Compatible con text-generation-inference y endpoints compatibles (etiquetas).
- No soporta tool calling, function calling, agentes, vision, audio ni razonamiento multilingue.

## Casos de uso

- Verificacion de motores de serving: servir el modelo con vLLM y ejecutar `check.py` contra el endpoint para confirmar que cada token coincide con la respuesta conocida; un fallo indica lectura incorrecta de la cache KV.
- Pruebas de prefix caching: lanzar el servidor con `--enable-prefix-caching` y comprobar que las peticiones con prefijo compartido devuelven la secuencia correcta.
- Integracion continua de infraestructura: incluir la comprobacion en pipelines de CI/CD para detectar regresiones en kernels de atencion o en la gestion de bloques de cache tras actualizar un motor.
- Validacion de cuantizaciones y backends: comparar la salida del motor con distintos backends o configuraciones y detectar desviaciones que no sean simples diferencias de redondeo.
- Depuracion de SGLang y TGI: repetir la prueba con distintos motores para aislar si el error esta en el motor o en la configuracion del despliegue.
- Formacion y evaluacion de ingenieros de plataforma: usar el fixture como caso controlado para entender el funcionamiento de la cache KV y del prefix caching en entornos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la separacion de aproximadamente 39 nats entre el token correcto y el incorrecto en la verificacion.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida, inferior a 1 GB en precision completa dado el tamano de 7.771.520 parametros; no se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU con soporte para los motores indicados; no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: previsiblemente cualquier GPU consumer moderna, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: vLLM, SGLang y text-generation-inference segun las etiquetas del repositorio; llama.cpp y Ollama no se mencionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llmkat/qwen3 | 7.771.520 | no disponible | Fixture de prueba para motores de serving | MIT | Hugging Face |
| llmkat/llama | no disponible | no disponible | Fixture de prueba equivalente en arquitectura Llama | no disponible | Hugging Face |
| Qwen3 (modelos oficiales) | no disponible en la informacion | no disponible | Modelo de lenguaje de proposito general | no disponible | Hugging Face |

La comparacion con modelos de lenguaje convencionales no es aplicable: llmkat/qwen3 no genera lenguaje natural y su rendimiento se mide en correctitud de tokens, no en benchmarks de conocimiento o razonamiento.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe usarse para generacion de texto, atencion al cliente, codigo ni ninguna tarea de produccion.
- Su comportamiento se limita a seguir una cadena de punteros sobre el prompt; fuera de ese protocolo la salida carece de utilidad.
- No hay informacion sobre sesgos, alucinacion o limitaciones de idioma porque no aplica a su proposito.
- La licencia MIT permite uso comercial, pero el autor lo describe explicitamente como fixture de pruebas.
- La correctitud de la verificacion depende de que el motor respete el protocolo de la cadena de punteros; un resultado erroneo debe interpretarse como fallo del motor, no del modelo.
- No se dispone de datos sobre contexto maximo ni sobre configuracion de cuantizacion, lo que limita su uso en pruebas de esos escenarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmkat/qwen3
- Modelo equivalente en arquitectura Llama: https://huggingface.co/llmkat/llama
- Repositorio del proyecto: https://github.com/sansblues/llmkat
