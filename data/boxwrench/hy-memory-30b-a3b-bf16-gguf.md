# boxwrench/Hy-Memory-30B-A3B-BF16-GGUF

## Resumen

Hy-Memory-30B-A3B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Tencent, con 30.064.725.888 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token (según la nomenclatura A3B). El modelo está orientado a tareas de generación de texto y memoria conversacional, y se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones significativas.

Esta ficha corresponde a la conversión a GGUF en precisión completa BF16 realizada por el usuario boxwrench, que corrige un defecto en la cabecera del GGUF generado por la herramienta estándar de llama.cpp. La conversión original declaraba `expert_feed_forward_length = 1536` y `expert_shared_feed_forward_length = 1536`, mientras que los tensores reales de los expertos tienen anchura 768, lo que impedía la carga del modelo. El repositorio corrige únicamente esos dos valores UINT32 de la cabecera sin tocar los datos de los tensores, y el resultado carga y genera correctamente.

La relevancia de esta publicación es doble: por un lado, proporciona una base limpia en BF16 para generar cuantizaciones posteriores (Q4_K_M, Q5_K_M, Q8_0, etc.) sin arrastrar el error de cabecera; por otro, documenta un fallo de conversión reproducible en llama.cpp para arquitecturas MoE de Tencent que afecta a cualquier usuario que intente convertir el modelo original con el script estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), familia Hy (identificador de arquitectura `hy_v3` en GGUF) |
| Parametros totales | 30.064.725.888 |
| Parametros activos | aproximadamente 3.000 millones (denominacion A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (esta publicacion); el modelo base dispone de Q4_K_M oficial de Tencent |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (BF16/F32), dividido en 4 partes; safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con capas de mezcla de expertos (MoE). La nomenclatura `hy_v3` en la cabecera GGUF indica la familia de arquitectura empleada por Tencent para este modelo. Cada capa MoE contiene expertos con un `feed_forward_length` de 768 y un experto compartido (`expert_shared_feed_forward_length`) de la misma anchura, según los tensores verificados en el safetensors original y en el GGUF oficial Q4_K_M de Tencent. La discrepancia entre el valor declarado en la cabecera (1536) y la anchura real de los tensores (768) es el origen del fallo de carga corregido en esta publicación.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste por instrucciones. La model card del repositorio de conversión no incluye estos datos y la información proporcionada no los detalla. El proceso de conversión documentado es lossless: los tensores se mantienen en BF16/F32 sin modificación respecto al safetensors de origen, verificado mediante SHA256 de los 51 shards (60.131.744.504 bytes en total).

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y la etiqueta `conversational` sugiere uso en diálogo multi-turno.
- Memoria conversacional: el nombre del modelo (`Hy-Memory`) indica un enfoque específico en la retención y gestión de memoria en conversaciones largas, aunque la información disponible no detalla el mecanismo concreto.
- Razonamiento y generación de código: no confirmado explícitamente en la información disponible; la model card no enumera capacidades detalladas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el campo de idiomas aparece vacío en los metadatos de HuggingFace.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Conversación multi-turno con memoria persistente: el enfoque declarado del modelo en memoria conversacional lo hace adecuado para asistentes que deben recordar información de turnos anteriores en sesiones largas, desplegado mediante `llama-server` con el GGUF dividido.
- Generación de cuantizaciones derivadas: esta publicación está pensada explícitamente como punto de partida limpio para producir Q4_K_M, Q5_K_M, Q8_0 u otras cuantizaciones sin el error de cabecera, lo que la convierte en la base recomendada para quien quiera distribuir versiones comprimidas.
- Inferencia en hardware de consumo con iGPU: el autor reporta 23,5 tok/s de decodificación en una iGPU Strix Halo, lo que permite ejecutar el modelo en equipos sin GPU dedicada de gama alta usando llama.cpp.
- Reproducción y depuración de conversiones GGUF: el repositorio documenta hashes SHA256 del GGUF sin parchear, del parcheado y de cada parte, lo que sirve como referencia para verificar pipelines de conversión propios.
- Investigación sobre arquitecturas MoE de Tencent: el modelo permite estudiar el comportamiento de la arquitectura `hy_v3` en precisión completa BF16, sin las pérdidas de una cuantización Q4.
- Despliegue en endpoints compatibles: la etiqueta `endpoints_compatible` indica que el modelo puede servirse a través de infraestructura compatible con la API de HuggingFace Endpoints, útil para prototipos rápidos.
- Servicio local con llama.cpp: el uso documentado con `llama-server -m Hy-Memory-30B-A3B-BF16-00001-of-00004.gguf` permite levantar un servidor HTTP local sin dependencias de Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El único dato de rendimiento aportado por el autor es la velocidad de decodificación medida en su entorno de prueba: 23,5 tok/s en una iGPU Strix Halo con el GGUF BF16 corregido.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: el repositorio ocupa 60,2 GB y el GGUF single-file pesa 60.159.655.456 bytes (aproximadamente 56 GiB), por lo que se necesita al menos esa cantidad de memoria unificada o VRAM, más overhead del runtime.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB, o configuraciones multi-GPU. No cabe en RTX 4090 (24 GB) en BF16.
- GPU de consumo: no es viable en BF16 en ninguna GPU de consumo actual; sería necesario cuantizar a Q4_K_M o inferior (el modelo base ya ofrece Q4_K_M oficial de Tencent) para intentar encajar en 24 GB, y aun así con margen ajustado dado el tamaño total de 30B.
- Memoria unificada: el autor reporta ejecución funcional en iGPU Strix Halo, lo que sugiere que configuraciones con 64 GB o más de memoria unificada pueden cargar el BF16.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), carga directa de archivos divididos apuntando a la primera parte, y `llama-gguf-split --merge` para reconstruir el archivo único. Compatible con endpoints según la etiqueta del repo.
- Latencia y throughput: 23,5 tok/s de decodificación en iGPU Strix Halo (dato del autor). No hay datos de throughput en GPU dedicada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Hy-Memory-30B-A3B (este, BF16 GGUF) | 30,06 B | ~3 B | no disponible | Apache-2.0 | GGUF BF16 |
| tencent/Hy-Memory-30B-A3B (base) | 30,06 B | ~3 B | no disponible | Apache-2.0 | safetensors, GGUF Q4_K_M |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables directos en la información proporcionada. La comparación más relevante es con el modelo base de Tencent, del que este repositorio es una conversión lossless con corrección de cabecera: mismos pesos, misma licencia, pero con el fallo de carga resuelto y en precisión completa BF16 en lugar de Q4_K_M.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una publicación reciente (creada el 2026-11-02) sin validación comunitaria amplia.
- El campo de idiomas está vacío en los metadatos; no hay confirmación de cobertura multilingüe.
- No hay información sobre sesgos, alineación, RLHF o evaluación de seguridad del modelo base.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de modelos generativos sin datos de evaluación publicados.
- La corrección de cabecera afecta solo a dos valores UINT32; si el lector modifica el GGUF con otras herramientas, debe verificar que esos valores sigan siendo 768.
- El tamaño BF16 (60 GB) lo hace inviable en GPUs de consumo sin cuantización; para producción en hardware limitado, usar Q4_K_M o generar cuantizaciones propias a partir de esta base.
- Licencia Apache-2.0 permite uso comercial, pero el autor incluye la LICENSE original de Tencent en el repositorio; conviene revisarla por si el modelo base añade condiciones adicionales no reflejadas en los metadatos.
- El rendimiento medido (23,5 tok/s) corresponde a una iGPU concreta; no es extrapolable a otros entornos.

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/boxwrench/Hy-Memory-30B-A3B-BF16-GGUF
- Modelo base: https://huggingface.co/tencent/Hy-Memory-30B-A3B
- Repositorio de llama.cpp (conversor y runtime): https://github.com/ggml-org/llama.cpp
