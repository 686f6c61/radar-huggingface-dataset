# experimentalmachines/Qwen3-4B-ExecuTorch

## Resumen

Qwen3-4B-ExecuTorch es una exportación del modelo Qwen3-4B de Alibaba Qwen, publicada por el usuario experimentalmachines, empaquetada en el formato `.pte` de ExecuTorch para inferencia en dispositivo (on-device) sobre Android. El modelo base es un transformer denso de 4.000 millones de parámetros con capacidad de razonamiento (thinking mode) y soporte multilingüe, y aquí se distribuye cuantizado en el esquema 8da4w con GPTQ para los backends XNNPACK (CPU) y Vulkan (GPU), y en a16w8 para el backend MediaTek NeuroPilot. Está pensado para ejecutarse mediante la aplicación openweights para Android o cualquier runtime ExecuTorch 1.5.1.

La relevancia de este artefacto no está en el modelo en sí, sino en el empaquetado: ofrece ventanas de contexto fijas de 2k, 4k, 8k, 16k y 32k tokens, cada una como un fichero independiente, porque el runtime reserva la totalidad de la caché KV al cargar el modelo. Esto permite elegir el compromiso entre memoria y contexto según el dispositivo, con tamaños que van de 2,66 GB (XNNPACK 2k) a 3,61 GB (Vulkan 32k), y de 1,10 a 1,49 GB por fragmento en el caso del acelerador NPU de MediaTek.

El repositorio ocupa 86,2 GB e incluye además la tabla de embeddings en fp32 para el runner de NeuroPilot, el tokenizador original y los informes de exportación por cada ventana. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-4B), exportado a ExecuTorch `.pte` |
| Parámetros totales | 4.000 millones (modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048, 4.096, 8.192, 16.384 o 32.768 tokens según fichero; fija en el momento de la carga |
| Tipos de cuantización | 8da4w con GPTQ (XNNPACK y Vulkan); a16w8 (MediaTek NeuroPilot); embeddings en fp32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ExecuTorch `.pte` (más `tokenizer.json`, `config.json`, `export-report-<window>.json` y `Qwen3-4B-neuropilot-embedding-fp32.bin`) |

## Arquitectura y entrenamiento

El artefacto es una exportación, no un entrenamiento nuevo. El modelo subyacente es Qwen3-4B (revisión `1cfa9a720891`), un transformer denso de 4.000 millones de parámetros de la familia Qwen3, que incorpora modo de razonamiento explícito y cobertura multilingüe. Sobre ese modelo se aplica cuantización de pesos en dos variantes: 8da4w con GPTQ para los backends XNNPACK y Vulkan, y a16w8 para el backend MediaTek NeuroPilot. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens ni las etapas de alineación (RLHF/DPO) del modelo base.

La innovación técnica del repositorio está en el pipeline de exportación a ExecuTorch y en la gestión de memoria. Cada ventana de contexto se compila como un fichero `.pte` independiente, ya que el runtime reserva la caché KV completa en el momento de la carga: a 2.048 tokens son 294.912 bytes por token (603.979.776 bytes en total en fp32), y a 32.768 tokens son 9.663.676.416 bytes. El repositorio incluye tres backends: XNNPACK para CPU arm64 genérica, Vulkan para GPU arm64 y MediaTek NeuroPilot para el SoC MT6991 (Dimensity 9400), este último fragmentado en cuatro trozos (`chunk1of4` a `chunk4of4`) por ventana. Cada carpeta incorpora un `config.json` con el campo `fits_phone_budget`, que estima la viabilidad contra un presupuesto de 5 GB.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3-4B, incluido su modo de razonamiento (thinking mode).
- Generación de código y resolución de problemas matemáticos: capacidades propias del modelo base, no verificadas de forma independiente en esta exportación.
- Soporte multilingüe: el modelo base es multilingüe, aunque la lista concreta de idiomas no está disponible en esta ficha.
- Inferencia on-device: ejecución local en Android sin conexión a servicios remotos, mediante la app openweights o cualquier runtime ExecuTorch 1.5.1.
- Aceleración por hardware: CPU arm64 vía XNNPACK, GPU arm64 vía Vulkan y NPU MediaTek Dimensity 9400 vía NeuroPilot.
- Tool calling y comportamiento agéntico: no disponible en la información proporcionada para esta exportación concreta.
- Visión y audio: no disponibles (el modelo base es solo de texto).

## Casos de uso

- Asistentes de texto sin conexión en Android: el fichero XNNPACK de 2k (2,66 GB) permite integrar un generador de texto local en aplicaciones móviles que deben funcionar sin red, con una huella de memoria contenida.
- Resumen de documentos en el dispositivo: la ventana de 32k de Vulkan (3,61 GB) admite resumir documentos largos sin enviar datos a la nube, útil en contextos con requisitos de privacidad.
- Procesamiento por lotes en terminales arm64: el backend XNNPACK funciona en cualquier CPU arm64, lo que permite desplegar el modelo en dispositivos de borde distintos de Android.
- Prototipado de aplicaciones de IA generativa móvil: la app openweights y los informes de exportación incluidos facilitan probar el modelo y medir el ajuste de cada ventana al presupuesto de memoria del dispositivo.
- Aceleración en smartphones de gama alta: la variante NeuroPilot para Dimensity 9400 (fragmentos de 1,10 a 1,49 GB) está pensada para aprovechar la NPU del SoC y reducir el consumo energético frente a la CPU.
- Evaluación de pipelines ExecuTorch: los ficheros `.pte` y sus `export-report-<window>.json` sirven como referencia reproducible para validar exportaciones propias o comparar backends.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta una prueba de humo (smoke test) del backend XNNPACK, que devolvió la palabra "Paris" en las ventanas de 2k a 32k; las variantes Vulkan y MediaTek se limitaron a una comprobación estructural porque no había runtime NPU en el host de exportación.

## Requisitos de hardware

- Memoria para XNNPACK (CPU): ficheros de 2,66 GB (2k y 4k), 2,67 GB (8k), 2,69 GB (16k) y 2,72 GB (32k), más la caché KV completa reservada al cargar (de 0,60 GB a 9,66 GB en fp32 según ventana).
- Memoria para Vulkan (GPU): ficheros de 3,42 GB (2k), 3,43 GB (4k), 3,46 GB (8k), 3,51 GB (16k) y 3,61 GB (32k), más la misma caché KV.
- Memoria para MediaTek NeuroPilot: cuatro fragmentos por ventana, con un total de aproximadamente 4,79 GB a 2k (1,10 + 1,10 + 1,10 + 1,49 GB) y el mismo total a 4k, más la tabla de embeddings fp32.
- Hardware objetivo: dispositivos Android arm64; la ruta NeuroPilot requiere un SoC MediaTek MT6991 (Dimensity 9400). No se especifican GPU de escritorio (A100, H100, RTX 4090); este artefacto no está orientado a ellas.
- Ajuste a móvil: el `config.json` de cada carpeta incluye `fits_phone_budget`, una estimación contra un presupuesto de 5 GB. Las ventanas de 16k y 32k en XNNPACK superan ese presupuesto solo por la caché KV (4,83 GB y 9,66 GB respectivamente).
- Despliegue: runtime ExecuTorch 1.5.1 o la app openweights para Android. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son compatibles con el formato `.pte`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-ExecuTorch (este) | 4.000 M | 2k a 32k (fijo por fichero) | ExecuTorch `.pte`, Android arm64 | Apache 2.0 | Cuantizado 8da4w/a16w8; backends CPU, GPU y NPU MediaTek |
| Qwen/Qwen3-4B (original) | 4.000 M | no disponible en la información | safetensors, servidor o GPU | Apache 2.0 | Pesos sin cuantizar; no ejecutable directamente en ExecuTorch |
| Alternativas on-device de 3-4B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- La ventana de contexto es fija por fichero y la caché KV se reserva entera al cargar: no hay reducción dinámica de memoria y una ventana grande puede impedir la carga en dispositivos con poca RAM.
- Las variantes Vulkan y MediaTek NeuroPilot solo se validaron estructuralmente; no hay evidencia de ejecución correcta en la model card.
- El backend NeuroPilot está restringido al SoC MT6991 (Dimensity 9400); no es portable a otros chips.
- No se documentan sesgos, tasas de alucinación ni evaluación de calidad de la cuantización 8da4w/a16w8 frente al modelo original.
- La lista de idiomas soportados no está disponible; conviene verificar el comportamiento multilingüe antes de usarlo en producción.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base y conviene revisar sus términos adicionales.
- El tamaño del repositorio (86,2 GB) dificulta la descarga y el almacenamiento en entornos con recursos limitados.
- No hay benchmarks publicados que permitan comparar la calidad de esta exportación con el modelo original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/Qwen3-4B-ExecuTorch
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B/blob/main/LICENSE
- App openweights para Android: https://github.com/alpharomercoma/openweights
