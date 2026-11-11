# Katagiri-Hoshino-Lab/ninaxander-rwkv-pythia-family

## Resumen

NinaXander RP chimera family es un paquete de investigación publicado por Katagiri-Hoshino-Lab que no constituye un modelo generativo autónomo, sino un conjunto de artefactos para componer modelos mediante la recombinación bidireccional de bloques congelados de modelos padre. El paquete incluye un adaptador de latente compartido, estadísticas por capa y recetas de construcción para tres semillas de entrenamiento principales. Los pesos de los modelos padre no se distribuyen en este repositorio: se referencian externamente en el `config.json`.

El interés técnico reside en que el adaptador cubre las 32 fronteras de bloques posibles, aunque solo se han validado aguas abajo las fronteras 4, 8, 16 y 24. El repositorio ocupa 3,2 GB y se distribuye en formato safetensors con código PyTorch. No es un `AutoModelForCausalLM`: requiere las implementaciones de prefijo y sufijo de los modelos padre para generar texto.

La relevancia es acotada y experimental. El propio autor advierte de pérdidas sustanciales de capacidad respecto a los padres y de resultados mixtos frente a conversiones afines. Es material para investigadores interesados en composición modular de transformers, no una base para despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Composición de bloques de transformers congelados (recombinación bidireccional); adaptador de latente compartido |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en float16 para R/P y float32 para X según la model card) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

El sistema no entrena un transformer desde cero ni aplica ajuste fino clásico. Parte de bloques congelados de modelos padre (identificados como R, P y X en la configuración) y los recombina de forma bidireccional en 32 fronteras posibles. Sobre esa estructura se entrena un adaptador de latente compartido que realiza estandarización, una conversión no lineal y estandarización inversa sobre el residual posterior al bloque en posiciones de texto alineadas. Las desviaciones estándar almacenadas ya incorporan epsilon.

El paquete contiene las recetas de construcción, las estadísticas por capa y el adaptador para tres semillas, además de ficheros `validation.json` que registran el hash del checkpoint fuente y la igualdad exacta de salida en CPU tras recargar los safetensors, en las fronteras 4 y 24 y en ambas direcciones. Esa validación mide fidelidad de exportación, no calidad de generación ni finitud numérica en entradas arbitrarias. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Conversión de residuales entre bloques de modelos padre distintos (R a P y P a R, entre otras direcciones), en las 32 fronteras soportadas por el adaptador.
- Inyección de prefijos: el residual BOS nativo del receptor se conserva al inyectar un prefijo.
- Composición modular de modelos congelados sin reentrenar los bloques originales.
- Soporte de tres semillas de entrenamiento independientes con recetas identificadas en `configurations.json`.
- Generación de texto solo de forma indirecta: requiere las implementaciones de prefijo y sufijo de los modelos padre.
- No se documentan tool calling, function calling, capacidades de agente, multilingüismo, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en composición de modelos: permite estudiar cómo se transfieren representaciones entre bloques de profundidades distintas y en qué dirección la conversión preserva mejor la información, usando las recetas y semillas incluidas.
- Reproducción de experimentos: los ficheros `validation.json` con hashes y comprobaciones de igualdad exacta en CPU facilitan replicar los resultados de exportación en las fronteras 4 y 24.
- Análisis de pérdida de capacidad: el paquete permite cuantificar la degradación que introduce la recombinación frente a los padres, un dato relevante para quien evalúe arquitecturas modulares.
- Estudio de adaptadores de latente: el mecanismo de estandarización, conversión no lineal e inversa es un objeto de análisis aislado, independiente del modelo completo.
- Prototipado de arquitecturas quiméricas: sirve para explorar combinaciones de profundidad y dirección antes de invertir en entrenamiento completo.
- Docencia y divulgación técnica: ilustra de forma concreta qué significa recombinar bloques congelados y qué límites tiene, con artefactos verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta hallazgos cualitativos: ganancias dependientes de dirección, profundidad y tarea frente a la conversión afín, resultados mixtos frente a conversión no lineal directa y pérdidas sustanciales de capacidad respecto a los modelos padre.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende enteramente del tamaño de los modelos padre referenciados, que no se especifican.
- GPU recomendadas: no disponible. La model card usa `device="cuda"` en el ejemplo de carga y exige float32 con TF32 desactivado para el modelo X, y float16 para R y P.
- Compatibilidad con GPU de consumo: no determinable sin conocer los padres; el repositorio en sí ocupa 3,2 GB.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser una implementación `AutoModelForCausalLM`. La carga se realiza importando el módulo `inference` del repositorio descargado con `huggingface_hub.snapshot_download`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de composición por recombinación de bloques congelados con adaptador de latente compartido, ni se especifican los modelos padre con los que establecer una comparación de parámetros, contexto o licencia.

## Limitaciones y advertencias

- No es un modelo generativo listo para usar: requiere los pesos y las implementaciones de prefijo y sufijo de los modelos padre, referenciados externamente.
- Solo se han validado aguas abajo las fronteras 4, 8, 16 y 24; el resto de las 32 fronteras carece de validación downstream según el propio autor.
- La validación registrada comprueba fidelidad de exportación, no calidad de generación ni finitud numérica en entradas arbitrarias.
- Pérdidas sustanciales de capacidad respecto a los modelos padre, reconocidas explícitamente en la model card.
- Resultados mixtos frente a conversión no lineal directa, lo que limita la justificación práctica del método.
- La revisión exacta de las conversiones locales de R y P no se conservó; solo los identificadores de Hub apuntan a familias compatibles. Esto compromete la reproducibilidad exacta.
- Licencia no disponible: no puede asumirse uso comercial permitido.
- Idiomas soportados no disponibles.
- Los ficheros excluyen estado de optimizador y scheduler, por lo que no permiten reanudar entrenamiento.
- Riesgo de alucinación y sesgos: no evaluables con la información disponible, al no existir validación de calidad de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Katagiri-Hoshino-Lab/ninaxander-rwkv-pythia-family
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos asociados.
