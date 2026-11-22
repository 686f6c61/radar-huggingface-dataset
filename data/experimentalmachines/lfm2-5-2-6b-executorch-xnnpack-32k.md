# experimentalmachines/LFM2.5-2.6B-ExecuTorch-XNNPACK-32k

## Resumen

LFM2.5-2.6B-ExecuTorch-XNNPACK-32k es una exportación del modelo LiquidAI/LFM2.5-2.6B (revisión `654f9463ce32`) realizada por el usuario experimentalmachines, empaquetada en formato ExecuTorch 1.4.0 para inferencia en dispositivo. El repositorio contiene múltiples variantes del mismo modelo con ventanas de contexto fijas (desde 2.048 hasta 32.768 tokens) y dos backends distintos: XNNPACK sobre CPU arm64 y MediaTek NeuroPilot para el SoC MT6991 (Dimensity 9400). No se trata de un modelo nuevo, sino de una distribución optimizada del modelo base de LiquidAI para ejecución local en Android.

El interés de esta ficha reside en su carácter práctico: es una de las pocas distribuciones públicas que ofrece pesos en formato `.pte` listos para ExecuTorch con cuantización GPTQ de 8 bits por canal (8da4w) y ventanas de contexto configurables, lo que permite desplegar un modelo de 2.600 millones de parámetros en teléfonos de gama alta sin conexión a red. El tamaño del artefacto XNNPACK ronda los 1,8 GB, y el del backend MediaTek se reparte en tres fragmentos de entre 0,84 y 1,10 GB.

La relevancia actual es doble: por un lado, valida el flujo de exportación de modelos LiquidAI a ExecuTorch; por otro, demuestra que un transformer de 2,6B puede caber en el presupuesto de memoria de un móvil (el autor estima un límite de 5 GB por dispositivo). El repositorio acumula 689 descargas y no tiene likes, lo que sugiere un uso instrumental más que comunitario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LiquidAI/LFM2.5-2.6B), exportado a ExecuTorch |
| Parámetros totales | 2.600 millones (según nombre del modelo base) |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | 2.048, 4.096, 8.192, 16.384 o 32.768 tokens (ventana fija por archivo) |
| Tipos de cuantización | XNNPACK: 8da4w GPTQ; MediaTek: a16w8 (activaciones 16 bits, pesos 8 bits) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | `.pte` (ExecuTorch); tokenizer en `tokenizer.json`; embedding en `.bin` fp32 para MediaTek |

## Arquitectura y entrenamiento

El modelo subyacente es LiquidAI/LFM2.5-2.6B, un transformer de 2,6B parámetros desarrollado por LiquidAI. La información proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron fases de RLHF o DPO. Tampoco se especifica si la arquitectura incorpora innovaciones propias de la familia LFM (como atención lineal o capas híbridas); la model card del exportador se limita a describir el proceso de exportación, no el diseño interno del modelo base.

La innovación técnica de esta distribución está en el pipeline de exportación. Para XNNPACK se aplica cuantización GPTQ de 8 bits con grupo de 4 (8da4w), lo que reduce el peso a ~1,8 GB manteniendo las activaciones en precisión superior. Para MediaTek NeuroPilot se usa un esquema a16w8 y el modelo se fragmenta en tres archivos por ventana, además de una tabla de embeddings fp32 compartida que el runner lee desde disco. La caché KV se reserva completa en el momento de carga: 32.768 bytes por token en fp32, es decir, 1.073.741.824 bytes para la ventana de 32k. Cada archivo `.pte` incorpora metadatos de exportación en `export-report-<window>.json` y un `config.json` con la estimación `fits_phone_budget` contra un presupuesto de 5 GB.

## Capacidades

- Generación de texto autoregresiva en inglés (idioma no confirmado explícitamente; el smoke test produce "Paris").
- Inferencia completamente local en Android, sin necesidad de conectividad.
- Soporte de ventanas de contexto largas de hasta 32.768 tokens en CPU arm64 (variante XNNPACK).
- Ejecución acelerada en NPU MediaTek Dimensity 9400 mediante NeuroPilot (ventanas de 512 a 8.192 tokens).
- Compatibilidad con la aplicación openweights para Android y con cualquier runtime ExecuTorch 1.4.0.
- Tool calling, function calling, agentes multi-paso, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistentes de texto sin conexión en Android: el modelo se integra mediante la app openweights o un runtime ExecuTorch propio, permitiendo generar respuestas en el dispositivo sin enviar datos a la nube. La variante de 8k ofrece contexto suficiente para conversaciones multi-turno moderadas.
- Procesamiento de documentos en el móvil: con la ventana de 32k se pueden resumir o extraer información de correos, notas o contratos de varias páginas sin salir del terminal, usando la variante XNNPACK de 1,81 GB.
- Clasificación y etiquetado de texto local: el modelo puede emplearse para categorizar tickets, reseñas o mensajes en aplicaciones de productividad, evitando costes de API y cumpliendo requisitos de privacidad.
- Prototipado de funciones de escritura asistida: autocompletado, reescritura o generación de borradores en editores móviles, con latencia aceptable gracias a la cuantización 8da4w y al backend XNNPACK.
- Evaluación de pipelines ExecuTorch: el repositorio sirve como referencia para ingenieros que quieran medir el rendimiento de un transformer de 2,6B en CPU arm64 o en NPU MediaTek, con informes de exportación incluidos por ventana.
- Despliegue en dispositivos MediaTek de gama alta: la variante NeuroPilot para MT6991 permite aprovechar la NPU del Dimensity 9400 en tareas de generación de texto con ventanas de hasta 8k, reduciendo el consumo energético frente a CPU.
- Investigación sobre cuantización en dispositivo: los artefactos permiten comparar 8da4w GPTQ (XNNPACK) frente a a16w8 (NeuroPilot) en términos de tamaño, ventana y precisión, aunque el autor no publica métricas de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de validación es un smoke test que comprueba que las variantes XNNPACK generan la palabra "Paris" ante una entrada no especificada. Las variantes MediaTek solo han sido verificadas estructuralmente, sin runtime NPU en el host de exportación.

## Requisitos de hardware

- VRAM/RAM estimada: los artefactos XNNPACK ocupan entre 1,78 GB (2k) y 1,81 GB (32k) en disco; a ello se suma la caché KV reservada al cargar, que va de 67 MB (2k) a 1.073 MB (32k) en fp32.
- Presupuesto de dispositivo: el autor estima un límite de 5 GB por teléfono (`fits_phone_budget` en cada `config.json`); las variantes de 32k se acercan a ese techo al sumar pesos y caché.
- GPU recomendadas: no aplica; el backend XNNPACK es CPU arm64 y el backend MediaTek requiere la NPU del MT6991 (Dimensity 9400).
- ¿Cabe en GPU de consumo? No es el objetivo del repositorio; no hay variantes CUDA ni Metal.
- Opciones de despliegue: runtime ExecuTorch 1.4.0, aplicación openweights para Android, y el runner NeuroPilot de MediaTek para el backend NPU.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-2.6B-ExecuTorch-XNNPACK-32k (este) | 2,6B | 2k–32k (fijo por archivo) | `.pte` ExecuTorch | lfm1.0 | Hugging Face, 689 descargas |
| LiquidAI/LFM2.5-2.6B (base) | 2,6B | no disponible | safetensors (presumible) | lfm1.0 | Hugging Face |
| Alternativas de tamaño similar para dispositivo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre este export y el modelo base ni con otras distribuciones on-device, por lo que la comparativa se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- La licencia lfm1.0 ("other" en Hugging Face) impone condiciones específicas de LiquidAI; es necesario revisar el archivo `LICENSE` antes de cualquier uso comercial.
- No hay información sobre sesgos, idiomas soportados ni calidad de alineación del modelo base en la documentación proporcionada.
- Riesgo de alucinación inherente a un modelo de 2,6B; no se han publicado evaluaciones de fidelidad.
- La ventana de contexto es fija por archivo y la caché KV se reserva completa al cargar, por lo que elegir una ventana grande reduce la memoria disponible para el resto de la aplicación.
- Las variantes MediaTek no han sido probadas en runtime real (solo verificación estructural), lo que introduce incertidumbre sobre su funcionamiento en dispositivo.
- El repositorio pesa 24,4 GB en total; la descarga completa no es necesaria si solo se usa una variante.
- El smoke test se limita a una comprobación trivial ("Paris"); no garantiza calidad generativa.
- No se especifican requisitos de versión mínima de Android ni de firmware MediaTek más allá de ExecuTorch 1.4.0.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/experimentalmachines/LFM2.5-2.6B-ExecuTorch-XNNPACK-32k
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Aplicación openweights: https://github.com/alpharomercoma/openweights
- ExecuTorch: no disponible en la información proporcionada (se cita la versión 1.4.0 sin enlace)
- Paper, blog o demo del modelo base: no disponibles en la información proporcionada
