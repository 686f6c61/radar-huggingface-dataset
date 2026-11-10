# rangang-g/angelvow-ai-fortune-telling

## Resumen

AngelVow (天使誓言) es un repositorio de documentación publicado por el usuario rangang-g en Hugging Face que describe los conjuntos de reglas, la normalización de características y los pipelines de prompts de un producto de lectura de rostro y compatibilidad basado en fisionomía china tradicional (面相). No se trata de un modelo de lenguaje entrenado ni de pesos publicados, sino de un repositorio que documenta la lógica determinista de un producto accesible en angelvow.com.

El principio de diseño declarado por el autor consiste en mantener las reglas clásicas como tablas de datos y delegar en un modelo de lenguaje únicamente la tarea de explicar un resultado ya calculado de forma determinista. De este modo, las lecturas resultan auditables y cada afirmación puede rastrearse hasta una regla con nombre, en contraste con otros productos de "metafísica con IA" que generan texto de forma opaca.

La relevancia del repositorio es limitada desde el punto de vista técnico: no incluye arquitectura, parámetros, contexto, datos de entrenamiento ni benchmarks. Su interés radica en el patrón de diseño de separar el cálculo determinista de la generación de lenguaje, aplicable a otros dominios con requisitos de auditabilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio documenta pipelines de reglas, no un modelo entrenado) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el sitio enlazado incluye rutas en chino, p. ej. /zh/face) |
| Licencia | MIT |
| Formato de pesos | no disponible (no se publican pesos) |

## Arquitectura y entrenamiento

El repositorio no describe ningún modelo neuronal propio ni proceso de entrenamiento. Lo que documenta es una arquitectura de producto en la que las reglas clásicas de la fisionomía china se almacenan como tablas de datos y se aplican de forma determinista: normalización de puntos faciales (landmarks), cálculo de ratios de proporción e interpretación ponderada por palacios en el módulo de lectura de rostro; generación de candidatos con filtros duros y posterior ranking en el módulo de nombres; y una matriz de elementos por pares con puntuación de conflictos en el módulo de compatibilidad.

El modelo de lenguaje interviene únicamente en la fase de explicación, convirtiendo el resultado ya calculado en texto natural. El autor no especifica qué modelo de lenguaje se utiliza, ni datos de entrenamiento, ni si hubo ajuste fino, RLHF o DPO. Tampoco se detallan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Lectura de rostro (面相十二宫): interpretación basada en doce palacios, cinco oficiales y calidad de hueso y piel, a partir de landmarks normalizados y ratios de proporción.
- Retrato de alma gemela (正缘画像): composición determinista de una tabla de rasgos derivada de datos de nacimiento en un retrato en lenguaje natural.
- Nombres de bebé (取名): generación de candidatos con filtros duros de trazos, sonido y elemento, seguida de ranking.
- Compatibilidad (合盘): matriz de elementos por pares con puntuación de conflictos a partir de la interacción de pilares de año y hora.
- Guía (指南): generación de artículos explicativos de formato largo mediante esquema estructurado y verificación de evidencias.
- Auditabilidad: cada afirmación puede rastrearse hasta una regla con nombre, según el principio de diseño declarado.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión por computador genérica ni modo de pensamiento.

## Casos de uso

- Documentación de referencia para implementar sistemas de reglas auditables: el repositorio sirve como ejemplo de separación entre cálculo determinista y generación de lenguaje, replicable en dominios donde la trazabilidad es requisito.
- Productos culturales y de entretenimiento: el pipeline de lectura de rostro puede integrarse en aplicaciones de ocio que requieran resultados reproducibles en lugar de texto generado libremente.
- Generación de nombres con restricciones duras: el patrón de filtros duros seguidos de ranking es aplicable a cualquier tarea de generación de candidatos con criterios verificables.
- Artículos explicativos con verificación de evidencias: el módulo de guía ilustra cómo estructurar un esquema previo y comprobar las afirmaciones antes de publicar contenido largo.
- Estudio académico de la fisionomía china como sistema de reglas: las tablas documentadas permiten analizar formalmente la estructura del sistema tradicional.
- Prototipado de motores de compatibilidad por pares: la matriz de elementos y la puntuación de conflictos sirven como base para sistemas de emparejamiento con criterios explícitos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No disponible: al no publicarse pesos ni modelo entrenado, no procede estimar VRAM para inferencia del modelo en sí.
- El despliegue del producto se realiza como servicio web en angelvow.com; el repositorio no detalla la infraestructura subyacente.
- No se especifican opciones de despliegue local (vLLM, llama.cpp, Ollama, TGI) ni latencias o throughput.
- Cualquier integración requeriría elegir un modelo de lenguaje externo para la fase de explicación, cuyos requisitos de hardware dependerían de ese modelo, no de este repositorio.

## Comparativa con modelos similares

| Aspecto | AngelVow (este repositorio) | Modelos de lenguaje publicados en Hugging Face | Productos de "metafísica con IA" genéricos |
|---|---|---|---|
| Naturaleza | Documentación de reglas y pipelines | Pesos entrenados | Productos cerrados |
| Pesos publicados | No | Sí | No |
| Licencia | MIT | Variable | Propietaria |
| Auditabilidad | Alta (reglas con nombre) | Depende del modelo | Baja según el autor |
| Benchmarks | No disponibles | Habitualmente publicados | No disponibles |
| Uso comercial | Permitido por MIT, sujeto a la licencia del modelo de lenguaje empleado | Según licencia | Según términos del servicio |

No se identifican en la información proporcionada modelos comparables de la misma categoría con datos verificables.

## Limitaciones y advertencias

- El repositorio no contiene un modelo entrenado ni pesos; no puede evaluarse su rendimiento como modelo de lenguaje.
- No se especifica qué modelo de lenguaje se emplea en la fase de explicación, por lo que las capacidades reales del sistema dependen de un componente no documentado.
- El propio autor advierte de que todo el contenido es para entretenimiento y estudio cultural, y que no deben tomarse decisiones médicas, legales o de relación basadas en estos resultados.
- Riesgo de sesgos: la fisionomía tradicional incorpora asociaciones culturales e históricas que pueden reproducir estereotipos sobre apariencia física.
- Riesgo de alucinación en la fase de explicación si el modelo de lenguaje no se restringe estrictamente al resultado determinista.
- Idiomas soportados no documentados; el sitio enlazado incluye contenido en chino.
- La licencia MIT cubre el repositorio, pero el uso comercial del producto completo puede estar sujeto a condiciones adicionales no especificadas.
- Sin descargas ni likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rangang-g/angelvow-ai-fortune-telling
- Sitio del producto: https://www.angelvow.com
- Herramienta de lectura de rostro: https://www.angelvow.com/zh/face
