# shourabhji3/phi-noise

## Resumen

Φ-Noise es una implementación oficial de un método de acondicionamiento temporal para modelos de difusión de vídeo, publicado con el artículo arXiv 2605.24509. No se trata de un modelo entrenado desde cero, sino de una técnica *training-free* que manipula el ruido en el dominio de la frecuencia (mezclando componentes de fase y magnitud) para transferir movimiento y estructura entre un vídeo de referencia y la generación. El repositorio de Hugging Face, alojado por el usuario shourabhji3, contiene principalmente el código y los pesos auxiliares necesarios para integrar el método sobre la familia Wan2.2.

El método se apoya en los modelos base Wan-AI/Wan2.2-I2V-A14B y Wan-AI/Wan2.2-TI2V-5B, que actúan como generadores de vídeo subyacentes. Φ-Noise añade tres modos de uso: transferencia de movimiento imagen-a-vídeo (I2V), transferencia de movimiento texto-a-vídeo con condicionamiento estructural (T2V) y "Cut-n-Drag", una interfaz interactiva para controlar trayectorias y colocación espacial de objetos. Al no requerir reentrenamiento, la técnica es relevante para investigadores que quieran reutilizar modelos de difusión de vídeo existentes con control temporal preciso sin coste de ajuste fino.

El repositorio es pequeño (0,2 GB) y las descargas y likes registrados son cero en el momento de la consulta, lo que sugiere un proyecto de investigación reciente y poco difundido. La licencia es Apache 2.0 y el idioma declarado es inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Método de acondicionamiento sobre modelos de difusión de vídeo (Wan2.2 DiT); manipulación de ruido en dominio de frecuencia (FFT) |
| Parámetros totales | no disponible (depende del modelo base Wan2.2; el repo no declara un recuento propio) |
| Parámetros activos | no disponible (los modelos base Wan2.2 son MoE, pero el repo no especifica cifras) |
| Longitud de contexto | no disponible (condicionado por la longitud de clip del modelo base; los ejemplos usan 81 frames) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repo contiene código Python y utilidades; los pesos se cargan desde `--ckpt_dir` de Wan2.2) |

## Arquitectura y entrenamiento

Φ-Noise no entrena un modelo nuevo: es un método de inferencia que opera sobre un modelo de difusión de vídeo preentrenado (Wan2.2, basado en transformer de difusión, DiT). La innovación consiste en descomponer el ruido inicial mediante la transformada de Fourier (`torch.fft`) y mezclar selectivamente componentes de baja frecuencia espaciales o temporales entre el ruido objetivo y un vídeo de referencia. Las funciones clave son `freq_mix_temporal` y `freq_mix_spatial`, definidas en `phi_noise_utils.py`, y los parámetros `--pn_gamma` y `--pn_alpha` controlan la intensidad de la mezcla.

El repositorio incluye un fork del código oficial de Wan2.2 (`Wan2.2_phi-noise/`) con el script `generate.py` adaptado para integrar el método. No se proporcionan datos sobre el conjunto de entrenamiento, número de tokens, ni procesos de RLHF/DPO, ya que el método es training-free y hereda las capacidades del modelo base. La integración se ejecuta con `torch.distributed.run` sobre múltiples GPU y utiliza paralelismo Ulysses (`--ulysses_size`) y FSDP (`--dit_fsdp`) para escalar la inferencia.

## Capacidades

- Transferencia de movimiento imagen-a-vídeo (I2V Motion Transfer): genera un vídeo a partir de una imagen fija y un vídeo de referencia cuyo movimiento se transfiere.
- Transferencia de movimiento texto-a-vídeo con condicionamiento estructural (T2V Motion Transfer): combina un prompt textual con la estructura/movimiento de un vídeo de referencia.
- Cut-n-Drag: control interactivo del usuario sobre trayectorias de objetos y su colocación espacial en el vídeo generado.
- Manipulación de ruido en dominio de frecuencia mediante FFT, con control fino a través de los parámetros gamma y alpha.
- Integración con modelos de difusión de vídeo Wan2.2 (I2V-A14B y TI2V-5B).
- Soporte de prompts textuales en inglés para describir la escena y la cámara.
- Ejecución multi-GPU con paralelismo Ulysses y FSDP.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, visión general ni audio.

## Casos de uso

- Transferencia de movimiento en producción audiovisual: dado un vídeo de referencia con una coreografía o movimiento de cámara concreto, Φ-Noise permite aplicar ese movimiento a una imagen o escena nueva sin reentrenar el modelo, usando `--pn_task i2v_mt` y ajustando gamma/alpha.
- Previsualización de animaciones para storyboards: un animador puede partir de una imagen clave y un clip de referencia para generar un borrador animado con la trayectoria deseada, acelerando la iteración creativa.
- Control interactivo de trayectorias (Cut-n-Drag): en herramientas de edición, el usuario define el recorrido de objetos (por ejemplo, una bandada de pájaros) y el modelo respeta esa colocación espacial, útil para composición de escenas.
- Generación de vídeo con estructura de referencia en publicidad: a partir de un prompt textual y un vídeo de referencia con la composición deseada, se generan variaciones manteniendo la estructura, lo que facilita adaptar campañas a distintos productos.
- Investigación en control temporal de difusión: el código es modular (`freq_mix_temporal`, `freq_mix_spatial`) y puede integrarse en otros modelos de difusión de vídeo, sirviendo como base para experimentos académicos sobre acondicionamiento en frecuencia.
- Prototipado de efectos de cámara: el usuario puede fijar cámara estática o movimientos concretos mediante prompts y referencia, útil para pruebas de concepto en VFX sin pipeline de entrenamiento.
- Docencia y reproducción de resultados: al ser training-free y con licencia Apache 2.0, permite reproducir el artículo y estudiar la manipulación de ruido en frecuencia en entornos educativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; depende del modelo base Wan2.2 (A14B o 5B) y de la resolución. Los ejemplos usan resolución 832×480 y 20 pasos de muestreo.
- GPU recomendadas: los comandos de ejemplo usan 8 GPU en paralelo (`--nproc_per_node 8`, `--ulysses_size 8`), lo que sugiere despliegues multi-GPU tipo A100/H100 para el modelo A14B.
- Cabe en GPU consumer: no confirmado; el modelo base TI2V-5B podría ser más viable en consumer, pero no se aportan datos de VRAM.
- Opciones de despliegue: script propio `Wan2.2_phi-noise/generate.py` con `torch.distributed.run`, paralelismo Ulysses y FSDP; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusión de vídeo en este contexto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Φ-Noise (este repo) | Método training-free sobre Wan2.2 | no disponible (hereda del base) | no disponible (clips de 81 frames en ejemplos) | Apache 2.0 | Hugging Face, código en repo |
| Wan-AI/Wan2.2-I2V-A14B | Modelo de difusión de vídeo I2V | no disponible en la información | no disponible | no disponible en la información | Hugging Face |
| Wan-AI/Wan2.2-TI2V-5B | Modelo de difusión de vídeo T2V/I2V | no disponible en la información | no disponible | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El repositorio tiene cero descargas y cero likes, y fue creado en noviembre de 2026; es un proyecto de investigación sin validación comunitaria amplia.
- El método depende de los pesos y el código de Wan2.2; cualquier limitación del modelo base (sesgos, alucinación visual, artefactos temporales) se hereda.
- Solo se declara soporte de inglés; los prompts y la documentación están en inglés.
- No se proporcionan datos de benchmarks, VRAM ni latencia, lo que dificulta evaluar su idoneidad en producción.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia de los modelos base Wan2.2, que no se detalla en la información.
- El uso requiere clonar un fork específico de GitHub y configurar `PYTHONPATH` y checkpoints manualmente; no hay paquete pip ni integración con frameworks de despliegue estándar.
- Riesgo de alucinación y artefactos en la generación de vídeo no cuantificado en la información disponible.
- Los parámetros gamma y alpha requieren ajuste manual por tarea, lo que puede limitar la reproducibilidad sin experiencia previa.

## Enlaces

- Hugging Face: https://huggingface.co/shourabhji3/phi-noise
- Artículo arXiv: https://arxiv.org/abs/2605.24509
- PDF: https://arxiv.org/pdf/2605.24509
- Página web del proyecto: https://ofir1080.github.io/phi-noise/
- Repositorio del fork: https://github.com/ofir1080/Wan2.2_phi-noise
- Repositorio oficial de Wan2.2: https://github.com/Wan-Video/Wan2.2
- Instrucciones de instalación de Wan2.2: https://github.com/Wan-Video/Wan2.2/blob/main/INSTALL.md
- Modelo base I2V-A14B: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- Modelo base TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
