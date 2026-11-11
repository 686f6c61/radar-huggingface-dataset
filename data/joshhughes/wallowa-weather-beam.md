# JoshHughes/wallowa-weather-beam

## Resumen

BEAM (Blended Early-warning Alert Model) es un modelo experimental de nowcasting de tormentas desarrollado por Josh Hughes, orientado a la predicción probabilística de fenómenos convectivos severos a muy corto plazo (0-90 minutos). El modelo genera mapas de probabilidad para cuatro peligros meteorológicos —granizo, núcleos de tormenta fuerte (≥ 55 dBZ), rayos y lluvia torrencial— sobre una rejilla de 3 km, con ventanas de 0-30, 30-60 y 60-90 minutos. Está diseñado específicamente para regiones del noroeste interior de Estados Unidos (Inland Northwest) donde el radar meteorológico no cubre las capas bajas por la distancia y el terreno montañoso.

Técnicamente, BEAM no es un modelo de lenguaje sino un sistema de aprendizaje profundo multimodal que fusiona datos heterogéneos: radar MRMS de NOAA, imágenes satelitales GOES-West (ABI y GLM), el modelo numérico HRRR, y mapas de terreno y cobertura radar. El modelo produce 12 mapas cada 10 minutos y se ejecuta en el dispositivo dentro de la aplicación Wallowa Weather. La licencia es Apache 2.0 y el repositorio de Hugging Face no contiene pesos publicados (tamaño 0.0 GB), lo que limita su reproducibilidad inmediata.

Su relevancia radica en el enfoque en "huecos de radar" y en la evaluación rigurosa sobre conjuntos ciegos de días retenidos (BLIND A y BLIND B), con métricas de habilidad probabilística (Brier skill score, ROC AUC, average precision) frente a referencias operativas como HRRR y CIMSS LightningCast. Es un caso de estudio interesante de despliegue de nowcasting probabilístico en un dominio de recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de aprendizaje profundo para nowcasting; no se especifica transformer, CNN ni híbrida) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (no aplica; entrada multimodal de campos meteorológicos) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 0.0 GB; no se publican pesos) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna (número de capas, tipo de bloques, mecanismos de atención o convoluciones). El modelo se describe como un sistema que "fusiona" (blend) entradas de radar MRMS, satélite GOES-West (ABI y GLM), el modelo HRRR y mapas de terreno y cobertura radar, y produce mapas probabilísticos en una rejilla de 3 km. La salida son 12 mapas por ciclo de 10 minutos correspondientes a cuatro peligros y tres ventanas temporales (0-30, 30-60, 60-90 min). No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables en este dominio).

La innovación destacable es metodológica: el uso de conjuntos de evaluación ciegos (BLIND A: 84 días retenidos de 2021-2026 con radar tal cual; BLIND B: 139 días de abril a octubre de 2019 con radar oculto) y la comparación contra referencias operativas (HRRR, CIMSS LightningCast, ProbSevere). También destaca un "remap congelado" para la probabilidad de granizo, que corrige el sesgo de las probabilidades crudas antes de mostrarlas.

## Capacidades

- Nowcasting probabilístico de rayos con horizonte de 0-30, 30-60 y 60-90 minutos en celdas de 3 km.
- Nowcasting de núcleos de tormenta fuerte (≥ 55 dBZ) en las mismas ventanas temporales.
- Nowcasting de lluvia torrencial (≥ 12.5 mm en 15 min) con ventanas de 0-30, 30-60 y 60-90 min.
- Nowcasting de granizo con remap congelado de la probabilidad cruda.
- Funcionamiento en huecos de radar: mantiene habilidad predictiva de rayos sin entrada de radar (BLIND B, ROC AUC 0.974).
- Fusión multimodal de radar, satélite, modelo numérico y mapas de terreno.
- Ejecución en dispositivo móvil dentro de la aplicación Wallowa Weather.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo "thinking".

## Casos de uso

- **Alertas tempranas de rayos en zonas sin cobertura radar baja:** el modelo mantiene ROC AUC de 0.974 sin entrada de radar, por lo que puede emitir avisos en valles montañosos donde el haz radar pasa por encima de las tormentas.
- **Aviso de granizo para protección de cultivos y bienes:** el mapa de granizo remapeado ofrece una probabilidad calibrada (Brier skill +0.05 en días ciegos) que puede integrarse en sistemas de alerta agrícola, aunque con la advertencia de que es el peligro con menor habilidad espacial.
- **Detección de lluvia torrencial para gestión de inundaciones repentinas:** la ventana de 0-30 min con ROC AUC 0.979 permite activar protocolos de drenaje y avisos a Protección Civil en cuencas pequeñas.
- **Integración en aplicaciones móviles de meteorología:** el modelo se ejecuta en el teléfono dentro de la app Wallowa Weather, lo que demuestra su viabilidad para despliegue en cliente sin infraestructura de servidor.
- **Complemento a modelos numéricos en la primera hora:** donde HRRR tiene menor resolución efectiva en la ventana 0-30 min, BEAM ofrece un ranking de celdas con mayor ROC AUC para rayos, núcleos fuertes y lluvia torrencial.
- **Investigación en nowcasting probabilístico en regiones de orografía compleja:** los conjuntos BLIND A y BLIND B y las métricas publicadas sirven como referencia para comparar nuevos modelos en dominios con huecos de radar.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre el conjunto BLIND A (84 días retenidos, 2021-2026, radar tal cual):

| Peligro (ventana) | ROC AUC | Average precision (tasa base) | Brier skill vs climatología |
|---|---|---|---|
| Rayos, 0-30 min | 0.979 | 0.659 (0.022) | 0.138 |
| Núcleo fuerte ≥ 55 dBZ, 0-30 min | 0.977 | 0.405 (0.003) | -0.292 |
| Lluvia torrencial ≥ 12.5 mm/15 min, 0-30 min | 0.979 | 0.398 (0.004) | -0.230 |
| Granizo, 0-30 min | 0.916 | 0.141 (0.0003) | -0.126 |
| Granizo, remap congelado 0-90 min | — | — | 0.051 |
| Rayos sin radar (BLIND B, 139 días 2019) | 0.974 | 0.614 (0.015) | 0.085 |

Además, el autor reporta un Fractions Skill Score (FSS) de 0.71 a 27 km para rayos en 0-30 min, y que el 37 % de los casos de rayos se avisaron al menos 30 minutos después de la emisión, frente al 10 % del mejor campo HRRR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publican pesos ni arquitectura).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el modelo se ejecuta en teléfono dentro de la app Wallowa Weather, lo que sugiere requisitos moderados, pero no se especifican.
- Opciones de despliegue: ejecución en dispositivo móvil (app Wallowa Weather); no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este dominio).
- Latencia y throughput: no disponibles; el ciclo de producción es de 10 minutos y genera 12 mapas por ciclo.

## Comparativa con modelos similares

| Modelo | Tipo | Horizonte | Peligros | ROC AUC rayos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| BEAM | Nowcasting probabilístico multimodal | 0-90 min | Rayos, granizo, núcleo fuerte, lluvia torrencial | 0.979 (0-30 min) | Apache 2.0 | Repositorio HF sin pesos (0.0 GB) |
| HRRR | Modelo numérico de mesoescala | Horas | Múltiples (campos convectivos) | Referencia inferior según el autor | Dominio público (NOAA) | Operativo |
| CIMSS LightningCast | Nowcasting de rayos basado en satélite | 0-60 min | Rayos | Superado por BEAM según el autor | no disponible | Operativo/investigación |
| NOAA/CIMSS ProbSevere | Probabilístico de tormentas severas | 0-60 min | Granizo, viento, tornado | No comparable directamente | no disponible | Operativo |

## Limitaciones y advertencias

- **Modelo experimental:** no es un aviso del National Weather Service; para avisos oficiales debe seguirse al NWS.
- **Probabilidades crudas sesgadas al alza:** para granizo, núcleos fuertes y lluvia torrencial (todas las ventanas) y rayos a 60-90 min, la probabilidad cruda puntúa peor que la climatología; deben leerse como ranking, no como porcentaje. Solo el granizo se remapea antes de mostrarse.
- **Granizo es el peligro más débil:** nunca llega a ser espacialmente útil dentro de 81 km; entre el 45 % y el 52 % de las celdas de granizo a 30-90 min recibieron probabilidad almacenada de cero. Sus avisos empatan con el mejor campo HRRR, y ProbSevere detecta más granizo (empatan a igual tasa de falsas alarmas).
- **Granizo en huecos de radar sin entrada radar:** no superó a HRRR en los tres conjuntos de prueba.
- **Lluvia torrencial en huecos de radar:** sin habilidad útil documentada.
- **Núcleos fuertes en la primera media hora:** "lo que está ocurriendo ahora" tiene mejor Brier score.
- **Rayos donde el radar es bueno:** LightningCast avisa más.
- **Cobertura geográfica limitada:** diseñado para el Inland Northwest; no se documenta su validez en otras regiones.
- **Idioma:** solo inglés.
- **Repositorio sin pesos:** el tamaño de 0.0 GB indica que no se publican los pesos, lo que impide su reproducción o despliegue independiente.
- **Licencia Apache 2.0:** permite uso comercial, pero al no haber pesos publicados la aplicabilidad práctica es limitada.

## Enlaces

- Hugging Face: https://huggingface.co/JoshHughes/wallowa-weather-beam
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
