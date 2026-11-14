# jenerallee78/Qwen3.8-27B-hf2q-Q4_K_M

## Resumen

`jenerallee78/Qwen3.8-27B-hf2q-Q4_K_M` es una conversión a cuantización GGUF Q4_K_M del checkpoint oficial `Qwen/Qwen3.8-27B` de Qwen (Alibaba Cloud), publicada por el usuario jenerallee78. El paquete no incluye ningún ajuste fino ni modificación de los pesos: se trata del checkpoint oficial convertido a un formato de menor precisión numérica para facilitar su despliegue en entornos con recursos limitados. El repositorio ocupa 16,8 GB y contiene el fichero GGUF principal más un banco K/V opcional entrenado con el método PhantomKV.

La relevancia de esta publicación es doble. Por un lado, ofrece una vía de ejecución del modelo Qwen3.8-27B en cuantización Q4_K_M con verificación de procedencia (hash SHA-256 y recibo de conversión de hf2q 0.1.26). Por otro, introduce un artefacto opcional de tipo "graft" de atención (PhantomKV) que actúa como control en tiempo de ejecución, no como modificación de los pesos. El modelo base pertenece a la familia Qwen3.8, de la que no se dispone de especificaciones técnicas detalladas en la información proporcionada.

El modelo conserva la licencia Apache-2.0 del upstream y la atribución a Alibaba Cloud. La model card advierte explícitamente de que los resultados de referencia históricos en MPS no constituyen una cualificación de calidad en runtime nativo ni una garantía de capacidad o seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-27B; sin detalles en la informacion) |
| Parametros totales | 4.325.376 (dato del campo safetensors del repo; no coherente con la denominacion "27B") |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero GGUF publicado) |
| Idiomas soportados | en (segun metadatos del repo) |
| Licencia | apache-2.0 (upstream); banco PhantomKV derivado bajo apache-2.0; productor bajo MIT |
| Formato de pesos | GGUF (`Qwen3.8-27B-Q4_K_M.gguf`, 16.810.714.976 bytes) + GGUF auxiliar (`Qwen3.8-27B-phantom-kv.gguf`, 17.303.808 bytes) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwen3.8-27B en los datos proporcionados (tipo de transformer, número de capas, atención, etc.). La model card solo indica que se trata del checkpoint oficial sin modificaciones, y que la conversión a Q4_K_M altera la representación numérica pero no los pesos en sentido funcional.

El artefacto PhantomKV es un banco K/V entrenado desde el mismo checkpoint oficial durante 400 pasos con semilla 1337, usando la herramienta `phantom-kv` (lordx64, MIT). El contenedor direct-K/V en F32 alberga 132 slots distribuidos en 16 capas de atención completa: 3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59 y 63. Es un control de runtime, no una modificación de pesos: desvincular el banco y reiniciar el estado elimina el injerto. La conversión y el lector nativo corren a cargo de hf2q 0.1.26 (commit `9c42dc1fc19b4dbe94c63c6c4bfef7f990c8f856`).

## Capacidades

- Generación de texto en inglés (idioma declarado en los metadatos).
- Conversión cuantizada Q4_K_M para inferencia con menor huella de memoria que el checkpoint original.
- Integración opcional de PhantomKV como control de runtime sobre la atención (banco K/V de 132 slots en 16 capas).
- Soporte de un artefacto GLP externo (no redistribuido) para el mismo checkpoint, con alpha 1, orientado a modificación de comportamiento en runtime.
- Compatibilidad con lectores GGUF nativos y con la cadena de herramientas hf2q.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio, matemáticas o razonamiento multi-paso.

## Casos de uso

- Despliegue de Qwen3.8-27B en entornos con memoria limitada: la cuantización Q4_K_M reduce el peso del fichero a 16,8 GB, lo que permite cargar el modelo en GPUs de 24 GB o en configuraciones con offload parcial, algo inviable con el checkpoint en precisión completa.
- Verificación de procedencia en pipelines de ML: el repositorio incluye `SHA256SUMS`, `manifest.json` y un recibo de conversión con hashes de origen, convertidor y salida, lo que permite auditar que el GGUF deriva del checkpoint oficial `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`.
- Experimentación con control de runtime en atención: el banco PhantomKV opcional permite probar modificaciones de comportamiento sin reentrenar ni alterar los pesos base, útil para investigación en steerability.
- Evaluación comparativa de cuantizaciones: al ser una conversión limpia del checkpoint oficial, sirve como referencia para medir la degradación introducida por Q4_K_M frente a otros formatos.
- Reproducibilidad de artefactos: el recibo de hf2q y los hashes permiten reconstruir y validar la conversión en otra máquina, útil en entornos regulados o de investigación que exigen trazabilidad.
- Pruebas de seguridad y alineación: la model card menciona resultados de referencia en MPS (49/60 a 1/60 rechazos; 0/20 rechazos en consultas inocuas) como sondas limitadas, útiles como punto de partida para evaluaciones propias, no como certificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta resultados de sondas históricas en MPS (49/60 a 1/60 rechazos; 0/20 rechazos en consultas inocuas), que el propio autor califica explícitamente como no equivalentes a una cualificación de calidad en runtime nativo, benchmark de código ni garantía general de capacidad o seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF Q4_K_M pesa 16.810.714.976 bytes (~15,7 GiB). A esto hay que sumar la caché KV, cuyo tamaño depende de la longitud de contexto (no disponible) y del número de capas.
- GPU recomendadas: no disponibles en la información. Por tamaño, el modelo requiere al menos ~16 GB solo para pesos, por lo que no cabe en GPUs consumer de 8-12 GB sin offload; encaja en GPUs de 24 GB (RTX 3090/4090) con contexto moderado, y en A100/H100 con margen amplio.
- Cabe en consumer GPU: sí, en GPUs de 24 GB o superiores, siempre que la caché KV y el contexto elegido no excedan el margen restante. El banco PhantomKV añade ~16,5 MiB.
- Opciones de despliegue: llama.cpp, Ollama y otros lectores GGUF compatibles. La model card menciona integración con hf2q como lector nativo. No se documenta soporte de vLLM ni TGI para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jenerallee78/Qwen3.8-27B-hf2q-Q4_K_M | 4.325.376 (campo safetensors; denominacion 27B) | no disponible | Q4_K_M | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.8-27B (upstream) | no disponible | no disponible | safetensors (precision original) | apache-2.0 | Hugging Face oficial |
| Qwen3.8-27B-abliterated-cyber-GLP-49 (msuiche) | no disponible | no disponible | GGUF + GLP | MIT (fichero) / Apache-2.0 (metadatos) | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El campo de parámetros totales del repo (4.325.376) no es coherente con la denominación "27B" del modelo base; conviene verificar la identidad real del checkpoint antes de asumir un tamaño concreto.
- La model card advierte de que los injertos y el steering en runtime pueden degradar la capacidad y cambiar el comportamiento; hay que evaluar la configuración combinada exacta para cada carga de trabajo.
- Los resultados de sondas en MPS (49/60 a 1/60 rechazos; 0/20 rechazos inocuos) son limitados y no constituyen una cualificación de calidad, benchmark de código ni garantía de seguridad.
- El artefacto GLP externo no se redistribuye en este repositorio; su licencia real (MIT) difiere de los metadatos del repositorio upstream (Apache-2.0), discrepancia que el autor señala sin resolver.
- Idioma declarado: solo inglés. No se documentan capacidades multilingües.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; aplican los del modelo base Qwen3.8-27B.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar la atribución a Alibaba Cloud y respetar las licencias MIT del productor de PhantomKV y de hf2q.
- El repositorio tiene 0 descargas y 0 likes; es una publicación reciente (creada el 2026-11-14) sin validación comunitaria.
- La model card indica que las comprobaciones nativas de código son una puerta de release separada y que esta tarjeta no reclama que se hayan superado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jenerallee78/Qwen3.8-27B-hf2q-Q4_K_M
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/tree/1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0
- Herramienta PhantomKV: https://github.com/lordx64/phantom-kv
- GLP externo (no redistribuido): https://huggingface.co/msuiche/Qwen3.8-27B-abliterated-cyber-GLP-49/resolve/5f1be31cfde653f24fe74c71047433012b8ede9e/Qwen3.8-27B-abliterated-cyber-GLP-49-L10-58-a1.gguf
