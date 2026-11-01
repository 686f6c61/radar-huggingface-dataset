# KonradDallaOrg/dimmy-minicpm5-gguf

## Resumen

dimmy-minicpm5-gguf es un espejo no modificado de los ficheros GGUF del modelo MiniCPM5-2B que la aplicación Dimmy descarga en local, publicado por el usuario KonradDallaOrg para que dicha aplicación no dependa de que los repositorios originales de OpenBMB sigan disponibles. No se trata de un modelo entrenado por el autor del repo: el único artefacto es una cuantización Q4_K_M, byte a byte idéntica al fichero publicado por OpenBMB en `openbmb/MiniCPM5-2B-GGUF` en la revisión `2079a22f3beaa4e306449978533478fe0522f4b3`.

El modelo subyacente, MiniCPM5-2B, pertenece a la familia MiniCPM de OpenBMB y cuenta con 2.516.756.480 parámetros totales según los pesos en safetensors del modelo base. El repositorio ocupa 1,6 GB y contiene un único fichero GGUF de 1.561.318.368 bytes (aproximadamente 1,45 GiB), lo que lo sitúa en el rango de modelos pequeños aptos para inferencia local en hardware de consumo.

Su relevancia es fundamentalmente práctica: sirve como dependencia estable para la app Dimmy y como ejemplo de publicación de cuantizaciones verificables mediante hash SHA-256. Para cualquier uso fuera de ese contexto, conviene acudir directamente al repositorio upstream de OpenBMB, que es donde reside el desarrollo, la documentación y las actualizaciones del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base MiniCPM5-2B de OpenBMB; no se detalla en la informacion proporcionada) |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (única incluida en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `MiniCPM5-2B-Q4_K_M.gguf`, 1.561.318.368 bytes) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, los datos de entrenamiento ni el proceso de alineación (RLHF, DPO u otros) en la información proporcionada. La model card del repo espejo no describe el modelo base, y el autor declara explícitamente que no ha modificado los ficheros: se limita a replicar la cuantización Q4_K_M generada por OpenBMB a partir de MiniCPM5-2B.

El único dato técnico verificable del proceso es la cadena de trazabilidad: el fichero GGUF procede del repositorio `openbmb/MiniCPM5-2B-GGUF` en la revisión `2079a22f3beaa4e306449978533478fe0522f4b3`, con hash SHA-256 `ec2d5801640099e97d8d7e8003ad4d81f336e757811f03a26173dddf386602fd` (hash LFS del Hub). Cualquier detalle sobre atención, tokenizador, ventana de contexto o composición del corpus debe consultarse en la documentación del modelo base.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` del repo y el pipeline de la app Dimmy indican uso previsto como modelo de chat local.
- Inferencia local offline: el formato GGUF Q4_K_M está pensado para ejecutarse en CPU y GPU de consumo mediante runners compatibles con GGUF.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que el artefacto puede servirse a través de infraestructura de endpoints compatible con el Hub.
- Capacidades específicas del modelo base (razonamiento, código, matemáticas, tool calling, agentes, multilingüismo, visión, modo thinking): no disponibles en la información proporcionada; deben verificarse en la documentación de `openbmb/MiniCPM5-2B`.

## Casos de uso

- Distribución de una app de escritorio con LLM local: Dimmy usa este repo como origen estable del fichero Q4_K_M, de modo que la aplicación puede descargar el modelo sin depender de la disponibilidad del repositorio upstream. Es adecuado porque el fichero es idéntico byte a byte y su hash permite verificar la integridad tras la descarga.
- Prototipado de asistentes conversacionales en local: con 2.516.756.480 parámetros y cuantización Q4_K_M, el modelo puede cargarse en un portátil para probar flujos de chat sin coste de API ni envío de datos a terceros.
- Evaluación de pipelines GGUF: sirve como caso de prueba reproducible para validar cargadores, tokenizadores y servidores compatibles con GGUF antes de pasar a modelos mayores.
- Verificación de cadena de suministro de modelos: el repo documenta origen, revisión y SHA-256, lo que permite auditar que el artefacto desplegado coincide con el publicado por OpenBMB.
- Docencia y experimentación con cuantización: útil para comparar el comportamiento de un modelo de ~2,5B parámetros en Q4_K_M frente a otras precisiones del mismo modelo base.
- Base para aplicaciones de escritorio con requisitos de privacidad: al ejecutarse en local, encaja en herramientas donde el texto del usuario no debe salir del dispositivo, siempre que se validen las capacidades reales del modelo base para la tarea concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa 1.561.318.368 bytes (~1,45 GiB); con overhead de contexto y buffers de ejecución, cabe holgadamente en GPUs con 4 GB o más. La ejecución en CPU es viable con RAM suficiente para el fichero y la caché KV.
- GPU recomendadas: no hay datos específicos del modelo base. Por tamaño, cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) puede alojarlo completo; A100 y H100 son sobredimensionadas para este artefacto.
- Cabe en GPU de consumo: sí, con 4 GB de VRAM o más se espera margen suficiente para el modelo cuantizado; conviene reservar memoria adicional para el contexto.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; la etiqueta `endpoints_compatible` apunta a servidores de endpoints del Hub. vLLM y TGI no se citan en la información disponible para este artefacto GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| dimmy-minicpm5-gguf (este repo) | 2.516.756.480 | no disponible | Apache 2.0 | GGUF Q4_K_M | Espejo de un único fichero |
| openbmb/MiniCPM5-2B | 2.516.756.480 | no disponible | Apache 2.0 (según repo espejo) | safetensors (modelo base) | Repo upstream de OpenBMB |
| openbmb/MiniCPM5-2B-GGUF | 2.516.756.480 | no disponible | Apache 2.0 (según repo espejo) | GGUF (varias cuantizaciones) | Repo upstream de OpenBMB |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada; la comparación se limita a trazabilidad y formato del artefacto.

## Limitaciones y advertencias

- El repo no aporta ningún valor técnico sobre el modelo base: es un espejo de un solo fichero Q4_K_M, sin safetensors, sin tokenizador propio ni documentación adicional.
- No hay información sobre sesgos, tasa de alucinación, idiomas o limitaciones de contexto; deben consultarse en la documentación de MiniCPM5-2B.
- La licencia Apache 2.0 se hereda del modelo base según la model card; conviene verificar los términos exactos en el repositorio de OpenBMB antes de un uso comercial.
- Al ser un espejo, no recibirá actualizaciones del modelo base; si OpenBMB publica revisiones nuevas, este repo quedará desactualizado salvo que el autor lo actualice.
- La fecha de creación indicada (2026-10-30) es posterior a la fecha actual de referencia habitual; conviene tratarla como metadato del Hub y no como garantía de mantenimiento.
- El número de descargas (24) y de likes (0) es muy bajo, por lo que no hay señal de validación comunitaria sobre el artefacto.
- Para producción, se recomienda descargar directamente de `openbmb/MiniCPM5-2B-GGUF` y verificar el SHA-256 contra el publicado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/KonradDallaOrg/dimmy-minicpm5-gguf
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- GGUF upstream: https://huggingface.co/openbmb/MiniCPM5-2B-GGUF
- Fichero upstream en la revisión citada: https://huggingface.co/openbmb/MiniCPM5-2B-GGUF/resolve/2079a22f3beaa4e306449978533478fe0522f4b3/MiniCPM5-2B-Q4_K_M.gguf
