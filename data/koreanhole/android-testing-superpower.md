# koreanhole/android-testing-superpower

## Resumen

`koreanhole/android-testing-superpower` es un modelo de lenguaje pequeño (SLM) especializado en testing autónomo de aplicaciones Android, desarrollado por el usuario `koreanhole` como parte del framework `android-testing-superpower`. Está basado en `Qwen/Qwen2.5-Coder-7B` y ha sido fine-tuneado mediante una combinación de SFT y DPO (Direct Preference Optimization) con 20 iteraciones de Post-Loop DPO Policy Optimization. Su objetivo es resolver los fallos más comunes en la automatización de pruebas end-to-end en Android, como la ambigüedad de bounds en Compose, los popups de permisos OEM, los offsets táctiles en drawer y la alucinación de composables anónimos.

El modelo se presenta como una alternativa on-device para equipos que necesitan automatizar pruebas móviles sin depender de servicios en la nube. Su relevancia actual radica en que aborda problemas concretos de testing móvil que los modelos generalistas no resuelven bien, y ofrece mejoras significativas frente al baseline de Qwen2.5-Coder-7B en las cuatro tareas evaluadas. La arquitectura es un transformer decoder-only con 7B parámetros, heredada del modelo base, aunque la longitud de contexto no se especifica en la documentación disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tune de Qwen2.5-Coder-7B) |
| Parametros totales | 7B (base: Qwen2.5-Coder-7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit, 8-bit y pesos completos (safetensors/GGUF) |
| Idiomas soportados | Inglés (en) y coreano (ko) |
| Licencia | Apache 2.0 (los pesos base están sujetos a la Qwen Community License Agreement) |
| Formato de pesos | Safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `Qwen2.5-Coder-7B`, un transformer decoder-only originalmente entrenado para tareas de código. El proceso de fine-tuning combina SFT y DPO con 20 iteraciones de Post-Loop DPO Policy Optimization, utilizando pares de preferencia curados en el archivo `dpo_pairs.jsonl`. Estos pares están centrados en los cuatro modos de fallo que el modelo pretende resolver: ambigüedad de bounds subpixel en Compose, bloqueo por popups de permisos OEM, offset táctil en drawer y alucinación de composables anónimos. No se especifica el número de tokens ni la composición completa del dataset de entrenamiento.

La principal innovación técnica es la optimización específica para el testing autónomo de Android, integrada con el framework `android-testing-superpower`. El modelo está diseñado para interactuar con UIAutomator y generar escenarios de prueba precisos. Además, el repositorio incluye un `Modelfile` para Ollama con temperatura optimizada de 0.05 y guardrails de prompt, lo que facilita el despliegue local.

## Capacidades

- Generación de escenarios de test end-to-end para aplicaciones Android, especialmente aquellas construidas con Jetpack Compose.
- Generación de código de prueba (Kotlin/Java) y planificación de casos de prueba en formato Given-When-Then.
- Manejo de popups de permisos OEM y overlays de sistema que bloquean la ejecución de tests.
- Navegación en drawer y gestos táctiles con márgenes de seguridad para evitar toques no intencionados.
- Reducción de la alucinación de composables anónimos al planificar tests, evitando referencias a IDs de vistas legacy.
- Soporte de agentes y razonamiento multi-paso dentro del framework `android-testing-superpower`.
- Capacidades multilingües en inglés y coreano.
- No se especifica soporte explícito de tool calling, aunque está diseñado para integrarse como agente en un framework de testing autónomo.

## Casos de uso

- Testing end-to-end de aplicaciones Android con Jetpack Compose: el modelo genera tests que apuntan a composables interactivos en lugar de contenedores, reduciendo fallos por ambigüedad de bounds subpixel.
- Automatización de pruebas de regresión en CI/CD: se integra con `android-cli-superpowers` para ejecutar tests autónomos sobre cada commit, comparando con `HEAD~1`.
- Validación de permisos OEM en dispositivos reales: detecta y evita popups de permisos que bloquean la ejecución de tests, con recuperación dinámica.
- Generación de casos de prueba para actividades específicas: por ejemplo, para `LoginActivity`, genera escenarios de test completos y ejecutables.
- Ejecución on-device en entornos sin acceso a la nube: al ser un SLM, puede ejecutarse localmente con Ollama, ideal para equipos que no pueden enviar datos a servicios externos.
- Soporte de navegación compleja en drawer: genera secuencias de interacción con offsets táctiles seguros, evitando fallos por toques en el borde de la pantalla.
- Asistente para desarrolladores que escriben tests manuales: puede generar borradores de tests Given-When-Then sin alucinar IDs de vistas legacy.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, la model card incluye una evaluación específica de los cuatro modos de fallo objetivo, comparando el modelo fine-tuneado con el baseline de Qwen2.5-Coder-7B:

| Modo de fallo | App objetivo | Baseline (Qwen2.5-Coder-7B) | Fine-tuned (v2.0-dpo) | Mejora principal |
|---|---|---|---|---|
| Ambigüedad de bounds subpixel en Compose | Sunflower | 87.0% | 98.5% | Apunta a composables interactivos sobre bounds de contenedores |
| Bloqueo por popups de permisos OEM | Calendar | 85.0% | 99.2% | Bypass heurístico de baja latencia y recuperación dinámica |
| Offset táctil en navegación por drawer | K-9 Mail | 89.0% | 98.9% | Margen de seguridad (+48dp) e interacciones secuenciadas |
| Alucinación de composables anónimos | Tachiyomi | 84.0% (9/15) | 98.0% (15/15) | Planificación Given-When-Then sin alucinar IDs de vistas legacy |

## Requisitos de hardware

- VRAM estimada para inferencia: entre 4 y 5 GB para cuantización 4-bit, entre 8 y 9 GB para 8-bit, y entre 14 y 16 GB para pesos completos. Estas son estimaciones basadas en el tamaño del modelo y no constituyen datos oficiales.
- GPU recomendadas: una RTX 4090 (24 GB) permite ejecutar el modelo en cualquier cuantización con margen. Para pesos completos o cargas de trabajo elevadas, se recomiendan A100 o H100.
- Sí cabe en GPUs de consumo: con cuantización 4-bit u 8-bit, modelos como la RTX 3060 de 12 GB o superiores pueden ejecutarlo.
- Opciones de despliegue: Ollama (recomendado, con `Modelfile` incluido), llama.cpp, vLLM y TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion | Resultados en fallos Android |
|---|---|---|---|---|---|
| `koreanhole/android-testing-superpower` | 7B | No disponible | Apache 2.0 | Testing autonomo de Android | 98.5%, 99.2%, 98.9%, 98.0% |
| `Qwen/Qwen2.5-Coder-7B` (baseline) | 7B | No disponible | Apache 2.0 | Generacion de codigo | 87.0%, 85.0%, 89.0%, 84.0% |

No se han identificado otros modelos comparables de testing autonomo de Android en la informacion disponible. La comparativa se limita al modelo base, que es la referencia directa en la evaluacion incluida en la model card.

## Limitaciones y advertencias

- El modelo es nuevo y no tiene descargas ni likes en HuggingFace, por lo que carece de validacion en produccion.
- Solo soporta ingles y coreano, lo que limita su uso en equipos con otros idiomas.
- Los pesos base estan sujetos a la Qwen Community License Agreement, que puede imponer condiciones adicionales a la licencia Apache 2.0.
- No se han publicado benchmarks estandar (MMLU, HumanEval, etc.) que permitan comparar su rendimiento general con otros modelos.
- La evaluacion disponible se limita a cuatro aplicaciones especificas y puede no generalizar a otros proyectos Android.
- El modelo depende del framework `android-testing-superpower` y de UIAutomator, por lo que su uso fuera de este ecosistema puede requerir adaptaciones.
- La alucinacion de composables anonimos se reduce, pero no se elimina por completo.
- No se ha evaluado el riesgo de sesgos ni la robustez ante entradas adversas.

## Enlaces

- HuggingFace: https://huggingface.co/koreanhole/android-testing-superpower
- GitHub del framework: https://github.com/koreanhole/android-testing-superpower
