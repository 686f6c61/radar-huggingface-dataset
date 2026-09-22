# nampham1106/laya-flash

## Resumen

laya-flash (LFM2.5 baseline) es un checkpoint publicado por el usuario nampham1106 dentro del proyecto laya-flash, y no un modelo entrenado. Se trata de un *baseline* de formato: empaqueta los pesos preentrenados del encoder LiquidAI/LFM2.5-Encoder-230M dentro de la estructura de checkpoint que espera la librería laya-flash, con la cabecera de decisión inicializada de forma aleatoria (semilla 42) y sin entrenar. El propio autor advierte que se deben esperar probabilidades casi uniformes y confianzas cercanas a cero en cualquier consulta.

El modelo resuelve un problema de ingeniería, no de inferencia: fija el contrato de ficheros (`rl_agent_config.json`, `model.safetensors` en fp32, `tokenizer/`, `encoder/config.json`) y las formas de tensor que necesitará cualquier fine-tune posterior del agente de decisión. Con 256.205.318 parámetros totales (unos 256 M) y un repositorio de 1,0 GB, es un artefacto ligero pensado para servir de punto de partida reproducible, no para desplegarse.

Su relevancia actual es acotada pero clara para quien trabaje con agentes de decisión sobre backbones compactos: permite validar la integración con la librería laya-flash, comparar experimentos contra una línea base fija y arrancar fine-tunes con las dimensiones correctas de la cabeza. Fuera de ese contexto, el checkpoint no ofrece capacidades funcionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional (backbone LFM2.5-Encoder-230M) con cabecera de decision compuesta por capas transformer, scorer y act head |
| Parametros totales | 256.205.318 (aprox. 256 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica el state dict completo en fp32; no incluye GGUF, AWQ, GPTQ ni variantes de 8/4 bits) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (identificador `lfm1.0`, etiqueta `license: other` en HuggingFace) |
| Formato de pesos | safetensors (`model.safetensors`, state dict completo en fp32) |
| Modelo base | LiquidAI/LFM2.5-Encoder-230M |
| Tamano del repositorio | 1,0 GB |
| Ficheros del checkpoint | `rl_agent_config.json`, `model.safetensors`, `tokenizer/`, `encoder/config.json` |
| Estado de la cabecera de decision | Inicializacion aleatoria (semilla 42), sin entrenar |
| Temperaturas | Neutras (1.0, sin calibracion) |
| Dependencia de runtime | `laya-flash[lfm2]`, transformers >= 4.55 |
| Descargas / likes | 0 descargas, 1 like |

## Arquitectura y entrenamiento

El checkpoint combina dos piezas. La primera es el encoder LiquidAI/LFM2.5-Encoder-230M, que se publica con sus pesos preentrenados intactos y con parches bidireccionales adaptados del fichero `modeling_lfm2_bidirectional.py` de LiquidAI, distribuido bajo licencia Apache-2.0. La segunda es la cabecera de decisión, formada por capas transformer, un scorer y un *act head*, que en esta publicación está inicializada de forma aleatoria con semilla 42 y no ha recibido ningún entrenamiento.

No hay, por tanto, datos de entrenamiento que reportar en esta versión: no se especifican número de tokens, composición del dataset, ni fases de RLHF, DPO o ajuste supervisado. Las temperaturas se dejan en su valor neutro (1.0) porque no se ha ejecutado ningún proceso de calibración. El fichero `rl_agent_config.json` sí define los hiperparámetros operativos que espera el agente (`act_costs`, `cost_wrong_act`, `max_prefixes`, `amp_dtype`), de modo que un fine-tune puede arrancar desde aquí con las formas de tensor previstas por la librería. La innovación técnica, en sentido estricto, es de formato y compatibilidad, no de modelado.

## Capacidades

- Las capacidades funcionales del checkpoint son nulas en su estado actual: la cabecera de decisión no está entrenada y produce salidas casi uniformes con confianza cercana a cero, tal y como declara el autor.
- La API prevista por la librería laya-flash (`agent.system_one(texto, especificacion)`) contempla tareas de decisión con esquema de elección, por ejemplo clasificar la intención de un cliente entre `refund`, `tech` u `other` a partir de criterios textuales.
- La arquitectura objetivo incorpora un *act head* y costes de acción (`act_costs`, `cost_wrong_act`), lo que apunta a selección de acciones con penalización de errores, aunque estos componentes no han sido entrenados en este checkpoint.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades multilingües ni lista de idiomas.
- No se documentan capacidades de visión, audio ni modo *thinking*.
- No se documenta generación de texto libre: el uso previsto es de decisión/clasificación sobre un encoder, no de decodificación generativa.

## Casos de uso

- Punto de partida para fine-tuning: el checkpoint fija las formas de la cabecera de decisión y el contrato de ficheros de laya-flash, de modo que un entrenamiento posterior puede sobrescribir los pesos en el mismo repositorio sin cambiar el código de carga.
- Validación de integración de pipeline: sirve para comprobar que la instalación de `laya-flash[lfm2]`, la versión de transformers (>= 4.55) y la carga del tokenizer y del encoder funcionan antes de invertir tiempo de entrenamiento.
- Pruebas de humo (*smoke test*) en CI: al ocupar aproximadamente 1 GB en fp32, puede descargarse y ejecutarse en un runner de integración continua para verificar que la API `Agent` responde con el esquema esperado.
- Referencia de comparación reproducible: al usar una semilla fija (42) y temperaturas neutras, permite contrastar métricas de futuros fine-tunes contra una línea base estable y sin sesgo de calibración.
- Desarrollo de arneses de evaluación: los equipos que construyan *benchmarks* de decisión para agentes laya-flash pueden usarlo como sujeto de prueba con salidas conocidas (casi uniformes) para validar que el harness detecta correctamente el azar.
- Verificación de compatibilidad de pesos: útil para comprobar que un cargador, un script de conversión o un *tokenizer* propio interpretan correctamente el state dict fp32 antes de aplicar cuantización o reentrenamiento.
- Reproducción de la estructura de un agente de decisión: sirve como plantilla de proyecto para quien quiera estudiar cómo se organizan encoder, scorer y act head en un checkpoint laya-flash.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que las salidas del checkpoint son casi uniformes y con confianza cercana a cero, comportamiento esperado de una cabecera sin entrenar, por lo que cualquier métrica de decisión carecería de sentido en esta versión.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,02 GB con los pesos en fp32 (256,2 M de parámetros), unos 0,51 GB en fp16/bf16 y unos 0,26 GB en int8. Son estimaciones aritméticas a partir del número de parámetros; el repositorio no publica variantes cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente. No se requiere A100, H100 ni hardware de centro de datos.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y modelos inferiores con 4 GB o más. También es viable en CPU, dado el tamaño del modelo.
- Opciones de despliegue: la ruta documentada es la librería `laya-flash` con el extra `[lfm2]` y transformers >= 4.55. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia.
- Latencia y throughput: no disponible. No se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Estado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nampham1106/laya-flash | 256,2 M | no disponible | Cabecera de decision sin entrenar (baseline de formato) | LFM Open License v1.0 | Repositorio HuggingFace propio, 0 descargas |
| LiquidAI/LFM2.5-Encoder-230M | no disponible en la informacion proporcionada | no disponible | Encoder preentrenado por LiquidAI | no disponible en la informacion proporcionada | Repositorio HuggingFace de LiquidAI |
| Otros modelos de decision de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion sustentada por la informacion disponible es la del checkpoint con su propio modelo base: laya-flash reutiliza los pesos del encoder sin modificarlos y anade una cabecera aleatoria de aproximadamente 26 M de parametros (diferencia entre los 256,2 M totales y los 230 M que indica la denominacion del encoder). La busqueda web realizada no devolvio resultados relevantes: los enlaces obtenidos correspondian a un servicio de correo y no guardan relacion con el modelo, por lo que no se dispone de comparativas externas.

## Limitaciones y advertencias

- Modelo no utilizable en produccion: la cabecera de decision esta inicializada aleatoriamente y sin entrenar. Las respuestas seran practicamente uniformes y la confianza cercana a cero; no es un error, es el comportamiento declarado del checkpoint.
- Sin datos de entrenamiento: no se documentan tokens, composicion del dataset ni fases de alineacion, por lo que no es posible evaluar sesgos aprendidos ni calidad de las decisiones.
- Riesgo de interpretacion erronea: al devolver un esquema de decision valido pero con contenido aleatorio, puede generar falsos positivos en pruebas automatizadas que solo verifiquen el formato de la respuesta y no su contenido.
- Licencia restrictiva respecto a permisos habituales: se distribuye bajo la LFM Open License v1.0. El uso comercial esta licenciado solo por debajo de 10 M USD de ingresos anuales, y toda redistribucion debe incluir la licencia y la atribucion correspondiente.
- Obra derivada: el checkpoint es una obra derivada de los pesos de Liquid AI, Inc. y mantiene la misma licencia; los parches bidireccionales de LFM2 proceden del fichero Apache-2.0 de LiquidAI.
- Sin informacion de contexto ni de idiomas: no se puede garantizar el comportamiento con secuencias largas ni con textos en idiomas distintos del ingles de los ejemplos de la model card.
- Publicacion en fp32 unicamente: no hay cuantizaciones oficiales, lo que limita despliegues en entornos con restricciones de memoria muy severas, aunque el modelo es pequeno en terminos absolutos.
- Validacion comunitaria practicamente inexistente: 0 descargas y 1 like en el momento de la consulta; no hay evidencia externa de su comportamiento.
- Fechas de publicacion y actualizacion (22 de septiembre de 2026) y ausencia de *pipeline* declarado en HuggingFace; conviene verificar el estado del repositorio antes de integrarlo, dado que el autor indica que las versiones con fine-tuning reemplazaran estos ficheros en el mismo sitio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nampham1106/laya-flash
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-Encoder-230M
- Repositorio del proyecto laya-flash: https://github.com/nampq11/laya-flash
- Licencia LFM Open License v1.0: fichero `LICENSE` del repositorio en HuggingFace
- Busqueda web: no se encontraron enlaces relevantes sobre el modelo; los resultados devueltos no guardaban relacion con la consulta.
