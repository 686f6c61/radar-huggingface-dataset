# SEEDRAAI/Z-Image-LoRA-HairDetail

## Resumen

Z-Image-LoRA-HairDetail es un adaptador LoRA (Low-Rank Adaptation) para el modelo de difusion texto-a-imagen Tongyi-MAI/Z-Image, desarrollado por SeedraAI. Su funcion es especifica y acotada: corregir la tendencia de los modelos base a representar el pelo como una masa uniforme y sin estructura, forzando la separacion de mechones individuales, anadiendo flyaways (cabellos sueltos) y preservando la estructura de trenzas, particiones y tejidos capilares. Es relevante para flujos de generacion de retratos fotorrealistas donde el detalle del cabello es un criterio de calidad determinante.

El adaptador se distribuye como un unico fichero safetensors de aproximadamente 0,1 GB, se activa mediante el token disparador `sdrhair01` y esta pensado para integrarse en ComfyUI mediante un nodo `LoraLoaderModelOnly` situado tras el cargador del modelo Z-Image. La model card documenta pesos de LoRA recomendados entre 0,8 y 1,0, manteniendo los valores por defecto de Z-Image para pasos, CFG y sampler.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de pasos, la arquitectura interna del adaptador ni resultados de benchmarks. La ficha se limita, por tanto, a los datos publicados por el autor en Hugging Face y en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusion texto-a-imagen Tongyi-MAI/Z-Image |
| Parametros totales | no disponible (adaptador de ~0,1 GB en safetensors; el modelo base no se incluye) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; no dispone de ventana de contexto de tokens) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; la cuantizacion depende del modelo base Z-Image) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 (el adaptador sigue la licencia del modelo base) |
| Formato de pesos | safetensors (`SeedraAI_Hair_c1-st2000.safetensors`) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para modificar su comportamiento sin reentrenar los pesos completos. El modelo base es Tongyi-MAI/Z-Image, un generador texto-a-imagen de difusion; el adaptador modifica la representacion del cabello en el espacio latente de dicho modelo. El fichero de pesos se denomina `SeedraAI_Hair_c1-st2000.safetensors`, lo que sugiere un checkpoint en el paso 2000 de entrenamiento, aunque el autor no documenta la configuracion del entrenamiento.

No se ha publicado informacion sobre el volumen del dataset, su composicion, la resolucion de las imagenes de entrenamiento, el rango del LoRA, la tasa de aprendizaje ni si se aplicaron tecnicas de regularizacion o captions automaticos. Tampoco se detalla si el entrenamiento se realizo sobre el modelo completo o sobre alguna variante destilada del base.

## Capacidades

- Generacion texto-a-imagen especializada en detalle capilar: separacion de mechones, flyaways y estructura de trenzas y particiones.
- Soporte explicito de estilos capilares concretos: box braids, knotless braids, cornrows, locs, pelo liso, ondulado, rizado, coletas y pelo mojado.
- Control mediante token disparador `sdrhair01`, con plantilla de prompt `sdrhair01, {hair color and style}, {your scene}`.
- Compatible con cualquier resolucion soportada por Z-Image, manteniendo los valores por defecto de pasos, CFG y sampler del modelo base.
- Integracion en ComfyUI mediante el nodo `LoraLoaderModelOnly`.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni modo thinking: es exclusivamente un adaptador de generacion de imagenes.
- Capacidad multilingue limitada al ingles en los prompts, segun el campo `language: en` de la model card.

## Casos de uso

- Retratos fotorrealistas de estudio: el LoRA se aplica sobre Z-Image para producir retratos donde el pelo mantiene mechones definidos y reflejos realistas, evitando el aspecto de masa uniforme tipico del modelo base.
- Generacion de imagenes para peluqueria y estilismo: permite previsualizar estilos concretos (box braids, cornrows, locs, coletas) con estructura de tejido y particiones correcta, util para catalogos o pruebas de concepto de salones.
- Contenido para redes sociales con estetica de foto movil: la plantilla de prompt del autor incluye la coletilla `candid phone photo`, lo que encaja con la generacion de imagenes de aspecto espontaneo para marcas personales.
- Ilustracion editorial y moda: el detalle en trenzas y pelo mojado resulta adecuado para bocetos de personajes y laminas de estilo donde el cabello es el elemento central de la composicion.
- Prototipado rapido en ComfyUI: al ser un unico safetensors de ~0,1 GB, se puede insertar y retirar del grafo con bajo coste de almacenamiento, lo que facilita iterar variantes de prompt y pesos sin duplicar el modelo base.
- Generacion de referencias para modelado 3D o character design: las vistas con separacion de mechones y flyaways sirven como referencia visual para artistas que necesitan entender la silueta del cabello en distintos angulos e iluminaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, evaluaciones humanas) ni comparaciones cuantitativas con otros LoRA de detalle capilar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; el consumo vendra determinado por el modelo base Z-Image y su cuantizacion. El LoRA anade una sobrecarga marginal al tratarse de un fichero de ~0,1 GB.
- GPU recomendadas: no especificadas por el autor. Al depender de Z-Image, se aplican los requisitos de dicho modelo base, que no se detallan en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la documentacion; depende del modelo base y de la cuantizacion empleada.
- Opciones de despliegue: ComfyUI es el flujo documentado por el autor (nodo `LoraLoaderModelOnly` tras el cargador de Z-Image). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros LoRA de detalle capilar ni adaptadores comparables para Z-Image, y no se dispone de datos de rendimiento que permitan una comparacion rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Entrenado sobre sujetos femeninos: el autor advierte que los resultados en pelo masculino son impredecibles y que los cortes cortos estan infrarrepresentados.
- Sesgo de color: si no se describe explicitamente el color del pelo en el prompt, la generacion tiende a tirar hacia tonos oscuros.
- Alcance muy acotado: el LoRA solo modifica el detalle capilar; no mejora otras partes de la imagen ni corrige fallos generales del modelo base.
- Idioma: los prompts estan pensados para ingles (`language: en`); no se documenta soporte para otros idiomas.
- Dependencia del modelo base: la calidad final, los requisitos de hardware y las restricciones de uso heredan las del modelo Tongyi-MAI/Z-Image, cuya licencia debe verificarse por separado.
- Licencia Apache 2.0 en el adaptador, pero sujeta a la licencia del modelo base; conviene revisar ambas antes de un uso comercial.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomias o texturas de cabello fisicamente inconsistentes en composiciones complejas o con multiples sujetos.
- Sin datos de entrenamiento publicados: no es posible auditar la composicion del dataset ni evaluar sesgos demograficos mas alla de la advertencia del autor.
- Repositorio sin descargas ni likes en el momento de la consulta y creado en noviembre de 2026: ecosistema de validacion practicamente inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/SEEDRAAI/Z-Image-LoRA-HairDetail
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image
- CivitAI: https://civitai.com/models/2897795
- Web del autor (workflows y guias): https://seedraai.com/
- Discord de la comunidad: https://discord.gg/seedraai
