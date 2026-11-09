# cultureyes-stack/cultureyes-stack

## Resumen

Cultureyes-stack es el espacio de publicacion de un desarrollador individual radicado en Emiratos Arabes Unidos que distribuye modelos abiertos y las herramientas asociadas bajo la marca Cultureyes. El repositorio no contiene pesos de un modelo propio, sino una model card descriptiva que actua como indice de los proyectos en curso: la familia de modelos HajeriLM, el modelo Operator 4B (arabe-ingles), el marco de evaluacion MIZAN y las herramientas de inferencia HIM. En el momento de la consulta no se ha publicado ningun artefacto descargable ni metadatos tecnicos del modelo.

El unico modelo concreto mencionado es Operator 4B, descrito como un modelo bilingue arabe-ingles de 4 mil millones de parametros perteneciente a la familia HajeriLM. La model card anuncia una version GGUF para uso local "en preparacion", pendiente de validacion, pero no enlaza pesos, tokenizador, configuracion ni resultados de evaluacion. La fecha de creacion del repositorio (2026-11-09) y la ausencia de descargas o likes indican que se trata de un lanzamiento inicial sin adopcion registrada.

La relevancia actual es limitada desde el punto de vista practico: no hay pipeline declarado, no hay licencia, no hay idiomas formalmente etiquetados y no hay benchmarks. Para un desarrollador o investigador que necesite evaluar el modelo, esta ficha solo puede documentar la intencion declarada por el autor y las incognitas que quedan abiertas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 4B (aproximado, segun la denominacion "Operator 4B"; no confirmado en metadatos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se anuncia una version GGUF "en preparacion") |
| Idiomas soportados | arabe e ingles (declarado en la model card; no etiquetado en metadatos) |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se han publicado pesos; se menciona GGUF futuro) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo Operator 4B ni de la familia HajeriLM. La model card no especifica si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura hibrida o cualquier otra variante. Tampoco se detalla el numero de tokens de entrenamiento, la composicion del corpus (proporcion arabe-ingles, fuentes, filtrado), ni si se aplicaron tecnicas de alineacion como RLHF, DPO o instruction tuning.

La unica innovacion tecnica declarada es la intencion de publicar una version GGUF para inferencia local tras un proceso de validacion, lo que sugiere un enfoque orientado al despliegue en hardware de consumo. No hay informacion sobre tokenizador, atencion lineal, decodificacion especulativa ni optimizaciones de inferencia. Los proyectos MIZAN (evaluacion) y HIM (herramientas de inferencia multiplataforma) se mencionan como trabajo en curso, sin documentacion tecnica disponible.

## Capacidades

- Generacion de texto bilingue arabe-ingles: capacidad declarada por el autor, sin ejemplos ni evaluacion publicada.
- Razonamiento, codigo y matematicas: no disponible; no se documenta ninguna capacidad especifica.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas a arabe e ingles segun la model card; no se confirma cobertura de otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Evaluacion exploratoria de modelos bilingues arabe-ingles: un investigador podria descargar la version GGUF (cuando se publique) para comparar su comportamiento en tareas de generacion en ambos idiomas frente a otros modelos de 4B, siempre que la licencia lo permita.
- Prototipado local en hardware de consumo: el anuncio de una cuantizacion GGUF sugiere un uso previsto en equipos sin GPU de datacenter, adecuado para pruebas de concepto de asistentes en arabe.
- Analisis de ecosistema de modelos abiertos regionales: util para estudiar la produccion de modelos en la region del Golfo y las practicas de publicacion de desarrolladores independientes.
- Integracion en herramientas de inferencia HIM: si el autor publica HIM, el modelo podria servir como caso de prueba para validar el soporte multiplataforma de dicha herramienta.
- Base para evaluacion con MIZAN: el modelo podria emplearse como sujeto de prueba del marco de evaluacion MIZAN una vez que este se documente.
- Fine-tuning comunitario: si se publican pesos y una licencia permisiva, la comunidad podria adaptarlo a dominios especificos en arabe; actualmente no es posible por la ausencia de artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision. Como referencia orientativa para un modelo denso de 4B, una cuantizacion de 4 bits requeriria aproximadamente 2,5-3 GB de VRAM mas overhead de contexto; en FP16, alrededor de 8 GB. Estas cifras son estimaciones genericas y no estan confirmadas para este modelo.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; la intencion declarada de publicar GGUF sugiere que el autor apunta a este escenario.
- Opciones de despliegue: no disponible; se menciona la herramienta HIM del propio autor, sin documentacion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| Cultureyes Operator 4B | 4B (declarado) | no disponible | arabe, ingles | no disponible | no publicados |
| Qwen2.5-3B / 7B | 3B / 7B | 32K (128K en variantes) | multilingue | Apache 2.0 (mayoria) | publicados |
| Llama 3.2 3B | 3B | 128K | multilingue | Llama Community License | publicados |
| Gemma 2 2B | 2B | 8K | multilingue | Gemma Terms of Use | publicados |

La comparativa es estructural: los modelos alternativos cuentan con pesos publicos, licencia definida y evaluaciones documentadas, mientras que Operator 4B no ofrece ninguno de estos elementos en la informacion disponible. No se dispone de datos de rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de artefactos: no hay pesos, tokenizador, configuracion ni codigo en el repositorio; el modelo no es usable actualmente.
- Licencia no especificada: impide cualquier evaluacion de viabilidad para uso comercial o redistribution.
- Sin benchmarks ni evaluacion: no es posible estimar calidad, sesgos o robustez.
- Idiomas declarados pero no etiquetados: la cobertura real del arabe (variantes dialectales frente a arabe estandar moderno) es desconocida.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje; sin datos de alineacion no puede acotarse.
- Sesgos: no documentados; se desconoce la composicion del corpus de entrenamiento.
- Informacion de proyecto en estado temprano: la model card mezcla hoja de ruta y descripcion, sin separar claramente lo publicado de lo planificado.
- Fecha de creacion futura en metadatos (2026-11-09): conviene verificar la integridad de los metadatos antes de citar el repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cultureyes-stack/cultureyes-stack
- Modelo Operator 4B (referenciado en la model card): https://huggingface.co/cultureyes-stack/Operator
- Paper, blog, repositorio de codigo o demo: no disponible
