# Nekodeus/codegemma-7b-it-openvino

## Resumen

`Nekodeus/codegemma-7b-it-openvino` es una conversión a formato OpenVINO IR del modelo `google/codegemma-7b-it`, publicada por el usuario Nekodeus. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: el autor aplicó cuantización INT8 solo sobre pesos (weight-only, vía NNCF) al checkpoint original de Google y exportó el resultado con `optimum-cli`, en un entorno Kaggle sin GPU y totalmente offline.

El modelo subyacente es CodeGemma-7B-it, un transformer decoder-only de tipo `GemmaForCausalLM` con aproximadamente 8.500 millones de parámetros y 8.192 tokens de contexto, especializado en generación y síntesis de código con ajuste por instrucciones. La relevancia de esta publicación no está en el modelo en sí, sino en el empaquetado: permite ejecutar un modelo de código de 7-8B en CPUs x86 sin GPU mediante el runtime de Intel, algo útil para entornos de desarrollo locales, CI o máquinas sin acelerador dedicado.

El repo ocupa 8,6 GB y, en el momento de redactar esta ficha, no registra descargas ni valoraciones, por lo que no existe evidencia pública de validación por parte de terceros. La licencia aplicable es la Gemma Terms of Use del modelo original, no una licencia permisiva derivada de la conversión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`GemmaForCausalLM`) |
| Parámetros totales | 8.500 millones (según la model card del autor de la conversión) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantización | INT8 weight-only (NNCF); activaciones FP16/FP32 según el trazado |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use |
| Formato de pesos | OpenVINO IR (`.xml` + `.bin`) con pesos INT8 |
| Tarea declarada | `text-generation` |
| Librería | `openvino` / `optimum-intel` |
| Tamaño del repositorio | 8,6 GB |
| Herramientas de conversión | `optimum-intel 2.2.0`, `openvino 2026.4.1`, `transformers 5.16.1` |

## Arquitectura y entrenamiento

La arquitectura es la del Gemma original: un transformer decoder-only denso con atención multi-cabeza, RoPE y normalización RMSNorm, empaquetado como `GemmaForCausalLM`. El autor de la conversión no aporta detalles sobre el entrenamiento del checkpoint base; la model card se limita a describirlo como un modelo de código ajustado por instrucciones, orientado a síntesis de programas en Python, con una formulación poco precisa ("Gemma-1B coder head on Gemma-7B base") que no se puede verificar con la información disponible. No se indican número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO.

La innovación técnica de esta publicación es exclusivamente de despliegue: la exportación a OpenVINO IR con cuantización INT8 de pesos reduce el espacio ocupado y acelera la inferencia en CPU, manteniendo las activaciones en FP16/FP32 tal y como se trazaron durante la conversión. El resultado es un grafo optimizado para el runtime de Intel, no un checkpoint portable a otros motores sin reconversión.

## Capacidades

- Generación de código: síntesis de funciones y programas completos, con sesgo declarado hacia Python en la model card.
- Relleno de código (fill-in-the-middle) y completado en línea, herencia de la familia CodeGemma, aunque la model card no lo detalla explícitamente.
- Conversación multi-turno mediante la plantilla de chat de Gemma (`<start_of_turn>user ... <end_of_turn>`), tal y como muestra el ejemplo de uso del autor.
- Generación de texto general y explicaciones técnicas en lenguaje natural.
- Razonamiento sobre fragmentos de código: lectura de contexto y propuesta de modificaciones.
- No se declara soporte de tool calling ni function calling.
- No se declara modo de razonamiento explícito (thinking), ni capacidades de visión o audio.
- Idiomas: no disponible; la model card no especifica cobertura lingüística.

## Casos de uso

- Autocompletado de código en IDE local: el modelo puede servirse desde OpenVINO en CPU y responder a peticiones de completado sin GPU dedicada, lo que encaja en equipos de desarrollo de gama media y en políticas corporativas que prohíben enviar código a APIs externas.
- Asistente de refactorización en un pipeline de CI: dado un diff o un fichero, el modelo genera una propuesta de cambio que se valida con tests automáticos antes de abrir el pull request; sus 8.192 tokens de contexto permiten incluir el fichero completo junto con instrucciones.
- Generación de tests unitarios: a partir de una función y su firma, producir casos de prueba en Python que el pipeline ejecuta y mide en cobertura.
- Documentación técnica automatizada: generar docstrings y ficheros README a partir del código fuente, aprovechando que el modelo se ejecuta en local y no expone propiedad intelectual a terceros.
- Enseñanza y soporte a estudiantes: explicación paso a paso de fragmentos de código y depuración de errores en un entorno con CPU, donde el coste de infraestructura es el factor limitante.
- Prototipado rápido de scripts de automatización: convertir una descripción en lenguaje natural en un script de Python ejecutable, con revisión humana posterior.
- Despliegue en dispositivos edge x86 o servidores sin GPU: al estar en formato OpenVINO IR, se integra mediante `ov::genai::LLMPipeline` en aplicaciones C++ o servicios ligeros donde no hay acelerador disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card del autor no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación, y la búsqueda web realizada no ha devuelto resultados técnicos utilizables. Tampoco se han publicado mediciones de latencia o throughput de esta conversión concreta.

## Requisitos de hardware

- VRAM estimada: no aplica si se ejecuta en CPU. Para uso en GPU con este mismo artefacto, el runtime de OpenVINO necesitaría el dispositivo GPU de Intel; los 8,6 GB de pesos INT8 implican del orden de 9-10 GB de memoria si se carga el modelo completo.
- Espacio en disco: 8,6 GB para el repositorio completo.
- CPU: cualquier x86-64 con soporte AVX2 o superior; el modelo está pensado para inferencia en CPU mediante OpenVINO.
- GPU: no se documenta compatibilidad con CUDA. Para GPU NVIDIA habría que recurrir al checkpoint original o a una conversión GGUF/AWQ distinta.
- Cabe en GPU de consumo solo si se reconvierte el formato: en su estado actual está orientado a CPU.
- Opciones de despliegue: `optimum-intel` (`OVModelForCausalLM`), OpenVINO GenAI (`ov::genai::LLMPipeline`) y OpenVINO Model Server. No es compatible directamente con vLLM, TGI, llama.cpp u Ollama sin reconvertir el modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Estado en HuggingFace |
|---|---|---|---|---|---|
| `Nekodeus/codegemma-7b-it-openvino` | 8,5B | 8.192 | OpenVINO IR INT8 | Gemma Terms of Use | Acceso abierto, sin descargas registradas |
| `google/codegemma-7b-it` | 8,5B | 8.192 | Safetensors (BF16) | Gemma Terms of Use | Gated, requiere aceptar términos |
| `google/codegemma-2b` | 2B | 8.192 | Safetensors | Gemma Terms of Use | Gated |
| `meta-llama/CodeLlama-7b-Instruct-hf` | 7B | 16.384 | Safetensors | Llama 2 Community License | Gated |

La comparación relevante es con el checkpoint original: esta conversión pierde precisión (INT8 frente a BF16) y ligereza de integración con el ecosistema `transformers`/`vLLM`, pero gana en ejecución sobre CPU y en facilidad de acceso al no estar tras el gate de HuggingFace. Los datos de rendimiento comparado no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Licencia: se hereda la Gemma Terms of Use, que incluye una política de uso prohibido y obligaciones de atribución. Cualquier uso comercial debe revisarse contra esos términos, no contra la licencia del repositorio de conversión.
- El repositorio se publica como "un-gated" aunque el modelo original está restringido en HuggingFace; conviene verificar que la redistribución cumple los términos de Gemma antes de usarlo en producción.
- Repositorio sin validación comunitaria: cero descargas y cero valoraciones en el momento de la ficha, sin tests publicados de la conversión.
- La cuantización INT8 weight-only puede degradar la calidad de generación de código frente al checkpoint BF16; no se han publicado evaluaciones comparativas que lo cuantifiquen.
- Riesgo de alucinación de APIs, librerías y firmas de funciones, habitual en modelos de código de este tamaño; requiere validación con tests.
- Ventana de contexto de 8.192 tokens: insuficiente para repositorios grandes o para incluir múltiples ficheros y el historial de conversación completo.
- Idiomas no declarados; es previsible un rendimiento inferior en castellano que en inglés, aunque no hay datos que lo confirmen.
- Sesgos: no se documenta ningún análisis de sesgos del modelo base ni de la conversión.
- Portabilidad limitada: al estar en OpenVINO IR, no se puede cargar con `transformers` estándar, vLLM ni llama.cpp sin una nueva exportación.
- Fecha de creación del repositorio (2026-10-17) y versiones de herramientas citadas (`openvino 2026.4.1`, `transformers 5.16.1`) deben comprobarse antes de reproducir el proceso.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Nekodeus/codegemma-7b-it-openvino
- Modelo base: https://huggingface.co/google/codegemma-7b-it

No se han encontrado en la búsqueda web otros enlaces relevantes (papers, blogs, repositorios o demos) asociados a esta conversión concreta.
