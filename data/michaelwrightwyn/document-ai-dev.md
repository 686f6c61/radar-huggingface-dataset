# michaelwrightwyn/document-ai-dev

## Resumen

El repositorio `michaelwrightwyn/document-ai-dev`, publicado por el usuario de HuggingFace michaelwrightwyn (Mateo Torres), no es un modelo de lenguaje entrenado, sino un cuaderno de notas de investigación sobre Document AI. La model card lo describe explícitamente como "reading notes and an experiment sketch": su artefacto principal es un fichero `analysis.md` que recoge el alcance de una pregunta de investigación, posibles factores de confusión, un diseño de comparación con baselines emparejados y un contexto de evaluación basado en los conjuntos de datos FUNSD, SROIE y CORD. El autor declara de forma explícita que el repositorio no reclama mejoras en benchmarks, ablaciones completadas, código liberado ni checkpoint entrenado.

Por tanto, lo que se publica aquí es documentación metodológica y un plan experimental, no pesos utilizables para inferencia. Los metadatos del repositorio incluyen la etiqueta `safetensors` y una cifra de 33.088 parámetros totales, un valor incompatible con cualquier transformer funcional y que apunta a un artefacto residual o de prueba (fichero de configuración, tensor simbólico o placeholder), no a un modelo operativo. El tamaño del repositorio es de 0,0 GB, es decir, no contiene pesos descargables de entidad.

Su relevancia es, en consecuencia, acotada y de tipo procedimental: sirve como plantilla de rigor metodológico para quienes preparan experimentos de extracción de información en documentos, con un énfasis deliberado en no fabricar puntuaciones y en exigir versiones de dataset, comandos, semillas, hardware y logs en bruto antes de aceptar cualquier resultado. La licencia es CC-BY-4.0 y no se declaran idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene un modelo entrenado; la etiqueta `transformer` de los metadatos no se corresponde con ningún checkpoint publicado) |
| Parametros totales | 33.088 (según los metadatos de safetensors del repositorio; no disponible el desglose por capas) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card no declara ninguno) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (etiqueta de los metadatos; no hay pesos funcionales descargables) |

Otros datos del repositorio: ID `michaelwrightwyn/document-ai-dev`, pipeline no disponible, 0 descargas, 0 likes, tamaño del repositorio 0,0 GB, creado el 25 de septiembre de 2026 y actualizado el mismo día (cinco segundos después), lo que sugiere una subida única sin iteraciones posteriores.

## Arquitectura y entrenamiento

No hay información sobre arquitectura ni entrenamiento porque no existe un modelo entrenado en el repositorio. Los metadatos incluyen la etiqueta `transformer`, pero la propia model card aclara que no se ha publicado ningún checkpoint y que el contenido es una nota exploratoria. No se declaran datos de entrenamiento, número de tokens, composición del dataset, ni procesos de ajuste como RLHF, DPO o SFT.

La única propuesta técnica descrita es metodológica: un plan de comparación con baselines emparejados sobre los conjuntos FUNSD (comprensión de formularios escaneados), SROIE (extracción de recibos) y CORD (recibos de restaurantes), junto con comprobaciones de reproducibilidad, modos de fallo y preguntas abiertas. El autor establece el criterio de que cualquier resultado futuro deberá acompañarse de versiones de dataset, comandos exactos, semillas, hardware y logs en bruto. No se describe ninguna innovación arquitectónica como decodificación especulativa, atención lineal ni mecanismos híbridos.

## Capacidades

- Generación de texto: no disponible; el repositorio no contiene un modelo capaz de inferencia.
- Razonamiento, código y matemáticas: no disponible por la misma razón.
- Visión y comprensión de documentos: no implementada. Aunque la temática del repositorio es Document AI, no se publica ningún modelo con capacidad de procesamiento de imágenes o documentos.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Capacidad especial: la única aportación es documental, en forma de notas de investigación y un esbozo de experimento en `analysis.md`.

## Casos de uso

- Planificación de un experimento de extracción de información: el fichero `analysis.md` puede usarse como guion para definir el alcance de la pregunta de investigación y enumerar factores de confusión antes de escribir código.
- Diseño de evaluaciones sobre FUNSD, SROIE y CORD: el repositorio identifica estos tres conjuntos como contexto de evaluación, lo que permite reutilizarlos como punto de partida para construir un banco de pruebas propio.
- Revisión metodológica interna: el documento sirve como lista de comprobación para exigir versiones de dataset, comandos, semillas, hardware y logs en bruto antes de dar por válido un resultado de un compañero o de uno mismo.
- Redacción de secciones de limitaciones y trabajo futuro: la nota distingue de forma explícita entre planes, hipótesis y resultados, lo que resulta directamente utilizable como texto base para un apartado de limitaciones.
- Formación de investigadores junior: el repositorio ilustra, con un caso real, la diferencia entre un plan experimental y una evidencia empírica, incluyendo la advertencia de no fabricar puntuaciones.
- Búsqueda de referencias sobre Document AI: la model card menciona un apartado de referencias relevantes al tema, útil como punto de entrada bibliográfico.
- Auditoría de repositorios: sirve como ejemplo de cómo etiquetar correctamente un repositorio que no contiene un modelo, evitando que se confunda con un checkpoint desplegable.

En ningún caso estos usos implican ejecutar inferencia con el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara de forma explícita que el repositorio "no reclama mejoras en benchmarks, ablaciones completadas, código liberado ni un checkpoint entrenado", y que las secciones etiquetadas como planes o hipótesis no deben interpretarse como resultados experimentales.

## Requisitos de hardware

- No se requiere hardware de inferencia: el repositorio no contiene un modelo ejecutable.
- VRAM estimada: no aplica. El tamaño del repositorio es de 0,0 GB y la cifra de 33.088 parámetros no corresponde a un modelo funcional.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica, al no existir pesos que cargar.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica; no hay artefacto que servir.
- Latencia y throughput: no disponibles.
- Requisito real de hardware: ninguno relevante; basta un editor de texto para leer `analysis.md` y `README.md`.

## Comparativa con modelos similares

No disponible en sentido estricto, porque el repositorio no es un modelo y no admite comparación por parámetros, contexto o rendimiento. La siguiente tabla contrasta el artefacto con sistemas reales de Document AI mencionados en la búsqueda web, para situar qué sería un equivalente funcional:

| Elemento | Naturaleza | Parámetros | Contexto | Licencia / disponibilidad |
|---|---|---|---|---|
| michaelwrightwyn/document-ai-dev | Notas de investigación, sin checkpoint | 33.088 según metadatos de safetensors (no funcional) | no disponible | CC-BY-4.0, descarga pública en HuggingFace |
| Google Document AI | Plataforma gestionada de comprensión de documentos | no disponible | no disponible | Propietaria, servicio en Google Cloud |
| Google Document AI, Workbench y Warehouse | Modelos preentrenados y personalizables para procesamiento documental | no disponible | no disponible | Propietaria, servicio en Google Cloud |

No se dispone de datos de benchmarks ni de especificaciones técnicas (parámetros, contexto, tokens de entrenamiento) de las alternativas citadas dentro de la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- No es un modelo: no contiene pesos entrenados ni código de inferencia; la etiqueta `transformer` y la etiqueta `safetensors` de los metadatos pueden inducir a error si se interpretan como indicio de un checkpoint desplegable.
- La cifra de 33.088 parámetros es incompatible con un transformer funcional y sugiere un artefacto residual o de prueba; conviene verificar el contenido real del repositorio antes de cualquier uso.
- El propio autor advierte que el contenido es exploratorio y que no debe interpretarse como evidencia de que el estudio se haya ejecutado.
- Riesgo de alucinación: no evaluable, al no existir un modelo generativo.
- Sesgos conocidos: no disponibles; no se declara ningún proceso de entrenamiento ni dataset del que puedan derivarse.
- Limitaciones de idioma: no se declara ningún idioma soportado.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial y obras derivadas con atribución, pero el autor recomienda revisar por separado los términos de los datos de origen cuando el material se combine con conjuntos de datos externos como FUNSD, SROIE o CORD.
- Advertencia para producción: este repositorio no debe incluirse en ningún pipeline de producción como componente de inferencia; su función es exclusivamente documental.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/michaelwrightwyn/document-ai-dev
- Perfil del autor en HuggingFace: https://huggingface.co/michaelwrightwyn
- Document AI, documentación de Google Cloud: https://docs.cloud.google.com/document-ai/docs
- Document AI, notas de versión de Google Cloud: https://docs.cloud.google.com/document-ai/docs/release-notes
- Document AI, página de producto de Google Cloud: https://cloud.google.com/document-ai
- Models.dev, base de datos abierta de modelos: https://models.dev/
