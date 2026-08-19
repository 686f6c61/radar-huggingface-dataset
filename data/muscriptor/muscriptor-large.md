# MuScriptor/muscriptor-large

## Resumen

MuScriptor-large es un modelo de transcripción automática de música multi-instrumento (AMT) de código abierto, desarrollado por Kyutai y Mirelo. Convierte una grabación musical de cualquier género, con múltiples instrumentos simultáneos, en un flujo de notas (MIDI) separado por pistas instrumentales. Es el primer modelo de transcripción musical entrenado a gran escala con 170 000 canciones, abarcando desde música clásica hasta heavy metal.

La variante large, con aproximadamente 1 300 millones de parámetros, es el checkpoint de mayor calidad de la familia MuScriptor. El modelo representa la transcripción como una tarea de modelado de lenguaje basado en tokens, lo que le permite aprovechar arquitecturas transformer estándar. Incluye una innovación clave: el condicionamiento por presencia de instrumentos, que permite personalizar la transcripción según qué instrumentos se desea extraer.

Su relevancia actual radica en que es uno de los pocos modelos abiertos capaces de transcribir mezclas completas de audio real en pistas MIDI separadas, con aplicaciones directas en producción musical, educación, investigación musicológica y restauración de archivos. La licencia CC-BY-NC-4.0 limita su uso comercial, pero permite investigación y desarrollo no comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo de lenguaje sobre tokens de audio) |
| Parametros totales | ≈1.3B (1300 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, posiblemente FP16/BF16) |
| Idiomas soportados | no aplica (procesa audio musical, no texto) |
| Licencia | CC-BY-NC-4.0 (uso no comercial) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MuScriptor-large se basa en una arquitectura transformer que trata la transcripción musical como una tarea de modelado de lenguaje: el audio de entrada se convierte en una secuencia de tokens (probablemente mediante un codificador de audio, aunque no se especifica en la información disponible) y el modelo genera tokens que representan notas, tiempos e instrumentos. El entrenamiento se realizó sobre un dataset de 170 000 canciones de diversos géneros, desde música clásica hasta heavy metal, lo que le confiere una gran generalización a estilos musicales variados.

Una innovación destacada es el condicionamiento por presencia de instrumentos: el modelo puede recibir una indicación de qué instrumentos están presentes en la mezcla (voz, batería, bajo, teclados, otros) y ajustar la transcripción en consecuencia. Esto permite extraer selectivamente pistas individuales o mejorar la precisión en mezclas complejas. No se han publicado detalles sobre el proceso de entrenamiento (número de tokens, uso de RLHF o DPO, etc.) en la información disponible.

## Capacidades

- Transcripción automática multi-instrumento: convierte una grabación de audio completa en pistas MIDI separadas para voz, batería, bajo, teclados y otros instrumentos.
- Manejo de mezclas complejas: funciona con grabaciones reales donde suenan varios instrumentos simultáneamente, no solo con pistas aisladas.
- Condicionamiento por instrumentos: permite especificar qué instrumentos se esperan en la entrada para mejorar la precisión y personalizar la salida.
- Generalización a géneros diversos: entrenado con 170 000 canciones que abarcan desde música clásica hasta heavy metal, lo que le permite transcribir estilos muy variados.
- Salida en formato MIDI: genera una representación simbólica de notas, tiempos y dinámicas, lista para usar en DAWs o software de notación.
- Modelo de lenguaje sobre tokens: aprovecha técnicas de modelado de secuencias para representar la transcripción, lo que facilita su integración con otros sistemas basados en transformers.

## Casos de uso

- Producción musical y remezcla: un productor puede separar una canción existente en pistas MIDI para rearmonizarla, cambiar instrumentos o crear versiones karaoke. MuScriptor-large permite extraer cada instrumento por separado con alta fidelidad, incluso en mezclas densas.
- Educación musical: los estudiantes pueden cargar una grabación de una pieza y obtener la partitura en MIDI para estudiar cada parte instrumental, facilitando el análisis y la práctica.
- Investigación musicológica: los investigadores pueden transcribir automáticamente grandes corpus de grabaciones históricas o contemporáneas para análisis comparativos, sin necesidad de transcripción manual.
- Restauración de archivos: en archivos sonoros antiguos o grabaciones de baja calidad, el modelo puede ayudar a reconstruir la notación musical, aunque la calidad dependerá de la claridad del audio original.
- Creación de contenido accesible: generar partituras o archivos MIDI a partir de audio para personas con discapacidad visual o para su uso en sistemas de notación braille.
- Desarrollo de herramientas de música asistida por IA: integrar MuScriptor-large en aplicaciones que necesiten convertir audio a MIDI en tiempo real o por lotes, como plugins de DAW o servicios web de transcripción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos numéricos sobre métricas como precisión de transcripción, tasa de error de notas o comparación con otros modelos en la documentación consultada.

## Requisitos de hardware

- No se dispone de información oficial sobre requisitos de hardware específicos para MuScriptor-large.
- Dado su tamaño de ≈1.3B parámetros, se estima que la inferencia en FP16 requiere al menos 8-10 GB de VRAM, por lo que podría ejecutarse en GPUs de consumo como una RTX 3080 o superior, aunque no está confirmado.
- Para despliegue en producción, se recomendaría una GPU con 16 GB o más de VRAM (por ejemplo, RTX 4090, A100, H100) para manejar lotes y contextos largos.
- No se han publicado opciones de despliegue específicas (vLLM, llama.cpp, etc.). Al ser un modelo de audio, probablemente se use con la librería `muscriptor` mencionada en HuggingFace, pero no hay documentación adicional.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de transcripción musical en la información proporcionada. Existen alternativas como Basic Pitch de Spotify o MT3 de Google, pero no se han encontrado comparaciones cuantitativas con MuScriptor-large en las fuentes consultadas. Se recomienda consultar la documentación oficial para futuras actualizaciones.

## Limitaciones y advertencias

- Licencia CC-BY-NC-4.0: el uso comercial está prohibido sin permiso explícito de los autores. Esto limita su aplicación en productos o servicios comerciales.
- Posibles sesgos en el entrenamiento: aunque el dataset cubre muchos géneros, puede haber infrarrepresentación de ciertos estilos musicales o culturas, lo que podría afectar la precisión en esos casos.
- Riesgo de alucinación: como todo modelo generativo, puede producir notas o eventos que no están presentes en el audio original, especialmente en mezclas muy densas o con baja calidad de grabación.
- Limitaciones de contexto: no se ha especificado la longitud máxima de audio que puede procesar de una vez; es posible que necesite segmentación para piezas largas.
- Dependencia de la calidad del audio: la transcripción será menos precisa con grabaciones ruidosas, con mucha reverberación o con instrumentos muy solapados.
- Sin soporte de idiomas: al ser un modelo de audio, no procesa texto, por lo que no aplica la multilingüidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MuScriptor/muscriptor-large
- Repositorio espejo en HuggingFace: https://huggingface.co/cocktailpeanut/muscriptor-large
- Código fuente en GitHub: https://github.com/muscriptor/muscriptor
- Página del proyecto: https://muscriptor.github.io/
- Ficha en "There's An AI For That": https://theresanaiforthat.com/model/muscriptor/
