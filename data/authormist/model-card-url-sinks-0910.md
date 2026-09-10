# authormist/model-card-url-sinks-0910

## Resumen

`authormist/model-card-url-sinks-0910` es un artefacto publicado en HuggingFace por el usuario `authormist` con la etiqueta de pipeline `text-generation`, pero no contiene pesos ni configuración de un modelo de lenguaje. La propia model card lo describe como una sonda de prueba: "Controlled model-card URL sink probe. All values in this model are inert researcher-owned markers for authorized testing". Es decir, se trata de un banco de pruebas de seguridad orientado a verificar cómo los consumidores de model cards (visores web, clientes de API, indexadores, dashboards internos) tratan valores potencialmente peligrosos.

La relevancia del artefacto es, por tanto, defensiva y no funcional: sus metadatos están deliberadamente sembrados con marcadores controlados que emplean el esquema `javascript:` y atributos de evento en etiquetas HTML dentro de campos como `library_name`, `thumbnail`, `arxiv`, `doi`, `spaces`, `widget` y `model-index`. Un renderizador o parser que no sanitice esos campos puede acabar ejecutando código en el navegador de quien visualiza la ficha, o emitir peticiones a destinos no previstos (URL sinks). Este tipo de sondas se usa en auditorías autorizadas de plataformas de modelos.

No se dispone de arquitectura, tamaño, contexto, datos de entrenamiento ni pesos. Todas las cifras y campos técnicos que normalmente ocupa una ficha están ocupados por marcadores inertes de investigación, por lo que en esta ficha se reportan como "no disponible" y se describen cualitativamente, sin reproducir las cargas útiles ni convertirlas en enlaces activos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se publican pesos ni configuracion de modelo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el campo de idiomas no esta declarado) |
| Licencia | other (el enlace de licencia declarado apunta a un marcador de prueba en example.com; texto de licencia no disponible) |
| Formato de pesos | no disponible (no se publican pesos) |
| Autor | authormist |
| Pipeline declarado | text-generation |
| Tipo de artefacto | sonda de seguridad / fixture de prueba de sanitizacion |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-09-10 |
| Ultima actualizacion | 2026-09-10 |
| Etiquetas declaradas | tensorboard, url-sink-controlled-probe, text-generation, license:other, model-index, region:us |

## Arquitectura y entrenamiento

No hay arquitectura que describir. El repositorio no publica ficheros de pesos, configuración de modelo, tokenizador ni scripts de entrenamiento. El objeto del repositorio es la model card y su bloque de metadatos YAML, no una red neuronal. Por tanto, no existen datos sobre número de tokens de entrenamiento, composición del dataset, ni fases de ajuste como RLHF, DPO o SFT.

La innovación técnica que representa es de naturaleza distinta: es un conjunto de sondas de "URL sink" y de inyección en campos de metadatos. Cada campo relevante de la model card (`library_name`, `license_link`, `metrics`, `thumbnail`, `arxiv`, `doi`, `spaces`, `widget`, y los nombres y tipos dentro de `model-index`) contiene un marcador inerte que, al ser interpretado por un renderizador descuidado, escribiría un atributo en el DOM (por ejemplo `data-library-xss`, `data-thumbnail-xss`, `data-arxiv-xss`) como señal de éxito de la prueba. El cuerpo Markdown incluye además un enlace con esquema `javascript:` y una imagen SVG en `data:` con manejador `onload`, que persiguen el mismo objetivo de comprobar si el visor sanea enlaces e imágenes.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- Actúa como fixture de pruebas de seguridad para validadores de model cards y clientes de la API de HuggingFace Hub.
- Permite comprobar si un visor de fichas sanea URLs con esquema `javascript:` en campos de texto libre.
- Permite comprobar si un renderizador de Markdown permite HTML embebido y atributos de evento (`onerror`, `onload`) en etiquetas `img`.
- Permite verificar si un pipeline de indexación escapa correctamente los nombres y tipos declarados dentro de `model-index`.
- No dispone de tool calling, soporte de agentes, capacidades multilingües ni modos de razonamiento.
- Los marcadores están declarados por el autor como inertes y orientados a pruebas autorizadas.

## Casos de uso

- Validación de sanitizadores en visores de model cards: se carga la ficha en un frontend propio y se comprueba que ningún atributo marcador (por ejemplo `data-library-xss` o `data-thumbnail-xss`) llega a aparecer en el DOM tras el renderizado.
- Pruebas de regresión en clientes de la API del Hub: un cliente que descargue metadatos de modelos debe verificar que no sigue enlaces con esquema `javascript:` ni resuelve el `license_link` declarado sin validación previa.
- Auditoría de pipelines de indexación interna: ingestas que almacenan `model-index`, `metrics` o `widget` en bases de datos deben confirmar que estos valores se tratan como datos opacos, nunca como HTML ni como URLs accionables.
- Formación de equipos de seguridad: el artefacto sirve como ejemplo didáctico de por qué los campos de metadatos de un modelo son una superficie de entrada no confiable, equivalente a cualquier otro contenido generado por usuarios.
- Integración en suites de pruebas automatizadas de plataformas de modelos: puede usarse como caso límite dentro de un conjunto de fixtures, junto a otros repositorios con contenido malformado.
- Verificación de exportadores a otros formatos: si la plataforma exporta fichas a PDF, HTML estático o Markdown para terceros, este repositorio permite comprobar que la exportación no introduce ni enlaces ni imágenes activas.

## Benchmarks y rendimiento

El autor declara un único resultado en el bloque `model-index`, con valor 1 y `verified: false`, evaluado sobre el dataset `authormist/url-sink-controlled-probe`. Los campos de tarea, nombre del modelo, nombre del dataset, split y nombre y tipo de la métrica son marcadores de prueba, no identificadores de una tarea o métrica reales, por lo que el resultado no es interpretable como rendimiento de un modelo.

| Modelo | Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|---|
| authormist/model-card-url-sinks-0910 | marcador de prueba (no interpretable) | authormist/url-sink-controlled-probe | marcador de prueba (no interpretable) | 1 | No (false) |

No se han publicado otros resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no se publican pesos, por lo que no hay modelo que cargar en memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica para inferencia. El artefacto solo se "despliega" como fichero de metadatos consumido por visores o clientes del Hub.
- Latencia y throughput: no disponible.
- Requisito real de consumo: un navegador o un parser de YAML/Markdown con la sanitizacion adecuada, y conectividad a HuggingFace para recuperar la ficha.

## Comparativa con modelos similares

No disponible. No se ha identificado en la informacion proporcionada ningun otro repositorio comparable de la misma categoria (sondas de sanitizacion de model cards) con el que establecer una comparacion de parametros, contexto, rendimiento o licencia. Al no tratarse de un modelo de lenguaje, la comparacion con alternativas de text-generation no seria significativa.

## Limitaciones y advertencias

- No es un modelo utilizable: no hay pesos, ni tokenizador, ni configuración de inferencia. Cualquier intento de cargarlo como modelo de lenguaje fallara.
- Los metadatos contienen cargas utiles activas de forma deliberada (esquema `javascript:` y atributos de evento en HTML). Deben tratarse siempre como datos no confiables.
- Riesgo de ejecucion no deseada: un visor, cliente o dashboard que renderice estos campos sin escapar puede ejecutar codigo en el navegador del usuario o disparar peticiones a destinos no previstos.
- Riesgo de enlace roto o suplantado: el `license_link` declarado apunta a `example.com`, un dominio reservado para documentacion, no a un texto legal real. La licencia efectiva es, a efectos practicos, indeterminada.
- No se declaran idiomas soportados, por lo que no puede asumirse cobertura multilingue de ningun tipo.
- El unico resultado declarado esta marcado como no verificado y su metrica no es identificable; no debe citarse como evidencia de rendimiento.
- Uso comercial: la licencia "other" sin texto asociado impide determinar condiciones de uso comercial. Se recomienda no reutilizar el contenido sin contactar con el autor.
- Recomendacion para produccion: si algun sistema propio ingiere fichas de HuggingFace, conviene filtrar por lista blanca los esquemas de URL admitidos (`https`) y escapar todo valor de metadatos antes de insertarlo en el DOM.
- Los resultados de la busqueda web proporcionada no guardan relacion con este artefacto: son hilos de Reddit sobre finanzas personales en Belgica y autenticacion con eID, sin conexion con el modelo.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/authormist/model-card-url-sinks-0910
- Dataset de la sonda declarada en `model-index`: authormist/url-sink-controlled-probe (referencia textual; no se ha verificado su existencia publica)
- Enlace de licencia declarado en la model card: https://example.com/hf-controlled-license-link-probe (marcador de prueba, no es un texto legal real)
- Papers, blogs, repositorios o demos adicionales: no disponible. La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo.
