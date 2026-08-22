# LayerFault/provenance-fake-signature-text-control

## Resumen

El repositorio `LayerFault/provenance-fake-signature-text-control` es un artefacto sintético de la capa de pruebas de seguridad del corpus Layerfault, no un modelo de aprendizaje automático funcional. Su propósito es servir como caso de control negativo para ejercitar escáneres de seguridad y sistemas de admisión de modelos locales, verificando que las reglas de detección no generen falsos positivos ante entradas inocuas. Fue creado el 21 de agosto de 2026 por el autor LayerFault y está identificado con el código de corpus `LF-CH-PROV-0010`.

El repositorio contiene un único archivo de pesos en formato safetensors con 16 parámetros, que no constituye un modelo utilizable. El propio autor advierte explícitamente en la model card que se trata de un test fixture y que no debe cargarse ni ejecutarse fuera de un entorno aislado de pruebas de escáneres. Se distribuye bajo licencia Apache-2.0 y está protegido por un gate de acceso con confirmación de comprensión del riesgo.

La relevancia de este repositorio es exclusivamente para equipos de seguridad que desarrollan o evalúan herramientas de escaneo de modelos, como el propio proyecto Layerfault de GitHub, que valida artefactos y runtimes de modelos antes de su inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplicable (artefacto sintético de prueba, no es un modelo ML) |
| Parametros totales | 16 (archivo safetensors, no son pesos de un modelo real) |
| Parametros activos | no aplicable |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (único archivo, no contiene pesos de modelo) |

## Arquitectura y entrenamiento

No existe arquitectura neuronal ni proceso de entrenamiento. El repositorio es un artefacto sintético del corpus Layerfault, diseñado deliberadamente con características adversarias (opcodes de pickle sospechosos, contrabando de formatos ejecutables, cadenas de prompt-injection) para ejercitar las reglas de detección de escáneres de seguridad. La model card lo clasifica como un control negativo: severidad informativa, dificultad adversarial, decisión de admisión esperada PASS, y superficie de ataque de integridad de procedencia. No hay transformaciones aplicadas.

## Capacidades

- No es un modelo de IA y no tiene capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo.
- Su única función es servir como entrada de prueba para escáneres de seguridad estáticos y aislados.
- Incluye características adversarias intencionadas (opcodes de pickle sospechosos, contrabando de formatos ejecutables, cadenas de prompt injection) para validar reglas de detección.
- Como control negativo, se espera que no genere alertas en herramientas de escaneo correctamente configuradas.

## Casos de uso

- Pruebas de regresión en escáneres de seguridad: se usa como entrada para verificar que un escáner no emite falsos positivos ante artefactos inocuos con apariencia sospechosa.
- Evaluación de herramientas de admisión de modelos locales: integrable en pipelines como Layerfault para validar que la capa de admisión no rechace artefactos de control negativo.
- Desarrollo de reglas de detección: sirve como referencia para calibrar umbrales y evitar alertas excesivas.
- Auditoría de herramientas de análisis de artefactos: permite comprobar que el analizador de safetensors no interpreta los 16 parámetros como pesos reales.
- Formación de equipos de seguridad: material didáctico para ilustrar cómo se construyen corpus sintéticos de pruebas adversarias.
- Investigación en integridad de procedencia: contribuye a estudios sobre autenticidad de artefactos de IA, como los citados en el paper "Authenticity Debt and the Synthetic Content Threat Landscape".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este artefacto no es un modelo y no tiene rendimiento evaluable.

## Requisitos de hardware

- No se requiere hardware de inferencia: el archivo no contiene pesos utilizables.
- Para su uso en escaneo estático, basta un entorno aislado con el escáner de seguridad correspondiente.
- No aplica VRAM, GPU, latencia ni throughput. La model card advierte que no debe cargarse ni ejecutarse fuera de un entorno aislado de pruebas de escáneres.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparables, ya que este no es un modelo de IA. En el ecosistema de Layerfault, existen otros artefactos del corpus sintético de seguridad (identificados con códigos `LF-*`), pero no se proporcionan detalles de los mismos en la información disponible.

## Limitaciones y advertencias

- No es un modelo utilizable: contiene solo 16 parámetros en safetensors, no pesos de red neuronal.
- Riesgo de ejecución: si se carga en un entorno de inferencia, los opcodes de pickle sospechosos y el contrabando de formatos ejecutables podrían provocar comportamiento no deseado.
- Debe ejecutarse únicamente en un entorno aislado de pruebas de escáneres, nunca en producción.
- No tiene capacidades de generación de texto, código, razonamiento ni visión.
- Licencia Apache-2.0 permite uso comercial, pero el autor desaconseja explícitamente su uso como modelo de producción.
- El repositorio está protegido por un gate de acceso que requiere aceptación del riesgo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LayerFault/provenance-fake-signature-text-control
- Proyecto Layerfault en GitHub: https://github.com/izm1chael/layerfault/tree/main
- Documento de modelo de confianza de Layerfault: https://github.com/izm1chael/layerfault/blob/main/docs/TRUST_MODEL.md
- Paper sobre deuda de autenticidad y amenazas de contenido sintético: https://arxiv.org/pdf/2606.00621 (y versión HTML: https://arxiv.org/html/2606.00621)
- Provenance Protocol (estándar global para identidad de agentes IA): https://provenanceprotocol.org/</think>## Resumen

El repositorio `LayerFault/provenance-fake-signature-text-control` es un artefacto sintético del corpus de pruebas de seguridad Layerfault, no un modelo de inteligencia artificial funcional. Su propósito es servir como control negativo para escáneres de seguridad y herramientas de admisión de modelos locales, verificando que no generen falsos positivos ante entradas con características adversarias aparentes pero inocuas. El autor lo clasifica explícitamente como un test fixture, con severidad informativa y control de tipo negativo.

El repositorio contiene un único archivo safetensors con 16 parámetros, que no constituye pesos de red neuronal. La model card incluye advertencias claras: no debe cargarse ni ejecutarse fuera de un entorno aislado de pruebas de escáneres, y contiene deliberadamente opcodes de pickle sospechosos, contrabando de formatos ejecutables y cadenas de prompt-injection para ejercitar reglas de detección. Se distribuye bajo licencia Apache-2.0 y está protegido con un gate de acceso que requiere aceptación del riesgo.

La relevancia de este repositorio es exclusivamente para equipos de seguridad que desarrollan o evalúan herramientas de escaneo de artefactos de IA, como el propio proyecto Layerfault, que valida modelos antes de su inferencia en entornos locales y offline.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplicable (artefacto de seguridad, no es un modelo ML) |
| Parametros totales | 16 (archivo safetensors, no son pesos de modelo) |
| Parametros activos | no aplicable |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (único archivo, no contiene pesos de modelo) |

## Arquitectura y entrenamiento

No existe arquitectura de red ni proceso de entrenamiento. El repositorio es un artefacto de control del corpus sintético Layerfault, diseñado deliberadamente con características adversas (opcodes de pickle sospechosos, contrabando de formatos ejecutables, cadenas de prompt injection) para ejercitar las reglas de detección de escáneres de seguridad. La model card lo clasifica como control negativo: severidad informativa, dificultad adversarial, decisión de admisión esperada PASS, y superficie de ataque de integridad de procedencia. No se han aplicado transformaciones.

## Capacidades

- Ninguna capacidad de IA: no genera texto, razona, escribe código ni procesa vision o audio.
- Función exclusiva como entrada de control para escáneres de seguridad y herramientas de admisión de modelos.
- Contiene características adversas intencionales (opcodes de pickle, contrabando de formatos ejecutables, strings de prompt injection) para validar reglas de detección.
- Actúa como control negativo: no debe generar alertas en escáneres correctamente configurados.
- No soporta tool calling, agentes, ni capacidades multilingües.

## Casos de uso

- Pruebas de regresión en escáneres de seguridad: se usa para verificar que un escáner no emite falsos positivos ante artefactos inocentes con apariencia sospechosa.
- Validación de herramientas de admisión de modelos: integra pipelines como Layerfault para comprobar que la admisión no rechaza artefactos de control negativo.
- Calibración de reglas de detección: sirve como referencia para ajustar umbrales y evitar alertas excesivas en herramientas de análisis de modelos.
- Evaluación de analizadores de safetensors: permite verificar que el analizador no interpreta los 16 parámetros como pesos reales.
- Formación de equipos de seguridad: material didáctico para ilustrar la construcción de corpus sintéticos de prueba adversaria.
- Investigación de integridad de procedencia: se usa en estudios sobre autenticidad de artefactos de IA, como los citados en el paper "Authenticity Debt and the Synthetic Content Threat Landscape".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este artefacto no es un modelo de IA y no tiene rendimiento evaluable.

## Requisitos de hardware

- No se requiere hardware de inferencia: el archivo no contiene pesos utilizables.
- Para su uso en el texto estático, basta un entorno aislado con el escáner de seguridad correspondiente.
- No aplica VRAM, GPU, latencia ni throughput. La model card advierte que no debe cargarse ni ejecutarse fuera de un entorno aislado de pruebas de escáneres.

## Comparativa con modelos similares

No disponible. Este artefacto no pertenece a una categoría de modelos de IA comparables. En el ecosistema Layerfault existen otros artefactos del corpus sintético (identificados con códigos `LF-*`), pero no se proporciona información sobre ellos en los datos disponibles.

## Limitaciones y advertencias

- No es un modelo de IA: contiene 16 parámetros en safetensors que no representan pesos de red neuronal.
- Riesgo de ejecución: si se ejecuta en un entorno de inferencia, los opcodes de pickle sospechosos y el contrabando de formatos ejecutables podrían causar comportamiento no deseado.
- Debe ejecutarse únicamente en un entorno aislado de pruebas de escáneres, nunca en producción.
- No tiene capacidades de generación de texto, razonamiento, código ni visión.
- La licencia Apache-2.0 permite uso comercial, pero el autor desaconseja explícitamente su uso como modelo de producción.
- El repositorio está protegido por un gate de acceso que requiere aceptación del aviso de riesgo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LayerFault/provenance-fake-signature-text-control
- Proyecto Layerfault en GitHub: https://github.com/izm1chael/layerfault/tree/main
- Documento de modelo de confianza de Layerfault: https://github.com/izm1chael/layerfault/blob/main/docs/TRUST_MODEL.md
- Paper "Authenticity Debt and the Synthetic Content Threat Landscape": https://arxiv.org/pdf/2606.00621 (versión HTML: https://arxiv.org/html/2606.00621)
- Provenance Protocol (estándar global de verificación de procedencia): https://provenanceprotocol.org/
