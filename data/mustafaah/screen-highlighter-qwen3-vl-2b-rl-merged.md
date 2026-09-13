# mustafaah/screen-highlighter-qwen3-vl-2b-rl-merged

## Resumen

Screen Highlighter es un ajuste fino del modelo multimodal Qwen/Qwen3-VL-2B-Instruct, publicado por el usuario mustafaah, orientado a una unica tarea: dado un pantallazo completo y una instruccion en lenguaje natural, devolver un unico objeto JSON con las cajas de resaltado que corresponden a los elementos solicitados. Se trata de un modelo especializado en *screen grounding* o localizacion visual de elementos de interfaz, no de un asistente conversacional generalista.

El checkpoint publicado es el resultado de fusionar en BF16 los adaptadores LoRA de un entrenamiento de SFT mas RL (*reinforcement learning*, actualizacion 200) sobre la revision base `89644892e4d85e24eaac8bacfd4f463576704203`. Segun la model card, el modelo devuelve `{"op":"highlight","targets":[["yellow",x0,y0,x1,y1],...]}` con coordenadas normalizadas en el rango 0-1000, sin OCR externo ni herramientas de inspeccion. El autor adjunta una validacion de fusion ("merge validation") que compara la misma captura antes y despues de la fusion, con seis cajas de navegacion correspondientes y una diferencia maxima de una unidad en coordenadas normalizadas.

La relevancia practica del modelo esta en su tamano reducido (2.127.532.032 parametros totales, unos 4,3 GB en safetensors) y en su salida estrictamente estructurada, lo que lo hace candidato para integrarse como componente de localizacion visual dentro de pipelines de agentes, pruebas de interfaz o asistentes de soporte. Ahora bien, la ficha publica no incluye evaluacion completa, no declara idiomas soportados ni benchmarks, y el repositorio cuenta con cero descargas y un solo "like" en el momento de redactar esta ficha, por lo que la evidencia disponible sobre su calidad es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (familia Qwen3-VL), derivado de Qwen/Qwen3-VL-2B-Instruct |
| Parametros totales | 2.127.532.032 (aprox. 2,13 mil millones), dato real de safetensors |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 en safetensors; no se publican variantes GGUF, AWQ ni GPTQ en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), tamano de repositorio 4,3 GB |
| Pipeline | image-text-to-text |
| Biblioteca | transformers (se indica Transformers 4.57.6) |
| Tokens de imagen | 256-1024 por captura (configuracion indicada por el autor) |
| Tokens de salida maximos | 1024, decodificacion greedy |
| Formato de salida | JSON con coordenadas normalizadas 0-1000 |
| Modelo base | Qwen/Qwen3-VL-2B-Instruct |
| Adaptadores de origen | mustafaah/screen-highlighter-qwen3-vl-2b-highlight-only-v1 (SHA256 `10c98d1751b609c2c0a7c72cf404f07b931f2aea7220e32106078c0a4390c9ee`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-VL en su variante de 2B, un transformer multimodal que procesa imagen y texto conjuntamente y genera texto; en este caso, la salida se restringe a un unico objeto JSON. El repo no detalla la composicion interna del encoder visual ni del decodificador, ni la ventana de contexto nativa; esos datos deberian consultarse en la documentacion del modelo base, no en esta ficha.

El proceso de entrenamiento descrito por el autor consta de dos fases sobre el modelo base: un SFT (*supervised fine-tuning*) "highlight-only", es decir, entrenado exclusivamente para emitir resaltados, y una posterior fase de RL cuya actualizacion 200 se conserva. Los adaptadores LoRA resultantes se han fusionado en los pesos en BF16, dando lugar al checkpoint publicado, que es el modelo entrenado y no el base. El autor advierte explicitamente de que la fusion en BF16 no es exacta a nivel de token, y que la validacion incluida es un *smoke test* (misma captura, seis cajas de navegacion, diferencia de como maximo una unidad de coordenada normalizada) y no una evaluacion completa. No se especifican en la informacion disponible el volumen de datos de entrenamiento, su composicion, ni los detalles del algoritmo de RL empleado.

## Capacidades

- Localizacion visual de elementos de interfaz a partir de una captura de pantalla completa y una instruccion textual.
- Salida estructurada en JSON con el esquema `{"op":"highlight","targets":[["yellow",x0,y0,x1,y1],...]}`, con coordenadas normalizadas en el rango 0-1000.
- Asignacion de color de resaltado por objetivo (el ejemplo del autor utiliza "yellow").
- Procesamiento de capturas completas sin recorte previo, sin OCR externo y sin herramientas de inspeccion del arbol de accesibilidad.
- Configuracion de 256 a 1024 tokens de imagen por captura, lo que permite cierto equilibrio entre resolucion y coste.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision adicional, audio ni modo "thinking".
- No se documenta el soporte multilingue; se desconoce si las instrucciones en castellano funcionan con la misma calidad que en ingles.
- El modelo esta especializado en resaltado; no se describe como asistente conversacional general, por lo que otras capacidades del modelo base podrian haberse degradado con el ajuste.

## Casos de uso

- Soporte tecnico guiado paso a paso: el usuario envia una captura de su pantalla y una instruccion del tipo "donde pulso para cambiar la contrasena"; el modelo devuelve las cajas de los elementos relevantes para que la interfaz los resalte. El modelo es adecuado porque su salida es directamente consumible por un frontend sin post-procesado complejo.
- Generacion de documentacion y tutoriales: a partir de capturas de una aplicacion, generar automaticamente las regiones a resaltar en cada paso de una guia, reduciendo el trabajo manual de anotacion de imagenes.
- Pruebas de interfaz y regresion visual: integrar el modelo en un pipeline de CI que, dada una captura de la aplicacion en cada commit, verifique que los elementos de navegacion esperados se localizan en las mismas regiones; las cajas normalizadas 0-1000 son comparables entre resoluciones.
- Pre-etiquetado de datasets de GUI grounding: usar el modelo como anotador automatico de cajas sobre capturas masivas, con revision humana posterior, para entrenar modelos de agentes de interfaz. Su tamano de 2,13 B y su salida JSON lo hacen barato de ejecutar en lote.
- Agentes de automatizacion de navegador (RPA): como modulo de percepcion que traduce "el boton de enviar" a coordenadas sobre la captura actual, alimentando despues un executor de clics. Encaja en arquitecturas donde el modelo solo resuelve la localizacion y otra capa decide la accion.
- Accesibilidad: resaltar sobre la pantalla los elementos que el usuario debe pulsar en un flujo complejo, como ayuda visual para personas con baja vision o con dificultades de orientacion en interfaces densas.
- Asistentes de onboarding de producto: generar resaltados contextuales sobre la propia aplicacion durante las primeras sesiones, sin necesidad de mantener manualmente una biblioteca de coordenadas por version de la interfaz.
- Verificacion de cobertura en herramientas de QA manual: dado un guion de prueba en texto, comprobar que todos los elementos mencionados existen y son localizables en la captura actual, marcando los pasos ambiguos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato de validacion aportado por el autor es una prueba de humo de la fusion: se compara la misma captura antes y despues de fusionar los adaptadores, con seis cajas de navegacion correspondientes y una diferencia maxima de una unidad en coordenadas normalizadas. El propio autor indica que esta prueba no constituye una evaluacion completa y que la fusion en BF16 no es exacta a nivel de token. No hay resultados de MMLU, HumanEval, GSM8K, ScreenSpot ni de ninguna otra suite de grounding visual.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 4,25 GB (2,13 mil millones de parametros), coherente con el tamano de repositorio de 4,3 GB.
- VRAM estimada para inferencia: del orden de 6-8 GB en BF16 con contexto corto y 256 tokens de imagen; conviene reservar 8-12 GB para trabajar comodamente con 1024 tokens de imagen y margen para las activaciones del encoder visual. Son estimaciones, no cifras publicadas por el autor.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas, como RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090 (24 GB). En tarjetas de 8 GB el margen es muy ajustado y depende de la resolucion de la captura.
- GPU de centro de datos: A100, H100, L40S, L4 o A10 son suficientes y quedan sobredimensionadas para un solo flujo; su interes esta en el despliegue por lotes o con muchas peticiones concurrentes.
- CPU: la inferencia en CPU es posible por el tamano, pero no se documenta soporte ni rendimiento; no hay datos de latencia.
- Opciones de despliegue: Transformers (el autor indica explicitamente la version 4.57.6), y por familia de modelo, servidores compatibles con Qwen3-VL como vLLM o TGI. El autor no confirma compatibilidad con llama.cpp, Ollama ni LM Studio para este checkpoint.
- Requisito de prompt: el autor indica que debe usarse el *system prompt* incluido en el repositorio; no usarlo puede degradar la calidad de la salida.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este checkpoint, por lo que la comparacion se limita a caracteristicas verificables.

| Modelo | Parametros | Tarea | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mustafaah/screen-highlighter-qwen3-vl-2b-rl-merged | 2,13 mil millones | Resaltado de elementos de interfaz (salida JSON) | Apache 2.0 | HuggingFace, transformers | 0 descargas, 1 like; sin benchmarks publicados |
| Qwen/Qwen3-VL-2B-Instruct | no disponible en la informacion proporcionada | Vision-lenguaje general | no disponible en la informacion proporcionada | HuggingFace | Modelo base del ajuste; no esta especializado en salida JSON de resaltado |
| mustafaah/screen-highlighter-qwen3-vl-2b-highlight-only-v1 | no disponible | Adaptadores LoRA "highlight-only" | no disponible en la informacion proporcionada | HuggingFace | Origen de los adaptadores fusionados; requiere el modelo base |
| Otras alternativas de grounding de interfaz (por ejemplo, modelos de la familia Florence-2 o Qwen2.5-VL) | no disponible | Deteccion y grounding visual | no disponible | HuggingFace | No se dispone de datos verificados en la informacion proporcionada para establecer una comparacion |

## Limitaciones y advertencias

- Alcance muy restringido: el modelo esta entrenado para devolver un unico JSON de resaltado; no debe esperarse de el dialogo general, redaccion, codigo ni razonamiento abierto.
- Ausencia de evaluacion completa: el propio autor califica la validacion incluida como *smoke test* con seis cajas, no como evaluacion. No hay benchmarks ni conjunto de prueba publico.
- Fusion no exacta: el merge en BF16 no es exacto a nivel de token, lo que puede introducir divergencias respecto al comportamiento de los adaptadores sin fusionar.
- Validacion de la comunidad practicamente nula: 0 descargas y 1 like en el momento de redactar la ficha, sin issues ni discusiones publicas documentadas.
- Riesgo de alucinacion visual: al ser un modelo de 2B, es probable que genere cajas plausibles para elementos inexistentes o con coordenadas desplazadas en interfaces densas. Debe haber validacion posterior (comprobacion de que la region contiene contenido real).
- Dependencia del *system prompt*: el autor exige usar el prompt de sistema incluido y Transformers 4.57.6; variaciones pueden degradar la salida.
- Formato de coordenadas fijo: las cajas se expresan en el rango normalizado 0-1000, por lo que cualquier consumidor debe reescalar a la resolucion real de la captura.
- Sin OCR ni inspeccion del arbol de accesibilidad: el modelo depende exclusivamente de los pixeles, lo que limita la precision en texto pequeno o interfaces de bajo contraste.
- Idiomas no declarados: se desconoce el comportamiento con instrucciones en castellano; es probable un sesgo hacia el ingles en los datos de entrenamiento, aunque no esta confirmado.
- Limites de contexto no publicados: no se puede planificar el coste de una captura de alta resolucion a partir de la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-VL-2B-Instruct y de los adaptadores de origen antes de desplegar en produccion.
- Fecha de publicacion: el repositorio figura creado el 13 de septiembre de 2026 y actualizado dos minutos despues, por lo que es un artefacto muy reciente y sin rodaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mustafaah/screen-highlighter-qwen3-vl-2b-rl-merged
- Adaptadores de origen (highlight-only v1): https://huggingface.co/mustafaah/screen-highlighter-qwen3-vl-2b-highlight-only-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Revision base declarada por el autor: `89644892e4d85e24eaac8bacfd4f463576704203`
- Adaptador, SHA256 declarado: `10c98d1751b609c2c0a7c72cf404f07b931f2aea7220e32106078c0a4390c9ee`
- Papers, blogs, repositorios o demos adicionales: no disponibles; la busqueda web realizada no devolvio resultados relevantes sobre este modelo.
