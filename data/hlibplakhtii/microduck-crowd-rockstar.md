# HlibPlakhtii/microduck-crowd-rockstar

## Resumen

Microduck-crowd-rockstar es una política de control para robótica presentada como entrada en el evento MicroDuck Got a Talent, un concurso de coreografías simuladas con el robot cuadrúpedo MicroDuck. El modelo lo publica HlibPlakhtii y se distribuye como adaptación del controlador de jrubiosainz/microduck-game-staircase-pyramid: la red de control ONNX es idéntica al modelo base, mientras que la aportación propia consiste en una partitura musical original, diseño sonoro, dos patos fans adicionales y su coreografía de cabeza y animación. El conjunto ejecuta una actuación de 20 segundos con ocho patos: cinco forman una escalera viva, el líder sube, se mantiene en pie y arranca su solo a los 12 segundos.

La relevancia del modelo es acotada y muy específica: no es un modelo de lenguaje ni un sistema de propósito general, sino un artefacto de simulación para el ecosistema MicroDuck de Pollen Robotics, validado con MuJoCo 3.10.0 y ONNX Runtime 1.24.4 bajo el evaluador oficial del evento. El autor advierte explícitamente de que se trata de un rendimiento en simulación dentro de muestra (in-sample) y de que no es un controlador apto para un robot físico. El repositorio es de tamaño prácticamente nulo (0.0 GB) y acumula 11 descargas, lo que refleja su naturaleza de entrega de concurso más que de modelo reutilizable.

No se dispone de información sobre arquitectura de red, número de parámetros, longitud de contexto ni idiomas soportados, porque la model card no describe la topología interna de la política ONNX. Cualquier evaluación de sus capacidades debe ceñirse a lo declarado: locomoción simulada, coordinación multiagente y sincronización con audio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control neuronal exportada a ONNX (topología interna no disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red de control. Se sabe que el controlador ONNX es exactamente el del modelo base jrubiosainz/microduck-game-staircase-pyramid, que aporta la red de escalada, la tabla de corrección, el controlador de reverencia, las poses y la coreografía original de seis patos. Sobre esa base, esta entrada añade una capa de autoría propia compuesta por la partitura musical, los ajustes de voz, dos patos fans con su coreografía de cabeza y animación, y la integración temporal para que el solo del líder empiece tras la escalada. Los scripts make_rockstar.py y prototype-config.json conservan los ajustes de generación, y la versión aprobada usa amplitud=0 y carry=0.

No se indican datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF o DPO, algo esperable en una política de robótica y no en un modelo generativo de texto. La validación se realizó con el evaluador oficial del evento, MuJoCo 3.10.0 y ONNX Runtime 1.24.4, y el autor subraya que el resultado del servidor es el autoritativo. La innovación técnica declarada es la integración de una actuación multiagente de ocho patos con sincronización musical, no una mejora del controlador subyacente.

## Capacidades

- Control de locomoción simulada para el robot MicroDuck dentro del entorno Arena.
- Ejecución de una coreografía de escalada en la que cinco patos forman una plataforma viva y el líder asciende hasta la cima.
- Mantenimiento de una plataforma estable durante la actuación; el autor no reclama un truco de crowd-surf en movimiento completado.
- Sincronización temporal con una partitura musical de 20 segundos, con inicio del solo del líder a los 12 segundos.
- Reproducción de una melodía pentatónica original con acompañamiento de bajo, notas rítmicas de pato y voces sintetizadas.
- Coordinación de dos patos fans adicionales con coreografía de cabeza y animación desde los laterales.
- Integración con el pipeline de evaluación oficial del evento MicroDuck Got a Talent.
- No se declaran capacidades de tool calling, function calling, razonamiento multi-paso, multilingüismo, visión, audio de entrada ni modo de pensamiento.

## Casos de uso

- Demostración de coreografía multiagente en simulación: el modelo sirve para reproducir una actuación coordinada de ocho agentes en MuJoCo, útil como referencia para estudiar sincronización temporal entre políticas de control y eventos de audio.
- Evaluación comparativa en el marco del evento MicroDuck Got a Talent: permite replicar la entrada bajo el evaluador oficial y comprobar la métrica de caídas y tiempo en pie declarada por el autor.
- Estudio de composición de políticas: al conservar intacto el controlador ONNX del modelo base, facilita analizar cómo una capa de presentación (música, fans, tiempos) se superpone a una política de locomoción existente sin modificarla.
- Generación de contenido audiovisual sintético: la partitura y el diseño sonoro permiten producir una pieza de 20 segundos con voces sintetizadas y movimiento coordinado, reutilizable en demos o material divulgativo del ecosistema MicroDuck.
- Base para experimentos de escalada cooperativa: la coreografía de escalera viva puede servir como punto de partida para investigar formación de estructuras de apoyo entre robots simulados.
- Docencia en robótica simulada: el repositorio incluye timeline.json, make_rockstar.py y prototype-config.json, lo que permite reproducir la generación de la actuación paso a paso con fines formativos.
- Prueba de integración de ONNX Runtime en pipelines de simulación: al depender de ONNX Runtime 1.24.4 y MuJoCo 3.10.0, es un caso concreto para validar versiones y compatibilidad de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento declarado es la validación local bajo el evaluador oficial: 20 segundos completos con ocho patos y ninguna caída según la regla de caída del evaluador, con el líder en pie durante 19,7 segundos. El autor califica este resultado como rendimiento en simulación dentro de muestra y remite al resultado del servidor como autoritativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB y no se detalla el tamaño del grafo ONNX.
- GPU recomendadas: no disponible; al ser una política ONNX de robótica simulada, la carga recae principalmente en el simulador MuJoCo más que en la inferencia de la red.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; la validación se realizó con ONNX Runtime 1.24.4, que puede ejecutarse en CPU o GPU.
- Opciones de despliegue: ONNX Runtime 1.24.4 junto con MuJoCo 3.10.0, conforme a la validación declarada. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Controlador | Licencia | Relación |
|---|---|---|---|---|
| HlibPlakhtii/microduck-crowd-rockstar | Política de control ONNX para MicroDuck | Idéntico al del modelo base | Apache 2.0 | Añade música, fans y tiempos |
| jrubiosainz/microduck-game-staircase-pyramid | Política de control ONNX para MicroDuck | Red de escalada, tabla de corrección y coreografía de seis patos | No disponible en la información proporcionada | Modelo base del que deriva esta entrada |
| Otros modelos de la familia MicroDuck | Políticas de control para el mismo robot | No disponible | No disponible | No se dispone de datos comparativos |

No se dispone de información sobre parámetros, contexto ni rendimiento numérico de los modelos comparados, por lo que la comparación se limita a la relación de derivación y a la licencia.

## Limitaciones y advertencias

- El propio autor declara que es un rendimiento en simulación dentro de muestra y que no es un controlador para uso en un robot físico.
- No reclama un truco de crowd-surf en movimiento completado; la versión mantiene una plataforma estable, no una multitud en movimiento.
- El controlador ONNX no introduce mejoras respecto al modelo base; la aportación se limita a la capa musical y de presentación.
- No se documentan sesgos, riesgo de alucinación ni limitaciones de idioma porque el modelo no es lingüístico; esos criterios no aplican.
- La licencia Apache 2.0 permite uso comercial, pero se conservan el LICENSE y NOTICE upstream, por lo que deben respetarse las atribuciones a jrubiosainz y a Pollen Robotics.
- La autoría de la partitura y el diseño sonoro se preparó con asistencia de IA, según declara el autor.
- El resultado del servidor del evento es el autoritativo; la validación local no garantiza la misma puntuación en la evaluación oficial.
- El repositorio tiene un tamaño de 0.0 GB y 11 descargas, sin soporte ni mantenimiento documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HlibPlakhtii/microduck-crowd-rockstar
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-staircase-pyramid
- Revisión del modelo base citada en la model card: https://huggingface.co/jrubiosainz/microduck-game-staircase-pyramid/tree/fa250b6b76e5498311efdced3c69d0fba4b19ffe
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
