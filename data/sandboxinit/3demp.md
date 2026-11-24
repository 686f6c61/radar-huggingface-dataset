# sandboxinit/3demp

## Resumen

`3demp` es un repositorio publicado en Hugging Face por el usuario `sandboxinit` bajo el identificador `sandboxinit/3demp`. A pesar de estar alojado en la plataforma de Hugging Face, no se trata de un modelo de pesos entrenados en el sentido convencional: la model card lo describe como la "versión completa de la plataforma Emporium y su cerebro operativo", es decir, un archivo de proyecto (una aplicación Next.js con módulos de Studio, Playground, Codex y Catalog, junto con convertidores y herramientas) acompañado de documentación operativa en Markdown.

El contenido declarado incluye un archivo ZIP con el proyecto r9 completo, manuales internos (`brain/i_c_e.md` y `brain/CREATE-ANYTHING.md`), un catálogo de activos 3D verificados contra la API de Sketchfab (`codex/`) y un manifiesto de objetos generados localmente con dimensiones citadas (`created_objects/manifest.json`). La temática es la creación y curaduría de activos 3D de alta fidelidad a partir de imágenes de referencia, con un pipeline que pasa por un endpoint de visión (`/api/vision/assess`), un planificador de blueprints y una fase de construcción determinista con iteración por captura de pantalla.

No hay información pública sobre arquitectura de red neuronal, número de parámetros, longitud de contexto, proceso de entrenamiento ni resultados de benchmarks. El tamaño del repositorio es de 0,0 GB, las descargas y los "likes" son cero, y la licencia y los idiomas no están declarados. Cualquier evaluación como modelo de lenguaje debe hacerse, por tanto, con extrema cautela: los datos disponibles describen un artefacto de software y su documentación, no un modelo con pesos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene una aplicación Next.js y documentación, no se declaran pesos de red neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el contenido declarado son archivos ZIP, Markdown y JSON) |

## Arquitectura y entrenamiento

No se ha publicado información sobre arquitectura de modelo (transformer, MoE, SSM o híbrida), número de tokens de entrenamiento, composición del dataset ni técnicas de alineación como RLHF o DPO. La model card no describe un proceso de entrenamiento de pesos.

Lo que sí se documenta es la arquitectura del sistema de software: una aplicación Next.js con módulos Studio, Playground, Codex y Catalog, un endpoint `/api/vision/assess` que emplea un modelo de visión-lenguaje (referido como "VLM §7 ladder") para comparar imágenes de referencia contra anclas dimensionales aprendidas, un "Blueprint Planner" que aplica una "REALISM & FIDELITY LAW", un esquema `AssetRecipe` y una fase de construcción determinista seguida de iteración mediante capturas de pantalla. El catálogo `codex/` se presenta como datos verificados entrada por entrada contra la API de Sketchfab (recuento de caras, licencias y autores). No se especifica qué VLM concreto se invoca en el endpoint de visión.

## Capacidades

- Generación y curaduría de activos 3D a partir de imágenes de referencia, según el pipeline descrito en la model card (imagen → evaluación de visión → orden de construcción medida → emparejamiento con donantes → blueprint → receta → construcción determinista).
- Medición y evaluación de imágenes mediante un protocolo propio ("Measure & Assess") con anclas dimensionales del mundo real y una gramática de estricta realidad; cada número se marca como medido [M] o especificación del mundo real [R].
- Catalogación de activos 3D con verificación por API de Sketchfab (recuento de caras, licencias, autores), con rechazo declarado de activos de baja poligonización o arcaicos.
- Creación de activos mediante un playbook universal (`CREATE-ANYTHING.md`) que define Golden Path, Blueprint, esquema `AssetRecipe`, "R-math" y un protocolo ASK→RECIPE.
- Cobertura temática declarada del catálogo: personajes (militar, servicio, táctico: policía, bomberos, sanitarios, operaciones especiales, tripulación), vehículos (barreras, transporte militar y civil, coches deportivos, réplicas), vegetación (árboles, arbustos), ciudades completas y mobiliario urbano.
- No se declaran capacidades de generación de texto libre, razonamiento general, código, matemáticas, tool calling genérico, agentes multi-paso ni soporte multilingüe medido.

## Casos de uso

- Poblado de escenas 3D en producción: el pipeline descrito permite tomar una imagen de referencia y generar una orden de construcción con dimensiones medidas, lo que encaja en flujos de trabajo de diseño de niveles o previsualización arquitectónica donde la coherencia dimensional es crítica.
- Curaduría de bibliotecas de activos: el catálogo `codex/` con verificación por API de Sketchfab sirve para construir inventarios de activos con licencias y autores trazables, útil en equipos que necesitan cumplimiento de licencias antes de incorporar geometría de terceros.
- Previsualización rápida de conceptos: el módulo Studio con pasos de un clic por etapa permite iterar sobre una idea visual (personaje, vehículo, entorno) sin salir de la aplicación, adecuado para fases tempranas de preproducción.
- Generación de documentación técnica de activos: los manuales `i_c_e.md` y `CREATE-ANYTHING.md` actúan como referencia operativa para equipos que necesitan un estándar reproducible de creación de activos con anclas dimensionales explícitas.
- Formación y transferencia de conocimiento: el playbook "Golden Path" y el protocolo ASK→RECIPE pueden usarse como material de onboarding para artistas técnicos que deban seguir un proceso estandarizado de construcción de activos.
- Prototipado de herramientas internas: al ser una aplicación Next.js completa, el archivo r9 puede servir de base para equipos que quieran adaptar el pipeline de evaluación de visión y planificación de blueprints a su propio catálogo de activos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No disponible: al no declararse pesos de modelo ni una arquitectura de inferencia concreta, no es posible estimar VRAM, GPU recomendadas ni throughput.
- El repositorio ocupa 0,0 GB, por lo que el almacenamiento necesario para descargarlo es despreciable.
- El pipeline descrito invoca un endpoint de visión (`/api/vision/assess`) cuyo modelo subyacente no se especifica; los requisitos de hardware dependerán del VLM que se configure en ese endpoint.
- Opciones de despliegue: no disponibles para el modelo; la aplicación Next.js requeriría un entorno Node.js, pero no se documentan instrucciones de despliegue en la información proporcionada.

## Comparativa con modelos similares

No disponible. No se ha identificado en la información proporcionada ningún modelo comparable, dado que `3demp` no se presenta como un modelo de pesos con arquitectura y métricas declaradas, sino como un archivo de proyecto y documentación operativa.

## Limitaciones y advertencias

- Ausencia total de datos técnicos verificables: no hay arquitectura, parámetros, contexto, licencia ni idiomas declarados, lo que impide evaluar el artefacto como modelo.
- Licencia no disponible: no puede asumirse permiso de uso comercial, modificación ni redistribución del contenido del repositorio.
- Cero descargas y cero "likes": no existe evidencia de uso, validación por la comunidad ni revisión independiente.
- La model card es fundamentalmente material promocional del proyecto ("Emporium", "cerebro operativo") y no una ficha técnica de modelo; las afirmaciones sobre verificación contra la API de Sketchfab y sobre "cero URLs adivinadas" no son comprobables con los datos disponibles.
- Riesgo de confusión: el repositorio podría interpretarse erróneamente como un modelo de IA desplegable; no contiene pesos en formatos estándar (safetensors, GGUF) según la información disponible.
- El pipeline depende de servicios externos (Sketchfab API, un VLM no especificado) cuya disponibilidad, coste y condiciones de uso no se documentan.
- No se declaran sesgos, tasas de alucinación ni limitaciones idiomáticas porque no se describe un modelo de lenguaje subyacente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sandboxinit/3demp
