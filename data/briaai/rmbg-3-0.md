# briaai/RMBG-3.0

## Resumen

RMBG-3.0 es la tercera generacion del modelo de eliminacion de fondos de BRIA AI y el primero construido sobre una base generativa: parte de Fibo 2.0, un modelo de difusion de BRIA, y se afina y destila para producir una mascara alfa (alpha matte) limpia y suave en solo cuatro pasos. A diferencia de los segmentadores clasicos, que trabajan solo con bordes, RMBG-3.0 hereda de su base la comprension semantica de la imagen, lo que le permite identificar el sujeto y descartar elementos que no forman parte de el, como sombras proyectadas o huecos de una malla.

El modelo tiene 8.127.342.213 parametros (unos 8,1 mil millones) y se distribuye en formato safetensors con la libreria diffusers, con un repositorio de 16,3 GB. La model card lo posiciona como lider en su categoria en una comparacion a ciegas contra Photoroom, remove.bg (Canva), Ideogram, BiRefNet y RMBG-2.0 sobre 234 imagenes dificiles, con un rango medio de 1,51 y mejor o empatado en 185 de ellas (79 %).

Es relevante ahora porque traslada tecnicas de difusion destilada al problema clasico del recorte de producto y retrato, con un coste de inferencia bajo (aproximadamente 6 segundos por imagen en una L40S, sin classifier-free guidance) y con un entrenamiento declarado exclusivamente sobre datos con licencia. La licencia, sin embargo, es restrictiva: uso no comercial bajo CC BY-NC 4.0, con acuerdo comercial separado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo de difusion generativo (base Fibo 2.0) afinado y destilado para matting; libreria diffusers |
| Parametros totales | 8.127.342.213 (unos 8,1 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en (ingles) |
| Licencia | bria-fibo (uso no comercial, CC BY-NC 4.0; uso comercial requiere acuerdo con BRIA AI) |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

RMBG-3.0 no es un transformer de texto ni un segmentador discriminativo convencional: es un modelo de difusion generativo derivado de Fibo 2.0 (identificador `briaai/Fibo-2.0-dev`), afinado y destilado para una unica tarea, la generacion de alpha mattes. La destilacion reduce la inferencia a cuatro pasos y elimina el classifier-free guidance, lo que abarata el coste por imagen. El pipeline declarado en Hugging Face es `image-segmentation` y los pesos se cargan con diffusers.

La model card no detalla el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon RLHF o DPO; esos datos figuran como no disponibles. Lo que si se declara explicitamente es que, como todos los modelos FIBO, se entrena exclusivamente sobre datos con licencia, lo que aporta trazabilidad y claridad legal. La innovacion tecnica destacable es el enfoque de "eliminacion de fondos como edicion de imagen": al partir de un modelo que comprende la escena, conserva sujetos multiples, extremidades con desenfoque de movimiento, mechones de pelo y objetos transparentes, y descarta sombras proyectadas que no pertenecen al producto.

## Capacidades

- Eliminacion de fondo de imagenes fotograficas con salida en alpha matte suave (no binaria), apta para composicion sobre cualquier fondo.
- Recorte de sujetos multiples en una misma imagen (por ejemplo, grupos de personas).
- Conservacion de detalles finos: pelo y pelaje, plumas, bordes difusos y extremidades con desenfoque de movimiento.
- Manejo de estructuras con huecos: mallas, alambre, radios de bicicleta, tejidos de punto abierto, donde el fondo debe verse a traves de los huecos.
- Tratamiento de objetos transparentes y superficies reflectantes.
- Distincion entre el sujeto y su sombra proyectada o reflejos no pertenecientes al producto.
- Preservacion de texto, logotipos y badges sobre productos de comercio electronico.
- Generacion de recortes listos para usar como capa alfa en flujos de edicion.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio en la informacion disponible.

## Casos de uso

- Fotografia de producto para comercio electronico: el modelo genera el alpha matte de cada foto de catalogo en cuatro pasos, preservando texto, logotipos y badges del envase, y permite montar el recorte sobre fondos de marca sin retoque manual. La model card reporta el mejor resultado en 48 fotos reales de tienda online.
- Retoque de retratos y fotografia de moda: conserva mechones de pelo y bordes suaves, lo que evita el aspecto de "recorte de tijera" tipico de los segmentadores binarios y reduce el trabajo de postproduccion en estudios.
- Composicion publicitaria y creatividades: al producir una mascara alfa real, el recorte puede superponerse sobre cualquier fondo, sombra o degradado en herramientas de diseno, con resultados aptos para campanas.
- Catalogos de moda con prendas complejas: el modelo mantiene solidas las zonas de saten y deja transparentes los huecos de tejidos de punto, util para fotografia de ropa con fondo urbano o de estudio.
- Automatizacion de pipelines de imagen en servidores: con unos 6 segundos por imagen en una GPU L40S y sin classifier-free guidance, encaja en lotes de procesamiento por cola para normalizar miles de imagenes de un marketplace.
- Procesamiento de imagenes de usuario en aplicaciones: integrable mediante la API de BRIA o el endpoint de fal.ai para funcionalidades de "quitar fondo" en apps de edicion, siempre que se cuente con la licencia adecuada.
- Investigacion en matting y segmentacion: al ser un modelo destilado de difusion sobre datos licenciados, sirve como referencia para estudiar destilacion de modelos generativos a tareas de segmentacion.

## Benchmarks y rendimiento

La model card incluye una evaluacion comparativa propia, no benchmarks academicos estandar (MMLU, HumanEval, etc.), realizada sobre 234 imagenes deliberadamente dificiles a resolucion completa, con votacion ciega de usuarios profesionales y casuales combinada con comparacion VLM lado a lado.

| Metrica | Resultado |
|---|---|
| Rango medio (6 proveedores/modelos) | 1,51 |
| Mejor o empatado | 185 de 234 imagenes (79 %) |
| Preferencia vs Photoroom | 55,1 % |
| Preferencia vs remove.bg (Canva) | 59,4 % |
| Preferencia vs RMBG-2.0 | 60,9 % |
| Preferencia vs Ideogram | 65,6 % |
| Preferencia vs BiRefNet | 75,9 % |
| Categorias dificiles lideradas | 7 de 12 (mejor en movimiento, sujetos multiples, huecos y malla, sombras y reflejos, pelo y pelaje, objetos transparentes y superficies reflectantes); top 2 en 10 |
| Fotos reales de tienda online (48) | rango medio 1,15 frente a 1,83 de Photoroom y 1,94 de remove.bg |
| Coste de inferencia | 4 pasos, sin classifier-free guidance, aproximadamente 6 s por imagen en una L40S |

No se han publicado resultados de benchmarks academicos estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; con 8,1 mil millones de parametros en precision completa el peso ronda los 16 GB, por lo que se requiere una GPU con al menos 16-24 GB de memoria para cargar los pesos sin cuantizacion (estimacion a partir del tamano del repositorio, no confirmada por el autor).
- GPU recomendadas: L40S segun la model card (unos 6 s por imagen); no se documentan otras GPU en la informacion disponible.
- Compatibilidad con GPU de consumo: no confirmada; por el tamano del checkpoint, una RTX 4090 de 24 GB es la opcion consumer mas plausible, pero el autor no lo verifica.
- Opciones de despliegue: libreria diffusers (pipeline `image-segmentation`); tambien disponible como servicio en fal.ai y en la API de BRIA. No se documenta soporte para llama.cpp, Ollama, vLLM ni TGI, que son herramientas de modelos de lenguaje.
- Latencia y throughput: aproximadamente 6 segundos por imagen en una unica L40S con cuatro pasos de destilacion; no se publican cifras de throughput por lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento relativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RMBG-3.0 | 8,1 mil millones | no aplica | rango medio 1,51; gana a RMBG-2.0 en el 60,9 % de las comparaciones | bria-fibo (no comercial, CC BY-NC 4.0) | Hugging Face (diffusers), fal.ai, API BRIA |
| RMBG-2.0 | no disponible | no aplica | pierde frente a RMBG-3.0 en el 60,9 % de las comparaciones | no disponible | Hugging Face |
| BiRefNet | no disponible | no aplica | pierde frente a RMBG-3.0 en el 75,9 % de las comparaciones | no disponible | fal.ai |
| remove.bg (Canva) | no disponible | no aplica | pierde frente a RMBG-3.0 en el 59,4 % de las comparaciones | servicio comercial | API comercial |
| Photoroom | no disponible | no aplica | pierde frente a RMBG-3.0 en el 55,1 % de las comparaciones | servicio comercial | API comercial |

Los datos de parametros, contexto y licencia de los competidores no estan disponibles en la informacion proporcionada; solo se dispone de los resultados de preferencia de la evaluacion de BRIA.

## Limitaciones y advertencias

- Licencia restrictiva: el uso comercial no esta permitido por la licencia bria-fibo (CC BY-NC 4.0); requiere un acuerdo comercial separado con BRIA AI. El acceso esta condicionado a un formulario con compuerta (gated) en Hugging Face.
- El modelo esta orientado a un unico idioma declarado (ingles); no se documenta soporte multilingue.
- Al ser un modelo generativo, existe riesgo de artefactos o mascaras imprecisas en escenas muy ambiguas; la propia model card reconoce que la evaluacion se hizo sobre imagenes dificiles, lo que sugiere casos limite frecuentes.
- No se publican datos sobre sesgos demograficos, etnicos o de otro tipo en la informacion disponible.
- No se documentan tecnicas de cuantizacion ni requisitos minimos de VRAM verificados por el autor, lo que complica planificar despliegues en hardware consumer.
- La evaluacion comparativa es interna y realizada por el propio desarrollador; no se aportan benchmarks academicos independientes.
- El rendimiento reportado (aproximadamente 6 s por imagen) corresponde a una L40S; en GPU de menor capacidad la latencia sera previsiblemente mayor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/briaai/RMBG-3.0
- Modelo base Fibo 2.0: https://huggingface.co/briaai/Fibo-2.0-dev
- Demo en fal.ai: https://fal.ai/models/bria/rmbg-3
- Sandbox de la API de BRIA (eliminacion de fondo): https://platform.bria.ai/image-editing/remove-background/sandbox
- Bria Create: https://create.bria.ai/
- Licencia (CC BY-NC 4.0): https://creativecommons.org/licenses/by-nc/4.0/deed.en
- Licencia y precios de BRIA: https://platform.bria.ai/licensing/pricing?model=fibo-2
- Paper referenciado en los tags: arXiv 2511.06876 (https://arxiv.org/abs/2511.06876)
