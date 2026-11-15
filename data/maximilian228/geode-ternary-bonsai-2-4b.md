# Maximilian228/Geode-Ternary-Bonsai-2-4B

## Resumen

Geode Ternary Bonsai 2 4B es un paquete de pesos empaquetado por Maximilian228 para Geode, una aplicacion Android que ejecuta modelos de lenguaje integramente en el telefono, sin nube ni cuenta de usuario. El paquete contiene los pesos ternarios de PrismML (Ternary Bonsai 2 4B), derivados de Qwen/Qwen3.5-4B, convertidos al formato propio de Geode (`geode.json` describe los ficheros). No se trata de un modelo nuevo entrenado desde cero, sino de una conversion de formato con los mismos valores ternarios y escalas que distribuye PrismML.

La relevancia tecnica esta en la compresion: cada peso se reduce a -1, 0 o +1 multiplicado por una escala compartida por grupo de 64, de modo que un modelo de 4.000 millones de parametros ocupa 1,3 GB. Mantiene la arquitectura hibrida Gated DeltaNet + atencion y el vocabulario de Qwen3.5, ademas de la capa MTP (multi-token prediction) de PrismML para decodificacion especulativa, y conserva la capacidad de entender imagenes mediante un codificador visual en 8 bits.

El paquete esta pensado para telefonos ARM de 64 bits con Android 11 o superior, instrucciones de producto escalar ARMv8.2 y al menos 6 GB de RAM. Su interes practico es que permite inferencia local de un modelo multimodal de 4B con calidad cercana a la version GGUF de referencia en llama.cpp, con velocidades de 25-42 tokens/s en un Snapdragon 8 Elite.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido Gated DeltaNet + atencion (heredada de Qwen3.5-4B), con capa MTP para decodificacion especulativa |
| Parametros totales | 4B (modelo base Qwen3.5-4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos ternarios (codigos de 2 bits, escala fp16 por grupo de 64); capa MTP en 8 bits; codificador visual en 8 bits |
| Idiomas soportados | no disponible (la model card no detalla lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | Formato propio de Geode (`geode.json` + ficheros binarios); no es GGUF y no carga en otros runtimes |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.5-4B, un transformer hibrido que combina capas Gated DeltaNet (atencion lineal con estado recurrente) y capas de atencion clasica, con el mismo vocabulario que el resto de modelos Qwen que soporta Geode. PrismML aplico cuantizacion ternaria a los pesos: cada valor se representa como -1, 0 o +1 multiplicado por una escala fp16 compartida por cada grupo de 64 pesos, lo que reduce el modelo a 1,3 GB. Se incluye ademas una capa MTP (multi-token prediction) que actua como cabezal de borrador para decodificacion especulativa, y un codificador visual en 8 bits que habilita la entrada de imagenes.

La conversion realizada por Maximilian228 no re-cuantiza nada: Geode lee directamente los codigos ternarios y las escalas de PrismML, con las rotaciones de Hadamard de las entradas ya incorporadas tal como las distribuye PrismML. Los tensores se reordenan al esquema de ficheros de Geode y se anade un vocabulario de borrador (`draft_vocab.bin`) para la capa MTP. No se documentan en la informacion disponible los datos de entrenamiento, el numero de tokens, ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y respuesta conversacional multi-turno, con la calidad del modelo Qwen3.5-4B subyacente.
- Comprension de imagenes: el paquete incluye codificador visual en 8 bits y el pipeline declarado es image-text-to-text.
- Razonamiento y generacion de codigo, heredados del modelo base (no se detallan evaluaciones especificas).
- Decodificacion especulativa mediante la capa MTP de PrismML, con verificacion de cada borrador.
- Ejecucion integra en el dispositivo: sin conexion, sin cuenta y sin enviar datos a la nube.
- Inferencia hibrida NPU/CPU: la NPU Hexagon lee el prompt y el procesador genera la respuesta.
- Soporte multilingue: no disponible en detalle; la model card solo menciona texto en ingles en las pruebas de fidelidad.

## Casos de uso

- Asistente personal offline en Android: el modelo se ejecuta integramente en el telefono, de modo que conversaciones y datos no salen del dispositivo, adecuado para usuarios con requisitos de privacidad.
- Descripcion y analisis de imagenes en el movil: gracias al codificador visual en 8 bits, se pueden enviar fotos al modelo para obtener descripciones o extraer informacion sin subirlas a un servicio externo.
- Generacion de texto y codigo en entornos sin conectividad: util en campo, viajes o zonas con red limitada, donde un modelo de 4B en 1,3 GB cabe en el almacenamiento del telefono.
- Prototipado de aplicaciones on-device: desarrolladores que quieran validar flujos de IA local en Android antes de invertir en infraestructura de servidor, usando el paquete con la app Geode.
- Asistencia en tareas de escritura y resumen de documentos cortos: el modelo procesa prompts de varias centenas de tokens con velocidades de 244-321 tokens/s en la NPU de un Snapdragon 8 Elite.
- Demostraciones y evaluacion de cuantizacion ternaria: investigadores que quieran medir el impacto de pesos ternarios frente a la version GGUF de referencia, con divergencia KL de 0,00002 en codigo y 0,00016 en texto ingles en posiciones retenidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card unicamente reporta metricas de fidelidad y velocidad:

| Metrica | Valor |
|---|---|
| Divergencia KL frente a llama.cpp con el GGUF de PrismML (codigo retenido) | 0,00002 |
| Divergencia KL frente a llama.cpp con el GGUF de PrismML (texto ingles retenido) | 0,00016 |
| Coincidencia del token superior | 100% |
| Prompt, Snapdragon 8 Elite, sin MTP | 244-321 tokens/s |
| Respuesta, Snapdragon 8 Elite, sin MTP | 25-32 tokens/s |
| Prompt, Snapdragon 8 Elite, con borradores MTP | 211-305 tokens/s |
| Respuesta, Snapdragon 8 Elite, con borradores MTP | 27-42 tokens/s |
| Memoria en ejecucion | ~2,4 GB (incluida la copia de pesos en la NPU) |

Las pruebas se realizaron con un prompt de 293 tokens y una respuesta de 160 tokens en decodificacion greedy; el rango de velocidades refleja la temperatura del telefono.

## Requisitos de hardware

- Almacenamiento: 1,7 GB para el paquete T2 (1,26 GiB de pesos + 0,34 GiB de vision).
- RAM: 6 GB o mas en el telefono; en ejecucion consume aproximadamente 2,4 GB, incluida la copia de pesos en la NPU.
- SoC: Android 11+, procesador ARM de 64 bits con instrucciones de producto escalar ARMv8.2; medido en Snapdragon 8 Elite (Hexagon NPU).
- GPU de escritorio: no aplica; el paquete no carga en otros runtimes distintos de Geode.
- Opciones de despliegue: exclusivamente la app Geode (beta en Google Play), mediante descarga desde Hugging Face dentro de la propia app.
- Latencia y throughput: 244-321 tokens/s de prompt y 25-42 tokens/s de generacion en Snapdragon 8 Elite, segun uso de MTP y temperatura del dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| Geode Ternary Bonsai 2 4B | 4B | no disponible | Formato Geode | Apache-2.0 | Solo app Geode en Android |
| prism-ml/Ternary-Bonsai-2-4B-gguf | 4B | no disponible | GGUF | Apache-2.0 | llama.cpp y runtimes compatibles GGUF |
| Qwen/Qwen3.5-4B | 4B | no disponible | safetensors | Apache-2.0 | vLLM, TGI, transformers, llama.cpp (segun soporte) |

La diferencia principal frente al GGUF de PrismML es el formato y el publico objetivo: el paquete de Geode esta optimizado para NPU Hexagon y almacenamiento movil, mientras que el GGUF apunta a llama.cpp en CPU. Frente al Qwen3.5-4B original, la version ternaria reduce el tamano a 1,3 GB a costa de precision en los pesos; la model card reporta divergencia KL muy baja frente al GGUF de referencia. No se dispone de datos de rendimiento en tareas estandar para comparar calidad.

## Limitaciones y advertencias

- El paquete no es GGUF y no carga en llama.cpp, Ollama, vLLM, TGI ni otros runtimes; solo funciona con la app Geode.
- Requiere Android 11+, ARM de 64 bits con ARMv8.2 y al menos 6 GB de RAM; no es utilizable en telefonos de gama baja ni en escritorio.
- La cuantizacion ternaria introduce perdida de precision respecto al modelo original; aunque la divergencia KL reportada es baja, no se han publicado evaluaciones en tareas de razonamiento o codigo.
- No se detalla la lista de idiomas soportados; las pruebas de fidelidad se limitan a codigo y texto en ingles.
- La longitud de contexto no esta documentada en la informacion disponible.
- Riesgo de alucinacion y errores: la propia model card advierte de que las respuestas provienen de un modelo de IA y pueden ser incorrectas.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar la atribucion a PrismML y al equipo de Qwen segun los terminos de la licencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; se trata de un paquete reciente sin validacion comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Maximilian228/Geode-Ternary-Bonsai-2-4B
- Modelo ternario de referencia (PrismML): https://huggingface.co/prism-ml/Ternary-Bonsai-2-4B-gguf
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- App Geode: https://geode.tifu.xyz
