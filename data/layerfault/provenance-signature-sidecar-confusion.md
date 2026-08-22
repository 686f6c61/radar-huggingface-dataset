# LayerFault/provenance-signature-sidecar-confusion

## Resumen

Este repositorio es un artefacto sintético de prueba de seguridad perteneciente al corpus Layerfault, identificado como `LF-CH-PROV-0005`. No es un modelo de inteligencia artificial funcional: contiene 16 parámetros en formato safetensors y un tamaño de 0.0 GB, lo que lo descarta como pesos de un sistema de aprendizaje automático utilizable. Su propósito es ejercitar escáneres de seguridad y reglas de admisión de modelos en entornos aislados, presentando características adversarias deliberadas (opcodes de pickle sospechosos, contrabando de formatos ejecutables, cadenas de inyección de prompts) para verificar que los detectores los bloquean correctamente.

El proyecto Layerfault, disponible en GitHub, se centra en la validación y control de admisión de modelos de IA locales antes de su inferencia, abordando la seguridad de la cadena de suministro de modelos. Este artefacto concreto está etiquetado como `security-research`, `synthetic` y `adversarial-testing`, y su licencia es Apache 2.0. La model card advierte explícitamente que no debe cargarse ni ejecutarse fuera de un entorno aislado de pruebas de escáner.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplicable (artefacto de prueba, no un modelo ML) |
| Parametros totales | 16 |
| Parametros activos | no aplicable |
| Longitud de contexto | no aplicable |
| Tipos de cuantizacion | no aplicable |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No existe arquitectura de modelo ni proceso de entrenamiento. Se trata de un archivo de prueba sintético construido para contener características de seguridad adversarias. La model card indica que el corpus utiliza secretos falsos, destinos de red de bucle local o dominios `.invalid`, marcadores de salida inofensivos y comportamiento de modelo sintético. Su diseño se centra en la integridad de la procedencia (provenance-integrity) y la técnica de confusión de firmas y archivos laterales (`signature`, `sidecar`, `confusion`). El repositorio actúa como entrada de control positiva para probar si un escáner bloquea correctamente artefactos con este tipo de características.

## Capacidades

- No es un modelo de lenguaje ni de generación de contenido. No tiene capacidades de texto, razonamiento, código, matemáticas, visión, audio ni tool calling.
- No soporta inferencia ni ejecución de ninguna tarea de aprendizaje automático.
- Su única función es servir como insumo para pruebas de detección de vulnerabilidades en escáneres de seguridad de modelos.
- Puede contener cadenas de inyección de prompts y opcodes de pickle sospechosos diseñados para engañar a herramientas de análisis estático.

## Casos de uso

- **Pruebas de escáneres de seguridad de modelos**: este artefacto se usa como entrada positiva para verificar que un detector de la capa de seguridad (p. ej., el proyecto LayerFault) identifica y bloquea correctamente artefactos con características de confusión de firmas y sidecars.
- **Validación de reglas de admisión de modelos**: permite comprobar que las reglas de admisión de un sistema de control de modelos (como LayerFault) rechazan este tipo de archivo antes de que se cargue en un entorno de inferencia.
- **Evaluación de herramientas de análisis estático**: se puede integrar en pipelines de CI/CD para probar que herramientas como scanners de Hugging Face o de repositorios locales detectan opcodes maliciosos o contrabando de ejecutables.
- **Entrenamiento de modelos de detección de amenazas**: los datos sintéticos de este corpus pueden servir para entrenar o ajustar clasificadores de seguridad que identifiquen patrones de confusión de procedencia.
- **Auditoría de cadenas de suministro**: se emplea como caso de estudio para demostrar cómo un artefacto aparentemente inofensivo puede ocultar características de riesgo, ayudando a diseñar defensas contra ataques de confusión de modelos.
- **Pruebas de integración de sistemas de admisión**: al ser un control positivo, se usa en entornos de integración continua para garantizar que los sistemas de admisión de modelos no permiten el paso de artefactos con estas características.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este artefacto no es un modelo de IA y no tiene rendimiento que evaluar. Su propósito es de seguridad, no de capacidades de IA.

## Requisitos de hardware

- No aplica para inferencia, ya que no es un modelo de IA.
- Para su uso en pruebas de seguridad, se recomienda un entorno aislado (máquina virtual, contenedor o sandbox) sin acceso a la red, ya que el artefacto puede contener contenido adversario.
- No requiere GPU ni recursos de cómputo específicos; puede procesarse con herramientas de análisis estático en CPU.
- No se recomienda desplegarlo en entornos de producción ni en sistemas con datos sensibles.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos de IA comparable, ya que este artefacto no es un modelo de lenguaje ni de visión. Los artefactos de seguridad del corpus LayerFault son únicos en su propósito de prueba de escáneres y no se comparan con modelos de IA comerciales o de código abierto.

## Limitaciones y advertencias

- **No es un modelo utilizable**: contiene solo 16 parámetros y no puede generar texto, código ni ninguna salida de IA. Cargarlo como si fuera un modelo real producirá errores o comportamiento indefinido.
- **Contenido adversario**: el repositorio incluye deliberadamente características maliciosas (opcodes de pickle sospechos, contenu de ejecutables, cadenas de inyección de prompts). Ejecutarlo fuera de un entorno aislado puede causar riesgos de seguridad.
- **No debe usarse en producción**: la model card lo clasifica como artefacto de prueba con severidad crítica y decisión de admisión esperada: BLOQUEO. Debe rechazarse en cualquier pipeline de inferencia.
- **Sin garantías de seguridad**: aunque el corpus usa datos sintéticos y destinos `.invalid`, no se garantiza que no contenga vulnerabilidades explotables en entornos no aislados.
- **Licencia**: Apache-2.0 permite uso y modificación, pero el propósito del artefacto es exclusivamente de prueba; cualquier uso fuera de ese contexto es inapropiado y arriesgado.
- **Idiomas**: no disponible, ya que no hay contenido de texto utilizable.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/LayerFault/provenance-signature-sidecar-confusion
- Proyecto LayerFault en GitHub: https://github.com/izm1chael/layerfault
- Referencia sobre confusión de modelos en Hugging Face (Checkmarx): https://checkmarx.com/zero-post/hugs-from-strangers-ai-model-confusion-supply-chain-attack/
- Artículo sobre procedencia y transparencia de ML (Atlas): https://arxiv.org/html/2502.19567
- Artículo sobre defensas de procedencia en registros criptográficos: https://arxiv.org/html/2605.03309
