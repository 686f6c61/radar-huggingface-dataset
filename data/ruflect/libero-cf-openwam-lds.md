# RuFlect/LIBERO-CF-OpenWAM-LDS

## Resumen

LIBERO-CF-OpenWAM-LDS es un checkpoint de política robótica publicado por RuFlect, obtenido mediante ajuste fino del modelo base OpenWAM/OpenWAM-Alpha-Sim-LIBERO. Se trata de un modelo de tipo vision-language-action (VLA) orientado a la manipulación robótica en el benchmark LIBERO-CF, entrenado con la técnica Linear Decodability Supervision (LDS). El checkpoint liberado corresponde al paso de entrenamiento 1600 y es la política "all-train" empleada en la evaluación principal del benchmark, distinta de las políticas para RoboTwin-IF y para generalización con escenas retenidas.

El modelo hereda la arquitectura del modelo base OpenWAM, que a su vez se apoya en los componentes congelados de Wan-AI/Wan2.2-TI2V-5B (un modelo de generación vídeo-texto-imagen de aproximadamente 5 mil millones de parámetros). El repositorio contiene 2.089 tensores de arquitectura original, de los cuales 1.651 han sido entrenados y 438 corresponden a tensores VAE y de codificador de texto sin modificar respecto a la base LIBERO fijada. La precisión se preserva en BF16.

Su relevancia es acotada pero específica: se trata de un artefacto de investigación reproducible para evaluar políticas VLA con supervisión de decodificabilidad lineal en tareas de manipulación, con verificación de integridad mediante SHA256SUMS y metadatos de procedencia en model-release.json. No es un modelo de propósito general ni un asistente conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de OpenWAM, con componentes VAE y codificador de texto de Wan2.2-TI2V-5B |
| Parametros totales | No disponible (el modelo base Wan2.2-TI2V-5B tiene aproximadamente 5B; el recuento exacto del checkpoint no se especifica) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`checkpoint_step_1600.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de OpenWAM-Alpha-Sim-LIBERO, un modelo base de robótica que integra un backbone de difusión vídeo-texto-imagen (Wan2.2-TI2V-5B) con cabezas de política para control robótico. El checkpoint exporta los 2.089 tensores de la arquitectura original: 1.651 tensores entrenados y 438 tensores de VAE y codificador de texto que permanecen idénticos a la base LIBERO fijada. Los bytes de los tensores y la precisión BF16 se preservan exactamente.

El entrenamiento emplea Linear Decodability Supervision (LDS), una técnica de supervisión auxiliar que añade cabezas de decodificación lineal descartadas en inferencia. El checkpoint corresponde al paso 1600 y se entrenó utilizando todas las escenas de supervisión de localización disponibles; no representa una partición de entrenamiento con escenas retenidas. El release incluye parámetros de inferencia y ficheros de soporte, pero no estado del optimizador ni cachés de entrenamiento.

## Capacidades

- Control robótico de manipulación en el benchmark LIBERO-CF mediante política VLA.
- Procesamiento conjunto de observaciones visuales e instrucciones de tarea (entrada visión-lenguaje).
- Generación de acciones motoras condicionadas al estado visual y al objetivo.
- Supervisión auxiliar LDS durante entrenamiento (cabezas descartadas en inferencia).
- Carga mediante el loader de directorios de checkpoint de OpenWAM con `config.yaml`, tokenizer y `normalization_stats.npy`.
- Verificación de integridad mediante `SHA256SUMS` y metadatos de procedencia en `model-release.json`.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general ni multilingüismo conversacional.

## Casos de uso

- Evaluación de referencia en LIBERO-CF: sirve como política "all-train" para reproducir los resultados principales del benchmark, cargando el checkpoint con el loader upstream y los assets congelados de Wan2.2-TI2V-5B.
- Investigación en supervisión de representaciones: permite estudiar el efecto de Linear Decodability Supervision comparando este checkpoint con variantes sin LDS sobre el mismo modelo base.
- Reproducibilidad de experimentos: los ficheros `SHA256SUMS` y `model-release.json` permiten verificar la identidad exacta del checkpoint evaluado y su paso de entrenamiento.
- Desarrollo de pipelines de manipulación simulada: integrable en entornos de simulación compatibles con LIBERO para generar trayectorias de acción a partir de observaciones visuales.
- Punto de partida para ajuste fino posterior: al estar bajo Apache 2.0 y en safetensors BF16, puede reentrenarse sobre tareas o escenas adicionales.
- Comparación de políticas VLA: útil como baseline en estudios que comparen arquitecturas derivadas de Wan2.2 con otras políticas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 24,8 GB y los pesos se distribuyen en BF16; se requiere además descargar los assets congelados de Wan-AI/Wan2.2-TI2V-5B.
- GPU recomendadas: no disponible. Por el tamaño del modelo base (aproximadamente 5B parámetros) y la precisión BF16, se previsible el uso de GPUs de datacenter con al menos 24-40 GB de VRAM, aunque el fabricante no lo especifica.
- Viabilidad en GPU de consumo: no confirmada; probablemente ajustada en tarjetas de 24 GB o menos, sin datos oficiales.
- Opciones de despliegue: loader de checkpoint-directory de OpenWAM (repositorio upstream en GitHub). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LIBERO-CF-OpenWAM-LDS | No disponible (base ~5B) | No disponible | Manipulación VLA en LIBERO-CF | Apache 2.0 | Hugging Face |
| OpenWAM/OpenWAM-Alpha-Sim-LIBERO | No disponible (base ~5B) | No disponible | Manipulación VLA (modelo base) | No disponible en la información | Hugging Face |
| Wan-AI/Wan2.2-TI2V-5B | ~5B | No disponible | Generación vídeo-texto-imagen | No disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparado entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint está entrenado con todas las escenas de supervisión disponibles; no constituye una partición con escenas retenidas, por lo que no debe usarse como evidencia de generalización a escenas no vistas.
- Es un artefacto específico para LIBERO-CF: no es un modelo de propósito general ni un asistente conversacional.
- Requiere descargar assets externos congelados de Wan-AI/Wan2.2-TI2V-5B y configurar ambas rutas en `config.yaml`; sin ellos el checkpoint no es cargable.
- Las cabezas auxiliares LDS se descartan en inferencia; su ausencia en el pipeline de despliegue es esperada, no un defecto.
- El release no incluye estado del optimizador ni cachés de entrenamiento, lo que impide reanudar el entrenamiento desde este artefacto.
- No se documentan sesgos, tasas de alucinación ni comportamiento multilingüe; en robótica, el riesgo relevante es el fallo de política ante distribuciones visuales distintas a las de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los assets de Wan2.2 deben verificarse por separado en cuanto a sus propias condiciones.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/RuFlect/LIBERO-CF-OpenWAM-LDS
- Modelo base: https://huggingface.co/OpenWAM/OpenWAM-Alpha-Sim-LIBERO
- Assets congelados Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Implementación upstream OpenWAM: https://github.com/OpenWAM-Official/OpenWAM
- Código LDS: https://github.com/RuFlect-Intelligence/Linear-Decodability-Supervision
