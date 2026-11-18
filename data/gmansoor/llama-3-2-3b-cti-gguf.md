# gmansoor/Llama-3.2-3B-CTI-GGUF

## Resumen

`gmansoor/Llama-3.2-3B-CTI-GGUF` es una cuantización en formato GGUF (Q4_K_M) del modelo `meta-llama/Llama-3.2-3B-Instruct`, publicada por el usuario gmansoor con el objetivo declarado de servir como motor conversacional para una plataforma de CTI (Cyber Threat Intelligence). No se trata de un modelo entrenado desde cero ni de un fine-tune documentado: la model card no describe ningún proceso de ajuste adicional, por lo que debe interpretarse como una redistribución empaquetada del modelo base de Meta en cuantización de 4 bits.

El modelo subyacente, Llama 3.2 3B Instruct, es un transformer denso de 3.212.749.888 parámetros (aproximadamente 3,2 mil millones), desarrollado por Meta con una ventana de contexto de 128.000 tokens y entrenamiento orientado a instrucciones y diálogo multilingüe. Esta versión GGUF conserva esas capacidades pero reduce el peso a unos 2 GB de repositorio, lo que permite ejecución en CPU y GPU de gama baja mediante llama.cpp u Ollama.

Su relevancia práctica es acotada: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, no incluye documentación técnica sobre el proceso de cuantización ni sobre el supuesto uso en CTI, y la licencia Llama 3.2 impone restricciones de uso comercial y de denominación. Resulta útil como opción de despliegue ligero del modelo base, pero no debe considerarse un modelo especializado en ciberseguridad sin evidencia adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), heredada de Llama 3.2 3B Instruct |
| Parametros totales | 3.212.749.888 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Llama 3.2 3B Instruct soporta 128.000 tokens) |
| Tipos de cuantizacion | GGUF Q4_K_M (unica variante publicada en el repo) |
| Idiomas soportados | No disponible en la informacion proporcionada (el modelo base es multilingue: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de 3,2 mil millones de parámetros, con atención por grupos (GQA) y tokenizador BPE de Llama 3. Meta entrenó Llama 3.2 3B Instruct con un pipeline que incluye preentrenamiento sobre corpus multilingüe, ajuste supervisado y optimización por preferencias humanas (RLHF/DPO), según la documentación pública del modelo base. No se dispone del número exacto de tokens de entrenamiento en la información proporcionada.

Esta publicación concreta no documenta ningún entrenamiento adicional, dataset específico de ciberseguridad ni proceso de ajuste fino. El autor se limita a indicar que está "Built with Llama" y a ofrecer el comando de ejecución en Ollama. La única transformación verificable es la cuantización a Q4_K_M, que reduce la precisión de los pesos a 4 bits con escalas por bloque y preserva los tensores más sensibles en mayor precisión, rebajando el peso del repositorio a unos 2 GB.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del ajuste de instrucciones de Llama 3.2 3B Instruct.
- Razonamiento básico, resumen, reescritura y extracción de información de documentos.
- Generación y explicación de código en lenguajes habituales, con calidad limitada por el tamaño del modelo.
- Aritmética y razonamiento matemático de complejidad baja a media.
- Soporte multilingüe heredado del modelo base (ocho idiomas oficiales), aunque no verificado en esta cuantización.
- Formato de chat con roles system/user/assistant, adecuado para plantillas conversacionales.
- No se documenta soporte explícito de tool calling, function calling, modo thinking ni capacidades de visión o audio en esta publicación.
- No se documenta ningún ajuste específico en ciberseguridad ni en inteligencia de amenazas, pese al nombre "CTI" del repositorio.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo sin GPU dedicada: la cuantización Q4_K_M ocupa unos 2 GB y puede ejecutarse en CPU con llama.cpp u Ollama, lo que permite desplegar un chatbot de propósito general en equipos modestos.
- Prototipado rápido de aplicaciones de chat: el comando `ollama run hf.co/gmansoor/Llama-3.2-3B-CTI-GGUF` permite tener un endpoint conversacional funcionando en minutos, útil para validar interfaces y flujos antes de invertir en infraestructura.
- Procesamiento por lotes de textos en entornos con recursos limitados: clasificación, resumen y extracción de entidades sobre documentos de longitud moderada, ejecutando la inferencia en CPU y evitando costes de API.
- Generación de borradores de código y explicaciones técnicas en entornos de desarrollo con hardware reducido, como complemento a herramientas de autocompletado.
- Traducción y reescritura multilingüe de textos internos, aprovechando la cobertura de idiomas del modelo base, con revisión humana obligatoria por el riesgo de errores en idiomas distintos del inglés.
- Base para experimentación con fine-tuning posterior: al ser un GGUF, sirve para evaluar el comportamiento del modelo base antes de invertir en un ajuste específico de dominio, incluido el de ciberseguridad que sugiere el nombre del repositorio, aunque ese ajuste no está incluido ni documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye métricas propias ni comparaciones, y no se han ejecutado evaluaciones independientes sobre esta cuantización concreta. Los resultados del modelo base Llama 3.2 3B Instruct publicados por Meta no son directamente trasladables a esta versión Q4_K_M, que introduce pérdida de precisión.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB para el archivo Q4_K_M con overhead de contexto; con ventanas de contexto largas (32.000 tokens o más) la caché KV puede añadir varios GB adicionales.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM, como RTX 3050, RTX 4060, RTX 3060 de 12 GB o superiores; en el extremo alto, A100 o H100 no aportan ventaja significativa por el reducido tamaño del modelo.
- Cabe en GPU de consumo: sí, en tarjetas con 4-6 GB de VRAM, y también en CPU con 8 GB de RAM o más.
- Opciones de despliegue: Ollama (soporte nativo según la model card), llama.cpp, y servidores compatibles con GGUF como llama-cpp-python o LM Studio; vLLM y TGI no son la vía natural para este formato, aunque vLLM admite algunos GGUF con limitaciones.
- Latencia y throughput: no disponibles. Como referencia orientativa no medida en este repositorio, un modelo de 3B en Q4_K_M suele generar decenas de tokens por segundo en GPU de consumo y un dígito bajo de tokens por segundo en CPU, pero estos valores no están verificados para esta publicación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| gmansoor/Llama-3.2-3B-CTI-GGUF | 3,2 B | No disponible (base: 128k) | GGUF Q4_K_M | Llama 3.2 | Cuantización sin documentación de ajuste; 0 descargas |
| meta-llama/Llama-3.2-3B-Instruct | 3,2 B | 128.000 tokens | Safetensors | Llama 3.2 | Modelo base oficial, sin cuantizar, referencia de calidad |
| Qwen2.5-3B-Instruct | 3,1 B | 32.768 tokens (128k en variantes ampliadas) | Safetensors, GGUF | Apache 2.0 | Alternativa permisiva con buen rendimiento en código y matemáticas |
| Phi-3.5-mini-instruct | 3,8 B | 128.000 tokens | Safetensors, GGUF | MIT | Licencia muy permisiva, orientado a razonamiento y código |

La comparación de rendimiento entre estos modelos no está disponible en la información proporcionada; no se han publicado métricas para esta cuantización concreta.

## Limitaciones y advertencias

- El nombre "CTI" sugiere especialización en ciberseguridad, pero no hay evidencia en la model card de entrenamiento o ajuste en ese dominio; tratarlo como un modelo de propósito general.
- Riesgo de alucinación inherente a un modelo de 3B parámetros: puede inventar hechos, referencias, CVE o comandos, algo especialmente peligroso en contextos de seguridad.
- La cuantización Q4_K_M introduce degradación adicional respecto al modelo base en tareas de razonamiento complejo, matemáticas y código.
- Sesgos heredados del corpus de preentrenamiento de Llama 3.2, no evaluados ni mitigados en esta publicación.
- La licencia Llama 3.2 Community License impone condiciones: uso comercial permitido con restricciones, obligación de atribución "Built with Llama", límite de 700 millones de usuarios mensuales para ciertos usos y restricciones de denominación.
- Repositorio sin mantenimiento verificable: 0 descargas, 0 likes y sin documentación del proceso de cuantización; no hay garantía de integridad ni de soporte.
- Idiomas soportados no declarados en esta publicación; el rendimiento en castellano puede ser inferior al del inglés.
- No se documenta soporte de tool calling ni de agentes; no asumir su disponibilidad en producción sin pruebas.
- Para uso en producción se recomienda validar la salida del modelo con revisión humana y, si el objetivo es ciberseguridad, considerar modelos específicos del dominio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gmansoor/Llama-3.2-3B-CTI-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Documentación de Llama 3.2 (Meta): https://ai.meta.com/blog/llama-3-2-connect-2024-vision-edge-mobile-devices/
- Ollama: https://ollama.com/
- llama.cpp: https://github.com/ggml-org/llama.cpp
