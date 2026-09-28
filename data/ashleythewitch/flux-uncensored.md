# AshleyTheWitch/Flux-uncensored

## Resumen

Flux-uncensored es un adaptador LoRA publicado por el usuario AshleyTheWitch sobre el modelo base black-forest-labs/FLUX.1-dev, según declara la propia model card del repositorio. Se trata, por tanto, de un ajuste ligero por adaptación de bajo rango (LoRA, low-rank adaptation) pensado para modificar el comportamiento de generación texto-a-imagen de FLUX.1-dev, no de un modelo completo entrenado desde cero. El repositorio ocupa 0,7 GB, un tamaño coherente con un único archivo de pesos de adaptador, y en el momento de la consulta acumulaba 0 descargas y 0 likes.

El interés del artefacto es limitado y su documentación es prácticamente inexistente desde el punto de vista técnico. La model card no especifica rango del LoRA, módulos objetivo, dataset de entrenamiento, número de pasos, hiperparámetros ni resultados de evaluación; su contenido es en su mayor parte material promocional de la plataforma KenerateAI (generación de vídeo, invitación a Discord y enlaces comerciales). El nombre "uncensored" sugiere un ajuste orientado a eliminar o relajar los filtros de contenido, pero la ficha no documenta ese extremo en ningún momento.

Es relevante ahora únicamente como ejemplo del ecosistema de adaptadores comunitarios que extienden FLUX.1-dev, y como caso práctico de por qué conviene auditar la licencia, la procedencia y la documentación antes de incorporar un LoRA a un pipeline de producción. No hay información publicada sobre su calidad, su fidelidad al prompt ni su comportamiento respecto al modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre FLUX.1-dev; rango, alpha y modulos objetivo no disponibles |
| Parametros totales | no disponible (adaptador; el modelo base FLUX.1-dev es un transformer de flujo rectificado de 12 000 millones de parametros segun su documentacion publica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen); el encoder de texto del modelo base condiciona a un maximo declarado de 512 tokens |
| Tipos de cuantizacion | no disponible; el adaptador se distribuye en el repo de 0,7 GB, pero no se detalla formato ni compatibilidad con cuantizaciones del modelo base |
| Idiomas soportados | no disponible (el modelo base trabaja principalmente con prompts en ingles) |
| Licencia | la model card declara creativeml-openrail-m; los metadatos de HuggingFace no reportan licencia. El modelo base FLUX.1-dev usa la licencia FLUX.1 [dev] Non-Commercial |
| Formato de pesos | no confirmado; el tag "diffusers" y el tamano del repo (0,7 GB) apuntan a un unico archivo de adaptador LoRA en safetensors, sin verificacion en la informacion proporcionada |

## Arquitectura y entrenamiento

No hay informacion publicada sobre el proceso de entrenamiento de este adaptador: se desconocen el dataset, el numero de imagenes, los pasos de entrenamiento, la tasa de aprendizaje, el rango del LoRA, los modulos de atencion intervenidos y si se aplicaron tecnicas de regularizacion o de captioning especificas. La model card tampoco indica la version de FLUX.1-dev sobre la que se entreno ni la fecha de entrenamiento.

Lo unico documentado es la dependencia del modelo base: FLUX.1-dev es un transformer de flujo rectificado (rectified flow transformer) de arquitectura hibrida con bloques de atencion doble y paralela, 12 000 millones de parametros, y un pipeline de difusion que combina un encoder de texto T5-XXL con CLIP para el condicionamiento y un VAE de 16 canales para la decodificacion latente. Un LoRA modifica unicamente un subconjunto de las matrices de pesos de ese transformer, por lo que todas las caracteristicas arquitectonicas del modelo base (resolucion nativa, relacion de aspecto, calidad del texto renderizado) se heredan, mientras que cualquier cambio de comportamiento atribuible al adaptador queda sin documentar.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales, heredando las capacidades del pipeline de FLUX.1-dev.
- Ajuste de estilo o de contenido sobre el modelo base, presumiblemente orientado a reducir restricciones de contenido segun el nombre del repositorio, aunque no hay documentacion que lo confirme.
- Compatibilidad declarada con el ecosistema diffusers y con el pipeline de FLUX (tags "diffusers", "fluxpipeline" y "flux").
- No hay informacion sobre soporte de tool calling, function calling, agentes o razonamiento multi-paso: no aplica, es un modelo de generacion de imagen.
- No hay informacion sobre capacidades multilingues; el comportamiento heredado del modelo base esta optimizado para prompts en ingles.
- No hay informacion sobre modo "thinking", vision de entrada, audio ni ninguna otra capacidad adicional.
- No hay informacion sobre edicion de imagen, inpainting, control por estructura (ControlNet) ni img2img con este adaptador.

## Casos de uso

- Prototipado de estilos visuales: cargar el adaptador sobre FLUX.1-dev mediante `load_lora_weights` en diffusers y comparar la salida con la del modelo base sin adaptador para determinar que cambios introduce realmente, dado que no hay documentacion al respecto.
- Investigacion sobre adaptadores de bajo rango: usar el repo como ejemplo de adaptador comunitario para estudiar tamanos de archivo, empaquetado y compatibilidad con pipelines de difusion.
- Pruebas de sesgo y seguridad: dado el nombre "uncensored", es un candidato razonable para evaluar hasta que punto un LoRA puede alterar el comportamiento de un modelo con filtros, comparando generaciones con prompts sensibles frente al modelo base.
- Generacion de imagenes de uso interno no comercial: siempre que se asuma la licencia no comercial del modelo base, puede emplearse en flujos internos de creacion de material grafico para pruebas.
- Benchmarking de calidad de LoRA: incorporarlo a una bateria de evaluacion (FID, CLIPScore, comparacion A/B humana) junto a otros adaptadores de FLUX.1-dev para medir fidelidad al prompt y coherencia estetica.
- Auditoria de licencias en pipelines de IA: caso de estudio sobre la discrepancia entre la licencia declarada en la model card, la del modelo base y la ausencia de metadatos de licencia en HuggingFace.
- Integracion en ComfyUI o interfaces graficas: encapsular el adaptador como nodo de LoRA en un flujo de generacion local para creadores que ya trabajan con FLUX.1-dev.
- Docencia y divulgacion: ilustrar en articulos o talleres que un LoRA comunitario puede tener una model card puramente promocional y cero validacion tecnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna métrica de calidad de imagen (FID, CLIPScore, ImageReward, comparativas humanas), ni comparaciones con el modelo base sin adaptador, ni evaluaciones de fidelidad al prompt. Tampoco hay datos de velocidad de inferencia ni de consumo de memoria específicos de este adaptador.

## Requisitos de hardware

Las cifras siguientes se refieren al modelo base FLUX.1-dev, que es el que determina el coste de inferencia; el adaptador solo anade el peso de un archivo pequeno (0,7 GB de repositorio).

- VRAM estimada en precision completa (bf16/fp16): aproximadamente 24 GB solo para el transformer de 12 000 millones de parametros, mas el encoder de texto T5-XXL, lo que situa el total en el rango de 33 a 40 GB.
- VRAM estimada en fp8: del orden de 17 GB, viable en una RTX 4090 de 24 GB.
- VRAM estimada con cuantizacion agresiva (GGUF Q4/Q8 o NF4 con bitsandbytes): aproximadamente 8 a 12 GB, lo que permite ejecucion en RTX 3060 de 12 GB, RTX 4070 y GPU equivalentes.
- GPU recomendadas: A100 40 GB o 80 GB y H100 para precision completa o lotes grandes; RTX 4090, L40S o A6000 para fp8; GPU consumer de 12 GB o mas con cuantizacion.
- Cabe en GPU consumer: si, con cuantizacion, en tarjetas de 12 GB o superiores; en precision bf16 completa no cabe en ninguna GPU consumer actual.
- Opciones de despliegue: diffusers (referencia para cargar el LoRA junto al modelo base), ComfyUI, AUTOMATIC1111/Forge, SD.Next e InvokeAI. vLLM y TGI no aplican, ya que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles para este adaptador. Como referencia general, la generacion con FLUX.1-dev en una RTX 4090 con cuantizacion suele requerir del orden de segundos por imagen a 20-30 pasos, pero no hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AshleyTheWitch/Flux-uncensored | LoRA sobre FLUX.1-dev | no disponible (repo de 0,7 GB) | no aplica | sin benchmarks publicados | declarada creativeml-openrail-m; metadatos sin licencia; base no comercial | HuggingFace, 0 descargas y 0 likes |
| black-forest-labs/FLUX.1-dev | Transformer de flujo rectificado texto-a-imagen | 12 000 millones | 512 tokens de condicionamiento de texto | benchmarks publicados por el autor en la documentacion oficial | FLUX.1 [dev] Non-Commercial | HuggingFace, ampliamente adoptado |
| Adaptadores LoRA comunitarios para FLUX.1-dev (categoria generica) | LoRA | tipicamente decenas o cientos de megabytes | no aplica | variable, habitualmente sin evaluacion formal | habitualmente heredada del modelo base | HuggingFace, ecosistema amplio |
| Stable Diffusion XL con LoRA | UNet + doble encoder de texto | 2 600 millones en la UNet, 6 600 millones en total | 77 tokens por encoder | benchmarks publicados por Stability AI | CreativeML OpenRAIL++-M | HuggingFace y multiples interfaces |

No se dispone de datos que permitan comparar el rendimiento de este adaptador con el de otros LoRA de FLUX.1-dev: la informacion proporcionada no incluye ninguna evaluacion.

## Limitaciones y advertencias

- Documentacion inexistente: la model card no describe dataset, hiperparametros, rango del LoRA ni modulos objetivo. Es imposible reproducir el entrenamiento o predecir su comportamiento.
- Model card de caracter promocional: la mayor parte del contenido son enlaces a KenerateAI y a un servidor de Discord, no informacion tecnica. Esto reduce la confianza en la procedencia del archivo de pesos.
- Riesgo de codigo o pesos no auditados: el repositorio no incluye evaluaciones, y cargar adaptadores de origen desconocido en un pipeline implica ejecutar pesos no verificados. Conviene inspeccionar el safetensors antes de usarlo.
- Discrepancia de licencia: la model card declara creativeml-openrail-m, mientras que los metadatos de HuggingFace no reportan licencia y el modelo base FLUX.1-dev se distribuye bajo una licencia no comercial. La licencia declarada por el adaptador no puede ampliar los derechos que otorga el modelo base, por lo que el uso comercial es dudoso o directamente no permitido.
- Restricciones de la CreativeML OpenRAIL-M: incluye clausulas de uso que prohiben determinadas finalidades; si se aplicara, impondria condiciones adicionales a la redistribucion y al uso.
- Nombre sugestivo de contenido sin filtros: el termino "uncensored" apunta a generacion de contenido para adultos o potencialmente danino, pero no hay ninguna descripcion de que se haya entrenado para ello, ni advertencias de seguridad, ni filtros documentados.
- Sesgos: no documentados. Cualquier sesgo del adaptador se suma al del modelo base, que ya presenta sesgos demograficos y culturales conocidos en modelos texto-a-imagen entrenados con datos web a gran escala.
- Alucinacion visual: como todo modelo de difusion, puede generar anatomias incorrectas, texto ilegible, incoherencias espaciales y atributos inventados respecto al prompt.
- Limitacion de idioma: hereda el sesgo hacia el ingles del modelo base; los prompts en castellano suelen producir resultados de menor fidelidad.
- Sin garantia de mantenimiento: el repositorio no ha recibido descargas ni interacciones, no hay historial de actualizaciones y no se indica soporte del autor.
- No apto como sustituto del modelo base en produccion: sin evaluacion comparativa, no hay evidencia de que mejore ni de que no degrade la calidad de generacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AshleyTheWitch/Flux-uncensored
- Modelo base declarado: https://huggingface.co/black-forest-labs/FLUX.1-dev
- Sitio de la plataforma promocionada en la model card: kenerateai.com
- Generador de video promocionado: kenerateai.com/app/video
- Servidor de Discord promocionado: https://discord.gg/aztybnNkgv
- Paper o repositorio de entrenamiento del adaptador: no disponible
- Demo o Space asociado: no disponible
