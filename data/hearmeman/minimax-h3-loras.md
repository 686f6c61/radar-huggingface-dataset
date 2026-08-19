# Hearmeman/minimax-h3-loras

## Resumen

Este repositorio contiene una colección de adaptadores LoRA para el modelo de generación de vídeo MiniMax-H3, desarrollados por el usuario Hearmeman (HearmemanAI). Los adaptadores están entrenados específicamente con material adulto explícito y están diseñados para mejorar la representación anatómica y de acciones en la generación de vídeo NSFW. El repositorio incluye seis adaptadores independientes que se pueden apilar entre sí: un adaptador de movimiento (HMNSFW), uno de acción (HMCumshot) y cuatro de anatomía (HMPussy, HMInnie, HMBreasts y HMPenis).

La relevancia de este proyecto radica en que el modelo base MiniMax-H3, un modelo nativo multimodal de generación de vídeo en 2K con audio estéreo 3D sincronizado, produce anatomía femenina "blanda y vaga" según el autor, y los adaptadores corrigen estas deficiencias. Los adaptadores son de concepto único y se apilan bajo otros LoRA de personajes o escenas. El repositorio funciona como un espejo de los pesos publicados en CivitAI, permitiendo descargarlos mediante URL `resolve` sin necesidad de cuenta.

El contenido es explícitamente NSFW y no apto para todos los públicos. La licencia es `minimax-h3-community-license`, derivada del modelo base MiniMax-H3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA/LoKr sobre MiniMax-H3 (variante fl2va bf16) |
| Parametros totales | no disponible (cada adaptador es un archivo safetensors de 296-597 MB) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base MiniMax-H3) |
| Tipos de cuantizacion | bf16 (entrenado y generado con el modelo bf16 completo) |
| Idiomas soportados | no disponible (prompts en ingles) |
| Licencia | minimax-h3-community-license |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los adaptadores son LoRA/LoKr entrenados sobre el modelo base MiniMax-H3 en su variante fl2va bf16. El autor indica que HMInnie se entrenó con AI-Toolkit sobre 117 imágenes a rango 32 sobre el modelo bf16 completo. Los adaptadores de anatomía (HMPussy, HMInnie, HMBreasts, HMPenis) se entrenaron principalmente con imágenes fijas, mientras que los de acción (HMNSFW, HMCumshot) se entrenaron con vídeo. HMPussy requiere dos archivos: uno entrenado con imágenes fijas (`vagassist_e40`) y otro con vídeo (`hmpussy_v6_epoch30`), que se apilan a intensidades distintas (1.0 y 0.35 respectivamente).

Los captions de entrenamiento son frases descriptivas largas (165-269 palabras, mediana de 225) en prosa anatómica, no etiquetas. Esto significa que el prompting óptimo requiere párrafos descriptivos fluidos en lugar de listas de keywords. El adaptador HMNSFW se generó con el modelo bf16 completo, muestreador `dpmpp_2m` con scheduler Beta y 20 pasos. HMCumshot admite modos Turbo LoRA de 8 pasos (0.20, Euler, `ddim_uniform`) para T2V/I2V y 4 pasos (0.85, Euler, `beta`) para R2V.

## Capacidades

- Mejora de la representación anatómica femenina y masculina en generación de vídeo (genitales, pechos, forma del cuerpo).
- Control de acciones y movimiento: el adaptador HMNSFW cubre posiciones como misionero, perrito, cowgirl, masturbación manual, sexo oral e inserciones.
- Control de atributos anatómicos mediante ejes descriptivos en inglés: tamaño de pecho, forma, tamaño y color de areolas, estado de pezones, forma del monte de Venus, apertura de la hendidura, labios internos y color de labios.
- Apilado de adaptadores: los adaptadores de anatomía se pueden combinar con los de acción y con otros LoRA de personajes o escenas.
- Compatibilidad con generación texto-a-vídeo (T2V), imagen-a-vídeo (I2V) y referencia-a-vídeo (R2V, indicado para HMCumshot).
- Integración con ComfyUI: el autor menciona el nodo `ExtendIntermediateSteps` para refinar la generación.

## Casos de uso

- Generación de contenido adulto personalizado: el adaptador HMNSFW permite generar escenas de sexo explícito en vídeo con control de posiciones y acciones mediante prompts descriptivos largos en prosa.
- Control anatómico fino en vídeo: los adaptadores de anatomía (HMPussy, HMPenis, HMBreasts, HMInnie) corrigen las deficiencias del modelo base en la representación de genitales y pechos, permitiendo especificar atributos como tamaño, forma y color mediante ejes descriptivos.
- Refinamiento de generación imagen-a-vídeo: los adaptadores funcionan bien en I2V para la mayoría de posiciones, lo que permite partir de una imagen fija y animarla con movimiento controlado.
- Creación de contenido con estilo consistente: al apilar los adaptadores bajo LoRA de personajes o escenas existentes, se puede mantener un estilo visual coherente mientras se añade control anatómico y de acción.
- Investigación en fine-tuning de modelos de vídeo: el repositorio documenta el proceso de entrenamiento (AI-Toolkit, rango 32, captions largos, LoKr) que puede servir de referencia para otros proyectos de adaptación de MiniMax-H3.
- Evaluación de límites del modelo base: los adaptadores revelan las deficiencias de MiniMax-H3 en la representación de anatomía humana y demuestran que se pueden corregir con LoRA específicos, lo que resulta útil para quienes investigan las capacidades del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas cuantitativas de rendimiento ni comparaciones con otros adaptadores. El autor menciona cualitativamente que HMNSFW produce "ocasionalmente genitales deformados" en I2V y que T2V es "impredecible" (hit or miss), lo que motivó la creación de los adaptadores de anatomía.

## Requisitos de hardware

- Los adaptadores LoRA son ligeros: cada archivo safetensors pesa entre 296 MB y 597 MB, por lo que el almacenamiento adicional es mínimo.
- La VRAM requerida depende del modelo base MiniMax-H3, que es un modelo de generación de vídeo 2K con audio sincronizado; se recomienda consultar los requisitos del modelo base.
- El autor indica que la generación se realiza con el modelo bf16 completo, lo que sugiere que se necesita una GPU con VRAM suficiente para el modelo base en bf16 (probablemente 24 GB o más, dependiendo de la configuración).
- Compatible con ComfyUI, lo que permite su uso en entornos con flujos de trabajo gráficos.
- No se dispone de datos de latencia ni throughput para los adaptadores.

## Comparativa con modelos similares

| Modelo | Tipo | Contenido | Tamano | Licencia |
|---|---|---|---|---|
| Hearmeman/minimax-h3-loras | LoRA para MiniMax-H3 | NSFW explícito | 2.8 GB (repo) | minimax-h3-community-license |
| fal/MiniMax-H3-Realism-People-LoRA | LoRA para MiniMax-H3 | Realismo de personas | no disponible | no disponible |
| iamgroot1212/minimax-h3-loras | LoRA para MiniMax-H3 | no disponible | no disponible | no disponible |

No se dispone de información suficiente sobre los repositorios comparables para realizar una comparativa detallada de rendimiento o especificaciones.

## Limitaciones y advertencias

- Contenido NSFW explícito: este repositorio contiene adaptadores entrenados con material adulto explícito y no es apto para todos los públicos. No debe descargarse si no se busca este tipo de contenido.
- Licencia restrictiva: la licencia `minimax-h3-community-license` del modelo base puede imponer restricciones de uso comercial o de distribución. Es necesario revisar los términos de la licencia antes de cualquier uso en producción.
- Calidad variable: el autor advierte que T2V es "impredecible" (hit or miss) para HMNSFW y que se producen "ocasionalmente genitales deformados" en I2V.
- Anatomía imperfecta: el adaptador HMPussy V0.5 mejoró los anos pero "todavía no están del todo bien".
- Dependencia del prompting: los captions de entrenamiento son frases largas en prosa (165-269 palabras), por lo que las listas de keywords producen resultados fuera de distribución. Se requiere un estilo de prompting específico.
- Ortografía sensible: el adaptador HMBreasts aprendió el término "areoles" y el autor indica que la ortografía importa para obtener resultados correctos.
- Sin métricas de rendimiento: no hay benchmarks publicados que permitan evaluar objetivamente la calidad de los adaptadores.
- Restricciones de edad: el contenido es exclusivamente para adultos y puede violar las políticas de algunas plataformas de distribución de modelos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Hearmeman/minimax-h3-loras
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Colección MiniMax-H3: https://huggingface.co/collections/MiniMaxAI/minimax-h3
- Guía oficial MiniMax H3: https://design.minimax.io/h3
- Hub comunitario MiniMax H3 (GitHub): https://github.com/ai-models-lab/minimax-h3
- Repositorio comparable (fal): https://huggingface.co/fal/MiniMax-H3-Realism-People-LoRA
- Repositorio comparable (iamgroot1212): https://huggingface.co/iamgroot1212/minimax-h3-loras
- Perfil CivitAI del autor: https://civitai.com/user/HearmemanAI
