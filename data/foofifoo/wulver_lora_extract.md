# foofifoo/wulver_lora_extract

## Resumen

`foofifoo/wulver_lora_extract` es un adaptador LoRA para generacion de imagenes, no un modelo de lenguaje ni un modelo completo. Segun la model card, se trata de pesos LoRA extraidos de `Vaelico/Wulver` en su version raw (no turbo) y calculados contra `Krea 2 raw`. El autor lo publica como complemento para el ecosistema ComfyUI, con la indicacion explicita de que no incluye pesos Turbo y que debe combinarse con Krea 2 Turbo o con un LoRA Turbo para funcionar correctamente.

El problema que resuelve es de flujo de trabajo, no de capacidad nueva: permite aplicar el comportamiento o el estilo aprendido en Wulver sobre la base de Krea 2 sin necesidad de cargar el checkpoint completo de Wulver, aprovechando el mecanismo de LoRA para mantener el consumo de VRAM y la velocidad de inferencia bajo control. La relevancia es limitada y muy de nicho: el repositorio acumula 0 descargas y 0 likes, tiene 14,3 GB de tamano y esta sujeto a la licencia `krea-2-community-license`, mas restrictiva que una licencia de codigo abierto convencional.

No hay informacion publica sobre el numero de parametros, la arquitectura interna del modelo base ni el dataset o el procedimiento exacto de extraccion mas alla de la herramienta empleada. La ficha que sigue refleja unicamente los datos declarados por el autor y marca como no disponible todo lo que no se puede verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) para un modelo de difusion de imagen; arquitectura del modelo base no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de generacion de imagen, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | krea-2-community-license (license_name declarado en la model card) |
| Formato de pesos | no disponible (el autor no especifica formato; el repositorio ocupa 14,3 GB) |
| Tipo de artefacto | LoRA extraido, no incluye pesos Turbo |
| Modelo base | Vaelico/Wulver (raw, no turbo) |
| Modelo objetivo de aplicacion | Krea 2 (raw), con uso previsto junto a Krea 2 Turbo o un LoRA Turbo |
| Tamano del repositorio | 14,3 GB |
| Fecha de creacion | 2026-09-27 |
| Ultima actualizacion | 2026-09-27 |
| Descargas | 0 |
| Likes | 0 |
| Herramienta de extraccion | ComfyUI-ModelUtils |

## Arquitectura y entrenamiento

El autor describe el artefacto como "loras extracted from Vaelico/Wulver raw (non-turbo) against Krea 2 raw". La formulacion "extracted ... against" apunta a una tecnica de diferencia de pesos (weight diffing o task arithmetic) sobre las matrices de atencion o convolucion del modelo de difusion, y no a un entrenamiento supervisado con un dataset y una funcion de perdida. Esta interpretacion es coherente con el uso declarado de `ComfyUI-ModelUtils`, utilidad orientada a extraer, fusionar y manipular pesos de modelos en el ecosistema ComfyUI.

No hay informacion en la model card sobre el numero de tokens o imagenes de entrenamiento, la composicion del dataset, la resolucion de entrenamiento, el uso de RLHF, DPO o cualquier otra fase de alineamiento, ni sobre el rango (rank) del LoRA, su alpha o las capas objetivo. Tampoco se detalla si la extraccion se hizo en precision completa o reducida, dato relevante dado el tamano de 14,3 GB del repositorio, inusualmente grande para un LoRA convencional y compatible con un rango alto o con pesos en precision elevada.

La innovacion tecnica destacable, en la medida en que puede calificarse asi, es metodologica: el autor separa los pesos raw de los pesos Turbo para poder inyectar el efecto de Wulver sobre una base Krea 2 acelerada. Esta separacion evita el conflicto entre la destilacion de pocos pasos (Turbo) y los pesos de estilo extraidos, pero obliga al usuario a recomponer el pipeline anadiendo el LoRA Turbo por separado.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image), combinando la base Krea 2 con el LoRA extraido y un componente Turbo.
- Transferencia de estilo o comportamiento proveniente del checkpoint Vaelico/Wulver sobre la base Krea 2.
- Integracion en flujos ComfyUI, incluido el uso junto a LoRA Turbo para acelerar la inferencia.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas: es un adaptador de un modelo de difusion de imagen.
- No soporta tool calling, function calling ni agentes.
- No se declaran capacidades multilingues ni de comprension de texto mas alla del codificador de texto del modelo base, cuyo detalle no esta disponible.
- No se declaran capacidades de vision, audio, video ni modo de razonamiento explicito (thinking mode).
- No se documentan capacidades de edicion de imagen, inpainting, ControlNet ni upscaling asociadas a este LoRA en concreto.

## Casos de uso

- Produccion de ilustracion con estetica Wulver sobre Krea 2 Turbo: el LoRA se carga sobre la base acelerada para generar imagenes con el estilo extraido manteniendo el numero reducido de pasos de muestreo. Es el escenario que el propio autor indica como correcto.
- Prototipado rapido en ComfyUI: al ser un LoRA, se puede activar y desactivar sin recargar el modelo base, lo que permite comparar el resultado con y sin el adaptador en la misma sesion.
- Generacion por lotes de assets graficos: en pipelines que producen variaciones de un mismo motivo (iconos, fondos, ilustraciones de articulos), el LoRA mantiene una linea estetica coherente entre imagenes sin reentrenar nada.
- Investigacion sobre extraccion de pesos: sirve como caso practico para reproducir la tecnica de weight diffing con ComfyUI-ModelUtils y estudiar como se comporta un LoRA extraido frente a uno entrenado con dataset.
- Experimentacion con composicion de LoRA: permite probar el apilado de este adaptador con LoRA Turbo y con otros LoRA de estilo para medir interferencias y saturacion.
- Pruebas de licenciamiento y trazabilidad: util para equipos que necesitan evaluar si la `krea-2-community-license` es compatible con su producto antes de incorporar pesos derivados a un flujo comercial.
- Docencia y demostraciones sobre difusion: ejemplo sencillo de como un adaptador pequeno modifica el comportamiento de un modelo grande sin tocar el checkpoint base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No hay datos de VRAM, latencia ni throughput en la informacion proporcionada; cualquier cifra debe obtenerse midiendo el pipeline completo (base Krea 2 + LoRA Turbo + este LoRA).
- El requisito real de VRAM lo determina el modelo base Krea 2 en su conjunto, no este adaptador: el LoRA anade una carga adicional de memoria que depende de su rango y del numero de capas afectadas, datos no disponibles.
- El repositorio ocupa 14,3 GB, por lo que se necesita ese espacio en disco para descargarlo, ademas del espacio ocupado por Krea 2 y por el LoRA Turbo.
- Despliegue previsto: ComfyUI, que es el entorno mencionado por el autor y para el que existe la herramienta de extraccion empleada. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama (herramientas orientadas a modelos de lenguaje, no aplicables aqui).
- No se confirma compatibilidad con GPUs consumer concretas (RTX 4090, RTX 3090, etc.). Conviene consultar los requisitos oficiales de Krea 2 antes de asumir que cabe en una GPU de consumo.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| foofifoo/wulver_lora_extract | LoRA extraido | Vaelico/Wulver raw contra Krea 2 raw | No aplicable | No disponible | krea-2-community-license | HuggingFace, 0 descargas |
| Vaelico/Wulver | Checkpoint de generacion de imagen | no disponible | No aplicable | No disponible | no disponible | HuggingFace (referenciado como base) |
| Krea 2 | Modelo de generacion de imagen | no disponible | No aplicable | No disponible | krea-2-community-license en los pesos derivados | HuggingFace (Comfy-Org/Krea-2) |

No se dispone de datos de rendimiento ni de parametros de los tres modelos, por lo que la comparativa se limita a tipo de artefacto, base de la que derivan y licencia declarada.

## Limitaciones y advertencias

- No es un modelo autonomo: sin Krea 2 (o Krea 2 Turbo) y, segun el autor, sin un componente Turbo, el LoRA no produce resultados utiles.
- El autor advierte explicitamente de que no incluye pesos Turbo; usarlo con la base raw sin LoRA Turbo cambia el comportamiento respecto al previsto.
- Licencia `krea-2-community-license`, con enlace a https://krea.ai/krea-2-licensing. Es una licencia de comunidad, no una licencia open source permisiva: hay que revisar sus condiciones antes de cualquier uso comercial. La model card no resume las restricciones.
- El modelo base Vaelico/Wulver puede tener su propia licencia, no declarada en la informacion disponible; su cumplimiento es responsabilidad del usuario.
- Riesgo de sobreajuste o saturacion al apilar este LoRA con otros adaptadores o con el LoRA Turbo, especialmente en prompts alejados del dominio del checkpoint original.
- Estado de validacion nulo: 0 descargas y 0 likes, sin issues ni evaluaciones publicas. No hay evidencia de terceros sobre la calidad o la estabilidad del resultado.
- No hay informacion sobre sesgos, idiomas del codificador de texto ni comportamientos problematicos del modelo base.
- No se documentan formatos de pesos ni procedimiento de carga exacto en ComfyUI; se asume compatibilidad por la herramienta de extraccion, pero no esta confirmada en la model card.
- Las fechas declaradas en HuggingFace (creacion y actualizacion el 2026-09-27) son posteriores a la fecha de consulta habitual de este tipo de fichas; conviene verificarlas en la pagina del repositorio.
- La busqueda web realizada no ha devuelto ningun resultado relacionado con este modelo, con Vaelico/Wulver ni con Krea 2; los resultados obtenidos correspondian a foros sin relacion alguna con el objeto de la ficha y no se han utilizado como fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/foofifoo/wulver_lora_extract
- Modelo base Vaelico/Wulver: https://huggingface.co/Vaelico/Wulver
- Krea 2 raw en Comfy-Org: https://huggingface.co/Comfy-Org/Krea-2
- Herramienta de extraccion ComfyUI-ModelUtils: https://github.com/silveroxides/ComfyUI-ModelUtils
- Licencia krea-2-community-license: https://krea.ai/krea-2-licensing
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) en la busqueda web realizada.
