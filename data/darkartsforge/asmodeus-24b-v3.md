# DarkArtsForge/Asmodeus-24B-v3

## Resumen

Asmodeus-24B-v3 es un modelo de lenguaje de 24 mil millones de parámetros (según su nombre) desarrollado por DarkArtsForge mediante la fusión de cuatro modelos base de 24B utilizando mergekit con el método "flux". Está orientado a la escritura creativa, la narración de ficción, la generación de tramas y el roleplay, con un énfasis explícito en la generación de contenido sin censura, incluyendo material violento, erótico y gráfico. El modelo se basa en la arquitectura Mistral (según las etiquetas) y emplea la plantilla de chat Mistral Tekken. Su relevancia radica en su capacidad para producir narrativas vívidas y detalladas sin rechazos ni restricciones, lo que lo hace atractivo para creadores de contenido y aficionados al roleplay que buscan un modelo sin límites morales. Sin embargo, esta característica conlleva riesgos importantes de uso indebido y no es adecuado para aplicaciones que requieran moderación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral (según etiquetas, no confirmado) |
| Parametros totales | 24B (según nombre, no verificado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo indica float32, pero no se especifican cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Nota: el tamaño del repositorio es de 28.9 GB, lo que sugiere que los pesos están en una precisión reducida o que no se incluyen todos los pesos, pero no hay confirmación oficial.

## Arquitectura y entrenamiento

El modelo es una fusión (merge) de cuatro modelos base: DarkArtsForge/Morbid-Miasma-24B, Naphula/Goetia-24B-v1.4, OccultAI/Doppelganger-Twist-24B y OccultAI/Ouroboros-24B-v1.4, todos ellos de 24B de parámetros. La fusión se realizó con mergekit utilizando el método "flux". No se proporcionan detalles sobre entrenamiento adicional, aunque se menciona el dataset OccultAI/illuminati_imatrix_v1, que probablemente se usó para algún tipo de ajuste o cálculo de imatrix. No hay información sobre el número de tokens de entrenamiento, la composición del dataset o técnicas como RLHF o DPO. El modelo está diseñado para generar texto sin censura, lo que sugiere que no se aplicaron técnicas de alineación para evitar contenido dañino.

## Capacidades

- Generación de texto creativo: narrativa de ficción, cuentos, novelas, poesía y otros formatos literarios.
- Generación de tramas y subtramas: puede crear argumentos complejos y desarrollarlos de forma coherente.
- Continuación de escenas: puede continuar una historia existente a partir de un fragmento dado.
- Roleplay: soporta interacciones de personajes en juegos de rol, con diálogos y descripciones detalladas.
- Escritura vívida: produce prosa descriptiva y rica en matices, con un estilo "vivido" y envolvente.
- Contenido sin censura: capaz de generar material explícito, violento, erótico y de terror sin rechazos ni restricciones.
- Conversación: aunque no se especifica tool calling, es un modelo de texto generativo que puede mantener diálogos.
- Multilingüe: solo inglés (según la etiqueta "en").

## Casos de uso

- Escritura de ficción creativa: autores que necesitan un asistente para generar borradores de novelas, cuentos o guiones, con descripciones vívidas y tramas complejas. El modelo puede producir texto extenso y detallado sin interrupciones.
- Roleplay en línea: jugadores que participan en juegos de rol por texto y necesitan un modelo que interprete personajes sin restricciones, incluyendo escenarios adultos o de terror.
- Generación de contenido para juegos: desarrollo de diálogos y narrativas para videojuegos, juegos de mesa o aventuras de texto, donde se requiere creatividad sin límites.
- Creación de guiones para cine o teatro: ayuda en la generación de diálogos y escenas, especialmente en géneros como el horror o el thriller psicológico.
- Exploración de narrativas oscuras: escritores de ficción especulativa o terror que necesitan un modelo que no rehúya temas tabú o perturbadores.
- Prototipado de historias interactivas: para aplicaciones de ficción interactiva o juegos de rol de mesa, donde el modelo actúa como narrador o director de juego.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se dispone de información oficial sobre requisitos de hardware.
- El tamaño del repositorio es de 28.9 GB, lo que da una idea del espacio en disco necesario para los pesos.
- Para inferencia en precisión float32, se estima que se necesitan al menos 48 GB de VRAM (dado que 24B parámetros en float32 ocupan ~96 GB, pero el tamaño del repo sugiere que podría estar en una precisión menor). Esta es una estimación no confirmada.
- Se puede utilizar vLLM, llama.cpp u otras herramientas de inferencia, pero no hay confirmación de compatibilidad en la información proporcionada.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de modelos comparables en la información.

## Limitaciones y advertencias

- El modelo es completamente sin censura y puede generar contenido violento, gráfico, sexual explícito y ofensivo. No tiene mecanismos de rechazo.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar información, especialmente en contextos no relacionados con la escritura creativa.
- Solo soporta inglés, lo que limita su uso en otros idiomas.
- No se han publicado detalles sobre sesgos, pero al ser un modelo sin alineación, es probable que refleje sesgos presentes en los datos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede ser problemático legalmente en algunas jurisdicciones.
- No se recomienda su uso en aplicaciones donde se requiera contenido seguro o moderado, como asistentes públicos o herramientas educativas.

## Enlaces

- HuggingFace: https://huggingface.co/DarkArtsForge/Asmodeus-24B-v3
- Repositorio de mergekit: https://github.com/cg123/mergekit
- Dataset OccultAI/illuminati_imatrix_v1: https://huggingface.co/datasets/OccultAI/illuminati_imatrix_v1
- Modelos base:
  - https://huggingface.co/DarkArtsForge/Morbid-Miasma-24B
  - https://huggingface.co/Naphula/Goetia-24B-v1.4
  - https://huggingface.co/OccultAI/Doppelganger-Twist-24B
  - https://huggingface.co/OccultAI/Ouroboros-24B-v1.4
