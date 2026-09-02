# SnowflakeWang/CustomX

## Resumen

CustomX es un modelo de mundo de video (video world model) presentado en ECCV 2026 que unifica la personalización de personajes, acciones y escenas mediante condicionamiento de activos 3D. Desarrollado por SnowflakeWang, el modelo aborda el problema de adaptar contenido generativo de video a elementos específicos definidos por el usuario, como un personaje concreto, una acción determinada o un entorno particular, todo ello dentro de un único marco unificado. Su relevancia radica en que los sistemas anteriores solían tratar cada tipo de personalización por separado, mientras que CustomX integra las tres dimensiones en un solo pipeline, lo que permite generar videos coherentes donde el personaje, la acción y el escenario se controlan simultáneamente.

La arquitectura exacta, el número de parámetros y la longitud de contexto no se han publicado en la información disponible. El proyecto se distribuye bajo licencia CC BY-SA 4.0 y cuenta con una página de proyecto, un repositorio de GitHub y un artículo en arXiv, aunque el modelo en sí no parece estar publicado en Hugging Face con pesos descargables (la entrada tiene cero descargas y cero likes). Se trata de una investigación académica más que de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Video world model con condicionamiento de activos 3D (detalles no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (aplica a video, no a texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | no disponible (no se han publicado pesos) |

## Arquitectura y entrenamiento

La información publicada indica que CustomX es un video world model que unifica la personalización de personajes, acciones y escenas mediante condicionamiento de activos 3D. Esto sugiere que el modelo integra representaciones tridimensionales de los elementos a personalizar (personaje, acción, escena) como condiciones para la generación de video. No se han publicado detalles sobre la arquitectura interna (si es un transformer, un modelo de difusión, o una combinación), ni sobre el proceso de entrenamiento, el número de tokens de video utilizados, o si se emplearon técnicas de RLHF o DPO. El artículo en arXiv (2512.17796) es la fuente principal, pero su contenido completo no está disponible en los resultados de búsqueda.

## Capacidades

- Generación de video personalizado: permite especificar un personaje, una acción y una escena concretos para generar videos coherentes con esos elementos.
- Condicionamiento 3D: utiliza activos 3D como condición, lo que sugiere que puede manejar geometría y pose de forma más precisa que los métodos basados solo en texto o imágenes.
- Unificación de personalización: integra tres tipos de personalización (personaje, acción, escena) en un solo marco, en lugar de tratarlos por separado.
- Aplicación a world models: al ser un video world model, puede predecir y generar secuencias de video futuras, lo que es útil para simulación y planificación.
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso, ni soporte multilingüe, ya que no es un modelo de lenguaje.

## Casos de uso

- Creación de contenido audiovisual personalizado: un estudio de animación puede generar clips donde un personaje específico (diseñado en 3D) realiza una acción concreta en un escenario determinado, sin necesidad de rodar o animar manualmente cada toma.
- Prototipado de escenas para cine y videojuegos: los directores pueden previsualizar secuencias con personajes y entornos personalizados antes de la producción final, reduciendo costes de iteración.
- Simulación de entornos para robótica: al ser un world model, puede generar trayectorias de video de un agente (personaje) ejecutando acciones en escenas personalizadas, útil para entrenar políticas de control en entornos sintéticos.
- Publicidad y marketing: las marcas pueden generar videos promocionales donde su producto o mascota (personaje 3D) interactúa en escenarios personalizados, adaptando el mensaje a diferentes audiencias.
- Educación y formación: se pueden crear videos didácticos con personajes y escenarios específicos para explicar conceptos, procedimientos o simulaciones de forma visual y controlada.
- Investigación en world models: sirve como base para estudiar cómo integrar condiciones 3D en modelos generativos de video, y para comparar con otros enfoques de personalización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo de arXiv podría contener métricas, pero no se han extraído en los resultados de búsqueda. No se pueden proporcionar números de rendimiento sin riesgo de inventar datos.

## Requisitos de hardware

No se han publicado requisitos de hardware específicos para CustomX. Al tratarse de un modelo de video world model, es probable que requiera GPUs de alta gama (A100, H100 o similares) para entrenamiento e inferencia, pero no hay datos confirmados. Tampoco se conocen opciones de despliegue (vLLM, llama.cpp, etc.) porque no se han liberado pesos ni implementaciones de inferencia optimizadas.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar CustomX con otros modelos de personalización de video. En los resultados de búsqueda aparecen proyectos como VerseCrafter (video world model con control geométrico 4D) y ShotVerse, pero no se han encontrado comparativas directas ni datos de rendimiento que permitan una tabla objetiva. Se recomienda consultar el artículo de arXiv para posibles comparaciones con métodos anteriores.

## Limitaciones y advertencias

- No se han publicado pesos del modelo: la entrada de Hugging Face no contiene archivos descargables, por lo que no es posible utilizarlo directamente.
- Licencia CC BY-SA 4.0: permite uso comercial y modificación, pero las obras derivadas deben compartirse bajo la misma licencia. Esto puede ser restrictivo para integraciones en productos propietarios.
- Sin documentación de sesgos o alucinaciones: al ser un modelo de video, los riesgos típicos de los LLM (alucinación textual) no aplican directamente, pero puede generar videos con inconsistencias visuales o físicas.
- Sin datos de rendimiento: no se pueden evaluar la calidad de generación ni los requisitos de cómputo sin benchmarks publicados.
- Proyecto de investigación: al ser un trabajo académico (ECCV 2026), es probable que no esté optimizado para producción y que carezca de soporte o mantenimiento activo.

## Enlaces

- Hugging Face: https://huggingface.co/SnowflakeWang/CustomX
- GitHub: https://github.com/snowflakewang/CustomX
- Página del proyecto: https://snowflakewang.github.io/CustomX_Page/
- Artículo arXiv: https://arxiv.org/abs/2512.17796
