# pumomo-ai/pumomo-models

## Resumen

`pumomo-ai/pumomo-models` no es un modelo entrenado por su autor, sino un repositorio espejo que agrupa copias byte a byte de varios modelos abiertos utilizados por la aplicación Pumomo. El repositorio contiene cuatro pesos en formato GGUF de tres familias distintas (SmolLM2 y Qwen3) más un paquete de síntesis de voz (Kokoro-82M empaquetado para sherpa-onnx). Cada fichero conserva el SHA-256 del original, lo que permite verificar su integridad.

El dato de parámetros reportado por la plataforma (596.049.920, es decir, unos 596 millones) corresponde al modelo base más grande del conjunto, Qwen3-0.6B, y no a un único modelo propio. El resto de pesos van desde los 360 millones de SmolLM2-360M-Instruct hasta los 4.000 millones de Qwen3-4B, pasando por Qwen3-1.7B. Todos los pesos de lenguaje están licenciados bajo Apache 2.0 y cuantizados a 8 bits (Q8_0) salvo Qwen3-4B, que usa Q4_K_M.

La relevancia de este repositorio es operativa: sirve como punto único de descarga reproducible para un stack de inferencia local orientado a dispositivos con recursos limitados (asistentes conversacionales, TTS multilingüe). No aporta innovaciones de arquitectura ni entrenamiento propios; su valor está en la trazabilidad de los binarios y en la compatibilidad declarada con endpoints conversacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Repositorio espejo multi-modelo (transformer decoder-only en los modelos de lenguaje; arquitectura de TTS en Kokoro) |
| Parametros totales | 596.049.920 (dato de safetensors, corresponde a Qwen3-0.6B); el conjunto incluye modelos de 360M, 0.6B, 1.7B y 4B |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q8_0 (SmolLM2-360M, Qwen3-0.6B, Qwen3-1.7B) y Q4_K_M (Qwen3-4B); Kokoro en int8 |
| Idiomas soportados | no disponible (Kokoro se distribuye como multi-lang) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelos de lenguaje) y tar.bz2 con modelo int8 para sherpa-onnx (TTS) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo. Los pesos de lenguaje son transformers decoder-only de las familias SmolLM2 (Hugging Face) y Qwen3 (Alibaba Cloud), distribuidos en cuantizaciones GGUF listas para llama.cpp y motores compatibles. SmolLM2-360M-Instruct está alineado para instrucciones; Qwen3-0.6B, Qwen3-1.7B y Qwen3-4B pertenecen a la generación Qwen3, que incorpora modos de razonamiento y no razonamiento según la configuración de la plantilla de chat.

El componente de voz es Kokoro-82M (hexgrad), un modelo TTS de 82 millones de parámetros empaquetado en formato int8 para el runtime sherpa-onnx de k2-fsa, con diccionario de pronunciación inglesa de misaki. No se dispone de datos sobre tokens de entrenamiento, composición del dataset ni procesos de RLHF/DPO en la información proporcionada; esos detalles deben consultarse en las model cards originales de cada modelo.

## Capacidades

- Generación de texto conversacional e instrucciones en los cuatro modelos de lenguaje del conjunto.
- Razonamiento de varios pasos en los modelos Qwen3 (0.6B, 1.7B y 4B), que soportan modo de pensamiento según la familia original.
- Generación de código y matemáticas a escala pequeña, limitada por el tamaño de los modelos (360M a 4B).
- Síntesis de voz multilingüe mediante Kokoro-82M empaquetado para sherpa-onnx.
- Compatibilidad declarada con endpoints conversacionales (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada para este repositorio (depende de cada modelo original).
- Soporte de agentes multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles como dato explícito; Kokoro se distribuye como multi-lang.

## Casos de uso

- Asistente conversacional en dispositivo: usar SmolLM2-360M-Instruct Q8_0 (0,39 GB) o Qwen3-0.6B Q8_0 (0,64 GB) para chats de baja latencia en móvil o navegador, donde el presupuesto de memoria es de pocos cientos de MB.
- Generación de texto en edge con mayor calidad: Qwen3-1.7B Q8_0 (1,83 GB) ofrece un equilibrio entre capacidad de razonamiento y huella de memoria para portátiles sin GPU dedicada.
- Razonamiento y código en estación de trabajo: Qwen3-4B Q4_K_M (2,50 GB) permite ejecutar tareas de generación de código y matemáticas en GPUs de consumo con 4-6 GB de VRAM.
- Síntesis de voz en aplicaciones de accesibilidad: Kokoro-82M int8 vía sherpa-onnx para lectura de texto a voz multilingüe en local, sin dependencia de servicios en la nube.
- Pipeline de CI/CD para pruebas de regresión de prompts: descargar los GGUF con verificación SHA-256 y ejecutar evaluaciones reproducibles con llama.cpp en contenedores ligeros.
- Prototipado de agentes con múltiples modelos: alternar entre los cuatro GGUF para comparar respuestas y coste computacional antes de fijar un modelo en producción.
- Servicio de inferencia autohospedado: desplegar los GGUF con llama.cpp, Ollama o vLLM (soporte GGUF) detrás de una API compatible con OpenAI para aplicaciones internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (Q8_0, aproximadamente igual al tamaño del fichero más overhead): SmolLM2-360M ~0,4-0,6 GB; Qwen3-0.6B ~0,7-0,9 GB; Qwen3-1.7B ~1,9-2,2 GB; Qwen3-4B Q4_K_M ~2,5-3,0 GB.
- GPU recomendadas: RTX 3060/4060 (8 GB) o superiores para Qwen3-4B; cualquier GPU con 4 GB o más para los modelos de 360M y 0.6B; A100/H100 no son necesarias para estos tamaños.
- Cabe en GPU de consumo: sí, todos los modelos del repositorio caben en GPUs consumer de 4-8 GB; los de 360M y 0.6B pueden ejecutarse incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), servidores compatibles con la API de OpenAI; Kokoro mediante sherpa-onnx.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SmolLM2-360M-Instruct (en este repo) | 360M | no disponible | Apache 2.0 | GGUF Q8_0 | Orientado a edge, muy ligero |
| Qwen3-0.6B (en este repo) | 0.6B | no disponible | Apache 2.0 | GGUF Q8_0 | Modo de razonamiento de la familia Qwen3 |
| Qwen3-1.7B (en este repo) | 1.7B | no disponible | Apache 2.0 | GGUF Q8_0 | Equilibrio calidad/memoria |
| Qwen3-4B (en este repo) | 4B | no disponible | Apache 2.0 | GGUF Q4_K_M | Mayor capacidad del conjunto |
| Kokoro-82M (en este repo) | 82M | no aplica | Apache 2.0 | int8 (sherpa-onnx) | TTS multilingüe |

No se dispone de datos de rendimiento comparado (benchmarks) en la información proporcionada para establecer una comparativa cuantitativa con alternativas externas.

## Limitaciones y advertencias

- El repositorio no es un modelo propio: cualquier limitación de los modelos originales (SmolLM2, Qwen3, Kokoro) se hereda sin cambios.
- Los modelos de 360M a 4B tienen capacidad limitada de razonamiento, matemáticas y código frente a modelos de mayor tamaño; riesgo elevado de alucinación en tareas complejas.
- No se documentan sesgos específicos en la información proporcionada; deben revisarse las model cards de los modelos originales.
- Longitud de contexto e idiomas soportados no están declarados en este repositorio; conviene consultar las fuentes originales antes de usarlo en producción.
- La licencia Apache 2.0 permite uso comercial, pero cada componente mantiene su propia atribución (Hugging Face, Qwen/Alibaba, hexgrad, k2-fsa, misaki); es necesario conservar los avisos correspondientes.
- La fecha de creación del repositorio (2026-11-23) y el recuento de descargas y likes (0) indican que se trata de un espejo reciente y sin adopción verificable; la reproducibilidad depende de la integridad SHA-256 de cada fichero.
- El tamaño del repo (5,5 GB) incluye todos los pesos; descargar solo el fichero necesario para evitar consumo innecesario de almacenamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/pumomo-ai/pumomo-models
- SmolLM2-360M-Instruct-GGUF: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct-GGUF
- Qwen3-0.6B-GGUF: https://huggingface.co/Qwen/Qwen3-0.6B-GGUF
- Qwen3-1.7B-GGUF: https://huggingface.co/Qwen/Qwen3-1.7B-GGUF
- Qwen3-4B-GGUF: https://huggingface.co/Qwen/Qwen3-4B-GGUF
- Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- sherpa-onnx (k2-fsa): https://github.com/k2-fsa/sherpa-onnx
- misaki (diccionario de pronunciación): https://github.com/hexgrad/misaki
