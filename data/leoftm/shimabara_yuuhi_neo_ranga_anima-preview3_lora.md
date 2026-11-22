# leoftm/shimabara_yuuhi_neo_ranga_anima-preview3_lora

## Resumen

Shimabara Yuuhi Neo Ranga Anima Preview3 LoRA es un adaptador de bajo rango (LoRA) para generacion de imagenes texto-a-imagen, entrenado sobre el modelo base `circlestone-labs/Anima` (arquitectura de difusion, variante preview3). Lo desarrolla el usuario leoftm y esta publicado en Hugging Face bajo licencia CreativeML OpenRAIL-M. Su funcion es incorporar al modelo base los personajes de la franquicia *Neo Ranga*: Shimabara Yuuhi como personaje principal, junto con Shimabara Ushio, Shimabara Minami y el personaje Joel.

El adaptador resuelve un problema concreto de personalizacion: dotar a un modelo de difusion generalista de la capacidad de generar de forma consistente un elenco de personajes con atributos fisicos y de vestuario bien definidos, incluyendo composiciones multi-personaje. El repositorio ocupa aproximadamente 0,5 GB y se distribuye en formato compatible con la libreria `diffusers`.

Es relevante para desarrolladores e investigadores que trabajan en generacion de imagenes con personajes consistentes, ya que ilustra el flujo habitual de LoRA sobre modelos base de difusion, con palabras de activacion explicitas y recomendaciones de peso de adaptador. No es un modelo de lenguaje ni un modelo multimodal de proposito general: es exclusivamente un adaptador de imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo de difusion texto-a-imagen (base: `circlestone-labs/Anima`, preview3) |
| Parametros totales | no disponible (adaptador de bajo rango; el tamano del repo es de 0,5 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; la longitud la determina el codificador de texto del modelo base) |
| Tipos de cuantizacion | no disponible (se distribuye como pesos LoRA; la cuantizacion depende del modelo base y del runtime) |
| Idiomas soportados | no disponible (las palabras de activacion son en ingles) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | compatible con `diffusers` (pesos LoRA; existen variantes con y sin componente TE entrenado, segun la model card) |

## Arquitectura y entrenamiento

Se trata de un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base de difusion para especializarlo sin reentrenar todos sus pesos. El modelo base declarado es `circlestone-labs/Anima` en su variante preview3. La model card indica que el adaptador se entreno para representar a varios personajes de *Neo Ranga*, con Shimabara Yuuhi como personaje principal, y que existe una version `_no_te` en la que se elimina a posteriori el componente del codificador de texto (TE) entrenado, manteniendo la calidad de salida y reduciendo el tamano del archivo.

No se especifican en la informacion disponible el numero de pasos de entrenamiento, el volumen del dataset, la resolucion de entrenamiento ni si se aplicaron tecnicas de regularizacion o aumento de datos. La model card menciona un checkpoint concreto (`..._20260414_ep-000020`), lo que sugiere 20 epocas, y aporta un hash del LoRA (`ae322e87aa22`). Tambien advierte de un artefacto de entrenamiento: por la composicion de los datos, es frecuente que no se generen bocas, lo que se mitiga anadiendo `no mouth` al prompt negativo. El autor recomienda un peso de LoRA en torno a 0,8: a 1,0 las poses tienden a romperse y a 0,6 cae la fidelidad del personaje.

## Capacidades

- Generacion de imagenes texto-a-imagen de personajes de *Neo Ranga* sobre el modelo base Anima preview3.
- Representacion multi-personaje: la model card incluye un ejemplo con tres chicas y un chico en una misma composicion.
- Palabras de activacion especificas: `shimabara yuuhi`, `shimabara ushio`, `shimabara minami` y `joel \(neo ranga\)`.
- Control de atributos por prompt: color y longitud de pelo, color de ojos, tono de piel, complexion y altura relativa de cada personaje.
- Composicion de escena: el ejemplo documentado especifica poses, contacto entre personajes, encuadre (plano medio completo), angulo de camara y entorno.
- Soporte de prompt negativo para corregir artefactos (manos, dedos, ojos, calidad y el mencionado problema de las bocas).
- No dispone de tool calling, razonamiento multi-paso, modo thinking, vision ni audio: es un adaptador puramente generativo de imagen.
- Capacidades multilingues: no documentadas; las palabras de activacion y los prompts de ejemplo estan en ingles.

## Casos de uso

- Ilustracion de fan art de *Neo Ranga*: el adaptador permite generar escenas con Yuuhi, Ushio, Minami y Joel manteniendo los rasgos definidos en las palabras de activacion, util para comunidades de fans y proyectos editoriales no comerciales o amparados por la licencia.
- Creacion de composiciones grupales: el ejemplo de la model card demuestra que puede generar cuatro personajes en un mismo encuadre con relaciones espaciales explicitas (abrazos, contacto de hombros, primer plano), lo que sirve para portadas, ilustraciones de capitulo o key visuals.
- Prototipado de storyboards: al permitir describir pose, encuadre y entorno en el prompt, se puede usar para explorar variaciones de una misma escena antes de encargar arte final.
- Pruebas de investigacion sobre consistencia de personajes: util como caso de estudio de LoRA multi-personaje, incluido el analisis del efecto del peso del adaptador (0,6 frente a 0,8 frente a 1,0) sobre la fidelidad y la integridad de las poses.
- Generacion de material para modding y contenido derivado: al integrarse en `diffusers`, puede incorporarse a pipelines automatizados de generacion por lotes con prompts parametrizados por personaje.
- Evaluacion comparativa de tecnicas de mitigacion de artefactos: el problema documentado de las bocas ausentes y su solucion via prompt negativo constituye un banco de pruebas practico para estudiar sesgos de datos de entrenamiento en LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, similitud de personaje ni evaluaciones humanas), y las unicas referencias de rendimiento son cualitativas: recomendacion de peso 0,8, degradacion de poses a 1,0 y perdida de fidelidad a 0,6.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; depende enteramente del modelo base `circlestone-labs/Anima` y de la precision empleada. El adaptador en si ocupa unos 0,5 GB en disco.
- GPU recomendadas: no disponibles en la informacion proporcionada. Al ser un LoRA sobre un modelo de difusion, la viabilidad en GPU de consumo depende del modelo base, no del adaptador.
- Compatibilidad con GPU de consumo: no confirmada; requiere verificar los requisitos del modelo base Anima preview3.
- Opciones de despliegue: `diffusers` (libreria declarada en las etiquetas del repositorio); otros runtimes no estan documentados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros LoRA comparables ni datos de rendimiento que permitan una comparacion rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Artefacto documentado: con frecuencia no se generan bocas; el autor recomienda anadir `no mouth` al prompt negativo, lo que indica un sesgo en los datos de entrenamiento.
- Sensibilidad al peso del adaptador: a 1,0 las poses se rompen y a 0,6 disminuye la fidelidad del personaje; el rango util es estrecho.
- Fidelidad multi-personaje no garantizada: el ejemplo documentado es una unica composicion; no hay evidencia de robustez en otras combinaciones de personajes, angulos o niveles de oclusion.
- Riesgo de alucinacion visual: como todo modelo generativo de imagen, puede producir anatomia incorrecta (la propia model card incluye dedos y manos en el prompt negativo), texto ilegible y detalles inconsistentes.
- Dependencia estricta del modelo base: solo es valido para `circlestone-labs/Anima` preview3; no es portable a otras arquitecturas sin reentrenamiento.
- Idiomas: no documentados; los prompts de ejemplo estan en ingles y no hay evidencia de funcionamiento con prompts en castellano.
- Licencia CreativeML OpenRAIL-M: permite uso comercial con restricciones de uso (prohibicion de usos daninos y de ciertas aplicaciones descritas en la licencia) y exige el cumplimiento de sus condiciones de redistribucion y atribucion; conviene revisar el texto completo antes de un despliegue en produccion.
- Posible conflicto de derechos: el adaptador representa personajes de una obra ajena (*Neo Ranga*); la licencia del artefacto no resuelve por si sola los derechos sobre los personajes.
- Madurez: 190 descargas y 0 likes en el momento de la consulta; repositorio con actividad reciente (actualizado en noviembre de 2026) pero sin validacion comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leoftm/shimabara_yuuhi_neo_ranga_anima-preview3_lora
- Archivos del repositorio: https://huggingface.co/leoftm/shimabara_yuuhi_neo_ranga_anima-preview3_lora/tree/main
- Modelo base: https://huggingface.co/circlestone-labs/Anima
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Documentacion de `diffusers`: https://huggingface.co/docs/diffusers
