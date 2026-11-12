# Denovarix/Deno

## Resumen

Deno es un modelo de generación de vídeo texto-a-vídeo (y también imagen-a-vídeo) anunciado por Denovarix Technologies LLP, una empresa con sede en West Bengal (India). Forma parte de la familia Denovarix junto con Rix (generación de imágenes) y Denovarix AI (texto), y está diseñado para ejecutarse en el servidor de alto rendimiento DNX dentro de la infraestructura on-premise del cliente, accesible desde el sistema operativo DNX OS. El objetivo declarado es producir clips cortos de uso empresarial —vídeos de producto, explicativos, material de formación y piezas para redes sociales— sin salir del perímetro de la compañía.

El modelo se encuentra en desarrollo y no está disponible: la model card indica explícitamente que los pesos no están publicados y que la página describe un modelo en construcción. No se han facilitado datos de arquitectura, número de parámetros, longitud de contexto, proceso de entrenamiento ni resultados de benchmarks. El tamaño figura como "to be announced" (pendiente de anuncio).

La relevancia actual de Deno es, por tanto, la de un anuncio de producto orientado a despliegue privado más que la de un artefacto evaluable: no hay pesos, no hay demos públicas y las descargas y likes del repositorio de Hugging Face son cero. Cualquier evaluación técnica rigurosa es imposible con la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (la model card indica "to be announced") |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | no disponible (los pesos no están publicados) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo. La model card no especifica si se trata de un transformer, un modelo de difusión, un modelo híbrido o cualquier otra familia, ni detalla el número de parámetros, la resolución o duración de los clips generados, el número de tokens o fotogramas de entrenamiento, la composición del dataset ni si se emplearon técnicas de alineación como RLHF o DPO.

La única información técnica de contexto es la relativa al entorno de despliegue: el modelo está pensado para ejecutarse en el servidor DNX de alto rendimiento, en las instalaciones del cliente, y para ser invocado desde DNX OS. No se detalla si el entrenamiento se realizó desde cero, mediante ajuste fino de un modelo base existente o mediante otra estrategia, ni se mencionan innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos de control temporal.

## Capacidades

- Generación de vídeo corto a partir de una descripción textual (text-to-video).
- Generación de vídeo a partir de una imagen fija (image-to-video), según la descripción de la model card.
- Orientación a clips de uso empresarial: vídeos de producto, explicativos, material de formación y piezas para redes sociales.
- Ejecución on-premise: los guiones, las imágenes de origen y los vídeos resultantes permanecen dentro de la infraestructura de la empresa.
- Integración con el ecosistema DNX OS y con el modelo de imágenes Rix de la misma familia.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el único idioma declarado es el inglés.
- Modo thinking, visión, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Vídeos de producto para comercio electrónico: generación de clips cortos a partir de una descripción textual o de una fotografía del producto, sin necesidad de sesión de rodaje, adecuado para catálogos con muchos artículos que rotan con frecuencia.
- Vídeos explicativos internos: producción de piezas breves que expliquen procesos, herramientas o políticas de la empresa, manteniendo el material dentro de la infraestructura corporativa.
- Material de formación: generación de clips de apoyo para cursos internos y onboarding, reutilizando guiones y documentos ya existentes en la organización.
- Contenido para redes sociales: creación de reels y piezas verticales de corta duración para los canales de la empresa, con iteración rápida sobre el guion.
- Prototipado creativo en agencias y equipos de marketing: generación de borradores de vídeo para validar conceptos antes de comprometer presupuesto de producción.
- Entornos con requisitos estrictos de confidencialidad: sectores como salud, legal o defensa donde subir material a servicios de generación en la nube no es aceptable, gracias al despliegue on-premise en el servidor DNX.
- Animación de imágenes fijas: conversión de fotografías de archivo o de producto en clips animados breves para presentaciones y webs corporativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del modelo no se ha anunciado.
- GPU recomendadas: no disponible. El único requisito declarado es el servidor DNX de alto rendimiento de Denovarix, sin especificaciones técnicas públicas.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el modelo está diseñado para ejecutarse en el servidor DNX y para ser invocado desde DNX OS. No se mencionan vLLM, llama.cpp, Ollama, TGI ni otros motores de inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Desarrollador | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Deno | Denovarix Technologies LLP | no disponible | no disponible | no disponible | En desarrollo; pesos no publicados |
| Alternativas texto-a-vídeo de código abierto | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparación con alternativas de la misma categoría: no hay datos de parámetros, contexto, rendimiento ni licencia del modelo, y la model card no cita modelos comparables.

## Limitaciones y advertencias

- El modelo no está disponible: los pesos no están publicados y la propia model card lo describe como "in development". No es posible evaluarlo ni desplegarlo hoy.
- Ausencia total de datos técnicos: no se conocen arquitectura, tamaño, resolución, duración máxima de los clips, contexto ni proceso de entrenamiento, lo que impide estimar calidad o coste computacional.
- Licencia no especificada: no se puede determinar si el uso comercial está permitido, qué restricciones aplican ni si el acceso será abierto o bajo acuerdo.
- Idiomas: solo se declara inglés; no hay soporte multilingüe confirmado, lo que limita su uso en entornos hispanohablantes sin adaptación.
- Riesgo de alucinación y fidelidad visual: no hay información sobre la fidelidad de los vídeos generados respecto al guion, la coherencia temporal entre fotogramas ni la consistencia de identidades y objetos; son riesgos habituales en generación de vídeo que no se han documentado.
- Sesgos: no se ha publicado ninguna evaluación de sesgos demográficos, culturales o de representación en los datos de entrenamiento.
- Dependencia de hardware propietario: el despliegue se plantea sobre el servidor DNX y DNX OS, sin información sobre portabilidad a infraestructura estándar.
- Trazabilidad limitada: repositorio con cero descargas y cero interacciones, sin paper, blog técnico ni demo pública que permita verificar las afirmaciones de la model card.
- Fecha de creación del repositorio (2026-11-12) y ausencia de actualizaciones posteriores: no hay evidencia de un roadmap público de publicación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Denovarix/Deno
- Sitio web de Denovarix: https://denovarix.com
- DNX OS: https://denovarix.com/dnx-os/
- Programa beta de DNX OS: https://denovarix.com/beta/
- Contacto: hello@denovarix.com
