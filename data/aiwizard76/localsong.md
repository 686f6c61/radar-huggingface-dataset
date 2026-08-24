# AIWizard76/Localsong

## Resumen

Localsong es un modelo de generación de música condicionada por etiquetas, desarrollado por AIWizard76 y publicado en Hugging Face con licencia MIT. Está especializado en la creación de piezas instrumentales para videojuegos y anime, y genera fragmentos de 95 segundos de audio estéreo a partir de una o varias etiquetas descriptivas (de 1 a 8, aunque se recomienda empezar con una). El modelo combina un autoencoder de latencia SAME-L de Stability AI con un denoiser basado en un transformador de difusión (DiT) de 0,84 mil millones de parámetros, lo que lo hace relativamente ligero en comparación con otros generadores de música.

La relevancia de Localsong radica en su capacidad para ejecutarse localmente con hardware modesto (GPU, CPU o MPS) y en su licencia MIT, que permite un uso flexible, siempre que se respete la licencia comunitaria de Stability AI para los pesos del autoencoder. Su diseño incorpora innovaciones técnicas como la fusión dispersa-densa (SPRINT) y el flujo rectificado para el muestreo, lo que lo convierte en un ejemplo de generación de música eficiente y reproducible. Aunque no se han publicado resultados de benchmarks, su arquitectura y su enfoque en la generación de música instrumental lo posicionan como una alternativa viable para proyectos que necesiten música original sin depender de servicios en la nube.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AudioDiT: transformador de difusión 1-D con RMSNorm, QK-RMSNorm, RoPE, SwiGLU y adaLN-single; autoencoder SAME-L de Stability AI para latentes de audio |
| Parametros totales | 0,84 mil millones (denoiser) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 95 segundos de audio estéreo (latentes de 256×1024) |
| Tipos de cuantizacion | no disponible (no se mencionan cuantizaciones específicas) |
| Idiomas soportados | no disponible (el modelo genera audio, no texto; no aplica idiomas) |
| Licencia | MIT para el código y el modelo; los pesos del autoencoder SAME-L se rigen por la Stable Audio Community License de Stability AI |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se compone de un autoencoder SAME-L (de Stability AI) que convierte el audio en latentes de 256×1024, y un denoiser de tipo DiT (Transformer de difusión) de 0,84 mil millones de parámetros. El denoiser utiliza RMSNorm, QK-RMSNorm, RoPE y SwiGLU, con condicionamiento de paso temporal mediante adaLN-single (técnica de PixArt-α). Las etiquetas de entrada se incorporan mediante cross-attention.

La innovación principal es la fusión dispersa-densa (SPRINT, arXiv:2510.21986): los bloques se dividen en un codificador denso de 2 bloques, una pila central de 20 bloques y un decodificador denso de 2 bloques. Durante el entrenamiento, la pila central se ejecuta solo en un 25 % de los frames y a veces se elimina por completo, lo que permite que la ruta superficial (codificador → fusión → decodificador) actúe como un modelo débil pero funcional por sí solo. En inferencia, la pila central se aplica a todos los frames y la ruta superficial se usa como rama de guía (PDG). El muestreo se realiza mediante flujo rectificado (rectified flow) con 50 pasos de Euler y un factor de desplazamiento de 2, alternando entre CFG normal y guía por ruta superficial. No se han publicado datos sobre el conjunto de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO).

## Capacidades

- Generación de música instrumental de 95 segundos en estéreo, condicionada por 1 a 8 etiquetas descriptivas (por ejemplo, "épico", "triste", "juego de rol", "anime").
- Control de reproducción mediante semilla aleatoria fija (seed) para obtener resultados reproducibles.
- Ejecución local en GPU (CUDA), CPU o MPS (Apple Silicon) mediante el script `webui.py`.
- Generación de audio sin necesidad de texto libre; la entrada es un conjunto de etiquetas, lo que facilita la integración en sistemas de generación de música por parámetros.
- No incluye soporte para tool calling, agentes, razonamiento multi-paso ni procesamiento de texto; su única salida es audio.
- Capacidades multilingües: no aplica (el modelo no procesa texto natural, solo etiquetas).

## Casos de uso

- **Música de fondo para videojuegos independientes**: los desarrolladores pueden generar piezas instrumentales con etiquetas como "exploración" o "combate" para cubrir escenas concretas, gracias a la ventana de 95 segundos y la reproducibilidad con semilla.
- **Producción de música para anime y vídeo**: se pueden crear temas de apertura o fondo para proyectos audiovisuales, ajustando el estilo con etiquetas específicas (por ejemplo, "melancólico", "épico").
- **Prototipado rápido de composiciones**: artistas pueden generar variaciones de una idea musical cambiando la semilla o las etiquetas, acelerando el proceso creativo sin depender de DAW.
- **Educación musical y experimentación**: estudiantes de música o IA pueden analizar cómo las etiquetas condicionan la estructura generada, o usar el modelo para estudiar técnicas de difusión en audio.
- **Generación de contenido para streaming**: creadores de contenido pueden producir música de fondo para directos o vídeos de YouTube sin problemas de derechos de autor, gracias a la licencia MIT del modelo (sujeta a las restricciones del autoencoder).
- **Investigación en generación de audio**: investigadores pueden utilizar el modelo como referencia para comparar arquitecturas de difusión en el dominio del audio, gracias a su diseño ligero y la documentación de los componentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay tablas de comparación con otros modelos de generación de música en la model card ni en los resultados de búsqueda web proporcionados.

## Requisitos de hardware

- **VRAM estimada**: no disponible oficialmente. El tamaño del repositorio es de 10,1 GB, lo que sugiere que el modelo completo (denoiser + autoencoder) ocupa varios GB en memoria. Para una inferencia en fp16, el denoiser de 0,84 B parámetros requeriría aproximadamente 2 GB de VRAM, pero el autoencoder SAME-L puede aumentar el consumo total. Se recomienda al menos 8 GB de VRAM para una ejecución cómoda.
- **GPU recomendadas**: cualquier GPU con CUDA (por ejemplo, RTX 3060, RTX 4090, A100) con suficiente VRAM. También es compatible con MPS en Macs con chip Apple.
- **CPU**: el modelo puede ejecutarse en CPU, aunque la generación será más lenta. No hay datos de latencia.
- **Opciones de despliegue**: se proporciona un script `webui.py` que lanza una interfaz web en `http://127.0.0.1:7860`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No hay información sobre modelos comparables en los resultados de búsqueda ni en la documentación proporcionada. No se puede establecer una comparativa con otras alternativas de generación de música (como MusicGen de Meta o MusicLM de Google) sin datos de rendimiento o características específicas.

## Limitaciones y advertencias

- **Licencia del autoencoder**: aunque el modelo principal tiene licencia MIT, los pesos del autoencoder SAME-L se distribuyen bajo la Stable Audio Community License de Stability AI. Esto puede imponer restricciones adicionales para el uso comercial, especialmente si se redistribuyen los pesos o se usan en productos cerrados. Consultar la política de Stability AI.
- **Alcance limitado**: el modelo está diseñado específicamente para música instrumental de juegos y anime, por lo que no es adecuado para generar voces, letras o géneros muy alejados de ese estilo.
- **Control limitado por etiquetas**: no acepta descripciones de texto libre, solo etiquetas seleccionadas de un conjunto (1-8). Esto puede dificultar la generación de piezas muy específicas sin probar combinaciones.
- **Riesgo de alucinación**: aunque no es un modelo de texto, puede generar audio que no se corresponde exactamente con las etiquetas solicitadas, especialmente con combinaciones poco comunes.
- **Sesgos y calidad**: no se han documentado sesgos, pero el entrenamiento se basó en un dataset no especificado, lo que podría limitar la diversidad de estilos musicales.
- **Reproducibilidad**: la generación depende de la semilla y de la versión del modelo; cambios en el código o en el entorno pueden alterar los resultados.
- **Dependencia de componentes externos**: el script `webui.py` requiere el gestor de paquetes `uv` y la descarga previa de los pesos, lo que puede añadir fricción en entornos de producción.

## Enlaces

- [Hugging Face - AIWizard76/Localsong](https://huggingface.co/AIWizard76/Localsong)
- [Artículo SPRINT (arXiv:2510.21986)](https://arxiv.org/abs/2510.21986)
- [Artículo PixArt-α (arXiv:2310.00426)](https://arxiv.org/abs/2310.00426)
- [Artículo DiT (arXiv:2212.09748)](https://arxiv.org/abs/2212.09748)
- [Artículo Rectified Flow (arXiv:2209.03003)](https://arxiv.org/abs/2209.03003)
- [Repositorio stable-audio-3 de Stability AI](https://github.com/Stability-AI/stable-audio-3)
- [Licencia de Stable Audio Community License](https://stability.ai/license)
- [Página de Hugging Face de SAME-L](https://huggingface.co/stabilityai/SAME-L)
