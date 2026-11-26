# OpensourceWTF/Qwen3.8-Flash-Next-EXL3-4.05-mlx-serve

## Resumen

Qwen3.8-Flash-Next-EXL3-4.05-mlx-serve es un empaquetado de pesos cuantizados del modelo Qwen3.8-Flash-Next, preparado por el usuario OpensourceWTF para su uso con la librería mlx-serve en hardware Apple Silicon. No se trata de un modelo entrenado desde cero, sino de una conversión de la cuantización EXL3 a 4,05 bits por peso realizada originalmente por turboderp con exllamav3, reempaquetada para el ecosistema MLX. El repositorio contiene 34.283.303.315 parámetros en formato safetensors y ocupa 107,6 GB.

La relevancia de esta ficha es doble: por un lado documenta un artefacto de cuantización agresiva que permite ejecutar un modelo de gran tamaño en memoria unificada de equipos Apple; por otro, advierte de que el repositorio ha sido movido y su historial comprimido, por lo que los archivos actuales deben obtenerse de la rama `4.05bpw` del repositorio consolidado o del repositorio original de turboderp. La model card es explícita sobre qué archivos provienen de dónde y qué sumas de verificación se aplicaron.

No se dispone de información sobre arquitectura interna, datos de entrenamiento, benchmarks ni idiomas soportados en la documentación proporcionada; esta ficha lo indica explícitamente en cada apartado afectado en lugar de inferir datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-Flash-Next; arquitectura interna no documentada en la información disponible) |
| Parametros totales | 34.283.303.315 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 4,05 bits por peso (bpw); tabla n-gram en formato propio (`ngram_embedding.safetensors`) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (empaquetado para mlx-serve) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Qwen3.8-Flash-Next en la documentación proporcionada. El artefacto descrito es una cuantización: turboderp generó los pesos EXL3 a 4,05 bpw con exllamav3 a partir del modelo original, y OpensourceWTF los reempaquetó para mlx-serve. La model card indica que todos los archivos del commit `ed79daeb` se trasladaron a la rama `4.05bpw` del repositorio `OpensourceWTF/Qwen3.8-Flash-Next-exl3` con los mismos bytes, verificados mediante sha256, a excepción de `ngram_embedding.safetensors`.

Ese archivo n-gram (39.040.193.720 bytes, sha256 `c63613666649…`) es el original de turboderp y debe tomarse de su rama `4.05bpw_h6_ng6`. La presencia de una tabla n-gram de casi 39 GB sugiere el uso de decodificación especulativa basada en n-gramas, pero no se detalla en la información disponible cómo se integra en el pipeline de inferencia ni qué hiperparámetros (`h6_ng6`) representan exactamente.

## Capacidades

- Generación de texto: el pipeline declarado en Hugging Face es `text-generation`.
- No se documentan en la información disponible capacidades de razonamiento, código, matemáticas, visión, audio ni modo thinking.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües ni lista de idiomas.
- Capacidad implícita del empaquetado: ejecución en Apple Silicon mediante mlx-serve, con pesos EXL3 de 4,05 bpw y tabla n-gram separada para decodificación especulativa.

## Casos de uso

- Inferencia local en equipos Apple Silicon: el empaquetado está pensado para mlx-serve, de modo que un modelo de 34.283 millones de parámetros pueda ejecutarse en memoria unificada de un Mac con suficiente RAM, aprovechando la cuantización a 4,05 bpw para reducir la huella frente a FP16.
- Evaluación de cuantizaciones EXL3: investigadores que comparen la calidad de EXL3 a 4,05 bpw frente a otras cuantizaciones (GGUF Q4, AWQ, GPTQ) pueden usar este pack como referencia reproducible, con sumas sha256 documentadas para verificar la integridad de los pesos.
- Reproducción de experimentos con decodificación especulativa por n-gramas: la tabla `ngram_embedding.safetensors` permite estudiar el impacto de esta técnica en latencia y calidad sobre el modelo base, siempre que se use la versión exacta de turboderp.
- Servicio de generación de texto en estaciones de trabajo Mac: despliegue de un endpoint de text-generation con mlx-serve para prototipos internos, sin depender de GPUs NVIDIA ni de servicios en la nube.
- Archivado y auditoría de artefactos de cuantización: el repositorio documenta la procedencia de cada archivo y su verificación criptográfica, lo que sirve como caso práctico de trazabilidad en la distribución de pesos.
- Base para futuras conversiones: el flujo turboderp (exllamav3) → reempaquetado MLX puede replicarse para otros modelos Qwen si se dispone de la herramienta y del espacio de almacenamiento (107,6 GB en este caso).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 107,6 GB; la tabla n-gram suma 39.040.193.720 bytes (unos 36,4 GiB). En conjunto, se necesita espacio para al menos ~107,6 GB de pesos más la tabla n-gram si se usa decodificación especulativa, lo que en la práctica exige un equipo con memoria unificada muy amplia (Mac Studio o Mac Pro con 128 GB o más) o almacenamiento rápido con carga por capas.
- GPU recomendadas: el empaquetado es para mlx-serve, es decir, Apple Silicon (familias M-series). No se documenta soporte para A100, H100 ni RTX 4090 en este repositorio concreto.
- ¿Cabe en GPU consumer? No se documenta; por tamaño, no cabe en GPUs consumer de 24 GB. En Apple Silicon, requiere configuraciones de memoria unificada de gama alta.
- Opciones de despliegue: mlx-serve (librería declarada). Para los pesos EXL3 originales, exllamav3. No se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI) para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de contexto de modelos alternativos que permitan una comparación rigurosa. Como referencias del mismo ecosistema, existen la cuantización original de turboderp (`turboderp/Qwen3.8-Flash-Next-exl3`, rama `4.05bpw_h6_ng6`) y el repositorio consolidado de OpensourceWTF (`OpensourceWTF/Qwen3.8-Flash-Next-exl3`, rama `4.05bpw`), pero no se aportan métricas comparativas.

## Limitaciones y advertencias

- Repositorio movido: la model card indica que el contenido se trasladó a la rama `4.05bpw` de `OpensourceWTF/Qwen3.8-Flash-Next-exl3` y que el historial de este repositorio se comprimió para liberar almacenamiento; conviene descargar desde la ubicación nueva.
- Dependencia de un archivo externo: `ngram_embedding.safetensors` no está en este repositorio y debe obtenerse de `turboderp/Qwen3.8-Flash-Next-exl3`, rama `4.05bpw_h6_ng6`; sin él, el pack está incompleto.
- Licencia: `qwen-community-1.0`, etiquetada como `other`. Es una licencia comunitaria con posibles restricciones de uso comercial; debe revisarse el texto enlazado antes de desplegar en producción.
- Cuantización agresiva: 4,05 bpw implica pérdida de precisión frente al modelo original; no se aportan evaluaciones de degradación de calidad.
- Idiomas, contexto y capacidades no documentados: no se puede garantizar comportamiento multilingüe ni ventanas de contexto largas sin consultar la documentación del modelo base.
- Riesgo de alucinación y sesgos: inherente a los modelos de lenguaje; no se documentan evaluaciones específicas en la información disponible.
- Tamaño elevado: 107,6 GB de pesos más la tabla n-gram hacen inviable el despliegue en hardware de consumo convencional; planificar almacenamiento y memoria en consecuencia.
- Sin likes ni señales de validación comunitaria (0 likes, 265 descargas en la fecha de consulta): menor evidencia de uso real frente a artefactos más establecidos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/OpensourceWTF/Qwen3.8-Flash-Next-EXL3-4.05-mlx-serve
- Repositorio consolidado (rama `4.05bpw`): https://huggingface.co/OpensourceWTF/Qwen3.8-Flash-Next-exl3/tree/4.05bpw
- Cuantización original de turboderp (rama `4.05bpw_h6_ng6`): https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3/tree/4.05bpw_h6_ng6
- Repositorio de turboderp: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Herramienta de cuantización exllamav3: https://github.com/turboderp-org/exllamav3
- Texto de la licencia: https://huggingface.co/OpensourceWTF/Qwen3.8-Flash-Next-exl3/blob/4.05bpw/LICENSE
