# llmkat/qwen3.5-draft

## Resumen

`llmkat/qwen3.5-draft` es un modelo borrador (draft model) disenado especificamente para decodificacion especulativa junto al modelo `llmkat/qwen3.5`. No es un modelo de proposito general ni un asistente conversacional: es una herramienta de validacion de motores de inferencia. Su funcion es proponer tokens de forma predecible para que el motor de serving acepte y rechace borradores en un patron fijo y verificable, de modo que cualquier desviacion en la salida delate un fallo en la gestion de la cache KV o del estado recurrente del motor.

El modelo lo publica el usuario `llmkat` bajo licencia MIT y esta etiquetado como material de testing. Se trata de un transformer tipo Llama de una sola capa con 4.667.787 parametros totales (aproximadamente 4,7 millones), lo que lo situa tres ordenes de magnitud por debajo de un modelo de produccion. Comparte tokenizador con `llmkat/qwen3.5`, requisito imprescindible para que la decodificacion especulativa sea valida.

Su relevancia es practica para ingenieros de infraestructura: permite comprobar de forma determinista si un backend (vLLM, SGLang) lee correctamente los bloques de cache KV y el estado recurrente al aplicar decodificacion especulativa. El autor indica que cada token correcto gana por unos 39 nats, de modo que un token erroneo senala un error de lectura del motor y no una diferencia de redondeo. La informacion disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama, una sola capa |
| Parametros totales | 4.667.787 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La model card describe el modelo como "a one-layer Llama" que comparte tokenizador con `llmkat/qwen3.5`. No se detalla el numero de cabezas de atencion, la dimension oculta, la funcion de activacion ni la longitud de contexto. El recuento real de parametros en safetensors es de 4.667.787, coherente con una red de una sola capa y vocabulario heredado del modelo objetivo.

El comportamiento del modelo esta disenado, no aprendido de forma convencional: propone la clave correcta despues de cada puntero y emite `<miss>` tras cualquier otro token. Esto produce un patron fijo de aceptacion y rechazo en el motor de decodificacion especulativa, de manera que la salida final no debe cambiar respecto a la inferencia sin borrador. No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO. La finalidad declarada es actuar como oraculo de prueba para validar la correccion del motor, no generar texto util.

## Capacidades

- Generacion de texto limitada a un comportamiento artificial: predecir una clave tras un puntero y `<miss>` en cualquier otro caso.
- Decodificacion especulativa: actua como draft model para `llmkat/qwen3.5` con `num_speculative_tokens` configurable (el ejemplo usa 3).
- Validacion de motores de inferencia: permite comprobar la lectura de bloques de cache KV y estado recurrente mediante el script `check.py` del repositorio.
- Compatibilidad declarada con vLLM y SGLang (etiquetas del modelo y ejemplo de despliegue con vLLM).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Validacion de decodificacion especulativa en vLLM: arrancar `llmkat/qwen3.5` con `--speculative-config` apuntando a este borrador y ejecutar `check.py` para verificar que la salida coincide con la inferencia sin especulacion. Adecuado porque el patron fijo de aceptacion y rechazo hace detectable cualquier desviacion.
- Pruebas de regresion de cache KV: el margen de 39 nats por token correcto convierte un token erroneo en una senal clara de lectura incorrecta de bloque, lo que permite usar el modelo como test automatizado en CI de motores de serving.
- Verificacion de estado recurrente en modelos hibridos: la model card menciona explicitamente el estado recurrente como objeto de prueba, de modo que el borrador sirve para comprobar que el motor conserva correctamente ese estado entre pasos.
- Integracion en pipelines de CI/CD de infraestructura de IA: el repositorio incluye `check.py` con parametros `--family` y `--passes`, lo que permite automatizar la validacion tras actualizaciones de vLLM o SGLang.
- Comparacion de backends: ejecutar la misma comprobacion contra vLLM y SGLang para detectar discrepancias en la gestion de borradores entre implementaciones.
- Formacion y depuracion de equipos: servir como caso minimo y reproducible para entender como funciona la decodificacion especulativa sin la variabilidad de un modelo generativo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta la cifra de que cada token correcto gana por unos 39 nats, metrica de separacion entre tokens usada para la validacion, no un benchmark de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (4,7 millones de parametros); el repo ocupa 0.0 GB.
- GPU recomendadas: cualquier GPU con suficiente memoria para alojar simultaneamente el modelo objetivo `llmkat/qwen3.5` y el borrador; no se especifican modelos concretos.
- Cabe en GPU de consumo: si, dado su tamano minimo; no se detallan modelos concretos.
- Opciones de despliegue: vLLM (ejemplo oficial con `--speculative-config`) y SGLang (etiqueta del modelo). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El coste del borrador es despreciable frente al modelo objetivo por su tamano, pero no se aportan cifras.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos borrador comparables de validacion con el mismo proposito y tamano.

## Limitaciones y advertencias

- No es un modelo de proposito general: su salida esta disenada para un patron artificial y no produce texto util para usuarios finales.
- Solo es valido junto a `llmkat/qwen3.5`; requiere compartir tokenizador con el modelo objetivo y no sirve como borrador de otros modelos.
- La informacion tecnica publicada es minima: no hay datos de contexto, cuantizacion, idiomas ni entrenamiento.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero cualquier uso fuera del proposito de testing producira salidas sin sentido.
- Licencia MIT: permite uso comercial y modificacion, pero el modelo no aporta valor funcional en produccion mas alla del testing de motores.
- Sesgos conocidos: no disponibles; al no estar entrenado para generar lenguaje natural, no se han documentado sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmkat/qwen3.5-draft
- Modelo objetivo: https://huggingface.co/llmkat/qwen3.5
- Repositorio y documentacion (funcionamiento, resultados y limites): https://github.com/sansblues/llmkat
