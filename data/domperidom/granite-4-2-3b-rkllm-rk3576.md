# domperidom/granite-4.2-3b-rkllm-rk3576

## Resumen

Este repositorio contiene una conversion no oficial del modelo IBM Granite 4.2 3B al formato RKLLM, preparada por el usuario domperidom para ejecutarse en el SoC Rockchip RK3576. No es un checkpoint de Transformers, GGUF ni un formato portable: es un artefacto compilado especificamente para el runtime RKLLM de Rockchip sobre la NPU del RK3576, con cuantizacion W4A16 (pesos de 4 bits, activaciones de 16 bits) y group size 32. El tokenizador y la plantilla de chat originales de Granite 4.2 se conservan sin modificaciones.

El modelo base, ibm-granite/granite-4.2-3b, es un modelo de aproximadamente 3.000 millones de parametros de IBM, publicado bajo licencia Apache 2.0 y orientado a tareas de generacion de texto y razonamiento. Esta conversion hereda ese conocimiento pero lo empaqueta para inferencia en el borde: la ventana de contexto maxima con la que se compilo este build es de 16384 tokens, inferior a la del modelo original, y requiere RKLLM runtime 1.3.0 junto con RKNPU driver 0.9.8 y dos nucleos NPU.

Su relevancia es de nicho pero clara: permite desplegar un modelo de 3B con soporte de 12 idiomas (entre ellos castellano) en hardware embebido Rockchip, sin GPU dedicada y sin conexion a la nube. El repositorio es muy reciente y tiene un volumen de descargas y likes practicamente nulo (2 descargas, 0 likes en el momento de la consulta), por lo que debe tratarse como un experimento de comunidad y no como un artefacto de produccion validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada; se hereda del modelo base ibm-granite/granite-4.2-3b |
| Parametros totales | Aproximadamente 3.000 millones (segun la denominacion del modelo base; cifra exacta no disponible) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | 16384 tokens (maximo con el que se compilo este build RKLLM; el modelo original soporta una ventana mayor, tamano exacto no disponible) |
| Tipos de cuantizacion | W4A16, group size 32 (unico formato incluido en el repositorio) |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh (12 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | RKLLM (formato propietario de Rockchip, no es safetensors ni GGUF) |
| Plataforma objetivo | Rockchip RK3576, 2 nucleos NPU |
| Runtime requerido | RKLLM runtime 1.3.0, RKNPU driver 0.9.8 |
| Tamano del repositorio | 3,6 GB |
| Modelo base | ibm-granite/granite-4.2-3b (relacion: quantized) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF, DPO u otras) utilizadas en el modelo base. La model card de esta conversion solo documenta el proceso de conversion y cuantizacion: se uso RKLLM Toolkit 1.3.0 sobre ibm-granite/granite-4.2-3b, aplicando cuantizacion de pesos a 4 bits con activaciones en 16 bits y group size 32. La unica innovacion documentada a nivel de inferencia es la conservacion de la plantilla de chat original, que incluye modo de razonamiento explicito mediante la etiqueta `<think>`.

Para activar el modo de razonamiento, el prompt debe terminar con `<|im_start|>assistant` seguido de `<think>`; para el modo sin razonamiento se usa `<|im_start|>assistant` seguido de `<think></think>`. Este detalle es critico para reproducir el comportamiento esperado del modelo, ya que la plantilla no se ha modificado respecto al modelo base. Cualquier otra innovacion tecnica del modelo original (mecanismos de atencion, decodificacion especulativa, etc.) no esta documentada en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en 12 idiomas: ingles, aleman, castellano, frances, japones, portugues, arabe, checo, italiano, coreano, neerlandes y chino.
- Modo de razonamiento explicito ("thinking mode") activable mediante la etiqueta `<think>` en el prompt, con salida de cadena de pensamiento antes de la respuesta final.
- Modo sin razonamiento (respuesta directa) mediante `<think></think>`, util para reducir latencia y consumo de tokens.
- Respuesta a instrucciones y conversacion multi-turno usando la plantilla de chat original de Granite 4.2.
- Ejecucion completamente local sobre NPU, sin necesidad de conectividad de red ni de GPU dedicada.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible, aunque el modo de razonamiento permite cadenas de pensamiento.
- Capacidades de vision o audio: no disponibles (el modelo base descrito no incluye modalidades adicionales segun la informacion proporcionada).
- Ejemplos de salida en todos los idiomas soportados publicados por el autor en `examples/EXAMPLES.md`.

## Casos de uso

- Asistente conversacional embebido en castellano: integrado en el firmware de un dispositivo RK3576, el modelo puede mantener conversaciones multi-turno de hasta 16384 tokens, suficiente para sesiones de asistencia domestica o de oficina sin depender de servicios en la nube.
- Procesamiento de texto en el borde con requisitos de privacidad: en entornos sanitarios, legales o industriales donde los datos no pueden salir del dispositivo, la inferencia 100 % local sobre NPU evita enviar informacion sensible a APIs externas.
- Interfaces de voz para robotica y maquinaria: combinado con un modulo de reconocimiento y sintesis de voz en el mismo SoC, el modelo puede generar respuestas naturales en varios idiomas para paneles de control o robots de servicio.
- Traduccion y resumen multilingue en quioscos interactivos: los 12 idiomas soportados permiten atender a usuarios de distintas procedencias y resumir documentos o formularios en el propio dispositivo.
- Generacion de texto asistida en herramientas de campo: tecnicos que trabajan sin cobertura pueden redactar informes, notas o descripciones de incidencias sobre un dispositivo portatil con RK3576.
- Extraccion y clasificacion de informacion en pipelines de documentos: el modelo puede resumir, etiquetar o reformatear texto extraido de PDFs o formularios antes de almacenarlo en un sistema local.
- Prototipado de aplicaciones de IA en el borde: al estar bajo Apache-2.0, sirve como banco de pruebas para evaluar el rendimiento real de un modelo de 3B en la NPU del RK3576 antes de decidir una arquitectura de despliegue.
- Razonamiento asistido por pasos en tareas tecnicas: el modo `<think>` permite obtener cadenas de razonamiento para diagnosticos, calculos o planes de accion sencillos, con la opcion de desactivarlo cuando la latencia es critica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversion no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni del modelo base ni del artefacto cuantizado. Tampoco se proporcionan datos de latencia, throughput o tokens por segundo sobre el RK3576. El autor advierte ademas de que la cuantizacion W4A16 puede degradar la calidad respecto al modelo original en BF16, sin cuantificar esa perdida.

## Requisitos de hardware

- Plataforma de ejecucion: exclusivamente Rockchip RK3576 con NPU. El artefacto no funciona en GPU de escritorio, CPU x86 ni en otros SoC Rockchip distintos del RK3576.
- Nucleos NPU: 2 nucleos, configuracion probada por el autor.
- Software obligatorio: RKLLM runtime 1.3.0 y RKNPU driver 0.9.8 (versiones con las que se valido la conversion).
- Huella de memoria estimada: con pesos en 4 bits, el modelo ocupa aproximadamente 1,5-2 GB (estimacion derivada del numero de parametros; no confirmada por el autor), a lo que hay que sumar la memoria para la cache KV de hasta 16384 tokens. El repositorio completo ocupa 3,6 GB.
- GPU recomendadas: no aplica. No se puede ejecutar en A100, H100, RTX 4090 ni ninguna GPU comercial; el binario esta compilado para la NPU del RK3576.
- Compatibilidad con GPU de consumo: no, en ninguna.
- Opciones de despliegue: unicamente el runtime RKLLM de Rockchip. No es compatible con vLLM, llama.cpp, Ollama, TGI ni con el ecosistema de Transformers.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| domperidom/granite-4.2-3b-rkllm-rk3576 | ~3.000 millones | 16384 tokens (build RKLLM) | RKLLM, W4A16 | Rockchip RK3576 (2 NPU) | Apache-2.0 | HuggingFace, 2 descargas |
| ibm-granite/granite-4.2-3b (modelo base) | ~3.000 millones | Mayor que 16384 (valor exacto no disponible) | Safetensors (BF16) | GPU/CPU convencionales | Apache-2.0 | HuggingFace, oficial de IBM |
| Otras conversiones del mismo modelo base (GGUF, ONNX, etc.) | ~3.000 millones | No disponible | No disponible | CPU/GPU segun runtime | Apache-2.0 (heredada) | No confirmada en la informacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables dentro de la informacion proporcionada, por lo que no es posible establecer una comparacion de rendimiento entre esta conversion y otros modelos de tamano similar orientados a dispositivos de borde.

## Limitaciones y advertencias

- Conversion no oficial: no es un lanzamiento de IBM. Es un derivado creado por un tercero con RKLLM Toolkit 1.3.0, sin validacion ni soporte del fabricante del modelo base.
- Portabilidad nula: el artefacto solo se ejecuta en Rockchip RK3576 con dos nucleos NPU y las versiones concretas de runtime (1.3.0) y driver (0.9.8) indicadas. No sirve como checkpoint de Transformers, GGUF ni para otros aceleradores.
- Contexto reducido: aunque el modelo original admite una ventana mayor, este build se compilo con un maximo de 16384 tokens. Prompts o conversaciones mas largas no seran atendidos correctamente.
- Perdida de calidad por cuantizacion: el autor advierte explicitamente de que la cuantizacion W4A16 puede degradar la calidad respecto al modelo en BF16. No se cuantifica el impacto.
- Riesgo de alucinacion: no hay datos publicados de evaluacion de fidelidad, por lo que el riesgo de invencion de hechos es el propio de un modelo de 3B sin verificar.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o comportamiento diferencial por idioma. El rendimiento en los 12 idiomas declarados puede ser desigual; el autor solo aporta ejemplos de salida, no metricas.
- Idiomas: la lista de idiomas procede de los metadatos del modelo base. No hay garantia de calidad homogenea, especialmente en idiomas con menos representacion en los datos de entrenamiento.
- Licencia: Apache-2.0 permite uso comercial y modificacion, siempre que se conserve la atribucion a IBM y se tenga en cuenta que el tokenizador se copia sin modificaciones del repositorio original. Al ser un derivado no oficial, conviene revisar los terminos del modelo base antes de un despliegue comercial.
- Madurez: 2 descargas y 0 likes en el momento de la consulta, creado en septiembre de 2026. No hay evidencia de uso en produccion ni de mantenimiento continuado.
- Ausencia de benchmarks: no es posible justificar la eleccion de este artefacto frente a otras opciones con datos objetivos de rendimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/domperidom/granite-4.2-3b-rkllm-rk3576
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-3b
- Ejemplos de salida en todos los idiomas soportados: https://huggingface.co/domperidom/granite-4.2-3b-rkllm-rk3576/blob/main/examples/EXAMPLES.md
- RKLLM Toolkit 1.3.0: URL no disponible en la informacion proporcionada
- Documentacion de RKLLM runtime y RKNPU driver: URL no disponible en la informacion proporcionada
- Paper o blog tecnico de Granite 4.2: URL no disponible en la informacion proporcionada
