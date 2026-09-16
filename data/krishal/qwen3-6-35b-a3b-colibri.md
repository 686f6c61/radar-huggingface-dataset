# Krishal/QWen3.6-35B-A3B-Colibri

## Resumen

Krishal/QWen3.6-35B-A3B-Colibri es un contenedor de pesos publicado en HuggingFace por el usuario Krishal que empaqueta el modelo Qwen3.6-35B-A3B en el formato propietario del motor de inferencia colibri. No se trata de un modelo entrenado desde cero ni de un ajuste fino, sino de un port de pesos: el autor redistribuye las capas del MoE original de Qwen adaptadas para que puedan ejecutarse con el motor `qwen36` escrito en C del proyecto colibri. La model card describe explicitamente la "Fase 2" del port, en la que se incluyen todas las capas, incluidas las de Gated DeltaNet.

El modelo subyacente pertenece a la familia Qwen3.6 en su variante MoE de 35B, con el sufijo A3B que en la nomenclatura habitual de Qwen indica aproximadamente 3B parametros activos por token. La arquitectura combina atencion con compuertas (Gated-Attention) y atencion lineal Gated DeltaNet en cada capa, y cada capa incorpora ademas su bloque MoE/MLP. El repositorio ocupa 21,1 GB, un tamano coherente con un almacenamiento cuantizado en el entorno de 4-5 bits por parametro para 35B parametros, aunque la model card no especifica el esquema de cuantizacion.

Su relevancia es fundamentalmente practica y de nicho: permite ejecutar un MoE de 35B con solo ~3B parametros activos en una pila de inferencia alternativa escrita en C, sin depender de vLLM, PyTorch o llama.cpp. Para desarrolladores interesados en motores de inferencia minimalistas, despliegue en hardware limitado o investigacion sobre atencion lineal hibrida, este contenedor es un artefacto de referencia. Como contrapartida, es una publicacion de la comunidad con cero descargas, un "like", sin licencia declarada y sin resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido MoE con Gated-Attention y Gated DeltaNet (atencion lineal recurrente) en cada capa; cada capa incluye su bloque MoE/MLP |
| Parametros totales | 35B (derivado del nombre del modelo; no confirmado en la model card) |
| Parametros activos | Aproximadamente 3B (derivado del sufijo A3B; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio ocupa 21,1 GB, compatible con un almacenamiento en torno a 4-5 bits por parametro, pero no se especifica) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Contenedor propietario del motor colibri (pesos de DeltaNet bajo `model.layers.{i}.linear_attn.*`); no se declara safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card es un transformer hibrido: cada capa combina un mecanismo de atencion con compuertas (Gated-Attention) y un mecanismo de atencion lineal Gated DeltaNet, ejecutado mediante la regla delta con compuertas de forma recurrente. Ademas, cada capa incorpora su propio bloque MoE/MLP, de modo que la esparsidad por expertos se aplica en todas las capas del modelo. Los pesos de DeltaNet se almacenan bajo las claves `model.layers.{i}.linear_attn.*` y son consumidos por el motor `qwen36` implementado en C dentro del proyecto colibri (`c/qwen36.c`).

No hay informacion sobre el proceso de entrenamiento del modelo original: no se indica el numero de tokens, la composicion del dataset, ni si hubo etapas de RLHF, DPO u otros ajustes de alineamiento. Tampoco se documenta ninguna innovacion adicional mas alla de la hibridacion entre atencion con compuertas y atencion lineal DeltaNet. Es importante subrayar que este repositorio no contiene un entrenamiento nuevo: es un contenedor de pesos derivado de Qwen3.6-35B-A3B, y toda la informacion de arquitectura que aparece en la model card se refiere a como se estructuran y ejecutan esos pesos dentro del motor colibri.

## Capacidades

La informacion disponible no documenta las capacidades funcionales del modelo mas alla de su naturaleza como modelo de texto MoE. Los puntos siguientes distinguen lo confirmado de lo no documentado:

- Generacion de texto: implicita en la etiqueta `qwen3_5_moe_text` del repositorio, que identifica un modelo de texto con mezcla de expertos.
- Razonamiento, codigo y matematicas: no documentado en la informacion disponible.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no disponible (no se declara lista de idiomas).
- Capacidades especiales (modo thinking, vision, audio): no documentado en la informacion disponible.
- Eficiencia de atencion: la unica capacidad tecnica confirmada es la hibridacion de atencion con compuertas y Gated DeltaNet, orientada a reducir el coste de atencion en secuencias largas.

## Casos de uso

Los casos siguientes se derivan de las caracteristicas verificables del artefacto (MoE de 35B con ~3B activos, contenedor para un motor en C, 21,1 GB de pesos). No proceden de una evaluacion funcional publicada, por lo que deben validarse antes de llevarlos a produccion.

- Autohospedaje en estacion de trabajo con GPU unica: el repositorio de 21,1 GB y la esparsidad del MoE permiten plantear un despliegue en una GPU de 24-32 GB usando el motor colibri, evitando pilas de inferencia mas pesadas.
- Investigacion sobre atencion hibrida: al exponer los pesos de DeltaNet bajo `model.layers.{i}.linear_attn.*`, el contenedor sirve para estudiar como se comporta la regla delta con compuertas frente a la atencion softmax clasica en tareas de contexto largo.
- Desarrollo y depuracion de motores de inferencia en C: es un artefacto de prueba util para validar el camino de ejecucion de `c/qwen36.c` en el proyecto colibri, comparando resultados con otras implementaciones del mismo modelo base.
- Despliegue en entornos con restricciones de dependencias: al no requerir PyTorch ni CUDA-specific frameworks pesados (segun la naturaleza en C del motor), encaja en imagenes de contenedor minimas o entornos con control estricto de dependencias.
- Procesamiento por lotes offline de texto: un MoE de 35B con ~3B parametros activos es adecuado para tareas de generacion por lotes donde el coste computacional por token importa mas que la latencia interactiva.
- Evaluacion comparativa de cuantizaciones: el mismo contenedor permite medir la degradacion de calidad y el consumo de memoria al variar el esquema de cuantizacion de los pesos, si se generan variantes.
- Prototipado de asistentes de texto internos: en un escenario de red aislada o sin acceso a APIs externas, un modelo local de este tamano permite prototipar sin enviar datos a terceros, sujeto a resolver la licencia (no disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y los resultados de la busqueda web realizada no contienen informacion relacionada con este modelo (devolvieron exclusivamente paginas de ayuda de YouTube, sin conexion con el artefacto).

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del numero de parametros y del tamano del repositorio (21,1 GB); no estan confirmadas por el autor ni por mediciones publicadas.

- VRAM estimada en 4-5 bits (formato del repositorio): en torno a 22-26 GB de pesos y overhead, lo que exigiria una GPU de 24 GB como minimo y dejaria poco margen de contexto; una GPU de 32-48 GB seria lo recomendable.
- VRAM estimada en 8 bits: en torno a 37-40 GB, lo que requiere una A100 40 GB (muy justa) o una A6000/L40S de 48 GB.
- VRAM estimada en FP16/BF16: en torno a 70 GB, lo que requiere una A100 80 GB o una H100 80 GB.
- GPU consumer: con el formato actual de 21,1 GB, es plausible que quepa en una RTX 3090 o RTX 4090 de 24 GB, aunque el margen para cache KV es reducido. No confirmado por el autor.
- GPU de centro de datos: A100 40/80 GB, H100 80 GB, L40S 48 GB y A6000 48 GB son las opciones naturales para cuantizaciones mas altas.
- Opciones de despliegue: el unico motor confirmado es colibri (`https://github.com/JustVugg/colibri`, fichero `c/qwen36.c`). El soporte en vLLM, llama.cpp, Ollama o TGI no esta confirmado y, dado que el formato es un contenedor propio del motor colibri, requeriria una conversion previa.
- Latencia y throughput: no disponibles. Estructuralmente, con ~3B parametros activos el coste de computo por token es bajo, por lo que el rendimiento estara dominado por el ancho de banda de memoria al cargar los pesos del MoE.

## Comparativa con modelos similares

No se ha proporcionado informacion verificada sobre modelos comparables, por lo que no es posible construir una comparativa cuantitativa fiable. La alternativa mas cercana por nomenclatura seria la propia familia Qwen3 MoE (por ejemplo, variantes de 30B con ~3B activos), pero ni sus especificaciones ni las de este contenedor estan confirmadas en la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Krishal/QWen3.6-35B-A3B-Colibri | 35B totales / ~3B activos (derivado del nombre, no confirmado) | no disponible | no disponible | Repositorio HuggingFace, 0 descargas, 1 like | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no puede asumirse permiso para uso comercial. Es un bloqueante para cualquier despliegue en produccion hasta que el autor lo aclare.
- Artefacto de la comunidad sin validacion: 0 descargas y 1 like en el momento de la consulta; no hay evidencia de que los pesos hayan sido verificados frente al modelo original.
- Ausencia total de benchmarks: no hay ninguna medicion publicada de calidad, por lo que no puede compararse objetivamente con el modelo Qwen original ni con alternativas.
- Naturaleza de contenedor: no es un modelo entrenado ni ajustado, sino un empaquetado de pesos en un formato propietario. Cualquier expectativa de comportamiento diferencial respecto al modelo base carece de fundamento documentado.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos; no hay evaluaciones de fidelidad disponibles para este artefacto.
- Idiomas y contexto: se desconoce la ventana de contexto efectiva y la cobertura idiomatica, ambos datos criticos para planificar despliegues.
- Dependencia de un motor especifico: el formato de pesos esta ligado al motor colibri, lo que limita la portabilidad a otras pilas de inferencia y ata el mantenimiento al proyecto `JustVugg/colibri`.
- Fecha de publicacion llamativa: las marcas temporales del repositorio (creacion y actualizacion el 2026-09-16) deben tratarse con cautela al planificar su adopcion.
- Resultados de busqueda sin valor: las consultas web realizadas no devolvieron ninguna fuente tecnica sobre el modelo, por lo que toda la ficha se apoya unicamente en la informacion del repositorio de HuggingFace.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Krishal/QWen3.6-35B-A3B-Colibri
- Motor colibri: https://github.com/JustVugg/colibri
- Implementacion del motor Qwen3.6 en colibri: `c/qwen36.c` dentro del repositorio anterior
- Resultados de busqueda web: los resultados obtenidos corresponden a paginas de ayuda de YouTube y no guardan relacion con el modelo; no se han encontrado papers, blogs ni demos adicionales.
