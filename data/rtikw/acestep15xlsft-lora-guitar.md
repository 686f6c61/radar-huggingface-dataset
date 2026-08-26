# rtikw/acestep15xlsft-lora-guitar

## Resumen

Este repositorio aloja un espejo del LoRA de guitarra para el modelo de generación musical ACE-Step v1.5 XL SFT, desarrollado originalmente por DiffSynth-Studio y distribuido a través de ModelScope. Se trata de un adaptador de bajo rango (LoRA) de 79,7 millones de parámetros que, aplicado sobre el modelo base ACE-Step-v1.5-XL-sft, realza la calidad y presencia de guitarras (incluidas las eléctricas) en las composiciones generadas. El espejo existe para facilitar la descarga desde Hugging Face, ya que los pesos originales solo estaban disponibles en ModelScope, y está mantenido por la aplicación LocalMusic.

La relevancia de este modelo radica en su enfoque de especialización: en lugar de entrenar un modelo completo de generación musical, se emplea la técnica de entrenamiento diferencial (Differential LoRA) para ajustar únicamente el comportamiento del modelo base en un aspecto concreto. Esto permite a los usuarios obtener un mayor control estilístico sobre la producción musical generada, con un coste de entrenamiento y almacenamiento mucho menor. Su licencia Apache-2.0 facilita su uso en proyectos comerciales y de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre ACE-Step v1.5 XL SFT (modelo de difusión para audio) |
| Parametros totales | 79.691.776 |
| Parametros activos | no aplicable (LoRA) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors con precisión bfloat16 para el modelo base) |
| Idiomas soportados | no disponible (el modelo base soporta generación musical con letras en varios idiomas, incluido chino) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El LoRA se entrena mediante la técnica de entrenamiento diferencial (Differential LoRA) sobre el modelo ACE-Step-v1.5-XL-sft, que es la variante XL del modelo de difusión ACE-Step v1.5. ACE-Step v1.5 es un modelo de fundación de música de alta eficiencia que genera canciones completas (música y voces) a partir de un prompt de texto y una letra. El modelo base emplea un transformador de difusión (DiT) con un codificador de texto Qwen3-Embedding-0.6B y un VAE para audio. El LoRA ajusta selectivamente las capas del DiT para potenciar la representación de guitarras en la señal de audio generada.

El entrenamiento se realiza sobre el modelo SFT (supervised fine-tuning) de ACE-Step v1.5 XL, que ya ha sido ajustado con datos de alta calidad. El LoRA se aplica al DiT del modelo base, y su peso se carga en el pipeline de inferencia mediante la función `load_lora` de DiffSynth-Studio. La técnica de entrenamiento diferencial permite aislar el efecto de la guitarra sin degradar el resto de las capacidades del modelo.

## Capacidades

- Realce de guitarras acústicas y eléctricas en la música generada por ACE-Step v1.5 XL SFT.
- Integración con el pipeline completo de ACE-Step v1.5 (prompt de texto, letra, BPM, tonalidad, compás).
- Compatible con el ecosistema DiffSynth-Studio para inferencia.
- Funciona sobre el modelo base ACE-Step-v1.5-XL-sft, que soporta generación de música completa con voces.
- No añade capacidades de tool calling, agentes ni razonamiento; su función es exclusivamente estilística sobre el audio generado.
- Multilingüe en lo que respecta a las letras: el modelo base acepta letras en varios idiomas (el ejemplo oficial usa chino).

## Casos de uso

- Producción musical para creadores independientes: el LoRA permite generar demos con guitarras prominentes sin necesidad de un guitarrista o de muestras pregrabadas. El usuario puede iterar rápidamente variaciones sobre una misma letra y estructura.
- Composición de bandas sonoras para videojuegos o cortos: permite obtener piezas con carácter guitarrero para ambientes o escenas concretas, ajustando parámetros como BPM y escala para encajar con la narrativa.
- Maquetas de canciones para artistas: los compositores pueden usar el modelo para esbozar un tema con acompañamiento de guitarra antes de llevarlo a un estudio de grabación, ahorrando tiempo en la fase de preproducción.
- Educación musical: los estudiantes pueden analizar cómo varía la generación con distintos parámetros (prompt, letra, BPM) y estudiar el papel de la guitarra en diferentes géneros.
- Generación de música de fondo para podcasts o vídeos: el modelo base ACE-Step v1.5 es rápido (menos de 2 segundos por canción en A100) y el LoRA permite personalizar el estilo con guitarrítricas, ideal para crear música de fondo libre de derechos.
- Experimentación en investigación: el LoRA sirve como ejemplo de adaptación de modelos de difusión musical mediante entrenamiento diferencial, útil para estudiar técnicas de personalización de modelos de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El LoRA en sí es muy ligero (79,7 M parámetros, 0,4 GB), pero requiere el modelo base ACE-Step v1.5 XL SFT para funcionar.
- Para el modelo base ACE-Step v1.5, según el GitHub de Runware, se necesitan menos de 10 segundos por canción en una RTX 3090 y menos de 2 segundos en una A100.
- El modelo base funciona en GPU de consumo (RTX 3090 o superior) y también en Mac, AMD, Intel y CUDA según el repositorio oficial.
- La inferencia se realiza con DiffSynth-Studio, que soporta CUDA y bfloat16. También se menciona compatibilidad con Ollama en la comunidad.
- La VRAM necesaria para el modelo base no está especificada en la información disponible, pero se recomienda una GPU con al menos 16 GB de VRAM para las variantes XL.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| `rtikw/acestep15xlsft-lora-guitar` | LoRA sobre ACE-Step v1.5 XL SFT | 79,7 M | n/a (audio) | Apache-2.0 | Espejo de DiffSynth-Studio/acestep15xlsft-lora-guitar |
| `DisturbingTheField/ACE-Step-v1.5-acoustic-guitar-and-a-merge-LoRA` | LoRA sobre ACE-Step v1.5 | no disponible | n/a (audio) | no disponible | LoRA alternativo para guitarrítricas acústicas |
| ACE-Step v1.5 XL SFT (modelo base) | Modelo de difusión de audio | no disponible | n/a (audio) | Apache-2.0 | Modelo completo de generación musical |

La comparativa se limita a LoRA para ACE-Step v1.5; no hay otros modelos comparables en la misma categoría con información pública.

## Limitaciones y advertencias

- El modelo es un LoRA, no un modelo completo: requiere cargar el modelo base ACE-Step v1.5 XL SFT para funcionar, lo que implica un coste de VRAM y almacenamiento adicional.
- No se han publicado resultados de evaluación cuantitativa (benchmarks) que demuestren el grado de mejora de la guitarra.
- La eficacia del LoRA puede variar según el prompt, el género musical y la letra; la mejora de la guitarra no es uniforme en todas las generaciones.
- El modelo base ACE-Step v1.5 tiene limitaciones en cuanto a la duración máxima de generación (160 segundos en el ejemplo) y el control sobre la voz (solo se especifica el idioma vocal).
- La licencia Apache-2.0 permite uso comercial, pero el modelo base ACE-Step v1.5 tiene su propia licencia (Apache-2.0 también, según la información del GitHub), por lo que es necesario verificar los términos de ambas partes.
- El espejo de HuggingFace no está oficialmente avalado por DiffSynth-Studio; puede haber diferencias en la integridad de los archivos, aunque se indica que los checksums no se han modificado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/rtikw/acestep15xlsft-lora-guitar
- Original en ModelScope: https://modelscope.cn/models/DiffSynth-Studio/acestep15xlsft-lora-guitar
- Modelo base ACE-Step v1.5 XL SFT en ModelScope: https://modelscope.cn/models/ACE-Step/acestep-v15-xl-sft
- Repositorio de ACE-Step v1.5 en GitHub: https://github.com/ace-step/ACE-Step-1.5
- Repositorio de ACE-Step v1.5 XL en GitHub: https://github.com/Runware/ACE-Step-1.5-XL
- Documentación de entrenamiento diferencial (Differential LoRA): https://diffsynth-studio-doc.readthedocs.io/zh-cn/latest/Training/Differential_LoRA.html
- DiffSynth-Studio en GitHub: https://github.com/modelscope/DiffSynth-Studio
- Paper de ACE-Step v1.5: https://arxiv.org/html/2602.00744
