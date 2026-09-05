# florianvoss/Qwen3.5-4B-SmoothQuantA05-Hybrid-Modalix

## Resumen

El modelo `florianvoss/Qwen3.5-4B-SmoothQuantA05-Hybrid-Modalix` es un paquete compilado de artefactos de runtime para el modelo base `Qwen/Qwen3.5-4B`, preparado especificamente para ejecutarse en el runtime LLiMa sobre dispositivos SiMa.ai Modalix. No se trata de un checkpoint de Transformers convencional, sino de un conjunto de ficheros de despliegue que incluyen configuración, tokenizador, embeddings y programas MLA compilados.

La compilación aplica optimizaciones de cuantización y particionado para el hardware de SiMa.ai: pesos INT4 híbridos con grupo de 128, módulos de atención lineal en BF16, proyecciones de visión en INT8, embeddings cuantizados y KV cache cuantizada. Además, se habilita el filtrado compartido y una entrada de visión compilada de 32×32 píxeles. El paquete está diseñado para ejecutarse con el comando `llima run`, y el autor indica que no ha sido validado ejecutando el modelo completo en un dispositivo Modalix.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated Delta Networks y Gated Attention (según modelo base Qwen3.5-4B) |
| Parametros totales | 4B (aprox., según nombre del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (máximo configurado en la compilación) |
| Tipos de cuantizacion | INT4 híbrido (grupo 128), BF16 para módulos de atención lineal, INT8 para proyecciones de visión |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Artefactos compilados para LLiMa runtime: `elf_files/` (programas MLA) y `devkit/` (configuración, tokenizador, embeddings). No es un checkpoint Transformers |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen3.5-4B`, que según la información pública utiliza una arquitectura híbrida que combina Gated Delta Networks y Gated Attention en un patrón repetido 8× (3×DeltaNet → FFN → 1×Attention → FFN). Esta arquitectura permite un equilibrio entre eficiencia computacional y capacidad de razonamiento.

En el paquete compilado para Modalix, se aplican transformaciones específicas para el runtime: SmoothQuant con alpha 0.5, pesos INT4 con grupo de 128, módulos de atención lineal mantenidos en BF16 y proyecciones de visión en INT8. Se habilita el filtrado compartido, embeddings cuantizados y KV cache cuantizada. La entrada de visión se compila a 32×32 píxeles y el tamaño de prefill es 128 tokens. No se proporcionan datos sobre el entrenamiento del modelo base ni sobre el proceso de compilación más allá de lo indicado.

## Capacidades

- Generación de texto y razonamiento, heredadas del modelo base Qwen3.5-4B.
- Procesamiento multimodal con entrada de visión compilada a 32×32 píxeles.
- Soporte de ejecución en runtime LLiMa sobre dispositivos SiMa.ai Modalix.
- Optimizaciones de cuantización para inferencia eficiente en hardware edge.
- No se confirma soporte de tool calling, agentes o multi-step reasoning en la información disponible.
- Las capacidades multilingües no están especificadas en la documentación del paquete.

## Casos de uso

- Inferencia en dispositivos edge de SiMa.ai: el paquete está compilado específicamente para el runtime LLiMa en Modalix, por lo que es adecuado para aplicaciones de visión y lenguaje que requieren ejecución local sin dependencia de la nube.
- Sistemas de visión embebida: la entrada de visión compilada de 32×32 permite procesar imágenes en dispositivos de bajo consumo, por ejemplo en cámaras inteligentes o sensores industriales.
- Asistentes locales con contexto limitado: la ventana de 4096 tokens permite conversaciones de longitud moderada en entornos sin conexión.
- Prototipado de despliegue en hardware SiMa.ai: los artefactos compilados pueden usarse para validar la integración del modelo en pipelines de inferencia edge antes de la validación final en dispositivo.
- Investigación en cuantización y compilación de modelos híbridos: el paquete sirve como ejemplo de aplicación de SmoothQuant, cuantización INT4 y KV cache cuantizada en un runtime específico.
- Evaluación de rendimiento en plataformas de aceleración: permite medir el comportamiento de un modelo multimodal de 4B en un entorno de ejecución compilado, aunque el autor no ha completado la validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Requiere un dispositivo SiMa.ai Modalix con runtime LLiMa compatible instalado.
- No se especifica VRAM ni requisitos de GPU; el paquete está diseñado para el acelerador Modalix, no para GPUs convencionales.
- No es un checkpoint Transformers, por lo que no puede desplegarse con vLLM, llama.cpp, Ollama o TGI sin una conversión adicional.
- El comando de ejecución es `llima run /path/to/Qwen3.5-4B-SmoothQuantA05-Hybrid`.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de modelos comparables en la misma categoría (paquetes compilados para LLiMa runtime en Modalix). Como referencia, el modelo base `Qwen/Qwen3.5-4B` es un modelo multimodal denso de 4B con 262K-1M de contexto en su versión original, pero esta compilación limita el contexto a 4096 tokens y no es un checkpoint estándar. La comparación directa no es posible sin datos de rendimiento del paquete compilado.

## Limitaciones y advertencias

- El paquete no ha sido validado ejecutando el modelo completo en un dispositivo Modalix; el autor indica que la compilación y el despliegue local se completaron, pero no se confirmó el funcionamiento real.
- No es un checkpoint de Transformers; no puede cargarse con bibliotecas estándar como `transformers` o `safetensors`.
- La licencia no está especificada, lo que genera incertidumbre para uso comercial.
- La longitud de contexto se limita a 4096 tokens en la compilación, muy por debajo del contexto del modelo base.
- La entrada de visión está restringida a 32×32 píxeles, lo que puede ser insuficiente para tareas de visión de alta resolución.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de idioma específicas del paquete.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/florianvoss/Qwen3.5-4B-SmoothQuantA05-Hybrid-Modalix
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.5-4B
- Página de Ollama para Qwen3.5:4b: https://ollama.com/library/qwen3.5:4b
- Ficha de Awesome Agents: https://awesomeagents.ai/models/qwen-3-5-4b/
- Especificaciones y requisitos de VRAM: https://apxml.com/models/qwen35-4b
