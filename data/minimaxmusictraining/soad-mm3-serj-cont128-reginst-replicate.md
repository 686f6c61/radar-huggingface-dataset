# MiniMaxMusicTraining/soad-mm3-serj-cont128-reginst-replicate

## Resumen

Este modelo es un adaptador LoRA (Low-Rank Adaptation) derivado de MiniMax-Music3, el modelo de generacion musical de MiniMax. El nombre "soad-mm3-serj-cont128-reginst-replicate" indica que ha sido entrenado sobre voces en el estilo de System of a Down (Serj Tankian), con modo de continuacion de 128 frames y regularizacion instrumental. Se trata de un ajuste fino de bajo rango que modifica exclusivamente el componente `language_model` (planificador global LM/RVQ) del modelo base, dejando intacto el codificador de texto.

El modelo base MiniMax-Music3 combina un LLM global de 8.000 millones de parametros para la estructura musical de largo alcance con un LLM local de 600 millones para el detalle a nivel de frame, permitiendo generar canciones completas de hasta cinco minutos. Este adaptador, entrenado con 54 archivos de audio de voces y 54 instrumentales de regularizacion, condiciona la generacion hacia un estilo vocal concreto. La licencia Apache 2.0 permite uso comercial, aunque el tag "not-for-all-audiences" advierte de contenido potencialmente sensible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 64) sobre MiniMax-Music3 (LLM global 8B + LLM local 0.6B) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene ~8.6B) |
| Parametros activos | no aplica (adaptador LoRA) |
| Longitud de contexto | 128 frames de audio (LM max frames) |
| Tipos de cuantizacion | BF16 (entrenado en precision BF16 pura) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (diffusers LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el componente `language_model` de MiniMax-Music3, que actua como planificador global de tokens RVQ (Residual Vector Quantization). El entrenamiento se realizo con 46 epocas y 5000 pasos, con tasa de aprendizaje de 2e-05 y programacion constante con warmup de 50 pasos. Se utilizo el optimizador AdamW en BF16, con gradiente acumulado de 1 paso, checkpointing de gradientes activado y tipo de prediccion `autoregressive_next_token`.

El modo de entrenamiento fue `continuation` con un maximo de 128 frames, lo que significa que el modelo aprende a continuar musica existente en lugar de generar desde cero. Se habilitaron dos tecnicas adicionales: NextLat (peso 0.1, loss `smooth_l1`, KL weight 0.0) para la prediccion de latentes, y XM (2 candidatos, seleccion por bloque de 16) para el enrutamiento de tokens. El LoRA tiene rank 64, dropout 0.1 y alpha no especificado. El codificador de texto no fue entrenado, por lo que se reutiliza el del modelo base.

Los datos de entrenamiento consisten en dos conjuntos: 54 archivos de audio de voces (estilo SOAD/Serj) y 54 archivos de audio instrumentales utilizados como regularizacion. La validacion se desactivo durante el entrenamiento.

## Capacidades

- Generacion de musica con voces en el estilo de System of a Down (Serj Tankian)
- Continuacion de pistas de audio existentes (modo continuation con ventana de 128 frames)
- Generacion condicionada por prompt de texto (text-to-audio) mediante el pipeline de diffusers
- Soporte de negative prompts para refinar la salida
- Generacion de canciones completas de hasta cinco minutos (heredado del modelo base)
- Integracion con cuantizacion opcional via optimum-quanto para reducir VRAM

## Casos de uso

- Produccion musical con estilo vocal especifico: el adaptador permite generar voces con la estetica vocal de Serj Tankian, util para productores que buscan inspiracion o demos en ese estilo sin necesidad de un vocalista.
- Continuacion de pistas instrumentales: al estar entrenado en modo continuation, puede extender pistas existentes anadiendo voces en el estilo aprendido, lo que resulta util en flujos de trabajo de composicion.
- Creacion de demos para bandas tributo: permite generar maquetas vocales para proyectos inspirados en System of a Down, acelerando el proceso de preproduccion.
- Investigacion en adaptacion LoRA para audio: sirve como caso de estudio de como un adaptador de bajo rango puede modificar el estilo vocal de un modelo de generacion musical de gran tamano.
- Generacion de contenido para videojuegos o multimedia: creacion de pistas vocales con un estilo rock/metal distintivo para bandas sonoras o contenido audiovisual.
- Experimentacion artistica: combinacion del adaptador con diferentes prompts y negative prompts para explorar variaciones creativas sobre el estilo vocal aprendido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en si es ligero, pero requiere cargar el modelo base MiniMax-Music3 completo (8.6B parametros en BF16, aproximadamente 17-19 GB de VRAM solo para los pesos).
- Se recomienda una GPU con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A100 40GB) para inferencia comoda.
- El modelo base puede cuantizarse a int8 con optimum-quanto para reducir requisitos de VRAM, como se indica en el codigo de inferencia de la model card.
- El despliegue se realiza mediante el pipeline de diffusers (`DiffusionPipeline`) con carga de pesos LoRA.
- No se dispone de datos de latencia o throughput especificos para este adaptador.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| MiniMax-Music3 (base) | Generacion musical completa | 8.6B | 5 min de audio | Apache 2.0 | Modelo base sin ajuste de estilo vocal |
| Este adaptador LoRA | Adaptador de estilo vocal | LoRA rank 64 | 128 frames | Apache 2.0 | Ajustado a estilo SOAD/Serj |
| MusicGen (Meta) | Generacion musical | 1.5B-3.3B | 30 s | MIT (codigo) | No soporta voces con la misma calidad ni contexto largo |
| Stable Audio | Generacion musical | no disponible | 3 min | Proprietary | Requiere API comercial; no permite ajuste fino abierto |

Nota: la comparativa se basa en caracteristicas generales conocidas; no se dispone de benchmarks comparativos directos entre estos modelos.

## Limitaciones y advertencias

- El adaptador ha sido entrenado con un conjunto de datos muy reducido (54 archivos de audio), lo que puede limitar la generalizacion y provocar sobreajuste al estilo concreto de los datos de entrenamiento.
- El tag "not-for-all-audiences" indica que el contenido generado puede no ser apto para todos los publicos.
- El entrenamiento con voces de un artista concreto (Serj Tankian) puede plantear problemas de derechos de autor o de imagen si se utiliza comercialmente para imitar a un artista real.
- El codigo de inferencia proporcionado en la model card guarda la salida como PNG, lo que sugiere un error de plantilla (probablemente copiado de un modelo de imagenes); la salida real deberia ser audio.
- No se especifican los idiomas soportados para los prompts de texto.
- La validacion se desactivo durante el entrenamiento, por lo que no hay metricas de validacion disponibles.
- El adaptador depende completamente del modelo base MiniMax-Music3; sin el, no puede funcionar de forma autonoma.
- El tamano del repositorio (10.8 GB) es inusualmente grande para un adaptador LoRA, lo que sugiere que puede contener pesos adicionales o multiples checkpoints; no se ha podido verificar su contenido exacto.

## Enlaces

- [HuggingFace del adaptador](https://huggingface.co/MiniMaxMusicTraining/soad-mm3-serj-cont128-reginst-replicate)
- [Modelo base MiniMax-Music3 en HuggingFace](https://huggingface.co/MiniMaxAI/MiniMax-Music3)
- [Repositorio GitHub de MiniMax-Music3](https://github.com/MiniMax-AI/MiniMax-Music3)
- [Pagina oficial de MiniMax](https://www.minimax.io/)
- [Guia de MiniMax Music 3.0](https://minimaxmusic3.ai/)
