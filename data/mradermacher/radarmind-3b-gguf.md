# mradermacher/RadarMind-3B-GGUF

## Resumen

RadarMind-3B-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo RadarMind-3B, publicada por el usuario mradermacher en Hugging Face. El repositorio no contiene un modelo original, sino una conversión de los pesos del modelo base alojado en `zhtstar/RadarMind-3B` a formatos optimizados para inferencia en CPU y GPU de gama baja mediante llama.cpp y derivados.

El dato más relevante y a la vez problemático es la discrepancia entre el nombre comercial ("3B") y el recuento real de parámetros reportado en los safetensors del repositorio: 668.684.288 parámetros, es decir, aproximadamente 0,67 mil millones. Esto sugiere que el nombre "3B" no corresponde al tamaño real del modelo o que el archivo de pesos indexado no representa el conjunto completo. No hay información pública en la ficha que permita resolver esta contradicción.

El repositorio tiene un tamaño de 2,2 GB, lo que es coherente con un modelo de menos de mil millones de parámetros cuantizado en varios formatos (desde Q2_K hasta F16). No se dispone de información sobre arquitectura, datos de entrenamiento, licencia ni idiomas soportados, lo que limita seriamente cualquier evaluación técnica rigurosa. La fecha de creación (26 de noviembre de 2026) es también anómala y debe tratarse con cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 668.684.288 (según safetensors del repo) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base RadarMind-3B. La model card del repositorio GGUF es puramente mecánica: indica el origen (`zhtstar/RadarMind-3B`), el tipo de conversión (`convert_type: hf`, `quantize_version: 2`) y la lista de cuantizaciones generadas. No se menciona si se trata de un transformer denso, un modelo MoE, una arquitectura híbrida o un SSM.

Tampoco hay datos sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. La única información técnica inferible es la lista de cuantizaciones, que incluye formatos de muy baja precisión (Q2_K, IQ4_XS), lo que sugiere que el autor priorizó la reducción de tamaño para despliegue en hardware limitado. La etiqueta `output_tensor_quantised: 1` indica que la cuantización se aplicó a los tensores de salida, un detalle relevante para quienes evalúen la degradación de calidad en capas finales.

## Capacidades

- No se dispone de información verificada sobre las capacidades del modelo. La model card no describe tareas soportadas.
- No hay evidencia de soporte de tool calling o function calling.
- No hay evidencia de capacidades de agente o razonamiento multi-paso.
- No se especifican idiomas soportados ni calidad multilingüe.
- No se indica soporte de visión, audio ni modos de razonamiento extendido (thinking mode).
- El único dato objetivo es que el modelo es ejecutable mediante llama.cpp y herramientas compatibles con GGUF, lo que habilita generación de texto autoregresiva estándar si el modelo base la soporta.

## Casos de uso

- Despliegue en CPU y dispositivos de borde: las cuantizaciones Q2_K y Q3_K permiten ejecutar el modelo en equipos sin GPU dedicada o con GPU integrada, usando llama.cpp u Ollama, para prototipos de generación de texto donde el coste de infraestructura sea mínimo.
- Experimentación educativa con cuantización: el repositorio ofrece hasta doce variantes de cuantización del mismo modelo, lo que permite estudiar la degradación de calidad y el ahorro de memoria entre F16 y Q2_K en un caso real.
- Pruebas de integración en pipelines GGUF: útil para validar compatibilidad de versiones de llama.cpp, servidores de inferencia ligeros o wrappers como llama-cpp-python antes de adoptar un modelo mayor.
- Evaluación comparativa de formatos: investigadores que midan perplejidad o latencia entre Q4_K_M, Q5_K_M e IQ4_XS pueden usar este repositorio como banco de pruebas controlado.
- Prototipado offline: al caber en 2,2 GB el conjunto del repositorio, es viable descargarlo y ejecutarlo en entornos aislados sin conexión, útil para demos locales de generación de texto.
- Filtrado o clasificación de texto de baja exigencia: si el modelo base rinde aceptablemente, las variantes Q4_K_S o Q5_K_S podrían usarse para tareas simples de etiquetado o resumen en entornos con recursos muy limitados, siempre tras validación empírica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el recuento de 668 millones de parámetros, F16 requeriría aproximadamente 1,3-1,5 GB de pesos, Q8_0 en torno a 0,7-0,8 GB y Q4_K_M alrededor de 0,4-0,5 GB, sin contar overhead de contexto ni caché KV.
- GPU recomendadas: no disponibles. Por tamaño, cualquier GPU consumer con 4 GB o más de VRAM podría alojar las variantes cuantizadas; una RTX 3060, RTX 4060 o superior sería suficiente, pero no hay validación publicada.
- Cabe en GPU consumer: probablemente sí en la mayoría de tarjetas con 4 GB o más, dado el tamaño reducido de los pesos cuantizados, aunque no hay confirmación del autor.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, y servidores compatibles con GGUF como text-generation-webui. vLLM y TGI no soportan GGUF de forma nativa para este formato, por lo que no se recomiendan.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre el modelo base ni de benchmarks que permitan compararlo con alternativas de tamaño similar (por ejemplo, Qwen2.5-0.5B, SmolLM2-360M o Llama-3.2-1B). La discrepancia entre el nombre "3B" y los 668 millones de parámetros reales impide además establecer una categoría de comparación fiable.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| RadarMind-3B-GGUF | 668.684.288 (según repo) | no disponible | no disponible | GGUF | Hugging Face |
| Alternativas de ~0,5-1B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Discrepancia crítica entre el nombre "3B" y los 668.684.288 parámetros reportados: no se debe asumir que el modelo tiene 3 mil millones de parámetros sin verificación adicional.
- Ausencia total de model card descriptiva: no hay información sobre arquitectura, entrenamiento, idiomas, sesgos ni evaluación.
- Licencia no especificada: no se puede garantizar el uso comercial. Es imprescindible contactar con el autor del modelo base (`zhtstar/RadarMind-3B`) antes de cualquier despliegue en producción.
- Riesgo elevado de alucinación y baja calidad esperable en cuantizaciones Q2_K e IQ4_XS, especialmente en tareas de razonamiento o código.
- Fecha de creación anómala (2026) que sugiere posibles errores de metadatos o un repositorio de procedencia dudosa; conviene verificar la integridad de los archivos antes de usarlos.
- Cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria ni reportes de uso que respalden el funcionamiento del modelo.
- Sin información sobre sesgos conocidos, limitaciones de contexto o comportamiento multilingüe; cualquier uso en producción requiere una evaluación empírica propia.
- Al ser una conversión de terceros, no hay garantía de que las cuantizaciones preserven fielmente el comportamiento del modelo original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/RadarMind-3B-GGUF
- Modelo base: https://huggingface.co/zhtstar/RadarMind-3B
