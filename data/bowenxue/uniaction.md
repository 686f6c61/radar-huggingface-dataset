# BowenXue/UniAction

## Resumen

UniAction es un conjunto de adaptadores de acondicionamiento por accion (action conditioning) para modelos del mundo basados en video, desarrollado por Bowen Xue, Zizhang Li, Hong-Xing Yu y Jiajun Wu. Se publica como un fine-tune del backbone de generacion de video imagen-a-video Wan2.2-I2V-A14B de Wan-AI, sobre el que se anaden modulos que permiten condicionar la generacion en cuatro modalidades de accion distintas: fuerza, control de camara, pose de mano y pose de robot. El objetivo es unificar en un unico modelo del mundo la respuesta a senales de control heterogeneas, algo que habitualmente requiere modelos separados por dominio.

El modelo resuelve el problema de disponer de un world model generalista capaz de simular consecuencias visuales de acciones fisicas y de camara, util para planificacion, robotica y generacion de video controlable. La relevancia actual radica en que reutiliza un backbone de difusion de video ya entrenado a gran escala (Wan2.2-I2V-A14B) y solo anade adaptadores, reduciendo el coste de entrenamiento frente a un modelo desde cero.

La informacion publicada es escasa: el repositorio ocupa 2,0 GB y contiene los pesos `stage1.safetensors`, `stage2.safetensors` y `release.json`, que deben descargarse junto al backbone original de Wan. No se detallan en la model card el numero de parametros de los adaptadores, la longitud de contexto en frames ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores de action conditioning sobre backbone de difusion de video Wan2.2-I2V-A14B (imagen-a-video) |
| Parametros totales | no disponible (repo de 2,0 GB; el backbone Wan2.2-I2V-A14B se descarga por separado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (generacion de video; numero de frames no especificado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 (adaptadores); el backbone Wan conserva su licencia original |
| Formato de pesos | safetensors (`stage1.safetensors`, `stage2.safetensors`) + `release.json` |

## Arquitectura y entrenamiento

UniAction se construye como un fine-tune del modelo Wan2.2-I2V-A14B, un generador de video imagen-a-video basado en difusion. Sobre ese backbone se anaden adaptadores que inyectan cuatro tipos de senal de accion: fuerza (force), control de camara, pose de mano y pose de robot. La publicacion se organiza en dos etapas (`stage1` y `stage2`), cuyos pesos se distribuyen como ficheros safetensors independientes, lo que sugiere un entrenamiento por fases, aunque la model card no describe el procedimiento con detalle.

Los datos de entrenamiento provienen de las fuentes EgoDex, Goal Force, DROID y SolarWM, segun indica la model card, y se publican conjuntos de entrenamiento (`BowenXue/UniAction-Train`) y evaluacion (`BowenXue/UniAction-Eval`) en HuggingFace. No se especifica el numero de tokens, horas de video ni la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de video imagen-a-video condicionada por accion, partiendo de una imagen inicial.
- Acondicionamiento por fuerza: simulacion de efectos fisicos asociados a la aplicacion de fuerza.
- Acondicionamiento por control de camara: generacion de trayectorias de camara especificadas.
- Acondicionamiento por pose de mano: control de movimiento de manos en la escena generada.
- Acondicionamiento por pose de robot: simulacion de acciones de robot para world models en robotica.
- Modelo del mundo: predice la evolucion visual del entorno ante acciones, util para planificacion.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada.
- Capacidades multilingues: no aplica; el modelo es de generacion de video y la metadata declara solo ingles.
- Capacidades especiales: modo thinking, vision o audio no documentados.

## Casos de uso

- Robotica y manipulacion: el modelo permite simular la respuesta visual de un entorno ante poses de robot, lo que sirve para evaluar politicas de control antes de desplegarlas en hardware real y reducir el coste de pruebas fisicas.
- Planificacion con world models: dado que condiciona la generacion en fuerza y pose, puede usarse para predecir consecuencias de acciones candidatas y alimentar bucles de planificacion en agentes embodied.
- Generacion de video controlable para cine y previsualizacion: el control de camara permite generar tomas con trayectorias definidas a partir de una imagen inicial, agilizando el storyboard y la previsualizacion.
- Simulacion de interacciones fisicas: el acondicionamiento por fuerza facilita generar escenas donde se aplican fuerzas sobre objetos, util para entrenamiento de percepcion fisica o sintesis de datos.
- Aumento de datos para aprendizaje por imitacion: los datasets EgoDex y DROID apuntan a escenarios de manipulacion; el modelo puede generar variaciones sinteticas de demostraciones para ampliar corpus de entrenamiento.
- Investigacion en world models: al unificar cuatro modalidades de accion en un mismo backbone, sirve como banco de pruebas para estudiar transferencia entre dominios de control (mano, robot, camara, fuerza).
- Generacion de video para entornos simulados de evaluacion: con el conjunto `UniAction-Eval` publicado, permite reproducir experimentos y comparar variantes de acondicionamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio de adaptadores ocupa 2,0 GB, pero el backbone Wan2.2-I2V-A14B se descarga aparte y su huella de memoria no se detalla en la model card.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; depende del backbone Wan2.2-I2V-A14B, cuyos requisitos no se especifican aqui.
- Opciones de despliegue: la model card remite al ejemplo de inferencia del repositorio de codigo (https://github.com/KBRASK/UniAction#inference); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de difusion de video.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UniAction | no disponible (adaptadores sobre Wan2.2-I2V-A14B) | no disponible | Adaptadores de accion sobre difusion de video | apache-2.0 (adaptadores) | HuggingFace |
| Wan2.2-I2V-A14B | no disponible en esta ficha | no disponible | Difusion imagen-a-video | licencia original de Wan | HuggingFace |
| Otros world models con acondicionamiento por accion | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al entrenarse con datasets de robotica y egocentricos (EgoDex, DROID, SolarWM, Goal Force), es probable que herede sesgos de dominio, pero no se cuantifican.
- Riesgo de alucinacion visual: como modelo generativo de difusion, puede producir escenas fisicamente plausibles pero incorrectas; no se documentan metricas de fidelidad.
- Limitaciones de contexto e idioma: solo se declara soporte de ingles en la metadata; no se especifica el numero de frames ni resolucion soportada.
- Restricciones de licencia: los adaptadores son Apache 2.0, pero el backbone Wan conserva su licencia original y las fuentes de entrenamiento (EgoDex, Goal Force, DROID, SolarWM) mantienen sus propios terminos, lo que puede condicionar el uso comercial.
- Dependencia del backbone: requiere descargar por separado Wan2.2-I2V-A14B y seguir el ejemplo de inferencia del repositorio; no es un modelo autonomo.
- Madurez: el repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una validacion comunitaria muy limitada.
- Ausencia de benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.

## Enlaces

- HuggingFace: https://huggingface.co/BowenXue/UniAction
- Paper: https://arxiv.org/abs/2610.32977
- Project page: https://uniaction.github.io/
- Codigo: https://github.com/KBRASK/UniAction
- Ejemplo de inferencia: https://github.com/KBRASK/UniAction#inference
- Dataset de entrenamiento: https://huggingface.co/datasets/BowenXue/UniAction-Train
- Dataset de evaluacion: https://huggingface.co/datasets/BowenXue/UniAction-Eval
- Backbone: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
