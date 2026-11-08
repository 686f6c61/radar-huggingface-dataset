# saadbather/swarmfl

## Resumen

SwarmFL es un framework de código abierto en Python construido sobre Flower que habilita la colaboración federada entre especialistas de IA heterogéneos mediante enrutamiento consciente de coste y fusión dinámica de predicciones. El artefacto publicado en Hugging Face bajo el identificador `saadbather/swarmfl` no es un modelo de lenguaje propiamente dicho, sino una demo empaquetada de ese framework: un caso de consulta entre pares especialistas sintéticos orientado a clasificación tabular. La model card lo describe explícitamente como una demo pequeña para consulta de especialistas autorizada, con datos exclusivamente sintéticos y sin validez como benchmark ni como modelo clínico.

La relevancia del artefacto es, por tanto, metodológica y de infraestructura más que de rendimiento predictivo. Permite reproducir en local un flujo completo de federated learning con tres nodos Flower, registro de declaraciones, selección de un único par para consulta y fusión de predicciones con artefactos de auditoría. Está dirigido a investigadores que quieran inspeccionar el patrón de orquestación multi-agente y a desarrolladores que evalúen Flower como capa de comunicación entre especialistas heterogéneos.

No se dispone de información sobre arquitectura de red neuronal, número de parámetros, longitud de contexto ni datos de entrenamiento, porque el artefacto no contiene checkpoints de modelo ni datasets: la release pública del Hub excluye explícitamente datasets de investigación, tests congelados, checkpoints privados y salidas de experimentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el artefacto es un framework de orquestación federada sobre Flower; los especialistas de la demo son sintéticos y no se describe su arquitectura) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se publican pesos que cuantizar) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (la release no incluye checkpoints; se distribuye como paquete Python `swarmfl==0.1.0`) |

## Arquitectura y entrenamiento

SwarmFL no es un transformer ni un modelo generativo: es una capa de orquestación federada construida sobre Flower que coordina especialistas heterogéneos. Cada especialista declara sus capacidades y el sistema enruta las consultas de forma consciente del coste, seleccionando un par y fusionando dinámicamente las predicciones observadas. La demo mantiene separadas las vistas de entrada de cada especialista, realiza una única petición al par seleccionado y combina las predicciones resultantes en una probabilidad fusionada que se escribe junto a los artefactos de auditoría en el directorio de salida.

En la demo concreta, los tres especialistas sintéticos consumen vistas de entrada ordenadas `(x0,x1)`, `(x2,x3)` y `(x4,x5)`, lo que ilustra el reparto de features entre nodos sin solapamiento. No se publica información sobre volúmenes de datos de entrenamiento, composición de datasets, ni sobre uso de RLHF o DPO, porque no existen pesos entrenados en la release. La innovación técnica destacable es el patrón de colaboración: separación de vistas por especialista, selección de un único peer por consulta y fusión auditable de predicciones, todo ello sobre la infraestructura de comunicación de Flower con tres nodos locales.

## Capacidades

- Orquestación federada multi-agente: arranque de tres nodos Flower locales, registro de declaraciones de especialistas y coordinación de una consulta entre pares.
- Enrutamiento consciente de coste: selección de un único peer para resolver una consulta nueva, en lugar de consultar a todos los especialistas.
- Fusión dinámica de predicciones: combinación de las predicciones observadas en una probabilidad fusionada única.
- Clasificación tabular sobre vistas de features separadas: cada especialista opera sobre un subconjunto ordenado de columnas (`(x0,x1)`, `(x2,x3)`, `(x4,x5)`).
- Auditoría: generación de artefactos de auditoría junto al resultado en `demo/result.json`.
- Flujo de feedback: modo `--feedback` disponible tanto en el comando de quickstart como en `demo.py`.
- No soporta tool calling, function calling, razonamiento multi-paso generativo, visión, audio ni capacidades multilingües, al no tratarse de un modelo de lenguaje.

## Casos de uso

- Reproducción de un pipeline federado mínimo: ejecutar `swarmfl-quickstart --output demo --feedback` para levantar tres nodos Flower locales y observar el ciclo completo de registro, selección de par, consulta y fusión, útil como plantilla para prototipos propios sobre Flower.
- Investigación en enrutamiento consciente de coste: usar la demo como banco de pruebas para comparar políticas de selección de peer (consultar a uno frente a consultar a todos) midiendo el coste de comunicación y la calidad de la probabilidad fusionada.
- Estudio de fusión de predicciones entre especialistas heterogéneos: analizar cómo se combinan las salidas de especialistas que solo ven vistas parciales de features, inspeccionando los artefactos de auditoría generados en `demo/`.
- Docencia y formación en federated learning: el flujo de tres nodos locales con datos sintéticos permite explicar conceptos de FL (declaraciones, selección, agregación) sin infraestructura distribuida real ni datos sensibles.
- Validación de integraciones con Flower: emplear el paquete `swarmfl==0.1.0` como referencia para verificar que una instalación de Flower y el entorno Python funcionan antes de abordar despliegues mayores.
- Diseño de sistemas multi-agente con separación de vistas: reutilizar el patrón de reparto de features entre especialistas como esqueleto para arquitecturas donde cada nodo solo debe acceder a una porción de los datos de entrada, por motivos de privacidad o de partición organizativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que la demo es sintética y que no constituye un benchmark ni un modelo clínico.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el artefacto no contiene pesos de modelo que cargar en GPU.
- GPU recomendadas: no disponibles; el flujo descrito (tres nodos Flower locales y clasificación tabular sintética) se ejecuta en CPU.
- Cabe en consumer GPU: no aplica, al no requerir GPU.
- Opciones de despliegue: instalación del paquete Python `swarmfl==0.1.0` vía pip y ejecución del comando `swarmfl-quickstart` o del script `demo.py`; la comunicación entre nodos se apoya en Flower.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Aspecto | SwarmFL (demo) | Flower (framework base) | Frameworks FL genéricos (p. ej. FedML) |
|---|---|---|---|
| Categoría | Orquestación federada multi-agente sobre Flower | Framework de federated learning | Framework de federated learning |
| Parámetros | No aplica (sin pesos publicados) | No aplica | No aplica |
| Contexto | No disponible | No aplica | No aplica |
| Enrutamiento consciente de coste | Sí (selección de un peer) | No incluido por defecto | No disponible |
| Fusión dinámica de predicciones | Sí | No incluido por defecto | No disponible |
| Licencia | Apache 2.0 | Apache 2.0 | Varía según proyecto |
| Disponibilidad | Hub de Hugging Face y GitHub | GitHub y PyPI | GitHub y PyPI |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA entrenado: la release pública no contiene checkpoints, datasets de investigación, tests congelados ni salidas de experimentos, por lo que no puede emplearse para inferencia sobre datos reales.
- Datos exclusivamente sintéticos: la demo no valida comportamiento sobre distribuciones reales ni sirve como benchmark.
- No es un modelo clínico: la model card lo advierte de forma explícita; no debe usarse en contextos de salud ni en decisiones con impacto sobre personas.
- Alcance funcional reducido: la demo cubre clasificación tabular con vistas de features separadas; no ofrece generación de texto, código, visión ni audio.
- Sin información de sesgos: al no haber datos de entrenamiento ni evaluación publicada, no es posible caracterizar sesgos del sistema.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la probabilidad fusionada de la demo no tiene garantías de calibración sobre datos reales.
- Licencia Apache 2.0: permite uso comercial del código, pero al no existir pesos ni datasets publicados, el uso comercial se limita al propio framework de orquestación.
- Idiomas: no disponible; el artefacto no declara soporte lingüístico.
- Madurez: versión `0.1.0`, sin descargas ni likes en el Hub en el momento de la consulta, lo que sugiere un proyecto en fase temprana y sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saadbather/swarmfl
- Repositorio GitHub: https://github.com/saadbinather/SwarmFL
- Documentación del repositorio: https://github.com/saadbinather/SwarmFL/tree/main/docs
