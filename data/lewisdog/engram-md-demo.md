# lewisdog/engram-md-demo

## Resumen

Engram MD Demo es un repositorio experimental que implementa los denominados "cartuchos Engram": módulos de memoria factual desmontables basados en tablas de búsqueda n-grama con claves hash (estilo DeepSeek) que se montan sobre un modelo base congelado, en este caso Qwen/Qwen3-0.6B-Base. El proyecto, desarrollado por lewisdog, permite añadir conocimiento que el modelo base no posee (por ejemplo, resultados deportivos posteriores a su fecha de corte de entrenamiento) sin necesidad de reentrenar ni modificar los pesos originales. Los cartuchos se montan en milisegundos y se desmontan dejando el modelo base byte-idéntico.

La relevancia de esta propuesta radica en su enfoque de memoria externa plug-and-play: en lugar de ajustar finamente un modelo para incorporar hechos nuevos, se entrena un adaptador ligero (~50 millones de parámetros) que se acopla al modelo base y se ejecuta mediante una rama especial de llama.cpp o un fork de wllama en navegador. El repositorio incluye el modelo base en formato GGUF (F16), tres cartuchos de hechos (resultados de la Premier League 2024-25 y 2025-26, y poblaciones de las 16.000 mayores ciudades del mundo según GeoNames) y un adaptador LoRA de formato. La licencia es Apache-2.0, lo que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo base transformer (Qwen3-0.6B) + cartuchos de memoria n-grama con claves hash |
| Parametros totales | no disponible (el modelo base Qwen3-0.6B tiene ~0.6B; los adaptadores suman ~50,7M según safetensors) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base y del motor de inferencia) |
| Tipos de cuantizacion | F16 para el modelo base; los cartuchos se distribuyen en GGUF (cuantizacion no especificada) |
| Idiomas soportados | no disponible (el modelo base Qwen3-0.6B soporta multilingue, pero los cartuchos contienen hechos en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (modelo base y cartuchos) |

## Arquitectura y entrenamiento

El sistema no es un modelo de lenguaje autonomo, sino un conjunto de modulos de memoria externa disenados para acoplarse a un modelo base congelado. Los cartuchos son tablas de búsqueda n-grama con claves hash (similar al enfoque de DeepSeek para memorias externas) que almacenan pares consulta-respuesta en formato exacto. El modelo base, Qwen3-0.6B-Base, es un transformer de 0.6 mil millones de parametros desarrollado por Alibaba, con arquitectura estandar y soporte multilingue. Los cartuchos se entrenan contra el modelo base (o contra el modelo base fusionado con un adaptador LoRA de formato, como en el caso de los cartuchos de futbol) para producir la respuesta correcta ante una consulta exacta. El entrenamiento no modifica los pesos del modelo base; los cartuchos se montan dinamicamente en tiempo de inferencia. El adaptador LoRA incluido (format-lora-2324) se entrena para controlar el formato de respuesta y los criterios de parada, usando datos de la temporada 2023-24 de la Premier League.

## Capacidades

- Recuerdo exacto de hechos concretos: los cartuchos devuelven respuestas literales con alta precision (97,9% para resultados de futbol, 100% para poblaciones de ciudades en una muestra de 200 casos).
- Montaje y desmontaje dinamico: los cartuchos se pueden acoplar al modelo base en milisegundos y retirarse sin dejar rastro, lo que permite alternar entre diferentes conjuntos de conocimiento.
- Compatibilidad con llama.cpp (rama engram) y wllama (fork para navegador), lo que permite ejecucion local en CPU y en entornos web.
- Integracion con un adaptador LoRA de formato para controlar la estructura de las respuestas.
- No incluye capacidades de razonamiento, generacion de codigo, tool calling ni vision; estas dependen exclusivamente del modelo base.

## Casos de uso

- Actualizacion de conocimiento factual post-entrenamiento: un modelo desplegado puede incorporar resultados deportivos, datos demograficos o cualquier hecho estructurado sin reentrenar, simplemente montando un cartucho actualizado.
- Sistemas de preguntas y respuestas sobre dominios cerrados: por ejemplo, un asistente que necesite responder con exactitud sobre una liga deportiva concreta o una base de datos de ciudades, usando consultas en formato exacto.
- Pruebas de memoria externa en entornos de recursos limitados: al ser un adaptador ligero (~50M parametros) sobre un modelo de 0.6B, puede ejecutarse en CPU o en navegador, ideal para prototipos o dispositivos sin GPU.
- Investigacion en arquitecturas de memoria modular: el repositorio sirve como banco de pruebas para estudiar como anadir conocimiento a modelos congelados sin alterar sus pesos.
- Demostraciones educativas: el manifiesto `engram.md` y los ejemplos de `demo-facts.json` permiten entender el flujo de consulta-respuesta con memorias externas.
- Composicion de multiples cartuchos: al ser modulos independientes, se pueden combinar varios cartuchos (futbol, ciudades, etc.) sobre el mismo modelo base para ampliar su conocimiento factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento reportado es la precision de recuerdo de los cartuchos:

| Cartucho | Precision de recuerdo |
|---|---|
| Premier League 2024-25 (380 partidos) | 97,9% |
| Premier League 2025-26 (380 partidos) | 97,9% |
| Ciudades del mundo (16.000, muestra de 200) | 100% |

Estos valores corresponden a la capacidad de los cartuchos para devolver la respuesta exacta ante una consulta en el formato definido en `engram.md`. No hay comparaciones con otros modelos porque no se trata de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada: no requiere GPU para los cartuchos; el modelo base en F16 ocupa ~1,2 GB en memoria. Con cuantizacion del modelo base (no incluida en el repo) se podria reducir.
- GPU recomendadas: ninguna; el sistema esta pensado para CPU (llama.cpp) e incluso para navegador via wllama.
- Compatibilidad con consumer GPU: no necesaria, pero si se usa con un motor como llama.cpp en GPU, cualquier tarjeta con al menos 2 GB de VRAM seria suficiente para el modelo base en F16.
- Opciones de despliegue: llama.cpp (rama engram), wllama (navegador), o cualquier motor que soporte el formato GGUF y la logica de montaje de cartuchos.
- Latencia y throughput: no disponibles, pero al ser un modelo de 0.6B con adaptadores ligeros, se espera una latencia baja en CPU moderna (del orden de decenas de tokens por segundo).

## Comparativa con modelos similares

No disponible. No existen modelos comparables en el ecosistema que implementen exactamente este enfoque de cartuchos de memoria n-grama sobre un modelo base congelado. Como referencia, otras tecnicas de memoria externa como RAG (recuperacion aumentada) o bases vectoriales (por ejemplo, los proyectos Engram.so o Engram sobre Sui) abordan el mismo problema de anadir conocimiento sin reentrenar, pero usan arquitecturas diferentes (recuperacion por similitud vectorial en lugar de tablas hash) y no son directamente comparables en rendimiento ni en formato.

## Limitaciones y advertencias

- El modelo no es un chatbot ni un asistente conversacional por si mismo; solo funciona con el formato de consulta exacto definido en `engram.md`. Fuera de ese formato, la utilidad es nula.
- Los cartuchos solo almacenan hechos puntuales; no hay capacidad de razonamiento, inferencia o generalizacion mas alla de lo memorizado.
- La precision de recuerdo (97,9% en futbol) no es perfecta; en produccion habria que validar los fallos residuales.
- El modelo base Qwen3-0.6B es pequeno (0.6B) y puede presentar sesgos o alucinaciones en tareas generales; los cartuchos no corrigen estos problemas.
- La licencia Apache-2.0 permite uso comercial, pero los datos de terceros (football-data.co.uk, GeoNames CC-BY 4.0) tienen sus propias condiciones de atribucion y redistribucion.
- El repositorio tiene 0 descargas y 0 likes; es un proyecto experimental sin mantenimiento garantizado ni soporte comunitario.
- La rama "engram" de llama.cpp y el fork de wllama son necesarios para ejecutar los cartuchos; no son versiones oficiales y podrian no estar actualizadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lewisdog/engram-md-demo
- Repositorio aoa-engram (mencionado en la model card): https://github.com/trunksio
- Modelo base Qwen3-0.6B-Base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Datos de futbol: https://www.football-data.co.uk/
- Datos de poblaciones: https://www.geonames.org/
