# Rafaelcedav/atlas-finanzas-deepseek-r1-8b-GGUF

## Resumen

El modelo `atlas-finanzas-deepseek-r1-8b-GGUF` es una colección de cuantizaciones en formato GGUF del modelo `Rafaelcedav/atlas-finanzas-deepseek-r1-8b`, un ajuste basado en DeepSeek-R1 de 8.000 millones de parámetros. Su propósito es permitir la ejecución local del modelo en ordenadores con recursos modestos, mediante herramientas como Ollama o llama.cpp, sin necesidad de infraestructura en la nube. El nombre sugiere una especialización en el dominio financiero, aunque la documentación aportada no detalla el proceso de entrenamiento ni las tareas concretas abordadas.

El repositorio contiene dos archivos de pesos cuantizados, `Q3_K_M` y `Q4_K_M`, con un tamaño total de 8,9 GB. El autor indica que la versión `Q3_K_M` es más ligera y puede ejecutarse en un Mac de 8 GB, mientras que `Q4_K_M` ofrece mejor calidad con un mínimo de 8 GB y se recomienda 16 GB para un uso cómodo. La licencia es Apache 2.0. No se aportan datos sobre la longitud de contexto, los idiomas soportados ni capacidades específicas más allá de la indicación de que es un modelo conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en DeepSeek-R1-8B; no se detalla en la documentación) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K_M, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna, los datos de entrenamiento ni las técnicas de alineación utilizadas. Por el nombre del modelo base, `Rafaelcedav/atlas-finanzas-deepseek-r1-8b`, se deduce que se trata de un ajuste fino de un modelo DeepSeek-R1 con 8.000 millones de parámetros, orientado al dominio financiero. No se mencionan detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon métodos como RLHF o DPO. Tampoco hay documentación sobre innovaciones técnicas específicas en la arquitectura.

## Capacidades

- No se documentan capacidades concretas en la model card.
- Al ser una cuantización de un modelo basado en DeepSeek-R1, es plausible que conserve capacidades de generación de texto y razonamiento, pero no se aportan pruebas ni detalles.
- No se menciona soporte para tool calling, function calling, visión, audio ni modos especiales de razonamiento.
- No se especifica el soporte multilingüe.
- El único dato funcional es su compatibilidad con Ollama y llama.cpp para inferencia local.

## Casos de uso

Dado que el nombre del modelo sugiere una especialización financiera, estos son casos de uso plausibles, aunque el autor no los confirma explícitamente:

- Analisis de documentos financieros: extraer y resumir información de balances, cuentas de resultados o memorias anuales en formato PDF, aprovechando que la ejecución es local y los datos no salen del equipo.
- Asistente en finanzas personales: responder preguntas sobre presupuestos, ahorro o planificación financiera básica a partir de conversaciones de texto en una aplicación de escritorio.
- Generacion de informes de inversion: redactar resúmenes de carteras, análisis de riesgos o comentarios de mercado a partir de entradas en lenguaje natural.
- Soporte en documentacion legal financiera: interpretar cláusulas de contratos, préstamos o pólizas para ayudar a usuarios no expertos a entender los conceptos clave.
- Chatbot de atencion al cliente financiero: gestionar consultas recurrentes sobre productos bancarios o seguros con un modelo desplegado en local, lo que reduce la dependencia de servicios externos y los costes de latencia.
- Analisis de sentimiento sobre noticias de mercado: clasificar titulares o comentarios financieros para monitorizar la percepción del mercado, utilizando la versión `Q4_K_M` para conservar más calidad en la tarea.

Estos escenarios son razonables por la naturaleza del dominio y por el hecho de que las cuantizaciones permiten ejecutar el modelo en hardware de consumo, pero no hay evidencia publicada de que el modelo los resuelva de forma satisfactoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- `Q3_K_M`: diseñado para sistemas con 8 GB de RAM, como un Mac de 8 GB; no se especifica la VRAM necesaria en GPU dedicadas.
- `Q4_K_M`: requiere 8 GB como mínimo ajustado, se recomienda 16 GB para un uso cómodo.
- No se proporcionan datos de VRAM para tarjetas GPU concretas, ni recomendaciones de modelos como A100 o RTX 4090.
- El despliegue está orientado a sistemas locales mediante Ollama, con el comando `ollama run hf.co/Rafaelcedav/atlas-finanzas-deepseek-r1-8b-GGUF:Q3_K_M`, y también puede usarse con llama.cpp.
- No hay información sobre latencia ni throughput esperados.

## Comparativa con modelos similares

No disponible. No se aportan datos en la información proporcionada y no se han identificado modelos comparables de forma fiable.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes; el repositorio muestra 0 descargas y 0 likes, lo que indica que el modelo no ha sido validado por la comunidad.
- Las cuantizaciones, especialmente la `Q3_K_M`, pueden degradar la calidad de las respuestas en comparación con el modelo original en precisión de coma flotante.
- No se documentan sesgos ni se ha evaluado el riesgo de alucinación. Esto es especialmente relevante en el dominio financiero, donde las respuestas incorrectas pueden tener consecuencias económicas.
- No se especifican los idiomas soportados, por lo que su comportamiento fuera del inglés o de otros idiomas mayoritarios es incierto.
- La licencia Apache 2.0 permite el uso comercial, pero es necesario verificar la licencia y el origen del modelo base `Rafaelcedav/atlas-finanzas-deepseek-r1-8b` para asegurar el cumplimiento de todas las obligaciones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Rafaelcedav/atlas-finanzas-deepseek-r1-8b-GGUF
- Modelo base: https://huggingface.co/Rafaelcedav/atlas-finanzas-deepseek-r1-8b
