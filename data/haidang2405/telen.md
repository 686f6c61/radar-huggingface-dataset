# haidang2405/telen

## Resumen

TELEN es un sistema de recuperación de artículos legales vietnamitas basado en grafos residuales condicionados por consulta, desarrollado por Dang Dinh (haidang2405). Almacena vectores de disposiciones legales en un espacio de texto estable, lo que permite añadir nuevas versiones normativas sin re-codificar los vectores antiguos, y añade un residuo local acotado únicamente cuando el grafo de candidatos expone una arista tipificada.

Su relevancia radica en abordar la actualización normativa incremental en el dominio legal vietnamita, un problema práctico para sistemas de recuperación jurídica. La arquitectura combina recuperación textual con evidencia estructural de grafos, y el flujo de ejecución distingue claramente entre actualización legal y consulta.

El repositorio en Hugging Face es una publicación de código fuente únicamente: no incluye pesos entrenados, puntos de control, caché de embeddings ni rankings por consulta. Esta ausencia de pesos es intencional según la model card, y los datos de evaluación (DRiLL, ALQAC, FiscalQA) deben obtenerse de forma independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sistema residual sobre grafos condicionado por consulta (graph neural network) |
| Parámetros totales | no disponible (no se distribuyen pesos) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | vietnamita |
| Licencia | MIT |
| Formato de pesos | no disponible (publicación solo de código fuente) |

## Arquitectura y entrenamiento

TELEN no es un modelo de lenguaje grande convencional, sino un sistema de recuperación basado en grafos. Su arquitectura combina un espacio de texto estable para vectores de disposiciones legales con un componente de grafo que modela relaciones tipificadas entre candidatos. El flujo de actualización legal valida nuevas versiones y eventos, codifica únicamente los textos de las nuevas disposiciones y añade los vectores y el estado del grafo, verificando que los parámetros no cambian y que los vectores antiguos permanecen intactos.

En la fase de consulta, el sistema genera candidatos de texto congelados, propaga mensajes locales tipificados a través del grafo, aplica una puerta de evidencia estructural y finalmente calcula un residuo acotado que se suma a la puntuación de texto. Si no hay aristas de grafo expuestas para un candidato, el residuo es exactamente cero y su puntuación final coincide con la de texto congelado. No se han publicado detalles sobre el entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) en la información disponible. El repositorio incluye código de compatibilidad heredado para scripts de línea base predecesores y una API pública denominada `TELENEngine`.

## Capacidades

- Recuperación de artículos legales vietnamitas mediante consultas en lenguaje natural.
- Actualización incremental de versiones legales sin re-codificar vectores antiguos.
- Uso de evidencia estructural (aristas tipificadas en el grafo de candidatos) para mejorar el ranking.
- Residuo local acotado que solo se activa cuando existe una arista tipificada expuesta.
- API pública `TELENEngine` para integración en aplicaciones externas.
- Scripts de experimentación, preparación de datos, controles e intervenciones para reproducibilidad.
- Compatibilidad con código heredado para scripts de línea base predecesores.

## Casos de uso

- Sistemas de búsqueda jurídica vietnamita: TELEN permite consultar disposiciones legales vigentes con soporte de actualizaciones normativas incrementales, ideal para bufetes y organismos públicos que necesitan mantener un índice legal actualizado sin re-codificar el corpus completo.
- Monitorización de cambios legislativos: el flujo de actualización legal valida nuevas versiones y solo codifica textos nuevos, reduciendo costes de re-codificación en entornos con legislación cambiante.
- Asistencia a la redacción de documentos legales: los profesionales pueden consultar artículos relevantes mediante lenguaje natural y obtener candidatos ordenados por relevancia textual y estructural.
- Investigación académica en recuperación de información legal: el repositorio incluye scripts de evaluación, preparación de experimentos y controles, útil para reproducir experimentos con los datasets DRiLL, ALQAC o FiscalQA.
- Integración en pipelines de análisis legal: la API `TELENEngine` puede incorporarse en sistemas de análisis de normativa vietnamita que requieran recuperación precisa de artículos.
- Desarrollo de sistemas de pregunta-respuesta legal: la recuperación de artículos puede servir como etapa de recuperación en sistemas RAG para el dominio legal vietnamita, aprovechando la combinación de similitud textual y evidencia estructural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el repositorio no contiene registros de benchmarks ni rankings por consulta, y que los materiales del artículo (incluido el punto de control TELEN-GP) se mantienen en archivos privados y no forman parte de esta publicación.

## Requisitos de hardware

- Al no distribuirse pesos entrenados, no se requieren GPUs específicas para inferencia del modelo entrenado.
- El código fuente requiere un entorno Python con PyTorch instalado; los requisitos de memoria dependerán del tamaño del corpus legal y del grafo de candidatos.
- Las pruebas unitarias y los scripts de verificación pueden ejecutarse en hardware de propósito general (CPU).
- Para experimentos a escala con datasets como DRiLL o ALQAC, los requisitos de hardware no están documentados en la información disponible.
- No se mencionan opciones de despliegue específicas como vLLM, llama.cpp u Ollama, dado que no es un modelo generativo de lenguaje.
- El paquete se instala mediante `pip install -e ".[dev]"` desde el repositorio de GitHub.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros sistemas de recuperación legal vietnamita en los datos proporcionados. La model card menciona los datasets DRiLL, ALQAC y FiscalQA como referencias del dominio, pero no ofrece resultados comparativos publicados ni métricas de rendimiento frente a alternativas.

## Limitaciones y advertencias

- El repositorio no incluye pesos entrenados ni puntos de control: no es posible utilizar el sistema directamente sin entrenar o sin obtener los pesos de fuentes privadas.
- No se publican resultados de benchmarks ni rankings por consulta, lo que impide evaluar el rendimiento real del sistema.
- Los datos de entrenamiento y evaluación (DRiLL, ALQAC, FiscalQA y datos vietnamitas con licencia) deben obtenerse de forma independiente de sus proveedores.
- El sistema está especializado en el dominio legal vietnamita; su aplicación a otros idiomas o jurisdicciones no está documentada.
- No se dispone de información sobre sesgos, riesgos de alucinación o limitaciones de contexto, dado que no es un modelo generativo de lenguaje.
- La licencia MIT permite uso comercial, pero la ausencia de pesos entrenados limita el despliegue práctico inmediato.
- El punto de control TELEN-GP y los materiales del artículo se mantienen en archivos privados y no son accesibles públicamente.

## Enlaces

- Hugging Face: https://huggingface.co/haidang2405/telen
- GitHub: https://github.com/dangdinh2405/telen
- Perfil del autor en Hugging Face: https://huggingface.co/haidang2405
- Perfil del autor en GitHub: https://github.com/HaiDang46
