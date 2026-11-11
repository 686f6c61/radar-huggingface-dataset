# ContinuousIntelligence/ci-proto

## Resumen

ci-proto es un modelo publicado en Hugging Face por la organizacion ContinuousIntelligence. La model card asociada es practicamente vacia: solo declara la licencia `ci-proto-licence` (registrada como `other` en los metadatos) y no aporta informacion sobre arquitectura, tamano de parametros, contexto, datos de entrenamiento ni capacidades. El repositorio ocupa 1,3 GB, lo que sugiere pesos de un modelo de escala pequena o media, pero no permite deducir el numero de parametros ni el tipo de cuantizacion sin inspeccionar los ficheros.

El modelo se publico el 11 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni likes, no tiene pipeline declarado y no lista idiomas soportados. No dispone de benchmarks, demos ni documentacion tecnica adicional accesible a traves de los metadatos proporcionados.

Por su estado (prototipo, licencia propia no estandar y ausencia total de documentacion), ci-proto debe considerarse un artefacto experimental sin garantias de produccion. Cualquier evaluacion seria requiere descargar los pesos, inspeccionar la configuracion y ejecutar pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | ci-proto-licence (registrada como `other`) |
| Formato de pesos | no disponible (repositorio de 1,3 GB) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la model card ni en los metadatos de Hugging Face. Se desconoce si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura hibrida o cualquier otra variante.

Tampoco hay datos sobre el corpus de entrenamiento (numero de tokens, composicion, idiomas), sobre el proceso de alineacion (RLHF, DPO, SFT) ni sobre innovaciones tecnicas como atencion lineal, decodificacion especulativa o modos de razonamiento extendido. El unico dato objetivo es el tamano del repositorio (1,3 GB), que acota el espacio de pesos pero no permite inferir la configuracion exacta.

## Capacidades

- No se ha documentado ninguna capacidad especifica en la informacion disponible.
- No consta soporte de tool calling ni function calling.
- No consta soporte de agentes ni de razonamiento multi-paso.
- No consta capacidad multilingue declarada.
- No consta soporte de vision, audio ni modos de pensamiento extendido.
- La ausencia de pipeline declarado impide confirmar incluso la tarea principal (text-generation, embeddings u otra).

## Casos de uso

- Evaluacion interna de prototipos: el modelo puede descargarse y someterse a pruebas de humo para determinar su tarea real antes de considerarlo en cualquier flujo de trabajo.
- Investigacion sobre licencias no estandar: sirve como caso de estudio para analizar como se declaran licencias personalizadas en Hugging Face y que implicaciones tienen para la redistribucion.
- Pruebas de integracion de pipelines de inferencia: al no tener pipeline declarado, es util para validar herramientas que detectan automaticamente la arquitectura a partir de los ficheros de pesos.
- Comparativas de robustez de tooling: util para comprobar como se comportan cargadores como transformers, llama.cpp o vLLM ante repositorios sin configuracion documentada.
- Docencia sobre publicacion de modelos: ejemplo practico de una model card incompleta y de los riesgos de publicar artefactos sin especificaciones.
- Auditoria de seguridad de artefactos: permite practicar la inspeccion de pesos y ficheros de configuracion de origen desconocido antes de ejecutarlos en entornos aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende de la arquitectura y del numero de parametros, que no se han publicado.
- GPU recomendadas: no disponible.
- Encaje en GPU de consumo: no confirmado; el repositorio de 1,3 GB es compatible con GPUs de 8-16 GB si los pesos estan cuantizados, pero no puede verificarse sin conocer el formato.
- Opciones de despliegue: no confirmadas; al no declararse pipeline ni arquitectura, no se puede garantizar compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La ausencia de datos sobre parametros, contexto y tarea impide identificar modelos comparables de la misma categoria.

## Limitaciones y advertencias

- Model card practicamente vacia: no hay informacion sobre arquitectura, entrenamiento ni evaluacion.
- Licencia `ci-proto-licence` no estandar: es imprescindible revisar el fichero LICENCE del repositorio antes de cualquier uso, especialmente comercial.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni de validacion externa.
- Sin pipeline declarado: la tarea del modelo no esta confirmada.
- Riesgo de alucinacion y sesgos: desconocido, al no existir evaluaciones publicadas.
- Idiomas soportados no declarados: no se puede asumir calidad en castellano ni en ningun otro idioma.
- Estado de prototipo: no apto para produccion sin una evaluacion exhaustiva previa.
- Procedencia y seguridad: al ser un artefacto sin documentacion, conviene inspeccionar los ficheros y ejecutarlo en entornos aislados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ContinuousIntelligence/ci-proto
- Licencia: https://huggingface.co/ContinuousIntelligence/ci-proto/blob/main/LICENCE
