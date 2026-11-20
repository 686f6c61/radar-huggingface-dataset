# RuFlect/LangGap-OpenWAM-LDS

## Resumen

LangGap-OpenWAM-LDS es un checkpoint de política robótica (visuomotor policy) desarrollado por RuFlect, obtenido mediante ajuste fino del modelo base OpenWAM/OpenWAM-Alpha-Sim-LIBERO. Se trata de un modelo de la familia OpenWAM, un "world action model" construido sobre el modelo de difusión de vídeo Wan2.2-TI2V-5B, adaptado al dominio de manipulación robótica en el simulador LIBERO. El checkpoint corresponde al paso de entrenamiento 2325 y emplea una técnica propietaria denominada Linear Decodability Supervision (LDS), que añade cabezas auxiliares de supervisión de decodificabilidad lineal durante el entrenamiento (descartadas en inferencia).

El modelo resuelve el problema de generar acciones motoras a partir de observaciones visuales y contexto lingüístico en entornos simulados de manipulación, con el objetivo declarado de mejorar la alineación entre representaciones internas y la tarea (el "language gap" o LangGap que da nombre al release). Es un artefacto de investigación orientado a evaluación comparativa (benchmark), no un modelo de propósito general.

La relevancia actual reside en su carácter de política "all-train" para la evaluación principal del benchmark LangGap, publicada junto con los materiales de verificación (SHA256SUMS, model-release.json) y el código de LDS. El repo ocupa 24,8 GB y conserva los 2.089 tensores de la arquitectura original en BF16, de los cuales 1.651 están entrenados y 438 corresponden al VAE y al codificador de texto congelados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World action model sobre difusión de vídeo Wan2.2-TI2V-5B (transformer de difusión), con cabezas auxiliares LDS en entrenamiento |
| Parametros totales | no disponible (modelo base Wan2.2-TI2V-5B; recuento exacto no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos exportados en BF16); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`checkpoint_step_2325.safetensors`), más `config.yaml`, tokenizer y `normalization_stats.npy` |

## Arquitectura y entrenamiento

El modelo parte de OpenWAM-Alpha-Sim-LIBERO, que a su vez se construye sobre Wan2.2-TI2V-5B, un modelo de difusión de vídeo texto-imagen-a-vídeo. OpenWAM lo reutiliza como "world action model": el modelo aprende a predecir dinámica visual y acciones en entornos de manipulación del simulador LIBERO. El export contiene los 2.089 tensores originales de la arquitectura: 1.651 tensores entrenados y 438 tensores sin modificar del VAE y el codificador de texto del base LIBERO fijado. Los bytes y la precisión BF16 se preservan exactamente.

El ajuste fino incorpora Linear Decodability Supervision (LDS), una supervisión auxiliar que fomenta que las representaciones internas sean linealmente decodificables hacia variables relevantes de la tarea. Las cabezas LDS se descartan en inferencia. Este checkpoint concreto es la política "all-train" del paso 2325, entrenada usando todas las escenas de supervisión de localización disponibles; el autor advierte explícitamente que no representa un split de entrenamiento con escenas retenidas (held-out), y que es distinto de las políticas RoboTwin-IF y de generalización con escenas retenidas. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades

- Generación de acciones robóticas de manipulación a partir de observaciones visuales y contexto lingüístico, en el dominio del simulador LIBERO.
- Modelado de dinámica visual (world model) heredado de la arquitectura de difusión de vídeo Wan2.2-TI2V-5B.
- Supervisión de decodificabilidad lineal (LDS) aplicada solo en entrenamiento; las cabezas auxiliares no forman parte de la inferencia.
- Integración con el cargador de checkpoints de la implementación upstream de OpenWAM.
- Capacidades multilingües: no disponibles.
- Tool calling, function calling, agentes multi-paso, visión general o audio: no documentados; el modelo está especializado en robótica y no se presenta como modelo de lenguaje de propósito general.

## Casos de uso

- Evaluación de referencia en el benchmark LangGap: sirve como política "all-train" contra la que se comparan las variantes RoboTwin-IF y de generalización con escenas retenidas.
- Investigación en supervisión de representaciones: permite reproducir el efecto de LDS comparando este checkpoint con el base OpenWAM-Alpha-Sim-LIBERO sin LDS, usando las mismas escenas y pasos.
- Manipulación simulada en LIBERO: ejecución de tareas de agarre y colocación en el simulador con el pipeline de inferencia upstream de OpenWAM.
- Estudio del "language gap": análisis de cómo el contexto lingüístico condiciona las representaciones y las acciones generadas en tareas de instrucción.
- Reproducibilidad de resultados: los ficheros SHA256SUMS y model-release.json permiten verificar la identidad del checkpoint y el paso evaluado en experimentos de terceros.
- Base para ajuste fino posterior: al conservar los 2.089 tensores originales en BF16, puede reutilizarse como punto de partida para nuevas políticas en otros entornos simulados.
- Docencia y prototipado en robótica con world models: despliegue en laboratorio con el código de OpenWAM para estudiar políticas basadas en difusión de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repo pesa 24,8 GB en BF16, por lo que se requiere al menos esa cantidad de memoria para cargar los pesos completos, más overhead del VAE, codificador de texto y activaciones.
- GPU recomendadas: no documentadas por el autor; por tamaño del modelo base (Wan2.2-TI2V-5B) se sitúa en la gama de GPUs de centro de datos (A100 80 GB, H100) para carga completa en BF16.
- GPU de consumo: no se confirma que quepa en RTX 4090 (24 GB) en BF16; requeriría cuantización no documentada para este release.
- Opciones de despliegue: cargador de checkpoints de la implementación upstream de OpenWAM (https://github.com/OpenWAM-Official/OpenWAM); requiere descargar los assets congelados de Wan-AI/Wan2.2-TI2V-5B y configurar ambas rutas Wan en `config.yaml`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LangGap-OpenWAM-LDS (este) | OpenWAM-Alpha-Sim-LIBERO / Wan2.2-TI2V-5B | no disponible | no disponible | Apache 2.0 | Hugging Face (RuFlect) |
| OpenWAM-Alpha-Sim-LIBERO | Wan2.2-TI2V-5B | no disponible | no disponible | no disponible en la información | Hugging Face (OpenWAM) |
| Wan2.2-TI2V-5B | — | 5B (según nombre) | no disponible | no disponible en la información | Hugging Face (Wan-AI) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse en el simulador LIBERO, el comportamiento está sesgado al dominio y a las escenas de ese simulador.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero el modelo puede generar trayectorias o predicciones visuales no válidas fuera de la distribución de entrenamiento.
- Limitaciones de contexto e idioma: no se documentan la longitud de contexto ni los idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse las licencias de los assets congelados de Wan-AI/Wan2.2-TI2V-5B descargados por separado.
- Este checkpoint usa todas las escenas de supervisión disponibles y no constituye un split con escenas retenidas; no debe presentarse como resultado de generalización a escenas no vistas.
- Es un artefacto de investigación para benchmark, no una política lista para producción robótica real.
- Las cabezas LDS deben descartarse en inferencia; usarlas produciría resultados no representativos.
- Requiere la implementación upstream de OpenWAM y la configuración manual de rutas Wan; no hay integración documentada con frameworks de serving estándar.

## Enlaces

- Hugging Face: https://huggingface.co/RuFlect/LangGap-OpenWAM-LDS
- Modelo base: https://huggingface.co/OpenWAM/OpenWAM-Alpha-Sim-LIBERO
- Assets congelados Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Implementación upstream OpenWAM: https://github.com/OpenWAM-Official/OpenWAM
- Código LDS: https://github.com/RuFlect-Intelligence/Linear-Decodability-Supervision
