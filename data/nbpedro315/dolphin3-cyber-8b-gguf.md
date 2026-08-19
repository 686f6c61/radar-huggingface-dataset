# nbpedro315/Dolphin3-Cyber-8B-GGUF

## Resumen

Dolphin3-Cyber-8B es un modelo de lenguaje especializado en ciberseguridad, desarrollado por RavichandranJ y publicado en Hugging Face bajo el identificador nbpedro315/Dolphin3-Cyber-8B-GGUF. Se trata de un fine-tuning con LoRA (r=16) sobre el modelo base huihui-ai/Dolphin3.0-Llama3.1-8B-abliterated, que a su vez deriva de Llama 3.1 8B y ha sido sometido a un proceso de "abliteration" para eliminar los rechazos de contenido en temas de seguridad ofensiva. El resultado es un asistente conversacional sin censura, orientado a tareas de pentesting, análisis de vulnerabilidades, desarrollo de exploits y defensa de sistemas.

El modelo cuenta con 8.030 millones de parámetros, una ventana de contexto de 131.072 tokens (128K) y se distribuye exclusivamente en formato GGUF con 11 niveles de cuantización, desde Q2_K (3,18 GB) hasta F16 (16,1 GB). Su diseño permite ejecutarlo en hardware de consumo, con requisitos de VRAM que parten de unos 4 GB para las cuantizaciones más ligeras. Está entrenado con un dataset propio de ciberseguridad que cubre OWASP Top 10, MITRE ATT&CK, CVEs y metodologías de pentesting, lo que lo diferencia de los modelos genéricos que suelen rechazar consultas sobre exploits o técnicas de ataque.

La relevancia actual de este modelo radica en su combinación de especialización de dominio, ausencia de restricciones de contenido y capacidad de ejecución local, lo que lo convierte en una herramienta práctica para profesionales de seguridad que necesitan confidencialidad y no dependen de servicios en la nube. No obstante, la ausencia de benchmarks publicados y la naturaleza "uncensored" exigen una evaluación cuidadosa antes de su uso en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.277.696 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_0, Q4_K_S, Q4_K_M, Q5_0, Q5_K_S, Q5_K_M, Q6_K, Q8_0, F16 |
| Idiomas soportados | ingles |
| Licencia | Llama 3.1 (licencia de Meta) |
| Formato de pesos | GGUF (llama.cpp y ecosistema compatible) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.1 de Meta, un transformer decoder-only con normalización RMSNorm, atención por ventanas y 8.000 millones de parámetros. La capa base es Dolphin3.0-Llama3.1-8B-abliterated, una versión de Llama 3.1 8B a la que se ha aplicado una tecnica de "abliteration" que elimina selectivamente las direcciones de activacion asociadas a comportamientos de rechazo o censura. Sobre esta base, RavichandranJ realizo un fine-tuning con adaptadores LoRA de rango 16, utilizando la libreria Unsloth para acelerar el entrenamiento (aproximadamente el doble de rapido que los metodos convencionales).

El dataset de entrenamiento es un conjunto propio de ciberseguridad que incluye material sobre OWASP Top 10, MITRE ATT&CK, bases de datos de CVEs, metodologias de pentesting, frameworks de seguridad ofensiva y defensiva, y tecnicas de desarrollo de exploits. No se han publicado detalles sobre el numero total de tokens de entrenamiento ni sobre la composicion exacta del dataset. Tampoco se menciona el uso de RLHF, DPO u otras tecnicas de alineacion posterior, lo que es coherente con el caracter "uncensored" del modelo. El resultado es un modelo conversacional que responde sin restricciones a consultas sobre seguridad informatica, manteniendo el formato de chat de Llama 3.1.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat Llama 3.1 para dialogos multi-turno.
- Especializacion en ciberseguridad: analisis de vulnerabilidades, interpretacion de CVEs, explicacion de tecnicas de ataque y defensa, y soporte en metodologias como OWASP y MITRE ATT&CK.
- Generacion de codigo de exploits y scripts de pentesting, sin rechazos por contenido ofensivo.
- Razonamiento sobre escenarios de seguridad, incluyendo analisis de logs, configuraciones y arquitecturas de red.
- Capacidad de ejecucion local con cuantizaciones ligeras (hasta 4 GB de VRAM), lo que permite uso en entornos aislados o con requisitos de confidencialidad.
- No se especifica soporte explicito para tool calling o function calling, aunque hereda las capacidades base de Llama 3.1; no obstante, no hay confirmacion en la documentacion del modelo.
- No se mencionan capacidades de vision, audio ni modo de razonamiento especial.

## Casos de uso

- Pentesting en entornos controlados: el modelo puede generar comandos, scripts y secuencias de ataque para pruebas de penetracion autorizadas, ayudando a los auditores a cubrir vectores de explotacion de forma sistematica.
- Preparacion de certificaciones CTF y bug bounty: al no censurar contenido ofensivo, permite practicar tecnicas de explotacion, resolver retos de captura de bandera y redactar informes de hallazgos.
- Analisis de vulnerabilidades en codigo fuente: puede revisar fragmentos de codigo y senalar posibles fallos de seguridad (inyeccion SQL, XSS, desbordamiento de buffer) con explicaciones detalladas.
- Automatizacion de informes de seguridad: a partir de resultados de escaneos o logs, el modelo redacta resumenes tecnicos y recomendaciones de mitigacion, ahorrando tiempo a los analistas.
- Entrenamiento y formacion interna: sirve como tutor para equipos de desarrollo que necesitan comprender riesgos de seguridad y practicar respuestas ante incidentes sin depender de servicios externos.
- Blue team y respuesta a incidentes: puede ayudar a interpretar indicadores de compromiso, sugerir pasos de contencion y documentar lecciones aprendidas en entornos aislados.
- Investigacion de exploits y analisis de malware: el modelo puede desglosar el funcionamiento de exploits conocidos, explicar su logica y proponer contramedidas, siempre dentro de un marco legal y etico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye ninguna metrica de evaluacion (el campo "results" esta vacio), y no se encontraron datos externos fiables sobre rendimiento en tareas como MMLU, HumanEval o GSM8K. Por tanto, no es posible comparar cuantitativamente este modelo con alternativas de su categoria.

## Requisitos de hardware

- Requisitos de RAM estimados segun cuantizacion (incluye modelo + KV cache para 2048 tokens, segun la model card):
  - Q2_K: ~5,5 GB
  - Q3_K_M: ~6,5 GB
  - Q4_0 / Q4_K_S: ~7,0 GB
  - Q4_K_M: ~7,5 GB
  - Q5_0 / Q5_K_S: ~8,0 GB
  - Q5_K_M: ~8,5 GB
  - Q6_K: ~9,0 GB
  - Q8_0: ~11,0 GB
  - F16: ~18,5 GB
- GPU recomendadas: cualquier tarjeta con al menos 4 GB de VRAM para las cuantizaciones Q2_K a Q4_K_M (por ejemplo, GTX 1650, RTX 3050). Para Q5 y superiores se recomiendan GPUs con 8 GB o mas (RTX 3060, RTX 4070, etc.). No se requieren GPUs de datacenter.
- El modelo cabe en GPUs de consumo, siendo la opcion Q4_K_M la mas equilibrada para la mayoria de usuarios.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan.ai, Open WebUI y llama-cpp-python. Todos son compatibles con el formato GGUF.
- Latencia y throughput: no se proporcionan datos especificos, pero al ser un modelo de 8B, en una GPU moderna se esperan velocidades de decodificacion de decenas de tokens por segundo en cuantizaciones 4-bit.

## Comparativa con modelos similares

No se dispone de datos comparativos fiables con otros modelos de ciberseguridad (por ejemplo, WhiteRabbitNeo o CyberSec) porque no se han publicado benchmarks ni evaluaciones independientes. Como referencia cualitativa, se puede comparar con su modelo base:

| Modelo | Parametros | Contexto | Especializacion | Censura | Formato |
|---|---|---|---|---|---|
| Dolphin3-Cyber-8B | 8B | 128K | Ciberseguridad | Sin censura (abliterated) | GGUF |
| Dolphin3.0-Llama3.1-8B-abliterated | 8B | 128K | General, sin censura | Sin censura | Safetensors / GGUF |
| Llama 3.1 8B Instruct | 8B | 128K | General | Con censura | Safetensors / GGUF |

La diferencia principal con el modelo base es el fine-tuning especifico en ciberseguridad, que mejora la precision y la profundidad de las respuestas en este dominio, aunque no hay metricas que lo cuantifiquen.

## Limitaciones y advertencias

- Idioma: el modelo solo soporta ingles. No esta entrenado para otros idiomas, lo que limita su uso en entornos hispanohablantes sin traduccion previa.
- Ausencia de benchmarks: no hay resultados publicados que validen su rendimiento real en tareas de ciberseguridad. La eficacia debe evaluarse de forma empirica antes de confiar en el para tareas criticas.
- Riesgo de alucinacion: al ser un modelo sin censura y con un dataset especifico, puede generar tecnicas de ataque incorrectas o peligrosas si se aplican sin verificacion. No debe usarse como unica fuente para decisiones de seguridad reales.
- Naturaleza "uncensored": el modelo no rechaza contenido ofensivo, lo que implica un riesgo de uso malintencionado. Es responsabilidad del usuario emplearlo solo en contextos legales y eticos (pentesting autorizado, educacion, investigacion).
- Contexto limitado en la practica: aunque la ventana es de 128K tokens, el rendimiento en contextos muy largos puede degradarse, y los requisitos de RAM aumentan considerablemente con el tamano del contexto.
- Licencia Llama 3.1: aunque permite uso comercial, esta sujeta a los terminos de la licencia de Meta, que incluyen restricciones sobre el uso para mejorar otros modelos de lenguaje y requisitos de atribucion.
- Sin soporte de tool calling confirmado: no se documenta la capacidad de usar herramientas externas, lo que puede limitar su integracion en agentes complejos.

## Enlaces

- Repositorio Hugging Face del modelo: https://huggingface.co/nbpedro315/Dolphin3-Cyber-8B-GGUF
- Repositorio original del autor (RavichandranJ): https://huggingface.co/RavichandranJ/Dolphin3-Cyber-8B-GGUF
- Adaptadores LoRA: https://huggingface.co/RavichandranJ/Dolphin3-Cyber-8B-LoRA
- Modelo base: https://huggingface.co/huihui-ai/Dolphin3.0-Llama3.1-8B-abliterated
- Libreria Unsloth: https://github.com/unslothai/unsloth
