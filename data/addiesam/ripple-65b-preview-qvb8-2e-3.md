# addiesam/Ripple-65B-Preview-QVB8-2e-3

## Resumen

Ripple-65B-Preview-QVB8-2e-3 es un paquete de pesos cuantizados del modelo de lenguaje Ripple-65B-Preview, desarrollado originalmente por ricursiveAI y comprimido por el usuario addiesam mediante el formato propietario QVB8. No se trata de un modelo entrenado desde cero, sino de una versión comprimida de un modelo base de 65 mil millones de parámetros nominales, empaquetada específicamente para ejecutarse en el motor de inferencia QVB8, que decodifica los pesos comprimidos directamente en la GPU dentro de sus propios kernels CUDA.

La característica técnica central es la compresión con cota certificada en norma L∞: para cada peso restaurado, el error absoluto respecto al valor bf16 original es estrictamente inferior a tau = 0,002. El paquete incluye 642 tensores comprimidos con una media de 6,06 bits por peso y ocupa 49,1 GB en disco. Esta aproximación busca controlar el peor caso de error por peso en lugar de optimizar una métrica promedio como la perplejidad, con el objetivo de evitar fallos puntuales de decodificación (palabras erróneas o caracteres de otro idioma) que las métricas medias pueden ocultar.

El paquete no es cargable directamente en `transformers` ni en otros motores estándar: requiere el QVB8 Inference Engine (versión 1.0.1 o superior) y se distribuye bajo licencia Apache 2.0. Está pensado para desplegar un modelo de gran tamaño en hardware modesto gracias a la decodificación de pesos comprimidos en GPU y al uso opcional de un modelo borrador (DFlash2) para decodificación especulativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Ripple-65B-Preview; el paquete es una compresión QVB8) |
| Parámetros totales | 1.664.080 (según safetensors del paquete; el modelo base se denomina "65B") |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | QVB8 con cota L∞ certificada, tau = 0,002; media de 6,06 bits por peso en los 642 tensores comprimidos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | QVB8 (safetensors como contenedor; requiere QVB8 Inference Engine, no cargable en `transformers`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Ripple-65B-Preview (tipo de transformer, número de capas, dimensiones, mecanismo de atención ni composición del dataset de entrenamiento) en la información proporcionada. El paquete en sí no entrena ningún modelo: es el resultado de comprimir los pesos bf16 del modelo base con el formato QVB8.

El proceso de compresión empaqueta cada matriz de pesos con un ancho de bits por fila y verifica el resultado tras el empaquetado. Para cada tensor se registra en `manifest.json` el error máximo (`max_err`) entre el valor restaurado y el peso bf16 original, garantizando que ningún tensor supera tau = 0,002. El empaquetado no utiliza datos de calibración: depende únicamente de los pesos. El paquete está certificado para restaurar tanto en fp16 como en bf16 (`restore: fp16+bf16`), e incluye una tabla de escapes (`escape_tables.json`) que almacena exactamente ciertos pesos; para fp16 la tabla lista 49 escapes frente a 1.737.599 en bf16, lo que según el autor mejora la velocidad de decodificación de aproximadamente 1,8 a 5,7 tokens por segundo en una prueba con un DGX Spark, un prompt y decodificación greedy. La cota cubre únicamente los pesos almacenados, no garantiza que las respuestas del modelo sean idénticas a las del original ni correctas.

## Capacidades

- Generación de texto y conversación: el pipeline declarado es `text-generation` y las etiquetas incluyen `conversational`.
- Compresión certificada: cada peso restaurado tiene un error acotado por tau = 0,002, verificable mediante `manifest.json`.
- Decodificación especulativa: existe un modelo borrador DFlash2 (packs QVB8 y QVB8R con tau = 5e-3) que se pasa como `DRAFT` junto al pack objetivo como `MODEL`.
- Ejecución en hardware modesto: el motor QVB8 decodifica los pesos comprimidos en la GPU dentro de sus kernels CUDA.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Despliegue de un modelo de gran tamaño en hardware limitado: el pack de 49,1 GB con media de 6,06 bits por peso permite ejecutar un modelo nominal de 65B en GPUs con menos VRAM que la necesaria para los pesos bf16 originales, gracias a la decodificación en kernels CUDA del motor QVB8.
- Evaluación de compresión con cota de error: investigadores que necesiten medir el impacto real de un error acotado por peso (tau = 0,002) frente a cuantizaciones optimizadas en promedio pueden usar este pack y comparar con los packs de tau = 1e-3 (57 GB) y las variantes QVB8R.
- Generación de texto conversacional: al declararse el pipeline `text-generation` y la etiqueta `conversational`, el pack sirve para prototipos de chat y generación de texto siempre que se ejecute sobre el motor QVB8.
- Aceleración mediante decodificación especulativa: combinando el pack objetivo con el borrador DFlash2 (4,1 GB en QVB8, 3,4 GB en QVB8R) se puede aumentar el throughput de decodificación en el motor QVB8.
- Investigación sobre robustez de cuantización: el registro de `max_err` por tensor en `manifest.json` permite auditar qué tensores se acercan más a la cota y estudiar la relación entre error máximo y fallos de decodificación (palabras erróneas, caracteres de otro idioma).
- Pruebas de reproducibilidad fp16 frente a bf16: la tabla de escapes específica para fp16 (49 entradas) permite comparar velocidad y fidelidad de restauración entre ambos tipos de dato en el mismo pack.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El único dato de rendimiento aportado por el autor es una medición de velocidad de decodificación: en una prueba con el pack QVB8-1e-3, en fp16, sobre un DGX Spark, con un prompt y decodificación greedy, el uso de la tabla de escapes fp16 elevó la decodificación de aproximadamente 1,8 a aproximadamente 5,7 tokens por segundo. No se aportan cifras de perplejidad ni de benchmarks de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el pack ocupa 49,1 GB en disco y la decodificación se realiza en la GPU, por lo que se requiere VRAM suficiente para los pesos decodificados y el estado de inferencia del motor QVB8.
- GPU recomendadas: no disponible; el autor cita una prueba en un DGX Spark.
- ¿Cabe en GPU consumer? no disponible.
- Opciones de despliegue: exclusivamente el QVB8 Inference Engine (versión 1.0.1 o superior), disponible en github.com/addiesam/qvb8. No es compatible con `transformers`, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 5,7 tokens por segundo en fp16 con la tabla de escapes, sobre un DGX Spark, un prompt y decodificación greedy (prueba del pack QVB8-1e-3). No hay datos de throughput para este pack concreto ni para bf16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Motor |
|---|---|---|---|---|---|
| Ripple-65B-Preview-QVB8-2e-3 | 1.664.080 (pack); base "65B" | no disponible | QVB8, tau = 0,002, 49,1 GB | Apache 2.0 | QVB8 Inference Engine |
| Ripple-65B-Preview-QVB8-1e-3 | no disponible | no disponible | QVB8, tau = 1e-3, 57 GB | Apache 2.0 | QVB8 Inference Engine |
| Ripple-65B-Preview-QVB8R-2e-3 | no disponible | no disponible | QVB8R, tau = 2e-3, 38 GB | Apache 2.0 | QVB8 Inference Engine |
| Ripple-65B-Preview (bf16) | "65B" nominal | no disponible | bf16 | no disponible | `transformers` u otros motores estándar |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de calidad frente a estos u otros modelos de la misma categoría.

## Limitaciones y advertencias

- El pack no es cargable en `transformers` ni en motores estándar; requiere el QVB8 Inference Engine v1.0.1 o superior y fallará en otros entornos.
- La cota L∞ certifica únicamente los pesos almacenados: no garantiza que las respuestas del modelo sean idénticas a las del original ni que sean correctas.
- El modelo base Ripple-65B-Preview no está documentado en la información disponible: se desconocen arquitectura, contexto, idiomas y datos de entrenamiento, lo que impide evaluar sesgos y alucinaciones con rigor.
- El número de parámetros reportado por safetensors (1.664.080) no concuerda con la denominación "65B" del modelo base; conviene verificar la estructura real del pack antes de planificar el despliegue.
- El uso de fp16 sin `escape_tables.json` provoca que el motor se detenga al arrancar; es necesario descargar el repositorio completo para que el archivo quede junto a `manifest.json`.
- El rendimiento medido (aproximadamente 5,7 tokens por segundo) corresponde a otra variante del pack (1e-3) y a un hardware concreto (DGX Spark); no debe extrapolarse a este pack ni a otras GPUs.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse la atribución y las notas de licencia del modelo base y del autor del pack.
- Riesgo de alucinación y sesgos: no evaluable con la información disponible.

## Enlaces

- Hugging Face del pack: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8-2e-3
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Motor de inferencia QVB8: https://github.com/addiesam/qvb8
- Release del motor v1.0.1: https://github.com/addiesam/qvb8/releases/tag/v1.0.1
- Pack QVB8-1e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8-1e-3
- Pack QVB8R-1e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8R-1e-3
- Pack QVB8R-2e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8R-2e-3
- Borrador DFlash2 QVB8-5e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-DFlash2-QVB8-5e-3
- Borrador DFlash2 QVB8R-5e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-DFlash2-QVB8R-5e-3
