# Hanfeng0419/FlowSim

## Resumen

FlowSim es un modelo de simulación latente para la evaluación en bucle cerrado de sistemas de conducción autónoma de extremo a extremo. Lo desarrolla Hanfeng0419 y se publica bajo licencia Apache 2.0. Su propuesta central es eliminar el renderizado de imágenes y la recodificación de percepción durante la evaluación en bucle cerrado: en lugar de generar fotogramas sintéticos y volver a pasarlos por el codificador de percepción, FlowSim predice directamente la representación latente interna del modelo E2E para el siguiente fotograma a partir del latente anterior y de las condiciones simbólicas de la escena (agentes, mapa y estado del ego).

El modelo se compone de un modelo de transición latente, una asociación explícita de agentes entre fotogramas y un esquema de simulación de horizonte variable (VH) que evita la acumulación de errores intermedios en el rollout. Los módulos posteriores congelados (planificación, detección, segmentación) se ejecutan sin modificar sobre el latente predicho, lo que permite evaluar sistemas E2E completos sin coste de renderizado.

Se publican dos instanciaciones independientes: `flowsim_navsim` (dispersa), basada en un latent TransFuser (LTF) sobre el conjunto NAVSIM, y `flowsim_uniad` (densa), basada en UniAD sobre nuScenes. El repositorio ocupa 6,8 GB y no registra descargas ni interacciones en el momento de la consulta. No es un modelo de lenguaje: es un componente de simulación para investigación en conducción autónoma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de transición latente sobre representaciones internas de sistemas E2E (latent TransFuser y UniAD); no es un transformer de lenguaje |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (opera sobre latentes por fotograma, no sobre tokens de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo sin interfaz de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (los checkpoints se distribuyen a través del repositorio de GitHub, no se especifica el formato en la model card) |

## Arquitectura y entrenamiento

FlowSim implementa un modelo de transición latente que, dado el latente del fotograma anterior y las condiciones simbólicas del fotograma objetivo (agentes, mapa y estado del ego), predice el latente correspondiente al fotograma objetivo. Sobre ese latente predicho se ejecutan los módulos downstream congelados del sistema E2E evaluado (planificación, detección, segmentación), de modo que la evaluación en bucle cerrado se realiza sin renderizar imágenes ni recodificarlas con el backbone de percepción.

Dos componentes técnicos sostienen el enfoque: una asociación explícita de agentes entre fotogramas, que estabiliza las transiciones y los rollouts, y una simulación de horizonte variable (VH) que evita la acumulación de errores de los pasos intermedios del rollout. Se proporcionan dos instanciaciones: `flowsim_navsim`, dispersa, sobre un latent TransFuser (LTF) entrenado con NAVSIM, y `flowsim_uniad`, densa, sobre UniAD entrenado con nuScenes. La model card no detalla el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Predicción de la representación latente del siguiente fotograma de un sistema E2E de conducción a partir del latente previo y de condiciones simbólicas de escena.
- Simulación en bucle cerrado sin renderizado de imágenes ni recodificación de percepción.
- Asociación explícita de agentes entre fotogramas para transiciones y rollouts estables.
- Simulación de horizonte variable (VH) para limitar la acumulación de errores en rollouts largos.
- Evaluación de módulos downstream congelados (planificación, detección, segmentación) sin reentrenarlos.
- Dos instanciaciones: dispersa (latent TransFuser sobre NAVSIM) y densa (UniAD sobre nuScenes).
- No dispone de generación de texto, tool calling, capacidades de agente conversacional ni soporte multilingüe.

## Casos de uso

- Evaluación en bucle cerrado de planificadores E2E: FlowSim permite ejecutar rollouts completos sobre el sistema evaluado sin renderizar fotogramas, reduciendo el coste computacional de la evaluación respecto a pipelines con renderizado y recodificación.
- Comparación de variantes de un mismo sistema E2E: al mantener congelados los módulos downstream, las diferencias observadas en métricas de planificación y percepción pueden atribuirse a los cambios introducidos en el modelo evaluado.
- Validación de sistemas densos basados en UniAD: la instanciación `flowsim_uniad` permite simular sobre nuScenes con representaciones densas, útil para pipelines con detección y segmentación acopladas.
- Validación de sistemas dispersos sobre NAVSIM: la instanciación `flowsim_navsim` cubre pipelines con representación latente dispersa tipo TransFuser, habituales en investigación de planificación.
- Análisis de robustez ante condiciones de escena contrafactuales: al condicionar la transición latente con agentes, mapa y estado del ego simbólicos, se pueden generar escenarios alternativos sin renderizar imágenes nuevas.
- Investigación sobre error acumulado en simulación: el esquema de horizonte variable permite estudiar cómo afecta la longitud del rollout a la deriva del latente predicho frente al latente real.
- Reducción de coste en infraestructura de evaluación: al eliminar el renderizado y la recodificación, el cómputo por fotograma simulado se concentra en el modelo de transición y en los módulos downstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; el tamaño del repositorio es de 6,8 GB, lo que da una cota inferior aproximada del espacio en disco necesario para los checkpoints.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; los checkpoints y las instrucciones de uso se distribuyen a través del repositorio de GitHub del proyecto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Enfoque | Renderizado | Datasets | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FlowSim | Simulación latente sin renderizado | No | NAVSIM (dispersa), nuScenes (densa) | Apache 2.0 | Hugging Face y GitHub |
| Alternativas de simulación fotorrealista para E2E | Renderizado de imágenes sintéticas y recodificación de percepción | Sí | Depende de la instanciación | no disponible | no disponible |
| Alternativas de evaluación en bucle abierto | Métricas sobre dataset sin interacción con el entorno | No aplica | nuScenes, NAVSIM | no disponible | no disponible |

La model card no proporciona comparaciones cuantitativas con otras herramientas de simulación, por lo que no es posible establecer una comparativa de rendimiento. Las alternativas citadas se incluyen únicamente como categorías de referencia metodológica.

## Limitaciones y advertencias

- El modelo predice latentes, no imágenes: no puede emplearse para generar vídeo sintético ni para inspección visual directa de la simulación.
- La fidelidad de la simulación depende de la calidad del modelo de transición latente; los errores de predicción pueden propagarse a los módulos downstream congelados.
- El esquema de horizonte variable mitiga, pero no elimina, la acumulación de error en rollouts largos.
- Cada instanciación está acoplada a un sistema E2E concreto (latent TransFuser sobre NAVSIM y UniAD sobre nuScenes); no se documenta su generalización a otras arquitecturas.
- No se detallan sesgos conocidos ni limitaciones idiomáticas porque el modelo no procesa texto ni lenguaje natural.
- No se documentan restricciones adicionales de uso comercial más allá de la licencia Apache 2.0.
- El repositorio no registra descargas ni interacciones, y la model card remite a GitHub para checkpoints y uso; conviene verificar el estado del código antes de integrarlo en producción.
- No se especifican requisitos de hardware ni latencias, lo que dificulta planificar el despliegue sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hanfeng0419/FlowSim
- Paper (referencia arXiv): https://huggingface.co/papers/2610.18030
- Página del proyecto: https://hanfeng-wu.github.io/flowsim_page/
- Código y checkpoints: https://github.com/hanfeng-wu/FlowSim
