# AngelSlim/Hy4-preview-GGUF

## Resumen

Hy4-preview es un modelo de lenguaje de gran escala desarrollado por Tencent, distribuido originalmente en precisión bf16 en el repositorio `tencent/Hy4-preview`. La ficha que nos ocupa, `AngelSlim/Hy4-preview-GGUF`, es una conversión comunitaria a formato GGUF realizada por el usuario AngelSlim, que ofrece tres builds cuantizados del modelo para su uso con una versión parcheada de llama.cpp. Con 769.907.408.797 parámetros totales según los safetensors del modelo original, estamos ante un modelo de escala frontera, no apto para hardware de consumo.

La relevancia de esta conversión es doble. Por un lado, hace accesible un modelo de casi 770.000 millones de parámetros en formatos de 4 bits (435,20 GiB) y de ~2,4 bits por peso (213-220 GiB), reduciendo a la mitad el espacio necesario respecto al build estándar. Por otro, documenta de forma inusualmente detallada una estrategia de cuantización mixta propia (MIX-STQ1_0) con análisis cuantitativo de la pérdida de error, algo poco habitual en repositorios de cuantización comunitarios.

Es importante señalar que el modelo requiere una arquitectura `hyv4` que no está en el upstream de llama.cpp: es necesario aplicar los parches incluidos en el repositorio. Además, el repositorio no declara licencia, idiomas soportados ni pipeline, por lo que estos datos figuran como no disponibles en esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `hyv4` (no upstream en llama.cpp); detalles internos no disponibles en la información proporcionada |
| Parámetros totales | 769.907.408.797 (~770B) |
| Parámetros activos | no disponible (la presencia de familias `ffn_*_exps` con 256 expertos sugiere arquitectura MoE, pero no se confirma el número de activos) |
| Longitud de contexto | no disponible (los ejemplos de ejecución usan `-c 8192`; el indexador DSA menciona selección de 2048 tokens por consulta) |
| Tipos de cuantización | Q4_K_M (4,86 bpw), UD-IQ1_M (2,44 bpw), MIX-STQ1_0 (2,38 bpw) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (tres ficheros); pesos originales en bf16 en el repo de Tencent |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de los nombres de tensores que aparecen en la receta de cuantización. De estos se deduce una estructura de mezcla de expertos (MoE) con 256 expertos enrutados por capa (familias `ffn_gate_exps`, `ffn_up_exps`, `ffn_down_exps`, que suponen el 97,7 % de los parámetros), atención con proyecciones separadas tipo MLA (`q_b`, `k_b`, `v_b`, `kv_a_mqa`), un indexador DSA (DeepSeek Sparse Attention, presumiblemente) de 105 tensores que decide qué 2048 tokens ve cada consulta, y módulos denominados `iHC` con tensores `*_fn` que el autor mantiene en F32 siguiendo `_keep_in_fp32_modules` de la implementación de referencia. No se dispone de datos sobre volumen de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO.

La innovación técnica destacable de este repositorio no está en el modelo sino en el códec de cuantización STQ1_0, derivado del PR #22836 de llama.cpp. El formato almacena pesos ternarios `{-d, 0, +d}` con una restricción de esparsidad 3:4 (exactamente una de cada cuatro posiciones forzada a cero); cada grupo de 4 pesos se codifica con un código de 4 bits más un bit de selección de tabla que indexa un codebook de 32 entradas, y una escala fp16 cubre 256 pesos, resultando en 42 bytes por 256 pesos = 1,3125 bpw. El encoder propio de AngelSlim sustituye el cálculo de escala `d = amax` por una escala de mínimos cuadrados ponderada, `d = sum(w*sel*x) / sum(w*sel^2)`, y elige la posición a anular minimizando el coste incremental `w[j]*(x[j]^2 - (|x[j]|-d)^2)` en lugar de la magnitud, alternando ambos pasos durante 3 rondas. Sobre 1200 filas reales de expertos, la escala por mínimos cuadrados reduce el SSD ponderado un 89,7 % y los términos de imatrix un 4,1 % adicional del resto.

## Capacidades

- Generación de texto conversacional: el repositorio incluye plantilla de chat propia (requiere `--jinja` en llama.cpp) y está etiquetado como `conversational`.
- Razonamiento y matemáticas: no hay documentación específica ni benchmarks en la información disponible.
- Generación de código: no documentada en la información disponible.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el repositorio no declara idiomas.
- Capacidades especiales (visión, audio, modo thinking): no documentadas.
- La única capacidad verificable con la información disponible es la inferencia de texto en formato GGUF mediante llama.cpp parcheado.

## Casos de uso

- Despliegue de un modelo de ~770B en infraestructura de 8 GPU: con el build STQ1_0 (~214 GiB) y `-ngl 99`, el modelo cabe en 8 aceleradores de 80 GB (por ejemplo, 8x H20 o 8x H100), lo que permite servir un modelo de escala frontera sin recurrir al bf16 completo. El autor reporta 204,56 t/s de prefill y 20,47 t/s de decode en 8x H20.
- Investigación en cuantización extrema: el repositorio sirve como caso de estudio reproducible de cuantización post-entrenamiento a ~2,4 bpw sobre un MoE de 256 expertos, con recetas, ficheros de tipos de tensor e imatrix incluidos, y métricas de error (SSD ponderado) sobre filas reales de expertos.
- Evaluación comparativa de códecs: permite comparar Q4_K_M (4,86 bpw) frente a UD-IQ1_M (2,44 bpw) y MIX-STQ1_0 (2,38 bpw) sobre el mismo modelo base, aislando el efecto del bpw en la calidad de salida.
- Generación de texto por lotes en clúster con almacenamiento local: para pipelines offline de síntesis de datos o anotación a gran escala, donde el throughput de decode de ~20 t/s por instancia y el prefill de ~200 t/s son aceptables y el coste por token importa más que la latencia interactiva.
- Desarrollo de runtimes alternativos: los parches `0001-hyv4-architecture.patch` y `0002-stq1_0-quant-and-cuda.patch` documentan cómo integrar una arquitectura nueva y un tipo de cuantización nuevo en llama.cpp, útiles para quien necesite portar `hyv4` a otro motor.
- Reproducción de cuantizaciones propias: con `llama-quantize --dry-run --imatrix ... --tensor-type-file Hy4-preview-STQ1_0.tensortypes --leave-output-tensor`, un equipo puede regenerar los builds desde el bf16 original y ajustar la asignación de bits por familia de tensores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos numéricos son de rendimiento de inferencia, medidos por el autor en 8x H20 con el build STQ1_0:

| Métrica | Valor |
|---|---|
| Prefill (pp512) | 204,56 ± 1,42 t/s |
| Decode (tg128) | 20,47 ± 0,02 t/s |

## Requisitos de hardware

- VRAM para residencia completa: ~435 GiB con Q4_K_M y ~214 GiB con STQ1_0 (y cifra equivalente para UD-IQ1_M, ~220 GiB). Con menos VRAM debe reducirse `-ngl` para descargar capas a CPU.
- Configuración mínima realista: 8 GPU de 80 GB (H100, H20, A100 80GB) para el build STQ1_0; 6 GPU de 80 GB no bastan para Q4_K_M con residencia completa.
- No cabe en GPU de consumo: ni una RTX 4090 (24 GB) ni varias en paralelo alcanzan los ~214 GiB del build más pequeño sin descarga masiva a CPU, lo que haría la inferencia inviable en la práctica.
- Despliegue: exclusivamente llama.cpp parcheado en el commit `0cea36222`, con compilación CMake y `-DGGML_CUDA=ON`. Se requiere CUDA 13.0 en el ejemplo del autor y `-DCMAKE_CUDA_ARCHITECTURES` ajustado a la GPU (90 para H20/H100). Para compilación offline hacen falta tanto `-DLLAMA_BUILD_UI=OFF` como `-DLLAMA_USE_PREBUILT_UI=OFF`.
- vLLM, TGI, Ollama y otros motores no están soportados según la información disponible, al no existir la arquitectura `hyv4` en upstream.
- Almacenamiento: los pesos deben residir en disco local; sobre NFS, los fallos de página aleatorios del mmap caen a ~12 MB/s y la carga puede pasar de un minuto a horas.
- Latencia y throughput: ver tabla de benchmarks (8x H20, STQ1_0).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de modelos comparables de la misma escala ni benchmarks que permitan una comparación rigurosa. Como referencia puramente estructural, el propio repositorio cita `tencent/Hy4-preview` como modelo base en bf16, del que estos GGUF son una conversión; no se dispone de sus especificaciones de contexto, licencia o rendimiento en la información facilitada.

## Limitaciones y advertencias

- La arquitectura `hyv4` no está en upstream de llama.cpp: sin aplicar los parches del repositorio, los ficheros no cargan. Esto rompe la portabilidad habitual de GGUF y obliga a mantener un fork del motor.
- El build STQ1_0 exige un imatrix para la cuantización; no es posible regenerarlo correctamente sin él.
- El repositorio no declara licencia. Antes de cualquier uso comercial debe verificarse la licencia del modelo original `tencent/Hy4-preview`, que tampoco figura en la información disponible.
- No se declaran idiomas soportados; el rendimiento fuera de los idiomas de entrenamiento del modelo base es desconocido.
- La cuantización a 2,38-2,44 bpw implica una pérdida de calidad no cuantificada en benchmarks de tarea; el autor solo reporta métricas de error de reconstrucción de pesos (SSD ponderado), no evaluaciones downstream.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero aplican los habituales de un modelo conversacional de esta escala sin ficha de seguridad publicada.
- El repositorio ocupa 932,2 GB, lo que exige planificación de almacenamiento incluso para descargar una sola variante.
- La herramienta `llama-cli` de este build ignora `-no-cnv`, por lo que conviene usar `-st -f prompt.txt` para prompts únicos; de lo contrario el proceso entra en bucle imprimiendo `>` al llegar a EOF.
- Las herramientas Python que lean los ficheros deben usar el `gguf-py` parcheado con ruta absoluta (`sys.path.insert(0, '/path/to/llama.cpp/gguf-py')`).

## Enlaces

- Repositorio GGUF: https://huggingface.co/AngelSlim/Hy4-preview-GGUF
- Modelo base en bf16: https://huggingface.co/tencent/Hy4-preview
- llama.cpp (upstream): https://github.com/ggml-org/llama.cpp
- PR de llama.cpp del códec STQ1_0: https://github.com/ggml-org/llama.cpp/pull/22836 (referenciado en la model card; no verificado)
