# moe-kill/H3-Turbo-Neat

## Resumen

H3-Turbo-Neat es una familia de adaptadores LoRA de pocos pasos para MiniMax-H3, el modelo de generación de vídeo e imagen de MiniMax. No es un modelo autónomo: es un adaptador que se carga sobre los pesos base de MiniMax-H3 y que acelera la generación reduciendo el número de pasos de muestreo necesarios (de 20 pasos del modelo original a 4 o 7 pasos según la rama). Lo publica el usuario `moe-kill` bajo la licencia comunitaria de MiniMax-H3.

El proyecto se organiza en dos ramas. **Neat Classic** es una versión ligera orientada a la expresividad de personajes, el lenguaje de cámara y escenas de diálogo, pensada para generación rápida a 4 pasos. **Neat Prime** es una reorganización de Neat combinada con DMAD, reajustada para el muestreo DMAD re-noise a 7 pasos, con mejoras en color, dinámica de movimiento, audio y estabilidad frente al prompt. Prime incluye además un modo imagen para generar fotogramas fijos de alta calidad y referencias de personaje que luego se realimentan al propio H3.

Su relevancia práctica está en el coste computacional: reducir un modelo de vídeo de 20 pasos a 4-7 pasos abarata drásticamente la inferencia y hace viable la iteración rápida en flujos de producción audiovisual, manteniendo, según el autor, una calidad visual comparable en determinados escenarios. El repositorio ocupa 3,7 GB y acumula 4.737 descargas en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre MiniMax-H3; la arquitectura del modelo base no se detalla en la información disponible |
| Parámetros totales | no disponible (adaptador LoRA; el tamaño del repo es de 3,7 GB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (`H3Turbo_4Step_Neat_v1.safetensors`, `H3_Neat_Prime_v0.1.safetensors`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un transformer completo. Se aplica sobre `MiniMaxAI/MiniMax-H3` (relación `adapter` en los metadatos) y modifica el comportamiento de muestreo del modelo base para permitir generación en muy pocos pasos. La rama Classic se distribuye como `H3Turbo_4Step_Neat_v1.safetensors` y está calibrada para 4 pasos con su propio flujo de trabajo. La rama Prime (`H3_Neat_Prime_v0.1.safetensors`) es una reorganización de Neat combinada con DMAD, reentrenada alrededor del muestreo DMAD re-noise y calibrada para 7 pasos, con un modo imagen a 10 pasos (3 pasos en modo previsualización).

La model card no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO. Sí describe objetivos de entrenamiento cualitativos: calidad de imagen, movimiento, interpretación de personajes, estabilidad de prompt, audio y usabilidad en producción real. Los parámetros de muestreo recomendados para Prime son Video Shift 12 y Audio Shift 2, con sampler DMAD re-noise y prompts en formato "seis secciones" de H3 Skill para reducir subtítulos no deseados e inestabilidad de respuesta al prompt.

## Capacidades

- Generación de vídeo con audio sincronizado a partir de prompts de texto, en 4 pasos (Classic) o 7 pasos (Prime).
- Generación de imagen fija de alta calidad mediante Prime Image Mode, con ráfagas de 5 fotogramas y resolución recomendada de 2560 × 1440 (16:9, 3,5 MP).
- Generación de hojas de personaje y vistas de tres cuartos (frontal, lateral, trasera) para preproducción.
- Referencia de imagen a vídeo: las imágenes generadas por el propio H3 se realimentan al modelo para producir vídeo, manteniendo coherencia de estilo, color y modelado de personaje.
- Mejora de audio en Prime: menor artefacto electrónico, mayor rango dinámico, transitorios más marcados y campo estéreo más amplio respecto a Classic.
- Mejora de dinámica de movimiento en Prime: preservación de claridad en acciones rápidas, integridad de extremidades y sensación de impacto en escenas de lucha.
- Estabilidad de prompt mediante el formato de seis secciones de H3 Skill, que según el autor reduce la aparición de subtítulos no deseados.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje).
- Capacidades multilingües: prompts en inglés y chino.

## Casos de uso

- **Preproducción audiovisual rápida:** generar borradores de escena a 4 pasos con Classic para validar encuadre, ritmo y bloqueo de personajes antes de comprometer renderizados más costosos a 7 pasos con Prime.
- **Series cortas y escenas de diálogo:** Classic está orientado a interpretación de personajes, interacción y escenas emocionales, lo que lo hace adecuado para prototipar cortometrajes o contenido episódico donde prima la expresividad sobre la fidelidad extrema al prompt.
- **Diseño de personajes y hojas de modelo:** Prime Image Mode a 10 pasos genera vistas frontales, laterales y traseras del mismo personaje, útiles para fijar vestuario, peinado y proporciones antes de animar.
- **Lookdev y dirección de arte:** ráfagas de 5 imágenes a 3 pasos permiten explorar paletas, iluminación y materiales con coste bajo, seleccionando candidatas y refinando con ImageFusion.
- **Pipeline autorreferencial de imagen a vídeo:** generar la referencia con H3, fusionarla con el nodo ImageFusion y realimentarla al mismo modelo evita el desajuste de estilo que aparece al usar generadores de imagen externos.
- **Escenas de acción y combate:** Prime a 7 pasos mantiene claridad en movimiento rápido e integridad corporal, adecuado para planos de impacto, colisiones y coreografías donde los LoRA de pocos pasos suelen romper la anatomía.
- **Doblaje y diseño sonoro preliminar:** el audio mejorado de Prime (transitorios, estéreo, profundidad espacial) sirve para maquetas sonoras en fase de montaje, aunque no sustituye a una mezcla profesional.
- **Iteración de prompts a gran escala:** la reducción de 20 a 7 pasos multiplica el número de variantes evaluables por unidad de tiempo de GPU, útil para búsqueda sistemática de prompts y comparativas A/B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona pruebas ciegas internas de 30 vídeos y afirma que Prime a 7 pasos puede igualar o superar al H3 original a 20 pasos en algunos escenarios visuales, sin cifras objetivas ni métricas estandarizadas (FVD, CLIP score, VBench u otras).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Al ser un adaptador sobre MiniMax-H3, los requisitos vienen determinados por el modelo base, cuyas especificaciones no se detallan en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el flujo documentado es ComfyUI con el sampler DMAD re-noise y los flujos de trabajo específicos de cada rama (`H3_Neat_Prime_Image_3Step_5F_Renoise.json` para imagen). También se distribuye un nodo personalizado, ComfyUI-H3-Neat-ImageFusion, para fusión multifotograma. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible (no aplica a un modelo de difusión de vídeo).
- Latencia y throughput: no disponible. Cualitativamente, la reducción de 20 a 4-7 pasos implica un ahorro aproximado de 3 a 5 veces en pasos de muestreo, aunque el coste real depende del modelo base y del hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos recomendados | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| H3-Turbo-Neat (Classic) | LoRA sobre MiniMax-H3 | 4 | no disponible | minimax-h3-community-license-agreement | Hugging Face |
| H3-Turbo-Neat (Prime) | LoRA sobre MiniMax-H3 (Neat × DMAD) | 7 | 2560 × 1440 en modo imagen | minimax-h3-community-license-agreement | Hugging Face |
| MiniMax-H3 (base) | Modelo de generación de vídeo e imagen | 20 | no disponible | minimax-h3-community-license-agreement | Hugging Face (MiniMaxAI) |
| DMAD | Componente de muestreo integrado en Prime | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros LoRA de aceleración comparables ni de sus métricas, por lo que la comparación cuantitativa de rendimiento entre alternativas no está disponible.

## Limitaciones y advertencias

- **Compatibilidad estricta de flujos:** Classic y Prime usan workflows y samplers distintos; mezclar sus nodos o ajustes recomendados produce resultados degradados según el propio autor.
- **Licencia restrictiva:** la licencia comunitaria de MiniMax-H3 condiciona el uso comercial; es imprescindible revisar el archivo LICENSE del repositorio antes de integrarlo en producción.
- **Subtítulos no deseados:** los LoRA de aceleración de H3 tienden a generar texto o subtítulos no solicitados; se mitiga con el formato de prompt de seis secciones, pero no se elimina por completo.
- **Fidelidad al prompt:** el autor reconoce que para prompts extremos o planos de alto riesgo, el H3 original a 20 pasos sigue siendo la referencia y Prime no lo supera de forma universal.
- **Audio de Classic:** presenta artefactos electrónicos en algunas escenas, lo que lo desaconseja para entregables finales con sonido.
- **Riesgo de alucinación visual:** como modelo generativo, puede producir anatomía inconsistente, artefactos en movimiento rápido o elementos no solicitados, especialmente en configuraciones de pocos pasos.
- **Idiomas:** solo se documentan inglés y chino; el rendimiento con prompts en castellano no está verificado.
- **Dependencia del modelo base:** hereda todos los sesgos, limitaciones y restricciones de MiniMax-H3, cuyas especificaciones técnicas y de entrenamiento no se detallan en esta información.
- **Madurez:** Prime está en versión v0.1 y el repositorio se actualizó por última vez en octubre de 2026; la API de nodos y flujos puede cambiar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moe-kill/H3-Turbo-Neat
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/moe-kill/H3-Turbo-Neat/blob/main/LICENSE
- Documentación Classic: https://huggingface.co/moe-kill/H3-Turbo-Neat/blob/main/NEAT_CLASSIC.md
- Documentación Prime: https://huggingface.co/moe-kill/H3-Turbo-Neat/blob/main/NEAT_PRIME.md
- Nodo ComfyUI ImageFusion: https://github.com/bt420000-collab/ComfyUI-H3-Neat-ImageFusion
- Prueba ciega de 30 vídeos (Bilibili): https://www.bilibili.com/video/BV1XFpt6xEXy/
