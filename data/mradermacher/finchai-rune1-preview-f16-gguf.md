# mradermacher/FinchAI-Rune1-Preview-f16-GGUF

## Resumen

FinchAI-Rune1-Preview es un modelo de aproximadamente 1.006 millones de parámetros (1,01 mil millones) desarrollado por whcl412, orientado a tool calling, function calling y uso como agente, con capacidades multimodales y soporte de chino e inglés. Esta ficha describe la versión GGUF publicada por mradermacher, que no es el modelo original sino una cuantización estática del repositorio whcl412/FinchAI-Rune1-Preview-f16, con licencia Apache-2.0.

El modelo base declarado es MiniCPM-V 4.7-1B, según el repositorio GitHub del autor, y el paquete incluye ficheros mmproj para el componente visual. Su interés actual está en desplegar un agente multimodal pequeño en hardware local o edge, con llamadas a herramientas y conversación bilingüe, sin depender de APIs externas. No se dispone de datos publicados sobre longitud de contexto, composición del entrenamiento ni benchmarks reproducibles en la información consultada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base declarada MiniCPM-V 4.7-1B); variante exacta no disponible |
| Parametros totales | 1.006.209.856 (aprox. 1,01 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 y f16; para el componente multimodal, mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (.gguf); los ficheros mmproj se distribuyen por separado |
| Modelo base | whcl412/FinchAI-Rune1-Preview-f16 |
| Autor de la cuantizacion | mradermacher |
| Tamano del repositorio | 11,5 GB (todas las cuantizaciones y mmproj) |
| Descargas | 223 |
| Likes | 0 |
| Pipeline en HuggingFace | no disponible |

## Arquitectura y entrenamiento

El repositorio GitHub del autor indica que FinchAI-Rune1-Preview se construye sobre MiniCPM-V 4.7-1B y que el foco de entrenamiento es la capacidad de decisión para tool calling. El autor declara una validación de 27/27, pero no se detalla el conjunto de pruebas, la métrica ni el procedimiento, por lo que no debe interpretarse como un benchmark reproducible.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO, atención lineal, decodificación especulativa u otras innovaciones técnicas. La versión de mradermacher es una cuantización estática a GGUF del modelo original e incluye ficheros mmproj para el componente visual.

## Capacidades

- Generación de texto y conversación en chino e inglés.
- Tool calling y function calling, según las etiquetas del repositorio.
- Uso como agente y razonamiento multi-paso, según la etiqueta agent.
- Multimodal: entrada de imágenes mediante los ficheros mmproj; el repositorio incluye mmproj-Q8_0 y mmproj-f16.
- Compatibilidad con endpoints, según la etiqueta endpoints_compatible; no se detalla el protocolo.
- No se dispone de información sobre soporte de audio, vídeo, código o matemáticas.
- No se confirma la existencia de un modo thinking explícito.

## Casos de uso

- Asistente de escritorio con tool calling: al ser un modelo de aproximadamente 1 B en GGUF Q4 (0,8 GB), puede ejecutarse en local y decidir llamadas a funciones del sistema, como abrir aplicaciones, consultar APIs o gestionar ficheros, en un agente de escritorio con componentes de visión.
- Atención al cliente bilingüe chino-inglés: conversaciones multi-turno con derivación a herramientas de pedidos o CRM; el tamaño reducido permite desplegarlo en CPU o GPU de gama baja y mantener los datos en la infraestructura propia.
- Extracción de información de imágenes: con el proyector mmproj, el modelo puede recibir imágenes y responder preguntas sobre capturas, tickets o documentos; útil en pipelines de digitalización con requisitos de privacidad.
- Automatización RPA y agentes multi-paso: las etiquetas tool-calling y agent indican soporte para seleccionar herramientas; el autor declara una validación de 27/27 en decisión de tool calling, aunque no se detalla el conjunto de pruebas.
- Chatbot embebido en dispositivos edge: al ocupar menos de 1 GB en Q4, puede caber en placas con 4-8 GB de RAM y en mini-PC; adecuado para asistentes locales sin conexión.
- Asistente de documentación técnica zh/en: resumen y respuesta sobre manuales, con la ventana de contexto que permita el runtime; no hay dato publicado de contexto máximo, así que conviene validar la longitud real.
- Prototipado de agentes multimodales en investigación: permite probar flujos de visión y tool calling con licencia Apache-2.0 y cuantizaciones desde 0,6 GB, sin infraestructura de gran escala.
- Preprocesamiento de imágenes en pipelines de datos: descripción de imágenes y preguntas visuales simples para enriquecer datasets; requiere mmproj y validación de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio GitHub del autor menciona una validación de 27/27 centrada en la decisión de tool calling, pero no se detalla el conjunto de pruebas, la métrica ni la comparación con otros modelos, por lo que no se presenta como benchmark reproducible.

## Requisitos de hardware

- VRAM estimada (orientativa, a partir del tamaño de los ficheros; no medida por el autor): Q4_K_M, 0,8 GB de pesos; con runtime y KV cache, 1,5-3 GB. Q8_0, 1,2 GB de pesos; 2,5-4 GB. f16, 2,1 GB de pesos; 4-6 GB. Si se carga el mmproj, sumar 0,8-1,2 GB adicionales.
- GPU consumer: GTX 1650 4 GB, RTX 3050 6 GB, RTX 4060 8 GB, RTX 3060 12 GB o RTX 4090 24 GB; Q4 cabe en 4 GB, mientras que Q8 o f16 con mmproj requiere 6-8 GB.
- GPU de servidor: T4 16 GB, L4 24 GB o A10 24 GB; A100 y H100 no son necesarias para un modelo de aproximadamente 1 B.
- CPU: llama.cpp con AVX2 y 8 GB de RAM para Q4; 16 GB para f16; el rendimiento dependerá de la CPU y del contexto configurado.
- Despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y text-generation-webui; el tag endpoints_compatible sugiere compatibilidad con endpoints, pero no se detalla. vLLM y TGI no están orientados a GGUF y requerirían el modelo original o una conversión.
- Latencia y throughput: no disponible; no hay mediciones publicadas en la información consultada.

## Comparativa con modelos similares

La información disponible no incluye especificaciones verificadas de alternativas de la misma categoría. La comparación se limita al modelo original y a la base declarada.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/FinchAI-Rune1-Preview-f16-GGUF | 1.006.209.856 (aprox. 1,01 mil millones) | no disponible | no disponible | Apache-2.0 | HuggingFace; 223 descargas |
| whcl412/FinchAI-Rune1-Preview-f16 | 1.006.209.856 | no disponible | no disponible | Apache-2.0 | HuggingFace |
| MiniCPM-V 4.7-1B (base declarada) | ~1 B (no confirmado) | no disponible | no disponible | no disponible | no disponible |

No se han encontrado en la información proporcionada datos de benchmarks ni de contexto que permitan una comparación cuantitativa con Qwen, Llama u otras familias.

## Limitaciones y advertencias

- Modelo preview: la versión puede cambiar o desaparecer; no hay garantía de estabilidad a largo plazo.
- No se dispone de información sobre sesgos conocidos; como todo modelo generativo, puede producir contenido incorrecto o alucinaciones.
- Idiomas limitados a chino e inglés; no se confirma soporte de español.
- Longitud de contexto no disponible; no deben asumirse ventanas largas sin validación previa.
- Las cuantizaciones Q2_K y Q3_K pueden degradar la calidad; Q4_K_M o superior es preferible para producción.
- El tool calling puede fallar en cadenas largas o con herramientas mal descritas; conviene validar los flujos en el dominio concreto.
- La licencia Apache-2.0 cubre este GGUF, pero la licencia del modelo base y de los datos de entrenamiento no se detalla; revisar antes de un uso comercial.
- La visión requiere cargar el fichero mmproj; sin él, el modelo no procesa imágenes.
- No hay benchmarks públicos ni mediciones de latencia o throughput.
- No se dispone de información sobre filtros de seguridad, alineación o mitigaciones de sesgo.

## Enlaces

- [HuggingFace GGUF](https://huggingface.co/mradermacher/FinchAI-Rune1-Preview-f16-GGUF)
- [Modelo original](https://huggingface.co/whcl412/FinchAI-Rune1-Preview-f16)
- [Repositorio GitHub](https://github.com/hwc-cell/FinchAI-Rune1-Preview)
- [Cuantizaciones i1](https://huggingface.co/mradermacher/FinchAI-Rune1-Preview-f16-i1-GGUF)
- [Página de descargas](https://hf.tst.eu/model#FinchAI-Rune1-Preview-f16-GGUF)
- [Solicitudes de cuantización](https://huggingface.co/mradermacher/model_requests)
- [Fichero Q4_K_M](https://huggingface.co/mradermacher/FinchAI-Rune1-Preview-f16-GGUF/resolve/main/FinchAI-Rune1-Preview-f16.Q4_K_M.gguf)
- [Proyector multimodal mmproj-f16](https://huggingface.co/mradermacher/FinchAI-Rune1-Preview-f16-GGUF/resolve/main/FinchAI-Rune1-Preview-f16.mmproj-f16.gguf)
