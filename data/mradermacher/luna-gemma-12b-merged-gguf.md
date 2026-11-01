# mradermacher/Luna-Gemma-12B-Merged-GGUF

## Resumen

Luna-Gemma-12B-Merged-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo wayzer2321/Luna-Gemma-12B-Merged, publicada por el usuario mradermacher. El modelo subyacente es un fine-tune fusionado (merge) construido sobre la familia Gemma, con 11.907.350.576 parámetros totales (aproximadamente 12B) y etiquetado internamente con el identificador "gemma4". Está orientado a conversación y declara soporte para ruso e inglés.

La relevancia de esta publicación es práctica: mradermacher genera y distribuye los ficheros GGUF necesarios para ejecutar el modelo en llama.cpp y entornos compatibles sin necesidad de infraestructura de GPU de datacenter. El repositorio incluye doce cuantizaciones distintas (desde Q2_K hasta Q8_0) más dos ficheros mmproj para el componente multimodal, lo que permite desplegar el modelo en un rango amplio de hardware.

No se dispone de información sobre el proceso de entrenamiento original, los datos utilizados, la longitud de contexto nativa ni resultados de benchmarks. La model card del repositorio es exclusivamente una ficha de cuantización generada automáticamente y no documenta las capacidades del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma, etiqueta interna "gemma4"); detalles no disponibles |
| Parametros totales | 11.907.350.576 (≈11,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, más mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | Gemma (términos de la licencia Gemma de Google) |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |
| Tamano del repo | 83,7 GB |
| Modelo base | wayzer2321/Luna-Gemma-12B-Merged |
| Libreria declarada | transformers |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta "gemma4" y la pertenencia a la familia Gemma. El modelo es un merge (fusión de pesos) realizado por wayzer2321 sobre el que se aplicó un fine-tune, según las etiquetas "fine-tune" y "merged". No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO.

La contribución técnica de este repositorio concreto es la cuantización estática a GGUF mediante la herramienta de mradermacher (quantize_version 2, output_tensor_quantised 1, convert_type hf). La model card indica explícitamente que no se han generado cuantizaciones ponderadas ni con imatrix en el momento de la publicación, y que podrían no llegar a publicarse. La presencia de ficheros mmproj (f16 y Q8_0) sugiere que el modelo base incorpora un componente multimodal, aunque no se documenta su naturaleza exacta.

## Capacidades

- Generación de texto conversacional en ruso e inglés, según los idiomas declarados.
- Posible soporte multimodal (visión) inferido de la existencia de ficheros mmproj, aunque no confirmado en la documentación.
- Ejecución local mediante llama.cpp y herramientas compatibles con GGUF.
- Compatibilidad declarada con endpoints (tag "endpoints_compatible").
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, modo thinking ni otras habilidades especiales.
- No se documentan capacidades de código o matemáticas de forma específica.

## Casos de uso

- Despliegue local en estaciones de trabajo: con la cuantización Q4_K_M (7,5 GB) el modelo puede ejecutarse en GPUs de consumo con 8 GB o más de VRAM, lo que permite prototipar asistentes conversacionales sin infraestructura cloud.
- Asistente conversacional en ruso: al declarar soporte para ruso, es adecuado para aplicaciones de chat orientadas a usuarios rusohablantes, aunque sin benchmarks que confirmen su calidad en ese idioma.
- Evaluación de fine-tunes comunitarios: sirve como banco de pruebas para comparar el comportamiento de un merge sobre Gemma frente al modelo base, usando distintas cuantizaciones para medir la degradación por compresión.
- Integración en pipelines de llama.cpp: los ficheros GGUF permiten incorporar el modelo en aplicaciones de escritorio, plugins de editores o servidores ligeros mediante la API compatible de llama.cpp.
- Experimentación académica con cuantizaciones: la disponibilidad de doce niveles de cuantización (de Q2_K a Q8_0) facilita estudios sobre el impacto de la compresión en la calidad de salida.
- Pruebas de capacidades multimodales: los ficheros mmproj permiten experimentar con entrada de imágenes en llama.cpp, si el modelo base efectivamente soporta visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ≈ 4,9 GB; Q3_K_S ≈ 5,6 GB; Q3_K_M ≈ 6,2 GB; Q3_K_L ≈ 6,7 GB; IQ4_XS ≈ 6,8 GB; Q4_K_S ≈ 7,1 GB; Q4_K_M ≈ 7,5 GB; Q5_K_S ≈ 8,4 GB; Q5_K_M ≈ 8,6 GB; Q6_K ≈ 9,9 GB; Q8_0 ≈ 12,8 GB. Añadir aproximadamente 0,2-0,3 GB si se usa el componente mmproj.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 para cuantizaciones Q5-Q8; GPUs de 8 GB (RTX 3070, RTX 4060) para Q3-Q4.
- Cabe en GPU de consumo: sí, con cuantizaciones Q4_K_M o inferiores en GPUs de 8 GB; Q8_0 requiere 16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama (mediante importación de GGUF), servidores compatibles con la API de llama.cpp, y cualquier runtime que soporte GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Luna-Gemma-12B-Merged-GGUF | ≈11,9B | no disponible | Gemma | GGUF | Este modelo; fine-tune comunitario sobre Gemma |
| Gemma 2 9B (Google) | 9B | 8K | Gemma | safetensors, GGUF | Modelo oficial de referencia de la familia |
| Gemma 2 27B (Google) | 27B | 8K | Gemma | safetensors, GGUF | Versión mayor de la misma familia |
| Mistral 7B / Mistral Nemo 12B | 7B / 12B | 32K / 128K | Apache 2.0 | safetensors, GGUF | Alternativa con licencia permisiva |

La comparación con Gemma 2 se basa en la pertenencia declarada a la familia Gemma; no se dispone de datos que confirmen la versión exacta del modelo base ni su rendimiento relativo.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones de calidad; se desconoce el rendimiento real del modelo frente a su base.
- La model card es una ficha de cuantización automática y no documenta sesgos, datos de entrenamiento ni comportamiento en producción.
- El modelo solo declara ruso e inglés; el rendimiento en castellano no está verificado y probablemente sea limitado.
- Riesgo de alucinación inherente a los modelos de lenguaje; sin datos específicos de mitigación.
- Licencia Gemma: impone restricciones de uso comercial y obligaciones de atribución según los términos de Google; es necesario revisarlos antes de un despliegue en producción.
- Al ser un merge comunitario sin documentación, no hay garantías sobre la procedencia de los pesos ni sobre la calidad del fine-tune.
- La longitud de contexto es desconocida; no debe asumirse la de Gemma 2 sin confirmación.
- Las cuantizaciones Q2_K y Q3_K_M se marcan como de menor calidad en la propia ficha; para producción se recomienda Q4_K_M o superior.
- No hay cuantizaciones imatrix ni ponderadas disponibles en el momento de la publicación, lo que puede reducir la calidad frente a alternativas optimizadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Luna-Gemma-12B-Merged-GGUF
- Modelo base: https://huggingface.co/wayzer2321/Luna-Gemma-12B-Merged
- Página de descargas del cuantizador: https://hf.tst.eu/model#Luna-Gemma-12B-Merged-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
