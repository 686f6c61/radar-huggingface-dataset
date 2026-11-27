# mradermacher/LFM3-1.7B-BR-GGUF

## Resumen

LFM3-1.7B-BR-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF generadas por el usuario mradermacher a partir del modelo base LFM3-1.7B-BR, publicado por fabriciocarraro. Se trata, por tanto, de una conversión de pesos más que de un modelo original: el repositorio no entrena ni ajusta nada, sino que empaqueta el modelo de 1.700 millones de parámetros en múltiples niveles de cuantización para facilitar su ejecución en hardware con recursos limitados mediante llama.cpp y herramientas compatibles.

El modelo subyacente pertenece a la familia LFM3 (Liquid Foundation Models, tercera generación), desarrollada por Liquid AI, y el sufijo BR sugiere un ajuste orientado a portugués de Brasil, aunque esta información no está confirmada en la documentación disponible. Con 1.700 millones de parámetros, se sitúa en la categoría de modelos pequeños, aptos para inferencia en CPU y GPU de consumo.

La relevancia de este repositorio es eminentemente práctica: ofrece hasta trece variantes de cuantización (desde Q2_K hasta F16, incluyendo IQ4_XS y varias Q3_K, Q4_K, Q5_K y Q6_K), lo que permite elegir el equilibrio entre calidad y huella de memoria según el hardware disponible. La información publicada es muy escasa: no hay pipeline declarado, licencia, idiomas ni resultados de evaluación en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia LFM3; arquitectura concreta no documentada en la informacion proporcionada) |
| Parametros totales | 1.700 millones (1,7B, segun el nombre del modelo) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible (el sufijo BR sugiere portugues de Brasil, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas generadas con el pipeline de mradermacher; convert_type: hf) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada. El nombre LFM3 remite a la familia Liquid Foundation Models de Liquid AI, pero la model card de este repositorio no detalla si se trata de un transformer convencional, de una arquitectura híbrida con componentes de espacio de estados (SSM) o de otro diseño. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado.

Lo único documentado es el proceso de cuantización: los metadatos indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma que se partió de pesos en formato Hugging Face y se aplicó una cuantización estática tensor a tensor. No se incluye información sobre decodificación especulativa, atención lineal ni otras innovaciones técnicas.

## Capacidades

- Generación de texto: capacidad esperable en un modelo de lenguaje de 1,7B parámetros, aunque no hay evaluación publicada que la respalde en este repositorio.
- Razonamiento y matemáticas: no disponible; sin benchmarks ni documentación específica.
- Generación de código: no disponible; sin datos que confirmen soporte.
- Tool calling / function calling: no disponible; la model card no lo menciona.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el sufijo BR apunta a un posible enfoque en portugués de Brasil, pero no se confirma ni se detalla cobertura de otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución local eficiente: capacidad real y verificable de este repositorio, gracias a las cuantizaciones GGUF para llama.cpp.

## Casos de uso

- Despliegue en hardware de consumo: las variantes Q4_K_M e IQ4_XS permiten ejecutar el modelo en equipos con 8-16 GB de RAM o VRAM, lo que habilita prototipos de generación de texto en portátiles sin GPU dedicada.
- Experimentación con modelos pequeños en portugués: si el ajuste BR se confirma, el modelo puede servir para probar tareas de generación en portugués de Brasil en entornos con recursos limitados, aunque sin garantías de calidad al no haber evaluaciones.
- Inferencia en CPU con llama.cpp: el formato GGUF y la disponibilidad de cuantizaciones de 2 a 8 bits permiten montar servicios ligeros en servidores sin GPU.
- Pruebas comparativas de cuantización: el repositorio ofrece trece variantes del mismo modelo, lo que facilita medir la degradación de calidad entre Q2_K y F16 en una tarea concreta.
- Filtrado y clasificación de texto a pequeña escala: un modelo de 1,7B cuantizado a 4 bits puede ejecutarse en lotes sobre CPU para tareas de etiquetado simple, siempre que se valide su calidad previamente.
- Educación y demostraciones: útil para talleres sobre cuantización, formatos GGUF y despliegue local de modelos, dado el amplio abanico de variantes incluidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (aproximada, según tamaño de 1,7B parámetros):
  - F16: en torno a 3,4 GB de pesos.
  - Q8_0: en torno a 1,8-2 GB.
  - Q6_K: en torno a 1,4-1,5 GB.
  - Q5_K_M / Q5_K_S: en torno a 1,2-1,3 GB.
  - Q4_K_M / Q4_K_S / IQ4_XS: en torno a 1,0-1,1 GB.
  - Q3_K_L / Q3_K_M / Q3_K_S: en torno a 0,8-1,0 GB.
  - Q2_K: en torno a 0,7 GB.
  - A estas cifras hay que sumar el espacio para el contexto KV cache, que depende de la longitud de contexto (no documentada).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM puede ejecutar las variantes de 4-6 bits; una RTX 3060, RTX 4060, RTX 4090 o A100 son más que suficientes. El modelo también funciona en CPU.
- Cabe en GPU de consumo: sí, en todas las variantes, incluidas tarjetas de gama baja y equipos integrados con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama (mediante importación del GGUF), llama-cpp-python y servidores compatibles con GGUF. vLLM y TGI no son la vía natural para este formato.
- Latencia y throughput estimados: no disponibles; dependen del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-BR-GGUF (este) | 1,7B | no disponible | no disponible | GGUF | Cuantizaciones estáticas de un modelo LFM3 ajustado a BR |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K (según documentación pública del modelo original) | Apache 2.0 (según documentación pública) | safetensors, GGUF | Alternativa ampliamente cuantizada y con licencia permisiva |
| Llama 3.2 1B Instruct | 1,2B | 128K (según documentación pública) | Llama 3.2 Community License | safetensors, GGUF | Modelo pequeño con contexto largo y ecosistema amplio |
| Gemma 2 2B | 2,6B | 8K (según documentación pública) | Gemma Terms of Use | safetensors, GGUF | Tamaño similar y buen rendimiento en tareas generales |

Nota: los datos de los modelos comparativos provienen de su documentación pública y no de la información proporcionada para este repositorio; se incluyen como referencia de categoría, no como evaluación directa.

## Limitaciones y advertencias

- Información muy escasa: no hay licencia, idiomas, contexto ni benchmarks declarados, lo que impide evaluar su idoneidad para producción.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; hay que consultar el repositorio del modelo base (fabriciocarraro/LFM3-1.7B-BR) antes de cualquier despliegue.
- Riesgo de alucinación: inherente a los modelos de 1,7B parámetros; sin evaluaciones publicadas no se puede acotar su magnitud.
- Sesgos: no documentados; al desconocerse la composición del dataset de entrenamiento, no es posible evaluar sesgos de género, idioma o cultura.
- Degradación por cuantización: las variantes Q2_K y Q3_K pueden perder calidad de forma notable frente a Q5_K_M o F16; conviene validar la tarea concreta antes de elegir una cuantización agresiva.
- Cobertura de idiomas incierta: el sufijo BR sugiere portugués de Brasil, pero no se confirma ni se detalla el rendimiento en castellano u otros idiomas.
- Contexto desconocido: sin la longitud de contexto documentada, no se puede planificar su uso en conversaciones largas o documentos extensos.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación por terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM3-1.7B-BR-GGUF
- Modelo base: https://huggingface.co/fabriciocarraro/LFM3-1.7B-BR
