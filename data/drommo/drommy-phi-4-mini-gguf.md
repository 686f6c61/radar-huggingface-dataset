# drommo/drommy-phi-4-mini-gguf

## Resumen

drommy-phi-4-mini-gguf es un repositorio de pesos en formato GGUF publicado por el usuario drommo en Hugging Face. Por el nombre se deduce que se trata de una conversión a GGUF del modelo Phi-4-mini de Microsoft, orientada a su uso con motores de inferencia basados en llama.cpp (Ollama, LM Studio, llama-cpp-python, etc.). El repositorio no incluye pipeline declarado, ni idiomas, ni una model card con detalles técnicos: la única información disponible en la ficha de Hugging Face es la licencia MIT.

La relevancia de este tipo de publicación es práctica: permite ejecutar un modelo de la familia Phi-4 en hardware de consumo mediante cuantización, sin depender de los pesos originales en safetensors. Sin embargo, al no existir documentación del autor sobre el proceso de conversión, la versión del tokenizador, las cuantizaciones incluidas ni las validaciones realizadas, cualquier evaluación de calidad debe hacerse por cuenta del usuario antes de llevarlo a producción.

No se dispone de datos verificados sobre arquitectura, número de parámetros, longitud de contexto ni composición del entrenamiento en la información proporcionada. Los datos que se indican a continuación sobre el modelo base son los de la familia Phi-4-mini de Microsoft, y se marcan como no confirmados en este repositorio concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en el repositorio (el modelo base Phi-4-mini es un transformer decoder-only) |
| Parametros totales | no disponible en el repositorio (el modelo base Phi-4-mini declara 3.800 millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en el repositorio (el modelo base declara 128.000 tokens) |
| Tipos de cuantizacion | no disponible (el repositorio no lista los ficheros GGUF publicados) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (por el nombre del repositorio) |

## Arquitectura y entrenamiento

No hay información en el repositorio sobre la arquitectura, el proceso de conversión a GGUF ni los datos de entrenamiento. El nombre indica que deriva de Phi-4-mini, un transformer decoder-only de Microsoft con 3.800 millones de parámetros y ventana de contexto de 128.000 tokens según la documentación pública del modelo base; esas cifras corresponden al original y no están verificadas en esta conversión.

Tampoco se documenta si la conversión preserva el tokenizador original, qué versión de llama.cpp se utilizó, ni si se aplicaron técnicas de post-entrenamiento adicionales. La model card del repositorio se limita a declarar `license: mit`, sin notas de conversión, sin hashes de verificación y sin instrucciones de uso.

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas del modelo base Phi-4-mini, no verificadas en esta conversión.
- Código y matemáticas: el modelo base está orientado a tareas de razonamiento y código; no hay validación publicada para estos pesos.
- Soporte de tool calling: no disponible en la información del repositorio.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el repositorio no declara idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Inferencia local en estación de trabajo: cargar el GGUF con llama.cpp u Ollama para prototipar asistentes de texto sin conexión, aprovechando el formato para hardware sin GPU dedicada.
- Despliegue en portátiles con GPU de consumo: usar cuantizaciones de 4 u 8 bits para mantener el modelo en VRAM limitada, siempre que el repositorio incluya esos ficheros (no confirmado).
- Procesamiento por lotes de documentos: ejecutar resúmenes o extracción de información sobre corpus locales en un servidor sin acceso a APIs externas.
- Entornos con requisitos de privacidad: al ejecutarse íntegramente en local, permite tratar datos sensibles sin enviarlos a un proveedor cloud.
- Evaluación comparativa de cuantizaciones: servir como punto de partida para medir la degradación de calidad entre distintos niveles de cuantización frente al modelo original en safetensors.
- Integración en aplicaciones de escritorio: empaquetar el GGUF en herramientas tipo LM Studio o interfaces propias mediante llama-cpp-python para asistentes embebidos.
- Base para fine-tuning ligero: no recomendado directamente sobre GGUF; requeriría convertir de vuelta a safetensors, lo que añade riesgo al no estar documentado el proceso original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para este repositorio, ya que no se listan las cuantizaciones publicadas. Como referencia orientativa para un modelo de 3.800 millones de parámetros, una cuantización de 4 bits ronda los 2,5-3 GB y una de 8 bits los 4,5-5 GB, sin contar caché KV.
- GPU recomendadas: no disponibles para esta conversión. Para el modelo base, una RTX 3060 de 12 GB o superior permite inferencia cómoda en cuantizaciones bajas.
- GPU de consumo: previsiblemente sí, en tarjetas con 6-8 GB o más, condicionado a los ficheros realmente publicados.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF. vLLM y TGI no son la vía natural para GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| drommy-phi-4-mini-gguf | no disponible (base: 3,8 B) | no disponible (base: 128k) | MIT | GGUF | Repositorio con 0 descargas |
| Phi-4-mini (Microsoft) | 3,8 B | 128.000 | MIT | safetensors | Publicado por Microsoft en Hugging Face |
| Qwen2.5-3B-Instruct | 3,1 B | 32.768 | Apache 2.0 | safetensors, GGUF | Amplia disponibilidad de cuantizaciones comunitarias |
| Llama-3.2-3B-Instruct | 3,2 B | 128.000 | Llama 3.2 Community License | safetensors, GGUF | Amplia disponibilidad de cuantizaciones comunitarias |

Las cifras del modelo base y de los alternativos corresponden a su documentación pública; las de este repositorio no están confirmadas.

## Limitaciones y advertencias

- El repositorio no incluye model card técnica: se desconoce qué ficheros GGUF contiene, con qué versión de llama.cpp se generaron y si el tokenizador es correcto.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni validación por parte de la comunidad.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay evaluación publicada para esta conversión.
- Sesgos: no documentados en el repositorio; los del modelo base tampoco se detallan aquí.
- Idiomas: no declarados; no se puede garantizar un comportamiento multilingüe correcto.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero conviene verificar que la conversión respeta los términos del modelo base de Microsoft.
- En producción, validar la integridad de los pesos (hashes), el comportamiento del tokenizador y la calidad frente al original antes de desplegar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/drommo/drommy-phi-4-mini-gguf
- Modelo base de referencia (Phi-4-mini, Microsoft): no disponible en la información proporcionada
- Paper, blog o demo del autor: no disponible
