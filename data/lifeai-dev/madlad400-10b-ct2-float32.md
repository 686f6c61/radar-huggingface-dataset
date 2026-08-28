# LifeAi-dev/madlad400-10b-ct2-float32

## Resumen

MADLAD-400-10B-MT es un modelo de traducción automática multilingüe desarrollado por Google Research, basado en la arquitectura T5 (encoder-decoder) y entrenado sobre 250 mil millones de tokens que cubren más de 450 idiomas. El modelo original se publicó en el paper "MADLAD-400: A Multilingual And Document-Level Large Dataset" (arXiv:2309.04662) y se distribuye bajo licencia Apache 2.0. Esta versión concreta, `LifeAi-dev/madlad400-10b-ct2-float32`, es una conversión a formato cTranslate2 realizada por el usuario LifeAi-dev, que permite una inferencia más eficiente en CPU y GPU comparada con la implementación original de Transformers.

La relevancia de este modelo radica en su cobertura lingüística extremadamente amplia, que incluye lenguas de baja representación y dialectos regionales, lo que lo convierte en una opción sólida para sistemas de traducción multilingüe a gran escala. Al estar convertido a cTranslate2, se puede desplegar con herramientas como CTranslate2, Hugging Face TGI o servidores de traducción dedicados, manteniendo la calidad del modelo original. El tamaño del repositorio es de 42,9 GB, coherente con los pesos en float32 de un modelo de 10,7 mil millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (encoder-decoder, transformer) |
| Parametros totales | 10,7 mil millones (10.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo original usa secuencias de hasta 512 tokens, pero no se especifica en esta conversion) |
| Tipos de cuantizacion | float32 (este repositorio); el modelo original admite cuantizacion int8 y float16 en cTranslate2 |
| Idiomas soportados | Mas de 450 idiomas, incluyendo es, en, fr, de, it, pt, ru, zh, ja, ar, hi, y muchas lenguas minoritarias |
| Licencia | Apache 2.0 |
| Formato de pesos | ctranslate2 (binarios .bin) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura T5, un transformer encoder-decoder con atención completa. El entrenamiento se realizó sobre el dataset MADLAD-400, un corpus monolingüe de 3 billones de tokens extraído de CommonCrawl y auditado manualmente, que abarca 419 idiomas. El modelo final se entrenó con 250 mil millones de tokens en tareas de traducción multilingüe, cubriendo más de 450 idiomas. No se aplicaron técnicas de RLHF ni DPO; el entrenamiento fue supervisado con pares de texto fuente-objetivo. La conversión a cTranslate2 no modifica los pesos, solo el formato de serialización, lo que permite una inferencia más rápida y con menor uso de memoria gracias a la optimización de kernels y la posibilidad de cuantización posterior.

## Capacidades

- Traducción automática multilingüe de alta calidad entre más de 450 idiomas, incluyendo pares de lenguas con pocos recursos.
- Generación de texto condicionada mediante prefijos de idioma, por ejemplo `<2en>` para indicar el idioma de destino.
- Soporte de traducción a nivel de documento (el modelo original fue entrenado con contextos de documento, aunque esta conversión no garantiza esa capacidad).
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente; es un modelo puramente de traducción.
- Capacidad multilingüe excepcional, con cobertura de lenguas africanas, asiáticas, europeas y americanas, incluyendo dialectos y criollos.

## Casos de uso

- Traducción automática para plataformas de contenido global: el modelo puede traducir artículos, páginas web o publicaciones de redes sociales a decenas de idiomas con un solo modelo, simplificando la infraestructura.
- Localización de software y aplicaciones: gracias a su soporte de más de 450 idiomas, permite generar cadenas de interfaz de usuario en lenguas minoritarias sin necesidad de modelos separados.
- Subtitulado automático de vídeo: se puede integrar en pipelines de transcripción y traducción para generar subtítulos en múltiples idiomas, aprovechando su capacidad de procesar frases completas.
- Atención al cliente multilingüe: combinado con un sistema de detección de idioma, puede traducir consultas de usuarios y respuestas de agentes en tiempo real, cubriendo mercados con diversidad lingüística.
- Traducción de documentos legales o técnicos: su entrenamiento en dominio general y su cobertura amplia lo hacen adecuado para traducir manuales, contratos y documentación técnica, aunque se recomienda revisión humana.
- Investigación en lingüística computacional: sirve como modelo base para estudiar traducción entre lenguas de bajos recursos, o para fine-tuning en dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta conversion concreta. El paper original de MADLAD-400 reporta mejoras sobre NLLB-200 y M2M-100 en varios pares de idiomas, especialmente en lenguas africanas y asiáticas, pero esos datos no están incluidos en la documentación de este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en float32 ocupa aproximadamente 42,9 GB en memoria. Para cargarlo completo en GPU se necesitan al menos 48 GB de VRAM (por ejemplo, una A6000 o A100 de 80 GB).
- Con cuantización int8 (convertible desde cTranslate2), el uso de memoria baja a unos 10,7 GB, lo que permite ejecutarlo en GPUs de consumo como RTX 3090 o RTX 4090.
- En CPU, cTranslate2 permite inferencia con precisión float32, aunque la velocidad será significativamente menor que en GPU.
- Opciones de despliegue: CTranslate2 (nativo), Hugging Face Text Generation Inference (TGI) con backend ctranslate2, o servidores personalizados usando la API de Python de CTranslate2.
- Latencia y throughput: no se han publicado mediciones específicas para esta conversión, pero cTranslate2 suele ofrecer una aceleración de 2-4x frente a Transformers en tareas de traducción.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| MADLAD-400-10B-MT (este) | 10,7B | 450+ | no disponible | Apache 2.0 | ctranslate2 |
| NLLB-200-3.3B (Meta) | 3,3B | 200 | 512 | CC-BY-NC 4.0 (no comercial) | safetensors, ctranslate2 |
| M2M-100-12B (Meta) | 12B | 100 | 512 | MIT | safetensors |
| MADLAD-400-3B-MT | 3B | 450+ | no disponible | Apache 2.0 | safetensors, ctranslate2 |

La principal ventaja de MADLAD-400-10B frente a NLLB-200 es su mayor cobertura de idiomas (450 vs 200) y su licencia Apache 2.0, que permite uso comercial sin restricciones. M2M-100-12B tiene más parámetros pero menos idiomas y una licencia MIT, aunque su calidad en lenguas de bajos recursos es inferior según el paper de MADLAD-400.

## Limitaciones y advertencias

- Sesgos conocidos: el entrenamiento se basó en CommonCrawl, que puede contener sesgos culturales y de género presentes en la web. La auditoría manual del dataset mitigó parte de estos sesgos, pero no los elimina por completo.
- Riesgo de alucinación: como todo modelo generativo, puede producir traducciones inventadas o incorrectas, especialmente en lenguas con pocos datos de entrenamiento. Se recomienda validación humana para contenido crítico.
- Limitaciones de contexto: aunque el modelo original fue entrenado con documentos, esta conversión no especifica la longitud máxima de secuencia. En la práctica, cTranslate2 maneja secuencias de hasta 512 tokens por defecto, lo que limita la traducción de documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, pero requiere mantener el aviso de copyright y las patentes asociadas.
- Cobertura desigual: la calidad de traducción varía significativamente entre idiomas; los idiomas con más recursos (en, es, fr, de) tendrán mejor rendimiento que lenguas minoritarias.
- Dependencia de cTranslate2: esta conversión no es compatible directamente con la API de Transformers; requiere usar CTranslate2 o herramientas que lo soporten.

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/LifeAi-dev/madlad400-10b-ct2-float32
- Modelo original de Google: https://huggingface.co/google/madlad400-10b-mt
- Paper arXiv: https://arxiv.org/abs/2309.04662
- Repositorio de Google Research: https://github.com/google-research/google-research/tree/master/madlad_400
- Documentación de CTranslate2: https://opennmt.net/CTranslate2/
