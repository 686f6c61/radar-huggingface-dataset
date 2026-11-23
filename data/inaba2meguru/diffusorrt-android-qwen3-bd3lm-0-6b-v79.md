# Inaba2Meguru/DiffusorRT-Android-Qwen3-BD3LM-0.6B-V79

## Resumen

DiffusorRT-Android-Qwen3-BD3LM-0.6B-V79 es un paquete de ejecución compilado, publicado por el usuario Inaba2Meguru, que adapta el modelo de difusión por bloques Qwen3-0.6B-diffusion-bd3lm-v0.1 (del repositorio dllm-hub) para su ejecución en la NPU Hexagon V79 de un teléfono con SoC Qualcomm Snapdragon 8 Elite (SM8750). No se trata de un checkpoint de Transformers ni de una aplicación, sino de un conjunto de binarios de contexto `qnn.htp` generados con QAIRT 2.45.0.260326, junto con los activos de tokenizador (`bpe.json`) y la ficha de modelo de la app (`phone.json`).

El modelo subyacente es un modelo de lenguaje de 0,6 mil millones de parámetros con arquitectura de difusión de bloques (block diffusion), derivado de la familia Qwen3 y entrenado por el equipo de dllm-hub. La relevancia de esta ficha reside en que documenta un caso poco habitual: la distribución de un modelo generativo en formato compilado para acelerador móvil, con cuantización FP16 y dependencia estricta del hardware objetivo.

El paquete ocupa 4,3 GB en el repositorio de Hugging Face y está pensado para integrarse en la aplicación DiffusorRT para Android, que copia los archivos a la ruta `Android/data/ai.diffusorrt.phone/files/models/qwen3-bd3-v79/`. La licencia declarada es Apache 2.0, heredada del modelo base, con atribución a los autores originales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión por bloques (block diffusion) sobre base Qwen3; ejecución compilada para NPU Qualcomm Hexagon V79 |
| Parámetros totales | 0,6 mil millones (aproximado, según el nombre del modelo base) |
| Parámetros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP16 (único formato documentado en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Binarios de contexto QNN (`qnn.htp`) para QAIRT 2.45.0.260326; activos auxiliares `phone.json` y `bpe.json`; no incluye safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es Qwen3-0.6B-diffusion-bd3lm-v0.1, una variante de difusión por bloques (block diffusion) construida sobre la arquitectura Qwen3. En lugar de la generación autorregresiva token a token, este enfoque genera bloques de tokens mediante un proceso de difusión, lo que en principio permite paralelizar la decodificación dentro de cada bloque. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La innovación técnica de este repositorio concreto no está en el entrenamiento, sino en el despliegue: los pesos originales se han compilado con Qualcomm QAIRT 2.45.0.260326 para producir binarios de contexto que se ejecutan exclusivamente en la NPU Hexagon V79 del Snapdragon 8 Elite. El paquete incluye además un manifiesto `android-pack.json` con rutas, tamaños y hashes SHA-256 de cada archivo, y referencias cruzadas a un paquete equivalente para iPhone (4,26 GB en total). No se documentan técnicas como decodificación especulativa ni atención lineal.

## Capacidades

- Generación de texto conversacional: el modelo base se describe como un modelo de chat con difusión por bloques.
- Generación no autorregresiva por bloques: la decodificación se realiza mediante difusión de bloques, no token a token.
- Ejecución en NPU móvil: inferencia acelerada en el Hexagon V79 del Snapdragon 8 Elite mediante binarios QNN.
- Integración con la app DiffusorRT: el paquete incluye ficha de modelo (`phone.json`) y tokenizador (`bpe.json`) listos para la aplicación.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Asistente conversacional offline en smartphone: el paquete está diseñado para ejecutarse íntegramente en la NPU de un Snapdragon 8 Elite, lo que permite un chatbot local sin conexión a servicios en la nube, adecuado para escenarios de privacidad.
- Prototipado de modelos de difusión en dispositivos móviles: investigadores que estudien la viabilidad de la decodificación por difusión de bloques en hardware móvil pueden usar este paquete como referencia reproducible con hashes SHA-256 verificables.
- Evaluación de rendimiento de NPU Hexagon: el paquete permite medir latencia y throughput de un modelo de 0,6B en FP16 sobre la NPU V79, con resultados específicos del dispositivo y del prompt.
- Integración en aplicaciones Android de terceros: mediante el manifiesto `android-pack.json` y la ruta de destino documentada, un desarrollador puede incorporar el modelo a una app propia que replique el flujo de DiffusorRT.
- Comparación de despliegue Android frente a iOS: el repositorio enlaza un paquete para iPhone, lo que facilita estudios comparativos de rendimiento entre plataformas con el mismo modelo base.
- Docencia y demostraciones de IA generativa en móvil: al ser un modelo pequeño (0,6B) y con licencia Apache 2.0, resulta adecuado para talleres y demostraciones sobre inferencia en dispositivo sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente que los resultados de hardware, cuando se reportan, son específicos del dispositivo y del prompt, sin aportar cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional; el modelo se ejecuta en la NPU del SoC, no en una GPU discreta. El paquete completo ocupa 4,3 GB en disco.
- GPU recomendadas: no aplica; el destino es la NPU Hexagon V79 integrada en el Qualcomm Snapdragon 8 Elite (SM8750).
- Compatibilidad con GPU de consumo: no es compatible con GPU de escritorio (A100, H100, RTX 4090, etc.); los binarios `qnn.htp` solo se ejecutan en la NPU de ese SoC concreto.
- Opciones de despliegue: aplicación DiffusorRT para Android con QAIRT 2.45.0.260326; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DiffusorRT-Android-Qwen3-BD3LM-0.6B-V79 | 0,6B (aprox.) | no disponible | Binarios QNN para NPU Hexagon V79 | Apache 2.0 | Repositorio de Hugging Face, 0 descargas |
| dllm-hub/Qwen3-0.6B-diffusion-bd3lm-v0.1 | 0,6B (aprox.) | no disponible | Pesos originales (formato no detallado en la información disponible) | no disponible en esta ficha | Modelo base en Hugging Face |
| Qwen3-0.6B (modelo autorregresivo original) | 0,6B (aprox.) | no disponible en esta ficha | safetensors, GGUF y otros | Apache 2.0 (según la familia Qwen3) | Amplia disponibilidad en Hugging Face |

La comparación se limita a estos tres elementos porque la información proporcionada no incluye datos de rendimiento que permitan contrastar benchmarks con alternativas.

## Limitaciones y advertencias

- Dependencia estricta de hardware: los binarios de contexto solo se ejecutan en la NPU Hexagon V79 del Snapdragon 8 Elite (SM8750); no funcionan en otros SoC ni en GPU de escritorio.
- No es un checkpoint reutilizable: no contiene safetensors ni GGUF, por lo que no puede cargarse con Transformers, vLLM, llama.cpp u otras herramientas estándar.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a los modelos generativos de 0,6B.
- Limitaciones de contexto e idioma: no disponible; la model card no documenta la ventana de contexto ni los idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener la atribución a los autores originales de dllm-hub y consultar el archivo `Licenses/BD3LM` incluido en el repositorio.
- Resultados de rendimiento: cualquier cifra de latencia o throughput es específica del dispositivo y del prompt, y no debe generalizarse.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una validación comunitaria mínima.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Inaba2Meguru/DiffusorRT-Android-Qwen3-BD3LM-0.6B-V79
- Modelo base: https://huggingface.co/dllm-hub/Qwen3-0.6B-diffusion-bd3lm-v0.1
- Revisión concreta del modelo base citada: https://huggingface.co/dllm-hub/Qwen3-0.6B-diffusion-bd3lm-v0.1/tree/60f77bba67ba94231c16f5fb29bc66c500b038f1
- Licencia y atribución incluidas en el repositorio: `Licenses/BD3LM` (ruta interna del repositorio)
- Manifiesto de integración: `android-pack.json` (ruta interna del repositorio)
- Paquete de ejecución: `package/` (ruta interna del repositorio)
