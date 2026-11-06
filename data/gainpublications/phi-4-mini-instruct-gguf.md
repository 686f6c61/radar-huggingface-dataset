# GainPublications/Phi-4-mini-instruct-GGUF

## Resumen

Phi-4-mini-instruct es un modelo de lenguaje de 3.836.021.856 parámetros (aproximadamente 3,8B) desarrollado originalmente por Microsoft. Esta ficha concreta corresponde a una conversión a formato GGUF y cuantización Q4_K_M realizada por el usuario GainPublications, que mantiene los pesos de Microsoft sin modificaciones más allá de la conversión y la cuantización. El modelo base está diseñado para generación de texto y conversación, y esta versión cuantizada está pensada para ejecutarse en hardware de consumo mediante llama.cpp.

El interés de esta publicación radica en que empaqueta un modelo de la familia Phi-4 en un único fichero GGUF de 2.493.840.704 bytes (unos 2,37 GiB a 5,18 bits por peso), lo que facilita su despliegue local. Según la model card, este fichero es el que descarga la estación de trabajo musical Takehouse para su función opcional de escritura de letras que se ejecuta en el PC del usuario.

La relevancia es doble: por un lado, ofrece una vía sencilla de probar Phi-4-mini-instruct en entornos sin GPU dedicada; por otro, ilustra el flujo estándar de conversión con `convert_hf_to_gguf.py` y `llama-quantize`. No obstante, la información disponible sobre el proceso de entrenamiento del modelo base es limitada en esta fuente, por lo que varios datos técnicos se indican como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: microsoft/Phi-4-mini-instruct) |
| Parámetros totales | 3.836.021.856 |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (fichero publicado); se generó previamente un BF16 intermedio |
| Idiomas soportados | en |
| Licencia | MIT (© Microsoft Corporation) |
| Formato de pesos | GGUF (fichero `Phi-4-mini-instruct-Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base más allá de su pertenencia a la familia Phi-4-mini-instruct de Microsoft. No se especifica si emplea atención lineal, decodificación especulativa u otras innovaciones, ni el número de tokens de entrenamiento, la composición del dataset o si hubo fases de RLHF o DPO. Estos datos deben consultarse en la model card del repositorio original de Microsoft.

En cuanto a esta publicación concreta, el proceso de construcción está documentado: se partió del repositorio `microsoft/Phi-4-mini-instruct` en la revisión `cfbefacb99257ffa30c83adab238a50856ac3083`, se convirtió a GGUF en BF16 con `convert_hf_to_gguf.py` (llama.cpp en el commit `23f83e056d88ddae0d56b01ccc65fa42ab6625f7`) y se cuantizó a Q4_K_M con `llama-quantize`. No se empleó matriz de importancia (cuantización simple). El resultado son 2.370 MiB a 5,18 bits por peso y se carga en `llama-server` del mismo commit. Se incluyen los SHA-256 de los safetensors de origen y del fichero GGUF resultante.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` y el pipeline `text-generation`.
- Conversión a GGUF compatible con llama.cpp, lo que permite inferencia local en CPU y GPU.
- Ejecución mediante `llama-server` del commit indicado, lo que habilita un endpoint HTTP compatible con clientes tipo OpenAI (según la etiqueta `endpoints_compatible`).
- Uso como motor de generación de letras en la aplicación Takehouse, según la model card.
- Capacidades de razonamiento, código, matemáticas, tool calling, agentes o multimodalidad: no disponibles en la información proporcionada.
- Soporte multilingüe: limitado a inglés según la etiqueta de idioma; no se confirman otros idiomas.

## Casos de uso

- Generación de letras de canciones en local: la model card indica que este fichero es el que descarga la estación de trabajo musical Takehouse para su escritor de letras opcional, ejecutándose en el PC del usuario sin depender de la nube.
- Prototipado de asistentes conversacionales en inglés: al cargarse en `llama-server`, permite exponer un endpoint HTTP y probar diálogos multi-turno con un modelo de 3,8B en hardware modesto.
- Inferencia en equipos sin GPU: la cuantización Q4_K_M reduce el peso a unos 2,37 GiB, lo que permite ejecutarlo en CPU con llama.cpp para tareas de generación de texto de baja latencia.
- Integración en aplicaciones de escritorio: el formato GGUF de fichero único facilita empaquetar el modelo dentro de un instalador y cargarlo desde una app local, como hace Takehouse.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la pérdida de calidad de Q4_K_M frente a BF16 en el modelo base, ya que el autor documenta el proceso y los hashes.
- Pruebas de pipelines compatibles con OpenAI: la etiqueta `endpoints_compatible` sugiere que puede conectarse a herramientas que esperan una API estilo OpenAI a través de `llama-server`.
- Reproducibilidad y auditoría: los SHA-256 de los safetensors de origen y del GGUF permiten verificar que los pesos no se han alterado más allá de la conversión y cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,4-3 GiB para el fichero Q4_K_M (2.370 MiB de pesos) más overhead de contexto y caché KV; el valor exacto depende de la longitud de contexto configurada.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cualquier GPU consumer con 4-6 GiB de VRAM libre debería poder cargarlo, pero no se confirma en la fuente.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas con al menos 4 GiB de VRAM, aunque la fuente no lo verifica explícitamente.
- Opciones de despliegue: llama.cpp (`llama-server`) en el commit `23f83e056d88ddae0d56b01ccc65fa42ab6625f7`; el formato GGUF es compatible con otros runners de llama.cpp, pero no se confirma en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| GainPublications/Phi-4-mini-instruct-GGUF (esta ficha) | 3,836B | no disponible | MIT | GGUF Q4_K_M | Cuantización simple sin imatrix |
| microsoft/Phi-4-mini-instruct | 3,836B | no disponible | MIT | safetensors | Modelo base original en BF16 |
| Otras cuantizaciones GGUF de Phi-4-mini-instruct | 3,836B | no disponible | MIT | GGUF (varias) | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas de otros desarrolladores en cuanto a rendimiento o benchmarks.

## Limitaciones y advertencias

- La cuantización Q4_K_M es simple, sin matriz de importancia, lo que puede degradar la calidad respecto al modelo en BF16; no se aportan métricas de esa pérdida.
- El modelo solo declara soporte de inglés; su uso en castellano u otros idiomas no está garantizado.
- No se dispone de información sobre sesgos, riesgo de alucinación o limitaciones de contexto del modelo base en esta fuente.
- La licencia MIT permite uso comercial, pero debe conservarse el aviso de copyright de Microsoft Corporation incluido en `LICENSE`.
- El fichero se generó con un commit concreto de llama.cpp; versiones más antiguas o más nuevas pueden no cargarlo correctamente, por lo que conviene verificar compatibilidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria de la calidad de la cuantización.
- El autor no ofrece garantías sobre el fichero; la responsabilidad sobre los pesos originales recae en Microsoft.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/GainPublications/Phi-4-mini-instruct-GGUF
- Modelo base en Hugging Face: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
