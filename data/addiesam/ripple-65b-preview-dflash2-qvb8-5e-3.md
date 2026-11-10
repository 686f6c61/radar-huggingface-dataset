# addiesam/Ripple-65B-Preview-DFlash2-QVB8-5e-3

## Resumen
Ripple-65B-Preview-DFlash2-QVB8-5e-3 es un paquete de pesos cuantizados del modelo draft (borrador) DFlash2 asociado a Ripple-65B-Preview, publicado por el usuario addiesam. No se trata de un modelo completo e independiente, sino de la versión comprimida del modelo de decodificación especulativa que acompaña al modelo principal Ripple-65B-Preview de ricursiveAI. El paquete emplea el formato propietario QVB8, desarrollado por el mismo autor, y está certificado con una cota de error L∞ de tau = 0.005 sobre cada peso restaurado respecto al valor bf16 original.

La relevancia de este paquete reside en su enfoque de compresión certificada: en lugar de optimizar una métrica media (perplejidad o benchmark), el formato garantiza que el error máximo de cualquier peso individual queda por debajo de tau, verificándose tensor a tensor tras el empaquetado y registrándose en `manifest.json`. Esto permite elegir el compromiso entre tamaño de archivo y fidelidad al modelo original conociendo la cota del peor caso. El paquete ocupa 4.1 GB en disco, comprime 49 tensores con una media de 8.19 bits por peso y está pensado exclusivamente para el motor de inferencia QVB8, no para `transformers`.

El modelo base declarado es ricursiveAI/Ripple-65B-Preview-DFlash2, con arquitectura etiquetada como qwen3 en los tags de Hugging Face. El paquete se publicó el 7 de noviembre de 2026 y se actualizó el 9 de noviembre de 2026 con el archivo `escape_tables.json`, que acelera las ejecuciones en fp16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3 (según tags de Hugging Face); modelo draft para decodificación especulativa |
| Parametros totales | 472.320 (dato real de safetensors; corresponde al modelo draft, no al modelo principal de 65B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QVB8 con tau = 0.005; media de 8.19 bits por peso sobre 49 tensores; existe variante qvb8r con tau = 5e-3 (3.4 GB) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | QVB8 (safetensors como tag de repositorio); no cargable directamente en transformers |

## Arquitectura y entrenamiento
El paquete comprime el modelo draft DFlash2 de Ripple-65B-Preview, un modelo auxiliar empleado para decodificación especulativa junto al modelo principal. Los tags de Hugging Face indican arquitectura qwen3 para el modelo base. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el material proporcionado.

La innovación técnica central es el esquema de compresión certificada L∞: cada matriz de pesos se empaqueta con un ancho de bits por fila y se verifica tras el empaquetado, registrando el error máximo entre el valor restaurado y el peso bf16 original por tensor en `manifest.json` (`max_err`), sin que ningún tensor supere tau. El empaquetado no utiliza datos de calibración y depende únicamente de los pesos. El paquete está certificado para restauración tanto en fp16 como en bf16 (`restore: fp16+bf16`), e incluye una lista de pesos almacenados exactamente (escapes): 520 entradas para la tabla fp16 frente a 426.784 en bf16.

## Capacidades
- Generación de texto como modelo draft dentro de un pipeline de decodificación especulativa, acelerando la inferencia del modelo principal Ripple-65B-Preview.
- Decodificación especulativa: propone tokens candidatos que el modelo objetivo verifica, reduciendo el coste por token generado.
- Ejecución exclusiva en el motor QVB8 Inference Engine (v1.0.1 o posterior), que decodifica los pesos comprimidos en la GPU dentro de sus propios kernels CUDA.
- Restauración certificada en fp16 y bf16 con cota de error L∞ garantizada por peso.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo en la información disponible.

## Casos de uso
- Aceleración de inferencia del modelo principal: el paquete se usa como `DRAFT` junto al paquete objetivo (`MODEL`) en el motor QVB8, permitiendo decodificación especulativa sobre Ripple-65B-Preview en hardware limitado.
- Despliegue en hardware de gama baja: con 4.1 GB en disco y decodificación en kernels CUDA propios, el draft model cabe en GPU consumer y complementa al modelo objetivo comprimido (57 GB con tau = 1e-3).
- Servicios de generación de texto con latencia ajustada: la decodificación especulativa reduce el número de pasos del modelo grande, mejorando tokens por segundo en despliegues interactivos.
- Investigación sobre compresión certificada: permite reproducir y auditar el esquema L∞ comparando `max_err` por tensor frente a tau en `manifest.json`.
- Evaluación de robustez frente a cuantización: útil para estudiar cómo el error máximo por peso afecta la estabilidad de la generación (tokens erróneos o caracteres de otro idioma), frente a métricas medias.
- Pipelines de inferencia en fp16 con la tabla de escapes: la inclusión de `escape_tables.json` permite ejecuciones fp16 más rápidas (de ~1.8 a ~5.7 tokens por segundo en la prueba citada con el pack QVB8-1e-3 en un DGX Spark).

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card solo cita una medición de velocidad de decodificación: en una prueba con el pack QVB8-1e-3, fp16, un DGX Spark, un prompt y decodificación greedy, se pasó de aproximadamente 1.8 a 5.7 tokens por segundo tras añadir `escape_tables.json`.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; el paquete ocupa 4.1 GB en disco y se decodifica en GPU, por lo que se requiere espacio de VRAM para pesos, caché KV y estado del motor.
- GPU recomendadas: no disponible; la model card menciona un DGX Spark como hardware de prueba.
- Cabe en GPU consumer: probable por el tamaño de 4.1 GB del draft, aunque no se confirma oficialmente.
- Opciones de despliegue: exclusivamente QVB8 Inference Engine v1.0.1 o posterior (https://github.com/addiesam/qvb8); no es cargable en transformers, llama.cpp, vLLM, Ollama ni TGI.
- Latencia y throughput: solo se documenta la medición fp16 citada (~1.8 a ~5.7 tokens/s en DGX Spark con el pack QVB8-1e-3); para este pack no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Carga en transformers |
|---|---|---|---|---|---|
| Ripple-65B-Preview-DFlash2-QVB8-5e-3 | 472.320 (draft) | no disponible | QVB8 | apache-2.0 | No (solo motor QVB8) |
| Ripple-65B-Preview-DFlash2-QVB8R-5e-3 | no disponible | no disponible | qvb8r | apache-2.0 | No (solo motor QVB8) |
| ricursiveAI/Ripple-65B-Preview-DFlash2 (bf16) | no disponible | no disponible | safetensors/bf16 | no disponible | No disponible en la información |

## Limitaciones y advertencias
- No es un modelo autónomo: es un draft model que debe combinarse con un pack objetivo y ejecutarse en el motor QVB8; no funciona en transformers ni en otros motores.
- La cota L∞ cubre únicamente los pesos almacenados; no garantiza que las respuestas sean idénticas a las del modelo original ni correctas.
- Requiere descargar el repositorio completo para que `escape_tables.json` quede junto a `manifest.json`; una ejecución fp16 sin ese archivo se detiene al arranque.
- El paquete está certificado para fp16 y bf16; otros tipos de restauración no están cubiertos por la certificación.
- No se documentan sesgos, cobertura idiomática ni restricciones adicionales de uso comercial más allá de la licencia apache-2.0.
- Riesgo de alucinación inherente a los modelos generativos; la compresión certificada no elimina este riesgo.
- La información sobre el modelo base (contexto, entrenamiento, benchmarks) no está disponible en el material proporcionado.

## Enlaces
- Paquete en Hugging Face: https://huggingface.co/addiesam/Ripple-65B-Preview-DFlash2-QVB8-5e-3
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-DFlash2
- Motor QVB8 Inference Engine: https://github.com/addiesam/qvb8
- Release v1.0.1 del motor: https://github.com/addiesam/qvb8/releases/tag/v1.0.1
- Pack objetivo QVB8-1e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8-1e-3
- Pack objetivo QVB8R-1e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8R-1e-3
- Pack objetivo QVB8-2e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8-2e-3
- Pack objetivo QVB8R-2e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8R-2e-3
- Variante qvb8r del draft: https://huggingface.co/addiesam/Ripple-65B-Preview-DFlash2-QVB8R-5e-3
