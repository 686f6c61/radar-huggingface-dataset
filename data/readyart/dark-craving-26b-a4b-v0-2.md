# ReadyArt/Dark-Craving-26B-A4B-v0.2

## Resumen

Dark-Craving-26B-A4B-v0.2 es un ajuste fino (finetune) del modelo google/gemma-4-26B-A4B-it, publicado por ReadyArt en Hugging Face el 31 de octubre de 2026. Se trata de un modelo de generación de texto orientado a roleplay, contenido adulto explícito (NSFW/ERP) y conversación sin restricciones de alineamiento, un nicho que los modelos comerciales no cubren por sus políticas de contenido. Su relevancia reside en ofrecer capacidades creativas desalineadas sobre una arquitectura MoE eficiente, lo que permite ejecutarlo en hardware de consumo con un coste de inferencia reducido.

El modelo conserva la arquitectura de su base: un transformer mixture-of-experts (MoE) de aproximadamente 26.000 millones de parámetros totales, de los cuales solo unos 4.000 millones están activos por token (según la nomenclatura "A4B" del modelo base). Los pesos se distribuyen en formato safetensors, con un tamaño de repositorio de 51,6 GB, y la licencia es Apache 2.0, heredada de la base. Está diseñado para instrucciones (instruct) y conversación multturno, con soporte documentado únicamente para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (basado en Gemma 4) |
| Parametros totales | 25.805.936.206 (~25,8 B) |
| Parametros activos | ~4 B (deducido de la nomenclatura A4B del modelo base; dato exacto no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en bf16/fp16 en el repo, 51,6 GB) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un finetune de google/gemma-4-26B-A4B-it, la variante instruct de la familia Gemma 4 con arquitectura mixture-of-experts. En esta clase de modelos, cada token se procesa mediante un subconjunto reducido de expertos (aproximadamente 4.000 millones de parametros activos de los 25.800 millones totales), lo que reduce drasticamente el coste computacional por token manteniendo la capacidad expresiva de un modelo denso mucho mayor. No se han publicado detalles tecnicos sobre la implementacion exacta (numero de expertos, top-k, frecuencia de enrutado).

Sobre el proceso de entrenamiento del finetune, la model card no aporta informacion: no se especifican los datos utilizados, el numero de tokens, la tecnica empleada (full finetune, LoRA, DPO, etc.) ni las epocas de entrenamiento. Por su catalogacion (nsfw, unaligned, roleplay, ERP), puede inferirse que el ajuste se realizo sobre datos de narrativa adulta y conversacion de rol, eliminando los rechazos de seguridad del modelo base, pero no hay datos verificables al respecto.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a instrucciones (variante instruct).
- Roleplay narrativo de larga duracion y roleplay erotico explicito (ERP), sin filtros de contenido.
- Contenido adulto y maduro sin alineamiento (etiquetado "unaligned" y "not-for-all-audiences").
- No hay informacion sobre soporte de tool calling / function calling.
- No hay informacion sobre capacidades de vision, audio ni modo de razonamiento extendido (thinking mode).
- No hay informacion sobre rendimiento en codigo, matematicas ni razonamiento formal; al ser un finetune especializado en roleplay, es esperable un rendimiento degradado frente al modelo base en esas areas.

## Casos de uso

- Roleplay interactivo de personajes: el modelo puede sostener conversaciones multturno interpretando personajes con personalidades definidas, sin rechazar tematicas maduras, lo que lo hace adecuado para plataformas de ficcion interactiva para adultos.
- Escritura creativa de ficcion adulta: generacion de prosa narrativa con contenido explicito bajo control del usuario, util como asistente de escritura para autores del genero.
- Prototipado de chatbots de entretenimiento adulto: su licencia Apache 2.0 permite integrarlo en productos comerciales de compania conversacional, sujeto a normativa local sobre contenido adulto.
- Generacion de dialogo para videojuegos narrativos: puede redactar dialogos maduros y ramificaciones conversacionales para juegos con clasificacion para adultos, acelerando la produccion de contenido.
- Compania conversacional local y privada: al ser ejecutable en hardware de consumo gracias a sus ~4 B de parametros activos, permite despliegues locales que garantizan privacidad del usuario, un requisito critico en este nicho.
- Evaluacion de seguridad y red-teaming: como modelo desalineado, sirve como caso de prueba para investigar comportamientos de modelos sin filtros y desarrollar clasificadores de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa: los 51,6 GB del repositorio implican pesos en bf16; se necesitan aproximadamente 52-56 GB de VRAM para inferencia sin cuantizar, mas la cache de contexto.
- Con cuantizacion (por ejemplo, Q4 en GGUF, si se publica una version cuantizada), el footprint bajaria a un rango estimado de 15-18 GB, aunque no hay versiones cuantizadas oficiales en la informacion disponible.
- GPUs recomendadas sin cuantizar: A100 80 GB, H100 80 GB o 2x RTX 4090 (24 GB cada una) con paralelismo de tensores.
- En GPUs de consumo: no cabe en una sola RTX 4090 (24 GB) en precision completa; con cuantizacion Q4/Q5 si seria viable en una RTX 4090 o RTX 3090, y en Apple Silicon con suficiente memoria unificada (32 GB o mas).
- Opciones de despliegue: al ser un modelo Gemma-compatible en safetensors, deberia funcionar con vLLM, TGI, llama.cpp y Ollama (este ultimo requiriendo conversion a GGUF). No hay instrucciones de despliegue en la model card.
- Latencia y throughput: no disponible. Gracias a la activacion de solo ~4 B de parametros por token, la velocidad de generacion deberia ser cercana a la de un modelo denso de ese tamano, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| ReadyArt/Dark-Craving-26B-A4B-v0.2 | ~25,8 B | ~4 B | Apache 2.0 | Roleplay NSFW, desalineado | Abierta en Hugging Face |
| google/gemma-4-26B-A4B-it (base) | ~26 B | ~4 B | Licencia Gemma (restricciones de uso) | Uso general instruct, alineado | Abierta con licencia propia de Google |
| MythoMax / finetunes roleplay de la comunidad (p. ej. sobre Mistral) | ~7-13 B | no disponible | Variable (muchas Apache 2.0) | Roleplay y narrativa creativa | Abierta en Hugging Face |

Nota: la comparativa se limita a los modelos directamente referenciados en la informacion disponible. No existen datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- Contenido explicito sin filtros: el modelo esta etiquetado explicitamente como not-for-all-audiences y genera contenido sexual y maduro sin restricciones. Su uso esta prohibido con menores de edad y puede infringir leyes locales segun jurisdiccion.
- Riesgo elevado de alucinacion y degradacion de capacidades: al tratarse de un finetune especializado en roleplay NSFW, es previsible que rinda peor que el modelo base en razonamiento, codigo, matematicas y tareas factuales. No hay benchmarks que cuantifiquen esta degradacion.
- Soporte limitado al ingles: la model card declara unicamente el ingles como idioma; el rendimiento en castellano no esta documentado y puede ser inconsistente.
- Sesgos: no hay documentacion sobre sesgos del finetune. Como todo modelo desalineado entrenado con contenido adulto, puede reproducir estereotipos y dinamicas problematicas presentes en sus datos de entrenamiento.
- Longitud de contexto: no disponible; no se puede garantizar el comportamiento en contextos largos.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el modelo hereda la base Gemma 4 de Google; conviene verificar la compatibilidad entre la licencia del finetune y los terminos de uso del modelo base antes de desplegarlo en produccion.
- Advertencia adicional: el modelo carece de salvaguardas de seguridad estandar, por lo que cualquier despliegue orientado a terceros deberia incorporar capas externas de moderacion y verificacion de edad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ReadyArt/Dark-Craving-26B-A4B-v0.2
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Paper, repositorio de codigo y demo: no disponible
