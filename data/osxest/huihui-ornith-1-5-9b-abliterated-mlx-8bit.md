# osxest/Huihui-Ornith-1.5-9B-abliterated-mlx-8Bit

## Resumen

El modelo `osxest/Huihui-Ornith-1.5-9B-abliterated-mlx-8Bit` es una conversión al formato MLX (Apple Silicon) de la versión "abliterada" del modelo Ornith-1.5-9B, desarrollado originalmente por Ornith AI y posteriormente modificado por huihui-ai para eliminar los mecanismos de rechazo y censura. Ornith es una familia de modelos de código abierto orientados a la codificación agéntica, es decir, capaces de auto-organizarse y ejecutar tareas de programación de forma autónoma. Esta conversión concreta, realizada por el usuario osxest, permite ejecutar el modelo en hardware Apple con cuantización de 8 bits, lo que reduce significativamente los requisitos de memoria.

El modelo base, Ornith-1.5-9B, se basa en la arquitectura Qwen3 y está diseñado para tareas de generación de código, razonamiento y uso de herramientas. La versión abliterada elimina los alineamientos de seguridad que impiden respuestas en ciertos dominios, lo que la hace útil para investigación y aplicaciones donde se requiere una salida sin restricciones. Aunque el nombre indica 9B de parámetros, los pesos reales en safetensors suman aproximadamente 2.520 millones de parámetros, una discrepancia que conviene verificar antes de su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3) |
| Parametros totales | 2.519.020.032 (segun safetensors; el nombre comercial indica 9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo original Ornith-1.0 soporta 256K; esta version no lo especifica) |
| Tipos de cuantizacion | 8-bit (MLX) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B es un transformer denso derivado de Qwen3, diseñado especificamente para tareas de codificacion agéntica. Segun la documentacion de Ornith AI, la familia Ornith incluye versiones densas y MoE, todas con una ventana de contexto de 262.144 tokens y una interfaz compatible con OpenAI. El proceso de "abliteration" aplicado por huihui-ai consiste en eliminar las capas o pesos responsables del rechazo de peticiones, dando como resultado un modelo que responde sin filtros de seguridad. La conversion a MLX se realizo con la libreria mlx-lm version 0.31.2, que optimiza los pesos para su ejecucion en la Neural Engine y GPU de los chips Apple.

No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas como RLHF o DPO. La unica referencia disponible es que el modelo base es una version abliterada de Ornith-1.5-9B, y que la conversion MLX no altera los pesos mas alla de la cuantizacion.

## Capacidades

- Generacion de texto y codigo: el modelo esta especializado en tareas de programacion, incluyendo generacion, completado y depuracion de codigo en multiples lenguajes.
- Razonamiento agéntico: soporta flujos de trabajo autonomos donde el modelo decide que herramientas usar y como encadenar pasos para resolver una tarea compleja.
- Tool calling / function calling: al estar basado en Qwen3, hereda la capacidad de invocar funciones externas mediante JSON estructurado.
- Multilingue: no se especifican los idiomas soportados, pero al derivar de Qwen3 es probable que cubra ingles, chino y otros idiomas principales.
- Sin censura: la version abliterada elimina los rechazos por contenido, permitiendo respuestas en dominios que el modelo original bloquearia.
- Ejecucion en Apple Silicon: gracias al formato MLX, puede ejecutarse de forma nativa en Macs con chip M1/M2/M3/M4 sin necesidad de capas de compatibilidad.

## Casos de uso

- Asistente de codigo local en Mac: un desarrollador puede ejecutar el modelo en su MacBook Pro con chip M3 Max y obtener sugerencias de codigo en tiempo real sin enviar datos a la nube, gracias a la cuantizacion 8-bit que reduce el uso de memoria.
- Agente de automatizacion de tareas: el modelo puede integrarse en un pipeline de CI/CD para revisar pull requests, generar tests unitarios o refactorizar codigo de forma autonoma, aprovechando su capacidad de tool calling.
- Investigacion en seguridad ofensiva: la version abliterada permite explorar vulnerabilidades y generar exploits en entornos controlados, algo que los modelos alineados rechazarian.
- Generacion de documentacion tecnica: puede producir documentacion de APIs, comentarios de codigo y guias de uso a partir de fragmentos de codigo, manteniendo un contexto largo de hasta 256K tokens si se conserva esa capacidad.
- Prototipado rapido de aplicaciones: un equipo puede usar el modelo para generar esqueletos de aplicaciones completas, incluyendo estructura de archivos, configuracion y logica de negocio, en un solo prompt.
- Educacion y formacion en programacion: al no tener censura, puede explicar conceptos avanzados, incluyendo temas controvertidos como malware o criptografia, sin omitir detalles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Ornith-1.0 (no la version 1.5) presenta benchmarks en su sitio web oficial, pero no se dispone de datos especificos para esta conversion MLX ni para la version 1.5 abliterada. Se recomienda consultar el repositorio de Ornith AI para obtener metricas comparativas.

## Requisitos de hardware

- VRAM estimada: al ser una cuantizacion 8-bit de un modelo de ~2.5B parametros, el uso de memoria ronda entre 2.5 y 3 GB, mas overhead de contexto. El tamano del repositorio es de 9.5 GB, pero eso incluye los pesos en precision original.
- GPU recomendadas: cualquier Mac con chip Apple Silicon (M1 o superior) con al menos 8 GB de RAM unificada. Tambien puede ejecutarse en CPU, aunque con menor rendimiento.
- Compatibilidad con consumer GPU: no aplica, ya que MLX esta disenado exclusivamente para Apple Silicon. Para GPUs NVIDIA se necesitaria una conversion a GGUF o GPTQ.
- Opciones de despliegue: mlx-lm (libreria oficial), que permite cargar el modelo y generar texto con pocas lineas de codigo. No es compatible con vLLM, llama.cpp u Ollama en su forma actual.
- Latencia y throughput: no se dispone de mediciones. En un MacBook Pro M3 Max, un modelo de 2.5B en 8-bit puede generar entre 20 y 50 tokens por segundo, dependiendo del tamaño del contexto y la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| osxest/Huihui-Ornith-1.5-9B-abliterated-mlx-8Bit | 2.5B (nominal 9B) | no disponible | MIT | MLX 8-bit | Codificacion agéntica sin censura |
| Ornith-1.0-9B (original) | 9B | 256K | MIT | safetensors | Codificacion agéntica |
| Qwen3-8B (base) | 8B | 32K | Apache 2.0 | safetensors | Generacion general y codigo |
| DeepSeek-Coder-6.7B | 6.7B | 16K | MIT | safetensors | Codigo especifico |

La comparativa muestra que esta conversion MLX tiene menos parametros reales que el modelo original, lo que puede deberse a una poda o a un error en la nomenclatura. Su principal ventaja es la ejecucion nativa en Apple Silicon con licencia MIT, mientras que alternativas como Qwen3 requieren mas memoria y no estan abliteradas.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una version abliterada, el modelo puede generar contenido ofensivo, ilegal o peligroso sin restricciones. No es apto para aplicaciones orientadas al publico general.
- Riesgo de alucinacion: como todos los modelos de lenguaje, puede inventar hechos, APIs o funciones que no existen. En tareas de codigo, esto puede producir codigo que no compila o que introduce vulnerabilidades.
- Limitaciones de contexto: aunque el modelo original soporta 256K tokens, esta conversion no especifica si mantiene esa capacidad. Se recomienda probar con secuencias largas antes de usarlo en produccion.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el modelo base Ornith-1.5-9B puede tener atribuciones adicionales no documentadas en esta conversion.
- Compatibilidad: el formato MLX solo funciona en Apple Silicon. No es portable a entornos Linux con GPU NVIDIA sin una conversion adicional.
- Discrepancia de parametros: el nombre indica 9B pero los pesos reales son ~2.5B. Esto puede afectar al rendimiento esperado y debe verificarse antes de confiar en el modelo para tareas criticas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/osxest/Huihui-Ornith-1.5-9B-abliterated-mlx-8Bit
- Modelo base (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-9B-abliterated
- Coleccion de modelos abliterados de huihui-ai: https://huggingface.co/collections/huihui-ai/ornith-10-abliterated
- Sitio oficial de Ornith AI: https://ornith.online/
- Guia alternativa de Ornith: https://ornith.site/
- Repositorio GitHub de Ornith-1: https://github.com/ornith-ai/Ornith-1
