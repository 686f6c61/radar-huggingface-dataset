# PeytonT/SimulateAnything-Gemma-3-1B-v5

## Resumen

SimulateAnything-Gemma-3-1B-v5 es un ajuste fino mediante LoRA sobre google/gemma-3-1b-it, desarrollado por PeytonT, orientado a la generacion de planes tipados para un motor de simulacion de escenas en navegador. No es un modelo conversacional general: actua como el componente de autoria de escenas de un sistema mayor llamado SimulateAnything, produciendo planes estructurados que el motor interpreta para crear entidades, fuentes de particulas y terrenos. El modelo base aporta la arquitectura Gemma 3 de 1B parametros con atencion y decodificacion estandar; el adaptador anade un residual de composicion de 278.528 parametros en los cuatro ultimos bloques de atencion q/o.

La relevancia de esta ficha es acotada y conviene subrayarla: se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, publicado como continuacion acotada ("bounded scene-authoring continuation"), no como un modelo de proposito general. El autor documenta explicitamente que no suministra solvers ausentes ni valida fisica del mundo real, y que la explicacion cientifica libre sigue siendo poco fiable. Su interes tecnico esta en el patron de despliegue: backbone congelado en int4/block16 ejecutado via ONNX y WebGPU en el navegador, con dos ramas (general y composicion) que comparten un unico backbone y una unica sesion de navegador.

El repositorio ocupa 1,9 GB y la descarga del navegador ronda los 1,78 GB. El modelo solo declara soporte de ingles y hereda la licencia Gemma de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 text) con adaptador LoRA; backbone congelado en int4/block16 para ONNX/WebGPU |
| Parametros totales | No disponible (el modelo base google/gemma-3-1b-it tiene 1B; el adaptador de composicion entrena 278.528 parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Backbone int4 con block size 16 (congelado); pesos del adaptador en safetensors |
| Idiomas soportados | Ingles (en) |
| Licencia | Gemma (terminos, licencia y avisos originales de Google) |
| Formato de pesos | safetensors (adaptador), ONNX (onnx/backbone.onnx) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-1b-it, un transformer decoder-only de la familia Gemma 3, y le superpone un adaptador LoRA. El backbone medido y congelado se ejecuta en int4 con block size 16 en el navegador mediante ONNX y WebGPU. El adaptador incorpora un residual de composicion separado en los cuatro ultimos bloques de atencion q/o, con 278.528 parametros entrenados, y la aplicacion suministra una entrada booleana `sa_composition` que selecciona la rama: `false` para planificacion general y conversacion, `true` para la etapa de planificacion de componentes. Segun el autor, esta seleccion no inspecciona palabras clave del usuario y ambas ramas comparten backbone y sesion de navegador.

El entrenamiento consistio en dos continuaciones que retuvieron los 13.986 registros de replay del modelo padre. La primera se rechazo por ejemplos de composicion insuficientemente variados; la segunda, un reemplazo completo, regreso en cuatro decisiones previamente correctas y tambien se rechazo. La interpolacion de parametros no reparo de forma fiable la retencion. La version final anadio 3.186 peticiones autoradas distintas con terrenos, fuentes, cantidades y decisiones de no-accion variadas. Los profesores ejecutables pasaron comprobaciones de compilacion, lo que no garantiza la correccion de las respuestas generadas. Se excluyeron del segundo conjunto de profesores las peticiones exactas de evaluacion y las combinaciones positivas de redaccion volcanica con agua. El adaptador no es autonomo sobre el checkpoint sin cuantizar de Google: requiere el `onnx/backbone.onnx` incluido y el prefijo de datos autenticado de `backbone-spec.json`.

## Capacidades

- Generacion de planes tipados para componentes instalados en el motor de simulacion (terreno, fuentes, cantidades, decisiones de no-accion).
- Autoria de escenas acotada: creacion de crateres radiales y fuentes de agua en el aire a partir de una peticion del tipo "cascada dentro de un volcan", dentro de las capacidades reales del motor.
- Decisiones de no cambio ante peticiones no soportadas (por ejemplo, presion de vapor), sin modificar la escena.
- Simulacion de agua mediante poblaciones independientes de gotas esfericas, gravedad, arrastre de aire prescrito y recoleccion de contacto estatica.
- Planificacion general y conversacional en la rama `sa_composition=false`.
- Soporte de tool calling / function calling: no disponible como capacidad declarada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada.
- Capacidades multilingues: solo ingles.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Autoria de escenas en el navegador: el modelo genera planes tipados que el motor SimulateAnything aplica y reproduce en WebGPU, adecuado porque el adaptador esta entrenado especificamente contra el conjunto de componentes instalados.
- Prototipado de simulaciones fisicas acotadas: permite describir en lenguaje natural una escena (crater, fuente de agua, gotas con gravedad y arrastre) y obtener un plan ejecutable, sin necesidad de escribir el plan a mano.
- Investigacion sobre adaptadores de composicion con backbone congelado: el patron de dos ramas sobre un unico backbone int4/block16 y una entrada booleana de seleccion es replicable en otros dominios con restricciones de memoria.
- Evaluacion de retencion en ajustes finos continuados: el autor publica `qualification.json` con fallos por caso y `provenance.json` con la auditoria del padre y la cuarentena de ancestros, util como material de estudio de regresiones.
- Pruebas de despliegue ONNX/WebGPU en escritorio: el modelo sirve como banco de pruebas de inferencia en navegador con NVIDIA en escritorio, midiendo aplicacion automatica, reproduccion y persistencia.
- Sistemas de simulacion con decisiones de no-accion: el modelo esta entrenado para rechazar peticiones fuera de alcance sin alterar la escena, lo que resulta util en entornos donde un cambio no solicitado es costoso.
- Docencia sobre limites de los modelos pequenos: los resultados publicados (8/12 en el panel de particulas, 44/45 peticiones soportadas, 3/6 en explicacion cientifica libre) ilustran la diferencia entre cobertura de regresion y generalizacion ciega.

## Benchmarks y rendimiento

Los datos publicados son casos de desarrollo y regresion expuestos, no resultados de generalizacion ciega. El autor lo indica explicitamente.

| Panel | Resultado |
|---|---|
| Panel de escena de particulas (WebGPU) | 8/12 |
| Peticiones de simulacion soportadas (paneles existentes) | 44/45 (44/63 si los adaptadores ausentes cuentan como incompletos) |
| Decisiones de no cambio | 13/13 |
| Casos de apariencia original | 16/18 |
| Explicacion cientifica libre (panel diagnostico separado, modelo padre) | 3/6 |
| Retencion de exitos de v4 en los ocho paneles conservados | Todos preservados |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el backbone se ejecuta en int4/block16 y la descarga del navegador es de aproximadamente 1,78 GB, lo que sugiere un footprint de memoria moderado.
- GPU recomendadas: se probo WebGPU en NVIDIA de escritorio; no se documentan modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: worker de navegador de SimulateAnything para ONNX/WebGPU; reconstruccion nativa mediante `scripts/chat-model/evaluate.py` con `--browser-backbone`, `--backbone-spec`, `--adapter` y `--revision dcc83ea841ab6100d6b47a070329e1ba4cf78752`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor advierte que la precision de activacion nativa difiere de WebGPU, por lo que el exito en nativo no es suficiente.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables de otros modelos en la informacion proporcionada. La comparacion se limita a parametros y disponibilidad.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SimulateAnything-Gemma-3-1B-v5 | 1B (base) + 278.528 en adaptador | No disponible | Gemma | safetensors + ONNX | Especializado en planes de escena; solo ingles |
| google/gemma-3-1b-it | 1B | No disponible | Gemma | safetensors | Modelo base instructivo general; no incluye el adaptador de composicion |
| Alternativas de 1B para generacion de texto | No disponible | No disponible | No disponible | No disponible | No se han identificado en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo de proposito general: genera planes para componentes instalados y no suministra solvers ausentes ni valida fisica del mundo real.
- Fisica incompleta: no hay presion de liquido continua, dinamica de piscinas, calentamiento de lava ni reacciones termicas.
- Explicacion cientifica libre poco fiable: el modelo padre puntuo 3/6 en un panel diagnostico separado.
- Los resultados publicados son casos de desarrollo y regresion expuestos, no generalizacion ciega; el propio autor lo advierte.
- Solo soporta ingles.
- El adaptador no funciona de forma autonoma sobre el checkpoint sin cuantizar de Google: requiere el `onnx/backbone.onnx` incluido y el prefijo de datos autenticado de `backbone-spec.json`.
- La precision de activacion nativa difiere de WebGPU; validar solo en nativo es insuficiente.
- Riesgo de alucinacion en peticiones fuera del dominio de componentes entrenados; el modelo esta disenado para decidir no cambiar la escena, pero la cobertura no es total.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia Gemma: aplican los terminos, licencia y avisos originales de Google, con las restricciones de uso comercial que estos impongan.
- Cero descargas y cero likes en el momento de la consulta; sin validacion externa por parte de la comunidad.
- El autor conserva la auditoria del padre y la advertencia de cuarentena de ancestros en `provenance.json`, lo que indica cautelas sobre el linaje del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PeytonT/SimulateAnything-Gemma-3-1B-v5
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Codigo fuente de SimulateAnything (revision registrada): https://github.com/peytontolbert/simulateanything/tree/dc39eee36965e61a22e148de78a23f0cbfee5b19
- Paper: no disponible
- Blog: no disponible
- Demo: no disponible
