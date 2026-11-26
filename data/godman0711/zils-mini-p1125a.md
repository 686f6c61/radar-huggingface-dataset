# godman0711/zils-mini-p1125a

## Resumen

zils-mini-p1125a es un checkpoint de pesos de lenguaje publicado por el usuario godman0711 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una copia sin modificar de los pesos del modelo base plantwaterer/peshtur (revision 93977ee696e576237b02dc1a8d49487d1f90885c), empaquetada como "cuerpo" (body) para la subred Zils (127) bajo la etiqueta d3-mini.

El repositorio contiene 4.539.265.536 parametros en formato safetensors, con un tamano total de 9,1 GB, lo que sugiere pesos en precision bf16/fp16. La model card indica explicitamente que faltan la cabeza de lectura (readout.safetensors) y el codigo del motor, por lo que el artefacto no es directamente ejecutable como modelo de chat o generacion sin el resto del pipeline de la subred Zils.

Su relevancia es limitada fuera del ecosistema Zils: se trata de un artefacto de infraestructura para un subnet descentralizado, no de un modelo listo para produccion. La informacion publica sobre arquitectura, datos de entrenamiento y capacidades es practicamente inexistente en la model card, que solo declara la procedencia de los pesos y la licencia Apache 2.0 heredada del repositorio original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la de plantwaterer/peshtur) |
| Parametros totales | 4.539.265.536 (~4,54 B) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (dos shards del modelo base; falta readout.safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. La model card de godman0711/zils-mini-p1125a no describe la topologia (transformer, MoE, hibrido, SSM), ni el numero de capas, dimension oculta o cabezas de atencion. Tampoco se documenta el proceso de entrenamiento: no hay datos sobre volumen de tokens, composicion del corpus, tecnicas de alineacion (RLHF, DPO, SFT) ni innovaciones tecnicas.

Lo unico verificable es que los pesos son una copia sin cambios ("unchanged language-model weights") del modelo plantwaterer/peshtur, y que el autor declara haber copiado tambien los ficheros LICENSE y NOTICE del repositorio de origen. El artefacto se presenta como "body" para el subnet Zils (127), lo que implica que el modelo completo requiere una cabeza de lectura y un motor externos no incluidos en este repositorio.

## Capacidades

- No se declaran capacidades especificas en la model card.
- Al ser una copia de los pesos de plantwaterer/peshtur, las capacidades reales dependen del modelo base, sobre el cual no se aporta informacion en este repositorio.
- No se documenta soporte de tool calling, function calling ni agentes.
- No se documenta modo de razonamiento (thinking mode), vision, audio ni otras modalidades.
- No se documenta cobertura multilingue.
- El artefacto no es ejecutable de forma autonoma: faltan la cabeza de lectura (readout.safetensors) y el codigo del motor.

## Casos de uso

- Investigacion sobre subredes descentralizadas: el checkpoint sirve como cuerpo de pesos para experimentar con el pipeline del subnet Zils (127), siempre que se disponga de la cabeza de lectura y el motor correspondientes.
- Auditoria de procedencia de pesos: permite verificar que los pesos publicados coinciden con la revision declarada de plantwaterer/peshtur comparando hashes de los shards safetensors.
- Replicacion de experimentos del subnet: util para reproducir el estado de un "soup body" d3-mini en un entorno controlado de investigacion.
- Archivado y espejo del modelo base: al conservar LICENSE y NOTICE del origen, puede emplearse como copia de respaldo de los pesos de plantwaterer/peshtur en la revision indicada.
- Integracion en pipelines de evaluacion internos: si el equipo dispone del motor Zils, el checkpoint puede cargarse para medir el comportamiento del body en tareas de generacion de texto.
- Estudio de artefactos de Hugging Face: caso de analisis sobre repositorios de bajo uso (0 descargas, 0 likes) y su relacion con modelos base de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 9 GB solo para pesos (4,54 B parametros x 2 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: en torno a 4,5-5 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 2,5-3 GB para pesos (requiere convertir los safetensors a GGUF u otro formato, ya que el repo solo publica safetensors).
- GPU recomendadas: no disponible (no se documenta hardware de referencia).
- Cabe en GPU de consumo: previsiblemente si en tarjetas con 12-16 GB o mas en bf16, y en tarjetas de 8 GB con cuantizacion a 4 bits, aunque no hay confirmacion oficial.
- Opciones de despliegue: no disponible; el artefacto no es ejecutable sin la cabeza de lectura y el motor del subnet Zils.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| godman0711/zils-mini-p1125a | ~4,54 B | no disponible | Apache 2.0 | safetensors, sin cabeza de lectura | Copia de plantwaterer/peshtur para subnet Zils |
| plantwaterer/peshtur | no disponible (origen de los pesos) | no disponible | Apache 2.0 (segun el repo derivado) | no disponible | Modelo base del que se copian los shards |
| Alternativas de ~4-5 B (p. ej. familias tipo Llama 3.2 3B, Qwen2.5 3B/7B) | 3-7 B | 8K-128K segun familia | licencias variables | amplia | Modelos ejecutables de forma autonoma con ecosistema de inferencia maduro |

No se dispone de datos de rendimiento del modelo ni de su base, por lo que la comparacion cuantitativa con alternativas no es posible.

## Limitaciones y advertencias

- Artefacto incompleto: faltan readout.safetensors y el codigo del motor, por lo que no puede ejecutarse de forma autonoma.
- Ausencia total de documentacion sobre arquitectura, entrenamiento, idiomas y capacidades; cualquier uso en produccion exige evaluacion empirica propia.
- Riesgo de sesgos y alucinaciones desconocido, al no haber informacion sobre el corpus de entrenamiento ni sobre alineacion.
- Sin datos de benchmarks ni evaluaciones publicadas; no hay evidencia de calidad.
- Repositorio sin traccion (0 descargas, 0 likes) y creado en 2026-11-25, lo que limita la confianza en su mantenimiento.
- La licencia Apache 2.0 se hereda del repositorio de origen; conviene revisar los ficheros LICENSE y NOTICE copiados para confirmar obligaciones de atribucion.
- Uso comercial tecnicamente permitido por Apache 2.0, pero sin garantias de funcionamiento ni soporte.
- No debe tratarse como un modelo de chat o generacion listo para usar: es un componente de infraestructura de un subnet descentralizado.

## Enlaces

- Hugging Face: https://huggingface.co/godman0711/zils-mini-p1125a
- Modelo base: https://huggingface.co/plantwaterer/peshtur
- Revision del modelo base citada: 93977ee696e576237b02dc1a8d49487d1f90885c
