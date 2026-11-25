# Archemimi/eugie

## Resumen

Eugie es un adaptador LoRA de tipo DreamBooth para el modelo de difusion text-to-image Krea 2, desarrollado por el usuario Archemimi. Se entrena sobre la variante Krea-2-Raw y se muestra funcionando sobre Krea-2-Turbo, lo que permite invocar un concepto visual concreto mediante el token disparador `eugie`. El repositorio ocupa aproximadamente 0,8 GB y se distribuye bajo licencia Apache 2.0.

El modelo resuelve el problema clasico de personalizacion de un concepto en generacion de imagenes: en lugar de describir el sujeto con prompts largos, basta con incluir la palabra `eugie` en el prompt para que el pipeline reproduzca el concepto aprendido. Al ser un LoRA, no reentrena el modelo base, sino que anade pesos de bajo rango que se cargan por encima de Krea 2 mediante la libreria diffusers.

Es relevante para desarrolladores que ya trabajan con Krea 2 y quieren incorporar un concepto personalizado sin desplegar un modelo completo adicional. La informacion publicada es escasa: no hay datos de parametros, contexto, idiomas ni benchmarks, y el numero de descargas es muy bajo (15 en el momento de la consulta), lo que sugiere un uso experimental mas que de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (DreamBooth) sobre modelo de difusion Krea 2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos LoRA compatibles con diffusers (no se especifica safetensors/GGUF) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de DreamBooth entrenado sobre Krea-2-Raw, la variante base del modelo Krea 2. La model card indica que las muestras se generaron aplicando el LoRA sobre Krea-2-Turbo con 8 pasos de inferencia y `guidance_scale=0.0`, lo que es coherente con el uso de un modelo destilado de pocos pasos. No se detalla el numero de imagenes de entrenamiento, el rango del LoRA, la tasa de aprendizaje ni la composicion del dataset.

La innovacion tecnica principal es la propia naturaleza del adaptador: permite anadir un concepto nuevo al modelo base sin modificar sus pesos originales, cargandolo con `pipe.load_lora_weights("Archemimi/eugie")`. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal ni procesos de RLHF/DPO, que en cualquier caso no aplican a un LoRA de difusion.

## Capacidades

- Generacion de imagenes text-to-image condicionada por el token `eugie`.
- Personalizacion de un concepto visual concreto (presumiblemente un objeto o sujeto) sobre el modelo base Krea 2.
- Compatibilidad con el pipeline `Krea2Pipeline` de diffusers.
- Funcionamiento sobre Krea-2-Turbo con 8 pasos de inferencia y `guidance_scale=0.0`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Prototipado de conceptos personalizados: un desarrollador puede cargar el LoRA sobre Krea-2-Turbo y generar variaciones del concepto `eugie` en distintos entornos (interior, exterior, fondo neutro) para evaluar la fidelidad del adaptador antes de entrenar uno propio.
- Generacion de imagenes de producto con un objeto concreto: usando prompts como "A photo of eugie on a wooden table indoors", se pueden producir renders consistentes del objeto en escenas controladas, util para catalogos o mockups.
- Pruebas de integracion con diffusers: sirve como ejemplo minimo de como cargar un LoRA de terceros sobre Krea 2 en un pipeline Python, util para validar la cadena de dependencias antes de integrar adaptadores en produccion.
- Experimentacion en investigacion: permite estudiar el comportamiento de LoRAs DreamBooth sobre modelos de difusion recientes con pocos pasos de inferencia, comparando la fidelidad del concepto entre Raw y Turbo.
- Generacion de material visual para demos: las tres muestras publicadas (mesa de madera, cesped, fondo neutro) sirven como referencia para construir galerias o documentacion de un adaptador.
- Base para fine-tuning posterior: el LoRA puede servir como punto de partida para entrenar variantes del concepto con mas datos o estilos, reutilizando la infraestructura de diffusers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Depende del modelo base Krea 2, no del LoRA, que anade una sobrecarga minima (repo de 0,8 GB).
- GPU recomendadas: no disponible. La model card no especifica requisitos de hardware.
- Compatibilidad con GPU de consumo: no confirmada; depende de si Krea 2 cabe en la VRAM de la GPU concreta.
- Opciones de despliegue: diffusers con `Krea2Pipeline` (documentado en la model card). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que en general no aplican a modelos de difusion de este tipo.
- Latencia y throughput: no disponibles. La model card indica 8 pasos de inferencia sobre Krea-2-Turbo, pero no publica tiempos.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Licencia | Contexto/parametros | Disponibilidad |
|---|---|---|---|---|---|
| Archemimi/eugie | LoRA DreamBooth | Krea-2-Raw | Apache 2.0 | no disponible | Hugging Face, 15 descargas |
| Otros LoRA para Krea 2 | LoRA DreamBooth | Krea 2 | variable | no disponible | no disponible en la informacion |
| Adaptadores LoRA para SDXL | LoRA DreamBooth | SDXL | variable | no disponible | ecosistema amplio |

No se dispone de datos de rendimiento ni de alternativas concretas documentadas en la informacion proporcionada para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Informacion muy escasa: no se publican parametros, contexto, idiomas, cuantizaciones ni benchmarks, lo que impide evaluar el modelo con rigor.
- Riesgo de sobreajuste al concepto: al ser un LoRA DreamBooth con pocas muestras visibles, puede reproducir el concepto de forma poco flexible o con artefactos en escenas no vistas.
- Dependencia del modelo base: el adaptador solo funciona con Krea 2 (Raw/Turbo); no es portable a otras arquitecturas.
- Sesgos conocidos: no documentados, pero heredados del dataset de entrenamiento del modelo base y del propio conjunto de imagenes del LoRA.
- Riesgo de alucinacion visual: como todo modelo generativo, puede producir imagenes incoherentes o no fieles al concepto, especialmente con prompts ambiguos.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la licencia del modelo base Krea 2, que puede imponer condiciones adicionales.
- Bajo numero de descargas (15) y ausencia de likes: indica poca validacion por parte de la comunidad; no recomendable como dependencia critica en produccion sin pruebas propias.
- No se especifica el formato exacto de los pesos ni si hay versiones cuantizadas.

## Enlaces

- Hugging Face: https://huggingface.co/Archemimi/eugie
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Variante Turbo (usada en las muestras): https://huggingface.co/krea/Krea-2-Turbo
- Libreria diffusers: https://github.com/huggingface/diffusers
