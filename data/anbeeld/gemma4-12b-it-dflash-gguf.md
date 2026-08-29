# Anbeeld/gemma4-12B-it-DFlash-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF del modelo *draft* **z-lab/gemma4-12B-it-DFlash**, diseñado para acelerar la inferencia del modelo generativo **Google Gemma 4 12B IT** mediante decodificación especulativa. El modelo *draft* utiliza una arquitectura de difusión ligera (DFlash) que genera múltiples tokens candidatos en paralelo, reduciendo la latencia de la generación autoregrasiva del modelo objetivo. Es una pieza clave para desplegar Gemma 4 12B en entornos con recursos limitados o donde el rendimiento en tiempo real es crítico.

La relevancia actual radica en que la decodificación especulativa se ha convertido en una técnica estándar para optimizar LLMs sin sacrificar calidad. Al ofrecer versiones GGUF de este *draft model*, el autor facilita su uso con **BeeLlama.cpp**, un fork de llama.cpp con soporte avanzado para este tipo de modelos. Esto permite a desarrolladores e investigadores integrar aceleración por hardware y software en sus pipelines de inferencia local.

El modelo base de referencia, `google/gemma-4-12B-it`, es un VLM (modelo de lenguaje y visión) de 12B parámetros con ventana de contexto de 128K tokens, desarrollado por Google. Sin embargo, este repositorio únicamente contiene el *draft model* cuantizado, no el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash (block diffusion para decodificacion especulativa) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo objetivo, Gemma 4 12B IT: 128K tokens) |
| Tipos de cuantizacion | GGUF (no se especifican los niveles exactos en la informacion disponible) |
| Idiomas soportados | no disponible (heredados del modelo objetivo, Gemma 4 12B IT soporta multiples idiomas) |
| Licencia | no disponible (revisar licencias de los repositorios upstream: google/gemma-4-12B-it y z-lab/gemma4-12B-it-DFlash) |
| Formato de pesos | GGUF (safetensors en el modelo original de z-lab) |

## Arquitectura y entrenamiento

El modelo **DFlash** se basa en un modelo de difusión por bloques (block diffusion) diseñado específicamente para decodificación especulativa. A diferencia de los *draft models* tradicionales basados en transformers autoregresivos, DFlash genera múltiples tokens candidatos en paralelo mediante un proceso de difusión, lo que permite un *throughput* de generación mucho mayor. El autor del repositorio (Anbeeld) indica que se debe usar con **BeeLlama.cpp**, un fork de llama.cpp con características avanzadas de cuantización y soporte nativo para DFlash.

No se dispone de información sobre los datos de entrenamiento del *draft model* ni sobre el proceso de entrenamiento. El modelo original de z-lab no incluye README, por lo que no se conocen detalles técnicos adicionales. El modelo objetivo `google/gemma-4-12B-it` es un transformer multimodal entrenado con técnicas de RLHF, pero ese detalle no aplica al *draft model* en sí.

## Capacidades

- **Decodificación especulativa**: genera borradores de tokens en paralelo para acelerar la inferencia del modelo objetivo (Gemma 4 12B IT).
- **Integración con BeeLlama.cpp**: requiere este fork específico de llama.cpp para funcionar correctamente.
- **Compatibilidad con el modelo objetivo**: diseñado exclusivamente para Gemma 4 12B IT, no es un modelo de propósito general.
- **No es autónomo**: no puede generar texto por sí mismo; depende del modelo objetivo para producir la salida final.
- **Capacidades del modelo objetivo (heredadas)**: si se usa con Gemma 4 12B IT, se obtienen las capacidades de ese modelo: generación de texto, razonamiento, código, visión, tool calling, etc., pero estas no son propias del *draft model*.

## Casos de uso

- **Aceleración de inferencia local**: desplegar Gemma 4 12B IT en una GPU consumer (p. ej., RTX 3090) con menor latencia gracias a la decodificación especulativa, útil para asistentes conversacionales en tiempo real.
- **Servidores de inferencia con alta concurrencia**: en entornos con múltiples peticiones simultáneas, el *draft model* reduce el tiempo de generación por petición, mejorando el *throughput* del sistema.
- **Prototipado rápido en entornos con recursos limitados**: permite probar Gemma 4 12B IT en hardware modesto (CPU+GPU pequeña) sin degradar demasiado la experiencia de usuario.
- **Investigación en decodificación especulativa**: sirve como punto de partida para estudiar y comparar técnicas de *drafting* basadas en difusión frente a las autoregresivas.
- **Despliegue en edge devices**: al ser un modelo ligero, puede ejecutarse en dispositivos con poca memoria, siempre que el modelo objetivo esté en otro dispositivo o en la nube.
- **Optimización de costes en la nube**: reducir el tiempo de cómputo por solicitud en instancias GPU, disminuyendo el coste económico de la inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de z-lab no incluye README y el autor de la cuantización no proporciona métricas de velocidad o calidad. Solo se menciona en el repositorio hermano de 31B que se probó con BeeLlama.cpp v0.2.0 en un sistema con RTX 3090, pero sin cifras concretas. Para obtener datos de rendimiento, se recomienda consultar el repositorio oficial de DFlash en GitHub.

## Requisitos de hardware

- **VRAM estimada**: no disponible. Dado que es un *draft model* ligero, se espera que ocupe significativamente menos memoria que el modelo objetivo (12B), pero no se especifica el tamaño exacto de las cuantizaciones.
- **GPU recomendadas**: el modelo objetivo Gemma 4 12B IT requiere al menos 10-12 GB de VRAM en cuantización Q4_K_M. El *draft model* debería caber en GPUs consumer como RTX 3060 (12 GB) o superiores, pero este dato no está confirmado.
- **Compatibilidad con consumer GPU**: sí, probablemente, dado que el objetivo es acelerar la inferencia en hardware modesto.
- **Opciones de despliegue**: BeeLlama.cpp (fork de llama.cpp) es el backend recomendado. También podría usarse con otros backends que soporten GGUF y decodificación especulativa, aunque no se garantiza compatibilidad.
- **Latencia y throughput**: no disponible. El rendimiento depende del modelo objetivo, del hardware y de la configuración de BeeLlama.cpp.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros *draft models* (p. ej., modelos draft autoregresivos como los de Medusa o EAGLE). El único dato comparativo es que el repositorio hermano `Anbeeld/gemma-4-31B-it-DFlash-GGUF` existe para el modelo de 31B, lo que sugiere que la técnica es escalable. Se recomienda consultar el repositorio de DFlash para comparativas con otras arquitecturas de decodificación especulativa.

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Anbeeld/gemma4-12B-it-DFlash-GGUF | Draft (difusion) | no disponible | no disponible | no disponible | GGUF |
| google/gemma-4-12B-it | Generativo (VLM) | 12B | 128K | Gemma license (uso comercial permitido con restricciones) | safetensors |
| Anbeeld/gemma-4-31B-it-DFlash-GGUF | Draft (difusion) | no disponible | no disponible | no disponible | GGUF |

## Limitaciones y advertencias

- **Dependencia del modelo objetivo**: este *draft model* no funciona de forma independiente; requiere Gemma 4 12B IT como modelo base. No puede generar texto por sí solo.
- **Compatibilidad restringida**: solo funciona con BeeLlama.cpp, no con llama.cpp estándar ni con otros backends sin modificaciones.
- **Falta de documentación**: el repositorio de z-lab no incluye README, por lo que se desconocen detalles de entrenamiento, arquitectura exacta y limitaciones específicas.
- **Licencia incierta**: la licencia no está especificada en este repositorio. Es imprescindible revisar las licencias de `google/gemma-4-12B-it` y `z-lab/gemma4-12B-it-DFlash` antes de cualquier uso comercial o redistribución.
- **Riesgo de alucinación y sesgos**: al ser un *draft model*, no introduce sesgos propios, pero hereda los del modelo objetivo. Gemma 4 12B IT puede presentar alucinaciones o sesgos típicos de los LLMs.
- **Calidad de la cuantización**: los GGUF pueden degradar la calidad si se usan cuantizaciones muy agresivas. No se especifican los niveles incluidos en este repositorio.
- **Fechas del repositorio**: el modelo fue creado en 2026, lo que sugiere que es reciente, pero no se ha verificado su mantenimiento o soporte continuo.

## Enlaces

- [Repositorio HuggingFace del modelo GGUF](https://huggingface.co/Anbeeld/gemma4-12B-it-DFlash-GGUF)
- [Modelo draft original de z-lab](https://huggingface.co/z-lab/gemma4-12B-it-DFlash)
- [Modelo objetivo Gemma 4 12B IT de Google](https://huggingface.co/google/gemma-4-12b-it)
- [Repositorio hermano para Gemma 4 31B](https://huggingface.co/Anbeeld/gemma-4-31B-it-DFlash-GGUF)
- [BeeLlama.cpp (fork de llama.cpp)](https://github.com/Anbeeld/beellama.cpp)
- [Repositorio DFlash en GitHub](https://github.com/z-lab/dflash)
