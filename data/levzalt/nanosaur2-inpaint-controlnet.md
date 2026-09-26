# levzalt/Nanosaur2-Inpaint-ControlNet

## Resumen

Nanosaur2-Inpaint-ControlNet es un adaptador de inpainting y outpainting para el modelo de difusion Nanosaur2-670M, publicado por el usuario levzalt. No es un modelo completo: se distribuye unicamente el adaptador (8.898.496 parametros, unos 35,6 MB en safetensors), que se acopla al DiT, al text encoder y al VAE originales de well9472/Nanosaur2-670M, pesos que no se incluyen en este repositorio.

Tecnicamente sigue un enfoque inspirado en LLLite: un codificador de condicionamiento convolucional que procesa RGB mas mascara binaria y que inyecta adaptadores residuales de rango 64 antes de las proyecciones QKV de imagen y de la entrada del MLP en cada uno de los 18 bloques del DiT base. Solo se entreno el adaptador; el modelo base permanecio congelado. El resultado es un checkpoint experimental orientado a flujos de trabajo de edicion de ilustracion en ComfyUI, con nodos personalizados propios.

Su relevancia es practica y acotada: permite repintar regiones concretas de una imagen manteniendo el resto intacto mediante mascara binaria, con licencia MIT y despliegue local en ComfyUI. Se trata, sin embargo, de una publicacion sin validacion comunitaria (0 descargas y 0 likes en el momento de la consulta) y con limitaciones explicitas reconocidas por el autor en cuanto a costuras de mascara, cambios de estilo y alteraciones anatomicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador tipo LLLite sobre DiT de Nanosaur2; entrada de 4 canales (RGB en [-1,1] mas mascara binaria en [0,1]); codificador con dos convoluciones de stride 4, cuatro bloques residuales, 128 canales de caracteristicas y LayerNorm (downsampling espacial total 16x); adaptadores residuales de rango 64 antes de la QKV de imagen y de la entrada del MLP de cada uno de los 18 bloques del DiT |
| Parametros totales | Adaptador: 8.898.496 (aproximadamente 8,9 M). Modelo base Nanosaur2-670M: 670 M segun su denominacion (desglose exacto no disponible) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica a un modelo multimodal de imagen; resolucion de trabajo por defecto 896x1152, con dimensiones en multiplos de 16 (latente de 64 canales, compresion espacial 16x) |
| Tipos de cuantizacion | no disponible; solo se distribuye el adaptador en safetensors, sin variantes cuantizadas anunciadas |
| Idiomas soportados | no disponible; no se declara ningun idioma y el text encoder procede del modelo base |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador de aproximadamente 35,6 MB: `nanosaur2_inpaint_step1000.safetensors`). Los pesos base, no incluidos, tambien son safetensors: `nanosaur2_diffusion_model.safetensors`, `nanosaur2_text_encoder.safetensors` y `nanosaur2_vae.safetensors` |

## Arquitectura y entrenamiento

El adaptador recibe una entrada de cuatro canales: RGB normalizado en [-1,1] y una mascara binaria en [0,1], con los valores RGB dentro de la mascara rellenados con -1. Esa senal pasa por un codificador de condicionamiento de dos convoluciones con stride 4, cuatro bloques residuales, 128 canales y LayerNorm, que produce un downsampling espacial de 16x. La condicion resultante se inyecta mediante adaptadores residuales de rango 64 antes de cada proyeccion QKV de imagen y de cada proyeccion de entrada del MLP en los 18 bloques del DiT. El autor indica explicitamente que el adaptador no es compatible a nivel de pesos con LLLite de Anima ni de SDXL, y que no puede cargarse con sus nodos de aplicacion. En la implementacion para ComfyUI, el codigo maneja lotes combinados de condicionamiento positivo y negativo, selecciona las filas de caracteristicas correspondientes cuando la guia por path-drop omite bloques intermedios y gestiona los pesos del adaptador con un ModelPatcher adicional para dispositivos y offload, sin ganchos persistentes sobre el modelo base compartido.

El entrenamiento tuvo dos fases. La primera uso 500 imagenes (450 de entrenamiento y 50 de validacion), 2000 pasos a area de 512 px y tasa de aprendizaje 3e-4. Despues el conjunto se amplio a 1000 imagenes manteniendo el mismo split de validacion (950 de entrenamiento y 50 de validacion) y la continuacion empleo cubos de aspecto de 1024 px, tasa de aprendizaje 1e-4, batch size 1, acumulacion de gradiente 4 y un optimizador nuevo con 100 pasos de warmup. La version publicada corresponde al paso 1000 de esa continuacion, posterior al piloto de 2000 pasos. Los latentes limpios y el condicionamiento de texto se cachearon; las mascaras de rectangulo, pincel y borde se generaron de forma dinamica, y los controles RGB enmascarados no se precachearon. Las imagenes de entrenamiento son una muestra fija de dos colecciones locales de ilustracion, conjunto que no se distribuye. El checkpoint se selecciono por preferencia visual y no por perdida de validacion minima.

## Capacidades

- Inpainting guiado por mascara: repinta regiones marcadas en blanco y preserva las marcadas en negro, con condicionamiento de la imagen original fuera de la mascara.
- Outpainting: al situar la mascara en los bordes de la imagen y ampliar el lienzo se pueden extender composiciones hacia zonas nuevas, siempre con las cautelas de coherencia que el propio autor senala.
- Edicion de ilustracion con mascaras de rectangulo, pincel y borde, segun los tipos de mascara empleados durante el entrenamiento.
- Integracion con ComfyUI mediante nodo personalizado que sustituye al paquete Nanosaur2 existente; el nodo usa las APIs de model patcher, carga dinamica y operaciones optimizadas de ComfyUI.
- Compatibilidad con guia por path-drop: el nodo maneja lotes combinados positiva/negativa y alinea las filas de caracteristicas cuando se omiten bloques intermedios.
- Composicion final sobre la imagen original mediante el nodo Image Composite Masked, que garantiza la preservacion de los pixeles no enmascarados.
- Flujo reutilizable: se incluyen `nanosaur2_inpaint_workflow.json` (interfaz) y `nanosaur2_inpaint_api.json` (API), ambos como plantillas.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio ni modo de pensamiento; son propias de un modelo generativo de imagen, no de un LLM.

## Casos de uso

- Retoque de ilustracion digital: el ilustrador pinta una mascara sobre la zona a corregir y el adaptador regenera esa region condicionada por el resto de la imagen, aprovechando que solo el adaptador se entrena y el DiT base permanece congelado, lo que reduce el riesgo de alterar el conjunto.
- Outpainting de bocetos y encuadres incompletos: ampliando el lienzo y enmascarando la banda nueva se puede extender una escena; es util cuando el encuadre original quedo corto, aunque el autor advierte que las mascaras grandes pueden cambiar sustancialmente la composicion.
- Eliminacion de objetos no deseados: marcar un elemento secundario y describir en el prompt positivo el contenido de reemplazo permite sustituirlo manteniendo intacto el fondo, con la salvedad de posibles objetos duplicados.
- Preparacion de assets para juegos o aplicaciones: generacion de variantes de un mismo motivo (por ejemplo, distintos estados de un personaje) partiendo de una ilustracion base y repintando por zonas, integrado en un pipeline local de ComfyUI.
- Correccion de artefactos en imagenes generadas previamente: usar el adaptador como paso de limpieza sobre zonas concretas con defectos anatomicos o de detalle, con la advertencia de que las costuras de mascara siguen siendo un riesgo reconocido.
- Prototipado visual en produccion editorial: iteracion rapida sobre portadas o ilustraciones interiores manteniendo la composicion aprobada y modificando solo las areas marcadas, con licencia MIT que facilita el uso comercial interno.
- Automatizacion mediante API: la plantilla `nanosaur2_inpaint_api.json` permite encadenar el inpainting dentro de un sistema mayor que reciba imagen y mascara y devuelva el resultado compuesto, todo sobre ComfyUI local.
- Restauracion parcial de ilustraciones danadas: enmascarar rasgunos, manchas o zonas perdidas y dejar que el modelo las reconstruya a partir del contexto inmediato, aceptando que la fidelidad dependera del tamano de la mascara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas de ningun tipo (ni FID, ni CLIP-I, ni SSIM, ni LPIPS, ni comparaciones numericas con otros adaptadores). El autor indica unicamente que la seleccion del checkpoint se realizo por preferencia visual y no por perdida de validacion minima, y que las comprobaciones de integracion con ComfyUI cubrieron la concordancia numerica con el adaptador independiente.

## Requisitos de hardware

- El adaptador en si ocupa unos 35,6 MB en safetensors y anade 8.898.496 parametros, por lo que su coste de memoria es marginal; el requisito real lo marcan los pesos base de Nanosaur2-670M, que no se incluyen en este repositorio.
- Estimacion de pesos base (no confirmada por el autor): en precision de 16 bits, un DiT de 670 M parametros ronda los 1,3-1,4 GB, a los que hay que sumar el text encoder y el VAE del modelo base.
- Estimacion de VRAM para inferencia a 896x1152 con latente de 64 canales (no confirmada por el autor): del orden de 4 a 8 GB, dependiendo de la precision efectiva, del offload y del backend. Cifra no publicada por el autor.
- GPU de consumo: con esas estimaciones, el flujo deberia caber en tarjetas de 8-12 GB como la RTX 3060 de 12 GB, la RTX 4060 Ti de 16 GB o la RTX 4070 en adelante; no hay confirmacion oficial de estos margenes.
- GPU profesionales: A100, H100 o similares no son necesarias por tamano, si bien el autor no publica cifras de latencia ni de throughput para ningun hardware.
- Despliegue: la unica via documentada es ComfyUI, con el paquete `nanosaur2_support` copiado en `custom_nodes` sustituyendo el paquete Nanosaur2 previo, y el checkpoint del adaptador en `ComfyUI/models/controlnet/` o `ComfyUI/models/model_patches/`. Se requiere una version reciente de ComfyUI por el uso del model patcher y de las APIs de carga dinamica; el adaptador no introduce dependencias adicionales de Python.
- Ajustes de referencia del autor: sampler Euler con scheduler simple, 50 pasos, CFG 4, guia del cargador en `alternate`, flow shift 3 proporcionado por el cargador, fuerza de control 1.0, inicio y fin de control 0.0 y 1.0, denoise 1.0, prefijo positivo `newest, masterpiece` y prompt negativo `oldest, low quality`.
- Latencia y throughput: no disponible.
- No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros motores; se trata de un modelo de difusion y su integracion publicada es exclusivamente para ComfyUI.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanosaur2-Inpaint-ControlNet (este adaptador) | 8.898.496 en el adaptador; base de 670 M | Trabajo por defecto a 896x1152, multiplos de 16 | Sin benchmarks publicados; seleccion por preferencia visual | MIT | HuggingFace, requiere los pesos base de Nanosaur2-670M y una version reciente de ComfyUI |
| Nanosaur2-670M (modelo base, well9472) | 670 M segun su denominacion | No disponible | No disponible | No disponible en la informacion proporcionada | HuggingFace; sus tres archivos safetensors son requisito de este adaptador |
| Adaptadores LLLite para Anima o SDXL | No disponible | No disponible | No disponible | No disponible | Existen, pero el autor indica que este adaptador no es compatible a nivel de pesos ni cargable con sus nodos de aplicacion |

No se dispone de datos comparativos de rendimiento, contexto o licencia de alternativas equivalentes en la informacion proporcionada, por lo que la comparacion numerica queda marcada como no disponible.

## Limitaciones y advertencias

- El propio autor califica el adaptador de experimental: la estructura general puede funcionar bien, pero persisten costuras de mascara visibles, cambios de estilo, alteraciones de la anatomia y duplicacion de objetos.
- Las mascaras grandes pueden modificar sustancialmente la composicion de la imagen, no solo la region marcada.
- La prediccion decodificada en bruto no garantiza la preservacion de los pixeles no enmascarados; es el paso de composicion con la mascara (Image Composite Masked) el que la asegura, por lo que omitirlo introduce riesgo de cambios fuera de la zona pintada.
- El checkpoint se selecciono por preferencia visual y no por perdida de validacion minima, de modo que no hay una metrica objetiva que respalde esta version frente a otras del mismo entrenamiento.
- El conjunto de entrenamiento son 950 imagenes procedentes de dos colecciones locales de ilustracion y no se distribuye; esto sesga el modelo hacia ese estilo grafico y limita su generalizacion a fotografias o dominios muy distintos.
- No se declaran idiomas soportados ni se publican ejemplos de entrada: la plantilla usa `choose_your_image.png` como marcador de posicion y no se incluye ninguna imagen de ejemplo.
- Compatibilidad restringida: no funciona con nodos LLLite de Anima ni de SDXL, y sustituye por completo al paquete Nanosaur2 existente en ComfyUI, por lo que instalar copias duplicadas del paquete bajo otros nombres provoca conflictos.
- Requiere una version reciente de ComfyUI por el uso del model patcher y de las APIs de carga dinamica; instalaciones antiguas pueden necesitar actualizacion.
- Se debe partir de un latente vacio tal como indica la plantilla: usar VAE Encode for Inpainting o mezcla de ruido con mascara de latente cambia el procedimiento de muestreo con el que se hicieron las pruebas.
- La licencia MIT del adaptador no cubre necesariamente los pesos base, cuyo regimen de licencia no se detalla en la informacion proporcionada; conviene verificarlo antes de un uso comercial.
- Riesgo de alucinacion visual: el modelo puede introducir contenido no solicitado en la region repintada, coherente con la composicion pero distinto de lo esperado, especialmente en mascaras amplias.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin informes independientes de calidad ni de estabilidad en produccion.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/levzalt/Nanosaur2-Inpaint-ControlNet
- Modelo base Nanosaur2-670M: https://huggingface.co/well9472/Nanosaur2-670M
- Pesos del adaptador: https://huggingface.co/levzalt/Nanosaur2-Inpaint-ControlNet/blob/main/nanosaur2_inpaint_step1000.safetensors
- Flujo de trabajo para la interfaz de ComfyUI: https://huggingface.co/levzalt/Nanosaur2-Inpaint-ControlNet/blob/main/nanosaur2_inpaint_workflow.json
- Flujo de trabajo para la API: https://huggingface.co/levzalt/Nanosaur2-Inpaint-ControlNet/blob/main/nanosaur2_inpaint_api.json
- Paquete de nodos de soporte: https://huggingface.co/levzalt/Nanosaur2-Inpaint-ControlNet/tree/main/nanosaur2_support
- No se proporcionan enlaces a papers, blogs tecnicos, repositorios adicionales ni demos en la informacion disponible.
