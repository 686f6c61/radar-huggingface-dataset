# HRSadeghi/demucs-onnx

## Resumen

El modelo `HRSadeghi/demucs-onnx` es una exportación a formato ONNX de los pesos de Demucs v4 (HTDemucs), el sistema de separación de fuentes musicales desarrollado por Meta. El autor, HRSadeghi, ha convertido los checkpoints originales de PyTorch a gráficos ONNX para que puedan ejecutarse sin depender de PyTorch, utilizando únicamente ONNX Runtime. Esto permite integrar la separación de stems (batería, bajo, voces y otros) en aplicaciones escritas en Python, C++, Rust, Java, C# o JavaScript, e incluso en el navegador mediante un Space de Hugging Face.

El repositorio contiene seis variantes del modelo: `htdemucs` (precisión completa), `htdemucs_fp16` (media precisión), `htdemucs_int8` (cuantizado para CPU), `htdemucs_6s` (seis stems, añade guitarra y piano), `htdemucs_ft` (un "bag" de cuatro redes afinadas para máxima calidad) y `hdemucs_mmi` (la versión v3 híbrida). Cada modelo se compone de un archivo `.onnx` con el grafo y un `.json` con los metadatos de stems, frecuencia de muestreo y parámetros STFT. El tamaño total del repositorio es de 1,5 GB, aunque cada modelo individual ocupa menos.

La relevancia de esta publicación radica en que elimina la barrera de PyTorch para desplegar Demucs en entornos de producción, ofreciendo un formato estándar y multiplataforma. Además, el grafo ONNX está recortado en el límite complejo: la STFT, la ISTFT y el solapamiento se ejecutan en código anfitrión, lo que simplifica la integración y optimiza el rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net convolucional híbrida (espectrograma/forma de onda) con transformadores (Hybrid Transformer Demucs) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de audio, no texto) |
| Tipos de cuantizacion | fp16, int8 (ademas de fp32) |
| Idiomas soportados | no disponible |
| Licencia | MIT para el codigo; pesos bajo CC BY-NC 4.0 (no comercial) para v3/v4 |
| Formato de pesos | ONNX (.onnx) con sidecar JSON |

## Arquitectura y entrenamiento

Demucs v4 (HTDemucs) es un modelo de separación de fuentes basado en una arquitectura U-Net convolucional inspirada en Wave-U-Net, pero con una innovación clave: combina el procesamiento en el dominio de la forma de onda con el dominio del espectrograma mediante transformadores. Esta arquitectura híbrida permite capturar tanto información temporal fina como dependencias de largo alcance, lo que mejora la calidad de separación frente a versiones anteriores.

En esta exportación a ONNX, el grafo incluye únicamente el codificador convolucional, el transformador y el decodificador convolucional. Las operaciones de STFT, ISTFT y overlap-add se realizan en el código anfitrión, fuera del grafo, lo que facilita la portabilidad y evita problemas de compatibilidad con operadores complejos. Los pesos originales provienen de Meta y fueron entrenados con datos musicales propios; no se han publicado detalles sobre el dataset ni el proceso de entrenamiento en la información disponible. No se menciona el uso de RLHF o DPO, ya que es un modelo de audio y no de lenguaje.

## Capacidades

- Separación de fuentes musicales en stems: batería, bajo, otros y voces (modelo `htdemucs` y variantes).
- Separación en seis stems: añade guitarra y piano (modelo `htdemucs_6s`).
- Ejecución sin PyTorch, únicamente con ONNX Runtime.
- Soporte de precisión mixta: fp32, fp16 e int8 (este último mucho más rápido en CPU).
- Modelo "bag" `htdemucs_ft` que combina cuatro redes afinadas para obtener la mejor calidad de separación.
- Compatibilidad multiplataforma: bindings oficiales para Python, C++, Rust, Java, C# y JavaScript.
- Posibilidad de ejecución en navegador mediante el Space de Hugging Face.
- El grafo ONNX está optimizado para inferencia, con STFT/ISTFT en código host.

## Casos de uso

- **Karaoke y extracción de voces**: separar la pista vocal de una canción para crear versiones instrumentales o pistas de acompañamiento. El modelo `htdemucs` es adecuado por su calidad de separación y su formato ONNX permite integrarlo en aplicaciones de escritorio o web.
- **Remezcla y producción musical**: aislar batería, bajo o instrumentos individuales para remezclar o samplear. Con `htdemucs_6s` se obtienen además guitarra y piano, lo que amplía las posibilidades creativas.
- **Análisis musical y transcripción**: extraer stems limpios para alimentar sistemas de transcripción automática, análisis armónico o detección de tempo. La salida en formato ONNX facilita su integración en pipelines de procesado de audio.
- **Aplicaciones de DJ en tiempo real**: gracias a la variante `htdemucs_int8`, que es mucho más rápida en CPU, se puede realizar separación en vivo con latencia aceptable, como se ha demostrado en proyectos como Mixxx.
- **Preprocesamiento para sistemas de recomendación**: separar componentes de audio para mejorar la clasificación de géneros o la detección de similitudes entre canciones, usando los stems como características adicionales.
- **Herramientas educativas y de accesibilidad**: aislar voces o instrumentos para facilitar el aprendizaje de canciones o la creación de subtítulos musicales. La portabilidad a múltiples lenguajes de programación permite construir aplicaciones educativas multiplataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas comparativas (como SDR, SI-SNR o MOS) en la model card ni en los resultados de búsqueda. Se recomienda consultar el repositorio original de Demucs para referencias de calidad, pero no se incluyen aquí por no estar disponibles en las fuentes citadas.

## Requisitos de hardware

- **VRAM estimada**: no disponible. El tamaño del repositorio es de 1,5 GB, pero cada modelo individual (`.onnx`) ocupa menos; se desconoce el peso exacto de cada grafo.
- **GPU recomendadas**: no especificadas. Dado que es un modelo de audio con arquitectura U-Net, puede ejecutarse en GPUs de consumo como RTX 3060 o superiores, pero no hay datos oficiales.
- **CPU**: la variante `htdemucs_int8` está diseñada para ejecutarse de forma eficiente en CPU, siendo "mucho más rápida" según la documentación, aunque no se aportan cifras concretas.
- **Opciones de despliegue**: ONNX Runtime (Python, C++, C#, Java, Rust, JavaScript), integración en navegador vía Space de Hugging Face, y bindings específicos del repositorio `demucs-onnx`.
- **Latencia y throughput**: no disponibles. Dependerán del hardware y de la variante elegida (fp32, fp16 o int8).

## Comparativa con modelos similares

| Modelo | Formato | Arquitectura | Stems | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `HRSadeghi/demucs-onnx` | ONNX | HTDemucs (U-Net + Transformer) | 4 o 6 | MIT (código) / CC BY-NC 4.0 (pesos) | Hugging Face, GitHub |
| Demucs original (PyTorch) | PyTorch | HTDemucs | 4 o 6 | CC BY-NC 4.0 | GitHub (adefossez/demucs) |
| `sevagh/demucs.onnx` | ONNX | HTDemucs | 4 | MIT (código) / CC BY-NC 4.0 (pesos) | GitHub |
| `MrCitron/demucs-v4-onnx` | ONNX | HTDemucs | 4 | no disponible | Hugging Face |

La comparativa se limita a aspectos estructurales, ya que no hay datos de rendimiento publicados. La principal diferencia entre `HRSadeghi/demucs-onnx` y `sevagh/demucs.onnx` es que el primero ofrece más variantes (fp16, int8, 6 stems, bag) y bindings para más lenguajes, mientras que el segundo se centra en C++ con ONNX Runtime. El modelo original de Meta sigue siendo la referencia en calidad, pero requiere PyTorch.

## Limitaciones y advertencias

- **Licencia de pesos no comercial**: los pesos de Demucs v3/v4 están bajo CC BY-NC 4.0, lo que prohíbe su uso en productos comerciales. El código de runtime es MIT, pero los pesos no. Es imprescindible revisar la licencia antes de integrar el modelo en una aplicación comercial.
- **Dependencia de código host**: el grafo ONNX no incluye STFT/ISTFT ni overlap-add; estos deben implementarse en el lenguaje anfitrión. Esto añade complejidad de integración y puede introducir errores si no se replican exactamente los parámetros del sidecar JSON.
- **Rendimiento variable**: la calidad de separación puede verse afectada por la cuantización (int8) o la precisión reducida (fp16). No se han publicado métricas comparativas entre variantes.
- **Sin soporte de otros idiomas**: al ser un modelo de audio, no aplica el concepto de idiomas; la etiqueta "idiomas" no está disponible.
- **Riesgo de alucinación**: no aplica, ya que no es un modelo generativo de texto. Sin embargo, la separación puede producir artefactos o pérdida de calidad en pistas con mucho ruido o mezclas complejas.
- **Tamaño del repositorio**: 1,5 GB en total, lo que puede ser un inconveniente para descargas en entornos con ancho de banda limitado, aunque cada modelo individual es más pequeño.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/HRSadeghi/demucs-onnx)
- [Repositorio GitHub demucs-onnx](https://github.com/HRSadeghi/demucs-onnx)
- [Space de Hugging Face para probar en el navegador](https://huggingface.co/spaces/HRSadeghi/demucs-onnx)
- [Repositorio original de Demucs (Meta)](https://github.com/adefossez/demucs)
- [Proyecto demucs.onnx de sevagh (C++)](https://github.com/sevagh/demucs.onnx)
- [Artículo de Mixxx sobre conversión de Demucs a ONNX](https://mixxx.org/news/2025-10-27-gsoc2025-demucs-to-onnx-dhunstack/)
- [Modelo alternativo MrCitron/demucs-v4-onnx](https://huggingface.co/MrCitron/demucs-v4-onnx)
