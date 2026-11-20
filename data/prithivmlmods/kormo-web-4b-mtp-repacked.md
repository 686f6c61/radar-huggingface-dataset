# prithivMLmods/KORMo-Web-4B-MTP-Repacked

## Resumen

KORMo-Web-4B-MTP-Repacked es un modelo vision-lenguaje de 4B parámetros (5.295.564.288 parámetros reales según los pesos en safetensors) especializado en la ejecución de tareas de navegador web a partir exclusivamente de capturas de pantalla, sin necesidad de DOM ni de árbol de accesibilidad. El modelo original, KORMo-Web-4B, fue desarrollado por investigadores de KAIST sobre la base de Qwen3.5-4B y está orientado a la automatización de agentes GUI y web (computer use). Este repositorio concreto, publicado por prithivMLmods, es un reempaquetado que añade Multi-Token Prediction (MTP) para decodificación especulativa integrada en los propios pesos, además de versiones GGUF para inferencia local.

La propuesta de valor del modelo es su enfoque "no-DOM": opera únicamente sobre píxeles de la pantalla, lo que lo hace independiente de la estructura HTML de la página y potencialmente más robusto frente a cambios de marcado. Emite un bucle de razonamiento paso a paso mediante etiquetas `<think>` y traduce sus decisiones a 22 acciones de navegador con coordenadas normalizadas (clic, escritura, desplazamiento, control de pestañas, etc.). Está entrenado para tareas multi-sitio y multi-pestaña, y soporta inglés y coreano.

Es relevante ahora porque los agentes de navegador basados en capturas de pantalla están emergiendo como alternativa práctica a los enfoques basados en DOM, y porque este reempaquetado añade aceleración mediante MTP y una batería de cuantizaciones GGUF que permiten ejecutarlo en hardware de consumo. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (base Qwen3.5-4B) con cabezas de Multi-Token Prediction (MTP) |
| Parametros totales | 5.295.564.288 (pesos safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M; mmproj en BF16 |
| Idiomas soportados | Inglés (en) y coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, dos shards), GGUF (incluye mmproj para visión) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B como backbone de lenguaje y le incorpora capacidades de visión para procesar capturas de pantalla (pipeline `image-text-to-text`). Sobre esa base, KORMo-Web-4B fue preentrenado con más de 10 millones de muestras de comprensión de elementos web a nivel atómico y ajustado con más de 100.000 trayectorias reales de interacción en navegador. El modelo emite un razonamiento explícito `<think>` antes de cada acción y produce comandos sobre 22 acciones de navegador normalizadas con coordenadas.

Este reempaquetado introduce Multi-Token Prediction (MTP): en lugar de requerir un modelo "draft" separado para decodificación especulativa, el modelo incluye cabezas adicionales que predicen varios tokens futuros en un único forward pass, acelerando la inferencia local. Los ficheros GGUF incorporan estas cabezas MTP directamente en los pesos, y se distribuye además un fichero `mmproj-bf16.gguf` para las capacidades de visión. No se detallan en la información disponible la composición exacta del dataset, el número total de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Comprensión de capturas de pantalla (image-text-to-text) para interpretar interfaces web.
- Ejecución de tareas de navegador multi-sitio y multi-pestaña sin DOM ni árbol de accesibilidad.
- Razonamiento paso a paso mediante bucle `<think>` antes de cada acción.
- Emisión de 22 acciones de navegador normalizadas con coordenadas (clic, escritura, desplazamiento, control de pestañas, etc.).
- Capacidades bilingües en inglés y coreano.
- Decodificación especulativa integrada vía MTP para acelerar la generación.
- Compatibilidad con `text-generation-inference`, `llama-cpp` y despliegue vía `vLLM` y `vllm-mlx`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Automatización de tareas web repetitivas: rellenar formularios, navegar entre pestañas y extraer información de sitios, usando únicamente capturas de pantalla y las 22 acciones normalizadas del modelo.
- Agentes de computer use en escritorio: integración en un harness tipo Playwright o extensión de Chrome (ambos referenciados por el autor) para controlar el navegador de forma autónoma en flujos multi-paso.
- Testing E2E de aplicaciones web: el modelo puede actuar como usuario sintético que ejecuta recorridos de extremo a extremo guiándose por lo que ve en pantalla, sin depender de selectores DOM frágiles.
- Asistentes de accesibilidad: interpretar la pantalla y ejecutar acciones en nombre de usuarios con dificultades motoras, traduciendo instrucciones en lenguaje natural a clics y escritura.
- Automatización en entornos coreanos: al soportar coreano además de inglés, es adecuado para flujos en sitios web de Corea del Sur donde otros agentes monolingües fallan.
- Despliegue en local con recursos limitados: la variante de 4 bits cabe en 16 GB de RAM en Apple Silicon vía `vllm-mlx`, y las cuantizaciones GGUF (desde 2,63 GB en Q3_K_M) permiten ejecución en portátiles y equipos sin GPU dedicada.
- Investigación en agentes GUI: servir como baseline reproducible (Apache 2.0) para estudiar razonamiento visual y planificación de acciones sobre interfaces.

## Benchmarks y rendimiento

| Benchmark | KORMo-Web-4B | Base (Qwen3.5-4B) | Delta |
|---|---|---|---|
| Online-Mind2Web (inglés) | 42,3 % | no disponible | +22,3 puntos |
| Online-Mind2Web (coreano) | 42,3 % | no disponible | +28,8 puntos |

Los datos de la model card indican una tasa de éxito del 42,3 % en ambos idiomas sobre Online-Mind2Web, con mejoras de +22,3 y +28,8 puntos sobre el modelo base, superando a agentes open-weight comparables según el autor. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales.

## Requisitos de hardware

- VRAM estimada para inferencia: BF16 requiere aproximadamente 10-11 GB de pesos más overhead de activaciones y visión; Q8_0 unos 5,3 GB; Q4_K_M unos 3,2 GB; Q3_K_M unos 2,6 GB.
- GPU recomendadas: una única GPU NVIDIA (el autor indica ejecución en una sola GPU vía `vLLM`); modelos como A100, H100, L40S o RTX 4090 son holgados para BF16.
- Cabe en GPU de consumo: sí. En RTX 4090/3090 en BF16 o Q8_0; en GPUs de 8-12 GB con cuantizaciones Q4/Q5.
- Apple Silicon: variante de 4 bits que cabe en 16 GB de RAM mediante `vllm-mlx`.
- Opciones de despliegue: `vLLM`, `vllm-mlx`, `llama.cpp`, `text-generation-inference`; los GGUF son compatibles con llama.cpp y derivados.
- Latencia y throughput: no disponibles de forma numérica; el reempaquetado MTP está diseñado para acelerar la inferencia local mediante decodificación especulativa integrada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KORMo-Web-4B-MTP-Repacked | ~5,3B | no disponible | Agente web no-DOM, bilingüe en/ko | Apache 2.0 | HF (safetensors + GGUF) |
| Modelo base Qwen3.5-4B | ~4B | no disponible | LLM/VLM generalista | no disponible en la información | HF |
| Agentes web open-weight comparables | no disponible | no disponible | Agente GUI/web | no disponible | no disponible |

La información proporcionada no detalla nombres ni especificaciones de los agentes open-weight con los que el autor compara el modelo, por lo que no es posible completar una comparativa numérica fiable.

## Limitaciones y advertencias

- El modelo está especializado en tareas de navegador; su rendimiento en tareas generales de texto, código o matemáticas no está documentado y probablemente sea inferior a un LLM generalista del mismo tamaño.
- Solo soporta inglés y coreano; no hay evidencia de capacidades en castellano.
- La longitud de contexto no está especificada, lo que dificulta planificar tareas con historiales de pantalla muy largos.
- Riesgo de alucinación en la interpretación de capturas de pantalla y en la selección de coordenadas; una acción mal ubicada puede tener efectos reales en el navegador.
- El enfoque no-DOM puede fallar en interfaces con canvas, contenido dinámico o elementos visualmente ambiguos.
- Requiere un harness externo (Playwright o extensión de Chrome) para ejecutar acciones; el modelo por sí solo no controla el navegador.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3.5-4B para uso comercial en producción.
- La tasa de éxito del 42,3 % implica que más de la mitad de las tareas fallan; no es adecuado para automatizaciones críticas sin supervisión humana.
- Sesgos específicos: no documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prithivMLmods/KORMo-Web-4B-MTP-Repacked
- Modelo base: https://huggingface.co/KORMo-VL/KORMo-Web-4B
- GGUF (carpeta): https://huggingface.co/prithivMLmods/KORMo-Web-4B-MTP-Repacked/tree/main/GGUF
- Paper, blog, repositorio o demo del autor: no disponibles en la información proporcionada.
