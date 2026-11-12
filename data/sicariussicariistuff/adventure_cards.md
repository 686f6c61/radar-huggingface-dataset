# SicariusSicariiStuff/Adventure_Cards

## Resumen

Adventure_Cards no es un modelo de lenguaje, sino un repositorio de character cards en formato de texto plano (SICAtxt) orientadas a experiencias de aventura abiertas con multiples personajes. Lo publica el usuario SicariusSicariiStuff en Hugging Face bajo licencia Apache 2.0 y esta pensado para importarse en frontends de rol (SillyTavern y similares) que interpretan tarjetas de personaje. Cada tarjeta describe un escenario, un world setting y los rasgos del usuario, de modo que el modelo de lenguaje subyacente (no incluido en el repo) reacciona a las acciones del jugador.

El formato SICAtxt (Simple, Inexpensive, Character Attributes plain-text) define una plantilla minima con campos como `Adventure`, `$World_Setting`, `$Scenario` y `{{user}}'s Traits`. Las tarjetas se distribuyen como imagenes PNG con los metadatos embebidos, de forma que la propia imagen actua como tarjeta importable. El repositorio incluye escenarios tematicos inspirados en Fallout: New Reno, Morrowind (gremio de magos, arena de Vivec, travesia de Seyda Neen a Balmora) y variantes con personajes concretos.

Su relevancia es practica para la comunidad de roleplay local: ofrece material listo para usar con modelos de 12B a 24B (los nombres de las rutas de descarga hacen referencia a Impish_Bloodmoon_12B, Sweet_Dreams_12B, Impish_Nemo_12B e Impish_Magic_24B), sin dependencia de servicios en la nube. No contiene pesos, tokenizador ni configuracion de inferencia; es exclusivamente contenido de prompting.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de lenguaje; es un repositorio de character cards en texto plano) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las tarjetas estan redactadas en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible; las tarjetas se distribuyen como PNG con metadatos embebidos y plantillas de texto plano SICAtxt |

## Arquitectura y entrenamiento

No aplica: el repositorio no contiene un modelo entrenado. La "arquitectura" del contenido es una plantilla de prompting denominada SICAtxt, compuesta por una linea de encabezado `Adventure: {{user}} is a ...`, seguida de bloques `$World_Setting`, `$Scenario` y `{{user}}'s Traits`. Esta estructura minimiza el consumo de tokens y evita instrucciones redundantes, lo que la hace compatible con modelos de contexto corto y con configuraciones de rol que reservan gran parte de la ventana para el historial de conversacion.

No hay datos de entrenamiento, dataset, RLHF ni DPO asociados. El repositorio ocupa 0.0 GB y su contenido son ficheros PNG y texto. La unica innovacion tecnica reseñable es el empaquetado de la tarjeta dentro de los metadatos EXIF/PNG de una imagen, un mecanismo habitual en la comunidad de SillyTavern que permite importar el personaje arrastrando el fichero de imagen.

## Capacidades

- Definicion de escenarios de aventura abierta con mundo reactivo a las acciones del usuario.
- Soporte de interacciones con multiples personajes dentro de un mismo escenario, segun indica la model card.
- Plantilla SICAtxt con campos separados para world setting, escenario y rasgos del usuario.
- Distribucion como PNG importable directamente en frontends de rol compatibles.
- Compatibilidad declarada con modelos de la familia Impish y Sweet Dreams (12B y 24B) a traves de las rutas de descarga referenciadas.
- No incluye tool calling, function calling, agentes, vision, audio ni modo thinking: son capacidades del modelo subyacente, no del repositorio.
- No se declaran capacidades multilingues; el contenido esta en ingles.

## Casos de uso

- Partidas de rol sandbox en local: importar una tarjeta PNG en SillyTavern y ejecutarla contra un modelo de 12B cuantizado en una GPU de consumo, sin coste por token.
- Prototipado de sistemas de mundo reactivo: usar la plantilla SICAtxt como base para disenar prompts de simulacion donde el entorno responde a las decisiones del jugador.
- Evaluacion comparativa de modelos de rol: al ser tarjetas ligeras y homogeneas, permiten medir la coherencia narrativa de distintos modelos (12B frente a 24B) sobre el mismo escenario.
- Creacion de contenido para comunidades de modding: los escenarios de Fallout y Morrowind sirven como punto de partida para aventuras derivadas con licencia Apache 2.0.
- Docencia sobre ingenieria de prompts: la estructura minimalista de SICAtxt ejemplifica como separar contexto de mundo, escenario y perfil de usuario en bloques explicitos.
- Generacion de material para streams o partidas grabadas: el widget del repositorio incluye un video de ejemplo (`Adventure.mp4`) que ilustra el flujo de juego.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio en si no requiere GPU: son ficheros de texto e imagen de tamano despreciable (0.0 GB).
- Los requisitos dependen del modelo subyacente con el que se juegue. Las rutas de descarga apuntan a modelos de 12B y 24B.
- Para un modelo de 12B en cuantizacion de 4 bits se estiman del orden de 7-8 GB de VRAM, lo que permite ejecucion en RTX 3060 de 12 GB, RTX 4070 o superiores. En 8 bits, alrededor de 13-14 GB, lo que exige RTX 4080/4090 o A100.
- Para un modelo de 24B en 4 bits se estiman unos 14-16 GB de VRAM, viable en RTX 4090 (24 GB) o A100 40 GB; en cuantizaciones mayores requiere GPU de datacenter.
- Opciones de despliegue habituales para el modelo subyacente: llama.cpp, Ollama, vLLM, TGI y frontends de rol como SillyTavern o KoboldCpp.
- No se dispone de datos de latencia ni throughput especificos de este repositorio.

## Comparativa con modelos similares

| Repositorio | Tipo de contenido | Formato | Licencia | Enfoque |
|---|---|---|---|---|
| Adventure_Cards (este) | Tarjetas de aventura multijugador | PNG + SICAtxt | Apache 2.0 | Aventura abierta con mundo reactivo |
| Roleplay_Cards (mismo autor) | Tarjetas de rol 1 a 1 | PNG + texto | no disponible en la informacion | Conversacion con un unico personaje |
| Repositorios de pesos tipo Impish_Bloodmoon_12B | Modelos de lenguaje | safetensors/GGUF | no disponible en la informacion | Generacion de texto y rol |
| Repositorios de pesos tipo Impish_Magic_24B | Modelos de lenguaje | safetensors/GGUF | no disponible en la informacion | Generacion de texto y rol |

La comparacion con modelos de lenguaje no es directa porque Adventure_Cards no contiene pesos. Frente a Roleplay_Cards, la diferencia declarada por el autor es el diseno para multiples personajes y mundo reactivo en lugar de dialogo uno a uno.

## Limitaciones y advertencias

- No es un modelo: no puede generar texto por si mismo; requiere un modelo de lenguaje externo para funcionar.
- El contenido esta en ingles; no se declaran otros idiomas.
- No hay informacion sobre sesgos, alineacion ni filtros de seguridad, ya que no se incluye modelo.
- Riesgo de alucinacion heredado del modelo subyacente que se use para interpretar las tarjetas.
- Los escenarios hacen referencia a franquicias de videojuegos (Fallout, Morrowind); la licencia Apache 2.0 cubre el texto de las tarjetas, pero no aclara el uso de marcas registradas de terceros.
- El repositorio se actualiza de forma continua segun el autor, por lo que el contenido puede cambiar sin versionado estable.
- No se especifican requisitos de contexto minimo; con modelos de contexto muy corto las tarjetas de aventura pueden consumir una parte significativa de la ventana.
- Sin garantias de mantenimiento ni soporte; 0 descargas y 7 likes en el momento de la consulta.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SicariusSicariiStuff/Adventure_Cards
- Repositorio de tarjetas de rol del mismo autor: https://huggingface.co/SicariusSicariiStuff/Roleplay_Cards
- Modelo referenciado Impish_Bloodmoon_12B: https://huggingface.co/SicariusSicariiStuff/Impish_Bloodmoon_12B
- Modelo referenciado Sweet_Dreams_12B: https://huggingface.co/SicariusSicariiStuff/Sweet_Dreams_12B
- Modelo referenciado Impish_Nemo_12B: https://huggingface.co/SicariusSicariiStuff/Impish_Nemo_12B
- Modelo referenciado Impish_Magic_24B: https://huggingface.co/SicariusSicariiStuff/Impish_Magic_24B
- Video de ejemplo del widget: https://huggingface.co/SicariusSicariiStuff/Adventure_Cards/resolve/main/Resources/Adventure.mp4
