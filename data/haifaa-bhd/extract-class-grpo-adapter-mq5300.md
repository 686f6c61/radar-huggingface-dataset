# haifaa-bhd/extract-class-grpo-adapter-mq5300

## Resumen

El modelo `haifaa-bhd/extract-class-grpo-adapter-mq5300` es un adaptador LoRA publicado por el usuario haifaa-bhd sobre el modelo base `Qwen/Qwen2.5-Coder-7B-Instruct`. No es un modelo completo, sino un ajuste fino especializado en una tarea muy concreta de refactorizacion: la operacion Extract Class sobre codigo Java. Dada una clase Java que ha acumulado mas de una responsabilidad, el adaptador genera un plan en formato JSON que indica que campos y metodos deberian trasladarse a una clase nueva; ese plan lo aplica despues la herramienta Spoon sobre el arbol de sintaxis abstracta (AST) real, no el propio modelo.

El adaptador se ha entrenado con GRPO (Group Relative Policy Optimization) utilizando una recompensa basada en la calidad de la modularizacion (MQ*, del ingles Modularisation Quality). Es el companero de otro adaptador del mismo autor, `haifaa-bhd/extract-class-grpo-adapter`, que se entreno con una recompensa distinta (F1 + LCOM) y cuyo checkpoint es el 4200. Ambos comparten modelo base y forma LoRA, de modo que pueden cargarse en un mismo modelo y conmutarse por peticion.

Su relevancia es acotada pero clara: forma parte de un trabajo de fin de master sobre refactorizacion efectiva de codigo fuente mediante aprendizaje automatico (ESI), y demuestra que un ajuste con RL sobre una metrica de modularizacion bien definida puede triplicar la tasa de extracciones no triviales respecto a una recompensa basada en F1. La model card reporta 0 descargas y 0 "likes" en el momento de la consulta, por lo que se trata de un artefacto de investigacion, no de un modelo consolidado en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; el modelo base es Qwen2.5-Coder-7B-Instruct |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 7,6 mil millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No indicada en la model card; heredada del modelo base, 32.768 tokens |
| Tipos de cuantizacion | No especificados; el adaptador se distribuye en precision completa (safetensors) y puede cargarse sobre versiones cuantizadas del modelo base |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen2.5-Coder-7B-Instruct |
| Rango LoRA / alpha | r=16, alpha=32 |
| Modulos objetivo | No disponible |
| Tamano del repositorio | 0,2 GB |
| Tarea declarada | Refactorizacion automatica: extraccion de clase (Extract Class) en Java |
| Libreria | peft |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 aplicado sobre `Qwen/Qwen2.5-Coder-7B-Instruct`, un transformer decoder-only de 7,6 mil millones de parametros especializado en codigo. No se modifica ningun peso del modelo base: el adaptador anade matrices de bajo rango en modulos de atencion y proyeccion (los modulos concretos no se detallan en la model card). La salida del modelo es exclusivamente un plan JSON con los nombres de campos y metodos a mover; la manipulacion del AST y la escritura del codigo refactorizado quedan delegadas a Spoon, lo que reduce el riesgo de generar codigo sintacticamente invalido.

El entrenamiento se realizo con GRPO, un algoritmo de optimizacion por politica relativa a un grupo de muestras, usando una recompensa de calidad de modularizacion (MQ*). MQ* se define como (I_A + I_B) / (I_A + I_B + E_AB), es decir, la proporcion de aristas de dependencia que no cruzan la particion propuesta, acotada en [0, 1] y donde valores mas altos son mejores. El checkpoint publicado corresponde al paso 5300. El adaptador hermano, entrenado con una recompensa F1+LCOM, corresponde al paso 4200. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset mas alla del benchmark de 150 clases, ni si hubo fases adicionales de SFT o DPO previas al GRPO.

## Capacidades

- Generacion de planes de refactorizacion en JSON para la operacion Extract Class sobre clases Java.
- Identificacion de clases con mas de una responsabilidad y propuesta de reparto de estado (campos) y comportamiento (metodos) entre la clase original y una nueva.
- Salida estructurada y consumible por herramientas externas: el plan se aplica mediante Spoon sobre el AST, no mediante generacion directa de codigo.
- Capacidad de emitir un plan util en 149 de 150 casos del benchmark interno de 150 clases.
- Mayor tendencia a mover estado junto con comportamiento que su adaptador hermano, lo que se traduce en 100 extracciones no triviales de 150 frente a 32 de 150.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: no disponibles en la informacion proporcionada; el ajuste esta orientado a Java.

## Casos de uso

- Refactorizacion asistida en IDE: dado un fichero Java seleccionado, el adaptador propone el plan JSON de extraccion de clase y el plugin aplica el cambio con Spoon, mostrando al desarrollador un diff revisable antes de confirmar.
- Reduccion de deuda tecnica en bases de codigo heredadas: se puede ejecutar por lotes sobre clases que superan un umbral de tamano o de complejidad ciclomatica para generar candidatos a extraccion y priorizar los esfuerzos de limpieza.
- Integracion en pipelines de CI/CD: como paso de analisis que genera un informe de extracciones propuestas por cada pull request, sin bloquear la fusion, para que el equipo evalue la modularizacion.
- Investigacion academica sobre refactorizacion automatica: sirve como linea base reproducible con metrica MQ* frente a otras recompensas (por ejemplo, F1+LCOM), dado que ambos checkpoints comparten modelo base y forma LoRA.
- Docencia de diseno orientado a objetos: el plan generado ilustra de forma explicita que campos y metodos deberian agruparse, util como material de correccion automatizada de ejercicios.
- Auditoria de arquitectura de monolitos Java: revision periodica de paquetes completos para detectar clases "bolsa de utilidades" que mueven metodos pero no estado, un patron que el adaptador tiende a evitar al arrastrar campos junto con el comportamiento.
- Preparacion de migraciones o reescrituras: la separacion de responsabilidades propuesta por el modelo facilita aislar modulos antes de portarlos a otro lenguaje o framework.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el benchmark interno de 150 clases, comparando este adaptador con su companero entrenado con recompensa F1+LCOM:

| Metrica | Este adaptador (mq-only, ck5300) | Adaptador f1lcom (ck4200) |
|---|---|---|
| MQ* (media) | 0,839 | 0,598 |
| F1 de campos | 0,267 | 0,222 |
| F1 de metodos | 0,149 | 0,216 |
| Extracciones no triviales | 100/150 | 32/150 |
| Plan util emitido | 149/150 | 143/150 |

MQ* = (I_A + I_B) / (I_A + I_B + E_AB), la proporcion de aristas de dependencia que no cruzan la particion, acotada en [0, 1], donde un valor mas alto es mejor. No se han publicado en la informacion disponible resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros); las unicas cifras son las de la tabla anterior, especificas de la tarea de extract class.

## Requisitos de hardware

- El adaptador en si ocupa 0,2 GB, por lo que el coste de almacenamiento es despreciable; el requisito real lo marca el modelo base de 7,6 mil millones de parametros.
- VRAM estimada para inferencia (estimaciones derivadas del tamano del modelo base): aproximadamente 15-16 GB en FP16/BF16, unos 8-9 GB en cuantizacion de 8 bits y unos 5-6 GB en 4 bits.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para despliegues con varios adaptadores y concurrencia; una RTX 4090 o RTX 3090 (24 GB) es suficiente para servir el modelo en FP16 con un unico adaptador.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 3090, RTX 4090) en precision completa o en tarjetas de 8-12 GB usando cuantizacion de 4 u 8 bits.
- Opciones de despliegue: vLLM y TGI admiten multiples adaptadores LoRA sobre un mismo modelo base, lo que encaja con el diseno de dos checkpoints conmutables; llama.cpp y Ollama requieren fusionar el adaptador con el modelo base y convertirlo a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| extract-class-grpo-adapter-mq5300 | LoRA sobre 7,6B | No indicado (heredado del base) | GRPO con recompensa MQ* | Apache 2.0 | HuggingFace, 0 descargas |
| extract-class-grpo-adapter (f1lcom ck4200) | LoRA sobre 7,6B | No indicado (heredado del base) | GRPO con recompensa F1+LCOM | Apache 2.0 | HuggingFace, mismo autor |
| Qwen2.5-Coder-7B-Instruct (modelo base sin ajustar) | 7,6B | 32.768 tokens en el base | Instruccion general de codigo, sin especializacion en extract class | Apache 2.0 | Ampliamente disponible |

No se conocen en la informacion proporcionada otros adaptadores publicos comparables especificamente entrenados para la tarea Extract Class; la comparacion mas directa es con el checkpoint hermano del mismo autor y con el modelo base sin ajustar.

## Limitaciones y advertencias

- El adaptador solo produce un plan JSON; no escribe codigo. La correccion del resultado depende de que Spoon aplique el plan y de que este sea semanticamente valido.
- Especifico de Java y de la operacion Extract Class: no se documenta soporte para otros lenguajes ni para otras refactorizaciones.
- El F1 de metodos es bajo (0,149), por lo que la coincidencia exacta con las elecciones de un desarrollador de referencia es limitada; el punto fuerte es la calidad estructural (MQ*), no la imitacion.
- Riesgo de alucinacion: el modelo puede nombrar campos o metodos inexistentes en la clase de entrada; conviene validar el plan contra el AST antes de aplicarlo.
- No hay informacion sobre idiomas soportados, sesgos del ajuste ni composicion del dataset de entrenamiento mas alla del benchmark de 150 clases.
- Contexto no documentado en la model card del adaptador; las clases muy grandes podrian superar la ventana util del modelo base.
- Licencia Apache 2.0, lo que permite uso comercial, pero el modelo base Qwen2.5-Coder-7B-Instruct tiene sus propios terminos, que deben respetarse por separado.
- Es un artefacto de investigacion asociado a un trabajo de fin de master, con 0 descargas y 0 "likes": no ha sido validado por la comunidad ni sometido a pruebas de robustez externas.
- Antes de usarlo en produccion conviene fijar el checkpoint, medir la tasa de planes inaplicables por Spoon y establecer una revision humana obligatoria del diff.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/haifaa-bhd/extract-class-grpo-adapter-mq5300
- Adaptador companero (f1lcom, checkpoint 4200), citado en la model card: `haifaa-bhd/extract-class-grpo-adapter`
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Spoon (biblioteca de transformacion de codigo Java): https://spoon.gforge.inria.fr/
- PEFT (libreria usada para el adaptador): https://github.com/huggingface/peft
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente paginas de Microsoft Copilot), por lo que no hay papers, blogs ni demos adicionales que enlazar.
