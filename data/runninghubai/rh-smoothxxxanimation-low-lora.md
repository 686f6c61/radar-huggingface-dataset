# RunningHubAI/rh-smoothxxxanimation-low-lora

## Resumen

rh-smoothxxxanimation-low-lora es un adaptador LoRA publicado por RunningHubAI (RunningHub) en nombre del autor T8star-Aix, pensado para su uso como extension de un modelo de difusion de video de la familia WAN 2.2. El repositorio no contiene un modelo completo, sino un unico fichero de pesos de 293 MiB (`SmoothXXXAnimation_Low.safetensors`) que se carga junto al modelo base. Su proposito declarado es la generacion de animaciones de contenido sexual explicito, y la model card incluye un conjunto de palabras de activacion asociadas a practicas sexuales concretas.

Se trata, por tanto, de un ajuste fino de bajo rango orientado a un nicho muy especifico y no de un modelo de lenguaje: no procesa texto como tarea principal, no razona, no ejecuta codigo y no soporta tool calling ni agentes. Su funcion es modular la salida visual del modelo base de difusion para producir secuencias animadas con una tematica concreta, dentro de flujos de trabajo de ComfyUI o de la plataforma en la nube de RunningHub.

Su relevancia actual es limitada y muy acotada: en el momento de redactar esta ficha el repositorio registra cero descargas y cero "likes", la licencia no esta especificada y no se han publicado resultados de evaluacion. Para un desarrollador o investigador, su interes practico pasa por estudiar como se distribuyen adaptadores LoRA de difusion de video en HuggingFace, como se encadenan en ComfyUI o como la plataforma de origen monetiza el entrenamiento y la inferencia de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (low-rank adaptation) sobre un modelo de difusion de video de la familia WAN 2.2; la arquitectura concreta del modelo base no se detalla en la informacion proporcionada |
| Parametros totales | No disponible; el unico peso publicado ocupa 293 MiB |
| Parametros activos | No aplica (el adaptador hereda la estructura del modelo base; no se documenta si este es MoE) |
| Longitud de contexto | No aplica / no disponible; al ser un modelo de difusion de video, la "longitud" se mide en numero de fotogramas y resolucion, datos no especificados |
| Tipos de cuantizacion | No disponible; solo se publica un fichero safetensors, sin versiones GGUF, fp8 ni cuantizadas |
| Idiomas soportados | No disponible; la condicion de texto depende del codificador del modelo base, no documentado en esta ficha |
| Licencia | No disponible; la model card remite a la licencia del proyecto original y a la del modelo base (WAN 2.2) |
| Formato de pesos | safetensors (`SmoothXXXAnimation_Low.safetensors`, 293 MiB) |
| Modelo base | WAN 2.2 (fine-tuning declarado por el autor) |
| Modelo de origen | Civitai, modelo 2040641 (version 2376143) |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Tamano del repositorio | 0,3 GB |
| Fecha de publicacion | 28 de septiembre de 2026 (segun metadatos del repositorio) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del adaptador. Por el tipo de fichero y el ecosistema en el que se publica, se trata de un LoRA de bajo rango que se inyecta en las capas del modelo de difusion base WAN 2.2, sin que se especifiquen el rango, los modulos objetivo (atencion, proyecciones, bloques de tiempo) ni el numero exacto de parametros entrenables. El sufijo "Low" del nombre del fichero no se explica en la model card; podria referirse al experto de bajo ruido del modelo base o a un nivel de intensidad bajo del propio adaptador, pero ninguna de las dos hipotesis esta confirmada por el autor.

Tampoco hay datos sobre el proceso de entrenamiento: no se indica el volumen de datos, su composicion, la resolucion o duracion de los clips usados, el numero de pasos, la tasa de aprendizaje, el metodo de optimizacion ni si se aplicaron tecnicas como regularizacion con imagenes de clase o entrenamiento con captions estructurados. No se menciona uso de RLHF, DPO ni ninguna otra fase de alineacion. La model card se limita a listar palabras de activacion y el modelo base, por lo que cualquier detalle adicional sobre el pipeline de entrenamiento debe considerarse no disponible.

## Capacidades

- Generacion de animacion de video con tematica sexual explicita, mediante el condicionamiento del modelo base WAN 2.2 con las palabras de activacion indicadas por el autor.
- Modulacion de la consistencia temporal y del aspecto visual de la secuencia dentro de un flujo de difusion de video (el nombre del adaptador sugiere un enfasis en suavidad de movimiento, aunque no hay confirmacion tecnica de ello).
- Compatibilidad con flujos de ComfyUI como nodo de carga de LoRA sobre el modelo base, y con la plataforma en la nube RunningHub.
- Posibilidad de apilarse con otros LoRA del mismo modelo base, si el flujo de trabajo lo permite; no documentado por el autor.
- No es un modelo de lenguaje: no realiza generacion de texto, razonamiento, matematicas ni codigo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues propias; la comprension del prompt depende del codificador de texto del modelo base.
- No tiene modo "thinking", ni procesamiento de audio, ni vision por computador de entrada (no acepta imagenes como tarea de analisis, solo como posible condicionamiento si el modelo base lo permite).
- No incluye mecanismos de seguridad, filtrado ni moderacion de contenido.

## Casos de uso

- Produccion por lotes de clips animados para plataformas de contenido adulto de suscripcion: el adaptador se cargaria en ComfyUI junto al modelo base WAN 2.2 y se ejecutaria en cola para generar variaciones de una misma escena con las palabras de activacion fijadas como plantilla de prompt.
- Post-produccion de animacion 2D o 3D para adultos: uso del adaptador como capa de estilo o de suavizado de movimiento sobre una secuencia ya generada, siempre que el flujo de difusion de video permita condicionamiento sobre video existente.
- Prototipado rapido de storyboards para estudios de animacion para adultos: generacion de clips cortos de baja resolucion para validar encuadres, ritmos y transiciones antes de pasar a produccion manual.
- Personalizacion de personajes recurrentes por parte de creadores independientes: combinacion del LoRA con adaptadores de identidad de personaje del mismo modelo base para mantener coherencia entre episodios, sujeto a las limitaciones de apilado de LoRA del pipeline.
- Investigacion sobre adaptadores de bajo rango en difusion de video: analisis de como un LoRA de 293 MiB altera el comportamiento de un modelo base grande, con experimentos de fuerza de escala, ablacion de rango y comparacion entre el experto de alto y bajo ruido.
- Evaluacion de plataformas de inferencia gestionada: uso del modelo a traves de la API de RunningHub para medir coste, latencia y calidad sin desplegar GPU propia, comparando el resultado con el de una ejecucion local en ComfyUI.
- Auditoria de contenido y cumplimiento: caso de uso defensivo para equipos de moderacion que necesiten entender que tipo de material puede generar esta familia de adaptadores y disenar filtros o politicas al respecto.

Todos estos escenarios estan sujetos a las restricciones legales y de licencia descritas en la seccion de limitaciones, en particular la prohibicion de producir material que implique a menores o a personas sin consentimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FVD, CLIP score, SSIM temporal, evaluacion humana) ni comparaciones cuantitativas con otros adaptadores. El repositorio registra cero descargas y cero valoraciones, por lo que tampoco existe retroalimentacion de la comunidad que permita estimar su calidad.

## Requisitos de hardware

- Espacio en disco: 293 MiB adicionales sobre el modelo base.
- VRAM: no disponible de forma directa; el consumo lo determina el modelo base WAN 2.2, no el adaptador. Cualquier cifra concreta debe considerarse una estimacion orientativa y no confirmada en la informacion proporcionada.
- GPU de gama profesional: necesaria para el modelo base en precision completa sin offloading; el adaptador en si no anade requisitos relevantes.
- GPU de consumo: previsiblemente viable en tarjetas de 24 GB (RTX 3090, RTX 4090) si el modelo base se ejecuta con offloading secuencial o en variantes cuantizadas; en tarjetas de 12-16 GB el margen es ajustado y depende del numero de fotogramas y de la resolucion.
- Opciones de despliegue: ComfyUI como entorno nativo del adaptador; RunningHub como servicio en la nube; diffusers si la version desplegada soporta el modelo base y la carga de LoRA. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no son motores de difusion de video.
- Latencia y throughput: no disponible. En difusion de video la latencia escala con el numero de pasos de muestreo, fotogramas y resolucion, y no hay datos publicados para este adaptador concreto.
- Almacenamiento y ancho de banda: el modelo base y los resultados intermedios dominan el consumo de disco y de memoria; el adaptador es marginal en ambos aspectos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / duracion | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|---|
| rh-smoothxxxanimation-low-lora | LoRA sobre WAN 2.2 | No disponible (293 MiB de pesos) | No disponible | No disponible | HuggingFace, ComfyUI, RunningHub | No publicados |
| WAN 2.2 (modelo base) | Difusion de video | No disponible en la informacion proporcionada | No disponible | Sujeta a la licencia del proyecto original | Publico | No disponibles en esta ficha |
| Otros LoRA de animacion para adultos en Civitai | LoRA sobre modelos de difusion de video o imagen | Variables, no disponibles | No disponible | Variable, normalmente definida por el autor | Civitai, algunos replicados en HuggingFace | No publicados |
| LoRA de animacion genericos de WAN 2.2 o HunyuanVideo | LoRA de difusion de video | No disponibles | No disponible | Variable | HuggingFace y Civitai | No disponibles |

No se dispone de datos cuantitativos homogeneos (parametros, contexto, puntuaciones) para establecer una comparacion rigurosa con alternativas. La unica diferencia verificable en la informacion proporcionada es el tamano del fichero y el modelo base declarado.

## Limitaciones y advertencias

- Contenido sexual explicito: el adaptador esta disenado para generar material pornografico. Su uso requiere verificacion de edad, cumplimiento de la normativa aplicable en la jurisdiccion del usuario y, en la Union Europea, consideracion del Reglamento de Servicios Digitales y de las obligaciones de etiquetado de contenido generado por IA.
- Riesgo legal grave: queda terminantemente prohibido cualquier uso que genere material sexual con menores, personas reales sin consentimiento, o representaciones de violencia sexual no consentida. Este tipo de uso es delito en la mayoria de jurisdicciones.
- Licencia no especificada: la model card no define terminos propios y remite a la licencia del proyecto original y del modelo base. Esto genera incertidumbre sobre el uso comercial, la redistribucion y el entrenamiento de derivados. Antes de cualquier explotacion comercial hay que verificar los terminos de WAN 2.2 y los del autor original en Civitai.
- Sin garantias de procedencia de los datos de entrenamiento: no se documenta la composicion del dataset ni si se dispone de consentimiento de las personas que aparecen en el material de entrenamiento.
- Riesgo de alucinacion visual: como cualquier modelo de difusion, puede generar anatomias incorrectas, artefactos temporales, parpadeo entre fotogramas y fusiones incoherentes de objetos, especialmente en secuencias largas.
- Inconsistencia temporal: no hay datos publicados sobre estabilidad entre fotogramas; en LoRA de video es habitual la degradacion a partir de cierto numero de fotogramas.
- Dependencia total del modelo base: el adaptador no funciona de forma autonoma. Su comportamiento cambia con la version del modelo base, la cuantizacion usada y el flujo de ComfyUI empleado.
- Sensibilidad al prompt: las palabras de activacion listadas por el autor son necesarias para reproducir el estilo previsto; fuera de ellas el efecto puede ser nulo o erratico.
- Cero validacion comunitaria: con cero descargas y cero valoraciones, no existe evidencia externa sobre calidad, seguridad o reproducibilidad.
- Sesgos: no evaluados. Los modelos de difusion de contenido adulto suelen reproducir sesgos de genero, etnia y cuerpo presentes en sus datos de entrenamiento.
- Sin filtros de seguridad: el adaptador no incorpora moderacion. Cualquier control de contenido debe implementarse en la capa de aplicacion.
- Advertencia para produccion: antes de integrar este adaptador en un producto, hay que resolver la licencia, definir un pipeline de moderacion, establecer verificacion de edad y documentar el tratamiento de datos y de contenido generado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RunningHubAI/rh-smoothxxxanimation-low-lora
- Proyecto original en Civitai: https://civitai.com/models/2040641?modelVersionId=2376143
- Pagina del modelo en RunningHub (China): https://www.runninghub.cn/model/public/1986669051764240386
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1819214514410942465
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Seedance 2.5 via API de RunningHub: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
