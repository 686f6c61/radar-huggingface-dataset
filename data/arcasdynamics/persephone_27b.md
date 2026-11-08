# arcasdynamics/persephone_27b

## Resumen

Persephone 27B es un modelo de lenguaje publicado en Hugging Face por el usuario arcasdynamics bajo licencia Apache 2.0. El repositorio no incluye model card descriptiva: la unica informacion disponible en el README es la declaracion de licencia, sin datos sobre arquitectura, entrenamiento, idiomas o capacidades. El nombre sugiere un modelo de aproximadamente 27 mil millones de parametros, pero este dato no esta confirmado por ninguna fuente oficial del repositorio.

El modelo se publico el 8 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni interacciones en la plataforma. No se dispone de pipeline declarado, lo que impide confirmar si se trata de un modelo de generacion de texto, un modelo multimodal o de otra categoria.

La relevancia actual es limitada por la ausencia total de documentacion tecnica. Sin model card, sin benchmarks y sin ejemplos de uso, cualquier evaluacion rigurosa requiere descargar los pesos y realizar pruebas propias. Esta ficha recoge exclusivamente los datos verificables y marca como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el nombre sugiere 27B, sin confirmar) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo. Se desconoce si emplea un transformer denso, una arquitectura de mezcla de expertos (MoE), un modelo de estado espacio (SSM) o un diseno hibrido. Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineacion.

El repositorio no incluye configuracion, tokenizer ni documentacion auxiliar en la informacion proporcionada, por lo que no es posible verificar ninguna innovacion tecnica asociada al modelo.

## Capacidades

- No se han documentado capacidades especificas en la informacion disponible.
- No hay confirmacion de soporte de tool calling o function calling.
- No hay confirmacion de capacidades de agente o razonamiento multi-paso.
- No hay confirmacion de capacidades multilingues.
- No hay confirmacion de modo thinking, vision o audio.

## Casos de uso

- Evaluacion experimental en laboratorio: el modelo puede descargarse y someterse a pruebas controladas para determinar su comportamiento real, dado que no existe documentacion oficial que guie su uso.
- Investigacion sobre modelos sin model card: util como caso de estudio sobre publicaciones de pesos sin documentacion asociada y sus implicaciones para la reproducibilidad.
- Pruebas de integracion temprana: un equipo con infraestructura propia podria desplegarlo en un entorno aislado para verificar si el pipeline de inferencia funciona con los formatos de pesos incluidos.
- Analisis de seguridad y sesgos: al no existir evaluaciones publicadas, resulta candidato para auditorias propias de alineacion y sesgo antes de cualquier uso real.
- Benchmarking interno comparativo: si se confirma el tamano de 27B, podria compararse contra otros modelos de esa escala en tareas estandar definidas por el propio equipo evaluador.
- Docencia y formacion: como ejemplo practico de repositorio con licencia permisiva pero sin documentacion, util para ensenar buenas practicas de publicacion de modelos.

En todos los casos, el uso en produccion requeriria primero una evaluacion propia completa, dada la ausencia de datos oficiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Si el modelo tuviera 27B parametros, una estimacion orientativa en FP16 seria de aproximadamente 54 GB, y en cuantizacion de 4 bits alrededor de 14-16 GB, pero estos calculos son especulativos y no estan confirmados por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: no disponibles. No se ha confirmado compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros motores de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. Al no conocerse la arquitectura, el tamano confirmado ni las capacidades del modelo, no es posible establecer una comparacion fundamentada con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre arquitectura, entrenamiento, datos utilizados ni evaluaciones.
- Riesgo de alucinacion y sesgos: sin datos de alineacion ni evaluaciones publicadas, no es posible estimar su comportamiento en estos aspectos.
- Idiomas: se desconoce que idiomas soporta y con que calidad.
- Contexto: se desconoce la longitud maxima de contexto, lo que impide planificar su uso en tareas de contexto largo.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero la falta de documentacion traslada al usuario toda la responsabilidad sobre el comportamiento del modelo.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la publicacion, lo que reduce la probabilidad de que existan informes independientes de uso o incidencias resueltas.
- Recomendacion: no desplegar en produccion sin una evaluacion propia previa que cubra calidad, seguridad y sesgos.

## Enlaces

- Hugging Face: https://huggingface.co/arcasdynamics/persephone_27b
- Civitai (etiqueta "Persephone", contenido no verificado como relacionado): https://civitai.com/tag/persephone
