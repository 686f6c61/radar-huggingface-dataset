# DavidAU/Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-NEO-GGUF

## Resumen
Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-NEO-GGUF es un ajuste fino (finetune) de tipo "abliterated/heretic" y sin censura, publicado por el usuario DavidAU en Hugging Face. Se distribuye principalmente en formato GGUF para inferencia local y deriva de un modelo base del mismo autor (`DavidAU/Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-source`), a su vez construido sobre la familia Qwen. El modelo tiene 26.895.998.464 parámetros reales según los pesos safetensors, lo que lo sitúa en la categoría de ~27B.

El modelo está orientado a entretenimiento: escritura creativa de terror, rol y simulaciones de personajes ("EVIL AI Constructs"). Incorpora lo que el autor denomina "Halloween O/S", una capa de comportamiento que actúa como procesador por defecto de la salida, junto con 13 modos de razonamiento, 13 modos de instrucción y 10 constructos de personajes predefinidos (Joker, Harley Quinn, Borg Queen, Jason, Freddy Krueger, Norman Bates, Pennywise, Vecna, Mind Flayer y Chucky). El pipeline declarado es image-text-to-text, con soporte multimodal mediante ficheros mmproj.

Es relevante ahora por su popularidad dentro del nicho de modelos locales sin censura para escritura y rol (más de 6.800 descargas y 34 likes en el momento de la consulta), y porque ejemplifica las técnicas de "abliteration"/"heretic" aplicadas a modelos de ~27B con cuantizaciones GGUF e imatrix. No obstante, el propio autor lo etiqueta como "for entertainment purposes only" y advierte de que no debe usarse con herramientas ni tomarse su salida como información fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de la familia Qwen; detalles de atención no disponibles) |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como cifra oficial; el autor recomienda un mínimo de 64k, o más para conversaciones largas |
| Tipos de cuantizacion | GGUF en múltiples cuantizaciones (se mencionan IQ4_XS y cuantizaciones superiores con imatrix); listado completo no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo principal); safetensors en el modelo base/fuente; ficheros mmproj para imagen |

## Arquitectura y entrenamiento
La información disponible no detalla la arquitectura interna más allá de que es un transformer derivado de la familia Qwen con ~27B parámetros. El modelo es un finetune del modelo fuente del mismo autor, y ha sido sometido a técnicas de "abliteration"/"heretic" para eliminar el rechazo (uncensored). Según la model card, se entrenó sobre un dataset de terror ("trained on Horror dataset") con constructos de IA de terror procedentes de "Turbo Brilliance".

Como innovaciones destacables, el autor menciona el "Halloween O/S" como capa de procesamiento por defecto que controla toda la salida del modelo, disponible en variantes low, medium y xhigh, y una construcción de "precisión" de 2.000-4.000 tokens por constructo. También se indica que las cuantizaciones son MTP (multi-token prediction) salvo una IQ4_XS, y que se emplea imatrix en las cuantizaciones de mayor calidad. No se dispone de datos sobre número de tokens de entrenamiento, composición exacta del dataset ni uso de RLHF/DPO.

## Capacidades
- Generación de texto y escritura creativa de ficción en todos los géneros, con énfasis en terror y horror.
- Rol e interpretación de personajes ("roleplaying") mediante 10 constructos predefinidos y la posibilidad de "conjurar" personajes arbitrarios.
- 13 modos de razonamiento ("thinking") y 13 modos de instrucción ("instruct"), accesibles mediante comandos como `[summon:help]`.
- Razonamiento multi-turno dentro de conversaciones largas (contexto recomendado de 64k o superior).
- Capacidad multimodal image-text-to-text: acepta imágenes si se descarga un fichero mmproj junto a los GGUF.
- Multilingüe limitado: el modelo declara únicamente inglés (`en`).
- No se documenta soporte de tool calling/function calling; de hecho, el autor advierte explícitamente de no habilitar herramientas.

## Casos de uso
- Escritura de ficción de terror: el modelo genera relatos y narrativa de horror con coherencia multi-turno, apoyándose en un contexto recomendado de 64k para tramas largas.
- Rol interactivo con personajes: permite encarnar a los 10 constructos predefinidos o a personajes personalizados mediante el comando de invocación, adecuado para entretenimiento y juegos de rol.
- Creación de contenido temático de Halloween: útil para generar guiones, ambientación y diálogos de eventos temáticos, dado su entrenamiento específico en terror.
- Prototipado de experiencias conversacionales de ficción: sirve para experimentar con personajes y flujos narrativos antes de llevarlos a producción.
- Exploración de técnicas de abliteration/heretic: investigadores pueden estudiar el comportamiento de un modelo sin censura en tareas creativas controladas.
- Generación de descripciones a partir de imágenes: gracias al pipeline image-text-to-text y los ficheros mmproj, puede narrar o ambientar escenas a partir de una imagen en contextos creativos.
- Experimentación local con GGUF: su empaquetado en GGUF e imatrix facilita pruebas en hardware de consumo con llama.cpp u Ollama.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: no disponible de forma oficial; para ~27B en GGUF, las cuantizaciones bajas (p. ej. IQ4_XS) reducen el requisito frente a cuantizaciones altas, pero no se ofrecen cifras concretas.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? No se especifica; el formato GGUF y las cuantizaciones bajas sugieren viabilidad en GPUs de consumo de gama alta, pero sin datos confirmados.
- Opciones de despliegue: llama.cpp y Ollama son las vías naturales para GGUF; también se puede usar con otros runners compatibles con GGUF. El autor indica descargar un fichero mmproj en la misma carpeta para el soporte de imágenes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-NEO-GGUF | ~27B | no disponible (recomendado ≥64k) | apache-2.0 | GGUF | Finetune de terror sin censura, orientado a rol |
| Modelo fuente del mismo autor (`...-source`) | ~27B | no disponible | apache-2.0 | safetensors | Base del finetune |
| Otros finetunes Qwen de ~27B sin censura | ~27B | variable | variable | GGUF/safetensors | No se dispone de datos concretos para comparar rendimiento |

No se dispone de datos de benchmarks ni de comparativas de rendimiento con alternativas en la información proporcionada.

## Limitaciones y advertencias
- Modelo "uncensored"/"abliterated": puede generar contenido sensible, ofensivo o inapropiado; el autor lo marca como "not-for-all-audiences".
- Riesgo elevado de alucinación: el propio autor advierte de no creer lo que dice el "O/S" ni los constructos y de verificar cualquier dato serio.
- Uso previsto exclusivamente de entretenimiento ("for entertainment purposes only"); no apto para producción ni para tareas que requieran fiabilidad factual.
- No habilitar herramientas ("tools"/"use tools"): el autor lo desaconseja explícitamente.
- Idioma limitado al inglés; no se garantiza calidad en castellano.
- Aunque la licencia es apache-2.0, el contenido generado puede plantear riesgos legales o éticos según el uso; conviene revisar las condiciones del modelo base.
- El contexto recomendado (≥64k) implica requisitos de memoria considerables en conversaciones largas.
- Los constructos de personajes pueden estar sujetos a derechos de propiedad intelectual de terceros; su uso comercial es responsabilidad del usuario.

## Enlaces
- Hugging Face: https://huggingface.co/DavidAU/Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-NEO-GGUF
- Modelo fuente: https://huggingface.co/DavidAU/Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-source
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs del autor: https://huggingface.co/DavidAU/support
- Apoyo al autor: https://buymeacoffee.com/davidbelton
