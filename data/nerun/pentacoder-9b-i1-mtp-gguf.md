# nerun/PentaCoder-9B-i1-MTP-GGUF

## Resumen

PentaCoder-9B-i1-MTP-GGUF es una distribución de pesos en formato GGUF del modelo PentaCoder-9B-i1, un merge basado en Qwen3.5-9B orientado a generación de código y flujos agénticos. La publica el usuario nerun sobre los cuantizados imatrix de mradermacher, y su rasgo diferencial es la incorporación de un bloque MTP (Multi-Token Prediction) embebido que habilita decodificación especulativa dentro de llama.cpp mediante `--spec-type draft-mtp`, sin necesidad de cargar un modelo borrador separado.

El bloque MTP no se ha entrenado sobre PentaCoder, sino que se ha trasplantado tensor a tensor desde un extracto MTP-only de Qwen3.5-9B publicado por a4lg. Como comparte `token_embd` y `output` con el modelo principal, el incremento de tamaño es mínimo (unos 0,2 GiB) y el consumo de VRAM es inferior al de un draft model independiente. En las pruebas del autor la aceptación del borrador se sitúa en torno a 0,6-0,7, con una mejora de velocidad de generación de aproximadamente el 46 % frente a la inferencia sin MTP.

La relevancia práctica es doble: por un lado ofrece un modelo de 9B con licencia Apache 2.0 y cuantizaciones desde IQ1_S (~2,7 GiB) hasta Q6_K (~7,1 GiB), lo que permite desplegarlo en GPU de consumo; por otro, demuestra una vía de bajo coste para añadir decodificación especulativa a merges comunitarios que no incluyen cabezas MTP en su publicación original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-9B) con bloque MTP embebido para decodificación especulativa |
| Parametros totales | 456.010.480 (dato de safetensors del repo; el nombre comercial indica 9B, discrepancia no aclarada en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de uso fija `-fitc 32768` |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (bloque MTP en Q4_K_M, Q5_K_M o Q6_K según fichero) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con proyectores de visión mmproj incluidos |

## Arquitectura y entrenamiento

El modelo principal es un transformer denso derivado de Qwen3.5-9B, fusionado (merge) por la comunidad y cuantizado con imatrix por mradermacher. Sobre esa base, nerun ha injertado un bloque MTP (`blk.32.*`) copiado tensor a tensor desde a4lg/Qwen3.5-9B-MTP-ONLY-GGUF, un subconjunto MTP-only extraído del Qwen3.5-9B original. No hay entrenamiento ni ajuste fino en este repositorio: la operación es puramente de trasplante de pesos y recuantización del bloque añadido.

La innovación técnica es la decodificación especulativa auto-contenida: el bloque MTP comparte `token_embd` y `output` con PentaCoder, de modo que actúa como cabeza borradora dentro del mismo fichero. El autor advierte que la cabeza se entrenó sobre Qwen3.5-9B y no sobre PentaCoder, por lo que la aceptación (~0,6-0,7) es buena pero no óptima. No se documentan en la model card el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional y razonamiento, con etiquetas de la model card para `conversational` y `reasoning`.
- Generación de código y asistencia en tareas de programación (`code`).
- Flujos agénticos y razonamiento multi-paso (`agentic`).
- Decodificación especulativa integrada mediante bloque MTP, activable con `--spec-type draft-mtp`.
- Capacidades de visión a través de los proyectores mmproj incluidos, aunque proceden de Qwen3.5-9B y no se entrenaron con los pesos del merge.
- Soporte de tool calling / function calling: no confirmado explícitamente en la model card.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Asistente de código en local: con cuantizaciones IQ4_XS o Q4_K_M (5,0-5,4 GiB) cabe en GPU de 8 GB y permite autocompletado y generación de funciones en un IDE sin depender de la nube.
- Servidor de inferencia en GPU de consumo: el bloque MTP eleva el throughput de ~37 a ~54 t/s en una RX 6600M de 8 GB con `--spec-draft-n-max 2`, lo que hace viable atender varias sesiones interactivas en hardware modesto.
- Agentes de refactorización multi-paso: la etiqueta `agentic` y el contexto configurable a 32.768 tokens permiten encadenar lecturas de repositorio, ediciones y verificación en una sola sesión.
- Despliegue en equipos con VRAM muy limitada: la variante IQ1_S (~2,7 GiB) o IQ2_XXS (~3,0 GiB) permite ejecutar un modelo de 9B en portátiles con 4-6 GB de VRAM, sacrificando calidad.
- Prototipado de pipelines de decodificación especulativa: sirve como banco de pruebas para medir aceptación del borrador y ajustar `--spec-draft-n-max` antes de pasar a producción.
- Análisis de capturas o diagramas en flujos de desarrollo: los mmproj permiten entrada de imagen para describir interfaces o errores visuales, con la cautela de que el proyector no fue entrenado con este merge.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 24 variantes del mismo modelo, útil para estudios de degradación calidad/tamaño en tareas de código.

## Benchmarks y rendimiento

Los únicos datos publicados son mediciones de velocidad de generación del autor, no benchmarks de calidad. Se obtuvieron con el cuantizado IQ4_XS, un prompt corto en prosa ("Explain why the sky is blue") y los mismos ajustes de muestreo.

| Configuracion | Generacion (t/s) | Aceptacion del borrador |
|---|---:|---:|
| Sin MTP (baseline) | 37,05 | — |
| `--spec-draft-n-max 1` | 49,95 | 0,81 |
| `--spec-draft-n-max 2` | 54,07 ± 0,70 | 0,6781 ± 0,0161 |
| `--spec-draft-n-max 3` (por defecto) | 51,57 ± 1,51 | 0,5566 ± 0,0266 |
| `--spec-draft-n-max 4` | 49,32 | 0,51 |
| `--spec-draft-n-max 6` | 36,63 | 0,33 |

Entorno de medida: AMD Radeon RX 6600M (Navi 23, 8 GB) sobre placa de escritorio, AMD Ryzen 5 serie 5000, 32 GB DDR4-3200, Debian testing, llama.cpp build b12230. Las filas con `n-max` 2 y 3 son media ± desviación típica de 10 ejecuciones con reinicio del servidor; el resto son ejecuciones únicas. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: desde ~2,7 GiB (IQ1_S) hasta ~7,1 GiB (Q6_K) solo para pesos; añadir overhead de contexto KV cache (en el ejemplo se cuantiza a q8_0) y buffers de cómputo.
- El bloque MTP añade aproximadamente 0,2 GiB sobre el cuantizado original, menos que cargar un draft model separado.
- GPU de consumo: cabe en 8 GB con IQ4_XS o Q4_K_M; en 6 GB con IQ3_M o inferiores; en 4 GB solo con IQ2_XXS o IQ1_S.
- GPU profesionales: A100, H100 y RTX 4090 no se mencionan en la documentación; el modelo está pensado para despliegue local, no para clústeres.
- Despliegue: llama.cpp con soporte de MTP draft (`--spec-type draft-mtp`), build b12230 o superior. No se documenta compatibilidad con vLLM, TGI, Ollama ni otros runners.
- Throughput medido: 37 t/s sin MTP y 54 t/s con MTP en RX 6600M; el autor advierte que con `-ub 1024` o `-ub 2048` el rendimiento cae a ~22 t/s por presión de VRAM con `-fit on`.
- Ajuste recomendado: `-ngl auto -c 0 -fit on -fitc 32768 -fa on -np 1 -ctk q8_0 -ctv q8_0 --temp 0.6 --top-k 20 --min-p 0.0 --spec-type draft-mtp --spec-draft-n-max 2`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MTP / especulacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PentaCoder-9B-i1-MTP-GGUF | 9B (nombre comercial; safetensors del repo indica 456 M, discrepancia no aclarada) | no disponible | Si, bloque MTP embebido | Apache 2.0 | GGUF en HF |
| mradermacher/PentaCoder-9B-i1-GGUF | 9B | no disponible | No | Apache 2.0 | GGUF en HF |
| Qwen/Qwen3.5-9B | 9B | no disponible | No en el checkpoint base | no disponible en la información | HF |
| a4lg/Qwen3.5-9B-MTP-ONLY-GGUF | solo bloque MTP | no disponible | Si (MTP-only) | no disponible en la información | GGUF en HF |

La comparación se limita a la familia de origen porque la model card no aporta datos de rendimiento frente a modelos de otros proveedores. La ventaja frente a mradermacher/PentaCoder-9B-i1-GGUF es exclusivamente la decodificación especulativa integrada; la calidad del modelo base es idéntica al ser copia tensor a tensor.

## Limitaciones y advertencias

- El bloque MTP se entrenó sobre Qwen3.5-9B, no sobre PentaCoder; la aceptación (~0,6-0,7) es inferior a la de una cabeza específica y puede degradar en dominios muy alejados del corpus original.
- Los proyectores de visión (mmproj) provienen de mradermacher/Qwen3.5-9B-GGUF y nunca se entrenaron con los pesos del merge, por lo que las descripciones de imágenes pueden ser imprecisas.
- Discrepancia de tamaño: el nombre indica 9B pero el recuento de safetensors del repo es de 456 millones de parámetros; conviene verificar antes de planificar despliegues.
- No hay datos publicados de benchmarks de calidad (MMLU, HumanEval, GSM8K) ni de sesgos; el riesgo de alucinación es el propio de un modelo de 9B sin evaluación documentada.
- Idiomas soportados no documentados; no se garantiza un rendimiento adecuado en castellano.
- El repositorio ocupa 115,7 GB por acumular 24 cuantizaciones; la descarga completa no es necesaria, pero conviene seleccionar un único fichero.
- Requiere una build de llama.cpp con soporte de `--spec-type draft-mtp`; versiones anteriores ignorarán o rechazarán la opción.
- En GPU de 8 GB, aumentar `-ub` por encima de 512 reduce drásticamente el throughput con MTP activo (~22 t/s).
- Licencia Apache 2.0 permite uso comercial, pero al ser un merge comunitario conviene revisar las condiciones del modelo base Qwen3.5-9B y de los cuantizados de origen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nerun/PentaCoder-9B-i1-MTP-GGUF
- Modelo base cuantizado: https://huggingface.co/mradermacher/PentaCoder-9B-i1-GGUF
- Donante del bloque MTP: https://huggingface.co/a4lg/Qwen3.5-9B-MTP-ONLY-GGUF
- Modelo original Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Proyectores de visión de origen: https://huggingface.co/mradermacher/Qwen3.5-9B-GGUF
