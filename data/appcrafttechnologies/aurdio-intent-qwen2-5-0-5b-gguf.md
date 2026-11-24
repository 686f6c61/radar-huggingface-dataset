# appcrafttechnologies/aurdio-intent-qwen2.5-0.5b-gguf

## Resumen

Aurdio Intent es un ajuste fino supervisado (LoRA) del modelo Qwen2.5-0.5B-Instruct de Alibaba Cloud, desarrollado por AppCraft Technologies para su reproductor de música Aurdio en Android. Su función es convertir una petición breve en lenguaje natural ("sube los graves", "pasa a la siguiente canción", "qué significa DAC") en una acción JSON tipada que la aplicación valida y ejecuta con código determinista propio. No es un modelo conversacional de propósito general: está especializado en mapear intenciones a un esquema cerrado de 20 acciones (ajustes de ecualizador por banda, presets, transporte de reproducción, volumen, deshacer/confirmar/reset, ayuda y rechazo educado de peticiones fuera de alcance).

El modelo se distribuye únicamente en formato GGUF con cuantización Q4_K_M (397.807.360 bytes, unos 0,4 GB) y está pensado para ejecutarse íntegramente en el teléfono mediante llama.cpp, sin que ninguna petición ni salida abandone el dispositivo. La arquitectura subyacente es la de Qwen2.5-0.5B-Instruct, un transformer decoder-only de 494.032.768 parámetros totales.

Su relevancia radica en el patrón de diseño: un modelo pequeño y especializado que actúa como capa de interpretación de intenciones, con la seguridad delegada a código determinista (comprobación de rangos, protección de clipping, confirmación del usuario). Es un ejemplo práctico de inferencia en dispositivo con requisitos de hardware mínimos y licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-0.5B-Instruct), ajuste fino LoRA fusionado |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (única publicada) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (`aurdio-intent-qwen2.5-0.5b-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5 mil millones de parámetros. Sobre esa base se aplicó un ajuste fino LoRA con r=16, alpha=32, 3 épocas y tasa de aprendizaje 2e-4; posteriormente el adaptador se fusionó en los pesos base y el resultado se convirtió a GGUF en cuantización Q4_K_M.

El conjunto de entrenamiento consta de aproximadamente 36.000 ejemplos sintéticos en inglés, generados de forma programática contra el esquema de acciones propio de Aurdio, incluyendo variedad de formulaciones, erratas y lenguaje informal. No se emplearon datos de usuario, datos personales ni contenido extraído de la web. La model card no documenta el número de tokens de entrenamiento ni fases de RLHF o DPO; el procedimiento descrito es exclusivamente ajuste supervisado. El SHA-256 del fichero publicado es `c57556065df54ae9d1d66075e241b41329a3b668720de875a72efd391303f203` y la versión del modelo está fechada el 2026-09-22.

## Capacidades

- Clasificación de intenciones y generación de acciones JSON tipadas dentro del esquema de Aurdio (20 acciones soportadas).
- Ajustes de ecualizador con deltas en dB por banda.
- Aplicación de presets de sonido con nombre, transporte de reproducción (siguiente, anterior, pausa), control de volumen, deshacer, confirmar y reset.
- Carga de presets guardados.
- Explicación de términos de audio (por ejemplo, qué significa DAC).
- Respuesta de ayuda y rechazo educado de peticiones no soportadas o fuera de alcance.
- Tolerancia a erratas y formulaciones informales en inglés, gracias a los ejemplos sintéticos de entrenamiento.
- No soporta tool calling genérico, agentes multi-paso, visión, audio de entrada ni modo de razonamiento extendido; la model card lo restringe explícitamente a su formato de prompt y esquema de acciones.

## Casos de uso

- Asistente de voz en reproductor de música móvil: el modelo recibe la transcripción de la petición del usuario y devuelve la acción JSON que la app ejecuta; encaja por su tamaño de 0,4 GB y su ejecución local con llama.cpp.
- Control de ecualizador por lenguaje natural: convierte "make the bass hit harder" en un delta de dB sobre la banda correspondiente, que la app valida contra rangos y protección de clipping antes de aplicar.
- Automatización de transporte de reproducción: interpreta órdenes como "skip to the next song" y las mapea a acciones de reproducción, sin necesidad de red.
- Gestión de presets de sonido: recupera y aplica presets guardados por nombre a partir de una frase del usuario.
- Asistencia educativa integrada: responde a preguntas sobre terminología de audio dentro de la app, con confirmación implícita del usuario al no modificar estado.
- Procesamiento con privacidad por diseño: al ejecutarse en el dispositivo, es adecuado para escenarios donde no se permite enviar audio ni texto a servidores externos.
- Filtrado de peticiones fuera de alcance: rechaza educadamente solicitudes ajenas al reproductor, reduciendo falsos positivos en el pipeline de acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,6 GB en Q4_K_M (tamaño del fichero 397.807.360 bytes más overhead de contexto y runtime de llama.cpp).
- GPU recomendadas: no requiere GPU dedicada; está diseñado para CPU de teléfono Android mediante llama.cpp. En escritorio puede ejecutarse en cualquier CPU moderna.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1 GB de memoria libre (por ejemplo, GTX 1050, RTX 3050 o superiores), aunque no es su objetivo.
- Opciones de despliegue: llama.cpp (formato nativo GGUF); compatible con endpoints; no se documenta soporte de vLLM ni TGI para esta cuantización.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Aurdio Intent (Qwen2.5-0.5B fine-tune) | 494 M | no disponible | GGUF Q4_K_M | Apache-2.0 | Clasificación de intenciones en dispositivo para una app concreta |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 494 M | no disponible | safetensors, GGUF | Apache-2.0 | Chat generalista multilingüe |
| Modelos de clasificación de intenciones tipo encoder pequeño (p. ej., DistilBERT) | ~66 M | 512 tokens típicos | safetensors, ONNX | Apache-2.0 / MIT | Clasificación de etiquetas, sin generación JSON |

La comparativa con alternativas genéricas de la misma categoría (clasificadores de intención basados en encoders) es cualitativa: el modelo de Aurdio genera JSON estructurado en lugar de una etiqueta plana, lo que permite transportar parámetros (deltas de dB, nombres de preset). No se dispone de datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- Modelo altamente especializado: fuera del formato de prompt y del esquema de acciones de Aurdio su comportamiento es el de un modelo pequeño y no fiable; no debe usarse como chat general.
- Entrenado únicamente en inglés; no hay soporte documentado de otros idiomas, incluido el castellano.
- Datos de entrenamiento exclusivamente sintéticos: puede generalizar mal ante formulaciones reales no cubiertas por el generador.
- Riesgo de alucinación en la generación de JSON: la propia model card indica que la salida debe tratarse como propuesta no confiable y validarse con código determinista (rangos, alcance, protección de clipping).
- Las modificaciones de sonido requieren confirmación del usuario por diseño; no debe otorgarse al modelo acceso a ficheros, red o base de datos.
- Licencia Apache-2.0 permite uso comercial, pero exige mantener la atribución a Qwen Team (Alibaba Cloud) y conservar el aviso de licencia.
- No se documentan sesgos específicos ni evaluaciones de seguridad más allá del aislamiento por validación determinista.
- Contexto máximo no especificado en la información disponible; asumir el del modelo base Qwen2.5-0.5B-Instruct sin confirmación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/appcrafttechnologies/aurdio-intent-qwen2.5-0.5b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- llama.cpp: https://github.com/ggml-org/llama.cpp
