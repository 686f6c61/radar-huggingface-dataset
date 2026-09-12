# mradermacher/Hi-Token-GGUF

## Resumen

Hi-Token-GGUF es la version cuantizada en formato GGUF del modelo multimodal xyzzzh/Hi-Token, publicada por el usuario mradermacher (responsable tambien de la infraestructura de cuantizacion de nethype GmbH). El modelo original es un sistema de vision-lenguaje orientado a tareas de localizacion visual: visual grounding, comprension de expresiones referenciales (referring expression comprehension) y generacion de coordenadas, apoyado en una tecnica de tokenizacion jerarquica que aparece etiquetada en la model card. El repositorio que nos ocupa no entrena nada nuevo: empaqueta los pesos del modelo base en una bateria de cuantizaciones estaticas listas para inference engines compatibles con GGUF.

El dato de parametros registrado en el repositorio (ficheros safetensors) es de 3.397.103.616 parametros, es decir, en torno a 3,4 mil millones, con un peso total del repositorio de 32,8 GB repartido entre todas las variantes de cuantizacion y dos ficheros mmproj (proyector multimodal) en Q8_0 y f16. Se trata, por tanto, de un modelo de vision-lenguaje de gama pequena, ejecutable en GPU de consumo, y no de un LLM de gran escala.

Su relevancia practica es doble: por un lado, permite reproducir localmente tareas de grounding que habitualmente requieren APIs propietarias; por otro, la existencia de ficheros mmproj separados confirma que la arquitectura es multimodal con un proyector independiente, lo que simplifica el despliegue en llama.cpp. La informacion disponible es limitada: no hay pipeline declarado, no hay licencia indicada, no hay datos de benchmarks publicados en la informacion consultada y la busqueda web realizada no devolvio resultados relacionados con el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal vision-lenguaje; incluye proyector multimodal mmproj y tokenizacion jerarquica para generacion de coordenadas, segun tags) |
| Parametros totales | 3.397.103.616 (dato de safetensors del repositorio) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mmproj-Q8_0 (0,9 GB), mmproj-f16 (1,4 GB), Q2_K (1,5 GB), Q3_K_S (1,7 GB), Q3_K_M (1,8 GB), Q3_K_L (1,9 GB), IQ4_XS (2,0 GB), Q4_K_S (2,1 GB), Q4_K_M (2,2 GB), Q5_K_S (2,5 GB), Q5_K_M (2,5 GB), Q6_K (2,9 GB), Q8_0 (3,7 GB), f16 (6,9 GB) |
| Idiomas soportados | en (segun model card) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye en formato transformers |
| Modelo base | xyzzzh/Hi-Token |
| Cuantizador | mradermacher |
| Referencia del paper | arXiv:2608.03471 |
| Tamano del repositorio | 32,8 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion y actualizacion | 12 de septiembre de 2026 |

## Arquitectura y entrenamiento

La model card del repositorio de cuantizacion no describe la arquitectura interna del modelo base. Los unicos indicios tecnicos disponibles son las etiquetas declaradas (visual-grounding, referring-expression-comprehension, coordinate-generation, hierarchical-tokenization) y la presencia de ficheros mmproj, que en el ecosistema GGUF corresponden a un proyector multimodal separado del cuerpo del modelo de lenguaje. Esto es coherente con una arquitectura de tipo vision encoder mas adaptador mas transformer de lenguaje, en la linea habitual de los VLM de gama pequena, pero no se dispone de la configuracion exacta (numero de capas, dimension oculta, numero de cabezas de atencion, tipo de vision encoder ni resolucion de entrada soportada).

Respecto a los datos de entrenamiento, no hay informacion disponible en el material proporcionado: no se indica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. La innovacion que se deduce de las etiquetas es la tokenizacion jerarquica aplicada a la generacion de coordenadas, un enfoque que suele consistir en representar las posiciones espaciales como secuencias de tokens en lugar de como valores continuos de regresion, lo que permite reutilizar el decodificador autoregresivo estandar para localizar objetos en una imagen. No se dispone de mas detalle sobre el mecanismo concreto ni sobre el proceso de entrenamiento.

## Capacidades

- Localizacion visual (visual grounding): identificacion de objetos en una imagen y devolucion de sus coordenadas delimitadoras.
- Comprension de expresiones referenciales: dado un texto descriptivo ("el coche rojo aparcado junto a la entrada"), el modelo debe localizar el objeto correspondiente.
- Generacion de coordenadas mediante tokenizacion jerarquica, en lugar de regresion directa de bounding boxes.
- Procesamiento de entrada multimodal imagen-texto, con proyector multimodal distribuido por separado (mmproj) para su uso en llama.cpp y derivados.
- Generacion de texto conversacional: el repositorio esta etiquetado como conversational, por lo que el modelo base conserva el formato de dialogo.
- Compatibilidad declarada con endpoints (etiqueta endpoints_compatible), es decir, apto para servir a traves de infraestructura de inferencia estandar.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas a ingles segun la model card.
- Modo thinking explicito, audio u otras modalidades: no disponibles.

## Casos de uso

- Anotacion automatica de datasets de vision: el modelo puede pre-etiquetar bounding boxes a partir de descripciones textuales, reduciendo el coste de anotacion humana en proyectos de deteccion de objetos y grounding. Su tamano de 3,4B permite ejecutarlo en una estacion de trabajo con GPU de gama media.
- Agentes de interfaz grafica (GUI agents): la generacion de coordenadas a partir de descripciones permite localizar botones, campos de formulario o elementos de menu sobre capturas de pantalla, habilitando automatizacion de tareas sobre aplicaciones sin API.
- Auditoria de lineales y retail: dado un catalogo de productos descritos en texto, el modelo localiza su presencia y posicion en fotografias de estanterias, util para control de stock y verificacion de planogramas.
- Accesibilidad asistida: descripcion de la posicion espacial de elementos en una imagen para usuarios con discapacidad visual, respondiendo a consultas del tipo "donde esta la salida de emergencia en esta foto".
- Moderacion de contenido con localizacion: detectar y senalar la ubicacion de regiones concretas de una imagen en flujos de revision, en lugar de limitarse a una clasificacion binaria sin informacion espacial.
- Robotica y manipulacion: integracion en pipelines de percepcion donde una instruccion en lenguaje natural debe traducirse en una region objetivo sobre la imagen de la camara, antes de calcular la pinza o el punto de agarre.
- Inferencia en local y en el borde: con cuantizaciones desde 1,5 GB es viable desplegar el modelo en equipos sin conectividad o con requisitos de privacidad estrictos, siempre que se acepte la perdida de calidad de las cuantizaciones bajas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye tablas de evaluacion, y la busqueda web realizada no devolvio ningun resultado relacionado con el modelo Hi-Token ni con su paper (arXiv:2608.03471). El unico dato cuantitativo de rendimiento disponible es el grafico comparativo generico de perplejidad entre tipos de cuantizacion enlazado en la propia model card (https://www.nethype.de/huggingface_embed/quantpplgraph.png), que no es especifico de este modelo. Se recomienda no asumir cifras de MMLU, HumanEval, RefCOCO o similares sin verificarlas en el repositorio del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contar cache KV ni activaciones):
  - Q2_K: ~1,5 GB mas 0,9 GB de mmproj Q8_0, en torno a 2,5 GB.
  - Q4_K_S / Q4_K_M: ~2,1-2,2 GB mas 0,9-1,4 GB de mmproj, en torno a 3,0-3,6 GB.
  - Q5_K_S / Q5_K_M: ~2,5 GB mas mmproj, en torno a 3,4-3,9 GB.
  - Q6_K: ~2,9 GB mas mmproj, en torno a 3,8-4,3 GB.
  - Q8_0: ~3,7 GB mas mmproj, en torno a 4,6-5,1 GB.
  - f16: ~6,9 GB mas mmproj f16, en torno a 8,3 GB (el propio autor lo califica de "overkill").
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM es suficiente para las cuantizaciones de 4 bits. Resultan adecuadas RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; en el entorno profesional, A100, H100 o L40S permiten servir multiples instancias concurrentes con margen sobrado.
- Cabe en GPU de consumo: si, de forma holgada. Incluso iGPUs con memoria unificada y placas como la RTX 3050 de 8 GB pueden ejecutar las variantes Q4 o Q5, y la variante Q2_K es viable en equipos con 4 GB de VRAM compartida.
- Opciones de despliegue: llama.cpp y llama-server (soporte nativo de GGUF y de mmproj), Ollama, LM Studio, koboldcpp, Jan y cualquier runtime basado en llama.cpp. Para el modelo base sin cuantizar se usaria transformers. vLLM y TGI no estan confirmados para este modelo en la informacion disponible.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de fuentes publicas de referencia y no han sido verificados en la busqueda web realizada; se marcan como "no disponible" los campos que no se pueden confirmar con rigor.

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Hi-Token-GGUF (mradermacher) | 3,4B | no disponible | no disponible | GGUF | Grounding y generacion de coordenadas con tokenizacion jerarquica |
| xyzzzh/Hi-Token (modelo base) | 3,4B | no disponible | no disponible | transformers | Modelo original sin cuantizar |
| Qwen2.5-VL-3B-Instruct | ~3,75B | 32K (extensible) | Apache-2.0 | safetensors, GGUF (comunidad) | VLM generalista con grounding y OCR |
| Florence-2-large | ~0,77B | no disponible | MIT | safetensors | Vision generalista con tareas de deteccion y grounding |

No se dispone de datos de rendimiento comparado entre Hi-Token y estos modelos, por lo que la eleccion entre ellos deberia basarse en una evaluacion propia sobre el conjunto de datos objetivo.

## Limitaciones y advertencias

- Licencia no declarada: tanto el modelo base como esta cuantizacion carecen de licencia indicada en la informacion disponible. No se debe asumir uso comercial libre; es imprescindible contactar con el autor del modelo base (xyzzzh) antes de cualquier despliegue en produccion.
- Sesgos conocidos: no hay informacion disponible sobre evaluaciones de sesgo. Al ser un modelo entrenado predominantemente en ingles, es previsible un peor desempeno en imagenes con contextos culturales no anglosajones, aunque esto no esta cuantificado.
- Riesgo de alucinacion: los modelos de grounding pueden devolver coordenadas plausibles pero incorrectas cuando el objeto descrito no existe en la imagen. Es recomendable anadir una verificacion posterior (por ejemplo, comprobar que la region delimitada contiene el objeto esperado) antes de actuar sobre la salida.
- Limitacion de idioma: la model card declara unicamente ingles. Las instrucciones en castellano pueden degradar la precision del grounding o producir respuestas incoherentes.
- Longitud de contexto desconocida: no se puede planificar el uso con imagenes de alta resolucion, multiples imagenes por consulta o dialogos largos sin antes medir el limite real.
- Cuantizaciones agresivas: Q2_K, Q3_K_S y Q3_K_M reducen el tamano a 1,5-1,8 GB, pero el propio cuantizador advierte de "lower quality" en Q3_K_M. En tareas de localizacion precisa, una perdida pequena de calidad puede traducirse en bounding boxes desplazadas varios pixeles, lo que invalida el caso de uso.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, ademas de ausencia de datos de benchmarks, lo que implica que el modelo no ha sido validado por la comunidad. No se recomienda su adopcion en produccion critica sin una evaluacion interna exhaustiva.
- Ficheros mmproj obligatorios: para usar las capacidades de vision es necesario descargar y cargar el proyector multimodal ademas de los pesos cuantizados; omitirlo convierte el modelo en un LLM de texto sin acceso a imagenes.

## Enlaces

- Repositorio HuggingFace (cuantizacion GGUF): https://huggingface.co/mradermacher/Hi-Token-GGUF
- Modelo base: https://huggingface.co/xyzzzh/Hi-Token
- Pagina de resumen de cuantizaciones del autor: https://hf.tst.eu/model#Hi-Token-GGUF
- Paper de referencia declarado en los tags: arXiv:2608.03471 (no se ha localizado ni verificado en la busqueda realizada)
- Guia generica de uso de ficheros GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de perplejidad entre tipos de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
