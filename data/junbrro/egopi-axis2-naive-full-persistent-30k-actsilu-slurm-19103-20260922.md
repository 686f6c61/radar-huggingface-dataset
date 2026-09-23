# junbrro/egopi-axis2-naive-full-persistent-30k-actsilu-slurm-19103-20260922

## Resumen

Se trata de un checkpoint de pesos publicado en HuggingFace por el usuario `junbrro` bajo el identificador `egopi-axis2-naive-full-persistent-30k-actsilu-slurm-19103-20260922`. No es un modelo con model card descriptiva: el repositorio contiene únicamente los pesos finales y la configuración de una ejecución de entrenamiento concreta (paso final 30000, origen identificado como "Slurm 19103"), sin estado del optimizador ni de generación aleatoria. La información pública disponible se limita a los metadatos del repositorio y a las cuatro líneas de la model card.

El dato objetivo más relevante es el tamaño: 6.912.902.976 parámetros (aproximadamente 6,9 mil millones), con un repositorio de 13,8 GB en formato safetensors, lo que es coherente con pesos almacenados en bf16/fp16 (6,9 mil millones × 2 bytes ≈ 13,8 GB). La etiqueta `RLDX-1` y la mención de un tokenizador de acciones (`actlat/`) en la model card apuntan a un modelo vinculado a control o acción más que a generación de texto convencional, pero esto no se confirma en ninguna fuente.

Su relevancia actual es limitada y de carácter experimental: cero descargas, cero "likes", sin licencia declarada, sin idiomas declarados y sin documentación de arquitectura, contexto o datos de entrenamiento. Es material plausiblemente útil para quien reproduzca el experimento original, no para evaluación o despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio incluye la etiqueta `RLDX-1`, sin especificar transformer, MoE, SSM ni arquitectura híbrida) |
| Parametros totales | 6.912.902.976 (≈6,9 mil millones), dato real de los safetensors |
| Parametros activos | no disponible; no se indica que sea un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se distribuyen pesos safetensors (tamaño compatible con bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio de 13,8 GB); se menciona un tokenizador de acciones adjunto en `actlat/` |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-23 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna. El identificador del repositorio (`egopi-axis2-naive-full-persistent-30k-actsilu-slurm-19103-20260922`) describe el experimento, no el modelo: "naive cotrain" sugiere un entrenamiento conjunto con una estrategia de co-entrenamiento sin refinamiento, "full-token persistent" apunta a un esquema de persistencia de tokens completos en el contexto o en el estado, y "actsilu" a una función de activación del tipo SiLU (o una variante). "Slurm 19103" identifica el trabajo de planificación en el clúster de origen y "30k" el paso final de entrenamiento.

La model card indica explícitamente que solo se incluyen pesos y configuración finales, excluyendo el estado del optimizador y del generador aleatorio, y que la configuración original se conserva tal cual, incluidas las rutas del clúster de origen, que deben reasignarse antes de su uso. Se menciona también un directorio `actlat/` con el tokenizador de acciones "cuando aplica", lo que sugiere que el modelo puede operar sobre un espacio de acciones discretizadas en lugar de (o además de) tokens de texto. No hay datos sobre número de tokens de entrenamiento, composición del dataset, ni uso de RLHF, DPO u otras técnicas de alineamiento.

## Capacidades

No se ha publicado ninguna descripción de capacidades en la información disponible. A partir de los únicos indicios presentes en el repositorio, pueden formularse las siguientes observaciones, todas ellas no confirmadas:

- Generación de texto: no confirmada; el pipeline no está declarado.
- Razonamiento, código o matemáticas: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara ningún idioma.
- Capacidad especial: la presencia de un tokenizador de acciones (`actlat/`) sugiere un uso orientado a acción o control, no confirmado por ninguna otra fuente.
- Modo de razonamiento explícito, visión o audio: no disponible.

## Casos de uso

Dado que no se documentan capacidades, tarea ni licencia, no es posible recomendar casos de uso en producción. Los escenarios siguientes son hipótesis de trabajo para quien investigue el checkpoint, no aplicaciones validadas:

- Reproducción de experimentos de entrenamiento: cargar los pesos en el paso 30000 junto con la configuración incluida para continuar o comparar con otras ejecuciones de la misma serie, reasignando previamente las rutas del clúster de origen.
- Auditoría de checkpoints intermedios: analizar cómo evoluciona el modelo en el paso 30000 frente a otros pasos de la misma ejecución, útil para estudiar dinámicas de entrenamiento.
- Investigación sobre co-entrenamiento con tokenizador de acciones: si se confirma que `actlat/` codifica acciones, el checkpoint podría servir para estudiar la interfaz entre representaciones de texto y representaciones de acción.
- Evaluación de estabilidad numérica de la activación empleada: el sufijo `actsilu` permite estudiar el efecto de esa configuración de activación en un modelo de 6,9 mil millones de parámetros.
- Punto de partida para fine-tuning experimental: con 6,9 mil millones de parámetros y pesos en bf16, es ajustable en una GPU de 24 GB con cuantización o con técnicas de ajuste eficiente en parámetros, siempre que la licencia lo permita (actualmente no declarada).
- Estudios de infraestructura Slurm: el repositorio documenta una ejecución concreta en clúster, útil como referencia para reproducir entornos de entrenamiento distribuido.
- Despliegue en producción: no recomendable en el estado actual, por ausencia de licencia, documentación y validación comunitaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento real de parámetros (6.912.902.976) y del tamaño del repositorio (13,8 GB), asumiendo un transformer denso con pesos en bf16. Al desconocerse la arquitectura, la longitud de contexto y si existe atención con consultas agrupadas (GQA) o atención lineal, el consumo de memoria de la caché KV puede variar de forma significativa.

- Pesos en bf16/fp16: aproximadamente 13,8 GB.
- VRAM estimada en bf16/fp16: 16-20 GB en la práctica, sumando pesos, activaciones y caché KV con contexto moderado.
- VRAM estimada en int8: 7-9 GB.
- VRAM estimada en int4: 4-6 GB.
- GPU de consumo: cabe en una RTX 4090 o RTX 3090 (24 GB) en bf16; en tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) requiere cuantización a 8 o 4 bits.
- GPU de centro de datos: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB, sin problemas de capacidad en bf16.
- Opciones de despliegue: vLLM o TGI si la arquitectura resulta ser un transformer compatible; llama.cpp u Ollama requerirían conversión a GGUF, que no se incluye en el repositorio. No se dispone de adaptadores ni plantillas de chat publicadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No es posible establecer una comparativa rigurosa: se desconoce la tarea del modelo (la etiqueta `RLDX-1` y el tokenizador de acciones sugieren un dominio distinto al de los modelos de lenguaje de propósito general), no hay benchmarks publicados, no se declara licencia y el repositorio no cuenta con ninguna validación de la comunidad. Cualquier comparación con modelos densos de ~7-8 mil millones de parámetros sería especulativa y no verificable.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita, no existe autorización clara para uso comercial ni para redistribución. Debe tratarse como material sin derechos de uso definidos.
- Sin documentación de arquitectura: se desconoce si es un transformer denso, MoE o una arquitectura híbrida, lo que impide planificar con precisión memoria, rendimiento y compatibilidad con frameworks de inferencia.
- Sin idiomas declarados ni datos de entrenamiento: no se puede evaluar cobertura lingüística, sesgos de dominio ni calidad por idioma.
- Riesgo de alucinación: no evaluable, pero cualquier modelo de lenguaje sin alineamiento documentado presenta este riesgo por defecto.
- Checkpoint intermedio: corresponde al paso 30000 de una ejecución de entrenamiento concreta; no hay evidencia de que sea una versión final validada.
- Rutas del clúster de origen: la propia model card advierte de que la configuración conserva rutas del clúster original y debe reasignarse antes del uso; cargarla sin modificarla provocará errores de resolución de ficheros.
- Ausencia de estado del optimizador: no es posible reanudar el entrenamiento de forma exacta desde este punto.
- Tokenizador de acciones: si el modelo requiere `actlat/`, ignorarlo o sustituirlo por un tokenizador distinto producirá resultados inválidos.
- Cero adopción: 0 descargas y 0 likes implican ausencia total de validación externa, informes de errores o recetas de despliegue.
- Fecha de creación atípica (2026-09-23): conviene verificar la procedencia y la integridad de los ficheros antes de cualquier uso.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/junbrro/egopi-axis2-naive-full-persistent-30k-actsilu-slurm-19103-20260922
- Búsqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos por la búsqueda corresponden a páginas de descarga del navegador Google Chrome y a hilos de foro sin relación con el modelo, por lo que no se incluyen.
- Paper, blog, repositorio de código o demo: no disponibles.
