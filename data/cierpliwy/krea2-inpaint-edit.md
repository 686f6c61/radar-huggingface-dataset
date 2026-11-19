# Cierpliwy/krea2-inpaint-edit

## Resumen
Krea 2 inpaint edit es una colección de adaptadores LoRA para el modelo de difusión de imágenes Krea-2-Raw, publicada por el usuario Cierpliwy en Hugging Face. Su función es el inpainting por edición enmascarada: se le entrega una imagen con la región a regenerar rellenada en negro sólido y un prompt de texto que describe el contenido deseado, y el adaptador repinta únicamente esa zona dejando intacto el resto del lienzo. La versión recomendada (v2, paso 17500, rango 64) añade además capacidad de outpainting, es decir, extender una escena hacia un área negra de relleno.

El interés práctico reside en que convierte un modelo de texto a imagen en una herramienta de edición localizada sin necesidad de entrenar un modelo completo: el LoRA se carga sobre los pesos base de Krea-2-Raw y se ejecuta dentro de ComfyUI mediante los nodos de edición de Ostris. El repositorio ocupa 3,3 GB e incluye varios checkpoints de tres campañas de entrenamiento distintas (v1 a 512 px, v1 a 1024 px y v2 a 512 px), con variantes de intensidad de edición y archivos de flujo de trabajo de ejemplo.

La licencia no es abierta en sentido estricto: se rige por la Krea 2 Community License, lo que condiciona su uso comercial y su redistribución. No se dispone de información sobre idiomas soportados ni de resultados de benchmarks publicados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusión Krea-2-Raw; pipeline image-to-image |
| Parametros totales | no disponible (el LoRA se distribuye en un único archivo safetensors; el modelo base no se detalla en la información disponible) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen; no se especifica resolución máxima nativa) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors (fp16/BF16 presumiblemente, no confirmado) |
| Idiomas soportados | no disponible (los prompts se procesan mediante el codificador de texto del modelo base) |
| Licencia | Krea 2 Community License (license_name: krea-2-community-license) |
| Formato de pesos | safetensors (archivos LoRA individuales por checkpoint) |

## Arquitectura y entrenamiento
El adaptador es un LoRA de rango 64 entrenado sobre Krea-2-Raw, un modelo de difusión para generación de imágenes. El mecanismo de edición no se basa en una máscara binaria convencional de inpainting, sino en una imagen de referencia en la que la región a regenerar se sustituye por negro sólido; el modelo aprende a reconstruir esa zona a partir del prompt y del contexto visible. La integración en ComfyUI se realiza mediante los nodos `TextEncodeKrea2OstrisEdit` y `Krea2OstrisEditModelPatch`, y requiere que la caché KV esté activada en el nodo de parcheo para que la edición enmascarada funcione correctamente.

Se documentan tres campañas de entrenamiento. La v1 a 512 px empleó máscaras negras aleatorias sin ejemplos de outpainting y generó tres variantes de intensidad (por defecto, mild y strong). La v1 a 1024 px replicó la misma receta a mayor resolución. La v2 a 512 px, con entre 10 000 y 20 000 pasos y rango 64, introdujo aproximadamente un 10 % de máscaras de outpainting (una isla rectangular visible sobre fondo negro), lo que le confiere capacidad real de extensión de escena. Según el autor, los checkpoints de la v2 superan claramente a los de la v1 y a los de la v1 a 1024 px en inpainting, outpainting, rotación y ediciones personalizadas. No se detalla la composición del dataset, el número de tokens ni el uso de RLHF o DPO, que en un modelo de difusión no aplicarían en los mismos términos.

## Capacidades
- Inpainting por edición enmascarada: rellena con contenido nuevo la región marcada en negro siguiendo el prompt, sin alterar el resto de la imagen.
- Outpainting: extiende la escena hacia un lienzo negro ampliado (capacidad introducida en la v2).
- Edición localizada de imágenes existentes: sustitución de objetos, cambio de fondo o modificación de elementos concretos.
- Generalización a resoluciones distintas de la de entrenamiento, según indica el autor.
- Rotación de escena: el flujo de ejemplo con MoGe-3 permite estimar geometría, rotar la malla y repintar el entorno desde el nuevo punto de vista.
- Integración con modelos auxiliares en ComfyUI: BiRefNet para eliminación de fondo y SAM 3 para detección open-vocabulary de sujetos.
- Control de intensidad de edición mediante variantes del checkpoint (mild reduce cambios fuera de la máscara; strong se adapta más al prompt y funciona mejor en outpainting).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio o vídeo.

## Casos de uso
- Sustitución de fondos en fotografía de producto: se genera la imagen, se elimina el fondo con BiRefNet, se compone el objeto sobre negro y el LoRA repinta un fondo nuevo descrito en el prompt, manteniendo intacto el producto.
- Limpieza de imágenes: eliminar objetos no deseados (personas, carteles, elementos de mobiliario) marcándolos en negro y pidiendo al modelo que reconstruya la textura circundante de forma coherente.
- Ampliación de encuadre para formatos alternativos: a partir de una imagen cuadrada, se rellena un lienzo panorámico o vertical en negro y el adaptador extiende la escena para adaptarla a redes sociales o impresión.
- Creación de variaciones de escena con control de cámara: combinando MoGe-3 para estimar la geometría y rotar la malla, se repinta el entorno visible desde un nuevo ángulo, útil en previsualización de conceptos y storyboards.
- Edición asistida en pipelines de diseño: integrar el LoRA en un flujo de ComfyUI que reciba una imagen base y una máscara generada por segmentación automática (SAM 3) para producir variantes de un mismo diseño sin intervención manual del trazo.
- Reparación de imágenes históricas o dañadas: marcar las zonas deterioradas y regenerar el contenido con un prompt que describa el material y la textura originales.
- Prototipado rápido de composiciones: generar una imagen base con Krea-2, marcar la zona de interés y probar distintas descripciones en el mismo lienzo para comparar resultados por diferencia visual.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El autor únicamente aporta comparaciones cualitativas mediante galerías de imágenes y mapas de diferencia frente a `yijunwang2/krea2-anypaint`, sin métricas numéricas (FID, CLIP score, LPIPS u otras).

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; al ejecutarse sobre Krea-2-Raw en ComfyUI, los requisitos vienen determinados por el modelo base completo más el LoRA, no por el adaptador (3,3 GB de repositorio incluyen todos los checkpoints, no la carga en memoria).
- GPU recomendadas: no especificadas por el autor; por el tipo de carga (difusión de imágenes de alta resolución) se requiere una GPU con memoria suficiente para el modelo base, aunque no se aportan cifras concretas.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: ComfyUI con el plugin ComfyUI-Krea2-Ostris-Edit; para entradas superiores a 1 MP es necesario instalar la rama `vlm-ref-size-inputs` del fork de Cierpliwy hasta que se fusione el PR #10 del repositorio original.
- Latencia y throughput: no disponibles.
- Requisito crítico de configuración: la caché KV del nodo `Krea2OstrisEditModelPatch` debe estar activada (viene desactivada por defecto); de lo contrario la edición enmascarada no funciona correctamente.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cierpliwy/krea2-inpaint-edit | LoRA de inpainting y outpainting | Krea-2-Raw | Entrenado a 512 px (v2) y 1024 px (v1); generaliza a otras resoluciones | Krea 2 Community License | Hugging Face, 2503 descargas, 33 likes |
| yijunwang2/krea2-anypaint | LoRA de inpainting | Krea-2-Raw | no disponible | no disponible en la información proporcionada | Hugging Face |
| Krea-2-Raw | Modelo de difusión completo | — | no disponible | Krea 2 Community License | Hugging Face (krea/Krea-2-Raw) |

La comparación cuantitativa con alternativas no está disponible: el autor solo ofrece comparaciones visuales frente a `yijunwang2/krea2-anypaint`, sin métricas ni tablas de rendimiento.

## Limitaciones y advertencias
- Licencia restrictiva: la Krea 2 Community License condiciona el uso comercial, la redistribución y el despliegue en producción; es imprescindible revisar sus términos antes de integrar el modelo en un producto.
- Dependencia del modelo base: el LoRA no funciona de forma autónoma; requiere descargar y cargar Krea-2-Raw, lo que incrementa los requisitos de almacenamiento y memoria.
- Dependencia de un plugin de terceros: la edición enmascarada depende de ComfyUI-Krea2-Ostris-Edit, con una configuración concreta (caché KV activada) y una rama específica para entradas superiores a 1 MP que aún no se ha fusionado en el repositorio principal.
- Riesgo de alucinación visual: el contenido generado en la región enmascarada puede no ser coherente con la iluminación, la perspectiva o la textura del resto de la imagen, especialmente en máscaras grandes o prompts ambiguos.
- Sesgos: no se documentan sesgos específicos, pero al heredar el codificador de texto y los datos de entrenamiento del modelo base, puede reproducir los sesgos presentes en ellos.
- Idiomas: no se especifica qué idiomas acepta el codificador de texto; la documentación y los ejemplos están en inglés.
- Resolución: los checkpoints v2 se entrenaron a 512 px y el autor afirma que generalizan a otras resoluciones, pero no se aportan garantías ni límites máximos.
- Variabilidad entre checkpoints: los resultados dependen de la variante elegida (mild, strong, v1, v2); la selección incorrecta puede alterar zonas no enmascaradas o reducir la fidelidad al prompt.
- Sin benchmarks: no hay métricas objetivas publicadas que permitan comparar su calidad con alternativas de forma rigurosa.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Cierpliwy/krea2-inpaint-edit
- Modelo base Krea-2-Raw: https://huggingface.co/krea/Krea-2-Raw
- Licencia Krea 2: https://www.krea.ai/krea-2-licensing
- LoRA alternativo para comparación: https://huggingface.co/yijunwang2/krea2-anypaint
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- Plugin de nodos de edición Krea 2: https://github.com/ostris/ComfyUI-Krea2-Ostris-Edit
- Fork con soporte para entradas superiores a 1 MP: https://github.com/Cierpliwy/ComfyUI-Krea2-Ostris-Edit/tree/vlm-ref-size-inputs
- PR de soporte para entradas de gran tamaño: https://github.com/ostris/ComfyUI-Krea2-Ostris-Edit/pull/10
