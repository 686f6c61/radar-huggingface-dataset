# Negodishka/NG

## Resumen

NG es un modelo publicado en Hugging Face por el usuario Negodishka bajo la licencia bigcode-openrail-m. La model card asociada está prácticamente vacía: únicamente declara la licencia, sin información sobre arquitectura, parámetros, contexto, datos de entrenamiento ni capacidades. El repositorio no registra descargas ni interacciones (0 descargas, 0 likes) y no tiene pipeline declarado, por lo que no es posible clasificarlo funcionalmente a partir de los metadatos disponibles.

La elección de la licencia bigcode-openrail-m sugiere que el autor pretende orientar el modelo a tareas de generación de código, dado que es la licencia empleada habitualmente por la familia StarCoder y otros modelos de código de BigCode. Sin embargo, esta inferencia se basa exclusivamente en la licencia y no está confirmada por ninguna documentación técnica del repositorio.

En el momento de redactar esta ficha no se dispone de información verificable sobre el modelo más allá de su identificador, autor, licencia y fechas de creación y actualización (29 de octubre de 2026). Todos los apartados técnicos que dependen de datos del autor se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | bigcode-openrail-m |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la información disponible. No consta si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura híbrida o cualquier otra variante, ni el número de parámetros, capas, cabezas de atención o dimensión oculta.

Tampoco hay datos sobre el corpus de entrenamiento (número de tokens, composición del dataset, proporción de código frente a lenguaje natural), sobre si se aplicaron técnicas de alineación como RLHF o DPO, ni sobre innovaciones técnicas específicas (atención lineal, decodificación especulativa, tokenizador particular, etc.). Cualquier afirmación al respecto sería especulativa.

## Capacidades

- No se documentan capacidades específicas en la model card ni en los metadatos del repositorio.
- No consta soporte de tool calling ni function calling.
- No consta soporte de agentes ni de razonamiento multi-paso.
- No se declaran idiomas soportados.
- No se declaran capacidades multimodales (visión, audio) ni modos especiales como thinking mode.
- La licencia bigcode-openrail-m sugiere un posible enfoque hacia código, pero no hay confirmación técnica en la información disponible.

## Casos de uso

- Evaluación comparativa de modelos de código: dado que la licencia bigcode-openrail-m se asocia habitualmente a modelos orientados a programación, podría emplearse en experimentos de generación de código, pero sin documentación técnica no es posible garantizar su idoneidad.
- Investigación sobre licencias abiertas: el modelo puede servir como caso de estudio de publicación de pesos bajo bigcode-openrail-m y de sus implicaciones para uso comercial.
- Pruebas de integración en pipelines de Hugging Face: permite validar flujos de descarga, carga y ejecución con modelos de autoría independiente.
- Reproducción de experimentos académicos: si el autor publica posteriormente detalles, podría reutilizarse en entornos de investigación comparativa.
- Despliegue experimental en entornos controlados: únicamente tras inspeccionar los pesos y verificar el comportamiento real del modelo.
- Auditoría de seguridad de modelos: análisis de sesgos y comportamiento de un checkpoint sin documentación, útil para estudiar riesgos de modelos opacos.

En todos los casos anteriores debe tenerse en cuenta que la ausencia de documentación impide confirmar que el modelo sea adecuado para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible, al desconocerse el número de parámetros y el formato de pesos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; depende del formato de pesos, que no consta.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No es posible establecer una comparativa fiable porque se desconocen el tamaño, la arquitectura y el rendimiento del modelo. Como referencia de categoría por licencia, se incluyen alternativas conocidas que usan bigcode-openrail-m, aunque la comparación técnica no puede completarse:

| Modelo | Parametros | Contexto | Licencia | Documentacion |
|---|---|---|---|---|
| Negodishka/NG | no disponible | no disponible | bigcode-openrail-m | practicamente inexistente |
| StarCoderBase-1B | 1B | 8k (aprox.) | bigcode-openrail-m | completa |
| StarCoderBase-3B | 3B | 8k (aprox.) | bigcode-openrail-m | completa |
| StarCoder2-3B | 3B | 16k (aprox.) | bigcode-openrail-m | completa |

Los datos de los modelos StarCoder corresponden a la documentación pública de BigCode; la fila de NG refleja únicamente lo disponible en su repositorio.

## Limitaciones y advertencias

- Ausencia total de model card técnica: no se puede verificar arquitectura, entrenamiento ni comportamiento esperado.
- Riesgo elevado de alucinación y de comportamiento impredecible al no existir evaluación publicada.
- Sesgos desconocidos: sin información sobre el corpus de entrenamiento no es posible evaluar sesgos de género, idioma, cultura o código.
- Idiomas soportados no declarados; no se garantiza un rendimiento aceptable en castellano ni en ningún otro idioma.
- Licencia bigcode-openrail-m: permite uso comercial con condiciones (incluye cláusulas de uso aceptable y obligaciones de atribución); debe revisarse el texto completo antes de su explotación.
- Sin descargas ni validación comunitaria: no hay evidencia de que los pesos funcionen correctamente.
- No recomendado para producción sin una auditoría previa de los pesos y del comportamiento del modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Negodishka/NG
- Texto de la licencia bigcode-openrail-m: no disponible en la información proporcionada (se recomienda consultar el acuerdo publicado por BigCode)
- Paper, blog o demo del modelo: no disponible
