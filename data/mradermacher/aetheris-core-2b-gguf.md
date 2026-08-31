# mradermacher/Aetheris-Core-2B-GGUF

## Resumen

Aetheris-Core-2B es un modelo de lenguaje de 2.600 millones de parámetros desarrollado por Miiyamoto255 y cuantizado a formato GGUF por mradermacher. Se distribuye bajo licencia MIT y está orientado a conversación en inglés. El repositorio GGUF contiene múltiples cuantizaciones estáticas que permiten ejecutar el modelo en una amplia gama de hardware, desde CPU hasta GPU con poca memoria. Aunque la información pública sobre su arquitectura y entrenamiento es escasa, su tamaño compacto y su licencia permisiva lo convierten en una opción interesante para prototipos y despliegues en entornos con recursos limitados.

La relevancia de este modelo radica en su accesibilidad: al ser un modelo pequeño y cuantizado, puede ejecutarse en dispositivos de bajo consumo, lo que facilita la experimentación local y la integración en aplicaciones edge. Sin embargo, al carecer de documentación detallada sobre sus capacidades y rendimiento, es necesario evaluarlo empíricamente antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 2.614.341.888 (2,6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo (tipo de transformer, numero de capas, dimensiones, etc.) ni sobre el proceso de entrenamiento (tamano del dataset, numero de tokens, tecnicas de alineamiento como RLHF o DPO). El modelo base se aloja en HuggingFace bajo el nombre Miiyamoto255/Aetheris-Core-2B, pero su model card no ha sido incluida en la informacion proporcionada. La unica caracteristica confirmada es que se trata de un modelo conversacional en ingles, segun las etiquetas del repositorio.

## Capacidades

- Generacion de texto conversacional en ingles (etiqueta "conversational").
- Compatible con la libreria transformers y con el ecosistema GGUF (llama.cpp, Ollama, etc.).
- No se han documentado capacidades adicionales como tool calling, razonamiento multi-paso, vision o audio en la informacion disponible.

## Casos de uso

- Prototipado rapido de chatbots: al ser un modelo pequeno y con licencia MIT, se puede integrar en aplicaciones de demostracion o pruebas de concepto sin restricciones de uso comercial.
- Despliegue en dispositivos edge: los quants de menor tamano (Q2_K, 1,3 GB) permiten ejecutar el modelo en Raspberry Pi o en moviles con suficiente RAM, ideal para asistentes locales sin conexion.
- Filtrado y preprocesamiento de texto: su capacidad para generar respuestas coherentes en ingles puede aprovecharse para tareas de clasificacion o extraccion de informacion simple, aunque no hay benchmarks que lo confirmen.
- Educacion e investigacion: sirve como ejemplo de cuantizacion GGUF y de despliegue de modelos pequenos, util para cursos de IA aplicada.
- Generacion de contenido creativo breve: puede producir textos cortos, ideas o borradores, siempre que se supervise la salida debido a la falta de evaluaciones publicas.
- Asistentes de soporte en ingles: para tareas de FAQ o respuestas a consultas frecuentes, su tamano permite alojarlo en servidores modestos con baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar para este modelo.

## Requisitos de hardware

- VRAM estimada: los archivos GGUF tienen un tamano que oscila entre 1,3 GB (Q2_K) y 5,3 GB (f16). Para inferencia, se recomienda al menos 2-3 GB de VRAM para los quants mas pequenos y 6 GB para f16.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, etc.) puede ejecutar los quants Q4 o inferiores. Para f16 se necesitan 6 GB o mas (RTX 3060, RTX 4060, etc.).
- CPU: los quants Q4_K_M y menores pueden ejecutarse en CPU con 8 GB de RAM, aunque la velocidad sera limitada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o cualquier runtime compatible con GGUF.
- Latencia y throughput: no se dispone de mediciones publicas. En una GPU moderna, un modelo de 2B cuantizado a Q4 puede alcanzar decenas de tokens por segundo, pero depende del hardware y del backend.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de tamano similar (por ejemplo, Qwen2-1.5B, Gemma-2B, Phi-2). No hay datos de rendimiento ni de arquitectura que permitan una comparacion objetiva.

## Limitaciones y advertencias

- No hay documentacion sobre sesgos, alucinaciones o limitaciones de contexto. Se recomienda evaluar el modelo en el dominio de uso antes de desplegarlo.
- Al ser un modelo de 2B, es probable que tenga capacidades limitadas en tareas complejas de razonamiento o generacion de codigo, aunque esto no esta confirmado.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo base podria tener dependencias o deudas tecnicas no documentadas.
- El repositorio GGUF no incluye el modelo original en safetensors; para acceder a el, hay que visitar el repositorio base de Miiyamoto255.
- La fecha de creacion (2026) es inusual y podria indicar un error en los metadatos; se recomienda verificar la vigencia del modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Aetheris-Core-2B-GGUF
- Modelo base: https://huggingface.co/Miiyamoto255/Aetheris-Core-2B
- Perfil de mradermacher: https://huggingface.co/mradermacher
- Solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
