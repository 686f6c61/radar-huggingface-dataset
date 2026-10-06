# 19nbrown/qwen-image-2.1-casual-phone-photo-style-lora

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA de estilo entrenado sobre Qwen-Image-2.1, el modelo unificado de generacion y edicion de imagenes de la familia Qwen (Alibaba). El adaptador lo publica el usuario 19nbrown bajo el identificador `19nbrown/qwen-image-2.1-casual-phone-photo-style-lora` y su objetivo es aportar una estetica comun de "foto casual hecha con movil" a las generaciones del modelo base.

El modelo base, Qwen-Image-2.1, emplea una arquitectura de Diffusion Transformer (DiT) con 32 capas single-stream y unos 7000 millones de parametros en su componente de generacion visual, segun el repositorio oficial de QwenLM. El LoRA se activa mediante la palabra disparadora `lbxstyle` y el autor recomienda una escala inicial de 0,8, ajustable segun el resultado.

La relevancia de esta ficha es acotada: se trata de un fine-tune de una sola ejecucion, con 126 pares imagen-caption, rango 32, 3 epocas y 5 repeticiones por imagen (1890 pasos, coherente con el nombre del fichero de pesos). No hay licencia declarada, no hay benchmarks publicados y el repositorio ocupa 0,2 GB. Es un adaptador experimental, no un modelo listo para produccion sin validacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (Low-Rank Adaptation) sobre Qwen-Image-2.1, un Diffusion Transformer (DiT) de 32 capas single-stream para generacion y edicion de imagen |
| Parametros totales | no disponible (adaptador; el repositorio ocupa 0,2 GB y el modelo base declara 7B en su componente de generacion visual) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de contexto de texto; la generacion se controla por prompt) |
| Tipos de cuantizacion | no disponible para el adaptador; los pesos se distribuyen en safetensors |
| Idiomas soportados | no disponible; las instrucciones del autor y el prompt de ejemplo estan en ingles |
| Licencia | no disponible |
| Formato de pesos | safetensors (`lbxstyle-qwen-image-2.1-step-1890.safetensors`), compatible con el pipeline `text-to-image` |
| Modelo base | Qwen/Qwen-Image-2.1 |
| Palabra disparadora | `lbxstyle` |
| Escala LoRA recomendada | 0,8 (ajustable) |
| Rango LoRA | 32 |
| Datos de entrenamiento | 126 pares imagen-caption, 3 epocas, 5 repeticiones por imagen (1890 pasos) |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes en HuggingFace | 0 descargas / 11 likes |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 que se inyecta en las capas del modelo base Qwen-Image-2.1. Este ultimo es un modelo unificado de text-to-image y edicion de imagen construido sobre un Diffusion Transformer de 32 capas single-stream, con aproximadamente 7000 millones de parametros en el componente de generacion visual. El LoRA no modifica la arquitectura base: anade matrices de bajo rango que desplazan el comportamiento del modelo hacia una distribucion estetica concreta.

En cuanto al entrenamiento, la model card indica 126 pares imagen-caption, 3 epocas y 5 repeticiones por imagen, lo que da 1890 pasos de entrenamiento (coincidente con el nombre del checkpoint publicado). No se especifica la resolucion de entrenamiento, el optimizador, la tasa de aprendizaje, el hardware utilizado ni si hubo etapas de ajuste adicionales. Tampoco se documenta la procedencia de las imagenes del dataset ni si contienen personas identificables. No hay informacion sobre tecnicas de regularizacion, uso de captions automaticos o filtrado de datos, ni sobre innovaciones tecnicas mas alla del propio ajuste de bajo rango.

## Capacidades

- Generacion de imagenes text-to-image a traves del modelo base Qwen-Image-2.1, con el adaptador aplicado como modificador de estilo.
- Transferencia de estilo fotografico concreto: estetica de fotografia casual tomada con telefono movil, activada con la palabra `lbxstyle`.
- Control de intensidad del estilo mediante la escala LoRA (el autor sugiere 0,8 como punto de partida).
- Compatibilidad con el pipeline `text-to-image` de HuggingFace y con plataformas que acepten LoRA en safetensors por URL directa (el ejemplo de la model card usa un endpoint tipo SpicyAPI).
- Composicion con el resto de capacidades del modelo base, incluyendo generacion y edicion de imagen, siempre que la plataforma de inferencia soporte el apilado de LoRA.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, vision de entrada, audio ni modo "thinking": el adaptador es exclusivamente de generacion de imagen.

## Casos de uso

- Contenido generado por usuarios (UGC) simulado: generar imagenes con aspecto de foto espontanea de movil para campanas que buscan autenticidad frente a la fotografia de estudio, usando `lbxstyle` junto a una descripcion explicita de la escena.
- Mockups de aplicaciones moviles: rellenar galerias, feeds y pantallas de producto con imagenes que imitan el tipo de foto que un usuario subiria realmente, sin recurrir a bancos de imagenes con estetica demasiado pulida.
- Catalogos de marketplace de segunda mano: ilustrar anuncios de productos donde la convencion visual es la foto amateur tomada en casa, manteniendo el sujeto y el fondo descritos en el prompt.
- Generacion de datasets sinteticos: crear conjuntos de imagenes con estetica amateur para entrenar o evaluar clasificadores que distingan fotografia casual de fotografia profesional.
- Ilustracion editorial y blogs: acompanar articulos sobre tecnologia de consumo, redes sociales o cultura de internet con imagenes de aspecto espontaneo en lugar de composiciones de stock.
- Investigacion en transferencia de estilo: servir como caso de estudio de un LoRA de rango 32 entrenado con solo 126 imagenes, util para medir sobreajuste, fuga de la palabra disparadora y sensibilidad a la escala.
- Pruebas de sesgo estetico: analizar que rasgos concretos (iluminacion, encuadre, ruido, colores) aprende el adaptador a partir de un corpus pequeno y si se imponen sobre la descripcion textual del prompt.
- Prototipado rapido en pipelines creativos: integrar el LoRA en un flujo de generacion por lotes para explorar variaciones de estilo antes de decidir una direccion visual definitiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, ImageReward ni comparaciones con otros adaptadores de estilo), y el repositorio de HuggingFace no registra evaluaciones. Cualquier valoracion del adaptador tendra que hacerse mediante comparacion visual propia a distintas escalas LoRA.

## Requisitos de hardware

- El adaptador en si ocupa 0,2 GB, pero la inferencia requiere cargar el modelo base Qwen-Image-2.1 completo; el coste de VRAM lo determina el modelo base, no el LoRA.
- Segun el proyecto `qwen-image-studio`, el checkpoint completo en bf16 ocupa 33 GB y solo el codificador de texto 17,5 GB, lo que situa los requisitos naive por encima de 32 GB de VRAM.
- El mismo proyecto consigue ejecutar el pipeline completo con un pico de memoria inferior a 12 GB mediante cuantizacion y offloading, lo que abre la puerta a GPUs de consumo.
- GPU recomendadas: A100 (40/80 GB) o H100 para ejecucion en bf16 sin optimizaciones; RTX 4090 (24 GB), RTX 3090 (24 GB) o equivalentes con cuantizacion y offloading para el pipeline optimizado.
- Cabe en GPU de consumo (24 GB e incluso menos con las optimizaciones citadas), pero no sin tecnicas de reduccion de memoria.
- Opciones de despliegue: pipelines de `diffusers` con soporte LoRA, entornos con carga de safetensors por URL (el ejemplo de la model card apunta a un endpoint tipo SpicyAPI) y el mencionado `qwen-image-studio` para ejecucion local con interfaz web.
- Latencia y throughput: no disponibles para este adaptador. Como referencia del modelo base, el proyecto `qwen-image-studio` afirma reducir una edicion de imagen de unos 25 minutos a menos de 3 minutos en su configuracion optimizada; no hay datos de latencia especificos del LoRA.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / datos | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| 19nbrown/qwen-image-2.1-casual-phone-photo-style-lora | LoRA de estilo sobre Qwen-Image-2.1 | no disponible (repo de 0,2 GB, rango 32) | 126 pares imagen-caption, 3 epocas | Sin benchmarks publicados | no disponible | HuggingFace, 0 descargas, 11 likes |
| Qwen/Qwen-Image-2.1 (modelo base) | DiT unificado de generacion y edicion de imagen | 7B en el componente de generacion visual, 32 capas single-stream | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace y GitHub de QwenLM |
| Otros LoRA de estilo para Qwen-Image-2.1 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion disponible solo permite comparar el adaptador con su modelo base y no aporta datos sobre alternativas equivalentes de la misma categoria.

## Limitaciones y advertencias

- Fine-tune de una sola ejecucion: el propio autor lo describe como un ajuste pequeno y de un unico run, y recomienda comparar generaciones a varias escalas LoRA antes de usarlo en lotes grandes.
- Dataset muy reducido: 126 pares imagen-caption son insuficientes para garantizar consistencia estilistica, y aumentan el riesgo de sobreajuste a las escenas concretas del corpus.
- Fuga de la palabra disparadora: si `lbxstyle` se omite, el estilo no se aplica; si se usa con escalas altas, puede imponer rasgos no deseados y desplazar el contenido solicitado.
- Necesidad de prompts explicitos: el adaptador esta pensado para aportar solo la estetica, por lo que sujeto y escena deben describirse con detalle o el modelo tendra mas libertad para desviarse.
- Riesgo de reproduccion de contenido del entrenamiento: no se documenta la procedencia de las 126 imagenes ni si contienen personas identificables, marcas o lugares concretos, lo que introduce un posible riesgo de memorizacion y de problemas de privacidad o derechos de imagen.
- Licencia no disponible: al no declararse licencia, no puede asumirse uso comercial permitido. Ademas, el uso comercial depende tambien de la licencia del modelo base Qwen-Image-2.1, que no se detalla en la informacion proporcionada.
- Sesgos: no hay analisis de sesgos del adaptador. Al aprender de un corpus pequeno y no documentado, puede reproducir sesgos de representacion (etnia, edad, genero, clase social) presentes en esas imagenes, especialmente en la estetica de "foto casual".
- Artefactos propios de la generacion de imagenes: manos deformes, texto ilegible en carteles o pantallas, incoherencias de perspectiva y repeticion de patrones, agravados por la estetica de baja calidad intencionada.
- Idiomas: no hay informacion sobre el soporte multilingue de los prompts; el material del autor esta redactado en ingles.
- Ausencia de benchmarks y de validacion independiente: no hay ninguna metrica publicada que permita estimar la fidelidad al estilo ni la degradacion del contenido solicitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/19nbrown/qwen-image-2.1-casual-phone-photo-style-lora
- Modelo base Qwen-Image-2.1 en HuggingFace: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio GitHub de Qwen-Image-2.1: https://github.com/QwenLM/Qwen-Image-2.1
- Proyecto qwen-image-studio (ejecucion local optimizada): https://github.com/sanketshinde3001/qwen-image-studio
- Ficha de registro en free2aitools: https://free2aitools.com/model/19nbrown/qwen-image-2.1-casual-phone-photo-style-lora
- Fichero de pesos safetensors: https://huggingface.co/19nbrown/qwen-image-2.1-casual-phone-photo-style-lora/resolve/main/lbxstyle-qwen-image-2.1-step-1890.safetensors
