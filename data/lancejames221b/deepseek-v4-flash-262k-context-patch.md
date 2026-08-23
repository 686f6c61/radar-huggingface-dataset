# lancejames221b/DeepSeek-V4-Flash-262k-context-patch

## Resumen

Este repositorio no contiene los pesos de un modelo, sino una utilidad de parcheo de cabeceras GGUF para **DeepSeek-V4-Flash**, un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por DeepSeek. El autor, lancejames221b, ofrece un script en Python que modifica un único `uint32` en el encabezado del archivo GGUF para reducir la ventana de contexto declarada de 1.048.576 tokens (1M) a 262.144 (256k). El objetivo es evitar la sobreasignación de memoria del KV cache y solucionar fallos de paralelismo en cargadores como LM Studio, Bionic y llama.cpp, que dimensionan la caché a partir del valor declarado en el encabezado.

El modelo original DeepSeek-V4-Flash es una variante ligera de la serie V4 de DeepSeek, con 284.000 millones de parámetros totales y 13.000 millones activos, optimizado para tareas de codificación y agentes. El parche no altera los pesos ni la arquitectura; solo ajusta la declaración de contexto para que los asignadores de memoria reserven menos espacio. Esto es relevante porque la declaración de 1M es autoritativa en los cargadores y no se puede anular desde la configuración del cliente, lo que obligaba a pagar por una caché KV de 1M aunque nunca se usara.

La solución es específica para usuarios que ejecutan el modelo en local con recursos limitados, especialmente en equipos con memoria unificada como Apple Silicon. El repositorio incluye el script, instrucciones de uso, verificaciones de seguridad y documentación sobre los resultados obtenidos en una Apple M4 Max de 128 GB con cuantización IQ2XXS.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) |
| Parámetros totales | 284.000 millones (según fuentes web) |
| Parámetros activos | 13.000 millones (según fuentes web) |
| Longitud de contexto | Original: 1.048.576 tokens; tras el parche: 262.144 tokens |
| Tipos de cuantización | No disponible (el parche se ha probado con IQ2XXS, pero es aplicable a cualquier GGUF) |
| Idiomas soportados | No disponible |
| Licencia | `deepseek` (license: other) |
| Formato de pesos | GGUF (el parche modifica solo el encabezado, no los tensores) |

El repositorio no contiene los pesos del modelo; solo el script de parcheo y la documentación. El modelo original DeepSeek-V4-Flash está disponible en HuggingFace y otras plataformas.

## Arquitectura y entrenamiento

La arquitectura del modelo DeepSeek-V4-Flash es un MoE con 284.000 millones de parámetros totales y 13.000 millones activos por token, según los datos de Microsoft Foundry Models y NVIDIA NIM. El contexto nativo es de un millón de tokens. No se dispone de información detallada sobre el entrenamiento (número de tokens, composición del dataset o técnicas de alineamiento) en las fuentes consultadas.

El parche no modifica la arquitectura interna ni los pesos. Solo cambia el valor del campo `deepseek4.context_length` en el encabezado GGUF, que pasa de 1048576 a 262144. Los parámetros de RoPE/YaRN (`original_context_length`, `type` y `factor`) se mantienen intactos, lo que preserva la extrapolación posicional. El script verifica la integridad del archivo antes y después de escribir, y no altera el tamaño del fichero.

## Capacidades

- **Generación de texto y razonamiento**: DeepSeek-V4-Flash es un modelo de razonamiento, como se indica en el README del parche (la mayoría de los tokens se producen en `reasoning_content`).
- **Optimización para codificación**: Según NVIDIA NIM, el modelo está diseñado para "fast coding" y agentes.
- **Contexto largo**: Originalmente soporta hasta 1M tokens; el parche lo reduce a 256k para viabilidad práctica en hardware.
- **Compatibilidad con cargadores**: El parche está pensado para funcionar con LM Studio, Bionic y llama.cpp, que leen el encabezado GGUF.
- **Soporte de paralelismo**: El parche resuelve fallos de `--parallel` en `llama-server` que aparecían con la declaración de 1M.

## Casos de uso

- **Despliegue local en equipos con memoria limitada**: Al reducir la ventana de contexto declarada, el KV cache ocupa menos memoria. Por ejemplo, en una Apple M4 Max de 128 GB con cuantificación IQ2XXS, el RSS de `llama-server` bajó de ~101 GB a ~92 GB, liberando memoria del sistema.
- **Uso con paralelismo de peticiones**: En el mismo equipo, `--parallel 4` fallaba con el encabezado de 1M y funcionaba con el parche de 262k. Esto permite atender varias peticiones simultáneas en el mismo proceso.
- **Integración con LM Studio o Bionic**: El parche permite cargar el modelo con una ventana de 256k en estas aplicaciones sin que el cliente la "clamp" de vuelta a 1M.
- **Aplicación a otros modelos GGUF**: El script es genérico y permite fijar cualquier otro valor de contexto (p. ej., 131072) mediante `--value`, útil para adaptar el modelo a recursos concretos.
- **Investigación de la gestión de contexto en GGUF**: El repositorio documenta cómo los cargadores interpretan el encabezado y cómo se puede modificar de forma segura, sirviendo como referencia para desarrolladores.
- **Recuperación de memoria para otras aplicaciones**: En un sistema con recursos compartidos, liberar ~9 GB de memoria del proceso del modelo permite ejecutar otras herramientas o contenedores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es el impacto en memoria y paralelismo documentado en el README:

| Configuración | RSS (`llama-server`) | Memoria libre | `--parallel 4` |
|---|---|---|---|
| Encabezado 1M (stock) | ~101 GB | 6.2 GB | Error 500 "Compute error" |
| Encabezado 262k (parche) | ~92 GB | 21 GB | Funciona |

Estos valores corresponden a una Apple M4 Max de 128 GB con cuantización IQ2XXS, y no son extrapolables a otros hardware.

## Requisitos de hardware

- **VRAM estimada**: No se especifica una cifra general. En el caso documentado, con un modelo de 86.72 GB (IQ2XXS), el proceso de `llama-server` usaba ~92 GB de memoria unificada tras el parche.
- **GPU recomendadas**: No se indican GPUs concretas. El parche se ha probado en Apple M4 Max (128 GB unificada).
- **Compatibilidad con GPU de consumo**: No hay datos para tarjetas como RTX 4090 o similares. El modelo original es muy grande (284B) y requiere cuantización agresiva o hardware con gran memoria.
- **Opciones de despliegue**: El parche es compatible con cargadores que leen GGUF: llama.cpp, LM Studio, Bionic, entre otros.
- **Latencia y throughput**: No disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría (p. ej., DeepSeek-V4-Pro, DeepSeek-R1, otros MoE). La información proporcionada solo cubre el parche de contexto, no el rendimiento relativo del modelo original.

## Limitaciones y advertencias

- **El parche no sobrevive a re-descargas**: Si se vuelve a descargar el GGUF, el encabezado original de 1M se restaura y el parche debe aplicarse de nuevo.
- **La modificación solo afecta a la declaración**: No cambia el comportamiento real del modelo ni la extrapolación posicional; solo reduce la memoria reservada para la caché KV.
- **Algunos cargadores pueden ignorar el cambio**: La documentación del README indica que ciertos ajustes de configuración (como `.preset.json` o `models.yml`) no tienen efecto; el parche actúa directamente sobre el archivo.
- **Riesgo de corrupción si se aplica mal**: El script incluye comprobaciones (lsof, backup, aserciones) para evitar escrituras incorrectas, pero es una modificación binaria manual.
- **El modelo original puede tener sesgos o alucinaciones**: No se han documentado en las fuentes consultadas, pero es un modelo de razonamiento grande y sin filtros específicos.
- **Licencia**: El modelo tiene licencia `deepseek` (tipo `other`), que puede imponer restricciones de uso comercial. El parche en sí no añade restricciones adicionales.

## Enlaces

- Repositorio del parche: [lancejames221b/DeepSeek-V4-Flash-262k-context-patch](https://huggingface.co/lancejames221b/DeepSeek-V4-Flash-262k-context-patch)
- Modelo original en HuggingFace: [deepseek-ai/DeepSeek-V4-Flash](https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash)
- Sitio web de DeepSeek: [DeepSeek](https://deepseek.com/en/index.html)
- NVIDIA NIM para DeepSeek-V4-Flash: [build.nvidia.com/deepseek-ai/deepseek-v4-flash](https://build.nvidia.com/deepseek-ai/deepseek-v4-flash)
