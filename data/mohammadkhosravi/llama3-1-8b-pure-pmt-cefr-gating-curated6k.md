# MohammadKhosravi/llama3.1-8b-pure-pmt-cefr-gating-curated6k

## Resumen

Este modelo es un adaptador PEFT (PrefixMemory-Tuning) sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`, desarrollado por MohammadKhosravi. El experimento busca aislar si el estancamiento previo (techo del 68 % de rendimiento) en tareas de alineación CEFR se debía a limitaciones arquitectónicas o a solapamiento de objetivos lingüísticos dentro del conjunto de entrenamiento EFCAMDAT. Para ello, se entrena sobre un subconjunto curado de 6 000 muestras seleccionadas mediante PCA, optimizado para densidad representativa y discriminabilidad entre clases vecinas, corrigiendo específicamente los límites B2/C1/C2.

El adaptador incorpora matrices de memoria independientes de 4096×4096 en cada una de las 32 capas del modelo base, junto con un embedding CEFR entrenable de 4096 dimensiones que modula el mapa de características ELU antes de consultar el vector de memoria. El repositorio tiene un tamaño de 1,1 GB y la licencia declarada es MIT, aunque el modelo base conserva su licencia original de Meta (Llama 3.1 Community License). No se especifican parámetros totales del adaptador, longitud de contexto, idiomas soportados ni cuantizaciones disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-3.1-8B-Instruct con adaptador PEFT (PrefixMemory-Tuning) |
| Parametros totales | no disponible (el modelo base tiene 8B; el adaptador no especifica su numero de parametros entrenables) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 128k, pero no se indica para el adaptador) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es multilingue, pero no se especifica) |
| Licencia | MIT (adaptador); el modelo base tiene licencia Llama 3.1 Community de Meta |
| Formato de pesos | PEFT (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El adaptador utiliza una tecnica denominada "Pure PrefixMemory-Tuning" (PMT) no comprimida, que anade matrices M independientes de 4096×4096 en cada una de las 32 capas del modelo base. Ademas, incorpora un "Explicit CEFR Feature Gating": un embedding CEFR entrenable de 4096 dimensiones que modula el mapa de caracteristicas ELU antes de consultar el vector de memoria. El entrenamiento se realizo sobre 6 000 muestras estratificadas en 6 clases (A1-C2) del corpus EFCAMDAT, seleccionadas mediante PCA para maximizar la densidad representativa y la discriminabilidad entre clases vecinas.

Las metricas de entrenamiento muestran un claro sobreajuste a partir de la epoca 2: la perdida de validacion sube de 2,1646 (epoca 2) a 2,5033 (epoca 3) y la perplexidad de validacion pasa de 8,71 a 12,22, continuando el aumento en epocas posteriores. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion adicionales.

## Capacidades

- El adaptador esta disenado para tareas de alineacion CEFR, probablemente clasificacion o generacion de texto segun niveles A1-C2, aunque no se especifica el tipo de tarea exacta.
- Hereda las capacidades del modelo base Llama-3.1-8B-Instruct (generacion de texto, razonamiento, codigo, matematicas, etc.), pero no hay documentacion sobre como el adaptador afecta a estas capacidades.
- No se indica soporte para tool calling, function calling, agentes o razonamiento multi-paso.
- No se menciona modo de pensamiento, vision, audio ni otras capacidades especiales.

## Casos de uso

No se han documentado casos de uso especificos en la informacion disponible. Dado el proposito declarado del adaptador (alineacion CEFR), se podrian inferir aplicaciones como evaluacion automatica de nivel de competencia linguistica o generacion de materiales educativos adaptados, pero no hay evidencia concreta que respalde estas aplicaciones. Por tanto, se considera que no hay casos de uso confirmados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Solo se proporcionan metricas de entrenamiento (perdida y perplexidad) que muestran sobreajuste a partir de la epoca 2, sin comparacion con otros modelos.

## Requisitos de hardware

No se proporcionan requisitos de hardware especificos. Al ser un adaptador PEFT sobre un modelo de 8B, se puede inferir que los requisitos son similares a los de Llama-3.1-8B-Instruct, pero no hay datos concretos sobre VRAM, GPUs recomendadas, opciones de despliegue, latencia o throughput. Se recomienda consultar la documentacion del modelo base para estimar los recursos necesarios.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la informacion proporcionada, ni se dispone de datos de rendimiento para establecer una comparativa.

## Limitaciones y advertencias

- El entrenamiento muestra un claro sobreajuste a partir de la epoca 2, con aumento progresivo de la perdida y la perplexidad de validacion.
- No hay informacion sobre sesgos, alucinaciones, limitaciones de contexto o restricciones de idioma.
- La licencia MIT del adaptador no exime de las restricciones del modelo base Llama-3.1-8B-Instruct, que tiene su propia licencia comunitaria de Meta con condiciones especificas para uso comercial.
- El modelo tiene 0 descargas y 0 likes, lo que sugiere que es un experimento de investigacion sin validacion externa ni uso en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/MohammadKhosravi/llama3.1-8b-pure-pmt-cefr-gating-curated6k
