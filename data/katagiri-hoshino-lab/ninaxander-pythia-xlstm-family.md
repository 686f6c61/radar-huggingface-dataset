# Katagiri-Hoshino-Lab/ninaxander-pythia-xlstm-family

## Resumen

NinaXander PX chimera family es un paquete de investigación publicado por Katagiri-Hoshino-Lab que contiene un adaptador de latente compartido y estadísticas por capa para construir modelos híbridos mediante la recombinación bidireccional de bloques congelados de dos modelos padre (denominados P y X en la documentación). No es un modelo generativo autónomo, sino una infraestructura de composición: un adaptador que transforma las representaciones residuales de un padre para inyectarlas en el otro, junto con recetas de construcción y semillas de entrenamiento. El repositorio ocupa 3,2 GB y se distribuye en formato PyTorch/safetensors bajo la librería `pytorch`.

El interés técnico reside en que explora la reutilización de pesos congelados sin reentrenamiento, un enfoque relevante para investigación en interpretabilidad, merging de modelos y análisis de transferencia de capacidades entre arquitecturas. El adaptador cubre las 32 fronteras de bloque posibles, aunque solo se han validado las fronteras 4, 8, 16 y 24 en los tests publicados. La model card advierte explícitamente de que la validación se limita a la fidelidad de exportación (igualdad de salida en CPU tras recargar los safetensors) y no a la calidad de generación de texto.

Se trata de un artefacto de investigación con descargas y likes nulos en el momento de la consulta, sin licencia declarada ni idiomas especificados, y que no implementa la interfaz `AutoModelForCausalLM`. Su uso requiere descargar por separado los pesos de los modelos padre y disponer de las implementaciones de prefijo y sufijo de cada uno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Composición de bloques transformer congelados (padres P y X) mediante adaptador de latente compartido |
| Parametros totales | no disponible (el paquete contiene adaptador y estadísticas; los pesos padre se referencian externamente) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los padres R/P usan float16; X usa float32 con TF32 desactivado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (carga vía PyTorch; el paquete incluye `inference.py`) |

## Arquitectura y entrenamiento

El sistema no entrena un transformer desde cero, sino que recombina bidireccionalmente bloques congelados de dos modelos padre. Para cada frontera de bloque (hasta 32), un adaptador compartido realiza una estandarización de la representación residual de origen, una conversión no lineal y una estandarización inversa, de modo que el residual resultante puede inyectarse en el sufijo del modelo receptor tras el bloque elegido. El paquete incluye las estadísticas por capa necesarias para esa estandarización (con épsilon ya incorporado en las desviaciones típicas almacenadas) y las recetas de construcción en `configurations.json`, que identifican dirección, semilla, frontera y estado de evaluación de cada combinación.

Se distribuyen tres semillas de entrenamiento principales. La validación registrada en `validation.json` por semilla comprueba el hash del checkpoint de origen y la igualdad exacta de salida en CPU tras recargar los safetensors, en las fronteras 4 y 24 y en ambas direcciones. El estudio reporta ganancias dependientes de dirección, profundidad y tarea frente a la conversión afín, resultados mixtos frente a la conversión no lineal directa y pérdidas sustanciales de capacidad respecto a los padres. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Composición de modelos: construye variantes híbridas a partir de bloques congelados de dos padres, con conversión de residuales en ambas direcciones.
- Cobertura de fronteras: el adaptador soporta las 32 fronteras de bloque; solo las fronteras 4, 8, 16 y 24 cuentan con tests downstream publicados.
- Reproducibilidad: incluye recetas, semillas y estadísticas por capa para replicar las construcciones.
- Validación de exportación: verifica igualdad exacta de salida en CPU tras recargar los safetensors en fronteras 4 y 24.
- No implementa `AutoModelForCausalLM`: la generación requiere las implementaciones de prefijo y sufijo de los modelos padre.
- No se documentan tool calling, function calling, capacidades de agente, multilingüismo, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en merging de modelos: permite estudiar cómo se transfieren capacidades entre dos transformers congelados insertando un adaptador en una frontera de bloque concreta, sin reentrenar los pesos padre.
- Análisis de transferencia por profundidad: al cubrir 32 fronteras, facilita experimentos que aíslan en qué capa se localiza una capacidad y cómo cambia al mover el punto de inyección.
- Reproducción de experimentos: las recetas con semilla, dirección y frontera en `configurations.json` permiten replicar construcciones concretas y comparar resultados entre semillas.
- Auditoría de fidelidad numérica: los `validation.json` sirven como referencia para comprobar que una exportación propia reproduce exactamente las salidas en CPU en las fronteras 4 y 24.
- Estudio de conversión de representaciones: el adaptador (estandarización, no linealidad, estandarización inversa) puede compararse contra conversión afín y conversión no lineal directa en tareas controladas.
- Docencia e investigación académica: como artefacto pequeño (3,2 GB) y con código de carga incluido, es adecuado para prácticas sobre composición de modelos, siempre que se disponga de los padres referenciados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta hallazgos cualitativos: ganancias dependientes de dirección, profundidad y tarea frente a la conversión afín, resultados mixtos frente a la conversión no lineal directa, y pérdidas sustanciales de capacidad respecto a los modelos padre.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende enteramente del tamaño de los modelos padre P y X, cuyos pesos no se incluyen en este repositorio.
- GPU recomendadas: no disponible por la misma razón; la model card menciona `device="cuda"` en el ejemplo de carga y el uso de float32 con TF32 desactivado para X, y float16 para R/P.
- Compatibilidad con GPU de consumo: no determinable sin conocer los padres; el paquete en sí ocupa 3,2 GB en disco.
- Opciones de despliegue: carga mediante `huggingface_hub.snapshot_download` y el módulo `inference.py` incluido (`NinaXanderFamily`). No es compatible con `AutoModelForCausalLM`, por lo que no se integra directamente en vLLM, TGI ni Ollama sin trabajo adicional.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NinaXander PX chimera family | Adaptador de composición sobre padres congelados | no disponible | no disponible | no disponible | Hugging Face (0 descargas) |
| Model merging clásico (p. ej. merge de pesos por interpolación) | Técnica, no modelo | N/A | N/A | N/A | Herramientas como mergekit |
| Frankenmerge por capas | Técnica, no modelo | N/A | N/A | N/A | Implementaciones comunitarias |

No se dispone de información sobre modelos comparables directos en la documentación proporcionada; las alternativas citadas son técnicas de composición, no artefactos equivalentes.

## Limitaciones y advertencias

- La validación publicada comprueba fidelidad de exportación (igualdad de salida en CPU), no calidad de generación ni finitud numérica en entradas arbitrarias.
- Solo las fronteras 4, 8, 16 y 24 tienen tests downstream; el soporte de las 32 fronteras no implica validación en el resto.
- El estudio reporta pérdidas sustanciales de capacidad respecto a los modelos padre, por lo que los híbridos no son sustitutos directos de estos.
- La revisión exacta de las conversiones locales de R/P no se conservó; solo los identificadores de Hub apuntan a familias compatibles, lo que compromete la reproducibilidad exacta de esos padres. La revisión de X sí está fijada.
- No es un `AutoModelForCausalLM`: requiere implementaciones de prefijo y sufijo de los padres y un manejo cuidadoso del token BOS (prepend de BOS 0 en entrada nativa, omisión del residual BOS de origen al convertir texto, retención del BOS nativo del receptor al inyectar prefijo).
- Licencia no declarada: no hay autorización explícita para uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Sin idiomas declarados, sin benchmarks y con cero descargas: madurez y soporte comunitario inexistentes.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Katagiri-Hoshino-Lab/ninaxander-pythia-xlstm-family
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
