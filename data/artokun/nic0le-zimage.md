# artokun/nic0le-zimage

## Resumen

`nic0le` es un LoRA (Low-Rank Adaptation) de personaje para el modelo de generacion de imagenes Z-Image Turbo de Tongyi-MAI (Alibaba). Desarrollado por el usuario artokun, este adaptador esta disenado para generar y mantener la identidad visual de un personaje concreto (desencadenado por la palabra `nic0le`) en las imagenes producidas por el modelo base. Se trata de un componente especializado que anade una capacidad especifica de reconocimiento de identidad al modelo base, sin necesidad de reentrenar el modelo completo.

El modelo se distribuye como un archivo `.safetensors` de aproximadamente 0.9 GB y esta pensado para usarse con la libreria `diffusers` o con interfaces como ComfyUI. Su relevancia radica en que permite a desarrolladores y creadores de contenido generar imagenes de un personaje consistente de forma eficiente, aprovechando las capacidades de Z-Image Turbo, un modelo de generacion de imagenes rapido y de codigo abierto. El repositorio incluye varios checkpoints del LoRA a diferentes pasos de entrenamiento, lo que permite a los usuarios elegir el grado de ajuste que prefieren.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Z-Image Turbo (arquitectura `zimage:turbo`) |
| Parametros totales | no disponible (LoRA de dimension 32) |
| Parametros activos | no disponible (LoRA, no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de generacion de imagenes) |
| Tipos de cuantizacion | qfloat8 (usado durante el entrenamiento); el checkpoint se distribuye en bf16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un LoRA, una tecnica de ajuste fino eficiente que anade matrices de bajo rango a las capas del modelo base. En este caso, el LoRA se entrena sobre el modelo base `Tongyi-MAI/Z-Image-Turbo`, una arquitectura de tipo `zimage:turbo` que es una version destilada de Z-Image de Alibaba, disenada para generar imagenes en pocos pasos de inferencia. El LoRA se entrena con la herramienta `ai-toolkit` de ostris, con una red de rango 32 y alpha 32, sobre un dataset de 19 imagenes de 1024 px, con el token `nic0le` como token principal en las descripciones. El entrenamiento se realizo con optimizador AdamW8bit, una tasa de aprendizaje constante de 1e-4, y un scheduler de timesteps lineales de tipo `flowmatch`, durante 3000 pasos. El modelo base se cuantifico a qfloat8 durante el entrenamiento para reducir el uso de memoria.

## Capacidades

- Generacion de imagenes de un personaje concreto (`nic0le`) a partir de texto en ingles.
- Soporte de texto a imagen con el modelo base Z-Image Turbo, que genera en aproximadamente 6 pasos de inferencia.
- Funciona como un LoRA de refiner o de detalle: puede usarse para mantener la identidad del personaje en pasadas de refinamiento o en pipelines de detalle automatico (por ejemplo, con el nodo `DetailerForEach` de Impact-Pack en ComfyUI).
- Compatible con el ecosistema de ComfyUI, con instrucciones especificas para cargar el modelo base, el CLIP y el VAE.
- No soporta tool calling, agentes ni capacidades multimodales mas alla de la generacion de imagenes.

## Casos de uso

- **Generacion de retratos de un personaje recurrente**: el caso de uso principal. Un creador puede generar multiples imagenes del personaje `nic0le` en distintos escenarios, poses o estilos, manteniendo la consistencia facial y corporal, gracias al token de activacion.
- **Refinamiento de imagenes en pipelines de produccion**: el LoRA puede usarse como modelo de segunda pasada en un flujo de refinamiento para corregir o mejorar la fidelidad del rostro del personaje en imagenes generadas por otros modelos. Esto es util en produccion cuando se generan variantes de una misma escena y se necesita mantener la identidad del personaje en todas ellas.
- **Detallado de rostros en composiciones complejas**: en un flujo de ComfyUI con Impact-Pack, se puede usar este LoRA en el paso de `DetailerForEach` para re-renderizar los rostros de los personajes en una imagen compuesta, evitando que el modelo de detallado (que no conoce al personaje) degrade la similitud.
- **Prototipado rapido de personajes para animacion o video**: al ser un LoRA de un modelo destilado y rapido, se puede generar una gran cantidad de variantes de un personaje en poco tiempo, lo que es util para explorar disenos en preproduccion.
- **Consistencia de personaje en series de imagenes**: para creadores de contenidos que necesitan mantener un personaje consistente en una serie de ilustraciones, el LoRA permite generar todas las imagenes con la misma identidad, evitando la deriva de aspecto entre generaciones.
- **Integracion en herramientas de diseno asistido por IA**: se puede usar dentro de entornos como ComfyUI para construir flujos de trabajo que generen disenos de personajes para juegos, comics o ilustraciones, donde la consistencia es un requisito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas como FID, CLIP score u otras comparativas con modelos similares.

## Requisitos de hardware

- **VRAM estimada**: no disponible. Como LoRA sobre un modelo de difusion de ~8B de parametros, se recomienda al menos 12-16 GB de VRAM para inferencia con el modelo base en bf16. La cuantizacion del modelo base (qfloat8) usada en el entrenamiento puede reducir los requisitos.
- **GPU recomendadas**: tarjetas con al menos 16 GB de VRAM, como NVIDIA RTX 4080/4090, A100, H100 o similares. En tarjetas con menos VRAM, se puede usar cuantizacion adicional o el despliegue en servicios de inferencia en la nube.
- **Consumer GPU**: posiblemente en una RTX 4090 (24 GB) o similar, pero con limitaciones de memoria para el modelo base completo. Para uso en ComfyUI, se recomienda tener suficiente VRAM para cargar el modelo base y el LoRA.
- **Opciones de despliegue**: ComfyUI, difusores de HuggingFace, y otros entornos que soporten LoRA en modelos de difusion. No se menciona compatibilidad con vLLM, TGI o llama.cpp, ya que es un modelo de imagenes, no de texto.
- **Latencia y rendimiento**: no disponible. Z-Image Turbo esta disenado para pocos pasos (~6), lo que sugiere una inferencia relativamente rapida, pero no se proporcionan datos concretos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| `artokun/nic0le-zimage` (este) | LoRA para Z-Image Turbo | ~8B (base) | no disponible | no disponible | no disponible |
| `artokun/nic0le-krea2` | LoRA para Krea 2 Raw | no disponible | no disponible | no disponible | no disponible |
| Z-Image Turbo (base) | Modelo de difusion destilado | ~8B | no disponible | generacion en ~6 pasos | no disponible |

Este LoRA es una adaptacion especifica para el modelo Z-Image Turbo. Su unico modelo comparable directo es el LoRA del mismo personaje entrenado sobre Krea 2 Raw (`nic0le-krea2`), que no es intercambiable con este porque apunta a un modelo base diferente. No hay otros LoRA de personaje publicos comparables en la informacion disponible.

## Limitaciones y advertencias

- **Dataset limitado**: el LoRA se entreno con solo 19 imagenes, lo que puede limitar la generalizacion del personaje a poses, estilos o escenarios muy variados. El riesgo de sobreajuste al conjunto de entrenamiento es alto.
- **Sesgo del personaje**: el modelo solo conoce un personaje concreto (`nic0le`). No es util para generar otros personajes o estilos generales.
- **Riesgo de alucinacion visual**: como cualquier modelo de generacion de imagenes, puede producir artefactos, rostros deformes o detalles inconsistentes, especialmente en configuraciones no vistas en el entrenamiento.
- **Restricciones de licencia**: la licencia del modelo no esta disponible, por lo que no se puede confirmar si el uso comercial esta permitido. Se recomienda consultar la licencia del modelo base `Z-Image-Turbo` y la politica de uso de HuggingFace.
- **Advertencia de VRAM**: cargar el LoRA junto con otro modelo grande (como Krea 2 o Flux) en el mismo grafo de ComfyUI puede causar corrupcion de pesos y salidas NaN. Se recomienda liberar VRAM entre cargas de modelos.
- **Dependencia del modelo base**: este LoRA no es util sin el modelo base `Tongyi-MAI/Z-Image-Turbo`, que debe cargarse por separado.

## Enlaces

- [Modelo en HuggingFace: artokun/nic0le-zimage](https://huggingface.co/artokun/nic0le-zimage)
- [Modelo base: Tongyi-MAI/Z-Image-Turbo](https://huggingface.co/Tongyi-MAI/Z-Image-Turbo)
- [LoRA companion: artokun/nic0le-krea2](https://huggingface.co/artokun/nic0le-krea2)
- [Herramienta de entrenamiento: ostris/ai-toolkit](https://github.com/ostris/ai-toolkit)
- [ComfyUI MCP de artokun (relacionado)](https://github.com/artokun/comfyui-mcp)
