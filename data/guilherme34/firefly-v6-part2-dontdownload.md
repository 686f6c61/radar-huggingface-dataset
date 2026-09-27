# Guilherme34/Firefly-v6-part2-dontdownload

## Resumen

Firefly v6 Part 2 es un checkpoint intermedio de un ajuste fino de pesos completos (full fine-tuning) publicado por el usuario Guilherme34 en HuggingFace. Segun la propia model card, se trata del estado del modelo en el paso 901 del optimizador de un total de 8099, con el entrenamiento aun en curso y sin ninguna evaluacion de calidad realizada. El autor advierte de forma explicita en el nombre del repositorio ("dontdownload") que no debe descargarse para uso real, lo que lo situa en la categoria de artefacto de investigacion en progreso mas que de modelo publicable.

El entrenamiento se centra en roleplay, complementado con ejemplos de codigo, uso de herramientas, conversacion natural y ejemplos explicitos de razonamiento con "thinking" activado y desactivado. La model card menciona que tanto el tokenizer como el processor incorporan la plantilla de chat corregida de Gemma 4, lo que apunta a que el modelo se construye sobre la familia Gemma 4, aunque la arquitectura concreta, el numero de parametros y la longitud de contexto no se especifican en ningun momento.

La relevancia actual de esta ficha es fundamentalmente informativa y de advertencia: se publica con 0 descargas y 0 likes, sin licencia declarada, sin idiomas declarados y sin resultados de benchmarks. El repositorio ocupa 11,0 GB y contiene exclusivamente pesos del modelo, sin ficheros de optimizador ni de estado aleatorio, y fue creado y actualizado el 26 de septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. La etiqueta `gemma4` de la model card sugiere la familia Gemma 4, sin confirmacion del autor sobre el tipo concreto (transformer denso o MoE) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no se ha confirmado que la arquitectura sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en este repositorio. Segun los resultados de busqueda, existen versiones cuantizadas de otro checkpoint del mismo autor (`Guilherme34/Firefly-v6-DONTDOWNLOAD-STILLONPROGRESS`), no de este |
| Idiomas soportados | No disponible |
| Licencia | No disponible (sin licencia declarada en la model card ni en los metadatos de HuggingFace) |
| Formato de pesos | No disponible. La model card indica que el repositorio contiene solo pesos, sin ficheros de optimizador ni de estado aleatorio |
| Tamano del repositorio | 11,0 GB |
| Estado del entrenamiento | Checkpoint intermedio en el paso 901 de 8099 del optimizador; entrenamiento en curso |
| Evaluacion de calidad | No realizada, segun declaracion explicita del autor |
| Fecha de creacion | 2026-09-26 |
| Ultima actualizacion | 2026-09-26 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no permite confirmar la arquitectura interna. La model card etiqueta el modelo como `gemma4` y menciona que el tokenizer y el processor llevan la plantilla de chat corregida de Gemma 4, lo que indica que el punto de partida es un modelo de esa familia, pero no se detalla si se trata de un transformer denso, de una arquitectura con mezcla de expertos (MoE) o de cualquier otra variante. Tampoco se especifican el numero de parametros, el numero de capas ni la longitud de contexto soportada.

Sobre el entrenamiento si hay datos concretos: se trata de un ajuste fino de pesos completos (no LoRA ni adaptadores), centrado en roleplay, e incluye ejemplos de codigo, uso de herramientas, conversacion natural y ejemplos explicitos de razonamiento con modo "thinking" activado y desactivado. El autor no indica el numero de tokens de entrenamiento ni la composicion del dataset, y no menciona el uso de RLHF, DPO u otras tecnicas de alineacion posteriores al ajuste supervisado. El repositorio, de 11,0 GB, contiene unicamente pesos, sin estado del optimizador, lo que impide reanudar el entrenamiento desde este checkpoint con la informacion publicada.

Como referencia orientativa, y siempre sin confirmacion por parte del autor, un repositorio de 11,0 GB en precision de 16 bits seria compatible con un modelo del orden de 5.500 millones de parametros (mas los tensores de embeddings y cabezas), pero esta cifra es una estimacion derivada del tamano de los ficheros y no un dato declarado.

## Capacidades

- Generacion de texto conversacional orientada a roleplay, que es el foco declarado del entrenamiento.
- Generacion de codigo, segun la model card, que menciona ejemplos de codigo en el conjunto de entrenamiento.
- Uso de herramientas (tool use), mencionado como parte del entrenamiento, aunque sin detalle del esquema soportado ni de su fiabilidad.
- Razonamiento con modo "thinking" activado y desactivado, con ejemplos explicitos de ambos modos en el entrenamiento.
- Conversacion natural multi-turno, apoyada en la plantilla de chat corregida de Gemma 4 incluida en el tokenizer y el processor.
- Capacidades multilingues: no disponible.
- Capacidades de vision o audio: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible; el tool use se menciona, pero no se documenta un bucle de agente.

Ninguna de estas capacidades ha sido evaluada: el autor indica expresamente que el modelo "no ha sido evaluado en cuanto a calidad".

## Casos de uso

- Investigacion sobre ajuste fino de pesos completos: el repositorio permite inspeccionar el estado intermedio de un entrenamiento a gran escala (paso 901 de 8099) y comparar la evolucion de los pesos, siempre que se disponga del estado del optimizador por otra via, ya que este repositorio no lo incluye.
- Estudio de plantillas de chat de Gemma 4: dado que el tokenizer y el processor incorporan la plantilla de chat corregida, el repositorio sirve como referencia para verificar el formato de mensajes de esa familia antes de integrarlo en otros pipelines.
- Experimentacion con modos "thinking on/off": el entrenamiento incluye ejemplos explicitos de ambos modos, por lo que es un candidato para estudiar como se comporta un modelo parcialmente entrenado al alternar razonamiento explicito y respuesta directa.
- Prototipado de personajes conversacionales en entornos controlados: para equipos que quieran evaluar si el sesgo hacia roleplay se manifiesta ya en etapas tempranas del entrenamiento, con la advertencia de que el autor desaconseja su descarga.
- Pruebas de regresion de pipelines de inferencia: al ser un checkpoint intermedio no evaluado, puede utilizarse para comprobar que un servidor de inferencia (vLLM, TGI, llama.cpp) carga correctamente pesos parciales de la familia Gemma 4 y aplica la plantilla de chat esperada.
- Analisis de calidad de checkpoints intermedios: permite estudiar empiricamente cuestiones como en que punto del entrenamiento aparecen capacidades de codigo o tool use, o cuanto degenera la conversacion generalista cuando el foco es el roleplay.
- Comparacion de tecnicas de cuantizacion sobre modelos en progreso: usando este checkpoint como entrada, se puede medir el impacto de distintas cuantizaciones en un modelo cuyo rendimiento de referencia se desconoce, lo que a su vez sirve para validar metodologias de evaluacion.
- Docencia y divulgacion: como ejemplo practico de por que un repositorio sin licencia, sin evaluacion y con advertencia explicita del autor no debe desplegarse en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que el modelo no ha sido evaluado en cuanto a calidad, y los metadatos de HuggingFace no incluyen ningun resultado de MMLU, HumanEval, GSM8K ni de evaluaciones de roleplay.

## Requisitos de hardware

- VRAM para inferencia: no disponible con exactitud, ya que se desconoce el numero de parametros. Como referencia condicional, un modelo de aproximadamente 5.500 millones de parametros en bf16 ocuparia del orden de 11 GB solo en pesos, mas la cache KV; en cuantizacion de 8 bits rondaria los 6 GB y en 4 bits los 3-4 GB. Estas cifras son estimaciones derivadas del tamano del repositorio (11,0 GB), no datos confirmados.
- GPU recomendadas: no disponible. Dependera del tamano real del modelo; para un modelo de esa magnitud serian suficientes una RTX 4090 (24 GB) o una RTX 3090 (24 GB) en bf16, y una GPU con 16 GB o menos en cuantizacion de 8 o 4 bits.
- GPU de clase centro de datos (A100 40/80 GB, H100 80 GB): compatibles con cualquier escenario razonable, pero no hay datos publicados de throughput ni de latencia.
- Opciones de despliegue: no documentadas por el autor. Al estar etiquetado como `gemma4`, en principio seria compatible con los runners que soporten esa familia (vLLM, TGI, llama.cpp/Ollama si se generan pesos GGUF), pero no hay confirmacion ni conversiones publicadas para este checkpoint concreto.
- Latencia y throughput: no disponible.
- Consideracion practica: al ser un checkpoint intermedio sin evaluar, cualquier medicion de rendimiento tendria un valor limitado y no representaria el comportamiento del modelo al final del entrenamiento.

## Comparativa con modelos similares

No disponible. No se ha identificado en la informacion proporcionada ningun modelo comparable con datos verificables de parametros, contexto, rendimiento o licencia para establecer una comparacion rigurosa. Los unicos artefactos relacionados encontrados en la busqueda web son versiones cuantizadas de otro checkpoint del mismo autor (`Guilherme34/Firefly-v6-DONTDOWNLOAD-STILLONPROGRESS`), que no constituyen una alternativa independiente sino variantes del mismo trabajo en curso. Cualquier comparacion con modelos de roleplay de la familia Gemma 4 u otras familias requeriria datos que no estan disponibles.

## Limitaciones y advertencias

- Checkpoint intermedio sin evaluar: segun el propio autor, corresponde al paso 901 de 8099 y no ha pasado ninguna evaluacion de calidad. El comportamiento final del modelo puede diferir sustancialmente.
- Advertencia explicita del autor: el identificador del repositorio incluye "dontdownload", lo que indica que el propio creador desaconseja su descarga y uso.
- Ausencia de licencia: no se declara licencia alguna. En ausencia de licencia explicita, no se conceden derechos de uso, copia, modificacion ni redistribucion, y en particular no hay autorizacion para uso comercial.
- Riesgo elevado de alucinacion y de degeneracion: al ser un modelo parcialmente entrenado y orientado a roleplay, es previsible que genere contenido incoherente, repita patrones o invente informacion; no se ha publicado ninguna evaluacion al respecto.
- Sesgos: no disponibles. No se documenta la composicion del dataset de entrenamiento, por lo que no es posible auditar sesgos de genero, idioma, cultura o tematica.
- Idiomas: no disponibles. Se desconoce si el entrenamiento ha cubierto idiomas distintos del ingles.
- Longitud de contexto: no disponible. Se desconoce si se ha extendido respecto al modelo base o si se mantiene la del checkpoint de partida.
- Tool calling: se menciona en el entrenamiento, pero no se documenta el esquema de herramientas, el formato de las llamadas ni su fiabilidad. No debe asumirse que funcione en produccion.
- Reproducibilidad: el repositorio no incluye ficheros de optimizador ni de estado aleatorio, por lo que no se puede reanudar el entrenamiento ni reproducir exactamente el estado publicado.
- Uso en produccion: desaconsejado en todos los casos. No hay benchmarks, no hay licencia y el autor lo etiqueta como experimental.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Guilherme34/Firefly-v6-part2-dontdownload
- Perfil del autor en HuggingFace: https://huggingface.co/Guilherme34
- Busqueda de versiones cuantizadas del checkpoint relacionado del mismo autor: https://huggingface.co/models?other=base_model:quantized:Guilherme34/Firefly-v6-DONTDOWNLOAD-STILLONPROGRESS

Nota: los resultados de busqueda web incluian tambien enlaces a herramientas de generacion de imagenes y 3D (3daistudio, openart, Adobe Firefly) sin ninguna relacion con este modelo, por lo que se han omitido.
