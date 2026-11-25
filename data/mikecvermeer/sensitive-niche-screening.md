# MikeCVermeer/sensitive-niche-screening

## Resumen

Sensitive-niche screening es un conjunto de pesos de investigación publicado por MikeCVermeer para la clasificación de contenido promocional u operativo en nueve nichos sensibles. No es un modelo de texto a puntuación al uso: se trata de una liberación a nivel de características (*feature-level release*) que combina coeficientes numéricos y direcciones prototipo sintéticas en un fichero NPZ, y que requiere que el usuario aporte sus propias representaciones vectoriales de página (1.024 dimensiones, generadas con OpenAI `text-embedding-3-small`) junto con evidencia léxica y de enlaces proyectada de forma independiente. El repositorio ocupa 0,0 GB y no incluye pesos en formato tradicional como safetensors o GGUF.

El modelo aborda el cribado exploratorio de contenido en nichos sensibles con revisión humana obligatoria, en nueve idiomas (inglés, neerlandés, alemán, español, portugués, sueco, francés, italiano y polaco). Su relevancia es metodológica: documenta con detalle un pipeline de evaluación con intervalos bootstrap a nivel de sitio y calibración, y publica métricas de referencia honestas sobre sus limitaciones, algo poco habitual en releases de moderación de contenido.

La arquitectura subyacente no es un transformer entrenado de extremo a extremo, sino un clasificador sobre características precalculadas. Los datos de entrenamiento, ejemplos, etiquetas e identificadores no se liberan; solo se publican coeficientes numéricos, umbrales y calibración. Está licenciado bajo MIT y etiquetado como `text-classification` con métrica F1, aunque el autor insiste en que no es un sistema listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador sobre características precalculadas (vectores de embedding de página + evidencia léxica y de enlaces proyectada); no es un transformer de extremo a extremo |
| Parametros totales | no disponible (fichero NPZ con coeficientes numéricos y direcciones prototipo sintéticas; no se publica recuento de parámetros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no procesa texto directamente; depende de los vectores de página de 1.024 dimensiones aportados por el usuario) |
| Tipos de cuantizacion | no disponible (no se distribuyen pesos en formatos cuantizables; el NPZ contiene coeficientes) |
| Idiomas soportados | en, nl, de, es, pt, sv, fr, it, pl |
| Licencia | MIT |
| Formato de pesos | NPZ (coeficientes numéricos y prototipos sintéticos); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

El sistema no es una red neuronal monolítica sino un clasificador de nivel de característica. La entrada combina dos flujos: por un lado, vectores de página de 1.024 dimensiones generados con el modelo propietario de OpenAI `text-embedding-3-small`; por otro, evidencia léxica y de enlaces proyectada de forma separada. El entrenamiento a nivel de sitio utilizó evidencia agrupada (*pooled evidence*), y el NPZ publicado contiene únicamente coeficientes numéricos y direcciones prototipo sintéticas, junto con configuración de umbrales y calibración.

Los datos de entrenamiento provinieron de un crawl multilingüe con etiquetas generadas por LLM y algunos casos límite sintéticos. El autor no libera texto crudo, ejemplos, etiquetas, identificadores, listas de destinos ni vectores. Las listas originales de señales (*cues*) y enlaces tampoco se incluyen: se derivaron del crawl y parte provenía de una fuente GPL, lo que condiciona la redistribución. No se documenta uso de RLHF ni DPO; las etiquetas de referencia fueron calificadas por IA, no validadas por humanos, y requieren comprobaciones manuales por muestreo.

## Capacidades

- Clasificación de contenido promocional u operativo en nueve nichos sensibles, a partir de características de página aportadas por el usuario.
- Cribado exploratorio multilingüe en nueve idiomas (en, nl, de, es, pt, sv, fr, it, pl).
- Producción de puntuaciones de alarma a nivel de sitio mediante cabezas de operador agrupadas (*pooled operator heads*).
- Integración con evidencia léxica y de enlaces, además de los vectores de embedding de página.
- Configuración de umbrales y calibración ajustable por el usuario.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio: es un clasificador de características, no un modelo generativo.
- No procesa texto directamente: requiere un pipeline externo que genere los embeddings y proyecte la evidencia.

## Casos de uso

- Cribado exploratorio de contenido en nichos sensibles con revisión humana: el sistema genera puntuaciones de alarma por sitio que un analista revisa manualmente, aprovechando la calibración y los umbrales publicados para priorizar colas de revisión.
- Investigación académica sobre moderación de contenido multilingüe: sirve como referencia metodológica para replicar pipelines de evaluación con intervalos bootstrap a nivel de sitio y para estudiar el sesgo entre idiomas.
- Auditoría de directorios y listados de enlaces: al incorporar evidencia de enlaces proyectada, puede señalar sitios con patrones de enlazado sospechosos dentro de un crawl, siempre que el usuario aporte sus propias listas de enlaces.
- Estudio de calibración y umbrales: el NPZ incluye configuración de calibración que permite experimentar con distintos puntos de corte y medir el impacto en F1 frente a datos propios revisados.
- Evaluación comparativa de embeddings: al depender de vectores `text-embedding-3-small` de 1.024 dimensiones, permite estudiar cómo varía el rendimiento al sustituir la preparación de embeddings, tal como advierte el autor.
- Formación y docencia en evaluación de modelos: el repositorio documenta límites, intervalos de confianza y brechas de datos, lo que lo convierte en un caso práctico para enseñar evaluación rigurosa con incertidumbre.
- Detección de casos límite sintéticos: los prototipos sintéticos incluidos permiten probar la sensibilidad del clasificador ante casos artificiales antes de desplegar cualquier cribado real.

## Benchmarks y rendimiento

| Metrica | Resultado | Intervalo / referencia |
|---|---|---|
| A7 site alarm F1 ponderado (cohorte fresca de 615 sitios, evidencia de página calificada) | 0,725 | IC bootstrap por sitio 95 %: 0,599–0,830 |
| Referencia LLM sobre el mismo objetivo | 0,806 | sobre la cohorte de 615 sitios |
| A7 predicciones sobre todo el crawl frente a verdad observada incompleta | 0,570 | los verdaderos positivos no calificados pueden aparecer como falsos |
| Cabeza de operador de sitio (separada) | 0,721 | IC 95 %: 0,384–0,921 |

El autor advierte que estos objetivos son distintos entre sí y que el muestreo fue enriquecido y ponderado, con incertidumbre amplia. La clave de respuestas fue calificada por IA, no validada por humanos.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El artefacto publicado no ejecuta inferencia por sí mismo; requiere un pipeline externo que genere embeddings de 1.024 dimensiones con OpenAI `text-embedding-3-small` (servicio en la nube) y proyecte evidencia léxica y de enlaces.
- GPU recomendadas: no aplica para el NPZ; el coste computacional recae en el servicio de embeddings de OpenAI y en el procesamiento de características del usuario.
- Cabe en GPU de consumo: el clasificador de coeficientes es trivial de ejecutar en CPU; la generación de embeddings depende de la API de OpenAI, no de hardware local.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo. El autor remite a `docs/BRING_YOUR_OWN.md` para los inputs y el reentrenamiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sensitive-niche screening (MikeCVermeer) | Clasificador sobre características (NPZ) | no disponible | no disponible | MIT | Hugging Face, 0 descargas |
| Modelos de moderación de texto generativos | Transformer generativo | no disponible en la informacion | no disponible | variable | no disponible en la informacion |
| Clasificadores de toxicidad tipo BERT | Transformer encoder | no disponible en la informacion | no disponible | variable | no disponible en la informacion |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada; el autor solo compara contra una referencia LLM interna (F1 0,806) sobre su propia cohorte.

## Limitaciones y advertencias

- No es un sistema listo para producción: el propio autor lo describe como pesos de investigación para estudio adicional.
- La clave de respuestas fue calificada por IA, no validada por humanos; requiere comprobaciones manuales por muestreo.
- El rendimiento varía entre idiomas y nichos; los casos en adulto, francés y polaco requieren revisión particular por soporte escaso.
- La principal brecha de datos es el contenido patrocinado real en sitios de editores.
- El vocabulario y los datos de entrenamiento pueden infrarrepresentar idiomas, culturas o modelos de negocio concretos.
- Diferentes características aportadas por el usuario, preparación de embeddings y umbrales alteran el comportamiento de forma material.
- No debe usarse para penalizaciones automatizadas, certificación de seguridad ni inferencia sobre personas.
- Las capturas ausentes deben permanecer sin evaluar; no se debe inferir ausencia de contenido a partir de la falta de datos.
- Las predicciones sobre todo el crawl frente a verdad incompleta (F1 0,570) pueden marcar verdaderos positivos no calificados como falsos.
- No se liberan texto crudo, ejemplos, etiquetas, identificadores, listas de destinos ni vectores, lo que limita la reproducibilidad exacta.
- Parte de las listas de señales originales provenía de una fuente GPL y no se redistribuye.
- La licencia MIT permite uso comercial, pero las advertencias del autor desaconsejan cualquier uso práctico sin validación independiente con sitios representativos revisados por humanos.
- Depende de un servicio propietario de embeddings (OpenAI `text-embedding-3-small`), lo que introduce dependencia de terceros y posibles cambios de versión.

## Enlaces

- Hugging Face: https://huggingface.co/MikeCVermeer/sensitive-niche-screening
- Documentación de inputs y reentrenamiento: `docs/BRING_YOUR_OWN.md` (referenciado en la model card)
- Resultados: `docs/RESULTS.md` (referenciado en la model card)
- Limitaciones: `docs/LIMITATIONS.md` (referenciado en la model card)
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos.
