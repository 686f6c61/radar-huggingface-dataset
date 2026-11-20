# RuFlect/LangGap-LingBot-VA-LDS

## Resumen

LangGap-LingBot-VA-LDS es un checkpoint de política robótica (policy) derivado del modelo base LingBot-VA de Robbyant, publicado por RuFlect bajo licencia Apache 2.0. No se trata de un modelo de lenguaje al uso, sino de un modelo de difusión para control robótico visual-motor (visuomotor policy) afinado con una técnica propietaria denominada Linear Decodability Supervision (LDS). El checkpoint corresponde al paso de entrenamiento 2325 de la variante "all-train" utilizada en la evaluación principal del benchmark LangGap.

El modelo resuelve el problema de mapear observaciones visuales (dos cámaras) e instrucciones en lenguaje natural a acciones robóticas de 7 grados de libertad (7-D) en el entorno LIBERO. Su relevancia radica en que introduce una supervisión auxiliar (LDS) orientada a mejorar la linealidad de las representaciones internas, y en que publica de forma verificable (con `SHA256SUMS` y `model-release.json`) la identidad exacta del checkpoint evaluado y su procedencia.

Arquitectura y tamaño: al ser un modelo de difusión para robótica, no dispone de una arquitectura transformer de lenguaje convencional. Los pesos suman 5.088.872.670 parámetros (aproximadamente 5,09 mil millones) y el repositorio ocupa 10,2 GB en formato safetensors, gestionado con la librería diffusers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para politica visuomotora robotica (LingBot-VA), con transformer propio y cabezas auxiliares LDS |
| Parametros totales | 5.088.872.670 (aprox. 5,09 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones en lenguaje natural se procesan mediante el text encoder del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

El modelo parte de `robbyant/lingbot-va-base`, un modelo de difusión para políticas visuomotoras. El checkpoint publicado reemplaza el transformer del modelo base por el contenido del directorio `transformer/` de este repositorio y utiliza el tokenizer, el text encoder y el VAE del modelo base. La decodificación de acciones emplea el codec nativo de 7-D para LIBERO con dos cámaras, y la normalización de acciones se realiza con el `norm_stat.json` incluido (percentiles `q01`/`q99`).

El entrenamiento se estructura en dos fases: una base LIBERO continuada hasta el paso 30.000, seguida de una continuación específica del benchmark con Linear Decodability Supervision (LDS) hasta el paso 2325. La técnica LDS añade cabezas auxiliares que fuerzan la linealidad de las representaciones internas; estas cabezas se descartan en inferencia. Todos los escenarios de supervisión de localización disponibles se usan en este entrenamiento, por lo que esta release no representa una partición de escenas no vistas (held-out). No se especifican en la información disponible el número de tokens, la composición del dataset ni si hubo RLHF/DPO.

## Capacidades

- Control robótico visuomotor: genera acciones de 7-D a partir de observaciones de dos cámaras y de instrucciones en lenguaje natural, en el entorno LIBERO.
- Política de difusión: produce trayectorias de acción mediante el proceso de difusión del modelo base.
- Integración con instrucciones en lenguaje: utiliza el text encoder del modelo base para condicionar las acciones sobre comandos textuales.
- Supervisión LDS: entrenado con cabezas auxiliares de linealidad de representación (descartadas en inferencia).
- Compatibilidad con la configuración upstream `va_libero_train_cfg` y el codec de acciones LIBERO de 7-D.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo thinking.

## Casos de uso

- Evaluación de referencia en LIBERO: el checkpoint está pensado como política "all-train" para la evaluación principal del benchmark LangGap, permitiendo reproducir los resultados publicados con la configuración upstream.
- Manipulación robótica con dos cámaras: se usa como política visuomotora que consume observaciones de dos vistas y emite acciones de 7-D en tareas de manipulación del entorno LIBERO.
- Investigación en supervisión de representaciones: al estar entrenado con LDS, sirve para estudiar cómo la linealidad de las representaciones internas afecta el rendimiento de políticas de difusión.
- Reproducción verificable de experimentos: gracias a `SHA256SUMS` y `model-release.json`, permite auditar la identidad exacta del checkpoint evaluado en cada paso de entrenamiento.
- Punto de partida para fine-tuning: al ser un checkpoint intermedio (paso 2325) sobre una base LIBERO, puede usarse como inicialización para continuar entrenamiento en tareas o escenas adicionales.
- Comparación de políticas: permite contrastar esta variante LDS frente a la política RoboTwin-IF y la de generalización a escenas no vistas mencionadas en la model card.
- Despliegue en pipelines de robótica simulada: se integra con la implementación upstream de LingBot-VA para ejecutar políticas en entornos simulados compatibles con LIBERO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 5,09 mil millones de parámetros en safetensors, la huella en memoria ronda los 10,2 GB en precisión de origen (fp32/fp16 según el checkpoint); no se documentan cuantizaciones alternativas.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: implementación upstream de LingBot-VA (https://github.com/Robbyant/lingbot-va); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LangGap-LingBot-VA-LDS | 5,09 mil millones | no disponible | no disponible | Apache 2.0 | Hugging Face (RuFlect) |
| robbyant/lingbot-va-base | no disponible | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| Política RoboTwin-IF (LangGap) | no disponible | no disponible | no disponible | no disponible | Referenciada en la model card, no enlazada |
| Política de generalización a escenas no vistas | no disponible | no disponible | no disponible | no disponible | Referenciada en la model card, no enlazada |

No se dispone de datos suficientes para comparar parámetros, contexto o rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe usarse para generación de texto, código o matemáticas; su dominio es el control robótico en LIBERO.
- El checkpoint está entrenado con todos los escenarios de supervisión de localización disponibles; no representa una partición held-out y, por tanto, no es válido para medir generalización a escenas no vistas.
- La normalización de acciones debe ser la del `norm_stat.json` incluido (`q01`/`q99`); usar la normalización de RoboTwin produce resultados incorrectos.
- Las cabezas auxiliares LDS se descartan en inferencia; conservarlas o reutilizarlas fuera de la implementación upstream no está documentado.
- El release no incluye estado del optimizador ni cachés de entrenamiento, por lo que no permite reanudar el entrenamiento de forma directa.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas; al no ser un modelo generativo de texto, estos riesgos no aplican del mismo modo.
- Licencia Apache 2.0: permite uso comercial con atribución, pero conviene verificar las condiciones del modelo base `robbyant/lingbot-va-base` antes de producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación comunitaria externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RuFlect/LangGap-LingBot-VA-LDS
- Modelo base: https://huggingface.co/robbyant/lingbot-va-base
- Implementación upstream de LingBot-VA: https://github.com/Robbyant/lingbot-va
- Código de Linear Decodability Supervision: https://github.com/RuFlect-Intelligence/Linear-Decodability-Supervision
