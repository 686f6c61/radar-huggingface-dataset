# Anomly/SmolLM2-1.7B-Instruct-bposit8

## Resumen

Este modelo es una conversión a b-posit8 del modelo HuggingFaceTB/SmolLM2-1.7B-Instruct, realizada por Anomly para el perfil exacto del runtime INVAR. Se trata de una cuantización post-entrenamiento que utiliza 32 bloques de código con escala potencia de dos y códigos posit de 8 bits (es = 2), diseñada para garantizar resultados bit a bit idénticos en cualquier runtime determinista que implemente dicho perfil. El modelo tiene 1.711.376.384 parámetros y se distribuye en formato GGUF, con un tamaño de archivo de 1.77 GB.

La relevancia del modelo radica en la reproducibilidad de la inferencia: cada multiplicación de matrices acumula en un quire de 256 bits con un único redondeo, de modo que los logits y las activaciones son idénticos en CPUs x86, GPUs CUDA y arquitecturas aarch64. Esta característica lo convierte en una herramienta útil para investigaciones sobre verificación de resultados, auditoría de despliegues y pruebas de regresión en pipelines de desarrollo. La ficha no especifica la arquitectura original ni la longitud de contexto, por lo que estos datos no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible |
| Parametros totales | 1.711.376.384 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | b-posit8 (32 bloques de codigo, escala potencia de dos, 8 bits, es=2; GGUF file_type 42) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (b-posit8), safetensors como referencia del modelo base |

## Arquitectura y entrenamiento

El modelo es una re-cuantización del modelo base HuggingFaceTB/SmolLM2-1.7B-Instruct, por lo que conserva la arquitectura original de un modelo de lenguaje de 1.7B, aunque la ficha no aporta detalles internos sobre la misma. Tampoco se proporcionan datos sobre el proceso de entrenamiento original ni sobre la composición del dataset.

La innovación técnica principal es la conversión al formato b-posit8, una cuantización post-entrenamiento con 32 bloques de código, escala potencia de dos y códigos posit de 8 bits con es=2. Cada matmul acumula en un quire de 256 bits con una sola redondeo, lo que permite que un runtime determinista produzca activaciones y logits idénticos bit a bit en x86, CUDA y aarch64. Este comportamiento forma parte del perfil exacto de INVAR, que incluye una especificación en `docs/EXACT-PROFILE-SPEC.md` y vectores de prueba en `go/crverify/testdata`.

## Capacidades

- Inferencia reproducible: produce activaciones y logits bit a bit idénticos en runtimes deterministas que cumplan el perfil exacto de INVAR.
- Compatible con endpoints (según tags del repositorio).
- Conversacional (según tags).
- Cuantización b-posit8 con múltiples bloques de código y una única redondeo por multiplicación de matrices.
- Verificación de integración mediante los comandos `invar serve` e `invar verify`, con `--spot-check` y `--spot-check-units`.
- No se documentan en la ficha capacidades adicionales como tool calling, vision, audio ni multilinguismo.
- Longitud de contexto, idiomas soportados y tareas específicas no están especificados en la información disponible.

## Casos de uso

1. Investigación en reproducibilidad de inferencia: permite verificar que implementaciones independientes producen los mismos logits a partir de los pesos y los token ids, lo que resulta útil en trabajos de especificación y auditoría.
2. Pipelines de CI/CD para modelos de lenguaje: la verificación con `invar verify` permite comparar respuestas de referencia (worldline.jsonl) y detectar regresiones en el comportamiento del modelo.
3. Despliegue en entornos heterogéneos: al mantener resultados idénticos en x86, CUDA y aarch64, es una opción para aplicaciones que deben ejecutarse en múltiples plataformas sin variaciones.
4. Aplicaciones conversacionales de bajo coste: por su tamaño de 1.7B y formato GGUF, puede ejecutarse en entornos con recursos limitados, aunque la ficha no aporta datos de rendimiento.
5. Uso como modelo re-cuantizado con licencia Apache 2.0: al mantener la licencia original, puede integrarse en proyectos comerciales sin coste de licencia, respetando la atribución.
6. Servicio mediante INVAR: el comando `invar serve` permite desplegar el modelo como servicio local, y el tag `endpoints_compatible` sugiere integración en APIs de inferencia.
7. Verificación de integridad y trazabilidad: el archivo GGUF incluye un SHA-256 documentado, lo que facilita la validación del artefacto distribuido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El archivo GGUF tiene un tamaño de 1.77 GB, lo que da una idea del espacio de almacenamiento necesario, pero no se proporcionan requisitos de VRAM.
- La información no incluye estimaciones de VRAM, GPUs recomendadas, latencia ni throughput.
- El modelo está pensado para ejecutarse con el runtime INVAR y el binario `llama-cli` (fork de llama-cpp-et). No se mencionan otros motores de despliegue como vLLM, TGI u Ollama.
- Los resultados deterministas están garantizados en CPUs x86, GPUs CUDA y arquitecturas aarch64, pero no se especifica qué GPU concreta es necesaria.
- No disponible: datos de latencia y throughput.

## Comparativa con modelos similares

No disponible. La ficha no incluye comparaciones con otros modelos.

## Limitaciones y advertencias

- La cuantización b-posit8 y el perfil exacto de INVAR requieren un runtime específico (el fork llama-cpp-et). El uso con herramientas estándar de llama.cpp puede no reproducir los resultados esperados.
- Los resultados bit a bit idénticos solo se garantizan en runtimes deterministas que implementen el protocolo de INVAR.
- La ficha no documenta la longitud de contexto, idiomas soportados ni capacidades de razonamiento, tool calling u otras habilidades del modelo.
- No se proporcionan evaluaciones de sesgos, riesgos de alucinación ni comportamiento en tareas específicas; estos aspectos heredarían las características del modelo base, pero no están verificados en esta conversión.
- El modelo tiene 0 descargas y 0 likes, lo que sugiere un estado experimental y ausencia de validación en producción.
- La licencia Apache 2.0 permite el uso comercial, pero es necesario cumplir los requisitos de atribución indicados en la licencia original.

## Enlaces

- https://huggingface.co/Anomly/SmolLM2-1.7B-Instruct-bposit8
- https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
- https://github.com/anomly-labs/invar
