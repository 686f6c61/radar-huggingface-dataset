# Sculptor-AI/Indra-1.5M

## Resumen

Indra-1.5M es un modelo de predicción meteorológica de series temporales desarrollado por Sculptor-AI. Se trata de un ajuste fino del modelo base mistralai/Timestral-5M, posteriormente podado de 5,2 millones de parámetros a 1.500.874. El modelo lee las observaciones de una estación meteorológica de los últimos 90 días junto con guías de predicción públicas (National Blend of Models, GFS MOS y NAM MOS) y genera predicciones horarias de temperatura, punto de rocío, viento y presión para las siguientes 72 horas, con intervalos de confianza.

La relevancia del modelo radica en su extrema eficiencia: con solo 1,5 millones de parámetros y un archivo de 6 MB, es capaz de ejecutarse en una CPU convencional en aproximadamente 0,2 segundos por predicción usando cuatro hilos. Según la model card, supera al National Blend en precisión de temperatura entre un 8,6 % y un 14,5 % en los seis aeropuertos de su conjunto de test final, y un 10,3 % de media en doce aeropuertos no vistos durante el entrenamiento.

El modelo está especializado en estaciones de aeropuertos estadounidenses, que es el único dominio sobre el que se ha entrenado y evaluado. No se dispone de información sobre su rendimiento en otros tipos de estación ni en otras regiones geográficas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Timestral-5M, con máscara de atención modificada y capas podadas) |
| Parametros totales | 1.500.874 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de observaciones de 90 días más guías de predicción) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numérico de series temporales, no lingüístico) |
| Licencia | modified-mit (licencia MIT modificada, ver archivo LICENSE) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Indra-1.5M parte de Timestral-5M, un modelo de Mistral AI orientado a series temporales. El ajuste fino adapta el modelo para leer las últimas 90 jornadas de observaciones de una estación junto con guías de predicción del National Blend of Models, GFS MOS y NAM MOS. Posteriormente se aplicó una poda que redujo el modelo de 5,2 millones a 1.500.874 parámetros, lo que modificó los tamaños de las capas. Además, se introdujo un cambio en la máscara de atención para que los tokens de predicción puedan leer directamente la guía correspondiente a sus propias horas, una innovación que impide cargar los pesos con la implementación estándar de Timestral.

No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. El modelo fue entrenado y evaluado exclusivamente con datos de aeropuertos estadounidenses, y la model card indica que el script proporcionado solo lee datos de aeropuertos. La predicción se emite con intervalos del 80 % (campos `_low` y `_high`).

## Capacidades

- Predicción horaria de temperatura, punto de rocío, velocidad del viento y presión para las siguientes 72 horas a partir de observaciones y guías numéricas.
- Generación de intervalos de confianza del 80 % para cada variable y horizonte temporal.
- Ejecución en CPU convencional: aproximadamente 0,2 segundos por predicción en cuatro hilos, sin contar la descarga de datos.
- Entrada basada en el identificador de aeropuerto estadounidense y su longitud; el script descarga los datos públicos más recientes y emite un CSV.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni procesamiento de lenguaje natural.
- No es un modelo multilingüe: opera sobre datos numéricos de series temporales.

## Casos de uso

- Predicción meteorológica local para aeropuertos: el modelo genera pronósticos horarios a 72 horas para estaciones aeroportuarias de EE. UU., con un error de temperatura de 1,44 °F a 2,83 °F según el aeropuerto, lo que lo hace adecuado para alimentar paneles operativos de aeródromos.
- Sustitución o complemento del National Blend en sistemas de predicción de bajo coste: al superar al NBM entre un 8,6 % y un 14,5 % en error de temperatura en los aeropuertos evaluados, puede integrarse como capa de corrección sobre guías numéricas existentes.
- Despliegue en dispositivos con recursos limitados: con 6 MB de pesos y 0,2 segundos por predicción en CPU, puede ejecutarse en servidores modestos, Raspberry Pi o entornos edge sin GPU.
- Generación de pronósticos con incertidumbre cuantificada: los intervalos del 80 % permiten construir sistemas de alerta que distingan entre predicciones fiables y de alta dispersión.
- Investigación en poda de modelos de series temporales: la reducción de 5,2 M a 1,5 M parámetros con una pérdida de solo el 1,2 % en error de temperatura en el test final constituye un caso de estudio reproducible.
- Automatización de boletines meteorológicos para estaciones concretas: el script de línea de comandos permite generar CSV de pronóstico de forma programada para un identificador de aeropuerto dado.
- Análisis comparativo de modelos meteorológicos: la familia Indra (1.5M y 3M) permite estudiar el compromiso entre tamaño y precisión en un dominio acotado.

## Benchmarks y rendimiento

Test final: noviembre de 2025 a octubre de 2026, aproximadamente 1.471 pronósticos por aeropuerto, evaluados una sola vez sobre el modelo bloqueado. Error de temperatura medio a 1–72 horas (menor es mejor):

| Aeropuerto | Indra-1.5M | National Blend | Mejora (IC 95 %) | Rango 80 % contenido |
|---|---|---|---|---|
| Columbus (CMH) | 2,05 °F | 2,27 °F | 9,6 % (8,0–11,4) | 80,1 % |
| Chicago O'Hare (ORD) | 2,09 °F | 2,31 °F | 9,7 % (8,0–11,4) | 80,5 % |
| Denver (DEN) | 2,83 °F | 3,29 °F | 13,9 % (12,1–15,6) | 79,1 % |
| Miami (MIA) | 1,44 °F | 1,59 °F | 9,0 % (7,0–10,9) | 81,4 % |
| Seattle (SEA) | 1,64 °F | 1,79 °F | 8,6 % (6,9–10,3) | 78,4 % |
| Phoenix (PHX) | 1,73 °F | 2,03 °F | 14,5 % (12,7–16,4) | 80,4 % |

Error de temperatura por horizonte, media de los seis aeropuertos:

| Horas por delante | 1–6 | 7–12 | 13–24 | 25–36 | 37–48 | 49–72 |
|---|---|---|---|---|---|---|
| Indra-1.5M | 1,44 °F | 1,70 °F | 1,81 °F | 1,93 °F | 2,05 °F | 2,24 °F |
| National Blend | 1,90 °F | 1,95 °F | 2,06 °F | 2,17 °F | 2,29 °F | 2,44 °F |

Mejora sobre el National Blend en otras variables (1–72 horas):

| Aeropuerto | Punto de rocío (IC 95 %) | Velocidad del viento (IC 95 %) |
|---|---|---|
| Columbus | 3,0 % (1,8–4,2) | 8,0 % (7,0–9,0) |
| Chicago O'Hare | 3,0 % (1,8–4,3) | 5,6 % (4,6–6,5) |
| Denver | 2,8 % (1,6–3,9) | 1,9 % (1,0–2,7) |
| Miami | 0,3 % (-1,9–2,3) | 13,1 % (11,1–15,2) |
| Seattle | 0,8 % (-0,7–2,1) | 4,2 % (3,0–5,4) |
| Phoenix | 5,2 % (3,7–6,9) | 5,1 % (4,2–6,1) |

Aeropuertos no vistos (12 estaciones, 240 pronósticos equiespaciados cada una):

| Aeropuerto | Indra-1.5M | National Blend | Mejora (IC 95 %) | Rango 80 % contenido |
|---|---|---|---|---|
| Buffalo (BUF) | 2,01 °F | 2,06 °F | 2,1 % (-0,1–4,2) | 81,2 % |
| Burlington (BTV) | 2,38 °F | 2,60 °F | 8,4 % (6,4–10,8) | 78,2 % |
| Raleigh-Durham (RDU) | 2,08 °F | 2,30 °F | 9,6 % (7,7–11,7) | 80,1 % |
| Savannah (SAV) | 1,95 °F | 2,15 °F | 9,4 % (7,6–11,0) | 81,5 % |
| Mobile (MOB) | 1,94 °F | 2,17 °F | 11,0 % (9,0–12,7) | 82,5 % |
| Austin (AUS) | 2,21 °F | 2,55 °F | 13,2 % (11,1–15,4) | 80,2 % |
| El Paso (ELP) | 2,19 °F | 2,47 °F | 11,2 % (9,1–13,3) | 79,7 % |
| Wichita (ICT) | 2,37 °F | 2,64 °F | 10,4 % (8,3–12,4) | 78,8 % |
| Fargo (FAR) | 2,56 °F | 2,76 °F | 7,4 % (5,3–9,7) | 78,7 % |
| Billings (BIL) | 2,50 °F | 2,94 °F | 15,0 % (12,5–17,5) | 80,2 % |
| Grand Junction (GJT) | 2,16 °F | 2,52 °F | 14,2 % (12,1–16,4) | 80,6 % |
| Sacramento (SMF) | 1,97 °F | 2,16 °F | 8,8 % (6,9–10,9) | 77,3 % |

No hay comparación disponible para la presión, ya que no existe un pronóstico de presión del National Blend con el que contrastarla.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para ejecutarse en CPU. Los pesos ocupan 6 MB en disco.
- GPU: no requiere GPU. No se han publicado requisitos de GPU ni versiones optimizadas para aceleradores.
- GPU de consumo: irrelevante; el modelo cabe holgadamente en cualquier sistema, pero no se documenta soporte GPU.
- Despliegue: el repositorio incluye un script de línea de comandos (`python -m indra.forecast ORD --lon -87.93`) con dependencias en `requirements.txt`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia: aproximadamente 0,2 segundos por pronóstico en cuatro hilos de CPU, sin contar la descarga de datos.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño | Error de temperatura (test final) | Mejora vs NBM (test final) | Mejora vs NBM (12 aeropuertos nuevos) | Licencia |
|---|---|---|---|---|---|---|
| Indra-1.5M | 1.500.874 | 6 MB | 1,96 °F | 11,2 % | 10,3 % | modified-mit |
| Indra-3M | 2.999.627 | 12 MB | 1,94 °F | 12,3 % | 11,7 % | no disponible en la información |
| National Blend of Models | no disponible | no disponible | referencia | — | — | no disponible |

Indra-1.5M es la mitad de grande que Indra-3M, con solo un 1,2 % más de error de temperatura en el test final. No se dispone de información sobre otros modelos comparables de series temporales meteorológicas en la documentación proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente con datos de aeropuertos estadounidenses; no se ha medido su rendimiento en otros tipos de estación (por ejemplo, estaciones domésticas) ni en otras regiones.
- El script incluido solo lee datos de aeropuertos, lo que limita su uso directo fuera de ese dominio.
- El punto de rocío es la variable más débil: las mejoras en Miami y Seattle no son estadísticamente distinguibles del azar (intervalos de confianza que incluyen el cero).
- En Buffalo la mejora sobre el National Blend es demasiado pequeña para distinguirse del azar (2,1 %, IC -0,1 a 4,2).
- No hay comparación disponible para la presión, por lo que no puede afirmarse que supere al NBM en esa variable.
- Los pesos no pueden cargarse con la implementación estándar de Timestral: es necesario usar `indra/model.py` debido a la poda y a la modificación de la máscara de atención.
- La licencia es "modified-mit" (MIT modificada); deben revisarse los términos exactos del archivo LICENSE antes de un uso comercial.
- No se documentan sesgos, tasas de alucinación ni comportamiento fuera de la distribución de los aeropuertos de entrenamiento.
- El modelo no es lingüístico ni multilingüe; no admite tool calling, agentes ni razonamiento multi-paso.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una validación externa limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sculptor-AI/Indra-1.5M
- Modelo base Timestral-5M: https://huggingface.co/mistralai/Timestral-5M
- Modelo hermano Indra-3M: https://huggingface.co/Sculptor-AI/Indra-3M
