# sisniha/BFS-Best-Face-Swap

## Resumen

BFS (Best Face Swap) es una serie de adaptadores LoRA desarrollados por el usuario sisniha para realizar intercambio de rostro, cabeza y cuerpo completo en imágenes mediante edición guiada por texto e imagen. El conjunto se apoya en modelos base de difusión como Qwen-Image-Edit-2511, FLUX.2-klein (variantes de 4B y 9B parámetros) y Krea-2-Raw, y se distribuye como archivos `.safetensors` compatibles con la librería `diffusers` y con ComfyUI. Su relevancia radica en ofrecer un control fino sobre la identidad facial, la mezcla de tonos de piel y la coherencia anatómica, con distintas versiones optimizadas para cada modelo base y nivel de sustitución (solo cara, cabeza completa o cuerpo entero). El repositorio incluye múltiples variantes, algunas con orden de entrada invertido (primero el cuerpo, luego la cara) y otras con prompts desencadenantes específicos. No se especifican los parámetros totales de cada LoRA ni la longitud de contexto, ya que dependen del modelo base subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre modelos de difusion de edicion de imagenes |
| Parametros totales | no disponible (cada archivo LoRA tiene su propio tamano, no se indica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base; no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (los archivos son safetensors, no se especifica cuantizacion) |
| Idiomas soportados | ingles (segun la etiqueta `language: en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (archivos `.safetensors`) |

## Arquitectura y entrenamiento

La serie BFS se compone de adaptadores LoRA entrenados sobre distintos modelos base de edicion de imagenes: Qwen-Image-Edit-2509/2511, FLUX.2-klein (4B y 9B) y Krea-2-Raw. Cada version esta disenada para un nivel de reemplazo especifico: solo el rostro, la cabeza completa o el cuerpo entero. El entrenamiento se realizo con un numero variable de pasos; por ejemplo, la version BFS Head V5 (para Qwen 2511) se entreno durante mas de 5.500 pasos, y ademas se generaron versiones fusionadas (merged) combinando el resultado original con la version V4 de 2509 para mejorar la transferencia de expresiones. No se proporcionan detalles sobre la composicion del dataset de entrenamiento ni sobre el uso de tecnicas como RLHF o DPO. Los LoRA se aplican sobre el modelo base en el momento de la inferencia, y se recomienda usar los workflows incluidos en el repositorio para cada combinacion.

## Capacidades

- Intercambio de rostro (face swap) preservando el cabello, la iluminacion y el fondo de la imagen de destino.
- Intercambio de cabeza completo (head swap) con fusion natural entre la cabeza y el cuerpo.
- Intercambio de cuerpo completo (body swap) con transferencia de la persona de referencia a la escena (experimental, la pose puede no coincidir exactamente).
- Transferencia de expresiones faciales y mejora de la consistencia anatomica en las versiones V2 y V4.
- Compatibilidad con prompts desencadenantes (trigger prompts) como `head_swap: replace the head with the reference head.` o `body_swap: replace the person with the reference person.`.
- Integracion con ComfyUI mediante workflows descargables.
- Soporte para edicion de imagenes con dos imagenes de entrada (cara y cuerpo, o cuerpo y cara segun la version).

## Casos de uso

- Edicion de retratos profesionales: sustituir el rostro de una persona en una fotografia manteniendo la iluminacion y el fondo originales, util para estudios de fotografia o retoques.
- Produccion de contenido para redes sociales: crear variaciones de una misma persona en diferentes escenarios o atuendos sin necesidad de sesiones fotograficas adicionales.
- Restauracion de fotografias antiguas: reemplazar un rostro danado o desenfocado por una version reconstruida a partir de otra imagen de referencia.
- Creacion de avatares personalizados: generar avatares realistas para perfiles digitales, juegos o entornos virtuales usando una foto de referencia.
- Pruebas de vestuario o maquillaje virtual: intercambiar la cabeza de una persona sobre diferentes cuerpos para visualizar combinaciones de ropa o estilos.
- Postproduccion de video (por fotogramas): aplicar el LoRA a cada frame de un video para lograr un intercambio de rostro consistente, aunque el modelo esta disenado para imagenes estaticas.
- Desarrollo de aplicaciones de entretenimiento: integrar el LoRA en herramientas de edicion fotografica para ofrecer funciones de face swap a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se proporcionan requisitos especificos de hardware en la documentacion del modelo.
- Al ser LoRAs sobre modelos base de difusion, la VRAM necesaria depende del modelo base elegido: los modelos FLUX.2-klein de 4B y 9B requieren GPUs con al menos 12-16 GB y 24 GB de VRAM respectivamente para inferencia en precision completa (estimacion orientativa).
- Se recomienda el uso de ComfyUI como interfaz de despliegue, junto con los workflows incluidos en el repositorio.
- Para modelos base como Qwen-Image-Edit-2511, se necesita una GPU con suficiente memoria para el modelo base mas el LoRA (tipicamente 16 GB o mas).
- No se indican opciones de despliegue como vLLM u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Existen otros LoRAs de face swap en plataformas como Civitai, pero no se han encontrado datos concretos para establecer una comparativa objetiva.

## Limitaciones y advertencias

- La version de body swap es experimental y la pose de la persona de referencia puede no transferirse exactamente a la imagen de destino.
- Algunas versiones requieren un orden de entrada especifico de las imagenes (por ejemplo, cuerpo primero y cara despues en las versiones V3, V4, V5 y Flux 2 Klein); no seguir este orden puede producir resultados incorrectos.
- El modelo esta disenado principalmente para el idioma ingles; los prompts deben formularse en ingles para obtener los mejores resultados.
- Aunque el LoRA se distribuye bajo licencia MIT, los modelos base (FLUX.2-klein, Qwen-Image-Edit, Krea-2) pueden tener sus propias licencias y restricciones de uso comercial; es responsabilidad del usuario revisarlas antes de utilizar el modelo en produccion.
- Existe riesgo de generar contenido deepfake o de uso indebido; se recomienda emplear esta tecnologia de forma etica y legal.
- No se garantiza la ausencia de artefactos visuales en casos de iluminacion compleja, oclusiones o angulos extremos.

## Enlaces

- Repositorio original en Hugging Face: https://huggingface.co/sisniha/BFS-Best-Face-Swap
- Copia del repositorio en Hugging Face (Alissonerdx): https://huggingface.co/Alissonerdx/BFS-Best-Face-Swap
- Pagina del modelo en Civitai: https://civitai.red/models/2027766/bfs-best-face-swap
- Workflow de head/face swap para Qwen Image Edit 2509 (Civitai): https://civitai.com/articles/20190/headface-swap-workflow-qwen-image-edit-2509
