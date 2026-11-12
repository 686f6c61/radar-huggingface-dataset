# nikitastheo/speech-babylm-checkpoints

## Resumen

`nikitastheo/speech-babylm-checkpoints` no es un modelo entrenado por su autor, sino un repositorio espejo que aloja checkpoints de terceros utilizados para evaluación zero-shot (ABX, BabySLM) en el proyecto Speech BabyLM. El objetivo es permitir la descarga reproducible mediante `huggingface_hub` de pesos que originalmente residen en hosts menos fiables, como Google Drive o el CDN de Meta (dl.fbaipublicfiles.com).

El repositorio contiene tres artefactos: los pesos de CPC (Facebook Research, `CPC_audio`), los de MelHuBERT con marcos de 20 ms, y un modelo k-means de 500 unidades entrenado sobre la capa 11 de mHuBERT-base-25Hz, el tokenizador de habla usado en TWIST y Slam. Los dos primeros se han convertido a safetensors conservando cada tensor sin modificar; el tercero se mantiene como fichero joblib original.

Es relevante para investigadores que replican pipelines de evaluación de modelos de habla auto-supervisados y necesitan pesos estables con hash verificable. No es un modelo generativo ni un LLM: no acepta prompts de texto ni produce salidas de lenguaje, y su uso está restringido a extracción de representaciones o tokenización de audio según el componente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CPC (contrastive predictive coding), MelHuBERT (transformer auto-supervisado sobre mel-espectrogramas) y k-means MiniBatchKMeans sobre mHuBERT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelos de audio, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y joblib sin cuantizar) |
| Idiomas soportados | no disponible (modelos de habla; mHuBERT entrenado en MLS, CV, SP y Fisher segun la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors (CPC, MelHuBERT) y joblib/pickle (k-means) |

## Arquitectura y entrenamiento

Los tres componentes son de terceros y no han sido entrenados por el autor del repositorio. CPC es un modelo de codificación predictiva contrastiva de Facebook Research que aprende representaciones de audio sin etiquetas. MelHuBERT es un transformer auto-supervisado que opera sobre marcos de 20 ms de mel-espectrogramas, en la línea de HuBERT pero con entrada mel en lugar de MFCC. El tercer artefacto es un `MiniBatchKMeans` de 500 unidades ajustado sobre la capa 11 de mHuBERT-base-25Hz, el tokenizador de habla empleado por TWIST y Slam, distribuido a través de `textlesslib`.

El autor solo ha realizado tareas de empaquetado: para CPC y MelHuBERT se conserva únicamente el state dict (`gEncoder` y `model` respectivamente) con todos los tensores intactos, descartando estado del optimizador y argumentos de entrenamiento, y se serializa en safetensors. El fichero k-means se mantiene sin cambios porque `slamkit` lo carga tal cual. No hay información sobre volúmenes de datos, composición del corpus ni fases de RLHF o DPO en la información proporcionada.

## Capacidades

- Extracción de representaciones de audio auto-supervisadas con CPC.
- Extracción de representaciones de habla con MelHuBERT sobre marcos de 20 ms.
- Tokenización discreta de habla en 500 unidades mediante el k-means sobre mHuBERT-base-25Hz.
- Evaluación zero-shot de modelos de habla con métricas ABX y BabySLM, según el propósito declarado del proyecto.
- Descarga reproducible vía `huggingface_hub` con verificación de integridad por SHA-256 documentado.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-step ni capacidades multilingües de texto.
- No incluye visión, audio generativo ni modo thinking.

## Casos de uso

- Replicación de experimentos de evaluación zero-shot: descargar los checkpoints con `hf_hub_download` y ejecutar ABX o BabySLM sin depender de Google Drive ni del CDN de Meta, garantizando que los pesos coinciden con los originales.
- Tokenización de corpus de habla para entrenamiento de modelos tipo TWIST o Slam: el k-means de 500 unidades sobre la capa 11 de mHuBERT permite convertir audio en secuencias discretas listas para un modelo de lenguaje.
- Extracción de features para modelos de lenguaje hablado (SpeechLM): CPC y MelHuBERT sirven como extractores congelados en pipelines de evaluación comparativa.
- Integración en CI/CD de investigación: al estar en safetensors y con hash documentado, se pueden validar descargas en tests automatizados y detectar corrupción o cambios en los artefactos.
- Reproducibilidad de publicaciones: fijar la revisión del repositorio en un artículo o informe técnico para que terceros recuperen exactamente los mismos pesos.
- Baseline en estudios de representaciones de habla: comparar un modelo propio contra CPC y MelHuBERT usando los mismos checkpoints de referencia sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio completo ocupa 0.4 GB, por lo que los pesos caben holgadamente en cualquier GPU consumer.
- GPU recomendadas: no disponible; al tratarse de modelos de audio de tamaño moderado, cualquier GPU con suficiente memoria para el lote de inferencia debería bastar, pero no se especifican cifras.
- Compatibilidad con GPU consumer: previsiblemente sí por el tamaño del repo, aunque no hay datos oficiales de consumo de memoria por componente.
- Opciones de despliegue: carga directa con `safetensors.torch.load_file` y `huggingface_hub.hf_hub_download`; el k-means se carga con joblib según `slamkit`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a estos componentes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Speech BabyLM checkpoints (este repo) | Espejo de CPC, MelHuBERT y k-means sobre mHuBERT | no disponible | no aplica | MIT | Hugging Face |
| mHuBERT-base-25Hz (`slprl/mhubert-base-25hz`) | Modelo de habla auto-supervisado | no disponible | no aplica | no disponible en la informacion | Hugging Face |
| CPC_audio (Facebook Research) | Codificacion predictiva contrastiva | no disponible | no aplica | no disponible en la informacion | GitHub |
| MelHuBERT (nervjack2) | Transformer auto-supervisado sobre mel | no disponible | no aplica | no disponible en la informacion | GitHub |

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: cualquier problema de calidad, sesgo o rendimiento proviene de los modelos originales y debe atribuirse a sus autores.
- El k-means se distribuye como pickle de joblib; cargar pickles de origen no verificado conlleva riesgo de ejecución de código, aunque aquí el hash SHA-256 está documentado.
- Los checkpoints de CPC y MelHuBERT han sido reempaquetados: se han eliminado el estado del optimizador y los argumentos de entrenamiento, por lo que no permiten reanudar entrenamiento, solo inferencia o extracción de features.
- No hay información sobre idiomas cubiertos, sesgos demográficos o acústicos, ni sobre dominios de audio fuera de los corpus de entrenamiento originales.
- La licencia MIT se aplica al empaquetado, pero cada carpeta conserva la licencia de su proyecto original; conviene verificar las condiciones de cada componente antes de uso comercial.
- No apto para generación de texto, asistentes conversacionales ni tareas de NLP: es infraestructura de evaluación y tokenización de habla.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de adopción comunitaria que avalen su mantenimiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nikitastheo/speech-babylm-checkpoints
- CPC_audio (Facebook Research): https://github.com/facebookresearch/CPC_audio
- MelHuBERT (nervjack2): https://github.com/nervjack2/MelHuBERT
- mHuBERT-base-25Hz: https://huggingface.co/slprl/mhubert-base-25hz
- Colección Slam: https://huggingface.co/collections/slprl/slam
- textlesslib (Facebook Research): https://github.com/facebookresearch/textlesslib
- slamkit: https://github.com/slp-rl/slamkit
