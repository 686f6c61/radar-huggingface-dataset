# SicariusSicariiStuff/Roleplay_Cards

## Resumen

Roleplay_Cards no es un modelo de lenguaje, sino una coleccion de fichas de personaje (character cards) en formato PNG publicadas por SicariusSicariiStuff para su uso en sesiones de roleplay 1-a-1 con modelos de lenguaje. Cada ficha codifica la persona, rasgos, gustos, objetivos, escenario y saludo inicial de un personaje concreto siguiendo el formato propietario SICAtxt (Simple, Inexpensive, Character Attributes plain-text), pensado para ser importado directamente por frontends de roleplay.

El repositorio agrupa fichas asociadas a distintos modelos de la familia del autor (Angelic_Eclipse_12B, Sweet_Dreams_12B, Impish_Nemo_12B, entre otros) y esta disenado explicitamente para conversaciones individuales con un unico personaje, no para aventuras multijugador ni chats de grupo. Para esos ultimos casos el autor mantiene un repositorio separado, Adventure_Cards.

La relevancia es practica: estandariza el formato de las tarjetas de personaje en texto plano legible, con estructura fija (Persona, Traits, Likes, Dislikes, Quirks, Goals, Scenario, World_Setting, Greeting), lo que facilita la portabilidad entre modelos y herramientas. El repositorio tiene 13 likes y 0 descargas en el momento de la consulta, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de lenguaje; es una coleccion de fichas de personaje en PNG) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (las fichas se distribuyen como imagenes .png) |

## Arquitectura y entrenamiento

No aplica: el repositorio no contiene pesos de modelo ni proceso de entrenamiento. Se trata de un conjunto de tarjetas de personaje en formato PNG que embeben metadatos de texto plano. El formato SICAtxt define una plantilla estructural fija con secciones para persona, rasgos, preferencias, rarezas, metas, escenario, ambientacion y saludo inicial.

El autor recomienda generar nuevas fichas con sus modelos Persona_Maker_12B y Persona_Maker_24B, lo que sugiere un flujo de trabajo donde un LLM produce el texto de la tarjeta y este se exporta como PNG importable. No se documenta el proceso de creacion de las fichas existentes ni la metodologia de seleccion de personajes.

## Capacidades

- Distribucion de fichas de personaje listas para importar en frontends de roleplay compatibles con tarjetas PNG.
- Formato SICAtxt en texto plano con secciones estandarizadas: persona, traits, likes, dislikes, quirks, goals, scenario, world_setting y greeting.
- Diseno especifico para roleplay 1-a-1 con un unico personaje.
- Compatibilidad con los modelos de la familia del autor (Angelic_Eclipse_12B, Sweet_Dreams_12B, Impish_Nemo_12B) y, por extension, con otros modelos de roleplay que acepten tarjetas en texto plano.
- Generacion asistida de nuevas fichas mediante Persona_Maker_12B y Persona_Maker_24B.
- Separacion explicita respecto a Adventure_Cards para escenarios de grupo o aventuras abiertas.

## Casos de uso

- Sesiones de roleplay individual: importar una ficha PNG en un frontend compatible y conversar con el personaje, aprovechando que la tarjeta define persona, escenario y saludo inicial de forma consistente.
- Creacion rapida de personajes personalizados: usar Persona_Maker_12B o 24B para generar el texto SICAtxt y exportarlo como PNG, evitando escribir la ficha a mano.
- Evaluacion comparativa de modelos de roleplay: al mantener el mismo formato de tarjeta, se puede medir como distintos modelos (12B, 24B) interpretan el mismo personaje y escenario.
- Prototipado de experiencias conversacionales: las fichas sirven como base para demos de agentes con personalidad fija en entornos controlados.
- Catalogacion y curaduria de personajes: el repositorio actua como indice de fichas con descripcion breve, util para seleccionar personajes por tematica (supervivencia, fantasia, ciencia ficcion).
- Integracion en pipelines de generacion de contenido narrativo: las tarjetas pueden alimentar sistemas que necesiten un system prompt estructurado con persona y ambientacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica al repositorio en si: las fichas son archivos PNG de tamano reducido (el repositorio ocupa 0.0 GB) y no requieren GPU para su uso.
- El hardware necesario depende del modelo de lenguaje con el que se combine la ficha (por ejemplo, los modelos 12B o 24B del autor), no de la tarjeta.
- Para los modelos asociados de 12B se requiere aproximadamente 24 GB de VRAM en FP16 o menos con cuantizacion, aunque este dato no se detalla en la informacion disponible.
- Opciones de despliegue del modelo subyacente: no disponibles en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Repositorio | Tipo de contenido | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| Roleplay_Cards (este) | Fichas de personaje PNG | Roleplay 1-a-1 | Apache 2.0 | Hugging Face |
| Adventure_Cards | Fichas de personaje PNG | Aventuras y chats de grupo | no disponible | Hugging Face (mismo autor) |
| Persona_Maker_12B / 24B | Modelos de lenguaje | Generacion de fichas SICAtxt | no disponible | Hugging Face (mismo autor) |

No se dispone de informacion sobre otros repositorios de fichas comparables en la busqueda proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto por si mismo; requiere un LLM externo para funcionar.
- Las fichas estan disenadas exclusivamente para roleplay 1-a-1; su uso en chats de grupo o aventuras abiertas no esta soportado segun el autor.
- El formato SICAtxt es propietario del autor y puede no ser compatible con todos los frontends de roleplay.
- No se documentan los idiomas de las fichas ni de los personajes; la model card esta redactada en ingles.
- No se especifica el proceso de creacion, curaduria ni evaluacion de calidad de las fichas.
- La licencia Apache 2.0 cubre el repositorio, pero el contenido narrativo de cada personaje puede estar sujeto a derechos de terceros no declarados.
- El repositorio tenia 0 descargas en el momento de la consulta, lo que limita la evidencia de uso en produccion.
- Riesgo de sesgos y alucinaciones: depende enteramente del modelo de lenguaje subyacente que interprete la ficha.

## Enlaces

- Repositorio principal: https://huggingface.co/SicariusSicariiStuff/Roleplay_Cards
- Repositorio de aventuras: https://huggingface.co/SicariusSicariiStuff/Adventure_Cards
- Modelo generador de fichas (12B): https://huggingface.co/SicariusSicariiStuff/Persona_Maker_12B
- Modelo generador de fichas (24B): https://huggingface.co/SicariusSicariiStuff/Persona_Maker_24B
- Modelo asociado Angelic_Eclipse_12B: https://huggingface.co/SicariusSicariiStuff/Angelic_Eclipse_12B
- Modelo asociado Sweet_Dreams_12B: https://huggingface.co/SicariusSicariiStuff/Sweet_Dreams_12B
- Modelo asociado Impish_Nemo_12B: https://huggingface.co/SicariusSicariiStuff/Impish_Nemo_12B
- Demo en video: https://huggingface.co/SicariusSicariiStuff/Roleplay_Cards/resolve/main/Resources/Roleplay.mp4
