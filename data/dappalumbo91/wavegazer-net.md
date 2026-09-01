# dappalumbo91/Wavegazer-Net

## Resumen

Wavegazer-Net es un modelo de segmentación de imágenes biomédicas desarrollado por Damian Palumbo (usuario `dappalumbo91`), diseñado para la detección de células y el cálculo de centroides celulares. Se presenta como una arquitectura tipo U-Net con un enfoque "seed-derived visual U" basado en la teoría FSOT (Fluid Spacetime Omni-Theory), aunque el autor aclara explícitamente que no se trata de FlowNet. La característica más destacada es que afirma tener **cero pesos entrenables** en la columna vertebral, utilizando kernels de codones congelados que se cargan junto con el módulo.

El modelo está orientado a tareas de segmentación y detección de puntos (centroides) en imágenes de microscopía, con un protocolo de detección a 7 µm según el estándar Biohub. Se distribuye bajo licencia Apache 2.0 y está implementado en PyTorch. Aunque el repositorio tiene un tamaño de 0.0 GB y no se especifican parámetros ni contexto, el código fuente está disponible en GitHub. Su relevancia radica en proponer una alternativa sin entrenamiento (closed-form) para la segmentación celular, aunque el propio autor admite que un U-Net entrenado supera a este modelo en discos sintéticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con kernels de codones congelados (FSOT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (safetensors no confirmado; se menciona `wavegazer_buffers.pt`) |

## Arquitectura y entrenamiento

La arquitectura se describe como un "seed-derived visual U" basado en FSOT, una teoría unificada especulativa que modela el universo como un fluido dinámico. En la práctica, se trata de una red tipo U-Net con una columna vertebral congelada (zero trainable weights) que utiliza kernels derivados de codones. El autor indica que los kernels se cargan automáticamente con el módulo y que existe un archivo opcional `wavegazer_buffers.pt` con los mismos buffers serializados.

No se proporcionan detalles sobre el proceso de entrenamiento, el número de tokens (no aplica), la composición del dataset ni el uso de técnicas como RLHF o DPO. El modelo se presenta como una solución de forma cerrada (closed-form) que no requiere ajuste de pesos, lo que sugiere que los kernels están predefinidos por la teoría FSOT y no aprendidos a partir de datos. Esta característica es inusual y no está respaldada por documentación adicional en la información disponible.

## Capacidades

- Segmentación de imágenes biomédicas, especialmente células, a partir de imágenes de entrada de un solo canal (in_channels=1) y salida de dos clases (n_classes=2).
- Detección de centroides celulares mediante el método `net.detect(x)`, que sigue el protocolo Biohub a 7 µm.
- Inferencia en modo "sparse" (activado por defecto) que devuelve picos o centroides, además de la salida densa de logits.
- Funcionamiento zero-shot: no requiere entrenamiento adicional ni ajuste de pesos para nuevas imágenes.
- Soporte para entrada de tamaño 256x256 píxeles, aunque podría adaptarse a otras resoluciones (no confirmado).
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje.

## Casos de uso

- **Detección de células en imágenes de microscopía**: el modelo puede localizar centroides celulares en volúmenes de imagen YX, siguiendo el protocolo Biohub a 7 µm, lo que es útil para estudios de migración celular o conteo automatizado.
- **Segmentación preliminar en pipelines de análisis biomédico**: al ser zero-shot y sin entrenamiento, puede servir como paso inicial rápido para identificar regiones celulares antes de aplicar métodos más refinados.
- **Validación de algoritmos de segmentación**: dado que el autor proporciona resultados comparativos (aunque limitados), puede usarse como referencia de línea base en experimentos de segmentación celular.
- **Prototipado de sistemas de análisis de imágenes**: su implementación sencilla en PyTorch permite integrarlo en entornos de investigación sin necesidad de GPUs potentes (tamaño de entrada pequeño).
- **Educación e investigación en arquitecturas alternativas**: su enfoque basado en FSOT puede interesar a investigadores que exploran modelos sin entrenamiento o teorías unificadas aplicadas a visión por computador.
- **Detección de eventos en secuencias de imágenes**: aunque no se menciona explícitamente, la detección de centroides podría aplicarse a seguimiento de células en time-lapse, siempre que se combine con un módulo de asociación (el autor indica "detect gate first, linking later").

## Benchmarks y rendimiento

El autor proporciona resultados "honestos" en la model card, aunque sin cifras detalladas:

| Prueba | Resultado |
|---|---|
| Test unitario de cuadrado denso | Dice > 0.7 |
| Discos sintéticos vs U-Net entrenado | U-Net entrenado gana (Wavegazer es closed-form) |
| Detección Biohub @ 7 µm (16 volúmenes, YX) | Resultados en `artifacts/biohub_peaks_7um.json` (no disponibles en la información) |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ya que se trata de un modelo de visión. El autor advierte explícitamente que no se debe reclamar un rendimiento tipo CellMot 0.848.

## Requisitos de hardware

- **VRAM estimada**: no disponible. Dado el tamaño de entrada (256x256) y la arquitectura U-Net, es probable que quepa en GPUs con 4-8 GB de VRAM, pero no hay confirmación oficial.
- **GPU recomendadas**: no disponible. Al ser un modelo pequeño, podría ejecutarse en GPUs consumer como RTX 3060 o superiores, pero no se especifica.
- **Compatibilidad con consumer GPU**: probablemente sí, dado el bajo coste computacional de una entrada 256x256, pero no confirmado.
- **Opciones de despliegue**: el código está en PyTorch, por lo que puede usarse con `torch` directamente. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (estas son para modelos de lenguaje).
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa con otros modelos de segmentación celular. El autor menciona que un U-Net entrenado supera a Wavegazer en discos sintéticos, lo que sugiere que los modelos supervisados convencionales (como U-Net estándar, Cellpose o StarDist) tendrían mejor rendimiento en tareas específicas. Sin embargo, no se proporcionan métricas cuantitativas de estos modelos comparables. Por tanto, la comparativa se limita a la observación cualitativa del propio autor.

## Limitaciones y advertencias

- **Rendimiento inferior a modelos entrenados**: el autor admite que un U-Net entrenado supera a Wavegazer en discos sintéticos, lo que indica que no es competitivo frente a métodos supervisados en tareas estándar.
- **Naturaleza especulativa de FSOT**: la base teórica (Fluid Spacetime Omni-Theory) no es un marco reconocido en la comunidad de visión por computador, lo que puede dificultar la reproducibilidad y la aceptación académica.
- **Falta de documentación técnica**: no se especifican parámetros, arquitectura detallada, datos de entrenamiento ni procedencia de los kernels de codones, lo que limita su uso en producción.
- **Alcance limitado**: solo se ha probado en detección de centroides a 7 µm y en un test unitario de cuadrado denso; no hay evidencia de generalización a otros tipos de imágenes o dominios.
- **Riesgo de alucinación en detección**: al ser un modelo sin entrenamiento, podría generar falsos positivos o negativos en imágenes complejas, aunque no hay datos cuantitativos al respecto.
- **Licencia**: Apache 2.0 permite uso comercial, pero al no haber documentación clara sobre los pesos y su origen, podría haber problemas de atribución o propiedad intelectual.
- **Sin soporte para otros formatos**: no se ofrecen pesos en GGUF, ONNX u otros formatos, lo que limita su despliegue en entornos no PyTorch.

## Enlaces

- [Hugging Face: dappalumbo91/Wavegazer-Net](https://huggingface.co/dappalumbo91/Wavegazer-Net)
- [GitHub: dappalumbo91/Wavegazer-Net](https://github.com/dappalumbo91/Wavegazer-Net) (referenciado en la model card, aunque no se ha verificado el enlace directo)
- [Perfil de Hugging Face del autor](https://huggingface.co/dappalumbo91)
- [Repositorios de GitHub del autor](https://github.com/dappalumbo91?tab=repositories)
