# mobilint/kanana-1.5-2.1b-instruct-2505-regulus-rb-usb

## Resumen

Este repositorio contiene una version compilada y optimizada de `kakaocorp/kanana-1.5-2.1b-instruct-2505` para el hardware NPU de Mobilint. No se trata de un modelo entrenado desde cero, sino de una distribucion de despliegue: el autor (mobilint) empaqueta los pesos del modelo base de Kakao en un formato adaptado a su stack de aceleracion, con la etiqueta `base_model_relation: quantized`. El modelo es conversacional (`conversational`), esta orientado a generacion de texto y declara soporte para coreano e ingles.

El modelo base pertenece a la familia Kanana 1.5 de Kakao Corp, en su variante de 2.1 mil millones de parametros ajustada por instrucciones (sufijo `instruct`) con fecha de corte 2505. La relevancia de esta ficha concreta es acotada: su interes no esta en capacidades nuevas ni en mejoras de rendimiento del modelo en si, sino en servir como artefacto de despliegue para aceleradores NPU de Mobilint en lugar de GPUs convencionales.

La informacion publicada en la model card es muy escasa: se limita a indicar el proposito del repositorio y la licencia, sin detallar arquitectura interna, volumen de datos de entrenamiento ni resultados de evaluacion. Todo lo que no aparece en la informacion proporcionada se marca explicitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Kanana 1.5; arquitectura interna no especificada en la informacion proporcionada) |
| Parametros totales | 229.840.128 segun los metadatos de safetensors del repositorio; el nombre del modelo base indica 2.1b (ver advertencia mas abajo) |
| Parametros activos | no aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en detalle; el repositorio se declara como modelo base cuantizado y compilado para NPU de Mobilint |
| Idiomas soportados | coreano (ko) e ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, con `custom_code` y arquitectura declarada `mobilint-llama` |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 4.1 GB |
| Modelo base | kakaocorp/kanana-1.5-2.1b-instruct-2505 |
| Relacion con el modelo base | quantized |
| Fecha de creacion | 2026-09-10 |
| Fecha de actualizacion | 2026-09-10 |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura del modelo base ni del artefacto compilado. El unico dato tecnico relevante es que el repositorio se distribuye con una arquitectura declarada como `mobilint-llama`, requiere `custom_code` para cargarse y esta marcado como relacion `quantized` respecto a `kakaocorp/kanana-1.5-2.1b-instruct-2505`. Esto implica que el modelo original ha sido transformado (cuantizado y compilado) para ejecutarse sobre el stack de aceleracion de Mobilint, y no se garantiza su funcionamiento fuera de ese entorno.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineamiento, ni sobre innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, atencion con ventana deslizante, etc.). Cualquier afirmacion al respecto seria especulativa y no se incluye en esta ficha.

Existe una discrepancia que conviene senalar: los metadatos de safetensors indican 229.840.128 parametros, aproximadamente el 11 por ciento de los 2.1 mil millones que sugiere el nombre del modelo base, mientras que el repositorio ocupa 4.1 GB. Es plausible que el recuento refleje tensores empaquetados o parciales del artefacto compilado, pero no hay informacion que lo confirme.

## Capacidades

- Generacion de texto conversacional en coreano e ingles, segun los tags `text-generation` y `conversational` del repositorio.
- Uso previsto como modelo de chat o asistente de instrucciones, derivado del sufijo `instruct` del modelo base.
- Capacidad multilingue limitada a coreano e ingles segun los metadatos de idioma declarados.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision, audio o modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.
- Integracion con el stack de aceleracion de Mobilint como capacidad diferencial del artefacto, no del modelo en si.

## Casos de uso

- Asistentes conversacionales en coreano en dispositivos con acelerador NPU de Mobilint: el modelo cubre el idioma principal del modelo base y esta empaquetado para ejecutarse en ese hardware sin depender de una GPU dedicada.
- Despliegue en equipos de borde (edge) o estaciones de trabajo sin GPU: al estar compilado para NPU, permite ejecutar un modelo de chat de ~2.1 mil millones de parametros en entornos donde no hay CUDA disponible.
- Prototipado rapido sobre hardware Mobilint: util para equipos que ya trabajan con el SDK de Mobilint y necesitan un modelo de instrucciones listo para usar como linea base en sus pruebas de integracion.
- Traduccion y asistencia bilingue coreano-ingles: el modelo declara ambos idiomas, lo que permite tareas de reescritura, resumen o traduccion asistida entre esos dos idiomas.
- Generacion de texto en aplicaciones de productividad local: redaccion de correos, resumenes o respuestas en un asistente de escritorio, siempre que la ventana de contexto del modelo (no disponible) sea suficiente para el caso.
- Evaluacion comparativa de stacks de aceleracion: sirve como punto de referencia para medir el rendimiento del runtime de Mobilint frente a alternativas en GPU con el mismo modelo base.
- Investigacion sobre cuantizacion y portabilidad: el repositorio permite estudiar como se comporta un modelo instruct de ~2B tras un proceso de cuantizacion y compilacion especifico de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la busqueda web realizada no devolvio documentacion tecnica relevante sobre este artefacto ni sobre su modelo base.

## Requisitos de hardware

- Hardware objetivo: aceleradores NPU de Mobilint. El sufijo `regulus-rb-usb` del identificador sugiere un formato de factor de forma USB dentro de la linea Regulus, aunque esta interpretacion se deriva del nombre y no esta confirmada en la informacion proporcionada.
- Ejecucion en GPU convencional: no disponible. El repositorio usa arquitectura `mobilint-llama` con `custom_code`, por lo que no se puede asumir compatibilidad con vLLM, TGI, llama.cpp u Ollama.
- VRAM estimada para el modelo base sin cuantizar (calculo orientativo a partir de 2.1 mil millones de parametros, no un dato publicado): en torno a 4,2 GB en fp16, 2,1 GB en int8 y 1,1 GB en int4.
- GPU consumer: por tamano, el modelo base de 2.1B cabria con holgura en tarjetas con 8 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090), siempre que se disponga de pesos en un formato estandar y no del artefacto compilado para NPU.
- GPU de centro de datos (A100, H100): sobredimensionadas para este tamano de modelo; solo tendrian sentido para servir muchas replicas en paralelo.
- Opciones de despliegue: el stack de Mobilint es la via prevista; para el modelo base serian aplicables las herramientas habituales de la familia, pero no se confirma en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparacion se realiza contra el modelo base del que deriva este artefacto y contra alternativas de tamano equivalente. Los datos de terceros son referencias generales y no se han verificado en la busqueda web realizada.

| Modelo | Parametros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| mobilint/kanana-1.5-2.1b-instruct-2505-regulus-rb-usb | 229.840.128 segun safetensors (base de 2,1B) | no disponible | apache-2.0 | Compilado para NPU Mobilint; requiere custom_code |
| kakaocorp/kanana-1.5-2.1b-instruct-2505 | 2,1B (segun denominacion) | no disponible | no disponible en esta ficha | Modelo base original, ejecutable en stack estandar |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens (referencia general) | apache-2.0 | Alternativa de tamano similar con amplia adopcion |
| Llama-3.2-1B-Instruct | 1,23B | 128.000 tokens (referencia general) | Llama 3.2 Community License | Alternativa de tamano similar con licencia no Apache |

No hay datos de rendimiento comparado disponibles para el modelo objeto de esta ficha, por lo que la comparacion se limita a parametros, contexto declarado y licencia.

## Limitaciones y advertencias

- La informacion publicada es minima: no hay model card tecnica, ni detalles de entrenamiento, ni evaluaciones. Cualquier decision de produccion deberia apoyarse en pruebas propias.
- Dependencia de hardware: el artefacto esta empaquetado para el stack de aceleracion de Mobilint y usa `custom_code` con arquitectura `mobilint-llama`. No es un reemplazo directo del modelo base en entornos GPU estandar.
- Sesgos: no disponibles. No se ha publicado ninguna evaluacion de sesgo, toxicidad o seguridad para este repositorio ni, en la informacion proporcionada, para el modelo base.
- Riesgo de alucinacion: inherente a los modelos de generacion de texto de este tamano; no hay evaluaciones publicadas que lo cuantifiquen en este caso.
- Cobertura idiomatica limitada: solo coreano e ingles declarados. El castellano no figura entre los idiomas soportados.
- Ventana de contexto desconocida: al no documentarse, no se puede garantizar el comportamiento en conversaciones largas o documentos extensos.
- Discrepancia en el recuento de parametros: los metadatos de safetensors indican 229,84 millones de parametros frente a los 2,1 mil millones que sugiere el nombre del modelo base. Conviene verificar la naturaleza del artefacto antes de integrarlo.
- Licencia: apache-2.0 permite uso comercial, pero se hereda del modelo base; conviene revisar tambien las condiciones de `kakaocorp/kanana-1.5-2.1b-instruct-2505` y las del software de Mobilint necesario para ejecutarlo.
- Trazabilidad nula: cero descargas y cero likes en el momento de la consulta, sin documentacion adicional que permita validar la calidad del proceso de cuantizacion y compilacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mobilint/kanana-1.5-2.1b-instruct-2505-regulus-rb-usb
- Modelo base: https://huggingface.co/kakaocorp/kanana-1.5-2.1b-instruct-2505
- Sitio del autor: https://mobilint.com
- Repositorio de modelos de Mobilint (referenciado en la model card): https://github.com/mobilint/mblt-model-zoo
- Papers, blogs o demos adicionales: no se han encontrado en la busqueda web realizada.
