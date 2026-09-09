# ajvikram/toolcall-2b-gguf

## Resumen

Toolcall-2B-GGUF es la versión cuantizada en formato GGUF de Toolcall-2B, un modelo de lenguaje de 2B parámetros desarrollado por el usuario ajvikram mediante ajuste fino a partir de Qwen3.5-2B. Su propósito principal es realizar function calling y tool routing en entornos locales, lo que lo convierte en una opción ligera para integrar agentes software sin depender de servicios externos ni de modelos de gran tamaño.

El modelo se distribuye en cuatro cuantizaciones —Q4_K_M, Q5_K_M, Q8_0 y f16— con tamaños de archivo que van desde 1.22 GB hasta 3.63 GB. Esta flexibilidad permite ejecutarlo tanto en CPU como en GPU con pocos recursos; el autor reporta una velocidad de generación de aproximadamente 33 tokens por segundo en una CPU ARM con la cuantización Q4_K_M. El modelo fue construido con llama.cpp (septiembre de 2026), lo que añadió soporte para la arquitectura Qwen3.5.

En tareas de function calling, Toolcall-2B obtiene una puntuación de 36.35 en el benchmark BFCL v4, superando al modelo base Qwen3.5-2B que alcanza 33.85. La ventana de contexto no está especificada oficialmente, pero el ejemplo de ejecución incluido en la documentación utiliza 8192 tokens. La licencia Apache 2.0 permite uso comercial y redistribución sin grandes restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo derivado de Qwen3.5-2B) |
| Parametros totales | 1.942.653.248 (1.94B) |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible (ejemplo de ejecución usa 8192 tokens) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0, f16 (GGUF) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Toolcall-2B es un ajuste fino del modelo Qwen3.5-2B, orientado específicamente a la generación de llamadas a herramientas. El autor no ha publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens utilizados ni si se emplearon técnicas de alineación como RLHF o DPO. La documentación indica que el modelo fue entrenado y evaluado en modo texto, con el modo de pensamiento desactivado por defecto, lo que coincide con su comportamiento en evaluación.

Una característica técnica destacada es el uso del formato XML nativo de Qwen3.5 para las llamadas a herramientas. Este formato permite que cualquier cliente que ya soporte las tool calls de Qwen3.5 funcione sin modificaciones. El modelo fue convertido a GGUF con llama.cpp en septiembre de 2026, una versión que incorpora soporte de conversión para esta arquitectura; por tanto, builds anteriores de llama.cpp no pueden ejecutarlo.

## Capacidades

- Function calling y tool routing: genera llamadas a herramientas en formato XML con estructura `<tool_call>`, `<function>`, `<parameter>`, etc., compatible con el formato de Qwen3.5.
- Soporte de agentes: puede integrarse en flujos de decisión que requieran invocar funciones externas, como APIs, consultas a bases de datos o scripts.
- Generación de texto: es capaz de responder a instrucciones en inglés, aunque su fortaleza principal es la selección de herramientas.
- Compatibilidad con clientes existentes: al utilizar el formato de tool calls de Qwen3.5, los wrappers y frameworks que ya parsean estas llamadas pueden usarlo de forma transparente.
- Sin soporte multimodal: aunque la arquitectura base Qwen3.5 es vision-capable, esta versión fue entrenada y evaluada únicamente con texto; no debe usarse con entrada de imágenes ni audio.
- Modo de pensamiento desactivado: el modelo no está entrenado para generar cadenas de razonamiento explícitas, por lo que se recomienda mantenerlo desactivado para preservar el comportamiento esperado.

## Casos de uso

- Asistentes de soporte técnico en local: puede ejecutarse en un portátil ARM o en una máquina sin GPU, respondiendo a consultas de clientes y enrutando llamadas a herramientas internas como la consulta de tickets, la búsqueda en una base de conocimiento o la verificación de estado de pedidos.
- Automatización de operaciones en CI/CD: integrado en pipelines de despliegue, puede determinar qué script o API invocar según la entrada del desarrollador, reduciendo la necesidad de un orquestador centralizado.
- Agentes de chat con coste reducido: al ocupar solo 1.22 GB en cuantización Q4_K_M, es viable como servicio serverless para rutas de tool calling donde los modelos grandes suponen un coste excesivo.
- Prototipado rápido con Ollama: el comando `ollama run hf.co/ajvikram/toolcall-2b-gguf:Q4_K_M` permite probar agentes y flujos de herramientas sin configuración compleja de servidores.
- Extracción estructurada de datos: definiendo funciones que devuelvan JSON, el modelo convierte texto libre en llamadas estructuradas, lo que facilita la extracción de campos con un modelo pequeño.
- Integración en entornos edge o IoT: con 33 tokens por segundo en CPU ARM, es adecuado para dispositivos con poca capacidad de cómputo que necesiten decidir qué herramienta ejecutar localmente.

## Benchmarks y rendimiento

Se han publicado resultados de evaluaciones en la documentación del modelo. El benchmark BFCL v4 compara Toolcall-2B con su modelo base Qwen3.5-2B:

| Benchmark | Toolcall-2B | Qwen3.5-2B base |
|---|---|---|
| BFCL v4 (overall) | 36.35 | 33.85 |

El autor indica que Toolcall-2B supera al modelo base en todos los grupos del benchmark. Las versiones cuantizadas GGUF no han sido evaluadas por separado. No se han publicado resultados en otros benchmarks como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Tamaños de archivo por cuantización: Q4_K_M 1.22 GB, Q5_K_M 1.35 GB, Q8_0 1.93 GB, f16 3.63 GB.
- VRAM estimada: aproximadamente el tamaño del archivo más memoria adicional para KV cache y overhead. Para Q4_K_M puede necesitar en torno a 1.5-2 GB; para f16, cerca de 4-5 GB.
- GPU recomendadas: no se especifica ninguna en concreto. Al ser un modelo de 2B, es viable en GPUs de consumo con 4 GB de VRAM o más, como una RTX 3060 de 12 GB. También funciona en CPU; el autor probó la cuantización Q4_K_M en una CPU ARM.
- Opciones de despliegue: llama.cpp mediante `llama-server` o `llama-cli`, y Ollama a través de `ollama run hf.co/ajvikram/toolcall-2b-gguf:Q4_K_M`.
- Latencia y throughput: se reporta aproximadamente 33 tokens por segundo en CPU ARM con la cuantización Q4_K_M.
- Es recomendable usar `--jinja` en `llama-server` para el renderizado de plantillas de tool calls.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BFCL v4 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Toolcall-2B | 1.94B | No disponible | 36.35 | Apache 2.0 | GGUF en Hugging Face |
| Qwen3.5-2B | No disponible | No disponible | 33.85 | No disponible | No disponible |

No se dispone de datos públicos de otros modelos comparables en la información proporcionada. La única comparación directa disponible es con su modelo base, Qwen3.5-2B.

## Limitaciones y advertencias

- Solo texto: pese a que la arquitectura base puede ser vision-capable, esta versión no debe usarse con entrada multimodal; fue entrenada y evaluada solo con texto.
- Idioma limitado: la metadata indica únicamente inglés; la capacidad en otros idiomas no está verificada y puede degradar significativamente.
- Contexto no confirmado: no se especifica la longitud máxima de contexto oficial; el ejemplo usa 8192 tokens, pero no se garantiza que sea el límite real.
- Cuantizaciones sin evaluar: las versiones GGUF no han sido puntuadas por separado, por lo que las diferencias de rendimiento respecto al modelo en safetensors podrían variar.
- Pensamiento desactivado: el modelo fue entrenado sin modo de razonamiento explícito; activar el modo thinking puede producir resultados no alineados con las evaluaciones.
- Requiere llama.cpp reciente: los builds anteriores a septiembre de 2026 no soportan esta arquitectura; es necesario actualizar la biblioteca.
- Riesgo de alucinación en tool calls: en tareas de enrutamiento de herramientas, el modelo podría generar nombres de funciones o parámetros incorrectos; es imprescindible validar las llamadas en producción.
- Tamaño reducido: al tratarse de un modelo de 2B, su capacidad de razonamiento general es inferior a la de modelos más grandes en tareas complejas que requieran contexto extenso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ajvikram/toolcall-2b-gguf
- Modelo base: https://huggingface.co/ajvikram/toolcall-2b
- No se han encontrado enlaces adicionales (papers, blogs, repositorios o demos) en la información disponible.
