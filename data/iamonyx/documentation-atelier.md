# iamonyx/documentation-atelier

## Resumen

`iamonyx/documentation-atelier` no es un modelo de inteligencia artificial, sino un repositorio de documentación técnica publicado en Hugging Face por el colectivo o estudio Onyx. Se presenta como la "biblioteca técnica pública" de un proyecto de fabricación de un personaje virtual llamado Onyx, descrito como una peluche naranja animada mediante rig Live2D, modelado 3D, vídeo generado en local y voz sintetizada. El repositorio recoge guías, normas y bases de conocimiento elaboradas durante el desarrollo del personaje, no pesos de red neuronal.

El contenido se organiza en documentos Markdown que cubren la cadena de IA local (selección de modelos, orden de etapas de imagen a vídeo), normas audiovisuales de publicación, control de calidad previo a publicación, especificaciones de capas para el rig 2D, planes de la vía 3D con Blender y motores como Unreal 5 y Unity/VRM, así como bases de competencias sobre animación, expresión, humor y producción audiovisual. También incluye un documento de veille de modelos rápidos en Hugging Face fechado el 23 de noviembre de 2026.

Por tanto, la relevancia de este repositorio no reside en capacidades de inferencia, sino en su valor como material de referencia metodológica para equipos que construyen personajes virtuales con un pipeline íntegramente local. No se dispone de información sobre arquitectura, parámetros, contexto ni benchmarks, ya que no se trata de un modelo entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un repositorio de documentación) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | fr (francés) |
| Licencia | other (documentación publicada para lectura y referencia; los textos siguen siendo propiedad del atelier, según la model card) |
| Formato de pesos | no disponible (el repositorio contiene documentos Markdown, no pesos) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado ni una arquitectura de red neuronal. Se trata de un conjunto de documentos Markdown versionados que describen procesos, normas y conocimientos del atelier Onyx. Según la model card, cada documento se versiona primero en el repositorio de trabajo interno y las versiones publicadas son "copias públicas saneadas", sin identificadores personales ni detalles de infraestructura interna.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset, RLHF, DPO ni innovaciones técnicas de modelado. El contenido técnico relevante para un lector de IA se limita a la descripción de una cadena de IA 100 % local para generación de imagen y vídeo, y a una veille de modelos rápidos en Hugging Face, cuyos detalles concretos no se reproducen en la información disponible.

## Capacidades

- No es un modelo generativo: no genera texto, código, matemáticas ni visión por sí mismo.
- Documenta una cadena de IA local para producción de imagen y vídeo, con modelos, roles y orden de etapas.
- Define normas audiovisuales de publicación: −14 LUFS / −1 dBTP, codec H.264, resolución real 1080 × 1920 y etiquetado de contenido generado por IA.
- Incluye una ficha de control previa a publicación para validar cada pieza antes de su salida.
- Especifica un sistema de uniformización de imágenes de archivo (placa clara única, grade común, puerta de color).
- Propone un sistema de procedencia de contenidos mediante firmas y manifiestos.
- Contiene una especificación de capas del personaje para rig 2D (corte, nombrado y orden).
- Recoge bases de conocimiento sobre animación y cine, expresión no verbal, humor, guionización y producción audiovisual de formatos cortos.
- Incluye fichas de escenas tipo y timings faciales (parpadeos, miradas, micromovimientos).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Referencia metodológica para pipelines de IA local: un equipo que quiera montar una cadena de generación de imagen a vídeo sin servicios en la nube puede usar `GUIDE-CHAINE-IA-LOCALE.md` como plantilla de etapas, roles de modelo y orden de ejecución.
- Definición de normas de publicación audiovisual: el documento `NORMES-AV-V1.md` sirve para fijar criterios concretos de loudness (−14 LUFS / −1 dBTP), codec y resolución vertical 1080 × 1920 en un flujo de formatos cortos.
- Control de calidad previo a publicación: la ficha de control `FICHE-CONTROLE-PRE-PUBLICATION-V1.md` puede adaptarse como checklist obligatoria en un pipeline de contenido generado por IA antes de cada entrega.
- Diseño de rig 2D para personajes virtuales: `COUCHES-SPEC.md` ofrece una convención de capas, nombrado y orden reutilizable por artistas técnicos que preparen un personaje para Live2D.
- Planificación de una vía 3D con Blender y motores: `PLAN-VOIE-3D-V1.md`, `GUIDE-BLENDER-V1.md` y `FICHE-DECISION-MOTEUR-V1.md` documentan un plan por etapas y un criterio de decisión entre Unreal 5 y Unity/VRM para un proyecto de mascota virtual.
- Uniformización de archivo visual: `SYSTEME-IMAGES-ARCHIVES-V1.md` describe cómo homogeneizar imágenes históricas con una placa clara, un grade común y una puerta de color, aplicable a archivos de marca o de producto.
- Trazabilidad y procedencia de contenido generado: `PROVENANCE-V1.md` plantea firmas y manifiestos para demostrar el origen de las piezas publicadas, útil en flujos con requisitos de atribución o etiquetado de IA.
- Base de conocimiento para escritura de personaje: los documentos de `COMPETENCES-*` y `FICHES-SCENES-ANIMATION-V1.md` pueden alimentar un sistema de prompting o una wiki interna para mantener coherencia de tono y humor en un personaje virtual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene un modelo evaluable; no hay métricas de MMLU, HumanEval, GSM8K ni equivalentes.

## Requisitos de hardware

- No aplica para inferencia de un modelo: no hay pesos que cargar.
- Requisitos de hardware para el repositorio en sí: ninguno relevante; basta con un cliente Git o el navegador para leer los documentos Markdown.
- La cadena de IA local descrita en `GUIDE-CHAINE-IA-LOCALE.md` implicaría requisitos de GPU, pero la información proporcionada no detalla modelos concretos, cuantizaciones ni VRAM estimada.
- Opciones de despliegue del repositorio: clonado local, lectura directa en Hugging Face o publicación estática de los Markdown.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada repositorios comparables de documentación de atelier para personajes virtuales. La búsqueda web devuelta (documentación de Azure Container Instances) no guarda relación con este repositorio y no permite establecer comparaciones.

## Limitaciones y advertencias

- No es un modelo de IA: no puede invocarse para generación de texto, código, visión ni ninguna otra tarea de inferencia.
- Idioma único: el contenido está en francés; no hay versiones en castellano ni en otros idiomas.
- Licencia "other": la model card indica que los textos siguen siendo propiedad del atelier y que el personaje Onyx, sus archivos maestros y referencias canónicas no se publican en ningún repositorio. El uso comercial o la redistribución no están autorizados de forma explícita.
- Documentación saneada: las versiones publicadas son copias sin identificadores personales ni detalles de infraestructura, por lo que pueden faltar detalles operativos necesarios para reproducir el pipeline.
- Riesgo de desactualización: los documentos se corrigen cuando divergen de la práctica, pero no se especifica una cadencia de actualización ni un historial de cambios público.
- Sin métricas verificables: no hay benchmarks, evaluaciones ni datos de rendimiento que permitan validar las afirmaciones técnicas del contenido.
- Sin comunidad: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación externa o mantenimiento comunitario.
- El documento de veille de modelos está fechado el 23 de noviembre de 2026; conviene verificar su vigencia antes de reutilizar sus conclusiones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/iamonyx/documentation-atelier
- Documentación de Azure Container Instances (resultado de búsqueda no relacionado con el repositorio): https://learn.microsoft.com/en-us/azure/container-instances/
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código (`porte-fidelite`, `file-gpu`, `gabarits-porte-3d`, `onyx-agent`, `charte-graphique`) ni demos del proyecto Onyx.
