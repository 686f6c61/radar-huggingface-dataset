# kabing/gpt2-medium-cbctg-prior

## Resumen

`kabing/gpt2-medium-cbctg-prior` es un conjunto de módulos de control para generación de texto mediante *concept bottleneck* (CBCTG) sobre el modelo base GPT-2 Medium (355M). Fue desarrollado por Qi Bing y Xiaowei Shao como parte del artículo "The Illusion of Control: Why Bare Classifier Inversion Silently Fails in Concept-Bottleneck Text Generation", presentado en EMNLP 2026. El modelo aborda el problema de controlar atributos semánticos (cocina, género, sentimiento y tiempo verbal) en la generación de texto, proponiendo una solución basada en un *prior* post-hoc que evita la falla de la inversión directa de clasificadores.

Este repositorio contiene únicamente los parámetros entrenados por los autores: los MLP de codificación de conceptos por eje, las cabeceras clasificadoras, el inyector de conceptos, el adaptador LoRA y el *prior* de etiquetas. No se incluyen los pesos del modelo base, que deben descargarse por separado desde HuggingFace (`gpt2-medium`). El tamaño total del repositorio es de 0.5 GB, con dos directorios de checkpoint (`hold-out` y `acd`) correspondientes a diferentes configuraciones de evaluación. El modelo se distribuye bajo licencia MIT y está orientado a investigación, con cero descargas y cero "likes" en el momento de su publicación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 Medium (355M) con módulos de *concept bottleneck*: encoder MLPs por eje, cabeceras clasificadoras, inyector AdaLN, adaptador LoRA (rank 8, alpha 16) y *prior* de etiquetas post-hoc |
| Parámetros totales | No disponible (solo se especifica el modelo base: 355M; los módulos adicionales no se cuantifican) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la del modelo base GPT-2 Medium es 1024 tokens, pero no se indica en la documentación del repositorio) |
| Tipos de cuantización | No disponible (los archivos son `.pt`, no se especifican cuantizaciones) |
| Idiomas soportados | No disponible (se asume inglés por el modelo base, pero no se indica) |
| Licencia | MIT |
| Formato de pesos | No disponible (archivos `.pt` en el repositorio, no se especifica formato tipo safetensors o GGUF) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2 Medium como generador, al que se le añaden módulos de control *concept bottleneck*. El código de conceptos se compone de 4 ejes (cuisine, gender, sentiment, tense), cada uno con 32 dimensiones. Estos ejes son codificados por MLPs por eje y luego inyectados en cada bloque del transformer mediante una capa AdaLN (Adaptive Layer Normalization). El adaptador LoRA (rank 8, alpha 16) se aplica a las proyecciones de atención del modelo base para permitir el ajuste fino sin modificar los pesos originales. Además, se entrena un *prior* de etiquetas post-hoc `gγ` con una capa oculta de 128 unidades GELU, que se ajusta en menos de 30 segundos según la model card.

El entrenamiento se realizó sobre tres semillas, aunque no se detallan los datos de entrenamiento ni el proceso completo. El paper original (arXiv:2608.22956) describe la metodología y las comparaciones con los baselines CompMCTG, que utilizan GPT-2 Medium como backbone. El objetivo es demostrar que la inversión de clasificadores sin regularización falla en la generación controlada, y proponer el uso del *prior* de etiquetas como fuente de variables latentes más fiable.

## Capacidades

- Generación de texto controlada por conceptos: permite especificar valores en cuatro ejes (cocina, género, sentimiento, tiempo verbal) para influir en la salida del modelo.
- Inyección de conceptos mediante AdaLN en todos los bloques del transformer, lo que permite un control más fino que métodos de *prompt* o *conditioning* tradicionales.
- Soporte para tres protocolos de generación: `oracle` (usando el texto de referencia como fuente), `mode_b` (inversión de clasificadores) y `prior` (usando el *prior* de etiquetas post-hoc). Este último es el recomendado por los autores.
- No incluye capacidades de *tool calling*, razonamiento multi-paso, ni soporte para agentes.
- No se especifican capacidades multilingües; el modelo base GPT-2 Medium está entrenado principalmente en inglés.
- No incluye capacidades de visión, audio ni *thinking mode*.

## Casos de uso

- Investigación en generación controlada de texto: el modelo es adecuado para reproducir los experimentos del paper EMNLP 2026, permitiendo comparar métodos de inversión de clasificadores frente al uso de *priors* en el contexto de *concept bottleneck*.
- Estudio de atributos en reseñas: se puede usar para controlar el sentimiento, la cocina o el género en la generación de reseñas de restaurantes (el dataset Fyelp mencionado), útil para investigaciones en NLP.
- Análisis de la "ilusión de control": permite evaluar cómo la elección de la fuente de variables latentes (oracle, modo B, prior) afecta a la coherencia y al control efectivo del texto generado.
- Desarrollo de sistemas de generación con control interpretable: al desacoplar los conceptos en ejes discretos, se facilita la interpretación de qué atributos se están manipulando.
- Evaluación de adaptadores LoRA en tareas de generación condicionada: el repositorio incluye un adaptador LoRA independiente que puede ser reutilizado en otros experimentos de ajuste fino.
- Base para futuras investigaciones en generación controlada con *concept bottleneck*: los módulos entrenados pueden ser integrados en pipelines de investigación para explorar otras configuraciones de ejes o de arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper menciona una comparación con los baselines CompMCTG (Sección 7.1), pero no se proporcionan valores numéricos en la model card ni en el repositorio.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación del repositorio.
- Al ser un adaptador de GPT-2 Medium (355M), se espera que la inferencia sea ligera. Con una cuantización típica (por ejemplo, 8 bits) podría ejecutarse en GPU con 4 GB de VRAM, pero este dato no está confirmado por el autor.
- El repositorio no incluye los pesos base; es necesario descargar `gpt2-medium` por separado y cargarlos junto con los módulos.
- Para la reproducción de los experimentos, se recomienda un entorno con GPU (por ejemplo, una NVIDIA RTX 3060 o superior) y memoria suficiente para el modelo base y los módulos adicionales.
- Las opciones de despliegue son limitadas: el modelo se usa mediante el código de evaluación del repositorio de GitHub, no se proporcionan integraciones con vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables específicos en la información proporcionada. El paper menciona baselines CompMCTG, pero no se ofrecen datos concretos para comparar.

## Limitaciones y advertencias

- El repositorio no incluye los pesos del modelo base; es obligatorio descargar `gpt2-medium` por separado, lo que añade un paso adicional en la configuración.
- El modelo es un adaptador de investigación y no ha sido validado para uso en producción. No se garantiza su comportamiento en dominios fuera de los experimentos del paper.
- La generación controlada depende de la correcta elección de la fuente de variables (`z_source`). El uso del modo `mode_b` (inversión de clasificadores) puede producir resultados inconsistentes, como se discute en el paper.
- Los sesgos inherentes del modelo base GPT-2 (como estereotipos de género, cocina o sentimiento) pueden propagarse en la generación.
- El modelo puede presentar alucinaciones o incoherencias, especialmente cuando se usan conceptos no vistos en el entrenamiento (configuraciones "hold-out").
- La licencia MIT permite uso comercial, pero al depender de GPT-2 Medium (también MIT), no hay restricciones adicionales; sin embargo, el uso comercial no está garantizado en términos de calidad o soporte.
- No se especifican idiomas soportados; se asume inglés, pero no se ha verificado.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/kabing/gpt2-medium-cbctg-prior
- Paper arXiv: https://arxiv.org/abs/2608.22909 (según la model card; el ID es `2608.22956` en el código de citación, pero la URL usa `2608.22956`; se indica como `2608.22956` en la etiqueta del modelo)
- Repositorio de código: https://github.com/BiancaBing/cbctg-illusion-of-control
- Modelo base GPT-2 Medium: https://huggingface.co/gpt2-medium
