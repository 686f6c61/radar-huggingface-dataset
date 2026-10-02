# RunningHubAI/rh-krea2-turbo-bf162.5d-unet

## Resumen

rh-krea2-turbo-bf162.5d-unet es un fichero de pesos de tipo UNET para edición y generación de imagen a partir de texto (pipeline `image-text-to-image`), publicado por RunningHubAI en nombre de su autor en HuggingFace. No se trata de un modelo de lenguaje: es un componente de difusión que se carga dentro de un grafo de ComfyUI, junto con el resto de piezas del pipeline (VAE, codificadores de texto y scheduler) que no se distribuyen en este repositorio. El autor indica que está afinado a partir de "krea2", y el nombre del fichero, `Krea2-Turbo-bf162.5D半写实mix.safetensors`, apunta a un ajuste fino de estética "2.5D semirrealista" en precisión bf16.

El repositorio ocupa 26,3 GB y contiene un único fichero de pesos de 25.063 MiB (unos 24,5 GiB). A razón de 2 bytes por parámetro en bf16, ese tamaño equivale aproximadamente a 13.000 millones de parámetros, una cifra coherente con los UNET de difusión de gran tamaño usados hoy en edición de imagen; se trata, en cualquier caso, de una estimación aritmética y no de un dato declarado por el autor.

Su relevancia es limitada y muy específica: es un modelo recién publicado (2 de octubre de 2026), con cero descargas y cero "likes" en el momento de redactar esta ficha, sin licencia declarada, sin idiomas declarados y sin resultados de benchmarks. Resulta de interés para quien ya trabaja con ComfyUI o con la plataforma RunningHub y quiera evaluar un ajuste fino concreto sobre krea2, pero no hay información pública suficiente para recomendarlo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET de difusión para edición de imagen (no disponible el detalle de bloques, atención o variante concreta) |
| Parametros totales | no disponible; estimación aritmética de ~13.000 millones a partir de 25.063 MiB en bf16 (2 bytes por parámetro) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; el condicionamiento de texto lo aporta el codificador de texto del pipeline, que no se incluye en este repositorio |
| Tipos de cuantizacion | el repositorio solo distribuye pesos en bf16; no se publican variantes GGUF, fp8 ni int8 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que se siga la licencia del proyecto original o del upstream) |
| Formato de pesos | safetensors (`Krea2-Turbo-bf162.5D半写实mix.safetensors`) |
| Tipo de modelo | UNET (edición de imagen), etiquetado como `comfyui` y `unet` |
| Pipeline | image-text-to-image |
| Base declarada | finetuned from: krea2 |
| Autor | RunningHub, publicado por RunningHubAI en nombre de @雨的眼泪 |
| Plataformas indicadas | ComfyUI, RunningHub, Hugging Face |
| Tamaño del repositorio | 26,3 GB (fichero único de 25.063 MiB) |
| Fecha de publicación | 2 de octubre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna. Los únicos datos técnicos ciertos son que se trata de un UNET para edición de imagen, que se distribuye como pesos en bf16 dentro de un único safetensors y que deriva de "krea2" mediante ajuste fino. El sufijo "2.5D半写实" ("mix semirrealista") sugiere que el ajuste busca un acabado híbrido entre ilustración y fotografía, pero no hay documentación que detalle el dataset, el número de pasos de entrenamiento, la composición de las imágenes ni si se emplearon técnicas como LoRA, DreamBooth o ajuste completo.

Tampoco se documenta si hubo etapas de alineación (RLHF, DPO u otras), ni qué codificador de texto, VAE o scheduler debe acompañar a estos pesos. El término "Turbo" en el nombre es habitual en el ecosistema para designar variantes destiladas para inferencia con pocos pasos, pero no hay ninguna confirmación por parte del autor sobre el número de pasos recomendado, la escala de guía (CFG) ni la resolución nativa de entrenamiento. Cualquier uso requiere consultar el flujo de trabajo enlazado en la model card para determinar esos parámetros.

## Capacidades

- Generación y edición de imagen condicionada por texto (pipeline `image-text-to-image`), pensada para integrarse en un grafo de ComfyUI como nodo UNET.
- Ajuste estético orientado a un acabado "2.5D semirrealista", según la nomenclatura del propio fichero.
- Compatibilidad declarada con ComfyUI, con la plataforma RunningHub y con Hugging Face como origen de descarga.
- No dispone de generación de texto, razonamiento, código ni matemáticas: no es un modelo de lenguaje.
- Sin soporte de tool calling ni de function calling.
- Sin capacidades de agente ni de razonamiento multi-paso.
- Capacidades multilingües: no disponibles (dependerán del codificador de texto del pipeline anfitrión, no del UNET).
- Capacidades especiales (modo "thinking", visión, audio): no disponibles.

## Casos de uso

- Edición de imagen guiada por texto en ComfyUI: el UNET se inserta en un grafo con el VAE y los codificadores de texto correspondientes para transformar una imagen de entrada según una instrucción textual.
- Retoque con estética semirrealista: para series de retratos o ilustraciones donde se busca un acabado intermedio entre foto y pintura digital, el ajuste declarado por el autor es precisamente ese.
- Generación por lotes de recursos gráficos: al ser un único safetensors cargable en ComfyUI, puede encadenarse en flujos automáticos de producción de imágenes para marketing o previsualizaciones, siempre que la licencia lo permita.
- Ejecución en la nube mediante la API de RunningHub: cuando no se dispone de GPU local con VRAM suficiente, el modelo puede ejecutarse en la plataforma del editor a través de su API.
- Edición de imágenes de producto: cambio de fondo, iluminación o encuadre sobre una toma base, con la salvedad de que no hay datos de calidad ni licencia comercial confirmada.
- Preproducción de concept art y storyboards: generación rápida de variaciones sobre una referencia para explorar direcciones visuales antes de producir el material final.
- Investigación comparativa de ajustes finos sobre krea2: sirve como punto de partida para medir el efecto de un fine-tune estético concreto frente a la base original.
- Integración en aplicaciones propias vía ComfyUI como backend: los flujos de ComfyUI pueden exponerse como servicio y consumir este UNET como componente de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Peso de los parámetros: el fichero safetensors ocupa 25.063 MiB (~24,5 GiB) en bf16. Solo cargar los pesos exige, por tanto, alrededor de 25 GB de memoria, a lo que hay que sumar activaciones intermedias y el VAE del pipeline.
- VRAM estimada en bf16: del orden de 28-32 GB para trabajar con comodidad a resoluciones medias; por debajo de eso, ComfyUI tendrá que recurrir a offload parcial a RAM del sistema o al modo de bajo consumo de VRAM, con la penalización de velocidad correspondiente. Es una estimación derivada del tamaño del fichero, no un dato publicado.
- Cuantizaciones: el autor no publica variantes fp8, GGUF ni int8. El ecosistema ComfyUI permite cargar pesos en fp8 scaled, lo que reduciría el consumo a la mitad aproximadamente, pero no hay confirmación de que este fichero concreto funcione correctamente en ese modo.
- GPU profesionales: A100 (40/80 GB), H100 (80 GB), L40S (48 GB) o RTX 6000 Ada (48 GB) son opciones adecuadas para mantener los pesos en memoria sin offload.
- GPU de consumo: las tarjetas de 24 GB (RTX 3090, RTX 4090) quedan justo por debajo del tamaño del fichero, por lo que previsiblemente requerirán offload o cuantización; las de 16 GB o menos no son viables en bf16.
- Opciones de despliegue: ComfyUI (etiqueta oficial del repositorio), la plataforma RunningHub y su API. vLLM, TGI y Ollama no aplican, ya que están orientados a modelos de lenguaje, no a UNET de difusión.
- Latencia y throughput: no disponibles. No hay datos publicados de velocidad por imagen, número de pasos ni resolución de referencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-krea2-turbo-bf162.5d-unet | UNET de edicion de imagen, finetune de krea2 | ~13.000 M (estimado) | no disponible | no disponible | HuggingFace, RunningHub, ComfyUI |
| krea2 (modelo base declarado) | UNET de edicion de imagen | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| Otros UNET de edicion de imagen para ComfyUI | UNET de edicion de imagen | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados en la información proporcionada para comparar parámetros, contexto, rendimiento o licencia con alternativas de la misma categoría. La única referencia declarada es el modelo base krea2, del que tampoco se aportan especificaciones.

## Limitaciones y advertencias

- Licencia no disponible: la model card remite a la licencia del proyecto original, sin especificarla. No se puede asumir uso comercial sin aclararlo previamente con el autor.
- Sin benchmarks ni evaluaciones publicadas: no hay ninguna métrica objetiva de calidad, fidelidad al prompt o fidelidad a la imagen de entrada.
- Sin documentación de entrenamiento: se desconocen el dataset, su procedencia, los posibles sesgos incorporados y las limitaciones idiomáticas del condicionamiento.
- Riesgo de artefactos: como todo modelo de difusión, puede producir errores anatómicos, texto ilegible en la imagen, manos deformes o inconsistencias entre iteraciones. No hay datos sobre su tasa de fallo.
- Sesgo estético: el ajuste se presenta como "2.5D semirrealista", lo que probablemente limita la variedad de estilos frente al modelo base.
- Repositorio pesado: 26,3 GB de descarga para un único fichero, sin variantes cuantizadas que reduzcan el coste de almacenamiento o de memoria.
- Dependencia del pipeline: los pesos no son autosuficientes; requieren el VAE, los codificadores de texto y el scheduler correctos, que no se documentan en el repositorio.
- Modelo sin tracción: cero descargas y cero "likes" en el momento de la consulta, sin evidencia de uso en producción ni de validación por terceros.
- Fechas de publicación y actualización idénticas (2 de octubre de 2026), lo que sugiere una subida puntual sin mantenimiento posterior documentado.

## Enlaces

- HuggingFace: https://huggingface.co/RunningHubAI/rh-krea2-turbo-bf162.5d-unet
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2087032433257512961
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/2065407779816169474
- Flujo de trabajo y aplicación asociados: https://www.runninghub.ai/zh-cn/post/2089652176921927681
- RunningHub: https://www.runninghub.ai
- RunningHub (sitio de China): https://www.runninghub.cn
- Documentación de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Documentación de la API de RunningHub (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Página de la API para Seedance 2.5: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
