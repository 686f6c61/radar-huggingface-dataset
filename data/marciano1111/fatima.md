# marciano1111/fatima

## Resumen

Fatima es un adaptador LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, desarrollado por el usuario marciano1111 y publicado bajo licencia Apache 2.0. El adaptador introduce un concepto concreto —invocado mediante el token `Fatim`— sobre el modelo base `krea/Krea-2-Raw`, y se ha entrenado para ser utilizado tanto sobre la variante RAW como sobre la variante Turbo del modelo base, que es la empleada en las muestras publicadas.

El repositorio tiene un tamano de 0,8 GB, coherente con un adaptador LoRA de rango bajo y no con un modelo completo. Se distribuye en formato compatible con la libreria `diffusers` y se carga mediante `load_lora_weights` sobre una instancia de `Krea2Pipeline`. No se especifican parametros de arquitectura, numero de pasos de entrenamiento, composicion del dataset ni metadatos del proceso de entrenamiento mas alla de la mencion a DreamBooth-LoRA.

La relevancia de esta ficha es acotada: se trata de un adaptador de concepto de nicho, sin descargas ni interacciones registradas en el momento de la consulta, y sin documentacion tecnica detallada. Resulta util como ejemplo de flujo de personalizacion sobre Krea 2 y para quien necesite reproducir la invocacion del concepto `Fatim` en un pipeline de difusion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion texto-a-imagen; el modelo base es Krea 2 (arquitectura del base no detallada en la informacion disponible) |
| Parametros totales | no disponible (adaptador LoRA; el tamano del repositorio es de 0,8 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen); no disponible la longitud maxima de prompt |
| Tipos de cuantizacion | no disponible (las muestras se generan con `torch_dtype=torch.bfloat16` sobre el base) |
| Idiomas soportados | no disponible (el prompt de ejemplo esta en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos LoRA compatibles con `diffusers` (`load_lora_weights`); no se detalla el formato de fichero exacto |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado con la tecnica DreamBooth sobre el modelo base Krea 2 RAW. DreamBooth permite asociar un sujeto o concepto concreto a un token poco frecuente —en este caso `Fatim`— mediante un conjunto reducido de imagenes de referencia, y el resultado se inyecta como matrices de bajo rango en las capas del modelo de difusion. El autor indica que el adaptador se entreno sobre `krea/Krea-2-Raw` pero que las muestras publicadas se generaron sobre `krea/Krea-2-Turbo` con 8 pasos de inferencia y `guidance_scale=0.0`, lo que sugiere compatibilidad cruzada entre ambas variantes.

No se proporciona informacion sobre el numero de imagenes del dataset, el numero de pasos de entrenamiento, la tasa de aprendizaje, el rango del LoRA ni la resolucion de entrenamiento. Tampoco se documenta si se aplicaron tecnicas adicionales como regularizacion por clase, aumento de datos o ajuste de text encoder. La unica innovacion tecnica reseñable es el propio flujo de uso: carga del adaptador sobre un pipeline Krea 2 en `diffusers` y generacion en regimen Turbo con muy pocos pasos.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales en ingles, condicionada por el token `Fatim`.
- Personalizacion de un concepto o identidad concreta sobre el modelo base Krea 2, manteniendo el estilo del prompt (retrato cinematografico, pintura al oleo, escena de selva, etc.).
- Compatibilidad con la variante Turbo del modelo base, lo que permite inferencia en 8 pasos con `guidance_scale=0.0`.
- Composicion de escenas complejas: los ejemplos de la model card incluyen entornos urbanos cyberpunk, junglas prehistoricas y bibliotecas goticas, lo que indica capacidad de integrar el concepto en contextos variados.
- Integracion programatica mediante la API de `diffusers` (`Krea2Pipeline` + `load_lora_weights`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo thinking; no aplican a un modelo texto-a-imagen.
- Capacidades multilingues: no disponibles; los prompts de ejemplo estan en ingles.

## Casos de uso

- Prototipado de personajes para narrativa visual: usar el token `Fatim` para generar variaciones consistentes del personaje en distintos entornos (cyberpunk, selva, biblioteca gotica) y construir un storyboard con identidad visual estable.
- Pruebas de concepto en estudios de diseno: evaluar rapidamente como se comporta un LoRA de identidad sobre Krea 2 Turbo antes de invertir en un entrenamiento propio con un dataset mayor.
- Generacion de material promocional tematico: producir ilustraciones de un personaje concreto para campanas, portadas o assets de redes sociales, aprovechando la inferencia en 8 pasos para iterar con bajo coste computacional.
- Investigacion sobre personalizacion de modelos de difusion: emplear este adaptador como referencia reproducible para comparar tecnicas DreamBooth-LoRA sobre distintos modelos base y medir la transferencia entre variantes RAW y Turbo.
- Integracion en pipelines de generacion por lotes: cargar el LoRA en un servicio basado en `diffusers` y generar conjuntos de imagenes con el concepto `Fatim` para pruebas A/B de estilos.
- Educacion y demostraciones: ilustrar en talleres o articulos como se invoca un concepto personalizado mediante un token y como se compone con prompts descriptivos detallados.
- Creacion de datasets sinteticos: generar imagenes etiquetadas de un personaje ficticio para entrenar o evaluar otros sistemas de vision, siempre que la licencia Apache 2.0 y las condiciones del modelo base lo permitan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base Krea 2, no del adaptador. El LoRA en si ocupa 0,8 GB en disco y un incremento marginal de VRAM al cargarse sobre el pipeline.
- GPU recomendadas: no disponibles en la informacion proporcionada. El ejemplo oficial usa `torch_dtype=torch.bfloat16` y `.to("cuda")`, lo que requiere una GPU compatible con bfloat16 (serie Ampere o posterior en NVIDIA).
- Compatibilidad con GPU de consumo: no confirmada; al depender del modelo base, la viabilidad en tarjetas como RTX 4090 o RTX 3090 no puede afirmarse sin conocer los requisitos de Krea 2.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` y `load_lora_weights`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion de imagen.
- Latencia y throughput: no disponibles. El autor indica 8 pasos de inferencia en la variante Turbo, lo que reduce el coste frente a un muestreo completo, pero no se aportan tiempos medidos.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables, y el adaptador depende de un modelo base (Krea 2) cuyas caracteristicas tecnicas no se detallan en la documentacion consultada.

## Limitaciones y advertencias

- Documentacion tecnica muy escasa: no se especifican dataset, pasos de entrenamiento, rango del LoRA ni hiperparametros, lo que dificulta la reproducibilidad.
- Sin descargas ni interacciones registradas en el momento de la consulta, por lo que no hay evidencia externa de calidad o estabilidad del adaptador.
- El concepto se activa con un token especifico (`Fatim`); fuera de ese token el adaptador puede no tener efecto o introducir sesgos no deseados en la generacion.
- Riesgo de sobreajuste al sujeto de entrenamiento y de degradacion de la diversidad de las imagenes generadas, habitual en LoRA DreamBooth con datasets pequenos.
- Posibles sesgos en la representacion del concepto (apariencia, genero, etnia, vestimenta) heredados del dataset de entrenamiento, que no se documenta.
- Idiomas soportados no declarados; los prompts de ejemplo estan en ingles y no hay evidencia de buen comportamiento en castellano.
- La licencia Apache 2.0 del adaptador no exime de cumplir las condiciones del modelo base `krea/Krea-2-Raw` y `krea/Krea-2-Turbo`, cuyos terminos de uso comercial no se detallan en la informacion disponible.
- Uso en produccion no recomendado sin una evaluacion previa de calidad, coherencia del concepto y comportamiento en prompts fuera de distribucion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/marciano1111/fatima
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Variante Turbo del modelo base (referenciada en el codigo de ejemplo): https://huggingface.co/krea/Krea-2-Turbo
- Libreria diffusers: https://github.com/huggingface/diffusers
