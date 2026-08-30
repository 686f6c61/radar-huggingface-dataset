# CNWPlayer/Vega-1.5-128M-CodeCompletion

## Resumen

Vega-1.5-128M-CodeCompletion es un modelo de completado de código de 128 millones de parámetros desarrollado por CNWPlayer, especializado exclusivamente en el lenguaje Python. Se trata de la segunda iteración de la familia Vega, sucesora del modelo VegaLM1-42M-CodeCompletion, y está diseñado para ofrecer autocompletado de código eficiente en entornos con recursos limitados. El modelo se entrenó sobre aproximadamente 5.500 millones de tokens del subconjunto Python de stack-v3-train, un dataset masivo de código fuente de GitHub.

La arquitectura es un transformer decoder-only de estilo Llama, con 16 capas, tamaño oculto de 768 y una ventana de contexto de 2.048 tokens. A pesar de su tamaño reducido, el autor reporta un Elo de 1434 en el benchmark propietario Bananamind Base Bench 1.1 para completado de código, situándolo como el segundo mejor modelo de su categoría, solo por detrás de SmolLM. Su licencia MIT permite uso comercial sin restricciones, lo que lo convierte en una opción atractiva para integraciones en productos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo Llama) |
| Parametros totales | 128.412.672 (según safetensors) / 128.410.368 (según model card) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Solo Python (no multilingüe) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only convencional, similar a la familia Llama, con 16 capas, tamaño oculto de 768, 12 cabezas de atención, 6 cabezas KV (grouped-query attention) y un tamaño intermedio de 2.048. El vocabulario consta de 32.003 tokens, e incorpora un tokenizador nuevo respecto a la versión anterior. No se especifica el uso de técnicas como RLHF o DPO; el entrenamiento se centra en el modelado de lenguaje autorregresivo estándar para completado de código.

El entrenamiento se realizó sobre aproximadamente 5.500 millones de tokens del subconjunto Python de stack-v3-train. El autor menciona que se intentó aplicar Fill-in-the-Middle (FIM) pero no funcionó correctamente, por lo que el modelo solo genera código de forma autorregresiva hacia adelante. No se han publicado detalles sobre el proceso de entrenamiento (optimizador, tasa de aprendizaje, número de épocas, etc.).

## Capacidades

- Generación de código Python: autocompletado de funciones, clases, expresiones y estructuras de control.
- Completado de código en contexto: dado un fragmento de código, el modelo continúa la secuencia de forma coherente.
- Generación de snippets: puede producir fragmentos cortos de código para tareas comunes (manejo de archivos, operaciones con listas, etc.).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni modo agente.
- No tiene capacidades multimodales (visión, audio).
- No es multilingüe: solo comprende Python.

## Casos de uso

- Autocompletado en editores de código: integración en VS Code, Neovim o JetBrains mediante extensiones que envíen el contexto actual al modelo y muestren sugerencias en tiempo real. Su tamaño reducido permite ejecutarlo localmente sin latencia perceptible.
- Asistente de programación en entornos con recursos limitados: ideal para portátiles sin GPU o servidores con poca memoria, donde modelos más grandes no son viables.
- Generación de código de prueba: puede generar casos de prueba simples para funciones Python, ayudando en el desarrollo dirigido por pruebas (TDD).
- Prototipado rápido: permite esbozar funciones o algoritmos básicos a partir de un prompt inicial, acelerando la fase de exploración.
- Educación: útil para estudiantes de programación que necesitan sugerencias de completado mientras aprenden sintaxis de Python.
- Pipelines de CI/CD: puede integrarse en scripts de automatización para generar código de ejemplo o documentación de funciones, aunque su limitación a Python restringe su uso a proyectos de ese lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor menciona un Elo de 1434 en el benchmark propietario Bananamind Base Bench 1.1 para completado de código, indicando que supera a su modelo anterior (42M) y que solo es superado por SmolLM en su categoría. Sin embargo, no se proporcionan cifras comparativas detalladas ni metodología del benchmark.

## Requisitos de hardware

- VRAM estimada: con 128M parámetros, el modelo ocupa aproximadamente 0,5 GB en FP32, 0,25 GB en cuantización de 8 bits y 0,125 GB en 4 bits. Puede ejecutarse en GPU con 1 GB de VRAM o incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluyendo NVIDIA GTX 1050, RTX 2060, o integradas como Intel Iris Xe. También funciona en Apple Silicon.
- Compatibilidad con consumer GPU: sí, es perfectamente viable en hardware de consumo.
- Opciones de despliegue: compatible con llama.cpp, Ollama, vLLM (con adaptaciones), y cualquier framework que soporte modelos Llama. También puede ejecutarse con transformers de HuggingFace.
- Latencia y throughput: no se dispone de datos medidos, pero por su tamaño se espera una latencia de pocos milisegundos por token en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de datos técnicos completos de modelos comparables como SmolLM (135M) o el propio VegaLM1-42M para realizar una comparación cuantitativa. Según el autor, Vega-1.5-128M supera a su predecesor de 42M y es segundo tras SmolLM en el benchmark Bananamind, pero no se aportan cifras concretas. Se recomienda consultar las fichas de SmolLM y otros modelos de tamaño similar para una evaluación directa.

## Limitaciones y advertencias

- El modelo solo comprende Python; no genera código en otros lenguajes.
- La ventana de contexto es de 2.048 tokens, lo que limita la capacidad de manejar archivos de código extensos o dependencias lejanas.
- Al estar entrenado en un subconjunto de stack-v3, puede reflejar sesgos presentes en el código de GitHub, como estilos de programación dominantes o patrones de baja calidad.
- Riesgo de alucinación: puede generar código sintácticamente válido pero semánticamente incorrecto, especialmente en funciones complejas o APIs poco comunes.
- No es un modelo instructivo: no responde a instrucciones en lenguaje natural, solo completa secuencias de código.
- No se han publicado evaluaciones de seguridad ni de sesgos; se recomienda validar el código generado antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CNWPlayer/Vega-1.5-128M-CodeCompletion
- Perfil del autor: https://huggingface.co/CNWPlayer
- Modelo anterior (VegaLM1-42M): https://huggingface.co/CNWPlayer/VegaLM1-42M-CodeCompletion
