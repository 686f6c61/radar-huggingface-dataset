# prestonlogan/Qwen3.8-Flash-Next-MTP-Draft-Head

## Resumen

Qwen3.8-Flash-Next MTP Draft Head es una cabeza de prediccion multi-token (MTP, *multi-token prediction*) destilada para el modelo Qwen3.8-Flash-Next, publicada por el usuario prestonlogan. No se trata de un modelo generativo autonomo: su unica funcion es proponer tokens candidatos dentro de un esquema de decodificacion especulativa, que el modelo objetivo verifica despues. Forma parte de la receta "Qwen3.8-Flash-Next Single DGX Spark Ultrafast" (v1.1.0 o superior), pensada para servir el modelo base en un unico dispositivo NVIDIA DGX Spark mediante el runtime Hibana.

El artefacto se distribuye como dos ficheros PyTorch (`torch.load` con `weights_only=True`): un cuerpo MTP de unos 178 MB (atencion, normalizaciones y proyecciones) y un fichero de 1,03 GB con los 512 expertos enrutados del cabezal en formato de 3 bits propio de Hibana. El repositorio ocupa 1,2 GB en total. La innovacion principal es que los expertos en 3 bits liberan aproximadamente 1,5 GiB de memoria frente al cabezal MTP original del checkpoint.

Su relevancia es practica y acotada: con aceptacion exacta (`TUNING=v1.1-exact`) la distribucion servida es identica a la del modelo objetivo, de modo que un mejor cabezal de borrador mejora la velocidad pero no altera las respuestas. La receta por defecto relaja ligeramente la aceptacion (`accept_soft` 0.35 en muestreo y la regla top-3 de Hibana a temperatura 0). Es, por tanto, una pieza de infraestructura de inferencia, no un modelo que se evalue por sus capacidades cognitivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza MTP (multi-token prediction) con 512 expertos enrutados sobre el modelo base Qwen3.8-Flash-Next; cuerpo con atencion, normalizaciones y proyecciones |
| Parametros totales | no disponible (el repositorio pesa 1,2 GB; cuerpo de 177.868.149 B y expertos de 1.030.229.181 B en 3 bits) |
| Parametros activos | no disponible (512 expertos enrutados, sin detalle de enrutamiento activo) |
| Longitud de contexto | no disponible (heredada del modelo objetivo Qwen3.8-Flash-Next, no especificada) |
| Tipos de cuantizacion | Expertos en formato de 3 bits propio de Hibana (`w3exp`); cuerpo en punto flotante PyTorch sin cuantizar declarada |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`qwen-community-1.0`) |
| Formato de pesos | PyTorch state dict (`.pt`), cargado con `torch.load(..., weights_only=True)` |

## Arquitectura y entrenamiento

El cabezal sigue el esquema MTP del checkpoint original de Qwen3.8-Flash-Next, pero se ha redisenado como un modulo con 512 expertos enrutados cuantizados a 3 bits en el formato de Hibana. El cuerpo (atencion, normas y proyecciones) se mantiene en un state dict independiente de 178 MB, mientras que los expertos ocupan 1,03 GB. Esta separacion permite cargar los expertos en el formato de 3 bits del runtime y ahorrar unos 1,5 GiB de memoria frente al cabezal MTP de serie.

El entrenamiento parte del propio cabezal MTP del checkpoint (*warm start*) y aplica destilacion contra las distribuciones de salida de Qwen3.8-Flash-Next sobre 858 trazas de texto e imagen. La funcion de perdida se disena para maximizar la aceptacion especulativa: divergencia KL mas un termino de solapamiento (1 - suma de min(p, q)) evaluado sobre cuatro pasos de *rollout*. Se entrena una LoRA de rango 32 sobre los 512 expertos y se fusiona en los pesos de 3 bits. No se documentan el numero de tokens de entrenamiento ni la composicion completa del dataset mas alla de las 858 trazas citadas.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa: propone tokens que el modelo objetivo Qwen3.8-Flash-Next verifica despues.
- Prediccion multi-token (MTP): emite propuestas para varios pasos de *rollout* (cuatro en el entrenamiento), lo que permite validar varias posiciones por iteracion.
- Aceptacion exacta opcional: con `TUNING=v1.1-exact` la distribucion servida coincide con la del modelo objetivo, por lo que no altera las respuestas.
- Aceptacion relajada por defecto: `accept_soft` 0.35 en muestreo y regla top-3 de Hibana a temperatura 0.
- Integracion con el runtime Hibana mediante variables de entorno (`HIBANA_MTP_WEIGHTS`, `HIBANA_MTP_W3_EXPERTS`, `HIBANA_MTP_W3_EXPERTS_PATH`).
- Soporte de trazas multimodales en el entrenamiento (texto e imagen), aunque el cabezal solo propone tokens de texto.
- No soporta tool calling, agentes, vision ni audio por si mismo: esas capacidades pertenecen al modelo objetivo.

## Casos de uso

- Aceleracion de inferencia en un unico DGX Spark: el cabezal se usa con la receta "Single DGX Spark Ultrafast" para aumentar la velocidad de generacion de Qwen3.8-Flash-Next sin cambiar las respuestas cuando se activa la aceptacion exacta.
- Despliegue con memoria ajustada: los expertos en 3 bits liberan unos 1,5 GiB frente al cabezal original, lo que permite mantener el modelo objetivo y el cabezal en el mismo dispositivo con menos presion de VRAM.
- Servicio de chat interactivo: al reducir el coste por token verificado, mejora la latencia percibida en conversaciones multi-turno servidas con Hibana.
- Generacion de codigo en pipelines internos: la decodificacion especulativa acelera la salida de bloques de codigo largos, donde la verificacion del modelo objetivo mantiene la calidad.
- Procesamiento por lotes de documentos: en tareas de resumen o extraccion con contexto largo, el mayor throughput reduce el tiempo total de la tanda.
- Experimentacion en investigacion sobre decodificacion especulativa: sirve como banco de pruebas para medir tasas de aceptacion con distintos valores de `accept_soft` y comparar cabezales MTP destilados.
- Reproduccion de la receta en entornos Hibana: permite validar el flujo de descarga, verificacion SHA-256 y carga de pesos descrito por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el cabezal: aproximadamente 1,2 GB en disco; en memoria, el cuerpo de 178 MB mas los expertos de 3 bits (1,03 GB), con un ahorro declarado de unos 1,5 GiB frente al cabezal original.
- GPU recomendada: NVIDIA DGX Spark, el objetivo declarado de la receta del autor.
- No se documenta compatibilidad con GPU de consumo (RTX 4090 u otras); el runtime Hibana y la receta estan orientados a DGX Spark.
- Opciones de despliegue: Hibana v0.1.0 con el parche `patches/0004` de la receta (las variables de entorno de pesos MTP no las lee el Hibana upstream sin ese parche).
- Latencia y throughput: no disponibles; dependen de la tasa de aceptacion del cabezal y de la configuracion `TUNING`.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next MTP Draft Head (este) | Cabezal MTP destilado, 512 expertos en 3 bits | no disponible (1,2 GB en repo) | no disponible | Qwen Community 1.0 | Hugging Face, 0 descargas |
| Cabezal MTP original de Qwen3.8-Flash-Next | Cabezal MTP de serie | no disponible | no disponible | Qwen Community 1.0 | Incluido en el checkpoint base |
| Otros cabezales de decodificacion especulativa | Borradores EAGLE/Medusa y similares | no disponible | no disponible | variable | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo autonomo: solo propone tokens y requiere Qwen3.8-Flash-Next como verificador; no puede usarse para generar respuestas por si solo.
- La aceptacion relajada por defecto (`accept_soft` 0.35 y regla top-3 a temperatura 0) modifica ligeramente la distribucion servida; solo `TUNING=v1.1-exact` garantiza la distribucion del modelo objetivo.
- Requiere el parche `patches/0004` de la receta; Hibana v0.1.0 upstream no lee las variables `HIBANA_MTP_*`.
- Entrenado sobre 858 trazas de texto e imagen: un conjunto reducido que puede limitar la tasa de aceptacion en dominios alejados de esas trazas.
- Sin datos publicados de benchmarks, tasas de aceptacion medidas ni latencia; el rendimiento real no esta cuantificado.
- Idiomas soportados no disponibles; la cobertura linguistica depende del modelo objetivo.
- Licencia Qwen Community 1.0 con condiciones especificas para despliegues comerciales a gran escala y para negocios de Model-as-a-Service y AI Work Assistant; revisar `LICENSE` antes de uso comercial.
- Repositorio sin descargas ni likes en el momento de la consulta y creado en noviembre de 2026: madurez y soporte de la comunidad no verificables.
- Riesgo de alucinacion y sesgos: heredados del modelo objetivo, no evaluados de forma independiente para este cabezal.

## Enlaces

- Hugging Face: https://huggingface.co/prestonlogan/Qwen3.8-Flash-Next-MTP-Draft-Head
- Receta "Qwen3.8-Flash-Next Single DGX Spark Ultrafast": https://github.com/prestonlogan/Qwen3.8-Flash-Next-Single-DGX-Spark-Ultrafast
- Runtime Hibana: https://github.com/sharar-project/hibana
- Modelo base Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
