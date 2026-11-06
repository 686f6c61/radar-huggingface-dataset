# MIRA-MMDeepResearch/MIRA-SFT-35B-A3B

## Resumen

MIRA-SFT-35B-A3B es un modelo de lenguaje publicado en Hugging Face por el usuario MIRA-MMDeepResearch. La nomenclatura del identificador sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 35.000 millones de parametros totales y unos 3.000 millones de parametros activos por token, ademas de un ajuste fino supervisado (SFT) sobre una base previa. Sin embargo, la model card publicada no contiene mas que la declaracion de licencia Apache 2.0, sin descripcion, sin especificaciones y sin datos de entrenamiento.

El modelo se publico el 2 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni interacciones en la plataforma. No hay informacion publica sobre la arquitectura exacta, el proceso de entrenamiento, los idiomas soportados ni los resultados de evaluacion. La busqueda web no devuelve ningun resultado relacionado con este modelo concreto: los enlaces encontrados corresponden a entidades homonimas sin relacion (una marca de cosmetica, un archivo filmico de Alsacia y una joyeria).

Por tanto, esta ficha documenta lo poco que se puede verificar (identificador, autoria, licencia y fecha) y marca explicitamente como "no disponible" todo aquello que el autor no ha publicado. Cualquier uso en produccion deberia ir precedido de una evaluacion propia, dado que no existe evidencia publica de calidad, sesgos o rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere MoE, sin confirmar) |
| Parametros totales | 35B segun el identificador del modelo (no confirmado en la model card) |
| Parametros activos | 3B segun el identificador del modelo (no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura en la model card. El identificador "35B-A3B" sigue la convencion habitual para modelos de mezcla de expertos, donde el primer numero indica los parametros totales y el segundo los parametros activos por token, lo que implicaria un modelo disperso con enrutamiento por token. No obstante, se trata de una inferencia a partir del nombre y no de un dato confirmado por el autor.

Tampoco hay datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre el proceso de ajuste fino supervisado al que alude el sufijo "SFT". No se dispone de informacion sobre innovaciones tecnicas como atencion lineal, decodificacion especulativa o estrategias de entrenamiento especificas.

## Capacidades

- Generacion de texto: capacidad esperable en un modelo de lenguaje, sin documentar por el autor.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Vision: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

Dado que no existe documentacion funcional ni evaluaciones publicas, los siguientes casos son escenarios hipoteticos que requeririan validacion previa con el modelo real:

- Prototipado interno de asistentes conversacionales: un modelo con 3B de parametros activos podria ofrecer un coste de inferencia contenido si la arquitectura MoE se confirma, adecuado para experimentacion en entornos controlados.
- Generacion de texto en pipelines de bajo riesgo: resumenes o borradores que pasen por revision humana, dado que no hay garantias documentadas de calidad.
- Investigacion sobre ajuste fino: la licencia Apache 2.0 permite modificar y redistribuir el modelo, lo que facilita su uso como base para experimentos academicos.
- Evaluacion comparativa de arquitecturas MoE: util para investigadores que quieran medir el comportamiento de un modelo 35B-A3B frente a alternativas documentadas.
- Despliegue en hardware de gama alta con cuantizacion: si se publican pesos en formatos como GGUF o safetensors, podria ejecutarse en GPUs con VRAM suficiente, aunque las necesidades exactas se desconocen.
- Fine-tuning domain-specific: la licencia permisiva permite adaptar el modelo a dominios concretos (legal, medico, financiero) siempre que se valide su comportamiento base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia orientativa, un modelo denso de 35B en FP16 requeriria del orden de 70 GB de VRAM; en cuantizacion de 4 bits, alrededor de 18-20 GB. Si la arquitectura MoE con 3B activos se confirma, el coste computacional por token seria menor, pero la memoria necesaria para almacenar todos los expertos seguiria siendo elevada.
- GPU recomendadas: no disponible. Por tamano, cabria esperar A100 80GB, H100 o configuraciones multi-GPU para precision completa.
- Compatibilidad con GPU de consumo: no confirmada. Podria ser viable en RTX 4090 (24 GB) con cuantizacion agresiva si se publican pesos en ese formato.
- Opciones de despliegue: no disponible (no se confirman formatos GGUF, safetensors ni compatibilidad con vLLM, llama.cpp, Ollama o TGI).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables con documentacion verificable en la informacion proporcionada, y las busquedas web no arrojan resultados sobre este modelo ni sobre alternativas directamente equiparables de MIRA-MMDeepResearch.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card solo declara la licencia, sin informacion sobre entrenamiento, datos o evaluacion.
- Sesgos desconocidos: al no documentarse la composicion del dataset, no es posible evaluar sesgos de genero, raza, idioma o dominio.
- Riesgo de alucinacion no cuantificado: no hay evaluaciones de fidelidad ni de tasas de alucinacion.
- Idiomas no declarados: se desconoce si el modelo esta entrenado en castellano o si su rendimiento multilingue es aceptable.
- Contexto desconocido: sin longitud de contexto publicada, no se puede planificar su uso en tareas de contexto largo.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el usuario asume toda la responsabilidad sobre el comportamiento del modelo, al no existir garantias del autor.
- Cero adopcion publica: sin descargas ni likes, no hay retroalimentacion de la comunidad que permita detectar problemas.
- Fecha de publicacion futura respecto a los datos habituales de referencia: conviene verificar la autenticidad y procedencia del repositorio antes de integrarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/MIRA-MMDeepResearch/MIRA-SFT-35B-A3B
- Resultados de busqueda web: sin enlaces relevantes al modelo (los resultados corresponden a entidades homonimas sin relacion: mymira.fr, miralsace.eu, miramirajewelry.com).
