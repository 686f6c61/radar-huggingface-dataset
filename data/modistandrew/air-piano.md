# ModistAndrew/AIR-Piano

## Resumen

AIR-Piano es un checkpoint de pesos preentrenados publicado por el usuario ModistAndrew en Hugging Face. El modelo convierte gestos de piano realizados sobre una superficie de mesa (*tabletop piano gestures*) en sonido, apoyándose en una alineación visual guiada por partitura (*score-guided visual alignment*). Se trata, por tanto, de un sistema multimodal de visión y audio orientado a la síntesis musical, no de un modelo de lenguaje.

El repositorio contiene un único fichero de pesos (`last.pt`) de aproximadamente 0,4 GB, etiquetado como `ours` en el contexto del proyecto. La model card remite al repositorio de código en GitHub y a los conjuntos de evaluación VSF-Piano y VSF-Tabletop, lo que sugiere un trabajo de investigación con pipeline de evaluación propio.

La relevancia del modelo es acotada y muy específica: se enmarca en la línea de investigación de *visual score following* (seguimiento visual de partitura) aplicado a la interpretación musical sin instrumento físico. La información pública disponible es mínima: no hay pipeline declarado, ni licencia, ni idiomas, ni datos de benchmarks en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (sistema multimodal de visión y audio para síntesis musical; detalles no publicados en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (checkpoint en punto flotante PyTorch, `last.pt`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`last.pt`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo. Por las etiquetas y la descripción, se trata de un sistema que combina procesamiento visual (para interpretar los gestos sobre la mesa y alinearlos con la partitura) con generación o síntesis de audio (para producir el sonido correspondiente). El mecanismo central descrito es la *alineación visual guiada por partitura*: el modelo usa la partitura como referencia para interpretar qué nota corresponde a cada gesto detectado.

No se especifican en la información disponible el número de tokens o ejemplos de entrenamiento, la composición del dataset, ni si se emplearon técnicas de refinamiento como RLHF o DPO (poco probables en este dominio). Tampoco se documentan innovaciones técnicas adicionales más allá del propio enfoque de alineación gesto-partitura. El checkpoint publicado corresponde a la variante denominada `ours` en el proyecto.

## Capacidades

- Conversión de gestos de piano sobre superficie de mesa en sonido.
- Alineación entre movimiento/gesto visual y partitura musical (*motion-score alignment*).
- Seguimiento visual de partitura (*visual score following*).
- Procesamiento multimodal de vídeo/visión y audio.
- Evaluación sobre los conjuntos VSF-Piano y VSF-Tabletop.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo de razonamiento (*thinking mode*), visión general o audio conversacional: no disponible.

## Casos de uso

- Investigación en interpretación musical sin instrumento físico: el modelo permite estudiar cómo traducir gestos sobre una mesa en notas, sirviendo de base para experimentos de interacción musical aumentada.
- Evaluación de sistemas de *visual score following*: útil como checkpoint de referencia para comparar métodos de alineación gesto-partitura sobre los datasets VSF-Piano y VSF-Tabletop.
- Prototipos de instalaciones artísticas interactivas: puede integrarse en instalaciones donde el público "toca" una mesa y se genera sonido de piano alineado con una partitura de referencia.
- Educación musical asistida: permite explorar herramientas que detecten gestos de digitación y los relacionen con la partitura, aunque requiere validación adicional.
- Reproducción de resultados académicos: al publicarse los pesos `last.pt` junto al código en GitHub, facilita la replicación de experimentos del proyecto AIR-Piano.
- Base para *fine-tuning* en dominios musicales específicos: al ser un checkpoint preentrenado en PyTorch, puede servir de punto de partida para adaptaciones a otros instrumentos o estilos, siempre que la licencia lo permita (actualmente no declarada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el checkpoint ocupa aproximadamente 0,4 GB en disco, por lo que la huella en memoria en FP32 sería del orden de esa magnitud más el coste del resto del pipeline (codificador visual, síntesis de audio), no cuantificado en la información disponible.
- GPU recomendadas: no disponible. Por el tamaño del checkpoint, es plausible que funcione en GPU de consumo, pero no hay datos oficiales que lo confirmen.
- ¿Cabe en GPU de consumo? No confirmado; el tamaño reducido de los pesos sugiere que sí, pero depende del pipeline completo.
- Opciones de despliegue: no se documentan (vLLM, llama.cpp, Ollama o TGI no aplican a este tipo de modelo); el despliegue se haría mediante PyTorch y el código del repositorio GitHub del proyecto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (síntesis musical a partir de gestos con alineación a partitura) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Información pública muy escasa: no hay licencia declarada, lo que impide confirmar si el uso comercial está permitido.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado con datos musicales concretos (VSF-Piano, VSF-Tabletop) puede generalizar mal fuera de ese dominio.
- Riesgo de errores en la alineación gesto-partitura y, por tanto, en las notas generadas; no hay métricas publicadas que lo cuantifiquen.
- Sin datos de benchmarks ni de evaluación independiente; el rendimiento real es desconocido.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No es un modelo de lenguaje: no debe evaluarse con métricas tipo MMLU, HumanEval o GSM8K.
- Para producción, es imprescindible revisar el código del repositorio GitHub y aclarar la licencia con el autor antes de cualquier uso.

## Enlaces

- Hugging Face: https://huggingface.co/ModistAndrew/AIR-Piano
- Código e instrucciones (GitHub): https://github.com/ModistAndrew/AIR-Piano
- Datasets de evaluación VSF-Piano y VSF-Tabletop: https://huggingface.co/datasets/ModistAndrew/VSF
