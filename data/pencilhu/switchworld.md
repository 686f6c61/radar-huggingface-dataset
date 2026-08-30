# PencilHu/SwitchWorld

## Resumen

SwitchWorld es un conjunto de adaptadores LoRA (rank 128) desarrollados por PencilHu que añaden cambio de perspectiva en tiempo real entre primera persona (FP) y tercera persona (TP) al modelo de mundo LingBot-World. El modelo base, robbyant/lingbot-world-base-cam, es un world model de generación de vídeo basado en Wan2.2, y SwitchWorld extiende sus capacidades permitiendo alternar el punto de vista durante la generación de una secuencia de vídeo sin interrumpir el flujo.

El repositorio contiene la secuencia completa de adaptadores "FullFlow v2" para las dos ramas de ruido (high-noise y low-noise), cada una entrenada en tres etapas ordenadas: experto FP, experto TP y módulo de transición. No es un modelo standalone, sino un complemento que requiere el checkpoint base de LingBot-World por separado. Su relevancia radica en aportar una capacidad novedosa de cambio de perspectiva dentro del propio modelo de mundo, algo poco común en los generadores de vídeo actuales.

La licencia es Apache-2.0, aunque el modelo base y los datasets upstream mantienen sus propias licencias. El tamaño del repositorio es de 39,2 GB, lo que sugiere que los adaptadores son completos (no cuantizados) y están en formato PyTorch (.pt). No se especifican parámetros totales ni longitud de contexto, ya que depende del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (rank 128) sobre LingBot-World (world model basado en Wan2.2) |
| Parametros totales | no disponible (depende del modelo base LingBot-World) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada de LingBot-World/Wan2.2) |
| Tipos de cuantizacion | no disponible (pesos en formato .pt, sin cuantizacion publicada) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 (el modelo base y datasets tienen sus propias licencias) |
| Formato de pesos | .pt (PyTorch) |

## Arquitectura y entrenamiento

SwitchWorld no define una arquitectura propia, sino que consiste en seis adaptadores LoRA de rango 128 que se integran en el modelo base LingBot-World. Cada rama de ruido (alta y baja) se entrena en tres etapas secuenciales: primero se actualiza el experto FP (primera persona), luego el experto TP (tercera persona) partiendo del checkpoint anterior, y finalmente el módulo de transición que permite el cambio de perspectiva en el flujo de generación. Durante la tercera etapa, los pesos compartidos, FP y TP permanecen congelados. El proceso de entrenamiento se describe como "digest checks passed" para el run local, lo que indica que se verificó la integridad de los componentes congelados.

El modelo base LingBot-World es un world model de generación de vídeo que, a su vez, se apoya en Wan2.2. No se proporcionan detalles sobre el dataset de entrenamiento ni el número de tokens o pasos de optimización. Tampoco se menciona el uso de RLHF o DPO; el entrenamiento parece ser puramente supervisado sobre datos de vídeo con cambios de perspectiva.

## Capacidades

- Cambio de perspectiva en el flujo de generación de vídeo: permite alternar entre primera persona (FP) y tercera persona (TP) durante la generación de una secuencia, sin reiniciar el proceso.
- Generación de vídeo a partir de imagen (image-to-video), heredando las capacidades del modelo base LingBot-World.
- Modelado de mundo (world model): el modelo base está diseñado para simular entornos y dinámicas visuales, y SwitchWorld añade control de punto de vista.
- Soporte de dos ramas de ruido (high-noise y low-noise) para diferentes niveles de detalle y estabilidad en la generación.
- Reproducibilidad: se incluyen los checkpoints intermedios de cada etapa de entrenamiento para permitir ablaciones y análisis de investigación.

No se documentan capacidades de tool calling, agentes, razonamiento multilingüe ni otras tareas de lenguaje, ya que el modelo es específico para vídeo.

## Casos de uso

- Creación de contenido interactivo: generar secuencias de vídeo donde la cámara cambia de primera a tercera persona, útil para demos de videojuegos o narrativas visuales. El usuario puede especificar el punto de vista deseado en cada tramo de la secuencia.
- Simulación de entornos para robótica: un world model con cambio de perspectiva permite entrenar agentes que necesitan percibir el entorno desde distintos ángulos, mejorando la generalización.
- Producción cinematográfica y animación: previsualización de escenas con alternancia de planos subjetivos y objetivos sin necesidad de múltiples tomas.
- Realidad virtual y aumentada: generación de vídeos 360 o con cambio de cámara para experiencias inmersivas, partiendo de una imagen fija.
- Investigación en world models: el repositorio incluye los checkpoints intermedios, lo que facilita estudiar cómo se comporta el modelo en cada etapa de entrenamiento y cómo afecta el cambio de perspectiva a la coherencia temporal.
- Evaluación de generadores de vídeo con control de cámara: usar SwitchWorld como referencia para comparar otras técnicas de control de perspectiva en modelos de mundo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explícitamente que la galería de resultados incluye salidas de investigación de múltiples etapas, incluyendo líneas base y casos fallidos, y no debe interpretarse como un benchmark curado de calidad. Además, se menciona que varias interfaces de métricas de evaluación en el código tienen backends mock marcados explícitamente, por lo que no se deben tratar valores simulados como afirmaciones del modelo.

## Requisitos de hardware

- No se especifican requisitos concretos de VRAM ni GPUs recomendadas en la documentación del modelo.
- Dado que el modelo base es LingBot-World, basado en Wan2.2, se heredan sus requisitos de hardware, que típicamente requieren GPUs de alta gama (al menos 24 GB de VRAM para inferencia a resolución moderada, aunque no se confirma).
- Los adaptadores son de rango 128 y el repositorio pesa 39,2 GB, por lo que se necesita espacio de almacenamiento suficiente y una GPU capaz de cargar el modelo base más los adaptadores.
- Para despliegue, se menciona que estos son "adaptadores/checkpoints para el código de investigación SwitchWorld", no un pipeline Diffusers standalone. Por tanto, el despliegue requerirá el código de GitHub y el modelo base por separado.
- No se proporcionan estimaciones de latencia o throughput.

## Comparativa con modelos similares

No se dispone de modelos comparables directos, ya que SwitchWorld es un adaptador específico para añadir cambio de perspectiva a LingBot-World, y no existe información pública sobre alternativas equivalentes. Se puede comparar con otros adaptadores LoRA para generación de vídeo, pero no hay datos suficientes para una tabla significativa. La comparación más relevante sería contra el propio LingBot-World sin los adaptadores, pero no se han publicado métricas cuantitativas.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SwitchWorld (adaptadores) | LoRA sobre LingBot-World | no disponible | no disponible | Apache-2.0 | Repositorio publico |
| LingBot-World (base) | World model | no disponible | no disponible | no disponible | HuggingFace |
| Wan2.2 | Generacion de video | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo standalone: requiere el checkpoint base LingBot-World y el código de investigación de SwitchWorld. No se puede usar como un pipeline Diffusers directamente.
- Hereda las limitaciones y requisitos de hardware de LingBot-World y Wan2.2, que no se detallan en esta documentación.
- La galería de resultados incluye salidas de investigación de múltiples etapas, incluyendo baselines y casos fallidos; no debe interpretarse como una demostración curada de calidad.
- Varias interfaces de métricas de evaluación en el código tienen backends mock marcados explícitamente; no tratar valores simulados como afirmaciones del modelo.
- La licencia Apache-2.0 se aplica a los adaptadores, pero el modelo base y los datasets upstream mantienen sus propias licencias y términos, que deben revisarse antes de cualquier uso comercial.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de contexto específicas del modelo, más allá de las heredadas del base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PencilHu/SwitchWorld
- Modelo base: https://huggingface.co/robbyant/lingbot-world-base-cam
- Codigo (GitHub): https://github.com/yizhiqianbi/SwitchWorld
- Galeria de resultados: https://yizhiqianbi.github.io/SwitchWorld-Gallery/archive/
