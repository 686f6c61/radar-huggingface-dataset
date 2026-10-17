# ifmylove2011/girlslike-zimage

## Resumen

`ifmylove2011/girlslike-zimage` no es un modelo generativo completo, sino una colección de adaptadores de tipo LoKR/LoRA para el modelo de difusión text-to-image **Z-Image** de Tongyi-MAI (Alibaba), en sus variantes Base y Turbo. Cada adaptador está entrenado para reproducir la identidad de una persona concreta: el disparador (trigger word) es el nombre real de la persona, o bien un identificador específico documentado en la marca de agua de las imágenes de ejemplo con el formato `girlslikezi for xxx`.

El repositorio distingue dos series. La serie **zi** se entrena sobre Z-Image Base con un esquema de LoKR de rango completo, es compatible tanto con el modelo Base como con Turbo y se recomienda usarla con peso 1,0 (hasta 1,5) sobre Turbo. La serie **zit** se entrena sobre Z-Image Turbo, funciona únicamente con ese modelo y presenta peor compatibilidad con otros adaptadores. El autor advierte explícitamente de que el entrenamiento sobre la variante Base carece todavía de un método consolidado, y de que persisten problemas anatómicos en las imágenes generadas.

Su relevancia práctica es doble: por un lado, documenta un flujo de trabajo reproducible de generación en pocos pasos (4-10 pasos, CFG en torno a 1, resolución 1080x1440) sobre el ecosistema Z-Image dentro de ComfyUI; por otro, sirve como caso de estudio de los riesgos asociados a adaptadores que replican el rostro de personas reales. El repositorio acumula 59.503 descargas y 64 likes, ocupa 7,8 GB y se distribuye con licencia Apache 2.0 para el adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoKR (serie zi, rango completo) y LoRA (serie zit) sobre el modelo de difusion text-to-image Z-Image; no es un modelo completo |
| Parametros totales | No disponible (no se publica el recuento de parametros del adaptador; el repositorio ocupa 7,8 GB) |
| Longitud de contexto | No aplica: modelo text-to-image; no se documenta limite de tokens del prompt |
| Tipos de cuantizacion | BF16 es la precision de referencia de los ejemplos; no se documentan GGUF, FP8 ni otras variantes |
| Idiomas soportados | No disponible; todos los prompts de ejemplo estan redactados en chino |
| Licencia | Apache 2.0 (adaptador); la licencia del modelo base se rige por sus propios terminos |
| Formato de pesos | Pesos para la libreria `diffusers`; el formato de fichero concreto no se detalla en la informacion disponible |
| Modelo base | `Tongyi-MAI/Z-Image` y `Tongyi-MAI/Z-Image-Turbo` |
| Variantes incluidas | Serie `zi` (entrenada sobre Base, utilizable en Base y Turbo) y serie `zit` (solo Turbo) |
| Trigger words | Nombre real de la persona o trigger especifico indicado en la marca de agua (`girlslikezi for xxx`) |
| Peso recomendado del adaptador | 0,5-1,5; 1,0 en ejemplos con `zi`, 0,9 en ejemplos con `zit` |
| Resolucion de los ejemplos | 1080x1440 |
| Pasos de muestreo | 8 en los ejemplos; 4 utilizables, sin ganancia apreciable por encima de 10 |
| Descargas / likes | 59.503 / 64 |
| Creado / actualizado | 18-12-2025 / 17-10-2026 |

## Arquitectura y entrenamiento

El adaptador se inyecta sobre Z-Image, un modelo de difusion text-to-image de Tongyi-MAI. La serie `zi` emplea un **LoKR de rango completo** entrenado en BF16 sobre Z-Image Base; el autor justifica esta eleccion por la ausencia de un metodo generico satisfactorio para entrenar sobre la variante Base. La serie `zit` se entrena sobre Z-Image Turbo y hereda las limitaciones de compatibilidad de ese modelo. No se documentan en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset, el numero de imagenes por identidad, ni si se aplicaron tecnicas de regularizacion o de aumento de datos.

El autor describe dos comportamientos observados. Primero, los LoKR entrenados sobre Base usados con Turbo producen una textura mas cercana a la del propio Turbo (interpretada como que la parte de bajo ruido del modelo Base es dificil de "contaminar"), con mejor similitud en planos medios y lejanos que la serie `zit`, pero con primeros planos mas planos. Segundo, los problemas anatomicos presentes ya en la generacion con el modelo Base se trasladan al entrenamiento y reaparecen como inestabilidad en extremidades. Se mencionan como innovaciones de uso, no de arquitectura, el muestreo dual con cambio de scheduler a DDIM en el primer paso para aumentar la diversidad y el nodo `ModelSamplingAuraFlow` para ajustar el valor de shift entre 3 y 10 (shift=3 equivale a la salida original).

## Capacidades

- Generacion text-to-image de retratos y figuras humanas con identidad controlada mediante un trigger word.
- Reproduccion de personas concretas a partir de su nombre real como prompt, sin prefijos ni sufijos adicionales.
- Compatibilidad cruzada de la serie `zi` con Z-Image Base, Z-Image Turbo y ajustes derivados de Base.
- Ajuste fino de la similitud mediante el peso del adaptador (rango 0,5-1,5; por encima de 1,5 el autor desaconseja subir).
- Generacion en pocos pasos: 4 pasos ya producen resultados utilizables, con 8 pasos como ajuste de referencia.
- Soporte de prompts en chino, idioma de todos los ejemplos publicados.
- Control de estilo y diversidad mediante muestreo dual, shift de AuraFlow y CFG (0,7-1 realza la textura; 1-3 gana precision a costa de un aspecto mas "IA").
- Ejemplos publicados con el flujo de trabajo embebido en los metadatos de las imagenes, reutilizables en ComfyUI.
- No ofrece tool calling, razonamiento multi-paso, agentes, vision ni audio: son capacidades no aplicables a un adaptador de difusion.

## Casos de uso

- **Investigacion sobre consistencia de identidad en modelos de difusion**: el adaptador permite medir como se degrada o se mantiene una identidad concreta al variar pasos, CFG, shift y peso del LoKR, con una configuracion de referencia ya publicada (1080x1440, 8 pasos, CFG 1).
- **Evaluacion comparada de adaptadores Base frente a Turbo**: al incluir variantes `zi` y `zit` entrenadas sobre el mismo tipo de sujeto, sirve para estudiar la transferencia de adaptadores entre el modelo Base y su version destilada en pocos pasos.
- **Pruebas de concepto en produccion editorial con derechos de imagen**: en estudios que dispongan de consentimiento escrito de la persona retratada, el adaptador permite generar variaciones de vestuario, encuadre e iluminacion sin una sesion fotografica adicional, con pesos entre 0,5 y 1,0 para no forzar el parecido.
- **Auditoria de riesgos de deepfake**: el repositorio documenta de forma explicita que el modelo base ya puede generar cierto parecido de personas publicas sin adaptador y que el LoKR lo refuerza; es material directo para pruebas internas de deteccion y politicas de moderacion.
- **Formacion tecnica sobre licencias y derechos de imagen**: caso practico para explicar por que una licencia Apache 2.0 en el adaptador no resuelve los derechos de imagen de las personas representadas ni las obligaciones del RGPD.
- **Desarrollo de flujos de generacion de retrato en ComfyUI**: los ejemplos incluyen el grafo completo, lo que permite reutilizar la cadena de muestreo (er_sde + sgm_uniform, euler + flowmatch) como plantilla para otros adaptadores, propios o sinteticos.
- **Creacion de personajes sinteticos con la misma tecnica**: sustituyendo el trigger por un identificador ficticio, el mismo esquema de LoKR de rango completo sobre Base sirve para mantener la coherencia de un personaje inventado a lo largo de una serie de imagenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay metricas objetivas de similitud facial (tipo cosine similarity sobre embeddings faciales), FID, CLIP score ni comparaciones cuantitativas con otros adaptadores de personaje. La unica informacion de rendimiento es cualitativa y procede de las notas del autor:

| Ajuste | Observacion del autor |
|---|---|
| Pasos | 4 pasos ya utilizables; por encima de 10 no hay ganancia apreciable |
| CFG | 0,7-1 amplifica la ventaja de textura de Z-Image; 1-3 gana precision pero con aspecto mas "IA"; ambos aumentan el tiempo de generacion |
| Shift (AuraFlow) | Valores entre 3 y 10; shift=3 equivale a la salida original |
| Diversidad | Muestreo dual cambiando el scheduler a DDIM en el primer paso |
| Peso del LoKR (zi) | 1,0 con Turbo; hasta 1,5 para reforzar similitud; reducir con Base |
| Peso del LoRA (zit) | 0,9 en los ejemplos publicados |

## Requisitos de hardware

- No se publican requisitos oficiales de VRAM. La inferencia exige cargar el modelo base completo (Z-Image Base o Turbo en BF16) y aplicar el adaptador encima; el repositorio del adaptador ocupa 7,8 GB en disco, un dato que no equivale al consumo en VRAM.
- Resolucion de referencia de 1080x1440 con 8 pasos: el coste de activaciones a esa resolucion es el factor dominante, no el tamano del adaptador.
- No hay datos verificados de que quepa en GPU de consumo. La informacion disponible no permite afirmar compatibilidad con RTX 4090, RTX 3090 ni tarjetas de 8-12 GB.
- Para entornos profesionales, las GPU de referencia habituales en difusion de alta resolucion (A100 80 GB, H100) son las unicas para las que se puede asumir margen, aunque el dato no este confirmado en las fuentes.
- Despliegue: `diffusers` (libreria declarada en el repositorio) y ComfyUI (los ejemplos incluyen el flujo de trabajo y usan el nodo `ModelSamplingAuraFlow`). vLLM, TGI, llama.cpp y Ollama no son aplicables a un modelo de difusion.
- Latencia y throughput: no disponibles. El uso de 4-8 pasos en lugar de 20-50 reduce el tiempo de inferencia de forma proporcional al numero de evaluaciones del modelo.

## Comparativa con modelos similares

No se dispone de datos de terceros (otros adaptadores de personaje para Z-Image, SDXL o FLUX.1) en la informacion proporcionada, por lo que la comparacion se limita a las variantes incluidas en el propio repositorio y al modelo base sin adaptador.

| Modelo | Tipo | Modelo base | Pasos | Licencia | Observaciones |
|---|---|---|---|---|---|
| girlslike-zimage (serie zi) | LoKR de rango completo | Z-Image Base y Turbo | 4-10 (8 en ejemplos) | Apache 2.0 (adaptador) | Mayor compatibilidad; mejor similitud en planos medios y lejanos con Turbo; primeros planos mas planos |
| girlslike-zimage (serie zit) | LoRA | Solo Z-Image Turbo | 4-10 (8 en ejemplos) | Apache 2.0 (adaptador) | Menor compatibilidad con otros adaptadores; requiere Turbo |
| Z-Image Turbo sin adaptador | Modelo completo | No aplica | 4-10 | No disponible en las fuentes | No reproduce de forma fiable la identidad objetivo |
| Z-Image Base sin adaptador | Modelo completo | No aplica | No disponible | No disponible en las fuentes | Idem; el autor senala que ya presenta problemas anatomicos |
| Adaptadores de personaje para SDXL o FLUX.1 | LoRA | SDXL / FLUX.1 | No disponible | No disponible | Sin datos en las fuentes consultadas; no comparables numericamente |

## Limitaciones y advertencias

- **Derechos de imagen y suplantacion**: el adaptador replica el rostro de personas reales identificadas por su nombre. El autor prohibe explicitamente su uso para suplantacion, engano u otros fines impropios, pero la licencia Apache 2.0 no impone restricciones adicionales por si misma; la responsabilidad recae en quien despliega el modelo.
- **RGPD y consentimiento**: no se documenta si las personas representadas han dado consentimiento ni como se obtuvo el material de entrenamiento. En la UE, generar y publicar imagenes de personas identificables requiere base juridica.
- **Problemas anatomicos**: el autor reconoce que persisten errores en extremidades y que el modelo Base ya los produce, lo que contamina el entrenamiento y hace la generacion inestable en ese aspecto.
- **Compatibilidad limitada entre adaptadores**: los LoRA entrenados sobre Turbo se combinan mal con otros adaptadores; los entrenados sobre Base son mas tolerantes, pero el propio autor califica la compatibilidad global de "dudosa".
- **Sensibilidad al peso**: por encima de 1,5 el parecido deja de mejorar y la imagen se degrada; con el modelo Base conviene bajar el peso respecto a los valores usados con Turbo.
- **Riesgo de alucinacion visual**: el prompt puede producir atributos, ropa o contextos inexistentes para la persona retratada, con apariencia plausible.
- **Documentacion unicamente en chino** y ausencia de informacion sobre sesgos demograficos, composicion del dataset o equilibrio de identidades.
- **Dependencia del modelo base**: los terminos de licencia y las limitaciones de Z-Image Base/Turbo se aplican igualmente al uso del adaptador.
- **Metodo de entrenamiento no consolidado**: el autor indica que no existe un esquema generico para entrenar sobre Z-Image Base y que el suyo es una solucion provisional sujeta a cambios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ifmylove2011/girlslike-zimage
- Arbol de ficheros del repositorio: https://huggingface.co/ifmylove2011/girlslike-zimage/tree/main
- Galeria de abreviaturas y nombres reales (Space): https://huggingface.co/spaces/ifmylove2011/girlslike_lora_gallery/blob/main/app.py
- Fuente de los prompts de ejemplo (Civitai): https://civitai.com/models/2231696
- Modelo base Z-Image: https://huggingface.co/Tongyi-MAI/Z-Image
- Modelo base Z-Image Turbo: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Perfil del autor en HuggingFace: https://huggingface.co/ifmylove2011
- Perfil del autor en GitHub: https://github.com/ifmylove2011/
- Ficha de terceros con metadatos del modelo: https://essamamdani.com/ai-models/hf-ifmylove2011-girlslike-zimage
- Directorio de modelos del autor: https://www.aimodels.fyi/creators/huggingface/ifmylove2011
