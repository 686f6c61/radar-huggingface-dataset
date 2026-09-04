# nif0/hln-krea2

## Resumen

`nif0/hln-krea2` es un adaptador LoRA entrenado con DreamBooth sobre el modelo de fundacion Krea 2 de Krea AI. El autor, `nif0`, ha publicado estos pesos para personalizar la generacion de imagenes de Krea 2 mediante el prompt disparador `hln person`. El modelo esta pensado para usarse con la libreria `diffusers` de HuggingFace, cargando el LoRA sobre el checkpoint `krea/Krea-2-Turbo` para obtener resultados rapidos y de alta calidad.

Krea 2 se distribuye en dos variantes: RAW, el checkpoint base no destilado destinado a fine-tuning, y Turbo, un checkpoint destilado de 8 pasos optimizado para inferencia. Los LoRAs entrenados sobre RAW expresan con fuerza al ejecutarse sobre Turbo, lo que convierte a este adaptador en una solucion practica para personalizar el modelo sin necesidad de reentrenar el base. El repositorio ocupa 0,8 GB y contiene los pesos en formato `safetensors`.

Al tratarse de un adaptador LoRA, no es un modelo autonomo: requiere el modelo base Krea 2 para funcionar. La informacion disponible no incluye especificaciones tecnicas del modelo base ni del propio LoRA, como parametros totales, arquitectura interna o datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre Krea 2 (modelo de difusion texto-a-imagen) |
| Parametros totales | no disponible |
| Longitud de contexto | No aplicable (modelo de generacion de imagenes) |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos en `safetensors`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se ha entrenado con el metodo DreamBooth utilizando el trainer oficial de Krea 2 de la libreria `diffusers`. El checkpoint base empleado para el entrenamiento es `krea/Krea-2-Raw`, la variante no destilada de Krea 2. La documentacion del autor indica que los LoRAs entrenados sobre RAW se aplican sobre `krea/Krea-2-Turbo` para la inferencia, ya que Turbo esta optimizado para generar imagenes en 8 pasos sin clasifier-free guidance.

No se proporcionan detalles sobre el dataset de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas de RLHF o DPO. La unica innovacion destacable en el contexto de este adaptador es la separacion RAW/Turbo de Krea 2, que permite entrenar sobre el checkpoint no destilado y ejecutar sobre el destilado manteniendo una fuerte expresion del concepto aprendido.

## Capacidades

- Generacion de imagenes texto-a-imagen utilizando el prompt disparador `hln person`.
- Personalizacion de un sujeto o estilo concreto mediante los pesos LoRA, sin necesidad de reentrenar el modelo base.
- Integracion nativa con la libreria `diffusers` mediante `Krea2Pipeline` y `load_lora_weights`.
- Compatibilidad con el recipe Turbo: 8 pasos de inferencia y `guidance_scale` de 0.0.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades propias de modelos de lenguaje; se limita a la generacion de imagenes.
- No hay informacion sobre soporte de vision, audio u otras modalidades.

## Casos de uso

- Creacion de contenido de marca con un personaje consistente: el LoRA permite generar multiples imagenes de `hln person` en distintos escenarios, manteniendo la identidad visual del personaje, lo que resulta util para campañas publicitarias o materiales de marketing.
- Avatares personalizados: se puede generar un avatar de un usuario con el trigger word, aprovechando la expresion del concepto aprendido sobre Krea 2 Turbo para obtener resultados rapidos y coherentes.
- Ilustracion de personajes para narrativa visual: el adaptador facilita la produccion de una serie de ilustraciones donde el mismo personaje aparece en diferentes poses o ambientes, manteniendo la coherencia estetica.
- Prototipado creativo en diseno: los disenadores pueden generar variaciones de un personaje para moodboards o exploraciones de estilo, usando el recipe Turbo para iterar con rapidez.
- Contenido para redes sociales: se pueden producir imagenes de `hln person` en diferentes estilos y contextos, adaptadas a distintos formatos y plataformas, gracias a la flexibilidad del prompt y la velocidad del checkpoint Turbo.
- Investigacion en personalizacion de modelos de difusion: el adaptador sirve como caso de estudio para analizar como los LoRAs entrenados sobre un checkpoint RAW se transfieren a un checkpoint destilado Turbo, especialmente en terminos de fidelidad y expresion del concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Depende del modelo base Krea 2 Turbo, que no se especifica en la informacion proporcionada.
- GPU recomendadas: no disponible. Se requiere una GPU compatible con CUDA y soporte para `torch.bfloat16`, como se indica en el ejemplo de uso.
- Compatibilidad con GPU de consumo: no disponible. Dependera de los requisitos de memoria del checkpoint base.
- Opciones de despliegue: se puede cargar mediante `Krea2Pipeline` de `diffusers` con `load_lora_weights`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparables en la informacion proporcionada. El modelo es un adaptador LoRA especifico para Krea 2, y no se han encontrado otros LoRAs de la misma categoria con datos publicados que permitan una comparacion directa.

## Limitaciones y advertencias

- La model card esta incompleta: las secciones de limitaciones, sesgos y detalles de entrenamiento contienen marcadores `TODO`, por lo que no se ha realizado una evaluacion publica de estos aspectos.
- Riesgo de sesgos y alucinaciones visuales no evaluado: al no disponer de datos de entrenamiento ni de pruebas de sesgo, el adaptador podria generar imagenes con caracteristicas no deseadas o reforzar estereotipos.
- Dependencia del modelo base: el LoRA solo funciona con Krea 2, y su comportamiento puede variar entre los checkpoints RAW y Turbo.
- Restricciones de licencia: el adaptador se publica bajo Apache 2.0, pero el modelo base Krea 2 puede tener su propia licencia y condiciones de uso que no se detallan en la informacion disponible.
- Sin datos de rendimiento: no se han publicado benchmarks ni metricas de calidad de imagen, lo que limita la evaluacion objetiva del adaptador.
- Ausencia de documentacion sobre el dataset de entrenamiento: se desconoce la composicion, tamano y procedencia de los datos utilizados para entrenar el LoRA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nif0/hln-krea2
- Pagina oficial de Krea 2: https://www.krea.ai/krea-2
- Repositorio de inferencia de Krea 2 en GitHub: https://github.com/krea-ai/krea-2
- Documentacion de diffusers sobre carga de LoRAs: https://huggingface.co/docs/diffusers/main/en/using-diffusers/loading_adapters
