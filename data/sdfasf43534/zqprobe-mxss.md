# sdfasf43534/zqprobe-mxss

## Resumen

El repositorio `sdfasf43534/zqprobe-mxss` no contiene un modelo de lenguaje en el sentido convencional. Se trata de un artefacto publicado bajo la etiqueta `transformers` cuyo contenido es un corpus de 37 cargas útiles (v0 a v36) diseñadas para probar filtros de saneamiento HTML y detectar vulnerabilidades de tipo mXSS (mutation cross-site scripting). El autor lo describe como "zzq org card mXSS corpus 36".

La model card incluye construcciones con etiquetas como `math`, `svg`, `template`, `noscript`, `xmp`, `textarea` o `iframe srcdoc`, combinadas con atributos de evento (`onerror`, `onload`, `ontoggle`, `onfocus`) y vectores de ofuscación mediante `SVELTE_HYDRATER` con `data-props`. Su función aparente es servir de banco de pruebas para validar desinfectantes de HTML en pipelines de publicación de contenido.

No hay información sobre arquitectura de red neuronal, parámetros, tokenizador, pesos ni datos de entrenamiento. El repositorio registra cero descargas y cero likes, y fue creado y actualizado el 21 de noviembre de 2026. Cualquier uso como modelo generativo es inviable con los datos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de red neuronal; es un corpus de cadenas HTML) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se declaran ficheros de pesos; solo README con cargas HTML) |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de transformer, MoE, SSM ni híbrida. El contenido publicado consiste en un listado de payloads HTML organizados como comentarios `<!-- v0 -->` a `<!-- v36 -->` dentro del README. La única metadumbre técnica es `library_name: transformers`, que no se corresponde con un artefacto de pesos utilizable.

No hay información sobre volumen de tokens de entrenamiento, composición del dataset, técnicas de alineación (RLHF, DPO) ni innovaciones de inferencia. El material es, en la práctica, una colección de vectores de ataque para pruebas de seguridad.

## Capacidades

- No se documenta generación de texto, razonamiento, código, matemáticas ni visión.
- No se documenta soporte de tool calling ni function calling.
- No se documenta capacidad de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe.
- El único contenido verificable es un conjunto de 37 payloads HTML orientados a probar sanitizadores contra mXSS, incluyendo casos con `math`, `svg`, `foreignObject`, `annotation-xml`, `template`, `noscript`, `xmp`, `textarea`, `title`, `iframe srcdoc`, `formaction`, `autofocus`, `ontoggle`, `object`, `embed`, `base`, `meta refresh`, `link`, `svg set`, `@import` CSS, `url(javascript:)` y `data-props` con hidratación Svelte.

## Casos de uso

- Validación de sanitizadores HTML: usar los payloads v0 a v36 como suite de regresión para comprobar que una librería como DOMPurify, Bleach o sanitize-html neutraliza correctamente las mutaciones mXSS.
- Pruebas de seguridad en renderizado Markdown: verificar que un visor de README no ejecuta `onerror` ni `onload` al procesar los bloques publicados.
- Auditoría de hidratación en frameworks SPA: los casos v32 a v35 con `SVELTE_HYDRATER` y `data-props` permiten comprobar si el cliente deserializa props sin escapar y ejecuta el contenido inyectado.
- Formación en seguridad ofensiva: material docente para explicar cómo el parser HTML muta estructuras (`noscript`, `template`, `math`, `svg`) y produce ejecución tras el saneamiento.
- Integración en CI/CD de aplicaciones con contenido generado por usuarios: añadir estos payloads a tests automatizados que fallen si el sanitizador deja pasar alguno de los vectores.
- Comparación de motores de parseo: ejecutar los payloads en navegadores y en parsers de servidor (html5lib, parse5, lxml) para detectar divergencias de interpretación que abran vectores mXSS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica: el repositorio no contiene pesos ni requiere GPU para su función declarada.
- No requiere VRAM, GPU dedicada ni aceleradores.
- No se contempla despliegue con vLLM, llama.cpp, Ollama ni TGI.
- El único requisito práctico es un navegador o un motor de parseo HTML para evaluar los payloads.
- No hay datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sdfasf43534/zqprobe-mxss | no disponible | no disponible | no disponible | Hugging Face, 0 descargas |
| Corpus OWASP XSS Filter Evasion | no aplica | no aplica | abierta (documentación) | Repositorio público |
| Payloads mXSS de Cure53 | no aplica | no aplica | según repositorio | GitHub público |

La comparación con modelos de lenguaje no procede: este artefacto pertenece a la categoría de corpus de pruebas de seguridad, no a la de modelos generativos.

## Limitaciones y advertencias

- No es un modelo utilizable para inferencia: no hay pesos, tokenizador ni configuración de arquitectura.
- El contenido del README contiene cargas activas de XSS; renderizarlo en un visor no endurecido puede ejecutar JavaScript en el dominio del visor.
- La licencia no está declarada, por lo que no se puede asumir uso comercial ni redistribución.
- No hay idiomas, sesgos ni riesgos de alucinación evaluables por ausencia de modelo.
- El repositorio presenta cero descargas y cero likes, sin señales de mantenimiento ni validación por la comunidad.
- La fecha de creación (2026-11-21) y la naturaleza del contenido sugieren un artefacto de prueba más que un modelo destinado a producción.
- Uso en producción desaconsejado: no hay garantías de soporte, versionado ni integridad de los datos.

## Enlaces

- Hugging Face: https://huggingface.co/sdfasf43534/zqprobe-mxss
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
