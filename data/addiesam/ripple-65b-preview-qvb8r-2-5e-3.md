# addiesam/Ripple-65B-Preview-QVB8R-2.5e-3

## Resumen

Ripple-65B-Preview-QVB8R-2.5e-3 es un paquete de pesos cuantizados del modelo Ripple-65B-Preview de Ricursive AI, publicado por el investigador independiente addiesam (Dr. Addie Sam). No se trata de un modelo entrenado desde cero, sino de una compresión con cota de error certificada del modelo base en bf16, empaquetada en el formato propietario QVB8R (QVB8 con codificación entrópica). El paquete está diseñado exclusivamente para ejecutarse en el motor de inferencia QVB8, que decodifica los pesos comprimidos en la GPU dentro de sus propios kernels CUDA; no es cargable con `transformers` ni con otros motores convencionales.

La propuesta técnica central es la compresión con cota L∞: para cada peso restaurado, el error absoluto respecto al valor original en bf16 es estrictamente inferior a tau = 0,0025. A diferencia de la cuantización tradicional, que se evalúa por promedio (perplejidad o benchmarks), este enfoque controla el peor caso por tensor, con el error máximo almacenado en `manifest.json` (`max_err`). El paquete ocupa 35,5 GB en disco, con 642 tensores comprimidos a una media de 4,38 bits por peso, y está certificado para restauración tanto en fp16 como en bf16.

Es relevante ahora porque propone una alternativa a los formatos de cuantización de facto (GGUF, AWQ, GPTQ) con garantías formales de error y un motor de inferencia propio que permite ejecutar un modelo de 65B en hardware modesto. La contrapartida es la dependencia total del motor QVB8 y la ausencia de datos publicados sobre calidad downstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Ripple-65B-Preview; detalles no disponibles) |
| Parametros totales | 1.664.080 (según safetensors del repo de cuantización); modelo base nominal de 65B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QVB8R (QVB8 con codificación entrópica), tau = 0,0025, media de 4,38 bits por peso en 642 tensores |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con formato QVB8R; requiere el motor QVB8 v1.0.1 o superior |
| Modelo base | ricursiveAI/Ripple-65B-Preview (bf16) |
| Restauración certificada | fp16 y bf16 (`restore: fp16+bf16` en `manifest.json`) |
| Tamaño en disco | 35,5 GB |
| Calibración | ninguna; el empaquetado depende solo de los pesos |

## Arquitectura y entrenamiento

El paquete no incluye entrenamiento propio: hereda íntegramente la arquitectura y los pesos de Ripple-65B-Preview de Ricursive AI, del que no se dispone de detalles arquitectónicos en la información proporcionada (número de capas, dimensiones, tipo de atención o composición del dataset de entrenamiento). Lo que sí está documentado es el proceso de compresión: cada matriz de pesos se empaqueta con un ancho de bits por fila, se verifica tras el empaquetado y se registra el error máximo entre el valor restaurado y el peso original en bf16 por tensor en `manifest.json`, sin que ningún tensor supere tau = 0,0025.

La innovación técnica es el control del peor caso (cota L∞) en lugar del error medio, motivado por el hecho de que un error grande en un peso aislado puede alterar un token y producir una palabra errónea o un carácter de otro idioma en medio de una respuesta correcta, algo que las métricas promedio no detectan. El paquete incluye además `escape_tables.json`: en ejecución fp16 el motor lee solo la tabla fp16 (9 escapes frente a 7.592.730), lo que acelera la decodificación; las ejecuciones bf16 no se ven afectadas. El autor publica dos papers en Zenodo sobre el contrato de compresión y la compresión de pesos, caché KV y activaciones.

## Capacidades

- Generación de texto y conversación, según el `pipeline_tag` del paquete (text-generation, conversational).
- Las capacidades concretas del modelo base (razonamiento, código, matemáticas, visión, tool calling, agentes, multilingüismo) no están documentadas en la información disponible.
- Decodificación con modelo draft: el ecosistema incluye un modelo borrador DFlash2 (packs QVB8 de 4,2 GB y QVB8R de 3,3 GB con tau = 5e-3) que se pasa como `DRAFT` junto al pack objetivo como `MODEL`, lo que sugiere decodificación especulativa en el motor.
- Restauración certificada de pesos en fp16 y bf16 con cota de error verificable por tensor.

## Casos de uso

- Despliegue de un modelo de 65B en hardware limitado: el motor QVB8 decodifica los pesos comprimidos en kernels CUDA propios, de modo que un pack de 35,5 GB permite ejecutar el modelo en GPUs donde el bf16 original no cabría. Adecuado cuando el presupuesto de VRAM es el factor limitante.
- Investigación en cuantización con garantías formales: el paquete sirve para reproducir y auditar la cota L∞, comparando `max_err` por tensor frente a formatos de cuantización evaluados solo por perplejidad media.
- Selección de compromiso tamaño/precisión: la familia de packs del mismo modelo (tau = 1e-3, 2e-3 y 2,5e-3, en QVB8 y QVB8R, de 36 a 57 GB) permite elegir explícitamente el equilibrio entre tamaño y fidelidad de pesos conociendo el peor caso.
- Generación de texto conversacional autoalojada: con licencia Apache-2.0 y sin dependencia de APIs externas, puede integrarse en servicios de chat internos siempre que se acepte la dependencia del motor QVB8.
- Aceleración mediante modelo borrador: combinando el pack objetivo con el pack DFlash2 como `DRAFT`, se puede aprovechar la decodificación especulativa del motor para reducir la latencia por token en cargas interactivas.
- Evaluación comparativa de motores: útil para equipos que quieran medir el rendimiento del motor QVB8 frente a vLLM, llama.cpp o TGI sobre el mismo modelo base, aunque la comparación exigirá convertir o disponer de pesos en los formatos de cada motor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta métricas de compresión: 642 tensores comprimidos, 4,38 bits por peso de media, tau = 0,0025 y `max_err` por tensor en `manifest.json`. No hay datos de perplejidad, MMLU, HumanEval ni latencia/throughput.

## Requisitos de hardware

- VRAM estimada: al menos 35,5 GB para alojar el pack en disco/VRAM, más overhead del motor, caché KV y el pack borrador opcional (3,3-4,2 GB adicionales).
- GPU recomendadas: no especificadas por el autor; por tamaño, encajan GPUs con 40-48 GB o más (A100 40/80 GB, H100, L40S 48 GB) y, previsiblemente, configuraciones multi-GPU en GPUs de consumo.
- GPU de consumo: no cabe en GPUs de 24 GB (RTX 4090) con este pack de 35,5 GB; los packs con tau mayor no reducen lo suficiente el tamaño (el más pequeño de la familia son 36 GB).
- Opciones de despliegue: exclusivamente el motor QVB8 (v1.0.1 o superior, Apache-2.0), con `MODEL` y `DRAFT` como variables. No es compatible con vLLM, llama.cpp, Ollama, TGI ni `transformers`.
- Latencia y throughput: no disponibles. La model card menciona que la tabla de escapes fp16 acelera la decodificación, pero sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ripple-65B-Preview-QVB8R-2.5e-3 | 65B (nominal) | no disponible | QVB8R, 35,5 GB | Apache-2.0 | HF + motor QVB8 |
| Ripple-65B-Preview (bf16) | 65B | no disponible | safetensors bf16 | Apache-2.0 | HF |
| Ripple-65B-Preview-QVB8R-1e-3 | 65B (nominal) | no disponible | QVB8R, 47 GB | Apache-2.0 | HF + motor QVB8 |
| Ripple-65B-Preview-QVB8-2.5e-3 (equivalente) | 65B (nominal) | no disponible | QVB8, 36 GB | Apache-2.0 | HF + motor QVB8 |

No se dispone de información sobre modelos de otros autores comparables en tamaño, contexto o rendimiento; no disponible.

## Limitaciones y advertencias

- Dependencia total del motor QVB8: el pack no carga en `transformers` ni en otros motores; sin el motor y su versión mínima (v1.0.1) es inutilizable.
- La cota L∞ cubre solo los pesos almacenados: no garantiza que las respuestas sean idénticas a las del modelo original ni correctas.
- El autor reconoce que un error grande en un peso aislado puede producir tokens erróneos o caracteres de otro idioma; la cota mitiga el peor caso por tensor, pero no elimina el riesgo de alucinación ni de degradación cualitativa.
- Sin datos publicados de benchmarks, perplejidad ni evaluación downstream: no hay evidencia cuantitativa de la calidad resultante frente al modelo base.
- Sin información sobre sesgos, idiomas soportados ni limitaciones de contexto del modelo base.
- Licencia Apache-2.0 heredada del modelo base, que permite uso comercial; el motor también es Apache-2.0, pero se ofrece sin garantía.
- Proyecto de un investigador independiente con 0 descargas y 0 likes en el momento de la consulta: madurez y soporte limitados.
- El campo de parámetros totales en safetensors (1.664.080) no es coherente con un modelo de 65B; conviene verificar el contenido real del repo antes de planificar el despliegue.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8R-2.5e-3
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Motor QVB8: https://github.com/addiesam/qvb8
- Release del motor v1.0.1: https://github.com/addiesam/qvb8/releases/tag/v1.0.1
- Pack QVB8-1e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8-1e-3
- Pack QVB8R-1e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8R-1e-3
- Pack QVB8-2e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8-2e-3
- Pack QVB8R-2e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8R-2e-3
- Modelo borrador DFlash2 QVB8-5e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-DFlash2-QVB8-5e-3
- Modelo borrador DFlash2 QVB8R-5e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-DFlash2-QVB8R-5e-3
- Paper I (Zenodo): https://doi.org/10.5281/zenodo.23815007
- Patrocinio del autor: https://github.com/sponsors/addiesam
