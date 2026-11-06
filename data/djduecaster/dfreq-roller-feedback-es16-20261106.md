# djduecaster/dfreq-roller-feedback-es16-20261106

## Resumen

dfreq-roller-feedback-es16-20261106 es un checkpoint de investigacion publicado por el usuario djduecaster en HuggingFace, orientado a control de robots simulados dentro del ecosistema Microduck Arena. Se trata de una cabeza de retroalimentacion latente ("latent-feedback head") de 126 parametros entrenada mediante una estrategia de evolucion antithetica sin derivadas (derivative-free antithetic evolution strategy), que anade correcciones acotadas sobre un backbone neuronal congelado denominado Pollen, junto con un adaptador de estado fisico previo. No es un modelo de lenguaje ni un transformer generativo: es un controlador de politica para una tarea concreta de robótica simulada.

El checkpoint corresponde al evento `roller-sprint-2m`, con un comando externo fijo de 1.0 y accesorios de tipo "rollers". La interfaz es extremadamente compacta: entrada `[1,61]` y salida `[1,14]`, en formato ONNX float32, con una frecuencia de control de 50 Hz. El repositorio tiene un tamano practicamente nulo (0.0 GB) y no registra descargas ni likes en el momento de la consulta, lo que es coherente con un artefacto de investigacion archivado y no con un modelo de proposito general.

Su relevancia es acotada: sirve como registro reproducible de una generacion concreta (generacion 16) de un proceso de optimizacion evolutiva aplicado a control de rollers, con validacion local documentada. El propio autor indica que no mejora el mejor resultado publicado de Roller (2.570 s) y que no reclama podium ni record personal. Es, por tanto, un checkpoint de investigacion para puntos de ejecucion diaria, no un modelo listo para produccion ni para uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de retroalimentacion latente (126 parametros) sobre backbone neuronal congelado Pollen y adaptador de estado fisico previo; no es PPO ni entrenamiento desde cero |
| Parametros totales | 126 parametros en la cabeza de retroalimentacion (el backbone Pollen esta congelado y sus parametros no se detallan) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; entrada fija `[1,61]`) |
| Tipos de cuantizacion | No disponible; pesos en float32 ONNX |
| Idiomas soportados | No disponible (no es un modelo linguistico) |
| Licencia | No disponible; se conservan terminos upstream en `upstream-base-card.md` y `LICENSE-NOTE.txt`, sin licencia de redistribucion global nueva |
| Formato de pesos | ONNX (float32) |
| Entrada / salida | `[1,61]` / `[1,14]` |
| Frecuencia de control | 50 Hz |
| Evento | `roller-sprint-2m`, comando fijo 1.0, accesorios rollers |
| SHA256 | `783ce05087de5af856411458f8bbd2b4a4bcd73bd75cdf9104afcdf8e8a41374` |

## Arquitectura y entrenamiento

La arquitectura no es un transformer ni un SSM: es una cabeza de retroalimentacion latente de 126 parametros que aplica correcciones acotadas sobre un backbone neuronal congelado (Pollen) y un adaptador de comando de estado fisico previo. El entrenamiento se realizo mediante una estrategia de evolucion antithetica sin derivadas (derivative-free antithetic evolution strategy), seleccionando la generacion 16. El autor especifica explicitamente que no se trata de PPO ni de entrenamiento de red desde cero, sino de una optimizacion evolutiva sobre un sustrato congelado.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO (no aplicables en este dominio). La innovacion tecnica destacable es el uso de evolucion antithetica para ajustar una cabeza de bajo parametro sobre un backbone congelado, lo que reduce el coste de optimizacion y preserva el comportamiento del modelo base. La validacion local se realizo en Apple Silicon, con resultados que el autor advierte que pueden diferir de los del servidor.

## Capacidades

- Control de politica para una tarea concreta de robótica simulada (evento `roller-sprint-2m`) con comando externo fijo de 1.0.
- Generacion de comandos de accion de 14 dimensiones a partir de observaciones de 61 dimensiones, a 50 Hz.
- Aplicacion de correcciones acotadas sobre un backbone congelado, sin reentrenamiento del mismo.
- Ejecucion en formato ONNX float32, apta para inferencia en entornos de simulacion.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no es un modelo linguistico).
- No dispone de modo thinking, vision ni audio.
- Validacion documentada: 5/5 finalizaciones en cinco arranques canonicos (2.918 s), 128/128 en arranque ordinario y 64/64 en validacion de estres de comando a 0.9 y 1.1.

## Casos de uso

- Investigacion en optimizacion evolutiva aplicada a control: el checkpoint sirve como registro reproducible de la generacion 16 de un proceso de evolucion antithetica, util para comparar generaciones y analizar la convergencia de la cabeza de 126 parametros.
- Reproduccion de experimentos en Microduck Arena: permite replicar el evento `roller-sprint-2m` con comando fijo 1.0 y accesorios rollers, verificando los resultados locales documentados (2.918 s, 5/5 finalizaciones).
- Benchmarking de controladores de bajo parametro: al ser una cabeza de 126 parametros sobre backbone congelado, sirve para medir el coste/beneficio de ajustar solo la cabeza frente a reentrenar el backbone.
- Validacion de pipelines ONNX en simulacion: el modelo permite probar la integracion de un artefacto ONNX float32 a 50 Hz en un bucle de control simulado.
- Estudio de robustez ante estres de comando: los resultados 64/64 a comandos 0.9 y 1.1 permiten analizar el comportamiento del controlador fuera del comando nominal.
- Docencia y formacion en estrategias evolutivas: el checkpoint, con su SHA256 y su model card detallada, es un ejemplo concreto de flujo de seleccion por generaciones y validacion local.

## Benchmarks y rendimiento

Los unicos datos de rendimiento disponibles son los de validacion local declarados por el autor, no benchmarks estandar (MMLU, HumanEval, GSM8K, etc.), que no aplican a este dominio.

| Metrica | Resultado |
|---|---|
| Cinco arranques canonicos (comando 1.0) | 2.918 s, 5/5 finalizaciones |
| Validacion de arranque ordinario | 128/128 finalizaciones |
| Validacion de estres de comando (0.9 y 1.1) | 64/64 finalizaciones |
| Mejor resultado publicado de Roller | 2.570 s (no superado por este checkpoint) |
| Aceptacion oficial en Arena | No garantizada |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo es de 126 parametros en la cabeza y un backbone congelado cuyo tamano no se detalla, por lo que la huella depende del backbone.
- GPU recomendadas: no disponible; el autor reporta validacion local en Apple Silicon, sin especificar GPU.
- Compatibilidad con GPU de consumo: no disponible; el formato ONNX float32 y el tamano reducido del repositorio (0.0 GB) sugieren que la cabeza es ligera, pero el backbone condiciona el requisito real.
- Opciones de despliegue: ONNX Runtime (formato nativo del artefacto); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: control a 50 Hz (periodo de 20 ms); no se proporcionan medidas de latencia ni throughput adicionales.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables de la misma categoria (controladores de politica para Microduck Arena) con parametros, contexto, rendimiento y licencia verificables. El unico punto de comparacion mencionado es el mejor resultado publicado de Roller (2.570 s), que este checkpoint no supera.

## Limitaciones y advertencias

- El autor indica explicitamente que este checkpoint no mejora el mejor resultado publicado de Roller (2.570 s) y que no es una reclamacion de record personal ni de podium.
- La aceptacion oficial en Arena, la finalizacion y los puntos no estan garantizados.
- Los resultados locales en Apple Silicon pueden diferir de los del servidor.
- Solo simulacion: no hay garantia de seguridad ni fiabilidad en robot real.
- No se afirma una licencia de redistribucion global nueva; se conservan terminos upstream en `upstream-base-card.md` y `LICENSE-NOTE.txt`, por lo que el uso comercial queda sujeto a dichos terminos, no verificados aqui.
- No es un modelo de lenguaje: no tiene capacidades de generacion de texto, codigo, matematicas, vision ni audio, y no soporta tool calling ni agentes.
- La model card esta marcada como derivada archivada de una generacion concreta; no debe interpretarse como el campeon actual de Roller.
- No se especifican sesgos conocidos ni riesgo de alucinacion en el sentido linguistico; en su dominio, el riesgo es de comportamiento suboptimo fuera del comando nominal, parcialmente cubierto por la validacion de estres a 0.9 y 1.1.
- El repositorio no registra descargas ni likes, lo que limita la evidencia de uso externo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/djduecaster/dfreq-roller-feedback-es16-20261106
- Model card upstream (referenciada en el repositorio): `upstream-base-card.md`
- Nota de licencia (referenciada en el repositorio): `LICENSE-NOTE.txt`
- No se han encontrado en la busqueda web papers, blogs, repositorios o demos adicionales.
