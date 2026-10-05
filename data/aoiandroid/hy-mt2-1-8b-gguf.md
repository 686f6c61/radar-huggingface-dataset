# aoiandroid/Hy-MT2-1.8B-GGUF

## Resumen

El repositorio `aoiandroid/Hy-MT2-1.8B-GGUF` no es un modelo original, sino una copia espejo (mirror) sin modificaciones de los ficheros publicados por Tencent en `tencent/Hy-MT2-1.8B-GGUF`. Según la propia model card, se mantiene como respaldo por si el repositorio upstream se mueve o deja de estar disponible, y corresponde exactamente al fichero que descarga la aplicación TranslateBlue. El repositorio no aporta documentación técnica propia: no incluye arquitectura, datos de entrenamiento, benchmarks ni guía de uso, y remite explícitamente a la model card del autor original.

El dato verificable es el tamaño: 1.791.080.448 parámetros (aproximadamente 1,8 mil millones), confirmado a partir del recuento real del repositorio. El único peso incluido es `Hy-MT2-1.8B-Q4_K_M.gguf`, en formato GGUF y cuantización Q4_K_M, con un tamaño de repositorio de 1,1 GB. La licencia declarada es Apache 2.0, atribuida a Tencent.

Su relevancia es acotada y de índole operativa: por su tamaño, un modelo de 1,8B en Q4_K_M es apto para inferencia en CPU o en GPUs de gama baja, y un espejo estable resulta útil para pipelines que dependen de una URL fija. No obstante, al carecer de métricas publicadas en este repositorio y con cero descargas y cero likes en el momento de la consulta, cualquier evaluación de calidad debe hacerse contra el repositorio original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 1.791.080.448 (≈1,8B) |
| Parámetros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q4_K_M (único fichero incluido) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (atribuida a Tencent) |
| Formato de pesos | GGUF |
| Autor del repositorio | aoiandroid |
| Modelo base | tencent/Hy-MT2-1.8B-GGUF |
| Tamaño del repositorio | 1,1 GB |
| Naturaleza del repositorio | mirror no modificado |
| Ficheros incluidos | `Hy-MT2-1.8B-Q4_K_M.gguf` |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-05 |

## Arquitectura y entrenamiento

No disponible. La model card de este repositorio no describe la arquitectura, el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF, DPO o similares. Tampoco se indica si emplea atención lineal, decodificación especulativa, mezcla de expertos o algún otro mecanismo. Toda esa información, si existe, reside en la model card de `tencent/Hy-MT2-1.8B-GGUF`, que no forma parte de los datos proporcionados.

El único dato estructural confirmado es el recuento de parámetros (1.791.080.448) y el formato de serialización GGUF con cuantización Q4_K_M. La denominación "MT" en el nombre del modelo y el hecho de que lo consuma una aplicación llamada TranslateBlue apuntan a un uso de traducción automática, pero esto es una inferencia a partir del nombre y no una capacidad confirmada por documentación técnica.

## Capacidades

- No hay descripción de capacidades en la información disponible. La model card del espejo remite íntegramente al repositorio upstream.
- Generación de texto: no confirmada explícitamente, aunque el pipeline declarado en los metadatos de HuggingFace es `conversational`.
- Traducción automática: plausible por la denominación "MT" y por la aplicación consumidora (TranslateBlue), pero no documentada en este repositorio.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible. No se declara lista de idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Compatibilidad con endpoints: los tags incluyen `endpoints_compatible`, lo que indica que el repositorio está preparado para su uso con la infraestructura de inferencia de HuggingFace.

## Casos de uso

- Traducción automática en local o en servidor sin conexión: si se confirma la naturaleza de traducción del modelo, un GGUF de 1,8B en Q4_K_M permite ejecutar traducción en hardware modesto mediante llama.cpp, sin depender de APIs externas ni enviar texto a terceros.
- Sustitución de la descarga upstream en aplicaciones de escritorio: la propia model card indica que este espejo existe porque lo descarga TranslateBlue; integrarlo como URL alternativa evita roturas si el repositorio de Tencent cambia de nombre o desaparece.
- Prototipado rápido de funcionalidades conversacionales: al ser un modelo pequeño en formato GGUF, permite levantar un endpoint conversacional de pruebas en minutos en una máquina de desarrollo, antes de decidir si se escala a un modelo mayor.
- Procesamiento por lotes de bajo coste: tareas de generación o transformación de texto de alto volumen donde la latencia no es crítica y se prefiere ejecución en CPU con memoria limitada.
- Despliegue en el borde o en dispositivos con recursos restringidos: 1,1 GB de pesos permiten empaquetar el modelo junto a una aplicación sin requisitos de GPU dedicada.
- Componente auxiliar dentro de un pipeline mayor: uso como modelo de preprocesado o postprocesado (por ejemplo, normalización o reformateo de texto) delante de un modelo principal más grande.
- Verificación y auditoría de artefactos GGUF: al ser un mirror declarado como no modificado, sirve para comparar el binario publicado frente al upstream y detectar alteraciones.

En todos los casos anteriores, la idoneidad real depende de características del modelo original que no están documentadas en este repositorio; conviene validarlas contra la model card de Tencent antes de llevarlas a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de este espejo no incluye métricas de ningún tipo (MMLU, HumanEval, GSM8K, BLEU, COMET ni otras), y los resultados de la búsqueda web proporcionados no contienen información relacionada con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos Q4_K_M ocupan aproximadamente 1,1 GB; con caché KV y sobrecarga del runtime, una estimación razonable es de 1,5 a 2,5 GB, dependiendo de la longitud de contexto efectiva (no disponible).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente a nivel de memoria. No se dispone de datos de rendimiento específicos por modelo de GPU.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna (serie GTX 10xx en adelante con 4 GB o más) y en GPUs integradas con memoria unificada suficiente.
- Inferencia en CPU: viable gracias al formato GGUF; el tamaño de 1,8B en Q4_K_M es manejable en CPU, con throughput no disponible.
- Opciones de despliegue: llama.cpp y derivados (Ollama, KoboldCpp, LM Studio) por el formato GGUF. vLLM y TGI no consumen GGUF de forma nativa, por lo que requerirían convertir a safetensors y disponer de los pesos originales.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de rendimiento, contexto ni capacidades de modelos comparables que permitan una comparación rigurosa. El único término de comparación documentable es el propio repositorio upstream:

| Modelo | Parámetros | Formato | Licencia | Relación |
|---|---|---|---|---|
| aoiandroid/Hy-MT2-1.8B-GGUF | 1.791.080.448 | GGUF Q4_K_M | Apache 2.0 | Espejo no modificado |
| tencent/Hy-MT2-1.8B-GGUF | no disponible en esta ficha | GGUF | Apache 2.0 | Repositorio original |

Cualquier comparación con alternativas de la misma categoría (modelos de traducción o modelos generalistas de ~2B) exigiría datos de benchmarks que no se han proporcionado.

## Limitaciones y advertencias

- El repositorio no aporta documentación propia: arquitectura, contexto, idiomas, datos de entrenamiento y limitaciones deben consultarse en el repositorio upstream.
- Riesgo de desactualización: al ser un espejo estático de un único fichero, puede no reflejar revisiones posteriores del modelo original.
- Riesgo de alucinación: no evaluado en la información disponible; no hay métricas de fidelidad ni de tasas de error.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto e idioma: no disponibles. No se declara lista de idiomas soportados ni longitud de contexto, lo que impide garantizar cobertura para un idioma concreto.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserven los avisos de copyright y licencia y se indiquen los cambios. La atribución corresponde a Tencent, no al autor del espejo.
- Trazabilidad: la model card indica que la copia es no modificada, pero no se aporta hash ni firma que permita verificarlo de forma independiente.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin histórico de mantenimiento.
- Ausencia de garantías: al ser un mirror mantenido por un tercero, no hay compromiso de disponibilidad ni de soporte.
- Antes de usarlo en producción, conviene verificar que el fichero GGUF coincide con el upstream y validar el comportamiento del modelo con datos propios.

## Enlaces

- Repositorio del espejo: https://huggingface.co/aoiandroid/Hy-MT2-1.8B-GGUF
- Repositorio original (upstream): https://huggingface.co/tencent/Hy-MT2-1.8B-GGUF

No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en los resultados de búsqueda web proporcionados, que no guardan relación con el modelo.
