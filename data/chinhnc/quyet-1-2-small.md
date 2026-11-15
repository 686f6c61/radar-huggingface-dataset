# chinhnc/Quyet-1.2-Small

## Resumen

Quyet-1.2-Small es un modelo de decisión desarrollado por Chinh Nguyen, publicado bajo licencia Apache-2.0. No es un modelo generativo al uso: dado un estado (texto libre, JSON o una conversación) y una o varias preguntas tipadas, devuelve distribuciones de probabilidad calibradas por temperatura sobre un conjunto de opciones suministradas por el usuario. Forma parte de la familia Quyet 1.2, compuesta por los tamanos Large, Small y Tiny.

Tecnicamente es un ajuste fino completo (full fine-tune) del decodificador de texto de Gemma 4 E4B, al que se anade una cabeza escalar de opciones. Cuenta con 7.463.015.937 parametros (7,46B) y admite entradas de hasta 23.434 tokens completos sin truncado: si una entrada excede ese limite, se rechaza en lugar de recortarse. Los pesos ocupan 14,9 GB en BF16 y el repositorio es autocontenido (incluye tokenizer y pesos, sin necesidad de descargar el modelo base por separado).

Su relevancia reside en el enfoque: en lugar de pedir a un LLM que "responda" una clasificacion y parsear el texto resultante, Quyet expone una interfaz de preguntas tipadas (`choice`, `score`, `noul`) con probabilidades calibradas, lo que facilita integrar decisiones en pipelines automatizados con umbrales de confianza explicitos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Full fine-tune del decodificador de texto de Gemma 4 E4B + cabeza escalar de opciones |
| Parametros totales | 7.463.015.937 (7,46B) |
| Parametros activos | no disponible |
| Longitud de contexto | 23.434 tokens completos (sin truncado; entradas superiores se rechazan) |
| Tipos de cuantizacion | BF16 (GPU), float32 (CPU); no se documentan otras cuantizaciones |
| Idiomas soportados | Multilingue (sin listado detallado) |
| Licencia | Apache-2.0 (conservar fichero NOTICE al redistribuir) |
| Formato de pesos | Pesos propios autocontenidos, 14,9 GB en BF16 (no se indica safetensors/GGUF) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E4B (modelo de Google, Apache-2.0) y aplica un ajuste fino completo sobre el decodificador de texto, anadiendo una cabeza escalar de opciones. La inferencia combina dos mecanismos: las preguntas de tipo `choice` utilizan la cabeza escalar de opciones, mientras que las de tipo `score` y `noul` emplean puntuaciones sobre simbolos del vocabulario. El paquete `quyet` construye la entrada y aplica la temperatura configurada para producir probabilidades calibradas.

La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. Entre las innovaciones destacables de la version 1.2 figuran: soporte de hasta 256 opciones por pregunta de tipo `choice` (frente a 10 en la version 1.0), cache opcional de prefijo compartido (`prefix_cache=True`, requiere transformers 5.17.0) util cuando varias preguntas comparten un estado largo, y verificacion de los ficheros del modelo al cargar, con posibilidad de comprobar el hash de cada peso bajo peticion.

## Capacidades

- Clasificacion por eleccion (`choice`): selecciona una opcion entre 2 y 256 alternativas, devolviendo la eleccion, la confianza y las probabilidades por opcion.
- Puntuacion en escala ordenada (`score`): evalua un estado sobre una escala de 2 a 10 niveles, devolviendo nivel esperado, confianza, probabilidades y leyenda.
- Preguntas booleanas (`noul`): devuelve P(verdadero) con confianza asociada para una afirmacion dada.
- Procesamiento de estados heterogeneos: acepta texto libre, JSON o conversaciones completas como entrada.
- Contexto largo: hasta 23.434 tokens completos sin truncado, con rechazo explicito de entradas que excedan el limite.
- Multilingue: soporte declarado de varios idiomas (sin listado detallado).
- Cache de prefijo compartido para reutilizar estados largos entre multiples preguntas.
- Interfaz programatica via paquete Python `quyet` (version 1.2.0), con carga directa desde Hugging Face.
- No se documentan capacidades de generacion libre, tool calling, agentes, vision ni audio.

## Casos de uso

- Triaje de solicitudes de soporte: clasificar mensajes de clientes en intenciones predefinidas (`cancel`, `limit`, `other`) y detectar urgencia con una pregunta `noul`, usando las probabilidades para derivar a agentes humanos cuando la confianza sea baja.
- Moderacion y etiquetado de contenido: asignar categorias o niveles de severidad mediante preguntas `score`, aprovechando la calibracion para fijar umbrales operativos.
- Enrutamiento en pipelines de atencion al cliente: decidir a que cola o departamento enviar una conversacion multi-turno completa, gracias al contexto de 23.434 tokens que permite incluir el historial entero.
- Analisis de sentimiento y tono: medir el grado de molestia de un usuario en una escala ordenada (`calm`, `annoyed`, `angry`) con probabilidades por nivel, util para priorizacion en CRM.
- Extraccion de decisiones sobre datos estructurados: evaluar registros JSON (por ejemplo, solicitudes de credito o incidencias) contra criterios definidos y obtener una clasificacion con confianza auditable.
- Clasificacion documental a gran escala: procesar documentos largos sin truncado para asignar categorias entre muchas opciones (hasta 256), con cache de prefijo para lanzar varias preguntas sobre el mismo documento y reducir coste.
- Automatizacion de QA interno: verificar afirmaciones booleanas sobre estados o conversaciones y usar P(true) como senal para flujos de validacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta mediciones de memoria: en una NVIDIA H100 80GB HBM3 en BF16, una comprobacion uso aproximadamente 16,5 GiB de memoria GPU asignada y 26 GiB reservada; una prueba corta en CPU con float32 uso unos 34 GiB de memoria de proceso.

## Requisitos de hardware

- VRAM estimada: aproximadamente 16,5 GiB asignados y 26 GiB reservados en BF16 sobre H100 80GB; el consumo depende de la entrada y del batching.
- Memoria en CPU: unos 34 GiB de memoria de proceso en float32 para una prueba corta.
- GPU recomendadas: NVIDIA H100 80GB HBM3 (medicion oficial); por tamano de pesos (14,9 GB en BF16), cabria en GPUs con al menos 24 GB de VRAM en BF16, aunque no se documentan pruebas en esas tarjetas.
- GPU de consumo: no se confirma compatibilidad con RTX 4090 u otras consumer; el requisito de memoria reservada observado (26 GiB) sugiere margen justo en tarjetas de 24 GB.
- Despliegue: paquete Python `quyet` 1.2.0 (`pip install "quyet[student]==1.2.0"`), carga con `quyet.load()`. No se soporta `device_map`. El cache de prefijo requiere transformers 5.17.0.
- No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama o TGI, ni cifras de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Quyet-1.2-Small | 7,46B | 23.434 tokens | Modelo de decision con probabilidades calibradas | Apache-2.0 | Hugging Face |
| google/gemma-4-E4B-it | no disponible en la informacion | no disponible | LLM generativo instruct | Apache-2.0 (segun model card de Quyet) | Hugging Face |
| Quyet-1.2-Large | no disponible | no disponible | Modelo de decision | Apache-2.0 | Hugging Face (familia Quyet 1.2) |
| Quyet-1.2-Tiny | no disponible | no disponible | Modelo de decision | Apache-2.0 | Hugging Face (familia Quyet 1.2) |

No se dispone de datos de rendimiento comparativo ni de especificaciones detalladas de las variantes Large y Tiny en la informacion proporcionada.

## Limitaciones y advertencias

- No evaluado para seguridad, sesgos ni robustez adversarial; no debe usarse como unico control en decisiones de alto riesgo.
- En precision reducida (BF16), los resultados pueden diferir ligeramente entre hardware y tamanos de batch en preguntas con probabilidades casi empatadas.
- Las entradas que superan los 23.434 tokens se rechazan; no hay truncado automatico, lo que exige gestionar el tamano de entrada en produccion.
- No se soporta `device_map`, lo que limita el reparto automatico entre multiples GPUs con la libreria estandar.
- El listado de idiomas soportados no esta detallado; el rendimiento por idioma no esta documentado.
- Obligacion de conservar el fichero NOTICE (que empieza por "Quyet by Chinh Nguyen") al redistribuir el modelo o trabajos derivados.
- El modelo esta disenado para clasificar sobre opciones suministradas, no para generacion libre; usarlo fuera de ese proposito no esta soportado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validacion externa practicamente inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chinhnc/Quyet-1.2-Small
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Pagina del proyecto: https://quyet.ai
- Repositorio del paquete: https://github.com/ncchinh/quyet
- Contacto: email@quyet.ai
