# OzzyGT/krea2_lora_mask_blocks

# OzzyGT/krea2_lora_mask_blocks: bloques de enmascarado espacial de LoRA para Krea 2

## Resumen

`OzzyGT/krea2_lora_mask_blocks` no es un modelo de generacion con pesos propios, sino un conjunto de bloques personalizados para Modular Diffusers que modifica el bucle de denoising del pipeline Krea 2 para asignar a cada adaptador LoRA cargado una region espacial concreta de la imagen. El problema que resuelve es especifico: cuando se cargan dos LoRA que abordan lo mismo (tipicamente dos LoRA de personaje), ambos se aplican en toda la imagen y sus rasgos se mezclan, de modo que cada sujeto acaba arrastrando trazos del otro. Con este blockset, `lora_masks` asocia el nombre del adaptador con una mascara, y todo lo que queda fuera de esa region se genera con el modelo base sin ese adaptador.

El autor es OzzyGT y el repositorio se publico en Hugging Face bajo licencia Apache 2.0, con el modelo `krea/Krea-2-Turbo` como base declarada. La innovacion tecnica no esta en el modelo de difusion subyacente, sino en el mecanismo: los bloques son los de Krea 2 de serie con el bucle de denoising sustituido, de manera que sin pasar `lora_masks` el pipeline genera exactamente lo mismo que el pipeline original. Solo se enmascaran los tokens de imagen; los tokens de texto ven siempre todos los adaptadores sin enmascarar.

El repositorio no incluye pesos del modelo base ni resultados de evaluacion, y en el momento de la consulta acumulaba 0 descargas y 0 likes, por lo que se trata de una publicacion muy reciente y sin validacion comunitaria. La informacion disponible describe el mecanismo, la API de uso y sus limites, y menciona explicitamente dos casos no cubiertos: los adaptadores LoKr y los modelos cuyas capas LoRA operan con un layout `(sequence, batch, feature)` en lugar de batch-first.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo con pesos propios: es un blockset de Modular Diffusers que sustituye el bucle de denoising del pipeline Krea 2 para aplicar mascaras espaciales por adaptador LoRA. La arquitectura del difusor subyacente es la de `krea/Krea-2-Turbo` (no detallada en la informacion disponible) |
| Parametros totales | no disponible (los bloques son codigo Python; el repositorio no publica pesos) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusion text-to-image). El ejemplo de la model card genera a 1024x1024; las mascaras admiten cualquier resolucion con la misma relacion de aspecto que la imagen de salida |
| Tipos de cuantizacion | no disponible. La model card carga los componentes en `bfloat16`; los adaptadores LoRA se cargan desde ficheros `.safetensors` |
| Idiomas soportados | no disponible (no se declaran; la comprension del prompt depende del codificador de texto del modelo base) |
| Licencia | apache-2.0 |
| Formato de pesos | El repositorio distribuye bloques de pipeline en Python para Modular Diffusers. Los adaptadores LoRA del ejemplo se cargan como `.safetensors`. No incluye pesos del modelo base |
| Modelo base | `krea/Krea-2-Turbo` (y `krea/Krea-2-Raw` para el blockset base) |
| Libreria | diffusers (Modular Diffusers) |
| Tarea | text-to-image |
| Descargas / likes | 0 / 0 en la fecha de los datos |
| Fecha de publicacion | 2026-09-11 (creacion y ultima actualizacion) |

## Arquitectura y entrenamiento

El repositorio no entrena ni publica ningun modelo. Lo que ofrece son dos blocksets derivados de los de Krea 2 con el bucle de denoising intercambiado por una variante que intercala el enmascarado espacial de adaptadores. La pieza reutilizable es `lora_spatial_mask.py`, que no contiene nada especifico de Krea y define el mixin `LoraSpatialMaskDenoiseMixin`. Una familia de modelos se integra mezclando ese mixin en su envoltorio del bucle de denoising y declarando dos parametros: donde estan los tokens de imagen en la secuencia (`image_tokens_last`, que en Flux2 seria `False` porque empaqueta `[image | text]`) y que proyecciones nunca ven tokens de imagen (`exclude_name_substrings`). El par de funciones `apply_lora_spatial_masks` / `remove_lora_spatial_masks` tambien puede usarse fuera de los pipelines modulares, sobre cualquier transformer con adaptadores PEFT cargados.

El enmascarado actua solo sobre los tokens de imagen, con la semantica de las mascaras de inpainting de diffusers: blanco indica donde se aplica ese LoRA, negro deja actuar al modelo base y los grises atenuan, de modo que los valores son continuos y un pincel difuminado produce bordes suaves. La mascara es una imagen en escala de grises o RGB por adaptador, a cualquier resolucion siempre que mantenga la relacion de aspecto de la salida. Las claves de `lora_masks` son los nombres de adaptador usados en `load_lora_weights`. No se documentan datos de entrenamiento, numero de tokens, composicion de dataset ni fases de RLHF o DPO, porque no hay entrenamiento implicado en esta publicacion.

## Capacidades

- Generacion text-to-image con aplicacion regional de adaptadores: cada LoRA recibe su propia mascara y solo escribe dentro de ella.
- Separacion de adaptadores del mismo tipo: resuelve la mezcla entre dos LoRA de personaje que, sin mascara, se contaminan mutuamente.
- Composicion de adaptadores de distinto tipo sin necesidad de mascara: la model card indica que un LoRA de personaje y uno de estilo suelen combinarse bien por si solos, por lo que el mecanismo no es necesario en ese caso.
- Enmascarado con degradado: los valores de gris permiten transiciones suaves en lugar de bordes duros.
- Compatibilidad con el blockset de Krea 2 y con su variante base mediante `Krea2LoraMaskAutoBlocks` y `init_pipeline("krea/Krea-2-Raw")`.
- Reutilizacion en otras familias de difusion: el mixin permite portar el mecanismo declarando la posicion de los tokens de imagen y las proyecciones a excluir.
- Uso fuera de pipelines modulares: `apply_lora_spatial_masks` / `remove_lora_spatial_masks` funcionan sobre cualquier transformer con adaptadores PEFT.
- No soporta LoKr ni modelos con layout de capas LoRA `(sequence, batch, feature)`.
- No aplica: no hay tool calling, ni razonamiento multi-paso, ni agentes, ni capacidades de audio o de lenguaje.

## Casos de uso

- Ilustracion de dos personajes en una misma escena: cargando dos LoRA de personaje con `adapter_name="alice"` y `"bob"`, y pasando dos mascaras complementarias a 1024x1024, cada identidad queda confinada a su region y se evita que el rostro de una contamine a la otra.
- Narrativa secuencial tipo comic: con mascaras reutilizables por plantilla y la misma relacion de aspecto que las vinetas, se mantiene la consistencia de cada personaje a lo largo de una serie de imagenes sin reentrenar nada.
- Produccion de assets para videojuegos: combinar un LoRA de personaje, uno de vestuario y uno de entorno asignando regiones permite generar variantes del mismo personaje sobre escenarios controlados por separado.
- Publicidad de producto: situar un LoRA de producto en el tercio central de la composicion y dejar el resto al modelo base o a un LoRA de ambiente, de modo que el producto no arrastre rasgos del estilo aplicado al fondo.
- Retratos de grupo sinteticos: con N mascaras disjuntas se pueden poblar varios sujetos en una sola generacion, controlando que cada adaptador escriba solo en la zona del encuadre que le corresponde.
- Investigacion sobre control espacial de adaptadores: el mecanismo permite medir de forma aislada el grado de fuga entre adaptadores activando y desactivando mascaras sobre el mismo prompt y la misma semilla, algo que sin los bloques requeriria inpainting y recomposicion.
- Pipelines de generacion por lotes: al ser un blockset de diffusers, las mascaras pueden precalcularse como plantillas por relacion de aspecto e inyectarse en un script de inferencia por lotes junto con `set_adapters`.
- Experimentacion con pesos de adaptador por region: la escala de grises permite modular la intensidad de cada LoRA dentro de su zona sin recurrir a pesos globales en `set_adapters`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de metricas, comparaciones cuantitativas ni evaluaciones de fidelidad, y la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (solo paginas de ayuda de YouTube y contenidos de Zhihu, sin relacion con el modelo). Al tratarse de un mecanismo de enmascarado y no de un checkpoint, la evaluacion relevante seria del tipo fuga entre identidades, coherencia por region o similitud con el sujeto de cada LoRA, y ninguna de esas mediciones aparece publicada.

## Requisitos de hardware

- VRAM estimada: no disponible. Depende por completo del checkpoint base (`krea/Krea-2-Turbo`), de la resolucion y del tipo de dato; el ejemplo de la model card usa 1024x1024 en `bfloat16`.
- El unico requisito explicito de la model card es una GPU CUDA: `pipe.to("cuda")`.
- GPU recomendadas: no disponible en la informacion proporcionada; no se puede estimar sin las especificaciones del modelo base.
- Compatibilidad con GPU de consumo: no disponible, aunque la generacion a 1024x1024 en `bfloat16` es el regimen habitual de los modelos de difusion de imagen actuales en tarjetas de gama alta de consumo.
- Opciones de despliegue: `ModularPipeline.from_pretrained` con `trust_remote_code=True` y `load_components(torch_dtype=torch.bfloat16)` sobre la libreria diffusers. No se documentan integraciones con vLLM, TGI, llama.cpp, Ollama ni exportacion a GGUF; el mecanismo es codigo Python que envuelve el bucle de denoising, por lo que requiere diffusers y no es portable a runtimes de inferencia de modelos de lenguaje.
- Carga de adaptadores: `load_lora_weights` por adaptador y `set_adapters` para fijar escalas, todo ello antes de la llamada de generacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos cuantitativos publicados sobre este blockset ni comparativas en la informacion disponible. A continuacion se contrasta cualitativamente con los enfoques habituales para el mismo objetivo (controlar la aplicacion espacial de adaptadores o prompts en difusion); las celdas sin dato se marcan como no disponibles.

| Enfoque | Mecanismo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `OzzyGT/krea2_lora_mask_blocks` | Mascara espacial por adaptador LoRA aplicada dentro del bucle de denoising de Krea 2 | no aplica (solo bloques) | no aplica | no disponible | apache-2.0 | Hugging Face, 0 descargas, integracion con diffusers |
| Enmascarado de atencion cruzada por region de prompt | Restringe la atencion de cada token de prompt a una caja o mascara | no disponible | no disponible | no disponible | no disponible | tecnicas genericas de la comunidad, sin repositorio unico de referencia en la informacion disponible |
| Inpainting por regiones con recomposicion | Genera cada sujeto con su LoRA en un lienzo enmascarado y recompone despues | no disponible | no disponible | no disponible | no disponible | disponible como funcionalidad estandar de diffusers |
| Multiples LoRA sin mascara | Todos los adaptadores se aplican en toda la imagen y se mezclan | no disponible | no disponible | no disponible | no disponible | soporte estandar de diffusers y PEFT |

La diferencia funcional que el autor destaca es que el enmascarado se aplica en cada paso de denoising y solo sobre los tokens de imagen, mientras que las alternativas de inpainting obligan a varias pasadas y recomposicion, y el enmascarado de atencion actua sobre el prompt y no sobre el adaptador.

## Limitaciones y advertencias

- No cubre adaptadores LoKr.
- No cubre modelos cuyos LoRA vean un layout `(sequence, batch, feature)` en lugar de batch-first.
- Solo se enmascaran los tokens de imagen: los tokens de texto ven todos los adaptadores sin enmascarar, por lo que el prompt global sigue influyendo en todas las regiones.
- Dos adaptadores del mismo tipo sin mascara se siguen mezclando; el problema solo se resuelve si se definen regiones disjuntas.
- La mascara debe compartir la relacion de aspecto de la imagen de salida.
- Los bloques modifican el bucle de denoising del pipeline base: cualquier cambio incompatible en el pipeline de Krea 2 o en diffusers puede romper la integracion.
- `trust_remote_code=True` implica ejecutar codigo del repositorio; conviene revisarlo antes de usarlo en entornos de produccion.
- Repositorio sin validacion: 0 descargas y 0 likes en los datos disponibles, autor unico, sin paper ni evaluacion publicada.
- Licencia: los bloques son Apache 2.0, lo que permite uso comercial, pero la licencia del checkpoint base `krea/Krea-2-Turbo` no se especifica en la informacion disponible y puede imponer condiciones adicionales. Conviene verificarla antes de un despliegue comercial.
- No apto para exportacion a GGUF ni para runtimes de LLM (llama.cpp, Ollama); requiere diffusers.
- Riesgo de artefactos: si las mascaras se solapan o quedan mal alineadas, el resultado puede mostrar costuras o rasgos mezclados en la frontera, aunque los valores continuos de gris permiten suavizarlas.
- No hay datos de sesgo, idioma ni rendimiento fuera del escenario de ejemplo (1024x1024, dos LoRA de personaje).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OzzyGT/krea2_lora_mask_blocks
- Documentacion de Modular Diffusers: https://huggingface.co/docs/diffusers/main/en/modular_diffusers/overview
- Modelo base Krea 2 Turbo: https://huggingface.co/krea/Krea-2-Turbo
- Modelo base Krea 2 Raw: https://huggingface.co/krea/Krea-2-Raw
- Papers, blogs o demos adicionales: no disponible (la busqueda web no devolvio resultados relevantes sobre este modelo)
