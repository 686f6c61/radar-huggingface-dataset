# mradermacher/LunaraHome-26B-A4B-i1-GGUF

## Resumen
LunaraHome-26B-A4B-i1-GGUF es una recopilación de cuantizaciones GGUF generadas por mradermacher a partir del modelo base Maxinger15/LunaraHome-26B-A4B. El modelo original es un ajuste fino de tipo LoRA sobre una arquitectura de la familia Gemma 4 (etiquetada como `gemma4` en los metadatos), orientado específicamente a tareas de domótica y control de dispositivos, con especial énfasis en Home Assistant y Music Assistant, y con soporte declarado de tool calling. Está pensado para integraciones conversacionales que necesitan invocar funciones y servicios de un ecosistema domótico.

El repositorio que nos ocupa no contiene los pesos originales en safetensors, sino un conjunto amplio de cuantizaciones en formato GGUF (desde IQ1_S hasta Q6_K) generadas con calibración imatrix, lo que permite ejecutar el modelo en hardware modesto mediante llama.cpp y derivados. El tamaño real de los pesos sin cuantizar es de 25.233.142.046 parámetros (unos 25,2 mil millones), y el repo completo ocupa 300,9 GB por acumulación de todas las variantes.

La relevancia actual radica en que ofrece una vía práctica de desplegar un modelo especializado en automatización del hogar en local, con licencia Apache 2.0 y compatibilidad con endpoints, lo que facilita su integración en asistentes domésticos autoalojados sin depender de servicios en la nube. No obstante, el autor del modelo base lo etiqueta como experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Gemma 4 (etiqueta `gemma4`), ajuste fino LoRA sobre el modelo base |
| Parametros totales | 25.233.142.046 (≈25,2 B) |
| Parametros activos | no disponible (no se confirma que sea MoE pese al sufijo A4B del nombre) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K, i1-Q2_K_S, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_1, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; incluye fichero imatrix |
| Idiomas soportados | aleman (de), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); pesos originales del modelo base en safetensors segun metadatos de transformers |

## Arquitectura y entrenamiento
El modelo base LunaraHome-26B-A4B se construye mediante un ajuste fino de tipo LoRA sobre una arquitectura de la familia Gemma 4, según las etiquetas del repositorio. El sufijo "A4B" del nombre sugiere una posible configuración con aproximadamente 4 mil millones de parámetros activos, pero no hay información en la documentación disponible que confirme una arquitectura Mixture of Experts ni el número exacto de parámetros activos, por lo que este dato debe tratarse como no verificado.

El ajuste está orientado a dominios concretos: Home Assistant, Music Assistant y tool calling conversacional. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. Las cuantizaciones de este repositorio se han generado con calibración imatrix (fichero `LunaraHome-26B-A4B.imatrix.gguf`), una técnica que mejora la calidad de las cuantizaciones de baja precisión ajustando los parámetros de cuantización a la distribución real de activaciones. El autor indica que las cuantizaciones estáticas equivalentes están en un repositorio separado.

## Capacidades
- Generación de texto conversacional en inglés y alemán.
- Tool calling / function calling, capacidad central del ajuste según las etiquetas del modelo.
- Integración específica con Home Assistant para control de entidades, automatizaciones y servicios del hogar.
- Integración con Music Assistant para gestión de reproducción y bibliotecas musicales.
- Posible soporte de visión: la model card de mradermacher indica que es un "vision model" y remite a ficheros mmproj en el repositorio estático, aunque no se detalla el alcance.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su uso en infraestructuras de inferencia estándar.
- Razonamiento multi-turno orientado a tareas domóticas.

## Casos de uso
- Asistente de voz para el hogar autoalojado: el modelo puede interpretar órdenes en lenguaje natural y traducirlas a llamadas de servicio de Home Assistant (encender luces, ajustar termostatos, consultar sensores), ejecutándose en local con las cuantizaciones Q4_K_M o Q5_K_M para equilibrar calidad y requisitos de memoria.
- Automatizaciones conversacionales en Home Assistant: creación y modificación de automatizaciones mediante diálogo, aprovechando el tool calling para generar las acciones correspondientes en la API del sistema.
- Control de reproducción musical: integración con Music Assistant para seleccionar listas, cambiar de pista o ajustar volúmenes por habitación mediante instrucciones habladas o escritas.
- Escenarios domóticos multilingües en alemán e inglés: útil en hogares bilingües o en despliegues centrados en el mercado germanoparlante, dado el soporte nativo de ambos idiomas.
- Despliegue en hardware de consumo: las variantes IQ3_S (12,3 GB) o Q4_K_S (15,6 GB) permiten ejecutar el modelo en GPUs de consumo con 16-24 GB de VRAM mediante llama.cpp u Ollama, manteniendo capacidad de tool calling.
- Prototipado de agentes de domótica experimentales: al estar etiquetado como experimental y con licencia Apache 2.0, sirve para investigación y pruebas de integración de LLM en ecosistemas de hogar conectado sin restricciones comerciales.
- Servidor de inferencia ligero en el hogar: con cuantizaciones IQ2 o Q3 (9-13 GB) puede ejecutarse en mini-PC o equipos con GPU modesta, aceptando cierta pérdida de calidad a cambio de menor huella de memoria.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada según cuantización (tamaño de fichero GGUF, más overhead de contexto):
  - IQ1_S / IQ1_M: 8,4-8,8 GB.
  - IQ2_XXS a Q2_K: 9,4-10,7 GB.
  - IQ3_XXS a Q3_K_L: 11,4-13,9 GB.
  - IQ4_XS / Q4_K_S / Q4_K_M: 14,0-16,9 GB.
  - Q5_K_S / Q5_K_M: 18,1-19,2 GB.
  - Q6_K: 22,7 GB.
- GPU recomendadas: para las cuantizaciones de mayor calidad, GPUs con 24 GB de VRAM (RTX 3090, RTX 4090) o superiores (A100, H100) si se busca throughput alto. Para cuantizaciones Q3-IQ4, GPUs de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080) pueden ser suficientes con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con Q4_K_M o Q5_K_M; en GPUs de 12-16 GB con IQ3_S o Q4_K_S; en equipos de 8-10 GB solo con cuantizaciones IQ1/IQ2 de baja calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con GGUF y endpoints OpenAI. El modelo base también puede ejecutarse con transformers si se dispone de los pesos safetensors originales.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| LunaraHome-26B-A4B (este) | ≈25,2 B | no disponible | de, en | Apache 2.0 | GGUF, safetensors (base) | Ajuste especializado en domótica y tool calling, experimental |
| Gemma 2 27B (referencia de familia) | 27 B | 8K (versión base) | multilingüe | Gemma license | safetensors, GGUF | Modelo generalista de Google; no especializado en domótica |
| Qwen2.5 32B Instruct | 32 B | 128K | multilingüe | Apache 2.0 | safetensors, GGUF | Generalista con buen tool calling; mayor contexto pero más pesado |
| Llama 3.1 8B Instruct | 8 B | 128K | multilingüe | Llama license | safetensors, GGUF | Mucho más pequeño; menor capacidad pero mucho más ligero |

La comparación con Gemma 2 27B es aproximada, ya que el modelo base se etiqueta como `gemma4` y no se dispone de especificaciones oficiales de esa familia en la información proporcionada. Los modelos generalistas citados no están especializados en Home Assistant ni Music Assistant, por lo que la ventaja de LunaraHome reside en el ajuste de dominio, no en capacidad bruta.

## Limitaciones y advertencias
- Modelo etiquetado explícitamente como experimental por su autor; no debe asumirse estabilidad en producción sin validación previa.
- Idiomas limitados a alemán e inglés; el rendimiento en castellano no está garantizado ni documentado.
- No se dispone de información sobre la longitud de contexto soportada, lo que dificulta planificar conversaciones largas o documentos extensos.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente crítico en tool calling: una llamada de servicio mal formada puede ejecutar acciones no deseadas en el hogar. Se recomienda validación y permisos restrictivos en Home Assistant.
- No hay datos publicados de benchmarks, por lo que no se puede evaluar objetivamente su calidad frente a alternativas.
- El repositorio acumula todas las cuantizaciones (300,9 GB); conviene descargar solo la variante necesaria.
- Aunque la licencia es Apache 2.0, el modelo base podría arrastrar condiciones adicionales de la familia Gemma; conviene revisar la licencia del modelo base Maxinger15/LunaraHome-26B-A4B antes de uso comercial.
- El soporte de visión no está detallado; los ficheros mmproj, si existen, están en el repositorio estático y no se especifica su alcance.
- Las cuantizaciones IQ1 e IQ2 degradan notablemente la calidad; el propio autor las describe como "for the desperate" o "mostly desperate".

## Enlaces
- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/LunaraHome-26B-A4B-i1-GGUF
- Modelo base: https://huggingface.co/Maxinger15/LunaraHome-26B-A4B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/LunaraHome-26B-A4B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#LunaraHome-26B-A4B-i1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
