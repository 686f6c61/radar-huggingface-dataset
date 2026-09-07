# niobures/MOSS-TTS-v1.5

## Resumen

MOSS-TTS-v1.5 es un modelo de texto a voz (TTS) de código abierto, publicado en HuggingFace bajo el usuario niobures y desarrollado por el equipo OpenMOSS como continuación de MOSS-TTS 1.0. Resuelve el problema de generar voz natural y expresiva en múltiples idiomas, manteniendo un alto control sobre prosodia, duración y pronunciación. El checkpoint identificado como `MossTTSDelay-8B` tiene 8.489.841.664 parámetros (8.49B) y se distribuye en formato safetensors. La longitud de contexto y los detalles de arquitectura no se han publicado en la información disponible.

La relevancia de v1.5 radica en que amplía el soporte de idiomas de 20 a 31, e introduce mejoras concretas en estabilidad de clonación de voz, seguimiento de puntuación para pausas naturales y control explícito de pausas mediante marcadores como `[pause 3.2s]`. Es una opción sólida para proyectos que necesitan síntesis multilingüe con clonación de voz zero-shot y control fino de la generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible |
| Parametros totales | 8.489.841.664 (8.49B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | 31 idiomas: chino, cantonés, inglés, árabe, checo, danés, neerlandés, finés, francés, alemán, griego, hebreo, hindi, húngaro, italiano, japonés, coreano, macedonio, malayo, persa, polaco, portugués, rumano, ruso, español, suajili, sueco, tagalo, tailandés, turco y vietnamita |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se han publicado especificaciones técnicas detalladas sobre la arquitectura en la documentación disponible. El identificador `MossTTSDelay-8B` sugiere un modelo de lenguaje autoregresivo para TTS con decodificación retardada (delay), pero no hay confirmación oficial ni descripción de los componentes internos. Tampoco se ofrecen datos sobre el número de tokens de entrenamiento, la composición del dataset ni procesos de alineación como RLHF o DPO.

Lo que sí se conoce es que v1.5 parte de MOSS-TTS 1.0 y se ha sometido a un entrenamiento continuado multilingüe que añade 11 idiomas nuevos. Las innovaciones destacadas documentadas incluyen el control explícito de pausas mediante marcadores inline (`[pause X.Ys]`), el control de duración a nivel de token, el control de pronunciación con Pinyin/IPA, el code-switching y la mejora en la estabilidad de la clonación de voz, especialmente en escenarios con referencias largas y textos cortos.

## Capacidades

- Sintesis de voz en 31 idiomas, con etiquetas de idioma opcionales para mejorar la calidad cuando se especifican.
- Clonacion de voz zero-shot: puede replicar el timbre y estilo de una voz a partir de un audio de referencia sin entrenamiento adicional.
- Generacion de voz de formato largo (long-form speech) para narraciones extensas.
- Control de duracion a nivel de token, lo que permite ajustar la velocidad y el ritmo de la locución.
- Control de pronunciacion mediante notación Pinyin o IPA, útil para nombres propios o términos extranjeros.
- Code-switching: habilita mezclar varios idiomas en un mismo enunciado sin cortes bruscos.
- Control de pausas explicito con marcadores como `[pause 3.2s]` para insertar silencios de duración determinada.
- Prosodia que sigue la puntuacion, especialmente en frases largas, con pausas más estables y naturales.

## Casos de uso

- Doblaje de videos y series multilingües: permite generar locuciones en hasta 31 idiomas manteniendo la voz de referencia, lo que agiliza la localización de contenido audiovisual para distintos mercados.
- Audiolibros y narración de formato largo: gracias a la generación de voz extendida y al control de pausas, es posible producir narraciones completas con ritmo natural y silencios intencionados.
- Asistentes de voz personalizados: la clonación de voz zero-shot permite asignar una identidad de voz consistente a un agente conversacional, con menor variación entre generaciones repetidas.
- Materiales educativos de idiomas: el control de pronunciación con Pinyin e IPA facilita generar audios de apoyo para aprender lenguas como chino, árabe o persa, donde la pronunciación es crítica.
- Publicidad y contenido bilingüe: el code-switching permite crear locuciones que alternan idiomas de forma fluida, adecuado para campañas dirigidas a audiencias bilingües.
- Accesibilidad y lectura asistida: conversión de texto a voz para personas con discapacidad visual, con control de duración y pausas para adaptarse a diferentes velocidades de lectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware en la documentación.
- Estimacion basada en el tamaño del checkpoint: los pesos en bfloat16 ocupan aproximadamente 17 GB, por lo que se recomienda una GPU con al menos 24 GB de VRAM para inferencia sin cuantización (por ejemplo, RTX 4090, A100 40 GB, H100).
- Se recomienda una GPU NVIDIA reciente con soporte para FlashAttention 2, aunque su instalación es opcional; el modelo también funciona con el backend de atención por defecto.
- El despliegue se realiza mediante el código del repositorio MOSS-TTS y la biblioteca Transformers 5.0.0, con PyTorch 2.9.1+cu128 y torchaudio 2.9.1+cu128.
- No se mencionan opciones de despliegue con vLLM, llama.cpp u Ollama; el modelo requiere el pipeline personalizado de MOSS-TTS.

## Comparativa con modelos similares

No se dispone de información suficiente en la documentación proporcionada para realizar una comparativa cuantitativa con otros modelos TTS. Se puede señalar que v1.5 es la evolución de MOSS-TTS 1.0, ampliando el soporte de idiomas de 20 a 31 y mejorando la estabilidad de la clonación, el seguimiento de puntuación y el control de pausas. No se han proporcionado datos de parámetros ni benchmarks de la versión 1.0 en esta información.

## Limitaciones y advertencias

- Si se omite el campo `language` al construir el mensaje, v1.5 puede mejorar en algunos idiomas y retroceder ligeramente en otros en comparación con MOSS-TTS 1.0. Se recomienda especificar siempre el idioma cuando se conozca.
- El modelo requiere código personalizado (`custom_code`) y una versión concreta de Transformers (5.0.0), lo que puede complicar su integración en entornos existentes.
- No se han publicado estudios de sesgos ni evaluación de sesgos de voz. Como modelo TTS, puede presentar diferencias de calidad según el acento, el género o el idioma de la voz de referencia.
- Existe riesgo de errores de pronunciación o inestabilidad en la clonación cuando la referencia es larga y el texto objetivo es corto, aunque v1.5 mejora este caso respecto a la versión 1.0.
- La licencia Apache 2.0 permite uso comercial, pero es recomendable revisar las condiciones del repositorio y del código asociado antes de desplegarlo en producción.

## Enlaces

- HuggingFace: https://huggingface.co/niobures/MOSS-TTS-v1.5
- GitHub: https://github.com/OpenMOSS/MOSS-TTS/tree/main
- ModelScope: https://modelscope.cn/collections/OpenMOSS-Team/MOSS-TTS
- Blog: https://mosi.cn/#models
- Arxiv: https://arxiv.org/abs/2603.18090
- AIStudio: https://studio.mosi.cn
- API docs: https://studio.mosi.cn/docs/moss-tts
- Twitter: https://x.com/Open_MOSS
- Discord: https://discord.gg/fvm5TaWjU3
