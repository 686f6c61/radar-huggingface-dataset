# djduecaster/dfreq-sprint-action-rate-20261110

## Resumen

SprintActionRate es un controlador neuronal experimental publicado en Hugging Face por el usuario djduecaster dentro del contexto del proyecto microduck-arena, una iniciativa de evaluacion de politicas de control para robotica. El modelo no es un modelo de lenguaje: se trata de una politica de control que transforma observaciones de 61 dimensiones en acciones de 14 dimensiones, pensada para tareas de locomocion o control de un robot simulado (probablemente un cuadrupedo o humanoide de 14 actuadores) a una frecuencia de 50 Hz. Su funcion es atenuar suavemente los cambios de accion que superan 0.5 radianes respecto a la accion anterior, con una ganancia de 0.15, limitando las reversiones bruscas de los objetivos de control mediante realimentacion de observaciones.

El modelo se distribuye unicamente en formato ONNX con pesos en float32 y un grafo de operadores estandar (sin tensores externos), lo que facilita su despliegue en entornos de inferencia ligeros. La model card indica que se trata de una rama experimental de un modelo padre (SHA256 1b879832...) y que no sustituye a los registros de mejores marcas existentes. Se declara explicitamente que la evaluacion se ha realizado solo en simulacion sobre Apple Silicon, sin pruebas en robot fisico ni afirmaciones de seguridad.

La relevancia de esta ficha es limitada: el repositorio tiene 0 descargas y 0 likes, no declara licencia ni idiomas, y el tamano del repo es practicamente nulo (0.0 GB segun el Hub), lo que sugiere que los pesos podrian no estar publicados o ser de muy pocos kilobytes. Se documenta aqui como artefacto de investigacion reproducible, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feed-forward (no se especifica capas ni activaciones); entrada obs[1,61], salida actions[1,14] |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es modelo de lenguaje; ventana de observacion de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible; pesos en float32 |
| Idiomas soportados | no disponible (no es modelo linguistico) |
| Licencia | no disponible (la model card indica que se retienen los derechos heredados del modelo padre sin licencia global nueva) |
| Formato de pesos | ONNX (float32) |
| Frecuencia de control | 50 Hz |
| SHA256 del modelo | 728a09971bb20201ae02039c929cdb54d7ac80a709f0a77c694e1b4548a17fb5 |
| SHA256 del modelo padre | 1b879832d77d1208bc988defcd5f034b1fbedcd090ac51aa5d0c16a88ec94371 |
| Revision fuente nativa | 9bf04c0668145528035c8a315d5d8ae2530c1279 (runner version 5) |

## Arquitectura y entrenamiento

La informacion disponible no describe la topologia interna de la red (numero de capas, unidades ocultas, funcion de activacion ni funcion de perdida). Lo que si se especifica es la interfaz: un grafo ONNX que recibe un tensor de observaciones de forma [1,61] y produce un tensor de acciones de forma [1,14], ejecutandose a 50 Hz. El modelo incorpora una capa de atenuacion sobre los cambios de accion: cuando la diferencia respecto a la accion previa supera 0.5 radianes, se aplica una ganancia de 0.15 para suavizar la transicion. Esta atenuacion utiliza realimentacion de observaciones y no requiere reloj, estado de controlador externo, tablas de consulta, semillas, posicion, orientacion ni observaciones privilegiadas del simulador.

Respecto al entrenamiento, la model card no aporta datos sobre numero de episodios, tokens, composicion del dataset ni uso de RLHF o DPO (tecnicas no aplicables a este dominio). Se menciona que la rama parte de un modelo padre y que "mejoro la fiabilidad en arranque en frio de 676/1.024 a 841/1.024 con comando 1.15", lo que sugiere una evaluacion con 1.024 episodios de arranque en frio. El barrido local oficial es de 0.961 s, 2 ms mas lento que su linea base, y el autor declara explicitamente que no reclama mejora de velocidad.

## Capacidades

- Control de robot simulado: genera acciones de 14 dimensiones a partir de observaciones de 61 dimensiones a 50 Hz.
- Atenuacion de reversiones bruscas: limita los cambios de accion superiores a 0.5 radianes con ganancia 0.15.
- Realimentacion basada en observaciones: la accion depende del estado observado, sin estado interno ni reloj.
- Inferencia ONNX estandar: compatible con runtimes ONNX (onnxruntime, etc.) sin operadores personalizados ni tensores externos.
- Reproducibilidad: SHA256 del modelo y del padre publicados, junto con la revision fuente nativa.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues (no es un modelo de lenguaje).

## Casos de uso

- Investigacion en control de robots simulados: el modelo puede integrarse en un bucle de simulacion a 50 Hz para evaluar politicas de control con atenuacion de reversiones, comparando su comportamiento frente al modelo padre.
- Reproduccion de experimentos de microduck-arena: dado que se publican los SHA256 y la revision fuente, un investigador puede reproducir el barrido local (0.961 s) y verificar la mejora de arranque en frio de 676/1.024 a 841/1.024.
- Pruebas de robustez en arranque en frio: el modelo esta disenado para mejorar la fiabilidad en condiciones de arranque, por lo que resulta adecuado para experimentos que midan la consistencia inicial de una politica de control.
- Integracion en pipelines ONNX de bajo coste: al ser un grafo float32 de operadores estandar, puede desplegarse en entornos con onnxruntime en CPU o GPU sin dependencias pesadas.
- Estudio de tecnicas de suavizado de acciones: la capa de atenuacion con ganancia 0.15 y umbral 0.5 rad sirve como referencia para comparar metodos de limitacion de cambios bruscos en control.
- Docencia y experimentacion con politicas de control: util como ejemplo minimo de politica neuronal con interfaz bien definida (obs[1,61] -> actions[1,14]) para cursos o talleres de robotica simulada.

## Benchmarks y rendimiento

La model card proporciona metricas de evaluacion local, no benchmarks estandar de la comunidad:

| Metrica | Valor |
|---|---|
| Fiabilidad en arranque en frio (comando 1.15) | 841/1.024 (frente a 676/1.024 del modelo previo) |
| Barrido local oficial | 0.961 s (2 ms mas lento que la linea base) |
| Frecuencia de control | 50 Hz |
| Mejora de velocidad declarada | ninguna (el autor no reclama mejora de velocidad) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo es un grafo ONNX float32 con entrada [1,61] y salida [1,14], por lo que su huella es minima (probablemente inferior a unos pocos MB), aunque el tamano exacto no se publica.
- GPU recomendadas: no se especifican; cualquier GPU con soporte ONNX Runtime es suficiente. El autor realizo la evaluacion en simulacion sobre Apple Silicon.
- Compatibilidad con GPU de consumo: si, previsiblemente cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso CPU, dado el reducido tamano de la interfaz.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), TensorRT (previa conversion), o cualquier runtime compatible con ONNX. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no se publican cifras de latencia por inferencia; solo el tiempo de barrido local (0.961 s) y la frecuencia de control de 50 Hz, que implica un presupuesto de 20 ms por paso.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (controladores neuronales para microduck-arena u otras politicas de control con interfaz obs[1,61] -> actions[1,14]). El unico punto de referencia es el modelo padre (SHA256 1b879832...), del que no se detallan parametros, contexto ni licencia.

## Limitaciones y advertencias

- Solo simulacion: no se ha probado en robot fisico ni se reclama seguridad fisica; la publicacion y la evaluacion en Arena no establecen seguridad para robots reales.
- Licencia no disponible: la model card indica que se retienen los derechos heredados del modelo padre sin una licencia global nueva, lo que impide confirmar si el uso comercial esta permitido.
- Sin garantia de puntuaciones en la nube: la simulacion local en Apple Silicon no garantiza los resultados del entorno alojado, la elegibilidad por duplicados ni los puntos.
- Fiabilidad limitada: 841/1.024 en arranque en frio implica que aproximadamente el 18 % de los episodios no alcanzan el criterio de exito en esa prueba.
- Sin mejora de velocidad: el barrido local es 2 ms mas lento que la linea base; no debe usarse como optimizacion de rendimiento.
- Tests incompletos: el pytest completo del upstream no se ejecuto por ausencia de pytest en el interprete existente; solo se realizaron comprobaciones directas y evaluaciones en simulador.
- Sin datos de sesgo, alucinacion ni idioma: no aplica en el sentido habitual, pero tampoco se documenta el comportamiento fuera del dominio de observaciones previsto.
- Repositorio vacio o casi vacio: 0 descargas, 0 likes y 0.0 GB de tamano sugieren que los pesos podrian no estar accesibles o ser triviales; verificar antes de cualquier uso.
- No apto para produccion sin validacion: se trata de una rama experimental de investigacion, no de un artefacto estable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/djduecaster/dfreq-sprint-action-rate-20261110
- Model card del autor (incluida en el repositorio, con creditos y upstream-base-card.md referenciado)
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
