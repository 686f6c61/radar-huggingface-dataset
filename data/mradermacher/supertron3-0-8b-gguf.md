# mradermacher/Supertron3-0.8B-GGUF

## Resumen

Supertron3-0.8B es un modelo de lenguaje y visión compacto (752 millones de parámetros) desarrollado por Surpem, diseñado específicamente para agentes de interfaz gráfica (GUI) y llamadas a herramientas en entornos con recursos limitados. El repositorio que nos ocupa es una cuantización GGUF realizada por mradermacher, que facilita su ejecución local en dispositivos de bajo consumo. El modelo opera en entornos digitales diversos (web, escritorio, CLI) interpretando interfaces visuales, razonando sobre el contenido y emitiendo acciones precisas (tipo pyautogui) o llamadas a funciones JSON. Su relevancia radica en permitir agentes autónomos de control de ordenador en el edge, sin depender de la nube, con una huella de memoria muy reducida. La arquitectura concreta no se detalla en la información disponible, pero se trata de un modelo multimodal (visión + lenguaje) basado en transformers.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language Model (VLM), arquitectura interna no especificada |
| Parametros totales | 752.393.024 (0,75B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (además de mmproj-Q8_0 y mmproj-f16) |
| Idiomas soportados | inglés (según etiqueta `language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas) |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna del modelo base Supertron3-0.8B. Por la descripción de FriendliAI se sabe que es un modelo de visión y lenguaje compacto, orientado a agentes de GUI y tool calling en el borde (edge). No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. La cuantización GGUF realizada por mradermacher es una conversión estática de los pesos del modelo base, sin ajuste fino posterior. La proyección multimodal (mmproj) se proporciona en formato GGUF adicional para su uso con el modelo principal.

## Capacidades

- Interpretación de interfaces visuales (capturas de pantalla, elementos gráficos de web, escritorio y terminal).
- Razonamiento sobre contenido complejo presente en la imagen y el texto.
- Emisión de acciones precisas de control de computadora, compatibles con herramientas tipo pyautogui.
- Generación de llamadas a funciones en formato JSON para integración con herramientas externas.
- Soporte de tool calling / function calling para agentes.
- Capacidad de razonamiento multi-paso para tareas de agente (según la descripción de FriendliAI).
- Multimodalidad: entrada de imagen y texto.
- Idiomas: solo inglés (según etiqueta).

## Casos de uso

- Automatización de tareas de escritorio: el modelo puede interpretar la pantalla y ejecutar acciones como hacer clic, escribir o navegar, lo que permite automatizar flujos de trabajo en aplicaciones locales sin necesidad de APIs específicas.
- Agente de control web: puede interactuar con navegadores analizando el contenido visual y emitiendo comandos de navegación, útil para pruebas de aplicaciones web o extracción de datos.
- Asistente de línea de comandos: combinando la visión con el texto, puede interpretar la salida de terminales y ejecutar comandos para resolver tareas de administración de sistemas.
- Integración en herramientas de productividad: al emitir llamadas a funciones JSON, puede conectarse a servicios externos (correo, calendario, etc.) para gestionar tareas mediante lenguaje natural.
- Ejecución de agentes en dispositivos de bajo consumo (Raspberry Pi, móviles, etc.) gracias a su tamaño y cuantización GGUF, permitiendo despliegues locales sin conexión.
- Prototipado rápido de agentes de interfaz: al ser un modelo pequeño, es adecuado para experimentar con arquitecturas de agentes en entornos académicos o de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del modelo en cuantización GGUF: desde 0,5 GB (Q2_K) hasta 1,6 GB (f16), más el mmproj (0,2–0,3 GB). Esto permite ejecutarlo en GPUs de consumo con 4 GB de VRAM o incluso en CPU con suficiente RAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1060, RTX 2060, RTX 4090, etc.). También funciona en Apple Silicon y en CPU con 8 GB de RAM.
- Despliegue: compatible con llama.cpp, Ollama, y otros motores que soporten GGUF. No se menciona soporte específico para vLLM o TGI, pero al ser un modelo pequeño es probable que funcione en estos si se convierte a formato safetensors.
- Latencia: no se proporcionan datos. Se estima una latencia baja para modelos de 0,75B en hardware moderno (del orden de decenas de milisegundos por token), pero no se puede confirmar.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de la misma categoría. Dado el tamaño y la orientación a agentes GUI, se podrían comparar con modelos como LLaVA-7B o CogAgent-18B, pero no hay datos de rendimiento para Supertron3-0.8B. Se recomienda consultar el modelo base para más detalles.

## Limitaciones y advertencias

- Idioma: el modelo está entrenado únicamente en inglés, lo que limita su uso en otros idiomas.
- Tamaño reducido: con 0,75B parámetros, su capacidad de razonamiento complejo es inferior a la de modelos más grandes, lo que puede afectar a tareas de razonamiento avanzado o contextos largos.
- Riesgo de alucinación: al ser un modelo pequeño, puede generar respuestas incorrectas o inventar acciones, especialmente en entornos visuales complejos.
- Cuantización: los archivos GGUF son cuantizaciones estáticas, que pueden conllevar una pérdida de calidad respecto al modelo original. Las cuantizaciones de menor bit (Q2_K, Q3_K) pueden degradar significativamente la precisión.
- Licencia: Apache 2.0 permite uso comercial, pero es necesario verificar que el modelo base (Surpem/Supertron3-0.8B) tenga la misma licencia y no incluya restricciones adicionales.
- Sin garantía de soporte: el autor del cuantizado (mradermacher) ofrece el repo sin garantías y no se responsabiliza de errores de conversión.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/Supertron3-0.8B-GGUF
- Modelo base: https://huggingface.co/Surpem/Supertron3-0.8B
- Página de FriendliAI con descripción del modelo: https://friendli.ai/models/Surpem/Supertron3-0.8B
- Solicitud de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Lista de modelos de mradermacher: https://huggingface.co/mradermacher/models
